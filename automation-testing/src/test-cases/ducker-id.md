# DUCKERID — Test cases

Requirement: `docs/requirements/ducker-id.md` · quyết định: `docs/decisions/ducker-id.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-DUCKERID-001 — cờ tắt thì không có nút đăng nhập, không chạm sessionStorage, không request ra ngoài

- **Requirement:** REQ-DUCKERID-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Tiền điều kiện:** bản cờ tắt (project `app`)
- **Bước:** mở trang chủ → mở `?level=easy-01&d=easy&code=x&state=y`
- **Mong đợi:** không có `Đăng nhập` / `Tài khoản Ducker ID`; màn vẫn mở; sessionStorage rỗng; không request nào ra ngoài site
- **Automated:** `tests/e2e/ducker-id/flag-off.e2e.ts`

### TC-DUCKERID-002 — đăng nhập: thấy tài khoản, URL sạch; đăng xuất trả lại nút và tiêu điểm

- **Requirement:** REQ-DUCKERID-02, REQ-DUCKERID-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** bản cờ bật, issuer giả trả `ok`
- **Bước:** `Đăng nhập` → mở menu → `Đăng xuất`
- **Mong đợi:** nút `Tài khoản Ducker ID`; URL không có `code`/`state`; menu có tên, email, link hồ sơ đúng; sau đăng xuất `Đăng nhập` có tiêu điểm; console không có lỗi hydrate
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-003 — đăng nhập từ một đường dẫn màn chơi: quay về đúng màn, ?level và ?d còn nguyên, URL sạch cả sau khi tải lại

- **Requirement:** REQ-DUCKERID-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** thanh địa chỉ `?level=easy-01&d=easy` → `Đăng nhập` → chờ userinfo → tải lại
- **Mong đợi:** `Màn 1`; URL giữ `level`, `d`, không có `code`/`state`/`iss` sau khi lắng và sau khi tải lại
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-004 — mũi tên đi trong menu tài khoản, Esc đóng menu và trả tiêu điểm về nút

- **Requirement:** REQ-DUCKERID-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đăng nhập → mở menu → `↓` → `Escape`
- **Mong đợi:** `↓` giữ tiêu điểm trong menu; Esc đóng, tiêu điểm về `Tài khoản Ducker ID`
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-005 — đã đăng nhập vẫn chơi được như thường

- **Requirement:** REQ-DUCKERID-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** đăng nhập → mở màn 1 → `←`
- **Mong đợi:** `Bước 1 · Đẩy 1`
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-006 — hồ sơ chỉ nằm trong bộ nhớ: storage không giữ gì, tải lại là chưa đăng nhập

- **Requirement:** REQ-DUCKERID-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Bước:** đăng nhập → đọc localStorage + sessionStorage → tải lại
- **Mong đợi:** không chứa tên / email; `ducker.pkce` đã xoá; sau tải lại là `Đăng nhập`
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-007 — từ chối ở Ducker ID thì âm thầm về chưa đăng nhập, URL sạch

- **Requirement:** REQ-DUCKERID-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Tiền điều kiện:** issuer giả trả `error=access_denied`
- **Bước:** `Đăng nhập` → vòng qua issuer
- **Mong đợi:** `Đăng nhập`; URL không còn query; không có thông báo lỗi chặn
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-008 — state bị sửa thì về chưa đăng nhập và không bao giờ gọi tới token

- **Requirement:** REQ-DUCKERID-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Tiền điều kiện:** issuer giả trả `state=tampered`
- **Bước:** `Đăng nhập` → vòng qua issuer
- **Mong đợi:** `Đăng nhập`, không có nút tài khoản; URL sạch; endpoint token không bị gọi
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-009 — issuer treo thì sau tối đa 15 giây về lại chưa đăng nhập

- **Requirement:** REQ-DUCKERID-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Tiền điều kiện:** issuer giả không bao giờ trả `/oauth/token`
- **Bước:** `Đăng nhập` → chờ
- **Mong đợi:** token được gọi đúng 1 lần; trong ≤ 20s nút `Đăng nhập` hiện lại; URL sạch
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-010 — sessionStorage bị chặn thì bấm đăng nhập không đưa đi đâu cả

- **Requirement:** REQ-DUCKERID-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** sessionStorage ném `SecurityError` → `Đăng nhập`
- **Mong đợi:** không request nào tới issuer; vẫn ở trang game; nút bấm lại được
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-011 — header ở 320px và 375px không xuống dòng, nút ≥ 44px, menu nằm trọn trong màn hình

- **Requirement:** REQ-DUCKERID-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** mỗi bề ngang: đo `Đăng nhập` → đăng nhập → đo nút tài khoản → mở menu
- **Mong đợi:** cùng hàng với nút giao diện (lệch tâm ≤ 3px), ≥ 44×44, không đè tiêu đề / nút giao diện; menu trong [0, width]; header không đổi hộp; không cuộn ngang
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`
