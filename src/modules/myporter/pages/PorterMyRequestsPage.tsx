// src/modules/myporter/pages/PorterMyRequestsPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  XCircle, 
  Phone, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { Button, Input, Modal, Badge } from '@/components/ui'
import { getPorterJobs, cancelPorterJob } from '../services/porterService'
import type { PorterJobRequest, PorterJobStatus } from '@/shared/types/myporter'
import { JobStatusBadge, UrgencyBadge } from '../components/PorterStatusBadge'
import { PorterJobTrackerStepper } from '../components/PorterJobTrackerStepper'

export const PorterMyRequestsPage: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const toast = useToast()

  const [jobs, setJobs] = useState<PorterJobRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')
  const [searchQuery, setSearchQuery] = useState('')

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancellingJobId, setCancellingJobId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await getPorterJobs()
      if (res.data) setJobs(res.data)
    } catch (err: any) {
      toast.error('Failed to Load Requests', err.message || 'Unable to retrieve request records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleCancel = async () => {
    if (!cancellingJobId) return
    try {
      await cancelPorterJob(cancellingJobId, cancelReason || 'Cancelled by requester.')
      toast.success('Request Cancelled', 'The request has been cancelled.')
      setIsCancelModalOpen(false)
      setCancelReason('')
      fetchJobs()
    } catch (err: any) {
      toast.error('Error Cancelling Request', err.message)
    }
  }

  const filteredJobs = jobs.filter((j) => {
    if (activeTab === 'active') {
      if (j.status === 'completed' || j.status === 'cancelled') return false
    } else if (activeTab === 'completed') {
      if (j.status !== 'completed' && j.status !== 'cancelled') return false
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        j.no_rujukan.toLowerCase().includes(q) ||
        j.origin_department_name.toLowerCase().includes(q) ||
        j.destination_department_name.toLowerCase().includes(q) ||
        (j.assigned_porter_name && j.assigned_porter_name.toLowerCase().includes(q))
      )
    }
    return true
  })
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-sky-400" />
            <span>My Requests & Live Tracking</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Monitor live porter movement status, transit logs, and handover verification proofs</p>
        </div>

        <Button
          onClick={() => navigate('/porter/requests/new')}
          className="flex items-center gap-2 bg-accent-base hover:bg-accent-hover text-white font-bold shadow-lg shadow-sky-500/20 rounded-xl px-5 py-2.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'active' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'completed' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed / Cancelled ({jobs.filter(j => j.status === 'completed' || j.status === 'cancelled').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'all' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({jobs.length})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search Reference No, Ward, Porter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="p-16 text-center text-text-muted bg-slate-900/40 rounded-3xl border border-slate-800/80">
            <ClipboardList className="w-12 h-12 mx-auto text-text-muted mb-3" />
            <p className="font-bold text-slate-400">No request records found.</p>
            <p className="text-xs text-text-muted mt-1">Create a new request to start dispatch service.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isCompleted = job.status === 'completed'
            const isCancelled = job.status === 'cancelled'
            const isPendingPpk = job.status === 'broadcasting'

            return (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 shadow-xl transition-colors space-y-5"
              >
                {/* Card Top: Ref + Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-sky-400">{job.no_rujukan}</span>
                    <span className="text-text-muted">|</span>
                    <span className="text-xs font-extrabold text-white uppercase">{job.sub_category || job.category}</span>
                    <UrgencyBadge urgency={job.urgency} />
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      A
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location (Origin):</p>
                      <p className="text-sm font-extrabold text-slate-200">{job.origin_department_name}</p>
                      <p className="text-xs text-slate-400">{job.origin_location_details}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      B
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Drop-off Location (Destination):</p>
                      <p className="text-sm font-extrabold text-slate-200">{job.destination_department_name}</p>
                      <p className="text-xs text-slate-400">{job.destination_location_details}</p>
                    </div>
                  </div>
                </div>

                {/* Grab-Style Live Stepper */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40">
                  <PorterJobTrackerStepper job={job} />
                </div>

                {/* Footer details: Assigned PPK & Cancel CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-3">
                    {job.assigned_porter_name ? (
                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                          P
                        </div>
                        <span>Assigned Porter: <strong className="text-white">{job.assigned_porter_name}</strong></span>
                        {job.assigned_porter_phone && (
                          <span className="text-text-muted font-mono">({job.assigned_porter_phone})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-amber-400 font-medium animate-pulse flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Searching for nearby porters on radar...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCompleted && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancellingJobId(job.id)
                          setIsCancelModalOpen(true)
                        }}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-xl border border-rose-500/30 transition-colors text-xs"
                      >
                        Cancel Request
                      </button>
                    )}

                    {isCompleted && job.handover_proof && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified by: {job.handover_proof.recipient_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Confirm Request Cancellation"
      >
        <div className="space-y-4 p-2">
          <p className="text-xs text-slate-400">
            Are you sure you want to cancel this request? This will stop broadcasting to porter fleet radar.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Cancellation Reason *</label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Patient discharged early / Ordered for incorrect ward..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Back
            </Button>
            <Button
              onClick={handleCancel}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PorterMyRequestsPage
