"use client";

import { useEffect, useState } from "react";
import { elapsedMs } from "@/game/session/session";
import type { GameSession } from "@/game/session/types";

/**
 * Đồng hồ của HUD: nhích mỗi giây, **đứng hẳn** khi đã thắng.
 *
 * Không giữ số giây trong session — session là dữ liệu thuần, còn cái nhịp đập
 * này là chuyện của giao diện. `elapsedMs()` mới là nguồn đúng; hook chỉ ép React
 * vẽ lại đủ thường xuyên để con số trên màn hình không cũ.
 */
export function useElapsedTime(session: GameSession): number {
  const [running, setRunning] = useState(() => elapsedMs(session));

  useEffect(() => {
    // Thắng rồi thì con số đã chốt trong session, không cần nhịp nào nữa.
    if (session.solved) return;
    const id = window.setInterval(() => setRunning(elapsedMs(session)), 1000);
    return () => window.clearInterval(id);
  }, [session]);

  // Lấy thẳng con số đã chốt thay vì chờ nhịp kế tiếp: thời gian hiện trên lớp
  // phủ thắng phải khớp đúng con số vừa ghi vào kỷ lục.
  return session.solved ? session.elapsedMs : running;
}

/** `mm:ss`, luôn hai chữ số phút để HUD không co giãn khi qua mốc 10 phút. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
