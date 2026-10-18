# PLAY — Luật đi / đẩy, HUD, bàn phím và bấm ô kề

- **REQ-PLAY-01** Mở một màn hiện tên màn, bậc khó, bộ đếm `Bước 0 · Đẩy 0 · 00:00` và dòng `Tối ưu N đẩy · KL bạn …`, trong đó N đúng là số đẩy ít nhất để giải màn (FR-03, README "The HUD shows the optimal push count… from the moment the level opens").
- **REQ-PLAY-02** Đi vào ô trống: nhân vật sang ô đó, `Bước` +1, `Đẩy` giữ nguyên (FR-01).
- **REQ-PLAY-03** Đi vào thùng: thùng bị đẩy đúng một ô cùng hướng, `Bước` +1 và `Đẩy` +1 — hai bộ đếm tách nhau (FR-01, FR-03).
- **REQ-PLAY-04** Thùng không đẩy được vào tường hay vào thùng thứ hai; đi vào tường cũng không đi: bàn cờ và bộ đếm đứng yên (FR-01).
- **REQ-PLAY-05** Bàn phím: bốn phím mũi tên và W/A/S/D đi bốn hướng; phím mũi tên không cuộn trang (FR-10, US-01 "Điều gì có thể sai").
- **REQ-PLAY-06** Bấm vào ô kề nhân vật đi đúng một bước về phía đó (kể cả đẩy thùng); bấm ô không kề hoặc vào chính nhân vật không làm gì — không tự tìm đường (FR-16, ADR-0009).
- **REQ-PLAY-07** Đồng hồ HUD chạy từ lúc mở màn, hiện `mm:ss` (FR-03, NFR-I18N-03).
- **REQ-PLAY-08** Thùng nằm trên đích được mô tả khác thùng thường và được đếm vào số thùng đã xong (FR-01, NFR-A11Y-06/07).
- **REQ-PLAY-09** Vệt đường đi: mỗi bước để lại một chấm mờ trên ô vừa rời, chấm mới đậm hơn chấm cũ; vệt giữ 12 ô gần nhất (11 chấm + ô đang đứng) và đi theo lịch sử — hoàn tác bỏ chấm mới nhất, chơi lại xoá hết (README "A trail of where you have been", glossary "Vệt đường đi", `docs/03-design/architecture.md` bước 4, MASTER.md "Signature element").
