/** Packaged next to photos.json and engine/. Does not import products or prices. */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildPhotoUpdatePlan } from './photo-update-plan.mjs';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const folder = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const projectIndex = argv.indexOf('--project');
if (argv.includes('--help') || projectIndex < 0 || !argv[projectIndex + 1]) {
  console.log('Uso: node instalar-fotos.mjs --project "CAMINHO/DO/PROJETO" --inspect|--apply|--verify|--rollback');
  process.exit(argv.includes('--help') ? 0 : 1);
}
const modes = ['inspect', 'apply', 'verify', 'rollback'].filter(mode => argv.includes(`--${mode}`));
if (modes.length !== 1) throw new Error('Escolha exatamente um modo.');
const mode = modes[0];
const project = resolve(argv[projectIndex + 1]);
if (JSON.parse(readFileSync(resolve(project, 'package.json'), 'utf8')).name !== 'katukina-2026' || !existsSync(resolve(project, 'wordpress/.wp-env.json'))) {
  throw new Error('Aponte --project para a raiz do projeto Katukina instalado.');
}
const integrity = JSON.parse(readFileSync(resolve(folder, 'integridade.json'), 'utf8'));
for (const [name, expected] of Object.entries(integrity.files)) {
  const file = resolve(folder, name), rel = relative(folder, file);
  if (isAbsolute(rel) || rel.startsWith('..') || digest(readFileSync(file)) !== expected) throw new Error(`Arquivo ausente ou alterado no pacote: ${name}`);
}
const sourceBytes = readFileSync(resolve(folder, 'photos.json'));
const source = JSON.parse(sourceBytes);
if (!/^catalog-webp-transfer-[a-z0-9-]+$/.test(source.batch)) throw new Error('Lote invalido.');
for (const photo of source.photos) {
  if (!/^images\/[a-zA-Z0-9_-]+\.webp$/.test(photo.file) || photo.file !== `images/${photo.name}` || integrity.files[photo.file] !== photo.sha256) throw new Error('Foto invalida no manifesto.');
}
const batch = resolve(project, 'wordpress/tools/.imports', source.batch);
const runtimeDir = resolve(project, 'wordpress/.runtime');
mkdirSync(runtimeDir, { recursive: true }); mkdirSync(batch, { recursive: true });
const installFile = (origin, destination) => {
  const bytes = readFileSync(origin);
  if (existsSync(destination)) {
    if (digest(readFileSync(destination)) !== digest(bytes)) throw new Error(`Arquivo local diferente; preservado: ${destination}`);
  } else copyFileSync(origin, destination);
};
const runtimeFile = resolve(runtimeDir, `${source.batch}-runtime.mjs`);
const backupFile = resolve(runtimeDir, `${source.batch}-backup.mjs`);
installFile(resolve(folder, 'engine/runtime.mjs'), runtimeFile);
installFile(resolve(folder, 'engine/backup.mjs'), backupFile);
installFile(resolve(folder, 'engine/update-media.php'), resolve(batch, 'update-media.php'));
const { runWp, discoverRuntime } = await import(pathToFileURL(runtimeFile).href);
const runtime = discoverRuntime();
const phpPath = `/var/www/html/wp-content/katukina-tools/.imports/${source.batch}/update-media.php`;
const run = (action, inherit = true) => runWp(runtime, ['eval-file', phpPath, action, source.batch], inherit ? { stdio: ['ignore', 'inherit', 'pipe'] } : {});
const manifestPath = resolve(batch, 'manifest.json');
const fingerprint = digest(sourceBytes);
if (mode === 'verify' || mode === 'rollback') {
  const saved = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (saved.package_sha256 !== fingerprint) throw new Error('Este lote pertence a outro pacote.');
  run(mode);
  console.log(`Relatorios e reversao: ${batch}`);
  process.exit(0);
}
if (existsSync(resolve(batch, 'before.json'))) {
  const saved = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (saved.package_sha256 !== fingerprint) throw new Error('Este lote pertence a outro pacote.');
  if (mode === 'inspect') {
    run('verify'); console.log('Lote ja iniciado/aplicado; plano anterior preservado. Use --apply para retomar ou --rollback para reverter.'); process.exit(0);
  }
} else {
  run('inventory');
  const inventory = JSON.parse(readFileSync(resolve(batch, 'wordpress-inventory.json'), 'utf8'));
  const plan = buildPhotoUpdatePlan(inventory, source.photos);
  console.log(JSON.stringify(plan.summary, null, 2));
  writeFileSync(resolve(batch, 'preflight.json'), JSON.stringify(plan.summary, null, 2));
  if (mode === 'inspect' || !plan.summary.to_update) {
    console.log(plan.summary.to_update ? 'Conferencia concluida. Nenhuma foto foi alterada. Execute --apply para instalar.' : 'Todas as fotos identificadas ja estao atualizadas. Nenhuma troca necessaria.');
    process.exit(0);
  }
  mkdirSync(resolve(batch, 'images'), { recursive: true });
  for (const photo of plan.attachments) installFile(resolve(folder, photo.file), resolve(batch, photo.file));
  writeFileSync(manifestPath, JSON.stringify({ package_sha256: fingerprint, attachments: plan.attachments }, null, 2));
  console.log('Criando backup SQL e testando restauracao em banco isolado...');
  const backup = JSON.parse(execFileSync(process.execPath, [backupFile, '--verify-restore'], { cwd: project, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim());
  writeFileSync(resolve(batch, 'backup.json'), JSON.stringify(backup, null, 2));
}
const backup = JSON.parse(readFileSync(resolve(batch, 'backup.json'), 'utf8'));
const bytes = readFileSync(backup.file);
if (!backup.isolated_restore || bytes.length !== backup.bytes || digest(bytes) !== backup.sha256) throw new Error('Backup ausente, alterado ou sem restauracao validada.');
console.log('Atualizando arquivos de midia e gerando miniaturas. Aguarde o resultado final.');
run('apply');
console.log('Atualizacao e verificacao concluidas. Precos, estoque, pedidos e vinculos preservados.');
console.log(`Relatorios, snapshot e reversao: ${batch}`);
