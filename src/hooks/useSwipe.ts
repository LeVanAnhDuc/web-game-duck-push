"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { Direction } from "@/game/core/types";

/**
 * Vuốt bốn hướng trên bàn cờ.
 *
 * Ngưỡng 24px: đủ xa để một cú chạm run tay không thành nước đi, đủ gần để vuốt
 * một ô là đi được. Trục nào lệch nhiều hơn thì thắng — vuốt chéo luôn được quy
 * về một hướng chứ không bị bỏ qua, vì bỏ qua thì người chơi tưởng máy đơ.
 */

const THRESHOLD_PX = 24;

export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (direction: Direction) => void,
  enabled: boolean = true
): void {
  const callback = useRef(onSwipe);
  useEffect(() => {
    callback.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || event.touches.length > 1) {
        tracking = false;
        return;
      }
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) < THRESHOLD_PX && Math.abs(dy) < THRESHOLD_PX) return;

      if (Math.abs(dx) >= Math.abs(dy)) callback.current(dx > 0 ? "right" : "left");
      else callback.current(dy > 0 ? "down" : "up");
    };

    const onTouchCancel = () => {
      tracking = false;
    };

    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchend", onTouchEnd, { passive: true });
    element.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchend", onTouchEnd);
      element.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [ref, enabled]);
}
