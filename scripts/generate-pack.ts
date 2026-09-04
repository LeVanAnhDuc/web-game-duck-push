/**
 * Sinh pack màn chiến dịch.
 *
 *   yarn levels:generate            — sinh cả bốn bậc với seed gốc mặc định
 *   yarn levels:generate hard 5     — sinh lại riêng một bậc với 5 màn
 *
 * Chạy bằng Node, ngoài trình duyệt, nên solver được cấp ngân sách rộng hơn hẳn lúc
 * chơi. Kết quả ghi vào `src/game/levels/data/*.json` và **commit vào repo** — pack là
 * dữ liệu đã kiểm, không phải thứ sinh lại mỗi lần build.
 *
 * Cùng seed gốc phải cho ra đúng pack cũ (bất biến #14). Đổi generator là đổi pack:
 * chạy lại lệnh này và commit cả file JSON trong cùng nhánh.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { levelToPackLevel, packLevelToLevel } from "../src/game/core/level";
import { generateLevel } from "../src/game/core/generator/generate";
import { buildBudget, buildProfile } from "../src/game/core/generator/difficulty";
import { createRng } from "../src/game/core/rng";
import { DIFFICULTIES, type Difficulty, type LevelPack, type PackLevel } from "../src/game/core/types";

const ROOT_SEED = 20260904;

const LEVEL_COUNT: Record<Difficulty, number> = {
  easy: 20,
  medium: 20,
  hard: 15,
  expert: 10
};

const outputDir = resolve(dirname(fileURLToPath(import.meta.url)), "../src/game/levels/data");

function generatePack(difficulty: Difficulty, count: number): LevelPack {
  const packSeed = (ROOT_SEED + difficulty.length * 7919) >>> 0;
  const rng = createRng(packSeed);
  const profile = buildProfile(difficulty);
  const budget = buildBudget(difficulty);
  const levels: PackLevel[] = [];

  let attemptsTotal = 0;
  const startedAt = Date.now();

  while (levels.length < count) {
    const seed = rng.int(0xffffffff);
    const result = generateLevel({ seed, difficulty, budget, maxAttempts: profile.maxAttempts });
    if (!result) continue;

    attemptsTotal += result.attempts;
    const packLevel: PackLevel = {
      ...levelToPackLevel(result.level),
      id: `${difficulty}-${String(levels.length + 1).padStart(2, "0")}`
    };

    // Vòng khứ hồi: cái ghi ra file phải đọc lại được thành đúng màn vừa sinh.
    const reparsed = packLevelToLevel(packLevel);
    if (reparsed.initial.boxes.length !== result.level.initial.boxes.length) {
      throw new Error(`Màn ${packLevel.id} không sống sót qua vòng XSB`);
    }

    levels.push(packLevel);
    process.stdout.write(
      `  ${packLevel.id}  ${packLevel.optimalPushes} đẩy · ${packLevel.optimalMoves} bước\n`
    );
  }

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  process.stdout.write(
    `${difficulty}: ${levels.length} màn, ${attemptsTotal} ứng viên đã vứt, ${seconds}s\n\n`
  );

  return { version: 1, difficulty, seed: packSeed, levels };
}

function main(): void {
  const [difficultyArg, countArg] = process.argv.slice(2);
  const targets: Difficulty[] = difficultyArg
    ? [difficultyArg as Difficulty]
    : [...DIFFICULTIES];

  for (const difficulty of targets) {
    if (!DIFFICULTIES.includes(difficulty)) {
      throw new Error(`Bậc khó không hợp lệ: ${difficulty}`);
    }
    const count = countArg ? Number(countArg) : LEVEL_COUNT[difficulty];
    process.stdout.write(`Sinh ${count} màn bậc ${difficulty}…\n`);

    const pack = generatePack(difficulty, count);
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(resolve(outputDir, `${difficulty}.json`), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  }
}

main();
