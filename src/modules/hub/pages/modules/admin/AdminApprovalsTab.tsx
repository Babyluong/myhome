import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  User,
  Mail,
  Hash,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  AlertCircle,
  Check,
  X
} from 'lucide-react'
import { getAccessRequests, approveAccessRequest, rejectAccessRequest } from '@/services/accessRequestManagementService'
import { getAllRoles } from '@/services/roleService'
import { recordAuditLog } from '@/services/auditLogService'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/lib/utils'
import type { AccessRequestWithRelations, Role } from '@/types'

export const AdminApprovalsTab: React.FC = () => {
  const { success: showSuccess, error: showError } = useToastStore()
  const { user: currentLoggedUser } = useAuthStore()

  const [requests, setRequests] = useState<AccessRequestWithRelations[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  // Selected request details modal
  const [selectedRequest, setSelectedRequest] = useState<AccessRequestWithRelations | null>(null)
  const [assignedRole, setAssignedRole] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Rejection modal
  const [rejectionRequest, setRejectionRequest] = useState<AccessRequestWithRelations | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getAccessRequests({
        page: 1,
        pageSize: 100,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      })
      setRequests(result.data || [])
    } catch (error) {
      showError('Error', 'Failed to load registration requests')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter, showError])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  useEffect(() => {
    const fetchRolesList = async () => {
      try {
        const rolesList = await getAllRoles()
        // Filter out system administrator roles for safety
        setRoles(rolesList.filter((r) => r.role_code !== 'system_admin'))
      } catch (err) {
        console.error(err)
      }
    }
    fetchRolesList()
  }, [])

  const handleOpenApproval = (req: AccessRequestWithRelations) => {
    setSelectedRequest(req)
    
    // Attempt role auto-suggestion
    const title = req.jawatan.toLowerCase()
    let suggestedRole = roles.find(r => r.role_code === 'pharmacist')?.id || ''
    if (title.includes('nurse') || title.includes('jururawat')) {
      suggestedRole = roles.find(r => r.role_code === 'nurse')?.id || ''
    } else if (title.includes('assistant') || title.includes('penolong') || title.includes('pembantu')) {
      suggestedRole = roles.find(r => r.role_code === 'pharmacy_assistant')?.id || ''
    } else if (title.includes('director') || title.includes('pengarah') || title.includes('ketua')) {
      suggestedRole = roles.find(r => r.role_code === 'pharmacy_manager')?.id || ''
    } else if (title.includes('admin') || title.includes('kerani')) {
      suggestedRole = roles.find(r => r.role_code === 'admin_staff')?.id || ''
    }
    setAssignedRole(suggestedRole || (roles.length > 0 ? roles[0].id : ''))
  }

  const handleApprove = async () => {
    if (!selectedRequest || !assignedRole) {
      showError('Error', 'Please assign a role.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await approveAccessRequest(
        selectedRequest.id,
        currentLoggedUser?.id || '',
        assignedRole
      )
      if (result && result.success) {
        // Record approval audit log
        try {
          recordAuditLog({
            userId: currentLoggedUser?.id,
            action: 'APPROVE',
            module: 'myadmin',
            entityType: 'access_request',
            entityId: selectedRequest.id,
            newValues: {
              status: 'approved',
              role_assigned: assignedRole,
              approver: currentLoggedUser?.full_name,
            },
            details: `Meluluskan permohonan pendaftaran kakitangan: ${selectedRequest.full_name} (${selectedRequest.jawatan}).`,
          })
        } catch (auditErr) {
          console.warn('Failed to record approval audit:', auditErr)
        }

        showSuccess('Success', `${selectedRequest.full_name} has been approved as an active user.`)
        setSelectedRequest(null)
        fetchRequests()
      } else {
        showError('Error', result?.error || 'Failed to approve request')
      }
    } catch (error: any) {
      showError('Error', error.message || 'Failed to approve request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenRejection = (req: AccessRequestWithRelations) => {
    setRejectionRequest(req)
    setRejectionReason('')
  }

  const handleReject = async () => {
    if (!rejectionRequest || !rejectionReason.trim()) {
      showError('Error', 'Please provide a reason for rejection.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await rejectAccessRequest(
        rejectionRequest.id,
        currentLoggedUser?.id || '',
        rejectionReason.trim()
      )
      if (result && result.success) {
        // Record rejection audit log
        try {
          recordAuditLog({
            userId: currentLoggedUser?.id,
            action: 'REJECT',
            module: 'myadmin',
            entityType: 'access_request',
            entityId: rejectionRequest.id,
            newValues: {
              status: 'rejected',
              rejection_reason: rejectionReason.trim(),
              reviewer: currentLoggedUser?.full_name,
            },
            details: `Menolak permohonan pendaftaran kakitangan: ${rejectionRequest.full_name}. Sebab: ${rejectionReason.trim()}`,
          })
        } catch (auditErr) {
          console.warn('Failed to record rejection audit:', auditErr)
        }

        showSuccess('Success', `Registration for ${rejectionRequest.full_name} has been rejected.`)
        setRejectionRequest(null)
        fetchRequests()
      } else {
        showError('Error', result?.error || 'Failed to reject request')
      }
    } catch (error: any) {
      showError('Error', error.message || 'Failed to reject request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Diluluskan
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Ditolak
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Menunggu Semakan
          </span>
        )
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header, Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama, no IC, jawatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors min-h-[40px]"
          />
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors min-h-[36px] ${
              statusFilter === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-transparent text-slate-400 border-slate-800 hover:bg-slate-800/40'
            }`}
          >
            Menunggu Semakan
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors min-h-[36px] ${
              statusFilter === 'approved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-transparent text-slate-400 border-slate-800 hover:bg-slate-800/40'
            }`}
          >
            Diluluskan
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors min-h-[36px] ${
              statusFilter === 'rejected'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-transparent text-slate-400 border-slate-800 hover:bg-slate-800/40'
            }`}
          >
            Ditolak
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors min-h-[36px] ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-transparent text-slate-400 border-slate-800 hover:bg-slate-800/40'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Main Request Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 sm:p-12 space-y-3">
            <div className="h-5 bg-slate-800 rounded w-full animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-11/12 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-10/12 animate-pulse" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 px-4">
            <AlertCircle className="w-10 h-10 text-slate-600" />
            <div>
              <p className="text-white font-bold text-sm sm:text-base">Tiada permohonan ditemui</p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Tiada rekod pendaftaran sepadan dengan tapisan semasa.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3.5">Nama Pemohon</th>
                    <th className="p-3.5">Maklumat KKM</th>
                    <th className="p-3.5">Maklumat Hubungan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 text-sm">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {req.profile_photo_url ? (
                              <img src={req.profile_photo_url} alt={req.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-white text-sm font-semibold">{req.full_name}</div>
                            <div className="text-xs text-slate-400 font-mono">
                              {req.ic_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                            <span>{req.jawatan}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{req.department?.department_name || 'Tiada Jabatan'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{req.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate max-w-[180px]">{req.email}</span>
                        </div>
                      </td>
                      <td className="p-3.5">{getStatusBadge(req.status)}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenApproval(req)}
                            title="Lihat Maklumat / Luluskan"
                            className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === 'pending' && (
                            <button
                              onClick={() => handleOpenRejection(req)}
                              title="Tolak"
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-800">
              {requests.map((req) => (
                <div key={req.id} className="p-4 space-y-3 bg-slate-900/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {req.profile_photo_url ? (
                          <img src={req.profile_photo_url} alt={req.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{req.full_name}</div>
                        <div className="text-xs text-slate-400 font-mono">{req.ic_number}</div>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400">Jawatan</span>
                      <div className="font-medium text-slate-200 truncate">{req.jawatan}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400">Jabatan</span>
                      <div className="font-medium text-slate-200 truncate">{req.department?.department_name || 'Tiada'}</div>
                    </div>
                    <div className="space-y-0.5 pt-1 border-t border-slate-800/60">
                      <span className="text-[11px] text-slate-400">Telefon</span>
                      <div className="font-mono text-slate-300">{req.phone_number}</div>
                    </div>
                    <div className="space-y-0.5 pt-1 border-t border-slate-800/60">
                      <span className="text-[11px] text-slate-400">Emel</span>
                      <div className="font-mono text-slate-300 truncate">{req.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenApproval(req)}
                      className="flex-1 min-h-[44px] px-3 py-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500 hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{req.status === 'pending' ? 'Semak & Luluskan' : 'Lihat Butiran'}</span>
                    </button>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleOpenRejection(req)}
                        className="min-h-[44px] px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        <X className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail & Approval Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative z-10 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between flex-shrink-0">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-400" />
                  <span>Semakan Maklumat Pendaftaran</span>
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Demographics</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                        {selectedRequest.profile_photo_url ? (
                          <img src={selectedRequest.profile_photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-bold">{selectedRequest.full_name}</div>
                        <div className="text-xs text-slate-400 font-mono">{selectedRequest.ic_number}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex gap-2">
                        <span className="text-slate-500 w-24">Jawatan:</span>
                        <span className="font-semibold text-white">{selectedRequest.jawatan}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-500 w-24">Jabatan:</span>
                        <span className="text-white">{selectedRequest.department?.department_name || 'N/A'}</span>
                      </div>
                      <div className="flex gap-2 font-mono">
                        <span className="text-slate-500 w-24">Emel:</span>
                        <span className="text-white">{selectedRequest.email}</span>
                      </div>
                      <div className="flex gap-2 font-mono">
                        <span className="text-slate-500 w-24">Telefon:</span>
                        <span className="text-white">{selectedRequest.phone_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Emergency Contact</h4>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nama:</span>
                        <span className="font-bold text-white">{selectedRequest.emergency_contact_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hubungan:</span>
                        <span className="text-white">{selectedRequest.emergency_contact_relationship || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">No Tel:</span>
                        <span className="text-white">{selectedRequest.emergency_contact_phone || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-slate-500">Alamat:</span>
                        <span className="text-slate-300 block bg-slate-950/40 p-2 rounded border border-white/5">
                          {selectedRequest.emergency_contact_address || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status-specific action panels */}
                {selectedRequest.status === 'pending' ? (
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Pemberian Akses (Access Settings)</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 font-semibold mb-2">Pilih Peranan (Assign Role)</label>
                        <select
                          value={assignedRole}
                          onChange={(e) => setAssignedRole(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                        >
                          <option value="">-- Sila pilih peranan --</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.role_name} ({r.role_code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400 leading-relaxed font-medium">
                        <strong>Nota:</strong> No. Pekerja (Employee ID) akan ditetapkan secara automatik menggunakan No. IC pemohon (iaitu <code>{selectedRequest.ic_number.replace(/-/g, '')}</code>) selaras dengan tetapan pendaftaran KKM.
                      </div>
                    </div>
                  </div>
                ) : selectedRequest.status === 'rejected' ? (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                      <XCircle className="w-4 h-4" /> Ditolak (Registration Rejected)
                    </div>
                    <div>Sebab Penolakan: {selectedRequest.rejection_reason || 'Tiada sebab dinyatakan'}</div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                      <CheckCircle className="w-4 h-4" /> Diluluskan (Registration Active)
                    </div>
                    <div>Diluluskan oleh penyemak hospital pada {selectedRequest.reviewed_at ? formatDate(selectedRequest.reviewed_at) : 'N/A'}.</div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap justify-end gap-2.5 flex-shrink-0">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(null)
                        handleOpenRejection(selectedRequest)
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      Tolak Permohonan
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isSubmitting || !assignedRole}
                      className="min-h-[44px] px-5 py-2 rounded-lg text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Memproses...' : 'Luluskan & Aktifkan'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Cause Modal */}
      <AnimatePresence>
        {rejectionRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectionRequest(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between flex-shrink-0">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>Sebab Penolakan Pendaftaran</span>
                </h3>
                <button
                  onClick={() => setRejectionRequest(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
                <p className="text-xs text-slate-400">
                  Sila nyatakan sebab permohonan pendaftaran untuk <strong className="text-white">{rejectionRequest.full_name}</strong> ditolak. Maklum balas ini akan dipaparkan kepada pemohon.
                </p>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  placeholder="Contoh: No kad pengenalan (IC) tidak sepadan dengan rekod rasmi jawatan KKM."
                />
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-2.5 flex-shrink-0">
                <button
                  onClick={() => setRejectionRequest(null)}
                  className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="min-h-[44px] px-5 py-2 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Memproses...' : 'Sahkan Penolakan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
