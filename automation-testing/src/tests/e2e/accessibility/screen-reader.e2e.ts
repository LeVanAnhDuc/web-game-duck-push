import { expect, test } from "@/fixtures";
import { copy } from "@/data/copy";
import { packLevel } from "@/data/levels";
import { FIRST_LEVEL } from "@/data/test-data";
import { play, solve, squareOf, type Direction } from "@/utils/sokoban";

const level = packLevel(FIRST_LEVEL);
const BEST = solve(level.level, level.start)!;

/** The description the board should give, built from the model in the order the game reads it out. */
function description(moves: readonly Direction[]): string {
  const { state } = play(level.level, level.start, moves);
  const at = (i: number) => {
    const { column, row } = squareOf(level.level, i);
    return `cột ${column} hàng ${row}`;
  };
  const goals = [...level.level.goals].sort((a, b) => a - b);
  const pending = state.boxes.filter((b) => !level.level.goals.has(b));
  const done = state.boxes.filter((b) => level.level.goals.has(b));
  const empty = goals.filter((g) => !state.boxes.includes(g));
  return [
    `Bàn cờ ${level.level.width} trên ${level.level.height}`,
    `Bạn ở ${at(state.player)}`,
    ...pending.map((b) => `Thùng ở ${at(b)}`),
    ...done.map((b) => `Thùng đã vào đích ở ${at(b)}`),
    ...empty.map((g) => `Đích trống ở ${at(g)}`),
    `${done.length} trên ${state.boxes.length} thùng đã vào đích`,
  ].join(". ") + ".";
}

test("bàn cờ tự mô tả cho trình đọc màn hình theo vị trí: người, từng thùng, từng đích trống", { tag: ["@TC-ACCESSIBILITY-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await expect(gamePage.board()).toHaveAttribute("role", "img");
  await expect(gamePage.board()).toHaveAccessibleName(description([]));
  // Up to and including the first crate that lands on a goal, the description follows every step.
  const firstOnGoal = BEST.moves.findIndex((_, i) => play(level.level, level.start, BEST.moves.slice(0, i + 1)).state.boxes.some((b) => level.level.goals.has(b)));
  const prefix = BEST.moves.slice(0, firstOnGoal + 1);
  await gamePage.play(prefix);
  await expect(gamePage.board()).toHaveAccessibleName(description(prefix));
});

test("mọi nút trên trang chủ và màn chơi đều có tên đọc được", { tag: ["@TC-ACCESSIBILITY-002"] }, async ({ gamePage }) => {
  await gamePage.gotoHome();
  for (const name of await gamePage.buttonNames()) expect(name.length, "a button without a name on Home").toBeGreaterThan(0);
  await gamePage.gotoLevel(FIRST_LEVEL);
  const names = await gamePage.buttonNames();
  for (const name of names) expect(name.length, "a button without a name on Play").toBeGreaterThan(0);
  expect(names).toContain(copy.play.back);
});

test("chơi trọn từ trang chủ chỉ bằng bàn phím, tiêu điểm luôn có viền thấy được", { tag: ["@TC-ACCESSIBILITY-003", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.gotoHome();
  // Tab from the top of the page until the first level tile has focus; every stop shows a ring.
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press("Tab");
    const focus = await gamePage.focused();
    expect(focus.ring, `no focus ring on "${focus.name}"`).toBe(true);
    if (focus.name.startsWith("Màn 1,")) break;
  }
  expect((await gamePage.focused()).name).toMatch(/^Màn 1, /);
  await page.keyboard.press("Enter");
  await gamePage.board().waitFor();
  await gamePage.play(BEST.moves);
  await expect(gamePage.win.dialog()).toBeVisible();
});

test("lớp phủ thắng là hộp thoại thật: nhận tiêu điểm, giữ Tab bên trong, Escape đóng và trả tiêu điểm", { tag: ["@TC-ACCESSIBILITY-004"] }, async ({ page, gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  await gamePage.restartButton().focus();
  await gamePage.play(BEST.moves);
  const dialog = gamePage.win.dialog();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(gamePage.win.restart()).toBeFocused();
  // Three buttons inside: Tab five times never leaves the dialog.
  for (let i = 0; i < 5; i += 1) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(gamePage.restartButton()).toBeFocused();
});

test("trạng thái ô phân biệt bằng hình dạng chứ không chỉ bằng màu", { tag: ["@TC-ACCESSIBILITY-005"] }, async ({ gamePage }) => {
  await gamePage.gotoLevel(FIRST_LEVEL);
  expect(await gamePage.shapes()).toEqual({ rings: 2, bracedCrates: 2, checkedCrates: 0, playerHasHead: true });
  const firstOnGoal = BEST.moves.findIndex((_, i) => play(level.level, level.start, BEST.moves.slice(0, i + 1)).state.boxes.some((b) => level.level.goals.has(b)));
  await gamePage.play(BEST.moves.slice(0, firstOnGoal + 1));
  // The filled goal loses its ring; its crate trades the braces for a check.
  expect(await gamePage.shapes()).toEqual({ rings: 1, bracedCrates: 1, checkedCrates: 1, playerHasHead: true });
});
