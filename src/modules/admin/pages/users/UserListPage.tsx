// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Users,
  UserPlus,
  TrendingUp,
  FileText,
  AlertCircle,
  Mail,
  Building2,
  Briefcase,
  Clock,
} from 'lucide-react'
import { Button, Table, Pagination, Input, Select, Badge, Avatar, LoadingOverlay, Skeleton, SkeletonTable, SkeletonMobileCardList } from '@/components/ui'
import { getUsers, bulkUpdateUserStatus, bulkDeleteUsers } from '@/services/userService'
import { getAllRoles } from '@/services/roleService'
import { getDepartmentsByHospital } from '@/services/departmentService'
import { getAllHospitals } from '@/services/hospitalService'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES, USER_STATUS, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, SYSTEM_ROLES } from '@/lib/constants'
import { formatDate, cn } from '@/lib/utils'
import { ModulePageHeader } from '@/shared/components/ui/ModulePageHeader'
import { Fab } from '@/shared/components/mobile'
import type { UserWithRelations, SortConfig, Role, Department, Hospital } from '@/types'

export const UserListPage: React.FC = () => {
  const navigate = useNavigate()
  const { error: showError, success: showSuccess, warning: showWarning } = useToastStore()
  const { user } = useAuthStore()
  const isHospitalAdmin = user?.role?.role_code === SYSTEM_ROLES.HOSPITAL_ADMIN
  const userHospitalId = user?.hospital_id

  const [users, setUsers] = useState<UserWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [hospitalFilter, setHospitalFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)
  
  // Filter options
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [rolesData, hospitalsData] = await Promise.all([
          getAllRoles(),
          !isHospitalAdmin ? getAllHospitals() : Promise.resolve([]),
        ])
        setRoles(rolesData)
        if (!isHospitalAdmin) {
          setHospitals(hospitalsData)
        }
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }
    fetchFilterOptions()
  }, [isHospitalAdmin])

  // Fetch departments when hospital filter changes or on mount for Hospital Admin
  useEffect(() => {
    const fetchDepartmentsForHospital = async () => {
      const effectiveHospitalId = isHospitalAdmin && userHospitalId 
        ? userHospitalId 
        : hospitalFilter !== 'all' 
          ? hospitalFilter 
          : null

      if (effectiveHospitalId) {
        try {
          const depts = await getDepartmentsByHospital(effectiveHospitalId)
          setDepartments(depts)
        } catch (error) {
          console.error('Error fetching departments:', error)
          setDepartments([])
        }
      } else if (!isHospitalAdmin) {
        // For System Admin, clear departments if no hospital selected
        setDepartments([])
      }
    }
    fetchDepartmentsForHospital()
  }, [hospitalFilter, isHospitalAdmin, userHospitalId])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      // For Hospital Admin, always filter by their hospital_id
      const effectiveHospitalId = isHospitalAdmin && userHospitalId 
        ? userHospitalId 
        : hospitalFilter !== 'all' 
          ? hospitalFilter 
          : undefined

      const result = await getUsers({
        page: currentPage,
        pageSize,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        hospitalId: effectiveHospitalId,
        departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
        sort: sortConfig,
      })

      // Filter by role on client side if needed (since userService doesn't support roleId filter yet)
      let filteredData = result.data
      if (roleFilter !== 'all') {
        filteredData = filteredData.filter((user) => user.role?.id === roleFilter)
      }

      setUsers(filteredData)
      setTotal(roleFilter !== 'all' ? filteredData.length : result.total)
      setTotalPages(roleFilter !== 'all' ? Math.ceil(filteredData.length / pageSize) : result.totalPages)
      setSelectedUsers([]) // Clear selection on new fetch
    } catch (error) {
      showError('Error', 'Failed to load users. Please try again.')
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, search, statusFilter, roleFilter, departmentFilter, hospitalFilter, sortConfig, isHospitalAdmin, userHospitalId])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Calculate statistics
  const stats = useMemo(() => {
    const active = users.filter((u) => u.status === USER_STATUS.ACTIVE).length
    const inactive = users.filter((u) => u.status === USER_STATUS.INACTIVE).length
    const suspended = users.filter((u) => u.status === USER_STATUS.SUSPENDED).length
    const pending = users.filter((u) => u.status === USER_STATUS.PENDING).length
    return { active, inactive, suspended, pending, total }
  }, [users, total])

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : undefined
      }
      return { key, direction: 'asc' }
    })
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      showWarning('No Selection', 'Please select at least one user.')
      return
    }

    setIsBulkActionLoading(true)
    try {
      if (action === 'delete') {
        if (!confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
          setIsBulkActionLoading(false)
          return
        }
        await bulkDeleteUsers(selectedUsers)
        showSuccess('Success', `${selectedUsers.length} user(s) deleted successfully.`)
      } else {
        const status = action === 'activate' ? USER_STATUS.ACTIVE : USER_STATUS.INACTIVE
        await bulkUpdateUserStatus(selectedUsers, status)
        showSuccess('Success', `${selectedUsers.length} user(s) ${action}d successfully.`)
      }
      setSelectedUsers([])
      fetchUsers()
    } catch (error) {
      showError('Error', `Failed to ${action} users. Please try again.`)
    } finally {
      setIsBulkActionLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? users.map((u) => u.id) : [])
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    )
  }

  const columns = [
    {
      key: 'select',
      label: '',
      render: (_: unknown, row: UserWithRelations) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation()
            handleSelectUser(row.id, e.target.checked)
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-teal-600 border-border-default rounded focus:ring-teal-500"
        />
      ),
      className: 'w-12',
    },
    {
      key: 'profile_photo_url',
      label: '',
      render: (_: unknown, row: UserWithRelations) => (
        <Avatar
          src={row.profile_photo_url}
          alt={row.full_name}
          fallback={row.full_name.charAt(0)}
          size="md"
          className="ring-2 ring-border-default"
        />
      ),
      className: 'w-20',
    },
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (_: unknown, row: UserWithRelations) => (
        <div className="space-y-1">
          <div className="font-semibold text-text-primary">{row.full_name}</div>
          <div className="text-sm text-text-muted flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: 'employee_id',
      label: 'Employee ID',
      sortable: true,
      render: (_: unknown, row: UserWithRelations) => (
        <span className="font-mono text-sm">{row.employee_id}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (_: unknown, row: UserWithRelations) => (
        <span className="text-sm">{row.role?.role_name || 'N/A'}</span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (_: unknown, row: UserWithRelations) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-text-secondary">{row.department?.department_name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'hospital',
      label: 'Hospital',
      render: (_: unknown, row: UserWithRelations) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-text-secondary">{row.hospital?.hospital_name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_: unknown, row: UserWithRelations) => {
        const statusColors = {
          active: 'success',
          inactive: 'gray',
          suspended: 'error',
          pending: 'warning',
        } as const

        return (
          <Badge variant={statusColors[row.status] || 'gray'}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        )
      },
    },
    {
      key: 'last_login',
      label: 'Last Login',
      sortable: true,
      render: (_: unknown, row: UserWithRelations) => (
        <span className="text-sm text-text-muted">
          {row.last_login ? formatDate(row.last_login) : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: UserWithRelations) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`${ROUTES.ADMIN_USERS}/${row.id}`)
            }}
            className="p-1.5 text-text-muted hover:text-teal-600 hover:bg-accent-base/10 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Are you sure you want to delete ${row.full_name}?`)) {
                bulkDeleteUsers([row.id]).then(() => {
                  showSuccess('Success', 'User deleted successfully.')
                  fetchUsers()
                })
              }
            }}
            className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'w-24',
    },
  ]

  return (
    <div className="space-y-6">
      {isBulkActionLoading && <LoadingOverlay message="Processing..." />}

      {/* Module Page Header */}
      <ModulePageHeader
        badge="CENTRAL ADMINISTRATION"
        title="User Management"
        description="Manage hospital system users, roles, organizational units, and access permissions."
        icon={<Users className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={isLoading}
              className="border-border-default text-text-secondary hover:bg-subtle text-xs"
              leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`${ROUTES.ADMIN_USERS}/new`)}
              className="bg-accent-base hover:bg-accent-dark text-white font-semibold text-xs shadow-xs"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New User
            </Button>
          </div>
        }
      />

      {/* Statistics Cards - Smaller */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        <div className="bg-surface rounded-xl border border-border-default shadow-xs p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-0.5">
            {isLoading ? (
              <Skeleton className="h-8 w-14 my-0.5 rounded-lg !bg-subtle" />
            ) : (
              <p className="text-2xl font-bold text-text-primary">{stats.active}</p>
            )}
            <p className="text-xs font-medium text-text-muted">Active Users</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-default shadow-xs p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-subtle text-text-muted rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-text-muted" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-0.5">
            {isLoading ? (
              <Skeleton className="h-8 w-14 my-0.5 rounded-lg !bg-subtle" />
            ) : (
              <p className="text-2xl font-bold text-text-primary">{stats.inactive}</p>
            )}
            <p className="text-xs font-medium text-text-muted">Inactive</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-default shadow-xs p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-error-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-0.5">
            {isLoading ? (
              <Skeleton className="h-8 w-14 my-0.5 rounded-lg !bg-subtle" />
            ) : (
              <p className="text-2xl font-bold text-text-primary">{stats.suspended}</p>
            )}
            <p className="text-xs font-medium text-text-muted">Suspended</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-default shadow-xs p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-0.5">
            {isLoading ? (
              <Skeleton className="h-8 w-14 my-0.5 rounded-lg !bg-subtle" />
            ) : (
              <p className="text-2xl font-bold text-text-primary">{stats.pending}</p>
            )}
            <p className="text-xs font-medium text-text-muted">Pending</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-default shadow-xs p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-accent-base/10 text-accent-base rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-0.5">
            {isLoading ? (
              <Skeleton className="h-8 w-16 my-0.5 rounded-lg !bg-subtle" />
            ) : (
              <p className="text-2xl font-bold text-text-primary">{total}</p>
            )}
            <p className="text-xs font-medium text-text-muted">Total Users</p>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-surface rounded-xl border border-border-default shadow-xs p-5"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by name, email, employee ID, or role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-12 h-11 border-border-default focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-40 h-11 border-border-default focus:border-primary-500"
              options={[
                { value: 'all', label: 'All Status' },
                { value: USER_STATUS.ACTIVE, label: 'Active' },
                { value: USER_STATUS.INACTIVE, label: 'Inactive' },
                { value: USER_STATUS.SUSPENDED, label: 'Suspended' },
                { value: USER_STATUS.PENDING, label: 'Pending' },
              ]}
            />

            <Select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value)
                setCurrentPage(1)
              }}
              disabled={departments.length === 0}
              className="w-full sm:w-48 h-11 border-border-default focus:border-primary-500"
              placeholder={departments.length === 0 ? 'No departments' : 'Select Department'}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map((d) => ({
                  value: d.id,
                  label: d.department_name,
                })),
              ]}
            />
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-subtle border border-border-default rounded-xl p-4 flex items-center justify-between shadow-xs"
        >
          <span className="text-sm font-semibold text-primary-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('activate')}
              leftIcon={<UserCheck className="w-4 h-4" />}
              className="border-primary-300 text-primary-700 hover:bg-primary-100"
            >
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('deactivate')}
              leftIcon={<UserX className="w-4 h-4" />}
              className="border-border-default"
            >
              Deactivate
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUsers([])}
            >
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-border-default bg-subtle/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-border-default rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-text-secondary">Select All</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-text-muted">
                Total: <span className="font-semibold text-text-primary">{total}</span> users
              </span>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div>
            <div className="hidden md:block">
              <SkeletonTable columns={columns.length} rows={pageSize || 5} className="border-none shadow-none rounded-none !bg-transparent" />
            </div>
            <div className="md:hidden p-4">
              <SkeletonMobileCardList count={4} />
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table
            data={users}
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            isLoading={isLoading}
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-text-muted font-medium">No users found</p>
                <p className="text-sm text-text-muted mt-1">Try adjusting your filters</p>
              </div>
            }
            onRowClick={(row) => navigate(`${ROUTES.ADMIN_USERS}/${row.id}`)}
          />
          </div>
        )}
        <div className="border-t border-border-default bg-subtle/30">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            total={total}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      </motion.div>

      {/* Mobile Floating Action Button */}
      <Fab 
        onClick={() => navigate(`${ROUTES.ADMIN_USERS}/new`)} 
        aria-label="Add New User" 
      />
    </div>
  )
}

export default UserListPage

