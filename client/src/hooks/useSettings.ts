"use client";

import { useSyncExternalStore } from "react";
import { settingsStore } from "./storageStore";
import type { Settings } from "@/game/storage/types";

/**
 * Tuỳ chọn hiển thị (vệt đi, cảnh báo bế tắc).
 *
 * Lúc dựng HTML tĩnh chưa đọc được `localStorage` nên trả về mặc định; React tự
 * đổi sang giá trị thật ngay sau khi hydrate, đúng cách mà `useSyncExternalStore`
 * sinh ra để làm.
 */
export function useSettings(): Settings {
  return useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
    settingsStore.getServerSnapshot
  );
}
