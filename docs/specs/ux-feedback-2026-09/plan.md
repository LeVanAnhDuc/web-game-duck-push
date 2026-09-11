# Kế hoạch — sửa phản hồi UX 2026-09

Thiết kế: [`design.md`](design.md) · Nguồn: [`../../ux-reviews/2026-09-12-deployed.md`](../../ux-reviews/2026-09-12-deployed.md)

> **Lệch quy trình, ghi ra chứ không giấu:** `feature-flow` §1 đòi wireframe ASCII rồi
> mockup canvas 375/768/1440, cả hai đều có cổng người duyệt. Người dùng yêu cầu chạy
> thẳng, không hỏi lại. Xem `backlog.md` §Nợ kỹ thuật — đây là lần thứ hai món nợ đó
> được ghi, và cả bảy thay đổi dưới đây đều sửa chữ hoặc thêm một nút vào bố cục đã có,
> không thay đổi bố cục nào.

## Việc

- [x] **1 — `boardGeometry`: hai hàm thuần cho việc bấm-để-đi.**
  `src/lib/boardGeometry.ts` + `boardGeometry.test.ts`.
  `cellFromPoint` trả `null` khi bấm hụt ra ngoài bàn (không kẹp về ô gần nhất).
  `stepDirection` chỉ nhận ô kề trực giao — **test chặn wrap dòng** là test quan trọng
  nhất của cả nhóm: index 4 và 5 lệch nhau đúng 1 nhưng nằm hai đầu bàn cờ.

- [x] **2 — `boardLabel` nói vị trí, không chỉ nói tổng số.**
  `src/lib/boardLabel.ts` + `boardLabel.test.ts`.
  Người chơi · từng thùng · từng đích trống, theo `cột C hàng H` đếm từ 1. Không kể
  tường. Thùng đã vào đích kể một lần ở nhóm riêng, **không** kể lại ở nhóm đích trống.

- [x] **3 — Mã màn ngẫu nhiên không còn trông giống mã chiến dịch.**
  `randomLevelId` / `randomLevelSeed` đặt ở `src/game/core/level.ts` — core là nơi mã
  màn sinh ra, nên hàm phải ở đó; `src/lib/levelText.ts` chỉ re-export để dựng chữ.
  `generate.ts` dùng nó thay cho chuỗi nội tuyến. `levelText.test.ts` phủ cả
  `campaignNumber`, `levelTitle`, `levelSubtitle`, `nextCampaignId`.

- [x] **4 — Bàn cờ nhận cú bấm.** `Board` thêm `onMove` tuỳ chọn; `onPointerDown` đổi
  điểm bấm thành ô, ô thành hướng, hướng thành đúng một bước. Không có `onMove` thì bàn
  cờ vẫn chỉ để nhìn như cũ.

- [x] **5 — Dòng nhắc phím viết lại.** `Controls`: vẽ `← ↑ → ↓` thay vì gọi tên chúng,
  bỏ `WASD` khỏi đầu dòng, nói ra cách bấm chuột, thôi dùng màu mờ.

- [x] **6 — Trang chủ: tên sản phẩm + một câu khác biệt.** `Home`: `SOKOBAN` → `DUCK PUSH`
  (sót của lần đổi thương hiệu — `<title>` đã là `Duck Push` từ trước), thêm một dòng
  nói màn do máy sinh và đã giải trước.

- [x] **7 — Nút đổi giao diện có chữ.** `ThemeToggle` thêm nhãn nhìn thấy được.

- [x] **8 — Lối ra thứ ba ở lớp phủ thắng.** `useLevelRouter.goRandom` → `page.tsx` →
  `Play` → `WinOverlay`. Dùng chung cờ `nextPending` vì hai lối ra loại trừ nhau.

- [x] **9 — Thanh tiêu đề màn chơi hiện seed.** `BackBar` dùng `levelSubtitle` thay cho
  nhãn bậc khó trần.

## Kiểm

- [x] `yarn typecheck`
- [x] `yarn lint`
- [x] `yarn test` — gồm `pack.test.ts` chạy lại solver trên cả 65 màn
- [x] `yarn test:e2e`
- [x] Nhìn app thật ở 375 / 768 / 1024 / 1440 (`feature-flow` §5)

## Cái cố ý KHÔNG làm

| Không làm | Vì sao |
| --- | --- |
| Thêm tài khoản / bảng xếp hạng / gợi ý | Non-Goal. Persona negative đi tìm cả ba và không thấy — đó là ranh giới đang hoạt động đúng, không phải lỗi |
| Bật D-pad cho cả thiết bị có chuột | Ba persona chơi bằng phím rất trôi; D-pad thừa lấy mất diện tích bàn cờ |
| Đổi ngưỡng `(pointer: coarse)` | Nó không cứu được người dùng chuột, và đổi một công tắc nhị phân đang đứng giữa hai bộ điều khiển là quyết định riêng, cần ADR riêng |
| Sửa `favicon.ico` 404 và cảnh báo preload woff2 | Không persona nào nhìn thấy. Báo cáo xếp chúng ngoài phạm vi UX; ghi vào `backlog.md` §Việc tiếp theo |
| Lấp khoảng trống giữa bàn cờ và cụm nút | Chỉ là quan sát từ ảnh của chuyên gia, **chưa persona nào vấp**. Sửa nó là sửa theo cảm nhận, đúng thứ quy trình này tồn tại để tránh |
