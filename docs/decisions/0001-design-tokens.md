# ADR-0001 · Bỏ hướng Pixel Art, dùng bảng màu thùng gỗ + Space Grotesk / IBM Plex Mono

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** NFR-A11Y-01 · NFR-A11Y-06 · FR-12

## 1. Bối cảnh

`design-bootstrap` chạy một lần cho cả dự án. Bước 1 (`ui-ux-pro-max --design-system`) trả
về lựa chọn theo danh mục "arcade & retro game": style **Pixel Art**, font **Press Start 2P /
VT323**, màu neon đỏ `#DC2626` + xanh `#2563EB` + xanh lá `#22C55E` trên nền slate `#0F172A`.
Bước 2 là chỗ chốt lại, và output bước 1 chỉ là đầu vào.

Ràng buộc riêng của dự án: toàn bộ chữ trên UI là **tiếng Việt**; bàn cờ dùng màu để mã hoá
**trạng thái**, không phải để trang trí; và cảnh báo bế tắc cần một màu cảnh báo thật.

## 2. Quyết định

Giữ nguyên các ràng buộc a11y/UX của bước 1 (ngưỡng tương phản, vùng bấm 44px, focus thấy
được, `prefers-reduced-motion`, danh sách anti-pattern). Thay toàn bộ phần **lựa chọn**:

- Bảng màu nền giấy ấm / thùng gỗ: primary `#B45309` (hổ phách), accent `#0F766E` (xanh mòng
  két), destructive `#B91C1C` dành riêng cho cảnh báo bế tắc. Đủ cả hai chế độ sáng/tối, mọi
  cặp đã đo và ghi trong `MASTER.md`.
- Cặp chữ **Space Grotesk** (UI) + **IBM Plex Mono** (số trên HUD, seed) — hai họ khác nhau,
  chữ số dạng tabular để HUD không nhảy khi bộ đếm đổi.
- Phần tử đặc trưng: **vệt đường đi mờ dần** 12 bước gần nhất.
- Quy tắc cứng: không trạng thái nào của ô chỉ phân biệt bằng màu (NFR-A11Y-06).

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Press Start 2P làm font tiêu đề (bước 1 đề xuất) | **Không có subset `vietnamese` trên Google Fonts** — kiểm bằng cách gọi css2 API với User-Agent trình duyệt, trả về 0 khối `vietnamese`. Mọi dấu tiếng Việt sẽ rơi sang họ khác. Chưa kể không đọc nổi ở cỡ 12–14px của nhãn HUD |
| Giữ neon đỏ làm primary | Đỏ là màu cảnh báo bế tắc trong game này. Cảnh báo trùng màu thương hiệu thì thôi không còn là cảnh báo |
| Hướng Pixel Art / 8-bit nói chung | Là lựa chọn mặc định cho cả danh mục, và nói sai về sản phẩm: Sokoban là trò suy luận chậm, không phải arcade phản xạ |
| Dùng một họ chữ cho cả hai vai | Bước 1 trả về đúng một họ cho cả heading lẫn body, vi phạm yêu cầu tối thiểu hai họ của `frontend-design` |

## 4. Hệ quả

**Được:**
- Chữ tiếng Việt hiển thị đúng ở mọi vai trò.
- Màu cảnh báo còn nguyên sức cảnh báo vì không dùng vào việc gì khác.
- Mọi cặp màu đã có số đo, nên lần sửa sau có cái để đối chiếu thay vì đoán.

**Mất / phải chấp nhận:**
- Không còn "chất retro" mà một game Sokoban thường được kỳ vọng.
- Hổ phách và mòng két gần nhau về độ sáng (tỉ lệ 1.09) → **bắt buộc** phải mã hoá thêm bằng
  hình dạng, tốn công vẽ hơn là tô màu ô.

**Điều kiện xem lại:** nếu sản phẩm thêm ngôn ngữ không thuộc Latin, hoặc thêm một trạng thái
ô thứ bảy mà bảng màu hiện tại không tách bạch được.
