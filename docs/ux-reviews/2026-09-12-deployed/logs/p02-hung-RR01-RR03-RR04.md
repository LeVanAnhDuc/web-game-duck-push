# `p02-hung` · p02 Anh Hùng · RR-01 + RR-03 + RR-04

- **URL:** https://levananhduc.github.io/web-game-duck-push/
- **Môi trường:** playwright MCP, 1280×900, chuột + bàn phím, `localStorage` xoá sạch trước khi bắt đầu
- **Kết quả:** cả ba việc **xong**

Ba Red Route gộp vào một phiên vì chúng là **một vòng đời liên tục của cùng một người**:
chơi xong màn đầu → muốn màn mới → quay lại xem màn cũ. RR-04 bắt buộc phải nối tiếp RR-01
trong cùng `localStorage`; tách ra thì phải dựng trạng thái giả.

## 1. Ấn tượng 5 giây

> **Trang gì?** — "À, đây là game Sokoban chơi trên web, y chang bản DOS hồi xưa mình chơi."
>
> **Dành cho ai?** — "Nhìn cái tiêu đề SOKOBAN to đùng với lưới màn chọn số 1-20 là biết dành
> cho dân thích giải đố kiểu cũ, không phải trò mì ăn liền."
>
> **Dám nhập email?** — "Chả thấy chỗ nào đòi nhập gì cả, không có form đăng nhập đăng ký.
> Không phải lo khoản đó."
>
> **Ba từ:** quen thuộc · gọn gàng · tò mò

Ảnh: `p02-hung-01-vua-mo-trang.png`

**Đoán đúng:** ✅ — nhận ra đúng thể loại **và** đúng nhóm người dùng mục tiêu.

## 2. Chuyện đã xảy ra

### Việc 1 — RR-01 · giải xong một màn ✅

Bấm ô `1` ở bậc Dễ. URL đổi thành `?level=easy-01&d=easy` — anh **đọc thanh địa chỉ và ghi
nhận ngay** hai tham số.

HUD: `Bước 0 · Đẩy 0 · 00:20` và `Tối ưu 7 đẩy · KL bạn chưa có`.

> "Con số *Tối ưu 7 đẩy* này đúng thứ tôi cần — biết trước là giải bằng đúng 7 lần đẩy mới
> coi là ngon."

Giải bằng đúng 7 đẩy / 14 bước. Lớp phủ, chép nguyên văn:

```
Màn 1
14 bước · 7 đẩy · 02:11
Đạt đúng số đẩy tối ưu (7 đẩy).
Lần đầu bạn giải màn này.
```

Ảnh: `p02-hung-02-man-1-bat-dau.png` → `p02-hung-03-luc-thang.png`

### Việc 2 — RR-03 · lấy một màn chưa gặp bao giờ ✅

Bấm `Tiếp` trước → nhảy sang `?level=easy-02&d=easy`. Anh tự nhận ra đó **không** phải cái
mình cần:

> "đây vẫn là campaign tuần tự, không phải cái tôi cần, đây là màn có sẵn từ trước chứ không
> phải màn mới toanh"

Quay về trang chủ, bấm `Màn ngẫu nhiên · Dễ` — **tự tìm ra, không ai chỉ**. URL:

```
https://levananhduc.github.io/web-game-duck-push/?seed=4152196902&d=easy
```

> "không đợi chờ gì cả, ra ngay tức thì"

Nhưng tiêu đề màn hiện ra là:

> **"Màn 4152196902"** — "lấy luôn cái seed làm tên màn luôn!"

Ảnh: `p02-hung-04-man-ngau-nhien.png`

### Việc 3 — RR-04 · quay lại xem màn cũ ✅

Ô `1` trên lưới đổi thành `Màn 1, đã giải, đạt số đẩy tối ưu, kỷ lục 7 đẩy`, dưới số `1` có
dòng nhỏ `7 đẩy`.

> "Đọc được ngay: à, đây là kỷ lục cá nhân được lưu lại, khác hẳn 19 ô còn lại vẫn trơ trọi
> *chưa giải*."

Mở lại màn 1: HUD đổi từ `KL bạn chưa có` thành `Tối ưu 7 đẩy · KL bạn 7`.

> "Có lý do quay lại chơi lại nó không? Không — vì đã đạt đúng số đẩy tối ưu rồi... Cái tôi
> đọc được để kết luận vậy nằm ở đúng dòng *KL bạn 7* so với *Tối ưu 7 đẩy* — hai số bằng
> nhau là hết đường tiến bộ."

Ảnh: `p02-hung-05-trang-chu-sau-khi-giai.png` · `p02-hung-06-man-1-mo-lai.png`

## 3. Con số

| | |
| --- | --- |
| Hành động | ~18 thao tác giao diện (+8–10 lần đọc dữ liệu trang, xem §Cảnh báo) |
| Thời gian | màn 1 xong ở 02:11 |
| Quay lui | 2 (về trang chủ) |
| Bấm không phản hồi | 0 từ phía trang (1 lần lỗi cú pháp của chính công cụ) |
| RR-01 | **xong**, 7/7 đẩy tối ưu |
| RR-03 | **xong**, seed `4152196902` |
| RR-04 | **xong**, đọc đúng trạng thái ô màn |

## 4. Ba từ sau khi dùng

**gọn · đúng ý · không màu mè**

> "Có quay lại — vì nó cho biết chính xác số đẩy tối ưu từng màn và lưu kỷ lục của mình…
> với lại có nút Màn ngẫu nhiên nên không lo hết màn để chơi lại."

Đổi hướng: **tốt lên** — `quen thuộc · gọn gàng · tò mò` → `gọn · đúng ý · không màu mè`,
từ "tò mò xem thử" sang "tin dùng thật sự".

## 5. Đính kèm thô

Ảnh (6): `p02-hung-01-vua-mo-trang.png` · `p02-hung-02-man-1-bat-dau.png` ·
`p02-hung-03-luc-thang.png` · `p02-hung-04-man-ngau-nhien.png` ·
`p02-hung-05-trang-chu-sau-khi-giai.png` · `p02-hung-06-man-1-mo-lai.png`

Console, nguyên trạng:

```
Total messages: 0 (Errors: 0, Warnings: 0)
[ERROR] Failed to load resource: the server responded with a status of 404 ()
  @ https://levananhduc.github.io/favicon.ico:0
```

---

## ⚠️ Cảnh báo về chính phiên này

**Persona này nhìn bàn cờ bằng cây DOM, không bằng mắt.** Anh tự khai:

> "ảnh chụp màn hình không tự hiện ra để tôi nhìn trực tiếp được, phải lần theo toạ độ từng
> ô để dựng lại bàn cờ trong đầu — nói thật là hơi vòng vèo"

Hệ quả, phải tôn trọng khi đọc kết quả:

- Mọi kết luận về **điều hướng, nhãn, con số, URL** vẫn dùng được — anh đọc chúng như người
  thường đọc.
- Việc anh **giải được màn trong 14 nước đúng tối ưu** thì **không** phải bằng chứng rằng
  một người nhìn màn hình cũng làm được như vậy. Không dùng phiên này để chấm độ khó, và
  không dùng để kết luận "luật chơi tự lộ ra" — anh vốn đã thuộc luật từ trước.
