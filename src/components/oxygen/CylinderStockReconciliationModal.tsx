// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Search, 
  QrCode, 
  CheckCircle2, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  Building2, 
  Truck, 
  Boxes, 
  Layers, 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Filter,
  FileText,
  Barcode,
  Camera,
  Warehouse,
  Activity,
  UserCheck,
  Calendar,
  Clock,
  Printer,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { Modal, Button, Input, Badge } from '@/components/ui';
import { JATA_NEGARA_BASE64 } from '@/modules/mytransporter/pages/jataNegaraBase64';
import { 
  getCylindersForReconciliation, 
  reconcileCylindersBatch,
  bulkUpsertAvailableCylinders
} from '@/modules/mycylinder/services/oxygenService';
import type { UsageLedgerRow } from './StoreUsageBalanceTable';

interface CylinderStockReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
  combo: UsageLedgerRow | null;
  onReconciliationComplete?: () => void;
}

export const CylinderStockReconciliationModal: React.FC<CylinderStockReconciliationModalProps> = ({
  isOpen,
  onClose,
  hospitalId,
  combo,
  onReconciliationComplete,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language } = useLanguage();

  const [cylinders, setCylinders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [locationFilter, setLocationFilter] = useState<'store' | 'all' | 'ward' | 'supplier'>('store');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');

  // Track verified cylinder IDs in this reconciliation session
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());

  // Auditor form states
  const [officerName, setOfficerName] = useState(user?.full_name || 'AMRI AMIT');
  const [officerPost, setOfficerPost] = useState('Pegawai Farmasi / Pentadbir Stor');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New cylinder registration states during audit
  const [unmatchedSerial, setUnmatchedSerial] = useState<string | null>(null);
  const [isRegisteringUnmatched, setIsRegisteringUnmatched] = useState(false);
  const [isAddCylinderOpen, setIsAddCylinderOpen] = useState(false);
  const [manualSerialInput, setManualSerialInput] = useState('');
  const [manualQrInput, setManualQrInput] = useState('');
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  const scanInputRef = useRef<HTMLInputElement | null>(null);

  // Load cylinders whenever modal opens or combo changes
  useEffect(() => {
    if (!isOpen || !combo || !combo.size_id) return;

    const fetchCylinders = async () => {
      setIsLoading(true);
      setFeedback(null);
      setSearchQuery('');
      setScanInput('');
      setUnmatchedSerial(null);
      setIsAddCylinderOpen(false);
      setManualSerialInput('');
      setManualQrInput('');
      setLocationFilter('store');
      setStatusFilter('all');

      try {
        const res = await getCylindersForReconciliation(hospitalId, combo.size_id, combo.type_id);
        if (res.data) {
          setCylinders(res.data);
          // Pre-populate verified IDs from genuine DB records
          const preVerified = new Set<string>();
          res.data.forEach((c) => {
            if (c.is_verified) {
              preVerified.add(c.id);
            }
          });
          setVerifiedIds(preVerified);
        }
      } catch (err: any) {
        console.error('Error loading cylinders for reconciliation:', err);
        setFeedback({ type: 'error', message: 'Failed to load physical cylinder list from database.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCylinders();
  }, [isOpen, combo, hospitalId]);

  // Focus scan input automatically when modal is ready
  useEffect(() => {
    if (isOpen && !isLoading) {
      const timer = setTimeout(() => {
        scanInputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading]);

  // Compute breakdown stats
  const stats = useMemo(() => {
    const total = cylinders.length;
    const storeCylinders = cylinders.filter((c) => {
      const loc = ((typeof c.current_location === 'object' ? c.current_location?.location_name : c.current_location) || '').toLowerCase();
      return (loc.includes('store') || loc.includes('stor') || loc.includes('farmasi')) && !loc.includes('supplier');
    });
    const wardCylinders = cylinders.filter((c) => {
      const loc = ((typeof c.current_location === 'object' ? c.current_location?.location_name : c.current_location) || '').toLowerCase();
      return !loc.includes('store') && !loc.includes('stor') && !loc.includes('supplier');
    });
    const supplierCylinders = cylinders.filter((c) => {
      const loc = ((typeof c.current_location === 'object' ? c.current_location?.location_name : c.current_location) || '').toLowerCase();
      return loc.includes('supplier') || c.status === 'returned_to_supplier';
    });

    const storeVerified = storeCylinders.filter((c) => verifiedIds.has(c.id)).length;
    const totalVerified = cylinders.filter((c) => verifiedIds.has(c.id)).length;

    return {
      total,
      storeTotal: storeCylinders.length,
      storeVerified,
      wardTotal: wardCylinders.length,
      supplierTotal: supplierCylinders.length,
      totalVerified,
      isStoreComplete: storeCylinders.length > 0 && storeVerified === storeCylinders.length,
    };
  }, [cylinders, verifiedIds]);

  // Filter cylinders for display
  const filteredCylinders = useMemo(() => {
    return cylinders.filter((c) => {
      const loc = ((typeof c.current_location === 'object' ? c.current_location?.location_name : c.current_location) || '').toLowerCase();
      const isStore = (loc.includes('store') || loc.includes('stor') || loc.includes('farmasi')) && !loc.includes('supplier');
      const isSupplier = loc.includes('supplier') || c.status === 'returned_to_supplier';
      const isWard = !isStore && !isSupplier;

      // Location filter
      if (locationFilter === 'store' && !isStore) return false;
      if (locationFilter === 'ward' && !isWard) return false;
      if (locationFilter === 'supplier' && !isSupplier) return false;

      // Verification filter
      const isVer = verifiedIds.has(c.id);
      if (statusFilter === 'verified' && !isVer) return false;
      if (statusFilter === 'pending' && isVer) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const sn = (c.serial_number || '').toLowerCase();
        const qr = (c.qr_code || '').toLowerCase();
        const curLoc = ((typeof c.current_location === 'object' ? c.current_location?.location_name : c.current_location) || '').toLowerCase();
        if (!sn.includes(query) && !qr.includes(query) && !curLoc.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [cylinders, locationFilter, statusFilter, searchQuery, verifiedIds]);

  // Toggle single cylinder verified state
  const handleToggleVerify = (cylinderId: string) => {
    setVerifiedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cylinderId)) {
        next.delete(cylinderId);
      } else {
        next.add(cylinderId);
      }
      return next;
    });
  };

  // One-click batch verify all store available cylinders
  const handleVerifyAllInStore = () => {
    const storeIds = cylinders
      .filter((c) => {
        const loc = ((typeof c.current_location === 'object' ? c.current_location?.location_name : c.current_location) || '').toLowerCase();
        return (loc.includes('store') || loc.includes('stor') || loc.includes('farmasi')) && !loc.includes('supplier');
      })
      .map((c) => c.id);

    setVerifiedIds((prev) => {
      const next = new Set(prev);
      storeIds.forEach((id) => next.add(id));
      return next;
    });

    setFeedback({
      type: 'success',
      message: `Semua ${storeIds.length} silinder sedia ada di rak stor telah disahkan sepadan!`,
    });
  };

  // Handle barcode scanner or manual serial submit
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = scanInput.trim();
    if (!raw) return;

    const term = raw.toLowerCase();
    const termStripped = term.replace(/^(?:o2|02)[-_ ]?/, '');

    const matched = cylinders.find((c) => {
      const sn = (c.serial_number || '').toLowerCase();
      const qr = (c.qr_code || '').toLowerCase();
      const snStripped = sn.replace(/^(?:o2|02)[-_ ]?/, '');
      const qrStripped = qr.replace(/^(?:o2|02)[-_ ]?/, '');

      return (
        sn === term ||
        qr === term ||
        (termStripped && (snStripped === termStripped || qrStripped === termStripped)) ||
        sn.includes(term) ||
        qr.includes(term) ||
        (termStripped && (sn.includes(termStripped) || qr.includes(termStripped))) ||
        (termStripped && (termStripped.includes(snStripped) || termStripped.includes(qrStripped)))
      );
    });

    if (matched) {
      setVerifiedIds((prev) => new Set(prev).add(matched.id));
      setUnmatchedSerial(null);
      setFeedback({
        type: 'success',
        message: `Silinder [${matched.serial_number}] ditemui & disahkan! (${(typeof matched.current_location === 'object' ? matched.current_location?.location_name : matched.current_location) || 'Stor'})`,
      });
      setScanInput('');
    } else {
      setUnmatchedSerial(raw);
      setFeedback({
        type: 'error',
        message: `No. Siri / Kod Bar "${raw}" tidak dijumpai dalam daftar silinder sedia ada bagi ${combo?.display_name}.`,
      });
    }

    scanInputRef.current?.focus();
  };

  // Register and verify new cylinder into Store during reconciliation
  const handleRegisterCylinder = async (serial: string, qr?: string) => {
    if (!combo || !serial.trim()) return;
    const cleanSerial = serial.trim().toUpperCase();
    const cleanQr = (qr || serial).trim().toUpperCase();
    setIsRegisteringUnmatched(true);

    try {
      const res = await bulkUpsertAvailableCylinders(
        hospitalId,
        combo.combo_id,
        [{ serialNumber: cleanSerial, qrCode: cleanQr }],
        user?.id,
        user?.full_name || 'Staff'
      );

      if (res.data) {
        // Refresh cylinder records for this combo from DB
        const refreshRes = await getCylindersForReconciliation(hospitalId, combo.size_id, combo.type_id);
        if (refreshRes.data) {
          setCylinders(refreshRes.data);
          const found = refreshRes.data.find(
            (c) => (c.serial_number || '').toUpperCase() === cleanSerial
          );
          if (found) {
            setVerifiedIds((prev) => new Set(prev).add(found.id));
          }
        }

        setFeedback({
          type: 'success',
          message: `Silinder baharu [${cleanSerial}] berjaya didaftarkan ke Stor Pusat dan disahkan dalam rekonsiliasi!`,
        });
        setUnmatchedSerial(null);
        setScanInput('');
        setManualSerialInput('');
        setManualQrInput('');
        setIsAddCylinderOpen(false);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Gagal mendaftarkan silinder baharu.',
        });
      }
    } catch (err: any) {
      console.error('Error registering new cylinder during reconciliation:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Ralat mendaftarkan silinder baharu.',
      });
    } finally {
      setIsRegisteringUnmatched(false);
      setIsManualSubmitting(false);
    }
  };

  // Save finalized reconciliation to DB
  const handleSaveReconciliation = async () => {
    if (!combo) return;

    setIsSubmitting(true);
    setFeedback(null);

    const idsToSave = Array.from(verifiedIds);

    try {
      const finalRemarks = remarks || `Pemeriksaan fizikal KEW.PS-14 selesai bagi ${combo.display_name}. Disahkan ${idsToSave.length}/${cylinders.length} silinder oleh ${officerName}.`;

      const res = await reconcileCylindersBatch(hospitalId, idsToSave, officerName, finalRemarks, {
        sizeId: combo.size_id,
        typeId: combo.type_id,
        status: 'available',
        location: 'Pharmacy Store',
      });

      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        setFeedback({
          type: 'success',
          message: `Rekonsiliasi berjaya disimpan! ${idsToSave.length} silinder disahkan fizikal dan baki tersedia di stor dikemaskini kepada ${idsToSave.length}.`,
        });

        if (onReconciliationComplete) {
          void onReconciliationComplete();
        }

        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Error saving reconciliation:', err);
      setFeedback({ type: 'error', message: err.message || 'Ralat menyimpan rekonsiliasi ke pangkalan data.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !combo) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      showCloseButton={false}
      className="w-full max-w-6xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-slate-950"
      contentClassName="p-0 overflow-y-auto max-h-[90vh]"
    >
      <div className="flex flex-col text-slate-800 dark:text-slate-100 font-sans">
        
        {/* ========================================================= */}
        {/* 1. MALAYSIAN GOVERNMENT STATUTORY DOCUMENT HEADER */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Jata Negara Official Federal Crest */}
            <div className="w-12 h-12 shrink-0 bg-white/5 p-1 rounded-xl border border-white/10 flex items-center justify-center">
              <img 
                src={JATA_NEGARA_BASE64} 
                alt="Jata Negara Malaysia" 
                className="h-9 w-auto object-contain filter drop-shadow" 
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                  KEMENTERIAN KESIHATAN MALAYSIA
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[10px] font-semibold text-slate-300">
                  HOSPITAL LAWAS, SARAWAK
                </span>
              </div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>BORANG PEMERIKSAAN & REKONSILIASI STOK SILINDER OKSIGEN</span>
              </h1>
              <p className="text-[11px] text-slate-300">
                Tatacara Pengurusan Stor Kerajaan (Pindaan TPS / KEW.PS-14) — Audit Fizikal Nombor Siri Silinder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="bg-white/10 text-slate-200 border border-white/15 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                KOD: KEW.PS-14
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Close Form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SPECIFICATION STRIP & STATUTORY TELEMETRY CARDS */}
        {/* ========================================================= */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          
          {/* Cylinder Master Spec Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {combo.display_name}
                  </h2>
                  <span className="bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-700">
                    Aset Gas Perubatan
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fasiliti: Stor Pusat Farmasi Bekalan • Kuota Berdaftar: <strong className="font-mono text-slate-700 dark:text-slate-300">{stats.total} Tabung</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate('/pharmacy/oxygen/reconciliation');
                }}
                className="text-xs font-bold border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 py-1.5 px-3 rounded-lg"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Pengimbas Kamera Penuh</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
              </Button>
            </div>
          </div>

          {/* 4 Clean Statutory Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. Store Expected Balance */}
            <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold">Baki Rekod Stor</span>
                <Warehouse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {stats.storeTotal}
                </span>
                <span className="text-xs font-semibold text-slate-500">Tabung</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Stok penuh sedia di stor</p>
            </div>

            {/* 2. Store Physically Verified */}
            <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold">Disahkan Fizikal</span>
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-teal-700 dark:text-teal-400">
                  {stats.storeVerified}
                </span>
                <span className="text-xs font-semibold text-slate-500">/ {stats.storeTotal}</span>
              </div>
              <div className="mt-1">
                {stats.isStoreComplete ? (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    100% Sepadan di Stor
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Baki: {stats.storeTotal - stats.storeVerified} Belum Disahkan
                  </span>
                )}
              </div>
            </div>

            {/* 3. In Clinical Wards */}
            <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold">Di Wad / Unit</span>
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-blue-700 dark:text-blue-400">
                  {stats.wardTotal}
                </span>
                <span className="text-xs font-semibold text-slate-500">Tabung</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Kegunaan klinikal pesakit</p>
            </div>

            {/* 4. With Supplier */}
            <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold">Di Pembekal</span>
                <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-purple-700 dark:text-purple-400">
                  {stats.supplierTotal}
                </span>
                <span className="text-xs font-semibold text-slate-500">Tabung</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Proses pengisian semula Linde</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <span>Kemajuan Pemeriksaan Fizikal Stor:</span>
              <span className="font-mono">
                {stats.storeTotal > 0 ? Math.round((stats.storeVerified / stats.storeTotal) * 100) : 0}% Selesai
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${stats.storeTotal > 0 ? Math.round((stats.storeVerified / stats.storeTotal) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. FEEDBACK NOTIFICATION BANNER */}
        {/* ========================================================= */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button 
              onClick={() => setFeedback(null)} 
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* UNMATCHED SCAN PROMPT: REGISTER NEW CYLINDER TO STORE IN 1-CLICK */}
        {unmatchedSerial && (
          <div className="mx-6 mt-3 p-3.5 bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-extrabold text-sm">
                  Silinder fizikal <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">{unmatchedSerial}</span> belum berdaftar dalam sistem!
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 font-medium">
                  Adakah anda ingin mendaftarkan silinder ini ke Stor Pusat dan mengesahkannya dalam rekonsiliasi ini?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                disabled={isRegisteringUnmatched}
                onClick={() => handleRegisterCylinder(unmatchedSerial)}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRegisteringUnmatched ? 'Mendaftarkan...' : '+ Daftar & Sahkan ke Stor'}</span>
              </Button>
              <button
                type="button"
                onClick={() => setUnmatchedSerial(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. PROFESSIONAL TOOLBAR: SCANNER, SEARCH & ACTIONS */}
        {/* ========================================================= */}
        <div className="px-6 pt-5 pb-3 space-y-3">
          
          {/* Location Segmented Controls + Batch Actions */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Segmented Location Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setLocationFilter('store')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  locationFilter === 'store'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rak Stor Pusat ({stats.storeTotal})</span>
              </button>
              
              <button
                type="button"
                onClick={() => setLocationFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  locationFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Semua Lokasi ({stats.total})</span>
              </button>

              <button
                type="button"
                onClick={() => setLocationFilter('ward')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  locationFilter === 'ward'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Di Wad ({stats.wardTotal})</span>
              </button>

              <button
                type="button"
                onClick={() => setLocationFilter('supplier')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  locationFilter === 'supplier'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-purple-600" />
                <span>Di Pembekal ({stats.supplierTotal})</span>
              </button>
            </div>

            {/* Quick Actions: Add New Cylinder & Batch Verify */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button
                type="button"
                onClick={() => setIsAddCylinderOpen(!isAddCylinderOpen)}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                title="Daftar silinder baharu dengan No. Siri & QR ke Stor"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Silinder Baharu</span>
              </Button>

              <Button
                type="button"
                onClick={handleVerifyAllInStore}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                title="Sahkan semua silinder di rak stor sekaligus"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Sahkan Semua ({stats.storeTotal})</span>
              </Button>
            </div>
          </div>

          {/* Quick Cylinder Registration Drawer / Card */}
          {isAddCylinderOpen && (
            <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl space-y-3 animate-in fade-in duration-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-teal-950 dark:text-teal-200 uppercase tracking-wide block">
                      Daftar Silinder Baharu ke Stok Sedia Ada di Stor
                    </span>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                      Kategori: {combo.display_name}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCylinderOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualSerialInput.trim()) {
                    setIsManualSubmitting(true);
                    handleRegisterCylinder(manualSerialInput, manualQrInput || manualSerialInput);
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1"
              >
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    No. Siri Silinder (Fizikal) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={manualSerialInput}
                    onChange={(e) => setManualSerialInput(e.target.value)}
                    placeholder="cth: SABOXY-004200"
                    className="bg-white dark:bg-slate-800 text-xs font-mono py-1.5 border-slate-300 dark:border-slate-700 rounded-lg w-full uppercase"
                    required
                    autoFocus
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Kod QR / Kod Bar (Pilihan)
                  </label>
                  <Input
                    value={manualQrInput}
                    onChange={(e) => setManualQrInput(e.target.value)}
                    placeholder="Sama dengan No. Siri jika kosong"
                    className="bg-white dark:bg-slate-800 text-xs font-mono py-1.5 border-slate-300 dark:border-slate-700 rounded-lg w-full uppercase"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button
                    type="submit"
                    disabled={isManualSubmitting || !manualSerialInput.trim()}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isManualSubmitting ? 'Mendaftar...' : 'Daftar & Sahkan'}</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Search and Barcode Input Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            
            {/* Barcode / QR Gun Scanner Input (7 cols) */}
            <form onSubmit={handleScanSubmit} className="md:col-span-7 flex items-center gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  ref={scanInputRef}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Imbas Kod Bar / Taip No. Siri Silinder (cth: SABOXY-001001)..."
                  className="pl-9 pr-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg w-full"
                />
              </div>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shrink-0 shadow-sm"
              >
                Sahkan
              </Button>
            </form>

            {/* Live Filter Search (5 cols) */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter serial / location list..."
                className="pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. STATUTORY REGISTER TABLE (KEW.PS-14 STYLE) */}
        {/* ========================================================= */}
        <div className="px-6 py-2">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
            {isLoading ? (
              <div className="py-14 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-7 h-7 animate-spin mx-auto text-teal-600" />
                <p className="text-xs font-bold">Memuatkan daftar silinder fizikal dari pangkalan data...</p>
              </div>
            ) : filteredCylinders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-1">
                <AlertCircle className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Tiada rekod silinder sepadan dengan kriteria tapisan ini.
                </p>
                <p className="text-[11px] text-slate-400">
                  Cuba tukar tab lokasi atau kosongkan medan carian.
                </p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/90 sticky top-0 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 z-10">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Bil.</th>
                      <th className="py-3 px-4 min-w-[200px]">No. Siri Silinder (Aset)</th>
                      <th className="py-3 px-4 min-w-[170px]">Lokasi Semasa</th>
                      <th className="py-3 px-4 min-w-[130px]">Status Gas</th>
                      <th className="py-3 px-4 text-center min-w-[140px]">Status Pengesahan</th>
                      <th className="py-3 px-4 text-center min-w-[120px]">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {filteredCylinders.map((cyl, idx) => {
                      const isVerified = verifiedIds.has(cyl.id);
                      const loc = ((typeof cyl.current_location === 'object' ? cyl.current_location?.location_name : cyl.current_location) || '').toLowerCase();
                      const isStore = loc.includes('store') || loc.includes('stor') || loc.includes('farmasi');

                      return (
                        <tr
                          key={cyl.id}
                          className={`transition-colors ${
                            isVerified 
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30' 
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {/* 1. Index */}
                          <td className="py-2.5 px-4 text-center font-mono text-slate-400 text-xs">
                            {idx + 1}
                          </td>

                          {/* 2. Serial Number */}
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{cyl.serial_number}</span>
                              {isVerified && (
                                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Sah</span>
                                </span>
                              )}
                            </div>
                            {cyl.qr_code && cyl.qr_code !== cyl.serial_number && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                QR: {cyl.qr_code}
                              </span>
                            )}
                          </td>

                          {/* 3. Current Location */}
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                              isStore 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}>
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{(typeof cyl.current_location === 'object' ? cyl.current_location?.location_name : cyl.current_location) || 'Pharmacy Store'}</span>
                            </span>
                          </td>

                          {/* 4. Gas Status */}
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-block ${
                              cyl.status === 'available' || cyl.status === 'full'
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                                : cyl.status === 'empty'
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                                : cyl.status === 'returned_to_supplier'
                                ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300'
                                : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                            }`}>
                              {cyl.status === 'available' ? 'Penuh / Sedia' : cyl.status}
                            </span>
                          </td>

                          {/* 5. Verification Status */}
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            {isVerified ? (
                              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Disahkan Fizikal</span>
                              </span>
                            ) : (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg text-[10px] font-semibold inline-block">
                                Belum Disahkan
                              </span>
                            )}
                          </td>

                          {/* 6. Action Button */}
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <Button
                              type="button"
                              variant={isVerified ? "outline" : "default"}
                              onClick={() => handleToggleVerify(cyl.id)}
                              className={`text-[11px] font-bold py-1 px-3 rounded-lg shadow-sm ${
                                isVerified
                                  ? 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                                  : 'bg-teal-600 hover:bg-teal-700 text-white'
                              }`}
                            >
                              {isVerified ? 'Cancel Verification' : 'Sahkan'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. OFFICIAL STATUTORY SIGN-OFF & DECLARATION */}
        {/* ========================================================= */}
        <div className="mx-6 my-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Perakuan Pegawai Pemeriksa (KEW.PS-14)
            </h3>
            <span className="text-[10px] text-slate-400 italic ml-auto">
              Mengikut Tatacara Pengurusan Stor Perbendaharaan Malaysia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Auditor Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Pegawai Pemeriksa *
              </label>
              <Input
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="text-xs py-1.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            {/* Officer Designation */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jawatan & Unit Bertanggungjawab
              </label>
              <Input
                value={officerPost}
                onChange={(e) => setOfficerPost(e.target.value)}
                className="text-xs py-1.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            {/* Audit Remarks */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Ulasan Pemeriksaan
              </label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Contoh: Kiraan fizikal di stor sepadan dengan sistem..."
                className="text-xs py-1.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. MODAL FOOTER ACTIONS */}
        {/* ========================================================= */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/pharmacy/oxygen/ledger');
            }}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Lihat Kad Petak (KEW.PS-4)</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold px-4 py-2"
            >
              Batal
            </Button>

            <Button
              type="button"
              onClick={handleSaveReconciliation}
              disabled={isSubmitting || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-2 shadow-md active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? 'Menyimpan Rekod...' 
                  : `Save & Confirm Reconciliation (${verifiedIds.size} Tabung)`
                }
              </span>
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
