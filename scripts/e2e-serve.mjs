// Dựng HAI bản build tĩnh cho e2e rồi phục vụ chúng:
//   :3427  cờ Ducker ID TẮT (bản giống deploy) — toàn bộ e2e game chạy ở đây
//   :3428  cờ BẬT, issuer giả http://ducker.test (mọi request tới đó bị page.route chặn)
// Biến được đặt tường minh cho cả hai lần build để một `.env` ở máy không lọt vào.
import { spawn, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";

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

build(BLANK, ".e2e/off");
build(ON, ".e2e/on");

for (const [dir, port] of [
  [".e2e/off", OFF_PORT],
  [".e2e/on", ON_PORT]
]) {
  spawn("pnpm", ["exec", "serve", "-s", dir, "-l", String(port)], { stdio: "inherit", shell: true });
}
