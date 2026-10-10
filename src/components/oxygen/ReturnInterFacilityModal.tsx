// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Trash2, ArrowUpFromLine, Building2, Truck, FileText, 
  User as UserIcon, Calendar, CheckCircle2, AlertCircle, Sparkles, 
  Clipboard, Hash, ShieldCheck, Check, Search, MapPin, Undo2, RotateCcw
} from 'lucide-react';
import type { User } from '@/types';
import { COMMON_EXTERNAL_FACILITIES } from '@/modules/mycylinder/constants/externalFacilities';
import { supabase } from '@/services/supabase';

interface ItemBatch {
  id: string;
  size_code: string;
  custom_size_name: string;
  quantity: number;
  serials: string[];
  condition: 'empty' | 'full' | 'damaged';
  notes: string;
}

interface ReturnInterFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    external_facility_name: string;
    external_doc_ref?: string;
    transporter_name?: string;
    vehicle_number?: string;
    returner_id: string;
    department_id: string;
    returned_at?: string;
    remarks?: string;
    items: Array<{
      size_code: string;
      custom_size_name?: string;
      quantity: number;
      serials: string[];
      condition?: 'empty' | 'full' | 'damaged';
      notes?: string;
    }>;
  }) => Promise<any>;
  departments: { id: string; department_name: string }[];
  currentUser: User | null;
  users: { id: string; full_name: string; jawatan?: string }[];
  hospitalId: string;
}

const PRESET_CYLINDER_SIZES = [
  { code: 'P101-D', label: 'P101-D — Pin Index (0.5m³)', type: 'PI' },
  { code: 'P101-E', label: 'P101-E — Pin Index (0.7m³)', type: 'PI' },
  { code: 'P101-F', label: 'P101-F — Pin Index (1.4m³)', type: 'PI' },
  { code: 'P101-F-BN', label: 'P101-F — Bull Nose (1.4m³)', type: 'BN' },
  { code: 'P101-HS', label: 'P101-HS — Bull Nose (6.4m³)', type: 'BN' },
  { code: '101-F', label: '101-F — Pin Index (1.4m³)', type: 'PI' },
  { code: '101-N', label: '101-N — Bull nose (8.0m³)', type: 'BN' },
  { code: 'OTHERS', label: 'Lain-lain / Saiz Khas (Taip Manual)', type: 'OTHER' },
];

export const ReturnInterFacilityModal: React.FC<ReturnInterFacilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  departments,
  currentUser,
  users,
  hospitalId,
}) => {
  // Logistics & Facility states
  const [selectedFacility, setSelectedFacility] = useState('Hospital Beaufort');
  const [isManualFacility, setIsManualFacility] = useState(false);
  const [manualFacilityName, setManualFacilityName] = useState('');
  const [externalDocRef, setExternalDocRef] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedReturnerId, setSelectedReturnerId] = useState(currentUser?.id || '');
  const [returnedDate, setReturnedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });
  const [generalRemarks, setGeneralRemarks] = useState('');

  // Items State
  const [items, setItems] = useState<ItemBatch[]>([
    {
      id: 'item-1',
      size_code: '101-N',
      custom_size_name: '',
      quantity: 5,
      serials: Array(5).fill(''),
      condition: 'empty',
      notes: ''
    }
  ]);

  // Bulk paste modal state
  const [bulkPasteTargetItemIndex, setBulkPasteTargetItemIndex] = useState<number | null>(null);
  const [bulkPasteText, setBulkPasteText] = useState('');

  // UI status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available cylinders in store for quick picking
  const [availableStoreCylinders, setAvailableStoreCylinders] = useState<Array<{
    id: string;
    serial_number: string;
    status: string;
    size_code?: string;
  }>>([]);
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);
  const [pickerTargetItemIndex, setPickerTargetItemIndex] = useState<number | null>(null);

  // Search state for serial numbers per item batch
  const [searchQueries, setSearchQueries] = useState<{ [itemIdx: number]: string }>({});
  const [searchResults, setSearchResults] = useState<{ [itemIdx: number]: Array<{
    id: string;
    serial_number: string;
    status: string;
    current_location?: string;
    size_code?: string;
  }> }>({});
  const [isSearching, setIsSearching] = useState<{ [itemIdx: number]: boolean }>({});
  const [searchMessage, setSearchMessage] = useState<{ [itemIdx: number]: string }>({});

  // Active slot suggestions popover state
  const [activeSlotSuggestion, setActiveSlotSuggestion] = useState<{
    itemIdx: number;
    serIdx: number;
    suggestions: Array<{ id: string; serial_number: string; status: string; size_code?: string }>;
  } | null>(null);

  // Store picker filter query
  const [storeFilterQuery, setStoreFilterQuery] = useState('');

  // Initialize department
  useEffect(() => {
    if (isOpen) {
      const pharmLogistic = departments.find(d => 
        d.department_name.toLowerCase().includes('logistic') || 
        d.department_name.toLowerCase().includes('logistik') ||
        ((d as any).department_code || '').toLowerCase().includes('logistic')
      ) || departments.find(d => 
        d.department_name.toLowerCase().includes('farmasi')
      );

      if (pharmLogistic) {
        setSelectedDeptId(pharmLogistic.id);
      } else if (currentUser?.department_id) {
        setSelectedDeptId(currentUser.department_id);
      } else if (departments.length > 0) {
        setSelectedDeptId(departments[0].id);
      }

      if (currentUser?.id) {
        setSelectedReturnerId(currentUser.id);
      }
      setReturnedDate(new Date().toISOString().slice(0, 16));
      setError(null);

      // Load cylinders in pharmacy store for fast reference
      if (hospitalId) {
        loadAvailableCylinders();
      }
    }
  }, [isOpen, currentUser, departments, hospitalId]);

  const loadAvailableCylinders = async () => {
    try {
      const { data } = await supabase
        .from('pharmacy_oxygen_cylinder_inventory')
        .select(`
          id,
          serial_number,
          status,
          size_info:pharmacy_oxygen_cylinder_sizes(code)
        `)
        .eq('hospital_id', hospitalId)
        .neq('status', 'condemned')
        .neq('status', 'deactivated')
        .eq('is_active', true)
        .limit(500);

      if (data) {
        setAvailableStoreCylinders(data.map(c => ({
          id: c.id,
          serial_number: c.serial_number,
          status: c.status,
          size_code: (c.size_info as any)?.code || ''
        })));
      }
    } catch (e) {
      console.warn('Failed to load store cylinders for quick pick:', e);
    }
  };

  if (!isOpen) return null;

  // Handle changing quantity of an item batch
  const handleQuantityChange = (index: number, newQty: number) => {
    const validQty = Math.max(1, Math.min(200, isNaN(newQty) ? 1 : newQty));
    setItems(prev => {
      const copy = [...prev];
      const currentSerials = copy[index].serials;
      let newSerials: string[] = [];
      if (validQty > currentSerials.length) {
        newSerials = [...currentSerials, ...Array(validQty - currentSerials.length).fill('')];
      } else {
        newSerials = currentSerials.slice(0, validQty);
      }
      copy[index] = {
        ...copy[index],
        quantity: validQty,
        serials: newSerials
      };
      return copy;
    });
  };

  // Handle serial change for specific slot
  const handleSerialChange = (itemIndex: number, serialIndex: number, val: string) => {
    setItems(prev => {
      const copy = [...prev];
      const serialsCopy = [...copy[itemIndex].serials];
      serialsCopy[serialIndex] = val;
      copy[itemIndex] = {
        ...copy[itemIndex],
        serials: serialsCopy
      };
      return copy;
    });
  };

  // Handle adding new item row
  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        size_code: '101-N',
        custom_size_name: '',
        quantity: 5,
        serials: Array(5).fill(''),
        condition: 'empty',
        notes: ''
      }
    ]);
  };

  // Handle removing item row
  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Apply bulk pasted serials
  const handleApplyBulkPaste = () => {
    if (bulkPasteTargetItemIndex === null) return;
    const lines = bulkPasteText
      .split(/[\r\n,\t;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setBulkPasteTargetItemIndex(null);
      setBulkPasteText('');
      return;
    }

    setItems(prev => {
      const copy = [...prev];
      const target = copy[bulkPasteTargetItemIndex];
      const neededQty = lines.length;
      copy[bulkPasteTargetItemIndex] = {
        ...target,
        quantity: neededQty,
        serials: lines
      };
      return copy;
    });

    setBulkPasteTargetItemIndex(null);
    setBulkPasteText('');
  };

  // Quick pick cylinder from available list into item
  const handlePickCylinder = (serialNumber: string) => {
    if (pickerTargetItemIndex === null) return;
    setItems(prev => {
      const copy = [...prev];
      const target = copy[pickerTargetItemIndex];
      const emptySlotIndex = target.serials.findIndex(s => !s.trim());
      if (emptySlotIndex !== -1) {
        const serialsCopy = [...target.serials];
        serialsCopy[emptySlotIndex] = serialNumber;
        copy[pickerTargetItemIndex] = { ...target, serials: serialsCopy };
      } else {
        copy[pickerTargetItemIndex] = {
          ...target,
          quantity: target.quantity + 1,
          serials: [...target.serials, serialNumber]
        };
      }
      return copy;
    });
  };

  // Search cylinders in database & store
  const handleSearchCylinders = async (itemIdx: number, queryOverride?: string) => {
    const rawQuery = queryOverride !== undefined ? queryOverride : (searchQueries[itemIdx] || '');
    const query = rawQuery.trim();
    if (!query) {
      setSearchMessage(prev => ({ ...prev, [itemIdx]: 'Please type the serial number or suffix (e.g. 7072).' }));
      return;
    }

    setIsSearching(prev => ({ ...prev, [itemIdx]: true }));
    setSearchMessage(prev => ({ ...prev, [itemIdx]: '' }));

    try {
      let dbQuery = supabase
        .from('pharmacy_oxygen_cylinder_inventory')
        .select(`
          id,
          serial_number,
          status,
          current_location,
          size_info:pharmacy_oxygen_cylinder_sizes(code)
        `)
        .ilike('serial_number', `%${query}%`)
        .neq('status', 'deactivated')
        .eq('is_active', true)
        .limit(30);

      if (hospitalId) {
        dbQuery = dbQuery.eq('hospital_id', hospitalId);
      }

      const { data, error: qErr } = await dbQuery;
      if (qErr) throw qErr;

      const found = (data || []).map(c => ({
        id: c.id,
        serial_number: c.serial_number,
        status: c.status,
        current_location: c.current_location,
        size_code: (c.size_info as any)?.code || ''
      }));

      setSearchResults(prev => ({ ...prev, [itemIdx]: found }));
      if (found.length === 0) {
        setSearchMessage(prev => ({ ...prev, [itemIdx]: `No cylinder found matching search "${query}".` }));
      }
    } catch (err) {
      console.warn('Search error:', err);
      const localMatches = availableStoreCylinders.filter(c =>
        c.serial_number.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(prev => ({ ...prev, [itemIdx]: localMatches }));
      if (localMatches.length === 0) {
        setSearchMessage(prev => ({ ...prev, [itemIdx]: `No cylinder found matching search "${query}".` }));
      }
    } finally {
      setIsSearching(prev => ({ ...prev, [itemIdx]: false }));
    }
  };

  // Select a single searched cylinder into the active slots
  const handleSelectSearchedCylinder = (itemIdx: number, serialNumber: string) => {
    setItems(prev => {
      const copy = [...prev];
      const target = copy[itemIdx];

      if (target.serials.includes(serialNumber)) {
        return copy;
      }

      const currQuery = (searchQueries[itemIdx] || '').trim().toLowerCase();
      let slotIdx = -1;

      if (currQuery) {
        slotIdx = target.serials.findIndex(s => s.trim().toLowerCase() === currQuery);
      }
      if (slotIdx === -1) {
        slotIdx = target.serials.findIndex(s => !s.trim());
      }

      if (slotIdx !== -1) {
        const serialsCopy = [...target.serials];
        serialsCopy[slotIdx] = serialNumber;
        copy[itemIdx] = { ...target, serials: serialsCopy };
      } else {
        copy[itemIdx] = {
          ...target,
          quantity: target.quantity + 1,
          serials: [...target.serials, serialNumber]
        };
      }
      return copy;
    });
  };

  // Select all searched cylinders at once
  const handleSelectAllSearchedCylinders = (itemIdx: number, list: Array<{ serial_number: string }>) => {
    setItems(prev => {
      const copy = [...prev];
      const target = copy[itemIdx];
      const existing = target.serials.filter(s => s.trim());
      const toAdd = list.map(l => l.serial_number).filter(sn => !existing.includes(sn));

      if (toAdd.length === 0) return copy;

      const combined = [...existing, ...toAdd];
      const targetQty = Math.max(target.quantity, combined.length);
      const padded = [...combined, ...Array(Math.max(0, targetQty - combined.length)).fill('')];

      copy[itemIdx] = {
        ...target,
        quantity: targetQty,
        serials: padded
      };
      return copy;
    });
  };

  // Handle typing in any slot with live autocomplete
  const handleSlotInputChange = async (itemIdx: number, serIdx: number, val: string) => {
    handleSerialChange(itemIdx, serIdx, val);

    const trimmed = val.trim();
    if (trimmed.length >= 2) {
      try {
        let dbQuery = supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select(`
            id,
            serial_number,
            status,
            size_info:pharmacy_oxygen_cylinder_sizes(code)
          `)
          .ilike('serial_number', `%${trimmed}%`)
          .neq('status', 'deactivated')
          .eq('is_active', true)
          .limit(8);

        if (hospitalId) {
          dbQuery = dbQuery.eq('hospital_id', hospitalId);
        }

        const { data } = await dbQuery;
        if (data && data.length > 0) {
          setActiveSlotSuggestion({
            itemIdx,
            serIdx,
            suggestions: data.map(d => ({
              id: d.id,
              serial_number: d.serial_number,
              status: d.status,
              size_code: (d.size_info as any)?.code || ''
            }))
          });
        } else {
          setActiveSlotSuggestion(null);
        }
      } catch (e) {
        setActiveSlotSuggestion(null);
      }
    } else {
      setActiveSlotSuggestion(null);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalFacility = isManualFacility ? manualFacilityName.trim() : selectedFacility;

    if (!finalFacility) {
      setError('Please specify or select recipient External Facility.');
      return;
    }

    const pharmLogistic = departments.find(d => 
      d.department_name.toLowerCase().includes('logistic') || 
      d.department_name.toLowerCase().includes('logistik') ||
      ((d as any).department_code || '').toLowerCase().includes('logistic')
    ) || departments.find(d => 
      d.department_name.toLowerCase().includes('farmasi')
    ) || departments[0];

    const effectiveDeptId = selectedDeptId || pharmLogistic?.id || currentUser?.department_id || '';
    const effectiveReturnerId = selectedReturnerId || currentUser?.id || '';
    const effectiveReturnedAt = returnedDate ? new Date(returnedDate).toISOString() : new Date().toISOString();

    if (!effectiveDeptId) {
      setError('Please select issuing department / unit.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const itm = items[i];
      if (itm.size_code === 'OTHERS' && !itm.custom_size_name.trim()) {
        setError(`Sila nyatakan nama saiz khas bagi baris item ke-${i + 1}.`);
        return;
      }
      const filledSerials = itm.serials.filter(s => s.trim());
      if (filledSerials.length === 0) {
        setError(`Sila masukkan sekurang-kurangnya 1 nombor siri silinder bagi baris ke-${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        external_facility_name: finalFacility,
        external_doc_ref: externalDocRef.trim() || undefined,
        transporter_name: transporterName.trim() || undefined,
        vehicle_number: vehicleNumber.trim() || undefined,
        returner_id: effectiveReturnerId,
        department_id: effectiveDeptId,
        returned_at: effectiveReturnedAt,
        remarks: generalRemarks.trim() || undefined,
        items: items.map(itm => ({
          size_code: itm.size_code,
          custom_size_name: itm.size_code === 'OTHERS' ? itm.custom_size_name.trim() : undefined,
          quantity: itm.quantity,
          serials: itm.serials.filter(s => s.trim()),
          condition: itm.condition,
          notes: itm.notes.trim() || undefined
        }))
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses pemulangan silinder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden my-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-gradient-to-r from-purple-50 via-white to-indigo-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-600/20">
              <ArrowUpFromLine className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Pemulangan Silinder Antara Fasiliti (Inter-Facility Return)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  Fasiliti Luar (Outbound)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Merekod penghantaran pulang silinder gas perubatan (pinjaman / kosong / gantian) ke hospital atau fasiliti luar KKM.
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

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* SECTION 1: TARGET EXTERNAL FACILITY */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                1. Maklumat Fasiliti Luar Sasaran (Destination Facility)
              </h4>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pilih atau Nyatakan Fasiliti Luar Penerima *
              </label>

              {/* Fast Chips */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {['Hospital Beaufort', 'Hospital Sipitang', 'Hospital Limbang', 'Hospital Miri', 'Hospital Queen Elizabeth', 'Klinik Kesihatan Lawas'].map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setSelectedFacility(name);
                      setIsManualFacility(false);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      !isManualFacility && selectedFacility === name
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/60'
                    }`}
                  >
                    {!isManualFacility && selectedFacility === name ? '✓ ' : '+ '}
                    {name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsManualFacility(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    isManualFacility
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-purple-50 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  {isManualFacility ? '✓ Lain-lain (Taip Manual)' : '+ Lain-lain (Taip Manual)'}
                </button>
              </div>

              {isManualFacility ? (
                <div className="relative mt-2">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={manualFacilityName}
                    onChange={e => setManualFacilityName(e.target.value)}
                    placeholder="Taip nama fasiliti luar (cth: Hospital Kudat, Stor Integrasi)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-purple-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    required
                  />
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedFacility}
                    onChange={e => setSelectedFacility(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer"
                  >
                    {COMMON_EXTERNAL_FACILITIES.map((fac, idx) => (
                      <option key={idx} value={fac.name}>
                        {fac.name} ({fac.district}, {fac.state}) — {fac.type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: LOGISTICS & DOCUMENT REFERENCES */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Truck className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                2. Rujukan Dokumen & Logistik Penghantaran
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Surat Rujukan / Nota Pulang (DO/Ref)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={externalDocRef}
                    onChange={e => setExternalDocRef(e.target.value)}
                    placeholder="cth: RET-HBL-2026-001"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pemandu / Pembawa (Transporter)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={transporterName}
                    onChange={e => setTransporterName(e.target.value)}
                    placeholder="cth: SAIDIN BIN BAKAR"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Pendaftaran Kenderaan (Vehicle No.)
                </label>
                <div className="relative">
                  <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    placeholder="cth: QSG 4752"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CYLINDERS BEING RETURNED */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  3. Senarai Silinder Yang Dipulangkan (Returned Cylinders)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-purple-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Saiz
                </button>
              </div>
            </div>

            {/* Item Rows */}
            <div className="space-y-4">
              {items.map((item, itemIdx) => (
                <div 
                  key={item.id}
                  className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3 relative group hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black uppercase rounded-lg">
                        Item #{itemIdx + 1}
                      </span>
                      {item.size_code === 'OTHERS' && item.custom_size_name && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          Saiz Manual: {item.custom_size_name}
                        </span>
                      )}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(itemIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Padam baris ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Size Selector */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Saiz Silinder *
                      </label>
                      <select
                        value={item.size_code}
                        onChange={e => {
                          const val = e.target.value;
                          setItems(prev => {
                            const copy = [...prev];
                            copy[itemIdx] = {
                              ...copy[itemIdx],
                              size_code: val,
                              custom_size_name: val === 'OTHERS' ? copy[itemIdx].custom_size_name : ''
                            };
                            return copy;
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      >
                        {PRESET_CYLINDER_SIZES.map(sz => (
                          <option key={sz.code} value={sz.code}>
                            {sz.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Kuantiti *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={item.quantity}
                        onChange={e => handleQuantityChange(itemIdx, parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        required
                      />
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Keadaan Silinder
                      </label>
                      <select
                        value={item.condition}
                        onChange={e => {
                          const val = e.target.value as any;
                          setItems(prev => {
                            const copy = [...prev];
                            copy[itemIdx].condition = val;
                            return copy;
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="empty">Kosong (Empty)</option>
                        <option value="full">Penuh / Batal Pinjam (Full)</option>
                        <option value="damaged">Rosak / Perlu Servis (Damaged)</option>
                      </select>
                    </div>
                  </div>

                  {/* Manual / Custom Size Input Block when OTHERS is selected */}
                  {item.size_code === 'OTHERS' && (
                    <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wide">
                          Taip Spesifikasi Saiz Silinder Manual (Lain-lain) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          ✍️ Input Saiz Manual
                        </span>
                      </div>
                      <input
                        type="text"
                        value={item.custom_size_name || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setItems(prev => {
                            const copy = [...prev];
                            copy[itemIdx] = { ...copy[itemIdx], custom_size_name: val };
                            return copy;
                          });
                        }}
                        placeholder="cth: 7.3m³, 6.2m³, 5.0m³, 2.0m³, 101-C..."
                        className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs sm:text-sm font-extrabold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 shadow-xs"
                        autoFocus
                        required
                      />
                      {/* Quick Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pilihan Pantas:</span>
                        {['7.3m³', '6.2m³', '5.0m³', '2.0m³', '101-C (2.0m³)'].map(chip => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setItems(prev => {
                                const copy = [...prev];
                                copy[itemIdx] = { ...copy[itemIdx], custom_size_name: chip };
                                return copy;
                              });
                            }}
                            className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all border cursor-pointer ${
                              item.custom_size_name === chip
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white hover:bg-purple-100 text-slate-700 border-purple-200'
                            }`}
                          >
                            {item.custom_size_name === chip ? '✓ ' : ''}{chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Serial Numbers Section - Search-first approach */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">
                        Nombor Siri Silinder ({item.serials.filter(s => s.trim()).length} / {item.quantity} Diisi)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setBulkPasteTargetItemIndex(itemIdx);
                            setBulkPasteText('');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <Clipboard className="w-3 h-3 text-purple-600" /> Tampal Pukal
                        </button>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchQueries[itemIdx] || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setSearchQueries(prev => ({ ...prev, [itemIdx]: val }));
                            setSearchResults(prev => ({ ...prev, [itemIdx]: [] }));
                            setSearchMessage(prev => ({ ...prev, [itemIdx]: '' }));
                            if (val.trim().length >= 2) {
                              handleSearchCylinders(itemIdx, val.trim());
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchCylinders(itemIdx);
                            }
                          }}
                          placeholder="Taip nombor siri / sebahagian (cth: 7072, SABOXY, O2-P101)..."
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isSearching[itemIdx]}
                        onClick={() => handleSearchCylinders(itemIdx)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Search className="w-3 h-3" />
                        {isSearching[itemIdx] ? 'Mencari...' : 'Cari'}
                      </button>
                    </div>

                    {/* Search Results */}
                    {searchMessage[itemIdx] && !isSearching[itemIdx] && (
                      <p className="text-[11px] text-slate-500 text-center py-1">{searchMessage[itemIdx]}</p>
                    )}

                    {(searchResults[itemIdx] || []).length > 0 && (
                      <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between px-1 pb-1 border-b border-purple-100">
                          <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wide">
                            {(searchResults[itemIdx] || []).length} Silinder Dijumpai — Klik untuk Pilih
                          </span>
                          {(searchResults[itemIdx] || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectAllSearchedCylinders(itemIdx, searchResults[itemIdx] || []);
                                setSearchResults(prev => ({ ...prev, [itemIdx]: [] }));
                                setSearchQueries(prev => ({ ...prev, [itemIdx]: '' }));
                              }}
                              className="text-[10px] px-2.5 py-1 bg-purple-600 text-white font-bold rounded-lg cursor-pointer hover:bg-purple-700"
                            >
                              ✓ Pilih Semua ({(searchResults[itemIdx] || []).length})
                            </button>
                          )}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {(searchResults[itemIdx] || []).map(cyl => {
                            const alreadyIn = item.serials.includes(cyl.serial_number);
                            return (
                              <div
                                key={cyl.id}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                  alreadyIn
                                    ? 'bg-purple-100 border border-purple-300 opacity-70'
                                    : 'bg-white border border-purple-100 hover:border-purple-300 hover:bg-purple-50/80 cursor-pointer'
                                }`}
                                onClick={() => {
                                  if (!alreadyIn) {
                                    handleSelectSearchedCylinder(itemIdx, cyl.serial_number);
                                  }
                                }}
                              >
                                <div>
                                  <span className="font-mono font-extrabold text-xs text-slate-900">{cyl.serial_number}</span>
                                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                    <span>Saiz: {cyl.size_code || '—'}</span>
                                    <span>•</span>
                                    <span className={`font-bold ${
                                      cyl.status === 'available' || cyl.status === 'empty' ? 'text-emerald-600' :
                                      cyl.status === 'condemned' ? 'text-rose-600' : 'text-amber-600'
                                    }`}>{cyl.status}</span>
                                    {cyl.current_location && (
                                      <>
                                        <span>•</span>
                                        <span>{typeof cyl.current_location === 'object' ? (cyl.current_location as any)?.location_name || 'Stor Farmasi' : cyl.current_location || 'Stor Farmasi'}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {alreadyIn ? (
                                  <span className="text-[10px] font-bold text-purple-700 flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Dipilih
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                  >
                                    + Pilih
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selected serials chips display */}
                    {item.serials.filter(s => s.trim()).length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Senarai Dipilih ({item.serials.filter(s => s.trim()).length}):
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {item.serials.filter(s => s.trim()).map((ser, si) => (
                            <span
                              key={si}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-900 text-[11px] font-mono font-bold rounded-lg border border-purple-300"
                            >
                              {ser}
                              <button
                                type="button"
                                onClick={() => {
                                  setItems(prev => {
                                    const copy = [...prev];
                                    const filteredSerials = copy[itemIdx].serials.filter(s => s !== ser || s === '');
                                    const newSerials = filteredSerials.filter(s => s.trim());
                                    const paddedSerials = [
                                      ...newSerials,
                                      ...Array(Math.max(0, copy[itemIdx].quantity - newSerials.length)).fill('')
                                    ];
                                    copy[itemIdx] = {
                                      ...copy[itemIdx],
                                      serials: paddedSerials,
                                      quantity: copy[itemIdx].quantity
                                    };
                                    return copy;
                                  });
                                }}
                                className="text-purple-500 hover:text-rose-600 cursor-pointer ml-0.5"
                                title="Buang"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manual slot input toggle */}
                    <details className="group">
                      <summary className="text-[10px] font-bold text-slate-500 cursor-pointer hover:text-slate-700 select-none list-none flex items-center gap-1">
                        <span className="group-open:hidden">▶</span>
                        <span className="hidden group-open:inline">▼</span>
                        Input Manual (Isi Satu-Persatu)
                      </summary>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 pt-2">
                        {item.serials.map((ser, serIdx) => (
                          <div key={serIdx} className="relative">
                            <span className="absolute left-2.5 top-2 text-[9px] font-black text-slate-400">
                              #{serIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={ser}
                              onChange={e => handleSlotInputChange(itemIdx, serIdx, e.target.value)}
                              onBlur={() => setActiveSlotSuggestion(null)}
                              placeholder="No. Siri..."
                              className={`w-full pl-7 pr-2 py-1.5 bg-white border rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 ${
                                ser.trim()
                                  ? 'border-purple-300 text-purple-900 focus:ring-purple-500/20'
                                  : 'border-slate-200 text-slate-700 focus:ring-slate-300'
                              }`}
                            />
                            {activeSlotSuggestion?.itemIdx === itemIdx &&
                              activeSlotSuggestion?.serIdx === serIdx &&
                              activeSlotSuggestion.suggestions.length > 0 && (
                              <div className="absolute z-20 top-full left-0 mt-1 w-56 bg-white border border-purple-200 rounded-xl shadow-lg overflow-hidden">
                                {activeSlotSuggestion.suggestions.slice(0, 6).map(sug => (
                                  <button
                                    key={sug.id}
                                    type="button"
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      handleSerialChange(itemIdx, serIdx, sug.serial_number);
                                      setActiveSlotSuggestion(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs font-mono font-bold text-slate-800 hover:bg-purple-50 flex items-center justify-between"
                                  >
                                    <span>{sug.serial_number}</span>
                                    <span className="text-[9px] text-slate-400 font-sans">{sug.size_code}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: GENERAL REMARKS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Catatan / Sebab Pemulangan (Remarks)
            </label>
            <textarea
              rows={2}
              value={generalRemarks}
              onChange={e => setGeneralRemarks(e.target.value)}
              placeholder="cth: Pemulangan 5 unit silinder pinjaman kosong ke Hospital Beaufort mengikut perjanjian inter-facility."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            {isSubmitting ? 'Merekod Pemulangan...' : 'Hantar & Jana Slip Pemulangan'}
          </button>
        </div>
      </div>

      {/* BULK PASTE DIALOG */}
      {bulkPasteTargetItemIndex !== null && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setBulkPasteTargetItemIndex(null)}
        >
          <div 
            className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-purple-600" /> Tampal Pukal Nombor Siri
              </h4>
              <button 
                onClick={() => setBulkPasteTargetItemIndex(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Salin nombor siri daripada fail Excel atau teks (satu baris setiap silinder atau dipisahkan koma), kemudian tampal di bawah:
            </p>
            <textarea
              rows={6}
              value={bulkPasteText}
              onChange={e => setBulkPasteText(e.target.value)}
              placeholder="MY-O2-001&#10;MY-O2-002&#10;MY-O2-003..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-purple-500/20"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkPasteTargetItemIndex(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyBulkPaste}
                className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-purple-700 cursor-pointer"
              >
                Gunakan ({bulkPasteText.split(/[\r\n,\t;]+/).filter(Boolean).length} Siri)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
