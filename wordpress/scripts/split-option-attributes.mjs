import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { buildAttributePlan } from "./option-attribute-plan.mjs";
import { discoverRuntime, runWp, wordpressRoot } from "./local-runtime.mjs";

const mode = process.argv[2] ?? "inspect";
if (!["inspect", "apply", "verify", "rollback"].includes(mode))
  throw new Error("Use inspect, apply, verify or rollback.");
const root = resolve(wordpressRoot, "tools/.imports/sacred-incense-uk");
if (mode === "inspect" || mode === "apply") {
  const plan = buildAttributePlan(
    JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8")),
  );
  const file = resolve(root, "option-attribute-plan.json");
  if (
    existsSync(resolve(root, "option-attribute-state.json")) &&
    readFileSync(file, "utf8") !== JSON.stringify(plan, null, 2)
  )
    throw new Error(
      "Existing migration plan differs; preserve and reconcile it first.",
    );
  writeFileSync(file, JSON.stringify(plan, null, 2));
}
if (
  mode === "apply" &&
  !existsSync(resolve(root, "option-attribute-backup.json"))
) {
  const backup = JSON.parse(
    execFileSync(
      process.execPath,
      [resolve(wordpressRoot, "scripts/backup-local.mjs")],
      { encoding: "utf8" },
    ),
  );
  if (!backup.bytes || !existsSync(backup.file))
    throw new Error("Backup missing.");
  writeFileSync(
    resolve(root, "option-attribute-backup.json"),
    JSON.stringify(backup, null, 2),
  );
  console.log("Pre-migration SQL backup saved.");
}
console.log(
  runWp(
    discoverRuntime(),
    [
      "eval-file",
      "/var/www/html/wp-content/katukina-tools/split-option-attributes.php",
      mode,
    ],
    { maxBuffer: 16 * 1024 * 1024 },
  ),
);
