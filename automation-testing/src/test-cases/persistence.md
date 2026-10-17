# PERSISTENCE — Test cases

Requirement: `docs/requirements/persistence.md` · quyết định: `docs/decisions/persistence.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-PERSISTENCE-001 — ván đang dở sống qua tải lại trang: thẻ Đang chơi dở mở lại đúng bàn cờ, kể cả lịch sử hoàn tác

- **Requirement:** REQ-PERSISTENCE-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn 1 → `← ↑ ←` → tải lại trang chủ → bấm thẻ → `Z` ×3
- **Mong đợi:** thẻ `Màn 1 · Dễ`, `3 bước · 1 đẩy`, tên truy cập có `Chơi tiếp`; mở ra mô tả bàn cờ và bộ đếm y như lúc rời; ba lần `Z` về `Bước 0 · Đẩy 0`
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`

### TC-PERSISTENCE-002 — màn ngẫu nhiên đang dở cũng mở lại được, sinh lại từ chính seed của nó

- **Requirement:** REQ-PERSISTENCE-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** `?seed=123456789&d=easy` → đi 4 nước → trang chủ → thẻ
- **Mong đợi:** thẻ `Màn ngẫu nhiên · Dễ`; mở ra dòng phụ `Dễ · Seed 123456789`, bàn cờ và bộ đếm y như lúc rời
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`

### TC-PERSISTENCE-003 — thắng xong thì không còn thẻ Đang chơi dở cho màn đó

- **Requirement:** REQ-PERSISTENCE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** thắng màn 1 → trang chủ
- **Mong đợi:** không có khu `Đang chơi dở`
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`

### TC-PERSISTENCE-004 — kỷ lục sống qua một lần tải lại trang

- **Requirement:** REQ-PERSISTENCE-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** thắng màn 1 → tải lại → trang chủ
- **Mong đợi:** ô `Màn 1, đã giải, đạt số đẩy tối ưu, kỷ lục 7 đẩy`, chữ `7 đẩy` trên ô
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`

### TC-PERSISTENCE-005 — dữ liệu lưu hỏng hoặc khác phiên bản bị bỏ qua: trang chủ vẫn mở bình thường và chơi được

- **Requirement:** REQ-PERSISTENCE-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Bước:** lần lượt ghi vào `sokoban:progress:v1`: JSON hỏng, `version: 2`, kỷ lục `bestPushes: -3`, ván dở có nước `jump` → mở trang chủ → mở màn 1 → `←`
- **Mong đợi:** mỗi lần: không thẻ ván dở, ô 1 `chưa giải`; màn chơi được; không `pageerror`
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`

### TC-PERSISTENCE-006 — tuỳ chọn lưu hỏng thì giao diện về mặc định Theo hệ thống

- **Requirement:** REQ-PERSISTENCE-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** ghi `theme: "purple"` vào `sokoban:settings:v1` → mở trang chủ
- **Mong đợi:** nút giao diện `Giao diện: Theo hệ thống. Bấm để đổi.`
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`

### TC-PERSISTENCE-007 — trình duyệt chặn localStorage hoàn toàn thì vẫn chơi được tới khi thắng

- **Requirement:** REQ-PERSISTENCE-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Bước:** `getItem`/`setItem`/`removeItem` đều ném lỗi → trang chủ → đổi giao diện → màn 1 → giải
- **Mong đợi:** `Xong màn!` với số liệu đúng; không `pageerror`
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`

### TC-PERSISTENCE-008 — localStorage đầy (ghi bị từ chối) không làm hỏng ván đang chơi

- **Requirement:** REQ-PERSISTENCE-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** `setItem` ném `QuotaExceededError` → màn 1 → đi, hoàn tác, đi tiếp tới thắng
- **Mong đợi:** `Xong màn!`; không `pageerror`
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`

### TC-PERSISTENCE-009 — chơi lại một ván đang dở rồi rời đi thì thẻ Đang chơi dở không mở lại ván cũ

- **Requirement:** REQ-PERSISTENCE-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** màn 1 → `← ↑ ←` → `Chơi lại` → về trang chủ
- **Mong đợi:** không có thẻ, hoặc thẻ ghi `0 bước` — bàn cờ người chơi để lại là đầu màn
- **Automated:** `tests/e2e/persistence/storage.e2e.ts`
