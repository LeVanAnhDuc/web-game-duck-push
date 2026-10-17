# RANDOMLEVEL — Quyết định

Đi cặp với `docs/requirements/random-level.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-08, FR-11), `docs/01-product/journeys.md` (US-03 + "Điều gì có thể
  sai"), `docs/02-requirements/nfr.md` (NFR-PERF-06/08, NFR-REL-03, NFR-SEC-07), `docs/decisions/0003-hybrid-level-generation.md`,
  `docs/decisions/0008-random-level-id-prefix.md`, `docs/specs/ux-feedback-2026-09/design.md` (F-06 seed ở dòng phụ),
  `README.md` §Features "Levels that never run out".
- **Code:** `client/src/views/Home/components/RandomLevelButton/index.tsx`, `client/src/game/workers/generatorClient.ts`
  (worker + đường lui trên luồng chính), `client/src/hooks/levelRouting.ts` (`parseBootTarget`: seed phải là số nguyên ≥ 0),
  `client/src/lib/levelText.ts` (`levelSubtitle`).
- **Test đã gom (gợi ý):** "sinh một màn ngẫu nhiên mà không đóng băng trang" → TC-RANDOMLEVEL-001/006; "đường dẫn có seed
  hỏng…" → TC-RANDOMLEVEL-005 (cả hai từ `client/e2e/game.spec.ts`).
- **Quan sát app thật:** sinh màn qua URL mất 44–116 ms ở cả bốn bậc trên Windows Chromium; worker là chunk
  `turbopack-worker-*.js`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** NFR-PERF-06 (p95 ≤ 1,5 s) kiểm ở e2e thế nào? → e2e chỉ kiểm **trần cứng** 2,5 s mỗi bậc (một lần đo, có mạng
  và vẽ); p95 cần nhiều mẫu trong Worker — để unit test / đo của app.
- **Q2** `?seed=` rỗng: code đọc `Number("") = 0` → mở màn seed 0. Không nổ, không trắng trang, tái tạo được — coi là
  hợp lệ, không thuộc "seed hỏng". Case negative dùng chữ, số âm, số lẻ và `1e3x`.
- **Q3** "Đúng màn đó ở máy khác" chứng minh bằng gì? → Mô tả bàn cờ (người, thùng, đích) + dòng `Tối ưu` giống hệt trong
  một browser context mới không chung storage/cache.
- **Q4** Màn ngẫu nhiên có thật sự giải được, đúng số tối ưu? → Không đọc được tường từ UI nên e2e không giải độc lập được;
  phủ bởi unit test của generator/solver trong `client/`. Ngoài phạm vi e2e.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Q4. Sinh quá ngưỡng thì hạ chuẩn — không ép được generator chậm từ trình duyệt.

## Tech debt liên quan

Không có.
