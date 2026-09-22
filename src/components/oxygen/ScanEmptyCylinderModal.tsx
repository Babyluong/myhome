import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import jsQR from 'jsqr';
import { X, QrCode, AlertCircle, AlertTriangle, RefreshCw, CheckCircle2, Trash2, Camera, Keyboard, Check, Volume2, VolumeX, Search, Database, Wrench, ChevronDown, CheckSquare, Square, ArrowRight, Sparkles, Layers, FileText, Truck } from 'lucide-react';
import { getCylinderByQrOrSerial, markCylinderAsEmpty, markMultipleCylindersAsEmpty, updateCylinderValveType, getEmptyCylindersInStore } from '@/services/pharmacy/oxygenService';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { supabase } from '@/services/supabase';
import type { OxygenCylinderWithRelations } from '@/types/pharmacy';

interface ScanEmptyCylinderModalProps {
  hospitalId: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenReturnModal?: () => void;
  onCreateEmptyList?: (scannedCylinders: OxygenCylinderWithRelations[]) => void;
  onSuccess: () => void;
  sessionScannedCylinders: OxygenCylinderWithRelations[];
  setSessionScannedCylinders: React.Dispatch<React.SetStateAction<OxygenCylinderWithRelations[]>>;
  targetCombo?: any;
}

export const ScanEmptyCylinderModal: React.FC<ScanEmptyCylinderModalProps> = ({
  hospitalId,
  isOpen,
  onClose,
  onOpenReturnModal,
  onCreateEmptyList,
  onSuccess,
  sessionScannedCylinders,
  setSessionScannedCylinders,
  targetCombo,
}) => {
  // Navigation tabs for the 2 modes
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  
  // Input text field
  const [qrInput, setQrInput] = useState('');
  
  // Database states
  const [activeCylinders, setActiveCylinders] = useState<any[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [showDemoShortcuts, setShowDemoShortcuts] = useState(true); // Expanded by default for quick selection
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  
  // Process states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [matchedCylinder, setMatchedCylinder] = useState<OxygenCylinderWithRelations | null>(null);

  // Valve type correction state — tracks the last successfully scanned cylinder so staff can
  // fix wrong BN/PI classification on the spot (QR labels do NOT encode valve type)
  const [lastScannedCylinder, setLastScannedCylinder] = useState<OxygenCylinderWithRelations | null>(null);
  const [isCorrectingValveType, setIsCorrectingValveType] = useState(false);
  
  // Cylinder Quick Picker pagination page state
  const [pickerPage, setPickerPage] = useState(1);

  const handleRemoveScannedCylinder = (id: string) => {
    setSessionScannedCylinders(prev => prev.filter(c => c.id !== id));
    if (lastScannedCylinder?.id === id) {
      setLastScannedCylinder(null);
    }
  };

  const handleClearSession = () => {
    setSessionScannedCylinders([]);
    setLastScannedCylinder(null);
  };

  const handleProceedToEmptyList = () => {
    if (onCreateEmptyList) {
      onCreateEmptyList(sessionScannedCylinders);
    } else if (onOpenReturnModal) {
      onOpenReturnModal();
    }
    onClose();
  };

  const handleProceedToReturn = () => {
    if (onOpenReturnModal) {
      onOpenReturnModal();
    } else if (onCreateEmptyList) {
      onCreateEmptyList(sessionScannedCylinders);
    }
    onClose();
  };

  // Auto configure for targetCombo when modal opens
  useEffect(() => {
    if (isOpen && targetCombo) {
      setActiveTab('manual');
      setShowDemoShortcuts(true);
      
      const name = (targetCombo.display_name || '').toUpperCase();
      if (name.includes('101-F') || name.includes('P101-F')) setSelectedSizeFilter('P101-F');
      else if (name.includes('101-E') || name.includes('P101-E')) setSelectedSizeFilter('P101-E');
      else if (name.includes('101-D') || name.includes('P101-D')) setSelectedSizeFilter('P101-D');
      else if (name.includes('101-N')) setSelectedSizeFilter('101-N');
      else if (name.includes('101-HS')) setSelectedSizeFilter('101-HS');

      if (name.includes('BN') || name.includes('BULLNOSE')) setSelectedTypeFilter('BN');
      else if (name.includes('PI') || name.includes('PIN INDEX')) setSelectedTypeFilter('PI');
    }
  }, [isOpen, targetCombo]);

  // Reset picker page when search input or filter changes
  useEffect(() => {
    setPickerPage(1);
  }, [qrInput, dbSearchQuery, selectedSizeFilter, selectedTypeFilter]);
  
  // Scan settings
  const [isBulkScanMode, setIsBulkScanMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [successFlash, setSuccessFlash] = useState(false);

  // Camera settings
  const [cameraActive, setCameraActive] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Animation states
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const normalizeCylinder = (c: any) => {
    const upperSn = (c.serial_number || '').toUpperCase();
    const upperQr = (c.qr_code || '').toUpperCase();
    const sizeCode = c.size_info?.code || c.size_code || '';
    const isHospitalAsset = upperSn.startsWith('O2-P') || upperSn.startsWith('02-P') || upperSn.startsWith('P101') || upperQr.startsWith('O2-P') || upperQr.startsWith('02-P') || upperQr.startsWith('P101') || sizeCode.startsWith('P');
    const isLoan = !isHospitalAsset && (c.supplier_tagged || c.is_loan || upperSn.includes('SABOXY') || upperQr.includes('SABOXY'));

    const prefix = isHospitalAsset ? (sizeCode.startsWith('P') ? sizeCode : `P${sizeCode}`) : sizeCode;
    const typeCode = c.type_info?.code || '';
    const capacity = c.size_info?.capacity ? `${Number(c.size_info.capacity)}${c.size_info.unit || 'm3'}` : '';

    let displayName = prefix;
    if (typeCode) {
      displayName = `${prefix} ${typeCode}${capacity ? ` (${capacity})` : ''}`;
    } else if (capacity) {
      displayName = `${prefix} (${capacity})`;
    }

    return {
      ...c,
      type_name_display: displayName,
      size_code: sizeCode,
      is_loan: isLoan,
      assigned_ward: c.department ? {
        department_name: c.department.department_name || c.department.name
      } : (c.current_location && c.current_location !== 'Store' && c.current_location !== 'Pharmacy Store' ? {
        department_name: typeof c.current_location === 'object' ? c.current_location?.location_name : c.current_location
      } : null)
    };
  };

  // Fetch real active/allocated cylinders from Supabase (including issued ward cylinders and hospital assets)
  useEffect(() => {
    const fetchActiveCylinders = async () => {
      setIsDbLoading(true);
      try {
        let query = supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select(`
            *,
            type_info:pharmacy_oxygen_cylinder_types(*),
            size_info:pharmacy_oxygen_cylinder_sizes(*),
            department:departments(*)
          `)
          .neq('status', 'deactivated')
          .eq('is_active', true)
          .limit(2000);

        if (hospitalId) {
          query = query.eq('hospital_id', hospitalId);
        }

        const { data, error } = await query;

        if (!error && data) {
          const normalized = data
            .filter((c: any) => {
              if (c.status === 'deactivated' || c.is_active === false) return false;
              const upperSn = (c.serial_number || '').toUpperCase();
              const upperQr = (c.qr_code || '').toUpperCase();
              const sizeCode = c.size_info?.code || c.size_code || '';
              const isHospitalAsset = upperSn.startsWith('O2-P') || upperSn.startsWith('02-P') || upperSn.startsWith('P101') || upperQr.startsWith('O2-P') || upperQr.startsWith('02-P') || upperQr.startsWith('P101') || sizeCode.startsWith('P');
              const isLoan = !isHospitalAsset && (c.supplier_tagged || c.is_loan || upperSn.includes('SABOXY') || upperQr.includes('SABOXY'));

              // Exclude supplier loan cylinders that are already empty or already returned (they are tracked in Empty Cylinder List and Supplier Returns)
              if (isLoan && (c.status === 'empty' || c.status === 'returned_to_supplier')) return false;

              return true;
            })
            .map(normalizeCylinder);
          setActiveCylinders(normalized);
        }
      } catch (err) {
        console.error("Error loading active cylinders from Supabase:", err);
      } finally {
        setIsDbLoading(false);
      }
    };

    // On-demand real-time Supabase search for quick picker fallback
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsAnimating(true), 20);
      fetchActiveCylinders();
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hospitalId]);

  // On-demand real-time Supabase search for quick picker fallback
  useEffect(() => {
    const queryText = (dbSearchQuery || '').trim();
    if (queryText.length < 2) return;

    const timer = setTimeout(async () => {
      try {
        const cleanQ = queryText.replace(/[^a-z0-9]/gi, '');
        let remoteQuery = supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select(`
            *,
            type_info:pharmacy_oxygen_cylinder_types(*),
            size_info:pharmacy_oxygen_cylinder_sizes(*),
            department:departments(*)
          `)
          .neq('status', 'deactivated')
          .eq('is_active', true)
          .or(`serial_number.ilike.%${queryText}%,qr_code.ilike.%${queryText}%,serial_number.ilike.%${cleanQ}%,qr_code.ilike.%${cleanQ}%`)
          .limit(20);

        if (hospitalId) {
          remoteQuery = remoteQuery.eq('hospital_id', hospitalId);
        }

        const { data: remoteCyls } = await remoteQuery;

        if (remoteCyls && remoteCyls.length > 0) {
          setActiveCylinders(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const toAdd = remoteCyls
              .filter(rc => !existingIds.has(rc.id) && rc.status !== 'deactivated' && rc.is_active !== false)
              .map(normalizeCylinder);
            return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
          });
        }
      } catch (e) {
        console.warn('On-demand database search error:', e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [dbSearchQuery, hospitalId]);

  // Handle camera toggles
  useEffect(() => {
    if (cameraActive && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraActive, activeTab]);

  const playBeep = (type: 'success' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (type === 'success') {
        // Two-tone confirmation chirp — loud and satisfying
        const playTone = (freq: number, startTime: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.55, startTime + 0.01);  // loud ramp up
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        playTone(880, audioCtx.currentTime, 0.12);          // first beep: A5
        playTone(1320, audioCtx.currentTime + 0.13, 0.18);  // second beep: E6 (higher)
        setTimeout(() => audioCtx.close(), 400);
      } else {
        // Error buzz — harsh descending tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.45, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
        setTimeout(() => audioCtx.close(), 400);
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

  // Safely bind the media stream to the video element once the element mounts
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive, useRealCamera]);

  // Canvas-based QR Code Detection using jsQR
  // lastScannedRef: tracks the last successfully decoded QR data and when it was scanned.
  // This prevents the camera re-triggering the same code while an API call is in-flight
  // or scanning a neighbouring QR by accident.
  const lastScannedRef = useRef<{ code: string; ts: number } | null>(null);
  const SCAN_COOLDOWN_MS = 2000; // ignore same code for 2 s after a successful scan

  useEffect(() => {
    let animFrameId: number;
    let running = false;

    if (cameraActive && useRealCamera && stream && videoRef.current) {
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
            // Scale down to 640px wide for faster jsQR processing without losing readability
            const scale = Math.min(1, 640 / video.videoWidth);
            canvas.width = Math.floor(video.videoWidth * scale);
            canvas.height = Math.floor(video.videoHeight * scale);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const detected = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth', // detect both light-on-dark and dark-on-light QRs
            });
            if (detected && detected.data) {
              const now = Date.now();
              const last = lastScannedRef.current;
              // Cooldown: skip if we just scanned the exact same code within SCAN_COOLDOWN_MS
              if (!last || last.code !== detected.data || now - last.ts > SCAN_COOLDOWN_MS) {
                lastScannedRef.current = { code: detected.data, ts: now };
                handleCodeInput(detected.data);
              }
            }
          }
          // ~150 ms between frames — much faster than the old 500 ms polling
          setTimeout(scanFrame, 150);
        });
      };

      running = true;
      scanFrame();
    }

    return () => {
      running = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [cameraActive, useRealCamera, stream]);

  // Helper to verify if cylinder matches active size filter (e.g. 1.4m3 F size vs N size vs E size)
  const isCylinderMatchingFilter = (cyl: any, filter: string): boolean => {
    if (!filter) return true;
    const target = filter.toUpperCase().trim();
    const cCode = (cyl.size_info?.code || cyl.size_code || '').toUpperCase().trim();
    const cCap = Number(cyl.size_info?.capacity || (cyl as any).capacity || 0);

    // 1.4m3 F size (accepts both P101-F and 101-F formatted 1.4m3 cylinders, rejects N size and E size)
    if (target === 'P101-F' || target === '101-F' || target === '1.4' || target === '1.4M3' || target === '1.4M³') {
      return cCap === 1.4 || cCode === 'P101-F' || cCode === '101-F';
    }
    // 0.7m3 E size
    if (target === 'P101-E' || target === '101-E' || target === '0.7' || target === '0.7M3' || target === '0.7M³') {
      return cCap === 0.7 || cCode === 'P101-E' || cCode === '101-E';
    }
    // 8.0m3 N size
    if (target === '101-N' || target === 'P101-N' || target === '8.0' || target === '8M3' || target === '8.0M³') {
      return cCap === 8.0 || cCode === '101-N' || cCode === 'P101-N';
    }
    // 0.5m3 D size
    if (target === 'P101-D' || target === '101-D' || target === '0.5' || target === '0.5M3' || target === '0.5M³') {
      return cCap === 0.5 || cCode === 'P101-D' || cCode === '101-D';
    }
    // 6.4m3 HS size
    if (target === 'P101-HS' || target === '101-HS' || target === '6.4' || target === '6.4M3' || target === '6.4M³') {
      return cCap === 6.4 || cCode === 'P101-HS' || cCode === '101-HS';
    }
    return cCode === target;
  };

  // Unified lookup processing
  const handleCodeInput = async (inputStr: string) => {
    if (isSubmitting) return;

    let cleanedInput = inputStr.trim();
    if (!cleanedInput) return;

    // Support QR codes that are encoded as URLs (extract the last segment as the serial/code)
    if (cleanedInput.startsWith('http://') || cleanedInput.startsWith('https://')) {
      try {
        const url = new URL(cleanedInput);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          cleanedInput = pathSegments[pathSegments.length - 1];
        }
      } catch (err) {
        console.error("Failed to parse scanned URL:", err);
      }
    }

    // Reject untracked loan category codes (e.g. bare "101-N", "101-F" without a serial suffix)
    // Real serial numbers like "101-F-0139" or "P101-F-0139" must be allowed through for lookup.
    const upperInput = cleanedInput.toUpperCase();
    const isBareLoanCategory = 
      upperInput === '101-N' || 
      upperInput === '101-F' || 
      upperInput === '101N' || 
      upperInput === '101F';
    const isUntrackedLoanSerial = upperInput.startsWith('LOAN-') && !upperInput.includes('P101');

    if (isBareLoanCategory || isUntrackedLoanSerial) {
      playBeep('error');
      setStatusMessage({ 
        type: 'error', 
        text: `"${cleanedInput}" is an untracked loan cylinder category. Please record loan cylinder counts directly in the Create Return Document modal instead.` 
      });
      return;
    }

    // Detect bulk list pasting (lines or comma separated)
    const codes = cleanedInput
      .split(/[\n,;]+/)
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (codes.length > 1) {
      setIsSubmitting(true);
      setStatusMessage(null);
      let successCount = 0;
      let errorCount = 0;
      const newScannedBatch: OxygenCylinderWithRelations[] = [];
      const batchSeenIds = new Set<string>();

      // Deduplicate scanned inputs upfront to avoid double-processing repeated barcodes
      const uniqueCodes = Array.from(new Set(codes));
      errorCount += (codes.length - uniqueCodes.length); // count duplicates in scanned text as skipped

      for (const code of uniqueCodes) {
        // Nested check for bulk codes
        const uc = code.toUpperCase();
        if (uc.startsWith('101-N') || uc.startsWith('101-F') || uc.startsWith('101N') || uc.startsWith('101F')) {
          errorCount++;
          continue;
        }
        try {
          const res = await getCylinderByQrOrSerial(hospitalId, code, selectedSizeFilter || undefined);
          if (res.data && !res.error) {
            let targetCylinder = res.data;
            if (selectedSizeFilter && !isCylinderMatchingFilter(targetCylinder, selectedSizeFilter)) {
              errorCount++;
              continue;
            }
            if (batchSeenIds.has(targetCylinder.id)) {
              errorCount++;
              continue;
            }
            batchSeenIds.add(targetCylinder.id);

            if (targetCylinder.status !== 'empty') {
              const creatorId = user?.id || localStorage.getItem('userId') || 'fbbd44d1-f322-4fdb-a367-a18e5371e205';
              const updateRes = await markCylinderAsEmpty(hospitalId, targetCylinder.id, creatorId);
              if (!updateRes.error) {
                targetCylinder = { ...targetCylinder, status: 'empty', current_location: { location_name: 'Pharmacy Store' } as any };
              }
            }
            newScannedBatch.push(targetCylinder);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (newScannedBatch.length > 0) {
        setSessionScannedCylinders(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const toAdd = newScannedBatch.filter(c => !existingIds.has(c.id));
          return [...prev, ...toAdd];
        });
        // Update status in active list rather than removing, so it remains visible with '✓ Diimbas' badge
        const processedIds = new Set(newScannedBatch.map(c => c.id));
        setActiveCylinders(prev => prev.map(c => processedIds.has(c.id) ? { ...c, status: 'empty', current_location: { location_name: 'Pharmacy Store' } as any } : c));

        playBeep('success');
        setSuccessFlash(true);
        setTimeout(() => setSuccessFlash(false), 500);
        setStatusMessage({
          type: 'success',
          text: `Successfully processed ${successCount} cylinders (${errorCount} skipped/failed)`
        });
        setQrInput('');
        onSuccess();
      } else {
        playBeep('error');
        setStatusMessage({
          type: 'error',
          text: `Failed to find valid active cylinders matching current filter (${selectedSizeFilter || 'All Sizes'}).`
        });
      }
      return;
    }

    // Single code processing
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await getCylinderByQrOrSerial(hospitalId, cleanedInput, selectedSizeFilter || undefined);
      if (res.error || !res.data) {
        playBeep('error');
        setStatusMessage({ type: 'error', text: res.error || `Cylinder "${cleanedInput}" not found in system.` });
      } else {
        const cyl = res.data;
        if (selectedSizeFilter && !isCylinderMatchingFilter(cyl, selectedSizeFilter)) {
          playBeep('error');
          const cCode = cyl.size_info?.code || (cyl as any).size_code || 'Unknown';
          const cCap = cyl.size_info?.capacity ? `${Number(cyl.size_info.capacity)} M³` : '';
          setStatusMessage({
            type: 'error',
            text: `Silinder "${cyl.serial_number}" ialah saiz ${cCode}${cCap ? ` (${cCap})` : ''}. Penapis aktif ialah ${selectedSizeFilter}. Hanya silinder sepadan diterima.`
          });
          return;
        }
        if (cyl.status === 'empty') {
          // Already empty: add directly to scanned list if not already present
          setSessionScannedCylinders(prev => {
            if (prev.some(c => c.id === cyl.id)) return prev;
            return [...prev, cyl];
          });
          setLastScannedCylinder(cyl);
          playBeep('success');
          setSuccessFlash(true);
          setTimeout(() => setSuccessFlash(false), 500);
          setStatusMessage({ type: 'success', text: `Added Empty Cylinder: ${cyl.serial_number}` });
          setQrInput('');
          // Reset cooldown so camera is immediately ready for the NEXT cylinder
          lastScannedRef.current = null;
        } else if (isBulkScanMode) {
          // In Bulk / Auto-Confirm mode, automatically deplete the cylinder without prompt
          let targetCylinder = cyl;
          const creatorId = user?.id || localStorage.getItem('userId') || 'fbbd44d1-f322-4fdb-a367-a18e5371e205';
          const updateRes = await markCylinderAsEmpty(hospitalId, targetCylinder.id, creatorId);
          if (!updateRes.error) {
            targetCylinder = { ...targetCylinder, status: 'empty', current_location: { location_name: 'Pharmacy Store' } as any };
          }
          setSessionScannedCylinders(prev => {
            if (prev.some(c => c.id === targetCylinder.id)) return prev;
            return [...prev, targetCylinder];
          });
          // Update status in active list rather than removing, so it remains visible with '✓ Diimbas' badge
          setActiveCylinders(prev => prev.map(c => c.id === targetCylinder.id ? { ...c, status: 'empty', current_location: { location_name: 'Pharmacy Store' } as any } : c));

          // Track for valve type correction (QR codes don't embed valve type)
          setLastScannedCylinder(targetCylinder);
          playBeep('success');
          setSuccessFlash(true);
          setTimeout(() => setSuccessFlash(false), 500);
          setStatusMessage({ type: 'success', text: `Marked as Depleted: ${targetCylinder.serial_number}` });
          setQrInput('');
          lastScannedRef.current = null;
          onSuccess();
        } else {
          playBeep('success');
          setMatchedCylinder(cyl);
          if (sessionScannedCylinders.some(c => c.id === cyl.id)) {
            setStatusMessage({ type: 'success', text: `Cylinder "${cyl.serial_number}" is already in return list.` });
          }
        }
      }
    } catch (err) {
      console.error(err);
      playBeep('error');
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred while updating status.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSingleConfirm = async () => {
    if (!matchedCylinder) return;
    setIsSubmitting(true);

    try {
      if (matchedCylinder.status === 'empty') {
        setSessionScannedCylinders(prev => {
          if (prev.some(c => c.id === matchedCylinder.id)) return prev;
          return [...prev, matchedCylinder];
        });
        setStatusMessage({ type: 'success', text: `Added "${matchedCylinder.serial_number}" to empty list.` });
        setMatchedCylinder(null);
        setQrInput('');
      } else {
        const creatorId = user?.id || localStorage.getItem('userId') || 'fbbd44d1-f322-4fdb-a367-a18e5371e205';
        const res = await markCylinderAsEmpty(hospitalId, matchedCylinder.id, creatorId);
        if (res.error) {
          setStatusMessage({ type: 'error', text: res.error });
        } else {
          const updated: OxygenCylinderWithRelations = { ...matchedCylinder, status: 'empty', current_location: { location_name: 'Pharmacy Store' } as any };
          setSessionScannedCylinders(prev => {
            if (prev.some(c => c.id === updated.id)) return prev;
            return [...prev, updated];
          });
          // Update status in active list rather than removing, so it remains visible with '✓ Diimbas' badge
          setActiveCylinders(prev => prev.map(c => c.id === updated.id ? { ...c, status: 'empty', current_location: { location_name: 'Pharmacy Store' } as any } : c));
          setLastScannedCylinder(updated);
          playBeep('success');
          setSuccessFlash(true);
          setTimeout(() => setSuccessFlash(false), 500);
          setStatusMessage({ type: 'success', text: `Marked as Depleted: ${updated.serial_number}` });
          setMatchedCylinder(null);
          setQrInput('');
          onSuccess();
        }
      }
    } catch (err) {
      console.error(err);
      playBeep('error');
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred while updating status.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk deplete all cylinders currently displayed under the active ward group
  const handleBatchDepleteAll = async (cylsToDeplete: any[]) => {
    if (!cylsToDeplete || cylsToDeplete.length === 0) return;
    setIsSubmitting(true);
    try {
      const ids = cylsToDeplete.map(c => c.id);
      const creatorId = user?.id || localStorage.getItem('userId') || 'fbbd44d1-f322-4fdb-a367-a18e5371e205';
      const res = await markMultipleCylindersAsEmpty(hospitalId, ids, creatorId);
      if (!res.error) {
        const updatedList = cylsToDeplete.map(c => ({
          ...c,
          status: 'empty',
          current_location: { location_name: 'Pharmacy Store' } as any
        }));
        setSessionScannedCylinders(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const toAdd = updatedList.filter(c => !existingIds.has(c.id));
          return [...prev, ...toAdd];
        });
        setActiveCylinders(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'empty', current_location: { location_name: 'Pharmacy Store' } as any } : c));
        playBeep('success');
        setSuccessFlash(true);
        setTimeout(() => setSuccessFlash(false), 500);
        setStatusMessage({
          type: 'success',
          text: `Successfully marked ${cylsToDeplete.length} cylinders as depleted`
        });
        onSuccess();
      } else {
        playBeep('error');
        setStatusMessage({ type: 'error', text: res.error || `Failed to mark cylinders depleted.` });
      }
    } catch (err) {
      console.error(err);
      playBeep('error');
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred during batch operation.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Corrects valve type (BN/PI) for the last scanned cylinder.
  // Needed because QR labels on MOH cylinders only encode the serial number —
  // the valve type (Bullnose vs Pin Index) is only visible on the physical label sticker.
  const handleCorrectValveType = async (targetCode: 'BN' | 'PI') => {
    if (!lastScannedCylinder || isCorrectingValveType) return;
    setIsCorrectingValveType(true);
    try {
      const userId = user?.id || localStorage.getItem('userId') || undefined;
      const res = await updateCylinderValveType(hospitalId, lastScannedCylinder.id, targetCode, userId);
      if (res.error) {
        setStatusMessage({ type: 'error', text: `Valve type correction failed: ${res.error}` });
      } else {
        const valveLabel = targetCode === 'BN' ? 'Bullnose (BN)' : 'Pin Index (PI)';
        setStatusMessage({
          type: 'success',
          text: `✓ Valve type corrected → ${valveLabel} for ${lastScannedCylinder.serial_number}`
        });
        // Update the cylinder in scanned session list
        const corrected: OxygenCylinderWithRelations = { ...lastScannedCylinder, type_info: { ...lastScannedCylinder.type_info, code: targetCode } as any };
        setSessionScannedCylinders(prev =>
          prev.map(c => c.id === corrected.id ? corrected : c)
        );
        setLastScannedCylinder(null);
      }
    } catch (err) {
      console.error('Valve type correction error:', err);
      setStatusMessage({ type: 'error', text: 'Failed to correct valve type. Try again.' });
    } finally {
      setIsCorrectingValveType(false);
    }
  };

  // Filter active database cylinders by manual search term and selected category tab
  // Get unique sizes & valve types from fetched database cylinders
  const uniqueSizes = Array.from(
    new Set(activeCylinders.map(c => c.size_info?.code).filter(Boolean))
  ).sort();

  const uniqueTypes = Array.from(
    new Set(activeCylinders.map(c => c.type_info?.code).filter(Boolean))
  ).sort();

  // Filter active database cylinders by manual search term, size filter, and type filter
  const filteredActiveCylinders = activeCylinders.filter(c => {
    // 1. Cylinder Size Filter (strictly enforces 1.4m3 / F size, E size, N size etc.)
    if (selectedSizeFilter && !isCylinderMatchingFilter(c, selectedSizeFilter)) return false;

    // 2. Valve Type Filter
    if (selectedTypeFilter && c.type_info?.code !== selectedTypeFilter) return false;

    // 3. Search Filter (dedicated quick picker filter dbSearchQuery)
    const q = (dbSearchQuery || '').trim().toLowerCase();
    if (q) {
      const cleanQ = q.replace(/[^a-z0-9]/gi, '');
      const serialClean = (c.serial_number || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      const qrClean = (c.qr_code || '').toLowerCase().replace(/[^a-z0-9]/gi, '');
      const wardClean = (c.assigned_ward?.department_name || '').toLowerCase();

      // Normalize 'o' and '0' so O2 and 02 match interchangeably
      const normQ = cleanQ.replace(/o/g, '0');
      const normSerial = serialClean.replace(/o/g, '0');
      const normQr = qrClean.replace(/o/g, '0');

      // Match numbers with or without leading zeroes (e.g. 21 matching 0021)
      const numOnlyQ = cleanQ.replace(/^0+/, '');
      const numMatch = numOnlyQ.length >= 2 && (serialClean.includes(numOnlyQ) || normSerial.includes(numOnlyQ));
      
      const matches = (
        (c.serial_number || '').toLowerCase().includes(q) ||
        (c.qr_code || '').toLowerCase().includes(q) ||
        wardClean.includes(q) ||
        (cleanQ.length >= 2 && (serialClean.includes(cleanQ) || qrClean.includes(cleanQ))) ||
        (normQ.length >= 2 && (normSerial.includes(normQ) || normQr.includes(normQ))) ||
        numMatch
      );
      if (!matches) return false;
    }

    return true;
  });

  const sortedActiveCylinders = [...filteredActiveCylinders].sort((a, b) => 
    (a.serial_number || '').localeCompare(b.serial_number || '')
  );

  const pickerPageSize = 20;
  const totalPickerItems = sortedActiveCylinders.length;
  const totalPickerPages = Math.max(1, Math.ceil(totalPickerItems / pickerPageSize));
  const paginatedPickerCylinders = sortedActiveCylinders.slice(
    (pickerPage - 1) * pickerPageSize,
    pickerPage * pickerPageSize
  );

  // Group the paginated cylinders by size code & type code for separated display section
  const paginatedGroupedCylinders = paginatedPickerCylinders.reduce((groups: { [key: string]: typeof paginatedPickerCylinders }, c) => {
    const sizeLabel = c.size_info?.code || 'Other Size';
    const typeLabel = c.type_info?.code || '';
    const capVal = c.size_info?.capacity ? `${Number(c.size_info.capacity)}M³` : '';
    const groupKey = `${sizeLabel} ${typeLabel}${capVal ? ` (${capVal})` : ''}`.trim();
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(c);
    return groups;
  }, {});

  if (!isRendered) return null;

  const modalContent = (
    <div className={`fixed inset-0 z-[100] overflow-hidden flex justify-end transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-all duration-300"
      />

      {/* Expanded Width Drawer Panel (max-w-5xl) */}
      <div className={`relative w-full max-w-5xl bg-slate-50 border-l border-slate-200/80 shadow-2xl flex flex-col h-full transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Dark slate console header with live store badge */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border-b border-slate-800 text-white shadow-lg shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/35 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.35)] shrink-0">
              <QrCode className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                  {language === 'ms' ? 'Imbas Silinder Kosong' : 'Scan Empty Cylinder'}
                </h3>
                <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {sessionScannedCylinders.length} Scanned
                </span>
              </div>
              <p className="text-slate-300 text-xs font-medium mt-0.5">
                {language === 'ms' 
                  ? 'Imbas kod QR silinder untuk jana Senarai Silinder Kosong' 
                  : 'Scan empty cylinders to create official Empty Cylinder List'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center transition-all duration-205 cursor-pointer hover:scale-105"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Split Column Workspace Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 min-h-0">
          
          {/* Left Column: Console Inputs & Viewports (col-span-6) */}
          <div className="col-span-1 md:col-span-6 space-y-6 border-b md:border-b-0 md:border-r border-slate-200/50 pb-6 md:pb-0 pr-0 md:pr-6">
            
            {/* Bulk Scan Mode Header Switcher */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-700">Bulk Scan Mode</span>
                <span className="text-[10px] text-slate-400 font-semibold">Auto-confirm instantly</span>
              </div>
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    soundEnabled 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkScanMode(!isBulkScanMode)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isBulkScanMode ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      isBulkScanMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Mode Selector Tabs (Scan by Camera vs Key in Manually) */}
            <div className="flex bg-slate-105 p-1 bg-slate-100 rounded-xl border border-slate-200/40">
              <button
                type="button"
                onClick={() => { setActiveTab('camera'); setQrInput(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'camera' 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Camera Feed
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('manual'); stopCamera(); setQrInput(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'manual' 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                Key-In Manual
              </button>
            </div>

            {/* MODE A: Camera scanner layout */}
            {activeTab === 'camera' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-inner text-white">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Camera Console</span>
                    <span className="text-[9px] text-slate-500 font-mono">Lens status: Connected</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCameraActive(!cameraActive)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold font-mono transition-all cursor-pointer ${
                      cameraActive 
                        ? 'bg-rose-500 hover:bg-rose-650 text-white' 
                        : 'bg-blue-600 hover:bg-blue-750 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {cameraActive ? 'SHUTDOWN LENS' : 'ACTIVATE CAMERA'}
                  </button>
                </div>

                {cameraActive ? (
                  <div className={`relative aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-955 flex flex-col items-center justify-center shadow-inner transition-all duration-300 bg-slate-950 ${successFlash ? 'ring-8 ring-emerald-500/30' : ''}`}>
                    {successFlash && (
                      <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-xs flex items-center justify-center z-20">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
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
                      <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center p-4">
                        <QrCode className="w-6 h-6 text-blue-400/70 animate-pulse mb-1.5" />
                        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">LENS STREAM ACTIVE</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-3 text-[8px] font-mono text-slate-500 select-none">
                      f/2.8 &nbsp; ISO 400 &nbsp; 1080p
                    </div>
                    <div className="absolute top-2 right-3 text-[8px] font-mono text-emerald-500 select-none flex items-center gap-1">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                      AF-L
                    </div>

                    <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-[pulse_1.2s_infinite] z-10" />
                    <div className="absolute inset-6 border border-slate-500/15 rounded-lg pointer-events-none z-10">
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                    </div>
                  </div>
                ) : (
                  <div className="h-40 border border-dashed border-slate-700/60 rounded-2xl flex flex-col items-center justify-center text-center p-4 bg-slate-950/20 text-slate-500">
                    <Camera className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                    <span className="text-[10px] font-bold font-mono tracking-wide uppercase">Console View Offline</span>
                    <span className="text-[9px] text-slate-600 mt-1 leading-normal">Click ACTIVATE CAMERA above to start scanner lens.</span>
                  </div>
                )}
              </div>
            )}

            {/* MODE B: Key-In Manual Mode */}
            {activeTab === 'manual' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manual Entry Console</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Type or paste serial keys below</span>
                  </div>

                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleCodeInput(qrInput); }} 
                    className="space-y-3"
                  >
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex gap-2 shadow-inner focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 focus-within:bg-white transition-all duration-200">
                      <input
                        type="text"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        placeholder="Scan barcode or key-in exact serial to mark empty..."
                        disabled={isSubmitting}
                        className="flex-1 px-2.5 py-1.5 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none border-none"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !qrInput.trim()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-xs gap-1.5"
                      >
                        {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Process Code'}
                      </button>
                    </div>
                  </form>
                  
                  {/* Single lookup details preview */}
                  {!isBulkScanMode && matchedCylinder && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-4 border-l-4 border-l-blue-500 animate-[dropdown-enter_180ms_var(--ease-enter)]">
                      <span className="block text-slate-650 font-bold text-[10px] uppercase tracking-wider">
                        Cylinder Found
                      </span>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Serial Number</span>
                          <span className="font-mono">{matchedCylinder.serial_number}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Capacity</span>
                          <span>{matchedCylinder.size_info?.capacity ? `${matchedCylinder.size_info.capacity} M³` : '0.7 M³'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Location</span>
                          <span className="truncate block">{matchedCylinder.assigned_ward?.department_name || 'Store'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Status</span>
                          <span className="capitalize">{matchedCylinder.status}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSingleConfirm}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {matchedCylinder.status === 'empty' ? 'Add to Return List' : 'Confirm: Mark Cylinder as Empty'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Collapsible Database Quick Picker (Standard trackable cylinders only) */}
                {activeCylinders.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowDemoShortcuts(!showDemoShortcuts)}
                      className="flex items-center justify-between w-full text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#00a68a] animate-pulse" />
                        <span>Select Cylinder from Database (Scan Fallback)</span>
                      </div>
                      <span className="text-[9px] text-[#00a68a] bg-emerald-50 px-2 py-0.5 rounded-lg font-bold border border-emerald-100">
                        {showDemoShortcuts ? 'Hide List' : 'Show List'}
                      </span>
                    </button>
                    {showDemoShortcuts && (
                      <div className="space-y-3 pt-3 border-t border-slate-200/50">
                        {/* Quick Filter Search & Dropdowns */}
                        <div className="space-y-2.5 pb-3 border-b border-slate-200/50">
                          {/* Dedicated Search Filter for Database Fallback */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              value={dbSearchQuery}
                              onChange={(e) => setDbSearchQuery(e.target.value)}
                              placeholder="Filter cylinders by serial number or ward (e.g. 0067, ICU)..."
                              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-2xs focus:ring-4 focus:ring-[#00a68a]/10 focus:border-[#00a68a] transition-all focus:outline-none"
                            />
                            {dbSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setDbSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Size Filter Selector */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Cylinder Size</label>
                              <select
                                value={selectedSizeFilter}
                                onChange={(e) => setSelectedSizeFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs focus:ring-4 focus:ring-[#00a68a]/10 focus:border-[#00a68a] transition-all cursor-pointer focus:outline-none"
                              >
                                <option value="">All Sizes ({activeCylinders.length})</option>
                                {uniqueSizes.map(size => {
                                  const sample = activeCylinders.find(c => c.size_info?.code === size);
                                  const cap = sample?.size_info?.capacity ? ` (${sample.size_info.capacity} M³)` : '';
                                  const count = activeCylinders.filter(c => isCylinderMatchingFilter(c, size)).length;
                                  return (
                                    <option key={size} value={size}>
                                      {size}{cap} ({count})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Valve Type Filter Selector */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Valve Type</label>
                              <select
                                value={selectedTypeFilter}
                                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs focus:ring-4 focus:ring-[#00a68a]/10 focus:border-[#00a68a] transition-all cursor-pointer focus:outline-none"
                              >
                                <option value="">All Types</option>
                                {uniqueTypes.map(type => {
                                  const sample = activeCylinders.find(c => c.type_info?.code === type);
                                  const typeName = sample?.type_info?.name ? ` (${sample.type_info.name})` : '';
                                  const count = activeCylinders.filter(c => c.type_info?.code === type && (!selectedSizeFilter || isCylinderMatchingFilter(c, selectedSizeFilter))).length;
                                  return (
                                    <option key={type} value={type}>
                                      {type}{typeName} ({count})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Quick Batch Deplete Banner for Active Ward Cylinders */}
                        {(() => {
                          const matchingInUse = filteredActiveCylinders.filter(c => 
                            c.status === 'issued' || c.status === 'in_use' || (c.assigned_ward && c.assigned_ward.department_name)
                          );
                          if (matchingInUse.length === 0) return null;

                          return (
                            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-[dropdown-enter_180ms_var(--ease-enter)]">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                                  <AlertTriangle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-900 tracking-tight">
                                    {targetCombo ? `Ward Deployment: ${targetCombo.display_name}` : 'Active Ward Deployment'}
                                  </h4>
                                  <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                                    <strong className="text-blue-700 font-bold tabular-nums">{matchingInUse.length}</strong> cylinders in active use in ward.
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleBatchDepleteAll(matchingInUse)}
                                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                              >
                                {isSubmitting ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Mark All ({matchingInUse.length}) as Depleted</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })()}

                        {/* Paginated Grid - Grouped under headers */}
                        {paginatedPickerCylinders.length === 0 ? (
                          <div className="text-center py-12 text-[10px] text-slate-455 italic font-semibold bg-white border border-slate-150 rounded-2xl">
                            No cylinders found matching search term/filters.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.keys(paginatedGroupedCylinders).map((groupKey) => (
                              <div key={groupKey} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-sans">
                                    {groupKey}
                                  </span>
                                  <div className="h-px bg-slate-200/60 flex-1" />
                                </div>
                                <div className="grid grid-cols-1 gap-2.5">
                                  {paginatedGroupedCylinders[groupKey].map((c) => {
                                    const isWardCyl = c.status === 'issued' || c.status === 'in_use' || (c.assigned_ward && c.assigned_ward.department_name);
                                    const cleanSerial = (c.serial_number || '').replace(/\s*\(\d+(?:\.\d+)?\s*(?:m3|m³)\)/gi, '');
                                    const isAlreadyScanned = sessionScannedCylinders.some(sc => sc.id === c.id);
                                    return (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleCodeInput(c.serial_number)}
                                        className={`w-full px-4 py-3 ${
                                          isAlreadyScanned 
                                            ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/60' 
                                            : 'bg-white hover:bg-blue-600 hover:text-white border-slate-200 hover:border-blue-600'
                                        } text-left rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99] group flex items-center justify-between gap-3`}
                                        title={`Serial: ${c.serial_number} | Location: ${c.assigned_ward?.department_name || 'Store'}`}
                                      >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                          <span className={`w-2.5 h-2.5 rounded-full ${
                                            isAlreadyScanned 
                                              ? 'bg-emerald-500 ring-2 ring-emerald-300' 
                                              : isWardCyl ? 'bg-blue-600 group-hover:bg-white animate-pulse' : 'bg-emerald-500 group-hover:bg-white animate-pulse'
                                          } shrink-0`} />
                                          <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className={`font-mono text-xs sm:text-[13px] font-bold ${
                                                isAlreadyScanned ? 'text-emerald-900' : 'text-slate-800 group-hover:text-white'
                                              } tracking-tight select-all`}>
                                                {cleanSerial}
                                              </span>
                                              {c.type_info?.code && (
                                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                                  isAlreadyScanned 
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                                    : 'bg-slate-100 group-hover:bg-blue-700/50 text-slate-600 group-hover:text-blue-100 border-slate-200/60 group-hover:border-blue-400/40'
                                                } border font-mono`}>
                                                  {c.type_info.code}
                                                </span>
                                              )}
                                              {c.status && (
                                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                                                  isAlreadyScanned 
                                                    ? 'bg-emerald-200/60 text-emerald-900'
                                                    : 'bg-slate-100 text-slate-600 group-hover:bg-blue-700/40 group-hover:text-blue-100'
                                                }`}>
                                                  {c.status.replace(/_/g, ' ')}
                                                </span>
                                              )}
                                            </div>

                                            <span className={`text-[10px] ${
                                              isAlreadyScanned ? 'text-emerald-700' : 'text-slate-500 group-hover:text-blue-100'
                                            } font-medium truncate mt-0.5`}>
                                              {c.assigned_ward?.department_name ? `Ward: ${c.assigned_ward.department_name}` : 'Location: Store'}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          {isAlreadyScanned ? (
                                            <span className="text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-2xs flex items-center gap-1">
                                              <Check className="w-3 h-3 stroke-[3]" />
                                              Diimbas
                                            </span>
                                          ) : c.status === 'empty' ? (
                                            <span className="text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-blue-700 shadow-2xs transition-colors">
                                              + Tambah
                                            </span>
                                          ) : (
                                            <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-2xs transition-colors ${
                                              isWardCyl 
                                                ? 'bg-blue-100 text-blue-800 group-hover:bg-white group-hover:text-blue-700' 
                                                : 'bg-emerald-100 text-emerald-800 group-hover:bg-white group-hover:text-emerald-700'
                                            }`}>
                                              {isWardCyl ? 'Deplete' : 'Mark Empty'}
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pagination controller */}
                        {totalPickerPages > 1 && (
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/50 text-[9px] font-bold text-slate-500">
                            <span>
                              Showing {(pickerPage - 1) * pickerPageSize + 1} - {Math.min(pickerPage * pickerPageSize, totalPickerItems)} of {totalPickerItems} cylinders
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                disabled={pickerPage === 1}
                                onClick={() => setPickerPage(prev => Math.max(1, prev - 1))}
                                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                              >
                                Prev
                              </button>
                              <button
                                type="button"
                                disabled={pickerPage === totalPickerPages}
                                onClick={() => setPickerPage(prev => Math.min(totalPickerPages, prev + 1))}
                                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {isDbLoading && (
                  <div className="text-center py-2 text-[10px] font-semibold text-slate-400 animate-pulse">
                    Querying active Supabase cylinders...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Scanned Cylinders in Current Session (col-span-6) */}
          <div className="col-span-1 md:col-span-6 flex flex-col space-y-4 min-h-0 pl-0 md:pl-2">
            
            {/* Header with Title & Clear Action */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                    {language === 'ms' ? 'Silinder Diimbas (Sesi Ini)' : 'Scanned Cylinders (Current Session)'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {language === 'ms' ? 'Silinder sedia dimasukkan ke Senarai Silinder Kosong' : 'Cylinders ready to build Empty Cylinder List'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-mono font-extrabold px-2.5 py-1 rounded-full border border-indigo-200">
                  {sessionScannedCylinders.length} {language === 'ms' ? 'silinder' : 'cylinders'}
                </span>
                {sessionScannedCylinders.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSession}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {language === 'ms' ? 'Kosongkan' : 'Clear All'}
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Status message toast box */}
            {statusMessage && (
              <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-semibold animate-[toast-enter_150ms_cubic-bezier(0,0,0.2,1)] ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{statusMessage.text}</span>
              </div>
            )}

            {/* Valve type correction panel */}
            {lastScannedCylinder && (
              <div className="p-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50/90 space-y-2.5 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-amber-900">Verify Valve Type:</span>
                      <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md truncate">
                        {lastScannedCylinder.serial_number}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-700 font-medium mt-0.5 leading-tight">
                      Check physical label on cylinder — is this Bullnose or Pin Index?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLastScannedCylinder(null)}
                    className="text-amber-400 hover:text-amber-600 p-1 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCorrectValveType('BN')}
                    disabled={isCorrectingValveType}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                      (lastScannedCylinder.type_info as any)?.code === 'BN'
                        ? 'bg-blue-100 border-blue-300 text-blue-800 opacity-60'
                        : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50 shadow-2xs'
                    }`}
                  >
                    🔵 Bullnose (BN)
                    {(lastScannedCylinder.type_info as any)?.code === 'BN' && <Check className="w-3 h-3 text-blue-600 ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCorrectValveType('PI')}
                    disabled={isCorrectingValveType}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                      (lastScannedCylinder.type_info as any)?.code === 'PI'
                        ? 'bg-purple-100 border-purple-300 text-purple-800 opacity-60'
                        : 'bg-white border-purple-300 text-purple-700 hover:bg-purple-50 shadow-2xs'
                    }`}
                  >
                    {isCorrectingValveType ? <RefreshCw className="w-3 h-3 animate-spin" /> : '🟣 Pin Index (PI)'}
                    {(lastScannedCylinder.type_info as any)?.code === 'PI' && <Check className="w-3 h-3 text-purple-600 ml-0.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Scanned Cylinders List */}
            <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-2 min-h-[220px]">
              {sessionScannedCylinders.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-800">
                    {language === 'ms' ? 'Belum Ada Silinder Diimbas' : 'No Cylinders Scanned Yet'}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    {language === 'ms' 
                      ? 'Gunakan kamera atau taip no siri di sebelah kiri untuk imbas silinder kosong ke dalam senarai ini.' 
                      : 'Scan barcodes with camera or key-in serial numbers on the left to add cylinders to this list.'}
                  </p>
                </div>
              ) : (
                sessionScannedCylinders.map((cyl, idx) => {
                  const capacityStr = cyl.size_info?.capacity ? `${Number(cyl.size_info.capacity)}M³` : ((cyl as any).capacity ? `${(cyl as any).capacity}M³` : '—');
                  const valveCode = (cyl.type_info as any)?.code || ((cyl.type_info as any)?.name?.toLowerCase().includes('bullnose') ? 'BN' : 'PI');
                  const sizeLabel = cyl.size_info?.code || (cyl as any).size_code || '—';

                  return (
                    <div
                      key={cyl.id}
                      className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="flex flex-col min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                            {cyl.serial_number}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                            <span>Loc: {(cyl.current_location as any)?.location_name || (typeof cyl.current_location === 'string' ? cyl.current_location : 'Pharmacy Store')}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-400">{cyl.qr_code || cyl.serial_number}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badges: Size & Valve & Remove Button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-extrabold font-mono text-slate-700">
                          {sizeLabel} ({capacityStr})
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                          valveCode === 'BN'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {valveCode === 'BN' ? '🔵 BN' : '🟣 PI'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveScannedCylinder(cyl.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                          title="Remove from this session"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 md:p-6 border-t border-slate-200/60 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
          >
            {language === 'ms' ? 'Tutup Pengimbas' : 'Close Scanner'}
          </button>
          
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
            <span className="text-xs font-bold text-slate-600 font-mono mr-1">
              <strong className="text-rose-600 text-sm">{sessionScannedCylinders.length}</strong> {language === 'ms' ? 'silinder sedia' : 'cylinders ready'}
            </span>

            {onCreateEmptyList && (
              <button
                type="button"
                onClick={handleProceedToEmptyList}
                disabled={sessionScannedCylinders.length === 0}
                className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'ms' ? 'Lihat atau cetak senarai manifest silinder kosong' : 'View or print empty cylinder manifest'}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === 'ms' ? 'Senarai Manifest' : 'View Manifest'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleProceedToReturn}
              disabled={sessionScannedCylinders.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Truck className="w-4 h-4" />
              <span>
                {language === 'ms' ? 'Terus Ke Dokumen Pulang' : 'Proceed to Return Document'}
              </span>
              {sessionScannedCylinders.length > 0 && (
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
                  {sessionScannedCylinders.length} cyl
                </span>
              )}
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
