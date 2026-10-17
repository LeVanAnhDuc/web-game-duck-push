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
  readonly account: AccountMenu;

  constructor(page: Page) {
    super(page);
    this.win = new WinDialog(page);
    this.account = new AccountMenu(page);
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

  /** The home header row: wordmark, (account), theme toggle. */
  header(): Locator {
    return this.page.getByRole("main").locator("header").first();
  }

  async pageOverflowX(): Promise<number> {
    return this.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
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

  /**
   * The mark drawn on a level tile: a check (solved) or a star (optimal). They are aria-hidden icons, so the only handle
   * is the icon's own class (lucide-react); the tile's accessible name carries the same fact in words.
   */
  tileMark(n: number, mark: "check" | "star"): Locator {
    return this.levelTile(n).locator(`svg.lucide-${mark}`);
  }

  legendItem(text: string): Locator {
    return this.page.getByText(text, { exact: true });
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

  /**
   * A real finger drag through CDP (touchStart → touchMove → touchEnd), starting at the board's centre and moving by
   * (dx, dy) CSS px. The game reads touch events, so a synthetic pointer drag would not count.
   */
  async swipe(dx: number, dy: number): Promise<void> {
    const box = await this.board().boundingBox();
    if (!box) throw new Error("board not on screen");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const cdp = await this.page.context().newCDPSession(this.page);
    const point = (px: number, py: number) => [{ x: px, y: py, id: 1 }];
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: point(x, y) });
    for (let i = 1; i <= 4; i += 1) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: point(x + (dx * i) / 4, y + (dy * i) / 4) });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
  }

  /** A finger tap on a square (touch devices). */
  async tapSquare(square: Square): Promise<void> {
    const { x, y } = await this.squareCentre(square);
    await this.page.touchscreen.tap(x, y);
  }

  /**
   * The fading trail drawn on the floor, oldest dot first, as squares plus each dot's opacity
   * (../client/src/views/Play/components/TrailDots). The dots are aria-hidden and carry no test id, so they are told
   * apart from goal rings by their fill (`--color-accent`) and placed by the board's own translate3d, which is
   * column × cell, row × cell.
   */
  async trail(): Promise<{ square: Square; opacity: number }[]> {
    const { width } = await this.reading();
    return this.board().evaluate((board, columns) => {
      const cell = board.clientWidth / columns;
      const out: { square: { column: number; row: number }; opacity: number }[] = [];
      for (const wrapper of Array.from(board.children) as HTMLElement[]) {
        const dot = wrapper.firstElementChild as HTMLElement | null;
        if (!dot || !dot.style.background.includes("--color-accent")) continue;
        const m = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(wrapper.style.transform);
        if (!m) continue;
        out.push({
          square: { column: Math.round(Number(m[1]) / cell) + 1, row: Math.round(Number(m[2]) / cell) + 1 },
          opacity: Number(dot.style.opacity),
        });
      }
      return out;
    }, width);
  }

  /** The moving pieces of the board (player and crates): the only elements that animate on a step. */
  sprites(): Locator {
    return this.board().locator(".cell-sprite");
  }

  /** The page background as rendered, e.g. "rgb(250, 248, 243)". */
  async background(): Promise<string> {
    return this.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  }

  /** Accessible names of every button on screen, in DOM order. */
  async buttonNames(): Promise<string[]> {
    const buttons = this.page.getByRole("button");
    const names: string[] = [];
    for (const button of await buttons.all()) {
      const label = (await button.getAttribute("aria-label")) ?? (await button.innerText());
      names.push(label.trim());
    }
    return names;
  }

  /** What has keyboard focus: its accessible label or text, and whether a focus ring is drawn on it. */
  async focused(): Promise<{ name: string; ring: boolean }> {
    return this.page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return { name: "", ring: false };
      const style = getComputedStyle(el);
      const ring = (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none";
      return { name: (el.getAttribute("aria-label") ?? el.innerText ?? "").trim(), ring };
    });
  }

  /**
   * How each piece is DRAWN, not coloured (NFR-A11Y-06): goals are round rings, a crate off a goal carries two diagonal
   * braces, a crate on a goal carries one check stroke, the player is a circle plus shoulders. Read from the board's SVG.
   */
  async shapes(): Promise<{ rings: number; bracedCrates: number; checkedCrates: number; playerHasHead: boolean }> {
    return this.board().evaluate((board) => {
      const sprites = [...board.querySelectorAll<HTMLElement>(".cell-sprite")];
      const crates = sprites.filter((s) => !s.querySelector("circle"));
      const player = sprites.find((s) => s.querySelector("circle"));
      const rings = [...board.querySelectorAll<HTMLElement>("div")].filter((d) => d.style.borderRadius === "9999px" && d.style.border !== "").length;
      return {
        rings,
        bracedCrates: crates.filter((c) => c.querySelectorAll("path").length === 2).length,
        checkedCrates: crates.filter((c) => c.querySelectorAll("path").length === 1).length,
        playerHasHead: !!player,
      };
    });
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

/** Ducker ID sign-in button + account menu (only rendered when the feature flag is on - ADR-0010). */
export class AccountMenu {
  constructor(readonly page: Page) {}

  signInButton(): Locator {
    // exact: the in-flight label "Đang đăng nhập…" contains the words too
    return this.page.getByRole("button", { name: copy.ducker.signIn, exact: true });
  }

  trigger(): Locator {
    return this.page.getByRole("button", { name: copy.ducker.menu });
  }

  menu(): Locator {
    return this.page.getByRole("menu", { name: copy.ducker.menu });
  }

  profileLink(): Locator {
    return this.page.getByRole("menuitem", { name: copy.ducker.openProfile });
  }

  signOutItem(): Locator {
    return this.page.getByRole("menuitem", { name: copy.ducker.signOut });
  }

  /** Clicks "Đăng nhập" and waits for the round trip: away to the issuer's authorize URL and back, page loaded. */
  async signInRoundTrip(issuer: string): Promise<void> {
    const bounced = this.page.waitForResponse((r) => r.url().startsWith(`${issuer}/oauth/authorize`));
    await this.signInButton().click();
    await bounced;
    await this.page.waitForLoadState("load");
  }
}
