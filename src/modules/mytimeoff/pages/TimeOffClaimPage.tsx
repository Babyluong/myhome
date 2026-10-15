// Time Off Extra Work Claim Submission Form (Perintah Am Bab C)

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ArrowLeft, Calendar, UploadCloud, MapPin, CheckCircle2, FileCheck, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  submitToilClaim,
  uploadToilProof,
  getToilBalance
} from '@/modules/mytimeoff/services/toilService'
import type { ToilWorkType, ToilBalance } from '@/shared/types/mytimeoff'
import { Button } from '@/components/ui'

export const TimeOffClaimPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore((state) => state.user)

  // Current balance state
  const [balance, setBalance] = useState<ToilBalance | null>(null)

  // Form Fields
  const [workType, setWorkType] = useState<ToilWorkType>('rest_day')
  const [workDate, setWorkDate] = useState('')
  const [timeStart, setTimeStart] = useState('08:00')
  const [timeEnd, setTimeEnd] = useState('17:00')
  const [location, setLocation] = useState('')
  const [workDescription, setWorkDescription] = useState('')

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load balance on mount
  useEffect(() => {
    if (user?.id) {
      getToilBalance(user.id).then((res) => {
        if (res.data) setBalance(res.data)
      })
    }
  }, [user?.id])

  // Live calculation of hours worked
  const calculatedHours = useMemo(() => {
    if (!timeStart || !timeEnd) return 0
    const [startH, startM] = timeStart.split(':').map(Number)
    const [endH, endM] = timeEnd.split(':').map(Number)

    let startMinutes = startH * 60 + startM
    let endMinutes = endH * 60 + endM

    if (endMinutes < startMinutes) {
      // Overnight work
      endMinutes += 24 * 60
    }

    const diffMinutes = endMinutes - startMinutes
    const hours = Math.round((diffMinutes / 60) * 100) / 100
    return Math.max(0, hours)
  }, [timeStart, timeEnd])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        toast.error(isMs ? 'Saiz fail tidak boleh melebihi 10MB' : 'File size cannot exceed 10MB')
        return
      }
      setSelectedFile(file)
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file))
      } else {
        setFilePreview(null)
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast.error(isMs ? 'Sila log masuk untuk membuat tuntutan' : 'Please log in to submit claim')
      return
    }

    if (!workDate) {
      toast.error(isMs ? 'Sila pilih tarikh kerja' : 'Please select work date')
      return
    }

    // Check that work date is not in future
    const today = new Date().toISOString().split('T')[0]
    if (workDate > today) {
      toast.error(
        isMs
          ? 'Tarikh kerja tidak boleh pada masa hadapan'
          : 'Work date cannot be in the future'
      )
      return
    }

    if (calculatedHours <= 0) {
      toast.error(
        isMs
          ? 'Masa tamat mestilah selepas masa mula'
          : 'End time must be after start time'
      )
      return
    }

    if (!location.trim()) {
      toast.error(isMs ? 'Sila nyatakan lokasi bertugas' : 'Please specify work location')
      return
    }

    if (!workDescription.trim()) {
      toast.error(
        isMs
          ? 'Sila nyatakan keterangan kerja yang telah dilakukan'
          : 'Please describe the tasks performed'
      )
      return
    }

    if (!selectedFile) {
      toast.error(
        isMs
          ? 'Wajib memuat naik bukti kerja (Kad Perakam Waktu / Surat Arahan Tugas)'
          : 'Proof of work (Attendance Card / Duty Letter) is required'
      )
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Upload proof file
      let attachmentUrl: string | null = null
      let attachmentName: string | null = selectedFile.name

      const uploadResult = await uploadToilProof(selectedFile, user.id)
      if (uploadResult.error) {
        throw new Error(uploadResult.error)
      }
      attachmentUrl = uploadResult.url

      // 2. Submit TOIL claim
      const res = await submitToilClaim({
        user_id: user.id,
        hospital_id: user.hospital_id || '85bb6adc-b868-428b-83f4-e5af2f5cf904',
        department_id: user.department_id || '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880',
        work_date: workDate,
        time_start: timeStart,
        time_end: timeEnd,
        hours_worked: calculatedHours,
        work_type: workType,
        location: location.trim(),
        work_description: workDescription.trim(),
        status: 'pending',
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
      })

      if (res.error) throw new Error(res.error)

      toast.success(
        isMs
          ? 'Permohonan cuti gantian berjaya dihantar kepada penyelia untuk kelulusan!'
          : 'Claim successfully submitted to supervisor for approval!'
      )

      navigate(ROUTES.TIMEOFF_MY_CLAIMS)
    } catch (err: any) {
      console.error(err)
      toast.error(
        err.message ||
          (isMs
            ? 'Gagal menghantar tuntutan cuti gantian'
            : 'Failed to submit claim')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 w-full space-y-6 text-text-primary">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-surface border border-border-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-surface border border-border-default" />

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.TIMEOFF_DASHBOARD)}
            className="p-3 hover:bg-subtle/50 border border-border-subtle rounded-2xl text-slate-400 hover:text-text-secondary transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary flex items-center gap-2">
              {isMs ? 'Borang Tuntutan Cuti Gantian' : 'Time Off Claim Form'}
            </h1>
            <p className="text-sm text-text-muted mt-0.5 font-medium">
              {isMs
                ? 'Tuntutan penggantian waktu rehat bagi kerja lebih masa / hari kelepasan am'
                : 'Claim compensatory time off for overtime or public holiday work'}
            </p>
          </div>
        </div>

        {/* Current Balance Indicator */}
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-100 rounded-2xl px-4 py-2.5">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-[11px] font-bold text-text-secondary font-bold uppercase tracking-wider">
              {isMs ? 'Baki Semasa' : 'Current Balance'}
            </div>
            <div className="text-sm font-black font-mono text-blue-700">
              {balance ? `${balance.balance_hours} Jam` : '0 Jam'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-surface border border-border-subtle rounded-3xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Work Type Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide">
              {isMs ? '1. Jenis Kerja Luar Waktu' : '1. Extra Work Category'}{' '}
              <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'rest_day',
                  title: isMs ? 'Hari Rehat Mingguan' : 'Weekly Rest Day',
                  desc: isMs
                    ? 'Sabtu / Ahad mengikut jadual giliran'
                    : 'Rest day as per duty roster',
                },
                {
                  id: 'public_holiday',
                  title: isMs ? 'Hari Cuti Umum' : 'Public Holiday',
                  desc: isMs
                    ? 'Cuti kelepasan am persekutuan / negeri'
                    : 'Federal or state public holidays',
                },
                {
                  id: 'overtime',
                  title: isMs ? 'Kerja Lebih Masa (OT)' : 'Overtime Hours',
                  desc: isMs
                    ? 'Tugas rasmi melebihi waktu bertugas biasa'
                    : 'Official duties beyond standard shifts',
                },
              ].map((item) => {
                const isSelected = workType === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => setWorkType(item.id as ToilWorkType)}
                    className={`p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 shadow-md ring-2 ring-blue-400/30'
                        : 'border-border-default hover:border-border-default bg-surface'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-text-primary text-sm">{item.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 2: Date and Time of Extra Work */}
          <div className="p-5 rounded-2xl bg-subtle/50 border border-border-default space-y-4">
            <div className="font-bold text-text-primary text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{isMs ? '2. Tarikh & Tempoh Masa Kerja' : '2. Date & Work Duration'}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {isMs ? 'Kiraan automatik' : 'Auto-calculated'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-text-muted mb-1">
                  {isMs ? 'Tarikh Bertugas' : 'Work Date'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={workDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setWorkDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-default text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">
                  {isMs ? 'Masa Mula' : 'Start Time'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-default text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">
                  {isMs ? 'Masa Tamat' : 'End Time'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-default text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">
                  {isMs ? 'Jumlah Jam Dituntut' : 'Hours Claimed'}
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-default text-sm font-black font-mono text-blue-600 flex items-center justify-between">
                  <span>
                    {calculatedHours} {isMs ? 'Jam' : 'Hours'}
                  </span>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Location and Work Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {isMs ? '3. Lokasi Bertugas' : '3. Work Location'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={
                    isMs
                      ? 'cth. Farmasi Logistik / Wad 5A / Bilik Mesyuarat Utama'
                      : 'e.g. Pharmacy Logistics / Ward 5A / Main Hall'
                  }
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-default text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {isMs ? '4. Keterangan Tugas Yang Dilaksanakan' : '4. Description of Work Done'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder={
                  isMs
                    ? 'Sila nyatakan secara terperinci tugasan kecemasan/lebih masa yang telah dilaksanakan...'
                    : 'Please detail the tasks performed and reasons for overtime...'
                }
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border-default text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface"
              />
            </div>
          </div>

          {/* Section 4: Proof Upload (Mandatory Attendance Card) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide">
                {isMs
                  ? '5. Bukti Kerja Tambahan (Kad Perakam Waktu / Surat Arahan)'
                  : '5. Proof of Extra Work (Attendance Card / Duty Letter)'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">PDF, JPG, PNG (Max 10MB)</span>
            </div>

            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-default hover:border-blue-400 rounded-2xl cursor-pointer bg-subtle/50 hover:bg-blue-500/10 transition-colors">
                <UploadCloud className="w-10 h-10 text-blue-500 mb-2" />
                <span className="text-sm font-bold text-text-secondary">
                  {isMs
                    ? 'Klik untuk muat naik atau seret fail ke sini'
                    : 'Click to upload or drag and drop'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  {isMs
                    ? 'Kad perakam waktu / punch card bercop penyelia / surat arahan bertugas rasmi'
                    : 'Punched attendance card signed by supervisor / official assignment letter'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary">{selectedFile.name}</div>
                    <div className="text-xs text-text-muted font-mono">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-blue-100 rounded-xl text-text-muted hover:text-rose-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {filePreview && (
              <div className="mt-2 p-2 bg-subtle/50 rounded-xl border border-border-default inline-block">
                <img
                  src={filePreview}
                  alt="Proof Preview"
                  className="h-32 rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting || calculatedHours <= 0 || !selectedFile}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-md rounded-2xl"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  {isMs ? 'Menghantar Permohonan...' : 'Submitting Claim...'}
                </span>
              ) : (
                <span>{isMs ? 'Hantar Tuntutan Cuti Gantian' : 'Submit Time Off Claim'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TimeOffClaimPage
