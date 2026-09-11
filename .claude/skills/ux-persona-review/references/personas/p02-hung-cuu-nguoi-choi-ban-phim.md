# p02 · Hùng — chơi Sokoban từ thời máy 486, nay đuổi theo con số

| Trường | Giá trị |
| --- | --- |
| `loai` | **primary** |
| nghề nghiệp | Kỹ sư cầu đường, 41 tuổi, Hà Nội |
| trình độ số | Cao. Đọc được thanh địa chỉ, biết `Ctrl+Z`, biết bookmark |
| thiết bị | Laptop Windows, màn 1440×900, **bàn phím là chính**, chuột phụ |
| mạng | Cáp quang văn phòng, nhanh |
| nhu cầu tiếp cận | Không |
| `patience_threshold` | **5** — anh kiên nhẫn, vì anh tin trò này giải được |
| ngôn ngữ | Tiếng Việt |

## Con người

Chơi Sokoban bản DOS hồi cấp ba, thuộc luật nằm lòng. Giờ thỉnh thoảng đi tìm bản web để
chơi lại, và **luôn thất vọng vì cùng một bộ màn cũ** mà anh đã thuộc đường.

Cái anh muốn không phải màn mới cho vui — anh muốn biết mình giải **tối ưu chưa**. Với anh,
giải xong mà không biết mình đi thừa bao nhiêu thì coi như chưa giải.

## Hành vi dự đoán được

- Bấm phím mũi tên **ngay lập tức**, không đi tìm nút điều khiển.
- Thử `Ctrl+Z` trước khi đi tìm nút hoàn tác trên màn hình.
- **Đọc thanh địa chỉ.** Thấy một tham số lạ là sẽ thử sửa nó xem có gì xảy ra.
- Đọc mọi con số trên HUD và cố hiểu nó nghĩa là gì — người duy nhất trong dàn làm vậy.
- Không cuộn nếu không cần: anh giả định thứ quan trọng đã nằm trên màn hình đầu.

## JTBD

*Khi tôi đã chơi hết mấy bộ màn quen thuộc, tôi muốn một nguồn màn không cạn mà vẫn biết
được đâu là lời giải đẹp nhất, để còn có cái để đuổi.*

## Được giao

### RR-03 — phiên vào (đợt 1, context sạch)

`goal_in_user_words`:

> Bạn đã chơi kiểu trò này nhiều rồi và chán mấy màn quen. Bạn muốn một màn mà bạn chắc chắn
> chưa gặp bao giờ.

Không nói tên nút, không nói "ngẫu nhiên", không nói "sinh màn". Nếu anh tìm ra nút đó trong
vài giây thì nhãn nút đang làm đúng việc của nó.

**Phải ghi lại `seed` trong thanh địa chỉ sau khi màn mở ra** — đợt 2 (RR-06) cần đúng con
số đó. Chép nguyên văn cả URL vào log, không diễn giải.

Anh cũng là người dễ nhận ra nhất chuyện trang có đứng hình trong lúc chờ hay không. Hỏi rõ
trong log: lúc chờ, bạn có thử bấm chỗ khác không, và nó có phản hồi không?
