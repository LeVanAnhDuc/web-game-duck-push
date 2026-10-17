# THEME — Test cases

Requirement: `docs/requirements/theme.md` · quyết định: `docs/decisions/theme.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-THEME-001 — mặc định giao diện theo hệ điều hành, và đổi ngay khi hệ đổi

- **Requirement:** REQ-THEME-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** đo màu nền tham chiếu ở hệ sáng và hệ tối khi chưa có lựa chọn → hệ sáng → đổi hệ sang tối khi trang đang mở
- **Mong đợi:** hai màu tham chiếu khác nhau; nút `Giao diện: Theo hệ thống`; nền đổi theo hệ ngay
- **Automated:** `tests/e2e/theme/theme.e2e.ts`

### TC-THEME-002 — nút giao diện xoay vòng Theo hệ thống → Nền sáng → Nền tối → Theo hệ thống

- **Requirement:** REQ-THEME-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** hệ tối → bấm nút ba lần
- **Mong đợi:** lần lượt `Nền sáng` (nền sáng), `Nền tối` (nền tối), `Theo hệ thống` (nền tối theo hệ); nhãn chữ và `aria-label` khớp
- **Automated:** `tests/e2e/theme/theme.e2e.ts`

### TC-THEME-003 — lựa chọn rõ ràng thắng hệ điều hành, còn nguyên sau khi tải lại và ở cả màn chơi

- **Requirement:** REQ-THEME-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** chọn `Nền tối` → hệ sáng → tải lại → mở màn 1
- **Mong đợi:** vẫn `Nền tối`, nền tối ở cả trang chủ lẫn màn chơi; `sokoban:settings:v1` có `theme: dark`
- **Automated:** `tests/e2e/theme/theme.e2e.ts`

### TC-THEME-004 — bật giảm chuyển động thì nhân vật và thùng không còn chuyển động

- **Requirement:** REQ-THEME-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** không giảm chuyển động: đo `transition-duration` của sprite → bật `reduce` → đo lại → đẩy thùng
- **Mong đợi:** bình thường > 0; khi giảm ≤ 0,01ms; nước đi vẫn chạy
- **Automated:** `tests/e2e/theme/theme.e2e.ts`
