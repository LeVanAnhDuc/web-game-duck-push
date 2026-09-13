# Yêu cầu phi chức năng

> **Trả lời:** Ngưỡng nào áp cho **mọi** feature, để không phải nhắc lại từng lần?
> **Trạng thái:** 🟢 đủ — đã rà theo dự án 2026-09-04
> **Cập nhật:** 2026-09-04 · commit feat/v1-core
> **Cập nhật khi:** thêm loại tài nguyên mới · thêm nhóm người dùng · sau sự cố sinh ra ngưỡng mới

Bản mặc định lúc scaffold viết cho một app có server và datastore. Dự án này **không có
server, không có datastore, không có tài khoản** (xem Non-Goals). Các ngưỡng không áp dụng
được đánh `(bỏ)` và **giữ nguyên số** — ID không bao giờ tái dùng.

## Performance

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-PERF-01 | ~~Phân trang endpoint danh sách~~ | **(bỏ)** — không có endpoint |
| NFR-PERF-02 | ~~p95 endpoint đọc/ghi~~ | **(bỏ)** — không có endpoint |
| NFR-PERF-03 | ~~Không truy vấn N+1~~ | **(bỏ)** — không có truy vấn |
| NFR-PERF-04 | ~~Index cho cột filter/sort~~ | **(bỏ)** — không có bảng |
| NFR-PERF-05 | Một nước đi phải hiện trên màn hình trong **≤ 16ms** kể từ lúc nhận phím | đo bằng Performance API trên màn lớn nhất |
| NFR-PERF-06 | Sinh một màn ngẫu nhiên: **p95 ≤ 1.5 giây**, trần cứng 2.5 giây rồi hạ chuẩn | đo trong Worker, ghi lại `attempts` và thời gian |
| NFR-PERF-07 | Solver **luôn** chạy trong ngân sách `maxNodes` + `maxMillis`. Không có đường nào gọi solver không ngân sách | review code + test có ngân sách nhỏ |
| NFR-PERF-08 | Sinh màn **không bao giờ chạy trên luồng chính** — luôn trong Web Worker | review code + e2e kiểm trang vẫn phản hồi khi đang sinh |
| NFR-PERF-09 | JS tải lần đầu ≤ **200KB** sau gzip. Pack màn tải theo bậc, không tải cả bốn | `pnpm build` in ra kích thước route |

## Security

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-SEC-01 | ~~Kiểm quyền mutation ở server~~ | **(bỏ)** — không có server. Không có gì để phân quyền: mọi dữ liệu là của chính máy đó |
| NFR-SEC-02 | ~~Không log PII~~ | **(bỏ)** — không thu thập dữ liệu cá nhân nào |
| NFR-SEC-03 | ~~Rate limit đăng nhập~~ | **(bỏ)** — không có đăng nhập |
| NFR-SEC-04 | Secret chỉ đọc từ biến môi trường, không hardcode, không commit | grep + review |
| NFR-SEC-05 | Dependency không có lỗ hổng mức high trở lên | job `dependency-review` trong CI |
| NFR-SEC-06 | ~~Lỗi trả về không lộ stack trace~~ | **(bỏ)** — không có phản hồi từ server |
| NFR-SEC-07 | Mọi dữ liệu đọc từ `localStorage` hoặc từ URL đều được **kiểm trước khi dùng**. Dữ liệu hỏng thì bỏ qua và về mặc định, không bao giờ ném lỗi ra UI | test với dữ liệu sửa tay |

## Accessibility

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-A11Y-01 | Tương phản chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1 | bảng đo trong `MASTER.md` |
| NFR-A11Y-02 | Mọi hành động thao tác được bằng bàn phím, focus luôn thấy được | e2e đi hết một màn chỉ bằng bàn phím |
| NFR-A11Y-03 | Vùng bấm ≥ 44×44px trên thiết bị cảm ứng | review mockup + e2e đo |
| NFR-A11Y-04 | Mọi nút chỉ có icon đều có `aria-label`; thắng và cảnh báo bế tắc thông báo qua live region | review + e2e |
| NFR-A11Y-05 | Tôn trọng `prefers-reduced-motion` — chuyển động về 0ms, không phải rút ngắn | review CSS |
| NFR-A11Y-06 | **Không trạng thái nào của ô cờ chỉ phân biệt bằng màu.** Tường, sàn, đích, thùng, thùng-trên-đích, người chơi phải phân biệt được khi in đen trắng | xem ảnh chụp đã khử màu |
| NFR-A11Y-07 | Bàn cờ có bản mô tả bằng chữ cho trình đọc màn hình | review |

## i18n

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-I18N-01 | Không hardcode chuỗi hiển thị rải rác trong code — gom về một chỗ | grep |
| NFR-I18N-02 | ~~Thời gian lưu ở UTC~~ | **(bỏ)** — trong game chỉ có **khoảng thời gian** (ms), không có mốc thời gian hiển thị |
| NFR-I18N-03 | Số và thời lượng định dạng theo locale `vi`; thời lượng dạng `mm:ss` | review |

## Reliability

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-REL-01 | Mọi lệnh `fetch` (tải pack màn) có nhánh lỗi và thông báo đọc được | test với mạng hỏng |
| NFR-REL-02 | ~~Ghi quan trọng phải idempotent~~ | **(bỏ)** — không có ghi từ xa |
| NFR-REL-03 | Không có trạng thái chờ vô hạn. Sinh màn quá ngưỡng thì hạ chuẩn hoặc báo lỗi, không treo | e2e |
| NFR-REL-04 | `localStorage` hỏng, đầy hoặc bị chặn **không được làm hỏng ván đang chơi** — chỉ mất khả năng nhớ | test có stub ném lỗi |

## Data & Privacy

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-DATA-01 | Trường nào là PII được liệt kê rõ ở bảng dưới | bảng dưới |
| NFR-DATA-02 | ~~Xoá tài khoản thì xoá PII~~ | **(bỏ)** — không có tài khoản |
| NFR-DATA-03 | ~~Đường khôi phục dữ liệu~~ | **(bỏ)** — dữ liệu duy nhất là tiến độ cục bộ; mất thì chơi lại |
| NFR-DATA-04 | Dữ liệu lưu có `version`; đọc phải dữ liệu phiên bản khác thì bỏ qua, không cố đoán | test |

**Trường PII trong dự án này:**

| Trường | Nằm ở | Giữ bao lâu |
| --- | --- | --- |
| _không có_ | — | — |

Game không thu thập, không gửi đi, và không lưu bất kỳ dữ liệu cá nhân nào. Toàn bộ dữ liệu
là tiến độ chơi trong `localStorage` của chính máy người dùng.
