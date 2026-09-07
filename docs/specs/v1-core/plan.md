# Kế hoạch thực thi · v1-core

Nhánh `feat/v1-core`, worktree `../web-game-sokoban.worktrees/v1-core`.
Ô đánh dấu là phòng thủ khi ngữ cảnh bị nén giữa chừng — đọc lại file này là biết đang ở đâu.

## 1. Nền

- [x] 1.1 Scaffold Next.js 16 + React 19 + Tailwind v4 + TypeScript strict, `output: "export"`,
      `basePath` theo `GITHUB_PAGES`
- [x] 1.2 Cấu hình Vitest (happy-dom) và Playwright
- [x] 1.3 Token thiết kế vào `globals.css` từ `MASTER.md`, cả hai chế độ sáng/tối
- [x] 1.4 `layout.tsx` nạp Space Grotesk + IBM Plex Mono với subset `vietnamese`

## 2. Lõi luật chơi

- [x] 2.1 `core/types.ts` — hợp đồng kiểu dùng chung
- [x] 2.2 `core/level.ts` — đọc/ghi XSB, `validateState`
- [x] 2.3 `core/rng.ts` — RNG có seed (mulberry32)
- [x] 2.4 `core/rules.ts` — `step`, `isSolved`, `reachableCells`, `findPath`
- [x] 2.5 `core/deadlock.ts` — ô chết tĩnh + thùng đóng băng, **sound** (FR-05)
- [x] 2.6 `core/solver.ts` — A\* không gian đẩy, có ngân sách (ADR-0004)

## 3. Sinh màn (ADR-0003)

- [x] 3.1 `generator/rooms.ts` — thư viện phòng mẫu, ghép bản đồ, kiểm liên thông
- [x] 3.2 `generator/reverse.ts` — đặt thùng bằng đi lùi từ trạng thái thắng
- [x] 3.3 `generator/difficulty.ts` — khuôn 4 bậc, ngân sách build vs runtime
- [x] 3.4 `generator/generate.ts` — điều phối, hạ chuẩn thay vì trả `null`
- [x] 3.5 Sinh pack thật và commit `src/game/levels/data/*.json` (FR-06)
- [x] 3.6 Test chạy lại solver trên toàn pack, đối chiếu `optimalPushes` (bất biến #17)

## 4. Ván chơi và lưu trữ

- [x] 4.1 `session/session.ts` — undo/redo theo lịch sử, bộ đếm, vệt đường đi (FR-02, FR-03)
- [x] 4.2 `storage/safeStorage.ts` — bọc `localStorage`, không bao giờ ném
- [x] 4.3 `storage/progressRepository.ts` — kỷ lục chỉ ghi đè khi tốt hơn (FR-09, US-04)
- [x] 4.4 `storage/settingsRepository.ts` — chủ đề, vệt đường đi, cảnh báo

## 5. Nối vào trình duyệt

- [x] 5.1 `levels/packLoader.ts` — `import()` động theo bậc khó, có validate
- [x] 5.2 `workers/protocol.ts` + `generator.worker.ts` (FR-08, NFR-PERF-08)
- [x] 5.3 `workers/generatorClient.ts` — trần cứng, đường lui khi không có Worker
- [x] 5.4 `scripts/generate-pack.ts` — sinh pack lúc build

## 6. Giao diện

- [x] 6.1 Trang chủ: thẻ đang chơi dở, nút màn ngẫu nhiên, tab bậc, lưới chọn màn (FR-07)
- [x] 6.2 Bàn chơi: bàn cờ DOM tự co theo viewport, mã hoá bằng hình dạng (FR-01, NFR-A11Y-06)
- [x] 6.3 HUD, dải cảnh báo bế tắc, lớp phủ thắng (FR-03, FR-04, FR-05)
- [x] 6.4 Điều khiển: bàn phím + vuốt + D-pad chỉ trên cảm ứng (FR-10)
- [x] 6.5 Chủ đề sáng/tối, `prefers-reduced-motion` (FR-12)
- [x] 6.6 Định tuyến bằng query: `?level=` và `?seed=` (FR-11)

## 7. Kiểm chứng

Mục 7.4 mở rộng so với kế hoạch ban đầu: ngoài workflow deploy còn có `ci.yml` (gác
pull request) và `release.yml` + hai script phát hành, chép từ `web-game-tetris` và
sửa cho Yarn + Next static export — ADR-0006.

- [x] 7.1 `yarn tsc --noEmit`, `yarn lint`, `yarn build` sạch
- [ ] 7.2 E2E: thắng một màn chỉ bằng bàn phím; undo; kỷ lục sống qua reload; bàn không cuộn
- [ ] 7.3 Chụp màn hình 375 / 768 / 1024 / 1440, sáng và tối
- [x] 7.4 Workflow GitHub Pages
- [x] 7.5 README `## Features`

## 8. Đóng

- [ ] 8.1 Cập nhật `scope.md` (FR chuyển `xong`), `backlog.md`
- [ ] 8.2 Commit theo Conventional Commits, mở PR
