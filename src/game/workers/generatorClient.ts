import { packLevelToLevel } from "@/game/core/level";
import type { Difficulty, Level } from "@/game/core/types";
import { isWorkerResponse, type WorkerRequest } from "./protocol";

/**
 * Cầu nối phía luồng chính tới Worker sinh màn.
 *
 * Ba thứ file này phải bảo đảm, vì thiếu cái nào cũng thành treo máy:
 *   1. Không bao giờ chờ vô hạn — có trần cứng (NFR-REL-03).
 *   2. Trình duyệt không có Worker thì vẫn sinh được, chỉ là chặn luồng chính (US-03).
 *   3. Mỗi yêu cầu có `requestId` riêng; trả lời đến muộn của yêu cầu cũ bị bỏ qua.
 */

/** Trần cứng. Generator tự hạ chuẩn trước ngưỡng này; chạm tới đây là có gì đó sai. */
const HARD_TIMEOUT_MS = 6000;

let worker: Worker | null = null;
let nextRequestId = 1;

function getWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./generator.worker.ts", import.meta.url));
    return worker;
  } catch {
    return null;
  }
}

/** Đường lui: chạy thẳng trên luồng chính. Chậm và giật, nhưng vẫn ra màn. */
async function generateOnMainThread(difficulty: Difficulty, seed: number): Promise<Level> {
  const [{ generateLevel }, { runtimeBudget, runtimeProfile }] = await Promise.all([
    import("@/game/core/generator/generate"),
    import("@/game/core/generator/difficulty")
  ]);

  const result = generateLevel({
    seed,
    difficulty,
    budget: runtimeBudget(difficulty),
    maxAttempts: runtimeProfile(difficulty).maxAttempts
  });
  if (!result) throw new Error("Không sinh được màn trong ngân sách cho phép");
  return result.level;
}

export function randomSeed(): number {
  // Chỗ duy nhất trong dự án được phép dùng Math.random: sinh seed ban đầu.
  // Từ đây trở đi mọi thứ đều tất định theo seed này (bất biến #14).
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

export function requestRandomLevel(difficulty: Difficulty, seed?: number): Promise<Level> {
  const resolvedSeed = seed ?? randomSeed();
  const activeWorker = getWorker();
  if (!activeWorker) return generateOnMainThread(difficulty, resolvedSeed);

  const requestId = nextRequestId;
  nextRequestId += 1;

  return new Promise<Level>((resolve, reject) => {
    const cleanup = () => {
      activeWorker.removeEventListener("message", onMessage);
      activeWorker.removeEventListener("error", onError);
      clearTimeout(timer);
    };

    const onMessage = (event: MessageEvent<unknown>) => {
      const data = event.data;
      if (!isWorkerResponse(data) || data.requestId !== requestId) return;
      cleanup();
      if (data.type === "failed") {
        reject(new Error(data.reason));
        return;
      }
      try {
        resolve(packLevelToLevel(data.level));
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Màn sinh ra không hợp lệ"));
      }
    };

    const onError = () => {
      cleanup();
      // Worker chết thì bỏ hẳn, lần sau tạo cái mới, và lần này lui về luồng chính.
      worker = null;
      generateOnMainThread(difficulty, resolvedSeed).then(resolve, reject);
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Sinh màn quá lâu, thử lại giúp mình"));
    }, HARD_TIMEOUT_MS);

    activeWorker.addEventListener("message", onMessage);
    activeWorker.addEventListener("error", onError);

    const request: WorkerRequest = {
      type: "generate",
      requestId,
      difficulty,
      seed: resolvedSeed
    };
    activeWorker.postMessage(request);
  });
}
