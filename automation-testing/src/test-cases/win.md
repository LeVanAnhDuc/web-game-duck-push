# WIN — Test cases

Requirement: `docs/requirements/win.md` · quyết định: `docs/decisions/win.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-WIN-001 — giải hết màn chỉ bằng bàn phím thì hiện Xong màn với bước, đẩy và lời khen đạt tối ưu

- **Requirement:** REQ-WIN-01, REQ-WIN-02, REQ-WIN-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn 1 → gõ lời giải tối ưu (bộ giải của suite) bằng phím mũi tên
- **Mong đợi:** hộp thoại `Xong màn!`; `<n> bước · 7 đẩy`; `Đạt đúng số đẩy tối ưu (7 đẩy).`; `Lần đầu bạn giải màn này.`
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-002 — giải nhiều đẩy hơn tối ưu thì lớp phủ nói còn thiếu bao nhiêu đẩy

- **Requirement:** REQ-WIN-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** màn 1 → gõ một lời giải 9 đẩy
- **Mong đợi:** `Tối ưu là 7 đẩy — còn 2 đẩy nữa là chạm đáy.`
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-003 — phá kỷ lục cũ thì lớp phủ báo vừa phá, và ô màn đổi sang kỷ lục mới có sao

- **Requirement:** REQ-WIN-03, REQ-WIN-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Tiền điều kiện:** kỷ lục cũ 9 đẩy cài sẵn trong `sokoban:progress:v1`
- **Bước:** mở màn 1 (HUD `KL bạn 9`) → giải 7 đẩy → về trang chủ
- **Mong đợi:** `Kỷ lục cũ: 9 đẩy — vừa bị bạn phá.`; ô `Màn 1, đã giải, đạt số đẩy tối ưu, kỷ lục 7 đẩy`
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-004 — ván tệ hơn kỷ lục không ghi đè kỷ lục

- **Requirement:** REQ-WIN-03, REQ-WIN-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Tiền điều kiện:** kỷ lục cũ 7 đẩy (tối ưu)
- **Bước:** giải 9 đẩy → về trang chủ
- **Mong đợi:** `Kỷ lục cũ: 7 đẩy.`; ô màn vẫn kỷ lục 7 đẩy, có sao
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-005 — kỷ lục so theo số đẩy chứ không theo số bước

- **Requirement:** REQ-WIN-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** kỷ lục cũ 8 đẩy nhưng chỉ 1 bước
- **Bước:** giải 7 đẩy (nhiều bước hơn)
- **Mong đợi:** `Kỷ lục cũ: 8 đẩy — vừa bị bạn phá.`; ô màn `7 đẩy`
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-006 — lớp phủ đang mở thì phím mũi tên không đi, và bàn cờ đã thắng đứng yên sau khi đóng

- **Requirement:** REQ-WIN-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** thắng → bấm mũi tên → Escape → bấm mũi tên
- **Mong đợi:** mô tả bàn cờ và bộ đếm giữ nguyên lúc thắng; hai thùng đã vào đích
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-007 — Escape đóng lớp phủ, nút Kết quả mở lại nó

- **Requirement:** REQ-WIN-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** trước khi thắng không có nút `Kết quả` → thắng → Escape → `Kết quả`
- **Mong đợi:** lớp phủ đóng rồi mở lại với cùng số liệu
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-008 — Chơi lại trên lớp phủ đóng lớp phủ và đưa màn về đầu

- **Requirement:** REQ-WIN-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** thắng → `Chơi lại` trên lớp phủ
- **Mong đợi:** lớp phủ đóng; bàn cờ như lúc mở; `Bước 0 · Đẩy 0`
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-009 — Tiếp mở màn kế tiếp của chiến dịch

- **Requirement:** REQ-WIN-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** thắng màn 1 → `Tiếp`
- **Mong đợi:** `Màn 2`, URL `?level=easy-02`, bộ đếm 0, số tối ưu của màn 2
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-010 — Tiếp ở màn cuối của bậc đưa về trang chủ kèm lời nhắn đọc được

- **Requirement:** REQ-WIN-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** thắng `easy-20` (màn cuối bậc Dễ) → `Tiếp`
- **Mong đợi:** trang chủ, lời nhắn `Hết màn trong bậc này rồi…`, URL không còn query
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-011 — Màn ngẫu nhiên trên lớp phủ sinh một màn mới cùng bậc

- **Requirement:** REQ-WIN-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** thắng màn 1 → `Màn ngẫu nhiên`
- **Mong đợi:** tiêu đề `Màn ngẫu nhiên`, URL `?seed=<n>&d=easy`, dòng phụ `Dễ · Seed <n>` khớp URL
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-012 — thắng được báo qua vùng thông báo cho trình đọc màn hình

- **Requirement:** REQ-WIN-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** thắng màn 1
- **Mong đợi:** live region `Xong màn với <n> bước và 7 lần đẩy.`
- **Automated:** `tests/e2e/win/result.e2e.ts`

### TC-WIN-013 — hoàn tác nước thắng mở lại ván, đi lại nước đó thì lớp phủ hiện lại

- **Requirement:** REQ-WIN-08
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** thắng → Escape → `Z` → đi lại nước cuối
- **Mong đợi:** sau `Z`: bộ đếm lùi một nước, còn một thùng trên đích; đi lại: lớp phủ hiện
- **Automated:** `tests/e2e/win/result.e2e.ts`
