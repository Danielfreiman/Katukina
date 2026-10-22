import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const wordpressRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const workspaceRoot = resolve(wordpressRoot, "..");

/** Resolve only this checkout's generated Compose project; never guess a container name. */
export function discoverRuntime() {
  const directory = resolve(wordpressRoot, ".runtime");
  const composeEnv = resolve(directory, "compose.local.env");
  const composeFiles = existsSync(directory)
    ? readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => resolve(directory, entry.name, "docker-compose.yml"))
        .filter((path) => existsSync(path))
    : [];
  if (!existsSync(composeEnv) || composeFiles.length !== 1) {
    throw new Error("Cannot identify this checkout's WordPress runtime. Run npm run wp:start; keep one generated Compose project in wordpress/.runtime.");
  }
  return { composeFile: composeFiles[0], composeEnv, wordpressRoot, workspaceRoot };
}

export function composeArgs(runtime, args) {
  return ["compose", "--env-file", runtime.composeEnv, "-f", runtime.composeFile, ...args];
}

export function runtimeEnvironment(extra = {}) {
  const environment = { ...process.env, ...extra };
  // Shell overrides must not redirect this checkout to another Compose project or port.
  for (const key of ["WP_ENV_PORT", "WP_ENV_MYSQL_PORT", "COMPOSE_FILE", "COMPOSE_PROJECT_NAME", "COMPOSE_PROFILES"]) {
    delete environment[key];
  }
  return environment;
}

/** Returns stdout; password-bearing callers can suppress child diagnostics with sensitiveInput. */
export function runCompose(runtime, args, options = {}) {
  const { sensitiveInput = false, env = {}, ...spawnOptions } = options;
  const result = spawnSync("docker", composeArgs(runtime, args), {
    cwd: wordpressRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    ...spawnOptions,
    env: runtimeEnvironment(env),
    shell: false,
  });
  if (result.error || result.status !== 0) {
    const detail = sensitiveInput ? "" : String(result.stderr || result.error?.message || "").trim();
    throw new Error(`Local Docker Compose command failed${result.status === null ? "" : ` (exit ${result.status})`}.${detail ? `\n${detail}` : ""}`);
  }
  return result.stdout || "";
}

export function runWp(runtime, args, options = {}) {
  return runCompose(runtime, ["exec", "-T", "cli", "wp", ...args], options);
}
