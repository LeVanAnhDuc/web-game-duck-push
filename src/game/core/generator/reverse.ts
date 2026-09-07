import { isWall, neighbor, reachableCells } from "../rules";
import type { Rng } from "../rng";
import {
  DIRECTIONS,
  type Board,
  type CellIndex,
  type Direction,
  type LevelState,
  type StaticCell
} from "../types";
import { floorCells } from "./rooms";

/**
 * Bước 2 của generator: đặt thùng bằng cách **đi lùi** từ trạng thái thắng (ADR-0003).
 *
 * Rải thùng ngẫu nhiên rồi hỏi solver là cách tốn kém nhất có thể: phần lớn thế cờ
 * ngẫu nhiên đều vô nghiệm, và mỗi lần biết được điều đó phải trả bằng một lượt tìm
 * kiếm cạn ngân sách. Ở đây làm ngược lại: bắt đầu ở thế **đã thắng** rồi *kéo* thùng
 * lùi ra. Mỗi bước kéo đảo ngược lại đúng là một bước đẩy hợp lệ, nên thế cờ trả về
 * **luôn giải được** — không cần solver để biết điều đó. Solver ở bước sau chỉ còn
 * việc đo xem nó khó tới đâu.
 *
 * Một cú kéo: thùng ở `box`, người chơi đứng ở ô kề `p = neighbor(box, d)`, cả hai
 * cùng dịch một ô theo hướng `d` — thùng sang `p`, người sang `neighbor(p, d)`. Nên
 * điều kiện là hai ô liền nhau phía sau người chơi đều là sàn trống.
 */

/** Số lượt đi lùi thử lại trong một lần đặt thùng. Xem `placeBoxes`. */
const WALK_RESTARTS = 5;

export interface PullMove {
  readonly box: CellIndex;
  readonly direction: Direction;
  readonly boxTo: CellIndex;
  readonly playerTo: CellIndex;
}

/** Khoảng cách Manhattan tới đích gần nhất, tra sẵn — dùng để chấm trọng số. */
function goalDistanceTable(board: Board, goals: readonly CellIndex[]): number[] {
  const table = new Array<number>(board.cells.length).fill(0);
  for (let index = 0; index < board.cells.length; index += 1) {
    const x = index % board.width;
    const y = Math.floor(index / board.width);
    let best = Number.POSITIVE_INFINITY;
    for (const goal of goals) {
      const distance = Math.abs(x - (goal % board.width)) + Math.abs(y - Math.floor(goal / board.width));
      if (distance < best) best = distance;
    }
    table[index] = Number.isFinite(best) ? best : 0;
  }
  return table;
}

function spreadOf(state: LevelState, goalDistance: readonly number[]): number {
  let sum = 0;
  for (const box of state.boxes) sum += goalDistance[box] ?? 0;
  return sum;
}

/**
 * Cận dưới của số đẩy tối ưu: tổng khoảng cách Manhattan từ mỗi thùng tới đích gần
 * nhất của nó.
 *
 * Hợp lệ vì mỗi lượt đẩy dịch đúng một thùng đúng một ô, và ràng buộc ghép cặp
 * thùng↔đích chỉ làm con số thật lớn hơn chứ không nhỏ hơn. Đây là bộ lọc rẻ tiền
 * đứng trước solver: solver mất hàng giây cho một ứng viên, hàm này mất vài micro
 * giây và loại được phần lớn ứng viên hỏng.
 */
export function lowerBoundPushes(state: LevelState): number {
  return spreadOf(state, goalDistanceTable(state.board, state.board.goals));
}

function chebyshev(board: Board, a: CellIndex, b: CellIndex): number {
  const ax = a % board.width;
  const ay = Math.floor(a / board.width);
  const bx = b % board.width;
  const by = Math.floor(b / board.width);
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function manhattan(board: Board, a: CellIndex, b: CellIndex): number {
  return (
    Math.abs((a % board.width) - (b % board.width)) +
    Math.abs(Math.floor(a / board.width) - Math.floor(b / board.width))
  );
}

/**
 * Chọn `count` ô đích. `clustering` (0…1) quyết định chúng nằm rải hay dồn một chỗ.
 *
 * Đây là **cái núm chỉnh độ khó mạnh nhất của cả generator**, và nó ngược với trực
 * giác. Đích rải đều nghe có vẻ đa dạng hơn, nhưng số đẩy tối ưu là một bài ghép cặp:
 * solver được tự do gán thùng nào về đích nào, nên rải đích ra là tặng cho mỗi thùng
 * một cái đích ở ngay cạnh. Đo thật trên bàn 11×11 với 4 thùng: đích rải đều thì số
 * đẩy tối ưu bão hoà quanh 10–12 **dù kéo lùi bao xa đi nữa** — không cách nào chạm
 * tới khoảng 28–60 của bậc Khó. Dồn đích lại thành một cụm thì mọi thùng đều phải đi
 * cả quãng đường về cụm ấy, và số đẩy mới thật sự phụ thuộc vào việc kéo xa hay gần.
 *
 * Nên: bậc dễ rải đích (quãng ngắn, dễ nhìn ra), bậc khó dồn đích thành phòng đích.
 */
function chooseGoals(
  rng: Rng,
  board: Board,
  count: number,
  clustering: number
): CellIndex[] | null {
  const floors = floorCells(board);
  if (floors.length < count) return null;

  const anchor = rng.pick(floors);
  const tightest = Math.min(floors.length, count * 3);
  const poolSize = Math.max(count, Math.round(floors.length - (floors.length - tightest) * clustering));
  const pool = floors
    .slice()
    .sort((a, b) => manhattan(board, a, anchor) - manhattan(board, b, anchor))
    .slice(0, poolSize);

  // Cụm chật thì chỉ cần các đích khác ô nhau; cụm rộng thì giãn ra kẻo dính chùm
  // ngẫu nhiên và mất luôn ý đồ "rải".
  const minGap = clustering >= 0.5 ? 1 : 2;
  const shuffled = rng.shuffle(pool);
  const goals: CellIndex[] = [];

  for (const cell of shuffled) {
    if (goals.length >= count) break;
    if (goals.some((goal) => chebyshev(board, goal, cell) < minGap)) continue;
    goals.push(cell);
  }

  if (goals.length < count) {
    // Hết chỗ giãn thì hạ chuẩn giãn cách — thà một màn chật còn hơn không có màn nào.
    const taken = new Set(goals);
    for (const cell of shuffled) {
      if (goals.length >= count) break;
      if (taken.has(cell)) continue;
      goals.push(cell);
      taken.add(cell);
    }
  }

  if (goals.length < count) return null;
  return goals.sort((a, b) => a - b);
}

/** Bàn cờ y hệt nhưng các ô trong `goals` đổi thành đích. */
function withGoals(board: Board, goals: readonly CellIndex[]): Board {
  const cells: StaticCell[] = board.cells.slice();
  for (const goal of goals) cells[goal] = "goal";
  return { width: board.width, height: board.height, cells, goals: [...goals] };
}

/** Mọi cú kéo hợp lệ từ thế cờ hiện tại. */
export function availablePulls(state: LevelState): PullMove[] {
  const { board, boxes } = state;
  const boxSet = new Set(boxes);
  const reachable = reachableCells(state);
  const pulls: PullMove[] = [];

  for (const box of boxes) {
    for (const direction of DIRECTIONS) {
      const stand = neighbor(board, box, direction);
      if (stand === null || isWall(board, stand) || boxSet.has(stand)) continue;
      // Người chơi phải thật sự đi tới được ô đứng kéo, không chỉ là nó trống.
      if (!reachable.has(stand)) continue;

      const behind = neighbor(board, stand, direction);
      if (behind === null || isWall(board, behind) || boxSet.has(behind)) continue;

      pulls.push({ box, direction, boxTo: stand, playerTo: behind });
    }
  }
  return pulls;
}

function applyPull(state: LevelState, pull: PullMove): LevelState {
  const boxes = state.boxes.filter((box) => box !== pull.box);
  let i = 0;
  while (i < boxes.length && boxes[i]! < pull.boxTo) i += 1;
  boxes.splice(i, 0, pull.boxTo);
  return { board: state.board, player: pull.playerTo, boxes };
}

/**
 * Trọng số của một cú kéo. Đây là chỗ quyết định màn hay hay dở.
 *
 * Đi lùi tham lam — cứ thùng nào đang kéo thì kéo tiếp — cho ra màn nhạt nhất có thể:
 * một thùng bị lôi đi thật xa, mấy thùng còn lại nằm nguyên trên đích. Người chơi chỉ
 * việc đẩy một thùng theo một đường. Nên phạt nặng việc kéo lại đúng thùng vừa kéo,
 * và chỉ thưởng khi cú kéo ấy nối thẳng cú trước (kéo cho ra hình, không giật cục).
 */
function weightOf(
  pull: PullMove,
  lastBox: CellIndex | null,
  lastDirection: Direction | null,
  lastBoxFrom: CellIndex | null,
  goalDistance: readonly number[]
): number {
  // Thùng nào còn gần đích thì ưu tiên lôi nó ra trước. Không có vế này thì một thùng
  // bị kéo đi rất xa còn ba thùng kia nằm nguyên trên đích — người chơi chỉ có đúng
  // một câu đố, ba thùng còn lại là đồ trang trí.
  let weight = 1 / (1 + 0.35 * (goalDistance[pull.box] ?? 0));

  if (pull.box === lastBox) {
    weight *= 0.45;
    // Đã quyết kéo tiếp thùng cũ thì kéo thẳng cho ra một đường, đừng giật cục.
    if (pull.direction === lastDirection) weight *= 3;
  }

  // Kéo thùng về đúng ô nó vừa rời khỏi là đi vòng tại chỗ: tốn ngân sách kéo mà
  // độ sâu thực tế đứng yên.
  if (pull.boxTo === lastBoxFrom) weight *= 0.05;

  // Càng kéo thùng ra xa cụm đích, người chơi càng phải nghĩ đường đưa nó về.
  const gain = (goalDistance[pull.boxTo] ?? 0) - (goalDistance[pull.box] ?? 0);
  weight *= gain > 0 ? 2.4 : gain < 0 ? 0.3 : 0.9;

  return Math.max(weight, 0.01);
}

function pickWeighted(rng: Rng, pulls: readonly PullMove[], weights: readonly number[]): number {
  let total = 0;
  for (const weight of weights) total += weight;
  let ticket = rng.next() * total;
  for (let i = 0; i < pulls.length; i += 1) {
    ticket -= weights[i] ?? 0;
    if (ticket <= 0) return i;
  }
  return pulls.length - 1;
}

export interface PlaceOptions {
  /** 0 = đích rải khắp bàn · 1 = đích dồn thành một phòng đích. Xem `chooseGoals`. */
  readonly clustering?: number;
}

/**
 * Đặt thùng cho `board` (bàn cờ chưa có đích nào) rồi đi lùi `pullBudget` bước.
 *
 * Trả về thế cờ **sâu nhất** đi tới được — tức thế cờ sau cú kéo cuối cùng, vì mỗi cú
 * kéo là một bậc sâu hơn. Hết ngân sách hay hết nước kéo thì dừng, cả hai đều bình
 * thường. `pullBudget = 0` trả thẳng trạng thái thắng: hợp lệ, chỉ là chưa có gì để
 * chơi — người gọi tự quyết định vứt hay không.
 */
export function placeBoxes(
  rng: Rng,
  board: Board,
  boxCount: number,
  pullBudget: number,
  options: PlaceOptions = {}
): LevelState | null {
  if (boxCount <= 0) return null;

  const floors = floorCells(board);
  if (floors.length < boxCount + 1) return null;

  const clustering = Math.min(1, Math.max(0, options.clustering ?? 0));
  const goals = chooseGoals(rng, board, boxCount, clustering);
  if (goals === null) return null;

  const goalBoard = withGoals(board, goals);
  const goalSet = new Set(goals);
  const goalDistance = goalDistanceTable(goalBoard, goals);
  const free = rng.shuffle(floors.filter((cell) => !goalSet.has(cell)));
  const start = free[0];
  if (start === undefined) return null;

  // Ở trạng thái thắng, thùng nằm đúng trên đích nên `goals` đã sắp cũng là `boxes` đã sắp.
  const won: LevelState = { board: goalBoard, player: start, boxes: goals };
  if (pullBudget <= 0) return won;

  let best = won;
  let bestDepth = -1;
  let bestSpread = -1;

  // Một lượt đi lùi có thể tắc rất sớm: người chơi tự nhốt mình sau chính mấy cái thùng
  // vừa kéo ra, và thế cờ trả về vẫn gần y như thế thắng. Đo thật thì chuyện đó xảy ra
  // ở phần lớn số lượt. Đi lại vài lượt từ chỗ đứng khác rẻ hơn nhiều so với dựng lại
  // bàn cờ rồi chấm lại bằng solver, nên cứ đi lại rồi giữ lượt sâu nhất.
  for (let walk = 0; walk < WALK_RESTARTS; walk += 1) {
    const seat = free[walk % free.length] ?? start;
    let state: LevelState = { board: goalBoard, player: seat, boxes: goals };
    let depth = 0;

    let lastBox: CellIndex | null = null;
    let lastDirection: Direction | null = null;
    let lastBoxFrom: CellIndex | null = null;

    for (let pulled = 0; pulled < pullBudget; pulled += 1) {
      const pulls = availablePulls(state);
      if (pulls.length === 0) break;

      const weights = pulls.map((pull) =>
        weightOf(pull, lastBox, lastDirection, lastBoxFrom, goalDistance)
      );
      const chosen = pulls[pickWeighted(rng, pulls, weights)];
      if (chosen === undefined) break;

      lastBoxFrom = chosen.box;
      lastBox = chosen.boxTo;
      lastDirection = chosen.direction;
      state = applyPull(state, chosen);
      depth += 1;
    }

    // Sâu nhất trước; hoà thì lấy thế cờ có thùng nằm xa đích hơn, vì tổng khoảng cách
    // ấy chính là cận dưới của số đẩy tối ưu — sâu bằng nhau mà xa hơn thì khó hơn.
    const spread = spreadOf(state, goalDistance);
    if (depth > bestDepth || (depth === bestDepth && spread > bestSpread)) {
      best = state;
      bestDepth = depth;
      bestSpread = spread;
    }
  }

  return best;
}
