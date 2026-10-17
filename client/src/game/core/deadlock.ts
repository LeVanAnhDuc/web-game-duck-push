import { isGoal, isWall, neighbor } from "./rules";
import { DIRECTIONS, type Board, type CellIndex, type Direction, type LevelState } from "./types";

/**
 * Phát hiện bế tắc — thùng đã hết đường về đích.
 *
 * **Ràng buộc cứng của cả file: không bao giờ được báo bế tắc cho một thế cờ vẫn
 * còn giải được.** Solver và generator tin tuyệt đối vào kết luận ở đây: một cảnh
 * báo sai sẽ cắt mất nhánh chứa lời giải, và generator sẽ vứt đi những màn hoàn
 * toàn hợp lệ — hỏng âm thầm, không có test nào tự nhiên bắt được. Ngược lại, bỏ
 * sót bế tắc chỉ làm solver chậm hơn. Vì vậy mọi luật dưới đây đều chọn phía an
 * toàn: chỉ kết luận khi chứng minh được, còn nghi ngờ thì im lặng.
 */

const OPPOSITE_AXIS: readonly (readonly [Direction, Direction])[] = [
  ["left", "right"],
  ["up", "down"]
];

/**
 * Các ô mà một thùng đứng vào là hỏng vĩnh viễn, tính riêng từ bàn cờ tĩnh.
 *
 * Suy ngược thay vì suy xuôi: thay vì hỏi "đẩy được từ ô này tới đích không",
 * ta *kéo* thùng lùi ra từ mọi đích. Ô nào kéo tới được là ô sống, vì mọi bước
 * kéo đảo ngược lại chính là một bước đẩy hợp lệ. Phép kéo bỏ qua các thùng khác
 * nên kết quả chỉ phụ thuộc tường và đích — nhờ vậy tính đúng một lần cho cả ván,
 * và cũng vì vậy nó chỉ *thiếu* chứ không bao giờ *thừa*.
 */
export function computeDeadSquares(board: Board): ReadonlySet<CellIndex> {
  const live = new Set<CellIndex>();
  const queue: CellIndex[] = [];

  for (const goal of board.goals) {
    if (live.has(goal)) continue;
    live.add(goal);
    queue.push(goal);
  }

  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined) break;

    for (const direction of DIRECTIONS) {
      // Kéo thùng từ `current` theo `direction`: thùng sang ô `behind`, người
      // chơi lùi tiếp sang `beyond`. Thiếu một trong hai ô thì không kéo được.
      const behind = neighbor(board, current, direction);
      if (behind === null || isWall(board, behind)) continue;
      const beyond = neighbor(board, behind, direction);
      if (beyond === null || isWall(board, beyond)) continue;

      if (live.has(behind)) continue;
      live.add(behind);
      queue.push(behind);
    }
  }

  const dead = new Set<CellIndex>();
  for (let index = 0; index < board.cells.length; index += 1) {
    if (board.cells[index] === "wall") continue;
    if (!live.has(index)) dead.add(index);
  }
  return dead;
}

/**
 * `box` có bị khoá theo trục này không — tức là không thể nhúc nhích theo trục ấy
 * trong *bất kỳ* diễn biến nào còn dẫn tới thắng.
 *
 * Ba lý do đều an toàn:
 *  - Tường ở một trong hai đầu: đẩy về phía tường là bất hợp lệ, đẩy về phía kia
 *    cần người chơi đứng đúng trong tường. Trục coi như bị hàn chặt.
 *  - Cả hai đầu đều là ô chết: đẩy được, nhưng đẩy xong thùng vĩnh viễn mất đích.
 *    Không có lời giải nào đi qua nước đó.
 *  - Đầu kia là một thùng đã bị đóng băng: thùng ấy không rời chỗ trong bất kỳ
 *    lời giải nào, nên với `box` nó không khác gì tường.
 */
function isBlockedOnAxis(
  state: LevelState,
  boxSet: ReadonlySet<CellIndex>,
  deadSquares: ReadonlySet<CellIndex>,
  box: CellIndex,
  axis: readonly [Direction, Direction],
  visited: Set<CellIndex>
): boolean {
  const { board } = state;
  const [first, second] = axis;
  const a = neighbor(board, box, first);
  const b = neighbor(board, box, second);

  if (a === null || isWall(board, a)) return true;
  if (b === null || isWall(board, b)) return true;
  if (deadSquares.has(a) && deadSquares.has(b)) return true;

  if (boxSet.has(a) && isBoxFrozen(state, boxSet, deadSquares, a, visited)) return true;
  if (boxSet.has(b) && isBoxFrozen(state, boxSet, deadSquares, b, visited)) return true;

  return false;
}

/**
 * Luật đóng băng cổ điển: khoá cả trục ngang lẫn trục dọc thì thùng chết cứng.
 *
 * `visited` vừa là bộ chống lặp vô hạn, vừa là một giả định có ý nghĩa: khi đang
 * xét `box`, ta tạm coi nó bất động để hỏi hàng xóm. Nếu hàng xóm cũng chỉ bất
 * động *nhờ* giả định ấy thì hai bên chặn lẫn nhau — muốn dịch cái này phải dịch
 * cái kia trước, quẩn vô tận, nên cả cụm thật sự không nhúc nhích được. Nếu cuối
 * cùng `box` hoá ra vẫn đi được, phải gỡ dấu ra để giả định sai không rò rỉ sang
 * các nhánh xét sau.
 */
function isBoxFrozen(
  state: LevelState,
  boxSet: ReadonlySet<CellIndex>,
  deadSquares: ReadonlySet<CellIndex>,
  box: CellIndex,
  visited: Set<CellIndex>
): boolean {
  if (visited.has(box)) return true;
  visited.add(box);

  const frozen = OPPOSITE_AXIS.every((axis) =>
    isBlockedOnAxis(state, boxSet, deadSquares, box, axis, visited)
  );

  if (!frozen) visited.delete(box);
  return frozen;
}

/**
 * Những thùng không còn cơ hội về đích.
 *
 * Thùng đang *đứng trên đích* không bao giờ bị kể tên, kể cả khi nó kẹt cứng: đó
 * là một thùng đã xong việc, không phải một vấn đề. Nhầm chỗ này thì mọi màn có
 * đích nằm ở góc đều bị coi là bế tắc ngay từ nước đặt thùng cuối cùng.
 */
export function findFrozenBoxes(
  state: LevelState,
  deadSquares: ReadonlySet<CellIndex>
): CellIndex[] {
  const { board, boxes } = state;
  const boxSet = new Set(boxes);
  const stuck: CellIndex[] = [];

  for (const box of boxes) {
    if (isGoal(board, box)) continue;
    // Ô chết đã đủ kết luận, khỏi cần chạy đệ quy đóng băng.
    if (deadSquares.has(box)) {
      stuck.push(box);
      continue;
    }
    if (isBoxFrozen(state, boxSet, deadSquares, box, new Set<CellIndex>())) stuck.push(box);
  }

  return stuck;
}

/** Có ít nhất một thùng hỏng ⇒ ván không thể thắng nữa. */
export function isDeadlocked(state: LevelState, deadSquares: ReadonlySet<CellIndex>): boolean {
  return findFrozenBoxes(state, deadSquares).length > 0;
}
