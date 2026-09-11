"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nextCampaignId } from "@/lib/levelText";
import { describe, parseBootTarget, resolveBootTarget, writeUrl } from "./levelRouting";
import type { Difficulty, Direction, Level } from "@/game/core/types";
import { loadLevel } from "@/game/levels/packLoader";
import { requestRandomLevel } from "@/game/workers/generatorClient";
import type { SavedSession } from "@/game/storage/types";

/**
 * Điều hướng giữa hai màn hình và đồng bộ với thanh địa chỉ.
 *
 * Không dùng `useSearchParams` của Next: trang này xuất tĩnh, và đọc query bằng
 * hook đó buộc cả cây phải bọc `Suspense` chỉ để lấy một chuỗi có sẵn trong
 * `window.location`. Đọc thẳng trong effect vừa đơn giản vừa không vênh hydrate.
 *
 * Bất biến: **không bao giờ để trắng trang**. Seed sai, mã màn lạ, pack chưa có —
 * tất cả đều quay về trang chủ kèm một câu giải thích đọc được.
 */

export type LevelSource = "campaign" | "random";

export type Screen =
  | { readonly kind: "home" }
  | { readonly kind: "loading" }
  | {
      readonly kind: "play";
      readonly level: Level;
      readonly source: LevelSource;
      readonly resumeMoves: readonly Direction[] | null;
    };

export interface LevelRouter {
  readonly screen: Screen;
  readonly notice: string | null;
  readonly nextPending: boolean;
  readonly startLevel: (
    level: Level,
    source: LevelSource,
    resumeMoves?: readonly Direction[] | null
  ) => void;
  readonly openCampaignLevel: (difficulty: Difficulty, levelId: string) => Promise<void>;
  readonly resumeSaved: (saved: SavedSession) => Promise<void>;
  readonly goHome: () => void;
  readonly goNext: () => Promise<void>;
}

export function useLevelRouter(): LevelRouter {
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const [notice, setNotice] = useState<string | null>(null);
  const [nextPending, setNextPending] = useState(false);

  const startLevel = useCallback(
    (level: Level, source: LevelSource, resumeMoves: readonly Direction[] | null = null) => {
      setNotice(null);
      setScreen({ kind: "play", level, source, resumeMoves });
      // Màn ngẫu nhiên chia sẻ được bằng seed; màn chiến dịch bằng mã màn.
      writeUrl(
        source === "random"
          ? `seed=${level.seed}&d=${level.difficulty}`
          : `level=${level.id}&d=${level.difficulty}`
      );
    },
    []
  );

  const failToHome = useCallback((message: string) => {
    setScreen({ kind: "home" });
    setNotice(message);
    writeUrl("");
  }, []);

  const openCampaignLevel = useCallback(
    async (difficulty: Difficulty, levelId: string) => {
      setScreen({ kind: "loading" });
      try {
        startLevel(await loadLevel(difficulty, levelId), "campaign");
      } catch (error) {
        failToHome(`Không mở được màn ${levelId}: ${describe(error)}`);
      }
    },
    [startLevel, failToHome]
  );

  const resumeSaved = useCallback(
    async (saved: SavedSession) => {
      setScreen({ kind: "loading" });
      try {
        const level =
          saved.seed === null
            ? await loadLevel(saved.difficulty, saved.levelId)
            : await requestRandomLevel(saved.difficulty, saved.seed);
        startLevel(level, saved.seed === null ? "campaign" : "random", saved.moves);
      } catch (error) {
        failToHome(`Không mở lại được ván đang dở: ${describe(error)}`);
      }
    },
    [startLevel, failToHome]
  );

  const goHome = useCallback(() => {
    setNotice(null);
    setScreen({ kind: "home" });
    writeUrl("");
  }, []);

  const goNext = useCallback(async () => {
    if (screen.kind !== "play" || nextPending) return;
    const { level, source } = screen;
    setNextPending(true);
    try {
      if (source === "random") {
        startLevel(await requestRandomLevel(level.difficulty), "random");
        return;
      }
      const nextId = nextCampaignId(level.id);
      if (nextId === null) {
        failToHome("Màn này không nằm trong chiến dịch nên không có màn kế tiếp.");
        return;
      }
      startLevel(await loadLevel(level.difficulty, nextId), "campaign");
    } catch {
      failToHome("Hết màn trong bậc này rồi — chọn bậc khác hoặc chơi màn ngẫu nhiên nhé.");
    } finally {
      setNextPending(false);
    }
  }, [screen, nextPending, startLevel, failToHome]);

  // Đọc đường dẫn đúng một lần lúc mở trang. Mọi thay đổi state đều nằm trong
  // callback của promise, không nằm thẳng trong thân effect: đọc URL rồi đổi
  // màn hình ngay tại chỗ là kiểu vẽ liên hoàn mà React 19 cảnh báo.
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const target = parseBootTarget(window.location.search);
    if (target.kind === "none") return;

    void Promise.resolve()
      .then(() => {
        setScreen({ kind: "loading" });
        return resolveBootTarget(target);
      })
      .then(
        (level) => startLevel(level, target.kind === "campaign" ? "campaign" : "random"),
        (error: unknown) => failToHome(describe(error))
      );
  }, [startLevel, failToHome]);

  return {
    screen,
    notice,
    nextPending,
    startLevel,
    openCampaignLevel,
    resumeSaved,
    goHome,
    goNext
  };
}
