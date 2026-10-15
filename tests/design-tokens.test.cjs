const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { before, test } = require('node:test');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const selectorParser = require('postcss-selector-parser');

const root = path.resolve(__dirname, '..');
const alphaCases = [
  ['bg-surface/90', 'background-color', '0.9'],
  ['dark:bg-surface/80', 'background-color', '0.8'],
  ['bg-subtle/50', 'background-color', '0.5'],
  ['bg-accent-base/10', 'background-color', '0.1'],
  ['before:via-accent-base/60', '--tw-gradient-stops', '0.6'],
  ['border-border-default/60', 'border-color', '0.6'],
  ['focus:ring-accent-base/20', '--tw-ring-color', '0.2'],
];
let config;
let generated;
let themes;

function classRules(className) {
  const rules = [];
  generated.walkRules((rule) => {
    let matches = false;
    selectorParser((selectors) => selectors.walkClasses((selector) => {
      if (selector.value === className) matches = true;
    })).processSync(rule.selector);
    if (matches) rules.push(rule);
  });
  return rules;
}

function resolveVariables(value, variables, trail = []) {
  for (const match of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const name = match[1];
    if (name.startsWith('--tw-')) continue;
    assert.ok(variables.has(name), `${name} is undefined for this theme`);
    assert.ok(!trail.includes(name), `Circular token reference: ${[...trail, name].join(' -> ')}`);
    resolveVariables(variables.get(name), variables, [...trail, name]);
  }
}

before(async () => {
  config = (await import(pathToFileURL(path.join(root, 'tailwind.config.js')).href)).default;
  const classes = ['bg-blue-500/50', 'bg-surface', 'shadow-lg', ...alphaCases.map(([name]) => name)];
  const output = await postcss([tailwind({
    ...config,
    content: [{ raw: `<div class="${classes.join(' ')}"></div>`, extension: 'html' }],
  })]).process('@tailwind utilities;', { from: undefined });
  generated = output.root;
  const stylesheet = postcss.parse(fs.readFileSync(path.join(root, 'src/index.css'), 'utf8'));
  const light = new Map();
  const dark = new Map();
  stylesheet.walkRules((rule) => {
    if (![':root', '.dark'].includes(rule.selector)) return;
    rule.walkDecls(/^--/, (declaration) => {
      (rule.selector === '.dark' ? dark : light).set(declaration.prop, declaration.value);
    });
  });
  themes = { light, dark: new Map([...light, ...dark]) };
});

test('real Tailwind generation emits built-in alpha, semantic base and shadow controls', () => {
  for (const name of ['bg-blue-500/50', 'bg-surface', 'shadow-lg']) {
    assert.ok(classRules(name).length, `Positive control missing: ${name}`);
  }
});

for (const [name, property, opacity] of alphaCases) {
  test(`semantic utility ${name} generates a resolvable alpha declaration`, () => {
    const rules = classRules(name);
    assert.ok(rules.length, `No generated selector for ${name}`);
    const values = [];
    for (const rule of rules) rule.walkDecls((declaration) => {
      if (declaration.prop === property) values.push(declaration.value);
    });
    assert.ok(values.some((value) => value.includes(opacity)), `Expected alpha ${opacity} in ${property}`);
    for (const value of values) {
      assert.ok(!value.includes('<alpha-value>'), 'Unexpanded alpha placeholder');
      for (const [theme, variables] of Object.entries(themes)) {
        assert.doesNotThrow(() => resolveVariables(value, variables), `${name}, ${theme}`);
      }
    }
  });
}

test('configured elevation variables resolve without cycles in both themes', () => {
  const shadows = Object.entries(config.theme.extend.boxShadow);
  assert.ok(shadows.some(([, value]) => value.includes('var(')), 'Expected token-based elevations');
  for (const [name, value] of shadows) {
    for (const [theme, variables] of Object.entries(themes)) {
      assert.doesNotThrow(() => resolveVariables(value, variables), `${name}, ${theme}`);
    }
  }
});
