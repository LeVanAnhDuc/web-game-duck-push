import type { CellIndex, Direction } from "@/game/core/types";

/**
 * Đổi chỉ số phẳng của lõi thành toạ độ pixel của tầng vẽ, và ngược lại.
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

/**
 * Chiều ngược lại: một điểm bấm (toạ độ **trong** bàn cờ) thành chỉ số ô.
 *
 * Trả `null` khi điểm rơi ra ngoài bàn. Không kẹp về ô gần nhất — một cú bấm hụt
 * ra ngoài mép phải mà thành nước đi sang phải là nước đi người chơi không hề nhắm
 * tới, và trong Sokoban một nước thừa có thể hỏng cả màn.
 */
export function cellFromPoint(
  px: number,
  py: number,
  cell: number,
  boardWidth: number,
  boardHeight: number
): CellIndex | null {
  if (!Number.isFinite(cell) || cell <= 0) return null;
  if (px < 0 || py < 0) return null;

  const x = Math.floor(px / cell);
  const y = Math.floor(py / cell);
  if (x >= boardWidth || y >= boardHeight) return null;

  return y * boardWidth + x;
}

/**
 * Hướng đi từ ô `from` sang ô `to`, **chỉ khi** hai ô kề nhau theo bốn hướng.
 *
 * Đây là toàn bộ luật của thao tác "bấm vào ô cạnh nhân vật để đi": nó ánh xạ
 * 1-1 với một lần bấm phím mũi tên, không phải tìm đường. Một bước, không hơn.
 *
 * Phép so hàng là phần dễ quên: index `4` (cuối dòng 0) và `5` (đầu dòng 1) lệch
 * nhau đúng 1 nhưng nằm hai đầu bàn cờ. Nhận nhầm chúng là kề nhau thì một cú bấm
 * ở mép trái sẽ ném nhân vật sang mép phải.
 */
export function stepDirection(
  from: CellIndex,
  to: CellIndex,
  boardWidth: number
): Direction | null {
  if (from === to) return null;

  const fromRow = Math.floor(from / boardWidth);
  const toRow = Math.floor(to / boardWidth);

  if (fromRow === toRow) {
    if (to === from - 1) return "left";
    if (to === from + 1) return "right";
    return null;
  }

  if (to === from - boardWidth) return "up";
  if (to === from + boardWidth) return "down";
  return null;
}
