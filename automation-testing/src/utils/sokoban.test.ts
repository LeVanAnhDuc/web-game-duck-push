import { expect, test } from "@playwright/test";
import { findSequence, isCornerDead, parseXsb, play, solve, step, suboptimalSolution } from "./sokoban";

const ROWS = ["########", "#      #", "#  $ . #", "#   @  #", "#      #", "########"];

test("parses walls, goals, boxes and the player", () => {
  const { level, start } = parseXsb(ROWS);
  expect(level.width).toBe(8);
  expect(level.goals.has(2 * 8 + 5)).toBe(true);
  expect(start.boxes).toEqual([2 * 8 + 3]);
  expect(start.player).toBe(3 * 8 + 4);
});

test("a push into a wall or into another crate is refused", () => {
  const { level } = parseXsb(["#####", "#@$$#", "#####"]);
  expect(step(level, { player: 6, boxes: [7, 8] }, "right").moved).toBe(false);
  const { level: l2 } = parseXsb(["####", "#@$#", "####"]);
  expect(step(l2, { player: 5, boxes: [6] }, "right").moved).toBe(false);
});

test("solves with the fewest pushes and replays to a solved board", () => {
  const { level, start } = parseXsb(ROWS);
  const result = solve(level, start)!;
  expect(result.pushes).toBe(2);
  const end = play(level, start, result.moves);
  expect(end.pushes).toBe(2);
  expect(end.state.boxes.every((b) => level.goals.has(b))).toBe(true);
});

test("finds a suboptimal solution and a dead corner", () => {
  const { level, start } = parseXsb(ROWS);
  const worse = suboptimalSolution(level, start)!;
  expect(worse.pushes).toBeGreaterThan(2);
  const end = play(level, start, worse.moves);
  expect(end.pushes).toBe(worse.pushes);
  expect(end.state.boxes.every((b) => level.goals.has(b))).toBe(true);
  const dead = findSequence(level, start, (_b, _d, after) => after.pushed && after.state.boxes.some((b) => isCornerDead(level, b)));
  expect(dead).not.toBeNull();
});
