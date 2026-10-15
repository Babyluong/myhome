// src/modules/myformulari/components/AntidoteDetailModal.tsx
import React from 'react'
import { X, Building2, Syringe, Activity, HeartPulse, Thermometer, Printer, FileText, Sparkles, PhoneCall, CheckCircle2, AlertOctagon, Layers } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-surface rounded-2xl shadow-elevation-2 border border-border-default flex flex-col overflow-hidden text-text-primary"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative p-6 bg-surface border-b border-border-default text-text-primary">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <AntidoteStockBadge tier={antidote.stockTier} size="md" />
                <span className="px-2.5 py-0.5 text-xs font-medium bg-subtle text-text-secondary rounded-full border border-border-default">
                  {antidote.toxicAgentCategory}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-accent-base/10 text-accent-base rounded-full border border-accent-base/20">
                  Kat Preskriber: {antidote.fukkmPrescriberCategory}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                <span>{antidote.toxicAgent}</span>
              </h2>

              <p className="text-sm text-text-secondary font-medium">
                Antidot Utama: <strong className="text-text-primary font-bold">{antidote.primaryAntidote}</strong>
                {antidote.brandNames && antidote.brandNames.length > 0 && (
                  <span className="text-text-muted ml-1">({antidote.brandNames.join(', ')})</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="p-2 bg-subtle hover:bg-hover text-text-secondary hover:text-text-primary border border-border-default rounded-xl transition-colors cursor-pointer"
                title="Cetak Protokol Ini"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-subtle hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20 text-text-muted rounded-xl border border-border-default transition-colors cursor-pointer"
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
            <div className="p-4 bg-rose-500/10 border-l-4 border-rose-500 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                <span>Amaran Keselamatan & Kontraindikasi Kritikal</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-400 dark:text-rose-300 font-bold dark:text-rose-300">
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
            <div className="p-4 bg-subtle/50 rounded-xl border border-border-default space-y-2">
              <div className="font-bold text-text-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-base" />
                <span>Contoh Pendedahan / Ubat Terlibat:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {antidote.commonExposureExamples.map((ex, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-surface border border-border-default rounded-lg text-text-secondary font-medium"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-subtle/50 rounded-xl border border-border-default space-y-2">
              <div className="font-bold text-text-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>Lokasi Penyimpanan Stok Hospital KKM:</span>
              </div>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                {antidote.stockLocations.map((loc, idx) => (
                  <li key={idx}>{loc}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mechanism of Action */}
          <div className="p-4 bg-subtle rounded-xl border border-border-default space-y-1.5">
            <div className="font-semibold text-text-primary flex items-center gap-2 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-accent-base" />
              <span>Mekanisme Tindakan Pembalikan (Mechanism of Reversal)</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-normal">
              {antidote.mechanismOfReversal}
            </p>
          </div>

          {/* Dosing & Administration Master Panel */}
          <div className="p-5 bg-surface rounded-xl border border-border-default shadow-elevation-1 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-accent-base" />
                <h3 className="text-base font-bold text-text-primary">
                  Protokol Dos & Cara Pemberian Rasmi KKM
                </h3>
              </div>
              <span className="text-[11px] font-medium text-text-muted">
                Laluan: {antidote.dosingProtocol.dilutionAndRoute}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Adult Initial */}
              <div className="p-3 bg-subtle rounded-lg border border-border-default">
                <strong className="block text-accent-base font-semibold mb-1">
                  Dos Dewasa (Adult Dose):
                </strong>
                <p className="text-text-secondary leading-relaxed">
                  {antidote.dosingProtocol.adultInitial}
                </p>
              </div>

              {/* Adult Maintenance if exists */}
              {antidote.dosingProtocol.adultMaintenance && (
                <div className="p-3 bg-subtle rounded-lg border border-border-default">
                  <strong className="block text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                    Dos Penyelenggaraan / Titrasi (Maintenance / Infusion):
                  </strong>
                  <p className="text-text-secondary leading-relaxed">
                    {antidote.dosingProtocol.adultMaintenance}
                  </p>
                </div>
              )}

              {/* Paediatric Dose */}
              {antidote.dosingProtocol.pediatricInitial && (
                <div className="p-3 bg-subtle rounded-lg border border-border-default">
                  <strong className="block text-accent-base font-semibold mb-1">
                    Dos Pediatrik / Kanak-Kanak (Paediatric Protocol):
                  </strong>
                  <p className="text-text-secondary leading-relaxed">
                    {antidote.dosingProtocol.pediatricInitial}
                  </p>
                </div>
              )}

              {/* Administration Rate & Dilution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <strong className="block text-amber-600 dark:text-amber-400 font-semibold mb-0.5">
                    Kadar Infusi / Kelajuan:
                  </strong>
                  <p className="text-text-secondary">
                    {antidote.dosingProtocol.administrationRate || 'Ikut toleransi pesakit / protokol standard.'}
                  </p>
                </div>
                <div className="p-3 bg-accent-base/5 border border-accent-base/20 rounded-xl">
                  <strong className="block text-accent-base font-semibold mb-0.5">
                    Pelarut & Pencairan:
                  </strong>
                  <p className="text-text-secondary">
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
                  className="p-5 bg-subtle text-text-primary rounded-xl border border-border-default space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-text-primary font-bold text-sm">
                    <Layers className="w-4 h-4 text-accent-base" />
                    <span>{sp.title}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{sp.description}</p>

                  {sp.items && sp.items.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {sp.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
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
          <div className="p-4 bg-subtle/50 rounded-xl border border-border-default space-y-2 text-xs">
            <div className="font-bold text-text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Petunjuk Klinikal & Ambang Keterukan (Clinical Triggers & Indications):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-text-muted">
              {antidote.clinicalTriggersAndIndications.map((trig, idx) => (
                <li key={idx} className="leading-relaxed">
                  {trig}
                </li>
              ))}
            </ul>
          </div>

          {/* Monitoring Parameters & Treatment Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-subtle/50 rounded-xl border border-border-default space-y-2">
              <div className="font-bold text-text-primary flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-sky-500" />
                <span>Parameter Pemantauan:</span>
              </div>
              <ul className="list-disc list-inside text-text-muted space-y-1">
                {antidote.monitoringAndEndpoints.parameters.map((param, idx) => (
                  <li key={idx}>{param}</li>
                ))}
              </ul>
              {antidote.monitoringAndEndpoints.frequency && (
                <p className="text-[11px] text-text-muted pt-1 italic">
                  Kekerapan: {antidote.monitoringAndEndpoints.frequency}
                </p>
              )}
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 space-y-2">
              <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sasaran Rawatan (Treatment Endpoints):</span>
              </div>
              <ul className="list-disc list-inside text-emerald-400 dark:text-emerald-300 space-y-1">
                {antidote.monitoringAndEndpoints.targetEndpoints.map((ep, idx) => (
                  <li key={idx} className="font-medium">
                    {ep}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Storage & Regulatory Metadata Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-subtle rounded-xl text-[11px] text-text-muted">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-accent-base flex-shrink-0" />
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
        <div className="p-4 bg-subtle/50 border-t border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            <span>Pusat Racun Negara: 1-800-88-8099 / 04-6570099</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-hover text-text-primary border border-border-default text-xs font-semibold rounded-xl shadow-elevation-1 transition-colors cursor-pointer"
            >
              Tutup Paparan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
