import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { STORAGE, TIER_SIZES } from "@/data/test-data";

test("trang chủ mở ra bậc Dễ với 20 màn, không màn nào bị khoá", { tag: ["@TC-CAMPAIGN-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoHome();
  await expect(gamePage.difficultyTab("easy")).toHaveAttribute("aria-pressed", "true");
  await expect(gamePage.levelTiles()).toHaveCount(TIER_SIZES.easy);
  for (let n = 1; n <= TIER_SIZES.easy; n += 1) {
    await expect(gamePage.levelTile(n)).toHaveAccessibleName(`Màn ${n}, chưa giải`);
    await expect(gamePage.levelTile(n)).toBeEnabled();
  }
});

test("đổi bậc khó đổi lưới màn và nhãn nút màn ngẫu nhiên", { tag: ["@TC-CAMPAIGN-002"] }, async ({ gamePage }) => {
  await gamePage.gotoHome();
  for (const tier of ["medium", "hard", "expert", "easy"] as const) {
    await gamePage.chooseDifficulty(tier);
    await expect(gamePage.difficultyTab(tier)).toHaveAttribute("aria-pressed", "true");
    await expect(gamePage.levelTiles()).toHaveCount(TIER_SIZES[tier]);
    await expect(gamePage.randomButton()).toHaveText(copy.random.button(copy.difficulty[tier]));
  }
  await expect(gamePage.difficultyTab("expert")).toHaveAttribute("aria-pressed", "false");
});

test("bấm một ô mở đúng màn đó, có mã màn và bậc khó trên URL", { tag: ["@TC-CAMPAIGN-003", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.gotoHome();
  await gamePage.openTile(3);
  await expect(gamePage.levelHeading()).toHaveText(copy.play.levelTitle(3));
  await expect(gamePage.levelSubtitle()).toHaveText(copy.play.campaignSubtitle(copy.difficulty.easy));
  await expect(page).toHaveURL(/\?level=easy-03&d=easy$/);

  await gamePage.backButton().click();
  await gamePage.chooseDifficulty("hard");
  await gamePage.openTile(2);
  await expect(gamePage.levelSubtitle()).toHaveText(copy.play.campaignSubtitle(copy.difficulty.hard));
  await expect(page).toHaveURL(/\?level=hard-02&d=hard$/);
});

test("nút Về trang chủ quay lại lưới màn và xoá mã màn khỏi URL", { tag: ["@TC-CAMPAIGN-004"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel("easy-02");
  await gamePage.backButton().click();
  await expect(gamePage.levelTile(1)).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
});

test("mở thẳng đường dẫn có mã màn thì vào ngay màn đó", { tag: ["@TC-CAMPAIGN-005"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel("medium-07");
  await expect(gamePage.levelHeading()).toHaveText(copy.play.levelTitle(7));
  await expect(gamePage.levelSubtitle()).toHaveText(copy.play.campaignSubtitle(copy.difficulty.medium));
});

test("mã màn không có trong chiến dịch thì về trang chủ với lời nhắn đọc được", { tag: ["@TC-CAMPAIGN-006"] }, async ({ page, gamePage }) => {
  await page.goto("./?level=easy-99&d=easy");
  await expect(gamePage.notice(copy.notice.unknownLevel("easy-99"))).toBeVisible();
  await expect(gamePage.levelTile(1)).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
});

test("đường dẫn thiếu bậc khó hợp lệ thì về trang chủ với lời nhắn đọc được", { tag: ["@TC-CAMPAIGN-007"] }, async ({ page, gamePage }) => {
  for (const query of ["?level=easy-01", "?level=easy-01&d=impossible", "?level=easy-01&d=EASY"]) {
    await page.goto(`./${query}`);
    await expect(gamePage.notice(copy.notice.badDifficulty)).toBeVisible();
    await expect(gamePage.levelTile(1)).toBeVisible();
  }
});

test("ô màn đã giải có dấu tích và kỷ lục, đạt tối ưu có dấu sao, chú giải nói rõ hai ký hiệu", { tag: ["@TC-CAMPAIGN-008"] }, async ({ gamePage }) => {
  await gamePage.gotoHome();
  const record = (levelId: string, bestPushes: number, optimal: boolean) => ({
    levelId,
    bestPushes,
    bestMoves: 40,
    bestTimeMs: 30_000,
    optimal,
    solvedAt: 1,
  });
  await gamePage.writeStorage(STORAGE.progress, {
    version: STORAGE.version,
    records: { "easy-01": record("easy-01", 7, true), "easy-02": record("easy-02", 9, false) },
    inProgress: null,
  });
  await gamePage.gotoHome();
  await expect(gamePage.levelTile(1)).toHaveAccessibleName("Màn 1, đã giải, đạt số đẩy tối ưu, kỷ lục 7 đẩy");
  await expect(gamePage.levelTile(1)).toContainText("7 đẩy");
  await expect(gamePage.levelTile(2)).toHaveAccessibleName("Màn 2, đã giải, kỷ lục 9 đẩy");
  await expect(gamePage.levelTile(3)).toHaveAccessibleName("Màn 3, chưa giải");
  // The two marks differ in shape, not only colour: a star and a check (lucide icons).
  await expect(gamePage.tileMark(1, "star")).toHaveCount(1);
  await expect(gamePage.tileMark(2, "check")).toHaveCount(1);
  await expect(gamePage.tileMark(3, "check")).toHaveCount(0);
  await expect(gamePage.legendItem(copy.home.legendSolved)).toBeVisible();
  await expect(gamePage.legendItem(copy.home.legendOptimal)).toBeVisible();
});

test("tải pack màn hỏng thì nói ra bằng chữ và nút Thử lại tải được lại", { tag: ["@TC-CAMPAIGN-009"] }, async ({ page, gamePage }) => {
  await gamePage.gotoHome();
  // From here on every script chunk fails, as on a dropped connection: the Vừa pack is a lazy chunk.
  await page.route(/\/_next\/static\/chunks\/.*\.js$/, (route) => route.abort());
  await gamePage.chooseDifficulty("medium");
  const failed = gamePage.notice(copy.home.packFailed);
  await expect(failed).toBeVisible();
  await page.unroute(/\/_next\/static\/chunks\/.*\.js$/);
  await failed.getByRole("button", { name: copy.home.retry }).click();
  await expect(gamePage.levelTiles()).toHaveCount(TIER_SIZES.medium);
});
