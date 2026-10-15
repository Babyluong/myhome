// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import jsQR from 'jsqr';
import { X, QrCode, AlertCircle, CheckCircle2, Camera, Volume2, VolumeX, Check, Plus, Trash2, Building2, Layers, Sparkles, ArrowRight, ListPlus, CheckCheck, Table, Wrench, RefreshCw, Pencil } from 'lucide-react'
import { getCylinderByQrOrSerial, registerScannedCylinderOnTheFly, updateCylinderValveType } from '@/services/pharmacy/oxygenService';
import { useAuthStore } from '@/stores/authStore';
import { EditCylinderModal } from '@/components/oxygen/EditCylinderModal';
import type { OxygenCylinderWithRelations } from '@/types/pharmacy';

export interface ScannedBatchItem {
  scanId: string;
  cylinder: OxygenCylinderWithRelations;
  status: string;
  unitLocation: string;
  scannedAt: string;
}

export const isStoreUnit = (unit?: string | null) => {
  if (!unit) return true;
  const u = (unit || '').toLowerCase();
  return u.includes('store') || u.includes('farmasi') || u.includes('depot');
};

export const RECONCILIATION_UNITS = [
  { id: 'Pharmacy Store', label: 'Pharmacy Store (Central)', icon: '🏬' },
  { id: 'Emergency & Trauma', label: 'Emergency & Trauma', icon: '🚨' },
  { id: 'Female Ward', label: 'Female Ward', icon: '🛏️' },
  { id: 'Male Ward', label: 'Male Ward', icon: '🛏️' },
  { id: 'Paediatric Ward', label: 'Paediatric Ward', icon: '👶' },
  { id: 'Unit Klinik Pakar', label: 'Unit Klinik Pakar', icon: '🩺' },
  { id: 'Radiology & Radiography', label: 'Radiology', icon: '🩻' },
  { id: 'Anaesthesiology / OT', label: 'Anaesthesiology (Anaes)', icon: '💉' },
  { id: 'Nephrology', label: 'Nephrology', icon: '🩺' },
  { id: 'General Ward', label: 'General Ward (Legacy)', icon: '🛏️' },
];

export const RECONCILIATION_STATUSES = [
  { id: 'available', label: 'Available (Store)', desc: 'Full cylinder ready in store' },
  { id: 'used', label: 'Used / In Use (Ward)', desc: 'In use or active in department / ward' },
  { id: 'empty', label: 'Empty (Store)', desc: 'Empty cylinder waiting in store' },
  { id: 'return', label: 'Return (Supplier)', desc: 'Returned back to supplier' },
];

interface ScanReconciliationModalProps {
  hospitalId: string;
  isOpen: boolean;
  onClose: () => void;
  onScanMatch: (cylinderId: string, status: string, unitLocation?: string) => void;
  onBatchScanMatch?: (items: { cylinderId: string; status: string; unitLocation?: string }[]) => void;
  onNewCylinderRegistered?: (cylinder: OxygenCylinderWithRelations) => void;
  onCylinderUpdated?: (cylinder: OxygenCylinderWithRelations) => void;
  existingCylinders: OxygenCylinderWithRelations[];
}

export const ScanReconciliationModal: React.FC<ScanReconciliationModalProps> = ({
  hospitalId,
  isOpen,
  onClose,
  onScanMatch,
  onBatchScanMatch,
  onNewCylinderRegistered,
  onCylinderUpdated,
  existingCylinders,
}) => {
  const { user } = useAuthStore();
  const [editingCylinder, setEditingCylinder] = useState<OxygenCylinderWithRelations | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Scanned Batch List Queue for Multi-Cylinder audit
  const [scannedBatch, setScannedBatch] = useState<ScannedBatchItem[]>([]);
  
  // Applied Items Summary (Track items applied to audit draft)
  const [appliedSummary, setAppliedSummary] = useState<ScannedBatchItem[]>([]);

  // Batch Defaults - Default to Pharmacy Store & available for store stock auditing
  const [batchUnit, setBatchUnit] = useState<string>('Pharmacy Store');
  const [batchStatus, setBatchStatus] = useState<string>('available');

  // Instant Auto-Register on Scan Mode
  const [autoRegisterOnScan, setAutoRegisterOnScan] = useState<boolean>(true);

  // Manual barcode/serial text input for handheld scanner / typing
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [successFlash, setSuccessFlash] = useState(false);

  // Camera settings
  const [cameraActive, setCameraActive] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Cooldown ref to prevent duplicate camera frame scans within 2 seconds
  const lastScannedRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  // Animation states
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Valve type correction state — tracks the last successfully scanned cylinder so staff can
  // fix wrong BN/PI classification immediately (QR labels do NOT encode valve type)
  const [lastScannedCylinder, setLastScannedCylinder] = useState<OxygenCylinderWithRelations | null>(null);
  const [isCorrectingValveType, setIsCorrectingValveType] = useState(false);

  // Disambiguation state — shown when same serial exists as both PI and BN
  const [ambiguousCylinders, setAmbiguousCylinders] = useState<OxygenCylinderWithRelations[]>([]);
  const [pendingScanCode, setPendingScanCode] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsAnimating(true), 20);
      setCameraActive(true); // Auto-activate camera when modal opens
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setCameraActive(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraActive]);

  // Canvas-based QR Code Detection using jsQR
  useEffect(() => {
    let detectorInterval: any;
    if (cameraActive && useRealCamera && stream && videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });

      detectorInterval = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code && code.data) {
              handleCodeLookup(code.data);
            }
          }
        }
      }, 500);
    }
    return () => {
      if (detectorInterval) clearInterval(detectorInterval);
    };
  }, [cameraActive, useRealCamera, stream]);

  const playBeep = (type: 'success' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioCtx.close();
        }, 120);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioCtx.close();
        }, 280);
      }
    } catch (e) {
      console.warn("Could not play sound:", e);
    }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      setUseRealCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.warn("Webcam fallback triggered.", err);
      setUseRealCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseRealCamera(false);
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive, useRealCamera]);

  const handleCodeLookup = async (code: string) => {
    let cleaned = code.trim();
    if (!cleaned) return;

    // Cooldown check to prevent camera from re-scanning exact same frame 10 times
    const now = Date.now();
    if (lastScannedRef.current.code.toLowerCase() === cleaned.toLowerCase() && (now - lastScannedRef.current.time) < 2000) {
      return;
    }
    lastScannedRef.current = { code: cleaned, time: now };

    // Support QR codes that are URLs
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      try {
        const url = new URL(cleaned);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          cleaned = pathSegments[pathSegments.length - 1];
        }
      } catch (err) {
        console.error("Failed to parse scanned URL:", err);
      }
    }

    setStatusMessage(null);
    setAmbiguousCylinders([]);
    setPendingScanCode('');

    try {
      const q = String(cleaned || '').toLowerCase();

      // 1. Collect ALL exact matches by serial number or QR code
      let exactMatches = existingCylinders.filter(
        c => String(c.serial_number || '').toLowerCase() === q ||
             String(c.qr_code_value || c.qr_code || '').toLowerCase() === q
      );

      // 2. Partial / contains match (e.g. "sabox", "0071", "P101") — only if no exact match
      if (exactMatches.length === 0) {
        exactMatches = existingCylinders.filter(c => {
          const sn = String(c.serial_number || '').toLowerCase();
          const qr = String(c.qr_code_value || c.qr_code || '').toLowerCase();
          const typeName = String(c.type_info?.type_name || c.type_info?.name || '').toLowerCase();
          const sizeCode = String(c.size_info?.code || c.size_info?.size_code || c.size_info?.capacity || '').toLowerCase();
          return sn.includes(q) || qr.includes(q) || typeName.includes(q) || sizeCode.includes(q);
        });
      }

      // ── Disambiguation check: if multiple distinct valve-type records match, prompt user ──
      if (exactMatches.length > 1) {
        const valveCodes = [...new Set(exactMatches.map(c => (c.type_info?.code || '').toUpperCase()))];
        const hasMultipleValves = valveCodes.length > 1 && valveCodes.some(v => v === 'PI' || v === 'BN');
        if (hasMultipleValves) {
          // Sort: BN first, then PI
          const sorted = [...exactMatches].sort((a, b) => {
            const aCode = (a.type_info?.code || '').toUpperCase();
            const bCode = (b.type_info?.code || '').toUpperCase();
            if (aCode === 'BN' && bCode !== 'BN') return -1;
            if (bCode === 'BN' && aCode !== 'BN') return 1;
            return 0;
          });
          setAmbiguousCylinders(sorted);
          setPendingScanCode(cleaned);
          setStatusMessage({
            type: 'info',
            text: `Found ${sorted.length} cylinders with serial "${cleaned}" — different valve types detected. Please select the correct one below.`
          });
          return; // Wait for user to pick
        }
      }

      let cyl = exactMatches.length > 0 ? exactMatches[0] : undefined;

      // 3. Database lookup via service (if not found locally)
      if (!cyl) {
        try {
          const res = await getCylinderByQrOrSerial(hospitalId, cleaned);
          if (res.data && !res.error) {
            cyl = res.data;
          }
        } catch (dbErr) {
          console.warn('DB lookup exception:', dbErr);
        }
      }

      // 4. Auto-Register or Update Location/Auditor in Database
      const auditorName = user?.full_name || user?.name || user?.email || 'Staff Pharmacist';
      let wasAutoRegistered = false;
      try {
        const autoRes = await registerScannedCylinderOnTheFly(hospitalId, cleaned, {
          location: batchUnit,
          status: batchStatus === 'used' ? 'issued' : batchStatus,
          userId: user?.id,
          userName: auditorName,
        });
        if (autoRes.data && !autoRes.error) {
          cyl = autoRes.data;
          wasAutoRegistered = true;
          if (onNewCylinderRegistered) {
            onNewCylinderRegistered(cyl);
          }
        } else if (autoRes.error) {
          console.error('Auto-registration error:', autoRes.error);
        }
      } catch (autoErr) {
        console.error('Auto-registration exception:', autoErr);
      }

      if (cyl) {
        playBeep('success');
        setSuccessFlash(true);
        setTimeout(() => setSuccessFlash(false), 500);

        // Immediately sync with parent audit table in real time
        if (onScanMatch) {
          onScanMatch(cyl.id, batchStatus, batchUnit);
        }

        // Deduplicate or add to batch queue
        const currentCyl = cyl;
        setScannedBatch(prev => {
          const existingIdx = prev.findIndex(item => item.cylinder.id === currentCyl.id);
          if (existingIdx !== -1) {
            // Already scanned: update unit/status and bring to front
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              unitLocation: batchUnit,
              status: batchStatus,
              scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            return updated;
          } else {
            // New scan: append to batch
            const newItem: ScannedBatchItem = {
              scanId: `scan-${Date.now()}-${Math.random()}`,
              cylinder: currentCyl,
              status: batchStatus,
              unitLocation: batchUnit,
              scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            return [newItem, ...prev];
          }
        });

        setStatusMessage({
          type: 'success',
          text: wasAutoRegistered
            ? `⚡ Auto-Registered & Added: ${cyl.serial_number} (${cyl.type_info?.type_name || 'Standard'}) → Assigned to ${batchUnit}`
            : `Added Cylinder: ${cyl.serial_number} → Assigned to ${batchUnit}`
        });

        // Track for valve type correction (QR labels do NOT encode valve type)
        setLastScannedCylinder(cyl);
      } else {
        playBeep('error');
        setStatusMessage({
          type: 'error',
          text: `Cylinder "${cleaned}" could not be found or registered.`
        });
      }
    } catch (err: any) {
      console.error(err);
      playBeep('error');
      setStatusMessage({
        type: 'error',
        text: err?.message ? `Scan error: ${err.message}` : 'Error processing scanned code.'
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCodeInput.trim()) {
      handleCodeLookup(manualCodeInput.trim());
      setManualCodeInput('');
    }
  };

  const handleUpdateItemStatus = (scanId: string, newStatus: string) => {
    setScannedBatch(prev => prev.map(item => item.scanId === scanId ? { ...item, status: newStatus } : item));
  };

  const handleUpdateItemUnit = (scanId: string, newUnit: string) => {
    setScannedBatch(prev => prev.map(item => {
      if (item.scanId === scanId) {
        const autoStatus = isStoreUnit(newUnit) ? 'available' : 'used';
        return { ...item, unitLocation: newUnit, status: autoStatus };
      }
      return item;
    }));
  };

  const handleRemoveBatchItem = (scanId: string) => {
    setScannedBatch(prev => prev.filter(item => item.scanId !== scanId));
  };

  // Called when user picks a specific cylinder from the disambiguation panel
  const handleSelectAmbiguous = (chosen: OxygenCylinderWithRelations) => {
    setAmbiguousCylinders([]);
    setPendingScanCode('');
    // Feed chosen cylinder directly into the scan flow
    playBeep('success');
    setSuccessFlash(true);
    setTimeout(() => setSuccessFlash(false), 500);

    if (onScanMatch) {
      onScanMatch(chosen.id, batchStatus, batchUnit);
    }

    setScannedBatch(prev => {
      const existingIdx = prev.findIndex(item => item.cylinder.id === chosen.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          unitLocation: batchUnit,
          status: batchStatus,
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        return updated;
      } else {
        const newItem: ScannedBatchItem = {
          scanId: `scan-${Date.now()}-${Math.random()}`,
          cylinder: chosen,
          status: batchStatus,
          unitLocation: batchUnit,
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        return [newItem, ...prev];
      }
    });

    const valveLabel = chosen.type_info?.code === 'BN' ? '🔵 Bullnose (BN)'
      : chosen.type_info?.code === 'PI' ? '🟣 Pin Index (PI)'
      : chosen.type_info?.code || 'Standard';
    setStatusMessage({
      type: 'success',
      text: `Added Cylinder: ${chosen.serial_number} [${valveLabel}] → Assigned to ${batchUnit}`
    });
    setLastScannedCylinder(chosen);
  };

  const handleApplyAllBatch = () => {
    if (scannedBatch.length === 0) return;

    if (onBatchScanMatch) {
      const itemsToMatch = scannedBatch.map(item => ({
        cylinderId: item.cylinder.id,
        status: item.status,
        unitLocation: item.unitLocation
      }));
      onBatchScanMatch(itemsToMatch);
    } else {
      scannedBatch.forEach(item => {
        onScanMatch(item.cylinder.id, item.status, item.unitLocation);
      });
    }

    playBeep('success');
    
    // Add to applied summary list
    setAppliedSummary(prev => [...scannedBatch, ...prev]);

    setStatusMessage({
      type: 'success',
      text: `Applied ${scannedBatch.length} cylinder(s) to Audit Table! Close scanner panel to review draft & save audit.`
    });

    setScannedBatch([]);
  };

  // Corrects valve type (BN/PI) for the last scanned cylinder.
  // QR labels on MOH cylinders only encode serial number — valve type must be verified physically.
  const handleCorrectValveType = async (targetCode: 'BN' | 'PI') => {
    if (!lastScannedCylinder || isCorrectingValveType) return;
    setIsCorrectingValveType(true);
    try {
      const userId = user?.id || undefined;
      const res = await updateCylinderValveType(hospitalId, lastScannedCylinder.id, targetCode, userId);
      if (res.error) {
        setStatusMessage({ type: 'error', text: `Valve type correction failed: ${res.error}` });
      } else {
        const valveLabel = targetCode === 'BN' ? 'Bullnose (BN)' : 'Pin Index (PI)';
        setStatusMessage({
          type: 'success',
          text: `✓ Valve type corrected → ${valveLabel} for ${lastScannedCylinder.serial_number}`
        });
        // Update the batch list
        const corrected = { ...lastScannedCylinder, type_info: { ...lastScannedCylinder.type_info, code: targetCode } };
        setScannedBatch(prev =>
          prev.map(item => item.cylinder.id === corrected.id
            ? { ...item, cylinder: corrected }
            : item
          )
        );
        setLastScannedCylinder(null);
      }
    } catch (err) {
      console.error('Valve type correction error:', err);
      setStatusMessage({ type: 'error', text: 'Failed to correct valve type.' });
    } finally {
      setIsCorrectingValveType(false);
    }
  };

  if (!isRendered) return null;

  const modalContent = (
    <div className={`fixed inset-0 z-[100] overflow-hidden flex justify-end transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-[transform,opacity,box-shadow,border-color] duration-300"
      />

      {/* Drawer Panel */}
      <div className={`relative w-full max-w-3xl bg-subtle/50 border-l border-border-default shadow-2xl flex flex-col h-full transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-900 to-emerald-900 border-b border-teal-950 text-white shadow-lg shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-md font-extrabold text-white tracking-tight leading-tight">Multi-Cylinder Audit Scanner</h3>
                <span className="text-[9px] font-black bg-teal-500/30 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Batch Mode</span>
              </div>
              <p className="text-teal-200/80 text-[11px] font-bold mt-0.5">Scan multiple cylinders & assign physical unit / location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-teal-950/60 hover:bg-teal-900 border border-teal-800 flex items-center justify-center transition-[transform,opacity,box-shadow,border-color] duration-200 cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Controls Bar & Sound Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface border border-border-default rounded-2xl p-4 shadow-xs gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-black text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" /> Continuous Batch Scanner
              </span>
              <span className="text-[11px] text-text-muted font-semibold">Scan cylinder after cylinder — ready for next scan immediately.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-[transform,opacity,box-shadow,border-color] cursor-pointer ${
                  soundEnabled 
                    ? 'bg-accent-base/10 border-accent-base/20 text-teal-700' 
                    : 'bg-subtle/50 border-border-default text-slate-400'
                }`}
                title="Toggle Beep Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundEnabled ? 'Beep ON' : 'Beep Muted'}</span>
              </button>
            </div>
          </div>

          {/* Auto-Register on Scan Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-500/20 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-400 dark:text-emerald-300 font-bold">
                    ⚡ Auto-Register Unknown Cylinders on Scan
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                    Live Supabase Sync
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
                  Scanning any unlisted physical cylinder tag will instantly create & register it in the database.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoRegisterOnScan(!autoRegisterOnScan)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-[transform,opacity,box-shadow,border-color] flex items-center justify-center gap-1.5 shrink-0 ${
                autoRegisterOnScan
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-subtle hover:bg-slate-300 text-text-secondary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {autoRegisterOnScan ? 'AUTO-REGISTER: ACTIVE' : 'AUTO-REGISTER: OFF'}
            </button>
          </div>

          {/* Scanner Console & Manual Entry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Camera View Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-inner text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-teal-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> Camera Scanner
                </span>
                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black font-mono transition-[transform,opacity,box-shadow,border-color] cursor-pointer ${
                    cameraActive 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {cameraActive ? 'PAUSE CAMERA' : 'START CAMERA'}
                </button>
              </div>

              {cameraActive ? (
                <div className={`relative aspect-video rounded-xl overflow-hidden border border-slate-750 bg-slate-950 flex flex-col items-center justify-center shadow-inner transition-[transform,opacity,box-shadow,border-color] duration-300 ${successFlash ? 'ring-4 ring-teal-400/50' : ''}`}>
                  {successFlash && (
                    <div className="absolute inset-0 bg-teal-500/20 backdrop-blur-xs flex items-center justify-center z-20">
                      <CheckCircle2 className="w-12 h-12 text-teal-400 animate-bounce" />
                    </div>
                  )}

                  {useRealCamera ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-4">
                      <QrCode className="w-8 h-8 text-teal-400/80 animate-pulse mb-2" />
                      <span className="text-[10px] font-bold text-slate-300 font-mono tracking-wider">AUTO SCANNER RUNNING</span>
                      <span className="text-[9px] text-text-muted font-mono mt-1">Point QR label to webcam stream</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-3 text-[8px] font-mono text-slate-400 select-none">
                    1080p &nbsp; MULTI-SCAN ENABLED
                  </div>

                  <div className="absolute inset-x-6 top-1/2 h-0.5 bg-teal-400 shadow-[0_0_8px_#2dd4bf] animate-[pulse_1.2s_infinite] z-10" />
                  <div className="absolute inset-4 border border-slate-500/20 rounded-lg pointer-events-none z-10">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-teal-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-teal-400" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-teal-400" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-teal-400" />
                  </div>
                </div>
              ) : (
                <div className="h-36 border border-dashed border-slate-700/60 rounded-xl flex flex-col items-center justify-center text-center p-4 bg-slate-950/40 text-slate-400">
                  <Camera className="w-6 h-6 mb-2 opacity-50 text-slate-300" />
                  <span className="text-[10px] font-bold font-mono tracking-wide uppercase">Camera view paused</span>
                  <span className="text-[9px] text-text-muted mt-1">Click START CAMERA to begin scanning QR code tags.</span>
                </div>
              )}
            </div>

            {/* Batch Defaults & Handheld Input Box */}
            <div className="bg-surface border border-border-default rounded-2xl p-4 space-y-3.5 shadow-xs flex flex-col justify-between">
              
              {/* Default Unit Setting */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" /> Target Unit / Location for Scans
                </label>
                <select
                  value={batchUnit}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    setBatchUnit(newUnit);
                    if (isStoreUnit(newUnit)) {
                      setBatchStatus('available');
                    } else {
                      setBatchStatus('used');
                    }
                  }}
                  className="w-full px-3 py-2 border border-border-default rounded-xl bg-subtle/50 text-xs font-bold text-text-primary focus:outline-none focus:border-teal-500 focus:bg-surface transition-[transform,opacity,box-shadow,border-color] cursor-pointer"
                >
                  {RECONCILIATION_UNITS.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.icon} {u.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Physical Status */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-teal-600" /> Default Physical Status for Scans
                </label>
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border-default rounded-xl bg-subtle/50 text-xs font-bold text-text-primary focus:outline-none focus:border-teal-500 focus:bg-surface transition-[transform,opacity,box-shadow,border-color] cursor-pointer"
                >
                  {RECONCILIATION_STATUSES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Serial Entry for Handheld Barcode Reader */}
              <form onSubmit={handleManualSubmit} className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-extrabold text-text-secondary font-bold uppercase tracking-wider">
                  Handheld Barcode / Serial Entry
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="e.g. O2-P101-F-0044..."
                    className="flex-1 px-3 py-2 border border-border-default rounded-xl text-xs font-mono font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal-500 transition-[transform,opacity,box-shadow,border-color]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-[transform,opacity,box-shadow,border-color] cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </form>

            </div>

          </div>

          {/* ── VALVE DISAMBIGUATION PANEL ────────────────────────────────────
              Shown when the same serial number maps to multiple cylinder records
              with different valve types (e.g. P101-F-0189 has both PI and BN). */}
          {ambiguousCylinders.length > 1 && (
            <div className="p-4 rounded-2xl border-2 border-violet-300 bg-violet-50 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-violet-900">Duplicate Serial — Select Valve Type</span>
                  <p className="text-[10px] text-violet-700 font-semibold mt-0.5 leading-snug">
                    Serial <span className="font-mono font-extrabold">{pendingScanCode}</span> is registered as <strong>{ambiguousCylinders.length} separate cylinders</strong> with different valve types.
                    Physically check the cylinder label and select the correct one:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setAmbiguousCylinders([]); setPendingScanCode(''); setStatusMessage(null); }}
                  className="text-violet-400 hover:text-violet-600 p-1 rounded cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] text-violet-600 font-bold uppercase tracking-wider shrink-0">Select →</span>
                {ambiguousCylinders.map(c => {
                  const code = (c.type_info?.code || '').toUpperCase();
                  const isBN = code === 'BN';
                  const isPI = code === 'PI';
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectAmbiguous(c)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-[transform,opacity,box-shadow,border-color] cursor-pointer border-2 flex flex-col items-center justify-center gap-1 shadow-xs hover:scale-[1.02] active:scale-95 ${
                        isBN ? 'bg-surface border-blue-300 text-blue-700 hover:bg-blue-500/10'
                        : isPI ? 'bg-surface border-purple-300 text-purple-700 hover:bg-indigo-500/10'
                        : 'bg-surface border-border-default text-text-secondary hover:bg-subtle/50'
                      }`}
                    >
                      <span className="text-base leading-none">{isBN ? '🔵' : isPI ? '🟣' : '⚪'}</span>
                      <span>{isBN ? 'Bullnose (BN)' : isPI ? 'Pin Index (PI)' : code || 'Standard'}</span>
                      <span className="text-[9px] font-mono opacity-60 truncate max-w-full px-1">{c.serial_number}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Message Notification Banner */}
          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs font-bold border flex items-start gap-3 transition-[transform,opacity,box-shadow,border-color] duration-300 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 dark:text-emerald-300 font-bold' 
                : statusMessage.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 dark:text-rose-300 font-bold'
                : 'bg-accent-base/10 border-accent-base/20 text-teal-900'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <p className="leading-snug font-bold">{statusMessage.text}</p>
                {statusMessage.type === 'success' && statusMessage.text.includes('Audit Table') && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 hover:text-emerald-400 dark:text-emerald-300 font-bold underline mt-1 cursor-pointer"
                  >
                    <Table className="w-3.5 h-3.5" /> Click here to close scanner & review Audit Table on Dashboard
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── VALVE TYPE CORRECTION PANEL ──────────────────────────────────
              QR labels on MOH cylinders do NOT encode valve type (BN/PI).
              Staff must visually confirm against the physical label sticker. */}
          {lastScannedCylinder && (
            <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-500/10 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-amber-400 dark:text-amber-300 font-bold">Verify Valve Type</span>
                    <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-500/20 px-2 py-0.5 rounded-md truncate">
                      {lastScannedCylinder.serial_number}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5 leading-snug">
                    QR labels do <strong>not</strong> encode valve type. Check the physical label sticker — Bullnose or Pin Index?
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Recorded as:</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      lastScannedCylinder.type_info?.code === 'BN'
                        ? 'bg-blue-100 text-blue-400 border-blue-500/20'
                        : lastScannedCylinder.type_info?.code === 'PI'
                        ? 'bg-purple-100 text-indigo-400 border-indigo-500/20'
                        : 'bg-subtle text-text-secondary border-border-default'
                    }`}>
                      {lastScannedCylinder.type_info?.code === 'BN'
                        ? '🔵 Bullnose (BN)'
                        : lastScannedCylinder.type_info?.code === 'PI'
                        ? '🟣 Pin Index (PI)'
                        : '⚪ Unknown'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLastScannedCylinder(null)}
                  className="text-amber-400 hover:text-amber-600 p-1 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider shrink-0">Fix to →</span>
                <button
                  type="button"
                  onClick={() => handleCorrectValveType('BN')}
                  disabled={isCorrectingValveType}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-[transform,opacity,box-shadow,border-color] cursor-pointer border-2 flex items-center justify-center gap-1.5 ${
                    lastScannedCylinder.type_info?.code === 'BN'
                      ? 'bg-blue-100 border-blue-300 text-blue-700 opacity-60 cursor-default'
                      : 'bg-surface border-blue-300 text-blue-700 hover:bg-blue-500/10 shadow-xs'
                  }`}
                >
                  🔵 Bullnose (BN)
                  {lastScannedCylinder.type_info?.code === 'BN' && <Check className="w-3 h-3 ml-1" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCorrectValveType('PI')}
                  disabled={isCorrectingValveType}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-[transform,opacity,box-shadow,border-color] cursor-pointer border-2 flex items-center justify-center gap-1.5 ${
                    lastScannedCylinder.type_info?.code === 'PI'
                      ? 'bg-purple-100 border-purple-300 text-purple-700 opacity-60 cursor-default'
                      : 'bg-surface border-purple-300 text-purple-700 hover:bg-indigo-500/10 shadow-xs'
                  }`}
                >
                  {isCorrectingValveType ? <RefreshCw className="w-3 h-3 animate-spin" /> : '🟣 Pin Index (PI)'}
                  {lastScannedCylinder.type_info?.code === 'PI' && <Check className="w-3 h-3 ml-1" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setEditingCylinder(lastScannedCylinder)}
                className="w-full py-2 rounded-xl text-xs font-bold border border-amber-300 bg-surface hover:bg-amber-100 text-amber-400 dark:text-amber-300 font-bold flex items-center justify-center gap-1.5 transition-[transform,opacity,box-shadow,border-color] cursor-pointer shadow-elevation-1"
                title="Update Cylinder Details (Serial No., Size, Valve)"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-700" />
                <span>Ubah Saiz & No. Siri Silinder / Edit Details</span>
              </button>
            </div>
          )}

          {/* APPLIED TO AUDIT DRAFT SUMMARY SECTION */}
          {appliedSummary.length > 0 && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-black uppercase text-emerald-400 dark:text-emerald-300 font-bold tracking-wider">
                    Applied to Reconciliation Audit Table ({appliedSummary.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-[transform,opacity,box-shadow,border-color] cursor-pointer"
                >
                  Close & Review Audit Table <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-emerald-400 font-semibold">
                The cylinders below have been applied to the <strong>Reconciliation Audit Table</strong> on the Oxygen Dashboard. Close this panel to review and save the final audit!
              </p>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pt-1">
                {appliedSummary.map(item => (
                  <span 
                    key={item.scanId}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-emerald-300 rounded-xl text-xs font-bold text-text-primary shadow-elevation-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3px]" />
                    <span className="font-mono text-text-primary">{item.cylinder.serial_number}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                      {item.status} ({item.unitLocation})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SCANNED BATCH QUEUE TABLE / LIST */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListPlus className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-extrabold text-text-primary tracking-tight">
                  Scanned Cylinder Queue
                </h4>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-accent-base/20">
                  {scannedBatch.length} {scannedBatch.length === 1 ? 'cylinder' : 'cylinders'}
                </span>
              </div>

              {scannedBatch.length > 0 && (
                <button
                  type="button"
                  onClick={() => setScannedBatch([])}
                  className="text-xs font-bold text-rose-600 hover:text-rose-400 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {scannedBatch.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-border-default rounded-2xl text-center bg-surface text-slate-400 space-y-2">
                <QrCode className="w-8 h-8 mx-auto opacity-30 text-text-muted" />
                <p className="text-xs font-bold text-text-secondary">No cylinders currently in queue.</p>
                <p className="text-[11px] text-slate-400">Point the camera scanner or enter serial numbers to add cylinders to this list.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {scannedBatch.map((item, index) => (
                  <div 
                    key={item.scanId}
                    className="p-3.5 bg-surface border border-border-default hover:border-teal-300 rounded-2xl shadow-xs transition-[transform,opacity,box-shadow,border-color] flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    {/* Cylinder Serial & Details */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-accent-base/10 border border-teal-150 text-teal-700 font-extrabold text-xs flex items-center justify-center shrink-0 font-mono">
                        #{scannedBatch.length - index}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-text-primary">{item.cylinder.serial_number}</span>
                          {/* Valve type badge — BN (Bullnose) or PI (Pin Index) — must be verified against physical label */}
                          {item.cylinder.type_info?.code && (
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                              item.cylinder.type_info.code === 'BN'
                                ? 'bg-blue-100 text-blue-700 border-blue-500/20'
                                : item.cylinder.type_info.code === 'PI'
                                ? 'bg-purple-100 text-purple-700 border-indigo-500/20'
                                : 'bg-subtle text-text-muted border-border-default'
                            }`}>
                              {item.cylinder.type_info.code === 'BN' ? '🔵 BN' : item.cylinder.type_info.code === 'PI' ? '🟣 PI' : item.cylinder.type_info.code}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-400">{item.scannedAt}</span>
                        </div>
                        <p className="text-[11px] font-bold text-text-muted mt-0.5">
                          {item.cylinder.type_info?.type_name || 'Medical Oxygen Cylinder'} — {item.cylinder.size_info?.capacity ? `${item.cylinder.size_info.capacity}m³` : 'Standard'}
                        </p>
                      </div>
                    </div>

                    {/* Controls: Unit Dropdown & Status Dropdown */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                      
                      {/* Unit Selector */}
                      <div className="flex-1 md:w-48">
                        <select
                          value={item.unitLocation}
                          onChange={(e) => handleUpdateItemUnit(item.scanId, e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-border-default rounded-xl bg-subtle/50 text-xs font-bold text-text-primary focus:outline-none focus:border-teal-500 focus:bg-surface transition-[transform,opacity,box-shadow,border-color] cursor-pointer"
                        >
                          {RECONCILIATION_UNITS.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.icon} {u.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Selector */}
                      <div className="flex-1 md:w-40">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateItemStatus(item.scanId, e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-border-default rounded-xl bg-surface text-xs font-bold text-text-primary focus:outline-none focus:border-teal-500 transition-[transform,opacity,box-shadow,border-color] cursor-pointer"
                        >
                          {RECONCILIATION_STATUSES.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingCylinder(item.cylinder)}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-accent-base/10 rounded-xl transition-[transform,opacity,box-shadow,border-color] cursor-pointer shrink-0"
                        title="Edit cylinder details (serial, size, valve)"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveBatchItem(item.scanId)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-[transform,opacity,box-shadow,border-color] cursor-pointer shrink-0"
                        title="Remove cylinder from scan list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border-default bg-surface flex items-center justify-between shrink-0 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-surface border border-border-default hover:bg-subtle/50 text-text-secondary rounded-xl text-xs font-black transition-[transform,opacity,box-shadow,border-color] active:scale-95 cursor-pointer shadow-xs"
          >
            CLOSE PANEL
          </button>

          <button
            type="button"
            disabled={scannedBatch.length === 0}
            onClick={handleApplyAllBatch}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,opacity,box-shadow,border-color] flex items-center gap-2 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Apply All ({scannedBatch.length}) to Audit Table
          </button>
        </div>

        {/* Edit Cylinder Modal */}
        {editingCylinder && (
          <EditCylinderModal
            isOpen={!!editingCylinder}
            cylinder={editingCylinder}
            hospitalId={hospitalId}
            onClose={() => setEditingCylinder(null)}
            onSuccess={(updated) => {
              setScannedBatch(prev => prev.map(item => item.cylinder.id === updated.id ? { ...item, cylinder: updated } : item));
              if (lastScannedCylinder?.id === updated.id) {
                setLastScannedCylinder(updated);
              }
              onCylinderUpdated?.(updated);
              setStatusMessage({
                type: 'success',
                text: `✓ Silinder dikemaskini → ${updated.serial_number} [${updated.type_info?.type_name || 'Standard'}]`
              });
            }}
          />
        )}

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
