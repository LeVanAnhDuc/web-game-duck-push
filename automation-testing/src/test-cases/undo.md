# UNDO — Test cases

Requirement: `docs/requirements/undo.md` · quyết định: `docs/decisions/undo.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-UNDO-001 — Z lùi đúng một nước và trả bộ đếm về chỗ cũ

- **Requirement:** REQ-UNDO-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn 1 → `↑ ↓` → `Z` → `Z`
- **Mong đợi:** sau `Z` thứ nhất: `Bước 1`, nhân vật ở ô sau `↑`; sau `Z` thứ hai: `Bước 0`, nhân vật về chỗ đầu
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-002 — hoàn tác một cú đẩy đưa cả thùng lẫn nhân vật về đúng chỗ cũ

- **Requirement:** REQ-UNDO-01, REQ-UNDO-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** màn 1 → `← ←` (đẩy thùng hai lần) → bấm `Hoàn tác` hai lần
- **Mong đợi:** mô tả bàn cờ giống hệt lúc mở màn; `Bước 0 · Đẩy 0`
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-003 — nút Hoàn tác và Làm lại chỉ bấm được khi có nước để lùi / để đi lại

- **Requirement:** REQ-UNDO-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** mở màn → `↑` → `Hoàn tác`
- **Mong đợi:** đầu màn: cả hai khoá; sau `↑`: Hoàn tác mở, Làm lại khoá; sau Hoàn tác: Hoàn tác khoá, Làm lại mở
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-004 — Ctrl+Z cũng hoàn tác

- **Requirement:** REQ-UNDO-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** màn 1 → `←` (đẩy) → `Ctrl+Z`
- **Mong đợi:** thùng về chỗ cũ, `Bước 0 · Đẩy 0`
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-005 — Y làm lại nước vừa hoàn tác, kể cả cú đẩy

- **Requirement:** REQ-UNDO-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** `←` → `Z` → `Y`
- **Mong đợi:** bàn cờ như sau `←`; `Bước 1 · Đẩy 1`
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-006 — Ctrl+Shift+Z làm lại nước vừa hoàn tác

- **Requirement:** REQ-UNDO-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** `←` → `Z` → `Ctrl+Shift+Z`
- **Mong đợi:** như TC-UNDO-005
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-007 — nút Làm lại làm lại nước vừa hoàn tác

- **Requirement:** REQ-UNDO-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** `←` → `Z` → bấm `Làm lại`
- **Mong đợi:** như TC-UNDO-005
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-008 — đi một nước mới sau khi hoàn tác thì nhánh cũ mất, không làm lại được nữa

- **Requirement:** REQ-UNDO-03, REQ-UNDO-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** `←` → `Z` → `↑` → `Y`
- **Mong đợi:** `Làm lại` khoá; `Y` không đổi gì
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-009 — Chơi lại (nút và phím R) đưa bàn cờ về đầu màn và bộ đếm về 0

- **Requirement:** REQ-UNDO-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** đi vài nước có đẩy → `Chơi lại`; đi tiếp → `R`
- **Mong đợi:** mỗi lần: mô tả bàn cờ như lúc mở màn, `Bước 0 · Đẩy 0`, `Hoàn tác` khoá
- **Automated:** `tests/e2e/undo/history.e2e.ts`

### TC-UNDO-010 — bấm Chơi lại thì đồng hồ HUD về 00:00 ngay, cùng lúc với bộ đếm

- **Requirement:** REQ-UNDO-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Tiền điều kiện:** `page.clock` dừng, chỉ tiến khi test cho
- **Bước:** mở màn → `↑` → cho đồng hồ chạy 12s → `Chơi lại`
- **Mong đợi:** HUD `Bước 0 · Đẩy 0 · 00:00` ngay sau cú bấm
- **Automated:** `tests/e2e/undo/history.e2e.ts`
