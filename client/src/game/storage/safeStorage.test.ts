import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isAvailable, readJson, removeKey, writeJson } from "./safeStorage";

const KEY = "sokoban:test:safe-storage";

/**
 * Bắt một phương thức của `localStorage` ném lỗi, chỉ trong phạm vi lời gọi này.
 *
 * Phải tự `mockRestore()` chứ không dựa vào `vi.restoreAllMocks()`: `localStorage`
 * của happy-dom là một Proxy, và `restoreAllMocks` không gỡ được spy đặt lên nó —
 * mock rò sang test kế tiếp và làm nó hỏng theo cách rất khó đoán.
 */
function withThrowingStorage<T>(method: "getItem" | "setItem" | "removeItem", run: () => T): T {
  const spy = vi.spyOn(window.localStorage, method).mockImplementation(() => {
    throw new Error("SecurityError");
  });
  try {
    return run();
  } finally {
    spy.mockRestore();
  }
}

describe("safeStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("ghi rồi đọc lại ra đúng giá trị", () => {
    expect(writeJson(KEY, { a: 1, b: ["x"] })).toBe(true);
    expect(readJson(KEY)).toEqual({ a: 1, b: ["x"] });
  });

  it("trả null khi chưa có khoá", () => {
    expect(readJson("sokoban:test:missing")).toBeNull();
  });

  it("trả null khi JSON hỏng thay vì ném lỗi", () => {
    window.localStorage.setItem(KEY, "{ khong phai json");
    expect(() => readJson(KEY)).not.toThrow();
    expect(readJson(KEY)).toBeNull();
  });

  it("coi giá trị null đã lưu như là không có dữ liệu", () => {
    window.localStorage.setItem(KEY, "null");
    expect(readJson(KEY)).toBeNull();
  });

  it("trả false và không ném lỗi khi setItem hỏng", () => {
    withThrowingStorage("setItem", () => {
      expect(() => writeJson(KEY, { a: 1 })).not.toThrow();
      expect(writeJson(KEY, { a: 1 })).toBe(false);
    });
  });

  it("trả null khi getItem hỏng", () => {
    withThrowingStorage("getItem", () => {
      expect(readJson(KEY)).toBeNull();
    });
  });

  it("removeKey xoá được và nuốt lỗi", () => {
    writeJson(KEY, 1);
    removeKey(KEY);
    expect(readJson(KEY)).toBeNull();

    withThrowingStorage("removeItem", () => {
      expect(() => removeKey(KEY)).not.toThrow();
    });
  });

  it("isAvailable đúng khi có localStorage, sai khi bị chặn ghi", () => {
    expect(isAvailable()).toBe(true);

    withThrowingStorage("setItem", () => {
      expect(isAvailable()).toBe(false);
    });
  });

  it("không để lại khoá thăm dò nào sau isAvailable", () => {
    isAvailable();
    expect(window.localStorage.length).toBe(0);
  });
});
