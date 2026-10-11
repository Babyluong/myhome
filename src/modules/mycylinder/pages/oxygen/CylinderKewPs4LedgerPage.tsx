// @ts-nocheck
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  Calendar, 
  TrendingUp, 
  User, 
  MapPin, 
  Clock, 
  Printer, 
  Layers, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Download,
  Filter,
  Building2,
  PackageCheck,
  PackageMinus,
  Building,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  QrCode,
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  PlusCircle,
  MinusCircle,
  Package,
  Tag,
  Truck,
  Hash,
  Sparkles,
  Lock,
  Pencil,
  ClipboardCheck,
  History,
  RotateCcw,
  Trash2,
  FastForward,
  ShieldCheck,
  Scale,
  FileCheck,
  CheckCheck,
  AirVent,
  Activity,
  Boxes,
  Database
} from 'lucide-react'
import jsQR from 'jsqr'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Table, Spinner, Input, Badge, Select, Button, Modal } from '@/components/ui'
import { ROUTES } from '@/shared/constants/routes'
import { JATA_NEGARA_BASE64 } from '@/modules/mytransporter/pages/jataNegaraBase64'
import { 
  getCylinderLedgerItems,
  getCylinderTransactions,
  recordCylinderReceiptTransaction,
  recordCylinderIssueTransaction,
  recordCylinderCheckFoundTransaction,
  recordCylinderBringForwardTransaction,
  recordCylinderStoreVerification,
  getCylinderStoreVerificationHistory,
  deleteCylinderStoreVerificationRecord,
  getCylinderDepartmentBreakdown,
  clearCylinderTransactions,
  type CylinderLedgerItem,
  type CylinderTransactionRow,
  type CylinderDeptBreakdown,
  type CylinderStoreVerificationRecord,
  CYLINDER_STANDARD_PRICES
} from '../../services/cylinderKewPs4Service'

const DEFAULT_GAS_SUPPLIERS = [
  { id: 'sup-gas-001', company_name: 'Linde EOX Sdn Bhd (Caw. Miri)', supplier_code: 'SUP-LINDE-01' },
  { id: 'sup-gas-002', company_name: 'Borneo Indah Sdn Bhd', supplier_code: 'SUP-BORNEO-02' },
  { id: 'sup-gas-003', company_name: 'Smart Gas & Engineering Sdn Bhd', supplier_code: 'SUP-SMARTGAS-03' },
  { id: 'sup-gas-004', company_name: 'Air Products Malaysia Sdn Bhd', supplier_code: 'SUP-AIRPROD-04' },
  { id: 'sup-gas-005', company_name: 'Southern Oxygen Sdn Bhd', supplier_code: 'SUP-SOXY-05' }
]

const CLINICAL_WARM_DEPARTMENTS = [
  'Emergency & Trauma Dept (ETD)',
  'Intensive Care Unit (ICU)',
  'Dewan Bedah (Operation Theater)',
  'Wad Lelaki (General Ward)',
  'Wad Perempuan & Bersalin',
  'Wad Pediatrik (Kanak-kanak)',
  'Klinik Rawatan Harian (Daycare)',
  'Klinik Kesihatan Lawas (Zon Luar)',
  'Klinik Kesihatan Sundar',
  'Klinik Kesihatan Merapok',
  'Unit Hemodialisis',
  'Bilik Isolasi Bertekanan Negatif'
]

export const CylinderKewPs4LedgerPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { language } = useLanguage()
  const hospitalId = user?.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'

  // Data states
  const [cylinderItems, setCylinderItems] = useState<CylinderLedgerItem[]>([])
  const [selectedSizeId, setSelectedSizeId] = useState<string>('')
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<CylinderLedgerItem | null>(null)
  const [ledgerRows, setLedgerRows] = useState<CylinderTransactionRow[]>([])
  const [deptBreakdown, setDeptBreakdown] = useState<CylinderDeptBreakdown[]>([])
  const [storeVerificationLogs, setStoreVerificationLogs] = useState<CylinderStoreVerificationRecord[]>([])

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [activeDatePreset, setActiveDatePreset] = useState<'today' | 'week' | 'month' | '3months' | 'all'>('all')
  const [selectedTxType, setSelectedTxType] = useState<string>('all')
  const [selectedWard, setSelectedWard] = useState<string>('all')
  const [refSearch, setRefSearch] = useState<string>('')

  // UI Loading States
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Mobile responsive UI states
  const [mobileTab, setMobileTab] = useState<'ledger' | 'summary' | 'departments'>('ledger')
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState<boolean>(false)

  // Check & Found Modal State (Semakan & Penemuan)
  const [isCheckFoundModalOpen, setIsCheckFoundModalOpen] = useState(false)
  const [checkFoundPhysicalQty, setCheckFoundPhysicalQty] = useState('')
  const [checkFoundDate, setCheckFoundDate] = useState(() => new Date().toISOString().split('T')[0])
  const [checkFoundOfficer, setCheckFoundOfficer] = useState('')
  const [checkFoundRemarks, setCheckFoundRemarks] = useState('')
  const [isSubmittingCheckFound, setIsSubmittingCheckFound] = useState(false)
  const [checkFoundStatus, setCheckFoundStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Bring Forward Modal State (Bawa Ke Hadapan)
  const [isBringForwardModalOpen, setIsBringForwardModalOpen] = useState(false)
  const [bfQty, setBfQty] = useState('')
  const [bfPeriodType, setBfPeriodType] = useState<'previous_year' | 'previous_month' | 'initial_balance'>('previous_year')
  const [bfRefNum, setBfRefNum] = useState('')
  const [bfDate, setBfDate] = useState(() => new Date().toISOString().split('T')[0])
  const [bfOfficer, setBfOfficer] = useState('')
  const [bfRemarks, setBfRemarks] = useState('')
  const [isSubmittingBf, setIsSubmittingBf] = useState(false)
  const [bfStatus, setBfStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Store Verification Modal State (KEW.PS-14 Verifikasi Stor Tahunan)
  const [isStoreVerificationModalOpen, setIsStoreVerificationModalOpen] = useState(false)
  const [verificationYear, setVerificationYear] = useState<number>(() => new Date().getFullYear())
  const [verificationPhysicalCount, setVerificationPhysicalCount] = useState<string>('')
  const [verificationVerifierName, setVerificationVerifierName] = useState<string>('')
  const [verificationVerifierIc, setVerificationVerifierIc] = useState<string>('')
  const [verificationVerifierJawatan, setVerificationVerifierJawatan] = useState<string>('Pegawai Farmasi Kanan (Penguatkuasa Luar)')
  const [verificationDate, setVerificationDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [verificationRemarks, setVerificationRemarks] = useState<string>('')
  const [isVerificationCertified, setIsVerificationCertified] = useState<boolean>(false)
  const [isSubmittingVerification, setIsSubmittingVerification] = useState<boolean>(false)
  const [verificationStatus, setVerificationStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isVerificationHistoryModalOpen, setIsVerificationHistoryModalOpen] = useState(false)

  // Reset & Clear Ledger State
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [clearPasswordInput, setClearPasswordInput] = useState('')
  const [clearScope, setClearScope] = useState<'selected' | 'all'>('selected')
  const [isSubmittingClear, setIsSubmittingClear] = useState(false)
  const [clearStatus, setClearStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // QR Scanner Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [qrScanResult, setQrScanResult] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Load catalog items on mount
  const loadCatalog = async () => {
    setIsLoadingCatalog(true)
    const res = await getCylinderLedgerItems(hospitalId)
    if (res.data && res.data.length > 0) {
      setCylinderItems(res.data)
      const querySize = searchParams.get('sizeId')
      const queryType = searchParams.get('typeId')
      const target = querySize
        ? (res.data.find(i => 
            (i.id === querySize || 
            i.size_id === querySize || 
            i.item_code?.toLowerCase() === querySize.toLowerCase() ||
            (querySize === 'size-004' && i.item_code === '101-N') ||
            (querySize === 'size-003' && i.item_code === '101-F') ||
            (querySize === 'size-002' && i.item_code === 'P101-E') ||
            (querySize === 'size-001' && i.item_code === 'P101-D')) &&
            (!queryType || i.type_id === queryType)
          ) || res.data[0])
        : (res.data.find(i => (selectedItemId && i.id === selectedItemId) || (selectedSizeId && i.size_id === selectedSizeId && (!selectedItem?.type_id || i.type_id === selectedItem.type_id)) || i.item_code === '101-N') || res.data[0])

      if (target) {
        setSelectedItemId(target.id)
        setSelectedSizeId(target.size_id || target.id)
        setSelectedItem(target)
      }
      if (searchParams.get('action') === 'check_found') {
        setIsCheckFoundModalOpen(true)
      }
    }
    setIsLoadingCatalog(false)
  }

  useEffect(() => {
    loadCatalog()
  }, [hospitalId])

  // Load ledger details whenever selected size or filters change
  const loadLedgerDetails = async () => {
    const targetSize = selectedItem?.size_id || selectedSizeId
    if (!targetSize) return
    setIsLoadingDetails(true)

    const [txRes, deptRes, verRes] = await Promise.all([
      getCylinderTransactions(hospitalId, {
        sizeId: targetSize,
        typeId: selectedItem?.type_id,
        comboId: selectedItem?.id,
        transaction_type: selectedTxType,
        date_from: dateFrom,
        date_to: dateTo,
        search_query: refSearch,
        ward_name: selectedWard
      }),
      getCylinderDepartmentBreakdown(hospitalId, targetSize, dateFrom, dateTo, selectedItem?.type_id),
      getCylinderStoreVerificationHistory(hospitalId, targetSize, selectedItem?.type_id)
    ])

    if (txRes.data) {
      setLedgerRows(txRes.data)
    }
    if (deptRes.data) {
      setDeptBreakdown(deptRes.data)
    }
    if (verRes.data) {
      setStoreVerificationLogs(verRes.data)
    }

    setIsLoadingDetails(false)
  }

  useEffect(() => {
    if (selectedSizeId || selectedItemId) {
      loadLedgerDetails()
    }
  }, [selectedItemId, selectedSizeId, selectedItem?.type_id, selectedTxType, dateFrom, dateTo, refSearch, selectedWard, hospitalId])

  // Handle Size Selection
  const handleSelectSize = (item: CylinderLedgerItem) => {
    setSelectedItemId(item.id)
    setSelectedSizeId(item.size_id || item.id)
    setSelectedItem(item)
    setIsMobileSearchExpanded(false)
  }

  // Date Preset Helpers
  const applyDatePreset = (preset: 'today' | 'week' | 'month' | '3months' | 'all') => {
    setActiveDatePreset(preset)
    const now = new Date()
    const toStr = now.toISOString().split('T')[0]
    setDateTo(toStr)

    if (preset === 'today') {
      setDateFrom(toStr)
    } else if (preset === 'week') {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      setDateFrom(d.toISOString().split('T')[0])
    } else if (preset === 'month') {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      setDateFrom(d.toISOString().split('T')[0])
    } else if (preset === '3months') {
      const d = new Date()
      d.setMonth(d.getMonth() - 3)
      setDateFrom(d.toISOString().split('T')[0])
    } else {
      setDateFrom('')
      setDateTo('')
    }
  }

  // Stock Balance Calculations
  const currentStockBalance = useMemo(() => {
    if (ledgerRows && ledgerRows.length > 0) {
      return ledgerRows[0].runningBalance
    }
    return selectedItem?.current_stock || 0
  }, [ledgerRows, selectedItem])

  const stockPercentage = useMemo(() => {
    if (!selectedItem) return 0
    const max = selectedItem.max_stock || 100
    return Math.min(Math.round((currentStockBalance / max) * 100), 100)
  }, [selectedItem, currentStockBalance])

  const isLowStock = useMemo(() => {
    if (!selectedItem) return false
    return currentStockBalance <= (selectedItem.min_stock || 0)
  }, [selectedItem, currentStockBalance])

  // Filter items in catalog search
  const filteredCatalogItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return cylinderItems
    return cylinderItems.filter(item =>
      item.item_code.toLowerCase().includes(q) ||
      item.item_name.toLowerCase().includes(q) ||
      item.gas_type.toLowerCase().includes(q)
    )
  }, [cylinderItems, searchQuery])

  // Total fleet metrics
  const totalFleetCount = useMemo(() => {
    return cylinderItems.reduce((sum, item) => sum + (item.total_fleet || 0), 0)
  }, [cylinderItems])

  const totalFullCentral = useMemo(() => {
    return cylinderItems.reduce((sum, item) => sum + (item.current_stock || 0), 0)
  }, [cylinderItems])

  const totalInUseWards = useMemo(() => {
    return cylinderItems.reduce((sum, item) => sum + (item.in_use_stock || 0), 0)
  }, [cylinderItems])

  const lowStockAlertCount = useMemo(() => {
    return cylinderItems.filter(i => i.current_stock <= (i.min_stock || 0)).length
  }, [cylinderItems])

  // Unit price helper for cylinder valuation (defaults to standard price by code or 117.20)
  const unitPrice = useMemo(() => {
    if (!selectedItem) return 117.20
    const p = Number((selectedItem as any).unit_price || (selectedItem as any).price || (selectedItem as any).refill_price)
    if (!isNaN(p) && p > 0) return p
    const code = selectedItem.item_code
    return CYLINDER_STANDARD_PRICES[code] || 117.20
  }, [selectedItem])

  const recorderName = useMemo(() => {
    return user?.full_name || user?.name || 'AMRI AMIT'
  }, [user])

  const userDepartmentName = useMemo(() => {
    return user?.department?.department_name || (user as any)?.department_name || 'Unit Farmasi Logistik / Stor Gas Perubatan'
  }, [user])

  const totalReceived = useMemo(() => {
    if (ledgerRows && ledgerRows.length > 0) {
      return ledgerRows.reduce((sum, r) => sum + (r.receiptQty || 0), 0)
    }
    return 0
  }, [ledgerRows])

  const totalIssued = useMemo(() => {
    if (ledgerRows && ledgerRows.length > 0) {
      return ledgerRows.reduce((sum, r) => sum + (r.issueQty || 0), 0)
    }
    return 0
  }, [ledgerRows])

  const issuePercentage = useMemo(() => {
    if (totalReceived > 0) {
      return Math.min(100, Math.round((totalIssued / totalReceived) * 100))
    }
    return totalIssued > 0 ? 100 : 0
  }, [totalReceived, totalIssued])

  // Annual stock parameters (separated per year, e.g. 2026, 2025)
  const annualStockLevels = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const prevYear = currentYear - 1

    const minQty = selectedItem?.min_stock || 20
    const bufferQty = (selectedItem as any)?.buffer_stock ?? Math.round(minQty * 0.5)
    const maxQty = selectedItem?.max_stock || 100

    return [
      { year: currentYear, min: minQty, buffer: bufferQty, max: maxQty },
      { year: prevYear, min: minQty, buffer: bufferQty, max: maxQty }
    ]
  }, [selectedItem])

  // Compute quarterly cylinder movement summary (Q1, Q2, Q3, Q4) for current year and previous year
  const quarterlySummary = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const prevYear = currentYear - 1

    const initYearStructure = (year: number) => ({
      year,
      q1: { receiptQty: 0, receiptVal: 0, issueQty: 0, issueVal: 0 },
      q2: { receiptQty: 0, receiptVal: 0, issueQty: 0, issueVal: 0 },
      q3: { receiptQty: 0, receiptVal: 0, issueQty: 0, issueVal: 0 },
      q4: { receiptQty: 0, receiptVal: 0, issueQty: 0, issueVal: 0 },
      total: { receiptQty: 0, receiptVal: 0, issueQty: 0, issueVal: 0 }
    })

    const yearsData: Record<number, ReturnType<typeof initYearStructure>> = {
      [prevYear]: initYearStructure(prevYear),
      [currentYear]: initYearStructure(currentYear)
    }

    ledgerRows.forEach(row => {
      const dt = new Date(row.transaction_date || row.created_at)
      if (isNaN(dt.getTime())) return

      const y = dt.getFullYear()
      if (!yearsData[y]) {
        yearsData[y] = initYearStructure(y)
      }

      const month = dt.getMonth() // 0-11
      let qKey: 'q1' | 'q2' | 'q3' | 'q4' = 'q1'
      if (month >= 0 && month <= 2) qKey = 'q1'
      else if (month >= 3 && month <= 5) qKey = 'q2'
      else if (month >= 6 && month <= 8) qKey = 'q3'
      else qKey = 'q4'

      const rQty = Number(row.receiptQty) || 0
      const iQty = Number(row.issueQty) || 0
      const rVal = rQty * unitPrice
      const iVal = iQty * unitPrice

      yearsData[y][qKey].receiptQty += rQty
      yearsData[y][qKey].receiptVal += rVal
      yearsData[y][qKey].issueQty += iQty
      yearsData[y][qKey].issueVal += iVal

      yearsData[y].total.receiptQty += rQty
      yearsData[y].total.receiptVal += rVal
      yearsData[y].total.issueQty += iQty
      yearsData[y].total.issueVal += iVal
    })

    return Object.values(yearsData).sort((a, b) => b.year - a.year)
  }, [ledgerRows, unitPrice])

  const sanitizeSupplierName = (str: string) => {
    if (!str) return ''
    return str
      .replace(/pharmaniaga\s+lifescience\s*(sdn\s*bhd)?/gi, 'PHARMANIAGA LOGISTICS SDN BHD')
      .replace(/linde\s+eox\s*(sdn\s*bhd)?/gi, 'LINDE EOX SDN BHD (CAW. MIRI)')
  }

  const resolveRecipientName = (row: CylinderTransactionRow) => {
    if (row.transaction_type === 'check_found') {
      return 'Semakan Stok Fizikal (Audit)'
    }
    if (row.transaction_type === 'store_verification') {
      return 'Verifikasi Stor Tahunan (Pegawai Luar)'
    }
    if (row.transaction_type === 'bring_forward') {
      return 'Balance Brought Forward (Official Opening Balance)'
    }
    if (row.source_destination) {
      return sanitizeSupplierName(row.source_destination)
    }
    if (row.receiptQty !== null && row.receiptQty !== undefined) {
      return 'LINDE EOX SDN BHD (CAW. MIRI)'
    }
    return 'Unit / Wad Klinikal'
  }

  const formatTransactionRemarks = (row: CylinderTransactionRow) => {
    const raw = row.remarks || ''
    if (row.transaction_type === 'issue' && /(?:pending(?:\s+to\s+issue)?|waiting\s+stock|menunggu\s+stok)/i.test(raw)) {
      return `Pengeluaran silinder gas ke ${resolveRecipientName(row)}`
    }
    if (!raw) return '—'
    return sanitizeSupplierName(raw)
  }

  const resolveRecorderName = (officerName?: string) => {
    if (officerName && officerName !== 'Pegawai Stor' && officerName !== 'Pegawai Stor Farmasi') {
      return officerName
    }
    return user?.full_name || 'AMRI AMIT'
  }

  const formatReferenceNumber = (row: CylinderTransactionRow) => {
    const rawNum = row.transaction_number || ''
    if (!rawNum || rawNum === '—') {
      return row.transaction_type === 'store_verification'
        ? 'VER-STR-2026-0001'
        : row.transaction_type === 'receipt'
        ? 'GRN-SUP-2026-0001'
        : row.transaction_type === 'bring_forward'
        ? 'BF-2026/01'
        : row.transaction_type === 'check_found'
        ? 'CHK-FND-2026-0001'
        : row.transaction_type === 'return'
        ? 'RET-CYL-2026-0001'
        : 'ISS-DEPT-2026-0001'
    }
    if (rawNum.startsWith('TXN-')) {
      const parts = rawNum.split('-')
      const lastDigits = parts[parts.length - 1] || '0001'
      if (row.transaction_type === 'store_verification') {
        return `VER-STR-2026-${lastDigits}`
      }
      if (row.transaction_type === 'check_found') {
        return `CHK-FND-2026-${lastDigits}`
      }
      if (row.receiptQty !== null) {
        return `GRN-SUP-2026-${lastDigits}`
      } else {
        return `ISS-DEPT-2026-${lastDigits}`
      }
    }
    return rawNum
  }

  // Summary log of receipts and issuances grouped by entity (Supplier / Department / Ward)
  const movementLogSummary = useMemo(() => {
    const map: Record<string, { name: string; totalReceived: number; totalIssued: number }> = {}

    ledgerRows.forEach(row => {
      const name = resolveRecipientName(row)
      if (!map[name]) {
        map[name] = { name, totalReceived: 0, totalIssued: 0 }
      }
      if (row.receiptQty !== null && row.receiptQty !== undefined) {
        map[name].totalReceived += Number(row.receiptQty) || 0
      }
      if (row.issueQty !== null && row.issueQty !== undefined) {
        map[name].totalIssued += Number(row.issueQty) || 0
      }
    })

    if (Object.keys(map).length === 0 && deptBreakdown.length > 0) {
      deptBreakdown.forEach(d => {
        const name = d.department_name
        map[name] = { name, totalReceived: 0, totalIssued: d.total_issued || 0 }
      })
    }

    return Object.values(map)
  }, [ledgerRows, deptBreakdown])

  // ==========================================
  // HANDLERS FOR ACTIONS & MODALS
  // ==========================================

  // Open Check & Found Modal
  const openCheckFoundModal = () => {
    const targetQty = selectedItem?.current_stock !== undefined ? selectedItem.current_stock : currentStockBalance
    setCheckFoundPhysicalQty(targetQty.toString())
    setCheckFoundDate(new Date().toISOString().split('T')[0])
    setCheckFoundOfficer(user?.full_name || 'Pegawai Pemeriksa Stor')
    setCheckFoundRemarks('Semakan Kiraan Stok Fizikal Silinder / Audit Dalaman')
    setCheckFoundStatus(null)
    setIsCheckFoundModalOpen(true)
  }

  const handleSubmitCheckFound = async (e: React.FormEvent) => {
    e.preventDefault()
    const physical = parseInt(checkFoundPhysicalQty, 10)
    if (isNaN(physical) || physical < 0) {
      setCheckFoundStatus({ type: 'error', text: 'Please enter a valid physical quantity (≥ 0).' })
      return
    }

    setIsSubmittingCheckFound(true)
    setCheckFoundStatus(null)

    const res = await recordCylinderCheckFoundTransaction(hospitalId, {
      size_id: selectedItem?.size_id || selectedSizeId,
      type_id: selectedItem?.type_id,
      item_code: selectedItem?.item_code,
      item_name: selectedItem?.item_name,
      physical_quantity: physical,
      current_kewps_balance: currentStockBalance,
      officer_name: checkFoundOfficer.trim() || (user?.full_name || 'Pegawai Pemeriksa Stor'),
      check_date: checkFoundDate,
      remarks: checkFoundRemarks.trim() || undefined
    })

    setIsSubmittingCheckFound(false)
    if (res.error) {
      setCheckFoundStatus({ type: 'error', text: res.error })
    } else {
      setCheckFoundStatus({ type: 'success', text: 'Pelarasan semakan fizikal berjaya disimpan dan dikemaskini dalam lejar!' })
      await loadLedgerDetails()
      await loadCatalog()
      setTimeout(() => setIsCheckFoundModalOpen(false), 1200)
    }
  }

  // Open Bring Forward Modal
  const openBringForwardModal = (initialQty?: string) => {
    setBfQty(initialQty || currentStockBalance.toString())
    setBfPeriodType('previous_year')
    setBfRefNum(`BF-${new Date().getFullYear()}/01`)
    setBfDate(new Date().toISOString().split('T')[0])
    setBfOfficer(user?.full_name || 'Pegawai Stor Oksigen')
    setBfRemarks(`Baki bawa ke hadapan bagi silinder saiz ${selectedItem?.item_code || ''}`)
    setBfStatus(null)
    setIsBringForwardModalOpen(true)
  }

  const handleSubmitBringForward = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseInt(bfQty, 10)
    if (isNaN(qty) || qty < 0) {
      setBfStatus({ type: 'error', text: 'Please enter a valid balance quantity (≥ 0).' })
      return
    }

    setIsSubmittingBf(true)
    setBfStatus(null)

    const res = await recordCylinderBringForwardTransaction(hospitalId, {
      size_id: selectedItem?.size_id || selectedSizeId,
      type_id: selectedItem?.type_id,
      item_code: selectedItem?.item_code,
      item_name: selectedItem?.item_name,
      balance_quantity: qty,
      period_type: bfPeriodType,
      ref_number: bfRefNum.trim(),
      bf_date: bfDate,
      officer_name: bfOfficer.trim() || (user?.full_name || 'Pegawai Stor Oksigen'),
      remarks: bfRemarks.trim() || undefined
    })

    setIsSubmittingBf(false)
    if (res.error) {
      setBfStatus({ type: 'error', text: res.error })
    } else {
      setBfStatus({ type: 'success', text: `Baki pembukaan sebanyak ${qty} cylinders successfully recorded in ledger!` })
      await loadLedgerDetails()
      await loadCatalog()
      setTimeout(() => setIsBringForwardModalOpen(false), 1200)
    }
  }

  // Open Store Verification Modal (KEW.PS-14)
  const openStoreVerificationModal = () => {
    setVerificationYear(new Date().getFullYear())
    setVerificationPhysicalCount(currentStockBalance.toString())
    setVerificationVerifierName(user?.full_name || 'Dr. Ahmad Razif (JKN Sarawak)')
    setVerificationVerifierIc('820412-13-5491')
    setVerificationVerifierJawatan('Pegawai Farmasi Kanan (Penguatkuasa Luar)')
    setVerificationDate(new Date().toISOString().split('T')[0])
    setVerificationRemarks('Verifikasi Stor Tahunan Silinder Oksigen mengikut tatacara KEW.PS-14')
    setIsVerificationCertified(false)
    setVerificationStatus(null)
    setIsStoreVerificationModalOpen(true)
  }

  const handleSubmitStoreVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    const phys = parseInt(verificationPhysicalCount, 10)
    if (isNaN(phys) || phys < 0) {
      setVerificationStatus({ type: 'error', text: 'Sila masukkan kuantiti semakan fizikal yang sah.' })
      return
    }
    if (!verificationVerifierName.trim()) {
      setVerificationStatus({ type: 'error', text: 'Sila masukkan Nama Pegawai Pemverifikasi Luar.' })
      return
    }
    if (!isVerificationCertified) {
      setVerificationStatus({ type: 'error', text: 'Sila tandakan pengesahan perakuan sebelum menyimpan.' })
      return
    }

    setIsSubmittingVerification(true)
    setVerificationStatus(null)

    const res = await recordCylinderStoreVerification(hospitalId, {
      size_id: selectedItem?.size_id || selectedSizeId,
      type_id: selectedItem?.type_id,
      item_code: selectedItem?.item_code || '101-N',
      item_name: selectedItem?.item_name || 'Medical Oxygen Cylinder',
      verification_year: verificationYear,
      physical_count: phys,
      kewps_balance: currentStockBalance,
      system_count: currentStockBalance,
      verifier_name: verificationVerifierName.trim(),
      verifier_ic: verificationVerifierIc.trim() || undefined,
      verifier_jawatan: verificationVerifierJawatan.trim() || undefined,
      verified_at: verificationDate,
      remarks: verificationRemarks.trim() || undefined
    })

    setIsSubmittingVerification(false)
    if (res.error) {
      setVerificationStatus({ type: 'error', text: res.error })
    } else {
      setVerificationStatus({ type: 'success', text: `Verifikasi Stor Tahunan ${verificationYear} berjaya disahkan dan direkodkan!` })
      await loadLedgerDetails()
      await loadCatalog()
      setTimeout(() => setIsStoreVerificationModalOpen(false), 1200)
    }
  }

  // Clear / Reset Ledger
  const handleClearLedger = async () => {
    if (clearPasswordInput !== 'home123' && clearPasswordInput !== 'admin123') {
      setClearStatus({ type: 'error', text: 'Kata laluan keselamatan tidak sah.' })
      return
    }

    setIsSubmittingClear(true)
    setClearStatus(null)

    const targetSize = clearScope === 'selected' ? selectedSizeId : 'all'
    const targetType = clearScope === 'selected' ? selectedItem?.type_id : undefined
    const res = await clearCylinderTransactions(hospitalId, targetSize, targetType)

    setIsSubmittingClear(false)
    if (res.error) {
      setClearStatus({ type: 'error', text: res.error })
    } else {
      setClearStatus({ type: 'success', text: 'Lejar berjaya ditetapkan semula.' })
      await loadLedgerDetails()
      await loadCatalog()
      setTimeout(() => setIsClearModalOpen(false), 1000)
    }
  }

  // ==========================================
  // ENHANCED PRINTABLE KEW.PS-4 DOCUMENT GENERATOR (OFFICIAL KKM / TPS PK 2.1)
  // ==========================================
  const handlePrintLedger = () => {
    if (!selectedItem || ledgerRows.length === 0) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const itemCode = selectedItem.item_code
    const itemName = selectedItem.item_name
    const uom = selectedItem.unit_of_measure
    const itemLocationDisplay = selectedItem.location || 'Stor Gas Perubatan Utama (Central Gas Store)'

    const annualStockHtml = annualStockLevels.map(l => `
      <tr>
        <td style="padding: 5px 8px; border: 1px solid #334155; text-align: center; font-weight: bold; background-color: #f8fafc;">${l.year}</td>
        <td style="padding: 5px 8px; border: 1px solid #334155; text-align: center; font-family: monospace; font-weight: bold;">${l.min} ${uom}</td>
        <td style="padding: 5px 8px; border: 1px solid #334155; text-align: center; font-family: monospace; font-weight: bold;">${l.buffer} ${uom}</td>
        <td style="padding: 5px 8px; border: 1px solid #334155; text-align: center; font-family: monospace; font-weight: bold;">${l.max} ${uom}</td>
      </tr>
    `).join('')

    const quarterlySummaryHtml = quarterlySummary.map(yData => `
      <tr>
        <td rowspan="5" style="padding: 5px 8px; border: 1px solid #334155; text-align: center; font-weight: 800; vertical-align: middle; background-color: #f8fafc;">${yData.year}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; font-size: 10.5px;">Suku Pertama (Q1: Jan - Mac)</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; font-weight: bold; color: #15803d;">${yData.q1.receiptQty > 0 ? `+${yData.q1.receiptQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">${yData.q1.receiptVal > 0 ? `RM ${yData.q1.receiptVal.toFixed(2)}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; font-weight: bold; color: #b91c1c;">${yData.q1.issueQty > 0 ? `-${yData.q1.issueQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">${yData.q1.issueVal > 0 ? `RM ${yData.q1.issueVal.toFixed(2)}` : '—'}</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px; border: 1px solid #334155; font-size: 10.5px;">Suku Kedua (Q2: Apr - Jun)</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; font-weight: bold; color: #15803d;">${yData.q2.receiptQty > 0 ? `+${yData.q2.receiptQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">${yData.q2.receiptVal > 0 ? `RM ${yData.q2.receiptVal.toFixed(2)}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; font-weight: bold; color: #b91c1c;">${yData.q2.issueQty > 0 ? `-${yData.q2.issueQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">${yData.q2.issueVal > 0 ? `RM ${yData.q2.issueVal.toFixed(2)}` : '—'}</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px; border: 1px solid #334155; font-size: 10.5px;">Suku Ketiga (Q3: Jul - Sep)</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; font-weight: bold; color: #15803d;">${yData.q3.receiptQty > 0 ? `+${yData.q3.receiptQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">${yData.q3.receiptVal > 0 ? `RM ${yData.q3.receiptVal.toFixed(2)}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; font-weight: bold; color: #b91c1c;">${yData.q3.issueQty > 0 ? `-${yData.q3.issueQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">${yData.q3.issueVal > 0 ? `RM ${yData.q3.issueVal.toFixed(2)}` : '—'}</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px; border: 1px solid #334155; font-size: 10.5px;">Suku Keempat (Q4: Okt - Dis)</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; font-weight: bold; color: #15803d;">${yData.q4.receiptQty > 0 ? `+${yData.q4.receiptQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">${yData.q4.receiptVal > 0 ? `RM ${yData.q4.receiptVal.toFixed(2)}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; font-weight: bold; color: #b91c1c;">${yData.q4.issueQty > 0 ? `-${yData.q4.issueQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">${yData.q4.issueVal > 0 ? `RM ${yData.q4.issueVal.toFixed(2)}` : '—'}</td>
      </tr>
      <tr style="background-color: #f1f5f9; font-weight: bold;">
        <td style="padding: 4px 8px; border: 1px solid #334155; font-size: 10.5px;">Jumlah Keseluruhan Tahun ${yData.year}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; color: #15803d;">${yData.total.receiptQty > 0 ? `+${yData.total.receiptQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">RM ${yData.total.receiptVal.toFixed(2)}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace; color: #b91c1c;">${yData.total.issueQty > 0 ? `-${yData.total.issueQty} ${uom}` : '—'}</td>
        <td style="padding: 4px 8px; border: 1px solid #334155; text-align: right; font-family: monospace;">RM ${yData.total.issueVal.toFixed(2)}</td>
      </tr>
    `).join('')

    const logSummaryHtml = movementLogSummary.map(m => `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #334155; font-size: 11px; font-weight: 600;">${m.name}</td>
        <td style="padding: 6px 10px; border: 1px solid #334155; text-align: right; font-weight: bold; font-size: 11px; color: #15803d;">
          ${m.totalReceived > 0 ? `+${m.totalReceived} ${uom}` : '—'}
        </td>
        <td style="padding: 6px 10px; border: 1px solid #334155; text-align: right; font-weight: bold; font-size: 11px; color: #b91c1c;">
          ${m.totalIssued > 0 ? `-${m.totalIssued} ${uom}` : '—'}
        </td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KEW.PS-4 Kad Petak - ${itemCode} - Hospital Lawas</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 12mm 12mm 12mm;
            }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 0;
              color: #0f172a;
              font-size: 11px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .gov-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 10px;
              margin-bottom: 14px;
            }
            .gov-brand {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .jata-logo {
              height: 65px;
              width: auto;
              object-fit: contain;
            }
            .gov-titles {
              display: flex;
              flex-direction: column;
            }
            .kkm-title {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .hosp-title {
              font-size: 11px;
              font-weight: 700;
              color: #1e293b;
              text-transform: uppercase;
              margin-top: 1px;
            }
            .sub-title {
              font-size: 8.5px;
              color: #475569;
              margin-top: 2px;
              font-style: italic;
            }
            .doc-badge {
              text-align: right;
            }
            .kewps-box {
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
              background-color: #f1f5f9;
              padding: 6px 14px;
              border: 1.5px solid #0f172a;
              border-radius: 4px;
              display: inline-block;
              letter-spacing: 0.5px;
            }
            .kewps-sub {
              font-size: 10px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 3px;
              text-transform: uppercase;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
            }
            .meta-table td {
              border: 1px solid #334155;
              padding: 5px 8px;
              font-size: 10.5px;
            }
            .meta-label {
              font-weight: 700;
              background-color: #f8fafc;
              color: #334155;
            }
            .meta-val {
              font-weight: 600;
              color: #0f172a;
            }
            .kpi-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
            }
            .kpi-table td {
              border: 1px solid #cbd5e1;
              padding: 8px;
              text-align: center;
              background-color: #f8fafc;
            }
            .kpi-title {
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .kpi-num {
              font-size: 14px;
              font-weight: 800;
              margin-top: 3px;
              font-family: monospace;
            }
            .section-header {
              font-weight: 800;
              font-size: 11px;
              margin-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .page-break {
              page-break-before: always;
              break-before: page;
              margin-top: 0 !important;
              padding-top: 8px;
            }

            .ledger-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .ledger-table th {
              background-color: #e2e8f0;
              border: 1px solid #334155;
              padding: 6px 6px;
              font-size: 9.5px;
              font-weight: 800;
              text-transform: uppercase;
              text-align: center;
              color: #0f172a;
            }
            .ledger-table td {
              border: 1px solid #334155;
              padding: 5px 6px;
              font-size: 9.5px;
              text-align: left;
            }
            .dept-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
            }
            .dept-table th {
              background-color: #f1f5f9;
              border: 1px solid #334155;
              padding: 5px 8px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .mono { font-family: monospace; font-weight: 700; }
            .sig-container {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sig-box {
              width: 46%;
              border: 1px solid #334155;
              padding: 10px;
              border-radius: 4px;
              background-color: #fafafa;
              font-size: 10px;
            }
            .sig-line {
              margin-top: 35px;
              border-top: 1px dashed #334155;
              padding-top: 4px;
            }
            .footer-note {
              margin-top: 20px;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              font-size: 8px;
              color: #64748b;
              text-align: center;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <!-- Government Letterhead Header with Jata Negara -->
          <div class="gov-header">
            <div class="gov-brand">
              <img src="${JATA_NEGARA_BASE64}" class="jata-logo" alt="Jata Negara Malaysia" />
              <div class="gov-titles">
                <span class="kkm-title">KEMENTERIAN KESIHATAN MALAYSIA</span>
                <span class="hosp-title">HOSPITAL LAWAS, SARAWAK</span>
                <span class="sub-title">Tatacara Pengurusan Stor Perbendaharaan (Pekeliling Perbendaharaan PK 2.1)</span>
              </div>
            </div>
            <div class="doc-badge">
              <div class="kewps-box">KEW.PS-4</div>
              <div class="kewps-sub">KAD PETAK</div>
            </div>
          </div>

          <!-- Item Metadata Table -->
          <table class="meta-table">
            <tr>
              <td width="15%" class="meta-label">Perihal Stok:</td>
              <td width="45%" class="meta-val" style="font-size: 11px; font-weight: 800;">${itemName}</td>
              <td width="15%" class="meta-label">No. Kod Stok:</td>
              <td width="25%" class="meta-val mono" style="font-size: 11px; color: #1e3a8a;">${itemCode}</td>
            </tr>
            <tr>
              <td class="meta-label">Unit Pengukuran:</td>
              <td class="meta-val">${uom}</td>
              <td class="meta-label">Lokasi Item:</td>
              <td class="meta-val" style="font-weight: 700; color: #0369a1;">${itemLocationDisplay}</td>
            </tr>
            <tr>
              <td class="meta-label">Tempoh Laporan:</td>
              <td class="meta-val">${dateFrom || 'Awal'} hingga ${dateTo || 'Kini'}</td>
              <td class="meta-label">Harga Seunit (RM):</td>
              <td class="meta-val mono">RM ${unitPrice.toFixed(2)} / ${uom}</td>
            </tr>
          </table>

          <!-- Paras Stok Tahunan -->
          <div class="section-header">PARAS STOK TAHUNAN:</div>
          <table class="dept-table" style="margin-bottom: 14px;">
            <thead>
              <tr>
                <th width="25%" style="text-align: center;">TAHUN</th>
                <th width="25%" style="text-align: center;">STOK MIN</th>
                <th width="25%" style="text-align: center;">STOK BUFFER (TAMBAHAN)</th>
                <th width="25%" style="text-align: center;">STOK MAX</th>
              </tr>
            </thead>
            <tbody>
              ${annualStockHtml}
            </tbody>
          </table>

          <!-- Rekod Terimaan Dan Pengeluaran Suku Tahun -->
          <div class="section-header">REKOD TERIMAAN DAN PENGELUARAN SUKU TAHUN:</div>
          <table class="dept-table" style="margin-bottom: 14px;">
            <thead>
              <tr>
                <th rowspan="2" width="12%" style="text-align: center; vertical-align: middle;">TAHUN</th>
                <th rowspan="2" width="28%" style="vertical-align: middle;">SUKU TAHUN</th>
                <th colspan="2" width="30%" style="text-align: center; background-color: #dcfce7; border-bottom: 1px solid #16a34a;">DITERIMA</th>
                <th colspan="2" width="30%" style="text-align: center; background-color: #ffe4e6; border-bottom: 1px solid #e11d48;">DIKELUARKAN</th>
              </tr>
              <tr>
                <th style="text-align: right; background-color: #f0fdf4;">Kuantiti</th>
                <th style="text-align: right; background-color: #f0fdf4;">Nilai (RM)</th>
                <th style="text-align: right; background-color: #fff1f2;">Kuantiti</th>
                <th style="text-align: right; background-color: #fff1f2;">Nilai (RM)</th>
              </tr>
            </thead>
            <tbody>
              ${quarterlySummaryHtml}
            </tbody>
          </table>

          <!-- Movement Summary Strip -->
          <table class="kpi-table">
            <tr>
              <td width="25%">
                <div class="kpi-title" style="color: #475569;">CURRENT BALANCE</div>
                <div class="kpi-num" style="color: #0f172a;">${currentStockBalance} ${uom}</div>
              </td>
              <td width="25%">
                <div class="kpi-title" style="color: #166534;">JUMLAH DITERIMA</div>
                <div class="kpi-num" style="color: #15803d;">+${totalReceived} ${uom}</div>
              </td>
              <td width="25%">
                <div class="kpi-title" style="color: #991b1b;">JUMLAH DIKELUARKAN</div>
                <div class="kpi-num" style="color: #b91c1c;">-${totalIssued} ${uom}</div>
              </td>
              <td width="25%">
                <div class="kpi-title" style="color: #3730a3;">% PENGELUARAN</div>
                <div class="kpi-num" style="color: #4338ca;">${issuePercentage}%</div>
              </td>
            </tr>
          </table>

          <!-- Log Penerimaan Dan Pengeluaran (Rekod Mengikut Jabatan / Pembekal) -->
          ${movementLogSummary.length > 0 ? `
            <div class="section-header">LOG PENERIMAAN DAN PENGELUARAN (REKOD MENGIKUT JABATAN / PEMBEKAL):</div>
            <table class="dept-table">
              <thead>
                <tr>
                  <th>Nama Jabatan / Pembekal / Wad</th>
                  <th style="text-align: right;">Jumlah Diterima (+)</th>
                  <th style="text-align: right;">Jumlah Dikeluarkan (-)</th>
                </tr>
              </thead>
              <tbody>
                ${logSummaryHtml}
              </tbody>
            </table>
          ` : ''}

          <!-- Full Ledger Transactions Table (Page 2) -->
          <div class="section-header page-break">
            <span>Rekod Transaksi Pergerakan (Buku Daftar KEW.PS-4):</span>
            <span style="font-size: 9px; font-weight: normal; color: #475569;">Jumlah Rekod: ${ledgerRows.length}</span>
          </div>

          <table class="ledger-table">
            <thead>
              <tr>
                <th width="4%">Bil</th>
                <th width="14%">Tarikh & Masa</th>
                <th width="17%">No Rujukan Dokumen</th>
                <th width="9%">Terima (+)</th>
                <th width="9%">Keluar (-)</th>
                <th width="9%">Baki</th>
                <th width="18%">Penerima / Jabatan</th>
                <th width="12%">Perekod</th>
                <th width="8%">Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerRows.map(row => {
                const isStoreVerification = row.transaction_type === 'store_verification'
                const isCheckFound = row.transaction_type === 'check_found'
                const rowBg = isStoreVerification ? 'background-color: #ecfdf5;' : isCheckFound ? 'background-color: #eef2ff;' : ''
                return `
                <tr style="${rowBg}">
                  <td class="center mono">${row.index}</td>
                  <td class="center font-mono">${new Date(row.transaction_date || row.created_at).toLocaleString('ms-MY', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</td>
                  <td class="mono" style="color: #0369a1;">${formatReferenceNumber(row)}</td>
                  <td class="right mono" style="color: #15803d;">
                    ${row.receiptQty !== null && row.receiptQty !== undefined ? `+${row.receiptQty}` : '—'}
                    ${row.receiptQty !== null && row.receiptQty !== undefined && row.receiptQty > 0 && row.serial_numbers && row.serial_numbers.length > 0 ? `<br/><span style="font-size: 8px; color: #0d9488; font-weight: bold;">S/N: ${row.serial_numbers.slice(0, 3).join(', ')}${row.serial_numbers.length > 3 ? '...' : ''}</span>` : ''}
                  </td>
                  <td class="right mono" style="color: #b91c1c;">
                    ${row.issueQty !== null && row.issueQty !== undefined ? `-${row.issueQty}` : '—'}
                    ${row.issueQty !== null && row.issueQty !== undefined && row.issueQty > 0 && row.serial_numbers && row.serial_numbers.length > 0 ? `<br/><span style="font-size: 8px; color: #0d9488; font-weight: bold;">S/N: ${row.serial_numbers.slice(0, 3).join(', ')}${row.serial_numbers.length > 3 ? '...' : ''}</span>` : ''}
                  </td>
                  <td class="right mono" style="background-color: ${isStoreVerification ? '#d1fae5' : isCheckFound ? '#e0e7ff' : '#f8fafc'}; font-weight: 800;">${row.runningBalance}</td>
                  <td style="font-weight: 600;">${resolveRecipientName(row)}</td>
                  <td>${resolveRecorderName(row.officer_name)}</td>
                  <td style="font-size: 8.5px; color: #475569;">${formatTransactionRemarks(row)}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>

          <!-- Official Sign-off Section -->
          <div class="sig-container">
            <div class="sig-box">
              <strong style="color: #0f172a; text-transform: uppercase;">Disediakan Oleh (Pegawai Stor / Farmasi):</strong>
              <div class="sig-line">
                Nama: <strong>${recorderName}</strong><br/>
                Jawatan: <strong>${userDepartmentName}</strong><br/>
                Tarikh: <strong>${new Date().toLocaleDateString('ms-MY')}</strong>
              </div>
            </div>
            <div class="sig-box">
              <strong style="color: #0f172a; text-transform: uppercase;">Disahkan Oleh (Ketua Jabatan / Pegawai Farmasi):</strong>
              <div class="sig-line">
                Nama: _______________________________<br/>
                Jawatan: ____________________________<br/>
                Tarikh: _____________________________
              </div>
            </div>
          </div>

          <div class="footer-note">
            Dokumen Rasmi KEW.PS-4 • Hospital Lawas, Sarawak • Dijana Secara Automatik Menerusi H.O.M.E. System pada ${new Date().toLocaleString('ms-MY')}
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // ==========================================
  // PRINT GENERATOR: KEW.PS-14 VERIFICATION CERTIFICATE
  // ==========================================
  const handlePrintVerificationCert = (customRecord?: CylinderStoreVerificationRecord) => {
    const record = customRecord || (storeVerificationLogs.length > 0 ? storeVerificationLogs[0] : null)
    if (!record && !selectedItem) return

    const printWin = window.open('', '_blank')
    if (!printWin) return

    const phys = record ? record.physical_count : currentStockBalance
    const kew = record ? record.kewps_balance : currentStockBalance
    const sys = record ? record.system_count : currentStockBalance
    const isTally = record ? record.is_tally : true
    const verYear = record ? record.verification_year : new Date().getFullYear()
    const verName = record ? record.verifier_name : (user?.full_name || 'Dr. Ahmad Razif')
    const verIc = record?.verifier_ic || '820412-13-5491'
    const verJawatan = record?.verifier_jawatan || 'Pegawai Farmasi Kanan'

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sijil Verifikasi Stor KEW.PS-14 - ${selectedItem?.item_code}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 20mm; }
          body { font-family: 'Arial', sans-serif; font-size: 10pt; color: #000; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
          .cert-box { border: 2px solid #000; padding: 20px; border-radius: 4px; margin-top: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 9.5pt; }
          th, td { border: 1px solid #000; padding: 6px 8px; }
          th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${JATA_NEGARA_BASE64}" style="height: 55px; width: auto; margin-bottom: 6px;" alt="Jata Negara" />
          <div style="font-weight: bold; font-size: 10pt;">KEMENTERIAN KESIHATAN MALAYSIA</div>
          <div style="font-weight: 900; font-size: 13pt;">HOSPITAL LAWAS, SARAWAK</div>
          <div style="font-size: 9pt; color: #475569;">PEKELILING PERBENDAHARAAN TATACARA PENGURUSAN STOR KERAJAAN</div>
          <div style="font-weight: 900; font-size: 12pt; margin-top: 8px; text-decoration: underline;">BORANG & SIJIL VERIFIKASI STOR TAHUNAN (KEW.PS-14)</div>
        </div>

        <p>Dengan ini diperakui bahawa verifikasi stor tahunan bagi tahun <strong>${verYear}</strong> telah dijalankan ke atas item silinder oksigen perubatan berikut:</p>

        <table>
          <tr>
            <th style="width: 30%; text-align: left;">Perihal Silinder</th>
            <td>${selectedItem?.item_name || 'Medical Oxygen Cylinder'}</td>
          </tr>
          <tr>
            <th style="text-align: left;">Kod Silinder</th>
            <td style="font-family: monospace; font-weight: bold;">${selectedItem?.item_code || '101-N'}</td>
          </tr>
          <tr>
            <th style="text-align: left;">Lokasi Penyimpanan</th>
            <td>${selectedItem?.location || 'Stor Gas Perubatan Utama'}</td>
          </tr>
        </table>

        <div style="margin: 15px 0; font-weight: bold;">Keputusan Semakan 3-Hala (Physical vs KEW.PS-4 vs Sistem PHiS/H.O.M.E.):</div>

        <table>
          <thead>
            <tr>
              <th>1. Kiraan Stok Fizikal</th>
              <th>2. Baki Kad Petak KEW.PS-4</th>
              <th>3. Baki Rekod Sistem</th>
              <th>Status Padanan</th>
            </tr>
          </thead>
          <tbody>
            <tr style="text-align: center; font-weight: bold; font-size: 11pt;">
              <td>${phys} Tabung</td>
              <td>${kew} Tabung</td>
              <td>${sys} Tabung</td>
              <td style="color: ${isTally ? '#047857' : '#b91c1c'};">${isTally ? '✓ SEPADAN (TALLY)' : '⚠ TERDAPAT PERBEZAAN'}</td>
            </tr>
          </tbody>
        </table>

        <div class="cert-box">
          <div style="font-weight: bold; margin-bottom: 10px;">PERAKUAN PEGAWAI PEMVERIFIKASI LUAR:</div>
          <p style="font-size: 9pt; text-align: justify;">
            Saya dengan ini memperakui bahawa semakan fizikal dan semakan silang dengan Buku Rekod KEW.PS-4 telah dilaksanakan dengan teliti dan lengkap pada tarikh <strong>${new Date().toLocaleDateString('ms-MY')}</strong>.
          </p>
          <br/><br/>
          <div style="display: flex; justify-content: space-between;">
            <div>
              ____________________________<br/>
              <strong>(${verName})</strong><br/>
              No. K/P: ${verIc}<br/>
              Jawatan: ${verJawatan}
            </div>
            <div>
              Tarikh: ${new Date().toLocaleDateString('ms-MY')}<br/>
              Cap Rasmi Jabatan:
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `)
    printWin.document.close()
  }

  // Export to CSV
  const handleExportCsv = () => {
    if (!selectedItem || ledgerRows.length === 0) return

    const headers = ['Tarikh', 'No Rujukan', 'Daripada / Kepada', 'Terima', 'Keluar', 'Baki', 'No Siri', 'Pegawai Bertanggungjawab', 'Catatan']
    const rows = ledgerRows.map(r => [
      `"${new Date(r.transaction_date).toLocaleDateString('ms-MY')}"`,
      `"${r.transaction_number || ''}"`,
      `"${r.source_destination || ''}"`,
      r.receiptQty || '',
      r.issueQty || '',
      r.runningBalance,
      `"${(r.serial_numbers || []).join(', ')}"`,
      `"${r.officer_name || ''}"`,
      `"${formatTransactionRemarks(r)}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `KEWPS4_CYLINDER_${selectedItem.item_code}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 text-text-primary pb-28 lg:pb-8 w-full">
      
      {/* TOP BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
        <Link to={ROUTES.HUB} className="hover:text-text-primary transition-colors">HOME</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={ROUTES.PHARMACY_OXYGEN} className="hover:text-text-primary transition-colors">
          {language === 'ms' ? 'OKSIGEN PERUBATAN' : 'MEDICAL OXYGEN'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-teal-600 font-bold uppercase">
          {language === 'ms' ? 'LEJAR & KAD PETAK KEW.PS-4' : 'KEW.PS-4 CYLINDER LEDGER'}
        </span>
      </div>

      {/* LUXURY EXECUTIVE HEADER BANNER */}
      <div className="bg-surface border border-border-default text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-[10px] uppercase tracking-wider font-bold">
                  KEW.PS-4 DIGITAL CYLINDER PORTAL
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Hospital Lawas • KKM</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <AirVent className="w-8 h-8 text-teal-400" />
                <span>Lejar & Kad Petak KEW.PS-4 Silinder Oksigen</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                Pusat Kawalan & Rekod Pergerakan Silinder Gas Perubatan — Penerimaan DO Pembekal, Pengeluaran Wad, Imbasan QR & Verifikasi Stor Tahunan mengikut Tatacara Pengurusan Stor Kerajaan (TPS).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                onClick={() => setIsQrModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold px-3.5 py-2.5 shadow-lg gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                Imbas QR
              </Button>
              <Button
                onClick={handlePrintLedger}
                disabled={!selectedItem || ledgerRows.length === 0}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs gap-1.5 px-3.5 py-2.5 shadow-sm border border-slate-700 disabled:opacity-40"
              >
                <Printer className="w-4 h-4" />
                Cetak KEW.PS-4
              </Button>
              <Button
                onClick={handleExportCsv}
                disabled={!selectedItem || ledgerRows.length === 0}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs gap-1.5 px-3.5 py-2.5 shadow-sm border border-slate-700 disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Eksport CSV
              </Button>
            </div>
          </div>

          {/* QUICK METRICS GLASS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Jumlah Silinder Fleet</span>
              <span className="text-xl font-black font-mono text-teal-300">{totalFleetCount}</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Baki Penuh Stor Utama</span>
              <span className="text-xl font-black font-mono text-emerald-300">{totalFullCentral}</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Silinder Di Wad/Klinik</span>
              <span className="text-xl font-black font-mono text-cyan-300">{totalInUseWards}</span>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Amaran Paras Minima</span>
              <span className="text-xl font-black font-mono text-amber-300">{lowStockAlertCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CYLINDER SELECTOR SIDEBAR (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* MOBILE SEARCH PILL */}
          {selectedItem && !isMobileSearchExpanded && (
            <div className="lg:hidden bg-surface border border-border-default rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-accent-base/10 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                  <Search className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-text-secondary font-bold uppercase tracking-wider">Silinder Dipilih</span>
                    <span className="font-mono text-[10px] text-teal-700 font-bold bg-accent-base/10 px-1.5 py-0.5 rounded">{selectedItem.item_code}</span>
                  </div>
                  <div className="text-xs font-black text-text-primary truncate mt-0.5">{selectedItem.item_name}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchExpanded(true)}
                className="shrink-0 bg-subtle hover:bg-subtle active:bg-slate-300 text-teal-700 border border-border-default px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tukar</span>
              </button>
            </div>
          )}

          {/* SEARCH BOX & CYLINDER LIST */}
          <div className={`bg-surface border border-border-subtle rounded-3xl shadow-sm p-5 space-y-5 ${
            selectedItem && !isMobileSearchExpanded ? 'hidden lg:block' : 'block'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-black text-text-primary text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-600" />
                <span>Saiz & Jenis Silinder</span>
              </h3>
              <Badge variant="outline" className="font-mono text-[10px]">
                {cylinderItems.length} Saiz
              </Badge>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Cari kod atau saiz silinder..."
                className={`pl-9 ${searchQuery ? 'pr-8' : ''} rounded-xl text-xs py-1.5`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-text-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List of Cylinder Sizes */}
            {isLoadingCatalog ? (
              <div className="flex items-center justify-center p-8">
                <Spinner size="sm" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredCatalogItems.map(item => {
                  const isSelected = selectedItemId
                    ? selectedItemId === item.id
                    : (selectedItem ? selectedItem.id === item.id : selectedSizeId === (item.size_id || item.id))
                  const displayedStock = isSelected ? currentStockBalance : item.current_stock
                  const isItemLow = displayedStock <= (item.min_stock || 0)

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSize(item)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-accent-base/10 border-teal-500 shadow-sm ring-1 ring-teal-500/30'
                          : 'bg-surface border-border-default hover:bg-subtle/50 hover:border-border-default'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-text-primary">{item.item_code}</span>
                          <span className="text-[10px] text-text-muted font-semibold">({item.capacity_m3}m³)</span>
                          {item.is_loan && (
                            <span className="text-[9px] bg-amber-100 text-amber-400 dark:text-amber-300 font-bold px-1 rounded font-bold">LOAN</span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted truncate font-medium mt-0.5">{item.gas_type}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-mono font-black text-sm ${isItemLow ? 'text-rose-600' : 'text-text-primary'}`}>
                          {displayedStock}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase">{item.unit_of_measure}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ACTIVE CYLINDER STOCK GAUGE (Desktop only) */}
          {selectedItem && (
            <div className="hidden lg:block bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-black text-xs text-teal-400 uppercase tracking-wider">Kedudukan Paras Stok</span>
                <Badge variant="outline" className="text-slate-300 border-slate-700 font-mono text-[10px]">
                  {selectedItem.unit_of_measure}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Baki Penuh Stor:</span>
                  <span className="font-mono text-teal-300 font-black text-sm">
                    {currentStockBalance} {selectedItem.unit_of_measure}
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 flex">
                  <div 
                    className={`h-full rounded-full transition-colors duration-500 ${
                      isLowStock ? 'bg-rose-500' : currentStockBalance <= (selectedItem.buffer_stock || 20) ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.max(stockPercentage, 5)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Min: {selectedItem.min_stock}</span>
                  <span>Buffer: {selectedItem.buffer_stock}</span>
                  <span>Max: {selectedItem.max_stock}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-[9px] text-slate-400 block uppercase">Di Wad/Klinik</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedItem.in_use_stock || 0}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-[9px] text-slate-400 block uppercase">Kosong di Stor</span>
                  <span className="font-mono font-bold text-amber-300">{selectedItem.empty_stock || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: KEW.PS-4 LEDGER WORKSPACE (9 cols) */}
        <div className="lg:col-span-9 space-y-6">

          {!selectedItem ? (
            <div className="bg-surface border border-border-subtle rounded-3xl p-12 text-center shadow-sm space-y-3">
              <div className="w-16 h-16 bg-accent-base/10 text-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <Search className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-black text-text-primary tracking-tight">Sila Pilih Saiz Silinder</h3>
                <p className="text-xs text-text-muted font-medium leading-relaxed">
                  Sila pilih saiz dan jenis silinder pada ruangan sebelah kiri untuk memaparkan Kad Petak & Lejar Transaksi (KEW.PS-4).
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ZONE A: ACTIVE CYLINDER HERO CARD */}
              <div className="bg-surface border border-border-default rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-text-secondary bg-subtle px-2.5 py-1 rounded-lg border border-border-default">
                      {selectedItem.item_code}
                    </span>
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider bg-subtle/50 px-2.5 py-1 rounded-lg border border-border-default">
                      Kapasiti: <span className="font-bold text-text-primary">{selectedItem.capacity_m3} m³ ({selectedItem.capacity_liters}L)</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-accent-base/10 text-teal-800 border-accent-base/20">
                      {selectedItem.gas_type}
                    </span>
                    {selectedItem.is_loan && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20">
                        PINJAMAN (LOAN)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {storeVerificationLogs.some(r => r.size_id === selectedSizeId && r.verification_year === new Date().getFullYear()) && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verifikasi {new Date().getFullYear()}: Tally</span>
                      </span>
                    )}

                    <Badge 
                      variant={isLowStock ? 'danger' : 'success'}
                      className="text-xs px-3 py-1 font-bold"
                    >
                      {isLowStock ? '⚠ STOK MINIMA' : '● STOK MENCUKUPI'}
                    </Badge>
                  </div>
                </div>

                {/* Main Title & Location */}
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-black text-text-primary tracking-tight leading-snug">
                    {selectedItem.item_name}
                  </h2>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-100 text-indigo-400 dark:text-indigo-300 font-bold text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">LOKASI:</span>
                      <span className="font-mono font-bold">{selectedItem.location}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent-base/10 border border-accent-base/20 text-teal-900 text-xs font-bold">
                      <CheckCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{language === 'ms' ? 'Diselaraskan Automatik Dari Penerimaan DO Oksigen & Permohonan Wad' : 'Auto-Synchronized From Oxygen DO Receipts & Ward Dispatches'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={openStoreVerificationModal}
                      className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs gap-1.5 px-3.5 py-2.5 shadow-sm transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Verifikasi Stor Tahunan (Semakan Fizikal vs KEW.PS-4)"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span>Store Verification</span>
                    </button>

                    <button
                      type="button"
                      onClick={openCheckFoundModal}
                      className="bg-subtle hover:bg-subtle active:bg-slate-300 text-text-primary border border-border-default rounded-xl font-bold text-xs gap-1.5 px-3.5 py-2.5 transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Check & Found Audit"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Check & Found</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openBringForwardModal()}
                      className="bg-subtle hover:bg-subtle active:bg-slate-300 text-text-primary border border-border-default rounded-xl font-bold text-xs gap-1.5 px-3.5 py-2.5 transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Bawa Ke Hadapan baki lejar"
                    >
                      <FastForward className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Bring Forward</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setClearPasswordInput('')
                        setClearStatus(null)
                        setIsClearModalOpen(true)
                      }}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black text-xs gap-1.5 px-3.5 py-2.5 transition-colors inline-flex items-center justify-center cursor-pointer border border-amber-500"
                      title="Set Semula Lejar (Dilindungi PIN)"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-950" />
                      <span>Set Semula</span>
                    </button>

                    {storeVerificationLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsVerificationHistoryModalOpen(true)}
                        className="bg-emerald-500/10 hover:bg-emerald-100 text-emerald-400 dark:text-emerald-300 font-bold border border-emerald-300 rounded-xl font-bold text-xs gap-1.5 px-3.5 py-2.5 transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="Lihat Sejarah Log Verifikasi Stor"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Sejarah ({storeVerificationLogs.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* MOBILE SEGMENTED VIEW SWITCHER TABS */}
              <div className="lg:hidden flex bg-subtle p-1.5 rounded-2xl border border-border-default gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setMobileTab('ledger')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
                    mobileTab === 'ledger'
                      ? 'bg-surface text-teal-700 shadow-sm border border-border-default'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Buku Rekod ({ledgerRows.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('summary')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
                    mobileTab === 'summary'
                      ? 'bg-surface text-teal-700 shadow-sm border border-border-default'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Ringkasan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('departments')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
                    mobileTab === 'departments'
                      ? 'bg-surface text-teal-700 shadow-sm border border-border-default'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Jabatan</span>
                </button>
              </div>

              {/* ZONE B: MOVEMENT SUMMARY STRIP (4 KPI CARDS) */}
              <div className={`${mobileTab === 'summary' ? 'grid' : 'hidden'} lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
                {/* 1. Baki Semasa */}
                <div className="bg-surface border border-border-subtle rounded-2xl p-4 shadow-sm border-l-4 border-l-teal-500 space-y-1">
                  <span className="text-[10px] font-bold text-text-secondary font-bold uppercase tracking-wider block">Baki Kedudukan</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-text-primary font-mono">
                      {currentStockBalance}
                    </span>
                    <span className="text-xs text-slate-400 uppercase font-bold">{selectedItem.unit_of_measure}</span>
                  </div>
                  <span className="text-[10px] text-teal-600 font-semibold block pt-0.5">Pegangan Silinder Penuh</span>
                </div>

                {/* 2. Jumlah Diterima */}
                <div className="bg-surface border border-border-subtle rounded-2xl p-4 shadow-sm border-l-4 border-l-emerald-500 space-y-1">
                  <span className="text-[10px] font-bold text-text-secondary font-bold uppercase tracking-wider block">Total Diterima (+)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      +{totalReceived}
                    </span>
                    <span className="text-xs text-slate-400 uppercase font-bold">{selectedItem.unit_of_measure}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block pt-0.5">Penerimaan Tempoh Ini</span>
                </div>

                {/* 3. Jumlah Dikeluarkan */}
                <div className="bg-surface border border-border-subtle rounded-2xl p-4 shadow-sm border-l-4 border-l-rose-500 space-y-1">
                  <span className="text-[10px] font-bold text-text-secondary font-bold uppercase tracking-wider block">Total Dikeluarkan (-)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-rose-600 font-mono">
                      -{totalIssued}
                    </span>
                    <span className="text-xs text-slate-400 uppercase font-bold">{selectedItem.unit_of_measure}</span>
                  </div>
                  <span className="text-[10px] text-rose-600 font-semibold block pt-0.5">Pengeluaran Tempoh Ini</span>
                </div>

                {/* 4. % Pengeluaran */}
                <div className="bg-surface border border-border-subtle rounded-2xl p-4 shadow-sm border-l-4 border-l-indigo-500 space-y-1">
                  <span className="text-[10px] font-bold text-text-secondary font-bold uppercase tracking-wider block">% Pengeluaran</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-indigo-600 font-mono">
                      {issuePercentage}%
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold block pt-0.5">Nisbah Pengeluaran Stok</span>
                </div>
              </div>

              {/* SUMMARY TAB EXTRA SECTIONS (D1, D2, D3) */}
              <div className={`${mobileTab === 'summary' ? 'block' : 'hidden'} lg:block space-y-6`}>
                {/* ZONE D1: PARAS STOK TAHUNAN */}
                <div className="bg-surface border border-border-subtle rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <span className="font-black text-xs text-text-primary flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-600" />
                      <span>Paras Stok Tahunan (Min, Buffer & Max)</span>
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {annualStockLevels.length} Tahun Rekod
                    </Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-subtle/50 text-text-muted font-bold uppercase text-[10px] border-b border-border-default">
                          <th className="py-2 px-3">Tahun</th>
                          <th className="py-2 px-3 text-center">Paras Stok Min</th>
                          <th className="py-2 px-3 text-center">Stok Buffer (Tambahan)</th>
                          <th className="py-2 px-3 text-center">Paras Stok Max</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle font-mono">
                        {annualStockLevels.map((l, i) => (
                          <tr key={i} className="hover:bg-subtle/50">
                            <td className="py-2 px-3 font-bold font-sans text-text-primary">{l.year}</td>
                            <td className="py-2 px-3 text-center font-black text-rose-600">{l.min} {selectedItem.unit_of_measure}</td>
                            <td className="py-2 px-3 text-center font-black text-amber-600">{l.buffer} {selectedItem.unit_of_measure}</td>
                            <td className="py-2 px-3 text-center font-black text-emerald-600">{l.max} {selectedItem.unit_of_measure}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ZONE D2: REKOD TERIMAAN DAN PENGELUARAN SUKU TAHUN */}
                <div className="bg-surface border border-border-subtle rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <span className="font-black text-xs text-text-primary flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>Rekod Terimaan & Pengeluaran Suku Tahun (Kuantiti & Nilai RM)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Harga Seunit: RM {unitPrice.toFixed(2)} / {selectedItem.unit_of_measure}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-subtle/50 text-text-muted font-bold text-[10px] border-b border-border-default">
                          <th rowSpan={2} className="py-2 px-3 text-center border-r border-border-default">Tahun</th>
                          <th rowSpan={2} className="py-2 px-3 border-r border-border-default">Suku Tahun</th>
                          <th colSpan={2} className="py-2 px-3 text-center bg-emerald-500/10 text-emerald-400 border-r border-border-default">Diterima</th>
                          <th colSpan={2} className="py-2 px-3 text-center bg-rose-500/10 text-rose-400">Dikeluarkan</th>
                        </tr>
                        <tr className="border-b border-border-default text-[9px] font-bold">
                          <th className="py-1.5 px-3 text-right bg-emerald-500/10 text-emerald-700">Kuantiti</th>
                          <th className="py-1.5 px-3 text-right bg-emerald-500/10 text-emerald-700 border-r border-border-default">Nilai (RM)</th>
                          <th className="py-1.5 px-3 text-right bg-rose-500/10 text-rose-700">Kuantiti</th>
                          <th className="py-1.5 px-3 text-right bg-rose-500/10 text-rose-700">Nilai (RM)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle font-mono text-xs">
                        {quarterlySummary.map(yData => (
                          <React.Fragment key={yData.year}>
                            <tr>
                              <td rowSpan={5} className="py-2 px-3 text-center font-bold font-sans text-text-primary border-r border-border-default bg-subtle/50 align-middle">
                                {yData.year}
                              </td>
                              <td className="py-2 px-3 font-sans font-medium text-text-secondary border-r border-border-subtle">Suku Pertama (Q1: Jan - Mac)</td>
                              <td className="py-2 px-3 text-right font-black text-emerald-600">{yData.q1.receiptQty > 0 ? `+${yData.q1.receiptQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-muted border-r border-border-subtle">{yData.q1.receiptVal > 0 ? `RM ${yData.q1.receiptVal.toFixed(2)}` : '—'}</td>
                              <td className="py-2 px-3 text-right font-black text-rose-600">{yData.q1.issueQty > 0 ? `-${yData.q1.issueQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-muted">{yData.q1.issueVal > 0 ? `RM ${yData.q1.issueVal.toFixed(2)}` : '—'}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-sans font-medium text-text-secondary border-r border-border-subtle">Suku Kedua (Q2: Apr - Jun)</td>
                              <td className="py-2 px-3 text-right font-black text-emerald-600">{yData.q2.receiptQty > 0 ? `+${yData.q2.receiptQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-muted border-r border-border-subtle">{yData.q2.receiptVal > 0 ? `RM ${yData.q2.receiptVal.toFixed(2)}` : '—'}</td>
                              <td className="py-2 px-3 text-right font-black text-rose-600">{yData.q2.issueQty > 0 ? `-${yData.q2.issueQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-muted">{yData.q2.issueVal > 0 ? `RM ${yData.q2.issueVal.toFixed(2)}` : '—'}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-sans font-medium text-text-secondary border-r border-border-subtle">Suku Ketiga (Q3: Jul - Sep)</td>
                              <td className="py-2 px-3 text-right font-black text-emerald-600">{yData.q3.receiptQty > 0 ? `+${yData.q3.receiptQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-muted border-r border-border-subtle">{yData.q3.receiptVal > 0 ? `RM ${yData.q3.receiptVal.toFixed(2)}` : '—'}</td>
                              <td className="py-2 px-3 text-right font-black text-rose-600">{yData.q3.issueQty > 0 ? `-${yData.q3.issueQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-muted">{yData.q3.issueVal > 0 ? `RM ${yData.q3.issueVal.toFixed(2)}` : '—'}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-sans font-medium text-text-secondary border-r border-border-subtle">Suku Keempat (Q4: Okt - Dis)</td>
                              <td className="py-2 px-3 text-right font-black text-emerald-600">{yData.q4.receiptQty > 0 ? `+${yData.q4.receiptQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-muted border-r border-border-subtle">{yData.q4.receiptVal > 0 ? `RM ${yData.q4.receiptVal.toFixed(2)}` : '—'}</td>
                              <td className="py-2 px-3 text-right font-black text-rose-600">{yData.q4.issueQty > 0 ? `-${yData.q4.issueQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-muted">{yData.q4.issueVal > 0 ? `RM ${yData.q4.issueVal.toFixed(2)}` : '—'}</td>
                            </tr>
                            <tr className="bg-subtle/50 font-bold border-t border-border-default">
                              <td className="py-2 px-3 font-sans text-text-primary border-r border-border-default">Jumlah Keseluruhan Tahun {yData.year}</td>
                              <td className="py-2 px-3 text-right text-emerald-700">{yData.total.receiptQty > 0 ? `+${yData.total.receiptQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-primary border-r border-border-default">RM ${yData.total.receiptVal.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right text-rose-700">{yData.total.issueQty > 0 ? `-${yData.total.issueQty} ${selectedItem.unit_of_measure}` : '—'}</td>
                              <td className="py-2 px-3 text-right text-text-primary">RM ${yData.total.issueVal.toFixed(2)}</td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ZONE D3: LOG PENERIMAAN DAN PENGELUARAN (REKOD MENGIKUT JABATAN / PEMBEKAL) */}
                {movementLogSummary.length > 0 && (
                  <div className="bg-surface border border-border-subtle rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                      <span className="font-black text-xs text-text-primary flex items-center gap-2">
                        <Building className="w-4 h-4 text-teal-600" />
                        <span>Log Penerimaan Dan Pengeluaran (Rekod Mengikut Jabatan / Pembekal)</span>
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {movementLogSummary.length} Entiti
                      </Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-subtle/50 text-text-muted font-bold uppercase text-[10px] border-b border-border-default">
                            <th className="py-2 px-3">Nama Jabatan / Pembekal / Wad</th>
                            <th className="py-2 px-3 text-right text-emerald-700">Jumlah Diterima (+)</th>
                            <th className="py-2 px-3 text-right text-rose-700">Jumlah Dikeluarkan (-)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle font-mono">
                          {movementLogSummary.map((item, idx) => (
                            <tr key={idx} className="hover:bg-subtle/50">
                              <td className="py-2.5 px-3 font-semibold font-sans text-text-primary">{item.name}</td>
                              <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                                {item.totalReceived > 0 ? `+${item.totalReceived} ${selectedItem.unit_of_measure}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-rose-600">
                                {item.totalIssued > 0 ? `-${item.totalIssued} ${selectedItem.unit_of_measure}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* LEDGER TAB CONTENT (Zone C Filters & Digital KEW.PS-4 Records) */}
              <div className={`${mobileTab === 'ledger' ? 'block' : 'hidden'} lg:block space-y-6`}>
                {/* ZONE C: FILTERS & PRESET STRIP */}
                <div className="bg-surface border border-border-subtle rounded-3xl shadow-sm p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-black text-text-primary uppercase tracking-wider">Penapis Lejar KEW.PS-4</span>
                    </div>

                    {/* Preset Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      <button
                        type="button"
                        onClick={() => applyDatePreset('today')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          activeDatePreset === 'today' ? 'bg-teal-600 text-white shadow-xs' : 'bg-subtle hover:bg-subtle text-text-secondary'
                        }`}
                      >
                        Hari Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDatePreset('week')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          activeDatePreset === 'week' ? 'bg-teal-600 text-white shadow-xs' : 'bg-subtle hover:bg-subtle text-text-secondary'
                        }`}
                      >
                        7 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDatePreset('month')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          activeDatePreset === 'month' ? 'bg-teal-600 text-white shadow-xs' : 'bg-subtle hover:bg-subtle text-text-secondary'
                        }`}
                      >
                        Bulan Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDatePreset('3months')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          activeDatePreset === '3months' ? 'bg-teal-600 text-white shadow-xs' : 'bg-subtle hover:bg-subtle text-text-secondary'
                        }`}
                      >
                        3 Bulan
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDatePreset('all')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          activeDatePreset === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'bg-subtle hover:bg-subtle text-text-secondary'
                        }`}
                      >
                        Semua
                      </button>
                    </div>
                  </div>

                  {/* Filter Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Tarikh Mula</label>
                      <Input
                        type="date"
                        className="text-xs py-1.5 rounded-xl font-mono"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value)
                          setActiveDatePreset('all')
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Tarikh Akhir</label>
                      <Input
                        type="date"
                        className="text-xs py-1.5 rounded-xl font-mono"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value)
                          setActiveDatePreset('all')
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Jenis Transaksi</label>
                      <Select
                        className="text-xs py-1.5 rounded-xl font-medium"
                        value={selectedTxType}
                        onChange={(e) => setSelectedTxType(e.target.value)}
                      >
                        <option value="all">Semua Jenis Transaksi</option>
                        <option value="receipt">Penerimaan DO Pembekal (+)</option>
                        <option value="issue">Pengeluaran ke Wad (-)</option>
                        <option value="return">Pemulangan Silinder Kosong</option>
                        <option value="store_verification">Verifikasi Stor (KEW.PS-14)</option>
                        <option value="check_found">Semak & Penemuan</option>
                        <option value="bring_forward">Bawa Ke Hadapan</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Jabatan / Wad Destinasi</label>
                      <Select
                        className="text-xs py-1.5 rounded-xl font-medium"
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                      >
                        <option value="all">Semua Jabatan / Wad</option>
                        {CLINICAL_WARM_DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                {/* ZONE E: DIGITAL KEW.PS-4 TRANSACTION TABLE (9 COLUMNS OFFICIAL) */}
                <div className="bg-surface border border-border-subtle rounded-3xl shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                    <h3 className="font-black text-text-primary text-base md:text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-600" />
                      <span>Buku Daftar Transaksi (Digital KEW.PS-4 Silinder)</span>
                    </h3>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {ledgerRows.length} Rekod
                    </Badge>
                  </div>

                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-20">
                      <Spinner size="lg" />
                    </div>
                  ) : ledgerRows.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 font-medium text-sm space-y-4 bg-subtle/50 rounded-2xl p-6 border border-dashed border-border-default">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                      <div className="space-y-1.5">
                        <p className="font-black text-text-primary text-base">Tiada Rekod Pergerakan Ditemui</p>
                        <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                          Tiada transaksi dikesan bagi penapis ini. Sila tukar tarikh atau tekan <button type="button" onClick={() => applyDatePreset('all')} className="text-teal-600 font-bold underline cursor-pointer">"Semua"</button>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* DESKTOP TABLE VIEW - OFFICIAL 9 COLUMNS */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border-default bg-subtle/50 text-text-muted font-bold uppercase text-[10px] tracking-wider">
                              <th className="py-3 px-3 w-12 text-center">Bil</th>
                              <th className="py-3 px-3">Tarikh & Masa</th>
                              <th className="py-3 px-3">No Rujukan Dokumen</th>
                              <th className="py-3 px-3 text-right text-emerald-700">Terima (+)</th>
                              <th className="py-3 px-3 text-right text-rose-700">Keluar (-)</th>
                              <th className="py-3 px-3 text-right font-black">Baki</th>
                              <th className="py-3 px-4">Penerima / Jabatan</th>
                              <th className="py-3 px-3">Perekod</th>
                              <th className="py-3 px-3">Catatan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle">
                            {ledgerRows.map(row => {
                              const isStoreVerification = row.transaction_type === 'store_verification'
                              const isCheckFound = row.transaction_type === 'check_found'
                              const rowBg = isStoreVerification ? 'bg-emerald-500/10' : isCheckFound ? 'bg-indigo-500/10' : 'hover:bg-subtle/50'

                              return (
                                <tr key={row.id} className={`${rowBg} transition-colors`}>
                                  <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                                    {row.index}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-text-muted whitespace-nowrap">
                                    {new Date(row.transaction_date || row.created_at).toLocaleString('ms-MY', {
                                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                                    {formatReferenceNumber(row)}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                                    {row.receiptQty !== null && row.receiptQty !== undefined ? `+${row.receiptQty}` : '—'}
                                    {row.receiptQty !== null && row.receiptQty !== undefined && row.receiptQty > 0 && row.serial_numbers && row.serial_numbers.length > 0 && (
                                      <span className="block text-[9px] text-teal-600 font-normal">
                                        S/N: {row.serial_numbers.slice(0, 2).join(', ')}{row.serial_numbers.length > 2 ? '...' : ''}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                                    {row.issueQty !== null && row.issueQty !== undefined ? `-${row.issueQty}` : '—'}
                                    {row.issueQty !== null && row.issueQty !== undefined && row.issueQty > 0 && row.serial_numbers && row.serial_numbers.length > 0 && (
                                      <span className="block text-[9px] text-rose-500 font-normal">
                                        S/N: {row.serial_numbers.slice(0, 2).join(', ')}{row.serial_numbers.length > 2 ? '...' : ''}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono font-black text-text-primary bg-subtle/50">
                                    {row.runningBalance}
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-text-primary">
                                    {resolveRecipientName(row)}
                                  </td>
                                  <td className="py-3 px-3 text-text-muted whitespace-nowrap">
                                    {resolveRecorderName(row.officer_name)}
                                  </td>
                                  <td className="py-3 px-3 text-text-muted text-[11px] max-w-xs truncate" title={formatTransactionRemarks(row)}>
                                    {formatTransactionRemarks(row)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* MOBILE CARD VIEW */}
                      <div className="md:hidden space-y-3">
                        {ledgerRows.map(row => (
                          <div key={row.id} className="bg-subtle/50 rounded-2xl p-4 border border-border-default space-y-2.5">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-border-default">
                              <span className="font-mono font-bold text-slate-400">#{row.index}</span>
                              <span className="font-mono font-bold text-teal-700">{formatReferenceNumber(row)}</span>
                              <span className="text-[10px] text-text-muted font-mono">
                                {new Date(row.transaction_date || row.created_at).toLocaleDateString('ms-MY')}
                              </span>
                            </div>

                            <div className="font-bold text-xs text-text-primary">{resolveRecipientName(row)}</div>
                            {row.remarks && <div className="text-[11px] text-text-muted">{formatTransactionRemarks(row)}</div>}

                            <div className="flex items-center justify-between pt-2 border-t border-border-default text-xs font-mono">
                              <div>
                                {row.receiptQty !== null && <span className="text-emerald-700 font-bold">Terima: +{row.receiptQty}</span>}
                                {row.issueQty !== null && <span className="text-rose-700 font-bold">Keluar: -{row.issueQty}</span>}
                              </div>
                              <div>
                                <span className="text-slate-400">Baki: </span>
                                <span className="font-black text-text-primary">{row.runningBalance} {selectedItem.unit_of_measure}</span>
                              </div>
                            </div>

                            <div className="text-[10px] text-slate-400 pt-1 border-t border-border-default flex items-center justify-between">
                              <span>Perekod: {resolveRecorderName(row.officer_name)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ZONE F: WARD & DEPARTMENT CONSUMPTION BREAKDOWN */}
              <div className={`${mobileTab === 'departments' ? 'block' : 'hidden'} lg:block bg-surface border border-border-subtle rounded-3xl shadow-sm p-6 space-y-5`}>
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <h3 className="font-black text-text-primary text-sm md:text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>Pengagihan Mengikut Wad & Jabatan ({selectedItem.item_code})</span>
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {deptBreakdown.length} Unit
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deptBreakdown.map(dept => (
                    <div key={dept.department_name} className="p-4 rounded-2xl bg-subtle/50 border border-border-default space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-text-primary truncate">{dept.department_name}</span>
                        <span className="font-mono text-teal-700">{dept.total_issued} Tabung</span>
                      </div>

                      <div className="w-full bg-subtle h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-600 h-full rounded-full" 
                          style={{ width: `${Math.min(Math.round((dept.total_issued / 50) * 100), 100)}%` }} 
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-text-muted font-mono pt-1">
                        <span>Sedang Guna: <strong>{dept.currently_in_use}</strong></span>
                        <span>Permohonan: {dept.requests_count}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

        </div>
      </div>

      {/* ========================================== */}
      {/* STORE VERIFICATION MODAL (KEW.PS-14)       */}
      {/* ========================================== */}
      <Modal
        isOpen={isStoreVerificationModalOpen}
        onClose={() => setIsStoreVerificationModalOpen(false)}
        title="Verifikasi Stor Tahunan (KEW.PS-14)"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitStoreVerification} className="space-y-4 text-xs">
          {verificationStatus && (
            <div className={`p-3 rounded-xl font-bold flex items-center gap-2 ${
              verificationStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {verificationStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{verificationStatus.text}</span>
            </div>
          )}

          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Verifikasi Bagi:</span>
              <span className="font-bold text-teal-300">{selectedItem?.item_name} ({selectedItem?.item_code})</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Baki Kad Petak KEW.PS-4</span>
                <span className="font-mono font-black text-base text-teal-300">{currentStockBalance} Tabung</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Baki Sistem Database</span>
                <span className="font-mono font-black text-base text-cyan-300">{currentStockBalance} Tabung</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-text-muted mb-1">Kiraan Fizikal Sebenar (Tabung) *</label>
              <Input
                type="number"
                min="0"
                required
                value={verificationPhysicalCount}
                onChange={(e) => setVerificationPhysicalCount(e.target.value)}
                className="font-mono text-sm py-1.5"
              />
            </div>

            <div>
              <label className="block font-bold text-text-muted mb-1">Tahun Verifikasi *</label>
              <Input
                type="number"
                required
                value={verificationYear}
                onChange={(e) => setVerificationYear(parseInt(e.target.value, 10))}
                className="font-mono text-xs py-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-text-muted mb-1">Nama Pegawai Pemverifikasi Luar *</label>
              <Input
                required
                value={verificationVerifierName}
                onChange={(e) => setVerificationVerifierName(e.target.value)}
                className="text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block font-bold text-text-muted mb-1">No. Kad Pengenalan Pegawai</label>
              <Input
                value={verificationVerifierIc}
                onChange={(e) => setVerificationVerifierIc(e.target.value)}
                className="font-mono text-xs py-1.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-text-muted mb-1">Jawatan & Gred Pegawai</label>
            <Input
              value={verificationVerifierJawatan}
              onChange={(e) => setVerificationVerifierJawatan(e.target.value)}
              className="text-xs py-1.5"
            />
          </div>

          <div>
            <label className="block font-bold text-text-muted mb-1">Catatan Verifikasi</label>
            <Input
              value={verificationRemarks}
              onChange={(e) => setVerificationRemarks(e.target.value)}
              className="text-xs py-1.5"
            />
          </div>

          <div className="p-3 bg-subtle/50 border rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="certVerify"
              checked={isVerificationCertified}
              onChange={(e) => setIsVerificationCertified(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-teal-600"
            />
            <label htmlFor="certVerify" className="text-[11px] text-text-secondary leading-snug cursor-pointer">
              Saya dengan ini memperakui bahawa semakan fizikal dan semakan silang dengan Buku Rekod KEW.PS-4 telah disahkan mengikut Tatacara Pengurusan Stor Kerajaan.
            </label>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsStoreVerificationModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmittingVerification} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {isSubmittingVerification ? 'Menyimpan...' : 'Sahkan & Jana KEW.PS-14'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* CHECK & FOUND MODAL                        */}
      {/* ========================================== */}
      <Modal
        isOpen={isCheckFoundModalOpen}
        onClose={() => setIsCheckFoundModalOpen(false)}
        title="Semakan & Penemuan Stok (Check & Found)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitCheckFound} className="space-y-4 text-xs">
          {checkFoundStatus && (
            <div className={`p-3 rounded-xl font-bold ${
              checkFoundStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {checkFoundStatus.text}
            </div>
          )}

          {/* Comparison Preview Card */}
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Silinder:</span>
              <span className="font-bold text-teal-300">{selectedItem?.item_name} ({selectedItem?.item_code})</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-800/90 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Baki Lejar KEW.PS-4</span>
                <span className="font-mono font-black text-sm text-teal-300">{currentStockBalance} Tabung</span>
              </div>
              <div className="bg-slate-800/90 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Fizikal Tersedia di Stor</span>
                <span className="font-mono font-black text-sm text-cyan-300">{selectedItem?.current_stock || 0} Tabung</span>
              </div>
            </div>

            {/* Calculated variance feedback */}
            {(() => {
              const entered = parseInt(checkFoundPhysicalQty || '0', 10)
              const diff = entered - currentStockBalance
              if (isNaN(entered)) return null
              return (
                <div className={`text-[11px] font-bold p-2 rounded-xl text-center flex items-center justify-center gap-1.5 ${
                  diff === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  diff < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                }`}>
                  {diff === 0 ? (
                    <span>✓ Kiraan sepadan dengan baki lejar</span>
                  ) : diff < 0 ? (
                    <span>⚠ Pelarasan Lejar: Keluar (-{Math.abs(diff)}) → Baki Baru: {entered} Tabung</span>
                  ) : (
                    <span>▲ Pelarasan Lejar: Terima (+{diff}) → Baki Baru: {entered} Tabung</span>
                  )}
                </div>
              )
            })()}
          </div>

          <div>
            <label className="block font-bold text-text-muted mb-1">Kiraan Fizikal Sebenar (Tabung) *</label>
            <Input
              type="number"
              min="0"
              required
              value={checkFoundPhysicalQty}
              onChange={(e) => setCheckFoundPhysicalQty(e.target.value)}
              className="font-mono text-sm py-1.5"
            />
          </div>

          <div>
            <label className="block font-bold text-text-muted mb-1">Nama Pegawai Audit</label>
            <Input
              required
              value={checkFoundOfficer}
              onChange={(e) => setCheckFoundOfficer(e.target.value)}
              className="text-xs py-1.5"
            />
          </div>

          <div>
            <label className="block font-bold text-text-muted mb-1">Sebab & Catatan Semakan</label>
            <Input
              value={checkFoundRemarks}
              onChange={(e) => setCheckFoundRemarks(e.target.value)}
              className="text-xs py-1.5"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsCheckFoundModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmittingCheckFound} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
              {isSubmittingCheckFound ? 'Menyimpan...' : 'Simpan Pelarasan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* BRING FORWARD MODAL                        */}
      {/* ========================================== */}
      <Modal
        isOpen={isBringForwardModalOpen}
        onClose={() => setIsBringForwardModalOpen(false)}
        title="Bawa Ke Hadapan Baki Pembukaan (Bring Forward)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitBringForward} className="space-y-4 text-xs">
          {bfStatus && (
            <div className={`p-3 rounded-xl font-bold ${
              bfStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {bfStatus.text}
            </div>
          )}

          <div>
            <label className="block font-bold text-text-muted mb-1">Kuantiti Baki Pembukaan (Tabung) *</label>
            <Input
              type="number"
              min="0"
              required
              value={bfQty}
              onChange={(e) => setBfQty(e.target.value)}
              className="font-mono text-sm py-1.5"
            />
          </div>

          <div>
            <label className="block font-bold text-text-muted mb-1">Tempoh Baki</label>
            <Select
              value={bfPeriodType}
              onChange={(e) => setBfPeriodType(e.target.value as any)}
              className="text-xs py-1.5"
            >
              <option value="previous_year">Tahun Lepas</option>
              <option value="previous_month">Bulan Lepas</option>
              <option value="initial_balance">Baki Pembukaan Baru</option>
            </Select>
          </div>

          <div>
            <label className="block font-bold text-text-muted mb-1">No. Rujukan</label>
            <Input
              value={bfRefNum}
              onChange={(e) => setBfRefNum(e.target.value)}
              className="font-mono text-xs py-1.5"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsBringForwardModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmittingBf} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
              {isSubmittingBf ? 'Menyimpan...' : 'Simpan Baki Pembukaan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* CLEAR / RESET LEDGER MODAL                 */}
      {/* ========================================== */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Set Semula / Padam Rekod Lejar"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          {clearStatus && (
            <div className={`p-3 rounded-xl font-bold ${
              clearStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {clearStatus.text}
            </div>
          )}

          <p className="text-text-muted">
            Tindakan ini akan mengosongkan rekod transaksi bagi membolehkan rekod baru dimulakan. Tindakan ini dilindungi kata laluan kebenaran.
          </p>

          <div>
            <label className="block font-bold text-text-muted mb-1">Skop Penetapan Semula</label>
            <Select
              value={clearScope}
              onChange={(e) => setClearScope(e.target.value as any)}
              className="text-xs py-1.5"
            >
              <option value="selected">Saiz Semasa Sahaja ({selectedItem?.item_code})</option>
              <option value="all">Semua Saiz Silinder</option>
            </Select>
          </div>

          <div>
            <label className="block font-bold text-text-muted mb-1">Kata Laluan Pentadbir (PIN: home123)</label>
            <Input
              type="password"
              placeholder="Masukkan kata laluan..."
              value={clearPasswordInput}
              onChange={(e) => setClearPasswordInput(e.target.value)}
              className="text-xs py-1.5 font-mono"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsClearModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleClearLedger} disabled={isSubmittingClear} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
              {isSubmittingClear ? 'Memadam...' : 'Sahkan Set Semula'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================== */}
      {/* VERIFICATION HISTORY MODAL                 */}
      {/* ========================================== */}
      <Modal
        isOpen={isVerificationHistoryModalOpen}
        onClose={() => setIsVerificationHistoryModalOpen(false)}
        title="Sejarah Log Verifikasi Stor Tahunan (KEW.PS-14)"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          {storeVerificationLogs.length === 0 ? (
            <p className="text-center py-6 text-slate-400">Tiada rekod verifikasi terdahulu.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {storeVerificationLogs.map(log => (
                <div key={log.id} className="p-4 rounded-2xl bg-subtle/50 border border-border-default flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-primary">Verifikasi Tahun {log.verification_year}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.is_tally ? 'bg-emerald-100 text-emerald-400' : 'bg-rose-100 text-rose-400'
                      }`}>
                        {log.is_tally ? 'TALLY (SEPADAN)' : 'VARIANS'}
                      </span>
                    </div>
                    <div className="text-text-muted text-[11px] mt-1">
                      Pegawai: <strong>{log.verifier_name}</strong> • Tarikh: {new Date(log.verified_at).toLocaleDateString('ms-MY')}
                    </div>
                    <div className="text-text-muted font-mono text-[11px] mt-0.5">
                      Fizikal: {log.physical_count} | KEW.PS-4: {log.kewps_balance} | Sistem: {log.system_count}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handlePrintVerificationCert(log)}
                      className="bg-emerald-600 text-white rounded-xl text-xs font-bold gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Cetak Sijil
                    </Button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteCylinderStoreVerificationRecord(log.id)
                        await loadLedgerDetails()
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 transition-colors"
                      title="Padam rekod"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================== */}
      {/* QR SCANNER MODAL                           */}
      {/* ========================================== */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Imbas Kod QR / Barcode Silinder"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-center text-xs">
          <div className="w-full aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6 border border-slate-800 relative overflow-hidden">
            <QrCode className="w-16 h-16 text-teal-400 animate-pulse mb-2" />
            <p className="font-bold text-white text-sm">Kamera Pengimbas Aktif</p>
            <p className="text-slate-400 text-[11px]">Halakan kod QR silinder ke hadapan kamera</p>
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-teal-400/80 shadow-lg animate-bounce" />
          </div>

          <div className="p-3 bg-subtle/50 border rounded-xl text-left text-[11px] text-text-muted space-y-1">
            <p className="font-bold text-text-primary">Panduan Imbasan:</p>
            <p>• Menyokong Kod QR Fizikal Silinder KKM & Barcode Pembekal (Linde, Borneo Indah).</p>
            <p>• Imbasan akan memaparkan Kad Petak KEW.PS-4 saiz silinder yang sepadan secara automatik.</p>
          </div>

          <Button onClick={() => setIsQrModalOpen(false)} className="w-full bg-slate-900 text-white font-bold">
            Close Scanner
          </Button>
        </div>
      </Modal>

    </div>
  )
}

export default CylinderKewPs4LedgerPage
