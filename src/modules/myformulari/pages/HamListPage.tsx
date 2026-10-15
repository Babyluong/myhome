import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, ShieldAlert, Search, AlertOctagon, Users, Lock, Activity, Printer, ChevronRight } from 'lucide-react'
import { getAllFormulariDrugs, FormulariAssetError } from '../services/formulariService'
import type { DrugEntry } from '../types/formulariTypes'
import { HAMCategory, HAMRiskLevel } from '../types/formulariTypes'
import { PrescriberBadge, HAMBadge, PoisonBadge } from '../components/DrugBadge'
import '../components/TallManLettering'
import '@/lib/constants'

export const HamListPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<HAMCategory | 'ALL'>('ALL')
  const [selectedRisk, setSelectedRisk] = useState<HAMRiskLevel | 'ALL'>('ALL')

  const [allDrugs, setAllDrugs] = useState<DrugEntry[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [canRetryCatalog, setCanRetryCatalog] = useState(true)

  const loadCatalog = useCallback(async () => {
    setIsCatalogLoading(true)
    setCatalogError(null)
    try {
      setAllDrugs(await getAllFormulariDrugs())
    } catch (error) {
      setCatalogError(error instanceof FormulariAssetError ? error.message : 'Formulary data is unavailable. Please try again.')
      setCanRetryCatalog(!(error instanceof FormulariAssetError) || error.retryable)
    } finally {
      setIsCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  const hamDrugs = useMemo(() => allDrugs.filter(d => d.isHAM), [allDrugs])

  const categories: HAMCategory[] = [
    'Concentrated Electrolyte',
    'Insulin & Hypoglycaemics',
    'Anticoagulant & Antithrombotic',
    'IV Adrenergic Agonist / Inotrope',
    'Antiarrhythmic IV',
    'Neuromuscular Blocking Agent (NMBA)',
    'Chemotherapy / Cytotoxic',
    'Opioid & Sedative IV'
  ]

  const filteredDrugs = useMemo(() => {
    return hamDrugs.filter(drug => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const matchName = drug.genericName.toLowerCase().includes(q)
        const matchBrand = drug.brandNames.some(b => b.toLowerCase().includes(q))
        const matchClass = drug.therapeuticClass.toLowerCase().includes(q)
        if (!matchName && !matchBrand && !matchClass) return false
      }

      if (selectedCategory !== 'ALL' && drug.hamCategory !== selectedCategory) return false
      if (selectedRisk !== 'ALL' && drug.hamRiskLevel !== selectedRisk) return false

      return true
    })
  }, [hamDrugs, searchTerm, selectedCategory, selectedRisk])

  if (isCatalogLoading) {
    return <main className="p-6 text-text-secondary" role="status" aria-live="polite">Loading formulary data…</main>
  }

  if (catalogError) {
    return (
      <main className="m-6 rounded-xl border border-border-default bg-surface p-6 text-text-primary" role="alert">
        <h1 className="text-lg font-semibold">Formulary data could not be loaded</h1>
        <p className="mt-2 text-sm text-text-secondary">{catalogError}</p>
        <button type="button" onClick={() => canRetryCatalog ? void loadCatalog() : window.location.reload()} className="mt-4 rounded-lg bg-accent-base px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2">
          {canRetryCatalog ? 'Try again' : 'Reload app'}
        </button>
      </main>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-surface border border-border-subtle rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary flex items-center gap-2">
              <span>High Alert Medications (HAM) Registry</span>
            </h1>
            <p className="text-sm text-text-muted mt-0.5 font-medium">
              Compliance with MOH Safe Use of High Alert Medications Guidelines (2nd Edition) Lawas Hospital
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-surface hover:bg-subtle/50 border border-border-default text-text-secondary text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start md:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Ward HAM List</span>
        </button>
      </div>

      {/* Mandatory KKM Policy Banner */}
      <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>MOH Medication Safety Policy (Patient Safety Standard)</span>
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
          4 Mandatory Principles for Handling High Alert Medications (HAM) Across All Wards &amp; Units:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <Users className="w-4 h-4 text-rose-400 mb-1" />
            <h3 className="text-xs font-semibold text-text-primary">Independent Double-Check (IDC)</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Two independent staff must calculate doses, infusion pump rates, and verify patient identity prior to administration.
            </p>
          </div>

          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <ShieldAlert className="w-4 h-4 text-rose-400 mb-1" />
            <h3 className="text-xs font-semibold text-text-primary">Red Warning Auxiliary Labels</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              All HAM vials, syringes, and infusion bags must be affixed with red "HIGH ALERT" auxiliary labels.
            </p>
          </div>

          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <Lock className="w-4 h-4 text-rose-400 mb-1" />
            <h3 className="text-xs font-semibold text-text-primary">Dedicated Segregated Storage</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Unlock the locked box stock. Concentrated Potassium Chloride is strictly prohibited from general ward floor stock.
            </p>
          </div>

          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <Activity className="w-4 h-4 text-rose-400 mb-1" />
            <h3 className="text-xs font-semibold text-text-primary">Electronic Infusion Smart Pumps</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Must utilize volumetric / syringe infusion smart pumps with strict rate guardrails.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-surface rounded-2xl border border-border-default shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search HAM medications by generic name, brand, or therapeutic class..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-subtle/50 border border-border-default rounded-2xl text-xs text-text-primary placeholder-slate-400 focus:outline-hidden focus:border-rose-500 focus:bg-surface"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => {
              const value = e.currentTarget.value
              setSelectedCategory(value === 'ALL' ? 'ALL' : categories.find(category => category === value) ?? 'ALL')
            }}
            className="px-4 py-3 bg-subtle/50 border border-border-default rounded-2xl text-xs font-semibold text-text-secondary"
          >
            <option value="ALL">All HAM Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={e => {
              const value = e.currentTarget.value
              setSelectedRisk((['ALL', 'CRITICAL', 'HIGH', 'MODERATE'] as const).find(risk => risk === value) ?? 'ALL')
            }}
            className="px-4 py-3 bg-subtle/50 border border-border-default rounded-2xl text-xs font-semibold text-text-secondary"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">CRITICAL Risk Only</option>
            <option value="HIGH">HIGH Risk Only</option>
            <option value="MODERATE">MODERATE Risk Only</option>
          </select>
        </div>
      </div>

      {/* HAM Drug Cards Listing */}
      <div className="space-y-4">
        {filteredDrugs.map(drug => {
          const isCritical = drug.hamRiskLevel === 'CRITICAL'

          return (
            <div
              key={drug.id}
              onClick={() => navigate(`/formulari/drug/${drug.id}`)}
              className={`bg-surface rounded-2xl border transition-[transform,opacity,box-shadow,border-color] duration-150 p-5 hover:border-white/20 hover:shadow-md cursor-pointer space-y-3.5 active:scale-[0.99] ${
                isCritical ? 'border-rose-300 hover:border-rose-500' : 'border-amber-500/20 hover:border-amber-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <HAMBadge riskLevel={drug.hamRiskLevel} category={drug.hamCategory} />
                    <PrescriberBadge category={drug.prescriberCategory} size="sm" />
                    <PoisonBadge poison={drug.poisonCategory} size="sm" />
                    <span className="text-xs bg-subtle text-text-secondary px-2.5 py-0.5 rounded font-mono">
                      {drug.atcCode}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary leading-tight">
                    {drug.genericName}
                  </h3>

                  <p className="text-xs text-text-muted">
                    Strength & Form: <strong className="text-text-secondary">{drug.strengths.join(', ')} ({drug.dosageForms.join(', ')})</strong>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                    HAM Category: {drug.hamCategory}
                  </span>
                </div>
              </div>

              {/* Specific Precautions */}
              {drug.hamPrecautions && drug.hamPrecautions.length > 0 && (
                <div className="bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/15 text-xs space-y-1.5">
                  <strong className="text-rose-400 font-semibold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Mandatory MOH Safety Precautions:</span>
                  </strong>
                  <ul className="space-y-1 text-text-secondary pl-0.5">
                    {drug.hamPrecautions.map((pre, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed">{pre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-subtle">
                <span>Route: <strong className="text-text-secondary">{drug.administrationRoutes.join(', ')}</strong></span>
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <span>View Full Guidance & Protocol</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          )
        })}

        {filteredDrugs.length === 0 && (
          <div className="p-12 text-center bg-surface rounded-3xl border border-dashed border-border-default text-text-muted text-xs">
            No HAM medications found matching the selected criteria.
          </div>
        )}
      </div>
    </div>
  )
}

export default HamListPage
