export type PrescriberCategory = 'A*' | 'A' | 'A/KK' | 'B' | 'C' | 'C+'

export type PoisonCategory = 'Group B' | 'Group C' | 'Dangerous Drug (DD)' | 'Psychotropic (PS)' | 'Over-the-Counter (OTC)' | 'Exempt'

export type SkimPerolehan = 'APPL' | 'CCDP' | 'LP' | 'Khas' | 'Derma/Sumbangan'

export type HAMCategory = 
  | 'Concentrated Electrolyte'
  | 'Insulin & Hypoglycaemics'
  | 'Anticoagulant & Antithrombotic'
  | 'IV Adrenergic Agonist / Inotrope'
  | 'Antiarrhythmic IV'
  | 'Neuromuscular Blocking Agent (NMBA)'
  | 'Chemotherapy / Cytotoxic'
  | 'Hypertonic Dextrose (≥20%)'
  | 'Epidural / Intrathecal Agent'
  | 'Opioid & Sedative IV'
  | 'General Anaesthetic'
  | 'Oxytocic IV'
  | 'Immunosuppressant'

export type HAMRiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE'

export interface LASAPair {
  confusedWith: string
  confusionType: 'look-alike' | 'sound-alike' | 'both'
  tallManThis: string // e.g. DOBUTamine
  tallManOther: string // e.g. DOPAmine
  clinicalRiskWarning: string
  separationStrategy: string
}

export interface DrugInteraction {
  interactingDrug: string
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'MINOR'
  effect: string
  management: string
}

export interface ReconstitutionProtocol {
  isApplicable: boolean
  standardVialStrength?: string
  preferredSolvent?: string // e.g., Water for Injection (WFI), 0.9% NaCl
  solventVolume?: string // e.g., 10 mL
  resultingConcentration?: string // e.g., 100 mg/mL
  displacementVolume?: string // e.g., 0.8 mL per 1g vial
  stepByStepInstructions?: string[]
  physicalAppearance?: string // e.g. Clear pale yellow solution
  cautions?: string[]
}

export interface DilutionProtocol {
  isApplicable: boolean
  compatibleDiluents: string[] // e.g., ['0.9% NaCl (NS)', '5% Dextrose (D5W)', 'Hartmanns (RL)']
  incompatibleDiluents: string[] // e.g., ['Dextrose 10%', 'Sodium Bicarbonate', 'Lipids']
  standardDilution: {
    doseRange: string
    volume: string
    finalConcentration: string
    route: 'IV Infusion' | 'IV Bolus' | 'IV Slow Push' | 'IM' | 'SC' | 'Continuous Infusion' | 'Deep IM' | string
    infusionDuration: string
    maxConcentrationFluidRestricted?: string
    syringePumpCompatible?: boolean
  }
  fluidRestrictedGuidelines?: {
    peripheralMaxConc?: string
    centralMaxConc?: string
    syringePump?: string
    recommendedDoseVolume?: string
    notes?: string
  }
  ySiteCompatibility: {
    compatible: string[]
    incompatible: string[]
    requiresSeparateLine: boolean
  }
  sourceGuideline?: string
  clinicalRemarks?: string[]
  references?: string[]
  filtrationRequired?: boolean
  lightProtectionRequired?: boolean
  paediatricConsiderations?: string
  monitoringParameters: string[]
}

export interface ShelfLifeProtocol {
  dosageCategory?: string
  intactShelfLife: string // e.g., "24 - 36 bulan dari tarikh pengilangan"
  storageConditions: {
    temperature: 'Room Temperature (15-30°C)' | 'Cold Chain / Refrigerated (2-8°C)' | 'Frozen (-20°C)' | 'Protect from freezing' | string
    protectFromLight: boolean
    protectFromMoisture: boolean
    specialStorageNote?: string
  }
  inUseStabilityNotes?: {
    blisterPackStability?: string
    looseBottleStability?: string
    openedBottleStability?: string
    reconstitutedSuspensionStability?: string
    openedOphthalmicStability?: string
    openedTopicalStability?: string
    openedStability?: string
  }
  postReconstitutionStability?: {
    roomTempDuration: string // e.g., "6 hours at 25°C"
    refrigeratedDuration: string // e.g., "24 hours at 2-8°C"
    frozenDuration?: string
  }
  postDilutionStability?: {
    roomTempDuration: string // e.g., "12 hours at 25°C"
    refrigeratedDuration: string // e.g., "48 hours at 2-8°C"
  }
  multiDoseVialPolicy?: 'Single Use Only - Discard Remainder' | '28 Days Post-Puncture' | 'Use within 12h once opened' | string
}

export interface AntimicrobialData {
  isAntimicrobial: boolean
  nagRestrictionTier?: 'Free (F)' | 'Restricted (R)' | 'Reserve (Rsv)'
  antimicrobialClass?: string // e.g. Carbapenem, Glycopeptide, 3rd Gen Cephalosporin
  primaryIndications?: string[]
  empiricFirstLineFor?: string[]
  spectrumOfActivity?: string[]
  renalDoseAdjustment?: {
    normalCrCl: string
    crCl30_50: string
    crCl10_30: string
    crClLess10: string
    hemodialysis: string
  }
  ivToOralSwitchCriteria?: string[]
  standardDurationDays?: string
  requires72HourReview?: boolean
  specialistApprovalRequired?: string
}

export interface AlternativeDrugOption {
  drugId: string
  drugName: string
  prescriberCategory: PrescriberCategory
  therapeuticEquivalence: 'Exact Substitute' | 'Class Equivalent' | 'Alternative Second-Line'
  reasonForChoice: string
  stockStatus: 'In Stock' | 'Limited Stock' | 'Critical Shortage'
}

export interface PregnancyLactationGuideline {
  fdaCategory: 'A' | 'B' | 'C' | 'D' | 'X' | 'N/A'
  tgaCategory?: string
  
  // Pregnancy Verdict & Reasons (Crystal Clear KKM Standard)
  pregnancyStatus: 'BOLEH' | 'WASPADA' | 'DILARANG'
  pregnancyVerdict: string // e.g. "BOLEH DIGUNAKAN SEMASA HAMIL" / "DILARANG / KONTRAINDIKASI" / "PENGGUNAAN BERSYARAT (FAEDAH > RISIKO)"
  pregnancyReason: string // Exact clear medical reason
  trimester1: string
  trimester2_3: string
  safeAlternativesInPregnancy: string[] // Concrete alternative drug names
  
  // Lactation Verdict & Reasons
  lactationStatus: 'BOLEH' | 'WASPADA' | 'DILARANG'
  lactationVerdict: string // e.g. "BOLEH MENYUSU (SERASI)" / "DILARANG MENYUSU" / "WASPADA & PANTAU BAYI"
  lactationReason: string // Exact clear medical reason
  infantMonitoringAdvice: string // Practical baby monitoring advice
  
  isContraindicatedInPregnancy: boolean
  isContraindicatedInLactation: boolean
  pregnancySummary?: string
  lactationSummary?: string
}

export interface DrugEntry {
  id: string
  genericName: string
  brandNames: string[]
  mohDrugCode?: string // e.g. "KKM-DRUG-0014"
  atcCode: string
  atcCategory: string
  therapeuticClass: string
  prescriberCategory: PrescriberCategory
  poisonCategory: PoisonCategory
  skimPerolehan: SkimPerolehan
  
  dosageForms: string[] // e.g. ['Vial', 'Ampoule', 'Tablet', 'Suspension']
  strengths: string[] // e.g. ['500mg', '1g']
  
  indications: string[]
  contraindications: string[]
  psxRestrictions?: string
  neml?: 'Y' | 'N'
  standardDosage: {
    adult: string
    pediatric?: string
    elderlyOrRenal?: string
  }
  administrationRoutes: string[]
  sideEffects: string[]
  cautionsAndWarnings: string[]
  
  // Pregnancy & Lactation
  pregnancyAndLactation?: PregnancyLactationGuideline
  
  // High Alert Medication
  isHAM: boolean
  hamCategory?: HAMCategory
  hamRiskLevel?: HAMRiskLevel
  hamPrecautions?: string[]
  
  // LASA
  isLASA: boolean
  tallManName?: string // e.g. "DOBUTamine"
  lasaPairs?: LASAPair[]
  
  // Interactions
  interactions: DrugInteraction[]
  
  // Clinical Protocols
  reconstitution?: ReconstitutionProtocol
  dilution?: DilutionProtocol
  shelfLife: ShelfLifeProtocol
  
  // Antimicrobial
  antimicrobial?: AntimicrobialData
  
  // Quota & Stock Management
  quota: {
    monthlyQuota: number
    quotaUsed: number
    quotaRemaining: number
    unit: string
    lowStockThreshold: number
    isLowStock: boolean
    isCriticalShortage: boolean
    estimatedRunOutDays: number
    lastRestockedDate: string
    bufferStockLevel: number
  }
  
  alternativeDrugs: AlternativeDrugOption[]
  
  lastUpdated: string
  verifiedBy: string
}

export type DrugRoleInGuideline = 'FIRST_LINE' | 'SECOND_LINE' | 'PENICILLIN_ALLERGY' | 'STEP_DOWN' | 'ADJUNCT'

export type NAGPopulation = 'Adult' | 'Paediatric' | 'Neonatal' | 'All'

export type NAGBodySystem = 
  | 'Cardiovascular Infections'
  | 'Central Nervous Infections'
  | 'Chemoprophylaxis'
  | 'Gastrointestinal Infections'
  | 'Infections In Immunocompromised Patients'
  | 'Obstetrics & Gynaecological Infections'
  | 'Ocular Infections'
  | 'Oral / Dental Infections'
  | 'Orthopaedic Infections'
  | 'Otorhinolaryngology Infections'
  | 'Respiratory Infections'
  | 'Sepsis'
  | 'Sexually Transmitted Infections'
  | 'Skin & Soft Tissue Infections'
  | 'Trauma Related Infections'
  | 'Tropical Infections'
  | 'Urinary Tract Infections'
  // Legacy & Paediatric Compatibility Aliases
  | 'Respiratory'
  | 'Skin & Soft Tissue'
  | 'Urinary'
  | 'Intra-abdominal'
  | 'Central Nervous System (CNS)'
  | 'Bone & Joint'
  | 'Cardiovascular / Sepsis'
  | 'Ophthalmology'
  | 'Ear, Nose & Throat (ENT)'
  | 'Obstetrics & Gynaecology (O&G)'
  | 'Sexually Transmitted Infections (STI)'
  | 'Odontogenic / Dental'
  | 'Surgical Prophylaxis (SAP)'
  | 'Neonatal & Paediatric Syndromes'
  | 'Ophthalmology & ENT'

export type NAGSetting = 
  | 'Community-Acquired'
  | 'Hospital-Acquired (HAP/VAP)'
  | 'ICU / Severe'
  | 'Surgical Prophylaxis'
  | 'Outpatient (OPD/KK)'

export interface NAGSubTopic {
  number: number
  title: string
  description?: string
}

export interface NAGCategoryMetadata {
  code: string // e.g. 'A1', 'A2', 'P1'
  title: string // e.g. 'Cardiovascular Infections'
  fullLabel: string // e.g. 'A1 : Cardiovascular Infections'
  icon: string
  population: NAGPopulation
  topics: NAGSubTopic[]
}

export interface NAGInfectionGuideline {
  id: string
  targetPopulation: NAGPopulation
  categoryCode?: string // e.g. 'A1', 'A2' ... 'A17', 'P1'
  categoryTitle?: string // e.g. 'A1 : Cardiovascular Infections'
  topic?: string // e.g. '1. INFECTIVE ENDOCARDITIS', '2. CATHETER RELATED INFECTIONS'
  topicNumber?: number // e.g. 1, 2, 3
  bodySystem: NAGBodySystem
  conditionName: string
  setting: NAGSetting
  primaryPathogens: string[]
  firstLineDrugs: string[]
  firstLineTherapy: {
    regimen: string
    routeAndDose: string
    durationDays: string
    remarks: string
  }
  secondLineDrugs: string[]
  secondLineTherapy: {
    regimen: string
    routeAndDose: string
    durationDays: string
    remarks: string
  }
  allergyDrugs?: string[]
  penicillinAllergyOption?: {
    regimen: string
    routeAndDose: string
    remarks: string
  }
  stepDownDrugs?: string[]
  oralStepDownOption?: {
    regimen: string
    criteria: string
  }
  adjunctDrugs?: string[]
  amsNotes: string[]
  evidenceLevel: string
  pediatricWeightDoseHint?: string
  maxDailyDose?: string
  lastSyncDate?: string
  sourceVersion?: string
}

export interface NAGSyncMetadata {
  version: string
  edition: string
  lastSyncedAt: string
  totalGuidelines: number
  sourceUrl: string
  status: 'ONLINE' | 'OFFLINE_CACHE' | 'CUSTOM_IMPORTED'
  recentChanges?: string[]
}



