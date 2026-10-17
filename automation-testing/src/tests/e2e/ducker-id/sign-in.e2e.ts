import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { DUCKER, FIRST_LEVEL } from "@/data/test-data";

// FR-17 · US-06 · ADR-0010. Runs on the "app-auth" project: the flag-on export built by ../client/scripts/e2e-serve.mjs
// against the fake issuer http://ducker.test (never resolved - the issuer fixture answers it), served on :3428.

const LEVEL_QUERY = `level=${FIRST_LEVEL}&d=easy`;

test("đăng nhập: thấy tài khoản, URL sạch; đăng xuất trả lại nút và tiêu điểm", { tag: ["@TC-DUCKERID-002", "@smoke"] }, async ({ page, gamePage, fakeIssuer }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await fakeIssuer();
  await gamePage.gotoHome();
  await gamePage.account.signInButton().click();

  await expect(gamePage.account.trigger()).toBeVisible();
  await expect.poll(() => new URL(page.url()).search).not.toMatch(/code=|state=/);

  await gamePage.account.trigger().click();
  await expect(gamePage.account.menu()).toContainText(DUCKER.user.name);
  await expect(gamePage.account.menu()).toContainText(DUCKER.user.email);
  await expect(gamePage.account.profileLink()).toHaveAttribute("href", `${DUCKER.issuer}${DUCKER.profilePath}`);

  await gamePage.account.signOutItem().click();
  await expect(gamePage.account.signInButton()).toBeVisible();
  await expect(gamePage.account.signInButton()).toBeFocused();
  expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
});

test("đăng nhập từ một đường dẫn màn chơi: quay về đúng màn, ?level và ?d còn nguyên, URL sạch cả sau khi tải lại", { tag: ["@TC-DUCKERID-003", "@smoke"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer();
  await gamePage.gotoHome();
  await expect(gamePage.account.signInButton()).toBeEnabled();
  // The address bar carries a shared level link when the player presses sign in.
  await page.evaluate((query) => window.history.replaceState(null, "", `./?${query}`), LEVEL_QUERY);
  const userinfo = page.waitForResponse(`${DUCKER.issuer}/oauth/userinfo`);
  await gamePage.account.signInButton().click();
  await userinfo;
  await gamePage.board().waitFor();
  await expect(gamePage.levelHeading()).toHaveText(copy.play.levelTitle(1));

  const clean = () => {
    const url = new URL(page.url());
    return { auth: /code=|state=|iss=/.test(url.search), level: url.searchParams.get("level"), d: url.searchParams.get("d") };
  };
  // Next writes its hydration URL (still holding ?code&state) back into history: the clean one must win and stay.
  await expect.poll(clean).toEqual({ auth: false, level: FIRST_LEVEL, d: "easy" });
  await page.reload();
  await gamePage.board().waitFor();
  await expect.poll(clean).toEqual({ auth: false, level: FIRST_LEVEL, d: "easy" });
});

test("mũi tên đi trong menu tài khoản, Esc đóng menu và trả tiêu điểm về nút", { tag: ["@TC-DUCKERID-004"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer();
  await gamePage.gotoHome();
  await gamePage.account.signInButton().click();
  await gamePage.account.trigger().click();
  await expect(gamePage.account.menu()).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(gamePage.account.menu()).toBeVisible();
  expect(await gamePage.account.menu().evaluate((menu) => menu.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(gamePage.account.menu()).toHaveCount(0);
  await expect(gamePage.account.trigger()).toBeFocused();
});

test("đã đăng nhập vẫn chơi được như thường", { tag: ["@TC-DUCKERID-005"] }, async ({ gamePage, fakeIssuer }) => {
  await fakeIssuer();
  await gamePage.gotoHome();
  await gamePage.account.signInButton().click();
  await expect(gamePage.account.trigger()).toBeVisible();
  await gamePage.openTile(1);
  await gamePage.press("left");
  expect(await gamePage.counters()).toMatchObject({ moves: 1, pushes: 1 });
});

test("hồ sơ chỉ nằm trong bộ nhớ: storage không giữ gì, tải lại là chưa đăng nhập", { tag: ["@TC-DUCKERID-006", "@smoke"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer();
  await gamePage.gotoHome();
  await gamePage.account.signInButton().click();
  await expect(gamePage.account.trigger()).toBeVisible();
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(stored).not.toContain(DUCKER.user.email);
  expect(stored).not.toContain(DUCKER.user.name);
  expect(await page.evaluate((key) => sessionStorage.getItem(key), DUCKER.pkceKey)).toBeNull();
  await page.reload();
  await expect(gamePage.account.signInButton()).toBeVisible();
});

test("từ chối ở Ducker ID thì âm thầm về chưa đăng nhập, URL sạch", { tag: ["@TC-DUCKERID-007"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer("deny");
  await gamePage.gotoHome();
  await gamePage.account.signInRoundTrip(DUCKER.issuer);
  await expect(gamePage.account.signInButton()).toBeVisible();
  await expect.poll(() => new URL(page.url()).search).toBe("");
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveCount(0);
});

test("state bị sửa thì về chưa đăng nhập và không bao giờ gọi tới token", { tag: ["@TC-DUCKERID-008", "@smoke"] }, async ({ page, gamePage, fakeIssuer }) => {
  const issuer = await fakeIssuer("tamper");
  await gamePage.gotoHome();
  await gamePage.account.signInRoundTrip(DUCKER.issuer);
  await expect(gamePage.account.signInButton()).toBeVisible();
  await expect(gamePage.account.trigger()).toHaveCount(0);
  await expect.poll(() => new URL(page.url()).search).toBe("");
  expect(issuer.tokenCalls()).toBe(0);
});

test("issuer treo thì sau tối đa 15 giây về lại chưa đăng nhập", { tag: ["@TC-DUCKERID-009"] }, async ({ page, gamePage, fakeIssuer }) => {
  // AbortSignal.timeout(15s) is a native timer that page.clock cannot fast-forward: this one waits for real.
  test.setTimeout(45_000);
  const issuer = await fakeIssuer("hang");
  await gamePage.gotoHome();
  await gamePage.account.signInRoundTrip(DUCKER.issuer);
  await expect.poll(() => issuer.tokenCalls()).toBe(1);
  await expect(gamePage.account.signInButton()).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => new URL(page.url()).search).not.toMatch(/code=|state=/);
});

test("sessionStorage bị chặn thì bấm đăng nhập không đưa đi đâu cả", { tag: ["@TC-DUCKERID-010"] }, async ({ page, gamePage, fakeIssuer }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });
  await fakeIssuer();
  const toIssuer: string[] = [];
  page.on("request", (r) => {
    if (r.url().startsWith(DUCKER.issuer)) toIssuer.push(r.url());
  });
  await gamePage.gotoHome();
  await gamePage.account.signInButton().click();
  await expect(gamePage.account.signInButton()).toBeEnabled();
  expect(toIssuer).toEqual([]);
  expect(new URL(page.url()).origin + "/").toBe(test.info().project.use.baseURL);
});

test("header ở 320px và 375px không xuống dòng, nút ≥ 44px, menu nằm trọn trong màn hình", { tag: ["@TC-DUCKERID-011"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer();
  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 667 });
    await gamePage.gotoHome();
    const sameRow = async (trigger: typeof gamePage.account.signInButton extends () => infer L ? L : never) => {
      const t = (await trigger.boundingBox())!;
      const theme = (await gamePage.themeToggle().boundingBox())!;
      const title = (await gamePage.title().boundingBox())!;
      expect(Math.abs(t.y + t.height / 2 - (theme.y + theme.height / 2)), `${width}px: same row`).toBeLessThanOrEqual(3);
      expect(t.width).toBeGreaterThanOrEqual(44);
      expect(t.height).toBeGreaterThanOrEqual(44);
      for (const other of [title, theme]) {
        const overlap = t.x < other.x + other.width && other.x < t.x + t.width && t.y < other.y + other.height && other.y < t.y + t.height;
        expect(overlap, `${width}px: overlap`).toBe(false);
      }
    };
    await sameRow(gamePage.account.signInButton());
    expect(await gamePage.pageOverflowX()).toBeLessThanOrEqual(0);

    await gamePage.account.signInButton().click();
    await expect(gamePage.account.trigger()).toBeVisible();
    await sameRow(gamePage.account.trigger());
    const before = await gamePage.header().boundingBox();
    await gamePage.account.trigger().click();
    await expect(gamePage.account.menu()).toBeVisible();
    const menu = (await gamePage.account.menu().boundingBox())!;
    expect(menu.x).toBeGreaterThanOrEqual(0);
    expect(menu.x + menu.width).toBeLessThanOrEqual(width);
    expect(await gamePage.header().boundingBox()).toEqual(before);
    expect(await gamePage.pageOverflowX()).toBeLessThanOrEqual(0);
    await page.keyboard.press("Escape");
  }
});
