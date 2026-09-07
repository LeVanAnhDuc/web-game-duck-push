# Bất biến chịu lực

> **Trả lời:** Sửa gì thì hệ thống sai **âm thầm** — test vẫn xanh mà kết quả vẫn sai?
> **Trạng thái:** 🟢 đủ — đã rà theo dự án 2026-09-04
> **Cập nhật:** 2026-09-04 · commit feat/v1-core
> **Cập nhật khi:** phát hiện một bất biến mới — thường là ngay sau khi ai đó vừa phá nó

Bản mặc định lúc scaffold viết cho app có server và migration. Cái nào không áp dụng thì
đánh `(bỏ)` và **giữ nguyên số**.

| # | Bất biến | Vi phạm thì sao |
| --- | --- | --- |
| 1 | ~~Thời gian lưu ở UTC~~ | **(bỏ)** — chỉ có khoảng thời gian, không có mốc |
| 2 | ~~Kiểm quyền mutation ở server~~ | **(bỏ)** — không có server |
| 3 | ~~Chỉ tầng service truy vấn datastore~~ | **(bỏ)** — không có datastore |
| 4 | ~~Tiền và số chính xác không dùng float~~ | **(bỏ)** — mọi số trong game là số nguyên đếm được |
| 5 | ~~Soft-delete bản ghi đang tham chiếu~~ | **(bỏ)** |
| 6 | ~~Ghi quan trọng phải idempotent~~ | **(bỏ)** |
| 7 | ~~Migration chỉ tiến~~ | **(bỏ)** — thay bằng #17 |
| 8 | ~~Thứ tự middleware auth → validate → handler~~ | **(bỏ)** |
| 9 | ~~Không tin `id` từ client~~ | **(bỏ)** — mọi thứ đều là client |
| 10 | **`src/game/core/` không import React, không đụng DOM, không đọc `window`** | Cùng dòng code phải chạy ở ba nơi: script Node lúc build, Web Worker, và Vitest. Lỡ import một thứ có `window` thì script sinh pack chết ở bước build — nhưng chỉ chết trên CI, không chết ở máy đang chạy `yarn dev` |
| 11 | **`LevelState` bất biến.** `step()` trả trạng thái mới, không sửa tại chỗ | Lịch sử hoàn tác trỏ vào các trạng thái cũ. Sửa tại chỗ thì undo "thành công" nhưng trả về đúng cái trạng thái hiện tại — nhìn như treo, test đơn lẻ vẫn xanh |
| 12 | **`LevelState.boxes` luôn sắp tăng dần** | Solver chuẩn hoá trạng thái bằng cách nối vị trí các thùng. Mất tính sắp thì hai trạng thái giống hệt nhau băm ra hai khoá — solver vẫn ra lời giải đúng, chỉ chậm gấp nhiều lần và thỉnh thoảng timeout không rõ lý do |
| 13 | **Undo là lùi lịch sử, không phải đi ngược** | Trong Sokoban, kéo không phải nghịch đảo của đẩy. Cài undo bằng cách "đi ngược lại" chạy đúng ở mọi nước không đẩy rồi sai ngay nước đẩy đầu tiên — và sai theo kiểu bàn cờ vẫn hợp lệ nên không ai nhận ra ngay |
| 14 | **Mọi thứ ngẫu nhiên đi qua RNG có seed. `Math.random()` bị cấm trong `core/`** | Một màn lỗi không tái tạo được là một lỗi không sửa được. Cũng phá luôn tính năng chia sẻ màn bằng seed |
| 15 | **Solver luôn có ngân sách, và `timeout` ≠ `unsolvable`** | Lẫn hai cái này thì generator vứt nhầm các màn khó (kết luận "vô nghiệm" chỉ vì hết giờ), và bậc Rất khó sẽ rỗng mà không ai biết tại sao |
| 16 | **Dò bế tắc phải *sound*: thà bỏ sót còn hơn báo nhầm** | Một cảnh báo sai bảo người chơi vứt ván họ vẫn thắng được. Bỏ sót chỉ là không giúp được; báo nhầm là phá ván |
| 17 | **Pack màn trong `src/game/levels/data/` là dữ liệu đã kiểm.** Đọc vào phải validate schema, và số bước tối ưu phải khớp khi chạy lại solver | Một pack sinh bằng code cũ vẫn parse được, chỉ là số "tối ưu" sai — HUD hiện một cái đích không đạt được, và dấu sao không bao giờ sáng |
| 18 | **Trạng thái ô không bao giờ chỉ mã hoá bằng màu** | Người chơi mù màu mất luôn khả năng phân biệt thùng đã vào đích. Không có test tự động nào bắt được, và không ai trong nhóm nhận ra |
