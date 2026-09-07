# Danh mục chức năng

> **Trả lời:** Hệ thống có những chức năng nào, mỗi cái đang ở trạng thái gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/v1-core
> **Cập nhật khi:** brainstorm ra chức năng mới (cấp FR mới) · một FR chuyển trạng thái

Trạng thái: `chưa` · `đang làm` · `xong` · `(bỏ)`

| ID | Chức năng | Thuộc luồng | Trạng thái |
| --- | --- | --- | --- |
| FR-01 | Bàn cờ và luật Sokoban: đi 4 hướng, đẩy một thùng, chặn tường và thùng thứ hai | US-01 | xong |
| FR-02 | Hoàn tác / làm lại theo lịch sử nước đi, và chơi lại màn từ đầu | US-02 | xong |
| FR-03 | HUD đếm số bước, số lần đẩy, thời gian, kèm số đẩy tối ưu của màn | US-01 | xong |
| FR-04 | Phát hiện thắng và lớp phủ kết quả, so với kỷ lục cũ | US-01 | xong |
| FR-05 | Cảnh báo bế tắc: ô chết tĩnh + thùng đóng băng, hiện dạng dải, không hộp thoại | US-02 | xong |
| FR-06 | Pack màn chiến dịch sinh sẵn lúc build, chia 4 bậc khó | US-01 | xong |
| FR-07 | Lưới chọn màn tự do, đánh dấu đã giải / đạt tối ưu | US-01, US-04 | xong |
| FR-08 | Sinh màn ngẫu nhiên tại chỗ trong Web Worker, có trạng thái chờ và đường lui | US-03 | xong |
| FR-09 | Lưu tiến độ, ván đang dở và kỷ lục vào `localStorage`, có số hiệu phiên bản | US-04, US-05 | xong |
| FR-10 | Điều khiển: phím mũi tên / WASD trên máy tính, vuốt và D-pad trên cảm ứng | US-01 | xong |
| FR-11 | Seed của màn ngẫu nhiên nằm trong URL để mở lại và chia sẻ | US-03 | xong |
| FR-12 | Giao diện sáng/tối theo hệ điều hành, tôn trọng `prefers-reduced-motion` | US-01 | xong |
| FR-13 | Gợi ý nước đi | — | (bỏ) — xem Non-Goals, để sau v1 |
| FR-14 | Trình soạn màn | — | (bỏ) — xem Non-Goals |
| FR-15 | Bảng xếp hạng online | — | (bỏ) — xem Non-Goals |
