import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL } from "@/data/test-data";
import { blockedPush, play, solve, squareOf, type Direction } from "@/utils/sokoban";

// Positions come from the committed pack (data) and the suite's own model; what is checked is what the player and a
// screen reader get: the board's description and the HUD.
const level = packLevel(FIRST_LEVEL);

/** The board as the model says it should read after `moves`. */
function expected(moves: readonly Direction[]) {
  const end = play(level.level, level.start, moves);
  return {
    player: squareOf(level.level, end.state.player),
    crates: end.state.boxes.map((b) => squareOf(level.level, b)),
    moves: end.moves,
    pushes: end.pushes,
  };
}

test("mở màn 1 thấy tên màn, bộ đếm về 0 và số đẩy tối ưu đúng của màn", { tag: ["@TC-PLAY-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await expect(gamePage.levelHeading()).toHaveText(copy.play.levelTitle(1));
  await expect(gamePage.levelSubtitle()).toHaveText(copy.play.campaignSubtitle(copy.difficulty.easy));
  await expect(gamePage.hud()).toHaveText("Bước 0 · Đẩy 0 · 00:00");
  // The HUD's optimum must be the true fewest pushes, which the suite's own solver finds independently.
  const best = solve(level.level, level.start)!;
  await expect(gamePage.targets()).toHaveText(copy.play.targets(best.pushes, copy.play.noRecord));
  const reading = await gamePage.reading();
  expect(reading.player).toEqual(squareOf(level.level, level.start.player));
  expect(reading.crates).toEqual(level.start.boxes.map((b) => squareOf(level.level, b)));
});

test("bước vào ô trống thì nhân vật đi một ô, Bước tăng 1, Đẩy giữ nguyên", { tag: ["@TC-PLAY-002", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  // easy-01: the square above the player is empty floor.
  await gamePage.press("up");
  const want = expected(["up"]);
  expect(want.pushes).toBe(0);
  expect((await gamePage.reading()).player).toEqual(want.player);
  expect(await gamePage.counters()).toMatchObject({ moves: 1, pushes: 0 });
});

test("bước vào thùng thì đẩy thùng đi một ô, Bước và Đẩy cùng tăng 1", { tag: ["@TC-PLAY-003", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  // easy-01: a crate sits immediately left of the player.
  await gamePage.press("left");
  const want = expected(["left"]);
  expect(want.pushes).toBe(1);
  const reading = await gamePage.reading();
  expect(reading.player).toEqual(want.player);
  expect(reading.crates).toEqual(want.crates);
  expect(await gamePage.counters()).toMatchObject({ moves: 1, pushes: 1 });
});

const BLOCKED = [
  ["wall", "thùng sát tường thì không đẩy được: bàn cờ và bộ đếm đứng yên", "@TC-PLAY-004"],
  ["crate", "thùng chắn sau lưng thùng khác thì không đẩy được: bàn cờ và bộ đếm đứng yên", "@TC-PLAY-005"],
] as const;

for (const [by, title, id] of BLOCKED) {
  test(title, { tag: [id] }, async ({ gamePage }) => {
    // Find, in the real level, a press whose crate would hit a wall / a second crate.
    const sequence = blockedPush(level.level, level.start, by);
    expect(sequence, `no blocked push by a ${by} reachable in ${FIRST_LEVEL}`).not.toBeNull();
    await gamePage.gotoLevel(FIRST_LEVEL);
    await gamePage.play(sequence!.slice(0, -1));
    const before = await gamePage.reading();
    const counters = await gamePage.counters();
    await gamePage.press(sequence!.at(-1)!);
    expect((await gamePage.reading()).label).toBe(before.label);
    expect(await gamePage.counters()).toMatchObject({ moves: counters.moves, pushes: counters.pushes });
  });
}

test("bước vào tường thì không đi, không tính bước", { tag: ["@TC-PLAY-006"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  // easy-01: the player starts against the right-hand wall.
  expect(play(level.level, level.start, ["right"]).moves).toBe(0);
  const before = await gamePage.reading();
  await gamePage.press("right");
  expect((await gamePage.reading()).label).toBe(before.label);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
});

test("W A S D đi giống bốn phím mũi tên", { tag: ["@TC-PLAY-007"] }, async ({ gamePage, page }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  for (const key of ["w", "a", "s", "d"]) await page.keyboard.press(key);
  const want = expected(["up", "left", "down", "right"]);
  const reading = await gamePage.reading();
  expect(reading.player).toEqual(want.player);
  expect(reading.crates).toEqual(want.crates);
  expect(await gamePage.counters()).toMatchObject({ moves: want.moves, pushes: want.pushes });
});

test("phím mũi tên không cuộn trang, và cả trang lẫn bàn cờ không có thanh cuộn ở 375px", { tag: ["@TC-PLAY-008"] }, async ({ page, gamePage }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(["down", "down", "up", "right"]);
  const overflow = await page.evaluate(() => {
    const board = document.querySelector("[data-testid=board]");
    const root = document.documentElement;
    return {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      pageX: Math.max(0, root.scrollWidth - root.clientWidth),
      pageY: Math.max(0, root.scrollHeight - root.clientHeight),
      boardX: board ? Math.max(0, board.scrollWidth - board.clientWidth) : -1,
      boardY: board ? Math.max(0, board.scrollHeight - board.clientHeight) : -1,
    };
  });
  expect(overflow).toEqual({ scrollX: 0, scrollY: 0, pageX: 0, pageY: 0, boardX: 0, boardY: 0 });
});

test("bấm vào ô kề nhân vật là đi một bước về phía đó, kể cả đẩy thùng", { tag: ["@TC-PLAY-009", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.clickNeighbour("up");
  expect((await gamePage.reading()).player).toEqual(expected(["up"]).player);
  await gamePage.clickNeighbour("down");
  await gamePage.clickNeighbour("left");
  const want = expected(["up", "down", "left"]);
  const reading = await gamePage.reading();
  expect(reading.player).toEqual(want.player);
  expect(reading.crates).toEqual(want.crates);
  expect(await gamePage.counters()).toMatchObject({ moves: 3, pushes: want.pushes });
});

test("bấm vào ô không kề nhân vật, hoặc vào chính nhân vật, không làm gì", { tag: ["@TC-PLAY-010"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  const before = await gamePage.reading();
  // Two squares up, and a diagonal: neither is a single step, and a click must not path-find.
  await gamePage.clickSquare({ column: before.player.column, row: before.player.row - 2 });
  await gamePage.clickSquare({ column: before.player.column - 1, row: before.player.row - 1 });
  await gamePage.clickSquare(before.player);
  expect((await gamePage.reading()).label).toBe(before.label);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
});

test("đồng hồ HUD chạy từ lúc mở màn theo dạng mm:ss", { tag: ["@TC-PLAY-011"] }, async ({ page, gamePage }) => {
  await page.clock.install();
  await gamePage.gotoLevel(FIRST_LEVEL);
  await expect(gamePage.hud()).toContainText("00:00");
  await page.clock.runFor(9_000);
  await expect(gamePage.hud()).toContainText("00:09");
  await page.clock.runFor(56_000);
  await expect(gamePage.hud()).toContainText("01:05");
});

test("thùng vào đích được mô tả là đã vào đích và đếm vào số thùng xong", { tag: ["@TC-PLAY-012"] }, async ({ gamePage }) => {
  const best = solve(level.level, level.start)!;
  // Play the optimal line up to the first push that lands a crate on a goal.
  let prefix: Direction[] = [];
  for (let i = 1; i <= best.moves.length; i += 1) {
    const end = play(level.level, level.start, best.moves.slice(0, i));
    if (end.state.boxes.some((b) => level.level.goals.has(b))) {
      prefix = best.moves.slice(0, i);
      break;
    }
  }
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(prefix);
  const reading = await gamePage.reading();
  expect(reading.cratesOnGoal).toHaveLength(1);
  expect(reading.crates).toHaveLength(1);
  expect(reading.label).toContain("1 trên 2 thùng đã vào đích");
});
