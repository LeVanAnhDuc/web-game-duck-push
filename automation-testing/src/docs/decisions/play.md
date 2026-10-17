# PLAY — Quyết định

Đi cặp với `docs/requirements/play.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-01, FR-03, FR-10, FR-16), `docs/01-product/journeys.md` (US-01 +
  "Điều gì có thể sai"), `docs/02-requirements/nfr.md` (NFR-PERF-05, NFR-I18N-03, NFR-A11Y-06/07),
  `docs/03-design/invariants.md` (#17 pack đã kiểm), `docs/decisions/0009-click-a-neighbour-cell-to-step.md`,
  `README.md` §Features "The game itself", "A trail of where you have been", "Built for a phone as much as a keyboard", §Controls.
- **Code:** `client/src/views/Play/` (BackBar, HudStrip, Board, Controls), `client/src/hooks/useKeyboardControls.ts`
  (mũi tên + WASD, `preventDefault` trên mũi tên), `client/src/views/Play/components/TrailDots` +
  `client/src/game/session/session.ts` (`buildTrail`, `TRAIL_LENGTH = 12`), `client/src/lib/boardGeometry.ts` (`stepDirection` chỉ nhận ô kề),
  `client/src/lib/boardLabel.ts` (mô tả bàn cờ), `client/src/hooks/useElapsedTime.ts` (`mm:ss`).
- **Test đã gom (gợi ý):** `src/tests/e2e/play/moves.e2e.ts` (từ `client/e2e/game.spec.ts`: case "phím mũi tên không
  cuộn trang" → TC-PLAY-008; các case còn lại chuyển sang `win`, `undo`, `persistence`, `random-level`).
- **Quan sát app thật:** bản xuất tĩnh `http://127.0.0.1:3427`, đọc cây accessibility bằng script: bàn cờ là
  `role=img` với `aria-label` "Bàn cờ 11 trên 8. Bạn ở cột 10 hàng 5. Thùng ở cột 9 hàng 5…"; HUD `data-testid=hud-counters`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Vị trí nhân vật/thùng đọc bằng gì? → `aria-label` của bàn cờ (đúng thứ trình đọc màn hình nhận, NFR-A11Y-07),
  không đọc `transform` của sprite. Một thay đổi nội bộ của sprite không được làm đỏ test luật chơi.
- **Q2** "Số đẩy tối ưu đúng" so với cái gì? → Với số đẩy ít nhất do `src/utils/sokoban.ts` (BFS 0-1 độc lập, viết riêng
  cho test) tìm từ XSB của pack — không so với `optimalPushes` trong pack, vì đó là chính con số app hiển thị.
- **Q3** Vị trí để thử "đẩy vào tường / vào thùng khác" lấy ở đâu? → Tìm bằng mô hình trên màn thật (easy-01), không
  dựng màn riêng: app không có cách nạp màn tuỳ ý ngoài pack và seed.
- **Q4** NFR-PERF-05 (một nước hiện trong ≤ 16ms): e2e qua CDP không đo nổi chính xác tới khung hình → ngoài phạm vi.
- **Q5** Vệt đường đi đọc bằng gì? → Chấm vệt là `aria-hidden`, không có trong mô tả bàn cờ và không có test id, nên
  page object (`trail()`) đọc DOM của bàn cờ: chấm là phần tử con có nền `--color-accent`, vị trí suy từ `translate3d`
  (cột × ô, hàng × ô), độ mờ từ `style.opacity`. Không thêm test id vào app trong PR test.
- **Q6** "Your last twelve steps" là 12 chấm hay 12 ô? → 12 ô tính cả ô đang đứng (`TRAIL_LENGTH = 12`, chấm dưới chân
  nhân vật không vẽ) → tối đa **11 chấm**. Theo code đã ship và glossary ("12 ô gần nhất người chơi đã qua").
- **Q7** Tắt vệt (`settings.showTrail`)? → Không có nút nào trong UI để tắt; cờ chỉ nằm trong `localStorage` → ngoài
  phạm vi e2e, unit test của client (`settingsRepository.test.ts`) đã giữ phần lưu cờ.

## Tài khoản test

Không có — game không có tài khoản.

## Ngoài phạm vi

- NFR-PERF-05 (Q4). Ô chết / thùng kẹt → module `deadlock`. Hoàn tác → `undo`. Thắng → `win`. Vuốt, D-pad → `touch`.

## Tech debt liên quan

Không có.
