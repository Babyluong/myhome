import { PrescriberCategory, PoisonCategory } from './formulariTypes'

export type DisruptionItemType = 'DRUG' | 'NON_DRUG'

export type DisruptionSeverity = 
  | 'CRITICAL_OUT_OF_STOCK' // Putus Bekalan (0 balance)
  | 'LOW_STOCK_BUFFER'      // Stok Penampan Kritikal (<3-5 days)
  | 'QUOTA_DEPLETED'        // Kuota Suku Tahun Habis
  | 'TRANSIT_DELAY'         // Kelewatan Transit Sempadan (Brunei/Limbang)
  | 'MANUFACTURER_BACKORDER'// Gangguan Pengeluar / APPL Nasional

export type StabilizationStage =
  | 'STAGE_1_BUFFER_ACTIVATED' // Tahap 1: Stok Kecemasan / Pinjaman Diaktifkan
  | 'STAGE_2_IN_TRANSIT'       // Tahap 2: Konsainan Dalam Perjalanan
  | 'STAGE_3_RECEIVING_VERIFY' // Tahap 3: Penerimaan & Kuarantin Farmasi / Stor
  | 'STAGE_4_RESTOCKED_STABLE' // Tahap 4: Bekalan Pulih & Stabil Sepenuhnya

export type NonDrugCategory = 
  | 'Pakai Buang Perubatan (Medical Consumables)'
  | 'Peralatan Pembedahan & OT (Surgical Supplies)'
  | 'Reagen & Kit Makmal (Lab Reagents)'
  | 'Peralatan Rawatan Rapi & HDU (ICU Supplies)'
  | 'Alat Perlindungan Diri (PPE)'
  | 'Terapi Oksigen & Respiratori (Respiratory/Oxygen Consumables)'
  | 'Peralatan Ortopedik & Balutan (Wound Care & Ortho)'
  | 'Peralatan Radiologi & Pengimejan'
  | 'Lain-lain Bukan Ubat'

export interface DisruptionAlternativeOption {
  drugId?: string
  genericName: string // For Drug: Generic Name; For Non-Drug: Item Name
  brandName?: string
  itemType?: DisruptionItemType
  dosageForm?: string // For Drug: Ampoule/Vial/Tab; For Non-Drug: Specification / Size (e.g. 50mL Luer-Lock, Size 7.5)
  strength?: string // For Drug: 250mg/20mL; For Non-Drug: Packaging (e.g. Box of 50, Set)
  prescriberCategory?: PrescriberCategory
  nonDrugCategory?: NonDrugCategory
  therapeuticHierarchy: '1. Exact Substitute' | '2. Class Equivalent' | '3. Alternative Second-Line' | '1. Exact Functional Match' | '2. Acceptable Clinical Alternative' | '3. Temporary Workaround'
  lawasAvailabilityStatus: 'In Stock (Sedia Ada)' | 'Buffer Available (Penampan Cukup)' | 'Limited Stock (Stok Terhad)'
  currentLawasBalance?: string
  clinicalDosingProtocol: string // For Drug: Dosing conversion; For Non-Drug: Clinical usage & handling instructions
  specialistConsultNote?: string
  monitoringRequirements?: string[]
}

export interface StockDisruptionRecord {
  id: string
  hospitalName: string // 'Hospital Lawas'
  itemType: DisruptionItemType // 'DRUG' | 'NON_DRUG'
  departmentAffected: string // e.g. 'Unit Kecemasan & Trauma (ETD)', 'Wad Rawatan Rapi (HDU/ICU)', 'Stor Perubatan Integrasi'
  
  // Primary Disrupted Item Info
  drugId?: string
  genericName: string // For Drug: Generic Name; For Non-Drug: Item Name / Description
  brandNames: string[]
  mohDrugCode?: string
  
  // Specific to Drug
  dosageForm?: string // e.g. 'Ampoule', 'Vial', 'Syrup', 'Tablet'
  strength?: string // e.g. '250mg/20mL', '1g', '120mg/5mL'
  prescriberCategory?: PrescriberCategory
  poisonCategory?: PoisonCategory
  isHAM?: boolean

  // Specific to Non-Drug
  nonDrugCategory?: NonDrugCategory
  itemSpecification?: string // e.g. '50mL Luer-Lock Syringe, Sterile Single Use', 'Catheter 7Fr Triple Lumen'
  packagingUnit?: string // e.g. 'Kotak (100 Unit)', 'Pcs', 'Set'
  
  // Disruption Details
  severity: DisruptionSeverity
  currentBalanceText: string // e.g. "0 Unit (Habis)", "12 Pcs (Baki 2 Hari)"
  disruptionReason: string // e.g. "Penutupan sementara kilang pengeluar aktif APPL", "Kelewatan pelepasan logistik sempadan Brunei-Lawas"
  reportedDate: string // YYYY-MM-DD
  
  // ETA & Resupply Timeline
  targetEtaDate: string // YYYY-MM-DD (e.g. "2026-09-12")
  estimatedDaysToStable: number // e.g. 12
  stabilizationStage: StabilizationStage
  resupplySource: string // e.g. "Pesanan Pindahan Kecemasan (Mutual Aid) dari Hospital Miri", "Konsainan APPL Pharmaniaga", "Kelulusan KPK Khas"
  expectedRestockedQuantity: string // e.g. "300 Unit (Bekalan 30 Hari)"
  
  // Clinical Alternative Substitution
  alternatives: DisruptionAlternativeOption[]
  
  // Clinical Action Plan & Status
  clinicalActionPlan: string
  verifiedByPharmacist: string
  isActiveDisruption: boolean
  lastUpdated: string
}

export interface DisruptionSummaryStats {
  totalActiveDisruptions: number
  drugDisruptionsCount: number
  nonDrugDisruptionsCount: number
  criticalOutOfStockCount: number
  lowStockBufferCount: number
  transitDelayCount: number
  quotaDepletedCount: number
  averageDaysToStable: number
  alternativesCoveragePercent: number
}
