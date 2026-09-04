/// <reference lib="webworker" />

import { levelToPackLevel } from "@/game/core/level";
import { generateLevel } from "@/game/core/generator/generate";
import { runtimeBudget, runtimeProfile } from "@/game/core/generator/difficulty";
import type { WorkerRequest } from "./protocol";

/**
 * Worker sinh màn.
 *
 * Cả file này tồn tại vì một lý do duy nhất: sinh màn tốn tới ~1.5 giây và chạy trên
 * luồng chính thì cả trang đứng hình (NFR-PERF-08). Không đặt logic nào ở đây — nó
 * chỉ gọi `core/` rồi trả kết quả.
 */

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request?.type !== "generate") return;

  const startedAt = Date.now();
  try {
    const profile = runtimeProfile(request.difficulty);
    const result = generateLevel({
      seed: request.seed,
      difficulty: request.difficulty,
      budget: runtimeBudget(request.difficulty),
      maxAttempts: profile.maxAttempts
    });

    if (!result) {
      ctx.postMessage({
        type: "failed",
        requestId: request.requestId,
        reason: "Không sinh được màn trong ngân sách cho phép"
      });
      return;
    }

    ctx.postMessage({
      type: "generated",
      requestId: request.requestId,
      level: levelToPackLevel(result.level),
      attempts: result.attempts,
      elapsedMs: Date.now() - startedAt
    });
  } catch (error) {
    ctx.postMessage({
      type: "failed",
      requestId: request.requestId,
      reason: error instanceof Error ? error.message : "Lỗi không xác định khi sinh màn"
    });
  }
});
