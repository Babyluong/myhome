// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  Tag,
  Gauge,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useAuthStore } from '@/stores/authStore';
import {
  updateCylinderProfile,
  getOxygenCylinderSizes,
  getOxygenCylinderValveTypes,
  OxygenCylinderSizeOption,
  OxygenCylinderValveTypeOption
} from '@/modules/mycylinder/services/oxygenService';
import type { OxygenCylinderWithRelations } from '@/types/pharmacy';

interface EditCylinderModalProps {
  isOpen: boolean;
  cylinder: OxygenCylinderWithRelations | null;
  onClose: () => void;
  onSuccess: (updatedCylinder: OxygenCylinderWithRelations) => void;
  hospitalId: string;
}

export const EditCylinderModal: React.FC<EditCylinderModalProps> = ({
  isOpen,
  cylinder,
  onClose,
  onSuccess,
  hospitalId
}) => {
  const { language } = useLanguage();
  const { user } = useAuthStore();

  const [serialNumber, setSerialNumber] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedValveCode, setSelectedValveCode] = useState<'BN' | 'PI'>('PI');
  const [availableSizes, setAvailableSizes] = useState<OxygenCylinderSizeOption[]>([]);
  const [availableTypes, setAvailableTypes] = useState<OxygenCylinderValveTypeOption[]>([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load available sizes & valve types from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadMasterData() {
      setIsLoadingMasterData(true);
      try {
        const [sizesRes, typesRes] = await Promise.all([
          getOxygenCylinderSizes(),
          getOxygenCylinderValveTypes()
        ]);
        if (isMounted) {
          if (sizesRes.data) setAvailableSizes(sizesRes.data);
          if (typesRes.data) setAvailableTypes(typesRes.data);
        }
      } catch (err) {
        console.error('Failed to load sizes/types master data:', err);
      } finally {
        if (isMounted) setIsLoadingMasterData(false);
      }
    }

    if (isOpen) {
      loadMasterData();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Sync state whenever selected cylinder changes
  useEffect(() => {
    if (cylinder && isOpen) {
      setSerialNumber(cylinder.serial_number || '');
      const sizeId = cylinder.cylinder_size_id || cylinder.size_info?.id || '';
      setSelectedSizeId(sizeId);

      const rawCode = cylinder.type_info?.code || (
        cylinder.type_info?.type_name?.includes('PI') ? 'PI' : 'BN'
      );
      setSelectedValveCode(rawCode === 'BN' ? 'BN' : 'PI');
      setErrorMessage(null);
    }
  }, [cylinder, isOpen]);

  if (!isOpen || !cylinder) return null;

  // Selected size entity
  const currentSizeObj = availableSizes.find(s => s.id === selectedSizeId);
  const isLoan = Boolean(currentSizeObj ? currentSizeObj.is_loan : (cylinder.size_info?.is_loan || cylinder.serial_number?.includes('101-')));

  // Auto-switch default valve type when size changes if applicable
  const handleSizeChange = (newSizeId: string) => {
    setSelectedSizeId(newSizeId);
    const size = availableSizes.find(s => s.id === newSizeId);
    if (size) {
      if (size.code === '101-F' || size.code === 'P101-D' || size.code === 'P101-E') {
        setSelectedValveCode('PI');
      } else if (size.code === '101-N' || size.code === 'P101-HS') {
        setSelectedValveCode('BN');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanSerial = serialNumber.trim().toUpperCase();
    if (!cleanSerial) {
      setErrorMessage(language === 'ms' ? 'Please enter the cylinder serial number.' : 'Please enter cylinder serial number.');
      return;
    }
    if (!selectedSizeId) {
      setErrorMessage(language === 'ms' ? 'Please select the cylinder size & type.' : 'Please select cylinder size & type.');
      return;
    }

    setIsSubmitting(true);
    try {
      const typeObj = availableTypes.find(t => t.code === selectedValveCode);
      const res = await updateCylinderProfile({
        hospitalId,
        cylinderId: cylinder.id,
        serialNumber: cleanSerial,
        sizeId: selectedSizeId,
        typeId: typeObj?.id,
        valveCode: selectedValveCode,
        userId: user?.id
      });

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      if (res.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to submit cylinder update:', err);
      setErrorMessage(err.message || (language === 'ms' ? 'Ralat semasa mengemaskini silinder.' : 'Failed to update cylinder.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-border-default overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-900 via-teal-850 to-emerald-900 text-white flex items-center justify-between border-b border-teal-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-300">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {language === 'ms' ? 'Update Cylinder' : 'Edit Cylinder Details'}
              </h3>
              <p className="text-teal-200/80 text-xs font-medium">
                {language === 'ms' ? 'Ubah nombor siri, saiz, dan jenis injap silinder' : 'Modify cylinder serial, size, and valve connection'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-surface/20 border border-white/20 flex items-center justify-center transition-[transform,opacity,box-shadow,border-color] cursor-pointer text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Current Cylinder Snapshot */}
          <div className="bg-subtle/50 border border-border-default rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === 'ms' ? 'Rekod Semasa Dalam Sistem' : 'Current System Record'}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono font-bold text-text-primary text-sm">{cylinder.serial_number}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-text-secondary text-[10px] font-bold">
                {cylinder.type_info?.type_name || 'Standard'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-accent-base/10 text-teal-700 border border-accent-base/20 text-[10px] font-bold">
                {cylinder.current_location?.location_name || 'Pharmacy Store'}
              </span>
            </div>
          </div>

          {/* Field 1: Serial Number (Name) */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                {language === 'ms' ? 'Nombor Siri / Nama Silinder' : 'Serial Number / Cylinder Name'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{language === 'ms' ? 'Wajib' : 'Required'}</span>
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              placeholder="e.g. SABOXY-006083"
              className="w-full px-3.5 py-2.5 bg-surface border border-border-default rounded-xl font-mono font-bold text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-[transform,opacity,box-shadow,border-color] placeholder:text-text-muted"
              required
            />
            <div className="flex items-center gap-1 text-[11px] text-text-muted font-medium pt-0.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{language === 'ms' ? 'QR code and system search will be updated with this serial number.' : 'QR tag and system search will automatically sync with this serial.'}</span>
            </div>
          </div>

          {/* Field 2: Cylinder Size & Ownership Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-teal-600" />
                {language === 'ms' ? 'Saiz & Kategori Silinder' : 'Cylinder Size & Category'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{language === 'ms' ? 'Wajib' : 'Required'}</span>
            </label>
            
            {isLoadingMasterData ? (
              <div className="p-3 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                {language === 'ms' ? 'Loading size list...' : 'Loading sizes...'}
              </div>
            ) : (
              <select
                value={selectedSizeId}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border-default rounded-xl font-bold text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-[transform,opacity,box-shadow,border-color] cursor-pointer"
                required
              >
                <option value="" disabled>
                  {language === 'ms' ? '-- Pilih Saiz & Kategori --' : '-- Select Size & Category --'}
                </option>
                {availableSizes.map(s => {
                  const isLoanSize = Boolean(s.is_loan || s.code.startsWith('101-'));
                  const cap = s.capacity ? `${s.capacity}m³` : '';
                  const label = `${s.code} (${cap}) — ${isLoanSize ? (language === 'ms' ? 'PINJAMAN / LOAN' : 'LOAN') : (language === 'ms' ? 'MILIK HOSPITAL / PRIVATE' : 'PRIVATE/OWNED')}`;
                  return (
                    <option key={s.id} value={s.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            )}

            {currentSizeObj && (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  currentSizeObj.is_loan
                    ? 'bg-amber-100 text-amber-400 border border-amber-300'
                    : 'bg-blue-100 text-blue-400 border border-blue-300'
                }`}>
                  {currentSizeObj.is_loan ? (language === 'ms' ? '📌 Silinder Pinjaman (Loan)' : '📌 Loan Cylinder') : (language === 'ms' ? '🏢 Milik Hospital (Private)' : '🏢 Hospital Owned (Private)')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-subtle text-text-secondary border border-border-default text-[10px] font-bold">
                  {language === 'ms' ? 'Kapasiti' : 'Capacity'}: {currentSizeObj.capacity} {currentSizeObj.unit || 'm³'}
                </span>
              </div>
            )}
          </div>

          {/* Field 3: Valve Type (Pin Index vs Bullnose) */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-text-primary flex items-center justify-between">
              <span>{language === 'ms' ? 'Jenis Injap Silinder (Valve Connection)' : 'Cylinder Valve Connection'}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{language === 'ms' ? 'Semak label fizikal' : 'Verify physical label'}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedValveCode('PI')}
                className={`py-2.5 px-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-black transition-[transform,opacity,box-shadow,border-color] cursor-pointer ${
                  selectedValveCode === 'PI'
                    ? 'bg-indigo-500/10 border-purple-500 text-indigo-400 dark:text-indigo-300 font-bold shadow-xs'
                    : 'bg-surface border-border-default text-text-secondary hover:border-indigo-500/20 hover:bg-indigo-500/10'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>🟣 Pin Index (PI)</span>
                {selectedValveCode === 'PI' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 ml-auto" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedValveCode('BN')}
                className={`py-2.5 px-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-black transition-[transform,opacity,box-shadow,border-color] cursor-pointer ${
                  selectedValveCode === 'BN'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 dark:text-blue-300 font-bold shadow-xs'
                    : 'bg-surface border-border-default text-text-secondary hover:border-blue-500/20 hover:bg-blue-500/10'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>🔵 Bullnose (BN)</span>
                {selectedValveCode === 'BN' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 ml-auto" />}
              </button>
            </div>
            <p className="text-[10px] text-text-muted font-medium">
              {language === 'ms'
                ? 'Nota: Silinder 101-F, P101-D & P101-E standard menggunakan Pin Index (PI). Silinder 101-N & P101-HS menggunakan Bullnose (BN).'
                : 'Note: 101-F, P101-D & P101-E standard cylinders use Pin Index (PI). 101-N & P101-HS use Bullnose (BN).'}
            </p>
          </div>

          {/* Target Group Preview */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-xs text-emerald-400 dark:text-emerald-300 font-bold space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              {language === 'ms' ? 'Kumpulan Tab Rekonsiliasi Sasaran' : 'Target Reconciliation Tab Group'}
            </div>
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>
                {currentSizeObj
                  ? (currentSizeObj.is_loan
                      ? `Loan ${currentSizeObj.code} (${currentSizeObj.capacity}M³)`
                      : `Standard ${currentSizeObj.code} ${selectedValveCode} (${currentSizeObj.capacity}M³)`).replace(/\s+/g, ' ')
                  : (language === 'ms' ? 'Pilih saiz untuk melihat kategori' : 'Select size to preview group')}
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">
              {language === 'ms'
                ? 'Silinder ini akan dipindahkan secara automatik ke tab kumpulan audit di atas setelah disimpan.'
                : 'This cylinder will automatically be indexed under the above reconciliation tab once saved.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border-default text-text-secondary hover:bg-subtle/50 font-bold text-xs transition-[transform,opacity,box-shadow,border-color] cursor-pointer"
            >
              {language === 'ms' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingMasterData}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-xs transition-[transform,opacity,box-shadow,border-color] flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'ms' ? 'Menyimpan...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'ms' ? 'Simpan Perubahan' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
