# DUCKERID — Quyết định

Đi cặp với `docs/requirements/ducker-id.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-17), `docs/01-product/journeys.md` (US-06 + "Điều gì có thể sai"),
  `docs/decisions/0010-ducker-id-sign-in.md`, `docs/specs/ducker-id-sign-in/design.md`, `docs/02-requirements/nfr.md`
  (ngoại lệ PII của ADR-0010), `README.md` §Features "Optional Ducker ID sign-in".
- **Code:** `client/src/lib/duckerAuth.ts` (PKCE, chặn bấm đúp, không cất được verifier thì không đi), `duckerSession.ts`
  (bắt callback lúc nạp module), `duckerRequests.ts` (`AbortSignal.timeout` 15s), `client/src/hooks/useAccountMenu.ts`,
  `client/src/views/Home/components/AccountButton/index.tsx`, `client/scripts/e2e-serve.mjs` (bản bật cờ, issuer giả).
- **Test đã gom (gợi ý):** `client/e2e/ducker-id-sign-in.spec.ts` (5 case cờ bật + 1 case cờ tắt) → TC-DUCKERID-001/002/003/
  007/008/011; issuer giả lặp lại trong từng case → `src/fixtures/issuer.fixture.ts` (chế độ ok / deny / tamper / hang).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** `waitForTimeout(1000)` của bộ cũ (chờ trang lắng) → `expect.poll` trên URL sạch: test chờ đúng điều nó cần.
- **Q2** Hai case US-06 nhắc mà bộ cũ không có: issuer treo (TC-DUCKERID-009) và sessionStorage bị chặn (TC-DUCKERID-010).
- **Q3** Nút đăng nhập khớp tên **chính xác** `Đăng nhập`: nhãn khi đang bay `Đang đăng nhập…` cũng chứa chữ đó (bài học
  từ web-game-duck-mines).
- **Q4** `AbortSignal.timeout` là timer gốc, `page.clock` không tua được → TC-DUCKERID-009 chờ thật (~15s).

## Tài khoản test

Không có tài khoản thật: issuer giả `http://ducker.test` (không phân giải được) do fixture `fakeIssuer` trả lời, người dùng
giả `Lê Văn Anh Đức <duc@ducker.id>` (`src/data/test-data.ts`).

## Ngoài phạm vi

- Ducker ID thật (redirect URI, CORS) — cấu hình bên Ducker ID; suite không gọi dịch vụ thật.
- Ảnh đại diện từ userinfo (`picture`) — issuer giả không trả ảnh.

## Tech debt liên quan

Không có.
