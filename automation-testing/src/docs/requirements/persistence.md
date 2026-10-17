# PERSISTENCE — Lưu tiến độ, ván dở, kỷ lục; storage hỏng hoặc bị chặn

- **REQ-PERSISTENCE-01** Ván đang dở sống qua đóng tab / tải lại: trang chủ hiện thẻ `Đang chơi dở` (tên màn · bậc, số bước · số đẩy · thời gian); bấm vào thì bàn cờ trở lại **đúng** trạng thái đang dở, kể cả lịch sử hoàn tác (FR-09, US-05).
- **REQ-PERSISTENCE-02** Màn ngẫu nhiên đang dở cũng mở lại được, sinh lại từ chính seed của nó (FR-09, FR-11).
- **REQ-PERSISTENCE-03** Thắng rồi thì không còn là ván đang dở (FR-09).
- **REQ-PERSISTENCE-04** Kỷ lục sống qua tải lại trang (FR-09, README "Records, progress and the game you left half-finished survive closing the tab").
- **REQ-PERSISTENCE-05** Dữ liệu lưu hỏng, sai hình dạng hoặc khác phiên bản bị bỏ qua và về mặc định — không ném lỗi ra UI, game vẫn chơi được (NFR-DATA-04, NFR-SEC-07, US-05 "Điều gì có thể sai").
- **REQ-PERSISTENCE-06** `localStorage` bị chặn hoặc đầy không làm hỏng ván đang chơi — chỉ mất khả năng nhớ (NFR-REL-04, US-01 / US-05 "Điều gì có thể sai").
- **REQ-PERSISTENCE-07** Thẻ `Đang chơi dở` phản ánh bàn cờ người chơi để lại, không phải một trạng thái họ đã bỏ (FR-09, US-05).
