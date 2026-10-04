# ADR-0010 · Đăng nhập Ducker ID tuỳ chọn, chỉ định danh, ship tối sau cờ tính năng

> **Ngày:** 2026-10-04
> **Trạng thái:** accepted
> **Liên quan:** FR-17 · US-06 · NFR-SEC-07 · NFR-DATA-01 · NFR-DATA-04 · Non-Goal "tài khoản"

## 1. Bối cảnh

Yêu cầu của người dùng (2026-10-04): mọi game trong workspace có thể đăng nhập bằng Ducker ID, cùng cơ chế với
`web-app-calculate-badminton` (OIDC Authorization Code + PKCE, public client). Phạm vi chỉ là **định danh**:
nút đăng nhập, avatar + tên, menu tài khoản. Lưu tiến độ, điểm, cài đặt không đổi. Chưa phát hành.

## 2. Quyết định

Thêm đăng nhập Ducker ID **tuỳ chọn**, thuần phía client, không backend, không đồng bộ. Cấu hình hoàn toàn bằng env
(`NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN`, `..._DUCKER_ISSUER`, `..._CLIENT_ID`, `..._SCOPE`, `..._PROFILE_PATH`, và
`NEXT_PUBLIC_BASE_PATH` thay cho `GITHUB_PAGES`); không có giá trị mặc định nào trong code. Cờ chỉ bật khi đúng chuỗi
`true` **và** đủ cả bốn giá trị; thiếu một cái thì không vẽ gì, không đụng URL/storage/mạng.
**Ship tối:** `deploy.yml` không truyền cờ hay `DUCKER_*`, nên bản GitHub Pages không có nút; chỉ thử ở máy.
Hồ sơ giữ trong bộ nhớ (tải lại = đăng xuất). Lỗi xác thực lặng lẽ về trạng thái chưa đăng nhập.

**Ngoại lệ có giới hạn cho NFR** (nguyên văn): *sessionStorage key `ducker.pkce` only, deleted on return; network only to the configured issuer, and to the profile picture URL it returns, only after sign-in; nothing when the flag is off.*
Áp cho: Non-Goal "không có tài khoản" → "không có tài khoản của game"; NFR-DATA-01 (PII), NFR-SEC-07 (kiểm dữ liệu từ URL: `code/state/error` được đọc và dọn khỏi URL, tham số game `?level ?seed ?d` giữ nguyên).

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Hardcode issuer / client_id làm mặc định | Người dùng cấm rõ: không import giá trị cứng rồi fallback về giá trị cứng |
| Lưu token / hồ sơ vào `localStorage` | Ngoài phạm vi (chỉ định danh); thêm bề mặt lộ token |
| Bật luôn trên bản deploy | Chưa đăng ký client trên Ducker ID; yêu cầu là chưa phát hành |

## 4. Hệ quả

**Được:** đăng nhập thử được ở máy mà bản deploy không đổi một byte hành vi; `basePath` đọc từ một biến, cũng là
nguồn của `redirect_uri`.

**Mất / phải chấp nhận:**
- Thêm một bề mặt mạng (chỉ tới issuer, chỉ sau khi bấm). Cần thêm origin của game vào `CORS_ORIGINS` của Ducker ID.
- Không thêm dependency nào.
- **Nợ `[skip release]`:** mọi commit của PR này mang `[skip release]` (người dùng chọn). `release.yml` quét cả khoảng
  từ tag gần nhất, nên mọi push sau đó lên `main` cũng bị bỏ qua cho tới khi có tag mới. Bản phát hành kế tiếp phải cắt
  tay một lần: `pnpm release:next` → `git tag vX.Y.Z && git push origin vX.Y.Z` →
  `gh release create vX.Y.Z --notes "$(pnpm -s release:notes)"`. Sau đó khoảng sạch và tự động hoá chạy lại.
- Cổng e2e chuyển sang `:3427 (cờ tắt) và :3428 (cờ bật)` vì `:3000` đang là Ducker ID khi chạy máy.
