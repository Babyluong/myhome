import React from 'react'
import { Eye, Building2, FlaskConical } from 'lucide-react'
import { MSDSEntry } from '../data/msdsData'
import { GhsPictogram } from './GhsPictogram'

interface MsdsChemicalCardProps {
  item: MSDSEntry
  onViewClick: (item: MSDSEntry) => void
}

export const MsdsChemicalCard: React.FC<MsdsChemicalCardProps> = ({ item, onViewClick }) => {
  const getHazardBadgeColor = (hazard: string) => {
    if (hazard.includes('Hakisan')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
    if (hazard.includes('Mudah Terbakar')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
    if (hazard.includes('Toksik')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25'
    if (hazard.includes('Pengoksida')) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/25'
    if (hazard.includes('Gas Tertekanan')) return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25'
    return 'bg-subtle text-text-secondary border-border-default'
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Aktif') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
    if (status === 'Perlu Semakan') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
  }

  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-xl bg-surface border border-border-default hover:border-border-strong hover:bg-subtle/30 transition-colors shadow-elevation-1">
      <div className="space-y-3">
        {/* Top Header: ID & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-subtle text-accent-base border border-border-default">
            {item.id}
          </span>
          <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border ${getStatusBadge(item.status)}`}>
            {item.status}
          </span>
        </div>

        {/* Chemical Title & Formula */}
        <div>
          <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-base transition-colors line-clamp-1">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 text-xs font-mono text-text-muted mt-1">
            <span>{item.malayName}</span>
            <span className="text-border-strong">•</span>
            <span className="text-text-secondary font-semibold">{item.chemicalFormula}</span>
          </div>
        </div>

        {/* Details snippet */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-border-default text-text-muted">
          <div>
            CAS: <span className="text-text-primary font-bold">{item.casNumber}</span>
          </div>
          <div>
            Kod SW: <span className="text-accent-base font-bold">{item.scheduledWasteCode}</span>
          </div>
        </div>

        {/* Hazard Class & GHS Icons */}
        <div className="space-y-2 pt-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${getHazardBadgeColor(item.hazardClass)}`}>
            <FlaskConical className="w-3 h-3" />
            {item.hazardClass}
          </span>

          <div className="flex items-center gap-1 pt-0.5">
            {item.ghsCodes.map((code) => (
              <GhsPictogram key={code} code={code} size="sm" />
            ))}
          </div>
        </div>

        {/* Department */}
        <div className="text-xs text-text-muted flex items-center gap-1.5 pt-1">
          <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span className="truncate">{item.departments[0]}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-border-default flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-muted font-mono truncate">{item.location}</span>
        <button
          onClick={() => onViewClick(item)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-subtle hover:bg-hover text-text-primary font-semibold text-xs transition-colors border border-border-default shadow-elevation-1"
        >
          <Eye className="w-3.5 h-3.5 text-text-muted" />
          Lihat MSDS
        </button>
      </div>
    </div>
  )
}

export default MsdsChemicalCard
