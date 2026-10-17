# ACCESSIBILITY — Trình đọc màn hình, bàn phím, hình dạng thay màu

- **REQ-ACCESSIBILITY-01** Bàn cờ có bản mô tả bằng chữ theo **vị trí** (cột/hàng đếm từ 1): kích thước, người chơi, từng thùng, thùng đã vào đích, từng đích trống, số thùng đã xong; cập nhật sau mỗi nước (NFR-A11Y-07, ux-feedback F-03).
- **REQ-ACCESSIBILITY-02** Mọi nút có tên đọc được, kể cả nút chỉ có biểu tượng (NFR-A11Y-04).
- **REQ-ACCESSIBILITY-03** Mọi hành động làm được bằng bàn phím — từ trang chủ tới thắng một màn — và tiêu điểm luôn có viền thấy được (NFR-A11Y-02).
- **REQ-ACCESSIBILITY-04** Lớp phủ thắng là hộp thoại đúng nghĩa: `aria-modal`, nhận tiêu điểm khi mở, giữ Tab bên trong, Escape đóng và trả tiêu điểm về chỗ cũ (NFR-A11Y-02, `Modal`).
- **REQ-ACCESSIBILITY-05** Không trạng thái nào của ô chỉ phân biệt bằng màu: đích là vòng tròn rỗng, thùng có thanh giằng chéo, thùng trên đích có dấu tích (vòng đích biến mất), người là hình đầu tròn (NFR-A11Y-06, invariant #18).
