const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '../src/modules/myprepacking/data/kkmGalenicalMasterDatabase.ts')
let content = fs.readFileSync(filePath, 'utf8')

// Regex to match each individual item block { ... }
const itemBlockRegex = /\{(\s*"item_code":\s*"(EXT-GAEX-[^"]+)"[\s\S]*?)\}(,?\s*)/g

let fixedSalicylicCount = 0

content = content.replace(itemBlockRegex, (fullMatch, body, code, comma) => {
  if (code.startsWith('EXT-GAEX-27') || code.startsWith('EXT-GAEX-28')) {
    if (body.includes('Coal Tar 1%, Salicylic Acid 2%') && !body.includes('item_name": "Coal Tar')) {
      const nameMatch = body.match(/"item_name":\s*"([^"]+)"/)
      const dosageMatch = body.match(/"dosage_form":\s*"([^"]+)"/)
      const strengthMatch = body.match(/"strength":\s*"([^"]+)"/)

      const itemName = nameMatch ? nameMatch[1] : ''
      const dosage = dosageMatch ? dosageMatch[1].toLowerCase() : 'ointment'
      const strength = strengthMatch ? strengthMatch[1].trim() : '2 %'

      let baseStr = 'Pangkalan Salap Parafin BP (White Soft Paraffin BP / Liquid Paraffin BP Base) q.s. ad 100g'
      if (dosage === 'cream') {
        baseStr = 'Pangkalan Krim Berair BP (Aqueous Cream BP Base / Cetomacrogol Cream BP) q.s. ad 100g'
      } else if (dosage === 'solution' || dosage === 'lotion') {
        baseStr = 'Pelarut Topikal Rasmi KKM (Industrial Methylated Spirit / Purified Water BP) q.s. ad 100mL'
      }

      const trueFormula = `Salicylic Acid BP ${strength}, ${baseStr}`
      const trueIndication = `Rawatan keratolitik topikal untuk hiperkeratosis, ekzema bersisik, psoriasis & penanggalan sisik keratin (${strength})`

      let updatedBody = body
      updatedBody = updatedBody.replace(/"indications":\s*"[^"]+"/, `"indications": "${trueIndication}"`)
      updatedBody = updatedBody.replace(/"ingredients_formula":\s*"[^"]+"/, `"ingredients_formula": "${trueFormula}"`)
      fixedSalicylicCount++
      return `{${updatedBody}}${comma}`
    }
  }
  return fullMatch
})

fs.writeFileSync(filePath, content, 'utf8')
console.log(`Successfully updated ${fixedSalicylicCount} Salicylic items in kkmGalenicalMasterDatabase.ts`)
