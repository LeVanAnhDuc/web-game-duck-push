# PERSISTENCE — Bug log

## Đang mở

| Bug | Mức | TC | Tóm tắt |
|---|---|---|---|
| [BUG-PERSISTENCE-01](#bug-persistence-01) | Thấp | TC-PERSISTENCE-009 | Sau "Chơi lại" mà chưa đi nước nào, thẻ "Đang chơi dở" vẫn mở lại ván cũ |

### BUG-PERSISTENCE-01

- **TC:** TC-PERSISTENCE-009 · **Requirement:** REQ-PERSISTENCE-07
- **Bước tái hiện:** mở màn 1 → `← ↑ ←` → bấm `Chơi lại` → bấm `Về trang chủ` (hoặc đóng tab rồi mở lại).
- **Mong đợi:** không có thẻ ván dở, hoặc thẻ ghi `0 bước` — người chơi đã bỏ ván cũ (US-05: mở lại "đúng trạng thái đang dở").
- **Thực tế:** thẻ ghi `Màn 1 · Dễ — 3 bước · 1 đẩy`; bấm vào thì bàn cờ quay về ván đã bỏ. `client/src/hooks/useSokobanGame.ts`
  bỏ qua việc lưu khi `session.moves === 0`, nên bản lưu cũ không bị xoá hay thay. Hoàn tác về 0 nước cũng vậy.
- **Ghi chú:** ghi ngày 2026-10-18 trên bản xuất tĩnh.

## Đã sửa

_(chưa có)_
