// src/modules/myperolehan/components/CreateAdminPOModal.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Plus,
  Trash2,
  Building,
  HardHat,
  ShoppingCart
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import {
  getAdminHierarchy,
  getSuppliers,
  getPerihalCatalog,
  createPurchaseOrder
} from '../services/perolehanAdminService'
import type {
  AdminProgram,
  AdminObjek,
  AdminKategori,
  AdminSupplier,
  AdminPerihalItem,
  BudgetType,
  AdminPurchaseOrderItem
} from '@/shared/types/myperolehan'
import { Button } from '@/components/ui'

interface CreateAdminPOModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedBudgetType?: BudgetType
  preselectedProgramCode?: string
}

export const CreateAdminPOModal: React.FC<CreateAdminPOModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedBudgetType = 'warrant',
  preselectedProgramCode = '020200'
}) => {
  const { user } = useAuthStore()
  const toast = useToast()

  // Data Sources
  const [programs, setPrograms] = useState<AdminProgram[]>([])
  const [objeks, setObjeks] = useState<AdminObjek[]>([])
  const [kategoris, setKategoris] = useState<AdminKategori[]>([])
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([])
  const [catalogItems, setCatalogItems] = useState<AdminPerihalItem[]>([])

  // Form States
  const [budgetType, setBudgetType] = useState<BudgetType>(preselectedBudgetType)
  const [selectedProgramCode, setSelectedProgramCode] = useState<string>(preselectedProgramCode)
  const [selectedObjekCode, setSelectedObjekCode] = useState<string>('')
  const [selectedKategoriCode, setSelectedKategoriCode] = useState<string>('')
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // Order Items
  const [items, setItems] = useState<
    {
      perihal_id?: string
      item_description: string
      quantity: number
      unit_price: number
      unit: string
    }[]
  >([
    {
      item_description: '',
      quantity: 1,
      unit_price: 0,
      unit: 'unit'
    }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load initial hierarchy, suppliers, and catalog
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      const [hierarchyRes, suppliersRes, catalogRes] = await Promise.all([
        getAdminHierarchy(),
        getSuppliers(),
        getPerihalCatalog()
      ])

      setPrograms(hierarchyRes.programs)
      setObjeks(hierarchyRes.objeks)
      setKategoris(hierarchyRes.kategoris)
      setSuppliers(suppliersRes)
      setCatalogItems(catalogRes)

      if (preselectedBudgetType) {
        setBudgetType(preselectedBudgetType)
      }
      if (preselectedProgramCode) {
        setSelectedProgramCode(preselectedProgramCode)
      }
    }

    loadData()
  }, [isOpen, preselectedBudgetType, preselectedProgramCode])

  // Filtered Programs based on Budget Type
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => p.budget_type === budgetType)
  }, [programs, budgetType])

  useEffect(() => {
    if (filteredPrograms.length > 0) {
      if (!filteredPrograms.some((p) => p.code === selectedProgramCode)) {
        setSelectedProgramCode(filteredPrograms[0].code)
      }
    }
  }, [filteredPrograms, selectedProgramCode])

  const activeProgram = useMemo(() => {
    return programs.find((p) => p.code === selectedProgramCode)
  }, [programs, selectedProgramCode])

  const filteredObjeks = useMemo(() => {
    if (!activeProgram) return []
    return objeks.filter((o) => o.program_id === activeProgram.id)
  }, [objeks, activeProgram])

  useEffect(() => {
    if (filteredObjeks.length > 0) {
      if (!filteredObjeks.some((o) => o.code === selectedObjekCode)) {
        setSelectedObjekCode(filteredObjeks[0].code)
      }
    } else {
      setSelectedObjekCode('')
    }
  }, [filteredObjeks, selectedObjekCode])

  const activeObjek = useMemo(() => {
    return filteredObjeks.find((o) => o.code === selectedObjekCode)
  }, [filteredObjeks, selectedObjekCode])

  const filteredKategoris = useMemo(() => {
    if (!activeObjek) return []
    return kategoris.filter((k) => k.objek_id === activeObjek.id)
  }, [kategoris, activeObjek])

  useEffect(() => {
    if (filteredKategoris.length > 0) {
      if (!filteredKategoris.some((k) => k.code === selectedKategoriCode)) {
        setSelectedKategoriCode(filteredKategoris[0].code)
      }
    } else {
      setSelectedKategoriCode('')
    }
  }, [filteredKategoris, selectedKategoriCode])

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0)
  }, [items])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        item_description: '',
        quantity: 1,
        unit_price: 0,
        unit: 'unit'
      }
    ])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }

      if (field === 'perihal_id' && value) {
        const catItem = catalogItems.find((c) => c.id === value)
        if (catItem) {
          updated[index].item_description = catItem.perihal_name
          updated[index].unit_price = Number(catItem.unit_price) || 0
          updated[index].unit = catItem.unit || 'unit'
        }
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProgramCode || !selectedObjekCode || !selectedKategoriCode) {
      toast.error('Please complete Program, Object, and Category budget selections.')
      return
    }

    if (items.some((it) => !it.item_description.trim() || it.quantity <= 0 || it.unit_price < 0)) {
      toast.error('Please ensure all items have valid descriptions, quantities, and unit prices.')
      return
    }

    if (totalAmount <= 0) {
      toast.error('Order total amount must be greater than RM 0.00.')
      return
    }

    setIsSubmitting(true)
    try {
      const poPayload = {
        supplier_id: selectedSupplierId || undefined,
        order_date: orderDate,
        expected_delivery_date: expectedDeliveryDate || undefined,
        total_amount: totalAmount,
        status: 'pending_approval' as const,
        created_by: user?.id,
        notes: notes || undefined,
        program_code: selectedProgramCode,
        objek_code: selectedObjekCode,
        kategori_code: selectedKategoriCode,
        budget_type: budgetType,
        fiscal_year: new Date(orderDate).getFullYear()
      }

      const formattedItems: AdminPurchaseOrderItem[] = items.map((it) => ({
        perihal_id: it.perihal_id || undefined,
        item_description: it.item_description,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        total_price: Number(it.quantity) * Number(it.unit_price),
        unit: it.unit
      }))

      const { error } = await createPurchaseOrder(poPayload, formattedItems)
      if (error) throw error

      toast.success('Purchase Order (PO) Successfully Created!')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error submitting PO:', err)
      toast.error('Failed to create Purchase Order', err.message || 'System error.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl bg-surface border border-border-default rounded-[2rem] p-6 sm:p-8 text-text-primary shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-border-subtle mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-primary flex items-center gap-2">
                <span>Create Purchase Order (PO)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 font-bold border border-indigo-500/20">
                  NEW ORDER
                </span>
              </h2>
              <p className="text-xs text-text-muted">
                Select budget code (Operating / Development) & catalog items for local purchase order
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-text-secondary hover:bg-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Budget Type Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              1. Primary Budget Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBudgetType('warrant')}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
                  budgetType === 'warrant'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 dark:text-blue-300 font-bold shadow-xs'
                    : 'bg-surface border-border-default text-text-muted hover:border-border-default'
                }`}
              >
                <Building className={`w-5 h-5 ${budgetType === 'warrant' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <p className="text-xs font-bold">Operating Budget</p>
                  <p className="text-[10px] text-text-muted font-mono">020200 & 022300 (MOH Warrants)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBudgetType('pembangunan')}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
                  budgetType === 'pembangunan'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 dark:text-amber-300 font-bold shadow-xs'
                    : 'bg-surface border-border-default text-text-muted hover:border-border-default'
                }`}
              >
                <HardHat className={`w-5 h-5 ${budgetType === 'pembangunan' ? 'text-amber-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <p className="text-xs font-bold">Development Budget</p>
                  <p className="text-[10px] text-text-muted font-mono">P42 (Leasing, PSH, Training)</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Cascading Taxonomy Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-subtle/50 p-4 rounded-2xl border border-border-default">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Program / Activity
              </label>
              <select
                value={selectedProgramCode}
                onChange={(e) => setSelectedProgramCode(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                {filteredPrograms.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.code} - {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Object Code
              </label>
              <select
                value={selectedObjekCode}
                onChange={(e) => setSelectedObjekCode(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                {filteredObjeks.map((o) => (
                  <option key={o.id} value={o.code}>
                    {o.code} - {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Expenditure Category
              </label>
              <select
                value={selectedKategoriCode}
                onChange={(e) => setSelectedKategoriCode(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                {filteredKategoris.map((k) => (
                  <option key={k.id} value={k.code}>
                    {k.code} - {k.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Supplier & Date Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">
                Appointed Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                <option value="">-- Select Supplier (Optional) --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">
                Order Date
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:border-indigo-500 focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:border-indigo-500 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* 4. Order Items Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-text-muted">
                Order Items / Services List ({items.length})
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-lg border border-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-subtle/50 border border-border-default rounded-2xl grid grid-cols-12 gap-2.5 items-center"
                >
                  <div className="col-span-12 sm:col-span-6 space-y-1">
                    <select
                      value={item.perihal_id || ''}
                      onChange={(e) => handleItemChange(idx, 'perihal_id', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-surface border border-border-default rounded-lg text-xs text-text-secondary focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">-- Select From Catalog (Optional) --</option>
                      {catalogItems.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.perihal_name} (RM {Number(cat.unit_price).toFixed(2)})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Item / Service Description..."
                      value={item.item_description}
                      onChange={(e) => handleItemChange(idx, 'item_description', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-surface border border-border-default rounded-lg text-xs text-text-primary focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-[10px] text-text-muted mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-surface border border-border-default rounded-lg text-xs text-text-primary font-mono focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-[10px] text-text-muted mb-0.5">Unit Price (RM)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-surface border border-border-default rounded-lg text-xs text-text-primary font-mono focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400">Total</span>
                      <span className="text-xs font-bold font-mono text-indigo-600">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Notes & Total Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-subtle/50 p-4 rounded-2xl border border-border-default">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">
                Notes / Order Justification
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Ward supplies replenishment & emergency maintenance..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <div className="p-4 bg-indigo-500/10 border border-indigo-100 rounded-xl text-right">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Grand Total Order Amount
              </p>
              <p className="text-2xl font-black text-indigo-600 font-mono mt-0.5">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border-default hover:bg-subtle/50 text-text-secondary rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl shadow-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order (PO)'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
