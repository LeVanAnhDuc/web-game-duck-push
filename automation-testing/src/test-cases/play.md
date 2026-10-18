# PLAY — Test cases

Requirement: `docs/requirements/play.md` · quyết định: `docs/decisions/play.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-PLAY-001 — mở màn 1 thấy tên màn, bộ đếm về 0 và số đẩy tối ưu đúng của màn

- **Requirement:** REQ-PLAY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `./?level=easy-01&d=easy`
- **Mong đợi:** `Màn 1`, `Dễ · Chiến dịch`, `Bước 0 · Đẩy 0 · 00:00`, `Tối ưu 7 đẩy · KL bạn chưa có` — 7 bằng số đẩy ít nhất do bộ giải độc lập của suite tìm ra; nhân vật và thùng đúng vị trí của pack
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-002 — bước vào ô trống thì nhân vật đi một ô, Bước tăng 1, Đẩy giữ nguyên

- **Requirement:** REQ-PLAY-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** màn 1 → `↑`
- **Mong đợi:** nhân vật lên một hàng; `Bước 1 · Đẩy 0`
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-003 — bước vào thùng thì đẩy thùng đi một ô, Bước và Đẩy cùng tăng 1

- **Requirement:** REQ-PLAY-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** màn 1 → `←` (thùng ngay bên trái)
- **Mong đợi:** nhân vật và thùng cùng sang trái một ô; `Bước 1 · Đẩy 1`
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-004 — thùng sát tường thì không đẩy được: bàn cờ và bộ đếm đứng yên

- **Requirement:** REQ-PLAY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** đi tới vị trí thùng nằm giữa nhân vật và tường (tìm bằng mô hình của suite) → bấm hướng đẩy
- **Mong đợi:** mô tả bàn cờ và bộ đếm không đổi
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-005 — thùng chắn sau lưng thùng khác thì không đẩy được: bàn cờ và bộ đếm đứng yên

- **Requirement:** REQ-PLAY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** đi tới vị trí hai thùng thẳng hàng trước mặt nhân vật → bấm hướng đẩy
- **Mong đợi:** mô tả bàn cờ và bộ đếm không đổi
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-006 — bước vào tường thì không đi, không tính bước

- **Requirement:** REQ-PLAY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** màn 1 → `→` (tường bên phải)
- **Mong đợi:** không đổi; `Bước 0 · Đẩy 0`
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-007 — WASD (W A S D) đi giống bốn phím mũi tên

- **Requirement:** REQ-PLAY-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** màn 1 → `W` `A` `S` `D`
- **Mong đợi:** vị trí và bộ đếm bằng đúng `↑ ← ↓ →`
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-008 — phím mũi tên không cuộn trang, và cả trang lẫn bàn cờ không có thanh cuộn ở 375px

- **Requirement:** REQ-PLAY-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** 375×667 → màn 1 → `↓ ↓ ↑ →`
- **Mong đợi:** `scrollX/Y = 0`; trang và bàn cờ không tràn
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-009 — bấm vào ô kề nhân vật là đi một bước về phía đó, kể cả đẩy thùng

- **Requirement:** REQ-PLAY-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn 1 → bấm ô trên → ô dưới → ô trái (có thùng)
- **Mong đợi:** mỗi cú bấm đúng một bước; cú cuối đẩy thùng; `Bước 3`
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-010 — bấm vào ô không kề nhân vật, hoặc vào chính nhân vật, không làm gì

- **Requirement:** REQ-PLAY-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** màn 1 → bấm ô cách 2 ô, ô chéo, ô nhân vật
- **Mong đợi:** bàn cờ và bộ đếm không đổi
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-011 — đồng hồ HUD chạy từ lúc mở màn theo dạng mm:ss

- **Requirement:** REQ-PLAY-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** `page.clock` → mở màn 1 → chạy 9s → chạy thêm 56s
- **Mong đợi:** `00:00` → `00:09` → `01:05`
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-012 — thùng vào đích được mô tả là đã vào đích và đếm vào số thùng xong

- **Requirement:** REQ-PLAY-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đi theo lời giải tối ưu tới cú đẩy đầu tiên đưa thùng vào đích
- **Mong đợi:** mô tả có một `Thùng đã vào đích`, một `Thùng`, và `1 trên 2 thùng đã vào đích`
- **Automated:** `tests/e2e/play/moves.e2e.ts`

### TC-PLAY-013 — mở màn chưa có vệt; mỗi bước để lại một chấm trên ô vừa rời, chấm mới đậm hơn chấm cũ

- **Requirement:** REQ-PLAY-09
- **Layer:** e2e · **Priority:** P1 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở màn 1 → đi 4 nước đầu của lời giải tối ưu
- **Mong đợi:** lúc mở 0 chấm; sau 4 nước đúng 4 chấm, nằm trên 4 ô nhân vật vừa rời (theo mô hình của suite), độ mờ tăng dần từ chấm cũ tới chấm mới, không chấm nào quá 0.28
- **Automated:** `tests/e2e/play/trail.e2e.ts`

### TC-PLAY-014 — vệt chỉ giữ 12 ô gần nhất: sau hơn 12 bước còn đúng 11 chấm cộng ô đang đứng

- **Requirement:** REQ-PLAY-09
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** mở màn 1 → đi lời giải tối ưu trừ nước cuối (hơn 12 bước, màn chưa thắng)
- **Mong đợi:** đúng 11 chấm, là 11 ô vừa rời gần nhất; chấm cũ nhất vẫn còn hiện (độ mờ > 0)
- **Automated:** `tests/e2e/play/trail.e2e.ts`

### TC-PLAY-015 — hoàn tác xoá chấm mới nhất, chơi lại xoá cả vệt

- **Requirement:** REQ-PLAY-09
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** mở màn 1 → đi 5 nước → `Z` → bấm `Chơi lại`
- **Mong đợi:** sau `Z` vệt bằng đúng vệt của 4 nước đầu; sau `Chơi lại` không còn chấm nào
- **Automated:** `tests/e2e/play/trail.e2e.ts`
