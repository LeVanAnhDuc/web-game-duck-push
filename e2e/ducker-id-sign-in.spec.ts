import { expect, test, type Page } from "@playwright/test";

import easyPack from "../src/game/levels/data/easy.json";

/**
 * Đăng nhập Ducker ID (ADR-0010). Có hai bản build, xem scripts/e2e-serve.mjs:
 *   :3427 cờ tắt (giống bản deploy) · :3428 cờ bật với issuer giả `http://ducker.test`.
 * Issuer giả không bao giờ phân giải được — mọi request tới nó đều bị `page.route` chặn.
 */

const FLAG_ON = "http://127.0.0.1:3428";
const ISSUER = "http://ducker.test";
const levelId = easyPack.levels[0]!.id;
const CORS = { "access-control-allow-origin": "*" };

/** Chờ vòng đăng nhập quay về app (request điều hướng có ?state) và trang nạp xong. */
function watchReturn(page: Page): () => Promise<void> {
  // Phải đăng ký TRƯỚC khi bấm: request quay về xảy ra rất nhanh.
  const returned = page.waitForRequest(
    (request) =>
      request.isNavigationRequest() &&
      request.url().startsWith(FLAG_ON) &&
      new URL(request.url()).searchParams.has("state")
  );
  return async () => {
    await returned;
    await page.waitForLoadState("load");
    await page.waitForTimeout(1000);
  };
}

test.describe("cờ bật", () => {
  test.use({ baseURL: FLAG_ON });

  test.beforeEach(async ({ page }) => {
    await page.route(`${ISSUER}/oauth/authorize**`, async (route) => {
      const url = new URL(route.request().url());
      const back = new URL(url.searchParams.get("redirect_uri")!);
      back.searchParams.set("code", "code-1");
      back.searchParams.set("state", url.searchParams.get("state")!);
      await route.fulfill({ status: 302, headers: { location: back.toString() } });
    });
    await page.route(`${ISSUER}/oauth/token`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: CORS,
        body: JSON.stringify({ access_token: "at-1", token_type: "Bearer", expires_in: 900 })
      })
    );
    await page.route(`${ISSUER}/oauth/userinfo`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: CORS,
        body: JSON.stringify({ sub: "u1", name: "Lê Văn Anh Đức", email: "duc@ducker.id" })
      })
    );
  });

  test("đăng nhập, hiện tên, URL sạch, đăng xuất", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    const account = page.getByRole("button", { name: "Tài khoản Ducker ID" });
    await expect(account).toBeVisible();
    expect(new URL(page.url()).search).not.toMatch(/code=|state=/);

    await account.click();
    await expect(page.getByText("Lê Văn Anh Đức")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Mở hồ sơ Ducker ID" })).toHaveAttribute(
      "href",
      `${ISSUER}/profile`
    );
    await page.getByRole("menuitem", { name: "Đăng xuất" }).click();
    const signIn = page.getByRole("button", { name: "Đăng nhập" });
    await expect(signIn).toBeVisible();
    await expect(signIn).toBeFocused();
    expect(errors.filter((text) => /hydrat/i.test(text))).toEqual([]);
  });

  test("?level và ?d sống sót, URL sạch sau hydrate và sau khi tải lại", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
    // Đặt tham số vào thanh địa chỉ như khi mở link chia sẻ rồi bấm đăng nhập.
    await page.evaluate((id) => window.history.replaceState(null, "", `/?level=${id}&d=easy`), levelId);

    const userinfo = page.waitForResponse(`${ISSUER}/oauth/userinfo`);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await userinfo;
    await expect(page.getByTestId("board")).toBeVisible();
    // Next ghi lại URL lúc hydrate (còn ?code&state) vào history: đợi mọi thứ lắng xuống rồi mới đo.
    await page.waitForLoadState("networkidle");

    const expectClean = () => {
      const url = new URL(page.url());
      expect(url.search).not.toMatch(/code=|state=|iss=/);
      expect(url.searchParams.get("level")).toBe(levelId);
      expect(url.searchParams.get("d")).toBe("easy");
    };
    expectClean();

    // F5 không được gửi lại code đã dùng (authorize không bị gọi lại và URL vẫn sạch).
    await page.reload();
    await expect(page.getByTestId("board")).toBeVisible();
    await page.waitForLoadState("networkidle");
    expectClean();
  });

  test("huỷ ở Ducker ID thì về chưa đăng nhập, URL sạch", async ({ page }) => {
    await page.route(`${ISSUER}/oauth/authorize**`, async (route) => {
      const url = new URL(route.request().url());
      const back = new URL(url.searchParams.get("redirect_uri")!);
      back.searchParams.set("error", "access_denied");
      back.searchParams.set("state", url.searchParams.get("state")!);
      await route.fulfill({ status: 302, headers: { location: back.toString() } });
    });
    await page.goto("/");
    const returned = watchReturn(page);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await returned();
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
    expect(new URL(page.url()).search).toBe("");
  });

  test("state bị sửa thì về chưa đăng nhập", async ({ page }) => {
    await page.route(`${ISSUER}/oauth/authorize**`, async (route) => {
      const url = new URL(route.request().url());
      const back = new URL(url.searchParams.get("redirect_uri")!);
      back.searchParams.set("code", "code-1");
      back.searchParams.set("state", "tampered");
      await route.fulfill({ status: 302, headers: { location: back.toString() } });
    });
    await page.goto("/");
    const returned = watchReturn(page);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await returned();
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tài khoản Ducker ID" })).toHaveCount(0);
    expect(new URL(page.url()).search).toBe("");
  });

  for (const width of [320, 375]) {
    test(`ở ${width}px header không xuống dòng qua idle/signed-out/signed-in, menu nằm trong màn hình`, async ({ page }) => {
      await page.setViewportSize({ width, height: 667 });
      await page.goto("/");
      const theme = page.getByRole("button", { name: /^Giao diện/ });
      const sameRow = async (trigger: ReturnType<typeof page.getByRole>) => {
        const t = (await trigger.boundingBox())!;
        const th = (await theme.boundingBox())!;
        // Cùng một hàng: tâm dọc lệch nhau vài px (avatar 52px cao hơn nút giao diện 44px).
        expect(Math.abs(t.y + t.height / 2 - (th.y + th.height / 2))).toBeLessThanOrEqual(3);
        expect(t.width).toBeGreaterThanOrEqual(44);
        expect(t.height).toBeGreaterThanOrEqual(44);
        const title = (await page.getByRole("heading", { name: "DUCK PUSH" }).boundingBox())!;
        for (const other of [title, th]) {
          const overlap =
            t.x < other.x + other.width && other.x < t.x + t.width && t.y < other.y + other.height && other.y < t.y + t.height;
          expect(overlap).toBe(false);
        }
      };

      await sameRow(page.getByRole("button", { name: "Đăng nhập" }));
      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(await overflow()).toBeLessThanOrEqual(0);

      await page.getByRole("button", { name: "Đăng nhập" }).click();
      const account = page.getByRole("button", { name: "Tài khoản Ducker ID" });
      await expect(account).toBeVisible();
      await sameRow(account);

      const container = page.locator("header > div").first();
      const before = (await container.boundingBox())!;
      await account.click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      expect(await menu.evaluate((el) => getComputedStyle(el).position)).toBe("absolute");
      const box = (await menu.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(await container.boundingBox()).toEqual(before);
      expect(await overflow()).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("cờ tắt (bản giống deploy)", () => {
  test("không có nút đăng nhập và không có request nào ra ngoài", async ({ page, baseURL }) => {
    const outside: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url.startsWith("blob:")) return;
      if (!url.startsWith(baseURL!)) outside.push(url);
    });
    await page.goto("/");
    await expect(page.getByTestId("random-level")).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Tài khoản Ducker ID" })).toHaveCount(0);
    expect(outside).toEqual([]);
  });
});
