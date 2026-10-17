# CAMPAIGN — Chiến dịch: bậc khó, lưới chọn màn, đường dẫn màn

- **REQ-CAMPAIGN-01** Lần đầu mở trang chủ: bậc `Dễ` đang chọn, lưới 20 màn, **không màn nào bị khoá** (FR-07, US-01 bước 1).
- **REQ-CAMPAIGN-02** Bốn bậc khó `Dễ · Vừa · Khó · Rất khó` (20 · 20 · 15 · 10 màn); đổi bậc đổi lưới màn và nhãn nút màn ngẫu nhiên, nút đang chọn có `aria-pressed` (FR-06, FR-07).
- **REQ-CAMPAIGN-03** Bấm một ô mở đúng màn đó; URL mang `?level=<mã>&d=<bậc>`; mở thẳng đường dẫn đó cũng vào đúng màn (FR-07).
- **REQ-CAMPAIGN-04** `Về trang chủ` quay lại lưới và xoá mã màn khỏi URL (FR-07).
- **REQ-CAMPAIGN-05** Đường dẫn hỏng (mã màn lạ, thiếu / sai bậc khó) về trang chủ kèm lời nhắn đọc được, không bao giờ trắng trang (US-03 "Điều gì có thể sai", NFR-SEC-07).
- **REQ-CAMPAIGN-06** Ô màn đã giải hiện dấu tích + kỷ lục đẩy; đạt đúng số đẩy tối ưu thì dấu sao; nhãn chữ nói cùng điều đó và chú giải nói nghĩa hai ký hiệu (FR-07, NFR-A11Y-06).
- **REQ-CAMPAIGN-07** Tải pack màn lỗi thì nói ra bằng chữ kèm nút `Thử lại` tải được lại (NFR-REL-01).
