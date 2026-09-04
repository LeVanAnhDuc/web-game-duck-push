import { computeDeadSquares, isDeadlocked } from "./deadlock";
import { findPath, isGoal, isSolved, isWall, neighbor, reachableCells, step } from "./rules";
import {
  DIRECTIONS,
  type Board,
  type CellIndex,
  type Direction,
  type LevelState,
  type SolveResult,
  type SolverBudget
} from "./types";

/**
 * Solver A* **theo lượt đẩy**, không theo nước đi.
 *
 * Người chơi đi lại loanh quanh không đổi thế cờ; chỉ lúc đẩy thùng mới có gì
 * thay đổi. Nên một nút ở đây là *một lần đẩy*, và mọi vị trí người chơi trong
 * cùng một vùng đi lại được gộp thành một trạng thái duy nhất. Nếu tìm theo nước
 * đi, số nút phình lên gấp hàng chục lần mà lời giải vẫn thế.
 *
 * Hệ quả: `pushes` trả về là **tối ưu thật** (heuristic chấp nhận được), còn
 * `moves` chỉ là số bước của một lời giải ít đẩy nhất — không hứa hẹn ít bước nhất.
 */

const OPPOSITE: Readonly<Record<Direction, Direction>> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

interface SearchNode {
  readonly key: string;
  readonly boxes: readonly CellIndex[];
  /** Đại diện của vùng người chơi — luôn là ô nhỏ nhất trong vùng. */
  readonly player: CellIndex;
  readonly g: number;
  readonly f: number;
}

/** Ưu tiên f nhỏ; hoà thì lấy nút sâu hơn để chạm đích sớm, không ảnh hưởng tối ưu. */
function isBetter(a: SearchNode, b: SearchNode): boolean {
  return a.f !== b.f ? a.f < b.f : a.g > b.g;
}

/**
 * Đống nhị phân tối thiểu viết tay.
 *
 * Solver chạy hàng nghìn lần trong lúc sinh màn, nên hàng đợi ưu tiên phải là
 * O(log n) chứ không phải "sắp lại mảng mỗi vòng"; và lõi game không được kéo
 * thêm dependency nào.
 */
class MinHeap {
  private readonly items: SearchNode[] = [];

  get size(): number {
    return this.items.length;
  }

  push(node: SearchNode): void {
    const { items } = this;
    items.push(node);
    let index = items.length - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      const parentNode = items[parent];
      const currentNode = items[index];
      if (parentNode === undefined || currentNode === undefined) break;
      if (!isBetter(currentNode, parentNode)) break;
      items[parent] = currentNode;
      items[index] = parentNode;
      index = parent;
    }
  }

  pop(): SearchNode | undefined {
    const { items } = this;
    const top = items[0];
    if (top === undefined) return undefined;

    const last = items.pop();
    if (last === undefined || items.length === 0) return top;
    items[0] = last;

    let index = 0;
    for (;;) {
      const left = 2 * index + 1;
      const leftNode = items[left];
      if (leftNode === undefined) break;

      let bestIndex = left;
      let bestNode: SearchNode = leftNode;
      const rightNode = items[left + 1];
      if (rightNode !== undefined && isBetter(rightNode, bestNode)) {
        bestIndex = left + 1;
        bestNode = rightNode;
      }

      const currentNode = items[index];
      if (currentNode === undefined || !isBetter(bestNode, currentNode)) break;
      items[index] = bestNode;
      items[bestIndex] = currentNode;
      index = bestIndex;
    }
    return top;
  }
}

/**
 * Khoảng cách Manhattan tới đích gần nhất, tra sẵn cho từng ô.
 *
 * Bảng này là toàn bộ heuristic. Không dùng BFS có tường vì Manhattan rẻ hơn nhiều
 * và vẫn chấp nhận được — mỗi lượt đẩy dịch một thùng đúng một ô nên không bao giờ
 * ước lượng vượt chi phí thật.
 */
function buildGoalDistance(board: Board): number[] {
  const table = new Array<number>(board.cells.length).fill(0);
  for (let index = 0; index < board.cells.length; index += 1) {
    const x = index % board.width;
    const y = Math.floor(index / board.width);
    let best = Number.POSITIVE_INFINITY;
    for (const goal of board.goals) {
      const gx = goal % board.width;
      const gy = Math.floor(goal / board.width);
      const distance = Math.abs(x - gx) + Math.abs(y - gy);
      if (distance < best) best = distance;
    }
    table[index] = best === Number.POSITIVE_INFINITY ? 0 : best;
  }
  return table;
}

function heuristic(boxes: readonly CellIndex[], goalDistance: readonly number[]): number {
  let sum = 0;
  for (const box of boxes) sum += goalDistance[box] ?? 0;
  return sum;
}

/** Ô nhỏ nhất của vùng — dạng chuẩn hoá của "người chơi đang đứng đâu đó trong vùng này". */
function regionRepresentative(region: ReadonlySet<CellIndex>): CellIndex {
  let min = Number.POSITIVE_INFINITY;
  for (const cell of region) if (cell < min) min = cell;
  return min;
}

/** Khoá ngắn nhất có thể: chuỗi băm nhanh hơn mọi thứ tự sánh mảng trong `Map`. */
function makeKey(boxes: readonly CellIndex[], player: CellIndex): string {
  return `${boxes.join(",")}|${player}`;
}

/** Thay một thùng mà vẫn giữ mảng sắp tăng dần — bất biến của `LevelState.boxes`. */
function replaceBoxSorted(
  boxes: readonly CellIndex[],
  from: CellIndex,
  to: CellIndex
): CellIndex[] {
  const next = boxes.filter((box) => box !== from);
  let i = 0;
  while (i < next.length && (next[i] ?? 0) < to) i += 1;
  next.splice(i, 0, to);
  return next;
}

function allBoxesOnGoal(board: Board, boxes: readonly CellIndex[]): boolean {
  return boxes.every((box) => isGoal(board, box));
}

interface PushEdge {
  readonly parent: string;
  readonly box: CellIndex;
  readonly direction: Direction;
}

/**
 * Đổi chuỗi lượt đẩy thành dãy nước đi thật.
 *
 * Giữa hai lượt đẩy, người chơi phải tự đi tới ô đứng đẩy; `findPath` lo đoạn đó.
 * Mọi bước đều chạy qua `step` để nếu chuỗi đẩy có sai sót thì lộ ra ngay tại đây
 * chứ không đẻ ra một lời giải không chạy được.
 */
function replayPushes(initial: LevelState, pushes: readonly PushEdge[]): Direction[] | null {
  const { board } = initial;
  let current = initial;
  const moves: Direction[] = [];

  for (const push of pushes) {
    const standOn = neighbor(board, push.box, OPPOSITE[push.direction]);
    if (standOn === null) return null;

    const path = findPath(current, current.player, standOn);
    if (path === null) return null;
    for (const direction of path) {
      const result = step(current, direction);
      if (result === null) return null;
      current = result.state;
      moves.push(direction);
    }

    const pushed = step(current, push.direction);
    if (pushed === null || !pushed.pushed) return null;
    current = pushed.state;
    moves.push(push.direction);
  }

  return isSolved(current) ? moves : null;
}

/** Phát lại một lời giải bằng chính `step` của luật chơi. Test dùng nó để tự soi mình. */
export function solutionIsValid(state: LevelState, solution: readonly Direction[]): boolean {
  let current = state;
  for (const direction of solution) {
    const result = step(current, direction);
    if (result === null) return false;
    current = result.state;
  }
  return isSolved(current);
}

export function solve(state: LevelState, budget: SolverBudget): SolveResult {
  const startedAt = Date.now();
  const { board } = state;

  if (isSolved(state)) {
    return { status: "solved", pushes: 0, moves: 0, nodes: 0, solution: [] };
  }

  // Tính một lần cho cả lượt tìm: ô chết chỉ phụ thuộc bàn cờ tĩnh.
  const deadSquares = computeDeadSquares(board);
  if (isDeadlocked(state, deadSquares)) return { status: "unsolvable", nodes: 0 };

  const goalDistance = buildGoalDistance(board);
  const startBoxes = state.boxes.slice().sort((a, b) => a - b);
  const startPlayer = regionRepresentative(reachableCells(state));
  const startKey = makeKey(startBoxes, startPlayer);

  const gScore = new Map<string, number>([[startKey, 0]]);
  const cameFrom = new Map<string, PushEdge>();
  const open = new MinHeap();
  open.push({
    key: startKey,
    boxes: startBoxes,
    player: startPlayer,
    g: 0,
    f: heuristic(startBoxes, goalDistance)
  });

  let nodes = 0;

  while (open.size > 0) {
    const node = open.pop();
    if (node === undefined) break;

    // Bản cũ của một trạng thái đã tìm được đường rẻ hơn — bỏ qua.
    const best = gScore.get(node.key);
    if (best !== undefined && node.g > best) continue;

    if (allBoxesOnGoal(board, node.boxes)) {
      const chain: PushEdge[] = [];
      let key = node.key;
      for (;;) {
        const edge = cameFrom.get(key);
        if (edge === undefined) break;
        chain.push(edge);
        key = edge.parent;
      }
      chain.reverse();

      const solution = replayPushes(state, chain);
      // Không dựng lại được nghĩa là solver có lỗi, không phải màn vô nghiệm —
      // trả `timeout` để tuyệt đối không nói dối rằng màn này không giải được.
      if (solution === null) return { status: "timeout", nodes };
      return {
        status: "solved",
        pushes: chain.length,
        moves: solution.length,
        nodes,
        solution
      };
    }

    nodes += 1;
    if (nodes > budget.maxNodes) return { status: "timeout", nodes };
    // Xem đồng hồ mỗi ~1000 nút: `Date.now()` mỗi nút tự nó đã là một phần chi phí.
    if (nodes % 1000 === 0 && Date.now() - startedAt > budget.maxMillis) {
      return { status: "timeout", nodes };
    }

    const boxSet = new Set(node.boxes);
    const reachable = reachableCells({ board, player: node.player, boxes: node.boxes });

    for (const box of node.boxes) {
      for (const direction of DIRECTIONS) {
        const destination = neighbor(board, box, direction);
        if (destination === null || isWall(board, destination)) continue;
        if (boxSet.has(destination) || deadSquares.has(destination)) continue;

        const standOn = neighbor(board, box, OPPOSITE[direction]);
        if (standOn === null || isWall(board, standOn) || boxSet.has(standOn)) continue;
        if (!reachable.has(standOn)) continue;

        const nextBoxes = replaceBoxSorted(node.boxes, box, destination);
        // Sau cú đẩy người chơi đứng đúng ô thùng vừa rời đi.
        const nextState: LevelState = { board, player: box, boxes: nextBoxes };
        if (isDeadlocked(nextState, deadSquares)) continue;

        const nextPlayer = regionRepresentative(reachableCells(nextState));
        const nextKey = makeKey(nextBoxes, nextPlayer);
        const g = node.g + 1;
        const known = gScore.get(nextKey);
        if (known !== undefined && known <= g) continue;

        gScore.set(nextKey, g);
        cameFrom.set(nextKey, { parent: node.key, box, direction });
        open.push({
          key: nextKey,
          boxes: nextBoxes,
          player: nextPlayer,
          g,
          f: g + heuristic(nextBoxes, goalDistance)
        });
      }
    }
  }

  // Hàng đợi cạn mà chưa chạm trần nào ⇒ đã duyệt hết không gian, kết luận chắc chắn.
  return { status: "unsolvable", nodes };
}
