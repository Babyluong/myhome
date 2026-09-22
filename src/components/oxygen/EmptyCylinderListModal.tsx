// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Printer, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Layers, 
  FileText, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Database, 
  Truck, 
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Download,
  Share2
} from 'lucide-react';
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
  const printRef = useRef<HTMLDivElement>(null);

  const [cylinders, setCylinders] = useState<OxygenCylinderWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [valveFilter, setValveFilter] = useState<'all' | 'BN' | 'PI'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    }
  }, [isOpen, hospitalId, initialCylinders]);

  // Active non-deactivated cylinders memo
  const activeCylinders = useMemo(() => {
    return cylinders.filter(c => c.status !== 'deactivated' && c.is_active !== false);
  }, [cylinders]);

  // Unique sizes for filter
  const uniqueSizes = useMemo(() => {
    const set = new Set<string>();
    activeCylinders.forEach(c => {
      const s = c.size_info?.code || c.size_code || c.type_info?.type_name;
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [activeCylinders]);

  // Bullnose vs Pin Index metrics
  const valveCounts = useMemo(() => {
    let bn = 0;
    let pi = 0;
    activeCylinders.forEach(c => {
      const code = c.type_info?.code || (c.type_info?.name?.toLowerCase().includes('bullnose') ? 'BN' : 'PI');
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
        const q = searchTerm.toLowerCase();
        const sn = (c.serial_number || '').toLowerCase();
        const qr = (c.qr_code || '').toLowerCase();
        if (!sn.includes(q) && !qr.includes(q)) return false;
      }
      if (sizeFilter) {
        const s = c.size_info?.code || c.size_code || c.type_info?.type_name;
        if (s !== sizeFilter) return false;
      }
      if (valveFilter !== 'all') {
        const code = c.type_info?.code || (c.type_info?.name?.toLowerCase().includes('bullnose') ? 'BN' : 'PI');
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

  const handleProceedToReturn = () => {
    const selectedList = cylinders.filter(c => selectedIds.has(c.id));
    if (selectedList.length === 0) {
      alert(language === 'ms' ? 'Sila pilih sekurang-kurangnya 1 silinder untuk dipulangkan.' : 'Please select at least 1 cylinder to return.');
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Document Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-white">
                  {language === 'ms' ? 'Senarai Silinder Kosong' : 'Empty Cylinder List Document'}
                </h3>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {documentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ms' 
                  ? 'Dokumen rasmi semakan & inventori silinder kosong sedia untuk pemulangan pembekal' 
                  : 'Official empty cylinder verification & inventory manifest ready for return dispatch'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'ms' ? 'Cetak Senarai' : 'Print Manifest'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Metadata Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{language === 'ms' ? 'Lokasi Stor:' : 'Store Location:'}</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                Pharmacy Store / Stor Farmasi
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{language === 'ms' ? 'Tarikh Dokumen:' : 'Document Date:'}</span>
              <span className="font-mono font-bold text-slate-800">
                {new Date().toLocaleDateString('ms-MY', { year: 'numeric', month: 'short', day: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{language === 'ms' ? 'Disediakan Oleh:' : 'Prepared By:'}</span>
              <span className="font-bold text-slate-800">
                {user?.name || user?.email || 'Pegawai Stor Farmasi'}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {language === 'ms' ? 'Disahkan di Stor' : 'Verified in Store'}
          </span>
        </div>

        {/* Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3.5 bg-white border-b border-slate-100 shrink-0">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {language === 'ms' ? 'Jumlah Silinder Kosong' : 'Total Empty Cylinders'}
            </span>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
              {cylinders.length}
              <span className="text-xs font-sans font-normal text-slate-500 ml-1">cyl</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {language === 'ms' ? 'Rekod sebenar stor' : 'Live store inventory'}
            </span>
          </div>

          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
              {language === 'ms' ? 'Dipilih Untuk Pulang' : 'Selected for Return'}
            </span>
            <div className="text-xl font-extrabold text-rose-900 font-mono mt-0.5">
              {selectedIds.size}
              <span className="text-xs font-sans font-normal text-rose-700 ml-1">/ {cylinders.length}</span>
            </div>
            <span className="text-[10px] text-rose-600 font-medium">
              {language === 'ms' ? 'Sedia untuk pemulangan' : 'Ready to create return doc'}
            </span>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              🔵 Bullnose (BN)
            </span>
            <div className="text-xl font-extrabold text-blue-900 font-mono mt-0.5">
              {valveCounts.bn}
              <span className="text-xs font-sans font-normal text-blue-700 ml-1">cyl</span>
            </div>
            <span className="text-[10px] text-blue-600 font-medium">
              {language === 'ms' ? 'Injap Bullnose' : 'Bullnose Valve Type'}
            </span>
          </div>

          <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
              🟣 Pin Index (PI)
            </span>
            <div className="text-xl font-extrabold text-purple-900 font-mono mt-0.5">
              {valveCounts.pi}
              <span className="text-xs font-sans font-normal text-purple-700 ml-1">cyl</span>
            </div>
            <span className="text-[10px] text-purple-600 font-medium">
              {language === 'ms' ? 'Injap Pin Index' : 'Pin Index Valve Type'}
            </span>
          </div>
        </div>

        {/* Filter and Search Controls Toolbar */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={language === 'ms' ? 'Cari no siri atau kod QR...' : 'Search serial # or QR code...'}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Size Filters */}
            {uniqueSizes.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                <button
                  type="button"
                  onClick={() => setSizeFilter('')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border cursor-pointer ${
                    sizeFilter === ''
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All ({cylinders.length})
                </button>
                {uniqueSizes.map(size => {
                  const cnt = cylinders.filter(c => (c.size_info?.code || c.size_code || c.type_info?.type_name) === size).length;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSizeFilter(size)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border cursor-pointer ${
                        sizeFilter === size
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {size} ({cnt})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Valve Filter Switcher */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setValveFilter('all')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  valveFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Valves
              </button>
              <button
                type="button"
                onClick={() => setValveFilter('BN')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  valveFilter === 'BN' ? 'bg-blue-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BN
              </button>
              <button
                type="button"
                onClick={() => setValveFilter('PI')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  valveFilter === 'PI' ? 'bg-purple-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PI
              </button>
            </div>

            {/* Select All Toggle */}
            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              {isAllFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
                  <span>{language === 'ms' ? 'Batal Semua' : 'Deselect All'}</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'ms' ? 'Pilih Semua' : 'Select All'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Table of Cylinders */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[280px]">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RotateCcw className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold">
                {language === 'ms' ? 'Memuatkan senarai silinder kosong...' : 'Loading empty cylinder manifest...'}
              </span>
            </div>
          ) : filteredCylinders.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
              <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h5 className="text-sm font-bold text-slate-700">
                {language === 'ms' ? 'Tiada silinder dijumpai' : 'No empty cylinders found'}
              </h5>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchTerm || sizeFilter || valveFilter !== 'all'
                  ? 'Try adjusting your search or filter options.'
                  : 'All cylinders in store are currently allocated or returned.'}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3 w-12 text-slate-400 font-mono text-center">#</th>
                    <th className="py-2.5 px-3 font-extrabold text-slate-800">
                      {language === 'ms' ? 'No. Siri Silinder' : 'Serial Number'}
                    </th>
                    <th className="py-2.5 px-3">{language === 'ms' ? 'Kod QR / Barcode' : 'QR / Tag'}</th>
                    <th className="py-2.5 px-3">{language === 'ms' ? 'Saiz & Kapasiti' : 'Size / Capacity'}</th>
                    <th className="py-2.5 px-3">{language === 'ms' ? 'Jenis Injap' : 'Valve Type'}</th>
                    <th className="py-2.5 px-3">{language === 'ms' ? 'Lokasi' : 'Location'}</th>
                    <th className="py-2.5 px-3 text-center">{language === 'ms' ? 'Status' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 bg-white">
                  {filteredCylinders.map((cyl, idx) => {
                    const isSelected = selectedIds.has(cyl.id);
                    const capacityStr = cyl.size_info?.capacity ? `${Number(cyl.size_info.capacity)}M³` : (cyl.capacity ? `${cyl.capacity}M³` : '1.4M³');
                    const valveCode = cyl.type_info?.code || (cyl.type_info?.name?.toLowerCase().includes('bullnose') ? 'BN' : 'PI');
                    const sizeLabel = cyl.size_info?.code || cyl.size_code || '101-F';

                    return (
                      <tr
                        key={cyl.id}
                        onClick={() => toggleSelectCylinder(cyl.id)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-rose-50/30 font-medium' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCylinder(cyl.id)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {cyl.serial_number}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {cyl.qr_code || cyl.serial_number}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-700 text-[11px]">
                            {sizeLabel} ({capacityStr})
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                            valveCode === 'BN'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {valveCode === 'BN' ? '🔵 Bullnose (BN)' : '🟣 Pin Index (PI)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {cyl.current_location?.location_name || cyl.current_location || 'Pharmacy Store'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                            {language === 'ms' ? 'KOSONG' : 'EMPTY'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">{selectedIds.size}</span> of{' '}
            <span className="font-bold text-slate-900">{cylinders.length}</span>{' '}
            {language === 'ms' ? 'silinder dipilih' : 'cylinders selected'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {language === 'ms' ? 'Tutup' : 'Close'}
            </button>

            {onOpenReturnModal && (
              <button
                type="button"
                onClick={handleProceedToReturn}
                disabled={selectedIds.size === 0}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedIds.size === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>
                  {language === 'ms' 
                    ? `Cipta Dokumen Pulang (${selectedIds.size} cyl) →` 
                    : `Create Return Document (${selectedIds.size} cyl) →`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
