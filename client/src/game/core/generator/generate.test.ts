import { describe, expect, it } from "vitest";

import { levelToPackLevel, packLevelToLevel, validateState } from "../level";
import { isSolved } from "../rules";
import { solutionIsValid, solve } from "../solver";
import type { SolverBudget } from "../types";
import { runtimeBudget, runtimeProfile } from "./difficulty";
import { generateLevel } from "./generate";

/**
 * Test dùng cấu hình **runtime** ở mọi chỗ: bàn 8×8, ngân sách 300ms. Cấu hình build
 * cho ra màn đẹp hơn nhưng một màn bậc Khó tốn hàng chục giây để chấm — cả bộ test
 * này phải chạy xong trong khoảng 30 giây.
 */
const EASY_BUDGET = runtimeBudget("easy");
const EASY_ATTEMPTS = runtimeProfile("easy").maxAttempts;

/** Rộng rãi, chỉ để chấm lại màn đã sinh chứ không phải để sinh. */
const CHECK: SolverBudget = { maxNodes: 300_000, maxMillis: 15_000 };

describe("generateLevel", () => {
  it("sinh ra màn hợp lệ, giải được, và số đẩy khớp khi chấm lại", () => {
    const result = generateLevel({
      seed: 20_260_904,
      difficulty: "easy",
      budget: EASY_BUDGET,
      maxAttempts: EASY_ATTEMPTS
    });

    expect(result).not.toBeNull();
    if (!result) return;

    const { level } = result;
    expect(level.difficulty).toBe("easy");
    expect(level.seed).toBe(20_260_904);
    expect(level.id).toContain("easy");
    expect(result.attempts).toBeLessThan(EASY_ATTEMPTS);

    expect(() => validateState(level.initial)).not.toThrow();
    expect(isSolved(level.initial)).toBe(false);

    // Đây là bất biến #17 thu nhỏ: con số ghi vào màn phải là con số solver nói ra
    // khi chạy lại từ đầu, không phải một con số đã trôi đi lúc nào không biết.
    const fresh = solve(level.initial, CHECK);
    expect(fresh.status).toBe("solved");
    if (fresh.status !== "solved") return;
    expect(fresh.pushes).toBe(level.optimalPushes);
    expect(level.optimalMoves).toBeGreaterThanOrEqual(level.optimalPushes);
    expect(solutionIsValid(level.initial, fresh.solution)).toBe(true);
  });

  it("cùng seed cho ra đúng một màn", () => {
    const options = {
      seed: 424_242,
      difficulty: "medium" as const,
      budget: runtimeBudget("medium"),
      maxAttempts: runtimeProfile("medium").maxAttempts
    };

    const first = generateLevel(options);
    const second = generateLevel(options);

    expect(second).toEqual(first);
    expect(first).not.toBeNull();
  });

  it("seed khác cho ra màn khác", () => {
    const make = (seed: number) =>
      generateLevel({
        seed,
        difficulty: "easy",
        budget: EASY_BUDGET,
        maxAttempts: EASY_ATTEMPTS
      });

    const a = make(11);
    const b = make(9_999);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a?.level.initial).not.toEqual(b?.level.initial);
  });

  it("màn sinh ra sống sót qua vòng XSB — pack ghi ra rồi đọc lại vẫn đúng màn ấy", () => {
    const result = generateLevel({
      seed: 777_001,
      difficulty: "easy",
      budget: EASY_BUDGET,
      maxAttempts: EASY_ATTEMPTS
    });

    expect(result).not.toBeNull();
    if (!result) return;

    const round = packLevelToLevel(levelToPackLevel(result.level));
    expect(round.initial.boxes).toEqual(result.level.initial.boxes);
    expect(round.initial.player).toBe(result.level.initial.player);
    expect(round.optimalPushes).toBe(result.level.optimalPushes);
  });

  it("trả null chứ không treo khi ngân sách không cho phép chấm ứng viên nào", () => {
    const startedAt = Date.now();
    // Ngân sách 0 nút: mọi ứng viên đều `timeout`. Đây đúng là chỗ dễ lẫn `timeout`
    // với `unsolvable` (bất biến #15) — nhầm thì generator vẫn trả null, nên test này
    // canh cái đúng duy nhất kiểm được từ ngoài: nó dừng, và dừng ngay.
    const result = generateLevel({
      seed: 5,
      difficulty: "expert",
      budget: { maxNodes: 0, maxMillis: 0 },
      maxAttempts: 1
    });

    expect(result).toBeNull();
    expect(Date.now() - startedAt).toBeLessThan(2_000);
  });

  it("không bao giờ lặp quá số lần thử được cấp", () => {
    const startedAt = Date.now();
    const result = generateLevel({
      seed: 13,
      difficulty: "expert",
      budget: { maxNodes: 1, maxMillis: 1 },
      maxAttempts: 3
    });

    expect(result).toBeNull();
    expect(Date.now() - startedAt).toBeLessThan(5_000);
  });

  it("hạ chuẩn thay vì bỏ cuộc khi gần cạn lần thử", () => {
    // Ít lần thử tới mức khoảng số đẩy nguyên bản gần như không thể chạm tới; nếu
    // không có bước hạ chuẩn thì đây là một hộp báo lỗi trước mặt người chơi.
    let produced = 0;
    for (let seed = 0; seed < 6; seed += 1) {
      const result = generateLevel({
        seed: 900 + seed,
        difficulty: "hard",
        budget: runtimeBudget("hard"),
        maxAttempts: 12
      });
      if (result) produced += 1;
    }
    expect(produced).toBeGreaterThan(0);
  });
});
