// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Plus, Trash2, ShieldAlert, FileText, User as UserIcon,
  Building2, Building, ArrowRight, ArrowLeftRight, Share2, 
  MapPin, Search, Check, Sparkles, Minus, Flame, Layers
} from 'lucide-react';
import type { User } from '@/types';
import { COMMON_EXTERNAL_FACILITIES } from '@/modules/mycylinder/constants/externalFacilities';

interface UnitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    department_id: string;
    items: { size_code: string; custom_size_name?: string; quantity: number; usage_notes?: string }[];
    remarks?: string;
    priority: 'normal' | 'urgent' | 'emergency';
    is_external_facility?: boolean;
    external_facility_name?: string;
    indent_direction?: 'outbound' | 'inbound';
  }) => Promise<void>;
  departments: { id: string; department_name: string }[];
  currentUser: User | null;
  initialMode?: 'internal' | 'external';
  lockMode?: boolean;
}

interface ItemRow {
  size_code: string;
  custom_size_name?: string;
  is_manual?: boolean;
  quantity: number | string;
  usage_notes: string;
}

const CYLINDER_SIZES = [
  { code: '101-N', label: '101-N — Bull nose (8.0m³)', shortName: '101-N (8.0m³)', volume: '8.0m³', valve: 'Bull Nose', tag: 'Wad / Manifold' },
  { code: '101-F', label: '101-F — Pin Index (1.4m³)', shortName: '101-F PI (1.4m³)', volume: '1.4m³', valve: 'Pin Index', tag: 'Pin Index (Loan)' },
  { code: 'P101-F-BN', label: 'P101-F — Bull Nose (1.4m³)', shortName: 'P101-F BN (1.4m³)', volume: '1.4m³', valve: 'Bull Nose', tag: 'Mudah Alih' },
  { code: 'P101-F', label: 'P101-F — Pin Index (1.4m³)', shortName: 'P101-F PI (1.4m³)', volume: '1.4m³', valve: 'Pin Index', tag: 'Kecemasan / ETD' },
  { code: 'P101-HS', label: 'P101-HS — Bull Nose (6.4m³)', shortName: 'P101-HS (6.4m³)', volume: '6.4m³', valve: 'Bull Nose', tag: 'Khas' },
  { code: 'P101-E', label: 'P101-E — Pin Index (0.7m³)', shortName: 'P101-E (0.7m³)', volume: '0.7m³', valve: 'Pin Index', tag: 'Kompak' },
  { code: 'P101-D', label: 'P101-D — Pin Index (0.5m³)', shortName: 'P101-D (0.5m³)', volume: '0.5m³', valve: 'Pin Index', tag: 'Kecil' },
  { code: 'MANUAL', label: '✍️ Lain-lain / Saiz Khas (Input Manual cth: 7.3m³, 6.2m³)', shortName: 'Saiz Manual', volume: 'Tersuai', valve: 'Manual', tag: 'Manual' },
];

export const UnitRequestModal: React.FC<UnitRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  departments,
  currentUser,
  initialMode = 'internal',
  lockMode = false,
}) => {
  // Indent Mode: 'internal' (Intra-facility hospital wards) or 'external' (Inter-facility indent e.g. to Hospital Beaufort)
  const [indentMode, setIndentMode] = useState<'internal' | 'external'>(initialMode);
  const [externalFacility, setExternalFacility] = useState('Hospital Beaufort');
  const [indentDirection, setIndentDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [isFacilityOpen, setIsFacilityOpen] = useState(false);
  const facilityRef = useRef<HTMLDivElement>(null);

  // 9 Official hospital clinical departments/wards authorized for medical cylinder indents
  const ALLOWED_CYLINDER_DEPTS = useMemo(() => [
    { key: 'female_ward', name: 'Female Ward', match: (n: string, c: string) => (n.includes('female') && n.includes('ward')) || n.includes('perempuan') || c === 'FEMALE_WARD' || c === 'WAD_PEREMPUAN' },
    { key: 'male_ward', name: 'Male Ward', match: (n: string, c: string) => ((n.includes('male') && !n.includes('female')) && n.includes('ward')) || n.includes('lelaki') || c === 'MALE_WARD' || c === 'WAD_LELAKI' },
    { key: 'paediatric_ward', name: 'Paediatric ward', match: (n: string, c: string) => n.includes('paediatric') || n.includes('pediatric') || c === 'PAEDIATRIC_WARD' },
    { key: 'maternity_ward', name: 'Maternity Ward', match: (n: string, c: string) => n.includes('maternity') || c === 'MATERNITY_WARD' },
    { key: 'emergency_trauma', name: 'Emergency and Trauma', match: (n: string, c: string) => (n.includes('emergency') && !n.includes('pharmacy')) || n.includes('trauma') || c === 'EMERGENCY_TRAUMA' },
    { key: 'radiology', name: 'Radiology and Radiography', match: (n: string, c: string) => n.includes('radiolog') || c === 'RADIOLOGY' },
    { key: 'nephrology', name: 'Nephrology', match: (n: string, c: string) => n.includes('nephrolog') || c === 'NEPHROLOGY' },
    { key: 'operation_theater', name: 'Operation Theater', match: (n: string, c: string) => n.includes('operation') || n.includes('theater') || n.includes('theatre') || c === 'OPERATION_THEATER' },
    { key: 'klinik_pakar', name: 'Unit Klinik Pakar', match: (n: string, c: string) => n.includes('klinik pakar') || n.includes('specialist clinic') || c === 'KLINIK_PAKAR' },
  ], []);

  // Filter strictly to the 7 medical cylinder departments
  const clinicalDepartments = useMemo(() => {
    const list: { id: string; department_name: string }[] = [];
    for (const def of ALLOWED_CYLINDER_DEPTS) {
      const found = (departments || []).find((d) => {
        const n = (d.department_name || '').toLowerCase().trim();
        const c = ((d as any).department_code || '').toUpperCase().trim();
        return def.match(n, c);
      });
      if (found) {
        list.push({ id: found.id, department_name: def.name });
      }
    }
    return list;
  }, [departments, ALLOWED_CYLINDER_DEPTS]);

  // Dedicated Pharmacy Logistic department for store-to-store interfacility indents
  const logisticDepartment = useMemo(() => {
    return (
      (departments || []).find((d) => {
        const n = (d.department_name || '').toLowerCase();
        const c = ((d as any).department_code || '').toLowerCase();
        return n.includes('logistic') || n.includes('logistik') || c.includes('logistic');
      }) ||
      (departments || []).find((d) => {
        const n = (d.department_name || '').toLowerCase();
        return n.includes('pharmacy') || n.includes('farmasi');
      }) ||
      (departments || [])[0]
    );
  }, [departments]);

  // Contextual departments based on indent mode:
  // Intra-facility = strictly the 7 clinical wards using medical cylinders
  // Inter-facility = Pharmacy Logistic / local central store
  const departmentOptions = useMemo(() => {
    if (indentMode === 'external') {
      const pharm = (departments || []).filter((d) => {
        const n = (d.department_name || '').toLowerCase();
        return n.includes('logistic') || n.includes('logistik') || n.includes('pharmacy');
      });
      return pharm.length > 0 ? pharm : departments;
    }
    return clinicalDepartments;
  }, [indentMode, departments, clinicalDepartments]);

  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [items, setItems] = useState<ItemRow[]>([
    { size_code: '101-N', custom_size_name: '', is_manual: false, quantity: 1, usage_notes: '' },
  ]);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevIsOpenRef = useRef(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (facilityRef.current && !facilityRef.current.contains(e.target as Node)) {
        setIsFacilityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (!prevIsOpenRef.current) {
        setItems([
          { size_code: '101-N', custom_size_name: '', is_manual: false, quantity: 1, usage_notes: '' },
        ]);
        setRemarks('');
      }

      if (initialMode) {
        setIndentMode(initialMode);
      }

      if (initialMode === 'external' || indentMode === 'external') {
        // Inter-facility indent is strictly Store-to-Store (Pharmacy Logistic)
        setSelectedDeptId(logisticDepartment?.id || '');
      } else {
        // Intra-facility indent: only auto-select if current user is stationed in one of the 7 clinical wards
        const userDeptId = currentUser?.department_id;
        const isUserInCylinderWard = clinicalDepartments.some(d => d.id === userDeptId);
        if (isUserInCylinderWard && userDeptId) {
          setSelectedDeptId(userDeptId);
        } else {
          // Do NOT pre-select Pharmacy Logistic for intra-facility requests
          setSelectedDeptId('');
        }
      }
      setError(null);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialMode, currentUser, departments, clinicalDepartments, logisticDepartment]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { size_code: '101-N', custom_size_name: '', is_manual: false, quantity: 1, usage_notes: '' }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleItemUpdate = (index: number, updates: Partial<ItemRow>) => {
    setItems((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      updated[index] = {
        ...updated[index],
        ...updates,
      };
      return updated;
    });
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    handleItemUpdate(index, { [field]: value });
  };

  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveDeptId = indentMode === 'external'
      ? (logisticDepartment?.id || selectedDeptId || currentUser?.department_id || '')
      : selectedDeptId;

    if (indentMode !== 'external' && !effectiveDeptId) {
      setError('Please select Requesting Ward / Unit.');
      return;
    }

    if (indentMode === 'external' && !externalFacility.trim()) {
      setError('Please specify or select External Facility (e.g. Beaufort Hospital).');
      return;
    }

    // Validate manual cylinder sizes
    for (let i = 0; i < items.length; i++) {
      const itm = items[i];
      const isManual = itm.is_manual || itm.size_code === 'MANUAL';
      if (isManual && !itm.custom_size_name?.trim()) {
        setError(`Sila nyatakan spesifikasi saiz silinder manual untuk item #${i + 1} (cth: 7.3m³, 6.2m³).`);
        return;
      }
    }

    const invalidItem = items.some((item) => !item.quantity || item.quantity <= 0);
    if (invalidItem) {
      setError('Please ensure quantity is at least 1 for all items.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const isExt = indentMode === 'external';
      await onSubmit({
        department_id: effectiveDeptId,
        items: items.map((itm) => {
          const isManual = itm.is_manual || itm.size_code === 'MANUAL';
          const size = isManual ? (itm.custom_size_name?.trim() || 'MANUAL') : itm.size_code;
          return {
            size_code: size,
            custom_size_name: isManual ? itm.custom_size_name?.trim() : undefined,
            quantity: Number(itm.quantity),
            usage_notes: itm.usage_notes || undefined,
          };
        }),
        priority,
        remarks: remarks || undefined,
        is_external_facility: isExt,
        external_facility_name: isExt ? externalFacility.trim() : undefined,
        indent_direction: isExt ? indentDirection : 'outbound',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting requisition.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const filteredFacilities = COMMON_EXTERNAL_FACILITIES.filter(f => 
    !facilitySearch || 
    f.name.toLowerCase().includes(facilitySearch.toLowerCase()) || 
    f.district.toLowerCase().includes(facilitySearch.toLowerCase()) ||
    f.state.toLowerCase().includes(facilitySearch.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-slate-950/45 backdrop-blur-sm transition-opacity"
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
        .animate-modal-slide {
          animation: slideInFromRight 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-modal-fade {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
      
      {/* Modal Drawer Sheet */}
      <div 
        className="bg-slate-50/95 sm:bg-slate-50 w-full max-w-2xl h-full sm:rounded-l-3xl shadow-2xl border-l border-slate-200/80 flex flex-col overflow-hidden animate-modal-slide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-4 py-3.5 sm:px-7 sm:py-5 border-b border-slate-200/80 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              indentMode === 'external' 
                ? 'bg-indigo-50 border-indigo-200/60 text-indigo-600 shadow-xs' 
                : 'bg-emerald-50 border-emerald-200/60 text-emerald-600 shadow-xs'
            }`}>
              {indentMode === 'external' ? (
                <Share2 className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                  Borang Permohonan Silinder
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shrink-0 ${
                  indentMode === 'external'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {indentMode === 'external' ? 'Inter-Facility' : 'Intra-Facility'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                {indentMode === 'external'
                  ? 'Inter-facility oxygen supply requisition between MOH healthcare facilities.'
                  : 'Inden bekalan silinder oksigen wad klinikal ke Unit Farmasi Logistik.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 sm:p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm animate-modal-fade shadow-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold leading-snug">{error}</div>
            </div>
          )}

          {/* External Facility Configuration (Inter-Facility only) */}
          {indentMode === 'external' && (
            <div className="p-4 sm:p-5 bg-white border border-indigo-100 rounded-2xl shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-indigo-50">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                  Konfigurasi Fasiliti Luar (Inter-Facility)
                </h4>
              </div>

              {/* Target Facility Input & Autocomplete */}
              <div className="space-y-1.5" ref={facilityRef}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Fasiliti Luar Sasaran (Target Facility) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Fasiliti KKM</span>
                </div>

                <div className="relative">
                  <div className="relative flex items-center">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={externalFacility}
                      onChange={(e) => {
                        setExternalFacility(e.target.value);
                        setFacilitySearch(e.target.value);
                        setIsFacilityOpen(true);
                      }}
                      onFocus={() => setIsFacilityOpen(true)}
                      placeholder="Cth: Hospital Beaufort, KK Sundar..."
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsFacilityOpen(!isFacilityOpen)}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
                    >
                      <svg className={`w-4 h-4 transform transition-transform ${isFacilityOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {isFacilityOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto z-30 divide-y divide-slate-100 animate-modal-fade">
                      {filteredFacilities.length > 0 ? (
                        filteredFacilities.map((fac, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setExternalFacility(fac.name);
                              setIsFacilityOpen(false);
                            }}
                            className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50/80 transition-colors ${
                              externalFacility === fac.name ? 'bg-indigo-50 font-extrabold text-indigo-700' : 'text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <div>
                                <span className="font-bold">{fac.name}</span>
                                <span className="text-[10px] text-slate-400 block">{fac.district}, {fac.state} • {fac.type}</span>
                              </div>
                            </div>
                            {externalFacility === fac.name && <Check className="w-4 h-4 text-indigo-600" />}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Nama tersuai &quot;{externalFacility}&quot; akan digunakan.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-0.5">Pantas:</span>
                  {['Hospital Beaufort', 'Hospital Sipitang', 'Hospital Limbang', 'Hospital Miri', 'KK Lawas'].map((facName) => (
                    <button
                      key={facName}
                      type="button"
                      onClick={() => {
                        setExternalFacility(facName);
                        setIsFacilityOpen(false);
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                        externalFacility === facName
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      {externalFacility === facName ? '✓ ' : ''}{facName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indent Direction Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Arah Aliran Indent (Direction)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIndentDirection('outbound')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      indentDirection === 'outbound'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-indigo-600">
                        Permohonan Keluar (Outbound)
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                        Hospital Lawas <ArrowRight className="w-3.5 h-3.5 text-indigo-500" /> {externalFacility || 'Fasiliti Luar'}
                      </span>
                    </div>
                    {indentDirection === 'outbound' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIndentDirection('inbound')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      indentDirection === 'inbound'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-blue-600">
                        Permohonan Masuk (Inbound)
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                        {externalFacility || 'Fasiliti Luar'} <ArrowRight className="w-3.5 h-3.5 text-blue-500" /> Hospital Lawas
                      </span>
                    </div>
                    {indentDirection === 'inbound' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>
              </div>

              {/* Store to Store Information Notice */}
              <div className="flex items-center gap-2.5 p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-950 font-semibold">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="flex-1 leading-tight">
                  <div className="text-[11px] font-extrabold text-indigo-900">
                    Operasi Stor ke Stor (Store-to-Store Logistics)
                  </div>
                  <div className="text-[10px] text-indigo-700/90 font-medium mt-0.5">
                    Permohonan inter-facility dikendalikan terus oleh <strong className="font-extrabold text-indigo-950">Unit Farmasi Logistik</strong> tanpa melalui wad klinikal.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Department Selection (Intra-Facility Only) */}
          {indentMode !== 'external' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Requesting Department (Wad / Unit) *
                </label>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  {clinicalDepartments.length > 0 ? clinicalDepartments.length : 9} Wad & Unit Dibenarkan
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-xs"
                  required
                >
                  <option value="">Pilih Wad / Unit Pemohon...</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Priority Level Pill Control */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Tahap Keutamaan (Priority Level) *
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl sm:rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`py-2 px-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  priority === 'normal'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200/70 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-colors ${priority === 'normal' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Normal</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`py-2 px-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  priority === 'urgent'
                    ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-amber-700 hover:bg-white/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-colors ${priority === 'urgent' ? 'bg-white' : 'bg-amber-400'}`} />
                <span>Urgent</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('emergency')}
                className={`py-2 px-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  priority === 'emergency'
                    ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-white/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${priority === 'emergency' ? 'bg-white animate-pulse' : 'bg-rose-400'}`} />
                <span>STAT / Cemas</span>
              </button>
            </div>
          </div>

          {/* Section 3: Requested Cylinders */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Senarai Silinder Dipohon *
                </label>
                <span className="text-[10px] font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {totalQuantity} {totalQuantity === 1 ? 'Unit' : 'Unit'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200/60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Saiz</span>
              </button>
            </div>

            {/* Cylinder Item Cards */}
            <div className="space-y-3">
              {items.map((item, index) => {
                const isManual = item.is_manual || item.size_code === 'MANUAL';
                const cylMeta = !isManual ? CYLINDER_SIZES.find(c => c.code === item.size_code) : null;
                const displayName = isManual 
                  ? (item.custom_size_name?.trim() || 'Saiz Manual (Tersuai)') 
                  : (cylMeta?.shortName || item.size_code);

                return (
                  <div
                    key={index}
                    className="relative bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Item Card Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800">
                          {displayName}
                        </span>
                        {isManual ? (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/70 inline-flex items-center gap-1">
                            <span>✍️ Saiz Manual</span>
                          </span>
                        ) : (
                          cylMeta && (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 hidden sm:inline-block">
                              {cylMeta.valve} • {cylMeta.volume}
                            </span>
                          )
                        )}
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                          title="Padam saiz ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Padam</span>
                        </button>
                      )}
                    </div>

                    {/* Fields: Size Select & Quantity Stepper */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-start">
                      {/* Size Code Dropdown or Manual Input */}
                      <div className="sm:col-span-8 space-y-1.5">
                        <div className="h-6 flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {isManual ? 'Spesifikasi Saiz Silinder Manual *' : 'Kod Saiz & Jenis Injap *'}
                          </label>
                          {isManual ? (
                            <button
                              type="button"
                              onClick={() => {
                                handleItemUpdate(index, {
                                  is_manual: false,
                                  size_code: '101-N',
                                  custom_size_name: ''
                                });
                              }}
                              className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 underline transition-colors cursor-pointer"
                            >
                              📋 Senarai Standard
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleItemUpdate(index, {
                                  is_manual: true,
                                  size_code: 'MANUAL',
                                });
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200 transition-colors cursor-pointer"
                            >
                              ✍️ Input Saiz Manual
                            </button>
                          )}
                        </div>

                        {isManual ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={item.custom_size_name || ''}
                              onChange={(e) => handleItemChange(index, 'custom_size_name', e.target.value)}
                              placeholder="Cth: 7.3m³, 6.2m³, 2.0m³, 5.0m³ Bullnose..."
                              className="h-10 w-full px-3 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs sm:text-sm font-extrabold text-indigo-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
                              autoFocus
                            />
                            {/* Quick chips for non-standard / external sizes */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pantas:</span>
                              {['7.3m³', '6.2m³', '5.0m³', '2.0m³', '101-C (2.0m³)'].map((chip) => (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => handleItemChange(index, 'custom_size_name', chip)}
                                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all border cursor-pointer ${
                                    item.custom_size_name === chip
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white hover:bg-indigo-50 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {item.custom_size_name === chip ? '✓ ' : ''}{chip}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              value={item.size_code}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'MANUAL') {
                                  handleItemUpdate(index, {
                                    is_manual: true,
                                    size_code: 'MANUAL',
                                  });
                                } else {
                                  handleItemUpdate(index, {
                                    size_code: val,
                                    is_manual: false,
                                  });
                                }
                              }}
                              className="h-10 w-full pl-3 pr-8 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            >
                              {CYLINDER_SIZES.map((sz) => (
                                <option key={sz.code} value={sz.code}>
                                  {sz.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="sm:col-span-4 space-y-1.5">
                        <div className="h-6 flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Kuantiti (Unit) *
                          </label>
                        </div>
                        <div className="h-10 flex items-center border border-slate-200 rounded-xl bg-slate-50/70 overflow-hidden focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                          <button
                            type="button"
                            onClick={() => handleItemChange(index, 'quantity', Math.max(1, (Number(item.quantity) || 1) - 1))}
                            className="h-full px-3 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                            disabled={(Number(item.quantity) || 1) <= 1}
                            title="Kurang 1 unit"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                handleItemChange(index, 'quantity', '');
                              } else {
                                const parsed = parseInt(val, 10);
                                handleItemChange(index, 'quantity', isNaN(parsed) ? '' : Math.max(1, parsed));
                              }
                            }}
                            onBlur={() => {
                              if (item.quantity === '' || Number(item.quantity) < 1) {
                                handleItemChange(index, 'quantity', 1);
                              }
                            }}
                            className="h-full w-full text-center bg-transparent font-extrabold text-xs sm:text-sm text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => handleItemChange(index, 'quantity', (Number(item.quantity) || 0) + 1)}
                            className="h-full px-3 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                            title="Tambah 1 unit"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remarks / Justification Input */}
                    <div className="space-y-1 pt-0.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Justifikasi / Catatan Penggunaan (Pilihan)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Cth: Standby kecemasan, pesakit zon merah, penggantian silinder..."
                          value={item.usage_notes}
                          onChange={(e) => handleItemChange(index, 'usage_notes', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full-width Add Button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-center gap-2 transition-all group"
            >
              <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3" />
              </div>
              <span>Tambah Saiz Silinder Lain</span>
            </button>
          </div>

          {/* Section 4: General Remarks */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Catatan Tambahan (General Remarks)
            </label>
            <textarea
              placeholder="Sila nyatakan sebarang nota penting kepada Unit Farmasi Logistik..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none shadow-xs font-medium"
            />
          </div>

          {/* Section 5: Requester Profile Card */}
          <div className="p-3.5 sm:p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm flex items-center justify-center border border-slate-300/60 shrink-0">
                {currentUser?.full_name 
                  ? currentUser.full_name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() 
                  : 'AA'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pemohon Log Masuk (Requester)
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                  {currentUser?.full_name || 'Pegawai Bertugas'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                {currentUser?.jawatan || (currentUser as any)?.role?.role_name || 'Kakitangan Hospital'}
              </span>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="px-4 py-3 sm:px-7 sm:py-4 border-t border-slate-200/80 flex items-center justify-between bg-white/95 backdrop-blur-md sticky bottom-0 z-20">
          {/* Summary info (desktop view) */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Total Requisitions:</span>
            <span className="font-extrabold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
              {totalQuantity} {totalQuantity === 1 ? 'Silinder' : 'Silinder'}
            </span>
            <span className="text-slate-400">({items.length} {items.length === 1 ? 'saiz' : 'saiz berbeza'})</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all focus:outline-none active:scale-[0.98]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] focus:outline-none flex items-center justify-center gap-2 ${
                indentMode === 'external'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 disabled:bg-slate-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 disabled:bg-slate-300'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Sedang Menghantar...</span>
                </>
              ) : (
                <span>
                  {indentMode === 'external' ? 'Hantar Inden Luar' : 'Submit Requisition'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
