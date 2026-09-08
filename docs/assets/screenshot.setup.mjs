// Lai game vao khung hinh dung de chup anh README.
// Chay boi web-game/.claude/skills/readme-game/scripts/capture-screenshots.mjs.
// Khong co file nay thi anh chup ra man chon man - 20 o so, khong thay ban choi.
//
// Hop dong: export default async (page) => {...}. Viewport la 1280x720.

export default async function setup(page) {
  // Chon "Man ngau nhien" thay vi mot man so cu the: no khong phu thuoc vao
  // pack man dang co bao nhieu man, nen khong vo khi pack duoc sinh lai.
  await page.getByRole('button', { name: /Màn ngẫu nhiên/ }).click();
  await page.waitForTimeout(900);

  // Day mot thung de anh co dau vet cua nuoc di, khong phai mot the tran nguyen.
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
}
