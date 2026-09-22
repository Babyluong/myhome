// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  X, Plus, Trash2, ShieldAlert, Store, User as UserIcon, 
  Camera, Keyboard, Database, Check, QrCode, AlertCircle, 
  RefreshCw, CheckCircle2, Volume2, VolumeX, Search 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import type { User } from '@/types';

interface ManualIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    department_id: string;
    items: { size_code: string; quantity: number; usage_notes?: string }[];
    remarks?: string;
    requested_by?: string;
    manual_requester_name?: string;
    cylinder_ids?: string[];
  }) => Promise<void>;
  departments: { id: string; department_name: string }[];
  currentUser: User | null;
  users: { id: string; full_name: string; jawatan?: string; department_id?: string }[];
  hospitalId: string;
}

export const ManualIssueModal: React.FC<ManualIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  departments,
  currentUser,
  users,
  hospitalId,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isManualRequester, setIsManualRequester] = useState(false);
  const [selectedRequesterId, setSelectedRequesterId] = useState('');
  const [manualRequesterName, setManualRequesterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tabs: trackable (scan/select) vs loan (quantity input)
  const [cylinderTab, setCylinderTab] = useState<'trackable' | 'loan'>('trackable');

  // Trackable scanner / picker states
  const [qrInput, setQrInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [successFlash, setSuccessFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // All in-stock cylinders in store (status = 'available') including Loan & Saboxy
  const [allAvailableCylinders, setAllAvailableCylinders] = useState<any[]>([]);
  // Standard trackable cylinders for the scan & picker console
  const [availableCylinders, setAvailableCylinders] = useState<any[]>([]);
  // Complete hospital cylinder inventory (for on-demand resolution and direct ward transfer)
  const [allHospitalCylinders, setAllHospitalCylinders] = useState<any[]>([]);
  const [isLoadingCylinders, setIsLoadingCylinders] = useState(false);
  const [selectedCylinders, setSelectedCylinders] = useState<any[]>([]);

  // Action card for a scanned cylinder located in another ward / requiring transfer or store check-in
  const [pendingActionCylinder, setPendingActionCylinder] = useState<any | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  // Auto direct ward transfer toggle
  const [allowWardTransfer, setAllowWardTransfer] = useState(false);
  // Picker scope: 'store' (in-stock available) vs 'wards' (issued/transferable)
  const [pickerScope, setPickerScope] = useState<'store' | 'wards'>('store');

  // Database Picker state
  const [showPicker, setShowPicker] = useState(true);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [pickerPage, setPickerPage] = useState(1);
  const pickerPageSize = 20;

  // Reset page when filter changes
  useEffect(() => {
    setPickerPage(1);
  }, [selectedTypeFilter, qrInput, pickerScope]);

  // Loan quantities: 101-F & 101-N
  const [loanQtyF, setLoanQtyF] = useState<number>(0);
  const [loanNotesF, setLoanNotesF] = useState('');
  const [loanSerialsF, setLoanSerialsF] = useState<string[]>([]);
  const [serialInputF, setSerialInputF] = useState('');

  const [loanQtyN, setLoanQtyN] = useState<number>(0);
  const [loanNotesN, setLoanNotesN] = useState('');
  const [loanSerialsN, setLoanSerialsN] = useState<string[]>([]);
  const [serialInputN, setSerialInputN] = useState('');

  const [showSuggestionsF, setShowSuggestionsF] = useState(false);
  const [showSuggestionsN, setShowSuggestionsN] = useState(false);

  // Resolves partial inputs (e.g. "3051", "054610", "saboxy-1463051") to the full serial number
  const resolveFullSerial = (input: string, sizeCode: '101-F' | '101-N'): string => {
    const clean = input.trim();
    if (!clean) return '';
    const cleanUpper = clean.toUpperCase();

    // 1. Search all available database cylinders for exact, prefix, suffix or substring match
    const pool = allAvailableCylinders.length > 0 ? allAvailableCylinders : availableCylinders;
    const matchedCyl = pool.find(c => {
      const s = (c.serial_number || '').toUpperCase();
      const qr = (c.qr_code || '').toUpperCase();
      return s === cleanUpper || qr === cleanUpper || s.endsWith(cleanUpper) || s.includes(cleanUpper) || qr.includes(cleanUpper);
    });

    if (matchedCyl) {
      return matchedCyl.serial_number || matchedCyl.qr_code;
    }

    // 2. If user typed only numbers (e.g., "3051"), prepend the size code prefix ("101-N3051" or "101-F3051")
    if (/^\d+$/.test(clean)) {
      return `${sizeCode}${clean}`;
    }

    // 3. Otherwise return the cleaned full input string (e.g., "SBX-101N-3051")
    return clean;
  };

  // Helper to fetch live serial autocomplete suggestions
  const getSerialSuggestions = (sizeCode: '101-F' | '101-N', query: string) => {
    const q = query.trim().toUpperCase();
    if (!q) return [];

    const alreadyAdded = sizeCode === '101-F' ? loanSerialsF : loanSerialsN;
    const pool = allAvailableCylinders.length > 0 ? allAvailableCylinders : availableCylinders;
    const matches: { id: string; full_serial: string; size_code?: string; status?: string; is_db_match?: boolean; is_target_size?: boolean }[] = [];

    pool.forEach((c) => {
      const serial = (c.serial_number || '').trim();
      const qr = (c.qr_code || '').trim();
      const full = serial || qr;
      if (!full) return;

      // Skip already added serials
      if (alreadyAdded.some(s => s.toUpperCase() === full.toUpperCase())) return;

      const upperSerial = serial.toUpperCase();
      const upperQr = qr.toUpperCase();
      const cylSizeCode = c.size_info?.code || '';

      // Match query anywhere in serial or QR code
      if (upperSerial.includes(q) || upperQr.includes(q)) {
        const isTargetSize = 
          (sizeCode === '101-N' && (cylSizeCode === '101-N' || c.supplier_tagged || upperSerial.includes('SABOXY') || upperSerial.includes('101-N') || upperSerial.includes('101N'))) ||
          (sizeCode === '101-F' && (cylSizeCode === '101-F' || cylSizeCode === 'P101-F' || upperSerial.includes('101-F') || upperSerial.includes('101F')));

        matches.push({
          id: c.id,
          full_serial: full,
          size_code: cylSizeCode || sizeCode,
          status: c.status || 'available',
          is_db_match: true,
          is_target_size: isTargetSize
        });
      }
    });

    // Prioritize target size matching cylinders, then exact or alphabetical
    matches.sort((a, b) => {
      if (a.is_target_size && !b.is_target_size) return -1;
      if (!a.is_target_size && b.is_target_size) return 1;
      return a.full_serial.localeCompare(b.full_serial);
    });

    // Add formatted suggestion if query is purely numeric
    if (/^\d+$/.test(q)) {
      const formatted = `${sizeCode}${q}`;
      if (!matches.some(m => m.full_serial.toUpperCase() === formatted) && !alreadyAdded.includes(formatted)) {
        matches.unshift({
          id: `fmt-${formatted}`,
          full_serial: formatted,
          size_code: sizeCode,
          status: 'formatted',
          is_db_match: false,
          is_target_size: true
        });
      }
    }

    return matches.slice(0, 10);
  };

  const handleAddSerialF = (inputVal?: string) => {
    const raw = (inputVal !== undefined ? inputVal : serialInputF).trim();
    if (!raw) return;
    const tokens = raw.split(/[\s,\n]+/).map(t => resolveFullSerial(t, '101-F')).filter(Boolean);
    if (tokens.length === 0) return;
    const updated = Array.from(new Set([...loanSerialsF, ...tokens]));
    setLoanSerialsF(updated);
    setLoanQtyF(Math.max(loanQtyF, updated.length));
    setSerialInputF('');
    setShowSuggestionsF(false);
  };

  const handleRemoveSerialF = (index: number) => {
    const updated = loanSerialsF.filter((_, i) => i !== index);
    setLoanSerialsF(updated);
  };

  const handleAddSerialN = (inputVal?: string) => {
    const raw = (inputVal !== undefined ? inputVal : serialInputN).trim();
    if (!raw) return;
    const tokens = raw.split(/[\s,\n]+/).map(t => resolveFullSerial(t, '101-N')).filter(Boolean);
    if (tokens.length === 0) return;
    const updated = Array.from(new Set([...loanSerialsN, ...tokens]));
    setLoanSerialsN(updated);
    setLoanQtyN(Math.max(loanQtyN, updated.length));
    setSerialInputN('');
    setShowSuggestionsN(false);
  };

  const handleRemoveSerialN = (index: number) => {
    const updated = loanSerialsN.filter((_, i) => i !== index);
    setLoanSerialsN(updated);
  };

  // Fetch available cylinders and hospital inventory from database on open
  useEffect(() => {
    if (isOpen && hospitalId) {
      const fetchAvailable = async () => {
        setIsLoadingCylinders(true);
        try {
          const { data, error: err } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .select(`
              *,
              type_info:pharmacy_oxygen_cylinder_types(*),
              size_info:pharmacy_oxygen_cylinder_sizes(*),
              department:departments(*)
            `)
            .eq('hospital_id', hospitalId)
            .neq('status', 'condemned')
            .neq('status', 'deactivated')
            .eq('is_active', true);

          if (!err && data) {
            setAllHospitalCylinders(data);

            // Filter in-stock / store available cylinders
            const inStock = data.filter((c: any) => {
              if (c.status === 'deactivated' || c.is_active === false) return false;
              const st = (c.status || '').toLowerCase();
              const loc = (c.current_location || '').toLowerCase();
              return st === 'available' || st === 'in_stock' || st === 'full' || loc.includes('store') || loc.includes('farmasi');
            });
            setAllAvailableCylinders(inStock);

            // Map or store standard trackable cylinders (filter out 101-N / 8m³ loan unit)
            const normalized = inStock
              .filter((c: any) => {
                const sizeCode = c.size_info?.code || '';
                const isLoan = c.supplier_tagged || c.is_loan || c.size_info?.is_loan || !sizeCode.startsWith('P');
                return !isLoan;
              })
              .map((c: any) => {
                const sizeCode = c.size_info?.code || '';
                const prefix = sizeCode.startsWith('P') ? sizeCode : `P${sizeCode}`;
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
                  size_code: sizeCode
                };
              });
            setAvailableCylinders(normalized);

            // Set default type filter to the first type
            const uniqueTypes = Array.from(
              new Set(normalized.map((c: any) => c.type_name_display))
            ).filter(Boolean).sort();
            if (uniqueTypes.length > 0) {
              setSelectedTypeFilter(uniqueTypes[0] as string);
            }
          }
        } catch (e) {
          console.error("Error loading available cylinders:", e);
        } finally {
          setIsLoadingCylinders(false);
        }
      };
      fetchAvailable();
    }
  }, [isOpen, hospitalId]);

  // Handle camera stream toggling
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraActive]);

  // Audio success/error sound indicator
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
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioCtx.close();
        }, 120);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioCtx.close();
        }, 250);
      }
    } catch (e) {
      console.warn("Audio Context beep unsupported:", e);
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
  useEffect(() => {
    let detectorInterval: any;
    if (cameraActive && useRealCamera && stream && videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

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
              handleCylinderSelectByCode(code.data);
            }
          }
        }
      }, 500);
    }
    return () => {
      if (detectorInterval) clearInterval(detectorInterval);
    };
  }, [cameraActive, useRealCamera, stream]);

  // Code normalizers for QR/Barcode matching
  const normalizeCode = (val?: string): string => {
    return (val || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const stripO2 = (val?: string): string => {
    return normalizeCode(val).replace(/^O2/, '');
  };

  // Code scanner or input submission logic
  const handleCylinderSelectByCode = async (code: string) => {
    let cleaned = code.trim();
    if (!cleaned) return;

    // Support QR codes that are encoded as URLs (extract the last segment as the serial/code)
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      try {
        const url = new URL(cleaned);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          cleaned = decodeURIComponent(pathSegments[pathSegments.length - 1]);
        }
      } catch (err) {
        console.warn("Failed to parse scanned URL:", err);
      }
    }

    // Check if loan cylinder is scanned
    const upper = cleaned.toUpperCase();
    if (upper.startsWith('101-N') || upper.startsWith('101-F') || upper.startsWith('101N') || upper.startsWith('101F')) {
      playBeep('error');
      setError(`"${cleaned}" is a loan cylinder and should be added using the "Loan Cylinders (Bulk)" tab instead.`);
      return;
    }

    const cleanNorm = normalizeCode(cleaned);
    const cleanStripped = stripO2(cleaned);
    const cleanLower = cleaned.toLowerCase();

    const matchesCylinder = (c: any) => {
      const s = (c.serial_number || '').toLowerCase();
      const q = (c.qr_code || '').toLowerCase();
      const sNorm = normalizeCode(c.serial_number);
      const qNorm = normalizeCode(c.qr_code);
      const sStrip = stripO2(c.serial_number);
      const qStrip = stripO2(c.qr_code);

      return (
        s === cleanLower ||
        q === cleanLower ||
        sNorm === cleanNorm ||
        qNorm === cleanNorm ||
        (cleanStripped && sStrip === cleanStripped) ||
        (cleanStripped && qStrip === cleanStripped) ||
        (cleanNorm.length >= 4 && (sNorm.endsWith(cleanNorm) || qNorm.endsWith(cleanNorm))) ||
        (cleanStripped.length >= 4 && (sStrip.endsWith(cleanStripped) || qStrip.endsWith(cleanStripped)))
      );
    };

    // 1. Find cylinder in available store inventory
    const match = availableCylinders.find(matchesCylinder);
    if (match) {
      toggleCylinderSelect(match);
      setQrInput('');
      setPendingActionCylinder(null);
      setError(null);
      return;
    }

    // 2. Check if cylinder exists anywhere in hospital inventory
    let hospitalMatch = allHospitalCylinders.find(matchesCylinder);

    // If still not found in memory, perform on-demand Supabase query
    if (!hospitalMatch && isSupabaseConfigured() && hospitalId) {
      try {
        const { data: dbCyls } = await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select(`
            *,
            type_info:pharmacy_oxygen_cylinder_types(*),
            size_info:pharmacy_oxygen_cylinder_sizes(*),
            department:departments(*)
          `)
          .eq('hospital_id', hospitalId)
          .neq('status', 'deactivated')
          .eq('is_active', true)
          .or(`serial_number.ilike.%${cleaned}%,qr_code.ilike.%${cleaned}%,serial_number.ilike.%${cleanStripped}%`);

        if (dbCyls && dbCyls.length > 0) {
          hospitalMatch = dbCyls.find(matchesCylinder) || dbCyls[0];
          if (hospitalMatch) {
            setAllHospitalCylinders(prev => {
              if (prev.some(p => p.id === hospitalMatch.id)) return prev;
              return [hospitalMatch, ...prev];
            });
          }
        }
      } catch (dbErr) {
        console.warn('On-demand cylinder search error:', dbErr);
      }
    }

    if (hospitalMatch) {
      if (hospitalMatch.status === 'deactivated' || hospitalMatch.is_active === false) {
        playBeep('error');
        setError(`Silinder "${hospitalMatch.serial_number}" telah dinyahaktifkan dan tidak boleh dikeluarkan.`);
        setPendingActionCylinder(null);
        return;
      }

      const status = (hospitalMatch.status || '').toLowerCase();
      const loc = hospitalMatch.department?.department_name || hospitalMatch.current_location || 'General Ward';

      // Format display name for candidate
      const sizeCode = hospitalMatch.size_info?.code || '';
      const prefix = sizeCode.startsWith('P') ? sizeCode : `P${sizeCode}`;
      const typeCode = hospitalMatch.type_info?.code || '';
      const capacity = hospitalMatch.size_info?.capacity ? `${Number(hospitalMatch.size_info.capacity)}${hospitalMatch.size_info.unit || 'm3'}` : '';
      const typeNameDisplay = `${prefix}${typeCode ? ` ${typeCode}` : ''}${capacity ? ` (${capacity})` : ''}`;
      const enrichedMatch = { ...hospitalMatch, type_name_display: typeNameDisplay, size_code: sizeCode };

      // If cylinder is available or store location, add directly
      if (status === 'available' || status === 'in_stock' || status === 'full' || loc.toLowerCase().includes('store') || loc.toLowerCase().includes('farmasi')) {
        toggleCylinderSelect(enrichedMatch);
        setQrInput('');
        setPendingActionCylinder(null);
        setError(null);
        return;
      }

      // If auto direct transfer mode is enabled, immediately add with transfer tag
      if (allowWardTransfer) {
        handleConfirmTransferAndSelect(enrichedMatch);
        return;
      }

      // Otherwise show smart action card for user confirmation
      playBeep('error');
      setPendingActionCylinder(enrichedMatch);
      setError(null);
      setQrInput('');
      return;
    }

    // 3. Cylinder not found in entire hospital database
    playBeep('error');
    setError(`Silinder "${cleaned}" tidak dijumpai dalam rekod inventori hospital.`);
    setPendingActionCylinder(null);
  };

  const handleConfirmTransferAndSelect = (cyl: any) => {
    const loc = cyl.department?.department_name || cyl.current_location || 'General Ward';
    const enriched = {
      ...cyl,
      is_transfer: true,
      transfer_from: loc,
      size_code: cyl.size_info?.code || cyl.size_code || '101-F'
    };
    setSelectedCylinders(prev => {
      if (prev.some(c => c.id === cyl.id)) return prev;
      return [...prev, enriched];
    });
    setPendingActionCylinder(null);
    setQrInput('');
    playBeep('success');
    setSuccessFlash(true);
    setTimeout(() => setSuccessFlash(false), 500);
    setError(null);
  };

  const handleCheckInToStoreAndSelect = async (cyl: any) => {
    setIsSubmittingAction(true);
    try {
      if (hospitalId) {
        // Update Supabase to available in Pharmacy Store
        await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .update({
            status: 'available',
            current_location: 'Pharmacy Store',
            department_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', cyl.id);

        // Record movement log
        await supabase
          .from('pharmacy_oxygen_cylinder_movements')
          .insert({
            hospital_id: hospitalId,
            cylinder_id: cyl.id,
            movement_type: 'returned',
            from_location: cyl.current_location || 'Ward',
            to_location: 'Pharmacy Store',
            moved_by: currentUser?.id || null,
            moved_at: new Date().toISOString(),
            remarks: 'Checked into Pharmacy Store via Manual Issue Modal'
          });
      }

      const enriched = {
        ...cyl,
        status: 'available',
        current_location: 'Pharmacy Store',
        department_id: null,
        size_code: cyl.size_info?.code || cyl.size_code || '101-F'
      };

      // Add to available cylinders and select it
      setAvailableCylinders(prev => [enriched, ...prev.filter(c => c.id !== cyl.id)]);
      setSelectedCylinders(prev => {
        if (prev.some(c => c.id === cyl.id)) return prev;
        return [...prev, enriched];
      });

      setPendingActionCylinder(null);
      setQrInput('');
      playBeep('success');
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 500);
      setError(null);
    } catch (err) {
      console.error('Error checking in cylinder:', err);
      setError('Gagal mendaftar masuk silinder ke stor: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const toggleCylinderSelect = (cyl: any) => {
    const isSelected = selectedCylinders.some(c => c.id === cyl.id);
    if (isSelected) {
      setSelectedCylinders(selectedCylinders.filter(c => c.id !== cyl.id));
    } else {
      const loc = cyl.department?.department_name || cyl.current_location || 'General Ward';
      const isTransfer = cyl.is_ward_cylinder || cyl.is_transfer || (cyl.status && cyl.status !== 'available' && !loc.toLowerCase().includes('store') && !loc.toLowerCase().includes('farmasi'));
      const enriched = {
        ...cyl,
        is_transfer: isTransfer,
        transfer_from: isTransfer ? (cyl.transfer_from || loc) : undefined
      };
      setSelectedCylinders([...selectedCylinders, enriched]);
      playBeep('success');
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 500);
    }
    setError(null);
    setPendingActionCylinder(null);
  };

  // Trackable cylinders in wards/departments (available for transfer)
  const wardCylinders = allHospitalCylinders
    .filter((c: any) => {
      const st = (c.status || '').toLowerCase();
      const loc = (c.current_location || '').toLowerCase();
      const sizeCode = c.size_info?.code || '';
      const isLoan = c.supplier_tagged || c.is_loan || c.size_info?.is_loan || !sizeCode.startsWith('P');
      return !isLoan && (st === 'issued' || st === 'allocated' || st === 'in_use' || (!loc.includes('store') && !loc.includes('farmasi') && st !== 'returned_to_supplier'));
    })
    .map((c: any) => {
      const sizeCode = c.size_info?.code || '';
      const prefix = sizeCode.startsWith('P') ? sizeCode : `P${sizeCode}`;
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
        is_ward_cylinder: true
      };
    });

  const currentDisplayPool = pickerScope === 'store' ? availableCylinders : wardCylinders;

  // Filter cylinders list by type/size, location and manual query
  const filteredAvailable = currentDisplayPool.filter(c => {
    if (selectedTypeFilter && c.type_name_display !== selectedTypeFilter) return false;
    if (!qrInput) return true;
    const query = qrInput.toLowerCase();
    const loc = (c.department?.department_name || c.current_location || '').toLowerCase();
    return (
      (c.serial_number || '').toLowerCase().includes(query) || 
      (c.qr_code || '').toLowerCase().includes(query) || 
      c.type_name_display.toLowerCase().includes(query) ||
      loc.includes(query)
    );
  });

  const availableTypes = Array.from(
    new Set(currentDisplayPool.map((c) => c.type_name_display))
  ).filter(Boolean).sort();

  // Pagination calculations
  const totalPickerItems = filteredAvailable.length;
  const totalPickerPages = Math.ceil(totalPickerItems / pickerPageSize);
  const paginatedCylinders = filteredAvailable.slice(
    (pickerPage - 1) * pickerPageSize,
    pickerPage * pickerPageSize
  );

  // Grouped by size and type
  const groupedCylinders = paginatedCylinders.reduce((acc: any, cyl: any) => {
    const key = cyl.type_name_display || 'Standard';
    if (!acc[key]) acc[key] = [];
    acc[key].push(cyl);
    return acc;
  }, {});

  // System users filter based on selected department
  const filteredUsers = selectedDeptId
    ? users.filter((u) => u.department_id === selectedDeptId)
    : [];

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) {
      setError('Please select a department.');
      return;
    }

    if (!isManualRequester && !selectedRequesterId) {
      setError('Please select a requesting user.');
      return;
    }

    if (isManualRequester && !manualRequesterName.trim()) {
      setError('Please enter the requester name manually.');
      return;
    }

    // Build the request items mapping both selected trackables and bulk loan cylinders
    const dispatchItems: { size_code: string; quantity: number; usage_notes?: string }[] = [];

    // 1. Group trackable cylinders by size code
    const trackableGroups: { [size: string]: any[] } = {};
    selectedCylinders.forEach(c => {
      const code = c.size_code || '101-N';
      if (!trackableGroups[code]) trackableGroups[code] = [];
      trackableGroups[code].push(c);
    });

    Object.keys(trackableGroups).forEach(code => {
      const cylList = trackableGroups[code];
      const serials = cylList.map((c: any) => c.serial_number || c.qr_code).filter(Boolean);
      const serialsStr = serials.join(', ');
      dispatchItems.push({
        size_code: code,
        quantity: cylList.length,
        usage_notes: serialsStr ? `Serials (${serials.length}): ${serialsStr}` : 'Trackable inventory cylinder'
      });
    });

    // 2. Add loan items if any
    if (loanQtyF > 0) {
      const serialsStr = loanSerialsF.filter(Boolean).join(', ');
      const usageNotes = [
        serialsStr ? `Serials (${loanSerialsF.length}): ${serialsStr}` : '',
        loanNotesF || 'Loan cylinder (1.4m³)'
      ].filter(Boolean).join(' | ');

      dispatchItems.push({
        size_code: '101-F',
        quantity: loanQtyF,
        usage_notes: usageNotes
      });
    }

    if (loanQtyN > 0) {
      const serialsStr = loanSerialsN.filter(Boolean).join(', ');
      const usageNotes = [
        serialsStr ? `Serials (${loanSerialsN.length}): ${serialsStr}` : '',
        loanNotesN || 'Loan cylinder (8.0m³)'
      ].filter(Boolean).join(' | ');

      dispatchItems.push({
        size_code: '101-N',
        quantity: loanQtyN,
        usage_notes: usageNotes
      });
    }

    if (dispatchItems.length === 0) {
      setError('Please scan trackable cylinders or enter loan cylinder quantities.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const selectedUser = users.find(u => u.id === selectedRequesterId);

      // Collect cylinder IDs from both trackable selections AND matched loan serial numbers
      const matchedLoanCylIds: string[] = [];
      const allAddedLoanSerials = [...loanSerialsF, ...loanSerialsN];
      
      allAddedLoanSerials.forEach(s => {
        const found = allAvailableCylinders.find(c => 
          (c.serial_number && c.serial_number.toLowerCase() === s.toLowerCase()) ||
          (c.qr_code && c.qr_code.toLowerCase() === s.toLowerCase())
        );
        if (found && !matchedLoanCylIds.includes(found.id)) {
          matchedLoanCylIds.push(found.id);
        }
      });

      const allCylinderIds = Array.from(new Set([
        ...selectedCylinders.map(c => c.id),
        ...matchedLoanCylIds
      ]));

      await onSubmit({
        department_id: selectedDeptId,
        items: dispatchItems,
        remarks: remarks || undefined,
        requested_by: isManualRequester ? undefined : selectedRequesterId,
        manual_requester_name: isManualRequester ? manualRequesterName : selectedUser?.full_name,
        cylinder_ids: allCylinderIds
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideInFromRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
      <div 
        className="bg-slate-50 w-full max-w-2xl h-full rounded-l-3xl shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-slate-200/80 flex items-center justify-between bg-white shadow-sm relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Borang Pengeluaran Silinder Manual</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Record a manual cylinder issue to a department directly.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all duration-200 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 sm:space-y-6 bg-slate-50/50">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl sm:rounded-2xl flex items-start gap-2.5 text-rose-800 text-sm animate-in fade-in zoom-in-95 duration-200">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Department Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Requesting Department *
            </label>
            <div className="relative">
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedRequesterId('');
                }}
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 rounded-xl sm:rounded-2xl bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold appearance-none cursor-pointer"
                required
              >
                <option value="">Select Department...</option>
                {(() => {
                  const ALLOWED_CYLINDER_DEPTS = [
                    { key: 'general_ward', name: 'General ward', match: (n: string, c: string) => (n.includes('general') && n.includes('ward')) || c === 'GENERAL_WARD' },
                    { key: 'paediatric_ward', name: 'Paediatric ward', match: (n: string, c: string) => n.includes('paediatric') || n.includes('pediatric') || c === 'PAEDIATRIC_WARD' },
                    { key: 'maternity_ward', name: 'Maternity Ward', match: (n: string, c: string) => n.includes('maternity') || c === 'MATERNITY_WARD' },
                    { key: 'emergency_trauma', name: 'Emergency and Trauma', match: (n: string, c: string) => (n.includes('emergency') && !n.includes('pharmacy')) || n.includes('trauma') || c === 'EMERGENCY_TRAUMA' },
                    { key: 'radiology', name: 'Radiology and Radiography', match: (n: string, c: string) => n.includes('radiolog') || c === 'RADIOLOGY' },
                    { key: 'nephrology', name: 'Nephrology', match: (n: string, c: string) => n.includes('nephrolog') || c === 'NEPHROLOGY' },
                    { key: 'operation_theater', name: 'Operation Theater', match: (n: string, c: string) => n.includes('operation') || n.includes('theater') || n.includes('theatre') || c === 'OPERATION_THEATER' },
                  ];

                  const listToRender: { id: string; department_name: string }[] = [];
                  for (const def of ALLOWED_CYLINDER_DEPTS) {
                    const found = (departments || []).find((d) => {
                      const n = (d.department_name || '').toLowerCase().trim();
                      const c = ((d as any).department_code || '').toUpperCase().trim();
                      return def.match(n, c);
                    });
                    if (found) {
                      listToRender.push({ id: found.id, department_name: def.name });
                    }
                  }

                  return (listToRender.length > 0 ? listToRender : (departments || [])).map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ));
                })()}
              </select>
              <div className="absolute right-3.5 top-3 sm:top-3.5 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Requester Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Requested By (Requester) *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsManualRequester(!isManualRequester);
                  setSelectedRequesterId('');
                  setManualRequesterName('');
                  setError(null);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
              >
                {isManualRequester ? 'Choose from system users' : 'Enter name manually'}
              </button>
            </div>

            {isManualRequester ? (
              <input
                type="text"
                placeholder="Enter requester name manually..."
                value={manualRequesterName}
                onChange={(e) => setManualRequesterName(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 rounded-xl sm:rounded-2xl bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
                required
              />
            ) : (
              <div className="relative">
                <select
                  value={selectedRequesterId}
                  onChange={(e) => setSelectedRequesterId(e.target.value)}
                  disabled={!selectedDeptId}
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 rounded-xl sm:rounded-2xl bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {selectedDeptId ? 'Select Requester...' : 'Please select department first...'}
                  </option>
                  {selectedDeptId && (filteredUsers || []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} {u.jawatan ? `(${u.jawatan})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-3 sm:top-3.5 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            )}
          </div>

          {/* Tab Selector: Trackable vs Loan */}
          <div className="space-y-3.5">
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cylinders to Dispatch *
            </label>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 shadow-inner gap-2 bg-gradient-to-b from-slate-100 to-slate-200/60">
              <button
                type="button"
                onClick={() => setCylinderTab('trackable')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer focus:outline-none ${
                  cylinderTab === 'trackable' 
                    ? 'bg-white text-indigo-700 shadow-md border border-indigo-250/70 ring-2 ring-indigo-500/5' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                <QrCode className={`w-4 h-4 shrink-0 transition-transform ${cylinderTab === 'trackable' ? 'scale-110 text-indigo-600' : 'text-slate-400'}`} />
                <span>Trackable Cylinders (Scan & Pick)</span>
              </button>
              <button
                type="button"
                onClick={() => { setCylinderTab('loan'); stopCamera(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer focus:outline-none ${
                  cylinderTab === 'loan' 
                    ? 'bg-white text-indigo-700 shadow-md border border-indigo-250/70 ring-2 ring-indigo-500/5' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                <Store className={`w-4 h-4 shrink-0 transition-transform ${cylinderTab === 'loan' ? 'scale-110 text-indigo-600' : 'text-slate-400'}`} />
                <span>Loan Cylinders (Bulk/Manual)</span>
              </button>
            </div>

            {/* Cylinder Content A: Trackables (QR + DB Picker) */}
            {cylinderTab === 'trackable' && (
              <div className="space-y-4">
                
                {/* Embedded Camera / Manual Scan UI */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-inner text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Camera Console</span>
                      <span className="text-[9px] text-slate-500 font-mono">QR & Barcode Reader</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAllowWardTransfer(!allowWardTransfer)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                          allowWardTransfer
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="Benarkan pemindahan terus silinder yang berada di wad tanpa prompt tambahan"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${allowWardTransfer ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span>Auto-Pindah Wad {allowWardTransfer ? 'ON' : 'OFF'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title={soundEnabled ? 'Mute' : 'Unmute'}
                      >
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCameraActive(!cameraActive)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold font-mono transition-all cursor-pointer ${
                          cameraActive 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {cameraActive ? 'SHUTDOWN LENS' : 'ACTIVATE CAMERA'}
                      </button>
                    </div>
                  </div>

                  {cameraActive && (
                    <div className={`relative aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col items-center justify-center shadow-inner transition-all duration-300 ${successFlash ? 'ring-8 ring-emerald-500/30' : ''}`}>
                      {successFlash && (
                        <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-xs flex items-center justify-center z-25">
                          <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                        </div>
                      )}
                      {useRealCamera ? (
                        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center p-4">
                          <QrCode className="w-6 h-6 text-indigo-400 animate-pulse mb-1.5" />
                          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">LENS STREAM ACTIVE</span>
                        </div>
                      )}
                      <div className="absolute inset-x-8 top-1/2 h-0.5 bg-indigo-500 shadow-[0_0_8px_#4f46e5] animate-[pulse_1.2s_infinite] z-10" />
                      <div className="absolute inset-6 border border-slate-500/15 rounded-lg pointer-events-none z-10">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-indigo-400" />
                      </div>
                    </div>
                  )}

                  {/* Manual search query line inside Console */}
                  <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-1.5 flex gap-2 shadow-inner">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 mt-2 ml-1" />
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="Scan QR or search serial key..."
                      className="flex-1 px-1.5 py-1.5 bg-transparent text-xs font-semibold text-white placeholder-slate-500 focus:outline-none border-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCylinderSelectByCode(qrInput)}
                      disabled={!qrInput.trim()}
                      className="px-4 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      Pick
                    </button>
                  </div>
                </div>

                {/* Ward / External Cylinder Action Card */}
                {pendingActionCylinder && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5 shadow-xs">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                            Silinder Ditemui di Lokasi Lain
                          </span>
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md uppercase">
                            Status: {pendingActionCylinder.status}
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 mt-1.5 font-medium leading-relaxed">
                          Silinder <strong className="font-mono text-amber-950 font-bold bg-white/80 px-1.5 py-0.5 rounded border border-amber-200">{pendingActionCylinder.serial_number || pendingActionCylinder.qr_code}</strong> ({pendingActionCylinder.type_name_display || pendingActionCylinder.size_info?.code || 'P101-F'}) sedang direkodkan di lokasi <strong className="text-amber-950 underline decoration-amber-300 decoration-2 font-bold">{pendingActionCylinder.department?.department_name || (typeof pendingActionCylinder.current_location === 'object' ? (pendingActionCylinder.current_location as any)?.location_name : pendingActionCylinder.current_location) || 'General Ward'}</strong>.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingActionCylinder(null)}
                        className="text-amber-400 hover:text-amber-700 p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-200/80">
                      <button
                        type="button"
                        onClick={() => setPendingActionCylinder(null)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-2xs"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingAction}
                        onClick={() => handleCheckInToStoreAndSelect(pendingActionCylinder)}
                        className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSubmittingAction ? 'animate-spin' : ''}`} />
                        <span>Daftar Masuk Stor & Pilih</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingAction}
                        onClick={() => handleConfirmTransferAndSelect(pendingActionCylinder)}
                        className="px-4 py-1.5 text-xs font-black text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span>⚡ Pindahkan & Masukkan ke Borang</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Collapsible Supabase cylinder picker */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setShowPicker(!showPicker)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer focus:outline-none"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Pilih Silinder dari Pengkalan Data</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[9px] font-bold">
                        <button
                          type="button"
                          onClick={() => setPickerScope('store')}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            pickerScope === 'store'
                              ? 'bg-white text-indigo-700 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Stor ({availableCylinders.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPickerScope('wards')}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            pickerScope === 'wards'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Pindah Wad ({wardCylinders.length})
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg font-bold border border-indigo-100/50 cursor-pointer"
                      >
                        {showPicker ? 'Hide List' : 'Show List'}
                      </button>
                    </div>
                  </div>

                  {showPicker && (
                    <div className="space-y-4 pt-3 border-t border-slate-200/50">
                      
                      {/* Size & Type Filter Tabs */}
                      <div className="flex flex-wrap gap-1.5 pb-2.5 border-b border-slate-100">
                        {availableTypes.map((tName) => {
                          const count = currentDisplayPool.filter(c => c.type_name_display === tName).length;
                          return (
                            <button
                              key={tName}
                              type="button"
                              onClick={() => setSelectedTypeFilter(tName)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer focus:outline-none ${
                                selectedTypeFilter === tName
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-250 text-slate-650'
                              }`}
                            >
                              {tName} ({count})
                            </button>
                          );
                        })}
                      </div>

                      {isLoadingCylinders ? (
                        <div className="text-center py-8 text-[11px] font-semibold text-slate-400 animate-pulse">
                          Fetching database stock...
                        </div>
                      ) : Object.keys(groupedCylinders).length === 0 ? (
                        <div className="text-center py-8 text-[11px] text-slate-400 italic">
                          Tiada silinder sepadan penapis carian.
                        </div>
                      ) : (
                        <div className="space-y-3.5 pr-1">
                          {Object.keys(groupedCylinders).map((typeName) => (
                            <div key={typeName} className="space-y-1.5">
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block bg-slate-100/60 px-2 py-1 rounded">
                                {typeName}
                              </span>
                              <div className="grid grid-cols-4 gap-2">
                                {groupedCylinders[typeName].map((cyl: any) => {
                                  const isSelected = selectedCylinders.some(sc => sc.id === cyl.id);
                                  return (
                                    <button
                                      key={cyl.id}
                                      type="button"
                                      onClick={() => toggleCylinderSelect(cyl)}
                                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer shadow-2xs w-full text-xs ${
                                        isSelected 
                                          ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' 
                                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                                      }`}
                                    >
                                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                                      }`}>
                                        {isSelected && <Check className="w-2 h-2" />}
                                      </div>
                                      <span className="font-mono text-[9px] sm:text-[10px] whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                                        {(cyl.serial_number || cyl.qr_code || '').replace(/\s*\(\d+(?:\.\d+)?\s*(?:m3|m┬│)\)/gi, '')}
                                        {cyl.is_ward_cylinder && (
                                          <span className="text-[8px] text-amber-700 font-sans block truncate font-bold">
                                            {cyl.department?.department_name || (typeof cyl.current_location === 'object' ? (cyl.current_location as any)?.location_name : cyl.current_location) || 'Wad'}
                                          </span>
                                        )}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pagination Controls */}
                      {totalPickerPages > 1 && (
                        <div className="flex items-center justify-between pt-2.5 text-[10px] font-bold text-slate-500 border-t border-slate-100">
                          <span>
                            Showing {(pickerPage - 1) * pickerPageSize + 1} - {Math.min(pickerPage * pickerPageSize, totalPickerItems)} of {totalPickerItems} cylinders
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              disabled={pickerPage === 1}
                              onClick={() => setPickerPage(prev => Math.max(1, prev - 1))}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors font-bold text-[10px] focus:outline-none"
                            >
                              Prev
                            </button>
                            <button
                              type="button"
                              disabled={pickerPage === totalPickerPages}
                              onClick={() => setPickerPage(prev => Math.min(totalPickerPages, prev + 1))}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors font-bold text-[10px] focus:outline-none"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected log view */}
                {selectedCylinders.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                      <span>Cylinders Added to Dispatch List:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCylinders([])}
                        className="text-[10px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer"
                      >
                        Reset List
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200/80 rounded-2xl shadow-inner">
                      {selectedCylinders.map(cyl => (
                        <div key={cyl.id} className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-950 font-mono">
                          <span>{cyl.serial_number}</span>
                          {cyl.is_transfer && (
                            <span className="text-[9px] font-sans font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                              Pindah dari {cyl.transfer_from || 'Wad'}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleCylinderSelect(cyl)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 rounded-md hover:bg-indigo-100 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cylinder Content B: Loan cylinders */}
            {cylinderTab === 'loan' && (
              <div className="space-y-4 bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs">
                <div className="flex flex-col gap-0.5 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loan / Temporary Cylinders</span>
                  <span className="text-[9px] text-slate-450 font-semibold">Bulk entries not requiring tracking numbers</span>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Loan cylinder 101-F */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl flex flex-col gap-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">101-F (1.4m³)</span>
                        <span className="text-[10px] text-slate-500 block font-semibold">Medium Size Loan Cylinder</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLoanQtyF(Math.max(0, loanQtyF - 1))}
                          className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shadow-2xs cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={loanQtyF}
                          onChange={(e) => setLoanQtyF(Math.max(0, Number(e.target.value)))}
                          className="w-12 py-1 border border-slate-250 bg-white rounded-lg text-center text-xs font-black text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setLoanQtyF(loanQtyF + 1)}
                          className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shadow-2xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Serial Numbers Input for 101-F */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                        Cylinder Serial Nos (e.g. Saboxy / Supplier)
                      </label>
                      <div className="flex gap-2 relative">
                        <input
                          type="text"
                          placeholder="Type/paste serial no (e.g. SBX-001, 3051)..."
                          value={serialInputF}
                          onFocus={() => setShowSuggestionsF(true)}
                          onBlur={() => {
                            setTimeout(() => setShowSuggestionsF(false), 200);
                          }}
                          onChange={(e) => {
                            setSerialInputF(e.target.value);
                            setShowSuggestionsF(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              handleAddSerialF();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 border border-slate-250 bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSerialF()}
                          disabled={!serialInputF.trim()}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>

                      {/* Autocomplete Suggestions Popup for 101-F */}
                      {showSuggestionsF && serialInputF.trim().length > 0 && (() => {
                        const suggestions = getSerialSuggestions('101-F', serialInputF);
                        return (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 ring-1 ring-slate-900/5">
                            <div className="px-3 py-1.5 bg-slate-50/95 flex items-center justify-between sticky top-0 backdrop-blur-xs z-10">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                Matching Cylinders ({suggestions.length})
                              </span>
                              <span className="text-[9px] text-indigo-600 font-bold">Click to add</span>
                            </div>
                            {suggestions.length > 0 ? (
                              suggestions.map((sugg) => (
                                <button
                                  key={sugg.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleAddSerialF(sugg.full_serial);
                                  }}
                                  className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50/80 flex items-center justify-between transition-colors cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs text-slate-900 font-mono group-hover:text-indigo-700">
                                      🏷️ {sugg.full_serial}
                                    </span>
                                    {sugg.is_db_match && (
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                        In Stock
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white border border-indigo-100 px-2.5 py-0.5 rounded-lg transition-all">
                                    + Add
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-center">
                                <p className="text-xs text-slate-500 mb-2">No matching cylinder found in stock.</p>
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleAddSerialF(serialInputF);
                                  }}
                                  className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors border border-indigo-200 cursor-pointer"
                                >
                                  + Add "{serialInputF.trim()}" as custom serial
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {loanSerialsF.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {loanSerialsF.map((s, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-[10px] font-extrabold font-mono shadow-2xs">
                              🏷️ {s}
                              <button
                                type="button"
                                onClick={() => handleRemoveSerialF(idx)}
                                className="text-indigo-500 hover:text-indigo-900 ml-0.5 cursor-pointer font-bold"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {loanQtyF > 0 && (
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {loanSerialsF.length} of {loanQtyF} serial numbers entered
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Usage notes for 101-F loan..."
                      value={loanNotesF}
                      onChange={(e) => setLoanNotesF(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Loan cylinder 101-N */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl flex flex-col gap-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">101-N (8.0m³)</span>
                        <span className="text-[10px] text-slate-500 block font-semibold">Large Size Loan Cylinder</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLoanQtyN(Math.max(0, loanQtyN - 1))}
                          className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shadow-2xs cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={loanQtyN}
                          onChange={(e) => setLoanQtyN(Math.max(0, Number(e.target.value)))}
                          className="w-12 py-1 border border-slate-250 bg-white rounded-lg text-center text-xs font-black text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setLoanQtyN(loanQtyN + 1)}
                          className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shadow-2xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Serial Numbers Input for 101-N */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                        Cylinder Serial Nos (e.g. Saboxy / Supplier)
                      </label>
                      <div className="flex gap-2 relative">
                        <input
                          type="text"
                          placeholder="Type/paste serial no (e.g. SBX-001, 3051)..."
                          value={serialInputN}
                          onFocus={() => setShowSuggestionsN(true)}
                          onBlur={() => {
                            setTimeout(() => setShowSuggestionsN(false), 200);
                          }}
                          onChange={(e) => {
                            setSerialInputN(e.target.value);
                            setShowSuggestionsN(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              handleAddSerialN();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 border border-slate-250 bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSerialN()}
                          disabled={!serialInputN.trim()}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>

                      {/* Autocomplete Suggestions Popup for 101-N */}
                      {showSuggestionsN && serialInputN.trim().length > 0 && (() => {
                        const suggestions = getSerialSuggestions('101-N', serialInputN);
                        return (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 ring-1 ring-slate-900/5">
                            <div className="px-3 py-1.5 bg-slate-50/95 flex items-center justify-between sticky top-0 backdrop-blur-xs z-10">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                Matching Cylinders ({suggestions.length})
                              </span>
                              <span className="text-[9px] text-indigo-600 font-bold">Click to add</span>
                            </div>
                            {suggestions.length > 0 ? (
                              suggestions.map((sugg) => (
                                <button
                                  key={sugg.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleAddSerialN(sugg.full_serial);
                                  }}
                                  className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50/80 flex items-center justify-between transition-colors cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs text-slate-900 font-mono group-hover:text-indigo-700">
                                      🏷️ {sugg.full_serial}
                                    </span>
                                    {sugg.is_db_match && (
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                        In Stock
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white border border-indigo-100 px-2.5 py-0.5 rounded-lg transition-all">
                                    + Add
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-center">
                                <p className="text-xs text-slate-500 mb-2">No matching cylinder found in stock.</p>
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleAddSerialN(serialInputN);
                                  }}
                                  className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors border border-indigo-200 cursor-pointer"
                                >
                                  + Add "{serialInputN.trim()}" as custom serial
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {loanSerialsN.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {loanSerialsN.map((s, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-[10px] font-extrabold font-mono shadow-2xs">
                              🏷️ {s}
                              <button
                                type="button"
                                onClick={() => handleRemoveSerialN(idx)}
                                className="text-indigo-500 hover:text-indigo-900 ml-0.5 cursor-pointer font-bold"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {loanQtyN > 0 && (
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {loanSerialsN.length} of {loanQtyN} serial numbers entered
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Usage notes for 101-N loan..."
                      value={loanNotesN}
                      onChange={(e) => setLoanNotesN(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Remarks / Justification
            </label>
            <textarea
              placeholder="Enter additional remarks or justification..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 rounded-xl sm:rounded-2xl bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Current User Info Card */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs text-slate-600 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-xl">
                <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recorded by Officer (Issuer)</span>
                <span className="font-extrabold text-slate-800 text-xs block mt-0.5">{currentUser?.full_name || 'Loading user...'}</span>
              </div>
            </div>
            <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] uppercase">
              {currentUser?.jawatan || 'Officer'}
            </span>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-t border-slate-200/80 flex justify-end gap-3 bg-white relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl sm:rounded-2xl text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitForm}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl sm:rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/10 transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
          >
            {isSubmitting ? 'Submitting...' : 'Issue Cylinders'}
          </button>
        </div>
      </div>
    </div>
  );
};
