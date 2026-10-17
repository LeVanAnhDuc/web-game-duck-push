"use client";

import { loadProgress, saveProgress } from "@/game/storage/progressRepository";
import { loadSettings, saveSettings } from "@/game/storage/settingsRepository";
import {
  DEFAULT_SETTINGS,
  EMPTY_PROGRESS,
  type Progress,
  type Settings
} from "@/game/storage/types";

/**
 * Một tầng đệm mỏng giữa `localStorage` và React.
 *
 * Không phải để chạy nhanh hơn, mà vì `useSyncExternalStore` **bắt buộc** ảnh
 * chụp phải ổn định: `loadProgress()` trả object mới mỗi lần gọi, đưa thẳng vào
 * hook đó là vòng vẽ vô tận. Đệm lại và chỉ đổi tham chiếu khi dữ liệu thật sự
 * đổi thì mọi thứ đứng yên.
 *
 * Lợi ích kèm theo, và cũng là lý do dùng nó thay vì `useEffect` + `useState`:
 * ghi kỷ lục ở màn chơi làm trang chủ tự cập nhật, không cần ai truyền tin cho
 * ai; và ảnh chụp phía server (mặc định) khác ảnh chụp phía client mà React vẫn
 * hydrate đúng, không kêu lệch DOM.
 */

type Listener = () => void;

interface Store<T> {
  readonly subscribe: (listener: Listener) => () => void;
  /** Ảnh chụp phía trình duyệt — cùng một tham chiếu cho tới khi có ai ghi. */
  readonly getSnapshot: () => T;
  /** Ảnh chụp lúc dựng HTML tĩnh: chưa biết gì về người chơi. */
  readonly getServerSnapshot: () => T;
  readonly set: (value: T) => void;
}

function createStore<T>(read: () => T, fallback: T): Store<T> {
  let cache: { value: T } | null = null;
  const listeners = new Set<Listener>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      if (cache === null) cache = { value: read() };
      return cache.value;
    },
    getServerSnapshot() {
      return fallback;
    },
    set(value) {
      cache = { value };
      for (const listener of listeners) listener();
    }
  };
}

export const settingsStore = createStore<Settings>(loadSettings, DEFAULT_SETTINGS);
export const progressStore = createStore<Progress>(loadProgress, EMPTY_PROGRESS);

/** Ghi xuống đĩa **và** báo cho mọi màn hình đang mở. Luôn dùng cặp này, đừng gọi lẻ. */
export function writeSettings(next: Settings): void {
  saveSettings(next);
  settingsStore.set(next);
}

export function writeProgress(next: Progress): void {
  saveProgress(next);
  progressStore.set(next);
}
