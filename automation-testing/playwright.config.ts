import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { resolveEnv } from "@/config/env";
import { buildGrepInvert } from "@/config/env-guard";
import { findUrls } from "@/config/urls";

const env = resolveEnv(process.env.ENV);
const includeFull = process.env.FULL === "1";
const isDev = env === "dev";
const grepInvert = buildGrepInvert(env, includeFull);
// Page objects navigate with "./…": GitHub Pages serves the game under /web-game-duck-push/, so the baseURL keeps its
// path and ends with "/" (a leading "/" would drop the path). undefined on an env without a host.
const webUrl = findUrls(env)?.webUrl;
const baseURL = webUrl ? `${webUrl}/` : undefined;

// Dev runs against the STATIC EXPORT of ../client, not `next dev`: that is what GitHub Pages serves.
// ../client/scripts/e2e-serve.mjs builds two exports and serves both: Ducker ID sign-in OFF on :3427 (the deployed
// build, every module) and ON against the fake issuer http://ducker.test on :3428 (the ducker-id sign-in spec only).
// CLIENT_PREBUILT=1 serves the exports already in ../client/.e2e/ instead of building them again.
const AUTH_PORT = 3428;
const AUTH_URL = `http://127.0.0.1:${AUTH_PORT}/`;

const TOUCH = /e2e\/touch\/.*\.e2e\.ts$/;
const SIGN_IN = /e2e\/ducker-id\/sign-in\.e2e\.ts$/;

export default defineConfig({
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // "app" first: the playwright-test MCP server (agents) treats the first project as primary.
  // Variants are extra projects named "app-<variant>"; package.json runs --project="app*".
  projects: [
    {
      name: "app",
      testDir: "./src/tests",
      testMatch: [/e2e\/.*\.e2e\.ts$/, /api\/.*\.api\.ts$/, /seed\.spec\.ts$/],
      testIgnore: [TOUCH, SIGN_IN],
      grepInvert,
      use: { ...devices["Desktop Chrome"], baseURL },
    },
    // A real touch screen: the D-pad is drawn only under `pointer: coarse`, and swipes are touch events.
    {
      name: "app-touch",
      testDir: "./src/tests",
      testMatch: TOUCH,
      grepInvert,
      use: { ...devices["Pixel 5"], baseURL },
    },
    // Ducker ID sign-in against the flag-on export. Only dev has one: the deployed build ships with the flag off.
    ...(isDev
      ? [
          {
            name: "app-auth",
            testDir: "./src/tests",
            testMatch: SIGN_IN,
            grepInvert,
            use: { ...devices["Desktop Chrome"], baseURL: AUTH_URL },
          },
        ]
      : []),
    // One-off data setup (pnpm provision), never part of a normal run.
    {
      name: "provision",
      testDir: "./src/tests/setup",
      testMatch: /.*\.setup\.ts$/,
      workers: 1,
      use: { baseURL },
    },
    { name: "unit", testDir: "./src", testMatch: /.*\.test\.ts$/ },
  ],
  // Boots the game itself on dev. The script builds both exports first (unless CLIENT_PREBUILT=1) and only then starts
  // both servers, so waiting for the flag-on port means both are up.
  webServer:
    isDev && !process.argv.includes("--project=unit")
      ? {
          command: "cd ../client && node scripts/e2e-serve.mjs",
          url: AUTH_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 600_000,
        }
      : undefined,
});
