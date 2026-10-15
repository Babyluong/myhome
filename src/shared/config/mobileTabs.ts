import { isPharmacyLogisticsUser } from '@/shared/utils/inventoryRbac'
export interface MobileTabItem {
  id: string
  label: string
  to: string
  icon:
    | 'LayoutGrid'
    | 'Activity'
    | 'FileText'
    | 'Boxes'
    | 'Layers'
    | 'Thermometer'
    | 'Key'
    | 'Users'
    | 'Truck'
    | 'Pill'
    | 'DollarSign'
    | 'Calendar'
    | 'Sliders'
    | 'Clock'
    | 'PersonStanding'
    | 'ShieldCheck'
    | 'ShoppingCart'
    | 'Building2'
    | 'Package'
  exact?: boolean
  roles?: string[]
}

export const MODULE_MOBILE_TABS: Record<string, MobileTabItem[]> = {
  // Pilot Module 1: MyCylinder
  oxygen: [
    { id: 'cyl-dash', label: 'Dashboard', to: '/pharmacy/oxygen', icon: 'Activity', exact: true },
    { id: 'cyl-fleet', label: 'Cylinders', to: '/pharmacy/oxygen/cylinders', icon: 'Boxes' },
    { id: 'cyl-use', label: 'Wards', to: '/pharmacy/oxygen/consumption', icon: 'FileText' },
  ],
  // Pilot Module 2: MyWarrant
  pharmacy: [
    { id: 'war-dash', label: 'Dashboard', to: '/pharmacy/dashboard', icon: 'Activity', exact: true },
    { id: 'war-list', label: 'Warrants', to: '/pharmacy/financial/warrant', icon: 'DollarSign' },
    { id: 'war-procurement', label: 'Procurement', to: '/pharmacy/procurement/orders', icon: 'ShoppingCart' },
  ],
  // Pilot Module 3: MyInventory
  inventory: [
    { id: 'inv-dash', label: 'Overview', to: '/pharmacy/inventory', icon: 'Activity', exact: true },
    { id: 'inv-drugs', label: 'Drugs', to: '/pharmacy/inventory/drugs', icon: 'Boxes' },
    { id: 'inv-move', label: 'Scanner', to: '/pharmacy/inventory/movement', icon: 'FileText' },
  ],
  // MyKunci
  kunci: [
    { id: 'kun-dash', label: 'Dashboard', to: '/kunci/dashboard', icon: 'Activity', exact: true },
    { id: 'kun-reg', label: 'Keys', to: '/kunci/registry', icon: 'Key' },
    { id: 'kun-log', label: 'Logs', to: '/kunci/log', icon: 'FileText' },
  ],
  // MySuhu
  suhu: [
    { id: 'suh-dash', label: 'Dashboard', to: '/suhu/dashboard', icon: 'Activity', exact: true },
    { id: 'suh-breach', label: 'Breaches', to: '/suhu/breaches', icon: 'Thermometer' },
    { id: 'suh-admin', label: 'Setup', to: '/suhu/admin', icon: 'Sliders' },
  ],
  // MyStaff
  staff: [
    { id: 'stf-dash', label: 'Dashboard', to: '/staff/dashboard', icon: 'Activity', exact: true },
    { id: 'stf-org', label: 'Directory', to: '/staff/org-chart', icon: 'Users' },
    { id: 'stf-leave', label: 'Leaves', to: '/staff/leave', icon: 'Calendar' },
  ],
  // MyTimeOff
  timeoff: [
    { id: 'tof-dash', label: 'Dashboard', to: '/timeoff/dashboard', icon: 'Activity', exact: true },
    { id: 'tof-claim', label: 'New Claim', to: '/timeoff/claim/new', icon: 'Clock' },
    { id: 'tof-list', label: 'My Claims', to: '/timeoff/claims', icon: 'FileText' },
  ],
  // MyFormulari
  formulari: [
    { id: 'frm-dash', label: 'Search', to: '/formulari/dashboard', icon: 'Activity', exact: true },
    { id: 'frm-list', label: 'Formulary', to: '/formulari/hospital-lawas', icon: 'Pill' },
    { id: 'frm-ham', label: 'HAM / LASA', to: '/formulari/ham', icon: 'FileText' },
  ],
  // MyTransporter
  transporter: [
    { id: 'trn-dash', label: 'Dashboard', to: '/transporter/dashboard', icon: 'Activity', exact: true },
    { id: 'trn-req', label: 'New Trip', to: '/transporter/requests/new', icon: 'Truck' },
    { id: 'trn-my', label: 'My Trips', to: '/transporter/requests/my', icon: 'FileText' },
  ],
  // MyPorter
  porter: [
    { id: 'por-dash', label: 'Dashboard', to: '/porter/dashboard', icon: 'Activity', exact: true },
    { id: 'por-req', label: 'Request', to: '/porter/requests/new', icon: 'PersonStanding' },
    { id: 'por-my', label: 'My Tasks', to: '/porter/requests/my', icon: 'FileText' },
  ],
  // MyTempahan
  tempahan: [
    { id: 'tmp-dash', label: 'Dashboard', to: '/tempahan/dashboard', icon: 'Activity', exact: true },
    { id: 'tmp-cal', label: 'Calendar', to: '/tempahan/calendar', icon: 'Calendar' },
    { id: 'tmp-my', label: 'Bookings', to: '/tempahan/my', icon: 'FileText' },
  ],
  // MyPerolehan
  perolehan: [
    { id: 'prl-dash', label: 'Overview', to: '/perolehan/dashboard', icon: 'Activity', exact: true },
    { id: 'prl-mgmt', label: 'Budget', to: '/perolehan/management', icon: 'DollarSign' },
    { id: 'prl-ord', label: 'Orders', to: '/perolehan/orders', icon: 'ShoppingCart' },
  ],
  // MyPriviledging
  priviledging: [
    { id: 'prv-dash', label: 'Dashboard', to: '/priviledging/dashboard', icon: 'Activity', exact: true },
    { id: 'prv-cat', label: 'Catalog', to: '/priviledging/catalog', icon: 'FileText' },
    { id: 'prv-my', label: 'Submissions', to: '/priviledging/my-submissions', icon: 'ShieldCheck' },
  ],
  // MyPrepacking
  prepacking: [
    { id: 'prp-dash', label: 'Dashboard', to: '/prepacking/dashboard', icon: 'Activity', exact: true },
    { id: 'prp-cat', label: 'Catalog', to: '/prepacking/catalog', icon: 'Boxes' },
    { id: 'prp-bat', label: 'Batches', to: '/prepacking/batches', icon: 'FileText' },
  ],
  // Admin & Hospital Admin
  admin: [
    { id: 'adm-dash', label: 'Admin', to: '/admin', icon: 'Activity', exact: true },
    { id: 'adm-usr', label: 'Users', to: '/admin/users', icon: 'Users' },
    { id: 'adm-rol', label: 'Roles', to: '/admin/roles', icon: 'Sliders' },
  ],
  // MyCrossBorder
  crossborder: [
    { id: 'crb-dash', label: 'Dashboard', to: '/crossborder/dashboard', icon: 'Activity', exact: true },
    { id: 'crb-new', label: 'New Permit', to: '/crossborder/create', icon: 'FileText' },
    { id: 'crb-log', label: 'Movement', to: '/crossborder/log', icon: 'Boxes' },
  ],
  // MyMSDS
  mymsds: [
    { id: 'msd-dash', label: 'MSDS Directory', to: '/hub/mymsds', icon: 'Activity', exact: true },
  ],
  // MyPhIS
  myphis: [
    { id: 'phi-dash', label: 'PhIS Dashboard', to: '/hub/myphis', icon: 'Activity', exact: true },
  ],
}

/**
 * Returns the contextual tabs for the current active module
 */
export function getMobileTabsForModule(
  moduleCode: string | null | undefined,
  userRole?: string,
  user?: any
): MobileTabItem[] {
  if (!moduleCode) return []

  const normalizedCode =
    {
      pharmacy_logistics: 'pharmacy',
      system_transporter: 'transporter',
      system_porter: 'porter',
      hospital_admin: 'admin',
      system_admin: 'admin',
    }[moduleCode] || moduleCode

  const tabs = MODULE_MOBILE_TABS[normalizedCode]
  if (!tabs) return []

  let resolvedTabs = tabs
  if (normalizedCode === 'inventory') {
    const isLogistics = isPharmacyLogisticsUser(user)
    resolvedTabs = tabs.map((t) => {
      if (t.id === 'inv-drugs') {
        return {
          ...t,
          to: isLogistics ? '/pharmacy/inventory/drugs' : '/pharmacy/inventory/facility-drugs',
        }
      }
      return t
    })
  }

  if (!userRole) return resolvedTabs

  return resolvedTabs.filter((t) => !t.roles || t.roles.includes(userRole))
}
