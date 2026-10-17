# CAMPAIGN — Quyết định

Đi cặp với `docs/requirements/campaign.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-06, FR-07), `docs/01-product/journeys.md` (US-01, US-03, US-04),
  `docs/02-requirements/nfr.md` (NFR-REL-01, NFR-SEC-07, NFR-A11Y-06), `README.md` §Features "Levels that never run out".
- **Code:** `client/src/views/Home/` (DifficultyTabs: nhóm nút `aria-pressed`; CampaignGrid: lỗi + `Thử lại`; LevelTile:
  nhãn, dấu tích / sao), `client/src/hooks/levelRouting.ts` (`parseBootTarget`), `client/src/hooks/useLevelRouter.ts`,
  `client/src/game/levels/packLoader.ts` (`import()` động theo bậc).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Số màn mỗi bậc là requirement? → README chỉ nói "four tiers"; số 20/20/15/10 lấy từ pack đã commit (dữ liệu đã
  kiểm, invariant #17). Ghi trong `src/data/test-data.ts` (`TIER_SIZES`) — sinh lại pack với số khác thì sửa ở đó.
- **Q2** `d=EASY` (viết hoa) là hợp lệ? → Code so khớp chính xác chữ thường; docs không nói. Chốt: không hợp lệ → lời
  nhắn, giống bậc lạ. Không phải bug — vẫn về trang chủ tử tế.
- **Q3** Lỗi tải pack giả lập thế nào? → Chặn mọi chunk JS sau khi trang chủ đã tải (như rớt mạng), rồi đổi sang bậc chưa
  tải. Pack là chunk riêng theo bậc nên đây là đường lỗi thật của `loadPack`.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Seed hỏng → module `random-level`. Kỷ lục ghi sau khi thắng → `win`.

## Tech debt liên quan

Không có.
