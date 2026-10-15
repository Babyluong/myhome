const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
async function runScript(file,args=[],configuration={}){
 const writes=[];const modules=[];const logs=[];const memory=new Map();let clientCalls=0;
 const processStub={argv:['node',file,...args],env:configuration.noCredentials?{}:{VITE_SUPABASE_URL:'https://isolated.invalid',SUPABASE_SERVICE_ROLE_KEY:'isolated-fixture-key'},exitCode:0,exit(code){this.exitCode=code;throw Object.assign(new Error('fixture process exit'),{fixtureExit:true});}};
 const fakeFs={existsSync:()=>true,readFileSync:filename=>filename.endsWith('package.json')?' {"version":"2.8.1"}':memory.get(filename)||'[]',writeFileSync:(filename,body)=>memory.set(filename,body),copyFileSync:(from,to)=>memory.set(to,memory.get(from)),unlinkSync:filename=>memory.delete(filename),mkdirSync:()=>{}};
 const client={from(table){let action='select';let values;const filters={};const q={select(){return this;},update(row){action='update';values=row;return this;},insert(row){action='insert';values=row;return this;},delete(){action='delete';return this;},eq(k,v){filters[k]=v;return this;},ilike(k,v){filters[k]=v;return this;},then(resolve){if(action!=='select')writes.push({table,action,values,filters});return Promise.resolve({data:action==='select'?configuration.rows||[]:null,error:configuration.failure?new Error('Isolated publication failure'):null}).then(resolve);}};return q;}};
 const context=vm.createContext({require(id){modules.push(id);if(id==='fs')return fakeFs;if(id==='path')return path;if(id==='child_process')return {execSync:()=>''};if(id==='dotenv')return {config:()=>{}};if(id==='@supabase/supabase-js')return {createClient(){clientCalls++;return client;}};throw new Error(`Unexpected release import: ${id}`);},__dirname:path.join(root,'scripts'),process:processStub,console:{log:(...args)=>logs.push(args.join(' ')),error:(...args)=>logs.push(args.join(' ')),warn:()=>{}},Error,Date,Promise,Map,Set});
 try {new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file}).runInContext(context);}catch(error){if(!error.fixtureExit)throw error;}
 await new Promise(setImmediate);return {writes,modules,logs,clientCalls,memory,exitCode:processStub.exitCode};
}
test('default local release generation loads no credentials/client and makes zero publication writes',async()=>{
 const run=await runScript('scripts/generate_system_releases.cjs');assert.equal(run.clientCalls,0);assert.equal(run.writes.length,0);assert.ok(!run.modules.includes('dotenv'));assert.equal(run.exitCode,0);assert.ok(run.memory.size>0,'actual local artifacts are generated only into fixture filesystem');
 const scripts=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).scripts;for(const lifecycle of ['dev','predev','build','prebuild','postbuild'])assert.ok(!/release|generate_system|sync-english|publish/.test(scripts[lifecycle]||''),`${lifecycle} must not publish`);
});
test('explicit previews show intended insert/update plan with zero writes',async()=>{
 for(const file of ['scripts/generate_system_releases.cjs','scripts/sync-english-releases.cjs']){const run=await runScript(file,['--preview'],{rows:[{id:'managed-v260',version_tag:'v2.6.0',metadata:{managed_by:'home_release_engine'},created_by:null}]});assert.equal(run.exitCode,0);assert.equal(run.writes.length,0);const line=run.logs.find(log=>log.startsWith('{')&&log.includes('"preview":true'));assert.ok(line);const preview=JSON.parse(line);assert.equal(preview.writes,0);assert.ok(preview.plan.some(entry=>entry.action==='update'&&entry.id==='managed-v260'));assert.ok(preview.plan.some(entry=>entry.action==='insert'));}
});
test('explicit stub publishing targets only managed IDs and never broadly deletes announcements',async()=>{
 for(const file of ['scripts/generate_system_releases.cjs','scripts/sync-english-releases.cjs']){const run=await runScript(file,['--publish'],{rows:[{id:'managed-v260',version_tag:'v2.6.0',metadata:{managed_by:'home_release_engine'},created_by:null},{id:'clinical-announcement',version_tag:null,title:'Lawas isolated user announcement',created_by:'fixture-user'}]});assert.equal(run.exitCode,0);assert.ok(run.writes.length>0);assert.ok(run.writes.every(write=>write.action==='insert'||write.action==='update'&&write.filters.id==='managed-v260'));assert.ok(run.writes.every(write=>write.values.metadata.managed_by==='home_release_engine'));}
});
test('unmanaged release conflicts and remote errors cause nonzero failure before any mutation',async()=>{
 for(const file of ['scripts/generate_system_releases.cjs','scripts/sync-english-releases.cjs'])for(const configuration of [{failure:true},{rows:[{id:'unmanaged',version_tag:'v2.6.0',created_by:'fixture-user',metadata:{}}]}]){const run=await runScript(file,['--publish'],configuration);assert.equal(run.exitCode,1);assert.equal(run.writes.length,0);}
});
