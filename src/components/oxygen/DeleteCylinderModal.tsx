// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Trash2,
  AlertTriangle,
  X,
  Building2,
  Package,
  Layers,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import type { OxygenCylinderWithRelations } from '@/types/pharmacy';

interface DeleteCylinderModalProps {
  isOpen: boolean;
  cylinders: OxygenCylinderWithRelations[] | null;
  onClose: () => void;
  onConfirm: (cylinderIds: string[], reason: string) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteCylinderModal: React.FC<DeleteCylinderModalProps> = ({
  isOpen,
  cylinders,
  onClose,
  onConfirm,
  isDeleting
}) => {
  const { language } = useLanguage();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !cylinders || cylinders.length === 0) return null;

  const isBulk = cylinders.length > 1;
  const singleCyl = !isBulk ? cylinders[0] : null;

  const quickReasons = language === 'ms' ? [
    'Silinder dilupuskan / reput (Condemned)',
    'Rekod pertindihan / tersalah daftar',
    'No. siri salah / silinder tidak wujud',
    'Silinder hilang dari inventori',
    'Silinder rosak / tidak boleh dibaiki',
    'Ujian sistem (System Test Data)'
  ] : [
    'Cylinder condemned / scrapped',
    'Duplicate record / erroneous entry',
    'Invalid serial number / cylinder does not exist',
    'Missing cylinder from inventory',
    'Damaged / beyond repair',
    'System testing record'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalReason = reason.trim() || (
      language === 'ms'
        ? (isBulk ? `Padam ${cylinders.length} silinder dari audit inventori` : `Padam silinder ${singleCyl?.serial_number} dari inventori`)
        : (isBulk ? `Bulk delete ${cylinders.length} cylinders from inventory audit` : `Delete cylinder ${singleCyl?.serial_number} from inventory`)
    );

    try {
      await onConfirm(cylinders.map(c => c.id), finalReason);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memadam silinder / Failed to delete cylinder');
    }
  };

  const getStatusBadge = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Available (Store)</span>;
      case 'in_use':
      case 'used':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">In Use (Ward)</span>;
      case 'returned_to_supplier':
      case 'return':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">Return (Supplier)</span>;
      case 'empty':
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">Empty (Store)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">{status || 'Unknown'}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-50 via-red-50/50 to-orange-50/30 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  {language === 'ms' ? 'Tindakan Kekal' : 'Permanent Action'}
                </span>
                {isBulk && (
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {cylinders.length} {language === 'ms' ? 'Silinder' : 'Cylinders'}
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-slate-900 mt-0.5">
                {isBulk 
                  ? (language === 'ms' ? `Padam ${cylinders.length} Silinder Dipilih` : `Delete ${cylinders.length} Selected Cylinders`)
                  : (language === 'ms' ? 'Padam Rekod Silinder' : 'Delete Cylinder Record')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Warning Banner */}
          <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed font-medium">
              {language === 'ms'
                ? 'Amaran: Tindakan ini akan memadam rekod silinder secara kekal dari pangkalan data Supabase hospital. Semua rekod audit akan diselaraskan.'
                : 'Warning: This action will permanently remove cylinder record(s) from the hospital Supabase database. Audit logs will record this deletion.'}
            </div>
          </div>

          {/* Details */}
          {!isBulk && singleCyl ? (
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ms' ? 'No. Siri Silinder' : 'Cylinder Serial Number'}
                  </span>
                  <span className="font-mono text-base font-black text-slate-900">
                    {singleCyl.serial_number}
                  </span>
                </div>
                <div>
                  {getStatusBadge(singleCyl.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ms' ? 'Jenis / Saiz' : 'Type / Size'}
                  </span>
                  <span className="font-bold text-slate-700">
                    {singleCyl.type_info?.type_name || singleCyl.type_name || 'Standard Cylinder'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ms' ? 'Lokasi Semasa' : 'Current Location'}
                  </span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {singleCyl.scanned_location || singleCyl.current_location || 'Pharmacy Store'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {language === 'ms' ? 'Senarai Silinder Yang Akan Dipadam:' : 'Cylinders to be permanently deleted:'}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                  {cylinders.length} {language === 'ms' ? 'item' : 'items'}
                </span>
              </div>
              <div className="max-h-28 overflow-y-auto flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-slate-200">
                {cylinders.map(c => (
                  <span 
                    key={c.id}
                    className="font-mono font-bold text-[11px] px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                  >
                    {c.serial_number}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reason Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {language === 'ms' ? 'Sebab / Justifikasi Pemadaman (Audit Log)' : 'Reason / Justification for Deletion (Audit Log)'}
            </label>

            {/* Quick Reason Pills */}
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map(qr => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => setReason(qr)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    reason === qr
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {qr}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={language === 'ms' ? 'Nyatakan sebab pemadaman silinder ini...' : 'Enter reason for deleting this cylinder...'}
              rows={3}
              className="w-full mt-2 p-3 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-medium text-slate-800 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
              {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {language === 'ms' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isDeleting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {isDeleting 
                  ? (language === 'ms' ? 'Memadam...' : 'Deleting...') 
                  : (isBulk 
                      ? (language === 'ms' ? `Padam ${cylinders.length} Silinder` : `Delete ${cylinders.length} Cylinders`)
                      : (language === 'ms' ? 'Padam Silinder' : 'Delete Cylinder'))}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
