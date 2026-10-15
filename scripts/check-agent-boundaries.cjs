#!/usr/bin/env node
// Content-based task boundary validation; it does not establish who edited a file.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const AGENTS = new Set(['amri', 'babybun', 'babyluong', 'babyhien', 'babyaaralyn']);
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
function fail(code, filePath) {
  const error = new Error(`${code}${filePath ? ` path=${filePath}` : ''}`);
  error.code = code;
  throw error;
}
function safePath(value) {
  return text(value) && !/[\\\x00-\x1f:]/.test(value) && !value.startsWith('/') &&
    value.split('/').every((part) => part && part !== '.' && part !== '..' && !/[. ]$/.test(part));
}
function exactPath(value) { return safePath(value) && !/[*?]/.test(value); }
function globRegex(glob) {
  let source = '^';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i];
    if (char === '*' && glob[i + 1] === '*') {
      i += 1;
      if (glob[i + 1] === '/') { i += 1; source += '(?:.*/)?'; }
      else source += '.*';
    } else if (char === '*') source += '[^/]*';
    else source += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
  }
  return new RegExp(`${source}$`);
}
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { fail('INVALID_JSON', file); }
}
function pathList(values, label, exact = true) {
  if (!Array.isArray(values)) fail(label === 'baselinePaths' ? 'INVALID_BASELINE_PATH_LIST' : 'INVALID_PATH_LIST', label);
  const seen = new Set();
  for (const value of values) {
    if (!(exact ? exactPath(value) : safePath(value))) fail('UNSAFE_PATH', value);
    const key = value.toLowerCase();
    if (seen.has(key)) fail('DUPLICATE_OR_CASE_COLLIDING_PATH', value);
    seen.add(key);
  }
  return values;
}
function stringList(values, label, nonempty = false) {
  if (!Array.isArray(values) || (nonempty && !values.length) || values.some((value) => !text(value))) {
    fail(label.startsWith('slice.') ? 'INVALID_SLICE_STRING_LIST' : 'INVALID_MANIFEST_STRING_LIST', label);
  }
}
function git(args, root = ROOT, encoding = 'utf8') {
  try { return execFileSync('git', ['-c', 'core.fsmonitor=false', ...args], { cwd: root, encoding, maxBuffer: 32 * 1024 * 1024 }); }
  catch { fail('GIT_UNAVAILABLE'); }
}
function resolveRevision(revision, root = ROOT) {
  if (typeof revision !== 'string' || !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/i.test(revision)) fail('INVALID_BASELINE_REVISION');
  let resolved;
  try { resolved = git(['rev-parse', '--verify', `${revision}^{commit}`], root).trim(); }
  catch { fail('INVALID_BASELINE_REVISION'); }
  if (resolved.toLowerCase() !== revision.toLowerCase()) fail('INVALID_BASELINE_REVISION');
  return resolved;
}
function parsePorcelain(value) {
  const records = value.toString('utf8').split('\0');
  if (records.at(-1) === '') records.pop();
  const result = [];
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i];
    if (record.length < 4 || record[2] !== ' ') fail('INVALID_GIT_STATUS');
    const entry = { status: record.slice(0, 2), path: record.slice(3) };
    if (/[RC]/.test(entry.status)) {
      entry.originalPath = records[++i];
      if (!entry.originalPath) fail('INVALID_GIT_STATUS');
    }
    result.push(entry);
  }
  return result;
}
function changedPaths(root = ROOT) {
  return [...new Set(parsePorcelain(git(['status', '--porcelain=v1', '--untracked-files=all', '-z'], root, 'buffer'))
    .flatMap((entry) => entry.originalPath ? [entry.path, entry.originalPath] : [entry.path]))];
}
function allRepositoryPaths(root = ROOT) {
  return [...new Set(git(['ls-files', '--cached', '--others', '--exclude-standard', '-z'], root).split('\0').filter(Boolean))];
}
function loadPolicy(root = ROOT) {
  const policy = readJson(path.join(root, 'docs/AGENT_OWNERSHIP.json'));
  if (!object(policy) || !object(policy.owners)) fail('INVALID_POLICY');
  for (const [agent, patterns] of Object.entries(policy.owners)) {
    if (!AGENTS.has(agent)) fail('UNKNOWN_OWNER', agent);
    pathList(patterns, agent, false);
  }
  for (const agent of AGENTS) if (!Array.isArray(policy.owners[agent])) fail('MISSING_OWNER', agent);
  if (policy.exactOwners !== undefined && !object(policy.exactOwners)) fail('INVALID_EXACT_OWNERS');
  pathList(Object.keys(policy.exactOwners || {}), 'exactOwners');
  for (const agent of Object.values(policy.exactOwners || {})) if (!AGENTS.has(agent)) fail('UNKNOWN_OWNER', agent);
  pathList(policy.testPatterns || [], 'testPatterns', false);
  if (policy.fallbackOwners !== undefined && !Array.isArray(policy.fallbackOwners)) fail('INVALID_FALLBACK_OWNERS');
  for (const rule of policy.fallbackOwners || []) {
    if (!object(rule) || !safePath(rule.pattern) || !AGENTS.has(rule.agent)) fail('INVALID_FALLBACK_OWNER');
  }
  return policy;
}
function ownersFor(file, policy) {
  if (Object.hasOwn(policy.exactOwners || {}, file)) return [policy.exactOwners[file]];
  if ((policy.testPatterns || []).some((pattern) => globRegex(pattern).test(file))) return ['babyaaralyn'];
  const owners = Object.entries(policy.owners).filter(([, patterns]) => patterns.some((pattern) => globRegex(pattern).test(file))).map(([agent]) => agent);
  if (owners.length) return owners;
  const fallback = (policy.fallbackOwners || []).find((rule) => globRegex(rule.pattern).test(file));
  return fallback ? [fallback.agent] : [];
}
function validatePolicy(policy, root = ROOT) {
  const files = allRepositoryPaths(root);
  pathList(files, 'repository');
  for (const file of files) {
    const owners = ownersFor(file, policy);
    if (owners.length > 1) fail('OVERLAPPING_OWNERS', file);
    const requiresOwner = /^(?:src|tests|specs|scripts|\.agents|\.codex)\//.test(file) ||
      /^(?:package(?:-lock)?\.json|tsconfig[^/]*\.json|[^/]+\.config\.[^/]+)$/.test(file);
    if (!owners.length && requiresOwner) fail('UNASSIGNED_POLICY_PATH', file);
  }
  return { files: files.length };
}
function validateManifest(manifest, policy, root = ROOT) {
  if (!object(manifest)) fail('INVALID_MANIFEST');
  if (manifest.version !== 2) fail('LEGACY_UNVERIFIED');
  if (!text(manifest.taskId) || !/^[a-zA-Z0-9._-]+$/.test(manifest.taskId) || !text(manifest.status)) fail('INVALID_MANIFEST');
  resolveRevision(manifest.baselineRevision, root);
  pathList(manifest.baselinePaths, 'baselinePaths');
  if (!exactPath(manifest.baselineSnapshotPath)) fail('UNSAFE_SNAPSHOT_PATH');
  if (!/^[a-f0-9]{64}$/i.test(manifest.baselineSnapshotSha256 || '')) fail('MISSING_SNAPSHOT_DIGEST');
  stringList(manifest.acceptanceCriteria, 'acceptanceCriteria', true);
  const approval = manifest.approval;
  if (!object(approval) || approval.approvedBy !== 'user' || !/^\d{4}-\d{2}-\d{2}$/.test(approval.date || '') ||
      !text(approval.evidence) || !text(approval.scope)) fail('INVALID_APPROVAL');
  const approvalDate = new Date(`${approval.date}T00:00:00Z`);
  if (Number.isNaN(approvalDate.valueOf()) || approvalDate.toISOString().slice(0, 10) !== approval.date) fail('INVALID_APPROVAL_DATE');
  if (!Array.isArray(manifest.slices) || !manifest.slices.length) fail('INVALID_MANIFEST_SLICES');
  const followOnSlices = manifest.followOnSlices === undefined ? [] : manifest.followOnSlices;
  if (!Array.isArray(followOnSlices)) fail('INVALID_MANIFEST_FOLLOW_ON_SLICES');
  const assigned = new Map();
  const folded = new Map();
  for (const slice of [...manifest.slices, ...followOnSlices]) {
    if (!object(slice) || !AGENTS.has(slice.agent)) fail('UNKNOWN_OWNER');
    if (!text(slice.goal) || slice.reportTo !== 'amri') fail('INVALID_SLICE_CONTRACT');
    stringList(slice.acceptanceCriteria, 'slice.acceptanceCriteria', true);
    stringList(slice.dependencies, 'slice.dependencies');
    pathList(slice.allowedPaths, 'allowedPaths');
    for (const file of slice.allowedPaths) {
      const key = file.toLowerCase();
      const prior = folded.get(key);
      if (prior && (prior.file !== file || prior.agent !== slice.agent)) fail('OVERLAPPING_SLICES', file);
      if (!prior) folded.set(key, { file, agent: slice.agent });
      assigned.set(file, slice.agent);
    }
  }
  if (!object(manifest.ownerOverrides)) fail('INVALID_OWNER_OVERRIDES');
  pathList(Object.keys(manifest.ownerOverrides), 'ownerOverrides');
  for (const [file, agent] of Object.entries(manifest.ownerOverrides)) {
    if (!AGENTS.has(agent)) fail('UNKNOWN_OWNER', file);
    if (assigned.get(file) !== agent) fail('INVALID_OVERRIDE_ASSIGNMENT', file);
    if (approval.amriApproved !== true) fail('OVERRIDE_NOT_APPROVED', file);
    if ((policy.testPatterns || []).some((pattern) => globRegex(pattern).test(file)) && agent !== 'babyaaralyn') {
      fail('PROTECTED_TEST_OVERRIDE', file);
    }
  }
  // Validate every assignment at dispatch, even when its file is untouched.
  for (const [file, agent] of assigned) {
    const owners = Object.hasOwn(manifest.ownerOverrides, file) ? [manifest.ownerOverrides[file]] : ownersFor(file, policy);
    if (owners.length !== 1 || owners[0] !== agent) fail('OUTSIDE_OWNER_SLICE', file);
  }
  return assigned;
}
function fileHash(root, file) {
  const absolute = path.join(root, file);
  let stat;
  try { stat = fs.lstatSync(absolute); }
  catch (error) { if (error.code === 'ENOENT') return undefined; throw error; }
  if (!stat.isFile() && !stat.isSymbolicLink()) fail('UNSUPPORTED_FILE_TYPE', file);
  // Hash the link text rather than reading a target outside the repository.
  const data = stat.isSymbolicLink() ? Buffer.from(fs.readlinkSync(absolute)) : fs.readFileSync(absolute);
  return crypto.createHash('sha256').update(data).digest('hex');
}
function captureSnapshot(root = ROOT, revision) {
  const resolved = resolveRevision(revision, root);
  const files = {};
  const paths = allRepositoryPaths(root).sort();
  pathList(paths, 'repository');
  for (const file of paths) {
    const sha256 = fileHash(root, file);
    if (sha256 !== undefined) Object.defineProperty(files, file, { value: { sha256 }, enumerable: true });
  }
  return { version: 1, revision: resolved, files };
}
function validateSnapshot(snapshot, revision, root = ROOT, baselinePaths = []) {
  if (!object(snapshot) || snapshot.version !== 1 || snapshot.revision !== revision || !object(snapshot.files)) fail('INVALID_SNAPSHOT');
  pathList(Object.keys(snapshot.files), 'snapshot.files');
  for (const [file, entry] of Object.entries(snapshot.files)) {
    if (!object(entry) || !/^[a-f0-9]{64}$/i.test(entry.sha256 || '')) fail('INVALID_SNAPSHOT_HASH', file);
  }
  const baseline = new Set(baselinePaths);
  const tracked = git(['ls-tree', '-r', '--name-only', '-z', revision], root).split('\0').filter(Boolean);
  for (const file of tracked) {
    if (!Object.hasOwn(snapshot.files, file) && !baseline.has(file)) fail('INCOMPLETE_SNAPSHOT', file);
  }
}
function changedSinceSnapshot(snapshot, root = ROOT) {
  const current = captureSnapshot(root, snapshot.revision);
  return [...new Set([...Object.keys(snapshot.files), ...Object.keys(current.files)])]
    .filter((file) => snapshot.files[file]?.sha256 !== current.files[file]?.sha256).sort();
}
function runTask(manifestPath, policy, root = ROOT) {
  if (!exactPath(manifestPath)) fail('UNSAFE_MANIFEST_PATH');
  policy ||= loadPolicy(root);
  const manifest = readJson(path.join(root, manifestPath));
  const assigned = validateManifest(manifest, policy, root);
  validatePolicy(policy, root);
  const snapshotFile = path.join(root, manifest.baselineSnapshotPath);
  const digest = crypto.createHash('sha256').update(fs.readFileSync(snapshotFile)).digest('hex');
  if (digest !== manifest.baselineSnapshotSha256) fail('BASELINE_SNAPSHOT_CHANGED');
  const snapshot = readJson(snapshotFile);
  validateSnapshot(snapshot, manifest.baselineRevision, root, manifest.baselinePaths);
  const changed = changedSinceSnapshot(snapshot, root);
  for (const file of changed) {
    if (!exactPath(file)) fail('UNSAFE_CHANGED_PATH', file);
    if (!assigned.has(file)) fail('UNASSIGNED_PATH', file);
  }
  return { status: 'VALID', changed, changed_count: changed.length };
}
function main(args = process.argv.slice(2), root = ROOT) {
  try {
    const policy = loadPolicy(root);
    if (args.length === 1 && args[0] === '--validate') {
      const result = validatePolicy(policy, root);
      console.log(`PASS status=VALID policy_files=${result.files}`);
    } else if (args.length === 2 && args[0] === '--task') {
      const result = runTask(args[1], policy, root);
      console.log(`PASS status=VALID changed_count=${result.changed_count} attribution=NOT_ESTABLISHED`);
    } else fail('USAGE');
    return 0;
  } catch (error) {
    console.error(`FAIL status=${error.code || 'CHECK_FAILED'} detail=${error.message}`);
    return 1;
  }
}
module.exports = { ROOT, AGENTS, safePath, exactPath, globRegex, readJson, parsePorcelain, changedPaths,
  allRepositoryPaths, loadPolicy, ownersFor, validatePolicy, validateManifest, resolveRevision, captureSnapshot,
  validateSnapshot, changedSinceSnapshot, runTask, main };
if (require.main === module) process.exitCode = main();
