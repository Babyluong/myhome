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
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ms' ? 'Kembali ke Hub Utama' : 'Back to Main Hub'}</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-xl">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">MyTempahan</h1>
            <p className="text-slate-500">{language === 'ms' ? 'Sistem Tempahan Fasiliti & Sumber' : 'Facility & Resource Booking Ecosystem'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          {language === 'ms' ? 'Modul Sedang Dibina' : 'Module Under Development'}
        </h2>
        <p className="text-slate-500">
          {language === 'ms'
            ? 'Sub-modul ini sedang dalam pembangunan. Sila rujuk Dashboard utama untuk fungsi sedia ada.'
            : 'This sub-module is currently under development. Please refer to the main Dashboard for available features.'}
        </p>
        <button 
          onClick={() => navigate('/tempahan')}
          className="mt-6 px-6 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors cursor-pointer"
        >
          {language === 'ms' ? 'Pergi ke Dashboard Tempahan' : 'Go to Booking Dashboard'}
        </button>
      </div>
    </div>
  )
}

export default TempahanSubMenu
