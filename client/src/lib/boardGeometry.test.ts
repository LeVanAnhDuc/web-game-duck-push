import { describe, expect, it } from "vitest";
import { cellFromPoint, cellTransform, stepDirection } from "./boardGeometry";

describe("cellTransform", () => {
  it("đổi chỉ số phẳng thành translate3d theo đúng hàng và cột", () => {
    // bàn rộng 5, ô 32px: index 7 là cột 2 hàng 1
    expect(cellTransform(7, 5, 32)).toBe("translate3d(64px, 32px, 0)");
  });
});

describe("cellFromPoint", () => {
  const width = 5;
  const height = 4;
  const cell = 32;

  it("trả về ô chứa điểm được bấm", () => {
    // cột 2 hàng 1 → index 7
    expect(cellFromPoint(70, 40, cell, width, height)).toBe(7);
  });

  it("lấy ô ở góc trên trái khi bấm vào đúng gốc toạ độ", () => {
    expect(cellFromPoint(0, 0, cell, width, height)).toBe(0);
  });

  it("lấy đúng ô cuối cùng khi bấm sát mép trong cùng", () => {
    expect(cellFromPoint(width * cell - 1, height * cell - 1, cell, width, height)).toBe(
      width * height - 1
    );
  });

  it("trả null khi điểm nằm ngoài bàn cờ", () => {
    // Bấm hụt ra ngoài phải thành "không có gì", không phải thành ô gần nhất:
    // ô gần nhất là một nước đi mà người chơi không hề nhắm tới.
    expect(cellFromPoint(-1, 10, cell, width, height)).toBeNull();
    expect(cellFromPoint(10, -1, cell, width, height)).toBeNull();
    expect(cellFromPoint(width * cell, 10, cell, width, height)).toBeNull();
    expect(cellFromPoint(10, height * cell, cell, width, height)).toBeNull();
  });

  it("trả null khi cạnh ô không hợp lệ", () => {
    expect(cellFromPoint(10, 10, 0, width, height)).toBeNull();
  });
});

describe("stepDirection", () => {
  const width = 5;

  it("nhận bốn ô kề trực giao", () => {
    const from = 7; // cột 2 hàng 1
    expect(stepDirection(from, 2, width)).toBe("up");
    expect(stepDirection(from, 12, width)).toBe("down");
    expect(stepDirection(from, 6, width)).toBe("left");
    expect(stepDirection(from, 8, width)).toBe("right");
  });

  it("từ chối ô chéo", () => {
    expect(stepDirection(7, 1, width)).toBeNull();
    expect(stepDirection(7, 3, width)).toBeNull();
    expect(stepDirection(7, 11, width)).toBeNull();
    expect(stepDirection(7, 13, width)).toBeNull();
  });

  it("từ chối ô cách xa hơn một bước", () => {
    expect(stepDirection(7, 9, width)).toBeNull();
    expect(stepDirection(7, 17, width)).toBeNull();
  });

  it("từ chối chính ô đang đứng", () => {
    expect(stepDirection(7, 7, width)).toBeNull();
  });

  it("KHÔNG cho đi vòng qua mép dòng", () => {
    // index 4 là ô cuối dòng 0, index 5 là ô đầu dòng 1. Chúng lệch nhau đúng 1
    // chỉ số nhưng nằm hai đầu bàn cờ — coi chúng là kề nhau thì một cú bấm ở mép
    // trái sẽ làm nhân vật nhảy sang mép phải, và không test nào khác bắt được.
    expect(stepDirection(4, 5, width)).toBeNull();
    expect(stepDirection(5, 4, width)).toBeNull();
  });
});
