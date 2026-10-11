import React, { useState, useMemo } from 'react'
import {
  Clock,
  Calendar,
  Copy,
  Check,
  Printer,
  RotateCcw,
  Info,
  ShieldCheck,
  Pill,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles
} from 'lucide-react'

interface ArtemetherScheduleCalculatorProps {
  drugName?: string
}

interface DoseScheduleItem {
  doseNumber: number
  phaseTitle: string
  phaseSubtitle: string
  intervalBadge: string
  cumulativeHour: number
  intervalFromPrevHours: number
  dateObj: Date
  dateFormatted: string
  dayName: string
  time24H: string
  timeMilitary: string
  tabletCount: number
  tabletText: string
  isFinalDose: boolean
}

export const ArtemetherScheduleCalculator: React.FC<ArtemetherScheduleCalculatorProps> = ({
  drugName = 'Artemether 20mg & Lumefantrine 120mg Tablet'
}) => {
  // Format Date to 'YYYY-MM-DDTHH:mm'
  const toDateTimeLocalString = (date: Date): string => {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    const hh = date.getHours().toString().padStart(2, '0')
    const mm = date.getMinutes().toString().padStart(2, '0')
    return `${y}-${m}-${d}T${hh}:${mm}`
  }

  // State: Initial Stat Dose Date & Time (Defaults to current time)
  const [statDateTime, setStatDateTime] = useState<string>(() => {
    const now = new Date()
    now.setMinutes(Math.round(now.getMinutes() / 5) * 5)
    now.setSeconds(0)
    now.setMilliseconds(0)
    return toDateTimeLocalString(now)
  })

  // State: Selected Weight Category
  const [selectedWeight, setSelectedWeight] = useState<string>('adult')
  
  // State: Checked administered doses (tracking 1..6)
  const [administeredDoses, setAdministeredDoses] = useState<Record<number, boolean>>({})
  const [copied, setCopied] = useState(false)

  // Weight Category Configurations
  const weightTiers = [
    { id: 'adult', label: 'Adult / Adolescent (≥ 35 kg)', shortLabel: '≥ 35 kg', tabletsPerDose: 4, totalTablets: 24, artemetherMg: 80, lumefantrineMg: 480, isContraindicated: false },
    { id: '25-34', label: 'Children (25 - <35 kg)', shortLabel: '25 - <35 kg', tabletsPerDose: 3, totalTablets: 18, artemetherMg: 60, lumefantrineMg: 360, isContraindicated: false },
    { id: '15-24', label: 'Children (15 - <25 kg)', shortLabel: '15 - <25 kg', tabletsPerDose: 2, totalTablets: 12, artemetherMg: 40, lumefantrineMg: 240, isContraindicated: false },
    { id: '5-14', label: 'Children (5 - <15 kg)', shortLabel: '5 - <15 kg', tabletsPerDose: 1, totalTablets: 6, artemetherMg: 20, lumefantrineMg: 120, isContraindicated: false },
    { id: 'under5', label: 'Infants (< 5 kg)', shortLabel: '< 5 kg', tabletsPerDose: 0, totalTablets: 0, artemetherMg: 0, lumefantrineMg: 0, isContraindicated: true }
  ]

  const activeTier = weightTiers.find(t => t.id === selectedWeight) || weightTiers[0]

  // Quick Preset Handlers
  const handleSetUserExample = () => {
    // 16:00 on 31/08/2026 (exact user query example)
    const exampleDate = new Date(2026, 7, 31, 16, 0, 0)
    setStatDateTime(toDateTimeLocalString(exampleDate))
  }

  const handleSetNow = () => {
    const now = new Date()
    setStatDateTime(toDateTimeLocalString(now))
  }

  const handleSetTimeHour = (hour: number, minute: number = 0) => {
    const current = new Date(statDateTime || new Date())
    current.setHours(hour, minute, 0, 0)
    setStatDateTime(toDateTimeLocalString(current))
  }

  const toggleAdministered = (doseNum: number) => {
    setAdministeredDoses(prev => ({
      ...prev,
      [doseNum]: !prev[doseNum]
    }))
  }

  const resetAllAdministered = () => {
    setAdministeredDoses({})
  }

  // Calculate 6 Doses
  const doseSchedule: DoseScheduleItem[] = useMemo(() => {
    const baseDate = new Date(statDateTime)
    if (isNaN(baseDate.getTime())) return []

    const daysMalay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // Offset definitions in hours from T0 (STAT dose)
    const doseDefs = [
      {
        num: 1,
        cumulativeHour: 0,
        intervalFromPrev: 0,
        title: 'Dose 1 (STAT)',
        subtitle: 'Waktu diagnosis / Mula serta-merta (Jam 0)',
        intervalBadge: 'STAT (Jam 0)',
        isFinal: false
      },
      {
        num: 2,
        cumulativeHour: 8,
        intervalFromPrev: 8,
        title: 'Dose 2 (+8 Hours)',
        subtitle: 'Exactly 8 hours after First Dose (Hour 8)',
        intervalBadge: '+8 Jam',
        isFinal: false
      },
      {
        num: 3,
        cumulativeHour: 24,
        intervalFromPrev: 16,
        title: 'Dose 3 (BD Day 2)',
        subtitle: 'Morning/Afternoon Dose Day 2 (Hour 24 - 16h after Dose 2)',
        intervalBadge: 'Hour 24',
        isFinal: false
      },
      {
        num: 4,
        cumulativeHour: 36,
        intervalFromPrev: 12,
        title: 'Dose 4 (BD Day 2)',
        subtitle: 'Evening Dose Day 2 (Hour 36 - 12h after Dose 3)',
        intervalBadge: 'Hour 36',
        isFinal: false
      },
      {
        num: 5,
        cumulativeHour: 48,
        intervalFromPrev: 12,
        title: 'Dose 5 (BD Day 3)',
        subtitle: 'Morning/Afternoon Dose Day 3 (Hour 48 - 12h after Dose 4)',
        intervalBadge: 'Hour 48',
        isFinal: false
      },
      {
        num: 6,
        cumulativeHour: 60,
        intervalFromPrev: 12,
        title: 'Dose 6 (BD Day 3 - FINAL)',
        subtitle: 'Final Dose / Complete 60-hour regimen (Hour 60)',
        intervalBadge: 'Hour 60 (Final)',
        isFinal: true
      }
    ]

    return doseDefs.map(def => {
      const targetDate = new Date(baseDate.getTime() + def.cumulativeHour * 60 * 60 * 1000)
      const d = targetDate.getDate().toString().padStart(2, '0')
      const m = (targetDate.getMonth() + 1).toString().padStart(2, '0')
      const y = targetDate.getFullYear()
      const hh = targetDate.getHours().toString().padStart(2, '0')
      const mm = targetDate.getMinutes().toString().padStart(2, '0')

      const dateFormatted = `${d}/${m}/${y}`
      const dayName = daysMalay[targetDate.getDay()]
      const time24H = `${hh}:${mm}`
      const timeMilitary = `${hh}${mm}H`

      let tabText = ''
      if (activeTier.isContraindicated) {
        tabText = 'KONTRAINDIKASI'
      } else {
        tabText = `${activeTier.tabletsPerDose} Tablet`
      }

      return {
        doseNumber: def.num,
        phaseTitle: def.title,
        phaseSubtitle: def.subtitle,
        intervalBadge: def.intervalBadge,
        cumulativeHour: def.cumulativeHour,
        intervalFromPrevHours: def.intervalFromPrev,
        dateObj: targetDate,
        dateFormatted,
        dayName,
        time24H,
        timeMilitary,
        tabletCount: activeTier.tabletsPerDose,
        tabletText: tabText,
        isFinalDose: def.isFinal
      }
    })
  }, [statDateTime, activeTier])

  // Copy Formatted Schedule to Clipboard
  const handleCopySchedule = () => {
    if (doseSchedule.length === 0) return

    const headerText = `=== 6-DOSE ARTEMETHER + LUMEFANTRINE REGIMEN SCHEDULE (60 HOURS) ===\nMedication: ${drugName}\nWeight Category: ${activeTier.label}\nTotal Tablets: ${activeTier.totalTablets} Tablets (${activeTier.tabletsPerDose} tabs/dose)\n\n`
    
    const lines = doseSchedule.map(d => {
      return `• DOS ${d.doseNumber} [${d.intervalBadge}]: ${d.dayName}, ${d.dateFormatted} @ ${d.time24H} (${d.timeMilitary}) | Kuantiti: ${d.tabletText}\n  Catatan: ${d.phaseSubtitle}\n`
    }).join('\n')

    const footerText = `\nARAHAN PENTING:\n1. Wajib diambil bersama makanan berlemak atau susu penuh krim untuk penyerapan optimum.\n2. Jika muntah dalam tempoh 1 jam selepas pengambilan mana-mana dos, berikan dos ulangan penuh sekali lagi.\n3. Lengkapkan kesemua 6 dos walaupun sudah berasa sihat.`

    navigator.clipboard.writeText(headerText + lines + footerText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrintSchedule = () => {
    window.print()
  }

  return (
    <div className="space-y-5">
      {/* 1. Clinical Guidance Alert Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex gap-2.5 items-start">
          <Utensils className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-400 dark:text-amber-300 font-bold block">Fat & Milk Absorption (Mandatory)</span>
            <p className="text-text-secondary text-[11.5px] leading-relaxed">
              Must be taken with fatty food or a glass of full-cream milk. Lumefantrine absorption increases 2–3 fold in the presence of lipids.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-rose-500/10 rounded-2xl border border-rose-500/20 flex gap-2.5 items-start">
          <RotateCcw className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-rose-400 dark:text-rose-300 font-bold block">Vomiting Within 1 Hour</span>
            <p className="text-text-secondary text-[11.5px] leading-relaxed">
              If the patient vomits within 1 hour (≤ 60 minutes) after taking any dose, repeat the full dose once more.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-accent-base/10 rounded-2xl border border-accent-base/20 flex gap-2.5 items-start">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-teal-950 block">6-Dose Compliance (60 Hours)</span>
            <p className="text-text-secondary text-[11.5px] leading-relaxed">
              Dose 1 (STAT Hour 0), Dose 2 (+8 Hours), followed by 4 doses spaced 12 hours apart (Hours 24, 36, 48, 60). All 6 doses must be fully completed.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Calculator Card */}
      <div className="bg-subtle/50 rounded-2xl border border-border-default p-4 sm:p-6 space-y-5">
        {/* Top Control Bar: Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                6-Dose Regimen Schedule Calculator (Malaria Protocol)
              </h4>
              <p className="text-xs text-text-muted">
                Enter initial first dose (STAT) time to calculate exact timings for all subsequent 6 doses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySchedule}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-elevation-1 cursor-pointer border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-surface hover:bg-subtle text-text-secondary border-border-default'
              }`}
              title="Copy complete schedule for ward notes"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Schedule'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintSchedule}
              className="px-3 py-1.5 bg-surface hover:bg-subtle text-text-secondary border border-border-default rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-elevation-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-text-muted" />
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={resetAllAdministered}
              className="p-1.5 bg-surface hover:bg-subtle text-text-muted border border-border-default rounded-xl transition-colors cursor-pointer"
              title="Reset administered checkmarks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inputs: Stat Date-Time & Weight Category */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Stat Time Picker */}
          <div className="md:col-span-6 space-y-2">
            <label className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                <span>First Dose / STAT Time (Hour 0):</span>
              </span>
              <span className="text-[11px] font-normal text-text-muted">Diagnosis Time</span>
            </label>

            <input
              type="datetime-local"
              value={statDateTime}
              onChange={e => setStatDateTime(e.target.value)}
              className="w-full bg-surface border border-border-default focus:border-violet-600 focus:ring-1 focus:ring-violet-600 text-text-primary rounded-xl px-3 py-2 text-sm font-semibold font-mono outline-none shadow-elevation-1 cursor-pointer"
            />

            {/* Quick Timing Shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleSetUserExample}
                className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Contoh: 16:00 31/08/2026"
              >
                <Sparkles className="w-3 h-3 text-violet-600" />
                <span>Example: 16:00 31/8/2026</span>
              </button>

              <button
                type="button"
                onClick={handleSetNow}
                className="px-2 py-1 bg-surface hover:bg-subtle text-text-secondary border border-border-default rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                Current Time
              </button>

              <button
                type="button"
                onClick={() => handleSetTimeHour(8, 0)}
                className="px-2 py-1 bg-surface hover:bg-subtle text-text-muted border border-border-default rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                08:00
              </button>

              <button
                type="button"
                onClick={() => handleSetTimeHour(12, 0)}
                className="px-2 py-1 bg-surface hover:bg-subtle text-text-muted border border-border-default rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                12:00
              </button>

              <button
                type="button"
                onClick={() => handleSetTimeHour(16, 0)}
                className="px-2 py-1 bg-surface hover:bg-subtle text-text-muted border border-border-default rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                16:00
              </button>

              <button
                type="button"
                onClick={() => handleSetTimeHour(20, 0)}
                className="px-2 py-1 bg-surface hover:bg-subtle text-text-muted border border-border-default rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                20:00
              </button>
            </div>
          </div>

          {/* Weight Category Selector */}
          <div className="md:col-span-6 space-y-2">
            <label className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-teal-600" />
                <span>Weight Category & Tablet Quantity:</span>
              </span>
              <span className="text-[11px] font-bold text-teal-700">
                {activeTier.isContraindicated ? '⚠️ Contraindicated' : `${activeTier.tabletsPerDose} Tab/Dos (${activeTier.totalTablets} Tab)`}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {weightTiers.map(tier => {
                const isSelected = selectedWeight === tier.id
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedWeight(tier.id)}
                    className={`p-2 rounded-xl text-left transition-colors border cursor-pointer ${
                      isSelected
                        ? tier.isContraindicated
                          ? 'bg-rose-500/10 border-rose-400 text-rose-400 dark:text-rose-300 font-bold shadow-elevation-1 font-bold'
                          : 'bg-violet-600 border-violet-600 text-white shadow-elevation-1 font-bold'
                        : 'bg-surface border-border-default text-text-secondary hover:bg-subtle'
                    }`}
                  >
                    <div className="text-[11px] truncate">{tier.shortLabel}</div>
                    <div className={`text-[10px] ${isSelected ? (tier.isContraindicated ? 'text-rose-700' : 'text-violet-100') : 'text-slate-400'}`}>
                      {tier.isContraindicated ? 'Contraindicated' : `${tier.tabletsPerDose} Tab/Dos`}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected Summary Pill */}
            <div className={`p-2 rounded-xl text-xs flex items-center gap-2 border ${
              activeTier.isContraindicated
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-accent-base/10 border-accent-base/20 text-teal-900'
            }`}>
              <Pill className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-medium">
                {activeTier.isContraindicated
                  ? 'CONTRAINDICATED: Clinical safety and efficacy not established for infants < 5 kg.'
                  : `Selected Dose: ${activeTier.tabletsPerDose} Tablet per dos (Jumlah 6 dos = ${activeTier.totalTablets} tablet dalam tempoh 60 jam).`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Clinical Schedule Table */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              6-Dose Administration Schedule (STAT &rarr; 8H &rarr; BD):
            </span>
            <span className="text-[11px] text-text-muted">
              Total Treatment Duration: <strong>60 Jam</strong>
            </span>
          </div>

          <div className="bg-surface rounded-2xl border border-border-default overflow-hidden shadow-elevation-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-subtle/50 border-b border-border-default text-text-muted font-bold text-[11px]">
                    <th className="py-2.5 px-3.5 w-12 text-center">Dose</th>
                    <th className="py-2.5 px-3.5">Phase & Interval</th>
                    <th className="py-2.5 px-3.5">Date & Day</th>
                    <th className="py-2.5 px-3.5">Administration Time (24H)</th>
                    <th className="py-2.5 px-3.5">Dose Quantity</th>
                    <th className="py-2.5 px-3.5 text-center">Status / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-medium">
                  {doseSchedule.map(dose => {
                    const isGiven = !!administeredDoses[dose.doseNumber]

                    return (
                      <tr
                        key={dose.doseNumber}
                        className={`transition-colors ${
                          isGiven
                            ? 'bg-emerald-500/10 text-emerald-400 dark:text-emerald-300 font-bold'
                            : dose.isFinalDose
                            ? 'bg-indigo-500/10 hover:bg-indigo-500/10'
                            : dose.doseNumber === 1
                            ? 'bg-amber-500/10 hover:bg-amber-500/10'
                            : 'hover:bg-subtle/50'
                        }`}
                      >
                        {/* 1. Dose Number Badge */}
                        <td className="py-3 px-3.5 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-bold text-xs ${
                            isGiven
                              ? 'bg-emerald-600 text-white'
                              : dose.isFinalDose
                              ? 'bg-purple-600 text-white'
                              : dose.doseNumber === 1
                              ? 'bg-amber-500 text-white'
                              : 'bg-subtle text-text-primary'
                          }`}>
                            {dose.doseNumber}
                          </span>
                        </td>

                        {/* 2. Phase & Subtitle */}
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-text-primary flex items-center gap-1.5">
                            <span>{dose.phaseTitle}</span>
                            {dose.isFinalDose && (
                              <span className="text-[10px] bg-purple-100 text-indigo-400 px-1.5 py-0.2 rounded font-bold">
                                FINAL
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-muted block">
                            {dose.phaseSubtitle}
                          </span>
                        </td>

                        {/* 3. Date & Day */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-bold text-text-primary block">{dose.dayName}</span>
                          <span className="text-[11px] text-text-muted font-mono">{dose.dateFormatted}</span>
                        </td>

                        {/* 4. Time 24H & Military */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="text-base font-black text-text-primary font-mono tracking-tight">
                            {dose.time24H}
                          </div>
                          <span className="text-[10.5px] text-text-muted font-mono font-semibold">
                            ({dose.timeMilitary})
                          </span>
                        </td>

                        {/* 5. Tablets Quantity */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`font-bold ${activeTier.isContraindicated ? 'text-rose-600' : 'text-text-primary'}`}>
                            {dose.tabletText}
                          </span>
                          <span className="text-[10.5px] text-slate-400 block">
                            + Fatty food/milk
                          </span>
                        </td>

                        {/* 6. Administered Checkbox Button */}
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleAdministered(dose.doseNumber)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                              isGiven
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-elevation-1'
                                : 'bg-surface hover:bg-subtle text-text-muted border-border-default'
                            }`}
                          >
                            {isGiven ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Administered</span>
                              </>
                            ) : (
                              <>
                                <div className="w-3 h-3 rounded-xs border border-slate-400"></div>
                                <span>Mark Given</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-surface rounded-xl border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-violet-600 shrink-0" />
            <span>
              <strong>Interval Formula:</strong> Dose 1 (STAT) &rarr; (+8h) &rarr; Dose 2 &rarr; (+16h) &rarr; Dose 3 (Hour 24) &rarr; (+12h) &rarr; Dose 4 (Hour 36) &rarr; (+12h) &rarr; Dose 5 (Hour 48) &rarr; (+12h) &rarr; Dose 6 (Hour 60 - Completed).
            </span>
          </div>
          <span className="text-[11px] font-bold text-text-secondary font-mono whitespace-nowrap">
            MOH FUKKM Protocol
          </span>
        </div>
      </div>
    </div>
  )
}

export default ArtemetherScheduleCalculator
