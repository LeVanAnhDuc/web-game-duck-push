import type { CellIndex, Direction, Level, LevelState } from "@/game/core/types";

/**
 * Hợp đồng của một ván đang chơi.
 *
 * Bất biến: `undo` là **lùi lịch sử**, không phải "đi ngược lại". Trong Sokoban, kéo
 * không phải nghịch đảo của đẩy — cài undo bằng cách đi ngược sẽ chạy có vẻ đúng ở
 * các nước không đẩy rồi sai âm thầm ngay lần đẩy đầu tiên.
 */

export interface HistoryEntry {
  readonly direction: Direction;
  readonly pushed: boolean;
  /** Trạng thái **trước** khi đi nước này. Undo là khôi phục nguyên cái này. */
  readonly before: LevelState;
}

export interface GameSession {
  readonly level: Level;
  readonly current: LevelState;
  readonly past: readonly HistoryEntry[];
  /** Các nước đã hoàn tác, chờ làm lại. Đi một nước mới thì xoá sạch. */
  readonly future: readonly HistoryEntry[];
  readonly moves: number;
  readonly pushes: number;
  readonly solved: boolean;
  /** 12 ô gần nhất người chơi đã đi qua, mới nhất ở cuối — vệt mờ dần trên sàn. */
  readonly trail: readonly CellIndex[];
  /** Thùng đang kẹt không gỡ được, để hiện dải cảnh báo. Rỗng nghĩa là chưa phát hiện. */
  readonly stuckBoxes: readonly CellIndex[];
  /** Mốc `Date.now()` lúc bắt đầu tính giờ. */
  readonly startedAt: number;
  /** Thời gian đã chơi, chốt lại khi thắng. */
  readonly elapsedMs: number;
}

export const TRAIL_LENGTH = 12;
