const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');
const system = require('../scripts/check-agent-system.cjs');

function fixture(t) {
  const fixtureParent = path.join(process.cwd(), 'node_modules', '.cache');
  fs.mkdirSync(fixtureParent, { recursive: true });
  const root = fs.mkdtempSync(path.join(fixtureParent, 'home-system-test-'));
  t.after(() => {
    const resolved = path.resolve(root);
    assert.ok(resolved.startsWith(`${path.resolve(fixtureParent)}${path.sep}home-system-test-`));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const write = (file, content) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content);
    return target;
  };
  const skillPath = '.agents/skills/resource-check/SKILL.md';
  const skill = (description = '"Validate references: include local resources"') =>
    `---\nname: resource-check\ndescription: ${description}\nresources:\n  - reference.md\n---\n[Reference](reference.md)\n`;
  write(skillPath, skill()); write('.agents/skills/resource-check/reference.md', 'Isolated reference.');
  write('AGENTS.md', 'Isolated root policy.'); write('.agents/AGENTS.md', 'Root policy pointer.');
  const agents = ['babybun', 'babyluong', 'babyhien', 'babyaaralyn'];
  write('.codex/config.toml', '[agents]\nenabled = true\n' + agents.map((agent) =>
    `[agents.${agent}]\ndescription = "Isolated role"\nconfig_file = "agents/${agent}.toml"\n`).join(''));
  for (const agent of agents) write(`.codex/agents/${agent}.toml`,
    `name = "${agent}"\ndescription = "Isolated specialist"\ndeveloper_instructions = "Follow the isolated assignment"\n` +
    '[[skills.config]]\npath = "../../.agents/skills/resource-check"\nenabled = true\n');
  write('src/modules/example/pages/Example.tsx', 'export const Example = () => null;\n');
  write('.agents/CODEBASE_ROUTER.json', JSON.stringify({ modules: { example: {
    root: 'src/modules/example', pages: ['src/modules/example/pages/Example.tsx'], services: [],
  } } }));
  write('docs/AGENT_OWNERSHIP.json', JSON.stringify({ version: 2,
    owners: { amri: ['.agents/**', '.codex/**', 'AGENTS.md', 'docs/**'], babybun: [],
      babyluong: ['src/**'], babyhien: [], babyaaralyn: [] },
    exactOwners: {}, testPatterns: ['tests/**'], fallbackOwners: [],
  }));
  execFileSync('git', ['-c', 'core.fsmonitor=false', 'init', '-q'], { cwd: root, stdio: 'pipe' });
  return { root, write, skill, skillFile: path.join(root, skillPath) };
}

function code(expected) { return (error) => error.code === expected; }

test('quoted YAML and real local skill dependencies are a positive control', (t) => {
  const f = fixture(t);
  const parsed = system.validateSkill(f.skillFile, f.root);
  assert.equal(parsed.metadata.name, 'resource-check');
  assert.match(parsed.metadata.description, /references:/);
});

test('malformed colon-space YAML is rejected rather than silently discovered', (t) => {
  const f = fixture(t);
  f.write('.agents/skills/resource-check/SKILL.md', f.skill('Validate references: missing quotes'));
  assert.throws(() => system.validateSkill(f.skillFile, f.root), code('INVALID_YAML'));
});

test('UTF-8 BOM and invalid bytes fail discovery validation', (t) => {
  const f = fixture(t);
  f.write('.agents/skills/resource-check/SKILL.md', `\ufeff${f.skill()}`);
  assert.throws(() => system.validateSkill(f.skillFile, f.root), code('UTF8_BOM'));
  f.write('.agents/skills/resource-check/SKILL.md', Buffer.from([0xff, 0xfe]));
  assert.throws(() => system.validateSkill(f.skillFile, f.root), code('INVALID_UTF8'));
});

test('declared local skill resource deletion blocks validation', (t) => {
  const f = fixture(t);
  fs.unlinkSync(path.join(f.root, '.agents/skills/resource-check/reference.md'));
  assert.throws(() => system.validateSkill(f.skillFile, f.root), code('MISSING_SKILL_RESOURCE'));
});

test('Markdown local links are checked and encoded traversal stays outside the contract', (t) => {
  const f = fixture(t);
  f.write('.agents/skills/resource-check/SKILL.md', f.skill() + '[Missing](missing.md)\n');
  assert.throws(() => system.validateSkill(f.skillFile, f.root), code('MISSING_SKILL_RESOURCE'));
  assert.throws(() => system.resourcePath(f.root, path.dirname(f.skillFile),
    '%2e%2e/%2e%2e/%2e%2e/%2e%2e/outside.md'), code('RESOURCE_OUTSIDE_REPOSITORY'));
});

test('skill name must match its discovery directory', (t) => {
  const f = fixture(t);
  f.write('.agents/skills/resource-check/SKILL.md', f.skill().replace('name: resource-check', 'name: another-skill'));
  assert.throws(() => system.validateSkill(f.skillFile, f.root), code('SKILL_NAME_DIRECTORY_MISMATCH'));
});

test('four role references validate and a missing referenced skill fails', (t) => {
  const f = fixture(t);
  assert.equal(system.validateRoles(f.root), 4);
  fs.unlinkSync(f.skillFile);
  assert.throws(() => system.validateRoles(f.root), code('MISSING_ROLE_SKILL'));
});

test('role configuration points to the intended named role', (t) => {
  const f = fixture(t);
  const file = '.codex/agents/babybun.toml';
  f.write(file, fs.readFileSync(path.join(f.root, file), 'utf8').replace('name = "babybun"', 'name = "babyhien"'));
  assert.throws(() => system.validateRoles(f.root), code('INVALID_ROLE_CONTRACT'));
});

test('router file targets are checked against the real isolated filesystem', (t) => {
  const f = fixture(t);
  assert.equal(system.validateRouter(f.root), 1);
  fs.unlinkSync(path.join(f.root, 'src/modules/example/pages/Example.tsx'));
  assert.throws(() => system.validateRouter(f.root), code('MISSING_ROUTER_TARGET'));
});

test('router traversal cannot escape the repository', (t) => {
  const f = fixture(t);
  f.write('.agents/CODEBASE_ROUTER.json', JSON.stringify({ modules: { example: {
    root: 'src/modules/example', pages: ['../outside.tsx'], services: [],
  } } }));
  assert.throws(() => system.validateRouter(f.root), code('INVALID_ROUTER_TARGET'));
});

test('system validator reports measured fixture counts and TOML scope', (t) => {
  const f = fixture(t);
  const result = system.validateSystem(f.root);
  assert.equal(result.skills, 1);
  assert.equal(result.roles, 4);
  assert.equal(result.routerTargets, 1);
  assert.ok(['FULL_SYNTAX', 'REFERENCE_CONTRACT_ONLY'].includes(result.toml));
});
