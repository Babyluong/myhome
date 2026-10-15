// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Search, CheckSquare, Square, FileText, CheckCircle2, RotateCcw, Database, Truck, Building2, Calendar, Clock, Copy, Check } from 'lucide-react'
import type { OxygenCylinderWithRelations } from '@/types/pharmacy';
import { getEmptyCylindersInStore } from '@/modules/mycylinder/services/oxygenService';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useAuthStore } from '@/stores/authStore';

interface EmptyCylinderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
  initialCylinders?: OxygenCylinderWithRelations[];
  onOpenReturnModal?: (selectedCylinders: OxygenCylinderWithRelations[]) => void;
}

export const EmptyCylinderListModal: React.FC<EmptyCylinderListModalProps> = ({
  isOpen,
  onClose,
  hospitalId,
  initialCylinders,
  onOpenReturnModal,
}) => {
  const { language } = useLanguage();
  const { user } = useAuthStore();

  const [cylinders, setCylinders] = useState<OxygenCylinderWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [valveFilter, setValveFilter] = useState<'all' | 'BN' | 'PI'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedDocNum, setCopiedDocNum] = useState(false);
  const [copiedSerialId, setCopiedSerialId] = useState<string | null>(null);

  // Generated document reference number
  const documentNumber = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `O2-ECL-${yyyy}${mm}${dd}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, [isOpen]);

  const loadData = async () => {
    if (initialCylinders && initialCylinders.length > 0) {
      const activeOnly = initialCylinders.filter(c => c.status !== 'deactivated' && c.is_active !== false);
      setCylinders(activeOnly);
      setSelectedIds(new Set(activeOnly.map(c => c.id)));
      return;
    }

    if (!hospitalId) return;
    setIsLoading(true);
    try {
      const res = await getEmptyCylindersInStore(hospitalId);
      if (res.data) {
        const activeOnly = res.data.filter(c => c.status !== 'deactivated' && c.is_active !== false);
        setCylinders(activeOnly);
        setSelectedIds(new Set(activeOnly.map(c => c.id)));
      }
    } catch (err) {
      console.error('Error loading empty cylinders for document list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      setSearchTerm('');
      setSizeFilter('');
      setValveFilter('all');
      setCopiedDocNum(false);
      setCopiedSerialId(null);
    }
  }, [isOpen, hospitalId, initialCylinders]);

  // Active non-deactivated cylinders memo
  const activeCylinders = useMemo(() => {
    return cylinders.filter(c => c.status !== 'deactivated' && c.is_active !== false);
  }, [cylinders]);

  const getValveCode = (c: OxygenCylinderWithRelations): 'BN' | 'PI' => {
    const code = c.type_info?.code || (c.type_info?.name?.toLowerCase().includes('bullnose') ? 'BN' : 'PI');
    return code === 'BN' ? 'BN' : 'PI';
  };

  const getCapacityStr = (c: OxygenCylinderWithRelations): string => {
    if (c.size_info?.capacity) return `${Number(c.size_info.capacity)}M³`;
    if (c.capacity) return `${c.capacity}M³`;
    const code = (c.size_info?.code || c.size_code || '').toUpperCase();
    if (code.includes('HS') || code.includes('6.4')) return '6.4M³';
    if (code.includes('F') || code.includes('1.4')) return '1.4M³';
    if (code.includes('E') || code.includes('0.7')) return '0.7M³';
    if (code.includes('D') || code.includes('0.5')) return '0.5M³';
    if (code.includes('N') || code.includes('8.0')) return '8.0M³';
    return '1.4M³';
  };

  // Unique sizes for filter
  const uniqueSizes = useMemo(() => {
    const set = new Set<string>();
    activeCylinders.forEach(c => {
      const s = c.size_info?.code || c.size_code || c.type_info?.type_name;
      if (s) set.add(s);
    });
    return Array.from(set).sort();
  }, [activeCylinders]);

  // Bullnose vs Pin Index metrics
  const valveCounts = useMemo(() => {
    let bn = 0;
    let pi = 0;
    activeCylinders.forEach(c => {
      const code = getValveCode(c);
      if (code === 'BN') bn++;
      else pi++;
    });
    return { bn, pi };
  }, [activeCylinders]);

  // Filtered cylinders
  const filteredCylinders = useMemo(() => {
    return activeCylinders.filter(c => {
      if (c.status === 'deactivated' || c.is_active === false) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const sn = (c.serial_number || '').toLowerCase();
        const qr = (c.qr_code || '').toLowerCase();
        if (!sn.includes(q) && !qr.includes(q)) return false;
      }
      if (sizeFilter) {
        const s = c.size_info?.code || c.size_code || c.type_info?.type_name;
        if (s !== sizeFilter) return false;
      }
      if (valveFilter !== 'all') {
        const code = getValveCode(c);
        if (code !== valveFilter) return false;
      }
      return true;
    });
  }, [activeCylinders, searchTerm, sizeFilter, valveFilter]);

  const isAllFilteredSelected = filteredCylinders.length > 0 && filteredCylinders.every(c => selectedIds.has(c.id));

  const toggleSelectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (isAllFilteredSelected) {
        filteredCylinders.forEach(c => next.delete(c.id));
      } else {
        filteredCylinders.forEach(c => next.add(c.id));
      }
      return next;
    });
  };

  const toggleSelectCylinder = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyDocNum = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(documentNumber);
      setCopiedDocNum(true);
      setTimeout(() => setCopiedDocNum(false), 1500);
    }
  };

  const handleCopySerial = (serial: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(serial);
      setCopiedSerialId(id);
      setTimeout(() => setCopiedSerialId(null), 1500);
    }
  };

  const handleProceedToReturn = () => {
    const selectedList = cylinders.filter(c => selectedIds.has(c.id));
    if (selectedList.length === 0) {
      alert(language === 'ms' ? 'Please select at least 1 cylinder to return.' : 'Please select at least 1 cylinder to return.');
      return;
    }
    if (onOpenReturnModal) {
      onOpenReturnModal(selectedList);
    }
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Print Specific CSS Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #empty-cylinder-manifest-print, #empty-cylinder-manifest-print * {
            visibility: visible !important;
          }
          #empty-cylinder-manifest-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 24px !important;
            display: block !important;
          }
        }
      `}</style>

      {/* Screen Interactive Modal */}
      <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
        <div 
          className="bg-surface border-0 sm:border sm:border-border-default sm:rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-indigo-500/15 border border-indigo-400/25 rounded-xl text-indigo-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white whitespace-nowrap">
                    {language === 'ms' ? 'Empty Cylinder Register' : 'Empty Cylinder List Document'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyDocNum}
                    title={language === 'ms' ? 'Salin No. Dokumen' : 'Copy Document Reference'}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-500/30 active:scale-95 transition-[transform,opacity,box-shadow,border-color] cursor-pointer"
                  >
                    <span>{documentNumber}</span>
                    {copiedDocNum ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-indigo-300/70 hover:text-indigo-200" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 truncate hidden sm:block mt-0.5">
                  {language === 'ms' 
                    ? 'Dokumen rasmi semakan & inventori silinder kosong sedia untuk pemulangan pembekal' 
                    : 'Official empty cylinder verification & inventory manifest ready for return dispatch'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handlePrint}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-[transform,opacity,box-shadow,border-color] flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title={language === 'ms' ? 'Print Register' : 'Print Manifest'}
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">{language === 'ms' ? 'Print Register' : 'Print Manifest'}</span>
                <span className="sm:hidden">{language === 'ms' ? 'Cetak' : 'Print'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Compact Document Metadata Ribbon */}
          <div className="bg-subtle/50 border-b border-border-default px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs shrink-0 overflow-x-auto">
            <div className="flex items-center gap-3 sm:gap-5 min-w-0 text-text-secondary whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-text-muted font-medium">{language === 'ms' ? 'Stor:' : 'Store:'}</span>
                <span className="font-bold text-text-primary bg-surface px-1.5 py-0.5 rounded border border-border-default text-[11px]">
                  Stor Farmasi
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono font-bold text-text-primary text-[11px]">
                  {new Date().toLocaleDateString('ms-MY', { year: 'numeric', month: 'short', day: '2-digit' })}
                </span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="hidden sm:flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-text-muted font-medium">{language === 'ms' ? 'Pegawai:' : 'Officer:'}</span>
                <span className="font-bold text-text-primary text-[11px] truncate max-w-[150px]">
                  {user?.name || user?.email || 'Pegawai Stor'}
                </span>
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-400 font-extrabold text-[10px] sm:text-[11px] border border-emerald-500/20 flex items-center gap-1 whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{language === 'ms' ? 'Disahkan di Stor' : 'Verified in Store'}</span>
            </span>
          </div>

          {/* KPI Metrics Strip (Sleek 4-col micro-strip on mobile, clear cards on desktop) */}
          {/* Mobile Micro-Strip (sm:hidden) */}
          <div className="grid grid-cols-4 gap-1.5 px-3 py-2 bg-surface border-b border-border-subtle shrink-0 sm:hidden">
            <div className="bg-subtle/50 border border-border-default rounded-lg p-1.5 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                {language === 'ms' ? 'Kosong' : 'Empty'}
              </span>
              <div className="font-mono font-extrabold text-text-primary text-sm mt-0.5">
                {cylinders.length}
              </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-1.5 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 block truncate">
                {language === 'ms' ? 'Dipilih' : 'Selected'}
              </span>
              <div className="font-mono font-extrabold text-rose-400 dark:text-rose-300 font-bold text-sm mt-0.5">
                {selectedIds.size}
                <span className="text-[10px] font-normal text-rose-600 font-sans">/{cylinders.length}</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-1.5 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 block truncate">
                Bullnose
              </span>
              <div className="font-mono font-extrabold text-blue-400 dark:text-blue-300 font-bold text-sm mt-0.5">
                {valveCounts.bn}
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-1.5 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 block truncate">
                Pin Index
              </span>
              <div className="font-mono font-extrabold text-indigo-400 dark:text-indigo-300 font-bold text-sm mt-0.5">
                {valveCounts.pi}
              </div>
            </div>
          </div>

          {/* Desktop Summary Cards (hidden sm:grid) */}
          <div className="hidden sm:grid grid-cols-4 gap-3 px-6 py-2.5 bg-surface border-b border-border-subtle shrink-0">
            <div className="bg-subtle/50 border border-border-default rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'ms' ? 'Jumlah Silinder Kosong' : 'Total Empty Cylinders'}
                </span>
                <span className="text-[10px] text-text-muted font-medium">
                  {language === 'ms' ? 'Inventori semasa stor' : 'Live store inventory'}
                </span>
              </div>
              <div className="text-xl font-extrabold text-text-primary font-mono">
                {cylinders.length}
                <span className="text-xs font-sans font-normal text-text-muted ml-1">cyl</span>
              </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  {language === 'ms' ? 'Dipilih Untuk Pulang' : 'Selected for Return'}
                </span>
                <span className="text-[10px] text-rose-600/80 font-medium">
                  {language === 'ms' ? 'Sedia untuk pemulangan' : 'Ready to create return doc'}
                </span>
              </div>
              <div className="text-xl font-extrabold text-rose-400 dark:text-rose-300 font-bold font-mono">
                {selectedIds.size}
                <span className="text-xs font-sans font-normal text-rose-700 ml-1">/ {cylinders.length}</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  🔵 Bullnose (BN)
                </span>
                <span className="text-[10px] text-blue-600/80 font-medium">
                  {language === 'ms' ? 'Injap Bullnose' : 'Bullnose Valve Type'}
                </span>
              </div>
              <div className="text-xl font-extrabold text-blue-400 dark:text-blue-300 font-bold font-mono">
                {valveCounts.bn}
                <span className="text-xs font-sans font-normal text-blue-700 ml-1">cyl</span>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
                  🟣 Pin Index (PI)
                </span>
                <span className="text-[10px] text-purple-600/80 font-medium">
                  {language === 'ms' ? 'Injap Pin Index' : 'Pin Index Valve Type'}
                </span>
              </div>
              <div className="text-xl font-extrabold text-indigo-400 dark:text-indigo-300 font-bold font-mono">
                {valveCounts.pi}
                <span className="text-xs font-sans font-normal text-purple-700 ml-1">cyl</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="px-4 sm:px-6 py-2.5 bg-subtle/50 border-b border-border-default flex flex-col gap-2 shrink-0">
            {/* Row 1: Search & Bulk Action on desktop */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={language === 'ms' ? 'Cari no. siri atau kod QR silinder...' : 'Search serial # or QR code...'}
                  className="w-full pl-8 pr-7 py-1.5 bg-surface border border-border-default hover:border-border-default rounded-lg text-xs font-medium text-text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text-secondary p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Select All Toggle Button */}
              <button
                type="button"
                onClick={toggleSelectAllFiltered}
                className="px-2.5 sm:px-3 py-1.5 bg-surface hover:bg-subtle/50 border border-border-default hover:border-border-default rounded-lg text-xs font-bold text-text-secondary transition-[transform,opacity,box-shadow,border-color] flex items-center gap-1.5 cursor-pointer shadow-elevation-1 shrink-0 whitespace-nowrap active:scale-95"
              >
                {isAllFilteredSelected ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden sm:inline">{language === 'ms' ? 'Batal Semua' : 'Deselect All'}</span>
                    <span className="sm:hidden">{language === 'ms' ? 'Batal' : 'Deselect'}</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">{language === 'ms' ? 'Pilih Semua' : 'Select All'}</span>
                    <span className="sm:hidden">{language === 'ms' ? 'Pilih' : 'Select'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Row 2: Filter Chips (Size + Valve) */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
              {/* Size Filter Pills */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-bold text-text-secondary font-bold uppercase tracking-wider hidden sm:inline mr-1">
                  {language === 'ms' ? 'Saiz:' : 'Size:'}
                </span>
                <button
                  type="button"
                  onClick={() => setSizeFilter('')}
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-[transform,opacity,box-shadow,border-color] border cursor-pointer whitespace-nowrap ${
                    sizeFilter === ''
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-surface text-text-secondary border-border-default hover:bg-subtle/50'
                  }`}
                >
                  {language === 'ms' ? 'Semua' : 'All'} ({cylinders.length})
                </button>
                {uniqueSizes.map(size => {
                  const cnt = cylinders.filter(c => (c.size_info?.code || c.size_code || c.type_info?.type_name) === size).length;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSizeFilter(size)}
                      className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold transition-[transform,opacity,box-shadow,border-color] border cursor-pointer whitespace-nowrap ${
                        sizeFilter === size
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-surface text-text-secondary border-border-default hover:bg-subtle/50'
                      }`}
                    >
                      {size} ({cnt})
                    </button>
                  );
                })}
              </div>

              {/* Valve Type Toggle */}
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setValveFilter('all')}
                  className={`px-2 py-0.5 rounded-md transition-[transform,opacity,box-shadow,border-color] cursor-pointer whitespace-nowrap ${
                    valveFilter === 'all' ? 'bg-surface text-text-primary shadow-elevation-1 font-extrabold' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {language === 'ms' ? 'Semua Injap' : 'All Valves'}
                </button>
                <button
                  type="button"
                  onClick={() => setValveFilter('BN')}
                  className={`px-2 py-0.5 rounded-md transition-[transform,opacity,box-shadow,border-color] cursor-pointer whitespace-nowrap ${
                    valveFilter === 'BN' ? 'bg-blue-600 text-white shadow-elevation-1 font-extrabold' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  BN ({valveCounts.bn})
                </button>
                <button
                  type="button"
                  onClick={() => setValveFilter('PI')}
                  className={`px-2 py-0.5 rounded-md transition-[transform,opacity,box-shadow,border-color] cursor-pointer whitespace-nowrap ${
                    valveFilter === 'PI' ? 'bg-purple-600 text-white shadow-elevation-1 font-extrabold' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  PI ({valveCounts.pi})
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Container (Cards on Mobile, Table on Desktop) */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 min-h-[280px]">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-2 text-slate-400">
                <RotateCcw className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs font-semibold">
                  {language === 'ms' ? 'Memuatkan senarai silinder kosong...' : 'Loading empty cylinder manifest...'}
                </span>
              </div>
            ) : filteredCylinders.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-border-default rounded-2xl p-6 bg-subtle/50">
                <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-text-secondary">
                  {language === 'ms' ? 'Tiada silinder dijumpai' : 'No empty cylinders found'}
                </h5>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchTerm || sizeFilter || valveFilter !== 'all'
                    ? (language === 'ms' ? 'Cuba laraskan carian atau penapis anda.' : 'Try adjusting your search or filter options.')
                    : (language === 'ms' ? 'Semua silinder dalam stor telah diagihkan atau dipulangkan.' : 'All cylinders in store are currently allocated or returned.')}
                </p>
              </div>
            ) : (
              <>
                {/* 1. MOBILE LIST / CARD VIEW (md:hidden) */}
                <div className="md:hidden space-y-2">
                  {filteredCylinders.map((cyl, idx) => {
                    const isSelected = selectedIds.has(cyl.id);
                    const capacityStr = getCapacityStr(cyl);
                    const valveCode = getValveCode(cyl);
                    const sizeLabel = cyl.size_info?.code || cyl.size_code || '101-F';
                    const isCopied = copiedSerialId === cyl.id;
                    const locationName = typeof cyl.current_location === 'object' 
                      ? (cyl.current_location?.location_name || 'Stor Farmasi') 
                      : (cyl.current_location || 'Stor Farmasi');

                    return (
                      <div
                        key={cyl.id}
                        onClick={() => toggleSelectCylinder(cyl.id)}
                        className={`p-2.5 rounded-xl border transition-[transform,opacity,box-shadow,border-color] cursor-pointer active:scale-[0.99] select-none ${
                          isSelected
                            ? 'bg-rose-500/10 border-rose-300 shadow-elevation-1'
                            : 'bg-surface border-border-default hover:border-border-default shadow-elevation-1'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Checkbox */}
                          <div className="pt-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectCylinder(cyl.id)}
                              className="w-4 h-4 rounded border-border-default text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </div>

                          {/* Cylinder Information */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-mono font-bold text-text-primary text-sm tracking-tight whitespace-nowrap">
                                  {cyl.serial_number}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopySerial(cyl.serial_number, cyl.id, e)}
                                  className="p-1 text-slate-400 hover:text-text-secondary rounded transition-colors"
                                  title={language === 'ms' ? 'Salin No. Siri' : 'Copy Serial Number'}
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                #{idx + 1}
                              </span>
                            </div>

                            {/* Tags / Metadata Row */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="px-1.5 py-0.5 bg-subtle border border-border-default rounded font-mono font-bold text-text-secondary text-[10px] whitespace-nowrap">
                                {sizeLabel} ({capacityStr})
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border whitespace-nowrap ${
                                valveCode === 'BN'
                                  ? 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                                  : 'bg-indigo-500/10 text-purple-700 border-indigo-500/20'
                              }`}>
                                {valveCode === 'BN' ? '🔵 Bullnose' : '🟣 Pin Index'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 whitespace-nowrap">
                                {language === 'ms' ? 'KOSONG' : 'EMPTY'}
                              </span>
                              <span className="text-[10px] text-text-muted truncate max-w-[130px]">
                                {locationName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. DESKTOP TABLE VIEW (hidden md:block) */}
                <div className="hidden md:block border border-border-default rounded-xl overflow-hidden shadow-elevation-1">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-subtle text-text-secondary font-bold border-b border-border-default text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-10 text-center sticky left-0 bg-subtle z-10">
                            <input
                              type="checkbox"
                              checked={isAllFilteredSelected}
                              onChange={toggleSelectAllFiltered}
                              className="rounded border-border-default text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </th>
                          <th className="py-2.5 px-2.5 w-10 text-text-secondary font-bold font-mono text-center">#</th>
                          <th className="py-2.5 px-3 font-extrabold text-text-primary whitespace-nowrap">
                            {language === 'ms' ? 'No. Siri Silinder' : 'Serial Number'}
                          </th>
                          <th className="py-2.5 px-3 whitespace-nowrap">{language === 'ms' ? 'Kod QR / Barcode' : 'QR / Tag'}</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">{language === 'ms' ? 'Saiz & Kapasiti' : 'Size / Capacity'}</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">{language === 'ms' ? 'Jenis Injap' : 'Valve Type'}</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">{language === 'ms' ? 'Lokasi Semasa' : 'Current Location'}</th>
                          <th className="py-2.5 px-3 text-center whitespace-nowrap">{language === 'ms' ? 'Status' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-default bg-surface">
                        {filteredCylinders.map((cyl, idx) => {
                          const isSelected = selectedIds.has(cyl.id);
                          const capacityStr = getCapacityStr(cyl);
                          const valveCode = getValveCode(cyl);
                          const sizeLabel = cyl.size_info?.code || cyl.size_code || '101-F';
                          const isCopied = copiedSerialId === cyl.id;
                          const locationName = typeof cyl.current_location === 'object' 
                            ? (cyl.current_location?.location_name || 'Stor Farmasi') 
                            : (cyl.current_location || 'Stor Farmasi');

                          return (
                            <tr
                              key={cyl.id}
                              onClick={() => toggleSelectCylinder(cyl.id)}
                              className={`hover:bg-subtle/50 cursor-pointer transition-colors ${
                                isSelected ? 'bg-rose-500/10 font-medium' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center sticky left-0 bg-surface group-hover:bg-subtle/50 z-10" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectCylinder(cyl.id)}
                                  className="rounded border-border-default text-rose-600 focus:ring-rose-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-2.5 text-center font-mono text-slate-400 text-[11px]">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-text-primary text-[13px] whitespace-nowrap">
                                    {cyl.serial_number}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopySerial(cyl.serial_number, cyl.id, e)}
                                    className="p-1 text-slate-400 hover:text-text-secondary rounded transition-colors"
                                    title="Salin No. Siri"
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-text-muted text-[11px] whitespace-nowrap">
                                {cyl.qr_code || cyl.serial_number}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 bg-subtle border border-border-default rounded font-mono font-bold text-text-secondary text-[11px]">
                                  {sizeLabel} ({capacityStr})
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                  valveCode === 'BN'
                                    ? 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                                    : 'bg-indigo-500/10 text-purple-700 border-indigo-500/20'
                                }`}>
                                  {valveCode === 'BN' ? '🔵 Bullnose (BN)' : '🟣 Pin Index (PI)'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-text-secondary text-[11px] whitespace-nowrap">
                                {locationName}
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                  {language === 'ms' ? 'KOSONG' : 'EMPTY'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sticky Footer Actions */}
          <div className="bg-subtle/50 border-t border-border-default px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-text-secondary w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-text-muted">{language === 'ms' ? 'Status Pemilihan:' : 'Selection Status:'}</span>
              <div className="flex items-center gap-1 font-bold text-text-primary bg-surface px-2 py-0.5 rounded-md border border-border-default">
                <span className="text-rose-600 font-mono">{selectedIds.size}</span>
                <span className="text-slate-400">/</span>
                <span className="font-mono">{cylinders.length}</span>
                <span className="text-[11px] font-normal text-text-muted ml-1">
                  {language === 'ms' ? 'silinder' : 'cylinders'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 border border-border-default hover:border-border-default rounded-xl text-xs font-bold text-text-secondary hover:bg-subtle transition-[transform,opacity,box-shadow,border-color] cursor-pointer active:scale-95"
              >
                {language === 'ms' ? 'Tutup' : 'Close'}
              </button>

              {onOpenReturnModal && (
                <button
                  type="button"
                  onClick={handleProceedToReturn}
                  disabled={selectedIds.size === 0}
                  className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm hover:shadow active:scale-95 transition-[transform,opacity,box-shadow,border-color] flex items-center justify-center gap-2 cursor-pointer ${
                    selectedIds.size === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span className="whitespace-nowrap">
                    {language === 'ms' 
                      ? `Cipta Dokumen Pulang (${selectedIds.size}) →` 
                      : `Create Return Document (${selectedIds.size}) →`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Printable Official Hospital Manifest Document (Rendered only on print) */}
      <div id="empty-cylinder-manifest-print" className="hidden">
        {/* Hospital Header */}
        <div style={{ borderBottom: '2px solid black', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
                KEMENTERIAN KESIHATAN MALAYSIA
              </h2>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0', color: '#333' }}>
                HOSPITAL LAWAS — UNIT FARMASI LOGISTIK
              </h3>
              <p style={{ fontSize: '11px', margin: 0, color: '#555' }}>
                Stor Farmasi Bekalan Gas Perubatan Oksigen
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {documentNumber}
              </div>
              <div style={{ fontSize: '11px', color: '#555' }}>
                Tarikh: {new Date().toLocaleDateString('ms-MY', { year: 'numeric', month: 'short', day: '2-digit' })}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <h1 style={{ fontSize: '15px', fontWeight: '800', margin: 0, textDecoration: 'underline' }}>
              MANIFEST SILINDER OKSIGEN KOSONG UNTUK PEMULANGAN PEMBEKAL
            </h1>
            <p style={{ fontSize: '10px', margin: '2px 0 0 0', color: '#444' }}>
              (OFFICIAL MEDICAL OXYGEN EMPTY CYLINDER RETURN DISPATCH MANIFEST)
            </p>
          </div>
        </div>

        {/* Summary Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '12px', background: '#f8f8f8', padding: '8px 12px', border: '1px solid #ddd' }}>
          <div><strong>Lokasi Stor:</strong> Stor Farmasi Hospital Lawas</div>
          <div><strong>Jumlah Silinder:</strong> {cylinders.filter(c => selectedIds.has(c.id)).length} unit</div>
          <div><strong>Bullnose (BN):</strong> {cylinders.filter(c => selectedIds.has(c.id) && getValveCode(c) === 'BN').length}</div>
          <div><strong>Pin Index (PI):</strong> {cylinders.filter(c => selectedIds.has(c.id) && getValveCode(c) === 'PI').length}</div>
        </div>

        {/* Manifest Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: '#eee', borderTop: '1px solid black', borderBottom: '1px solid black' }}>
              <th style={{ padding: '6px 8px', textAlign: 'center', width: '30px', border: '1px solid #999' }}>BIL</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #999' }}>NO. SIRI SILINDER</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #999' }}>KOD BARCODE / QR</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #999' }}>SAIZ & KAPASITI</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #999' }}>JENIS INJAP</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #999' }}>STATUS</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #999', width: '80px' }}>SEMAKAN (✓)</th>
            </tr>
          </thead>
          <tbody>
            {cylinders.filter(c => selectedIds.has(c.id)).map((cyl, i) => (
              <tr key={cyl.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #ccc' }}>{i + 1}</td>
                <td style={{ padding: '5px 8px', fontWeight: 'bold', fontFamily: 'monospace', border: '1px solid #ccc' }}>{cyl.serial_number}</td>
                <td style={{ padding: '5px 8px', fontFamily: 'monospace', border: '1px solid #ccc' }}>{cyl.qr_code || cyl.serial_number}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #ccc' }}>{cyl.size_info?.code || cyl.size_code || '101-F'} ({getCapacityStr(cyl)})</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #ccc' }}>{getValveCode(cyl) === 'BN' ? 'Bullnose (BN)' : 'Pin Index (PI)'}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #ccc' }}>KOSONG (EMPTY)</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #ccc' }}>[ &nbsp; &nbsp; ]</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 3-Part Hospital Verification Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '30px', fontSize: '10px' }}>
          {/* Signer 1 */}
          <div style={{ border: '1px solid #aaa', padding: '10px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <strong>Disediakan Oleh (Stor Farmasi):</strong>
              <div style={{ marginTop: '4px', color: '#555' }}>{user?.name || user?.email || 'Pegawai Stor'}</div>
            </div>
            <div>
              <div>Tandatangan: .......................................</div>
              <div style={{ marginTop: '2px' }}>Tarikh: ..................................................</div>
            </div>
          </div>

          {/* Signer 2 */}
          <div style={{ border: '1px solid #aaa', padding: '10px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <strong>Disahkan Oleh (Pegawai Farmasi):</strong>
              <div style={{ marginTop: '4px', color: '#555' }}>Ketua Seksyen Logistik</div>
            </div>
            <div>
              <div>Tandatangan: .......................................</div>
              <div style={{ marginTop: '2px' }}>Tarikh: ..................................................</div>
            </div>
          </div>

          {/* Signer 3 */}
          <div style={{ border: '1px solid #aaa', padding: '10px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <strong>Diterima Oleh (Pemandu Pembekal):</strong>
              <div style={{ marginTop: '4px', color: '#555' }}>Nama: ................................................</div>
            </div>
            <div>
              <div>No. Lori / IC: .....................................</div>
              <div style={{ marginTop: '2px' }}>Tandatangan: .......................................</div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
