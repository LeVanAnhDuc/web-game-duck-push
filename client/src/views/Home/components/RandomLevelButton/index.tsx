"use client";

import { Shuffle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { DIFFICULTY_LABELS } from "@/lib/levelText";
import type { Difficulty, Level } from "@/game/core/types";
import { requestRandomLevel } from "@/game/workers/generatorClient";

/**
 * Nút sinh màn ngẫu nhiên (US-03).
 *
 * `requestRandomLevel` có trần cứng 6 giây và luôn kết thúc bằng resolve hoặc
 * reject, nên nút này **không bao giờ quay mãi**. Việc còn lại của giao diện là
 * đừng nuốt mất lời từ chối: hỏng thì nói ra bằng tiếng người, ngay dưới nút.
 */
export function RandomLevelButton({
  difficulty,
  onLevel
}: {
  readonly difficulty: Difficulty;
  readonly onLevel: (level: Level) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rời màn hình giữa chừng thì lời hứa vẫn về, nhưng không được setState nữa.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const generate = () => {
    setPending(true);
    setError(null);
    requestRandomLevel(difficulty).then(
      (level) => {
        if (!aliveRef.current) return;
        setPending(false);
        onLevel(level);
      },
      (reason: unknown) => {
        if (!aliveRef.current) return;
        setPending(false);
        setError(
          reason instanceof Error
            ? `Không sinh được màn: ${reason.message}`
            : "Không sinh được màn, thử lại giúp mình nhé."
        );
      }
    );
  };

  return (
    <div>
      <Button
        variant="primary"
        pending={pending}
        onClick={generate}
        className="w-full text-[16px]"
        data-testid="random-level"
      >
        {pending ? null : <Shuffle aria-hidden="true" size={18} />}
        {pending ? "Đang sinh màn…" : `Màn ngẫu nhiên · ${DIFFICULTY_LABELS[difficulty]}`}
      </Button>
      {error === null ? null : (
        <p role="alert" className="mt-2 text-[13px] text-[var(--color-destructive)]">
          {error}
        </p>
      )}
    </div>
  );
}
