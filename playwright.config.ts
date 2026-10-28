import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 60000,
  // Windows Docker bind mounts make native WP requests take several seconds.
  expect: { timeout: 15000 },
  use: { baseURL: "http://localhost:3001", browserName: "chromium" },
  webServer: {
    command: `${process.platform === "win32" ? "npm.cmd" : "npm"} run dev`,
    url: "http://localhost:3001",
    reuseExistingServer: true,
  },
  reporter: "list",
});
