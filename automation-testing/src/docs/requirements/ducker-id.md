# DUCKERID — Đăng nhập Ducker ID tuỳ chọn (sau cờ tính năng)

- **REQ-DUCKERID-01** Cờ tắt (bản deploy): không có nút, không menu, không đọc `?code`, không chạm sessionStorage, không request ra ngoài (ADR-0010, FR-17 "ship tối").
- **REQ-DUCKERID-02** Cờ bật: `Đăng nhập` ở header → Ducker ID → quay về, avatar + tên hiện ra; menu có tên, email, `Mở hồ sơ Ducker ID` (trỏ `<issuer>/profile`), `Đăng xuất` (US-06).
- **REQ-DUCKERID-03** Quay về đúng chỗ cũ: `?level` / `?d` còn nguyên, URL sạch `code` / `state` — kể cả sau khi Next hydrate và sau khi tải lại (US-06 bước 2, kết quả mong đợi).
- **REQ-DUCKERID-04** Đăng xuất trả lại nút `Đăng nhập` và đặt tiêu điểm vào nó; menu điều khiển được bằng bàn phím, Esc đóng và trả tiêu điểm về nút mở (NFR-A11Y-02).
- **REQ-DUCKERID-05** Đăng nhập chỉ là định danh: game chơi và lưu y như cũ; hồ sơ chỉ ở bộ nhớ của tab — không vào storage, tải lại là chưa đăng nhập; `ducker.pkce` bị xoá khi quay về (US-06, ngoại lệ PII của ADR-0010).
- **REQ-DUCKERID-06** Từ chối / huỷ ở Ducker ID, `state` bị sửa, mạng treo → âm thầm về `Đăng nhập`, không chặn game; `state` sai thì không bao giờ đổi code (US-06 "Điều gì có thể sai").
- **REQ-DUCKERID-07** Không cất được PKCE verifier (sessionStorage bị chặn) thì không chuyển trang — không để người chơi kẹt ở callback.
- **REQ-DUCKERID-08** Header ở 320–375px không xuống dòng, nút ≥ 44px, không đè tiêu đề hay nút giao diện; menu nằm trọn trong màn hình và không làm header nhảy (NFR-A11Y-03).
