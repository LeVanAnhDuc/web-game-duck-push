import { describe, expect, it } from "vitest";
import { campaignNumber, levelSubtitle, levelTitle, nextCampaignId, randomLevelId } from "./levelText";

/**
 * Phản hồi UX 2026-09 (F-06).
 *
 * Generator đặt mã màn là `${bậc}-${seed}`, mà `campaignNumber` nhận dạng màn chiến
 * dịch bằng `^(easy|…)-(\d+)$` — nên một màn sinh ra **khớp** mẫu đó và cả tầng đặt
 * tên coi nó là màn chiến dịch số 4.152.196.902. Người chơi thấy "Màn 4152196902".
 *
 * Nhưng con số đó đang gánh một việc thật: người nhận link đối chiếu nó với `seed`
 * trên thanh địa chỉ để tin mình mở đúng màn bạn gửi. Nên nó phải **chuyển chỗ**,
 * không được biến mất.
 */

describe("randomLevelId", () => {
  it("không bao giờ trông giống mã màn chiến dịch", () => {
    expect(campaignNumber(randomLevelId("easy", 4152196902))).toBeNull();
    expect(campaignNumber(randomLevelId("hard", 7))).toBeNull();
  });

  it("giữ nguyên seed để đọc ngược ra được", () => {
    expect(randomLevelId("medium", 4152196902)).toContain("4152196902");
  });
});

describe("campaignNumber", () => {
  it("đọc được số màn của mã chiến dịch", () => {
    expect(campaignNumber("easy-01")).toBe(1);
    expect(campaignNumber("expert-12")).toBe(12);
  });

  it("trả null cho mã màn ngẫu nhiên", () => {
    expect(campaignNumber("easy-r4152196902")).toBeNull();
  });

  it("trả null cho mã không thuộc chiến dịch", () => {
    expect(campaignNumber("linh tinh")).toBeNull();
  });
});

describe("levelTitle", () => {
  it("gọi màn chiến dịch bằng số của nó", () => {
    expect(levelTitle("easy-01")).toBe("Màn 1");
  });

  it("gọi màn ngẫu nhiên là màn ngẫu nhiên, không phải Màn 4152196902", () => {
    expect(levelTitle(randomLevelId("easy", 4152196902))).toBe("Màn ngẫu nhiên");
  });
});

describe("levelSubtitle", () => {
  it("màn chiến dịch: bậc khó kèm chữ Chiến dịch", () => {
    expect(levelSubtitle("easy-01", "easy")).toBe("Dễ · Chiến dịch");
  });

  it("màn ngẫu nhiên: bậc khó kèm seed, vì seed là thứ người nhận link đối chiếu", () => {
    expect(levelSubtitle(randomLevelId("hard", 4152196902), "hard")).toBe(
      "Khó · Seed 4152196902"
    );
  });

  it("không bịa seed khi mã màn không mang seed đọc được", () => {
    expect(levelSubtitle("linh tinh", "easy")).toBe("Dễ");
  });
});

describe("nextCampaignId", () => {
  it("đi tiếp trong chiến dịch", () => {
    expect(nextCampaignId("easy-01")).toBe("easy-02");
    expect(nextCampaignId("hard-09")).toBe("hard-10");
  });

  it("màn ngẫu nhiên không có màn kế tiếp trong chiến dịch", () => {
    expect(nextCampaignId(randomLevelId("easy", 4152196902))).toBeNull();
  });
});
