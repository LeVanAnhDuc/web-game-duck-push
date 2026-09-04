# Thiết kế · v1-core — Sokoban chơi được đầu-cuối

Liên quan: FR-01 · FR-02 · FR-03 · FR-04 · FR-05 · FR-06 · FR-07 · FR-08 · FR-09 · FR-10 ·
FR-11 · FR-12 · US-01 · US-02 · US-03 · US-04 · US-05 · NFR-PERF-05…09 · NFR-A11Y-01…07 ·
ADR-0001 · ADR-0002 · ADR-0003 · ADR-0004 · ADR-0005

## Phạm vi

Một feature duy nhất vì dưới mức này không có gì chơi được: bàn cờ mà không có màn thì trống,
màn mà không có generator thì không có nguồn, generator mà không có solver thì không biết màn
có giải được không. Cắt nhỏ hơn chỉ tạo ra các nhánh không chạy được.

**Trong phạm vi:** toàn bộ FR-01 … FR-12.
**Ngoài phạm vi:** FR-13, FR-14, FR-15 (đã đánh `(bỏ)` trong `scope.md`), âm thanh, và mọi
thứ cần backend.

## Kiến trúc

Đã ghi đầy đủ ở `docs/03-design/architecture.md`; không chép lại ở đây. Điểm cốt lõi: một lõi
`core/` thuần TypeScript chạy được ở ba nơi (Node lúc build, Web Worker lúc chơi, Vitest lúc
test), và luồng phụ thuộc chỉ đi một chiều `views → hooks → session/storage → core`.

## Các quyết định đã chốt, kèm nơi ghi

| Quyết định | Ghi ở |
| --- | --- |
| Bỏ hướng Pixel Art của bước 1, dùng bảng màu thùng gỗ + Space Grotesk / IBM Plex Mono | ADR-0001 |
| Xuất HTML tĩnh; vẽ bàn cờ bằng DOM chứ không canvas | ADR-0002 |
| Sinh màn lai: phòng mẫu + đi lùi + solver có ngân sách | ADR-0003 |
| Solver A\* trên không gian đẩy, chuẩn hoá theo vùng người chơi | ADR-0004 |
| Lưu tất cả trong `localStorage`, có `version`, hỏng thì bỏ | ADR-0005 |

## Bố cục UI

Bố cục đã được duyệt ở dạng wireframe ASCII trong phiên brainstorm; token lấy từ
`docs/design-system/sokoban/MASTER.md`. Hai màn hình:

- **Trang chủ**: thẻ "đang chơi dở" → nút màn ngẫu nhiên → tab bậc khó → lưới chọn màn (không
  khoá màn nào).
- **Bàn chơi**: thanh quay lại → dải HUD → bàn cờ (phần tử lớn nhất, không bao giờ cuộn) →
  dải cảnh báo bế tắc (có điều kiện) → điều khiển. D-pad chỉ hiện trên con trỏ thô; máy tính
  thấy dòng nhắc phím thay vào đó.

Ba lựa chọn có chủ ý: không khoá màn; `Tối ưu N đẩy` hiện thẳng trên HUD chứ không giấu; cảnh
báo bế tắc là dải tĩnh chứ không phải hộp thoại — hộp thoại chắn đúng cái nút hoàn tác mà
người chơi đang với tới.

**Không có mockup canvas trong feature này.** `feature-flow` bước 1.2 yêu cầu artboard 375 /
768 / 1440, nhưng người dùng đã yêu cầu chạy thẳng không hỏi lại, mà cổng duyệt mockup theo
định nghĩa là một cổng cần người duyệt. Wireframe ASCII đã được duyệt đóng vai trò đó. Ghi
lại ở đây vì nó là một sai khác so với quy trình, không phải một chi tiết bị bỏ quên.

## Xử lý lỗi — các nhánh phải có, không phải nhánh đẹp

| Chuyện gì | Xử lý |
| --- | --- |
| `localStorage` bị chặn hoặc đầy | Game chạy bình thường, chỉ không nhớ. Ghi trả `false`, không ném (NFR-REL-04) |
| Dữ liệu lưu hỏng hoặc bị sửa tay | Bỏ qua, về mặc định. Không đoán, không sửa chữa (NFR-SEC-07) |
| Sinh màn quá lâu | Generator hạ chuẩn; client có trần cứng 6 giây rồi báo lỗi đọc được (NFR-REL-03) |
| Không có Web Worker | Lui về sinh trên luồng chính — chậm và giật, nhưng vẫn ra màn |
| Seed trong URL bậy | Thông báo đọc được, quay về trang chủ. Không trắng trang |
| Pack màn tải hỏng | Lưới chọn màn hiện lỗi và nút thử lại; nút màn ngẫu nhiên vẫn dùng được |
| Solver hết ngân sách | `timeout`, generator vứt ứng viên. **Không** kết luận màn vô nghiệm (bất biến #15) |

## Cách kiểm chứng

- **Unit (Vitest)**: luật đẩy, dò bế tắc, solver (kể cả trường hợp `unsolvable` và `timeout`),
  generator (cùng seed ra cùng màn; `optimalPushes` khớp khi chạy lại solver), session
  (undo/redo/trail), storage (dữ liệu hỏng, ghi hỏng, kỷ lục chỉ ghi đè khi tốt hơn).
- **Pack**: test chạy lại solver trên toàn bộ pack đã commit và đối chiếu `optimalPushes` —
  đây là cách bất biến #17 được giữ, thay vì tin vào lần sinh trước.
- **E2E (Playwright)**: giải xong một màn chỉ bằng bàn phím; hoàn tác lùi đúng bộ đếm; kỷ lục
  còn sau khi tải lại trang; sinh màn ngẫu nhiên không chặn luồng chính; bàn cờ không cuộn ở
  375px.
- **Nhìn tận mắt**: chụp màn hình ở 375 / 768 / 1024 / 1440, cả sáng lẫn tối.
