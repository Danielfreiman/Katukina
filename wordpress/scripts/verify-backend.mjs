import { discoverRuntime, runWp } from './local-runtime.mjs';

const runtime = discoverRuntime();
if (runWp(runtime, ['eval', 'echo wp_get_environment_type();']).trim() !== 'local') {
  throw new Error('Backend integration fixtures may only run in the local environment.');
}
for (const name of ['verify-operations.php', 'verify-native-expansion.php', 'verify-communications.php']) {
  console.log(`Running ${name}`);
  console.log(runWp(runtime, ['eval-file', `/var/www/html/wp-content/katukina-tools/${name}`]).trim());
}
