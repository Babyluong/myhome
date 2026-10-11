import React, { useState } from 'react'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Wrench,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

interface FormulationProcedureTabProps {
  steps: string[]
  equipment: string[]
  qcChecks: string[]
  cautions: string[]
  onUpdateSteps: (steps: string[]) => void
  onUpdateEquipment: (eq: string[]) => void
  onUpdateQcChecks: (qc: string[]) => void
  onUpdateCautions: (cautions: string[]) => void
  onResetToBaselineSteps?: () => void
}

export const FormulationProcedureTab: React.FC<FormulationProcedureTabProps> = ({
  steps,
  equipment,
  qcChecks,
  cautions,
  onUpdateSteps,
  onUpdateEquipment,
  onUpdateQcChecks,
  onUpdateCautions,
  onResetToBaselineSteps
}) => {
  const [newStepText, setNewStepText] = useState('')
  const [newEqText, setNewEqText] = useState('')
  const [newQcText, setNewQcText] = useState('')
  const [newCautionText, setNewCautionText] = useState('')

  // Steps handlers
  const handleAddStep = () => {
    if (!newStepText.trim()) return
    const stepNumber = steps.length + 1
    const textWithoutNum = newStepText.replace(/^\d+[\.\)]\s*/, '').trim()
    onUpdateSteps([...steps, `${stepNumber}. ${textWithoutNum}`])
    setNewStepText('')
  }

  const handleRemoveStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index)
    // Renumber steps
    const renumbered = filtered.map((s, i) => {
      const clean = s.replace(/^\d+[\.\)]\s*/, '').trim()
      return `${i + 1}. ${clean}`
    })
    onUpdateSteps(renumbered)
  }

  const handleStepTextChange = (index: number, val: string) => {
    const updated = [...steps]
    updated[index] = val
    onUpdateSteps(updated)
  }

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= steps.length) return
    const updated = [...steps]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    // Renumber
    const renumbered = updated.map((s, i) => {
      const clean = s.replace(/^\d+[\.\)]\s*/, '').trim()
      return `${i + 1}. ${clean}`
    })
    onUpdateSteps(renumbered)
  }

  // Equipment handlers
  const handleAddEquipment = () => {
    if (!newEqText.trim()) return
    onUpdateEquipment([...equipment, newEqText.trim()])
    setNewEqText('')
  }

  // QC handlers
  const handleAddQc = () => {
    if (!newQcText.trim()) return
    onUpdateQcChecks([...qcChecks, newQcText.trim()])
    setNewQcText('')
  }

  // Cautions handlers
  const handleAddCaution = () => {
    if (!newCautionText.trim()) return
    onUpdateCautions([...cautions, newCautionText.trim()])
    setNewCautionText('')
  }

  return (
    <div className="space-y-4 py-1">
      {/* 1. Compounding SOP Steps */}
      <div className="rounded-xl border border-border-default bg-subtle p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Compounding SOP & Step-by-Step Procedure
            </span>
            <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {steps.length} Steps
            </span>
          </div>

          {onResetToBaselineSteps && (
            <button
              type="button"
              onClick={onResetToBaselineSteps}
              className="px-2 py-1 text-[11px] font-medium text-text-muted hover:text-text-primary bg-surface border border-border-default hover:bg-subtle rounded-md transition-colors flex items-center gap-1 cursor-pointer active:scale-[0.98]"
              title="Reset steps to official MOH monograph baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to MOH SOP</span>
            </button>
          )}
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {steps.length === 0 ? (
            <div className="py-6 text-center text-text-muted italic text-xs bg-surface rounded-lg border border-border-default">
              No procedure steps registered. Add steps below.
            </div>
          ) : (
            steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg border border-border-default bg-surface hover:border-border-strong transition-all shadow-2xs group"
              >
                <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveStep(idx, 'up')}
                    className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-20 cursor-pointer"
                    title="Move step up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                    {idx + 1}
                  </span>
                  <button
                    type="button"
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMoveStep(idx, 'down')}
                    className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-20 cursor-pointer"
                    title="Move step down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={step}
                  onChange={(e) => handleStepTextChange(idx, e.target.value)}
                  className="flex-1 bg-transparent border-0 focus:ring-0 text-xs text-text-primary font-medium resize-none leading-relaxed focus:outline-none p-1"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer active:scale-[0.98] shrink-0 mt-1"
                  title="Remove step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Step Box */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStep())}
            placeholder="Add new step (e.g. Ensure work area is clean and free of sparks...)"
            className="flex-1 px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
          />
          <button
            type="button"
            onClick={handleAddStep}
            disabled={!newStepText.trim()}
            className="px-3 py-2 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>
        </div>
      </div>

      {/* 2. Equipment, QC & Hazard Warnings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Equipment Required */}
        <div className="rounded-xl border border-border-default bg-subtle p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Equipment Required</span>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[48px]">
            {equipment.map((eq, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface text-text-secondary border border-border-default rounded-md px-2 py-0.5"
              >
                <span>{eq}</span>
                <button
                  type="button"
                  onClick={() => onUpdateEquipment(equipment.filter((_, idx) => idx !== i))}
                  className="text-text-muted hover:text-rose-500 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newEqText}
              onChange={(e) => setNewEqText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
              placeholder="e.g. 1000ml Cylinder"
              className="flex-1 px-2 py-1 text-xs bg-surface border border-border-default rounded-md text-text-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddEquipment}
              className="p-1 bg-surface border border-border-default hover:bg-subtle rounded-md text-text-secondary cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* In-Process QC */}
        <div className="rounded-xl border border-border-default bg-subtle p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>In-Process QC Checks</span>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[48px]">
            {qcChecks.map((qc, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface text-text-secondary border border-border-default rounded-md px-2 py-0.5"
              >
                <span>{qc}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQcChecks(qcChecks.filter((_, idx) => idx !== i))}
                  className="text-text-muted hover:text-rose-500 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newQcText}
              onChange={(e) => setNewQcText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQc())}
              placeholder="e.g. Solution Clarity"
              className="flex-1 px-2 py-1 text-xs bg-surface border border-border-default rounded-md text-text-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddQc}
              className="p-1 bg-surface border border-border-default hover:bg-subtle rounded-md text-text-secondary cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cautions & Warnings */}
        <div className="rounded-xl border border-border-default bg-subtle p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Cautions & Warnings</span>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[48px]">
            {cautions.map((caution, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-md px-2 py-0.5"
              >
                <span>{caution}</span>
                <button
                  type="button"
                  onClick={() => onUpdateCautions(cautions.filter((_, idx) => idx !== i))}
                  className="text-text-muted hover:text-rose-500 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newCautionText}
              onChange={(e) => setNewCautionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCaution())}
              placeholder="e.g. Flammable Liquid"
              className="flex-1 px-2 py-1 text-xs bg-surface border border-border-default rounded-md text-text-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCaution}
              className="p-1 bg-surface border border-border-default hover:bg-subtle rounded-md text-text-secondary cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
