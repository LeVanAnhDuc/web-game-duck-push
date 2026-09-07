"use client";

import { RotateCcw, Trophy, Undo2, Redo2 } from "lucide-react";
import { DPad } from "./DPad";
import { Button } from "@/components/ui/Button";
import { useCoarsePointer } from "@/hooks/useMediaQuery";
import type { Direction } from "@/game/core/types";

/**
 * Cụm điều khiển dưới bàn cờ.
 *
 * D-pad chỉ có trên thiết bị chạm; máy tính nhận một dòng nhắc phím thay vào đó.
 * Hai thứ này loại trừ nhau — vẽ cả hai là chiếm mất chỗ của bàn cờ, mà bàn cờ
 * phải là phần tử lớn nhất ở mọi bề ngang.
 */
export function Controls({
  canUndo,
  canRedo,
  solved,
  onMove,
  onUndo,
  onRedo,
  onRestart,
  onShowResult
}: {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly solved: boolean;
  readonly onMove: (direction: Direction) => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onRestart: () => void;
  /** Mở lại lớp phủ kết quả sau khi người chơi đã đóng nó bằng Escape. */
  readonly onShowResult: () => void;
}) {
  const coarse = useCoarsePointer();

  return (
    <div className="flex shrink-0 flex-col items-center gap-3 px-4 pt-2 pb-4">
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={onUndo} disabled={!canUndo}>
          <Undo2 aria-hidden="true" size={18} />
          Hoàn tác
        </Button>
        <Button variant="secondary" onClick={onRedo} disabled={!canRedo}>
          <Redo2 aria-hidden="true" size={18} />
          Làm lại
        </Button>
        <Button variant="secondary" onClick={onRestart}>
          <RotateCcw aria-hidden="true" size={18} />
          Chơi lại
        </Button>
        {solved ? (
          <Button variant="secondary" onClick={onShowResult}>
            <Trophy aria-hidden="true" size={18} />
            Kết quả
          </Button>
        ) : null}
      </div>

      {coarse ? (
        <DPad onMove={onMove} />
      ) : (
        <p className="meta text-center text-[var(--color-muted-foreground)]">
          mũi tên/WASD để đi · Z hoàn tác · R chơi lại
        </p>
      )}
    </div>
  );
}
