export interface MobileTabItem {
  id: string
  label: string
  to: string
  icon: 'LayoutGrid' | 'Activity' | 'FileText' | 'Boxes' | 'Layers' | 'Thermometer' | 'Key' | 'Users' | 'Truck' | 'Pill' | 'DollarSign' | 'Calendar' | 'Sliders'
  exact?: boolean
  roles?: string[]
}

export const MODULE_MOBILE_TABS: Record<string, MobileTabItem[]> = {
  // Pilot Module 1: MyCylinder
  oxygen: [
    { id: 'cyl-dash', label: 'Dashboard', to: '/pharmacy/oxygen', icon: 'Activity', exact: true },
    { id: 'cyl-reg', label: 'Registry', to: '/pharmacy/oxygen/registry', icon: 'Boxes' },
    { id: 'cyl-tx', label: 'Transactions', to: '/pharmacy/oxygen/transactions', icon: 'FileText' },
  ],
  // Pilot Module 2: MyWarrant
  pharmacy: [
    { id: 'war-dash', label: 'Dashboard', to: '/pharmacy/dashboard', icon: 'Activity', exact: true },
    { id: 'war-list', label: 'Warrants', to: '/pharmacy/warrants', icon: 'DollarSign' },
    { id: 'war-exp', label: 'Expenses', to: '/pharmacy/expenses', icon: 'FileText' },
  ],
  // Pilot Module 3: MyInventory
  inventory: [
    { id: 'inv-dash', label: 'Dashboard', to: '/pharmacy/inventory', icon: 'Activity', exact: true },
    { id: 'inv-stock', label: 'Stock', to: '/pharmacy/inventory/stock', icon: 'Boxes' },
    { id: 'inv-req', label: 'Requests', to: '/pharmacy/inventory/requests', icon: 'FileText' },
  ],
  // Other Modules
  kunci: [
    { id: 'kun-dash', label: 'Dashboard', to: '/kunci', icon: 'Activity', exact: true },
    { id: 'kun-reg', label: 'Keys', to: '/kunci/registry', icon: 'Key' },
    { id: 'kun-log', label: 'Logs', to: '/kunci/log', icon: 'FileText' },
  ],
  suhu: [
    { id: 'suh-dash', label: 'Dashboard', to: '/suhu', icon: 'Activity', exact: true },
    { id: 'suh-dept', label: 'Units', to: '/suhu/departments', icon: 'Thermometer' },
    { id: 'suh-breach', label: 'Breaches', to: '/suhu/breaches', icon: 'FileText' },
  ],
  staff: [
    { id: 'stf-dash', label: 'Dashboard', to: '/staff', icon: 'Activity', exact: true },
    { id: 'stf-org', label: 'Directory', to: '/staff/org-chart', icon: 'Users' },
    { id: 'stf-leave', label: 'Leaves', to: '/staff/leave', icon: 'Calendar' },
  ],
  formulari: [
    { id: 'frm-dash', label: 'Dashboard', to: '/formulari', icon: 'Activity', exact: true },
    { id: 'frm-list', label: 'Formulary', to: '/formulari/lawas', icon: 'Pill' },
    { id: 'frm-ham', label: 'HAM / LASA', to: '/formulari/ham', icon: 'FileText' },
  ],
  transporter: [
    { id: 'trn-dash', label: 'Dashboard', to: '/transporter', icon: 'Activity', exact: true },
    { id: 'trn-req', label: 'New Trip', to: '/transporter/request', icon: 'Truck' },
    { id: 'trn-my', label: 'My Trips', to: '/transporter/my-requests', icon: 'FileText' },
  ],
}

/**
 * Returns the contextual tabs for the current active module
 */
export function getMobileTabsForModule(
  moduleCode: string | null | undefined,
  userRole?: string
): MobileTabItem[] {
  if (!moduleCode || !MODULE_MOBILE_TABS[moduleCode]) {
    return []
  }

  const tabs = MODULE_MOBILE_TABS[moduleCode]
  if (!userRole) return tabs

  return tabs.filter((t) => !t.roles || t.roles.includes(userRole))
}
