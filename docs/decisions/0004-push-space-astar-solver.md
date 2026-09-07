# ADR-0004 · Solver A\* trên không gian đẩy, chuẩn hoá theo vùng người chơi

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** ADR-0003 · NFR-PERF-07 · FR-03 · FR-05

## 1. Bối cảnh

Solver chạy **hàng nghìn lần** trong một lần sinh pack, và một lần nữa với ngân sách ~300ms
mỗi khi người chơi bấm "màn ngẫu nhiên". Nó phải trả về số đẩy **tối ưu** (HUD và kỷ lục dựa
vào con số này) và phải dừng đúng hạn.

## 2. Quyết định

A\* trên **không gian đẩy**, không phải không gian nước đi.

- Khoá trạng thái = (vị trí các thùng đã sắp tăng dần, **chỉ số nhỏ nhất trong vùng người
  chơi tới được**). Hai thế giống nhau về thùng mà người chơi đứng khác ô trong cùng một vùng
  là **một** trạng thái.
- Nút kế tiếp: mỗi thùng × 4 hướng, hợp lệ khi người chơi tới được ô đứng để đẩy và ô đích
  trống, không phải tường, không phải ô chết. Chi phí một lần đẩy = 1.
- Heuristic: tổng khoảng cách Manhattan từ mỗi thùng tới đích gần nhất — không vượt chi phí
  thật, nên lời giải trả về là tối ưu.
- Cắt tỉa bằng bảng **ô chết tĩnh** (tính một lần cho mỗi bàn bằng cách kéo ngược từ các đích)
  và dò **thùng đóng băng**.
- Ngân sách `maxNodes` + `maxMillis`, kiểm đồng hồ mỗi ~1000 nút. Chạm trần trả `timeout`.
- Sau khi có chuỗi đẩy, đổi sang dãy nước đi thật bằng BFS tìm đường giữa các lần đẩy.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| BFS/A\* trên không gian nước đi | Không gian lớn hơn nhiều bậc vì mỗi bước chân của người chơi là một trạng thái. Với bàn 12×12 là hết ngân sách trước khi chạm tới lời giải |
| Không chuẩn hoá vùng người chơi (lưu nguyên vị trí) | Cùng một thế thùng sinh ra hàng chục trạng thái khác nhau. Vẫn ra lời giải đúng, chỉ chậm gấp nhiều lần — và chậm thì generator vứt nhầm màn khó thành "quá rối" |
| Heuristic ghép cặp thùng–đích tối ưu (Hungarian) | Chặt hơn Manhattan gần nhất, nhưng tốn O(n³) mỗi nút. Với 3–6 thùng, cái tiết kiệm được không bù nổi cái phải trả |
| IDA\* thay A\* | Ít tốn bộ nhớ hơn, nhưng lặp lại công việc nhiều lần và khó áp trần thời gian một cách sạch sẽ |
| Solver không ngân sách, chạy tới khi xong | Vi phạm NFR-PERF-07. Trong trình duyệt là treo tab |

## 4. Hệ quả

**Được:**
- Số đẩy trả về là tối ưu thật, nên `optimalPushes` trong pack có thể tin.
- Bảng ô chết và bộ dò đóng băng viết một lần, dùng lại luôn cho cảnh báo bế tắc trong lúc
  chơi (FR-05) — không phải cài lại lần hai.

**Mất / phải chấp nhận:**
- A\* giữ toàn bộ tập đóng trong bộ nhớ; với bàn lớn hoặc nhiều thùng, bộ nhớ là thứ chạm
  trần trước thời gian.
- `timeout` **không** kết luận được màn có giải được hay không (bất biến #15). Generator phải
  đối xử với nó như "vứt đi", không phải "vô nghiệm".
- Số đẩy tối ưu chuẩn, nhưng số **bước đi** trả kèm chỉ tối ưu trong phạm vi lời giải ít đẩy
  nhất — không phải lời giải ít bước nhất. Kỷ lục vì thế chấm theo số đẩy trước, số bước sau.

**Điều kiện xem lại:** nếu thêm bậc khó có ≥ 8 thùng, lúc đó heuristic ghép cặp và IDA\* đáng
được đo lại.
