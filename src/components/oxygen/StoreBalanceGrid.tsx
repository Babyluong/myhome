// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { 
  Database, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Layers, 
  Zap, 
  Activity, 
  LayoutGrid, 
  List, 
  GitCommit, 
  X, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export interface ComboInventory {
  combo_id: string;
  display_name: string;
  available: number;
  in_use: number;
  empty: number;
  returned: number;
  total: number;
  type_code?: string;
  type_name?: string;
}

export interface StoreBalanceGridProps {
  data: ComboInventory[];
  onQuickIssue?: (combo: ComboInventory) => void;
  onQuickScanEmpty?: (combo: ComboInventory) => void;
  onQuickCreateReturn?: (combo: ComboInventory) => void;
}

export const StoreBalanceGrid: React.FC<StoreBalanceGridProps> = ({ 
  data,
  onQuickIssue,
  onQuickScanEmpty,
  onQuickCreateReturn
}) => {
  const { language } = useLanguage();
  const isMs = language === 'ms';

  const [viewMode, setViewMode] = useState<'pipeline' | 'grid' | 'table'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionFilter, setConnectionFilter] = useState<'all' | 'pi' | 'bn'>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'loan' | 'private'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'in_use' | 'empty' | 'returned'>('all');

  // Base filtered combos (by search, valve connection, and contract ownership)
  const baseFilteredData = useMemo(() => {
    return data.filter((combo) => {
      const name = combo.display_name.toLowerCase();
      const isLoan = name.includes('loan');
      const isPinIndex = 
        combo.type_code === 'PI' || 
        combo.type_name?.toLowerCase().includes('pin') || 
        name.includes('pi') || 
        name.includes('- d') || 
        name.includes('- e') || 
        name.includes('101 - f') || 
        name.includes('101-f');

      // Search matching
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        if (!name.includes(query) && !combo.combo_id.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Connection filter
      if (connectionFilter === 'pi' && !isPinIndex) return false;
      if (connectionFilter === 'bn' && isPinIndex) return false;

      // Ownership filter
      if (ownershipFilter === 'loan' && !isLoan) return false;
      if (ownershipFilter === 'private' && isLoan) return false;

      return true;
    });
  }, [data, searchTerm, connectionFilter, ownershipFilter]);

  // Aggregate totals from baseFilteredData
  const totalStats = useMemo(() => {
    return baseFilteredData.reduce(
      (acc, curr) => ({
        available: acc.available + curr.available,
        in_use: acc.in_use + curr.in_use,
        empty: acc.empty + curr.empty,
        returned: acc.returned + curr.returned,
        total: acc.total + curr.total,
      }),
      { available: 0, in_use: 0, empty: 0, returned: 0, total: 0 }
    );
  }, [baseFilteredData]);

  // Proportions relative to total fleet units
  const totalFleetUnits = totalStats.total > 0 ? totalStats.total : 1;
  const availPct = Math.round((totalStats.available / totalFleetUnits) * 100);
  const inUsePct = Math.round((totalStats.in_use / totalFleetUnits) * 100);
  const emptyPct = Math.round((totalStats.empty / totalFleetUnits) * 100);
  const retPct = Math.round((totalStats.returned / totalFleetUnits) * 100);

  // Apply interactive status filter (if user clicked one of the KPI cards)
  const filteredData = useMemo(() => {
    if (statusFilter === 'available') {
      return baseFilteredData.filter((c) => c.available > 0);
    }
    if (statusFilter === 'in_use') {
      return baseFilteredData.filter((c) => c.in_use > 0);
    }
    if (statusFilter === 'empty') {
      return baseFilteredData.filter((c) => c.empty > 0);
    }
    if (statusFilter === 'returned') {
      return baseFilteredData.filter((c) => c.returned > 0);
    }
    return baseFilteredData;
  }, [baseFilteredData, statusFilter]);

  const hasActiveFilters = searchTerm !== '' || connectionFilter !== 'all' || ownershipFilter !== 'all' || statusFilter !== 'all';

  const handleResetAll = () => {
    setSearchTerm('');
    setConnectionFilter('all');
    setOwnershipFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* ENTERPRISE TELEMETRY CONTROL BAR & LIFECYCLE KPI DASHBOARD                 */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* ROW 1: SEARCH, LABELED FILTERS & UNIFIED VIEW SWITCHER */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isMs ? "Cari jenis silinder (cth. P101, 101-N, Bullnose, PI)..." : "Search cylinder type (e.g. P101, 101-N, Bullnose, PI)..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/80 transition-colors"
                title={isMs ? "Padam carian" : "Clear search"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Labeled Filter Groups & Cohesive View Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Valve Type Filter Group */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 select-none">
                {isMs ? 'Injap' : 'Valve'}
              </span>
              <div className="flex items-center gap-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setConnectionFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    connectionFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isMs ? 'Semua' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setConnectionFilter('pi')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    connectionFilter === 'pi'
                      ? 'bg-white text-blue-700 shadow-xs border border-blue-200 font-bold ring-1 ring-blue-500/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pin Index (PI)
                </button>
                <button
                  type="button"
                  onClick={() => setConnectionFilter('bn')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    connectionFilter === 'bn'
                      ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200 font-bold ring-1 ring-indigo-500/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Bullnose (BN)
                </button>
              </div>
            </div>

            {/* Ownership Filter Group */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 select-none">
                {isMs ? 'Kontrak' : 'Contract'}
              </span>
              <div className="flex items-center gap-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    ownershipFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isMs ? 'Semua' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('loan')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    ownershipFilter === 'loan'
                      ? 'bg-white text-amber-700 shadow-xs border border-amber-200 font-bold ring-1 ring-amber-500/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isMs ? 'Pinjaman' : 'Loan'}
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('private')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    ownershipFilter === 'private'
                      ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-bold ring-1 ring-emerald-500/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isMs ? 'Hak Milik' : 'Private'}
                </button>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="hidden 2xl:block h-6 w-px bg-slate-200 mx-1" />

            {/* Unified View Mode Switcher */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'pipeline'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={isMs ? "Paparan Aliran Kitaran Hayat (Pipeline Flow)" : "Movement Pipeline Telemetry Flow"}
              >
                <GitCommit className="w-3.5 h-3.5 text-blue-600" />
                <span>{isMs ? 'Aliran' : 'Pipeline'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={isMs ? "Paparan Kad Telemetri" : "Telemetry Grid Cards"}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
                <span>{isMs ? 'Kad' : 'Cards'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={isMs ? "Paparan Jadual Padat" : "Dense Data Matrix Table"}
              >
                <List className="w-3.5 h-3.5 text-slate-600" />
                <span>{isMs ? 'Jadual' : 'Table'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* ROW 2: EXECUTIVE FLEET TELEMETRY STATUS DASHBOARD (5 INTERACTIVE CARDS) */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {isMs ? 'Status Armada Silinder Semasa' : 'Current Cylinder Fleet Status'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {filteredData.length} {isMs ? 'Jenis Silinder' : 'Cylinder Types'}
              </span>
              {statusFilter !== 'all' && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                  {isMs ? 'Ditapis mengikut status' : 'Filtered by status'}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isMs ? 'Set Semula Semua Tapisan' : 'Reset All Filters'}</span>
              </button>
            )}
          </div>

          {/* 5-Card Responsive Metric Grid (Compact High-Density) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            
            {/* Card 1: Total Fleet */}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl border text-left transition-all relative group cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-800 shadow-xs ring-2 ring-slate-900/20'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Layers className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'all' ? 'text-slate-200' : 'text-slate-700'}`}>
                    {isMs ? 'Jumlah Armada' : 'Total Fleet'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'all' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
                }`}>
                  100%
                </span>
              </div>
              <div className="text-xl font-bold tabular-nums tracking-tight font-mono">
                {totalStats.total}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'all' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isMs ? 'Semua Silinder' : 'All Cylinders'}
              </div>
            </button>

            {/* Card 2: Store Available */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
              className={`px-3 py-2 rounded-xl border text-left transition-all relative group cursor-pointer ${
                statusFilter === 'available'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-600/30'
                  : 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950 hover:bg-emerald-100/60 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'available' ? 'text-emerald-200' : 'text-emerald-600'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'available' ? 'text-emerald-100' : 'text-emerald-900'}`}>
                    {isMs ? 'Stok Stor' : 'Store Available'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'available' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200/80 text-emerald-800'
                }`}>
                  {availPct}%
                </span>
              </div>
              <div className={`text-xl font-bold tabular-nums tracking-tight font-mono ${
                statusFilter === 'available' ? 'text-white' : 'text-emerald-700'
              }`}>
                {totalStats.available}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'available' ? 'text-emerald-100' : 'text-emerald-700'
              }`}>
                {isMs ? 'Sedia Diserah' : 'Ready For Issue'}
              </div>
            </button>

            {/* Card 3: Ward In Use */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'in_use' ? 'all' : 'in_use')}
              className={`px-3 py-2 rounded-xl border text-left transition-all relative group cursor-pointer ${
                statusFilter === 'in_use'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-600/30'
                  : 'bg-blue-50/50 border-blue-200/80 text-blue-950 hover:bg-blue-100/60 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Activity className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'in_use' ? 'text-blue-200' : 'text-blue-600'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'in_use' ? 'text-blue-100' : 'text-blue-900'}`}>
                    {isMs ? 'Di Wad' : 'Ward In Use'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'in_use' ? 'bg-blue-700 text-blue-100' : 'bg-blue-200/80 text-blue-800'
                }`}>
                  {inUsePct}%
                </span>
              </div>
              <div className={`text-xl font-bold tabular-nums tracking-tight font-mono ${
                statusFilter === 'in_use' ? 'text-white' : 'text-blue-700'
              }`}>
                {totalStats.in_use}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'in_use' ? 'text-blue-100' : 'text-blue-700'
              }`}>
                {isMs ? 'Sedang Diguna' : 'In Active Service'}
              </div>
            </button>

            {/* Card 4: Depleted Empty */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'empty' ? 'all' : 'empty')}
              className={`px-3 py-2 rounded-xl border text-left transition-all relative group cursor-pointer ${
                statusFilter === 'empty'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-600/30'
                  : 'bg-amber-50/50 border-amber-200/80 text-amber-950 hover:bg-amber-100/60 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'empty' ? 'text-amber-200' : 'text-amber-600'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'empty' ? 'text-amber-100' : 'text-amber-900'}`}>
                    {isMs ? 'Silinder Kosong' : 'Depleted Empty'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'empty' ? 'bg-amber-700 text-amber-100' : 'bg-amber-200/80 text-amber-800'
                }`}>
                  {emptyPct}%
                </span>
              </div>
              <div className={`text-xl font-bold tabular-nums tracking-tight font-mono ${
                statusFilter === 'empty' ? 'text-white' : 'text-amber-700'
              }`}>
                {totalStats.empty}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'empty' ? 'text-amber-100' : 'text-amber-700'
              }`}>
                {isMs ? 'Tunggu Pulang' : 'Pending Return'}
              </div>
            </button>

            {/* Card 5: Supplier Returned */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'returned' ? 'all' : 'returned')}
              className={`px-3 py-2 rounded-xl border text-left transition-all relative group cursor-pointer ${
                statusFilter === 'returned'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-600/30'
                  : 'bg-indigo-50/50 border-indigo-200/80 text-indigo-950 hover:bg-indigo-100/60 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Truck className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'returned' ? 'text-indigo-200' : 'text-indigo-600'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'returned' ? 'text-indigo-100' : 'text-indigo-900'}`}>
                    {isMs ? 'Pulang Pembekal' : 'Supplier Returned'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'returned' ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-200/80 text-indigo-800'
                }`}>
                  {retPct}%
                </span>
              </div>
              <div className={`text-xl font-bold tabular-nums tracking-tight font-mono ${
                statusFilter === 'returned' ? 'text-white' : 'text-indigo-700'
              }`}>
                {totalStats.returned}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'returned' ? 'text-indigo-100' : 'text-indigo-700'
              }`}>
                {isMs ? 'Isian Semula' : 'Refill Logistics'}
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ZERO RESULTS EMPTY STATE (STRICT ZERO-MOCK COMPLIANT)                     */}
      {/* ========================================================================= */}
      {filteredData.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {isMs ? 'Tiada Rekod Silinder Dijumpai' : 'No Cylinder Records Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isMs 
              ? 'Tiada rekod silinder yang sepadan dengan carian atau tapisan status semasa.' 
              : 'No cylinder assets match the selected search or active status filters.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isMs ? 'Set Semula Semua Tapisan' : 'Reset All Filters'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: COMPACT MOVEMENT PIPELINE FLOW (STREAMLINED & SPACE-EFFICIENT)     */}
      {/* ========================================================================= */}
      {viewMode === 'pipeline' && filteredData.length > 0 && (
        <div className="space-y-2">
          {filteredData.map((combo) => {
            const isLoan = combo.display_name.toLowerCase().includes('loan');
            const isPinIndex = 
              combo.type_code === 'PI' || 
              combo.type_name?.toLowerCase().includes('pin') || 
              combo.display_name.toLowerCase().includes('pi') || 
              combo.display_name.toLowerCase().includes('- d') || 
              combo.display_name.toLowerCase().includes('- e') || 
              combo.display_name.toLowerCase().includes('101 - f') || 
              combo.display_name.toLowerCase().includes('101-f');
            const connectionType = isPinIndex ? 'Pin Index (PI)' : 'Bullnose (BN)';
            
            const comboTotal = combo.total > 0 ? combo.total : 1;
            const itemAvailPct = Math.round((combo.available / comboTotal) * 100);
            const itemInUsePct = Math.round((combo.in_use / comboTotal) * 100);
            const itemEmptyPct = Math.round((combo.empty / comboTotal) * 100);
            const itemRetPct = Math.round((combo.returned / comboTotal) * 100);

            return (
              <div 
                key={combo.combo_id}
                className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-2.5"
              >
                {/* Left: SKU Info */}
                <div className="flex items-center gap-2.5 min-w-[220px] shrink-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 tracking-tight">
                        {combo.display_name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 uppercase bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-mono shrink-0">
                        {connectionType}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase shrink-0 border ${
                        isLoan 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {isLoan ? (isMs ? 'Pinjaman' : 'Loan') : (isMs ? 'Hak Milik' : 'Private')}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {isMs ? 'Armada:' : 'Fleet:'} <strong className="text-slate-800 font-bold">{combo.total}</strong> {isMs ? 'unit' : 'units'}
                      <span className="mx-1 text-slate-300">•</span>
                      <span className="text-blue-700 font-semibold">{itemInUsePct}% {isMs ? 'Aktif' : 'Active'}</span>
                    </div>
                  </div>
                </div>

                {/* Center: 4-Stage Connected Compact Pipeline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 flex-1 max-w-2xl">
                  
                  {/* Stage 1: Store Available */}
                  <div 
                    className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                    title={`${isMs ? 'Stok Stor (Tersedia)' : 'Store Available'}: ${combo.available} (${itemAvailPct}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-emerald-900 truncate">
                        {isMs ? 'Stor' : 'Store'}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono tabular-nums text-emerald-950 shrink-0">
                      {combo.available}
                    </span>
                  </div>

                  {/* Stage 2: Ward In Use */}
                  <div 
                    className="bg-blue-50/60 border border-blue-200/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                    title={`${isMs ? 'Sedang Digunakan di Wad' : 'Ward In Use'}: ${combo.in_use} (${itemInUsePct}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-blue-900 truncate">
                        {isMs ? 'Di Wad' : 'In Use'}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono tabular-nums text-blue-950 shrink-0">
                      {combo.in_use}
                    </span>
                  </div>

                  {/* Stage 3: Empty Holding Area */}
                  <div 
                    className="bg-amber-50/60 border border-amber-200/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                    title={`${isMs ? 'Silinder Kosong' : 'Depleted Empty'}: ${combo.empty} (${itemEmptyPct}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-amber-900 truncate">
                        {isMs ? 'Kosong' : 'Empty'}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono tabular-nums text-amber-950 shrink-0">
                      {combo.empty}
                    </span>
                  </div>

                  {/* Stage 4: Supplier Returned */}
                  <div 
                    className="bg-indigo-50/60 border border-indigo-200/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                    title={`${isMs ? 'Pulang ke Pembekal' : 'Supplier Returned'}: ${combo.returned} (${itemRetPct}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-indigo-900 truncate">
                        {isMs ? 'Pembekal' : 'Supplier'}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono tabular-nums text-indigo-950 shrink-0">
                      {combo.returned}
                    </span>
                  </div>
                </div>

                {/* Right: Proportional Ratio Bar & Compact Actions */}
                <div className="flex items-center gap-2.5 shrink-0 justify-end">
                  {/* Ratio bar */}
                  <div className="hidden 2xl:flex items-center gap-1.5" title={`Stor: ${itemAvailPct}%, Wad: ${itemInUsePct}%, Kosong: ${itemEmptyPct}%, Pembekal: ${itemRetPct}%`}>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full flex overflow-hidden border border-slate-200">
                      {combo.available > 0 && <div style={{ width: `${itemAvailPct}%` }} className="bg-emerald-500 h-full" />}
                      {combo.in_use > 0 && <div style={{ width: `${itemInUsePct}%` }} className="bg-blue-600 h-full" />}
                      {combo.empty > 0 && <div style={{ width: `${itemEmptyPct}%` }} className="bg-amber-500 h-full" />}
                      {combo.returned > 0 && <div style={{ width: `${itemRetPct}%` }} className="bg-indigo-600 h-full" />}
                    </div>
                  </div>

                  {/* Compact Actions */}
                  <div className="flex items-center gap-1">
                    {onQuickIssue && (
                      <button
                        type="button"
                        onClick={() => onQuickIssue(combo)}
                        disabled={combo.available <= 0}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-25 text-white rounded-md text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                        title={isMs ? "Bekal ke Wad" : "Issue to Ward"}
                      >
                        <Zap className="w-3 h-3" />
                        <span>{isMs ? 'Bekal' : 'Issue'}</span>
                      </button>
                    )}
                    {onQuickScanEmpty && (
                      <button
                        type="button"
                        onClick={() => onQuickScanEmpty(combo)}
                        disabled={combo.in_use <= 0}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-25 text-white rounded-md text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                        title={isMs ? "Rekod Kosong" : "Mark Depleted"}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{isMs ? 'Kosong' : 'Deplete'}</span>
                      </button>
                    )}
                    {onQuickCreateReturn && (
                      <button
                        type="button"
                        onClick={() => onQuickCreateReturn(combo)}
                        disabled={combo.empty <= 0}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-25 text-white rounded-md text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                        title={isMs ? "Borang Pulang ke Pembekal" : "Create Return Doc"}
                      >
                        <Truck className="w-3 h-3" />
                        <span>{isMs ? 'Pulang' : 'Return'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: COMPACT TELEMETRY CARDS (OPTIMIZED DENSITY)                       */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredData.map((combo) => {
            const isLoan = combo.display_name.toLowerCase().includes('loan');
            const isPinIndex = 
              combo.type_code === 'PI' || 
              combo.type_name?.toLowerCase().includes('pin') || 
              combo.display_name.toLowerCase().includes('pi') || 
              combo.display_name.toLowerCase().includes('- d') || 
              combo.display_name.toLowerCase().includes('- e') || 
              combo.display_name.toLowerCase().includes('101 - f') || 
              combo.display_name.toLowerCase().includes('101-f');
            const connectionType = isPinIndex ? 'Pin Index (PI)' : 'Bullnose (BN)';

            const comboTotal = combo.total > 0 ? combo.total : 1;
            const availPercent = Math.round((combo.available / comboTotal) * 100);
            const inUsePercent = Math.round((combo.in_use / comboTotal) * 100);
            const emptyPercent = Math.round((combo.empty / comboTotal) * 100);
            const returnedPercent = Math.round((combo.returned / comboTotal) * 100);

            return (
              <div
                key={combo.combo_id}
                className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                        {combo.display_name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {connectionType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {combo.total} {isMs ? 'unit' : 'units'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 border ${
                        isLoan
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isLoan ? (isMs ? 'Pinjaman' : 'Loan') : (isMs ? 'Hak Milik' : 'Private')}
                    </span>
                  </div>

                  {/* 4 Quadrants (Compact) */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-emerald-50/70 border border-emerald-200/80 px-2.5 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-800 font-bold text-[10px]">{isMs ? 'Stor' : 'Store'}</span>
                        <span className="text-[9px] font-mono text-emerald-600 font-bold">{availPercent}%</span>
                      </div>
                      <span className="text-lg font-black text-emerald-950 tabular-nums font-mono leading-none block mt-1">{combo.available}</span>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-200/80 px-2.5 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-bold text-[10px]">{isMs ? 'Di Wad' : 'In Use'}</span>
                        <span className="text-[9px] font-mono text-blue-600 font-bold">{inUsePercent}%</span>
                      </div>
                      <span className="text-lg font-black text-blue-950 tabular-nums font-mono leading-none block mt-1">{combo.in_use}</span>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200/80 px-2.5 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-800 font-bold text-[10px]">{isMs ? 'Kosong' : 'Empty'}</span>
                        <span className="text-[9px] font-mono text-amber-600 font-bold">{emptyPercent}%</span>
                      </div>
                      <span className="text-lg font-black text-amber-950 tabular-nums font-mono leading-none block mt-1">{combo.empty}</span>
                    </div>

                    <div className="bg-indigo-50/70 border border-indigo-200/80 px-2.5 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-800 font-bold text-[10px]">{isMs ? 'Pulang' : 'Returned'}</span>
                        <span className="text-[9px] font-mono text-indigo-600 font-bold">{returnedPercent}%</span>
                      </div>
                      <span className="text-lg font-black text-indigo-950 tabular-nums font-mono leading-none block mt-1">{combo.returned}</span>
                    </div>
                  </div>

                  {/* Proportional Ratio Bar */}
                  {combo.total > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>{isMs ? 'Nisbah Armada' : 'Fleet Ratio'}</span>
                        <span className="font-mono text-slate-700">{combo.total} total</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full flex overflow-hidden border border-slate-200">
                        {combo.available > 0 && <div style={{ width: `${availPercent}%` }} className="bg-emerald-500 h-full" />}
                        {combo.in_use > 0 && <div style={{ width: `${inUsePercent}%` }} className="bg-blue-600 h-full" />}
                        {combo.empty > 0 && <div style={{ width: `${emptyPercent}%` }} className="bg-amber-500 h-full" />}
                        {combo.returned > 0 && <div style={{ width: `${returnedPercent}%` }} className="bg-indigo-600 h-full" />}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons (Compact & Icon-assisted) */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                  {onQuickIssue && (
                    <button
                      type="button"
                      onClick={() => onQuickIssue(combo)}
                      disabled={combo.available <= 0}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{isMs ? 'Bekal' : 'Issue'}</span>
                    </button>
                  )}
                  {onQuickScanEmpty && (
                    <button
                      type="button"
                      onClick={() => onQuickScanEmpty(combo)}
                      disabled={combo.in_use <= 0}
                      className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{isMs ? 'Kosong' : 'Deplete'}</span>
                    </button>
                  )}
                  {onQuickCreateReturn && (
                    <button
                      type="button"
                      onClick={() => onQuickCreateReturn(combo)}
                      disabled={combo.empty <= 0}
                      className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Truck className="w-3 h-3" />
                      <span>{isMs ? 'Pulang' : 'Return'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: DENSE DATA MATRIX TABLE (SPACE-EFFICIENT)                         */}
      {/* ========================================================================= */}
      {viewMode === 'table' && filteredData.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-bold">{isMs ? 'Jenis Silinder' : 'Cylinder SKU'}</th>
                  <th className="px-4 py-2.5 font-bold">{isMs ? 'Injap' : 'Valve'}</th>
                  <th className="px-4 py-2.5 font-bold">{isMs ? 'Kontrak' : 'Contract'}</th>
                  <th className="px-4 py-2.5 font-bold text-emerald-700 text-center">{isMs ? 'Stor' : 'Store'}</th>
                  <th className="px-4 py-2.5 font-bold text-blue-700 text-center">{isMs ? 'Di Wad' : 'In Use'}</th>
                  <th className="px-4 py-2.5 font-bold text-amber-700 text-center">{isMs ? 'Kosong' : 'Empty'}</th>
                  <th className="px-4 py-2.5 font-bold text-indigo-700 text-center">{isMs ? 'Pulang' : 'Returned'}</th>
                  <th className="px-4 py-2.5 font-bold text-center">{isMs ? 'Armada' : 'Fleet Total'}</th>
                  <th className="px-4 py-2.5 font-bold text-right">{isMs ? 'Tindakan' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((combo) => {
                  const isLoan = combo.display_name.toLowerCase().includes('loan');
                  const isPinIndex = 
                    combo.type_code === 'PI' || 
                    combo.type_name?.toLowerCase().includes('pin') || 
                    combo.display_name.toLowerCase().includes('pi') || 
                    combo.display_name.toLowerCase().includes('- d') || 
                    combo.display_name.toLowerCase().includes('- e') || 
                    combo.display_name.toLowerCase().includes('101 - f') || 
                    combo.display_name.toLowerCase().includes('101-f');
                  const connectionType = isPinIndex ? 'Pin Index (PI)' : 'Bullnose (BN)';

                  return (
                    <tr key={combo.combo_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{combo.display_name}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">{connectionType}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                          isLoan ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {isLoan ? (isMs ? 'Pinjaman' : 'Loan') : (isMs ? 'Hak Milik' : 'Private')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-black text-emerald-700 text-xs tabular-nums font-mono text-center">{combo.available}</td>
                      <td className="px-4 py-2.5 font-black text-blue-700 text-xs tabular-nums font-mono text-center">{combo.in_use}</td>
                      <td className="px-4 py-2.5 font-black text-amber-700 text-xs tabular-nums font-mono text-center">{combo.empty}</td>
                      <td className="px-4 py-2.5 font-black text-indigo-700 text-xs tabular-nums font-mono text-center">{combo.returned}</td>
                      <td className="px-4 py-2.5 font-black text-slate-900 text-xs tabular-nums font-mono text-center">{combo.total}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onQuickIssue && (
                            <button
                              type="button"
                              onClick={() => onQuickIssue(combo)}
                              disabled={combo.available <= 0}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-25 text-white rounded text-[10px] font-bold cursor-pointer disabled:cursor-not-allowed"
                            >
                              {isMs ? 'Bekal' : 'Issue'}
                            </button>
                          )}
                          {onQuickScanEmpty && (
                            <button
                              type="button"
                              onClick={() => onQuickScanEmpty(combo)}
                              disabled={combo.in_use <= 0}
                              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-25 text-white rounded text-[10px] font-bold cursor-pointer disabled:cursor-not-allowed"
                            >
                              {isMs ? 'Kosong' : 'Deplete'}
                            </button>
                          )}
                          {onQuickCreateReturn && (
                            <button
                              type="button"
                              onClick={() => onQuickCreateReturn(combo)}
                              disabled={combo.empty <= 0}
                              className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-25 text-white rounded text-[10px] font-bold cursor-pointer disabled:cursor-not-allowed"
                            >
                              {isMs ? 'Pulang' : 'Return'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

