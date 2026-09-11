# Đang làm · Việc tiếp theo · Nợ

> **Trả lời:** Đang làm gì, tiếp theo làm gì, và đang nợ những gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-12 · cài `ux-persona-review`
> **Cập nhật khi:** bắt đầu/kết thúc một việc · brainstorm ra việc mới · cố ý đi đường tắt

## Đang làm

**Cài skill `ux-persona-review`** (2026-09-12) — sinh bằng `ux-persona-lab` của workspace
(`../../.claude/skills/ux-persona-lab`, `install.sh <project>`). **Chưa commit**, đang nằm
trong working tree của `main`:

- `.claude/skills/ux-persona-review/` — `lib/` (LIB_VERSION 3, copy nguyên, đừng sửa tay:
  `--update` sẽ ghi đè), `references/red-routes.md` (6 route `live` RR-01…RR-06 + RR-07/08/09
  `planned` vì FR-13/14/15 đang `(bỏ)`), `references/persona-rules.md`, 7 file persona.
- `.claude/agents/ux-persona.md` + `ux-expert.md`.
- `.gitignore` thêm `!/.claude/agents/` — trước đó `/.claude/*` nuốt mất hai file agent, nên
  clone mới sẽ có skill mà thiếu agent. Đây là commit đầu tiên chạm `.gitignore`, nên **trả
  luôn nợ kỹ thuật "worktree đặt ngoài repo"**: thêm dòng `.worktrees/`.

Ba quyết định phải tự ra vì máy phát viết cho app có server, ghi lý do ngay trong
`red-routes.md` và `persona-rules.md` §6: (1) `min_steps` **không** đếm nước đi trên bàn cờ,
nước đi so với `optimalPushes` riêng; (2) bảng phân phiên chốt sẵn theo luật *mỗi persona chỉ
một phiên vào context sạch*, vì ấn tượng 5 giây chỉ lấy được một lần; (3) lăng kính trust đổi
câu hỏi — không có form nào để nhập email, niềm tin đặt vào con số đẩy tối ưu.

Làm tiếp: khởi động lại phiên (agent không nạp nóng) → commit trên nhánh feature → `yarn dev`
rồi gọi skill. Lần chạy đầu là 8 phiên chia 2 đợt; đợt 2 cần `seed` thật lấy từ log RR-03.
`bash tests/cases.sh` ở máy phát: 117 passed / 0 failed (2026-09-12).

**Đổi thương hiệu sang `Duck Push`** (2026-09-08). Repo GitHub đổi từ
`web-game-sokoban` thành `web-game-duck-push`; GitHub redirect URL *repo* cũ nhưng
**không** redirect đường dẫn Pages cũ — địa chỉ chơi giờ là
<https://levananhduc.github.io/web-game-duck-push/>. **Thư mục local vẫn là**
`web-game-sokoban`, nên mọi chỗ nói `../web-game-sokoban.worktrees/` (kể cả ô Nợ kỹ
thuật ở dưới và `docs/specs/v1-core/plan.md`) **giữ nguyên có ý** — đó là đường dẫn
trên máy, không phải slug repo.

Từ "Sokoban" giữ nguyên ở mọi chỗ nói về *thể loại và luật* (README, `journeys.md`,
`invariants.md` #13, `useSokobanGame`); chỉ tên sản phẩm đổi. Khoá `localStorage`
(`sokoban:progress:v1`, `sokoban:settings:v1`) **không** đổi: đổi là xoá tiến độ chiến
dịch của người đang chơi.

**v1-core** trên nhánh `feat/v1-core` — xong toàn bộ `docs/specs/v1-core/plan.md`, chỉ còn
mở pull request. 131 unit test và 12 e2e xanh; 65 màn trong pack đều giải lại đúng số đẩy
tối ưu; bốn bậc tách bạch ở 6-13 · 14-23 · 22-35 · 37-45 đẩy.

Hai cấu hình GitHub mà không dòng code nào trong repo bật được — **đã bật xong** ngày
2026-09-07, ghi lại ở đây vì một repo clone mới sẽ không có chúng:

- **GitHub Pages**, `build_type=workflow` → https://levananhduc.github.io/web-game-duck-push/
- **Vulnerability alerts + Dependabot security updates.** `dependency-review-action` đỏ
  ngay lần chạy đầu với "Dependency review is not supported on this repository" — dependency
  graph của repo chưa bật, và bật vulnerability alerts là thứ kéo nó theo. Đúng kiểu hỏng
  mà một cổng "audit xanh giả" sẽ che mất: ở đây nó đỏ, nên nó được sửa.

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| Sửa cổng audit xanh giả ở 4 game anh em | — | cao | `web-game/*` đang chạy `check-audit.mjs` exit 0 khi audit không chạy. Bản sửa đã có ở solitaire và ở đây; chỉ còn port sang tetris/gomoku/minesweeper/flappy-bird |
| Nhiều màn hơn cho bậc Rất khó | FR-06 | vừa | 10 màn là ít. Mỗi màn tốn ~50 giây sinh, nên đây là việc chạy nền một lần rồi commit |
| Gợi ý nước đi | FR-13 (bỏ) | thấp | Cần solver chạy được từ trạng thái giữa ván với ngân sách chặt — bài toán khác hẳn, để sau v1 |
| Âm thanh | — | thấp | Non-Goal của v1 |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| Quy trình, không phải code | **Bỏ bước mockup canvas** (`feature-flow` 1.2: artboard 375/768/1440). Chỉ có wireframe ASCII đã duyệt | Người dùng yêu cầu chạy thẳng không hỏi lại, mà cổng duyệt mockup theo định nghĩa cần người duyệt | Trước feature UI tiếp theo — hoặc chạy `design` skill, hoặc ghi ADR bỏ hẳn bước đó |
| ~~`../web-game-sokoban.worktrees/`~~ | ~~Worktree đặt **ngoài** repo~~ | **Đã trả 2026-09-12** — `.gitignore` có `.worktrees/`, worktree từ nay đặt trong repo | — |
| `vitest.config.ts` | Vite cảnh báo config dùng cú pháp ESM trong file nạp kiểu CommonJS | Chỉ là cảnh báo; sửa bằng `"type": "module"` sẽ kéo theo `next.config.ts` và `postcss.config.mjs` | Khi nâng Vite lên bản đặt `configLoader: "native"` làm mặc định |
| `src/game/levels/pack.test.ts` | Bộ kiểm pack mất ~2 phút, phần lớn ở bậc `expert` | Nó là thứ duy nhất chặn một pack có số liệu sai (bất biến #17); cắt nó đi là mất luôn cổng đó | Khi CI chậm tới mức cản việc, chia bậc `expert` sang một job riêng thay vì giảm phạm vi kiểm |
