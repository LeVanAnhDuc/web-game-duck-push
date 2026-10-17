# DEPLOY — Quyết định

Đi cặp với `docs/requirements/deploy.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/decisions/0002-static-export-and-dom-board.md`, `docs/decisions/0006-release-and-ci-pipeline.md`,
  `README.md` §Releases and versioning (deploy lên `https://levananhduc.github.io/web-game-duck-push/`).
- **Code:** `client/next.config.ts` (`output: "export"`, `basePath`/`assetPrefix` từ `NEXT_PUBLIC_BASE_PATH`),
  `.github/workflows/deploy.yml` (`NEXT_PUBLIC_BASE_PATH: /<tên repo>`).
- **Chạy thật trên prd:** `ENV=prd pnpm exec playwright test src/tests/e2e/deploy` xanh ngày 2026-10-18 trên GitHub Pages
  (cùng `infra`, `play`, `campaign`) — cũng là bằng chứng page object đi bằng `./` đúng dưới base path.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Hai case chạy nguyên trạng ở dev (gốc) và prd (base path) — không phân nhánh theo môi trường; base path đọc từ
  `baseURL` của project.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Kích thước JS tải lần đầu (NFR-PERF-09) — CI của app in ra sau `pnpm build`, không đo ở e2e.

## Tech debt liên quan

Không có.
