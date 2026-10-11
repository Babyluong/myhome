// src/modules/myporter/components/HandoverVerificationModal.tsx
import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  X, 
  PenTool, 
  RotateCcw, 
  Star, 
  ShieldCheck, 
  User, 
  FileText 
} from 'lucide-react'
import type { PorterJobRequest, HandoverProof, PorterRating } from '@/shared/types/myporter'
import { Button, Input } from '@/components/ui'
import { useLanguage } from '@/shared/contexts/LanguageContext'

interface Props {
  job: PorterJobRequest | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (jobId: string, proof: HandoverProof, rating?: PorterRating) => void
}

export const HandoverVerificationModal: React.FC<Props> = ({
  job,
  isOpen,
  onClose,
  onSubmit
}) => {
  const { language } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Recipient form state
  const [recipientName, setRecipientName] = useState('')
  const [recipientStaffId, setRecipientStaffId] = useState('')
  const [recipientJawatan, setRecipientJawatan] = useState(language === 'ms' ? 'Jururawat U29' : 'Staff Nurse U29')
  const [handoverNotes, setHandoverNotes] = useState('')

  // Rating state
  const [stars, setStars] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([
    language === 'ms' ? 'Pantas' : 'Prompt & Fast',
    language === 'ms' ? 'Cermat' : 'Careful & Safe',
    language === 'ms' ? 'Sopan' : 'Polite & Courteous'
  ])

  const availableTags = language === 'ms'
    ? ['Pantas', 'Cermat', 'Sopan', 'Patuh SOP', 'Tiba Tepat Masa', 'Bantuan Tambahan']
    : ['Prompt & Fast', 'Careful & Safe', 'Polite & Courteous', 'Followed SOP', 'Punctual Arrival', 'Extra Assistance']

  useEffect(() => {
    if (isOpen && job) {
      setRecipientName(job.recipient_name || '')
      setHasSignature(false)
      setHandoverNotes('')
      setStars(5)
      clearSignature()
    }
  }, [isOpen, job?.id])

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      setHasSignature(false)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0f172a'
    setIsDrawing(true)
    setHasSignature(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) return

    let sigDataUrl = ''
    if (canvasRef.current && hasSignature) {
      sigDataUrl = canvasRef.current.toDataURL('image/png')
    }

    const proof: HandoverProof = {
      proof_type: 'signature',
      recipient_name: recipientName || (language === 'ms' ? 'Kakitangan Penerima' : 'Recipient Staff'),
      recipient_staff_id: recipientStaffId || 'STF-UNKNOWN',
      recipient_jawatan: recipientJawatan,
      signature_url: sigDataUrl,
      timestamp: new Date().toISOString(),
      notes: handoverNotes
    }

    const rating: PorterRating = {
      rating_stars: stars,
      timeliness_score: stars,
      feedback_tags: selectedTags,
      rated_by_user_id: recipientStaffId || 'user-recipient',
      rated_at: new Date().toISOString()
    }

    onSubmit(job.id, proof, rating)
    onClose()
  }

  if (!isOpen || !job) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-xl bg-surface rounded-3xl shadow-2xl overflow-hidden border border-border-default my-8"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  {language === 'ms' ? 'Pengesahan Penerimaan Kargo / Pesakit' : 'Cargo / Patient Handover Confirmation'}
                </h3>
                <p className="text-xs text-white/80">
                  {language === 'ms' ? 'No Rujukan:' : 'Reference No:'} {job.no_rujukan}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-surface/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Task Summary Card */}
            <div className="p-4 bg-subtle/50 border border-border-default rounded-2xl text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-text-secondary">{job.sub_category || job.category}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-400 font-bold rounded-full">
                  {language === 'ms' ? 'PPK:' : 'Porter:'} {job.assigned_porter_name || 'Porter'}
                </span>
              </div>
              <p className="text-text-muted">
                {language === 'ms' ? 'Dari:' : 'From:'} <span className="font-semibold text-text-secondary">{job.origin_department_name}</span> ➔ {language === 'ms' ? 'Ke:' : 'To:'} <span className="font-semibold text-text-secondary">{job.destination_department_name}</span>
              </p>
            </div>

            {/* Recipient Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-secondary font-bold uppercase tracking-wider">
                {language === 'ms' ? 'Maklumat Pegawai / Kakitangan Penerima' : 'Recipient Staff Information'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    {language === 'ms' ? 'Nama Penerima *' : 'Recipient Name *'}
                  </label>
                  <Input
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder={language === 'ms' ? 'cth: SN Halimah binti Kassim' : 'e.g. SN Halimah / Dr. Robert'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    {language === 'ms' ? 'No. Pekerja / No. Kad Pengenalan *' : 'Staff ID / IC No. *'}
                  </label>
                  <Input
                    required
                    value={recipientStaffId}
                    onChange={(e) => setRecipientStaffId(e.target.value)}
                    placeholder={language === 'ms' ? 'cth: STF-40192 / 8801...' : 'e.g. STF-40192 / IC No.'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  {language === 'ms' ? 'Jawatan & Gred' : 'Designation & Grade'}
                </label>
                <Input
                  value={recipientJawatan}
                  onChange={(e) => setRecipientJawatan(e.target.value)}
                  placeholder={language === 'ms' ? 'cth: Jururawat U29 / JTMP U29 / Pegawai Perubatan UD43' : 'e.g. Staff Nurse U29 / Medical Officer UD43'}
                />
              </div>
            </div>

            {/* Digital Signature Pad */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  {language === 'ms' ? 'Tandatangan Digital Penerima' : 'Recipient Digital Signature'}
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {language === 'ms' ? 'Padam Semula' : 'Clear Signature'}
                </button>
              </div>
              <div className="border-2 border-dashed border-border-default rounded-2xl p-1 bg-subtle/50 relative">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[140px] bg-surface rounded-xl touch-none cursor-crosshair"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                    {language === 'ms' ? 'Sila turunkan tandatangan di sini' : 'Please sign in this box'}
                  </div>
                )}
              </div>
            </div>

            {/* Rating PPK */}
            <div className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-primary">
                  {language === 'ms' ? 'Penilaian Khidmat PPK' : 'Porter Service Rating'}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStars(s)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= stars ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Selector */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-surface text-text-muted border border-border-default hover:bg-subtle'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3.5 bg-accent-base hover:bg-accent-hover text-white font-extrabold shadow-lg rounded-2xl flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{language === 'ms' ? 'Sahkan Penerimaan & Selesaikan Tugasan' : 'Confirm Handover & Complete Task'}</span>
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
