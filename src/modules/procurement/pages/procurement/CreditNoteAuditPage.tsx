// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  IconFileText, 
  IconSearch, 
  IconFilter, 
  IconRefreshCw,
  IconCheckCircle,
  IconClock,
  IconAlertCircle,
  IconEye,
  IconReceipt,
  IconMoney
} from '@/components/ui/Icons'
import { getCreditNotes, getCreditNoteStats } from '@/services/pharmacy/creditNoteService'
import type { CreditNoteWithRelations } from '@/types/pharmacy'
import { useAuthStore } from '@/stores/authStore'
import { Spinner, Input, Select, Badge, Card } from '@/components/ui'
import { cn, formatCurrency } from '@/lib/utils'
import { ChevronRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CreditNoteAuditPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const hospitalId = user?.hospital_id

  const [notes, setNotes] = useState<CreditNoteWithRelations[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (hospitalId) {
      loadData()
    }
  }, [hospitalId, statusFilter])

  const loadData = async () => {
    if (!hospitalId) return
    setIsLoading(true)
    
    try {
      const filter = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined
      }

      const [notesRes, statsRes] = await Promise.all([
        getCreditNotes(hospitalId, filter, 1, 50),
        getCreditNoteStats(hospitalId)
      ])

      if (notesRes.data) {
        setNotes(notesRes.data)
      }
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (error) {
      console.error('Failed to load credit notes', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-500/20'
      case 'applied': return 'bg-blue-100 text-blue-700 border-blue-500/20'
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-500/20'
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-500/20'
      default: return 'bg-subtle text-text-secondary border-border-default'
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden font-sans selection:bg-slate-900 selection:text-white">
      {/* Premium Ambient Radial Lights */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/[0.04] to-indigo-500/[0.02] rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/[0.02] to-teal-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full p-6 lg:p-8 space-y-6">
        {/* Enhanced Breadcrumb navigation with mini icons */}
        <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="text-slate-400">Financial</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">Procurement</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-text-primary font-extrabold tracking-wide">Credit Note Audit</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-surface border border-border-default rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 hover:rotate-2 transition-transform duration-300">
              <IconReceipt className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-surface border border-border-default">
                Credit Note Audit
              </h1>
              <p className="text-text-muted font-semibold text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Transaction Reconciliation & Audit Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={loadData}
              className="p-2 h-10 w-10 flex items-center justify-center bg-surface rounded-xl border border-border-default text-text-muted hover:bg-subtle/50 transition-colors shadow-sm"
              title="Refresh"
            >
              <IconRefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* KPI Section with Premium Style */}
        {stats && (
          <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border-default shadow-xl mb-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Total Value */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="bg-surface border border-border-default hover:border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-100/30 hover:-translate-y-1 transition-colors duration-150 cursor-default"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.05] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-emerald-100 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-700 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <IconReceipt className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Value (Approved)</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight tabular-nums truncate" title={formatCurrency(stats.total_value).replace('MYR', 'RM')}>
                      {formatCurrency(stats.total_value).replace('MYR', 'RM')}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <span className="text-emerald-600 font-bold">Reconciled Credits</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Total Count */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-blue-500/10 border-2 border-blue-100/70 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-100/30 hover:-translate-y-1 transition-colors duration-150 cursor-default"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.05] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-blue-100 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-700 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <IconFileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total Credit Notes</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-blue-400 dark:text-blue-300 font-bold tracking-tight tabular-nums">
                      {stats.total_count}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <span className="text-blue-600 font-bold">Historical Records</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Pending */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-surface border border-border-default hover:border-amber-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-100/30 hover:-translate-y-1 transition-colors duration-150 cursor-default"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.05] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shadow-xs shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <IconClock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Pending Approval</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight tabular-nums">
                      {stats.pending_count}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <span className="text-amber-600 font-bold">Awaiting Review</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Avg Value */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-surface border border-border-default hover:border-purple-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/30 hover:-translate-y-1 transition-colors duration-150 cursor-default"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/[0.05] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-300" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 shadow-xs shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <IconMoney className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">Avg CN Value</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight tabular-nums truncate" title={formatCurrency(stats.avg_value).replace('MYR', 'RM')}>
                      {formatCurrency(stats.avg_value).replace('MYR', 'RM')}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <span className="text-violet-600 font-bold">Per Transaction</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden relative">
          <div>
            {/* Filters Row */}
            <div className="bg-subtle/50 p-4 rounded-3xl border border-border-default shadow-sm mb-6">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="lg:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search</label>
                  <div className="relative">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="text"
                      placeholder="Search by CN Number..."
                      className="pl-11 pr-4 py-3 bg-surface border border-border-default rounded-xl text-sm font-bold text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-emerald-100 transition-colors outline-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <div className="relative">
                    <IconFilter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                    <Select 
                      className="pl-11 bg-surface border border-border-default rounded-xl px-4 py-3 text-sm font-bold text-text-secondary focus:ring-2 focus:ring-emerald-100 transition-colors outline-none"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="applied">Applied</option>
                    </Select>
                  </div>
                </div>
              </form>
            </div>

            {/* Table Area - Desktop Table, Mobile Cards */}
            <div className="hidden lg:block overflow-x-auto rounded-xl border border-border-subtle shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-subtle/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary font-bold">CN Number</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary font-bold">Date</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary font-bold">Supplier</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary font-bold">PO Ref</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary font-bold">Items</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary font-bold">Amount</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                           <Spinner size="lg" className="mb-4" />
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : notes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <div className="w-16 h-16 bg-subtle/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-subtle">
                          <IconFileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No credit notes found</p>
                      </td>
                    </tr>
                  ) : (
                    notes.map((note) => (
                      <tr key={note.id} className="hover:bg-emerald-500/10 transition-colors group">
                        <td className="px-8 py-5">
                          <span className="text-sm font-black text-emerald-600 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                            {note.cn_number}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm font-bold text-text-muted">{new Date(note.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm font-bold text-text-primary group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {/* @ts-ignore */}
                            {note.supplier?.company_name || 'â€”'}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-subtle rounded-lg text-[10px] font-black text-text-muted">
                            {note.purchase_order?.po_number || 'â€”'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-text-secondary">{note.items?.length || 0} items</span>
                            {note.items && note.items.length > 0 && (
                              <div className="text-[10px] text-text-muted line-clamp-1 max-w-[200px]">
                                {note.items.map(i => i.item_name).join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="text-sm font-black text-text-primary">
                            {formatCurrency(note.total_amount).replace('MYR', '').trim()}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border",
                              getStatusColor(note.status)
                            )}>
                              {note.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="lg:hidden space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Spinner size="lg" className="mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing credit notes...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="bg-subtle/50 rounded-xl p-12 text-center border border-dashed border-border-default">
                  <IconFileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No audit records found</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-colors space-y-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CN Number</span>
                        <h4 className="text-base font-black text-emerald-600 uppercase tracking-tight leading-none">
                          {note.cn_number}
                        </h4>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        getStatusColor(note.status)
                      )}>
                        {note.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</span>
                        <p className="text-sm font-bold text-text-primary leading-tight">
                           {/* @ts-ignore */}
                          {note.supplier?.company_name || 'â€”'}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                        <p className="text-base font-black text-text-primary">
                          {formatCurrency(note.total_amount).replace('MYR', 'RM')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PO Ref</span>
                        <span className="px-2 py-0.5 bg-subtle rounded-lg text-[10px] font-black text-text-muted">
                          {note.purchase_order?.po_number || 'â€”'}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(note.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Placeholder */}
            {notes.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-px bg-subtle"></span>
                  Showing <span className="text-emerald-600 font-black">{notes.length}</span> Credit Notes
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
