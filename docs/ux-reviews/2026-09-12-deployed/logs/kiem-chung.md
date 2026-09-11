# Kiểm chứng riêng của người điều phối — không phải phiên persona

Phiên `p01-blind` (cô Nga) bỏ cuộc vì **không di chuyển được nhân vật**. Trước khi biến
chuyện đó thành phát hiện, phải trả lời: đây là lỗi sản phẩm hay là giới hạn của môi trường
test? Công cụ chạy persona (`claude-in-chrome` / chrome-devtools trên Chrome desktop) **không
giả lập được cảm ứng**, nên câu trả lời không thể suy từ chính phiên đó.

Chạy độc lập bằng device emulation thật của Playwright, thẳng vào bản deploy
`https://levananhduc.github.io/web-game-duck-push/`. Script: `verify-touch.tmp.mjs`
(chạy 2026-09-12, xoá sau khi chạy).

## Kết quả

| Cấu hình | `pointer: coarse` | Số nút D-pad | Dòng nhắc phím |
| --- | --- | --- | --- |
| Pixel 5 (cảm ứng thật) | `true` | **4** | không có |
| Desktop 1280×900, chuột | `false` | **0** | `mũi tên/WASD để đi · Z hoàn tác · R chơi lại` |
| Cửa sổ hẹp 360×640, **chuột** | `false` | **0** | `mũi tên/WASD để đi · Z hoàn tác · R chơi lại` |

Ảnh: `kiemchung-pixel5-cam-ung-man-choi.png` · `kiemchung-desktop-chuot-man-choi.png` ·
`kiemchung-hep-360-chuot-man-choi.png`

## Hai kết luận

**1. Trên điện thoại thật, cô Nga sẽ có D-pad.** Việc cô bế tắc trong phiên `p01-blind`
**không** được đọc là lỗi của bản điện thoại. Đó là hệ quả của môi trường test.

**2. Nhưng cấu hình mà phiên đó thật sự đã test lại là một cấu hình có thật, và ở đó kết quả
đúng như cô kể:** con trỏ chuột + bề rộng bất kỳ → **không một nút điều khiển nào trên màn
hình**, toàn bộ khả năng di chuyển nằm sau một dòng chữ mờ ở đáy trang, và dòng đó mở đầu
bằng `mũi tên/WASD`. Đây là mọi người dùng laptop/desktop — kể cả người thu nhỏ cửa sổ.
`(pointer: coarse)` là một công tắc **nhị phân**: không có trạng thái "vừa chuột vừa chạm"
nào được phục vụ, và máy tính có màn hình cảm ứng rơi vào đúng khe đó.

## Một phát hiện phụ, không liên quan tới cảm ứng

`aria-label` của bàn cờ ở **cả ba** cấu hình chỉ là:

> `Bàn cờ 8 trên 8, 2 thùng, 0 đã vào đích`

Đây là **bản tóm tắt**, không phải bản đồ. Không có vị trí tường, vị trí thùng, vị trí đích,
vị trí người chơi. Người dùng trình đọc màn hình biết được *còn mấy thùng chưa xong* nhưng
**không thể biết phải đi hướng nào** — tức là không chơi được, dù NFR-A11Y-02 (thao tác được
bằng bàn phím) vẫn đạt. NFR-A11Y-07 nói "bàn cờ có bản mô tả bằng chữ cho trình đọc màn
hình": bản mô tả **có tồn tại**, nhưng không đủ để chơi.

Ghi ở đây vì nó do kiểm chứng bằng máy tìm ra, không do persona nào vấp phải — và theo luật
chống bịa ở `lib/frameworks.md`, nó chỉ được lên báo cáo khi có persona xác nhận, hoặc được
ghi rõ là **quan sát của người điều phối, không phải phát hiện từ phiên**.
