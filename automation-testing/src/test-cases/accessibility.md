# ACCESSIBILITY — Test cases

Requirement: `docs/requirements/accessibility.md` · quyết định: `docs/decisions/accessibility.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-ACCESSIBILITY-001 — bàn cờ tự mô tả cho trình đọc màn hình theo vị trí: người, từng thùng, từng đích trống

- **Requirement:** REQ-ACCESSIBILITY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở màn 1 → đi theo lời giải tối ưu tới khi một thùng vào đích
- **Mong đợi:** `role=img`; tên truy cập đúng từng chữ với mô tả dựng từ mô hình (`Bàn cờ 11 trên 8. Bạn ở cột 10 hàng 5. Thùng ở …. Đích trống ở …. 0 trên 2 thùng đã vào đích.`) ở cả hai thời điểm
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`

### TC-ACCESSIBILITY-002 — mọi nút trên trang chủ và màn chơi đều có tên đọc được

- **Requirement:** REQ-ACCESSIBILITY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** liệt kê mọi `button` trên trang chủ và trên màn 1
- **Mong đợi:** không nút nào có tên rỗng; có `Về trang chủ` (nút chỉ có mũi tên)
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`

### TC-ACCESSIBILITY-003 — chơi trọn từ trang chủ chỉ bằng bàn phím, tiêu điểm luôn có viền thấy được

- **Requirement:** REQ-ACCESSIBILITY-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** trang chủ → `Tab` tới ô `Màn 1` (kiểm viền ở mỗi điểm dừng) → `Enter` → gõ lời giải
- **Mong đợi:** mỗi điểm dừng có viền tiêu điểm; màn mở; `Xong màn!`
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`

### TC-ACCESSIBILITY-004 — lớp phủ thắng là hộp thoại thật: nhận tiêu điểm, giữ Tab bên trong, Escape đóng và trả tiêu điểm

- **Requirement:** REQ-ACCESSIBILITY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đặt tiêu điểm vào `Chơi lại` của hàng điều khiển → thắng → `Tab` ×5, `Shift+Tab` → `Escape`
- **Mong đợi:** `aria-modal=true`; tiêu điểm vào nút đầu của hộp thoại và không ra ngoài; Escape đóng, tiêu điểm về `Chơi lại`
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`

### TC-ACCESSIBILITY-005 — trạng thái ô phân biệt bằng hình dạng chứ không chỉ bằng màu

- **Requirement:** REQ-ACCESSIBILITY-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Bước:** mở màn 1 → đẩy một thùng vào đích
- **Mong đợi:** đầu màn: 2 vòng đích, 2 thùng có giằng chéo, người có đầu tròn; sau đó: 1 vòng, 1 thùng giằng, 1 thùng có dấu tích
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`
