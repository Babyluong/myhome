// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { 
  Activity, 
  AirVent, 
  Wind, 
  AlertTriangle, 
  AlertCircle,
  Database, 
  ShoppingCart, 
  ClipboardList, 
  FileText,
  Search,
  Plus,
  QrCode,
  RefreshCw,
  CheckCircle,
  Printer,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Share2,
  Download,
  Calendar,
  CalendarDays,
  List,
  Sparkles,
  X,
  ChevronDown,
  Lock,
  ShieldAlert,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  CheckCheck,
  ScrollText,
  Save,
  CheckCircle2,
  Clock,
  Camera,
  CheckSquare,
  Square,
  MinusSquare,
  Trash2,
  LayoutGrid,
  Truck,
  FileCheck,
  PackageCheck,
  RotateCcw,
  Receipt,
  Pencil
} from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { isCylinderAuthorizedOfficer } from '@/shared/utils/cylinderRbac'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Spinner, StatCard, Table, Badge, DataTable } from '@/components/ui'
import { CylinderKpiCards } from '@/components/oxygen/CylinderKpiCards'
import { StoreBalanceGrid } from '@/components/oxygen/StoreBalanceGrid'
import { UnitDistributionTable } from '@/components/oxygen/UnitDistributionTable'
import { StoreUsageBalanceTable } from '@/components/oxygen/StoreUsageBalanceTable'
import { SupplierReturnsSection } from '@/components/oxygen/SupplierReturnsSection'
import { CreateReturnDocumentModal } from '@/components/oxygen/CreateReturnDocumentModal'
import { ScanEmptyCylinderModal } from '@/components/oxygen/ScanEmptyCylinderModal'
import { EmptyCylinderListModal } from '@/components/oxygen/EmptyCylinderListModal'
import { ScanReconciliationModal } from '@/components/oxygen/ScanReconciliationModal'
import { AuditReconciliationSummaryModal, AuditChangeItem } from '@/components/oxygen/AuditReconciliationSummaryModal'
import { ReturnDocumentPrintView } from '@/components/oxygen/ReturnDocumentPrintView'
import { CreateRequestDocumentModal } from '@/components/oxygen/CreateRequestDocumentModal'
import { RequestDocumentPrintView } from '@/components/oxygen/RequestDocumentPrintView'
import { CreateReceiveDocumentModal } from '@/components/oxygen/CreateReceiveDocumentModal'
import { ReceiveDocumentPrintView } from '@/components/oxygen/ReceiveDocumentPrintView'
import { CylinderDispatchKpiCards } from '@/components/oxygen/CylinderDispatchKpiCards'
import { CylinderDispatchTable } from '@/components/oxygen/CylinderDispatchTable'
import { ManualIssueModal } from '@/components/oxygen/ManualIssueModal'
import { UnitRequestModal } from '@/components/oxygen/UnitRequestModal'
import { ReceiveInterFacilityModal } from '@/components/oxygen/ReceiveInterFacilityModal'
import { ReturnInterFacilityModal } from '@/components/oxygen/ReturnInterFacilityModal'
import { DispatchRequestDetailModal } from '@/components/oxygen/DispatchRequestDetailModal'
import { CylinderDispatchPrintView } from '@/components/oxygen/CylinderDispatchPrintView'
import { DeleteDispatchConfirmModal } from '@/components/oxygen/DeleteDispatchConfirmModal'
import { DeleteCylinderModal } from '@/components/oxygen/DeleteCylinderModal'
import { EditCylinderModal } from '@/components/oxygen/EditCylinderModal'
import { CylinderOfflineBanner } from '@/components/oxygen/CylinderOfflineBanner'
import { Fab } from '@/shared/components/mobile/Fab'
import { cylinderSyncEngine } from '../../services/cylinderSyncEngine'
import { CylinderQrTag } from '../../components/CylinderQrTag'
import {
  getCylinderDispatchRequests,
  getCylinderDispatchKPI,
  getClinicalDepartments,
  createManualIssue,
  createInterFacilityReceivedCylinder,
  createInterFacilityReturnCylinder,
  createUnitRequest,
  approveRequest,
  rejectRequest,
  issueRequest,
  completeRequest,
  cancelRequest,
  updateRequestItems,
  deleteCylinderDispatchRequest,
  getCylinderDispatchRequestById,
} from '@/services/pharmacy/cylinderDispatchService'
import { 
  getOxygenCylinders, 
  getOxygenSummary, 
  getOxygenConsumptionHistory,
  updateOxygenCylinderStatus,
  getOxygenFinancialSummary,
  getOxygenLatestPricing,
  updateCylinderPrices,
  getOxygenPricingHistory,
  getOxygenReceptionsList,
  createOxygenReceptionRecord,
  getOxygenSystemSettings,
  getCylinderInventoryByType,
  getCylindersByDepartment,
  getStoreUsageBalance,
  getReturnDocuments,
  getRequestDocuments,
  getReceiveDocuments,
  assignCylinderQrTag,
  deactivateCylinderQrTag,
  reactivateCylinder,
  getOxygenCylinderTypes,
  generateNewCylindersWithQr,
  addSupplierTaggedLoanCylinders,
  clearCylinderInventory,
  getRegisteredOxygenVoteCodes,
  updateOxygenReceptionVoteCode,
  updateOxygenReceptionsVoteCode,
  updateOxygenReceptionArrival,
  deleteOxygenCylinder,
  deleteOxygenCylindersBatch,
  updateCylinderValveType,
} from '@/services/pharmacy/oxygenService'
import { 
  generateOxygenPoPdf, 
  generateOxygenReceptionReportPdf 
} from '@/services/pharmacy/oxygenPdfService'
import { extractSerialsFromDocument } from '@/shared/lib/pdfParser'
import { 
  getPharmacyPOSignatures, 
  updatePharmacyPOSignatures, 
  type PharmacyPOSignatures 
} from '@/services/pharmacy/pharmacySettingsService'
import type { 
  OxygenCylinderWithRelations, 
  OxygenSummary, 
  OxygenConsumptionWithRelations,
  OxygenFinancialSummary,
  OxygenPricingConfig,
  OxygenSystemSettings,
  OxygenReceptionRecord,
  OxygenReceptionItem,
  OxygenReturnDocumentWithRelations,
  OxygenRequestDocumentWithRelations,
  OxygenReceiveDocumentWithRelations,
  OxygenCylinderTypeInfo,
} from '@/types/pharmacy'
import type { ApiResponse, Paginated, Column } from '@/types'
import { supabase, isSupabaseConfigured } from '@/services/supabase'

export const OxygenDashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { language } = useLanguage()
  const isCylinderOfficer = useMemo(() => isCylinderAuthorizedOfficer(user), [user])
  const hospitalId = user?.hospital_id
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  // Existing distribution and inventory states
  const [summary, setSummary] = useState<OxygenSummary | null>(null)
  const [cylinders, setCylinders] = useState<OxygenCylinderWithRelations[]>([])
  const [taggedCylindersList, setTaggedCylindersList] = useState<OxygenCylinderWithRelations[]>([])
  const [consumptionHistory, setConsumptionHistory] = useState<OxygenConsumptionWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cylinder Inventory Dashboard states (implementation plan)
  const [cylinderAggregates, setCylinderAggregates] = useState<any[]>([])
  const [deptDistribution, setDeptDistribution] = useState<any[]>([])
  const [ledgerData, setLedgerData] = useState<any[]>([])
  const [returnDocs, setReturnDocs] = useState<OxygenReturnDocumentWithRelations[]>([])
  const [requestDocs, setRequestDocs] = useState<OxygenRequestDocumentWithRelations[]>([])
  const [receiveDocs, setReceiveDocs] = useState<OxygenReceiveDocumentWithRelations[]>([])
  const [cylinderActiveTab, setCylinderActiveTab] = useState<'overview' | 'unit_monitor' | 'store_balance' | 'supplier_returns'>('overview')
  const [supplierReturnsSubTab, setSupplierReturnsSubTab] = useState<'returns' | 'requests' | 'received' | 'tracking'>('returns')
  const [ledgerStartDate, setLedgerStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [ledgerEndDate, setLedgerEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [isLedgerLoading, setIsLedgerLoading] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isScanOpen, setIsScanOpen] = useState(false)
  const [selectedDepleteCombo, setSelectedDepleteCombo] = useState<any | null>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isReceiveDocModalOpen, setIsReceiveDocModalOpen] = useState(false)
  const [sessionScannedCylinders, setSessionScannedCylinders] = useState<OxygenCylinderWithRelations[]>([])
  const [printDocId, setPrintDocId] = useState<string | null>(null)
  const [printRequestId, setPrintRequestId] = useState<string | null>(null)
  const [printReceiveDocId, setPrintReceiveDocId] = useState<string | null>(null)
  const [isEmptyListModalOpen, setIsEmptyListModalOpen] = useState(false)
  const [emptyListCylinders, setEmptyListCylinders] = useState<OxygenCylinderWithRelations[]>([])

  // Filters for Cylinder Registry
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // QR Label Generator State
  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [generateQuantity, setGenerateQuantity] = useState<number>(1)
  const [generatedLabels, setGeneratedLabels] = useState<OxygenCylinderWithRelations[]>([])
  const [cylinderTypes, setCylinderTypes] = useState<OxygenCylinderTypeInfo[]>([])
  const [qrActiveTab, setQrActiveTab] = useState<'generate' | 'monitor'>('generate')
  const [qrSearchTerm, setQrSearchTerm] = useState('')
  const [qrSizeFilter, setQrSizeFilter] = useState('')
  const [qrTypeFilter, setQrTypeFilter] = useState('')
  const [qrPage, setQrPage] = useState(1)
  const [qrPageSize, setQrPageSize] = useState(10)
  const [isAssigningTag, setIsAssigningTag] = useState(false)
  const [supplierTagRows, setSupplierTagRows] = useState<string[]>([''])

  // OCR Auto-Extraction States
  const [deliveryDocFiles, setDeliveryDocFiles] = useState<File[]>([])
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [ocrExtractedTags, setOcrExtractedTags] = useState<{ serial: string; selected: boolean }[]>([])
  const [showOcrReview, setShowOcrReview] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDeliveryDocFiles(Array.from(e.target.files))
      setOcrError(null)
      setShowOcrReview(false)
    }
  }

  const handleRunOcr = async () => {
    if (deliveryDocFiles.length === 0) return
    setIsOcrProcessing(true)
    setOcrError(null)
    setShowOcrReview(false)
    
    try {
      const serials = await extractSerialsFromDocument(deliveryDocFiles)
      setOcrExtractedTags(serials.map(s => ({ serial: s, selected: true })))
      setShowOcrReview(true)
    } catch (err: any) {
      console.error(err)
      setOcrError(err.message || 'Failed to extract serial numbers. Please try again or enter manually.')
    } finally {
      setIsOcrProcessing(false)
    }
  }

  const handleApplyExtractedTags = () => {
    const selectedTags = ocrExtractedTags
      .filter(t => t.selected)
      .map(t => t.serial)
    
    if (selectedTags.length > 0) {
      setSupplierTagRows(selectedTags)
      setShowOcrReview(false)
      setDeliveryDocFiles([])
    }
  }

  useEffect(() => {
    if (selectedTypeId) {
      const type = cylinderTypes.find(t => t.id === selectedTypeId)
      const isLoan = type ? (((type.type_name || '').toLowerCase().includes('loan')) || (type.type_code || '').startsWith('101-')) : false
      if (isLoan) {
        setGenerateQuantity(1)
      }
    }
    setSupplierTagRows([''])
    setDeliveryDocFiles([])
    setOcrExtractedTags([])
    setShowOcrReview(false)
    setOcrError(null)
  }, [selectedTypeId, cylinderTypes])

  const selectedType = cylinderTypes.find(t => t.id === selectedTypeId)
  const isLoanSelected = selectedType ? (((selectedType.type_name || '').toLowerCase().includes('loan')) || (selectedType.type_code || '').startsWith('101-')) : false
  const isOcrEligible = selectedType ? (selectedType.type_code === '101-N' || selectedType.type_code === '101-F') : false

  // Reconciliation Audit States
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, string>>({})
  const [physicalLocations, setPhysicalLocations] = useState<Record<string, string>>({})
  const [physicalScannedBy, setPhysicalScannedBy] = useState<Record<string, { user: string; timestamp?: string }>>({})
  const [verifiedCylinderIds, setVerifiedCylinderIds] = useState<Set<string>>(new Set())
  const [reconciliationTab, setReconciliationTab] = useState<'system' | 'scanned'>('system')
  const [auditSuccessMsg, setAuditSuccessMsg] = useState<string | null>(null)
  const [reconciliationLogs, setReconciliationLogs] = useState<any[]>([])
  const [isSavingReconciliation, setIsSavingReconciliation] = useState(false)
  const [selectedReconciliationGroup, setSelectedReconciliationGroup] = useState<string | null>(null)
  const [reconciliationPage, setReconciliationPage] = useState(1)
  const reconciliationPageSize = 10
  const [isAuditScanOpen, setIsAuditScanOpen] = useState(false)
  const [isAuditReviewOpen, setIsAuditReviewOpen] = useState(false)
  const [reconciliationSearch, setReconciliationSearch] = useState('')
  const [selectedReconciliationIds, setSelectedReconciliationIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<string>('available')
  const [highlightedCylinderId, setHighlightedCylinderId] = useState<string | null>(null)

  const isStoreLocation = (loc?: any) => {
    if (!loc) return true;
    let locStr = '';
    if (typeof loc === 'string') {
      locStr = loc;
    } else if (typeof loc === 'object') {
      locStr = loc?.location_name || loc?.name || loc?.department_name || '';
    } else {
      locStr = String(loc);
    }
    if (!locStr) return true;
    const lower = locStr.toLowerCase().trim();
    return lower.includes('store') || lower.includes('farmasi') || lower.includes('depot') || lower === 'pharmacy' || lower === 'main store' || lower === 'pharmacy store' || lower === 'central store';
  };

  const normalizeStatusForReconciliation = (status?: any) => {
    const s = (typeof status === 'string' ? status : String(status || '')).toLowerCase();
    if (s === 'available' || s === 'full') return 'available';
    if (s === 'used' || s === 'in_use' || s === 'issued') return 'used';
    if (s === 'empty') return 'empty';
    if (s === 'returned_to_supplier' || s === 'return' || s === 'returned') return 'return';
    return s;
  };

  const getExpectedStateForCylinder = (cyl: any, locationOverride?: string) => {
    const rawLoc = locationOverride || physicalLocations[cyl?.id] || cyl?.scanned_location || cyl?.current_location || cyl?.assigned_ward?.department_name || cyl?.department?.department_name;
    const loc = typeof rawLoc === 'object' ? (rawLoc?.location_name || rawLoc?.name || rawLoc?.department_name || '') : rawLoc;
    const rawStatus = (typeof cyl?.status === 'string' ? cyl?.status : String(cyl?.status || '')).toLowerCase();

    // Explicit empty or return states
    if (rawStatus === 'empty') return 'empty';
    if (rawStatus === 'returned_to_supplier' || rawStatus === 'return' || rawStatus === 'returned') return 'return';

    // If located at Emergency & Trauma or any Ward / Dept (outside Store), it is BEING USED already
    if (loc && !isStoreLocation(loc)) {
      return 'used';
    }

    // Available only applies to cylinders still in Store
    return normalizeStatusForReconciliation(cyl?.status || 'available');
  };

  const mapReconciliationToDbStatus = (status: string, location?: string) => {
    const norm = normalizeStatusForReconciliation(status);
    if (norm === 'available') {
      return 'available';
    }
    if (norm === 'used') return 'issued';
    if (norm === 'empty') return 'empty';
    if (norm === 'return') return 'returned_to_supplier';
    return status;
  };

  const getStatusLabel = (status: string) => {
    const norm = normalizeStatusForReconciliation(status);
    if (norm === 'available') return language === 'ms' ? 'Tersedia (Stor)' : 'Available (Store)';
    if (norm === 'used') return language === 'ms' ? 'Digunakan (Wad)' : 'Used / In Use (Ward)';
    if (norm === 'empty') return language === 'ms' ? 'Kosong (Stor)' : 'Empty (Store)';
    if (norm === 'return') return language === 'ms' ? 'Pemulangan' : 'Return';
    return status;
  };

  const getCylinderLocation = (cyl: any, statusKey?: string) => {
    // 1. If explicit location was assigned or recorded
    const loc = cyl?.scanned_location || cyl?.current_location;
    if (loc) {
      if (typeof loc === 'string' && loc.trim()) return loc;
      if (typeof loc === 'object') {
        const name = loc?.location_name || loc?.name || loc?.department_name;
        if (name) return name;
      }
    }
    if (cyl?.assigned_ward?.department_name) return cyl.assigned_ward.department_name;
    if (cyl?.department?.department_name) return cyl.department.department_name;

    if (statusKey) {
      const norm = normalizeStatusForReconciliation(statusKey);
      if (norm === 'used') return 'Emergency & Trauma';
      if (norm === 'return') return 'Supplier';
    }
    return 'Pharmacy Store';
  };

  // --- NEW FINANCIAL STATES ---
  const fmt = (val: number) => `RM ${val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  const [financials, setFinancials] = useState<OxygenFinancialSummary | null>(null)
  const [pricingConfigs, setPricingConfigs] = useState<OxygenPricingConfig[]>([])
  const [pricingHistory, setPricingHistory] = useState<any[]>([])
  const [receptionsList, setReceptionsList] = useState<OxygenReceptionRecord[]>([])
  const [systemSettings, setSystemSettings] = useState<OxygenSystemSettings | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [ledgerViewMode, setLedgerViewMode] = useState<'detailed' | 'monthly'>('detailed')
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [monthlyCurrentPage, setMonthlyCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10)
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false)
  const [selectedConsolidateMonthKey, setSelectedConsolidateMonthKey] = useState<string>('')
  const [selectedPricingSupplier, setSelectedPricingSupplier] = useState<string>('All Suppliers')
  const [selectedModalSupplier, setSelectedModalSupplier] = useState<string>('Linde Malaysia Sdn Bhd')
  const [customSupplierInput, setCustomSupplierInput] = useState<string>('')
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState<boolean>(false)
  const [editedLoanRates, setEditedLoanRates] = useState<Record<string, string>>({})
  const [selectedReceiveSupplier, setSelectedReceiveSupplier] = useState<string>('BORNEO INDAH SDN BHD')
  const [receiveSupplyMode, setReceiveSupplyMode] = useState<'cyl' | 'vie'>('cyl')

  // Helper to group and consolidate reception entries by month (with vote code segregation)
  const getMonthlyConsolidatedReceptions = (receptions: OxygenReceptionRecord[], filterVote?: string) => {
    const targetVote = filterVote || dashboardVoteFilter
    const filtered = targetVote && targetVote !== 'all'
      ? receptions.filter(r => (r.vote_code || '080702').startsWith(targetVote))
      : receptions

    const monthMap: Record<string, {
      id: string
      hospital_id: string
      reception_date: string
      delivery_order_no: string
      sales_order_no: string
      refill_amount: number
      loan_amount: number
      total_amount: number
      vote_code: string
      vote_activity: string
      status: 'completed' | 'pending_invoice' | 'outstanding_po'
      supplier_name?: string | null
      ids: string[]
      monthKey: string
      monthLabel: string
      entryCount: number
      records: OxygenReceptionRecord[]
      created_at?: string
    }> = {}

    filtered.forEach(rec => {
      const rawDate = rec.reception_date || ''
      const d = new Date(rawDate)
      const baseMonth = !isNaN(d.getTime()) 
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : (rawDate.substring(0, 7) || '2026-08')

      const monthDateLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', { month: 'long', year: 'numeric' })
        : baseMonth

      const recVote = rec.vote_code || '080702'
      // VIE Tank receptions MUST be kept in a separate monthly group from cylinder receptions.
      // Use the is_vie_tank flag (derived at fetch time from reception items) as a discriminator
      // so they are never merged together regardless of vote code or date.
      const isVieRec = rec.is_vie_tank === true || (
        Array.isArray((rec as any).items) && (rec as any).items.some((itm: any) => {
          const code = (itm.size_info?.code || itm.size_code || itm.code || '').toLowerCase()
          return code.includes('vie') || code.includes('liquid')
        })
      )
      const supplyType = isVieRec ? 'vie' : 'cyl'
      const monthKey = `${baseMonth}_${recVote}_${supplyType}`
      const monthLabel = monthDateLabel

      const recIds = rec.ids && rec.ids.length > 0 ? rec.ids : [rec.id]
      const recDoNos = (rec.delivery_order_no || '').split(/[\s/]+/).filter(Boolean)
      const recSoNos = (rec.sales_order_no || '').split(/[\s/]+/).filter(Boolean)

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          id: `monthly-${monthKey}`,
          hospital_id: rec.hospital_id,
          reception_date: rec.reception_date,
          delivery_order_no: rec.delivery_order_no,
          sales_order_no: rec.sales_order_no || '-',
          refill_amount: Number(rec.refill_amount || 0),
          loan_amount: Number(rec.loan_amount || 0),
          total_amount: Number(rec.total_amount || 0),
          vote_code: recVote,
          vote_activity: rec.vote_activity || financials?.by_vote_code?.[recVote]?.vote_activity || '27402',
          status: rec.status || 'completed',
          supplier_name: rec.supplier_name,
          ids: [...recIds],
          monthKey,
          monthLabel,
          entryCount: 1,
          records: [rec],
          is_vie_tank: isVieRec,
          created_at: rec.created_at || ''
        }
      } else {
        const existing = monthMap[monthKey]
        existing.entryCount += 1
        existing.refill_amount += Number(rec.refill_amount || 0)
        existing.loan_amount += Number(rec.loan_amount || 0)
        existing.total_amount += Number(rec.total_amount || 0)
        existing.records.push(rec)
        
        recIds.forEach(id => {
          if (!existing.ids.includes(id)) {
            existing.ids.push(id)
          }
        })

        const curDos = existing.delivery_order_no ? existing.delivery_order_no.split(' / ') : []
        recDoNos.forEach(dNo => {
          if (!curDos.includes(dNo)) curDos.push(dNo)
        })
        existing.delivery_order_no = curDos.join(' / ')

        const curSos = existing.sales_order_no && existing.sales_order_no !== '-' ? existing.sales_order_no.split(' / ') : []
        recSoNos.forEach(sNo => {
          if (!curSos.includes(sNo)) curSos.push(sNo)
        })
        existing.sales_order_no = curSos.length > 0 ? curSos.join(' / ') : '-'

        if (new Date(rec.reception_date) > new Date(existing.reception_date)) {
          existing.reception_date = rec.reception_date
        }
        if (rec.supplier_name && !existing.supplier_name) {
          existing.supplier_name = rec.supplier_name
        }
      }
    })

    return Object.values(monthMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  }


  // Modals visibility
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [pdfSuccessModalOpen, setPdfSuccessModalOpen] = useState(false)
  const [justCreatedReception, setJustCreatedReception] = useState<OxygenReceptionRecord | null>(null)
  
  // Key in DO / Arrival modal states
  const [isArrivalModalOpen, setIsArrivalModalOpen] = useState(false)
  const [arrivalRecord, setArrivalRecord] = useState<OxygenReceptionRecord | null>(null)
  const [arrivalDoNo, setArrivalDoNo] = useState('')
  const [arrivalSoNo, setArrivalSoNo] = useState('')
  const [arrivalDate, setArrivalDate] = useState(() => new Date().toISOString().split('T')[0])
  const [isSubmittingArrival, setIsSubmittingArrival] = useState(false)

  // Pay Loan Charges (No Delivery / Standalone Rental Fee) Modal states
  const [isPayLoanModalOpen, setIsPayLoanModalOpen] = useState(false)
  const [loanInvoiceNo, setLoanInvoiceNo] = useState('')
  const [loanBillingRef, setLoanBillingRef] = useState('')
  const [loanBillingDate, setLoanBillingDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loanSupplier, setLoanSupplier] = useState('LINDE EOX SDN BHD (CAW. MIRI)')
  const [loanVoteCode, setLoanVoteCode] = useState('24000')
  const [loanVoteActivity, setLoanVoteActivity] = useState('020200')
  const [loanStatus, setLoanStatus] = useState<'completed' | 'outstanding_po' | 'pending_invoice'>('completed')
  const [loanItemQuantities, setLoanItemQuantities] = useState<Record<string, number>>({})
  const [loanCustomRates, setLoanCustomRates] = useState<Record<string, number>>({})
  const [loanRemarks, setLoanRemarks] = useState('')
  const [isSubmittingLoanPayment, setIsSubmittingLoanPayment] = useState(false)
  const [activeLoanCustody, setActiveLoanCustody] = useState<{ sizeCode: string; sizeObj: any; activeCount: number; rate: number }[]>([])
  const [isLoadingCustody, setIsLoadingCustody] = useState(false)

  // Officer Signatures state
  const [signatures, setSignatures] = useState<PharmacyPOSignatures>({
    applicantName: 'KAMRIAH BT HAJI MAIL',
    applicantPosition: 'PENOLONG PEGAWAI FARMASI U7 TBK 2',
    headName: 'TAN YUANG ZHANG',
    headPosition: 'PEGAWAI FARMASI UF 12',
  })
  const [tempSignatures, setTempSignatures] = useState<PharmacyPOSignatures>(signatures)
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false)
  const [isSavingOfficers, setIsSavingOfficers] = useState(false)

  // PO Preview & Custom Signatures states
  const [isPoPreviewModalOpen, setIsPoPreviewModalOpen] = useState(false)
  const [previewRecord, setPreviewRecord] = useState<OxygenReceptionRecord | null>(null)
  const [previewSignatures, setPreviewSignatures] = useState<PharmacyPOSignatures>({
    applicantName: '',
    applicantPosition: '',
    headName: '',
    headPosition: ''
  })
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [previewVoteCode, setPreviewVoteCode] = useState<string>('080702')
  const [previewVoteActivity, setPreviewVoteActivity] = useState<string>('27402')
  const [previewTotalAmount, setPreviewTotalAmount] = useState<number>(0)
  const [previewRefillAmount, setPreviewRefillAmount] = useState<number>(0)
  const [previewLoanAmount, setPreviewLoanAmount] = useState<number>(0)
  const [dashboardVoteFilter, setDashboardVoteFilter] = useState<string>('all')
  const [availableVoteCodes, setAvailableVoteCodes] = useState<string[]>(['080702', '080600'])
  const [isSavingVoteCode, setIsSavingVoteCode] = useState<boolean>(false)
  const [voteSaveSuccess, setVoteSaveSuccess] = useState<boolean>(false)
  const [isUpdatingTableVote, setIsUpdatingTableVote] = useState<string | null>(null)

  // Vote Code Security Override & Audit Log Modal states
  const [isVoteOverrideModalOpen, setIsVoteOverrideModalOpen] = useState(false)
  const [overrideTargetRecord, setOverrideTargetRecord] = useState<OxygenReceptionRecord | any | null>(null)
  const [overrideSelectedVoteCode, setOverrideSelectedVoteCode] = useState<string>('080702')
  const [overrideSelectedVoteActivity, setOverrideSelectedVoteActivity] = useState<string>('27402')
  const [overridePasswordInput, setOverridePasswordInput] = useState<string>('')
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('')
  const [overrideError, setOverrideError] = useState<string>('')
  const [overrideIsSubmitting, setOverrideIsSubmitting] = useState<boolean>(false)
  const [showOverridePassword, setShowOverridePassword] = useState<boolean>(false)

  const [hospitalUsers, setHospitalUsers] = useState<{ id: string; full_name: string; jawatan?: string; department_id?: string; department?: { id?: string; department_name?: string } | null; role?: { role_name: string } }[]>([])
  
  // Filter officers strictly to Pharmacy Logistic staff for official PO signatures
  const pharmacyLogisticUsers = useMemo(() => {
    const filtered = hospitalUsers.filter(u => {
      const deptName = (u.department?.department_name || '').toLowerCase().trim()
      if (deptName.includes('pharmacy logistic') || deptName.includes('farmasi logistik') || deptName.includes('logistik farmasi') || deptName.includes('stor farmasi')) {
        return true
      }
      if (u.department_id === '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880') {
        return true
      }
      return false
    })
    return filtered.length > 0 ? filtered : hospitalUsers
  }, [hospitalUsers])

  const [lindeSupplier, setLindeSupplier] = useState<any>(null)

  // Cylinder Request & Dispatch States
  const [dispatchRequests, setDispatchRequests] = useState<CylinderDispatchRequestWithRelations[]>([])
  const [dispatchKpi, setDispatchKpi] = useState<CylinderDispatchKPI | null>(null)
  const [departmentsList, setDepartmentsList] = useState<{ id: string; department_name: string }[]>([])
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
  const [unitModalInitialMode, setUnitModalInitialMode] = useState<'internal' | 'external'>('internal')
  const [unitModalLockMode, setUnitModalLockMode] = useState(false)
  const [isReceiveInterFacilityModalOpen, setIsReceiveInterFacilityModalOpen] = useState(false)
  const [isReturnInterFacilityModalOpen, setIsReturnInterFacilityModalOpen] = useState(false)
  const [isIntraFacilityDropdownOpen, setIsIntraFacilityDropdownOpen] = useState(false)
  const [isInterFacilityDropdownOpen, setIsInterFacilityDropdownOpen] = useState(false)
  const [detailRequest, setDetailRequest] = useState<CylinderDispatchRequestWithRelations | null>(null)
  const [printDispatchRequestId, setPrintDispatchRequestId] = useState<string | null>(null)
  const [deleteTargetRequest, setDeleteTargetRequest] = useState<CylinderDispatchRequestWithRelations | null>(null)
  const [deleteCylinderTarget, setDeleteCylinderTarget] = useState<OxygenCylinderWithRelations[] | null>(null)
  const [isDeletingCylinder, setIsDeletingCylinder] = useState(false)
  const [editingCylinderTarget, setEditingCylinderTarget] = useState<OxygenCylinderWithRelations | null>(null)

  // Check if current user belongs to an "other unit" (wards, clinics, ICU, etc.) rather than Pharmacy / Administration
  const isOtherUnit = useMemo(() => {
    if (!user) return false;
    const roleCode = (user.role?.role_code || (user as any).role || '').toLowerCase();
    const roleName = (user.role?.role_name || '').toLowerCase();
    const deptName = (user.department?.department_name || '').toLowerCase();
    const jawatan = (user.jawatan || '').toLowerCase();

    const isPharmacyOrAdmin = 
      roleCode.includes('admin') ||
      roleCode.includes('director') ||
      roleCode.includes('manager') ||
      roleCode.includes('pharmacy') ||
      roleCode.includes('pharmacist') ||
      roleCode.includes('storekeeper') ||
      roleName.includes('admin') ||
      roleName.includes('farmasi') ||
      roleName.includes('pharmacist') ||
      deptName.includes('farmasi') ||
      deptName.includes('pharmacy') ||
      deptName.includes('logistik') ||
      jawatan.includes('farmasi') ||
      jawatan.includes('pharmacist') ||
      jawatan.includes('stor') ||
      jawatan.includes('pegawai farmasi');

    return !isPharmacyOrAdmin;
  }, [user]);

  const [dbSuppliers, setDbSuppliers] = useState<{ id: string; company_name: string }[]>([])

  useEffect(() => {
    const fetchLindeAndSuppliers = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data: lindeData } = await supabase
            .from('suppliers')
            .select('*')
            .ilike('company_name', '%LINDE%')
            .limit(1)
          if (lindeData && lindeData.length > 0) {
            setLindeSupplier(lindeData[0])
            setSelectedModalSupplier(lindeData[0].company_name || 'Linde Malaysia Sdn Bhd')
          }

          const { data: allSuppliers } = await supabase
            .from('suppliers')
            .select('id, company_name')
          if (allSuppliers && allSuppliers.length > 0) {
            const filteredSuppliers = allSuppliers.filter(s => {
              const name = (s.company_name || '').toLowerCase();
              return name.includes('linde') || name.includes('borneo indah');
            });
            setDbSuppliers(filteredSuppliers)
            if (!lindeData || lindeData.length === 0) {
              setSelectedModalSupplier(filteredSuppliers[0]?.company_name || 'Linde Malaysia Sdn Bhd')
            }
          }
        }
      } catch (err) {
        console.error('Error fetching real suppliers:', err)
      }
    }
    void fetchLindeAndSuppliers()
  }, [])

  const lindeDisplayName = lindeSupplier?.company_name || 'Linde Malaysia Sdn Bhd'

  const isLindeSupplier = (name?: string | null) => {
    if (!name) return true
    return String(name).toLowerCase().includes('linde')
  }

  const isSupplierMatch = (configSupplier: string | null | undefined, selectedSupplier: string) => {
    if (selectedSupplier === 'All Suppliers') return true
    if (isLindeSupplier(selectedSupplier)) {
      return isLindeSupplier(configSupplier)
    }
    return String(configSupplier || '').trim().toLowerCase() === String(selectedSupplier || '').trim().toLowerCase()
  }

  const realSupplierOptions = Array.from(
    new Set([
      lindeDisplayName,
      ...pricingConfigs
        .map((p) => p.supplier_name)
        .filter((name): name is string => !!name),
      ...pricingHistory
        .map((ph) => ph.supplier_name)
        .filter((name): name is string => !!name),
      ...dbSuppliers.map((s) => s.company_name)
    ].filter((name): name is string => {
      if (!name) return false;
      const lower = String(name).toLowerCase();
      return lower.includes('linde') || lower.includes('borneo indah');
    }))
  )

  useEffect(() => {
    const targetSupplier = isAddingNewSupplier ? customSupplierInput : selectedModalSupplier
    const priceMap: Record<string, string> = {}
    
    // 1. Get prices matching targetSupplier
    const targetConfigs = pricingConfigs.filter(c => isSupplierMatch(c.supplier_name, targetSupplier))
    targetConfigs.forEach(p => {
      priceMap[p.cylinder_size_code] = p.refill_price.toString()
    })

    // 2. Fallback to Linde / base prices for any unpopulated size codes
    const defaultConfigs = pricingConfigs.filter(c => isLindeSupplier(c.supplier_name))
    defaultConfigs.forEach(p => {
      if (!priceMap[p.cylinder_size_code]) {
        priceMap[p.cylinder_size_code] = p.refill_price.toString()
      }
    })

    // 3. Fallback defaults for standard size codes
    const DEFAULT_SIZES = ['101-F', '101-N', 'P101-D', 'P101-E', 'P101-F', 'P101-HS', 'Liquid Medical Oxygen (VIE Tank)']
    DEFAULT_SIZES.forEach(sc => {
      if (!priceMap[sc]) {
        priceMap[sc] = '0'
      }
    })

    setEditedPrices(priceMap)
  }, [selectedModalSupplier, isAddingNewSupplier, customSupplierInput, pricingConfigs])

  /**
   * Consolidates received cylinder items for a single reception record or a monthly consolidated record.
   * Handles per-reception breakdown so that un-itemized legacy records or mixed-record months are
   * accurately aggregated without dropping any deliveries.
   */
  const fetchAndConsolidateReceptionItems = async (
    targetRecord: OxygenReceptionRecord | any,
    targetSupplierName: string
  ): Promise<OxygenPdfItem[]> => {
    // Check if target record or consolidated group represents a VIE Tank consolidation
    const isVieConsolidation = Boolean(
      targetRecord.is_vie_tank ||
      (typeof targetRecord.monthKey === 'string' && targetRecord.monthKey.endsWith('_vie')) ||
      (Array.isArray(targetRecord.records) && targetRecord.records.some((r: any) => r.is_vie_tank))
    )

    // 1. Gather all reception IDs for this record or month (matching supply type strictly)
    const idSet = new Set<string>()

    // Add direct targetRecord id if not a synthetic monthly key
    if (targetRecord.id && typeof targetRecord.id === 'string' && !targetRecord.id.startsWith('monthly-')) {
      idSet.add(targetRecord.id)
    }

    // Add all IDs in targetRecord.ids
    if (Array.isArray(targetRecord.ids)) {
      targetRecord.ids.forEach((id: string) => { if (id && typeof id === 'string' && !id.startsWith('monthly-')) idSet.add(id) })
    }

    // Flatten all sub-records and their nested ids
    if (Array.isArray(targetRecord.records)) {
      targetRecord.records.forEach((rec: any) => {
        if (rec.id && typeof rec.id === 'string' && !rec.id.startsWith('monthly-')) idSet.add(rec.id)
        if (Array.isArray(rec.ids)) {
          rec.ids.forEach((subId: string) => { if (subId && typeof subId === 'string' && !subId.startsWith('monthly-')) idSet.add(subId) })
        }
      })
    }

    // If idSet is empty but monthKey is present, query matching reception IDs for this month from DB
    const monthKey: string | undefined = targetRecord.monthKey
    const targetHospitalId = targetRecord.hospital_id || hospitalId
    if (idSet.size === 0 && monthKey && targetHospitalId) {
      const cleanMonth = monthKey.split('_')[0]
      const [yrStr, moStr] = cleanMonth.split('-')
      const year = parseInt(yrStr, 10)
      const month = parseInt(moStr, 10)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      
      let query = supabase
        .from('pharmacy_oxygen_reception_records')
        .select('id, vote_code')
        .eq('hospital_id', targetHospitalId)
        .gte('reception_date', startDate)
        .lte('reception_date', endDate)

      const targetVote = targetRecord.vote_code || '080702'
      if (targetVote) {
        query = query.eq('vote_code', targetVote)
      }

      const { data: monthRecs } = await query
      if (monthRecs && monthRecs.length > 0) {
        monthRecs.forEach((r: any) => { if (r.id) idSet.add(r.id) })
      }
    }

    const allRecIds = Array.from(idSet)

    // 2. Fetch raw items from DB for all receptions
    const { data: rawItems } = await supabase
      .from('pharmacy_oxygen_reception_items')
      .select('*, size_info:pharmacy_oxygen_cylinder_sizes(*)')
      .in('reception_id', allRecIds)

    // 3. Build a lookup of loan rates from pricingConfigs for this supplier
    //    Key: size_code (e.g. "101-N"), Value: loan rate per cylinder (e.g. 15.00)
    const supplierLoanRates: Record<string, number> = {}
    pricingConfigs
      .filter(c => isSupplierMatch(c.supplier_name, targetSupplierName))
      .forEach(c => {
        if (c.loan_rate != null && c.loan_rate > 0) {
          supplierLoanRates[c.cylinder_size_code] = Number(c.loan_rate)
        }
      })

    // 4. For each item row, determine is_loan using this logic:
    //    - If size_info.is_loan is FALSE on the size: it is ALWAYS a refill (Standard Refill)
    //    - If size_info.is_loan is TRUE on the size: compare unit_price against the known
    //      loan rate for that size. If unit_price <= loanRate * 1.5, it is a loan fee row.
    //      If unit_price >> loanRate (i.e. matches the refill price), it is a refill.
    //    This is necessary because the schema stores 101-N cylinder type as is_loan=true
    //    but it also receives actual refill gas (at RM 250) plus a separate loan fee (at RM 15).
    const resolveIsLoan = (itm: any): boolean => {
      const sizeCode = (itm.size_info?.code || itm.size_code || '').toLowerCase()
      if (sizeCode.includes('liquid') || sizeCode.includes('vie')) {
        return false
      }
      const sizeIsLoan: boolean = itm.size_info?.is_loan === true
      if (!sizeIsLoan) return false // P101-D, P101-E, P101-F, P101-HS → always refill

      // For 101-N and 101-F (marked as loan sizes):
      // A loan FEE row has a very low unit_price (e.g. RM 15 for cylinder hire)
      // A refill row has the full gas price (e.g. RM 250 for 101-N refill)
      const rawCode = itm.size_info?.code || itm.size_code || ''
      const unitPrice = Number(itm.unit_price || 0)
      const knownLoanRate = supplierLoanRates[rawCode] ?? 0

      if (knownLoanRate > 0) {
        // Loan fee rows are at or near the known loan rate; refills are much higher
        return unitPrice <= knownLoanRate * 2
      }
      // Fallback: if loan rate is unknown but unit_price is very low (<= 50), treat as loan fee
      return unitPrice <= 50
    }

    // 5. Consolidated aggregation: key → { size_code, is_loan, qty, price }
    // STRICT ZERO-CROSSOVER: VIE Tank items can ONLY be included in VIE Tank consolidation,
    // and standard cylinder items can ONLY be included in cylinder consolidation.
    const groupMap: Record<string, { size_code: string; is_loan: boolean; qty: number; price: number }> = {}

    ;(rawItems || []).forEach((itm: any) => {
      const sizeCode = itm.size_info?.code || itm.size_code || 'Standard'
      const codeLower = sizeCode.toLowerCase()
      const isVieItem = codeLower.includes('vie') || codeLower.includes('liquid')

      // Enforce absolute segregation:
      if (isVieConsolidation && !isVieItem) return // VIE consolidation excludes cylinders
      if (!isVieConsolidation && isVieItem) return // Cylinder consolidation excludes VIE

      const unitPrice = Number(itm.unit_price || 0)
      const isLoan = resolveIsLoan(itm)
      const key = `${sizeCode}-${isLoan ? 'loan' : 'refill'}`
      const itemQty = Number(itm.quantity) || 1

      if (!groupMap[key]) {
        groupMap[key] = {
          size_code: sizeCode,
          is_loan: isLoan,
          qty: itemQty,
          price: unitPrice
        }
      } else {
        groupMap[key].qty += itemQty
      }
    })

    // 6. Format final items list using contract prices from pricingConfigs
    const formattedItems: OxygenPdfItem[] = []
    Object.values(groupMap).forEach((val) => {
      let cleanPrice = val.price
      if (!val.is_loan) {
        const contractPrice = getActivePrice(val.size_code, targetSupplierName)
        if (contractPrice > 0) cleanPrice = contractPrice
      } else {
        const lRate = getActiveLoanRate(val.size_code, targetSupplierName)
        if (lRate > 0) cleanPrice = lRate
      }

      formattedItems.push({
        size_code: val.size_code,
        is_loan: val.is_loan,
        quantity: val.qty,
        unit_price: cleanPrice,
        total_price: val.qty * cleanPrice
      })
    })

    // Loan Charges Integration:
    // Ensure any recorded loan_amount on targetRecord is represented in formattedItems as is_loan: true items,
    // so PO preview calculation, budget deductions, and PO PDF generation correctly include cylinder loan charges.
    const totalRecordLoan = Number(targetRecord.loan_amount || 0)
    const existingLoanTotal = formattedItems.filter(i => i.is_loan).reduce((sum, i) => sum + i.total_price, 0)
    const remainingLoan = Number((totalRecordLoan - existingLoanTotal).toFixed(2))

    if (remainingLoan > 0) {
      // 1. Check if any refill cylinder sizes in formattedItems are loanable sizes (e.g. 101-N, 101-F)
      const loanableSizes = ['101-N', '101-F', 'P101-F']
      let allocatedLoan = 0

      for (const itm of formattedItems.filter(i => !i.is_loan)) {
        const rawSize = itm.size_code || ''
        const isMatch = loanableSizes.some(s => rawSize === s || rawSize.startsWith('101-'))
        if (isMatch && allocatedLoan < remainingLoan) {
          const lRate = getActiveLoanRate(rawSize, targetSupplierName) || (isLindeSupplier(targetSupplierName) ? 18.36 : 15.00)
          const maxPossibleQty = Math.floor((remainingLoan - allocatedLoan) / lRate)
          const qtyToLoan = Math.min(itm.quantity, maxPossibleQty > 0 ? maxPossibleQty : 1)
          const loanCost = Number((qtyToLoan * lRate).toFixed(2))

          if (loanCost > 0 && allocatedLoan + loanCost <= remainingLoan + 0.05) {
            formattedItems.push({
              size_code: rawSize === '101-F' ? 'P101-F' : rawSize,
              is_loan: true,
              quantity: qtyToLoan,
              unit_price: lRate,
              total_price: loanCost
            })
            allocatedLoan = Number((allocatedLoan + loanCost).toFixed(2))
          }
        }
      }

      // 2. If unallocated remainder exists or no refill match was made (e.g. pure loan invoice or rate mismatch),
      // add consolidated loan charge line for the remaining balance.
      const unallocatedRemainder = Number((remainingLoan - allocatedLoan).toFixed(2))
      if (unallocatedRemainder > 0) {
        const isLinde = isLindeSupplier(targetSupplierName)
        const defaultRate = isLinde ? 18.36 : 15.00
        const qtyEstimate = unallocatedRemainder >= defaultRate && unallocatedRemainder % defaultRate === 0
          ? Math.round(unallocatedRemainder / defaultRate)
          : 1
        const unitPriceEstimate = qtyEstimate > 1 ? defaultRate : unallocatedRemainder

        formattedItems.push({
          size_code: '101-N / 101-F (Pinjaman)',
          is_loan: true,
          quantity: qtyEstimate,
          unit_price: unitPriceEstimate,
          total_price: unallocatedRemainder
        })
      }
    }

    return formattedItems
  }

  /**
   * Helper to compute precise balanceBefore and balanceAfter for PO generation,
   * properly accounting for whether the record is already committed to the target vote code in the DB.
   */
  const computePoBalances = (
    rec: OxygenReceptionRecord | any,
    targetVoteCode: string,
    totalAmount: number
  ): { balanceBefore: number; balanceAfter: number } => {
    if (!rec) return { balanceBefore: 0, balanceAfter: 0 }
    const normTarget = targetVoteCode.startsWith('080600') ? '080600' : targetVoteCode.startsWith('080702') ? '080702' : targetVoteCode
    const voteCodeFin = financials?.by_vote_code?.[normTarget]
    const currentBalance = voteCodeFin ? voteCodeFin.current_balance : (financials?.current_balance ?? 274000.0)

    // Check if this reception record is already counted in this vote code in DB
    let isAlreadyCounted = false
    if (Array.isArray(rec.ids) && rec.ids.length > 0) {
      const matched = receptionsList.filter(r => rec.ids.includes(r.id) && (r.vote_code || '080702').startsWith(normTarget))
      isAlreadyCounted = matched.length > 0
    } else if (rec.id && !rec.id.startsWith('monthly-')) {
      const dbRec = receptionsList.find(r => r.id === rec.id)
      if (dbRec) {
        isAlreadyCounted = (dbRec.vote_code || '080702').trim().startsWith(normTarget)
      } else {
        isAlreadyCounted = String(rec.vote_code || '080702').trim().startsWith(normTarget)
      }
    } else {
      isAlreadyCounted = String(rec.vote_code || '080702').trim().startsWith(normTarget)
    }

    const balanceBefore = isAlreadyCounted ? currentBalance + totalAmount : currentBalance
    const balanceAfter = isAlreadyCounted ? currentBalance : currentBalance - totalAmount

    return { balanceBefore, balanceAfter }
  }

  useEffect(() => {
    if (!isPoPreviewModalOpen || !previewRecord) return

    let active = true
    const generatePreview = async () => {
      try {
        // Dynamic supplier lookup for PO PDF
        const targetSupName = previewRecord.supplier_name || selectedReceiveSupplier || 'LINDE EOX SDN BHD (CAW. MIRI)'
        const matchedSup = dbSuppliers.find(s => isSupplierMatch(s.company_name, targetSupName))

        // Build per-size loan rates from pricingConfigs for the matched supplier
        const supplierLoanRates: Record<string, number> = {}
        pricingConfigs
          .filter(c => isSupplierMatch(c.supplier_name, targetSupName))
          .forEach(c => { if (c.loan_rate != null) supplierLoanRates[c.cylinder_size_code] = c.loan_rate })

        const formattedItems = await fetchAndConsolidateReceptionItems(previewRecord, targetSupName)

        const totalAmount = formattedItems.reduce((sum, item) => sum + item.total_price, 0)
        const refillTotalAmount = formattedItems.filter(i => !i.is_loan).reduce((sum, item) => sum + item.total_price, 0)
        const loanTotalAmount = formattedItems.filter(i => i.is_loan).reduce((sum, item) => sum + item.total_price, 0)
        setPreviewTotalAmount(totalAmount)
        setPreviewRefillAmount(refillTotalAmount)
        setPreviewLoanAmount(loanTotalAmount)
        
        // Use the balance specific to previewVoteCode! Pharmacy budget only pays for refill; loan charges fall under admin budget
        const { balanceBefore, balanceAfter } = computePoBalances(previewRecord, previewVoteCode, refillTotalAmount)

        const dynamicReception: OxygenReceptionRecord = {
          ...previewRecord,
          vote_code: previewVoteCode,
          vote_activity: previewVoteActivity
        }

        const blob = await generateOxygenPoPdf({
          reception: dynamicReception,
          items: formattedItems,
          applicantName: previewSignatures.applicantName,
          applicantPosition: previewSignatures.applicantPosition,
          headName: previewSignatures.headName,
          headPosition: previewSignatures.headPosition,
          balanceBefore,
          balanceAfter,
          supplierName: matchedSup?.company_name || targetSupName,
          supplierAddress: matchedSup?.address || (isLindeSupplier(targetSupName) ? lindeSupplier?.address : '') || '',
          supplierPhone: matchedSup?.phone || (isLindeSupplier(targetSupName) ? lindeSupplier?.phone : '') || '',
          loanRates: supplierLoanRates,
          loanVoteCode: previewRecord.loan_vote_code || (previewRecord.vote_code && !previewRecord.vote_code.startsWith('080') ? previewRecord.vote_code : (previewVoteCode.startsWith('24') || previewVoteCode.startsWith('0202') ? previewVoteCode : '24000')),
          loanVoteActivity: previewRecord.loan_vote_activity || (previewRecord.vote_activity && previewRecord.vote_activity !== '27402' ? previewRecord.vote_activity : (previewVoteActivity === '020200' ? previewVoteActivity : '020200'))
        })

        if (active) {
          const url = URL.createObjectURL(blob)
          setPreviewPdfUrl(url)
        }
      } catch (err) {
        console.error('Error generating preview PDF:', err)
      }
    }

    void generatePreview()

    return () => {
      active = false
    }
  }, [isPoPreviewModalOpen, previewRecord, previewVoteCode, previewVoteActivity, previewSignatures.applicantName, previewSignatures.applicantPosition, previewSignatures.headName, previewSignatures.headPosition, financials])

  // Pricing Form state
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({})
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0])
  const [isSavingPrices, setIsSavingPrices] = useState(false)

  // Reception Form state
  const [doNumber, setDoNumber] = useState('')
  const [soNumber, setSoNumber] = useState('')
  const [receptionDate, setReceptionDate] = useState(new Date().toISOString().split('T')[0])
  const [voteCode, setVoteCode] = useState('080702')
  const [voteActivity, setVoteActivity] = useState('27402')
  const [receptionStatus, setReceptionStatus] = useState<'completed' | 'pending_invoice' | 'outstanding_po'>('completed')
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({})
  const [receiveLoans, setReceiveLoans] = useState<Record<string, number>>({})
  const [isSubmittingReception, setIsSubmittingReception] = useState(false)

  // Password Protection Modal state for Reset Inventory
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [clearPasswordInput, setClearPasswordInput] = useState('')
  const [clearPasswordError, setClearPasswordError] = useState('')
  const [showClearPassword, setShowClearPassword] = useState(false)

  // Fetch real data
  const loadData = async () => {
    if (!hospitalId) return
    setIsLoading(true)
    setError(null)

    // Determine target page size: 5000 if we are on cylinders registry or reconciliation pages, otherwise 10
    const needsFullList = 
      currentPath === '/pharmacy/oxygen/cylinders' || 
      currentPath === '/pharmacy/oxygen/reconciliation' ||
      currentPath === '/pharmacy/oxygen/qr'
    const limit = needsFullList ? 5000 : 10

    try {
      const [
        summaryRes, 
        listRes, 
        historyRes,
        finRes,
        pricingRes,
        pricingHistoryRes,
        receptionsRes,
        settingsRes,
        typesRes
      ]: [
        ApiResponse<OxygenSummary>,
        ApiResponse<Paginated<OxygenCylinderWithRelations>>,
        ApiResponse<OxygenConsumptionWithRelations[]>,
        ApiResponse<OxygenFinancialSummary>,
        ApiResponse<OxygenPricingConfig[]>,
        ApiResponse<any[]>,
        ApiResponse<OxygenReceptionRecord[]>,
        ApiResponse<OxygenSystemSettings>,
        ApiResponse<OxygenCylinderTypeInfo[]>
      ] = await Promise.all([
        getOxygenSummary(hospitalId),
        getOxygenCylinders(hospitalId, {}, 1, limit) as any,
        getOxygenConsumptionHistory(hospitalId),
        getOxygenFinancialSummary(hospitalId),
        getOxygenLatestPricing(hospitalId),
        getOxygenPricingHistory(hospitalId),
        getOxygenReceptionsList(hospitalId),
        getOxygenSystemSettings(hospitalId),
        getOxygenCylinderTypes()
      ])

      const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine

      if (summaryRes.error && isOnline) {
        setError(summaryRes.error)
      } else {
        setError(null)
        setSummary(summaryRes.data || null)
      }

      if (listRes.error && isOnline) {
        setError((prev) => prev ?? listRes.error)
      } else {
        setCylinders(listRes.data?.data || [])
      }

      // Only fetch tagged cylinders if we are on the paths that need them
      if (needsFullList) {
        const taggedRes = await getOxygenCylinders(hospitalId, { qr_tagged: true, include_deactivated: true }, 1, 5000)
        if (taggedRes.data) {
          setTaggedCylindersList(taggedRes.data.data || [])
        }
      } else {
        setTaggedCylindersList([])
      }

      if (historyRes.error) {
        console.error('Error fetching consumption history:', historyRes.error)
      } else {
        setConsumptionHistory(historyRes.data || [])
      }

      // Populate Financials
      if (finRes.data) {
        setFinancials(finRes.data)
        if (finRes.data.available_vote_codes && finRes.data.available_vote_codes.length > 0) {
          setAvailableVoteCodes(finRes.data.available_vote_codes)
        }
      }
      const voteCodesRes = await getRegisteredOxygenVoteCodes(hospitalId)
      if (voteCodesRes.data && voteCodesRes.data.length > 0) {
        setAvailableVoteCodes(prev => Array.from(new Set([...prev, ...(voteCodesRes.data || [])])))
      }
      if (pricingRes.data) {
        setPricingConfigs(pricingRes.data)
        // Set initial edited prices
        const priceMap: Record<string, string> = {}
        pricingRes.data.forEach(p => {
          priceMap[p.cylinder_size_code] = p.refill_price.toString()
        })
        setEditedPrices(priceMap)
      }
      if (pricingHistoryRes.data) {
        setPricingHistory(pricingHistoryRes.data)
      }
      if (receptionsRes.data) setReceptionsList(receptionsRes.data)
      if (settingsRes.data) setSystemSettings(settingsRes.data)

      if (typesRes.data) {
        setCylinderTypes(typesRes.data)
      }


      const sigsRes = await getPharmacyPOSignatures(hospitalId)
      if (sigsRes.data) {
        setSignatures(sigsRes.data)
        setTempSignatures(sigsRes.data)
      }

      const { data: rawUsers } = await supabase
        .from('users')
        .select('id, full_name, jawatan, department_id, department:departments!department_id(id, department_name), role:roles(role_name)')
        .eq('hospital_id', hospitalId)
      if (rawUsers) {
        setHospitalUsers(rawUsers as any)
      }

      // Load Cylinder Request & Dispatch Data
      const dispatchRes = await getCylinderDispatchRequests(hospitalId)
      if (dispatchRes.data) setDispatchRequests(dispatchRes.data)

      const kpiRes = await getCylinderDispatchKPI(hospitalId)
      if (kpiRes.data) setDispatchKpi(kpiRes.data)

      const clinicalDepts = await getClinicalDepartments(hospitalId)
      if (clinicalDepts && clinicalDepts.length > 0) {
        setDepartmentsList(clinicalDepts.map(d => ({ id: d.id, department_name: d.department_name })))
      }

      // Fetch reconciliation audit logs
      if (isSupabaseConfigured()) {
        try {
          const { data: auditLogsData } = await supabase
            .from('audit_logs')
            .select('*, user:users(full_name, jawatan)')
            .eq('module', 'OXYGEN_INVENTORY')
            .in('action', ['RECONCILED_CYLINDER_STATUS', 'VERIFIED_CYLINDER_AUDIT', 'AUTO_REGISTER_ON_SCAN', 'STOCK_RECONCILIATION'])
            .order('created_at', { ascending: false })
            .limit(20)
          
          if (auditLogsData) {
            setReconciliationLogs(auditLogsData)
          }
        } catch (auditErr) {
          console.warn('Failed to fetch audit logs:', auditErr)
        }
      } else {
        // Fallback mock logs
        setReconciliationLogs([
          {
            id: 'log-1',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: { full_name: 'Kamriah Bt Haji Mail', jawatan: 'Penolong Pegawai Farmasi' },
            new_values: { serial_number: '101-I-PI-0001', status: 'available', location: 'Pharmacy Store' },
            old_values: { status: 'empty' }
          },
          {
            id: 'log-2',
            created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            user: { full_name: 'Tan Yuang Zhang', jawatan: 'Pegawai Farmasi UF12' },
            new_values: { serial_number: '101 F 0002', status: 'returned_to_supplier', location: 'Supplier' },
            old_values: { status: 'available' }
          }
        ])
      }

    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred while loading oxygen records.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hospitalId) {
      void cylinderSyncEngine.initialize(hospitalId)
    }
    void loadData()
    if (currentPath === '/pharmacy/oxygen/cylinders' && hospitalId) {
      const loadInventoryDashboardData = async () => {
        const [aggRes, deptRes, docsRes, reqsRes, recRes, ledgerRes] = await Promise.all([
          getCylinderInventoryByType(hospitalId),
          getCylindersByDepartment(hospitalId),
          getReturnDocuments(hospitalId),
          getRequestDocuments(hospitalId),
          getReceiveDocuments(hospitalId),
          getStoreUsageBalance(hospitalId, ledgerStartDate, ledgerEndDate),
        ])
        if (aggRes.data) setCylinderAggregates(aggRes.data)
        if (deptRes.data) setDeptDistribution(deptRes.data)
        if (docsRes.data) setReturnDocs(docsRes.data)
        if (reqsRes.data) setRequestDocs(reqsRes.data)
        if (recRes.data) setReceiveDocs(recRes.data)
        if (ledgerRes.data) setLedgerData(ledgerRes.data)
      }
      void loadInventoryDashboardData()
    }
  }, [hospitalId, currentPath, ledgerStartDate, ledgerEndDate])

  const handleRefreshInventoryData = async () => {
    if (!hospitalId) return
    setIsLoading(true)
    try {
      await loadData()
      setCylinderAggregates([])
      setDeptDistribution([])
      setReturnDocs([])
      setRequestDocs([])
      setReceiveDocs([])
      setLedgerData([])
      const [aggRes, deptRes, docsRes, reqsRes, recRes, ledgerRes] = await Promise.all([
        getCylinderInventoryByType(hospitalId),
        getCylindersByDepartment(hospitalId),
        getReturnDocuments(hospitalId),
        getRequestDocuments(hospitalId),
        getReceiveDocuments(hospitalId),
        getStoreUsageBalance(hospitalId, ledgerStartDate, ledgerEndDate),
      ])
      if (aggRes.data) setCylinderAggregates(aggRes.data)
      if (deptRes.data) setDeptDistribution(deptRes.data)
      if (docsRes.data) setReturnDocs(docsRes.data)
      if (reqsRes.data) setRequestDocs(reqsRes.data)
      if (recRes.data) setReceiveDocs(recRes.data)
      if (ledgerRes.data) setLedgerData(ledgerRes.data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenClearModal = () => {
    setClearPasswordInput('')
    setClearPasswordError('')
    setShowClearPassword(false)
    setIsClearModalOpen(true)
  }

  const handleConfirmClearInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalId) return

    if (clearPasswordInput !== 'F@rmasi.2016') {
      setClearPasswordError(
        language === 'ms'
          ? 'Akses Ditolak: Kata laluan pentadbir tidak sah.'
          : 'Access Denied: Invalid administrator password.'
      )
      return
    }

    setIsLoading(true)
    setClearPasswordError('')
    try {
      const res = await clearCylinderInventory(hospitalId, user?.id, clearPasswordInput)
      if (res.data) {
        await loadData()
        await handleRefreshInventoryData()
        setIsClearModalOpen(false)
        setClearPasswordInput('')
        alert(
          language === 'ms'
            ? 'PENGESAHAN KESELAMATAN: Data stok silinder telah diset semula & log audit telah direkodkan.'
            : 'SECURITY CONFIRMED: Stock inventory has been reset & audit log recorded.'
        )
      } else {
        setClearPasswordError(res.error || 'Gagal mengosongkan inventori.')
      }
    } catch (err: any) {
      console.error(err)
      setClearPasswordError('Ralat sistem semasa mengosongkan stok.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'full':
        return <Badge variant="success">Full</Badge>
      case 'empty':
        return <Badge variant="secondary">Empty</Badge>
      case 'in_use':
        return <Badge variant="info">In Use</Badge>
      case 'maintenance':
        return <Badge variant="warning">Maintenance</Badge>
      case 'disposed':
        return <Badge variant="error">Disposed</Badge>
      case 'deactivated':
        return <Badge variant="error">{language === 'ms' ? 'Dinyahaktifkan' : 'Deactivated'}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Filtered cylinders based on user inputs
  const filteredCylinders = cylinders.filter(c => {
    const matchesSearch = c.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? c.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  // Columns for Cylinder Table
  const cylinderColumns: Column<OxygenCylinderWithRelations>[] = [
    {
      key: 'serial_number',
      label: 'Serial Number',
      className: 'font-mono text-xs text-text-secondary font-bold',
    },
    {
      key: 'type_info',
      label: 'Cylinder Size & Type',
      className: 'text-sm text-text-primary',
      render: (_, row) => row.type_info?.type_name || 'Standard Cylinder',
    },
    {
      key: 'current_location',
      label: 'Storage Location',
      className: 'text-sm text-text-muted',
      render: (_, row) => typeof row.current_location === 'object' ? (row.current_location?.location_name || 'Central Pharmacy Store') : (row.current_location || 'Central Pharmacy Store'),
    },
    {
      key: 'assigned_ward',
      label: 'Assigned Department',
      className: 'text-sm text-text-muted',
      render: (_, row) => row.assigned_ward?.department_name || '-',
    },
    {
      key: 'status',
      label: 'Current Status',
      className: 'text-right',
      render: (value) => renderStatusBadge(String(value)),
    },
  ]

  // Columns for Consumption/Refill History Table
  const consumptionColumns: Column<OxygenConsumptionWithRelations>[] = [
    {
      key: 'consumption_date',
      label: 'Date',
      className: 'text-sm text-text-primary',
      render: (value) => value ? new Date(String(value)).toLocaleDateString() : '-',
    },
    {
      key: 'cylinder',
      label: 'Cylinder Serial',
      className: 'font-mono text-xs text-text-secondary font-bold',
      render: (_, row) => row.cylinder?.serial_number || 'BULK DISPATCH',
    },
    {
      key: 'department',
      label: 'Requesting Unit',
      className: 'text-sm text-text-muted',
      render: (_, row) => row.department?.department_name || 'Emergency Trauma Unit',
    },
    {
      key: 'quantity_used',
      label: 'Quantity Refilled',
      className: 'text-sm text-text-primary font-semibold',
      render: (val, row) => `${val} ${row.unit || 'liters'}`,
    },
    {
      key: 'notes',
      label: 'Remarks / Notes',
      className: 'text-sm text-text-muted italic',
      render: (val) => val || 'Scheduled ward refill',
    }
  ]

  const getReconciliationChangesList = (): AuditChangeItem[] => {
    const allTrackedIds = Array.from(new Set([...Object.keys(physicalCounts), ...Object.keys(physicalLocations)]));
    return allTrackedIds
      .map(cylId => {
        const cyl = cylinders.find(c => c.id === cylId);
        if (!cyl) return null;
        const normalizedOld = getExpectedStateForCylinder(cyl);
        const normalizedNew = physicalCounts[cylId] ? normalizeStatusForReconciliation(physicalCounts[cylId]) : normalizedOld;
        const rawOldLocation = getCylinderLocation(cyl, normalizedOld);
        const rawNewLocation = physicalLocations[cylId] || getCylinderLocation(cyl, normalizedNew);
        const oldLocation = typeof rawOldLocation === 'object' ? (rawOldLocation?.location_name || rawOldLocation?.name || 'Pharmacy Store') : (rawOldLocation || 'Pharmacy Store');
        const newLocation = typeof rawNewLocation === 'object' ? (rawNewLocation?.location_name || rawNewLocation?.name || 'Pharmacy Store') : (rawNewLocation || 'Pharmacy Store');

        const statusChanged = normalizedOld !== normalizedNew;
        const locationChanged = Boolean(physicalLocations[cylId]);

        if (!statusChanged && !locationChanged) return null;

        return {
          cylinderId: cyl.id,
          serialNumber: cyl.serial_number,
          typeInfo: cyl.type_info?.type_name || 'Medical Oxygen',
          sizeInfo: cyl.size_info?.capacity ? `${cyl.size_info.capacity}m³` : 'Standard',
          oldStatus: getStatusLabel(normalizedOld),
          newStatus: getStatusLabel(normalizedNew),
          oldLocation: oldLocation,
          newLocation: newLocation
        };
      })
      .filter(Boolean) as AuditChangeItem[];
  };

  const handleOpenAuditReview = () => {
    const changes = getReconciliationChangesList();
    if (changes.length === 0) {
      alert('No status or location changes to save.');
      return;
    }
    setIsAuditReviewOpen(true);
  };

  const handleAuditSubmit = async (remarks?: string) => {
    if (!hospitalId || !user?.id) return;
    setIsSavingReconciliation(true);
    setAuditSuccessMsg(null);
    
    try {
      const allTrackedIds = Array.from(new Set([...Object.keys(physicalCounts), ...Object.keys(physicalLocations)]));
      const updates = allTrackedIds.filter(cylId => {
        const cyl = cylinders.find(c => c.id === cylId);
        if (!cyl) return false;
        const normalizedOld = getExpectedStateForCylinder(cyl);
        const normalizedNew = physicalCounts[cylId] ? normalizeStatusForReconciliation(physicalCounts[cylId]) : normalizedOld;
        const locationChanged = Boolean(physicalLocations[cylId]);
        return normalizedOld !== normalizedNew || locationChanged;
      });

      if (updates.length === 0) {
        alert('No status or location changes to save.');
        setIsSavingReconciliation(false);
        setIsAuditReviewOpen(false);
        return;
      }

      let successCount = 0;

      for (const cylId of updates) {
        const cyl = cylinders.find(c => c.id === cylId);
        if (!cyl) continue;

        const normalizedOld = getExpectedStateForCylinder(cyl);
        const normalizedNew = physicalCounts[cylId] || normalizedOld;
        const rawNewLocation = physicalLocations[cylId] || getCylinderLocation(cyl, normalizedNew);
        let newLocation = typeof rawNewLocation === 'object' ? (rawNewLocation?.location_name || rawNewLocation?.name || 'Pharmacy Store') : (rawNewLocation || 'Pharmacy Store');
        if (normalizedNew === 'available') {
          newLocation = 'Pharmacy Store';
        }
        const dbStatus = mapReconciliationToDbStatus(normalizedNew, newLocation);

        if (isSupabaseConfigured()) {
          // Update the primary table (pharmacy_oxygen_cylinder_inventory) which holds the data
          const { error: updateErr } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .update({
              status: dbStatus,
              current_location: newLocation,
              updated_at: new Date().toISOString()
            })
            .eq('id', cylId);

          if (updateErr) {
            console.error(`Failed to update cylinder ${cyl.serial_number}:`, updateErr);
            continue;
          }

          // Insert audit log
          await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'RECONCILED_CYLINDER_STATUS',
            module: 'OXYGEN_INVENTORY',
            entity_type: 'cylinder',
            entity_id: cylId,
            old_values: { status: normalizedOld },
            new_values: { status: normalizedNew, serial_number: cyl.serial_number, location: newLocation, remarks: remarks || null },
            ip_address: null,
            user_agent: null,
            created_at: new Date().toISOString()
          });

          successCount++;
        } else {
          // Mock update
          const mockCylIndex = mockOxygenCylinders.findIndex(c => c.id === cylId);
          if (mockCylIndex !== -1) {
            mockOxygenCylinders[mockCylIndex].status = dbStatus;
            mockOxygenCylinders[mockCylIndex].current_location = { location_name: newLocation };
            mockOxygenCylinders[mockCylIndex].updated_at = new Date().toISOString();
          }

          // Update local state copy
          cyl.status = dbStatus;
          cyl.current_location = { location_name: newLocation };

          // Add to local reconciliation logs list
          const newLog = {
            id: `log-${Date.now()}-${Math.random()}`,
            created_at: new Date().toISOString(),
            user: { full_name: user.full_name || 'Pharmacy Officer', jawatan: user.jawatan || 'Officer' },
            new_values: { serial_number: cyl.serial_number, status: normalizedNew, location: newLocation, remarks: remarks || null },
            old_values: { status: normalizedOld }
          };
          setReconciliationLogs(prev => [newLog, ...prev]);
          successCount++;
        }
      }

      setPhysicalCounts({});
      setPhysicalLocations({});
      setIsAuditReviewOpen(false);
      setAuditSuccessMsg(`Stock reconciliation verified. ${successCount} status changes logged successfully.`);
      setTimeout(() => setAuditSuccessMsg(null), 5000);
      await loadData();
    } catch (err) {
      console.error('Reconciliation save error:', err);
      alert('Failed to save reconciliation audit.');
    } finally {
      setIsSavingReconciliation(false);
    }
  };

  // --- NEW FINANCIAL LOGIC ---
  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalId || !user?.id) return
    setIsSavingPrices(true)
    try {
      const targetSupplier = isAddingNewSupplier && customSupplierInput.trim()
        ? customSupplierInput.trim()
        : selectedModalSupplier

      const pricesToInsert = Object.keys(editedPrices).map(sizeCode => {
        const isLoanCyl = sizeCode === '101-N' || sizeCode === '101-F'
        const loanVal = editedLoanRates[sizeCode] !== undefined 
          ? parseFloat(editedLoanRates[sizeCode]) 
          : (systemSettings?.loan_cylinder_rate || 18.36)
        return {
          size_code: sizeCode,
          refill_price: parseFloat(editedPrices[sizeCode]) || 0,
          ...(isLoanCyl ? { loan_rate: isNaN(loanVal) ? 18.36 : loanVal } : {})
        }
      })

      const res = await updateCylinderPrices(hospitalId, pricesToInsert, effectiveFrom, user.id, targetSupplier)
      if (res.error) {
        alert(res.error)
      } else {
        setIsPricingModalOpen(false)
        if (isAddingNewSupplier && customSupplierInput.trim()) {
          setSelectedModalSupplier(customSupplierInput.trim())
          setIsAddingNewSupplier(false)
          setCustomSupplierInput('')
        }
        await loadData()
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save prices.')
    } finally {
      setIsSavingPrices(false)
    }
  }

  const handleSaveSignatures = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalId || !user?.id) return
    setIsSavingOfficers(true)
    try {
      const res = await updatePharmacyPOSignatures(tempSignatures, hospitalId, user.id)
      if (res.error) {
        alert(res.error)
      } else {
        setSignatures(tempSignatures)
        setIsOfficerModalOpen(false)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save signatures.')
    } finally {
      setIsSavingOfficers(false)
    }
  }

  const handleOpenPoPreview = (record: OxygenReceptionRecord) => {
    setPreviewRecord(record)
    const isPureLoan = (Number(record.refill_amount) || 0) === 0 && (Number(record.loan_amount) || 0) > 0
    const initialVote = record.vote_code || (isPureLoan ? '24000' : '080702')
    setPreviewVoteCode(initialVote)
    setPreviewVoteActivity(record.vote_activity || (isPureLoan ? '020200' : financials?.by_vote_code?.[initialVote]?.vote_activity || '27402'))
    setPreviewSignatures({
      applicantName: signatures.applicantName,
      applicantPosition: signatures.applicantPosition,
      headName: signatures.headName,
      headPosition: signatures.headPosition
    })
    setIsPoPreviewModalOpen(true)
  }

  const handleSaveVoteCodeForPreview = async (overrideCode?: string, overrideActivity?: string) => {
    if (!previewRecord) return
    const codeToSave = overrideCode || previewVoteCode
    const actToSave = overrideActivity || previewVoteActivity || financials?.by_vote_code?.[codeToSave]?.vote_activity || '27402'
    setIsSavingVoteCode(true)
    try {
      const targetIds = (Array.isArray(previewRecord.ids) && previewRecord.ids.length > 0)
        ? previewRecord.ids
        : [previewRecord.id].filter(id => id && !id.startsWith('monthly-'))

      if (targetIds.length > 0) {
        const res = await updateOxygenReceptionsVoteCode(targetIds, codeToSave, actToSave)
        if (res.data) {
          setPreviewRecord(prev => prev ? { ...prev, vote_code: codeToSave, vote_activity: actToSave } : null)
          setReceptionsList(prev => prev.map(r => {
            if (targetIds.includes(r.id) || (r.ids && r.ids.some(id => targetIds.includes(id)))) {
              return { ...r, vote_code: codeToSave, vote_activity: actToSave }
            }
            return r
          }))
          setVoteSaveSuccess(true)
          setTimeout(() => setVoteSaveSuccess(false), 3000)
          void loadData()
        }
      }
    } catch (err) {
      console.error('Error saving vote code for preview:', err)
    } finally {
      setIsSavingVoteCode(false)
    }
  }

  const handleOpenVoteOverrideModal = (record: OxygenReceptionRecord | any) => {
    if (!record) return
    setOverrideTargetRecord(record)
    const currentVote = record.vote_code || '080702'
    const otherCode = currentVote.startsWith('080600') ? '080702' : '080600'
    setOverrideSelectedVoteCode(otherCode)
    const act = financials?.by_vote_code?.[otherCode]?.vote_activity || '27402'
    setOverrideSelectedVoteActivity(act)
    setOverridePasswordInput('')
    setOverrideReasonInput('')
    setOverrideError('')
    setShowOverridePassword(false)
    setIsVoteOverrideModalOpen(true)
  }

  const handleSubmitVoteOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!overrideTargetRecord) return
    setOverrideError('')

    // 1. Verify Password against official "F@rmasi.2016"
    if (overridePasswordInput.trim() !== 'F@rmasi.2016') {
      setOverrideError(
        language === 'ms'
          ? 'Kata laluan keselamatan tidak sah. Sila masukkan kata laluan "F@rmasi.2016" yang betul.'
          : 'Invalid security password. Please enter the valid authorization password "F@rmasi.2016".'
      )
      return
    }

    // 2. Verify Reason
    if (!overrideReasonInput.trim() || overrideReasonInput.trim().length < 5) {
      setOverrideError(
        language === 'ms'
          ? 'Sila nyatakan sebab / justifikasi pertukaran kod vot (minimum 5 aksara) untuk rekod audit keselamatan.'
          : 'Please provide a valid reason / justification for changing the vote code (minimum 5 characters).'
      )
      return
    }

    setOverrideIsSubmitting(true)
    try {
      const oldCode = overrideTargetRecord.vote_code || '080702'
      const oldAct = overrideTargetRecord.vote_activity || '27402'
      const newCode = overrideSelectedVoteCode
      const newAct = overrideSelectedVoteActivity || financials?.by_vote_code?.[newCode]?.vote_activity || '27402'

      const targetIds = (Array.isArray(overrideTargetRecord.ids) && overrideTargetRecord.ids.length > 0)
        ? overrideTargetRecord.ids
        : [overrideTargetRecord.id].filter(id => id && !id.startsWith('monthly-'))

      if (targetIds.length > 0) {
        // 3. Update Database records
        const updateRes = await updateOxygenReceptionsVoteCode(targetIds, newCode, newAct)
        if (updateRes.error) {
          throw new Error(updateRes.error)
        }

        // 4. Log to audit_logs
        await supabase.from('audit_logs').insert({
          user_id: user?.id || null,
          action: 'OVERRIDE_OXYGEN_VOTE_CODE',
          module: 'MYCYLINDER_OXYGEN',
          entity_type: 'pharmacy_oxygen_reception_records',
          entity_id: targetIds[0],
          old_values: {
            vote_code: oldCode,
            vote_activity: oldAct,
            delivery_order_no: overrideTargetRecord.delivery_order_no,
            target_ids: targetIds
          },
          new_values: {
            vote_code: newCode,
            vote_activity: newAct,
            reason: overrideReasonInput.trim(),
            authorized_by_password: 'F@rmasi.2016',
            user_name: user?.full_name || 'Staff Farmasi',
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        })

        // 5. Update In-Memory States
        setReceptionsList(prev => prev.map(r => {
          if (targetIds.includes(r.id) || (r.ids && r.ids.some(id => targetIds.includes(id)))) {
            return { ...r, vote_code: newCode, vote_activity: newAct }
          }
          return r
        }))

        // If currently open in Modal 5 preview:
        if (previewRecord && (targetIds.includes(previewRecord.id) || (previewRecord.ids && previewRecord.ids.some(id => targetIds.includes(id))))) {
          setPreviewRecord(prev => prev ? { ...prev, vote_code: newCode, vote_activity: newAct } : null)
          setPreviewVoteCode(newCode)
          setPreviewVoteActivity(newAct)
        }

        setIsVoteOverrideModalOpen(false)
        await loadData()
      }
    } catch (err: any) {
      console.error('Error overriding vote code:', err)
      setOverrideError(err.message || 'Ralat semasa mengemas kini kod vot.')
    } finally {
      setOverrideIsSubmitting(false)
    }
  }

  const handleGeneratePoWithCustomSignatures = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!previewRecord) return
    try {
      const poSupplierName = previewRecord.supplier_name || 'LINDE EOX SDN BHD (CAW. MIRI)'
      const poMatchedSup = dbSuppliers.find(s => isSupplierMatch(s.company_name, poSupplierName))

      // Build per-size loan rates from pricingConfigs for the matched supplier
      const poLoanRates: Record<string, number> = {}
      pricingConfigs
        .filter(c => isSupplierMatch(c.supplier_name, poSupplierName))
        .forEach(c => { if (c.loan_rate != null) poLoanRates[c.cylinder_size_code] = c.loan_rate })

      const formattedItems = await fetchAndConsolidateReceptionItems(previewRecord, poSupplierName)

      const totalAmount = formattedItems.reduce((sum, item) => sum + item.total_price, 0)
      const refillTotalAmount = formattedItems.filter(i => !i.is_loan).reduce((sum, item) => sum + item.total_price, 0)
      const { balanceBefore, balanceAfter } = computePoBalances(previewRecord, previewVoteCode, refillTotalAmount)

      const dynamicReception: OxygenReceptionRecord = {
        ...previewRecord,
        vote_code: previewVoteCode,
        vote_activity: previewVoteActivity
      }

      // Persist chosen vote code to DB for this reception or consolidated batch
      const targetIds = (Array.isArray(previewRecord.ids) && previewRecord.ids.length > 0)
        ? previewRecord.ids
        : [previewRecord.id].filter(id => id && !id.startsWith('monthly-'))

      if (targetIds.length > 0) {
        await updateOxygenReceptionsVoteCode(targetIds, previewVoteCode, previewVoteActivity)
        void loadData()
      }

      const blob = await generateOxygenPoPdf({
        reception: dynamicReception,
        items: formattedItems,
        applicantName: previewSignatures.applicantName,
        applicantPosition: previewSignatures.applicantPosition,
        headName: previewSignatures.headName,
        headPosition: previewSignatures.headPosition,
        balanceBefore,
        balanceAfter,
        supplierName: poMatchedSup?.company_name || poSupplierName,
        supplierAddress: poMatchedSup?.address || (isLindeSupplier(poSupplierName) ? lindeSupplier?.address : '') || '',
        supplierPhone: poMatchedSup?.phone || (isLindeSupplier(poSupplierName) ? lindeSupplier?.phone : '') || '',
        loanRates: poLoanRates,
        loanVoteCode: previewRecord.loan_vote_code || (previewRecord.vote_code && !previewRecord.vote_code.startsWith('080') ? previewRecord.vote_code : (previewVoteCode.startsWith('24') || previewVoteCode.startsWith('0202') ? previewVoteCode : '24000')),
        loanVoteActivity: previewRecord.loan_vote_activity || (previewRecord.vote_activity && previewRecord.vote_activity !== '27402' ? previewRecord.vote_activity : (previewVoteActivity === '020200' ? previewVoteActivity : '020200'))
      })

      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setIsPoPreviewModalOpen(false)
    } catch (err) {
      console.error('Error generating PO PDF:', err)
      alert('Failed to generate PO PDF.')
    }
  }

  const getSupplierPricingConfig = (sizeCode: string, supplierName: string) => {
    const supplierConfigs = pricingConfigs.filter(c => isSupplierMatch(c.supplier_name, supplierName))
    const match = supplierConfigs.find(c => c.cylinder_size_code === sizeCode)
    if (match) return match
    // Only fall back to Linde if supplierName is unselected or is Linde
    if (!supplierName || isLindeSupplier(supplierName)) {
      return pricingConfigs.find(c => isLindeSupplier(c.supplier_name) && c.cylinder_size_code === sizeCode)
    }
    return undefined
  }

  const getActivePrice = (sizeCode: string, supplierName = selectedReceiveSupplier): number => {
    const config = getSupplierPricingConfig(sizeCode, supplierName)
    if (config) return config.refill_price
    // Default fallback base refill prices when no config found for specific size
    if (sizeCode === '101-N') return 250.00
    if (sizeCode === '101-F' || sizeCode === 'P101-F') return 118.00
    if (sizeCode.includes('Liquid Medical Oxygen') || sizeCode.includes('VIE Tank')) return 3.60
    return 0
  }

  const getActiveLoanRate = (sizeCode: string, supplierName = selectedReceiveSupplier): number => {
    const config = getSupplierPricingConfig(sizeCode, supplierName)
    if (config?.loan_rate != null) return config.loan_rate
    if (supplierName && !isLindeSupplier(supplierName)) return 15.00
    return systemSettings?.loan_cylinder_rate || 18.36
  }

  // Dynamic cost calculations for key-in form
  const getRefillCostForSize = (sizeCode: string): number => {
    const qty = receiveQuantities[sizeCode] || 0
    const price = getActivePrice(sizeCode, selectedReceiveSupplier)
    return qty * price
  }

  const getLoanCostForSize = (sizeCode: string): number => {
    const isLoanSize = sizeCode.startsWith('101-')
    const rate = getActiveLoanRate(sizeCode, selectedReceiveSupplier)
    if (isLoanSize) {
      const qtyRefilled = receiveQuantities[sizeCode] || 0
      const qtyLoaned = receiveLoans[sizeCode] || 0
      return (qtyRefilled + qtyLoaned) * rate
    }
    const qtyLoaned = receiveLoans[sizeCode] || 0
    return qtyLoaned * rate
  }

  const getActiveSizeCodes = (): string[] => {
    const fromConfigs = pricingConfigs
      .filter((c) => isSupplierMatch(c.supplier_name, selectedReceiveSupplier) || isLindeSupplier(c.supplier_name))
      .map(c => c.cylinder_size_code)
    const fromInputs = [...Object.keys(receiveQuantities), ...Object.keys(receiveLoans)]
    return Array.from(new Set([...fromConfigs, ...fromInputs]))
  }

  const calculateFormRefillTotal = (): number => {
    return getActiveSizeCodes().reduce((sum, sizeCode) => {
      return sum + getRefillCostForSize(sizeCode)
    }, 0)
  }

  const calculateFormLoanTotal = (): number => {
    return getActiveSizeCodes().reduce((sum, sizeCode) => {
      return sum + getLoanCostForSize(sizeCode)
    }, 0)
  }

  const handleCreateReception = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalId || !user?.id) return

    const isLiquidOrder = (receiveQuantities['Liquid Medical Oxygen (VIE Tank)'] || 0) > 0
    const hasCylinderOrder = Object.entries(receiveQuantities).some(([k, v]) => !k.toLowerCase().includes('vie') && !k.toLowerCase().includes('liquid') && (v as number) > 0)
    if (isLiquidOrder && hasCylinderOrder) {
      alert(language === 'ms'
        ? 'Tangki VIE adalah perolehan khas oksigen cecair pukal dan TIDAK BOLEH digabungkan bersama silinder gas. Sila rekodkan Tangki VIE dan Silinder dalam transaksi berasingan.'
        : 'VIE Tank is a special bulk liquid oxygen procurement and CANNOT be combined with gas cylinders. Please record VIE Tank and Cylinders in separate transactions.')
      return
    }

    const isPendingOrder = isLiquidOrder && (!doNumber || !doNumber.trim() || doNumber.trim().toUpperCase() === 'PENDING')

    if (!isPendingOrder && (!doNumber || !soNumber)) {
      alert('Please fill in Delivery Order and Sales Order numbers.')
      return
    }

    setIsSubmittingReception(true)
    try {
      const refillAmt = calculateFormRefillTotal()
      const loanAmt = calculateFormLoanTotal()
      const grandTotal = refillAmt + loanAmt

      // Formulate items
      const itemsToCreate: Omit<OxygenReceptionItem, 'id' | 'reception_id' | 'created_at'>[] = []
      
      // Retrieve sizes from DB
      const { data: sizesList } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('*')
      const { data: typesList } = await supabase.from('pharmacy_oxygen_cylinder_types').select('*')
      const defaultType = typesList?.[0]?.id || ''

      for (const sizeCode of getActiveSizeCodes()) {
        const qtyRefilled = receiveQuantities[sizeCode] || 0
        const qtyLoaned = receiveLoans[sizeCode] || 0
        if (qtyRefilled === 0 && qtyLoaned === 0) continue
        
        const sizeObj = sizesList?.find(s => s.code === sizeCode || s.code === sizeCode.replace(/^P/, '') || `P${s.code}` === sizeCode)
        if (!sizeObj) continue

        const isPerM3 = sizeCode.toLowerCase().includes('liquid') || sizeCode.toLowerCase().includes('vie')
        const basePrice = getActivePrice(sizeCode, selectedReceiveSupplier)
        const loanRate = getActiveLoanRate(sizeCode, selectedReceiveSupplier)

        // Insert refilled items
        if (qtyRefilled > 0) {
          const itemPrice = basePrice
          if (isPerM3) {
            itemsToCreate.push({
              cylinder_size_id: sizeObj.id,
              cylinder_type_id: defaultType,
              unit_price: itemPrice,
              quantity: qtyRefilled,
            })
          } else {
            for (let i = 0; i < qtyRefilled; i++) {
              itemsToCreate.push({
                cylinder_size_id: sizeObj.id,
                cylinder_type_id: defaultType,
                unit_price: itemPrice,
                quantity: 1,
              })
            }
          }
        }

        // Insert loaned items (only for loanable cylinders, never for bulk stationary VIE tanks)
        if (qtyLoaned > 0 && !isPerM3) {
          const itemPrice = loanRate
          for (let i = 0; i < qtyLoaned; i++) {
            itemsToCreate.push({
              cylinder_size_id: sizeObj.id,
              cylinder_type_id: defaultType,
              unit_price: itemPrice,
              quantity: 1,
            })
          }
        }
      }

      const finalDoNumber = doNumber.trim() || (isPendingOrder ? 'PENDING' : '')
      const finalSoNumber = soNumber.trim() || (isPendingOrder ? 'PENDING' : '')
      const finalStatus = isPendingOrder ? 'pending' : receptionStatus

      const res = await createOxygenReceptionRecord(
        hospitalId,
        {
          reception_date: receptionDate,
          delivery_order_no: finalDoNumber,
          sales_order_no: finalSoNumber,
          refill_amount: refillAmt,
          loan_amount: loanAmt,
          total_amount: grandTotal,
          vote_code: voteCode,
          vote_activity: voteActivity,
          status: finalStatus,
          supplier_name: selectedReceiveSupplier
        },
        itemsToCreate,
        user.id
      )

      if (res.error) {
        alert(res.error)
      } else {
        setIsReceiveModalOpen(false)
        setJustCreatedReception(res.data)
        setPdfSuccessModalOpen(true)
        
        // Reset form
        setDoNumber('')
        setSoNumber('')
        setReceiveQuantities({})
        setReceiveLoans({})
        setReceiveSupplyMode('cyl')
        
        await loadData()
      }
    } catch (err) {
      console.error(err)
      alert('Failed to log oxygen reception.')
    } finally {
      setIsSubmittingReception(false)
    }
  }

  const handleOpenPayLoanModal = async () => {
    setIsPayLoanModalOpen(true)
    setIsLoadingCustody(true)
    const initialSup = lindeDisplayName || 'LINDE EOX SDN BHD (CAW. MIRI)'
    setLoanSupplier(initialSup)
    setLoanVoteCode('24000')
    setLoanVoteActivity('020200')
    setLoanStatus('completed')
    setLoanRemarks(language === 'ms' ? 'Bayaran sewaan bulanan silinder pinjaman aktif di bawah Akaun Pentadbiran.' : 'Monthly rental fee for active cylinders under Administration Account.')
    setLoanInvoiceNo('')
    setLoanBillingRef('')
    setLoanBillingDate(new Date().toISOString().split('T')[0])

    try {
      if (isSupabaseConfigured() && hospitalId) {
        // Fetch loan sizes (101-F, 101-N, etc.)
        const { data: sizes } = await supabase
          .from('pharmacy_oxygen_cylinder_sizes')
          .select('*')
          .or('is_loan.eq.true,code.ilike.101-%')
          .order('code')

        // Fetch active cylinders in hospital custody
        const { data: invRows } = await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select('cylinder_size_id, status')
          .eq('hospital_id', hospitalId)
          .not('status', 'in', '("returned_to_supplier","deactivated")')

        const custodyMap: Record<string, number> = {}
        ;(invRows || []).forEach(row => {
          if (row.cylinder_size_id) {
            custodyMap[row.cylinder_size_id] = (custodyMap[row.cylinder_size_id] || 0) + 1
          }
        })

        const custodyList = (sizes || []).map(s => {
          const count = custodyMap[s.id] || 0
          const rate = getActiveLoanRate(s.code, initialSup) || (isLindeSupplier(initialSup) ? 18.36 : 15.00)
          return {
            sizeCode: s.code,
            sizeObj: s,
            activeCount: count,
            rate: rate
          }
        }).filter(item => !item.sizeCode.toLowerCase().includes('vie') && !item.sizeCode.toLowerCase().includes('liquid'))

        setActiveLoanCustody(custodyList)

        // Pre-populate loan quantities with active custody count
        const initQtys: Record<string, number> = {}
        const initRates: Record<string, number> = {}
        custodyList.forEach(c => {
          initQtys[c.sizeCode] = c.activeCount
          initRates[c.sizeCode] = c.rate
        })
        setLoanItemQuantities(initQtys)
        setLoanCustomRates(initRates)
      }
    } catch (err) {
      console.error('Error fetching loan custody:', err)
    } finally {
      setIsLoadingCustody(false)
    }
  }

  // Update rates when supplier changes inside the loan payment modal
  const handleLoanSupplierChange = (newSupplier: string) => {
    setLoanSupplier(newSupplier)
    setActiveLoanCustody(prev => prev.map(c => {
      const newRate = getActiveLoanRate(c.sizeCode, newSupplier) || (isLindeSupplier(newSupplier) ? 18.36 : 15.00)
      return { ...c, rate: newRate }
    }))
    setLoanCustomRates(prev => {
      const next = { ...prev }
      activeLoanCustody.forEach(c => {
        next[c.sizeCode] = getActiveLoanRate(c.sizeCode, newSupplier) || (isLindeSupplier(newSupplier) ? 18.36 : 15.00)
      })
      return next
    })
  }

  const handleCreateLoanPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalId || !user?.id) return

    if (!loanInvoiceNo || !loanInvoiceNo.trim()) {
      alert(language === 'ms' ? 'Please enter Supplier Invoice / Payment Claim No.' : 'Please enter the Supplier Invoice / Claim Reference Number.')
      return
    }

    setIsSubmittingLoanPayment(true)
    try {
      let grandLoanTotal = 0
      const itemsToCreate: Omit<OxygenReceptionItem, 'id' | 'reception_id' | 'created_at'>[] = []

      // Fetch default cylinder type
      const { data: typesList } = await supabase.from('pharmacy_oxygen_cylinder_types').select('*')
      const defaultType = typesList?.[0]?.id || ''

      activeLoanCustody.forEach(c => {
        const qty = loanItemQuantities[c.sizeCode] || 0
        const rate = loanCustomRates[c.sizeCode] !== undefined ? loanCustomRates[c.sizeCode] : c.rate
        if (qty > 0 && rate > 0) {
          grandLoanTotal += qty * rate
          itemsToCreate.push({
            cylinder_size_id: c.sizeObj.id,
            cylinder_type_id: defaultType,
            unit_price: rate,
            quantity: qty,
          })
        }
      })

      if (grandLoanTotal <= 0) {
        alert(language === 'ms' ? 'Jumlah bayaran mestilah melebihi RM 0.00. Sila masukkan kuantiti silinder pinjaman.' : 'Total loan charges must be greater than RM 0.00. Please enter cylinder quantities.')
        setIsSubmittingLoanPayment(false)
        return
      }

      const res = await createOxygenReceptionRecord(
        hospitalId,
        {
          reception_date: loanBillingDate,
          delivery_order_no: loanInvoiceNo.trim(),
          sales_order_no: loanBillingRef.trim() || '-',
          refill_amount: 0,
          loan_amount: grandLoanTotal,
          total_amount: grandLoanTotal,
          vote_code: loanVoteCode,
          vote_activity: loanVoteActivity,
          status: loanStatus,
          supplier_name: loanSupplier
        },
        itemsToCreate,
        user.id
      )

      if (res.error) {
        alert(res.error)
      } else {
        setIsPayLoanModalOpen(false)
        setJustCreatedReception(res.data)
        
        // Directly trigger PO preview modal for immediate verification and download
        if (res.data) {
          handleOpenPoPreview(res.data)
        }
        
        await loadData()
      }
    } catch (err) {
      console.error('Error recording standalone loan payment:', err)
      alert(language === 'ms' ? 'Ralat semasa merekodkan bayaran caj pinjaman.' : 'Failed to record loan payment.')
    } finally {
      setIsSubmittingLoanPayment(false)
    }
  }

  const handleOpenArrivalModal = (record: OxygenReceptionRecord) => {
    setArrivalRecord(record)
    const existingDo = record.delivery_order_no === 'PENDING' ? '' : (record.delivery_order_no || '')
    setArrivalDoNo(existingDo)
    setArrivalSoNo(record.sales_order_no === '-' || record.sales_order_no === 'PENDING' ? '' : (record.sales_order_no || ''))
    setArrivalDate(new Date().toISOString().split('T')[0])
    setIsArrivalModalOpen(true)
  }

  const handleSubmitArrival = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalId || !arrivalRecord) return
    if (!arrivalDoNo.trim()) {
      alert(language === 'ms' ? 'Please enter Delivery Order (DO) Number.' : 'Please enter the Delivery Order (DO) number.')
      return
    }

    setIsSubmittingArrival(true)
    try {
      const idsToUpdate = arrivalRecord.ids && arrivalRecord.ids.length > 0 ? arrivalRecord.ids : [arrivalRecord.id]
      const res = await updateOxygenReceptionArrival(
        hospitalId,
        idsToUpdate,
        arrivalDoNo.trim(),
        arrivalDate,
        arrivalSoNo.trim() || undefined
      )

      if (res.error) {
        alert(res.error)
      } else {
        setIsArrivalModalOpen(false)
        await loadData()
        alert(language === 'ms' 
          ? 'Penghantaran berjaya disahkan! Laporan Penerimaan (KEW.PS-3) kini sedia untuk dijana.' 
          : 'Delivery arrival confirmed successfully! Reception Report (KEW.PS-3) is now ready.')
      }
    } catch (err) {
      console.error('Error confirming delivery arrival:', err)
      alert('Failed to update delivery arrival.')
    } finally {
      setIsSubmittingArrival(false)
    }
  }

  // PDF Generation Triggers
  const handleDownloadPO = async (record: OxygenReceptionRecord) => {
    try {
      const poSupplierName = record.supplier_name || selectedReceiveSupplier || 'LINDE EOX SDN BHD (CAW. MIRI)'
      const matchedSup = dbSuppliers.find(s => isSupplierMatch(s.company_name, poSupplierName))

      const formattedItems = await fetchAndConsolidateReceptionItems(record, poSupplierName)

      const totalAmount = formattedItems.reduce((sum, item) => sum + item.total_price, 0)
      const refillTotalAmount = formattedItems.filter(i => !i.is_loan).reduce((sum, item) => sum + item.total_price, 0)
      const targetVote = record.vote_code || '080702'
      const { balanceBefore, balanceAfter } = computePoBalances(record, targetVote, refillTotalAmount)

      const poLoanRates: Record<string, number> = {}
      pricingConfigs
        .filter(c => isSupplierMatch(c.supplier_name, poSupplierName))
        .forEach(c => { if (c.loan_rate != null) poLoanRates[c.cylinder_size_code] = c.loan_rate })

      const blob = await generateOxygenPoPdf({
        reception: record,
        items: formattedItems,
        applicantName: signatures.applicantName,
        applicantPosition: signatures.applicantPosition,
        headName: signatures.headName,
        headPosition: signatures.headPosition,
        balanceBefore,
        balanceAfter,
        supplierName: matchedSup?.company_name || poSupplierName,
        supplierAddress: matchedSup?.address || (isLindeSupplier(poSupplierName) ? lindeSupplier?.address : '') || '',
        supplierPhone: matchedSup?.phone || (isLindeSupplier(poSupplierName) ? lindeSupplier?.phone : '') || '',
        loanRates: poLoanRates,
        loanVoteCode: record.loan_vote_code || (record.vote_code && !record.vote_code.startsWith('080') ? record.vote_code : '24000'),
        loanVoteActivity: record.loan_vote_activity || (record.vote_activity && record.vote_activity !== '27402' ? record.vote_activity : '020200')
      })

      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error generating PO PDF:', err)
      alert('Failed to generate PO PDF.')
    }
  }

  const handleDownloadReport = async (record: OxygenReceptionRecord) => {
    try {
      const reportSupplierName = record.supplier_name || selectedReceiveSupplier || 'LINDE EOX SDN BHD (CAW. MIRI)'

      const formattedItems = await fetchAndConsolidateReceptionItems(record, reportSupplierName)

      const reportLoanRates: Record<string, number> = {}
      pricingConfigs
        .filter(c => isSupplierMatch(c.supplier_name, reportSupplierName))
        .forEach(c => { if (c.loan_rate != null) reportLoanRates[c.cylinder_size_code] = c.loan_rate })

      const blob = await generateOxygenReceptionReportPdf({
        reception: record,
        items: formattedItems,
        applicantName: user?.full_name || 'Ahmad Bin Ismail',
        applicantPosition: user?.role?.role_name || 'Pharmacist',
        loanRates: reportLoanRates
      })

      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error generating Reception Report PDF:', err)
      alert('Failed to generate Reception Report PDF.')
    }
  }

  const handleGenerateBatchQr = async () => {
    if (!selectedTypeId || !user || !hospitalId) return
    setIsAssigningTag(true)
    try {
      const res = await generateNewCylindersWithQr(hospitalId, selectedTypeId, generateQuantity, user.id)
      if (res.data) {
        await loadData()
        setGeneratedLabels(res.data)
        alert(`Successfully generated and registered ${res.data.length} new cylinders with QR codes!`)
      } else {
        alert(res.error || 'Failed to generate cylinders.')
      }
    } catch (err) {
      console.error(err)
      alert('Error generating cylinders.')
    } finally {
      setIsAssigningTag(false)
    }
  }

  const handleRegisterSupplierTags = async () => {
    if (!selectedTypeId || !user || !hospitalId) return
    
    // Filter out empty rows and trim values
    const cleanedTags = supplierTagRows
      .map(t => t.trim())
      .filter(t => t.length > 0)

    if (cleanedTags.length === 0) {
      alert('Please fill in at least one supplier cylinder ID.')
      return
    }

    // Deduplicate tags for database insertion
    const uniqueTags = Array.from(new Set(cleanedTags.map(t => t.toUpperCase())))

    setIsAssigningTag(true)
    try {
      const res = await addSupplierTaggedLoanCylinders(
        hospitalId,
        selectedTypeId,
        uniqueTags,
        user.id
      )
      if (res.data) {
        await loadData()
        setGeneratedLabels(res.data.success)
        
        let message = `Successfully registered ${res.data.success.length} loan cylinders with supplier tags!`
        if (res.data.conflicts.length > 0) {
          message += `\n\nSkipped ${res.data.conflicts.length} duplicate tags (already registered): ${res.data.conflicts.join(', ')}`
        }
        alert(message)
        
        // Reset rows to 1 empty row upon success
        setSupplierTagRows([''])
      } else {
        alert(res.error || 'Failed to register supplier cylinders.')
      }
    } catch (err) {
      console.error(err)
      alert('Error registering supplier cylinders.')
    } finally {
      setIsAssigningTag(false)
    }
  }


  const handleDeactivateQrTag = async (id: string) => {
    if (!confirm(language === 'ms' 
      ? 'Adakah anda pasti mahu menyahaktifkan silinder ini? Silinder yang dinyahaktifkan akan dikelabukan dan tidak akan muncul dalam mana-mana modul operasi MyCylinder.' 
      : 'Are you sure you want to deactivate this cylinder? Deactivated cylinders will be grayed out and will not appear in active MyCylinder modules.')) return
    try {
      const res = await deactivateCylinderQrTag(id)
      if (res.data) {
        await loadData()
        setGeneratedLabels(prev => prev.filter(c => c.id !== id))
        alert(language === 'ms' ? 'Silinder berjaya dinyahaktifkan.' : 'Cylinder successfully deactivated.')
      } else {
        alert(res.error || (language === 'ms' ? 'Gagal menyahaktifkan silinder.' : 'Failed to deactivate cylinder.'))
      }
    } catch (err) {
      console.error(err)
      alert(language === 'ms' ? 'Ralat menyahaktifkan silinder.' : 'Error deactivating cylinder.')
    }
  }

  const handleReactivateCylinder = async (id: string) => {
    if (!confirm(language === 'ms' 
      ? 'Adakah anda ingin mengaktifkan semula silinder ini kembali ke stor?' 
      : 'Do you want to reactivate this cylinder back into active store inventory?')) return
    try {
      const res = await reactivateCylinder(id, 'empty')
      if (res.data) {
        await loadData()
        alert(language === 'ms' ? 'Silinder berjaya diaktifkan semula.' : 'Cylinder successfully reactivated.')
      } else {
        alert(res.error || (language === 'ms' ? 'Gagal mengaktifkan semula silinder.' : 'Failed to reactivate cylinder.'))
      }
    } catch (err) {
      console.error(err)
      alert(language === 'ms' ? 'Ralat mengaktifkan semula silinder.' : 'Error reactivating cylinder.')
    }
  }

  const handleConfirmDeleteCylinders = async (cylinderIds: string[], reason: string) => {
    setIsDeletingCylinder(true)
    try {
      let res;
      if (cylinderIds.length === 1) {
        res = await deleteOxygenCylinder(cylinderIds[0], reason, user?.id)
      } else {
        res = await deleteOxygenCylindersBatch(cylinderIds, reason, user?.id)
      }

      if (res?.error) {
        throw new Error(res.error)
      }

      const deletedSet = new Set(cylinderIds)

      // 1. Update cylinders state
      setCylinders(prev => prev.filter(c => !deletedSet.has(c.id)))
      setTaggedCylindersList(prev => prev.filter(c => !deletedSet.has(c.id)))

      // 2. Clear from bulk selection
      setSelectedReconciliationIds(prev => {
        const next = new Set(prev)
        cylinderIds.forEach(id => next.delete(id))
        return next
      })

      // 3. Clear from physical maps
      setPhysicalCounts(prev => {
        const next = { ...prev }
        cylinderIds.forEach(id => delete next[id])
        return next
      })
      setPhysicalLocations(prev => {
        const next = { ...prev }
        cylinderIds.forEach(id => delete next[id])
        return next
      })
      setPhysicalScannedBy(prev => {
        const next = { ...prev }
        cylinderIds.forEach(id => delete next[id])
        return next
      })

      // 4. Update audit log in live list
      const targetSerial = deleteCylinderTarget?.length === 1 ? deleteCylinderTarget[0]?.serial_number : undefined
      const newLogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        action: cylinderIds.length > 1 ? 'BULK_DELETE_OXYGEN_CYLINDERS' : 'DELETE_OXYGEN_CYLINDER',
        created_at: new Date().toISOString(),
        user: {
          full_name: user?.full_name || 'Staff Auditor',
          jawatan: user?.jawatan || 'Pegawai Farmasi'
        },
        new_values: {
          reason,
          count: cylinderIds.length,
          deleted_at: new Date().toISOString(),
          serial_number: targetSerial
        },
        old_values: {
          serial_number: targetSerial
        }
      }
      setReconciliationLogs(prev => [newLogEntry, ...prev])

      // 5. Success banner message
      setAuditSuccessMsg(
        language === 'ms'
          ? `🗑️ Berjaya memadam ${cylinderIds.length} silinder daripada rekod inventori.`
          : `🗑️ Successfully deleted ${cylinderIds.length} cylinder(s) from inventory.`
      )
      setTimeout(() => setAuditSuccessMsg(null), 5000)

      setDeleteCylinderTarget(null)
    } catch (err: any) {
      console.error('Error deleting cylinder(s):', err)
      alert(err?.message || 'Gagal memadam silinder / Failed to delete cylinder(s)')
    } finally {
      setIsDeletingCylinder(false)
    }
  }

  // Cylinder edit handlers for stock reconciliation & inventory audit
  const handleOpenEditModal = (cyl: OxygenCylinderWithRelations) => {
    setEditingCylinderTarget(cyl)
  }

  const handleEditCylinderSuccess = (updatedCylinder: OxygenCylinderWithRelations) => {
    // 1. Update cylinders state across the dashboard
    setCylinders(prev => prev.map(c => c.id === updatedCylinder.id ? updatedCylinder : c))

    // 2. Sync physical count state if needed
    if (physicalCounts[updatedCylinder.id] === undefined) {
      const expected = getExpectedStateForCylinder(updatedCylinder)
      setPhysicalCounts(prev => ({ ...prev, [updatedCylinder.id]: expected }))
    }

    // 3. Highlight and focus group
    const newGroupName = updatedCylinder.type_info?.type_name || 'Standard Cylinder'
    setSelectedReconciliationGroup(newGroupName)
    setHighlightedCylinderId(updatedCylinder.id)
    setTimeout(() => setHighlightedCylinderId(null), 5000)

    // 4. Audit activity log entry
    const newLogEntry = {
      id: `audit-edit-${Date.now()}`,
      action: 'UPDATE_CYLINDER_PROFILE',
      created_at: new Date().toISOString(),
      user: {
        full_name: user?.full_name || 'Staff Auditor',
        email: user?.email
      },
      new_values: {
        serial_number: updatedCylinder.serial_number,
        type: newGroupName,
        status: updatedCylinder.status
      }
    }
    setReconciliationLogs(prev => [newLogEntry, ...prev])

    // 5. Success toast banner
    setAuditSuccessMsg(
      language === 'ms'
        ? `✅ Silinder [${updatedCylinder.serial_number}] berjaya dikemaskini (${newGroupName})!`
        : `✅ Cylinder [${updatedCylinder.serial_number}] successfully updated (${newGroupName})!`
    )
    setTimeout(() => setAuditSuccessMsg(null), 5000)

    setEditingCylinderTarget(null)
  }

  const renderActiveView = () => {
    // 1. CYLINDER INVENTORY VIEW (Implementation Plan Dashboard)
    if (currentPath === '/pharmacy/oxygen/cylinders') {
      // Compute KPI totals from aggregates
      const kpiTotals = cylinderAggregates.reduce(
        (acc, curr) => ({
          total: acc.total + (curr.total || 0),
          available: acc.available + (curr.available || 0),
          inUse: acc.inUse + (curr.in_use || 0),
          returned: acc.returned + (curr.returned || 0),
        }),
        { total: 0, available: 0, inUse: 0, returned: 0 }
      )

      return (
        <div className="space-y-8">
          {/* Executive Segmented Navigation Bar & Operational Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Primary Segmented Tab Navigation: 2x2 Grid on Mobile (Zero Cutoff), Flex on Desktop */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 bg-surface border border-border-default p-1.5 rounded-2xl shadow-xs w-full sm:w-auto">
              {[
                { 
                  id: 'overview', 
                  label: language === 'ms' ? 'Stor' : 'Store Grid',
                  fullLabel: language === 'ms' ? 'Gambaran Stor' : 'Overview Store Grid',
                  icon: LayoutGrid 
                },
                { 
                  id: 'unit_monitor', 
                  label: language === 'ms' ? 'Agihan Wad' : 'Unit Distribution',
                  fullLabel: language === 'ms' ? 'Agihan Unit' : 'Unit Distribution',
                  icon: Building2 
                },
                { 
                  id: 'store_balance', 
                  label: language === 'ms' ? 'Lejar' : 'Usage Ledger',
                  fullLabel: language === 'ms' ? 'Lejar Penggunaan' : 'Store Usage Ledger',
                  icon: ScrollText 
                },
                { 
                  id: 'supplier_returns', 
                  label: language === 'ms' ? 'Logistik' : 'Logistics',
                  fullLabel: language === 'ms' ? 'Logistik Pembekal' : 'Supplier Logistics',
                  icon: Truck,
                  count: returnDocs.length + requestDocs.length + receiveDocs.length
                },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = cylinderActiveTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCylinderActiveTab(tab.id as any)}
                    className={`w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-accent-base text-white shadow-xs font-bold'
                        : 'text-text-muted hover:text-text-primary hover:bg-subtle active:scale-[0.98]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                    <span className="sm:hidden text-center truncate">{tab.label}</span>
                    <span className="hidden sm:inline">{tab.fullLabel || tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-subtle text-text-muted border border-border-default'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Administrative Protected Action - Sleek & Discreet */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={handleOpenClearModal}
                className="px-3 py-1.5 sm:py-2 bg-surface hover:bg-rose-500/10 text-text-muted hover:text-rose-600 border border-border-default hover:border-rose-500/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-elevation-1 hover:shadow-xs active:scale-95 shrink-0 cursor-pointer"
                title={language === 'ms' ? 'Pilihan Pentadbir: Kosongkan data stok (Memerlukan kata laluan)' : 'Admin: Clear stock data (Password protected)'}
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium">{language === 'ms' ? 'Pilihan Pentadbir' : 'Admin Reset'}</span>
              </button>
            </div>
          </div>
 
          {/* Tab Content */}
          <div className="transition-colors duration-500">
            {cylinderActiveTab === 'overview' && (
              <StoreBalanceGrid
                data={cylinderAggregates}
                onQuickIssue={() => setIsManualModalOpen(true)}
                onQuickScanEmpty={(combo) => {
                  setSelectedDepleteCombo(combo)
                  setIsScanOpen(true)
                }}
                onQuickCreateReturn={() => setIsReturnModalOpen(true)}
              />
            )}
 
            {cylinderActiveTab === 'unit_monitor' && <UnitDistributionTable data={deptDistribution} />}
 
            {cylinderActiveTab === 'store_balance' && (
              <StoreUsageBalanceTable
                data={ledgerData}
                startDate={ledgerStartDate}
                endDate={ledgerEndDate}
                onDateChange={(start, end) => {
                  setLedgerStartDate(start)
                  setLedgerEndDate(end)
                }}
                isLoading={isLedgerLoading}
                onRefresh={handleRefreshInventoryData}
              />
            )}
 
             {cylinderActiveTab === 'supplier_returns' && (
                <SupplierReturnsSection
                  hospitalId={hospitalId || ''}
                  documents={returnDocs}
                  requestDocuments={requestDocs}
                  receiveDocuments={receiveDocs}
                  onCreateClick={() => setIsReturnModalOpen(true)}
                  onCreateRequestClick={() => setIsRequestModalOpen(true)}
                  onCreateReceiveClick={() => setIsReceiveDocModalOpen(true)}
                  onScanClick={() => setIsScanOpen(true)}
                  onOpenEmptyListModal={() => {
                    setEmptyListCylinders([])
                    setIsEmptyListModalOpen(true)
                  }}
                  onPrintClick={(docId) => setPrintDocId(docId)}
                  onPrintRequestClick={(docId) => setPrintRequestId(docId)}
                  onPrintReceiveClick={(docId) => setPrintReceiveDocId(docId)}
                  isViewOnly={false}
                  subTab={supplierReturnsSubTab}
                  onSubTabChange={setSupplierReturnsSubTab}
                  hideSubTabBar={false}
                  onSuccess={async () => {
                    if (!hospitalId) return
                    const [aggRes, docsRes, reqsRes, recDocsRes] = await Promise.all([
                      getCylinderInventoryByType(hospitalId),
                      getReturnDocuments(hospitalId),
                      getRequestDocuments(hospitalId),
                      getReceiveDocuments(hospitalId),
                    ])
                    if (aggRes.data) setCylinderAggregates(aggRes.data)
                    if (docsRes.data) setReturnDocs(docsRes.data)
                    if (reqsRes.data) setRequestDocs(reqsRes.data)
                    if (recDocsRes.data) setReceiveDocs(recDocsRes.data)
                  }}
                />
              )}
           </div>

          {/* Scan Empty Cylinder Modal */}
          <ScanEmptyCylinderModal
            hospitalId={hospitalId || ''}
            isOpen={isScanOpen}
            targetCombo={selectedDepleteCombo}
            onClose={() => {
              setIsScanOpen(false)
              setSelectedDepleteCombo(null)
            }}
            onOpenReturnModal={() => {
              setIsScanOpen(false)
              setSelectedDepleteCombo(null)
              setIsReturnModalOpen(true)
            }}
            onCreateEmptyList={(scannedCyls) => {
              setIsScanOpen(false)
              setSelectedDepleteCombo(null)
              setEmptyListCylinders(scannedCyls)
              setIsEmptyListModalOpen(true)
            }}
            sessionScannedCylinders={sessionScannedCylinders}
            setSessionScannedCylinders={setSessionScannedCylinders}
            onSuccess={async () => {
              if (!hospitalId) return
              const [aggRes, docsRes, reqsRes, recDocsRes] = await Promise.all([
                getCylinderInventoryByType(hospitalId),
                getReturnDocuments(hospitalId),
                getRequestDocuments(hospitalId),
                getReceiveDocuments(hospitalId),
              ])
              if (aggRes.data) setCylinderAggregates(aggRes.data)
              if (docsRes.data) setReturnDocs(docsRes.data)
              if (reqsRes.data) setRequestDocs(reqsRes.data)
              if (recDocsRes.data) setReceiveDocs(recDocsRes.data)
            }}
          />

          {/* Dedicated Separate Document: Empty Cylinder List Modal */}
          <EmptyCylinderListModal
            hospitalId={hospitalId || ''}
            isOpen={isEmptyListModalOpen}
            initialCylinders={emptyListCylinders.length > 0 ? emptyListCylinders : undefined}
            onClose={() => {
              setIsEmptyListModalOpen(false)
              setEmptyListCylinders([])
            }}
            onOpenReturnModal={(selectedCyls) => {
              setIsEmptyListModalOpen(false)
              setEmptyListCylinders([])
              setSessionScannedCylinders(selectedCyls)
              setIsReturnModalOpen(true)
            }}
          />


          {/* Return Document Modals */}
          <CreateReturnDocumentModal
            hospitalId={hospitalId || ''}
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            onOpenScanner={() => {
              setIsReturnModalOpen(false)
              setIsScanOpen(true)
            }}
            sessionScannedCylinders={sessionScannedCylinders}
            setSessionScannedCylinders={setSessionScannedCylinders}
            onSuccess={async () => {
              if (!hospitalId) return
              const [aggRes, docsRes, reqsRes, recDocsRes] = await Promise.all([
                getCylinderInventoryByType(hospitalId),
                getReturnDocuments(hospitalId),
                getRequestDocuments(hospitalId),
                getReceiveDocuments(hospitalId),
              ])
              if (aggRes.data) setCylinderAggregates(aggRes.data)
              if (docsRes.data) setReturnDocs(docsRes.data)
              if (reqsRes.data) setRequestDocs(reqsRes.data)
              if (recDocsRes.data) setReceiveDocs(recDocsRes.data)
            }}
          />

          {/* Request Document Modals */}
          <CreateRequestDocumentModal
            hospitalId={hospitalId || ''}
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
            onSuccess={async () => {
              if (!hospitalId) return
              const [aggRes, docsRes, reqsRes, recDocsRes] = await Promise.all([
                getCylinderInventoryByType(hospitalId),
                getReturnDocuments(hospitalId),
                getRequestDocuments(hospitalId),
                getReceiveDocuments(hospitalId),
              ])
              if (aggRes.data) setCylinderAggregates(aggRes.data)
              if (docsRes.data) setReturnDocs(docsRes.data)
              if (reqsRes.data) setRequestDocs(reqsRes.data)
              if (recDocsRes.data) setReceiveDocs(recDocsRes.data)
            }}
          />

          {/* Receive Document Modals */}
          <CreateReceiveDocumentModal
            hospitalId={hospitalId || ''}
            isOpen={isReceiveDocModalOpen}
            onClose={() => setIsReceiveDocModalOpen(false)}
            onSuccess={async () => {
              if (!hospitalId) return
              const [aggRes, docsRes, reqsRes, recDocsRes] = await Promise.all([
                getCylinderInventoryByType(hospitalId),
                getReturnDocuments(hospitalId),
                getRequestDocuments(hospitalId),
                getReceiveDocuments(hospitalId),
              ])
              if (aggRes.data) setCylinderAggregates(aggRes.data)
              if (docsRes.data) setReturnDocs(docsRes.data)
              if (reqsRes.data) setRequestDocs(reqsRes.data)
              if (recDocsRes.data) setReceiveDocs(recDocsRes.data)
            }}
          />

          {printDocId && (
            <ReturnDocumentPrintView
              documentId={printDocId}
              isOpen={!!printDocId}
              onClose={() => setPrintDocId(null)}
            />
          )}

          {printRequestId && (
            <RequestDocumentPrintView
              documentId={printRequestId}
              isOpen={!!printRequestId}
              onClose={() => setPrintRequestId(null)}
            />
          )}

          {printReceiveDocId && (
            <ReceiveDocumentPrintView
              documentId={printReceiveDocId}
              isOpen={!!printReceiveDocId}
              onClose={() => setPrintReceiveDocId(null)}
            />
          )}
        </div>
      )
    }

    // 2. CYLINDER REQUEST VIEW (CONSUMPTION)
    if (currentPath === '/pharmacy/oxygen/consumption') {
      return (
        <div className="space-y-6">
          {dispatchKpi && <CylinderDispatchKpiCards kpi={dispatchKpi} />}

          <CylinderDispatchTable
            requests={dispatchRequests}
            departments={departmentsList}
            onViewDetails={(req) => setDetailRequest(req)}
            onPrint={(req) => setPrintDispatchRequestId(req.id)}
            onDelete={(req) => setDeleteTargetRequest(req)}
          />

          <ManualIssueModal
            isOpen={isManualModalOpen}
            onClose={() => setIsManualModalOpen(false)}
            onSubmit={async (data) => {
              if (hospitalId) {
                const res = await createManualIssue(hospitalId, {
                  ...data,
                  issuer_id: user?.id || ''
                })
                if (res.error) {
                  throw new Error(res.error)
                }
                await loadData()
              }
            }}
            departments={departmentsList}
            currentUser={user as any}
            users={hospitalUsers}
            hospitalId={hospitalId || ''}
          />

          <UnitRequestModal
            isOpen={isUnitModalOpen}
            onClose={() => setIsUnitModalOpen(false)}
            initialMode={unitModalInitialMode}
            lockMode={unitModalLockMode}
            onSubmit={async (data) => {
              if (hospitalId) {
                const res = await createUnitRequest(hospitalId, {
                  ...data,
                  requester_id: user?.id || '',
                  priority: data.priority
                })
                if (res.error) {
                  throw new Error(res.error)
                }
                await loadData()
              }
            }}
            departments={departmentsList}
            currentUser={user as any}
          />

          <ReceiveInterFacilityModal
            isOpen={isReceiveInterFacilityModalOpen}
            onClose={() => setIsReceiveInterFacilityModalOpen(false)}
            onSubmit={async (data) => {
              if (hospitalId) {
                const res = await createInterFacilityReceivedCylinder(hospitalId, data)
                if (res.error) {
                  throw new Error(res.error)
                }
                await loadData()
                if (res.data?.id) {
                  setPrintDispatchRequestId(res.data.id)
                }
              }
            }}
            departments={departmentsList}
            currentUser={user as any}
            users={hospitalUsers}
            hospitalId={hospitalId || ''}
          />

          <ReturnInterFacilityModal
            isOpen={isReturnInterFacilityModalOpen}
            onClose={() => setIsReturnInterFacilityModalOpen(false)}
            onSubmit={async (data) => {
              if (hospitalId) {
                const res = await createInterFacilityReturnCylinder(hospitalId, data)
                if (res.error) {
                  throw new Error(res.error)
                }
                await loadData()
                if (res.data?.id) {
                  setPrintDispatchRequestId(res.data.id)
                }
              }
            }}
            departments={departmentsList}
            currentUser={user as any}
            users={hospitalUsers}
            hospitalId={hospitalId || ''}
          />

          <DispatchRequestDetailModal
            isOpen={!!detailRequest}
            onClose={() => setDetailRequest(null)}
            request={detailRequest}
            currentUser={user as any}
            onApprove={async (id, adjustedItems) => {
              if (!isCylinderOfficer) {
                throw new Error('Hanya Pegawai Farmasi dan Penolong Pegawai Farmasi yang dibenarkan meluluskan permohonan silinder.')
              }
              const res = await approveRequest(id, user?.id || '', adjustedItems)
              if (res.error) throw new Error(res.error)
              await loadData()
              const updatedReq = (await getCylinderDispatchRequestById(id))?.data
              if (updatedReq) {
                setDetailRequest(updatedReq)
              }
            }}
            onReject={async (id, reason) => {
              if (!isCylinderOfficer) {
                throw new Error('Hanya Pegawai Farmasi dan Penolong Pegawai Farmasi yang dibenarkan menolak permohonan silinder.')
              }
              const res = await rejectRequest(id, user?.id || '', reason)
              if (res.error) throw new Error(res.error)
              await loadData()
            }}
            onIssue={async (id, items) => {
              if (!isCylinderOfficer) {
                throw new Error('Hanya Pegawai Farmasi dan Penolong Pegawai Farmasi yang dibenarkan mengeluarkan (dispatch) silinder.')
              }
              const res = await issueRequest(id, user?.id || '', items)
              if (res.error) throw new Error(res.error)
              await loadData()
              const updatedReq = (await getCylinderDispatchRequestById(id))?.data
              if (updatedReq) {
                setDetailRequest(updatedReq)
              }
            }}
            onComplete={async (id) => {
              const res = await completeRequest(id)
              if (res.error) throw new Error(res.error)
              await loadData()
            }}
            onCancel={async (id) => {
              const res = await cancelRequest(id)
              if (res.error) throw new Error(res.error)
              await loadData()
            }}
            onUpdateItems={async (id, items, reason) => {
              const res = await updateRequestItems(id, user?.id || '', items, reason)
              if (res.error) throw new Error(res.error)
              await loadData()
              const updatedReq = (await getCylinderDispatchRequestById(id))?.data
              if (updatedReq) {
                setDetailRequest(updatedReq)
              }
            }}
            onDelete={(req) => {
              setDetailRequest(null)
              setDeleteTargetRequest(req)
            }}
          />

          {deleteTargetRequest && (
            <DeleteDispatchConfirmModal
              isOpen={!!deleteTargetRequest}
              request={deleteTargetRequest}
              onClose={() => setDeleteTargetRequest(null)}
              onConfirm={async (requestId, reason, password) => {
                const res = await deleteCylinderDispatchRequest(
                  requestId,
                  user?.id || '',
                  reason,
                  password
                )
                if (res.error) {
                  throw new Error(res.error)
                }
                setDeleteTargetRequest(null)
                if (detailRequest?.id === requestId) {
                  setDetailRequest(null)
                }
                await loadData()
              }}
            />
          )}

          {printDispatchRequestId && (
            <CylinderDispatchPrintView
              requestId={printDispatchRequestId}
              isOpen={!!printDispatchRequestId}
              onClose={() => setPrintDispatchRequestId(null)}
              supplierName={selectedPricingSupplier !== 'All Suppliers' ? selectedPricingSupplier : 'BORNEO INDAH SDN BHD'}
            />
          )}
        </div>
      )
    }

    // 3. QR CODE LABEL GENERATOR
    if (currentPath === '/pharmacy/oxygen/qr') {
      const seenLoanSizes = new Set<string>()
      const uniqueTaggedCylindersList = taggedCylindersList.filter(c => {
        if (c.supplier_tagged || c.status === 'deactivated' || c.is_active === false) {
          return true
        }
        const serial = (c.serial_number || '').toUpperCase()
        const isGenericLoanTag = serial === '101-N' || serial === '101-F' || serial === 'O2-101-N' || serial === 'O2-101-F'

        if (isGenericLoanTag) {
          const sizeCode = serial.includes('101-N') ? '101-N' : '101-F'
          if (seenLoanSizes.has(sizeCode)) {
            return false
          }
          seenLoanSizes.add(sizeCode)
          return true
        }
        return true
      })

      const taggedCylinders = uniqueTaggedCylindersList.filter(c => {
        const isDeactivated = c.status === 'deactivated' || c.is_active === false

        const matchesSearch = (c.serial_number || '').toLowerCase().includes(qrSearchTerm.toLowerCase()) || 
          (c.qr_code_value && c.qr_code_value.toLowerCase().includes(qrSearchTerm.toLowerCase()))
        
        let matchesSize = true
        if (qrSizeFilter) {
          matchesSize = c.size_info?.code === qrSizeFilter || c.type_code === qrSizeFilter
        }

        let matchesType = true
        if (qrTypeFilter) {
          matchesType = c.type_info?.code === qrTypeFilter || (c.type_info?.type_name || '').includes(qrTypeFilter) || (c.type_info?.name || '').includes(qrTypeFilter)
        }

        const hasTagOrDeactivated = Boolean(c.qr_code_value || isDeactivated)

        return hasTagOrDeactivated && matchesSearch && matchesSize && matchesType
      })

      const paginatedTaggedCylinders = taggedCylinders.slice(
        (qrPage - 1) * qrPageSize,
        qrPage * qrPageSize
      )

      const handlePrintIndividual = (stickerId: string) => {
        const cleanId = stickerId.startsWith('sticker-') ? stickerId : `sticker-${stickerId}`;
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #${cleanId}, #${cleanId} * {
              visibility: visible !important;
            }
            #${cleanId} {
              position: absolute !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%) !important;
              width: 140mm !important;
              max-width: 140mm !important;
              height: auto !important;
              margin: 0 !important;
              padding: 5px !important;
              box-shadow: none !important;
              background-color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print-sticker-btn {
              display: none !important;
            }
          }
        `;
        document.head.appendChild(styleEl);
        window.print();
        document.head.removeChild(styleEl);
      };

      return (
        <div className="space-y-6">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-batch-stickers, #printable-batch-stickers * {
                visibility: visible !important;
              }
              #printable-batch-stickers {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 12mm !important;
                padding: 12mm !important;
                background: white !important;
              }
              #printable-batch-stickers .cylinder-qr-tag-container {
                width: 140mm !important;
                max-width: 140mm !important;
                height: auto !important;
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .no-print-sticker-btn {
                display: none !important;
              }
            }
          `}} />

          {qrActiveTab === 'generate' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Generator Form (4 cols) */}
              <div className="lg:col-span-5 bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-base" />
                
                <div>
                  <h3 className="text-base font-extrabold text-text-primary">{language === 'ms' ? 'Pendaftaran Label QR Baharu' : 'New QR Label Registration'}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{language === 'ms' ? 'Select cylinder type and quantity to generate new inventory.' : 'Choose cylinder type and quantity to generate new assets.'}</p>
                </div>

                <div className="space-y-4">
                  {/* Cylinder Type Selection */}
                  <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-wide block mb-2">
                      {language === 'ms' ? 'Select Cylinder Type' : 'Select Cylinder Type'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cylinderTypes.map(type => {
                        const isSelected = selectedTypeId === type.id
                        return (
                          <div
                            key={type.id}
                            onClick={() => setSelectedTypeId(type.id)}
                            className={`cursor-pointer p-4 rounded-2xl border-2 transition-colors flex flex-col gap-1 relative overflow-hidden active:scale-95 ${
                              isSelected 
                                ? 'border-[#00a68a] bg-gradient-to-br from-teal-50/40 to-teal-50/10 shadow-md ring-2 ring-[#00a68a]/10'
                                : 'border-border-subtle bg-surface hover:border-border-default hover:bg-subtle/50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                isSelected ? 'bg-[#00a68a] text-white' : 'bg-subtle text-text-muted'
                              }`}>
                                {language === 'ms' ? 'Saiz' : 'Size'} {type.type_code}
                              </span>
                              <span className="text-[10px] font-extrabold text-text-muted">{type.capacity_liters}L</span>
                            </div>
                            <h4 className="text-xs font-bold text-text-primary mt-2">{type.type_name}</h4>
                            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{type.description || 'Medical Oxygen'}</p>
                            
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 text-[#00a68a]">
                                <CheckCircle className="w-3.5 h-3.5 fill-teal-50" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {!isLoanSelected ? (
                    <>
                      {/* Quantity Slider */}
                      <div className="bg-subtle/50 border border-border-subtle rounded-2xl p-4 flex flex-col gap-3 transition-colors">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-wide">
                            {language === 'ms' ? 'Kuantiti Untuk Didaftar' : 'Quantity to Register'}
                          </label>
                          <span className="text-xs font-black px-2.5 py-1 rounded-lg border text-[#00a68a] bg-accent-base/10 border-teal-100">
                            {generateQuantity} {generateQuantity === 1 ? (language === 'ms' ? 'Silinder' : 'Cylinder') : (language === 'ms' ? 'Silinder' : 'Cylinders')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setGenerateQuantity(prev => Math.max(1, prev - 1))}
                            className="w-8 h-8 bg-surface border border-border-default hover:border-border-default text-text-muted font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center text-sm active:scale-95"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={generateQuantity}
                            onChange={(e) => setGenerateQuantity(Number(e.target.value))}
                            className="flex-1 accent-[#00a68a] h-1.5 bg-subtle rounded-lg appearance-none cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => setGenerateQuantity(prev => Math.min(50, prev + 1))}
                            className="w-8 h-8 bg-surface border border-border-default hover:border-border-default text-text-muted font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center text-sm active:scale-95"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex gap-2">
                          {[1, 5, 10, 20, 50].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setGenerateQuantity(num)}
                              className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition-colors ${
                                generateQuantity === num
                                  ? 'bg-[#00a68a] border-[#00a68a] text-white shadow-sm'
                                  : 'bg-surface border-border-default text-text-muted hover:border-border-default'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={handleGenerateBatchQr}
                        disabled={!selectedTypeId || isAssigningTag}
                        className="w-full py-4 bg-gradient-to-r from-[#00a68a] to-emerald-600 hover:from-[#008f76] hover:to-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 hover:shadow-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4 animate-pulse" />
                        {isAssigningTag ? (language === 'ms' ? 'Mendaftar...' : 'Registering Cylinders...') : (language === 'ms' ? 'Daftar & Jana QR' : 'Register & Generate QR Codes')}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Document Upload + OCR Panel */}
                      {isOcrEligible && (
                        <div className="bg-surface border border-border-default rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                          <div>
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-wide block mb-1">
                              {language === 'ms' ? 'Ekstrak Automatik No. Siri' : 'Auto-Extract Serials from Delivery Order'}
                            </label>
                            <p className="text-[10px] text-slate-400">
                              {language === 'ms' ? 'Muat naik PDF atau imbasan pesanan penghantaran untuk mengekstrak no. siri secara automatik.' : 'Upload the PDF or an image scan of the delivery order to automatically extract and prefix serial numbers.'}
                            </p>
                          </div>
                          
                          <div className="border-2 border-dashed border-border-default hover:border-[#00a68a]/50 rounded-xl p-5 text-center cursor-pointer transition-colors bg-subtle/50 hover:bg-accent-base/10 flex flex-col items-center justify-center gap-2 relative">
                            <input
                              type="file"
                              multiple
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="p-2.5 bg-accent-base/10 text-[#00a68a] rounded-full">
                              <FileText className="w-5 h-5" />
                            </div>
                            {deliveryDocFiles.length > 0 ? (
                              <div className="text-xs font-semibold text-text-secondary truncate max-w-full px-2">
                                {deliveryDocFiles.length === 1
                                  ? `${deliveryDocFiles[0].name} (${(deliveryDocFiles[0].size / 1024).toFixed(1)} KB)`
                                  : `${deliveryDocFiles.length} files selected (${deliveryDocFiles.map(f => f.name).join(', ')})`}
                              </div>
                            ) : (
                              <div className="text-[11px] text-text-muted">
                                {language === 'ms' ? 'Klik atau tarik PDF / Imej ke sini (boleh pilih lebih daripada 1 imej)' : 'Click or drag & drop PDF / Images here (can select multiple pages)'}
                              </div>
                            )}
                          </div>

                          {ocrError && (
                            <div className="text-[10px] text-rose-600 bg-rose-500/10 border border-rose-100 p-2.5 rounded-xl flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              <span>{ocrError}</span>
                            </div>
                          )}

                          {isOcrProcessing ? (
                            <div className="py-4 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-text-muted bg-subtle/50 rounded-xl">
                              <Spinner className="w-5 h-5 text-[#00a68a]" />
                              <span>{language === 'ms' ? 'Sedang memproses OCR...' : 'Processing OCR & extracting serials...'}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleRunOcr}
                              disabled={deliveryDocFiles.length === 0}
                              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-colors active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              {language === 'ms' ? 'Jalankan Ekstraksi OCR' : 'Run OCR Extraction'}
                            </button>
                          )}

                          {showOcrReview && (
                            <div className="border border-border-subtle rounded-xl p-4 bg-subtle/50 flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-text-muted">
                                  {language === 'ms' ? 'No. Siri Ditemui' : 'Extracted Serials'} ({ocrExtractedTags.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const allChecked = ocrExtractedTags.every(t => t.selected);
                                    setOcrExtractedTags(ocrExtractedTags.map(t => ({ ...t, selected: !allChecked })));
                                  }}
                                  className="text-[9px] text-[#00a68a] hover:underline font-bold"
                                >
                                  {ocrExtractedTags.every(t => t.selected) ? (language === 'ms' ? 'Nyahpilih Semua' : 'Deselect All') : (language === 'ms' ? 'Pilih Semua' : 'Select All')}
                                </button>
                              </div>

                              {ocrExtractedTags.length === 0 ? (
                                <div className="text-xs text-slate-400 text-center py-4">
                                  {language === 'ms' ? 'Tiada no. siri dikesan.' : 'No serial numbers detected.'}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                                  {ocrExtractedTags.map((tag, idx) => (
                                    <label
                                      key={idx}
                                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-[11px] font-mono select-none ${
                                        tag.selected
                                          ? 'bg-accent-base/10 border-accent-base/20 text-[#00a68a] font-bold'
                                          : 'bg-surface border-border-default text-text-muted hover:border-border-default'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={tag.selected}
                                        onChange={() => {
                                          const newTags = [...ocrExtractedTags];
                                          newTags[idx].selected = !newTags[idx].selected;
                                          setOcrExtractedTags(newTags);
                                        }}
                                        className="rounded border-border-default text-[#00a68a] focus:ring-[#00a68a] w-3.5 h-3.5"
                                      />
                                      <span className="truncate">{tag.serial}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowOcrReview(false)}
                                  className="flex-1 py-2 bg-surface border border-border-default hover:bg-subtle/50 text-text-muted rounded-lg text-[10px] font-bold transition-colors"
                                >
                                  {language === 'ms' ? 'Batal' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleApplyExtractedTags}
                                  disabled={ocrExtractedTags.filter(t => t.selected).length === 0}
                                  className="flex-[2] py-2 bg-[#00a68a] hover:bg-[#008f76] disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                                >
                                  {language === 'ms' ? 'Guna' : 'Apply'} {ocrExtractedTags.filter(t => t.selected).length} {language === 'ms' ? 'Tag' : 'Tags'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Supplier Tag Manual Entry Panel */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-border-default rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
                        <div>
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-wide block mb-1">
                            {language === 'ms' ? 'Kemasukan Tag Pembekal Manual' : 'Manual Supplier Tag Entry'}
                          </label>
                          <p className="text-[10px] text-slate-400">
                            {language === 'ms' ? 'Masukkan ID unik yang sudah ditag pada setiap silinder pinjaman fizikal.' : 'Enter the unique ID already tagged on each physical loan cylinder. Add rows as needed.'}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                          {supplierTagRows.map((rowValue, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-right">#{index + 1}</span>
                              <input
                                type="text"
                                placeholder="e.g. SL-80L-99824"
                                value={rowValue}
                                onChange={(e) => {
                                  const newRows = [...supplierTagRows]
                                  newRows[index] = e.target.value
                                  setSupplierTagRows(newRows)
                                }}
                                className="flex-1 border border-border-default rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#00a68a]/20 focus:border-[#00a68a] transition-colors font-mono uppercase bg-surface"
                              />
                              {supplierTagRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSupplierTagRows(supplierTagRows.filter((_, i) => i !== index))
                                  }}
                                  className="p-3 bg-rose-500/10 hover:bg-rose-100 hover:text-rose-600 text-rose-500 rounded-xl transition-colors"
                                  title="Remove Row"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSupplierTagRows([...supplierTagRows, ''])}
                          className="w-full py-2.5 bg-subtle hover:bg-subtle text-text-secondary rounded-xl text-xs font-black transition-colors active:scale-95 flex items-center justify-center gap-1.5 border border-border-default"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {language === 'ms' ? 'Tambah Baris Tag' : 'Add Tag Row'}
                        </button>
                        
                        <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2 animate-[fadeIn_200ms_ease-out]">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-normal font-semibold">
                            {language === 'ms' 
                              ? 'Setiap baris mewakili satu ID silinder pembekal. Tag ini akan didaftarkan ke dalam sistem sebagai aset pinjaman unik.' 
                              : 'Each row represents one supplier cylinder ID. These tags will be registered directly into the system database as unique loan assets.'}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={handleRegisterSupplierTags}
                        disabled={supplierTagRows.filter(t => t.trim()).length === 0 || isAssigningTag}
                        className="w-full py-4 bg-gradient-to-r from-[#00a68a] to-emerald-600 hover:from-[#008f76] hover:to-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 hover:shadow-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isAssigningTag ? (language === 'ms' ? 'Mendaftar...' : 'Registering Supplier Tags...') : `${language === 'ms' ? 'Daftar' : 'Register'} ${supplierTagRows.filter(t => t.trim()).length || ''} ${language === 'ms' ? 'Tag Pembekal' : 'Supplier Tags'}`}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Generated Stickers (7 cols) */}
              <div className="lg:col-span-7 bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl min-h-[400px] flex flex-col">
                {generatedLabels.length > 0 ? (
                  <div className="flex flex-col h-full gap-4">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                      <div>
                        <h3 className="text-sm font-black text-text-primary">{language === 'ms' ? 'Label QR Dijana' : 'Generated QR Labels'} ({generatedLabels.length})</h3>
                        <p className="text-[10px] text-slate-400">{language === 'ms' ? 'Sedia untuk dicetak.' : 'Ready to print for new cylinders.'}</p>
                      </div>
                      <button 
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors shadow-md flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        {language === 'ms' ? 'Cetak Semua' : 'Print All Labels'}
                      </button>
                    </div>

                    {/* Stickers Grid */}
                    <div id="printable-batch-stickers" className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-2 hide-scrollbar">
                      {generatedLabels.map((label) => (
                        <div 
                          key={label.id}
                          className="p-3 bg-subtle/50 border border-border-default rounded-2xl shadow-sm hover:shadow-md hover:bg-surface transition-colors flex justify-center items-center"
                        >
                          <CylinderQrTag
                            cylinder={label}
                            id={`sticker-${label.id}`}
                            onPrint={handlePrintIndividual}
                            showPrintButton={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-accent-base/10 flex items-center justify-center mb-4">
                      <QrCode className="w-8 h-8 text-[#00a68a]" />
                    </div>
                    <h4 className="text-sm font-extrabold text-text-primary">{language === 'ms' ? 'Tiada Label Dijana' : 'No Labels Generated Yet'}</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      {language === 'ms' ? 'Pilih jenis silinder di sebelah kiri untuk bermula.' : 'Select a cylinder type and input quantity on the left, then trigger the generator to initialize new codes.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 bg-surface border border-border-default p-4 rounded-2xl shadow-sm items-center justify-between">
                <div className="w-full sm:max-w-xs relative">
                  <input
                    type="text"
                    placeholder={language === 'ms' ? 'Cari Siri atau Kod QR...' : 'Search Serial or QR Code...'}
                    value={qrSearchTerm}
                    onChange={(e) => {
                      setQrSearchTerm(e.target.value)
                      setQrPage(1)
                    }}
                    className="w-full border border-border-default rounded-xl p-2.5 pl-3 text-xs outline-none focus:ring-2 focus:ring-[#00a68a]/20 focus:border-[#00a68a] transition-colors font-mono"
                  />
                </div>
                <div className="flex flex-1 gap-3 w-full sm:justify-end">
                  {/* Size Filter Dropdown */}
                  <div className="w-full sm:max-w-[150px]">
                    <select
                      value={qrSizeFilter}
                      onChange={(e) => {
                        setQrSizeFilter(e.target.value)
                        setQrPage(1)
                      }}
                      className="w-full border border-border-default rounded-xl p-2.5 text-xs outline-none bg-surface text-text-secondary focus:ring-2 focus:ring-[#00a68a]/20 focus:border-[#00a68a] transition-colors font-semibold text-[11px]"
                    >
                      <option value="">{language === 'ms' ? 'Semua Saiz' : 'All Sizes'}</option>
                      {Array.from(new Set(cylinderTypes.map(t => t.type_code).filter(Boolean))).map(sizeCode => (
                        <option key={sizeCode} value={sizeCode}>{sizeCode}</option>
                      ))}
                    </select>
                  </div>

                  {/* Valve Type Filter Dropdown */}
                  <div className="w-full sm:max-w-[150px]">
                    <select
                      value={qrTypeFilter}
                      onChange={(e) => {
                        setQrTypeFilter(e.target.value)
                        setQrPage(1)
                      }}
                      className="w-full border border-border-default rounded-xl p-2.5 text-xs outline-none bg-surface text-text-secondary focus:ring-2 focus:ring-[#00a68a]/20 focus:border-[#00a68a] transition-colors font-semibold text-[11px]"
                    >
                      <option value="">{language === 'ms' ? 'Semua Jenis' : 'All Types'}</option>
                      <option value="BN">{language === 'ms' ? 'Bullnose (BN)' : 'Bullnose (BN)'}</option>
                      <option value="PI">{language === 'ms' ? 'Pin Index (PI)' : 'Pin Index (PI)'}</option>
                    </select>
                  </div>
                  <div className="w-full sm:max-w-[150px]">
                    <select
                      value={qrPageSize}
                      onChange={(e) => {
                        setQrPageSize(Number(e.target.value))
                        setQrPage(1)
                      }}
                      className="w-full border border-border-default rounded-xl p-2.5 text-xs outline-none bg-surface text-text-secondary focus:ring-2 focus:ring-[#00a68a]/20 focus:border-[#00a68a] transition-colors"
                    >
                      <option value={10}>{language === 'ms' ? 'Papar 10' : 'Show 10'}</option>
                      <option value={25}>{language === 'ms' ? 'Papar 25' : 'Show 25'}</option>
                      <option value={50}>{language === 'ms' ? 'Papar 50' : 'Show 50'}</option>
                      <option value={100}>{language === 'ms' ? 'Papar 100' : 'Show 100'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border-default rounded-2xl shadow-sm overflow-hidden">
                {/* Desktop View: Full Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-text-muted">
                    <thead className="bg-subtle/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-semibold">{language === 'ms' ? 'Siri Silinder' : 'Cylinder Serial'}</th>
                        <th className="px-6 py-3 font-semibold">{language === 'ms' ? 'Saiz & Jenis' : 'Size & Type'}</th>
                        <th className="px-6 py-3 font-semibold">{language === 'ms' ? 'Nilai Tag QR' : 'Active QR Tag Value'}</th>
                        <th className="px-6 py-3 font-semibold">{language === 'ms' ? 'Tarikh Didaftar' : 'Date Tagged'}</th>
                        <th className="px-6 py-3 font-semibold text-right">{language === 'ms' ? 'Tindakan' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle border-t border-border-subtle">
                      {paginatedTaggedCylinders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium italic">
                            {language === 'ms' ? 'Tiada kod QR dijumpai.' : 'No active QR codes found matching criteria.'}
                          </td>
                        </tr>
                      ) : (
                        paginatedTaggedCylinders.map(cyl => {
                          const isDeactivated = cyl.status === 'deactivated' || cyl.is_active === false

                          return (
                            <tr 
                              key={cyl.id} 
                              className={isDeactivated 
                                ? "bg-subtle opacity-60 hover:bg-subtle transition-colors select-none text-slate-400" 
                                : "hover:bg-subtle/50 transition-colors"
                              }
                            >
                              <td className="px-6 py-4 font-mono font-bold">
                                <div className="flex items-center gap-2">
                                  <span className={isDeactivated ? "line-through text-slate-400" : "text-text-primary"}>
                                    {cyl.serial_number}
                                  </span>
                                  {isDeactivated && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-subtle text-text-muted border border-border-default flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                      {language === 'ms' ? 'Dinyahaktif' : 'Deactivated'}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className={`px-6 py-4 font-medium ${isDeactivated ? 'text-slate-400' : 'text-text-muted'}`}>
                                {cyl.type_info?.type_name || 'Standard Cylinder'}
                              </td>
                              <td className={`px-6 py-4 font-mono font-semibold select-all ${isDeactivated ? 'text-slate-400 italic' : 'text-text-muted'}`}>
                                {isDeactivated 
                                  ? (cyl.qr_code_value ? <span className="line-through">{cyl.qr_code_value}</span> : (language === 'ms' ? '(Dinyahaktif)' : '(Deactivated)'))
                                  : (cyl.qr_code_value || '-')}
                              </td>
                              <td className={`px-6 py-4 font-semibold ${isDeactivated ? 'text-slate-400' : 'text-text-muted'}`}>
                                {cyl.qr_tagged_at || cyl.created_at ? new Date(cyl.qr_tagged_at || cyl.created_at).toLocaleString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isDeactivated ? (
                                    <button
                                      onClick={() => handleReactivateCylinder(cyl.id)}
                                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-500/20 transition-colors flex items-center gap-1 active:scale-95 shadow-sm"
                                      title={language === 'ms' ? 'Aktifkan Semula Silinder' : 'Reactivate Cylinder'}
                                    >
                                      <RotateCcw className="w-3 h-3 text-emerald-600" />
                                      {language === 'ms' ? 'Aktifkan Semula' : 'Reactivate'}
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setGeneratedLabels([cyl])
                                          setQrActiveTab('generate')
                                          setSelectedTypeId(cyl.type_id || '')
                                        }}
                                        className="px-2.5 py-1.5 bg-subtle/50 hover:bg-subtle text-text-secondary rounded-lg text-[10px] font-bold border border-border-default transition-colors flex items-center gap-1 active:scale-95"
                                        title={language === 'ms' ? 'Cetak Semula' : 'Reprint Tag'}
                                      >
                                        <Printer className="w-3 h-3 text-text-muted" />
                                        {language === 'ms' ? 'Cetak' : 'Reprint'}
                                      </button>
                                      <button
                                        onClick={() => handleDeactivateQrTag(cyl.id)}
                                        className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-100 transition-colors flex items-center gap-1 active:scale-95"
                                        title={language === 'ms' ? 'Nyahaktifkan' : 'Deactivate QR Tag'}
                                      >
                                        <Trash2 className="w-3 h-3 text-rose-500" />
                                        {language === 'ms' ? 'Nyahaktif' : 'Deactivate'}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: High-End Native Cards (Zero Horizontal Scroll!) */}
                <div className="md:hidden divide-y divide-border-subtle">
                  {paginatedTaggedCylinders.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold italic">
                      {language === 'ms' ? 'Tiada kod QR dijumpai.' : 'No active QR codes found matching criteria.'}
                    </div>
                  ) : (
                    paginatedTaggedCylinders.map(cyl => {
                      const isDeactivated = cyl.status === 'deactivated' || cyl.is_active === false

                      return (
                        <div 
                          key={cyl.id} 
                          className={`p-4 space-y-3 transition-colors ${
                            isDeactivated 
                              ? 'bg-subtle opacity-60 border-l-4 border-border-default select-none' 
                              : 'hover:bg-subtle/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                                {language === 'ms' ? 'No. Siri Silinder' : 'Cylinder Serial'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold text-sm ${isDeactivated ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                  {cyl.serial_number}
                                </span>
                                {isDeactivated && (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-subtle text-text-muted border border-border-default">
                                    {language === 'ms' ? 'Dinyahaktif' : 'Deactivated'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border text-right ${
                              isDeactivated 
                                ? 'bg-slate-200/60 text-text-muted border-border-default' 
                                : 'bg-subtle text-text-secondary border-border-default'
                            }`}>
                              {cyl.type_info?.type_name || 'Standard Cylinder'}
                            </span>
                          </div>

                          <div className={`border rounded-xl p-2.5 space-y-1 ${
                            isDeactivated 
                              ? 'bg-slate-200/40 border-border-default' 
                              : 'bg-subtle/50 border-border-default'
                          }`}>
                            <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                              {language === 'ms' ? 'Nilai Tag QR' : 'Active QR Tag Value'}
                            </span>
                            <span className={`font-mono text-xs font-bold select-all break-all block ${
                              isDeactivated ? 'text-slate-400 italic' : 'text-teal-700'
                            }`}>
                              {isDeactivated 
                                ? (cyl.qr_code_value ? <span className="line-through">{cyl.qr_code_value}</span> : (language === 'ms' ? '(Dinyahaktif)' : '(Deactivated)'))
                                : (cyl.qr_code_value || '-')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="text-[11px] text-text-muted">
                              <span className="text-slate-400 font-semibold">{language === 'ms' ? 'Didaftar: ' : 'Tagged: '}</span>
                              <span className={`font-semibold ${isDeactivated ? 'text-slate-400' : 'text-text-secondary'}`}>
                                {cyl.qr_tagged_at || cyl.created_at ? new Date(cyl.qr_tagged_at || cyl.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {isDeactivated ? (
                                <button
                                  onClick={() => handleReactivateCylinder(cyl.id)}
                                  className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-500/20 transition-colors flex items-center gap-1 active:scale-95 shadow-sm"
                                  title={language === 'ms' ? 'Aktifkan Semula Silinder' : 'Reactivate Cylinder'}
                                >
                                  <RotateCcw className="w-3 h-3 text-emerald-600" />
                                  {language === 'ms' ? 'Aktifkan' : 'Reactivate'}
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setGeneratedLabels([cyl])
                                      setQrActiveTab('generate')
                                      setSelectedTypeId(cyl.type_id || '')
                                    }}
                                    className="px-2.5 py-1.5 bg-subtle hover:bg-subtle text-text-secondary rounded-lg text-[10px] font-bold border border-border-default transition-colors flex items-center gap-1 active:scale-95"
                                  >
                                    <Printer className="w-3 h-3 text-text-muted" />
                                    {language === 'ms' ? 'Cetak' : 'Reprint'}
                                  </button>
                                  <button
                                    onClick={() => handleDeactivateQrTag(cyl.id)}
                                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-500/20 transition-colors flex items-center gap-1 active:scale-95"
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-500" />
                                    {language === 'ms' ? 'Nyahaktif' : 'Deactivate'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Pagination Controls */}
                {taggedCylinders.length > 0 && (
                  <div className="px-6 py-4 border-t border-border-subtle bg-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400 font-bold text-center sm:text-left">
                      {language === 'ms' ? 'Menunjukkan' : 'Showing'} <span className="text-text-secondary font-black">{((qrPage - 1) * qrPageSize) + 1}</span> {language === 'ms' ? 'hingga' : 'to'} <span className="text-text-secondary font-black">{Math.min(qrPage * qrPageSize, taggedCylinders.length)}</span> {language === 'ms' ? 'daripada' : 'of'} <span className="text-text-secondary font-black">{taggedCylinders.length}</span> {language === 'ms' ? 'entri' : 'entries'}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button 
                        disabled={qrPage === 1}
                        onClick={() => setQrPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 border border-border-default bg-surface hover:bg-subtle/50 active:scale-95 disabled:opacity-50 text-text-muted rounded-xl font-bold tracking-wider uppercase text-[10px] transition-colors"
                      >
                        {language === 'ms' ? 'SEBELUM' : 'PREV'}
                      </button>
                      
                      {(() => {
                        const totalPages = Math.ceil(taggedCylinders.length / qrPageSize);
                        const pages = [];
                        const range = 1; // Show current page +/- 1

                        for (let i = 1; i <= totalPages; i++) {
                          if (
                            i === 1 ||
                            i === totalPages ||
                            (i >= qrPage - range && i <= qrPage + range)
                          ) {
                            pages.push(i);
                          } else if (pages[pages.length - 1] !== '...') {
                            pages.push('...');
                          }
                        }

                        return pages.map((p, idx) => {
                          if (p === '...') {
                            return (
                              <span key={`dots-${idx}`} className="px-1.5 text-slate-400 font-black select-none">
                                ...
                              </span>
                            );
                          }

                          const pageNum = p as number;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setQrPage(pageNum)}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors ${
                                qrPage === pageNum
                                  ? 'bg-[#00a68a] text-white shadow-sm'
                                  : 'bg-surface border border-border-default text-text-muted hover:bg-subtle/50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        });
                      })()}

                      <button 
                        disabled={qrPage * qrPageSize >= taggedCylinders.length}
                        onClick={() => setQrPage(prev => prev + 1)}
                        className="px-3 py-1.5 border border-border-default bg-surface hover:bg-subtle/50 active:scale-95 disabled:opacity-50 text-text-muted rounded-xl font-bold tracking-wider uppercase text-[10px] transition-colors"
                      >
                        {language === 'ms' ? 'SETERUS' : 'NEXT'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    // 4. STOCK RECONCILIATION AUDIT VIEW
    if (currentPath === '/pharmacy/oxygen/reconciliation') {
      // Group cylinders by Type and Size
      const groupedCylinders = cylinders.reduce((acc: Record<string, OxygenCylinderWithRelations[]>, cyl) => {
        const groupKey = cyl.type_info?.type_name || 'Standard Cylinder';
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(cyl);
        return acc;
      }, {});

      const groupNames = Object.keys(groupedCylinders);
      const activeGroup = selectedReconciliationGroup === '__ALL__'
        ? '__ALL__'
        : (selectedReconciliationGroup && groupedCylinders[selectedReconciliationGroup]
            ? selectedReconciliationGroup
            : groupNames[0] || null);
      const activeCylinders = activeGroup === '__ALL__'
        ? cylinders
        : (activeGroup ? (groupedCylinders[activeGroup] || []) : []);

      // Categorize cylinders: Available in System (Verified) vs Scanned in Audit (Pending Verification)
      const isCylinderScanned = (cyl: any) => Boolean(
        physicalCounts[cyl.id] || 
        physicalLocations[cyl.id] || 
        physicalScannedBy[cyl.id] || 
        cyl.scanned_by_name || 
        cyl.qr_tagged_at ||
        cyl.scanned_location
      );

      const isCylinderVerified = (cyl: any) => Boolean(
        cyl.is_verified || 
        verifiedCylinderIds.has(cyl.id)
      );

      // Scanned tab = Scanned but pending verification
      const scannedCylinders = activeCylinders.filter(cyl => isCylinderScanned(cyl) && !isCylinderVerified(cyl));

      // Available in System tab = Verified cylinders (plus legacy unscanned master records)
      const systemCylinders = activeCylinders.filter(cyl => isCylinderVerified(cyl) || !isCylinderScanned(cyl));

      const displayCylinders = reconciliationTab === 'scanned'
        ? scannedCylinders
        : systemCylinders;

      // Filter by search / scan query
      const searchNormalized = reconciliationSearch.trim().toLowerCase();
      const filteredCylinders = displayCylinders.filter(cyl => {
        if (!searchNormalized) return true;
        const serial = (cyl.serial_number || '').toLowerCase();
        const qr = (cyl.qr_code_value || '').toLowerCase();
        const rawLoc = physicalLocations[cyl.id] || cyl.scanned_location || getCylinderLocation(cyl);
        const locStr = (typeof rawLoc === 'object' ? (rawLoc?.location_name || rawLoc?.name || '') : String(rawLoc || '')).toLowerCase();
        const typeStr = (cyl.type_info?.type_name || '').toLowerCase();
        return serial.includes(searchNormalized) || qr.includes(searchNormalized) || locStr.includes(searchNormalized) || typeStr.includes(searchNormalized);
      });

      // Detect if search matches cylinders in other groups
      const otherGroupMatches = searchNormalized && activeGroup !== '__ALL__'
        ? cylinders.filter(cyl => {
            const grp = cyl.type_info?.type_name || 'Standard Cylinder';
            if (grp === activeGroup) return false;
            const serial = (cyl.serial_number || '').toLowerCase();
            const qr = (cyl.qr_code_value || '').toLowerCase();
            return serial.includes(searchNormalized) || qr.includes(searchNormalized);
          })
        : [];

      // Single cylinder verify action
      const handleVerifyCylinder = async (cylId: string) => {
        try {
          const cyl = cylinders.find(c => c.id === cylId);
          if (!cyl) return;

          const expectedNorm = getExpectedStateForCylinder(cyl);
          const normalizedNew = physicalCounts[cylId] ? normalizeStatusForReconciliation(physicalCounts[cylId]) : expectedNorm;
          const rawNewLoc = physicalLocations[cylId] || cyl.scanned_location || getCylinderLocation(cyl, normalizedNew);
          let newLocation = typeof rawNewLoc === 'object' ? (rawNewLoc?.location_name || rawNewLoc?.name || 'Pharmacy Store') : (rawNewLoc || 'Pharmacy Store');
          if (normalizedNew === 'available') {
            newLocation = 'Pharmacy Store';
          }
          const dbStatus = mapReconciliationToDbStatus(normalizedNew, newLocation);
          const auditorName = physicalScannedBy[cylId]?.user || cyl.scanned_by_name || user?.full_name || 'AMRI AMIT';

          if (isSupabaseConfigured()) {
            await supabase
              .from('pharmacy_oxygen_cylinder_inventory')
              .update({
                is_verified: true,
                verified_at: new Date().toISOString(),
                verified_by: user?.id || null,
                verified_by_name: auditorName,
                current_location: newLocation,
                scanned_location: newLocation,
                status: dbStatus,
                updated_at: new Date().toISOString(),
                last_reconciled_at: new Date().toISOString()
              })
              .eq('id', cylId);

            await supabase.from('audit_logs').insert({
              user_id: user?.id || 'SYSTEM',
              action: 'VERIFIED_CYLINDER_AUDIT',
              module: 'OXYGEN_INVENTORY',
              entity_type: 'cylinder',
              entity_id: cylId,
              new_values: {
                serial_number: cyl.serial_number,
                location: newLocation,
                status: dbStatus,
                verified_by: auditorName,
                verified_at: new Date().toISOString()
              }
            });
          }

          setVerifiedCylinderIds(prev => new Set(prev).add(cylId));
          setCylinders(prev => prev.map(c => c.id === cylId ? { ...c, is_verified: true, current_location: newLocation, scanned_location: newLocation, status: dbStatus } : c));
          
          // Prepend to live audit logs in UI
          const newLogEntry = {
            id: `log-${Date.now()}-${Math.random()}`,
            action: 'VERIFIED_CYLINDER_AUDIT',
            created_at: new Date().toISOString(),
            user: {
              full_name: auditorName,
              jawatan: user?.jawatan || 'Pegawai Farmasi'
            },
            new_values: {
              serial_number: cyl.serial_number,
              location: newLocation,
              status: dbStatus,
              verified_by: auditorName,
              verified_at: new Date().toISOString()
            },
            old_values: {
              status: expectedNorm
            }
          };
          setReconciliationLogs(prev => [newLogEntry, ...prev]);

          setAuditSuccessMsg(
            language === 'ms' 
              ? `✅ Silinder ${cyl.serial_number} telah disahkan dan direkodkan ke "Dalam Sistem"!`
              : `✅ Cylinder ${cyl.serial_number} verified and recorded in System Inventory!`
          );
          setTimeout(() => setAuditSuccessMsg(null), 4000);
        } catch (err: any) {
          console.error('Error verifying cylinder:', err);
        }
      };

      // Batch verify all scanned cylinders in active group
      const handleVerifyAllScanned = async (groupCylinders: any[]) => {
        if (!groupCylinders || groupCylinders.length === 0) return;
        try {
          for (const c of groupCylinders) {
            await handleVerifyCylinder(c.id);
          }
          setReconciliationTab('system');
        } catch (err) {
          console.error('Error verifying all:', err);
        }
      };

      // Toggle valve type (BN <-> PI) directly from the stock reconciliation audit table
      const handleToggleCylinderValveType = async (e: React.MouseEvent, cyl: any) => {
        e.stopPropagation();
        const currentCode = (cyl.type_info?.code || (cyl.type_info?.type_name?.includes('PI') ? 'PI' : 'BN')).toUpperCase();
        const nextCode: 'BN' | 'PI' = currentCode === 'BN' ? 'PI' : 'BN';
        
        try {
          const res = await updateCylinderValveType(hospitalId, cyl.id, nextCode, user?.id);
          if (res.error) {
            setAuditSuccessMsg(`❌ ${res.error}`);
            setTimeout(() => setAuditSuccessMsg(null), 4000);
            return;
          }

          const sizeCode = cyl.size_info?.code || '';
          const capStr = cyl.size_info?.capacity ? String(cyl.size_info.capacity) : '1.4';
          const isLoan = Boolean(cyl.is_loan || cyl.size_info?.is_loan || sizeCode.startsWith('101-'));
          const newTypeName = cyl.size_info
            ? (isLoan ? `Loan ${sizeCode} (${capStr}M³)` : `Standard ${sizeCode} ${nextCode} (${capStr}M³)`).replace(/\s+/g, ' ')
            : (nextCode === 'BN' ? 'Bullnose Cylinder' : 'Pin Index Cylinder');

          setCylinders(prev => prev.map(c => {
            if (c.id !== cyl.id) return c;
            return {
              ...c,
              cylinder_type_id: res.data?.cylinder_type_id || c.cylinder_type_id,
              type_info: {
                ...c.type_info,
                code: nextCode,
                name: nextCode === 'BN' ? 'Bullnose' : 'Pin Index',
                type_name: newTypeName
              }
            };
          }));

          setAuditSuccessMsg(
            language === 'ms'
              ? `✅ Injap silinder ${cyl.serial_number} berjaya ditukar kepada ${nextCode === 'BN' ? 'Bullnose (BN)' : 'Pin Index (PI)'}!`
              : `✅ Valve for cylinder ${cyl.serial_number} successfully updated to ${nextCode === 'BN' ? 'Bullnose (BN)' : 'Pin Index (PI)'}!`
          );
          setTimeout(() => setAuditSuccessMsg(null), 4000);
        } catch (err: any) {
          console.error('Error toggling valve type:', err);
        }
      };

      // Barcode / QR scanner Enter key handler
      const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = reconciliationSearch.trim().toLowerCase();
          if (!query) return;

          // 1. Search in active cylinders first
          let target = activeCylinders.find(c => 
            (c.serial_number || '').toLowerCase() === query || 
            (c.qr_code_value || '').toLowerCase() === query
          );

          let matchedGroup: string | null = null;
          // 2. If not found in active cylinders, search all cylinders across groups
          if (!target) {
            target = cylinders.find(c => 
              (c.serial_number || '').toLowerCase() === query || 
              (c.qr_code_value || '').toLowerCase() === query
            );
            if (target) {
              matchedGroup = target.type_info?.type_name || 'Standard Cylinder';
              setSelectedReconciliationGroup(matchedGroup);
            }
          }

          if (target) {
            setHighlightedCylinderId(target.id);
            setSelectedReconciliationIds(prev => new Set(prev).add(target!.id));
            setReconciliationPage(1);
            setAuditSuccessMsg(
              language === 'ms'
                ? `🎯 Silinder ${target.serial_number} ditemui ${matchedGroup ? `(Kumpulan: ${matchedGroup})` : ''}!`
                : `🎯 Cylinder ${target.serial_number} found ${matchedGroup ? `(Group: ${matchedGroup})` : ''}!`
            );
            setTimeout(() => setAuditSuccessMsg(null), 4000);
          } else {
            setAuditSuccessMsg(
              language === 'ms'
                ? `⚠️ Tiada silinder ditemui dengan no. siri / kod "${reconciliationSearch}".`
                : `⚠️ No cylinder found with serial / code "${reconciliationSearch}".`
            );
            setTimeout(() => setAuditSuccessMsg(null), 4000);
          }
        }
      };

      // Pagination calculation
      const totalCylindersInTab = filteredCylinders.length;
      const totalPages = Math.max(1, Math.ceil(totalCylindersInTab / reconciliationPageSize));
      const paginatedCylinders = filteredCylinders.slice(
        (reconciliationPage - 1) * reconciliationPageSize,
        reconciliationPage * reconciliationPageSize
      );

      // Bulk Selection State Helpers
      const isAllVisibleSelected = paginatedCylinders.length > 0 && paginatedCylinders.every(c => selectedReconciliationIds.has(c.id));
      const isSomeVisibleSelected = paginatedCylinders.some(c => selectedReconciliationIds.has(c.id)) && !isAllVisibleSelected;

      const handleToggleSelectAllVisible = () => {
        setSelectedReconciliationIds(prev => {
          const next = new Set(prev);
          if (isAllVisibleSelected) {
            paginatedCylinders.forEach(c => next.delete(c.id));
          } else {
            paginatedCylinders.forEach(c => next.add(c.id));
          }
          return next;
        });
      };

      const handleSelectAllInGroup = () => {
        setSelectedReconciliationIds(prev => {
          const next = new Set(prev);
          filteredCylinders.forEach(c => next.add(c.id));
          return next;
        });
      };

      const handleToggleSelectRow = (cylId: string) => {
        setSelectedReconciliationIds(prev => {
          const next = new Set(prev);
          if (next.has(cylId)) {
            next.delete(cylId);
          } else {
            next.add(cylId);
          }
          return next;
        });
      };

      // Bulk Change Physical Count / Status
      const handleApplyBulkStatus = (targetStatus: string) => {
        if (selectedReconciliationIds.size === 0) return;
        const normStatus = normalizeStatusForReconciliation(targetStatus);
        const currentAuditor = user?.full_name || user?.email || 'Staff Auditor';
        const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const selectedCount = selectedReconciliationIds.size;

        setPhysicalCounts(prev => {
          const next = { ...prev };
          selectedReconciliationIds.forEach(id => {
            next[id] = normStatus;
          });
          return next;
        });

        setPhysicalLocations(prev => {
          const next = { ...prev };
          selectedReconciliationIds.forEach(id => {
            if (normStatus === 'available' || normStatus === 'empty') {
              next[id] = 'Pharmacy Store';
            } else if (normStatus === 'return') {
              next[id] = 'Supplier';
            }
          });
          return next;
        });

        setPhysicalScannedBy(prev => {
          const next = { ...prev };
          selectedReconciliationIds.forEach(id => {
            next[id] = { user: currentAuditor, timestamp: nowFormatted };
          });
          return next;
        });

        const label = getStatusLabel(normStatus);
        setAuditSuccessMsg(
          language === 'ms'
            ? `✅ Status bagi ${selectedCount} silinder telah ditukar kepada "${label}"! Sila klik "Save Reconciliation Audit" untuk menyimpan.`
            : `✅ Status for ${selectedCount} cylinders updated to "${label}"! Please click "Save Reconciliation Audit" to save.`
        );
        setTimeout(() => setAuditSuccessMsg(null), 5000);
      };

      // Bulk Verify Selected Cylinders
      const handleBulkVerifySelected = async () => {
        if (selectedReconciliationIds.size === 0) return;
        const idsToVerify = Array.from(selectedReconciliationIds);
        try {
          for (const id of idsToVerify) {
            await handleVerifyCylinder(id);
          }
          setSelectedReconciliationIds(new Set());
          setAuditSuccessMsg(
            language === 'ms'
              ? `✅ ${idsToVerify.length} silinder berjaya disahkan dan direkodkan ke Sistem!`
              : `✅ ${idsToVerify.length} cylinders verified and recorded in System Inventory!`
          );
          setTimeout(() => setAuditSuccessMsg(null), 4000);
        } catch (err) {
          console.error('Error verifying selected cylinders:', err);
        }
      };

      const handleGroupSelect = (groupName: string) => {
        setSelectedReconciliationGroup(groupName);
        setReconciliationPage(1);
      };

      return (
        <div className="space-y-8">
          {auditSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-400 font-bold">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              {auditSuccessMsg}
            </div>
          )}

          {/* Sidebar separation and main table grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar: Type / Size Selector */}
            <div className="lg:col-span-1 bg-surface border border-border-default rounded-2xl p-4 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {language === 'ms' ? 'Jenis & Saiz' : 'Cylinder Types & Sizes'}
              </h3>
              {groupNames.length === 0 ? (
                <p className="text-xs text-gray-400 italic">{language === 'ms' ? 'Tiada jenis tersedia' : 'No types available'}</p>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => handleGroupSelect('__ALL__')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-bold transition-colors border ${
                      activeGroup === '__ALL__'
                        ? 'bg-[#00a68a]/10 text-[#00a68a] border-[#00a68a]/20 shadow-sm shadow-[#00a68a]/5'
                        : 'text-text-muted hover:bg-subtle/50 border-transparent hover:text-text-primary'
                    }`}
                  >
                    <span className="truncate pr-2">{language === 'ms' ? 'Semua Silinder' : 'All Cylinders'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      activeGroup === '__ALL__' ? 'bg-[#00a68a] text-white' : 'bg-subtle text-text-muted'
                    }`}>
                      {cylinders.length}
                    </span>
                  </button>
                  {groupNames.map(name => {
                    const count = groupedCylinders[name].length;
                    const isActive = name === activeGroup;
                    return (
                      <button
                        key={name}
                        onClick={() => handleGroupSelect(name)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-bold transition-colors border ${
                          isActive
                            ? 'bg-[#00a68a]/10 text-[#00a68a] border-[#00a68a]/20 shadow-sm shadow-[#00a68a]/5'
                            : 'text-text-muted hover:bg-subtle/50 border-transparent hover:text-text-primary'
                        }`}
                      >
                        <span className="truncate pr-2">{name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          isActive ? 'bg-[#00a68a] text-white' : 'bg-subtle text-text-muted'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Side: Reconciled Table list */}
            <div className="lg:col-span-3 space-y-6">
              {activeGroup ? (
                <div className="bg-surface border border-border-default rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-border-subtle bg-subtle/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#00a68a]" />
                      <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {activeGroup === '__ALL__' ? (language === 'ms' ? 'SEMUA SILINDER (KESELURUHAN)' : 'ALL CYLINDERS (TOTAL)') : activeGroup}
                      </h3>
                    </div>

                    {/* Sub-Tab Switcher - 2 Tabs: System Inventory & Already Scanned */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
                        <button
                          onClick={() => { setReconciliationTab('system'); setReconciliationPage(1); }}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            reconciliationTab === 'system'
                              ? 'bg-surface text-[#00a68a] shadow-sm font-black'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>{language === 'ms' ? 'Dalam Sistem' : 'System Inventory'}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            reconciliationTab === 'system' ? 'bg-[#00a68a]/15 text-[#00a68a]' : 'bg-slate-300/60 text-text-muted'
                          }`}>
                            {systemCylinders.length}
                          </span>
                        </button>

                        <button
                          onClick={() => { setReconciliationTab('scanned'); setReconciliationPage(1); }}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            reconciliationTab === 'scanned'
                              ? 'bg-surface text-emerald-700 shadow-sm font-black'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ms' ? 'Sudah Di-Imbas' : 'Already Scanned'}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            reconciliationTab === 'scanned' ? 'bg-emerald-100 text-emerald-400' : 'bg-slate-300/60 text-text-muted'
                          }`}>
                            {scannedCylinders.length}
                          </span>
                        </button>
                      </div>

                      {reconciliationTab === 'scanned' && scannedCylinders.length > 0 && (
                        <button
                          onClick={() => handleVerifyAllScanned(scannedCylinders)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>{language === 'ms' ? `Sahkan Semua (${scannedCylinders.length})` : `Verify All (${scannedCylinders.length})`}</span>
                        </button>
                      )}
                    </div>

                    <span className="px-2.5 py-0.5 bg-subtle border border-border-default text-text-muted rounded-full text-[10px] font-bold">
                      {language === 'ms' ? 'Menunjukkan' : 'Showing'} {paginatedCylinders.length} {language === 'ms' ? 'daripada' : 'of'} {totalCylindersInTab}
                    </span>
                  </div>

                  {/* Search / Scan Bar & Quick Actions */}
                  <div className="p-3.5 border-b border-border-subtle bg-surface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={reconciliationSearch}
                        onChange={(e) => {
                          setReconciliationSearch(e.target.value);
                          setReconciliationPage(1);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={
                          language === 'ms' 
                            ? 'Imbas kod bar/QR atau taip No. Siri silinder (cth: saboxy-00211)...' 
                            : 'Scan barcode/QR or type cylinder serial (e.g. saboxy-00211)...'
                        }
                        className="w-full pl-9 pr-24 py-2 border border-border-default rounded-xl text-xs font-medium text-text-primary placeholder-gray-400 focus:outline-none focus:border-[#00a68a] focus:ring-1 focus:ring-[#00a68a] transition-colors bg-subtle/50 hover:bg-surface focus:bg-surface"
                      />
                      <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-1">
                        {reconciliationSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setReconciliationSearch('');
                              setReconciliationPage(1);
                            }}
                            className="p-1 hover:bg-subtle text-gray-400 hover:text-text-muted rounded-lg transition-colors cursor-pointer"
                            title={language === 'ms' ? 'Kosongkan carian' : 'Clear search'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsAuditScanOpen(true)}
                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 border border-emerald-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                          title={language === 'ms' ? 'Imbas Kod QR Kamera' : 'Scan QR Camera'}
                        >
                          <Camera className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'ms' ? 'Imbas' : 'Scan'}</span>
                        </button>
                      </div>
                    </div>

                    {reconciliationSearch && (
                      <div className="text-[11px] text-text-muted font-bold shrink-0 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#00a68a]/10 text-[#00a68a] border border-[#00a68a]/20">
                          {filteredCylinders.length} {language === 'ms' ? 'dijumpai' : 'found'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cross-Group Discovery Alert */}
                  {otherGroupMatches.length > 0 && (
                    <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-400 dark:text-amber-300 font-bold">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {language === 'ms'
                            ? `Dijumpai ${otherGroupMatches.length} silinder sepadan dalam kumpulan lain: `
                            : `Found ${otherGroupMatches.length} matching cylinder(s) in other groups: `}
                          <strong className="font-mono font-bold">
                            {Array.from(new Set(otherGroupMatches.map(c => c.type_info?.type_name || 'Standard Cylinder'))).slice(0, 2).join(', ')}
                          </strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const targetGrp = otherGroupMatches[0]?.type_info?.type_name || 'Standard Cylinder';
                          setSelectedReconciliationGroup(targetGrp);
                          setReconciliationPage(1);
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shadow-xs"
                      >
                        {language === 'ms' ? 'Tukar ke Kumpulan Ini' : 'Switch to Group'}
                      </button>
                    </div>
                  )}

                  {/* Bulk Action Toolbar */}
                  {selectedReconciliationIds.size > 0 && (
                    <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-xs">
                          <CheckSquare className="w-3.5 h-3.5" />
                          {selectedReconciliationIds.size} {language === 'ms' ? 'Dipilih' : 'Selected'}
                        </span>

                        {filteredCylinders.length > paginatedCylinders.length && selectedReconciliationIds.size < filteredCylinders.length && (
                          <button
                            type="button"
                            onClick={handleSelectAllInGroup}
                            className="text-[11px] text-[#00a68a] hover:underline font-bold cursor-pointer"
                          >
                            {language === 'ms' 
                              ? `Pilih semua ${filteredCylinders.length} silinder dalam senarai ini`
                              : `Select all ${filteredCylinders.length} cylinders in this list`}
                          </button>
                        )}
                      </div>

                      {/* Bulk Status Action Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          {language === 'ms' ? 'Tukar Status Pukal:' : 'Bulk Status:'}
                        </span>

                        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border-default shadow-xs">
                          <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="text-xs font-bold text-text-secondary bg-transparent py-1 px-2 outline-none border-r border-border-subtle cursor-pointer"
                          >
                            <option value="available">📦 {language === 'ms' ? 'Tersedia (Stor)' : 'Available (Store)'}</option>
                            <option value="used">🏥 {language === 'ms' ? 'Digunakan (Wad)' : 'In Use / Used (Ward)'}</option>
                            <option value="return">🔄 {language === 'ms' ? 'Pulang (Pembekal)' : 'Return (Supplier)'}</option>
                            <option value="empty">⭕ {language === 'ms' ? 'Kosong (Stor)' : 'Empty (Store)'}</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleApplyBulkStatus(bulkStatus)}
                            className="px-3 py-1 bg-[#00a68a] hover:bg-[#008f76] active:scale-95 text-white font-black text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            {language === 'ms' ? 'Terapkan' : 'Apply'}
                          </button>
                        </div>

                        {/* Quick 1-click status pills */}
                        <div className="hidden xl:flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleApplyBulkStatus('available')}
                            className="px-2 py-1 bg-surface hover:bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            title="Set to Available (Store)"
                          >
                            📦 {language === 'ms' ? 'Tersedia' : 'Available'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyBulkStatus('used')}
                            className="px-2 py-1 bg-surface hover:bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            title="Set to In Use (Ward)"
                          >
                            🏥 {language === 'ms' ? 'Digunakan' : 'In Use'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyBulkStatus('return')}
                            className="px-2 py-1 bg-surface hover:bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            title="Set to Return (Supplier)"
                          >
                            🔄 {language === 'ms' ? 'Pulang' : 'Return'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyBulkStatus('empty')}
                            className="px-2 py-1 bg-surface hover:bg-subtle text-text-secondary border border-border-default rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            title="Set to Empty (Store)"
                          >
                            ⭕ {language === 'ms' ? 'Kosong' : 'Empty'}
                          </button>
                        </div>

                        {/* Bulk Verify Button */}
                        <button
                          type="button"
                          onClick={handleBulkVerifySelected}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title={language === 'ms' ? 'Sahkan semua silinder dipilih' : 'Verify all selected cylinders'}
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>{language === 'ms' ? 'Sahkan Pilihan' : 'Verify Selected'}</span>
                        </button>

                        {/* Bulk Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const selectedList = cylinders.filter(c => selectedReconciliationIds.has(c.id));
                            if (selectedList.length > 0) {
                              setDeleteCylinderTarget(selectedList);
                            }
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title={language === 'ms' ? 'Padam semua silinder dipilih secara kekal' : 'Permanently delete all selected cylinders'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ms' ? 'Padam Pilihan' : 'Delete Selected'}</span>
                        </button>

                        {/* Clear Selection Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedReconciliationIds(new Set())}
                          className="p-1 hover:bg-subtle text-text-muted rounded-lg transition-colors cursor-pointer"
                          title={language === 'ms' ? 'Nyahpilih Semua' : 'Deselect All'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mobile View: Cards Layout */}
                  <div className="block md:hidden divide-y divide-border-subtle">
                    {paginatedCylinders.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 font-bold">
                        {language === 'ms' ? 'Tiada silinder ditemui.' : 'No cylinders found.'}
                      </div>
                    ) : (
                      paginatedCylinders.map(cyl => {
                        const expectedNorm = getExpectedStateForCylinder(cyl);
                        const currentPhysical = physicalCounts[cyl.id] || expectedNorm;
                        const isMatched = normalizeStatusForReconciliation(currentPhysical) === expectedNorm;
                        const rawLoc = physicalLocations[cyl.id] || cyl.scanned_location || getCylinderLocation(cyl, currentPhysical);
                        const locationLabel = typeof rawLoc === 'object' ? (rawLoc?.location_name || rawLoc?.name || 'Pharmacy Store') : (rawLoc || 'Pharmacy Store');
                        const isScanned = isCylinderScanned(cyl);
                        const isVerified = isCylinderVerified(cyl);
                        const scannerInfo = physicalScannedBy[cyl.id];
                        const scannedUser = scannerInfo?.user || cyl.scanned_by_name || (isScanned ? (user?.full_name || 'Staff Auditor') : null);
                        const isSelected = selectedReconciliationIds.has(cyl.id);
                        const isHighlighted = highlightedCylinderId === cyl.id;

                        return (
                          <div 
                            key={cyl.id} 
                            className={`p-4 space-y-3 transition-colors ${
                              isSelected ? 'bg-emerald-500/10' : ''
                            } ${
                              isHighlighted ? 'ring-2 ring-[#00a68a] bg-emerald-500/10 animate-pulse' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectRow(cyl.id)}
                                  className="w-4 h-4 rounded text-[#00a68a] focus:ring-[#00a68a] border-border-default cursor-pointer"
                                />
                                <span className="font-mono font-bold text-text-primary text-sm">{cyl.serial_number}</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(cyl)}
                                  className="p-1 text-slate-400 hover:text-teal-600 hover:bg-accent-base/10 rounded-lg transition-colors cursor-pointer"
                                  title={language === 'ms' ? 'Kemaskini No. Siri & Saiz Silinder' : 'Edit Serial & Size'}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {isScanned && (
                                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded text-[9px] font-bold inline-flex items-center gap-1">
                                    <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                    {language === 'ms' ? 'Di-Imbas' : 'Scanned'}
                                  </span>
                                )}
                                {/* Interactive Valve Type Badge */}
                                {(() => {
                                  const code = cyl.type_info?.code || (cyl.type_info?.type_name?.includes('PI') ? 'PI' : (cyl.type_info?.type_name?.includes('BN') ? 'BN' : null));
                                  const isBN = code === 'BN';
                                  const isPI = code === 'PI';
                                  return (
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleCylinderValveType(e, cyl)}
                                      title={isBN ? (language === 'ms' ? 'Klik untuk tukar ke Pin Index (PI)' : 'Click to switch to Pin Index (PI)') : isPI ? (language === 'ms' ? 'Klik untuk tukar ke Bullnose (BN)' : 'Click to switch to Bullnose (BN)') : (language === 'ms' ? 'Klik untuk tetapkan injap ke Bullnose (BN)' : 'Click to assign valve (BN)')}
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black border transition-colors cursor-pointer active:scale-95 shadow-elevation-1 ${
                                        isBN
                                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-100'
                                          : isPI
                                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-purple-100'
                                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 animate-pulse'
                                      }`}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                      <span>{isBN ? 'BN' : isPI ? 'PI' : 'Injap?'}</span>
                                      <RotateCcw className="w-2.5 h-2.5 opacity-50" />
                                    </button>
                                  );
                                })()}
                              </div>
                              {isMatched ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-100 px-2 py-0.5 rounded-md">
                                  <CheckCircle className="w-3 h-3" /> {language === 'ms' ? 'Padan' : 'Matched'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-100 px-2 py-0.5 rounded-md">
                                  <AlertCircle className="w-3 h-3" /> {language === 'ms' ? 'Tidak Padan' : 'Mismatch'}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-[11px]">
                              {activeGroup === '__ALL__' && (
                                <div className="space-y-0.5 col-span-2">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{language === 'ms' ? 'Jenis Silinder' : 'Cylinder Type'}</span>
                                  <span className="px-2 py-0.5 bg-subtle text-text-secondary rounded-md border border-border-default text-[10px] font-bold inline-block">
                                    {cyl.type_info?.type_name || 'Standard'}
                                  </span>
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{language === 'ms' ? 'Lokasi Silinder' : 'Location / Ward'}</span>
                                <span className="px-2 py-0.5 bg-accent-base/10 text-teal-700 rounded-md border border-teal-100 text-[10px] font-bold inline-block">
                                  {locationLabel}
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{language === 'ms' ? 'Diimbas Oleh' : 'Scanned By'}</span>
                                <span className="text-[10px] font-bold text-text-primary block truncate">
                                  {isScanned && scannedUser ? scannedUser : <span className="text-gray-400 italic text-[9px]">{language === 'ms' ? 'Belum Diimbas' : 'Not Scanned'}</span>}
                                </span>
                              </div>
                              <div className="space-y-0.5 col-span-2">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{language === 'ms' ? 'Status Jangkaan' : 'Expected State'}</span>
                                <span className="px-2 py-0.5 bg-subtle text-text-secondary rounded-md border border-border-default text-[10px] font-bold inline-block uppercase">
                                  {getStatusLabel(expectedNorm)}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{language === 'ms' ? 'Status Fizikal' : 'Physical Count / Status'}</span>
                              <select 
                                value={currentPhysical}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setPhysicalCounts(prev => ({ ...prev, [cyl.id]: newVal }));
                                  if (newVal === 'available' || newVal === 'empty') {
                                    setPhysicalLocations(prev => ({ ...prev, [cyl.id]: 'Pharmacy Store' }));
                                  } else if (newVal === 'return') {
                                    setPhysicalLocations(prev => ({ ...prev, [cyl.id]: 'Supplier' }));
                                  }
                                  setPhysicalScannedBy(prev => ({
                                    ...prev,
                                    [cyl.id]: {
                                      user: user?.full_name || user?.email || 'Staff Auditor',
                                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    }
                                  }));
                                }}
                                className="w-full border border-border-default rounded-lg p-2 bg-surface font-bold text-text-primary text-xs outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
                              >
                                <option value="available">{language === 'ms' ? 'Tersedia (Stor)' : 'Available (Store)'}</option>
                                <option value="used">{language === 'ms' ? 'Digunakan (Wad)' : 'Used / In Use (Ward)'}</option>
                                <option value="empty">{language === 'ms' ? 'Kosong (Stor)' : 'Empty (Store)'}</option>
                                <option value="return">{language === 'ms' ? 'Pemulangan (Pembekal)' : 'Return (Supplier)'}</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(cyl)}
                                className="py-2 px-3 border border-border-default hover:bg-subtle/50 text-text-secondary active:scale-95 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                                title={language === 'ms' ? `Update Cylinder ${cyl.serial_number}` : `Edit Cylinder ${cyl.serial_number}`}
                              >
                                <Pencil className="w-3.5 h-3.5 text-teal-600" />
                                <span>{language === 'ms' ? 'Kemaskini' : 'Edit'}</span>
                              </button>
                              {reconciliationTab === 'scanned' ? (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyCylinder(cyl.id)}
                                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{language === 'ms' ? 'Sahkan Silinder' : 'Verify Cylinder'}</span>
                                </button>
                              ) : (
                                <div className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-xl text-xs font-bold">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{language === 'ms' ? 'Disahkan' : 'Verified'}</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setDeleteCylinderTarget([cyl])}
                                className="py-2 px-3 border border-rose-500/20 hover:bg-rose-500/10 text-rose-600 active:scale-95 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                                title={language === 'ms' ? `Padam Silinder ${cyl.serial_number}` : `Delete Cylinder ${cyl.serial_number}`}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>{language === 'ms' ? 'Padam' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Desktop View: Standard Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs text-text-muted">
                      <thead className="bg-subtle/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                          <th scope="col" className="w-10 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isAllVisibleSelected}
                              ref={el => {
                                if (el) el.indeterminate = isSomeVisibleSelected;
                              }}
                              onChange={handleToggleSelectAllVisible}
                              className="w-4 h-4 rounded text-[#00a68a] focus:ring-[#00a68a] border-border-default cursor-pointer"
                              title={language === 'ms' ? 'Pilih semua di halaman ini' : 'Select all on this page'}
                            />
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">{language === 'ms' ? 'No. Siri' : 'Cylinder Serial'}</th>
                          {activeGroup === '__ALL__' && (
                            <th scope="col" className="px-4 py-3 font-semibold">{language === 'ms' ? 'Jenis Silinder' : 'Cylinder Type'}</th>
                          )}
                          <th scope="col" className="px-4 py-3 font-semibold">{language === 'ms' ? 'Lokasi Silinder' : 'Location / Ward'}</th>
                          <th scope="col" className="px-4 py-3 font-semibold">{language === 'ms' ? 'Diimbas Oleh' : 'Scanned By'}</th>
                          <th scope="col" className="px-4 py-3 font-semibold">{language === 'ms' ? 'Jangkaan' : 'Expected State'}</th>
                          <th scope="col" className="px-4 py-3 font-semibold">{language === 'ms' ? 'Status Fizikal' : 'Physical Count / Status'}</th>
                          <th scope="col" className="px-4 py-3 font-semibold">{language === 'ms' ? 'Audit' : 'Audit Status'}</th>
                          <th scope="col" className="px-4 py-3 font-semibold text-right">{language === 'ms' ? 'Tindakan' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle border-t border-border-subtle">
                        {paginatedCylinders.length === 0 ? (
                          <tr>
                            <td colSpan={activeGroup === '__ALL__' ? 9 : 8} className="py-8 text-center text-gray-400 font-bold">
                              {language === 'ms' ? 'Tiada silinder ditemui.' : 'No cylinders found.'}
                            </td>
                          </tr>
                        ) : (
                          paginatedCylinders.map(cyl => {
                            const expectedNorm = getExpectedStateForCylinder(cyl);
                            const currentPhysical = physicalCounts[cyl.id] || expectedNorm;
                            const isMatched = normalizeStatusForReconciliation(currentPhysical) === expectedNorm;
                            const rawLoc = physicalLocations[cyl.id] || cyl.scanned_location || getCylinderLocation(cyl, currentPhysical);
                            const locationLabel = typeof rawLoc === 'object' ? (rawLoc?.location_name || rawLoc?.name || 'Pharmacy Store') : (rawLoc || 'Pharmacy Store');
                            const isScanned = isCylinderScanned(cyl);
                            const isVerified = isCylinderVerified(cyl);
                            const scannerInfo = physicalScannedBy[cyl.id];
                            const scannedUser = scannerInfo?.user || cyl.scanned_by_name || (isScanned ? (user?.full_name || 'Staff Auditor') : null);
                            const scannedTime = scannerInfo?.timestamp || (cyl.qr_tagged_at ? new Date(cyl.qr_tagged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null);
                            const isSelected = selectedReconciliationIds.has(cyl.id);
                            const isHighlighted = highlightedCylinderId === cyl.id;

                            return (
                              <tr 
                                key={cyl.id} 
                                className={`transition-colors ${
                                  isSelected ? 'bg-emerald-500/10' : 'hover:bg-subtle/50'
                                } ${
                                  isHighlighted ? 'ring-2 ring-[#00a68a] bg-emerald-500/10 animate-pulse' : ''
                                }`}
                              >
                                <td className="w-10 px-4 py-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectRow(cyl.id)}
                                    className="w-4 h-4 rounded text-[#00a68a] focus:ring-[#00a68a] border-border-default cursor-pointer"
                                  />
                                </td>
                                <td className="px-4 py-4 font-mono font-bold text-text-primary">
                                  <div className="flex flex-col gap-1 items-start">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-black text-text-primary">{cyl.serial_number}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(cyl)}
                                        className="p-1 text-slate-400 hover:text-teal-600 hover:bg-accent-base/10 rounded-lg transition-colors cursor-pointer"
                                        title={language === 'ms' ? 'Kemaskini No. Siri & Saiz Silinder' : 'Edit Serial & Size'}
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      {isScanned && (
                                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded text-[9px] font-bold inline-flex items-center gap-1">
                                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                          {language === 'ms' ? 'Di-Imbas' : 'Scanned'}
                                        </span>
                                      )}
                                    </div>
                                    {/* Valve Type Toggle Badge */}
                                    {(() => {
                                      const code = cyl.type_info?.code || (cyl.type_info?.type_name?.includes('PI') ? 'PI' : (cyl.type_info?.type_name?.includes('BN') ? 'BN' : null));
                                      const isBN = code === 'BN';
                                      const isPI = code === 'PI';
                                      return (
                                        <button
                                          type="button"
                                          onClick={(e) => handleToggleCylinderValveType(e, cyl)}
                                          title={isBN ? (language === 'ms' ? 'Klik untuk tukar ke Pin Index (PI)' : 'Click to switch to Pin Index (PI)') : isPI ? (language === 'ms' ? 'Klik untuk tukar ke Bullnose (BN)' : 'Click to switch to Bullnose (BN)') : (language === 'ms' ? 'Klik untuk tetapkan injap ke Bullnose (BN)' : 'Click to assign valve (BN)')}
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border transition-colors cursor-pointer active:scale-95 shadow-elevation-1 ${
                                            isBN
                                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-100 hover:border-amber-300'
                                              : isPI
                                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-purple-100 hover:border-purple-300'
                                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 animate-pulse'
                                          }`}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                          <span>{isBN ? 'Bullnose (BN)' : isPI ? 'Pin Index (PI)' : '⚠️ Injap Tiada (Set BN)'}</span>
                                          <RotateCcw className="w-2.5 h-2.5 opacity-50 hover:opacity-100 ml-0.5" />
                                        </button>
                                      );
                                    })()}
                                  </div>
                                </td>
                                {activeGroup === '__ALL__' && (
                                  <td className="px-4 py-4 font-semibold text-text-muted">
                                    <span className="px-2 py-0.5 bg-subtle text-text-secondary rounded text-[10px] font-bold">
                                      {cyl.type_info?.type_name || 'Standard'}
                                    </span>
                                  </td>
                                )}
                                <td className="px-4 py-4 font-semibold text-text-muted">
                                  <span className="px-2.5 py-1 bg-accent-base/10 text-teal-700 rounded-lg border border-teal-100 text-[10px] font-bold inline-flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-teal-600" />
                                    {locationLabel}
                                  </span>
                                </td>
                                <td className="px-4 py-4 font-semibold text-text-secondary">
                                  {isScanned && scannedUser ? (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-[9px] shrink-0">
                                        {scannedUser.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <span className="text-[11px] font-bold text-text-primary block">
                                          {scannedUser}
                                        </span>
                                        {scannedTime && (
                                          <span className="text-[9px] text-gray-400 font-mono block">{scannedTime}</span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-[10px] italic">
                                      {language === 'ms' ? 'Belum Diimbas' : 'Not Scanned Yet'}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4 font-semibold text-text-muted uppercase">
                                  <span className="px-2.5 py-1 bg-subtle text-text-secondary rounded-lg border border-border-default text-[10px] font-bold">
                                    {getStatusLabel(expectedNorm)}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <select 
                                    value={currentPhysical}
                                    onChange={(e) => {
                                      const newVal = e.target.value;
                                      setPhysicalCounts(prev => ({ ...prev, [cyl.id]: newVal }));
                                      if (newVal === 'available' || newVal === 'empty') {
                                        setPhysicalLocations(prev => ({ ...prev, [cyl.id]: 'Pharmacy Store' }));
                                      } else if (newVal === 'return') {
                                        setPhysicalLocations(prev => ({ ...prev, [cyl.id]: 'Supplier' }));
                                      }
                                      setPhysicalScannedBy(prev => ({
                                        ...prev,
                                        [cyl.id]: {
                                          user: user?.full_name || user?.email || 'Staff Auditor',
                                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        }
                                      }));
                                    }}
                                    className="border border-border-default rounded-lg p-1.5 bg-surface font-bold text-text-primary text-[11px] outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
                                  >
                                    <option value="available">{language === 'ms' ? 'Tersedia (Stor)' : 'Available (Store)'}</option>
                                    <option value="used">{language === 'ms' ? 'Digunakan (Wad)' : 'Used / In Use (Ward)'}</option>
                                    <option value="empty">{language === 'ms' ? 'Kosong (Stor)' : 'Empty (Store)'}</option>
                                    <option value="return">{language === 'ms' ? 'Pemulangan (Pembekal)' : 'Return (Supplier)'}</option>
                                  </select>
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider 
                                    ${isMatched ? 'bg-emerald-100 text-emerald-700 border border-emerald-500/20' : 'bg-red-100 text-red-700 border border-red-200'}`}
                                  >
                                    {isMatched ? (language === 'ms' ? 'Padan' : 'Matched') : (language === 'ms' ? 'Tidak Padan' : 'Mismatch')}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(cyl)}
                                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-accent-base/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-accent-base/20 active:scale-90"
                                      title={language === 'ms' ? `Update Cylinder ${cyl.serial_number}` : `Edit Cylinder ${cyl.serial_number}`}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    {reconciliationTab === 'scanned' ? (
                                      <button
                                        type="button"
                                        onClick={() => handleVerifyCylinder(cyl.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm transition-colors cursor-pointer"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {language === 'ms' ? 'Sahkan' : 'Verify'}
                                      </button>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-lg text-[10px] font-bold">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                        {language === 'ms' ? 'Disahkan' : 'Verified'}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setDeleteCylinderTarget([cyl])}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/20 active:scale-90"
                                      title={language === 'ms' ? `Padam Silinder ${cyl.serial_number}` : `Delete Cylinder ${cyl.serial_number}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Control Bar */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-border-subtle bg-subtle/50 flex items-center justify-between">
                      <button
                        disabled={reconciliationPage === 1}
                        onClick={() => setReconciliationPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 border border-border-default bg-surface hover:bg-subtle/50 active:scale-95 disabled:opacity-50 text-text-muted rounded-xl font-bold tracking-wider uppercase text-[10px] transition-colors"
                      >
                        {language === 'ms' ? 'SEBELUM' : 'PREV'}
                      </button>
                      <span className="text-[11px] text-text-muted font-bold">
                        {language === 'ms' ? 'Halaman' : 'Page'} {reconciliationPage} {language === 'ms' ? 'daripada' : 'of'} {totalPages}
                      </span>
                      <button
                        disabled={reconciliationPage >= totalPages}
                        onClick={() => setReconciliationPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-3 py-1.5 border border-border-default bg-surface hover:bg-subtle/50 active:scale-95 disabled:opacity-50 text-text-muted rounded-xl font-bold tracking-wider uppercase text-[10px] transition-colors"
                      >
                        {language === 'ms' ? 'SETERUS' : 'NEXT'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-surface border border-border-default rounded-2xl p-8 text-center text-text-muted text-sm">
                  {language === 'ms' ? 'Tiada kumpulan dipilih.' : 'No group selected or no cylinders available.'}
                </div>
              )}
            </div>
          </div>

          {/* Audit Logs Section */}
          <div className="bg-surface border border-border-default rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border-subtle bg-subtle/50 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">{language === 'ms' ? 'Log Aktiviti Audit' : 'Recent Reconciliation Audit Activity Logs'}</h3>
            </div>
              <div className="divide-y divide-border-subtle">
                {reconciliationLogs.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-xs">
                    {language === 'ms' ? 'Tiada log aktiviti.' : 'No reconciliation activity logs recorded yet.'}
                  </div>
                ) : (
                  reconciliationLogs.map(log => {
                    const auditorTitle = log.user?.full_name || log.new_values?.verified_by || 'AMRI AMIT';
                    const isVerificationAction = log.action === 'VERIFIED_CYLINDER_AUDIT';
                    const isDeleteAction = log.action === 'DELETE_OXYGEN_CYLINDER' || log.action === 'BULK_DELETE_OXYGEN_CYLINDERS';

                    return (
                      <div key={log.id} className="p-4 hover:bg-subtle/50 transition-colors text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary">{auditorTitle}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-text-muted font-medium">{log.user?.jawatan || 'Pegawai Farmasi'}</span>
                          </div>
                          {isVerificationAction ? (
                            <p className="text-text-muted font-medium flex items-center flex-wrap gap-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded text-[9px] font-bold mr-1">
                                <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                {language === 'ms' ? 'Disahkan' : 'Verified'}
                              </span>
                              <span>{language === 'ms' ? 'Silinder' : 'Cylinder'}</span>
                              <span className="font-mono font-bold text-text-primary">{log.new_values?.serial_number || 'N/A'}</span>
                              <span>{language === 'ms' ? 'telah disahkan & dimasukkan ke' : 'verified & placed in'}</span>
                              <span className="text-teal-600 font-bold">{log.new_values?.location || 'Store'}</span>
                              <span>({language === 'ms' ? 'Status' : 'Status'}:</span>
                              <span className="font-bold text-emerald-600 uppercase">{log.new_values?.status || 'Available'}</span>
                              <span>)</span>
                            </p>
                          ) : isDeleteAction ? (
                            <p className="text-text-muted font-medium flex items-center flex-wrap gap-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/10 text-rose-700 border border-rose-500/20 rounded text-[9px] font-bold mr-1">
                                <Trash2 className="w-2.5 h-2.5 text-rose-600" />
                                {language === 'ms' ? 'Dipadam' : 'Deleted'}
                              </span>
                              {log.action === 'BULK_DELETE_OXYGEN_CYLINDERS' ? (
                                <span>
                                  {language === 'ms' ? `Sebanyak ${log.new_values?.count || ''} silinder telah dipadam dari pangkalan data.` : `${log.new_values?.count || ''} cylinders were deleted from inventory database.`}
                                </span>
                              ) : (
                                <span>
                                  {language === 'ms' ? 'Silinder' : 'Cylinder'} <span className="font-mono font-bold text-text-primary">{log.new_values?.serial_number || log.old_values?.serial_number || 'N/A'}</span> {language === 'ms' ? 'telah dipadam secara kekal dari inventori.' : 'was deleted permanently from inventory.'}
                                </span>
                              )}
                              {log.new_values?.reason && (
                                <span className="text-text-muted italic text-[11px]">
                                  ({log.new_values.reason})
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="text-text-muted font-medium">
                              {language === 'ms' ? 'Status silinder diselaraskan' : 'Reconciled status of cylinder'} <span className="font-mono font-bold text-text-primary">{log.new_values?.serial_number || 'N/A'}</span> {language === 'ms' ? 'daripada' : 'from'} {' '}
                              <span className="font-bold text-rose-600 uppercase">{log.old_values?.status || 'N/A'}</span> {language === 'ms' ? 'kepada' : 'to'} {' '}
                              <span className="font-bold text-emerald-600 uppercase">{log.new_values?.status || 'N/A'}</span> {' '}
                              ({language === 'ms' ? 'kini di' : 'now belongs to'} <span className="text-teal-600 font-semibold">{log.new_values?.location || 'Store'}</span>)
                            </p>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold shrink-0">
                          {new Date(log.created_at).toLocaleString('ms-MY', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
          </div>

          <ScanReconciliationModal
            hospitalId={hospitalId || ''}
            isOpen={isAuditScanOpen}
            onClose={() => setIsAuditScanOpen(false)}
            onScanMatch={(cylinderId, status, unitLocation) => {
              const currentAuditor = user?.full_name || user?.email || 'Staff Auditor';
              const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              setPhysicalCounts(prev => ({ ...prev, [cylinderId]: status }));
              if (unitLocation) {
                setPhysicalLocations(prev => ({ ...prev, [cylinderId]: unitLocation }));
              }
              setPhysicalScannedBy(prev => ({ ...prev, [cylinderId]: { user: currentAuditor, timestamp: nowFormatted } }));
              const cyl = cylinders.find(c => c.id === cylinderId);
              if (cyl) {
                const groupKey = cyl.type_info?.type_name || 'Standard Cylinder';
                setSelectedReconciliationGroup(groupKey);
              }
              setHighlightedCylinderId(cylinderId);
              setSelectedReconciliationIds(prev => new Set(prev).add(cylinderId));
            }}
            onBatchScanMatch={(batchItems) => {
              const currentAuditor = user?.full_name || user?.email || 'Staff Auditor';
              const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              setPhysicalCounts(prev => {
                const next = { ...prev };
                batchItems.forEach(item => { next[item.cylinderId] = item.status; });
                return next;
              });
              setPhysicalLocations(prev => {
                const next = { ...prev };
                batchItems.forEach(item => {
                  if (item.unitLocation) next[item.cylinderId] = item.unitLocation;
                });
                return next;
              });
              setPhysicalScannedBy(prev => {
                const next = { ...prev };
                batchItems.forEach(item => {
                  next[item.cylinderId] = { user: currentAuditor, timestamp: nowFormatted };
                });
                return next;
              });
              if (batchItems.length > 0) {
                const lastId = batchItems[batchItems.length - 1].cylinderId;
                const cyl = cylinders.find(c => c.id === lastId);
                if (cyl) {
                  const groupKey = cyl.type_info?.type_name || 'Standard Cylinder';
                  setSelectedReconciliationGroup(groupKey);
                }
                setHighlightedCylinderId(lastId);
                setSelectedReconciliationIds(prev => {
                  const next = new Set(prev);
                  batchItems.forEach(item => next.add(item.cylinderId));
                  return next;
                });
              }
            }}
            onNewCylinderRegistered={(newCyl) => {
              const currentAuditor = user?.full_name || user?.email || 'Staff Auditor';
              const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              setCylinders(prev => [newCyl, ...prev.filter(c => c.id !== newCyl.id)]);
              setPhysicalCounts(prev => ({ ...prev, [newCyl.id]: newCyl.status || 'available' }));
              if (newCyl.current_location) {
                const locStr = typeof newCyl.current_location === 'object'
                  ? (newCyl.current_location?.location_name || 'Pharmacy Store')
                  : String(newCyl.current_location || 'Pharmacy Store');
                setPhysicalLocations(prev => ({ ...prev, [newCyl.id]: locStr }));
              }
              setPhysicalScannedBy(prev => ({ ...prev, [newCyl.id]: { user: currentAuditor, timestamp: nowFormatted } }));
              const groupKey = newCyl.type_info?.type_name || 'Standard Cylinder';
              setSelectedReconciliationGroup(groupKey);
              setHighlightedCylinderId(newCyl.id);
              setSelectedReconciliationIds(prev => new Set(prev).add(newCyl.id));
            }}
            existingCylinders={cylinders}
            onCylinderUpdated={handleEditCylinderSuccess}
          />

          <AuditReconciliationSummaryModal
            isOpen={isAuditReviewOpen}
            onClose={() => setIsAuditReviewOpen(false)}
            onConfirmSave={(remarks) => handleAuditSubmit(remarks)}
            isSaving={isSavingReconciliation}
            auditorName={user?.full_name || 'Pharmacy Officer'}
            auditorRole={user?.jawatan || 'Officer'}
            changes={getReconciliationChangesList()}
            totalCylindersCount={cylinders.length}
          />
        </div>
      );
    }

    // DEFAULT MAIN OXYGEN DASHBOARD VIEW

    return (
      <div className="space-y-8">
        
        {/* ========================================================
            VOTE CODE SELECTOR / FILTER BAR & SEGREGATED FINANCIAL METRICS
           ======================================================== */}
        <div className="bg-surface border border-border-default rounded-xl p-3 sm:p-4 shadow-elevation-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left Header info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-accent-base/10 border border-accent-base/20 flex items-center justify-center text-accent-base shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {language === 'ms' ? 'SUMBER PERUNTUKAN (KOD UNDI)' : 'BUDGET ALLOCATION (VOTE CODE)'}
                </div>
                <div className="text-xs sm:text-sm font-bold text-text-primary truncate">
                  {dashboardVoteFilter === 'all' 
                    ? (language === 'ms' ? 'Semua Vot Digabungkan (Konsolidasi)' : 'All Registered Votes Combined')
                    : `Kod Vot ${dashboardVoteFilter} ${dashboardVoteFilter === '080702' ? '(Kontrak Pusat / CC)' : dashboardVoteFilter === '080600' ? '(Duit Khas / Khas)' : ''}`}
                </div>
              </div>
            </div>

            {/* Right: Segmented Filter Chips (Clean wrap, zero horizontal scrollbar) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setDashboardVoteFilter('all')
                  setCurrentPage(1)
                  setMonthlyCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  dashboardVoteFilter === 'all'
                    ? 'bg-accent-base text-white shadow-elevation-1 font-bold'
                    : 'bg-subtle/50 hover:bg-subtle text-text-secondary border border-border-default active:scale-95'
                }`}
              >
                {language === 'ms' ? 'Semua Vot' : 'All Votes'}
              </button>
              {availableVoteCodes.map(code => {
                const isCc = code === '080702';
                const isKhas = code === '080600';
                const label = isCc ? `Vot ${code} (CC)` : isKhas ? `Vot ${code} (Khas)` : `Vot ${code}`;
                const isActive = dashboardVoteFilter === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setDashboardVoteFilter(code)
                      setCurrentPage(1)
                      setMonthlyCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-accent-base text-white shadow-elevation-1 font-bold'
                        : 'bg-subtle/50 hover:bg-subtle text-text-secondary border border-border-default active:scale-95'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {(() => {
          const activeFin = dashboardVoteFilter === 'all'
            ? financials
            : financials?.by_vote_code?.[dashboardVoteFilter]

          const displayAllocation = activeFin?.total_allocation ?? (dashboardVoteFilter === 'all' ? (financials?.total_allocation ?? 274000.0) : 0)
          const displayExpenses = activeFin?.total_expenses ?? 0
          const displayLiabilities = activeFin?.liabilities ?? 0
          const displayBalance = activeFin?.current_balance ?? 0
          const displayLoanCharges = activeFin?.loan_charges ?? 0
          const displayVoteBadge = dashboardVoteFilter === 'all'
            ? `${availableVoteCodes.length} KOD VOT BERDAFTAR`
            : `VOTE: ${dashboardVoteFilter} / ${activeFin?.vote_activity || '27402'}`
          const isOverBudget = displayBalance < 0
          const totalCommitted = displayExpenses + displayLiabilities
          const utilizationPct = displayAllocation > 0
            ? Math.min(100, Math.round((totalCommitted / displayAllocation) * 1000) / 10)
            : 0

          return (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
              {/* Card 1: Total Allocation */}
              <div className="col-span-1 order-2 lg:order-1 bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 shadow-elevation-1 hover:border-border-default/80 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block truncate">
                      {language === 'ms' ? 'JUMLAH PERUNTUKAN' : 'TOTAL ALLOCATION'}
                    </span>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono tabular-nums text-text-primary tracking-tight mt-1 truncate">
                      {fmt(displayAllocation)}
                    </h4>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent-base/10 border border-accent-base/20 rounded-lg flex items-center justify-center text-accent-base shrink-0">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center gap-1.5 text-[10px] font-semibold text-text-muted truncate">
                  <Database className="w-3 h-3 text-accent-base shrink-0" />
                  <span className="truncate">{displayVoteBadge}</span>
                </div>
              </div>

              {/* Card 2: Total Expenses */}
              <div className="col-span-1 order-3 lg:order-2 bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 shadow-elevation-1 hover:border-border-default/80 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block truncate">
                      {language === 'ms' ? 'PERBELANJAAN SEBENAR' : 'ACTUAL EXPENSES'}
                    </span>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono tabular-nums text-text-primary tracking-tight mt-1 truncate">
                      {fmt(displayExpenses)}
                    </h4>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center text-rose-400 shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center gap-1 text-[10px] font-semibold text-rose-400 truncate">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span className="truncate">{language === 'ms' ? 'Isian Semula Gas' : 'Gas Refills'}</span>
                </div>
              </div>

              {/* Card 3: Liabilities */}
              <div className="col-span-1 order-4 lg:order-3 bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 shadow-elevation-1 hover:border-border-default/80 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block truncate">
                      {language === 'ms' ? 'TANGGUNGAN PO/SO' : 'LIABILITIES'}
                    </span>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono tabular-nums text-text-primary tracking-tight mt-1 truncate">
                      {fmt(displayLiabilities)}
                    </h4>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-sky-500/10 border border-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 shrink-0">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border-subtle text-[10px] font-semibold text-text-muted truncate">
                  {language === 'ms' ? 'Pesanan Belum Selesai' : 'Committed PO / SO'}
                </div>
              </div>

              {/* Card 4 on Mobile (Order First) / Card 4 on Desktop (Net Current Balance) */}
              <div className={`col-span-2 order-first lg:order-4 lg:col-span-1 bg-surface border rounded-xl p-3.5 sm:p-4 shadow-elevation-1 transition-colors ${
                isOverBudget ? 'border-rose-500/50' : 'border-border-default'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      {language === 'ms' ? 'CURRENT BALANCE BERSIH' : 'NET CURRENT BALANCE'}
                    </span>
                    <h4 className={`text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight mt-1 ${
                      isOverBudget ? 'text-rose-400' : 'text-text-primary'
                    }`}>
                      {fmt(displayBalance)}
                    </h4>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isOverBudget ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Health Badge & Utilization Progress */}
                <div className="mt-2.5 pt-2 border-t border-border-subtle space-y-1.5">
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      isOverBudget ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                      {isOverBudget ? (language === 'ms' ? 'Defisit Melebihi Had' : 'Deficit Overdraft') : (language === 'ms' ? 'Peruntukan Sihat' : 'Healthy Allocation')}
                    </span>
                    <span className="font-mono font-semibold text-text-muted">
                      {utilizationPct}% {language === 'ms' ? 'digunakan' : 'used'}
                    </span>
                  </div>
                  {/* Utilization Progress Bar */}
                  <div className="h-1.5 w-full bg-subtle rounded-full overflow-hidden flex border border-border-default/50">
                    <div 
                      className="bg-accent-base h-full transition-colors" 
                      style={{ width: `${Math.min(100, displayAllocation > 0 ? (displayExpenses / displayAllocation) * 100 : 0)}%` }} 
                      title={`Belanja: ${fmt(displayExpenses)}`}
                    />
                    <div 
                      className="bg-sky-400 h-full transition-colors" 
                      style={{ width: `${Math.min(100 - (displayAllocation > 0 ? (displayExpenses / displayAllocation) * 100 : 0), displayAllocation > 0 ? (displayLiabilities / displayAllocation) * 100 : 0)}%` }} 
                      title={`Tanggungan: ${fmt(displayLiabilities)}`}
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Loan Charges */}
              <div className="col-span-1 order-5 lg:order-5 bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 shadow-elevation-1 hover:border-border-default/80 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block truncate">
                      {language === 'ms' ? 'CAJ PINJAMAN' : 'LOAN CHARGES'}
                    </span>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono tabular-nums text-text-primary tracking-tight mt-1 truncate">
                      {fmt(displayLoanCharges)}
                    </h4>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 shrink-0">
                    <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[10px] font-mono text-text-muted font-semibold truncate">
                    {fmt(systemSettings?.loan_cylinder_rate || 18.36)}/sil
                  </span>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ========================================================
            MODERN ACTION BAR
           ======================================================== */}
        <div className="bg-surface border border-border-default p-4 sm:p-5 rounded-xl shadow-elevation-1">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                {language === 'ms' ? 'Operasi Oksigen Perubatan' : 'Medical Oxygen Operations'}
              </h3>
              <p className="text-xs text-text-muted font-medium mt-0.5 flex flex-wrap items-center gap-2">
                <span>
                  {language === 'ms'
                    ? 'Pantau agihan silinder masa-nyata, daftarkan penerimaan, dan uruskan waran kerajaan.'
                    : 'Monitor real-time cylinder distribution, key in deliveries, and manage government warrants.'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  {language === 'ms' ? 'Diselaras' : 'SYNC'}: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
              <button 
                type="button"
                onClick={() => setIsReceiveModalOpen(true)}
                className="px-4 py-2.5 bg-accent-base hover:bg-accent-hover text-white rounded-xl text-xs font-semibold shadow-elevation-1 active:scale-[0.98] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ms' ? 'Daftar Penerimaan Oksigen' : 'Key In Received Oxygen'}</span>
              </button>
              <button 
                type="button"
                onClick={() => navigate(ROUTES.PHARMACY_OXYGEN_LEDGER)}
                className="px-4 py-2.5 bg-surface hover:bg-subtle text-text-primary border border-border-default rounded-xl text-xs font-semibold shadow-elevation-1 active:scale-[0.98] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ScrollText className="w-4 h-4 text-accent-base" />
                <span>{language === 'ms' ? 'Buka Lejar KEW.PS-4' : 'Open KEW.PS-4 Ledger'}</span>
              </button>
              <button 
                type="button"
                onClick={() => handleOpenPayLoanModal()}
                className="px-4 py-2.5 bg-subtle hover:bg-subtle/80 text-text-secondary border border-border-default rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                title={language === 'ms' ? 'Bayar caj pinjaman silinder sahaja tanpa penerimaan bekalan gas' : 'Pay cylinder loan charges only without gas delivery'}
              >
                <Receipt className="w-4 h-4 text-accent-base" />
                <span>{language === 'ms' ? 'Bayar Caj Pinjaman Silinder' : 'Pay Loan Charges Only'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            TWO COLUMN LAYOUT: EXPANDED TABLE & COMPACT SIDEBAR
           ======================================================== */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT SIDE: TRANSACTION LEDGER TABLE (Expands to fill available space) */}
          <div className="flex-1 min-w-0 bg-surface border border-border-default rounded-xl shadow-elevation-1 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-subtle/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-text-primary">
                    {language === 'ms' ? 'Log Penerimaan Oksigen' : 'Recent Oxygen Deliveries (Received Log)'}
                  </h2>
                  <span className="px-2 py-0.5 bg-accent-base/10 text-teal-700 border border-teal-100 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    KKM Audit Ledger
                  </span>
                </div>
                <p className="text-[11px] text-text-muted font-medium mt-0.5">
                  {language === 'ms'
                    ? 'Transaksi rasmi direkodkan di bawah peruntukan bajet kerajaan.'
                    : 'Official transactions recorded under governmental budget allocation.'}
                </p>
              </div>

              {/* View Switcher Controls & Quick Monthly Action */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-subtle p-0.5 rounded-lg border border-border-default">
                  <button
                    type="button"
                    onClick={() => {
                      setLedgerViewMode('detailed')
                      setCurrentPage(1)
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      ledgerViewMode === 'detailed'
                        ? 'bg-surface text-text-primary shadow-elevation-1 font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <List className="w-3.5 h-3.5 text-text-muted" />
                    <span>{language === 'ms' ? 'Semua Entri' : 'All Entries'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLedgerViewMode('monthly')
                      setMonthlyCurrentPage(1)
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      ledgerViewMode === 'monthly'
                        ? 'bg-accent-base text-white shadow-elevation-1 font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{language === 'ms' ? 'Bulanan' : 'Monthly'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const monthlyList = getMonthlyConsolidatedReceptions(receptionsList)
                    if (monthlyList.length > 0 && !selectedConsolidateMonthKey) {
                      setSelectedConsolidateMonthKey(monthlyList[0].monthKey)
                    }
                    setIsMonthlyModalOpen(true)
                  }}
                  className="px-3 py-1.5 bg-accent-base hover:bg-accent-hover text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-elevation-1 active:scale-95 cursor-pointer"
                  title={language === 'ms' ? 'Gabung Semua Silinder Mengikut Bulan' : 'Consolidate Cylinders by Month'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                  <span>{language === 'ms' ? 'Gabung Bulan' : 'Combine Month'}</span>
                </button>

                {/* Collapsible Panel Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border active:scale-95 cursor-pointer ${
                    isRightSidebarOpen
                      ? 'bg-subtle text-text-primary border-border-default hover:bg-subtle/80'
                      : 'bg-surface text-text-muted border-border-default hover:text-text-primary'
                  }`}
                  title={isRightSidebarOpen ? (language === 'ms' ? 'Sembunyi Panel Pembekal' : 'Hide Supplier Panel') : (language === 'ms' ? 'Papar Panel Pembekal' : 'Show Supplier Panel')}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isRightSidebarOpen ? (language === 'ms' ? 'Sembunyi Sisi' : 'Hide Sidebar') : (language === 'ms' ? 'Papar Sisi' : 'Show Sidebar')}</span>
                </button>
              </div>
            </div>

            {ledgerViewMode === 'detailed' ? (
              /* DETAILED PER-DELIVERY VIEW */
              <>
                {/* Desktop View: Full Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-text-secondary">
                    <thead className="bg-subtle text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border-default">
                      <tr>
                        <th className="px-3.5 py-3.5 whitespace-nowrap">{language === 'ms' ? 'TARIKH TERIMA' : 'RECEPTION DATE'}</th>
                        <th className="px-3.5 py-3.5 whitespace-nowrap">{language === 'ms' ? 'PESANAN PENGHANTARAN' : 'DELIVERY ORDER'}</th>
                        <th className="px-2.5 py-3.5 text-center whitespace-nowrap">{language === 'ms' ? 'KOD VOT' : 'VOTE CODE'}</th>
                        <th className="px-3 py-3.5 whitespace-nowrap">{language === 'ms' ? 'KOS ISIAN' : 'REFILL COST'}</th>
                        <th className="px-3 py-3.5 whitespace-nowrap">{language === 'ms' ? 'CAJ PINJAMAN' : 'LOAN CHARGES'}</th>
                        <th className="px-3 py-3.5 whitespace-nowrap">{language === 'ms' ? 'JUMLAH' : 'TOTAL COST'}</th>
                        <th className="px-2.5 py-3.5 text-center whitespace-nowrap">{language === 'ms' ? 'STATUS' : 'STATUS'}</th>
                        <th className="px-3.5 py-3.5 text-right whitespace-nowrap">{language === 'ms' ? 'DOKUMEN' : 'DOCUMENTS'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {(() => {
                        const filteredReceptions = dashboardVoteFilter === 'all' 
                          ? receptionsList 
                          : receptionsList.filter(r => (r.vote_code || '080702').startsWith(dashboardVoteFilter))
                        
                        if (filteredReceptions.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} className="px-4 py-8 text-center text-text-muted font-semibold italic">
                                {language === 'ms' 
                                  ? (dashboardVoteFilter !== 'all' ? `Tiada penghantaran di bawah Kod Vot ${dashboardVoteFilter}.` : 'Tiada penghantaran log.') 
                                  : (dashboardVoteFilter !== 'all' ? `No deliveries under Vote Code ${dashboardVoteFilter}.` : 'No oxygen deliveries logged yet.')}
                              </td>
                            </tr>
                          )
                        }

                        const itemsPerPage = entriesPerPage
                        const paginatedList = filteredReceptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        return paginatedList.map((rec) => {
                          const isPending = rec.status === 'pending' || 
                                            rec.status === 'pending_delivery' || 
                                            !rec.delivery_order_no || 
                                            String(rec.delivery_order_no).toUpperCase().startsWith('PENDING')

                          return (
                          <tr key={rec.id} className="hover:bg-subtle/50 transition-colors">
                            <td className="px-3.5 py-3 text-text-primary font-semibold whitespace-nowrap">
                              {new Date(rec.reception_date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-3.5 py-3 font-mono font-bold">
                              {(() => {
                                const isLoanOnly = Number(rec.refill_amount || 0) === 0 && Number(rec.loan_amount || 0) > 0
                                return (
                                  <div className="flex flex-col gap-0.5 min-w-[160px] max-w-[260px]">
                                    {isPending ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 w-max">
                                        <Clock className="w-2.5 h-2.5 text-amber-600" />
                                        {language === 'ms' ? 'Menunggu DO' : 'Pending DO'}
                                      </span>
                                    ) : (
                                      <span className={`truncate block font-mono font-bold ${isLoanOnly ? "text-amber-400" : "text-accent-base"}`} title={rec.delivery_order_no}>{rec.delivery_order_no}</span>
                                    )}
                                    {isLoanOnly && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[8.5px] font-bold tracking-wider uppercase w-max">
                                        {language === 'ms' ? 'Caj Pinjaman' : 'Loan Only'}
                                      </span>
                                    )}
                                  </div>
                                )
                              })()}
                            </td>
                            <td className="px-2.5 py-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleOpenVoteOverrideModal(rec)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold transition-colors hover:scale-105 active:scale-95 shadow-elevation-1 ${
                                  (rec.vote_code || '080702').startsWith('080600')
                                    ? 'bg-indigo-500/10 text-purple-700 border-indigo-500/20 hover:bg-purple-100 hover:border-purple-300'
                                    : 'bg-accent-base/10 text-teal-700 border-accent-base/20 hover:bg-teal-100 hover:border-teal-300'
                                }`}
                                title={language === 'ms' ? 'Kod Vot Terkunci (Read-Only). Klik untuk kebenaran pertukaran luar jangka' : 'Locked Vote Code (Read-Only). Click for override authorization'}
                              >
                                <Lock className="w-2.5 h-2.5 text-amber-600" />
                                <span>{rec.vote_code || '080702'}</span>
                              </button>
                            </td>
                            <td className="px-3 py-3 text-text-primary font-semibold whitespace-nowrap text-xs">{fmt(rec.refill_amount)}</td>
                            <td className="px-3 py-3 text-text-muted font-mono tabular-nums whitespace-nowrap text-xs">{fmt(rec.loan_amount)}</td>
                            <td className="px-3 py-3 text-text-primary font-mono tabular-nums font-bold whitespace-nowrap text-xs">{fmt(rec.total_amount)}</td>
                            <td className="px-2.5 py-3 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                                ${isPending 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
                                  : rec.status === 'completed' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'}`}
                              >
                                {isPending ? (language === 'ms' ? 'Menunggu DO' : 'Pending Delivery') : rec.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <button 
                                    onClick={() => handleOpenArrivalModal(rec)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[9px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 active:scale-95 shadow-xs"
                                    title={language === 'ms' ? 'Daftar No. DO dan Tarikh Ketibaan' : 'Key in DO Number and Arrival Date'}
                                  >
                                    <CheckCircle className="w-3 h-3 text-emerald-200" />
                                    {language === 'ms' ? 'Kemas Kini DO' : 'Key In DO'}
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleOpenPoPreview(rec)}
                                  className="px-2 py-1 hover:bg-subtle text-text-secondary hover:text-text-primary rounded-xl font-black text-[9px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 active:scale-95 border border-border-default"
                                  title="Generate KKM PO PDF"
                                >
                                  <FileText className="w-3 h-3 text-text-muted" />
                                  PO
                                </button>
                                {Number(rec.refill_amount || 0) === 0 && Number(rec.loan_amount || 0) > 0 ? (
                                  <span 
                                    className="px-2 py-1 bg-subtle/50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1 border border-border-default cursor-not-allowed opacity-60"
                                    title={language === 'ms' ? 'Tiada KEW.PS-3 bagi bayaran caj pinjaman tanpa penerimaan fizikal' : 'KEW.PS-3 not applicable for loan fees without physical delivery'}
                                  >
                                    N/A
                                  </span>
                                ) : isPending ? (
                                  <button 
                                    disabled
                                    className="px-2 py-1 bg-subtle/50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1 border border-border-default cursor-not-allowed opacity-50"
                                    title={language === 'ms' ? 'Laporan Penerimaan (KEW.PS-3) dikunci sehingga No. DO didaftarkan' : 'Report locked until DO is registered'}
                                  >
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    {language === 'ms' ? 'Laporan' : 'Report'}
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleDownloadReport(rec)}
                                    className="px-2 py-1 hover:bg-accent-base/10 text-text-secondary hover:text-teal-700 rounded-xl font-black text-[9px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 active:scale-95 border border-border-default"
                                    title="Generate Reception Report PDF"
                                  >
                                    <Download className="w-3 h-3 text-text-muted" />
                                    {language === 'ms' ? 'Laporan' : 'Report'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: High-End Native Cards (Zero Horizontal Scroll!) */}
                <div className="md:hidden space-y-3 p-3 bg-subtle/50">
                  {(() => {
                    const filteredReceptions = dashboardVoteFilter === 'all' 
                      ? receptionsList 
                      : receptionsList.filter(r => (r.vote_code || '080702').startsWith(dashboardVoteFilter))
                    
                    if (filteredReceptions.length === 0) {
                      return (
                        <div className="p-8 text-center text-text-muted text-xs font-semibold italic bg-surface rounded-2xl border border-border-default">
                          {language === 'ms' 
                            ? (dashboardVoteFilter !== 'all' ? `Tiada penghantaran di bawah Kod Vot ${dashboardVoteFilter}.` : 'Tiada penghantaran log.') 
                            : (dashboardVoteFilter !== 'all' ? `No deliveries under Vote Code ${dashboardVoteFilter}.` : 'No oxygen deliveries logged yet.')}
                        </div>
                      )
                    }

                    const itemsPerPage = entriesPerPage
                    const paginatedList = filteredReceptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    return paginatedList.map((rec) => {
                      const isPending = rec.status === 'pending' || 
                                        rec.status === 'pending_delivery' || 
                                        !rec.delivery_order_no || 
                                        String(rec.delivery_order_no).toUpperCase().startsWith('PENDING')

                      return (
                        <div key={rec.id} className="bg-surface border border-border-default rounded-2xl p-4 space-y-3 shadow-xs">
                          {/* Header: Date + Status Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-text-primary font-extrabold text-sm">
                              {new Date(rec.reception_date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                              ${isPending 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
                                : rec.status === 'completed' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'}`}
                            >
                              {isPending ? (language === 'ms' ? 'Menunggu DO' : 'Pending Delivery') : rec.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* DO and Vote Code */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
                            <div>
                              <span className="text-[9px] text-text-secondary font-bold font-bold uppercase tracking-wider block">
                                {language === 'ms' ? 'Pesanan Penghantaran / Invois' : 'Delivery Order / Invoice'}
                              </span>
                              {isPending ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 mt-0.5">
                                  <Clock className="w-2.5 h-2.5 text-amber-600" />
                                  {language === 'ms' ? 'Menunggu DO' : 'Pending DO'}
                                </span>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  <span className={`font-mono font-bold text-xs break-all ${Number(rec.refill_amount || 0) === 0 && Number(rec.loan_amount || 0) > 0 ? 'text-purple-700' : 'text-teal-600'}`}>
                                    {rec.delivery_order_no}
                                  </span>
                                  {Number(rec.refill_amount || 0) === 0 && Number(rec.loan_amount || 0) > 0 && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 text-purple-700 border border-indigo-500/20 text-[9px] font-black tracking-wider uppercase w-max">
                                      {language === 'ms' ? 'Caj Pinjaman Sahaja' : 'Loan Only'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenVoteOverrideModal(rec)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition-colors active:scale-95 ${
                                (rec.vote_code || '080702').startsWith('080600')
                                  ? 'bg-indigo-500/10 text-purple-700 border-indigo-500/20'
                                  : 'bg-accent-base/10 text-teal-700 border-accent-base/20'
                              }`}
                              title={language === 'ms' ? 'Kod Vot. Klik untuk tukar' : 'Vote Code. Click to override'}
                            >
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>{rec.vote_code || '080702'}</span>
                            </button>
                          </div>

                          {/* Financial 3-Col Chip Grid */}
                          <div className="grid grid-cols-3 gap-2 bg-subtle/50 p-2.5 rounded-xl border border-border-subtle text-center">
                            <div>
                              <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                                {language === 'ms' ? 'Isian Semula' : 'Refill'}
                              </span>
                              <span className="font-semibold text-xs text-text-primary">
                                {fmt(rec.refill_amount)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                                {language === 'ms' ? 'Pinjaman' : 'Loan'}
                              </span>
                              <span className="font-semibold text-xs text-purple-700">
                                {fmt(rec.loan_amount)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                                {language === 'ms' ? 'Jumlah Kos' : 'Total'}
                              </span>
                              <span className="font-black text-xs text-slate-950">
                                {fmt(rec.total_amount)}
                              </span>
                            </div>
                          </div>

                          {/* Actions Button Bar */}
                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-subtle">
                            {isPending && (
                              <button 
                                onClick={() => handleOpenArrivalModal(rec)}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                              >
                                <CheckCircle className="w-3 h-3 text-emerald-200" />
                                {language === 'ms' ? 'Kemas Kini DO' : 'Key In DO'}
                              </button>
                            )}
                            <button 
                              onClick={() => handleOpenPoPreview(rec)}
                              className="px-3 py-2 hover:bg-subtle text-text-secondary rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 active:scale-95 border border-border-default"
                            >
                              <FileText className="w-3.5 h-3.5 text-text-muted" />
                              PO
                            </button>
                            {Number(rec.refill_amount || 0) === 0 && Number(rec.loan_amount || 0) > 0 ? (
                              <span 
                                className="px-3 py-2 bg-subtle/50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 border border-border-default opacity-60 cursor-not-allowed"
                                title={language === 'ms' ? 'Tiada KEW.PS-3 bagi bayaran caj pinjaman tanpa penerimaan fizikal' : 'KEW.PS-3 not applicable for loan fees without physical delivery'}
                              >
                                N/A
                              </span>
                            ) : isPending ? (
                              <button 
                                disabled
                                className="px-3 py-2 bg-subtle/50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 border border-border-default opacity-50 cursor-not-allowed"
                              >
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                {language === 'ms' ? 'Laporan' : 'Report'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleDownloadReport(rec)}
                                className="px-3 py-2 bg-accent-base/10 hover:bg-teal-100 text-teal-800 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 active:scale-95 border border-accent-base/20"
                              >
                                <Download className="w-3.5 h-3.5 text-teal-600" />
                                {language === 'ms' ? 'Laporan' : 'Report'}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </>
            ) : (
              /* MONTHLY CONSOLIDATED VIEW */
              <>
                {/* Desktop View: Full Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-text-secondary">
                    <thead className="bg-subtle text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border-default">
                      <tr>
                        <th className="px-3.5 py-3.5 whitespace-nowrap">{language === 'ms' ? 'BULAN & REKOD' : 'MONTH & ENTRIES'}</th>
                        <th className="px-3.5 py-3.5 whitespace-nowrap">{language === 'ms' ? 'PESANAN GABUNGAN' : 'CONSOLIDATED DOs'}</th>
                        <th className="px-2.5 py-3.5 text-center whitespace-nowrap">{language === 'ms' ? 'KOD VOT' : 'VOTE CODE'}</th>
                        <th className="px-3 py-3.5 whitespace-nowrap">{language === 'ms' ? 'JUMLAH ISIAN' : 'TOTAL REFILL'}</th>
                        <th className="px-3 py-3.5 whitespace-nowrap">{language === 'ms' ? 'JUMLAH PINJAMAN' : 'TOTAL LOAN'}</th>
                        <th className="px-3 py-3.5 whitespace-nowrap">{language === 'ms' ? 'JUMLAH KOS' : 'TOTAL COST'}</th>
                        <th className="px-2.5 py-3.5 text-center whitespace-nowrap">{language === 'ms' ? 'STATUS' : 'STATUS'}</th>
                        <th className="px-3.5 py-3.5 text-right whitespace-nowrap">{language === 'ms' ? 'DOKUMEN GABUNGAN' : 'CONSOLIDATED DOCS'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {(() => {
                        const monthlyList = getMonthlyConsolidatedReceptions(receptionsList)
                        if (monthlyList.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} className="px-4 py-8 text-center text-text-muted font-semibold italic">
                                {language === 'ms' ? 'Tiada rekod bulanan dijumpai.' : 'No monthly records found.'}
                              </td>
                            </tr>
                          )
                        }
                        const itemsPerPage = entriesPerPage
                        const paginatedMonthly = monthlyList.slice((monthlyCurrentPage - 1) * itemsPerPage, monthlyCurrentPage * itemsPerPage)
                        return paginatedMonthly.map((mRec) => (
                          <tr key={mRec.id} className="hover:bg-subtle/50 transition-colors">
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="text-text-primary font-extrabold text-sm capitalize">
                                  {mRec.monthLabel}
                                </span>
                                <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-accent-base/10 text-accent-base border border-accent-base/20">
                                  <Layers className="w-2.5 h-2.5" />
                                  {mRec.entryCount} {mRec.entryCount === 1 ? (language === 'ms' ? 'Entri' : 'Delivery') : (language === 'ms' ? 'Entri Digabung' : 'Combined Deliveries')}
                                </span>
                                {/* Supply-type badge: VIE Tank vs Loan Only vs Cylinder */}
                                {mRec.is_vie_tank ? (
                                  <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    💧 {language === 'ms' ? 'Tangki VIE (Cecair)' : 'VIE Bulk Liquid'}
                                  </span>
                                ) : (Number(mRec.refill_amount || 0) === 0 && Number(mRec.loan_amount || 0) > 0) ? (
                                  <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    🟣 {language === 'ms' ? 'Caj Pinjaman Sahaja' : 'Loan Charges Only'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-subtle/50 text-text-muted border border-border-default">
                                    🔵 {language === 'ms' ? 'Silinder' : 'Cylinder'}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-3.5 py-3">
                              <div className="flex flex-col gap-0.5 max-w-[170px] xl:max-w-[220px]">
                                <span className={`font-mono font-bold text-xs truncate ${Number(mRec.refill_amount || 0) === 0 && Number(mRec.loan_amount || 0) > 0 ? 'text-purple-700' : 'text-teal-700'}`} title={mRec.delivery_order_no}>
                                  {mRec.delivery_order_no}
                                </span>
                                <span className="text-[10px] text-text-muted font-semibold truncate" title={language === 'ms' ? `Menggabungkan ${mRec.entryCount} nota serahan / tuntutan` : `Aggregates ${mRec.entryCount} delivery orders / claims`}>
                                  {language === 'ms' ? `Menggabungkan ${mRec.entryCount} nota serahan / tuntutan` : `Aggregates ${mRec.entryCount} delivery orders / claims`}
                                </span>
                              </div>
                            </td>
                            <td className="px-2.5 py-3 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border ${
                                (mRec.vote_code || '080702').startsWith('080600')
                                  ? 'bg-indigo-500/10 text-purple-700 border-indigo-500/20'
                                  : 'bg-accent-base/10 text-teal-700 border-accent-base/20'
                              }`}>
                                Vot {mRec.vote_code || '080702'}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-text-primary font-semibold whitespace-nowrap text-xs">{fmt(mRec.refill_amount)}</td>
                            <td className="px-3 py-3 text-purple-700 font-semibold whitespace-nowrap text-xs">{fmt(mRec.loan_amount)}</td>
                            <td className="px-3 py-3 text-text-primary font-mono tabular-nums font-bold text-xs whitespace-nowrap">{fmt(mRec.total_amount)}</td>
                            <td className="px-2.5 py-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                {language === 'ms' ? 'DIKONSOLIDASI' : 'CONSOLIDATED'}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleOpenPoPreview(mRec as any)}
                                  className="px-2 py-1 bg-surface hover:bg-teal-600 hover:text-white text-teal-800 rounded-xl font-black text-[9px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 active:scale-95 border border-teal-300 shadow-sm"
                                  title={language === 'ms' ? 'Jana PO Gabungan Bulanan' : 'Generate Consolidated Monthly PO PDF'}
                                >
                                  <FileText className="w-3 h-3" />
                                  {language === 'ms' ? 'PO Bulan' : 'Monthly PO'}
                                </button>
                                {(Number(mRec.refill_amount || 0) === 0 && Number(mRec.loan_amount || 0) > 0) ? (
                                  <span 
                                    className="px-2 py-1 bg-subtle/50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1 border border-border-default cursor-not-allowed opacity-60"
                                    title={language === 'ms' ? 'Tiada KEW.PS-3 bagi bayaran caj pinjaman tanpa penerimaan fizikal' : 'KEW.PS-3 not applicable for loan fees without physical delivery'}
                                  >
                                    N/A
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handleDownloadReport(mRec as any)}
                                    className="px-2 py-1 bg-accent-base/10 hover:bg-teal-700 hover:text-white text-teal-800 rounded-xl font-black text-[9px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 active:scale-95 border border-accent-base/20 shadow-sm"
                                    title={language === 'ms' ? 'Jana Laporan Pemeriksaan Bulanan (KEW.PS-3)' : 'Generate Consolidated Monthly Inspection Report'}
                                  >
                                    <Download className="w-3 h-3" />
                                    {language === 'ms' ? 'Laporan' : 'Report'}
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    setSelectedConsolidateMonthKey(mRec.monthKey)
                                    setIsMonthlyModalOpen(true)
                                  }}
                                  className="p-1 hover:bg-subtle text-text-muted hover:text-text-primary rounded-xl transition-colors border border-border-default"
                                  title={language === 'ms' ? 'Lihat Perincian Entri' : 'View Delivery Breakdown'}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: High-End Native Cards (Zero Horizontal Scroll!) */}
                <div className="md:hidden space-y-3 p-3 bg-accent-base/10">
                  {(() => {
                    const monthlyList = getMonthlyConsolidatedReceptions(receptionsList)
                    if (monthlyList.length === 0) {
                      return (
                        <div className="p-8 text-center text-text-muted text-xs font-semibold italic bg-surface rounded-2xl border border-border-default">
                          {language === 'ms' ? 'Tiada rekod bulanan dijumpai.' : 'No monthly records found.'}
                        </div>
                      )
                    }
                    const itemsPerPage = entriesPerPage
                    const paginatedMonthly = monthlyList.slice((monthlyCurrentPage - 1) * itemsPerPage, monthlyCurrentPage * itemsPerPage)
                    return paginatedMonthly.map((mRec) => (
                      <div key={mRec.id} className="bg-surface border border-accent-base/20 rounded-2xl p-4 space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-text-primary font-extrabold text-sm capitalize">
                              {mRec.monthLabel}
                            </span>
                            {/* Supply-type badge: VIE Tank vs Loan Only vs Cylinder */}
                            {(Number(mRec.refill_amount || 0) === 0 && Number(mRec.loan_amount || 0) > 0) ? (
                              <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                🟣 {language === 'ms' ? 'Caj Pinjaman Sahaja' : 'Loan Charges Only'}
                              </span>
                            ) : mRec.is_vie_tank ? (
                              <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                💧 {language === 'ms' ? 'Tangki VIE (Cecair)' : 'VIE Bulk Liquid'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-subtle/50 text-text-muted border border-border-default">
                                🔵 {language === 'ms' ? 'Silinder' : 'Cylinder'}
                              </span>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-accent-base/10 text-teal-700 border border-accent-base/20">
                            <Layers className="w-2.5 h-2.5" />
                            {mRec.entryCount} {mRec.entryCount === 1 ? (language === 'ms' ? 'Entri' : 'Delivery') : (language === 'ms' ? 'Entri Digabung' : 'Combined')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] text-text-secondary font-bold font-bold uppercase tracking-wider block">
                              {language === 'ms' ? 'DO Gabungan' : 'Consolidated DO'}
                            </span>
                            <span className="font-mono font-bold text-teal-700 text-xs truncate block" title={mRec.delivery_order_no}>
                              {mRec.delivery_order_no}
                            </span>
                          </div>

                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border flex-shrink-0 ${
                            (mRec.vote_code || '080702').startsWith('080600')
                              ? 'bg-indigo-500/10 text-purple-700 border-indigo-500/20'
                              : 'bg-accent-base/10 text-teal-700 border-accent-base/20'
                          }`}>
                            Vot {mRec.vote_code || '080702'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-subtle/50 p-2.5 rounded-xl border border-border-subtle text-center">
                          <div>
                            <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                              {language === 'ms' ? 'Isian' : 'Refill'}
                            </span>
                            <span className="font-semibold text-xs text-text-primary">
                              {fmt(mRec.refill_amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                              {language === 'ms' ? 'Pinjaman' : 'Loan'}
                            </span>
                            <span className="font-semibold text-xs text-purple-700">
                              {fmt(mRec.loan_amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                              {language === 'ms' ? 'Jumlah Kos' : 'Total'}
                            </span>
                            <span className="font-black text-xs text-slate-950">
                              {fmt(mRec.total_amount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-subtle">
                          <button 
                            onClick={() => handleOpenPoPreview(mRec as any)}
                            className="px-3 py-2 bg-surface hover:bg-teal-600 hover:text-white text-teal-800 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 active:scale-95 border border-teal-300 shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {language === 'ms' ? 'PO Bulan' : 'Monthly PO'}
                          </button>
                          {(Number(mRec.refill_amount || 0) === 0 && Number(mRec.loan_amount || 0) > 0) ? (
                            <span 
                              className="px-3 py-2 bg-subtle/50 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 border border-border-default cursor-not-allowed opacity-60"
                              title={language === 'ms' ? 'Tiada KEW.PS-3 bagi bayaran caj pinjaman tanpa penerimaan fizikal' : 'KEW.PS-3 not applicable for loan fees without physical delivery'}
                            >
                              N/A
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleDownloadReport(mRec as any)}
                              className="px-3 py-2 bg-accent-base/10 hover:bg-teal-700 hover:text-white text-teal-800 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 active:scale-95 border border-accent-base/20"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {language === 'ms' ? 'Laporan' : 'Report'}
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedConsolidateMonthKey(mRec.monthKey)
                              setIsMonthlyModalOpen(true)
                            }}
                            className="p-2 hover:bg-subtle text-text-muted rounded-xl transition-colors border border-border-default"
                            title={language === 'ms' ? 'Lihat Perincian' : 'View Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </>
            )}

            {/* Pagination Controls */}
            {ledgerViewMode === 'detailed' ? (
              (() => {
                const filteredReceptions = dashboardVoteFilter === 'all' 
                  ? receptionsList 
                  : receptionsList.filter(r => (r.vote_code || '080702').startsWith(dashboardVoteFilter))
                const totalPages = Math.ceil(filteredReceptions.length / entriesPerPage) || 1
                return filteredReceptions.length > 0 && (
                  <div className="px-5 py-3.5 border-t border-border-subtle bg-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    {/* Left: Entries Info & Show [10, 20, 50] Selector */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
                      <span className="text-text-muted font-bold">
                        {language === 'ms' ? 'Menunjukkan' : 'Showing'}{' '}
                        <span className="text-text-primary font-black">{((currentPage - 1) * entriesPerPage) + 1}</span>{' '}
                        {language === 'ms' ? 'hingga' : 'to'}{' '}
                        <span className="text-text-primary font-black">{Math.min(currentPage * entriesPerPage, filteredReceptions.length)}</span>{' '}
                        {language === 'ms' ? 'daripada' : 'of'}{' '}
                        <span className="text-text-primary font-black">{filteredReceptions.length}</span>{' '}
                        {language === 'ms' ? 'entri' : 'entries'}
                      </span>

                      <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-border-default">
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                          {language === 'ms' ? 'Papar:' : 'Show:'}
                        </span>
                        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-border-default">
                          {[10, 20, 50].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setEntriesPerPage(size)
                                setCurrentPage(1)
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-colors ${
                                entriesPerPage === size
                                  ? 'bg-surface text-teal-800 shadow-xs'
                                  : 'text-text-muted hover:text-text-primary'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-text-muted">
                          {language === 'ms' ? '/ hlm' : '/ page'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Page Indicator & Prev/Next Buttons */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-text-muted mr-1">
                        {language === 'ms' ? 'Hlm' : 'Page'} <span className="text-text-primary font-black">{currentPage}</span> / <span className="text-text-primary font-black">{totalPages}</span>
                      </span>
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 border border-border-default bg-surface hover:bg-subtle/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary rounded-xl font-bold tracking-wider uppercase text-[10px] transition-colors"
                      >
                        {language === 'ms' ? 'SEBELUM' : 'PREV'}
                      </button>
                      <button 
                        disabled={currentPage * entriesPerPage >= filteredReceptions.length}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-3 py-1.5 border border-border-default bg-surface hover:bg-subtle/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary rounded-xl font-bold tracking-wider uppercase text-[10px] transition-colors"
                      >
                        {language === 'ms' ? 'SETERUS' : 'NEXT'}
                      </button>
                    </div>
                  </div>
                )
              })()
            ) : (
              (() => {
                const monthlyList = getMonthlyConsolidatedReceptions(receptionsList)
                const totalPages = Math.ceil(monthlyList.length / entriesPerPage) || 1
                return monthlyList.length > 0 && (
                  <div className="px-5 py-3.5 border-t border-border-subtle bg-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    {/* Left: Entries Info & Show [10, 20, 50] Selector */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
                      <span className="text-text-muted font-bold">
                        {language === 'ms' ? 'Menunjukkan' : 'Showing'}{' '}
                        <span className="text-text-primary font-black">{((monthlyCurrentPage - 1) * entriesPerPage) + 1}</span>{' '}
                        {language === 'ms' ? 'hingga' : 'to'}{' '}
                        <span className="text-text-primary font-black">{Math.min(monthlyCurrentPage * entriesPerPage, monthlyList.length)}</span>{' '}
                        {language === 'ms' ? 'daripada' : 'of'}{' '}
                        <span className="text-text-primary font-black">{monthlyList.length}</span>{' '}
                        {language === 'ms' ? 'bulan' : 'months'}
                      </span>

                      <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-border-default">
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                          {language === 'ms' ? 'Papar:' : 'Show:'}
                        </span>
                        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-border-default">
                          {[10, 20, 50].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setEntriesPerPage(size)
                                setMonthlyCurrentPage(1)
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-colors ${
                                entriesPerPage === size
                                  ? 'bg-surface text-teal-800 shadow-xs'
                                  : 'text-text-muted hover:text-text-primary'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-text-muted">
                          {language === 'ms' ? '/ hlm' : '/ page'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Page Indicator & Prev/Next Buttons */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-text-muted mr-1">
                        {language === 'ms' ? 'Hlm' : 'Page'} <span className="text-text-primary font-black">{monthlyCurrentPage}</span> / <span className="text-text-primary font-black">{totalPages}</span>
                      </span>
                      <button 
                        disabled={monthlyCurrentPage === 1}
                        onClick={() => setMonthlyCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 border border-border-default bg-surface hover:bg-subtle/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary rounded-xl font-bold tracking-wider uppercase text-[10px] transition-colors"
                      >
                        {language === 'ms' ? 'SEBELUM' : 'PREV'}
                      </button>
                      <button 
                        disabled={monthlyCurrentPage * entriesPerPage >= monthlyList.length}
                        onClick={() => setMonthlyCurrentPage(prev => prev + 1)}
                        className="px-3 py-1.5 border border-border-default bg-surface hover:bg-subtle/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary rounded-xl font-bold tracking-wider uppercase text-[10px] transition-colors"
                      >
                        {language === 'ms' ? 'SETERUS' : 'NEXT'}
                      </button>
                    </div>
                  </div>
                )
              })()
            )}
          </div>

          {/* RIGHT SIDE: SIDEBAR WIDGETS (Collapsible Drawer with Modern Depth standard) */}
          {isRightSidebarOpen && (
          <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 space-y-5 transition-[transform,opacity] duration-200">
            
            {/* Widget A: Active Pricing Matrix config list */}
            <div className="bg-surface border border-border-default rounded-xl p-4 sm:p-5 shadow-elevation-1">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3.5 gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider truncate">{language === 'ms' ? 'Harga Silinder' : 'Active Cylinder Prices'}</h4>
                  <p className="text-[10px] text-text-muted font-medium truncate">{language === 'ms' ? 'Kos isian standard' : 'Standard refill costs'}</p>
                </div>
                <button 
                  onClick={() => setIsPricingModalOpen(true)}
                  className="px-2.5 py-1 bg-accent-base/10 hover:bg-accent-base/20 text-accent-base rounded-lg text-[10px] font-bold tracking-wider transition-colors flex items-center gap-1 active:scale-95 border border-accent-base/20 shrink-0 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {language === 'ms' ? 'LARAS' : 'ADJUST'}
                </button>
              </div>

              {/* Supplier Filter dropdown for sidebar widget */}
              <div className="mb-3">
                <select
                  value={selectedPricingSupplier}
                  onChange={(e) => setSelectedPricingSupplier(e.target.value)}
                  className="w-full text-[11px] font-semibold bg-subtle/50 border border-border-default rounded-lg px-2 py-1.5 text-text-secondary outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  <option value="All Suppliers">{language === 'ms' ? 'Semua Pembekal' : 'All Suppliers'}</option>
                  {realSupplierOptions.map((sup) => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {pricingConfigs
                  .filter((config) => isSupplierMatch(config.supplier_name, selectedPricingSupplier))
                  .sort((a, b) => {
                    const order = ['101-F', '101-N', 'P101-D', 'P101-E', 'P101-F', 'P101-HS', 'Liquid Medical Oxygen (VIE Tank)']
                    const idxA = order.indexOf(a.cylinder_size_code)
                    const idxB = order.indexOf(b.cylinder_size_code)
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB
                    if (idxA !== -1) return -1
                    if (idxB !== -1) return 1
                    return a.cylinder_size_code.localeCompare(b.cylinder_size_code)
                  })
                  .map((config) => {
                    const isPerM3 = config.cylinder_size_code.toLowerCase().includes('vie') || 
                                    config.cylinder_size_code.toLowerCase().includes('liquid') || 
                                    config.cylinder_size_code.toLowerCase().includes('m3') ||
                                    config.cylinder_size_code.toLowerCase().includes('m³')
                    return (
                      <div key={config.id} className="flex items-center justify-between py-2 border-b border-border-subtle hover:bg-subtle/50 px-2 rounded-lg transition-colors gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-text-primary tracking-tight block">{config.cylinder_size_code}</span>
                            {isPerM3 && (
                              <span className="px-1.5 py-0.5 bg-accent-base/10 border border-accent-base/20 text-teal-700 text-[8px] font-black rounded uppercase">
                                VIE Tank
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-text-muted font-bold truncate block" title={config.supplier_name || lindeDisplayName}>{config.supplier_name || lindeDisplayName}</span>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-text-primary shrink-0 whitespace-nowrap">
                          RM {config.refill_price.toFixed(2)}{isPerM3 ? ' / m³' : ''}
                        </span>
                      </div>
                    )
                  })}
                
                {/* Supplier Loan Rates for 101-N and 101-F */}
                {(() => {
                  const matchingConfigs = pricingConfigs.filter((config) => isSupplierMatch(config.supplier_name, selectedPricingSupplier))
                  const loanConfigs = matchingConfigs.filter((config) => (config.cylinder_size_code === '101-N' || config.cylinder_size_code === '101-F') && config.loan_rate != null)

                  if (loanConfigs.length > 0) {
                    return loanConfigs.map((config) => (
                      <div key={`loan-${config.id}`} className="flex items-center justify-between py-2 border-t border-border-subtle hover:bg-subtle/50 px-2 rounded-lg transition-colors mt-1 bg-subtle/40 gap-2">
                        <span className="text-[11px] font-bold text-text-secondary tracking-tight uppercase truncate">{config.cylinder_size_code} {language === 'ms' ? 'Kadar Pinjam' : 'Loan Rate'}</span>
                        <span className="font-mono text-xs font-bold text-text-primary shrink-0 whitespace-nowrap">
                          RM {Number(config.loan_rate).toFixed(2)}
                        </span>
                      </div>
                    ))
                  }

                  return (
                    <div className="flex items-center justify-between py-2 border-t border-border-subtle hover:bg-subtle/50 px-2 rounded-lg transition-colors mt-1 bg-subtle/50 gap-2">
                      <span className="text-[11px] font-black text-purple-700 tracking-tight uppercase truncate">{language === 'ms' ? 'Kadar Pinjam Silinder' : 'Cylinder Loan Rate'}</span>
                      <span className="font-mono text-xs font-black text-purple-700 shrink-0 whitespace-nowrap">
                        RM {(systemSettings?.loan_cylinder_rate || 18.36).toFixed(2)}
                      </span>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Widget B: Government Budget Deficit visual block */}
            {(() => {
              const allocation = financials?.total_allocation || 274000.00
              const expenses = financials?.total_expenses || 261037.70
              const liabilities = financials?.liabilities || 0
              const totalSpending = expenses + liabilities
              const percentage = allocation > 0 ? (totalSpending / allocation) * 100 : 0
              const isOverBudget = totalSpending > allocation

              return (
                <div className="bg-surface border border-border-default rounded-xl p-4 sm:p-5 shadow-elevation-1 relative overflow-hidden transition-colors duration-150"
                >
                  <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-2.5 ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}
                  >
                    {isOverBudget ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span>{language === 'ms' ? 'Defisit Waran Kerajaan' : 'Government Warrant Deficit'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'ms' ? 'Waran Kerajaan Sihat' : 'Government Warrant Healthy'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-text-secondary">
                    {isOverBudget ? (
                      <>
                        {language === 'ms' 
                          ? `Perbelanjaan oksigen (${fmt(totalSpending)}) telah melebihi Peruntukan Waran (${fmt(allocation)}) sebanyak ${percentage.toFixed(1)}% di bawah Kod Undi 080702 / Aktiviti 27402.` 
                          : `Oxygen spending (<strong>${fmt(totalSpending)}</strong>) has exceeded the Warrant Allocation (<strong>${fmt(allocation)}</strong>) by <strong>${percentage.toFixed(1)}%</strong> under Vote Code 080702 / Activity 27402.`}
                      </>
                    ) : (
                      <>
                        {language === 'ms' 
                          ? `Perbelanjaan oksigen (${fmt(totalSpending)}) adalah dalam had Peruntukan Waran (${fmt(allocation)}) pada ${percentage.toFixed(1)}% penggunaan di bawah Kod Undi 080702 / Aktiviti 27402.` 
                          : `Oxygen spending (<strong>${fmt(totalSpending)}</strong>) is well within the Warrant Allocation (<strong>${fmt(allocation)}</strong>) at <strong>${percentage.toFixed(1)}%</strong> utilization under Vote Code 080702 / Activity 27402.`}
                      </>
                    )}
                  </p>
                  
                  {/* Progress Indicator */}
                  <div className="mt-3.5">
                    <div className={`flex justify-between text-[10px] font-bold mb-1 ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
                      <span>{isOverBudget ? (language === 'ms' ? 'HAD WARAN MELEBIHI' : 'WARRANT CAP EXCEEDED') : (language === 'ms' ? 'PENGGUNAAN BAJET SELAMAT' : 'SAFE BUDGET UTILIZATION')}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full rounded-full h-1.5 overflow-hidden bg-subtle border border-border-default/50">
                      <div 
                        className={`h-full rounded-full transition-colors duration-500 ${isOverBudget ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Sidebar content end */}
            
          </div>
          )}
        </div>

        {/* Real Cylinder Live List Table (Audited mini list) */}
        <div className="bg-surface border border-border-default rounded-xl shadow-elevation-1 overflow-hidden mt-6">
          <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-subtle/50">
            <div>
              <h2 className="text-sm font-bold text-text-primary">{language === 'ms' ? 'Daftar Silinder' : 'Cylinder Registry (Top 10 Live Inventory)'}</h2>
              <p className="text-[11px] text-text-muted font-semibold mt-0.5">{language === 'ms' ? 'Katalog terperinci semua silinder oksigen perubatan aktif daripada Supabase.' : 'Detailed catalog of all active medical oxygen cylinders from Supabase.'}</p>
            </div>
            <span className="px-3 py-1 bg-subtle text-text-secondary border border-border-default rounded-full text-[9px] font-black tracking-wider uppercase">Live Database</span>
          </div>
          <Table
            data={cylinders.slice(0, 10)}
            columns={cylinderColumns}
            emptyMessage={language === 'ms' ? 'Tiada silinder ditemui dalam inventori.' : 'No cylinders found in the inventory.'}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-border-default">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
              <Wind className="w-6 h-6 text-accent-base shrink-0" />
              <span className="truncate">{language === 'ms' ? 'Pengagihan Oksigen Perubatan' : 'Medical Oxygen Distribution'}</span>
            </h1>

            {/* Mobile inline refresh button */}
            {currentPath === '/pharmacy/oxygen/cylinders' && (
              <button
                type="button"
                onClick={handleRefreshInventoryData}
                className="sm:hidden px-2.5 py-1.5 text-xs font-semibold bg-surface border border-border-default text-text-primary rounded-lg hover:bg-subtle transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                title={language === 'ms' ? 'Segar Semula' : 'Refresh'}
              >
                <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[11px] font-bold">{language === 'ms' ? 'Segar' : 'Refresh'}</span>
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-text-muted font-medium mt-1 leading-normal">
            {language === 'ms' 
              ? 'Gambaran kapasiti silinder oksigen, penggunaan wad, dan logistik pembekal masa nyata.' 
              : 'Overview of live oxygen cylinder fleet capacity, ward utilization, and status.'}
          </p>
        </div>

        {currentPath === '/pharmacy/oxygen/consumption' && isOtherUnit && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setUnitModalInitialMode('internal')
                setUnitModalLockMode(true)
                setIsUnitModalOpen(true)
              }}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold bg-[#00a68a] hover:bg-accent-base text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 focus:outline-none cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {language === 'ms' ? 'Mohon Silinder (Intra-Facility)' : 'Request Cylinders (Intra-Facility)'}
            </button>
          </div>
        )}

        {currentPath === '/pharmacy/oxygen/consumption' && !isOtherUnit && (
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. INTRA-FACILITY DROPDOWN (Request & Manual Dispatch) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsIntraFacilityDropdownOpen(!isIntraFacilityDropdownOpen)
                  setIsInterFacilityDropdownOpen(false)
                }}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 focus:outline-none cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>{language === 'ms' ? 'Intra-Facility' : 'Intra-Facility'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isIntraFacilityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isIntraFacilityDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsIntraFacilityDropdownOpen(false)}
                  />
                  <div 
                    className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 bg-surface rounded-2xl shadow-2xl border border-border-default py-1.5 z-40 animate-fade-in divide-y divide-border-subtle"
                    onClick={() => setIsIntraFacilityDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 bg-subtle/50">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        {language === 'ms' ? 'Operasi Intra-Facility (Dalaman)' : 'Intra-Facility Operations'}
                      </div>
                      <div className="text-[11px] text-text-muted font-medium mt-0.5">
                        {language === 'ms' ? 'Pergerakan silinder dalam fasiliti / wad' : 'Internal hospital & ward movements'}
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUnitModalInitialMode('internal')
                          setUnitModalLockMode(false)
                          setIsUnitModalOpen(true)
                        }}
                        className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-text-primary hover:bg-emerald-500/10 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-extrabold text-text-primary flex items-center gap-1.5">
                            {language === 'ms' ? 'Mohon Silinder' : 'Request Cylinders'}
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Request</span>
                          </div>
                          <div className="text-[10px] text-text-muted font-medium mt-0.5">
                            {language === 'ms' ? 'Borang pesanan silinder wad / unit' : 'Internal ward & unit order form'}
                          </div>
                        </div>
                      </button>

                      {isCylinderOfficer && (
                        <button
                          type="button"
                          onClick={() => setIsManualModalOpen(true)}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-text-primary hover:bg-accent-base/10 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
                        >
                          <div className="p-2 bg-teal-100 text-teal-700 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-extrabold text-text-primary flex items-center gap-1.5">
                              Manual Dispatch
                              <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Dispatch</span>
                            </div>
                            <div className="text-[10px] text-text-muted font-medium mt-0.5">
                              {language === 'ms' ? 'Keluarkan silinder secara terus ke wad' : 'Direct manual issue of cylinders to unit'}
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 2. INTER-FACILITY DROPDOWN (Request, Receive & Return) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsInterFacilityDropdownOpen(!isInterFacilityDropdownOpen)
                  setIsIntraFacilityDropdownOpen(false)
                }}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 focus:outline-none cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{language === 'ms' ? 'Inter-Facility' : 'Inter-Facility'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isInterFacilityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isInterFacilityDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsInterFacilityDropdownOpen(false)}
                  />
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-surface rounded-2xl shadow-2xl border border-border-default py-1.5 z-40 animate-fade-in divide-y divide-border-subtle"
                    onClick={() => setIsInterFacilityDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 bg-subtle/50">
                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                        {language === 'ms' ? 'Operasi Inter-Facility (Fasiliti Luar)' : 'Inter-Facility Operations'}
                      </div>
                      <div className="text-[11px] text-text-muted font-medium mt-0.5">
                        {language === 'ms' ? 'Pindahan silinder antara KK / hospital luar' : 'Transfers with external clinics & hospitals'}
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {/* 1. Request */}
                      <button
                        type="button"
                        onClick={() => {
                          setUnitModalInitialMode('external')
                          setUnitModalLockMode(false)
                          setIsUnitModalOpen(true)
                        }}
                        className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-text-primary hover:bg-blue-500/10 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-extrabold text-text-primary flex items-center gap-1.5">
                            {language === 'ms' ? 'Mohon Silinder' : 'Request Cylinders'}
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Request</span>
                          </div>
                          <div className="text-[10px] text-text-muted font-medium mt-0.5">
                            {language === 'ms' ? 'Pesanan silinder ke fasiliti luar' : 'Create indent to external facility'}
                          </div>
                        </div>
                      </button>

                      {/* 2. Receive */}
                      <button
                        type="button"
                        onClick={() => setIsReceiveInterFacilityModalOpen(true)}
                        className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-text-primary hover:bg-indigo-500/10 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <ArrowDownToLine className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-extrabold text-text-primary flex items-center gap-1.5">
                            {language === 'ms' ? 'Terima Silinder' : 'Receive Cylinders'}
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Receive</span>
                          </div>
                          <div className="text-[10px] text-text-muted font-medium mt-0.5">
                            {language === 'ms' ? 'Rekod penerimaan silinder masuk' : 'Record incoming transfer receipt'}
                          </div>
                        </div>
                      </button>

                      {/* 3. Return */}
                      <button
                        type="button"
                        onClick={() => setIsReturnInterFacilityModalOpen(true)}
                        className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-text-primary hover:bg-indigo-500/10 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <ArrowUpFromLine className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-extrabold text-text-primary flex items-center gap-1.5">
                            {language === 'ms' ? 'Pulang Silinder' : 'Return Cylinders'}
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Return</span>
                          </div>
                          <div className="text-[10px] text-text-muted font-medium mt-0.5">
                            {language === 'ms' ? 'Pulang silinder kosong / pinjaman' : 'Return empty or loaned cylinders'}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {currentPath === '/pharmacy/oxygen/cylinders' && (
          <button
            onClick={handleRefreshInventoryData}
            className="hidden sm:flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold bg-surface border border-border-default text-text-primary rounded-lg hover:bg-subtle transition-colors shadow-sm focus:outline-none shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-text-muted" />
            <span>{language === 'ms' ? 'Segar Semula' : 'Refresh'}</span>
          </button>
        )}

        {currentPath === '/pharmacy/oxygen/qr' && (
          <div className="flex bg-subtle p-1 rounded-xl border border-border-default shadow-xs">
            <button
              onClick={() => setQrActiveTab('generate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                qrActiveTab === 'generate'
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              🏷️ Batch Generator
            </button>
            <button
              onClick={() => setQrActiveTab('monitor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                qrActiveTab === 'monitor'
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              📊 Active Monitor ({cylinders.filter(c => c.qr_code_value).length})
            </button>
          </div>
        )}

        {currentPath === '/pharmacy/oxygen/reconciliation' && (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAuditScanOpen(true)}
              className="px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-primary rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 focus:outline-none"
            >
              <QrCode className="w-4 h-4 text-text-muted" />
              Scan QR Code
            </button>
            <button 
              onClick={handleOpenAuditReview}
              disabled={isSavingReconciliation}
              className="px-3.5 py-2 bg-accent-base hover:bg-accent-hover disabled:bg-subtle text-white disabled:text-text-muted rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSavingReconciliation ? 'animate-spin' : ''}`} />
              {isSavingReconciliation ? 'Saving Audit...' : 'Save Reconciliation Audit'}
            </button>
          </div>
        )}
      </div>

      {/* Offline Status & Auto-Sync Banner */}
      <CylinderOfflineBanner hospitalId={hospitalId} />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : (error && (typeof navigator === 'undefined' || navigator.onLine)) ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-700 shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <div>
            <p className="font-bold">Failed to load oxygen data</p>
            <p className="mt-1 font-medium">{error}</p>
          </div>
        </div>
      ) : (
        renderActiveView()
      )}

      {/* ========================================================
          MODAL 1: SET CYLINDER PRICES
         ======================================================== */}
      {isPricingModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-colors duration-150"
          onClick={() => setIsPricingModalOpen(false)}
        >
          {/* Injected style tag for premium slide-in animation */}
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
          
          <div 
            className="bg-surface text-text-primary w-full max-w-5xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl h-full shadow-2xl border-l border-border-default flex flex-col p-6 md:p-8 overflow-hidden relative"
            style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-5 flex-shrink-0">
              <div>
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest block mb-0.5">Bahagian Perolehan & Logistik</span>
                <h3 className="text-base font-extrabold text-text-primary tracking-tight">Set Cylinder Refill Prices</h3>
                <p className="text-xs text-text-muted mt-0.5">Configure official standard warrant refill rates per cylinder capacity index.</p>
              </div>
              <button 
                onClick={() => setIsPricingModalOpen(false)}
                className="p-1.5 hover:bg-subtle text-slate-400 hover:text-text-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrices} className="flex flex-col flex-grow overflow-hidden min-h-0">
              <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden min-h-0">
                {/* Left Side: Pricing List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {Object.keys(editedPrices).sort((a, b) => {
                      const order = ['101-F', '101-N', 'P101-D', 'P101-E', 'P101-F', 'P101-HS', 'Liquid Medical Oxygen (VIE Tank)']
                      const idxA = order.indexOf(a)
                      const idxB = order.indexOf(b)
                      if (idxA !== -1 && idxB !== -1) return idxA - idxB
                      if (idxA !== -1) return -1
                      if (idxB !== -1) return 1
                      return a.localeCompare(b)
                    }).map((sizeCode) => {
                      const isLoanCyl = sizeCode === '101-N' || sizeCode === '101-F'
                      const isPerM3 = sizeCode.toLowerCase().includes('vie') || 
                                      sizeCode.toLowerCase().includes('liquid') || 
                                      sizeCode.toLowerCase().includes('m3') ||
                                      sizeCode.toLowerCase().includes('m³')
                      return (
                        <div 
                          key={sizeCode} 
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-subtle/50 border border-border-default hover:bg-surface hover:border-slate-350 rounded-xl hover:shadow-sm transition-colors duration-150 gap-4 ${
                            isLoanCyl ? 'xl:col-span-2 bg-indigo-500/10 border-indigo-500/20 hover:border-l-4 hover:border-l-purple-500' : 
                            isPerM3 ? 'xl:col-span-2 bg-accent-base/10 border-accent-base/20 hover:border-l-4 hover:border-l-teal-500' :
                            'hover:border-l-4 hover:border-l-sky-500'
                          }`}
                        >
                          <div className="min-w-max">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2.5 py-1 border border-sky-200 bg-sky-50 text-sky-700 rounded-md font-bold text-[11px] block font-mono shadow-xxs">
                                {sizeCode}
                              </span>
                              {isLoanCyl && (
                                <span className="px-2.5 py-0.5 border border-indigo-500/20 bg-purple-100/70 text-indigo-400 rounded-md font-extrabold text-[9px] uppercase tracking-wider">
                                  LOAN CYLINDER
                                </span>
                              )}
                              {isPerM3 && (
                                <span className="px-2.5 py-0.5 border border-accent-base/20 bg-teal-100/70 text-teal-800 rounded-md font-extrabold text-[9px] uppercase tracking-wider">
                                  BULK VIE TANK
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-text-secondary font-bold font-semibold uppercase tracking-wider block">
                              {isLoanCyl ? 'Refill & Cylinder Rental Loan Rates' : isPerM3 ? 'Bulk Liquid Rate (Per m³)' : 'Standard Refill Rate'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Refill Rate Input */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight">
                                {isPerM3 ? 'Rate / m³' : 'Refill'}
                              </span>
                              <div className="relative w-32 flex items-center border border-slate-250 rounded-lg bg-surface overflow-hidden shadow-xs h-9.5 focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-600/10 transition-colors">
                                <span className="pl-3 text-[10px] font-bold text-slate-400">RM</span>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  value={editedPrices[sizeCode] || ''}
                                  onChange={(e) => setEditedPrices(prev => ({ ...prev, [sizeCode]: e.target.value }))}
                                  required
                                  className="w-full pr-3 py-2 bg-transparent text-xs font-mono font-bold outline-none border-0 text-right text-text-primary focus:ring-0"
                                />
                              </div>
                            </div>

                            {/* Loan Rate Input for 101-N and 101-F */}
                            {isLoanCyl && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-tight">Loan Rate</span>
                                <div className="relative w-32 flex items-center border border-indigo-500/20 rounded-lg bg-surface overflow-hidden shadow-xs h-9.5 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10 transition-colors">
                                  <span className="pl-3 text-[10px] font-bold text-purple-600">RM</span>
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={editedLoanRates[sizeCode] !== undefined ? editedLoanRates[sizeCode] : (systemSettings?.loan_cylinder_rate || 18.36).toString()}
                                    onChange={(e) => setEditedLoanRates(prev => ({ ...prev, [sizeCode]: e.target.value }))}
                                    required
                                    className="w-full pr-3 py-2 bg-transparent text-xs font-mono font-black outline-none border-0 text-right text-indigo-400 dark:text-indigo-300 font-bold focus:ring-0"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Elegant Divider */}
                  <div className="pt-6 border-t border-border-subtle flex flex-col gap-1">
                    <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest block">Audit Trail & Revision Logs</span>
                    <h4 className="text-sm font-bold text-text-primary tracking-tight">Pricing Update History</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Tracks who, when, and what changed in previous official price revisions.</p>
                  </div>

                  {/* Grouped logs display */}
                  <div className="space-y-4 pt-2">
                    {(() => {
                      interface GroupedLog {
                        created_at: string
                        effective_from: string
                        creator: { full_name: string; email: string; jawatan?: string } | null
                        changes: { cylinder_size_code: string; refill_price: number }[]
                      }

                      const groupedLogs: GroupedLog[] = []
                      pricingHistory.forEach((log) => {
                        const logTime = new Date(log.created_at || log.effective_from).getTime()
                        const matchingGroup = groupedLogs.find((group) => {
                          const groupTime = new Date(group.created_at).getTime()
                          return (
                            Math.abs(groupTime - logTime) < 5000 &&
                            group.effective_from === log.effective_from &&
                            (group.creator?.email === log.creator?.email || (!group.creator && !log.creator))
                          )
                        })

                        if (matchingGroup) {
                          matchingGroup.changes.push({
                            cylinder_size_code: log.cylinder_size_code,
                            refill_price: Number(log.refill_price)
                          })
                        } else {
                          groupedLogs.push({
                            created_at: log.created_at || new Date().toISOString(),
                            effective_from: log.effective_from,
                            creator: log.creator || null,
                            changes: [{
                              cylinder_size_code: log.cylinder_size_code,
                              refill_price: Number(log.refill_price)
                            }]
                          })
                        }
                      })

                      if (groupedLogs.length === 0) {
                        return (
                          <div className="p-6 bg-subtle/50 rounded-2xl text-center text-xs text-slate-400 font-semibold italic">
                            No pricing revision logs recorded.
                          </div>
                        )
                      }

                      return groupedLogs.map((group, idx) => (
                        <div 
                          key={idx} 
                          className="bg-surface border border-slate-250 p-4.5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:border-slate-350 transition-colors duration-150"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border-subtle pb-3">
                            <div className="flex items-start gap-2.5">
                              {/* Avatar monolith circle */}
                              <div className="w-9 h-9 bg-subtle border border-border-default rounded-xl flex items-center justify-center text-text-muted font-extrabold text-xs flex-shrink-0">
                                {(group.creator?.full_name || 'System').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <div>
                                <h5 className="text-xs font-extrabold text-text-primary">
                                  {group.creator?.full_name || 'System Administrator'}
                                </h5>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 leading-tight">
                                  {group.creator?.jawatan || 'Authorized Personnel'} • <span className="font-mono text-[9.5px]">{group.creator?.email || 'admin@hospital.gov.my'}</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-left sm:text-right flex flex-col sm:items-end gap-1 flex-shrink-0">
                              <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-100 rounded-md block w-max shadow-xxs">
                                EFFECTIVE: {new Date(group.effective_from).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold">
                                Revised {new Date(group.created_at).toLocaleString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Refill Cost Updates</span>
                            <div className="flex flex-wrap gap-2">
                              {group.changes.map((chg, cIdx) => {
                                const isPerM3 = chg.cylinder_size_code.toLowerCase().includes('vie') || 
                                                chg.cylinder_size_code.toLowerCase().includes('liquid') || 
                                                chg.cylinder_size_code.toLowerCase().includes('m3') ||
                                                chg.cylinder_size_code.toLowerCase().includes('m³')
                                return (
                                  <div key={cIdx} className="px-3 py-1.5 bg-subtle/50 border border-border-default rounded-xl flex items-center gap-2 shadow-xxs">
                                    <span className="font-mono text-[10px] font-black text-text-secondary">{chg.cylinder_size_code}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    <span className="font-mono text-xs font-black text-[#0284c7]">RM {chg.refill_price.toFixed(2)}{isPerM3 ? ' / m³' : ''}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

                {/* Right Side: Form inputs */}
                <div className="w-full md:w-[320px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-border-subtle pt-5 md:pt-0 md:pl-5 flex-shrink-0">
                  <div className="space-y-5">
                    {/* Supplier Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Target Supplier</label>
                      <select 
                        value={isAddingNewSupplier ? 'CUSTOM_NEW' : selectedModalSupplier}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM_NEW') {
                            setIsAddingNewSupplier(true)
                          } else {
                            setIsAddingNewSupplier(false)
                            setSelectedModalSupplier(e.target.value)
                          }
                        }}
                        className="w-full px-3.5 py-2.5 border border-slate-250 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 transition-colors text-xs font-semibold text-text-primary rounded-lg outline-none bg-surface shadow-xs"
                      >
                        {realSupplierOptions.map((sup) => (
                          <option key={sup} value={sup}>{sup}</option>
                        ))}
                        <option value="CUSTOM_NEW">+ Add New Supplier...</option>
                      </select>

                      {isAddingNewSupplier && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Enter new supplier name..."
                            value={customSupplierInput}
                            onChange={(e) => setCustomSupplierInput(e.target.value)}
                            required
                            className="w-full px-3.5 py-2 border border-sky-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 transition-colors text-xs font-medium text-text-primary rounded-lg outline-none bg-sky-50/30"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Effective Start Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="date" 
                          value={effectiveFrom}
                          onChange={(e) => setEffectiveFrom(e.target.value)}
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 border border-slate-250 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 transition-colors text-xs font-semibold text-text-primary rounded-lg outline-none bg-surface shadow-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-sky-50 border border-sky-100/50 rounded-xl text-xs text-sky-800 leading-relaxed font-semibold">
                      <p className="font-extrabold text-sky-900 mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        Warrant Budget Protection Guarantee
                      </p>
                      Adjusting prices sets base rates for new PO generations. Historically processed oxygen receptions remain permanently locked to preserve allocated government budget.
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setIsPricingModalOpen(false)}
                      className="flex-1 py-3 border border-border-default hover:bg-subtle/50 text-slate-650 hover:text-text-primary rounded-lg text-xs font-bold transition-colors active:scale-98"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSavingPrices}
                      className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg text-xs font-extrabold shadow-sm transition-colors active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      {isSavingPrices ? <Spinner size="sm" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Save Prices
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: KEY IN RECEIVED OXYGEN DELIVERY
         ======================================================== */}
      {isReceiveModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-colors duration-150"
          onClick={() => setIsReceiveModalOpen(false)}
        >
          {/* Injected style tag for premium slide-in animation */}
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
          
          <div 
            className="bg-surface text-text-primary w-full max-w-4xl lg:max-w-5xl h-full shadow-2xl border-l border-border-default flex flex-col p-6 overflow-hidden relative"
            style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 flex-shrink-0">
              <div>
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest block mb-0.5">Kementerian Kesihatan Malaysia (KKM)</span>
                <h3 className="text-base font-extrabold text-text-primary tracking-tight">Key In Received Oxygen Delivery</h3>
                <p className="text-xs text-text-muted mt-0.5">Record incoming batches to update official government warrant allocations.</p>
              </div>
              <button 
                onClick={() => setIsReceiveModalOpen(false)}
                className="p-1.5 hover:bg-subtle text-slate-400 hover:text-text-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReception} className="flex flex-col flex-grow overflow-hidden min-h-0">
              
              <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden min-h-0">
                {/* Left Side: Cyber-styled Cylinder Inventory list of gorgeous Glass Cards */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {receiveSupplyMode === 'vie' ? 'VIE BULK LIQUID CATALOG' : 'CYLINDERS RECEIVED CATALOG'}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-teal-700 font-extrabold bg-accent-base/10 px-2 py-0.5 border border-accent-base/20 rounded-md">
                      Live Warrant Rates
                    </span>
                  </div>

                  {/* Mode Selector Tab: Compressed Gas Cylinders vs VIE Bulk Liquid */}
                  <div className="flex items-center gap-2 p-1 bg-subtle rounded-xl border border-border-default">
                    <button
                      type="button"
                      onClick={() => {
                        setReceiveSupplyMode('cyl')
                        setReceiveQuantities(prev => {
                          const next = { ...prev }
                          Object.keys(next).forEach(k => {
                            if (k.toLowerCase().includes('vie') || k.toLowerCase().includes('liquid')) delete next[k]
                          })
                          return next
                        })
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                        receiveSupplyMode === 'cyl'
                          ? 'bg-surface text-teal-800 shadow-xs border border-border-default'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      🔵 {language === 'ms' ? 'Silinder Gas Termampat' : 'Compressed Gas Cylinders'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiveSupplyMode('vie')
                        setReceiveQuantities(prev => {
                          const next = { ...prev }
                          Object.keys(next).forEach(k => {
                            if (!k.toLowerCase().includes('vie') && !k.toLowerCase().includes('liquid')) delete next[k]
                          })
                          return next
                        })
                        setReceiveLoans({})
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                        receiveSupplyMode === 'vie'
                          ? 'bg-surface text-blue-400 shadow-xs border border-border-default'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      💧 {language === 'ms' ? 'Tangki VIE (Cecair Pukal)' : 'VIE Tank (Bulk Liquid)'}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(() => {
                      const filteredReceiveConfigs = (() => {
                        const supplierConfigs = pricingConfigs.filter((c) => isSupplierMatch(c.supplier_name, selectedReceiveSupplier))
                        if (supplierConfigs.length > 0) return supplierConfigs
                        return pricingConfigs.filter((c) => isLindeSupplier(c.supplier_name))
                      })()

                      return filteredReceiveConfigs.map((config) => {
                        const isLoanSize = config.cylinder_size_code.startsWith('101-')
                        const isPerM3 = config.cylinder_size_code.toLowerCase().includes('vie') || 
                                        config.cylinder_size_code.toLowerCase().includes('liquid')
                        
                        // Strict segregation: never show VIE in cylinder mode or cylinders in VIE mode
                        if (receiveSupplyMode === 'cyl' && isPerM3) return null
                        if (receiveSupplyMode === 'vie' && !isPerM3) return null

                        const basePrice = config.refill_price
                        const loanRate = config.loan_rate ?? systemSettings?.loan_cylinder_rate ?? 18.36
                        const priceToDisplay = basePrice
                        
                        const sub = (receiveQuantities[config.cylinder_size_code] || 0) * basePrice + (receiveLoans[config.cylinder_size_code] || 0) * loanRate

                        return (
                          <div 
                            key={config.id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 bg-subtle/50 border border-border-default hover:bg-surface hover:border-slate-350 hover:border-l-4 hover:border-l-teal-600 rounded-xl hover:shadow-sm transition-colors duration-150 group"
                          >
                            {/* Size Info with capsule styling */}
                            <div className="flex items-center gap-3.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_4px_rgba(20,184,166,0.4)]" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-sm font-extrabold text-text-primary block group-hover:text-teal-700 transition-colors">
                                    {config.cylinder_size_code}
                                  </span>
                                  {isPerM3 && (
                                    <span className="px-1.5 py-0.5 bg-accent-base/10 border border-accent-base/20 text-teal-700 text-[8.5px] font-black rounded uppercase">
                                      VIE Tank
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block mt-0.5 font-bold">
                                  {isPerM3 ? 'Bulk Liquid Volume' : 'Standard Capacity'}
                                </span>
                              </div>
                            </div>

                            {/* Unit price with nice formatting */}
                            <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Warrant Rate</span>
                              <span className="font-mono text-xs font-bold text-slate-655 mt-0.5">
                                RM {priceToDisplay.toFixed(2)}{isPerM3 ? ' / m³' : ''}
                              </span>
                            </div>

                              {/* Stepper controls scaled up for spaciousness */}
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
                                    {isPerM3 ? 'Volume (m³)' : 'Refilled'}
                                  </span>
                                  <div className={`inline-flex items-center border border-slate-250 bg-surface rounded-lg overflow-hidden h-9 shadow-xxs ${isPerM3 ? 'w-28' : ''}`}>
                                    <button 
                                      type="button"
                                      onClick={() => setReceiveQuantities(prev => ({ ...prev, [config.cylinder_size_code]: Math.max(0, (prev[config.cylinder_size_code] || 0) - (isPerM3 ? 100 : 1)) }))}
                                      className="px-2.5 h-full text-slate-455 hover:bg-subtle hover:text-text-primary transition-colors text-xs font-semibold"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="number" 
                                      min="0"
                                      step={isPerM3 ? "10" : "1"}
                                      value={receiveQuantities[config.cylinder_size_code] || 0}
                                      onChange={(e) => setReceiveQuantities(prev => ({ ...prev, [config.cylinder_size_code]: Math.max(0, parseInt(e.target.value) || 0) }))}
                                      className={`${isPerM3 ? 'w-16' : 'w-10'} text-center font-mono font-extrabold text-teal-700 text-xs bg-transparent outline-none border-0 p-0 focus:ring-0`}
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => setReceiveQuantities(prev => ({ ...prev, [config.cylinder_size_code]: (prev[config.cylinder_size_code] || 0) + (isPerM3 ? 100 : 1) }))}
                                      className="px-2.5 h-full text-slate-455 hover:bg-subtle hover:text-text-primary transition-colors text-xs font-semibold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Loan Stepper widget */}
                                <div className="flex flex-col items-center">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Loaned</span>
                                  {isPerM3 ? (
                                    <span className="text-[9px] text-text-secondary font-bold font-bold uppercase tracking-wider px-3 bg-subtle border border-border-default rounded-md shadow-xxs h-9 flex items-center justify-center">
                                      N/A (Bulk VIE)
                                    </span>
                                  ) : isLoanSize ? (
                                    <span className="text-[9px] text-teal-800 font-extrabold uppercase tracking-wider px-3 bg-accent-base/10 border border-accent-base/20 rounded-md shadow-xxs h-9 flex items-center justify-center">
                                      Self Loaned
                                    </span>
                                  ) : (
                                    <div className="inline-flex items-center border border-slate-250 bg-surface rounded-lg overflow-hidden h-9 shadow-xxs">
                                      <button 
                                        type="button" 
                                        onClick={() => setReceiveLoans(prev => ({ ...prev, [config.cylinder_size_code]: Math.max(0, (prev[config.cylinder_size_code] || 0) - 1) }))}
                                        className="px-3 h-full text-slate-455 hover:bg-subtle hover:text-text-primary transition-colors text-xs font-semibold"
                                      >
                                        -
                                      </button>
                                      <input 
                                        type="number" 
                                        min="0"
                                        value={receiveLoans[config.cylinder_size_code] || 0}
                                        onChange={(e) => setReceiveLoans(prev => ({ ...prev, [config.cylinder_size_code]: Math.max(0, parseInt(e.target.value) || 0) }))}
                                        className="w-10 text-center font-mono font-extrabold text-teal-850 text-xs bg-transparent outline-none border-0 p-0 focus:ring-0"
                                      />
                                      <button 
                                        type="button" 
                                        onClick={() => setReceiveLoans(prev => ({ ...prev, [config.cylinder_size_code]: (prev[config.cylinder_size_code] || 0) + 1 }))}
                                        className="px-3 h-full text-slate-455 hover:bg-subtle hover:text-text-primary transition-colors text-xs font-semibold"
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                            {/* Subtotal calculation column */}
                            <div className="text-right sm:w-28 flex flex-col justify-end items-end">
                              <span className="text-[9px] text-slate-455 uppercase tracking-widest font-bold">Subtotal</span>
                              <span className="font-mono text-sm font-black text-text-primary group-hover:text-teal-700 transition-colors mt-0.5">
                                RM {sub.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Right Side: Receipt & Logistics metadata panel (Shopify/Stripe Checkout-inspired) */}
                <div className="w-full md:w-[330px] lg:w-[355px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-5 flex-shrink-0 overflow-y-auto pr-1">
                  
                  <div className="space-y-5">
                    {/* Section 1: Delivery & Warrant Information */}
                    <div className="bg-subtle/50 border border-border-default p-5 rounded-xl space-y-4 shadow-xxs">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block border-b border-border-default pb-2">Delivery & Warrant Info</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-extrabold text-teal-800 uppercase tracking-wider block">Target Supplier</label>
                        <select 
                          value={selectedReceiveSupplier}
                          onChange={(e) => setSelectedReceiveSupplier(e.target.value)}
                          className="w-full px-3 py-2 border border-teal-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors text-xs font-bold text-text-primary rounded-lg outline-none bg-surface shadow-xxs"
                        >
                          {realSupplierOptions.map((sup) => (
                            <option key={sup} value={sup}>{sup}</option>
                          ))}
                        </select>
                      </div>
                      
                      {(() => {
                        const isLiquidOrder = (receiveQuantities['Liquid Medical Oxygen (VIE Tank)'] || 0) > 0
                        return (
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                                DO No. {isLiquidOrder && <span className="text-amber-600 font-normal">(Auto PENDING jika permohonan)</span>}
                              </label>
                              <input 
                                type="text" 
                                placeholder={isLiquidOrder ? "PENDING (Key in semasa tiba)" : "DO-998877"}
                                value={doNumber}
                                onChange={(e) => setDoNumber(e.target.value)}
                                required={!isLiquidOrder}
                                className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-mono font-bold rounded-lg outline-none w-full px-3 py-2.5 shadow-xxs"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                                SO No. {isLiquidOrder && <span className="text-slate-400 font-normal">(Pilihan)</span>}
                              </label>
                              <input 
                                type="text" 
                                placeholder={isLiquidOrder ? "SO-112233 (Pilihan)" : "SO-112233"}
                                value={soNumber}
                                onChange={(e) => setSoNumber(e.target.value)}
                                required={!isLiquidOrder}
                                className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-mono font-bold rounded-lg outline-none w-full px-3 py-2.5 shadow-xxs"
                              />
                            </div>
                          </div>
                        )
                      })()}

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Date Received / Request</label>
                        <input 
                          type="date" 
                          value={receptionDate}
                          onChange={(e) => setReceptionDate(e.target.value)}
                          required
                          className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors text-xs font-medium rounded-lg outline-none w-full px-3 py-2.5 shadow-xxs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Vote Code</label>
                          <select 
                            value={voteCode}
                            onChange={(e) => {
                              const newVote = e.target.value
                              setVoteCode(newVote)
                              const act = financials?.by_vote_code?.[newVote]?.vote_activity || '27402'
                              setVoteActivity(act)
                            }}
                            required
                            className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors text-xs font-mono font-bold rounded-lg outline-none w-full px-3 py-2.5 shadow-xxs"
                          >
                            {availableVoteCodes.map(code => {
                              return (
                                <option key={code} value={code}>
                                  {code} {code === '080702' ? '(CC)' : code === '080600' ? '(Duit Khas)' : ''}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-505 uppercase tracking-wider block">Vote Act</label>
                          <input 
                            type="text" 
                            value={voteActivity}
                            onChange={(e) => setVoteActivity(e.target.value)}
                            required
                            className="bg-surface border border-slate-255 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-mono font-bold rounded-lg outline-none w-full px-3 py-2.5 shadow-xxs"
                          />
                        </div>
                      </div>

                      {/* Remaining Balance Indicator */}
                      <div className="bg-subtle border border-border-default rounded-lg px-3 py-2 flex items-center justify-between text-[11px]">
                        <span className="text-text-muted font-semibold">Baki Peruntukan Vot {voteCode}:</span>
                        <span className={`font-mono font-bold ${(financials?.by_vote_code?.[voteCode]?.current_balance ?? 0) < 0 ? 'text-rose-600' : 'text-teal-700'}`}>
                          {fmt(financials?.by_vote_code?.[voteCode]?.current_balance ?? (voteCode === '080702' ? (financials?.current_balance ?? 0) : 0))}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-505 uppercase tracking-wider block">Budget Status</label>
                        <select 
                          value={receptionStatus}
                          onChange={(e) => setReceptionStatus(e.target.value as any)}
                          className="bg-surface border border-slate-250 text-text-primary focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 transition-colors cursor-pointer shadow-xxs text-xs font-semibold rounded-lg w-full p-2.5"
                        >
                          <option value="completed">Completed</option>
                          <option value="pending_invoice">Pending Invoice</option>
                          <option value="outstanding_po">Outstanding PO</option>
                        </select>
                      </div>
                    </div>

                    {/* Section 2: Premium Warrant Receipt Summary Card (expanded) */}
                    <div className="bg-accent-base/10 border border-teal-150 p-5 rounded-xl flex flex-col gap-3.5 shadow-xxs">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest block border-b border-accent-base/20 pb-2">Warrant Receipt Summary</span>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-teal-850 font-semibold">
                          <span>Refill Charges:</span>
                          <span className="font-mono text-teal-900 font-bold">{fmt(calculateFormRefillTotal())}</span>
                        </div>
                        <div className="flex justify-between text-xs text-teal-850 font-semibold">
                          <span>Loan Charges:</span>
                          <span className="font-mono text-teal-900 font-bold">+{fmt(calculateFormLoanTotal())}</span>
                        </div>
                        
                        <div className="border-t border-dashed border-teal-300 pt-3.5 mt-2">
                          <div className="flex justify-between text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">
                            <span>Grand Total Cost:</span>
                          </div>
                          <h4 className="font-mono text-teal-600 text-3xl font-black mt-1 tracking-tight">
                            {fmt(calculateFormRefillTotal() + calculateFormLoanTotal())}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Pending Request Notice for Bulk VIE Tank */}
                    {(() => {
                      const isLiquidOrder = (receiveQuantities['Liquid Medical Oxygen (VIE Tank)'] || 0) > 0
                      const isPendingOrder = isLiquidOrder && (!doNumber || !doNumber.trim() || doNumber.trim().toUpperCase() === 'PENDING')
                      if (!isPendingOrder) return null
                      return (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-400 dark:text-amber-300 font-bold font-medium leading-relaxed flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>
                            Pesanan Oksigen Cecair (VIE Tank) didaftarkan sebagai <strong>Menunggu Penghantaran (Pending Delivery)</strong> untuk menjana PO dahulu. No. DO dan Tarikh Ketibaan akan dikemas kini semasa lori tangki tiba bagi mengaktifkan Laporan Penerimaan (KEW.PS-3).
                          </span>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="flex flex-col gap-2 mt-6 flex-shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setIsReceiveModalOpen(false)}
                      className="w-full py-3 border border-border-default hover:bg-subtle/50 text-slate-650 hover:text-text-primary rounded-lg text-xs font-bold transition-colors active:scale-98"
                    >
                      Cancel
                    </button>
                    {(() => {
                      const isLiquidOrder = (receiveQuantities['Liquid Medical Oxygen (VIE Tank)'] || 0) > 0
                      const isPendingOrder = isLiquidOrder && (!doNumber || !doNumber.trim() || doNumber.trim().toUpperCase() === 'PENDING')

                      return (
                        <button 
                          type="submit"
                          disabled={isSubmittingReception}
                          className={`w-full py-3 disabled:opacity-50 text-white rounded-lg text-xs font-extrabold shadow-sm transition-colors active:scale-98 flex items-center justify-center gap-1.5 ${
                            isPendingOrder 
                              ? 'bg-amber-600 hover:bg-amber-700' 
                              : 'bg-teal-600 hover:bg-teal-700'
                          }`}
                        >
                          {isSubmittingReception ? (
                            <Spinner size="sm" />
                          ) : isPendingOrder ? (
                            <FileText className="w-3.5 h-3.5" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5" />
                          )}
                          {isPendingOrder 
                            ? (language === 'ms' ? 'Daftar Permintaan & Jana PO (Menunggu DO)' : 'Generate PO Request (Pending DO)')
                            : (language === 'ms' ? 'Daftar Penerimaan Oksigen' : 'Log Received Oxygen')}
                        </button>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2B: PAY STANDALONE CYLINDER LOAN CHARGES (NO DELIVERY)
         ======================================================== */}
      {isPayLoanModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-colors duration-150"
          onClick={() => setIsPayLoanModalOpen(false)}
        >
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
          
          <div 
            className="bg-surface text-text-primary w-full max-w-4xl lg:max-w-5xl h-full shadow-2xl border-l border-border-default flex flex-col p-6 overflow-hidden relative"
            style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest block">
                    {language === 'ms' ? 'Kementerian Kesihatan Malaysia (KKM) • Unit Pentadbiran / Bahagian Pengurusan' : 'Ministry of Health Malaysia • Hospital Administration Division'}
                  </span>
                  <span className="text-[9px] font-black bg-purple-100 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {language === 'ms' ? 'Akaun Pentadbiran (Bukan Bajet Farmasi)' : 'Admin Account (Not Pharmacy Budget)'}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-text-primary tracking-tight flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  {language === 'ms' ? 'Bayar Caj Pinjaman Silinder Sahaja (Tanpa Penghantaran)' : 'Pay Standalone Cylinder Loan Charges (No Gas Delivery)'}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {language === 'ms' 
                    ? 'Bayaran sewaan bulanan silinder pembekal yang masih berada dalam simpanan fasiliti. Dibayar melalui Peruntukan Akaun Pentadbiran Hospital (Program 020200 / Objek 24000) tanpa menjejaskan peruntukan Unit Farmasi mahupun lejar KEW.PS-4.' 
                    : 'Monthly cylinder loan rental fee for cylinders held in hospital custody. Funded under Hospital Administration Budget (Program 020200 / Object 24000) without deducting Pharmacy funds or affecting KEW.PS-4 store ledger.'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsPayLoanModalOpen(false)}
                className="p-1.5 hover:bg-subtle text-slate-400 hover:text-text-secondary rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLoanPayment} className="flex flex-col flex-grow overflow-hidden min-h-0">
              <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden min-h-0">
                
                {/* LEFT COLUMN: ACTIVE CUSTODY BREAKDOWN */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {/* Custody Info Banner */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-elevation-1">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-xl mt-0.5">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 dark:text-indigo-300 font-bold">
                        {language === 'ms' ? 'Status Kustodi Silinder Aktif (Akaun Pentadbiran)' : 'Active Cylinder Custody Status (Admin Account)'}
                      </h4>
                      <p className="text-[11px] text-purple-700/90 font-medium mt-1 leading-relaxed">
                        {language === 'ms'
                          ? 'Sistem menyemak baki silinder pinjaman dalam simpanan fasiliti (tanpa pemulangan). Kuantiti dan kadar sewa dipra-isi secara automatik. Bayaran sewaan ini dipertanggungjawabkan di bawah Peruntukan Pentadbiran (Bukan Bajet Farmasi).'
                          : 'Live count of unreturned supplier cylinders currently in hospital possession. Quantities and contract loan rates are pre-calculated automatically and billed under Hospital Administration Budget (Not Pharmacy Budget).'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {language === 'ms' ? 'PERINCIAN SILINDER PINJAMAN' : 'LOAN CYLINDER BILLING BREAKDOWN'}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-purple-100">
                      {activeLoanCustody.length} {language === 'ms' ? 'Kategori Saiz' : 'Size Categories'}
                    </span>
                  </div>

                  {isLoadingCustody ? (
                    <div className="p-8 text-center bg-subtle/50 rounded-2xl border border-border-default flex flex-col items-center justify-center gap-2">
                      <Spinner size="md" />
                      <span className="text-xs text-text-muted font-bold">{language === 'ms' ? 'Mengimbas rekod kustodi silinder...' : 'Scanning cylinder custody records...'}</span>
                    </div>
                  ) : activeLoanCustody.length === 0 ? (
                    <div className="p-6 text-center bg-subtle/50 rounded-2xl border border-border-default text-xs text-text-muted font-semibold italic">
                      {language === 'ms' ? 'Tiada silinder pinjaman dijumpai dalam inventori aktif.' : 'No loan cylinders found in active inventory.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeLoanCustody.map((c) => {
                        const billedQty = loanItemQuantities[c.sizeCode] !== undefined ? loanItemQuantities[c.sizeCode] : c.activeCount
                        const billedRate = loanCustomRates[c.sizeCode] !== undefined ? loanCustomRates[c.sizeCode] : c.rate
                        const subtotal = (Number(billedQty) || 0) * (Number(billedRate) || 0)

                        return (
                          <div 
                            key={c.sizeCode}
                            className="bg-surface border border-border-default hover:border-purple-300 rounded-2xl p-4 transition-colors shadow-elevation-1 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-text-primary bg-subtle px-2.5 py-1 rounded-lg border border-border-default">
                                  {c.sizeCode}
                                </span>
                                <span className="text-[11px] font-bold text-text-muted">
                                  {c.sizeCode.includes('101-F') 
                                    ? (language === 'ms' ? 'Silinder Sederhana (1.4m³)' : 'Medium Cylinder (1.4m³)')
                                    : (language === 'ms' ? 'Silinder Besar (8.0m³)' : 'Large Cylinder (8.0m³)')}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                {c.activeCount} {language === 'ms' ? 'dalam simpanan' : 'in custody'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-border-subtle items-end">
                              {/* Billed Quantity */}
                              <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-wider block mb-1">
                                  {language === 'ms' ? 'Kuantiti Dibilkan' : 'Billed Qty'}
                                </label>
                                <input 
                                  type="number"
                                  min="0"
                                  value={billedQty}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value, 10) || 0)
                                    setLoanItemQuantities(prev => ({ ...prev, [c.sizeCode]: val }))
                                  }}
                                  className="w-full px-3 py-2 text-xs font-black text-slate-950 bg-surface border-2 border-border-default focus:border-purple-600 focus:ring-2 focus:ring-purple-200 rounded-xl outline-none shadow-xs"
                                />
                              </div>

                              {/* Rate per Cylinder */}
                              <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-wider block mb-1">
                                  {language === 'ms' ? 'Kadar (RM / cyl)' : 'Rate (RM / cyl)'}
                                </label>
                                <input 
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={billedRate}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseFloat(e.target.value) || 0)
                                    setLoanCustomRates(prev => ({ ...prev, [c.sizeCode]: val }))
                                  }}
                                  className="w-full px-3 py-2 text-xs font-black text-slate-950 bg-surface border-2 border-border-default focus:border-purple-600 focus:ring-2 focus:ring-purple-200 rounded-xl outline-none shadow-xs"
                                />
                              </div>

                              {/* Subtotal */}
                              <div className="text-right pb-1">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                                  {language === 'ms' ? 'Subjumlah' : 'Subtotal'}
                                </span>
                                <span className="text-sm font-extrabold text-purple-700">
                                  {fmt(subtotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Custody Summary Pill Box */}
                  {(() => {
                    const totalQty = activeLoanCustody.reduce((sum, c) => {
                      const q = loanItemQuantities[c.sizeCode] !== undefined ? loanItemQuantities[c.sizeCode] : c.activeCount
                      return sum + (Number(q) || 0)
                    }, 0)
                    const totalCost = activeLoanCustody.reduce((sum, c) => {
                      const q = loanItemQuantities[c.sizeCode] !== undefined ? loanItemQuantities[c.sizeCode] : c.activeCount
                      const r = loanCustomRates[c.sizeCode] !== undefined ? loanCustomRates[c.sizeCode] : c.rate
                      return sum + ((Number(q) || 0) * (Number(r) || 0))
                    }, 0)

                    return (
                      <div className="bg-subtle/50 border border-border-default rounded-2xl p-3.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-text-muted">
                          {language === 'ms' ? 'Jumlah Silinder Dibilkan:' : 'Total Billed Cylinders:'} <strong className="text-text-primary font-extrabold">{totalQty} silinder</strong>
                        </span>
                        <span className="font-black text-indigo-400 dark:text-indigo-300 font-bold text-sm">
                          {fmt(totalCost)}
                        </span>
                      </div>
                    )
                  })()}
                </div>

                {/* RIGHT COLUMN: SUPPLIER, INVOICE & VOTE CODE CONFIG */}
                <div className="w-full md:w-80 lg:w-96 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border-default pt-4 md:pt-0 md:pl-6 space-y-4 overflow-y-auto">
                  <div className="space-y-3.5">
                    {/* Supplier Selector */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-secondary tracking-wider block mb-1">
                        {language === 'ms' ? 'Pembekal Gas / Silinder' : 'Supplier'}
                      </label>
                      <select 
                        value={loanSupplier}
                        onChange={(e) => handleLoanSupplierChange(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-bold text-text-primary border border-border-default focus:border-purple-500 rounded-xl bg-surface shadow-elevation-1 outline-none cursor-pointer"
                      >
                        {realSupplierOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Invoice / Claim Reference */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-secondary tracking-wider block mb-1">
                        {language === 'ms' ? 'No. Invois / Tuntutan Bayaran *' : 'Invoice / Claim Reference *'}
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. INV-2026/09-LOAN"
                        value={loanInvoiceNo}
                        onChange={(e) => setLoanInvoiceNo(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-bold text-text-primary border border-border-default focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-surface shadow-elevation-1 outline-none uppercase font-mono"
                      />
                    </div>

                    {/* Sales Order / Billing Ref */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-secondary tracking-wider block mb-1">
                        {language === 'ms' ? 'No. Rujukan Bil / SO Pembekal (Pilihan)' : 'Supplier SO / Billing Ref (Optional)'}
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. 011045"
                        value={loanBillingRef}
                        onChange={(e) => setLoanBillingRef(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium text-text-primary border border-border-default focus:border-purple-500 rounded-xl bg-surface outline-none font-mono"
                      />
                    </div>

                    {/* Billing Date */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-secondary tracking-wider block mb-1">
                        {language === 'ms' ? 'Tarikh Invois / Bil' : 'Billing / Invoice Date'}
                      </label>
                      <input 
                        type="date"
                        required
                        value={loanBillingDate}
                        onChange={(e) => setLoanBillingDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-text-primary border border-border-default focus:border-purple-500 rounded-xl bg-surface outline-none"
                      />
                    </div>

                    {/* Vote Code & Activity Selection (Admin Account Budget) */}
                    <div className="space-y-2 p-3 bg-indigo-500/10 border border-purple-150 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-300 font-bold tracking-wider">
                          {language === 'ms' ? 'Kod Vot Pentadbiran (Bukan Farmasi)' : 'Admin Vote Code (Not Pharmacy)'}
                        </label>
                        <span className="text-[8.5px] font-black uppercase text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {language === 'ms' ? 'Akaun Pentadbiran' : 'Admin Account'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                            {language === 'ms' ? 'Pilihan Vot' : 'Vote Code'}
                          </label>
                          <select 
                            value={['24000', '24999', '020200'].includes(loanVoteCode) ? loanVoteCode : 'manual'}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === 'manual') {
                                setLoanVoteCode('')
                              } else {
                                setLoanVoteCode(val)
                                setLoanVoteActivity('020200')
                              }
                            }}
                            className="w-full px-3 py-2 text-xs font-bold text-text-primary border border-border-default focus:border-purple-500 rounded-xl bg-surface outline-none cursor-pointer"
                          >
                            <option value="24000">24000 (Sewaan - Pentadbiran)</option>
                            <option value="24999">24999 (Sewaan Gas - Pentadbiran)</option>
                            <option value="020200">020200 (Pengurusan Hospital)</option>
                            <option value="manual">{language === 'ms' ? 'Vot Lain (Manual)' : 'Other Vote (Manual)'}</option>
                          </select>
                          {!['24000', '24999', '020200'].includes(loanVoteCode) && (
                            <input 
                              type="text"
                              required
                              placeholder="e.g. 24000"
                              value={loanVoteCode}
                              onChange={(e) => setLoanVoteCode(e.target.value.trim())}
                              className="mt-1.5 w-full px-2.5 py-1.5 text-xs font-mono font-bold text-text-primary border border-purple-300 focus:border-purple-500 rounded-xl bg-surface outline-none"
                            />
                          )}
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                            {language === 'ms' ? 'Aktiviti / Program' : 'Activity / Program'}
                          </label>
                          <input 
                            type="text"
                            required
                            placeholder="020200"
                            value={loanVoteActivity}
                            onChange={(e) => setLoanVoteActivity(e.target.value.trim())}
                            className="w-full px-3 py-2 text-xs font-bold text-text-primary border border-border-default focus:border-purple-500 rounded-xl bg-surface outline-none font-mono"
                          />
                          <span className="text-[8px] text-purple-700 block mt-0.5 font-bold">
                            {language === 'ms' ? '020200 Pengurusan Hospital' : '020200 Hospital Management'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-secondary tracking-wider block mb-1">
                        {language === 'ms' ? 'Status Bayaran / PO' : 'Payment / PO Status'}
                      </label>
                      <select 
                        value={loanStatus}
                        onChange={(e) => setLoanStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-bold text-text-primary border border-border-default focus:border-purple-500 rounded-xl bg-surface outline-none cursor-pointer"
                      >
                        <option value="completed">{language === 'ms' ? 'Diluluskan / Selesai (Completed)' : 'Completed / Approved'}</option>
                        <option value="outstanding_po">{language === 'ms' ? 'PO Komited (Outstanding PO)' : 'Committed PO (Outstanding)'}</option>
                        <option value="pending_invoice">{language === 'ms' ? 'Menunggu Baucar (Pending Invoice)' : 'Pending Voucher / Invoice'}</option>
                      </select>
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-secondary tracking-wider block mb-1">
                        {language === 'ms' ? 'Catatan / Justifikasi' : 'Remarks / Justification'}
                      </label>
                      <textarea 
                        rows={2}
                        placeholder={language === 'ms' ? 'Contoh: Bayaran sewaan silinder pinjaman bagi bulan semasa tanpa bekalan gas.' : 'E.g. Monthly rental fee for active cylinders.'}
                        value={loanRemarks}
                        onChange={(e) => setLoanRemarks(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium text-text-primary border border-border-default focus:border-purple-500 rounded-xl bg-surface outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Bottom: Grand Total & Submit Actions */}
                  <div className="pt-3 border-t border-border-subtle space-y-3">
                    {(() => {
                      const totalCost = activeLoanCustody.reduce((sum, c) => {
                        const q = loanItemQuantities[c.sizeCode] !== undefined ? loanItemQuantities[c.sizeCode] : c.activeCount
                        const r = loanCustomRates[c.sizeCode] !== undefined ? loanCustomRates[c.sizeCode] : c.rate
                        return sum + ((Number(q) || 0) * (Number(r) || 0))
                      }, 0)

                      return (
                        <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl p-4 text-white shadow-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 block">
                              {language === 'ms' ? 'JUMLAH CAJ PINJAMAN PERLU DIBAYAR' : 'TOTAL PAYABLE LOAN CHARGES'}
                            </span>
                            <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full text-white">
                              {language === 'ms' ? 'Akaun Pentadbiran' : 'Admin Account'}
                            </span>
                          </div>
                          <h4 className="text-2xl font-extrabold tracking-tight mt-1">
                            {fmt(totalCost)}
                          </h4>
                          <span className="text-[10px] text-purple-200 font-semibold block mt-1">
                            {language === 'ms' ? 'Diperuntukkan di bawah Vot Pentadbiran' : 'Allocated under Admin Vote'}: <strong>{loanVoteCode || '24000'}</strong> ({loanVoteActivity || '020200'})
                          </span>
                          <span className="text-[9px] text-purple-300 font-medium block mt-1.5 pt-1.5 border-t border-purple-500/30">
                            {language === 'ms' 
                              ? '✓ Dibiayai daripada peruntukan Akaun Pentadbiran (Bukan bajet / duit khas farmasi)' 
                              : '✓ Paid under Hospital Admin Account Budget (Zero deduction from pharmacy budget / duit khas)'}
                          </span>
                        </div>
                      )
                    })()}

                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setIsPayLoanModalOpen(false)}
                        className="w-1/3 py-3 border border-border-default hover:bg-subtle/50 text-slate-650 hover:text-text-primary rounded-xl text-xs font-bold transition-colors active:scale-98 cursor-pointer"
                      >
                        {language === 'ms' ? 'Batal' : 'Cancel'}
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmittingLoanPayment}
                        className="w-2/3 py-3 bg-accent-base hover:bg-accent-hover text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md shadow-purple-500/20 transition-colors active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingLoanPayment ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Receipt className="w-4 h-4 text-purple-200" />
                            <span>{language === 'ms' ? 'Sahkan & Jana PO' : 'Confirm & Generate PO'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: PDF DOWNLOAD CONGRATULATION SCREEN
         ======================================================== */}
      {pdfSuccessModalOpen && justCreatedReception && (() => {
        const isPending = justCreatedReception.status === 'pending' || 
                          justCreatedReception.status === 'pending_delivery' || 
                          !justCreatedReception.delivery_order_no || 
                          String(justCreatedReception.delivery_order_no).toUpperCase().startsWith('PENDING')

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-[28px] w-full max-w-md p-6 shadow-2xl text-center relative border border-border-default animate-bounce-short">
              <button 
                onClick={() => setPdfSuccessModalOpen(false)}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-text-muted rounded-xl hover:bg-subtle/50 transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>

              <div className={`w-16 h-16 ${isPending ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-100'} border rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                {isPending ? (
                  <FileText className="w-8 h-8 text-amber-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                )}
              </div>

              <h3 className="text-lg font-black text-text-primary">
                {isPending 
                  ? 'Liquid Oxygen Request Registered (PO Ready)!' 
                  : 'Oxygen Received Successfully!'}
              </h3>
              <p className="text-xs text-text-muted mt-2 px-4 leading-relaxed">
                {isPending 
                  ? 'Permohonan pesanan gas oksigen cecair berjaya didaftarkan. Anda boleh menjana Pesanan Kerajaan (PO) sekarang. Laporan Penerimaan (KEW.PS-3) akan diaktifkan sebaik sahaja lori tangki tiba dan No. DO dikemas kini.' 
                  : 'The oxygen delivery was successfully recorded into Supabase. You can now download the KKM-compliant documents.'}
              </p>

              <div className="flex flex-col gap-3 mt-6">
                <button 
                  onClick={() => {
                    setPdfSuccessModalOpen(false)
                    handleOpenPoPreview(justCreatedReception)
                  }}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  Print Purchase Order (PO) PDF
                </button>
                {isPending ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-400 font-medium flex items-center gap-2 text-left">
                    <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Laporan Penerimaan (KEW.PS-3) dikunci sementara sehingga No. DO dimasukkan semasa ketibaan.</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleDownloadReport(justCreatedReception)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4 text-white" />
                    Download Reception Report
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ========================================================
          MODAL 3B: KEY IN DO & CONFIRM ARRIVAL MODAL (LIQUID / PENDING RECEPTION)
         ======================================================== */}
      {isArrivalModalOpen && arrivalRecord && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={() => setIsArrivalModalOpen(false)}
        >
          <div 
            className="bg-surface rounded-[24px] w-full max-w-lg p-6 shadow-2xl border border-border-default relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3.5 mb-4">
              <div>
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest block mb-0.5">Kementerian Kesihatan Malaysia (KKM)</span>
                <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                  {language === 'ms' ? 'Kemas Kini Ketibaan Penghantaran Oksigen (Key In DO)' : 'Confirm Oxygen Arrival (Key In DO)'}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {language === 'ms' 
                    ? 'Sahkan ketibaan lori tangki / bekalan oksigen dan daftarkan Nombor Nota Serahan (DO).' 
                    : 'Confirm tanker arrival and register Delivery Order (DO) number.'}
                </p>
              </div>
              <button 
                onClick={() => setIsArrivalModalOpen(false)}
                className="p-1.5 hover:bg-subtle text-slate-400 hover:text-text-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitArrival} className="space-y-4">
              {/* Order Info Card */}
              <div className="bg-subtle/50 border border-border-default p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Pembekal:</span>
                  <span className="font-bold text-text-primary">{arrivalRecord.supplier_name || 'LINDE EOX SDN BHD (CAW. MIRI)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Tarikh Pesanan:</span>
                  <span className="font-semibold text-text-secondary">
                    {new Date(arrivalRecord.reception_date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Kod Vot:</span>
                  <span className="font-mono font-bold text-teal-700">
                    {arrivalRecord.vote_code || '080702'} ({arrivalRecord.vote_activity || '27402'})
                  </span>
                </div>
                <div className="flex justify-between border-t border-border-default pt-2 font-bold">
                  <span className="text-text-muted">Jumlah Anggaran:</span>
                  <span className="font-mono text-teal-800 text-sm">{fmt(arrivalRecord.total_amount)}</span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider block">
                    No. Delivery Order (DO) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="cth: 0238445129"
                    value={arrivalDoNo}
                    onChange={(e) => setArrivalDoNo(e.target.value)}
                    required
                    autoFocus
                    className="bg-surface border border-teal-300 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-mono font-bold rounded-lg outline-none w-full px-3 py-2.5 shadow-xxs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      No. Sales Order (SO) <span className="text-slate-400 font-normal">(Pilihan)</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="cth: 133045612"
                      value={arrivalSoNo}
                      onChange={(e) => setArrivalSoNo(e.target.value)}
                      className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-mono font-bold rounded-lg outline-none w-full px-3 py-2.5 shadow-xxs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Tarikh Ketibaan (Auto) <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      required
                      className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors text-xs font-medium rounded-lg outline-none w-full px-3 py-2.5 shadow-xxs"
                    />
                  </div>
                </div>
              </div>

              {/* Informative Unlock Banner */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 dark:text-emerald-300 font-bold font-medium leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Selepas No. DO dan Tarikh Ketibaan disimpan, status pesanan akan ditukar kepada <strong>Selesai (Completed)</strong> dan <strong>Laporan Penerimaan (KEW.PS-3)</strong> akan diaktifkan untuk dimuat turun.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsArrivalModalOpen(false)}
                  className="flex-1 py-2.5 border border-border-default hover:bg-subtle/50 text-text-secondary rounded-xl text-xs font-bold transition-colors"
                >
                  {language === 'ms' ? 'Batal' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingArrival}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors flex items-center justify-center gap-1.5 active:scale-98"
                >
                  {isSubmittingArrival ? <Spinner size="sm" /> : <CheckCheck className="w-4 h-4" />}
                  {language === 'ms' ? 'Sahkan & Buka Laporan' : 'Confirm & Unlock Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================
          MODAL 4: OFFICERS SIGNATURE SETTINGS drawer
         ======================================================== */}
      {isOfficerModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-colors duration-150"
          onClick={() => setIsOfficerModalOpen(false)}
        >
          <div 
            className="bg-surface text-text-primary w-full max-w-md h-full shadow-2xl border-l border-border-default flex flex-col p-6 overflow-hidden relative"
            style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-5 flex-shrink-0">
              <div>
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest block mb-0.5">Warrant Administration Settings</span>
                <h3 className="text-base font-extrabold text-text-primary tracking-tight">Edit Officer Signatures</h3>
                <p className="text-xs text-text-muted mt-0.5">Configure signees for the KKM Purchase Order.</p>
              </div>
              <button 
                onClick={() => setIsOfficerModalOpen(false)}
                className="p-1.5 hover:bg-subtle text-slate-400 hover:text-text-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSignatures} className="flex-grow flex flex-col justify-between overflow-y-auto pr-1">
              <div className="space-y-6">
                {/* Pegawai Memohon */}
                <div className="space-y-3.5 border-b border-border-subtle pb-5">
                  <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest">1. Pegawai Yang Memohon</h4>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Officer Name</label>
                    <input 
                      type="text" 
                      value={tempSignatures.applicantName}
                      onChange={(e) => setTempSignatures(prev => ({ ...prev, applicantName: e.target.value }))}
                      required
                      className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-bold rounded-lg outline-none w-full px-3.5 py-2.5 shadow-xxs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Position / Jawatan</label>
                    <input 
                      type="text" 
                      value={tempSignatures.applicantPosition}
                      onChange={(e) => setTempSignatures(prev => ({ ...prev, applicantPosition: e.target.value }))}
                      required
                      className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-semibold rounded-lg outline-none w-full px-3.5 py-2.5 shadow-xxs"
                    />
                  </div>
                </div>

                {/* Ketua Bahagian */}
                <div className="space-y-3.5 pb-5">
                  <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest">2. Ketua Bahagian</h4>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Officer Name</label>
                    <input 
                      type="text" 
                      value={tempSignatures.headName}
                      onChange={(e) => setTempSignatures(prev => ({ ...prev, headName: e.target.value }))}
                      required
                      className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-bold rounded-lg outline-none w-full px-3.5 py-2.5 shadow-xxs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Position / Jawatan</label>
                    <input 
                      type="text" 
                      value={tempSignatures.headPosition}
                      onChange={(e) => setTempSignatures(prev => ({ ...prev, headPosition: e.target.value }))}
                      required
                      className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 placeholder-slate-400 transition-colors text-xs font-semibold rounded-lg outline-none w-full px-3.5 py-2.5 shadow-xxs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 border-t border-border-subtle pt-5">
                <button 
                  type="button" 
                  onClick={() => setIsOfficerModalOpen(false)}
                  className="flex-1 py-3 border border-border-default hover:bg-subtle/50 text-slate-655 hover:text-text-primary rounded-lg text-xs font-bold transition-colors active:scale-98"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSavingOfficers}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-extrabold shadow-sm transition-colors active:scale-98 flex items-center justify-center gap-1.5"
                >
                  {isSavingOfficers ? <Spinner size="sm" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================
          MODAL 5: PO PREVIEW & EDIT SIGNATURES BEFORE PRINT
         ======================================================== */}
      {isPoPreviewModalOpen && previewRecord && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setIsPoPreviewModalOpen(false)}
        >
          <div 
            className="bg-surface rounded-[28px] w-full max-w-7xl h-[90vh] shadow-2xl relative border border-border-default flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4 flex-shrink-0 bg-subtle/50">
              <div>
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest block mb-0.5">LPO Document Workspace</span>
                <h3 className="text-base font-extrabold text-text-primary tracking-tight">KKM Purchase Order Document Verification</h3>
                <p className="text-xs text-text-muted mt-0.5">Select signees and verify the generated PDF document live before printing.</p>
              </div>
              <button 
                onClick={() => setIsPoPreviewModalOpen(false)}
                className="p-1.5 hover:bg-subtle text-slate-400 hover:text-text-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Content Body */}
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden min-h-0">
              
              {/* Left Column: Live PDF Document Viewer (2/3 width) */}
              <div className="flex-1 lg:flex-[2] bg-subtle p-4 flex items-center justify-center border-r border-border-default overflow-hidden relative">
                {previewPdfUrl ? (
                  <iframe 
                    src={`${previewPdfUrl}#navpanes=0`} 
                    className="w-full h-full border border-border-default rounded-2xl shadow-lg bg-surface" 
                    title="Live PO PDF Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Spinner size="lg" />
                    <span className="text-xs font-semibold">Generating document preview...</span>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Dropdown Controls (1/3 width) */}
              <form 
                onSubmit={handleGeneratePoWithCustomSignatures} 
                className="w-full lg:w-[380px] p-6 flex flex-col justify-between overflow-y-auto bg-surface flex-shrink-0 min-h-0"
              >
                <div className="space-y-6">
                  {/* Summary Box */}
                  <div className="bg-accent-base/10 border border-teal-100 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-widest block">PO Reference</span>
                    <div className="flex justify-between text-xs font-semibold text-text-secondary">
                      <span>Delivery Order No:</span>
                      <span className="font-mono text-teal-700 font-bold">{previewRecord.delivery_order_no}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-text-secondary">
                      <span>Total Amount:</span>
                      <span className="font-mono text-teal-850 font-black">{fmt(previewRecord.total_amount)}</span>
                    </div>
                  </div>

                  {/* Section 1: Kod Undi & Peruntukan (LOCKED / READ-ONLY) */}
                  <div className="space-y-3.5 border-b border-border-subtle pb-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        1. Kod Undi & Peruntukan
                      </h4>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                        previewVoteCode.startsWith('24') || previewVoteCode === '020200'
                          ? 'bg-purple-100 text-indigo-400 border-indigo-500/20'
                          : 'bg-subtle text-text-secondary border-border-default'
                      }`}>
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        VOT {previewVoteCode} {previewVoteCode.startsWith('24') || previewVoteCode === '020200' ? '(AKAUN PENTADBIRAN)' : '(READ-ONLY)'}
                      </span>
                    </div>

                    {/* Read-Only Locked Box with Security Override Button */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block flex items-center justify-between">
                        <span>{language === 'ms' ? 'Kod Vot Disahkan (Read-Only)' : 'Verified Vote Code (Read-Only)'}</span>
                        <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> {language === 'ms' ? 'Terkunci' : 'Locked'}
                        </span>
                      </label>

                      <div className="flex items-center justify-between gap-2 p-3 bg-subtle/50 border border-border-default rounded-2xl shadow-elevation-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-surface border border-border-default rounded-xl text-amber-600 shadow-elevation-1 shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-mono font-black text-text-primary block truncate">
                              Vot {previewVoteCode} {
                                previewVoteCode === '24000' ? '(Sewaan - Pentadbiran)' :
                                previewVoteCode === '24999' ? '(Sewaan Gas - Pentadbiran)' :
                                previewVoteCode === '020200' ? '(Pengurusan Hospital)' :
                                previewVoteCode === '080702' ? '(CC)' :
                                previewVoteCode === '080600' ? '(Duit Khas)' : ''
                              }
                            </span>
                            <span className="text-[10px] text-text-muted font-semibold block truncate">
                              {previewVoteCode.startsWith('24') || previewVoteCode === '020200'
                                ? (language === 'ms' ? 'Akaun Pentadbiran Hospital' : 'Hospital Administration Account')
                                : `Baki: ${fmt(financials?.by_vote_code?.[previewVoteCode]?.current_balance ?? (previewVoteCode === '080702' ? (financials?.current_balance ?? 0) : 0))}`
                              }
                            </span>
                          </div>
                        </div>

                        {/* Security Change Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenVoteOverrideModal(previewRecord)}
                          className="px-3 py-1.5 bg-surface hover:bg-amber-500/10 text-amber-400 hover:text-amber-400 dark:text-amber-300 font-bold border border-amber-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1 active:scale-95 shrink-0"
                          title={language === 'ms' ? 'Tukar Kod Vot dengan Kebenaran F@rmasi.2016' : 'Change Vote Code with F@rmasi.2016'}
                        >
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>{language === 'ms' ? 'Tukar Vot' : 'Change Vote'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                          Aktiviti Vot
                        </label>
                        <div className="bg-subtle/50 border border-border-default text-text-primary text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 truncate">
                          {previewVoteActivity || '27402'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                          Baki Vot Semasa
                        </label>
                        <div className="bg-subtle/50 border border-border-default text-text-primary text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 truncate">
                          {fmt(financials?.by_vote_code?.[previewVoteCode]?.current_balance ?? (previewVoteCode === '080702' ? (financials?.current_balance ?? 0) : 0))}
                        </div>
                      </div>
                    </div>

                    {/* Live Budget Health & Breakdown */}
                    {(() => {
                      const isAdminVote = previewVoteCode.startsWith('24') || previewVoteCode === '020200'
                      if (isAdminVote) {
                        return (
                          <div className="p-3 rounded-2xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-400 dark:text-indigo-300 font-bold text-[10px] space-y-1.5 shadow-elevation-1">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-[10px] uppercase tracking-wider text-indigo-400">
                                {language === 'ms' ? 'Status Peruntukan:' : 'Budget Allocation Status:'}
                              </span>
                              <span className="font-mono text-[9px] font-black bg-purple-200/80 text-indigo-400 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase">
                                {language === 'ms' ? 'Akaun Pentadbiran' : 'Hospital Admin Budget'}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-indigo-400/90 leading-relaxed">
                              {language === 'ms'
                                ? '✓ Pesanan Kerajaan (PO) ini dipertanggungjawabkan di bawah Peruntukan Pentadbiran (Objek 24000 / Program 020200). Sifar potongan terhadap baki Vot Farmasi mahupun Duit Khas.'
                                : '✓ This Government PO is charged against Hospital Administration Budget (Object 24000 / Program 020200). Zero deduction from Pharmacy Vote or Duit Khas allocations.'}
                            </p>
                            <div className="pt-1.5 border-t border-indigo-500/20 flex justify-between text-[10px] font-mono">
                              <span className="text-purple-700 font-semibold">{language === 'ms' ? 'Caj Pinjaman / Sewaan:' : 'Loan / Rental Charges:'}</span>
                              <span className="font-extrabold text-indigo-400 dark:text-indigo-300 font-bold">{fmt(previewLoanAmount || previewRecord.total_amount)}</span>
                            </div>
                          </div>
                        )
                      }

                      const refillAmt = previewRefillAmount || Number(previewRecord?.refill_amount || 0) || (previewRecord ? (previewRecord.total_amount - (previewRecord.loan_amount || 0)) : 0) || previewTotalAmount || 0
                      const { balanceBefore, balanceAfter } = computePoBalances(previewRecord, previewVoteCode, refillAmt)
                      const isDeficit = balanceAfter < 0
                      return (
                        <div className={`p-2.5 rounded-xl border text-[10px] space-y-1.5 ${isDeficit ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-accent-base/10 border-accent-base/20 text-teal-900'}`}>
                          <div className="flex justify-between font-bold">
                            <span>Status Baki Vot {previewVoteCode} (Unit Farmasi):</span>
                            <span className="font-mono">{isDeficit ? 'PERUNTUKAN DEFISIT' : 'PERUNTUKAN SIHAT'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-border-default font-mono text-[9px]">
                            <span className="text-text-muted">Baki Sebelum PO:</span>
                            <span className="font-bold text-right text-text-primary">{fmt(balanceBefore)}</span>
                            <span className="text-text-muted">Tolak PO Refill Gas:</span>
                            <span className="font-bold text-right text-text-primary">-{fmt(refillAmt)}</span>
                            <span className="text-text-muted">Baki Selepas PO:</span>
                            <span className={`font-bold text-right ${isDeficit ? 'text-rose-600' : 'text-teal-700'}`}>{fmt(balanceAfter)}</span>
                          </div>
                          {previewLoanAmount > 0 && (
                            <div className="pt-1 border-t border-border-default flex justify-between text-[9px] text-purple-700 font-semibold">
                              <span>Caj Pinjaman (Bajet Pentadbiran):</span>
                              <span className="font-mono font-bold">{fmt(previewLoanAmount)}</span>
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    <p className="text-[9px] text-slate-400 font-medium leading-tight">
                      {language === 'ms' 
                        ? '🔒 Kod Vot disahkan dan dikunci (Read-Only). Untuk sebarang perubahan luar jangka, klik "Tukar Vot" dan masukkan kata laluan keselamatan F@rmasi.2016 berserta justifikasi log audit KKM.' 
                        : '🔒 Vote Code is verified and locked (Read-Only). For unforeseen changes, click "Change Vote" and enter security password F@rmasi.2016 with audit log justification.'}
                    </p>
                  </div>

                  {/* Dropdown 2: Pegawai Memohon */}
                  <div className="space-y-3.5 border-b border-border-subtle pb-5">
                    <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      2. Pegawai Yang Memohon
                    </h4>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                        Select Officer (Pharmacy Logistic)
                      </label>
                      <select
                        onChange={(e) => {
                          const chosen = pharmacyLogisticUsers.find(u => u.full_name === e.target.value)
                          if (chosen) {
                            setPreviewSignatures(prev => ({
                              ...prev,
                              applicantName: chosen.full_name,
                              applicantPosition: chosen.jawatan || chosen.role?.role_name || 'Assistant Pharmacist'
                            }))
                          }
                        }}
                        value={previewSignatures.applicantName}
                        className="w-full border border-slate-250 rounded-xl p-2.5 text-xs outline-none bg-surface text-text-secondary focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 transition-colors font-semibold"
                      >
                        <option value="">-- Select Officer --</option>
                        {pharmacyLogisticUsers.map(user => (
                          <option key={user.id} value={user.full_name}>
                            {user.full_name} ({user.jawatan || user.role?.role_name || 'Staff'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">Officer Position (Custom)</label>
                      <input 
                        type="text" 
                        value={previewSignatures.applicantPosition}
                        onChange={(e) => setPreviewSignatures(prev => ({ ...prev, applicantPosition: e.target.value }))}
                        required
                        className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors text-xs font-semibold rounded-lg outline-none w-full px-3 py-2"
                      />
                    </div>
                  </div>

                  {/* Dropdown 3: Ketua Bahagian */}
                  <div className="space-y-3.5 pb-4">
                    <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      3. Ketua Bahagian
                    </h4>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">
                        Select Head of Dept (Pharmacy Logistic)
                      </label>
                      <select
                        onChange={(e) => {
                          const chosen = pharmacyLogisticUsers.find(u => u.full_name === e.target.value)
                          if (chosen) {
                            setPreviewSignatures(prev => ({
                              ...prev,
                              headName: chosen.full_name,
                              headPosition: chosen.jawatan || chosen.role?.role_name || 'Pharmacist'
                            }))
                          }
                        }}
                        value={previewSignatures.headName}
                        className="w-full border border-slate-250 rounded-xl p-2.5 text-xs outline-none bg-surface text-text-secondary focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 transition-colors font-semibold"
                      >
                        <option value="">-- Select Head --</option>
                        {pharmacyLogisticUsers.map(user => (
                          <option key={user.id} value={user.full_name}>
                            {user.full_name} ({user.jawatan || user.role?.role_name || 'Staff'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-text-secondary font-bold uppercase tracking-wider block">Position (Custom)</label>
                      <input 
                        type="text" 
                        value={previewSignatures.headPosition}
                        onChange={(e) => setPreviewSignatures(prev => ({ ...prev, headPosition: e.target.value }))}
                        required
                        className="bg-surface border border-slate-250 text-text-primary focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors text-xs font-semibold rounded-lg outline-none w-full px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex gap-3 mt-6 border-t border-border-subtle pt-5 flex-shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setIsPoPreviewModalOpen(false)}
                    className="flex-1 py-3 border border-border-default hover:bg-subtle/50 text-slate-650 hover:text-text-primary rounded-lg text-xs font-bold transition-colors active:scale-98"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-extrabold shadow-md transition-colors active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print PO
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================
          MODAL 6: MONTHLY CYLINDER CONSOLIDATION WORKSPACE MODAL
         ======================================================== */}
      {isMonthlyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsMonthlyModalOpen(false)}
        >
          <div 
            className="bg-surface rounded-[32px] w-full max-w-4xl max-h-[92vh] shadow-2xl relative border border-border-default flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {(() => {
              const monthlyList = getMonthlyConsolidatedReceptions(receptionsList)
              const activeMonthKey = selectedConsolidateMonthKey || (monthlyList[0]?.monthKey || '')
              const currentMonthRec = monthlyList.find(m => m.monthKey === activeMonthKey) || monthlyList[0]

              return (
                <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border-b border-teal-100 p-6 flex items-start gap-4 flex-shrink-0">
                  <div className={`p-3 text-white rounded-2xl shadow-lg shrink-0 ${currentMonthRec?.is_vie_tank ? 'bg-blue-600 shadow-blue-600/20' : 'bg-teal-600 shadow-teal-600/20'}`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${currentMonthRec?.is_vie_tank ? 'text-blue-700 bg-blue-100/80 border-blue-500/20' : 'text-teal-700 bg-teal-100/80 border-accent-base/20'}`}>
                        {language === 'ms' ? 'Modul Konsolidasi Dokumen' : 'Document Consolidation Workspace'}
                      </span>
                      <button
                        onClick={() => setIsMonthlyModalOpen(false)}
                        className="text-slate-400 hover:text-text-muted transition-colors p-1.5 rounded-xl hover:bg-surface"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-extrabold text-text-primary mt-1 flex items-center gap-2">
                      {currentMonthRec?.is_vie_tank
                        ? (language === 'ms' ? 'Gabungan Tangki VIE & Dokumen Bulanan' : 'Monthly VIE Tank & Document Consolidation')
                        : (language === 'ms' ? 'Gabungan Silinder & Dokumen Bulanan' : 'Monthly Cylinder & Document Consolidation')}
                      {currentMonthRec?.is_vie_tank ? (
                        <span className="px-2 py-0.5 text-[9px] font-black bg-blue-100 text-blue-700 border border-blue-500/20 rounded-full">
                          💧 TANGKI VIE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-black bg-subtle text-text-secondary border border-border-default rounded-full">
                          🔵 SILINDER
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-text-muted font-medium mt-0.5 leading-relaxed">
                      {currentMonthRec?.is_vie_tank
                        ? (language === 'ms'
                            ? 'Gabungkan semua entri penerimaan Tangki VIE cecair pukal (m³) bagi bulan pilihan menjadi satu PO dan Laporan Audit KEW.PS-3 rasmi.'
                            : 'Combine all bulk liquid VIE Tank receipts (m³) for a chosen month into one official PO and KEW.PS-3 Audit Report.')
                        : (language === 'ms'
                            ? 'Gabungkan semua entri penerimaan silinder bagi bulan pilihan menjadi satu PO dan Laporan Audit KEW.PS-3 rasmi.'
                            : 'Combine all cylinder delivery receipts for a chosen month into one official PO and KEW.PS-3 Audit Report.')}
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Modal Body */}
            {(() => {
              const monthlyList = getMonthlyConsolidatedReceptions(receptionsList)
              const activeMonthKey = selectedConsolidateMonthKey || (monthlyList[0]?.monthKey || '')
              const currentMonthRec = monthlyList.find(m => m.monthKey === activeMonthKey) || monthlyList[0]

              if (!currentMonthRec) {
                return (
                  <div className="p-10 text-center text-text-muted font-semibold italic">
                    {language === 'ms' ? 'Tiada entri penerimaan oksigen untuk digabungkan.' : 'No oxygen reception entries available to consolidate.'}
                  </div>
                )
              }

              return (
                <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                  {/* Month Selection Bar */}
                  <div className="bg-subtle/50 border border-border-default rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-1">
                        {language === 'ms' ? 'PILIH BULAN KONSOLIDASI' : 'SELECT CONSOLIDATION MONTH'}
                      </label>
                      <select
                        value={activeMonthKey}
                        onChange={(e) => setSelectedConsolidateMonthKey(e.target.value)}
                        className="bg-surface border border-border-default text-text-primary font-bold text-sm rounded-xl px-3.5 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-xs"
                      >
                        {monthlyList.map(m => (
                          <option key={m.monthKey} value={m.monthKey}>
                            {m.monthLabel.toUpperCase()} [{m.is_vie_tank ? '💧 VIE' : '🔵 Silinder'}] [Vot {m.vote_code || '080702'}] — ({m.entryCount} {m.entryCount === 1 ? 'Entri' : 'Entri Digabung'} / {fmt(m.total_amount)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-800 bg-teal-100/70 border border-accent-base/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        {currentMonthRec.entryCount} {language === 'ms' ? 'Penghantaran Dikesan' : 'Deliveries Detected'}
                      </span>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-surface border border-border-default rounded-2xl p-3.5 shadow-elevation-1">
                      <span className="text-[9px] font-black text-text-secondary font-bold uppercase tracking-wider block">
                        {language === 'ms' ? 'BIL. PENGHANTARAN' : 'DELIVERY COUNT'}
                      </span>
                      <span className="text-xl font-black text-text-primary mt-1 block">
                        {currentMonthRec.entryCount}
                      </span>
                      <span className="text-[10px] text-teal-600 font-bold">
                        {language === 'ms' ? 'Entri dalam bulan ini' : 'Entries this month'}
                      </span>
                    </div>

                    <div className="bg-surface border border-border-default rounded-2xl p-3.5 shadow-elevation-1">
                      <span className="text-[9px] font-black text-text-secondary font-bold uppercase tracking-wider block">
                        {language === 'ms' ? 'ISIAN SEMULA' : 'REFILL TOTAL'}
                      </span>
                      <span className="text-xl font-black text-text-primary mt-1 block">
                        {fmt(currentMonthRec.refill_amount)}
                      </span>
                      <span className="text-[10px] text-text-muted font-semibold">
                        {language === 'ms' ? 'Perbelanjaan gas' : 'Gas expenditure'}
                      </span>
                    </div>

                    <div className="bg-surface border border-border-default rounded-2xl p-3.5 shadow-elevation-1">
                      <span className="text-[9px] font-black text-text-secondary font-bold uppercase tracking-wider block">
                        {language === 'ms' ? 'CAJ PINJAMAN' : 'LOAN CHARGES'}
                      </span>
                      <span className="text-xl font-black text-purple-700 mt-1 block">
                        {fmt(currentMonthRec.loan_amount)}
                      </span>
                      <span className="text-[10px] text-purple-600 font-semibold">
                        {language === 'ms' ? 'Pinjaman silinder' : 'Cylinder loans'}
                      </span>
                    </div>

                    <div className="bg-teal-900 text-white border border-teal-800 rounded-2xl p-3.5 shadow-sm">
                      <span className="text-[9px] font-black text-teal-300 uppercase tracking-wider block">
                        {language === 'ms' ? 'JUMLAH KESELURUHAN' : 'GRAND TOTAL'}
                      </span>
                      <span className="text-xl font-black text-white mt-1 block">
                        {fmt(currentMonthRec.total_amount)}
                      </span>
                      <span className="text-[10px] text-teal-200 font-semibold">
                        {language === 'ms' ? 'Amaun gabungan PO' : 'Combined PO amount'}
                      </span>
                    </div>
                  </div>

                  {/* Combined DO Reference */}
                  <div className="bg-accent-base/10 border border-teal-100 rounded-2xl p-4">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-widest block mb-1">
                      {language === 'ms' ? 'Nota Serahan (DO) Yang Digabungkan' : 'Consolidated Delivery Orders (DO)'}
                    </span>
                    <p className="font-mono text-xs font-bold text-teal-900 break-words">
                      {currentMonthRec.delivery_order_no || '-'}
                    </p>
                  </div>

                  {/* Individual Entries Table Breakdown */}
                  <div className="border border-border-default rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-subtle/50 border-b border-border-default flex items-center justify-between">
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                        {language === 'ms' ? 'Senarai Entri Penghantaran Individu' : 'Individual Delivery Entries List'}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted">
                        {currentMonthRec.records.length} {language === 'ms' ? 'rekod' : 'records'}
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-subtle text-[9px] font-bold text-text-muted uppercase border-b border-border-default">
                          <tr>
                            <th className="px-4 py-2">{language === 'ms' ? 'TARIKH' : 'DATE'}</th>
                            <th className="px-4 py-2">{language === 'ms' ? 'DO NO.' : 'DO NO.'}</th>
                            <th className="px-4 py-2 text-right">{language === 'ms' ? 'KOS REFILL' : 'REFILL'}</th>
                            <th className="px-4 py-2 text-right">{language === 'ms' ? 'PINJAMAN' : 'LOAN'}</th>
                            <th className="px-4 py-2 text-right">{language === 'ms' ? 'JUMLAH' : 'TOTAL'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-[11px]">
                          {currentMonthRec.records.map((r, idx) => (
                            <tr key={r.id || idx} className="hover:bg-subtle/50">
                              <td className="px-4 py-2 font-semibold text-text-primary">
                                {new Date(r.reception_date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-2 font-mono font-bold text-teal-700">
                                {r.delivery_order_no}
                              </td>
                              <td className="px-4 py-2 text-right font-medium text-text-secondary">
                                {fmt(r.refill_amount)}
                              </td>
                              <td className="px-4 py-2 text-right font-medium text-purple-700">
                                {fmt(r.loan_amount)}
                              </td>
                              <td className="px-4 py-2 text-right font-bold text-slate-950">
                                {fmt(r.total_amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Informational Guidance Callout */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                    <span className="text-amber-600 text-sm">💡</span>
                    <p className="text-[11px] text-amber-400 dark:text-amber-300 font-bold leading-relaxed font-medium">
                      {currentMonthRec.is_vie_tank ? (
                        language === 'ms'
                          ? 'Semua bekalan cecair pukal Tangki VIE (m³) dijumlahkan secara berasingan bagi bulan ini. Tangki VIE dikendalikan khas dan tidak bercampur dengan silinder gas termampat.'
                          : 'All bulk liquid VIE Tank receipts (m³) are consolidated separately for this month. VIE Tank is handled specially and never mixed with compressed gas cylinders.'
                      ) : (
                        language === 'ms'
                          ? 'Semua silinder daripada setiap entri di atas dijumlahkan mengikut saiz silinder (cth: Entri 1 (4 HS) + Entri 2 (2 HS) + Entri 4 (10 HS) = 16 HS Silinder). Satu PO dan satu Laporan KEW.PS-3 rasmi akan dijana bagi keseluruhan bulan ini.'
                          : 'All cylinders across the entries above will be combined by cylinder size (e.g. Entry 1 (4 HS) + Entry 2 (2 HS) + Entry 4 (10 HS) = 16 HS Cylinders). A single PO and KEW.PS-3 Audit Report will be produced for this entire month.'
                      )}
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Modal Footer Controls */}
            {(() => {
              const monthlyList = getMonthlyConsolidatedReceptions(receptionsList)
              const activeMonthKey = selectedConsolidateMonthKey || (monthlyList[0]?.monthKey || '')
              const currentMonthRec = monthlyList.find(m => m.monthKey === activeMonthKey) || monthlyList[0]

              return (
                <div className="p-6 bg-subtle/50 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMonthlyModalOpen(false)}
                    className="w-full sm:w-auto px-5 py-3 border border-border-default hover:bg-surface text-text-secondary font-bold rounded-xl text-xs transition-colors active:scale-95"
                  >
                    {language === 'ms' ? 'Tutup' : 'Close'}
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={!currentMonthRec}
                      onClick={() => {
                        if (currentMonthRec) {
                          handleDownloadReport(currentMonthRec as any)
                        }
                      }}
                      className="flex-1 sm:flex-none px-4 py-3 bg-surface hover:bg-accent-base/10 border border-teal-300 text-teal-800 font-extrabold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-600" />
                      {language === 'ms' ? 'Muat Turun Laporan (KEW.PS-3)' : 'Download Report (KEW.PS-3)'}
                    </button>

                    <button
                      type="button"
                      disabled={!currentMonthRec}
                      onClick={() => {
                        if (currentMonthRec) {
                          setIsMonthlyModalOpen(false)
                          handleOpenPoPreview(currentMonthRec as any)
                        }
                      }}
                      className="flex-1 sm:flex-none px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-colors flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {language === 'ms' ? 'Pratonton & Cetak PO Bulanan' : 'Preview & Print Monthly PO'}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Admin Password Security Challenge Modal for Reset Inventory */}
      {isClearModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-rose-500/20 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-500/10 via-red-500/10 to-rose-500/10 border-b border-rose-100 p-6 flex items-start gap-4">
              <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                    High Risk Operational Action
                  </span>
                  <button
                    onClick={() => setIsClearModalOpen(false)}
                    className="text-slate-400 hover:text-text-muted transition-colors p-1 rounded-lg hover:bg-surface/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base font-extrabold text-text-primary mt-1.5">
                  Pengesahan Pentadbir (Admin Challenge)
                </h3>
                <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
                  Tindakan ini akan menetapkan semula stok silinder kepada 0 dan merekodkan log audit keselamatan.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmClearInventory} className="p-6 space-y-4">
              {clearPasswordError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-in shake duration-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{clearPasswordError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary block">
                  Masukkan Kata Laluan Pentadbir (Admin Password):
                </label>
                <div className="relative">
                  <input
                    type={showClearPassword ? "text" : "password"}
                    value={clearPasswordInput}
                    onChange={(e) => setClearPasswordInput(e.target.value)}
                    placeholder="Masukkan kata laluan..."
                    required
                    autoFocus
                    className="w-full pl-4 pr-10 py-3 bg-subtle/50 border border-border-default rounded-2xl text-text-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClearPassword(!showClearPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-text-muted p-1"
                  >
                    {showClearPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Pengesahan kata laluan pentadbir diperlukan sebelum data stok boleh diset semula.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-border-default hover:bg-subtle/50 text-text-muted font-bold rounded-2xl text-xs transition-colors"
                >
                  Batal (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !clearPasswordInput}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-rose-600/20 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isLoading ? 'Mengosongkan...' : '🔒 Pengesahan & Padam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vote Code Security Override & Audit Log Modal */}
      {isVoteOverrideModalOpen && overrideTargetRecord && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-amber-500/20 rounded-[28px] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-orange-50/20 border-b border-amber-100 p-6 flex items-start gap-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-500/20 shadow-xs shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    {language === 'ms' ? 'KAWALAN KESELAMATAN & AUDIT' : 'SECURITY CONTROL & AUDIT'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsVoteOverrideModalOpen(false)}
                    className="text-slate-400 hover:text-text-muted transition-colors p-1 rounded-lg hover:bg-surface/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base font-extrabold text-text-primary mt-1.5">
                  {language === 'ms' ? 'Kebenaran Pertukaran Kod Vot' : 'Vote Code Override Authorization'}
                </h3>
                <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
                  {language === 'ms' 
                    ? `Pertukaran Kod Vot untuk Pesanan (DO) ${overrideTargetRecord.delivery_order_no || '-'} adalah terkawal dan direkodkan dalam log audit KKM.` 
                    : `Changing Vote Code for Delivery Order ${overrideTargetRecord.delivery_order_no || '-'} is controlled and logged in KKM audit logs.`}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitVoteOverride} className="p-6 space-y-4">
              {overrideError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{overrideError}</span>
                </div>
              )}

              {/* Current vs New Vote Selection */}
              <div className="bg-subtle/50 border border-border-default rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-bold">{language === 'ms' ? 'Kod Vot Semasa:' : 'Current Vote Code:'}</span>
                  <span className="font-mono font-black text-text-primary bg-surface px-2 py-0.5 rounded border border-border-default">
                    Vot {overrideTargetRecord.vote_code || '080702'}
                  </span>
                </div>
                <div className="pt-2 border-t border-border-default space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    {language === 'ms' ? 'Pilih Kod Vot Baru (Sasaran) *' : 'Select New Vote Code *'}
                  </label>
                  <select
                    value={overrideSelectedVoteCode}
                    onChange={(e) => {
                      const newCode = e.target.value
                      setOverrideSelectedVoteCode(newCode)
                      const act = financials?.by_vote_code?.[newCode]?.vote_activity || '27402'
                      setOverrideSelectedVoteActivity(act)
                    }}
                    className="w-full bg-surface border border-border-default rounded-xl px-3 py-2 text-xs font-mono font-black text-text-primary outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  >
                    {availableVoteCodes.map(code => {
                      const codeFin = financials?.by_vote_code?.[code]
                      const bal = codeFin ? codeFin.current_balance : (code === '080702' ? (financials?.current_balance ?? 0) : 0)
                      const labelSuffix = code === '080702' ? '(CC)' : code === '080600' ? '(Duit Khas)' : ''
                      return (
                        <option key={code} value={code}>
                          Vot {code} {labelSuffix} — Baki: {fmt(bal)}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              {/* Security Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider block flex items-center justify-between">
                  <span>{language === 'ms' ? 'Kata Laluan Keselamatan Farmasi *' : 'Pharmacy Security Password *'}</span>
                  <span className="text-[9px] text-amber-700 font-mono font-bold">(F@rmasi.2016)</span>
                </label>
                <div className="relative">
                  <input
                    type={showOverridePassword ? 'text' : 'password'}
                    value={overridePasswordInput}
                    onChange={(e) => setOverridePasswordInput(e.target.value)}
                    placeholder='Masukkan kata laluan F@rmasi.2016...'
                    required
                    className="w-full bg-surface border border-border-default rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono font-semibold text-text-primary outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOverridePassword(!showOverridePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text-muted p-0.5"
                  >
                    {showOverridePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Audit Log Reason Textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider block">
                  {language === 'ms' ? 'Sebab / Justifikasi Pertukaran (Log Audit KKM) *' : 'Reason / Justification for Override (Audit Log) *'}
                </label>
                <textarea
                  value={overrideReasonInput}
                  onChange={(e) => setOverrideReasonInput(e.target.value)}
                  rows={3}
                  placeholder={language === 'ms' 
                    ? 'Nyatakan sebab pertukaran (cth: Pembetulan peruntukan atas arahan Ketua Pegawai Farmasi / Memo pertukaran...)' 
                    : 'State justification (e.g. Allocation adjustment as directed by Head of Pharmacy...)'}
                  required
                  className="w-full bg-surface border border-border-default rounded-xl p-3 text-xs text-text-primary font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none leading-relaxed"
                />
                <span className="text-[9px] text-slate-400 font-medium block">
                  {language === 'ms' 
                    ? 'ℹ️ Sebab ini akan disimpan secara rasmi dalam jadual audit_logs bersama ID pengguna dan cap masa.' 
                    : 'ℹ️ This reason is recorded in audit_logs with your user ID and timestamp.'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsVoteOverrideModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-border-default text-text-muted hover:bg-subtle/50 font-bold rounded-xl text-xs transition-colors active:scale-95"
                >
                  {language === 'ms' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={overrideIsSubmitting || !overridePasswordInput || !overrideReasonInput}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold rounded-xl text-xs shadow-md shadow-amber-600/20 transition-colors active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {overrideIsSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'ms' ? 'Mengesahkan...' : 'Authorizing...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'ms' ? 'Sahkan & Simpan Audit' : 'Authorize & Save'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DELETE CYLINDER CONFIRMATION (SINGLE & BULK)
         ======================================================== */}
      {deleteCylinderTarget && (
        <DeleteCylinderModal
          isOpen={!!deleteCylinderTarget}
          cylinders={deleteCylinderTarget}
          onClose={() => setDeleteCylinderTarget(null)}
          onConfirm={handleConfirmDeleteCylinders}
          isDeleting={isDeletingCylinder}
        />
      )}

      {/* ========================================================
          MODAL: EDIT CYLINDER DETAILS (SERIAL, SIZE, VALVE)
         ======================================================== */}
      {editingCylinderTarget && (
        <EditCylinderModal
          isOpen={!!editingCylinderTarget}
          cylinder={editingCylinderTarget}
          onClose={() => setEditingCylinderTarget(null)}
          onSuccess={handleEditCylinderSuccess}
          hospitalId={hospitalId}
        />
      )}
      {/* Mobile Floating Action Button (FAB) for fast action */}
      {currentPath === '/pharmacy/oxygen/consumption' && (
        <div className="sm:hidden">
          <Fab
            onClick={() => {
              setUnitModalInitialMode('internal')
              setUnitModalLockMode(true)
              setIsUnitModalOpen(true)
            }}
            ariaLabel="Request Cylinders"
          />
        </div>
      )}
    </div>
  )
}

export default OxygenDashboardPage

