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
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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
    },
    localStorage: {
      getItem(key) {
        return key === 'dsh-nahida-theme:credit:v1' ? '{"enabled":true}' : null;
      },
      setItem() {}
    }
  },
  console
};
vm.runInNewContext(source, sandbox, { filename: 'lib/client.js' });
check('client registers a module factory', typeof moduleDefinition?.factory === 'function');
check('module id equals package name', moduleDefinition?.id === pkg.name, String(moduleDefinition?.id));

const ReactStub = {
  Fragment: Symbol('Fragment'),
  createElement(type, props, ...children) {
    return { type, props: props || {}, children };
  },
  useState(initial) {
    return [typeof initial === 'function' ? initial() : initial, () => {}];
  },
  useRef(initial) {
    return { current: initial };
  },
  useEffect() {}
};
const requireStub = (request) => {
  if (request === 'react') return ReactStub;
  if (request === 'react-dom') return { createPortal: (node) => node };
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
const wallpaperNameKeys = [
  'wallNone', 'wallBookAfternoon', 'wallSumeruLumine', 'wallSumeruAether', 'wallFlowerSea',
  'wallDreamBubble', 'wallFlowerSwing', 'wallPaimonStroll', 'wallDendroLight', 'wallBlessingLifted',
  'wallSwingForTwo', 'wallForestCompanions', 'wallBarefootGrove', 'wallWisdomCradle',
  'wallAranaraAfternoon', 'wallGrassRest'
];
check(
  'locale dictionaries carry blessing and settings keys',
  localeCalls.every((call) => [
    'quote1', 'quote2', 'quote3', 'nav', 'title', 'wallpaper', 'veil', 'open', 'close', 'done',
    'appearance', 'palette', 'leavesToggle', 'blessingToggle', 'sessionMarkToggle', 'quotes',
    ...wallpaperNameKeys
  ].every((key) => typeof call.dict[key] === 'string'))
);

// Slot occupants
const bySlot = new Map(registrations.map(({ options, component }) => [options.name, { options, component }]));
const expected = [
  ['sidebar.brand.mark', { priority: -10 }],
  ['conversation.hero.brand.mark', {}],
  ['conversation.composer.dock', { id: 'nahida-theme.blessing', order: 10 }],
  ['shell.overlay', { id: 'nahida-theme.leaves', order: -10 }],
  ['sidebar.session.row.leading', { id: 'nahida-theme.session-mark', order: 20 }],
  ['conversation.hero.frame', { id: 'nahida-theme.wallpaper', order: 20, locale: 'nahida-theme' }],
  ['sidebar.footer.action', { id: 'nahida-theme.balance-context', order: -10, locale: 'nahida-theme' }],
  ['settings.section', { id: 'nahida-theme', order: 50, locale: 'nahida-theme' }],
  ['settings.section.icon', { id: 'nahida-theme', order: 50 }]
];
for (const [slot, expectedOptions] of expected) {
  const registration = bySlot.get(slot);
  check(`registers ${slot}`, Boolean(registration), 'missing');
  if (!registration) continue;
  for (const [key, value] of Object.entries(expectedOptions)) {
    check(`  ${slot} ${key}`, registration.options[key] === value, `${registration.options[key]} !== ${value}`);
  }
}
check('registers nine slot occupants', registrations.length === 9, `got ${registrations.length}`);

// Render every occupant (hooks are stubbed) so obvious component errors fail here.
const text = (key) => `translated:${key}`;
for (const { options, component } of registrations) {
  if (typeof component !== 'function') {
    check(`  ${options.name} has a component`, false);
    continue;
  }
  let props = {};
  if (options.name === 'conversation.composer.dock') props = { t: text };
  else if (options.name === 'conversation.hero.frame') props = { hero: false, t: text, children: { type: 'div', props: {}, children: [] } };
  else if (options.name === 'settings.section') props = { t: text, close: () => {} };
  else if (options.name === 'settings.section.icon') props = { size: 16, active: true };
  else if (options.name === 'sidebar.footer.action') props = { wide: true };
  else if (options.name.includes('brand.mark')) props = { size: 24, className: 'host-class' };
  try {
    const element = component(props);
    check(`  ${options.name} renders`, Boolean(element) && typeof element === 'object');
  } catch (error) {
    check(`  ${options.name} renders`, false, error && error.message);
  }
}

// ── 5. Wallpaper assets ────────────────────────────────────────────────────
console.log('wallpaper assets');
check('package exports ./assets/*', pkg.exports?.['./assets/*'] === './lib/assets/*');
check('package files lists lib/assets', Array.isArray(pkg.files) && pkg.files.includes('lib/assets'));
const wallpaperDir = join(root, 'lib', 'assets', 'wallpapers');
const thumbDir = join(wallpaperDir, 'thumbs');
const fullFiles = existsSync(wallpaperDir)
  ? readdirSync(wallpaperDir).filter((name) => name.endsWith('.webp')).sort()
  : [];
const thumbFiles = existsSync(thumbDir)
  ? readdirSync(thumbDir).filter((name) => name.endsWith('.webp')).sort()
  : [];
check('fifteen full wallpapers', fullFiles.length === 15, `got ${fullFiles.length}`);
check('fifteen wallpaper thumbnails', thumbFiles.length === 15, `got ${thumbFiles.length}`);
let wallpaperBytes = 0;
for (const name of fullFiles) {
  wallpaperBytes += statSync(join(wallpaperDir, name)).size;
  check(`  full ${name} under 1 MiB`, statSync(join(wallpaperDir, name)).size <= 1024 * 1024);
}
for (const name of thumbFiles) {
  wallpaperBytes += statSync(join(thumbDir, name)).size;
  check(`  thumb ${name} under 120 KiB`, statSync(join(thumbDir, name)).size <= 120 * 1024);
}
check('wallpaper bytes stay under 6 MiB', wallpaperBytes <= 6 * 1024 * 1024, `${Math.round(wallpaperBytes / 1024)} KiB`);
for (const name of fullFiles) {
  check(`  thumbnail matches ${name}`, thumbFiles.includes(name));
}
const clientSource = readFileSync(join(root, 'lib/client.js'), 'utf8');
for (const term of ['conversation.hero.frame', 'settings.section', 'settings.section.icon', 'CloverMark', 'dsh-nahida-wallpaper']) {
  check(`client mentions ${term}`, clientSource.includes(term));
}
check('selection highlight is opaque grass green', clientSource.includes('::selection{background:#7cc85a;color:#0f260d}'));
check('chat surfaces use Akasha glass tokens', clientSource.includes('[data-conversation-content] [data-composer-card]'));
check('terminal caret uses DOS underscore shape', clientSource.includes('caret-shape:underscore'));
check('contenteditable caret is drawn by the plugin', clientSource.includes('dsh-nahida-caret'));
check('cards carry the four-leaf watermark', clientSource.includes('--dsh-nahida-clover'));
check('expanded run-command card uses the flat pane', clientSource.includes('[data-tool="pwsh"] > [data-open="true"][class*="_root_"]'));
check('balance card setting is persisted', clientSource.includes('dsh-nahida-theme:credit:v1'));
check('balance card has a settings switch', clientSource.includes('dsh-nahida-switch'));
check('selected lunheng buttons use white ink', clientSource.includes('button[style*="--dsw-alias-state-success-primary"]'));
const fullReferences = [...clientSource.matchAll(/file: '([^']+)'/g)].map((match) => match[1]);
const thumbReferences = [...clientSource.matchAll(/thumb: '([^']+)'/g)].map((match) => match[1]);
check('client lists fifteen wallpaper files', fullReferences.length === 15, `got ${fullReferences.length}`);
check('client lists fifteen thumbnail files', thumbReferences.length === 15, `got ${thumbReferences.length}`);
for (const name of fullReferences) {
  check(`  referenced full asset exists: ${name}`, existsSync(join(wallpaperDir, name)));
}
for (const name of thumbReferences) {
  check(`  referenced thumb asset exists: ${name}`, existsSync(join(thumbDir, name.replace(/^thumbs\//, ''))));
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
  console.log('PASS — manifest, resources, host half, palette presets, locale, wallpaper assets and 9 slot occupants verified.');
}
