const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');

// Load the actual implementation in an isolated dependency and transport sandbox.
// Unexpected imports fail closed; no application Supabase client is instantiated.
function loadSource(file, dependencies = {}, globals = {}) {
  const filename = path.resolve(__dirname, '..', file);
  // Only the build-time environment access is substituted; behavior stays real.
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8').replace(/\bimport\.meta\.env\b/g, 'globalThis.__qaEnv'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  const context = vm.createContext({ module, exports: module.exports, require(id) {
    if (!Object.hasOwn(dependencies, id)) throw new Error(`Unmocked import denied: ${id}`);
    return dependencies[id];
  }, Error, Request, Response, Headers, URL, TextEncoder, TextDecoder, atob, btoa, crypto: webcrypto,
  console: { log() {}, error() {}, warn() {},info() {} }, setTimeout, clearTimeout, ...globals });
  new vm.Script(source, { filename }).runInContext(context);
  return module.exports;
}
module.exports = { loadSource };
