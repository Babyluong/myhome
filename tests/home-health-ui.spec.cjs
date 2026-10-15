const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const report = path.join(root, 'docs/test-reports/2026-10-13-home-fixes-browser.json');
const mock = `
import React from 'react';
const qa = window.__qa ||= { submitted: [], selected: [], calls: [], errors: [], user: { id:'isolated-actor',hospital_id:'33333333-3333-4333-8333-333333333333',department_id:'isolated-department',role:{role_code:'hospital_admin'},department:{department_code:'LOG'} }, listeners: [] };
qa.setUser = user => { qa.user = user; qa.listeners.forEach(fn => fn()); };
export function useAuthStore() { return React.useSyncExternalStore(fn => { qa.listeners.push(fn); return () => { qa.listeners = qa.listeners.filter(x => x !== fn); }; }, () => ({user:qa.user})); }
// Stable snapshot is required by React's external-store contract.
let authSnapshot = {user:qa.user};
qa.setUser = user => { qa.user = user; authSnapshot = {user}; qa.listeners.forEach(fn => fn()); };
const storeState={activeStoreId:'isolated-store',activeStore:{id:'isolated-store',department_id:'isolated-department',location_name:'Isolated store',location_code:'LOC-LOG-01'},availableStores:[],stores:[],isConsolidatedView:false,setActiveStoreId:()=>{},isLoading:false}; export function useInventoryStore() { return storeState; }
const toastState={success:()=>{},error:message=>qa.errors.push(message)}; export const useToastStore = () => toastState;
export const useLanguage = () => ({language:'en',t:key=>key});
export const isPharmacyLogisticsUser = user => !user || user.department?.department_code === 'LOG';
export const getDrugTherapeuticCategory = () => 'Fixture category';
export const getDrugPrescriberCategory = () => 'Fixture';
export const getDrugCombinedCategory = () => 'Fixture';
export const isSupabaseConfigured = () => false;
export const supabase = {from(){ throw Error('Production client forbidden in fixture'); }};
const drugs = [{id:'item-a',drug_name:'Alpha fixture',item_name:'Alpha fixture',drug_code:'FIX-A',item_code:'FIX-A',price:2,status:'active',procurement_vote:'APPL',dosage_form:'Tablet',facility_stock:7,location:'Fixture shelf'}, {id:'item-b',drug_name:'Beta fixture',item_name:'Beta fixture',drug_code:'FIX-B',item_code:'FIX-B',price:3,status:'active',procurement_vote:'CC',dosage_form:'Tablet',facility_stock:9}];
const catalog = (_h,filters={}) => ({data:{data:drugs.filter(d => (!filters.search || d.drug_name.toLowerCase().includes(filters.search.toLowerCase())) && (!filters.procurement_vote || d.procurement_vote.toLowerCase() === filters.procurement_vote.toLowerCase())),total:2,totalPages:1},error:null});
export const getDrugs = async (...args) => catalog(...args);
export const getNonDrugs = async (...args) => catalog(...args);
export const getDrugCategories = async () => ({data:[]});
export const getNonDrugCategories = getDrugCategories;
export const getSuppliers = getDrugCategories;
qa.inventoryCalls=[];qa.exported=[];
export const loadFacilityDrugInventory = async (hospital,store) => {qa.inventoryCalls.push(['drug',hospital,store]);return new URL(location.href).searchParams.get('case')==='store'?[{...drugs[0],location:'Fixture shelf'}]:qa.submitted.length ? drugs : [];};
export const loadFacilityNonDrugInventory = async (hospital,store) => {qa.inventoryCalls.push(['nondrug',hospital,store]);return new URL(location.href).searchParams.get('case')==='store'?[{...drugs[1],id:'nondrug-scoped',item_name:'Scoped non-drug fixture',location:'Fixture shelf'}]:qa.submitted.length ? drugs : [];};
export const loadStoreLocations = async () => [];
export const getStoreLocationsWithOccupancy=async()=>[{id:'physical-fixture',hospital_id:qa.user.hospital_id,store_name:'Fixture shelf',department:'OPD',location_code:'OPD-FIX-01',cabinet_rack:'-',shelf_level:'-',location_type:'both',storage_condition:'ambient',is_active:true,formatted_location:'Fixture shelf',drug_items_count:1,non_drug_items_count:1,total_items_count:2}];
export const resolveFacilityStore=async(hospital,code)=>{qa.resolvedStore=[hospital,code];return {id:'isolated-opd-store',hospital_id:hospital,location_code:'LOC-OPD-01'};};
export const generateStoreLocationPdf=(loc,items)=>qa.exported.push({location:loc.id,items:items.map(item=>item.id)});
export const createStoreLocation=async()=>({});
export const updateStoreLocation=createStoreLocation;
export const deleteStoreLocation=createStoreLocation;
export const generateUniqueLocationCode=()=> 'FIX-01';
export const syncStoreSubLocations=async()=>{};
export const bulkAssignLocationToFacilityDrugItems=async()=>({success:true,count:1});
export const bulkAssignLocationToFacilityNonDrugItems=bulkAssignLocationToFacilityDrugItems;
export const loadFacilityItemHistory=async()=>({transactions:[],purchaseOrders:[],purchaseOrderScope:'hospital'});
export const loadStoreSubLocations = async () => [];
export const formatLocationString = (...args) => args.filter(Boolean).join(' > ');
export const batchAddToFacilityDrugInventory = async (_h,items,...scope) => { qa.submitted.push(...items.map(x=>x.id));qa.lastScope=scope;return qa.failAdd ? {added:0,skipped:0,error:'Isolated addition failure'} : {added:items.length,skipped:0}; };
export const batchAddToFacilityNonDrugInventory = batchAddToFacilityDrugInventory;
export const addToFacilityDrugInventory = async () => ({success:true});
export const addToFacilityNonDrugInventory = addToFacilityDrugInventory;
export const updateFacilityDrugInventoryItem = addToFacilityDrugInventory;
export const updateFacilityNonDrugInventoryItem = addToFacilityDrugInventory;
export const removeFromFacilityDrugInventory = addToFacilityDrugInventory;
export const removeFromFacilityNonDrugInventory = addToFacilityDrugInventory;
export const clearFacilityDrugInventoryByScheme = addToFacilityDrugInventory;
export const clearFacilityNonDrugInventoryByScheme = addToFacilityDrugInventory;
export const generateFormulariPdf = () => {};
export const exportFacilityDrugInventoryToExcel = () => {};
export const exportFacilityNonDrugInventoryToExcel = () => {};
export const createNonDrug = addToFacilityDrugInventory;
export const createOrGetNonDrugCategory = addToFacilityDrugInventory;
export const triggerApplSync = addToFacilityDrugInventory;
export const triggerLpSync = addToFacilityDrugInventory;
export const triggerCcSync = addToFacilityDrugInventory;
export const importCcSyncCsv = addToFacilityDrugInventory;
export const moveDrugToNonDrug = addToFacilityDrugInventory;
export const moveNonDrugToDrug = addToFacilityDrugInventory;
export const updateDrug = addToFacilityDrugInventory;
export const updateNonDrug = addToFacilityDrugInventory;
export const batchUpdateDrugStatus = addToFacilityDrugInventory;
export const batchUpdateNonDrugStatus = addToFacilityDrugInventory;
export const searchFacilityCatalogDrugs = async term => { qa.calls.push(term); if(term==='failure') return {data:null,error:'Isolated catalog failure'}; const delay = term==='Alpha' ? 750 : 20; await new Promise(r=>setTimeout(r,delay)); return {data:drugs.filter(d=>!term || d.drug_name.toLowerCase().includes(term.toLowerCase())).map(d=>({...d,drug_id:d.id,strength:'1 mg',unit_price:2})),error:null}; };
`;
async function main() {
  const sourcePaths=['src/modules/inventory/pages/inventory/FacilityDrugInventoryPage.tsx','src/modules/inventory/pages/inventory/FacilityNonDrugInventoryPage.tsx','src/modules/inventory/components/FacilityDrugMobileCard.tsx','src/modules/inventory/components/FacilityNonDrugMobileCard.tsx','src/modules/inventory/pages/inventory/DrugInventoryPage.tsx','src/modules/inventory/pages/inventory/NonDrugInventoryPage.tsx','src/modules/inventory/pages/inventory/StoreLocationManagementPage.tsx','src/modules/myprepacking/components/PrepackDrugPickerModal.tsx','src/shared/components/ui/Modal.tsx','src/shared/components/ui/SlideOver.tsx'];
  const hashSources=()=>Object.fromEntries(sourcePaths.map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
  const sourceSnapshot=hashSources();
  const { build } = require('esbuild');
  const mockPaths = /(?:services\/|stores\/authStore|stores\/toastStore|lib\/drugCategorizer|context\/InventoryStoreContext|contexts\/LanguageContext|utils\/inventoryRbac)/;
  const resolveFile = filename => [filename,`${filename}.ts`,`${filename}.tsx`,`${filename}.js`,path.join(filename,'index.ts'),path.join(filename,'index.tsx')].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());
  const built = await build({absWorkingDir:root,entryPoints:['tests/fixtures/home-health.ts'],bundle:true,write:false,outdir:'qa-memory',platform:'browser',format:'esm',define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'qa-isolated-dependencies',setup(builder){
    builder.onResolve({filter:/.*/},args=>{
      const id=args.path;
      if(id==='@/components/ui')return {path:'qa-ui',namespace:'qa'};
      if(args.importer.replaceAll('\\','/').includes('/src/')&&mockPaths.test(id))return {path:'qa-mock',namespace:'qa'};
      if(id==='../../src/index.css')return {path:'qa-css',namespace:'qa'};
      if(id.startsWith('@/'))return {path:resolveFile(path.join(root,'src',id.slice(2)))};
      if(id.startsWith('/src/'))return {path:resolveFile(path.join(root,id.slice(1)))};
    });
    builder.onLoad({filter:/.*/,namespace:'qa'},args=>({contents:args.path==='qa-css'?'':args.path==='qa-ui'?['Modal','Spinner','Badge','SlideOver','button','input','select','table'].map(name=>`export * from '/src/shared/components/ui/${name}';`).join('\n'):mock.replace('() => ({user:qa.user})','() => authSnapshot'),loader:'js',resolveDir:root}));
  }}]});
  const css=await require('postcss')([require('tailwindcss')(path.join(root,'tailwind.config.js')),require('autoprefixer')]).process(fs.readFileSync(path.join(root,'src/index.css'),'utf8'),{from:path.join(root,'src/index.css')});
  const bundle=built.outputFiles.find(file=>file.path.endsWith('.js')).text;
  const fixtureHtml='<!doctype html><html><head><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>';
  let browser;
  const browserExecutable = process.env.HOME_QA_BROWSER || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Users/60113/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
  ].find(candidate => fs.existsSync(candidate));
  try { browser = await chromium.launch({headless:true,...(browserExecutable ? {executablePath:browserExecutable} : {})}); }
  catch(error) { throw error; }
  const evidence = {revision:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(), content:'Dirty working tree; actual components, mocked data dependencies',sourceSnapshot,bundleSha256:require('node:crypto').createHash('sha256').update(bundle).digest('hex'),sourceStableDuringBundle:JSON.stringify(sourceSnapshot)===JSON.stringify(hashSources()),productionRequests:[], checks:[]};
  const browserDiagnostics=[];
  let lastPage=null;
  try {
    for (const setting of [{theme:'dark',viewport:{width:1280,height:900},motion:'no-preference'},{theme:'light',viewport:{width:1280,height:900},motion:'no-preference'},{theme:'light',viewport:{width:390,height:844},motion:'reduce'},{theme:'dark',viewport:{width:390,height:844},motion:'reduce'}]) {
      evidence.attemptedSettings ??= []; evidence.attemptedSettings.push(setting);
      const context = await browser.newContext({viewport:setting.viewport,colorScheme:setting.theme,reducedMotion:setting.motion});
      await context.route('**/*',route=>{ const url=new URL(route.request().url()); if(url.origin==='http://qa.local'){if(url.pathname==='/fixture.js')return route.fulfill({status:200,contentType:'text/javascript',body:bundle});if(url.pathname==='/fixture.css')return route.fulfill({status:200,contentType:'text/css',body:css.css});return route.fulfill({status:200,contentType:'text/html',body:fixtureHtml});} evidence.productionRequests.push(url.origin); return route.abort('blockedbyclient'); });
      const page = await context.newPage(); lastPage=page; const errors=[];page.on('pageerror',err=>{errors.push(err.message);browserDiagnostics.push({type:'pageerror',message:err.message,...setting});});page.on('console',message=>{if(message.type()==='error')browserDiagnostics.push({type:'console',message:message.text(),...setting});});
      for (const kind of ['drug','nondrug']) {
        await page.goto(`http://qa.local/qa?case=${kind}`,{waitUntil:'domcontentloaded'});
        await page.evaluate(theme=>document.documentElement.classList.toggle('dark',theme==='dark'),setting.theme);
        const add = page.getByRole('button',{name:'Tambah Item Dari Katalog',exact:true});await add.waitFor({timeout:20000});await add.click();
        const search = page.getByPlaceholder(kind==='drug'?'Cari kod barang, nama ubat atau bahan aktif...':'Cari kod barang, nama bukan ubat...');
        await search.fill('Alpha');const alpha=page.getByRole('checkbox').filter({hasText:'Alpha fixture'});await alpha.waitFor();await alpha.click();
        await search.fill('Beta');await page.locator('select:has(option[value="cc"])').filter({visible:true}).last().selectOption('cc');const beta=page.getByRole('checkbox').filter({hasText:'Beta fixture'});await beta.waitFor();await beta.click();
        const submit=page.getByRole('button',{name:'Tambah 2 Item ke Inventori'});await submit.waitFor();
        const screenshot=setting.viewport.width<640?(setting.theme==='dark'?'2026-10-13-home-fixes-mobile.png':'2026-10-13-home-fixes-mobile-light.png'):(setting.theme==='dark'?'2026-10-13-home-fixes-browser.png':'2026-10-13-home-fixes-browser-light.png');await page.screenshot({path:path.join(root,'docs/test-reports',screenshot),fullPage:true});
        await submit.click();await page.waitForFunction(()=>window.__qa.submitted.length===2);assert.deepEqual(await page.evaluate(()=>window.__qa.submitted),['item-a','item-b']);
        evidence.checks.push({criterion:`F1 ${kind} cross-search and cross-scheme selection`,status:'PASS',...setting,screenshot});
        if(setting.viewport.width<640){
          const edit=page.getByRole('button',{name:'Kemas kini stok dan lokasi Alpha fixture'});await page.keyboard.press('Tab');await edit.focus();const focus=await edit.evaluate(element=>({outline:getComputedStyle(element).outlineStyle,width:getComputedStyle(element).outlineWidth}));assert.notEqual(focus.outline,'none');
          await page.keyboard.press('Enter');await page.getByRole('button',{name:'Simpan Perubahan'}).waitFor();evidence.checks.push({criterion:`F2 ${kind} mobile native edit Enter visible focus`,status:'PASS',...setting});
          const assess=(criterion,result)=>evidence.checks.push({criterion,status:result?'PASS':'FAIL',...setting});
          const dialog=page.getByRole('dialog',{name:'Kemas kini stok dan lokasi Alpha fixture',exact:true});await dialog.waitFor();assess(`F2 ${kind} drawer receives keyboard focus`,await dialog.evaluate(element=>element.contains(document.activeElement)));
          await page.getByRole('button',{name:'Simpan Perubahan'}).focus();await page.keyboard.press('Tab');assess(`F2 ${kind} forward Tab trapped in drawer`,await dialog.evaluate(element=>element.contains(document.activeElement)));await page.keyboard.press('Shift+Tab');assess(`F2 ${kind} reverse Tab trapped in drawer`,await dialog.evaluate(element=>element.contains(document.activeElement)));
          await page.getByRole('button',{name:'Batal',exact:true}).click();assess(`F2 ${kind} close returns focus to edit button`,await edit.evaluate(element=>element===document.activeElement));
          await edit.focus();await page.keyboard.press('Space');await page.getByRole('button',{name:'Simpan Perubahan'}).waitFor();evidence.checks.push({criterion:`F2 ${kind} mobile native edit Space`,status:'PASS',...setting});await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assess(`F2 ${kind} Escape closes and returns focus`,await edit.evaluate(element=>element===document.activeElement));
        }
      }
      await page.goto('http://qa.local/qa?case=picker');const search=page.getByRole('textbox',{name:'Search medication catalog'});await search.waitFor();await page.waitForFunction(()=>window.__qa.calls.length===1);
      await search.fill('Alpha');await page.waitForFunction(()=>window.__qa.calls.includes('Alpha'));await search.fill('Beta');await page.getByRole('button',{name:'Select Beta fixture'}).waitFor();await page.waitForTimeout(850);assert.equal(await page.getByRole('button',{name:'Select Alpha fixture'}).count(),0);assert.equal(await page.getByRole('button',{name:'Select Beta fixture'}).count(),1);
      evidence.checks.push({criterion:'F3 reversed completion retains current result; one initial request',status:'PASS',...setting});
      await search.fill('failure');await page.getByRole('alert').waitFor();assert.equal(await page.getByRole('button',{name:'Try again'}).count(),1);evidence.checks.push({criterion:'F3 catalog failure visible retry',status:'PASS',...setting});
      for(const kind of ['master-drug','master-nondrug']){await page.goto(`http://qa.local/qa?case=${kind}`);await page.waitForFunction(()=>!!window.__qa?.setUser);await page.evaluate(()=>window.__qa.setUser({...window.__qa.user,department:{department_code:'OPD'}}));await page.waitForTimeout(100);await page.evaluate(()=>window.__qa.setUser({...window.__qa.user,department:{department_code:'LOG'}}));await page.waitForTimeout(100);evidence.checks.push({criterion:`F4 ${kind} mounted role transition no hook-order error`,status:'PASS',...setting});}
      await page.goto('http://qa.local/qa?case=store');await page.getByRole('button',{name:'Semua Jabatan (1)',exact:true}).click();await page.getByText('Fixture shelf',{exact:true}).filter({visible:true}).first().click();await page.getByRole('button',{name:'Cetak / Eksport PDF',exact:true}).waitFor();await page.getByRole('button',{name:'Cetak / Eksport PDF',exact:true}).click();await page.waitForFunction(()=>window.__qa.exported.length===1);
      const scoped=await page.evaluate(()=>({calls:window.__qa.inventoryCalls,exported:window.__qa.exported,resolved:window.__qa.resolvedStore}));assert.ok(scoped.calls.length>=4);assert.ok(scoped.calls.every(call=>call[1]==='33333333-3333-4333-8333-333333333333'&&call[2]==='isolated-opd-store'));assert.deepEqual(scoped.exported[0].items,['item-a','nondrug-scoped']);assert.equal(scoped.resolved[1],'OPD');evidence.checks.push({criterion:'B8 actual location detail and export load both hospital/OPD-scoped inventories',status:'PASS',...setting});
      assert.deepEqual(errors,[]);await context.close();
    }
    assert.equal(evidence.productionRequests.length,0);
    assert.equal(evidence.checks.filter(check=>check.status==='FAIL').length,0,'browser acceptance has failing criteria');
  } catch(error) { evidence.failure=error.stack; evidence.browserDiagnostics=browserDiagnostics; if(lastPage)try{evidence.failureBody=(await lastPage.locator('body').innerText()).slice(0,2000);}catch{} evidence.checks.push({status:'FAIL',criterion:'browser execution',error:error.message});throw error; }
  finally {evidence.sourceStableAfterRun=JSON.stringify(sourceSnapshot)===JSON.stringify(hashSources());fs.writeFileSync(report,JSON.stringify(evidence,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});


