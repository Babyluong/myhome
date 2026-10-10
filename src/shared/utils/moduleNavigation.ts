import { MODULE_DEFINITIONS } from '@/lib/constants'

export type SidebarModuleCode =
  | 'admin'
  | 'pharmacy'
  | 'oxygen'
  | 'suhu'
  | 'myphis'
  | 'mymsds'
  | 'kunci'
  | 'transporter'
  | 'crossborder'
  | 'inventory'
  | 'staff'
  | 'perolehan'
  | 'formulari'
  | 'porter'
  | 'priviledging'
  | 'tempahan'
  | 'timeoff'
  | 'prepacking'

export interface ActiveModuleInfo {
  name: string
  code: string
}

const STORAGE_KEY = 'home_last_active_module'

/**
 * Identify module name & code from URL pathname
 */
export const getCurrentModuleInfo = (pathname: string): ActiveModuleInfo | null => {
  if (!pathname) return null

  // MyTempahan
  if (pathname.startsWith('/tempahan') || pathname.startsWith('/hub/tempahan')) {
    return { name: 'MyTempahan', code: 'tempahan' }
  }

  // MyPriviledging
  if (pathname.startsWith('/priviledging') || pathname.startsWith('/hub/priviledging')) {
    return { name: 'MyPriviledging', code: 'priviledging' }
  }

  // MyFormulari
  if (pathname.startsWith('/formulari') || pathname.startsWith('/hub/formulari')) {
    return { name: 'MyFormulari', code: 'formulari' }
  }

  // MyCrossBorder
  if (pathname.startsWith('/crossborder')) {
    return { name: 'MyCrossBorder', code: 'crossborder' }
  }

  // MySuhu
  if (pathname.startsWith('/suhu')) {
    return { name: 'MySuhu', code: 'suhu' }
  }

  // MyKunci
  if (pathname.startsWith('/kunci')) {
    return { name: 'MyKunci', code: 'kunci' }
  }

  // MyStaff
  if (pathname.startsWith('/staff') || pathname.startsWith('/hub/staff')) {
    return { name: 'MyStaff', code: 'staff' }
  }

  // MyTimeOff
  if (pathname.startsWith('/timeoff') || pathname.startsWith('/hub/time-off')) {
    return { name: 'MyTimeOff', code: 'timeoff' }
  }

  // MyPerolehan
  if (pathname.startsWith('/perolehan') || pathname.startsWith('/hub/perolehan')) {
    return { name: 'MyPerolehan', code: 'perolehan' }
  }

  // Medical Oxygen / MyCylinder
  if (
    pathname.startsWith('/pharmacy/oxygen') ||
    pathname.startsWith('/oxygen') ||
    pathname.startsWith('/cylinder') ||
    pathname.startsWith('/mycylinder') ||
    pathname.startsWith('/hub/cylinder')
  ) {
    return { name: 'MyCylinder', code: 'oxygen' }
  }

  // MyInventory
  if (
    pathname.startsWith('/pharmacy/inventory') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/myinventory')
  ) {
    return { name: 'MyInventory', code: 'inventory' }
  }

  // Pharmacy Logistics / MyWarrant
  if (pathname.startsWith('/pharmacy') || pathname.startsWith('/mywarrant')) {
    const module = MODULE_DEFINITIONS.find((m) => m.code === 'pharmacy_logistics')
    return { name: module?.name || 'MyWarrant', code: 'pharmacy_logistics' }
  }

  // System Admin
  if (pathname.startsWith('/admin') && pathname.includes('/modules')) {
    return { name: 'System Administration', code: 'system_admin' }
  }

  // Hospital Admin
  if (pathname.startsWith('/admin') && !pathname.includes('/modules')) {
    return { name: 'Hospital Administration', code: 'hospital_admin' }
  }

  // Porter
  if (pathname.startsWith('/porter') || pathname.startsWith('/hub/porter')) {
    const module = MODULE_DEFINITIONS.find((m) => m.code === 'system_porter')
    return { name: module?.name || 'MyPorter', code: 'system_porter' }
  }

  // Transporter
  if (pathname.startsWith('/transporter') || pathname.startsWith('/hub/transporter')) {
    const module = MODULE_DEFINITIONS.find((m) => m.code === 'system_transporter')
    return { name: module?.name || 'MyTransporter', code: 'system_transporter' }
  }

  // MyPHiS
  if (pathname.startsWith('/hub/myphis') || pathname.includes('/myphis')) {
    return { name: 'MyPHiS', code: 'myphis' }
  }

  // MyMSDS
  if (pathname.startsWith('/hub/mymsds') || pathname.includes('/mymsds')) {
    return { name: 'MyMSDS', code: 'mymsds' }
  }

  // MyPrepacking
  if (pathname.startsWith('/prepacking') || pathname.startsWith('/hub/prepacking')) {
    return { name: 'MyPrepacking', code: 'prepacking' }
  }

  return null
}

/**
 * Normalize arbitrary or legacy module codes to the Sidebar's recognized activeModule keys
 */
export const normalizeSidebarModuleCode = (code?: string): SidebarModuleCode | null => {
  if (!code) return null
  const clean = code.toLowerCase().trim()

  if (clean === 'prepacking' || clean === 'myprepacking' || clean === 'pharmacy_prepacking') return 'prepacking'
  if (clean === 'timeoff' || clean === 'mytimeoff') return 'timeoff'
  if (clean === 'tempahan' || clean === 'mytempahan' || clean === 'system_tempahan') return 'tempahan'
  if (clean === 'priviledging' || clean === 'mypriviledging' || clean === 'system_priviledging') return 'priviledging'
  if (clean === 'porter' || clean === 'myporter' || clean === 'system_porter') return 'porter'
  if (clean === 'formulari' || clean === 'myformulari' || clean === 'pharmacy_formulari') return 'formulari'
  if (clean === 'perolehan' || clean === 'myperolehan') return 'perolehan'
  if (clean === 'suhu' || clean === 'mysuhu') return 'suhu'
  if (clean === 'oxygen' || clean === 'cylinder' || clean === 'mycylinder') return 'oxygen'
  if (clean === 'pharmacy_logistics' || clean === 'pharmacy' || clean === 'mywarrant') return 'pharmacy'
  if (clean === 'inventory' || clean === 'myinventory') return 'inventory'
  if (clean === 'system_admin' || clean === 'hospital_admin' || clean === 'admin' || clean === 'myadmin') return 'admin'
  if (clean === 'myphis') return 'myphis'
  if (clean === 'system_kunci' || clean === 'kunci' || clean === 'mykunci') return 'kunci'
  if (clean === 'transporter' || clean === 'system_transporter' || clean === 'mytransporter') return 'transporter'
  if (clean === 'crossborder' || clean === 'mycrossborder') return 'crossborder'
  if (clean === 'staff' || clean === 'mystaff' || clean === 'system_staff' || clean === 'system_cuti') return 'staff'

  return null
}

/**
 * Persist the user's active module to localStorage and sessionStorage
 */
export const saveLastActiveModule = (module: ActiveModuleInfo): void => {
  if (!module?.code) return
  try {
    const data = JSON.stringify(module)
    localStorage.setItem(STORAGE_KEY, data)
    sessionStorage.setItem(STORAGE_KEY, data)
  } catch {
    // Ignore storage quota or security errors
  }
}

/**
 * Retrieve the last active module from session / local storage
 */
export const getLastActiveModule = (): ActiveModuleInfo | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object' && parsed.code) {
        return parsed
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null
}
