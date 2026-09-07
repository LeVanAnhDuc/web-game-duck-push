import { describe, expect, it } from "vitest";

import { parseXsb, validateState } from "../level";
import { createRng } from "../rng";
import { isSolved } from "../rules";
import { solutionIsValid, solve } from "../solver";
import type { Board, DifficultyProfile, LevelState, SolverBudget, StaticCell } from "../types";
import { availablePulls, lowerBoundPushes, placeBoxes } from "./reverse";
import { buildBoard } from "./rooms";

const BUDGET: SolverBudget = { maxNodes: 60_000, maxMillis: 5_000 };

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

function buildWithSeed(seed: number, spec: DifficultyProfile): Board {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const board = buildBoard(createRng(seed + attempt * 7919), spec);
    if (board) return board;
  }
  throw new Error("Không dựng nổi bàn cờ nào sau 40 lần thử");
}

/** Bàn cờ tí hon viết tay: một phòng trống 4×3 bọc tường, chưa có đích nào. */
function tinyBoard(): Board {
  const width = 6;
  const height = 5;
  const cells: StaticCell[] = new Array<StaticCell>(width * height).fill("wall");
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) cells[y * width + x] = "floor";
  }
  return { width, height, cells, goals: [] };
}

describe("placeBoxes", () => {
  it("trả về thế cờ hợp lệ theo đúng bất biến của LevelState", () => {
    for (let seed = 0; seed < 12; seed += 1) {
      const spec = profile(3, 2, 3);
      const board = buildWithSeed(1000 + seed * 31, spec);
      const state = placeBoxes(createRng(4000 + seed), board, spec.boxes, 40, {
        clustering: 0.6
      });

      expect(state).not.toBeNull();
      if (!state) continue;

      expect(() => validateState(state)).not.toThrow();
      expect(state.boxes).toHaveLength(spec.boxes);
      expect(state.board.goals).toHaveLength(spec.boxes);
      expect(state.boxes).not.toContain(state.player);
      expect(state.board.cells[state.player]).not.toBe("wall");
    }
  });

  it("giữ mảng thùng sắp tăng dần", () => {
    const spec = profile(3, 3, 4);
    const board = buildWithSeed(2026, spec);
    const state = placeBoxes(createRng(99), board, spec.boxes, 60, { clustering: 0.9 });

    expect(state).not.toBeNull();
    if (!state) return;
    expect([...state.boxes].sort((a, b) => a - b)).toEqual([...state.boxes]);
  });

  it("thế cờ đi lùi ra luôn giải được — đó là cả lý do tồn tại của bước này", () => {
    // Bàn nhỏ, ít thùng, ngân sách rộng: nếu solver nói không giải được ở đây thì đó
    // là lỗi thật, không phải hết giờ.
    let checked = 0;
    for (let seed = 0; seed < 6; seed += 1) {
      const spec = profile(2, 2, 2);
      const board = buildWithSeed(500 + seed * 13, spec);
      const state = placeBoxes(createRng(seed * 977 + 3), board, spec.boxes, 25, {
        clustering: 0.5
      });
      if (!state || isSolved(state)) continue;

      const result = solve(state, BUDGET);
      // `timeout` không kết luận gì (bất biến #15) nên chỉ bắt lỗi ở `unsolvable`.
      expect(result.status).not.toBe("unsolvable");
      if (result.status === "solved") {
        expect(solutionIsValid(state, result.solution)).toBe(true);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("ngân sách kéo bằng 0 trả về đúng trạng thái thắng, không phải rác", () => {
    const board = tinyBoard();
    const state = placeBoxes(createRng(7), board, 2, 0);

    expect(state).not.toBeNull();
    if (!state) return;
    expect(() => validateState(state)).not.toThrow();
    expect(isSolved(state)).toBe(true);
    expect(state.boxes).toEqual([...state.board.goals]);
  });

  it("cùng seed cho ra đúng một thế cờ", () => {
    const spec = profile(3, 2, 3);
    const board = buildWithSeed(31_337, spec);
    const first = placeBoxes(createRng(2468), board, spec.boxes, 45, { clustering: 0.7 });
    const second = placeBoxes(createRng(2468), board, spec.boxes, 45, { clustering: 0.7 });

    expect(second).toEqual(first);
  });

  it("từ chối khi sàn không đủ chỗ cho số thùng yêu cầu", () => {
    expect(placeBoxes(createRng(1), tinyBoard(), 99, 10)).toBeNull();
    expect(placeBoxes(createRng(1), tinyBoard(), 0, 10)).toBeNull();
  });

  it("đích dồn cụm cho cận dưới số đẩy cao hơn hẳn đích rải đều", () => {
    // Đây là quan sát đo được đã định hình cả generator: solver được tự do ghép thùng
    // với đích, nên rải đích ra là tặng cho mỗi thùng một đích ngay cạnh.
    const spec = profile(3, 3, 4);
    let spreadTotal = 0;
    let clusteredTotal = 0;

    for (let seed = 0; seed < 10; seed += 1) {
      const board = buildWithSeed(6100 + seed * 53, spec);
      const loose = placeBoxes(createRng(seed + 1), board, spec.boxes, 90, { clustering: 0 });
      const tight = placeBoxes(createRng(seed + 1), board, spec.boxes, 90, { clustering: 1 });
      if (loose) spreadTotal += lowerBoundPushes(loose);
      if (tight) clusteredTotal += lowerBoundPushes(tight);
    }

    expect(clusteredTotal).toBeGreaterThan(spreadTotal);
  });
});

describe("availablePulls", () => {
  it("chỉ kể những cú kéo mà người chơi thật sự đi tới được", () => {
    // Người chơi bị nhốt bên trái, thùng nằm bên phải bức tường.
    const state: LevelState = parseXsb(["#######", "#@ # .#", "#  #$ #", "#######"]);
    expect(availablePulls(state)).toHaveLength(0);
  });

  it("cần đủ hai ô trống liền nhau phía sau người chơi", () => {
    // Người chơi đứng sát tường: kéo được thùng nhưng không có ô nào để lùi vào.
    const state: LevelState = parseXsb(["####", "#*@#", "####"]);
    expect(availablePulls(state)).toHaveLength(0);

    // Nới hành lang thêm một ô là kéo được, đúng một hướng.
    const roomier: LevelState = parseXsb(["######", "# $@.#", "######"]);
    const pulls = availablePulls(roomier);
    expect(pulls).toHaveLength(1);
    expect(pulls[0]?.direction).toBe("right");
  });
});
