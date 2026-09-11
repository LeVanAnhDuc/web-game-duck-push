# p01 · Thảo — chưa từng nghe tới Sokoban, chơi lúc chờ xe

| Trường | Giá trị |
| --- | --- |
| `loai` | **primary** |
| nghề nghiệp | Nhân viên kế toán, 29 tuổi, TP.HCM |
| trình độ số | Trung bình — dùng thành thạo Zalo, Shopee, ví điện tử; chưa bao giờ mở tab DevTools |
| thiết bị | Điện thoại Android tầm trung, **viewport 375×812**, cảm ứng, không bàn phím |
| mạng | 4G yếu ở tầng hầm gửi xe — **throttle Slow 3G** |
| nhu cầu tiếp cận | Không có nhu cầu đặc biệt. Nhưng cầm máy một tay, ngón cái chỉ với tới nửa dưới màn hình |
| `patience_threshold` | **3** bước bế tắc liên tiếp |
| ngôn ngữ | Tiếng Việt |

## Con người

Chờ lấy xe khoảng 5–10 phút mỗi chiều, trong khoảng đó muốn có cái gì đó bấm cho hết giờ.
Ai đó gửi link, mở ra xem thử. Chưa từng chơi Sokoban và **không biết cái tên đó**. Cái cô
biết là Candy Crush và game xếp kim cương.

Sợ nhất là bấm nhầm vào quảng cáo rồi bị nhảy sang store. Có phản xạ đóng tab rất nhanh nếu
trang mở ra mà không hiểu ngay là cái gì.

## Hành vi dự đoán được

- **Vuốt trước, bấm sau.** Thấy một lưới ô vuông là vuốt thử, không đi tìm nút.
- Không đọc dòng chữ nhỏ phía dưới. Chỉ đọc thứ to nhất trên màn hình.
- Bấm lần hai sau khoảng 2 giây nếu bấm lần đầu mà giao diện không đổi hình.
- Không bao giờ nhìn thanh địa chỉ.
- Cuộn xuống hết trang trước khi kết luận "trang này chỉ có nhiêu đây".

## JTBD

*Khi tôi đứng chờ xe mười phút, tôi muốn có một trò bấm được ngay bằng một tay, để hết giờ
mà không phải tải app nào về máy.*

## Được giao

### RR-01 — phiên vào (đợt 1, context sạch)

`goal_in_user_words`:

> Bạn có mười phút rảnh và muốn thử xem trang này có gì chơi được không.

Không nói gì thêm. **Không** nhắc tới thùng, tới việc đẩy, tới màn chơi. Cái cần đo là sau
bao lâu thì cô tự hiểu ra đi vào thùng nghĩa là đẩy nó.

### RR-04 — phiên tiếp (đợt 2, **dùng lại đúng context của RR-01**)

`goal_in_user_words`:

> Hôm qua bạn chơi xong một màn ở đây. Hôm nay mở lại, xem còn gì đáng làm nữa không.

Không nói "phá kỷ lục", không nói "tối ưu". Nếu cô **tự** nhận ra ô màn cũ đang nói với mình
rằng còn làm tốt hơn được, thì lời mời quay lại đó có thật.
