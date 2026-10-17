import type { Difficulty, PackLevel } from "@/game/core/types";

/**
 * Giao thức giữa luồng chính và Worker sinh màn.
 *
 * Chỉ truyền dữ liệu **thuần** qua `postMessage` — `Level` chứa `LevelState` với
 * tham chiếu tới `Board` dùng chung, nên gửi thẳng sẽ nhân bản bàn cờ nhiều lần.
 * Gửi XSB rồi parse lại ở đầu bên kia vừa gọn vừa kiểm được.
 */

export interface GenerateRequest {
  readonly type: "generate";
  readonly requestId: number;
  readonly difficulty: Difficulty;
  readonly seed: number;
}

export interface GenerateSuccess {
  readonly type: "generated";
  readonly requestId: number;
  readonly level: PackLevel;
  readonly attempts: number;
  readonly elapsedMs: number;
}

export interface GenerateFailure {
  readonly type: "failed";
  readonly requestId: number;
  readonly reason: string;
}

export type WorkerRequest = GenerateRequest;
export type WorkerResponse = GenerateSuccess | GenerateFailure;

export function isWorkerResponse(value: unknown): value is WorkerResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (v.type === "generated" || v.type === "failed") && typeof v.requestId === "number";
}
