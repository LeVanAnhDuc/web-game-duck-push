"use client";

import clsx from "clsx";
import { Check, Star } from "lucide-react";
import type { LevelRecord } from "@/game/storage/types";

/**
 * Một ô màn trong lưới chiến dịch.
 *
 * **Không màn nào bị khoá** (US-01) — lưới này chỉ kể chuyện đã chơi tới đâu,
 * không chặn ai cả. Trạng thái được kể bằng ba kênh cùng lúc: biểu tượng (hình),
 * viền (độ đậm) và nhãn `aria-label` (chữ). Không có gì chỉ nói bằng màu.
 */
export function LevelTile({
  levelNumber,
  record,
  onSelect
}: {
  readonly levelNumber: number;
  readonly record: LevelRecord | null;
  readonly onSelect: () => void;
}) {
  const solved = record !== null;
  const optimal = record?.optimal === true;

  const label = solved
    ? `Màn ${levelNumber}, đã giải${optimal ? ", đạt số đẩy tối ưu" : ""}, kỷ lục ${record.bestPushes} đẩy`
    : `Màn ${levelNumber}, chưa giải`;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      className={clsx(
        "level-tile relative flex cursor-pointer flex-col items-center justify-center border p-1 transition-colors duration-150 ease-out",
        solved
          ? "border-[var(--color-accent)] bg-[var(--color-card)]"
          : "border-[var(--color-border)] bg-transparent hover:bg-[var(--color-card)]"
      )}
    >
      <span className="num text-[16px] font-semibold">{levelNumber}</span>
      {record === null ? null : (
        <span className="num text-[11px] leading-tight text-[var(--color-muted-foreground)]">
          {record.bestPushes} đẩy
        </span>
      )}
      {optimal ? (
        <Star
          aria-hidden="true"
          size={14}
          className="absolute top-1 right-1"
          fill="var(--color-primary)"
          stroke="var(--color-primary)"
        />
      ) : solved ? (
        <Check
          aria-hidden="true"
          size={14}
          className="absolute top-1 right-1"
          stroke="var(--color-accent)"
          strokeWidth={3}
        />
      ) : null}
    </button>
  );
}
