import type { Difficulty } from "@/game/core/types";

/**
 * Hình dạng dữ liệu lưu trong `localStorage`.
 *
 * `version` là bắt buộc: dữ liệu người chơi sống lâu hơn code, và người dùng sửa
 * được nó bằng devtools. Đọc vào phải kiểm, sai thì **bỏ qua và bắt đầu lại**,
 * không được ném lỗi làm hỏng ván đang chơi.
 */

export const STORAGE_VERSION = 1 as const;

export const STORAGE_KEYS = {
  progress: "sokoban:progress:v1",
  settings: "sokoban:settings:v1"
} as const;

export interface LevelRecord {
  readonly levelId: string;
  readonly bestPushes: number;
  readonly bestMoves: number;
  readonly bestTimeMs: number;
  /** Đã đạt đúng số đẩy tối ưu của màn — ô màn hiện dấu sao. */
  readonly optimal: boolean;
  readonly solvedAt: number;
}

/** Ván đang dở, đủ để dựng lại nguyên trạng kể cả lịch sử hoàn tác. */
export interface SavedSession {
  readonly levelId: string;
  readonly difficulty: Difficulty;
  /** Với màn ngẫu nhiên: seed để sinh lại. Với màn chiến dịch: null, đọc từ pack. */
  readonly seed: number | null;
  /** Dãy nước đi từ trạng thái đầu. Phát lại là ra đúng trạng thái hiện tại. */
  readonly moves: readonly ("up" | "down" | "left" | "right")[];
  readonly elapsedMs: number;
  readonly savedAt: number;
}

export interface Progress {
  readonly version: typeof STORAGE_VERSION;
  readonly records: Readonly<Record<string, LevelRecord>>;
  readonly inProgress: SavedSession | null;
}

export type ThemePreference = "system" | "light" | "dark";

export interface Settings {
  readonly version: typeof STORAGE_VERSION;
  readonly theme: ThemePreference;
  /** Hiện vệt đường đi. Mặc định bật. */
  readonly showTrail: boolean;
  /** Hiện dải cảnh báo bế tắc. Mặc định bật. */
  readonly showDeadlockWarning: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  version: STORAGE_VERSION,
  theme: "system",
  showTrail: true,
  showDeadlockWarning: true
};

export const EMPTY_PROGRESS: Progress = {
  version: STORAGE_VERSION,
  records: {},
  inProgress: null
};
