#!/usr/bin/env node
/**
 * Manifest + runtime smoke test for dsh-nahida-theme.
 *
 * Runs without a browser: the Client half is evaluated inside a Node `vm`
 * sandbox with a fake module loader, a minimal React stub, and a recording
 * Cordis context. That proves the module exports a plugin, the palette layer
 * and locale dictionaries are registered, and each slot occupant renders
 * without throwing.
 *
 * Run: node test/smoke.mjs
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function check(name, ok, detail = '') {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ── 1. Manifest ────────────────────────────────────────────────────────────

console.log('manifest');
const pkg = readJson(join(root, 'package.json'));
check('package name is dsh-nahida-theme', pkg.name === 'dsh-nahida-theme', String(pkg.name));
check('version looks semver', /^\d+\.\d+\.\d+/.test(pkg.version || ''), String(pkg.version));
check('module package', pkg.type === 'module');
check('dsh.bundle.patch declared', pkg.dsh?.bundle?.patch === './cordis.patch.yml');
check('dsh.client targets web', pkg.dsh?.client?.platform === 'web');
check('dsh.client is immediate', pkg.dsh?.client?.immediately === true);
check('dsh.client declares inject list', Array.isArray(pkg.dsh?.client?.inject) && pkg.dsh.client.inject.length > 0);

for (const [request, target] of Object.entries(pkg.exports || {})) {
  if (target.includes('*')) continue;
  check(`export ${request} resolves`, existsSync(join(root, target)), target);
}
for (const entry of pkg.files || []) {
  if (entry.includes('*')) continue;
  check(`files entry exists: ${entry}`, existsSync(join(root, entry)));
}

const patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8');
check('patch inserts ui-nahida-theme', /id:\s*ui-nahida-theme\b/.test(patch));
check('patch names the package', /name:\s*dsh-nahida-theme\b/.test(patch));

// ── 2. Display resources ───────────────────────────────────────────────────

console.log('display resources');
for (const language of ['en', 'zh', 'ja']) {
  const localePath = join(root, 'locale', `${language}.json`);
  check(`locale ${language} exists`, existsSync(localePath), localePath);
  if (!existsSync(localePath)) continue;
  const meta = readJson(localePath).meta || {};
  check(`locale ${language} title`, typeof meta.title === 'string' && meta.title.trim().length > 0);
  check(`locale ${language} description`, typeof meta.description === 'string' && meta.description.trim().length > 0);
}

const iconPath = join(root, 'icon.svg');
check('icon.svg exists', existsSync(iconPath));
if (existsSync(iconPath)) {
  const icon = readFileSync(iconPath, 'utf8');
  check('icon is an SVG document', /^<svg[\s>]/.test(icon.trim()));
  check('icon has a viewBox', /viewBox="[^"]+"/.test(icon));
  check('icon under 256 KiB', statSync(iconPath).size <= 256 * 1024, `${statSync(iconPath).size} bytes`);
}

// ── 3. Host half ───────────────────────────────────────────────────────────

console.log('host half');
const host = await import(pathToFileURL(join(root, 'lib/index.js')).href);
check('host exports apply()', typeof host.apply === 'function');
try {
  host.apply();
  check('host apply() is a no-op', true);
} catch (error) {
  check('host apply() is a no-op', false, error && error.message);
}

// ── 4. Client half ─────────────────────────────────────────────────────────

console.log('client half');
const source = readFileSync(join(root, 'lib/client.js'), 'utf8');
check('client does not import Harness Client packages', !/require\(\s*['"]@deepseek-ai\//.test(source));
check('blessing text uses an accessible text token', source.includes('color:var(--dsw-alias-label-secondary)'));

let moduleDefinition;
const sandbox = {
  window: {
    __ModuleLoader__: {
      load(definition) {
        moduleDefinition = definition;
      }
    }
  },
  console
};
vm.runInNewContext(source, sandbox, { filename: 'lib/client.js' });
check('client registers a module factory', typeof moduleDefinition?.factory === 'function');
check('module id equals package name', moduleDefinition?.id === pkg.name, String(moduleDefinition?.id));

const ReactStub = {
  createElement(type, props, ...children) {
    return { type, props: props || {}, children };
  },
  useState(initial) {
    return [initial, () => {}];
  },
  useEffect() {}
};
const requireStub = (request) => {
  if (request === 'react') return ReactStub;
  throw new Error(`unexpected require("${request}")`);
};

const plugin = moduleDefinition.factory(requireStub);
check('plugin exports apply()', typeof plugin?.apply === 'function');
check("plugin injects 'slots'", Array.isArray(plugin?.inject) && plugin.inject.includes('slots'));

const registrations = [];
const themeCalls = [];
const localeCalls = [];
const disposers = [];
const theme = {
  overrideTokens(from, tokens) {
    themeCalls.push({ from, tokens });
    return () => {};
  }
};
const locale = {
  getSnapshot() {
    return { active: 'zh', locales: [], revision: 1 };
  },
  register(ns, language, dict) {
    localeCalls.push({ ns, language, dict });
    return () => {};
  },
  bind() {
    return (key) => `translated:${key}`;
  }
};
const slots = {
  inject(_slot, callback) {
    callback();
    return () => {};
  },
  register(options, component) {
    registrations.push({ options, component });
    return () => {};
  }
};
const makeScope = () => ({
  theme,
  locale,
  effect(callback) {
    const dispose = callback();
    if (typeof dispose === 'function') disposers.push(dispose);
    return () => {};
  }
});
const ctx = {
  get(name) {
    if (name === 'theme') return theme;
    if (name === 'locale') return locale;
    return undefined;
  },
  inject(_services, callback) {
    callback(makeScope());
    return () => {};
  },
  effect(callback) {
    const dispose = callback();
    if (typeof dispose === 'function') disposers.push(dispose);
    return () => {};
  },
  slots
};

try {
  plugin.apply(ctx);
  check('apply() runs on a recording context', true);
} catch (error) {
  check('apply() runs on a recording context', false, error && error.message);
}

// Palette layer
check('register exactly one palette layer', themeCalls.length === 1, `got ${themeCalls.length}`);
if (themeCalls[0]) {
  const { from, tokens } = themeCalls[0];
  check('palette layer is named by package', from === pkg.name, from);
  for (const token of [
    '--dsw-alias-brand-primary',
    '--dsw-alias-button-primary-hover',
    '--dsw-alias-button-primary-dimmed',
    '--dsw-alias-state-success-primary',
    '--dsw-alias-bg-base',
    '--dsw-specific-sidebar-fill'
  ]) {
    const value = tokens[token];
    check(
      `palette ${token} is a light/dark pair`,
      value && typeof value.light === 'string' && typeof value.dark === 'string' && value.light && value.dark
    );
  }
}

// Locale dictionaries
const languages = localeCalls.map((call) => call.language).sort();
check('locale dictionaries registered for en/ja/zh', languages.join(',') === 'en,ja,zh', languages.join(','));
check('locale dictionaries use the nahida-theme namespace', localeCalls.every((call) => call.ns === 'nahida-theme'));
check(
  'locale dictionaries carry all blessing keys',
  localeCalls.every((call) => ['quote1', 'quote2', 'quote3'].every((key) => typeof call.dict[key] === 'string'))
);

// Slot occupants
const bySlot = new Map(registrations.map(({ options, component }) => [options.name, { options, component }]));
const expected = [
  ['sidebar.brand.mark', { priority: -10 }],
  ['conversation.hero.brand.mark', {}],
  ['conversation.composer.dock', { id: 'nahida-theme.blessing', order: 10 }],
  ['shell.overlay', { id: 'nahida-theme.leaves', order: -10 }]
];
for (const [slot, expectedOptions] of expected) {
  const registration = bySlot.get(slot);
  check(`registers ${slot}`, Boolean(registration), 'missing');
  if (!registration) continue;
  for (const [key, value] of Object.entries(expectedOptions)) {
    check(`  ${slot} ${key}`, registration.options[key] === value, `${registration.options[key]} !== ${value}`);
  }
}
check('registers four slot occupants', registrations.length === 4, `got ${registrations.length}`);

// Render every occupant (hooks are stubbed) so obvious component errors fail here.
for (const { options, component } of registrations) {
  if (typeof component !== 'function') {
    check(`  ${options.name} has a component`, false);
    continue;
  }
  const props =
    options.name === 'conversation.composer.dock'
      ? { t: (key) => `translated:${key}` }
      : options.name.includes('brand.mark')
        ? { size: 24, className: 'host-class' }
        : {};
  try {
    const element = component(props);
    check(`  ${options.name} renders`, Boolean(element) && typeof element === 'object');
  } catch (error) {
    check(`  ${options.name} renders`, false, error && error.message);
  }
}

// Cleanup must be safe to call.
try {
  for (const dispose of disposers) dispose();
  check('all registered cleanups are callable', true);
} catch (error) {
  check('all registered cleanups are callable', false, error && error.message);
}

// ── Summary ────────────────────────────────────────────────────────────────

console.log('');
if (failures.length > 0) {
  console.error(`FAILED — ${failures.length} check(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log('PASS — manifest, resources, host half, palette, locale and 4 slot occupants verified.');
}
