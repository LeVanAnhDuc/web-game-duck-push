import { isGoal } from "@/game/core/rules";
import type { CellIndex, LevelState } from "@/game/core/types";

/**
 * Bản mô tả bàn cờ cho trình đọc màn hình (NFR-A11Y-07).
 *
 * Bàn cờ là `role="img"` chứ không phải một bảng đọc từng ô: đọc 144 ô là tra tấn.
 * Nhưng bản cũ đi quá xa về phía kia — nó chỉ **đếm loại** ("2 thùng, 0 đã vào
 * đích"), trả lời được câu *còn mấy thùng chưa xong* mà không trả lời được câu
 * người chơi thật sự cần: **đi hướng nào**. Phản hồi UX 2026-09 (F-03), nguyên văn
 * một người dùng chỉ bàn phím: *"nếu tôi thật sự dùng trình đọc màn hình mà không
 * nhìn được hình, tôi sẽ đi mò hoàn toàn mù, không biết hướng nào có tường hướng
 * nào trống."*
 *
 * Nên bản này kể **vị trí** của những thứ di chuyển được hoặc phải đi tới — người
 * chơi, thùng, đích — và không kể tường. Tường là phần còn lại của bàn cờ, và kể
 * chúng là quay về đúng cái bẫy 144 ô.
 */
export function boardLabel(state: LevelState): string {
  const { board, boxes, player } = state;

  const done = boxes.filter((box) => isGoal(board, box));
  const pending = boxes.filter((box) => !isGoal(board, box));
  const emptyGoals = board.goals.filter((goal) => !boxes.includes(goal));

  const parts = [
    `Bàn cờ ${board.width} trên ${board.height}`,
    `Bạn ở ${at(player, board.width)}`,
    ...pending.map((box) => `Thùng ở ${at(box, board.width)}`),
    ...done.map((box) => `Thùng đã vào đích ở ${at(box, board.width)}`),
    ...emptyGoals.map((goal) => `Đích trống ở ${at(goal, board.width)}`),
    `${done.length} trên ${boxes.length} thùng đã vào đích`
  ];

  return `${parts.join(". ")}.`;
}

/** Cột và hàng đếm **từ 1** — người đọc đếm từ một, chỉ code mới đếm từ không. */
function at(index: CellIndex, boardWidth: number): string {
  const column = (index % boardWidth) + 1;
  const row = Math.floor(index / boardWidth) + 1;
  return `cột ${column} hàng ${row}`;
}
