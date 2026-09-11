# `p05-minh` · p04 Minh · RR-05

- **URL:** https://levananhduc.github.io/web-game-duck-push/
- **Môi trường:** playwright MCP, **390×844**, `localStorage` sạch lúc bắt đầu
- **Kết quả:** **xong**

## 1. Ấn tượng 5 giây

> **Trang gì?** — "À trò xếp hình đẩy thùng (thấy chữ SOKOBAN to đùng trên đầu), có nhiều màn
> xếp theo độ khó từ Dễ tới Rất khó, bấm vào là chơi luôn."
>
> **Dành cho ai?** — "Chắc dành cho ai rảnh thích giải đố kiểu logic, **không hẳn cho tôi vì
> tôi lười nghĩ nhiều nước.**"
>
> **Dám nhập email?** — "Chả thấy chỗ nào đòi nhập cái gì cả nên khỏi phải lo, đỡ phải nghĩ."
>
> **Ba từ:** gọn · lạ · "chơi thử xem sao"

Ảnh: `p05-minh-01-vua-mo-trang.png`

**Đoán đúng:** ✅

## 2. Chuyện đã xảy ra

1. Bấm `Màn 1, chưa giải`. HUD: `Bước 0 · Đẩy 0 · 00:03`, `Tối ưu 7 đẩy`.
2. Đi 6 phím mũi tên (Lên, Trái, Trái, Lên, Phải, Phải) → **`Bước 4 · Đẩy 0 · 00:17`**, màn 1
   bậc Dễ. Ảnh: `p05-minh-02-dang-choi-do.png`
3. **Rời đi đúng kiểu Minh**: không bấm `Về trang chủ`, chỉ tải lại thẳng URL gốc.
4. Trang mở lại — khối `Đang chơi dở` hiện **ngay dưới tiêu đề, không phải cuộn xuống tìm**:
   `Màn 1 · Dễ — 4 bước · 0 đẩy · 00:11 — Chơi tiếp`.

   > "Thấy gần như ngay lập tức, tôi nghĩ trong đầu **'à có nó lưu lại thiệt'**."

   Ảnh: `p05-minh-03-mo-lai.png`
5. Bấm `Chơi tiếp` → `Bước 4 · Đẩy 0` — **khớp y chang** lúc bỏ dở.
6. Bấm `Hoàn tác` → `Bước 3 · Đẩy 0`, nút `Làm lại` sáng lên.

   > "tức là **lịch sử các nước đi cũng còn nguyên** chứ không phải chỉ lưu mỗi vị trí cuối."

Đây đúng là `done_when` của RR-05, gồm cả vế khó nhất: lịch sử hoàn tác sống sót.

## 3. Con số

| | |
| --- | --- |
| Hành động | ~13 |
| Thời gian | < 2 phút thao tác thật |
| Quay lui | **0** — "thấy ngay lần đầu" |
| Bấm không phản hồi | 0 |
| Kết quả | **xong** |

`min_steps` RR-05 = 1. Minh dùng đúng **1** (bấm `Chơi tiếp`).

## 4. Ba từ sau khi dùng

**yên tâm · bất ngờ (theo hướng tốt) · được đó**

> "có, vì lỡ chơi dở giữa chừng vẫn còn nguyên khi mở lại — **đúng kiểu tôi hay bị cắt ngang
> giữa giờ ra chơi**, không sợ mất công."

Đổi hướng: **tốt lên rõ** — `gọn · lạ · chơi thử xem sao` → từ "lạ/nghi ngờ" sang
"yên tâm/tin dùng".

## 5. Đính kèm thô

Ảnh (3): `p05-minh-01-vua-mo-trang.png` · `p05-minh-02-dang-choi-do.png` ·
`p05-minh-03-mo-lai.png`

Console: `favicon.ico` 404 (**lần thứ tư**) + loạt cảnh báo woff2 preload không dùng tới.

> "không có lỗi liên quan tới lưu tiến trình chơi."

---

## Ghi chú

Một chi tiết nhỏ đáng ghi: thẻ `Đang chơi dở` hiện `00:11` trong khi lúc bỏ dở đồng hồ là
`00:17`, và sau khi bấm `Chơi tiếp` đồng hồ về `00:03` rồi chạy tiếp. Minh **không thắc mắc**
("thời gian đếm lại từ khi mở, nhưng bước/đẩy thì khớp y chang"), nên đây không phải phát
hiện — nhưng nếu sau này có ai định dùng thời gian làm kỷ lục thì đây là chỗ phải xem lại.
