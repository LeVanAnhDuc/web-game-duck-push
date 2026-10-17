"use client";

import { cellTransform } from "@/lib/boardGeometry";
import type { CellIndex } from "@/game/core/types";

/**
 * Người chơi: bóng người đầu tròn, **không bao giờ là ô vuông**.
 *
 * Bàn cờ toàn khối vuông (tường, thùng), nên hình tròn + vai xuôi là thứ duy nhất
 * người chơi nhận ra ngay cả khi nhìn lướt hoặc khi bản in mất hết màu.
 */
export function PlayerSprite({
  index,
  boardWidth,
  cell
}: {
  readonly index: CellIndex;
  readonly boardWidth: number;
  readonly cell: number;
}) {
  return (
    <div
      className="cell-sprite"
      style={{ width: cell, height: cell, transform: cellTransform(index, boardWidth, cell) }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-full w-full" focusable="false">
        <circle cx="12" cy="7.4" r="4.1" fill="var(--board-player)" />
        <path d="M4.6 20.5c0-4.3 3.3-7.4 7.4-7.4s7.4 3.1 7.4 7.4z" fill="var(--board-player)" />
      </svg>
    </div>
  );
}
