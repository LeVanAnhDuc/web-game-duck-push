import { describe, expect, it } from "vitest";

import { packLevelToLevel } from "@/game/core/level";
import { solutionIsValid, solve } from "@/game/core/solver";
import { isSolved } from "@/game/core/rules";
import { profileFor } from "@/game/core/generator/difficulty";
import { DIFFICULTIES, type Difficulty, type LevelPack } from "@/game/core/types";
import { validatePack } from "./packLoader";

import easy from "./data/easy.json";
import medium from "./data/medium.json";
import hard from "./data/hard.json";
import expert from "./data/expert.json";

/**
 * Bất biến #17 — pack đã commit là **dữ liệu đã kiểm**, không phải dữ liệu được tin.
 *
 * Một pack sinh bằng generator cũ vẫn parse được, vẫn chơi được, chỉ có `optimalPushes`
 * là sai — và cái sai đó không lộ ra ở đâu cả: HUD hiện một cái đích không ai đạt được
 * và dấu sao không bao giờ sáng. Cách duy nhất bắt được là chạy lại solver.
 *
 * Bộ test này vì thế **chậm có chủ đích**. Nó là thứ đứng giữa một pack cũ và bản
 * deploy, nên nó chạy trong CI, không phải chỉ khi ai đó nhớ ra.
 */

const PACKS: Readonly<Record<Difficulty, unknown>> = { easy, medium, hard, expert };

/** Rộng hơn ngân sách lúc sinh: ở đây ta cần câu trả lời đúng, không cần nhanh. */
const VERIFY_BUDGET = { maxNodes: 3_000_000, maxMillis: 120_000 };

describe("pack màn chiến dịch", () => {
  for (const difficulty of DIFFICULTIES) {
    describe(difficulty, () => {
      const pack: LevelPack = validatePack(PACKS[difficulty], difficulty);

      it("có màn, và mọi id là duy nhất", () => {
        expect(pack.levels.length).toBeGreaterThan(0);
        const ids = new Set(pack.levels.map((level) => level.id));
        expect(ids.size).toBe(pack.levels.length);
      });

      it("mọi màn đọc được từ XSB và tự nhất quán", () => {
        for (const packLevel of pack.levels) {
          const level = packLevelToLevel(packLevel);
          expect(level.initial.boxes.length).toBe(level.initial.board.goals.length);
          // Một màn đã thắng sẵn không phải là một câu đố.
          expect(isSolved(level.initial)).toBe(false);
        }
      });

      /*
       * Trần thời gian riêng cho test này, và rộng.
       *
       * Đo thật: giải lại 10 màn bậc `expert` mất hơn 134 giây — mỗi màn sâu 37-45 đẩy
       * với 5 thùng ngốn vài trăm nghìn nút ở ~35.000 nút/giây. Trần 30 giây mặc định
       * của Vitest cắt đúng bậc duy nhất mà bộ test này tồn tại để bảo vệ. Đây là chỗ
       * chậm nhất của cả CI, và là chỗ chậm có chủ đích.
       */
      it("số đẩy tối ưu khớp với solver chạy lại, và lời giải chơi được", { timeout: 600_000 }, () => {
        for (const packLevel of pack.levels) {
          const level = packLevelToLevel(packLevel);
          const result = solve(level.initial, VERIFY_BUDGET);

          expect(
            result.status,
            `${packLevel.id} phải giải được, nhận ${result.status}`
          ).toBe("solved");
          if (result.status !== "solved") continue;

          expect(result.pushes, `${packLevel.id} sai số đẩy tối ưu`).toBe(
            packLevel.optimalPushes
          );
          expect(solutionIsValid(level.initial, result.solution)).toBe(true);
        }
      });

      it("nằm trong khuôn độ khó mà bậc này tự khai báo", () => {
        const profile = profileFor(difficulty);
        for (const packLevel of pack.levels) {
          expect(
            packLevel.optimalPushes,
            `${packLevel.id} có ${packLevel.optimalPushes} đẩy, ngoài khuôn bậc ${difficulty}`
          ).toBeGreaterThanOrEqual(profile.minPushes);
          expect(packLevel.optimalPushes).toBeLessThanOrEqual(profile.maxPushes);
        }
      });
    });
  }

  it("các bậc khó tách bạch nhau — bậc sau khó hơn hẳn bậc trước", () => {
    const maxOf = (difficulty: Difficulty) =>
      Math.max(...validatePack(PACKS[difficulty], difficulty).levels.map((l) => l.optimalPushes));
    const minOf = (difficulty: Difficulty) =>
      Math.min(...validatePack(PACKS[difficulty], difficulty).levels.map((l) => l.optimalPushes));

    // Nhãn độ khó phải nói thật. Hai bậc chồng lấn hoàn toàn thì nhãn là trang trí.
    for (let i = 1; i < DIFFICULTIES.length; i += 1) {
      const easier = DIFFICULTIES[i - 1]!;
      const harder = DIFFICULTIES[i]!;
      expect(
        minOf(harder),
        `bậc ${harder} phải bắt đầu từ chỗ khó hơn màn dễ nhất của bậc ${easier}`
      ).toBeGreaterThan(minOf(easier));
      expect(maxOf(harder)).toBeGreaterThan(maxOf(easier));
    }
  });
});
