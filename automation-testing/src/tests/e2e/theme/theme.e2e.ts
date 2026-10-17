import type { Page } from "@playwright/test";
import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { FIRST_LEVEL, STORAGE } from "@/data/test-data";
import type { GamePage } from "@/pages/game.page";

/**
 * Light and dark are told apart by the page's real background, against reference colours measured on the page itself
 * under a light and a dark system with no choice stored - so a token change does not break the suite.
 */
async function references(page: Page, gamePage: GamePage): Promise<{ light: string; dark: string }> {
  await page.emulateMedia({ colorScheme: "light" });
  await gamePage.gotoHome();
  const light = await gamePage.background();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => gamePage.background()).not.toBe(light);
  const dark = await gamePage.background();
  await page.emulateMedia({ colorScheme: "light" });
  return { light, dark };
}

test("mặc định giao diện theo hệ điều hành, và đổi ngay khi hệ đổi", { tag: ["@TC-THEME-001", "@smoke"] }, async ({ page, gamePage }) => {
  const { light, dark } = await references(page, gamePage);
  expect(light).not.toBe(dark);
  await expect(gamePage.themeToggle()).toHaveAccessibleName(copy.theme.toggle(copy.theme.system));
  await expect.poll(() => gamePage.background()).toBe(light);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => gamePage.background()).toBe(dark);
});

test("nút giao diện xoay vòng Theo hệ thống → Nền sáng → Nền tối → Theo hệ thống", { tag: ["@TC-THEME-002", "@smoke"] }, async ({ page, gamePage }) => {
  const { light, dark } = await references(page, gamePage);
  // On a dark system, so the first press visibly changes something.
  await page.emulateMedia({ colorScheme: "dark" });
  const steps = [
    [copy.theme.light, light],
    [copy.theme.dark, dark],
    [copy.theme.system, dark],
  ] as const;
  for (const [label, colour] of steps) {
    await gamePage.themeToggle().click();
    await expect(gamePage.themeToggle()).toHaveAccessibleName(copy.theme.toggle(label));
    await expect(gamePage.themeToggle()).toContainText(label);
    await expect.poll(() => gamePage.background()).toBe(colour);
  }
});

test("lựa chọn rõ ràng thắng hệ điều hành, còn nguyên sau khi tải lại và ở cả màn chơi", { tag: ["@TC-THEME-003", "@smoke"] }, async ({ page, gamePage }) => {
  const { light, dark } = await references(page, gamePage);
  await gamePage.themeToggle().click(); // Nền sáng
  await gamePage.themeToggle().click(); // Nền tối
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await gamePage.levelTile(1).waitFor();
  await expect(gamePage.themeToggle()).toHaveAccessibleName(copy.theme.toggle(copy.theme.dark));
  await expect.poll(() => gamePage.background()).toBe(dark);
  expect(await gamePage.readStorage<{ theme: string }>(STORAGE.settings)).toMatchObject({ theme: "dark" });
  await gamePage.gotoLevel(FIRST_LEVEL);
  await expect.poll(() => gamePage.background()).toBe(dark);
  expect(dark).not.toBe(light);
});

test("bật giảm chuyển động thì nhân vật và thùng không còn chuyển động", { tag: ["@TC-THEME-004"] }, async ({ page, gamePage }) => {
  const durations = () =>
    gamePage.sprites().evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).transitionDuration) * 1000));

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gamePage.gotoLevel(FIRST_LEVEL);
  const normal = await durations();
  expect(normal.length).toBeGreaterThan(0);
  expect(Math.min(...normal)).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(async () => Math.max(...(await durations()))).toBeLessThanOrEqual(0.01);
  // Steps still work, they just land at once.
  await gamePage.press("left");
  expect(await gamePage.counters()).toMatchObject({ moves: 1, pushes: 1 });
});
