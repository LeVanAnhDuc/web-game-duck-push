"use client";

import { Check, Loader2, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { LevelTile } from "../../components/LevelTile";
import { campaignNumber } from "@/lib/levelText";
import type { Difficulty, LevelPack } from "@/game/core/types";
import { loadPack } from "@/game/levels/packLoader";
import type { LevelRecord } from "@/game/storage/types";

/**
 * Lưới màn chiến dịch của một bậc khó.
 *
 * Pack nạp bằng `import()` động nên có thể **chưa có, hoặc hỏng**. Cả hai đều
 * phải hiện ra thành chữ đọc được kèm nút thử lại — không bao giờ là lưới trắng
 * để người chơi tự đoán.
 */

/**
 * Kết quả mang theo bậc khó của chính nó. Đổi tab là kết quả cũ **tự** hết hiệu
 * lực ngay trong lúc vẽ, không cần một lượt `setState` để dọn dẹp — nhờ vậy
 * không có khoảnh khắc nào lưới màn Dễ nằm dưới nhãn Khó.
 */
type State =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly difficulty: Difficulty; readonly pack: LevelPack }
  | { readonly status: "error"; readonly difficulty: Difficulty; readonly message: string };

export function CampaignGrid({
  difficulty,
  records,
  onSelect
}: {
  readonly difficulty: Difficulty;
  readonly records: Readonly<Record<string, LevelRecord>>;
  readonly onSelect: (levelId: string) => void;
}) {
  const [result, setResult] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadPack(difficulty).then(
      (pack) => {
        if (!cancelled) setResult({ status: "ready", difficulty, pack });
      },
      (error: unknown) => {
        if (cancelled) return;
        setResult({
          status: "error",
          difficulty,
          message: error instanceof Error ? error.message : "Không tải được danh sách màn"
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [difficulty, attempt]);

  const retry = useCallback(() => {
    setResult({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  // Kết quả của bậc khó khác thì coi như chưa có gì.
  const state: State =
    result.status !== "loading" && result.difficulty === difficulty
      ? result
      : { status: "loading" };

  if (state.status === "loading") {
    return (
      <p
        className="flex items-center gap-2 py-6 text-[var(--color-muted-foreground)]"
        aria-live="polite"
      >
        <Loader2 aria-hidden="true" size={18} className="animate-spin" />
        Đang tải danh sách màn…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="card p-4">
        <p className="text-[16px] font-medium">Chưa tải được danh sách màn</p>
        <p className="mt-1 text-[13px] text-[var(--color-muted-foreground)]">{state.message}</p>
        <Button variant="secondary" onClick={retry} className="mt-3">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-5 gap-2 md:grid-cols-8 lg:grid-cols-10">
        {state.pack.levels.map((level, index) => (
          <LevelTile
            key={level.id}
            levelNumber={campaignNumber(level.id) ?? index + 1}
            record={records[level.id] ?? null}
            onSelect={() => onSelect(level.id)}
          />
        ))}
      </div>
      <Legend />
    </div>
  );
}

/** Chú giải hai ký hiệu của lưới — không ai phải đoán dấu sao nghĩa là gì. */
function Legend() {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--color-muted-foreground)]">
      <span className="inline-flex items-center gap-1">
        <Check aria-hidden="true" size={14} stroke="var(--color-accent)" strokeWidth={3} />
        đã giải
      </span>
      <span className="inline-flex items-center gap-1">
        <Star
          aria-hidden="true"
          size={14}
          fill="var(--color-primary)"
          stroke="var(--color-primary)"
        />
        đạt đúng số đẩy tối ưu
      </span>
      <span>Số nhỏ dưới mỗi ô là kỷ lục đẩy của bạn.</span>
    </p>
  );
}
