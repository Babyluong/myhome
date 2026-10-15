#!/usr/bin/env node
// Run before task changes. Existing snapshots are never overwritten or recaptured.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { ROOT, exactPath, captureSnapshot } = require('./check-agent-boundaries.cjs');
function captureBaseline(output, revision, root = ROOT) {
  if (!exactPath(output)) throw new Error('UNSAFE_SNAPSHOT_PATH');
  const absolute = path.join(root, output);
  if (fs.existsSync(absolute)) throw new Error('SNAPSHOT_ALREADY_EXISTS');
  const snapshot = captureSnapshot(root, revision);
  const data = `${JSON.stringify(snapshot, null, 2)}\n`;
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, data, { flag: 'wx' });
  return { file: output, files: Object.keys(snapshot.files).length,
    sha256: crypto.createHash('sha256').update(data).digest('hex') };
}
function main(args = process.argv.slice(2)) {
  try {
    if (args.length !== 4 || args[0] !== '--out' || args[2] !== '--revision') throw new Error('USAGE: --out <snapshot.json> --revision <full commit SHA>; capture before dispatch');
    const result = captureBaseline(args[1], args[3]);
    console.log(`CAPTURED path=${result.file} files=${result.files} sha256=${result.sha256}`);
    return 0;
  } catch (error) { console.error(`FAIL ${error.message}`); return 1; }
}
module.exports = { captureBaseline, main };
if (require.main === module) process.exitCode = main();
