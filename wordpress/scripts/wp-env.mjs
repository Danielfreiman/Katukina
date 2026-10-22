import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverRuntime, runWp, runtimeEnvironment } from "./local-runtime.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const packagePath = require.resolve("@wordpress/env/package.json");
const metadata = require(packagePath);
const binary = typeof metadata.bin === "string" ? metadata.bin : metadata.bin["wp-env"];
const runtime = resolve(root, ".runtime");
const config = JSON.parse(readFileSync(resolve(root, ".wp-env.json"), "utf8"));
mkdirSync(runtime, { recursive: true });
const composeEnv = resolve(runtime, "compose.local.env");
// Compose reads these bindings; wp-env still uses the numeric HTTP port for URLs.
writeFileSync(composeEnv, `WP_ENV_PORT=127.0.0.1:${config.port}\nWP_ENV_MYSQL_PORT=127.0.0.1:0\n`);
const environment = runtimeEnvironment({ WP_ENV_HOME: runtime, COMPOSE_ENV_FILES: composeEnv });

const child = spawn(process.execPath, [resolve(dirname(packagePath), binary), ...process.argv.slice(2)], {
  cwd: root,
  env: environment,
  stdio: "inherit",
  shell: false,
});
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("close", (code) => {
  if (code !== 0 || process.argv[2] !== "start") {
    process.exitCode = code ?? 1;
    return;
  }
  // wp-env replaces WP_SITEURL's port with its private Docker port during
  // start. Restore the configured public origin for admin AJAX and assets.
  const publicOrigin = config.config?.WP_SITEURL;
  if (!publicOrigin) { process.exitCode = 0; return; }
  // Use the generated Compose project directly: a second wp-env invocation
  // may try to resolve remote WordPress metadata even for a local CLI command.
  try {
    runWp(discoverRuntime(), ["config", "set", "WP_SITEURL", publicOrigin]);
    process.exitCode = 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
});
