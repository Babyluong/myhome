// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit3, CheckSquare, Square, ChevronRight, AlertCircle, RefreshCw, QrCode, ChevronLeft, Search, WifiOff } from 'lucide-react'
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import '@/services/pharmacy/oxygenService'
import {
  offlineAwareGetSuppliers,
  offlineAwareGetEmptyCylindersInStore,
  offlineAwareReturnDocument,
  isNetworkAvailable,
  withTimeout,
} from '@/modules/mycylinder/services/cylinderOfflineService';
import type { OxygenCylinderWithRelations } from '@/types/pharmacy';

const parseTypeAndSize = (typeName: string) => {
  const regex = /\(([^)]+)\)/;
  const match = typeName.match(regex);
  if (match) {
    const size = match[1];
    const type = typeName.replace(regex, '').replace(/\s+/g, ' ').trim();
    return { type, size };
  }
  return { type: typeName, size: '-' };
};

interface CreateReturnDocumentModalProps {
  hospitalId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenScanner?: () => void;
  sessionScannedCylinders: OxygenCylinderWithRelations[];
  setSessionScannedCylinders: React.Dispatch<React.SetStateAction<OxygenCylinderWithRelations[]>>;
}

export const CreateReturnDocumentModal: React.FC<CreateReturnDocumentModalProps> = ({
  hospitalId,
  isOpen,
  onClose,
  onSuccess,
  onOpenScanner,
  sessionScannedCylinders,
  setSessionScannedCylinders,
}) => {
  const { user } = useAuthStore();
  const [suppliers, setSuppliers] = useState<{ id: string; company_name: string }[]>([]);
  const [emptyCylinders, setEmptyCylinders] = useState<OxygenCylinderWithRelations[]>([]);
  
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [, setSelectedCylinders] = useState<string[]>([]);
  useState<{ [key: string]: boolean }>({});
  
  const [supplierCylinders, setSupplierCylinders] = useState<OxygenCylinderWithRelations[]>([]);
  const [supplierSizeFilter, setSupplierSizeFilter] = useState<'all' | '101-N' | '101-F'>('all');
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard states
  const [step, setStep] = useState<'scan' | 'details'>('scan');
  const [scannedCylinders, setScannedCylinders] = useState<OxygenCylinderWithRelations[]>([]);

  // Tab state for separating loan vs standard empty cylinders (Standardized to standard, loan items added via bulk manual input)
  const [cylinderTab, ] = useState<'loan' | 'standard'>('standard');
  const [currentPage, setCurrentPage] = useState(1);
  const [innerSearchTerm, setInnerSearchTerm] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const pageSize = 8;

  const handleScanInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = innerSearchTerm.trim().toUpperCase();
      if (!code) return;

      // Extract valve hint if present (e.g. "P101-E-0011 pi", "P101-F-0178 BN")
      let baseCode = code;
      let preferredValve: string | undefined = undefined;
      const vMatch = code.match(/^(.*?)(?:[\s_/(]+|-)(PI|PIN\s*INDEX|PIN|BN|BULLNOSE|BULL)[\s_/)]*$/i);
      if (vMatch && vMatch[1].trim().length >= 3) {
        baseCode = vMatch[1].trim();
        const vRaw = vMatch[2].toUpperCase().trim();
        preferredValve = (vRaw.startsWith('PI') || vRaw.startsWith('PIN')) ? 'PI' : 'BN';
      }

      const strippedCode = code.replace(/^(?:O2-|02-)/i, '');
      const strippedBase = baseCode.replace(/^(?:O2-|02-)/i, '');

      // Find all matching candidates in empty inventory
      const matches = emptyCylinders.filter(c => {
        const sn = (c.serial_number || '').toUpperCase();
        const qr = (c.qr_code || '').toUpperCase();
        const strippedSn = sn.replace(/^(?:O2-|02-)/i, '');
        const strippedQr = qr.replace(/^(?:O2-|02-)/i, '');

        if (sn === code || qr === code || sn === baseCode || qr === baseCode) return true;
        if (strippedSn === strippedCode || strippedQr === strippedCode || strippedSn === strippedBase || strippedQr === strippedBase) return true;
        if (sn.startsWith(`${code}-`) || qr.startsWith(`${code}-`) || sn.startsWith(`${baseCode}-`) || qr.startsWith(`${baseCode}-`)) return true;
        if (strippedBase.startsWith('101-') && (strippedSn === `P${strippedBase}` || strippedSn.startsWith(`P${strippedBase}-`))) return true;
        return false;
      });

      // Prefer candidate not yet scanned
      const unscannedMatches = matches.filter(c => !scannedCylinders.some(sc => sc.id === c.id));
      const candidates = unscannedMatches.length > 0 ? unscannedMatches : matches;

      // Sort by preferred valve
      if (preferredValve && candidates.length > 1) {
        candidates.sort((a, b) => {
          const aValve = (a.type_info?.code || '').toUpperCase();
          const bValve = (b.type_info?.code || '').toUpperCase();
          const aIsPref = aValve === preferredValve || (a.serial_number && a.serial_number.toUpperCase().includes(`-${preferredValve}`)) ? 1 : 0;
          const bIsPref = bValve === preferredValve || (b.serial_number && b.serial_number.toUpperCase().includes(`-${preferredValve}`)) ? 1 : 0;
          return bIsPref - aIsPref;
        });
      }

      const found = candidates[0];

      if (found) {
        if (!scannedCylinders.some(c => c.id === found.id)) {
          setScannedCylinders(prev => [...prev, found]);
          setScanFeedback({
            type: 'success',
            text: `✓ Silinder ${found.serial_number || found.qr_code} berjaya dipilih.`
          });
        } else {
          setScanFeedback({
            type: 'info',
            text: `Silinder ${found.serial_number || found.qr_code} sudah berada dalam senarai pilihan.`
          });
        }
        setInnerSearchTerm('');
        setTimeout(() => setScanFeedback(null), 3000);
      } else {
        setScanFeedback({
          type: 'error',
          text: `Silinder "${code}" tidak dijumpai dalam inventori kosong sedia ada.`
        });
        setTimeout(() => setScanFeedback(null), 4000);
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [cylinderTab, innerSearchTerm, selectedSizeFilter]);

  useEffect(() => {
    setSelectedSizeFilter('');
  }, [cylinderTab]);

  // Load suppliers and empty cylinders
  useEffect(() => {
    if (isOpen && hospitalId) {
      loadData();
    }
  }, [isOpen, hospitalId]);

  const handleClose = () => {
    onClose();
  };

  // Sync scannedCylinders back to sessionScannedCylinders
  useEffect(() => {
    if (isOpen) {
      setSessionScannedCylinders(scannedCylinders);
    }
  }, [scannedCylinders, isOpen, setSessionScannedCylinders]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setSupplierSearchTerm('');
    setStep('scan');
    setScannedCylinders(sessionScannedCylinders);
    try {
      // 1. Fetch active suppliers (offline-aware)
      const sups = await offlineAwareGetSuppliers();
      const filteredSuppliers = (sups || []).filter(s => {
        const name = (s.company_name || '').toLowerCase();
        return name.includes('linde') || name.includes('borneo indah');
      });

      setSuppliers(filteredSuppliers.length > 0 ? filteredSuppliers : sups || []);
      
      const linde = (filteredSuppliers || []).find(s => s.company_name.toLowerCase().includes('linde'));
      const borneo = (filteredSuppliers || []).find(s => s.company_name.toLowerCase().includes('borneo indah'));
      if (linde) {
        setSelectedSupplier(linde.id);
      } else if (borneo) {
        setSelectedSupplier(borneo.id);
      } else if (filteredSuppliers.length > 0) {
        setSelectedSupplier(filteredSuppliers[0].id);
      }

      // 2. Fetch empty cylinders in store (offline-aware)
      const res = await offlineAwareGetEmptyCylindersInStore(hospitalId);
      setEmptyCylinders(res.data || []);
      
      // Reset selections
      setSelectedCylinders([]);
      setRemarks('');
      setReturnDate(new Date().toISOString().split('T')[0]);

      // 3. Fetch supplier-tagged / Saboxy cylinders (offline-aware)
      if (isNetworkAvailable()) {
        try {
          const { data: supCyls, error: supCylsErr } = await withTimeout(
            Promise.resolve(
              supabase
                .from('pharmacy_oxygen_cylinder_inventory')
                .select(`
                  *,
                  size_info:pharmacy_oxygen_cylinder_sizes(*),
                  type_info:pharmacy_oxygen_cylinder_types(*)
                `)
                .eq('hospital_id', hospitalId)
                .neq('status', 'deactivated')
                .eq('is_active', true)
                .or('supplier_tagged.eq.true,serial_number.ilike.%saboxy%,qr_code.ilike.%saboxy%')
                .order('serial_number', { ascending: true })
            ),
            1500,
            'Supplier cylinders fetch timed out'
          );

          if (!supCylsErr && Array.isArray(supCyls)) {
            const saboxyOnly = supCyls.filter((c: any) => {
              if (c?.status === 'deactivated' || c?.is_active === false) return false;
              const serial = String(c?.serial_number || '').toLowerCase();
              const qr = String(c?.qr_code || '').toLowerCase();
              return c?.supplier_tagged === true || serial.includes('saboxy') || qr.includes('saboxy');
            });
            setSupplierCylinders(saboxyOnly);
          }
        } catch (supErr) {
          const cachedSaboxy = (res.data || []).filter((c: any) => {
            const serial = String(c?.serial_number || '').toLowerCase();
            const qr = String(c?.qr_code || '').toLowerCase();
            return c?.supplier_tagged === true || serial.includes('saboxy') || qr.includes('saboxy');
          });
          setSupplierCylinders(cachedSaboxy);
        }
      } else {
        const cachedSaboxy = (res.data || []).filter((c: any) => {
          const serial = String(c?.serial_number || '').toLowerCase();
          const qr = String(c?.qr_code || '').toLowerCase();
          return c?.supplier_tagged === true || serial.includes('saboxy') || qr.includes('saboxy');
        });
        setSupplierCylinders(cachedSaboxy);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load return document details.');
    } finally {
      setIsLoading(false);
    }
  };



  // Get unique cylinder sizes/types in active tab for secondary filter pills
  const availableSizes = Array.from(new Set(
    emptyCylinders
      .filter(c => {
        if (c.status === 'deactivated' || c.is_active === false) return false;
        const isLoan = !c.supplier_tagged && (c.is_loan || c.type_info?.type_name?.toLowerCase().includes('loan'));
        return (cylinderTab === 'loan' ? isLoan : !isLoan);
      })
      .map(c => c.type_info?.type_name)
      .filter(Boolean)
  )) as string[];

  // Filter empty cylinders by active tab, search query, and size filter
  const filteredCylinders = emptyCylinders.filter(c => {
    if (c.status === 'deactivated' || c.is_active === false) return false;
    const isLoan = !c.supplier_tagged && (c.is_loan || c.type_info?.type_name?.toLowerCase().includes('loan'));
    const matchesTab = cylinderTab === 'loan' ? isLoan : !isLoan;
    
    if (!matchesTab) return false;
    
    if (selectedSizeFilter && c.type_info?.type_name !== selectedSizeFilter) {
      return false;
    }
    
    if (innerSearchTerm.trim()) {
      const query = innerSearchTerm.toLowerCase();
      const serial = (c.serial_number || '').toLowerCase();
      const qr = (c.qr_code || '').toLowerCase();
      const type = (c.type_info?.type_name || '').toLowerCase();
      const ward = (c.assigned_ward?.department_name || '').toLowerCase();
      return serial.includes(query) || qr.includes(query) || type.includes(query) || ward.includes(query);
    }
    
    return true;
  });

  const totalItems = filteredCylinders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCylinders = filteredCylinders.slice(startIndex, startIndex + pageSize);

  const isAllOnPageSelected = paginatedCylinders.length > 0 && paginatedCylinders.every(c => scannedCylinders.some(sc => sc.id === c.id));
  const isSomeOnPageSelected = paginatedCylinders.some(c => scannedCylinders.some(sc => sc.id === c.id)) && !isAllOnPageSelected;

  const isAllMatchingSelected = filteredCylinders.length > 0 && filteredCylinders.every(c => scannedCylinders.some(sc => sc.id === c.id));

  const handleSelectAllMatching = () => {
    if (isAllMatchingSelected) {
      const matchingIds = filteredCylinders.map(c => c.id);
      setScannedCylinders(scannedCylinders.filter(c => !matchingIds.includes(c.id)));
    } else {
      const newSelections = [...scannedCylinders];
      filteredCylinders.forEach(cyl => {
        if (!newSelections.some(c => c.id === cyl.id)) {
          newSelections.push(cyl);
        }
      });
      setScannedCylinders(newSelections);
    }
  };

  const handleSelectAllOnPage = () => {
    if (isAllOnPageSelected) {
      const pageIds = paginatedCylinders.map(c => c.id);
      setScannedCylinders(scannedCylinders.filter(c => !pageIds.includes(c.id)));
    } else {
      const newSelections = [...scannedCylinders];
      paginatedCylinders.forEach(cyl => {
        if (!newSelections.some(c => c.id === cyl.id)) {
          newSelections.push(cyl);
        }
      });
      setScannedCylinders(newSelections);
    }
  };

  const toggleCylinderSelect = (id: string) => {
    if (scannedCylinders.some(c => c.id === id)) {
      setScannedCylinders(scannedCylinders.filter(c => c.id !== id));
    } else {
      const cyl = emptyCylinders.find(c => c.id === id);
      if (cyl) {
        setScannedCylinders([...scannedCylinders, cyl]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      setError('Please select a supplier.');
      return;
    }
    if (scannedCylinders.length === 0) {
      setError('Please scan or select at least one empty cylinder.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const creatorId = user?.id || localStorage.getItem('userId') || 'fbbd44d1-f322-4fdb-a367-a18e5371e205';

      const res = await offlineAwareReturnDocument(
        hospitalId,
        selectedSupplier,
        returnDate,
        scannedCylinders.map(c => c.id),
        remarks,
        creatorId
      );

      if (res.error) throw new Error(res.error);
      setSessionScannedCylinders([]);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate return document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSupplierObj = suppliers.find(s => s.id === selectedSupplier);
  const isBorneoIndahSelected = (selectedSupplierObj?.company_name || '').toLowerCase().includes('borneo indah');

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={handleClose}
        className={`fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div 
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-5xl bg-surface shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default bg-gradient-to-r from-rose-500/5 to-pink-500/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
              {step === 'scan' ? (
                <QrCode className="w-5 h-5 text-rose-600" />
              ) : (
                <Calendar className="w-5 h-5 text-rose-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-text-primary">
                  {step === 'scan' ? 'Select Cylinders to Return' : 'Create Return Document'}
                </h3>
                {!isNetworkAvailable() && (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-400 border border-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    Offline Mode
                  </span>
                )}
              </div>
              <p className="text-text-muted text-xs font-semibold">
                {step === 'scan' ? 'Select available empty cylinders in inventory to return' : 'Sent when returning empty cylinders to supplier'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-subtle hover:bg-subtle border border-border-default flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-10 h-10 text-rose-500 animate-spin" />
              <span className="text-text-muted font-bold text-sm">Loading empty cylinders registry...</span>
            </div>
          ) : (
            <>
              {step === 'scan' ? (
                <div className="space-y-4">
                  {/* Empty Cylinders Registry selection with separating tabs */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                        <CheckSquare className="w-4.5 h-4.5 text-rose-600" />
                        <span>Select Available Empty Cylinders to Return</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleSelectAllMatching}
                          className="px-3 py-1 bg-surface hover:bg-rose-500/10 border border-rose-500/20 text-rose-600 hover:text-rose-700 rounded-lg text-[10px] font-bold transition-[transform,opacity,box-shadow,border-color] shadow-sm"
                        >
                          {isAllMatchingSelected ? 'Deselect All' : 'Select All'}
                        </button>
                        <span className="bg-rose-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase">
                          {scannedCylinders.length} Selected
                        </span>
                      </div>
                    </div>

                    {/* Search & Direct Scan input with Quick Camera Trigger */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={innerSearchTerm}
                            onChange={(e) => setInnerSearchTerm(e.target.value)}
                            onKeyDown={handleScanInputKeyDown}
                            placeholder="Cari atau imbas kod bar / no. siri & tekan Enter..."
                            className="w-full pl-9 pr-4 py-2.5 bg-subtle/50 border border-border-default rounded-xl text-xs font-semibold text-text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                          />
                        </div>

                        {onOpenScanner && (
                          <button
                            type="button"
                            onClick={onOpenScanner}
                            className="px-3.5 py-2.5 bg-subtle hover:bg-subtle text-text-secondary rounded-xl text-xs font-bold transition-[transform,opacity,box-shadow,border-color] flex items-center gap-1.5 shrink-0 border border-border-default cursor-pointer shadow-elevation-1 hover:shadow-xs active:scale-95"
                            title="Buka pengimbas kamera langsung"
                          >
                            <QrCode className="w-4 h-4 text-rose-600" />
                            <span className="hidden sm:inline">Pengimbas Kamera</span>
                          </button>
                        )}
                      </div>

                      {scanFeedback && (
                        <div className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-[transform,opacity,box-shadow,border-color] ${
                          scanFeedback.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                            : scanFeedback.type === 'info'
                            ? 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                        }`}>
                          <span>{scanFeedback.text}</span>
                        </div>
                      )}
                    </div>

                    {/* Ownership tabs removed as loan cylinders are quantity-only/untracked */}

                    {/* Secondary Cylinder Size Filter Pills */}
                    {availableSizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => setSelectedSizeFilter('')}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-[transform,opacity,box-shadow,border-color] duration-200 border ${
                            selectedSizeFilter === ''
                              ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                              : 'bg-subtle/50 text-text-secondary border-border-default hover:bg-subtle'
                          }`}
                        >
                          All ({emptyCylinders.filter(c => {
                            const isLoan = !c.supplier_tagged && (c.is_loan || c.type_info?.type_name?.toLowerCase().includes('loan'));
                            return (cylinderTab === 'loan' ? isLoan : !isLoan);
                          }).length})
                        </button>
                        {availableSizes.map((sizeName) => {
                          const count = emptyCylinders.filter(c => c.type_info?.type_name === sizeName).length;
                          return (
                            <button
                              key={sizeName}
                              type="button"
                              onClick={() => setSelectedSizeFilter(sizeName)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-[transform,opacity,box-shadow,border-color] duration-200 border ${
                                selectedSizeFilter === sizeName
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                  : 'bg-subtle/50 text-text-secondary border-border-default hover:bg-subtle'
                              }`}
                            >
                              {sizeName} ({count})
                            </button>
                          );
                        })}
                      </div>
                    )}
                    
                    {filteredCylinders.length === 0 ? (
                      <div className="bg-subtle/50 border border-border-default rounded-3xl p-12 text-center text-slate-400 font-bold text-sm">
                        No empty {cylinderTab === 'loan' ? 'Loan' : 'Standard/Hospital Owned'} cylinders found matching the query.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="border border-border-default rounded-3xl overflow-hidden bg-surface shadow-sm overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border-default bg-subtle/50 text-text-muted font-bold text-xs uppercase tracking-wider">
                                <th className="py-3 px-4 w-10">
                                  <button
                                    type="button"
                                    onClick={handleSelectAllOnPage}
                                    className="text-text-muted hover:text-rose-600 transition-colors flex items-center"
                                  >
                                    {isAllOnPageSelected ? (
                                      <CheckSquare className="w-5 h-5 text-rose-500" />
                                    ) : isSomeOnPageSelected ? (
                                      <div className="w-5 h-5 rounded border-2 border-slate-400 bg-rose-200 flex items-center justify-center">
                                        <div className="w-2.5 h-[2px] bg-rose-700" />
                                      </div>
                                    ) : (
                                      <Square className="w-5 h-5 text-slate-400" />
                                    )}
                                  </button>
                                </th>
                                <th className="py-3 px-4">Serial Number</th>
                                <th className="py-3 px-4">QR Code</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Size</th>
                                <th className="py-3 px-4">Location</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default text-text-secondary font-medium">
                              {paginatedCylinders.map((cyl) => {
                                const isSelected = scannedCylinders.some(c => c.id === cyl.id);
                                const parsed = parseTypeAndSize(cyl.type_info?.type_name || 'Standard');
                                return (
                                  <tr
                                    key={cyl.id}
                                    onClick={() => toggleCylinderSelect(cyl.id)}
                                    className="hover:bg-subtle/50 transition-colors duration-150 cursor-pointer"
                                  >
                                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => toggleCylinderSelect(cyl.id)}
                                        className="text-text-muted hover:text-rose-600 transition-colors flex items-center"
                                      >
                                        {isSelected ? (
                                          <CheckSquare className="w-5 h-5 text-rose-500" />
                                        ) : (
                                          <Square className="w-5 h-5 text-slate-400" />
                                        )}
                                      </button>
                                    </td>
                                    <td className="py-3 px-4 text-xs font-bold text-text-primary font-mono">
                                      {cyl.serial_number}
                                    </td>
                                    <td className="py-3 px-4 text-[10px] text-text-muted font-mono">
                                      {cyl.qr_code || '-'}
                                    </td>
                                    <td className="py-3 px-4 text-xs font-semibold text-text-secondary">
                                      {parsed.type}
                                    </td>
                                    <td className="py-3 px-4 text-xs font-bold text-text-secondary">
                                      <span className="px-2 py-0.5 rounded-md bg-subtle border border-border-default font-mono text-[10px]">
                                        {parsed.size}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-text-muted">
                                      {cyl.assigned_ward?.department_name || 'Store'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination controller */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between border border-border-default bg-subtle/50 rounded-2xl p-3 text-xs font-semibold text-text-secondary shadow-sm">
                            <span>
                              Showing {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} of {totalItems} cylinders
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 bg-surface border border-border-default hover:bg-subtle/50 text-text-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                              >
                                Previous
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="px-3 py-1.5 bg-surface border border-border-default hover:bg-subtle/50 text-text-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Supplier & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary font-bold text-xs mb-1.5">Supplier</label>
                      <select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border-default rounded-xl font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-sm"
                      >
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.company_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-text-secondary font-bold text-xs mb-1.5">Return Date</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border-default rounded-xl font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-sm"
                      />
                    </div>
                  </div>

                  {/* Return Summary / Scanned Count */}
                  <div className="bg-subtle/50 border border-border-default rounded-2xl p-4 flex justify-between items-center text-xs font-bold text-text-secondary">
                    <span>Scanned Cylinders to Return</span>
                    <span className="bg-rose-500 text-white px-2.5 py-1 rounded-full text-[10px]">
                      {scannedCylinders.length} cylinders
                    </span>
                  </div>

                  {/* Manual Supplier Tag Selection (Loan Cylinders Only - Only shown if Borneo Indah is selected) */}
                  {isBorneoIndahSelected && (supplierCylinders.length > 0 || scannedCylinders.some(c => c.supplier_tagged)) ? (
                    <div className="bg-subtle/50 border border-border-default rounded-2xl p-5 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <label className="block text-text-secondary font-bold text-xs flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-rose-600 animate-pulse" />
                          Select Supplier Cylinder ID (Loan 101-N / 101-F)
                        </label>
                        
                        {/* Size Filter Toggle/Pills */}
                        <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-extrabold uppercase">
                          {(['all', '101-N', '101-F'] as const).map((filterVal) => {
                            const count = supplierCylinders.filter(c => {
                              if (filterVal === 'all') return true;
                              const code = (c.size_info?.code || '').toUpperCase();
                              const typeName = (c.type_info?.type_name || c.type_info?.name || '').toUpperCase();
                              const serial = (c.serial_number || '').toUpperCase();
                              const is101F = code === '101-F' || typeName.includes('101-F') || serial.includes('101-F') || serial.includes('101F') || typeName.includes('1.4');
                              const is101N = code === '101-N' || typeName.includes('101-N') || serial.includes('101-N') || serial.includes('101N') || typeName.includes('8.0');
                              
                              if (filterVal === '101-F') {
                                return is101F;
                              } else if (filterVal === '101-N') {
                                return is101N;
                              } else {
                                return true;
                              }
                            }).length;
                            return (
                              <button
                                key={filterVal}
                                type="button"
                                onClick={() => setSupplierSizeFilter(filterVal)}
                                className={`px-2.5 py-1 rounded-md transition-[transform,opacity,box-shadow,border-color] ${
                                  supplierSizeFilter === filterVal
                                    ? 'bg-rose-500 text-white shadow-xs'
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                {filterVal === 'all' ? 'All' : filterVal} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Search Input for Supplier Cylinder IDs */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={supplierSearchTerm}
                          onChange={(e) => setSupplierSearchTerm(e.target.value)}
                          placeholder="Search cylinder serial number or QR code..."
                          className="w-full pl-8 pr-3 py-2 bg-surface border border-border-default rounded-xl text-xs font-semibold text-text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 shadow-xs"
                        />
                        {supplierSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setSupplierSearchTerm('')}
                            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-text-secondary text-xs font-bold"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Checkbox Grid of available supplier cylinders */}
                      {(() => {
                        const displayedCyls = supplierCylinders.filter(c => {
                          const code = (c.size_info?.code || '').toUpperCase();
                          const typeName = (c.type_info?.type_name || c.type_info?.name || '').toUpperCase();
                          const serial = (c.serial_number || '').toUpperCase();
                          const is101F = code === '101-F' || typeName.includes('101-F') || serial.includes('101-F') || serial.includes('101F') || typeName.includes('1.4');
                          const is101N = code === '101-N' || typeName.includes('101-N') || serial.includes('101-N') || serial.includes('101N') || typeName.includes('8.0');
                          
                          let matchesSize = true;
                          if (supplierSizeFilter === '101-N') {
                            matchesSize = is101N;
                          } else if (supplierSizeFilter === '101-F') {
                            matchesSize = is101F;
                          }
                          if (!matchesSize) return false;
                          if (supplierSearchTerm.trim()) {
                            const query = supplierSearchTerm.toLowerCase();
                            const serial = (c.serial_number || '').toLowerCase();
                            const qr = (c.qr_code || '').toLowerCase();
                            return serial.includes(query) || qr.includes(query);
                          }
                          return true;
                        });
                        if (displayedCyls.length === 0) {
                          return (
                            <p className="text-[11px] text-slate-400 font-semibold italic text-center py-4 bg-surface border border-dashed border-border-default rounded-xl">
                              {supplierSearchTerm.trim() 
                                ? `No cylinders found matching "${supplierSearchTerm}"`
                                : 'No active supplier-tagged cylinders found for this size.'}
                            </p>
                          );
                        }
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
                            {displayedCyls.map((cyl) => {
                              const isSelected = scannedCylinders.some(sc => sc.id === cyl.id);
                              return (
                                <label
                                  key={cyl.id}
                                  className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-[transform,opacity,box-shadow,border-color] select-none hover:bg-subtle ${
                                    isSelected
                                      ? 'border-rose-400 bg-rose-500/10 text-rose-400 ring-2 ring-rose-500/5 shadow-sm'
                                      : 'border-border-default bg-surface text-text-secondary'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      if (isSelected) {
                                        setScannedCylinders(scannedCylinders.filter(sc => sc.id !== cyl.id));
                                      } else {
                                        setScannedCylinders([...scannedCylinders, cyl]);
                                      }
                                    }}
                                    className="rounded border-border-default text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[11px] font-mono font-bold truncate leading-none mb-1">{cyl.serial_number}</span>
                                    <span className="text-[9px] text-text-secondary font-bold font-black uppercase tracking-wider">{cyl.size_info?.code || '101-N'}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ) : null}

                  {/* Remarks */}
                  <div>
                    <label className="block text-text-secondary font-bold text-xs mb-1.5">Remarks / Notes</label>
                    <div className="relative">
                      <Edit3 className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                      <textarea
                        rows={2}
                        placeholder="Enter supplier collection instructions or notes..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-subtle/50 border border-border-default rounded-2xl text-xs font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-[transform,opacity,box-shadow,border-color] resize-none"
                      />
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-6 border-t border-border-subtle bg-subtle/50 flex items-center justify-between shrink-0">
          {step === 'scan' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary font-mono">
                  {scannedCylinders.length} Selected
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={scannedCylinders.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-102 transition-[transform,opacity,box-shadow,border-color] duration-300 disabled:opacity-50 disabled:scale-100 disabled:shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>Proceed to Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="px-5 py-2.5 rounded-xl border border-border-default bg-surface hover:bg-subtle/50 font-bold text-xs text-text-secondary transition-colors shadow-sm flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Scan</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || scannedCylinders.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-102 transition-[transform,opacity,box-shadow,border-color] duration-300 disabled:opacity-50 disabled:scale-100 disabled:shadow-lg disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Generating Document...' : 'Generate Return Document'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
