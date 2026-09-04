import { describe, expect, it } from "vitest";

import { parseXsb } from "./level";
import { solutionIsValid, solve } from "./solver";
import type { SolverBudget } from "./types";

/** Rộng rãi: các fixture dưới đây đều nhỏ, ngân sách không được là biến số của test. */
const GENEROUS: SolverBudget = { maxNodes: 200_000, maxMillis: 10_000 };

describe("solve", () => {
  it("giải màn một cú đẩy và trả đúng một lượt đẩy", () => {
    const state = parseXsb(["#######", "#@$.  #", "#######"]);
    const result = solve(state, GENEROUS);

    expect(result.status).toBe("solved");
    if (result.status !== "solved") return;
    expect(result.pushes).toBe(1);
    expect(result.moves).toBe(1);
    expect(result.solution).toEqual(["right"]);
    expect(solutionIsValid(state, result.solution)).toBe(true);
  });

  it("giải màn nhiều thùng và lời giải phát lại được bằng luật chơi", () => {
    const state = parseXsb([
      "########",
      "#      #",
      "# $  . #",
      "# $  . #",
      "#  @   #",
      "########"
    ]);
    const result = solve(state, GENEROUS);

    expect(result.status).toBe("solved");
    if (result.status !== "solved") return;
    expect(solutionIsValid(state, result.solution)).toBe(true);
    expect(result.moves).toBe(result.solution.length);
    expect(result.moves).toBeGreaterThanOrEqual(result.pushes);
  });

  it("trả đúng số đẩy tối ưu khi biết trước tối ưu", () => {
    // Thùng (2,2) tới đích (3,3): một cú sang phải, một cú xuống. Không có đường
    // nào ít hơn hai lần đẩy vì khoảng cách Manhattan đã là 2.
    const corner = parseXsb(["#####", "#@  #", "# $ #", "#  .#", "#####"]);
    const cornerResult = solve(corner, GENEROUS);

    expect(cornerResult.status).toBe("solved");
    if (cornerResult.status !== "solved") return;
    expect(cornerResult.pushes).toBe(2);
    expect(solutionIsValid(corner, cornerResult.solution)).toBe(true);

    // Hành lang thẳng: thùng cách đích ba ô ⇒ đúng ba lượt đẩy, ba nước đi.
    const corridor = parseXsb(["#######", "#@$  .#", "#######"]);
    const corridorResult = solve(corridor, GENEROUS);

    expect(corridorResult.status).toBe("solved");
    if (corridorResult.status !== "solved") return;
    expect(corridorResult.pushes).toBe(3);
    expect(corridorResult.moves).toBe(3);
  });

  it("hai thùng, mỗi thùng ba ô ngang ⇒ tối ưu đúng sáu lượt đẩy", () => {
    const state = parseXsb([
      "########",
      "#      #",
      "# $  . #",
      "# $  . #",
      "#  @   #",
      "########"
    ]);
    const result = solve(state, GENEROUS);

    expect(result.status).toBe("solved");
    if (result.status !== "solved") return;
    expect(result.pushes).toBe(6);
  });

  it("kết luận vô nghiệm khi thùng duy nhất bị nhốt trong góc ngoài đích", () => {
    const state = parseXsb(["#####", "#$  #", "#@ .#", "#####"]);
    const result = solve(state, GENEROUS);

    expect(result.status).toBe("unsolvable");
  });

  it("kết luận vô nghiệm khi đã duyệt cạn không gian còn ngân sách", () => {
    // Thùng chỉ trượt ngang được (đẩy dọc cần người chơi đứng trong tường) nên
    // không bao giờ xuống được hàng dưới. Không có ô chết nào bắt được ca này —
    // phải duyệt hết mới kết luận, và đó chính là điều cần kiểm.
    const state = parseXsb(["#######", "#@$   #", "#  .  #", "#######"]);
    const result = solve(state, GENEROUS);

    expect(result.status).toBe("unsolvable");
  });

  it("dừng bằng timeout khi trần số nút quá nhỏ, không nói dối là vô nghiệm", () => {
    const state = parseXsb([
      "#########",
      "#       #",
      "# $$$   #",
      "# @     #",
      "#  ...  #",
      "#       #",
      "#########"
    ]);
    const result = solve(state, { maxNodes: 5, maxMillis: 10_000 });

    expect(result.status).toBe("timeout");
    expect(result.nodes).toBeGreaterThan(5);

    // Cùng màn đó với ngân sách thật thì giải được — tức `timeout` ở trên đúng là
    // hết ngân sách chứ không phải màn hỏng.
    const full = solve(state, GENEROUS);
    expect(full.status).toBe("solved");
    if (full.status !== "solved") return;
    expect(solutionIsValid(state, full.solution)).toBe(true);
  });

  it("nhận ra màn đã thắng sẵn", () => {
    const state = parseXsb(["#####", "#@* #", "#####"]);
    const result = solve(state, GENEROUS);

    expect(result.status).toBe("solved");
    if (result.status !== "solved") return;
    expect(result.pushes).toBe(0);
    expect(result.solution).toEqual([]);
  });
});

describe("solutionIsValid", () => {
  it("bác lời giải chưa đưa hết thùng về đích", () => {
    const state = parseXsb(["#######", "#@$  .#", "#######"]);

    expect(solutionIsValid(state, ["right"])).toBe(false);
    expect(solutionIsValid(state, ["right", "right", "right"])).toBe(true);
  });

  it("bác lời giải chứa nước đi bất hợp lệ", () => {
    const state = parseXsb(["#######", "#@$  .#", "#######"]);

    expect(solutionIsValid(state, ["up"])).toBe(false);
    expect(solutionIsValid(state, ["left"])).toBe(false);
  });
});
