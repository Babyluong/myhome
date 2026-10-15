// src/modules/myporter/pages/PorterManagerDispatchPage.tsx
import React, { useEffect, useState } from 'react'
import { Shield, Users, AlertTriangle, UserPlus, RefreshCw, Flame, Radio } from 'lucide-react'
import '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { Button, Modal } from '@/components/ui'
import { 
  getPorterStats, 
  getPorterJobs, 
  getPorterProfiles, 
  managerAssignJob 
} from '../services/porterService'
import type { 
  PorterAggregateStats, 
  PorterJobRequest, 
  PorterProfile 
} from '@/shared/types/myporter'
import { JobStatusBadge, UrgencyBadge, StaffStatusBadge } from '../components/PorterStatusBadge'
import { soundAlert } from '../components/PorterAudioAlert'

export const PorterManagerDispatchPage: React.FC = () => {
  const toast = useToast()

  const [, setStats] = useState<PorterAggregateStats | null>(null)
  const [jobs, setJobs] = useState<PorterJobRequest[]>([])
  const [porters, setPorters] = useState<PorterProfile[]>([])
  const [, setLoading] = useState(true)

  // Manual Dispatch Modal
  const [selectedJob, setSelectedJob] = useState<PorterJobRequest | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedPorterId, setSelectedPorterId] = useState('')

  const fetchManagerData = async () => {
    try {
      const [statsRes, jobsRes, profRes] = await Promise.all([
        getPorterStats(),
        getPorterJobs(),
        getPorterProfiles()
      ])
      if (statsRes.data) setStats(statsRes.data)
      if (jobsRes.data) setJobs(jobsRes.data)
      if (profRes.data) setPorters(profRes.data)
    } catch (err: any) {
      toast.error('Error Loading Dispatch Data', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchManagerData()
    const interval = setInterval(fetchManagerData, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleManualAssign = async () => {
    if (!selectedJob || !selectedPorterId) return
    try {
      const res = await managerAssignJob(selectedJob.id, selectedPorterId)
      if (res.data) {
        soundAlert.playSuccessTone()
        toast.success('Task Successfully Assigned', `Porter ${res.data.assigned_porter_name} has been dispatched for ${res.data.no_rujukan}.`)
        setIsAssignModalOpen(false)
        setSelectedJob(null)
        setSelectedPorterId('')
        fetchManagerData()
      }
    } catch (err: any) {
      toast.error('Failed to Assign Task', err.message)
    }
  }

  // Kanban Columns
  const poolJobs = jobs.filter(j => j.status === 'broadcasting')
  const inProgressJobs = jobs.filter(j => j.status === 'accepted' || j.status === 'at_pickup' || j.status === 'in_transit' || j.status === 'at_destination')
  const pendingConfirmationJobs = jobs.filter(j => j.status === 'pending_receiver_confirmation')
  const completedJobs = jobs.filter(j => j.status === 'completed')

  // Available Porters for assignment
  const availablePorters = porters.filter(p => p.current_status === 'available')
  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            <span>Porter Operations & Dispatch Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring console for hospital logistics, patient transit and manual porter assignment
          </p>
        </div>

        <Button
          onClick={fetchManagerData}
          variant="outline"
          className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Live Refresh</span>
        </Button>
      </div>

      {/* SLA Alert Banner if there are STAT unaccepted jobs */}
      {poolJobs.some(j => j.urgency === 'stat') && (
        <div className="p-4 bg-rose-500/20 border-2 border-rose-500/80 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-black text-rose-200">SLA ALERT: Unaccepted Critical STAT Requests Present!</p>
              <p className="text-xs text-rose-300/80">Please assign immediately to an available porter on duty.</p>
            </div>
          </div>
          <Button
            onClick={() => {
              const statJob = poolJobs.find(j => j.urgency === 'stat')
              if (statJob) {
                setSelectedJob(statJob)
                setIsAssignModalOpen(true)
              }
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4"
          >
            Assign Immediately
          </Button>
        </div>
      )}

      {/* KANBAN LIVE DISPATCH BOARD */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
          <span>Live Movement Matrix (Kanban)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Col 1: Broadcasting Pool */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-sky-400 uppercase tracking-wider">Broadcast Pool</span>
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">
                {poolJobs.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {poolJobs.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-xs">No requests in pool</div>
              ) : (
                poolJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-slate-950 border border-slate-800 hover:border-sky-500/50 rounded-2xl space-y-3 shadow-md">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-sky-400">{job.no_rujukan}</span>
                      <UrgencyBadge urgency={job.urgency} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{job.sub_category || job.category}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">From: {job.origin_department_name}</p>
                      <p className="text-[11px] text-slate-400">To: {job.destination_department_name}</p>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedJob(job)
                        setIsAssignModalOpen(true)
                      }}
                      className="w-full py-2 bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Manual Assign</span>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Col 2: In Progress & In Transit */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-blue-400 uppercase tracking-wider">In Transit</span>
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                {inProgressJobs.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {inProgressJobs.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-xs">No active transit</div>
              ) : (
                inProgressJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5 shadow-md">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-sky-400">{job.no_rujukan}</span>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{job.sub_category || job.category}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Porter: <strong className="text-slate-200">{job.assigned_porter_name}</strong></p>
                      <p className="text-[10px] text-text-muted">Route: {job.origin_department_name} ➔ {job.destination_department_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Col 3: Pending Receiver Confirmation */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Arrived & Awaiting Sign</span>
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                {pendingConfirmationJobs.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {pendingConfirmationJobs.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-xs">No pending verifications</div>
              ) : (
                pendingConfirmationJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-2 shadow-md">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-sky-400">{job.no_rujukan}</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full animate-pulse">
                        Awaiting Ward
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-white">{job.sub_category || job.category}</h4>
                    <p className="text-[11px] text-slate-400">Destination: <strong className="text-white">{job.destination_department_name}</strong></p>
                    <p className="text-[10px] text-text-muted">Porter: {job.assigned_porter_name}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Col 4: Completed Today */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Completed Today</span>
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                {completedJobs.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {completedJobs.slice(0, 8).map((job) => (
                <div key={job.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono font-bold text-slate-400">{job.no_rujukan}</span>
                    <span className="text-emerald-400 font-bold">✓ {job.actual_tat_minutes || 15}m TAT</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300 truncate">{job.sub_category || job.category}</p>
                  <p className="text-[10px] text-text-muted">{job.assigned_porter_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Porter Fleet Live Status & Ward Demand Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Porter Fleet List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Porter Availability & Duty Matrix</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/80">
              {porters.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white">{p.full_name}</h4>
                        <span className="font-mono text-[10px] text-slate-400">{p.staff_no} ({p.gred})</span>
                      </div>
                      <p className="text-slate-400">{p.assigned_zone} • {p.phone_number}</p>
                      <p className="text-text-muted text-[10px]">Current Location: {p.current_location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <StaffStatusBadge status={p.current_status} />
                    <span className="font-mono font-bold text-amber-400 text-xs">★ {p.average_rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ward Demand Heatmap (1 col) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <span>Ward Demand Concentration (Heatmap)</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl text-xs">
            <p className="text-slate-400">Highest logistical request concentration zones:</p>
            {[
              { zone: 'Emergency & Trauma Department (ED)', count: 18, pct: 85, color: 'bg-rose-500' },
              { zone: 'Main Operating Theatre (OT)', count: 14, pct: 68, color: 'bg-amber-500' },
              { zone: 'Kenanga Ward (Ward 4A)', count: 11, pct: 52, color: 'bg-blue-500' },
              { zone: 'Pathology & Blood Bank Lab', count: 9, pct: 44, color: 'bg-teal-500' },
              { zone: 'Intensive Care Unit (ICU)', count: 7, pct: 35, color: 'bg-indigo-500' }
            ].map((z) => (
              <div key={z.zone} className="space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>{z.zone}</span>
                  <span className="font-mono">{z.count} Tasks</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${z.color} rounded-full`} style={{ width: `${z.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Dispatch Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Manual Porter Task Assignment"
      >
        <div className="space-y-4 p-2">
          {selectedJob && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sky-400">{selectedJob.no_rujukan}</span>
                <UrgencyBadge urgency={selectedJob.urgency} />
              </div>
              <p className="font-bold text-white">{selectedJob.sub_category || selectedJob.category}</p>
              <p className="text-slate-400">From: {selectedJob.origin_department_name} ➔ To: {selectedJob.destination_department_name}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Select Porter for Assignment *</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              value={selectedPorterId}
              onChange={(e) => setSelectedPorterId(e.target.value)}
            >
              <option value="">-- Select Porter --</option>
              {porters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.staff_no}) - {p.current_status.toUpperCase()} ({p.assigned_zone})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedPorterId}
              onClick={handleManualAssign}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold"
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PorterManagerDispatchPage
