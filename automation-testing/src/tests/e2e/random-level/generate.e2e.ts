import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { RANDOM_SEED } from "@/data/test-data";
import { GamePage } from "@/pages/game.page";

const SEED_IN_URL = /[?&]seed=(\d+)&d=(easy|medium|hard|expert)$/;

test("nút Màn ngẫu nhiên sinh một màn mới, seed của nó nằm trên URL và trên dòng phụ", { tag: ["@TC-RANDOMLEVEL-001", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.gotoHome();
  await gamePage.randomButton().click();
  await expect(gamePage.levelHeading()).toHaveText(copy.random.title);
  await expect(page).toHaveURL(SEED_IN_URL);
  const seed = Number(SEED_IN_URL.exec(page.url())![1]);
  await expect(gamePage.levelSubtitle()).toHaveText(copy.random.subtitle(copy.difficulty.easy, seed));
  await expect(gamePage.targets()).toHaveText(/^Tối ưu \d+ đẩy · KL bạn chưa có$/);
  expect(await gamePage.counters()).toMatchObject({ moves: 0, pushes: 0 });
});

test("màn ngẫu nhiên theo đúng bậc khó đang chọn", { tag: ["@TC-RANDOMLEVEL-002"] }, async ({ page, gamePage }) => {
  await gamePage.gotoHome();
  await gamePage.chooseDifficulty("hard");
  await gamePage.randomButton().click();
  await expect(gamePage.levelSubtitle()).toHaveText(new RegExp(`^${copy.difficulty.hard} · Seed \\d+$`));
  await expect(page).toHaveURL(/&d=hard$/);
});

test("cùng một đường dẫn seed mở ở máy khác cho ra đúng màn đó", { tag: ["@TC-RANDOMLEVEL-003", "@smoke"] }, async ({ browser, gamePage }) => {
  await gamePage.gotoSeed(RANDOM_SEED, "medium");
  await gamePage.board().waitFor();
  const here = await gamePage.reading();
  const targets = await gamePage.targets().textContent();

  // A second browser context shares nothing with the first: no storage, no worker, no cache.
  const other = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  const friend = new GamePage(await other.newPage());
  await friend.gotoSeed(RANDOM_SEED, "medium");
  await friend.board().waitFor();
  expect((await friend.reading()).label).toBe(here.label);
  await expect(friend.targets()).toHaveText(targets!);
  await expect(friend.levelSubtitle()).toHaveText(copy.random.subtitle(copy.difficulty.medium, RANDOM_SEED));
  await other.close();
});

test("seed giống nhau nhưng bậc khó khác thì là màn khác", { tag: ["@TC-RANDOMLEVEL-004"] }, async ({ gamePage }) => {
  await gamePage.gotoSeed(RANDOM_SEED, "easy");
  await gamePage.board().waitFor();
  const easy = await gamePage.reading();
  await gamePage.gotoSeed(RANDOM_SEED, "expert");
  await expect(gamePage.levelSubtitle()).toHaveText(copy.random.subtitle(copy.difficulty.expert, RANDOM_SEED));
  expect((await gamePage.reading()).label).not.toBe(easy.label);
});

test("seed hỏng trên đường dẫn thì về trang chủ với lời nhắn đọc được", { tag: ["@TC-RANDOMLEVEL-005"] }, async ({ page, gamePage }) => {
  for (const seed of ["khong-phai-so", "-5", "1.5", "1e3x"]) {
    await gamePage.gotoSeed(seed, "easy");
    await expect(gamePage.notice(copy.notice.badSeed), `seed=${seed}`).toBeVisible();
    await expect(gamePage.randomButton()).toBeVisible();
    expect(new URL(page.url()).search).toBe("");
  }
});

test("màn được sinh trong Web Worker, trang vẫn trả lời trong lúc sinh", { tag: ["@TC-RANDOMLEVEL-006"] }, async ({ page, gamePage }) => {
  await gamePage.gotoHome();
  const workers: string[] = [];
  page.on("worker", (worker) => workers.push(worker.url()));
  await gamePage.chooseDifficulty("expert");
  await gamePage.randomButton().click();
  // The main thread answers while the level is being generated.
  expect(await page.evaluate(() => document.title)).toBe(copy.home.tabTitle);
  await gamePage.board().waitFor();
  expect(workers.length).toBeGreaterThan(0);
});

test("sinh một màn ở mỗi bậc khó xong trong trần cứng 2,5 giây", { tag: ["@TC-RANDOMLEVEL-007"] }, async ({ gamePage }) => {
  await gamePage.gotoHome();
  for (const tier of ["easy", "medium", "hard", "expert"] as const) {
    await gamePage.chooseDifficulty(tier);
    const started = Date.now();
    await gamePage.randomButton().click();
    await gamePage.board().waitFor();
    const took = Date.now() - started;
    expect(took, `${tier}: ${took}ms`).toBeLessThanOrEqual(2_500);
    await gamePage.backButton().click();
  }
});

test("trình duyệt không có Web Worker vẫn sinh được màn", { tag: ["@TC-RANDOMLEVEL-008"] }, async ({ page, gamePage }) => {
  await page.addInitScript(() => {
    // @ts-expect-error - simulating a browser without workers
    delete window.Worker;
  });
  await gamePage.gotoHome();
  await gamePage.randomButton().click();
  await expect(gamePage.levelHeading()).toHaveText(copy.random.title, { timeout: 15_000 });
  await expect(page).toHaveURL(SEED_IN_URL);
});

test("trong lúc sinh, nút đổi sang trạng thái chờ", { tag: ["@TC-RANDOMLEVEL-009"] }, async ({ page, gamePage }) => {
  await gamePage.gotoHome();
  // Hold the worker's answer so the pending state can be seen: block the worker script until released.
  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route(/turbopack-worker|\.worker\./, async (route) => {
    await held;
    await route.continue();
  });
  await gamePage.randomButton().click();
  await expect(gamePage.randomButton()).toHaveText(copy.random.pending);
  release();
  await expect(gamePage.levelHeading()).toHaveText(copy.random.title, { timeout: 15_000 });
});
