import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import '@/lib/constants'
import { updatePenaltyDetails, approvePenalty, getPerformanceStandards, PerformanceStandard } from '@/services/pharmacy/penaltyService'
import '@/lib/utils'
import { ChevronRight, Sparkles, ArrowLeft, Printer, Save, CheckCircle2, XCircle, FileText, Building2, CheckSquare, Square, Lock, Unlock, Plus, Trash2 } from 'lucide-react'
import { Spinner, SlideOver } from '@/components/ui'
import { PdfPreviewModal, PDFViewer } from '@/components/shared'
import { PurchaseOrderDetailView } from './PurchaseOrderDetailView'
import type { SupplierPenalty, User } from '@/types'

interface PenaltyDelivery {
  id: string
  delivery_number: string
  quantity_late?: number
  days_delayed?: number
  is_penalty_applicable?: boolean
}

interface PenaltyPurchaseOrderItem {
  id: string
  item_code?: string | null
  item_name?: string | null
  quantity_ordered?: number
  unit_price?: number
  total_price?: number
  deliveries?: PenaltyDelivery[]
}

interface PenaltyDetailRecord extends Omit<SupplierPenalty, 'status' | 'purchase_order' | 'supplier' | 'lpo'> {
  status: string
  approved_by?: string
  penalty_paid?: boolean
  payment_kaedah?: number
  payment_reference?: string
  quantity?: number
  unit_price?: number
  total_order_value?: number
  failed_product_value?: number
  performance_standards_violated?: string[]
  prepared_by_user_id?: string
  verified_by_user_id?: string
  prepared_by_name?: string
  prepared_by_designation?: string
  verified_by_name?: string
  verified_by_designation?: string
  approved_by_name?: string
  approved_by_designation?: string
  prepared_at?: string
  verified_at?: string
  approved_at?: string
  supplier?: { company_name?: string; address?: string | null } | null
  purchase_order?: { id: string; po_number?: string; total_amount?: number; items?: PenaltyPurchaseOrderItem[] } | null
  lpo?: { lpo_number?: string; document_url?: string | null; document_date?: string; expected_delivery_date?: string | null } | null
  order_tracking?: { item_code?: string | null; item_name?: string | null } | null
  receiving?: { do_number?: string | null; receiving_date?: string } | null
  prepared_by?: (Pick<User, 'full_name'> & { jawatan: string | null }) | null
  verified_by?: (Pick<User, 'full_name'> & { jawatan: string | null }) | null
  approved_by_user?: (Pick<User, 'full_name'> & { jawatan: string | null }) | null
}

interface PenaltyLineItem extends PenaltyPurchaseOrderItem {
  deliveries: PenaltyDelivery[]
}

interface StoredPenaltyLineItem extends Partial<PenaltyLineItem> {
  quantity_late?: number
  days_delayed?: number
  is_penalty_applicable?: boolean
}

interface SignatoryUser {
  id: string
  full_name: string
  jawatan?: string
}

interface Props {
  penalty: PenaltyDetailRecord
  onRefresh: () => void
}

export function APPLPenaltyDetailPage({ penalty, onRefresh }: Props) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const toast = useToastStore()
  const [saving, setSaving] = useState(false)
  const [isUnlockedForEditing, setIsUnlockedForEditing] = useState(false)
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
  const [editReason, setEditReason] = useState('')
  const [penaltyPaid, setPenaltyPaid] = useState<boolean>(penalty.penalty_paid || false)
  const isReadOnly = penalty.status === 'approved' && !isUnlockedForEditing
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLpoDrawerOpen, setIsLpoDrawerOpen] = useState(false)
  const [isPoDrawerOpen, setIsPoDrawerOpen] = useState(false)
  const [standards, setStandards] = useState<PerformanceStandard[]>([])
  const [loadingStandards, setLoadingStandards] = useState(true)

  // Dynamic signature states
  const [preparedById, setPreparedById] = useState(penalty.prepared_by_user_id || '')
  const [verifiedById, setVerifiedById] = useState(penalty.verified_by_user_id || '')
  const [approvedById, setApprovedById] = useState(penalty.approved_by || '')
  const [systemUsers, setSystemUsers] = useState<SignatoryUser[]>([])

  useEffect(() => {
    async function loadUsers() {
      try {
        const { getUsers } = await import('@/services/userService')
        const res = await getUsers({ pageSize: 150 })
        if (res.data) {
          setSystemUsers(res.data)
        }
      } catch (err) {
        console.error('Failed to load system users:', err)
      }
    }
    loadUsers()
  }, [])

  const selectedPreparedUser = useMemo(() => {
    return systemUsers.find(u => u.id === preparedById) || penalty.prepared_by
  }, [systemUsers, preparedById, penalty.prepared_by])

  const selectedVerifiedUser = useMemo(() => {
    return systemUsers.find(u => u.id === verifiedById) || penalty.verified_by
  }, [systemUsers, verifiedById, penalty.verified_by])

  const selectedApprovedUser = useMemo(() => {
    return systemUsers.find(u => u.id === approvedById) || penalty.approved_by_user
  }, [systemUsers, approvedById, penalty.approved_by_user])

  // Find matching PO item to auto-populate unit price, quantity, total value if not stored in penalty record
  const matchingPoItem = useMemo(() => {
    const code = penalty.item_code || penalty.order_tracking?.item_code
    const name = penalty.item_name || penalty.order_tracking?.item_name
    return penalty.purchase_order?.items?.find((i: PenaltyPurchaseOrderItem) =>
      (code && i.item_code === code) || (name && i.item_name === name)
    )
  }, [penalty])

  // Initialize items from the purchase order, parsing from penalty.notes if stored there as JSON, or fallback
  const [lpoItems, setLpoItems] = useState<PenaltyLineItem[]>(() => {
    let parsedItemsData: StoredPenaltyLineItem[] = []
    if (penalty.notes) {
      try {
        const jsonMatch = penalty.notes.match(/__LPO_ITEMS_DATA__:(.*)__END_LPO_ITEMS_DATA__/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed: unknown = JSON.parse(jsonMatch[1])
          if (Array.isArray(parsed)) parsedItemsData = parsed as StoredPenaltyLineItem[]
        }
      } catch (e) {
        console.error('Failed to parse LPO items data from notes:', e)
      }
    }

    return penalty.purchase_order?.items?.map((item): PenaltyLineItem => {
      const storedItem = parsedItemsData.find(i => i.item_code === item.item_code)
      
      const initialDeliveries = storedItem?.deliveries || [
        {
          id: Math.random().toString(36).substring(2, 9),
          delivery_number: '1st Delivery',
          quantity_late: storedItem ? storedItem.quantity_late : (item.quantity_ordered || 0),
          days_delayed: storedItem ? storedItem.days_delayed : (penalty.days_delayed || 0),
          is_penalty_applicable: storedItem ? storedItem.is_penalty_applicable : true
        }
      ]

      return {
        ...item,
        deliveries: initialDeliveries
      }
    }) || []
  })

  const totalQtyLate = useMemo(() => {
    return lpoItems.reduce((sum, item) => {
      const itemSum = item.deliveries?.reduce((s, d) => d.is_penalty_applicable ? s + Number(d.quantity_late || 0) : s, 0) || 0
      return sum + itemSum
    }, 0)
  }, [lpoItems])

  const totalFailedValue = useMemo(() => {
    return lpoItems.reduce((sum, item) => {
      const itemSum = item.deliveries?.reduce((s, d) => d.is_penalty_applicable ? s + (Number(item.unit_price || 0) * Number(d.quantity_late || 0)) : s, 0) || 0
      return sum + itemSum
    }, 0)
  }, [lpoItems])

  const maxDaysDelayed = useMemo(() => {
    return lpoItems.reduce((max, item) => {
      const itemMax = item.deliveries?.reduce((m, d) => d.is_penalty_applicable ? Math.max(m, Number(d.days_delayed || 0)) : m, 0) || 0
      return Math.max(max, itemMax)
    }, 0)
  }, [lpoItems])

  const addDeliveryRowForItem = (itemCode: string) => {
    setLpoItems(prev => prev.map(item => {
      if ((item.item_code || item.id) !== itemCode) return item
      const nextIdx = (item.deliveries?.length || 0) + 1
      const getOrdinalSuffix = (i: number) => {
        const j = i % 10, k = i % 100
        if (j === 1 && k !== 11) return 'st'
        if (j === 2 && k !== 12) return 'nd'
        if (j === 3 && k !== 13) return 'rd'
        return 'th'
      }
      return {
        ...item,
        deliveries: [
          ...(item.deliveries || []),
          {
            id: Math.random().toString(36).substring(2, 9),
            delivery_number: `${nextIdx}${getOrdinalSuffix(nextIdx)} Delivery`,
            quantity_late: 0,
            days_delayed: 0,
            is_penalty_applicable: true
          }
        ]
      }
    }))
  }

  const removeDeliveryRow = (itemCode: string, deliveryId: string) => {
    setLpoItems(prev => prev.map(item => {
      if ((item.item_code || item.id) !== itemCode) return item
      return {
        ...item,
        deliveries: (item.deliveries || []).filter(d => d.id !== deliveryId)
      }
    }))
  }

  const updateDeliveryField = <K extends keyof PenaltyDelivery>(itemCode: string, deliveryId: string, field: K, value: PenaltyDelivery[K]) => {
    setLpoItems(prev => prev.map(item => {
      if ((item.item_code || item.id) !== itemCode) return item
      return {
        ...item,
        deliveries: (item.deliveries || []).map(d => d.id === deliveryId ? { ...d, [field]: value } : d)
      }
    }))
  }

  // Editable fields
  const [itemName, ] = useState(penalty.item_name || penalty.order_tracking?.item_name || '')
  const [itemCode, ] = useState(penalty.item_code || penalty.order_tracking?.item_code || '')
  const [quantity, setQuantity] = useState(() => {
    if (penalty.quantity) return Number(penalty.quantity)
    if (matchingPoItem?.quantity_ordered) return Number(matchingPoItem.quantity_ordered)
    return 0
  })
  const [unitPrice, ] = useState(() => {
    if (penalty.unit_price) return Number(penalty.unit_price)
    if (matchingPoItem?.unit_price) return Number(matchingPoItem.unit_price)
    return 0
  })
  const [daysDelayed, setDaysDelayed] = useState(penalty.days_delayed || 0)
  const [totalOrderValue, setTotalOrderValue] = useState(() => {
    if (penalty.total_order_value) return Number(penalty.total_order_value)
    if (penalty.purchase_order?.total_amount) return Number(penalty.purchase_order.total_amount)
    if (penalty.purchase_order?.items && penalty.purchase_order.items.length > 0) {
      const sum = penalty.purchase_order.items.reduce((s, i) => s + Number(i.total_price || 0), 0)
      if (sum > 0) return sum
    }
    if (matchingPoItem?.total_price) return Number(matchingPoItem.total_price)
    return 0
  })
  const [failedProductValue, setFailedProductValue] = useState(() => {
    if (penalty.failed_product_value) return Number(penalty.failed_product_value)
    if (matchingPoItem?.total_price) return Number(matchingPoItem.total_price)
    if (matchingPoItem && matchingPoItem.unit_price && matchingPoItem.quantity_ordered) {
      return Number(matchingPoItem.unit_price) * Number(matchingPoItem.quantity_ordered)
    }
    return 0
  })
  const [doNumber, setDoNumber] = useState(penalty.receiving?.do_number || '')
  const [invoiceNumber, setInvoiceNumber] = useState(penalty.payment_reference || '')
  const [paymentKaedah, setPaymentKaedah] = useState<number>(penalty.payment_kaedah || 1)

  useEffect(() => {
    setDaysDelayed(maxDaysDelayed)
  }, [maxDaysDelayed])

  useEffect(() => {
    setFailedProductValue(totalFailedValue)
  }, [totalFailedValue])

  useEffect(() => {
    setQuantity(totalQtyLate)
  }, [totalQtyLate])
  
  // Performance Standards Selected
  const [selectedStandards, setSelectedStandards] = useState<string[]>(
    penalty.performance_standards_violated || []
  )

  const supplier = penalty.supplier
  const lpo = penalty.lpo
  const po = penalty.purchase_order

  useEffect(() => {
    loadStandards()
  }, [])

  const loadStandards = async () => {
    setLoadingStandards(true)
    try {
      const res = await getPerformanceStandards()
      if (res.data) {
        setStandards(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingStandards(false)
    }
  }

  // Calculate APPL penalties based on selected standards
  const calculation = useMemo(() => {
    let total = 0
    const details = selectedStandards.map(code => {
      const std = standards.find(s => s.code === code)
      if (!std) return { code, amount: 0 }
      
      let amount = 0
      if (std.penalty_type === 'percentage' && std.penalty_rate) {
        amount = lpoItems.reduce((sum, item) => {
          const itemDeliveriesSum = (item.deliveries || []).reduce((delSum: number, del: PenaltyDelivery) => {
            if (!del.is_penalty_applicable) return delSum
            const delFailedValue = Number(item.unit_price || 0) * Number(del.quantity_late || 0)
            return delSum + (Number(std.penalty_rate) * delFailedValue * Number(del.days_delayed || 0))
          }, 0)
          return sum + itemDeliveriesSum
        }, 0)
      } else if (std.penalty_type === 'fixed' && std.fixed_amount) {
        amount = Number(std.fixed_amount)
      } else if (std.penalty_type === 'per_incident' && std.fixed_amount) {
        amount = Number(std.fixed_amount) // assume 1 incident by default
      } else if (std.penalty_type === 'per_day' && std.fixed_amount) {
        amount = Number(std.fixed_amount) * maxDaysDelayed
      } else if (std.fixed_amount) {
        amount = Number(std.fixed_amount)
      }
      
      total += amount
      return { code, title: std.description_bm, amount }
    })

    return { total, details }
  }, [selectedStandards, standards, lpoItems, maxDaysDelayed])

  const toggleStandard = (code: string) => {
    if (selectedStandards.includes(code)) {
      setSelectedStandards(selectedStandards.filter(c => c !== code))
    } else {
      setSelectedStandards([...selectedStandards, code])
    }
  }

  const formatDate = (d?: string) => {
    if (!d) return 'â€”'
    return new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const handleTogglePaid = async () => {
    setSaving(true)
    try {
      const nextPaidState = !penaltyPaid
      const res = await updatePenaltyDetails(penalty.id, {
        penalty_paid: nextPaidState
      })
      if (res.error) throw new Error(res.error)
      setPenaltyPaid(nextPaidState)
      toast.success(
        nextPaidState ? 'Penalty Paid' : 'Penalty Unpaid',
        `Successfully marked penalty as ${nextPaidState ? 'Paid' : 'Unpaid'}.`
      )
      if (onRefresh) onRefresh()
    } catch (error: unknown) {
      toast.error('Error', (error instanceof Error ? error.message : 'Failed to update payment status.'))
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const serializedData = `__LPO_ITEMS_DATA__:${JSON.stringify(lpoItems.map(i => ({
        item_code: i.item_code,
        deliveries: i.deliveries
      })))}__END_LPO_ITEMS_DATA__`

      const cleanNotes = editReason
        ? (penalty.notes ? penalty.notes.replace(/__LPO_ITEMS_DATA__:.*__END_LPO_ITEMS_DATA__/, '').trim() + '\n' : '') + `[Edit Request - Reason: ${editReason}] by user ${user?.email || ''} at ${new Date().toLocaleString()}`
        : (penalty.notes ? penalty.notes.replace(/__LPO_ITEMS_DATA__:.*__END_LPO_ITEMS_DATA__/, '').trim() : '');

      const finalNotes = (cleanNotes + '\n' + serializedData).trim()

      const res = await updatePenaltyDetails(penalty.id, {
        item_name: itemName,
        item_code: itemCode,
        quantity: totalQtyLate,
        unit_price: unitPrice,
        days_delayed: maxDaysDelayed,
        total_order_value: totalOrderValue,
        failed_product_value: totalFailedValue,
        payment_kaedah: paymentKaedah,
        performance_standards_violated: selectedStandards,
        penalty_amount: calculation.total,
        payment_reference: invoiceNumber,
        do_number: doNumber,
        penalty_paid: penaltyPaid,
        notes: finalNotes,
        
        // Dynamic Signature Blocks
        prepared_by_user_id: preparedById || undefined,
        prepared_by_name: preparedById ? (selectedPreparedUser?.full_name || 'AMRI AMIT') : undefined,
        prepared_by_designation: preparedById ? (selectedPreparedUser?.jawatan || 'PENOLONG PEGAWAI FARMASI U5') : undefined,
        prepared_at: preparedById ? (penalty.prepared_at || new Date().toISOString()) : undefined,

        verified_by_user_id: verifiedById || undefined,
        verified_by_name: verifiedById ? (selectedVerifiedUser?.full_name || 'KAMRIAH BT HAJI MAIL') : undefined,
        verified_by_designation: verifiedById ? (selectedVerifiedUser?.jawatan || 'PENOLONG PEGAWAI FARMASI U7 TBK 2') : undefined,
        verified_at: verifiedById ? (penalty.verified_at || new Date().toISOString()) : undefined,

        approved_by_name: approvedById ? (selectedApprovedUser?.full_name || 'TAN YUAN ZHANG') : undefined,
        approved_by_designation: approvedById ? (selectedApprovedUser?.jawatan || 'PEGAWAI FARMASI UF 12') : undefined
      })
      if (res.error) throw new Error(res.error)
      toast.success('Saved', 'APPL Penalty details updated successfully.')
      setIsUnlockedForEditing(false)
      setEditReason('')
      onRefresh()
    } catch (err: unknown) {
      toast.error('Error', (err instanceof Error ? err.message : 'Failed to save.'))
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      await handleSave()
      const res = await approvePenalty(penalty.id, user.id)
      if (res.error) throw new Error(res.error)
      toast.success('Approved', 'Penalty has been approved.')
      onRefresh()
    } catch (err: unknown) {
      toast.error('Error', (err instanceof Error ? err.message : 'Failed to approve.'))
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = async () => {
    try {
      const { generateAPPLPenaltyPdf } = await import('@/services/pharmacy/applPenaltyPdfService')
      const doc = await generateAPPLPenaltyPdf({
        ...penalty,
        item_name: itemName,
        item_code: itemCode,
        quantity,
        unit_price: unitPrice,
        days_delayed: daysDelayed,
        total_order_value: totalOrderValue,
        failed_product_value: failedProductValue,
        payment_kaedah: paymentKaedah,
        performance_standards_violated: selectedStandards,
        penalty_amount: calculation.total,
        payment_reference: invoiceNumber,
        do_number: doNumber,
        
        // Pass dynamic signatures for pdf printing
        prepared_by_user_id: preparedById || null,
        prepared_by_name: preparedById ? (selectedPreparedUser?.full_name || 'AMRI AMIT') : '',
        prepared_by_designation: preparedById ? (selectedPreparedUser?.jawatan || 'PENOLONG PEGAWAI FARMASI U5') : '',
        prepared_at: preparedById ? (penalty.prepared_at || new Date().toISOString()) : null,

        verified_by_user_id: verifiedById || null,
        verified_by_name: verifiedById ? (selectedVerifiedUser?.full_name || 'KAMRIAH BT HAJI MAIL') : '',
        verified_by_designation: verifiedById ? (selectedVerifiedUser?.jawatan || 'PENOLONG PEGAWAI FARMASI U7 TBK 2') : '',
        verified_at: verifiedById ? (penalty.verified_at || new Date().toISOString()) : null,

        approved_by: approvedById || null,
        approved_by_name: approvedById ? (selectedApprovedUser?.full_name || 'TAN YUAN ZHANG') : '',
        approved_by_designation: approvedById ? (selectedApprovedUser?.jawatan || 'PEGAWAI FARMASI UF 12') : '',
        approved_at: approvedById ? (penalty.approved_at || new Date().toISOString()) : null
      }, standards)
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setIsPreviewOpen(true)
      toast.success('Preview Ready', 'Checklist preview generated.')
    } catch (err: unknown) {
      toast.error('Error', (err instanceof Error ? err.message : 'Failed to generate PDF.'))
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-subtle/50 text-text-muted border-border-default',      // Draft
    enforced: 'bg-amber-500/10 text-amber-700 border-amber-500/20',    // Pending
    approved: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', // Approved
    waived: 'bg-rose-500/10 text-rose-700 border-rose-500/20'            // Rejected
  }

  const mapStatusLabel = (status: string) => {
    const norm = status?.toLowerCase() || ''
    if (norm === 'pending') return 'Draft'
    if (norm === 'enforced') return 'Pending'
    if (norm === 'approved') return 'Approved'
    if (norm === 'waived') return 'Rejected'
    return status
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] relative font-sans selection:bg-slate-900 selection:text-white">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.01] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-500/[0.02] to-fuchsia-500/[0.02] rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full p-6 lg:p-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Procurement</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button onClick={() => navigate(-1)} className="hover:text-text-muted transition-colors">Penalty Registry</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-text-primary font-extrabold">APPL Penalty Detail</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-surface border border-border-default rounded-xl flex items-center justify-center hover:bg-subtle/50 transition-colors shadow-sm">
              <ArrowLeft className="w-4 h-4 text-text-muted" />
            </button>
            <div className="space-y-0.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-surface border border-border-default">
                  LAMPIRAN 9 â€” Borang Tuntutan Penalti
                </h1>
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${statusColors[penalty.status] || statusColors.pending}`}>
                  {mapStatusLabel(penalty.status)}
                </span>
              </div>
              <p className="text-text-muted font-semibold text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                LPO: {lpo?.lpo_number || 'â€”'} â€¢ <span className="text-indigo-600 font-black">APPL PENALTY (990102)</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-surface text-text-secondary hover:bg-subtle/50 rounded-xl border border-border-default transition-colors shadow-sm">
              <Printer className="w-3.5 h-3.5" /> Print Checklist
            </button>
            <button 
              onClick={handleTogglePaid} 
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors shadow-md disabled:opacity-50 ${
                penaltyPaid 
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/10' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10'
              }`}
            >
              {penaltyPaid ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {penaltyPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
            </button>
            {isReadOnly ? (
              <button onClick={() => setIsUnlockModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 transition-colors">
                <Unlock className="w-3.5 h-3.5" /> Unlock to Edit
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-600/10 disabled:opacity-50">
                  {saving ? <Spinner size="sm" /> : <Save className="w-3.5 h-3.5" />} Save Changes
                </button>
                {penalty.status !== 'approved' && (
                  <button onClick={handleApprove} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-md shadow-emerald-600/10 disabled:opacity-50">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Sign
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column â€” Info & Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info Section */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-subtle bg-subtle/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 border border-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-black text-sm text-text-primary uppercase tracking-wider">Delivery & Product Info</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Supplier Company</label>
                  <p className="font-bold text-text-primary flex items-center gap-2 bg-subtle/50 border border-border-default px-3 py-2 rounded-lg">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    {supplier?.company_name || 'â€”'}
                  </p>
                </div>
                <div className="sm:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">LPO Items & Delivery Batches ({lpoItems.length})</label>
                  <div className="space-y-6">
                    {lpoItems.map((item: PenaltyLineItem, idx: number) => {
                      const itemPrice = Number(item.unit_price || 0)
                      const itemQtyOrdered = Number(item.quantity_ordered || 0)

                      return (
                        <div key={item.item_code || idx} className="bg-subtle/50 border border-border-default rounded-2xl p-5 space-y-4 hover:shadow-md transition-colors duration-150">
                          {/* Item header */}
                          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between border-b border-border-default pb-4">
                            <div className="space-y-1">
                              <span className="inline-flex px-2 py-0.5 text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-700 border border-indigo-150 rounded tracking-wider">ITEM {idx + 1}</span>
                              <h3 className="font-extrabold text-text-primary text-xs tracking-tight leading-snug">{item.item_name}</h3>
                              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">KKM Code: <span className="font-mono text-text-primary">{item.item_code}</span></p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-650 bg-surface px-3 py-2 rounded-xl border border-border-default shadow-sm shrink-0">
                              <div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">UNIT PRICE</span>
                                <span className="font-mono text-text-primary">RM {itemPrice.toFixed(2)}</span>
                              </div>
                              <div className="w-px h-6 bg-subtle" />
                              <div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">QTY ORDERED</span>
                                <span className="text-text-primary">{itemQtyOrdered}</span>
                              </div>
                              <div className="w-px h-6 bg-subtle" />
                              <button
                                type="button"
                                onClick={() => !isReadOnly && addDeliveryRowForItem(item.item_code || item.id)}
                                disabled={isReadOnly}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white text-[9px] font-black rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Batch
                              </button>
                            </div>
                          </div>

                          {/* Deliveries table */}
                          <div className="overflow-hidden border border-border-default rounded-xl shadow-sm bg-surface">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-[9px] font-black text-text-muted uppercase tracking-wider border-b border-border-default bg-subtle/50">
                                  <th className="p-2 text-center w-12">Late?</th>
                                  <th className="p-2 text-left">Delivery Batch No.</th>
                                  <th className="p-2 text-right w-24">Qty Late</th>
                                  <th className="p-2 text-right w-20">Days Late</th>
                                  <th className="p-2 text-right w-36">Failed Value</th>
                                  <th className="p-2 text-center w-12"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border-subtle font-bold">
                                {(item.deliveries || []).length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="p-4 text-center text-text-muted font-medium italic">No batches registered. Click "Add Batch" to log a delivery.</td>
                                  </tr>
                                ) : (
                                  item.deliveries.map((del: PenaltyDelivery) => {
                                    const delFailedValue = itemPrice * Number(del.quantity_late || 0)
                                    return (
                                      <tr key={del.id} className={`hover:bg-subtle/50 transition-colors ${del.is_penalty_applicable ? 'bg-red-50/[0.01]' : 'opacity-70 bg-subtle/50'}`}>
                                        <td className="p-2 text-center">
                                          <input
                                            type="checkbox"
                                            checked={del.is_penalty_applicable}
                                            disabled={isReadOnly}
                                            onChange={e => updateDeliveryField(item.item_code || item.id, del.id, 'is_penalty_applicable', e.target.checked)}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-border-default cursor-pointer"
                                          />
                                        </td>
                                        <td className="p-2">
                                          <input
                                            value={del.delivery_number}
                                            onChange={e => updateDeliveryField(item.item_code || item.id, del.id, 'delivery_number', e.target.value)}
                                            disabled={isReadOnly || !del.is_penalty_applicable}
                                            className="w-full px-2 py-1 bg-subtle/50 border border-border-default rounded-lg text-xs font-bold focus:bg-surface focus:border-indigo-500 outline-none transition-colors disabled:opacity-50"
                                          />
                                        </td>
                                        <td className="p-2 text-right">
                                          <input
                                            type="number"
                                            min="0"
                                            max={itemQtyOrdered}
                                            value={del.quantity_late}
                                            onChange={e => updateDeliveryField(item.item_code || item.id, del.id, 'quantity_late', Math.max(0, Number(e.target.value)))}
                                            disabled={isReadOnly || !del.is_penalty_applicable}
                                            className="w-16 px-1.5 py-1 text-right bg-subtle/50 border border-border-default rounded focus:bg-surface focus:border-indigo-500 outline-none transition-colors disabled:opacity-50 font-mono"
                                          />
                                        </td>
                                        <td className="p-2 text-right">
                                          <input
                                            type="number"
                                            min="0"
                                            value={del.days_delayed}
                                            onChange={e => updateDeliveryField(item.item_code || item.id, del.id, 'days_delayed', Math.max(0, Number(e.target.value)))}
                                            disabled={isReadOnly || !del.is_penalty_applicable}
                                            className="w-12 px-1.5 py-1 text-right bg-subtle/50 border border-border-default rounded focus:bg-surface focus:border-indigo-500 outline-none transition-colors disabled:opacity-50 font-mono"
                                          />
                                        </td>
                                        <td className="p-2 text-right font-mono text-red-650 tabular-nums">
                                          {del.is_penalty_applicable ? `RM ${delFailedValue.toFixed(2)}` : 'â€”'}
                                        </td>
                                        <td className="p-2 text-center">
                                          <button
                                            type="button"
                                            onClick={() => !isReadOnly && removeDeliveryRow(item.item_code || item.id, del.id)}
                                            disabled={isReadOnly}
                                            className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    )
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">LPO Number</label>
                  {lpo?.document_url ? (
                    <button
                      onClick={() => setIsLpoDrawerOpen(true)}
                      className="w-full px-3 py-2 text-sm font-bold bg-subtle/50 border border-border-default text-indigo-650 hover:text-indigo-850 hover:underline transition-colors rounded-lg inline-flex items-center gap-1.5 text-left cursor-pointer focus:outline-none"
                      title="Click to preview LPO document"
                    >
                      <FileText className="w-4 h-4 shrink-0 text-indigo-500" />
                      {lpo.lpo_number}
                    </button>
                  ) : (
                    <p className="w-full px-3 py-2 text-sm font-bold bg-subtle/50 border border-border-default text-indigo-600 rounded-lg">{lpo?.lpo_number || 'â€”'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">System PO ID</label>
                  {po?.id || penalty.po_id ? (
                    <button
                      onClick={() => setIsPoDrawerOpen(true)}
                      className="w-full px-3 py-2 text-sm font-bold bg-subtle/50 border border-border-default text-text-primary hover:text-indigo-750 hover:underline transition-colors rounded-lg inline-flex items-center gap-1.5 text-left cursor-pointer focus:outline-none"
                      title="Click to view Purchase Order details"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      {po?.po_number || 'View PO Details'}
                    </button>
                  ) : (
                    <p className="w-full px-3 py-2 text-sm font-bold bg-subtle/50 border border-border-default text-text-primary rounded-lg">{po?.po_number || 'â€”'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">DO Number</label>
                  <input value={doNumber} onChange={e => setDoNumber(e.target.value)} disabled={isReadOnly}
                    className="w-full px-3 py-2 text-sm font-bold bg-subtle/50 border border-border-default rounded-lg focus:bg-surface focus:border-indigo-500 outline-none transition-colors disabled:opacity-75 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Invoice Number</label>
                  <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} disabled={isReadOnly}
                    className="w-full px-3 py-2 text-sm font-bold bg-subtle/50 border border-border-default rounded-lg focus:bg-surface focus:border-indigo-500 outline-none transition-colors disabled:opacity-75 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quantity Received</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} disabled={isReadOnly}
                    className="w-full px-3 py-2 text-sm font-bold bg-subtle/50 border border-border-default rounded-lg focus:bg-surface focus:border-indigo-500 outline-none transition-colors disabled:opacity-75 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Unit Price (RM)</label>
                  <input type="number" step="0.01" value={unitPrice} readOnly={true}
                    className="w-full px-3 py-2 text-sm font-bold bg-subtle border border-border-default text-text-muted rounded-lg outline-none cursor-not-allowed text-right" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payment Status</label>
                  <select
                    disabled={isReadOnly}
                    value={penaltyPaid ? 'true' : 'false'}
                    onChange={e => setPenaltyPaid(e.target.value === 'true')}
                    className="w-full px-3 py-2 text-sm font-bold bg-subtle/50 border border-border-default rounded-lg focus:bg-surface focus:border-indigo-500 outline-none transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="false">Unpaid / Pending</option>
                    <option value="true">Paid / Settled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Performance Standards Checklist Card */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-subtle bg-subtle/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/10 border border-amber-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-black text-sm text-text-primary uppercase tracking-wider">02. APPL Performance Standards Violation Checklist</h3>
              </div>
              <div className="p-6">
                {loadingStandards ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="text-indigo-600" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {standards.map(std => {
                      const isSelected = selectedStandards.includes(std.code)
                      const calculatedDetail = calculation.details.find(d => d.code === std.code)
                      let previewAmount = calculatedDetail ? calculatedDetail.amount : 0
                      if (!isSelected && previewAmount === 0) {
                        // Estimate preview if not currently selected
                        if (std.penalty_type === 'percentage' && std.penalty_rate) {
                          previewAmount = lpoItems.reduce((sum, item) => {
                            const itemDeliveriesSum = (item.deliveries || []).reduce((delSum: number, del: PenaltyDelivery) => {
                              if (!del.is_penalty_applicable) return delSum
                              const delFailedValue = Number(item.unit_price || 0) * Number(del.quantity_late || 0)
                              return delSum + (Number(std.penalty_rate) * delFailedValue * Number(del.days_delayed || 0))
                            }, 0)
                            return sum + itemDeliveriesSum
                          }, 0)
                        } else if (std.penalty_type === 'fixed' && std.fixed_amount) {
                          previewAmount = Number(std.fixed_amount)
                        } else if (std.penalty_type === 'per_incident' && std.fixed_amount) {
                          previewAmount = Number(std.fixed_amount)
                        } else if (std.penalty_type === 'per_day' && std.fixed_amount) {
                          previewAmount = Number(std.fixed_amount) * maxDaysDelayed
                        } else if (std.fixed_amount) {
                          previewAmount = Number(std.fixed_amount)
                        }
                      }

                      return (
                        <div key={std.id} onClick={() => !isReadOnly && toggleStandard(std.code)}
                          className={`p-4 rounded-xl border transition-colors select-none ${
                            isReadOnly ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            isSelected 
                              ? 'bg-indigo-500/10 border-indigo-500/20 shadow-sm' 
                              : 'bg-surface hover:bg-subtle/50 border-border-subtle'
                          }`}>
                          <div className="mt-0.5">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-black text-xs uppercase tracking-wider text-text-primary">
                                {std.code} â€” {std.penalty_formula}
                              </span>
                              {previewAmount > 0 && (
                                <span className={`text-xs font-black tabular-nums ${isSelected ? 'text-indigo-700' : 'text-text-muted'}`}>
                                  RM {previewAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted font-semibold leading-relaxed">
                              {std.description_bm}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column â€” Finance & Digital Signatures */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* Financial Card */}
            <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-subtle bg-gradient-to-br from-indigo-900 to-slate-950 text-white">
                <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> APPL Calculations
                </h3>
              </div>
              <div className="p-6 space-y-5">
                {/* LPO Value */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total LPO Value (RM)</label>
                  <input type="number" step="0.01" value={totalOrderValue} onChange={e => setTotalOrderValue(Number(e.target.value))} disabled={isReadOnly}
                    className="w-full px-3 py-2.5 text-sm font-black text-text-primary bg-subtle/50 border border-border-default rounded-xl focus:bg-surface focus:border-indigo-500 outline-none transition-colors text-right tabular-nums disabled:opacity-75 disabled:cursor-not-allowed" />
                </div>

                {/* Failed Product Value */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Failed Product Value (RM)</label>
                  <input type="number" step="0.01" value={failedProductValue} onChange={e => setFailedProductValue(Number(e.target.value))} disabled={isReadOnly}
                    className="w-full px-3 py-2.5 text-sm font-black text-text-primary bg-subtle/50 border border-border-default rounded-xl focus:bg-surface focus:border-indigo-500 outline-none transition-colors text-right tabular-nums disabled:opacity-75 disabled:cursor-not-allowed" />
                </div>

                {/* Days Delayed */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Days Delayed</label>
                  <input type="number" value={daysDelayed} onChange={e => setDaysDelayed(Number(e.target.value))} disabled={isReadOnly}
                    className="w-full px-3 py-2.5 text-sm font-black text-text-primary bg-subtle/50 border border-border-default rounded-xl focus:bg-surface focus:border-indigo-500 outline-none transition-colors text-center tabular-nums disabled:opacity-75 disabled:cursor-not-allowed" />
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tuntutan Kaedah</label>
                  <select value={paymentKaedah} onChange={e => setPaymentKaedah(Number(e.target.value))} disabled={isReadOnly}
                    className="w-full px-3 py-2.5 text-sm font-bold bg-subtle/50 border border-border-default rounded-xl focus:border-indigo-500 outline-none transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed">
                    <option value={1}>Kaedah 1 â€” Potongan Baucer Bayaran</option>
                    <option value={2}>Kaedah 2 â€” Bayaran Cek</option>
                  </select>
                </div>

                <div className="border-t border-border-subtle pt-4 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Selected Violations</span>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {calculation.details.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-semibold text-text-muted bg-slate-55 border border-border-subtle rounded-lg p-2">
                        <span>{d.code}</span>
                        <span className="font-bold text-red-600 tabular-nums">RM {d.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {calculation.details.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-2">No violations selected</p>
                    )}
                  </div>
                </div>

                {/* Total Penalty */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-500/20 rounded-xl p-4 text-center space-y-1">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Total APPL Penalty</span>
                  <span className="text-3xl font-black text-indigo-400 dark:text-indigo-300 font-bold block tabular-nums">
                    RM {calculation.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* DIGITAL SIGNATURES & VERIFICATION FLOW */}
            <div className="bg-surface rounded-2xl border border-border-default border-l-4 border-l-indigo-600 shadow-md shadow-slate-100 overflow-hidden p-6 space-y-6 transition-colors hover:shadow-lg hover:shadow-slate-200/50 duration-300">
              <div className="flex items-center gap-3 pb-4 border-b border-border-default">
                <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center font-black text-xs text-violet-600 shadow-sm">
                  03
                </div>
                <div>
                  <h2 className="text-sm font-black text-text-primary uppercase tracking-wider text-left">PERAKUAN & KELULUSAN DIGITAL</h2>
                  <p className="text-[10px] text-text-secondary font-bold font-bold uppercase tracking-wider text-left">Administrative verification chain</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {[
                  {
                    id: preparedById,
                    setId: setPreparedById,
                    label: '1. DISEDIAKAN OLEH (PREPARED BY)',
                    name: selectedPreparedUser?.full_name || penalty.prepared_by_name || 'AMRI AMIT',
                    role: selectedPreparedUser?.jawatan || penalty.prepared_by_designation || 'PENOLONG PEGAWAI FARMASI U5',
                    date: preparedById ? (penalty.prepared_at || new Date().toISOString()) : penalty.prepared_at
                  },
                  {
                    id: verifiedById,
                    setId: setVerifiedById,
                    label: '2. DISEMAK OLEH (VERIFIED BY)',
                    name: selectedVerifiedUser?.full_name || penalty.verified_by_name || 'KAMRIAH BT HAJI MAIL',
                    role: selectedVerifiedUser?.jawatan || penalty.verified_by_designation || 'PENOLONG PEGAWAI FARMASI U7 TBK 2',
                    date: verifiedById ? (penalty.verified_at || new Date().toISOString()) : penalty.verified_at
                  },
                  {
                    id: approvedById,
                    setId: setApprovedById,
                    label: '3. DISAHKAN OLEH (APPROVED BY)',
                    name: selectedApprovedUser?.full_name || 'TAN YUAN ZHANG',
                    role: selectedApprovedUser?.jawatan || 'PEGAWAI FARMASI UF 12',
                    date: approvedById ? (penalty.approved_at || new Date().toISOString()) : penalty.approved_at
                  },
                ].map((sig, i) => (
                  <div 
                    key={i} 
                    className={`border-2 rounded-xl p-5 text-center space-y-4 flex flex-col justify-between min-h-[250px] transition-colors duration-350 ${
                      sig.id 
                        ? 'bg-emerald-500/10 border-emerald-300 shadow-sm shadow-emerald-100 border-t-4 border-t-emerald-500' 
                        : 'bg-subtle/50 border-border-default shadow-inner border-t-4 border-t-amber-500'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sig.label}</span>
                        {sig.id ? (
                           <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-emerald-100 text-emerald-700 rounded border border-emerald-500/20">SIGNED</span>
                        ) : (
                           <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-amber-500/10 text-amber-700 border border-amber-100 rounded">PENDING</span>
                        )}
                      </div>
                      
                      {sig.id ? (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-emerald-100/60 border border-emerald-250 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-pulse" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-black text-text-primary text-sm tracking-tight">{sig.name}</p>
                            {sig.role && <p className="text-[10px] text-text-muted font-bold leading-tight uppercase">{sig.role}</p>}
                            {sig.date && <p className="text-[9px] text-slate-400 font-mono mt-1">{formatDate(sig.date)} â€¢ {new Date(sig.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</p>}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 py-3">
                          <div className="w-12 h-12 bg-subtle border border-border-default rounded-full flex items-center justify-center mx-auto text-slate-400 font-bold text-lg shadow-sm">
                            â€”
                          </div>
                          <p className="text-[11px] text-text-secondary font-bold font-bold uppercase tracking-wider">Awaiting dynamic sign-off</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-border-default space-y-1.5 text-left">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">SELECT AUTHORIZED OFFICER</label>
                      <select
                        value={sig.id}
                        onChange={e => sig.setId(e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 text-xs font-extrabold bg-surface border border-slate-250 rounded-xl focus:border-indigo-500 outline-none transition-colors cursor-pointer text-text-primary shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Choose Signatory --</option>
                        {systemUsers.map((u: SignatoryUser) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} ({u.jawatan || 'Pegawai'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SlideOver
        isOpen={isLpoDrawerOpen}
        onClose={() => setIsLpoDrawerOpen(false)}
        title="LPO DOCUMENT PREVIEW"
        description={`LPO Number Reference: ${lpo?.lpo_number || ''}`}
        size="7xl"
      >
        <div className="h-full flex flex-col p-6 bg-subtle/50 overflow-hidden">
          {lpo?.document_url ? (
            <PDFViewer url={lpo.document_url} title={`LPO ${lpo.lpo_number}`} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 space-y-3 bg-surface rounded-xl border border-border-subtle shadow-sm">
              <FileText className="w-12 h-12 text-slate-350" />
              <p className="font-bold text-sm">No LPO Document URL available.</p>
            </div>
          )}
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isPoDrawerOpen}
        onClose={() => setIsPoDrawerOpen(false)}
        title="Purchase Order Details"
        size="5xl"
      >
        {(po?.id || penalty.po_id) && (
          <PurchaseOrderDetailView 
            id={penalty.po_id || po?.id || ''}
            onClose={() => setIsPoDrawerOpen(false)} 
            isSlideOver={true}
            onMutate={onRefresh}
          />
        )}
      </SlideOver>

      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
          }
        }}
        pdfUrl={previewUrl}
        title="Checklist Tuntutan Penalti APPL"
        fileName={`Borang_LAMPIRAN_9_${penalty.id.slice(0, 8).toUpperCase()}.pdf`}
      />
      {/* Unlock to Edit Modal */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsUnlockModalOpen(false)}></div>
          
          <div className="bg-surface rounded-2xl shadow-xl border border-border-default w-full max-w-md relative z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-subtle/50">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-650" />
                Unlock Approved Penalty
              </h3>
              <button 
                onClick={() => setIsUnlockModalOpen(false)}
                className="text-slate-400 hover:text-text-muted transition-colors p-1"
              >
                <Lock className="w-5 h-5" />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!editReason.trim()) {
                  toast.error('Required', 'Please enter a valid reason to unlock this penalty record.');
                  return;
                }
                setIsUnlockedForEditing(true);
                setIsUnlockModalOpen(false);
                toast.success('Record Unlocked', 'You can now make modifications to this approved penalty record.');
              }} 
              className="p-6 space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text-secondary">
                  Reason for Editing <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-text-muted font-medium">
                  Since this penalty has already been officially approved, you must provide a valid justification to unlock it for changes. This reason will be logged in the audit notes history.
                </p>
                <textarea
                  required
                  rows={4}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g., Correcting incorrect quantity received after supplier consultation..."
                  className="w-full px-3 py-2 bg-surface border border-slate-350 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsUnlockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-surface text-text-secondary hover:bg-subtle/50 border border-border-default rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-650/10 flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" /> Confirm Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
