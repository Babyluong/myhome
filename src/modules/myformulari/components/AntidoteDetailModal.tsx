// src/modules/myformulari/components/AntidoteDetailModal.tsx
import React from 'react'
import {
  X,
  AlertTriangle,
  Flame,
  Clock,
  ShieldCheck,
  Building2,
  Syringe,
  Activity,
  HeartPulse,
  Thermometer,
  Printer,
  FileText,
  HelpCircle,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertOctagon,
  Lock,
  Layers
} from 'lucide-react'
import { AntidoteEntry } from '../types/antidoteTypes'
import { AntidoteStockBadge } from './AntidoteStockBadge'

interface AntidoteDetailModalProps {
  antidote: AntidoteEntry | null
  isOpen: boolean
  onClose: () => void
}

export const AntidoteDetailModal: React.FC<AntidoteDetailModalProps> = ({
  antidote,
  isOpen,
  onClose
}) => {
  if (!isOpen || !antidote) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <AntidoteStockBadge tier={antidote.stockTier} size="md" />
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/10 text-indigo-200 rounded-full border border-white/10">
                  {antidote.toxicAgentCategory}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-200 rounded-full border border-purple-500/30">
                  Kat Preskriber: {antidote.fukkmPrescriberCategory}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{antidote.toxicAgent}</span>
              </h2>

              <p className="text-sm text-indigo-200/90 font-medium">
                Antidot Utama: <strong className="text-white font-bold">{antidote.primaryAntidote}</strong>
                {antidote.brandNames && antidote.brandNames.length > 0 && (
                  <span className="text-slate-300 ml-1">({antidote.brandNames.join(', ')})</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="Cetak Protokol Ini"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Critical Alert (if any warnings) */}
          {antidote.criticalWarningsAndCautions.length > 0 && (
            <div className="p-4 bg-rose-500/10 dark:bg-rose-950/40 border-l-4 border-rose-500 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                <span>Amaran Keselamatan & Kontraindikasi Kritikal</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-900 dark:text-rose-200">
                {antidote.criticalWarningsAndCautions.map((warn, i) => (
                  <li key={i} className="leading-relaxed">
                    {warn}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grid Layout: Exposure Info & Storage Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Contoh Pendedahan / Ubat Terlibat:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {antidote.commonExposureExamples.map((ex, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>Lokasi Penyimpanan Stok Hospital KKM:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                {antidote.stockLocations.map((loc, idx) => (
                  <li key={idx}>{loc}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mechanism of Action */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
            <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Mekanisme Tindakan Pembalikan (Mechanism of Reversal)</span>
            </div>
            <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-normal">
              {antidote.mechanismOfReversal}
            </p>
          </div>

          {/* Dosing & Administration Master Panel */}
          <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Protokol Dos & Cara Pemberian Rasmi KKM
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Laluan: {antidote.dosingProtocol.dilutionAndRoute}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Adult Initial */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <strong className="block text-indigo-700 dark:text-indigo-300 font-bold mb-1">
                  Dos Dewasa (Adult Dose):
                </strong>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {antidote.dosingProtocol.adultInitial}
                </p>
              </div>

              {/* Adult Maintenance if exists */}
              {antidote.dosingProtocol.adultMaintenance && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong className="block text-teal-700 dark:text-teal-300 font-bold mb-1">
                    Dos Penyelenggaraan / Titrasi (Maintenance / Infusion):
                  </strong>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    {antidote.dosingProtocol.adultMaintenance}
                  </p>
                </div>
              )}

              {/* Paediatric Dose */}
              {antidote.dosingProtocol.pediatricInitial && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong className="block text-purple-700 dark:text-purple-300 font-bold mb-1">
                    Dos Pediatrik / Kanak-Kanak (Paediatric Protocol):
                  </strong>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    {antidote.dosingProtocol.pediatricInitial}
                  </p>
                </div>
              )}

              {/* Administration Rate & Dilution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <strong className="block text-amber-800 dark:text-amber-300 font-bold mb-0.5">
                    Kadar Infusi / Kelajuan:
                  </strong>
                  <p className="text-slate-700 dark:text-slate-300">
                    {antidote.dosingProtocol.administrationRate || 'Ikut toleransi pesakit / protokol standard.'}
                  </p>
                </div>
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                  <strong className="block text-indigo-800 dark:text-indigo-300 font-bold mb-0.5">
                    Pelarut & Pencairan:
                  </strong>
                  <p className="text-slate-700 dark:text-slate-300">
                    {antidote.dosingProtocol.dilutionAndRoute}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Protocol Step-by-Step Box (if exists) */}
          {antidote.specialProtocols && antidote.specialProtocols.length > 0 && (
            <div className="space-y-3">
              {antidote.specialProtocols.map((sp, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 space-y-3 shadow-md"
                >
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>{sp.title}</span>
                  </div>
                  <p className="text-xs text-slate-300">{sp.description}</p>

                  {sp.items && sp.items.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {sp.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Clinical Triggers & Indications */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Petunjuk Klinikal & Ambang Keterukan (Clinical Triggers & Indications):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
              {antidote.clinicalTriggersAndIndications.map((trig, idx) => (
                <li key={idx} className="leading-relaxed">
                  {trig}
                </li>
              ))}
            </ul>
          </div>

          {/* Monitoring Parameters & Treatment Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-sky-500" />
                <span>Parameter Pemantauan:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                {antidote.monitoringAndEndpoints.parameters.map((param, idx) => (
                  <li key={idx}>{param}</li>
                ))}
              </ul>
              {antidote.monitoringAndEndpoints.frequency && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 italic">
                  Kekerapan: {antidote.monitoringAndEndpoints.frequency}
                </p>
              )}
            </div>

            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sasaran Rawatan (Treatment Endpoints):</span>
              </div>
              <ul className="list-disc list-inside text-emerald-950 dark:text-emerald-200 space-y-1">
                {antidote.monitoringAndEndpoints.targetEndpoints.map((ep, idx) => (
                  <li key={idx} className="font-medium">
                    {ep}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Storage & Regulatory Metadata Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-100 dark:bg-slate-800/90 rounded-2xl text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>
                <strong>Keperluan Simpanan:</strong> {antidote.storageCondition}
              </span>
            </div>
            {antidote.mohReferenceGuide && (
              <div className="text-right italic">Rujukan: {antidote.mohReferenceGuide}</div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            <span>Pusat Racun Negara: 1-800-88-8099 / 04-6570099</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tutup Paparan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
