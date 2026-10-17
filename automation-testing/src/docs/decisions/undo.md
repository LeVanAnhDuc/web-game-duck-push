# UNDO — Quyết định

Đi cặp với `docs/requirements/undo.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-02), `docs/01-product/journeys.md` (US-02 + "Điều gì có thể sai"),
  `docs/03-design/invariants.md` (#11 `LevelState` bất biến, #13 undo là lùi lịch sử), `README.md` §Features "Undo and
  redo step through the history you actually played", §Controls.
- **Code:** `client/src/game/session/session.ts` (`undo` khôi phục `entry.before`, `redo`, `restart` = `createSession`
  mới), `client/src/hooks/useKeyboardControls.ts` (`Z`, `Ctrl+Z`, `Shift+Z`, `Y`, `R`),
  `client/src/views/Play/components/Controls/index.tsx`, `client/src/hooks/useElapsedTime.ts`.
- **Test đã gom (gợi ý):** "hoàn tác lùi đúng một nước và trả bộ đếm về chỗ cũ" trong `client/e2e/game.spec.ts` → TC-UNDO-001.
- **Quan sát app thật:** bấm `R` sau 3,5 giây chơi bằng đồng hồ thật — HUD hiện `Bước 0 · Đẩy 0 · 00:03` thêm khoảng một
  giây rồi mới về `00:01`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Phím làm lại nào là hợp đồng? → README chỉ nói "undo and redo"; code nhận `Y` và `Ctrl+Shift+Z` (quy ước
  Windows/Linux, chú thích trong `useKeyboardControls.ts`). Cả hai và nút `Làm lại` đều thành TC.
- **Q2** "Chơi lại … đồng hồ reset" (US-02) có nghĩa là HUD về `00:00` **ngay**? → Có: HUD là một khối, hiện `Bước 0`
  cạnh thời gian của ván cũ là hiển thị sai. App đang để HUD giữ số cũ tới nhịp giây kế tiếp (`useElapsedTime` chỉ cập
  nhật trong `setInterval`) → **bug** BUG-UNDO-01 (TC-UNDO-010 `test.fail()`). Không sửa code game ở PR này.
- **Q3** Chơi lại có hoàn tác được không? → Docs không nói; code dựng session mới (mất lịch sử). Không viết thành
  requirement — TC-UNDO-009 chỉ kiểm `Hoàn tác` khoá ngay sau Chơi lại, đúng với "về đầu màn".

## Tài khoản test

Không có.

## Ngoài phạm vi

- Hoàn tác sau khi thắng (mở lại ván) → module `win`. Nút hoàn tác trong dải bế tắc → `deadlock`.

## Tech debt liên quan

Không có.
