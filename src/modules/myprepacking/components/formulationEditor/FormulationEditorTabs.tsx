import React from 'react'
import {
  Package,
  FlaskConical,
  BookOpen,
  ShieldAlert,
  History
} from 'lucide-react'

export type FormulationTabKey = 'general' | 'ingredients' | 'procedure' | 'labelling' | 'audit'

interface FormulationEditorTabsProps {
  activeTab: FormulationTabKey
  onSelectTab: (tab: FormulationTabKey) => void
  isCompounding: boolean
  auditCount?: number
}

export const FormulationEditorTabs: React.FC<FormulationEditorTabsProps> = ({
  activeTab,
  onSelectTab,
  isCompounding,
  auditCount = 0
}) => {
  const tabs = [
    {
      id: 'general' as FormulationTabKey,
      label: 'General & Packaging',
      icon: Package
    },
    {
      id: 'ingredients' as FormulationTabKey,
      label: isCompounding ? 'Formula & Ingredients' : 'Medication Formula',
      icon: FlaskConical
    },
    {
      id: 'procedure' as FormulationTabKey,
      label: isCompounding ? 'Compounding SOP Steps' : 'Preparation Protocol',
      icon: BookOpen
    },
    {
      id: 'labelling' as FormulationTabKey,
      label: 'Labelling & BUD',
      icon: ShieldAlert
    },
    {
      id: 'audit' as FormulationTabKey,
      label: 'Audit History',
      icon: History,
      badge: auditCount > 0 ? String(auditCount) : undefined
    }
  ]

  return (
    <div className="flex items-center gap-1.5 border-b border-border-default pb-2.5 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 active:scale-[0.98] ${
              isActive
                ? 'bg-teal-700 text-white shadow-xs font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-subtle'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
