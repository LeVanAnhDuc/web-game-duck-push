"use client";

import { ArrowRight, RotateCcw, Shuffle, Star } from "lucide-react";
import { formatDuration } from "@/hooks/useElapsedTime";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { levelTitle } from "@/lib/levelText";
import type { LevelRecord } from "@/game/storage/types";

/**
 * Lớp phủ báo thắng.
 *
 * Đây là chỗ **duy nhất** trong game dùng hộp thoại thật: đã hết việc để làm trên
 * bàn cờ, nên chắn đường là đúng. Bẫy tiêu điểm và Escape do `Modal` lo.
 *
 * Kỷ lục hiện ở đây là kỷ lục **trước ván này** — khoe "vừa phá kỷ lục" mà lại so
 * với kỷ lục vừa ghi đè thì lần nào cũng hoà.
 */
export function WinOverlay({
  open,
  levelId,
  moves,
  pushes,
  elapsedMs,
  optimalPushes,
  previousRecord,
  nextPending,
  onClose,
  onRestart,
  onNext,
  onRandom
}: {
  readonly open: boolean;
  readonly levelId: string;
  readonly moves: number;
  readonly pushes: number;
  readonly elapsedMs: number;
  readonly optimalPushes: number;
  readonly previousRecord: LevelRecord | null;
  readonly nextPending: boolean;
  readonly onClose: () => void;
  readonly onRestart: () => void;
  readonly onNext: () => void;
  readonly onRandom: () => void;
}) {
  const optimal = pushes <= optimalPushes;
  const beatenRecord = previousRecord !== null && pushes < previousRecord.bestPushes;

  return (
    <Modal open={open} onClose={onClose} labelledBy="win-title">
      <h2 id="win-title" className="screen-title">
        Xong màn!
      </h2>
      <p className="mt-1 text-[16px] text-[var(--color-muted-foreground)]">{levelTitle(levelId)}</p>

      <p className="num hud-num mt-4" data-testid="win-stats">
        {moves} bước · {pushes} đẩy · {formatDuration(elapsedMs)}
      </p>

      {optimal ? (
        <p className="mt-2 flex items-center gap-2 text-[14px]">
          <Star
            aria-hidden="true"
            size={16}
            fill="var(--color-primary)"
            stroke="var(--color-primary)"
          />
          Đạt đúng số đẩy tối ưu ({optimalPushes} đẩy).
        </p>
      ) : (
        <p className="num mt-2 text-[14px] text-[var(--color-muted-foreground)]">
          Tối ưu là {optimalPushes} đẩy — còn {pushes - optimalPushes} đẩy nữa là chạm đáy.
        </p>
      )}

      <p className="num mt-1 text-[13px] text-[var(--color-muted-foreground)]">
        {previousRecord === null
          ? "Lần đầu bạn giải màn này."
          : `Kỷ lục cũ: ${previousRecord.bestPushes} đẩy${beatenRecord ? " — vừa bị bạn phá" : ""}.`}
      </p>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={onRestart} className="flex-1">
          <RotateCcw aria-hidden="true" size={18} />
          Chơi lại
        </Button>
        <Button variant="primary" onClick={onNext} pending={nextPending} className="flex-1">
          Tiếp
          {nextPending ? null : <ArrowRight aria-hidden="true" size={18} />}
        </Button>
      </div>

      {/*
        Lối ra thứ ba, đứng riêng một hàng vì nó không cùng loại với hai nút trên:
        `Tiếp` và `Chơi lại` đi trong chiến dịch, cái này rời khỏi chiến dịch.
        Trước đây nó không tồn tại, nên người vừa thắng mà muốn một màn chưa ai từng
        chơi phải bấm `Tiếp`, rơi vào màn có sẵn, rồi tự quay về trang chủ mới tìm
        thấy nút đúng — 3 thao tác cho một việc đáng lẽ 1 (F-05).
      */}
      <Button
        variant="ghost"
        onClick={onRandom}
        pending={nextPending}
        className="mt-2 w-full text-[14px]"
      >
        {nextPending ? null : <Shuffle aria-hidden="true" size={16} />}
        Màn ngẫu nhiên
      </Button>
    </Modal>
  );
}
