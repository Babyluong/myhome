// src/modules/myporter/pages/PorterReceiverPanelPage.tsx
import React, { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Search, ShieldCheck, Star, PenTool } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { Button } from '@/components/ui'
import { getPorterJobs, receiverVerifyAndComplete } from '../services/porterService'
import type { PorterJobRequest, HandoverProof, PorterRating } from '@/shared/types/myporter'
import { UrgencyBadge } from '../components/PorterStatusBadge'
import { HandoverVerificationModal } from '../components/HandoverVerificationModal'
import { soundAlert } from '../components/PorterAudioAlert'

export const PorterReceiverPanelPage: React.FC = () => {
  const loggedUser = useAuthStore((state) => state.user)
  const toast = useToast()

  const [jobs, setJobs] = useState<PorterJobRequest[]>([])
  const [, setLoading] = useState(true)
  const [selectedJobForVerification, setSelectedJobForVerification] = useState<PorterJobRequest | null>(null)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await getPorterJobs()
      if (res.data) setJobs(res.data)
    } catch (err: any) {
      toast.error('Ralat Memuat Data', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleVerifySubmit = async (jobId: string, proof: HandoverProof, rating?: PorterRating) => {
    try {
      const res = await receiverVerifyAndComplete(jobId, proof, rating)
      if (res.data) {
        soundAlert.playSuccessTone()
        toast.success('Receipt Confirmed!', 'Task completed and audit records have been updated.')
        setIsVerificationModalOpen(false)
        fetchJobs()
      }
    } catch (err: any) {
      toast.error('Verification Error', err.message)
    }
  }

  // Incoming tasks destined for receiver
  const incomingJobs = jobs.filter(j => 
    j.status === 'pending_receiver_confirmation' || 
    j.status === 'in_transit' || 
    j.status === 'at_destination'
  )

  const completedReceipts = jobs.filter(j => j.status === 'completed')

  const filteredIncoming = incomingJobs.filter(j => {
    if (filterCategory !== 'all' && j.category !== filterCategory) return false
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <span>Cargo & Patient Receipt Verification</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Receiver confirmation console for wards, operating theatres, laboratories & pharmacy to sign off porter handovers
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { key: 'all', label: 'All Incoming' },
            { key: 'blood_bank', label: 'Blood Bank' },
            { key: 'lab_specimen', label: 'Lab Specimen' },
            { key: 'patient_transfer', label: 'Patient Transfer' },
            { key: 'pharmacy_run', label: 'Pharmacy' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterCategory(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                filterCategory === tab.key ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search Deliveries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Section 1: Incoming & Pending Confirmation Deliveries */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <span>Incoming & Pending Verification Deliveries ({filteredIncoming.length})</span>
        </h2>

        {filteredIncoming.length === 0 ? (
          <div className="p-12 text-center text-text-muted bg-slate-900/40 rounded-3xl border border-slate-800">
            <CheckCircle2 className="w-10 h-10 mx-auto text-text-secondary mb-2" />
            <p className="font-bold text-slate-400">No incoming deliveries awaiting verification.</p>
            <p className="text-xs text-text-muted">All incoming cargo and patients have been safely acknowledged.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIncoming.map((job) => {
              const isReadyForSign = job.status === 'pending_receiver_confirmation' || job.status === 'at_destination'

              return (
                <div
                  key={job.id}
                  className={`bg-slate-900 border rounded-3xl p-5 shadow-xl space-y-4 transition-colors ${
                    isReadyForSign
                      ? 'border-emerald-500/80 bg-slate-900/95 ring-2 ring-emerald-500/20'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-sky-400">{job.no_rujukan}</span>
                      <h4 className="text-sm font-black text-white mt-0.5">{job.sub_category || job.category}</h4>
                    </div>
                    <UrgencyBadge urgency={job.urgency} />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                    <p className="text-slate-400">
                      From: <strong className="text-slate-200">{job.origin_department_name}</strong>
                    </p>
                    <p className="text-slate-400">
                      To Destination: <strong className="text-emerald-400">{job.destination_department_name}</strong> ({job.destination_location_details})
                    </p>
                    <p className="text-slate-400">
                      Assigned Porter: <strong className="text-white">{job.assigned_porter_name || 'Awaiting Porter'}</strong>
                    </p>
                  </div>

                  {job.patient_data && (
                    <div className="p-2.5 bg-blue-950/30 border border-blue-800/40 rounded-xl text-xs text-slate-300">
                      Patient: <strong>{job.patient_data.patient_name}</strong> ({job.patient_data.patient_rn})
                    </div>
                  )}

                  {/* Verification CTA */}
                  <div className="pt-1">
                    <Button
                      onClick={() => {
                        setSelectedJobForVerification(job)
                        setIsVerificationModalOpen(true)
                      }}
                      className="w-full py-3 bg-accent-base hover:bg-accent-hover text-white font-extrabold shadow-lg rounded-xl flex items-center justify-center gap-2 text-xs"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Verify Receipt & Sign Handover</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Section 2: Recently Completed Receipts */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Previously Verified Delivery Records</span>
        </h2>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="divide-y divide-slate-800/80">
            {completedReceipts.slice(0, 5).map((job) => (
              <div key={job.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-400">{job.no_rujukan}</span>
                    <span className="font-semibold text-white">{job.sub_category || job.category}</span>
                  </div>
                  <p className="text-slate-400">
                    From: {job.origin_department_name} ➔ To: {job.destination_department_name}
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified by: {job.handover_proof?.recipient_name || 'Nurse'}</span>
                  </div>
                  {job.rating && (
                    <div className="flex items-center sm:justify-end gap-1 text-amber-400 text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{job.rating.rating_stars} / 5 Stars</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <HandoverVerificationModal
        job={selectedJobForVerification}
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSubmit={handleVerifySubmit}
      />
    </div>
  )
}

export default PorterReceiverPanelPage
