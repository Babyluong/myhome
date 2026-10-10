/**
 * H.O.M.E. Agent Token Monitor
 * Reads Antigravity transcript logs to provide real-time token telemetry.
 */

const fs = require('fs');
const path = require('path');

// Search across both antigravity and antigravity-ide directories
const candidateDirs = [
  path.join(process.env.USERPROFILE, '.gemini', 'antigravity-ide', 'brain'),
  path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain')
].filter(d => fs.existsSync(d));

if (candidateDirs.length === 0) {
  console.error('[TokenMonitor] Antigravity brain directory not found.');
  process.exit(1);
}

// Collect all sessions across candidates
const allSessions = [];
for (const dir of candidateDirs) {
  const list = fs.readdirSync(dir)
    .filter(d => fs.existsSync(path.join(dir, d, '.system_generated', 'logs', 'transcript.jsonl')))
    .map(d => ({
      id: d,
      dir,
      transcript: path.join(dir, d, '.system_generated', 'logs', 'transcript.jsonl'),
      mtime: fs.statSync(path.join(dir, d, '.system_generated', 'logs', 'transcript.jsonl')).mtime.getTime()
    }));
  allSessions.push(...list);
}

allSessions.sort((a,b) => b.mtime - a.mtime);

if (allSessions.length === 0) {
  console.log('[TokenMonitor] No active transcripts found.');
  process.exit(0);
}

// Allow specifying session ID or default to most recent with token data
const requestedId = process.argv[2];
let active = requestedId ? allSessions.find(s => s.id.startsWith(requestedId)) : null;

if (!active) {
  // Find the most recent session that has transcript data
  active = allSessions[0];
  // If the newest has 0 tokens recorded, check if previous recent session had token telemetry
  for (const s of allSessions) {
    const head = fs.readFileSync(s.transcript, 'utf-8').slice(0, 10000);
    if (head.includes('"input_tokens"') || head.includes('"cache_read_tokens"')) {
      active = s;
      break;
    }
  }
}

console.log('='.repeat(78));
console.log(`  H.O.M.E. REAL-TIME TOKEN MONITOR | Session: ${active.id}`);
console.log('='.repeat(78));

const lines = fs.readFileSync(active.transcript, 'utf-8').trim().split('\n');

let totalFreshInput = 0;
let totalCachedInput = 0;
let totalOutput = 0;
let totalTurns = 0;
let expensiveScans = 0;
let cacheMissSpikes = 0;
const history = [];

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.type === 'PLANNER_RESPONSE') {
      totalTurns++;
      const freshIn = entry.input_tokens || 0;
      const cachedIn = entry.cache_read_tokens || 0;
      const out = entry.output_tokens || 0;
      
      totalFreshInput += freshIn;
      totalCachedInput += cachedIn;
      totalOutput += out;

      if (freshIn > 30000 && cachedIn === 0) {
        cacheMissSpikes++;
      }

      // Check tool calls
      const tools = (entry.tool_calls || []).map(t => {
        const toolName = t.name || t.toolAction || (t.function && t.function.name) || 'tool';
        const cmd = t.args?.CommandLine || t.run_command?.CommandLine || '';
        let label = t.args?.toolAction ? t.args.toolAction.replace(/^"|"$/g, '') : toolName;
        if (cmd.includes('Recurse') || cmd.includes('grep -r')) {
          expensiveScans++;
          label += ' ⚠️[SCAN]';
        }
        return label;
      }).join(', ');

      history.push({
        step: entry.step_index,
        freshIn,
        cachedIn,
        out,
        tools: tools ? tools.slice(0, 36) : 'text_response'
      });
    }
  } catch (err) {
    // Ignore partial json lines
  }
}

// Display the last 10 turns
console.log('\nRecent Turn Activity:');
console.log('Step | Fresh In   | Cached In  | Output   | Primary Actions');
console.log('-'.repeat(78));

const recent = history.slice(-10);
for (const h of recent) {
  const step = String(h.step).padEnd(4);
  const fresh = String(h.freshIn.toLocaleString()).padStart(8);
  const cached = String(h.cachedIn.toLocaleString()).padStart(10);
  const out = String(h.out.toLocaleString()).padStart(8);
  console.log(`${step} | ${fresh} | ${cached} | ${out} | ${h.tools}`);
}

console.log('-'.repeat(78));
console.log(`Total Session Turns:       ${totalTurns}`);
console.log(`Total Fresh Input Tokens:  ${totalFreshInput.toLocaleString()}`);
console.log(`Total Cached Context:      ${totalCachedInput.toLocaleString()}`);
console.log(`Total Output Tokens:       ${totalOutput.toLocaleString()}`);

const cacheHitRate = ((totalCachedInput / (totalFreshInput + totalCachedInput || 1)) * 100).toFixed(1);
console.log(`Context Cache Hit Rate:    ${cacheHitRate}%`);

const lastTurn = recent[recent.length - 1];
const currentContext = (lastTurn?.cachedIn || 0) + (lastTurn?.freshIn || 0);
console.log(`Current Context Window:    ${currentContext.toLocaleString()} tokens`);

console.log('='.repeat(78));
if (expensiveScans > 0) {
  console.log(`⚠️  SCAN WARNING: ${expensiveScans} unconstrained directory scan(s) detected.`);
  console.log('    Ensure zero-scan-router skill and CODEBASE_ROUTER.json are utilized.');
} else {
  console.log('✅  ZERO-SCAN AUDIT: CLEAN. No unbounded recursive scans detected.');
}

if (totalTurns > 25 || currentContext > 60000) {
  console.log('='.repeat(78));
  console.log(`⚠️  CONTEXT FATIGUE ALERT (${totalTurns} turns | ${currentContext.toLocaleString()} tokens)!`);
  console.log(`    Root Cause: Conversation thread carries ${totalTurns} accumulated turns.`);
  console.log(`    Every turn re-evaluates the entire ${currentContext.toLocaleString()} token history.`);
  if (cacheMissSpikes > 0) {
    console.log(`    ⚠️ Cache Eviction Spike: ${cacheMissSpikes} turn(s) incurred a full cache miss (>30k fresh input).`);
  }
  console.log('    RECOMMENDATION: Start a fresh chat session to reset context window to baseline (<5k).');
}
console.log('='.repeat(78));
