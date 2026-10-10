// src/modules/hub/pages/modules/FormulariSubMenu.tsx
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Flame,
  AlertTriangle,
  Droplets,
  ShieldCheck,
  TrendingDown,
  Layers,
  Activity,
  Pill,
  ShieldAlert,
  Building2,
  Baby
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { getFormulariSummaryStats } from '@/modules/myformulari/services/formulariService'
import { Badge } from '@/components/ui'

export const FormulariSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const stats = useMemo(() => getFormulariSummaryStats(), [])

  const menuItems = [
    {
      title: 'Hospital Lawas Formulary',
      description: 'Official Lawas Hospital Drug Formulary. Strictly reflects facility inventory from MyInventory, separated into Eyedrops, Eardrops, Insulin, MDI Inhalers, Anticoagulants and clinical groups.',
      icon: Building2,
      path: ROUTES.FORMULARI_HOSPITAL_LAWAS,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Lawas Formulary',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      title: 'Formulary Search & Catalog',
      description: 'Comprehensive drug search by generic name, brand, ATC classification, clinical indications, and MOH prescriber categories.',
      icon: Search,
      path: ROUTES.FORMULARI_DASHBOARD,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      badge: `${stats.totalDrugs} Drugs`,
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    },
    {
      title: 'High Alert Medications (HAM)',
      description: 'KKM High Alert Medication registry: concentrated electrolytes, insulin, inotropes, anticoagulants, opioids, NMBAs, and mandatory IDC double-check SOP.',
      icon: Flame,
      path: ROUTES.FORMULARI_HAM,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: `${stats.hamCount} HAM`,
      badgeColor: 'bg-rose-500 text-white border-transparent'
    },
    {
      title: 'LASA Registry & TALL-Man Lettering',
      description: 'Look-Alike Sound-Alike drug pairs with TALL-man lettering highlighting and storage separation guidance.',
      icon: AlertTriangle,
      path: ROUTES.FORMULARI_LASA,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: `${stats.lasaCount} Pairs`,
      badgeColor: 'bg-amber-500 text-slate-900 border-transparent'
    },
    {
      title: 'IV Dilution & Reconstitution Protocols',
      description: 'Aseptic reconstitution guide, compatible diluents, fluid restriction concentrations, Y-site compatibility, and infusion rate limits.',
      icon: Droplets,
      path: ROUTES.FORMULARI_DILUTION,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: `${stats.ivDilutionCount} Protocols`,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    {
      title: 'National Antimicrobial Guidelines (NAG 2024)',
      description: 'First and second line empiric regimens by body system, surgical prophylaxis (SAP), IV-to-oral switch criteria, and 72h AMS reviews.',
      icon: ShieldCheck,
      path: ROUTES.FORMULARI_ANTIMICROBIAL,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'NAG 4th Ed.',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      title: 'Drug Quota & Low-Stock Alerts',
      description: 'Facility monthly quota tracking, low-stock / critical shortage threshold alerts, estimated run-out forecasting, and available drug alternatives.',
      icon: TrendingDown,
      path: ROUTES.FORMULARI_QUOTA,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} Alerts` : 'Stock OK',
      badgeColor: stats.lowStockCount > 0 ? 'bg-rose-500 text-white border-transparent' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      title: 'Drug Alternatives & Substitution Matrix',
      description: 'MOH approved therapeutic substitutes and class equivalent alternatives during stock shortages or supply disruptions.',
      icon: Layers,
      path: ROUTES.FORMULARI_ALTERNATIVES,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: 'Therapeutic Alt.',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      title: 'KKM Antidote & Poison Protocols',
      description: 'Official MOH antidote registry (List A, B, C), drug intoxication reversal protocols, emergency toxicology management, and National Poison Centre hotline.',
      icon: ShieldAlert,
      path: ROUTES.FORMULARI_ANTIDOTES,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: '25+ MOH Antidotes',
      badgeColor: 'bg-rose-500 text-white border-transparent'
    },
    {
      title: 'Paediatric Drug Catalogue',
      description: 'Official paediatric formulary and floor stock registry for Hospital Lawas. Directly synchronized with MyInventory facility stock with integrated weight-based dose calculator.',
      icon: Baby,
      path: ROUTES.FORMULARI_PAEDIATRIC_CATALOGUE,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      badge: 'Paediatric Ward',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    }
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      {/* Back navigation */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => navigate(ROUTES.HUB)}
          className="min-h-[44px] flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4 sm:mb-6 group text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Main Hub</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="p-3 sm:p-3.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-2xl shadow-inner flex-shrink-0">
              <Pill className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MyFormulari</h1>
                <Badge className="border-violet-500/30 text-violet-400 bg-violet-500/5">
                  KKM Clinical Formulary
                </Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Drug Formulary One-Stop Centre, HAM/LASA Safety, IV Protocols & Antimicrobial Guidelines
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Total Drugs</span>
            <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-white min-h-[36px] flex items-center">{stats.totalDrugs}</div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">MOH Formulary 2025</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">HAM Items</span>
            <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-rose-400 min-h-[36px] flex items-center">{stats.hamCount}</div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">High Alert Risk</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">LASA Pairs</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono mt-2 text-amber-400 min-h-[36px] flex items-center">{stats.lasaCount}</div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">TALL-Man Lettering</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs sm:text-sm font-medium">Stock Alerts</span>
            <TrendingDown className={`w-4 h-4 flex-shrink-0 ${stats.lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold font-mono mt-2 min-h-[36px] flex items-center ${stats.lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {stats.lowStockCount}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Low / out of stock</p>
        </div>
      </div>

      {/* Action choices list */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          CLINICAL MODULE CHOICES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="group text-left bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/40 hover:border-slate-700/80 active:scale-[0.98] transition-all duration-200 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[170px] cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl border ${item.color}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    {item.badge && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-violet-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-500/80 group-hover:text-violet-400 transition-colors mt-auto pt-2">
                  <span>Open Module</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FormulariSubMenu
