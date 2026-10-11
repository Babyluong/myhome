import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Search,
  X,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getModuleNavItems,
  NavItem,
} from '@/shared/config/navigationConfig'
import { type SidebarModuleCode } from '@/shared/utils/moduleNavigation'
import { SYSTEM_ROLES } from '@/lib/constants'

interface MobileModuleNavListProps {
  moduleCode: SidebarModuleCode | null
  currentModuleTitle?: string
  userRole?: string
  user?: any
  currentPath: string
  onNavigate: (href: string) => void
}

export const MobileModuleNavList: React.FC<MobileModuleNavListProps> = ({
  moduleCode,
  currentModuleTitle,
  userRole,
  user,
  currentPath,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const priviledgingMode = useMemo<'staff' | 'admin'>(() => {
    try {
      const mode = localStorage.getItem('home_mypriviledging_role_mode')
      if (mode === 'admin' || mode === 'staff') return mode
    } catch {}
    if (
      userRole &&
      [
        SYSTEM_ROLES.SYSTEM_ADMIN,
        SYSTEM_ROLES.HOSPITAL_ADMIN,
        SYSTEM_ROLES.HOSPITAL_ADMINISTRATOR,
        'admin',
        'superadmin',
      ].includes(userRole as any)
    ) {
      return 'admin'
    }
    return 'staff'
  }, [userRole])

  const navItems = useMemo(() => {
    if (!moduleCode) return []
    return getModuleNavItems(moduleCode, userRole, user, priviledgingMode)
  }, [moduleCode, userRole, user, priviledgingMode])

  // Track expanded accordion sections
  const [expandedHrefs, setExpandedHrefs] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    navItems.forEach((item) => {
      if (item.children) {
        const hasActive = item.children.some(
          (c) => currentPath === c.href || currentPath.startsWith(c.href + '/')
        )
        if (hasActive) initial.add(item.href)
      }
    })
    return initial
  })

  const toggleExpand = (href: string) => {
    setExpandedHrefs((prev) => {
      const next = new Set(prev)
      if (next.has(href)) {
        next.delete(href)
      } else {
        next.add(href)
      }
      return next
    })
  }

  // Flattened items for search filtering
  const filteredFlatItems = useMemo(() => {
    if (!searchQuery.trim()) return null
    const query = searchQuery.toLowerCase().trim()
    const results: { item: NavItem; parentLabel?: string }[] = []

    navItems.forEach((topItem) => {
      if (topItem.children && topItem.children.length > 0) {
        topItem.children.forEach((child) => {
          if (
            child.label.toLowerCase().includes(query) ||
            topItem.label.toLowerCase().includes(query)
          ) {
            results.push({ item: child, parentLabel: topItem.label })
          }
        })
      } else {
        if (topItem.label.toLowerCase().includes(query)) {
          results.push({ item: topItem })
        }
      }
    })
    return results
  }, [navItems, searchQuery])

  if (!moduleCode || navItems.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Header with Title and Search Input */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-accent-base" />
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            {currentModuleTitle ? `${currentModuleTitle} Menus` : 'Module Menus'}
          </span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-subtle text-text-muted border border-border-default">
          {navItems.length} Sections
        </span>
      </div>

      {/* Quick Filter Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter menus (e.g. Reports, Penalty, PO)..."
          className="w-full pl-8.5 pr-8 py-2 text-xs bg-subtle rounded-xl border border-border-default focus:border-accent-base focus:bg-surface focus:outline-hidden transition-all text-text-primary placeholder:text-text-muted"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-surface text-text-muted"
            aria-label="Clear filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filtered Search Results View */}
      {filteredFlatItems !== null ? (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {filteredFlatItems.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">
              No menu items match "{searchQuery}"
            </p>
          ) : (
            filteredFlatItems.map(({ item, parentLabel }) => {
              const Icon = item.icon
              const isActive =
                currentPath === item.href || currentPath.startsWith(item.href + '/')
              return (
                <button
                  key={`${item.href}-${item.label}`}
                  type="button"
                  onClick={() => onNavigate(item.href)}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs text-left transition-colors',
                    isActive
                      ? 'bg-accent-subtle text-accent-base font-semibold border border-accent-base/30'
                      : 'hover:bg-subtle text-text-primary border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0',
                        isActive ? 'bg-accent-base/10 text-accent-base' : 'bg-surface text-text-muted'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{item.label}</div>
                      {parentLabel && (
                        <div className="text-[10px] text-text-muted truncate">
                          in {parentLabel}
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0 ml-2" />
                </button>
              )
            })
          )}
        </div>
      ) : (
        /* Full Hierarchical Menu List */
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5 overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedHrefs.has(item.href)
            const isParentActive =
              currentPath === item.href ||
              (hasChildren &&
                item.children!.some(
                  (c) => currentPath === c.href || currentPath.startsWith(c.href + '/')
                ))

            if (!hasChildren) {
              const isActive =
                currentPath === item.href || currentPath.startsWith(item.href + '/')
              return (
                <button
                  key={`${item.href}-${item.label}`}
                  type="button"
                  onClick={() => onNavigate(item.href)}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-xs text-left transition-colors border',
                    isActive
                      ? 'bg-accent-subtle text-accent-base font-semibold border-accent-base/30'
                      : 'bg-surface hover:bg-subtle text-text-primary border-border-default'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                        isActive ? 'bg-accent-base/15 text-accent-base' : 'bg-subtle text-text-muted'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-base flex-shrink-0" />
                  )}
                </button>
              )
            }

            return (
              <div
                key={`${item.href}-${item.label}`}
                className="rounded-xl border border-border-default bg-surface overflow-hidden"
              >
                {/* Accordion Group Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.href)}
                  className={cn(
                    'w-full px-3 py-2.5 flex items-center justify-between text-xs text-left transition-colors',
                    isParentActive
                      ? 'bg-accent-subtle/40 text-accent-base font-semibold'
                      : 'hover:bg-subtle text-text-primary'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                        isParentActive
                          ? 'bg-accent-base/15 text-accent-base'
                          : 'bg-subtle text-text-muted'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate font-semibold">{item.label}</span>
                    <span className="text-[10px] text-text-muted font-normal">
                      ({item.children!.length})
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </motion.div>
                </button>

                {/* Submenu Items */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-border-default/60 bg-subtle/30"
                    >
                      <div className="p-1 space-y-0.5">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon
                          const isChildActive =
                            currentPath === child.href ||
                            currentPath.startsWith(child.href + '/')

                          return (
                            <button
                              key={`${child.href}-${child.label}`}
                              type="button"
                              onClick={() => onNavigate(child.href)}
                              className={cn(
                                'w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs text-left transition-colors',
                                isChildActive
                                  ? 'bg-accent-subtle text-accent-base font-semibold'
                                  : 'hover:bg-surface text-text-secondary hover:text-text-primary'
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0 pl-1">
                                <ChildIcon
                                  className={cn(
                                    'w-3.5 h-3.5 flex-shrink-0',
                                    isChildActive ? 'text-accent-base' : 'text-text-muted'
                                  )}
                                />
                                <span className="truncate">{child.label}</span>
                              </div>
                              {isChildActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-base flex-shrink-0 ml-1.5" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
