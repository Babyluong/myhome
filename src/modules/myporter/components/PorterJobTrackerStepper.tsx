// src/modules/myporter/components/PorterJobTrackerStepper.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  PersonStanding, 
  PackageCheck, 
  UserCheck,
  AlertCircle
} from 'lucide-react'
import type { PorterJobStatus, PorterJobRequest } from '@/shared/types/myporter'
import { useLanguage } from '@/shared/contexts/LanguageContext'

interface StepConfig {
  key: string
  label: string
  desc: string
  icon: React.ElementType
}

const getStepIndex = (status: PorterJobStatus): number => {
  switch (status) {
    case 'draft':
    case 'broadcasting':
      return 0
    case 'accepted':
      return 1
    case 'at_pickup':
      return 2
    case 'in_transit':
      return 3
    case 'at_destination':
    case 'pending_receiver_confirmation':
      return 4
    case 'completed':
      return 5
    case 'cancelled':
    case 'disputed':
    default:
      return 0
  }
}

interface Props {
  job: PorterJobRequest
  compact?: boolean
}

export const PorterJobTrackerStepper: React.FC<Props> = ({ job, compact = false }) => {
  const { language } = useLanguage()

  const STEPS: StepConfig[] = [
    { 
      key: 'broadcasting', 
      label: language === 'ms' ? 'Pesanan Dibuat' : 'Request Created', 
      desc: language === 'ms' ? 'Mencari PPK berdekatan' : 'Searching nearby porters', 
      icon: Clock 
    },
    { 
      key: 'accepted', 
      label: language === 'ms' ? 'PPK Ditugaskan' : 'Porter Assigned', 
      desc: language === 'ms' ? 'PPK menuju ke lokasi ambil' : 'Porter heading to pickup', 
      icon: UserCheck 
    },
    { 
      key: 'at_pickup', 
      label: language === 'ms' ? 'Tiba di Asal' : 'At Pickup Location', 
      desc: language === 'ms' ? 'Pengesahan kargo/pesakit' : 'Verifying cargo/patient', 
      icon: MapPin 
    },
    { 
      key: 'in_transit', 
      label: language === 'ms' ? 'Dalam Perjalanan' : 'In Transit', 
      desc: language === 'ms' ? 'Sedang menuju ke destinasi' : 'Heading to destination', 
      icon: PersonStanding 
    },
    { 
      key: 'pending_receiver_confirmation', 
      label: language === 'ms' ? 'Tiba di Destinasi' : 'At Destination', 
      desc: language === 'ms' ? 'Menunggu pengesahan penerima' : 'Awaiting receiver confirmation', 
      icon: PackageCheck 
    },
    { 
      key: 'completed', 
      label: language === 'ms' ? 'Selesai' : 'Completed', 
      desc: language === 'ms' ? 'Penyerahan disahkan' : 'Handover verified', 
      icon: CheckCircle 
    }
  ]

  const currentStepIdx = getStepIndex(job.status)
  const isCancelled = job.status === 'cancelled'
  const isDisputed = job.status === 'disputed'

  if (isCancelled) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div className="text-sm">
          <p className="font-bold">
            {language === 'ms' ? 'Permohonan Ini Telah Dibatalkan' : 'This Request Has Been Cancelled'}
          </p>
          {job.cancellation_reason && (
            <p className="text-xs text-rose-600 mt-0.5">
              {language === 'ms' ? 'Sebab:' : 'Reason:'} {job.cancellation_reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (isDisputed) {
    return (
      <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-xl flex items-center gap-3 text-amber-400 dark:text-amber-300 font-bold">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="text-sm">
          <p className="font-bold">
            {language === 'ms' ? 'Tugasan Dalam Status Pertikaian (Dispute)' : 'Task in Dispute Status'}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            {language === 'ms' ? 'Penyelia sedang menyemak ketidakpadanan kargo/lokasi.' : 'Supervisor is reviewing cargo/location discrepancy.'}
          </p>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-text-secondary">{STEPS[currentStepIdx]?.label}</span>
          <span className="text-slate-400 font-mono">
            {language === 'ms' ? `Fasa ${currentStepIdx + 1} / ${STEPS.length}` : `Phase ${currentStepIdx + 1} / ${STEPS.length}`}
          </span>
        </div>
        <div className="w-full bg-subtle h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIdx + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${currentStepIdx === 5 ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-500 to-blue-600'}`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-4">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-subtle -translate-y-1/2 z-0" />
        
        {/* Progress Fill Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600 -translate-y-1/2 z-0 transition-colors duration-500" 
          style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIdx
          const isCurrent = idx === currentStepIdx
          const Icon = step.icon

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150 ${
                  isDone 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg scale-110' 
                      : 'bg-surface border-2 border-border-default text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="text-center mt-2 max-w-[110px]">
                <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-blue-600' : isDone ? 'text-text-primary' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="md:hidden space-y-4">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIdx
          const isCurrent = idx === currentStepIdx
          const Icon = step.icon

          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              {idx < STEPS.length - 1 && (
                <div 
                  className={`absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2 ${
                    isDone ? 'bg-emerald-400' : 'bg-subtle'
                  }`} 
                />
              )}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                  isDone 
                    ? 'bg-emerald-500 text-white' 
                    : isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : 'bg-subtle border border-border-default text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold ${isCurrent ? 'text-blue-600 font-extrabold' : isDone ? 'text-text-primary' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded-full animate-pulse">
                      {language === 'ms' ? 'Semasa' : 'Current'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
