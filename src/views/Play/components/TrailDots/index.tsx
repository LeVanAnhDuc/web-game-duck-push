"use client";

import { cellTransform } from "@/lib/boardGeometry";
import { TRAIL_LENGTH } from "@/game/session/types";
import type { CellIndex } from "@/game/core/types";

/**
 * Nét đặc trưng của game: 12 ô vừa đi qua đọng lại thành vệt chấm mờ dần.
 *
 * Không phải trang trí. Sokoban là câu chuyện về con đường đã đi, còn hoàn tác là
 * con đường mình tiếc — nhìn thấy vệt là trả lời được "mình hỏng từ chỗ nào" mà
 * không phải chơi lại cả ván trong đầu.
 *
 * Độ mờ tính theo **chỉ số bước**, không theo thời gian, nên dưới
 * `prefers-reduced-motion` vệt vẫn y nguyên — tĩnh, không có gì nhấp nháy.
 */

/** Đỉnh độ mờ, theo MASTER.md §"Signature element". */
const MAX_OPACITY = 0.28;

export function TrailDots({
  trail,
  boardWidth,
  cell
}: {
  readonly trail: readonly CellIndex[];
  readonly boardWidth: number;
  readonly cell: number;
}) {
  // Phần tử cuối là ô người chơi đang đứng — người che mất chấm, vẽ cũng bằng thừa.
  const past = trail.slice(0, -1);
  if (past.length === 0) return null;

  const dot = Math.max(4, Math.round(cell * 0.22));

  return (
    <>
      {past.map((index, i) => {
        // i càng lớn càng mới; bước cũ nhất mờ hẳn về 0.
        const age = past.length - i;
        const opacity = MAX_OPACITY * Math.max(0, 1 - age / TRAIL_LENGTH);
        if (opacity <= 0.01) return null;

        return (
          <div
            key={`${index}-${i}`}
            aria-hidden="true"
            className="absolute top-0 left-0 flex items-center justify-center"
            style={{ width: cell, height: cell, transform: cellTransform(index, boardWidth, cell) }}
          >
            <div
              style={{
                width: dot,
                height: dot,
                borderRadius: "9999px",
                background: "var(--color-accent)",
                opacity
              }}
            />
          </div>
        );
      })}
    </>
  );
}
