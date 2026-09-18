export type PaediatricDoseCalculationMode = 'daily_divided' | 'per_dose'

export type PaediatricRoute = 'Oral' | 'IV' | 'Oral/IV' | 'IM' | 'Inhalation' | 'Rectal' | 'Topical' | 'SC'

export interface PaediatricFormulation {
  label: string
  mgPerMl: number
  isDefault?: boolean
}

export interface PaediatricIndication {
  id: string
  name: string
  doseFormula: string // e.g. "40 - 50 mg/kg/hari dibahagi TDS" or "20 mg/kg/dos Q8H"
  calculationMode: PaediatricDoseCalculationMode // 'daily_divided' = dose is daily mg/kg divided into N doses; 'per_dose' = dose is single dose mg/kg given every interval
  doseMgPerKg: number // the numerical dose used for calculation (e.g. 45 or 20)
  doseRangeLabel?: string // e.g. "40 - 50 mg/kg/hari" or "15 - 20 mg/kg/dos"
  dividedTimesPerDay: number // 1 = OD, 2 = BD, 3 = TDS, 4 = QID, 6 = Q4H, etc.
  frequencyLabel: string // e.g. "TDS (Setiap 8 Jam)", "Q8H (Setiap 8 Jam)", "Q6H", "OD"
  maxDailyDoseMg: number
  maxSingleDoseMg: number
  standardFormulations?: PaediatricFormulation[]
  clinicalAdvice: string
}

export interface PaediatricDrugPreset {
  id: string
  drugName: string
  category: string
  route: PaediatricRoute
  isCustom?: boolean
  hospitalName?: string
  departmentName?: string
  source: 'KKM_STANDARD' | 'HOSPITAL_CUSTOM'
  updatedAt?: string
  indications: PaediatricIndication[]
}

export interface ManualCalculationState {
  weightKg: number | ''
  drugName: string
  calculationMode: PaediatricDoseCalculationMode
  doseMgPerKg: number | ''
  frequencyKey: string // 'OD' | 'BD' | 'TDS' | 'QID' | 'Q4H' | 'Q8H' | 'Q12H' | 'STAT' | 'PRN'
  dividedTimesPerDay: number
  frequencyLabel: string
  formulationType: 'preset' | 'custom'
  selectedPresetFormulationIndex: number
  customStrengthMg: number | ''
  customStrengthMl: number | ''
  maxSingleDoseMg: number | ''
  maxDailyDoseMg: number | ''
  notes: string
}
