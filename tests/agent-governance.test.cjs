const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');
const gates = require('../scripts/check-agent-boundaries.cjs');

function fixture(t) {
  const fixtureParent = path.join(process.cwd(), 'node_modules', '.cache');
  fs.mkdirSync(fixtureParent, { recursive: true });
  const root = fs.mkdtempSync(path.join(fixtureParent, 'home-governance-test-'));
  t.after(() => {
    const resolved = path.resolve(root);
    assert.ok(resolved.startsWith(`${path.resolve(fixtureParent)}${path.sep}home-governance-test-`));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const write = (file, content) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  };
  const git = (...args) => execFileSync('git', ['-c', 'core.fsmonitor=false', ...args],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const policy = {
    version: 2,
    owners: { amri: ['docs/audits/**'], babybun: ['docs/tasks/**'],
      babyluong: ['src/components/**', 'src/routes/**'], babyhien: ['src/services/**'],
      babyaaralyn: ['tests/**'] },
    exactOwners: {}, testPatterns: ['**/*.test.cjs'],
    fallbackOwners: [{ pattern: 'src/**', agent: 'babyhien' }],
  };
  write('docs/AGENT_OWNERSHIP.json', policy);
  write('src/components/allowed.tsx', 'export const existing = 1;\n');
  write('src/components/unassigned.tsx', 'export const existing = 2;\n');
  write('src/services/source.ts', 'export const existing = 3;\n');
  git('init', '-q'); git('config', 'user.email', 'qa@example.invalid');
  git('config', 'user.name', 'Isolated QA'); git('add', '.'); git('commit', '-qm', 'fixture baseline');
  const revision = git('rev-parse', 'HEAD');
  write('src/components/allowed.tsx', 'export const preexistingDirty = 4;\n');
  const snapshot = gates.captureSnapshot(root, revision);
  write('docs/audits/baseline.json', snapshot);
  const slice = (agent, allowedPaths) => ({ agent, allowedPaths, goal: 'Isolated regression',
    acceptanceCriteria: ['Changed paths must stay assigned'], dependencies: [], reportTo: 'amri' });
  const manifest = {
    version: 2, taskId: 'QA-GOVERNANCE', baselineRevision: revision,
    baselinePaths: ['src/components/allowed.tsx'], baselineSnapshotPath: 'docs/audits/baseline.json',
    baselineSnapshotSha256: crypto.createHash('sha256')
      .update(fs.readFileSync(path.join(root, 'docs/audits/baseline.json'))).digest('hex'),
    slices: [slice('amri', ['docs/audits/baseline.json', 'docs/audits/task.json']),
      slice('babyluong', ['src/components/allowed.tsx']), slice('babyhien', ['src/services/source.ts'])],
    ownerOverrides: {}, acceptanceCriteria: ['Preserve existing dirty changes'], status: 'ISOLATED_TESTING',
    approval: { approvedBy: 'user', date: '2026-10-13', evidence: 'Isolated test fixture',
      scope: 'Regression only', amriApproved: true },
  };
  const run = () => {
    write('docs/audits/task.json', manifest);
    return gates.runTask('docs/audits/task.json', gates.loadPolicy(root), root);
  };
  return { root, write, git, manifest, snapshot, run };
}

function rejection(action, pattern) {
  assert.throws(action, (error) => typeof error.code === 'string' && pattern.test(error.code));
}

function followOnSlice(agent, allowedPaths) {
  return { agent, allowedPaths, goal: 'Isolated follow-on regression',
    acceptanceCriteria: ['Changed paths must stay assigned'], dependencies: [], reportTo: 'amri' };
}

test('unchanged dirty baseline is preserved and a later assigned edit is allowed', (t) => {
  const f = fixture(t);
  assert.doesNotThrow(f.run);
  f.write('src/components/allowed.tsx', 'export const assignedUpdate = 5;\n');
  assert.ok(gates.changedSinceSnapshot(f.snapshot, f.root).includes('src/components/allowed.tsx'));
  assert.doesNotThrow(f.run);
});

test('later edit to a dirty baseline cannot escape its assignment', (t) => {
  const f = fixture(t);
  f.manifest.slices[1].allowedPaths = [];
  f.write('src/components/allowed.tsx', 'export const outOfScope = 6;\n');
  rejection(f.run, /UNASSIGNED|OUTSIDE/);
});

test('new and deleted unassigned paths are rejected', (t) => {
  const f = fixture(t);
  f.write('src/components/new.tsx', 'export const newFile = 1;\n');
  rejection(f.run, /UNASSIGNED|OUTSIDE/);
  fs.unlinkSync(path.join(f.root, 'src/components/new.tsx'));
  fs.unlinkSync(path.join(f.root, 'src/components/unassigned.tsx'));
  rejection(f.run, /UNASSIGNED|OUTSIDE/);
});

test('cross-owner rename requires assignments for both source and destination', (t) => {
  const f = fixture(t);
  f.git('mv', 'src/services/source.ts', 'src/components/moved.tsx');
  f.manifest.slices[1].allowedPaths.push('src/components/moved.tsx');
  f.manifest.slices[2].allowedPaths = [];
  rejection(f.run, /UNASSIGNED|OUTSIDE/);
  f.manifest.slices[2].allowedPaths.push('src/services/source.ts');
  assert.doesNotThrow(f.run);
});

test('baseline revision must resolve and match its pinned snapshot', (t) => {
  const f = fixture(t);
  f.manifest.baselineRevision = '0'.repeat(40);
  rejection(f.run, /REVISION|BASELINE|SNAPSHOT/);
});

test('tampering with a snapshot fails its pinned digest', (t) => {
  const f = fixture(t);
  f.snapshot.files['src/components/allowed.tsx'].sha256 = '0'.repeat(64);
  f.write('docs/audits/baseline.json', f.snapshot);
  rejection(f.run, /SNAPSHOT|DIGEST|BASELINE/);
});

for (const field of ['version', 'taskId', 'baselineRevision', 'baselinePaths', 'baselineSnapshotPath',
  'baselineSnapshotSha256', 'acceptanceCriteria', 'status', 'approval', 'ownerOverrides', 'slices']) {
  test(`manifest rejects missing ${field}`, (t) => {
    const f = fixture(t); delete f.manifest[field];
    rejection(f.run, /MANIFEST|BASELINE|SNAPSHOT|APPROVAL|LEGACY|REVISION|OWNER/);
  });
}

for (const field of ['goal', 'acceptanceCriteria', 'dependencies', 'reportTo']) {
  test(`assignment rejects missing ${field}`, (t) => {
    const f = fixture(t); delete f.manifest.slices[1][field];
    rejection(f.run, /SLICE|MANIFEST|ASSIGNMENT/);
  });
}

for (const file of ['src/components/**', '../outside.ts', 'src/../outside.ts', 'C:/outside.ts']) {
  test(`task allowlist rejects unsafe or nonexact path ${file}`, (t) => {
    const f = fixture(t); f.manifest.slices[1].allowedPaths.push(file);
    rejection(f.run, /PATH|MANIFEST|SLICE/);
  });
}

test('duplicate assignments fail even without a changed matching file', (t) => {
  const f = fixture(t);
  f.manifest.slices[2].allowedPaths.push('src/components/allowed.tsx');
  rejection(f.run, /OVERLAP|DUPLICATE|ASSIGNMENT/);
});

test('case-colliding assignments fail on Windows-compatible paths', (t) => {
  const f = fixture(t);
  f.manifest.slices[1].allowedPaths.push('src/components/Allowed.tsx');
  rejection(f.run, /CASE|COLLISION|DUPLICATE|OVERLAP/);
});

test('follow-on slices authorize an assigned change without replacing primary snapshot authority', (t) => {
  const f = fixture(t);
  const pinnedDigest = f.manifest.baselineSnapshotSha256;
  f.manifest.followOnSlices = [followOnSlice('babyluong', ['src/components/follow-on.tsx'])];
  f.write('src/components/follow-on.tsx', 'export const followOn = true;\n');
  assert.doesNotThrow(f.run);
  assert.equal(f.manifest.baselineSnapshotSha256, pinnedDigest);
});

test('follow-on slices preserve sequential same-owner repeats and reject cross-owner or case-overlapping paths', (t) => {
  const f = fixture(t);
  f.manifest.followOnSlices = [followOnSlice('babyhien', ['src/services/source.ts'])];
  assert.doesNotThrow(f.run, 'same-owner exact paths may recur across sequential follow-on slices');

  f.manifest.followOnSlices = [followOnSlice('babyhien', ['src/components/allowed.tsx'])];
  rejection(f.run, /OVERLAP/);

  f.manifest.followOnSlices = [followOnSlice('babyhien', ['src/Services/source.ts'])];
  rejection(f.run, /CASE|COLLISION|DUPLICATE|OVERLAP/);
});

test('follow-on slices reject invalid agents', (t) => {
  const f = fixture(t);
  f.manifest.followOnSlices = [followOnSlice('intern', ['src/components/follow-on.tsx'])];
  rejection(f.run, /UNKNOWN_OWNER/);
});

test('follow-on test paths cannot transfer protected test ownership', (t) => {
  const f = fixture(t);
  const testPath = 'tests/follow-on.test.cjs';
  f.manifest.followOnSlices = [followOnSlice('babyhien', [testPath])];
  f.manifest.ownerOverrides[testPath] = 'babyhien';
  rejection(f.run, /PROTECTED_TEST_OVERRIDE/);
});

test('follow-on metadata remains optional for legacy version-2 manifests', (t) => {
  const f = fixture(t);
  assert.equal(Object.hasOwn(f.manifest, 'followOnSlices'), false);
  assert.doesNotThrow(f.run);
});

test('follow-on assignments do not authorize unrelated unassigned paths', (t) => {
  const f = fixture(t);
  f.manifest.followOnSlices = [followOnSlice('babyluong', ['src/components/follow-on.tsx'])];
  f.write('src/components/follow-on.tsx', 'export const followOn = true;\n');
  f.write('src/components/unassigned.tsx', 'export const outsideAssignment = true;\n');
  rejection(f.run, /UNASSIGNED|OUTSIDE/);
});

test('follow-on assignments cannot bypass the top-level pinned snapshot digest', (t) => {
  const f = fixture(t);
  f.manifest.followOnSlices = [followOnSlice('babyluong', ['src/components/follow-on.tsx'])];
  f.write('src/components/follow-on.tsx', 'export const followOn = true;\n');
  f.write('docs/audits/baseline.json', { ...f.snapshot, revision: '0'.repeat(40) });
  rejection(f.run, /BASELINE_SNAPSHOT_CHANGED/);
});

test('semantic ownership override requires Amri approval and one exact owner', (t) => {
  const f = fixture(t);
  f.write('src/routes/auth.tsx', 'export const permission = true;\n');
  f.manifest.slices[2].allowedPaths.push('src/routes/auth.tsx');
  rejection(f.run, /OWNER|OVERRIDE|OUTSIDE/);
  f.manifest.ownerOverrides['src/routes/auth.tsx'] = 'babyhien';
  f.manifest.approval.amriApproved = false;
  rejection(f.run, /APPROVAL|OVERRIDE/);
  f.manifest.approval.amriApproved = true;
  assert.doesNotThrow(f.run);
});

test('legacy manifest never claims verified ownership', (t) => {
  const f = fixture(t); f.manifest.version = 1;
  rejection(f.run, /LEGACY_UNVERIFIED|MANIFEST/);
});

test('changed unowned configuration needs an approved exact override', (t) => {
  const f = fixture(t);
  f.write('public/settings.json', '{}');
  f.manifest.slices[0].allowedPaths.push('public/settings.json');
  rejection(f.run, /OWNER|UNASSIGNED|OVERRIDE/);
  f.manifest.ownerOverrides['public/settings.json'] = 'amri';
  assert.doesNotThrow(f.run);
});

test('an override cannot transfer test responsibility to backend', (t) => {
  const f = fixture(t);
  f.write('tests/access.test.cjs', 'module.exports = {};\n');
  f.manifest.slices[2].allowedPaths.push('tests/access.test.cjs');
  f.manifest.ownerOverrides['tests/access.test.cjs'] = 'babyhien';
  rejection(f.run, /OWNER|OVERRIDE|PROTECTED/);
});

test('an unused override cannot grant future blanket access', (t) => {
  const f = fixture(t);
  f.manifest.ownerOverrides['src/routes/future.tsx'] = 'babyhien';
  rejection(f.run, /OVERRIDE|ASSIGNMENT|OWNER/);
});
