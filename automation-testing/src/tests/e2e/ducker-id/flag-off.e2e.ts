import { expect, test } from "@/fixtures";
import { FIRST_LEVEL } from "@/data/test-data";

// ADR-0010: the deployed build ships with the Ducker ID flag off - no button, no menu, no storage, no outside request.
// Runs on the "app" project, i.e. the normal (flag-off) export.

test("cờ tắt thì không có nút đăng nhập, không chạm sessionStorage, không request ra ngoài", { tag: ["@TC-DUCKERID-001", "@smoke"] }, async ({ page, gamePage, baseURL }) => {
  const site = new URL(baseURL!).origin;
  const outside: string[] = [];
  page.on("request", (r) => {
    const url = r.url();
    if (!url.startsWith(site) && !url.startsWith("data:") && !url.startsWith("blob:")) outside.push(url);
  });
  await gamePage.gotoHome();
  await expect(gamePage.randomButton()).toBeVisible();
  await expect(gamePage.account.signInButton()).toHaveCount(0);
  await expect(gamePage.account.trigger()).toHaveCount(0);
  // With the flag off a stray ?code= is not read either: the level still opens and the parameter is left alone.
  await page.goto(`./?level=${FIRST_LEVEL}&d=easy&code=x&state=y`);
  await gamePage.board().waitFor();
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(outside).toEqual([]);
});
