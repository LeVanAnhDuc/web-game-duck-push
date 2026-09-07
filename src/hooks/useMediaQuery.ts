"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Theo dõi một media query.
 *
 * Trả `false` khi dựng HTML tĩnh: lúc đó chưa biết gì về thiết bị, mà đoán bừa
 * rồi vẽ khác đi sẽ vênh khi hydrate. Giá trị thật vào ngay sau lần vẽ đầu tiên
 * ở trình duyệt.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => undefined;
      }
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Thiết bị chạm: chỉ chỗ này mới vẽ D-pad. */
export function useCoarsePointer(): boolean {
  return useMediaQuery("(pointer: coarse)");
}
