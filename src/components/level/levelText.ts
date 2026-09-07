import type { Difficulty } from "@/game/core/types";

/** Chữ hiển thị của bậc khó và tên màn. Một chỗ duy nhất, để hai màn hình không lệch nhau. */

export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  easy: "Dễ",
  medium: "Vừa",
  hard: "Khó",
  expert: "Rất khó"
};

/** Mã màn chiến dịch do `scripts/generate-pack.ts` sinh ra: `easy-01`, `hard-12`… */
const CAMPAIGN_ID = /^(easy|medium|hard|expert)-(\d+)$/;

export function campaignNumber(levelId: string): number | null {
  const match = CAMPAIGN_ID.exec(levelId);
  if (!match) return null;
  const parsed = Number.parseInt(match[2] ?? "", 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Mã màn kế tiếp trong cùng bậc, hoặc `null` nếu mã không thuộc chiến dịch. */
export function nextCampaignId(levelId: string): string | null {
  const match = CAMPAIGN_ID.exec(levelId);
  const number = campaignNumber(levelId);
  if (!match || number === null) return null;
  return `${match[1]}-${String(number + 1).padStart(2, "0")}`;
}

export function levelTitle(levelId: string): string {
  const number = campaignNumber(levelId);
  return number === null ? "Màn ngẫu nhiên" : `Màn ${number}`;
}

export function levelSubtitle(levelId: string, difficulty: Difficulty): string {
  return `${DIFFICULTY_LABELS[difficulty]}${campaignNumber(levelId) === null ? "" : " · Chiến dịch"}`;
}
