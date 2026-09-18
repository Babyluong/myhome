// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Trash2, ArrowDownToLine, Building2, Truck, FileText, 
  User as UserIcon, Calendar, CheckCircle2, AlertCircle, Sparkles, 
  Clipboard, Hash, ShieldCheck, Check, Search, MapPin
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
  condition: 'full' | 'empty';
  notes: string;
}

interface ReceiveInterFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    external_facility_name: string;
    external_doc_ref?: string;
    transporter_name?: string;
    vehicle_number?: string;
    receiver_id: string;
    department_id: string;
    received_at?: string;
    remarks?: string;
    items: Array<{
      size_code: string;
      custom_size_name?: string;
      quantity: number;
      serials: string[];
      condition?: 'full' | 'empty';
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

export const ReceiveInterFacilityModal: React.FC<ReceiveInterFacilityModalProps> = ({
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
  const [selectedReceiverId, setSelectedReceiverId] = useState(currentUser?.id || '');
  const [receivedDate, setReceivedDate] = useState(() => {
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
      quantity: 10,
      serials: Array(10).fill(''),
      condition: 'full',
      notes: ''
    }
  ]);

  // Bulk paste modal state
  const [bulkPasteTargetItemIndex, setBulkPasteTargetItemIndex] = useState<number | null>(null);
  const [bulkPasteText, setBulkPasteText] = useState('');

  // UI status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // References for keyboard focus jumps
  const serialInputsRef = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
        setSelectedReceiverId(currentUser.id);
      }
      setReceivedDate(new Date().toISOString().slice(0, 16));
      setError(null);
    }
  }, [isOpen, currentUser, departments]);

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

  // Add new item batch
  const handleAddItemBatch = () => {
    const newId = `item-${Date.now()}`;
    setItems(prev => [
      ...prev,
      {
        id: newId,
        size_code: '101-N',
        custom_size_name: '',
        quantity: 5,
        serials: Array(5).fill(''),
        condition: 'full',
        notes: ''
      }
    ]);
  };

  // Remove item batch
  const handleRemoveItemBatch = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Apply bulk pasted serials
  const handleApplyBulkPaste = () => {
    if (bulkPasteTargetItemIndex === null) return;
    const targetIdx = bulkPasteTargetItemIndex;
    const rawLines = bulkPasteText
      .split(/[\r\n,;\t]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (rawLines.length > 0) {
      setItems(prev => {
        const copy = [...prev];
        const count = rawLines.length;
        copy[targetIdx] = {
          ...copy[targetIdx],
          quantity: count,
          serials: rawLines
        };
        return copy;
      });
    }

    setBulkPasteTargetItemIndex(null);
    setBulkPasteText('');
  };

  // Search cylinders in database by serial number
  const handleSearchCylinders = async (itemIdx: number, queryOverride?: string) => {
    const rawQuery = queryOverride !== undefined ? queryOverride : (searchQueries[itemIdx] || '');
    const query = rawQuery.trim();
    if (!query) {
      setSearchMessage(prev => ({ ...prev, [itemIdx]: 'Sila taip nombor siri atau sebahagian nombor siri (cth: 7072).' }));
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
        setSearchMessage(prev => ({ ...prev, [itemIdx]: `Tiada silinder ditemui dengan carian "${query}".` }));
      }
    } catch (err) {
      console.warn('Search error:', err);
      setSearchResults(prev => ({ ...prev, [itemIdx]: [] }));
      setSearchMessage(prev => ({ ...prev, [itemIdx]: `Ralat carian. Cuba semula.` }));
    } finally {
      setIsSearching(prev => ({ ...prev, [itemIdx]: false }));
    }
  };

  // Select a single searched cylinder
  const handleSelectSearchedCylinder = (itemIdx: number, serialNumber: string) => {
    setItems(prev => {
      const copy = [...prev];
      const target = copy[itemIdx];
      if (target.serials.includes(serialNumber)) return copy;
      const emptySlot = target.serials.findIndex(s => !s.trim());
      if (emptySlot !== -1) {
        const serialsCopy = [...target.serials];
        serialsCopy[emptySlot] = serialNumber;
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
      copy[itemIdx] = { ...target, quantity: targetQty, serials: padded };
      return copy;
    });
  };

  // Check for internal duplicates within all items
  const getAllEnteredSerials = (): { serial: string; itemIdx: number; slotIdx: number }[] => {
    const list: { serial: string; itemIdx: number; slotIdx: number }[] = [];
    items.forEach((itm, itemIdx) => {
      itm.serials.forEach((s, slotIdx) => {
        const clean = s.trim();
        if (clean) {
          list.push({ serial: clean.toUpperCase(), itemIdx, slotIdx });
        }
      });
    });
    return list;
  };

  const allSerials = getAllEnteredSerials();
  const serialCounts: { [key: string]: number } = {};
  allSerials.forEach(entry => {
    serialCounts[entry.serial] = (serialCounts[entry.serial] || 0) + 1;
  });

  const totalCylindersCount = items.reduce((acc, itm) => acc + (itm.quantity || 0), 0);
  const totalSerialsFilledCount = allSerials.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const facilityName = isManualFacility ? manualFacilityName.trim() : selectedFacility.trim();
    if (!facilityName) {
      setError('Sila nyatakan atau pilih nama Fasiliti Luar Pembekal.');
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
    const effectiveReceiverId = selectedReceiverId || currentUser?.id || '';
    const effectiveReceivedAt = receivedDate ? new Date(receivedDate).toISOString() : new Date().toISOString();

    if (!effectiveDeptId) {
      setError('Sila pilih Stor / Jabatan Simpanan Penerima.');
      return;
    }

    // Validate each batch
    for (let i = 0; i < items.length; i++) {
      const itm = items[i];
      if (itm.size_code === 'OTHERS' && !itm.custom_size_name.trim()) {
        setError(`Sila masukkan saiz silinder manual untuk Baris Item #${i + 1}.`);
        return;
      }
      if (!itm.quantity || itm.quantity < 1) {
        setError(`Kuantiti untuk Baris Item #${i + 1} mestilah sekurang-kurangnya 1.`);
        return;
      }
      const emptySlots = itm.serials.filter(s => !s.trim()).length;
      if (emptySlots > 0) {
        setError(`Terdapat ${emptySlots} petak nombor siri yang belum diisi pada Baris Item #${i + 1}. Sila lengkapkan kesemua nombor siri.`);
        return;
      }
    }

    // Check duplicate serials
    const duplicates = Object.keys(serialCounts).filter(k => serialCounts[k] > 1);
    if (duplicates.length > 0) {
      setError(`Nombor siri pendua dikesan: ${duplicates.join(', ')}. Setiap silinder mesti mempunyai nombor siri yang unik.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        external_facility_name: facilityName,
        external_doc_ref: externalDocRef.trim() || undefined,
        transporter_name: transporterName.trim() || undefined,
        vehicle_number: vehicleNumber.trim() || undefined,
        receiver_id: effectiveReceiverId,
        department_id: effectiveDeptId,
        received_at: effectiveReceivedAt,
        remarks: generalRemarks.trim() || undefined,
        items: items.map(itm => ({
          size_code: itm.size_code,
          custom_size_name: itm.size_code === 'OTHERS' ? itm.custom_size_name.trim() : undefined,
          quantity: itm.quantity,
          serials: itm.serials.map(s => s.trim()).filter(Boolean),
          condition: itm.condition,
          notes: itm.notes.trim() || undefined
        }))
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Gagal memproses penerimaan silinder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-6 py-5 border-b border-indigo-950/40 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-200 shadow-inner">
                <ArrowDownToLine className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight">
                    Terima Silinder Oksigen (Antara Fasiliti)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                    Inbound Inter-Facility
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
                  Khusus untuk transaksi pemindahan bekalan silinder dari fasiliti luar (contoh: Hospital Beaufort).
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-indigo-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="font-semibold">{error}</div>
            </div>
          )}

          {/* Section 1: Facility & Delivery Metadata Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Maklumat Fasiliti Pembekal & Dokumen Penghantaran
                </h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Penerimaan Rasmi KKM
              </span>
            </div>

            {/* Supplying Facility Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fasiliti Pembekal / Source Facility <span className="text-rose-500">*</span>
              </label>
              
              {!isManualFacility ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={selectedFacility}
                      onChange={(e) => {
                        if (e.target.value === 'MANUAL') {
                          setIsManualFacility(true);
                          setManualFacilityName('');
                        } else {
                          setSelectedFacility(e.target.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                    >
                      <option value="Hospital Beaufort">Hospital Beaufort (Sabah)</option>
                      <option value="Hospital Sipitang">Hospital Sipitang (Sabah)</option>
                      <option value="Hospital Limbang">Hospital Limbang (Sarawak)</option>
                      <option value="Hospital Miri">Hospital Miri (Sarawak)</option>
                      <option value="Hospital Queen Elizabeth (HQE I)">Hospital Queen Elizabeth (HQE I)</option>
                      <option value="Hospital Queen Elizabeth II (HQE II)">Hospital Queen Elizabeth II (HQE II)</option>
                      <option value="Hospital Kuala Penyu">Hospital Kuala Penyu (Sabah)</option>
                      <option value="Hospital Papar">Hospital Papar (Sabah)</option>
                      <option value="Pejabat Kesihatan Daerah Beaufort (PKD Beaufort)">PKD Beaufort</option>
                      <option value="MANUAL">➕ Fasiliti Lain (Taip Manual)...</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setIsManualFacility(true);
                        setManualFacilityName('');
                      }}
                      className="px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shrink-0"
                    >
                      Taip Manual
                    </button>
                  </div>

                  {/* Quick Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kerap Digunakan:</span>
                    {['Hospital Beaufort', 'Hospital Sipitang', 'Hospital Limbang', 'Hospital Miri'].map(fac => (
                      <button
                        key={fac}
                        type="button"
                        onClick={() => setSelectedFacility(fac)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all border ${
                          selectedFacility === fac 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        {fac}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={manualFacilityName}
                      onChange={(e) => setManualFacilityName(e.target.value)}
                      placeholder="Masukkan nama penuh fasiliti luar (cth: Hospital Beaufort / Stor Integrasi Sabah)..."
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualFacility(false);
                      setSelectedFacility('Hospital Beaufort');
                    }}
                    className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors shrink-0"
                  >
                    Pilih Senarai
                  </button>
                </div>
              )}
            </div>

            {/* Document Reference, Vehicle & Transporter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  No. DO / Nota Hantaran / Inden Luar
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={externalDocRef}
                    onChange={(e) => setExternalDocRef(e.target.value)}
                    placeholder="cth: DO-HBF-2026-0812"
                    className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  No. Kenderaan Penghantar
                </label>
                <div className="relative">
                  <Truck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="cth: QAA 4821 X / SAB 9281"
                    className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Pemandu / Pembawa
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    placeholder="cth: Mohd Razali Bin Kassim"
                    className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Items & Serial Numbers Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Silinder Diterima & Nombor Siri Individu
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddItemBatch}
                className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Kelompok Saiz Lain
              </button>
            </div>

            {items.map((item, itemIndex) => {
              const isCustom = item.size_code === 'OTHERS';
              const filledCount = item.serials.filter(s => s.trim()).length;
              const isAllFilled = filledCount === item.quantity && item.quantity > 0;

              return (
                <div 
                  key={item.id} 
                  className="bg-white p-5 rounded-2xl border-2 border-indigo-100/80 shadow-xs space-y-4 transition-all"
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                        #{itemIndex + 1}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-800">
                        Kelompok Silinder #{itemIndex + 1}
                      </h4>
                      {isCustom && item.custom_size_name && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          Saiz Manual: {item.custom_size_name}
                        </span>
                      )}
                      {isAllFilled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> {item.quantity} Siri Lengkap
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {filledCount} / {item.quantity} Siri Diisi
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkPasteTargetItemIndex(itemIndex);
                          setBulkPasteText(item.serials.filter(Boolean).join('\n'));
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Tampal senarai nombor siri pukal dari teks/excel"
                      >
                        <Clipboard className="w-3.5 h-3.5 text-indigo-600" /> Tampal Pukal (Bulk Paste)
                      </button>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemBatch(itemIndex)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Size, Quantity, Condition */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Size Selector */}
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Saiz Silinder <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={item.size_code}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(prev => {
                            const copy = [...prev];
                            copy[itemIndex] = {
                              ...copy[itemIndex],
                              size_code: val,
                              custom_size_name: val === 'OTHERS' ? copy[itemIndex].custom_size_name : ''
                            };
                            return copy;
                          });
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                      >
                        {PRESET_CYLINDER_SIZES.map(s => (
                          <option key={s.code} value={s.code}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Kuantiti Silinder <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(itemIndex, parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-xs font-extrabold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                      />
                    </div>

                    {/* Condition */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Keadaan Silinder
                      </label>
                      <select
                        value={item.condition}
                        onChange={(e) => {
                          const val = e.target.value as 'full' | 'empty';
                          setItems(prev => {
                            const copy = [...prev];
                            copy[itemIndex] = { ...copy[itemIndex], condition: val };
                            return copy;
                          });
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                      >
                        <option value="full">Berisi Penuh (Full Gas)</option>
                        <option value="empty">Kosong (Empty Cylinder)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dedicated Manual / Custom Size Input Block when OTHERS is selected */}
                  {isCustom && (
                    <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-indigo-950 uppercase tracking-wide">
                          Taip Spesifikasi Saiz Silinder Manual (Lain-lain) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                          ✍️ Input Saiz Manual
                        </span>
                      </div>
                      <input
                        type="text"
                        value={item.custom_size_name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(prev => {
                            const copy = [...prev];
                            copy[itemIndex] = {
                              ...copy[itemIndex],
                              custom_size_name: val
                            };
                            return copy;
                          });
                        }}
                        placeholder="cth: 7.3m³, 6.2m³, 5.0m³, 2.0m³, 101-C..."
                        className="w-full px-3.5 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs sm:text-sm font-extrabold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 shadow-xs"
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
                                copy[itemIndex] = {
                                  ...copy[itemIndex],
                                  custom_size_name: chip
                                };
                                return copy;
                              });
                            }}
                            className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all border cursor-pointer ${
                              item.custom_size_name === chip
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white hover:bg-indigo-100 text-slate-700 border-indigo-200'
                            }`}
                          >
                            {item.custom_size_name === chip ? '✓ ' : ''}{chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Serial Numbers Section - Search-first approach */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Nombor Siri Silinder ({item.serials.filter(s => s.trim()).length} / {item.quantity} Diisi):
                      </span>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchQueries[itemIndex] || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setSearchQueries(prev => ({ ...prev, [itemIndex]: val }));
                            setSearchResults(prev => ({ ...prev, [itemIndex]: [] }));
                            setSearchMessage(prev => ({ ...prev, [itemIndex]: '' }));
                            if (val.trim().length >= 2) {
                              handleSearchCylinders(itemIndex, val.trim());
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchCylinders(itemIndex);
                            }
                          }}
                          placeholder="Taip nombor siri / sebahagian (cth: 7072, SABOXY, O2-P101)..."
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isSearching[itemIndex]}
                        onClick={() => handleSearchCylinders(itemIndex)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Search className="w-3 h-3" />
                        {isSearching[itemIndex] ? 'Mencari...' : 'Cari'}
                      </button>
                    </div>

                    {/* Search message */}
                    {searchMessage[itemIndex] && !isSearching[itemIndex] && (
                      <p className="text-[11px] text-slate-500 text-center py-1">{searchMessage[itemIndex]}</p>
                    )}

                    {/* Search Results */}
                    {(searchResults[itemIndex] || []).length > 0 && (
                      <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between px-1 pb-1 border-b border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide">
                            {(searchResults[itemIndex] || []).length} Silinder Dijumpai — Klik untuk Pilih
                          </span>
                          {(searchResults[itemIndex] || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectAllSearchedCylinders(itemIndex, searchResults[itemIndex] || []);
                                setSearchResults(prev => ({ ...prev, [itemIndex]: [] }));
                                setSearchQueries(prev => ({ ...prev, [itemIndex]: '' }));
                              }}
                              className="text-[10px] px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg cursor-pointer hover:bg-indigo-700"
                            >
                              ✓ Pilih Semua ({(searchResults[itemIndex] || []).length})
                            </button>
                          )}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {(searchResults[itemIndex] || []).map(cyl => {
                            const alreadyIn = item.serials.includes(cyl.serial_number);
                            return (
                              <div
                                key={cyl.id}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                  alreadyIn
                                    ? 'bg-indigo-100 border border-indigo-300 opacity-70'
                                    : 'bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/80 cursor-pointer'
                                }`}
                                onClick={() => {
                                  if (!alreadyIn) handleSelectSearchedCylinder(itemIndex, cyl.serial_number);
                                }}
                              >
                                <div>
                                  <span className="font-mono font-extrabold text-xs text-slate-900">{cyl.serial_number}</span>
                                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                    <span>Saiz: {cyl.size_code || '—'}</span>
                                    <span>•</span>
                                    <span className={`font-bold ${
                                      cyl.status === 'available' || cyl.status === 'full' ? 'text-emerald-600' :
                                      cyl.status === 'condemned' ? 'text-rose-600' : 'text-amber-600'
                                    }`}>{cyl.status}</span>
                                    {cyl.current_location && (
                                      <>
                                        <span>•</span>
                                        <span>{typeof cyl.current_location === 'object' ? (cyl.current_location as any)?.location_name : cyl.current_location}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {alreadyIn ? (
                                  <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Dipilih
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
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

                    {/* Selected serials chips */}
                    {item.serials.filter(s => s.trim()).length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Senarai Dipilih ({item.serials.filter(s => s.trim()).length}):
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {item.serials.filter(s => s.trim()).map((ser, si) => {
                            const isDuplicate = (serialCounts[ser.toUpperCase()] || 0) > 1;
                            return (
                              <span
                                key={si}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border ${
                                  isDuplicate
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                }`}
                              >
                                {ser}
                                {isDuplicate && <span className="text-[9px] font-bold text-rose-600">(Pendua)</span>}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItems(prev => {
                                      const copy = [...prev];
                                      const newSerials = copy[itemIndex].serials.filter(s => s !== ser);
                                      const qty = copy[itemIndex].quantity;
                                      const padded = newSerials.filter(Boolean).length < qty
                                        ? [...newSerials.filter(Boolean), ...Array(qty - newSerials.filter(Boolean).length).fill('')]
                                        : newSerials.filter(Boolean);
                                      copy[itemIndex] = { ...copy[itemIndex], serials: padded, quantity: padded.filter(Boolean).length || 1 };
                                      return copy;
                                    });
                                  }}
                                  className="text-indigo-400 hover:text-rose-600 cursor-pointer ml-0.5"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Collapsed manual input grid */}
                    <details className="group">
                      <summary className="text-[10px] font-bold text-slate-500 cursor-pointer hover:text-slate-700 select-none list-none flex items-center gap-1">
                        <span className="group-open:hidden">▶</span>
                        <span className="hidden group-open:inline">▼</span>
                        Input Manual / Jana Bersiri (Isi Satu-Persatu)
                      </summary>
                      <div className="pt-2 space-y-2">
                        {/* Quick serial autofill */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const prefix = prompt('Masukkan awalan nombor siri (contoh: SBX- atau HBF-):', 'HBF-');
                              if (prefix !== null && prefix.trim()) {
                                const startNumStr = prompt('Masukkan nombor permulaan (contoh: 1001):', '1001');
                                const startNum = parseInt(startNumStr || '1', 10);
                                if (!isNaN(startNum)) {
                                  setItems(prev => {
                                    const copy = [...prev];
                                    const newSerials = copy[itemIndex].serials.map((_, i) => `${prefix.trim()}${startNum + i}`);
                                    copy[itemIndex] = { ...copy[itemIndex], serials: newSerials };
                                    return copy;
                                  });
                                }
                              }
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          >
                            ⚡ Jana Bersiri Pantas
                          </button>
                        </div>
                        {/* Slot inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {item.serials.map((serialVal, serialIdx) => {
                            const cleanUpper = serialVal.trim().toUpperCase();
                            const isDuplicate = cleanUpper && (serialCounts[cleanUpper] || 0) > 1;
                            const inputKey = `input-${itemIndex}-${serialIdx}`;
                            return (
                              <div
                                key={serialIdx}
                                className={`flex items-center gap-2 p-1.5 rounded-xl border bg-white transition-all ${
                                  isDuplicate
                                    ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
                                    : serialVal.trim()
                                    ? 'border-emerald-300 bg-emerald-50/20'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                                  #{serialIdx + 1}
                                </span>
                                <input
                                  ref={el => { serialInputsRef.current[inputKey] = el; }}
                                  type="text"
                                  value={serialVal}
                                  onChange={(e) => handleSerialChange(itemIndex, serialIdx, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const nextKey = `input-${itemIndex}-${serialIdx + 1}`;
                                      if (serialInputsRef.current[nextKey]) {
                                        serialInputsRef.current[nextKey]?.focus();
                                      } else {
                                        const nextItemKey = `input-${itemIndex + 1}-0`;
                                        if (serialInputsRef.current[nextItemKey]) {
                                          serialInputsRef.current[nextItemKey]?.focus();
                                        }
                                      }
                                    }
                                  }}
                                  placeholder={`No. siri #${serialIdx + 1}`}
                                  className="w-full text-xs font-mono font-bold bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                                />
                                {isDuplicate && (
                                  <span className="text-[9px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded shrink-0">
                                    Pendua
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 3: General Remarks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Catatan Penerimaan / Remarks
            </label>
            <textarea
              rows={2}
              value={generalRemarks}
              onChange={(e) => setGeneralRemarks(e.target.value)}
              placeholder="Catatan pemeriksaan fizikal, kondisi injap silinder, atau rujukan khas..."
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 resize-none"
            />
          </div>
        </form>

        {/* Footer Bar */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-600">
              Fasiliti: <strong className="text-slate-900">{isManualFacility ? manualFacilityName || 'Manual' : selectedFacility}</strong>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div className="text-xs text-slate-600">
              Jumlah: <strong className="text-indigo-600">{totalCylindersCount} Silinder</strong>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div className="text-xs text-slate-600">
              Siri Diisi: <strong className={totalSerialsFilledCount === totalCylindersCount && totalCylindersCount > 0 ? "text-emerald-600" : "text-amber-600"}>
                {totalSerialsFilledCount} / {totalCylindersCount}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/80 rounded-xl transition-all focus:outline-none cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 focus:outline-none cursor-pointer disabled:bg-slate-400"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan Rekod & Inventori...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan & Terima Silinder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal: Bulk Paste Serials */}
        {bulkPasteTargetItemIndex !== null && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setBulkPasteTargetItemIndex(null)}
          >
            <div 
              className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clipboard className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Tampal Nombor Siri Pukal (Kelompok #{bulkPasteTargetItemIndex + 1})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkPasteTargetItemIndex(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Salin dan tampal senarai nombor siri di bawah (dipisahkan baris baharu, koma, atau tab). Sistem akan mengira kuantiti dan mengisi kesemua petak secara automatik:
              </p>

              <textarea
                rows={8}
                value={bulkPasteText}
                onChange={(e) => setBulkPasteText(e.target.value)}
                placeholder="HBF-101N-001&#10;HBF-101N-002&#10;HBF-101N-003&#10;HBF-101N-004..."
                className="w-full p-3 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                autoFocus
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-indigo-600">
                  {bulkPasteText.split(/[\r\n,;\t]+/).map(s => s.trim()).filter(Boolean).length} nombor siri dikesan
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkPasteTargetItemIndex(null)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyBulkPaste}
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm cursor-pointer"
                  >
                    Guna & Kemas Kini
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
