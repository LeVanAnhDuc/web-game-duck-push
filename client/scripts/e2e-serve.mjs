// Dựng HAI bản build tĩnh cho bộ hồi quy ../automation-testing rồi phục vụ chúng:
//   :3427  cờ Ducker ID TẮT (bản giống deploy) — toàn bộ e2e game chạy ở đây
//   :3428  cờ BẬT, issuer giả http://ducker.test (mọi request tới đó bị page.route chặn)
// Biến được đặt tường minh cho cả hai lần build để một `.env` ở máy không lọt vào.
//
//   node scripts/e2e-serve.mjs           build cả hai rồi phục vụ (webServer của playwright.config.ts gọi lệnh này)
//   node scripts/e2e-serve.mjs --build   chỉ build cả hai vào .e2e/ (pnpm build:e2e — CI chạy trước bộ test)
//   CLIENT_PREBUILT=1 node scripts/e2e-serve.mjs
//                                        chỉ phục vụ .e2e/off và .e2e/on đã build sẵn, không build lại
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

const OFF_PORT = 3427;
const ON_PORT = 3428;
const BLANK = {
  NEXT_PUBLIC_BASE_PATH: "",
  NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN: "",
  NEXT_PUBLIC_DUCKER_ISSUER: "",
  NEXT_PUBLIC_DUCKER_CLIENT_ID: "",
  NEXT_PUBLIC_DUCKER_SCOPE: "",
  NEXT_PUBLIC_DUCKER_PROFILE_PATH: ""
};
const ON = {
  ...BLANK,
  NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN: "true",
  NEXT_PUBLIC_DUCKER_ISSUER: "http://ducker.test",
  NEXT_PUBLIC_DUCKER_CLIENT_ID: "e2e-client",
  NEXT_PUBLIC_DUCKER_SCOPE: "openid profile email",
  NEXT_PUBLIC_DUCKER_PROFILE_PATH: "/profile"
};
const TARGETS = [
  [".e2e/off", OFF_PORT],
  [".e2e/on", ON_PORT]
];

function build(env, target) {
  const result = spawnSync("pnpm", ["build"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...env }
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync("out", target, { recursive: true });
}

const buildOnly = process.argv.includes("--build");
const prebuilt = process.env.CLIENT_PREBUILT === "1";

if (prebuilt && !buildOnly) {
  const missing = TARGETS.filter(([dir]) => !existsSync(dir)).map(([dir]) => dir);
  if (missing.length > 0) {
    console.error(`CLIENT_PREBUILT=1 nhưng chưa có ${missing.join(", ")} — chạy \`pnpm build:e2e\` trước.`);
    process.exit(1);
  }
} else {
  build(BLANK, ".e2e/off");
  build(ON, ".e2e/on");
}

if (!buildOnly) {
  for (const [dir, port] of TARGETS) {
    spawn("pnpm", ["exec", "serve", "-s", dir, "-l", String(port)], { stdio: "inherit", shell: true });
  }
}
