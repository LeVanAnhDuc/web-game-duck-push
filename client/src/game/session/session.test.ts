import { describe, expect, it } from "vitest";

import { parseXsb } from "@/game/core/level";
import type { Direction, Level } from "@/game/core/types";
import {
  applyMove,
  createSession,
  elapsedMs,
  moveHistory,
  redo,
  replay,
  restart,
  undo
} from "./session";
import { TRAIL_LENGTH } from "./types";

/**
 * Hai màn cố định cho cả file. Dùng XSB chứ không dựng `LevelState` bằng tay để
 * test đọc được bằng mắt — nhìn là biết thùng ở đâu.
 */

/** `#@ $. #` — đi phải một bước (không đẩy), rồi đẩy một cái là thắng. */
const TINY_XSB = ["#######", "#@ $. #", "#######"] as const;

/** Hành lang dài, đủ chỗ đi hơn `TRAIL_LENGTH` bước mà chưa chạm thùng. */
const CORRIDOR_XSB = ["####################", "#@              $. #", "####################"] as const;

function makeLevel(xsb: readonly string[], optimalPushes: number, optimalMoves: number): Level {
  return {
    id: "test-level",
    seed: 42,
    difficulty: "easy",
    initial: parseXsb(xsb),
    optimalPushes,
    optimalMoves
  };
}

const tinyLevel = makeLevel(TINY_XSB, 1, 2);
const corridorLevel = makeLevel(CORRIDOR_XSB, 1, 15);

function apply(level: Level, moves: readonly Direction[], now = 0) {
  let session = createSession(level, now);
  for (const move of moves) session = applyMove(session, move, now);
  return session;
}

describe("createSession", () => {
  it("bắt đầu ở trạng thái đầu của màn, bộ đếm bằng không", () => {
    const session = createSession(tinyLevel, 1_000);

    expect(session.current).toBe(tinyLevel.initial);
    expect(session.moves).toBe(0);
    expect(session.pushes).toBe(0);
    expect(session.solved).toBe(false);
    expect(session.past).toEqual([]);
    expect(session.future).toEqual([]);
    expect(session.trail).toEqual([tinyLevel.initial.player]);
    expect(session.startedAt).toBe(1_000);
  });
});

describe("applyMove", () => {
  it("trả về ĐÚNG object cũ khi nước đi không hợp lệ", () => {
    const session = createSession(tinyLevel, 0);
    // Phía trên người chơi là tường.
    expect(applyMove(session, "up", 0)).toBe(session);
    expect(applyMove(session, "left", 0)).toBe(session);
  });

  it("trả về ĐÚNG object cũ khi ván đã thắng", () => {
    const solved = apply(tinyLevel, ["right", "right"]);
    expect(solved.solved).toBe(true);
    expect(applyMove(solved, "left", 0)).toBe(solved);
  });

  it("đi thường chỉ tăng moves, đẩy thì tăng cả hai", () => {
    const walked = apply(tinyLevel, ["right"]);
    expect(walked.moves).toBe(1);
    expect(walked.pushes).toBe(0);

    const pushed = applyMove(walked, "right", 0);
    expect(pushed.moves).toBe(2);
    expect(pushed.pushes).toBe(1);
  });

  it("không sửa session đầu vào", () => {
    const session = createSession(tinyLevel, 0);
    const snapshot = {
      current: session.current,
      moves: session.moves,
      pushes: session.pushes,
      pastLength: session.past.length,
      trail: [...session.trail]
    };

    applyMove(session, "right", 0);

    expect(session.current).toBe(snapshot.current);
    expect(session.moves).toBe(snapshot.moves);
    expect(session.pushes).toBe(snapshot.pushes);
    expect(session.past.length).toBe(snapshot.pastLength);
    expect(session.trail).toEqual(snapshot.trail);
  });

  it("thắng thì bật solved và chốt đồng hồ lại", () => {
    let session = createSession(tinyLevel, 1_000);
    session = applyMove(session, "right", 2_000);
    expect(session.solved).toBe(false);
    session = applyMove(session, "right", 4_500);

    expect(session.solved).toBe(true);
    expect(session.elapsedMs).toBe(3_500);
    // Đồng hồ đứng: `now` sau đó bao nhiêu cũng không đổi con số.
    expect(elapsedMs(session, 999_999)).toBe(3_500);
  });
});

describe("undo", () => {
  it("trả về ĐÚNG object cũ khi chưa đi nước nào", () => {
    const session = createSession(tinyLevel, 0);
    expect(undo(session)).toBe(session);
  });

  it("khôi phục nguyên trạng thái và bộ đếm trước đó", () => {
    const before = apply(tinyLevel, ["right"]);
    const after = applyMove(before, "right", 0);
    const back = undo(after);

    expect(back.current).toEqual(before.current);
    expect(back.moves).toBe(before.moves);
    expect(back.pushes).toBe(before.pushes);
    expect(back.trail).toEqual(before.trail);
    expect(back.solved).toBe(false);
    expect(back.future).toHaveLength(1);
  });

  it("gỡ trạng thái thắng để chơi tiếp được", () => {
    const solved = apply(tinyLevel, ["right", "right"]);
    const back = undo(solved);

    expect(back.solved).toBe(false);
    expect(applyMove(back, "right", 0)).not.toBe(back);
  });
});

describe("redo", () => {
  it("trả về ĐÚNG object cũ khi future rỗng", () => {
    const session = apply(tinyLevel, ["right"]);
    expect(redo(session)).toBe(session);
  });

  it("undo rồi redo quay lại đúng trạng thái cũ", () => {
    const session = apply(corridorLevel, ["right", "right", "right"]);
    const roundTripped = redo(undo(session));

    expect(roundTripped.current).toEqual(session.current);
    expect(roundTripped.moves).toBe(session.moves);
    expect(roundTripped.pushes).toBe(session.pushes);
    expect(roundTripped.trail).toEqual(session.trail);
    expect(roundTripped.past).toEqual(session.past);
    expect(roundTripped.future).toEqual([]);
  });

  it("phục hồi đúng bộ đếm đẩy", () => {
    const solved = apply(tinyLevel, ["right", "right"]);
    const back = undo(solved);
    expect(back.pushes).toBe(0);

    const again = redo(back);
    expect(again.pushes).toBe(1);
    expect(again.solved).toBe(true);
  });

  it("đi một nước mới thì xoá sạch future", () => {
    const session = apply(corridorLevel, ["right", "right"]);
    const back = undo(session);
    expect(back.future).toHaveLength(1);

    const branched = applyMove(back, "left", 0);
    expect(branched.future).toEqual([]);
    expect(redo(branched)).toBe(branched);
  });
});

describe("trail", () => {
  it("dừng ở TRAIL_LENGTH ô và vẫn đúng sau hai lần undo", () => {
    const moves: Direction[] = Array.from({ length: 14 }, () => "right");
    const session = apply(corridorLevel, moves);

    expect(session.moves).toBe(14);
    expect(session.pushes).toBe(0);
    expect(session.trail).toHaveLength(TRAIL_LENGTH);

    const start = corridorLevel.initial.player;
    // 15 ô đã đi qua (kể cả ô xuất phát), chỉ giữ 12 ô cuối.
    const expected = Array.from({ length: TRAIL_LENGTH }, (_, i) => start + 3 + i);
    expect([...session.trail]).toEqual(expected);
    expect(session.trail[session.trail.length - 1]).toBe(session.current.player);

    // Lùi hai bước: vệt phải trượt lại, KHÔNG được ngắn đi.
    const back = undo(undo(session));
    expect(back.trail).toHaveLength(TRAIL_LENGTH);
    expect([...back.trail]).toEqual(expected.map((cell) => cell - 2));
    expect(back.trail[back.trail.length - 1]).toBe(back.current.player);
  });
});

describe("replay", () => {
  it("cho ra đúng trạng thái như đi từng nước một", () => {
    const moves: Direction[] = ["right", "right", "left", "right"];
    const oneByOne = apply(corridorLevel, moves, 7_000);
    const replayed = replay(corridorLevel, moves, 7_000);

    expect(replayed.current).toEqual(oneByOne.current);
    expect(replayed.moves).toBe(oneByOne.moves);
    expect(replayed.pushes).toBe(oneByOne.pushes);
    expect(replayed.trail).toEqual(oneByOne.trail);
    expect(moveHistory(replayed)).toEqual(moves);
  });

  it("bỏ qua nước không hợp lệ thay vì ném lỗi", () => {
    // "up" đâm tường ở mọi thời điểm trong hành lang.
    const replayed = replay(corridorLevel, ["up", "right", "up", "right"], 0);

    expect(replayed.moves).toBe(2);
    expect(moveHistory(replayed)).toEqual(["right", "right"]);
  });

  it("phát lại được tới trạng thái thắng", () => {
    const replayed = replay(tinyLevel, ["right", "right"], 0);
    expect(replayed.solved).toBe(true);
  });
});

describe("restart", () => {
  it("trả về ván mới cùng màn, đồng hồ chạy lại", () => {
    const session = apply(tinyLevel, ["right"], 1_000);
    const fresh = restart(session, 9_000);

    expect(fresh.current).toBe(tinyLevel.initial);
    expect(fresh.moves).toBe(0);
    expect(fresh.pushes).toBe(0);
    expect(fresh.past).toEqual([]);
    expect(fresh.future).toEqual([]);
    expect(fresh.startedAt).toBe(9_000);
    expect(elapsedMs(fresh, 9_400)).toBe(400);
  });
});

describe("elapsedMs", () => {
  it("đo từ startedAt khi chưa thắng", () => {
    const session = createSession(tinyLevel, 5_000);
    expect(elapsedMs(session, 5_250)).toBe(250);
  });
});

describe("moveHistory", () => {
  it("trả đúng dãy hướng đã đi, theo thứ tự", () => {
    const session = apply(corridorLevel, ["right", "right", "left"]);
    expect(moveHistory(session)).toEqual(["right", "right", "left"]);
  });

  it("bỏ nước bị hoàn tác", () => {
    const session = undo(apply(corridorLevel, ["right", "right"]));
    expect(moveHistory(session)).toEqual(["right"]);
  });
});
