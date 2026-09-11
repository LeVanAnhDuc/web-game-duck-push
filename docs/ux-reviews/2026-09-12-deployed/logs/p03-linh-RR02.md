# `p03-linh` · p03 Chị Linh · RR-02

- **URL:** https://levananhduc.github.io/web-game-duck-push/
- **Môi trường:** playwright MCP, **640×800** (giả lập phóng to 200% trên màn 1280), **chỉ bàn phím**, `localStorage` sạch
- **Kết quả:** **xong** — đẩy hỏng rồi tự gỡ lại được

## 1. Ấn tượng 5 giây

> **Trang gì?** — "Chắc là trò chơi đẩy thùng vào ô, kiểu Sokoban ngày xưa."
>
> **Dành cho ai?** — "Chữ khá to, nút bấm cũng to, có vẻ ổn cho mắt kém như tôi, **không biết
> chơi có cần nhìn tinh không**."
>
> **Dám nhập email?** — "Không thấy chỗ nào đòi nhập gì cả, khỏi phải lo khoản đó."
>
> **Ba từ:** đơn giản · gọn gàng · chưa rõ luật

Ảnh: `p03-linh-01-vua-mo-trang.png`

**Đoán đúng:** ✅. Và câu "không biết chơi có cần nhìn tinh không" là **nỗi lo đặt ra từ giây
thứ năm** — phần sau của phiên trả lời đúng nó.

## 2. Chuyện đã xảy ra

### Thứ tự Tab — sạch

| Lần Tab | Dừng ở | Thấy tiêu điểm? |
| --- | --- | --- |
| 1 | nút đổi giao diện | ✅ có viền |
| 2 | `Màn ngẫu nhiên · Dễ` | ✅ |
| 3 | `Dễ` (đang chọn) | ✅ |
| 4–6 | `Vừa` · `Khó` · `Rất khó` | ✅ tuần tự, không nhảy cóc |
| 6 | `Màn 1` | ✅ → `Enter` vào chơi |

> "Tab luôn giữ tiêu điểm rõ ràng, không nhảy mất." — **0 lần mất dấu tiêu điểm.**

Ảnh: `p03-linh-02-tab-1.png` … `p03-linh-05-tab-man1.png`

### Trong màn chơi — chỗ hỏng

HUD đọc được: `Bước 0 · Đẩy 0 · 00:06`, `Tối ưu 7 đẩy`. Nhưng bàn cờ thì:

> "cái tên nó đọc ra chỉ là **'Bàn cờ 11 trên 8, 2 thùng, 0 đã vào đích'** — không nói tường
> ở đâu, thùng ở đâu, tôi (con vịt) đang đứng chỗ nào. **Tôi phải nói thẳng: cái trình đọc
> màn hình không cho tôi đủ thông tin để biết bàn cờ trông ra sao, chỉ có tổng số** — nếu tôi
> thật sự dùng trình đọc màn hình mà không nhìn được hình, tôi sẽ đi mò hoàn toàn mù, không
> biết hướng nào có tường hướng nào trống."

Và chị đã phải chơi đúng như vậy: **dò từng hướng như người mù dò đường**, nhiều nước bị
tường chặn (`Bước` không tăng).

Ảnh: `p03-linh-06-vao-man-choi.png` · `p03-linh-07-sau-1-buoc.png`

Một quan sát tốt: nút `Hoàn tác` chuyển từ mờ sang bấm được **ngay ở bước đi đầu tiên**, nên
chị suy ra được nó theo dõi từng bước chứ không chỉ lúc đẩy.

### Đẩy hỏng và gỡ lại ✅

Tới bước 9 thì `Đẩy` lên 1 và cảnh báo hiện ngay: *"Thùng này kẹt rồi — hoàn tác?"* kèm nút
`Hoàn tác` riêng tại chỗ. Ảnh: `p03-linh-08-thung-ket.png`

**Đoán nghĩa nút trước khi bấm** (ghi trước, đúng như yêu cầu):

> "Nút 'Hoàn tác' này chắc sẽ lùi lại đúng bước vừa đẩy thùng, đưa thùng và mình về chỗ cũ —
> giống Ctrl+Z tôi hay dùng khi sửa bản thảo."

Bấm: `Bước 8 · Đẩy 0`, cảnh báo biến mất, nút `Làm lại` bật sáng.

> "đúng như tôi đoán… Nút đoán-đúng, làm đúng như tên gọi."

Ảnh: `p03-linh-09-da-hoan-tac.png`

## 3. Con số

| | |
| --- | --- |
| Thao tác thật lên trang | ~20 (Tab/Enter/mũi tên) |
| Mất dấu tiêu điểm | **0** |
| Nút chết | 0 (mũi tên bị tường chặn không tính) |
| Kết quả | **xong**, không bỏ cuộc |

`min_steps` của RR-02 là 2; chị dùng **1** thao tác điều hướng để gỡ (một lần `Hoàn tác`).

## 4. Ba từ sau khi dùng

**yên tâm · rõ ràng · vẫn mù mờ** (về hình bàn cờ)

> "Tôi có quay lại không? Có, vì cách chơi bằng phím rất dễ chịu và nút Hoàn tác đáng tin
> cậy; **nhưng tôi sẽ luôn cần nhìn bằng mắt, không thể chỉ nghe.**"

Đổi hướng: **tốt lên ở phần điều khiển, xấu đi ở phần tiếp cận** — một nỗi lo mới sinh ra
đúng chỗ ấn tượng đầu đã ngờ tới.

## 5. Đính kèm thô

Ảnh (9): `p03-linh-01-vua-mo-trang.png` → `p03-linh-09-da-hoan-tac.png`

Console: `favicon.ico` **404** (lặp lại với `p02-hung`), cộng **8 cảnh báo** dạng:

```
The resource .../_next/static/media/<hash>.woff2 was preloaded using link preload
but not used within a few seconds from the window's load event.
```

---

## ⚠️ Một suy đoán của persona đã bị bác bỏ — không được đưa lên báo cáo

Chị viết:

> "(dòng cảnh báo nằm trong một `paragraph` thường, **không phải vùng báo động/live-region**,
> nên nếu là trình đọc màn hình thật, có thể nó im lặng luôn)"

**Sai.** `src/views/Play/index.tsx:131` có đúng một vùng như vậy:

```tsx
<p aria-live="polite" className="sr-only">
  {session.solved ? `Xong màn với ...` : showDeadlock ? "Cảnh báo: có thùng bị kẹt, nên hoàn tác." : ""}
</p>
```

Snapshot accessibility của playwright **không phơi ra thuộc tính `aria-live`**, nên chị
không có cách nào biết. NFR-A11Y-04 **đạt**. Ghi lại ở đây để lần chạy sau không ai dựng lại
phát hiện giả này từ cùng một hiểu nhầm.

Ngược lại, phần chị nói về **bàn cờ** thì đúng và đã được kiểm chứng độc lập
(`kiem-chung/ket-qua.md`): `aria-label` chỉ có tổng số, không có vị trí.
