"use client";

import { Loader2 } from "lucide-react";
import { Home } from "@/views/Home";
import { Play } from "@/views/Play";
import { useLevelRouter } from "@/hooks/useLevelRouter";

/**
 * Tuyến duy nhất của game. Hai màn hình đổi nhau bằng state chứ không bằng router
 * của Next: trang này xuất tĩnh, và một ván đang chơi không chịu nổi việc bị tải
 * lại chỉ vì đổi đường dẫn.
 *
 * `useLevelRouter` giữ toàn bộ phần đọc/ghi thanh địa chỉ; ở đây chỉ còn việc
 * chọn xem vẽ cái gì.
 */
export default function Page() {
  const router = useLevelRouter();
  const { screen } = router;

  if (screen.kind === "loading") {
    return (
      <main className="flex h-[100dvh] items-center justify-center gap-2 text-[var(--color-muted-foreground)]">
        <Loader2 aria-hidden="true" size={20} className="animate-spin" />
        <p aria-live="polite">Đang mở màn…</p>
      </main>
    );
  }

  if (screen.kind === "play") {
    return (
      <Play
        // Đổi màn là dựng lại từ đầu: `useSokobanGame` chỉ phục vụ đúng một màn.
        key={`${screen.level.id}-${screen.level.seed}`}
        level={screen.level}
        seed={screen.source === "random" ? screen.level.seed : null}
        resumeMoves={screen.resumeMoves}
        nextPending={router.nextPending}
        onBack={router.goHome}
        onNext={() => void router.goNext()}
      />
    );
  }

  return (
    <Home
      notice={router.notice}
      onOpenCampaignLevel={(difficulty, levelId) =>
        void router.openCampaignLevel(difficulty, levelId)
      }
      onStartRandom={(level) => router.startLevel(level, "random")}
      onResume={router.resumeSaved}
    />
  );
}
