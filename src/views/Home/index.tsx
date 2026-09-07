"use client";

import { useState } from "react";
import { CampaignGrid } from "./CampaignGrid";
import { DifficultyTabs } from "./DifficultyTabs";
import { RandomLevelButton } from "./RandomLevelButton";
import { ResumeCard } from "./ResumeCard";
import { ThemeToggle } from "./ThemeToggle";
import type { Difficulty, Level } from "@/game/core/types";
import { useProgress } from "@/hooks/useProgress";
import type { SavedSession } from "@/game/storage/types";

/**
 * Trang chủ: ván đang dở → màn ngẫu nhiên → lưới chiến dịch.
 *
 * Thiết kế cho 375px trước, mọi thứ trên nếp gấp trừ mấy hàng cuối của lưới
 * (MASTER.md §"Screen pattern").
 */
export function Home({
  notice,
  onOpenCampaignLevel,
  onStartRandom,
  onResume
}: {
  /** Câu giải thích khi vừa bị đá về đây từ một đường dẫn hỏng. */
  readonly notice: string | null;
  readonly onOpenCampaignLevel: (difficulty: Difficulty, levelId: string) => void;
  readonly onStartRandom: (level: Level) => void;
  readonly onResume: (saved: SavedSession) => Promise<void> | void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const progress = useProgress();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-4 pb-12">
      <header className="flex items-center justify-between gap-2">
        <h1 className="screen-title tracking-[0.06em]">SOKOBAN</h1>
        <ThemeToggle />
      </header>

      {notice === null ? null : (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-[13px]"
        >
          {notice}
        </p>
      )}

      {progress.inProgress === null ? null : (
        <ResumeCard saved={progress.inProgress} onResume={onResume} />
      )}

      <RandomLevelButton difficulty={difficulty} onLevel={onStartRandom} />

      <section aria-labelledby="campaign-heading" className="flex flex-col gap-3">
        <h2 id="campaign-heading" className="label">
          Chiến dịch
        </h2>
        <DifficultyTabs value={difficulty} onChange={setDifficulty} />
        <CampaignGrid
          difficulty={difficulty}
          records={progress.records}
          onSelect={(levelId) => onOpenCampaignLevel(difficulty, levelId)}
        />
      </section>
    </main>
  );
}
