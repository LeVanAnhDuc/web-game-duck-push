# CAMPAIGN — Test cases

Requirement: `docs/requirements/campaign.md` · quyết định: `docs/decisions/campaign.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-CAMPAIGN-001 — trang chủ mở ra bậc Dễ với 20 màn, không màn nào bị khoá

- **Requirement:** REQ-CAMPAIGN-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `./` trên trình duyệt sạch
- **Mong đợi:** `Dễ` `aria-pressed=true`; 20 ô `Màn n, chưa giải`, ô nào cũng bấm được
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`

### TC-CAMPAIGN-002 — đổi bậc khó đổi lưới màn và nhãn nút màn ngẫu nhiên

- **Requirement:** REQ-CAMPAIGN-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** bấm `Vừa` → `Khó` → `Rất khó` → `Dễ`
- **Mong đợi:** 20 / 15 / 10 / 20 ô; nút đang chọn `aria-pressed=true`; nút ngẫu nhiên `Màn ngẫu nhiên · <bậc>`
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`

### TC-CAMPAIGN-003 — bấm một ô mở đúng màn đó, có mã màn và bậc khó trên URL

- **Requirement:** REQ-CAMPAIGN-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** bấm ô 3 (Dễ) → về → bậc `Khó` → ô 2
- **Mong đợi:** `Màn 3`, `Dễ · Chiến dịch`, URL `?level=easy-03&d=easy`; rồi `Khó · Chiến dịch`, `?level=hard-02&d=hard`
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`

### TC-CAMPAIGN-004 — nút Về trang chủ quay lại lưới màn và xoá mã màn khỏi URL

- **Requirement:** REQ-CAMPAIGN-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** mở `easy-02` → `Về trang chủ`
- **Mong đợi:** lưới màn hiện; URL không còn query
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`

### TC-CAMPAIGN-005 — mở thẳng đường dẫn có mã màn thì vào ngay màn đó

- **Requirement:** REQ-CAMPAIGN-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** mở `./?level=medium-07&d=medium`
- **Mong đợi:** `Màn 7`, `Vừa · Chiến dịch`
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`

### TC-CAMPAIGN-006 — mã màn không có trong chiến dịch thì về trang chủ với lời nhắn đọc được

- **Requirement:** REQ-CAMPAIGN-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** mở `./?level=easy-99&d=easy`
- **Mong đợi:** trang chủ, lời nhắn `Không mở được màn easy-99…`, URL sạch
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`

### TC-CAMPAIGN-007 — đường dẫn thiếu bậc khó hợp lệ thì về trang chủ với lời nhắn đọc được

- **Requirement:** REQ-CAMPAIGN-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** mở `?level=easy-01`, `&d=impossible`, `&d=EASY`
- **Mong đợi:** mỗi lần: `Đường dẫn thiếu bậc khó hợp lệ nên mình mở trang chủ.`
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`

### TC-CAMPAIGN-008 — ô màn đã giải có dấu tích và kỷ lục, đạt tối ưu có dấu sao, chú giải nói rõ hai ký hiệu

- **Requirement:** REQ-CAMPAIGN-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** kỷ lục: easy-01 7 đẩy (tối ưu), easy-02 9 đẩy
- **Bước:** mở trang chủ
- **Mong đợi:** ô 1 `…đạt số đẩy tối ưu, kỷ lục 7 đẩy` + sao; ô 2 `…kỷ lục 9 đẩy` + dấu tích; ô 3 không dấu; chú giải `đã giải`, `đạt đúng số đẩy tối ưu`
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`

### TC-CAMPAIGN-009 — tải pack màn hỏng thì nói ra bằng chữ và nút Thử lại tải được lại

- **Requirement:** REQ-CAMPAIGN-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** trang chủ → chặn mọi chunk JS → bấm `Vừa` → bỏ chặn → `Thử lại`
- **Mong đợi:** khung `Chưa tải được danh sách màn` (`role=alert`); sau `Thử lại` lưới 20 màn
- **Automated:** `tests/e2e/campaign/level-grid.e2e.ts`
