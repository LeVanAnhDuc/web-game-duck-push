"use client";

import { useRef, useState } from "react";
import { BackBar } from "./BackBar";
import { Controls } from "./Controls";
import { DeadlockBanner } from "./DeadlockBanner";
import { HudStrip } from "./HudStrip";
import { WinOverlay } from "./WinOverlay";
import { Board } from "@/components/board/Board";
import type { Direction, Level } from "@/game/core/types";
import type { GameSession } from "@/game/session/types";
import { useCellSize } from "@/hooks/useCellSize";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { useSettings } from "@/hooks/useSettings";
import { useSokobanGame } from "@/hooks/useSokobanGame";
import { useSwipe } from "@/hooks/useSwipe";

/**
 * Bàn chơi.
 *
 * Thứ tự trên điện thoại là cố định: thanh về → dải HUD → bàn cờ → cảnh báo →
 * điều khiển. Bàn cờ nằm trong một khung `flex-1 min-h-0` và tự co theo chỗ còn
 * lại, nên **cả trang không cuộn** dù có thêm dải cảnh báo hay bớt D-pad.
 *
 * Component này giả định một màn cho suốt vòng đời — nơi gọi phải đặt `key` theo
 * mã màn để đổi màn là dựng lại từ đầu.
 */
export function Play({
  level,
  seed,
  resumeMoves,
  nextPending,
  onBack,
  onNext
}: {
  readonly level: Level;
  readonly seed: number | null;
  readonly resumeMoves: readonly Direction[] | null;
  readonly nextPending: boolean;
  readonly onBack: () => void;
  readonly onNext: () => void;
}) {
  const { session, canUndo, canRedo, record, move, undoMove, redoMove, restartLevel } =
    useSokobanGame({ level, seed, resumeMoves });

  const settings = useSettings();
  const elapsed = useElapsedTime(session);

  const areaRef = useRef<HTMLDivElement | null>(null);
  const cell = useCellSize(areaRef, level.initial.board.width, level.initial.board.height);

  /*
   * Lớp phủ không cần state riêng cho "đang mở": nó mở đúng khi ván đã thắng và
   * người chơi chưa đóng **chính ván đó**. Ghi nhớ theo tham chiếu session nên
   * hoàn tác rồi thắng lại sẽ mở ra lần nữa, còn hoàn tác thì tự đóng.
   */
  const [dismissedFor, setDismissedFor] = useState<GameSession | null>(null);
  const overlayOpen = session.solved && dismissedFor !== session;

  // Lớp phủ đang mở thì bàn phím thuộc về nó, không thuộc bàn cờ nữa.
  useKeyboardControls(
    { onMove: move, onUndo: undoMove, onRedo: redoMove, onRestart: restartLevel },
    !overlayOpen
  );
  useSwipe(areaRef, move, !overlayOpen);

  const showDeadlock =
    settings.showDeadlockWarning && !session.solved && session.stuckBoxes.length > 0;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <BackBar levelId={level.id} difficulty={level.difficulty} onBack={onBack} />

      <HudStrip
        moves={session.moves}
        pushes={session.pushes}
        elapsedMs={elapsed}
        optimalPushes={level.optimalPushes}
        record={record}
      />

      {/*
       * Khung đo: kích thước của nó **không** phụ thuộc bàn cờ (bàn cờ nằm trong
       * lớp `absolute`), nếu không thì đo — vẽ — đo lại thành vòng lặp.
       */}
      <div
        ref={areaRef}
        className="relative min-h-0 flex-1 px-4 py-2"
        style={{ touchAction: "none" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Board
            state={session.current}
            trail={session.trail}
            cell={cell}
            showTrail={settings.showTrail}
          />
        </div>
      </div>

      {showDeadlock ? (
        <DeadlockBanner
          stuckCount={session.stuckBoxes.length}
          canUndo={canUndo}
          onUndo={undoMove}
        />
      ) : null}

      <Controls
        canUndo={canUndo}
        canRedo={canRedo}
        solved={session.solved}
        onMove={move}
        onUndo={undoMove}
        onRedo={redoMove}
        onRestart={restartLevel}
        onShowResult={() => setDismissedFor(null)}
      />

      {/* Vùng thông báo: thắng và cảnh báo kẹt phải tới tai người không nhìn màn hình. */}
      <p aria-live="polite" className="sr-only">
        {session.solved
          ? `Xong màn với ${session.moves} bước và ${session.pushes} lần đẩy.`
          : showDeadlock
            ? "Cảnh báo: có thùng bị kẹt, nên hoàn tác."
            : ""}
      </p>

      <WinOverlay
        open={overlayOpen}
        levelId={level.id}
        moves={session.moves}
        pushes={session.pushes}
        elapsedMs={elapsed}
        optimalPushes={level.optimalPushes}
        previousRecord={record}
        nextPending={nextPending}
        onClose={() => setDismissedFor(session)}
        onRestart={restartLevel}
        onNext={onNext}
      />
    </div>
  );
}
