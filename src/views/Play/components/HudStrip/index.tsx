"use client";

import { formatDuration } from "@/hooks/useElapsedTime";
import type { LevelRecord } from "@/game/storage/types";

/**
 * Dải số liệu: bước · đẩy · giờ, và ngay dưới là hai con số để so — số đẩy tối ưu
 * của màn và kỷ lục của chính người chơi.
 *
 * Tất cả chữ số dùng chữ đều bề ngang (`.num`). Bộ đếm bước đổi sau **mỗi** phím;
 * chữ số co giãn sẽ làm cả dải nhảy qua nhảy lại suốt ván.
 */
export function HudStrip({
  moves,
  pushes,
  elapsedMs,
  optimalPushes,
  record
}: {
  readonly moves: number;
  readonly pushes: number;
  readonly elapsedMs: number;
  readonly optimalPushes: number;
  readonly record: LevelRecord | null;
}) {
  return (
    <div className="shrink-0 px-4 py-2">
      <p className="num hud-num" data-testid="hud-counters">
        Bước {moves} · Đẩy {pushes} · {formatDuration(elapsedMs)}
      </p>
      <p className="num meta mt-0.5 text-[var(--color-muted-foreground)]">
        Tối ưu {optimalPushes} đẩy · KL bạn {record === null ? "chưa có" : `${record.bestPushes}`}
      </p>
    </div>
  );
}
