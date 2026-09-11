# ADR-0007 · Nhận bộ quy ước view dùng chung của workspace `web-game`

> **Ngày:** 2026-09-11
> **Trạng thái:** accepted
> **Liên quan:** [`docs/code-conventions.md`](../code-conventions.md)

## 1. Bối cảnh

Bộ quy ước dùng chung rút từ `quapp-developer-frontend`, đã lọc qua ba lần áp thật
(`duck-caro`, `duck-flap`, `duck-mines`) trước khi tới đây.

Repo này lệch ở chỗ khác hẳn ba repo kia: nó **không có tầng `components/` trong
view** nào cả. Cả hai view là một nắm file trơ đặt cạnh `index.tsx`, và thư mục
`src/components/` cấp gốc thì đang gom ba thứ khác loại nhau:

- `components/ui/` — `Button`, `Modal`: đúng là dùng chung xuyên view.
- `components/board/` — chỉ `views/Play` dùng, nhưng nằm ở tầng "dùng chung".
- `components/level/levelText.ts` và `components/board/{geometry,boardLabel}.ts` —
  **không phải component**, chúng là hàm thuần; `levelText` còn bị `hooks/` import.

## 2. Quyết định

Theo [`docs/code-conventions.md`](../code-conventions.md):

- Hàm thuần ra `src/lib/` (`levelText` · `boardGeometry` · `boardLabel`). Tầng
  `components/` chỉ chứa component.
- `components/board/*` là của riêng `views/Play` nên chuyển vào view đó: `Board` →
  `mains/`, năm sprite → `components/`.
- Bỏ tầng `components/ui/` — `components/` cấp gốc ĐÃ có nghĩa "dùng chung xuyên
  view", thêm một chữ `ui` không thêm thông tin nào.
- Mỗi view có `mains/` (khối cấu trúc) và `components/` (mảnh hiển thị), mỗi component
  một thư mục + `index.tsx`.
- Thêm barrel `hooks/index.ts`, năm luật ESLint chung, `.githooks/pre-commit`.

**KHÔNG áp R-04 (`ghosts/`).** Repo này có ba `useEffect` trong tầng view, và cả ba
đều **sinh ra state dùng để render** (tải pack màn, đếm số đẩy của ván lưu, cờ còn
mounted). Ghost là thứ `return null`; ép chúng thành ghost sẽ phải đẩy state ngược lên
cha bằng callback để được đúng con số không. Chỗ này rule không có việc để làm, và
điều đó được ghi ra chứ không im lặng bỏ qua.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ `components/board/` ở cấp gốc | Nó chỉ có một người dùng. Để ở tầng "dùng chung" là nói dối về phạm vi, và người sửa `views/Play` phải đi tìm ở nơi khác |
| Để `levelText.ts` trong `components/` | Nó không render gì. Một hàm thuần nằm trong `components/` làm hỏng đúng cái nghĩa mà tầng đó mang |
| Ép ba effect thành ghost cho đủ bộ | Ghost `return null`; ba effect này sinh state để render. Áp cho đủ hình thức là làm code xấu đi để bảng trạng thái đẹp lên |

## 4. Hệ quả

**Được:**
- Mở `views/Play` là thấy hết mọi thứ nó cần; không còn phải nhảy sang `src/components/`.
- `src/components/` giờ đúng nghĩa: chỉ còn `Button` và `Modal`.

**Mất / phải chấp nhận:**
- Commit này chạm 22 file chỉ để di chuyển. `git log --follow` vẫn theo được, nhưng
  `git blame` trên một dòng bất kỳ sẽ dừng ở đây trước khi đi tiếp.
- Tầng view của repo này **không có unit test** — mọi test nằm ở `game/`. Lưới an toàn
  cho đợt chuyển này là `tsc` và bộ E2E, không phải test đơn vị.
