import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplets, ChevronRight, Layers } from 'lucide-react'
import { DrugEntry } from '../types/formulariTypes'
import { PrescriberBadge, HAMBadge, LASABadge, PoisonBadge, NAGBadge } from './DrugBadge'
import './TallManLettering'
import { QuotaProgressBar } from './QuotaProgressBar'

interface DrugCardProps {
  drug: DrugEntry
  onSelect?: (drug: DrugEntry) => void
}

export const DrugCard: React.FC<DrugCardProps> = ({ drug, onSelect }) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(drug)
    } else {
      navigate(`/formulari/drug/${drug.id}`)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-surface rounded-xl border transition-colors duration-150 hover:border-border-strong hover:bg-subtle/30 shadow-elevation-1 cursor-pointer flex flex-col justify-between overflow-hidden relative ${
        drug.isHAM 
          ? 'border-rose-500/30' 
          : drug.isLASA
          ? 'border-amber-500/30'
          : 'border-border-default'
      }`}
    >
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <PrescriberBadge category={drug.prescriberCategory} size="sm" />
            {drug.isHAM && <HAMBadge riskLevel={drug.hamRiskLevel} size="sm" />}
            {drug.isLASA && <LASABadge size="sm" pairCount={drug.lasaPairs?.length} />}
            {drug.antimicrobial?.isAntimicrobial && <NAGBadge tier={drug.antimicrobial.nagRestrictionTier} size="sm" />}
            <PoisonBadge poison={drug.poisonCategory} size="sm" />
          </div>

          {/* Drug Title */}
          <div className="mb-1">
            <h3 className="text-sm sm:text-base font-semibold text-text-primary group-hover:text-accent-base transition-colors leading-snug">
              {drug.genericName}
            </h3>
            
            {drug.brandNames && drug.brandNames.length > 0 && (
              <p className="text-xs text-text-muted font-normal truncate mt-0.5">
                {drug.brandNames.join(' • ')}
              </p>
            )}
          </div>

          {/* Therapeutic Class & Strengths */}
          <div className="mt-2 text-xs space-y-1">
            <div className="flex items-center gap-1 text-text-secondary">
              <span className="font-medium text-text-muted">Kelas:</span>
              <span className="text-text-primary font-medium truncate">{drug.therapeuticClass}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 text-[11px] text-text-muted pt-1">
              <span className="bg-subtle border border-border-default px-1.5 py-0.5 rounded text-text-secondary font-mono">
                ATC: {drug.atcCode}
              </span>
              {drug.strengths.slice(0, 2).map((st, idx) => (
                <span key={idx} className="bg-accent-subtle text-accent-base border border-accent-base/20 px-1.5 py-0.5 rounded font-medium">
                  {st}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Protocols Quick Indicators */}
        <div className="pt-3 border-t border-border-default space-y-2">
          {/* Quota Bar (Compact) */}
          <QuotaProgressBar
            monthlyQuota={drug.quota.monthlyQuota}
            quotaUsed={drug.quota.quotaUsed}
            quotaRemaining={drug.quota.quotaRemaining}
            unit={drug.quota.unit}
            lowStockThreshold={drug.quota.lowStockThreshold}
            isLowStock={drug.quota.isLowStock}
            compact={true}
          />

          <div className="flex items-center justify-between text-xs text-text-muted pt-1">
            <div className="flex items-center gap-2">
              {drug.dilution?.isApplicable && (
                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium text-[11px]" title="Ada protokol pelarutan IV">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>IV Dilusi</span>
                </span>
              )}
              {drug.reconstitution?.isApplicable && (
                <span className="flex items-center gap-1 text-accent-base font-medium text-[11px]" title="Ada protokol rekonstitusi vial">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Rekonstitusi</span>
                </span>
              )}
            </div>

            <span className="text-accent-base group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold text-xs">
              <span>Perincian</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
