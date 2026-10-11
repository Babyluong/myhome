import React, { useState } from 'react'
import {
  Search,
  Users,
  ShieldAlert,
  Calculator,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock
} from 'lucide-react'

interface NAGUserGuideBannerProps {
  onQuickFilter?: (keyword: string) => void
}

export const NAGUserGuideBanner: React.FC<NAGUserGuideBannerProps> = ({ onQuickFilter }) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('nag_user_guide_collapsed')
    return saved !== 'true' // Open by default for first-time users
  })

  const toggleOpen = () => {
    const nextState = !isOpen
    setIsOpen(nextState)
    localStorage.setItem('nag_user_guide_collapsed', nextState ? 'false' : 'true')
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl border border-emerald-500/20 shadow-xl overflow-hidden transition-colors duration-150">
      {/* Header Bar */}
      <div
        onClick={toggleOpen}
        className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-surface/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>NAG Quick Reference Guide (4th Edition, MOH 2024)</span>
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Official MOH Standard
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 hidden sm:inline-block">
                Point-of-Care Assistant
              </span>
            </div>
            <p className="text-xs text-emerald-100/70 mt-0.5">
              Learn how to search infection indications, verify allergies, calculate mg/kg doses, and review antimicrobial stewardship (AMS) protocols.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-emerald-300 font-bold hidden md:inline">
            {isOpen ? 'Hide Guide' : 'Open User Guide'}
          </span>
          <div className="p-2 rounded-xl bg-white/10 hover:bg-surface/20 text-emerald-200">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expandable Guide Content */}
      {isOpen && (
        <div className="p-5 sm:p-6 pt-0 border-t border-white/10 space-y-5 animate-fade-in">
          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
            {/* Step 1 */}
            <div className="p-4 bg-white/5 hover:bg-surface/10 transition-colors rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Step 1
                </span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-black text-white">Select Patient Population</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Choose between <strong className="text-white">Adult (Section A : A1-A17)</strong> or <strong className="text-white">Paediatric &amp; Neonatal (Section B : B1-B14)</strong> according to your patient age group.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-white/5 hover:bg-surface/10 transition-colors rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Step 2
                </span>
                <Search className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-xs font-black text-white">Smart Quick Search</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Type any diagnosis (e.g., <span className="text-cyan-200 underline cursor-pointer" onClick={() => onQuickFilter && onQuickFilter('CAP')}>CAP</span>, <span className="text-cyan-200 underline cursor-pointer" onClick={() => onQuickFilter && onQuickFilter('Sepsis')}>Sepsis</span>, <span className="text-cyan-200 underline cursor-pointer" onClick={() => onQuickFilter && onQuickFilter('UTI')}>UTI</span>), pathogen (e.g., <span className="text-cyan-200 italic">MRSA</span>), or antibiotic name for instant results.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-white/5 hover:bg-surface/10 transition-colors rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Step 3
                </span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-xs font-black text-white">Review Regimens &amp; Allergies</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Each clinical guideline displays <strong className="text-emerald-300">First-Line (1st-Line)</strong>, <strong className="text-blue-300">Second-Line</strong>, <strong className="text-amber-300">Penicillin Allergy</strong> safety warnings, and oral step-down criteria.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-white/5 hover:bg-surface/10 transition-colors rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Step 4
                </span>
                <Calculator className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xs font-black text-white">Calculate Dose &amp; Copy Prescription</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Use the <strong className="text-white">Calculate Dose (mg/kg)</strong> button for paediatric dosing or click <strong className="text-white">Copy Prescription</strong> to paste directly into hospital HIS.
              </p>
            </div>
          </div>

          {/* AMS Stewardship Banner Footer */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-200">
              <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong className="text-white font-bold">Lawas Hospital AMS Reminder: </strong>
                All empirical antibiotic prescriptions must be reassessed at <strong>48–72 hours</strong> based on microbiology C&amp;S culture results.
              </span>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              className="text-[11px] font-bold text-emerald-300 hover:text-white underline cursor-pointer self-end md:self-auto"
            >
              Understood, close guide &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NAGUserGuideBanner
