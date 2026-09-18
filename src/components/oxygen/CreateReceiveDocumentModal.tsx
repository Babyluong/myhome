// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Calendar,
  Truck,
  FileText,
  Search,
  QrCode,
  Camera,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  Barcode,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import {
  createReceiveDocument,
  searchCylindersInDatabase,
} from '@/modules/mycylinder/services/oxygenService';
import type { OxygenCylinderWithRelations } from '@/types/pharmacy';

interface CreateReceiveDocumentModalProps {
  hospitalId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StagedCylinder {
  id: string;
  serial_number: string;
  qr_code?: string;
  type_name: string;
  status: string;
  from_location: string;
  isNew?: boolean;
  comboId?: string;
  sizeId?: string;
  typeId?: string;
}

export const CreateReceiveDocumentModal: React.FC<CreateReceiveDocumentModalProps> = ({
  hospitalId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { language } = useLanguage();

  // Header form states
  const [suppliers, setSuppliers] = useState<{ id: string; company_name: string }[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryOrderNo, setDeliveryOrderNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Mode: Database Search vs QR Scanner
  const [ingestMode, setIngestMode] = useState<'search' | 'qr'>('search');

  // Database Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'at_supplier' | 'all'>('at_supplier');
  const [searchResults, setSearchResults] = useState<OxygenCylinderWithRelations[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Combos list for new cylinder registration
  const [combos, setCombos] = useState<any[]>([]);
  const [newCylSerial, setNewCylSerial] = useState('');
  const [newCylComboId, setNewCylComboId] = useState('');
  const [showNewCylForm, setShowNewCylForm] = useState(false);

  // Staged Cylinders
  const [stagedCylinders, setStagedCylinders] = useState<StagedCylinder[]>([]);

  // QR / Camera scanning states
  const [cameraActive, setCameraActive] = useState(false);
  const [manualQrInput, setManualQrInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanSuccessFlash, setScanSuccessFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Beep sound function
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Ignore audio error
    }
  };

  // Load suppliers and combos on open
  useEffect(() => {
    if (!isOpen || !hospitalId) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setStagedCylinders([]);
    setSearchTerm('');
    setDeliveryOrderNo('');
    setRemarks('');
    setReceiveDate(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
      try {
        // Fetch suppliers
        const { data: sups } = await supabase
          .from('suppliers')
          .select('id, company_name')
          .eq('status', 'active');

        if (sups) {
          const filtered = sups.filter(s => {
            const n = (s.company_name || '').toLowerCase();
            return n.includes('linde') || n.includes('borneo indah');
          });
          const list = filtered.length > 0 ? filtered : sups;
          setSuppliers(list);
          if (list.length > 0 && !selectedSupplier) {
            setSelectedSupplier(list[0].id);
          }
        }

        // Fetch combos
        const { data: comboData } = await supabase
          .from('pharmacy_oxygen_size_type_combos')
          .select('id, size_id, type_id, display_name');

        if (comboData) {
          setCombos(comboData);
          if (comboData.length > 0) {
            setNewCylComboId(comboData[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading suppliers/combos:', err);
      }
    };

    void fetchData();
  }, [isOpen, hospitalId]);

  // Stop camera on unmount or mode change
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen || ingestMode !== 'qr') {
      stopCamera();
    }
  }, [isOpen, ingestMode]);

  // Real-time Database Search
  useEffect(() => {
    if (!isOpen || !hospitalId || ingestMode !== 'search') return;

    let isMounted = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const filterStatus = filterMode === 'at_supplier' ? 'returned_to_supplier' : undefined;
        const res = await searchCylindersInDatabase(hospitalId, searchTerm, filterStatus);
        if (isMounted) {
          setSearchResults(res.data || []);
        }
      } catch (err) {
        console.error('Error searching cylinders:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, hospitalId, searchTerm, filterMode, ingestMode]);

  // Start Camera QR Scanner
  const startCamera = async () => {
    stopCamera();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickQrScan);
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      setErrorMessage(
        language === 'ms'
          ? 'Kamera tidak dapat diakses. Sila gunakan kemasukan kod secara manual.'
          : 'Unable to access camera. Please enter code manually.'
      );
    }
  };

  // QR Scanning Loop using jsQR
  const tickQrScan = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (streamRef.current) requestAnimationFrame(tickQrScan);
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleIngestCode(code.data.trim());
        // Flash visual indicator
        setScanSuccessFlash(true);
        setTimeout(() => setScanSuccessFlash(false), 300);
        // Delay before scanning next to avoid duplicate instant scans
        setTimeout(() => {
          if (streamRef.current) requestAnimationFrame(tickQrScan);
        }, 1200);
        return;
      }
    }

    if (streamRef.current) {
      requestAnimationFrame(tickQrScan);
    }
  };

  // Ingest scanned code or manual QR
  const handleIngestCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    // Check if already staged
    if (stagedCylinders.some(c => c.serial_number.toUpperCase() === code || (c.qr_code && c.qr_code.toUpperCase() === code))) {
      setErrorMessage(
        language === 'ms'
          ? `Silinder ${code} sudah berada dalam senarai penerimaan!`
          : `Cylinder ${code} is already in the received batch!`
      );
      return;
    }

    // Lookup in database
    try {
      const res = await searchCylindersInDatabase(hospitalId, code);
      const match = res.data?.find(
        c => (c.serial_number || '').toUpperCase() === code || (c.qr_code || '').toUpperCase() === code
      );

      if (match) {
        // Exists in database
        playBeep();
        addCylinderToStaging(match);
        setSuccessMessage(
          language === 'ms'
            ? `Silinder sedia ada ${match.serial_number} ditambah!`
            : `Existing cylinder ${match.serial_number} added!`
        );
      } else {
        // Not found in database -> prompt new registration
        playBeep();
        setNewCylSerial(code);
        setShowNewCylForm(true);
      }
    } catch (err) {
      console.error('Error looking up scanned cylinder:', err);
    }
  };

  // Add an existing database cylinder to staged list
  const addCylinderToStaging = (cyl: OxygenCylinderWithRelations) => {
    if (stagedCylinders.some(c => c.id === cyl.id)) return;

    const displayName = (cyl as any).combo?.display_name || cyl.type_info?.name || 'Standard Cylinder';

    setStagedCylinders(prev => [
      ...prev,
      {
        id: cyl.id,
        serial_number: cyl.serial_number,
        qr_code: cyl.qr_code,
        type_name: displayName,
        status: cyl.status,
        from_location: cyl.current_location || 'Supplier',
      },
    ]);
  };

  // Remove cylinder from staged list
  const removeCylinderFromStaging = (id: string) => {
    setStagedCylinders(prev => prev.filter(c => c.id !== id));
  };

  // Add brand-new cylinder
  const handleAddNewCylinder = () => {
    const serial = newCylSerial.trim().toUpperCase();
    if (!serial) return;

    if (stagedCylinders.some(c => c.serial_number === serial)) {
      setErrorMessage(language === 'ms' ? 'No Siri ini sudah ditambah.' : 'This serial number is already added.');
      return;
    }

    const selectedCombo = combos.find(c => c.id === newCylComboId);
    const displayName = selectedCombo?.display_name || 'Standard Cylinder';

    setStagedCylinders(prev => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random()}`,
        serial_number: serial,
        qr_code: serial,
        type_name: displayName,
        status: 'new_registration',
        from_location: 'Supplier (New)',
        isNew: true,
        comboId: newCylComboId,
        sizeId: selectedCombo?.size_id,
        typeId: selectedCombo?.type_id,
      },
    ]);

    setNewCylSerial('');
    setShowNewCylForm(false);
    setSuccessMessage(
      language === 'ms'
        ? `Silinder baru ${serial} ditambah ke senarai!`
        : `New cylinder ${serial} staged for creation and reception!`
    );
  };

  // Submit Receive Batch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedSupplier) {
      setErrorMessage(language === 'ms' ? 'Sila pilih pembekal.' : 'Please select a supplier.');
      return;
    }

    if (stagedCylinders.length === 0) {
      setErrorMessage(
        language === 'ms'
          ? 'Sila imbas atau pilih sekurang-kurangnya satu silinder untuk diterima.'
          : 'Please scan or select at least one cylinder to receive.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const existingIds = stagedCylinders.filter(c => !c.isNew).map(c => c.id);
      const newCyls = stagedCylinders
        .filter(c => c.isNew)
        .map(c => ({
          serialNumber: c.serial_number,
          qrCode: c.qr_code || c.serial_number,
          comboId: c.comboId,
          sizeId: c.sizeId,
          typeId: c.typeId,
        }));

      const res = await createReceiveDocument(
        hospitalId,
        selectedSupplier,
        receiveDate,
        deliveryOrderNo,
        existingIds,
        remarks,
        user?.id || 'SYSTEM',
        newCyls
      );

      if (res.data) {
        setSuccessMessage(
          language === 'ms'
            ? `Berjaya menerima ${stagedCylinders.length} silinder terus ke Stok Tersedia (Stor Gas Utama)! Dokumen: ${res.data.document_number}`
            : `Successfully received ${stagedCylinders.length} cylinders directly into Available Store Stock! Doc: ${res.data.document_number}`
        );
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Failed to create receive document.');
      }
    } catch (err: any) {
      console.error('Error submitting receive document:', err);
      setErrorMessage(err.message || 'System error during cylinder reception.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{language === 'ms' ? 'Penerimaan Silinder Pembekal' : 'Receive Cylinders from Supplier'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {language === 'ms' ? 'Kredit Terus ke Stok Tersedia' : 'Direct to Available Stock'}
                </span>
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {language === 'ms'
                  ? 'Imbas QR atau cari no. siri untuk kemas kini silinder terus ke Stor Gas Utama (Tersedia)'
                  : 'Scan QR or search serial numbers to receive cylinders directly into Central Store (Available)'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Status Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs font-bold text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs font-bold text-emerald-700 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Top Form: Supplier, Date, DO Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            {/* Supplier Selector */}
            <div>
              <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider block mb-1.5">
                {language === 'ms' ? 'Pembekal Oksigen' : 'Oxygen Supplier'} *
              </label>
              <select
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Received Date */}
            <div>
              <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider block mb-1.5">
                {language === 'ms' ? 'Tarikh Terima' : 'Received Date'} *
              </label>
              <input
                type="date"
                value={receiveDate}
                onChange={e => setReceiveDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Delivery Order No */}
            <div>
              <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider block mb-1.5">
                {language === 'ms' ? 'No. Surat Hantaran (DO #)' : 'Delivery Order No. (DO #)'}
              </label>
              <input
                type="text"
                placeholder="cth: DO-2026-98102"
                value={deliveryOrderNo}
                onChange={e => setDeliveryOrderNo(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Mode Switcher: Search Database vs QR Scan */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIngestMode('search')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  ingestMode === 'search'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{language === 'ms' ? 'Cari No Siri Pangkalan Data' : 'Search Database Serial'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIngestMode('qr')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  ingestMode === 'qr'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{language === 'ms' ? 'Imbas Kod QR / Barcode' : 'Scan QR / Barcode'}</span>
              </button>
            </div>

            <span className="text-xs font-bold text-slate-500">
              {language === 'ms' ? 'Dipilih:' : 'Staged:'}{' '}
              <strong className="text-emerald-700 font-extrabold text-sm">{stagedCylinders.length}</strong>{' '}
              {language === 'ms' ? 'silinder' : 'cylinders'}
            </span>
          </div>

          {/* MODE 1: Database Search */}
          {ingestMode === 'search' && (
            <div className="space-y-4">
              {/* Search filter controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={
                      language === 'ms'
                        ? 'Cari no siri silinder dalam database (cth: saboxy-297, P101-F, 101-N)...'
                        : 'Search cylinder serial no in database (e.g. saboxy-297, P101-F, 101-N)...'
                    }
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  {isSearching && (
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFilterMode('at_supplier')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      filterMode === 'at_supplier'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {language === 'ms' ? 'Di Pembekal (Dipulangkan)' : 'At Supplier (Returned)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      filterMode === 'all'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {language === 'ms' ? 'Semua Silinder' : 'All Cylinders'}
                  </button>
                </div>
              </div>

              {/* Database Results List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-200/70">
                  {searchResults.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      {isSearching
                        ? language === 'ms' ? 'Mencari silinder...' : 'Searching cylinders...'
                        : language === 'ms'
                        ? 'Tiada silinder sepadan dijumpai dalam pangkalan data.'
                        : 'No matching cylinders found in database.'}
                    </div>
                  ) : (
                    searchResults.map(cyl => {
                      const isAlreadyStaged = stagedCylinders.some(c => c.id === cyl.id);
                      const displayName = (cyl as any).combo?.display_name || cyl.type_info?.name || 'Standard Cylinder';
                      const isAtSupplier = cyl.status === 'returned_to_supplier' || cyl.current_location === 'Supplier';

                      return (
                        <div
                          key={cyl.id}
                          className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                            isAlreadyStaged ? 'bg-emerald-50/60' : 'hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono text-[10px] font-extrabold text-slate-700">
                              O₂
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-extrabold text-slate-900">
                                  {cyl.serial_number}
                                </span>
                                {isAtSupplier && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    {language === 'ms' ? 'Di Pembekal' : 'At Supplier'}
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {cyl.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-semibold block">
                                {displayName} • {language === 'ms' ? 'Lokasi Semasa:' : 'Current Location:'} {cyl.current_location || '-'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (isAlreadyStaged) {
                                removeCylinderFromStaging(cyl.id);
                              } else {
                                addCylinderToStaging(cyl);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                              isAlreadyStaged
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            {isAlreadyStaged ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{language === 'ms' ? 'Ditambah' : 'Added'}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>{language === 'ms' ? 'Pilih' : 'Add'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: QR Scanner / Barcode */}
          {ingestMode === 'qr' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Camera View / Activator */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
                  {cameraActive ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      <video ref={videoRef} className="w-full h-full object-cover" />
                      {/* Scanning Reticle */}
                      <div
                        className={`absolute inset-6 border-2 border-dashed rounded-xl transition-all duration-300 pointer-events-none ${
                          scanSuccessFlash ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/70'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-3 py-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {language === 'ms' ? 'Imbas Kod QR Kamera Langsung' : 'Live Camera QR Scanner'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {language === 'ms'
                            ? 'Aktifkan kamera peranti untuk imbas silinder satu demi satu'
                            : 'Enable device camera to scan cylinders sequentially'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 mx-auto transition-all shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{language === 'ms' ? 'Buka Kamera' : 'Open Camera'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Manual Barcode / Scanner Gun Entry */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold uppercase text-slate-600">
                        {language === 'ms' ? 'Kemasukan Manual / Barcode Gun' : 'Manual / Scanner Gun Entry'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="text-slate-500 hover:text-slate-800 p-1 text-xs flex items-center gap-1"
                        title="Toggle sound"
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      {language === 'ms'
                        ? 'Taip no. siri atau imbas dengan scanner gun USB/Bluetooth. Tekan Enter untuk tambah.'
                        : 'Type serial no or scan with USB/Bluetooth scanner gun. Press Enter to add.'}
                    </p>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (manualQrInput.trim()) {
                          handleIngestCode(manualQrInput.trim());
                          setManualQrInput('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="cth: saboxy-297058 / P101-F-0199"
                        value={manualQrInput}
                        onChange={e => setManualQrInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500 uppercase"
                      />
                      <button
                        type="submit"
                        disabled={!manualQrInput.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  <div className="text-[10px] text-slate-400 font-semibold">
                    {language === 'ms'
                      ? 'Silinder yang wujud dalam sistem akan dipadankan secara automatik ke stok Tersedia.'
                      : 'Existing cylinders will automatically be matched and updated to Available stock.'}
                  </div>
                </div>
              </div>

              {/* Form to Register Brand-New Scanned Cylinder */}
              {showNewCylForm && (
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                      <Barcode className="w-4 h-4 text-teal-700" />
                      {language === 'ms' ? 'Daftar Silinder Baru Diterima' : 'Register Brand-New Received Cylinder'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNewCylForm(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-teal-800 font-medium">
                    {language === 'ms'
                      ? `No. siri "${newCylSerial}" belum wujud dalam pangkalan data. Sila pilih jenis silinder untuk didaftarkan dan diterima terus ke stok tersedia:`
                      : `Serial "${newCylSerial}" does not exist in the database yet. Select cylinder type to register and receive directly to Available stock:`}
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={newCylSerial}
                      onChange={e => setNewCylSerial(e.target.value)}
                      className="bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none"
                    />
                    <select
                      value={newCylComboId}
                      onChange={e => setNewCylComboId(e.target.value)}
                      className="flex-1 bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      {combos.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.display_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddNewCylinder}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm shrink-0"
                    >
                      {language === 'ms' ? 'Daftar & Tambah' : 'Register & Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Staged Cylinders List (Ready to Receive) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                {language === 'ms' ? 'Senarai Silinder Akan Diterima' : 'Cylinders to be Received'} ({stagedCylinders.length})
              </span>
              {stagedCylinders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStagedCylinders([])}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 transition-colors"
                >
                  {language === 'ms' ? 'Kosongkan Senarai' : 'Clear All'}
                </button>
              )}
            </div>

            <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-100">
              {stagedCylinders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  {language === 'ms'
                    ? 'Belum ada silinder dipilih. Imbas QR atau pilih dari pangkalan data di atas.'
                    : 'No cylinders selected yet. Scan QR or pick from database above.'}
                </div>
              ) : (
                stagedCylinders.map((cyl, idx) => (
                  <div key={cyl.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-slate-900">
                            {cyl.serial_number}
                          </span>
                          {cyl.isNew && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          {cyl.type_name} • {language === 'ms' ? 'Dari:' : 'From:'} {cyl.from_location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {language === 'ms' ? 'Ke: Stor (Tersedia)' : 'To: Store (Available)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCylinderFromStaging(cyl.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Remarks Input */}
          <div>
            <label className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider block mb-1.5">
              {language === 'ms' ? 'Catatan / Nota Penerimaan' : 'Remarks / Reception Notes'}
            </label>
            <input
              type="text"
              placeholder={
                language === 'ms'
                  ? 'cth: Silinder diisi semula dalam keadaan baik dari pembekal'
                  : 'e.g. Cylinders refilled in good physical condition from supplier'
              }
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            {language === 'ms' ? 'Batal' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={stagedCylinders.length === 0 || isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'ms' ? 'Memproses...' : 'Processing...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'ms'
                    ? `Sahkan & Tambah ${stagedCylinders.length} Silinder ke Stok Tersedia`
                    : `Confirm & Add ${stagedCylinders.length} Cylinders to Available Stock`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
