"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { DIFFICULTY_LABELS, levelTitle } from "@/lib/levelText";
import type { Difficulty } from "@/game/core/types";

/** Thanh trên cùng của bàn chơi: đường về, tên màn, bậc khó. */
export function BackBar({
  levelId,
  difficulty,
  onBack
}: {
  readonly levelId: string;
  readonly difficulty: Difficulty;
  readonly onBack: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-2 py-2">
      <Button variant="ghost" aria-label="Về trang chủ" onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={20} />
      </Button>
      <div className="min-w-0">
        <h1 className="truncate text-[16px] font-medium">{levelTitle(levelId)}</h1>
        <p className="label leading-tight">{DIFFICULTY_LABELS[difficulty]}</p>
      </div>
    </header>
  );
}
