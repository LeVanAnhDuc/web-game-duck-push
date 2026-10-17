import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearProgress,
  loadProgress,
  recordSolve,
  saveInProgress,
  saveProgress
} from "./progressRepository";
import {
  EMPTY_PROGRESS,
  STORAGE_KEYS,
  STORAGE_VERSION,
  type LevelRecord,
  type Progress,
  type SavedSession
} from "./types";

const LEVEL_ID = "easy-001";

function record(overrides: Partial<LevelRecord> = {}): LevelRecord {
  return {
    levelId: LEVEL_ID,
    bestPushes: 10,
    bestMoves: 40,
    bestTimeMs: 30_000,
    optimal: false,
    solvedAt: 1_700_000_000_000,
    ...overrides
  };
}

function progressWith(record: LevelRecord): Progress {
  return { version: STORAGE_VERSION, records: { [record.levelId]: record }, inProgress: null };
}

/** Ghi thẳng vào localStorage để mô phỏng dữ liệu người chơi sửa tay. */
function putRaw(value: unknown): void {
  window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(value));
}

describe("loadProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("trả tiến trình rỗng khi chưa có gì", () => {
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("trả tiến trình rỗng khi JSON hỏng", () => {
    window.localStorage.setItem(STORAGE_KEYS.progress, "{{ hong");
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("trả tiến trình rỗng khi sai version", () => {
    putRaw({ version: 99, records: {}, inProgress: null });
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("trả tiến trình rỗng khi thiếu trường", () => {
    putRaw({ version: STORAGE_VERSION, records: { [LEVEL_ID]: { levelId: LEVEL_ID } } });
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("trả tiến trình rỗng khi records không phải object", () => {
    putRaw({ version: STORAGE_VERSION, records: [], inProgress: null });
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("trả tiến trình rỗng khi có số âm sửa tay", () => {
    putRaw(progressWith(record({ bestPushes: -5 })));
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("trả tiến trình rỗng khi bestTimeMs là NaN (thành null qua JSON)", () => {
    putRaw({
      version: STORAGE_VERSION,
      records: { [LEVEL_ID]: { ...record(), bestTimeMs: Number.NaN } },
      inProgress: null
    });
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("trả tiến trình rỗng khi inProgress sai hình dạng", () => {
    putRaw({
      version: STORAGE_VERSION,
      records: {},
      inProgress: { levelId: LEVEL_ID, difficulty: "khong-co-that", seed: 1, moves: [] }
    });
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("trả tiến trình rỗng khi moves chứa hướng lạ", () => {
    const saved = {
      levelId: LEVEL_ID,
      difficulty: "easy",
      seed: 1,
      moves: ["up", "diagonal"],
      elapsedMs: 0,
      savedAt: 1
    };
    putRaw({ version: STORAGE_VERSION, records: {}, inProgress: saved });
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });

  it("đọc lại nguyên vẹn dữ liệu hợp lệ", () => {
    const saved: SavedSession = {
      levelId: LEVEL_ID,
      difficulty: "easy",
      seed: null,
      moves: ["up", "left", "right", "down"],
      elapsedMs: 12_000,
      savedAt: 1_700_000_000_000
    };
    const progress: Progress = { ...progressWith(record()), inProgress: saved };

    expect(saveProgress(progress)).toBe(true);
    expect(loadProgress()).toEqual(progress);
  });

  it("saveProgress trả false khi localStorage từ chối ghi", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => saveProgress(EMPTY_PROGRESS)).not.toThrow();
    expect(saveProgress(EMPTY_PROGRESS)).toBe(false);
  });

  it("clearProgress xoá sạch", () => {
    saveProgress(progressWith(record()));
    clearProgress();
    expect(loadProgress()).toEqual(EMPTY_PROGRESS);
  });
});

describe("recordSolve", () => {
  it("tạo kỷ lục mới khi màn chưa từng giải", () => {
    const next = recordSolve(
      EMPTY_PROGRESS,
      { levelId: LEVEL_ID, pushes: 10, moves: 40, timeMs: 30_000, optimalPushes: 8 },
      1_234
    );

    expect(next.records[LEVEL_ID]).toEqual({
      levelId: LEVEL_ID,
      bestPushes: 10,
      bestMoves: 40,
      bestTimeMs: 30_000,
      optimal: false,
      solvedAt: 1_234
    });
    // Hàm thuần: tiến trình cũ không đổi.
    expect(EMPTY_PROGRESS.records).toEqual({});
  });

  it("gắn optimal khi số đẩy bằng đúng số tối ưu", () => {
    const next = recordSolve(
      EMPTY_PROGRESS,
      { levelId: LEVEL_ID, pushes: 8, moves: 40, timeMs: 30_000, optimalPushes: 8 },
      1
    );
    expect(next.records[LEVEL_ID]?.optimal).toBe(true);
  });

  it("ghi đè khi ít đẩy hơn", () => {
    const before = progressWith(record());
    const after = recordSolve(
      before,
      { levelId: LEVEL_ID, pushes: 9, moves: 100, timeMs: 90_000, optimalPushes: 8 },
      2
    );

    expect(after.records[LEVEL_ID]?.bestPushes).toBe(9);
    // Ít đẩy hơn thì thắng, dù đi nhiều bước hơn và chậm hơn.
    expect(after.records[LEVEL_ID]?.bestMoves).toBe(100);
  });

  it("bỏ qua kết quả nhiều đẩy hơn", () => {
    const before = progressWith(record());
    const after = recordSolve(
      before,
      { levelId: LEVEL_ID, pushes: 11, moves: 1, timeMs: 1, optimalPushes: 8 },
      2
    );

    expect(after.records[LEVEL_ID]).toEqual(before.records[LEVEL_ID]);
  });

  it("bằng đẩy thì so số bước", () => {
    const before = progressWith(record());
    const better = recordSolve(
      before,
      { levelId: LEVEL_ID, pushes: 10, moves: 39, timeMs: 90_000, optimalPushes: 8 },
      2
    );
    expect(better.records[LEVEL_ID]?.bestMoves).toBe(39);

    const worse = recordSolve(
      before,
      { levelId: LEVEL_ID, pushes: 10, moves: 41, timeMs: 1, optimalPushes: 8 },
      2
    );
    expect(worse.records[LEVEL_ID]?.bestMoves).toBe(40);
  });

  it("bằng đẩy và bằng bước thì so thời gian", () => {
    const before = progressWith(record());
    const better = recordSolve(
      before,
      { levelId: LEVEL_ID, pushes: 10, moves: 40, timeMs: 29_999, optimalPushes: 8 },
      2
    );
    expect(better.records[LEVEL_ID]?.bestTimeMs).toBe(29_999);

    const worse = recordSolve(
      before,
      { levelId: LEVEL_ID, pushes: 10, moves: 40, timeMs: 30_001, optimalPushes: 8 },
      2
    );
    expect(worse.records[LEVEL_ID]?.bestTimeMs).toBe(30_000);
  });

  it("không đụng tới kỷ lục của màn khác", () => {
    const before: Progress = {
      version: STORAGE_VERSION,
      records: { other: record({ levelId: "other", bestPushes: 3 }) },
      inProgress: null
    };
    const after = recordSolve(
      before,
      { levelId: LEVEL_ID, pushes: 10, moves: 40, timeMs: 30_000, optimalPushes: 8 },
      2
    );

    expect(after.records.other).toEqual(before.records.other);
    expect(after.records[LEVEL_ID]?.bestPushes).toBe(10);
  });
});

describe("saveInProgress", () => {
  const saved: SavedSession = {
    levelId: LEVEL_ID,
    difficulty: "medium",
    seed: 7,
    moves: ["up", "up"],
    elapsedMs: 500,
    savedAt: 1_000
  };

  it("gắn ván đang dở mà không đụng kỷ lục", () => {
    const before = progressWith(record());
    const after = saveInProgress(before, saved);

    expect(after.inProgress).toEqual(saved);
    expect(after.records).toEqual(before.records);
    expect(before.inProgress).toBeNull();
  });

  it("gỡ ván đang dở bằng null", () => {
    const after = saveInProgress(saveInProgress(EMPTY_PROGRESS, saved), null);
    expect(after.inProgress).toBeNull();
  });
});
