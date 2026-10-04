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

  test("tham số màn chơi (?level ?d) sống sót sau vòng đăng nhập", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
    // Trang chủ không tự ghi query; đặt tham số vào thanh địa chỉ như khi người dùng mở link chia sẻ rồi quay về.
    await page.evaluate((id) => window.history.replaceState(null, "", `/?level=${id}&d=easy`), levelId);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.getByTestId("board")).toBeVisible();
    const url = new URL(page.url());
    expect(url.searchParams.get("level")).toBe(levelId);
    expect(url.searchParams.get("d")).toBe("easy");
    expect(url.searchParams.has("code")).toBe(false);
    expect(url.searchParams.has("state")).toBe(false);

    // Sau hydrate Next có thể ghi lại URL còn ?code&state: chờ trạng thái đã đăng nhập
    // (về trang chủ), rồi kiểm lại URL vẫn sạch và tham số game còn nguyên.
    await page.getByRole("button", { name: "Về trang chủ" }).click();
    await expect(page.getByRole("button", { name: "Tài khoản Ducker ID" })).toBeVisible();
    const after = new URL(page.url());
    expect(after.search).not.toMatch(/code=|state=/);
  });

  test("sau hydrate URL vẫn sạch và ?level còn nguyên (settle)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
    await page.evaluate((id) => window.history.replaceState(null, "", `/?level=${id}&d=easy`), levelId);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("board")).toBeVisible();
    // Cho hydrate + effect settle chạy xong, rồi kiểm.
    await page.waitForTimeout(1000);
    const url = new URL(page.url());
    expect(url.search).not.toMatch(/code=|state=/);
    expect(url.searchParams.get("level")).toBe(levelId);
    expect(url.searchParams.get("d")).toBe("easy");
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

  test("ở 375px nút đủ 44px và không đè lên tiêu đề hay nút giao diện", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const signIn = page.getByRole("button", { name: "Đăng nhập" });
    await expect(signIn).toBeVisible();
    const box = await signIn.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    const others = [
      await page.getByRole("heading", { name: "DUCK PUSH" }).boundingBox(),
      await page.getByRole("button", { name: /^Giao diện/ }).boundingBox()
    ];
    for (const other of others) {
      const overlap =
        box!.x < other!.x + other!.width &&
        other!.x < box!.x + box!.width &&
        box!.y < other!.y + other!.height &&
        other!.y < box!.y + box!.height;
      expect(overlap).toBe(false);
    }
    const documentOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(documentOverflow).toBeLessThanOrEqual(0);
  });
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
