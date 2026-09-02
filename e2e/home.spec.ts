import { expect, test } from "@playwright/test";

/* 지도 SDK 로드 후 클러스터가 그려질 때까지 — 클러스터는 "상권명 N" 버튼 */
const cluster = (page: import("@playwright/test").Page, area: string) =>
  page.getByRole("button", { name: new RegExp(`^${area} \\d+$`) }).first();

async function waitForMap(page: import("@playwright/test").Page) {
  await expect(cluster(page, "홍대")).toBeVisible({ timeout: 15_000 });
}

test("홈: 지도가 뜨고 상권 클러스터와 목록 카운트가 함께 나온다", async ({
  page,
}) => {
  await page.goto("/");
  await waitForMap(page);
  await expect(page.getByText(/이 지역 매장 \d+곳/)).toBeVisible();
});

test("클러스터를 탭하면 그 동네로 줌인돼 개별 매장이 보인다", async ({
  page,
}) => {
  await page.goto("/");
  await waitForMap(page);
  const count = () =>
    page
      .getByText(/이 지역 매장 \d+곳/)
      .textContent()
      .then((t) => Number(t?.match(/\d+/)?.[0]));
  const before = await count();
  /* 지도 오버레이는 재배치가 잦고 상위 레이어가 좌표 클릭을 가로챈다 — DOM 이벤트 직접 발생 */
  await cluster(page, "홍대").dispatchEvent("click");
  /* 상권 클러스터 뷰 → 홍대 일대 줌인: 화면 매장 수가 그 동네 수준으로 줄어든다 */
  await expect.poll(count, { timeout: 10_000 }).toBeLessThan(before!);
  await expect(
    page.getByRole("button", { name: /홍대 ·|· 홍대/ }).first(),
  ).toBeVisible();
});

test("필터: 국물을 고르면 목록이 줄고 URL에 남는다", async ({ page }) => {
  await page.goto("/");
  await waitForMap(page);
  const before = await page.getByText(/이 지역 매장 \d+곳/).textContent();

  await page.getByRole("button", { name: /국물/ }).click();
  await page.getByRole("button", { name: /니보시/ }).click();
  await page.getByRole("button", { name: /매장 \d+곳 보기/ }).click();

  await expect(page).toHaveURL(/soup=niboshi/);
  const after = await page.getByText(/이 지역 매장 \d+곳/).textContent();
  expect(after).not.toBe(before);
});

test("검색: 매장을 찾아 선택하면 카드가 뜬다", async ({ page }) => {
  await page.goto("/");
  await waitForMap(page);
  await page.getByRole("button", { name: "검색" }).click();
  await page.getByRole("textbox").fill("잇짱");
  await page.getByText("잇짱라멘").first().click();
  await expect(page).toHaveURL(/shop=itjjangnamen/);
  await expect(
    page.getByRole("button", { name: "완식" }).first(),
  ).toBeVisible();
});
