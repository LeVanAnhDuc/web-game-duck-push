/**
 * Bộ sinh số giả ngẫu nhiên có seed (mulberry32).
 *
 * `Math.random()` bị **cấm** trong `core/`: một màn sinh ra mà không tái tạo được thì
 * không debug được, không test được, và không chia sẻ được bằng URL. Mọi thứ ngẫu
 * nhiên trong game đi qua đây.
 */

export interface Rng {
  /** Số thực trong [0, 1). */
  next(): number;
  /** Số nguyên trong [0, maxExclusive). */
  int(maxExclusive: number): number;
  /** Số nguyên trong [min, maxInclusive]. */
  range(min: number, maxInclusive: number): number;
  pick<T>(items: readonly T[]): T;
  /** Trả về mảng mới đã trộn; không sửa mảng đầu vào. */
  shuffle<T>(items: readonly T[]): T[];
  /** Trả về true với xác suất `p`. */
  chance(p: number): boolean;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (maxExclusive: number): number => {
    if (maxExclusive <= 0) throw new RangeError("maxExclusive phải > 0");
    return Math.floor(next() * maxExclusive);
  };

  return {
    next,
    int,
    range: (min, maxInclusive) => min + int(maxInclusive - min + 1),
    pick: <T,>(items: readonly T[]): T => {
      if (items.length === 0) throw new RangeError("Không thể chọn từ mảng rỗng");
      return items[int(items.length)]!;
    },
    shuffle: <T,>(items: readonly T[]): T[] => {
      const copy = items.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = int(i + 1);
        const a = copy[i]!;
        copy[i] = copy[j]!;
        copy[j] = a;
      }
      return copy;
    },
    chance: (p) => next() < p
  };
}

/** Trộn một chuỗi thành seed 32-bit — dùng cho seed người dùng gõ vào URL. */
export function hashSeed(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
