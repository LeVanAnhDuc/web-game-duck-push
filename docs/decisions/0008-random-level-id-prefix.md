# ADR-0008 · Mã màn ngẫu nhiên mang tiền tố `r`, và seed chuyển xuống dòng phụ

> **Ngày:** 2026-09-12
> **Trạng thái:** accepted
> **Liên quan:** FR-08 · FR-11 · ADR-0005

## 1. Bối cảnh

Generator đặt mã màn là `` `${bậc}-${seed}` `` — ví dụ `easy-4152196902`. Tầng đặt tên
nhận dạng màn chiến dịch bằng `` /^(easy|medium|hard|expert)-(\d+)$/ ``, mà mã trên **khớp
đúng mẫu đó**. Hệ quả: mọi màn ngẫu nhiên được hiển thị là **"Màn 4.152.196.902"**, và
`levelSubtitle` còn gắn thêm chữ "Chiến dịch" cho nó.

Lượt review UX 2026-09 (F-06) bắt được cả hai mặt của con số này trong cùng một lần chạy:
một người chơi thấy nó buồn cười — *"lấy luôn cái seed làm tên màn luôn!"* — trong khi một
người khác, nhận link từ bạn, **dựa vào chính nó** để tin mình mở đúng màn: *"con số trong
tiêu đề trùng khớp với con số seed trong link nó gửi."* Trên một sản phẩm không có tài
khoản và không có gì để chia sẻ ngoài chính màn chơi, đó là cơ chế xác thực duy nhất người
dùng có.

## 2. Quyết định

Mã màn ngẫu nhiên thành `` `${bậc}-r${seed}` ``. Hàm `randomLevelId` / `randomLevelSeed`
đặt ở `src/game/core/level.ts` — core là nơi mã màn sinh ra, nên định dạng phải do core
giữ; `src/lib/levelText.ts` chỉ re-export để dựng chữ hiển thị.

Tên màn trả về **"Màn ngẫu nhiên"**, và seed **chuyển xuống dòng phụ** của thanh tiêu đề:
`Dễ · Seed 4152196902`. Tên cho người đọc, mã cho người đối chiếu — hai việc, hai dòng.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Siết regex chiến dịch thành `` \d{2} `` | Mã chiến dịch đang là hai chữ số vì pack chưa quá 99 màn. Ràng buộc đó không được viết ra ở đâu cả, nên một bậc có 100 màn sẽ làm hỏng lại đúng chỗ này — và hỏng âm thầm |
| Thêm trường `source: "campaign" \| "random"` vào `Level` | Đúng về mặt mô hình, nhưng `SavedSession` và bản ghi kỷ lục trong `localStorage` chỉ lưu `levelId`. Muốn đọc được nguồn từ một bản ghi cũ thì vẫn phải suy từ chuỗi mã — tức là vẫn cần đúng thứ đang làm ở đây, cộng thêm một trường phải di trú |
| Giữ nguyên mã, chỉ sửa chữ hiển thị | Che triệu chứng. `nextCampaignId` cũng đọc cùng regex đó; hôm nay nó vô hại vì `goNext` rẽ nhánh theo `source` trước, nhưng nó là một cái bẫy đang nằm chờ |
| Bỏ hẳn seed khỏi giao diện | Sửa chỗ một người chê và phá đúng chỗ đã khiến người kia tin. Xem §1 |

## 4. Hệ quả

**Được:**

- Màn ngẫu nhiên không còn bị đọc là màn chiến dịch ở **bất kỳ** chỗ nào dùng `levelText`
  — thanh tiêu đề, lớp phủ thắng, thẻ "Đang chơi dở".
- Seed vẫn hiện ra, nên người nhận link vẫn đối chiếu được với `?seed=` trên thanh địa chỉ.
- Định dạng mã do core giữ, nên generator và tầng hiển thị không thể lệch nhau nữa.

**Mất / phải chấp nhận:**

- **Bản ghi kỷ lục của các màn ngẫu nhiên lưu trước 2026-09-12 mồ côi** — khoá cũ
  `easy-4152196902` không còn được tra tới. Chấp nhận vì lưới chiến dịch không đọc chúng và
  ván đang dở khôi phục bằng **seed** chứ không bằng mã (`useLevelRouter.resumeSaved`);
  tiến độ chiến dịch không bị đụng. Không viết migration: theo ADR-0005, dữ liệu đọc không
  được thì bỏ, không cố đoán.
- Thêm một định dạng chuỗi phải nhớ. Đổi lại nó có test riêng (`levelText.test.ts`) và một
  test nói thẳng rằng mã ngẫu nhiên **không bao giờ** được khớp mẫu chiến dịch.

**Điều kiện xem lại quyết định này:** khi `Level` có lý do khác để mang trường `source`, hoặc
khi bản ghi trong `localStorage` cần biết nguồn màn cho một việc thứ hai — lúc đó suy từ
chuỗi mã không còn đủ và nên di trú hẳn sang một trường thật.
