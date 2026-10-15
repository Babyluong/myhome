import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Users, User, Shield, ChevronDown, ChevronUp, Search, Briefcase, AlertCircle } from 'lucide-react'
import { getDepartments } from '@/services/departmentService'
import { getUsers } from '@/services/userService'
import type { DepartmentWithRelations, UserWithRelations } from '@/types'

const SOFTWARE_MODULE_CODES = new Set([
  'system_porter',
  'system_transporter',
  'system_priviledging',
  'system_tempahan',
  'system_perhimpunan',
  'system_kunci',
  'system_cuti',
  'system_staff',
  'pharmacy_logistics',
  'pharmacy_formulari',
  'billing',
  'hr',
  'asset',
  'reports'
])

const isSoftwareModule = (code: string, name: string) => {
  const normalizedCode = (code || '').toLowerCase().trim()
  const normalizedName = (name || '').toLowerCase().trim()

  if (SOFTWARE_MODULE_CODES.has(normalizedCode)) return true
  if (normalizedCode.startsWith('system_')) return true
  if (
    [
      'myporter',
      'mypriviledging',
      'mytempahan',
      'mytransporter',
      'mywarrant',
      'myformulari',
      'myperhimpunan',
      'mykunci',
      'mycuti',
      'mystaff',
      'mysuhu',
      'mymsds',
      'myphis',
      'mycrossborder',
    ].some((m) => normalizedName.includes(m) || normalizedCode.includes(m))
  )
    return true

  return false
}

export const AdminDepartmentsTab: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentWithRelations[]>([])
  const [allUsers, setAllUsers] = useState<UserWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Selected department details view
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [deptsRes, usersRes] = await Promise.all([
        getDepartments({ page: 1, pageSize: 200 }),
        getUsers({ page: 1, pageSize: 200 }) // Load all users to client-side grouping
      ])

      setDepartments(deptsRes.data || [])
      setAllUsers(usersRes.data || [])
    } catch (err) {
      console.error('Error fetching departments tab details:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter out software modules and group duplicate hospital departments by normalized name
  const deduplicatedDepts = React.useMemo(() => {
    const deptMap = new Map<string, {
      dept: DepartmentWithRelations
      ids: Set<string>
    }>()

    // Exclude software system modules (MyPorter, MyPriviledging, MyTempahan, MyTransporter, MyWarrant, MyStaff, MyCuti, MyFormulari, MyKunci, MyPerhimpunan, etc.)
    const realHospitalDepts = departments.filter((d) => !isSoftwareModule(d.department_code, d.department_name))

    realHospitalDepts.forEach((d) => {
      const key = (d.department_name || d.department_code).toLowerCase().trim()
      if (!deptMap.has(key)) {
        deptMap.set(key, {
          dept: { ...d },
          ids: new Set([d.id])
        })
      } else {
        const existing = deptMap.get(key)!
        existing.ids.add(d.id)

        // Prefer detailed description and non-null HOD if present
        if (!existing.dept.description || (d.description && d.description.length > (existing.dept.description?.length || 0))) {
          existing.dept.description = d.description
        }
        if (!existing.dept.head_of_department && d.head_of_department) {
          existing.dept.head_of_department = d.head_of_department
        }
      }
    })

    return Array.from(deptMap.values()).map(item => ({
      dept: item.dept,
      ids: Array.from(item.ids)
    }))
  }, [departments])

  const getDeptMembers = (ids: string[]) => {
    const idSet = new Set(ids)
    return allUsers.filter((u) => u.department_id && idSet.has(u.department_id))
  }

  const toggleExpand = (deptId: string) => {
    setExpandedDeptId((prev) => (prev === deptId ? null : deptId))
  }

  const filteredDepts = deduplicatedDepts.filter(
    ({ dept }) =>
      dept.department_name.toLowerCase().includes(search.toLowerCase()) ||
      dept.department_code.toLowerCase().includes(search.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(search.toLowerCase()))
  )

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header filtering */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/90 p-3.5 sm:p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Carian jabatan atau kod..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <div className="text-xs text-text-secondary font-bold font-semibold uppercase tracking-wider self-end sm:self-auto">
          Jumlah Jabatan: <span className="text-white font-bold tabular-nums">{filteredDepts.length}</span>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="p-8 sm:p-12 space-y-4">
          <div className="h-20 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-slate-900/40 rounded-xl border border-slate-800 p-6">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-text-muted flex items-center justify-center border border-slate-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Tiada Jabatan Dijumpai</p>
            <p className="text-text-muted text-xs mt-1">Cuba gunakan kata kunci carian yang lain.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredDepts.map(({ dept, ids }) => {
            const isExpanded = expandedDeptId === dept.id
            const members = getDeptMembers(ids)
            const count = members.length

            return (
              <motion.div
                key={dept.id}
                layout="position"
                className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden transition-colors hover:border-slate-700"
              >
                {/* Header view */}
                <div
                  onClick={() => toggleExpand(dept.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleExpand(dept.id)
                    }
                  }}
                  className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <div className="p-2.5 sm:p-3 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 mt-0.5 sm:mt-0 shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">{dept.department_name}</h3>
                        <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                          {dept.department_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2 sm:line-clamp-none">
                        {dept.description || 'Tiada keterangan disediakan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end border-t border-slate-800/80 pt-3 md:pt-0 md:border-0">
                    <div className="text-left md:text-right">
                      <div className="text-[11px] text-text-muted">Ketua Jabatan (HOD)</div>
                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="truncate max-w-[140px]">{dept.head_of_department?.full_name || 'Belum Ditetapkan'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-left md:text-right">
                        <div className="text-[11px] text-text-muted">Ahli Aktif</div>
                        <div className="text-sm font-bold text-white flex items-center gap-1 mt-0.5 tabular-nums">
                          <Users className="w-3.5 h-3.5 text-teal-400" /> {count}
                        </div>
                      </div>

                      <div className="min-w-[36px] min-h-[36px] rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Member List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ scaleY: 0.96, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0.96, opacity: 0 }}
                      className="origin-top overflow-hidden border-t border-slate-800"
                    >
                      <div className="p-4 sm:p-5 bg-slate-950/60 space-y-3 sm:space-y-4">
                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> Senarai Ahli Jabatan & Kakitangan ({members.length})
                        </h4>

                        {members.length === 0 ? (
                          <div className="text-center py-6 text-text-muted text-xs bg-slate-900/40 rounded-lg border border-slate-800">
                            Tiada kakitangan ditugaskan di jabatan ini.
                          </div>
                        ) : (
                          <>
                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-800">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                                    <th className="p-3.5">Nama & Butiran Staf</th>
                                    <th className="p-3.5">No. Pekerja</th>
                                    <th className="p-3.5">Peranan Keahlian</th>
                                    <th className="p-3.5">Jawatan KKM</th>
                                    <th className="p-3.5">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-slate-300 text-xs font-medium">
                                  {members.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                                      <td className="p-3.5">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 text-xs font-bold uppercase overflow-hidden shrink-0">
                                            {m.profile_photo_url ? (
                                              <img src={m.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              m.full_name?.charAt(0) || 'U'
                                            )}
                                          </div>
                                          <div>
                                            <div className="text-white font-bold">{m.full_name}</div>
                                            <div className="text-[11px] text-text-muted font-mono">{m.ic_number}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3.5 font-mono text-slate-400">{m.employee_id || '—'}</td>
                                      <td className="p-3.5">
                                        <div className="flex items-center gap-1 text-slate-300 font-semibold">
                                          <Shield className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                          <span>{m.role?.role_name}</span>
                                        </div>
                                      </td>
                                      <td className="p-3.5">
                                        <div className="flex items-center gap-1 text-slate-400">
                                          <Briefcase className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                          <span>{m.jawatan || '—'}</span>
                                        </div>
                                      </td>
                                      <td className="p-3.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusStyle(m.status)}`}>
                                          {m.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="sm:hidden divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden bg-slate-900/60">
                              {members.map((m) => (
                                <div key={m.id} className="p-3 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 text-xs font-bold uppercase overflow-hidden shrink-0">
                                        {m.profile_photo_url ? (
                                          <img src={m.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          m.full_name?.charAt(0) || 'U'
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-white">{m.full_name}</div>
                                        <div className="text-[10px] text-text-muted font-mono">IC: {m.ic_number}</div>
                                      </div>
                                    </div>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${getStatusStyle(m.status)}`}>
                                      {m.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                                    <div className="flex items-center gap-1 font-semibold text-slate-300">
                                      <Shield className="w-3 h-3 text-text-muted shrink-0" />
                                      <span>{m.role?.role_name}</span>
                                    </div>
                                    <span className="font-mono text-[10px]">
                                      {m.employee_id || '—'}
                                    </span>
                                  </div>

                                  {m.jawatan && (
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                      <Briefcase className="w-3 h-3 text-text-muted shrink-0" />
                                      <span>{m.jawatan}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminDepartmentsTab
