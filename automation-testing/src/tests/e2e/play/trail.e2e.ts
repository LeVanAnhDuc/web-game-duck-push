import { expect, test } from "@/fixtures";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL } from "@/data/test-data";
import { play, solve, squareOf, step, type Direction } from "@/utils/sokoban";

// The trail is decoration a screen reader never gets (aria-hidden), so it is read from the board's DOM; where the
// dots should be comes from the suite's own model: one dot on every square the player stepped off, newest last.
const level = packLevel(FIRST_LEVEL);
/** Dots plus the square the player stands on: README "your last twelve steps" (TRAIL_LENGTH in client/src/game/session). */
const TRAIL_CELLS = 12;

/** Squares the player left, in order, for the moves that actually went somewhere; at most the newest 11 are drawn. */
function expectedDots(moves: readonly Direction[]) {
  let state = level.start;
  const left: number[] = [];
  for (const direction of moves) {
    const result = step(level.level, state, direction);
    if (result.moved) left.push(state.player);
    state = result.state;
  }
  return left.slice(-(TRAIL_CELLS - 1)).map((index) => squareOf(level.level, index));
}

/** The optimal line minus its last move, so the level stays unsolved and the board stays in play. */
const line = solve(level.level, level.start)!.moves.slice(0, -1);

test("mở màn chưa có vệt; mỗi bước để lại một chấm trên ô vừa rời, chấm mới đậm hơn chấm cũ", { tag: ["@TC-PLAY-013", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  expect(await gamePage.trail()).toEqual([]);
  const moves = line.slice(0, 4);
  await gamePage.play(moves);
  const trail = await gamePage.trail();
  expect(trail.map((d) => d.square)).toEqual(expectedDots(moves));
  const opacities = trail.map((d) => d.opacity);
  for (let i = 1; i < opacities.length; i += 1) expect(opacities[i]).toBeGreaterThan(opacities[i - 1]!);
  expect(Math.max(...opacities)).toBeLessThanOrEqual(0.28);
});

test("vệt chỉ giữ 12 ô gần nhất: sau hơn 12 bước còn đúng 11 chấm cộng ô đang đứng", { tag: ["@TC-PLAY-014"] }, async ({ gamePage }) => {
  expect(line.length, `${FIRST_LEVEL}'s optimal line is too short to overflow the trail`).toBeGreaterThan(TRAIL_CELLS);
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(line);
  expect(play(level.level, level.start, line).moves).toBeGreaterThan(TRAIL_CELLS);
  const trail = await gamePage.trail();
  expect(trail).toHaveLength(TRAIL_CELLS - 1);
  expect(trail.map((d) => d.square)).toEqual(expectedDots(line));
  // Even the oldest dot that is kept is still drawn (fades towards zero, not to it).
  expect(trail[0]!.opacity).toBeGreaterThan(0);
});

test("hoàn tác xoá chấm mới nhất, chơi lại xoá cả vệt", { tag: ["@TC-PLAY-015"] }, async ({ gamePage, page }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  const moves = line.slice(0, 5);
  await gamePage.play(moves);
  expect(await gamePage.trail()).toHaveLength(expectedDots(moves).length);
  await page.keyboard.press("z");
  expect((await gamePage.trail()).map((d) => d.square)).toEqual(expectedDots(moves.slice(0, -1)));
  await gamePage.restartButton().click();
  await expect(gamePage.hud()).toContainText("Bước 0");
  expect(await gamePage.trail()).toEqual([]);
});
