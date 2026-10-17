import type { Board, CellIndex, Direction, LevelState, MoveResult } from "./types";

/**
 * Luật Sokoban. Mọi thứ khác trong game — solver, generator, UI — đi qua đúng
 * hàm `step` này, nên không có chỗ nào cài lại luật một kiểu khác.
 *
 * `step` **không sửa** trạng thái đầu vào. Trả về trạng thái mới, hoặc `null` khi
 * nước đi không hợp lệ.
 */

/** Ô kề theo hướng, hoặc `null` nếu ra ngoài bàn. */
export function neighbor(board: Board, index: CellIndex, direction: Direction): CellIndex | null {
  const x = index % board.width;
  const y = Math.floor(index / board.width);

  switch (direction) {
    case "up":
      return y === 0 ? null : index - board.width;
    case "down":
      return y === board.height - 1 ? null : index + board.width;
    case "left":
      return x === 0 ? null : index - 1;
    case "right":
      return x === board.width - 1 ? null : index + 1;
    default:
      return null;
  }
}

export function isWall(board: Board, index: CellIndex): boolean {
  return board.cells[index] === "wall";
}

export function isGoal(board: Board, index: CellIndex): boolean {
  return board.cells[index] === "goal";
}

/** Chèn vào mảng đã sắp, giữ nguyên tính sắp — bất biến của `LevelState.boxes`. */
function replaceBoxSorted(
  boxes: readonly CellIndex[],
  from: CellIndex,
  to: CellIndex
): CellIndex[] {
  const next = boxes.filter((b) => b !== from);
  let i = 0;
  while (i < next.length && next[i]! < to) i += 1;
  next.splice(i, 0, to);
  return next;
}

export function step(state: LevelState, direction: Direction): MoveResult | null {
  const { board, player, boxes } = state;

  const target = neighbor(board, player, direction);
  if (target === null || isWall(board, target)) return null;

  const boxAtTarget = boxes.includes(target);
  if (!boxAtTarget) {
    return { state: { board, player: target, boxes }, pushed: false };
  }

  const beyond = neighbor(board, target, direction);
  // Không đẩy được vào tường, ra ngoài bàn, hay vào một thùng khác.
  if (beyond === null || isWall(board, beyond) || boxes.includes(beyond)) return null;

  return {
    state: { board, player: target, boxes: replaceBoxSorted(boxes, target, beyond) },
    pushed: true
  };
}

export function isSolved(state: LevelState): boolean {
  return state.boxes.every((box) => isGoal(state.board, box));
}

/**
 * Các ô người chơi tới được mà không đẩy thùng nào.
 *
 * Solver dùng nó để chuẩn hoá trạng thái, UI dùng nó để tô vùng đi được.
 */
export function reachableCells(state: LevelState): Set<CellIndex> {
  const { board, player, boxes } = state;
  const blocked = new Set(boxes);
  const seen = new Set<CellIndex>([player]);
  const queue: CellIndex[] = [player];

  while (queue.length > 0) {
    const current = queue.pop()!;
    for (const direction of ["up", "down", "left", "right"] as const) {
      const next = neighbor(board, current, direction);
      if (next === null || seen.has(next) || blocked.has(next) || isWall(board, next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return seen;
}

/**
 * Đường đi ngắn nhất giữa hai ô, tránh thùng. `null` nếu không tới được.
 * Solver cần nó để đổi lời giải theo lượt đẩy thành dãy nước đi thật.
 */
export function findPath(
  state: LevelState,
  from: CellIndex,
  to: CellIndex
): Direction[] | null {
  if (from === to) return [];
  const { board, boxes } = state;
  const blocked = new Set(boxes);
  const cameFrom = new Map<CellIndex, { prev: CellIndex; direction: Direction }>();
  const queue: CellIndex[] = [from];
  const seen = new Set<CellIndex>([from]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const direction of ["up", "down", "left", "right"] as const) {
      const next = neighbor(board, current, direction);
      if (next === null || seen.has(next) || blocked.has(next) || isWall(board, next)) continue;
      seen.add(next);
      cameFrom.set(next, { prev: current, direction });
      if (next === to) {
        const path: Direction[] = [];
        let node = to;
        while (node !== from) {
          const edge = cameFrom.get(node)!;
          path.push(edge.direction);
          node = edge.prev;
        }
        return path.reverse();
      }
      queue.push(next);
    }
  }
  return null;
}
