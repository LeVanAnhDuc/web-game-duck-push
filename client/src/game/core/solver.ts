import { computeDeadSquares, isDeadlocked } from "./deadlock";
import { findPath, isGoal, isSolved, isWall, neighbor, step } from "./rules";
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

function heuristic(boxes: readonly CellIndex[], goalDistance: ArrayLike<number>): number {
  let sum = 0;
  for (const box of boxes) sum += goalDistance[box] ?? 0;
  return sum;
}

/**
 * Bảng tra của một bàn cờ, tính một lần rồi dùng lại cho mọi lượt tìm trên bàn đó.
 *
 * Vòng trong của solver chạy hàng triệu lần, và `neighbor()` của luật chơi làm một
 * phép chia và một phép chia lấy dư mỗi lần gọi. Đổi sang tra bảng là chỗ rẻ tiền
 * nhất để lấy lại tốc độ, mà luật chơi vẫn là nguồn đúng duy nhất — bảng này chỉ
 * là ảnh chụp của nó.
 */
interface BoardIndex {
  readonly cellCount: number;
  /** `neighbors[(cell << 2) + d]` — ô kề theo hướng `DIRECTIONS[d]`, `-1` nếu ra ngoài. */
  readonly neighbors: Int32Array;
  readonly wall: Uint8Array;
  readonly goal: Uint8Array;
  readonly goalDistance: Int32Array;
}

const boardIndexes = new WeakMap<Board, BoardIndex>();

function indexBoard(board: Board): BoardIndex {
  const cached = boardIndexes.get(board);
  if (cached) return cached;

  const cellCount = board.cells.length;
  const neighbors = new Int32Array(cellCount * 4).fill(-1);
  const wall = new Uint8Array(cellCount);
  const goal = new Uint8Array(cellCount);

  for (let cell = 0; cell < cellCount; cell += 1) {
    if (isWall(board, cell)) wall[cell] = 1;
    if (isGoal(board, cell)) goal[cell] = 1;
    for (let d = 0; d < DIRECTIONS.length; d += 1) {
      const next = neighbor(board, cell, DIRECTIONS[d]!);
      neighbors[(cell << 2) + d] = next === null ? -1 : next;
    }
  }

  const distances = buildGoalDistance(board);
  const goalDistance = Int32Array.from(distances);

  const index: BoardIndex = { cellCount, neighbors, wall, goal, goalDistance };
  boardIndexes.set(board, index);
  return index;
}

/**
 * Quét vùng người chơi đi lại được, **không cấp phát gì**.
 *
 * Bản cũ gọi `reachableCells` một lần cho mỗi nút *và* một lần cho mỗi nút con, mỗi
 * lần dựng một `Set` mới — với hàng trăm nghìn nút thì phần lớn thời gian solver
 * nằm ở bộ dọn rác. Ở đây mảng `visited` được dùng lại và phân biệt các lượt quét
 * bằng số hiệu tăng dần, nên không có object nào ra đời trong vòng trong.
 */
class RegionScanner {
  private readonly visited: Int32Array;
  private readonly queue: Int32Array;
  private stamp = 0;

  constructor(cellCount: number) {
    this.visited = new Int32Array(cellCount);
    this.queue = new Int32Array(cellCount);
  }

  /** Quét từ `start`, trả về ô nhỏ nhất của vùng — dạng chuẩn hoá của vị trí người chơi. */
  scan(index: BoardIndex, occupied: Uint8Array, start: CellIndex): CellIndex {
    this.stamp += 1;
    const { visited, queue, stamp } = this;
    const { neighbors, wall } = index;

    visited[start] = stamp;
    queue[0] = start;
    let head = 0;
    let tail = 1;
    let min = start;

    while (head < tail) {
      const cell = queue[head]!;
      head += 1;
      const base = cell << 2;
      for (let d = 0; d < 4; d += 1) {
        const next = neighbors[base + d]!;
        if (next < 0 || visited[next] === stamp) continue;
        if (wall[next] === 1 || occupied[next] === 1) continue;
        visited[next] = stamp;
        queue[tail] = next;
        tail += 1;
        if (next < min) min = next;
      }
    }
    return min;
  }

  /** Ô này có nằm trong vùng vừa quét không. */
  contains(cell: CellIndex): boolean {
    return this.visited[cell] === this.stamp;
  }
}

/**
 * Khoá trạng thái.
 *
 * Mỗi ô là một mã ký tự, nên bàn 12×12 gói gọn trong 6-7 ký tự. Nối chuỗi bằng
 * `join(",")` tạo ra khoá dài gấp ba và tốn một mảng trung gian mỗi lần gọi.
 */
function makeKey(boxes: readonly CellIndex[], player: CellIndex): string {
  let key = String.fromCharCode(player);
  for (let i = 0; i < boxes.length; i += 1) key += String.fromCharCode(boxes[i]!);
  return key;
}

/** Thay một thùng mà vẫn giữ mảng sắp tăng dần — bất biến của `LevelState.boxes`. */
function replaceBoxSorted(
  boxes: readonly CellIndex[],
  from: CellIndex,
  to: CellIndex
): CellIndex[] {
  const size = boxes.length;
  const next = new Array<CellIndex>(size);
  let write = 0;
  let inserted = false;

  for (let i = 0; i < size; i += 1) {
    const box = boxes[i]!;
    if (box === from) continue;
    if (!inserted && to < box) {
      next[write] = to;
      write += 1;
      inserted = true;
    }
    next[write] = box;
    write += 1;
  }
  if (!inserted) next[write] = to;
  return next;
}

function allBoxesOnGoal(index: BoardIndex, boxes: readonly CellIndex[]): boolean {
  for (let i = 0; i < boxes.length; i += 1) if (index.goal[boxes[i]!] !== 1) return false;
  return true;
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

  const index = indexBoard(board);
  const goalDistance = index.goalDistance;
  const dead = new Uint8Array(index.cellCount);
  for (const cell of deadSquares) dead[cell] = 1;

  // Ô nào đang có thùng. Được sửa tại chỗ trong vòng trong rồi trả về nguyên trạng.
  const occupied = new Uint8Array(index.cellCount);
  // Hai bộ quét tách biệt: nút con quét đè lên dấu của nút cha thì mất luôn phép
  // thử "người chơi có tới được ô đứng đẩy không" cho các hướng còn lại.
  const nodeScanner = new RegionScanner(index.cellCount);
  const childScanner = new RegionScanner(index.cellCount);

  const startBoxes = state.boxes.slice().sort((a, b) => a - b);
  for (const box of startBoxes) occupied[box] = 1;
  const startPlayer = nodeScanner.scan(index, occupied, state.player);
  for (const box of startBoxes) occupied[box] = 0;
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

    if (allBoxesOnGoal(index, node.boxes)) {
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

    for (const box of node.boxes) occupied[box] = 1;
    nodeScanner.scan(index, occupied, node.player);

    for (const box of node.boxes) {
      const base = box << 2;
      for (let d = 0; d < 4; d += 1) {
        const destination = index.neighbors[base + d]!;
        if (destination < 0 || index.wall[destination] === 1) continue;
        if (occupied[destination] === 1 || dead[destination] === 1) continue;

        // `d ^ 1` là hướng ngược lại: DIRECTIONS xếp thành cặp up/down, left/right.
        const standOn = index.neighbors[base + (d ^ 1)]!;
        if (standOn < 0 || index.wall[standOn] === 1 || occupied[standOn] === 1) continue;
        if (!nodeScanner.contains(standOn)) continue;

        const nextBoxes = replaceBoxSorted(node.boxes, box, destination);
        // Sau cú đẩy người chơi đứng đúng ô thùng vừa rời đi.
        const nextState: LevelState = { board, player: box, boxes: nextBoxes };
        if (isDeadlocked(nextState, deadSquares)) continue;

        occupied[box] = 0;
        occupied[destination] = 1;
        const nextPlayer = childScanner.scan(index, occupied, box);
        occupied[box] = 1;
        occupied[destination] = 0;

        const nextKey = makeKey(nextBoxes, nextPlayer);
        const g = node.g + 1;
        const known = gScore.get(nextKey);
        if (known !== undefined && known <= g) continue;

        gScore.set(nextKey, g);
        cameFrom.set(nextKey, { parent: node.key, box, direction: DIRECTIONS[d]! });
        open.push({
          key: nextKey,
          boxes: nextBoxes,
          player: nextPlayer,
          g,
          f: g + heuristic(nextBoxes, goalDistance)
        });
      }
    }

    for (const box of node.boxes) occupied[box] = 0;
  }

  // Hàng đợi cạn mà chưa chạm trần nào ⇒ đã duyệt hết không gian, kết luận chắc chắn.
  return { status: "unsolvable", nodes };
}
