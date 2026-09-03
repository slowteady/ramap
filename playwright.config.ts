import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  reporter: [["list"]],
  use: {
    /* 3001 고정 — 3000은 타 프로젝트 서버가 점유해 reuse가 엉뚱한 앱을 잡았고(2026-09-03 실측),
       카카오 SDK 허용 도메인에 등록된 포트여야 지도가 뜬다 */
    baseURL: "http://localhost:3001",
    ...devices["iPhone 14"],
    /* 카카오맵 SDK가 WebKit 헤드리스에서 불안정 — 시나리오는 chromium 단일 (2026-09-02) */
    browserName: "chromium",
  },
  webServer: {
    command: "npm run dev -- -p 3001",
    url: "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
