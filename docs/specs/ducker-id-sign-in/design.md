# Thiết kế · ducker-id-sign-in — đăng nhập Ducker ID tuỳ chọn

Liên quan: FR-17 · US-06 · NFR-SEC-07 · NFR-DATA-01 · ADR-0010
Spec dùng chung (hành vi, copy, env): `web-game/docs/superpowers/specs/2026-10-04-ducker-id-sign-in-design.md`

## Phần riêng của duck-push

- **Chỗ đặt:** header trang chủ, bên phải, trước `ThemeToggle` (`src/views/Home/index.tsx`). Không có ở màn chơi.
- **Nút:** `Button` variant `ghost`, nhãn chữ "Đăng nhập"; đang chờ dùng `pending` ("Đang đăng nhập…").
  Cao tối thiểu 44px, hover 150ms, không đổi kích thước khi hover, 0ms khi `prefers-reduced-motion`.
- **Đã đăng nhập:** nút tròn 32px (ảnh, hoặc chữ cái đầu trên nền `--color-primary`, chữ `--color-on-primary`),
  `aria-label` "Tài khoản Ducker ID". Menu là card `radius-lg` + `.overlay-in` (200ms): tên, email (bỏ dòng nếu thiếu),
  "Mở hồ sơ Ducker ID" (`target=_blank`), "Đăng xuất". Esc/bấm ngoài đóng; mũi tên/Home/End; Tab đóng; sau
  đăng xuất tiêu điểm sang nút "Đăng nhập".
- **Tệp:** `src/lib/{duckerTypes,duckerConfig,pkce,duckerAuth,duckerRequests,duckerSession,initials}.ts`
  (repo dùng `src/lib`, không phải `src/libs`; R-14 cấm `src/types` nên kiểu nằm trong `duckerTypes.ts`),
  `src/hooks/{useDuckerAuth,useAccountMenu}.ts`, `src/views/Home/components/AccountButton`.
- **Điểm nhạy cảm:** `src/app/page.tsx` import `@/lib/duckerSession` đầu tiên để bắt `?code/?state` và khôi phục
  `returnTo` (có `?level ?seed ?d`) trước khi `useLevelRouter` đọc URL.
- **Ngoại lệ NFR:** xem ADR-0010 (sessionStorage `ducker.pkce` only; mạng chỉ tới issuer, sau khi bấm; không gì khi cờ tắt).
- **e2e:** `scripts/e2e-serve.mjs` dựng hai bản (cờ tắt `:3427`, cờ bật `:3428` với issuer giả), `e2e/ducker-id-sign-in.spec.ts`.
