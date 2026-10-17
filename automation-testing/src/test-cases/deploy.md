# DEPLOY — Test cases

Requirement: `docs/requirements/deploy.md` · quyết định: `docs/decisions/deploy.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-DEPLOY-001 — trang chủ và màn chơi tải đủ mọi tài nguyên, không request nào hỏng

- **Requirement:** REQ-DEPLOY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** trang chủ → chờ mạng lặng → bậc `Rất khó` → mở màn 1 → chờ mạng lặng
- **Mong đợi:** không `requestfailed`, không phản hồi ≥ 400
- **Automated:** `tests/e2e/deploy/static-export.e2e.ts`

### TC-DEPLOY-002 — mọi request của site nằm dưới base path của nó

- **Requirement:** REQ-DEPLOY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** trang chủ → `Màn ngẫu nhiên` (worker) → chờ mạng lặng
- **Mong đợi:** mọi request cùng origin có path bắt đầu bằng base path của `baseURL`
- **Automated:** `tests/e2e/deploy/static-export.e2e.ts`
