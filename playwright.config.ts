import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    ...devices["iPhone 14"],
    /* 카카오맵 SDK가 WebKit 헤드리스에서 불안정 — 시나리오는 chromium 단일 (2026-09-02) */
    browserName: "chromium",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
