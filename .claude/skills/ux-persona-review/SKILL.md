---
name: ux-persona-review
description: Use when you want to know how a real stranger experiences Duck Push — dispatches blind persona subagents that actually drive the running app in a browser, captures their first five seconds and their gut reaction, then returns UX/UI findings mapped to ISO 9241-11, LATCH, trigger words, interaction design, visual hierarchy, form design, visual craft and trust/desirability, every finding backed by a quote or a screenshot from a session log. Trigger on "chay persona", "test UX", "nguoi dung that thay sao", "UI co dep khong", "an tuong dau", "UX review", "red route", or before opening a PR that changes user-facing behaviour.
---

# Duck Push — UX persona review

## Sản phẩm này

- Thư mục: `D:/Learn/web-app-ecosystem/web-game/web-game-sokoban`
- Port: **3000** — `http://localhost:3000` (dev) hoặc `http://127.0.0.1:3000` (bản build tĩnh).
  Không có port server: game chạy hoàn toàn phía client.
- Bật app: `yarn install && yarn dev` tại `D:/Learn/web-app-ecosystem/web-game/web-game-sokoban`.
  Muốn chạy trên đúng bản sẽ lên Pages thì `yarn build && yarn serve -s out -l 3000`.
  **Đừng đặt `GITHUB_PAGES=true` ở máy** — nó thêm basePath `/web-game-duck-push` và làm hỏng đường dẫn tài nguyên khi chạy local.
- Dấu hiệu nhận biết đúng app: tiêu đề tab là **Duck Push**, nhưng tiêu đề trên trang là chữ
  **`SOKOBAN`** giãn chữ ở góc trái, cạnh nút đổi sáng/tối. Dưới đó là nút chính
  **`Màn ngẫu nhiên · Dễ`** và mục **`Chiến dịch`** với bốn tab `Dễ · Vừa · Khó · Rất khó`.
  Thấy bất kỳ ô đăng nhập / đăng ký nào là **sai app** — sản phẩm này không có tài khoản.
- Email dùng-một-lần cho persona: **không cần**. Không có form nào trong game hỏi email.
  Persona nào bị hỏi email tức là đã đi lạc khỏi sản phẩm — ghi lại và dừng.
- Tài khoản thử: **không có, và sẽ không bao giờ có** — "không tài khoản, không đăng nhập" là
  Non-Goal #1 (`docs/01-product/overview.md` §4). Mọi tiến độ nằm trong `localStorage`.

## Chạy

Toàn bộ quy trình nằm ở `lib/orchestration.md`. Đọc nó trước, rồi làm theo.

Dữ liệu riêng của sản phẩm này:

| Cần gì | Ở đâu |
| --- | --- |
| Red Route đã chốt | `references/red-routes.md` |
| Dàn persona | `references/personas/` |
| Rule đã dùng để sinh persona | `references/persona-rules.md` |
| Khung đánh giá, luật xếp hạng | `lib/frameworks.md` |
| Thứ tự công cụ trình duyệt | `lib/browser-capability.md` |

## Hai agent

`ux-persona` (Sonnet, chỉ có trình duyệt) đóng vai người dùng.
`ux-expert` (Opus, chỉ có Read) dịch log sang khung đánh giá.

Cả hai định nghĩa ở `D:/Learn/web-app-ecosystem/web-game/web-game-sokoban/.claude/agents/`. Nếu Claude Code báo không tìm thấy
agent type, phiên hiện tại được mở trước khi hai file đó tồn tại — khởi động lại phiên.

## Bảo trì

Nâng cấp phần logic: `bash <workspace>/.claude/skills/ux-persona-lab/scripts/install.sh D:/Learn/web-app-ecosystem/web-game/web-game-sokoban --update`
Lấy lại rule persona mới: cùng lệnh với `--refresh-rules`.
Cả hai đều **không** đụng tới `red-routes.md` và `personas/`.
