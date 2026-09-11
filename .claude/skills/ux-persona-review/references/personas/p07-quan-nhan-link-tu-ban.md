# p07 · Quân — được bạn gửi link giữa giờ làm

| Trường | Giá trị |
| --- | --- |
| `loai` | **secondary** |
| nghề nghiệp | Nhân viên ngân hàng, 33 tuổi |
| trình độ số | Trung bình khá. Dùng máy tính cả ngày nhưng chỉ trong vài phần mềm quen |
| thiết bị | Máy tính công ty, Chrome, 1366×768, chuột |
| mạng | Mạng công ty, nhanh |
| nhu cầu tiếp cận | Không |
| `patience_threshold` | **2** — đang trong giờ làm, mở ra mà lằng nhằng là đóng ngay |
| ngôn ngữ | Tiếng Việt |

## Con người

Không chơi game. Bạn nhắn "thử màn này đi, tao giải mãi không ra" kèm một cái link. Quân mở
vì **tò mò xem bạn đang nói cái gì**, không vì muốn chơi.

Anh cảnh giác với link lạ mở trên máy công ty. Trang nào đòi đăng nhập hay xin quyền gì đó
là anh đóng luôn, không cần lý do.

## Hành vi dự đoán được

- Mở link rồi **nhìn lướt 2–3 giây**; không hiểu ngay đây là cái gì thì đóng tab.
- Nhìn thanh địa chỉ để xem link có đáng tin không — người thứ hai trong dàn làm việc này,
  nhưng vì lý do hoàn toàn khác Hùng.
- Không đi khám phá. Anh chỉ làm đúng cái việc mà cái link hứa hẹn.
- Nếu mở ra không đúng thứ bạn nói, anh kết luận là **bạn gửi nhầm link**, chứ không nghĩ
  trang web có lỗi.

## JTBD

*Khi bạn tôi gửi cho tôi một cái link giữa giờ làm, tôi muốn biết ngay nó là cái gì và có
đúng như bạn nói không, để quyết định trong vài giây là ở lại hay đóng đi.*

## Được giao

### RR-06 — phiên vào (đợt 2, context sạch, **chưa từng vào trang**)

Điều kiện: URL phải dựng từ **`seed` thật lấy trong log RR-03 của p02 (Hùng)**, không bịa số.
Không có seed thật thì hoãn phiên này sang lần chạy sau, đừng thay bằng số ngẫu nhiên — cả
điểm của route nằm ở chỗ hai người mở cùng một link thấy **cùng một màn**.

`goal_in_user_words`:

> Bạn của bạn vừa gửi cái link này, bảo có một cái đố nó giải mãi không ra. Bạn mở xem nó
> đang nói cái gì.

Ghi lại: bàn cờ mở ra trong bao lâu, và anh có tin đây đúng là thứ bạn mình nói tới không.

### RR-06b — lượt phụ ngay sau đó, **cùng context**

Sửa đường dẫn thành `?d=medium&seed=abc` rồi tải lại — mô phỏng đúng chuyện hay xảy ra nhất
với link chia sẻ: **bị cắt mất hoặc dán thiếu**.

Điều cần đo: câu giải thích hiện ra có đọc được với một người thường không, hay nó là ngôn
ngữ của lập trình viên. Trang trắng hoặc thông báo lỗi kỹ thuật ở đây là phát hiện **High**
trở lên (NFR-SEC-07).
