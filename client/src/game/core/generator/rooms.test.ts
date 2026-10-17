import { describe, expect, it } from "vitest";

import { createRng } from "../rng";
import type { DifficultyProfile } from "../types";
import {
  BASE_ROOM_TEMPLATES,
  ROOM_SIZE,
  ROOM_TEMPLATES,
  buildBoard,
  floorCells,
  isFloorConnected,
  minFloorArea
} from "./rooms";

/** Khuôn nhỏ để test chạy nhanh; các số khác không ảnh hưởng `buildBoard`. */
function profile(cols: number, rows: number, boxes: number): DifficultyProfile {
  return {
    difficulty: "medium",
    rooms: { cols, rows },
    boxes,
    minPushes: 1,
    maxPushes: 999,
    maxNodes: 1
  };
}

/** Dựng cho tới khi ra bàn cờ — `buildBoard` được phép từ chối ứng viên xấu. */
function buildWithSeed(seed: number, spec: DifficultyProfile) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const board = buildBoard(createRng(seed + attempt * 7919), spec);
    if (board) return board;
  }
  throw new Error("Không dựng nổi bàn cờ nào sau 40 lần thử");
}

describe("thư viện phòng mẫu", () => {
  it("mọi mẫu đều đúng 3×3 và chỉ gồm tường với sàn", () => {
    for (const template of ROOM_TEMPLATES) {
      expect(template.rows).toHaveLength(ROOM_SIZE);
      for (const row of template.rows) {
        expect(row).toHaveLength(ROOM_SIZE);
        expect(row).toMatch(/^[# ]+$/);
      }
      expect(template.weight).toBeGreaterThan(0);
    }
  });

  it("xoay ra nhiều mẫu hơn bộ gốc và không có mẫu nào trùng nhau", () => {
    expect(BASE_ROOM_TEMPLATES.length).toBeGreaterThanOrEqual(12);
    // Ngưỡng 30 là cái chuông báo: hai hình gốc trùng quỹ đạo xoay nhau thì bộ mẫu
    // teo lại mà `buildBoard` vẫn chạy ngon lành, chỉ là bản đồ nghèo hình đi.
    expect(ROOM_TEMPLATES.length).toBeGreaterThanOrEqual(30);

    const shapes = new Set(ROOM_TEMPLATES.map((template) => template.rows.join("/")));
    expect(shapes.size).toBe(ROOM_TEMPLATES.length);
  });
});

describe("buildBoard", () => {
  it("dựng đúng kích thước từ lưới phòng và bọc kín viền tường", () => {
    const spec = profile(3, 2, 3);
    const board = buildWithSeed(1234, spec);

    expect(board.width).toBe(3 * ROOM_SIZE + 2);
    expect(board.height).toBe(2 * ROOM_SIZE + 2);
    expect(board.cells).toHaveLength(board.width * board.height);

    for (let x = 0; x < board.width; x += 1) {
      expect(board.cells[x]).toBe("wall");
      expect(board.cells[(board.height - 1) * board.width + x]).toBe("wall");
    }
    for (let y = 0; y < board.height; y += 1) {
      expect(board.cells[y * board.width]).toBe("wall");
      expect(board.cells[y * board.width + board.width - 1]).toBe("wall");
    }
  });

  it("sàn luôn là một vùng liên thông duy nhất", () => {
    for (let seed = 0; seed < 25; seed += 1) {
      const board = buildBoard(createRng(9000 + seed), profile(3, 3, 4));
      if (!board) continue;
      expect(isFloorConnected(board)).toBe(true);
    }
  });

  it("không để lại ô cụt nào", () => {
    for (let seed = 0; seed < 25; seed += 1) {
      const board = buildBoard(createRng(31_000 + seed), profile(3, 3, 4));
      if (!board) continue;

      for (const cell of floorCells(board)) {
        const x = cell % board.width;
        const y = Math.floor(cell / board.width);
        const around = [
          x > 0 ? cell - 1 : -1,
          x < board.width - 1 ? cell + 1 : -1,
          y > 0 ? cell - board.width : -1,
          y < board.height - 1 ? cell + board.width : -1
        ].filter((index) => index >= 0 && board.cells[index] !== "wall");
        expect(around.length).toBeGreaterThan(1);
      }
    }
  });

  it("sàn không bao giờ hẹp hơn mức tối thiểu cho số thùng yêu cầu", () => {
    const spec = profile(3, 3, 5);
    for (let seed = 0; seed < 25; seed += 1) {
      const board = buildBoard(createRng(555 + seed), spec);
      if (!board) continue;
      expect(floorCells(board).length).toBeGreaterThanOrEqual(minFloorArea(spec.boxes));
    }
  });

  it("chưa gán đích nào — chọn đích là việc của bước đi lùi", () => {
    const board = buildWithSeed(77, profile(2, 2, 2));
    expect(board.goals).toEqual([]);
    expect(board.cells).not.toContain("goal");
  });

  it("cùng seed cho ra đúng một bàn cờ", () => {
    const spec = profile(3, 2, 3);
    const first = buildBoard(createRng(20260904), spec);
    const second = buildBoard(createRng(20260904), spec);

    expect(second).toEqual(first);
  });

  it("từ chối lưới quá nhỏ so với số thùng thay vì trả bàn cờ chật", () => {
    // Lưới 2×2 có nhiều nhất 36 ô sàn, không đủ chỗ cho 20 thùng.
    for (let seed = 0; seed < 10; seed += 1) {
      expect(buildBoard(createRng(seed), profile(2, 2, 20))).toBeNull();
    }
  });
});
