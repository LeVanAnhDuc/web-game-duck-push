import { isGoal } from "@/game/core/rules";
import type { LevelState } from "@/game/core/types";

/**
 * Bản tóm tắt bàn cờ cho trình đọc màn hình (NFR-A11Y-02).
 *
 * Bàn cờ là `role="img"` chứ không phải một bảng đọc từng ô: đọc 144 ô là tra
 * tấn, còn con số "còn mấy thùng chưa vào đích" mới là thứ người chơi cần.
 */
export function boardLabel(state: LevelState): string {
  const done = state.boxes.filter((box) => isGoal(state.board, box)).length;
  return `Bàn cờ ${state.board.width} trên ${state.board.height}, ${state.boxes.length} thùng, ${done} đã vào đích`;
}
