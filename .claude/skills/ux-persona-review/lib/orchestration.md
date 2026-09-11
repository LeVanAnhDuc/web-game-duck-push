# Điều phối một lần chạy

## Trước khi chạy

1. Đọc `references/red-routes.md`, lọc lấy các dòng `status: live`. Bỏ hết `planned`.
2. Kiểm tra app có đang chạy ở port khai trong `SKILL.md` không.
   **Không tự bật app.** Chưa chạy thì dừng và in đúng lệnh dev của project.
3. Xác nhận **đúng app** đang trả lời ở port đó — đối chiếu dấu hiệu nhận biết ghi trong
   `SKILL.md`. Match CV (client `:5300`) và Shorten Link (server `:5300`) dùng chung một port;
   thiếu bước này thì cả dàn persona sẽ đi nhận xét nhầm sản phẩm.
4. Dò năng lực trình duyệt theo `lib/browser-capability.md`.
5. Tìm `.claude/uiux/` của project. Có thì truyền đường dẫn cho `ux-expert` qua
   `{{UIUX_TOKENS_PATH}}` — token thiết kế của project thắng cảm nhận thẩm mỹ chung.
   Không có thì truyền "(không có)".

## Danh sách phiên

- Mỗi Red Route `live` → một phiên **có mục tiêu**, giao cho persona hợp nhất trong dàn.
- Cộng **2 phiên mù**: một người trình độ số thấp trên điện thoại, một power user trên desktop.

Tổng phiên = (số Red Route `live`) + 2.

**Mọi phiên, kể cả phiên có mục tiêu, đều bắt đầu bằng 5 giây đứng yên** — chụp ảnh, trả lời
bốn câu ấn tượng đầu, rồi mới làm việc. Ấn tượng đầu là thứ chỉ lấy được một lần cho mỗi
persona, nên không có phiên nào được bỏ qua bước này.

## Mã phiên và chỗ để ảnh

Trước khi dispatch, đặt cho **mỗi** phiên một mã phiên duy nhất trong cả lần chạy:
`p<NN>-<RR-id>` cho phiên có mục tiêu, `p<NN>-blind` cho phiên mù. `NN` chạy từ 01 và
không lặp lại, kể cả khi một phiên phải chạy lại — lần chạy lại lấy số mới.

Tạo sẵn `runs/<timestamp>/anh-tho/`, truyền đường dẫn đó cho **mọi** phiên qua
`{{SHOTS_DIR}}`, và truyền mã phiên qua `{{SESSION_ID}}` trong `lib/persona-brief.tpl`.

Persona chạy song song và cùng ghi vào một thư mục. Không cấp mã phiên thì hai phiên sẽ
cùng đặt `p01-mo-trang.png`, phiên chạy sau ghi đè phiên chạy trước, và báo cáo cuối cùng
sẽ gán ảnh của người này cho lời kể của người kia. Đây là lỗi đã xảy ra thật, không phải
giả định.

## Chia đợt

Tối đa **4 phiên đồng thời**. Mỗi phiên một browser context riêng, sạch cookie.
Trần này chỉ giãn thời gian, không cắt phạm vi — vẫn phủ hết Red Route.
Chỉnh được nếu máy khoẻ hơn; đừng hard-code chỗ khác.

## Điều kiện dừng của một phiên

Đạt `done_when` · hết `patience_threshold` của chính persona đó (2–6 bước bế tắc liên tiếp)
· hoặc chạm trần cứng 40 hành động.

Trần 40 chỉ là lưới an toàn. Phiên nào chạm trần là dấu hiệu persona đó bị đặt ngưỡng kiên
nhẫn phi thực tế — sửa persona, đừng nâng trần.

## Sau khi chạy

Mọi log ghi vào `runs/<timestamp>/<persona>-<RR-id>.md`. Thư mục `runs/` gitignored, là nơi
làm việc.

### Kiểm ảnh trước khi gọi ux-expert

Cổng bắt buộc. Chưa qua thì chưa được dựng báo cáo.

1. Liệt kê `runs/<timestamp>/anh-tho/`. **Mọi** tên file phải khớp `<mã-phiên>-NN-<mô-tả>.png`
   với một mã phiên có thật trong danh sách phiên.
2. File nào không mang tiền tố phiên hợp lệ thì **không được dùng làm dẫn chứng**. Ghi nó
   vào §Ghi chú về chính lần chạy này, đừng lặng lẽ bỏ qua.
3. Đối chiếu số ảnh mỗi phiên với số ảnh phiên đó khai trong log. Thiếu là có ảnh đã bị ghi
   đè — ghi rõ phiên nào thiếu bao nhiêu ảnh, và đánh dấu mọi phát hiện dựa vào ảnh của phiên
   đó là **dẫn chứng không chắc**.

Sai lệch tìm thấy ở bước này là lỗi của người điều phối, không phải của persona, và phải
được ghi ra trong báo cáo chứ không sửa lặng lẽ.

Xong cổng này mới gọi `ux-expert` đọc cả thư mục đó, rồi dựng báo cáo theo `lib/report.tpl`.

### Báo cáo đi đâu

| Thứ | Đi đâu | Commit? |
| --- | --- | --- |
| Báo cáo tổng hợp | đang ở nhánh feature: `docs/specs/<feature>/ux-feedback-YYYY-MM-DD.md`; ngoài feature: `docs/ux-reviews/YYYY-MM-DD-<scope>.md` | có |
| Log thô từng phiên | copy từ `runs/` sang thư mục con cạnh báo cáo | có |
| Ảnh | ở lại `runs/` | không |
| Ảnh bị trích ở phát hiện Critical/High | copy sang cạnh báo cáo | có |

`runs/` là bản gốc đầy đủ, `docs/` là bản đã lọc để lưu vào repo. Chỉ copy ảnh của phát hiện
nặng — copy hết thì mỗi lần chạy nhét vài chục ảnh vào repo.

Ra chat chỉ in bảng điểm cộng danh sách phát hiện xếp theo mức nghiêm trọng. Không đổ log.
