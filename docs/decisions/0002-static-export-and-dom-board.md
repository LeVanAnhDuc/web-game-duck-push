# ADR-0002 · Xuất HTML tĩnh bằng Next.js và vẽ bàn cờ bằng DOM, không dùng canvas

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** NFR-A11Y-02 · NFR-A11Y-05 · NFR-A11Y-07 · NFR-PERF-09 · FR-01

## 1. Bối cảnh

Trần chi phí hạ tầng là **0 đồng/tháng** (`overview.md` §5), nên chỗ host duy nhất khả thi là
GitHub Pages — tức là chỉ phục vụ file tĩnh. Game anh em `web-game-flappy-bird` trong cùng
workspace đã đi đường này: Next.js `output: "export"` + `basePath` theo tên repo, vẽ bằng
canvas với vòng lặp `requestAnimationFrame`.

Câu hỏi thật sự không phải "Next.js hay không" mà là **có sao chép luôn cách vẽ bằng canvas
của flappy-bird không**.

## 2. Quyết định

Next.js 16 với `output: "export"`, `basePath` bật theo biến `GITHUB_PAGES`, giống flappy-bird.
Nhưng **bàn cờ vẽ bằng DOM + CSS Grid**, mỗi ô là một phần tử, không dùng canvas.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Canvas + vòng lặp rAF (như flappy-bird) | Flappy Bird cần vòng lặp vật lý 60fps liên tục; Sokoban theo lượt, bàn ≤ 12×12 = 144 ô, khung hình chỉ đổi khi có phím. Dùng canvas là tự tay dựng lại focus, tab order, `aria`, và hỗ trợ `prefers-reduced-motion` — những thứ DOM cho không |
| Vite + React thuần (không Next) | Mất `next/font` (nạp font có subset tiếng Việt, không chớp chữ) và mất khuôn chung với các game anh em. Đổi lại gần như không được gì vì cả hai đều xuất tĩnh |
| SVG một khối cho cả bàn | Gọn hơn cho hình vẽ, nhưng chuyển động từng ô và focus từng ô lại rườm rà hơn DOM thường |

## 4. Hệ quả

**Được:**
- Bàn cờ đọc được bằng trình đọc màn hình và đi được bằng bàn phím mà không phải viết thêm
  tầng a11y giả lập (NFR-A11Y-02, NFR-A11Y-07).
- `prefers-reduced-motion` xử lý bằng đúng một khối CSS.
- Không cần thư viện vẽ nào → phần JS tải về nhỏ (NFR-PERF-09).

**Mất / phải chấp nhận:**
- Trần kích thước bàn: DOM sẽ đuối nếu sau này muốn bàn 40×40. Với bậc khó nhất hiện tại
  (12×12) thì còn rất xa trần đó.
- Không tái dùng được tầng render của flappy-bird — hai game khác nhau về bản chất, và giả vờ
  giống nhau tốn hơn là viết mới.

**Điều kiện xem lại:** nếu có bậc khó với bàn lớn hơn ~25×25, hoặc nếu thêm hiệu ứng chuyển
động liên tục cần vòng lặp khung hình.
