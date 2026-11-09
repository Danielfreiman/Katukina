import { createRequire } from "node:module";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { wordpressRoot } from "./local-runtime.mjs";

// Use the YAML parser owned by wp-env, which generates this Compose file.
const require = createRequire(import.meta.url);
const wpEnvRequire = createRequire(
  require.resolve("@wordpress/env/package.json"),
);
const yaml = wpEnvRequire("js-yaml");

export function relativeBind(source, composeDirectory, root = wordpressRoot) {
  const normalized = source.replaceAll("\\", "/");
  if (!/^(?:[a-z]:\/|\/)/i.test(normalized)) return source;
  const marker = "/website-katukina-2027/wordpress/";
  const position = normalized.toLowerCase().lastIndexOf(marker);
  if (position < 0)
    throw new Error(`Unrecognized WordPress bind mount: ${source}`);
  const target = resolve(root, normalized.slice(position + marker.length));
  const withinRoot = relative(root, target);
  if (withinRoot.startsWith("..") || !existsSync(target)) {
    throw new Error(
      `WordPress bind mount target is missing or outside the project: ${target}`,
    );
  }
  const path = relative(composeDirectory, target).replaceAll("\\", "/");
  return path.startsWith(".") ? path : `./${path}`;
}

export function relocateRuntime(runtime) {
  const original = readFileSync(runtime.composeFile, "utf8");
  const config = yaml.safeLoad(original);
  let changed = false;
  for (const service of Object.values(config.services ?? {})) {
    if (!service.volumes) continue;
    service.volumes = service.volumes.map((volume) => {
      if (typeof volume === "string") {
        const match = volume.match(/^(.+):(\/[^:]+)(:.*)?$/);
        if (!match) return volume;
        const source = relativeBind(match[1], dirname(runtime.composeFile));
        if (source === match[1]) return volume;
        changed = true;
        return `${source}:${match[2]}${match[3] ?? ""}`;
      }
      if (volume.type !== "bind") return volume;
      const source = relativeBind(volume.source, dirname(runtime.composeFile));
      if (source === volume.source) return volume;
      changed = true;
      return { ...volume, source };
    });
  }
  if (changed) {
    copyFileSync(
      runtime.composeFile,
      `${runtime.composeFile}.before-relocation-${Date.now()}.bak`,
    );
    writeFileSync(
      runtime.composeFile,
      yaml.safeDump(config, { noRefs: true, lineWidth: -1 }),
    );
    console.log(
      "WordPress bind mounts now use paths relative to this checkout.",
    );
  }
}
