// Live query smoke check. Isolated regressions run through node:test, without credentials.
async function runInventoryCheck({ live = false, env = process.env, createClient } = {}) {
  if (!live) return { status: 'SKIP', reason: 'LIVE_CHECK_NOT_REQUESTED' };
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    return { status: 'SKIP', reason: 'MISSING_CREDENTIALS' };
  }
  const factory = createClient || require('@supabase/supabase-js').createClient;
  const client = factory(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const locations = await client.from('store_locations')
    .select('location_code, store_name, location_type, storage_condition')
    .ilike('location_code', 'IPD%');
  if (locations.error) throw new Error('LOCATION_QUERY_FAILED');
  const subLocations = await client.from('store_sub_locations')
    .select('store_code, name, type, code').ilike('store_code', 'IPD%');
  if (subLocations.error) throw new Error('SUB_LOCATION_QUERY_FAILED');
  if (!Array.isArray(locations.data) || !Array.isArray(subLocations.data)) {
    throw new Error('INVALID_QUERY_RESPONSE');
  }
  return { status: 'PASS', scope: 'READ_ONLY_QUERY_SMOKE', locations: locations.data.length,
    subLocations: subLocations.data.length };
}

async function main(args = process.argv.slice(2)) {
  if (args.some((arg) => arg !== '--live')) throw new Error('USAGE: --live is the only option');
  if (args.includes('--live')) require('dotenv').config({ quiet: true });
  const result = await runInventoryCheck({ live: args.includes('--live') });
  console.log(`${result.status} ${JSON.stringify(result)}`);
  if (result.status === 'SKIP' && args.includes('--live')) process.exitCode = 2;
  return result;
}

if (require.main === module) main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
});

module.exports = { runInventoryCheck, main };
