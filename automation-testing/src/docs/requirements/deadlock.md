# DEADLOCK — Cảnh báo thùng kẹt

- **REQ-DEADLOCK-01** Đẩy một thùng vào chỗ nó không bao giờ ra được (góc không phải đích) thì hiện dải `Thùng này kẹt rồi — hoàn tác?` ngay dưới bàn cờ, kèm nút `Hoàn tác` (FR-05, US-02).
- **REQ-DEADLOCK-02** Nút `Hoàn tác` trên dải gỡ đúng cú đẩy vừa rồi; thế kẹt được gỡ thì dải biến mất (FR-05, US-02).
- **REQ-DEADLOCK-03** Cảnh báo là một dải, không phải hộp thoại: không chắn nút `Hoàn tác` của hàng điều khiển (FR-05, US-02 "Điều gì có thể sai").
- **REQ-DEADLOCK-04** Cảnh báo được báo qua live region (NFR-A11Y-04).
- **REQ-DEADLOCK-05** Nhiều thùng cùng kẹt thì dải nói số thùng (`N thùng kẹt rồi`).
- **REQ-DEADLOCK-06** Dò kẹt phải *sound*: không bao giờ báo kẹt ở một thế còn thắng được (invariant #16, README "never cries wolf").
