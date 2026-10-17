import { expect, test } from "@/fixtures";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL } from "@/data/test-data";
import { play, squareOf } from "@/utils/sokoban";

const level = packLevel(FIRST_LEVEL);
const START = {
  player: squareOf(level.level, level.start.player),
  crates: level.start.boxes.map((b) => squareOf(level.level, b)),
};

test("Z lùi đúng một nước và trả bộ đếm về chỗ cũ", { tag: ["@TC-UNDO-001", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(["up", "down"]);
  const after = play(level.level, level.start, ["up"]);
  await page.keyboard.press("z");
  expect(await gamePage.counters()).toMatchObject({ moves: 1, pushes: 0 });
  expect((await gamePage.reading()).player).toEqual(squareOf(level.level, after.state.player));
  await page.keyboard.press("z");
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
  expect((await gamePage.reading()).player).toEqual(START.player);
});

test("hoàn tác một cú đẩy đưa cả thùng lẫn nhân vật về đúng chỗ cũ", { tag: ["@TC-UNDO-002", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  const before = await gamePage.reading();
  // Push the crate left twice: walking back right would leave the crates where they are (pulling is not pushing).
  await gamePage.play(["left", "left"]);
  expect(await gamePage.counters()).toMatchObject({ pushes: 2 });
  await gamePage.undoButton().click();
  await gamePage.undoButton().click();
  const reading = await gamePage.reading();
  expect(reading.label).toBe(before.label);
  expect(reading.crates).toEqual(START.crates);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
});

test("nút Hoàn tác và Làm lại chỉ bấm được khi có nước để lùi / để đi lại", { tag: ["@TC-UNDO-003"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await expect(gamePage.undoButton()).toBeDisabled();
  await expect(gamePage.redoButton()).toBeDisabled();
  await gamePage.press("up");
  await expect(gamePage.undoButton()).toBeEnabled();
  await expect(gamePage.redoButton()).toBeDisabled();
  await gamePage.undoButton().click();
  await expect(gamePage.undoButton()).toBeDisabled();
  await expect(gamePage.redoButton()).toBeEnabled();
});

test("Ctrl+Z cũng hoàn tác", { tag: ["@TC-UNDO-004"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.press("left");
  await page.keyboard.press("Control+z");
  expect((await gamePage.reading()).crates).toEqual(START.crates);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
});

for (const [how, title, id] of [
  ["y", "Y làm lại nước vừa hoàn tác, kể cả cú đẩy", "@TC-UNDO-005"],
  ["Control+Shift+Z", "Ctrl+Shift+Z làm lại nước vừa hoàn tác", "@TC-UNDO-006"],
  ["button", "nút Làm lại làm lại nước vừa hoàn tác", "@TC-UNDO-007"],
] as const) {
  test(title, { tag: [id] }, async ({ page, gamePage }) => {
    await gamePage.gotoLevel(FIRST_LEVEL);
    await gamePage.press("left");
    const pushed = await gamePage.reading();
    await page.keyboard.press("z");
    if (how === "button") await gamePage.redoButton().click();
    else await page.keyboard.press(how);
    expect((await gamePage.reading()).label).toBe(pushed.label);
    expect(await gamePage.counters()).toMatchObject({ moves: 1, pushes: 1 });
  });
}

test("đi một nước mới sau khi hoàn tác thì nhánh cũ mất, không làm lại được nữa", { tag: ["@TC-UNDO-008"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.press("left");
  await page.keyboard.press("z");
  await gamePage.press("up");
  await expect(gamePage.redoButton()).toBeDisabled();
  const now = await gamePage.reading();
  await page.keyboard.press("y");
  expect((await gamePage.reading()).label).toBe(now.label);
});

test("Chơi lại (nút và phím R) đưa bàn cờ về đầu màn và bộ đếm về 0", { tag: ["@TC-UNDO-009", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  const start = await gamePage.reading();
  await gamePage.play(["left", "up", "left"]);
  await gamePage.restartButton().click();
  expect((await gamePage.reading()).label).toBe(start.label);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
  await expect(gamePage.undoButton()).toBeDisabled();

  await gamePage.play(["left", "up"]);
  await page.keyboard.press("r");
  expect((await gamePage.reading()).label).toBe(start.label);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
});

test("bấm Chơi lại thì đồng hồ HUD về 00:00 ngay, cùng lúc với bộ đếm", { tag: ["@TC-UNDO-010"] }, async ({ page, gamePage }) => {
  // BUG: defects/undo.md#bug-undo-01
  test.fail();
  await page.clock.install();
  await gamePage.gotoLevel(FIRST_LEVEL);
  // Stop time flowing on its own: from here only runFor moves it, so "right away" means "before the next tick".
  await page.clock.pauseAt(Date.now() + 60_000);
  await gamePage.press("up");
  await page.clock.runFor(12_000);
  const before = await gamePage.counters();
  expect(before.time).not.toBe("00:00");
  await gamePage.restartButton().click();
  await expect(gamePage.hud()).toHaveText("Bước 0 · Đẩy 0 · 00:00", { timeout: 2_000 });
});
