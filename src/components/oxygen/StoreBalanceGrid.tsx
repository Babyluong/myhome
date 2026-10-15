// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Database, AlertTriangle, Search, CheckCircle2, Truck, Layers, Zap, Activity, LayoutGrid, List, GitCommit, X, RotateCcw } from 'lucide-react'
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

/**
 * Accurately determines whether a cylinder SKU has a Pin Index (PI) or Bullnose (BN) valve.
 * Prioritizes database valve types (type_code / type_name), followed by explicit SKU naming tags (BN vs PI).
 */
export const isCylinderPinIndex = (combo: ComboInventory | { display_name?: string; type_code?: string; type_name?: string; type_id?: string }): boolean => {
  const typeId = (combo as any).type_id || '';
  const typeCode = (combo.type_code || '').toUpperCase().trim();
  const typeName = (combo.type_name || '').toLowerCase();
  const name = (combo.display_name || '').toLowerCase();

  // 1. Direct database type ID check (canonical UUIDs for BN vs PI)
  if (typeId === '3edfc0fe-98fb-4592-9ce1-4229718871a2') return false; // Bullnose (BN)
  if (typeId === '1874961b-a46d-4cf6-8a47-90b18a1e0fb7') return true;  // Pin Index (PI)

  // 2. Direct database type code check (highest authority: 'BN' vs 'PI')
  if (typeCode === 'BN') return false;
  if (typeCode === 'PI') return true;

  // 3. Direct database type name check ('Bullnose' vs 'Pin Index')
  if (typeName.includes('bull')) return false;
  if (typeName.includes('pin')) return true;

  // 3. Name explicit indicator checks
  // If explicitly designated Bullnose (BN) in the name
  if (/\b(bn|bullnose)\b/i.test(name) || name.includes('bull')) return false;
  // If explicitly designated Pin Index (PI) in the name
  if (/\b(pi|pin)\b/i.test(name) || name.includes('pin')) return true;

  // 4. Default size conventions:
  // Sizes D and E are universally Pin Index
  if (name.includes('- d') || name.includes('-d') || name.includes('- e') || name.includes('-e')) return true;

  // 5. Fallback for 101-F: Pin Index unless designated BN (handled above)
  if (name.includes('101 - f') || name.includes('101-f')) return true;

  return false;
};

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
      const isPinIndex = isCylinderPinIndex(combo);

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
      <div className="bg-surface border border-border-default rounded-2xl p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
        
        {/* ROW 1: SEARCH, LABELED FILTERS & UNIFIED VIEW SWITCHER */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-0 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isMs ? "Cari jenis silinder (cth. P101, PI)..." : "Search cylinder type (e.g. P101, PI)..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border-default rounded-xl pl-10 pr-9 py-2 text-xs font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-base/20 focus:border-accent-base transition-[transform,opacity,box-shadow,border-color]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text-secondary p-1 rounded-full hover:bg-subtle transition-colors"
                title={isMs ? "Clear search" : "Clear search"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Controls Row (Responsive wrapping, zero forced horizontal scrolling) */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-0.5 w-full">
            <div className="flex flex-wrap items-center gap-2">
              {/* Valve Type Filter Group */}
              <div className="flex items-center gap-1 bg-subtle/50 border border-border-default p-1 rounded-xl shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1.5 select-none hidden sm:inline">
                  {isMs ? 'Injap' : 'Valve'}
                </span>
                <div className="flex items-center gap-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setConnectionFilter('all')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                      connectionFilter === 'all'
                        ? 'bg-surface text-text-primary shadow-xs border border-border-default font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {isMs ? 'Semua' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectionFilter('pi')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                      connectionFilter === 'pi'
                        ? 'bg-surface text-accent-base shadow-xs border border-accent-base/20 font-bold ring-1 ring-teal-500/20'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    PI
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectionFilter('bn')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                      connectionFilter === 'bn'
                        ? 'bg-surface text-indigo-400 shadow-xs border border-indigo-500/20 font-bold ring-1 ring-indigo-500/20'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    BN
                  </button>
                </div>
              </div>

              {/* Ownership Filter Group */}
              <div className="flex items-center gap-1 bg-subtle/50 border border-border-default p-1 rounded-xl shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1.5 select-none hidden sm:inline">
                  {isMs ? 'Kontrak' : 'Contract'}
                </span>
              <div className="flex items-center gap-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('all')}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                    ownershipFilter === 'all'
                      ? 'bg-surface text-text-primary shadow-xs border border-border-default font-bold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {isMs ? 'Semua' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('loan')}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                    ownershipFilter === 'loan'
                      ? 'bg-surface text-amber-400 shadow-xs border border-amber-500/20 font-bold ring-1 ring-amber-500/20'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {isMs ? 'Pinjam' : 'Loan'}
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipFilter('private')}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                    ownershipFilter === 'private'
                      ? 'bg-surface text-emerald-400 shadow-xs border border-emerald-500/20 font-bold ring-1 ring-emerald-500/20'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {isMs ? 'Milik' : 'Private'}
                </button>
              </div>
            </div>
          </div>

            {/* Unified View Mode Switcher */}
            <div className="flex items-center bg-subtle/50 p-1 rounded-xl border border-border-default text-xs shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('pipeline')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                  viewMode === 'pipeline'
                    ? 'bg-surface text-accent-base shadow-xs border border-border-default font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title={isMs ? "Paparan Aliran (Pipeline)" : "Pipeline Flow"}
              >
                <GitCommit className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">{isMs ? 'Aliran' : 'Pipeline'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                  viewMode === 'grid'
                    ? 'bg-surface text-accent-base shadow-xs border border-border-default font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title={isMs ? "Paparan Kad" : "Cards Grid"}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-text-secondary" />
                <span className="hidden sm:inline">{isMs ? 'Kad' : 'Cards'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] ${
                  viewMode === 'table'
                    ? 'bg-surface text-accent-base shadow-xs border border-border-default font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title={isMs ? "Paparan Jadual" : "Data Table"}
              >
                <List className="w-3.5 h-3.5 text-text-secondary" />
                <span className="hidden sm:inline">{isMs ? 'Jadual' : 'Table'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* ROW 2: EXECUTIVE FLEET TELEMETRY STATUS DASHBOARD (5 INTERACTIVE CARDS) */}
        <div className="pt-2.5 border-t border-border-subtle space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">
                {isMs ? 'Status Armada Silinder' : 'Fleet Status'}
              </span>
              <span className="text-[10px] font-bold text-text-muted bg-subtle px-2 py-0.5 rounded-full border border-border-default">
                {filteredData.length} {isMs ? 'Jenis' : 'Types'}
              </span>
              {statusFilter !== 'all' && (
                <span className="text-[10px] font-bold text-accent-base bg-accent-base/10 px-2 py-0.5 rounded-full border border-accent-base/20 animate-pulse">
                  {isMs ? 'Ditapis' : 'Filtered'}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary bg-subtle hover:bg-subtle px-2 py-0.5 rounded-lg transition-colors cursor-pointer border border-border-default"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[11px]">{isMs ? 'Set Semula' : 'Reset'}</span>
              </button>
            )}
          </div>

          {/* 5-Card Responsive Metric Grid (Clean Responsive Grid on Mobile, 5-Col on Desktop - Zero Horizontal Cutoff) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 py-0.5">
            
            {/* Card 1: Total Fleet (Full Width on Mobile, 1-Col on Desktop) */}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`col-span-2 sm:col-span-1 min-w-0 px-3.5 py-2.5 rounded-xl border text-left transition-[transform,opacity,box-shadow,border-color] relative group cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-800 shadow-xs ring-2 ring-slate-900/20'
                  : 'bg-subtle/50 border-border-default text-text-primary hover:bg-subtle hover:border-border-default'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Layers className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'all' ? 'text-slate-300' : 'text-text-muted'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'all' ? 'text-slate-200' : 'text-text-secondary'}`}>
                    {isMs ? 'Total Fleet' : 'Total Fleet'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                  statusFilter === 'all' ? 'bg-slate-800 text-slate-300' : 'bg-subtle text-text-secondary'
                }`}>
                  100%
                </span>
              </div>
              <div className="text-xl font-bold tabular-nums tracking-tight font-mono">
                {totalStats.total}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'all' ? 'text-slate-400' : 'text-text-muted'
              }`}>
                {isMs ? 'Semua Silinder Berdaftar' : 'All Registered Cylinders'}
              </div>
            </button>

            {/* Card 2: Store Available */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
              className={`col-span-1 min-w-0 px-3 py-2 rounded-xl border text-left transition-[transform,opacity,box-shadow,border-color] relative group cursor-pointer ${
                statusFilter === 'available'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-600/30'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 dark:text-emerald-300 font-bold hover:bg-emerald-100/60 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'available' ? 'text-emerald-200' : 'text-emerald-600'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'available' ? 'text-emerald-100' : 'text-emerald-400 dark:text-emerald-300 font-bold'}`}>
                    {isMs ? 'Stok Stor' : 'Store Stock'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'available' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200/80 text-emerald-400'
                }`}>
                  {availPct}%
                </span>
              </div>
              <div className={`text-xl font-bold tabular-nums tracking-tight font-mono ${
                statusFilter === 'available' ? 'text-white' : 'text-emerald-400'
              }`}>
                {totalStats.available}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'available' ? 'text-emerald-100' : 'text-emerald-400'
              }`}>
                {isMs ? 'Sedia Diserah' : 'Ready For Issue'}
              </div>
            </button>

            {/* Card 3: Ward In Use */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'in_use' ? 'all' : 'in_use')}
              className={`col-span-1 min-w-0 px-3 py-2 rounded-xl border text-left transition-[transform,opacity,box-shadow,border-color] relative group cursor-pointer ${
                statusFilter === 'in_use'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-600/30'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400 dark:text-blue-300 font-bold hover:bg-blue-100/60 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Activity className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'in_use' ? 'text-blue-200' : 'text-blue-600'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'in_use' ? 'text-blue-100' : 'text-blue-400 dark:text-blue-300 font-bold'}`}>
                    {isMs ? 'Di Wad' : 'Ward In Use'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'in_use' ? 'bg-blue-700 text-blue-100' : 'bg-blue-200/80 text-blue-400'
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
              className={`col-span-1 min-w-0 px-3 py-2 rounded-xl border text-left transition-[transform,opacity,box-shadow,border-color] relative group cursor-pointer ${
                statusFilter === 'empty'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-600/30'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400 dark:text-amber-300 font-bold hover:bg-amber-100/60 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'empty' ? 'text-amber-200' : 'text-amber-600'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'empty' ? 'text-amber-100' : 'text-amber-400 dark:text-amber-300 font-bold'}`}>
                    {isMs ? 'Kosong' : 'Depleted'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'empty' ? 'bg-amber-700 text-amber-100' : 'bg-amber-200/80 text-amber-400'
                }`}>
                  {emptyPct}%
                </span>
              </div>
              <div className={`text-xl font-bold tabular-nums tracking-tight font-mono ${
                statusFilter === 'empty' ? 'text-white' : 'text-amber-400'
              }`}>
                {totalStats.empty}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'empty' ? 'text-amber-100' : 'text-amber-400'
              }`}>
                {isMs ? 'Tunggu Pulang' : 'Pending Return'}
              </div>
            </button>

            {/* Card 5: Supplier Returned */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'returned' ? 'all' : 'returned')}
              className={`col-span-1 min-w-0 px-3 py-2 rounded-xl border text-left transition-[transform,opacity,box-shadow,border-color] relative group cursor-pointer ${
                statusFilter === 'returned'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-600/30'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 dark:text-indigo-300 font-bold hover:bg-indigo-100/60 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Truck className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'returned' ? 'text-indigo-200' : 'text-indigo-600'}`} />
                  <span className={`text-[11px] font-bold truncate ${statusFilter === 'returned' ? 'text-indigo-100' : 'text-indigo-400 dark:text-indigo-300 font-bold'}`}>
                    {isMs ? 'Pembekal' : 'Supplier'}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                  statusFilter === 'returned' ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-200/80 text-indigo-400'
                }`}>
                  {retPct}%
                </span>
              </div>
              <div className={`text-xl font-bold tabular-nums tracking-tight font-mono ${
                statusFilter === 'returned' ? 'text-white' : 'text-indigo-400'
              }`}>
                {totalStats.returned}
              </div>
              <div className={`text-[10px] font-medium truncate ${
                statusFilter === 'returned' ? 'text-indigo-100' : 'text-indigo-400'
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
        <div className="bg-surface border border-border-default rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-subtle text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-text-primary">
            {isMs ? 'No Cylinder Records Found' : 'No Cylinder Records Found'}
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {isMs 
              ? 'No cylinder records match current search or status filter.' 
              : 'No cylinder assets match the selected search or active status filters.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-[transform,opacity,box-shadow,border-color] shadow-sm active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
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
            const isPinIndex = isCylinderPinIndex(combo);
            const connectionType = isPinIndex ? 'Pin Index (PI)' : 'Bullnose (BN)';
            
            const comboTotal = combo.total > 0 ? combo.total : 1;
            const itemAvailPct = Math.round((combo.available / comboTotal) * 100);
            const itemInUsePct = Math.round((combo.in_use / comboTotal) * 100);
            const itemEmptyPct = Math.round((combo.empty / comboTotal) * 100);
            const itemRetPct = Math.round((combo.returned / comboTotal) * 100);

            return (
              <div 
                key={combo.combo_id}
                className="bg-surface border border-border-default rounded-xl px-3.5 py-2.5 shadow-elevation-1 hover:border-border-default hover:shadow-xs transition-[transform,opacity,box-shadow,border-color] flex flex-col xl:flex-row xl:items-center justify-between gap-2.5"
              >
                {/* Left: SKU Info */}
                <div className="flex items-center gap-2.5 min-w-[220px] shrink-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-text-primary tracking-tight">
                        {combo.display_name}
                      </span>
                      <span className="text-[9px] font-bold text-text-secondary uppercase bg-subtle px-1.5 py-0.2 rounded border border-border-default font-mono shrink-0">
                        {connectionType}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase shrink-0 border ${
                        isLoan 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {isLoan ? (isMs ? 'Pinjaman' : 'Loan') : (isMs ? 'Hak Milik' : 'Private')}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted font-mono mt-0.5">
                      {isMs ? 'Armada:' : 'Fleet:'} <strong className="text-text-primary font-bold">{combo.total}</strong> {isMs ? 'unit' : 'units'}
                      <span className="mx-1 text-slate-300">•</span>
                      <span className="text-blue-700 font-semibold">{itemInUsePct}% {isMs ? 'Aktif' : 'Active'}</span>
                    </div>
                  </div>
                </div>

                {/* Center: 4-Stage Connected Compact Pipeline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 flex-1 max-w-2xl">
                  
                  {/* Stage 1: Store Available */}
                  <div 
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                    title={`${isMs ? 'Stok Stor (Tersedia)' : 'Store Available'}: ${combo.available} (${itemAvailPct}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-emerald-400 dark:text-emerald-300 font-bold truncate">
                        {isMs ? 'Stor' : 'Store'}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono tabular-nums text-emerald-400 dark:text-emerald-300 font-bold shrink-0">
                      {combo.available}
                    </span>
                  </div>

                  {/* Stage 2: Ward In Use */}
                  <div 
                    className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                    title={`${isMs ? 'Sedang Digunakan di Wad' : 'Ward In Use'}: ${combo.in_use} (${itemInUsePct}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-blue-400 dark:text-blue-300 font-bold truncate">
                        {isMs ? 'Di Wad' : 'In Use'}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono tabular-nums text-blue-400 dark:text-blue-300 font-bold shrink-0">
                      {combo.in_use}
                    </span>
                  </div>

                  {/* Stage 3: Empty Holding Area */}
                  <div 
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                    title={`${isMs ? 'Silinder Kosong' : 'Depleted Empty'}: ${combo.empty} (${itemEmptyPct}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-amber-400 dark:text-amber-300 font-bold truncate">
                        {isMs ? 'Kosong' : 'Empty'}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono tabular-nums text-amber-400 dark:text-amber-300 font-bold shrink-0">
                      {combo.empty}
                    </span>
                  </div>

                  {/* Stage 4: Supplier Returned */}
                  <div 
                    className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1.5"
                    title={`${isMs ? 'Pulang ke Pembekal' : 'Supplier Returned'}: ${combo.returned} (${itemRetPct}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-indigo-400 dark:text-indigo-300 font-bold truncate">
                        {isMs ? 'Pembekal' : 'Supplier'}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono tabular-nums text-indigo-400 dark:text-indigo-300 font-bold shrink-0">
                      {combo.returned}
                    </span>
                  </div>
                </div>

                {/* Right: Proportional Ratio Bar & Compact Actions */}
                <div className="flex items-center gap-2.5 shrink-0 justify-end">
                  {/* Ratio bar */}
                  <div className="hidden 2xl:flex items-center gap-1.5" title={`Stor: ${itemAvailPct}%, Wad: ${itemInUsePct}%, Kosong: ${itemEmptyPct}%, Pembekal: ${itemRetPct}%`}>
                    <div className="w-16 h-1.5 bg-subtle rounded-full flex overflow-hidden border border-border-default">
                      {combo.available > 0 && <div style={{ width: `${itemAvailPct}%` }} className="bg-emerald-500 h-full" />}
                      {combo.in_use > 0 && <div style={{ width: `${itemInUsePct}%` }} className="bg-blue-600 h-full" />}
                      {combo.empty > 0 && <div style={{ width: `${itemEmptyPct}%` }} className="bg-amber-500 h-full" />}
                      {combo.returned > 0 && <div style={{ width: `${itemRetPct}%` }} className="bg-indigo-600 h-full" />}
                    </div>
                  </div>

                  {/* Compact Actions */}
                  <div className="flex items-center gap-1.5">
                    {onQuickIssue && (
                      <button
                        type="button"
                        onClick={() => onQuickIssue(combo)}
                        disabled={combo.available <= 0}
                        className="px-2.5 py-1 bg-[#008f76] hover:bg-[#007a65] disabled:opacity-30 text-white rounded-md text-[11px] font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
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
                        className="px-2.5 py-1 bg-surface hover:bg-subtle/50 disabled:opacity-30 text-text-secondary border border-border-default rounded-md text-[11px] font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                        title={isMs ? "Rekod Kosong" : "Mark Depleted"}
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>{isMs ? 'Kosong' : 'Deplete'}</span>
                      </button>
                    )}
                    {onQuickCreateReturn && (
                      <button
                        type="button"
                        onClick={() => onQuickCreateReturn(combo)}
                        disabled={combo.empty <= 0}
                        className="px-2.5 py-1 bg-surface hover:bg-subtle/50 disabled:opacity-30 text-text-secondary border border-border-default rounded-md text-[11px] font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                        title={isMs ? "Supplier Return Form" : "Create Return Doc"}
                      >
                        <Truck className="w-3 h-3 text-indigo-600" />
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
            const isPinIndex = isCylinderPinIndex(combo);
            const connectionType = isPinIndex ? 'Pin Index (PI)' : 'Bullnose (BN)';

            const comboTotal = combo.total > 0 ? combo.total : 1;
            const availPercent = Math.round((combo.available / comboTotal) * 100);
            const inUsePercent = Math.round((combo.in_use / comboTotal) * 100);
            const emptyPercent = Math.round((combo.empty / comboTotal) * 100);
            const returnedPercent = Math.round((combo.returned / comboTotal) * 100);

            return (
              <div
                key={combo.combo_id}
                className="bg-surface border border-border-default rounded-xl p-4 shadow-elevation-1 hover:border-border-default hover:shadow-xs transition-[transform,opacity,box-shadow,border-color] flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3 pb-2.5 border-b border-border-subtle">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-text-primary tracking-tight truncate">
                        {combo.display_name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold text-text-muted uppercase font-mono bg-subtle px-1.5 py-0.2 rounded border border-border-default">
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
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {isLoan ? (isMs ? 'Pinjaman' : 'Loan') : (isMs ? 'Hak Milik' : 'Private')}
                    </span>
                  </div>

                  {/* 4 Quadrants (Compact) */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold text-[10px]">{isMs ? 'Stor' : 'Store'}</span>
                        <span className="text-[9px] font-mono text-emerald-600 font-bold">{availPercent}%</span>
                      </div>
                      <span className="text-lg font-black text-emerald-400 dark:text-emerald-300 font-bold tabular-nums font-mono leading-none block mt-1">{combo.available}</span>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 px-2.5 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 font-bold text-[10px]">{isMs ? 'Di Wad' : 'In Use'}</span>
                        <span className="text-[9px] font-mono text-blue-600 font-bold">{inUsePercent}%</span>
                      </div>
                      <span className="text-lg font-black text-blue-400 dark:text-blue-300 font-bold tabular-nums font-mono leading-none block mt-1">{combo.in_use}</span>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-bold text-[10px]">{isMs ? 'Kosong' : 'Empty'}</span>
                        <span className="text-[9px] font-mono text-amber-600 font-bold">{emptyPercent}%</span>
                      </div>
                      <span className="text-lg font-black text-amber-400 dark:text-amber-300 font-bold tabular-nums font-mono leading-none block mt-1">{combo.empty}</span>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-400 font-bold text-[10px]">{isMs ? 'Pulang' : 'Returned'}</span>
                        <span className="text-[9px] font-mono text-indigo-600 font-bold">{returnedPercent}%</span>
                      </div>
                      <span className="text-lg font-black text-indigo-400 dark:text-indigo-300 font-bold tabular-nums font-mono leading-none block mt-1">{combo.returned}</span>
                    </div>
                  </div>

                  {/* Proportional Ratio Bar */}
                  {combo.total > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-text-muted font-semibold">
                        <span>{isMs ? 'Nisbah Armada' : 'Fleet Ratio'}</span>
                        <span className="font-mono text-text-secondary">{combo.total} total</span>
                      </div>
                      <div className="w-full h-1.5 bg-subtle rounded-full flex overflow-hidden border border-border-default">
                        {combo.available > 0 && <div style={{ width: `${availPercent}%` }} className="bg-emerald-500 h-full" />}
                        {combo.in_use > 0 && <div style={{ width: `${inUsePercent}%` }} className="bg-blue-600 h-full" />}
                        {combo.empty > 0 && <div style={{ width: `${emptyPercent}%` }} className="bg-amber-500 h-full" />}
                        {combo.returned > 0 && <div style={{ width: `${returnedPercent}%` }} className="bg-indigo-600 h-full" />}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons (Compact & Icon-assisted) */}
                <div className="pt-2.5 border-t border-border-subtle flex items-center gap-1.5">
                  {onQuickIssue && (
                    <button
                      type="button"
                      onClick={() => onQuickIssue(combo)}
                      disabled={combo.available <= 0}
                      className="flex-1 py-1.5 px-2 bg-[#008f76] hover:bg-[#007a65] disabled:opacity-30 text-white rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isMs ? 'Bekal' : 'Issue'}</span>
                    </button>
                  )}
                  {onQuickScanEmpty && (
                    <button
                      type="button"
                      onClick={() => onQuickScanEmpty(combo)}
                      disabled={combo.in_use <= 0}
                      className="flex-1 py-1.5 px-2 bg-surface hover:bg-subtle/50 disabled:opacity-30 text-text-secondary border border-border-default rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isMs ? 'Kosong' : 'Deplete'}</span>
                    </button>
                  )}
                  {onQuickCreateReturn && (
                    <button
                      type="button"
                      onClick={() => onQuickCreateReturn(combo)}
                      disabled={combo.empty <= 0}
                      className="flex-1 py-1.5 px-2 bg-surface hover:bg-subtle/50 disabled:opacity-30 text-text-secondary border border-border-default rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
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
      {/* ========================================================================= */}
      {/* VIEW 3: DENSE DATA MATRIX TABLE & ADAPTIVE MOBILE CARDS                   */}
      {/* ========================================================================= */}
      {viewMode === 'table' && filteredData.length > 0 && (
        <div className="space-y-3">
          {/* Mobile-Friendly Adaptive Cards (Zero Horizontal Scroll on Mobile Screens) */}
          <div className="md:hidden space-y-2.5">
            {filteredData.map((combo) => {
              const isLoan = combo.display_name.toLowerCase().includes('loan');
              const isPinIndex = isCylinderPinIndex(combo);
              const connectionType = isPinIndex ? 'Pin Index (PI)' : 'Bullnose (BN)';

              return (
                <div 
                  key={combo.combo_id}
                  className="bg-surface border border-border-default rounded-xl p-3.5 shadow-elevation-1 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text-primary tracking-tight truncate">
                        {combo.display_name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono font-medium text-text-secondary bg-subtle px-1.5 py-0.5 rounded border border-border-default">
                          {connectionType}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          isLoan ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {isLoan ? (isMs ? 'Pinjaman' : 'Loan') : (isMs ? 'Hak Milik' : 'Private')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        {isMs ? 'Armada' : 'Fleet Total'}
                      </div>
                      <div className="text-sm font-bold font-mono text-text-primary tabular-nums">
                        {combo.total}
                      </div>
                    </div>
                  </div>

                  {/* 4-Stage Metric Grid */}
                  <div className="grid grid-cols-4 gap-1.5 py-2 px-2.5 bg-subtle/50 rounded-lg border border-border-subtle text-center">
                    <div>
                      <div className="text-[10px] font-semibold text-emerald-400">{isMs ? 'Stor' : 'Store'}</div>
                      <div className="text-xs font-bold font-mono text-emerald-400 dark:text-emerald-300 font-bold tabular-nums mt-0.5">{combo.available}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-blue-400">{isMs ? 'Di Wad' : 'In Use'}</div>
                      <div className="text-xs font-bold font-mono text-blue-400 dark:text-blue-300 font-bold tabular-nums mt-0.5">{combo.in_use}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-amber-400">{isMs ? 'Kosong' : 'Empty'}</div>
                      <div className="text-xs font-bold font-mono text-amber-400 dark:text-amber-300 font-bold tabular-nums mt-0.5">{combo.empty}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-indigo-400">{isMs ? 'Pulang' : 'Supplier'}</div>
                      <div className="text-xs font-bold font-mono text-indigo-400 dark:text-indigo-300 font-bold tabular-nums mt-0.5">{combo.returned}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {onQuickIssue && (
                      <button
                        type="button"
                        onClick={() => onQuickIssue(combo)}
                        disabled={combo.available <= 0}
                        className="flex-1 py-1.5 px-2 bg-[#008f76] hover:bg-[#007a65] disabled:opacity-30 text-white rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isMs ? 'Bekal' : 'Issue'}</span>
                      </button>
                    )}
                    {onQuickScanEmpty && (
                      <button
                        type="button"
                        onClick={() => onQuickScanEmpty(combo)}
                        disabled={combo.in_use <= 0}
                        className="flex-1 py-1.5 px-2 bg-surface hover:bg-subtle/50 disabled:opacity-30 text-text-secondary border border-border-default rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isMs ? 'Kosong' : 'Deplete'}</span>
                      </button>
                    )}
                    {onQuickCreateReturn && (
                      <button
                        type="button"
                        onClick={() => onQuickCreateReturn(combo)}
                        disabled={combo.empty <= 0}
                        className="flex-1 py-1.5 px-2 bg-surface hover:bg-subtle/50 disabled:opacity-30 text-text-secondary border border-border-default rounded-lg text-xs font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isMs ? 'Pulang' : 'Return'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (Sticky First Column for Effortless Readability) */}
          <div className="hidden md:block bg-surface border border-border-default rounded-xl shadow-elevation-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead className="bg-subtle/50 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-default">
                  <tr>
                    <th className="sticky left-0 z-20 bg-subtle/50 px-4 py-2.5 font-bold shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] border-r border-border-default">{isMs ? 'Jenis Silinder' : 'Cylinder SKU'}</th>
                    <th className="px-4 py-2.5 font-bold">{isMs ? 'Injap' : 'Valve'}</th>
                    <th className="px-4 py-2.5 font-bold">{isMs ? 'Kontrak' : 'Contract'}</th>
                    <th className="px-4 py-2.5 font-bold text-emerald-400 text-center">{isMs ? 'Stor' : 'Store'}</th>
                    <th className="px-4 py-2.5 font-bold text-blue-700 text-center">{isMs ? 'Di Wad' : 'In Use'}</th>
                    <th className="px-4 py-2.5 font-bold text-amber-400 text-center">{isMs ? 'Kosong' : 'Empty'}</th>
                    <th className="px-4 py-2.5 font-bold text-indigo-400 text-center">{isMs ? 'Pulang' : 'Returned'}</th>
                    <th className="px-4 py-2.5 font-bold text-center">{isMs ? 'Armada' : 'Fleet Total'}</th>
                    <th className="px-4 py-2.5 font-bold text-right">{isMs ? 'Tindakan' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredData.map((combo) => {
                    const isLoan = combo.display_name.toLowerCase().includes('loan');
                    const isPinIndex = isCylinderPinIndex(combo);
                    const connectionType = isPinIndex ? 'Pin Index (PI)' : 'Bullnose (BN)';

                    return (
                      <tr key={combo.combo_id} className="hover:bg-subtle/50 transition-colors group">
                        <td className="sticky left-0 z-10 bg-surface group-hover:bg-subtle/50 px-4 py-2.5 font-bold text-text-primary shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] border-r border-border-default">{combo.display_name}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-text-secondary">{connectionType}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                            isLoan ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isLoan ? (isMs ? 'Pinjaman' : 'Loan') : (isMs ? 'Hak Milik' : 'Private')}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold text-emerald-400 text-xs tabular-nums font-mono text-center">{combo.available}</td>
                        <td className="px-4 py-2.5 font-bold text-blue-700 text-xs tabular-nums font-mono text-center">{combo.in_use}</td>
                        <td className="px-4 py-2.5 font-bold text-amber-400 text-xs tabular-nums font-mono text-center">{combo.empty}</td>
                        <td className="px-4 py-2.5 font-bold text-indigo-400 text-xs tabular-nums font-mono text-center">{combo.returned}</td>
                        <td className="px-4 py-2.5 font-bold text-text-primary text-xs tabular-nums font-mono text-center">{combo.total}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onQuickIssue && (
                              <button
                                type="button"
                                onClick={() => onQuickIssue(combo)}
                                disabled={combo.available <= 0}
                                className="px-2.5 py-1 bg-[#008f76] hover:bg-[#007a65] disabled:opacity-25 text-white rounded-md text-[11px] font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 cursor-pointer disabled:cursor-not-allowed"
                              >
                                {isMs ? 'Bekal' : 'Issue'}
                              </button>
                            )}
                            {onQuickScanEmpty && (
                              <button
                                type="button"
                                onClick={() => onQuickScanEmpty(combo)}
                                disabled={combo.in_use <= 0}
                                className="px-2.5 py-1 bg-surface hover:bg-subtle/50 disabled:opacity-25 text-text-secondary border border-border-default rounded-md text-[11px] font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 cursor-pointer disabled:cursor-not-allowed"
                              >
                                {isMs ? 'Kosong' : 'Deplete'}
                              </button>
                            )}
                            {onQuickCreateReturn && (
                              <button
                                type="button"
                                onClick={() => onQuickCreateReturn(combo)}
                                disabled={combo.empty <= 0}
                                className="px-2.5 py-1 bg-surface hover:bg-subtle/50 disabled:opacity-25 text-text-secondary border border-border-default rounded-md text-[11px] font-semibold transition-[transform,opacity,box-shadow,border-color] shadow-elevation-1 cursor-pointer disabled:cursor-not-allowed"
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
        </div>
      )}
    </div>
  );
};

