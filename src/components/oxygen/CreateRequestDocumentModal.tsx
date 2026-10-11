// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { X, Calendar, Save, Loader2, Info } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { createRequestDocument } from '@/services/pharmacy/oxygenService';

interface CreateRequestDocumentModalProps {
  hospitalId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRequestDocumentModal: React.FC<CreateRequestDocumentModalProps> = ({
  hospitalId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user: currentUser } = useAuthStore();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [requestedDate, setRequestedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  // Items inputs
  const [qtyBN101N, setQtyBN101N] = useState<number>(0);
  const [qtyPI101FWard, setQtyPI101FWard] = useState<number>(0);
  const [qtyPI101FAmbulance, setQtyPI101FAmbulance] = useState<number>(0);
  const [qtyVieTankM3, setQtyVieTankM3] = useState<string | number>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
      resetForm();
    }
  }, [isOpen]);

  const loadSuppliers = async () => {
    try {
      const { data, error: err } = await supabase
        .from('suppliers')
        .select('id, company_name')
        .eq('status', 'active');
      if (err) throw err;
      if (data) {
        const filtered = data.filter(s => {
          const name = (s.company_name || '').toLowerCase();
          return name.includes('linde') || name.includes('borneo indah');
        });
        setSuppliers(filtered);
        // Find Linde Eox to set as default
        const defaultSupplier = filtered.find(s => s.company_name.toLowerCase().includes('linde'));
        if (defaultSupplier) {
          setSelectedSupplierId(defaultSupplier.id);
        } else if (filtered.length > 0) {
          setSelectedSupplierId(filtered[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  };

  const resetForm = () => {
    setRequestedDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setQtyBN101N(0);
    setQtyPI101FWard(0);
    setQtyPI101FAmbulance(0);
    setQtyVieTankM3('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setError('Please select a supplier.');
      return;
    }

    const numVieTank = typeof qtyVieTankM3 === 'number' ? qtyVieTankM3 : parseFloat(qtyVieTankM3) || 0;

    if (qtyBN101N <= 0 && qtyPI101FWard <= 0 && qtyPI101FAmbulance <= 0 && numVieTank <= 0) {
      setError('Sila masukkan kuantiti sekurang-kurangnya untuk satu jenis silinder atau tangki VIE.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items: any[] = [];
      if (qtyBN101N > 0) {
        items.push({
          size_code: '101-N',
          quantity: qtyBN101N,
          usage_notes: 'Bantuan Gas Sewaan (8.0m3)'
        });
      }
      if (qtyPI101FWard > 0) {
        items.push({
          size_code: '101-F',
          quantity: qtyPI101FWard,
          usage_notes: 'ward usage (long Cylinder)'
        });
      }
      if (qtyPI101FAmbulance > 0) {
        items.push({
          size_code: '101-F',
          quantity: qtyPI101FAmbulance,
          usage_notes: 'Ambulance usage (short Cylinder)'
        });
      }
      if (numVieTank > 0) {
        items.push({
          size_code: 'Liquid Medical Oxygen (VIE Tank)',
          quantity: numVieTank,
          usage_notes: 'Bekalan Gas Oksigen Cecair Pukal (Bulk VIE Tank)'
        });
      }

      // Fetch active user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = currentUser?.id || user?.id || '00000000-0000-0000-0000-000000000000';

      const res = await createRequestDocument(
        hospitalId,
        selectedSupplierId,
        new Date(requestedDate).toISOString(),
        remarks,
        items,
        userId
      );

      if (res.error) throw new Error(res.error);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate order form.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-surface border border-border-default rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-subtle/50 rounded-t-3xl">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-extrabold text-text-primary text-sm">Create Request Document</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface hover:bg-subtle border flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          {/* Supplier and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-default text-xs font-bold text-text-secondary bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-[transform,opacity,box-shadow,border-color]"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Order Date</label>
              <input
                type="date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-default text-xs font-bold text-text-secondary bg-subtle/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-[transform,opacity,box-shadow,border-color]"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-100 rounded-2xl flex items-start gap-3">
            <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-blue-400 font-semibold leading-relaxed">
              Borang permintaan bekalan gas perubatan ini mematuhi pekeliling perolehan KKM bagi peranti silinder sewaan skala <strong>BN (8.0m³)</strong>, <strong>PI (1.4m³)</strong>, dan isian cecair pukal <strong>Liquid Medical Oxygen (VIE Tank dlm unit M³)</strong>.
            </span>
          </div>

          {/* Cylinder & VIE Items Request */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider border-b pb-1">Request Quantities (Cylinders & VIE Tank)</h4>

            {/* Cylinder 1: BN 101-N */}
            <div className="p-4 border border-border-subtle rounded-2xl bg-subtle/50 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-text-primary">Loan Oxygen BN (8.0m³)</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Code: 101-N • Ward / Store General Refill</div>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    value={qtyBN101N || ''}
                    onChange={(e) => setQtyBN101N(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-xl border border-border-default text-center font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Cylinder 2: PI 101-F (Ward Usage) */}
            <div className="p-4 border border-border-subtle rounded-2xl bg-subtle/50 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-text-primary">Loan Oxygen PI (1.4m³) (ward usage) (long Cylinder)</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Code: 101-F • Ward Usage (Long Cylinder)</div>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    value={qtyPI101FWard || ''}
                    onChange={(e) => setQtyPI101FWard(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-xl border border-border-default text-center font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Cylinder 3: PI 101-F (Ambulance Usage) */}
            <div className="p-4 border border-border-subtle rounded-2xl bg-subtle/50 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-text-primary">Loan Oxygen PI (1.4m³) (Ambulance usage) (short Cylinder)</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Code: 101-F • Ambulance Usage (Short Cylinder)</div>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    value={qtyPI101FAmbulance || ''}
                    onChange={(e) => setQtyPI101FAmbulance(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-xl border border-border-default text-center font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Item 4: Liquid Medical Oxygen (VIE Tank) in M3 */}
            <div className="p-4 border border-blue-500/20 rounded-2xl bg-gradient-to-r from-blue-50/40 via-sky-50/30 to-indigo-50/20 space-y-3 shadow-xs">
              <div className="flex justify-between items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">Liquid Medical Oxygen (VIE Tank)</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-700 border border-blue-500/20 uppercase tracking-wider">
                      Isipadu M³
                    </span>
                  </div>
                  <div className="text-[10px] text-text-muted font-medium mt-0.5">
                    Code: VIE-TANK • Permintaan Isian Tangki Cecair Pukal (Unit M³)
                  </div>
                </div>
                <div className="w-32 relative flex items-center shrink-0">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={qtyVieTankM3}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                        setQtyVieTankM3(val);
                      }
                    }}
                    placeholder="0"
                    className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-blue-300 text-center font-bold text-xs bg-surface text-text-primary shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-[transform,opacity,box-shadow,border-color]"
                  />
                  <span className="absolute right-2.5 text-[11px] font-extrabold text-blue-600 pointer-events-none select-none">
                    M³
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Catatan / Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Additional notes if applicable..."
              className="w-full px-4 py-2.5 rounded-xl border border-border-default text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-[transform,opacity,box-shadow,border-color] resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border-default hover:bg-subtle/50 text-text-muted font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-[transform,opacity,box-shadow,border-color] active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menjana...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Submit Requisition</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
