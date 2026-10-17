# RESPONSIVE — Test cases

Requirement: `docs/requirements/responsive.md` · quyết định: `docs/decisions/responsive.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-RESPONSIVE-001 — trang chủ không cuộn ngang ở mọi bề ngang từ 320 tới 1440px

- **Requirement:** REQ-RESPONSIVE-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Bước:** mở trang chủ ở 320×568, 375×667, 768×1024, 1440×900
- **Mong đợi:** `scrollWidth − clientWidth = 0` ở cả bốn
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-002 — bàn cờ lớn nhất nằm trọn trong màn hình và trang chơi không cuộn, ở mọi bề ngang

- **Requirement:** REQ-RESPONSIVE-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Bước:** mở màn có bàn lớn nhất trong pack (11×11) ở bốn khung nhìn
- **Mong đợi:** hộp bàn cờ nằm trong khung nhìn; trang không tràn cả hai chiều; nút `Chơi lại` trong khung nhìn
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-003 — ô bàn cờ không nhỏ hơn 24px ở màn hẹp nhất và không to quá 56px ở màn rộng

- **Requirement:** REQ-RESPONSIVE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** bàn 11×11 ở 320×568; màn 1 ở 1440×900
- **Mong đợi:** cạnh ô ≥ 24px; ở màn rộng 40 < cạnh ô ≤ 56px
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-004 — xoay / đổi cỡ cửa sổ giữa ván thì bàn cờ co lại cho vừa, ván giữ nguyên

- **Requirement:** REQ-RESPONSIVE-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** 1440×900, đi hai nước → đổi sang 375×667
- **Mong đợi:** cạnh ô nhỏ lại, bàn vẫn trong khung nhìn, mô tả bàn cờ không đổi
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-005 — dải cảnh báo kẹt hiện ra mà hàng nút điều khiển vẫn nằm trong màn hình 375px

- **Requirement:** REQ-RESPONSIVE-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** 375×667 → màn 1 → đẩy thùng vào góc
- **Mong đợi:** dải, `Hoàn tác`, `Chơi lại` đều trong khung nhìn; bàn cờ trọn vẹn; trang không cuộn
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`
