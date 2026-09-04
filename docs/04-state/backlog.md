# Đang làm · Việc tiếp theo · Nợ

> **Trả lời:** Đang làm gì, tiếp theo làm gì, và đang nợ những gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/v1-core
> **Cập nhật khi:** bắt đầu/kết thúc một việc · brainstorm ra việc mới · cố ý đi đường tắt

## Đang làm

**v1-core** trên nhánh `feat/v1-core` — xem `docs/specs/v1-core/plan.md` để biết đang ở task
nào. Lõi luật chơi, solver, dò bế tắc, session và storage đã xong và xanh. Còn lại: bộ sinh
màn (mục 3), giao diện (mục 6), và kiểm chứng (mục 7).

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| Sinh và commit pack màn chiến dịch | FR-06 | cao | Không có pack thì trang chủ trống, và không kiểm được bất biến #17 |
| Test đối chiếu `optimalPushes` trên toàn pack | bất biến #17 | cao | Đây là thứ duy nhất chặn một pack cũ với số liệu sai |
| E2E bằng bàn phím và ảnh chụp 4 bề rộng | NFR-A11Y-02 | cao | "Một thay đổi UI chưa nhìn tận mắt là chưa xong" |
| Gợi ý nước đi | FR-13 (bỏ) | thấp | Cần solver chạy được từ trạng thái giữa ván với ngân sách chặt — bài toán khác hẳn, để sau v1 |
| Âm thanh | — | thấp | Non-Goal của v1 |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| Quy trình, không phải code | **Bỏ bước mockup canvas** (`feature-flow` 1.2: artboard 375/768/1440). Chỉ có wireframe ASCII đã duyệt | Người dùng yêu cầu chạy thẳng không hỏi lại, mà cổng duyệt mockup theo định nghĩa cần người duyệt | Trước feature UI tiếp theo — hoặc chạy `design` skill, hoặc ghi ADR bỏ hẳn bước đó |
| `../web-game-sokoban.worktrees/` | Worktree đặt **ngoài** repo thay vì `<repo>/.worktrees/` như quy ước workspace | Đặt trong repo thì phải thêm một dòng `.gitignore` bằng một commit trên `main`, mà `main` là nhánh cấm commit | Khi có commit hợp lệ đầu tiên chạm `.gitignore` trên một nhánh feature |
| `vitest.config.ts` | Vite cảnh báo config dùng cú pháp ESM trong file nạp kiểu CommonJS | Chỉ là cảnh báo; sửa bằng `"type": "module"` sẽ kéo theo `next.config.ts` và `postcss.config.mjs` | Khi nâng Vite lên bản đặt `configLoader: "native"` làm mặc định |
