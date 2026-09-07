# Đang làm · Việc tiếp theo · Nợ

> **Trả lời:** Đang làm gì, tiếp theo làm gì, và đang nợ những gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/v1-core
> **Cập nhật khi:** bắt đầu/kết thúc một việc · brainstorm ra việc mới · cố ý đi đường tắt

## Đang làm

**v1-core** trên nhánh `feat/v1-core` — xong toàn bộ `docs/specs/v1-core/plan.md`, chỉ còn
mở pull request. 131 unit test và 12 e2e xanh; 65 màn trong pack đều giải lại đúng số đẩy
tối ưu; bốn bậc tách bạch ở 6-13 · 14-23 · 22-35 · 37-45 đẩy.

Hai cấu hình GitHub mà không dòng code nào trong repo bật được — **đã bật xong** ngày
2026-09-07, ghi lại ở đây vì một repo clone mới sẽ không có chúng:

- **GitHub Pages**, `build_type=workflow` → https://levananhduc.github.io/web-game-sokoban/
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
| `../web-game-sokoban.worktrees/` | Worktree đặt **ngoài** repo thay vì `<repo>/.worktrees/` như quy ước workspace | Đặt trong repo thì phải thêm một dòng `.gitignore` bằng một commit trên `main`, mà `main` là nhánh cấm commit | Khi có commit hợp lệ đầu tiên chạm `.gitignore` trên một nhánh feature |
| `vitest.config.ts` | Vite cảnh báo config dùng cú pháp ESM trong file nạp kiểu CommonJS | Chỉ là cảnh báo; sửa bằng `"type": "module"` sẽ kéo theo `next.config.ts` và `postcss.config.mjs` | Khi nâng Vite lên bản đặt `configLoader: "native"` làm mặc định |
| `src/game/levels/pack.test.ts` | Bộ kiểm pack mất ~2 phút, phần lớn ở bậc `expert` | Nó là thứ duy nhất chặn một pack có số liệu sai (bất biến #17); cắt nó đi là mất luôn cổng đó | Khi CI chậm tới mức cản việc, chia bậc `expert` sang một job riêng thay vì giảm phạm vi kiểm |
