# THEME — Quyết định

Đi cặp với `docs/requirements/theme.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-12), `docs/02-requirements/nfr.md` (NFR-A11Y-05),
  `docs/decisions/0001-design-tokens.md`, `docs/specs/ux-feedback-2026-09/design.md` (F-04 nhãn chữ trên nút giao diện),
  `README.md` §Features "Light and dark themes follow the system, or you can pin one", "`prefers-reduced-motion` removes
  animation entirely".
- **Code:** `client/src/hooks/useTheme.ts` (`system` = gỡ `data-theme`; vòng `system → light → dark`),
  `client/src/views/Home/components/ThemeToggle/index.tsx`, `client/src/app/globals.css` (`prefers-color-scheme`,
  `[data-theme]`, `prefers-reduced-motion`: `--motion-step: 0ms` và `transition-duration: 0.001ms !important`).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Sáng/tối nhận biết bằng gì? → Màu nền thật của `body`, so với màu tham chiếu đo trên chính trang ở hai chế độ hệ
  khi chưa có lựa chọn. Không so mã màu cứng: điều phải chứng minh là "đổi chế độ", không phải giá trị token.
- **Q2** NFR-A11Y-05 nói "về 0ms, không phải rút ngắn"; CSS đặt `0.001ms` (kỹ thuật phổ biến để sự kiện `transitionend`
  vẫn bắn). Chốt: ≤ 0,01ms là "về 0" — mắt không thấy chuyển động nào; không phải bug.
- **Q3** Nút ở góc phải dễ bị nhầm là "tài khoản" (F-04) → kiểm cả nhãn chữ thấy được, không chỉ `aria-label`.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Tương phản màu (NFR-A11Y-01) — bảng đo nằm trong `MASTER.md`, không đo lại bằng e2e.

## Tech debt liên quan

Không có.
