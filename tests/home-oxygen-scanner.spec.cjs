const assert = require('node:assert/strict')
const { test, after } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')
const { build } = require('esbuild')
const { chromium } = require('playwright')

const root = path.resolve(__dirname, '..')
const reportPath = path.join(root, 'docs/test-reports/2026-10-14-oxygen-scanner-qa.md')
const pageSourcePath = 'src/modules/inventory/pages/inventory/StockMovementScannerPage.tsx'
const evidence = {
  task: 'HOME-FIXES-20261013 Phase 6p',
  revision: spawnSync('git', ['-c', 'core.fsmonitor=false', 'rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim(),
  sourceSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, pageSourcePath))).digest('hex'),
  browserVersion: null,
  viewport: { width: 1280, height: 900 },
  theme: 'light',
  motion: 'no-preference',
  externalRequests: [],
  fixtures: 'Isolated QA catalogue and locations; mocked getUserMedia/MediaStream track and QR decoder; no application Supabase client or production records.',
  checks: [],
}

const iconNames = ['QrCode','AlertTriangle','Camera','Search','Volume2','VolumeX','ArrowDownCircle','ArrowUpCircle','Database','Calendar','MapPin','Clock','User','Plus','Trash2']
const iconModule = `import React from 'react';\n${iconNames.map(name => `export const ${name}=props=>React.createElement('span',{...props,'aria-hidden':'true'});`).join('\n')}`
const uiModule = `import React from 'react';
export const Spinner=()=>React.createElement('span',{'data-qa':'spinner'});
export const Input=React.forwardRef((props,ref)=>React.createElement('input',{...props,ref}));
export const Badge=({children,...props})=>React.createElement('span',props,children);
export const Select=React.forwardRef((props,ref)=>React.createElement('select',{...props,ref}));
export const Button=({children,variant,className,type='button',...props})=>React.createElement('button',{...props,className,type},children);`
const serviceModule = `
const qa=window.__qa;
const catalog=qa.catalog;
export const getStockLocations=async()=>({data:[{id:'location-1',location_name:'Fixture shelf',aisle_number:'A1'}],error:null});
export const getStockLevelSummary=async()=>({data:catalog,error:null});
export const getStockBatches=async()=>({data:[],error:null});
export const createStockReceipt=async()=>({data:{},error:null});
export const issueStock=async()=>({data:{},error:null});
export const normalizeItemCode=value=>String(value||'').trim().toUpperCase();
export const matchStockItem=(items,code,id,type)=>{qa.matchCalls.push({code,id,type});const norm=normalizeItemCode(code);return items.find(item=>(!type||item.item_type===type)&&((id&&(item.item_id===id||item.id===id))||(!id&&normalizeItemCode(item.item_code)===norm)||(!id&&item.item_name.toLowerCase()===String(code||'').trim().toLowerCase())))||null};
`

let bundlePromise
let browserPromise
const allPages = new Set()
const getBrowser = () => browserPromise ||= chromium.launch({
  headless: true,
  ...(process.env.HOME_QA_BROWSER ? { executablePath: process.env.HOME_QA_BROWSER } : fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe') ? { executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' } : {}),
})

function fixtureItem(id, code, name, type = 'drug') {
  return { id, item_id:id, item_code:code, item_name:name, item_type:type, current_stock:14, unit_of_measure:'unit' }
}

async function getBundle() {
  if (bundlePromise) return bundlePromise
  bundlePromise = build({
    absWorkingDir: root,
    stdin: {
      contents: `import React from 'react'; import { createRoot } from 'react-dom/client'; import Scanner from './${pageSourcePath}'; createRoot(document.getElementById('root')).render(React.createElement(Scanner));`,
      resolveDir: root,
      sourcefile: 'qa-oxygen-scanner-entry.tsx',
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'iife',
    globalName: 'ScannerQaBundle',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name:'scanner-isolated-imports', setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => {
        const id=args.path.replaceAll('\\','/')
        if (id==='lucide-react') return {path:'icons',namespace:'scanner-qa'}
        if (id==='jsqr') return {path:'qr',namespace:'scanner-qa'}
        if (id==='@/stores/authStore') return {path:'auth',namespace:'scanner-qa'}
        if (id==='@/components/ui') return {path:'ui',namespace:'scanner-qa'}
        if (id.endsWith('/services/inventoryService')) return {path:'inventory',namespace:'scanner-qa'}
        if (id.endsWith('.css')) return {path:'css',namespace:'scanner-qa'}
      })
      builder.onLoad({filter:/.*/,namespace:'scanner-qa'},args=>{
        if(args.path==='icons')return {contents:iconModule,loader:'jsx',resolveDir:root}
        if(args.path==='ui')return {contents:uiModule,loader:'jsx',resolveDir:root}
        if(args.path==='qr')return {contents:`export default function jsQR(){const q=window.__qa;q.decodeCalls++;if(q.qrPayload&&!q.qrConsumed){q.qrConsumed=true;return {data:q.qrPayload}}return null}`,loader:'js',resolveDir:root}
        if(args.path==='auth')return {contents:`export const useAuthStore=()=>({user:{id:'qa-user',hospital_id:'11111111-1111-4111-8111-111111111111',full_name:'QA Scanner'}})`,loader:'js',resolveDir:root}
        if(args.path==='inventory')return {contents:serviceModule,loader:'js',resolveDir:root}
        return {contents:'',loader:'js',resolveDir:root}
      })
    }}],
  }).then(result=>result.outputFiles[0].text)
  return bundlePromise
}

async function openScanner(t) {
  const browser = await getBrowser()
  evidence.browserVersion = browser.version()
  const context = await browser.newContext({ viewport:evidence.viewport, colorScheme:evidence.theme, reducedMotion:evidence.motion })
  const page = await context.newPage()
  const pageErrors=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  allPages.add({ page, context })
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    if (['about:', 'data:', 'blob:'].includes(url.protocol)) return route.continue()
    evidence.externalRequests.push(url.origin)
    return route.abort('blockedbyclient')
  })
  await page.setContent('<!doctype html><html><body><div id="root"></div></body></html>')
  await page.evaluate(() => {
    const qa=window.__qa={
      getUserMediaCalls:[],trackStopCalls:0,decodeCalls:0,qrPayload:null,qrConsumed:false,matchCalls:[],
      catalog:[
        {id:'drug-a',item_id:'drug-a',item_code:'PARA-500',item_name:'Paracetamol 500 mg',item_type:'drug',current_stock:14,unit_of_measure:'tablet'},
        {id:'drug-b',item_id:'drug-b',item_code:'GAUZE-10',item_name:'Sterile Gauze 10 cm',item_type:'non_drug',current_stock:8,unit_of_measure:'pack'},
      ],
    }
    qa.track={stop(){qa.trackStopCalls++},get readyState(){return 'live'},kind:'video',enabled:true}
    qa.stream={getTracks(){return [qa.track]},getVideoTracks(){return [qa.track]},getAudioTracks(){return []}}
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async constraints=>{qa.getUserMediaCalls.push(constraints);return qa.stream}}})
    Object.defineProperty(HTMLMediaElement.prototype,'srcObject',{configurable:true,get(){return this.__qaStream||null},set(value){this.__qaStream=value}})
    Object.defineProperty(HTMLVideoElement.prototype,'readyState',{configurable:true,get(){return 4}})
    Object.defineProperty(HTMLVideoElement.prototype,'videoWidth',{configurable:true,get(){return 640}})
    Object.defineProperty(HTMLVideoElement.prototype,'videoHeight',{configurable:true,get(){return 480}})
    const canvasContext={drawImage(){},getImageData(){return {data:new Uint8ClampedArray(640*480*4),width:640,height:480}}}
    HTMLCanvasElement.prototype.getContext=function(){return canvasContext}
    qa.rafQueue=[]
    window.requestAnimationFrame=callback=>{qa.rafQueue.push(callback);return qa.rafQueue.length}
    window.cancelAnimationFrame=()=>{}
    qa.runFrame=()=>{const callback=qa.rafQueue.shift();if(callback)callback(performance.now());return Boolean(callback)}
    window.AudioContext=undefined
  })
  await page.addScriptTag({ content: await getBundle() })
  try { await page.getByRole('heading',{name:'Imbasan & Transaksi Stok'}).waitFor({state:'visible',timeout:5000}) }
  catch(error) { throw new Error(`Scanner did not render; body=${JSON.stringify(await page.locator('body').innerText().catch(()=>''))}; pageErrors=${JSON.stringify(pageErrors)}; cause=${error.message}`) }
  await page.waitForFunction(()=>window.__qa.getUserMediaCalls.length>0,{},{timeout:5000}).catch(()=>{})
  t.after(async()=>{await context.close().catch(()=>{});allPages.delete({page,context})})
  return { page, context, browser, pageErrors }
}

after(async()=>{
  for(const entry of allPages){await entry.context.close().catch(()=>{})}
  await browserPromise?.then(browser=>browser.close()).catch(()=>{})
  const lines=[
    '# Oxygen scanner browser QA — 2026-10-14',
    '',
    `Revision: \`${evidence.revision}\``,
    `Scanner source SHA-256: \`${evidence.sourceSha256}\``,
    `Browser: Chromium \`${evidence.browserVersion||'unavailable'}\`; viewport ${evidence.viewport.width}×${evidence.viewport.height}; theme ${evidence.theme}; motion ${evidence.motion}.`,
    `External requests: ${evidence.externalRequests.length===0?'none':evidence.externalRequests.join(', ')}.`,
    '',
    evidence.fixtures,
    '',
    '| Criterion | Status | Evidence |',
    '| --- | --- | --- |',
    ...evidence.checks.map(check=>`| ${check.criterion} | **${check.status}** | ${check.detail} |`),
    '',
    'No production code or production data was used. A failed assertion remains a failure; browser availability or a missing fixture signal remains unverified.',
    '',
  ]
  fs.writeFileSync(reportPath,lines.join('\n'))
})

test('camera stream stops and releases tracks when the scanner is closed', async t=>{
  const {page,pageErrors}=await openScanner(t)
  await page.waitForSelector('video',{timeout:5000})
  const started=await page.evaluate(()=>({calls:window.__qa.getUserMediaCalls.length,trackState:window.__qa.track.readyState}))
  await page.getByRole('button',{name:'Hentikan Kamera'}).click()
  await page.waitForFunction(()=>window.__qa.trackStopCalls>0,{},{timeout:2500})
  const after=await page.evaluate(()=>({stopCalls:window.__qa.trackStopCalls,videoPresent:!!document.querySelector('video'),inactiveText:document.body.innerText.includes('Kamera Tidak Aktif')}))
  assert.ok(started.calls>0,'mocked getUserMedia was requested')
  assert.equal(after.stopCalls,1,'close stops the camera track exactly once')
  assert.equal(after.videoPresent,false,'closing removes the active video preview')
  evidence.checks.push({criterion:'Camera stop button closes the preview and releases stream tracks',status:'PASS',detail:`Mock stream requested ${started.calls} time(s); after close track.stop calls=${after.stopCalls}, video removed=${!after.videoPresent}, inactive fallback shown=${after.inactiveText}.`})
})

test('switching to Manual stops the active camera track', async t=>{
  const {page}=await openScanner(t)
  await page.waitForSelector('video',{timeout:5000})
  await page.getByRole('button',{name:'Manual'}).click()
  await page.waitForFunction(()=>window.__qa.trackStopCalls>0,{},{timeout:2500})
  const result=await page.evaluate(()=>({stopCalls:window.__qa.trackStopCalls,manualInput:!!document.querySelector('input[placeholder="Taip Kod Item atau Nama..."]'),cameraTabSelected:Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Manual')?.className}))
  assert.equal(result.stopCalls,1,'manual tab switch stops the camera track exactly once')
  assert.equal(result.manualInput,true,'manual search input is rendered after switching tabs')
  evidence.checks.push({criterion:'Switching to the Manual tab releases the camera stream',status:'PASS',detail:`Track.stop calls=${result.stopCalls}; manual input rendered=${result.manualInput}; selected-tab class captured.`})
})

test('camera QR decoder dispatches the current handler and selects the matching item', async t=>{
  const {page,pageErrors}=await openScanner(t)
  await page.waitForSelector('video',{timeout:5000})
  await page.waitForFunction(()=>window.__qa.rafQueue.length>0,{},{timeout:2500})
  await page.evaluate(()=>{window.__qa.qrPayload='MYINV:DRUG:drug-a:PARA-500';window.__qa.runFrame()})
  try { await page.getByText('Item Terpilih (drug)',{exact:true}).waitFor({state:'visible',timeout:3500}) }
  catch(error) {
    const state=await page.evaluate(()=>({decodeCalls:window.__qa.decodeCalls,matchCalls:window.__qa.matchCalls,body:document.body.innerText.slice(-800),bodyHtml:document.body.innerHTML.slice(-1200)}))
    evidence.checks.push({criterion:'QR frame is decoded and dispatched through the current scan handler',status:'FAIL',detail:`Decoder calls=${state.decodeCalls}; match handler received ${JSON.stringify(state.matchCalls)}; selected-item render did not settle. Page errors=${JSON.stringify(pageErrors)}; root DOM=${JSON.stringify(state.bodyHtml)}.`})
    throw new Error(`QR result did not select item; state=${JSON.stringify(state)}; pageErrors=${JSON.stringify(pageErrors)}; cause=${error.message}`)
  }
  const result=await page.evaluate(()=>({matches:window.__qa.matchCalls,decodeCalls:window.__qa.decodeCalls,selected:document.body.innerText.includes('Item Terpilih (drug)'),cameraRestartButton:Array.from(document.querySelectorAll('button')).some(button=>button.textContent.includes('Aktifkan Kamera'))}))
  assert.ok(result.matches.some(call=>call.id==='drug-a'&&call.type==='drug'),'QR payload was dispatched through matchStockItem with parsed item ID/type')
  assert.ok(result.decodeCalls>0,'mock QR decoder ran against a camera frame')
  assert.equal(result.selected,true,'matched scan updates the selected-item state')
  assert.equal(result.cameraRestartButton,true,'successful QR dispatch closes the camera mode')
  evidence.checks.push({criterion:'QR frame is decoded and dispatched through the current scan handler',status:'PASS',detail:`Decoded frame count=${result.decodeCalls}; match call included ID drug-a/type drug; selected item rendered=${result.selected}; camera stopped after match=${result.cameraRestartButton}.`})
})

test('manual query filters the fixture list and selecting a result updates the form', async t=>{
  const {page,pageErrors}=await openScanner(t)
  await page.getByRole('button',{name:'Manual'}).click()
  const input=page.getByPlaceholder('Taip Kod Item atau Nama...')
  await input.fill('gauze')
  const result=page.getByRole('button').filter({hasText:'Sterile Gauze 10 cm'})
  await result.waitFor({state:'visible',timeout:2500})
  const filteredText=await result.innerText()
  assert.match(filteredText,/GAUZE-10/)
  assert.equal(await page.getByRole('button').filter({hasText:'Paracetamol 500 mg'}).count(),0,'nonmatching item is filtered out')
  await result.click()
  try { await page.getByText('Item Terpilih (non_drug)',{exact:true}).waitFor({state:'visible',timeout:2500}) }
  catch(error) {
    const state=await page.evaluate(()=>({body:document.body.innerText.slice(-800),bodyHtml:document.body.innerHTML.slice(-1200),rootHtml:document.querySelector('#root')?.innerHTML.slice(-1200)}))
    evidence.checks.push({criterion:'Manual list filters matching item and result selection updates form state',status:'FAIL',detail:`Search filtering rendered the fixture result and excluded the nonmatching item. Clicking it caused a render failure before selected state could be observed. Page errors=${JSON.stringify(pageErrors)}; root DOM=${JSON.stringify(state.rootHtml)}.`})
    throw new Error(`Manual result did not select item; state=${JSON.stringify(state)}; pageErrors=${JSON.stringify(pageErrors)}; cause=${error.message}`)
  }
  const selected=await page.evaluate(()=>({selected:document.body.innerText.includes('Item Terpilih (non_drug)'),calls:window.__qa.getUserMediaCalls.length,stops:window.__qa.trackStopCalls,query:document.querySelector('input[placeholder="Taip Kod Item atau Nama..."]')?.value}))
  assert.equal(selected.selected,true,'selecting a matching manual result selects the fixture item')
  assert.equal(selected.query,'','manual result selection clears the search query')
  evidence.checks.push({criterion:'Manual list filters matching item and result selection updates form state',status:'PASS',detail:`Search “gauze” rendered ${filteredText.replaceAll('\n',' / ')}; Paracetamol excluded; selected non-drug item rendered=${selected.selected}; input cleared=${selected.query===''}; mocked camera starts=${selected.calls}, track stops=${selected.stops}.`})
})
