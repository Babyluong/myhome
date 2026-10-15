const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const { webcrypto } = require('node:crypto')
const { loadSource } = require('./home-health-regressions.test.cjs')

const root = path.resolve(__dirname, '..')
const sourcePath = path.join(root, 'src/modules/myformulari/data/officialFukkmData.json')
const assetPath = path.join(root, 'public/formulari/formulari-data.json')
const sourceBytes = fs.readFileSync(sourcePath)
const sourceRecords = JSON.parse(sourceBytes.toString('utf8'))
const asset = JSON.parse(fs.readFileSync(assetPath, 'utf8'))
const sourceHash = crypto.createHash('sha256').update(sourceBytes).digest('hex')

function loadAssetService(fetch, baseUrl = '/') {
  return loadSource('src/modules/myformulari/services/formulariAssetService.ts', {}, {
    __qaEnv: { BASE_URL: baseUrl }, fetch,
  })
}

function assetResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } })
}

function loadText(source, filename, dependencies = {}, globals = {}) {
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  const context = vm.createContext({ module, exports: module.exports, require(id) {
    if (!Object.hasOwn(dependencies, id)) throw new Error(`Unmocked import denied: ${id}`)
    return dependencies[id]
  }, Error, TextEncoder, TextDecoder, crypto: webcrypto, console: { log() {}, error() {}, warn() {} }, ...globals })
  new vm.Script(output, { filename }).runInContext(context)
  return module.exports
}

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

test('generated asset exactly preserves source bytes hash, order, count, and every record field', () => {
  assert.equal(sourceHash, asset.sourceHash, 'asset source hash matches official source bytes')
  assert.equal(asset.records.length, sourceRecords.length, 'asset record count matches source')
  assert.deepEqual(asset.records, sourceRecords, 'asset records preserve source order and all fields')
})

test('asset loader requests the exact versioned URL and returns the verified records', async () => {
  let requested
  const service = loadAssetService(async (url, options) => {
    requested = { url, options }
    return assetResponse(asset)
  }, '/home/')
  const records = await service.loadOfficialFormulariRecords()
  assert.equal(requested.url, `/home/formulari/formulari-data.json?v=${sourceHash}`)
  assert.equal(requested.options.cache, 'no-cache')
  assert.equal(requested.options.headers.Accept, 'application/json')
  assert.deepEqual(records, sourceRecords)
})

test('asset loader classifies HTTP, network, malformed, and mismatched-version failures', async () => {
  const cases = [
    { name: 'not found', fetch: async () => assetResponse({}, 404), code: 'unavailable', retryable: false },
    { name: 'server failure', fetch: async () => assetResponse({}, 503), code: 'unavailable', retryable: true },
    { name: 'network failure', fetch: async () => { throw new Error('offline') }, code: 'unavailable', retryable: true },
    { name: 'invalid payload', fetch: async () => assetResponse({ sourceHash, records: [{}] }), code: 'invalid_asset', retryable: false },
    { name: 'version mismatch', fetch: async () => assetResponse({ ...asset, sourceHash: '0'.repeat(64) }), code: 'version_mismatch', retryable: false },
  ]
  for (const item of cases) {
    const service = loadAssetService(item.fetch)
    await assert.rejects(service.loadOfficialFormulariRecords(), error => {
      assert.equal(error.name, 'FormulariAssetError', item.name)
      assert.equal(error.code, item.code, item.name)
      assert.equal(error.retryable, item.retryable, item.name)
      return true
    }, item.name)
  }
})

test('generator is deterministic and leaves unchanged output untouched in an isolated fixture', t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'home-formulari-generator-'))
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }))
  const sourceDir = path.join(temp, 'src/modules/myformulari/data')
  const serviceDir = path.join(temp, 'src/modules/myformulari/services')
  fs.mkdirSync(sourceDir, { recursive: true })
  fs.mkdirSync(serviceDir, { recursive: true })
  fs.mkdirSync(path.join(temp, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(root, 'scripts/generate-formulari-assets.cjs'), path.join(temp, 'scripts/generate-formulari-assets.cjs'))
  const fixture = [{ id: 'fixture-a', nested: { preserved: true } }, { id: 'fixture-b', tags: ['one', 'two'] }]
  const fixtureBytes = Buffer.from(`${JSON.stringify(fixture)}\n`)
  fs.writeFileSync(path.join(sourceDir, 'officialFukkmData.json'), fixtureBytes)
  fs.writeFileSync(path.join(serviceDir, 'formulariAssetService.ts'), "export const FORMULARI_ASSET_VERSION = '" + 'a'.repeat(64) + "'\n")

  const run = () => spawnSync(process.execPath, [path.join(temp, 'scripts/generate-formulari-assets.cjs')], { encoding: 'utf8' })
  const first = run()
  assert.equal(first.status, 0, 'first isolated generation succeeds')
  const outputPath = path.join(temp, 'public/formulari/formulari-data.json')
  const firstBytes = fs.readFileSync(outputPath)
  const firstStat = fs.statSync(outputPath)
  const second = run()
  assert.equal(second.status, 0, 'repeat isolated generation succeeds')
  assert.deepEqual(fs.readFileSync(outputPath), firstBytes, 'repeat output is byte-for-byte stable')
  assert.equal(fs.statSync(outputPath).mtimeMs, firstStat.mtimeMs, 'unchanged output is not rewritten')
  assert.equal(fs.readFileSync(path.join(serviceDir, 'formulariAssetService.ts'), 'utf8').includes(crypto.createHash('sha256').update(fixtureBytes).digest('hex')), true)
  assert.deepEqual(JSON.parse(firstBytes.toString('utf8')).records, fixture)
})

test('async formulary APIs coalesce the first fetch, retry after failure, and preserve consumer results', async () => {
  const lasa = loadSource('src/modules/myformulari/data/lasaDatabase.ts')
  const dilution = loadSource('src/modules/myformulari/data/kkmDilutionMasterDatabase.ts')
  const database = loadSource('src/modules/myformulari/data/formulariDatabase.ts', {
    './lasaDatabase': lasa,
    './kkmDilutionMasterDatabase': dilution,
  })
  let calls = 0
  let release
  let shouldFail = true
  const gated = new Promise(resolve => { release = resolve })
  const assetService = loadAssetService(async () => {
    calls++
    if (shouldFail) {
      shouldFail = false
      throw new Error('offline')
    }
    await gated
    return assetResponse(asset)
  })
  const service = loadSource('src/modules/myformulari/services/formulariService.ts', {
    '../data/formulariDatabase': database,
    '../data/lasaDatabase': lasa,
    './formulariAssetService': assetService,
  })
  await assert.rejects(service.getAllFormulariDrugs(), error => error.code === 'unavailable')
  assert.equal(calls, 1, 'failed initial request attempts one fetch')

  const pendingA = service.getAllFormulariDrugs()
  const pendingB = service.searchDrugs('')
  const pendingC = service.getFormulariSummaryStats()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(calls, 2, 'concurrent consumers share one retry fetch')
  release()
  const [all, searched, summary] = await Promise.all([pendingA, pendingB, pendingC])
  assert.equal(all.length, searched.length, 'empty search returns the same catalog size')
  assert.deepEqual(searched.map(record => record.id), all.map(record => record.id), 'search preserves catalog ordering')
  const expectedSummary = {
    totalDrugs: all.length,
    hamCount: all.filter(record => record.isHAM).length,
    lasaCount: all.filter(record => record.isLASA).length,
    lowStockCount: all.filter(record => record.quota.isLowStock || record.quota.isCriticalShortage).length,
    antimicrobialCount: all.filter(record => record.antimicrobial?.isAntimicrobial).length,
    ivDilutionCount: all.filter(record => record.dilution?.isApplicable).length,
  }
  assert.equal(JSON.stringify(summary), JSON.stringify(expectedSummary), 'summary aggregates match the returned catalog')
  assert.equal(await service.getDrugById(all[0].id), all[0], 'detail lookup returns the matching catalog record')
  assert.equal(calls, 2, 'loaded consumers reuse the successful catalog')

  const oldDatabaseSource = spawnSync('git', ['show', 'HEAD:src/modules/myformulari/data/formulariDatabase.ts'], { cwd: root, encoding: 'utf8' })
  const oldServiceSource = spawnSync('git', ['show', 'HEAD:src/modules/myformulari/services/formulariService.ts'], { cwd: root, encoding: 'utf8' })
  assert.equal(oldDatabaseSource.status, 0, 'baseline database source is available')
  assert.equal(oldServiceSource.status, 0, 'baseline consumer source is available')
  const oldDatabase = loadText(oldDatabaseSource.stdout, 'baseline-formulariDatabase.ts', {
    './officialFukkmData.json': { __esModule: true, default: sourceRecords },
    './lasaDatabase': lasa,
    './kkmDilutionMasterDatabase': dilution,
  })
  const oldService = loadText(oldServiceSource.stdout, 'baseline-formulariService.ts', {
    '../data/formulariDatabase': oldDatabase,
    '../data/lasaDatabase': lasa,
  }, { localStorage: { getItem: () => null, setItem() {} } })
  const oldAll = oldService.getAllFormulariDrugs()
  assert.equal(digest(all), digest(oldAll), 'complete consumer catalog matches the pre-migration implementation')
  const query = oldAll[0].genericName
  const currentSearch = await service.searchDrugs(query)
  assert.equal(digest(currentSearch), digest(oldService.searchDrugs(query)), 'representative search results match baseline')
  assert.equal(digest(await service.getFormulariSummaryStats()), digest(oldService.getFormulariSummaryStats()), 'summary matches baseline')
  const detailId = oldAll[0].id
  assert.equal(digest(await service.getDrugById(detailId)), digest(oldService.getDrugById(detailId)), 'detail lookup matches baseline')
  const tokens = name => name.toLowerCase().replace(/\(.*?\)/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(mg|mcg|g|ml|iu|%|vial|ampoule|tablet|capsule)\b/g, ' ')
    .replace(/[^\w\s-]/g, ' ').split(/\s+/)
    .map(token => token.trim()).filter(token => token.length >= 4)
  let interactionPair
  for (const drug of oldAll) {
    for (const interaction of drug.interactions || []) {
      const general = interaction.interactingDrug.includes('FUKKM') || interaction.interactingDrug.includes('CYP450')
      const target = (general ? interaction.effect : `${interaction.interactingDrug} ${interaction.effect}`).toLowerCase()
      const other = oldAll.find(candidate => candidate.id !== drug.id && (
        interaction.interactingDrug.toLowerCase().includes(candidate.genericName.toLowerCase())
        || candidate.genericName.toLowerCase().includes(interaction.interactingDrug.toLowerCase())
        || tokens(candidate.genericName).some(token => target.includes(token))
        || candidate.brandNames.some(brand => tokens(brand).some(token => target.includes(token)))
      ))
      if (other) { interactionPair = [drug.id, other.id]; break }
    }
    if (interactionPair) break
  }
  assert.ok(interactionPair, 'source-backed interaction pair is available')
  assert.equal(digest(await service.checkDrugInteractions(interactionPair)), digest(oldService.checkDrugInteractions(interactionPair)), 'representative interaction result matches baseline')
})

test('Slice B consumers render loading, recoverable asset failure/retry, and successful states in a browser', async t => {
  const { build } = require('esbuild')
  const { chromium } = require('playwright')
  const consumerFiles = [
    'src/modules/myformulari/pages/DrugAlternativesPage.tsx',
    'src/modules/myformulari/pages/DrugDetailPage.tsx',
    'src/modules/myformulari/pages/FormulariDashboardPage.tsx',
    'src/modules/myformulari/pages/HamListPage.tsx',
    'src/modules/myformulari/pages/HospitalLawasFormulariPage.tsx',
    'src/modules/myformulari/pages/LasaListPage.tsx',
    'src/modules/myformulari/pages/PaediatricCataloguePage.tsx',
    'src/modules/myformulari/components/AddQuotaDrugModal.tsx',
    'src/modules/myformulari/components/DrugInteractionModal.tsx',
    'src/modules/hub/pages/modules/FormulariSubMenu.tsx',
  ]
  const sourceHashes = () => Object.fromEntries(consumerFiles.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]))
  const beforeHashes = sourceHashes()
  const abs = file => path.join(root, file).replaceAll('\\', '/')
  const imports = consumerFiles.map(file => `import { ${({
    'DrugAlternativesPage.tsx': 'DrugAlternativesPage', 'DrugDetailPage.tsx': 'DrugDetailPage', 'FormulariDashboardPage.tsx': 'FormulariDashboardPage',
    'HamListPage.tsx': 'HamListPage', 'HospitalLawasFormulariPage.tsx': 'HospitalLawasFormulariPage', 'LasaListPage.tsx': 'LasaListPage',
    'PaediatricCataloguePage.tsx': 'PaediatricCataloguePage', 'AddQuotaDrugModal.tsx': 'AddQuotaDrugModal', 'DrugInteractionModal.tsx': 'DrugInteractionModal',
    'FormulariSubMenu.tsx': 'FormulariSubMenu',
  })[path.basename(file)]} } from '${abs(file)}'`).join('\n')
  const entry = `${imports}
import React from 'react'; import {createRoot} from 'react-dom/client'; import {MemoryRouter,Routes,Route} from 'react-router-dom';
const drug={id:'qa-drug-1',genericName:'Quality Fixture Medicine',brandNames:['Fixture Brand'],mohDrugCode:'QA-001',atcCode:'A00AA00',atcCategory:'Fixture category',therapeuticClass:'Fixture class',prescriberCategory:'A',poisonCategory:'Group C',skimPerolehan:'APPL',dosageForms:['Tablet'],strengths:['1 mg'],indications:['Fixture indication'],contraindications:[],standardDosage:{adult:'Fixture dose',pediatric:'Fixture dose',elderlyOrRenal:'Fixture dose'},administrationRoutes:['Oral'],sideEffects:[],cautionsAndWarnings:[],isHAM:true,hamCategory:'Fixture category',hamRiskLevel:'HIGH',hamPrecautions:[],isLASA:true,lasaPairs:[],interactions:[],reconstitution:{isApplicable:false},dilution:{isApplicable:false},shelfLife:{},quota:{monthlyLimit:10,currentStock:5,isLowStock:false,isCriticalShortage:false},antimicrobial:{isAntimicrobial:false},alternatives:[],alternativeDrugs:[{drugId:'qa-drug-2',drugName:'Fixture Interaction Partner',reasonForChoice:'Isolated browser fixture',prescriberCategory:'A'}]};
const componentMap={alternatives:DrugAlternativesPage,detail:DrugDetailPage,dashboard:FormulariDashboardPage,ham:HamListPage,lawas:HospitalLawasFormulariPage,lasa:LasaListPage,paediatric:PaediatricCataloguePage,quota:AddQuotaDrugModal,interaction:DrugInteractionModal,hub:FormulariSubMenu};
function Chosen(){const kind=window.__qa.kind;const Component=componentMap[kind];if(kind==='quota')return <Component isOpen onClose={()=>{}} onSuccess={()=>{}}/>;if(kind==='interaction')return <Component isOpen allDrugs={window.__qa.drugs} initialDrug={drug}/>;return <Component/>}
function App(){return <MemoryRouter initialEntries={[window.__qa.kind==='detail'?'/drug/qa-drug-1':'/']}><Routes><Route path='/drug/:id' element={<DrugDetailPage/>}/><Route path='*' element={<Chosen/>}/></Routes></MemoryRouter>};
createRoot(document.getElementById('root')).render(<App/>);
`
  const parsedNames = new Set()
  for (const file of consumerFiles) {
    const text = fs.readFileSync(path.join(root, file), 'utf8')
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    for (const node of source.statements) if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const element of node.importClause.namedBindings.elements) parsedNames.add(element.propertyName?.text || element.name.text)
    }
  }
  const specialStub = new Set(['useAuthStore','useLanguage','useToastStore','getAllStockDisruptions','calculateDisruptionStats','groupLawasDrugs','getDrugPrescriberCategory','classifyLawasDrug','findBestFukkmMatch','synthesizeDrugEntryFromFacility','loadFacilityDrugInventory','loadPaediatricCatalogue','exportFacilityDrugInventoryToExcel','generatePaediatricCataloguePdf','updatePaediatricCatalogueItem','addDrugQuota'])
  const stubExports = [...parsedNames].filter(name => /^[A-Za-z_$][\w$]*$/.test(name)).map(name => {
    if (name === 'ROUTES') return `export const ROUTES={};`
    if (name === 'useAuthStore') return `export const useAuthStore=()=>({user:{id:'qa-user',hospital_id:'qa-hospital',full_name:'QA fixture',role:'pharmacist'}});`
    if (name === 'useLanguage') return `export const useLanguage=()=>({language:'en',t:(key)=>key});`
    if (name === 'useToastStore') return `const qaToastSuccess=(...args)=>'qa-toast-id'; const qaToastError=(message)=>{window.__qa.toastErrors.push(String(message));return 'qa-toast-id'}; export const useToastStore=()=>({success:qaToastSuccess,error:qaToastError});`
    if (name === 'getAllStockDisruptions') return `export const getAllStockDisruptions=()=>[];`
    if (name === 'calculateDisruptionStats') return `export const calculateDisruptionStats=()=>({totalActiveDisruptions:0,criticalDisruptions:0,highDisruptions:0,mediumDisruptions:0,lowDisruptions:0});`
    if (name === 'groupLawasDrugs') return `export const groupLawasDrugs=()=>[];`
    if (name === 'LAWAS_FORMULARY_GROUPS') return `export const LAWAS_FORMULARY_GROUPS={other:{id:'other',nameEn:'Other',nameMs:'Lain-lain',descriptionEn:'Fixture group',descriptionMs:'Kumpulan ujian',iconName:'Package',badgeColor:'',bgLight:'',borderColor:'',textColor:'',priority:1}};`
    if (name === 'KKM_LASA_MASTER_REGISTRY') return `export const KKM_LASA_MASTER_REGISTRY=[];`
    if (name === 'getLasaCategories') return `export const getLasaCategories=()=>['Fixture category'];`
    if (name === 'getDrugPrescriberCategory') return `export const getDrugPrescriberCategory=()=> 'A';`
    if (name === 'classifyLawasDrug') return `export const classifyLawasDrug=()=> 'other';`
    if (name === 'findBestFukkmMatch') return `export const findBestFukkmMatch=(_facility,records)=>records[0];`
    if (name === 'synthesizeDrugEntryFromFacility') return `export const synthesizeDrugEntryFromFacility=()=>window.__qa.drug;`
    if (name === 'loadFacilityDrugInventory') return `export const loadFacilityDrugInventory=async(hospital)=>{window.__qa.inventoryCalls.push(hospital);if(window.__qa.failInventory)return Promise.reject(Error('fixture inventory unavailable'));return [window.__qa.facilityDrug]};`
    if (name === 'loadPaediatricCatalogue') return `export const loadPaediatricCatalogue=async()=>({catalog:{id:'qa-catalog',name:'QA fixture catalogue'},items:[window.__qa.paedItem]});`
    if (name === 'exportFacilityDrugInventoryToExcel') return `export const exportFacilityDrugInventoryToExcel=()=>{};`
    if (name === 'generatePaediatricCataloguePdf') return `export const generatePaediatricCataloguePdf=async()=>{};`
    if (name === 'updatePaediatricCatalogueItem' || name === 'addDrugQuota') return `export const ${name}=async()=>({});`
    if (name.startsWith('use')) return `export const ${name}=()=>({});`
    if (specialStub.has(name)) return `export const ${name}=(...args)=>undefined;`
    return `export const ${name}=(...args)=>null;`
  }).join('\n')
  const serviceModule = `class FormulariAssetError extends Error { constructor(message,code='unavailable',retryable=true){super(message);this.name='FormulariAssetError';this.code=code;this.retryable=retryable} }\nconst fixture=window.__qa.drugs; async function request(value){const q=window.__qa;q.requestCalls=(q.requestCalls||0)+1;console.info('__QA_FORMULARI_REQUEST__'+JSON.stringify({requestCalls:q.requestCalls,retryArmed:q.retryArmed}));if(q.mode==='pending')return new Promise((resolve,reject)=>q.pending.push({resolve:()=>resolve(value),reject}));if(q.mode==='retry'&&!q.retryArmed)throw new FormulariAssetError('Fixture formulary unavailable','unavailable',true);return value}\nexport {FormulariAssetError}; export const FORMULARI_ASSET_VERSION='qa-fixture-version'; export const getAllFormulariDrugs=()=>request(fixture); export const getDrugById=async(id)=>(await request(fixture)).find(d=>d.id===id); export const searchDrugs=async()=>request(fixture); export const getFormulariSummaryStats=()=>request({totalDrugs:fixture.length,hamCount:1,lasaCount:1,lowStockCount:0,antimicrobialCount:0,ivDilutionCount:0}); export const checkDrugInteractions=()=>request([]); export const getLasaMasterRegistry=()=>[]; export const KKM_LASA_MASTER_REGISTRY=[]; export const getLasaCategories=()=>[];`
  const fixtureModules = new Set(consumerFiles.map(file => path.resolve(root, file).toLowerCase()))
  const resolveFile = filename => [filename, `${filename}.ts`, `${filename}.tsx`, `${filename}.js`, path.join(filename, 'index.ts'), path.join(filename, 'index.tsx')].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
  const bundled = await build({
    absWorkingDir: root,
    stdin: { contents: entry, resolveDir: root, sourcefile: 'qa-formulari-slice-b.tsx', loader: 'tsx' },
    bundle: true, write: false, platform: 'browser', format: 'esm', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'qa-formulari-consumer-stubs', setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => {
        const id = args.path.replaceAll('\\', '/')
        if (id === 'react' || id.startsWith('react/') || id === 'react-dom' || id.startsWith('react-dom/') || id === 'react-router-dom' || id === 'lucide-react' || id === 'framer-motion') return
        if (id.endsWith('/services/formulariService') || id.endsWith('/services/formulariAssetService')) return { path: 'qa-formulari-service', namespace: 'qa' }
        if (id.endsWith('.css')) return { path: 'qa-empty', namespace: 'qa' }
        const pathCandidate = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : path.resolve(args.resolveDir, id)
        const resolved = resolveFile(pathCandidate)
        if (resolved && fixtureModules.has(path.resolve(resolved).toLowerCase())) return { path: resolved }
        if (resolved && path.resolve(resolved).toLowerCase().startsWith(path.join(root, 'src').toLowerCase())) return { path: 'qa-formulari-stub', namespace: 'qa' }
      })
      builder.onLoad({ filter: /.*/, namespace: 'qa' }, args => ({ contents: args.path === 'qa-formulari-service' ? serviceModule : args.path === 'qa-empty' ? '' : `${stubExports}\nexport default function QAChild(){return null}`, loader: 'js', resolveDir: root }))
    } }],
  })
  const bundleFile = bundled.outputFiles.find(file => file.path.endsWith('.js')) || bundled.outputFiles[0]
  assert.ok(bundleFile, 'esbuild produced the isolated consumer fixture bundle')
  const bundle = bundleFile.text
  let browser
  const browserExecutable = process.env.HOME_QA_BROWSER || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ].find(candidate => fs.existsSync(candidate))
  try { browser = await chromium.launch({ headless: true, ...(browserExecutable ? { executablePath: browserExecutable } : {}) }) }
  catch (error) { t.skip(`Chromium launch unavailable: ${error.message}`); return }
  const evidence = { revision: spawnSync('git', ['rev-parse','HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim(), contentRevision: 'dirty working tree; exact ten consumer source SHA-256 values recorded', sourceHashes: beforeHashes, browserVersion: browser.version(), viewport: { width: 1280, height: 900 }, theme: 'light', motion: 'no-preference', externalRequests: [], checks: [], lifecycle: [], bundleSha256: crypto.createHash('sha256').update(bundle).digest('hex') }
  const fixtureDrug = { id:'qa-drug-1', genericName:'Quality Fixture Medicine', brandNames:['Fixture Brand'], mohDrugCode:'QA-001', atcCode:'A00AA00', atcCategory:'Fixture category', therapeuticClass:'Fixture class', prescriberCategory:'A', poisonCategory:'Group C', skimPerolehan:'APPL', dosageForms:['Tablet'], strengths:['1 mg'], indications:['Fixture indication'], contraindications:[], standardDosage:{adult:'Fixture dose',pediatric:'Fixture dose',elderlyOrRenal:'Fixture dose'}, administrationRoutes:['Oral'], sideEffects:[], cautionsAndWarnings:[], isHAM:true, hamCategory:'Fixture category', hamRiskLevel:'HIGH', hamPrecautions:[], isLASA:true, lasaPairs:[], interactions:[], reconstitution:{isApplicable:false}, dilution:{isApplicable:false}, shelfLife:{}, quota:{monthlyLimit:10,currentStock:5,isLowStock:false,isCriticalShortage:false}, antimicrobial:{isAntimicrobial:false}, alternatives:[], alternativeDrugs:[{drugId:'qa-drug-2',drugName:'Fixture Interaction Partner',reasonForChoice:'Isolated browser fixture',prescriberCategory:'A'}] }
  const fixturePartner = { ...fixtureDrug, id:'qa-drug-2', genericName:'Fixture Interaction Partner', mohDrugCode:'QA-002', alternativeDrugs:[] }
  const facilityDrug = { id:'facility-qa', drug_id:'facility-qa', drug_code:'QA-001', drug_name:'Quality Fixture Medicine', generic_name:'Quality Fixture Medicine', item_name:'Quality Fixture Medicine', dosage_form:'Tablet', facility_stock:5, min_buffer_level:1, location:'Fixture shelf' }
  const paedItem = { id:'paed-item-qa', drug_id:'facility-qa', drug:{id:'facility-qa',drug_name:'Quality Fixture Medicine',generic_name:'Quality Fixture Medicine',drug_code:'QA-001',dosage_form:'Tablet',procurement_vote:'APPL'}, clinical_group:'Fixture group', prescriber_category:'A', facility_stock:5, min_limit:1, max_limit:10, reorder_level:2, store_location:'Fixture shelf' }
  const allKinds = ['alternatives','detail','dashboard','ham','lawas','lasa','paediatric','quota','interaction','hub']
  const requestedKinds = process.env.HOME_QA_FORMULARI_KINDS?.split(',').filter(Boolean)
  const kinds = requestedKinds || allKinds
  assert.ok(kinds.every(kind => allKinds.includes(kind)), 'focused consumer selection contains only known consumers')
  let currentScenario = null
  let lastPage = null
  const persistEvidence = () => {
    evidence.sourceStableDuringBundle = JSON.stringify(beforeHashes) === JSON.stringify(sourceHashes())
    evidence.externalRequests = [...new Set(evidence.externalRequests)]
    const browserEvidencePath = process.env.HOME_QA_FORMULARI_EVIDENCE_PATH
      ? path.resolve(process.env.HOME_QA_FORMULARI_EVIDENCE_PATH)
      : path.join(root, 'docs/test-reports/2026-10-13-home-fixes-browser.json')
    const priorEvidence = fs.existsSync(browserEvidencePath) ? JSON.parse(fs.readFileSync(browserEvidencePath, 'utf8')) : {}
    const priorRuns = Array.isArray(priorEvidence.formulariSliceBHistory) ? priorEvidence.formulariSliceBHistory : []
    if (priorEvidence.formulariSliceB) priorRuns.push(priorEvidence.formulariSliceB)
    priorEvidence.formulariSliceBHistory = priorRuns
    if (requestedKinds) {
      priorEvidence.formulariFocusedRerunHistory = Array.isArray(priorEvidence.formulariFocusedRerunHistory) ? priorEvidence.formulariFocusedRerunHistory : []
      if (priorEvidence.formulariFocusedRerun) priorEvidence.formulariFocusedRerunHistory.push(priorEvidence.formulariFocusedRerun)
      priorEvidence.formulariFocusedRerun = evidence
    } else priorEvidence.formulariSliceB = evidence
    fs.writeFileSync(browserEvidencePath, `${JSON.stringify(priorEvidence, null, 2)}\n`)
  }
  const closeWithEvidence = async (label, close, timeoutMs = 2500) => {
    let timer
    const result = await Promise.race([
      Promise.resolve().then(close).then(() => ({ status: 'closed' }), error => ({ status: 'error', error: error.message })),
      new Promise(resolve => { timer = setTimeout(() => resolve({ status: 'timeout', timeoutMs }), timeoutMs) }),
    ])
    clearTimeout(timer)
    evidence.lifecycle.push({ label, ...result })
    process.stdout.write(`Formulary lifecycle: ${label} ${result.status}\n`)
    assert.equal(result.status, 'closed', `${label} closes within ${result.timeoutMs || timeoutMs}ms`)
    return result
  }
  t.after(async () => {
    const result = await closeWithEvidence('browser.close', () => browser.close(), 5000)
    persistEvidence()
    assert.equal(result.status, 'closed', `browser.close settled within ${result.timeoutMs || 5000}ms`)
  })
  browser.on('disconnected', () => { evidence.browserDisconnectedAt = currentScenario })
  try {
  for (const kind of kinds) {
    for (const mode of ['pending','retry']) {
      currentScenario = { kind, mode }
      const context = await browser.newContext({ viewport: evidence.viewport, colorScheme: evidence.theme, reducedMotion: evidence.motion })
      await context.route('**/*', route => { const url = new URL(route.request().url()); if (url.protocol === 'about:' || url.protocol === 'data:') return route.continue(); evidence.externalRequests.push(url.origin); return route.abort('blockedbyclient') })
      const page = await context.newPage()
      lastPage = page
      const retrySignals = []
      page.on('console', message => {
        const text = message.text()
        if (text.startsWith('__QA_')) retrySignals.push(text)
      })
      page.setDefaultTimeout(1400)
      page.setDefaultNavigationTimeout(1400)
      process.stdout.write(`Formulary browser: ${kind}/${mode}\n`)
      page.on('pageerror', error => evidence.checks.push({ kind, mode, status:'FAIL', error:error.message }))
      page.on('crash', () => evidence.checks.push({ kind, mode, scenario:'page-crash', status:'FAIL' }))
      await page.setContent('<!doctype html><meta charset="utf-8"><div id="root"></div>')
      await page.evaluate(({drug,partner,facilityDrug,paedItem,kind,mode}) => { window.__qa={kind,mode,retryArmed:false,requestCalls:0,pending:[],inventoryCalls:[],toastErrors:[],drugs:[drug,partner],drug,facilityDrug,paedItem};window.__qa.release=()=>window.__qa.pending.splice(0).forEach(entry=>entry.resolve()) }, { drug:fixtureDrug, partner:fixturePartner, facilityDrug, paedItem, kind, mode })
      await page.addScriptTag({ content: bundle, type: 'module' })
      if (kind === 'alternatives') {
        const tab = page.getByRole('button',{name:'Direktori Ubat Alternatif KKM'})
        const inspectTab = () => tab.evaluate(element => {
          const rect = element.getBoundingClientRect()
          const style = getComputedStyle(element)
          return {
            text:element.textContent?.trim(), role:element.getAttribute('role'), ariaSelected:element.getAttribute('aria-selected'),
            disabled:element.disabled, ariaDisabled:element.getAttribute('aria-disabled'),
            visible:!!(element.getClientRects().length && rect.width && rect.height && style.visibility !== 'hidden' && style.display !== 'none'),
            pointerEvents:style.pointerEvents, position:style.position, zIndex:style.zIndex,
            rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,top:rect.top,right:rect.right,bottom:rect.bottom,left:rect.left},
            hitTarget:document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2)?.outerHTML?.slice(0,220) ?? null,
            parent:element.parentElement?.outerHTML?.slice(0,500) ?? null,
          }
        })
        await page.evaluate(() => {
          window.__qa.tabClickEvents=[]
          for (const type of ['pointerdown','pointerup','mousedown','mouseup','click']) document.addEventListener(type,event=>{
            const path=event.composedPath(); const candidate=path.find(node=>node instanceof HTMLElement && node.textContent?.trim()==='Direktori Ubat Alternatif KKM')
            if(candidate) window.__qa.tabClickEvents.push({at:performance.now(),type,target:event.target?.tagName,targetText:event.target?.textContent?.trim()?.slice(0,80),candidateTag:candidate.tagName,defaultPrevented:event.defaultPrevented})
          },true)
        })
        const tabBefore=await inspectTab().catch(error=>({inspectionError:error.message}))
        process.stdout.write(`Formulary browser: alternatives/${mode} tab state=${JSON.stringify(tabBefore)}\n`)
        try {
          await tab.click({ timeout:8000 })
          evidence.checks.push({kind,mode,scenario:'alternatives-tab-activation-diagnostic',status:'PASS',clickResult:'completed',tabBefore,tabAfter:await inspectTab().catch(error=>({inspectionError:error.message})),clickEvents:await page.evaluate(()=>window.__qa.tabClickEvents),pageErrors:evidence.checks.filter(check=>check.kind===kind&&check.mode===mode&&check.error).map(check=>check.error),externalRequestCount:evidence.externalRequests.length,browserConnected:browser.isConnected()})
        } catch(error) {
          const tabAfter=await inspectTab().catch(inspectError=>({inspectionError:inspectError.message}))
          const diagnostic={kind,mode,scenario:'alternatives-tab-activation-diagnostic',status:'FAIL',clickResult:'timed out or errored',clickError:error.message,tabBefore,tabAfter,clickEvents:await page.evaluate(()=>window.__qa.tabClickEvents).catch(()=>null),pageErrors:evidence.checks.filter(check=>check.kind===kind&&check.mode===mode&&check.error).map(check=>check.error),externalRequestCount:evidence.externalRequests.length,browserConnected:browser.isConnected()}
          evidence.checks.push(diagnostic)
          process.stdout.write(`Formulary browser: alternatives/${mode} tab click diagnostic=${JSON.stringify(diagnostic)}\n`)
          throw error
        }
      }
      if (kind === 'interaction') {
        await page.getByPlaceholder(/Cari ubat untuk ditambah/).fill('Fixture Interaction Partner', { timeout:2500 })
        await page.getByText('Fixture Interaction Partner').last().click({ timeout:2500 })
      }
      if (mode === 'pending') {
        const loading = page.getByRole('status').filter({ hasText:/[Ll]oading|[Cc]hecking/ }).first()
        try {
          await loading.waitFor({ state:'visible', timeout:1800 })
          evidence.checks.push({ kind, scenario:'loading', status:'PASS', viewport:evidence.viewport, theme:evidence.theme, motion:evidence.motion })
        } catch {
          evidence.checks.push({ kind, scenario:'loading', status:'FAIL', reason:'No visible loading status while the fixture request was pending', renderedText:(await page.locator('body').innerText()).slice(0, 500), viewport:evidence.viewport, theme:evidence.theme, motion:evidence.motion })
        }
        for (let attempt = 0; attempt < 4; attempt++) {
          await page.evaluate(() => window.__qa.release())
          await page.waitForTimeout(100)
        }
        const successState = await page.waitForFunction(() => {
          const text = document.body.innerText
          return !Array.from(document.querySelectorAll('[role="status"]')).some(node => /loading|checking/i.test(node.textContent || ''))
            && (text.includes('Quality Fixture Medicine') || text.includes('Fixture Interaction Partner') || text.includes('MOH LASA Drug Registry') || text.includes('Paediatric Drug Catalogue') || text.includes('High Alert Medications') || text.includes('Drug Quota Management') || text.includes('Hospital Lawas Formulary') || text.includes('Formulary Search & Catalog') || text.includes('Formulary Dashboard'))
        }, null, { timeout:1800 }).catch(() => null)
        const renderedSuccess = await page.locator('body').innerText()
        evidence.checks.push({ kind, scenario:'successful-render', status: successState ? 'PASS' : 'FAIL', renderedText: renderedSuccess.slice(0, 300) })
      } else {
        const error = page.getByRole('alert')
        try { await error.waitFor({ state:'visible', timeout:1800 }) }
        catch {
          evidence.checks.push({ kind, scenario:'recoverable-error-and-retry', status:'FAIL', reason:'No visible error alert for the failed fixture request', renderedText:(await page.locator('body').innerText()).slice(0, 500) })
          await closeWithEvidence(`${kind}/${mode}.page.close`, () => page.close())
          await closeWithEvidence(`${kind}/${mode}.context.close`, () => context.close())
          continue
        }
        // Keep the same DOM target while the accessible label changes to “Retrying…”.
        const retry = page.getByRole('alert').getByRole('button').first()
        process.stdout.write(`Formulary browser: ${kind}/${mode} retry alert found\n`)
        await retry.waitFor({ state:'visible', timeout:1200 })
        const retryCallsBeforeClick = await page.evaluate(() => window.__qa.requestCalls)
        await page.evaluate(() => { window.__qa.retryArmed=true })
        if (kind === 'lawas' || kind === 'paediatric') await page.evaluate(() => {
          const qa = window.__qa
          qa.retryEvents = []
          const record = (phase, event) => {
            const entry = { phase, type:event.type, at:performance.now(), target:event.target?.tagName, targetText:event.target?.textContent?.trim()?.slice(0,100), currentTarget:event.currentTarget?.tagName, defaultPrevented:event.defaultPrevented }
            qa.retryEvents.push(entry)
            console.info('__QA_RETRY_EVENT__' + JSON.stringify(entry))
          }
          for (const type of ['pointerdown','mousedown','pointerup','mouseup','click']) {
            document.addEventListener(type, event => record('document-capture', event), true)
            document.addEventListener(type, event => record('document-bubble', event))
          }
          qa.retryCaptureInstalledAt = performance.now()
        })
        const retryState = await retry.evaluate(element => { const rect = element.getBoundingClientRect(); const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2); return { disabled: element.disabled, pointerEvents: getComputedStyle(element).pointerEvents, hitTarget: hit?.outerHTML.slice(0, 180) || null } })
        const retryScreenshot = await retry.screenshot({ type:'png', timeout:1200 }).then(bytes => bytes.toString('base64')).catch(() => null)
        process.stdout.write(`Formulary browser: ${kind}/${mode} retry state captured\n`)
        if (kind === 'lawas') {
          const box = await retry.boundingBox()
          const mouseClick = box ? await Promise.race([
            page.mouse.click(box.x + box.width / 2, box.y + box.height / 2).then(() => 'completed').catch(error => `failed: ${error.message}`),
            new Promise(resolve => setTimeout(() => resolve('timed out after 8000ms'), 8000)),
          ]) : 'blocked: retry button has no visible box'
          const retryRequestStarted = await Promise.race([
            page.waitForFunction(before => window.__qa.requestCalls > before, retryCallsBeforeClick, { timeout:3000 }).then(() => true).catch(() => false),
            new Promise(resolve => setTimeout(() => resolve(false), 3200)),
          ])
          const recoveryState = await Promise.race([
            page.evaluate(() => ({ requestCalls:window.__qa.requestCalls, alertVisible:Array.from(document.querySelectorAll('[role="alert"]')).some(node=>node.textContent?.includes('Fixture formulary unavailable')), loadingVisible:Array.from(document.querySelectorAll('[role="status"]')).some(node=>/loading|checking|retrying/i.test(node.textContent||'')), retryButtonText:document.querySelector('[role="alert"] button')?.textContent?.trim() ?? null, retryButtonDisabled:document.querySelector('[role="alert"] button')?.disabled ?? null })).catch(() => null),
            new Promise(resolve => setTimeout(() => resolve(null), 1800)),
          ])
          const retryEvents = await page.evaluate(() => window.__qa.retryEvents || []).catch(() => [])
          const clickEventDispatched = retryEvents.some(event => event.type === 'click' && event.phase === 'document-capture')
          const clickTriggeredRecovery = clickEventDispatched && retryRequestStarted && recoveryState?.requestCalls > retryCallsBeforeClick && !recoveryState.alertVisible && !recoveryState.loadingVisible
          evidence.checks.push({ kind, scenario:'retry-action', status:clickTriggeredRecovery?'PASS':'FAIL', activation:'Playwright mouse input at the captured visible hit target', mouseClick, clickEventDispatched, retryEvents, requestCallsBeforeClick:retryCallsBeforeClick, retryRequestStarted, requestCallsAfterClick:recoveryState?.requestCalls ?? null, recoveryState, retryState, nodeConsoleSignals:retrySignals, retryScreenshotBase64:retryScreenshot })
          if (clickTriggeredRecovery) {
            const rendered = await Promise.race([page.locator('body').innerText().catch(() => ''), new Promise(resolve => setTimeout(() => resolve(''), 1500))])
            evidence.checks.push({ kind, scenario:'retry-rendered-success', status:rendered.includes('Hospital Lawas Formulary')?'PASS':'FAIL', renderedText:rendered.slice(0,300) })
          }
          persistEvidence()
          if (!clickTriggeredRecovery) throw new Error(`Lawas retry activation did not prove a second request and recovered state; mouse=${mouseClick}, calls=${recoveryState?.requestCalls ?? 'unavailable'}`)
          await closeWithEvidence(`${kind}/${mode}.page.close`, () => page.close())
          await closeWithEvidence(`${kind}/${mode}.context.close`, () => context.close())
          continue
        }
        try { await retry.click({ timeout:3000 }) }
        catch (clickError) {
          process.stdout.write(`Formulary browser: ${kind}/${mode} click timed out; checking keyboard\n`)
          const requestLog = retrySignals.filter(signal => signal.startsWith('__QA_FORMULARI_REQUEST__')).map(signal => { try { return JSON.parse(signal.slice('__QA_FORMULARI_REQUEST__'.length)) } catch { return null } }).filter(Boolean)
          const eventLog = retrySignals.filter(signal => signal.startsWith('__QA_RETRY_EVENT__')).map(signal => { try { return JSON.parse(signal.slice('__QA_RETRY_EVENT__'.length)) } catch { return null } }).filter(Boolean)
          const requestObservation = await Promise.race([
            page.waitForFunction(before => window.__qa.requestCalls > before, retryCallsBeforeClick, { timeout:2200 }).then(() => ({ status:'observed' })).catch(error => ({ status:'error', error:error.message })),
            new Promise(resolve => setTimeout(() => resolve({ status:'observer-timeout' }), 2500)),
          ])
          const recoveryObservation = await Promise.race([
            page.evaluate(() => ({ requestCalls:window.__qa.requestCalls, alertVisible:Array.from(document.querySelectorAll('[role="alert"]')).some(node=>node.textContent?.includes('Fixture formulary unavailable')), loadingVisible:Array.from(document.querySelectorAll('[role="status"]')).some(node=>/loading|checking|retrying/i.test(node.textContent||'')), retryButtonText:document.querySelector('[role="alert"] button')?.textContent?.trim() ?? null, retryButtonDisabled:document.querySelector('[role="alert"] button')?.disabled ?? null })).then(value => ({ status:'observed', value })).catch(error => ({ status:'error', error:error.message })),
            new Promise(resolve => setTimeout(() => resolve({ status:'renderer-observer-timeout' }), 1800)),
          ])
          const retryEvents = eventLog
          const clickEventDispatched = retryEvents.some(event => event.type === 'click' && event.phase === 'document-capture')
          const loggedRequestCalls = requestLog.map(entry => entry.requestCalls)
          const requestCallsAfterClick = recoveryObservation.status === 'observed' ? recoveryObservation.value.requestCalls : loggedRequestCalls.at(-1) ?? null
          const retryRequestStarted = loggedRequestCalls.some(calls => calls > retryCallsBeforeClick) || requestObservation.status === 'observed'
          const recoveryState = recoveryObservation.status === 'observed' ? recoveryObservation.value : null
          const clickTriggeredRecovery = retryRequestStarted && recoveryState?.requestCalls > retryCallsBeforeClick && !recoveryState.alertVisible && !recoveryState.loadingVisible
          evidence.checks.push({ kind, scenario:'retry-action', status:clickTriggeredRecovery && clickEventDispatched?'PASS':'FAIL', reason:`Browser click promise timed out: ${clickError.message}`, automationClickTimedOut:true, clickEventDispatched, retryEvents, nodeConsoleSignals:retrySignals, requestObservation, recoveryObservation:recoveryObservation.status, requestCallsBeforeClick:retryCallsBeforeClick, requestCallsAfterClick, retryRequestStarted, recoveryState, retryState, retryScreenshotBase64:retryScreenshot })
          if (clickTriggeredRecovery) {
            const rendered = await page.locator('body').innerText()
            evidence.checks.push({ kind, scenario:'retry-rendered-success', status:rendered.includes('Quality Fixture Medicine')||rendered.includes('Hospital Lawas Formulary')||rendered.includes('Paediatric Drug Catalogue')?'PASS':'FAIL', renderedText:rendered.slice(0,300) })
            evidence.checks.push({ kind, scenario:'keyboard-retry', status:'NOT APPLICABLE', reason:'The timed-out browser click caused a second fixture request and recovery; no second activation was sent.' })
            if (kind === 'paediatric') {
              await page.getByRole('button',{name:/Monograph/}).first().click({ timeout:1800 })
              await page.waitForFunction(() => window.__qa.inventoryCalls.length > 0, null, { timeout:1800 })
              evidence.checks.push({ kind, scenario:'facility-lookup-before-monograph', status:'PASS', lookupCount: await page.evaluate(()=>window.__qa.inventoryCalls.length) })
            }
            await closeWithEvidence(`${kind}/${mode}.page.close`, () => page.close())
            await closeWithEvidence(`${kind}/${mode}.context.close`, () => context.close())
            continue
          }
          const key = kind === 'lawas' ? 'Enter' : 'Space'
          const alertObservation = await Promise.race([
            page.getByRole('alert').isVisible().then(value => ({ status:'observed', value })).catch(error => ({ status:'error', error:error.message })),
            new Promise(resolve => setTimeout(() => resolve({ status:'renderer-observer-timeout' }), 1400)),
          ])
          if (alertObservation.status !== 'observed' || !alertObservation.value) {
            evidence.checks.push({ kind, scenario:`keyboard-${key.toLowerCase()}-retry`, status:'NOT APPLICABLE', reason:alertObservation.status === 'renderer-observer-timeout' ? 'Renderer did not answer the post-click alert-state query; no second activation was sent.' : 'The browser click timed out after the retry alert had cleared; no second activation was sent.', alertObservation })
          } else {
            const focusObservation = await Promise.race([
              retry.focus({ timeout:900 }).then(() => retry.evaluate(element => document.activeElement === element)).then(value => ({ status:'observed', value })).catch(error => ({ status:'error', error:error.message })),
              new Promise(resolve => setTimeout(() => resolve({ status:'renderer-observer-timeout' }), 1200)),
            ])
            const keyboardFocused = focusObservation.status === 'observed' && focusObservation.value
            process.stdout.write(`Formulary browser: ${kind}/${mode} keyboard focus=${keyboardFocused}\n`)
            const keyboardObservation = keyboardFocused ? await Promise.race([
              page.keyboard.press(key).then(() => page.waitForFunction(() => !Array.from(document.querySelectorAll('[role="alert"]')).some(node => node.textContent?.includes('Fixture formulary unavailable')), null, { timeout:2500 })).then(() => ({ status:'recovered' })).catch(error => ({ status:'error', error:error.message })),
              new Promise(resolve => setTimeout(() => resolve({ status:'renderer-observer-timeout' }), 3200)),
            ]) : { status:'not-focused' }
            const keyboardRecovered = keyboardObservation.status === 'recovered'
            const bodyObservation = await Promise.race([
              page.locator('body').innerText().then(value => ({ status:'observed', value })).catch(error => ({ status:'error', error:error.message })),
              new Promise(resolve => setTimeout(() => resolve({ status:'renderer-observer-timeout' }), 1200)),
            ])
            evidence.checks.push({ kind, scenario:`keyboard-${key.toLowerCase()}-retry`, status:keyboardFocused && keyboardRecovered ? 'PASS' : 'FAIL', focused:keyboardFocused, keyboardObservation, recovered:keyboardRecovered, retryState, renderedText:bodyObservation.status === 'observed' ? bodyObservation.value.slice(0, 300) : null, bodyObservation:bodyObservation.status })
          }
          await closeWithEvidence(`${kind}/${mode}.page.close`, () => page.close())
          await closeWithEvidence(`${kind}/${mode}.context.close`, () => context.close())
          continue
        }
        const retryClearedError = await page.waitForFunction(() => !Array.from(document.querySelectorAll('[role="alert"]')).some(node=>node.textContent?.includes('Fixture formulary unavailable')), null, { timeout:1800 }).then(() => true).catch(() => false)
        if (kind === 'paediatric') {
          const retryEvents = await page.evaluate(() => window.__qa.retryEvents || []).catch(() => [])
          const requestCallsAfterClick = await page.evaluate(() => window.__qa.requestCalls).catch(() => null)
          const clickEventDispatched = retryEvents.some(event => event.type === 'click' && event.phase === 'document-capture')
          const retryRequestObserved = requestCallsAfterClick > retryCallsBeforeClick
          evidence.checks.push({ kind, scenario:'retry-event-request-trace', status:clickEventDispatched && retryRequestObserved ? 'PASS' : 'FAIL', clickEventDispatched, retryRequestObserved, requestCallsBeforeClick:retryCallsBeforeClick, requestCallsAfterClick, retryEvents, nodeConsoleSignals:retrySignals })
        }
        const recoveredState = await page.waitForFunction(() => {
          const text = document.body.innerText
          return !Array.from(document.querySelectorAll('[role="status"]')).some(node => /loading|checking/i.test(node.textContent || ''))
            && (text.includes('Quality Fixture Medicine') || text.includes('Fixture Interaction Partner') || text.includes('MOH LASA Drug Registry') || text.includes('Paediatric Drug Catalogue') || text.includes('High Alert Medications') || text.includes('Drug Quota Management') || text.includes('Hospital Lawas Formulary') || text.includes('Formulary Search & Catalog') || text.includes('Formulary Dashboard'))
        }, null, { timeout:1800 }).then(() => true).catch(() => false)
        if (kind === 'paediatric') {
          if (retryClearedError && recoveredState) {
            await page.getByRole('button',{name:/Monograph/}).first().click({ timeout:1800 })
            await page.waitForFunction(() => window.__qa.inventoryCalls.length > 0, null, { timeout:1800 })
            evidence.checks.push({ kind, scenario:'facility-lookup-before-monograph', status:'PASS', lookupCount: await page.evaluate(()=>window.__qa.inventoryCalls.length) })
          } else evidence.checks.push({ kind, scenario:'facility-lookup-before-monograph', status:'UNVERIFIED', reason:'successful catalogue state did not render after retry' })
        }
        evidence.checks.push({ kind, scenario:'recoverable-error-and-retry', status:retryClearedError && recoveredState ? 'PASS' : 'FAIL', retryClearedError, recoveredState, renderedText:(await page.locator('body').innerText()).slice(0, 300) })
      }
      await closeWithEvidence(`${kind}/${mode}.page.close`, () => page.close())
      await closeWithEvidence(`${kind}/${mode}.context.close`, () => context.close())
    }
  }
  } catch (error) {
    evidence.failure = error.stack || String(error)
    evidence.failureScenario = currentScenario
    evidence.browserConnectedAtFailure = browser.isConnected()
    if (lastPage && !lastPage.isClosed()) evidence.failureScreenshotBase64 = await lastPage.screenshot({ type: 'png', timeout: 1200 }).then(bytes => bytes.toString('base64')).catch(() => null)
    persistEvidence()
    throw error
  }
  persistEvidence()
  assert.equal(evidence.sourceStableDuringBundle, true, 'consumer sources remain stable while bundled')
  assert.deepEqual(evidence.externalRequests, [], 'consumer fixture issues no external requests')
  assert.equal(evidence.checks.filter(check => check.status === 'FAIL').length, 0, 'all consumer loading, recovery, and success states render')
  if (kinds.includes('paediatric')) assert.ok(evidence.checks.some(check => check.kind === 'paediatric' && check.scenario === 'facility-lookup-before-monograph' && check.status === 'PASS'), 'paediatric monograph waits for facility lookup')
})
