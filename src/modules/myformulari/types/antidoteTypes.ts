// src/modules/myformulari/types/antidoteTypes.ts

export type KKMStockTier = 'List A' | 'List B' | 'List C'

export type UrgencyLevel = 
  | 'IMMEDIATE (<15-30 mins)' 
  | 'URGENT (<2 hours)' 
  | 'REGIONAL DEPOT (<4-6 hours)'

export type ToxidromeCategory =
  | 'Anticoagulants & Hematology'
  | 'Analgesics & Antipyretics'
  | 'Sedatives, Opioids & CNS'
  | 'Cardiovascular & Inotropes'
  | 'Pesticides & Agrochemicals'
  | 'Toxic Alcohols & Solvents'
  | 'Cellular Toxins & Gases'
  | 'Oncology & Antimicrobials'
  | 'Local Anaesthetics & Lipophilic'
  | 'Heavy Metals & Chelators'
  | 'Venomous Bites & Envenomation'
  | 'Endocrine & Metabolic'
  | 'Plant & Mushroom Toxins'

export interface AntidoteDosing {
  adultInitial: string
  adultMaintenance?: string
  pediatricInitial?: string
  pediatricMaintenance?: string
  maxDose?: string
  dilutionAndRoute: string
  administrationRate?: string
}

export interface ClinicalProtocolStep {
  title: string
  description: string
  items?: string[]
}

export interface AntidoteEntry {
  id: string
  toxicAgent: string
  toxicAgentCategory: ToxidromeCategory
  commonExposureExamples: string[]
  primaryAntidote: string
  brandNames: string[]
  secondaryOrAdjunctAntidotes?: string[]
  stockTier: KKMStockTier
  urgencyLevel: UrgencyLevel
  stockLocations: string[]
  mechanismOfReversal: string
  clinicalTriggersAndIndications: string[]
  dosingProtocol: AntidoteDosing
  specialProtocols?: ClinicalProtocolStep[]
  monitoringAndEndpoints: {
    parameters: string[]
    targetEndpoints: string[]
    frequency?: string
  }
  criticalWarningsAndCautions: string[]
  storageCondition: string
  prnConsultationAdvised: boolean
  fukkmPrescriberCategory: 'A*' | 'A' | 'A/KK' | 'B' | 'C' | 'Special Access'
  specialistNotes?: string
  mohReferenceGuide?: string
}

export interface PRNContactInfo {
  centerName: string
  hotlines: string[]
  tollFree: string
  telegram: string
  email: string
  operatingHours: {
    weekdays: string
    weekendsAndHolidays: string
    afterHours: string
  }
}
