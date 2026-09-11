# `p01-blind` · p05 Cô Nga · phiên mù A

- **Red Route:** không có — phiên mù, không được giao mục tiêu
- **URL:** https://levananhduc.github.io/web-game-duck-push/
- **Môi trường thật:** Chrome cá nhân qua `claude-in-chrome`, cửa sổ thu nhỏ. **Không throttle
  được mạng, không giả lập được cảm ứng** — xem §Cảnh báo cuối file.
- **Kết quả:** bỏ cuộc

## 1. Ấn tượng 5 giây

> **Đây là trang gì?** — "Chắc là trò chơi gì đó, thấy chữ SOKOBAN lạ hoắc, với mấy cái nút
> số 1 tới 20, với chữ Dễ Vừa Khó Rất khó — chắc trò xếp hình hay đố vui gì đây."
>
> **Dành cho ai?** — "Chắc dành cho tụi nhỏ, tụi trẻ chơi game, chứ người lớn tuổi như tôi
> chắc không biết chơi đâu."
>
> **Có dám nhập email/số điện thoại không?** — "Chưa thấy chỗ nào kêu nhập số điện thoại hay
> email gì hết, nên mẹ cũng chưa biết, mà nếu có chắc mẹ cũng ngại, sợ lừa đảo."
>
> **Ba từ:** lạ · tò mò · hơi ngại

Ảnh: `p01-blind-01-vua-mo-trang.jpg`

**Đoán đúng đây là trang gì:** ✅ có — "trò chơi", "xếp hình hay đố vui". Không đọc ra được
điểm khác biệt (màn do máy sinh, số bước tối ưu), nhưng thể loại thì đoán trúng.

**Tự loại mình ra khỏi nhóm người dùng:** "chắc dành cho tụi nhỏ… người lớn tuổi như tôi
chắc không biết chơi đâu" — nói ra **trước khi** thử, tức là từ ấn tượng nhìn.

## 2. Chuyện đã xảy ra

1. Thấy chữ `SOKOBAN` to, thanh cam `Màn ngẫu nhiên · Dễ`, chữ `CHIẾN DỊCH`, bốn nút
   `Dễ/Vừa/Khó/Rất khó`, các ô số 1→20. Tưởng giống "mấy cái web đố vui trên Zalo".
2. **Bấm vào `Màn ngẫu nhiên · Dễ` vì đó là chữ to rõ nhất** — không phải vì hiểu nó làm gì.
   Vào màn chơi. Ảnh: `p01-blind-02-vao-man-choi.jpg`
3. Nhìn bàn cờ và tự suy ra luật đúng: *"chắc đẩy cái hộp cam vô vòng tròn xanh"*.
4. Bấm vào ô trống phía trên hình người → không có gì xảy ra, chỉ có đồng hồ chạy.
5. Bấm thẳng vào hình người → không nhúc nhích. Ảnh:
   `p01-blind-03-bam-hinh-nguoi-khong-nhuc-nhich.jpg`
6. Kéo hình người sang phải kiểu vuốt màn hình → vẫn `Bước 0 · Đẩy 0`.
7. Thấy dòng chữ nhỏ dưới cùng `mũi tên/WASD để đi · Z hoàn tác · R chơi lại`.
   **Không hiểu `WASD` là gì.** Nghĩ trong đầu:
   > "Ủa mũi tên đâu, có thấy hình mũi tên nào trên màn hình này đâu?"
8. Ba lần thao tác liên tiếp không phản hồi → chạm `patience_threshold` = 3 → **bỏ cuộc**.
   Ảnh: `p01-blind-04-bo-cuoc.jpg`

## 3. Con số

| | |
| --- | --- |
| Hành động | ~4 (1 lần vào màn + 3 lần thử di chuyển) |
| Thời gian | đồng hồ trong game chạy 00:03 → 01:24 |
| Quay lui | 0 |
| Bấm không có phản hồi | **3 lần liên tiếp** |
| Kết quả | **bỏ cuộc** tại bước thử di chuyển nhân vật |

## 4. Ba từ sau khi dùng

**bí · chán · thua**

> "Mẹ chắc không tự mở lại trang này nữa đâu, vì không biết cách điều khiển nhân vật, phải
> hỏi con chỉ mới chơi được."

Đổi hướng: **xấu đi**. `lạ · tò mò · hơi ngại` → `bí · chán · thua`. Từ "tò mò" (đang có ý
định thử) thành "chán" (đã thôi).

## 5. Đính kèm thô

Ảnh (4): `p01-blind-01-vua-mo-trang.jpg` · `p01-blind-02-vao-man-choi.jpg` ·
`p01-blind-03-bam-hinh-nguoi-khong-nhuc-nhich.jpg` · `p01-blind-04-bo-cuoc.jpg`

Console: bốn dòng lỗi, **tất cả từ `chrome-extension://hfgkoaengklibhfagaababcngpehggmm`**
(`content.js` — `TypeError: Cannot read properties of null (reading 'data')`). Đây là tiện
ích mở rộng của Chrome cá nhân, **không phải của Duck Push**. Không được tính là lỗi sản phẩm.

Network: "No network requests found for this tab" — công cụ chỉ bắt đầu theo dõi sau khi
trang đã tải xong.

---

## ⚠️ Cảnh báo về chính phiên này — đọc trước khi quy kết

Phiên chạy trên **Chrome cá nhân với chuột**, không phải điện thoại thật:

1. **Không giả lập được cảm ứng.** D-pad trên màn hình chỉ vẽ khi `(pointer: coarse)`
   (`src/hooks/useMediaQuery.ts` → `useCoarsePointer`, dùng ở
   `src/views/Play/components/Controls/index.tsx`). Con trỏ ở đây là chuột → **D-pad không
   được vẽ ra**. Trên điện thoại thật cô Nga sẽ thấy D-pad.
2. **Không throttle được mạng.** Persona khai 3G, thực tế chạy mạng thường.
3. **Chrome cá nhân, không phải context sạch** — có tiện ích mở rộng đang chạy (xem log).

**Vì vậy:** "bỏ cuộc vì không di chuyển được" **không** được đọc thẳng thành lỗi của bản
điện thoại. Cái phiên này thật sự đã test là **cửa sổ hẹp + con trỏ chuột**, và ở cấu hình
đó thì kết quả là thật: không có một nút điều khiển nào trên màn hình, chỉ có một dòng chữ
mờ ở đáy trang, và dòng đó chứa `WASD` — từ mà persona đọc không hiểu.

Phần cảm ứng phải được kiểm riêng bằng giả lập thiết bị, không kết luận từ phiên này.
