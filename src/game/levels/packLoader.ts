import { packLevelToLevel } from "@/game/core/level";
import type { Difficulty, Level, LevelPack, PackLevel } from "@/game/core/types";

export { packLevelToLevel };

/**
 * Nạp pack màn chiến dịch.
 *
 * Dùng `import()` động thay vì `fetch("/levels/x.json")` vì hai lý do:
 * bundler tự tách mỗi bậc khó thành một chunk riêng (NFR-PERF-09 — không tải cả
 * bốn bậc), và đường dẫn tự khớp `basePath` khi deploy lên GitHub Pages, chỗ mà
 * một URL tuyệt đối viết tay sẽ trỏ sai.
 */

const loaders: Record<Difficulty, () => Promise<{ default: unknown }>> = {
  easy: () => import("./data/easy.json"),
  medium: () => import("./data/medium.json"),
  hard: () => import("./data/hard.json"),
  expert: () => import("./data/expert.json")
};

const cache = new Map<Difficulty, LevelPack>();

export class PackLoadError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "PackLoadError";
  }
}

function isPackLevel(value: unknown): value is PackLevel {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.seed === "number" &&
    typeof v.difficulty === "string" &&
    Array.isArray(v.xsb) &&
    v.xsb.every((line) => typeof line === "string") &&
    typeof v.optimalPushes === "number" &&
    typeof v.optimalMoves === "number"
  );
}

/** Dữ liệu tĩnh vẫn phải kiểm: một pack sinh bằng code cũ vẫn parse được mà số liệu sai. */
export function validatePack(value: unknown, difficulty: Difficulty): LevelPack {
  if (typeof value !== "object" || value === null) {
    throw new PackLoadError(`Pack ${difficulty} không phải object`);
  }
  const v = value as Record<string, unknown>;
  if (v.version !== 1) throw new PackLoadError(`Pack ${difficulty} sai phiên bản`);
  if (v.difficulty !== difficulty) {
    throw new PackLoadError(`Pack ${difficulty} khai báo bậc khó ${String(v.difficulty)}`);
  }
  if (typeof v.seed !== "number") throw new PackLoadError(`Pack ${difficulty} thiếu seed`);
  if (!Array.isArray(v.levels) || v.levels.length === 0) {
    throw new PackLoadError(`Pack ${difficulty} không có màn nào`);
  }
  for (const level of v.levels) {
    if (!isPackLevel(level)) throw new PackLoadError(`Pack ${difficulty} có màn sai định dạng`);
  }
  return { version: 1, difficulty, seed: v.seed, levels: v.levels as PackLevel[] };
}

export async function loadPack(difficulty: Difficulty): Promise<LevelPack> {
  const cached = cache.get(difficulty);
  if (cached) return cached;

  let raw: unknown;
  try {
    const module = await loaders[difficulty]();
    raw = module.default;
  } catch (error) {
    throw new PackLoadError(`Không tải được pack ${difficulty}`, error);
  }

  const pack = validatePack(raw, difficulty);
  cache.set(difficulty, pack);
  return pack;
}

export async function loadLevel(difficulty: Difficulty, levelId: string): Promise<Level> {
  const pack = await loadPack(difficulty);
  const packLevel = pack.levels.find((level) => level.id === levelId);
  if (!packLevel) throw new PackLoadError(`Pack ${difficulty} không có màn ${levelId}`);
  return packLevelToLevel(packLevel);
}
