"use client";

import clsx from "clsx";
import { cellTransform } from "./geometry";
import type { CellIndex } from "@/game/core/types";

/**
 * Thùng: khối vuông đặc, có viền đậm và **thanh giằng chéo**.
 *
 * Thùng đã vào đích không chỉ đổi màu (amber → teal) mà còn có thêm **dấu tích**
 * khắc chìm bên trong. Đổi màu không thôi là vi phạm luật cứng của hệ thiết kế:
 * hai màu này cùng độ sáng, in đen trắng ra là một.
 */
export function CrateSprite({
  index,
  boardWidth,
  cell,
  onGoal
}: {
  readonly index: CellIndex;
  readonly boardWidth: number;
  readonly cell: number;
  readonly onGoal: boolean;
}) {
  const inset = Math.max(2, Math.round(cell * 0.07));
  const edge = Math.max(2, Math.round(cell * 0.08));
  const fill = onGoal ? "var(--board-crate-done)" : "var(--board-crate)";
  const stroke = onGoal ? "var(--board-crate-done-edge)" : "var(--board-crate-edge)";

  return (
    <div
      className="cell-sprite"
      style={{ width: cell, height: cell, transform: cellTransform(index, boardWidth, cell) }}
      aria-hidden="true"
    >
      <div
        // Nhún nhẹ một nhịp 180ms lúc thùng ngồi vào đích; reduced-motion tắt hẳn.
        className={clsx(
          "flex h-full w-full items-center justify-center",
          onGoal && "crate-done-pop"
        )}
        style={{ padding: inset }}
      >
        <div
          className="relative h-full w-full"
          style={{
            background: fill,
            border: `${edge}px solid ${stroke}`,
            borderRadius: "var(--radius-sm)"
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            focusable="false"
          >
            {onGoal ? (
              // Dấu tích khắc chìm — tín hiệu hình dạng cho "đã xong".
              <path
                d="M6 12.5 L10.2 17 L18 8"
                fill="none"
                stroke={stroke}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              // Thanh giằng chéo — tín hiệu hình dạng cho "thùng chưa vào đích".
              <>
                <path
                  d="M0 0 L24 24"
                  stroke={stroke}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M24 0 L0 24"
                  stroke={stroke}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
