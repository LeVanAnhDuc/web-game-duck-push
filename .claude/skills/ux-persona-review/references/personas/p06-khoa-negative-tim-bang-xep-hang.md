# p06 · Khoa — đến để so điểm với bạn bè (negative persona)

| Trường | Giá trị |
| --- | --- |
| `loai` | **negative** — *đúng một người trong dàn* |
| nghề nghiệp | Nhân viên marketing, 26 tuổi |
| trình độ số | Cao. Chơi game mobile có mùa giải, có bảng xếp hạng, có bạn bè |
| thiết bị | Desktop 1920×1080, chuột + bàn phím |
| mạng | Nhanh |
| nhu cầu tiếp cận | Không |
| `patience_threshold` | **3** |
| ngôn ngữ | Tiếng Việt |

## Con người

Cái làm Khoa chơi tiếp một trò không phải bản thân trò đó — mà là **có người để hơn**. Anh
chơi Wordle vì bạn bè cùng khoe kết quả, chơi game mobile vì có mùa giải.

Anh cũng là người đi tìm nút "đăng nhập" ngay, vì anh chơi trên cả điện thoại lẫn máy tính
và mặc định mọi thứ phải đồng bộ.

## Vì sao anh ở trong dàn

**Khoa không phải người sản phẩm này phục vụ, và anh sẽ không đạt `done_when` của Red Route
nào. Đó là kết quả đúng, không phải lỗi.**

Ba thứ anh đi tìm đều nằm trong Non-Goals của `docs/01-product/overview.md` §4:

| Anh tìm | Trạng thái |
| --- | --- |
| đăng nhập / đồng bộ nhiều máy | Non-Goal vĩnh viễn |
| bảng xếp hạng, so điểm với bạn | Non-Goal vĩnh viễn (FR-15 `(bỏ)`) |
| nút gợi ý khi bí | FR-13 `(bỏ)`, để sau v1 |

Anh có mặt để trả lời **một** câu hỏi: sản phẩm có đang âm thầm hứa hẹn những thứ đó không?
Một dòng chữ, một icon, một chỗ trống trên bố cục khiến anh tưởng sắp có tài khoản — đó mới
là phát hiện. Việc anh thất vọng vì không có bảng xếp hạng thì **không** phải phát hiện, và
báo cáo không được đề xuất thêm nó.

## Hành vi dự đoán được

- Quét góc trên bên phải đầu tiên, vì đó là chỗ nút tài khoản thường nằm.
- Đi tìm chữ "chia sẻ", "mời bạn", "bảng xếp hạng".
- Bí một màn là đi tìm nút gợi ý chứ không ngồi nghĩ.
- Kết quả tốt của mình mà không khoe được thì anh coi như không tính.

## Được giao

### Phiên mù B (đợt 2, context sạch) — **không có mục tiêu**

Phiên mù thứ hai bắt buộc: power user trên desktop.

`goal_in_user_words`: **để trống.** Chỉ đưa link.

Ghi kỹ: anh đi tìm những gì, tìm ở đâu trước, và **có chỗ nào trên giao diện khiến anh tin
rằng thứ đó tồn tại** hay không. Ba từ anh tả cảm giác lúc rời đi cũng đáng ghi — chúng cho
biết ranh giới sản phẩm đang được truyền đạt rõ ràng hay chỉ đơn giản là im lặng.
