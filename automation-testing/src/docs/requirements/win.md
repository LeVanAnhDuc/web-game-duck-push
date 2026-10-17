# WIN — Thắng, lớp phủ kết quả, kỷ lục

- **REQ-WIN-01** Đẩy thùng cuối vào đích thì hiện lớp phủ `Xong màn!` (hộp thoại) với số bước · số đẩy · thời gian của ván vừa rồi; giải được cả màn chỉ bằng bàn phím (FR-04, US-01, NFR-A11Y-02).
- **REQ-WIN-02** Lớp phủ so với số đẩy tối ưu: bằng thì `Đạt đúng số đẩy tối ưu (N đẩy).`, hơn thì nói còn thiếu bao nhiêu đẩy (FR-04).
- **REQ-WIN-03** Lớp phủ so với kỷ lục **trước** ván này: lần đầu, kỷ lục cũ, hay vừa phá kỷ lục (FR-04, US-04).
- **REQ-WIN-04** Kỷ lục chỉ bị ghi đè khi ván mới **tốt hơn**, so theo số đẩy trước số bước; đạt đúng số đẩy tối ưu thì ô màn có sao (FR-07, FR-09, US-04 "Điều gì có thể sai").
- **REQ-WIN-05** Ván đã thắng đứng yên: lớp phủ đang mở thì phím không đi; đóng lớp phủ (Escape) thì bàn cờ vẫn không đi, nút `Kết quả` mở lại lớp phủ (FR-04).
- **REQ-WIN-06** Ba lối ra trên lớp phủ: `Chơi lại` (về đầu màn), `Tiếp` (màn kế trong chiến dịch; hết bậc thì về trang chủ kèm lời nhắn), `Màn ngẫu nhiên` (màn sinh mới cùng bậc) (FR-04, FR-08).
- **REQ-WIN-07** Thắng được báo qua live region cho người dùng trình đọc màn hình (NFR-A11Y-04).
- **REQ-WIN-08** Hoàn tác nước thắng mở lại ván; thắng lại thì lớp phủ hiện lại (FR-02, FR-04).
