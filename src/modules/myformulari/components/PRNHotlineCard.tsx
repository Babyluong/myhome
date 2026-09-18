// src/modules/myformulari/components/PRNHotlineCard.tsx
import React, { useState } from 'react'
import { PhoneCall, Shield, Send, Clock, Check, Copy, AlertOctagon, HelpCircle } from 'lucide-react'
import { PRN_CONTACT_INFO } from '../data/antidoteDatabase'

export const PRNHotlineCard: React.FC = () => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''))
    setCopiedNumber(num)
    setTimeout(() => setCopiedNumber(null), 2500)
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-500/20 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-rose-600 rounded-2xl shadow-lg flex-shrink-0">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  National Poison Centre (PRN) & MOH Toxicology Reference
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full uppercase tracking-wider animate-pulse">
                  24/7 Toxicology
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Drug & Poison Information Service (DPIS) USM / MOH
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://t.me/khidmatnasihatkeracunanPRN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>PRN Telegram</span>
            </a>
          </div>
        </div>

        {/* Hotlines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Toll Free */}
          <div className="bg-white/5 border border-white/10 hover:border-indigo-400/40 rounded-2xl p-4 transition-all">
            <div className="text-[11px] font-medium text-indigo-300 uppercase tracking-wider">
              Toll-Free Hotline
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <a
                href={`tel:${PRN_CONTACT_INFO.tollFree}`}
                className="text-lg font-black text-white hover:text-indigo-200 tracking-tight font-mono"
              >
                {PRN_CONTACT_INFO.tollFree}
              </a>
              <button
                onClick={() => handleCopy(PRN_CONTACT_INFO.tollFree)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy Number"
              >
                {copiedNumber === PRN_CONTACT_INFO.tollFree ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Nationwide across Malaysia (Landline / Mobile)</p>
          </div>

          {/* Direct Line 1 */}
          <div className="bg-white/5 border border-white/10 hover:border-indigo-400/40 rounded-2xl p-4 transition-all">
            <div className="text-[11px] font-medium text-indigo-300 uppercase tracking-wider">
              Direct Emergency Line 1
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <a
                href={`tel:${PRN_CONTACT_INFO.hotlines[0]}`}
                className="text-lg font-black text-white hover:text-indigo-200 tracking-tight font-mono"
              >
                {PRN_CONTACT_INFO.hotlines[0]}
              </a>
              <button
                onClick={() => handleCopy(PRN_CONTACT_INFO.hotlines[0])}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy Number"
              >
                {copiedNumber === PRN_CONTACT_INFO.hotlines[0] ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Clinical Toxicology Consultation</p>
          </div>

          {/* Direct Line 2 */}
          <div className="bg-white/5 border border-white/10 hover:border-indigo-400/40 rounded-2xl p-4 transition-all">
            <div className="text-[11px] font-medium text-indigo-300 uppercase tracking-wider">
              Direct Emergency Line 2
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <a
                href={`tel:${PRN_CONTACT_INFO.hotlines[1]}`}
                className="text-lg font-black text-white hover:text-indigo-200 tracking-tight font-mono"
              >
                {PRN_CONTACT_INFO.hotlines[1]}
              </a>
              <button
                onClick={() => handleCopy(PRN_CONTACT_INFO.hotlines[1])}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy Number"
              >
                {copiedNumber === PRN_CONTACT_INFO.hotlines[1] ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Analytical Lab & Antidote Stock Verification</p>
          </div>
        </div>

        {/* Information Badges Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-slate-300 bg-white/5 rounded-2xl p-3 border border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Operating Hours:</strong> Monday - Friday: 8:00 AM - 10:00 PM | Weekends / Public Holidays: 8:00 AM - 5:00 PM
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>After Hours:</strong> Contact State Hospital Emergency Physician On-Call / RECS Malaysia
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
