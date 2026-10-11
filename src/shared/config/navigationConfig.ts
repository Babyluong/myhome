import React from 'react'
import {
  LayoutDashboard,
  Users,
  Building,
  Building2,
  HardHat,
  CreditCard,
  Settings,
  Shield,
  FileText,
  Package,
  ShoppingCart,
  ClipboardList,
  Truck,
  PersonStanding,
  BarChart3,
  Activity,
  Database,
  Megaphone,
  Lock,
  ScrollText,
  AlertTriangle,
  PieChart,
  Thermometer,
  Key,
  Car,
  Calendar,
  Wrench,
  Globe,
  FlaskConical,
  MapPin,
  Briefcase,
  CalendarDays,
  Bell,
  Clock,
  ShieldCheck,
  Network,
  Search,
  Flame,
  Droplets,
  TrendingDown,
  Layers,
  Pill,
  Plus,
  Radio,
  UserCheck,
  BookOpen,
  Printer,
  Award,
  ShieldAlert,
  QrCode,
  PackageCheck,
  Boxes,
  Baby,
  ArrowRightLeft,
} from 'lucide-react'
import { ROUTES, SYSTEM_ROLES } from '@/lib/constants'
import { useRbacStore } from '@/stores/rbacStore'
import { type SidebarModuleCode } from '@/shared/utils/moduleNavigation'
import { isPharmacyLogisticsUser } from '@/shared/utils/inventoryRbac'

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: string[]
  children?: NavItem[]
  module?: SidebarModuleCode
  departmentCheck?: (user: any) => boolean
}

export const PHARMACY_ROLES = [
  SYSTEM_ROLES.PHARMACY_DIRECTOR,
  SYSTEM_ROLES.PHARMACY_MANAGER,
  SYSTEM_ROLES.PHARMACIST,
  SYSTEM_ROLES.PHARMACY_ASSISTANT,
  SYSTEM_ROLES.ASSISTANT_PHARMACIST,
  SYSTEM_ROLES.PHARMACY_STOREKEEPER,
  SYSTEM_ROLES.PHARMACY_STAFF,
]

export const OXYGEN_ROLES = [
  SYSTEM_ROLES.SYSTEM_ADMIN,
  SYSTEM_ROLES.HOSPITAL_ADMIN,
  SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR,
  SYSTEM_ROLES.PHARMACY_DIRECTOR,
  SYSTEM_ROLES.PHARMACY_MANAGER,
  SYSTEM_ROLES.PHARMACIST,
  SYSTEM_ROLES.PHARMACY_ASSISTANT,
  SYSTEM_ROLES.ASSISTANT_PHARMACIST,
  SYSTEM_ROLES.PHARMACY_STOREKEEPER,
  SYSTEM_ROLES.PHARMACY_STAFF,
  SYSTEM_ROLES.NURSE,
  SYSTEM_ROLES.DOCTOR,
  SYSTEM_ROLES.MEDICAL_OFFICER,
  SYSTEM_ROLES.ASSISTANT_MEDICAL_OFFICER,
  SYSTEM_ROLES.STAFF,
]

export const PRIVILEDGING_STAFF_CHILDREN: NavItem[] = [
  { label: 'Dashboard', href: '/priviledging', icon: LayoutDashboard },
  { label: 'Credentialing Criteria', href: '/priviledging/criteria', icon: Award },
  { label: 'Procedure Catalog (500+)', href: '/priviledging/catalog', icon: BookOpen },
  { label: 'My Log & Submissions', href: '/priviledging/my-submissions', icon: FileText },
  { label: 'Print Privileging Certificate', href: '/priviledging/print', icon: Printer },
]

export const PRIVILEDGING_ADMIN_CHILDREN: NavItem[] = [
  { label: 'Committee Dashboard', href: '/priviledging', icon: LayoutDashboard },
  { label: 'Committee Review & Approvals', href: '/priviledging/review-queue', icon: ShieldCheck },
  { label: 'Staff Progress', href: '/priviledging/staff-progress', icon: Users },
  { label: 'Credentialing Criteria', href: '/priviledging/criteria', icon: Award },
  { label: 'MOH Procedure Catalog', href: '/priviledging/catalog', icon: BookOpen },
  { label: 'Certificate Verification & Print', href: '/priviledging/print', icon: Printer },
]

export const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [SYSTEM_ROLES.SYSTEM_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR],
    module: 'admin',
  },
  {
    label: 'Administration',
    href: ROUTES.ADMIN,
    icon: Shield,
    roles: [SYSTEM_ROLES.SYSTEM_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR],
    module: 'admin',
    children: [
      { label: 'Users', href: ROUTES.ADMIN_USERS, icon: Users, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'Access Requests', href: ROUTES.ADMIN_ACCESS_REQUESTS, icon: FileText, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'Memo Approval', href: ROUTES.ADMIN_MEMOS, icon: Megaphone, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'Sensitive Data Requests', href: ROUTES.ADMIN_SENSITIVE_DATA_REQUESTS, icon: Lock, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'Hospitals', href: ROUTES.ADMIN_HOSPITALS, icon: Building2, roles: [SYSTEM_ROLES.SYSTEM_ADMIN] },
      { label: 'Clinics', href: ROUTES.ADMIN_CLINICS, icon: Building2, roles: [SYSTEM_ROLES.SYSTEM_ADMIN] },
      { label: 'Departments', href: ROUTES.ADMIN_DEPARTMENTS, icon: Building2, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'Roles & Permissions', href: ROUTES.ADMIN_ROLES, icon: Shield, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'Settings', href: ROUTES.ADMIN_SETTINGS, icon: Settings },
    ],
  },
  {
    label: 'Monitoring',
    href: '/admin/monitoring',
    icon: Activity,
    roles: [SYSTEM_ROLES.SYSTEM_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR],
    module: 'admin',
    children: [
      { label: 'System Health', href: ROUTES.ADMIN_HOSPITAL_HEALTH, icon: Activity, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'System Logs', href: ROUTES.ADMIN_HOSPITAL_LOGS, icon: ScrollText, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'Backup Status', href: ROUTES.ADMIN_HOSPITAL_BACKUPS, icon: Database, roles: [SYSTEM_ROLES.HOSPITAL_ADMIN, SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR] },
      { label: 'System Health', href: ROUTES.ADMIN_MONITORING, icon: Activity, roles: [SYSTEM_ROLES.SYSTEM_ADMIN] },
      { label: 'System Logs', href: ROUTES.ADMIN_SYSTEM_LOGS, icon: ScrollText, roles: [SYSTEM_ROLES.SYSTEM_ADMIN] },
      { label: 'Backups', href: ROUTES.ADMIN_BACKUPS, icon: Database, roles: [SYSTEM_ROLES.SYSTEM_ADMIN] },
      { label: 'Alerts', href: ROUTES.ADMIN_ALERTS, icon: ClipboardList, roles: [SYSTEM_ROLES.SYSTEM_ADMIN] },
      { label: 'Audit Logs', href: ROUTES.ADMIN_AUDIT_LOGS, icon: ClipboardList },
    ],
  },
  {
    label: 'Dashboard',
    href: ROUTES.MYWARRANT_DASHBOARD,
    icon: LayoutDashboard,
    roles: PHARMACY_ROLES,
    module: 'pharmacy',
  },
  {
    label: 'Financial',
    href: ROUTES.PHARMACY_FINANCIAL,
    icon: BarChart3,
    roles: PHARMACY_ROLES,
    module: 'pharmacy',
    children: [
      { label: 'Warrant', href: ROUTES.PHARMACY_WARRANT, icon: FileText },
      { label: 'APPL Allocation', href: ROUTES.PHARMACY_APPL_ALLOCATION, icon: FileText },
      { label: 'CC Allocation', href: ROUTES.PHARMACY_CC_ALLOCATION, icon: FileText },
      { label: 'LP Allocation', href: ROUTES.PHARMACY_LP_ALLOCATION, icon: FileText },
      { label: 'Budget Forecasting', href: ROUTES.PHARMACY_FORECAST, icon: BarChart3 },
    ],
  },
  {
    label: 'Procurement',
    href: ROUTES.PHARMACY_PROCUREMENT,
    icon: ShoppingCart,
    roles: PHARMACY_ROLES,
    module: 'pharmacy',
    children: [
      { label: 'Purchase Orders', href: ROUTES.PHARMACY_PO, icon: ShoppingCart },
      { label: 'LPO', href: ROUTES.PHARMACY_LPO, icon: FileText },
      { label: 'Order Tracking', href: ROUTES.PHARMACY_ORDER_TRACKING, icon: ClipboardList },
      { label: 'Received Item', href: ROUTES.PHARMACY_RECEIVING, icon: FileText },
      { label: 'Payment', href: ROUTES.PHARMACY_PAYMENT, icon: FileText },
      { label: 'Credit Notes', href: ROUTES.PHARMACY_CREDIT_NOTE, icon: FileText },
      { label: 'Penalty', href: ROUTES.PHARMACY_PENALTY, icon: AlertTriangle },
      { label: 'LOU', href: ROUTES.PHARMACY_LOU, icon: FileText },
      { label: 'Supplier Performance', href: ROUTES.PHARMACY_SUPPLIER_PERFORMANCE, icon: BarChart3 },
    ],
  },
  {
    label: 'Oxygen Dashboard',
    href: ROUTES.PHARMACY_OXYGEN,
    icon: LayoutDashboard,
    module: 'oxygen',
  },
  {
    label: 'Cylinder Inventory',
    href: ROUTES.PHARMACY_OXYGEN_CYLINDERS,
    icon: Database,
    module: 'oxygen',
  },
  {
    label: 'Cylinder Request',
    href: ROUTES.PHARMACY_OXYGEN_CONSUMPTION,
    icon: ShoppingCart,
    module: 'oxygen',
  },
  {
    label: 'QR Generator',
    href: '/pharmacy/oxygen/qr',
    icon: QrCode,
    module: 'oxygen',
  },
  {
    label: 'KEW.PS-4 Cylinder Ledger',
    href: ROUTES.PHARMACY_OXYGEN_LEDGER,
    icon: ScrollText,
    module: 'oxygen',
  },
  {
    label: 'Stock Reconciliation',
    href: '/pharmacy/oxygen/reconciliation',
    icon: FileText,
    module: 'oxygen',
  },
  {
    label: 'Cylinder Report',
    href: ROUTES.PHARMACY_OXYGEN_REPORTS,
    icon: BarChart3,
    module: 'oxygen',
  },
  {
    label: 'Cylinder Maintenance',
    href: '/pharmacy/oxygen/maintenance',
    icon: Wrench,
    module: 'oxygen',
  },
  {
    label: 'Catalog',
    href: ROUTES.PHARMACY_SUPPLIER_CATALOG,
    icon: ClipboardList,
    roles: PHARMACY_ROLES,
    module: 'pharmacy',
    children: [
      { label: 'Supplier Catalog', href: ROUTES.PHARMACY_SUPPLIER_CATALOG, icon: Truck },
      { label: 'Hospital Facilities', href: ROUTES.PHARMACY_HOSPITAL_FACILITY, icon: Building2 },
      { label: 'Clinic Facilities', href: ROUTES.PHARMACY_CLINIC_FACILITY, icon: Building2 },
    ],
  },
  {
    label: 'Reports',
    href: ROUTES.PHARMACY_REPORTS,
    icon: PieChart,
    roles: PHARMACY_ROLES,
    module: 'pharmacy',
    children: [
      { label: 'Procurement Reports', href: ROUTES.PHARMACY_REPORTS_PROCUREMENT, icon: FileText },
      { label: 'Financial Reports', href: ROUTES.PHARMACY_REPORTS_FINANCIAL, icon: FileText },
    ],
  },
  {
    label: 'System Logs',
    href: ROUTES.PHARMACY_LOGS,
    icon: ScrollText,
    roles: PHARMACY_ROLES,
    module: 'pharmacy',
  },
  {
    label: 'Dashboard',
    href: ROUTES.PHARMACY_INVENTORY,
    icon: LayoutDashboard,
    roles: PHARMACY_ROLES,
    module: 'inventory',
  },
  {
    label: 'Inventory Catalog',
    href: ROUTES.PHARMACY_DRUGS,
    icon: Package,
    roles: PHARMACY_ROLES,
    module: 'inventory',
    departmentCheck: (u) => isPharmacyLogisticsUser(u),
    children: [
      { label: 'Drug Inventory', href: ROUTES.PHARMACY_DRUGS, icon: Package, departmentCheck: (u) => isPharmacyLogisticsUser(u) },
      { label: 'Non-Drug Inventory', href: ROUTES.PHARMACY_NON_DRUGS, icon: ClipboardList, departmentCheck: (u) => isPharmacyLogisticsUser(u) },
    ],
  },
  {
    label: 'Facility Inventory',
    href: ROUTES.PHARMACY_FACILITY_DRUGS,
    icon: Building2,
    roles: PHARMACY_ROLES,
    module: 'inventory',
    children: [
      { label: 'Drug', href: ROUTES.PHARMACY_FACILITY_DRUGS, icon: Package },
      { label: 'Non-Drug', href: ROUTES.PHARMACY_FACILITY_NON_DRUGS, icon: ClipboardList },
    ],
  },
  {
    label: 'Store Location Management',
    href: ROUTES.PHARMACY_STORE_LOCATIONS,
    icon: MapPin,
    roles: PHARMACY_ROLES,
    module: 'inventory',
  },
  {
    label: 'KEW.PS-4 Ledger',
    href: ROUTES.PHARMACY_LEDGER,
    icon: ScrollText,
    roles: PHARMACY_ROLES,
    module: 'inventory',
  },
  {
    label: 'Distribution',
    href: ROUTES.PHARMACY_DISTRIBUTION_INDENT,
    icon: Truck,
    roles: PHARMACY_ROLES,
    module: 'inventory',
    children: [
      { label: 'Indent Requests', href: ROUTES.PHARMACY_DISTRIBUTION_INDENT, icon: ClipboardList },
      { label: 'Issue Counter', href: ROUTES.PHARMACY_DISTRIBUTION_ISSUE, icon: Package },
      { label: 'Indent Entitlement', href: ROUTES.PHARMACY_DISTRIBUTION_ENTITLEMENT, icon: Shield },
    ],
  },
  {
    label: 'Stock Analysis',
    href: ROUTES.PHARMACY_NEAR_EXPIRY,
    icon: AlertTriangle,
    roles: PHARMACY_ROLES,
    module: 'inventory',
    children: [
      { label: 'Near Expiry', href: ROUTES.PHARMACY_NEAR_EXPIRY, icon: AlertTriangle },
      { label: 'Slow-Moving Items', href: ROUTES.PHARMACY_SLOW_MOVING, icon: BarChart3 },
      { label: 'Inventory Report', href: ROUTES.PHARMACY_INVENTORY_REPORT, icon: FileText },
    ],
  },
  {
    label: 'MySuhu',
    href: '/suhu/dashboard',
    icon: Thermometer,
    module: 'suhu',
    children: [
      { label: 'Dashboard', href: '/suhu/dashboard', icon: LayoutDashboard },
      { label: 'Breach Log', href: '/suhu/breaches', icon: AlertTriangle },
      { label: 'Admin Setup', href: '/suhu/admin', icon: Settings },
    ],
  },
  {
    label: 'MyPHiS',
    href: '/hub/myphis',
    icon: Database,
    module: 'myphis',
    children: [
      { label: 'Dashboard', href: '/hub/myphis', icon: LayoutDashboard },
    ],
  },
  {
    label: 'MyMSDS',
    href: '/hub/mymsds',
    icon: FlaskConical,
    module: 'mymsds',
    children: [
      { label: 'Dashboard', href: '/hub/mymsds', icon: LayoutDashboard },
      { label: 'MSDS Directory', href: '/hub/mymsds', icon: ClipboardList },
      { label: 'Emergency Procedures', href: '/hub/mymsds', icon: Shield },
    ],
  },
  {
    label: 'MyPrepacking',
    href: '/prepacking/dashboard',
    icon: PackageCheck,
    module: 'prepacking',
    children: [
      { label: 'Dashboard', href: '/prepacking/dashboard', icon: LayoutDashboard },
      { label: 'Formulation Catalog', href: '/prepacking/catalog', icon: Boxes },
      { label: 'Packaging Batches', href: '/prepacking/batches', icon: PackageCheck },
      { label: 'KEW.PS-4 Bin Card Ledger', href: '/prepacking/kewps4', icon: FileText },
      { label: 'Store-to-Counter Transfer', href: '/prepacking/movement', icon: ArrowRightLeft },
      { label: 'Label Print Studio', href: '/prepacking/labels', icon: Printer },
      { label: 'Reports & Analytics', href: '/prepacking/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'MyKunci',
    href: '/kunci/dashboard',
    icon: Key,
    module: 'kunci',
    children: [
      { label: 'Dashboard', href: '/kunci/dashboard', icon: LayoutDashboard },
      { label: 'Key Register', href: '/kunci/daftar', icon: ClipboardList },
      { label: 'Movement Log', href: '/kunci/log', icon: FileText },
      { label: 'Monthly Verification', href: '/kunci/audit', icon: Shield },
      { label: 'MOH Key Policy', href: '/kunci/polisi', icon: ScrollText },
    ],
  },
  {
    label: 'MyTransporter',
    href: '/transporter/dashboard',
    icon: Car,
    module: 'transporter',
    children: [
      { label: 'Dashboard', href: '/transporter/dashboard', icon: LayoutDashboard },
      { label: 'New Request', href: '/transporter/requests/new', icon: FileText },
      { label: 'Check SG Slot', href: '/transporter/availability', icon: Calendar },
      { label: 'My Requests', href: '/transporter/requests/my', icon: ClipboardList },
      { label: 'Driver Panel', href: '/transporter/driver/panel', icon: Truck },
      { label: 'Admin Approvals', href: '/transporter/admin/approval', icon: Shield },
      { label: 'Fleet Vehicles', href: '/transporter/admin/vehicles', icon: Settings },
      { label: 'Driver Issues', href: '/transporter/admin/vehicles/issues', icon: AlertTriangle },
      { label: 'Mileage & Claims', href: '/transporter/admin/vehicles/movement', icon: BarChart3 },
      { label: 'Role Assignments', href: '/transporter/admin/roles', icon: Users },
    ],
  },
  {
    label: 'MyStaff',
    href: '/staff/dashboard',
    icon: Users,
    module: 'staff',
    children: [
      { label: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
      { label: 'Movement Log', href: '/staff/movement', icon: Briefcase },
      { label: 'Event Log', href: '/staff/reminders', icon: Bell },
      { label: 'Department Calendar', href: '/staff/calendar', icon: Calendar },
      { label: 'Organizational Chart', href: '/staff/org-chart', icon: Network },
    ],
  },
  {
    label: 'MyTimeOff',
    href: '/timeoff/dashboard',
    icon: Clock,
    module: 'timeoff',
    children: [
      { label: 'Dashboard', href: '/timeoff/dashboard', icon: LayoutDashboard },
      { label: 'Submit Time Off Claim', href: '/timeoff/claim/new', icon: Plus },
      { label: 'My Claims', href: '/timeoff/claims', icon: FileText },
      { label: 'Redeem Time Off', href: '/timeoff/redeem', icon: CalendarDays },
      { label: 'History & Ledger', href: '/timeoff/history', icon: Layers },
      { label: 'HOD Approval Queue', href: '/timeoff/hod', icon: UserCheck },
    ],
  },
  {
    label: 'MyCrossBorder',
    href: '/crossborder/dashboard',
    icon: Globe,
    module: 'crossborder',
    children: [
      { label: 'Dashboard', href: '/crossborder/dashboard', icon: LayoutDashboard },
      { label: 'New Permit Request', href: '/crossborder/create', icon: FileText },
      { label: 'Movement Log', href: '/crossborder/log', icon: ClipboardList },
    ],
  },
  {
    label: 'Dashboard',
    href: '/perolehan',
    icon: LayoutDashboard,
    module: 'perolehan',
  },
  {
    label: 'Management Budget',
    href: '/perolehan/pengurusan',
    icon: Building,
    module: 'perolehan',
  },
  {
    label: 'Development Budget',
    href: '/perolehan/pembangunan',
    icon: HardHat,
    module: 'perolehan',
  },
  {
    label: 'Orders & LPO',
    href: '/perolehan/orders',
    icon: ShoppingCart,
    module: 'perolehan',
  },
  {
    label: 'Receiving & Payments',
    href: '/perolehan/payments',
    icon: CreditCard,
    module: 'perolehan',
  },
  {
    label: 'Catalog & Suppliers',
    href: '/perolehan/catalog',
    icon: ClipboardList,
    module: 'perolehan',
  },
  {
    label: 'MyFormulari',
    href: '/formulari/dashboard',
    icon: Pill,
    module: 'formulari',
    children: [
      { label: 'Hospital Lawas Formulary', href: '/formulari/hospital-lawas', icon: Building2 },
      { label: 'Drug Search & Catalog', href: '/formulari/dashboard', icon: Search },
      { label: 'Paediatric Catalogue', href: '/formulari/paediatric-catalogue', icon: Baby },
      { label: 'High Alert Medications (HAM)', href: '/formulari/ham', icon: Flame },
      { label: 'LASA & TALL-Man Register', href: '/formulari/lasa', icon: AlertTriangle },
      { label: 'IV Dilution Protocols', href: '/formulari/dilution', icon: Droplets },
      { label: 'National Antimicrobial Guideline 2024', href: '/formulari/antimicrobial', icon: ShieldCheck },
      { label: 'Stock Quota & Alerts', href: '/formulari/quota', icon: TrendingDown },
      { label: 'Alternative Drugs', href: '/formulari/alternatives', icon: Layers },
      { label: 'Antidote Protocols', href: '/formulari/antidotes', icon: ShieldAlert },
    ],
  },
  {
    label: 'MyPorter',
    href: '/porter/dashboard',
    icon: PersonStanding,
    module: 'porter',
    children: [
      { label: 'Dashboard', href: '/porter/dashboard', icon: LayoutDashboard },
      { label: 'New Porter Request', href: '/porter/requests/new', icon: Plus },
      { label: 'My Requests & Live Tracking', href: '/porter/requests/my', icon: ClipboardList },
      { label: 'Porter Panel (Driver/Rider)', href: '/porter/panel', icon: Radio },
      { label: 'Cargo Receiving (Ward)', href: '/porter/receiver', icon: ShieldCheck },
      { label: 'Dispatch Control Center', href: '/porter/manager', icon: Shield },
      { label: 'Porter Duty Roster', href: '/porter/roster', icon: Calendar },
      { label: 'Performance & KPI Reports', href: '/porter/reports', icon: BarChart3 },
      { label: 'Role Assignments', href: '/porter/roles', icon: Users },
    ],
  },
  {
    label: 'MyPriviledging',
    href: '/priviledging',
    icon: UserCheck,
    module: 'priviledging',
    children: PRIVILEDGING_STAFF_CHILDREN,
  },
  {
    label: 'MyTempahan',
    href: '/tempahan',
    icon: CalendarDays,
    module: 'tempahan',
    children: [
      { label: 'Dashboard', href: '/tempahan', icon: LayoutDashboard },
      { label: 'Interactive Calendar', href: '/tempahan/kalendar', icon: Calendar },
      { label: 'New Booking', href: '/tempahan/permohonan-baru', icon: Plus },
      { label: 'My Bookings', href: '/tempahan/permohonan-saya', icon: ClipboardList },
      { label: 'Approval Review Queue', href: '/tempahan/kelulusan', icon: ShieldCheck },
      { label: 'Facility & Room Directory', href: '/tempahan/senarai-bilik', icon: Building2 },
      { label: 'Reports & Analytics', href: '/tempahan/laporan', icon: BarChart3 },
    ],
  },
]

export const hasAccess = (item: NavItem, userRole?: string): boolean => {
  if (!item.roles || item.roles.length === 0) return true
  if (!userRole) return true

  const normalizedRole = userRole.toLowerCase().trim()

  if (
    normalizedRole === SYSTEM_ROLES.SYSTEM_ADMIN ||
    normalizedRole === 'superadmin' ||
    normalizedRole === 'super_admin' ||
    normalizedRole === 'admin' ||
    normalizedRole === 'hospital_admin' ||
    normalizedRole === 'hospital_administrator'
  ) {
    return true
  }

  if (item.module) {
    try {
      const modKey =
        item.module === 'oxygen'
          ? 'cylinder'
          : item.module === 'suhu'
          ? 'mysuhu'
          : item.module === 'formulari'
          ? 'myformulari'
          : item.module === 'pharmacy'
          ? 'pharmacy_logistics'
          : item.module
      const roleMatrix = useRbacStore.getState().getRoleMatrix(normalizedRole)
      if (roleMatrix && roleMatrix[modKey] && typeof roleMatrix[modKey].view === 'boolean') {
        return roleMatrix[modKey].view
      }
    } catch {
      // Ignore
    }
  }

  const cleanUserRole = normalizedRole.replace(/[-_\s]/g, '')
  return item.roles.some((r) => {
    const cleanAllowed = r.toLowerCase().replace(/[-_\s]/g, '')
    return (
      cleanAllowed === cleanUserRole ||
      normalizedRole.includes(cleanAllowed) ||
      cleanAllowed.includes(cleanUserRole) ||
      (cleanAllowed.includes('pharmacist') && cleanUserRole.includes('pharmacist')) ||
      (cleanAllowed.includes('pharmacy') && cleanUserRole.includes('pharmacy'))
    )
  })
}

export const filterNavItemsByRole = (
  items: NavItem[],
  userRole?: string,
  user?: any
): NavItem[] => {
  return items
    .filter((item) => {
      if (item.departmentCheck && user) {
        if (!item.departmentCheck(user)) return false
      }
      return hasAccess(item, userRole)
    })
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterNavItemsByRole(item.children, userRole, user)
        return {
          ...item,
          children: filteredChildren,
        }
      }
      return item
    })
    .filter((item) => {
      if (item.children && item.children.length === 0) return false
      return true
    })
}

export const getModuleNavItems = (
  moduleCode: SidebarModuleCode,
  userRole?: string,
  user?: any,
  priviledgingMode: 'staff' | 'admin' = 'staff'
): NavItem[] => {
  const filtered = filterNavItemsByRole(navigation, userRole, user)
    .filter((item) => item.module === moduleCode)
    .map((item) => {
      if (item.module === 'priviledging') {
        const children = priviledgingMode === 'admin' ? PRIVILEDGING_ADMIN_CHILDREN : PRIVILEDGING_STAFF_CHILDREN
        return {
          ...item,
          children: filterNavItemsByRole(children, userRole, user),
        }
      }
      return item
    })
  return filtered
}
