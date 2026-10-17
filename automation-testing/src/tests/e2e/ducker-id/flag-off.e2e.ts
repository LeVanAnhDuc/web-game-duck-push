import { expect, test } from "@playwright/test";

// Tách từ client/e2e/ducker-id-sign-in.spec.ts: chạy trên bản cờ tắt (project app, :3427).
test.describe("cờ tắt (bản giống deploy)", () => {
  test("không có nút đăng nhập và không có request nào ra ngoài", async ({ page, baseURL }) => {
    const outside: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url.startsWith("blob:")) return;
      if (!url.startsWith(baseURL!)) outside.push(url);
    });
    await page.goto("./");
    await expect(page.getByTestId("random-level")).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Tài khoản Ducker ID" })).toHaveCount(0);
    expect(outside).toEqual([]);
  });
});
