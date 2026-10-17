// A small, independent Sokoban model for the tests: parse a level's XSB rows, step, and search.
//
// It is deliberately NOT the game's own code (../client/src/game/core): a test that asks the game's solver for the
// answer and then checks the game agrees with it proves nothing. This model is written from the rules in the README
// ("walk into a crate to push it; a crate cannot be pushed into a wall or into another crate") and is only meant for
// the small easy levels the suite plays, so it searches plainly (0-1 BFS) and stops at a state budget.

export type Direction = "up" | "down" | "left" | "right";

export const DIRECTIONS: readonly Direction[] = ["up", "down", "left", "right"];

export interface Level {
  readonly width: number;
  readonly height: number;
  readonly walls: ReadonlySet<number>;
  readonly goals: ReadonlySet<number>;
}

export interface State {
  readonly player: number;
  /** Always sorted ascending, so two equal positions have the same key. */
  readonly boxes: readonly number[];
}

export interface Parsed {
  readonly level: Level;
  readonly start: State;
}

/** "Bàn cờ W trên H" — cells are counted from 1 in the board's aria-label, from 0 here. */
export interface Cell {
  readonly column: number;
  readonly row: number;
}

export function parseXsb(rows: readonly string[]): Parsed {
  const width = Math.max(...rows.map((row) => row.length));
  const height = rows.length;
  const walls = new Set<number>();
  const goals = new Set<number>();
  const boxes: number[] = [];
  let player = -1;
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x += 1) {
      const ch = row[x] ?? " ";
      const i = y * width + x;
      if (ch === "#") walls.add(i);
      if (ch === "." || ch === "*" || ch === "+") goals.add(i);
      if (ch === "$" || ch === "*") boxes.push(i);
      if (ch === "@" || ch === "+") player = i;
    }
  });
  if (player < 0) throw new Error("level has no player");
  return { level: { width, height, walls, goals }, start: { player, boxes: boxes.sort((a, b) => a - b) } };
}

export function cellOf(level: Level, index: number): Cell {
  return { column: index % level.width, row: Math.floor(index / level.width) };
}

/** The square as the board's aria-label names it: column and row counted from 1. */
export function squareOf(level: Level, index: number): Cell {
  return { column: (index % level.width) + 1, row: Math.floor(index / level.width) + 1 };
}

/** A press that is refused because the crate in front would hit a wall (`"wall"`) or another crate (`"crate"`). */
export function blockedPush(level: Level, start: State, by: "wall" | "crate"): Direction[] | null {
  return findSequence(level, start, (before, direction, after) => {
    if (after.moved) return false;
    const next = before.player + offset(level, direction);
    const beyond = next + offset(level, direction);
    if (!before.boxes.includes(next)) return false;
    return by === "wall" ? level.walls.has(beyond) : before.boxes.includes(beyond);
  });
}

function offset(level: Level, direction: Direction): number {
  switch (direction) {
    case "up":
      return -level.width;
    case "down":
      return level.width;
    case "left":
      return -1;
    case "right":
      return 1;
  }
}

export interface StepResult {
  readonly state: State;
  readonly moved: boolean;
  readonly pushed: boolean;
}

/** One key press. A blocked move returns the same state with moved=false. */
export function step(level: Level, state: State, direction: Direction): StepResult {
  const d = offset(level, direction);
  const next = state.player + d;
  if (level.walls.has(next)) return { state, moved: false, pushed: false };
  const boxAt = state.boxes.indexOf(next);
  if (boxAt < 0) return { state: { player: next, boxes: state.boxes }, moved: true, pushed: false };
  const beyond = next + d;
  if (level.walls.has(beyond) || state.boxes.includes(beyond)) return { state, moved: false, pushed: false };
  const boxes = state.boxes.map((b) => (b === next ? beyond : b)).sort((a, b) => a - b);
  return { state: { player: next, boxes }, moved: true, pushed: true };
}

export function play(level: Level, state: State, moves: readonly Direction[]): { state: State; moves: number; pushes: number } {
  let current = state;
  let count = 0;
  let pushes = 0;
  for (const direction of moves) {
    const result = step(level, current, direction);
    if (result.moved) count += 1;
    if (result.pushed) pushes += 1;
    current = result.state;
  }
  return { state: current, moves: count, pushes };
}

export function isSolved(level: Level, state: State): boolean {
  return state.boxes.every((b) => level.goals.has(b));
}

/** A box on a non-goal square with a wall on two orthogonal sides can never move again. */
export function isCornerDead(level: Level, box: number): boolean {
  if (level.goals.has(box)) return false;
  const wall = (d: Direction) => level.walls.has(box + offset(level, d));
  return (wall("up") || wall("down")) && (wall("left") || wall("right"));
}

const key = (state: State) => `${state.player}|${state.boxes.join(",")}`;

interface Node {
  readonly state: State;
  readonly parent: Node | null;
  readonly via: Direction | null;
  readonly pushes: number;
}

function path(node: Node): Direction[] {
  const moves: Direction[] = [];
  for (let n: Node | null = node; n?.via; n = n.parent) moves.push(n.via);
  return moves.reverse();
}

/**
 * Fewest pushes to solve, by 0-1 BFS over (player, boxes): a walk costs 0, a push costs 1.
 * Returns null when the level is unsolvable from `start` or the budget runs out.
 */
export function solve(level: Level, start: State, budget = 2_000_000): { moves: Direction[]; pushes: number } | null {
  const seen = new Map<string, number>();
  const deque: Node[] = [{ state: start, parent: null, via: null, pushes: 0 }];
  let head = 0;
  // A plain array used as a deque: 0-cost children go to the front via a second buffer.
  const front: Node[] = [];
  seen.set(key(start), 0);
  let expanded = 0;
  while (front.length > 0 || head < deque.length) {
    const node = front.length > 0 ? front.pop()! : deque[head++]!;
    if (node.pushes > (seen.get(key(node.state)) ?? Infinity)) continue;
    if (isSolved(level, node.state)) return { moves: path(node), pushes: node.pushes };
    if (++expanded > budget) return null;
    for (const direction of DIRECTIONS) {
      const result = step(level, node.state, direction);
      if (!result.moved) continue;
      if (result.pushed && result.state.boxes.some((b) => isCornerDead(level, b))) continue;
      const pushes = node.pushes + (result.pushed ? 1 : 0);
      const k = key(result.state);
      if ((seen.get(k) ?? Infinity) <= pushes) continue;
      seen.set(k, pushes);
      const child: Node = { state: result.state, parent: node, via: direction, pushes };
      if (result.pushed) deque.push(child);
      else front.push(child);
    }
  }
  return null;
}

/**
 * Breadth-first over key presses (no pushing restriction) until `goal` holds for the state and the press that led to it.
 * Used to find a position worth testing: a box about to hit a wall, a crate in front of a crate, a dead corner.
 */
export function findSequence(
  level: Level,
  start: State,
  goal: (before: State, direction: Direction, after: StepResult) => boolean,
  budget = 200_000,
): Direction[] | null {
  const seen = new Set<string>([key(start)]);
  const queue: Node[] = [{ state: start, parent: null, via: null, pushes: 0 }];
  for (let head = 0; head < queue.length && head < budget; head += 1) {
    const node = queue[head]!;
    for (const direction of DIRECTIONS) {
      const result = step(level, node.state, direction);
      if (goal(node.state, direction, result)) return [...path(node), direction];
      if (!result.moved) continue;
      const k = key(result.state);
      if (seen.has(k)) continue;
      seen.add(k);
      queue.push({ state: result.state, parent: node, via: direction, pushes: 0 });
    }
  }
  return null;
}

/**
 * A complete solution that pushes MORE than the optimum: walk (without pushing) to some first push that is not on an
 * optimal path, make it, then finish as well as possible from there. Returns null if every first push is optimal or
 * a dead end.
 */
export function suboptimalSolution(level: Level, start: State): { moves: Direction[]; pushes: number } | null {
  const best = solve(level, start);
  if (!best) return null;
  // Every square the player reaches without pushing, with the walk that reaches it.
  const seen = new Set<number>([start.player]);
  const queue: Node[] = [{ state: start, parent: null, via: null, pushes: 0 }];
  for (let head = 0; head < queue.length; head += 1) {
    const node = queue[head]!;
    for (const direction of DIRECTIONS) {
      const result = step(level, node.state, direction);
      if (!result.moved) continue;
      if (result.pushed) {
        if (result.state.boxes.some((b) => isCornerDead(level, b))) continue;
        const rest = solve(level, result.state);
        if (rest && rest.pushes + 1 > best.pushes) {
          return { moves: [...path(node), direction, ...rest.moves], pushes: rest.pushes + 1 };
        }
        continue;
      }
      if (seen.has(result.state.player)) continue;
      seen.add(result.state.player);
      queue.push({ state: result.state, parent: node, via: direction, pushes: 0 });
    }
  }
  return null;
}
