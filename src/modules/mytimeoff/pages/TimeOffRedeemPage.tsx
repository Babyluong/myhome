// Time Off Leave Redemption Request Form (Penebusan Cuti Gantian)

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2, Calendar, Info } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  getToilBalance,
  submitToilRedemption
} from '@/modules/mytimeoff/services/toilService'
import type { ToilBalance } from '@/shared/types/mytimeoff'
import { Button } from '@/components/ui'

export const TimeOffRedeemPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore((state) => state.user)

  const [balance, setBalance] = useState<ToilBalance | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)

  // Form State
  const [redeemDate, setRedeemDate] = useState('')
  const [redeemHours, setRedeemHours] = useState<number>(8)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (user?.id) {
      setIsLoadingBalance(true)
      getToilBalance(user.id, currentYear)
        .then((res) => {
          if (res.data) setBalance(res.data)
        })
        .finally(() => setIsLoadingBalance(false))
    }
  }, [user?.id, currentYear])

  const availableHours = balance?.balance_hours || 0
  const isInsufficient = redeemHours > availableHours

  // Preset hours buttons (4h = Half Day, 8h = 1 Full Day, 16h = 2 Days)
  const handlePresetSelect = (hours: number) => {
    setRedeemHours(hours)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast.error(isMs ? 'Sila log masuk untuk membuat permohonan' : 'Please log in to apply')
      return
    }

    if (!redeemDate) {
      toast.error(isMs ? 'Sila pilih tarikh cuti' : 'Please choose leave date')
      return
    }

    if (redeemHours <= 0) {
      toast.error(isMs ? 'Bilangan jam mestilah lebih daripada 0' : 'Hours must be greater than 0')
      return
    }

    if (isInsufficient) {
      toast.error(
        isMs
          ? `Baki cuti tidak mencukupi! Anda hanya mempunyai ${availableHours} jam baki cuti gantian.`
          : `Insufficient balance! You only have ${availableHours} hours remaining.`
      )
      return
    }

    try {
      setIsSubmitting(true)
      const res = await submitToilRedemption({
        user_id: user.id,
        hospital_id: user.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904',
        department_id: user.department_id || '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880',
        redeem_date: redeemDate,
        redeem_hours: redeemHours,
        reason: reason.trim(),
        status: 'pending',
      })

      if (res.error) throw new Error(res.error)

      toast.success(
        isMs
          ? 'Permohonan penebusan cuti gantian berjaya dihantar ke penyelia!'
          : 'Leave redemption application submitted to supervisor!'
      )

      navigate(ROUTES.TIMEOFF_HISTORY)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || (isMs ? 'Gagal menghantar permohonan' : 'Failed to submit request'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 w-full space-y-6 text-text-primary">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.TIMEOFF_DASHBOARD)}
            className="p-3 hover:bg-subtle/50 border border-border-subtle rounded-2xl text-slate-400 hover:text-text-secondary transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary flex items-center gap-2">
              {isMs ? 'Penebusan Cuti Gantian' : 'Redeem Time Off as Leave'}
            </h1>
            <p className="text-sm text-text-muted mt-0.5 font-medium">
              {isMs
                ? 'Gunakan baki jam cuti gantian terkumpul untuk cuti rehat atau kecemasan'
                : 'Apply for time off using accumulated compensatory leave balance'}
            </p>
          </div>
        </div>

        {/* Live Balance Pill */}
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-100 rounded-2xl px-5 py-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <div className="text-[11px] font-bold text-text-secondary font-bold uppercase tracking-wider">
              {isMs ? 'Baki Boleh Ditebus' : 'Available Balance'}
            </div>
            <div className="text-lg font-black font-mono text-blue-700">
              {availableHours} {isMs ? 'Jam' : 'Hours'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-surface border border-border-subtle rounded-3xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Preset Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide">
              {isMs ? '1. Tempoh Masa Penebusan Cuti' : '1. Leave Duration Preset'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { hours: 4, label: isMs ? 'Separuh Hari (4 Jam)' : 'Half Day (4 Hours)' },
                { hours: 8, label: isMs ? 'Satu Hari Penuh (8 Jam)' : 'Full Day (8 Hours)' },
                { hours: 16, label: isMs ? 'Dua Hari (16 Jam)' : 'Two Days (16 Hours)' },
              ].map((p) => {
                const isSelected = redeemHours === p.hours
                const isDisabled = p.hours > availableHours
                return (
                  <button
                    type="button"
                    key={p.hours}
                    disabled={isDisabled}
                    onClick={() => handlePresetSelect(p.hours)}
                    className={`p-4 rounded-2xl border text-left transition-colors font-medium ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-400/30 font-bold text-blue-400 dark:text-blue-300 font-bold'
                        : isDisabled
                        ? 'border-border-subtle bg-subtle/50 text-slate-300 cursor-not-allowed'
                        : 'border-border-default hover:border-border-default bg-surface text-text-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{p.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    {isDisabled && (
                      <span className="text-[11px] text-rose-500 font-normal block mt-1">
                        {isMs ? 'Baki tidak mencukupi' : 'Insufficient balance'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date and Custom Hours */}
          <div className="p-5 rounded-2xl bg-subtle/50 border border-border-default space-y-4">
            <div className="font-bold text-text-primary text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{isMs ? '2. Tarikh & Bilangan Jam' : '2. Date & Custom Hours'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">
                  {isMs ? 'Tarikh Hendak Bercuti' : 'Redemption Leave Date'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={redeemDate}
                  onChange={(e) => setRedeemDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-default text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">
                  {isMs ? 'Bilangan Jam Dituntut (Jam)' : 'Hours to Redeem'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={availableHours > 0 ? availableHours : 1}
                  step="0.5"
                  value={redeemHours}
                  onChange={(e) => setRedeemHours(Number(e.target.value))}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:ring-2 focus:border-blue-500 bg-surface ${
                    isInsufficient
                      ? 'border-rose-300 text-rose-600 focus:ring-rose-500/20'
                      : 'border-border-default focus:ring-blue-500/20'
                  }`}
                />
              </div>
            </div>

            {/* Live deduction calculation */}
            <div className="pt-3 border-t border-border-default flex items-center justify-between text-xs">
              <span className="text-text-muted">
                {isMs ? 'Baki selepas penebusan diluluskan:' : 'Balance after approval:'}
              </span>
              <span
                className={`font-mono font-black ${
                  isInsufficient ? 'text-rose-600' : 'text-emerald-700 text-sm'
                }`}
              >
                {isInsufficient
                  ? isMs
                    ? 'Baki Tidak Mencukupi!'
                    : 'Insufficient Balance!'
                  : `${(availableHours - redeemHours).toFixed(1)} Jam`}
              </span>
            </div>
          </div>

          {/* Reason / Remarks */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-secondary">
              {isMs ? '3. Sebab / Catatan Penebusan' : '3. Reason / Justification'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder={
                isMs
                  ? 'cth. Urusan keluarga / rehat selepas tugas syif malam berpanjangan / kecemasan...'
                  : 'e.g. Family commitments / compensatory rest following extended shifts...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border-default text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface"
            />
          </div>

          {/* Policy Information Box */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-100 flex items-start gap-3 text-xs text-blue-400 dark:text-blue-300 font-bold leading-relaxed">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>{isMs ? 'Peraturan Penebusan:' : 'Redemption Rule:'}</strong>{' '}
              {isMs
                ? 'Setelah penyelia meluluskan permohonan ini, baki jam cuti gantian anda akan dipotong secara automatik daripada lejar akaun anda.'
                : 'Upon approval by your supervisor, the requested hours will be automatically deducted from your Time Off balance.'}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.TIMEOFF_DASHBOARD)}
              className="border-border-default hover:bg-subtle/50 text-text-secondary font-bold px-6"
            >
              {isMs ? 'Batal' : 'Cancel'}
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || isInsufficient || availableHours <= 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-md rounded-2xl"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  {isMs ? 'Menghantar Permohonan...' : 'Submitting Request...'}
                </span>
              ) : (
                <span>{isMs ? 'Hantar Permohonan Cuti' : 'Submit Leave Request'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TimeOffRedeemPage
