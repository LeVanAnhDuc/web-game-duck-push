# Test đã gom về lúc scaffold

Bộ e2e Playwright cũ của app (`e2e/` ở gốc repo, chạy bằng `playwright.config.ts` → `pnpm test:e2e`; trong commit dời app
nó thành `client/e2e/`) được `git mv` về đây khi dựng `automation-testing/`. Config cũ gộp vào `playwright.config.ts`:
webServer chạy `../client/scripts/e2e-serve.mjs` (hai bản xuất tĩnh: cờ Ducker ID tắt ở :3427, bật ở :3428), project
`app-auth` cho bản bật cờ. Hai project `desktop` / `mobile` (Pixel 5) cũ chạy MỌI spec hai lần; ở đây mỗi điều phụ thuộc
thiết bị nằm trong module của nó (`touch` chạy trên Pixel 5, `responsive` đo nhiều bề ngang).

| Từ | Về | Trạng thái |
|---|---|---|
| `client/e2e/game.spec.ts` | `src/tests/e2e/play/game.e2e.ts` (git mv) | chưa chuẩn hóa |
| `client/e2e/ducker-id-sign-in.spec.ts` | `src/tests/e2e/ducker-id/sign-in.e2e.ts` (git mv); describe "cờ tắt" tách ra `src/tests/e2e/ducker-id/flag-off.e2e.ts` vì nó phải chạy trên bản cờ tắt (project `app`) | chưa chuẩn hóa |
| `client/playwright.config.ts` (2 project desktop/mobile, 1 webServer) | `playwright.config.ts` | gộp |

Sửa tối thiểu khi gom: `game.e2e.ts` từng import solver và parser **của app** (`src/game/core/solver`) để tính lời giải;
nay đọc pack màn bằng `src/data/levels.ts` (dữ liệu) và giải bằng `src/utils/sokoban.ts` (bộ giải độc lập của test).
Đường dẫn `page.goto("/…")` đổi thành `"./…"` để chạy được dưới base path của GitHub Pages.

Unit test (vitest, `client/src/**/*.test.ts(x)`) ở lại `client/`: chúng thuộc về code.

## Còn trỏ về nơi cũ

- `docs/specs/*/plan.md`, `docs/specs/*/design.md`, `docs/decisions/00*.md` — tài liệu lịch sử (đã ship), giữ nguyên văn.
- `docs/04-state/backlog.md` — số liệu "12 e2e xanh" là ảnh chụp trạng thái lúc ghi, không phải luật.
- `docs/README.md`, `docs/decisions/README.md`, `.claude/CLAUDE.md` — đang có thay đổi chưa commit ở bản checkout chính
  nên PR này không sửa; `.claude/CLAUDE.md` vẫn vẽ `.env.example` ở gốc (nay là `client/.env.example`), ghi chú ở
  `CLAUDE.md` gốc.
- `.claude/skills/ux-persona-review/runs/`, `docs/ux-reviews/` — nhật ký phiên cũ.
