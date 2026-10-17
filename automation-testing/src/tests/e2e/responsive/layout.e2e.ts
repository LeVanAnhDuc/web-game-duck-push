import type { Page } from "@playwright/test";
import { expect, test } from "@/fixtures";
import { pack } from "@/data/levels";
import { FIRST_LEVEL } from "@/data/test-data";
import type { GamePage } from "@/pages/game.page";
import { findSequence, isCornerDead, parseXsb } from "@/utils/sokoban";

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const;

// The biggest board in the committed packs (by squares): the hardest one to fit.
const BIGGEST = [...pack("hard"), ...pack("expert")]
  .map((l) => ({ id: l.id, squares: Math.max(...l.xsb.map((r) => r.length)) * l.xsb.length }))
  .sort((a, b) => b.squares - a.squares)[0]!.id;

async function overflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    return { x: Math.max(0, root.scrollWidth - root.clientWidth), y: Math.max(0, root.scrollHeight - root.clientHeight) };
  });
}

async function boardInsideViewport(page: Page, gamePage: GamePage) {
  const box = (await gamePage.board().boundingBox())!;
  const viewport = page.viewportSize()!;
  return box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height;
}

test("trang chủ không cuộn ngang ở mọi bề ngang từ 320 tới 1440px", { tag: ["@TC-RESPONSIVE-001", "@smoke"] }, async ({ page, gamePage }) => {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await gamePage.gotoHome();
    expect((await overflow(page)).x, `${viewport.width}px`).toBe(0);
  }
});

test("bàn cờ lớn nhất nằm trọn trong màn hình và trang chơi không cuộn, ở mọi bề ngang", { tag: ["@TC-RESPONSIVE-002", "@smoke"] }, async ({ page, gamePage }) => {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await gamePage.gotoLevel(BIGGEST);
    expect(await boardInsideViewport(page, gamePage), `${viewport.width}px`).toBe(true);
    expect(await overflow(page), `${viewport.width}px`).toEqual({ x: 0, y: 0 });
    await expect(gamePage.restartButton()).toBeInViewport();
  }
});

test("ô bàn cờ không nhỏ hơn 24px ở màn hẹp nhất và không to quá 56px ở màn rộng", { tag: ["@TC-RESPONSIVE-003"] }, async ({ page, gamePage }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await gamePage.gotoLevel(BIGGEST);
  expect(await gamePage.cellSize()).toBeGreaterThanOrEqual(24);
  await page.setViewportSize({ width: 1440, height: 900 });
  await gamePage.gotoLevel(FIRST_LEVEL);
  await expect.poll(() => gamePage.cellSize()).toBeLessThanOrEqual(56);
  expect(await gamePage.cellSize()).toBeGreaterThan(40);
});

test("xoay / đổi cỡ cửa sổ giữa ván thì bàn cờ co lại cho vừa, ván giữ nguyên", { tag: ["@TC-RESPONSIVE-004"] }, async ({ page, gamePage }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gamePage.gotoLevel(BIGGEST);
  await gamePage.play(["up", "left"]);
  const before = await gamePage.reading();
  const wide = await gamePage.cellSize();
  await page.setViewportSize({ width: 375, height: 667 });
  await expect.poll(() => gamePage.cellSize()).toBeLessThan(wide);
  expect(await boardInsideViewport(page, gamePage)).toBe(true);
  expect((await gamePage.reading()).label).toBe(before.label);
});

test("dải cảnh báo kẹt hiện ra mà hàng nút điều khiển vẫn nằm trong màn hình 375px", { tag: ["@TC-RESPONSIVE-005"] }, async ({ page, gamePage }) => {
  const first = pack("easy").find((l) => l.id === FIRST_LEVEL)!;
  const { level, start } = parseXsb(first.xsb);
  const moves = findSequence(level, start, (_b, _d, after) => after.pushed && after.state.boxes.some((b) => isCornerDead(level, b)))!;
  await page.setViewportSize({ width: 375, height: 667 });
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(moves);
  await expect(gamePage.deadlockBanner()).toBeInViewport();
  await expect(gamePage.undoButton()).toBeInViewport();
  await expect(gamePage.restartButton()).toBeInViewport();
  expect(await boardInsideViewport(page, gamePage)).toBe(true);
  expect(await overflow(page)).toEqual({ x: 0, y: 0 });
});
