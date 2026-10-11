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
    <div className="bg-surface rounded-2xl p-5 sm:p-6 shadow-elevation-1 border border-border-default relative overflow-hidden">
      <div className="relative z-10 space-y-5">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                  National Poison Centre (PRN) & MOH Toxicology Reference
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full uppercase tracking-wider">
                  24/7 Toxicology
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Drug & Poison Information Service (DPIS) USM / MOH
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://t.me/khidmatnasihatkeracunanPRN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-base/10 hover:bg-accent-base/20 text-accent-base border border-accent-base/30 text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>PRN Telegram</span>
            </a>
          </div>
        </div>

        {/* Hotlines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Toll Free */}
          <div className="bg-subtle/50 hover:bg-subtle border border-border-default hover:border-border-strong rounded-xl p-4 transition-colors">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Toll-Free Hotline
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <a
                href={`tel:${PRN_CONTACT_INFO.tollFree}`}
                className="text-lg font-bold text-text-primary hover:text-accent-base tracking-tight font-mono"
              >
                {PRN_CONTACT_INFO.tollFree}
              </a>
              <button
                onClick={() => handleCopy(PRN_CONTACT_INFO.tollFree)}
                className="p-1.5 bg-surface hover:bg-hover border border-border-default rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Copy Number"
              >
                {copiedNumber === PRN_CONTACT_INFO.tollFree ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Nationwide across Malaysia (Landline / Mobile)</p>
          </div>

          {/* Direct Line 1 */}
          <div className="bg-subtle/50 hover:bg-subtle border border-border-default hover:border-border-strong rounded-xl p-4 transition-colors">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Direct Emergency Line 1
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <a
                href={`tel:${PRN_CONTACT_INFO.hotlines[0]}`}
                className="text-lg font-bold text-text-primary hover:text-accent-base tracking-tight font-mono"
              >
                {PRN_CONTACT_INFO.hotlines[0]}
              </a>
              <button
                onClick={() => handleCopy(PRN_CONTACT_INFO.hotlines[0])}
                className="p-1.5 bg-surface hover:bg-hover border border-border-default rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Copy Number"
              >
                {copiedNumber === PRN_CONTACT_INFO.hotlines[0] ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Clinical Toxicology Consultation</p>
          </div>

          {/* Direct Line 2 */}
          <div className="bg-subtle/50 hover:bg-subtle border border-border-default hover:border-border-strong rounded-xl p-4 transition-colors">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Direct Emergency Line 2
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <a
                href={`tel:${PRN_CONTACT_INFO.hotlines[1]}`}
                className="text-lg font-bold text-text-primary hover:text-accent-base tracking-tight font-mono"
              >
                {PRN_CONTACT_INFO.hotlines[1]}
              </a>
              <button
                onClick={() => handleCopy(PRN_CONTACT_INFO.hotlines[1])}
                className="p-1.5 bg-surface hover:bg-hover border border-border-default rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Copy Number"
              >
                {copiedNumber === PRN_CONTACT_INFO.hotlines[1] ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-1">Analytical Lab & Antidote Stock Verification</p>
          </div>
        </div>

        {/* Information Badges Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-text-secondary bg-subtle/50 rounded-xl p-3 border border-border-default">
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
