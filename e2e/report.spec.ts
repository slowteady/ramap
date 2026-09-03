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

test("핀 피커: 위치를 지정하면 폼 입력이 보존된 채 반영되고 제출이 열린다", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /^홍대 \d+$/ }).first(),
  ).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "라멘집 등록" }).click();
  await page.getByLabel(/가게 이름/).fill("테스트라멘");

  await page.getByRole("button", { name: "지도에서 위치 지정" }).click();
  await expect(page).toHaveURL(/pick=1/);
  const confirm = page.getByRole("button", { name: "이 위치로 지정" });
  /* 진입 시 강제 확대 후 idle이 와야 게이트가 열린다 */
  await expect(confirm).toBeEnabled({ timeout: 10_000 });
  await expect(page.getByText(/\d+\.\d{6}, \d+\.\d{6}/)).toBeVisible();
  await expect(page.getByText("테스트라멘")).toBeVisible();
  await confirm.click();

  await expect(page).not.toHaveURL(/pick=/);
  await expect(
    page.getByRole("button", { name: /위치 지정됨/ }),
  ).toBeVisible();
  await expect(page.getByLabel(/가게 이름/)).toHaveValue("테스트라멘");
  await expect(page.getByRole("button", { name: "등록하기" })).toBeEnabled();
});

test("핀 피커: 취소하면 핀 없이 폼으로 돌아온다", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /^홍대 \d+$/ }).first(),
  ).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "라멘집 등록" }).click();
  await page.getByRole("button", { name: "지도에서 위치 지정" }).click();
  await page.getByRole("button", { name: "취소" }).click();
  await expect(page).not.toHaveURL(/pick=/);
  await expect(
    page.getByRole("button", { name: "지도에서 위치 지정" }),
  ).toBeVisible();
  /* 사진만으로는 제출 불가 — 링크·핀 없는 상태의 CTA는 닫혀 있다 */
  await expect(page.getByRole("button", { name: "등록하기" })).toBeDisabled();
});
