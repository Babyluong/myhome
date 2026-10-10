// src/modules/mystaff/components/AuditReasonModal.tsx
// Professional Confirmation Modal with Mandatory Reason & Audit Attribution

import React, { useState } from 'react'
import {
  AlertTriangle,
  User,
  Clock,
  Trash2,
  Edit3,
  X,
  ShieldAlert,
  CheckCircle2,
  FileText
} from 'lucide-react'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { Button } from '@/components/ui'

interface AuditReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void> | void
  title: string
  recordTitle: string
  actionType: 'DELETE' | 'EDIT'
  actorName: string
  actorRole?: string
  presetReasons?: string[]
  isLoading?: boolean
}

export const AuditReasonModal: React.FC<AuditReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  recordTitle,
  actionType,
  actorName,
  actorRole,
  presetReasons,
  isLoading = false
}) => {
  const { language } = useLanguage()
  const isMs = language === 'ms'

  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const isDelete = actionType === 'DELETE'

  const defaultPresets = isDelete
    ? isMs
      ? [
          'Sesi / Acara Dibatalkan',
          'Accidental Data Entry / Duplicate Record',
          'Pertindihan Jadual Kerja',
          'Pegawai Ditugaskan Urusan Lain',
          'Session Date & Time Reschedule'
        ]
      : [
          'Session / Event Cancelled',
          'Mistaken Entry / Duplicate Record',
          'Work Schedule Conflict',
          'Officer Reassigned to Other Duties',
          'Date & Time Rescheduled'
        ]
    : isMs
      ? [
          'Date / Time Change',
          'Pembetulan Pautan / Link Sesi',
          'Update Documents / Presentation Slides',
          'Pembetulan Nama Pegawai / Lokasi',
          'Update Title & Category'
        ]
      : [
          'Change of Date / Time',
          'Correction of Session Link / URL',
          'Update Slides / Attached Documents',
          'Correction of Officer Name / Venue',
          'Update Title & Category'
        ]

  const options = presetReasons || defaultPresets

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError(
        isMs
          ? 'Sila nyatakan sebab / justifikasi tindakan ini (Wajib untuk rekod audit).'
          : 'Please state the reason / justification for this action (Mandatory for audit trail).'
      )
      return
    }
    setError('')
    onConfirm(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 scale-100 transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Banner */}
        <div className={`p-6 border-b ${
          isDelete ? 'bg-rose-50/80 border-rose-200' : 'bg-amber-50/80 border-amber-200'
        } relative`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
              isDelete ? 'bg-rose-600 text-white shadow-md' : 'bg-amber-600 text-white shadow-md'
            }`}>
              {isDelete ? <Trash2 className="w-6 h-6" /> : <Edit3 className="w-6 h-6" />}
            </div>
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${
                  isDelete ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {isDelete
                    ? isMs ? 'AUDIT PEMADAMAN' : 'DELETION AUDIT'
                    : isMs ? 'AUDIT PINDAAN' : 'MODIFICATION AUDIT'}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium line-clamp-1">
                {isMs ? 'Rekod:' : 'Record:'} <span className="font-bold text-slate-900">"{recordTitle}"</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Audit Identity Notice */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 truncate">
                {isMs ? `Tindakan direkod atas nama: ${actorName}` : `Action recorded under: ${actorName}`}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {actorRole || (isMs ? 'Pegawai Bertugas' : 'Duty Officer')} •{' '}
                {new Date().toLocaleDateString(isMs ? 'ms-MY' : 'en-MY', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Preset Quick Reason Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {isMs ? 'Pilihan Sebab Pantas:' : 'Quick Preset Reasons:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setReason(opt)
                    setError('')
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all text-left ${
                    reason === opt
                      ? isDelete
                        ? 'bg-rose-100 text-rose-950 border-rose-300 font-bold shadow-xs'
                        : 'bg-amber-100 text-amber-950 border-amber-300 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea (Mandatory) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isMs ? 'Sebab / Justifikasi Terperinci' : 'Detailed Reason / Justification'}{' '}
                <span className="text-rose-600">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {isMs ? 'Mandatori' : 'Mandatory'}
              </span>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={e => {
                setReason(e.target.value)
                if (e.target.value.trim()) setError('')
              }}
              placeholder={
                isDelete
                  ? isMs
                    ? 'Cth: Sesi dibatalkan atas arahan Ketua Jabatan kerana pertindihan audit...'
                    : 'E.g., Session cancelled per HOD directive due to audit schedule overlap...'
                  : isMs
                    ? 'Cth: Tarikh dipinda ke 20 Ogos kerana dewan mesyuarat penuh...'
                    : 'E.g., Date moved to Aug 20 due to meeting room unavailability...'
              }
              className={`w-full p-3 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 placeholder:text-slate-400 transition-all ${
                error
                  ? 'border-rose-400 focus:ring-rose-400/20 bg-rose-50/30'
                  : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'
              }`}
            />
            {error && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all"
            >
              {isMs ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${
                isDelete
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                  : 'bg-slate-900 hover:bg-black active:scale-95'
              }`}
            >
              {isLoading ? (
                <span>{isMs ? 'Memproses...' : 'Processing...'}</span>
              ) : (
                <>
                  {isDelete ? <Trash2 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>
                    {isDelete
                      ? isMs ? 'Sahkan Pemadaman & Simpan Log' : 'Confirm Deletion & Save Log'
                      : isMs ? 'Sahkan & Simpan Log' : 'Confirm & Save Log'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
