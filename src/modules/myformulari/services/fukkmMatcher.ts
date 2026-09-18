import { DrugEntry } from '../types/formulariTypes'
import { FacilityDrugItem } from '@/services/pharmacy/facilityDrugInventoryService'

/**
 * Normalizes drug names for clinical matching between facility inventory & FUKKM database
 */
function cleanDrugString(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/opthalmic/g, 'ophthalmic')
    .replace(/salicylazosulfapyridine/g, 'salicylazosulphapyridine')
    .replace(/tablet\/kapsul|kapsul\/tablet|tablet|kapsul|capsule|capsules/gi, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\(.*?\)/g, '')
    .replace(/bp\/usp|bp\/ep/gi, ' ')
    .replace(/[^a-z0-9\s/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Finds the best matching FUKKM DrugEntry for a given facility drug item.
 * Handles slight spelling variations (e.g. opthalmic vs ophthalmic),
 * spacing in strengths (e.g. 4 mg / ml vs 4 mg/ml),
 * synonym names, and dosage form tags.
 */
export function findBestFukkmMatch(
  facilityDrug: FacilityDrugItem,
  fukkmCatalog: DrugEntry[]
): DrugEntry | null {
  if (!facilityDrug || !fukkmCatalog.length) return null

  const name = facilityDrug.drug_name || ''
  const generic = facilityDrug.generic_name || ''
  const code = (facilityDrug.drug_code || (facilityDrug as any).item_code || '').trim().toLowerCase()

  // 1. Check direct MOH drug code match
  if (code) {
    const byCode = fukkmCatalog.find(f => (f.mohDrugCode || '').toLowerCase().trim() === code)
    if (byCode) return byCode
  }

  const target1 = cleanDrugString(generic || name)
  const target2 = cleanDrugString(name)

  // 2. Direct string match
  const directMatch = fukkmCatalog.find(f => {
    const fn = cleanDrugString(f.genericName)
    return fn === target1 || fn === target2 || target1.includes(fn) || fn.includes(target1)
  })
  if (directMatch) return directMatch

  // 3. Keyword / Tokenized Match
  const stopWords = new Set([
    'tablet', 'tablets', 'kapsul', 'capsule', 'capsules',
    'injection', 'solution', 'suspension', 'syrup', 'sirap',
    'drops', 'eye', 'ear', 'cream', 'ointment', 'gel', 'inhaler',
    'pack', 'dose', 'mg', 'ml', 'g', 'mcg', 'with', 'preservative',
    'coated', 'film', 'powder', 'granules'
  ])

  const getKeywords = (str: string) =>
    cleanDrugString(str)
      .split(' ')
      .map(w => w.replace(/[0-9/]/g, ''))
      .filter(w => w.length > 2 && !stopWords.has(w))

  const k1 = getKeywords(target1)
  const k2 = getKeywords(target2)
  const keywords = Array.from(new Set([...k1, ...k2]))

  if (keywords.length > 0) {
    let bestScore = 0
    let bestMatch: DrugEntry | null = null

    for (const f of fukkmCatalog) {
      const fKeywords = getKeywords(f.genericName)
      const fClean = cleanDrugString(f.genericName)
      let score = 0

      for (const kw of keywords) {
        if (fKeywords.includes(kw) || fClean.includes(kw)) {
          score++
        }
      }

      if (score > bestScore && score >= Math.min(1, keywords.length)) {
        bestScore = score
        bestMatch = f
      }
    }

    if (bestMatch) return bestMatch
  }

  return null
}

/**
 * Synthesizes a full DrugEntry from a FacilityDrugItem if no exact match in FUKKM catalogue
 */
export function synthesizeDrugEntryFromFacility(facilityDrug: FacilityDrugItem): DrugEntry {
  const name = facilityDrug.drug_name || 'Ubat Fasiliti'
  const generic = facilityDrug.generic_name || name
  const prescriber = ((facilityDrug as any).prescriber_category || 'C') as any
  const vote = (facilityDrug.procurement_vote || 'APPL').toUpperCase() as any

  return {
    id: facilityDrug.id || `DRUG-FACILITY-${Date.now()}`,
    genericName: generic,
    brandNames: [name],
    mohDrugCode: facilityDrug.drug_code || (facilityDrug as any).item_code || 'MOH-LAWAS',
    atcCode: (facilityDrug as any).atc_code || 'N/A',
    atcCategory: 'Formulari Fasiliti Hospital Lawas',
    therapeuticClass: (facilityDrug as any).item_sub_class || (facilityDrug as any).item_group || 'Formulari Am Hospital Lawas',
    prescriberCategory: prescriber,
    poisonCategory: 'Group B',
    skimPerolehan: vote,
    dosageForms: [facilityDrug.dosage_form || 'Dosage Form'],
    strengths: [facilityDrug.strength || 'Standard Strength'],
    indications: [
      `Indikasi terapeutik dan klinikal berdaftar di bawah pengurusan Farmasi Hospital Lawas bagi ${generic}.`,
      'Sila rujuk protokol klinikal hospital atau Pakar Perubatan bertugas untuk panduan preskripsi spesifik.'
    ],
    contraindications: [
      'Hipersensitiviti atau alahan terhadap bahan aktif atau komponen ubat ini.',
      'Sila semak sejarah alahan pesakit sebelum memulakan rawatan.'
    ],
    standardDosage: {
      adult: 'Dos mengikut indikasi klinikal pesakit dan saranan doktor bertugas / arahan pengilang.',
      pediatric: 'Dos pediatrik mengikut berat badan (mg/kg) dan nasihat Pakar Kanak-kanak.',
      elderlyOrRenal: 'Laraskan dos mengikut fungsi ginjal (CrCl) dan pemantauan klinikal rapi.'
    },
    administrationRoutes: [facilityDrug.dosage_form?.toLowerCase().includes('inject') ? 'IV / IM' : 'Oral'],
    sideEffects: ['Kesan sampingan biasa mengikut kelas farmakologi ubat. Pantau tindak balas alahan.'],
    cautionsAndWarnings: [
      'Gunakan dengan berwaspada pada pesakit warga emas atau pesakit yang mengalami gangguan fungsi organ utama.',
      `Simpan mengikut panduan suhu stor yang ditetapkan: ${facilityDrug.storage_conditions || 'Suhu bilik < 25°C'}.`
    ],
    isHAM: false,
    isLASA: false,
    interactions: [],
    reconstitution: { isApplicable: false },
    dilution: {
      isApplicable: false,
      compatibleDiluents: [],
      incompatibleDiluents: [],
      standardDilution: { doseRange: '', volume: '', finalConcentration: '', route: 'Standard', infusionDuration: '' },
      ySiteCompatibility: { compatible: [], incompatible: [], requiresSeparateLine: false },
      monitoringParameters: ['Tanda vital pesakit', 'Tindak balas terapeutik']
    },
    shelfLife: {
      dosageCategory: facilityDrug.dosage_form || 'Farmaseutikal',
      intactShelfLife: 'Rujuk tarikh luput pada bungkusan pengeluar',
      storageConditions: {
        temperature: facilityDrug.storage_conditions || 'Room Temperature (15-30°C)',
        protectFromLight: true,
        protectFromMoisture: true,
        specialStorageNote: `Lokasi Stor: ${facilityDrug.location || 'Stor Utama Farmasi'}`
      },
      multiDoseVialPolicy: 'Gunakan mengikut tatacara kawalan infeksi'
    },
    quota: {
      monthlyQuota: 1000,
      quotaUsed: 500,
      quotaRemaining: 500,
      unit: facilityDrug.unit_of_measure || 'Unit',
      lowStockThreshold: facilityDrug.min_buffer_level || 20,
      isLowStock: (facilityDrug.facility_stock ?? 0) < (facilityDrug.min_buffer_level ?? 20),
      isCriticalShortage: (facilityDrug.facility_stock ?? 0) <= 0,
      estimatedRunOutDays: 30,
      lastRestockedDate: new Date().toISOString().split('T')[0],
      bufferStockLevel: facilityDrug.min_buffer_level || 20
    },
    alternativeDrugs: [],
    lastUpdated: new Date().toISOString().split('T')[0],
    verifiedBy: 'Hospital Lawas Formulary Registry'
  }
}

