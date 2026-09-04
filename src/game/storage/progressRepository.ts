import { DIFFICULTIES, type Direction } from "@/game/core/types";
import { readJson, removeKey, writeJson } from "./safeStorage";
import {
  EMPTY_PROGRESS,
  STORAGE_KEYS,
  STORAGE_VERSION,
  type LevelRecord,
  type Progress,
  type SavedSession
} from "./types";

/**
 * Kho tiến trình người chơi: kỷ lục từng màn + ván đang dở.
 *
 * Nguyên tắc xuyên suốt file: **dữ liệu đọc từ `localStorage` là dữ liệu người
 * ngoài**. Người chơi sửa được bằng devtools, phiên bản cũ của game ghi được
 * hình dạng khác, và một bản sao lưu chép nhầm cũng vào đây. Nên mọi trường đều
 * bị kiểm; hễ lệch một chỗ là **vứt cả khối** và bắt đầu lại từ `EMPTY_PROGRESS`.
 * Sửa chữa từng phần nguy hiểm hơn: nó tạo ra những trạng thái nửa vời mà không
 * test nào mô tả.
 */

const MOVE_VALUES: ReadonlySet<string> = new Set<Direction>(["up", "down", "left", "right"]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Số đếm hợp lệ: hữu hạn và không âm. Chặn cả `NaN`, `Infinity` lẫn số âm chép tay. */
function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isLevelRecord(value: unknown): value is LevelRecord {
  if (!isObject(value)) return false;
  return (
    typeof value.levelId === "string" &&
    value.levelId.length > 0 &&
    isCount(value.bestPushes) &&
    isCount(value.bestMoves) &&
    isCount(value.bestTimeMs) &&
    typeof value.optimal === "boolean" &&
    isCount(value.solvedAt)
  );
}

function isSavedSession(value: unknown): value is SavedSession {
  if (!isObject(value)) return false;
  if (typeof value.levelId !== "string" || value.levelId.length === 0) return false;
  if (typeof value.difficulty !== "string") return false;
  if (!DIFFICULTIES.includes(value.difficulty as (typeof DIFFICULTIES)[number])) return false;
  // `seed` là `number | null` — màn chiến dịch không có seed, đọc từ pack.
  if (value.seed !== null && !isCount(value.seed)) return false;
  if (!Array.isArray(value.moves)) return false;
  if (!value.moves.every((move) => typeof move === "string" && MOVE_VALUES.has(move))) return false;
  return isCount(value.elapsedMs) && isCount(value.savedAt);
}

function isProgress(value: unknown): value is Progress {
  if (!isObject(value)) return false;
  if (value.version !== STORAGE_VERSION) return false;
  if (!isObject(value.records)) return false;
  if (!Object.values(value.records).every(isLevelRecord)) return false;
  if (value.inProgress !== null && !isSavedSession(value.inProgress)) return false;
  return true;
}

export function loadProgress(): Progress {
  const raw = readJson<Progress>(STORAGE_KEYS.progress);
  if (!isProgress(raw)) return EMPTY_PROGRESS;
  return raw;
}

export function saveProgress(progress: Progress): boolean {
  return writeJson(STORAGE_KEYS.progress, progress);
}

export interface SolveInput {
  readonly levelId: string;
  readonly pushes: number;
  readonly moves: number;
  readonly timeMs: number;
  /** Số đẩy tối ưu của màn — bằng đúng con số này thì kỷ lục được gắn sao. */
  readonly optimalPushes: number;
}

/**
 * Thứ tự so kỷ lục: **ít đẩy** trước, rồi ít bước, rồi nhanh hơn.
 *
 * Đẩy đứng trước bước vì Sokoban chấm theo số đẩy — đi thêm mười bước để tránh
 * một cú đẩy thừa là chơi giỏi hơn, không phải kém hơn.
 */
function isBetter(candidate: LevelRecord, existing: LevelRecord): boolean {
  if (candidate.bestPushes !== existing.bestPushes) {
    return candidate.bestPushes < existing.bestPushes;
  }
  if (candidate.bestMoves !== existing.bestMoves) {
    return candidate.bestMoves < existing.bestMoves;
  }
  return candidate.bestTimeMs < existing.bestTimeMs;
}

/**
 * Hàm thuần: trả `Progress` mới, **không** ghi xuống đĩa. Người gọi quyết định
 * khi nào lưu, nên test không cần `localStorage` và UI không lưu hai lần.
 */
export function recordSolve(
  progress: Progress,
  input: SolveInput,
  now: number = Date.now()
): Progress {
  const candidate: LevelRecord = {
    levelId: input.levelId,
    bestPushes: input.pushes,
    bestMoves: input.moves,
    bestTimeMs: input.timeMs,
    optimal: input.pushes === input.optimalPushes,
    solvedAt: now
  };

  const existing = progress.records[input.levelId];
  if (existing !== undefined && !isBetter(candidate, existing)) {
    // Lần chơi này tệ hơn kỷ lục cũ. Vẫn phải trả về `Progress` mới chứ không
    // phải chính nó — mốc thời gian "lần cuối giải được" không thuộc kỷ lục, và
    // người gọi coi kết quả của hàm này là nguồn sự thật mới.
    return { ...progress, records: { ...progress.records } };
  }

  return {
    ...progress,
    records: { ...progress.records, [input.levelId]: candidate }
  };
}

/** Gắn (hoặc gỡ, với `null`) ván đang dở. Hàm thuần, giống `recordSolve`. */
export function saveInProgress(progress: Progress, session: SavedSession | null): Progress {
  return { ...progress, inProgress: session };
}

export function clearProgress(): void {
  removeKey(STORAGE_KEYS.progress);
}
