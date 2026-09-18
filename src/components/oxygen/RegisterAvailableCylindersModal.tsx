// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  FileText,
  Barcode
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { bulkUpsertAvailableCylinders, CylinderInputItem } from '@/modules/mycylinder/services/oxygenService';

interface RegisterAvailableCylindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hospitalId: string;
  combos: { id: string; display_name: string }[];
  initialComboId?: string;
}

export const RegisterAvailableCylindersModal: React.FC<RegisterAvailableCylindersModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  hospitalId,
  combos,
  initialComboId,
}) => {
  const { user } = useAuthStore();
  const { language } = useLanguage();

  const [selectedComboId, setSelectedComboId] = useState<string>(initialComboId || combos[0]?.id || '');
  const [entryMode, setEntryMode] = useState<'rows' | 'bulk'>('rows');
  const [rows, setRows] = useState<{ id: string; serial: string; qr: string }[]>([
    { id: '1', serial: '', qr: '' },
  ]);
  const [bulkText, setBulkText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialComboId) {
      setSelectedComboId(initialComboId);
    } else if (combos.length > 0 && !selectedComboId) {
      setSelectedComboId(combos[0].id);
    }
  }, [initialComboId, combos, selectedComboId]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setRows([{ id: Date.now().toString(), serial: '', qr: '' }]);
      setBulkText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Add row
  const handleAddRow = () => {
    setRows(prev => [...prev, { id: Date.now().toString() + Math.random(), serial: '', qr: '' }]);
  };

  // Remove row
  const handleRemoveRow = (id: string) => {
    if (rows.length === 1) {
      setRows([{ id: '1', serial: '', qr: '' }]);
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Update row
  const handleUpdateRow = (id: string, field: 'serial' | 'qr', value: string) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        if (field === 'serial') {
          // If QR was untouched or same as previous serial, keep QR mirroring serial
          const shouldSyncQr = !r.qr || r.qr === r.serial;
          return {
            ...r,
            serial: value,
            qr: shouldSyncQr ? value : r.qr,
          };
        }
        return { ...r, [field]: value };
      })
    );
  };

  // Process bulk paste text
  const handleParseBulkText = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    const parsed: { id: string; serial: string; qr: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if comma or tab separated (e.g. SERIAL, QR or SERIAL\tQR)
      let serial = trimmed;
      let qr = trimmed;

      if (trimmed.includes('\t')) {
        const parts = trimmed.split('\t').map(p => p.trim());
        serial = parts[0];
        qr = parts[1] || parts[0];
      } else if (trimmed.includes(',')) {
        const parts = trimmed.split(',').map(p => p.trim());
        serial = parts[0];
        qr = parts[1] || parts[0];
      }

      if (serial) {
        parsed.push({
          id: Date.now().toString() + Math.random(),
          serial,
          qr,
        });
      }
    }

    if (parsed.length > 0) {
      setRows(parsed);
      setEntryMode('rows');
      setSuccessMessage(
        language === 'ms'
          ? `Berjaya mengekstrak ${parsed.length} silinder daripada teks!`
          : `Successfully loaded ${parsed.length} cylinders from text!`
      );
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Filter valid non-empty rows
    const validRows = rows
      .map(r => ({
        serialNumber: r.serial.trim(),
        qrCode: r.qr.trim() || r.serial.trim(),
      }))
      .filter(r => r.serialNumber.length > 0);

    if (validRows.length === 0) {
      setErrorMessage(
        language === 'ms'
          ? 'Sila masukkan sekurang-kurangnya satu nombor siri silinder.'
          : 'Please enter at least one cylinder serial number.'
      );
      return;
    }

    if (!selectedComboId) {
      setErrorMessage(
        language === 'ms'
          ? 'Sila pilih spesifikasi / jenis silinder.'
          : 'Please select a cylinder specification/type.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await bulkUpsertAvailableCylinders(
        hospitalId,
        selectedComboId,
        validRows,
        user?.id,
        user?.full_name || 'Pharmacist'
      );

      if (res.data) {
        setSuccessMessage(
          language === 'ms'
            ? `Berjaya mengemas kini ${res.data.total} silinder ke stok Tersedia (Store)! (${res.data.created} baru, ${res.data.updated} dikemas kini)`
            : `Successfully updated ${res.data.total} cylinders to Available stock! (${res.data.created} newly added, ${res.data.updated} updated)`
        );
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Failed to update available cylinders.');
      }
    } catch (err: any) {
      console.error('Error submitting available cylinders:', err);
      setErrorMessage(err.message || 'System error during cylinder update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = rows.filter(r => r.serial.trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 via-white to-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {language === 'ms'
                  ? 'Kemas Kini Stok Tersedia (No. Siri & Kod QR)'
                  : 'Register & Update Available Cylinders'}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {language === 'ms'
                  ? 'Daftar no. siri & kod QR terus ke dalam stok tersedia (Stor Gas Utama)'
                  : 'Set physical serial numbers and QR codes to Available stock in Central Store'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs font-bold text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs font-bold text-emerald-700 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Cylinder Specification Selector */}
          <div>
            <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider block mb-1.5">
              {language === 'ms' ? 'Pilih Jenis / Spesifikasi Silinder' : 'Select Cylinder Spec / Type'}
            </label>
            <select
              value={selectedComboId}
              onChange={e => setSelectedComboId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
            >
              {combos.map(c => (
                <option key={c.id} value={c.id}>
                  {c.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Entry Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setEntryMode('rows')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                entryMode === 'rows'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              {language === 'ms' ? 'Kemasukan Berbaris' : 'Row-by-Row Entry'}
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('bulk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                entryMode === 'bulk'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {language === 'ms' ? 'Tampal Dari Excel / Teks' : 'Bulk Paste (Excel / Text)'}
            </button>
          </div>

          {/* Mode 1: Row-by-Row */}
          {entryMode === 'rows' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase px-1">
                <span>{language === 'ms' ? 'Senarai Silinder Fizikal' : 'Physical Cylinder List'} ({validCount})</span>
                <span className="text-[10px] text-teal-700 normal-case font-semibold">
                  {language === 'ms' ? 'Kod QR automatik sama dengan No Siri jika dikosongkan' : 'QR code defaults to Serial No if left blank'}
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {rows.map((row, idx) => (
                  <div key={row.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-center">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={language === 'ms' ? 'No. Siri (cth: P101-F-0199)' : 'Serial No (e.g. P101-F-0199)'}
                      value={row.serial}
                      onChange={e => handleUpdateRow(row.id, 'serial', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      placeholder={language === 'ms' ? 'Kod QR (pilihan)' : 'QR Code (optional)'}
                      value={row.qr}
                      onChange={e => handleUpdateRow(row.id, 'qr', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl text-xs font-extrabold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                {language === 'ms' ? 'Tambah Baris Silinder' : 'Add Cylinder Row'}
              </button>
            </div>
          )}

          {/* Mode 2: Bulk Paste */}
          {entryMode === 'bulk' && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-600 block">
                {language === 'ms'
                  ? 'Tampal senarai no. siri / kod QR dari fail Excel atau teks (satu silinder setiap baris):'
                  : 'Paste serial numbers or QR codes (one cylinder per line, or SERIAL, QR):'}
              </label>
              <textarea
                rows={6}
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={"P101-F-0101\nP101-F-0102\nP101-F-0103\nSABOXY-892011"}
                className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 uppercase"
              />
              <button
                type="button"
                onClick={handleParseBulkText}
                disabled={!bulkText.trim()}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                {language === 'ms' ? 'Muat Naik & Semak Baris' : 'Parse & Load Rows'}
              </button>
            </div>
          )}

          {/* Location & Status Info Banner */}
          <div className="bg-blue-50/70 border border-blue-200/60 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 font-semibold text-[11px] leading-relaxed">
              <span>
                {language === 'ms'
                  ? 'Semua silinder yang disenaraikan akan didaftarkan dengan status: '
                  : 'All listed cylinders will be registered with status: '}
                <strong className="text-emerald-700 font-extrabold uppercase">Available (Tersedia)</strong>
                {language === 'ms' ? ' di ' : ' at '}
                <strong className="text-blue-800 font-extrabold">Stor Gas Utama (Central Store)</strong>.
              </span>
              <p className="text-slate-500 font-normal">
                {language === 'ms'
                  ? 'Jika silinder sudah wujud dalam sistem, rekodnya akan dikemas kini ke status Tersedia secara automatik.'
                  : 'If any cylinder already exists, its record will be automatically updated to Available.'}
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            {language === 'ms' ? 'Batal' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={validCount === 0 || isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'ms' ? 'Menyimpan...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>
                  {language === 'ms'
                    ? `Simpan ${validCount} Silinder Tersedia`
                    : `Update ${validCount} Available Cylinders`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
