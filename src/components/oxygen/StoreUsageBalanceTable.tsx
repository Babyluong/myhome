import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  RefreshCw, 
  Layers, 
  Building2, 
  Truck, 
  Boxes, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { isCylinderPinIndex } from './StoreBalanceGrid';

export interface UsageLedgerRow {
  combo_id: string;
  size_id?: string;
  type_id?: string;
  display_name: string;
  opening: number;
  received: number;
  issued: number;
  returned: number;
  closing: number;
  store_empty?: number;
  in_use?: number;
  with_supplier?: number;
  total_fleet?: number;
}

export interface StoreUsageBalanceTableProps {
  data: UsageLedgerRow[];
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const StoreUsageBalanceTable: React.FC<StoreUsageBalanceTableProps> = ({
  data,
  startDate,
  endDate,
  onDateChange,
  isLoading,
  onRefresh,
}) => {
  const { language } = useLanguage();
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Compute 360-degree Fleet Totals across all locations
  const telemetryTotals = useMemo(() => {
    return (data || []).reduce(
      (acc, curr) => {
        const storeAvailable = curr.closing || 0;
        const inUse = curr.in_use || 0;
        const withSupplier = curr.with_supplier || 0;
        const storeEmpty = curr.store_empty || 0;
        const fleet = curr.total_fleet || (storeAvailable + inUse + withSupplier + storeEmpty);

        return {
          storeAvailable: acc.storeAvailable + storeAvailable,
          inUse: acc.inUse + inUse,
          withSupplier: acc.withSupplier + withSupplier,
          storeEmpty: acc.storeEmpty + storeEmpty,
          totalFleet: acc.totalFleet + fleet,
        };
      },
      { storeAvailable: 0, inUse: 0, withSupplier: 0, storeEmpty: 0, totalFleet: 0 }
    );
  }, [data]);

  return (
    <div className="space-y-6">
      {/* 360° TOTAL FLEET & STORE INVENTORY TELEMETRY PILL CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Store Available (Full Ready) */}
        <div className="bg-surface bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {language === 'ms' ? 'Sedia Ada di Stor' : 'Store Available (Full)'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tabular-nums">
            {telemetryTotals.storeAvailable}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">
            {language === 'ms' ? 'Gas penuh sedia dikeluarkan' : 'Full cylinders ready to issue'}
          </p>
        </div>

        {/* Clinical Wards in Use */}
        <div className="bg-surface bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {language === 'ms' ? 'Sedang Diguna Wad' : 'In Clinical Units'}
            </span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-400 tabular-nums">
            {telemetryTotals.inUse}
          </div>
          <p className="text-[10px] text-blue-600 font-semibold">
            {language === 'ms' ? 'Di wad, ETD & jabatan' : 'In wards & departments'}
          </p>
        </div>

        {/* With Supplier (Refilling) */}
        <div className="bg-surface bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 rounded-2xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {language === 'ms' ? 'Di Kilang Pembekal' : 'With Supplier'}
            </span>
            <Truck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-indigo-400 tabular-nums">
            {telemetryTotals.withSupplier}
          </div>
          <p className="text-[10px] text-purple-600 font-semibold">
            {language === 'ms' ? 'Dalam pengisian gas' : 'Under refilling cycle'}
          </p>
        </div>

        {/* Store Empty (Waiting pickup) */}
        <div className="bg-surface bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {language === 'ms' ? 'Kosong di Stor' : 'Store Empty'}
            </span>
            <Boxes className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-400 tabular-nums">
            {telemetryTotals.storeEmpty}
          </div>
          <p className="text-[10px] text-amber-600 font-semibold">
            {language === 'ms' ? 'Menunggu lori pembekal' : 'Awaiting supplier pickup'}
          </p>
        </div>

        {/* Total Hospital Holding Quota */}
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-3.5 shadow-sm space-y-1 border border-slate-700">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {language === 'ms' ? 'Total Custody' : 'Total Hospital Fleet'}
            </span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {telemetryTotals.totalFleet}
          </div>
          <p className="text-[10px] text-teal-300 font-semibold">
            {language === 'ms' ? 'Kuota aset keseluruhan' : 'Total circular quota'}
          </p>
        </div>
      </div>

      {/* ACTION & DATE RANGE TOOLBAR */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-surface border border-white/40 rounded-3xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-text-secondary font-bold text-xs bg-white/70 px-3 py-2 rounded-xl border border-border-default shadow-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{language === 'ms' ? 'Tempoh Pergerakan:' : 'Movement Period:'}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onDateChange(e.target.value, endDate)}
              className="px-3 py-1.5 bg-surface border border-border-default rounded-xl text-xs text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent-base/20"
            />
            <span className="text-slate-400 font-bold text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onDateChange(startDate, e.target.value)}
              className="px-3 py-1.5 bg-surface border border-border-default rounded-xl text-xs text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent-base/20"
            />
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-surface hover:bg-subtle border border-border-default text-text-secondary rounded-xl shadow-xs transition-[transform,opacity,box-shadow,border-color] active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}
        </div>

        {/* Formula Information Trigger */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="px-3 py-1.5 bg-surface hover:bg-subtle border border-border-default text-text-secondary hover:text-text-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-[transform,opacity,box-shadow,border-color] shadow-xs"
            title="Penjelasan Formula Lejar"
          >
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'ms' ? 'Formula Imbangan' : 'Ledger Formula'}</span>
          </button>
        </div>
      </div>

      {/* FORMULA EXPLANATION BANNER (COLLAPSIBLE) */}
      {showFormulaInfo && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-400 dark:text-blue-300 font-bold space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-black text-blue-400 dark:text-blue-300 font-bold">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Tatacara Imbangan Lejar Stor Oksigen (Pekeliling TPS & Hospital Standard):</span>
          </div>
          <p className="leading-relaxed">
            • <strong>Baki Sedia Ada di Stor (Store Ready):</strong> Mengira hanya tabung berisi gas yang ada secara fizikal di Stor Farmasi untuk dikeluarkan kepada pesakit.
            <br />
            • <strong>Formula Matematik:</strong> <code className="bg-surface px-2 py-0.5 rounded font-mono text-blue-400 font-bold">Baki Pembukaan + Refill Diterima - Pengeluaran ke Wad = Baki Sedia Ada Stor</code>.
            <br />
            • <strong>Pemulangan ke Pembekal:</strong> Merupakan pemindahan tabung kosong ke kilang pembekal bagi tujuan pengisian semula gas. Ia dicatatkan secara berasingan dan <em>tidak memotong baki tabung penuh stor buat kali kedua</em>.
          </p>
        </div>
      )}

      {/* USAGE TABLE */}
      <div className="bg-surface border border-border-default rounded-2xl shadow-xs overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-surface z-20 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Mobile View: Cards Layout */}
        <div className="block lg:hidden divide-y divide-border-default text-text-secondary font-medium">
          {data.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold">
              Tiada rekod imbangan stor dijumpai.
            </div>
          ) : (
            data.map((row) => (
              <div key={row.combo_id} className="p-5 space-y-3.5 bg-white/20">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <div>
                    <div className="font-black text-text-primary text-sm">{row.display_name}</div>
                    <div className="text-[10px] text-text-muted font-semibold">
                      Pegangan: {row.total_fleet || (row.closing + (row.in_use || 0) + (row.with_supplier || 0))} tabung
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl text-xs font-black inline-block shadow-sm">
                      Sedia Stor: {row.closing}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="space-y-0.5 bg-subtle/50 p-2 rounded-xl border border-border-subtle">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Baki Pembukaan</span>
                    <span className="font-bold text-text-primary">{row.opening}</span>
                  </div>
                  <div className="space-y-0.5 bg-subtle/50 p-2 rounded-xl border border-border-subtle">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Refill Diterima</span>
                    <span className="font-bold text-emerald-600">+{row.received}</span>
                  </div>
                  <div className="space-y-0.5 bg-subtle/50 p-2 rounded-xl border border-border-subtle">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Keluar ke Wad</span>
                    <span className="font-bold text-blue-600">-{row.issued}</span>
                  </div>
                  <div className="space-y-0.5 bg-subtle/50 p-2 rounded-xl border border-border-subtle">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Hantar Pembekal</span>
                    <span className="font-bold text-purple-600">{row.returned} (Kosong)</span>
                  </div>
                </div>

                {/* Mobile Fleet Pipeline breakdown */}
                <div className="p-2.5 bg-subtle/50 rounded-xl border border-border-subtle flex items-center justify-between text-[11px] font-bold text-text-secondary">
                  <span>Di Wad: <strong className="text-blue-700">{row.in_use || 0}</strong></span>
                  <span>Di Pembekal: <strong className="text-purple-700">{row.with_supplier || 0}</strong></span>
                  <span>Kosong Stor: <strong className="text-amber-700">{row.store_empty || 0}</strong></span>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Desktop View: Standard Dense Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-default bg-subtle/50 text-text-secondary font-bold text-[11px] uppercase tracking-wider">
                <th className="py-4 px-6">Jenis Silinder Oksigen</th>
                <th className="py-4 px-4 text-center">Baki Pembukaan</th>
                <th className="py-4 px-4 text-center">Refill Diterima</th>
                <th className="py-4 px-4 text-center">Pengeluaran Wad</th>
                <th className="py-4 px-5 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-x border-emerald-500/20 font-bold">
                  Sedia Ada di Stor (Penuh)
                </th>
                <th className="py-4 px-4 text-center">Pemulangan Pembekal</th>
                <th className="py-4 px-4 text-center">Lokasi & Pegangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default text-text-secondary font-medium text-xs">
              {data.map((row) => {
                const isPinIndex = isCylinderPinIndex(row);
                const isLoan = row.display_name.toLowerCase().includes('loan');

                return (
                  <tr
                    key={row.combo_id}
                    className="hover:bg-subtle/50 transition-colors duration-200"
                  >
                    {/* Cylinder Name & Tag */}
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-text-primary text-sm">{row.display_name}</div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isPinIndex ? 'bg-blue-500/10 text-blue-700 border border-blue-100' : 'bg-indigo-500/10 text-indigo-700 border border-indigo-100'
                        }`}>
                          {isPinIndex ? 'Pin Index (PI)' : 'Bullnose (BN)'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isLoan ? 'bg-amber-500/10 text-amber-700 border border-amber-100' : 'bg-emerald-500/10 text-emerald-700 border border-emerald-100'
                        }`}>
                          {isLoan ? 'Pinjaman (Loan)' : 'Aset Kerajaan'}
                        </span>
                      </div>
                    </td>

                    {/* Opening Balance */}
                    <td className="py-4 px-4 text-center font-bold text-text-primary tabular-nums">
                      {row.opening}
                    </td>

                    {/* Refills Received */}
                    <td className="py-4 px-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{row.received}
                    </td>

                    {/* Issued to Units */}
                    <td className="py-4 px-4 text-center font-extrabold text-blue-600 dark:text-sky-400 tabular-nums">
                      -{row.issued}
                    </td>

                    {/* Store Ready Balance (Closing Store Available) */}
                    <td className="py-4 px-5 text-center bg-emerald-500/5 border-x border-emerald-500/20">
                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-xl font-black text-sm shadow-xs inline-block tabular-nums">
                        {row.closing}
                      </span>
                      <span className="block text-[10px] text-emerald-700 dark:text-emerald-300 font-bold pt-0.5">
                        Tabung Sedia Ada
                      </span>
                    </td>

                    {/* Returned to Supplier (Empties) */}
                    <td className="py-4 px-4 text-center">
                      <div className="font-extrabold text-purple-600 dark:text-purple-400 tabular-nums">
                        {row.returned}
                      </div>
                      <span className="text-[10px] text-text-muted font-bold block">
                        Silinder Kosong
                      </span>
                    </td>

                    {/* Multi-Location Holding Breakdown */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col gap-1 text-[11px] font-bold bg-subtle/50 border border-border-default px-2.5 py-1.5 rounded-xl text-left min-w-[130px]">
                        <span className="text-blue-600 dark:text-sky-400">Wad: {row.in_use || 0}</span>
                        <span className="text-purple-600 dark:text-purple-400">Pembekal: {row.with_supplier || 0}</span>
                        <span className="text-text-primary border-t border-border-default pt-0.5 font-bold">
                          Jumlah: {row.total_fleet || (row.closing + (row.in_use || 0) + (row.with_supplier || 0))}
                        </span>
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
  );
};


