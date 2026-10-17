# UNDO — Bug log

## Đang mở

| Bug | Mức | TC | Tóm tắt |
|---|---|---|---|
| [BUG-UNDO-01](#bug-undo-01) | Thấp | TC-UNDO-010 | Sau "Chơi lại", đồng hồ HUD giữ thời gian ván cũ tới nhịp giây kế tiếp |

### BUG-UNDO-01

- **TC:** TC-UNDO-010 · **Requirement:** REQ-UNDO-05
- **Bước tái hiện:** mở màn 1 → đi một nước → chờ vài giây (HUD `00:03`) → bấm `Chơi lại` (hoặc `R`).
- **Mong đợi:** HUD `Bước 0 · Đẩy 0 · 00:00` ngay sau cú bấm (US-02: "Chơi lại đưa bàn cờ về đúng trạng thái đầu,
  đồng hồ reset").
- **Thực tế:** bộ đếm về 0 nhưng thời gian vẫn `00:03` tới khi `setInterval` 1 giây kế tiếp chạy.
  `client/src/hooks/useElapsedTime.ts` giữ `running` trong state và chỉ cập nhật trong interval; effect chạy lại theo
  `session` mới nhưng không đặt lại `running` ngay.
- **Ghi chú:** ghi ngày 2026-10-18 trên bản xuất tĩnh (Windows Chromium); với `page.clock` dừng thì HUD giữ số cũ mãi.

## Đã sửa

_(chưa có)_
