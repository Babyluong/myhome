// @ts-nocheck
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'

export const TempahanSubMenu: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <button 
          onClick={() => navigate(ROUTES.HUB)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Hub</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-xl">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">MyTempahan</h1>
            <p className="text-slate-400 mt-1">Facility &amp; Resource Booking Ecosystem</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border-default p-8 text-center">
        <h2 className="text-xl font-semibold text-text-secondary mb-2">
          Facility Booking Command Center
        </h2>
        <p className="text-text-muted">
          Book meeting rooms, conference halls, and clinical facilities directly through the interactive scheduling portal.
        </p>
        <button 
          onClick={() => navigate('/tempahan')}
          className="mt-6 px-6 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors cursor-pointer"
        >
          Go to Booking Dashboard
        </button>
      </div>
    </div>
  )
}

export default TempahanSubMenu
