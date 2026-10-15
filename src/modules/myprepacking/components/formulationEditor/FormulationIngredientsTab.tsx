import React, { useState } from 'react'
import { Plus, Trash2, RotateCcw, Beaker, Info } from 'lucide-react'
import type { PrepackFormulationIngredient } from '../../types/prepack'

interface FormulationIngredientsTabProps {
  ingredientsFormula: string
  indications: string
  ingredientsList: PrepackFormulationIngredient[]
  onChangeFormula: (val: string) => void
  onChangeIndications: (val: string) => void
  onUpdateIngredientsList: (list: PrepackFormulationIngredient[]) => void
  onResetToBaseline?: () => void
}

export const FormulationIngredientsTab: React.FC<FormulationIngredientsTabProps> = ({
  ingredientsFormula,
  indications,
  ingredientsList,
  onChangeFormula,
  onChangeIndications,
  onUpdateIngredientsList,
  onResetToBaseline
}) => {
  const [newIngredient, setNewIngredient] = useState<PrepackFormulationIngredient>({
    name: '',
    quantity: '',
    function: ''
  })

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) return
    onUpdateIngredientsList([...ingredientsList, { ...newIngredient }])
    setNewIngredient({ name: '', quantity: '', function: '' })
  }

  const handleRemoveIngredient = (index: number) => {
    onUpdateIngredientsList(ingredientsList.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index: number, field: keyof PrepackFormulationIngredient, value: string) => {
    const updated = ingredientsList.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value }
      }
      return item
    })
    onUpdateIngredientsList(updated)
  }

  return (
    <div className="space-y-4 py-1">
      {/* Master Formula Summary */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Beaker className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Master Formula & Preparation Formulation</span>
          </label>
          <span className="text-[10px] text-text-muted">High-level compounding composition</span>
        </div>
        <textarea
          rows={2}
          value={ingredientsFormula}
          onChange={(e) => onChangeFormula(e.target.value)}
          placeholder="e.g. Etanol 95% / IMS 737 ml diluted with Purified Water up to 1000 ml"
          className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors font-medium shadow-elevation-1 resize-none"
        />
      </div>

      {/* Clinical Indications */}
      <div>
        <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 mb-1">
          <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Clinical Indications & Therapeutic Use</span>
        </label>
        <input
          type="text"
          value={indications}
          onChange={(e) => onChangeIndications(e.target.value)}
          placeholder="e.g. Antisepsis kulit umum, disinfeksi permukaan & swab suntikan"
          className="w-full px-3 py-2 text-xs bg-surface border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors shadow-elevation-1"
        />
      </div>

      {/* Structured Ingredients Breakdown */}
      <div className="rounded-xl border border-border-default bg-subtle p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Standard Ingredients Breakdown
            </span>
            <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {ingredientsList.length} Ingredients
            </span>
          </div>

          {onResetToBaseline && (
            <button
              type="button"
              onClick={onResetToBaseline}
              className="px-2 py-1 text-[11px] font-medium text-text-muted hover:text-text-primary bg-surface border border-border-default hover:bg-subtle rounded-md transition-colors flex items-center gap-1 cursor-pointer active:scale-[0.98]"
              title="Reset ingredients to official MOH baseline monograph"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to MOH Standard</span>
            </button>
          )}
        </div>

        {/* Ingredients Table */}
        <div className="overflow-x-auto rounded-lg border border-border-default bg-surface shadow-elevation-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-subtle text-text-muted uppercase text-[10px] font-semibold tracking-wider border-b border-border-default">
              <tr>
                <th className="py-2 px-3 w-10 text-center">#</th>
                <th className="py-2 px-3">Ingredient / Chemical Name</th>
                <th className="py-2 px-3 w-36">Quantity / Yield</th>
                <th className="py-2 px-3">Function / Role</th>
                <th className="py-2 px-2 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {ingredientsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-muted italic text-xs">
                    No individual ingredients registered yet. Add ingredients below.
                  </td>
                </tr>
              ) : (
                ingredientsList.map((ing, idx) => (
                  <tr key={idx} className="hover:bg-subtle/40 transition-colors">
                    <td className="py-2 px-3 text-center font-mono text-[11px] text-text-muted">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                        placeholder="Ingredient name"
                        className="w-full bg-transparent border-b border-transparent hover:border-border-default focus:border-teal-500 focus:outline-none text-xs font-semibold text-text-primary py-0.5"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={ing.quantity}
                        onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                        placeholder="e.g. 737 ml"
                        className="w-full bg-transparent border-b border-transparent hover:border-border-default focus:border-teal-500 focus:outline-none text-xs font-mono font-bold text-teal-600 dark:text-teal-400 py-0.5"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={ing.function || ''}
                        onChange={(e) => handleIngredientChange(idx, 'function', e.target.value)}
                        placeholder="e.g. Active API / Solvent"
                        className="w-full bg-transparent border-b border-transparent hover:border-border-default focus:border-teal-500 focus:outline-none text-xs text-text-muted py-0.5"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer active:scale-[0.98]"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add New Ingredient Row */}
        <div className="p-2.5 rounded-lg border border-dashed border-border-default bg-surface flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
            placeholder="Ingredient Name (e.g. Purified Water BP)"
            className="flex-1 w-full px-2.5 py-1.5 text-xs bg-subtle border border-border-default rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <input
            type="text"
            value={newIngredient.quantity}
            onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
            placeholder="Quantity (e.g. q.s. to 1000 ml)"
            className="w-full sm:w-36 px-2.5 py-1.5 text-xs font-mono bg-subtle border border-border-default rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <input
            type="text"
            value={newIngredient.function || ''}
            onChange={(e) => setNewIngredient({ ...newIngredient, function: e.target.value })}
            placeholder="Function / Role (e.g. Diluent)"
            className="w-full sm:w-48 px-2.5 py-1.5 text-xs bg-subtle border border-border-default rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={handleAddIngredient}
            disabled={!newIngredient.name.trim()}
            className="w-full sm:w-auto px-3 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] disabled:opacity-40 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-elevation-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  )
}
