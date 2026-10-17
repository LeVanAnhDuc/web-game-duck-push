import type { Locator, Page } from "@playwright/test";
import { copy } from "@/data/copy";
import type { Difficulty } from "@/data/levels";
import type { Direction } from "@/utils/sokoban";
import { BasePage } from "./base.page";

/** A board square as the board's aria-label names it: column and row, counted from 1. */
export interface Square {
  readonly column: number;
  readonly row: number;
}

/** What the board tells a screen reader, parsed (../client/src/lib/boardLabel.ts). */
export interface BoardReading {
  readonly width: number;
  readonly height: number;
  readonly player: Square;
  readonly crates: readonly Square[];
  readonly cratesOnGoal: readonly Square[];
  readonly emptyGoals: readonly Square[];
  readonly label: string;
}

export interface Counters {
  readonly moves: number;
  readonly pushes: number;
  readonly time: string;
}

const KEYS: Readonly<Record<Direction, string>> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};

const STEP: Readonly<Record<Direction, Square>> = {
  up: { column: 0, row: -1 },
  down: { column: 0, row: 1 },
  left: { column: -1, row: 0 },
  right: { column: 1, row: 0 },
};

function squares(label: string, prefix: string): Square[] {
  const re = new RegExp(`(?:^|\\. )${prefix} ở cột (\\d+) hàng (\\d+)`, "g");
  return [...label.matchAll(re)].map((m) => ({ column: Number(m[1]), row: Number(m[2]) }));
}

/**
 * Duck Push is one route with two screens swapped by state: Home (campaign grid, random level, resume card) and Play
 * (board, HUD, controls, win dialog). One page object covers both, plus the win dialog.
 * Navigation is always relative ("./…"): on prd the game lives under /web-game-duck-push/.
 */
export class GamePage extends BasePage {
  readonly win: WinDialog;

  constructor(page: Page) {
    super(page);
    this.win = new WinDialog(page);
  }

  // ---------- navigation ----------

  async gotoHome(): Promise<void> {
    await this.page.goto("./");
    await this.levelTile(1).waitFor();
  }

  async gotoLevel(id: string): Promise<void> {
    const difficulty = id.split("-")[0];
    await this.page.goto(`./?level=${id}&d=${difficulty}`);
    await this.board().waitFor();
  }

  async gotoSeed(seed: number | string, difficulty: Difficulty = "easy"): Promise<void> {
    await this.page.goto(`./?seed=${seed}&d=${difficulty}`);
  }

  // ---------- home ----------

  title(): Locator {
    return this.page.getByRole("heading", { name: copy.home.title, level: 1 });
  }

  themeToggle(): Locator {
    return this.page.getByRole("button", { name: /^Giao diện: / });
  }

  randomButton(): Locator {
    return this.page.getByTestId("random-level");
  }

  difficultyTab(difficulty: Difficulty): Locator {
    return this.page.getByRole("group", { name: copy.home.difficultyGroup }).getByRole("button", { name: copy.difficulty[difficulty], exact: true });
  }

  levelTiles(): Locator {
    return this.page.getByRole("button", { name: /^Màn \d+, / });
  }

  levelTile(n: number): Locator {
    return this.page.getByRole("button", { name: new RegExp(`^Màn ${n}, `) });
  }

  legend(): Locator {
    return this.page.getByText(copy.home.legendOptimal).locator("..").locator("..");
  }

  resumeSection(): Locator {
    return this.page.getByRole("region", { name: copy.home.resumeHeading });
  }

  resumeButton(): Locator {
    return this.resumeSection().getByRole("button");
  }

  /** The home notice after a broken link (Next adds an empty role="alert" route announcer, so filter by text). */
  notice(text: string | RegExp): Locator {
    return this.page.getByRole("alert").filter({ hasText: text });
  }

  async chooseDifficulty(difficulty: Difficulty): Promise<void> {
    await this.difficultyTab(difficulty).click();
  }

  async openTile(n: number): Promise<void> {
    await this.levelTile(n).click();
    await this.board().waitFor();
  }

  // ---------- play ----------

  board(): Locator {
    return this.page.getByTestId("board");
  }

  hud(): Locator {
    return this.page.getByTestId("hud-counters");
  }

  /** "Tối ưu N đẩy · KL bạn …" under the counters. */
  targets(): Locator {
    return this.page.getByText(/^Tối ưu \d+ đẩy · KL bạn /);
  }

  levelHeading(): Locator {
    return this.page.getByRole("banner").getByRole("heading", { level: 1 });
  }

  levelSubtitle(): Locator {
    return this.page.getByRole("banner").getByRole("paragraph");
  }

  backButton(): Locator {
    return this.page.getByRole("button", { name: copy.play.back });
  }

  /** The control row's buttons. `exact` keeps "Chơi lại" apart from the win dialog's twin while it is closed. */
  undoButton(): Locator {
    return this.page.getByRole("button", { name: copy.play.undo, exact: true }).last();
  }

  redoButton(): Locator {
    return this.page.getByRole("button", { name: copy.play.redo, exact: true });
  }

  restartButton(): Locator {
    return this.page.getByRole("button", { name: copy.play.restart, exact: true }).first();
  }

  resultButton(): Locator {
    return this.page.getByRole("button", { name: copy.play.result, exact: true });
  }

  keyHint(): Locator {
    return this.page.getByText(copy.play.keyHint);
  }

  dpad(direction: Direction): Locator {
    return this.page.getByRole("button", { name: copy.play.dpad[direction], exact: true });
  }

  deadlockBanner(): Locator {
    return this.page.getByTestId("deadlock-banner");
  }

  deadlockUndo(): Locator {
    return this.deadlockBanner().getByRole("button", { name: copy.play.undo });
  }

  /** The polite live region that announces a win and a stuck crate (NFR-A11Y-04). */
  liveRegion(): Locator {
    return this.page.locator("p.sr-only[aria-live='polite']");
  }

  async press(direction: Direction): Promise<void> {
    await this.page.keyboard.press(KEYS[direction]);
  }

  /** Plays a sequence by keyboard. Each press is awaited, and the board answers synchronously. */
  async play(moves: readonly Direction[]): Promise<void> {
    for (const direction of moves) await this.press(direction);
  }

  async reading(): Promise<BoardReading> {
    const label = (await this.board().getAttribute("aria-label")) ?? "";
    const size = /^Bàn cờ (\d+) trên (\d+)/.exec(label);
    const [player] = squares(label, "Bạn");
    if (!size || !player) throw new Error(`unreadable board label: ${label}`);
    return {
      width: Number(size[1]),
      height: Number(size[2]),
      player,
      crates: squares(label, "Thùng"),
      cratesOnGoal: squares(label, "Thùng đã vào đích"),
      emptyGoals: squares(label, "Đích trống"),
      label,
    };
  }

  async counters(): Promise<Counters> {
    const text = (await this.hud().textContent()) ?? "";
    const m = /Bước (\d+) · Đẩy (\d+) · (\d\d:\d\d)/.exec(text);
    if (!m) throw new Error(`unreadable HUD: ${text}`);
    return { moves: Number(m[1]), pushes: Number(m[2]), time: m[3]! };
  }

  /** Point of a square's centre on screen, from the board's box and its size in squares. */
  async squareCentre(square: Square): Promise<{ x: number; y: number }> {
    const box = await this.board().boundingBox();
    const { width, height } = await this.reading();
    if (!box) throw new Error("board not on screen");
    const cw = box.width / width;
    const ch = box.height / height;
    return { x: box.x + (square.column - 0.5) * cw, y: box.y + (square.row - 0.5) * ch };
  }

  /** Clicks the square next to the player in `direction` (FR-16). */
  async clickNeighbour(direction: Direction): Promise<void> {
    const { player } = await this.reading();
    await this.clickSquare({ column: player.column + STEP[direction].column, row: player.row + STEP[direction].row });
  }

  async clickSquare(square: Square): Promise<void> {
    const { x, y } = await this.squareCentre(square);
    await this.page.mouse.click(x, y);
  }

  /** Writes one of the game's localStorage keys (the page must be on the site's origin), as a returning player has it. */
  async writeStorage(key: string, value: unknown): Promise<void> {
    await this.page.evaluate(([k, v]) => localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)), [key, value] as const);
  }

  async readStorage<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.page.evaluate((k) => localStorage.getItem(k), key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  /** Square size in CSS px. */
  async cellSize(): Promise<number> {
    const box = await this.board().boundingBox();
    const { width } = await this.reading();
    return box ? box.width / width : 0;
  }
}

/** "Xong màn!" — the only real dialog in the game. */
export class WinDialog {
  constructor(readonly page: Page) {}

  dialog(): Locator {
    return this.page.getByRole("dialog", { name: copy.win.title });
  }

  stats(): Locator {
    return this.page.getByTestId("win-stats");
  }

  restart(): Locator {
    return this.dialog().getByRole("button", { name: copy.win.restart });
  }

  next(): Locator {
    return this.dialog().getByRole("button", { name: copy.win.next, exact: true });
  }

  random(): Locator {
    return this.dialog().getByRole("button", { name: copy.win.random });
  }
}
