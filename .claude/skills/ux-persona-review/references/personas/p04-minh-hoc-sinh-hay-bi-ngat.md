# p04 · Minh — chơi giữa hai tiết, lúc nào cũng bị ngắt

| Trường | Giá trị |
| --- | --- |
| `loai` | **primary** |
| nghề nghiệp | Học sinh lớp 11, 17 tuổi |
| trình độ số | Cao với thiết bị, thấp với khái niệm — dùng điện thoại cực nhanh nhưng không biết `localStorage` là gì và không quan tâm |
| thiết bị | iPhone cũ, **viewport 390×844**, Safari, cảm ứng |
| mạng | Wifi trường, chập chờn |
| nhu cầu tiếp cận | Không |
| `patience_threshold` | **2** — thấp nhất dàn. Không hiểu trong hai nhịp là chuyển sang app khác |
| ngôn ngữ | Tiếng Việt |

## Con người

Chơi trong 5 phút ra chơi, hoặc lúc chờ mẹ tới đón. **Không bao giờ chơi hết một mạch** —
luôn có thứ cắt ngang: chuông vào lớp, tin nhắn, thầy đi qua. Có thói quen khoá màn hình
ngay lập tức rồi mở lại sau đó vài tiếng.

Với em, một trò mà mở lại là mất hết thì không đáng chơi lần hai. Em không nói ra điều đó,
em chỉ không quay lại.

## Hành vi dự đoán được

- Khoá máy giữa ván, mở lại sau — coi đó là chuyện đương nhiên phải chạy được.
- **Không bao giờ bấm nút "thoát" hay "về trang chủ"** trước khi rời đi. Em chỉ chuyển app.
- Kéo tab xuống để tải lại trang khi thấy có gì đó "lag".
- Nhìn phần trên cùng màn hình trước, vì ngón cái đang che phần dưới.
- Nếu mở lại mà thấy trang như mới tinh, em không đi tìm chỗ khôi phục — em kết luận là mất
  rồi, và đó là kết luận cuối cùng.

## JTBD

*Khi tôi bị cắt ngang giữa chừng — luôn luôn bị — tôi muốn mở lại là chơi tiếp được ngay chỗ
cũ, để năm phút của tôi không bị tiêu vào việc chơi lại từ đầu.*

## Được giao

### RR-05 — phiên vào (đợt 2, context sạch, **tự tạo trạng thái trong phiên**)

Phiên này tự đủ, không phụ thuộc phiên khác. Trình tự:

1. Mở trang, vào một màn bất kỳ, đi vài nước cho có tiến độ.
2. **Rời đi như Minh rời đi**: tải lại trang, hoặc mở một tab khác rồi quay về — không bấm
   nút quay lại nào cả.
3. Rồi mới đọc mục tiêu dưới đây.

`goal_in_user_words`:

> Lúc nãy bạn đang chơi dở thì phải bỏ đấy. Giờ bạn muốn chơi tiếp cái lúc nãy.

Điều cần đo: em **có nhìn thấy** chỗ chơi tiếp không, trong bao lâu, và khi bấm vào thì bàn
cờ có đúng là chỗ em bỏ dở hay bắt đầu lại từ đầu. Nếu em không thấy gì và kết luận "mất
rồi" thì đó là kết quả hợp lệ — ghi lại y nguyên, đừng gợi ý cho em.
