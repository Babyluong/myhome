// src/modules/mypriviledging/components/SubmissionsTable.tsx
// Professional Modern Government Clinical Records Table (High Clarity, Legibility)
// Full English default with seamless language toggle support

import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileEdit,
  Send,
  Trash2,
  Award,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import type {
  ProcedureSubmission,
  SubmissionStatus
} from '../types/priviledgingTypes';

interface SubmissionsTableProps {
  submissions: ProcedureSubmission[];
  isAdminMode?: boolean;
  onEditSubmission?: (submission: ProcedureSubmission) => void;
  onSubmitDraft?: (submissionId: string) => void;
  onDeleteSubmission?: (submissionId: string) => void;
  onReviewSubmission?: (submission: ProcedureSubmission) => void;
  onViewCertificate?: (staffId: string) => void;
  activeStatusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  isAdminMode = false,
  onEditSubmission,
  onSubmitDraft,
  onDeleteSubmission,
  onReviewSubmission,
  onViewCertificate,
  activeStatusFilter = 'all',
  onStatusFilterChange
}) => {
  const { language } = useLanguage();
  const isMs = language === 'ms';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const statusTabs = [
    { id: 'all', label: isMs ? 'Semua Rekod' : 'All Records', count: submissions.length },
    {
      id: 'pending',
      label: isMs ? 'Menunggu Semakan' : 'Pending Review',
      count: submissions.filter((s) => s.status === 'pending').length
    },
    {
      id: 'changes_requested',
      label: isMs ? 'Perlu Pindaan' : 'Changes Requested',
      count: submissions.filter((s) => s.status === 'changes_requested').length
    },
    {
      id: 'approved',
      label: isMs ? 'Diluluskan' : 'Approved',
      count: submissions.filter((s) => s.status === 'approved').length
    },
    {
      id: 'draft',
      label: isMs ? 'Draf' : 'Drafts',
      count: submissions.filter((s) => s.status === 'draft').length
    }
  ];

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.staffDepartment) set.add(s.staffDepartment);
    });
    return Array.from(set);
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (activeStatusFilter !== 'all' && sub.status !== activeStatusFilter) return false;
      if (selectedRole !== 'all' && sub.staffRole !== selectedRole) return false;
      if (selectedDepartment !== 'all' && sub.staffDepartment !== selectedDepartment) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sub.procedureName.toLowerCase().includes(q);
        const matchesCategory = sub.categoryName.toLowerCase().includes(q);
        const matchesStaff = sub.staffName.toLowerCase().includes(q);
        const matchesMrn = sub.patientIdentifier?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesStaff && !matchesMrn) return false;
      }
      return true;
    });
  }, [submissions, activeStatusFilter, selectedRole, selectedDepartment, searchQuery]);

  const renderStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {isMs ? 'Diluluskan' : 'Approved'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {isMs ? 'Menunggu Semakan' : 'Pending Review'}
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            {isMs ? 'Perlu Pindaan' : 'Changes Requested'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            {isMs ? 'Ditolak' : 'Rejected'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <FileEdit className="w-3.5 h-3.5" />
            {isMs ? 'Draf' : 'Draft'}
          </span>
        );
    }
  };

  const renderSupervisionBadge = (level: string) => {
    switch (level) {
      case 'level_4_independent':
        return <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{isMs ? 'Mandiri (T4)' : 'Independent (L4)'}</span>;
      case 'level_3_indirect_supervision':
        return <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">{isMs ? 'Tidak Terus (T3)' : 'Indirect (L3)'}</span>;
      case 'level_2_direct_supervision':
        return <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{isMs ? 'Pengawasan (T2)' : 'Direct Supervised (L2)'}</span>;
      default:
        return <span className="text-xs font-semibold text-slate-500">{isMs ? 'Pemerhatian (T1)' : 'Observed (L1)'}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Controls & Tabs */}
      <div className="p-4 md:p-5 border-b border-slate-200/80 dark:border-slate-800 space-y-3.5">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {statusTabs.map((tab) => {
            const isTabActive = activeStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusFilterChange && onStatusFilterChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                  isTabActive
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold',
                    isTabActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMs ? 'Cari nama prosedur, staf, kategori, atau MRN...' : 'Search procedure name, staff, category, or MRN...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="all">{isMs ? 'Semua Peranan' : 'All Roles'}</option>
              <option value="nurses">{isMs ? 'Jururawat' : 'Registered Nurses'}</option>
              <option value="amos">{isMs ? 'Penolong Pegawai Perubatan' : 'Assistant Medical Officers (AMO)'}</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="all">{isMs ? 'Semua Jabatan' : 'All Departments'}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Records */}
      {filteredSubmissions.length === 0 ? (
        <div className="p-10 text-center">
          <Clock className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isMs ? 'Tiada Rekod Dijumpai' : 'No Records Found'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isMs
              ? 'Tiada rekod prosedur yang sepadan dengan kriteria tapisan anda.'
              : 'No procedure records match your filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold text-[11px] tracking-wider select-none">
                <th className="py-3 px-4">{isMs ? 'Tarikh' : 'Date'}</th>
                <th className="py-3 px-4">{isMs ? 'Staf Klinikal' : 'Clinical Staff'}</th>
                <th className="py-3 px-4">{isMs ? 'Kategori & Prosedur' : 'Category & Procedure'}</th>
                <th className="py-3 px-4">{isMs ? 'Pengawasan' : 'Supervision Level'}</th>
                <th className="py-3 px-4">{isMs ? 'Status & Kelulusan' : 'Status & Approval'}</th>
                <th className="py-3 px-4 text-right">{isMs ? 'Tindakan' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubmissions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Date Column */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {sub.procedureDate}
                    </p>
                    {sub.patientIdentifier && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {sub.patientIdentifier}
                      </span>
                    )}
                  </td>

                  {/* Staff Column */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {sub.staffName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">{sub.staffGrade}</span>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{sub.staffDepartment}</span>
                    </div>
                  </td>

                  {/* Category & Procedure Column */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                      {sub.categoryName}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5">
                      {sub.procedureName}
                    </p>
                    {sub.review?.adminNotes && sub.status === 'changes_requested' && (
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium mt-1 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                        {isMs ? 'Nota JKCP: ' : 'JKCP Notes: '} {sub.review.adminNotes}
                      </p>
                    )}
                  </td>

                  {/* Supervision Level */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderSupervisionBadge(sub.supervisionLevel)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(sub.status)}
                    {sub.review?.validityEndDate && sub.status === 'approved' && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isMs ? 'Sahlaku: ' : 'Valid until: '} {sub.review.validityEndDate}
                      </div>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Admin Review Action */}
                      {sub.status === 'pending' && onReviewSubmission && (
                        <button
                          type="button"
                          onClick={() => onReviewSubmission(sub)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1 active:scale-95 text-[11px]"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isMs ? 'Semak & Luluskan' : 'Review & Endorse'}</span>
                        </button>
                      )}

                      {/* Draft Actions */}
                      {sub.status === 'draft' && (
                        <>
                          {onEditSubmission && (
                            <button
                              type="button"
                              onClick={() => onEditSubmission(sub)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
                              title={isMs ? 'Sunting Draf' : 'Edit Draft'}
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onSubmitDraft && (
                            <button
                              type="button"
                              onClick={() => onSubmitDraft(sub.id)}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1"
                              title={isMs ? 'Hantar untuk Semakan' : 'Submit for Review'}
                            >
                              <Send className="w-3 h-3" />
                              <span>{isMs ? 'Hantar' : 'Submit'}</span>
                            </button>
                          )}
                          {onDeleteSubmission && (
                            <button
                              type="button"
                              onClick={() => onDeleteSubmission(sub.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 dark:bg-rose-950/40 rounded-lg"
                              title={isMs ? 'Padam Draf' : 'Delete Draft'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}

                      {/* Changes Requested Edit & Resubmit Action */}
                      {sub.status === 'changes_requested' && onEditSubmission && (
                        <button
                          type="button"
                          onClick={() => onEditSubmission(sub)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>{isMs ? 'Pinda & Hantar Semula' : 'Revise & Resubmit'}</span>
                        </button>
                      )}

                      {/* Approved Certificate Print */}
                      {sub.status === 'approved' && onViewCertificate && (
                        <button
                          type="button"
                          onClick={() => onViewCertificate(sub.staffId)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-semibold rounded-lg text-[11px] flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                        >
                          <Printer className="w-3 h-3 text-slate-500" />
                          <span>{isMs ? 'Sijil' : 'Certificate'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
