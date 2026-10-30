import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const artifacts = resolve(
  process.env.LAB_ARTIFACT_DIR || "../docs/javaroadmap_lab/artifacts",
);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  outputDir: resolve(artifacts, "test-results"),
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
        outputFolder: resolve(artifacts, "playwright-report"),
      },
    ],
    ["json", { outputFile: resolve(artifacts, "results.json") }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
      },
    },
  ],
  webServer: {
    command: process.env.CI ? "npm run preview -- --port 5173" : "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
