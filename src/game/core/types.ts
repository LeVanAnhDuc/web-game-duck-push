/**
 * Hợp đồng kiểu của lõi game.
 *
 * Bất biến của cả thư mục `core/`: không import React, không đụng DOM, không đọc
 * `window`. Cùng một dòng code phải chạy được ở ba nơi — script Node lúc build,
 * Web Worker lúc runtime, và Vitest.
 *
 * Toạ độ luôn là **chỉ số phẳng**: `index = y * width + x`. Không dùng {x, y} ở
 * bất kỳ đâu trong core; đổi qua lại chỉ xảy ra ở tầng render.
 */

export type Direction = "up" | "down" | "left" | "right";

export const DIRECTIONS: readonly Direction[] = ["up", "down", "left", "right"];

/** Chỉ số phẳng của một ô. */
export type CellIndex = number;

/** Phần tĩnh của một ô — không bao giờ đổi trong suốt ván. */
export type StaticCell = "wall" | "floor" | "goal";

export interface Board {
  readonly width: number;
  readonly height: number;
  /** Độ dài đúng bằng `width * height`. */
  readonly cells: readonly StaticCell[];
  /** Các ô đích, **đã sắp tăng dần**. */
  readonly goals: readonly CellIndex[];
}

/**
 * Trạng thái động của một ván.
 *
 * `boxes` **luôn được giữ sắp tăng dần** — đó là điều kiện để hai trạng thái giống
 * nhau băm ra cùng một khoá. Hàm nào trả về `LevelState` mà quên sắp là một lỗi
 * sai âm thầm: game vẫn chạy, solver thì nổ số nút lên nhiều lần.
 */
export interface LevelState {
  readonly board: Board;
  readonly player: CellIndex;
  readonly boxes: readonly CellIndex[];
}

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard", "expert"];

/** Một màn đã được kiểm định: giải được, và biết trước lời giải tối ưu. */
export interface Level {
  readonly id: string;
  /** Seed đã sinh ra màn này. Cùng seed + cùng bậc khó ⇒ đúng màn này. */
  readonly seed: number;
  readonly difficulty: Difficulty;
  readonly initial: LevelState;
  /** Số lần đẩy tối ưu. Là con số HUD so sánh và là cơ sở của kỷ lục. */
  readonly optimalPushes: number;
  /** Số bước đi tối ưu ứng với lời giải ít đẩy nhất tìm được. */
  readonly optimalMoves: number;
}

export interface MoveResult {
  readonly state: LevelState;
  /** Nước này có đẩy một thùng hay không — bộ đếm đẩy chỉ tăng khi `true`. */
  readonly pushed: boolean;
}

// ─────────────────────────────────────────────────────────────
// Solver
// ─────────────────────────────────────────────────────────────

export interface SolverBudget {
  /** Trần số nút mở rộng. Chạm trần ⇒ `timeout`, không phải `unsolvable`. */
  readonly maxNodes: number;
  readonly maxMillis: number;
}

export type SolveResult =
  | {
      readonly status: "solved";
      readonly pushes: number;
      readonly moves: number;
      readonly nodes: number;
      /** Dãy nước đi đầy đủ từ trạng thái đầu tới thắng. */
      readonly solution: readonly Direction[];
    }
  /** Đã duyệt cạn không gian trong ngân sách và chắc chắn không có lời giải. */
  | { readonly status: "unsolvable"; readonly nodes: number }
  /** Hết ngân sách. **Không kết luận gì** về việc màn có giải được hay không. */
  | { readonly status: "timeout"; readonly nodes: number };

// ─────────────────────────────────────────────────────────────
// Generator
// ─────────────────────────────────────────────────────────────

export interface GenerateOptions {
  readonly seed: number;
  readonly difficulty: Difficulty;
  readonly budget: SolverBudget;
  /** Số ứng viên tối đa được dựng rồi vứt trước khi bỏ cuộc. */
  readonly maxAttempts: number;
}

export interface GenerateResult {
  readonly level: Level;
  /** Đã vứt bao nhiêu ứng viên trước khi ra được màn này. */
  readonly attempts: number;
}

/** Khuôn của một bậc khó — generator đọc, test đối chiếu. */
export interface DifficultyProfile {
  readonly difficulty: Difficulty;
  readonly rooms: { readonly cols: number; readonly rows: number };
  readonly boxes: number;
  readonly minPushes: number;
  readonly maxPushes: number;
  /** Trần số nút solver phải mở để màn còn được coi là thuộc bậc này. */
  readonly maxNodes: number;
}

// ─────────────────────────────────────────────────────────────
// Pack — dữ liệu sinh sẵn, commit vào repo
// ─────────────────────────────────────────────────────────────

/** Một màn trong pack. Bàn cờ lưu ở dạng chuỗi XSB cho người đọc được. */
export interface PackLevel {
  readonly id: string;
  readonly seed: number;
  readonly difficulty: Difficulty;
  /** Các dòng XSB: `#` tường · ` ` sàn · `.` đích · `$` thùng · `*` thùng trên đích · `@` người · `+` người trên đích. */
  readonly xsb: readonly string[];
  readonly optimalPushes: number;
  readonly optimalMoves: number;
}

export interface LevelPack {
  readonly version: 1;
  readonly difficulty: Difficulty;
  /** Seed gốc của cả pack — chạy lại generator với seed này phải ra đúng pack này. */
  readonly seed: number;
  readonly levels: readonly PackLevel[];
}
