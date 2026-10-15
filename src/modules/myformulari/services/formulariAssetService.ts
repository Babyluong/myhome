import type { DrugEntry } from '../types/formulariTypes'

export const FORMULARI_ASSET_VERSION = '18b05ee3fa4a506180a08f82fe8ddd3de13cf6c8d4d9d423ff213cc91c72c717'

export type FormulariAssetErrorCode = 'unavailable' | 'invalid_asset' | 'version_mismatch'

export class FormulariAssetError extends Error {
  constructor(
    message: string,
    public readonly code: FormulariAssetErrorCode,
    public readonly retryable: boolean,
  ) {
    super(message)
    this.name = 'FormulariAssetError'
  }
}

interface FormulariAssetEnvelope {
  sourceHash: string
  records: DrugEntry[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFormulariAssetEnvelope(value: unknown): value is FormulariAssetEnvelope {
  return isRecord(value)
    && typeof value.sourceHash === 'string'
    && Array.isArray(value.records)
}

function isDrugEntry(value: unknown): value is DrugEntry {
  if (!isRecord(value)) return false
  return typeof value.id === 'string'
    && typeof value.genericName === 'string'
    && Array.isArray(value.brandNames)
    && Array.isArray(value.dosageForms)
    && Array.isArray(value.strengths)
    && Array.isArray(value.indications)
    && Array.isArray(value.contraindications)
    && Array.isArray(value.administrationRoutes)
    && Array.isArray(value.sideEffects)
    && Array.isArray(value.cautionsAndWarnings)
    && Array.isArray(value.interactions)
    && isRecord(value.standardDosage)
    && isRecord(value.shelfLife)
    && isRecord(value.quota)
}

export async function loadOfficialFormulariRecords(): Promise<DrugEntry[]> {
  const assetPath = `${import.meta.env.BASE_URL}formulari/formulari-data.json?v=${FORMULARI_ASSET_VERSION}`
  let response: Response
  try {
    response = await fetch(assetPath, {
      cache: 'no-cache',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new FormulariAssetError('The formulary data is unavailable. Check the connection and retry.', 'unavailable', true)
  }

  if (!response.ok) {
    throw new FormulariAssetError('The formulary data is unavailable. Retry or reload the app.', 'unavailable', response.status >= 500)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new FormulariAssetError('The formulary data could not be read. Reload the app to retry.', 'invalid_asset', false)
  }

  if (!isFormulariAssetEnvelope(payload)) {
    throw new FormulariAssetError('The formulary data has an invalid format. Reload the app to retry.', 'invalid_asset', false)
  }
  if (payload.sourceHash !== FORMULARI_ASSET_VERSION) {
    throw new FormulariAssetError('The formulary data version does not match this app. Reload to get the matching version.', 'version_mismatch', false)
  }
  if (!payload.records.every(isDrugEntry)) {
    throw new FormulariAssetError('The formulary data is incomplete. Reload the app to retry.', 'invalid_asset', false)
  }

  return payload.records
}
