// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  X, CheckCircle, CheckCircle2, Play, Ban, Receipt, Check, FileText, 
  ChevronRight, User, Camera, Keyboard, Database, QrCode, 
  AlertCircle, RefreshCw, Volume2, VolumeX, Search, Plus, Trash2, 
  ShieldAlert, ChevronDown, ChevronUp, PackageCheck, Layers, 
  Edit3, Share2, Building2, Copy, CheckCheck, Clock, ShieldCheck, 
  Zap, Flame, AlertTriangle, CornerDownLeft, Barcode, Info
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import type { CylinderDispatchRequestWithRelations } from '@/types/pharmacy';
import type { User as UserType } from '@/types';
import { getCylinderByQrOrSerial } from '@/modules/mycylinder/services/oxygenService';
import { isCylinderAuthorizedOfficer } from '@/shared/utils/cylinderRbac';

export const formatCylinderSizeLabel = (sizeCode?: string, usageNotes?: string): string => {
  if (!sizeCode) return '-';
  const clean = sizeCode.toUpperCase().trim();
  const norm = clean.replace(/\s+/g, '').replace(/–|—/g, '-');
  const notes = (usageNotes || '').toUpperCase();

  const isBN = norm.includes('BN') || norm.includes('BULLNOSE') || notes.includes('BULLNOSE') || notes.includes('BULL NOSE') || notes.includes('BN');
  const isPI = norm.includes('PI') || norm.includes('PININDEX') || notes.includes('PIN INDEX') || notes.includes('PININDEX') || notes.includes('PI');

  if (norm.includes('101-N') || norm.includes('101N')) return '101-N — Bull Nose (8.0m³)';
  if (norm.includes('101-HS') || norm.includes('101HS')) return 'P101-HS — Bull Nose (6.4m³)';
  if (norm.includes('101-E') || norm.includes('101E')) return 'P101-E — Pin Index (0.7m³)';
  if (norm.includes('101-D') || norm.includes('101D')) return 'P101-D — Pin Index (0.5m³)';

  if (norm.includes('101-F') || norm.includes('101F')) {
    if (isBN) return 'P101-F — Bull Nose (1.4m³)';
    if (isPI) return '101-F — Pin Index (1.4m³)';
    if (norm.startsWith('P') || norm.includes('P101')) return 'P101-F — Bull Nose (1.4m³)';
    return '101-F — Pin Index (1.4m³)';
  }

  return sizeCode;
};

export function getRequestedCylinderSpec(item: any): {
  sizeCode: string;
  sizeId?: string;
  valveType: 'BN' | 'PI';
} {
  const rawCode = (item?.size_code || '').toUpperCase().trim();
  const normCode = rawCode.replace(/\s+/g, '').replace(/–|—/g, '-');
  const notes = (item?.usage_notes || '').toUpperCase();
  const sizeId = item?.cylinder_size_id;

  const isBN = normCode.includes('BN') || normCode.includes('BULLNOSE') || notes.includes('BULLNOSE') || notes.includes('BULL NOSE') || notes.includes('BN');
  const isPI = normCode.includes('PI') || normCode.includes('PININDEX') || notes.includes('PIN INDEX') || notes.includes('PININDEX') || notes.includes('PI');

  let valveType: 'BN' | 'PI' = 'BN';
  let normSizeCode = rawCode;

  if (normCode.includes('101-N') || normCode.includes('101N')) {
    valveType = 'BN';
    normSizeCode = '101-N';
  } else if (normCode.includes('101-HS') || normCode.includes('101HS')) {
    valveType = 'BN';
    normSizeCode = 'P101-HS';
  } else if (normCode.includes('101-E') || normCode.includes('101E')) {
    valveType = 'PI';
    normSizeCode = 'P101-E';
  } else if (normCode.includes('101-D') || normCode.includes('101D')) {
    valveType = 'PI';
    normSizeCode = 'P101-D';
  } else if (normCode.includes('101-F') || normCode.includes('101F')) {
    if (isBN) {
      valveType = 'BN';
      normSizeCode = 'P101-F';
    } else if (isPI) {
      valveType = 'PI';
      normSizeCode = '101-F';
    } else if (normCode.startsWith('P') || normCode.includes('P101')) {
      valveType = 'BN';
      normSizeCode = 'P101-F';
    } else {
      valveType = 'PI';
      normSizeCode = '101-F';
    }
  }

  return {
    sizeCode: normSizeCode,
    sizeId,
    valveType,
  };
}

export interface CylinderCatalogOption {
  key: string;
  size_id: string;
  size_code: string;
  valve_type: 'BN' | 'PI';
  label: string;
  capacity: string;
  usage_tag: string;
}

export const CYLINDER_CATALOG_OPTIONS: CylinderCatalogOption[] = [
  {
    key: '101-N_BN',
    size_id: '332911a0-9e8c-4c0e-980a-9df3d0197dce',
    size_code: '101-N',
    valve_type: 'BN',
    label: '101-N — Bull Nose (8.0m³)',
    capacity: '8.0m³',
    usage_tag: '[Bullnose BN]'
  },
  {
    key: '101-F_PI',
    size_id: '2175d196-4e97-4bb9-bfaa-c335a25743d3',
    size_code: '101-F',
    valve_type: 'PI',
    label: '101-F — Pin Index (1.4m³)',
    capacity: '1.4m³',
    usage_tag: '[Pin Index PI]'
  },
  {
    key: 'P101-F_BN',
    size_id: '1f04245e-de6a-4598-bab2-5b5a421e606a',
    size_code: 'P101-F',
    valve_type: 'BN',
    label: 'P101-F — Bull Nose (1.4m³)',
    capacity: '1.4m³',
    usage_tag: '[Bullnose BN]'
  },
  {
    key: 'P101-HS_BN',
    size_id: '0b3d30f9-d4fc-4d94-b624-d993d1f8098d',
    size_code: 'P101-HS',
    valve_type: 'BN',
    label: 'P101-HS — Bull Nose (6.4m³)',
    capacity: '6.4m³',
    usage_tag: '[Bullnose BN]'
  },
  {
    key: 'P101-E_PI',
    size_id: '16207ded-639a-4240-92ad-a2a06d95a0a5',
    size_code: 'P101-E',
    valve_type: 'PI',
    label: 'P101-E — Pin Index (0.7m³)',
    capacity: '0.7m³',
    usage_tag: '[Pin Index PI]'
  },
  {
    key: 'P101-D_PI',
    size_id: 'f5a38d74-4d0d-49c4-af20-1dab5f5cb852',
    size_code: 'P101-D',
    valve_type: 'PI',
    label: 'P101-D — Pin Index (0.5m³)',
    capacity: '0.5m³',
    usage_tag: '[Pin Index PI]'
  }
];

export const getCatalogOptionForItem = (item: any): CylinderCatalogOption => {
  const spec = getRequestedCylinderSpec(item);
  if (item?.cylinder_size_id) {
    const byId = CYLINDER_CATALOG_OPTIONS.find(
      (o) => o.size_id === item.cylinder_size_id && o.valve_type === spec.valveType
    );
    if (byId) return byId;

    const byIdDirect = CYLINDER_CATALOG_OPTIONS.find(
      (o) => o.size_id === item.cylinder_size_id
    );
    if (byIdDirect) return byIdDirect;
  }
  const byCode = CYLINDER_CATALOG_OPTIONS.find(
    (o) => o.size_code === spec.sizeCode && o.valve_type === spec.valveType
  );
  if (byCode) return byCode;

  const bySize = CYLINDER_CATALOG_OPTIONS.find((o) => o.size_code === spec.sizeCode);
  if (bySize) return bySize;

  return CYLINDER_CATALOG_OPTIONS[0];
};

export const isCylinderMatchingItem = (cylinder: any, item: any): boolean => {
  if (!cylinder || !item) return false;

  const spec = getRequestedCylinderSpec(item);
  const cylSizeCode = (cylinder.size_info?.code || cylinder.size_code || '').toUpperCase().trim();
  const cylTypeCode = (cylinder.type_info?.code || cylinder.valve_type || '').toUpperCase().trim();
  const cylTypeName = (cylinder.type_info?.name || '').toUpperCase().trim();
  const serialUpper = (cylinder.serial_number || cylinder.qr_code || '').toUpperCase().trim();

  // 1. Strict Valve / Connection Type Check (Bullnose vs Pin Index)
  const isCylBN = 
    cylTypeCode === 'BN' || 
    cylTypeName.includes('BULL') || 
    cylSizeCode.includes('BN') || 
    cylSizeCode === '101-N' || 
    cylSizeCode === 'P101-HS' ||
    cylSizeCode === 'P101-F' ||
    serialUpper.includes('-BN-') ||
    serialUpper.includes('P101-F') ||
    serialUpper.includes('P101-HS') ||
    serialUpper.includes('101-N');

  const isCylPI = 
    cylTypeCode === 'PI' || 
    cylTypeName.includes('PIN') || 
    cylSizeCode.includes('PI') || 
    cylSizeCode === 'P101-E' || 
    cylSizeCode === 'P101-D' ||
    cylSizeCode === '101-F' ||
    serialUpper.includes('-PI-') ||
    serialUpper.includes('101-F') ||
    serialUpper.includes('P101-E') ||
    serialUpper.includes('P101-D');

  if (spec.valveType === 'BN' && !isCylBN) return false;
  if (spec.valveType === 'PI' && !isCylPI) return false;

  // 2. Direct cylinder_size_id match if both have it
  if (item.cylinder_size_id && cylinder.cylinder_size_id) {
    if (cylinder.cylinder_size_id === item.cylinder_size_id) {
      return true;
    }
  }
  if (item.cylinder_size_id && cylinder.size_info?.id) {
    if (cylinder.size_info.id === item.cylinder_size_id) {
      return true;
    }
  }

  // 3. Match by normalized size code
  if (spec.sizeCode === 'P101-F') {
    return (cylSizeCode === 'P101-F' || cylSizeCode.includes('101F') || serialUpper.includes('P101-F') || serialUpper.includes('P101F')) && isCylBN;
  }
  if (spec.sizeCode === '101-F') {
    return (cylSizeCode === '101-F' || cylSizeCode.includes('101F') || serialUpper.includes('101-F') || serialUpper.includes('101F')) && isCylPI;
  }
  if (spec.sizeCode === '101-N') {
    return (cylSizeCode === '101-N' || cylSizeCode.includes('101N') || serialUpper.includes('101-N') || serialUpper.includes('101N')) && isCylBN;
  }
  if (spec.sizeCode === 'P101-HS') {
    return (cylSizeCode === 'P101-HS' || cylSizeCode.includes('101HS') || serialUpper.includes('P101-HS') || serialUpper.includes('101HS')) && isCylBN;
  }
  if (spec.sizeCode === 'P101-E') {
    return (cylSizeCode === 'P101-E' || cylSizeCode.includes('101E') || serialUpper.includes('P101-E') || serialUpper.includes('101E')) && isCylPI;
  }
  if (spec.sizeCode === 'P101-D') {
    return (cylSizeCode === 'P101-D' || cylSizeCode.includes('101D') || serialUpper.includes('P101-D') || serialUpper.includes('101D')) && isCylPI;
  }

  return false;
};

const formatLocation = (loc: any, fallback = 'Stor Farmasi'): string => {
  if (!loc) return fallback;
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object') {
    return loc.location_name || loc.name || loc.label || fallback;
  }
  return String(loc);
};

interface DispatchRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CylinderDispatchRequestWithRelations | null;
  currentUser: UserType | null;
  onApprove: (
    requestId: string,
    adjustedItems?: { id: string; quantity: number; quantity_issued?: number }[]
  ) => Promise<void>;
  onReject: (requestId: string, reason: string) => Promise<void>;
  onIssue: (
    requestId: string,
    items: { id: string; quantity_issued: number; cylinder_id?: string; cylinder_ids?: string[] }[]
  ) => Promise<void>;
  onComplete: (requestId: string) => Promise<void>;
  onCancel?: (requestId: string) => Promise<void>;
  onUpdateItems?: (
    requestId: string,
    items: { id?: string; size_id?: string; size_code?: string; quantity: number; quantity_issued?: number; usage_notes?: string }[],
    reason?: string
  ) => Promise<void>;
  onDelete?: (request: CylinderDispatchRequestWithRelations) => void;
}

export const DispatchRequestDetailModal: React.FC<DispatchRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  currentUser,
  onApprove,
  onReject,
  onIssue,
  onComplete,
  onCancel,
  onUpdateItems,
  onDelete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [supplyQuantities, setSupplyQuantities] = useState<{ [itemId: string]: number | string }>({});
  const [issueData, setIssueData] = useState<{ [itemId: string]: { qty: number; cylinderId: string } }>({});
  const [allAvailableCylinders, setAllAvailableCylinders] = useState<any[]>([]);
  const [isLoadingCylinders, setIsLoadingCylinders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Cylinder assignment states per item
  const [assignedCylinders, setAssignedCylinders] = useState<{ [itemId: string]: any[] }>({});
  const [scanInputs, setScanInputs] = useState<{ [itemId: string]: string }>({});
  const [itemErrors, setItemErrors] = useState<{ [itemId: string]: string | null }>({});
  const [showInventoryBrowser, setShowInventoryBrowser] = useState<{ [itemId: string]: boolean }>({});
  const [searchQueries, setSearchQueries] = useState<{ [itemId: string]: string }>({});
  
  // Camera scanning state
  const [cameraActiveItemId, setCameraActiveItemId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editingItems, setEditingItems] = useState<any[]>([]);
  const [editReason, setEditReason] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Synchronize supplyQuantities and editingItems when request changes
  useEffect(() => {
    if (request && request.items) {
      const initialSupply: { [itemId: string]: number | string } = {};
      const initialAssigned: { [itemId: string]: any[] } = {};
      request.items.forEach((itm) => {
        const effectiveQty = (request.status === 'approved' || request.status === 'issued' || request.status === 'completed')
          ? (itm.quantity_issued !== undefined && itm.quantity_issued !== null ? itm.quantity_issued : (itm.quantity_requested || 0))
          : (itm.quantity_requested || 0);
        initialSupply[itm.id] = effectiveQty;
        initialAssigned[itm.id] = [];
      });
      setSupplyQuantities(initialSupply);
      setAssignedCylinders(initialAssigned);
      setEditingItems(
        request.items.map((itm) => {
          const opt = getCatalogOptionForItem(itm);
          const effectiveQty = (request.status === 'approved' || request.status === 'issued' || request.status === 'completed')
            ? (itm.quantity_issued !== undefined && itm.quantity_issued !== null ? itm.quantity_issued : (itm.quantity_requested || 1))
            : (itm.quantity_requested || 1);
          return {
            id: itm.id,
            cylinder_size_id: opt.size_id || itm.cylinder_size_id,
            size_code: opt.size_code || itm.size_code,
            quantity_requested: itm.quantity_requested,
            quantity: effectiveQty,
            usage_notes: itm.usage_notes || opt.usage_tag,
            selectedKey: opt.key,
          };
        })
      );
    }
  }, [request?.id, request?.status, request?.updated_at]);

  const handleCopyRef = () => {
    if (request?.request_number) {
      navigator.clipboard.writeText(request.request_number);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleQtyChange = (itemId: string, newQty: number | string) => {
    if (newQty === '') {
      setSupplyQuantities((prev) => ({
        ...prev,
        [itemId]: '',
      }));
      return;
    }
    const clamped = Math.max(0, Number(newQty) || 0);
    setSupplyQuantities((prev) => ({
      ...prev,
      [itemId]: clamped,
    }));
  };

  const getCatalogOptionStock = (opt: CylinderCatalogOption): number => {
    return allAvailableCylinders.filter((c) =>
      isCylinderMatchingItem(c, {
        size_code: opt.size_code,
        usage_notes: opt.usage_tag,
        cylinder_size_id: opt.size_id,
      })
    ).length;
  };

  const handleEditItemTypeChange = (itemId: string, newKey: string) => {
    const opt = CYLINDER_CATALOG_OPTIONS.find((o) => o.key === newKey);
    if (!opt) return;

    setEditingItems((prev) =>
      prev.map((itm) => {
        if (itm.id !== itemId) return itm;
        const cleanNotes = (itm.usage_notes || '')
          .replace(/\[Saiz Khas:\s*[^\]]+\]/gi, '')
          .replace(/\[Pin Index PI\]|\[Bullnose BN\]/gi, '')
          .trim();
        const updatedNotes = cleanNotes ? `${opt.usage_tag} ${cleanNotes}` : opt.usage_tag;

        return {
          ...itm,
          cylinder_size_id: opt.size_id,
          size_code: opt.size_code,
          usage_notes: updatedNotes,
          selectedKey: opt.key,
        };
      })
    );
  };

  const handleAddNewItem = () => {
    const defaultOpt =
      CYLINDER_CATALOG_OPTIONS.find((o) => getCatalogOptionStock(o) > 0) ||
      CYLINDER_CATALOG_OPTIONS[0];

    const newItem = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      cylinder_size_id: defaultOpt.size_id,
      size_code: defaultOpt.size_code,
      quantity_requested: 1,
      quantity: 1,
      usage_notes: defaultOpt.usage_tag,
      selectedKey: defaultOpt.key,
      isNew: true,
    };

    setEditingItems((prev) => [...prev, newItem]);
  };

  const handleEditQtyChange = (itemId: string, newQty: number | string) => {
    if (newQty === '') {
      setEditingItems((prev) =>
        prev.map((itm) => (itm.id === itemId ? { ...itm, quantity: '' } : itm))
      );
      return;
    }
    const qty = Math.max(1, Number(newQty) || 1);
    setEditingItems((prev) =>
      prev.map((itm) => (itm.id === itemId ? { ...itm, quantity: qty } : itm))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setEditingItems((prev) => prev.filter((itm) => itm.id !== itemId));
  };

  const handleSaveItemEdits = async () => {
    if (!request) return;
    if (editingItems.length === 0) {
      setError('Sila pastikan sekurang-kurangnya satu item silinder wujud dalam permohonan.');
      return;
    }
    setIsSavingEdit(true);
    setError(null);
    try {
      if (onUpdateItems) {
        await onUpdateItems(
          request.id,
          editingItems.map((itm) => {
            const opt = CYLINDER_CATALOG_OPTIONS.find((o) => o.key === itm.selectedKey) || getCatalogOptionForItem(itm);
            const cleanNotes = (itm.usage_notes || '')
              .replace(/\[Saiz Khas:\s*[^\]]+\]/gi, '')
              .replace(/\[Pin Index PI\]|\[Bullnose BN\]/gi, '')
              .trim();
            const finalNotes = opt?.usage_tag ? (cleanNotes ? `${opt.usage_tag} ${cleanNotes}` : opt.usage_tag) : cleanNotes;

            return {
              id: itm.id?.startsWith('temp_') ? undefined : itm.id,
              size_id: opt?.size_id || itm.cylinder_size_id,
              size_code: opt?.size_code || itm.size_code,
              quantity: Math.max(1, Number(itm.quantity) || 1),
              quantity_issued: Math.max(1, Number(itm.quantity) || 1),
              usage_notes: finalNotes,
            };
          }),
          editReason || 'Perubahan spesifikasi silinder & kuantiti mengikut ketersediaan stor fizikal'
        );
      }

      // Update local supply quantities for immediate reactivity
      const newSupply: { [itemId: string]: number | string } = {};
      editingItems.forEach((itm) => {
        newSupply[itm.id] = Math.max(1, Number(itm.quantity) || 1);
      });
      setSupplyQuantities(newSupply);

      setIsEditingItems(false);
      setEditReason('');
      playBeep('success');
    } catch (err: any) {
      setError(err?.message || 'Gagal mengemas kini item permohonan');
      playBeep('error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Audio success / error sound indicator
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
      console.warn("Audio Context unsupported:", e);
    }
  };

  // Fetch all available store inventory cylinders
  useEffect(() => {
    if (isOpen && request && isSupabaseConfigured()) {
      const fetchAvailable = async () => {
        setIsLoadingCylinders(true);
        try {
          const { data, error: err } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .select(`
              id,
              serial_number,
              qr_code,
              status,
              current_location,
              cylinder_size_id,
              cylinder_type_id,
              supplier_tagged,
              size_info:pharmacy_oxygen_cylinder_sizes(id, code),
              type_info:pharmacy_oxygen_cylinder_types(id, name, code)
            `)
            .neq('status', 'deactivated')
            .eq('is_active', true)
            .or('status.in.(available,full,in_stock),current_location.ilike.%store%,current_location.ilike.%farmasi%');

          if (!err && data) {
            setAllAvailableCylinders(data.filter((c: any) => c.status !== 'deactivated' && c.is_active !== false));
          }

          // Initialize issue quantity data
          const initialData: { [itemId: string]: { qty: number; cylinderId: string } } = {};
          (request.items || []).forEach((itm) => {
            initialData[itm.id] = {
              qty: supplyQuantities[itm.id] !== undefined ? supplyQuantities[itm.id] : itm.quantity_requested,
              cylinderId: '',
            };
          });
          setIssueData(initialData);
        } catch (err) {
          console.error('Error fetching available cylinders:', err);
        } finally {
          setIsLoadingCylinders(false);
        }
      };
      fetchAvailable();
    }
  }, [isOpen, request]);

  // Camera Management
  const startCamera = async (itemId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setMediaStream(stream);
      setCameraActiveItemId(itemId);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access failed:", err);
      setItemErrors(prev => ({ ...prev, [itemId]: 'Tidak dapat mengakses kamera. Sila masukkan atau pilih silinder secara manual.' }));
      setCameraActiveItemId(null);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setCameraActiveItemId(null);
  };

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, cameraActiveItemId]);

  // jsQR detection loop
  useEffect(() => {
    let detectorInterval: any;
    if (cameraActiveItemId && mediaStream && videoRef.current) {
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
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data) {
              const currentItem = request?.items?.find((i) => i.id === cameraActiveItemId);
              if (currentItem) {
                handleAssignByCode(cameraActiveItemId, currentItem, code.data);
              }
            }
          }
        }
      }, 400);
    }
    return () => {
      if (detectorInterval) clearInterval(detectorInterval);
    };
  }, [cameraActiveItemId, mediaStream, request, assignedCylinders]);

  if (!isOpen || !request) return null;

  // Strict RBAC: Only Pegawai Farmasi and Penolong Pegawai Farmasi can approve or issue cylinders
  const isAuthorizedOfficer = isCylinderAuthorizedOfficer(currentUser);
  const isPharmacyStaff = isAuthorizedOfficer;

  // Exact cylinder assignment validation
  const totalRequiredCylinders = (request?.items || []).reduce((sum, itm) => {
    const target = supplyQuantities[itm.id] !== undefined ? supplyQuantities[itm.id] : itm.quantity_requested;
    return sum + Math.max(0, target || 0);
  }, 0);

  const totalAssignedCylinders = (request?.items || []).reduce((sum, itm) => {
    return sum + (assignedCylinders[itm.id] || []).length;
  }, 0);

  const isAllCylindersAssigned =
    request?.is_external_facility
      ? totalRequiredCylinders > 0 && (request?.items || []).length > 0
      : totalRequiredCylinders > 0 &&
        (request?.items || []).length > 0 &&
        (request?.items || []).every((itm) => {
          const target = supplyQuantities[itm.id] !== undefined ? supplyQuantities[itm.id] : itm.quantity_requested;
          const count = (assignedCylinders[itm.id] || []).length;
          if (target <= 0) return true;
          return count === target;
        });

  // Helper to normalize strings
  const normalizeCode = (val?: string): string => {
    return (val || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const stripO2 = (val?: string): string => {
    return normalizeCode(val).replace(/^(?:O2|02)/, '');
  };

  // Helper to filter available pool for a given item strictly adhering to cylinder type and size
  const getAvailablePoolForItem = (item: any) => {
    if (!item) return [];
    const assignedIds = new Set(
      Object.values(assignedCylinders)
        .flat()
        .map((c) => c.id)
    );

    return allAvailableCylinders.filter((c) => {
      if (assignedIds.has(c.id)) return false;
      return isCylinderMatchingItem(c, item);
    });
  };

  // Cylinder assignment actions
  const handleAssignCylinder = (itemId: string, cylinder: any) => {
    const currentItem = request?.items?.find((i) => i.id === itemId);
    const targetQty = supplyQuantities[itemId] !== undefined ? supplyQuantities[itemId] : currentItem?.quantity_requested || 0;
    const currentList = assignedCylinders[itemId] || [];
    const displaySize = formatCylinderSizeLabel(currentItem?.size_code, currentItem?.usage_notes);

    // Verify matching spec
    if (currentItem && !isCylinderMatchingItem(cylinder, currentItem)) {
      setItemErrors((prev) => ({
        ...prev,
        [itemId]: `Silinder "${cylinder.serial_number || cylinder.qr_code}" (${cylinder.size_info?.code || ''} • ${cylinder.type_info?.name || ''}) tidak sepadan dengan spesifikasi ${displaySize}. Sila pilih silinder ${displaySize} sahaja.`
      }));
      playBeep('error');
      return;
    }

    const isAssignedGlobally = Object.values(assignedCylinders).some((list) =>
      list.some((c) => c.id === cylinder.id)
    );
    if (isAssignedGlobally) {
      setItemErrors((prev) => ({
        ...prev,
        [itemId]: `Silinder "${cylinder.serial_number || cylinder.qr_code}" telah pun diimbas/dipilih dalam permohonan ini.`
      }));
      playBeep('error');
      return;
    }

    if (currentList.length >= targetQty) {
      setItemErrors((prev) => ({
        ...prev,
        [itemId]: `Item saiz ${displaySize} telah cukup ${targetQty} silinder yang diperlukan. Padam silinder sedia ada jika ingin menukar.`
      }));
      playBeep('error');
      return;
    }

    const updated = [...currentList, cylinder];
    setAssignedCylinders((prev) => ({
      ...prev,
      [itemId]: updated,
    }));

    setIssueData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        qty: updated.length,
      },
    }));

    setItemErrors((prev) => ({ ...prev, [itemId]: null }));
    playBeep('success');
  };

  const handleRemoveCylinder = (itemId: string, cylinderId: string) => {
    const currentList = assignedCylinders[itemId] || [];
    const updated = currentList.filter((c) => c.id !== cylinderId);
    setAssignedCylinders((prev) => ({
      ...prev,
      [itemId]: updated,
    }));

    setIssueData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        qty: updated.length,
      },
    }));
  };

  const handleAssignByCode = async (itemId: string, item: any, code: string) => {
    let clean = code.trim();
    if (!clean) return;

    // Support QR codes that are encoded as URLs (extract the last segment as the serial/code)
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      try {
        const url = new URL(clean);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          clean = decodeURIComponent(pathSegments[pathSegments.length - 1]);
        }
      } catch (err) {
        console.warn("Failed to parse scanned URL:", err);
      }
    }

    const cleanNorm = normalizeCode(clean);
    const cleanStripped = stripO2(clean);
    const cleanUpper = clean.toUpperCase();

    const currentItem = item || request?.items?.find((i) => i.id === itemId);
    const targetQty = (supplyQuantities[itemId] !== undefined && supplyQuantities[itemId] !== '') ? Number(supplyQuantities[itemId]) : currentItem?.quantity_requested || 0;
    const currentList = assignedCylinders[itemId] || [];
    const displaySize = formatCylinderSizeLabel(currentItem?.size_code, currentItem?.usage_notes);

    if (currentList.length >= targetQty) {
      setItemErrors((prev) => ({
        ...prev,
        [itemId]: `Semua ${targetQty} silinder untuk saiz ${displaySize} telah lengkap diimbas. Padam silinder sedia ada untuk menukar.`
      }));
      playBeep('error');
      return;
    }

    const isAlreadyAssignedGlobal = Object.values(assignedCylinders).some((list) =>
      list.some((c) => {
        const sNorm = normalizeCode(c.serial_number);
        const qNorm = normalizeCode(c.qr_code);
        const sStrip = stripO2(c.serial_number);
        const qStrip = stripO2(c.qr_code);
        return (
          sNorm === cleanNorm ||
          qNorm === cleanNorm ||
          (cleanStripped && (sStrip === cleanStripped || qStrip === cleanStripped))
        );
      })
    );
    if (isAlreadyAssignedGlobal) {
      setItemErrors((prev) => ({
        ...prev,
        [itemId]: `Silinder "${clean}" telah pun diimbas/dipilih dalam permohonan ini.`
      }));
      playBeep('error');
      return;
    }

    const pool = getAvailablePoolForItem(currentItem);
    let matched = pool.find((c) => {
      const sNorm = normalizeCode(c.serial_number);
      const qNorm = normalizeCode(c.qr_code);
      const sStrip = stripO2(c.serial_number);
      const qStrip = stripO2(c.qr_code);
      const sRaw = (c.serial_number || '').toUpperCase();
      const qRaw = (c.qr_code || '').toUpperCase();

      return (
        sNorm === cleanNorm ||
        qNorm === cleanNorm ||
        (cleanStripped && (sStrip === cleanStripped || qStrip === cleanStripped)) ||
        sNorm.endsWith(cleanNorm) ||
        qNorm.endsWith(cleanNorm) ||
        cleanNorm.endsWith(sNorm) ||
        cleanNorm.endsWith(qNorm) ||
        (cleanStripped.length >= 4 && (
          sStrip.endsWith(cleanStripped) ||
          qStrip.endsWith(cleanStripped) ||
          cleanStripped.endsWith(sStrip) ||
          cleanStripped.endsWith(qStrip)
        )) ||
        sNorm.includes(cleanNorm) ||
        qNorm.includes(cleanNorm) ||
        cleanNorm.includes(sNorm) ||
        cleanNorm.includes(qNorm) ||
        sRaw.includes(cleanUpper) ||
        qRaw.includes(cleanUpper) ||
        cleanUpper.includes(sRaw) ||
        cleanUpper.includes(qRaw)
      );
    });

    if (!matched && isSupabaseConfigured()) {
      try {
        // 1. Try robust getCylinderByQrOrSerial first
        const targetHospitalId = request?.hospital_id || currentUser?.hospital_id || '';
        const { data: serviceMatch } = await getCylinderByQrOrSerial(targetHospitalId, clean);
        if (serviceMatch) {
          if (isCylinderMatchingItem(serviceMatch, currentItem)) {
            matched = serviceMatch;
            setAllAvailableCylinders((prev) => {
              if (prev.some((p) => p.id === serviceMatch.id)) return prev;
              return [serviceMatch, ...prev];
            });
          } else {
            const candidateDisplay = serviceMatch.size_info?.code || serviceMatch.size_code || '';
            const candidateType = serviceMatch.type_info?.name || (serviceMatch.size_code?.includes('101-F') && !serviceMatch.size_code?.startsWith('P') ? 'Pin Index' : 'Bullnose');
            setItemErrors((prev) => ({
              ...prev,
              [itemId]: `Silinder "${clean}" (${candidateDisplay} • ${candidateType}) tidak sepadan dengan spesifikasi ${displaySize}. Sila pilih silinder ${displaySize} sahaja.`
            }));
            playBeep('error');
            return;
          }
        }

        // 2. If getCylinderByQrOrSerial didn't find it, run multi-pattern on-demand query
        if (!matched) {
          const rawWithoutO2 = clean.replace(/^(?:O2|02)[-_ ]?/i, '');
          const withO2 = clean.startsWith('O2-') ? clean : `O2-${rawWithoutO2}`;
          const with02 = clean.startsWith('02-') ? clean : `02-${rawWithoutO2}`;
          const cleanAlphanum = clean.replace(/[^A-Za-z0-9]/g, '');
          const rawAlphanum = rawWithoutO2.replace(/[^A-Za-z0-9]/g, '');

          const searchPatterns = Array.from(new Set([
            clean,
            rawWithoutO2,
            withO2,
            with02,
            cleanAlphanum,
            rawAlphanum
          ].filter(Boolean)));

          const orConditions = searchPatterns.flatMap((pat) => [
            `serial_number.ilike.%${pat}%`,
            `qr_code.ilike.%${pat}%`
          ]).join(',');

          const { data: dbCyls } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .select(`
              id,
              serial_number,
              qr_code,
              status,
              current_location,
              cylinder_size_id,
              cylinder_type_id,
              supplier_tagged,
              size_info:pharmacy_oxygen_cylinder_sizes(id, code, capacity, unit),
              type_info:pharmacy_oxygen_cylinder_types(id, name, code)
            `)
            .neq('status', 'deactivated')
            .eq('is_active', true)
            .or(orConditions)
            .limit(20);

          if (dbCyls && dbCyls.length > 0) {
            const candidate = dbCyls.find((c) => {
              if (c.status === 'deactivated' || c.is_active === false) return false;
              const sNorm = normalizeCode(c.serial_number);
              const qNorm = normalizeCode(c.qr_code);
              const sStrip = stripO2(c.serial_number);
              const qStrip = stripO2(c.qr_code);
              return (
                sNorm === cleanNorm ||
                qNorm === cleanNorm ||
                (cleanStripped && (sStrip === cleanStripped || qStrip === cleanStripped)) ||
                sNorm.endsWith(cleanNorm) ||
                qNorm.endsWith(cleanNorm) ||
                cleanNorm.endsWith(sNorm) ||
                cleanNorm.endsWith(qNorm) ||
                (cleanStripped.length >= 4 && (
                  sStrip.endsWith(cleanStripped) ||
                  qStrip.endsWith(cleanStripped) ||
                  cleanStripped.endsWith(sStrip) ||
                  cleanStripped.endsWith(qStrip)
                )) ||
                sNorm.includes(cleanNorm) ||
                qNorm.includes(cleanNorm) ||
                cleanNorm.includes(sNorm) ||
                cleanNorm.includes(qNorm)
              );
            }) || dbCyls[0];

            if (candidate) {
              if (isCylinderMatchingItem(candidate, currentItem)) {
                matched = candidate;
                setAllAvailableCylinders((prev) => {
                  if (prev.some((p) => p.id === candidate.id)) return prev;
                  return [candidate, ...prev];
                });
              } else {
                const candidateDisplay = candidate.size_info?.code || '';
                const candidateType = candidate.type_info?.name || '';
                setItemErrors((prev) => ({
                  ...prev,
                  [itemId]: `Silinder "${clean}" (${candidateDisplay} • ${candidateType}) tidak sepadan dengan spesifikasi ${displaySize}. Sila pilih silinder ${displaySize} sahaja.`
                }));
                playBeep('error');
                return;
              }
            }
          }
        }
      } catch (dbErr) {
        console.warn('On-demand cylinder search error:', dbErr);
      }
    }

    if (matched) {
      handleAssignCylinder(itemId, matched);
      setScanInputs((prev) => ({ ...prev, [itemId]: '' }));
    } else {
      setItemErrors((prev) => ({
        ...prev,
        [itemId]: `Silinder "${clean}" tidak dijumpai dalam inventori stor bagi saiz ${displaySize}.`,
      }));
      playBeep('error');
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const adjustedItems = (request.items || []).map((itm) => {
        const qtyRaw = supplyQuantities[itm.id];
        const qty = qtyRaw !== undefined && qtyRaw !== '' ? Number(qtyRaw) : itm.quantity_requested;
        return {
          id: itm.id,
          quantity: qty,
          quantity_issued: qty,
        };
      });
      await onApprove(request.id, adjustedItems);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('Sila nyatakan alasan penolakan.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onReject(request.id, rejectionReason);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssue = async () => {
    if (!request.is_external_facility && !isAllCylindersAssigned) {
      setError(
        `Sila imbas atau pilih semua nombor siri silinder (${totalAssignedCylinders}/${totalRequiredCylinders} selesai) sebelum mengesahkan dispatch.`
      );
      playBeep('error');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const itemsPayload = (request.items || []).map((itm) => {
        const assigned = assignedCylinders[itm.id] || [];
        const targetQty = (supplyQuantities[itm.id] !== undefined && supplyQuantities[itm.id] !== '') ? Number(supplyQuantities[itm.id]) : itm.quantity_requested;
        return {
          id: itm.id,
          quantity_issued: request.is_external_facility ? targetQty : assigned.length,
          cylinder_ids: request.is_external_facility ? [] : assigned.map((c) => c.id),
        };
      });

      await onIssue(request.id, itemsPayload);
      stopCamera();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue cylinders');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete(request.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Adakah anda pasti mahu membatalkan permohonan ini?')) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (onCancel) {
        await onCancel(request.id);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Structured lifecycle status tracker
  const getTimelineSteps = () => {
    if (!request) return [];
    const isRejected = request.status === 'rejected';
    const isApproved = ['approved', 'issued', 'completed'].includes(request.status);
    const isIssued = ['issued', 'completed'].includes(request.status);
    const isCompleted = request.status === 'completed';

    const steps = [
      {
        key: 'requested',
        stepNum: 1,
        label: 'Permohonan',
        subLabel: 'Requested',
        date: request.request_date,
        state: 'completed' as const,
      },
      {
        key: 'approved',
        stepNum: 2,
        label: isRejected ? 'Ditolak' : 'Kelulusan',
        subLabel: isRejected ? 'Rejected' : 'Approved',
        date: isRejected ? (request.rejected_date || request.updated_at) : request.approved_date,
        state: isRejected
          ? ('error' as const)
          : isApproved
          ? ('completed' as const)
          : request.status === 'pending'
          ? ('current' as const)
          : ('upcoming' as const),
      },
      {
        key: 'issued',
        stepNum: 3,
        label: 'Pengeluaran',
        subLabel: 'Dispatched',
        date: request.issued_date,
        state: isRejected
          ? ('upcoming' as const)
          : isIssued
          ? ('completed' as const)
          : request.status === 'approved'
          ? ('current' as const)
          : ('upcoming' as const),
      },
      {
        key: 'completed',
        stepNum: 4,
        label: 'Penerimaan',
        subLabel: 'Completed',
        date: request.completed_date,
        state: isRejected
          ? ('upcoming' as const)
          : isCompleted
          ? ('completed' as const)
          : request.status === 'issued'
          ? ('current' as const)
          : ('upcoming' as const),
      },
    ];
    return steps;
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Diluluskan • Sedia Diagih
          </span>
        );
      case 'issued':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            Dikeluarkan • Dalam Transit Wad
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            Selesai Diterima
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            Permohonan Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu Kelulusan
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  request.request_type === 'manual_issue'
                    ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                    : request.is_external_facility
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                    : 'bg-blue-50 text-blue-700 border-blue-200/80'
                }`}>
                  {request.request_type === 'manual_issue'
                    ? 'Manual Issue'
                    : request.is_external_facility
                    ? 'Indent Antara Fasiliti'
                    : 'Unit Request'}
                </span>

                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="group inline-flex items-center gap-1 font-mono text-xs sm:text-sm font-black text-slate-800 hover:text-blue-600 transition-colors bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs"
                  title="Salin Nombor Rujukan"
                >
                  <span>{request.request_number}</span>
                  {copiedRef ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  )}
                </button>

                <div className="hidden sm:inline-block">
                  {getStatusBadge()}
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Butiran Permohonan Silinder Oksigen</span>
                <span className="sm:hidden text-xs">{getStatusBadge()}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Matikan bunyi indikator' : 'Aktifkan bunyi indikator'}
              className={`p-2 rounded-xl transition-all border ${
                soundEnabled 
                  ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-200 focus:outline-none"
              title="Tutup (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="flex-1">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Compact Modern Horizontal Stepper (Desktop & Mobile Unified) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Kitaran Hayat Permohonan (Lifecycle Status)
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {request.status.toUpperCase()}
              </span>
            </div>

            <div className="relative flex items-center justify-between w-full">
              {/* Connecting progress track line */}
              <div className="absolute left-6 right-6 top-3.5 sm:top-4 h-0.5 bg-slate-200/90 -translate-y-1/2 z-0" />
              
              {getTimelineSteps().map((step, idx) => {
                const isComplete = step.state === 'completed';
                const isCurrent = step.state === 'current';
                const isError = step.state === 'error';

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center text-center flex-1 px-1">
                    {/* Circle Indicator */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 shadow-2xs ${
                        isError
                          ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                          : isComplete
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                          : 'bg-white text-slate-400 border border-slate-300 ring-2 ring-slate-100'
                      }`}
                    >
                      {isError ? (
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                      ) : isComplete ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span>{step.stepNum}</span>
                      )}
                    </div>

                    {/* Step Title & Date */}
                    <div className="mt-1.5 flex flex-col items-center">
                      <span
                        className={`text-[11px] sm:text-xs font-bold leading-tight ${
                          isError
                            ? 'text-rose-700 font-extrabold'
                            : isComplete
                            ? 'text-slate-800'
                            : isCurrent
                            ? 'text-blue-700 font-extrabold'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      {step.date ? (
                        <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono tabular-nums leading-tight mt-0.5">
                          {new Date(step.date).toLocaleDateString('ms-MY', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-slate-300 leading-tight mt-0.5">
                          {isCurrent ? 'Sedang Diproses' : '-'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Facility Indent Banner */}
          {request.is_external_facility && (
            <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-purple-50/40 to-blue-50/90 border border-indigo-200/90 rounded-2xl flex items-start gap-3 shadow-2xs">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950">
                    Indent Antara Fasiliti Kesihatan (Inter-Facility Requisition)
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-200/80 text-indigo-800 uppercase tracking-wide">
                    {request.indent_direction === 'inbound' ? 'Inbound (Masuk)' : 'Outbound (Keluar)'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 flex-wrap">
                  {request.indent_direction === 'inbound' ? (
                    <>
                      <span className="text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">{request.external_facility_name || 'Fasiliti Luar'}</span>
                      <span className="text-indigo-400 font-black">➔</span>
                      <span className="text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">{request.department?.department_name || 'Unit Farmasi Logistik (Hospital Lawas)'}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">{request.department?.department_name || 'Unit Farmasi Logistik (Hospital Lawas)'}</span>
                      <span className="text-indigo-400 font-black">➔</span>
                      <span className="text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">{request.external_facility_name || 'Fasiliti Luar'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Requisition Overview Grid (4 Columns Desktop, 2 Columns Mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Department */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Jabatan / Wad</span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={request.department?.department_name || 'Pharmacy Store'}>
                  {request.department?.department_name || 'Farmasi Logistik'}
                </p>
                {request.department?.department_code && (
                  <span className="text-[10px] font-mono text-slate-400">
                    [{request.department.department_code}]
                  </span>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Keutamaan</span>
              </div>
              <div>
                {request.priority?.toLowerCase() === 'stat' || request.priority?.toLowerCase() === 'emergency' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                    <Flame className="w-3 h-3 text-rose-600" /> STAT / Kecemasan
                  </span>
                ) : request.priority?.toLowerCase() === 'urgent' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Segera (Urgent)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-700">
                    Normal
                  </span>
                )}
              </div>
            </div>

            {/* Requester */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Pemohon (Requester)</span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={request.requester?.full_name || 'Manual Issue'}>
                  {request.requester?.full_name || 'Manual Issue'}
                </p>
                <span className="text-[10px] text-slate-500 block truncate">
                  {request.requester?.jawatan || 'Kakitangan Wad'}
                </span>
              </div>
            </div>

            {/* Issuer */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Pegawai Pengeluar</span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={
                  isCylinderAuthorizedOfficer(request.issuer)
                    ? request.issuer.full_name
                    : (isIssuing && isAuthorizedOfficer)
                    ? (currentUser?.full_name || 'Pegawai Farmasi')
                    : (request.status === 'issued' || request.status === 'completed') && request.issuer?.full_name
                    ? request.issuer.full_name
                    : 'Belum Ditugaskan'
                }>
                  {isCylinderAuthorizedOfficer(request.issuer)
                    ? request.issuer.full_name
                    : (isIssuing && isAuthorizedOfficer)
                    ? (currentUser?.full_name || 'Pegawai Farmasi')
                    : (request.status === 'issued' || request.status === 'completed') && request.issuer?.full_name
                    ? request.issuer.full_name
                    : 'Belum Ditugaskan'}
                </p>
                <span className="text-[10px] text-slate-500 block truncate">
                  {isCylinderAuthorizedOfficer(request.issuer)
                    ? (request.issuer.jawatan || 'Unit Farmasi Logistik')
                    : (isIssuing && isAuthorizedOfficer)
                    ? (currentUser?.jawatan || 'Farmasi')
                    : (request.status === 'issued' || request.status === 'completed') && request.issuer?.jawatan
                    ? request.issuer.jawatan
                    : 'Menunggu Pengeluaran Farmasi'}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks or Rejection Reason Callout */}
          {request.remarks && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Catatan Permohonan (Remarks)
              </span>
              <p className="text-slate-800 font-medium">{request.remarks}</p>
            </div>
          )}

          {request.rejection_reason && (
            <div className={`p-4 rounded-2xl text-xs sm:text-sm border shadow-2xs ${
              request.status === 'rejected'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-amber-50/80 border-amber-200'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                request.status === 'rejected' ? 'text-rose-700' : 'text-amber-800'
              }`}>
                {request.status === 'rejected' ? 'Sebab Penolakan (Rejection Reason)' : 'Justifikasi Permohonan'}
              </span>
              <p className={`font-semibold ${
                request.status === 'rejected' ? 'text-rose-900' : 'text-slate-800'
              }`}>
                {request.rejection_reason}
              </p>
            </div>
          )}

          {/* Items requested vs issued */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Senarai Item Silinder Permohonan
              </span>
              {isPharmacyStaff && !isIssuing && (request.status === 'pending' || request.status === 'approved') && (
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingItems && request.items) {
                      setEditingItems(
                        request.items.map((itm) => {
                          const opt = getCatalogOptionForItem(itm);
                          const cleanNotes = (itm.usage_notes || '')
                            .replace(/\[Saiz Khas:\s*[^\]]+\]/gi, '')
                            .replace(/\[Pin Index PI\]|\[Bullnose BN\]/gi, '')
                            .trim();
                          const updatedNotes = cleanNotes ? `${opt.usage_tag} ${cleanNotes}` : opt.usage_tag;
                          return {
                            id: itm.id,
                            cylinder_size_id: opt.size_id || itm.cylinder_size_id,
                            size_code: opt.size_code || itm.size_code,
                            quantity_requested: itm.quantity_requested,
                            quantity: (supplyQuantities[itm.id] !== undefined && supplyQuantities[itm.id] !== '') ? Number(supplyQuantities[itm.id]) : (itm.quantity_issued || itm.quantity_requested),
                            usage_notes: updatedNotes,
                            selectedKey: opt.key,
                          };
                        })
                      );
                    }
                    setIsEditingItems(!isEditingItems);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                    isEditingItems
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingItems ? 'Batal Ubah' : 'Ubah Item & Kuantiti'}</span>
                </button>
              )}
            </div>

            {isEditingItems ? (
              /* Inline Edit Mode with Cylinder Type & Stock Selection */
              <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/70 via-slate-50 to-blue-50/40 border border-amber-300/80 rounded-2xl space-y-4 animate-in fade-in duration-150 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-amber-100/70 p-3 rounded-xl border border-amber-200/90 text-amber-950 text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      <strong>Jejak Audit Aktif:</strong> Anda boleh menukar jenis silinder (cth. 101-N ke P101-F) dan kuantiti mengikut ketersediaan stok sebenar stor farmasi.
                    </span>
                  </div>
                  <span className="shrink-0 font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] uppercase">
                    Mod Kemaskini Item
                  </span>
                </div>

                {/* Live Store Stock Bar */}
                <div className="p-3 bg-white/90 border border-slate-200/90 rounded-xl space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      Ketersediaan Silinder di Stor Farmasi Lawas:
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {allAvailableCylinders.length} unit keseluruhan
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {CYLINDER_CATALOG_OPTIONS.map((opt) => {
                      const stock = getCatalogOptionStock(opt);
                      return (
                        <span
                          key={opt.key}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            stock > 0
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                          }`}
                        >
                          <span className="font-mono">{opt.size_code}</span>
                          <span className="text-[10px] font-normal uppercase opacity-75">
                            ({opt.valve_type === 'BN' ? 'Bullnose' : 'Pin Index'})
                          </span>
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                            stock > 0 ? 'bg-emerald-200/70 text-emerald-900' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {stock} unit
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Items Editable Table / Cards */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-bold text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200">
                        <th className="px-3.5 py-3 w-7/12 sm:w-1/2">Pilih Jenis & Saiz Silinder (Ikut Stor)</th>
                        <th className="px-3.5 py-3 text-center w-3/12 sm:w-1/4">Kuantiti Baru</th>
                        <th className="px-3.5 py-3 text-right w-2/12 sm:w-1/4">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editingItems.map((itm, idx) => {
                        const currentOpt =
                          CYLINDER_CATALOG_OPTIONS.find((o) => o.key === itm.selectedKey) ||
                          getCatalogOptionForItem(itm);
                        const stock = getCatalogOptionStock(currentOpt);
                        const hasSufficientStock = stock >= itm.quantity;

                        return (
                          <tr key={itm.id || idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3.5 py-3 align-top">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0 font-mono">
                                    #{idx + 1}
                                  </span>
                                  <select
                                    value={itm.selectedKey || currentOpt.key}
                                    onChange={(e) => handleEditItemTypeChange(itm.id, e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-blue-500 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer transition-all"
                                  >
                                    {CYLINDER_CATALOG_OPTIONS.map((opt) => {
                                      const optStock = getCatalogOptionStock(opt);
                                      return (
                                        <option key={opt.key} value={opt.key}>
                                          {opt.label} — {optStock > 0 ? `(${optStock} unit sedia di stor)` : '(Tiada stok sedia)'}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>

                                {/* Live stock feedback badge */}
                                <div className="pl-7 flex items-center gap-2 flex-wrap">
                                  {hasSufficientStock ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      {stock} unit sedia di stor (Mencukupi untuk {itm.quantity} unit)
                                    </span>
                                  ) : stock > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                      <AlertCircle className="w-3 h-3 text-amber-600" />
                                      Baki stor hanya {stock} unit (Kurang {itm.quantity - stock} unit)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                      <AlertCircle className="w-3 h-3 text-rose-600" />
                                      Tiada stok fizikal sedia di stor untuk silinder ini
                                    </span>
                                  )}

                                  {itm.quantity_requested && itm.quantity_requested !== itm.quantity && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      (Asal: {itm.quantity_requested} unit)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-3.5 py-3 align-top text-center">
                              <div className="flex flex-col items-center gap-1">
                                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 shadow-inner">
                                  <button
                                    type="button"
                                    onClick={() => handleEditQtyChange(itm.id, Math.max(1, (Number(itm.quantity) || 1) - 1))}
                                    disabled={(Number(itm.quantity) || 1) <= 1}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                    title="Kurangkan kuantiti"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    value={itm.quantity}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleEditQtyChange(itm.id, val === '' ? '' : parseInt(val, 10) || 1);
                                    }}
                                    onBlur={() => {
                                      if (itm.quantity === '' || Number(itm.quantity) < 1) {
                                        handleEditQtyChange(itm.id, 1);
                                      }
                                    }}
                                    className="w-12 text-center font-black text-blue-600 bg-transparent text-xs focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleEditQtyChange(itm.id, (Number(itm.quantity) || 0) + 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 shadow-2xs transition-all active:scale-95"
                                    title="Tambah kuantiti"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Unit</span>
                              </div>
                            </td>

                            <td className="px-3.5 py-3 align-top text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(itm.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors shadow-2xs"
                                title="Padam item ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Padam</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {editingItems.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-slate-400 italic">
                            Semua item telah dipadam. Tekan butang di bawah untuk menambah item baru.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add New Item Button */}
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs border border-blue-300 shadow-2xs transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>+ Tambah Item Silinder Baru</span>
                  </button>
                </div>

                {/* Audit Trail Input */}
                <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Sebab Perubahan Kuantiti / Jenis Silinder (Catatan Log Audit)
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="cth: Menukar silinder 101-N ke P101-F mengikut ketersediaan fizikal stor farmasi"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingItems(false)}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl shadow-2xs transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveItemEdits}
                    disabled={isSavingEdit || editingItems.length === 0}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all active:scale-95"
                  >
                    {isSavingEdit ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Simpan Perubahan & Rekod Log</span>
                  </button>
                </div>
              </div>
            ) : isIssuing ? (
              /* Enhanced Modern Cylinder Dispatch Scanning Station */
              <div className="space-y-4">
                {/* Overall Dispatch Progress Header */}
                <div className="p-4 bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/70 border border-blue-200/80 rounded-2xl space-y-2.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <PackageCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Stesen Imbasan & Pengagihan Silinder Oksigen
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Imbas kod bar / kod QR atau pilih nombor siri silinder fizikal dari stor.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tabular-nums ${
                        isAllCylindersAssigned
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {isAllCylindersAssigned ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        )}
                        <span>{totalAssignedCylinders} / {totalRequiredCylinders} Silinder Selesai</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ease-out ${
                        isAllCylindersAssigned ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${totalRequiredCylinders > 0 ? Math.min(100, Math.round((totalAssignedCylinders / totalRequiredCylinders) * 100)) : 100}%`
                      }}
                    />
                  </div>
                </div>

                {(request.items || []).map((itm) => {
                  const targetQty = supplyQuantities[itm.id] !== undefined ? supplyQuantities[itm.id] : itm.quantity_requested;
                  const assignedList = assignedCylinders[itm.id] || [];
                  const availablePool = getAvailablePoolForItem(itm);
                  const isItemCameraActive = cameraActiveItemId === itm.id;
                  const currentScanVal = scanInputs[itm.id] || '';
                  const itemErr = itemErrors[itm.id];
                  const isBrowserOpen = showInventoryBrowser[itm.id] || false;
                  const searchQ = (searchQueries[itm.id] || '').toLowerCase().trim();
                  const isFulfilled = assignedList.length >= targetQty;
                  const displaySize = formatCylinderSizeLabel(itm.size_code, itm.usage_notes);
                  const wardNote = (itm.usage_notes || '').replace(/\[Pin Index PI\]|\[Bullnose BN\]/gi, '').trim();

                  // Filter pool for browser search
                  const searchQNorm = searchQ.replace(/^(?:o2|02)[-_ ]?/, '');
                  const filteredPool = availablePool.filter((c) => {
                    if (!searchQ) return true;
                    const s = (c.serial_number || '').toLowerCase();
                    const q = (c.qr_code || '').toLowerCase();
                    return (
                      s.includes(searchQ) ||
                      q.includes(searchQ) ||
                      (searchQNorm && (s.includes(searchQNorm) || q.includes(searchQNorm)))
                    );
                  });

                  // Suggestions for autocomplete typing
                  const val = currentScanVal.toLowerCase().trim();
                  const valNorm = val.replace(/^(?:o2|02)[-_ ]?/, '');
                  const suggestions = val
                    ? availablePool.filter((c) => {
                        const s = (c.serial_number || '').toLowerCase();
                        const q = (c.qr_code || '').toLowerCase();
                        return (
                          s.includes(val) ||
                          q.includes(val) ||
                          (valNorm && (s.includes(valNorm) || q.includes(valNorm)))
                        );
                      }).slice(0, 5)
                    : [];

                  return (
                    <div
                      key={itm.id}
                      className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3.5 shadow-2xs transition-all"
                    >
                      {/* Item Header with Clean Metadata & Counters */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                              {displaySize}
                            </h4>
                            {wardNote && (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                                {wardNote}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                            <span>Kuantiti Diperlukan: <strong className="font-mono text-slate-800">{targetQty} unit</strong></span>
                            <span className="text-slate-300">•</span>
                            <span>Baki: <strong className="font-mono text-slate-800">{Math.max(0, targetQty - assignedList.length)} unit</strong></span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {request.is_external_facility ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>✓ {targetQty} unit sedia</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tabular-nums border shadow-2xs ${
                                isFulfilled
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : assignedList.length > 0
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {isFulfilled ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{assignedList.length}/{targetQty} Lengkap</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                  <span>{assignedList.length}/{targetQty} Diimbas</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {request.is_external_facility ? (
                        <div className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-emerald-50/90 border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Share2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                                  Pinjaman / Indent: {request.external_facility_name || 'Hospital Luar'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 uppercase">
                                  {request.indent_direction === 'inbound' ? 'Inbound' : 'Outbound'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                Pengeluaran sebanyak <strong>{targetQty} unit</strong> disahkan terus secara kuantiti fizikal. Tiada imbasan nombor siri diperlukan.
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-xs shadow-2xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{targetQty} Unit Sah</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Item Error Message */}
                          {itemErr && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                              <span className="flex-1">{itemErr}</span>
                              <button
                                type="button"
                                onClick={() => setItemErrors((prev) => ({ ...prev, [itm.id]: null }))}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Camera Viewport (if active) */}
                          {isItemCameraActive && (
                            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-48 sm:h-56 object-cover"
                              />
                              <div className="absolute inset-0 border-2 border-dashed border-emerald-400/80 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                                <span className="text-[11px] font-bold text-white bg-black/70 px-3.5 py-1 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5">
                                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                                  Halakan Kod QR / Barcode ke dalam bingkai ini
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-all shadow-md"
                                title="Tutup Kamera"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Integrated Barcode/QR Scanner & Action Row */}
                          <div className="space-y-2">
                            {/* Row 1: Unified Input + Camera + Tugaskan Buttons */}
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                  <Barcode className="w-4 h-4" />
                                </div>
                                <input
                                  type="text"
                                  disabled={isFulfilled}
                                  value={currentScanVal}
                                  onChange={(e) => {
                                    setScanInputs((prev) => ({ ...prev, [itm.id]: e.target.value }));
                                    setItemErrors((prev) => ({ ...prev, [itm.id]: null }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isFulfilled && currentScanVal.trim()) {
                                      e.preventDefault();
                                      handleAssignByCode(itm.id, itm, currentScanVal);
                                    }
                                  }}
                                  placeholder={
                                    isFulfilled
                                      ? `✓ Selesai: Semua ${targetQty} silinder telah diimbas`
                                      : `Imbas QR / taip siri ${displaySize.split('—')[0].trim()}...`
                                  }
                                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm font-mono shadow-2xs transition-all ${
                                    isFulfilled
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                      : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'
                                  }`}
                                />

                                {/* Autocomplete suggestions dropdown */}
                                {suggestions.length > 0 && !isFulfilled && (
                                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                      <span>Padanan Silinder {displaySize} ({suggestions.length})</span>
                                      <span className="text-[9px] text-blue-600 font-semibold">Tersedia di Stor</span>
                                    </div>
                                    {suggestions.map((sug) => {
                                      const isBN = (sug.type_info?.code || '').toUpperCase() === 'BN' || (sug.type_info?.name || '').toUpperCase().includes('BULL') || (sug.size_info?.code || '').toUpperCase().includes('P101-F') || (sug.serial_number || '').toUpperCase().includes('P101-F');
                                      return (
                                        <button
                                          key={sug.id}
                                          type="button"
                                          onClick={() => {
                                            handleAssignCylinder(itm.id, sug);
                                            setScanInputs((prev) => ({ ...prev, [itm.id]: '' }));
                                          }}
                                          className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between text-xs transition-colors group"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <QrCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                            <span className="font-mono font-bold text-slate-800 group-hover:text-blue-700 truncate">
                                              {sug.serial_number || sug.qr_code}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                                              isBN ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                            }`}>
                                              {sug.type_info?.name || (isBN ? 'Bullnose' : 'Pin Index')}
                                            </span>
                                            <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                                              • {formatLocation(sug.current_location, 'Stor Farmasi')}
                                            </span>
                                          </div>
                                          <span className="text-[11px] font-bold text-blue-600 group-hover:underline shrink-0">
                                            + Pilih
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Camera Toggle Button */}
                              <button
                                type="button"
                                disabled={isFulfilled}
                                onClick={() => {
                                  if (isItemCameraActive) {
                                    stopCamera();
                                  } else {
                                    startCamera(itm.id);
                                  }
                                }}
                                className={`h-[42px] px-3 sm:px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border shrink-0 ${
                                  isFulfilled
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                    : isItemCameraActive
                                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 ring-2 ring-rose-200'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300 shadow-2xs'
                                }`}
                                title={isFulfilled ? 'Kouta item telah lengkap' : 'Imbas Kod Bar / QR menggunakan Kamera'}
                              >
                                <Camera className="w-4 h-4" />
                                <span className="hidden sm:inline">{isItemCameraActive ? 'Tutup' : 'Kamera'}</span>
                              </button>

                              {/* Tugaskan Button */}
                              <button
                                type="button"
                                disabled={isFulfilled || !currentScanVal.trim()}
                                onClick={() => handleAssignByCode(itm.id, itm, currentScanVal)}
                                className="h-[42px] px-3.5 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 text-white font-bold text-xs shrink-0 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                              >
                                <span>Tugaskan</span>
                                <CornerDownLeft className="w-3.5 h-3.5 hidden sm:inline" />
                              </button>
                            </div>

                            {/* Row 2: Clean 2-Column Action Grid for Store & Auto-Assign */}
                            <div className="grid grid-cols-2 gap-2 pt-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setShowInventoryBrowser((prev) => ({
                                    ...prev,
                                    [itm.id]: !prev[itm.id],
                                  }))
                                }
                                className={`h-[38px] px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                  isBrowserOpen
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-inner'
                                    : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-700 hover:border-slate-300 shadow-2xs'
                                }`}
                              >
                                <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">Pilih dari Stor ({availablePool.length})</span>
                                {isBrowserOpen ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Manual Database Inventory Browser Drawer */}
                          {isBrowserOpen && (
                            <div className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150 shadow-inner">
                              {/* Filter Header showing strict type/size isolation */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    Hanya Menunjukkan:
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs">
                                    <Database className="w-3 h-3 text-blue-600" />
                                    {displaySize}
                                  </span>
                                </div>
                                <span className="text-xs font-mono font-bold text-slate-600">
                                  {filteredPool.length} / {availablePool.length} unit tersedia
                                </span>
                              </div>

                              <div className="relative flex-1">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                  type="text"
                                  value={searchQueries[itm.id] || ''}
                                  onChange={(e) =>
                                    setSearchQueries((prev) => ({
                                      ...prev,
                                      [itm.id]: e.target.value,
                                    }))
                                  }
                                  placeholder={`Cari nombor siri atau kod bar ${displaySize}...`}
                                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-mono"
                                />
                              </div>

                              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs">
                                {filteredPool.length > 0 ? (
                                  filteredPool.map((cyl) => {
                                    const isBN = (cyl.type_info?.code || '').toUpperCase() === 'BN' || (cyl.type_info?.name || '').toUpperCase().includes('BULL');
                                    return (
                                      <div
                                        key={cyl.id}
                                        className="p-3 hover:bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs" title="Tersedia" />
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="font-mono font-extrabold text-slate-900 tracking-tight">
                                                {cyl.serial_number || cyl.qr_code}
                                              </span>
                                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                                isBN ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                              }`}>
                                                {cyl.type_info?.name || (isBN ? 'Bullnose' : 'Pin Index')}
                                              </span>
                                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600">
                                                {cyl.size_info?.code || ''}
                                              </span>
                                            </div>
                                            <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                                              Lokasi: {formatLocation(cyl.current_location, 'Stor Farmasi')} • Status: Tersedia
                                            </span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          disabled={isFulfilled}
                                          onClick={() => handleAssignCylinder(itm.id, cyl)}
                                          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs flex items-center justify-center gap-1 ${
                                            isFulfilled
                                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                              : 'bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border-blue-200 hover:border-blue-600 active:scale-95'
                                          }`}
                                        >
                                          {isFulfilled ? 'Selesai' : '+ Pilih'}
                                        </button>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="p-6 text-center text-xs text-slate-400 italic space-y-1">
                                    <p className="font-medium text-slate-500">Tiada silinder {displaySize} dijumpai dalam stor.</p>
                                    <p className="text-[11px] text-slate-400">Pastikan silinder berstatus 'available' di Stor Farmasi.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Manifest Silinder Ditugaskan (Clean High-Density Architecture) */}
                          <div className="space-y-2.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  Silinder Ditugaskan
                                </span>
                                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                                  isFulfilled
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {assignedList.length} / {targetQty}
                                </span>
                              </div>
                              {isFulfilled ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Kouta Lengkap ({targetQty} unit)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Perlu {targetQty - assignedList.length} lagi
                                </span>
                              )}
                            </div>

                            {/* Assigned Cylinders List */}
                            {assignedList.length > 0 ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {assignedList.map((assignedCyl, slotIdx) => {
                                    const isBN = (assignedCyl.type_info?.code || '').toUpperCase() === 'BN' || (assignedCyl.type_info?.name || '').toUpperCase().includes('BULL');
                                    return (
                                      <div
                                        key={assignedCyl.id || slotIdx}
                                        className="p-2.5 bg-white border border-emerald-300/80 hover:border-emerald-400 rounded-xl flex items-center justify-between gap-2 shadow-2xs transition-all animate-in fade-in duration-150 group"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 font-mono">
                                            {slotIdx + 1}
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate">
                                                {assignedCyl.serial_number || assignedCyl.qr_code}
                                              </span>
                                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                                isBN ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                                              }`}>
                                                {assignedCyl.type_info?.name || (isBN ? 'Bullnose' : 'Pin Index')}
                                              </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                                              Lokasi: {formatLocation(assignedCyl.current_location, 'Stor Farmasi')}
                                            </span>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleRemoveCylinder(itm.id, assignedCyl.id)}
                                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                                          title="Padam silinder ini"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Compact shortage helper if quota is not yet reached */}
                                {!isFulfilled && (
                                  <div className="p-2.5 bg-amber-50/70 border border-dashed border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="truncate">
                                        Baki <strong>{targetQty - assignedList.length} silinder</strong> belum ditugaskan. Sila imbas atau pilih dari stor.
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenStoreBrowsers((prev) => ({
                                          ...prev,
                                          [itm.id]: true,
                                        }))
                                      }
                                      className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs active:scale-95"
                                    >
                                      <Database className="w-3 h-3 text-amber-700" />
                                      <span>Buka Senarai Stor</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Clean Empty State - No repetitive empty slot cards */
                              <div className="p-4 bg-slate-50/80 border border-dashed border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                                    <PackageCheck className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-700">Belum ada silinder ditugaskan</h5>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {availablePool.length > 0
                                        ? `${availablePool.length} unit tersedia di stor. Sila imbas kod bar / kod QR atau klik 'Pilih dari Stor'.`
                                        : 'Tiada stok silinder tersedia di stor bagi saiz ini.'}
                                    </p>
                                  </div>
                                </div>

                                {availablePool.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenStoreBrowsers((prev) => ({
                                        ...prev,
                                        [itm.id]: true,
                                      }))
                                    }
                                    className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                                  >
                                    <Database className="w-3.5 h-3.5" />
                                    <span>Pilih dari Stor ({availablePool.length} unit)</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Regular Clean Table View (Pending / Approved / Completed) */
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs bg-white">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="px-4 py-3">Kod & Saiz Silinder</th>
                      <th className="px-4 py-3 text-center">Kuantiti Dimohon</th>
                      <th className="px-4 py-3 text-center">
                        {request.status === 'pending' ? 'Kuantiti Diluluskan' : 'Kuantiti Dibekal / Diagih'}
                      </th>
                      <th className="px-4 py-3">Catatan Penggunaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(request.items || []).map((itm) => {
                      const displaySize = formatCylinderSizeLabel(itm.size_code, itm.usage_notes);
                      const currentSupplyQty = supplyQuantities[itm.id] ?? itm.quantity_requested;
                      const isAdjusted = currentSupplyQty !== itm.quantity_requested;

                      return (
                        <tr key={itm.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-extrabold text-slate-900">
                            <div>{displaySize}</div>
                            {itm.usage_notes && (
                              <span className="text-[10px] text-slate-400 font-normal block">{itm.usage_notes}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-mono">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                              {itm.quantity_requested} Unit
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {request.status === 'pending' && isPharmacyStaff ? (
                              <div className="inline-flex items-center gap-2">
                                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 shadow-inner">
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange(itm.id, Math.max(0, (Number(currentSupplyQty) || 0) - 1))}
                                    disabled={isSubmitting || (Number(currentSupplyQty) || 0) <= 0}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm shadow-2xs transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                    title="Kurangkan kuantiti"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min={0}
                                    value={currentSupplyQty}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleQtyChange(itm.id, val === '' ? '' : parseInt(val, 10) || 0);
                                    }}
                                    onBlur={() => {
                                      if (supplyQuantities[itm.id] === '' || Number(supplyQuantities[itm.id]) < 0) {
                                        handleQtyChange(itm.id, itm.quantity_requested || 0);
                                      }
                                    }}
                                    className="w-12 text-center font-black text-blue-600 text-sm focus:outline-none bg-transparent"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange(itm.id, (Number(currentSupplyQty) || 0) + 1)}
                                    disabled={isSubmitting}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm shadow-2xs transition-all disabled:opacity-30 active:scale-95"
                                    title="Tambah kuantiti"
                                  >
                                    +
                                  </button>
                                </div>
                                {isAdjusted && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    Diubah ({currentSupplyQty})
                                  </span>
                                )}
                              </div>
                            ) : request.status === 'pending' || request.status === 'rejected' ? (
                              <span className="text-slate-400 font-medium">-</span>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-extrabold text-slate-900 font-mono text-sm">
                                  {itm.quantity_issued !== undefined && itm.quantity_issued !== null ? itm.quantity_issued : itm.quantity_requested} Unit
                                </span>
                                {itm.quantity_issued !== undefined && itm.quantity_issued !== itm.quantity_requested && (
                                  <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                    Sebahagian ({itm.quantity_issued}/{itm.quantity_requested})
                                  </span>
                                )}
                                {itm.dispatched_serials && itm.dispatched_serials.length > 0 && (
                                  <div className="flex flex-wrap gap-1 justify-center mt-1 max-w-xs">
                                    {itm.dispatched_serials
                                      .slice(0, (request.status === 'pending' || request.status === 'rejected' ? itm.quantity_requested : (itm.quantity_issued || itm.quantity_requested)) || itm.dispatched_serials.length)
                                      .map((s: string, sIdx: number) => (
                                        <span
                                          key={sIdx}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold"
                                        >
                                          <QrCode className="w-2.5 h-2.5 text-blue-500" />
                                          {s}
                                        </span>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {(() => {
                              const raw = itm.usage_notes || '';
                              if (itm.dispatched_serials && itm.dispatched_serials.length > 0) {
                                const clean = raw.replace(/(?:serials?(?:\s*\(\d+\))?|siri)\s*:\s*[^|]+/i, '').replace(/^[|\s]+|[|\s]+$/g, '').trim();
                                return clean || '-';
                              }
                              return raw || '-';
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rejection Form Modal Drawer */}
          {showRejectForm && (
            <form onSubmit={handleReject} className="p-4 border border-rose-200 bg-rose-50/30 rounded-2xl space-y-3 animate-in fade-in">
              <label className="block text-xs font-extrabold text-rose-700 uppercase tracking-wider">
                Alasan Penolakan Permohonan (Rejection Reason)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Sila nyatakan sebab permohonan ini ditolak..."
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-xs bg-white hover:bg-slate-50 shadow-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 font-bold text-xs shadow-sm transition-all"
                >
                  {isSubmitting ? 'Memproses...' : 'Sahkan Tolak Permohonan'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer (Sticky Ergonomic Action Bar) */}
        <div className="sticky bottom-0 z-20 px-4 sm:px-7 py-3.5 sm:py-4 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg shrink-0">
          {/* Left Side Status / Helper Indicator */}
          <div className="flex-1 min-w-0">
            {request.status === 'pending' && currentUser?.id === request.created_by && !showRejectForm && !isSubmitting && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-2 border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs sm:text-sm transition-all shadow-2xs"
              >
                Batalkan Permohonan
              </button>
            )}

            {isIssuing && (
              <div className="flex items-center gap-2 text-xs">
                {request.is_external_facility ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fasiliti Luar: {totalRequiredCylinders} unit disahkan fizikal</span>
                  </span>
                ) : !isAllCylindersAssigned ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>
                      {totalAssignedCylinders === 0
                        ? `Sila lengkapkan imbasan ${totalRequiredCylinders} silinder sebelum confirm dispatch`
                        : `Baki ${totalRequiredCylinders - totalAssignedCylinders} silinder lagi (${totalAssignedCylinders}/${totalRequiredCylinders} selesai)`}
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Semua {totalRequiredCylinders} silinder lengkap & sedia untuk dispatch</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Side / Contextual Primary Action Buttons */}
          <div className="flex items-center gap-2.5 justify-end flex-wrap sm:flex-nowrap">
            {!isIssuing && (
              <>
                {onDelete && isPharmacyStaff && (
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onDelete(request);
                    }}
                    className="px-3.5 py-2.5 border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 focus:outline-none shadow-2xs"
                    title="Padam Rekod Permohonan"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Padam Rekod</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="px-4 sm:px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all focus:outline-none shadow-2xs"
                >
                  Tutup (Close)
                </button>
              </>
            )}

            {/* Non-pharmacy information banner for pending requests */}
            {!isPharmacyStaff && request.status === 'pending' && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Menunggu kelulusan Pegawai Farmasi / Penolong Pegawai Farmasi</span>
              </div>
            )}

            {/* Non-pharmacy information banner for approved requests awaiting pharmacy dispatch */}
            {!isPharmacyStaff && request.status === 'approved' && !isIssuing && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
                <PackageCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Permohonan diluluskan. Menunggu pengeluaran fizikal oleh Pegawai Farmasi.</span>
              </div>
            )}

            {/* Pharmacy Approval actions */}
            {isPharmacyStaff && request.status === 'pending' && !showRejectForm && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs sm:text-sm transition-all focus:outline-none shadow-2xs"
                >
                  Tolak Permohonan
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all focus:outline-none flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Luluskan Permohonan</span>
                </button>
              </>
            )}

            {/* Pharmacy Issue/Dispatch actions */}
            {isPharmacyStaff && request.status === 'approved' && !isIssuing && (
              <button
                type="button"
                onClick={() => {
                  setIsIssuing(true);
                }}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all focus:outline-none flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Mulakan Pengeluaran (Dispatch Cylinders)</span>
              </button>
            )}

            {isIssuing && (
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsIssuing(false);
                  }}
                  className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-2xs focus:outline-none text-center"
                >
                  Kembali (Back)
                </button>
                <button
                  type="button"
                  onClick={handleIssue}
                  disabled={!isAllCylindersAssigned || isSubmitting}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none flex items-center justify-center gap-2 whitespace-nowrap ${
                    isAllCylindersAssigned && !isSubmitting
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-lg shadow-emerald-500/25 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isSubmitting
                      ? 'Sedang Memproses...'
                      : request.is_external_facility
                      ? `Confirm Dispatch (${totalRequiredCylinders} Unit)`
                      : `Confirm Dispatch (${totalAssignedCylinders}/${totalRequiredCylinders})`}
                  </span>
                </button>
              </div>
            )}

            {/* Ward/Requester acknowledge receipt */}
            {request.status === 'issued' && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-emerald-400 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all focus:outline-none flex items-center justify-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Sahkan Penerimaan Wad</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
