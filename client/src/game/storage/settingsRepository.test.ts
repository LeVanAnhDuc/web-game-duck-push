import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadSettings, saveSettings } from "./settingsRepository";
import { DEFAULT_SETTINGS, STORAGE_KEYS, STORAGE_VERSION, type Settings } from "./types";

function putRaw(value: unknown): void {
  window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(value));
}

describe("settingsRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("trả mặc định khi chưa lưu gì", () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("trả mặc định khi JSON hỏng", () => {
    window.localStorage.setItem(STORAGE_KEYS.settings, "[[[");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("trả mặc định khi sai version", () => {
    putRaw({ ...DEFAULT_SETTINGS, version: 2 });
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("trả mặc định khi thiếu trường", () => {
    putRaw({ version: STORAGE_VERSION, theme: "dark" });
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("trả mặc định khi theme không nằm trong danh sách", () => {
    putRaw({ ...DEFAULT_SETTINGS, theme: "neon" });
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("trả mặc định khi cờ bật/tắt không phải boolean", () => {
    putRaw({ ...DEFAULT_SETTINGS, showTrail: "true" });
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("trả mặc định khi lưu một mảng", () => {
    putRaw([DEFAULT_SETTINGS]);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("đọc lại nguyên vẹn tuỳ chọn hợp lệ", () => {
    const settings: Settings = {
      version: STORAGE_VERSION,
      theme: "dark",
      showTrail: false,
      showDeadlockWarning: false
    };

    expect(saveSettings(settings)).toBe(true);
    expect(loadSettings()).toEqual(settings);
  });

  it("saveSettings trả false khi localStorage từ chối ghi", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => saveSettings(DEFAULT_SETTINGS)).not.toThrow();
    expect(saveSettings(DEFAULT_SETTINGS)).toBe(false);
  });
});
