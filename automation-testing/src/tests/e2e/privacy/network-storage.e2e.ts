import { expect, test } from "@/fixtures";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL } from "@/data/test-data";
import type { GamePage } from "@/pages/game.page";
import { solve } from "@/utils/sokoban";

const level = packLevel(FIRST_LEVEL);
const BEST = solve(level.level, level.start)!;

/** One full round: Home, a campaign level played to a win, then a random level from the win dialog. */
async function fullRound(gamePage: GamePage) {
  await gamePage.gotoHome();
  await gamePage.themeToggle().click();
  await gamePage.openTile(1);
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toBeVisible();
  await gamePage.win.random().click();
  await gamePage.levelSubtitle().filter({ hasText: "Seed" }).waitFor();
}

test("một vòng chơi trọn vẹn không gửi request nào ra ngoài site", { tag: ["@TC-PRIVACY-001", "@smoke"] }, async ({ page, gamePage, baseURL }) => {
  const site = new URL(baseURL!).origin;
  const outside: string[] = [];
  page.on("request", (r) => {
    const url = r.url();
    if (!url.startsWith(site) && !url.startsWith("data:") && !url.startsWith("blob:")) outside.push(url);
  });
  await fullRound(gamePage);
  expect(outside).toEqual([]);
});

test("không đặt cookie nào, và localStorage chỉ giữ tiến độ và tuỳ chọn của game", { tag: ["@TC-PRIVACY-002"] }, async ({ page, gamePage }) => {
  await fullRound(gamePage);
  expect(await page.context().cookies()).toEqual([]);
  const keys = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(keys).toEqual(["sokoban:progress:v1", "sokoban:settings:v1"]);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
});

test("mất mạng sau khi màn đã mở thì vẫn chơi tới khi thắng", { tag: ["@TC-PRIVACY-003"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await page.context().setOffline(true);
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toBeVisible();
  await page.context().setOffline(false);
});

test("console không có lỗi trong suốt một vòng chơi", { tag: ["@TC-PRIVACY-004"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await fullRound(gamePage);
  expect(errors).toEqual([]);
});
