import type { CellIndex } from "@/game/core/types";

/**
 * Đổi chỉ số phẳng của lõi thành toạ độ pixel của tầng vẽ.
 *
 * Lõi game chỉ biết `index = y * width + x` (bất biến của `core/`), nên phép đổi
 * này là biên giới duy nhất giữa hai cách nghĩ. Dùng `translate3d` chứ không phải
 * `left/top` để trình duyệt chỉ hợp thành lại chứ không tính lại bố cục — bàn cờ
 * 12×12 có tới 144 ô và mỗi nước đi chỉ được phép động vào một hai phần tử.
 */
export function cellTransform(index: CellIndex, boardWidth: number, cell: number): string {
  const x = index % boardWidth;
  const y = Math.floor(index / boardWidth);
  return `translate3d(${x * cell}px, ${y * cell}px, 0)`;
}
