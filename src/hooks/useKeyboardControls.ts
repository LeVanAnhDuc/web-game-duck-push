"use client";

import { useEffect, useRef } from "react";
import type { Direction } from "@/game/core/types";

/**
 * Bàn phím máy tính: mũi tên / WASD để đi, Z hoàn tác, Y làm lại, R chơi lại.
 *
 * Hai điều bắt buộc:
 *   1. `preventDefault` trên phím mũi tên — nếu không, mỗi nước đi làm cuộn trang
 *      và bàn cờ trôi khỏi tầm mắt (US-01, "điều gì có thể sai").
 *   2. Bỏ qua khi tiêu điểm đang ở ô nhập liệu, để không cướp phím của người dùng.
 */

export interface KeyboardHandlers {
  onMove: (direction: Direction) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRestart: () => void;
}

const MOVE_KEYS: Readonly<Record<string, Direction>> = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right"
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function useKeyboardControls(handlers: KeyboardHandlers, enabled: boolean = true): void {
  // Giữ handler trong ref để không gỡ/gắn lại listener sau mỗi lần vẽ. Gán trong
  // effect chứ không trong lúc vẽ: lúc vẽ, ref chưa thuộc về ai cả.
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const direction = MOVE_KEYS[key];

      if (direction !== undefined) {
        // Chặn cuộn trang, kể cả khi nước đi không hợp lệ.
        if (key.startsWith("arrow")) event.preventDefault();
        if (event.ctrlKey) return;
        ref.current.onMove(direction);
        return;
      }

      if (key === "z") {
        event.preventDefault();
        // Ctrl+Shift+Z là quy ước "làm lại" trên Windows/Linux.
        if (event.shiftKey) ref.current.onRedo();
        else ref.current.onUndo();
        return;
      }

      if (key === "y") {
        event.preventDefault();
        ref.current.onRedo();
        return;
      }

      if (key === "r" && !event.ctrlKey) {
        event.preventDefault();
        ref.current.onRestart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
