# RESPONSIVE — Quyết định

Đi cặp với `docs/requirements/responsive.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-01 "Điều gì có thể sai": bàn cờ tràn 375px), `docs/design-system/sokoban/MASTER.md`
  (§Screen pattern, §Anti-Patterns: bàn cờ không cuộn), `README.md` §Features "The board resizes to fit the screen".
- **Code:** `client/src/hooks/useCellSize.ts` (`MIN_CELL = 24`, `MAX_CELL = 56`, `ResizeObserver`),
  `client/src/views/Play/index.tsx` (khung `flex-1 min-h-0`, `h-[100dvh] overflow-hidden`).
- **Test đã gom (gợi ý):** project `mobile` (Pixel 5) của bộ cũ chạy mọi spec ở 393px; nay các điều phụ thuộc bề ngang
  gom về module này, đo ở bốn bề ngang.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Bốn khung nhìn nào? → 320×568 (máy nhỏ nhất còn phổ biến), 375×667 (mốc US-01), 768×1024, 1440×900.
- **Q2** "Bàn lớn nhất" chọn thế nào? → Tính từ pack đã commit (nhiều ô nhất trong bậc Khó / Rất khó), không ghi cứng mã
  màn — sinh lại pack thì test tự theo.
- **Q3** 24 / 56px là requirement? → Docs nói "vùng bấm đủ lớn" và "không cuộn"; hai số lấy từ `useCellSize.ts` (sàn/trần
  có chú thích lý do). Chốt dùng làm ngưỡng kiểm.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Xoay ngang điện thoại thật (orientation) — khác khung nhìn chỉ ở tỉ lệ, đã phủ bởi TC-RESPONSIVE-004.

## Tech debt liên quan

Không có.
