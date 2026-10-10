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
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import {
  offlineAwareSearchCylinders,
  offlineAwareGetCylinderByCode,
  offlineAwareGetSuppliers,
  offlineAwareGetCombos,
  offlineAwareReceiveDocument,
  isNetworkAvailable,
} from '@/modules/mycylinder/services/cylinderOfflineService';
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

const extractLocationName = (loc: any, fallback = 'Supplier'): string => {
  if (!loc) return fallback;
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object') {
    return loc.location_name || loc.name || loc.department_name || loc.location_code || fallback;
  }
  return String(loc);
};

export const CreateReceiveDocumentModal: React.FC<CreateReceiveDocumentModalProps> = ({
  hospitalId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { language } = useLanguage();

  // Network & Offline states
  const [isOnline, setIsOnline] = useState(() => isNetworkAvailable());
  const [isOperatingOffline, setIsOperatingOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [manualQrInput, setManualQrInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanSuccessFlash, setScanSuccessFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedRef = useRef<{ code: string; ts: number } | null>(null);
  const stagedCylindersRef = useRef<StagedCylinder[]>(stagedCylinders);

  useEffect(() => {
    stagedCylindersRef.current = stagedCylinders;
  }, [stagedCylinders]);

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

  // Load suppliers and combos on open (offline-aware)
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
        const sups = await offlineAwareGetSuppliers();
        setSuppliers(sups);
        if (sups.length > 0 && !selectedSupplier) {
          setSelectedSupplier(sups[0].id);
        }

        const comboData = await offlineAwareGetCombos();
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsStartingCamera(false);
  };

  useEffect(() => {
    if (!isOpen || ingestMode !== 'qr') {
      stopCamera();
    }
  }, [isOpen, ingestMode]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Real-time Search (offline-aware)
  useEffect(() => {
    if (!isOpen || !hospitalId || ingestMode !== 'search') return;

    let isMounted = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const filterStatus = filterMode === 'at_supplier' ? 'returned_to_supplier' : undefined;
        const res = await offlineAwareSearchCylinders(hospitalId, searchTerm, filterStatus);
        if (isMounted) {
          setSearchResults(res.data || []);
          setIsOperatingOffline(!!res.isOffline);
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

  // Start Camera QR Scanner with progressive constraint fallbacks
  const startCamera = async () => {
    stopCamera();
    setErrorMessage(null);
    setIsStartingCamera(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsStartingCamera(false);
      setErrorMessage(
        language === 'ms'
          ? 'Pelayar tidak menyokong akses kamera atau sambungan tidak selamat (HTTPS/localhost diperlukan).'
          : 'Browser does not support camera access or connection is not secure (HTTPS/localhost required).'
      );
      return;
    }

    const constraintsToTry: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: 'environment' } } },
      { video: { facingMode: 'environment' } },
      { video: { facingMode: 'user' } },
      { video: true },
    ];

    let mediaStream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintsToTry) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (mediaStream) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (mediaStream) {
      streamRef.current = mediaStream;
      setCameraActive(true);
      setIsStartingCamera(false);
    } else {
      console.error('Failed to access camera:', lastError);
      setIsStartingCamera(false);
      setErrorMessage(
        language === 'ms'
          ? 'Kamera tidak dapat diakses. Sila pastikan kebenaran kamera dibenarkan atau gunakan kemasukan manual.'
          : 'Unable to access camera. Please allow camera permissions or enter code manually.'
      );
    }
  };

  // Safely bind video stream and run QR scanning loop
  useEffect(() => {
    let animFrameId: number;
    let running = false;

    if (cameraActive && streamRef.current) {
      const stream = streamRef.current;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(err => {
          console.warn('Video auto-play failed or was aborted:', err);
        });
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });

      const scanFrame = () => {
        if (!running) return;
        animFrameId = requestAnimationFrame(() => {
          if (
            videoRef.current &&
            videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
            context
          ) {
            const video = videoRef.current;
            const scale = Math.min(1, 640 / (video.videoWidth || 640));
            canvas.width = Math.floor((video.videoWidth || 640) * scale);
            canvas.height = Math.floor((video.videoHeight || 480) * scale);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (code && code.data) {
              const scannedText = code.data.trim();
              const now = Date.now();
              const last = lastScannedRef.current;

              if (!last || last.code !== scannedText || now - last.ts > 2000) {
                lastScannedRef.current = { code: scannedText, ts: now };
                setScanSuccessFlash(true);
                setTimeout(() => setScanSuccessFlash(false), 300);
                void handleIngestCode(scannedText);
              }
            }
          }
          if (running) {
            setTimeout(scanFrame, 150);
          }
        });
      };

      running = true;
      scanFrame();
    }

    return () => {
      running = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [cameraActive]);

  // Ingest scanned code or manual QR
  const handleIngestCode = async (rawCode: string) => {
    let code = rawCode.trim();
    if (!code) return;

    // Support QR codes containing URLs
    if (code.startsWith('http://') || code.startsWith('https://')) {
      try {
        const url = new URL(code);
        const codeParam =
          url.searchParams.get('code') ||
          url.searchParams.get('qr') ||
          url.searchParams.get('serial') ||
          url.searchParams.get('sn');
        if (codeParam) {
          code = codeParam;
        } else {
          const parts = url.pathname.split('/').filter(Boolean);
          if (parts.length > 0) {
            code = parts[parts.length - 1];
          }
        }
      } catch {
        // Fallback to raw string
      }
    }
    code = code.trim().toUpperCase();

    const currentStagedIds = stagedCylindersRef.current.map(c => c.id);

    // Lookup via offline-aware helper passing already-staged cylinder IDs so partner twin cylinders (e.g. BN & PI) can both be staged
    try {
      const res = await offlineAwareGetCylinderByCode(hospitalId, code, {
        excludeIds: currentStagedIds,
      });
      const match = res.data;

      if (match) {
        // If this exact cylinder ID is already staged, notify user
        if (currentStagedIds.includes(match.id)) {
          setErrorMessage(
            language === 'ms'
              ? `Silinder ${match.serial_number} already exists in the receiving list!`
              : `Cylinder ${match.serial_number} is already in the received batch!`
          );
          return;
        }

        // Exists in database or local offline cache
        playBeep();
        addCylinderToStaging(match);
        const valveLabel = match.type_info?.name || (match.type_info?.code === 'PI' ? 'Pin Index' : match.type_info?.code === 'BN' ? 'Bullnose' : '');
        const valveSuffix = valveLabel ? ` (${valveLabel})` : '';
        setSuccessMessage(
          language === 'ms'
            ? `Silinder ${match.serial_number}${valveSuffix} ditambah! ${res.isOffline ? '(Mod Luar Talian)' : ''}`
            : `Cylinder ${match.serial_number}${valveSuffix} added! ${res.isOffline ? '(Offline Mode)' : ''}`
        );
      } else {
        // If no more un-staged cylinders match, check if one or more variants were already staged
        const cleanUpper = code.trim().toUpperCase();
        const bareClean = cleanUpper
          .replace(/^(?:O2-|02-)/i, '')
          .replace(/^(.*?)(?:[\s_/(]+|-)(PI|PIN\s*INDEX|PIN|BN|BULLNOSE|BULL)[\s_/)]*$/i, '$1')
          .trim();

        const alreadyStaged = stagedCylindersRef.current.filter(c => {
          const snUpper = (c.serial_number || '').toUpperCase();
          const qrUpper = (c.qr_code || '').toUpperCase();
          return snUpper.includes(bareClean) || qrUpper.includes(bareClean) || (bareClean.length >= 4 && (snUpper.endsWith(bareClean) || qrUpper.endsWith(bareClean)));
        });

        if (alreadyStaged.length > 0) {
          setErrorMessage(
            language === 'ms'
              ? `Silinder ${code} (kesemua ${alreadyStaged.length} varian) already exists in the receiving list!`
              : `Cylinder ${code} (all ${alreadyStaged.length} variants) is already in the received batch!`
          );
          return;
        }

        // Truly not found -> prompt new registration
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
    if (stagedCylindersRef.current.some(c => c.id === cyl.id)) return;

    const sizeCode = cyl.size_info?.code || '';
    const valveName = cyl.type_info?.name || (cyl.type_info?.code === 'PI' ? 'Pin Index' : cyl.type_info?.code === 'BN' ? 'Bullnose' : '');
    const displayName = (cyl as any).combo?.display_name || 
      (sizeCode && valveName ? `${sizeCode} (${valveName})` : valveName || sizeCode || 'Standard Cylinder');
    const locName = extractLocationName(cyl.current_location, 'Supplier');

    setStagedCylinders(prev => [
      ...prev,
      {
        id: cyl.id,
        serial_number: cyl.serial_number,
        qr_code: cyl.qr_code,
        type_name: displayName,
        status: cyl.status,
        from_location: locName,
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
        ? `Silinder baru ${serial} added to the list!`
        : `New cylinder ${serial} staged for creation and reception!`
    );
  };

  // Submit Receive Batch (offline-aware)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedSupplier) {
      setErrorMessage(language === 'ms' ? 'Please select a supplier.' : 'Please select a supplier.');
      return;
    }

    if (stagedCylinders.length === 0) {
      setErrorMessage(
        language === 'ms'
          ? 'Please scan or select at least one cylinder to receive.'
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

      const res = await offlineAwareReceiveDocument(
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
        if (res.isOfflinePending) {
          setSuccessMessage(
            language === 'ms'
              ? `[MOD LUAR TALIAN] Berjaya menyimpan penerimaan ${stagedCylinders.length} silinder terus ke Stor Gas! Silinder kini sedia digunakan. Sistem akan menyegerakkannya secara automatik ke Supabase sebaik sahaja internet dikesan.`
              : `[OFFLINE MODE] Successfully received ${stagedCylinders.length} cylinders locally! Ready for immediate store use. Auto-sync to Supabase will trigger upon reconnection.`
          );
        } else {
          setSuccessMessage(
            language === 'ms'
              ? `Berjaya menerima ${stagedCylinders.length} silinder terus ke Stok Tersedia (Stor Gas Utama)! Dokumen: ${res.data.document_number}`
              : `Successfully received ${stagedCylinders.length} cylinders directly into Available Store Stock! Doc: ${res.data.document_number}`
          );
        }
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1600);
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
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-5xl xl:max-w-6xl w-full flex flex-col max-h-[92vh] overflow-hidden">
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
                {!isOnline ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    <WifiOff className="w-3 h-3 text-amber-700" />
                    <span>{language === 'ms' ? 'Mod Luar Talian (Offline)' : 'Offline Mode'}</span>
                  </span>
                ) : (
                  <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{language === 'ms' ? 'Atas Talian' : 'Online'}</span>
                  </span>
                )}
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

          {/* 2-Column Workspace: Left = Search/Scan, Right = Already Selected Cylinders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* COLUMN 1 (LEFT): List of Cylinders Being Searched / Scanner */}
            <div className="flex flex-col border border-slate-200/90 rounded-2xl bg-slate-50/50 p-4 h-[420px] lg:h-[490px]">
              {/* Ingestion Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl mb-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIngestMode('search')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    ingestMode === 'search'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{language === 'ms' ? 'Cari Database' : 'Search Database'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIngestMode('qr')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    ingestMode === 'qr'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{language === 'ms' ? 'Imbas QR / Kod Bar' : 'Scan QR / Barcode'}</span>
                </button>
              </div>

              {/* MODE 1: Database Search */}
              {ingestMode === 'search' && (
                <div className="flex-1 min-h-0 flex flex-col space-y-2.5">
                  {/* Search Input Field */}
                  <div className="relative shrink-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={
                        language === 'ms'
                          ? 'Cari no siri silinder dalam database (cth: saboxy-297)...'
                          : 'Search cylinder serial no in database (e.g. saboxy-297)...'
                      }
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    {isSearching ? (
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                    ) : searchTerm ? (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>

                  {/* Filter Mode Pills + Result Count */}
                  <div className="flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setFilterMode('at_supplier')}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
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
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                          filterMode === 'all'
                            ? 'bg-white text-emerald-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {language === 'ms' ? 'Semua Silinder' : 'All Cylinders'}
                      </button>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                      {searchResults.length} {language === 'ms' ? 'silinder' : 'cylinders'}
                    </span>
                  </div>

                  {/* Search Results List */}
                  <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-inner">
                    {searchResults.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs font-semibold space-y-1.5">
                        {isSearching ? (
                          <>
                            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin mb-1" />
                            <span>{language === 'ms' ? 'Mencari silinder...' : 'Searching cylinders...'}</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-6 h-6 text-slate-300 mb-1" />
                            <span>
                              {language === 'ms'
                                ? 'Tiada silinder sepadan dijumpai dalam pangkalan data.'
                                : 'No matching cylinders found in database.'}
                            </span>
                            {filterMode === 'at_supplier' && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                {language === 'ms' ? 'Cuba tukar ke penapis "Semua Silinder"' : 'Try switching to "All Cylinders" filter'}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      searchResults.map(cyl => {
                        const isAlreadyStaged = stagedCylinders.some(c => c.id === cyl.id);
                        const sizeCode = cyl.size_info?.code || '';
                        const valveName = cyl.type_info?.name || (cyl.type_info?.code === 'PI' ? 'Pin Index' : cyl.type_info?.code === 'BN' ? 'Bullnose' : '');
                        const displayName = (cyl as any).combo?.display_name || 
                          (sizeCode && valveName ? `${sizeCode} (${valveName})` : valveName || sizeCode || 'Standard Cylinder');
                        const locName = extractLocationName(cyl.current_location, '');
                        const isAtSupplier = cyl.status === 'returned_to_supplier' || locName.toLowerCase() === 'supplier';

                        return (
                          <div
                            key={cyl.id}
                            className={`p-2.5 flex items-center justify-between gap-2.5 transition-colors ${
                              isAlreadyStaged ? 'bg-emerald-50/60' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-[10px] font-extrabold text-slate-700 shrink-0">
                                O₂
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono text-xs font-extrabold text-slate-900 truncate">
                                    {cyl.serial_number}
                                  </span>
                                  {isAtSupplier && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                      {language === 'ms' ? 'Di Pembekal' : 'At Supplier'}
                                    </span>
                                  )}
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                    {cyl.status}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium block truncate">
                                  {displayName} • {language === 'ms' ? 'Lokasi:' : 'Loc:'} {extractLocationName(cyl.current_location, '-')}
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
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
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
              )}

              {/* MODE 2: QR Scanner / Barcode */}
              {ingestMode === 'qr' && (
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
                  {/* Camera View / Activator */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col items-center justify-center min-h-[170px] relative overflow-hidden">
                    {cameraActive ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute inset-4 border-2 border-dashed rounded-lg transition-all duration-300 pointer-events-none ${
                            scanSuccessFlash ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/70'
                          }`}
                        >
                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_#34d399] animate-pulse" />
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono rounded pointer-events-none">
                          {language === 'ms' ? 'Arahkan ke Kod QR / Barcode' : 'Aim at QR / Barcode'}
                        </div>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-all text-xs z-10"
                          title={language === 'ms' ? 'Tutup Kamera' : 'Close Camera'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 py-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            {language === 'ms' ? 'Imbas Kod QR Kamera Langsung' : 'Live Camera QR Scanner'}
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            {language === 'ms'
                              ? 'Aktifkan kamera untuk imbas silinder'
                              : 'Enable camera to scan cylinders'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={isStartingCamera}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 mx-auto transition-all shadow-sm"
                        >
                          {isStartingCamera ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{language === 'ms' ? 'Memulakan Kamera...' : 'Starting Camera...'}</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-3.5 h-3.5" />
                              <span>{language === 'ms' ? 'Buka Kamera' : 'Open Camera'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Manual Barcode / Scanner Gun Entry */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-slate-600">
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500 uppercase focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={!manualQrInput.trim()}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Form to Register Brand-New Scanned Cylinder */}
                  {showNewCylForm && (
                    <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl space-y-2 animate-in fade-in">
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
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-teal-800 font-medium">
                        {language === 'ms'
                          ? `No. siri "${newCylSerial}" belum wujud dalam pangkalan data. Pilih jenis untuk didaftarkan:`
                          : `Serial "${newCylSerial}" not found in database. Select cylinder type to register:`}
                      </p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newCylSerial}
                          onChange={e => setNewCylSerial(e.target.value)}
                          className="w-full bg-white border border-teal-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <select
                            value={newCylComboId}
                            onChange={e => setNewCylComboId(e.target.value)}
                            className="flex-1 bg-white border border-teal-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
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
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm shrink-0"
                          >
                            {language === 'ms' ? 'Daftar' : 'Register'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLUMN 2 (RIGHT): Cylinders to be Received (Already Selected) */}
            <div className="flex flex-col border border-slate-200/90 rounded-2xl bg-white p-4 h-[420px] lg:h-[490px] shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span>{language === 'ms' ? 'Silinder Dipilih' : 'Cylinders to be Received'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 tabular-nums">
                        {stagedCylinders.length}
                      </span>
                    </h3>
                  </div>
                </div>

                {stagedCylinders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStagedCylinders([])}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {language === 'ms' ? 'Kosongkan Semua' : 'Clear All'}
                  </button>
                )}
              </div>

              {/* Staged Cylinders List */}
              <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/40 divide-y divide-slate-100 shadow-inner">
                {stagedCylinders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs font-semibold space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-600">
                        {language === 'ms' ? 'Belum ada silinder dipilih' : 'No cylinders selected yet'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5 max-w-[240px]">
                        {language === 'ms'
                          ? 'Pilih silinder dari senarai carian di sebelah kiri atau imbas kod QR.'
                          : 'Select cylinders from the search list on the left or scan QR.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  stagedCylinders.map((cyl, idx) => (
                    <div key={cyl.id} className="p-2.5 flex items-center justify-between gap-2.5 hover:bg-white transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-extrabold text-slate-900 truncate">
                              {cyl.serial_number}
                            </span>
                            {cyl.isNew && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block truncate">
                            {cyl.type_name} • {language === 'ms' ? 'Dari:' : 'From:'} {extractLocationName(cyl.from_location, 'Supplier')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {language === 'ms' ? 'Ke: Stor (Tersedia)' : 'To: Store (Available)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCylinderFromStaging(cyl.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Staged Summary Footer */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 shrink-0">
                <span>{language === 'ms' ? 'Jumlah Silinder Dipilih:' : 'Total Selected Cylinders:'}</span>
                <span className="text-emerald-700 font-extrabold tabular-nums">
                  {stagedCylinders.length} {language === 'ms' ? 'silinder' : 'cylinders'}
                </span>
              </div>
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
