import { create } from 'zustand'

interface ModalConfig {
  id: string
  isOpen: boolean
  data?: unknown
}

interface UIState {
  // Theme
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void

  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Modals
  modals: Record<string, ModalConfig>
  
  // Loading states
  globalLoading: boolean
  loadingMessage: string | null
  
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  
  openModal: (id: string, data?: unknown) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  getModalData: <T>(id: string) => T | undefined
  
  setGlobalLoading: (loading: boolean, message?: string) => void
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('home_theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'light' // Default to light per design system mandate
}

export const useUIStore = create<UIState>((set, get) => ({
  // Theme state
  theme: getInitialTheme(),
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') {
      localStorage.setItem('home_theme', nextTheme)
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    set({ theme: nextTheme })
  },
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('home_theme', theme)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    set({ theme })
  },

  // Initial state
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  sidebarCollapsed: false,
  modals: {},
  globalLoading: false,
  loadingMessage: null,

  // Sidebar actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed })
  },

  // Modal actions
  openModal: (id, data) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { id, isOpen: true, data },
      },
    }))
  },

  closeModal: (id) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { ...state.modals[id], isOpen: false },
      },
    }))
  },

  closeAllModals: () => {
    set((state) => {
      const closedModals: Record<string, ModalConfig> = {}
      Object.keys(state.modals).forEach((key) => {
        closedModals[key] = { ...state.modals[key], isOpen: false }
      })
      return { modals: closedModals }
    })
  },

  getModalData: <T>(id: string) => {
    return get().modals[id]?.data as T | undefined
  },

  // Global loading
  setGlobalLoading: (loading, message) => {
    set({
      globalLoading: loading,
      loadingMessage: loading ? message ?? null : null,
    })
  },
}))

// Helper hooks
export const useSidebar = () => {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, setSidebarOpen, setSidebarCollapsed } = useUIStore()
  return { sidebarOpen, sidebarCollapsed, toggleSidebar, setSidebarOpen, setSidebarCollapsed }
}

export const useModal = (id: string) => {
  const { modals, openModal, closeModal } = useUIStore()
  const modal = modals[id]
  
  return {
    isOpen: modal?.isOpen ?? false,
    data: modal?.data,
    open: (data?: unknown) => openModal(id, data),
    close: () => closeModal(id),
  }
}

export const useGlobalLoading = () => {
  const { globalLoading, loadingMessage, setGlobalLoading } = useUIStore()
  return { isLoading: globalLoading, message: loadingMessage, setLoading: setGlobalLoading }
}

