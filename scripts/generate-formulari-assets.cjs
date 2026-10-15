const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const sourcePath = path.join(root, 'src/modules/myformulari/data/officialFukkmData.json')
const assetPath = path.join(root, 'public/formulari/formulari-data.json')
const servicePath = path.join(root, 'src/modules/myformulari/services/formulariAssetService.ts')
const sourceBytes = fs.readFileSync(sourcePath)
const records = JSON.parse(sourceBytes.toString('utf8'))

if (!Array.isArray(records) || records.some(record => !record || typeof record !== 'object' || Array.isArray(record))) {
  throw new Error('The official formulary source must be an array of records.')
}

const sourceHash = crypto.createHash('sha256').update(sourceBytes).digest('hex')
const assetContents = `${JSON.stringify({ sourceHash, records })}\n`
const serviceContents = fs.readFileSync(servicePath, 'utf8')
const versionDeclaration = /^export const FORMULARI_ASSET_VERSION = '[a-f0-9]{64}'$/m

if (!versionDeclaration.test(serviceContents)) {
  throw new Error('The formulary service version declaration is missing or has an invalid format.')
}

const updatedService = serviceContents.replace(versionDeclaration, `export const FORMULARI_ASSET_VERSION = '${sourceHash}'`)

function writeIfChanged(filePath, contents) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === contents) return false
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, contents)
  return true
}

writeIfChanged(assetPath, assetContents)
writeIfChanged(servicePath, updatedService)
process.stdout.write(`Generated formulary asset: ${records.length} records, source SHA-256 ${sourceHash}, ${Buffer.byteLength(assetContents)} bytes.\n`)
