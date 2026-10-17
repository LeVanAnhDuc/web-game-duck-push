"use client";

import { useSyncExternalStore } from "react";
import { progressStore } from "./storageStore";
import type { Progress } from "@/game/storage/types";

/**
 * Tiến trình người chơi: kỷ lục từng màn và ván đang dở.
 *
 * Ghi ở màn chơi (`writeProgress`) làm trang chủ tự vẽ lại — không có đường dây
 * nào phải kéo tay qua nhiều tầng component.
 */
export function useProgress(): Progress {
  return useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getServerSnapshot
  );
}
