import { StockDisruptionRecord, DisruptionSummaryStats } from '../types/stockDisruptionTypes'
import { LAWAS_STOCK_DISRUPTIONS_DEFAULT } from '../data/stockDisruptionDefaultData'

const STORAGE_KEY_LAWAS_STOCK_DISRUPTIONS = 'myformulari_lawas_stock_disruptions_v2_real_data_only'

/**
 * Get all stock disruptions for Hospital Lawas (Real Data Only)
 */
export function getAllStockDisruptions(): StockDisruptionRecord[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_LAWAS_STOCK_DISRUPTIONS)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed to read Hospital Lawas stock disruptions from cache', err)
  }

  // Initialize with real empty default
  try {
    localStorage.setItem(STORAGE_KEY_LAWAS_STOCK_DISRUPTIONS, JSON.stringify(LAWAS_STOCK_DISRUPTIONS_DEFAULT))
  } catch (e) {
    // ignore
  }

  return LAWAS_STOCK_DISRUPTIONS_DEFAULT
}

/**
 * Save disruptions to localStorage
 */
export function saveStockDisruptions(data: StockDisruptionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAWAS_STOCK_DISRUPTIONS, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save Hospital Lawas stock disruptions to cache', err)
  }
}

/**
 * Get single disruption by ID
 */
export function getStockDisruptionById(id: string): StockDisruptionRecord | undefined {
  const all = getAllStockDisruptions()
  return all.find(d => d.id === id)
}

/**
 * Add a new stock disruption record (Drug or Non-Drug)
 */
export function addStockDisruption(record: Omit<StockDisruptionRecord, 'id' | 'lastUpdated'>): StockDisruptionRecord {
  const all = getAllStockDisruptions()
  const prefix = record.itemType === 'NON_DRUG' ? 'DISRUPT-NONDRUG-LWS' : 'DISRUPT-DRUG-LWS'
  const newRecord: StockDisruptionRecord = {
    ...record,
    id: `${prefix}-${String(all.length + 1).padStart(3, '0')}`,
    lastUpdated: new Date().toISOString().split('T')[0]
  }

  const updated = [newRecord, ...all]
  saveStockDisruptions(updated)
  return newRecord
}

/**
 * Update an existing stock disruption
 */
export function updateStockDisruption(id: string, updates: Partial<StockDisruptionRecord>): StockDisruptionRecord | null {
  const all = getAllStockDisruptions()
  const index = all.findIndex(d => d.id === id)
  if (index === -1) return null

  const updatedRecord: StockDisruptionRecord = {
    ...all[index],
    ...updates,
    lastUpdated: new Date().toISOString().split('T')[0]
  }

  all[index] = updatedRecord
  saveStockDisruptions(all)
  return updatedRecord
}

/**
 * Delete a disruption record
 */
export function deleteStockDisruption(id: string): boolean {
  const all = getAllStockDisruptions()
  const filtered = all.filter(d => d.id !== id)
  if (filtered.length === all.length) return false

  saveStockDisruptions(filtered)
  return true
}

/**
 * Reset data to factory default (Empty for Hospital Lawas)
 */
export function resetDisruptionsToDefault(): StockDisruptionRecord[] {
  try {
    localStorage.setItem(STORAGE_KEY_LAWAS_STOCK_DISRUPTIONS, JSON.stringify(LAWAS_STOCK_DISRUPTIONS_DEFAULT))
  } catch (e) {}
  return LAWAS_STOCK_DISRUPTIONS_DEFAULT
}

/**
 * Calculate KPI summary stats for Hospital Lawas active disruptions
 */
export function calculateDisruptionStats(disruptions: StockDisruptionRecord[]): DisruptionSummaryStats {
  const active = disruptions.filter(d => d.isActiveDisruption)
  const totalActive = active.length

  const drugs = active.filter(d => d.itemType === 'DRUG' || !d.itemType).length
  const nonDrugs = active.filter(d => d.itemType === 'NON_DRUG').length

  const critical = active.filter(d => d.severity === 'CRITICAL_OUT_OF_STOCK').length
  const lowBuffer = active.filter(d => d.severity === 'LOW_STOCK_BUFFER').length
  const transit = active.filter(d => d.severity === 'TRANSIT_DELAY').length
  const quota = active.filter(d => d.severity === 'QUOTA_DEPLETED').length

  const totalDays = active.reduce((acc, d) => acc + (d.estimatedDaysToStable || 0), 0)
  const avgDays = totalActive > 0 ? Math.round(totalDays / totalActive) : 0

  const coveredCount = active.filter(d => d.alternatives && d.alternatives.length > 0).length
  const altCoverage = totalActive > 0 ? Math.round((coveredCount / totalActive) * 100) : 100

  return {
    totalActiveDisruptions: totalActive,
    drugDisruptionsCount: drugs,
    nonDrugDisruptionsCount: nonDrugs,
    criticalOutOfStockCount: critical,
    lowStockBufferCount: lowBuffer,
    transitDelayCount: transit,
    quotaDepletedCount: quota,
    averageDaysToStable: avgDays,
    alternativesCoveragePercent: altCoverage
  }
}
