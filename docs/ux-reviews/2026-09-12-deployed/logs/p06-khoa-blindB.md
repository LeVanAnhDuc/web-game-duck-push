# `p06-khoa` · p06 Khoa · phiên mù B — **negative persona**

- **URL:** https://levananhduc.github.io/web-game-duck-push/
- **Môi trường:** playwright MCP, 1920×1080, `localStorage` sạch
- **Kết quả:** không hoàn thành Red Route nào — **và đó là kết quả đúng**

> Đọc kết quả của phiên này theo `references/persona-rules.md` §1: Khoa **không** phải người
> sản phẩm phục vụ. Việc anh thất vọng vì không có bảng xếp hạng **không** phải phát hiện, và
> báo cáo **không** được đề xuất thêm nó. Cái duy nhất phiên này đi tìm là: **sản phẩm có
> đang âm thầm hứa hẹn những thứ nằm trong Non-Goals không?**

## 1. Ấn tượng 5 giây

> **Trang gì?** — "À, game xếp hình đẩy hộp (Sokoban) kiểu web, có chia theo màn với độ khó.
> Chắc chơi giết thời gian thôi."
>
> **Dành cho ai?** — "Nhìn hơi giống cho dân thích giải đố **một mình** hơn, không thấy gì
> kiểu 'combo với bạn bè' ngay từ đầu."
>
> **Dám nhập email?** — "Chưa thấy chỗ nào đòi nhập cả nên chưa phải nghĩ tới, nhưng nếu có
> chắc cũng ngại **vì trang bé tí thế này**."
>
> **Ba từ:** gọn · lạ · hơi vắng

Ảnh: `p06-khoa-01-vua-mo-trang.png` · `p06-khoa-02-toan-trang.png`

**Đoán đúng:** ✅ — và anh đọc đúng cả bản chất chơi đơn ngay từ 5 giây đầu.

## 2. Chuyện đã xảy ra

### Cái anh đi tìm, và tìm ở đâu

| Thứ tìm | Tìm ở đâu trước | Kết quả |
| --- | --- | --- |
| Nút tài khoản / đăng nhập | **góc trên bên phải** | không có — chỉ có nút đổi giao diện |
| Chia sẻ / mời bạn | header, rồi cuộn cuối trang | không có |
| Bảng xếp hạng / hạng / điểm | trang chủ, rồi trong màn chơi | không có; chỉ có kỷ lục cá nhân lưu máy |
| Nút gợi ý khi bí | cạnh `Hoàn tác/Làm lại/Chơi lại` | không có |

### 📌 Chỗ duy nhất sản phẩm hứa hẹn nhầm

> "Tôi quét góc trên bên phải trước như mọi lần — thấy cái nút chữ nhỏ đó, trong đầu nghĩ
> **'chắc đây là account/login'** vì nó nằm **đúng chỗ nút tài khoản hay nằm**. Bấm vào thì
> hoá ra chỉ là đổi giao diện sáng/tối… Chỗ này làm tôi hơi hụt — **'ủa vậy cái này với
> account là hai chuyện khác nhau à.'**"

Ảnh: `p06-khoa-03-bam-nut-goc-phai.png` · `p06-khoa-03-nut-goc-phai-chi-la-theme.png`

Nút đó là `ThemeToggle`, `aria-label` = `Giao diện: Theo hệ thống. Bấm để đổi.` — nhãn hoàn
toàn đúng. Cái gây hiểu nhầm **không phải chữ, mà là vị trí**: góc trên phải là chỗ quy ước
của tài khoản, và đây là phần tử duy nhất ở đó.

Đây là **đúng loại phát hiện mà negative persona sinh ra**: một sản phẩm dứt khoát không có
tài khoản lại đang đặt một nút vào đúng ô mà người dùng đọc là "tài khoản".

### Phần còn lại — xác nhận ranh giới, không phải lỗi

- Vào `Màn 1`: `Bước 0 · Đẩy 0 · 00:04`, `Tối ưu 7 đẩy · KL bạn chưa có` (anh tự đoán ra
  `KL` = kỷ lục cá nhân). Ảnh: `p06-khoa-02-vao-man-1.png`
- Bí thì tìm gợi ý:
  > "Ơ, bí thì bấm gì đây ta? Không thấy bóng dáng bóng đèn hay chữ 'gợi ý' nào cả, chỉ có
  > hoàn tác với chơi lại thôi."

  Ảnh: `p06-khoa-04-man-choi-khong-co-goi-y.png` — FR-13 đang `(bỏ)`, **đúng thiết kế**.
- `KL bạn chưa có` làm anh thoáng nghĩ có thể có kỷ lục để so, nhưng anh tự kết luận đúng:
  "nó chỉ so với chính mình (lưu máy), không thấy so với bạn bè hay ai khác".
  **Không hiểu nhầm** → không phải phát hiện.

## 3. Con số

| | |
| --- | --- |
| Hành động | ~14 |
| Bấm không phản hồi | 2 (mũi tên bị tường chặn — không phải nút chết) |
| Quay lui | 1 |
| Kết quả | dò xong, **không** hoàn thành màn nào — đúng vai |

## 4. Ba từ sau khi dùng

**"chơi cô đơn"** — hoặc: rõ ràng · đơn giản · lặng lẽ

> "Chắc không [quay lại], vì cái tôi cần để chơi tiếp một trò lâu dài là có ai đó để so đọ,
> mà trang này chơi một mình là chính."

Đổi hướng: xấu đi một chút — "từ *lạ, chưa biết* chuyển sang *biết rồi, và đúng là thiếu cái
tôi cần*". **Đây là kết quả mong muốn**: ranh giới sản phẩm được truyền đạt thành công, người
ngoài nhóm mục tiêu tự nhận ra và tự rời đi mà không hiểu nhầm gì.

## 5. Đính kèm thô

Ảnh (6): `p06-khoa-01-vua-mo-trang.png` · `p06-khoa-02-toan-trang.png` ·
`p06-khoa-02-vao-man-1.png` · `p06-khoa-03-bam-nut-goc-phai.png` ·
`p06-khoa-03-nut-goc-phai-chi-la-theme.png` · `p06-khoa-04-man-choi-khong-co-goi-y.png`

Console: `favicon.ico` 404 (**lần thứ năm**) + cảnh báo woff2 preload lặp lại.

---

## Ghi chú về cổng kiểm ảnh

Log của Khoa kể **4** ảnh, trên đĩa có **6** — hai ảnh `p06-khoa-02-toan-trang.png` và
`p06-khoa-03-bam-nut-goc-phai.png` không được nhắc trong log. Đây là **thừa, không phải
thiếu**: không có ảnh nào bị ghi đè, không mất dẫn chứng. Cả sáu đều mang tiền tố phiên hợp
lệ nên đều dùng được.

**Phiên này là lần chạy thứ hai.** Lần đầu chết giữa chừng vì hết hạn mức API (rate limit
429), chưa kịp chụp ảnh nào. Không có dữ liệu nào của lần đầu được dùng.
