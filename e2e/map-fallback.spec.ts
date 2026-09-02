import { expect, test } from "@playwright/test";

test("지도 SDK가 실패하면 폴백 리스트와 안내가 뜬다 (지도 결함은 치명 결함)", async ({
  page,
}) => {
  await page.route("**/dapi.kakao.com/**", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByText(/지도를 불러오지 못했/)).toBeVisible({
    timeout: 15_000,
  });
  /* 폴백에서도 매장 탐색은 가능해야 한다 — 상권 그룹 리스트 */
  await expect(page.getByText("홍대").first()).toBeVisible();
});
