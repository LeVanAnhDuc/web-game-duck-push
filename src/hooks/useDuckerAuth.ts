"use client";

import { useEffect, useSyncExternalStore } from "react";
import { settleCallbackUrl } from "@/lib/duckerAuth";
import { DUCKER_CONFIG } from "@/lib/duckerConfig";
import { getServerSnapshot, getSnapshot, signIn, signOut, subscribe } from "@/lib/duckerSession";
import type { AuthSnapshot } from "@/lib/duckerTypes";

/**
 * Trạng thái đăng nhập Ducker ID cho UI. Snapshot phía server luôn là `idle` để lần
 * vẽ đầu của client khớp HTML tĩnh — không có cảnh báo hydration khi cờ bật.
 */
export function useDuckerAuth(): AuthSnapshot & {
  enabled: boolean;
  profileUrl: string | null;
  signIn: () => void;
  signOut: () => void;
} {
  useEffect(() => settleCallbackUrl(), []);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ...snapshot,
    enabled: DUCKER_CONFIG !== null,
    profileUrl: DUCKER_CONFIG ? DUCKER_CONFIG.profileUrl : null,
    signIn,
    signOut
  };
}
