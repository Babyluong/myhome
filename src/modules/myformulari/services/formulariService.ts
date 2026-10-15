import type { DrugEntry, PrescriberCategory, HAMCategory, DrugInteraction } from '../types/formulariTypes'
import { buildFormulariDatabase } from '../data/formulariDatabase'
import { KKM_LASA_MASTER_REGISTRY, KkmLasaEntry, getLasaCategories } from '../data/lasaDatabase'
import { FORMULARI_ASSET_VERSION, FormulariAssetError, loadOfficialFormulariRecords } from './formulariAssetService'

let formulariCatalogPromise: Promise<DrugEntry[]> | null = null

export interface FormulariSummaryStats {
  totalDrugs: number
  hamCount: number
  lasaCount: number
  lowStockCount: number
  antimicrobialCount: number
  ivDilutionCount: number
}

async function loadFormulariCatalog(): Promise<DrugEntry[]> {
  if (!formulariCatalogPromise) {
    formulariCatalogPromise = loadOfficialFormulariRecords()
      .then(records => buildFormulariDatabase(records))
      .catch((error: unknown) => {
        formulariCatalogPromise = null
        if (error instanceof FormulariAssetError) throw error
        throw new FormulariAssetError('The formulary data could not be prepared. Reload the app to retry.', 'invalid_asset', false)
      })
  }

  return formulariCatalogPromise
}

/**
 * Get all drugs with localStorage fallback & cache invalidation support
 */
export function getAllFormulariDrugs(): Promise<DrugEntry[]> {
  return loadFormulariCatalog()
}

/**
 * Get single drug by ID
 */
export async function getDrugById(id: string): Promise<DrugEntry | undefined> {
  const all = await loadFormulariCatalog()
  return all.find(d => d.id === id || d.mohDrugCode === id)
}

/**
 * Filter drugs with rich clinical search
 */
export async function searchDrugs(
  query: string,
  filters: {
    prescriberCategory?: PrescriberCategory | 'ALL'
    hamOnly?: boolean
    hamCategory?: HAMCategory | 'ALL'
    lasaOnly?: boolean
    antimicrobialOnly?: boolean
    lowStockOnly?: boolean
    therapeuticClass?: string | 'ALL'
    skimPerolehan?: string | 'ALL'
  } = {}
): Promise<DrugEntry[]> {
  const all = await loadFormulariCatalog()
  const q = query.trim().toLowerCase()

  return all.filter(drug => {
    // Text search
    if (q) {
      const matchGeneric = drug.genericName.toLowerCase().includes(q)
      const matchBrand = drug.brandNames.some(b => b.toLowerCase().includes(q))
      const matchCode = (drug.mohDrugCode || '').toLowerCase().includes(q)
      const matchAtc = drug.atcCode.toLowerCase().includes(q)
      const matchClass = drug.therapeuticClass.toLowerCase().includes(q)
      const matchIndication = drug.indications.some(ind => ind.toLowerCase().includes(q))
      
      if (!matchGeneric && !matchBrand && !matchCode && !matchAtc && !matchClass && !matchIndication) {
        return false
      }
    }

    // Prescriber Category
    if (filters.prescriberCategory && filters.prescriberCategory !== 'ALL') {
      if (drug.prescriberCategory !== filters.prescriberCategory) return false
    }

    // HAM
    if (filters.hamOnly && !drug.isHAM) return false
    if (filters.hamCategory && filters.hamCategory !== 'ALL') {
      if (drug.hamCategory !== filters.hamCategory) return false
    }

    // LASA
    if (filters.lasaOnly && !drug.isLASA) return false

    // Antimicrobial
    if (filters.antimicrobialOnly && !drug.antimicrobial?.isAntimicrobial) return false

    // Low stock
    if (filters.lowStockOnly && !drug.quota.isLowStock && !drug.quota.isCriticalShortage) return false

    // Therapeutic class
    if (filters.therapeuticClass && filters.therapeuticClass !== 'ALL') {
      if (!drug.therapeuticClass.toLowerCase().includes(filters.therapeuticClass.toLowerCase())) return false
    }

    // Skim Perolehan
    if (filters.skimPerolehan && filters.skimPerolehan !== 'ALL') {
      if (drug.skimPerolehan !== filters.skimPerolehan) return false
    }

    return true
  })
}

function extractSubstanceTokens(name: string): string[] {
  const cleaned = name
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(mg|mcg|g|ml|iu|%|vial|ampoule|tablet|capsule)\b/g, ' ')
    .replace(/[^\w\s-]/g, ' ')
  
  const ignore = [
    'tablet', 'injection', 'infusion', 'capsule', 'syrup', 'suspension', 'cream',
    'ointment', 'solution', 'sodium', 'potassium', 'calcium', 'hydrochloride',
    'powder', 'acetate', 'citrate', 'sulfate', 'sulphate', 'disodium', 'coated',
    'extended', 'release', 'film-coated', 'soluble', 'dispersible', 'oral',
    'ophthalmic', 'otic', 'rectal', 'topical', 'intravenous', 'intramuscular'
  ]

  return cleaned
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 4 && !ignore.includes(t))
}

/**
 * Check drug-drug interactions between a list of drugs
 */
export async function checkDrugInteractions(drugIds: string[]): Promise<{
  drugA: DrugEntry
  drugB: DrugEntry
  interaction: DrugInteraction
}[]> {
  const all = await loadFormulariCatalog()
  const selected = all.filter(d => drugIds.includes(d.id))
  const results: { drugA: DrugEntry; drugB: DrugEntry; interaction: DrugInteraction }[] = []

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const drugA = selected[i]
      const drugB = selected[j]

      const tokensB = extractSubstanceTokens(drugB.genericName).concat(
        (drugB.brandNames || []).flatMap(b => extractSubstanceTokens(b))
      )
      const tokensA = extractSubstanceTokens(drugA.genericName).concat(
        (drugA.brandNames || []).flatMap(b => extractSubstanceTokens(b))
      )

      // Check if drugA lists interactions with drugB
      for (const inter of drugA.interactions) {
        const isFukkmGeneral = inter.interactingDrug.includes('FUKKM') || inter.interactingDrug.includes('CYP450')
        const targetSearch = (isFukkmGeneral ? inter.effect : `${inter.interactingDrug} ${inter.effect}`).toLowerCase()

        const hasMatch =
          inter.interactingDrug.toLowerCase().includes(drugB.genericName.toLowerCase()) ||
          drugB.genericName.toLowerCase().includes(inter.interactingDrug.toLowerCase()) ||
          (tokensB.length > 0 && tokensB.some(tok => targetSearch.includes(tok)))

        if (hasMatch) {
          results.push({ drugA, drugB, interaction: inter })
        }
      }

      // Check if drugB lists interactions with drugA
      for (const inter of drugB.interactions) {
        const isFukkmGeneral = inter.interactingDrug.includes('FUKKM') || inter.interactingDrug.includes('CYP450')
        const targetSearch = (isFukkmGeneral ? inter.effect : `${inter.interactingDrug} ${inter.effect}`).toLowerCase()

        const hasMatch =
          inter.interactingDrug.toLowerCase().includes(drugA.genericName.toLowerCase()) ||
          drugA.genericName.toLowerCase().includes(inter.interactingDrug.toLowerCase()) ||
          (tokensA.length > 0 && tokensA.some(tok => targetSearch.includes(tok)))

        if (hasMatch) {
          if (!results.some(r => (r.drugA.id === drugB.id && r.drugB.id === drugA.id) || (r.drugA.id === drugA.id && r.drugB.id === drugB.id))) {
            results.push({ drugA: drugB, drugB: drugA, interaction: inter })
          }
        }
      }
    }
  }

  return results
}

/**
 * Summary stats for hub & dashboard
 */
export async function getFormulariSummaryStats(): Promise<FormulariSummaryStats> {
  const all = await loadFormulariCatalog()
  const totalDrugs = all.length
  const hamCount = all.filter(d => d.isHAM).length
  const lasaCount = all.filter(d => d.isLASA).length
  const lowStockCount = all.filter(d => d.quota.isLowStock || d.quota.isCriticalShortage).length
  const antimicrobialCount = all.filter(d => d.antimicrobial?.isAntimicrobial).length
  const ivDilutionCount = all.filter(d => d.dilution?.isApplicable).length

  return {
    totalDrugs,
    hamCount,
    lasaCount,
    lowStockCount,
    antimicrobialCount,
    ivDilutionCount
  }
}

/**
 * Get full KKM LASA Master Registry
 */
export function getLasaMasterRegistry(): KkmLasaEntry[] {
  return KKM_LASA_MASTER_REGISTRY
}

export { KKM_LASA_MASTER_REGISTRY, getLasaCategories, type KkmLasaEntry }
export { FormulariAssetError, FORMULARI_ASSET_VERSION }

