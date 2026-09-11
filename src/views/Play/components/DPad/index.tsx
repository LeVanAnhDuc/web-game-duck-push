"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import type { Direction } from "@/game/core/types";

/**
 * Bàn phím hướng — **chỉ vẽ trên thiết bị chạm**.
 *
 * Trên máy tính nó chiếm chỗ mà không ai bấm: đã có phím mũi tên. Nơi gọi quyết
 * định bằng `pointer: coarse`, chứ không đoán theo bề ngang màn hình.
 */

const KEYS: readonly {
  readonly direction: Direction;
  readonly label: string;
  readonly Icon: typeof ArrowUp;
  readonly area: string;
}[] = [
  { direction: "up", label: "Đi lên", Icon: ArrowUp, area: "up" },
  { direction: "left", label: "Sang trái", Icon: ArrowLeft, area: "left" },
  { direction: "right", label: "Sang phải", Icon: ArrowRight, area: "right" },
  { direction: "down", label: "Đi xuống", Icon: ArrowDown, area: "down" }
];

export function DPad({ onMove }: { readonly onMove: (direction: Direction) => void }) {
  return (
    <div
      className="grid justify-center gap-1"
      style={{
        // Hai hàng: lên ở giữa hàng trên, trái–xuống–phải ở hàng dưới.
        gridTemplateAreas: '". up ." "left down right"',
        gridTemplateColumns: "repeat(3, 56px)"
      }}
    >
      {KEYS.map(({ direction, label, Icon, area }) => (
        <button
          key={direction}
          type="button"
          aria-label={label}
          onClick={() => onMove(direction)}
          style={{ gridArea: area }}
          className="dpad-key flex cursor-pointer items-center justify-center border border-[var(--color-border)] bg-[var(--color-card)] transition-colors duration-150 ease-out active:bg-[var(--color-background)]"
        >
          <Icon aria-hidden="true" size={22} />
        </button>
      ))}
    </div>
  );
}
