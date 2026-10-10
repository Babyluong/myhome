import React from 'react'
import { Eye, Building2, Layers } from 'lucide-react'
import { MSDSEntry } from '../data/msdsData'
import { GhsPictogram } from './GhsPictogram'

interface MsdsTableRowProps {
  item: MSDSEntry
  onViewClick: (item: MSDSEntry) => void
}

export const MsdsTableRow: React.FC<MsdsTableRowProps> = ({ item, onViewClick }) => {
  const getHazardBadge = (hazard: string) => {
    if (hazard.includes('Hakisan')) {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
    }
    if (hazard.includes('Mudah Terbakar')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
    }
    if (hazard.includes('Toksik')) {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25'
    }
    if (hazard.includes('Pengoksida')) {
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/25'
    }
    if (hazard.includes('Gas Tertekanan')) {
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25'
    }
    return 'bg-accent-subtle text-accent-base border-accent-base/25'
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Aktif') {
      return {
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
      }
    }
    if (status === 'Perlu Semakan') {
      return {
        dot: 'bg-amber-500 animate-pulse',
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
      }
    }
    return {
      dot: 'bg-rose-500 animate-ping',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
    }
  }

  const statusStyle = getStatusBadge(item.status)

  return (
    <tr className="group hover:bg-subtle/50 transition-colors border-b border-border-default text-xs">
      {/* ID & CAS */}
      <td className="py-3 px-4 align-middle whitespace-nowrap">
        <div className="font-mono text-[11px] font-bold text-accent-base group-hover:text-accent-hover">
          {item.id}
        </div>
        <div className="font-mono text-[11px] text-text-muted mt-0.5">
          CAS: <span className="text-text-secondary">{item.casNumber}</span>
        </div>
      </td>

      {/* Name & Malay Name */}
      <td className="py-3 px-4 align-middle min-w-[220px]">
        <div className="font-semibold text-text-primary group-hover:text-accent-base text-sm leading-snug transition-colors">
          {item.name}
        </div>
        <div className="text-text-muted text-xs font-mono mt-0.5 flex items-center gap-2">
          <span>{item.malayName}</span>
          <span className="inline-block w-1 h-1 rounded-full bg-border-strong"></span>
          <span className="text-text-secondary font-semibold">{item.chemicalFormula}</span>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-4 align-middle whitespace-nowrap">
        <div className="text-text-secondary text-xs font-medium">{item.category}</div>
        <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
          <Building2 className="w-3 h-3 text-text-muted" />
          <span className="truncate max-w-[140px]">{item.departments[0]}</span>
        </div>
      </td>

      {/* Hazard Class & GHS */}
      <td className="py-3 px-4 align-middle">
        <div className="flex flex-col gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border w-fit ${getHazardBadge(
              item.hazardClass
            )}`}
          >
            {item.hazardClass}
          </span>
          <div className="flex items-center gap-1">
            {item.ghsCodes.map((code) => (
              <GhsPictogram key={code} code={code} size="sm" />
            ))}
          </div>
        </div>
      </td>

      {/* Scheduled Waste & Location */}
      <td className="py-3 px-4 align-middle whitespace-nowrap font-mono text-[11px]">
        <div className="flex items-center gap-1.5 text-text-primary font-bold">
          <Layers className="w-3.5 h-3.5 text-accent-base" />
          <span>{item.scheduledWasteCode}</span>
        </div>
        <div className="text-text-muted text-[11px] mt-0.5 truncate max-w-[150px] font-sans">
          {item.location}
        </div>
      </td>

      {/* Status Badge */}
      <td className="py-3 px-4 align-middle whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyle.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {item.status}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
        <button
          onClick={() => onViewClick(item)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-subtle hover:bg-hover text-text-primary font-semibold text-xs transition-all border border-border-default shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5 text-text-muted" />
          Semak MSDS
        </button>
      </td>
    </tr>
  )
}

export default MsdsTableRow
