# Kế hoạch · ducker-id-sign-in

Kế hoạch dùng chung: `web-game/docs/superpowers/plans/2026-10-04-ducker-id-sign-in.md` (kèm amendment 1–4).

- [x] Task 0 — worktree `feat/ducker-id-sign-in`, baseline
- [x] Task 1 — env + base path (`NEXT_PUBLIC_BASE_PATH` thay `GITHUB_PAGES`), `readDuckerConfig`
- [x] Task 2 — lõi auth: PKCE, callback, requests, session store
- [x] Task 3 — UI: `AccountButton`, hooks, gắn vào header trang chủ
- [x] Task 4 — e2e (cờ bật với issuer giả, cờ tắt không request ngoài)
- [x] Task 5 — docs: ADR-0010, Non-Goal, NFR, FR-17/US-06, README
- [x] Amendment 1–4 — returnTo khi lỗi, timeout, focus, bấm đúp, bfcache, Safari focusout, kiểm hình dạng userinfo
- [ ] Task 6 — gate, push, PR (không merge)
