import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL, RANDOM_SEED, STORAGE } from "@/data/test-data";
import { solve } from "@/utils/sokoban";

const level = packLevel(FIRST_LEVEL);
const BEST = solve(level.level, level.start)!;

/** Makes every localStorage call throw, the way a privacy mode or a disabled-storage policy does. */
function refuseStorage(methods: readonly ("getItem" | "setItem" | "removeItem")[]) {
  return (names: readonly string[]) => {
    for (const name of names) {
      Object.defineProperty(Storage.prototype, name, {
        configurable: true,
        value: () => {
          throw new DOMException("refused", "SecurityError");
        },
      });
    }
  };
}

test("ván đang dở sống qua tải lại trang: thẻ Đang chơi dở mở lại đúng bàn cờ, kể cả lịch sử hoàn tác", { tag: ["@TC-PERSISTENCE-001", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(["left", "up", "left"]);
  const left = await gamePage.reading();
  const counters = await gamePage.counters();
  await gamePage.gotoHome();
  await expect(gamePage.resumeButton()).toContainText(`${copy.play.levelTitle(1)} · ${copy.difficulty.easy}`);
  await expect(gamePage.resumeButton()).toContainText(`${counters.moves} bước · ${counters.pushes} đẩy`);
  await expect(gamePage.resumeButton()).toHaveAccessibleName(new RegExp(copy.home.resumeAction));
  await gamePage.resumeButton().click();
  await gamePage.board().waitFor();
  expect((await gamePage.reading()).label).toBe(left.label);
  expect(await gamePage.counters()).toMatchObject({ moves: counters.moves, pushes: counters.pushes });
  // The undo history came back too: three undos return to the start.
  for (let i = 0; i < 3; i += 1) await page.keyboard.press("z");
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
});

test("màn ngẫu nhiên đang dở cũng mở lại được, sinh lại từ chính seed của nó", { tag: ["@TC-PERSISTENCE-002"] }, async ({ gamePage }) => {
  await gamePage.gotoSeed(RANDOM_SEED, "easy");
  await gamePage.board().waitFor();
  await gamePage.play(["up", "left", "down", "right"]);
  const left = await gamePage.reading();
  const counters = await gamePage.counters();
  await gamePage.gotoHome();
  await expect(gamePage.resumeButton()).toContainText(`${copy.random.title} · ${copy.difficulty.easy}`);
  await gamePage.resumeButton().click();
  await gamePage.board().waitFor();
  await expect(gamePage.levelSubtitle()).toHaveText(copy.random.subtitle(copy.difficulty.easy, RANDOM_SEED));
  expect((await gamePage.reading()).label).toBe(left.label);
  expect(await gamePage.counters()).toMatchObject({ moves: counters.moves, pushes: counters.pushes });
});

test("thắng xong thì không còn thẻ Đang chơi dở cho màn đó", { tag: ["@TC-PERSISTENCE-003"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toBeVisible();
  await gamePage.gotoHome();
  await expect(gamePage.resumeSection()).toHaveCount(0);
});

test("kỷ lục sống qua một lần tải lại trang", { tag: ["@TC-PERSISTENCE-004", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toBeVisible();
  await page.reload();
  await gamePage.gotoHome();
  await expect(gamePage.levelTile(1)).toHaveAccessibleName(`Màn 1, đã giải, đạt số đẩy tối ưu, kỷ lục ${BEST.pushes} đẩy`);
  await expect(gamePage.levelTile(1)).toContainText(`${BEST.pushes} đẩy`);
});

test("dữ liệu lưu hỏng hoặc khác phiên bản bị bỏ qua: trang chủ vẫn mở bình thường và chơi được", { tag: ["@TC-PERSISTENCE-005", "@smoke"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const broken = [
    "{not json",
    JSON.stringify({ version: 2, records: {}, inProgress: null }),
    JSON.stringify({ version: 1, records: { "easy-01": { levelId: "easy-01", bestPushes: -3 } }, inProgress: null }),
    JSON.stringify({ version: 1, records: {}, inProgress: { levelId: "easy-01", difficulty: "easy", seed: null, moves: ["jump"], elapsedMs: 0, savedAt: 0 } }),
  ];
  for (const value of broken) {
    await gamePage.gotoHome();
    await gamePage.writeStorage(STORAGE.progress, value);
    await gamePage.gotoHome();
    await expect(gamePage.resumeSection(), value).toHaveCount(0);
    await expect(gamePage.levelTile(1), value).toHaveAccessibleName("Màn 1, chưa giải");
  }
  await gamePage.openTile(1);
  await gamePage.press("left");
  expect(await gamePage.counters()).toMatchObject({ moves: 1, pushes: 1 });
  expect(errors).toEqual([]);
});

test("tuỳ chọn lưu hỏng thì giao diện về mặc định Theo hệ thống", { tag: ["@TC-PERSISTENCE-006"] }, async ({ gamePage }) => {
  await gamePage.gotoHome();
  await gamePage.writeStorage(STORAGE.settings, { version: 1, theme: "purple", showTrail: true, showDeadlockWarning: true });
  await gamePage.gotoHome();
  await expect(gamePage.themeToggle()).toHaveAccessibleName(copy.theme.toggle(copy.theme.system));
});

test("trình duyệt chặn localStorage hoàn toàn thì vẫn chơi được tới khi thắng", { tag: ["@TC-PERSISTENCE-007", "@smoke"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(refuseStorage(["getItem", "setItem", "removeItem"]), ["getItem", "setItem", "removeItem"]);
  await gamePage.gotoHome();
  await gamePage.themeToggle().click();
  await gamePage.openTile(1);
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toBeVisible();
  await expect(gamePage.win.stats()).toContainText(copy.win.stats(BEST.moves.length, BEST.pushes));
  expect(errors).toEqual([]);
});

test("localStorage đầy (ghi bị từ chối) không làm hỏng ván đang chơi", { tag: ["@TC-PERSISTENCE-008"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("full", "QuotaExceededError");
    };
  });
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(BEST.moves.slice(0, 5));
  await page.keyboard.press("z");
  await gamePage.play(BEST.moves.slice(4));
  await expect(gamePage.win.dialog()).toBeVisible();
  expect(errors).toEqual([]);
});

test("chơi lại một ván đang dở rồi rời đi thì thẻ Đang chơi dở không mở lại ván cũ", { tag: ["@TC-PERSISTENCE-009"] }, async ({ gamePage }) => {
  // BUG: defects/persistence.md#bug-persistence-01
  test.fail();
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.play(["left", "up", "left"]);
  await gamePage.restartButton().click();
  await gamePage.gotoHome();
  // Either no card, or a card for the board the player actually left: the level's start (0 moves).
  const card = gamePage.resumeButton();
  if ((await card.count()) > 0) await expect(card).toContainText("0 bước");
});
