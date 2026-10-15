#!/usr/bin/env node
// Validate skill metadata, role reference contracts, resources and router targets.
// TOML validation is intentionally limited to the configuration contract used here.
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { TextDecoder } = require('node:util');
const { execFileSync } = require('node:child_process');
const { ROOT, AGENTS, exactPath, loadPolicy, validatePolicy } = require('./check-agent-boundaries.cjs');

function fail(code, file) {
  const error = new Error(`${code}${file ? ` path=${file}` : ''}`);
  error.code = code;
  throw error;
}
function readUtf8(file) {
  const bytes = fs.readFileSync(file);
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) fail('UTF8_BOM', file);
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { fail('INVALID_UTF8', file); }
}
function parseSkill(content, file = 'SKILL.md') {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!frontmatter) fail('MISSING_FRONTMATTER', file);
  let metadata;
  try { metadata = yaml.load(frontmatter[1], { schema: yaml.JSON_SCHEMA }); }
  catch { fail('INVALID_YAML', file); }
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata) ||
      typeof metadata.name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name) ||
      typeof metadata.description !== 'string' || !metadata.description.trim()) fail('INVALID_SKILL_METADATA', file);
  return { metadata, body: content.slice(frontmatter[0].length) };
}
function resourcePath(root, directory, reference) {
  const clean = reference.split('#')[0].split('?')[0];
  let decoded;
  try { decoded = decodeURIComponent(clean); } catch { fail('INVALID_RESOURCE_PATH', reference); }
  if (!decoded || /^(?:[a-z]+:|\/\/)/i.test(decoded)) return null;
  if (decoded.includes('\0') || decoded.includes('\\')) fail('INVALID_RESOURCE_PATH', reference);
  const absolute = path.resolve(directory, decoded);
  const relative = path.relative(root, absolute);
  if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) fail('RESOURCE_OUTSIDE_REPOSITORY', reference);
  return absolute;
}
function validateSkill(file, root = ROOT) {
  const skill = parseSkill(readUtf8(file), file);
  if (path.basename(path.dirname(file)) !== skill.metadata.name) fail('SKILL_NAME_DIRECTORY_MISMATCH', file);
  const resources = [];
  if (skill.metadata.resources !== undefined) {
    if (!Array.isArray(skill.metadata.resources) || skill.metadata.resources.some((item) => typeof item !== 'string' || !item.trim())) fail('INVALID_RESOURCES', file);
    resources.push(...skill.metadata.resources);
  }
  // Local Markdown links are declared dependencies. Optional examples in prose
  // are not treated as mandatory resources merely because they mention a filename.
  for (const match of skill.body.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) resources.push(match[1]);
  for (const resource of resources) {
    const absolute = resourcePath(root, path.dirname(file), resource);
    if (absolute && !fs.existsSync(absolute)) fail('MISSING_SKILL_RESOURCE', resource);
  }
  return skill;
}
function parseTomlContract(content, file = 'config.toml') {
  if (process.env.HOME_AGENT_PYTHON) {
    let parsed;
    try {
      parsed = JSON.parse(execFileSync(process.env.HOME_AGENT_PYTHON, ['-c',
        'import sys,json,tomllib; print(json.dumps(tomllib.loads(sys.stdin.read())))'],
      { input: content, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }));
    } catch { fail('INVALID_TOML_OR_PARSER_UNAVAILABLE', file); }
    const sections = new Map();
    function visit(table, prefix) {
      const fields = {};
      sections.set(prefix, [fields]);
      for (const [key, value] of Object.entries(table)) {
        const name = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) visit(value, name);
        else if (Array.isArray(value) && value.every((entry) => entry && typeof entry === 'object')) sections.set(name, value);
        else Object.defineProperty(fields, key, { value, enumerable: true });
      }
    }
    visit(parsed, '');
    return sections;
  }
  const sections = new Map([['', [{}]]]);
  let table = sections.get('')[0];
  for (const original of content.split(/\r?\n/)) {
    const line = original.trim();
    if (!line || line.startsWith('#')) continue;
    const header = /^(\[\[?)([A-Za-z0-9_.-]+)(\]\]?)\s*(?:#.*)?$/.exec(line);
    if (header) {
      const array = header[1] === '[[';
      if (header[3] !== (array ? ']]' : ']')) fail('INVALID_TOML_CONTRACT', file);
      if (sections.has(header[2]) && !array) fail('DUPLICATE_TOML_TABLE', file);
      table = {};
      if (!sections.has(header[2])) sections.set(header[2], []);
      sections.get(header[2]).push(table);
      continue;
    }
    const assignment = /^("(?:[^"\\]|\\.)*"|[A-Za-z0-9_-]+)\s*=\s*("(?:[^"\\]|\\.)*"|true|false|[0-9]+)\s*(?:#.*)?$/.exec(line);
    if (!assignment) fail('UNSUPPORTED_TOML_CONTRACT_SYNTAX', file);
    let key;
    let value;
    try {
      key = assignment[1].startsWith('"') ? JSON.parse(assignment[1]) : assignment[1];
      value = JSON.parse(assignment[2]);
    } catch { fail('INVALID_TOML_CONTRACT', file); }
    if (Object.hasOwn(table, key)) fail('DUPLICATE_TOML_KEY', file);
    Object.defineProperty(table, key, { value, enumerable: true });
  }
  return sections;
}
function validateRoles(root = ROOT) {
  const configPath = path.join(root, '.codex/config.toml');
  const config = parseTomlContract(readUtf8(configPath), configPath);
  if (config.get('agents')?.[0].enabled !== true) fail('AGENTS_NOT_ENABLED');
  let count = 0;
  for (const [section, entries] of config) {
    if (!section.startsWith('agents.')) continue;
    const name = section.slice(7);
    if (!AGENTS.has(name) || name === 'amri') fail('UNKNOWN_ROLE', name);
    const reference = entries[0];
    if (!exactPath(reference.config_file) || typeof reference.description !== 'string' || !reference.description.trim()) fail('INVALID_ROLE_REFERENCE', name);
    const roleFile = path.join(root, '.codex', reference.config_file);
    const role = parseTomlContract(readUtf8(roleFile), roleFile);
    const fields = role.get('')[0];
    if (fields.name !== name || typeof fields.description !== 'string' || !fields.description.trim() ||
        typeof fields.developer_instructions !== 'string' || !fields.developer_instructions.trim()) fail('INVALID_ROLE_CONTRACT', name);
    const skills = role.get('skills.config');
    if (!skills?.length) fail('MISSING_ROLE_SKILLS', name);
    for (const skill of skills) {
      if (skill.enabled !== true || typeof skill.path !== 'string') fail('INVALID_ROLE_SKILL_REFERENCE', name);
      const directory = resourcePath(root, path.dirname(roleFile), skill.path);
      if (!directory || !fs.existsSync(path.join(directory, 'SKILL.md'))) fail('MISSING_ROLE_SKILL', name);
    }
    count += 1;
  }
  if (count !== AGENTS.size - 1) fail('MISSING_ROLE');
  return count;
}
function validateRouter(root = ROOT) {
  const file = path.join(root, '.agents/CODEBASE_ROUTER.json');
  let router;
  try { router = JSON.parse(readUtf8(file)); } catch (error) { if (error.code) throw error; fail('INVALID_ROUTER_JSON', file); }
  if (!router || typeof router.modules !== 'object' || Array.isArray(router.modules) || !Object.keys(router.modules).length) fail('INVALID_ROUTER');
  let targets = 0;
  for (const [name, module] of Object.entries(router.modules)) {
    if (!module || typeof module !== 'object' || !exactPath(module.root)) fail('INVALID_MODULE_ROOT', name);
    if (!fs.existsSync(path.join(root, module.root)) || !fs.statSync(path.join(root, module.root)).isDirectory()) fail('MISSING_ROUTER_ROOT', module.root);
    for (const kind of ['pages', 'services']) {
      if (!Array.isArray(module[kind])) fail('INVALID_ROUTER_TARGET_LIST', name);
      for (const target of module[kind]) {
        if (!exactPath(target)) fail('INVALID_ROUTER_TARGET', target);
        if (!fs.existsSync(path.join(root, target)) || !fs.statSync(path.join(root, target)).isFile()) fail('MISSING_ROUTER_TARGET', target);
        targets += 1;
      }
    }
  }
  return targets;
}
function validateSystem(root = ROOT) {
  readUtf8(path.join(root, 'AGENTS.md'));
  readUtf8(path.join(root, '.agents/AGENTS.md'));
  const skillRoot = path.join(root, '.agents/skills');
  let skills = 0;
  for (const directory of fs.readdirSync(skillRoot, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    validateSkill(path.join(skillRoot, directory.name, 'SKILL.md'), root);
    skills += 1;
  }
  const roles = validateRoles(root);
  const routerTargets = validateRouter(root);
  const policy = validatePolicy(loadPolicy(root), root);
  return { skills, roles, routerTargets, policyFiles: policy.files,
    toml: process.env.HOME_AGENT_PYTHON ? 'FULL_SYNTAX' : 'REFERENCE_CONTRACT_ONLY' };
}
function main() {
  try {
    const result = validateSystem();
    const full = result.toml === 'FULL_SYNTAX';
    console.log(`${full ? 'PASS' : 'PARTIAL'} status=STRUCTURE_VALID skills=${result.skills} roles=${result.roles} router_targets=${result.routerTargets} policy_files=${result.policyFiles} toml_scope=${result.toml}`);
    if (!full) console.log('Full TOML syntax remains unverified: configure HOME_AGENT_PYTHON with Python 3.11+ for tomllib.');
    return full ? 0 : 2;
  } catch (error) { console.error(`FAIL status=${error.code || 'SYSTEM_CHECK_FAILED'} detail=${error.message}`); return 1; }
}
module.exports = { readUtf8, parseSkill, resourcePath, validateSkill, parseTomlContract, validateRoles, validateRouter, validateSystem, main };
if (require.main === module) process.exitCode = main();
