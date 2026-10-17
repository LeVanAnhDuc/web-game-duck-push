# PRIVACY — Quyết định

Đi cặp với `docs/requirements/privacy.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/nfr.md` (§Data & Privacy: không thu thập, không gửi, không lưu PII; ngoại lệ ADR-0010
  chỉ khi cờ bật), `docs/01-product/overview.md` (Non-Goals: không server, không tài khoản), `docs/decisions/0002-static-export-and-dom-board.md`,
  `docs/decisions/0005-local-storage-only.md`, `README.md` ("No server, no game accounts: your records stay on your own device").
- **Code:** `client/src/game/storage/types.ts` (`STORAGE_KEYS`), `client/next.config.ts` (`output: "export"`).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** "Một vòng chơi" gồm gì? → Trang chủ, đổi giao diện (để có `settings`), một màn chiến dịch tới thắng, rồi một màn
  ngẫu nhiên (worker + chunk sinh màn) — phủ mọi đường tải tài nguyên của game.
- **Q2** Ngoại tuyến không nằm trong NFR bằng chữ; chốt thành requirement vì ADR-0002 chọn xuất tĩnh để mọi luật chạy trong
  trình duyệt — mất mạng giữa ván mà hỏng là trái quyết định đó. Mở màn **mới** khi mất mạng (chunk chưa tải) ngoài phạm vi.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Mở màn / bậc chưa tải khi đang ngoại tuyến (Q2). Đăng nhập Ducker ID → module `ducker-id`.

## Tech debt liên quan

Không có.
