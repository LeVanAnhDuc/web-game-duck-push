import { describe, expect, it } from "vitest";

import { DIFFICULTIES, type Difficulty } from "../types";
import {
  buildBudget,
  buildProfile,
  classify,
  profileFor,
  runtimeBudget,
  runtimeProfile
} from "./difficulty";

/** Kích thước bàn cờ suy ra từ lưới phòng — xem `ROOM_SIZE` trong `rooms.ts`. */
function boardArea(rooms: { cols: number; rows: number }): number {
  return (rooms.cols * 3 + 2) * (rooms.rows * 3 + 2);
}

const ORDER: Readonly<Record<Difficulty, number>> = { easy: 0, medium: 1, hard: 2, expert: 3 };

describe("khuôn bậc khó", () => {
  it("khuôn chuẩn chính là khuôn build và tự khai đúng bậc của mình", () => {
    for (const difficulty of DIFFICULTIES) {
      const base = profileFor(difficulty);
      expect(base.difficulty).toBe(difficulty);
      expect(runtimeProfile(difficulty).difficulty).toBe(difficulty);
      expect(buildProfile(difficulty)).toEqual({
        ...base,
        maxAttempts: buildProfile(difficulty).maxAttempts
      });
    }
  });

  it("khuôn runtime nhỏ hơn hẳn khuôn build ở mọi bậc", () => {
    for (const difficulty of DIFFICULTIES) {
      const build = buildProfile(difficulty);
      const runtime = runtimeProfile(difficulty);

      // Bàn nhỏ hơn thật sự, không chỉ bằng.
      expect(boardArea(runtime.rooms)).toBeLessThan(boardArea(build.rooms));
      expect(runtime.rooms.cols).toBeLessThanOrEqual(build.rooms.cols);
      expect(runtime.rooms.rows).toBeLessThanOrEqual(build.rooms.rows);
      expect(runtime.boxes).toBeLessThanOrEqual(build.boxes);
      expect(runtime.minPushes).toBeLessThanOrEqual(build.minPushes);
      expect(runtime.maxPushes).toBeLessThanOrEqual(build.maxPushes);
      expect(runtime.maxNodes).toBeLessThan(build.maxNodes);
      // Người chơi đang chờ: vứt ít ứng viên hơn hẳn lúc build.
      expect(runtime.maxAttempts).toBeLessThan(build.maxAttempts);
    }
  });

  it("trần bàn cờ runtime là 8×8 đúng như ADR-0003", () => {
    for (const difficulty of DIFFICULTIES) {
      const { rooms } = runtimeProfile(difficulty);
      expect(rooms.cols * 3 + 2).toBeLessThanOrEqual(8);
      expect(rooms.rows * 3 + 2).toBeLessThanOrEqual(8);
    }
  });

  it("bậc càng cao thì khuôn càng nặng, không bậc nào tụt lùi", () => {
    for (let i = 1; i < DIFFICULTIES.length; i += 1) {
      const previous = buildProfile(DIFFICULTIES[i - 1]!);
      const current = buildProfile(DIFFICULTIES[i]!);

      expect(current.boxes).toBeGreaterThanOrEqual(previous.boxes);
      expect(current.minPushes).toBeGreaterThanOrEqual(previous.minPushes);
      expect(current.maxPushes).toBeGreaterThanOrEqual(previous.maxPushes);
      expect(boardArea(current.rooms)).toBeGreaterThanOrEqual(boardArea(previous.rooms));
    }
  });

  it("khoảng số đẩy của mọi khuôn đều dương và có bề rộng", () => {
    for (const difficulty of DIFFICULTIES) {
      for (const p of [buildProfile(difficulty), runtimeProfile(difficulty)]) {
        expect(p.minPushes).toBeGreaterThan(0);
        expect(p.maxPushes).toBeGreaterThan(p.minPushes);
        expect(p.boxes).toBeGreaterThanOrEqual(2);
        expect(p.maxAttempts).toBeGreaterThan(0);
      }
    }
  });
});

describe("ngân sách solver", () => {
  it("ngân sách runtime bám sát 300ms và chặt hơn hẳn ngân sách build", () => {
    for (const difficulty of DIFFICULTIES) {
      const build = buildBudget(difficulty);
      const runtime = runtimeBudget(difficulty);

      expect(runtime.maxMillis).toBeLessThanOrEqual(300);
      expect(runtime.maxNodes).toBeLessThan(build.maxNodes);
      expect(runtime.maxMillis).toBeLessThan(build.maxMillis);
    }
  });

  it("trần nút của khuôn nằm trong ngân sách solver, kẻo cái ngưỡng thành vô nghĩa", () => {
    for (const difficulty of DIFFICULTIES) {
      expect(buildProfile(difficulty).maxNodes).toBeLessThanOrEqual(
        buildBudget(difficulty).maxNodes
      );
      expect(runtimeProfile(difficulty).maxNodes).toBeLessThanOrEqual(
        runtimeBudget(difficulty).maxNodes
      );
    }
  });
});

describe("classify", () => {
  it("đơn điệu theo số đẩy: thêm đẩy không bao giờ xuống bậc dễ hơn", () => {
    for (const boxes of [2, 3, 4, 5, 6]) {
      for (const nodes of [0, 1, 500, 50_000, 900_000]) {
        let previous = -1;
        for (let pushes = 0; pushes <= 200; pushes += 1) {
          const rank = ORDER[classify({ pushes, boxes, nodes })];
          expect(rank).toBeGreaterThanOrEqual(previous);
          previous = rank;
        }
      }
    }
  });

  it("đơn điệu theo số thùng và số nút nữa", () => {
    for (const pushes of [4, 20, 40, 70]) {
      let byBoxes = -1;
      for (let boxes = 1; boxes <= 8; boxes += 1) {
        const rank = ORDER[classify({ pushes, boxes, nodes: 1_000 })];
        expect(rank).toBeGreaterThanOrEqual(byBoxes);
        byBoxes = rank;
      }

      let byNodes = -1;
      for (const nodes of [0, 10, 1_000, 20_000, 400_000]) {
        const rank = ORDER[classify({ pushes, boxes: 3, nodes })];
        expect(rank).toBeGreaterThanOrEqual(byNodes);
        byNodes = rank;
      }
    }
  });

  it("chạm được cả bốn bậc", () => {
    expect(classify({ pushes: 6, boxes: 2, nodes: 40 })).toBe("easy");
    expect(classify({ pushes: 22, boxes: 3, nodes: 2_000 })).toBe("medium");
    expect(classify({ pushes: 30, boxes: 4, nodes: 40_000 })).toBe("hard");
    expect(classify({ pushes: 90, boxes: 5, nodes: 300_000 })).toBe("expert");
  });
});
