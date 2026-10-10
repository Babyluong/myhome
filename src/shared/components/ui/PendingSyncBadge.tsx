import React from 'react'
import { UploadCloud } from 'lucide-react'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

interface PendingSyncBadgeProps {
  module: string
  className?: string
}

export const PendingSyncBadge: React.FC<PendingSyncBadgeProps> = ({ module, className = '' }) => {
  const { pendingByModule } = useOfflineStatus()
  const count = pendingByModule[module] || 0

  if (count <= 0) return null

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse ${className}`}
      title={`${count} rekod disimpan setempat belum disegerakkan`}
    >
      <UploadCloud className="w-2.5 h-2.5" />
      <span>{count}</span>
    </span>
  )
}
