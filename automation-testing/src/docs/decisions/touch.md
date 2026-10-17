# TOUCH — Quyết định

Đi cặp với `docs/requirements/touch.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-10, FR-16), `docs/02-requirements/nfr.md` (NFR-A11Y-03/04),
  `docs/decisions/0009-click-a-neighbour-cell-to-step.md`, `docs/specs/ux-feedback-2026-09/design.md` (F-01: dòng nhắc trên máy
  có chuột), `README.md` §Features "Built for a phone as much as a keyboard".
- **Code:** `client/src/hooks/useSwipe.ts` (touch events, ngưỡng 24px, trục lệch nhiều hơn thắng),
  `client/src/hooks/useMediaQuery.ts` (`pointer: coarse`), `client/src/views/Play/components/DPad/index.tsx` (phím 56px),
  `client/src/views/Play/components/Controls/index.tsx`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Vuốt giả lập thế nào? → Chạm thật qua CDP (`Input.dispatchTouchEvent` start → move ×4 → end) trên Pixel 5: game
  nghe `touchstart`/`touchend`, một cú kéo bằng pointer chuột sẽ không chứng minh gì.
- **Q2** Ngưỡng 24px lấy từ code (`THRESHOLD_PX`), docs không nói số → ghi ở `src/data/test-data.ts`; kiểm hai phía biên
  (18px không đi, 30px đi).
- **Q3** "Máy có chuột" chạy trong file touch với `test.use(Desktop Chrome)` để hai mặt của cùng một luật nằm cạnh nhau.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Cử chỉ nhiều ngón (game bỏ qua khi có > 1 ngón) — không có requirement.

## Tech debt liên quan

Không có.
