# PRIVACY — Test cases

Requirement: `docs/requirements/privacy.md` · quyết định: `docs/decisions/privacy.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-PRIVACY-001 — một vòng chơi trọn vẹn không gửi request nào ra ngoài site

- **Requirement:** REQ-PRIVACY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Bước:** trang chủ → đổi giao diện → màn 1 → thắng → `Màn ngẫu nhiên`, ghi mọi request
- **Mong đợi:** không request nào tới origin khác (trừ `data:` / `blob:`)
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-002 — không đặt cookie nào, và localStorage chỉ giữ tiến độ và tuỳ chọn của game

- **Requirement:** REQ-PRIVACY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** một vòng chơi như TC-PRIVACY-001 → đọc cookie, localStorage, sessionStorage
- **Mong đợi:** 0 cookie; khoá localStorage đúng `sokoban:progress:v1`, `sokoban:settings:v1`; sessionStorage rỗng
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-003 — mất mạng sau khi màn đã mở thì vẫn chơi tới khi thắng

- **Requirement:** REQ-PRIVACY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** mở màn 1 → ngắt mạng → gõ lời giải
- **Mong đợi:** `Xong màn!`
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-004 — console không có lỗi trong suốt một vòng chơi

- **Requirement:** REQ-PRIVACY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** một vòng chơi như TC-PRIVACY-001, ghi console + pageerror
- **Mong đợi:** không có lỗi nào
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`
