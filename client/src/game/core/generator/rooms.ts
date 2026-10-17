import { neighbor } from "../rules";
import type { Rng } from "../rng";
import {
  DIRECTIONS,
  type Board,
  type CellIndex,
  type DifficultyProfile,
  type StaticCell
} from "../types";

/**
 * Bước 1 của generator: dựng bản đồ bằng cách ghép các phòng mẫu 3×3 (ADR-0003).
 *
 * Vì sao ghép phòng mẫu chứ không rải tường ngẫu nhiên: tường rải ngẫu nhiên cho ra
 * bản đồ vụn — đầy ngóc ngách một ô, mà ngóc ngách một ô là ô chết với thùng. Phòng
 * mẫu bảo đảm mọi mảng tường đều có hình dạng người ta *nhận ra được*, nên màn nhìn
 * như do người vẽ chứ không như nhiễu.
 *
 * Bản đồ ra khỏi đây luôn thoả ba điều, vì mọi bước sau đều tin vào chúng:
 *  - viền ngoài kín tường,
 *  - sàn là **một** vùng liên thông duy nhất,
 *  - không còn ô cụt (ô sàn chỉ có đúng một hàng xóm không phải tường).
 *
 * Chưa có đích nào ở đây: `goals` rỗng. Chọn đích là việc của `reverse.ts`.
 */

/** Cạnh của một phòng mẫu. Đổi số này là đổi toàn bộ thư viện mẫu. */
export const ROOM_SIZE = 3;

export interface RoomTemplate {
  readonly name: string;
  /** Đúng `ROOM_SIZE` dòng, mỗi dòng `ROOM_SIZE` ký tự: `#` tường · ` ` sàn. */
  readonly rows: readonly string[];
  /**
   * Trọng số khi bốc. Mẫu càng kín tường càng phải hiếm: một bản đồ toàn mẫu kín
   * thì sàn vỡ thành nhiều mảnh và cả ứng viên bị vứt.
   */
  readonly weight: number;
}

/**
 * Thư viện gốc — 12 hình, mỗi hình sẽ được xoay ra bốn phía ở dưới.
 *
 * Chỉ liệt kê một hướng cho mỗi hình để khỏi phải tự tay giữ đồng bộ bốn bản sao;
 * hình đối xứng (phòng trống, cột giữa) tự trùng khi xoay và sẽ bị lọc trùng.
 */
export const BASE_ROOM_TEMPLATES: readonly RoomTemplate[] = [
  { name: "open", rows: ["   ", "   ", "   "], weight: 26 },
  { name: "pillar", rows: ["   ", " # ", "   "], weight: 16 },
  { name: "corner", rows: ["#  ", "   ", "   "], weight: 16 },
  { name: "diagonal", rows: ["#  ", "   ", "  #"], weight: 10 },
  { name: "elbow", rows: ["## ", "#  ", "   "], weight: 7 },
  { name: "stub", rows: [" # ", " # ", "   "], weight: 9 },
  { name: "wedge", rows: ["## ", "   ", "   "], weight: 8 },
  { name: "bar", rows: ["   ", "###", "   "], weight: 5 },
  { name: "corridor", rows: ["###", "   ", "###"], weight: 4 },
  { name: "notch", rows: ["   ", "  #", "   "], weight: 11 },
  { name: "hook", rows: [" ##", "   ", "   "], weight: 8 },
  { name: "gate", rows: ["# #", "   ", "   "], weight: 7 }
];

/** Xoay 90°: ô (y, x) mới lấy từ ô (n-1-x, y) cũ. */
function rotate(rows: readonly string[]): string[] {
  const out: string[] = [];
  for (let y = 0; y < ROOM_SIZE; y += 1) {
    let line = "";
    for (let x = 0; x < ROOM_SIZE; x += 1) {
      line += rows[ROOM_SIZE - 1 - x]?.[y] ?? "#";
    }
    out.push(line);
  }
  return out;
}

function expandRotations(base: readonly RoomTemplate[]): RoomTemplate[] {
  const all: RoomTemplate[] = [];
  // Hai hình gốc khác nhau vẫn có thể là bản xoay của nhau (`" # "/" # "/"   "` và
  // `"   "/"## "/"   "` chẳng hạn) — lọc trùng trên toàn bộ, không chỉ trong một quỹ đạo.
  const seen = new Set<string>();

  for (const template of base) {
    // Gom bốn hướng của *một* hình trước, để chia lại trọng số theo số bản khác
    // nhau: hình đối xứng chỉ ra một bản, hình lệch ra bốn. Không chia thì hình
    // lệch được bốc thường xuyên gấp bốn lần chỉ vì nó lệch — không ai muốn thế.
    const variants = new Map<string, string[]>();
    let rows = template.rows.slice();
    for (let turn = 0; turn < 4; turn += 1) {
      variants.set(rows.join("/"), rows);
      rows = rotate(rows);
    }

    const share = template.weight / variants.size;
    let index = 0;
    for (const [key, variant] of variants) {
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({
        name: variants.size === 1 ? template.name : `${template.name}-${index}`,
        rows: variant,
        weight: share
      });
      index += 1;
    }
  }

  return all;
}

/** Thư viện đầy đủ: 12 hình gốc đã xoay và lọc trùng. */
export const ROOM_TEMPLATES: readonly RoomTemplate[] = expandRotations(BASE_ROOM_TEMPLATES);

const TOTAL_WEIGHT = ROOM_TEMPLATES.reduce((sum, template) => sum + template.weight, 0);

export function pickTemplate(rng: Rng): RoomTemplate {
  let ticket = rng.next() * TOTAL_WEIGHT;
  for (const template of ROOM_TEMPLATES) {
    ticket -= template.weight;
    if (ticket <= 0) return template;
  }
  return ROOM_TEMPLATES[ROOM_TEMPLATES.length - 1]!;
}

/** Sàn tối thiểu để `boxCount` thùng còn có chỗ xoay xở, không chỉ vừa đủ đứng. */
export function minFloorArea(boxCount: number): number {
  return Math.max(10, boxCount * 4 + 6);
}

export function floorCells(board: Board): CellIndex[] {
  const cells: CellIndex[] = [];
  for (let index = 0; index < board.cells.length; index += 1) {
    if (board.cells[index] !== "wall") cells.push(index);
  }
  return cells;
}

function neighboursOf(board: Board, index: CellIndex): CellIndex[] {
  const found: CellIndex[] = [];
  for (const direction of DIRECTIONS) {
    const next = neighbor(board, index, direction);
    if (next !== null && board.cells[next] !== "wall") found.push(next);
  }
  return found;
}

/** Sàn có đúng một vùng liên thông không. Test dùng trực tiếp. */
export function isFloorConnected(board: Board): boolean {
  const floors = floorCells(board);
  const start = floors[0];
  if (start === undefined) return false;

  const seen = new Set<CellIndex>([start]);
  const stack: CellIndex[] = [start];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const next of neighboursOf(board, current)) {
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(next);
    }
  }
  return seen.size === floors.length;
}

/** Vùng liên thông lớn nhất của sàn. */
function largestRegion(board: Board): Set<CellIndex> {
  const visited = new Set<CellIndex>();
  let best = new Set<CellIndex>();

  for (const start of floorCells(board)) {
    if (visited.has(start)) continue;
    const region = new Set<CellIndex>([start]);
    const stack: CellIndex[] = [start];
    visited.add(start);

    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const next of neighboursOf(board, current)) {
        if (visited.has(next)) continue;
        visited.add(next);
        region.add(next);
        stack.push(next);
      }
    }
    if (region.size > best.size) best = region;
  }
  return best;
}

/**
 * Tỉa ô cụt cho tới khi hết.
 *
 * Ô sàn chỉ có một hàng xóm là một cái ngõ cụt sâu một ô: đẩy thùng vào đó là mất
 * thùng vĩnh viễn (trừ khi ô ấy là đích, mà lúc này chưa có đích nào). Để lại thì
 * generator vẫn chạy, chỉ là sinh ra một loạt ứng viên bế tắc ngay từ nước đầu rồi
 * vứt — tốn CPU mà không ai hiểu vì sao tỉ lệ hỏng cao.
 *
 * Tỉa xong có thể lòi ra ô cụt mới, nên phải lặp. Bản đồ nào phải tỉa tới mức chạm
 * `minAlive` là bản đồ hình cây — tỉa tiếp thì không còn gì — nên trả `-1` để hàm gọi
 * vứt luôn ứng viên thay vì nhận về một bàn cờ vẫn còn ngõ cụt.
 */
function pruneDeadEnds(cells: StaticCell[], board: Board, minAlive: number): number {
  let alive = floorCells(board).length;
  let changed = true;

  while (changed) {
    changed = false;
    for (let index = 0; index < cells.length; index += 1) {
      if (cells[index] === "wall") continue;
      if (neighboursOf(board, index).length > 1) continue;
      if (alive - 1 < minAlive) return -1;
      cells[index] = "wall";
      alive -= 1;
      changed = true;
    }
  }
  return alive;
}

/**
 * Ghép `profile.rooms.cols × profile.rooms.rows` phòng mẫu thành một bàn cờ.
 *
 * Trả `null` khi ứng viên hỏng — sàn vỡ vụn, teo quá nhỏ, hoặc trống trơn tới mức
 * không có gì để chơi. Hàm gọi cứ bốc seed khác rồi thử lại; đó là cách rẻ nhất, rẻ
 * hơn nhiều so với cố vá một bản đồ xấu.
 */
export function buildBoard(rng: Rng, profile: DifficultyProfile): Board | null {
  const width = profile.rooms.cols * ROOM_SIZE + 2;
  const height = profile.rooms.rows * ROOM_SIZE + 2;
  const cells: StaticCell[] = new Array<StaticCell>(width * height).fill("wall");
  // `cells` được sửa tại chỗ suốt hàm này; `board` chỉ là cái vỏ để dùng `neighbor`.
  const board: Board = { width, height, cells, goals: [] };

  for (let roomY = 0; roomY < profile.rooms.rows; roomY += 1) {
    for (let roomX = 0; roomX < profile.rooms.cols; roomX += 1) {
      const template = pickTemplate(rng);
      for (let y = 0; y < ROOM_SIZE; y += 1) {
        const row = template.rows[y] ?? "";
        for (let x = 0; x < ROOM_SIZE; x += 1) {
          if (row[x] === "#") continue;
          const boardX = 1 + roomX * ROOM_SIZE + x;
          const boardY = 1 + roomY * ROOM_SIZE + y;
          cells[boardY * width + boardX] = "floor";
        }
      }
    }
  }

  const required = minFloorArea(profile.boxes);

  // Giữ vùng lớn nhất và xoá phần còn lại thay vì vứt cả ứng viên: một mảnh sàn con
  // bị tường cắt rời thường chỉ vài ô, bỏ đi thì phần chính vẫn là một bản đồ tử tế.
  const main = largestRegion(board);
  if (main.size < required) return null;
  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index] !== "wall" && !main.has(index)) cells[index] = "wall";
  }

  const alive = pruneDeadEnds(cells, board, required);
  if (alive < required) return null;
  // Tỉa có thể cắt rời sàn một lần nữa (một ô cụt hoá tường làm đứt eo thắt).
  if (!isFloorConnected(board)) return null;

  const interior = (width - 2) * (height - 2);
  const wallRatio = (interior - alive) / interior;
  // Quá trống là một cái sân, không phải một màn Sokoban; quá kín thì không đủ chỗ
  // để thùng đi vòng. Hai đầu đều là ứng viên nhạt, vứt sớm rẻ hơn chấm bằng solver.
  if (wallRatio < 0.08 || wallRatio > 0.5) return null;

  return { width, height, cells, goals: [] };
}
