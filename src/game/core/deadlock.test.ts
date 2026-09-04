import { describe, expect, it } from "vitest";

import { computeDeadSquares, findFrozenBoxes, isDeadlocked } from "./deadlock";
import { parseXsb } from "./level";
import type { CellIndex, LevelState } from "./types";

/** Toạ độ người đọc được → chỉ số phẳng. Fixture viết bằng XSB nên (x, y) dễ đối chiếu hơn. */
function cell(state: LevelState, x: number, y: number): CellIndex {
  return y * state.board.width + x;
}

describe("computeDeadSquares", () => {
  const room = parseXsb([
    "#########",
    "#@      #",
    "#   .   #",
    "#   $   #",
    "#       #",
    "#########"
  ]);

  it("đánh dấu bốn góc phòng là ô chết", () => {
    const dead = computeDeadSquares(room.board);

    expect(dead.has(cell(room, 1, 1))).toBe(true);
    expect(dead.has(cell(room, 7, 1))).toBe(true);
    expect(dead.has(cell(room, 1, 4))).toBe(true);
    expect(dead.has(cell(room, 7, 4))).toBe(true);
  });

  it("đánh dấu cả dải sát tường khi trên tường đó không có đích nào", () => {
    const dead = computeDeadSquares(room.board);

    // Thùng nằm sát tường trên chỉ trượt ngang được; hàng y = 1 không có đích nào.
    for (let x = 1; x <= 7; x += 1) {
      expect(dead.has(cell(room, x, 1))).toBe(true);
    }
    // Cột sát tường trái cũng vậy.
    for (let y = 1; y <= 4; y += 1) {
      expect(dead.has(cell(room, 1, y))).toBe(true);
    }
  });

  it("không bao giờ coi ô đích là ô chết", () => {
    const levels = [
      room,
      parseXsb(["#####", "#$  #", "#@ .#", "#####"]),
      parseXsb(["#######", "#@$.  #", "#######"]),
      parseXsb(["########", "#. $$  #", "#  @   #", "#  .   #", "########"])
    ];

    for (const level of levels) {
      const dead = computeDeadSquares(level.board);
      for (const goal of level.board.goals) {
        expect(dead.has(goal)).toBe(false);
      }
    }
  });

  it("giữ ô sống cho những chỗ thùng vẫn đẩy về đích được", () => {
    const dead = computeDeadSquares(room.board);

    expect(dead.has(cell(room, 4, 2))).toBe(false); // ô đích
    expect(dead.has(cell(room, 4, 3))).toBe(false); // chỗ thùng đang đứng
    expect(dead.has(cell(room, 3, 3))).toBe(false);
  });
});

describe("findFrozenBoxes", () => {
  it("báo thùng bị đẩy vào góc", () => {
    const state = parseXsb(["#######", "#$@ $ #", "#  .. #", "#######"]);
    const dead = computeDeadSquares(state.board);

    expect(findFrozenBoxes(state, dead)).toContain(cell(state, 1, 1));
    expect(isDeadlocked(state, dead)).toBe(true);
  });

  it("báo hai thùng sát nhau tựa tường vì chúng khoá lẫn nhau", () => {
    // Có đích trên hàng y = 1 nên hai ô thùng đang đứng đều là ô *sống* —
    // kết luận chỉ có thể đến từ luật đóng băng đệ quy, không phải từ ô chết.
    const state = parseXsb(["########", "#. $$  #", "#  @   #", "#  .   #", "########"]);
    const dead = computeDeadSquares(state.board);

    expect(dead.has(cell(state, 3, 1))).toBe(false);
    expect(dead.has(cell(state, 4, 1))).toBe(false);

    const frozen = findFrozenBoxes(state, dead);
    expect(frozen).toEqual([cell(state, 3, 1), cell(state, 4, 1)]);
  });

  it("không kể tên thùng đã nằm trên đích dù nó kẹt cứng", () => {
    // Thùng ở (1,1) là góc tường: đóng băng hoàn toàn — nhưng nó đứng trên đích,
    // tức là đã xong việc, không phải sự cố.
    const state = parseXsb(["#######", "#*@ $ #", "#   . #", "#######"]);
    const dead = computeDeadSquares(state.board);

    expect(findFrozenBoxes(state, dead)).toEqual([]);
    expect(isDeadlocked(state, dead)).toBe(false);
  });

  it("im lặng trên một màn còn nguyên và giải được", () => {
    const state = parseXsb(["#####", "#@  #", "# $ #", "#  .#", "#####"]);
    const dead = computeDeadSquares(state.board);

    expect(findFrozenBoxes(state, dead)).toEqual([]);
    expect(isDeadlocked(state, dead)).toBe(false);
  });

  it("im lặng trên phòng trống nhiều đường đi", () => {
    const state = parseXsb([
      "#########",
      "#       #",
      "# $$$   #",
      "# @     #",
      "#  ...  #",
      "#       #",
      "#########"
    ]);
    const dead = computeDeadSquares(state.board);

    expect(isDeadlocked(state, dead)).toBe(false);
  });
});
