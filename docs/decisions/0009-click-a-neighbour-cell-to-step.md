# ADR-0009 · Bấm vào ô kề nhân vật để đi một bước, thay vì vẽ D-pad cho mọi thiết bị

> **Ngày:** 2026-09-12
> **Trạng thái:** accepted
> **Liên quan:** FR-10 · FR-16 · NFR-A11Y-02 · NFR-A11Y-03

## 1. Bối cảnh

D-pad chỉ được vẽ khi `(pointer: coarse)`. Trên mọi thiết bị có con trỏ chuột — laptop,
desktop, và cả người thu nhỏ cửa sổ xuống bề rộng điện thoại — màn hình **không có một nút
điều khiển nào**, và toàn bộ khả năng di chuyển nằm sau một dòng chữ mờ ở đáy trang mở đầu
bằng `mũi tên/WASD`.

Lượt review UX 2026-09 (F-01, mức High) cho thấy hậu quả: một người chơi không rành máy
tính nhìn bàn cờ, **tự suy ra đúng luật chơi** — *"chắc đẩy cái hộp cam vô vòng tròn xanh"*
— rồi bấm vào bàn cờ ba lần và không nhận được phản hồi nào. Bàn cờ là bức ảnh câm. Cô bỏ
cuộc trước nước đi đầu tiên, với ba từ *"bí · chán · thua"*.

Đây là Red Route số 1 của sản phẩm, và `overview.md` §6 định nghĩa thành công là *"giải xong
màn đầu tiên mà không cần đọc hướng dẫn"*.

## 2. Quyết định

Bấm (hoặc chạm) vào một ô **kề trực giao** với nhân vật = đi **một bước** về hướng đó. Ánh
xạ 1-1 với một lần bấm phím mũi tên.

Hai hàm thuần trong `src/lib/boardGeometry.ts` làm toàn bộ việc đó: `cellFromPoint` đổi điểm
bấm thành ô (trả `null` khi bấm hụt ra ngoài bàn — **không** kẹp về ô gần nhất), và
`stepDirection` trả hướng **chỉ khi** hai ô kề nhau, có chặn trường hợp hai ô lệch nhau đúng
1 chỉ số nhưng nằm hai đầu bàn cờ.

D-pad giữ nguyên điều kiện `(pointer: coarse)`. Dòng nhắc phím viết lại: vẽ `← ↑ → ↓` thay
vì gọi tên chúng, và bỏ `WASD` khỏi đầu dòng (phím vẫn chạy, chỉ không quảng cáo).

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Vẽ D-pad cho cả thiết bị có chuột | Ba persona khác chơi bằng phím rất trôi, không ai trong số họ cần nó. D-pad lấy mất diện tích của bàn cờ, mà `MASTER.md` đặt bàn cờ là phần tử lớn nhất ở mọi bề rộng — trả một phát hiện bằng cách làm hỏng thứ đang đúng |
| Bấm ô bất kỳ rồi tự tìm đường tới đó | Đẻ ra luật chơi thứ hai bên cạnh luật đi từng bước, và có thể tự đẩy một thùng người chơi không định đẩy. Trong Sokoban một nước thừa hỏng cả màn |
| Kéo–thả nhân vật | Người dùng đã thử đúng động tác này và nó không chạy, nên nó có vẻ "tự nhiên". Nhưng kéo–thả không dùng được bằng bàn phím, khó với người run tay, và mơ hồ khi kéo qua nhiều ô |
| Chỉ sửa dòng chữ nhắc phím | Rẻ nhất, và cũng là phương án bỏ qua chính điều đã xảy ra: người dùng **bấm vào bàn cờ**. Chỗ cần trả lời là chỗ người ta đang nhìn |
| Đổi ngưỡng `(pointer: coarse)` sang điều kiện khác | Không cứu được người dùng chuột — họ vẫn không có nút nào. Đó là một quyết định riêng, ghi vào `backlog.md` §Việc tiếp theo |

## 4. Hệ quả

**Được:**

- Ở `pointer: fine`, bàn cờ trả lời thao tác đầu tiên mà người dùng thật sự thực hiện.
- Thao tác này **cũng** chạy trên cảm ứng, nên người dùng điện thoại có hai lối vào chứ
  không phải một.
- Không đổi bố cục: không thêm phần tử nào, không lấy chỗ của bàn cờ.

**Mất / phải chấp nhận:**

- Bàn cờ là `role="img"` mà nay nhận `onPointerDown` — một phần tử không-tương-tác lại có
  hành vi. Chấp nhận vì đây **thuần tuý là lối tắt cho con trỏ**: mọi việc nó làm đều đã
  làm được bằng bàn phím, nên không có đường nào chỉ đi được bằng chuột (NFR-A11Y-02 giữ
  nguyên). Biến bàn cờ thành lưới nút bấm sẽ tạo ra tới 144 điểm dừng `Tab` — tệ hơn hẳn.
- Bấm nhầm vào ô kề là một nước đi thật, tốn một lần `Hoàn tác`. Đây là giá của việc ánh xạ
  1-1 với phím mũi tên, và `Hoàn tác` vốn đã ở ngay dưới bàn cờ.
- Một cú bấm sai chỗ (ô chéo, ô xa, ngoài bàn) **không làm gì cả** và cũng không giải thích
  gì. Chấp nhận cho lần này; nếu review sau bắt được người dùng vấp đúng chỗ đó thì đã có
  chỗ để gắn phản hồi.

**Điều kiện xem lại quyết định này:** khi có dữ liệu thật từ thiết bị cảm ứng (xem
`backlog.md` §Việc tiếp theo) — có thể hoá ra chạm-để-đi đủ tốt tới mức D-pad không còn cần
thiết, và lúc đó cả cái ngưỡng `(pointer: coarse)` mới là thứ đáng bỏ.
