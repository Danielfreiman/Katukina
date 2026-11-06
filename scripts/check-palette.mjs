import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const palette = {
  urucum: '#782e26', leaf: '#526b35', 'warm-white': '#f7f7f2',
  'light-gray': '#d3d4cf', 'medium-gray': '#595957', charcoal: '#292c27',
};
const source = readFileSync('docs/katukina/design/Katukina_Paleta_e_Aplicacoes.svg', 'utf8');
const css = readFileSync('app/globals.css', 'utf8');
for (const [name, hex] of Object.entries(palette)) {
  assert(source.toLowerCase().includes(`>${hex}</text>`), `Missing source swatch: ${name}`);
  assert(new RegExp(`--${name}:\\s*${hex};`, 'i').test(css), `Token drift: ${name}`);
}
const canonical = color => color.length === 4 ? '#' + [...color.slice(1)].map(c => c + c).join('') : color.toLowerCase();
const allowed = new Set([...Object.values(palette), '#ffffff', '#000000']);
for (const file of ['app/globals.css', 'app/catalog.css', 'app/privacy.css', 'app/icon.svg']) {
  for (const color of readFileSync(file, 'utf8').match(/#[a-f\d]{3,8}\b/gi) || []) assert(allowed.has(canonical(color)), `Unapproved color in ${file}: ${color}`);
}
const channels = hex => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
const mix = (a, b, fraction) => a.map((value, i) => value * fraction + b[i] * (1 - fraction));
const luminance = rgb => rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
const colors = Object.fromEntries(Object.entries(palette).map(([key, value]) => [key, channels(value)]));
const warm = colors['warm-white'];
const combinations = [
  ['primary text', colors.charcoal, warm, 4.5],
  ['secondary text', colors['medium-gray'], warm, 4.5],
  ['primary action', warm, colors.urucum, 4.5],
  ['primary hover', warm, mix(colors.urucum, colors.charcoal, 0.85), 4.5],
  ['support links / focus', colors.leaf, warm, 4.5],
  ['support text on tinted surface', colors.leaf, mix(colors.leaf, warm, 0.1), 4.5],
  ['input border', mix(colors['medium-gray'], warm, 0.72), warm, 3],
];
for (const [role, foreground, background, minimum] of combinations) {
  const ratio = contrast(foreground, background);
  assert(ratio >= minimum, `${role}: ${ratio.toFixed(2)} < ${minimum}`);
  console.log(`${role}: ${ratio.toFixed(2)}:1`);
}
console.log('Approved source, CSS tokens, literal colors and contrast checks passed.');
