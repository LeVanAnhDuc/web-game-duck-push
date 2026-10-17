# DEADLOCK — Test cases

Requirement: `docs/requirements/deadlock.md` · quyết định: `docs/decisions/deadlock.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-DEADLOCK-001 — đẩy thùng vào góc không phải đích thì hiện dải cảnh báo kèm nút hoàn tác

- **Requirement:** REQ-DEADLOCK-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn 1 → đi chuỗi phím ngắn nhất đẩy một thùng vào góc không phải đích (tìm bằng mô hình)
- **Mong đợi:** trước cú đẩy cuối không có dải; sau đó dải `Thùng này kẹt rồi — hoàn tác?` với nút `Hoàn tác` bấm được
- **Automated:** `tests/e2e/deadlock/warning.e2e.ts`

### TC-DEADLOCK-002 — nút hoàn tác trên dải gỡ đúng cú đẩy vừa rồi và dải biến mất

- **Requirement:** REQ-DEADLOCK-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** đẩy thùng vào góc → bấm `Hoàn tác` trên dải
- **Mong đợi:** dải biến mất; bộ đếm bằng lúc trước cú đẩy
- **Automated:** `tests/e2e/deadlock/warning.e2e.ts`

### TC-DEADLOCK-003 — cảnh báo là một dải, không phải hộp thoại: nút Hoàn tác của hàng điều khiển vẫn thấy và bấm được

- **Requirement:** REQ-DEADLOCK-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** đẩy thùng vào góc → tìm phần tử nằm trên tâm nút `Hoàn tác` của hàng điều khiển → bấm nó
- **Mong đợi:** không có `role=dialog`; phần tử trên cùng ở tâm nút là chính nút đó; bấm xong dải biến mất
- **Automated:** `tests/e2e/deadlock/warning.e2e.ts`

### TC-DEADLOCK-004 — cảnh báo kẹt được báo qua vùng thông báo cho trình đọc màn hình

- **Requirement:** REQ-DEADLOCK-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** đẩy thùng vào góc
- **Mong đợi:** live region `Cảnh báo: có thùng bị kẹt, nên hoàn tác.`
- **Automated:** `tests/e2e/deadlock/warning.e2e.ts`

### TC-DEADLOCK-005 — hai thùng cùng kẹt thì dải nói số thùng kẹt

- **Requirement:** REQ-DEADLOCK-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** đẩy cả hai thùng của màn 1 vào góc
- **Mong đợi:** dải `2 thùng kẹt rồi — hoàn tác?`
- **Automated:** `tests/e2e/deadlock/warning.e2e.ts`

### TC-DEADLOCK-006 — đi trọn lời giải tối ưu của năm màn Dễ đầu không một lần báo kẹt nhầm

- **Requirement:** REQ-DEADLOCK-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Bước:** easy-01…05: gõ từng phím của lời giải tối ưu, kiểm dải sau mỗi phím
- **Mong đợi:** không lần nào có dải; mỗi màn kết thúc bằng `Xong màn!`
- **Automated:** `tests/e2e/deadlock/warning.e2e.ts`
