const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadSource } = require('./home-health-regressions.test.cjs');
function fixture() {
  const cache = new Map();
  const navigator = { onLine: true };
  const memory = new Map();const localStorage = { getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k) };
  let cacheRead = async k => cache.get(k);
  let network = async () => new Response('[{"id":"row-a","name":"Alpha"}]', { status: 200, headers: { 'content-range': '0-0/3', 'content-type': 'application/json' } });
  const session = loadSource('src/services/offlineSession.ts',{}, { localStorage });
  const api = loadSource('src/services/offlineFetch.ts', { 'idb-keyval': { get: k => cacheRead(k), set: async (k,v) => cache.set(k,v) }, './offlineSession': session }, { navigator, fetch: (...args) => network(...args) });
  session.setOfflineIdentity({ actorId: 'actor-a', hospitalId: 'H1' });
  const url = 'https://isolated.invalid/rest/v1/items?select=id,name&hospital_id=eq.H1&order=name.asc';
  const token = `isolated.${Buffer.from(JSON.stringify({ sub: 'actor-a' })).toString('base64url')}.fixture`;
  const options = { headers: { authorization: `Bearer ${token}`, Range: '0-0', Prefer: 'count=exact' } };
  return { ...api, session, navigator, cache, url, options, localStorage, setCacheRead:fn=>{cacheRead=fn;},setNetwork: fn => { network = fn; } };
}
test('exact authorized response retains projection, range, count, single content and cache marker', async () => {
  const f = fixture(); const online = await f.offlineSafeFetch(f.url, f.options); const expected = await online.text();
  f.navigator.onLine = false; const offline = await f.offlineSafeFetch(f.url, f.options);
  assert.equal(await offline.text(), expected); assert.equal(offline.headers.get('content-range'), '0-0/3'); assert.equal(offline.headers.get('x-from-offline-cache'), 'true');
  assert.ok(Number.isFinite(Date.parse(offline.headers.get('x-offline-cached-at'))));assert.ok(Number(offline.headers.get('age'))>=0);
  for (const url of [f.url.replace('id,name', 'id'), f.url.replace('H1', 'H2'), f.url.replace('name.asc', 'name.desc')]) assert.equal((await f.offlineSafeFetch(url, f.options)).status, 503);
  assert.equal((await f.offlineSafeFetch(f.url, { headers: { ...f.options.headers, Range: '1-1' } })).status, 503);
  assert.equal((await f.offlineSafeFetch(f.url, { headers: { ...f.options.headers, Accept: 'application/vnd.pgrst.object+json' } })).status, 503);
  assert.ok([...f.cache.keys()].every(k => !k.includes('isolated-token')), 'credentials never appear in cache keys');
});
test('same actor token refresh preserves exact cached query; token actor mismatch denies cache',async()=>{
 const f=fixture();await f.offlineSafeFetch(f.url,f.options);f.navigator.onLine=false;
 const token=actor=>`refreshed.${Buffer.from(JSON.stringify({sub:actor,iat:Date.now()})).toString('base64url')}.fixture`;
 const refreshed={headers:{...f.options.headers,authorization:`Bearer ${token('actor-a')}`}};
 assert.equal((await f.offlineSafeFetch(f.url,refreshed)).status,200);
 assert.equal((await f.offlineSafeFetch(f.url,{headers:{...f.options.headers,authorization:`Bearer ${token('actor-b')}`}})).status,503);
});
test('logout during cache read never returns old authorized rows', {timeout:3000},async()=>{
 const f=fixture();await f.offlineSafeFetch(f.url,f.options);f.navigator.onLine=false;let finish;let started;
 const readStarted=new Promise(r=>{started=r;});f.setCacheRead(key=>{started();return new Promise(r=>{finish=()=>r(f.cache.get(key));});});
 const pending=f.offlineSafeFetch(f.url,f.options);await readStarted;f.session.clearOfflineIdentity();finish();assert.equal((await pending).status,503);
});
test('cold reload restores only the verified active same actor tenant; expired and cleared scopes are unavailable',()=>{
 const f=fixture();f.session.rememberOfflineIdentity({actorId:'actor-a',hospitalId:'H1'},Date.now()+60000);
 const reload=loadSource('src/services/offlineSession.ts',{}, {localStorage:f.localStorage});reload.restoreOfflineIdentity('actor-b');assert.equal(reload.offlineScope(),null);
 reload.restoreOfflineIdentity('actor-a');assert.equal(reload.offlineScope(),'actor-a:H1');reload.clearOfflineIdentity();
 const cleared=loadSource('src/services/offlineSession.ts',{}, {localStorage:f.localStorage});cleared.restoreOfflineIdentity('actor-a');assert.equal(cleared.offlineScope(),null);
 f.session.rememberOfflineIdentity({actorId:'actor-a',hospitalId:'H1'},Date.now()-1000);
 const expired=loadSource('src/services/offlineSession.ts',{}, {localStorage:f.localStorage});expired.restoreOfflineIdentity('actor-a');assert.equal(expired.offlineScope(),null);
});
test('single-object exact response is replayed as object with its original content type',async()=>{
 const f=fixture();const headers={...f.options.headers,Accept:'application/vnd.pgrst.object+json'};f.setNetwork(async()=>new Response('{"id":"only-row"}',{headers:{'content-type':'application/vnd.pgrst.object+json'}}));
 await f.offlineSafeFetch(f.url,{headers});f.navigator.onLine=false;const response=await f.offlineSafeFetch(f.url,{headers});assert.equal(response.status,200);assert.equal((await response.json()).id,'only-row');assert.equal(response.headers.get('content-type'),'application/vnd.pgrst.object+json');
});
test('pending live tenant verification cannot restore revoked scope when SDK signout fails', {timeout:3000},async()=>{
 const f=fixture();const callbacks=[];let onAuth;let finish;
 const sdkSession={user:{id:'actor-a'},access_token:`isolated.${Buffer.from(JSON.stringify({sub:'actor-a',session_id:'session-a'})).toString('base64url')}.fixture`,expires_at:Math.floor(Date.now()/1000)+60};
 const client={auth:{onAuthStateChange:fn=>{onAuth=fn;},getSession:async()=>({data:{session:sdkSession}})},rpc(name){assert.equal(name,'get_my_offline_identity');return {setHeader(name,value){assert.equal(name,'Authorization');assert.equal(value,`Bearer ${sdkSession.access_token}`);return new Promise(resolve=>{finish=resolve;});}};}};
 loadSource('src/services/supabase.ts',{'@supabase/supabase-js':{createClient:()=>client},'./offlineFetch':{offlineSafeFetch:f.offlineSafeFetch},'./offlineSession':f.session},{__qaEnv:{VITE_SUPABASE_URL:'https://isolated.invalid',VITE_SUPABASE_ANON_KEY:'fixture-anon'},setTimeout:fn=>callbacks.push(fn),fetch:()=>new Promise(resolve=>{finish=resolve;})});
 onAuth('TOKEN_REFRESHED',sdkSession);callbacks[0]();f.session.clearOfflineIdentity();finish({data:[{actor_id:'actor-a',hospital_id:'H1',status:'active'}],error:null});await new Promise(setImmediate);assert.equal(f.session.offlineScope(),null,'live response started before logout cannot renew revoked authorization');
 onAuth('TOKEN_REFRESHED',sdkSession);assert.equal(callbacks.length,1,'failed sign-out old SDK session cannot schedule fresh verification');
});
test('actual bootstrap waits for legacy cache/controller cleanup before rendering application',async()=>{
 let finish;const ready=new Promise(resolve=>{finish=resolve;});let appRenders=0;
 function App(){appRenders++;return {type:'app-root'};}
 loadSource('src/main.tsx',{'react':{default:{StrictMode:'strict'}},'react-dom/client':{default:{createRoot:()=>({render:()=>{}})}},'react/jsx-runtime':{jsx:(type,props)=>type===App?type(props):({type,props}),jsxs:(type,props)=>({type,props})},'./App':{default:App},'./index.css':{},'@/shared/utils/cacheBuster':{purgeStaleApiCaches:()=>ready}},{document:{getElementById:()=>({})}});
 await new Promise(setImmediate);assert.equal(appRenders,0,'authenticated App is not evaluated before cleanup resolves');finish();await new Promise(setImmediate);await new Promise(setImmediate);assert.equal(appRenders,1,'authenticated App starts after cleanup resolves');
});
test('cache-buster waits for a late installing worker and probes its safe-cache handshake before app startup', {timeout:8000}, async()=>{
 const {MessageChannel}=require('node:worker_threads');
 const makeWorker=(initialState,safe)=>{const listeners=new Map();return {state:initialState,addEventListener(type,fn){const group=listeners.get(type)||new Set();group.add(fn);listeners.set(type,group);},removeEventListener(type,fn){listeners.get(type)?.delete(fn);},dispatch(type){for(const fn of listeners.get(type)||[])fn({currentTarget:this});},postMessage(message,ports=[]){if(message.type==='HOME_SAFE_OFFLINE_CACHE_V2')ports[0]?.postMessage({version:safe?'20261013-v2':'old'});if(message.type==='SKIP_WAITING'&&safe){registration.waiting=this;serviceWorker._controller=this;serviceWorker.dispatch('controllerchange');}}};};
 const old=makeWorker('activated',false);const replacement=makeWorker('installing',true);const swListeners=new Map();const serviceWorker={_controller:old,get controller(){return this._controller;},addEventListener(type,fn){const group=swListeners.get(type)||new Set();group.add(fn);swListeners.set(type,group);},removeEventListener(type,fn){swListeners.get(type)?.delete(fn);},dispatch(type){for(const fn of swListeners.get(type)||[])fn();}};
 const registrationListeners=new Map();let updates=0;const registration={installing:null,waiting:null,addEventListener(type,fn){const group=registrationListeners.get(type)||new Set();group.add(fn);registrationListeners.set(type,group);},removeEventListener(type,fn){registrationListeners.get(type)?.delete(fn);},dispatch(type){for(const fn of registrationListeners.get(type)||[])fn();},async update(){updates++;this.dispatch('updatefound');await new Promise(resolve=>setTimeout(resolve,0));this.installing=replacement;this.waiting=replacement;replacement.state='installed';replacement.dispatch('statechange');}};serviceWorker.getRegistration=async()=>registration;
 const diagnostics=[];const storage=new Map();const api=loadSource('src/shared/utils/cacheBuster.ts',{}, {window:{caches:{keys:async()=>[],delete:async()=>true}},navigator:{serviceWorker,onLine:false},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},MessageChannel,console:{log(){},warn(){},info(){},error(...args){diagnostics.push(args.map(value=>value instanceof Error?value.message:String(value)).join(' '));}}});
 try{await api.purgeStaleApiCaches();}catch(error){assert.fail(`${error.message}; diagnostics: ${diagnostics.join(' | ')}`);}assert.equal(updates,1,'unsafe controller waits for the current update cycle');assert.equal(serviceWorker.controller,replacement,'late installing worker becomes the controller');assert.equal(storage.get('home_system_cache_version'),'HOME_CACHE_V20261013');
});
test('cache-buster permits safe offline startup when registration and browser storage are unavailable', {timeout:3000}, async()=>{
 const {MessageChannel}=require('node:worker_threads');const safe={postMessage(message,ports=[]){if(message.type==='HOME_SAFE_OFFLINE_CACHE_V2')ports[0]?.postMessage({version:'20261013-v2'});}};const api=loadSource('src/shared/utils/cacheBuster.ts',{}, {window:{caches:{keys:async()=>[],delete:async()=>true}},navigator:{serviceWorker:{controller:safe,getRegistration:async()=>{throw Error('offline registration unavailable');}},onLine:false},localStorage:{getItem(){throw Error('storage unavailable');},setItem(){throw Error('storage unavailable');}},MessageChannel});
 await api.purgeStaleApiCaches();
});
test('actor, tenant and anonymous scopes cannot share authorized response', async () => {
  const f = fixture(); await f.offlineSafeFetch(f.url, f.options); f.navigator.onLine = false;
  for (const identity of [{ actorId: 'actor-b', hospitalId: 'H1' }, { actorId: 'actor-a', hospitalId: 'H2' }, null]) {
    f.session.setOfflineIdentity(identity); assert.equal((await f.offlineSafeFetch(f.url, f.options)).status, 503);
  }
});
test('cached empty success differs from absent query; server denial never falls back', async () => {
  const f = fixture(); f.setNetwork(async () => new Response('[]')); await f.offlineSafeFetch(f.url, f.options);
  f.navigator.onLine = false; const cached = await f.offlineSafeFetch(f.url, f.options); assert.equal(cached.status, 200); assert.equal(await cached.text(), '[]');
  assert.equal((await f.offlineSafeFetch(`${f.url}&id=eq.absent`, f.options)).status, 503);
  f.navigator.onLine = true; f.setNetwork(async () => new Response('{"error":"denied"}', { status: 403 })); assert.equal((await f.offlineSafeFetch(f.url, f.options)).status, 403);
});
test('HEAD response preserves count and has no synthesized body', async () => {
  const f = fixture(); f.setNetwork(async () => new Response(null, { headers: { 'content-range': '*/27' } }));
  await f.offlineSafeFetch(f.url, { ...f.options, method: 'HEAD' }); f.navigator.onLine = false;
  const response = await f.offlineSafeFetch(f.url, { ...f.options, method: 'HEAD' }); assert.equal(response.headers.get('content-range'), '*/27'); assert.equal(await response.text(), '');
});
test('offline mutations and excluded RPC/auth requests cannot synthesize success', async () => {
  const f = fixture(); f.navigator.onLine = false;
  for (const method of ['POST', 'PATCH', 'DELETE']) await assert.rejects(f.offlineSafeFetch(f.url, { ...f.options, method, body: '{}' }));
  for (const url of ['https://isolated.invalid/auth/v1/user', 'https://isolated.invalid/rest/v1/rpc/action']) await assert.rejects(f.offlineSafeFetch(url, f.options));
});
test('logout while response body is pending cannot repopulate a revoked scope', { timeout: 3000 }, async () => {
  const f = fixture(); let completeBody; let cloneStarted;
  const started = new Promise(r => { cloneStarted = r; });
  f.setNetwork(async () => ({ ok: true, status: 200, headers: new Headers(), clone: () => ({ text: () => { cloneStarted(); return new Promise(r => { completeBody = r; }); } }) }));
  const pending = f.offlineSafeFetch(f.url, f.options); await started; f.session.setOfflineIdentity(null); completeBody('[]'); await pending;
  assert.equal(f.cache.size, 0, 'revoked response must not be persisted after body resolution');
});
