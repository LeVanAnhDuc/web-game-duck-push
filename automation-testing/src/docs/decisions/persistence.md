# PERSISTENCE — Quyết định

Đi cặp với `docs/requirements/persistence.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-09), `docs/01-product/journeys.md` (US-04, US-05 + "Điều gì có thể
  sai", US-01 "localStorage bị chặn"), `docs/02-requirements/nfr.md` (NFR-REL-04, NFR-DATA-04, NFR-SEC-07),
  `docs/decisions/0005-local-storage-only.md`, `README.md` §Features "Records, progress and the game you left half-finished
  survive closing the tab".
- **Code:** `client/src/game/storage/` (`progressRepository.ts`: kiểm từng trường, sai là bỏ cả khối; `safeStorage.ts`:
  không ném), `client/src/hooks/useSokobanGame.ts` (lưu ván dở khi `moves > 0`, xoá khi thắng),
  `client/src/views/Home/mains/ResumeCard/index.tsx`.
- **Test đã gom (gợi ý):** "kỷ lục sống qua một lần tải lại trang" trong `client/e2e/game.spec.ts` → TC-PERSISTENCE-004.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** "Bị chặn" giả lập thế nào? → Thay `Storage.prototype.getItem/setItem/removeItem` bằng hàm ném `SecurityError`
  trước khi trang chạy; "đầy" = chỉ `setItem` ném `QuotaExceededError`. Hai lỗi thật mà trình duyệt trả.
- **Q2** Bấm `Chơi lại` (hoặc hoàn tác về 0 nước) rồi rời trang: code không ghi gì khi `moves === 0`, nên bản lưu vẫn là
  ván **trước** khi chơi lại, và thẻ mở lại đúng ván người chơi vừa vứt đi. US-05 hứa "trở lại **đúng trạng thái đang
  dở**" → **bug** BUG-PERSISTENCE-01 (TC-PERSISTENCE-009 `test.fail()`). Mong đợi chấp nhận cả "không có thẻ" lẫn "thẻ 0
  bước". Không sửa code game ở PR này.
- **Q3** Thời gian trên thẻ: là `elapsedMs` lúc lưu nước cuối; không kiểm giá trị cụ thể (phụ thuộc thời gian thật).

## Tài khoản test

Không có.

## Ngoài phạm vi

- Ghi đè kỷ lục khi thắng → module `win`. Theme được nhớ → `theme`.

## Tech debt liên quan

Không có.
