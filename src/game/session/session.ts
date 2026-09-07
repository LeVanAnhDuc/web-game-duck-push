import { computeDeadSquares, findFrozenBoxes } from "@/game/core/deadlock";
import { isSolved, step } from "@/game/core/rules";
import type { Board, CellIndex, Direction, Level, LevelState } from "@/game/core/types";
import { TRAIL_LENGTH, type GameSession, type HistoryEntry } from "./types";

/**
 * Tầng ván chơi: bọc luật thuần trong `core/rules` thành một đối tượng có lịch
 * sử, bộ đếm và đồng hồ.
 *
 * Ba bất biến của cả file:
 *
 * 1. **Bất biến dữ liệu.** Mọi hàm trả về `GameSession` mới; không hàm nào sửa
 *    session hay mảng bên trong nó. React so sánh bằng tham chiếu, nên sửa tại
 *    chỗ sẽ làm mất một lần vẽ lại — dạng lỗi rất khó lần ra.
 *
 * 2. **Không đổi thì trả về chính nó.** Nước đi không hợp lệ, undo khi hết lịch
 *    sử, redo khi hết `future` — trả lại đúng object cũ. Đây là hợp đồng với UI:
 *    `prev === next` nghĩa là "bỏ qua, không cần vẽ".
 *
 * 3. **Thời gian được tiêm vào.** Mọi hàm dính đồng hồ nhận `now`. Test không
 *    bao giờ phải `sleep`, và phát lại một ván đã lưu cho ra đúng con số cũ.
 */

/**
 * Ô chết chỉ phụ thuộc bàn cờ tĩnh, không phụ thuộc thùng đang ở đâu — tính một
 * lần rồi dùng lại cho suốt ván. `WeakMap` khoá theo `board` để khi màn bị bỏ
 * thì cache tự rụng, không giữ bàn cờ sống mãi.
 */
const deadSquareCache = new WeakMap<Board, ReadonlySet<CellIndex>>();

function deadSquaresFor(board: Board): ReadonlySet<CellIndex> {
  const cached = deadSquareCache.get(board);
  if (cached !== undefined) return cached;
  const computed = computeDeadSquares(board);
  deadSquareCache.set(board, computed);
  return computed;
}

function stuckBoxesOf(state: LevelState): CellIndex[] {
  return findFrozenBoxes(state, deadSquaresFor(state.board));
}

/**
 * Dựng lại vệt đi từ lịch sử thay vì cắt dần mảng cũ.
 *
 * Undo mà chỉ `pop()` một phần tử thì sai ngay khi lịch sử dài hơn `TRAIL_LENGTH`:
 * ô thứ 13 tính từ cuối đã bị vứt lúc đi tới, pop xong không có gì để trả lại và
 * vệt ngắn dần mỗi lần undo. Dựng lại từ `past` thì luôn đúng, và `past` cũng
 * chính là nguồn sự thật duy nhất.
 */
function buildTrail(past: readonly HistoryEntry[], current: LevelState): CellIndex[] {
  const first = Math.max(0, past.length - (TRAIL_LENGTH - 1));
  const trail: CellIndex[] = [];
  for (let i = first; i < past.length; i += 1) trail.push(past[i]!.before.player);
  trail.push(current.player);
  return trail;
}

export function createSession(level: Level, now: number = Date.now()): GameSession {
  const current = level.initial;
  return {
    level,
    current,
    past: [],
    future: [],
    moves: 0,
    pushes: 0,
    solved: isSolved(current),
    trail: [current.player],
    stuckBoxes: stuckBoxesOf(current),
    startedAt: now,
    elapsedMs: 0
  };
}

export function applyMove(
  session: GameSession,
  direction: Direction,
  now: number = Date.now()
): GameSession {
  // Đã thắng thì bàn phím ngừng ăn — chờ người chơi bấm chơi lại hoặc undo.
  if (session.solved) return session;

  const result = step(session.current, direction);
  if (result === null) return session;

  const entry: HistoryEntry = { direction, pushed: result.pushed, before: session.current };
  const past = [...session.past, entry];
  const solved = isSolved(result.state);

  return {
    ...session,
    current: result.state,
    past,
    // Đi một nước mới là rẽ sang nhánh khác — nhánh đã hoàn tác không còn nối lại được.
    future: [],
    moves: session.moves + 1,
    pushes: session.pushes + (result.pushed ? 1 : 0),
    solved,
    trail: buildTrail(past, result.state),
    stuckBoxes: stuckBoxesOf(result.state),
    // Chốt đồng hồ đúng lúc thắng; từ đây `elapsedMs()` trả con số này mãi.
    elapsedMs: solved ? Math.max(0, now - session.startedAt) : session.elapsedMs
  };
}

export function undo(session: GameSession): GameSession {
  const entry = session.past[session.past.length - 1];
  if (entry === undefined) return session;

  const past = session.past.slice(0, -1);

  return {
    ...session,
    // Khôi phục nguyên trạng thái đã lưu, **không** đi ngược hướng: trong Sokoban
    // kéo không phải nghịch đảo của đẩy.
    current: entry.before,
    past,
    future: [...session.future, entry],
    moves: session.moves - 1,
    pushes: session.pushes - (entry.pushed ? 1 : 0),
    // `applyMove` từ chối đi khi đã thắng, nên mọi trạng thái nằm trong `past`
    // chắc chắn chưa thắng — lùi một bước thì luôn về chưa thắng.
    solved: false,
    trail: buildTrail(past, entry.before),
    stuckBoxes: stuckBoxesOf(entry.before),
    // Đồng hồ chạy tiếp: bỏ con số đã chốt để `elapsedMs()` quay lại đo thật.
    elapsedMs: 0
  };
}

export function redo(session: GameSession): GameSession {
  const entry = session.future[session.future.length - 1];
  if (entry === undefined) return session;

  const result = step(session.current, entry.direction);
  // Nước này từng hợp lệ nên bình thường không bao giờ `null`; nếu có thì lịch sử
  // đã hỏng và im lặng đứng yên vẫn tốt hơn là nổ giữa ván.
  if (result === null) return session;

  const past = [...session.past, entry];
  const solved = isSolved(result.state);

  return {
    ...session,
    current: result.state,
    past,
    future: session.future.slice(0, -1),
    moves: session.moves + 1,
    pushes: session.pushes + (result.pushed ? 1 : 0),
    solved,
    trail: buildTrail(past, result.state),
    stuckBoxes: stuckBoxesOf(result.state),
    // `redo` không nhận `now` (hợp đồng với UI), nên phải tự đọc đồng hồ ở đây.
    elapsedMs: solved ? Math.max(0, Date.now() - session.startedAt) : session.elapsedMs
  };
}

export function restart(session: GameSession, now: number = Date.now()): GameSession {
  return createSession(session.level, now);
}

/**
 * Phát lại một dãy nước đi từ trạng thái đầu — đường khôi phục ván đang dở, vì
 * bản lưu chỉ chứa dãy nước chứ không chứa cả bàn cờ.
 *
 * Nước không hợp lệ bị **bỏ qua**, không ném lỗi: bản lưu có thể được chép tay
 * hoặc thuộc phiên bản màn khác, và mở lại được một phần vẫn hơn là mất trắng.
 */
export function replay(
  level: Level,
  moves: readonly Direction[],
  now: number = Date.now()
): GameSession {
  let session = createSession(level, now);
  for (const direction of moves) session = applyMove(session, direction, now);
  return session;
}

/** Thời gian đã chơi: đứng yên sau khi thắng, còn lại thì đo từ `startedAt`. */
export function elapsedMs(session: GameSession, now: number = Date.now()): number {
  if (session.solved) return session.elapsedMs;
  return Math.max(0, now - session.startedAt);
}

/** Dãy nước đã đi, để ghi vào bản lưu. */
export function moveHistory(session: GameSession): Direction[] {
  return session.past.map((entry) => entry.direction);
}
