import type { Board, CellIndex, Level, LevelState, PackLevel, StaticCell } from "./types";

/**
 * Đọc và ghi định dạng XSB — định dạng văn bản chuẩn của Sokoban.
 *
 *   `#` tường · ` ` sàn · `.` đích · `$` thùng · `*` thùng trên đích
 *   `@` người chơi · `+` người chơi đứng trên đích
 *
 * Dùng XSB thay vì một cấu trúc JSON riêng vì pack màn commit vào repo phải đọc
 * được bằng mắt trong diff. Một màn sai nhìn ra ngay; một mảng số thì không.
 */

export class LevelParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LevelParseError";
  }
}

const WALL = "#";
const FLOOR = " ";
const GOAL = ".";
const BOX = "$";
const BOX_ON_GOAL = "*";
const PLAYER = "@";
const PLAYER_ON_GOAL = "+";

const VALID = new Set([WALL, FLOOR, GOAL, BOX, BOX_ON_GOAL, PLAYER, PLAYER_ON_GOAL]);

export function parseXsb(lines: readonly string[]): LevelState {
  if (lines.length === 0) throw new LevelParseError("Màn trống");

  const height = lines.length;
  const width = Math.max(...lines.map((l) => l.length));
  if (width === 0) throw new LevelParseError("Màn không có ô nào");

  const cells: StaticCell[] = new Array<StaticCell>(width * height).fill("wall");
  const boxes: CellIndex[] = [];
  let player: CellIndex | null = null;

  for (let y = 0; y < height; y += 1) {
    const line = lines[y] ?? "";
    for (let x = 0; x < width; x += 1) {
      // Dòng ngắn hơn bề rộng được đệm bằng tường — mọi màn XSB thật đều kín viền.
      const ch = x < line.length ? line[x]! : WALL;
      if (!VALID.has(ch)) {
        throw new LevelParseError(`Ký tự lạ ${JSON.stringify(ch)} ở dòng ${y + 1}, cột ${x + 1}`);
      }

      const index = y * width + x;
      if (ch === WALL) {
        cells[index] = "wall";
        continue;
      }
      cells[index] = ch === GOAL || ch === BOX_ON_GOAL || ch === PLAYER_ON_GOAL ? "goal" : "floor";

      if (ch === BOX || ch === BOX_ON_GOAL) boxes.push(index);
      if (ch === PLAYER || ch === PLAYER_ON_GOAL) {
        if (player !== null) throw new LevelParseError("Màn có nhiều hơn một người chơi");
        player = index;
      }
    }
  }

  if (player === null) throw new LevelParseError("Màn không có người chơi");

  const goals: CellIndex[] = [];
  for (let i = 0; i < cells.length; i += 1) if (cells[i] === "goal") goals.push(i);

  if (goals.length !== boxes.length) {
    throw new LevelParseError(`Số thùng (${boxes.length}) khác số đích (${goals.length})`);
  }
  if (boxes.length === 0) throw new LevelParseError("Màn không có thùng nào");

  boxes.sort((a, b) => a - b);
  const board: Board = { width, height, cells, goals };
  return { board, player, boxes };
}

export function toXsb(state: LevelState): string[] {
  const { board, player, boxes } = state;
  const boxSet = new Set(boxes);
  const lines: string[] = [];

  for (let y = 0; y < board.height; y += 1) {
    let line = "";
    for (let x = 0; x < board.width; x += 1) {
      const index = y * board.width + x;
      const cell = board.cells[index]!;
      const isGoal = cell === "goal";
      if (cell === "wall") line += WALL;
      else if (boxSet.has(index)) line += isGoal ? BOX_ON_GOAL : BOX;
      else if (player === index) line += isGoal ? PLAYER_ON_GOAL : PLAYER;
      else line += isGoal ? GOAL : FLOOR;
    }
    lines.push(line.replace(/\s+$/, ""));
  }
  return lines;
}

/** Kiểm tra một trạng thái có tự nhất quán không. Dùng khi đọc dữ liệu ngoài. */
export function validateState(state: LevelState): void {
  const { board, player, boxes } = state;
  if (board.cells.length !== board.width * board.height) {
    throw new LevelParseError("Kích thước bàn cờ không khớp số ô");
  }
  if (board.cells[player] === "wall") throw new LevelParseError("Người chơi đứng trong tường");
  if (boxes.length !== board.goals.length) {
    throw new LevelParseError("Số thùng khác số đích");
  }
  const seen = new Set<CellIndex>();
  for (const box of boxes) {
    if (board.cells[box] === "wall") throw new LevelParseError("Thùng nằm trong tường");
    if (seen.has(box)) throw new LevelParseError("Hai thùng trùng ô");
    if (box === player) throw new LevelParseError("Thùng chồng lên người chơi");
    seen.add(box);
  }
  for (let i = 1; i < boxes.length; i += 1) {
    if (boxes[i]! < boxes[i - 1]!) throw new LevelParseError("Mảng thùng chưa sắp tăng dần");
  }
}

export function packLevelToLevel(packLevel: PackLevel): Level {
  const initial = parseXsb(packLevel.xsb);
  validateState(initial);
  return {
    id: packLevel.id,
    seed: packLevel.seed,
    difficulty: packLevel.difficulty,
    initial,
    optimalPushes: packLevel.optimalPushes,
    optimalMoves: packLevel.optimalMoves
  };
}

export function levelToPackLevel(level: Level): PackLevel {
  return {
    id: level.id,
    seed: level.seed,
    difficulty: level.difficulty,
    xsb: toXsb(level.initial),
    optimalPushes: level.optimalPushes,
    optimalMoves: level.optimalMoves
  };
}
