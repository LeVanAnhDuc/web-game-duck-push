"use client";

import { AlertTriangle, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Cảnh báo bế tắc — **dải tĩnh, không phải hộp thoại**.
 *
 * Hộp thoại sẽ chắn ngay cái nút Hoàn tác mà người chơi đang với tới, biến một
 * lời nhắc hữu ích thành một chướng ngại (MASTER.md §Anti-Patterns).
 *
 * Lời văn chỉ nói về **thùng đó**, không phán cả màn đã hỏng: `findFrozenBoxes`
 * biết chắc thùng này không gỡ được, nhưng cả màn còn cứu được hay không là
 * chuyện khác — nói quá lên một lần là mất lòng tin cả những lần cảnh báo đúng.
 */
export function DeadlockBanner({
  stuckCount,
  canUndo,
  onUndo
}: {
  readonly stuckCount: number;
  readonly canUndo: boolean;
  readonly onUndo: () => void;
}) {
  return (
    <div
      className="deadlock-banner mx-4 mb-2 flex shrink-0 items-center justify-between gap-3"
      data-testid="deadlock-banner"
    >
      <p className="flex items-center gap-2 text-[14px]">
        <AlertTriangle
          aria-hidden="true"
          size={18}
          className="shrink-0 text-[var(--color-destructive)]"
        />
        {stuckCount > 1 ? `${stuckCount} thùng kẹt rồi` : "Thùng này kẹt rồi"} — hoàn tác?
      </p>
      <Button variant="secondary" onClick={onUndo} disabled={!canUndo} className="shrink-0 px-3">
        <Undo2 aria-hidden="true" size={16} />
        Hoàn tác
      </Button>
    </div>
  );
}
