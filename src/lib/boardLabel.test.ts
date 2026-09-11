import { describe, expect, it } from "vitest";
import { boardLabel } from "./boardLabel";
import { parseXsb } from "@/game/core/level";

/**
 * Bản mô tả bàn cờ cho trình đọc màn hình (NFR-A11Y-07).
 *
 * Bản cũ chỉ đếm loại — "2 thùng, 0 đã vào đích" — nên trả lời được câu "còn mấy
 * thùng chưa xong" mà không trả lời được câu người chơi thật sự cần: **đi hướng nào**.
 * Phản hồi UX 2026-09 (F-03): một người dùng chỉ bàn phím nói thẳng rằng với chừng
 * đó thông tin thì "đi mò hoàn toàn mù, không biết hướng nào có tường hướng nào trống".
 */

// # tường · khoảng trắng sàn · . đích · $ thùng · @ người · * thùng đã vào đích
const LEVEL = ["#####", "#@$.#", "#   #", "#####"];

describe("boardLabel", () => {
  it("vẫn nói kích thước và số thùng đã vào đích", () => {
    const label = boardLabel(parseXsb(LEVEL));
    expect(label).toContain("Bàn cờ 5 trên 4");
    expect(label).toContain("0 trên 1 thùng đã vào đích");
  });

  it("nói vị trí người chơi theo cột và hàng, đếm từ 1", () => {
    // `@` ở chỉ số 6 của bàn rộng 5 → cột 2, hàng 2
    expect(boardLabel(parseXsb(LEVEL))).toContain("Bạn ở cột 2 hàng 2");
  });

  it("nói vị trí từng thùng", () => {
    expect(boardLabel(parseXsb(LEVEL))).toContain("Thùng ở cột 3 hàng 2");
  });

  it("nói vị trí từng đích còn trống", () => {
    expect(boardLabel(parseXsb(LEVEL))).toContain("Đích trống ở cột 4 hàng 2");
  });

  it("đánh dấu thùng đã vào đích thay vì kể nó thành hai thứ rời nhau", () => {
    const label = boardLabel(parseXsb(["#####", "#@ *#", "#   #", "#####"]));
    expect(label).toContain("Thùng đã vào đích ở cột 4 hàng 2");
    expect(label).toContain("1 trên 1 thùng đã vào đích");
    // Ô đó không được kể lại một lần nữa ở nhóm đích trống.
    expect(label).not.toContain("Đích trống ở cột 4 hàng 2");
  });

  it("không kể tường — chúng là phần còn lại, và đọc hết 144 ô là tra tấn", () => {
    expect(boardLabel(parseXsb(LEVEL))).not.toContain("Tường");
  });
});
