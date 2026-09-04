# ADR-0003 · Sinh màn kiểu lai: ghép phòng mẫu, đặt thùng bằng đi lùi, chấm bằng solver có ngân sách

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** FR-06 · FR-08 · NFR-PERF-06 · NFR-PERF-07

## 1. Bối cảnh

Sản phẩm cần **hai** nguồn màn: pack chiến dịch phân bậc, sinh sẵn lúc build; và nút "màn ngẫu
nhiên" sinh ngay trong trình duyệt. Cả hai phải bảo đảm màn **giải được**, và cả hai cần
**số bước đẩy tối ưu** — vì đó là con số HUD so sánh và là cơ sở của kỷ lục lẫn dấu sao.

Sinh màn Sokoban là bài toán khó: phần lớn bàn cờ dựng ngẫu nhiên đều vô nghiệm hoặc nhạt.

## 2. Quyết định

Bốn bước, dùng chung một lõi cho cả hai nơi chạy, khác nhau ở cấu hình ngân sách:

1. Dựng bản đồ bằng cách ghép các phòng mẫu 3×3, kiểm liên thông, tỉa hành lang cụt.
2. Khởi tạo ở **trạng thái thắng** (mọi thùng nằm trên đích) rồi *kéo* lùi ngẫu nhiên, có
   trọng số ưu tiên đổi thùng liên tục thay vì kéo một thùng đi thật xa.
3. Chạy `solve` với ngân sách cứng để lấy `optimalPushes` và số nút đã mở.
4. Vứt ứng viên nếu timeout, số đẩy dưới ngưỡng bậc, hoặc quá dễ; sinh lại. Quá `maxAttempts`
   thì hạ chuẩn chứ không treo.

| | Chiến dịch (Node, lúc build) | Ngẫu nhiên (Worker, lúc chơi) |
| --- | --- | --- |
| Ngân sách solver | rộng | chặt (~300ms) |
| Kích thước bàn | tới 12×12 | ≤ 8×8 |
| Vứt ứng viên | thoải mái | vài lần rồi hạ chuẩn |

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Chỉ ghép phòng mẫu + lọc bằng solver (kiểu Taylor & Parberry) | Chất lượng cao nhất nhưng mỗi màn tốn hàng giây tới hàng chục giây — không chạy nổi trong trình duyệt, mà nút "màn ngẫu nhiên" là một chức năng đã chốt (FR-08) |
| Chỉ đi lùi từ trạng thái thắng | Nhanh và **bảo đảm giải được mà không cần solver**, nhưng không cho biết số đẩy tối ưu. Bỏ solver là bỏ luôn kỷ lục so với tối ưu và dấu sao (FR-03, FR-07) — hai chức năng đã chốt sẽ thành rỗng ruột. Màn ra cũng nhạt: thùng rải rác, không có bẫy nào đáng nhớ |
| Nhập bộ màn kinh điển có sẵn (Microban…) | Bản quyền các bộ màn cũ không rõ ràng, và mỗi màn nhập vào là một màn không có số tối ưu do ta tự tính — xem Non-Goals |
| Sinh sẵn cả bốn bậc rồi bỏ hẳn sinh runtime | Nguồn màn lại hữu hạn, đúng cái vấn đề sản phẩm này muốn giải |

## 4. Hệ quả

**Được:**
- Mọi màn, ở cả hai nguồn, đều giải được **và** biết trước lời giải tối ưu.
- Một lõi generator duy nhất; khác biệt giữa build-time và runtime chỉ là tham số.
- Pack chiến dịch tái tạo được từ seed gốc → kiểm chứng được bằng test, không phải bằng niềm tin.

**Mất / phải chấp nhận:**
- Màn runtime nhỏ hơn và dễ hơn màn chiến dịch cùng bậc — ngân sách chặt buộc phải vậy.
- Sinh màn có thể mất tới ~1.5 giây, nên bắt buộc phải có Worker và trạng thái chờ thật
  (NFR-PERF-06, NFR-PERF-08, NFR-REL-03).
- Một tỉ lệ ứng viên bị vứt đi — CPU tốn mà không ra sản phẩm. Chấp nhận được vì phần lớn xảy
  ra lúc build.

**Điều kiện xem lại:** nếu solver nhanh lên đủ để chạy cấu hình build-time ngay trong trình
duyệt, hoặc nếu đo đạc cho thấy màn runtime nhạt tới mức người chơi không bấm nút đó nữa.
