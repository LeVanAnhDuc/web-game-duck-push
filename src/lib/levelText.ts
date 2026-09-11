import { randomLevelSeed } from "@/game/core/level";
import type { Difficulty } from "@/game/core/types";

// Mã màn do `core/` đặt ra; ở đây chỉ đọc lại nó để dựng chữ hiển thị.
export { randomLevelId, randomLevelSeed } from "@/game/core/level";

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

/**
 * Dòng phụ dưới tên màn.
 *
 * Với màn ngẫu nhiên, dòng này mang **seed** — và đó là một việc thật, không phải
 * trang trí. Người được bạn gửi link đối chiếu con số này với `?seed=` trên thanh
 * địa chỉ để tin rằng mình mở đúng màn: *"con số trong tiêu đề trùng khớp với con
 * số seed trong link nó gửi"* (phản hồi UX 2026-09, F-06). Đưa tên màn về "Màn
 * ngẫu nhiên" mà bỏ luôn seed là sửa một chỗ và phá một chỗ khác.
 */
export function levelSubtitle(levelId: string, difficulty: Difficulty): string {
  const label = DIFFICULTY_LABELS[difficulty];
  if (campaignNumber(levelId) !== null) return `${label} · Chiến dịch`;

  const seed = randomLevelSeed(levelId);
  return seed === null ? label : `${label} · Seed ${seed}`;
}
