#!/usr/bin/env node
/**
 * Contrast check for the palette layer in lib/client.js.
 *
 * Reads the alias-token light/dark pairs straight from the Client half and
 * checks them against the host palette values they sit beside, so a future
 * colour tweak cannot quietly make primary buttons or the blessing line
 * illegible. Uses the WCAG 2.x relative-luminance formula.
 *
 * Run: node test/contrast.mjs
 */
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const tokens = {};
const tokenPattern = /'(--dsw-[a-z0-9-]+)':\s*\{\s*light:\s*'([^']+)',\s*dark:\s*'([^']+)'\s*\}/g;
for (let match = tokenPattern.exec(source); match !== null; match = tokenPattern.exec(source)) {
  tokens[match[1]] = { light: match[2], dark: match[3] };
}

/** Host values the layer sits beside (ui-theme's design-platform palette). */
const HOST = {
  light: {
    labelPrimary: '#0f1115',
    labelSecondary: '#61666b',
    labelPrimaryForeground: '#ffffff'
  },
  dark: {
    labelPrimary: '#f5f7fa',
    labelSecondary: '#cfd3d6',
    labelPrimaryForeground: '#0f1115'
  }
};

function channel(value) {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`not a hex colour: ${hex}`);
  const r = channel(Number.parseInt(full.slice(0, 2), 16));
  const g = channel(Number.parseInt(full.slice(2, 4), 16));
  const b = channel(Number.parseInt(full.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

function pair(token, mode) {
  const value = tokens[token]?.[mode];
  if (!value) throw new Error(`missing token ${token} (${mode}) in lib/client.js`);
  return value;
}

const cases = [
  ['primary button fill (light)', pair('--dsw-alias-brand-primary', 'light'), HOST.light.labelPrimaryForeground],
  ['primary button fill (dark)', pair('--dsw-alias-brand-primary', 'dark'), HOST.dark.labelPrimaryForeground],
  ['canvas text (light)', HOST.light.labelPrimary, pair('--dsw-alias-bg-base', 'light')],
  ['canvas text (dark)', HOST.dark.labelPrimary, pair('--dsw-alias-bg-base', 'dark')],
  ['blessing text (light)', HOST.light.labelSecondary, pair('--dsw-alias-bg-base', 'light')],
  ['blessing text (dark)', HOST.dark.labelSecondary, pair('--dsw-alias-bg-base', 'dark')],
  ['sidebar text (light)', HOST.light.labelPrimary, pair('--dsw-specific-sidebar-fill', 'light')],
  ['sidebar text (dark)', HOST.dark.labelPrimary, pair('--dsw-specific-sidebar-fill', 'dark')]
];

const MINIMUM = 4.5; // WCAG AA for normal text
let failed = 0;
for (const [name, foreground, background] of cases) {
  const ratio = contrast(foreground, background);
  const ok = ratio >= MINIMUM;
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(28)} ${ratio.toFixed(2)}:1  (${foreground} on ${background})`);
}

console.log('');
if (failed > 0) {
  console.error(`FAILED — ${failed} contrast case(s) below ${MINIMUM}:1`);
  process.exitCode = 1;
} else {
  console.log(`PASS — all ${cases.length} contrast cases are >= ${MINIMUM}:1.`);
}
