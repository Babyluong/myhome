import { PaediatricDrugPreset } from '../types/paediatricDoseTypes'
import { DEFAULT_KKM_PAEDIATRIC_PRESETS } from '../data/paediatricDoseDefaultData'

const STORAGE_KEY_CUSTOM_PRESETS = 'home_myformulari_paediatric_presets_v2.0'

/**
 * Get custom hospital presets stored in localStorage
 */
export function getCustomHospitalPresets(): PaediatricDrugPreset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PRESETS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed to load custom paediatric presets from localStorage:', err)
  }
  return []
}

/**
 * Get all paediatric presets (Default KKM Standard + Custom Hospital Presets)
 */
export function getAllPaediatricPresets(): PaediatricDrugPreset[] {
  const customPresets = getCustomHospitalPresets()
  return [...customPresets, ...DEFAULT_KKM_PAEDIATRIC_PRESETS]
}

/**
 * Save or update a custom hospital preset in localStorage
 */
export function saveCustomHospitalPreset(preset: PaediatricDrugPreset): PaediatricDrugPreset[] {
  const currentCustom = getCustomHospitalPresets()
  
  const formattedPreset: PaediatricDrugPreset = {
    ...preset,
    isCustom: true,
    source: 'HOSPITAL_CUSTOM',
    updatedAt: new Date().toISOString()
  }

  const existingIndex = currentCustom.findIndex(p => p.id === preset.id)
  let updatedList: PaediatricDrugPreset[]

  if (existingIndex >= 0) {
    updatedList = [...currentCustom]
    updatedList[existingIndex] = formattedPreset
  } else {
    updatedList = [formattedPreset, ...currentCustom]
  }

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PRESETS, JSON.stringify(updatedList))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('paediatric_presets_updated', { detail: updatedList }))
    }
  } catch (err) {
    console.error('Failed to save custom paediatric preset:', err)
    throw new Error('Gagal menyimpan protokol hospital dalam storan pelayar.')
  }

  return updatedList
}

/**
 * Delete a custom hospital preset by ID
 */
export function deleteCustomHospitalPreset(presetId: string): PaediatricDrugPreset[] {
  const currentCustom = getCustomHospitalPresets()
  const updatedList = currentCustom.filter(p => p.id !== presetId)

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PRESETS, JSON.stringify(updatedList))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('paediatric_presets_updated', { detail: updatedList }))
    }
  } catch (err) {
    console.error('Failed to delete custom paediatric preset:', err)
    throw new Error('Gagal memadam protokol hospital.')
  }

  return updatedList
}

/**
 * Reset all custom hospital presets (reverts to KKM default list only)
 */
export function resetCustomHospitalPresets(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_PRESETS)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('paediatric_presets_updated', { detail: [] }))
    }
  } catch (err) {
    console.error('Failed to reset custom paediatric presets:', err)
  }
}

/**
 * Export custom hospital presets as downloadable JSON
 */
export function exportHospitalProtocolsJson(): string {
  const customPresets = getCustomHospitalPresets()
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    version: '2.0',
    type: 'PAEDIATRIC_HOSPITAL_PROTOCOLS',
    totalCustomProtocols: customPresets.length,
    protocols: customPresets
  }, null, 2)
}

/**
 * Import custom hospital presets from JSON string
 */
export function importHospitalProtocolsJson(jsonString: string): { count: number } {
  try {
    const data = JSON.parse(jsonString)
    const protocolsToImport: PaediatricDrugPreset[] = Array.isArray(data) 
      ? data 
      : Array.isArray(data.protocols) 
        ? data.protocols 
        : null

    if (!protocolsToImport) {
      throw new Error('Format JSON tidak sah. Data mesti mengandungi senarai protokol.')
    }

    const currentCustom = getCustomHospitalPresets()
    const mergedMap = new Map<string, PaediatricDrugPreset>()

    // Add existing
    currentCustom.forEach(p => mergedMap.set(p.id, p))

    // Merge new
    let validImportCount = 0
    protocolsToImport.forEach(p => {
      if (p && p.drugName && Array.isArray(p.indications) && p.indications.length > 0) {
        const id = p.id || `custom-hosp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        mergedMap.set(id, {
          ...p,
          id,
          isCustom: true,
          source: 'HOSPITAL_CUSTOM',
          updatedAt: new Date().toISOString()
        })
        validImportCount++
      }
    })

    const newCustomList = Array.from(mergedMap.values())
    localStorage.setItem(STORAGE_KEY_CUSTOM_PRESETS, JSON.stringify(newCustomList))

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('paediatric_presets_updated', { detail: newCustomList }))
    }

    return { count: validImportCount }
  } catch (err: any) {
    console.error('Failed to import hospital protocols:', err)
    throw new Error(err.message || 'Gagal mengimport protokol hospital daripada fail JSON.')
  }
}
