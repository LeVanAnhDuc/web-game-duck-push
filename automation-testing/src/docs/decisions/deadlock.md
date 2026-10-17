# DEADLOCK — Quyết định

Đi cặp với `docs/requirements/deadlock.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-05), `docs/01-product/journeys.md` (US-02 + "Điều gì có thể sai"),
  `docs/03-design/invariants.md` (#16 dò bế tắc phải sound), `docs/design-system/sokoban/MASTER.md` §Anti-Patterns (cảnh báo
  không là hộp thoại), `README.md` §Features "It tells you when a crate is dead".
- **Code:** `client/src/views/Play/components/DeadlockBanner/index.tsx`, `client/src/views/Play/index.tsx` (`showDeadlock`,
  live region), `client/src/game/core/deadlock.ts` (ô chết tĩnh + thùng đóng băng).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Thế kẹt dựng thế nào? → Góc không phải đích (hai tường vuông góc) — trường hợp chắc chắn chết mà mọi bộ dò sound
  đều phải bắt; tìm bằng mô hình của suite trên màn thật. Các thế đóng băng phức tạp hơn để unit test của app
  (`client/src/game/core/deadlock.test.ts`).
- **Q2** "Không báo nhầm" chứng minh tới đâu? → Mọi vị trí trên lời giải tối ưu của easy-01…05 đều còn thắng được, nên
  không vị trí nào được có dải. Không thể chứng minh cho mọi thế bằng e2e.
- **Q3** Tuỳ chọn tắt cảnh báo (`showDeadlockWarning` trong settings) chưa có chỗ bật/tắt trên UI → ngoài phạm vi.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Tuỳ chọn tắt cảnh báo (Q3). Ô chết dọc tường không phải góc (Q1).

## Tech debt liên quan

Không có.
