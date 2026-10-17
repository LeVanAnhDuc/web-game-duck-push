# Nguồn requirement của Duck Push

**Requirement của module lấy ở đâu.** `/write-tests` đọc file này ở bước 1 và chỉ đọc các nơi liệt kê dưới đây, cộng với
những gì user nói trong chat. Không dùng Jira/Confluence.

Đường dẫn tính từ thư mục gốc repo test. Danh sách này được user xác nhận lúc scaffold; khi user chỉ thêm nơi khác, hoặc
một nơi bị bỏ/đóng băng, sửa bảng này trong cùng lượt.

## Tài liệu

- `../docs/README.md` — bản đồ tài liệu + quy ước ID (US / FR / NFR / ADR); đọc trước để biết file nào là nguồn đúng
- `../docs/01-product/overview.md` — định vị, Non-Goals (không server, không tài khoản game, không gợi ý, không trình soạn màn)
- `../docs/01-product/journeys.md` — luồng người dùng US-01…US-06, kèm "Điều gì có thể sai" (nguồn chính cho case negative)
- `../docs/01-product/glossary.md` — tên khái niệm ↔ tên trong code ↔ tên trên UI
- `../docs/02-requirements/scope.md` — danh mục chức năng FR-01…FR-17 và trạng thái
- `../docs/02-requirements/nfr.md` — ngưỡng NFR-PERF / A11Y / I18N / REL / DATA áp cho mọi feature
- `../docs/03-design/invariants.md` — điều kiện sai âm thầm (#13 undo lùi lịch sử, #16 dò bế tắc sound, #18 không chỉ dùng màu)
- `../docs/decisions/` — ADR-0001…0010: vì sao hành vi như vậy (vd ADR-0008 tiền tố id màn ngẫu nhiên, ADR-0009 bấm ô kề để đi)
- `../docs/specs/<feature>/design.md` — thiết kế đã duyệt của từng feature (v1-core, ux-feedback-2026-09, ducker-id-sign-in)
- `../docs/design-system/sokoban/MASTER.md` — ngưỡng hiển thị (vùng bấm 44px, tương phản, hình dạng ô)
- `../README.md` — mục Features + Controls: hợp đồng hành vi hướng tới người chơi

## Code

- `../client/src/views/Home/` — trang chủ: tab bậc khó, lưới màn chiến dịch, nút màn ngẫu nhiên, thẻ ván dở, nút theme, nút tài khoản
- `../client/src/views/Play/` — màn chơi: bàn cờ, HUD, nút điều khiển, D-pad, dải bế tắc, lớp phủ thắng, vệt đường đi
- `../client/src/hooks/` — điều hướng theo URL (`levelRouting.ts`), bàn phím, vuốt, theme, tiến độ, cài đặt, đăng nhập
- `../client/src/game/` — luật chơi thuần, phiên chơi (undo/redo), storage, pack màn, worker sinh màn
- `../client/src/lib/` — nhãn trình đọc màn hình (`boardLabel.ts`), chữ hiển thị (`levelText.ts`), đăng nhập Ducker ID (OIDC + PKCE)
- `../client/src/game/levels/data/*.json` — pack màn đã kiểm (dữ liệu, không phải code): nguồn của màn dùng trong test
- `../client/scripts/e2e-serve.mjs` — dựng hai bản build tĩnh (cờ Ducker ID tắt / bật với issuer giả) mà suite này phục vụ

## Không đọc như nguồn đúng

- `../docs/specs/*/plan.md` — danh sách task lúc build, không phải hành vi
- `../docs/04-state/backlog.md` — việc đang làm / nợ kỹ thuật, không phải hành vi đã ship
- `../docs/code-conventions.md` — quy ước viết code dùng chung, không nói về hành vi
- `../docs/ux-reviews/`, `../.claude/skills/ux-persona-review/runs/` — nhật ký phiên persona (phát hiện UX lịch sử, đã xử lý ở `ux-feedback-2026-09`)
- `../client/src/**/*.test.ts(x)` — unit/component test của app: gợi ý hành vi, không phải requirement

## Thứ tự thẩm quyền

User (chat) > tài liệu trên > code. Code cho biết app *đang* làm gì, không cho biết *nên* làm gì.
