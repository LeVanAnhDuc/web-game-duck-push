"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DIFFICULTY_LABELS, levelTitle } from "@/components/level/levelText";
import { loadLevel } from "@/game/levels/packLoader";
import { replay } from "@/game/session/session";
import { formatDuration } from "@/hooks/useElapsedTime";
import type { SavedSession } from "@/game/storage/types";

/**
 * Thẻ "đang chơi dở" (US-05).
 *
 * Mở lại một ván có thể phải sinh lại màn từ seed, tức là chờ vài trăm mili giây.
 * Thẻ tự giữ trạng thái chờ của mình để người chơi không bấm hai lần rồi tưởng máy treo.
 */
export function ResumeCard({
  saved,
  onResume
}: {
  readonly saved: SavedSession;
  readonly onResume: (saved: SavedSession) => Promise<void> | void;
}) {
  const [pending, setPending] = useState(false);
  const pushes = useSavedPushes(saved);

  return (
    <section aria-labelledby="resume-heading">
      <h2 id="resume-heading" className="label mb-2">
        Đang chơi dở
      </h2>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={() => {
          setPending(true);
          void Promise.resolve(onResume(saved)).finally(() => setPending(false));
        }}
        className="card flex w-full cursor-pointer items-center gap-3 p-4 text-left transition-shadow duration-150 ease-out hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-medium">
            {levelTitle(saved.levelId)} · {DIFFICULTY_LABELS[saved.difficulty]}
          </span>
          <span className="num mt-1 block text-[13px] text-[var(--color-muted-foreground)]">
            {saved.moves.length} bước
            {pushes === null ? "" : ` · ${pushes} đẩy`} · {formatDuration(saved.elapsedMs)}
          </span>
        </span>
        {pending ? (
          <Loader2 aria-hidden="true" size={20} className="animate-spin" />
        ) : (
          <ChevronRight aria-hidden="true" size={20} />
        )}
        <span className="sr-only">Chơi tiếp</span>
      </button>
    </section>
  );
}

/**
 * Số lần đẩy của ván đang dở.
 *
 * Bản lưu chỉ chứa dãy nước đi (hợp đồng `SavedSession`), nên số đẩy phải phát
 * lại mới biết. Với màn chiến dịch thì rẻ: pack đã nằm sẵn trong bộ nhớ đệm và
 * phát lại là O(số nước). Với màn ngẫu nhiên thì phải sinh lại cả màn — quá đắt
 * cho một dòng chữ, nên trả `null` và thẻ chỉ hiện số bước.
 */
function useSavedPushes(saved: SavedSession): number | null {
  const [pushes, setPushes] = useState<number | null>(null);

  useEffect(() => {
    if (saved.seed !== null) return;
    let cancelled = false;

    loadLevel(saved.difficulty, saved.levelId).then(
      (level) => {
        if (!cancelled) setPushes(replay(level, saved.moves).pushes);
      },
      // Pack lỗi thì thôi, không hiện số đẩy. Không bao giờ để hỏng trang chủ vì một con số.
      () => undefined
    );

    return () => {
      cancelled = true;
    };
  }, [saved]);

  return pushes;
}
