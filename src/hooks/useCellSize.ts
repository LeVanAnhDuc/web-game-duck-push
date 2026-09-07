"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Cạnh ô bàn cờ, tính từ chỗ trống thật sự còn lại trên màn hình.
 *
 * Bàn cờ **không bao giờ cuộn** (MASTER.md §Anti-Patterns), nên cạnh ô là biến
 * phụ thuộc, không phải hằng số thiết kế. Phần tử được đo phải là một khung có
 * kích thước độc lập với bàn cờ (bàn cờ nằm trong nó ở chế độ `absolute`), nếu
 * không thì đo — vẽ — đo sẽ thành vòng lặp không dừng.
 */

/** Sàn cứng: dưới mức này ngón tay không bấm nổi và mắt không đọc ra hình. */
export const MIN_CELL = 24;
/** Trần: bàn 5×5 trên màn hình 27" mà ô to bằng nắm tay thì nhìn rất kỳ. */
export const MAX_CELL = 56;

export function useCellSize(
  ref: RefObject<HTMLElement | null>,
  columns: number,
  rows: number
): number {
  const [cell, setCell] = useState(MIN_CELL);

  useEffect(() => {
    const element = ref.current;
    if (!element || columns <= 0 || rows <= 0) return;

    const measure = () => {
      // Trừ padding: `clientWidth` vẫn tính cả phần đệm, mà bàn cờ không được
      // tràn vào đó — tràn thì ô sát mép màn hình, bấm hụt là chuyện thường.
      const style = window.getComputedStyle(element);
      const width =
        element.clientWidth -
        (Number.parseFloat(style.paddingLeft) || 0) -
        (Number.parseFloat(style.paddingRight) || 0);
      const height =
        element.clientHeight -
        (Number.parseFloat(style.paddingTop) || 0) -
        (Number.parseFloat(style.paddingBottom) || 0);

      if (width <= 0 || height <= 0) return;
      const raw = Math.floor(Math.min(width / columns, height / rows));
      setCell(Math.max(MIN_CELL, Math.min(MAX_CELL, raw)));
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, columns, rows]);

  return cell;
}
