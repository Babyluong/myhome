// src/modules/mypriviledging/components/StaffCompetencyMatrix.tsx
// Professional Modern Government Staff Competency Matrix

import React, { useState, useMemo } from 'react';
import {
  Users2,
  Search,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import '@/lib/utils'
import type { StaffPrivilegingProfile } from '../types/priviledgingTypes';

interface StaffCompetencyMatrixProps {
  staffList: StaffPrivilegingProfile[];
  onViewCertificate: (staffId: string) => void;
}

export const StaffCompetencyMatrix: React.FC<StaffCompetencyMatrixProps> = ({
  staffList,
  onViewCertificate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      if (selectedRole !== 'all' && s.role !== selectedRole) return false;
      if (selectedStatus !== 'all' && s.privilegingStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchDept = s.department.toLowerCase().includes(q);
        const matchIc = s.icNumber.toLowerCase().includes(q);
        const matchReg = s.boardRegistrationNo.toLowerCase().includes(q);
        if (!matchName && !matchDept && !matchIc && !matchReg) return false;
      }
      return true;
    });
  }, [staffList, selectedRole, selectedStatus, searchQuery]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Active Privileging
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Clock className="w-3 h-3 text-sky-600" />
            Logging In Progress
          </span>
        );
      case 'pending_renewal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Renewal Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-subtle dark:bg-slate-800 text-text-muted dark:text-slate-400">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-surface dark:bg-slate-900 border border-border-default dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="p-4 md:p-5 border-b border-border-default dark:border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Users2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              Clinical Staff Competency & Progress Matrix
            </h3>
            <p className="text-xs text-text-muted dark:text-slate-400 mt-0.5">
              Monitoring logbook certification status and privileging authorization for Lawas Hospital
            </p>
          </div>
          <span className="text-xs text-text-muted font-semibold px-3 py-1 bg-subtle/50 dark:bg-slate-800 border border-border-default dark:border-slate-700 rounded-xl self-start sm:self-auto">
            Total Staff: <strong className="text-emerald-700 dark:text-emerald-400">{filteredStaff.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff name, IC number, position, or department..."
              className="w-full pl-10 pr-4 py-2 bg-subtle/50 dark:bg-slate-800/80 border border-border-default dark:border-slate-700 rounded-xl text-xs md:text-sm text-text-primary dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-subtle/50 dark:bg-slate-800/80 border border-border-default dark:border-slate-700 rounded-xl text-xs md:text-sm text-text-primary dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="all">All Roles</option>
              <option value="nurses">Staff Nurses</option>
              <option value="amos">Assistant Medical Officers</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-subtle/50 dark:bg-slate-800/80 border border-border-default dark:border-slate-700 rounded-xl text-xs md:text-sm text-text-primary dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="all">All Privileging Statuses</option>
              <option value="active">Active Privileging</option>
              <option value="in_progress">Logging In Progress</option>
              <option value="pending_renewal">Renewal Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-subtle/50 dark:bg-slate-800/50 border-b border-border-default dark:border-slate-800 text-text-muted dark:text-slate-400 uppercase font-bold text-[11px] tracking-wider select-none">
              <th className="py-3 px-4">Staff Name & Position</th>
              <th className="py-3 px-4">MOH Registration & APC</th>
              <th className="py-3 px-4">Department & Placement</th>
              <th className="py-3 px-4 text-center">Logged</th>
              <th className="py-3 px-4 text-center">Approved</th>
              <th className="py-3 px-4">Certificate Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle dark:divide-slate-800">
            {filteredStaff.map((staff) => {
              const progressPct = staff.totalLogged > 0
                ? Math.round((staff.approvedCount / staff.totalLogged) * 100)
                : 0;

              return (
                <tr
                  key={staff.id}
                  className="hover:bg-subtle/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Name & Position */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-text-primary dark:text-white">
                      {staff.fullName}
                    </div>
                    <div className="text-[11px] text-text-muted dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">{staff.grade}</span>
                      <span>•</span>
                      <span>{staff.position}</span>
                    </div>
                  </td>

                  {/* Board Reg & APC */}
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="font-semibold text-text-primary dark:text-slate-200">
                      {staff.boardRegistrationNo}
                    </div>
                    <div className="text-[10px] text-text-muted dark:text-slate-400">
                      APC: {staff.apcNumber} ({staff.apcExpiryDate})
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4 text-text-secondary dark:text-slate-300 font-medium">
                    {staff.department}
                  </td>

                  {/* Total Logged */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-semibold text-text-primary dark:text-white px-2 py-0.5 bg-subtle dark:bg-slate-800 rounded-md">
                      {staff.totalLogged}
                    </span>
                  </td>

                  {/* Approved Count & Progress Bar */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {staff.approvedCount}
                      </span>
                      <div className="w-16 h-1.5 bg-subtle dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(staff.privilegingStatus)}
                  </td>

                  {/* Action: Print Certificate */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewCertificate(staff.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-elevation-1 transition-colors inline-flex items-center gap-1.5 active:scale-95 text-[11px]"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print Certificate</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
