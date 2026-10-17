import { expect, test, type Page } from "@playwright/test";

import easyPack from "../src/game/levels/data/easy.json";
import { parseXsb } from "../src/game/core/level";
import { solve } from "../src/game/core/solver";
import type { Direction } from "../src/game/core/types";

/**
 * E2E chạy trên bản build tĩnh thật, không phải bản dev.
 *
 * Lời giải dùng để bấm phím **không viết tay** — nó do chính solver của dự án tính
 * ra ngay trong test. Nghĩa là mỗi lần chạy, bộ test này kiểm luôn một điều mà unit
 * test không với tới được: lời giải solver nói là đúng thì bấm vào giao diện thật
 * cũng thắng thật. Sinh lại pack là test tự đi theo, không phải sửa tay.
 */

const KEY_BY_DIRECTION: Readonly<Record<Direction, string>> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight"
};

const firstLevel = easyPack.levels[0]!;

function solutionForFirstLevel(): { solution: Direction[]; pushes: number } {
  const state = parseXsb(firstLevel.xsb);
  const result = solve(state, { maxNodes: 500_000, maxMillis: 30_000 });
  if (result.status !== "solved") throw new Error(`Không giải được ${firstLevel.id}`);
  return { solution: [...result.solution], pushes: result.pushes };
}

async function openFirstLevel(page: Page) {
  await page.goto(`/?level=${firstLevel.id}&d=easy`);
  await expect(page.getByTestId("board")).toBeVisible();
}

async function play(page: Page, moves: readonly Direction[]) {
  for (const direction of moves) {
    await page.keyboard.press(KEY_BY_DIRECTION[direction]);
  }
}

test.describe("chơi một màn chiến dịch", () => {
  test("giải xong bằng bàn phím và được ghi nhận đạt tối ưu", async ({ page }) => {
    const { solution, pushes } = solutionForFirstLevel();
    await openFirstLevel(page);

    await play(page, solution);

    const stats = page.getByTestId("win-stats");
    await expect(stats).toBeVisible();
    await expect(stats).toContainText(`${solution.length} bước`);
    await expect(stats).toContainText(`${pushes} đẩy`);
    // Đi đúng lời giải tối ưu thì phải được công nhận là tối ưu.
    await expect(page.getByText(/tối ưu/i).first()).toBeVisible();
  });

  test("kỷ lục sống qua một lần tải lại trang", async ({ page }) => {
    const { solution, pushes } = solutionForFirstLevel();
    await openFirstLevel(page);
    await play(page, solution);
    await expect(page.getByTestId("win-stats")).toBeVisible();

    await page.goto("/");
    const tile = page.getByRole("button", { name: /^Màn 1, đã giải/ });
    await expect(tile).toBeVisible();
    await expect(tile).toContainText(`${pushes} đẩy`);
  });

  test("hoàn tác lùi đúng một nước và trả bộ đếm về chỗ cũ", async ({ page }) => {
    await openFirstLevel(page);
    const counters = page.getByTestId("hud-counters");
    const before = await counters.textContent();

    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("KeyZ");
    await page.keyboard.press("KeyZ");

    await expect(counters).toHaveText(before ?? "");
  });

  test("phím mũi tên không cuộn trang, và bàn cờ không có thanh cuộn", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await openFirstLevel(page);

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    const overflow = await page.evaluate(() => {
      const board = document.querySelector('[data-testid="board"]');
      return {
        pageScrollX: window.scrollX,
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        boardOverflowX: board === null ? -1 : board.scrollWidth - board.clientWidth,
        boardOverflowY: board === null ? -1 : board.scrollHeight - board.clientHeight
      };
    });

    expect(overflow.pageScrollX).toBe(0);
    expect(overflow.documentOverflow).toBeLessThanOrEqual(0);
    expect(overflow.boardOverflowX).toBeLessThanOrEqual(0);
    expect(overflow.boardOverflowY).toBeLessThanOrEqual(0);
  });
});

test.describe("trang chủ", () => {
  test("sinh một màn ngẫu nhiên mà không đóng băng trang", async ({ page }) => {
    await page.goto("/");
    const button = page.getByTestId("random-level");
    await expect(button).toBeVisible();

    await button.click();

    // Trong lúc Worker sinh màn, luồng chính phải còn trả lời được (NFR-PERF-08).
    const responded = await page.evaluate(() => document.title);
    expect(responded).toBeTruthy();

    await expect(page.getByTestId("board")).toBeVisible({ timeout: 20_000 });
    // Seed phải nằm trong URL để chia sẻ lại được (FR-11).
    await expect(page).toHaveURL(/seed=\d+/);
  });

  test("đường dẫn có seed hỏng thì quay về trang chủ với lời nhắn đọc được", async ({ page }) => {
    await page.goto("/?seed=khong-phai-so&d=easy");
    // Next tự chèn một `role="alert"` rỗng làm route announcer, nên phải lọc theo
    // nội dung thay vì lấy vai trò — không thì selector khớp hai phần tử.
    const message = page.getByRole("alert").filter({ hasText: /seed/i });
    await expect(message).toBeVisible();
    await expect(page.getByTestId("random-level")).toBeVisible();
  });
});
