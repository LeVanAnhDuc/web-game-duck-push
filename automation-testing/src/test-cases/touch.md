# TOUCH — Test cases

Requirement: `docs/requirements/touch.md` · quyết định: `docs/decisions/touch.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-TOUCH-001 — trên màn hình cảm ứng có D-pad bốn hướng có nhãn, không có dòng nhắc phím

- **Requirement:** REQ-TOUCH-01, REQ-TOUCH-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** Pixel 5 (project `app-touch`)
- **Bước:** mở màn 1
- **Mong đợi:** bốn nút `Đi lên` / `Sang trái` / `Sang phải` / `Đi xuống`; không có dòng nhắc phím
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-002 — chạm D-pad đi đúng hướng, kể cả đẩy thùng

- **Requirement:** REQ-TOUCH-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** chạm `Đi lên` → `Đi xuống` → `Sang trái`
- **Mong đợi:** nhân vật đi đúng từng bước; `Bước 3 · Đẩy 1`
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-003 — vuốt trên bàn cờ đi một bước theo hướng vuốt; vuốt chéo theo trục lệch nhiều hơn

- **Requirement:** REQ-TOUCH-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** vuốt thật qua CDP: lên 80px; xuống 90px lệch phải 20px; trái 90px lệch xuống 10px
- **Mong đợi:** lên, xuống, trái (đẩy thùng); `Bước 3 · Đẩy 1`
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-004 — vuốt ngắn hơn ngưỡng 24px không đi

- **Requirement:** REQ-TOUCH-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** vuốt 18px lên, 18px phải → vuốt 30px lên
- **Mong đợi:** hai lần đầu không đổi gì; lần ba đi lên một ô
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-005 — phím D-pad và nút điều khiển đủ lớn cho ngón tay (≥ 44×44px)

- **Requirement:** REQ-TOUCH-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** đo hộp của bốn phím D-pad, `Hoàn tác`, `Làm lại`, `Chơi lại`, `Về trang chủ`
- **Mong đợi:** mỗi hộp ≥ 44×44
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-006 — chạm vào ô kề nhân vật cũng đi một bước

- **Requirement:** REQ-TOUCH-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** chạm ô ngay trên nhân vật
- **Mong đợi:** nhân vật lên một ô
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-007 — máy có chuột không có D-pad, chỉ có dòng nhắc bấm ô và phím

- **Requirement:** REQ-TOUCH-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** Desktop Chrome
- **Bước:** mở màn 1
- **Mong đợi:** dòng `Bấm vào ô cạnh nhân vật, hoặc dùng phím ← ↑ → ↓ · Z hoàn tác · R chơi lại`; không có phím D-pad
- **Automated:** `tests/e2e/touch/controls.e2e.ts`
