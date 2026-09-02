import { expect, test } from "@playwright/test";

test("정보 수정 제보: 입력 후 닫으면 이탈 확인, 계속 쓰기는 입력을 지킨다", async ({
  page,
}) => {
  await page.goto("/shop/itjjangnamen?report=edit&shop=itjjangnamen");
  await page.getByRole("checkbox", { name: "영업시간이 달라요" }).click();

  await page.getByRole("button", { name: "닫기" }).click();
  await expect(page.getByText("정보 수정을 그만할까요?")).toBeVisible();

  await page.getByRole("button", { name: "계속 쓰기" }).last().click();
  await expect(
    page.getByRole("checkbox", { name: "영업시간이 달라요" }),
  ).toBeChecked();
});

test("정보 수정 제보: 나가기를 누르면 시트가 닫힌다", async ({ page }) => {
  await page.goto("/shop/itjjangnamen?report=edit&shop=itjjangnamen");
  await page.getByRole("checkbox", { name: "기타" }).click();
  await page.getByRole("button", { name: "닫기" }).click();
  await page.getByRole("button", { name: "나가기" }).click();
  await expect(page).not.toHaveURL(/report=/);
});

test("빈 폼은 확인 없이 즉시 닫힌다", async ({ page }) => {
  await page.goto("/shop/itjjangnamen?report=edit&shop=itjjangnamen");
  await page.getByRole("button", { name: "닫기" }).click();
  await expect(page.getByText(/그만할까요/)).not.toBeVisible();
  await expect(page).not.toHaveURL(/report=/);
});
