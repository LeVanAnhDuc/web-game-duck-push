"use client";

import { memo } from "react";
import type { Board } from "@/game/core/types";

/**
 * Lớp nền: tường và sàn. Không đổi trong suốt ván nên được `memo` — mỗi nước đi
 * chỉ vẽ lại người chơi và một thùng, không phải cả 144 ô.
 *
 * Ô đích cũng vẽ nền sàn ở đây; cái vòng tròn đánh dấu đích nằm ở lớp riêng phía
 * trên, vì nó biến mất khi có thùng đè lên.
 */
export const StaticGrid = memo(function StaticGrid({
  board,
  cell
}: {
  readonly board: Board;
  readonly cell: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${board.width}, ${cell}px)`,
        gridTemplateRows: `repeat(${board.height}, ${cell}px)`
      }}
    >
      {board.cells.map((type, index) => (
        <div
          key={index}
          style={
            type === "wall"
              ? { background: "var(--board-wall)" }
              : {
                  background: "var(--board-floor)",
                  // Kẻ ô bằng viền trong: không chiếm chỗ nên lưới không lệch 1px.
                  boxShadow: "inset 0 0 0 1px var(--board-line)"
                }
          }
        />
      ))}
    </div>
  );
});
