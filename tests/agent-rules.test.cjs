const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { parsePorcelain } = require('../scripts/check-agent-boundaries.cjs');
const { runInventoryCheck } = require('../scripts/test-ipd-locations.cjs');
const repo = path.resolve(__dirname, '..');

function temporaryRoot(t) {
  const fixtureParent = path.join(repo, 'node_modules', '.cache');
  fs.mkdirSync(fixtureParent, { recursive: true });
  const root = fs.mkdtempSync(path.join(fixtureParent, 'home-rules-test-'));
  t.after(() => {
    const resolved = path.resolve(root);
    assert.ok(resolved.startsWith(`${path.resolve(fixtureParent)}${path.sep}home-rules-test-`));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return root;
}

function ruleFixture(t) {
  const root = temporaryRoot(t);
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.mkdirSync(path.join(root, 'src'));
  for (const name of ['check-rules.cjs', 'check-agent-boundaries.cjs']) {
    fs.copyFileSync(path.join(repo, 'scripts', name), path.join(root, 'scripts', name));
  }
  fs.writeFileSync(path.join(root, 'src/tracked.ts'), 'export const value = 1;\n');
  const git = (...args) => execFileSync('git', ['-c', 'core.fsmonitor=false', ...args],
    { cwd: root, stdio: 'pipe', encoding: 'utf8' });
  git('init', '-q'); git('config', 'user.email', 'qa@example.invalid');
  git('config', 'user.name', 'Isolated QA'); git('add', '.'); git('commit', '-qm', 'clean baseline');
  const run = () => spawnSync(process.execPath, [path.join(root, 'scripts/check-rules.cjs')],
    { cwd: root, encoding: 'utf8' });
  return { root, git, run };
}

test('porcelain parser preserves modified, untracked and rename paths including spaces', () => {
  const records = parsePorcelain(Buffer.from(
    ' M src/tracked.ts\0?? src/new file.ts\0R  src/destination.ts\0src/original.ts\0'));
  assert.equal(records[0].path, 'src/tracked.ts');
  assert.ok(records[0].status.includes('M'));
  assert.equal(records[1].path, 'src/new file.ts');
  assert.equal(records[2].path, 'src/destination.ts');
  assert.equal(records[2].originalPath, 'src/original.ts');
});

test('modified tracked violation is checked instead of falling back to last commit', (t) => {
  const f = ruleFixture(t);
  fs.writeFileSync(path.join(f.root, 'src/tracked.ts'), "export const endpoint = 'http://localhost:3000';\n");
  const result = f.run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /src[\\/]tracked\.ts/);
});

test('untracked violation with a spaced filename is checked', (t) => {
  const f = ruleFixture(t);
  fs.writeFileSync(path.join(f.root, 'src/new file.ts'), "export const endpoint = 'http://localhost:3000';\n");
  const result = f.run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /new file\.ts/);
});

test('staged rename destination is scanned without treating the source record as a filename', (t) => {
  const f = ruleFixture(t);
  f.git('mv', 'src/tracked.ts', 'src/renamed file.ts');
  fs.writeFileSync(path.join(f.root, 'src/renamed file.ts'), "export const endpoint = 'http://localhost:3000';\n");
  const result = f.run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /renamed file\.ts/);
  assert.doesNotMatch(result.stdout + result.stderr, /ENOENT|INVALID_GIT_STATUS/);
});

test('clean changed source is a positive rule-check control', (t) => {
  const f = ruleFixture(t);
  fs.writeFileSync(path.join(f.root, 'src/tracked.ts'), 'export const configuredValue = 2;\n');
  const result = f.run();
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('inventory check requires explicit live opt-in even when credentials are supplied', async () => {
  const result = await runInventoryCheck({ env: { VITE_SUPABASE_URL: 'https://fixture.invalid',
    VITE_SUPABASE_ANON_KEY: 'isolated-fixture' }, createClient: () => assert.fail('Unexpected client') });
  assert.deepEqual(result, { status: 'SKIP', reason: 'LIVE_CHECK_NOT_REQUESTED' });
});

test('missing inventory credentials produce SKIP without constructing a client', async () => {
  const result = await runInventoryCheck({ live: true, env: {},
    createClient: () => assert.fail('Unexpected client') });
  assert.deepEqual(result, { status: 'SKIP', reason: 'MISSING_CREDENTIALS' });
});

function isolatedClient(responses, queries) {
  return () => ({ from: (table) => {
    queries.push(table);
    return { select: () => ({ ilike: async () => responses[table] }) };
  } });
}

test('isolated inventory query control reports its narrow smoke scope', async () => {
  const queries = [];
  const result = await runInventoryCheck({ live: true,
    env: { VITE_SUPABASE_URL: 'https://fixture.invalid', VITE_SUPABASE_ANON_KEY: 'isolated-fixture' },
    createClient: isolatedClient({ store_locations: { data: [], error: null },
      store_sub_locations: { data: [], error: null } }, queries) });
  assert.equal(result.status, 'PASS');
  assert.equal(result.scope, 'READ_ONLY_QUERY_SMOKE');
  assert.deepEqual(queries, ['store_locations', 'store_sub_locations']);
});

for (const failingTable of ['store_locations', 'store_sub_locations']) {
  test(`inventory ${failingTable} query failure remains a failure`, async () => {
    const responses = { store_locations: { data: [], error: null },
      store_sub_locations: { data: [], error: null } };
    responses[failingTable] = { data: null, error: { message: 'isolated query failure' } };
    await assert.rejects(runInventoryCheck({ live: true,
      env: { VITE_SUPABASE_URL: 'https://fixture.invalid', VITE_SUPABASE_ANON_KEY: 'isolated-fixture' },
      createClient: isolatedClient(responses, []) }), /QUERY_FAILED/);
  });
}

test('live CLI without credentials cannot report successful verification', (t) => {
  const root = temporaryRoot(t);
  const result = spawnSync(process.execPath, [path.join(repo, 'scripts/test-ipd-locations.cjs'), '--live'],
    { cwd: root, encoding: 'utf8', env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' } });
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stdout, /SKIP.*MISSING_CREDENTIALS/);
  assert.doesNotMatch(result.stdout, /PASS/);
});
