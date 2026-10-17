# RANDOMLEVEL — Test cases

Requirement: `docs/requirements/random-level.md` · quyết định: `docs/decisions/random-level.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-RANDOMLEVEL-001 — nút Màn ngẫu nhiên sinh một màn mới, seed của nó nằm trên URL và trên dòng phụ

- **Requirement:** REQ-RANDOMLEVEL-01, REQ-RANDOMLEVEL-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** trang chủ → `Màn ngẫu nhiên · Dễ`
- **Mong đợi:** tiêu đề `Màn ngẫu nhiên`; URL `?seed=<n>&d=easy`; dòng phụ `Dễ · Seed <n>` cùng số; `Tối ưu <k> đẩy · KL bạn chưa có`; bộ đếm 0
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`

### TC-RANDOMLEVEL-002 — màn ngẫu nhiên theo đúng bậc khó đang chọn

- **Requirement:** REQ-RANDOMLEVEL-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** chọn `Khó` → `Màn ngẫu nhiên · Khó`
- **Mong đợi:** dòng phụ `Khó · Seed <n>`, URL `&d=hard`
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`

### TC-RANDOMLEVEL-003 — cùng một đường dẫn seed mở ở máy khác cho ra đúng màn đó

- **Requirement:** REQ-RANDOMLEVEL-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `?seed=123456789&d=medium` → mở cùng đường dẫn trong một browser context mới
- **Mong đợi:** mô tả bàn cờ và dòng `Tối ưu` giống hệt; dòng phụ `Vừa · Seed 123456789`
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`

### TC-RANDOMLEVEL-004 — seed giống nhau nhưng bậc khó khác thì là màn khác

- **Requirement:** REQ-RANDOMLEVEL-03
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** mở cùng seed với `d=easy` rồi `d=expert`
- **Mong đợi:** mô tả bàn cờ khác nhau
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`

### TC-RANDOMLEVEL-005 — seed hỏng trên đường dẫn thì về trang chủ với lời nhắn đọc được

- **Requirement:** REQ-RANDOMLEVEL-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** mở `?seed=khong-phai-so`, `-5`, `1.5`, `1e3x` (cùng `&d=easy`)
- **Mong đợi:** mỗi lần: `Seed trong đường dẫn không đọc được nên mình mở trang chủ.`, nút màn ngẫu nhiên hiện, URL sạch
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`

### TC-RANDOMLEVEL-006 — màn được sinh trong Web Worker, trang vẫn trả lời trong lúc sinh

- **Requirement:** REQ-RANDOMLEVEL-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** trang chủ → `Rất khó` → bấm nút → hỏi trang `document.title` ngay
- **Mong đợi:** trang trả lời ngay; có ít nhất một Web Worker được tạo; màn mở ra
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`

### TC-RANDOMLEVEL-007 — sinh một màn ở mỗi bậc khó xong trong trần cứng 2,5 giây

- **Requirement:** REQ-RANDOMLEVEL-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** mỗi bậc: bấm nút → đo tới khi bàn cờ hiện
- **Mong đợi:** ≤ 2 500 ms ở cả bốn bậc
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`

### TC-RANDOMLEVEL-008 — trình duyệt không có Web Worker vẫn sinh được màn

- **Requirement:** REQ-RANDOMLEVEL-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** xoá `window.Worker` trước khi trang chạy → bấm nút
- **Mong đợi:** màn ngẫu nhiên mở, URL có seed
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`

### TC-RANDOMLEVEL-009 — trong lúc sinh, nút đổi sang trạng thái chờ

- **Requirement:** REQ-RANDOMLEVEL-08
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** giữ script của worker lại → bấm nút → thả ra
- **Mong đợi:** nút `Đang sinh màn…` trong lúc chờ; sau đó màn mở
- **Automated:** `tests/e2e/random-level/generate.e2e.ts`
