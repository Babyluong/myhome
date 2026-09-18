import React, { useState, useEffect } from 'react'
import {
  X,
  RefreshCw,
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Globe,
  Plus,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileText,
  Copy,
  ChevronRight
} from 'lucide-react'
import { NAGInfectionGuideline, NAGSyncMetadata, NAGPopulation, NAGBodySystem } from '../types/formulariTypes'
import {
  getNAGSyncMetadata,
  getAllNAGGuidelines,
  syncFromOfficialNAGOnline,
  importNAGGuidelinesFromJSON,
  exportNAGGuidelinesToJSON,
  resetToOfficialNAGDefaults,
  addOrUpdateNAGGuideline,
  OFFICIAL_NAG_PORTAL_URL
} from '../services/nagService'
import { NAG_ADULT_CATEGORIES_METADATA, NAG_PAED_CATEGORIES_METADATA } from '../data/nagCategoriesData'

interface NAGSyncManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onSyncCompleted?: () => void
}

export const NAGSyncManagerModal: React.FC<NAGSyncManagerModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'import' | 'export' | 'add' | 'reset'>('sync')
  const [syncMeta, setSyncMeta] = useState<NAGSyncMetadata>(getNAGSyncMetadata())
  const [isSyncing, setIsSyncing] = useState(false)
  const [customFeedUrl, setCustomFeedUrl] = useState(OFFICIAL_NAG_PORTAL_URL)
  const [syncResult, setSyncResult] = useState<{
    success: boolean
    message: string
    addedCount?: number
    updatedCount?: number
    totalCount?: number
  } | null>(null)

  // Import State
  const [importJsonText, setImportJsonText] = useState('')
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null)

  // Add Guideline Form State
  const [formConditionName, setFormConditionName] = useState('')
  const [formPopulation, setFormPopulation] = useState<NAGPopulation>('Adult')
  const [formCategoryCode, setFormCategoryCode] = useState('A1')
  const [formTopic, setFormTopic] = useState('1. INFECTIVE ENDOCARDITIS')
  const [formSetting, setFormSetting] = useState<'Community-Acquired' | 'Hospital-Acquired (HAP/VAP)' | 'ICU / Severe' | 'Surgical Prophylaxis' | 'Outpatient (OPD/KK)'>('Community-Acquired')
  const [formPathogens, setFormPathogens] = useState('')
  const [formFirstLineRegimen, setFormFirstLineRegimen] = useState('')
  const [formFirstLineDose, setFormFirstLineDose] = useState('')
  const [formFirstLineDuration, setFormFirstLineDuration] = useState('7 - 14 days')
  const [formSecondLineRegimen, setFormSecondLineRegimen] = useState('')
  const [formSecondLineDose, setFormSecondLineDose] = useState('')
  const [formAllergyRegimen, setFormAllergyRegimen] = useState('')
  const [formAmsNotes, setFormAmsNotes] = useState('')
  const [formAddSuccess, setFormAddSuccess] = useState(false)

  // Refresh metadata when modal opens
  useEffect(() => {
    if (isOpen) {
      setSyncMeta(getNAGSyncMetadata())
      setSyncResult(null)
      setImportStatus(null)
      setFormAddSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOnlineSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)
    try {
      const res = await syncFromOfficialNAGOnline(customFeedUrl)
      setSyncMeta(res.newMetadata)
      setSyncResult({
        success: res.success,
        message: res.message,
        addedCount: res.addedCount,
        updatedCount: res.updatedCount,
        totalCount: res.totalCount
      })
      if (onSyncCompleted) onSyncCompleted()
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || 'Gagal menyegerakkan dengan pelayan NAG.'
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      setImportStatus({ success: false, message: 'Sila masukkan teks JSON atau pilih fail.' })
      return
    }
    const res = importNAGGuidelinesFromJSON(importJsonText)
    setImportStatus(res)
    if (res.success) {
      setSyncMeta(getNAGSyncMetadata())
      setImportJsonText('')
      if (onSyncCompleted) onSyncCompleted()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = event => {
      const content = event.target?.result as string
      if (content) {
        setImportJsonText(content)
      }
    }
    reader.readAsText(file)
  }

  const handleExportDownload = () => {
    const jsonStr = exportNAGGuidelinesToJSON()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `KKM_NAG_Guidelines_Export_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleResetDefaults = () => {
    if (window.confirm('Adakah anda pasti ingin menetapkan semula semua data garis panduan kepada Piawaian Rasmi KKM NAG 2024?')) {
      const res = resetToOfficialNAGDefaults()
      setSyncMeta(getNAGSyncMetadata())
      alert(res.message)
      if (onSyncCompleted) onSyncCompleted()
      onClose()
    }
  }

  const handleSaveCustomGuideline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formConditionName.trim() || !formFirstLineRegimen.trim()) {
      alert('Sila isi nama penyakit dan rejimen barisan pertama.')
      return
    }

    const catMeta = formPopulation === 'Adult' 
      ? NAG_ADULT_CATEGORIES_METADATA.find(c => c.code === formCategoryCode)
      : NAG_PAED_CATEGORIES_METADATA.find(c => c.code === formCategoryCode)

    const newGuideline: NAGInfectionGuideline = {
      id: `NAG-CUSTOM-${Date.now().toString().slice(-5)}`,
      targetPopulation: formPopulation,
      categoryCode: formCategoryCode,
      categoryTitle: catMeta?.fullLabel || `${formCategoryCode} : ${formCategoryCode}`,
      topic: formTopic,
      topicNumber: 1,
      bodySystem: (catMeta?.title || 'Skin & Soft Tissue') as NAGBodySystem,
      conditionName: formConditionName.trim(),
      setting: formSetting,
      primaryPathogens: formPathogens.split(',').map(p => p.trim()).filter(Boolean),
      firstLineDrugs: [formFirstLineRegimen.split(' ')[0].toLowerCase()],
      firstLineTherapy: {
        regimen: formFirstLineRegimen,
        routeAndDose: formFirstLineDose || formFirstLineRegimen,
        durationDays: formFirstLineDuration,
        remarks: 'Ditambah oleh Jawatankuasa Antimicrobial Stewardship (AMS) Hospital.'
      },
      secondLineDrugs: formSecondLineRegimen ? [formSecondLineRegimen.split(' ')[0].toLowerCase()] : [],
      secondLineTherapy: {
        regimen: formSecondLineRegimen || 'Rujuk Pakar ID',
        routeAndDose: formSecondLineDose || formSecondLineRegimen || 'Rujuk Pakar ID',
        durationDays: formFirstLineDuration,
        remarks: 'Pilihan kedua/alternatif.'
      },
      penicillinAllergyOption: formAllergyRegimen ? {
        regimen: formAllergyRegimen,
        routeAndDose: formAllergyRegimen,
        remarks: 'Pilihan alahan penisilin.'
      } : undefined,
      amsNotes: formAmsNotes ? formAmsNotes.split('\\n').filter(Boolean) : ['Semak semula dalam 48-72 jam mengikut keputusan kultur C&S.'],
      evidenceLevel: 'Grade A (NAG 2024 / Hospital Protocol)'
    }

    addOrUpdateNAGGuideline(newGuideline)
    setFormAddSuccess(true)
    setSyncMeta(getNAGSyncMetadata())
    if (onSyncCompleted) onSyncCompleted()

    // Reset form
    setFormConditionName('')
    setFormPathogens('')
    setFormFirstLineRegimen('')
    setFormFirstLineDose('')
    setFormSecondLineRegimen('')
    setFormAllergyRegimen('')
    setFormAmsNotes('')
  }

  const activeCategories = formPopulation === 'Adult' ? NAG_ADULT_CATEGORIES_METADATA : NAG_PAED_CATEGORIES_METADATA
  const currentSelectedCategory = activeCategories.find(c => c.code === formCategoryCode)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-5 sm:p-6 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md">
              <RefreshCw className={`w-6 h-6 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Pusat Auto-Kemaskini &amp; Pengurusan NAG
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {syncMeta.edition}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Pengurusan data Garis Panduan Antimikrobial Kebangsaan &amp; integrasi auto-sync sifar kod
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Jumlah Garis Panduan: <strong className="font-bold text-slate-900">{syncMeta.totalGuidelines}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Terakhir Disegerakkan: <strong className="font-bold text-slate-900">{new Date(syncMeta.lastSyncedAt).toLocaleString('ms-MY')}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${syncMeta.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-600">{syncMeta.status}</span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            v{syncMeta.version}
          </span>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 gap-2 overflow-x-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Auto-Update (Online)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Fail JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Eksport Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'add'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Garis Panduan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reset')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'reset'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Set Semula Standard</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: ONLINE AUTO-SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Penyegerakan Automatik dari Portal Rasmi NAG KKM</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Sistem berhubung secara terus dengan pelayan Garis Panduan Antimikrobial Kebangsaan (NAG) KKM untuk memuat turun semakan dos terkini, pengelasan kategori A1-A17, indikasi baharu, dan nota Stewardship tanpa memerlukan sebarang penulisan kod semula.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
                  <div className="relative flex-1 w-full">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customFeedUrl}
                      onChange={e => setCustomFeedUrl(e.target.value)}
                      placeholder="URL Suapan / Endpoint NAG KKM"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleOnlineSync}
                    disabled={isSyncing}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyegerakkan...' : 'Semak & Kemaskini Sekarang'}</span>
                  </button>
                </div>
              </div>

              {/* Sync Result Alert */}
              {syncResult && (
                <div className={`p-4 rounded-2xl border-2 flex items-start gap-3 text-xs ${
                  syncResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-black text-sm">{syncResult.success ? 'Penyegerakan Berjaya!' : 'Ralat Penyegerakan'}</p>
                    <p className="leading-relaxed font-medium">{syncResult.message}</p>
                  </div>
                </div>
              )}

              {/* Recent Changes Log */}
              {syncMeta.recentChanges && syncMeta.recentChanges.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Log Kemaskini Terkini:</span>
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    {syncMeta.recentChanges.map((change, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT JSON */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-slate-900">Muat Naik Fail Garis Panduan JSON (.json)</h4>
                  <p className="text-[11px] text-slate-500">Pilih fail format piawai NAG JSON yang dieksport dari KKM atau hospital lain.</p>
                </div>
                <label className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all">
                  <FileJson className="w-4 h-4 text-emerald-600" />
                  <span>Pilih Fail JSON</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Atau Tampal Kod JSON Terus di Sini:</label>
                <textarea
                  rows={8}
                  value={importJsonText}
                  onChange={e => setImportJsonText(e.target.value)}
                  placeholder='[\n  {\n    "id": "NAG-A1-001",\n    "conditionName": "Infective Endocarditis",\n    "firstLineTherapy": { ... }\n  }\n]'
                  className="w-full p-3 font-mono text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {importStatus && (
                <div className={`p-3.5 rounded-xl border text-xs font-medium ${
                  importStatus.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {importStatus.message}
                </div>
              )}

              <button
                type="button"
                onClick={handleImportJson}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Import Kandungan ke Sistem</span>
              </button>
            </div>
          )}

          {/* TAB 3: EXPORT JSON */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Sandaran &amp; Eksport Pangkalan Data NAG
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Muat turun keseluruhan koleksi garis panduan klinikal (17 Kategori Dewasa, Pediatrik, dan Neonat) dalam bentuk fail JSON berstruktur untuk tujuan sandaran luar talian atau perkongsian bersama unit hospital lain.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportDownload}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Muat Turun Fail .JSON ({syncMeta.totalGuidelines} Rekod)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(exportNAGGuidelinesToJSON())
                      alert('JSON berjaya disalin ke papan klip!')
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Salin ke Clipboard</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADD CUSTOM GUIDELINE */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveCustomGuideline} className="space-y-4">
              {formAddSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Garis panduan berjaya disimpan ke pangkalan data tempatan!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kumpulan Umur (Population):</label>
                  <select
                    value={formPopulation}
                    onChange={e => {
                      const pop = e.target.value as NAGPopulation
                      setFormPopulation(pop)
                      setFormCategoryCode(pop === 'Adult' ? 'A1' : pop === 'Neonatal' ? 'B6' : 'B1')
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Adult">Dewasa (Section A: Adult - 17 Kategori A1-A17)</option>
                    <option value="Paediatric">Pediatrik (Section B: Paediatrics - 14 Kategori B1-B14)</option>
                    <option value="Neonatal">Neonatal (B6 : Neonatal Infections)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kategori NAG Rasmi:</label>
                  <select
                    value={formCategoryCode}
                    onChange={e => {
                      setFormCategoryCode(e.target.value)
                      const cat = activeCategories.find(c => c.code === e.target.value)
                      if (cat && cat.topics.length > 0) {
                        setFormTopic(cat.topics[0].title)
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {activeCategories.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.icon} {c.fullLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-Topic selection if exists */}
              {currentSelectedCategory && currentSelectedCategory.topics.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Sub-Kategori / Topik Khusus:</label>
                  <select
                    value={formTopic}
                    onChange={e => setFormTopic(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {currentSelectedCategory.topics.map(t => (
                      <option key={t.number} value={t.title}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Penyakit / Indikasi Klinikal:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Acute Infective Endocarditis / Melioidosis..."
                  value={formConditionName}
                  onChange={e => setFormConditionName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Patogen Utama (Asingkan dengan koma):</label>
                <input
                  type="text"
                  placeholder="Contoh: Staphylococcus aureus, Streptococcus pneumoniae..."
                  value={formPathogens}
                  onChange={e => setFormPathogens(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rejimen Barisan Pertama (1st-Line):</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: IV Ampicillin 2g Q4H + IV Cloxacillin 2g Q4H"
                    value={formFirstLineRegimen}
                    onChange={e => setFormFirstLineRegimen(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tempoh Rawatan (Duration):</label>
                  <input
                    type="text"
                    placeholder="Contoh: 7 - 14 days"
                    value={formFirstLineDuration}
                    onChange={e => setFormFirstLineDuration(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Rejimen Alternatif / Barisan Kedua (2nd-Line):</label>
                <input
                  type="text"
                  placeholder="Contoh: IV Vancomycin 15-20mg/kg Q12H"
                  value={formSecondLineRegimen}
                  onChange={e => setFormSecondLineRegimen(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pilihan Alahan Penisilin:</label>
                <input
                  type="text"
                  placeholder="Contoh: IV Vancomycin + Gentamicin"
                  value={formAllergyRegimen}
                  onChange={e => setFormAllergyRegimen(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nota Antimicrobial Stewardship (AMS):</label>
                <textarea
                  rows={2}
                  placeholder="Nota semakan 72 jam, pengambilan kultur sebelum antibiotik..."
                  value={formAmsNotes}
                  onChange={e => setFormAmsNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Garis Panduan ke Pangkalan Data</span>
              </button>
            </form>
          )}

          {/* TAB 5: RESET DEFAULTS */}
          {activeTab === 'reset' && (
            <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-3xl space-y-4">
              <div className="flex items-center gap-2.5 text-rose-950 font-black text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Tetapkan Semula Pangkalan Data ke Piawaian Rasmi KKM</span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                Tindakan ini akan memadam semua data cache tempatan dan menetapkan semula garis panduan kepada dataset rasmi KKM NAG Edisi Ke-4 (2024) yang merangkumi semua 17 Kategori Dewasa (A1-A17) dan Pediatrik (P1-P10).
              </p>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Set Semula Sekarang</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>Hospital Operation and Management Ecosystem (H.O.M.E.) • MyFormulari</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default NAGSyncManagerModal
