// src/modules/mytempahan/components/BookingDetailDrawer.tsx
// Professional Slide-Over Detail Drawer with Dark/Light Support, PDF Slip & iCal Export

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin, Printer, Download, CheckCircle2, AlertCircle, XCircle, Phone, Mail, Utensils, Crown, Layers, ShieldCheck } from 'lucide-react'
import { Booking } from '@/shared/types/mytempahan'
import { downloadBookingConfirmationPdf } from '../services/tempahanPdfService'
import { downloadBookingICS } from '../services/tempahanCalendarService'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export interface BookingDetailDrawerProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onCancelBooking?: (bookingId: string) => void
  onApproveBooking?: (booking: Booking) => void
  onRejectBooking?: (booking: Booking) => void
  canApprove?: boolean
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  booking,
  isOpen,
  onClose,
  onCancelBooking,
  onApproveBooking,
  onRejectBooking,
  canApprove = false
}) => {
  const { language } = useLanguage()
  const isBM = language === 'ms'

  if (!booking) return null

  // Status visual mapping
  const statusConfig: Record<string, { labelEn: string; labelMs: string; bg: string; text: string; icon: React.ElementType }> = {
    pending: {
      labelEn: 'Pending Approval',
      labelMs: 'Menunggu Kelulusan',
      bg: 'bg-amber-500/10 dark:bg-amber-950/50 border-amber-500/20 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      icon: AlertCircle
    },
    approved: {
      labelEn: 'Approved',
      labelMs: 'Diluluskan',
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/50 border-emerald-500/20 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: CheckCircle2
    },
    rejected: {
      labelEn: 'Rejected',
      labelMs: 'Ditolak',
      bg: 'bg-rose-500/10 dark:bg-rose-950/50 border-rose-500/20 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300',
      icon: XCircle
    },
    in_use: {
      labelEn: 'In Use',
      labelMs: 'Sedang Digunakan',
      bg: 'bg-accent-base/10 dark:bg-teal-950/50 border-accent-base/20 dark:border-teal-800',
      text: 'text-teal-700 dark:text-teal-300',
      icon: Clock
    },
    completed: {
      labelEn: 'Completed',
      labelMs: 'Selesai',
      bg: 'bg-subtle dark:bg-slate-800 border-border-default dark:border-slate-700',
      text: 'text-text-secondary dark:text-slate-300',
      icon: CheckCircle2
    },
    cancelled: {
      labelEn: 'Cancelled',
      labelMs: 'Dibatalkan',
      bg: 'bg-subtle dark:bg-slate-800 border-border-default dark:border-slate-700',
      text: 'text-text-muted dark:text-slate-400',
      icon: XCircle
    },
    expired: {
      labelEn: 'Expired',
      labelMs: 'Luput',
      bg: 'bg-subtle dark:bg-slate-800 border-border-default dark:border-slate-700',
      text: 'text-text-muted dark:text-slate-400',
      icon: AlertCircle
    }
  }

  const currentStatus = statusConfig[booking.status] || statusConfig.pending
  const StatusIcon = currentStatus.icon
  const statusLabel = isBM ? currentStatus.labelMs : currentStatus.labelEn

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end text-text-primary dark:text-slate-100">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          {/* Slide Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-surface dark:bg-slate-900 border-l border-border-default dark:border-slate-800 h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-border-default dark:border-slate-800 bg-subtle/50 dark:bg-slate-800/50 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-text-secondary dark:text-slate-300 bg-surface dark:bg-slate-900 px-2 py-0.5 rounded border border-border-default dark:border-slate-700">
                    {booking.booking_number}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                      currentStatus.bg,
                      currentStatus.text
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusLabel}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-text-primary dark:text-white leading-snug">
                  {booking.purpose}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-text-secondary dark:hover:text-white hover:bg-subtle dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Event Time & Venue Card */}
              <div className="rounded-2xl bg-subtle/50 dark:bg-slate-800/60 border border-border-default dark:border-slate-700/80 overflow-hidden">
                {booking.room?.image_url && (
                  <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                    <img
                      src={booking.room.image_url}
                      alt={booking.room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                        {booking.room.room_code}
                      </span>
                      <span className="text-[10px] font-medium text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
                        {booking.room.floor_level}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                        {isBM ? 'Fasiliti / Bilik' : 'Facility / Room'}
                      </span>
                      <h3 className="text-base font-bold text-text-primary dark:text-white mt-0.5">
                        {booking.room?.name || (isBM ? 'Bilik Mesyuarat' : 'Conference Room')}
                      </h3>
                      <p className="text-xs text-text-muted dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {booking.room?.location}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-surface dark:bg-slate-900 border border-border-default dark:border-slate-700 text-xs font-semibold text-text-secondary dark:text-slate-300 shadow-elevation-1">
                      {booking.event_type}
                    </span>
                  </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-default dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-2 text-text-secondary dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-text-muted font-medium">
                        {isBM ? 'Tarikh Acara' : 'Event Date'}
                      </div>
                      <div className="font-semibold">{booking.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-text-secondary dark:text-slate-300">
                    <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-text-muted font-medium">
                        {isBM ? 'Masa (Durasi)' : 'Time (Duration)'}
                      </div>
                      <div className="font-semibold">
                        {booking.start_time} - {booking.end_time} ({booking.duration_hours}{isBM ? 'j' : 'h'})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Requester Contact Card */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-muted dark:text-text-secondary font-bold uppercase tracking-wider">
                  {isBM ? 'Maklumat Pemohon & Jabatan' : 'Applicant & Department Details'}
                </h4>
                <div className="p-4 rounded-2xl bg-surface dark:bg-slate-900 border border-border-default dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-text-primary dark:text-white text-sm">{booking.pemohon_name}</div>
                      <div className="text-text-muted dark:text-slate-400">{booking.pemohon_jawatan} • {booking.pemohon_department}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-subtle dark:bg-slate-800 text-text-secondary dark:text-slate-300 text-[11px] font-semibold">
                      {booking.attendees_count} Pax
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle dark:border-slate-800 text-text-muted dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{booking.pemohon_phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{booking.pemohon_email || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics & Equipment */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-text-muted dark:text-text-secondary font-bold uppercase tracking-wider">
                  {isBM ? 'Susun Atur & Keperluan Logistik' : 'Layout & Logistics Requirements'}
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-subtle/50 dark:bg-slate-800/60 border border-border-default dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 dark:text-text-muted font-semibold block mb-1">
                      {isBM ? 'SUSUNAN MEJA' : 'TABLE LAYOUT'}
                    </span>
                    <span className="font-bold text-text-primary dark:text-slate-200 uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      {booking.layout_type}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-subtle/50 dark:bg-slate-800/60 border border-border-default dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 dark:text-text-muted font-semibold block mb-1">
                      {isBM ? 'STATUS JAMUAN' : 'CATERING STATUS'}
                    </span>
                    <span className="font-bold text-text-primary dark:text-slate-200 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      {booking.tempahan_makanan?.diperlukan
                        ? (isBM ? 'Katering Disediakan' : 'Catering Provided')
                        : (isBM ? 'Tiada Jamuan' : 'No Catering')}
                    </span>
                  </div>
                </div>

                {/* VIP Indicator */}
                {booking.tetamu_vip?.ada_vip && (
                  <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 dark:border-amber-900/60 text-xs text-amber-400 dark:text-amber-300 font-bold dark:text-amber-300 flex items-start gap-2.5">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">{isBM ? 'Kehadiran Tetamu Kenamaan (VIP)' : 'VIP Dignitary Presence'}</div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                        {(booking.tetamu_vip.senarai_vip || []).join(', ') || (isBM ? 'Tetamu Rasmi KKM' : 'Official MOH VIP')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities Requested */}
                <div className="p-3.5 rounded-xl bg-subtle/50 dark:bg-slate-800/60 border border-border-default dark:border-slate-700 space-y-2">
                  <span className="text-[10px] text-slate-400 dark:text-text-muted font-bold uppercase block tracking-wider">
                    {isBM ? 'Peralatan Dimohon' : 'Requested Amenities'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(booking.requested_amenities || []).map(amenity => (
                      <span
                        key={amenity}
                        className="px-2.5 py-1 rounded-md bg-surface dark:bg-slate-900 border border-border-default dark:border-slate-700 text-text-secondary dark:text-slate-300 text-xs font-medium shadow-elevation-1"
                      >
                        {amenity.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Special Requirements */}
                {booking.special_requirements && (
                  <div className="p-3.5 rounded-xl bg-subtle/50 dark:bg-slate-800/60 border border-border-default dark:border-slate-700 text-xs">
                    <span className="text-[10px] text-slate-400 dark:text-text-muted font-bold uppercase block mb-1">
                      {isBM ? 'Catatan Khas' : 'Special Requirements'}
                    </span>
                    <p className="text-text-secondary dark:text-slate-300 italic">{booking.special_requirements}</p>
                  </div>
                )}
              </div>

              {/* Rejection / Approval Notes */}
              {booking.rejection_reason && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/20 dark:border-rose-900/60 text-xs text-rose-400 dark:text-rose-300">
                  <div className="font-bold flex items-center gap-1.5 mb-0.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    {isBM ? 'Sebab Penolakan:' : 'Rejection Reason:'}
                  </div>
                  <div>{booking.rejection_reason}</div>
                </div>
              )}

              {booking.catatan_pelulus && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 dark:border-emerald-900/60 text-xs text-emerald-400 dark:text-emerald-300">
                  <div className="font-bold flex items-center gap-1.5 mb-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {isBM ? `Catatan Kelulusan (${booking.approved_by_name || 'Pentadbir'}):` : `Approval Notes (${booking.approved_by_name || 'Admin'}):`}
                  </div>
                  <div>{booking.catatan_pelulus}</div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-border-default dark:border-slate-800 bg-subtle/50 dark:bg-slate-900 flex flex-col gap-2.5">
              {/* Document Triggers */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadBookingConfirmationPdf(booking)}
                  className="py-2.5 px-3 rounded-xl border border-border-default dark:border-slate-700 bg-surface dark:bg-slate-800 hover:bg-subtle dark:hover:bg-slate-700 text-text-secondary dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-elevation-1"
                >
                  <Printer className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  {isBM ? 'Cetak Slip PDF' : 'Print PDF Slip'}
                </button>

                <button
                  onClick={() => downloadBookingICS(booking)}
                  className="py-2.5 px-3 rounded-xl border border-border-default dark:border-slate-700 bg-surface dark:bg-slate-800 hover:bg-subtle dark:hover:bg-slate-700 text-text-secondary dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-elevation-1"
                >
                  <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  {isBM ? 'Eksport ke iCal (.ics)' : 'Export to iCal (.ics)'}
                </button>
              </div>

              {/* Admin Approval Quick Action or User Cancel */}
              {canApprove && booking.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onRejectBooking && onRejectBooking(booking)}
                    className="py-2.5 px-3 rounded-xl bg-rose-500/10 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-500/20 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors"
                  >
                    {isBM ? 'Tolak Permohonan' : 'Reject Request'}
                  </button>
                  <button
                    onClick={() => onApproveBooking && onApproveBooking(booking)}
                    className="py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    {isBM ? 'Luluskan Tempahan' : 'Approve Booking'}
                  </button>
                </div>
              )}

              {!canApprove && ['pending', 'approved'].includes(booking.status) && onCancelBooking && (
                <button
                  onClick={() => onCancelBooking(booking.id)}
                  className="w-full py-2 px-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-950/30 border border-rose-500/20 dark:border-rose-800 text-xs font-semibold transition-colors"
                >
                  {isBM ? 'Batal Permohonan Tempahan Ini' : 'Cancel This Booking Request'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
