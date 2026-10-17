# ACCESSIBILITY — Quyết định

Đi cặp với `docs/requirements/accessibility.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/nfr.md` (NFR-A11Y-02/04/06/07), `docs/03-design/invariants.md` (#18),
  `docs/design-system/sokoban/MASTER.md` (hard rule: hình dạng, không chỉ màu), `docs/specs/ux-feedback-2026-09/design.md`
  (F-03 mô tả theo vị trí), `README.md` §Features "Readable for everyone", "describes itself to a screen reader by position".
- **Code:** `client/src/lib/boardLabel.ts`, `client/src/views/Play/mains/Board/index.tsx` (`role=img`),
  `client/src/components/Modal/index.tsx`, `client/src/views/Play/components/{GoalRings,CrateSprite,PlayerSprite}`,
  `client/src/app/globals.css` (`:focus-visible` viền 2px).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Mô tả bàn cờ so với gì? → Dựng lại từ mô hình của suite theo đúng thứ tự `boardLabel` đọc (người → thùng chưa
  xong → thùng đã xong → đích trống → tổng) và so **nguyên chuỗi**: thiếu một thùng hay sai một ô là đỏ.
- **Q2** "Phân biệt khi in đen trắng" (NFR-A11Y-06) e2e kiểm thế nào? → Không so ảnh khử màu (dễ vỡ theo font/AA). Đếm
  hình vẽ trong SVG/DOM của bàn cờ: vòng tròn rỗng, hai nét giằng, một nét dấu tích, hình đầu tròn — đó chính là các
  tín hiệu hình dạng mà MASTER.md quy định. Ảnh khử màu vẫn là việc review của thiết kế.
- **Q3** Live region của thắng / kẹt đã kiểm ở `win` (TC-WIN-012) và `deadlock` (TC-DEADLOCK-004), không lặp ở đây.

## Tài khoản test

Không có.

## Ngoài phạm vi

- NFR-A11Y-01 (tương phản) — bảng đo trong `MASTER.md`. NFR-A11Y-03 (44px) → module `touch`. NFR-A11Y-05 → `theme`.

## Tech debt liên quan

Không có.
