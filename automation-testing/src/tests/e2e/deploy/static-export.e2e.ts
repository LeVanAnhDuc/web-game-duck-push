import { expect, test } from "@/fixtures";
import { FIRST_LEVEL } from "@/data/test-data";

// Runs unchanged on dev (served at the root) and prd (GitHub Pages under /web-game-duck-push/).

test("trang chủ và màn chơi tải đủ mọi tài nguyên, không request nào hỏng", { tag: ["@TC-DEPLOY-001", "@smoke"] }, async ({ page, gamePage }) => {
  const failed: string[] = [];
  page.on("requestfailed", (r) => failed.push(`${r.url()} ${r.failure()?.errorText ?? ""}`));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  await gamePage.gotoHome();
  await page.waitForLoadState("networkidle");
  await gamePage.chooseDifficulty("expert");
  await expect(gamePage.levelTiles()).not.toHaveCount(0);
  await gamePage.gotoLevel(FIRST_LEVEL);
  await page.waitForLoadState("networkidle");
  expect(failed).toEqual([]);
});

test("mọi request của site nằm dưới base path của nó", { tag: ["@TC-DEPLOY-002"] }, async ({ page, gamePage, baseURL }) => {
  const base = new URL(baseURL!);
  const outsideBase: string[] = [];
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.origin === base.origin && !url.pathname.startsWith(base.pathname)) outsideBase.push(url.pathname);
  });
  await gamePage.gotoHome();
  await gamePage.randomButton().click();
  await gamePage.board().waitFor();
  await page.waitForLoadState("networkidle");
  expect(outsideBase).toEqual([]);
});
