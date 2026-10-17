# WIN — Quyết định

Đi cặp với `docs/requirements/win.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-04, FR-07, FR-09), `docs/01-product/journeys.md` (US-01, US-04 +
  "Điều gì có thể sai"), `docs/02-requirements/nfr.md` (NFR-A11Y-02, NFR-A11Y-04), `docs/specs/ux-feedback-2026-09/design.md`
  (F-05: nút `Màn ngẫu nhiên` trên lớp phủ), `README.md` §Features "You always know what a perfect run looks like".
- **Code:** `client/src/views/Play/components/WinOverlay/index.tsx`, `client/src/components/Modal/index.tsx` (Escape, bẫy
  tiêu điểm), `client/src/hooks/useSokobanGame.ts` (kỷ lục chốt lúc mở màn), `client/src/game/storage/progressRepository.ts`
  (`isBetter`: đẩy → bước → thời gian), `client/src/hooks/useLevelRouter.ts` (`goNext`, `goRandom`).
- **Test đã gom (gợi ý):** "giải xong bằng bàn phím và được ghi nhận đạt tối ưu" trong `client/e2e/game.spec.ts` → TC-WIN-001.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Lời giải lấy ở đâu? → Bộ giải BFS của suite (`src/utils/sokoban.ts`) từ XSB của pack; lời giải "tệ hơn" = một cú
  đẩy đầu không nằm trên đường tối ưu + phần còn lại tối ưu (`suboptimalSolution`, 9 đẩy ở easy-01).
- **Q2** Kỷ lục cũ cài thế nào? → Ghi thẳng `sokoban:progress:v1` đúng hình dạng `Progress` (version 1) trước khi mở màn,
  như một người chơi quay lại. Không đi qua một ván thật để test nhanh và độc lập.
- **Q3** "Kỷ lục" so theo gì? → Số đẩy trước, rồi số bước (US-04 "So kỷ lục bằng số bước trong khi nhãn nói số lần đẩy —
  hai đại lượng khác nhau" là lỗi phải tránh) → TC-WIN-005.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Thời gian trong kỷ lục (tiêu chí phụ thứ ba) — không hiện ở đâu trên UI ngoài lớp phủ; không có requirement riêng.
- Bẫy tiêu điểm của hộp thoại → module `accessibility`.

## Tech debt liên quan

Không có.
