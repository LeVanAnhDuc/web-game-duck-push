"use client";

import clsx from "clsx";
import { DIFFICULTY_LABELS } from "@/lib/levelText";
import { DIFFICULTIES, type Difficulty } from "@/game/core/types";

/**
 * Hàng chọn bậc khó.
 *
 * Dùng nhóm nút với `aria-pressed` chứ không phải `role="tablist"`: mẫu tab thật
 * đòi mũi tên trái/phải và một `tabpanel` gắn kèm, mà ở đây lưới màn bên dưới
 * không phải panel của riêng tab nào — nó chỉ đổi nội dung.
 */
export function DifficultyTabs({
  value,
  onChange
}: {
  readonly value: Difficulty;
  readonly onChange: (difficulty: Difficulty) => void;
}) {
  return (
    <div role="group" aria-label="Bậc khó" className="flex flex-wrap gap-2">
      {DIFFICULTIES.map((difficulty) => {
        const active = difficulty === value;
        return (
          <button
            key={difficulty}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(difficulty)}
            className={clsx(
              "min-h-[44px] cursor-pointer rounded-[var(--radius-md)] border px-4 text-[16px] font-medium transition-colors duration-150 ease-out",
              active
                ? "border-transparent bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                : "border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-card)]"
            )}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </button>
        );
      })}
    </div>
  );
}
