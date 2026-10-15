import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Save, Search, Info, Check, ChevronDown, ChevronUp, Eye, PlusCircle, Edit3, CheckCircle2, Trash2, Download, Settings, Sparkles, Sliders } from 'lucide-react'
import {
  getAllRoles,
  getAllPermissions,
  getRolePermissions,
  updateRolePermissions,
} from '@/services/roleService'
import {
  fetchRbacMatrix,
  saveRbacMatrix,
  buildDefaultMatrixForRole,
} from '@/services/rbacService'
import { SYSTEM_MODULE_REGISTRY, ACTION_DEFINITIONS, ROLE_CAPABILITY_PRESETS, ActionType } from '@/shared/constants/moduleRegistry'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import type { Role, Permission } from '@/types'

interface MatrixState {
  // roleId -> moduleCode -> action -> boolean
  [roleId: string]: {
    [moduleCode: string]: {
      view?: boolean
      create?: boolean
      edit?: boolean
      approve?: boolean
      delete?: boolean
      export?: boolean
      admin?: boolean
      features?: {
        [featureCode: string]: {
          [action in ActionType]?: boolean
        }
      }
    }
  }
}

export const AdminRbacTab: React.FC = () => {
  const { success: showSuccess, error: showError } = useToastStore()
  const { user: currentUser } = useAuthStore()

  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [dbPermissions, setDbPermissions] = useState<Permission[]>([])
  const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])

  // Fine-grained granular matrix state
  const [matrixState, setMatrixState] = useState<MatrixState>({})
  const [savedMatrixState, setSavedMatrixState] = useState<MatrixState>({})

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [rbacSearch, setRbacSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  // Fetch initial roles & DB permissions
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const [rolesList, permissionsList, dbMatrix] = await Promise.all([
          getAllRoles(),
          getAllPermissions(),
          fetchRbacMatrix(),
        ])

        // Exclude system_admin from modification for security reasons
        const filteredRoles = rolesList.filter((r) => r.role_code !== 'system_admin')
        setRoles(filteredRoles)
        setDbPermissions(permissionsList)

        if (filteredRoles.length > 0) {
          setSelectedRoleId(filteredRoles[0].id)
        }

        // Initialize matrix state: Priority 1: Supabase DB matrix -> Priority 2: local cache -> Priority 3: system defaults
        const initialMatrix: MatrixState = {}
        filteredRoles.forEach((role) => {
          const roleCode = role.role_code.toLowerCase()
          const roleId = role.id

          // Priority 1: Supabase database master matrix
          if (dbMatrix && (dbMatrix[roleCode] || dbMatrix[roleId])) {
            const fromDb = dbMatrix[roleCode] || dbMatrix[roleId]
            if (fromDb && Object.keys(fromDb).length > 0) {
              initialMatrix[roleId] = fromDb
              return
            }
          }

          // Priority 2: Local storage per-role cache
          let stored: any = null
          try {
            const raw = localStorage.getItem(`home_rbac_overrides_${roleCode}`)
            if (raw) stored = JSON.parse(raw)
          } catch (e) {
            // ignore
          }

          if (stored && Object.keys(stored).length > 0) {
            initialMatrix[roleId] = stored
            return
          }

          // Priority 3: Comprehensive default baseline from SYSTEM_MODULE_REGISTRY
          initialMatrix[roleId] = buildDefaultMatrixForRole(roleCode)
        })

        setMatrixState(initialMatrix)
        setSavedMatrixState(JSON.parse(JSON.stringify(initialMatrix)))
      } catch (err) {
        showError('Ralat', 'Gagal memuat tetapan RBAC dari pangkalan data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [showError])

  // Fetch DB role_permissions when role changes
  useEffect(() => {
    if (!selectedRoleId) return

    const fetchRolePermissionsData = async () => {
      try {
        const perms = await getRolePermissions(selectedRoleId)
        const ids = perms.map((p) => p.id)
        setRolePermissionIds(ids)
        setSelectedPermissionIds(ids)
      } catch (err) {
        console.error('Failed to load DB permissions for this role:', err)
      }
    }

    fetchRolePermissionsData()
  }, [selectedRoleId])

  const selectedRoleObj = roles.find((r) => r.id === selectedRoleId)

  const toggleModuleExpand = (moduleCode: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleCode]: !prev[moduleCode],
    }))
  }

  // Toggle specific action for a module
  const handleToggleModuleAction = (moduleCode: string, action: ActionType) => {
    if (!selectedRoleId) return

    setMatrixState((prev) => {
      const currentRoleMatrix = prev[selectedRoleId] || {}
      const currentMod = currentRoleMatrix[moduleCode] || {
        view: false,
        create: false,
        edit: false,
        approve: false,
        delete: false,
        export: false,
        admin: false,
        features: {},
      }

      const newValue = !currentMod[action]

      // If turning on create/edit/approve/delete, automatically ensure view is on
      const updatedMod = {
        ...currentMod,
        [action]: newValue,
        view: action !== 'view' && newValue ? true : action === 'view' && !newValue ? false : currentMod.view,
      }

      // If disabling view, disable all other sub-actions
      if (action === 'view' && !newValue) {
        updatedMod.create = false
        updatedMod.edit = false
        updatedMod.approve = false
        updatedMod.delete = false
        updatedMod.export = false
        updatedMod.admin = false
      }

      // Also cascade to all sub-features of this module
      const moduleDef = SYSTEM_MODULE_REGISTRY.find((m) => m.code === moduleCode)
      if (moduleDef && updatedMod.features) {
        const updatedFeatures = { ...updatedMod.features }
        moduleDef.features.forEach((feat) => {
          if (!updatedFeatures[feat.code]) {
            updatedFeatures[feat.code] = {}
          }
          if (feat.supportedActions.includes(action)) {
            updatedFeatures[feat.code] = {
              ...updatedFeatures[feat.code],
              [action]: newValue,
              view: action !== 'view' && newValue ? true : action === 'view' && !newValue ? false : updatedFeatures[feat.code]?.view,
            }
          }
        })
        updatedMod.features = updatedFeatures
      }

      return {
        ...prev,
        [selectedRoleId]: {
          ...currentRoleMatrix,
          [moduleCode]: updatedMod,
        },
      }
    })
  }

  // Toggle specific action for a sub-feature
  const handleToggleFeatureAction = (moduleCode: string, featureCode: string, action: ActionType) => {
    if (!selectedRoleId) return

    setMatrixState((prev) => {
      const currentRoleMatrix = prev[selectedRoleId] || {}
      const currentMod = currentRoleMatrix[moduleCode] || {
        view: false,
        features: {},
      }
      const currentFeatures = currentMod.features || {}
      const currentFeat = currentFeatures[featureCode] || {}

      const newValue = !currentFeat[action]
      const updatedFeat = {
        ...currentFeat,
        [action]: newValue,
        view: action !== 'view' && newValue ? true : action === 'view' && !newValue ? false : currentFeat.view,
      }

      const updatedMod = {
        ...currentMod,
        view: currentMod.view || (action !== 'view' && newValue),
        features: {
          ...currentFeatures,
          [featureCode]: updatedFeat,
        },
      }

      return {
        ...prev,
        [selectedRoleId]: {
          ...currentRoleMatrix,
          [moduleCode]: updatedMod,
        },
      }
    })
  }

  // Apply quick preset to entire role or single module
  const handleApplyPreset = (presetKey: string, targetModuleCode?: string) => {
    if (!selectedRoleId) return
    const preset = ROLE_CAPABILITY_PRESETS[presetKey]
    if (!preset) return

    setMatrixState((prev) => {
      const currentRoleMatrix = { ...(prev[selectedRoleId] || {}) }
      const modulesToUpdate = targetModuleCode
        ? SYSTEM_MODULE_REGISTRY.filter((m) => m.code === targetModuleCode)
        : SYSTEM_MODULE_REGISTRY

      modulesToUpdate.forEach((mod) => {
        const modCode = mod.code
        const updatedFeatures: Record<string, any> = {}

        mod.features.forEach((feat) => {
          const featActions: Record<string, boolean> = {}
          feat.supportedActions.forEach((act) => {
            featActions[act] = preset.actions.includes(act)
          })
          updatedFeatures[feat.code] = featActions
        })

        currentRoleMatrix[modCode] = {
          view: preset.actions.includes('view'),
          create: preset.actions.includes('create'),
          edit: preset.actions.includes('edit'),
          approve: preset.actions.includes('approve'),
          delete: preset.actions.includes('delete'),
          export: preset.actions.includes('export'),
          admin: preset.actions.includes('admin'),
          features: updatedFeatures,
        }
      })

      return {
        ...prev,
        [selectedRoleId]: currentRoleMatrix,
      }
    })

    showSuccess(
      'Pratetap Digunakan',
      `Templat "${preset.label}" berjaya diaplikasikan kepada ${targetModuleCode || 'semua modul'}.`
    )
  }

  // Toggle all actions in a module
  const handleSelectAllInModule = (moduleCode: string, enable: boolean) => {
    if (!selectedRoleId) return

    setMatrixState((prev) => {
      const currentRoleMatrix = { ...(prev[selectedRoleId] || {}) }
      const mod = SYSTEM_MODULE_REGISTRY.find((m) => m.code === moduleCode)
      if (!mod) return prev

      const updatedFeatures: Record<string, any> = {}
      mod.features.forEach((feat) => {
        const featActions: Record<string, boolean> = {}
        feat.supportedActions.forEach((act) => {
          featActions[act] = enable
        })
        updatedFeatures[feat.code] = featActions
      })

      currentRoleMatrix[moduleCode] = {
        view: enable,
        create: enable,
        edit: enable,
        approve: enable,
        delete: enable,
        export: enable,
        admin: enable,
        features: updatedFeatures,
      }

      return {
        ...prev,
        [selectedRoleId]: currentRoleMatrix,
      }
    })
  }

  // Save changes to database and local store for selected role
  const handleSave = async () => {
    if (!selectedRoleId || !selectedRoleObj) return

    setIsSaving(true)
    try {
      const roleCode = selectedRoleObj.role_code.toLowerCase()
      const currentRoleConfig = matrixState[selectedRoleId] || {}

      // Prepare master payload for Supabase database
      const masterToSave: Record<string, any> = {}
      roles.forEach((r) => {
        const rCode = r.role_code.toLowerCase()
        const cfg = r.id === selectedRoleId ? currentRoleConfig : (matrixState[r.id] || {})
        masterToSave[rCode] = cfg
        masterToSave[r.id] = cfg
        if (rCode === 'assistant_pharmacist') masterToSave['pharmacy_assistant'] = cfg
        if (rCode === 'pharmacy_assistant') masterToSave['assistant_pharmacist'] = cfg
        if (rCode === 'hospital_admin') masterToSave['hospital_administrator'] = cfg
        if (rCode === 'hospital_administrator') masterToSave['hospital_admin'] = cfg
      })

      // 1. Persist master matrix in Supabase system_settings and local storage
      await saveRbacMatrix(masterToSave)

      // 2. Persist to Supabase role_permissions table
      const permissionsToSync: string[] = []
      Object.entries(currentRoleConfig).forEach(([modCode, modConfig]) => {
        if (modConfig.view) {
          const viewPerm = dbPermissions.find(
            (p) => p.module.toLowerCase() === modCode.toLowerCase()
          )
          if (viewPerm && !permissionsToSync.includes(viewPerm.id)) {
            permissionsToSync.push(viewPerm.id)
          }
        }
      })

      if (permissionsToSync.length > 0) {
        try {
          await updateRolePermissions(
            selectedRoleId,
            permissionsToSync,
            currentUser?.id || ''
          )
        } catch (e) {
          // Ignore
        }
      }

      setSavedMatrixState((prev) => ({
        ...prev,
        [selectedRoleId]: JSON.parse(JSON.stringify(currentRoleConfig)),
      }))
      showSuccess(
        'Had Kuasa Disimpan',
        `Matriks kebenaran bagi peranan "${selectedRoleObj.role_name}" telah dikemaskini dan disimpan ke pangkalan data.`
      )
    } catch (err: any) {
      showError('Ralat', err.message || 'Gagal menyimpan perubahan had kuasa')
    } finally {
      setIsSaving(false)
    }
  }

  // Save ALL roles across the entire matrix directly to Supabase and local storage
  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const masterToSave: Record<string, any> = {}
      roles.forEach((r) => {
        const rCode = r.role_code.toLowerCase()
        const config = matrixState[r.id] || {}
        masterToSave[rCode] = config
        masterToSave[r.id] = config
        if (rCode === 'assistant_pharmacist') masterToSave['pharmacy_assistant'] = config
        if (rCode === 'pharmacy_assistant') masterToSave['assistant_pharmacist'] = config
        if (rCode === 'hospital_admin') masterToSave['hospital_administrator'] = config
        if (rCode === 'hospital_administrator') masterToSave['hospital_admin'] = config
      })

      // 1. Save to Supabase system_settings and local storage
      await saveRbacMatrix(masterToSave)

      // 2. Sync role_permissions table in Supabase
      for (const r of roles) {
        const currentRoleConfig = matrixState[r.id] || {}
        const permissionsToSync: string[] = []
        Object.entries(currentRoleConfig).forEach(([modCode, modConfig]) => {
          if (modConfig.view) {
            const viewPerm = dbPermissions.find(
              (p) => p.module.toLowerCase() === modCode.toLowerCase()
            )
            if (viewPerm && !permissionsToSync.includes(viewPerm.id)) {
              permissionsToSync.push(viewPerm.id)
            }
          }
        })
        if (permissionsToSync.length > 0) {
          try {
            await updateRolePermissions(r.id, permissionsToSync, currentUser?.id || '')
          } catch (e) {
            // Ignore non-critical
          }
        }
      }

      setSavedMatrixState(JSON.parse(JSON.stringify(matrixState)))
      showSuccess(
        'Semua Had Kuasa Disimpan',
        `Berjaya menyimpan konfigurasi bagi semua peranan hospital ke pangkalan data.`
      )
    } catch (err: any) {
      showError('Ralat', err.message || 'Gagal menyimpan perubahan had kuasa')
    } finally {
      setIsSaving(false)
    }
  }

  // Detect dirty roles across the entire matrix
  const dirtyRoleIds = useMemo(() => {
    return roles
      .filter((r) => {
        const cur = matrixState[r.id]
        const saved = savedMatrixState[r.id]
        if (!cur && !saved) return false
        return JSON.stringify(cur) !== JSON.stringify(saved)
      })
      .map((r) => r.id)
  }, [roles, matrixState, savedMatrixState])

  const hasAnyChanges = dirtyRoleIds.length > 0
  const hasChanges = dirtyRoleIds.includes(selectedRoleId)


  // Filter modules by search & category
  const filteredModules = useMemo(() => {
    return SYSTEM_MODULE_REGISTRY.filter((mod) => {
      const matchesSearch =
        mod.name.toLowerCase().includes(rbacSearch.toLowerCase()) ||
        mod.officialName.toLowerCase().includes(rbacSearch.toLowerCase()) ||
        mod.code.toLowerCase().includes(rbacSearch.toLowerCase()) ||
        mod.features.some(
          (f) =>
            f.name.toLowerCase().includes(rbacSearch.toLowerCase()) ||
            f.code.toLowerCase().includes(rbacSearch.toLowerCase())
        )

      const matchesCategory =
        selectedCategory === 'all' || mod.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [rbacSearch, selectedCategory])

  const categories = [
    { id: 'all', label: 'Semua Modul' },
    { id: 'pharmacy', label: 'Farmasi & Stok' },
    { id: 'clinical', label: 'Klinikal & Wad' },
    { id: 'logistics', label: 'Logistik & Pengangkutan' },
    { id: 'facility', label: 'Fasiliti & Suhu' },
    { id: 'administrative', label: 'Pentadbiran' },
    { id: 'support', label: 'Sokongan' },
  ]

  const actionIcons: Record<ActionType, React.ReactNode> = {
    view: <Eye className="w-3.5 h-3.5" />,
    create: <PlusCircle className="w-3.5 h-3.5" />,
    edit: <Edit3 className="w-3.5 h-3.5" />,
    approve: <CheckCircle2 className="w-3.5 h-3.5" />,
    delete: <Trash2 className="w-3.5 h-3.5" />,
    export: <Download className="w-3.5 h-3.5" />,
    admin: <Settings className="w-3.5 h-3.5" />,
  }

  const actionColors: Record<ActionType, { text: string; bg: string; border: string }> = {
    view: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
    create: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    edit: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    approve: { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
    delete: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
    export: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
    admin: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  }

  return (
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
      {/* Mobile Role Selector (< lg) */}
      <div className="lg:hidden bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Pilih Peranan (Role)</span>
          </label>
          {hasAnyChanges && (
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="text-[11px] px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
            >
              Simpan Semua ({dirtyRoleIds.length})
            </button>
          )}
        </div>
        <select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500 min-h-[44px]"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.role_name} ({r.role_code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Sidebar: Role Selector (>= lg) */}
      <div className="hidden lg:block lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Senarai Peranan</span>
          </h3>
          <div className="flex items-center gap-1.5">
            {hasAnyChanges && (
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-bold transition-colors disabled:opacity-50"
                title="Simpan semua peranan yang diubah"
              >
                Simpan ({dirtyRoleIds.length})
              </button>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {roles.length}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {roles.map((r) => {
            const isSelected = r.id === selectedRoleId
            const roleCode = r.role_code.toLowerCase()
            const modMatrix = matrixState[r.id] || {}
            const enabledCount = Object.values(modMatrix).filter((m) => m.view).length
            const isRoleDirty = dirtyRoleIds.includes(r.id)

            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`w-full p-3 rounded-lg text-left border transition-colors flex flex-col gap-1 relative ${
                  isSelected
                    ? 'bg-slate-800 text-teal-300 border-teal-500/50'
                    : 'bg-slate-950/40 text-slate-300 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{r.role_name}</span>
                  <div className="flex items-center gap-1">
                    {isRoleDirty && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        Ubah
                      </span>
                    )}
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="uppercase">{roleCode}</span>
                  <span className={enabledCount > 0 ? 'text-teal-400 font-semibold' : 'text-text-muted'}>
                    {enabledCount} modul aktif
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Panel: Fine-Grained Permission Matrix */}
      <div className="lg:col-span-3 space-y-4 sm:space-y-6">
        {selectedRoleObj && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-800 text-teal-400 border border-slate-700">
                  <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">{selectedRoleObj.role_name}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 uppercase">
                      {selectedRoleObj.role_code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedRoleObj.description || 'Konfigurasi had kuasa dan kebenaran tindakan bagi peranan ini.'}
                  </p>
                </div>
              </div>

              {/* Action Save Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {hasAnyChanges && (
                  <button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Simpan semua peranan ke pangkalan data Supabase"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Semua ({dirtyRoleIds.length})</span>
                  </button>
                )}
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Peranan Ini</span>
                  </button>
                )}
              </div>
            </div>

            {/* Capability Presets Selector */}
            <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Pratetap:
              </span>
              {Object.entries(ROLE_CAPABILITY_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
                  title={preset.description}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/70 p-3.5 sm:p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Carian modul, sub-ciri, kod..."
              value={rbacSearch}
              onChange={(e) => setRbacSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex overflow-x-auto gap-1.5 w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        {isLoading ? (
          <div className="p-8 sm:p-12 space-y-4">
            <div className="h-24 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
            <div className="h-24 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
            <div className="h-24 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-12 text-center text-text-muted bg-slate-900/40 rounded-2xl border border-slate-800">
            Tiada modul ditemui yang sepadan dengan carian.
          </div>
        ) : (
          <div className="space-y-4 pb-24">
            {filteredModules.map((moduleDef) => {
              const modCode = moduleDef.code
              const isExpanded = !!expandedModules[modCode]
              const currentRoleMatrix = matrixState[selectedRoleId] || {}
              const modState = currentRoleMatrix[modCode] || {
                view: false,
                create: false,
                edit: false,
                approve: false,
                delete: false,
                export: false,
                admin: false,
                features: {},
              }

              const isModuleActive = !!modState.view

              return (
                <div
                  key={modCode}
                  className={`border rounded-xl sm:rounded-2xl overflow-hidden transition-colors ${
                    isModuleActive
                      ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-90'
                  }`}
                >
                  {/* Module Header Row */}
                  <div className="p-4 sm:p-5 bg-slate-900/50 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleModuleAction(modCode, 'view')}
                        aria-label={`Toggle access for ${moduleDef.name}`}
                        className={`w-7 h-7 sm:w-6 sm:h-6 shrink-0 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                          isModuleActive
                            ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                            : 'border-2 border-slate-600 hover:border-teal-400 bg-slate-900'
                        }`}
                      >
                        {isModuleActive && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white truncate">{moduleDef.name}</h4>
                          <span className="text-xs text-slate-400 font-normal">({moduleDef.officialName})</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                            {moduleDef.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 sm:line-clamp-none">{moduleDef.description}</p>
                      </div>
                    </div>

                    {/* Actions Matrix Switches for Module Level */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                      {(['view', 'create', 'edit', 'approve', 'delete', 'export', 'admin'] as ActionType[]).map((action) => {
                        const isActionActive = !!modState[action]
                        const colors = actionColors[action]

                        return (
                          <button
                            key={action}
                            onClick={() => handleToggleModuleAction(modCode, action)}
                            className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors touch-manipulation ${
                              isActionActive
                                ? `${colors.bg} ${colors.text} ${colors.border}`
                                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                            }`}
                            title={ACTION_DEFINITIONS[action].description}
                          >
                            {actionIcons[action]}
                            <span className="capitalize">{action}</span>
                          </button>
                        )
                      })}

                      {/* Expand Sub-Features Button */}
                      {moduleDef.features.length > 0 && (
                        <button
                          onClick={() => toggleModuleExpand(modCode)}
                          className="min-h-[34px] min-w-[34px] p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ml-auto sm:ml-1 flex items-center justify-center"
                          title="Pecahan Sub-Ciri & Had Kuasa Terperinci"
                          aria-label="Pecahan Sub-Ciri"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub-Features Accordion */}
                  <AnimatePresence>
                    {isExpanded && moduleDef.features.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0.96 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.96 }}
                        className="origin-top bg-slate-950/80 divide-y divide-slate-800/80"
                      >
                        <div className="px-4 sm:px-6 py-2 bg-slate-900/60 text-[11px] text-slate-400 font-mono flex items-center justify-between border-b border-slate-800">
                          <span>Sub-Ciri & Keupayaan Tindakan Terperinci ({moduleDef.features.length} ciri)</span>
                          <span className="text-teal-400">Kawalan Granular Aktif</span>
                        </div>

                        {moduleDef.features.map((feature) => {
                          const featState = modState.features?.[feature.code] || {}

                          return (
                            <div
                              key={feature.code}
                              className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-900/30 transition-colors"
                            >
                              <div className="pl-3 border-l-2 border-teal-500/50">
                                <div className="text-xs font-bold text-slate-200">{feature.name}</div>
                                <p className="text-[11px] text-text-muted mt-0.5">{feature.description}</p>
                                <span className="text-[10px] font-mono text-text-muted mt-1 block">
                                  {feature.code}
                                </span>
                              </div>

                              {/* Feature-Level Supported Actions */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {feature.supportedActions.map((action) => {
                                  const isFeatActionActive = !!featState[action]
                                  const colors = actionColors[action]

                                  return (
                                    <button
                                      key={action}
                                      onClick={() => handleToggleFeatureAction(modCode, feature.code, action)}
                                      className={`min-h-[30px] px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 border transition-colors touch-manipulation ${
                                        isFeatActionActive
                                          ? `${colors.bg} ${colors.text} ${colors.border}`
                                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                      }`}
                                    >
                                      {actionIcons[action]}
                                      <span className="capitalize">{action}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {hasAnyChanges && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-6 lg:left-80 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-xl p-3.5 sm:p-4 rounded-xl sm:rounded-2xl max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/30 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Perubahan Had Kuasa Dikesan ({dirtyRoleIds.length} peranan)
                </p>
                <p className="text-xs text-slate-400 line-clamp-1 sm:line-clamp-none">
                  {hasChanges
                    ? `Perubahan dikesan bagi "${selectedRoleObj?.role_name}". Sila simpan untuk menyelaraskan ke pangkalan data Supabase.`
                    : `${dirtyRoleIds.length} peranan hospital mempunyai perubahan belum disimpan.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setMatrixState(JSON.parse(JSON.stringify(savedMatrixState)))}
                className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Set Semula
              </button>
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Peranan Ini'}
                </button>
              )}
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : `Simpan Semua (${dirtyRoleIds.length})`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminRbacTab
