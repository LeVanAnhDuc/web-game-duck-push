# `p04-quan` · p07 Anh Quân · RR-06 (+ RR-06b link hỏng)

- **URL vào:** `https://levananhduc.github.io/web-game-duck-push/?seed=4152196902&d=easy`
  — seed **thật**, lấy từ log `p02-hung` Việc 2, không bịa
- **Môi trường:** playwright MCP, 1366×768, `localStorage` sạch, chưa từng vào trang
- **Kết quả:** **xong** cả hai lượt

## 1. Ấn tượng 5 giây

> **Trang gì?** — "À, là cái game đẩy thùng kiểu Sokoban, có bàn cờ 8x8, 2 thùng cần đẩy vào
> chỗ. **Đây đúng cái đố nó nói rồi, không phải link linh tinh.**"
>
> **Dành cho ai?** — "Không hẳn dành cho tôi, tôi có chơi game bao giờ đâu, nhưng bạn gửi thì
> tôi mở xem thử cái màn nó bí thôi."
>
> **Dám nhập email?** — "Không cần nhập gì cả nên khỏi phải nghĩ chuyện đó, may quá."
>
> **Ba từ:** tò mò · ổn · nhẹ nhõm — "vì không phải trang lừa đảo, không đòi đăng nhập"

Ảnh: `p04-quan-01-vua-mo-link.png`

**Đoán đúng:** ✅ — và đáng chú ý, anh xác nhận **đúng màn** ngay trong 5 giây đầu.

## 2. Chuyện đã xảy ra

### RR-06 · mở link bạn gửi ✅

Thấy ngay: tiêu đề `Màn 4152196902`, `Dễ`, bàn cờ 8×8 hai thùng, `Bước 0 · Đẩy 0`,
`Tối ưu 9 đẩy · KL bạn chưa có`.

Thời gian tới lúc thấy cái đố: **gần như tức thì** — "trang load ra là thấy bàn cờ luôn,
không phải chờ, không có màn chờ hay bước trung gian nào."

**Anh tin đây đúng là màn bạn mình nói — và đây là chỗ đáng chú ý nhất của cả phiên:**

> "vì con số trong tiêu đề (**'Màn 4152196902'**) **trùng khớp với con số `seed` trong link**
> nó gửi — không phải trùng hợp ngẫu nhiên, chắc là bạn tôi copy nguyên cái link đang chơi
> dở gửi cho tôi."

Nhưng khi được hỏi có chỗ nào nói đây là màn **của riêng ai gửi** không:

> "**Không có.** Không thấy dòng nào kiểu 'bạn A gửi cho bạn' hay tên người tạo. Chỉ có con
> số seed và độ khó thôi, còn lại tôi tự suy luận."

`min_steps` của RR-06 là **0** thao tác điều hướng. Anh dùng đúng 0 — mở link là xong.

### RR-06b · link bị dán thiếu (`?seed=abc&d=easy`) ✅

Nguyên văn trang hiện ra:

> **"Seed trong đường dẫn không đọc được nên mình mở trang chủ."**

rồi về trang chủ đầy đủ (nút `Màn ngẫu nhiên · Dễ`, mục `Chiến dịch`, 20 ô màn).

Ảnh: `p04-quan-02-seed-hong.png`

- **Hiểu chuyện gì xảy ra?** — "**Có, hiểu ngay.** Câu đó nói thẳng ra là link bị lỗi phần
  seed, không lằng nhằng."
- **Có biết phải làm gì tiếp?** — "**Có phần** — nó tự đưa tôi về trang chủ… tức là ý nó là
  'thôi chơi màn khác đi', chứ không bảo tôi 'xin lại link từ bạn'. Nhưng với tôi vậy là đủ."
- **Lỗi ở đâu?** — "**Ở bạn mình** — chắc nó copy link bị thiếu mất phần số… Không nghĩ trang
  web lỗi, vì trang xử lý tình huống này rất gọn, **có vẻ nó lường trước chuyện này rồi**."

**NFR-SEC-07 đạt, và đạt tốt.** Không trắng trang, không lỗi kỹ thuật, câu chữ người thường
đọc hiểu, và người dùng quy trách nhiệm đúng chỗ.

## 3. Con số

| | |
| --- | --- |
| Hành động | ~11 |
| Quay lui | 0 |
| Bấm không phản hồi | 0 |
| RR-06 | **xong** |
| RR-06b | **xong** |

## 4. Ba từ sau khi dùng

**yên tâm · rõ ràng · xong việc**

> "nếu bạn gửi đúng link đầy đủ lần nữa… thì tôi mở xem thử, vì lần này thấy trang không có
> gì đáng ngại."

Đổi hướng: **tốt lên** — `tò mò · ổn · nhẹ nhõm` → "ban đầu chỉ là *tạm ổn, chưa biết*, giờ
thành *ổn thật, hiểu rõ chuyện gì đang diễn ra*."

## 5. Đính kèm thô

Ảnh (2): `p04-quan-01-vua-mo-link.png` · `p04-quan-02-seed-hong.png`

Console: `favicon.ico` **404** (lần thứ ba, ba persona khác nhau) + **8 cảnh báo** woff2
preload không dùng tới, **lặp lại ở mỗi lần điều hướng trang**.

---

## 📌 Sắc thái phải mang sang báo cáo

Phiên `p02-hung` coi `Màn 4152196902` là chỗ buồn cười ("lấy luôn cái seed làm tên màn
luôn!"). Phiên này cho thấy **cùng cái nhãn đó đang gánh một việc có thật**: nó là thứ duy
nhất để người nhận link đối chiếu với URL và tin rằng mình đang mở đúng màn bạn gửi.

Nên hướng xử lý **không phải** là xoá con số đi để trả về "Màn ngẫu nhiên". Làm vậy là sửa
một chỗ sai và phá một chỗ đang chạy được — anh Quân sẽ mất đúng thứ đã khiến anh tin.
