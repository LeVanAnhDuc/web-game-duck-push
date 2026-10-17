"use client";

import { cellTransform } from "@/lib/boardGeometry";
import type { Board, CellIndex } from "@/game/core/types";

/**
 * Ô đích = một **vòng viền**, không bao giờ là ô tô kín.
 *
 * Đích và thùng gần như cùng độ sáng (tỉ số 1.09), nên người mù màu không tách
 * được chúng bằng màu. Hình dạng mới là thứ phân biệt: vòng rỗng là đích, khối
 * đặc là thùng (MASTER.md §"Hard rule").
 */
export function GoalRings({
  board,
  cell,
  occupied
}: {
  readonly board: Board;
  readonly cell: number;
  readonly occupied: ReadonlySet<CellIndex>;
}) {
  const ring = Math.max(2, Math.round(cell * 0.09));

  return (
    <>
      {board.goals.map((goal) =>
        // Có thùng trên đích thì vòng biến mất — dấu tích trên thùng thay lời.
        occupied.has(goal) ? null : (
          <div
            key={goal}
            aria-hidden="true"
            className="absolute top-0 left-0 flex items-center justify-center"
            style={{
              width: cell,
              height: cell,
              transform: cellTransform(goal, board.width, cell)
            }}
          >
            <div
              style={{
                width: "52%",
                height: "52%",
                borderRadius: "9999px",
                border: `${ring}px solid var(--board-goal)`
              }}
            />
          </div>
        )
      )}
    </>
  );
}
