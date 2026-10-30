import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

const site = new URL(
  process.env.LAB_SITE_URL ||
    "https://hrry1n.github.io/Java-AI-Learning-Roadmap/",
);
if (!site.pathname.endsWith("/")) site.pathname += "/";
const artifacts = resolve(
  process.env.LAB_ARTIFACT_DIR || "test-artifacts/pages-online",
);

export default defineConfig({
  testDir: "./smoke",
  workers: 1,
  forbidOnly: true,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  outputDir: resolve(artifacts, "test-results"),
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: resolve(artifacts, "report") }],
    ["json", { outputFile: resolve(artifacts, "results.json") }],
  ],
  use: {
    baseURL: site.href,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile-chromium",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
