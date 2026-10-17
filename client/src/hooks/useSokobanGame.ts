"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { progressStore, writeProgress } from "./storageStore";
import type { Direction, Level } from "@/game/core/types";
import {
  applyMove,
  createSession,
  elapsedMs,
  moveHistory,
  redo,
  replay,
  restart,
  undo
} from "@/game/session/session";
import type { GameSession } from "@/game/session/types";
import { recordSolve, saveInProgress } from "@/game/storage/progressRepository";
import type { LevelRecord } from "@/game/storage/types";

/**
 * Chủ sở hữu duy nhất của `GameSession` trong tầng giao diện.
 *
 * Bất biến của lõi được tận dụng thẳng: `applyMove` trả về **đúng object cũ** khi
 * nước đi không hợp lệ, nên `setSession` với giá trị y hệt sẽ không kích hoạt lần
 * vẽ nào. Không cần tự kiểm tra tính hợp lệ ở đây, và cũng không được phép — luật
 * chỉ nằm ở một chỗ.
 *
 * Hook này giả định **một màn cho suốt vòng đời của nó**. Đổi màn thì đổi `key`
 * của component gọi nó, đừng đổi prop `level`.
 */

export interface UseSokobanGameArgs {
  readonly level: Level;
  /** Màn ngẫu nhiên lưu seed để sinh lại; màn chiến dịch đọc từ pack nên là `null`. */
  readonly seed: number | null;
  /** Dãy nước của ván đang dở, phát lại khi khôi phục. */
  readonly resumeMoves?: readonly Direction[] | null;
}

export interface SokobanGame {
  readonly session: GameSession;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  /** Kỷ lục **trước** ván này — HUD và lớp phủ thắng đều so với con số này. */
  readonly record: LevelRecord | null;
  readonly move: (direction: Direction) => void;
  readonly undoMove: () => void;
  readonly redoMove: () => void;
  readonly restartLevel: () => void;
}

export function useSokobanGame({ level, seed, resumeMoves }: UseSokobanGameArgs): SokobanGame {
  const [session, setSession] = useState<GameSession>(() =>
    resumeMoves && resumeMoves.length > 0 ? replay(level, resumeMoves) : createSession(level)
  );

  // Kỷ lục cũ được chốt ngay lúc mở màn và **không đổi nữa**: sau khi thắng,
  // `recordSolve` ghi đè kỷ lục, mà lớp phủ thì cần khoe con số trước đó.
  const [record] = useState<LevelRecord | null>(
    () => progressStore.getSnapshot().records[level.id] ?? null
  );

  const move = useCallback((direction: Direction) => {
    setSession((current) => applyMove(current, direction));
  }, []);
  const undoMove = useCallback(() => setSession((current) => undo(current)), []);
  const redoMove = useCallback(() => setSession((current) => redo(current)), []);
  const restartLevel = useCallback(() => setSession((current) => restart(current)), []);

  // Lưu ván đang dở. Đọc `Progress` mới nhất từ kho ngay lúc ghi, không giữ bản
  // sao trong state: ghi đè bằng bản sao cũ là mất kỷ lục vừa lập.
  useEffect(() => {
    if (session.solved || session.moves === 0) return;
    writeProgress(
      saveInProgress(progressStore.getSnapshot(), {
        levelId: level.id,
        difficulty: level.difficulty,
        seed,
        moves: moveHistory(session),
        elapsedMs: elapsedMs(session),
        savedAt: Date.now()
      })
    );
  }, [session, level.id, level.difficulty, seed]);

  // Ghi kỷ lục đúng một lần cho mỗi lần thắng. Hoàn tác rồi thắng lại được tính
  // là lần thắng mới, nên cờ được gỡ ngay khi ván quay về trạng thái chưa thắng.
  const recordedRef = useRef(false);
  useEffect(() => {
    if (!session.solved) {
      recordedRef.current = false;
      return;
    }
    if (recordedRef.current) return;
    recordedRef.current = true;

    const updated = recordSolve(progressStore.getSnapshot(), {
      levelId: level.id,
      pushes: session.pushes,
      moves: session.moves,
      timeMs: elapsedMs(session),
      optimalPushes: level.optimalPushes
    });
    // Thắng rồi thì không còn "đang chơi dở" nữa.
    writeProgress(saveInProgress(updated, null));
  }, [session, level.id, level.optimalPushes]);

  return {
    session,
    canUndo: session.past.length > 0,
    canRedo: session.future.length > 0,
    record,
    move,
    undoMove,
    redoMove,
    restartLevel
  };
}
