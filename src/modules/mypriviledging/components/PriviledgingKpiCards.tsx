// src/modules/mypriviledging/components/PriviledgingKpiCards.tsx
// Professional Modern Government Design System KPI Cards (High Clarity, Clean Surfaces)
// Full English default with seamless language toggle support

import React from 'react';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import type { PrivilegingKPIs, StaffPrivilegingProfile } from '../types/priviledgingTypes';

interface PriviledgingKpiCardsProps {
  isAdminMode?: boolean;
  kpis: PrivilegingKPIs;
  activeStaff?: StaffPrivilegingProfile;
  onFilterClick?: (status: string) => void;
}

export const PriviledgingKpiCards: React.FC<PriviledgingKpiCardsProps> = ({
  isAdminMode = false,
  kpis,
  activeStaff,
  onFilterClick
}) => {
  const { language } = useLanguage();
  const isMs = language === 'ms';

  if (isAdminMode) {
    // Admin Perspective KPIs
    const adminCards = [
      {
        label: isMs ? 'Menunggu Semakan JKCP' : 'Pending JKCP Review',
        value: kpis.pendingSubmissions,
        subtitle: isMs ? 'Perlu verifikasi klinikal' : 'Requires clinical verification',
        icon: Clock,
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
        statusKey: 'pending'
      },
      {
        label: isMs ? 'Perlu Pindaan Staf' : 'Changes Requested',
        value: kpis.changesRequestedSubmissions,
        subtitle: isMs ? 'Maklum balas dihantar' : 'Feedback sent to clinician',
        icon: AlertCircle,
        iconColor: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
        statusKey: 'changes_requested'
      },
      {
        label: isMs ? 'Prosedur Diluluskan' : 'Approved Procedures',
        value: kpis.approvedSubmissions,
        subtitle: isMs ? 'Ditauliahkan berdikari' : 'Credentialed for independent practice',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
        statusKey: 'approved'
      },
      {
        label: isMs ? 'Staf Berprivileging Aktif' : 'Active Privileged Staff',
        value: `${kpis.activePrivilegedStaff} / ${kpis.totalStaff}`,
        subtitle: isMs
          ? `Kadar Kelulusan: ${kpis.approvalRatePercentage}%`
          : `Approval Rate: ${kpis.approvalRatePercentage}%`,
        icon: ShieldCheck,
        iconColor: 'text-slate-700 dark:text-slate-300',
        iconBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        statusKey: 'all'
      }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 mb-6">
        {adminCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onFilterClick && onFilterClick(card.statusKey)}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {card.value}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <div className={cn('p-3 rounded-xl border shrink-0', card.iconBg, card.iconColor)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Staff Perspective KPIs
  const staffCards = [
    {
      label: isMs ? 'Jumlah Prosedur Direkod' : 'Total Procedures Logged',
      value: activeStaff?.totalLogged || 0,
      subtitle: isMs ? 'Log Buku Komprehensif' : 'Comprehensive clinical logbook',
      icon: FileText,
      iconColor: 'text-slate-700 dark:text-slate-300',
      iconBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      statusKey: 'all'
    },
    {
      label: isMs ? 'Menunggu Kelulusan' : 'Pending Approvals',
      value: activeStaff?.pendingCount || 0,
      subtitle: isMs ? 'Dalam semakan JKCP' : 'Under JKCP review',
      icon: Clock,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
      statusKey: 'pending'
    },
    {
      label: isMs ? 'Perlu Pindaan / Nota' : 'Action / Revisions Required',
      value: activeStaff?.changesCount || 0,
      subtitle: isMs ? 'Sila semak maklum balas' : 'Please review supervisor feedback',
      icon: AlertCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
      statusKey: 'changes_requested'
    },
    {
      label: isMs ? 'Privileging Diluluskan' : 'Approved Privileges',
      value: activeStaff?.approvedCount || 0,
      subtitle: isMs ? 'Ditauliahkan berdikari' : 'Credentialed for independent practice',
      icon: Award,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
      statusKey: 'approved'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 mb-6">
      {staffCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onFilterClick && onFilterClick(card.statusKey)}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {card.value}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {card.subtitle}
                </p>
              </div>
              <div className={cn('p-3 rounded-xl border shrink-0', card.iconBg, card.iconColor)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
