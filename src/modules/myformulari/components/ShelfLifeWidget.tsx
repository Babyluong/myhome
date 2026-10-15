import React from 'react'
import { Clock, Thermometer, Sun, ShieldCheck, AlertTriangle, Pill, Eye, Droplets, MapPin, CheckCircle2, AlertOctagon } from 'lucide-react'
import { ShelfLifeProtocol } from '../types/formulariTypes'

interface ShelfLifeWidgetProps {
  shelfLife: ShelfLifeProtocol
  dosageForms?: string[]
}

export const ShelfLifeWidget: React.FC<ShelfLifeWidgetProps> = ({ shelfLife, dosageForms = [] }) => {
  const cat = (shelfLife.dosageCategory || '').toLowerCase()
  const forms = dosageForms.map(f => f.toLowerCase()).join(' ')
  const isSolidOral = cat.includes('oral solid') || cat.includes('tablet') || cat.includes('kapsul') || forms.includes('tablet') || forms.includes('capsule') || forms.includes('caplet')
  const isOphthalmic = cat.includes('ophthalmic') || cat.includes('otic') || forms.includes('eye') || forms.includes('ear') || forms.includes('drop')
  const isOralLiquid = cat.includes('oral liquid') || forms.includes('syrup') || forms.includes('suspension') || forms.includes('solution')
  const isTopical = cat.includes('topical') || forms.includes('cream') || forms.includes('ointment') || forms.includes('gel')
  const isInhaler = cat.includes('inhaler') || forms.includes('inhalation') || forms.includes('inhaler') || forms.includes('mdi')
  const isInjectable = !isSolidOral && !isOphthalmic && !isOralLiquid && !isTopical && !isInhaler && (cat.includes('injectable') || forms.includes('injection') || forms.includes('vial') || forms.includes('ampoule') || forms.includes('infusion'))

  const isColdChain = shelfLife.storageConditions.temperature.includes('2-8°C') || shelfLife.storageConditions.temperature.includes('Cold Chain')

  return (
    <div className="bg-surface rounded-3xl border border-border-default shadow-xs p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-violet-600" />
          <div>
            <h4 className="text-base font-bold text-text-primary">
              Shelf Life, Storage & Preservation Protocol ({shelfLife.dosageCategory || 'Standard KKM'})
            </h4>
            <p className="text-xs text-text-muted">
              Safe storage conditions, locations, and in-use stability after opening / reconstitution
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full">
          Piawaian Rasmi KKM
        </span>
      </div>

      {/* Primary 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Intact Shelf Life */}
        <div className="p-4 rounded-2xl bg-subtle/50 border border-border-default space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Original Shelf Life (Unopened Pack)
          </span>
          <div className="text-base font-bold text-text-primary">
            {shelfLife.intactShelfLife}
          </div>
          <div className="text-xs text-text-muted flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Kekal sehingga tarikh luput kilang jika pek belum dibuka.</span>
          </div>
        </div>

        {/* 2. Storage Conditions */}
        <div className={`p-4 rounded-2xl border space-y-1 ${
          isColdChain ? 'bg-blue-500/10 border-blue-500/20' : 'bg-subtle/50 border-border-default'
        }`}>
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Storage Temperature & Conditions
          </span>
          <div className={`text-sm font-bold flex items-center gap-1.5 ${isColdChain ? 'text-blue-400 dark:text-blue-300 font-bold' : 'text-text-primary'}`}>
            <Thermometer className={`w-4 h-4 ${isColdChain ? 'text-blue-600' : 'text-text-muted'}`} />
            <span>{shelfLife.storageConditions.temperature}</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
            {shelfLife.storageConditions.protectFromLight && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-400 px-2 py-0.5 rounded font-semibold">
                <Sun className="w-3 h-3" /> Lindung Cahaya
              </span>
            )}
            {shelfLife.storageConditions.protectFromMoisture && (
              <span className="bg-slate-200/80 text-text-secondary px-2 py-0.5 rounded font-semibold">
                Lindung Kelembapan
              </span>
            )}
          </div>
        </div>

        {/* 3. Multi-dose / Opening Policy */}
        <div className="p-4 rounded-2xl bg-subtle/50 border border-border-default space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            {isSolidOral ? 'Polisi Bekas Sediaan Pepejal' : isOphthalmic ? 'Polisi Steriliti Selepas Buka' : 'Polisi Selepas Dibuka'}
          </span>
          <div className="text-sm font-bold text-text-primary">
            {shelfLife.multiDoseVialPolicy || (isSolidOral ? 'Guna Dalam 6 Bulan (Pek Botol)' : 'Standard KKM')}
          </div>
          <p className="text-[11px] text-text-muted leading-snug pt-1">
            {isSolidOral
              ? 'Pek Lepuh: Kekal sehingga tarikh luput kilang. Bekas Botol: Guna dalam 6 bulan selepas dibuka.'
              : isOphthalmic
              ? 'Wajib lupuskan selepas 28 hari dari tarikh pertama dibuka.'
              : shelfLife.multiDoseVialPolicy?.includes('28 Days')
              ? 'Catat tarikh mula tebuk. Buang selepas 28 hari.'
              : 'Satu pesakit, satu penggunaan. Buang baki serta-merta.'}
          </p>
        </div>
      </div>

      {/* DETAILED DOSAGE FORM SPECIFIC GUIDELINES */}
      {isSolidOral ? (
        <div className="space-y-4">
          {/* Where to Put / Storage Guide */}
          <div className="bg-gradient-to-br from-violet-50/70 to-purple-50/50 rounded-2xl p-5 border border-violet-200/80 space-y-3.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-700" />
              <h5 className="text-xs font-bold text-violet-950 uppercase tracking-wider">
                Medication Storage Location Guide (Where to Store):
              </h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-surface p-3.5 rounded-xl border border-violet-200/60 shadow-elevation-1 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Recommended Storage Location:
                </span>
                <p className="text-text-secondary leading-relaxed font-medium">
                  Simpan dalam almari ubat bertutup atau laci bilik pada suhu bilik terkawal (15 - 30°C). Pastikan bekas/pek asal tertutup rapat dan kering.
                </p>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-rose-500/20 shadow-elevation-1 space-y-1">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                  PROHIBITED Storage Locations:
                </span>
                <p className="text-text-secondary leading-relaxed font-medium">
                  <strong>JANGAN</strong> simpan di dalam bilik air/tandas, di tepi sinki dapur, atau di dalam kereta/kenderaan yang panas kerana kelembapan dan haba merosakkan ubat.
                </p>
              </div>
            </div>
          </div>

          {/* How to Take / Administration Guide */}
          <div className="bg-subtle/50 rounded-2xl p-5 border border-border-default space-y-3.5">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-text-secondary" />
              <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Panduan Pengambilan & Kestabilan Tablet / Kapsul:
              </h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-surface p-3.5 rounded-xl border border-border-default shadow-elevation-1 space-y-1">
                <span className="font-bold text-text-primary block">Pek Lepuh (Blister Foil Strip):</span>
                <p className="text-text-secondary leading-relaxed font-medium">
                  {shelfLife.inUseStabilityNotes?.blisterPackStability || 'Kekal stabil sehingga tarikh luput pengilang selagi kerajang timah (foil) tidak koyak, bocor atau berlubang. JANGAN keluarkan tablet lebih awal daripada pek.'}
                </p>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border-default shadow-elevation-1 space-y-1">
                <span className="font-bold text-text-primary block">Bekas Botol (Loose Tablet Bottle):</span>
                <p className="text-text-secondary leading-relaxed font-medium">
                  {shelfLife.inUseStabilityNotes?.looseBottleStability || 'Gunakan dalam tempoh 6 bulan selepas penutup botol dibuka (atau sehingga tarikh luput asal). Tutup rapat selepas setiap penggunaan dan jangan sentuh dengan tangan basah.'}
                </p>
              </div>
            </div>

            {shelfLife.storageConditions.specialStorageNote && (
              <div className="text-xs text-amber-400 dark:text-amber-300 font-bold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{shelfLife.storageConditions.specialStorageNote}</span>
              </div>
            )}
          </div>
        </div>
      ) : isOphthalmic ? (
        <div className="bg-gradient-to-br from-blue-50/60 to-cyan-50/40 rounded-2xl p-5 border border-blue-100 space-y-3.5">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-700" />
            <h5 className="text-xs font-bold text-blue-400 dark:text-blue-300 font-bold uppercase tracking-wider">
              Garis Panduan Steriliti & Storan Titisan Mata / Telinga (KKM 28-Day Rule):
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-surface p-3.5 rounded-xl border border-blue-500/20 shadow-elevation-1 space-y-1">
              <span className="font-bold text-blue-400 dark:text-blue-300 font-bold block">Polisi Buang 28 Hari Selepas Dibuka:</span>
              <p className="text-text-secondary leading-relaxed font-medium">
                {shelfLife.inUseStabilityNotes?.openedOphthalmicStability || 'Wajib lupuskan baki ubat selepas 28 HARI dari tarikh pertama penutup dibuka bagi menjamin steriliti titisan dan mengelakkan jangkitan kuman pada mata/telinga.'}
              </p>
            </div>

            <div className="bg-surface p-3.5 rounded-xl border border-blue-500/20 shadow-elevation-1 space-y-1">
              <span className="font-bold text-blue-400 dark:text-blue-300 font-bold block">Di Mana Hendak Simpan & Penjagaan:</span>
              <p className="text-text-secondary leading-relaxed font-medium">
                Simpan tegak pada suhu bilik (&lt;30°C) atau dalam peti sejuk (2-8°C) mengikut label produk. <strong>Jangan sentuh hujung penitis</strong> pada mata atau jari.
              </p>
            </div>
          </div>
        </div>
      ) : isOralLiquid ? (
        <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl p-5 border border-amber-100 space-y-3.5">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-amber-700" />
            <h5 className="text-xs font-bold text-amber-400 dark:text-amber-300 font-bold uppercase tracking-wider">
              Panduan Membancuh & Kestabilan Sirap / Suspensi Oral:
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-surface p-3.5 rounded-xl border border-amber-500/20 shadow-elevation-1 space-y-1">
              <span className="font-bold text-amber-400 dark:text-amber-300 font-bold block">Cara Bancuh Serbuk Kering (Dry Syrup):</span>
              <p className="text-text-secondary leading-relaxed font-medium">
                Goncang serbuk dalam botol dahulu. Tambahkan separuh air suling/masak sejuk, goncang kuat. Tambahkan baki air sehingga tanda garisan botol. Goncang sebelum setiap dos.
              </p>
            </div>

            <div className="bg-surface p-3.5 rounded-xl border border-amber-500/20 shadow-elevation-1 space-y-1">
              <span className="font-bold text-amber-400 dark:text-amber-300 font-bold block">Di Mana Hendak Simpan & Jangka Hayat:</span>
              <p className="text-text-secondary leading-relaxed font-medium">
                {shelfLife.inUseStabilityNotes?.reconstitutedSuspensionStability || 'Simpan dalam peti sejuk (2-8°C). Guna dalam tempoh 7 hingga 14 hari selepas dibancuh. Catat tarikh bancuh pada label botol.'}
              </p>
            </div>
          </div>
        </div>
      ) : isInjectable ? (
        <div className="bg-gradient-to-br from-violet-50/60 to-purple-50/40 rounded-2xl p-5 border border-violet-100 space-y-3.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-700" />
            <h5 className="text-xs font-bold text-violet-950 uppercase tracking-wider">
              Kestabilan Suntikan Selepas Dibancuh / Dilarutkan (In-Use Stability Clock):
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {shelfLife.postReconstitutionStability ? (
              <div className="bg-surface p-3.5 rounded-xl border border-violet-200/60 shadow-elevation-1 space-y-1">
                <span className="font-bold text-violet-900 block">1. Selepas Rekonstitusi Serbuk (Vial):</span>
                <div className="space-y-0.5 text-text-secondary">
                  <p>• Room Temperature (25°C): <strong>{shelfLife.postReconstitutionStability.roomTempDuration}</strong></p>
                  <p>• Refrigerator (2-8°C): <strong>{shelfLife.postReconstitutionStability.refrigeratedDuration}</strong></p>
                </div>
              </div>
            ) : (
              <div className="bg-surface p-3.5 rounded-xl border border-violet-200/60 shadow-elevation-1 space-y-1">
                <span className="font-bold text-violet-900 block">Sediaan Ampul / Cecair Sedia Guna:</span>
                <p className="text-text-secondary text-xs">Gunakan serta-merta selepas ampul dipatahkan. Buang baki yang tidak digunakan.</p>
              </div>
            )}

            {shelfLife.postDilutionStability && (
              <div className="bg-surface p-3.5 rounded-xl border border-violet-200/60 shadow-elevation-1 space-y-1">
                <span className="font-bold text-violet-900 block">2. Selepas Pelarutan Dalam Beg Infusi IV:</span>
                <div className="space-y-0.5 text-text-secondary">
                  <p>• Room Temperature (25°C): <strong>{shelfLife.postDilutionStability.roomTempDuration}</strong></p>
                  <p>• Refrigerator (2-8°C): <strong>{shelfLife.postDilutionStability.refrigeratedDuration}</strong></p>
                </div>
              </div>
            )}
          </div>

          {shelfLife.storageConditions.specialStorageNote && (
            <div className="text-xs text-amber-400 dark:text-amber-300 font-bold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{shelfLife.storageConditions.specialStorageNote}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-subtle/50 rounded-2xl p-5 border border-border-default text-xs text-text-secondary font-medium">
          {shelfLife.storageConditions.specialStorageNote || 'Simpan dalam bekas asal bertutup rapat pada suhu bilik terkawal (<30°C).'}
        </div>
      )}
    </div>
  )
}

