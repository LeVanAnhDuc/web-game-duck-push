# Sửa phản hồi UX 2026-09 — thiết kế

**Liên quan:** FR-08 · FR-10 · FR-11 · FR-16 (mới) · NFR-A11Y-07 · US-01 · US-03

Không thêm `US-xx`: cả sáu phát hiện nằm **trong** các luồng đã có (US-01, US-02, US-03,
US-05), không luồng nào đổi bản chất.
**Nguồn:** `docs/ux-reviews/2026-09-12-deployed.md` — F-01…F-06

## Vì sao có feature này

Sáu phát hiện từ một lượt review bằng persona trên bản deploy. Không phát hiện nào là
tính năng mới; tất cả đều là **chỗ sản phẩm nói sai hoặc không nói gì** về thứ nó đã làm được.

Một phát hiện chặn Red Route số 1, năm cái còn lại làm tốn bước hoặc làm người dùng tin nhầm.

## Cái KHÔNG làm

- **Không thêm tài khoản, bảng xếp hạng, gợi ý nước đi.** Persona negative đi tìm cả ba và
  không thấy — đó là Non-Goal đang hoạt động đúng (`overview.md` §4), không phải lỗi.
- **Không bật D-pad cho mọi thiết bị.** Ba persona chơi bằng phím rất trôi; D-pad thừa lấy
  mất diện tích bàn cờ, mà bàn cờ phải là phần tử lớn nhất ở mọi bề rộng (`MASTER.md`).
- **Không đổi ngưỡng `(pointer: coarse)` thành `(hover: none)` hay tương tự.** Nó không cứu
  được người dùng chuột, và đổi ngưỡng nhị phân này là một quyết định riêng cần ADR riêng.

## Sáu thay đổi

### 1. Bấm vào ô cạnh nhân vật để đi (F-01, High)

**Chỗ hỏng:** ở `pointer: fine` không có một nút điều khiển nào. Cô Nga suy ra đúng luật
chơi rồi bấm vào bàn cờ ba lần — bàn cờ **không phản hồi gì**, `Bước 0 · Đẩy 0` đứng yên
trong khi đồng hồ vẫn chạy.

**Sửa:** bấm (hoặc chạm) vào một ô **kề trực giao** với nhân vật = đi một bước về hướng đó.
Không phải tìm đường tự động — chỉ một bước, đúng bằng một lần bấm phím mũi tên.

Một bước chứ không phải tìm đường, vì ba lý do: nó ánh xạ 1-1 với phím mũi tên nên không đẻ
ra luật chơi thứ hai; nó không bao giờ tự đẩy một thùng mà người chơi không định đẩy; và nó
không cần solver.

Hai hàm thuần mới trong `src/lib/boardGeometry.ts`:

- `cellFromPoint(px, py, cell, width, height) → CellIndex | null`
- `stepDirection(from, to, width) → Direction | null` — chỉ trả về hướng khi `to` kề trực
  giao với `from`. **Phải chặn wrap dòng**: ô cuối dòng này và ô đầu dòng sau lệch nhau đúng
  1 chỉ số nhưng không hề kề nhau.

### 2. Dòng nhắc phím nói bằng tiếng người (F-01b)

`mũi tên/WASD để đi · Z hoàn tác · R chơi lại`
→ `Bấm vào ô cạnh nhân vật, hoặc ← ↑ → ↓ · Z hoàn tác · R chơi lại`

Ba thay đổi: bỏ `WASD` khỏi đầu dòng (persona đọc không hiểu — vẫn giữ phím WASD hoạt động,
chỉ không quảng cáo nó), thay chữ "mũi tên" bằng **chính bốn mũi tên** (cô Nga đi tìm hình
mũi tên trên màn hình), và nói ra cách bấm chuột vừa thêm. Đổi màu từ `muted-foreground`
sang `foreground` — nó không còn là chú thích, nó là chỉ dẫn duy nhất trên màn hình.

### 3. Trang chủ nói sản phẩm này khác gì (F-02)

`SOKOBAN` → `DUCK PUSH`, kèm một dòng dưới tiêu đề:

> Màn chơi do máy sinh, đã giải trước — bạn luôn biết số đẩy ít nhất.

Hai việc cùng lúc. Thứ nhất, `SOKOBAN` ở ô tên sản phẩm là **sót của lần đổi thương hiệu**:
`backlog.md` chốt "từ Sokoban giữ nguyên ở mọi chỗ nói về thể loại và luật; chỉ tên sản phẩm
đổi" — mà đây đúng là ô tên sản phẩm, `<title>` đã là `Duck Push` từ lâu. Thứ hai, 0/6
persona đọc ra điểm khác biệt từ trang chủ, trong khi con số tối ưu — thứ Hùng gọi là "đúng
thứ tôi cần" — chỉ xuất hiện sau khi đã cam kết vào một màn.

### 4. Bàn cờ nói vị trí, không chỉ nói tổng số (F-03)

`Bàn cờ 11 trên 8, 2 thùng, 0 đã vào đích`
→ thêm vị trí người chơi, vị trí từng thùng, vị trí từng đích, theo `cột C hàng H` (đếm từ 1).

Trục LATCH đang dùng là Category (đếm loại); trục người chơi cần là **Location**. Chị Linh
chơi được vì nhìn bằng mắt, nhưng nói thẳng: "nếu tôi thật sự dùng trình đọc màn hình mà
không nhìn được hình, tôi sẽ đi mò hoàn toàn mù".

NFR-A11Y-07 nói "bàn cờ có bản mô tả bằng chữ" — bản mô tả có tồn tại nhưng nó trả lời sai
câu hỏi.

### 5. Nút đổi giao diện có chữ (F-04)

Thêm nhãn chữ nhìn thấy được cạnh biểu tượng: `Sáng` / `Tối` / `Hệ thống`.

Khoa quét góc trên phải, thấy một nút **chỉ có biểu tượng đứng một mình ở ô quy ước của nút
tài khoản**, và tin chắc đó là đăng nhập. `aria-label` của nút vốn đã đúng; cái gây hiểu
nhầm là **vị trí cộng với việc không có chữ nào**. Thêm chữ là cách rẻ nhất phá vỡ liên
tưởng đó mà không phải đổi bố cục.

### 6. Lối ra thứ ba ở lớp phủ thắng (F-05)

Thêm `Màn ngẫu nhiên` cạnh `Chơi lại` và `Tiếp`.

Hùng vừa thắng, muốn màn mới toanh, bấm `Tiếp` vì đó là từ khớp nhất trên màn hình — và rơi
vào `easy-02`, một màn có sẵn. 3 thao tác cho một route `min_steps = 1`. Nút đúng chỉ có ở
trang chủ, tức là ở khoảnh khắc hứng thú cao nhất thì lối đi tiếp duy nhất là chiến dịch
tuần tự.

### 7. Màn ngẫu nhiên có tên riêng, và giữ lại mã đối chiếu (F-06)

`Màn 4152196902` → tiêu đề `Màn ngẫu nhiên`, và **seed chuyển xuống dòng phụ**:
`Dễ · Seed 4152196902`.

Đây là chỗ dễ sửa hỏng nhất trong cả bản này. Hùng chê cái nhãn, nhưng Quân **dựa vào chính
nó** để tin mình mở đúng màn bạn gửi: "con số trong tiêu đề trùng khớp với con số seed trong
link". Xoá con số đi là sửa chỗ Hùng chê và phá đúng chỗ đã khiến Quân tin.

Nên tách hai việc ra hai dòng: **tên** cho người đọc, **mã** cho người đối chiếu.

Nguyên nhân gốc nằm ở chỗ khác hẳn: generator đặt id màn là `${difficulty}-${seed}`, mà
`campaignNumber` lại nhận dạng màn chiến dịch bằng regex `^(easy|…)-(\d+)$`. Một màn sinh ra
**khớp regex đó**, nên cả tầng đặt tên coi nó là màn chiến dịch số 4.152.196.902.
Sửa ở gốc: id màn ngẫu nhiên thành `${difficulty}-r${seed}`.

Hệ quả phải nói rõ: khoá kỷ lục trong `localStorage` của các màn **ngẫu nhiên** đã lưu trước
đây sẽ không còn khớp. Chấp nhận được — lưới chiến dịch không đọc chúng, và ván đang dở khôi
phục bằng **seed** chứ không bằng id (`useLevelRouter.resumeSaved`). Tiến độ chiến dịch
không bị đụng tới.
