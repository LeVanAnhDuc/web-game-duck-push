import { DIFFICULTIES, type Difficulty, type Level } from "@/game/core/types";
import { loadLevel } from "@/game/levels/packLoader";
import { requestRandomLevel } from "@/game/workers/generatorClient";

/**
 * Phần **thuần** của việc điều hướng: đọc query, viết query, biến một đường dẫn
 * thành một màn chơi. Tách khỏi `useLevelRouter` để chỗ này không dính React và
 * soi được bằng mắt — đây là nơi mọi đường dẫn hỏng phải chết một cách tử tế.
 */

export type BootTarget =
  | { readonly kind: "none" }
  | { readonly kind: "invalid"; readonly message: string }
  | { readonly kind: "campaign"; readonly difficulty: Difficulty; readonly levelId: string }
  | { readonly kind: "random"; readonly difficulty: Difficulty; readonly seed: number };

function isDifficulty(value: string | null): value is Difficulty {
  return value !== null && DIFFICULTIES.includes(value as Difficulty);
}

export function describe(error: unknown): string {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}

/** Ghi lại thanh địa chỉ mà **không** tải lại trang: ván đang chơi phải sống sót. */
export function writeUrl(query: string): void {
  if (typeof window === "undefined") return;
  const { pathname } = window.location;
  window.history.replaceState(null, "", query.length > 0 ? `${pathname}?${query}` : pathname);
}

export function parseBootTarget(search: string): BootTarget {
  const params = new URLSearchParams(search);
  const rawDifficulty = params.get("d");
  const levelId = params.get("level");
  const rawSeed = params.get("seed");

  if (levelId === null && rawSeed === null) return { kind: "none" };

  if (!isDifficulty(rawDifficulty)) {
    return { kind: "invalid", message: "Đường dẫn thiếu bậc khó hợp lệ nên mình mở trang chủ." };
  }

  if (levelId !== null) return { kind: "campaign", difficulty: rawDifficulty, levelId };

  const seed = Number(rawSeed);
  if (!Number.isInteger(seed) || seed < 0) {
    return {
      kind: "invalid",
      message: "Seed trong đường dẫn không đọc được nên mình mở trang chủ."
    };
  }
  return { kind: "random", difficulty: rawDifficulty, seed };
}

/** Mọi nhánh hỏng đều thành một `Error` có câu chữ đọc được — không có nhánh im lặng. */
export async function resolveBootTarget(target: BootTarget): Promise<Level> {
  switch (target.kind) {
    case "campaign":
      try {
        return await loadLevel(target.difficulty, target.levelId);
      } catch (error) {
        throw new Error(`Không mở được màn ${target.levelId}: ${describe(error)}`);
      }
    case "random":
      try {
        return await requestRandomLevel(target.difficulty, target.seed);
      } catch (error) {
        throw new Error(`Không sinh lại được màn từ seed: ${describe(error)}`);
      }
    case "invalid":
      throw new Error(target.message);
    default:
      throw new Error("Đường dẫn không có màn nào để mở.");
  }
}
