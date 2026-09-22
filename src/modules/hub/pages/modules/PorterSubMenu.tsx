// @ts-nocheck
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useLanguage } from '@/shared/contexts/LanguageContext'

export const PorterSubMenu: React.FC = () => {
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
          <span>{language === 'ms' ? 'Kembali ke Hub Utama' : 'Back to Main Hub'}</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">MyPorter</h1>
            <p className="text-slate-400 mt-1">{language === 'ms' ? 'Sistem Porter & Penghantaran' : 'Portering & Asset Transport System'}</p>
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
          onClick={() => navigate('/porter/dashboard')}
          className="mt-6 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors cursor-pointer"
        >
          {language === 'ms' ? 'Pergi ke Dashboard Porter' : 'Go to Porter Dashboard'}
        </button>
      </div>
    </div>
  )
}

export default PorterSubMenu
