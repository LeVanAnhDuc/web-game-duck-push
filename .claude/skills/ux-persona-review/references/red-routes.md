# Red Routes — Duck Push

> **Trả lời:** Hành trình nào mà hỏng là sản phẩm coi như hỏng?
> **Trạng thái:** 🟢 đã duyệt — người dùng duyệt 2026-09-12
> **Cập nhật:** 2026-09-12 · cài `ux-persona-lab`
> **Cập nhật khi:** thêm/bớt một luồng `US-xx` · một FR đổi trạng thái

Mỗi Red Route là một **hành trình**, không phải một trang. `done_when` viết bằng thứ người
chơi **nhìn thấy**, không tham chiếu code — đó là thứ cho phép chấm hiệu quả mà không phải
nói trước cho persona biết cần bấm nút nào.

## Cách đếm `min_steps` trong một game — đọc trước khi chấm hiệu suất

Sản phẩm này khác các app trong workspace ở một điểm quyết định: phần lớn thao tác của
người dùng là **nước đi trong bàn cờ**, và đi nhiều nước không phải là lỗi UX — đó chính là
trò chơi. Nếu đếm cả nước đi vào `min_steps` thì mọi persona sẽ bị chấm là "kém hiệu quả"
đúng vào lúc họ đang chơi đúng như thiết kế.

Nên ở đây tách làm hai:

| Đại lượng | Đếm gì | Chấm thế nào |
| --- | --- | --- |
| `min_steps` | **chỉ thao tác điều hướng**: bấm nút, chọn tab, mở/đóng lớp phủ, cuộn tới chỗ cần. Không tính nước đi trên bàn cờ. | mẫu số của điểm hiệu suất |
| nước đi trên bàn | phím mũi tên / vuốt / D-pad | so với `optimalPushes` mà HUD đã hiện sẵn — **không** trừ điểm UX |

Persona đi 60 nước cho một màn tối ưu 7 đẩy là **dữ liệu về độ khó**, không phải phát hiện
UX. Nó chỉ thành phát hiện khi kèm một câu kiểu "tôi không hiểu vì sao thùng không nhúc
nhích" — tức là luật chơi không tự lộ ra.

Trần cứng 40 hành động ở `lib/orchestration.md` vì thế đếm theo **thao tác điều hướng + số
lượt nhập hướng đi**, và với các route có chơi thật (RR-01, RR-02, RR-04) persona được phép
coi một chuỗi nước đi liên tiếp không suy nghĩ là **một** hành động.

---

## RR-01 · Giải xong màn đầu tiên mà không đọc hướng dẫn

- **id:** RR-01
- **name:** Từ trang lạ đến màn đầu tiên đã giải xong
- **actor:** Người mở trang lần đầu, máy sạch, có thể chưa từng chơi Sokoban
- **entry:** `http://localhost:3000` với `localStorage` trống
- **done_when:** Một lớp phủ hiện chữ **"Xong màn!"** kèm một dòng dạng
  `<số> bước · <số> đẩy · <mm:ss>`, và sau khi đóng lớp phủ, ô màn vừa chơi trên lưới
  trang chủ trông khác các ô chưa chơi.
- **min_steps:** 2 (bấm ô "Màn 1" → chơi → lớp phủ tự hiện; +1 nếu phải đóng lớp phủ để
  xem lưới). Bàn cờ tối ưu 7 đẩy / 30 nước — không tính vào con số này.
- **why_red:** Đây là định nghĩa thành công số 1 của sản phẩm: "giải xong màn đầu tiên
  **mà không cần đọc hướng dẫn**". Không có màn hình onboarding nào, nên luật chơi buộc
  phải tự lộ ra qua chính màn 1. Hỏng ở đây thì mọi thứ phía sau không ai thấy.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:8` (US-01) ·
  `docs/01-product/overview.md` §6.1 · `docs/02-requirements/scope.md:12,14,15,17,18,21`
  (FR-01, FR-03, FR-04, FR-06, FR-07, FR-10) · `src/game/levels/data/easy.json` (easy-01:
  `optimalPushes: 7`, `optimalMoves: 30`)

---

## RR-02 · Gỡ lại sau khi đẩy hỏng một thùng

- **id:** RR-02
- **name:** Đẩy thùng vào chỗ chết rồi tự gỡ ra được
- **actor:** Người đang chơi dở một màn, vừa đẩy hỏng
- **entry:** `http://localhost:3000`, vào một màn bậc **Dễ** hoặc **Vừa**, cố ý đẩy một
  thùng vào góc tường
- **done_when:** Sau khi đẩy hỏng, một **dải cảnh báo** hiện ngay dưới bàn cờ nói thùng đã
  kẹt; người chơi đưa được bàn cờ về trạng thái không còn cảnh báo, và bộ đếm `Bước`/`Đẩy`
  trên HUD **lùi lại** chứ không tăng tiếp.
- **min_steps:** 2 (bấm "Hoàn tác" đủ số lần, hoặc bấm "Chơi lại" một lần)
- **why_red:** Sokoban là trò chơi mà một nước sai là hỏng cả màn. Không gỡ lại được thì
  người chơi phải đóng tab — và tiến độ lẫn hứng thú đi cùng. Cảnh báo cố ý là **dải chứ
  không phải hộp thoại**, vì hộp thoại sẽ chắn đúng cái nút Hoàn tác người chơi đang với
  tới; đó là thứ cần một người thật xác nhận, không test tự động nào thấy được.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:31` (US-02) ·
  `docs/02-requirements/scope.md:13,16` (FR-02, FR-05) ·
  `src/views/Play/components/DeadlockBanner/index.tsx:28`

---

## RR-03 · Lấy một màn chưa ai từng chơi

- **id:** RR-03
- **name:** Sinh một màn ngẫu nhiên và bắt đầu chơi nó
- **actor:** Người đã giải vài màn quen, muốn màn mới
- **entry:** `http://localhost:3000`
- **done_when:** Sau khi bấm nút màn ngẫu nhiên, trong lúc chờ có dấu hiệu "đang làm việc"
  (trang **không đứng hình**, bấm được chỗ khác), rồi một bàn cờ mới hiện ra với HUD có số
  đẩy tối ưu; thanh địa chỉ chứa `seed=`.
- **min_steps:** 2 (chọn bậc khó → bấm "Màn ngẫu nhiên"; 1 nếu giữ bậc mặc định **Dễ**)
- **why_red:** Đây là lý do sản phẩm này tồn tại — "nguồn màn không cạn". Nếu người chơi
  không tìm ra nút này, hoặc bấm rồi tưởng máy treo, thì phần khác biệt duy nhất của sản
  phẩm so với mọi bản Sokoban web khác coi như không có. Ngưỡng NFR-PERF-06 là p95 ≤ 1.5s,
  trần cứng 2.5s rồi hạ chuẩn — persona **cảm nhận** được ngưỡng này chứ không đo được nó.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:54` (US-03) ·
  `docs/02-requirements/scope.md:19,23` (FR-08, FR-11) ·
  `docs/02-requirements/nfr.md` NFR-PERF-06, NFR-PERF-08, NFR-REL-03 ·
  `src/views/Home/components/RandomLevelButton/index.tsx:64`

---

## RR-04 · Quay lại phá kỷ lục của chính mình

- **id:** RR-04
- **name:** Chơi lại một màn đã giải để đạt số đẩy tối ưu
- **actor:** Người đã giải màn đó một lần với số đẩy dư
- **entry:** `http://localhost:3000` với `localStorage` **đã có** ít nhất một màn đã giải
  chưa tối ưu (chuẩn bị bằng cách chạy RR-01 trước trong cùng context)
- **done_when:** Người chơi nhận ra từ lưới trang chủ rằng màn đó **đã giải nhưng chưa tối
  ưu**, mở lại, chơi lại, và lớp phủ kết thúc nói rõ kỷ lục cũ là bao nhiêu — kỷ lục chỉ
  đổi khi ván mới **tốt hơn**.
- **min_steps:** 2 (bấm ô màn đã giải → chơi → lớp phủ tự hiện)
- **why_red:** Đây là toàn bộ vòng lặp giữ chân người chơi khi hết màn mới: số đẩy tối ưu
  hiện sẵn trên HUD là **lời mời quay lại**. Nếu người chơi không đọc ra "ô này đã giải
  nhưng chưa đạt sao" từ lưới, lời mời đó không tồn tại. Đây cũng là chỗ NFR-A11Y-06 bị
  thử thật: trạng thái ô không được chỉ phân biệt bằng màu.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:77` (US-04) ·
  `docs/02-requirements/scope.md:18,20` (FR-07, FR-09) ·
  `docs/02-requirements/nfr.md` NFR-A11Y-06 ·
  `src/views/Home/components/LevelTile/index.tsx:12,34`

---

## RR-05 · Chơi tiếp ván đang dở sau khi đóng tab

- **id:** RR-05
- **name:** Mở lại trang và về đúng ván đang dở
- **actor:** Người hôm qua chơi dở một màn
- **entry:** `http://localhost:3000` trong **cùng** browser context, sau khi đã đi được vài
  nước ở một màn rồi quay về trang chủ / tải lại trang
- **done_when:** Trang chủ hiện một thẻ **"Đang chơi dở"** có tên màn và số bước đã đi; bấm
  vào đó đưa bàn cờ về **đúng** trạng thái đang dở, và nút Hoàn tác vẫn lùi được tiếp —
  tức là cả lịch sử cũng sống sót.
- **min_steps:** 1 (bấm thẻ "Đang chơi dở")
- **why_red:** Người chơi mục tiêu chơi từng đợt ngắn 5–15 phút trên điện thoại, nơi tab bị
  hệ điều hành giết bất cứ lúc nào. Mất ván đang dở một lần là mất người chơi. Không có tài
  khoản để đồng bộ, nên `localStorage` là **cơ chế duy nhất** — không có mạng lưới đỡ nào
  phía sau.
- **min_steps lưu ý:** thẻ này chỉ hiện khi có ván dở; persona nào tới trang chủ mà không
  thấy thẻ thì đây là kết quả hợp lệ và phải ghi lại, không được đi tìm cách khác.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:97` (US-05) ·
  `docs/02-requirements/scope.md:20` (FR-09) ·
  `docs/02-requirements/nfr.md` NFR-REL-04, NFR-DATA-04 ·
  `src/views/Home/mains/ResumeCard/index.tsx:28`

---

## RR-06 · Mở một màn người khác gửi cho

- **id:** RR-06
- **name:** Nhận một đường dẫn có seed và chơi đúng màn đó
- **actor:** Người được bạn gửi link, **chưa từng** vào trang này
- **entry:** một đường dẫn dạng `http://localhost:3000/?d=medium&seed=<seed thật lấy từ
  RR-03>` — dán thẳng vào thanh địa chỉ của một context sạch
- **done_when:** Bàn cờ mở ra là **đúng màn** người gửi thấy (cùng hình dạng, cùng số đẩy
  tối ưu trên HUD), không phải trang chủ và không phải một màn khác.
- **min_steps:** 0 thao tác điều hướng — mở link là xong. Đây là route ngắn nhất và cũng là
  route dễ hỏng nhất.
- **why_red:** Đây là con đường lan truyền duy nhất của một sản phẩm không có tài khoản,
  không có bảng xếp hạng và không có gì để chia sẻ ngoài chính màn chơi. Nó cũng là chỗ
  NFR-SEC-07 bị thử: seed sửa bậy phải **về trang chủ kèm câu giải thích đọc được**, không
  nổ trắng trang. Đáng chạy kèm một lượt với `seed=abc` để xem câu giải thích đó có đọc
  được với người thường không.
- **status:** live
- **derived_from:** `docs/01-product/journeys.md:54` (US-03, bước 4) ·
  `docs/02-requirements/scope.md:23` (FR-11) ·
  `docs/02-requirements/nfr.md` NFR-SEC-07 ·
  `src/hooks/levelRouting.ts` (`parseBootTarget`)

---

## Không chạy — giữ lại để theo dõi

| id | name | status | vì sao không chạy |
| --- | --- | --- | --- |
| RR-07 | Xin gợi ý nước đi khi bí | planned | FR-13 đang `(bỏ)` — solver hiện chỉ chạy từ trạng thái đầu lúc sinh màn (`docs/02-requirements/scope.md:24`, `docs/01-product/overview.md` §4). Chạy route này chỉ sinh ra "không có tính năng này". |
| RR-08 | Tự vẽ một màn | planned | FR-14 `(bỏ)` — Non-Goal vĩnh viễn: editor tự cạnh tranh với lý do generator tồn tại. Giữ ID để không ai đề xuất lại mà không đọc Non-Goals. |
| RR-09 | So điểm với người khác | planned | FR-15 `(bỏ)` — Non-Goal: chống gian lận một game chạy hoàn toàn phía client không có lời giải sạch. |

Ba dòng này **bị loại khỏi mọi lượt chạy**. Chúng ở đây để lần sau không phải đi tìm lại
lý do.

---

## Tổng lượt chạy

6 Red Route `live` + 2 phiên mù = **8 phiên**, chia 2 đợt 4 phiên
(`lib/orchestration.md` §Chia đợt).

### Ai chạy phiên nào — đã chốt, đừng gán lại mỗi lần chạy

| Phiên | Mã phiên | Persona | Đợt | Context |
| --- | --- | --- | --- | --- |
| RR-01 | `p01-RR-01` | p01 Thảo | 1 | sạch |
| RR-02 | `p02-RR-02` | p03 Linh | 1 | sạch, zoom 200% |
| RR-03 | `p03-RR-03` | p02 Hùng | 1 | sạch |
| mù A | `p04-blind` | p05 Nga | 1 | sạch |
| RR-04 | `p05-RR-04` | p01 Thảo | 2 | **tiếp context của `p01-RR-01`** |
| RR-05 | `p06-RR-05` | p04 Minh | 2 | sạch, tự tạo tiến độ trong phiên |
| RR-06 | `p07-RR-06` | p07 Quân | 2 | sạch, URL dựng từ seed trong log `p03-RR-03` |
| mù B | `p08-blind` | p06 Khoa | 2 | sạch |

**Luật một-lần-đầu:** mỗi persona chỉ có **một** phiên vào context sạch. Ấn tượng 5 giây chỉ
lấy được một lần cho mỗi người — cho một persona mở lại trang trong context sạch lần thứ hai
là tự bịa ra một ấn tượng đầu không có thật. Ngoại lệ duy nhất là `p05-RR-04`, và nó **không**
phải context sạch: Thảo đã chơi RR-01 rồi, đó chính là điều kiện của route.

Số `NN` trong mã phiên chạy theo **thứ tự dispatch**, không theo số hiệu persona — `p01-RR-01`
do p01 chạy là trùng hợp, `p03-RR-03` là do p02 chạy. Chạy lại một phiên thì lấy số mới
(`p09-…`), không dùng lại số cũ.

**Phụ thuộc giữa các route — quan trọng:** RR-04 và RR-05 cần trạng thái có sẵn trong
`localStorage`, RR-06 cần một seed thật do RR-03 sinh ra. Ba route đó **không** chạy được
trong một context sạch hoàn toàn. Thứ tự bắt buộc:

1. **Đợt 1:** RR-01 · RR-02 · RR-03 · phiên mù A (điện thoại, mạng chậm)
2. giữa hai đợt: lấy `seed` từ log của RR-03 để dựng URL cho RR-06
3. **Đợt 2:** RR-04 · RR-05 · RR-06 · phiên mù B (power user, desktop)

RR-04 và RR-05 dùng lại context của RR-01 (đã có tiến độ), chứ không mở context trắng —
mở trắng thì `done_when` của chúng không bao giờ đạt được và báo cáo sẽ đổ lỗi cho giao
diện vì một lỗi điều phối.
