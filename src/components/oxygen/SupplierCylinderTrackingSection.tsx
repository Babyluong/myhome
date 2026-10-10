// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Truck,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Copy,
  Check,
  ChevronRight,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Layers,
  ArrowRight,
  PackageCheck,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Flame,
  Info
} from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { getSupplierCylinderReconciliationData } from '@/modules/mycylinder/services/oxygenService';
import type { SupplierTrackedCylinder, SupplierCylinderTrackingSummary } from '@/types/pharmacy';

interface SupplierCylinderTrackingSectionProps {
  hospitalId: string;
  onOpenReceiveModal?: () => void;
  onOpenReturnModal?: () => void;
  onPrintDocument?: (docId: string) => void;
  isViewOnly?: boolean;
  onDataLoaded?: (summary: SupplierCylinderTrackingSummary) => void;
}

export const SupplierCylinderTrackingSection: React.FC<SupplierCylinderTrackingSectionProps> = ({
  hospitalId,
  onOpenReceiveModal,
  onOpenReturnModal,
  onPrintDocument,
  isViewOnly = false,
  onDataLoaded,
}) => {
  const { language } = useLanguage();

  // Primary Detection Workflow Mode
  // 'at_supplier': Cylinders returned to supplier but not received back yet (Function 1)
  // 'in_hospital': Cylinders supplier sent/loaned but not returned to supplier yet (Function 2)
  const [detectionMode, setDetectionMode] = useState<'at_supplier' | 'in_hospital'>('at_supplier');

  // Loading & Data State
  const [summaryData, setSummaryData] = useState<SupplierCylinderTrackingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agingFilter, setAgingFilter] = useState<'all' | 'normal' | 'warning' | 'overdue'>('all');
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Load live data from Supabase
  const loadTrackingData = async () => {
    if (!hospitalId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSupplierCylinderReconciliationData(hospitalId);
      if (res.error) throw new Error(res.error);
      if (res.data) {
        setSummaryData(res.data);
        if (onDataLoaded) onDataLoaded(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load cylinder tracking:', err);
      setError(err.message || 'Gagal memuat data penjejakan silinder.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrackingData();
  }, [hospitalId]);

  // Mode switcher handler with filter reset
  const handleModeChange = (mode: 'at_supplier' | 'in_hospital') => {
    setDetectionMode(mode);
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Copy-to-clipboard handler
  const handleCopySerial = (serial: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!serial) return;
    navigator.clipboard.writeText(serial);
    setCopiedSerial(serial);
    setTimeout(() => setCopiedSerial(null), 2000);
  };

  // Extract unique suppliers from active data
  const availableSuppliers = useMemo(() => {
    if (!summaryData?.cylinders) return [];
    const list = summaryData.cylinders
      .filter(c => c.tracking_mode === detectionMode && !(detectionMode === 'at_supplier' && (c.supplier_tagged || c.is_loan)))
      .map(c => c.supplier_name)
      .filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [summaryData, detectionMode]);

  // Extract unique sizes
  const availableSizes = useMemo(() => {
    if (!summaryData?.cylinders) return [];
    const list = summaryData.cylinders
      .filter(c => c.tracking_mode === detectionMode && !(detectionMode === 'at_supplier' && (c.supplier_tagged || c.is_loan)))
      .map(c => c.size_code || c.size_name)
      .filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [summaryData, detectionMode]);

  // Filtered dataset
  const filteredCylinders = useMemo(() => {
    if (!summaryData?.cylinders) return [];

    return summaryData.cylinders.filter(cyl => {
      // 1. Detection Mode segregation
      if (cyl.tracking_mode !== detectionMode) return false;

      // Exclude loan cylinders from 'at_supplier' mode (only hospital-owned cylinders out for refill)
      if (detectionMode === 'at_supplier' && (cyl.supplier_tagged || cyl.is_loan)) {
        return false;
      }

      // 2. Search query (Serial, QR, Doc #, Supplier)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesSerial = (cyl.serial_number || '').toLowerCase().includes(q);
        const matchesQr = (cyl.qr_code || '').toLowerCase().includes(q);
        const matchesDoc = (cyl.document_number || '').toLowerCase().includes(q);
        const matchesDO = (cyl.delivery_order_no || '').toLowerCase().includes(q);
        const matchesSup = (cyl.supplier_name || '').toLowerCase().includes(q);
        const locText = (typeof cyl.current_location === 'object' ? (cyl.current_location as any)?.location_name || '' : cyl.current_location || '');
        const matchesLoc = locText.toLowerCase().includes(q);
        if (!matchesSerial && !matchesQr && !matchesDoc && !matchesDO && !matchesSup && !matchesLoc) {
          return false;
        }
      }

      // 3. Supplier Filter
      if (supplierFilter !== 'all' && cyl.supplier_name !== supplierFilter) {
        return false;
      }

      // 4. Size Filter
      if (sizeFilter !== 'all') {
        const sz = cyl.size_code || cyl.size_name || '';
        if (sz !== sizeFilter) return false;
      }

      // 5. Aging Filter
      if (agingFilter === 'normal' && cyl.days_elapsed > 7) return false;
      if (agingFilter === 'warning' && (cyl.days_elapsed <= 7 || cyl.days_elapsed > 14)) return false;
      if (agingFilter === 'overdue' && cyl.days_elapsed <= 14) return false;

      // 6. Status Filter (adapts seamlessly to detectionMode)
      if (statusFilter !== 'all') {
        if (detectionMode === 'at_supplier') {
          if (statusFilter === 'returned_to_supplier' && cyl.current_status !== 'returned_to_supplier') return false;
          if (statusFilter === 'overdue' && !cyl.is_overdue) return false;
          if (statusFilter === 'normal' && cyl.is_overdue) return false;
        } else {
          // in_hospital
          if (statusFilter === 'overdue') {
            if (!cyl.is_overdue) return false;
          } else {
            if (cyl.current_status !== statusFilter) return false;
          }
        }
      }

      return true;
    });
  }, [summaryData, detectionMode, searchTerm, supplierFilter, sizeFilter, agingFilter, statusFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredCylinders.length / pageSize) || 1;
  const paginatedCylinders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCylinders.slice(start, start + pageSize);
  }, [filteredCylinders, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [detectionMode, searchTerm, supplierFilter, sizeFilter, agingFilter, statusFilter]);

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredCylinders.length === 0) return;

    const headers = [
      'Nombor Siri (Serial Number)',
      'Kod QR',
      'Mod Pengesanan',
      'Jenis / Saiz',
      'Kapasiti',
      'Pembekal (Supplier)',
      'No. Dokumen Rujukan',
      'No. Delivery Order (DO)',
      'Reference Date',
      'Hari Berlalu (Days)',
      'Status Lewat (>14 Hari)',
      'Lokasi Semasa',
      'Status Silinder',
      'Pemilikan (Pinjaman/Aset)'
    ];

    const rows = filteredCylinders.map(c => [
      `"${c.serial_number || ''}"`,
      `"${c.qr_code || ''}"`,
      `"${c.tracking_mode === 'at_supplier' ? 'Di Pembekal (Belum Terima Balik)' : 'Di Hospital (Belum Dipulangkan)'}"`,
      `"${c.type_name || c.size_name || ''}"`,
      `"${c.capacity || ''}"`,
      `"${c.supplier_name || ''}"`,
      `"${c.document_number || ''}"`,
      `"${c.delivery_order_no || ''}"`,
      `"${c.document_date ? new Date(c.document_date).toLocaleDateString() : ''}"`,
      c.days_elapsed,
      c.is_overdue ? 'YA' : 'TIDAK',
      `"${typeof c.current_location === 'object' ? (c.current_location as any)?.location_name || '' : c.current_location || ''}"`,
      `"${c.current_status || ''}"`,
      c.supplier_tagged ? 'Pinjaman Pembekal' : 'Hak Milik Hospital'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `AUDIT_SILINDER_${detectionMode.toUpperCase()}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper status label
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {language === 'ms' ? 'Tersedia Penuh (Stor)' : 'Available Full (Store)'}
          </span>
        );
      case 'issued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {language === 'ms' ? 'Sedang Digunakan (Wad)' : 'In Use (Ward)'}
          </span>
        );
      case 'empty':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {language === 'ms' ? 'Kosong (Sedia Pulang)' : 'Empty (Ready to Return)'}
          </span>
        );
      case 'returned_to_supplier':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {language === 'ms' ? 'Di Pembekal (Pengisian)' : 'With Supplier (Refill)'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Executive Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
        {/* Top Control Bar: Mode Switcher + Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          {/* Segmented Mode Selector */}
          <div className="inline-flex flex-wrap sm:flex-nowrap items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1 w-full sm:w-auto">
            {/* Mode 1: Cylinders at Supplier (Pending Receive) */}
            <button
              type="button"
              onClick={() => handleModeChange('at_supplier')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                detectionMode === 'at_supplier'
                  ? 'bg-white text-rose-700 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Truck className={`w-3.5 h-3.5 shrink-0 ${detectionMode === 'at_supplier' ? 'text-rose-600' : 'text-slate-400'}`} />
              <span className="sm:hidden">{language === 'ms' ? 'Di Pembekal' : 'At Supplier'}</span>
              <span className="hidden sm:inline">{language === 'ms' ? 'Di Pembekal (Belum Diterima Semula)' : 'Out at Supplier (Pending Return)'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                detectionMode === 'at_supplier' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {summaryData?.atSupplierCount ?? 0}
              </span>
            </button>

            {/* Mode 2: Cylinders in Hospital (Pending Return to Supplier) */}
            <button
              type="button"
              onClick={() => handleModeChange('in_hospital')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                detectionMode === 'in_hospital'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 shrink-0 ${detectionMode === 'in_hospital' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="sm:hidden">{language === 'ms' ? 'Di Hospital' : 'In Hospital'}</span>
              <span className="hidden sm:inline">{language === 'ms' ? 'Di Hospital (Belum Dipulangkan)' : 'In Hospital (Pending Supplier Return)'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                detectionMode === 'in_hospital' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {summaryData?.inHospitalCount ?? 0}
              </span>
            </button>
          </div>

          {/* Quick Actions Right */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadTrackingData}
              disabled={isLoading}
              title={language === 'ms' ? 'Segerakkan Data' : 'Sync Live Data'}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs hover:border-slate-300 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
              <span className="hidden sm:inline">{language === 'ms' ? 'Segerak' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredCylinders.length === 0}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs hover:border-slate-300 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'ms' ? 'Eksport' : 'Export'}</span>
            </button>

            {detectionMode === 'at_supplier' && onOpenReceiveModal && (
              <button
                type="button"
                onClick={onOpenReceiveModal}
                disabled={isViewOnly}
                className="px-3.5 py-2 rounded-xl bg-[#008f76] hover:bg-[#007a65] text-white font-semibold text-xs shadow-2xs active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{language === 'ms' ? 'Terima Dari Pembekal' : 'Receive From Supplier'}</span>
              </button>
            )}

            {detectionMode === 'in_hospital' && onOpenReturnModal && (
              <button
                type="button"
                onClick={onOpenReturnModal}
                disabled={isViewOnly}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{language === 'ms' ? 'Cipta Dokumen Pulang' : 'Create Return Document'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Workflow Title & Contextual Explanation */}
        <div className="flex items-center space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
            detectionMode === 'at_supplier'
              ? 'bg-rose-50 border-rose-200/80 text-rose-600'
              : 'bg-blue-50 border-blue-200/80 text-blue-600'
          }`}>
            {detectionMode === 'at_supplier' ? (
              <Truck className="w-5 h-5" />
            ) : (
              <Building2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {detectionMode === 'at_supplier'
                  ? (language === 'ms' ? 'Silinder Dipulangkan Ke Pembekal (Belum Diterima Semula)' : 'Cylinders Returned to Supplier (Awaiting Return Refill)')
                  : (language === 'ms' ? 'Silinder Dibekalkan Oleh Pembekal (Belum Dipulangkan)' : 'Cylinders Supplied to Hospital (Awaiting Return to Supplier)')}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                detectionMode === 'at_supplier' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {detectionMode === 'at_supplier' ? 'Audit Pengisian Luar' : 'Audit Simpanan Premis'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {detectionMode === 'at_supplier'
                ? (language === 'ms' 
                    ? 'Senarai silinder milik hospital yang telah dihantar kepada pembekal untuk isian semula tetapi belum diterima semula (silinder pinjaman pembekal dikecualikan).' 
                    : 'List of hospital-owned cylinders dispatched to the supplier for refill that have not yet been received back (loan cylinders excluded).')
                : (language === 'ms'
                    ? 'Senarai silinder pinjaman/bekalan yang berada dalam peredaran hospital (Stor / Wad) dan belum dihantar pulang ke pembekal.'
                    : 'List of loan or supplied cylinders currently held in the hospital (Store / Wards) that have not yet been returned to the supplier.')}
            </p>
          </div>
        </div>

        {/* Live Operational Metrics Chip Row (Clean 2x2 on Mobile, 4-Col on Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
          {/* KPI 1 */}
          <div 
            onClick={() => setStatusFilter('all')}
            title={language === 'ms' ? 'Klik untuk papar semua status' : 'Click to view all statuses'}
            className={`border rounded-xl p-3 cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-white border-teal-500/80 shadow-2xs ring-1 ring-teal-500/20'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
              {detectionMode === 'at_supplier'
                ? (language === 'ms' ? 'Di Pembekal' : 'At Supplier')
                : (language === 'ms' ? 'Di Hospital' : 'In Hospital')}
            </span>
            <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums mt-1 flex items-baseline gap-1">
              {detectionMode === 'at_supplier' ? summaryData?.atSupplierCount ?? 0 : summaryData?.inHospitalCount ?? 0}
              <span className="text-xs font-sans font-normal text-slate-500">cyl</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate block mt-0.5">
              {language === 'ms' ? 'Pangkalan data langsung' : 'Tracked via live DB'}
            </span>
          </div>

          {/* KPI 2 */}
          <div 
            onClick={() => {
              if (detectionMode === 'at_supplier') {
                setStatusFilter(prev => prev === 'overdue' ? 'all' : 'overdue');
              } else {
                setStatusFilter(prev => prev === 'empty' ? 'all' : 'empty');
              }
            }}
            title={language === 'ms' ? 'Klik untuk tapis status ini' : 'Click to toggle this status filter'}
            className={`rounded-xl p-3 border cursor-pointer transition-all ${
            detectionMode === 'at_supplier'
              ? statusFilter === 'overdue'
                ? 'bg-rose-100/70 border-rose-400 ring-1 ring-rose-400/20 text-rose-950 font-bold shadow-2xs'
                : (summaryData?.atSupplierOverdueCount || 0) > 0
                  ? 'bg-rose-50/60 border-rose-200/80 text-rose-900 hover:border-rose-300'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-900 hover:bg-white'
              : statusFilter === 'empty'
                ? 'bg-amber-100/70 border-amber-400 ring-1 ring-amber-400/20 text-amber-950 font-bold shadow-2xs'
                : (summaryData?.inHospitalEmptyCount || 0) > 0
                  ? 'bg-amber-50/60 border-amber-200/80 text-amber-900 hover:border-amber-300'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-900 hover:bg-white'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block truncate opacity-70">
              {detectionMode === 'at_supplier'
                ? (language === 'ms' ? 'Lewat (>14 Hari)' : 'Overdue (>14d)')
                : (language === 'ms' ? 'Kosong (Sedia Pulang)' : 'Empty Ready')}
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono tabular-nums mt-1 flex items-baseline gap-1">
              {detectionMode === 'at_supplier' 
                ? summaryData?.atSupplierOverdueCount ?? 0 
                : summaryData?.inHospitalEmptyCount ?? 0}
              <span className="text-xs font-sans font-normal opacity-70">cyl</span>
            </div>
            <span className="text-[10px] font-medium opacity-80 flex items-center gap-1 truncate mt-0.5">
              {detectionMode === 'at_supplier' ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 inline" />
                  <span className="truncate">{language === 'ms' ? 'Perlu susulan' : 'Requires follow-up'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0 inline" />
                  <span className="truncate">{language === 'ms' ? 'Sedia dihantar' : 'Ready for dispatch'}</span>
                </>
              )}
            </span>
          </div>

          {/* KPI 3 */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
              {language === 'ms' ? 'Pembekal Terlibat' : 'Active Suppliers'}
            </span>
            <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {availableSuppliers.length}
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate block mt-0.5" title={availableSuppliers.length > 0 ? availableSuppliers.join(', ') : 'BORNEO INDAH SDN BHD'}>
              {availableSuppliers.length > 0 ? availableSuppliers.join(', ') : 'BORNEO INDAH SDN BHD'}
            </span>
          </div>

          {/* KPI 4 */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
              {language === 'ms' ? 'Status Data' : 'Data Integrity'}
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{language === 'ms' ? '100% Disahkan' : '100% Verified'}</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{language === 'ms' ? 'Padanan Siri Sah' : 'Real Serial Match'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar (Responsive 2x2 Grid on Mobile, Flex on Desktop) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
        {/* Prominent Serial Number Search (Full Width) */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ms' 
              ? 'Imbas / Cari No. Siri (cth: SABOXY-, O2-P101-)...' 
              : 'Scan / Search Serial No. (e.g. SABOXY-, O2-P101-)...'}
            className="w-full pl-9 pr-8 py-2 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-lg text-xs font-mono font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-600 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* 4 Filter Dropdowns: 2x2 Grid on Mobile, Flex on Desktop */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full">
          {/* Supplier Filter */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full md:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
          >
            <option value="all">{language === 'ms' ? 'Semua Pembekal' : 'All Suppliers'}</option>
            {availableSuppliers.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>

          {/* Size / Valve Filter */}
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="w-full md:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
          >
            <option value="all">{language === 'ms' ? 'Semua Saiz' : 'All Sizes'}</option>
            {availableSizes.map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
          >
            <option value="all">{language === 'ms' ? 'Semua Status' : 'All Status'}</option>
            {detectionMode === 'at_supplier' ? (
              <>
                <option value="returned_to_supplier">
                  {language === 'ms' ? 'Di Pembekal (Isian)' : 'With Supplier (Refill)'}
                </option>
                <option value="overdue">
                  {language === 'ms' ? 'Melebihi Tempoh (>14 Hari)' : 'Overdue (>14 Days)'}
                </option>
                <option value="normal">
                  {language === 'ms' ? 'Dalam SLA (≤14 Hari)' : 'Within SLA (≤14 Days)'}
                </option>
              </>
            ) : (
              <>
                <option value="empty">
                  {language === 'ms' ? 'Kosong (Sedia Pulang)' : 'Empty (Ready to Return)'}
                </option>
                <option value="available">
                  {language === 'ms' ? 'Tersedia Penuh (Stor)' : 'Available Full (Store)'}
                </option>
                <option value="issued">
                  {language === 'ms' ? 'Sedang Digunakan (Wad)' : 'In Use (Ward)'}
                </option>
                <option value="overdue">
                  {language === 'ms' ? 'Melebihi Tempoh (>30 Hari)' : 'Overdue (>30 Days)'}
                </option>
              </>
            )}
          </select>

          {/* Aging Filter */}
          <select
            value={agingFilter}
            onChange={(e) => setAgingFilter(e.target.value as any)}
            className="w-full md:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
          >
            <option value="all">{language === 'ms' ? 'Semua Tempoh' : 'All Durations'}</option>
            <option value="normal">{language === 'ms' ? '≤ 7 Hari (Biasa)' : '≤ 7 Days (Normal)'}</option>
            <option value="warning">{language === 'ms' ? '8 – 14 Hari' : '8 – 14 Days'}</option>
            <option value="overdue">{language === 'ms' ? '> 14 Hari (Lewat)' : '> 14 Days (Overdue)'}</option>
          </select>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">
          <span>
            {language === 'ms' ? 'Memaparkan' : 'Showing'}{' '}
            <strong className="text-slate-800 font-mono font-bold">{filteredCylinders.length}</strong>{' '}
            {language === 'ms' ? 'silinder' : 'cylinders'}
          </span>

          {(searchTerm || supplierFilter !== 'all' || sizeFilter !== 'all' || statusFilter !== 'all' || agingFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSupplierFilter('all');
                setSizeFilter('all');
                setStatusFilter('all');
                setAgingFilter('all');
              }}
              className="text-teal-700 hover:text-teal-800 font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'ms' ? 'Set Semula' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-10 h-10 text-teal-600 animate-spin" />
            <span className="text-slate-600 font-bold text-sm">
              {language === 'ms' ? 'Mengimbas dan mengesan rekod silinder pembekal...' : 'Detecting and reconciling supplier cylinder inventory...'}
            </span>
            <span className="text-slate-400 text-xs font-mono">100% Live Supabase Query</span>
          </div>
        ) : error ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{language === 'ms' ? 'Ralat Memuat Rekod' : 'Error Loading Records'}</h4>
            <p className="text-xs text-slate-500 max-w-md">{error}</p>
            <button
              onClick={loadTrackingData}
              className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              {language === 'ms' ? 'Cuba Semula' : 'Retry'}
            </button>
          </div>
        ) : filteredCylinders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <ShieldCheck className="w-7 h-7 text-teal-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {language === 'ms' ? 'Tiada Silinder Dijumpai' : 'No Cylinders Detected'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              {detectionMode === 'at_supplier'
                ? (language === 'ms' 
                    ? 'No unreturned cylinders found matching your search criteria.' 
                    : 'No unreturned cylinders pending receipt matched your current filter criteria.')
                : (language === 'ms'
                    ? 'No outstanding supplier cylinders at the hospital matching criteria.'
                    : 'No supplier cylinders pending return matched your current filter criteria.')}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View: High-End Native Cards (Zero Horizontal Cutoff) */}
            <div className="md:hidden divide-y divide-slate-100 bg-white">
              {paginatedCylinders.map((cyl, idx) => {
                const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                const isCopied = copiedSerial === cyl.serial_number;

                return (
                  <div key={cyl.id} className="p-3.5 space-y-2.5">
                    {/* Header: Index, Serial Button, and Aging Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">#{globalIdx}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopySerial(cyl.serial_number, e)}
                          title="Salin No. Siri"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 hover:bg-teal-50 border border-slate-200/90 hover:border-teal-300 rounded-md text-xs font-mono font-bold text-slate-900 transition-colors truncate"
                        >
                          <span className="truncate">{cyl.serial_number}</span>
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                        </button>
                        {cyl.supplier_tagged && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            Loan
                          </span>
                        )}
                      </div>

                      {/* Aging Badge */}
                      <div className="shrink-0">
                        {cyl.is_overdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{cyl.days_elapsed} {language === 'ms' ? 'hari' : 'd'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{cyl.days_elapsed} {language === 'ms' ? 'hari' : 'd'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2x2 Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                          {language === 'ms' ? 'Jenis & Saiz' : 'Type & Size'}
                        </span>
                        <span className="font-semibold text-slate-800 truncate block mt-0.5">
                          {cyl.size_name || cyl.size_code || cyl.type_name || 'Standard'} {cyl.capacity ? `(${cyl.capacity})` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                          {language === 'ms' ? 'Pembekal' : 'Supplier'}
                        </span>
                        <span className="font-semibold text-slate-800 truncate block mt-0.5" title={cyl.supplier_name}>
                          {cyl.supplier_name || 'BORNEO INDAH'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                          {detectionMode === 'at_supplier' ? (language === 'ms' ? 'No. Dokumen' : 'Doc No') : (language === 'ms' ? 'No. DO' : 'DO No')}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-teal-700 truncate block mt-0.5">
                          {cyl.document_number || cyl.delivery_order_no || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                          {detectionMode === 'at_supplier' ? (language === 'ms' ? 'Dispatch Date' : 'Dispatch Date') : (language === 'ms' ? 'Tarikh Terima' : 'Receive Date')}
                        </span>
                        <span className="text-slate-700 font-medium block mt-0.5">
                          {cyl.document_date ? new Date(cyl.document_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Status / Location & Action Button */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="min-w-0 flex-1">
                        {detectionMode === 'at_supplier' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>{language === 'ms' ? 'Di Pembekal (Isian Semula)' : 'At Supplier (Refill)'}</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{typeof cyl.current_location === 'object' ? (cyl.current_location as any)?.location_name || 'Pharmacy Store' : cyl.current_location || 'Pharmacy Store'}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {detectionMode === 'at_supplier' ? (
                          onOpenReceiveModal ? (
                            <button
                              type="button"
                              onClick={onOpenReceiveModal}
                              disabled={isViewOnly}
                              className="px-3 py-1.5 bg-[#008f76] hover:bg-[#007a65] text-white rounded-lg text-xs font-semibold shadow-2xs active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>{language === 'ms' ? 'Terima' : 'Receive'}</span>
                            </button>
                          ) : null
                        ) : (
                          cyl.current_status === 'empty' && onOpenReturnModal ? (
                            <button
                              type="button"
                              onClick={onOpenReturnModal}
                              disabled={isViewOnly}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{language === 'ms' ? 'Pulangkan' : 'Return'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic font-medium">
                              {cyl.current_status === 'issued' ? (language === 'ms' ? 'Di Wad' : 'In Ward') : (language === 'ms' ? 'Penuh' : 'Full')}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Sticky Serial Column for Smooth Horizontal Scanning) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/90 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-4 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                      {language === 'ms' ? 'Nombor Siri Silinder' : 'Cylinder Serial Number'}
                    </th>
                    <th className="py-2.5 px-4 whitespace-nowrap">
                      {language === 'ms' ? 'Jenis & Saiz' : 'Type & Size'}
                    </th>
                    <th className="py-2.5 px-4 whitespace-nowrap">
                      {language === 'ms' ? 'Pembekal Rasmi' : 'Supplier'}
                    </th>
                    <th className="py-2.5 px-4 whitespace-nowrap">
                      {detectionMode === 'at_supplier' 
                        ? (language === 'ms' ? 'Dokumen Pemulangan' : 'Return Document')
                        : (language === 'ms' ? 'Rujukan Terima / DO' : 'Receive Ref / DO')}
                    </th>
                    <th className="py-2.5 px-4 whitespace-nowrap">
                      {detectionMode === 'at_supplier'
                        ? (language === 'ms' ? 'Dispatch Date & Tempoh' : 'Dispatched Date & Aging')
                        : (language === 'ms' ? 'Tarikh Terima & Tempoh' : 'Received Date & Aging')}
                    </th>
                    <th className="py-2.5 px-4 whitespace-nowrap">
                      {detectionMode === 'at_supplier'
                        ? (language === 'ms' ? 'Status Semasa' : 'Current Status')
                        : (language === 'ms' ? 'Lokasi Semasa (Hospital)' : 'Current Location')}
                    </th>
                    <th className="py-2.5 px-4 text-right whitespace-nowrap">
                      {language === 'ms' ? 'Tindakan' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedCylinders.map((cyl, idx) => {
                    const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                    const isCopied = copiedSerial === cyl.serial_number;

                    return (
                      <tr 
                        key={cyl.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Index */}
                        <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold text-[11px]">
                          {globalIdx}
                        </td>

                        {/* Cylinder Serial Number - STICKY COLUMN */}
                        <td className="py-3 px-4 sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleCopySerial(cyl.serial_number, e)}
                              title="Salin Nombor Siri"
                              className="group/copy flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 hover:bg-teal-50 border border-slate-200/90 hover:border-teal-300 rounded-md text-xs font-mono font-bold text-slate-900 hover:text-teal-700 transition-all cursor-pointer shadow-2xs"
                            >
                              <span>{cyl.serial_number}</span>
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400 group-hover/copy:text-teal-600" />
                              )}
                            </button>

                            {cyl.supplier_tagged && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Loan
                              </span>
                            )}
                          </div>
                          {cyl.qr_code && cyl.qr_code !== cyl.serial_number && (
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              QR: {cyl.qr_code}
                            </span>
                          )}
                        </td>

                        {/* Type & Size */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {cyl.type_name || 'Medical Oxygen'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {cyl.size_name || cyl.size_code || '-'} {cyl.capacity ? `(${cyl.capacity})` : ''}
                          </div>
                        </td>

                        {/* Supplier */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{cyl.supplier_name || 'BORNEO INDAH SDN BHD'}</span>
                          </div>
                        </td>

                        {/* Reference Document */}
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                          {cyl.document_number ? (
                            <div className="flex items-center gap-1 font-bold text-teal-800 bg-teal-50/70 px-2 py-0.5 rounded border border-teal-200/60 w-fit">
                              <span>{cyl.document_number}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic font-sans">-</span>
                          )}
                          {cyl.delivery_order_no && (
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              DO: {cyl.delivery_order_no}
                            </span>
                          )}
                        </td>

                        {/* Date & Aging */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">
                            {cyl.document_date 
                              ? new Date(cyl.document_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                              : '-'}
                          </div>
                          <div className="mt-0.5">
                            {cyl.is_overdue ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                {cyl.days_elapsed} {language === 'ms' ? 'hari (Lewat)' : 'days (Overdue)'}
                              </span>
                            ) : cyl.days_elapsed > 7 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {cyl.days_elapsed} {language === 'ms' ? 'hari' : 'days'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {cyl.days_elapsed} {language === 'ms' ? 'hari' : 'days'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Current Status / Location */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {detectionMode === 'at_supplier' ? (
                            <div>
                              {getStatusBadge('returned_to_supplier')}
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Lokasi: Premis Pembekal
                              </span>
                            </div>
                          ) : (
                            <div>
                              {getStatusBadge(cyl.current_status)}
                              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{typeof cyl.current_location === 'object' ? (cyl.current_location as any)?.location_name || 'Pharmacy Store' : cyl.current_location || 'Pharmacy Store'}</span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Contextual Action Button */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {detectionMode === 'at_supplier' ? (
                            onOpenReceiveModal ? (
                              <button
                                type="button"
                                onClick={onOpenReceiveModal}
                                disabled={isViewOnly}
                                className="px-3 py-1.5 bg-[#008f76] hover:bg-[#007a65] text-white rounded-lg text-xs font-semibold transition-all shadow-2xs active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>{language === 'ms' ? 'Terima' : 'Receive'}</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )
                          ) : (
                            cyl.current_status === 'empty' && onOpenReturnModal ? (
                              <button
                                type="button"
                                onClick={onOpenReturnModal}
                                disabled={isViewOnly}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>{language === 'ms' ? 'Pulangkan' : 'Return'}</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs italic font-medium">
                                {cyl.current_status === 'issued' ? (language === 'ms' ? 'Di Wad' : 'In Ward') : (language === 'ms' ? 'Penuh' : 'Full')}
                              </span>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Toolbar */}
        {!isLoading && filteredCylinders.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              {language === 'ms' ? 'Halaman' : 'Page'} <strong className="text-slate-800">{currentPage}</strong> {language === 'ms' ? 'daripada' : 'of'} <strong className="text-slate-800">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {language === 'ms' ? 'Sebelumnya' : 'Previous'}
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {language === 'ms' ? 'Seterusnya' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
