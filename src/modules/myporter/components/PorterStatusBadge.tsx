// src/modules/myporter/components/PorterStatusBadge.tsx
import React from 'react'
import { Badge } from '@/components/ui'
import type { PorterJobStatus, PorterUrgency, PorterStaffStatus } from '@/shared/types/myporter'
import { useLanguage } from '@/shared/contexts/LanguageContext'

interface JobStatusBadgeProps {
  status: PorterJobStatus | string
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status }) => {
  const { language } = useLanguage()

  switch (status) {
    case 'draft':
      return <Badge variant="gray">{language === 'ms' ? 'Draf' : 'Draft'}</Badge>
    case 'broadcasting':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
          {language === 'ms' ? 'Mencari PPK' : 'Searching Porter'}
        </span>
      )
    case 'accepted':
      return <Badge variant="warning">{language === 'ms' ? 'PPK Menerima' : 'Porter Accepted'}</Badge>
    case 'at_pickup':
      return <Badge variant="warning">{language === 'ms' ? 'Tiba di Lokasi Ambil' : 'At Pickup Location'}</Badge>
    case 'in_transit':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          {language === 'ms' ? 'Dalam Perjalanan' : 'In Transit'}
        </span>
      )
    case 'at_destination':
      return <Badge variant="warning">{language === 'ms' ? 'Tiba di Destinasi' : 'At Destination'}</Badge>
    case 'pending_receiver_confirmation':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          {language === 'ms' ? 'Menunggu Pengesahan' : 'Pending Confirmation'}
        </span>
      )
    case 'completed':
      return <Badge variant="success">{language === 'ms' ? 'Selesai' : 'Completed'}</Badge>
    case 'cancelled':
      return <Badge variant="gray">{language === 'ms' ? 'Dibatalkan' : 'Cancelled'}</Badge>
    case 'disputed':
      return <Badge variant="error">{language === 'ms' ? 'Pertikaian' : 'Disputed'}</Badge>
    default:
      return <Badge variant="gray">{status}</Badge>
  }
}

interface UrgencyBadgeProps {
  urgency: PorterUrgency | string
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
  const { language } = useLanguage()

  switch (urgency) {
    case 'stat':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm animate-pulse">
          {language === 'ms' ? '⚡ STAT KECEMASAN' : '⚡ STAT EMERGENCY'}
        </span>
      )
    case 'urgent':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
          {language === 'ms' ? 'SEGERA' : 'URGENT'}
        </span>
      )
    case 'routine':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {language === 'ms' ? 'BIASA' : 'ROUTINE'}
        </span>
      )
  }
}

interface StaffStatusBadgeProps {
  status: PorterStaffStatus | string
}

export const StaffStatusBadge: React.FC<StaffStatusBadgeProps> = ({ status }) => {
  const { language } = useLanguage()

  switch (status) {
    case 'available':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {language === 'ms' ? 'Bersedia (Online)' : 'Available (Online)'}
        </span>
      )
    case 'in_job':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          {language === 'ms' ? 'Sedang Bertugas' : 'On Task'}
        </span>
      )
    case 'on_break':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {language === 'ms' ? 'Rehat (Break)' : 'On Break'}
        </span>
      )
    case 'offline':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          {language === 'ms' ? 'Luar Talian' : 'Offline'}
        </span>
      )
  }
}
