import { devices } from "@playwright/test";
import { expect, test } from "@/fixtures";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL, SWIPE_THRESHOLD } from "@/data/test-data";
import { play, squareOf, type Direction } from "@/utils/sokoban";

// Runs in the app-touch project (Pixel 5: pointer coarse, real touch events).
const level = packLevel(FIRST_LEVEL);
const playerAfter = (moves: readonly Direction[]) => squareOf(level.level, play(level.level, level.start, moves).state.player);
const DIRECTIONS: readonly Direction[] = ["up", "left", "right", "down"];

test("trên màn hình cảm ứng có D-pad bốn hướng có nhãn, không có dòng nhắc phím", { tag: ["@TC-TOUCH-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  for (const direction of DIRECTIONS) await expect(gamePage.dpad(direction)).toBeVisible();
  await expect(gamePage.keyHint()).toHaveCount(0);
});

test("chạm D-pad đi đúng hướng, kể cả đẩy thùng", { tag: ["@TC-TOUCH-002", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.dpad("up").tap();
  expect((await gamePage.reading()).player).toEqual(playerAfter(["up"]));
  await gamePage.dpad("down").tap();
  await gamePage.dpad("left").tap();
  expect((await gamePage.reading()).player).toEqual(playerAfter(["up", "down", "left"]));
  expect(await gamePage.counters()).toMatchObject({ moves: 3, pushes: 1 });
});

test("vuốt trên bàn cờ đi một bước theo hướng vuốt; vuốt chéo theo trục lệch nhiều hơn", { tag: ["@TC-TOUCH-003", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.swipe(0, -80);
  expect((await gamePage.reading()).player).toEqual(playerAfter(["up"]));
  // Mostly down, a little sideways: one step down.
  await gamePage.swipe(20, 90);
  expect((await gamePage.reading()).player).toEqual(playerAfter(["up", "down"]));
  await gamePage.swipe(-90, 10);
  expect((await gamePage.reading()).player).toEqual(playerAfter(["up", "down", "left"]));
  expect(await gamePage.counters()).toMatchObject({ moves: 3, pushes: 1 });
});

test("vuốt ngắn hơn ngưỡng 24px không đi", { tag: ["@TC-TOUCH-004"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  const before = await gamePage.reading();
  await gamePage.swipe(0, -(SWIPE_THRESHOLD - 6));
  await gamePage.swipe(SWIPE_THRESHOLD - 6, 0);
  expect((await gamePage.reading()).label).toBe(before.label);
  expect(await gamePage.counters()).toMatchObject({ moves: 0 });
  await gamePage.swipe(0, -(SWIPE_THRESHOLD + 6));
  expect((await gamePage.reading()).player).toEqual(playerAfter(["up"]));
});

test("phím D-pad và nút điều khiển đủ lớn cho ngón tay (≥ 44×44px)", { tag: ["@TC-TOUCH-005"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  for (const target of [
    ...DIRECTIONS.map((d) => gamePage.dpad(d)),
    gamePage.undoButton(),
    gamePage.redoButton(),
    gamePage.restartButton(),
    gamePage.backButton(),
  ]) {
    const box = (await target.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("chạm vào ô kề nhân vật cũng đi một bước", { tag: ["@TC-TOUCH-006"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  const start = playerAfter([]);
  await gamePage.tapSquare({ column: start.column, row: start.row - 1 });
  expect((await gamePage.reading()).player).toEqual(playerAfter(["up"]));
});

test.describe("máy có chuột", () => {
  const { defaultBrowserType: _browser, ...desktop } = devices["Desktop Chrome"];
  test.use(desktop);

  test("máy có chuột không có D-pad, chỉ có dòng nhắc bấm ô và phím", { tag: ["@TC-TOUCH-007"] }, async ({ gamePage }) => {
    await gamePage.gotoLevel(FIRST_LEVEL);
    await expect(gamePage.keyHint()).toBeVisible();
    for (const direction of DIRECTIONS) await expect(gamePage.dpad(direction)).toHaveCount(0);
  });
});
