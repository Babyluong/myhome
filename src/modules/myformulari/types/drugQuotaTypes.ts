import { PrescriberCategory, PoisonCategory, SkimPerolehan } from './formulariTypes'

export type QuotaCategory = 
  | 'KELULUSAN_KHAS_KPK'       // Kelulusan Khas Ketua Pengarah Kesihatan (KPK)
  | 'KATEGORI_A_STAR'          // Ubat Kategori A* (Pakar Subkepakaran Sahaja)
  | 'KOS_TINGGI_BIOLOGIK'      // Ubat Kos Tinggi & Terapi Biologik / Dana Khas
  | 'PROGRAM_KHAS_KKM'         // Program Khas KKM (Transplan, Onkologi, Hemodialisis)
  | 'HIGH_ALERT_MEDICATION'    // High Alert Medication (HAM)
  | 'KAWALAN_TERHAD_HOSPITAL'  // Kawalan Kuota Tempatan Hospital / Wad

export type QuotaAllocationPeriod = 
  | 'Bulanan'
  | 'Suku Tahunan (Q1)'
  | 'Suku Tahunan (Q2)'
  | 'Suku Tahunan (Q3)'
  | 'Suku Tahunan (Q4)'
  | 'Tahunan'
  | 'Khas / Satu Kali (Ad-hoc)'

export type PatientDispenseStatus = 
  | 'TELAH_DIISI'            // Dispensed / Collected for current 30-day cycle
  | 'BELUM_DIISI'            // Pending collection / scheduled appointment
  | 'SEBAHAGIAN'             // Partial supply dispensed (titration / split)
  | 'TERLEPAS_TEMUJANJI'     // Defaulter (>7 days post-DNS)
  | 'DIGANTUNG'              // Suspended (ADR investigation / inpatient admission)
  | 'DITAMATKAN'             // Terminated (deceased, transferred, switched)

export type ApprovalAuthorityType = 
  | 'KPK_HQ'                 // Ketua Pengarah Kesihatan (BPF KKM)
  | 'JKUT_HOSPITAL'          // Jawatankuasa Ubat & Terapeutik Hospital
  | 'JKUT_NEGERI'           // Jawatankuasa Ubat & Terapeutik Negeri
  | 'PENGARAH_HOSPITAL'      // Pengarah Hospital (Stat Approval)

export interface PatientRefillHistoryItem {
  id: string
  date: string // YYYY-MM-DD
  timestamp?: string
  quantity: number
  dispensedBy: string
  pharmacistRole?: string
  refillCycleMonth: string // e.g. "Ogos 2026"
  nextDueDate: string // YYYY-MM-DD (Tarikh Bekalan Seterusnya - DNS)
  remarks?: string
}

export interface PatientQuotaRecord {
  id: string                          // Unique Registry ID (e.g. 'REG-APX-001')
  quotaDrugId: string                 // Foreign Key to DrugQuotaItem.id
  hospitalName: string                // e.g. 'Hospital Lawas'
  
  // Patient Identifiers
  patientName: string
  patientRn: string                   // Hospital Registration Number (e.g. 'RN-882341-26')
  patientMyKad: string                // IC / National ID (e.g. '780412-13-5521')
  age: number
  gender: 'Lelaki' | 'Perempuan'
  contactNumber?: string
  
  // Clinical Governance
  prescriberName: string              // e.g. 'Dr. Tan Siew Ling'
  prescriberMmc?: string              // MMC Registration Number
  clinicDepartment: string           // e.g. 'Klinik Kardiologi & NCD'
  clinicalIndication: string         // e.g. 'NVAF with CHA2DS2-VASc 3'
  
  // Approval Meta
  approvalAuthority: ApprovalAuthorityType
  approvalRef: string                // e.g. 'KKM/BFP/600-4/1/12 (KPK)'
  approvalStartDate: string          // YYYY-MM-DD
  approvalExpiryDate: string         // YYYY-MM-DD
  isApprovalActive: boolean
  
  // Quota & Refill Metrics
  monthlyDoseUnits: number           // e.g. 60 tablets/month
  currentMonthStatus: PatientDispenseStatus
  lastRefillDate?: string            // YYYY-MM-DD
  lastRefillQuantity?: number        // e.g. 60
  nextRefillDueDate: string          // DNS (Tarikh Bekalan Seterusnya)
  
  refillHistory: PatientRefillHistoryItem[]
  remarks?: string
  createdDate: string
  lastUpdated: string
}

export interface QuotaDispenseLog {
  id: string
  date: string // YYYY-MM-DD
  timestamp?: string
  quantity: number
  patientRn?: string
  patientName?: string
  prescriberName?: string
  prescriberRole?: string
  wardOrClinic?: string
  reasonOrIndication?: string
  balanceBefore: number
  balanceAfter: number
  dispensedBy: string
}

export interface DrugQuotaItem {
  id: string
  drugId?: string // Link to FUKKM or Inventory drug catalog
  facilityInventoryId?: string // Link to real facility_drug_inventory row
  genericName: string
  brandNames: string[]
  mohDrugCode?: string
  atcCode?: string
  therapeuticClass?: string
  
  category: QuotaCategory
  prescriberCategory: PrescriberCategory
  poisonCategory: PoisonCategory
  skimPerolehan: SkimPerolehan
  
  dosageForm: string // e.g. 'Tablet', 'Kapsul', 'Vial Suntikan', 'Picagari Pra-Isi (PFS)', 'Pen Autoinjektor', 'Ampul'
  strength: string // e.g. '2.5 mg', '10 mg', '50 mg (24/26mg)', '100 mg/mL'
  
  // Hospital & Dept Assignment
  hospitalName: string // e.g. 'Hospital Lawas', 'Hospital Kuala Lumpur', 'Hospital Umum Sarawak'
  department: string // e.g. 'Klinik Kardiologi & NCD', 'Klinik Nefrologi', 'Klinik Onkologi'
  
  // Quota Metrics
  allocationPeriod: string // e.g. 'Bulanan (Ogos 2026)', 'Tahunan 2026'
  monthlyQuota: number // Total allocated limit
  quotaUsed: number // Quantity consumed so far
  quotaRemaining: number // monthlyQuota - quotaUsed
  unit: string // 'Tablets', 'Capsules', 'Vials', 'PFS', 'Pens', 'Ampoules', 'Bottles'
  
  // Real Physical Stock from MyInventory
  physicalStockOnHand?: number // Real balance in store from facility_stock
  batchNumber?: string // Real batch from inventory
  expiryDate?: string // Real expiry date from inventory
  storeLocation?: string // Physical rack location in hospital store
  
  lowStockThreshold: number // Alert threshold (e.g. 20%)
  bufferStockLevel: number // Emergency buffer
  isLowStock: boolean
  isCriticalShortage: boolean
  estimatedRunOutDays: number
  lastRestockedDate: string
  
  // Financial & Approval Information
  costPerUnit: number // RM per unit
  totalBudgetRM: number // monthlyQuota * costPerUnit
  usedBudgetRM: number // quotaUsed * costPerUnit
  specialApprovalRef?: string // e.g. 'KKM/BFP/600-4/1/12 (KPK)'
  
  // Patient Registry Breakdown
  approvedPatientCount?: number
  totalRegisteredPatients?: number // Total active patients in registry
  filledPatientsCount?: number // Patients with status TELAH_DIISI this month
  pendingPatientsCount?: number // Patients with status BELUM_DIISI
  defaulterPatientsCount?: number // Patients with status TERLEPAS_TEMUJANJI
  totalPatientMonthlyUsage?: number // Sum of all patients' monthly doses (e.g. 28 x 60 = 1,680)
  
  // Clinical Notes & Alternative Options
  approvedIndications?: string[]
  alternativeDrugs?: {
    drugId: string
    drugName: string
    therapeuticEquivalence: 'Exact Substitute' | 'Class Equivalent' | 'Alternative Second-Line'
    reasonForChoice: string
    stockStatus: 'In Stock' | 'Limited Stock' | 'Critical Shortage'
  }[]
  
  notes?: string
  dispenseLogs: QuotaDispenseLog[]
  
  // Audit & Metadata
  createdDate: string
  lastUpdated: string
  verifiedBy: string
  isManualCustomDrug: boolean
}

export interface QuotaSummaryStats {
  totalItems: number
  overallUsagePercentage: number
  totalAllocatedQuantity: number
  totalUsedQuantity: number
  totalRemainingQuantity: number
  criticalCount: number
  lowStockCount: number
  stableCount: number
  totalBudgetRM: number
  usedBudgetRM: number
  remainingBudgetRM: number
  totalRegisteredPatients: number
  totalFilledPatientsThisMonth: number
  totalPendingPatientsThisMonth: number
  specialApprovalKpkCount: number
  totalPhysicalStockOnHand: number
}
