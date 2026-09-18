// @ts-nocheck
import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Trash2,
  X,
  Eye,
  EyeOff,
  Building2,
  User,
  Package,
  Calendar
} from 'lucide-react';
import type { CylinderDispatchRequestWithRelations } from '@/types/pharmacy';

interface DeleteDispatchConfirmModalProps {
  isOpen: boolean;
  request: CylinderDispatchRequestWithRelations | null;
  onClose: () => void;
  onConfirm: (requestId: string, reason: string, password: string) => Promise<void>;
}

export const DeleteDispatchConfirmModal: React.FC<DeleteDispatchConfirmModalProps> = ({
  isOpen,
  request,
  onClose,
  onConfirm
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const itemsSummary = (request.items || [])
    .map((itm) => `${itm.quantity_requested || itm.quantity || 1}x ${itm.size_code || '101-N'}`)
    .join(', ') || 'Tiada item';

  const quickReasons = [
    'Tersalah cipta indent / permohonan',
    'Ujian sistem (System Testing)',
    'Rekod bertindih / duplicate entry',
    'Dibatalkan atas permintaan fasiliti luar'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Sila berikan sebab atau justifikasi pemadaman rekod.');
      return;
    }

    if (password !== 'F@rmasi.2016') {
      setError('Kata laluan keselamatan tidak sah. Sila masukkan kata laluan "F@rmasi.2016" yang betul.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(request.id, reason.trim(), password);
      setPassword('');
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memadam rekod permohonan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setPassword('');
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-50 via-red-50/50 to-orange-50/30 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  Security Override
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {request.request_number}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Padam Rekod Permohonan / Indent
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in shake">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Record Details Summary Box */}
          <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Maklumat Rekod Yang Akan Dipadam:
            </span>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Jabatan / Fasiliti:
                </span>
                <p className="font-bold text-slate-800 truncate">
                  {request.is_external_facility
                    ? `Farmasi Logistik ➔ ${request.external_facility_name || 'Fasiliti Luar'}`
                    : (request.department?.department_name || 'Farmasi Logistik')}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Pemohon / Issuer:
                </span>
                <p className="font-bold text-slate-800 truncate">
                  {request.requester?.full_name || request.issuer?.full_name || 'AMRI AMIT'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Package className="w-3.5 h-3.5 text-slate-400" /> Item & Saiz:
                </span>
                <p className="font-bold text-indigo-700 truncate">
                  {itemsSummary}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Status:
                </span>
                <p className="font-bold text-slate-800 capitalize">
                  {request.status}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Audit Trail Aktif:</strong> Pemadaman ini akan direkodkan ke dalam <strong>Log Audit Keselamatan H.O.M.E.</strong> bersama nama pegawai, cap masa, dan snapshot penuh item.
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sebab / Justifikasi Pemadaman <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Contoh: Tersalah cipta kuantiti indent atau testing..."
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-2xs"
            />

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickReasons.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => {
                    setReason(qr);
                    if (error) setError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-[11px] text-slate-600 font-medium transition-colors border border-slate-200/60"
                >
                  + {qr}
                </button>
              ))}
            </div>
          </div>

          {/* Security Password Field */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Kata Laluan Keselamatan <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">Perlu kata laluan pegawai</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Masukkan kata laluan keselamatan"
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Kata laluan rasmi permohonan farmasi: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">F@rmasi.2016</code>
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim() || !reason.trim()}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                isSubmitting || !password.trim() || !reason.trim()
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 active:scale-95 cursor-pointer'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Memadam & Merekod Audit...' : 'Sahkan & Padam Rekod'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
