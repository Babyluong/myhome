// src/modules/myporter/components/PorterRadarAlertModal.tsx
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Shield } from 'lucide-react'
import type { PorterJobRequest } from '@/shared/types/myporter'
import { UrgencyBadge } from './PorterStatusBadge'
import { soundAlert } from './PorterAudioAlert'
import { useLanguage } from '@/shared/contexts/LanguageContext'

interface Props {
  job: PorterJobRequest | null
  isOpen: boolean
  onAccept: (jobId: string) => void
  onDecline: (jobId: string) => void
}

export const PorterRadarAlertModal: React.FC<Props> = ({
  job,
  isOpen,
  onAccept,
  onDecline
}) => {
  const { language } = useLanguage()
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (isOpen && job) {
      if (job.urgency === 'stat') {
        soundAlert.playStatEmergencyAlert()
      } else {
        soundAlert.playNotificationChime()
      }
      setCountdown(30)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            onDecline(job.id)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isOpen, job?.id])

  if (!isOpen || !job) return null

  const isStat = job.urgency === 'stat'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          className={`w-full max-w-lg bg-surface rounded-3xl shadow-2xl overflow-hidden border-2 ${
            isStat ? 'border-rose-500 shadow-rose-500/20' : 'border-sky-500 shadow-sky-500/20'
          }`}
        >
          {/* Header with Radar Wave */}
          <div className={`p-6 text-white relative overflow-hidden ${
            isStat ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600' : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700'
          }`}>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center relative">
                  <span className="absolute inset-0 rounded-2xl bg-white/30 animate-ping" />
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    {language === 'ms' ? 'TUGASAN RADAR BAHARU!' : 'NEW RADAR DISPATCH TASK!'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {language === 'ms' ? 'Sila respon dalam tempoh masa ditetapkan' : 'Please respond within the countdown timer'}
                  </p>
                </div>
              </div>

              {/* Countdown Circular Ring */}
              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 font-mono font-extrabold text-xl">
                <span>{countdown}s</span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Urgency & Task Type */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="text-[10px] font-bold text-text-secondary font-bold uppercase tracking-wider">
                  {language === 'ms' ? 'Kategori Tugas' : 'Task Category'}
                </span>
                <h4 className="text-base font-extrabold text-text-primary">{job.sub_category || job.category}</h4>
              </div>
              <UrgencyBadge urgency={job.urgency} />
            </div>

            {/* Origin & Destination Card */}
            <div className="p-4 bg-subtle/50 border border-border-default rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  A
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">
                    {language === 'ms' ? 'Lokasi Ambil (Asal)' : 'Pickup Location (Origin)'}
                  </p>
                  <p className="text-sm font-extrabold text-text-primary">{job.origin_department_name}</p>
                  <p className="text-xs text-text-muted">{job.origin_location_details}</p>
                </div>
              </div>

              <div className="pl-3 border-l-2 border-dashed border-border-default ml-3 h-4" />

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  B
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-rose-600 uppercase">
                    {language === 'ms' ? 'Lokasi Hantar (Destinasi)' : 'Delivery Location (Destination)'}
                  </p>
                  <p className="text-sm font-extrabold text-text-primary">{job.destination_department_name}</p>
                  <p className="text-xs text-text-muted">{job.destination_location_details}</p>
                </div>
              </div>
            </div>

            {/* Special Precautions / Patient Info */}
            {job.patient_data && (
              <div className="p-3 bg-blue-500/10 border border-blue-100 rounded-xl text-xs space-y-1 text-text-secondary">
                <p className="font-bold text-blue-400 dark:text-blue-300 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  {language === 'ms' ? 'Pesakit:' : 'Patient:'} {job.patient_data.patient_name} ({job.patient_data.patient_rn})
                </p>
                <p className="text-text-muted">
                  {language === 'ms' ? 'Mod:' : 'Mobility:'} <span className="font-semibold uppercase">{job.patient_data.mobility_type}</span> | {language === 'ms' ? 'Oksigen:' : 'Oxygen:'} <span className="font-semibold">{job.patient_data.o2_dependent ? `${language === 'ms' ? 'Ya' : 'Yes'} (${job.patient_data.o2_flow_rate_lpm} L/min)` : (language === 'ms' ? 'Tiada' : 'None')}</span>
                </p>
              </div>
            )}

            {job.notes && (
              <p className="text-xs text-text-muted bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <span className="font-bold text-amber-400 dark:text-amber-300 font-bold">
                  {language === 'ms' ? 'Nota Pemohon:' : 'Requester Notes:'}
                </span> {job.notes}
              </p>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => onDecline(job.id)}
                className="w-full py-3.5 px-4 bg-subtle hover:bg-subtle text-text-secondary font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 active:scale-95 text-sm"
              >
                <X className="w-4 h-4 text-text-muted" />
                <span>{language === 'ms' ? 'Tolak Tugas' : 'Decline Task'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundAlert.playSuccessTone()
                  onAccept(job.id)
                }}
                className={`w-full py-3.5 px-4 text-white font-black rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 active:scale-95 text-sm ${
                  isStat 
                    ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 shadow-rose-500/30' 
                    : 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 shadow-blue-500/30'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>{language === 'ms' ? 'TERIMA TUGAS' : 'ACCEPT TASK'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
