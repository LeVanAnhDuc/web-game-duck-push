import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL } from "@/data/test-data";
import { findSequence, isCornerDead, play, solve, type Direction } from "@/utils/sokoban";

const level = packLevel(FIRST_LEVEL);

/** The shortest key sequence that pushes `count` crates onto non-goal corners - squares no crate ever leaves. */
function intoCorners(count: number): Direction[] {
  const moves = findSequence(level.level, level.start, (_before, _direction, after) =>
    after.pushed && after.state.boxes.filter((b) => isCornerDead(level.level, b)).length === count,
  );
  if (!moves) throw new Error(`no way to corner ${count} crate(s) in ${FIRST_LEVEL}`);
  return moves;
}

test("đẩy thùng vào góc không phải đích thì hiện dải cảnh báo kèm nút hoàn tác", { tag: ["@TC-DEADLOCK-001", "@smoke"] }, async ({ gamePage }) => {
  const moves = intoCorners(1);
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(moves.slice(0, -1));
  await expect(gamePage.deadlockBanner()).toHaveCount(0);
  await gamePage.press(moves.at(-1)!);
  await expect(gamePage.deadlockBanner()).toBeVisible();
  await expect(gamePage.deadlockBanner()).toContainText(copy.play.stuckOne);
  await expect(gamePage.deadlockUndo()).toBeEnabled();
});

test("nút hoàn tác trên dải gỡ đúng cú đẩy vừa rồi và dải biến mất", { tag: ["@TC-DEADLOCK-002", "@smoke"] }, async ({ gamePage }) => {
  const moves = intoCorners(1);
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(moves);
  await gamePage.deadlockUndo().click();
  await expect(gamePage.deadlockBanner()).toHaveCount(0);
  const back = play(level.level, level.start, moves.slice(0, -1));
  expect(await gamePage.counters()).toMatchObject({ moves: back.moves, pushes: back.pushes });
});

test("cảnh báo là một dải, không phải hộp thoại: nút Hoàn tác của hàng điều khiển vẫn thấy và bấm được", { tag: ["@TC-DEADLOCK-003"] }, async ({ page, gamePage }) => {
  const moves = intoCorners(1);
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(moves);
  await expect(gamePage.deadlockBanner()).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const controlUndo = gamePage.undoButton();
  await expect(controlUndo).toBeVisible();
  // Nothing sits on top of the control row's Undo: the element at its centre is the button itself.
  const box = (await controlUndo.boundingBox())!;
  const onTop = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.textContent ?? "",
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  expect(onTop).toContain(copy.play.undo);
  await controlUndo.click();
  await expect(gamePage.deadlockBanner()).toHaveCount(0);
});

test("cảnh báo kẹt được báo qua vùng thông báo cho trình đọc màn hình", { tag: ["@TC-DEADLOCK-004"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(intoCorners(1));
  await expect(gamePage.liveRegion()).toHaveText(copy.play.announceStuck);
});

test("hai thùng cùng kẹt thì dải nói số thùng kẹt", { tag: ["@TC-DEADLOCK-005"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(intoCorners(2));
  await expect(gamePage.deadlockBanner()).toContainText(copy.play.stuckMany(2));
});

test("đi trọn lời giải tối ưu của năm màn Dễ đầu không một lần báo kẹt nhầm", { tag: ["@TC-DEADLOCK-006", "@smoke"] }, async ({ gamePage }) => {
  for (const id of ["easy-01", "easy-02", "easy-03", "easy-04", "easy-05"]) {
    const target = packLevel(id);
    const best = solve(target.level, target.start)!;
    await gamePage.gotoLevel(id);
    for (const direction of best.moves) {
      await gamePage.press(direction);
      // Every position on an optimal line can still be won: a warning here would tell the player to throw it away.
      await expect(gamePage.deadlockBanner(), `${id}: false alarm`).toHaveCount(0);
    }
    await expect(gamePage.win.dialog()).toBeVisible();
  }
});
