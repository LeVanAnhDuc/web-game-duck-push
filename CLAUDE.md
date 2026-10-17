# CLAUDE.md

**Duck Push** — a Sokoban whose every level is machine-generated and solver-verified, Next.js 16
static export served from GitHub Pages (https://levananhduc.github.io/web-game-duck-push/).
No server, no database, no API: everything runs in the browser. The methodology layer (docs
contract, feature flow, hooks) is `.claude/CLAUDE.md`; read it before working.

## Layout

| Folder | Holds |
| --- | --- |
| `client/` | the game app: `package.json`, `pnpm-lock.yaml`, `.env.example`, `src/`, `scripts/`, unit tests (vitest, next to the code) |
| `docs/` | product docs, requirements, ADRs, feature specs — map in `docs/README.md` |
| `.claude/`, `.githooks/`, `.github/`, `cliff.toml` | Claude config, git hooks, CI, release notes config — all at the root |

`.env.example` lives at `client/.env.example` (`.claude/CLAUDE.md` still draws it at the
root — same file, it moved with the app).

## Commands

```bash
cd client
pnpm install --frozen-lockfile
pnpm dev              # http://localhost:3000
pnpm test             # vitest: unit tests, including re-solving every committed level
pnpm typecheck
pnpm lint
pnpm build            # static export to client/out/
pnpm levels:generate  # regenerate the committed level packs (only when the generator changes)
pnpm release:next     # next version, from the commits (git-cliff, repo root)
```

Git hooks: `git config core.hooksPath .githooks` (commit-msg + pre-commit ESLint on staged
`client/` files).
