import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, Compass, Menu, User, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSidebar } from '@/stores/uiStore'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const BottomNav: React.FC = () => {
  const location = useLocation()
  const { toggleSidebar, sidebarOpen } = useSidebar()

  const navItems = [
    {
      label: 'Hub',
      href: '/hub',
      icon: LayoutGrid,
      isActive: (path: string) => path === '/hub' || path === '/',
    },
    {
      label: 'Menu Modul',
      icon: Menu,
      isAction: true,
      onClick: toggleSidebar,
      activeState: sidebarOpen,
    },
    {
      label: 'Profil',
      href: ROUTES.PROFILE,
      icon: User,
      isActive: (path: string) => path.startsWith('/profile'),
    },
  ]

  return (
    <nav 
      aria-label="Navigasi Mudah Alih"
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-40",
        "bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 shadow-2xl shadow-slate-950/90",
        "transition-transform duration-300"
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="h-16 px-4 flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon

          if (item.isAction) {
            const isActive = item.activeState
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center w-20 h-14 rounded-2xl transition-all duration-200 active:scale-95 group relative",
                  isActive 
                    ? "text-teal-300 font-bold" 
                    : "text-slate-400 hover:text-slate-200"
                )}
                aria-label={item.label}
              >
                <div className={cn(
                  "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "bg-teal-500/20 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.3)] scale-105"
                    : "group-hover:bg-slate-900 text-slate-400"
                )}>
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-950" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                  {item.label}
                </span>
              </button>
            )
          }

          const active = item.isActive ? item.isActive(location.pathname) : location.pathname === item.href

          return (
            <NavLink
              key={index}
              to={item.href!}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-20 h-14 rounded-2xl transition-all duration-200 active:scale-95 group relative",
                  active || isActive 
                    ? "text-teal-300 font-bold" 
                    : "text-slate-400 hover:text-slate-200"
                )
              }
            >
              <div className={cn(
                "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                active
                  ? "bg-teal-500/20 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.3)] scale-105"
                  : "group-hover:bg-slate-900 text-slate-400"
              )}>
                <Icon className="w-5 h-5" />
                {active && (
                  <motion.span
                    layoutId="bottomNavIndicator"
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-950"
                  />
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
