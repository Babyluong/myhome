// src/modules/mytransporter/pages/TransporterRoleAssignmentPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Search } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { getUsers } from '@/services/userService'
import { getTransporterRoles, assignTransporterRole } from '../services/transporterService'
import type { UserWithRelations } from '@/shared/types/auth'
import { Card, CardContent, Badge, Input } from '@/components/ui'

const TransporterRoleAssignmentPage: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const { language } = useLanguage()
  const isEn = language !== 'ms'
  const toast = useToast()

  const [users, setUsers] = useState<UserWithRelations[]>([])
  const [transporterRoles, setTransporterRoles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Load users
      const userRes = await getUsers({ page: 1, pageSize: 100 })
      if (userRes && userRes.data) {
        setUsers(userRes.data)
      }

      // 2. Load transporter roles mapping
      const roleRes = await getTransporterRoles()
      if (roleRes.data) {
        setTransporterRoles(roleRes.data)
      }
    } catch (err: any) {
      toast.error(
        isEn ? 'Failed to Load Users' : 'Gagal Memuatkan Pengguna', 
        err.message || (isEn ? 'Please try again.' : 'Sila cuba lagi.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string | null) => {
    try {
      const res = await assignTransporterRole(userId, newRole)
      if (res.error) throw new Error(res.error)
      
      toast.success(
        isEn ? 'Update Successful' : 'Update Successful', 
        isEn ? 'User module access role updated successfully.' : 'Kebenaran peranan pengguna berjaya dikemaskini.'
      )
      
      // Update local state
      setTransporterRoles(prev => {
        const next = { ...prev }
        if (newRole) {
          next[userId] = newRole
        } else {
          delete next[userId]
        }
        return next
      })
    } catch (err: any) {
      toast.error(
        isEn ? 'Update Failed' : 'Ralat Mengemaskini', 
        err.message || (isEn ? 'Please try again.' : 'Sila cuba lagi.')
      )
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.department?.department_name && u.department.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getTransporterRoleLabel = (role: string | null) => {
    if (role === 'transport_driver') return <Badge variant="success">{isEn ? 'Duty Driver' : 'On-Duty Driver'}</Badge>
    if (role === 'transport_admin') return <Badge variant="error">{isEn ? 'Transport Admin' : 'Pentadbir Transport'}</Badge>
    return <Badge variant="gray">{isEn ? 'Standard Staff (Requester)' : 'Staff Biasa (Pemohon)'}</Badge>
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-6">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/transporter/dashboard')}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-semibold mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isEn ? 'Back to Dashboard' : 'Kembali ke Papan Pemuka'}</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-indigo-600 animate-pulse" />
          {isEn ? 'Staff Roles & Permission Assignments' : 'Kebenaran & Peranan Kakitangan (Module Access Controls)'}
        </h1>
        <p className="text-text-muted text-sm">
          {isEn 
            ? 'Assign designated hospital staff as Duty Drivers (for vehicle pre-trip logs) or Transport Administrators (for dispatch approvals).' 
            : 'Tentukan kakitangan yang mempunyai peranan sebagai On-Duty Driver atau Pentadbir Pengangkutan untuk meluluskan permohonan.'}
        </p>
      </div>

      {/* User Search Card */}
      <Card className="border border-border-default shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <Input 
              placeholder={isEn ? 'Search Staff by Name / Employee ID / Department' : 'Cari Pengguna melalui Nama / ID Pekerja / Jabatan'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-xs text-slate-400 flex items-center italic justify-end">
            {isEn ? '* Role changes take effect immediately on active sessions.' : '* Perubahan peranan berkuatkuasa serta-merta pada sesi pengguna.'}
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card className="border border-border-default shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-text-muted font-medium animate-pulse">
              {isEn ? 'Loading hospital staff roster...' : 'Loading hospital personnel records...'}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              {isEn ? 'No matching staff members found.' : 'Tiada kakitangan sepadan dijumpai.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-subtle/50 border-b border-border-subtle text-xs font-semibold text-text-muted uppercase tracking-wider">
                    <th className="px-6 py-4">{isEn ? 'Staff Member' : 'Kakitangan'}</th>
                    <th className="px-6 py-4">{isEn ? 'Employee ID / Email' : 'ID Pekerja / Email'}</th>
                    <th className="px-6 py-4">{isEn ? 'Department' : 'Jabatan Asal'}</th>
                    <th className="px-6 py-4">{isEn ? 'Current Transport Access' : 'Akses Pengangkutan Semasa'}</th>
                    <th className="px-6 py-4 text-right">{isEn ? 'Change Role' : 'Tukar Peranan Transporter'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-sm text-text-secondary">
                  {filteredUsers.map((u) => {
                    const currentRole = transporterRoles[u.id] || null
                    return (
                      <tr key={u.id} className="hover:bg-subtle/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-text-primary">{u.full_name}</div>
                          <div className="text-xxs text-slate-400 font-semibold">{u.jawatan || (isEn ? 'Staff' : 'Kakitangan')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs">{u.employee_id}</div>
                          <div className="text-xxs text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-muted">
                          {u.department?.department_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTransporterRoleLabel(currentRole)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <select
                            value={currentRole || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              handleRoleChange(u.id, val === '' ? null : val)
                            }}
                            className="bg-subtle/50 border border-border-default rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value="">{isEn ? 'None (Standard Requester Access)' : 'Tiada (Akses Pemohon Sahaja)'}</option>
                            <option value="transport_driver">{isEn ? 'Duty Driver (Driver Panel)' : 'On-Duty Driver (Driver)'}</option>
                            <option value="transport_admin">{isEn ? 'Transport Admin (Approvals)' : 'Pentadbir Transport (Admin)'}</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

export default TransporterRoleAssignmentPage
