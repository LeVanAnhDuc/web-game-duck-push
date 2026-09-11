# Rule tạo persona — bản đã chưng cho Duck Push

> **Nguồn:** fetch ngày 2026-09-12, thành công. Bản seed offline đã bị ghi đè.
> Phần §6 là nghiên cứu riêng cho domain **game giải đố trên trình duyệt**, không
> lấy từ bản seed.

Dàn persona ở `personas/` được sinh theo đúng các rule dưới đây. Sửa rule mà không sinh lại
dàn thì hai thứ lệch nhau, và không ai biết báo cáo đang dựa trên cái gì.

---

## 1. Phân loại (Cooper — goal-directed design)

| Loại | Nghĩa | Trong dàn này |
| --- | --- | --- |
| primary | người mà sản phẩm được thiết kế cho. Không phục vụ được họ là hỏng. | bắt buộc có, ≥ 2 |
| secondary | dùng được sản phẩm nhưng cần thêm vài thứ | 1–2 |
| served | chịu ảnh hưởng nhưng không trực tiếp dùng | thường không có ở game đơn |
| negative | người sản phẩm **không** nhắm tới. Có mặt để phát hiện đang phục vụ nhầm ai. | **đúng một** |

Negative persona không phải để chê sản phẩm. Nó tồn tại để trả lời một câu duy nhất: *sản
phẩm có đang âm thầm chiều người mà nó không định phục vụ không?* Với Duck Push, negative
persona là người đi tìm thứ nằm trong **Non-Goals** — tài khoản, bảng xếp hạng, trình soạn
màn, gợi ý nước đi. Họ **không đạt** `done_when` của bất kỳ Red Route nào, và đó là kết quả
**đúng**. Báo cáo phải đọc sự thất bại của họ là xác nhận ranh giới, không phải lỗi.

## 2. Persona bám hành vi, không bám nhân khẩu học

NN/g nói thẳng: **không** dựng persona từ tương quan giữa các biến nhân khẩu học hoặc
analytics, vì *"nếu bạn không biết vì sao ai đó làm một việc, bạn sẽ phải giả định, và giả
định thường sai"*. Persona chỉ hợp lệ khi bám cái **what & why** thúc đẩy người đó.

Chuẩn để tự kiểm một dòng trong hồ sơ persona: **dòng này dự đoán được một hành vi cụ thể
trên màn hình không?**

| Viết thế này là hỏng | Viết thế này mới dùng được |
| --- | --- |
| "Nữ, 28 tuổi, thích du lịch" | "Bấm nút Back của trình duyệt thay vì nút quay lại trong trang" |
| "Am hiểu công nghệ" | "Thấy chữ `seed` trong thanh địa chỉ thì thử sửa nó" |
| "Thiếu kiên nhẫn" | "Bấm lại lần hai sau 2 giây nếu nút không đổi hình" |

Dàn của chúng ta là **proto-persona** theo cách gọi của NN/g: dựng từ giả định của nhóm làm
sản phẩm cộng tài liệu, **không** từ phỏng vấn người thật. Điều đó phải được nói ra trong
báo cáo. Chúng hữu ích để tìm chỗ hỏng, chúng **không** phải bằng chứng về người dùng thật.

## 3. Trường bắt buộc trong mỗi file persona

| Trường | Vì sao bắt buộc |
| --- | --- |
| `loai` | primary / secondary / negative — quyết định cách đọc kết quả của họ |
| bối cảnh, nghề nghiệp | để những gì persona nói nghe như người thật |
| trình độ số | quyết định mức chịu đựng với thuật ngữ |
| thiết bị + mạng | đổi thẳng thành viewport và network throttle khi dispatch |
| nhu cầu tiếp cận | dàn **bắt buộc** có ≥ 1 người chỉ dùng bàn phím hoặc thị lực kém |
| động cơ, nỗi sợ | định hướng cái persona chú ý tới |
| `patience_threshold` | 2–6 bước bế tắc liên tiếp thì bỏ cuộc — điều kiện dừng thật của phiên |
| ngôn ngữ | tiếng Việt (giao diện chỉ có tiếng Việt, `<html lang="vi">`) |
| JTBD | một câu: *khi \_\_\_, tôi muốn \_\_\_, để \_\_\_.* |
| `goal_in_user_words` | một dòng cho **mỗi** Red Route `live` mà persona này được giao |

## 4. Kích thước dàn

5–7 người, **cố định giữa các lần chạy**. Đẻ persona mới mỗi lần chạy là tự tay phá bỏ thứ
đắt nhất mà skill này tạo ra: khả năng so sánh trước và sau khi sửa.

Bắt buộc trong dàn: ≥ 1 persona tiếp cận (a11y) · **đúng một** negative · ≥ 1 người dùng
điện thoại trên mạng chậm.

## 5. `goal_in_user_words` — từ ngữ người dùng, không từ ngữ sản phẩm

Câu JTBD là nguyên liệu. Luật: **cấm dùng bất kỳ từ nào chỉ tồn tại trong sản phẩm.** Với
Duck Push, danh sách cấm lấy thẳng từ `docs/01-product/glossary.md` và từ giao diện:

> `seed` · `optimalPushes` · "số đẩy tối ưu" · "tối ưu" · "chiến dịch" · "bậc khó" ·
> "màn ngẫu nhiên" · "hoàn tác" · "kỷ lục" · "deadlock" · "generator" · "solver" · "Duck Push"

Danh từ đời thường thì được, kể cả khi giao diện cũng dùng đúng từ đó: "thùng", "đích",
"bước". Cái bị cấm là **tên tính năng** và **tên chỉ số** — thứ mà chỉ người đã biết sản
phẩm mới gọi ra được. Và không bao giờ ghép chúng thành một chỉ dẫn: brief được phép nói
"tôi muốn đưa mấy cái thùng này về chỗ của nó", **không** được nói "đẩy thùng vào ô đích rồi
xem số đẩy tối ưu".

Nói "tôi muốn thử một màn mới xem sao" — **không** nói "dùng tính năng sinh màn ngẫu nhiên".
Nói "lỡ đẩy sai rồi, giờ làm sao" — **không** nói "bấm nút Hoàn tác".

Persona nào **tự** tìm ra đúng nút mà brief chưa hề gọi tên nó — đó mới là bằng chứng nhãn
đó đọc được.

## 6. Nghiên cứu riêng domain — game giải đố chơi trên trình duyệt

Phần này quyết định vì sao dàn của Duck Push khác dàn của một app SaaS.

**Ngưỡng 90 giây.** Tài liệu FTUE của ngành game thống nhất một con số: người chơi phải chạm
được vào lõi gameplay trong khoảng một phút, và nếu khoảnh khắc "à, ra thế" đến sau ~90
giây thì một phần đáng kể không bao giờ quay lại phiên thứ hai. Duck Push **không có màn
hình hướng dẫn nào** — đó là lựa chọn có chủ ý (`overview.md` §6.1: giải xong màn đầu *mà
không cần đọc hướng dẫn*). Vì vậy RR-01 phải được chấm bằng đồng hồ, không chỉ bằng
đạt/không đạt: **persona mất bao lâu để hiểu rằng đi vào thùng là đẩy nó?** Đây là phát hiện
giá trị nhất mà cả dàn có thể sinh ra.

**Không có phần thưởng ngoài chính màn chơi.** Game thương mại giữ chân bằng vật phẩm, chuỗi
ngày, thông báo đẩy. Duck Push không có gì trong số đó, và không định có. Thứ duy nhất thay
thế là **con số đẩy tối ưu hiện sẵn trên HUD** — nó vừa là mục tiêu vừa là lời mời quay lại.
Nên có ít nhất một persona trong dàn mà cả JTBD là đuổi theo con số đó (RR-04), và ít nhất
một persona hoàn toàn **không** để ý tới nó — nếu người thứ hai vẫn chơi vui thì con số đó
không cản đường ai, còn nếu họ thấy nó gây áp lực thì đó là phát hiện thật.

**Phiên ngắn, ngắt giữa chừng là bình thường.** Người chơi mục tiêu chơi 5–15 phút trên điện
thoại (`overview.md` §3), nơi tab bị hệ điều hành thu hồi bất cứ lúc nào. "Chơi tiếp ván
đang dở" (RR-05) vì thế không phải tiện ích — nó là điều kiện sống. Dàn phải có người thật
sự bỏ giữa chừng rồi quay lại, chứ không phải ai cũng chơi một mạch tới thắng.

**Bỏ cuộc là dữ liệu, không phải lỗi.** Trong một game giải đố, bí là *nội dung*. Phân biệt
hai loại bế tắc, và persona phải nói rõ mình đang ở loại nào:

| Loại | Ví dụ câu persona nói | Đọc thế nào |
| --- | --- | --- |
| bí vì **câu đố** khó | "tôi chưa nghĩ ra cách đưa thùng này qua" | **không** phải lỗi UX. Ghi lại, không tính vào điểm |
| bí vì **giao diện** | "tôi không biết làm sao để thử lại từ đầu" · "bấm mà không thấy gì xảy ra" | phát hiện UX thật |

Trộn hai loại này là cách hỏng đặc trưng khi đem khung UX của app năng suất áp vào game.

**Từ ngữ người chơi Việt dùng.** Persona nói "thùng" hoặc "hộp" (không nói "crate"), "chỗ
cần đưa tới" (không nói "goal"), "kẹt rồi" / "hỏng rồi" (đúng chữ giao diện dùng là **"Kẹt"**
chứ không phải "bế tắc" — `glossary.md`), và "làm lại" — từ mà người Việt dùng lẫn cho cả
*lùi một nước* lẫn *chơi lại từ đầu*. **Sự lẫn lộn này phải được thử**, vì hàng nút dưới bàn
cờ có ba nút cạnh nhau: `Hoàn tác` · `Làm lại` · `Chơi lại`, trong đó "Làm lại" nghĩa là
*redo* — đúng ngược với cái phần lớn người chơi nghĩ khi đọc hai chữ đó
(`src/views/Play/components/Controls/index.tsx`).

**Không có gì để đăng nhập, nên không có gì để tin hay không tin.** Lăng kính "trust &
desirability" ở `lib/frameworks.md` viết cho app có thu thập dữ liệu. Với sản phẩm này nó
đổi câu hỏi: không phải *"tôi có dám nhập email không"* mà *"tôi có tin rằng cái máy này ra
màn thật, giải được, chứ không phải ném bừa cho tôi một mớ thùng không?"* Niềm tin ở đây
đặt vào **con số đẩy tối ưu** — nếu người chơi không tin con số đó là đúng, toàn bộ vòng lặp
sụp.

---

## Nguồn

- [NN/g — Three Persona Types](https://www.nngroup.com/articles/persona-types/)
- [The Decision Lab — Red Route Usability](https://thedecisionlab.com/reference-guide/design/red-route-usability)
- [Rik Williams — Red route prioritisation flowchart & matrix](https://rikwilliams.net/resources/red-route-flowchart-matrix/)
- [GDS — Accessibility Personas](https://alphagov.github.io/accessibility-personas/)
- [GOV.UK — Understanding disabilities and impairments: user profiles](https://www.gov.uk/government/publications/understanding-disabilities-and-impairments-user-profiles)
- [Playio — Onboarding decides your D1: first-session design & FTUE metrics](https://blog.playio.co/mobile-game-onboarding-retention)
- [Udonis — First-Time User Experience in mobile games](https://www.blog.udonis.co/mobile-marketing/mobile-games/first-time-user-experience)

`userfocus.co.uk` (bài gốc của David Travis) trả **403** cho fetch ngày 2026-09-12 — phần
Red Routes lấy từ hai nguồn thứ cấp ở trên. Lưu ý khi cần trích nguyên văn.

**Cảnh báo bắt buộc giữ lại** (GDS): mô phỏng **không bao giờ** thay được việc kiểm thử với
người có nhu cầu tiếp cận thật. Persona a11y trong dàn này chỉ tìm ra được chỗ hỏng hiển
nhiên; đừng đọc kết quả của họ như một chứng chỉ.
