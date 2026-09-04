# Design System Master File — Sokoban

> **LOGIC:** When building a specific page, first check `pages/[page-name].md`.
> If that file exists, its rules **override** this Master file. Otherwise follow the rules below.

**Project:** Sokoban · **Category:** Puzzle game (grid, turn-based)
**Bootstrapped:** 2026-09-04 · `ui-ux-pro-max --design-system` → constraints, `frontend-design` → choices
**Decision record:** [ADR-0001](../../decisions/0001-design-tokens.md)

---

## What step 1 proposed and what was overridden

`ui-ux-pro-max` returned the catalog pick for "arcade & retro game": **Pixel Art** style,
**Press Start 2P / VT323**, neon red `#DC2626` + blue `#2563EB` + green `#22C55E` on
slate `#0F172A`. That is the templated default for the whole category, and two parts of
it are outright broken for this product:

| Overridden | Why |
| --- | --- |
| Press Start 2P as heading font | **Has no `vietnamese` subset on Google Fonts** (verified 2026-09-04 by fetching the css2 API with a browser UA: 0 vietnamese blocks). All UI copy here is Vietnamese, so every diacritic would fall back to another family. Also unreadable at the 12–14px used by HUD labels. |
| Neon red `#DC2626` as primary | Red is the deadlock warning in this game. A warning that shares the brand colour stops registering as a warning. |
| Pixel Art / 8-bit direction | Sokoban is a slow, cerebral puzzle about spatial reasoning and undo — not a twitch arcade game. The tactile warehouse-crate direction below tells the truth about the game. |

Retained from step 1, **not overridable**: contrast floors, 44px touch targets, visible
focus, `prefers-reduced-motion`, the anti-patterns list, the pre-delivery checklist.

---

## Global Rules

### Color Palette — light (default)

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background | `#F5F1EA` | `--color-background` |
| Foreground | `#1C1917` | `--color-foreground` |
| Surface / Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#1C1917` | `--color-card-foreground` |
| Muted Foreground | `#57534E` | `--color-muted-foreground` |
| Border | `#E0D9CC` | `--color-border` |
| Primary (crate amber) | `#B45309` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Accent (goal teal) | `#0F766E` | `--color-accent` |
| On Accent | `#FFFFFF` | `--color-on-accent` |
| Destructive (deadlock) | `#B91C1C` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Focus ring | `#0F766E` | `--color-ring` |

### Color Palette — dark

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background | `#1C1917` | `--color-background` |
| Foreground | `#FAFAF9` | `--color-foreground` |
| Surface / Card | `#292524` | `--color-card` |
| Muted Foreground | `#A8A29E` | `--color-muted-foreground` |
| Border | `#44403C` | `--color-border` |
| Primary | `#F59E0B` | `--color-primary` |
| On Primary | `#1C1917` | `--color-on-primary` |
| Accent | `#2DD4BF` | `--color-accent` |
| On Accent | `#1C1917` | `--color-on-accent` |
| Destructive | `#F87171` | `--color-destructive` |
| Focus ring | `#2DD4BF` | `--color-ring` |

### Board tokens — the game's real palette

The board is the entire information channel. These are not decoration; each one is a
game state a player must tell apart at a glance.

| Cell state | Light | Dark | CSS Variable |
|---|---|---|---|
| Floor | `#EDE7DC` | `#6B645C` | `--board-floor` |
| Floor grid line | `#DDD5C7` | `#5A544D` | `--board-line` |
| Wall | `#44403C` | `#0C0A09` | `--board-wall` |
| Goal (empty) | `#0F766E` | `#5EEAD4` | `--board-goal` |
| Crate | `#B45309` | `#FBBF24` | `--board-crate` |
| Crate edge | `#78350F` | `#92400E` | `--board-crate-edge` |
| Crate on goal | `#0F766E` | `#99F6E4` | `--board-crate-done` |
| Crate on goal, edge | `#134E4A` | `#0F766E` | `--board-crate-done-edge` |
| Player | `#312E81` | `#C7D2FE` | `--board-player` |

**Measured contrast** (computed 2026-09-04 with the sRGB WCAG 2.1 formula — rerun before
changing any value):

| Pair | Light | Dark | Floor |
|---|---|---|---|
| foreground / background | 15.53 | 16.74 | 4.5 |
| muted foreground / background | 6.78 | 6.93 | 4.5 |
| on-primary / primary | 5.02 | 8.14 | 4.5 |
| on-accent / accent | 5.47 | — | 4.5 |
| on-destructive / destructive | 6.47 | 6.32 | 4.5 |
| wall / floor | 8.35 | 3.39 | 3.0 |
| crate / floor | 4.08 | 3.49 | 3.0 |
| goal / floor | 4.45 | 3.94 | 3.0 |
| player / floor | 9.28 | 3.91 | 3.0 |
| focus ring / background | 4.86 | — | 3.0 |

**Hard rule — no state is encoded by hue alone.** Crate amber and goal teal sit at nearly
the same luminance (ratio 1.09), so a player with colour vision deficiency cannot separate
them by colour. Every state therefore also differs in **shape**:

- goal (empty) = a ring outline on the floor, never a filled cell
- crate = filled square with a visible edge and a cross-brace
- crate on goal = the same square **plus an inset check glyph**, and the ring disappears
- player = a round-headed figure silhouette, never a square

### Typography

- **Display / UI:** `Space Grotesk` (500, 700) — geometric with enough character to avoid
  reading as a default system stack. Has the `vietnamese` subset.
- **Numerals / HUD / seeds / level codes:** `IBM Plex Mono` (400, 500, 600) —
  **tabular figures**. The step counter changes on every keypress; proportional digits
  make the HUD jitter. Has the `vietnamese` subset.
- Two distinct families, as required. No third family.

```css
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap");
```

| Role | Family | Size / weight |
|---|---|---|
| Screen title | Space Grotesk | 24px / 700 (mobile) · 32px / 700 (≥768px) |
| Section label | Space Grotesk | 13px / 500, letter-spacing 0.08em, uppercase |
| Body / button | Space Grotesk | 16px / 500 |
| HUD numbers | IBM Plex Mono | 20px / 600, `font-variant-numeric: tabular-nums` |
| Meta (seed, level code) | IBM Plex Mono | 13px / 400 |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps |
| `--space-sm` | `8px` | Icon gaps, inline spacing |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Section padding |
| `--space-xl` | `32px` | Large gaps |
| `--space-2xl` | `48px` | Section margins |

Board cell size is **not** a spacing token — it is computed from the viewport so the whole
board fits without scrolling.

### Radius & shadow

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | crates, cells |
| `--radius-md` | `8px` | buttons, inputs |
| `--radius-lg` | `12px` | cards, level tiles |
| `--radius-xl` | `16px` | modals |
| `--shadow-sm` | `0 1px 2px rgba(28,25,23,0.06)` | subtle lift |
| `--shadow-md` | `0 4px 6px rgba(28,25,23,0.10)` | cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(28,25,23,0.12)` | modals |

---

## Signature element — the fading trail

The one thing this game has that other Sokoban clones do not: **the player's last 12 steps
stay on the floor as a trail of dots that fades from `--color-accent` at 28% opacity down
to 0%.** Crates that have moved keep a 1px dashed outline at their starting cell.

It is not decoration — it is the game's own subject made visible. Sokoban is about the path
you took, and undo is about the path you regret. Seeing the trail is what makes "where did
I go wrong" answerable without replaying the level in your head.

Under `prefers-reduced-motion: reduce` the trail renders **static** (no fade animation,
opacity fixed per step index). It is never the only signal for anything.

---

## Motion

Minimal tier. This is a turn-based puzzle; movement must feel instant and exact.

| What | Duration | Easing |
|---|---|---|
| Player / crate cell-to-cell | 120ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Button hover / focus | 150ms | `ease-out` |
| Overlay in | 200ms | `ease-out` |
| Crate seating on a goal | 180ms, scale 1 → 1.06 → 1 | `ease-out` |

No bounce, no spring, no sprite animation. Under `prefers-reduced-motion: reduce` every
duration above becomes `0ms` — state changes are instant and still fully legible.

---

## Component Specs

```css
/* Primary action — "Chơi", "Màn ngẫu nhiên" */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 12px 24px;
  min-height: 44px;
  border-radius: var(--radius-md);
  font-family: "Space Grotesk", system-ui, sans-serif;
  font-weight: 500;
  transition: background-color 150ms ease-out, box-shadow 150ms ease-out;
  cursor: pointer;
}
.btn-primary:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

/* Secondary — "Hoàn tác", "Chơi lại" */
.btn-secondary {
  background: transparent;
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
  padding: 12px 20px;
  min-height: 44px;
  border-radius: var(--radius-md);
  cursor: pointer;
}

/* D-pad key — touch only, never rendered on pointer:fine */
.dpad-key { width: 56px; height: 56px; border-radius: var(--radius-md); }

/* Level tile in the campaign grid */
.level-tile { min-width: 44px; min-height: 44px; border-radius: var(--radius-lg); }

/* Deadlock banner — a static strip, never a modal */
.deadlock-banner {
  background: color-mix(in oklab, var(--color-destructive) 12%, var(--color-background));
  border-left: 3px solid var(--color-destructive);
  color: var(--color-foreground);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
}
```

Cards, inputs and modals inherit the tokens above; no bespoke values.

---

## Screen pattern

Not a landing page — step 1's "Hero-Centric / sticky CTA / value prop strip" pattern does
not apply and is discarded. Two screens:

- **Trang chủ** — resume card → random-level button → campaign grid by difficulty tab.
  Everything above the fold on 375px except the grid's later rows.
- **Bàn chơi** — the board is the largest element at every width and never scrolls.
  Order on mobile: back bar → HUD strip → board → deadlock banner (conditional) → controls.
  Where `pointer: fine`, the D-pad is replaced by a keyboard hint line.

---

## Anti-Patterns (do NOT use)

- ❌ Emojis as icons — use Lucide SVG icons
- ❌ Missing `cursor: pointer` on clickable elements
- ❌ Layout-shifting hovers
- ❌ Text below 4.5:1, board states below 3:1
- ❌ Instant unstyled state changes (except under reduced-motion, where instant is required)
- ❌ Invisible focus states
- ❌ Any board state distinguished by colour alone
- ❌ A modal for the deadlock warning — it blocks the undo the player is reaching for
- ❌ A board that scrolls, or that shrinks below 24px cells at 375px

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (Lucide only)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover and focus transitions 150–300ms
- [ ] Text contrast ≥ 4.5:1, board states ≥ 3:1, both themes
- [ ] Focus visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected — trail static, transitions 0ms
- [ ] Every board state readable in greyscale (shape, not hue)
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] Touch targets ≥ 44×44px
- [ ] No horizontal scroll, no board scroll
