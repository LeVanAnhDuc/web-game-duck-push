import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL, STORAGE } from "@/data/test-data";
import { play, solve, suboptimalSolution } from "@/utils/sokoban";

// Solutions are computed by the suite's own model from the committed pack, then typed on the real keyboard.
const level = packLevel(FIRST_LEVEL);
const BEST = solve(level.level, level.start)!;
const WORSE = suboptimalSolution(level.level, level.start)!;

/** A record as the game stores it (../client/src/game/storage/types.ts LevelRecord), planted before the level opens. */
function progressWith(bestPushes: number, bestMoves: number) {
  return {
    version: STORAGE.version,
    records: {
      [FIRST_LEVEL]: {
        levelId: FIRST_LEVEL,
        bestPushes,
        bestMoves,
        bestTimeMs: 60_000,
        optimal: bestPushes === BEST.pushes,
        solvedAt: 1,
      },
    },
    inProgress: null,
  };
}

test("giải hết màn chỉ bằng bàn phím thì hiện Xong màn với bước, đẩy và lời khen đạt tối ưu", { tag: ["@TC-WIN-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toBeVisible();
  await expect(gamePage.win.stats()).toContainText(copy.win.stats(BEST.moves.length, BEST.pushes));
  await expect(gamePage.win.dialog()).toContainText(copy.win.optimal(level.optimalPushes));
  await expect(gamePage.win.dialog()).toContainText(copy.win.firstTime);
});

test("giải nhiều đẩy hơn tối ưu thì lớp phủ nói còn thiếu bao nhiêu đẩy", { tag: ["@TC-WIN-002"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(WORSE.moves);
  await expect(gamePage.win.stats()).toContainText(copy.win.stats(WORSE.moves.length, WORSE.pushes));
  await expect(gamePage.win.dialog()).toContainText(copy.win.notOptimal(BEST.pushes, WORSE.pushes - BEST.pushes));
});

test("phá kỷ lục cũ thì lớp phủ báo vừa phá, và ô màn đổi sang kỷ lục mới có sao", { tag: ["@TC-WIN-003"] }, async ({ gamePage }) => {
  await gamePage.gotoHome();
  await gamePage.writeStorage(STORAGE.progress, progressWith(WORSE.pushes, WORSE.moves.length));
  await gamePage.gotoLevel(FIRST_LEVEL);
  await expect(gamePage.targets()).toHaveText(copy.play.targets(BEST.pushes, String(WORSE.pushes)));
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toContainText(copy.win.beaten(WORSE.pushes));
  await gamePage.gotoHome();
  await expect(gamePage.levelTile(1)).toHaveAccessibleName(`Màn 1, đã giải, đạt số đẩy tối ưu, kỷ lục ${BEST.pushes} đẩy`);
});

test("ván tệ hơn kỷ lục không ghi đè kỷ lục", { tag: ["@TC-WIN-004", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoHome();
  await gamePage.writeStorage(STORAGE.progress, progressWith(BEST.pushes, BEST.moves.length));
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(WORSE.moves);
  await expect(gamePage.win.dialog()).toContainText(copy.win.oldRecord(BEST.pushes));
  await gamePage.gotoHome();
  await expect(gamePage.levelTile(1)).toHaveAccessibleName(`Màn 1, đã giải, đạt số đẩy tối ưu, kỷ lục ${BEST.pushes} đẩy`);
});

test("kỷ lục so theo số đẩy chứ không theo số bước", { tag: ["@TC-WIN-005"] }, async ({ gamePage }) => {
  // The old record has fewer MOVES but more pushes than the optimal line: fewer pushes must still win.
  await gamePage.gotoHome();
  await gamePage.writeStorage(STORAGE.progress, progressWith(BEST.pushes + 1, 1));
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toContainText(copy.win.beaten(BEST.pushes + 1));
  await gamePage.gotoHome();
  await expect(gamePage.levelTile(1)).toContainText(`${BEST.pushes} đẩy`);
});

test("lớp phủ đang mở thì phím mũi tên không đi, và bàn cờ đã thắng đứng yên sau khi đóng", { tag: ["@TC-WIN-006"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toBeVisible();
  const won = await gamePage.reading();
  await gamePage.play(["up", "left", "down"]);
  await page.keyboard.press("Escape");
  await expect(gamePage.win.dialog()).toBeHidden();
  await gamePage.play(["up", "left", "down"]);
  expect((await gamePage.reading()).label).toBe(won.label);
  expect(await gamePage.counters()).toMatchObject({ moves: BEST.moves.length, pushes: BEST.pushes });
  expect(won.cratesOnGoal).toHaveLength(2);
});

test("Escape đóng lớp phủ, nút Kết quả mở lại nó", { tag: ["@TC-WIN-007"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await expect(gamePage.resultButton()).toHaveCount(0);
  await gamePage.play(BEST.moves);
  await page.keyboard.press("Escape");
  await expect(gamePage.win.dialog()).toBeHidden();
  await gamePage.resultButton().click();
  await expect(gamePage.win.dialog()).toBeVisible();
  await expect(gamePage.win.stats()).toContainText(copy.win.stats(BEST.moves.length, BEST.pushes));
});

test("Chơi lại trên lớp phủ đóng lớp phủ và đưa màn về đầu", { tag: ["@TC-WIN-008"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  const start = await gamePage.reading();
  await gamePage.play(BEST.moves);
  await gamePage.win.restart().click();
  await expect(gamePage.win.dialog()).toBeHidden();
  expect((await gamePage.reading()).label).toBe(start.label);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
});

test("Tiếp mở màn kế tiếp của chiến dịch", { tag: ["@TC-WIN-009", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await gamePage.win.next().click();
  await expect(gamePage.levelHeading()).toHaveText(copy.play.levelTitle(2));
  await expect(page).toHaveURL(/[?&]level=easy-02(&|$)/);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
  const second = packLevel("easy-02");
  await expect(gamePage.targets()).toHaveText(copy.play.targets(solve(second.level, second.start)!.pushes, copy.play.noRecord));
});

test("Tiếp ở màn cuối của bậc đưa về trang chủ kèm lời nhắn đọc được", { tag: ["@TC-WIN-010"] }, async ({ page, gamePage }) => {
  const last = packLevel("easy-20");
  await gamePage.gotoLevel("easy-20");
  await gamePage.play(solve(last.level, last.start)!.moves);
  await gamePage.win.next().click();
  await expect(gamePage.notice(/Hết màn trong bậc này/)).toBeVisible();
  await expect(gamePage.levelTile(1)).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
});

test("Màn ngẫu nhiên trên lớp phủ sinh một màn mới cùng bậc", { tag: ["@TC-WIN-011"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await gamePage.win.random().click();
  await expect(gamePage.levelHeading()).toHaveText(copy.random.title, { timeout: 15_000 });
  await expect(page).toHaveURL(/[?&]seed=\d+&d=easy$/);
  const seed = new URL(page.url()).searchParams.get("seed")!;
  await expect(gamePage.levelSubtitle()).toHaveText(copy.random.subtitle(copy.difficulty.easy, Number(seed)));
});

test("thắng được báo qua vùng thông báo cho trình đọc màn hình", { tag: ["@TC-WIN-012"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await expect(gamePage.liveRegion()).toHaveText(copy.play.announceWin(BEST.moves.length, BEST.pushes));
});

test("hoàn tác nước thắng mở lại ván, đi lại nước đó thì lớp phủ hiện lại", { tag: ["@TC-WIN-013"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await page.keyboard.press("Escape");
  await page.keyboard.press("z");
  const undone = play(level.level, level.start, BEST.moves.slice(0, -1));
  expect(await gamePage.counters()).toMatchObject({ moves: undone.moves, pushes: undone.pushes });
  expect((await gamePage.reading()).cratesOnGoal).toHaveLength(1);
  await gamePage.press(BEST.moves.at(-1)!);
  await expect(gamePage.win.dialog()).toBeVisible();
});
