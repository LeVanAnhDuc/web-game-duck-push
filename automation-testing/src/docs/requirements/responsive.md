# RESPONSIVE — Bố cục theo bề ngang màn hình

- **REQ-RESPONSIVE-01** Trang chủ không cuộn ngang ở mọi bề ngang 320–1440px (US-01 "Bàn cờ tràn khỏi màn hình 375px").
- **REQ-RESPONSIVE-02** Bàn cờ tự co theo màn hình thay vì cuộn: bàn lớn nhất nằm trọn trong khung nhìn, trang chơi không cuộn, hàng nút điều khiển vẫn thấy (README "The board resizes to fit the screen instead of scrolling", MASTER.md §Anti-Patterns).
- **REQ-RESPONSIVE-03** Cạnh ô không nhỏ hơn 24px ở màn hẹp nhất (vẫn bấm và nhìn được) và không quá 56px ở màn rộng (`useCellSize`, MASTER.md).
- **REQ-RESPONSIVE-04** Đổi cỡ cửa sổ giữa ván thì bàn cờ co lại cho vừa và ván giữ nguyên.
- **REQ-RESPONSIVE-05** Dải cảnh báo kẹt hiện thêm không đẩy hàng nút điều khiển ra khỏi màn hình 375px (FR-05, US-02).
