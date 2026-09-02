import { expect, test } from "@playwright/test";

test("상세: 매장 정보·영업 상태·행동 버튼이 있다", async ({ page }) => {
  await page.goto("/shop/itjjangnamen");
  await expect(page.getByRole("heading", { name: /잇짱라멘/ })).toBeVisible();
  await expect(page.getByText("국물", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "길찾기" })).toBeVisible();
  await expect(page.getByRole("button", { name: "공유" })).toBeVisible();
  await expect(page.getByRole("button", { name: /완식/ })).toBeVisible();
});

test("상세: 공유용 OG 메타가 완비돼 있다", async ({ page }) => {
  await page.goto("/shop/itjjangnamen");
  const og = async (p: string) =>
    page.locator(`meta[property="${p}"]`).getAttribute("content");
  expect(await og("og:title")).toContain("잇짱라멘");
  expect(await og("og:image")).toContain("/shop/itjjangnamen/opengraph-image");
  expect(await og("og:description")).toBeTruthy();
});

test("없는 매장은 404", async ({ page }) => {
  const res = await page.goto("/shop/no-such-shop");
  expect(res?.status()).toBe(404);
});
