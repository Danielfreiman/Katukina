import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync, constants } from "node:fs";
import { resolve } from "node:path";
import { discoverRuntime, runWp, runtimeEnvironment, wordpressRoot, workspaceRoot } from "./local-runtime.mjs";

const toolsDirectory = "/var/www/html/wp-content/katukina-tools/";
const accessFile = resolve(wordpressRoot, ".local-access.json");
const exampleFile = resolve(wordpressRoot, ".local-access.example.json");

function main() {
  const flags = process.argv.slice(2);
  if (flags.some((flag) => flag !== "--no-start")) {
    throw new Error("Usage: node wordpress/scripts/setup-local.mjs [--no-start]");
  }
  const environmentFile = resolve(workspaceRoot, ".env.local");
  if (!existsSync(environmentFile)) {
    copyFileSync(resolve(workspaceRoot, ".env.example"), environmentFile, constants.COPYFILE_EXCL);
    console.log("Created .env.local from the local example.");
  }
  const existingAccess = existsSync(accessFile);
  const access = JSON.parse(readFileSync(existingAccess ? accessFile : exampleFile, "utf8"));
  const config = JSON.parse(readFileSync(resolve(wordpressRoot, ".wp-env.json"), "utf8"));
  const origin = new URL(access.site_url);
  if (!["localhost", "127.0.0.1"].includes(origin.hostname) || origin.protocol !== "http:" ||
      origin.origin !== config.config.WP_SITEURL || typeof access.username !== "string" ||
      !access.username || typeof access.password !== "string" || access.password.length < 20) {
    throw new Error("Local access must use the configured localhost origin, an administrator username and a password of at least 20 characters.");
  }
  if (!flags.includes("--no-start")) {
    console.log("Starting this checkout's WordPress environment…");
    const started = spawnSync(process.execPath, [resolve(wordpressRoot, "scripts/wp-env.mjs"), "start"], {
      cwd: wordpressRoot, env: runtimeEnvironment(), stdio: "inherit", shell: false,
    });
    if (started.error || started.status !== 0) {
      throw new Error("WordPress could not start. Check that Docker Desktop / Docker Compose is running and port 8888 is available.");
    }
  }
  const runtime = discoverRuntime();
  console.log("Verifying the local runtime and administrator access…");
  const state = JSON.parse(runWp(runtime, ["eval", "echo wp_json_encode(array('environment' => wp_get_environment_type(), 'initialized' => (bool) get_option('katukina_local_initialized')));"]));
  if (state.environment !== "local") throw new Error("Setup is restricted to the local development environment.");
  if (!existingAccess && state.initialized) {
    // A restored or established database must never have its password replaced because a file is missing.
    // Recover only when the documented test password is already the current password.
    try {
      runWp(runtime, ["eval-file", toolsDirectory + "set-local-password.php", "check", access.username], {
        input: access.password, sensitiveInput: true,
      });
    } catch {
      throw new Error("This WordPress database is already initialized, but wordpress/.local-access.json is missing. Restore that local access file using the current administrator credentials; the existing password was preserved.");
    }
  }
  // Use Compose after the first start: another wp-env invocation may fetch remote metadata.
  runWp(runtime, ["plugin", "activate", "woocommerce"]);
  runWp(runtime, ["plugin", "activate", "katukina-core"]);
  runWp(runtime, ["eval", String.raw`
    if (!class_exists('WooCommerce') || !class_exists('Katukina\\Core\\Database')) {
        WP_CLI::error('WooCommerce and Katukina Core must be active.');
    }
    \Katukina\Core\Database::install();
    if (false === get_option('woocommerce_currency', false)) {
        add_option('woocommerce_currency', 'USD');
    }
    if ('USD' !== get_woocommerce_currency()) {
        WP_CLI::error('The sample catalogue requires USD. Existing store currency was preserved; configure a separate local demo to import these fixtures.');
    }
  `]);
  if (existingAccess) {
    try {
      runWp(runtime, ["eval-file", toolsDirectory + "set-local-password.php", "check", access.username], {
        input: access.password, sensitiveInput: true,
      });
    } catch {
      throw new Error("Existing wordpress/.local-access.json does not authenticate its local administrator. Access and database passwords were preserved; reconcile this file with the local account before rerunning setup.");
    }
    console.log("Existing local administrator access verified and preserved.");
  } else {
    if (!state.initialized) {
      runWp(runtime, ["eval-file", toolsDirectory + "set-local-password.php", "set", access.username], {
        input: access.password, sensitiveInput: true,
      });
    }
    writeFileSync(accessFile, JSON.stringify(access, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    console.log("Created wordpress/.local-access.json using the public local-test example. Rotate these test credentials before publishing.");
  }
  for (const file of ["setup-local.php", "import-catalog-samples.php", "setup-operations-local.php", "verify-local.php", "verify-headless.php"]) {
    console.log(`Running ${file}…`);
    const output = runWp(runtime, ["eval-file", toolsDirectory + file]);
    if (output.trim()) console.log(output.trim());
  }
  console.log(`Local setup complete. Start the storefront with npm run dev and open ${origin.origin}/.`);
}

try { main(); }
catch (error) {
  console.error(error instanceof Error ? error.message : "Local setup failed.");
  process.exitCode = 1;
}
