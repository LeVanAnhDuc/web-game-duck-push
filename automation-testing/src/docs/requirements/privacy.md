# PRIVACY — Mạng, storage, ngoại tuyến, console

- **REQ-PRIVACY-01** Game không gửi gì ra ngoài: một vòng chơi trọn vẹn không có request nào tới host khác site (NFR-DATA-01 "không gửi đi", README "No server, no game accounts").
- **REQ-PRIVACY-02** Không cookie; `localStorage` chỉ giữ tiến độ và tuỳ chọn của game (`sokoban:progress:v1`, `sokoban:settings:v1`); không dùng sessionStorage khi cờ đăng nhập tắt (NFR-DATA-01, ADR-0005).
- **REQ-PRIVACY-03** Màn đã mở thì chơi được tới khi thắng dù mất mạng — mọi luật chạy trong trình duyệt (ADR-0002 xuất tĩnh).
- **REQ-PRIVACY-04** Không có lỗi console hay lỗi trang trong suốt một vòng chơi.
