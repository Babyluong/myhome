// src/modules/mysuhu/pages/BreachLogPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  AlertTriangle, 
  Download, 
  Search,
  Filter,
  CheckCircle,
  Edit2
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Badge, Spinner, ModulePageHeader } from '@/components/ui'
import { getBreachLogs, getLokasi, annotateReading } from '@/modules/mysuhu/services/suhuService'
import { exportBreachLogsToCsv } from '@/modules/mysuhu/services/suhuReportService'
import type { BacaanSuhuWithRelations, Lokasi } from '@/types/mysuhu'
import { ROUTES } from '@/lib/constants'
import { format } from 'date-fns'

export const BreachLogPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const hospitalId = user?.hospital_id || 'hosp-1'

  const [breaches, setBreaches] = useState<BacaanSuhuWithRelations[]>([])
  const [locations, setLocations] = useState<Lokasi[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Filters
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Correction Modal State
  const [showCorrectModal, setShowCorrectModal] = useState(false)
  const [correctReadingId, setCorrectReadingId] = useState<string | null>(null)
  const [correctNote, setCorrectNote] = useState('')

  const userRole = user?.role?.role_code || ''
  const isAdmin = ['system_admin', 'hospital_admin', 'hospital_administrator'].includes(userRole)
  const userDeptId = user?.department_id || ''

  const loadData = async () => {
    setLoading(true)
    try {
      const deptIdFilter = !isAdmin && userDeptId ? userDeptId : undefined
      const [logsRes, locsRes] = await Promise.all([
        getBreachLogs(hospitalId, startDate || undefined, endDate || undefined, deptIdFilter),
        getLokasi(hospitalId, deptIdFilter)
      ])
      setBreaches(logsRes.data || [])
      setLocations(locsRes.data || [])
    } catch (e) {
      console.error('Failed to load breach logs', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [startDate, endDate])

  const filteredBreaches = breaches.filter(b => {
    const matchesLocation = selectedLocation === 'all' || b.unit?.lokasi_id === selectedLocation
    const matchesSearch = 
      b.unit?.nama_unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.unit?.unit_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.unit?.lokasi?.nama_lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.nota?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.correction_note?.toLowerCase().includes(searchQuery.toLowerCase())
      
    return matchesLocation && matchesSearch
  })

  const handleCorrectSubmit = async () => {
    if (!correctReadingId || !correctNote.trim()) return
    setSubmitting(true)
    try {
      const res = await annotateReading(correctReadingId, correctNote)
      if (res.error) throw new Error(res.error)
      
      setShowCorrectModal(false)
      setCorrectReadingId(null)
      setCorrectNote('')
      
      // Reload logs
      const deptIdFilter = !isAdmin && userDeptId ? userDeptId : undefined
      const logsRes = await getBreachLogs(hospitalId, startDate || undefined, endDate || undefined, deptIdFilter)
      setBreaches(logsRes.data || [])
    } catch (e) {
      console.error('Failed to annotate log', e)
      alert('Failed to update corrective action.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportCsv = () => {
    if (filteredBreaches.length === 0) return
    exportBreachLogsToCsv(filteredBreaches)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Spinner size="lg" className="text-teal-600 mb-4" />
        <p className="text-sm font-medium">Loading Temperature Breach Logs...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Back button & ModulePageHeader */}
      <div className="space-y-3">
        <button 
          onClick={() => navigate(ROUTES.HUB_SUHU_DASHBOARD)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Suhu Dashboard</span>
        </button>

        <ModulePageHeader
          title="Temperature Breach Logs"
          subtitle="Audit compliance trail for equipment temperature readings outside safe thresholds (KKM / MSQH)"
          badge="Audit & Compliance"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          actions={
            <button 
              onClick={handleExportCsv}
              disabled={filteredBreaches.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-primary rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-text-muted" />
              <span>Export CSV</span>
            </button>
          }
        />
      </div>

      {/* Filter toolbar */}
      <div className="bg-surface border border-border-default rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text"
              placeholder="Search unit, location, comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-subtle border border-border-default rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all font-medium"
            />
          </div>

          {/* Location and Date filters */}
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end text-xs">
            <div className="flex items-center gap-1.5 px-1">
              <Filter className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-[10px] uppercase font-bold text-text-muted">Filters:</span>
            </div>

            {/* Location selector */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 bg-surface border border-border-default rounded-lg text-xs text-text-secondary font-medium focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-all"
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.nama_lokasi} ({loc.kod_lokasi})</option>
              ))}
            </select>

            {/* Date picking inputs */}
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-surface border border-border-default rounded-lg px-2.5 py-1.5 text-text-primary outline-none focus:border-accent-base text-xs font-medium"
              />
              <span className="text-text-muted font-medium">to</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-surface border border-border-default rounded-lg px-2.5 py-1.5 text-text-primary outline-none focus:border-accent-base text-xs font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm">
        {filteredBreaches.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary mb-1">Full Compliance Met</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              No temperature breach incidents recorded within your selected date range and search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-text-primary">
                <thead className="bg-subtle text-[11px] text-text-muted font-semibold uppercase tracking-wider border-b border-border-default">
                  <tr>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">Equipment (Unit ID)</th>
                    <th className="px-4 py-3">Physical Location</th>
                    <th className="px-4 py-3">Recorded Temp</th>
                    <th className="px-4 py-3">Threshold Range</th>
                    <th className="px-4 py-3">Incident Date & Time</th>
                    <th className="px-4 py-3">Comments / Notes</th>
                    <th className="px-4 py-3">Logged By</th>
                    <th className="px-4 py-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filteredBreaches.map((b, i) => (
                    <tr key={b.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-muted tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {b.unit?.photo_url && (
                            <img 
                              src={b.unit.photo_url} 
                              alt={b.unit.nama_unit} 
                              className="w-8 h-8 rounded-lg object-cover border border-border-default flex-shrink-0"
                            />
                          )}
                          <div>
                            <span 
                              onClick={() => navigate(`/suhu/unit/${b.unit_id}`)}
                              className="hover:underline hover:text-accent-base cursor-pointer font-bold text-text-primary block"
                            >
                              {b.unit?.nama_unit}
                            </span>
                            <span className="text-[10px] font-mono text-text-muted">{b.unit?.unit_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <div className="text-text-primary">{b.unit?.lokasi?.nama_lokasi}</div>
                        <div className="text-[10px] text-text-muted">{b.unit?.lokasi?.jabatan}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-rose-600 text-xs font-mono tabular-nums whitespace-nowrap">
                        {b.suhu.toFixed(1)}°C
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-text-muted whitespace-nowrap tabular-nums">
                        {b.ambang?.min_suhu}°C to {b.ambang?.max_suhu}°C
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-text-secondary font-medium tabular-nums">
                        {format(new Date(b.tarikh_masa), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate font-medium text-text-secondary" title={b.nota || ''}>
                        {b.is_corrected && (
                          <div className="text-[9px] text-rose-600 font-bold mb-0.5">[CORRECTIVE ACTION]</div>
                        )}
                        {b.nota || '—'}
                        {b.is_corrected && b.correction_note && (
                          <div className="text-[9px] text-text-muted italic mt-0.5">Correction Note: {b.correction_note}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-medium whitespace-nowrap">
                        {b.dicatat_oleh_user?.full_name || 'Duty Staff'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => {
                            setCorrectReadingId(b.id)
                            setCorrectNote(b.correction_note || '')
                            setShowCorrectModal(true)
                          }}
                          className="p-1.5 bg-surface border border-border-default hover:bg-subtle text-text-muted hover:text-text-primary rounded-lg transition-colors shadow-sm"
                          title="Edit breach record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: High-End Native Cards */}
            <div className="md:hidden divide-y divide-border-default">
              {filteredBreaches.map((b) => (
                <div key={b.id} className="p-4 space-y-2.5 hover:bg-subtle/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {b.unit?.photo_url && (
                        <img 
                          src={b.unit.photo_url} 
                          alt={b.unit.nama_unit} 
                          className="w-9 h-9 rounded-lg object-cover border border-border-default flex-shrink-0"
                        />
                      )}
                      <div>
                        <span 
                          onClick={() => navigate(`/suhu/unit/${b.unit_id}`)}
                          className="font-bold text-text-primary text-sm hover:underline hover:text-accent-base cursor-pointer block"
                        >
                          {b.unit?.nama_unit}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">{b.unit?.unit_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 font-mono font-bold text-xs rounded-lg tabular-nums">
                        {b.suhu.toFixed(1)}°C
                      </span>
                      <button 
                        onClick={() => {
                          setCorrectReadingId(b.id)
                          setCorrectNote(b.correction_note || '')
                          setShowCorrectModal(true)
                        }}
                        className="p-1.5 bg-subtle hover:bg-subtle/80 text-text-secondary rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-subtle/60 rounded-lg p-2.5 border border-border-default text-xs">
                    <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                      <span>{b.unit?.lokasi?.nama_lokasi} ({b.unit?.lokasi?.jabatan})</span>
                      <span className="text-text-muted font-mono tabular-nums">
                        Threshold: {b.ambang?.min_suhu}°C - {b.ambang?.max_suhu}°C
                      </span>
                    </div>
                  </div>

                  {b.nota && (
                    <div className="text-xs text-text-secondary bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      {b.is_corrected && (
                        <span className="text-[10px] font-bold text-rose-600 mr-1">[CORRECTIVE ACTION]</span>
                      )}
                      {b.nota}
                      {b.is_corrected && b.correction_note && (
                        <div className="text-[10px] text-text-muted italic mt-0.5">Note: {b.correction_note}</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-text-muted pt-0.5">
                    <span className="tabular-nums">{format(new Date(b.tarikh_masa), 'dd/MM/yyyy HH:mm')}</span>
                    <span>Logged by: <strong className="text-text-secondary font-medium">{b.dicatat_oleh_user?.full_name || 'Duty Staff'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Correction Modal */}
      {showCorrectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl text-text-primary">
            <h3 className="text-base font-bold text-text-primary mb-2">Edit Temperature Breach Log</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Documented breach records can be appended with official corrective actions or notes. The original log will be preserved for medical audit integrity.
            </p>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1.5">Reason for Amendment / Corrective Action</label>
                <textarea 
                  required
                  placeholder="Specify corrective action (e.g. ice buildup cleaning, specimen transfer to backup unit)."
                  value={correctNote}
                  onChange={(e) => setCorrectNote(e.target.value)}
                  className="w-full bg-subtle border border-border-default rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-base focus:ring-1 focus:ring-accent-base transition-colors h-24 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button 
                onClick={() => {
                  setShowCorrectModal(false)
                  setCorrectReadingId(null)
                }}
                className="px-4 py-2 bg-subtle hover:bg-subtle/80 text-text-secondary rounded-lg text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCorrectSubmit}
                disabled={submitting || !correctNote.trim()}
                className="px-4 py-2 bg-accent-base hover:bg-accent-hover text-white rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Comments'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default BreachLogPage
