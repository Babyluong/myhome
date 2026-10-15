import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { build } from 'esbuild'
import { chromium } from 'playwright'

const root = process.cwd()
const reportPath = path.join(root, 'docs/test-reports/2026-10-13-home-fixes-browser.json')
const sourcePath = 'src/modules/procurement/pages/procurement/ExcelUploadModal.tsx'

test('ExcelUploadModal renders upload, rejects invalid files, and opens matched review with isolated services', async t => {
  const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, sourcePath))).digest('hex')
  const fixture = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import ExcelUploadModal from '/src/modules/procurement/pages/procurement/ExcelUploadModal.tsx'
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(React.createElement(ExcelUploadModal,{isOpen:true,onClose:()=>window.__qa.closed=true,onSuccess:()=>window.__qa.success=true}))
`
  const mocks: Record<string, string> = {
    'qa-ui': `import React from 'react'; export const Modal=({isOpen,title,children,onClose})=>isOpen?React.createElement('section',{role:'dialog','aria-label':title},React.createElement('h1',null,title),React.createElement('button',{onClick:onClose,'aria-label':'Close'},'Close'),children):null; export const Spinner=()=>React.createElement('span',null,'Loading'); export const Badge=({children})=>React.createElement('span',null,children);`,
    'qa-icons': `import React from 'react'; export const IconUpload=()=>React.createElement('span',null,'Upload'); export const IconAlertCircle=()=>React.createElement('span',null,'Alert'); export const IconFileText=()=>null; export const IconArrowRight=()=>null; export const IconSearch=()=>null; export const IconPackage=()=>null;`,
    'qa-auth': `export const useAuthStore=()=>({user:{id:'qa-user',hospital_id:'qa-hospital'}});`,
    'qa-excel': `export async function parseSupplierExcel(file,onProgress){window.__qa.parseCalls.push(file.name);onProgress('Fixture parsed',100);if(file.name==='invalid-rows.xlsx')return {rows:[],errors:[{message:'Fixture parse rejection'}]};return {rows:[{lpoNumber:'QA-LPO-1'}],errors:[]}} export async function matchExcelToDatabase(parsed,hospitalId,onProgress){window.__qa.matchCalls.push({rows:parsed.rows.length,hospitalId});onProgress('Matched',100);return [{lpoNumber:'QA-LPO-1',poId:'qa-po-1',alreadyProcessed:false,items:[]}]}`,
    'qa-receiving': `import React from 'react'; export default function GoodsReceivingForm(){return React.createElement('div',null,'Fixture receiving form')}; export const createGoodsReceipt=async()=>({success:true});`,
    'qa-order': `export const recalculateOverdueStatus=async()=>({success:true});`,
    'qa-utils': `export const cn=(...values)=>values.filter(Boolean).join(' ');`,
  }
  const result = await build({
    absWorkingDir: root,
    stdin: { contents: fixture, resolveDir: root, sourcefile: 'qa-procurement-entry.tsx', loader: 'tsx' },
    bundle: true, write: false, platform: 'browser', format: 'esm',
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'isolated-procurement-fixture', setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => {
        const id = args.path.replaceAll('\\', '/')
        if (id === '@/components/ui') return { path: 'qa-ui', namespace: 'fixture' }
        if (id === '@/components/ui/Icons') return { path: 'qa-icons', namespace: 'fixture' }
        if (id === '@/stores/authStore') return { path: 'qa-auth', namespace: 'fixture' }
        if (id.endsWith('/services/excelUploadService')) return { path: 'qa-excel', namespace: 'fixture' }
        if (id.endsWith('GoodsReceivingForm')) return { path: 'qa-receiving', namespace: 'fixture' }
        if (id.endsWith('/services/receivingService') || id.endsWith('/pharmacy/receivingService')) return { path: 'qa-receiving', namespace: 'fixture' }
        if (id.endsWith('/services/orderTrackingService')) return { path: 'qa-order', namespace: 'fixture' }
        if (id.endsWith('/pharmacy/lpoService') || id.endsWith('/services/supabase')) return { path: 'qa-order', namespace: 'fixture' }
        if (id === '@/lib/utils') return { path: 'qa-utils', namespace: 'fixture' }
        if (id.startsWith('@/')) return { path: path.join(root, 'src', id.slice(2)) }
        if (id.startsWith('/src/')) return { path: path.join(root, id.slice(1)) }
      })
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: mocks[args.path] ?? '', loader: 'js', resolveDir: root }))
      builder.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'css' }))
    } }],
  })
  const jsOutput = result.outputFiles.find(file => file.path.endsWith('.js') || file.path === '<stdout>')
  assert.ok(jsOutput, `expected JS bundle output, got ${result.outputFiles.map(file => file.path).join(', ')}`)
  const bundle = jsOutput.text
  const bundleSha256 = crypto.createHash('sha256').update(bundle).digest('hex')
  const browserPath = process.env.HOME_QA_BROWSER || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(candidate => fs.existsSync(candidate))
  const browser = await chromium.launch({ headless: true, ...(browserPath ? { executablePath: browserPath } : {}) })
  const evidence: Record<string, unknown> = {
    criterion: 'Procurement ExcelUploadModal upload interaction', sourcePath, sourceSha256: sourceHash,
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    bundleSha256, browserVersion: browser.version(), viewport: { width: 1280, height: 900 }, theme: 'light', motion: 'no-preference',
    externalRequests: [], checks: [],
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light', reducedMotion: 'no-preference' })
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin === 'http://qa.local') return route.fulfill({ status: 200, contentType: url.pathname === '/fixture.js' ? 'text/javascript' : 'text/html', body: url.pathname === '/fixture.js' ? bundle : '<!doctype html><div id="root"></div><script type="module" src="/fixture.js"></script>' })
    ;(evidence.externalRequests as string[]).push(url.origin)
    return route.abort('blockedbyclient')
  })
  const page = await context.newPage()
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.goto('http://qa.local/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => { window.__qa = { parseCalls: [], matchCalls: [] } })
  const dialog = page.getByRole('dialog', { name: 'IMPORT SUPPLIER DELIVERY SHEET' })
  await dialog.waitFor({ timeout: 5000 })
  const invalid = page.locator('input[type=file]')
  await invalid.setInputFiles({ name: 'not-a-spreadsheet.txt', mimeType: 'text/plain', buffer: Buffer.from('fixture') })
  await page.getByText('Please upload a valid Excel file (.xlsx or .xls)', { exact: true }).waitFor({ timeout: 2000 })
  ;(evidence.checks as unknown[]).push({ scenario: 'invalid-extension-visible-error', status: 'PASS' })
  await invalid.setInputFiles({ name: 'fixture.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from('isolated fixture') })
  await page.getByRole('heading', { name: 'Review Excel Sync Queue' }).waitFor({ timeout: 3000 })
  const actual = await page.evaluate(() => ({ parseCalls: window.__qa.parseCalls, matchCalls: window.__qa.matchCalls, body: document.body.innerText }))
  assert.deepEqual(actual.parseCalls, ['fixture.xlsx'])
  assert.deepEqual(actual.matchCalls, [{ rows: 1, hospitalId: 'qa-hospital' }])
  assert.match(actual.body, /Parsed\s+1 rows/)
  assert.match(actual.body, /Found\s+1 matching POs/)
  assert.deepEqual(pageErrors, [])
  assert.deepEqual(evidence.externalRequests, [])
  ;(evidence.checks as unknown[]).push({ scenario: 'valid-upload-parses-matches-and-opens-review', status: 'PASS', parseCalls: actual.parseCalls.length, matchCalls: actual.matchCalls.length, facilityScopedHospitalId: actual.matchCalls[0].hospitalId })
  evidence.screenshotBase64 = (await page.screenshot({ fullPage: true, type: 'png' })).toString('base64')
  evidence.sourceStableAfterRun = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, sourcePath))).digest('hex') === sourceHash
  t.after(async () => { await context.close(); await browser.close() })
  const prior = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {}
  prior.procurementExcelUpload = evidence
  fs.writeFileSync(reportPath, JSON.stringify(prior, null, 2))
})

test('PurchaseOrderCreatePage manual item entry recalculates order subtotal in the browser', async t => {
  const sourcePath = 'src/modules/procurement/pages/procurement/PurchaseOrderCreatePage.tsx'
  const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, sourcePath))).digest('hex')
  const fixture = `import React from 'react'; import ReactDOM from 'react-dom/client'; import {MemoryRouter} from 'react-router-dom'; import PurchaseOrderCreatePage from '/src/modules/procurement/pages/procurement/PurchaseOrderCreatePage.tsx'; ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(MemoryRouter,null,React.createElement(PurchaseOrderCreatePage)));`
  const ui = `
import React from 'react';
const control=(tag)=>(props)=>React.createElement(tag,{...props,type:props.type||undefined},props.children);
export const Button=({children,type='button',...props})=>React.createElement('button',{...props,type},children);
import {Select} from '/src/shared/components/ui/select.tsx'; export {Select};
export const Input=control('input'); export const AutoExpandingTextarea=control('textarea');
export const Spinner=()=>React.createElement('span',null,'Loading'); export const ConfirmationDialog=()=>null; export const Checkbox=control('input');`
  const icons = `import React from 'react'; export const ${[
    'IconPlus','IconX','IconSave','IconAlertCircle','IconCalculator','IconSearch','IconBuilding','IconUser','IconChevronLeft','IconChevronRight','IconActivity','IconPackage','IconInfoCircle','IconHistory',
  ].map(name => `${name}=()=>React.createElement('span',{'aria-hidden':true},'')`).join(',')};`
  const services = `
export const getActiveSuppliers=async()=>({data:[],error:null}); export const getPurchaseOrderById=async()=>({data:null,error:null});
export const createPurchaseOrder=async()=>({data:null,error:null}); export const updatePurchaseOrder=async()=>({data:null,error:null}); export const createSupplier=async()=>({data:null,error:null});
export const getBudgetForPO=async()=>({allocation:0,expenses:0,balance:0});
export const WARRANT_CATEGORIES=[{value:'drug',label:'Drug'}]; export const WARRANT_DEPARTMENTS=[{value:'pharmacy',label:'Pharmacy'}]; export const getWarrants=async()=>({data:[],error:null});
export const getDrugCatalog=async()=>({data:{data:[]},error:null}); export const getNonDrugCatalog=async()=>({data:{data:[]},error:null});
export const getPharmacyPOSignatures=async()=>({data:null,error:null});
export const supabase={from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:null,error:null})})};`
  const utils = `
export const cn=(...values)=>values.filter(Boolean).join(' '); export const formatCurrency=value=>` + "`RM ${Number(value).toFixed(2)}`" + `;
export const isContractExpired=()=>false; export const isApplVote=value=>String(value||'').toLowerCase().includes('appl'); export const isCcVote=value=>String(value||'').toLowerCase().includes('cc');
export const normalizeRealMdcCode=value=>value||''; export const resolveGenuineItemCode=async(_client,options)=>options.item_code||''; export const isSyntheticMockCode=()=>false;`
  const motion = `import React from 'react'; const cache={}; const make=tag=>React.forwardRef(({children,...props},ref)=>React.createElement(tag,{...props,ref},children)); export const motion=new Proxy({}, {get:(_target,key)=>cache[key]||(cache[key]=make(String(key)))}); export const AnimatePresence=({children})=>React.createElement(React.Fragment,null,children);`
  const sourcePaths = [sourcePath]
  const snapshot = () => Object.fromEntries(sourcePaths.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]))
  const before = snapshot()
  const bundled = await build({
    absWorkingDir: root, stdin: { contents: fixture, resolveDir: root, sourcefile: 'qa-purchase-order.tsx', loader: 'tsx' },
    bundle: true, write: false, platform: 'browser', format: 'esm', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'purchase-order-isolated-fixture', setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => {
        const id = args.path.replaceAll('\\','/')
        if (['react','react-dom/client','react-router-dom'].includes(id) || id.startsWith('react/')) return
        if (id === 'framer-motion') return { path:'po-motion', namespace:'po' }
        if (id === '@/components/ui') return { path:'po-ui', namespace:'po' }
        if (id === '@/components/ui/Icons') return { path:'po-icons', namespace:'po' }
        if (id === '@/stores/authStore') return { path:'po-auth', namespace:'po' }
        if (id === '@/stores/toastStore') return { path:'po-toast', namespace:'po' }
        if (id.startsWith('@/services/')) return { path:'po-services', namespace:'po' }
        if (id === '@/lib/constants') return { path:'po-constants', namespace:'po' }
        if (id === '@/lib/utils' || id === '@/shared/utils/itemCodeUtils') return { path:'po-utils', namespace:'po' }
        if (id.startsWith('@/types/')) return { path:'po-types', namespace:'po' }
        if (id.startsWith('/src/')) return { path:path.join(root,id.slice(1)) }
        if (id.endsWith('.css')) return { path:'po-empty', namespace:'po' }
      })
      builder.onLoad({ filter: /.*/, namespace:'po' }, args => {
        const contents = { 'po-motion':motion,'po-ui':ui,'po-icons':icons,'po-auth':`const user={id:'qa-user',hospital_id:'qa-hospital',full_name:'QA User',jawatan:'Pharmacist'}; export const useAuthStore=()=>({user});`,'po-toast':`const success=()=>{}; const error=(...args)=>window.__qa.errors.push(args.map(String).join(' ')); const toast={success,error}; export const useToastStore=()=>toast;`,'po-services':services,'po-constants':`export const ROUTES={PHARMACY_PO:'/procurement',PHARMACY_PO_DETAIL:'/procurement/:id'};`,'po-utils':utils,'po-types':'','po-empty':'' }[args.path]
        return { contents, loader:'js', resolveDir:root }
      })
    } }],
  })
  process.stdout.write('PurchaseOrderCreatePage fixture: bundle complete\n')
  const bundle = bundled.outputFiles.find(file => file.path.endsWith('.js') || file.path === '<stdout>')!.text
  const bundleSha256 = crypto.createHash('sha256').update(bundle).digest('hex')
  const browserPath = process.env.HOME_QA_BROWSER || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(candidate=>fs.existsSync(candidate))
  const browser = await chromium.launch({headless:true,...(browserPath?{executablePath:browserPath}:{})})
  const context = await browser.newContext({viewport:{width:1280,height:900},colorScheme:'light',reducedMotion:'no-preference'})
  t.after(async()=>{await context.close();await browser.close()})
  const evidence: Record<string,unknown> = { criterion:'PurchaseOrderCreatePage manual item total',sourcePath,sourceSha256:sourceHash,revision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),bundleSha256,browserVersion:browser.version(),viewport:{width:1280,height:900},theme:'light',motion:'no-preference',externalRequests:[],checks:[] }
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin==='http://qa.local')return route.fulfill({status:200,contentType:url.pathname==='/fixture.js'?'text/javascript':'text/html',body:url.pathname==='/fixture.js'?bundle:'<!doctype html><div id="root"></div><script type="module" src="/fixture.js"></script>'});(evidence.externalRequests as string[]).push(url.origin);return route.abort('blockedbyclient')})
  const page=await context.newPage(),pageErrors:string[]=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  await page.goto('http://qa.local/',{waitUntil:'domcontentloaded'})
  process.stdout.write('PurchaseOrderCreatePage fixture: page loaded\n')
  await page.evaluate(()=>{window.__qa={errors:[]}})
  try {
    await page.getByRole('heading',{name:'Create Purchase Order'}).waitFor({timeout:8000})
  } catch (error) {
    const diagnostic=await page.locator('body').innerText().catch(()=>'<body unavailable>')
    process.stderr.write(`PurchaseOrderCreatePage render diagnostic: ${JSON.stringify({pageErrors,body:diagnostic.slice(0,1200)})}\n`)
    throw error
  }
  process.stdout.write('PurchaseOrderCreatePage fixture: page rendered\n')
  const selects=page.locator('select')
  let initialSelect
  try {
    initialSelect=await selects.nth(0).elementHandle({timeout:8000})
  } catch (error) {
    const diagnostic=await page.locator('body').innerText().catch(()=>'<body unavailable>')
    process.stderr.write(`PurchaseOrderCreatePage select diagnostic: ${JSON.stringify({pageErrors,body:diagnostic.slice(0,1200),selectCount:await selects.count().catch(()=>-1)})}\n`)
    throw error
  }
  assert.ok(initialSelect,'purchase order type select should mount')
  await initialSelect.evaluate(original => {
    const root = document.getElementById('root')
    if (!root) throw new Error('Purchase order fixture root was not mounted')
    window.__qa.selectOriginal = original
    window.__qa.selectMutationEvidence = { initialConnected: original.isConnected, removedOriginal: 0, addedSelects: 0, sameNodeAfterSelection: null }
    new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (node === original || node.contains(original)) window.__qa.selectMutationEvidence!.removedOriginal++
        }
        for (const node of record.addedNodes) {
          if (node instanceof Element && (node.matches('select') || node.querySelector('select'))) window.__qa.selectMutationEvidence!.addedSelects++
        }
      }
    }).observe(root, { childList: true, subtree: true })
  })
  await selects.nth(0).selectOption('manual')
  const selectMutationEvidence = await page.evaluate(() => {
    const current = document.querySelector('select')
    window.__qa.selectMutationEvidence!.sameNodeAfterSelection = current === window.__qa.selectOriginal
    return { ...window.__qa.selectMutationEvidence, currentConnected: current?.isConnected ?? false, currentValue: current?.value ?? null }
  })
  assert.deepEqual(selectMutationEvidence, { initialConnected: true, removedOriginal: 0, addedSelects: 0, sameNodeAfterSelection: true, currentConnected: true, currentValue: 'manual' }, 'manual mode selection should update state without replacing the shared Select node')
  evidence.selectMutationEvidence=selectMutationEvidence
  process.stdout.write(`PurchaseOrderCreatePage select mutation evidence: ${JSON.stringify(selectMutationEvidence)}\n`)
  process.stdout.write('PurchaseOrderCreatePage fixture: manual mode selected\n')
  await page.getByText('Add Manual Item',{exact:true}).waitFor({timeout:2500})
  const add=page.getByRole('button',{name:'Add',exact:true})
  assert.equal(await add.isDisabled(),true,'manual item Add starts disabled until required values are entered')
  await page.getByPlaceholder('Enter drug or supply name...').fill('QA Fixture Syringe')
  await page.locator('input[type="number"]').nth(0).fill('3')
  await page.locator('input[type="number"]').nth(1).fill('12.50')
  process.stdout.write('PurchaseOrderCreatePage fixture: manual item values entered\n')
  assert.equal(await add.isEnabled(),true,'Add enables after item, quantity and unit price are valid')
  await add.click({timeout:2500})
  process.stdout.write('PurchaseOrderCreatePage fixture: item added\n')
  await page.getByRole('heading',{name:'QA Fixture Syringe'}).waitFor({timeout:2500})
  const subtotal=page.getByText('RM 37.50',{exact:true})
  await subtotal.waitFor({timeout:2500})
  assert.deepEqual(pageErrors,[])
  assert.deepEqual(evidence.externalRequests,[])
  ;(evidence.checks as unknown[]).push({scenario:'manual-item-validates-and-calculates-subtotal',status:'PASS',item:'QA Fixture Syringe',quantity:3,unitPrice:12.5,expectedAndRenderedSubtotal:'RM 37.50',requiredFieldsConfirmed:true})
  evidence.screenshotBase64=(await page.screenshot({fullPage:true,type:'png'})).toString('base64')
  evidence.sourceStableAfterRun=JSON.stringify(before)===JSON.stringify(snapshot())
  assert.equal(evidence.sourceStableAfterRun,true)
  const prior=JSON.parse(fs.readFileSync(reportPath,'utf8'));prior.procurementPurchaseOrderCreate=evidence;fs.writeFileSync(reportPath,JSON.stringify(prior,null,2))
})

declare global { interface Window { __qa: { parseCalls: string[]; matchCalls: Array<{ rows: number; hospitalId: string }>; errors?: string[]; selectOriginal?: HTMLSelectElement; selectMutationEvidence?: { initialConnected: boolean; removedOriginal: number; addedSelects: number; sameNodeAfterSelection: boolean | null } } } }
