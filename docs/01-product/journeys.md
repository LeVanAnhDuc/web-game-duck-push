# Luồng người dùng

> **Trả lời:** Người dùng đi qua những luồng nào từ đầu đến cuối?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/v1-core
> **Cập nhật khi:** có luồng người dùng mới · một luồng cũ đổi bản chất

## US-01 · Giải màn đầu tiên

**Bối cảnh:** Người chơi mở trang lần đầu, chưa có gì trong máy, có thể chưa từng chơi Sokoban.

**Các bước:**
1. Mở trang chủ, thấy lưới màn của bậc Dễ, không có màn nào bị khoá.
2. Bấm màn 1.
3. Đẩy thùng bằng phím mũi tên (máy tính) hoặc vuốt / bấm D-pad (điện thoại).
4. Đẩy thùng cuối cùng vào ô đích.

**Kết quả mong đợi:** Lớp phủ báo thắng, hiện số bước · số đẩy · thời gian của ván vừa rồi,
so với số đẩy tối ưu. Màn 1 được đánh dấu đã giải trên lưới. Tiến độ đã nằm trong máy.

**Điều gì có thể sai:**
- Người chơi không biết đẩy: cần màn 1 đơn giản tới mức thử một hướng là hiểu.
- Bấm phím mũi tên làm cuộn trang trên máy tính → phải chặn hành vi mặc định.
- Bàn cờ tràn khỏi màn hình 375px → phải tính cạnh ô theo viewport, không cho bàn cuộn.
- `localStorage` bị chặn (chế độ riêng tư): vẫn phải chơi được, chỉ là không nhớ.

**Chức năng liên quan:** FR-01 · FR-03 · FR-04 · FR-06 · FR-07 · FR-10

---

## US-02 · Hoàn tác sau khi đẩy hỏng

**Bối cảnh:** Đang chơi dở, vừa đẩy một thùng vào góc và không kéo ra được nữa.

**Các bước:**
1. Đẩy thùng vào ô chết.
2. Thấy dải cảnh báo "thùng này kẹt rồi" ngay dưới bàn cờ.
3. Bấm Hoàn tác (hoặc `Z` / `Ctrl+Z`) một hoặc nhiều lần.
4. Nếu muốn làm lại từ đầu thì bấm Chơi lại.

**Kết quả mong đợi:** Mỗi lần hoàn tác lùi đúng một nước, bộ đếm bước và đẩy lùi theo, cảnh
báo biến mất khi thế kẹt được gỡ. Chơi lại đưa bàn cờ về đúng trạng thái đầu, đồng hồ reset.

**Điều gì có thể sai:**
- Hoàn tác cài bằng "đi ngược lại" thay vì lùi lịch sử → sai âm thầm, vì trong Sokoban kéo
  không phải là nghịch đảo của đẩy.
- Cảnh báo báo nhầm một thế vẫn cứu được → mất lòng tin, tệ hơn là không cảnh báo.
- Cảnh báo hiện dạng hộp thoại chắn ngang đúng cái nút người chơi đang với tới.

**Chức năng liên quan:** FR-02 · FR-05

---

## US-03 · Chơi một màn ngẫu nhiên

**Bối cảnh:** Đã giải hết mấy màn quen, muốn một màn chưa ai từng thấy.

**Các bước:**
1. Ở trang chủ bấm "Màn ngẫu nhiên", chọn bậc khó.
2. Chờ trong lúc máy sinh màn (có trạng thái chờ, không đứng hình).
3. Chơi như màn thường.
4. Muốn đưa màn đó cho người khác thì copy đường dẫn — seed nằm trong URL.

**Kết quả mong đợi:** Màn mới, chắc chắn giải được, đúng bậc khó đã chọn, kèm số đẩy tối ưu.
Mở lại đúng đường dẫn đó ở máy khác cho ra **đúng màn đó**.

**Điều gì có thể sai:**
- Sinh lâu quá ngưỡng → phải hạ chuẩn (bàn nhỏ hơn, ít thùng hơn) chứ không được treo.
- Sinh trên luồng chính → cả trang đứng hình. Bắt buộc chạy trong Web Worker.
- Trình duyệt không có Worker → phải có đường lui, dù chậm hơn.
- Seed trong URL bị sửa bậy → phải kiểm tra và báo lỗi tử tế, không nổ trắng trang.

**Chức năng liên quan:** FR-08 · FR-11

---

## US-04 · Quay lại phá kỷ lục

**Bối cảnh:** Đã giải màn 12 hết 34 lần đẩy, trong khi tối ưu là 21.

**Các bước:**
1. Ở lưới chọn màn, màn 12 hiện dấu đã giải kèm kỷ lục cũ.
2. Bấm vào chơi lại.
3. Giải lại với ít lần đẩy hơn.

**Kết quả mong đợi:** Kỷ lục chỉ được ghi đè khi **tốt hơn**. Đạt đúng số đẩy tối ưu thì ô
màn đổi sang dấu sao.

**Điều gì có thể sai:**
- Ghi đè kỷ lục bằng ván mới dù ván mới tệ hơn.
- So kỷ lục bằng số bước đi trong khi nhãn nói số lần đẩy — hai đại lượng khác nhau.

**Chức năng liên quan:** FR-07 · FR-09

---

## US-05 · Chơi tiếp sau khi đóng trình duyệt

**Bối cảnh:** Đang dở màn 12 thì đóng tab, hôm sau mở lại.

**Các bước:**
1. Mở lại trang chủ.
2. Thẻ "Đang chơi dở" hiện màn 12 kèm số bước đã đi.
3. Bấm tiếp tục.

**Kết quả mong đợi:** Bàn cờ trở lại **đúng trạng thái đang dở**, kể cả lịch sử hoàn tác.

**Điều gì có thể sai:**
- Dữ liệu cũ từ phiên bản trước không còn khớp cấu trúc mới → phải có số hiệu phiên bản
  trong dữ liệu lưu và bỏ qua dữ liệu không đọc được, thay vì nổ.
- `localStorage` đầy hoặc bị chặn → ghi hỏng phải im lặng bỏ qua, không làm hỏng ván đang chơi.

**Chức năng liên quan:** FR-09
