// @ts-nocheck
import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Layers, 
  FileText, 
  ArrowRight, 
  Check, 
  Clock, 
  UserCheck, 
  Sparkles,
  ClipboardCheck,
  RefreshCw,
  Info
} from 'lucide-react';

export interface AuditChangeItem {
  cylinderId: string;
  serialNumber: string;
  typeInfo?: string;
  sizeInfo?: string;
  oldStatus: string;
  newStatus: string;
  oldLocation: string;
  newLocation: string;
}

interface AuditReconciliationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: (remarks: string) => Promise<void>;
  isSaving: boolean;
  auditorName: string;
  auditorRole: string;
  changes: AuditChangeItem[];
  totalCylindersCount: number;
}

export const AuditReconciliationSummaryModal: React.FC<AuditReconciliationSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirmSave,
  isSaving,
  auditorName,
  auditorRole,
  changes,
  totalCylindersCount
}) => {
  const [auditRemarks, setAuditRemarks] = useState('');

  if (!isOpen) return null;

  // Compute breakdown by target unit location
  const unitBreakdown: Record<string, number> = {};
  changes.forEach(c => {
    const loc = c.newLocation || 'Pharmacy Store';
    unitBreakdown[loc] = (unitBreakdown[loc] || 0) + 1;
  });

  const handleConfirm = async () => {
    await onConfirmSave(auditRemarks);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'available' || s === 'full') return 'bg-emerald-100 text-emerald-400 border-emerald-500/20';
    if (s === 'used' || s === 'in_use' || s === 'issued') return 'bg-amber-100 text-amber-400 border-amber-500/20';
    if (s === 'empty') return 'bg-subtle text-text-primary border-border-default';
    if (s === 'return' || s === 'returned') return 'bg-purple-100 text-indigo-400 border-indigo-500/20';
    return 'bg-subtle text-text-primary border-border-default';
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="relative bg-surface w-full max-w-4xl rounded-3xl shadow-2xl border border-border-default overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-900 via-teal-850 to-emerald-900 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">Audit Reconciliation Verification Summary</h3>
                <span className="text-[10px] font-black bg-amber-400 text-amber-400 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Double Check Required</span>
              </div>
              <p className="text-teal-200/90 text-xs font-semibold mt-0.5">
                Review all reconciliation changes before saving to official inventory database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-9 h-9 rounded-full bg-teal-950/60 hover:bg-teal-900 border border-teal-800 flex items-center justify-center transition-[transform,opacity,box-shadow,border-color] cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-subtle/50">
          
          {/* Auditor Profile Card */}
          <div className="bg-surface border border-border-default rounded-2xl p-4 shadow-elevation-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-base/10 border border-teal-150 flex items-center justify-center text-teal-700 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-text-secondary font-bold uppercase tracking-wider block">Audited & Verified By</span>
                <span className="text-sm font-extrabold text-text-primary">{auditorName}</span>
                <span className="text-xs font-bold text-teal-700 bg-accent-base/10 border border-teal-100 px-2 py-0.5 rounded-md ml-2 inline-block">
                  {auditorRole || 'Pharmacy Officer'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted bg-subtle px-3 py-1.5 rounded-xl border border-border-default">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Audit Key Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border-default rounded-2xl p-4 shadow-elevation-1 space-y-1">
              <span className="text-[10px] font-black text-text-secondary font-bold uppercase tracking-wider">Total Inventory Audited</span>
              <div className="text-2xl font-black text-text-primary">{totalCylindersCount} <span className="text-xs text-slate-400 font-bold">cylinders</span></div>
              <p className="text-[11px] text-text-muted font-medium">Full stock reconciliation scope</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 shadow-elevation-1 space-y-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Reconciled Changes to Save
              </span>
              <div className="text-2xl font-black text-amber-400 dark:text-amber-300 font-bold">{changes.length} <span className="text-xs text-amber-400 font-bold">cylinders updated</span></div>
              <p className="text-[11px] text-amber-400 font-semibold">Status or location modified</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-elevation-1 space-y-1">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Unchanged & Matched
              </span>
              <div className="text-2xl font-black text-emerald-400 dark:text-emerald-300 font-bold">{totalCylindersCount - changes.length} <span className="text-xs text-emerald-400 font-bold">cylinders</span></div>
              <p className="text-[11px] text-emerald-400 font-semibold">Physical matches system status</p>
            </div>
          </div>

          {/* Unit Allocation Breakdown Pills */}
          {Object.keys(unitBreakdown).length > 0 && (
            <div className="bg-surface border border-border-default rounded-2xl p-4 space-y-2 shadow-elevation-1">
              <span className="text-[10px] font-black text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" /> Target Unit Allocation Summary for Modified Cylinders
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(unitBreakdown).map(([unit, count]) => (
                  <span key={unit} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-bold text-text-primary">
                    <span>{unit}</span>
                    <span className="px-2 py-0.5 bg-teal-600 text-white rounded-md text-[10px] font-extrabold">
                      {count} {count === 1 ? 'cyl' : 'cyls'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Itemized Discrepancies & Changes Table */}
          <div className="bg-surface border border-border-default rounded-2xl p-4 space-y-3 shadow-elevation-1">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
                  Itemized Verification Checklist ({changes.length} Changes)
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Double check before final save</span>
            </div>

            {changes.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="text-xs font-bold text-text-secondary">No status or location changes detected.</p>
                <p className="text-[11px] text-slate-400">All physical inventory matches current database records.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-subtle/50 text-[10px] font-black text-text-secondary font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-border-default">
                    <tr>
                      <th scope="col" className="px-3.5 py-2.5">Cylinder Serial</th>
                      <th scope="col" className="px-3.5 py-2.5">Previous State</th>
                      <th scope="col" className="px-3.5 py-2.5 text-center">➔</th>
                      <th scope="col" className="px-3.5 py-2.5">New Audit Status</th>
                      <th scope="col" className="px-3.5 py-2.5">Target Unit / Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle font-semibold text-text-secondary">
                    {changes.map((item) => (
                      <tr key={item.cylinderId} className="hover:bg-subtle/50 transition-colors">
                        <td className="px-3.5 py-3 font-mono font-black text-text-primary">
                          {item.serialNumber}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal">{item.sizeInfo || 'Standard'}</span>
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="px-2 py-0.5 bg-subtle text-text-secondary rounded-md text-[10px] font-bold uppercase border border-border-default">
                            {item.oldStatus}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{item.oldLocation}</span>
                        </td>
                        <td className="px-3.5 py-3 text-center text-slate-400">
                          <ArrowRight className="w-3.5 h-3.5 inline text-teal-600" />
                        </td>
                        <td className="px-3.5 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${getStatusBadge(item.newStatus)}`}>
                            {item.newStatus}
                          </span>
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="px-2.5 py-1 bg-accent-base/10 text-teal-800 rounded-lg border border-teal-150 text-[10px] font-extrabold inline-block">
                            {item.newLocation || 'Pharmacy Store'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Auditor Remarks / Justification Input Box */}
          <div className="bg-surface border border-border-default rounded-2xl p-4 space-y-2 shadow-elevation-1">
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" /> Audit Verification Remarks / Justification (Optional)
            </label>
            <textarea
              rows={2}
              value={auditRemarks}
              onChange={(e) => setAuditRemarks(e.target.value)}
              placeholder="e.g. Physical stock count verified during ward round. 3 cylinders transferred to Nephrology."
              className="w-full p-3 border border-border-default rounded-xl text-xs font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal-500 transition-[transform,opacity,box-shadow,border-color]"
            />
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="px-6 py-4 border-t border-border-default bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-lg">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-surface border border-border-default hover:bg-subtle text-text-secondary rounded-xl text-xs font-black transition-[transform,opacity,box-shadow,border-color] active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
          >
            ← BACK TO EDIT DRAFT
          </button>

          <button
            type="button"
            disabled={isSaving || changes.length === 0}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/10 active:scale-95 transition-[transform,opacity,box-shadow,border-color] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Audit to Database...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Confirm & Save Audit to Database ({changes.length})
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
