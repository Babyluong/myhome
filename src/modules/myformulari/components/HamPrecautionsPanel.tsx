import React, { useState } from 'react'
import { Flame, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Lock, Users, Activity, AlertOctagon } from 'lucide-react'
import { HAMCategory, HAMRiskLevel } from '../types/formulariTypes'

interface HamPrecautionsPanelProps {
  hamCategory: HAMCategory
  riskLevel: HAMRiskLevel
  precautions?: string[]
  drugName: string
}

export const HamPrecautionsPanel: React.FC<HamPrecautionsPanelProps> = ({
  hamCategory,
  riskLevel,
  precautions = [],
  drugName
}) => {
  const [isOpen, setIsOpen] = useState(true)

  const isCritical = riskLevel === 'CRITICAL'

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors duration-150 ${
      isCritical ? 'border-rose-300 bg-rose-500/10 shadow-sm' : 'border-amber-300 bg-amber-500/10 shadow-sm'
    }`}>
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 cursor-pointer flex items-center justify-between transition-colors ${
          isCritical ? 'bg-rose-100/80 hover:bg-rose-100' : 'bg-amber-100/80 hover:bg-amber-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl text-white ${isCritical ? 'bg-rose-600' : 'bg-amber-600'}`}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-bold uppercase tracking-wider ${isCritical ? 'text-rose-400 dark:text-rose-300 font-bold' : 'text-amber-400 dark:text-amber-300 font-bold'}`}>
                Protokol Keselamatan High Alert Medication (HAM) — KKM
              </h4>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                RISIKO {riskLevel}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Kategori: <strong className="text-text-primary">{hamCategory}</strong>
            </p>
          </div>
        </div>

        <button className="text-text-muted hover:text-text-primary p-1">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Content Body */}
      {isOpen && (
        <div className="p-5 space-y-4">
          <div className="bg-surface backdrop-blur-sm p-4 rounded-xl border border-rose-500/20 text-xs leading-relaxed text-text-secondary">
            <p className="font-semibold text-rose-400 dark:text-rose-300 font-bold mb-1 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Garis Panduan Penggunaan Selamat Ubat Berisiko Tinggi (KKM Edisi Ke-2):</span>
            </p>
            <p>
              Ubat ini berpotensi menyebabkan kemudaratan serius atau kematian kepada pesakit sekiranya berlaku kesilapan dalam pemilihan dos, penyediaan, pelarutan, atau pentadbiran.
            </p>
          </div>

          {/* Core Mandated KKM Checkpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-surface rounded-xl border border-border-default shadow-xs flex items-start gap-2.5">
              <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-text-primary block font-semibold">Independent Double-Checking (IDC)</strong>
                <span className="text-text-muted">
                  Dua anggota kesihatan bertauliah wajib menyemak dos, nama pesakit, laluan, dan pengiraan kadar pam secara berasingan.
                </span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border-default shadow-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-text-primary block font-semibold">Red Warning Label</strong>
                <span className="text-text-muted">
                  Bekas ubat, picagari, dan beg infusi mestilah ditampal dengan pelekat merah khas "HIGH ALERT MEDICATION".
                </span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border-default shadow-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-text-primary block font-semibold">Penyimpanan Terkawal</strong>
                <span className="text-text-muted">
                  Stored in locked chiller / cabinet with restricted access. Limit concentration variety in ward stock.
                </span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border-default shadow-xs flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-text-primary block font-semibold">Pam Infusi Elektronik</strong>
                <span className="text-text-muted">
                  Wajib menggunakan pam infusi volumetrik / pam picagari bersensor tekanan (elakkan infusi secara graviti bebas).
                </span>
              </div>
            </div>
          </div>

          {/* Specific Precautions for this Drug */}
          {precautions.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Specific Precautions for {drugName}:
              </h5>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {precautions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-border-default">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
