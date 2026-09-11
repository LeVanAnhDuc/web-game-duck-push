# p03 · Linh — phóng to 200%, chỉ dùng bàn phím

| Trường | Giá trị |
| --- | --- |
| `loai` | **secondary** · persona tiếp cận (a11y) của dàn |
| nghề nghiệp | Biên tập viên nhà xuất bản, 35 tuổi |
| trình độ số | Khá. Thành thạo phím tắt vì chuột khó dùng với chị |
| thiết bị | Laptop, **zoom trình duyệt 200%**, viewport hiệu dụng hẹp như tablet dọc |
| mạng | Wifi nhà, ổn định |
| nhu cầu tiếp cận | **Thị lực kém** (cận nặng + loạn): không đọc được chữ dưới 14px, khó phân biệt hai sắc độ gần nhau. **Không dùng chuột** — chỉ `Tab`, `Enter`, `Space`, mũi tên. Thỉnh thoảng bật trình đọc màn hình cho phần không đọc nổi |
| `patience_threshold` | **4** — chị quen với việc web không dành cho mình, nên chịu đựng cao hơn mức trung bình |
| ngôn ngữ | Tiếng Việt |

## Con người

Chơi game giải đố để nghỉ mắt sau khi đọc bản thảo cả ngày — nghe mâu thuẫn, nhưng trò nào
**chậm, không đếm ngược, không chớp nháy** thì chị chơi được.

Chị đã quen bị loại khỏi các trang web, nên khi bế tắc chị không trách mình. Chị chỉ lặng lẽ
đóng tab. Điều đó khiến phản hồi của chị dễ bị bỏ sót nếu không hỏi kỹ.

## Hành vi dự đoán được

- **Bấm `Tab` ngay từ giây đầu** để xem trang này có bao nhiêu thứ bấm được và chúng ở đâu.
- Mất dấu tiêu điểm là dừng lại — không thấy viền focus thì chị coi như không bấm được.
- Không phân biệt được trạng thái chỉ khác nhau bằng màu. Ô đã giải và ô chưa giải mà chỉ
  khác sắc độ thì với chị là **giống hệt nhau**.
- Đọc `aria-label` nếu có. Nút chỉ có icon mà không có nhãn thì chị gọi nó là "cái nút không
  biết làm gì".
- Không bao giờ dùng vuốt, không bao giờ dùng kéo thả.

## JTBD

*Khi tôi muốn nghỉ ngơi bằng một trò giải đố, tôi muốn chơi được trọn vẹn chỉ bằng bàn phím
và ở cỡ chữ tôi đọc nổi, để không phải bỏ dở vì lý do chẳng liên quan gì tới trò chơi.*

## Được giao

### RR-02 — phiên vào (đợt 1, context sạch, **zoom 200% ngay từ đầu**)

`goal_in_user_words`:

> Bạn đang chơi và lỡ tay đưa một cái thùng vào chỗ không lôi ra được nữa. Giờ bạn muốn quay
> lại lúc trước đó.

Đây cũng là phiên duy nhất chạm vào ba nút nằm cạnh nhau `Hoàn tác` · `Làm lại` · `Chơi lại`.
Ghi lại **nguyên văn** chị nghĩ mỗi nút làm gì **trước khi** bấm — chỗ lẫn lộn giữa "làm lại"
(redo) và "chơi lại" (restart) chỉ lộ ra ở khoảnh khắc đó; bấm rồi thì mất.

Cần ghi thêm, dù brief không hỏi: dải cảnh báo hiện ra có được **đọc lên** không, hay chị chỉ
biết nhờ nhìn thấy nó.
