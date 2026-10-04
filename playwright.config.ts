import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:3427", trace: "off" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } }
  ],
  // Cổng 3427/3428 (không phải 3000: Ducker ID chiếm 3000 khi chạy ở máy).
  // scripts/e2e-serve.mjs dựng hai bản: cờ Ducker ID tắt (:3427) và bật (:3428).
  webServer: {
    command: "node scripts/e2e-serve.mjs",
    url: "http://127.0.0.1:3428",
    reuseExistingServer: !process.env.CI,
    timeout: 600_000
  }
});
