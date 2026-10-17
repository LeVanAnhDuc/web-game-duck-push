// Values the tests share. Level boards come from src/data/levels.ts (the app's committed packs, read as data).

// localStorage keys the game owns: ../client/src/game/storage/types.ts (STORAGE_KEYS, STORAGE_VERSION).
export const STORAGE = {
  progress: "sokoban:progress:v1",
  settings: "sokoban:settings:v1",
  version: 1,
} as const;

// The campaign level most cases play: small, two crates, solvable in a handful of pushes.
export const FIRST_LEVEL = "easy-01";

// Campaign sizes per tier, from the committed packs (README "A campaign of levels across four tiers").
export const TIER_SIZES = { easy: 20, medium: 20, hard: 15, expert: 10 } as const;

// A fixed random-level seed, so a "random" level is the same board every run (FR-11).
export const RANDOM_SEED = 123456789;

// Swipe threshold in CSS px, from ../client/src/hooks/useSwipe.ts (THRESHOLD_PX).
export const SWIPE_THRESHOLD = 24;

// The flag-on e2e export (../client/scripts/e2e-serve.mjs, port 3428) signs in against this fake issuer. It is never
// resolved: the issuer fixture answers every request to it (ADR-0010).
export const DUCKER = {
  issuer: "http://ducker.test",
  profilePath: "/profile",
  user: { sub: "u1", name: "Lê Văn Anh Đức", email: "duc@ducker.id" },
  pkceKey: "ducker.pkce",
} as const;
