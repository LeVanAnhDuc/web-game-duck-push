# ADR-0005 · Lưu toàn bộ tiến độ trong `localStorage`, có `version`, hỏng thì bỏ

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** FR-09 · NFR-SEC-07 · NFR-REL-04 · NFR-DATA-04 · US-05

## 1. Bối cảnh

Không có tài khoản và không có backend (Non-Goals). Tiến độ, kỷ lục và ván đang dở vẫn phải
sống qua lần đóng tab (US-05). Dữ liệu nằm trên máy người dùng nghĩa là: người dùng sửa được
nó bằng devtools, trình duyệt có thể chặn nó, và nó sẽ tồn tại lâu hơn phiên bản code đã ghi ra nó.

## 2. Quyết định

Một khoá `sokoban:progress:v1` cho tiến độ, một khoá `sokoban:settings:v1` cho cài đặt. Mỗi bản
ghi mang trường `version`. Mọi lần đọc đều đi qua một lớp kiểm: sai phiên bản, sai hình dạng,
sai kiểu, số âm → **trả về mặc định**, không ném lỗi, không cố đoán ý. Mọi lần ghi bọc
`try/catch` và trả `boolean`; ghi hỏng không bao giờ làm hỏng ván đang chơi.

Ván đang dở lưu dưới dạng **dãy nước đi** từ trạng thái đầu, không phải ảnh chụp bàn cờ.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| IndexedDB | API bất đồng bộ cho một khối dữ liệu vài KB. Phức tạp thêm mà không giải quyết gì |
| Lưu ảnh chụp `LevelState` của ván đang dở | Ảnh chụp gắn chặt với cách biểu diễn bàn cờ; đổi cấu trúc là dữ liệu cũ thành rác. Dãy nước đi chỉ phụ thuộc vào luật chơi, mà luật thì không đổi. Phát lại còn dựng lại được cả lịch sử hoàn tác |
| Không lưu ván dở, chỉ lưu kỷ lục | Bỏ hẳn US-05, mà đó là luồng của người chơi trên điện thoại — nhóm người dùng chính |
| Đồng bộ qua tài khoản | Kéo theo backend, PII, xoá dữ liệu. Đúng cái Non-Goals loại bỏ |

## 4. Hệ quả

**Được:**
- Không có gì rời khỏi máy người dùng → không có PII, không cần chính sách riêng tư.
- Dữ liệu hỏng hoặc bị sửa tay chỉ làm mất tiến độ, không bao giờ làm trắng trang.
- Dãy nước đi vừa là dữ liệu lưu vừa là thứ tái tạo được ván để debug.

**Mất / phải chấp nhận:**
- Tiến độ **không** theo người chơi sang máy khác hay sang trình duyệt khác. Xoá dữ liệu
  duyệt web là mất hết, và không có đường khôi phục (NFR-DATA-03 đã bỏ vì lý do này).
- Ở chế độ riêng tư, game vẫn chơi được nhưng không nhớ gì — phải nói rõ trên UI thay vì im lặng.
- Phát lại dãy nước đi tốn một vòng lặp lúc mở màn; không đáng kể ở quy mô vài trăm nước.

**Điều kiện xem lại:** nếu sau này có tài khoản (tức là Non-Goal đó bị lật), toàn bộ quyết
định này phải viết lại bằng một ADR mới.
