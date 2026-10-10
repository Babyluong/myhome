import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Shield,
  Activity,
  UserCheck,
  Users,
  Building2,
  Lock,
  Settings,
  ScrollText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'
import { getAccessRequests } from '@/services/accessRequestManagementService'

// Sub-components import
import { AdminOverviewTab } from './AdminOverviewTab'
import { AdminApprovalsTab } from './AdminApprovalsTab'
import { AdminUsersTab } from './AdminUsersTab'
import { AdminDepartmentsTab } from './AdminDepartmentsTab'
import { AdminRbacTab } from './AdminRbacTab'
import { AdminSystemLogsTab } from './AdminSystemLogsTab'

export const MyAdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0)

  const { user } = useAuthStore()

  useEffect(() => {
    let isMounted = true
    const fetchPendingCount = async () => {
      try {
        const res = await getAccessRequests({ page: 1, pageSize: 1, status: 'pending' })
        if (isMounted) {
          setPendingApprovalsCount(res.total || 0)
        }
      } catch (err) {
        // Silently catch count fetch error
      }
    }

    fetchPendingCount()
    return () => {
      isMounted = false
    }
  }, [activeTab])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'approvals', label: 'Access Approvals', icon: UserCheck, badge: pendingApprovalsCount },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'rbac', label: 'Access Control (RBAC)', icon: Lock },
    { id: 'logs', label: 'System Logs', icon: ScrollText }
  ]

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverviewTab onTabChange={setActiveTab} />
      case 'approvals':
        return <AdminApprovalsTab />
      case 'users':
        return <AdminUsersTab />
      case 'departments':
        return <AdminDepartmentsTab />
      case 'rbac':
        return <AdminRbacTab />
      case 'logs':
        return <AdminSystemLogsTab />
      default:
        return <AdminOverviewTab onTabChange={setActiveTab} />
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 min-h-screen text-text-primary">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <button
          onClick={() => navigate(ROUTES.HUB)}
          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded min-h-[32px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Main Hub</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-300 font-medium">MyAdmin</span>
      </div>

      {/* Title Header & Restrained Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-default">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-surface border border-border-default flex items-center justify-center text-accent-base flex-shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">MyAdmin</h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent-base/10 text-accent-base border border-accent-base/20 uppercase tracking-wide">
                Admin Console
              </span>
            </div>
            <p className="text-text-muted text-xs sm:text-sm mt-0.5">
              Hospital Operations Control & Central Administration Ecosystem
            </p>
          </div>
        </div>

        {/* Action Controls & Real Role Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {user?.role?.role_code === 'system_admin' && (
            <button
              onClick={() => navigate(ROUTES.ADMIN_MODULES)}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold bg-surface text-accent-base border border-border-default hover:bg-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base/50"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>System Admin Console</span>
            </button>
          )}
          <div className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-surface border border-border-default text-xs text-text-secondary font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{user?.role?.role_name || 'System Admin'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Header bar - Responsive Horizontal Scroll with proper tap targets */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="border-b border-border-default flex overflow-x-auto no-scrollbar scroll-smooth gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === activeTab

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative min-h-[44px] px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap outline-none select-none rounded-t-lg ${
                  isActive
                    ? 'text-accent-base bg-surface font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-primary hover:bg-subtle/50'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-accent-base' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 tabular-nums">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-base"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Tab View wrapper */}
      <div className="pt-1">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {renderActiveTab()}
        </motion.div>
      </div>
    </div>
  )
}

export default MyAdminDashboard
