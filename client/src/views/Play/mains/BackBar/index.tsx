"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { levelSubtitle, levelTitle } from "@/lib/levelText";
import type { Difficulty } from "@/game/core/types";

/**
 * Thanh trên cùng của bàn chơi: đường về, tên màn, dòng phụ.
 *
 * Dòng phụ của màn ngẫu nhiên mang **seed**, và đó là một việc thật chứ không phải
 * trang trí: người được bạn gửi link đối chiếu con số đó với `?seed=` trên thanh
 * địa chỉ để tin mình mở đúng màn (F-06). Trước đây seed nằm ở chính **tên màn** —
 * "Màn 4152196902" — nên nó vừa làm việc đó vừa trông như một lỗi.
 */
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
        <p className="label truncate leading-tight">{levelSubtitle(levelId, difficulty)}</p>
      </div>
    </header>
  );
}
