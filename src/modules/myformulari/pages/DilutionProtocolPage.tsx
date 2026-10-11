import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Droplets,
  Search,
  Activity,
  Printer,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Syringe,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Thermometer,
  SlidersHorizontal,
  X
} from 'lucide-react'
import { KKM_DILUTION_MASTER_DATABASE, KkmDilutionMonograph } from '../data/kkmDilutionMasterDatabase'
import { DilutionCard } from '../components/DilutionCard'

export const DilutionProtocolPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [diluentFilter, setDiluentFilter] = useState<string>('ALL')
  const [reconFilter, setReconFilter] = useState<'ALL' | 'RECON_REQUIRED' | 'LIQUID_ONLY'>('ALL')
  const [fluidRestrictedOnly, setFluidRestrictedOnly] = useState(false)

  const allMonographs = useMemo(() => KKM_DILUTION_MASTER_DATABASE, [])

  // Statistical metrics
  const stats = useMemo(() => {
    const total = allMonographs.length
    const liquidCount = allMonographs.filter(m => !m.isReconstitutionRequired).length
    const powderCount = allMonographs.filter(m => m.isReconstitutionRequired).length
    const fluidRestrictedCount = allMonographs.filter(m => {
      const s = m.suggestedMinimumDilutions.toLowerCase()
      return s.includes('central') || s.includes('peripheral') || s.includes('maximum concentration') || s.includes('not less than')
    }).length

    return { total, liquidCount, powderCount, fluidRestrictedCount }
  }, [allMonographs])

  const filteredMonographs = useMemo(() => {
    return allMonographs.filter(mono => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim()
        const matchTitle = mono.rawTitle.toLowerCase().includes(q)
        const matchGeneric = mono.genericName.toLowerCase().includes(q)
        const matchBrand = mono.brandText.toLowerCase().includes(q) || mono.brandNames.some(b => b.toLowerCase().includes(q))
        const matchDiluent = mono.diluentText.toLowerCase().includes(q)
        const matchAdmin = mono.administrationText.toLowerCase().includes(q)
        const matchComments = mono.comments.some(c => c.toLowerCase().includes(q))
        if (!matchTitle && !matchGeneric && !matchBrand && !matchDiluent && !matchAdmin && !matchComments) {
          return false
        }
      }

      if (diluentFilter !== 'ALL') {
        const d = mono.diluentText.toLowerCase()
        if (diluentFilter === 'NS' && !d.includes('ns') && !d.includes('saline') && !d.includes('sodium chloride')) return false
        if (diluentFilter === 'D5' && !d.includes('d5') && !d.includes('dextrose') && !d.includes('glucose')) return false
        if (diluentFilter === 'WFI' && !d.includes('wfi') && !d.includes('water')) return false
      }

      if (reconFilter === 'RECON_REQUIRED' && !mono.isReconstitutionRequired) return false
      if (reconFilter === 'LIQUID_ONLY' && mono.isReconstitutionRequired) return false

      if (fluidRestrictedOnly) {
        const s = mono.suggestedMinimumDilutions.toLowerCase()
        if (!s.includes('central') && !s.includes('peripheral') && !s.includes('maximum concentration') && !s.includes('not less than')) {
          return false
        }
      }

      return true
    })
  }, [allMonographs, searchTerm, diluentFilter, reconFilter, fluidRestrictedOnly])

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Executive Header Card */}
        <div className="bg-surface border border-border-default rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center shrink-0">
                <Droplets className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span>MOH Clinical Practice Standard</span>
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Edisi Rasmi 2024 / 2025</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
                  IV Reconstitution &amp; Dilution Protocols
                </h1>
                <p className="text-xs sm:text-sm text-text-muted font-medium">
                  Parenteral Dilution Guidelines &amp; Fluid Restrictions ICU/Ward Lawas Hospital
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-surface hover:bg-subtle/50 border border-border-default text-text-secondary text-xs font-bold rounded-xl shadow-elevation-1 flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print Clinical Guidelines</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Counter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border-subtle text-text-primary">
            <div className="p-3.5 rounded-xl bg-surface border border-border-default">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Jumlah Monograf KKM</p>
              <p className="text-xl font-black text-text-primary mt-0.5">{stats.total}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border-default">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-teal-400">Sekatan Cecair (ICU)</p>
              <p className="text-xl font-bold text-text-primary tabular-nums mt-0.5">{stats.fluidRestrictedCount}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border-default">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">Sediaan Cecair (Ready)</p>
              <p className="text-xl font-bold text-text-primary tabular-nums mt-0.5">{stats.liquidCount}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border-default">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-amber-400">Serbuk Rekonstitusi</p>
              <p className="text-xl font-bold text-text-primary tabular-nums mt-0.5">{stats.powderCount}</p>
            </div>
          </div>
        </div>

        {/* Official Reference Document Links Banner */}
        <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-teal-400 bg-teal-500/10 border border-teal-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Dokumen Rujukan Rasmi KKM (Official MOH Guidelines)</span>
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
              All protocols are extracted directly from MOH Pharmaceutical Services Programme with zero synthetic data to safeguard patient safety.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://pharmacy.moh.gov.my/sites/default/files/document-upload/update-dec-2025-april-2024-dilution-guide-fluid-restricted-critically-ill-adults.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-surface hover:bg-subtle text-text-primary border border-border-default transition-[transform,opacity,box-shadow,border-color] duration-150 active:scale-[0.98] flex items-center gap-1.5 shadow-elevation-1"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              <span>Fluid-Restricted Guide (PDF)</span>
            </a>

            <a
              href="https://pharmacy.moh.gov.my/sites/default/files/document-upload/dilution-guideline-injectable-drugs-part-i-antimicrobial-april-2021-pdf.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-surface hover:bg-subtle text-text-primary border border-border-default transition-[transform,opacity,box-shadow,border-color] duration-150 active:scale-[0.98] flex items-center gap-1.5 shadow-elevation-1"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Antimicrobial Guide (PDF)</span>
            </a>
          </div>
        </div>

        {/* Modern Search & Filter Controls */}
        <div className="bg-surface rounded-2xl border border-border-default shadow-xs p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama generik, jenama KKM (cth: Ainiron, Injecsol, Meropenem, Vancomycin, Dobutamine)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-subtle/50 border border-border-default rounded-2xl text-xs text-text-primary placeholder-slate-400 focus:outline-hidden focus:border-teal-500 focus:bg-surface transition-colors font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text-muted p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={diluentFilter}
              onChange={e => setDiluentFilter(e.target.value)}
              className="px-4 py-3 bg-subtle/50 border border-border-default rounded-2xl text-xs font-bold text-text-secondary focus:outline-hidden focus:border-teal-500"
            >
              <option value="ALL">All Diluents</option>
              <option value="NS">Normal Saline (0.9% NaCl)</option>
              <option value="D5">Dextrose 5% (D5W)</option>
              <option value="WFI">Water for Injection (WFI)</option>
            </select>

            <select
              value={reconFilter}
              onChange={e => setReconFilter(e.target.value as any)}
              className="px-4 py-3 bg-subtle/50 border border-border-default rounded-2xl text-xs font-bold text-text-secondary focus:outline-hidden focus:border-teal-500"
            >
              <option value="ALL">All Preparations (Liquid &amp; Powder)</option>
              <option value="LIQUID_ONLY">Sediaan Cecair Sahaja (Ready-to-Use)</option>
              <option value="RECON_REQUIRED">Serbuk Sahaja (Rekonstitusi)</option>
            </select>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle text-xs">
            <button
              onClick={() => setFluidRestrictedOnly(!fluidRestrictedOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                fluidRestrictedOnly
                  ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                  : 'bg-subtle/50 text-text-secondary border-border-default hover:bg-subtle'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Sekatan Cecair (Fluid-Restricted Protocols)</span>
            </button>

            <span className="ml-auto text-xs text-text-muted font-semibold">
              Menunjukkan <strong>{filteredMonographs.length}</strong> daripada <strong>{allMonographs.length}</strong> monograf rasmi KKM
            </span>
          </div>
        </div>

        {/* Monograph Cards Feed */}
        <div className="space-y-6">
          {filteredMonographs.map(mono => (
            <DilutionCard
              key={mono.id}
              drugName={mono.genericName}
              monograph={mono}
            />
          ))}

          {filteredMonographs.length === 0 && (
            <div className="p-12 text-center bg-surface rounded-3xl border border-dashed border-border-default text-text-muted text-xs space-y-2">
              <Droplets className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="font-bold text-text-secondary text-sm">No MOH dilution protocols found</p>
              <p className="text-text-muted">Try modifying search keywords or resetting filter options.</p>
            </div>
          )}
        </div>
    </div>
  )
}

export default DilutionProtocolPage
