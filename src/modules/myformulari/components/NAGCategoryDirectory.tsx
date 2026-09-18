import React, { useState, useMemo } from 'react'
import {
  Layers,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  FolderOpen,
  SlidersHorizontal,
  X,
  Search,
  User,
  Baby,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { NAGCategoryMetadata, NAGPopulation } from '../types/formulariTypes'
import { NAG_ADULT_CATEGORIES_METADATA, NAG_PAED_CATEGORIES_METADATA } from '../data/nagCategoriesData'

interface NAGCategoryDirectoryProps {
  selectedPopulation: NAGPopulation
  selectedCategoryCode: string
  selectedTopic: string
  onSelectPopulation: (pop: NAGPopulation) => void
  onSelectCategory: (code: string) => void
  onSelectTopic: (topic: string) => void
  totalResultsCount?: number
}

export const NAGCategoryDirectory: React.FC<NAGCategoryDirectoryProps> = ({
  selectedPopulation,
  selectedCategoryCode,
  selectedTopic,
  onSelectPopulation,
  onSelectCategory,
  onSelectTopic,
  totalResultsCount
}) => {
  const [categorySearchQuery, setCategorySearchQuery] = useState('')

  // Determine active category dataset based on selected population
  const currentCategories = useMemo(() => {
    let list: NAGCategoryMetadata[] = []
    if (selectedPopulation === 'Adult') {
      list = NAG_ADULT_CATEGORIES_METADATA
    } else if (selectedPopulation === 'Paediatric' || selectedPopulation === 'Neonatal') {
      list = NAG_PAED_CATEGORIES_METADATA
    } else {
      list = [...NAG_ADULT_CATEGORIES_METADATA, ...NAG_PAED_CATEGORIES_METADATA]
    }

    if (!categorySearchQuery.trim()) return list

    const q = categorySearchQuery.toLowerCase()
    return list.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.fullLabel.toLowerCase().includes(q) ||
        c.topics.some(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)))
    )
  }, [selectedPopulation, categorySearchQuery])

  // Active Category Meta object
  const activeCategoryMeta = useMemo(() => {
    if (selectedCategoryCode === 'ALL') return null
    const all = [...NAG_ADULT_CATEGORIES_METADATA, ...NAG_PAED_CATEGORIES_METADATA]
    return all.find(c => c.code === selectedCategoryCode || c.title === selectedCategoryCode)
  }, [selectedCategoryCode])

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-6">
      {/* 1. SECTION & POPULATION SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Direktori Garis Panduan Rasmi NAG 2024 (KKM)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pilih domain populasi pesakit dan sistem klinikal untuk melihat indikasi serta rejimen empirik rasmi.
          </p>
        </div>

        {/* Population Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => {
              onSelectPopulation('All')
              onSelectCategory('ALL')
              onSelectTopic('ALL')
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedPopulation === 'All'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Semua (A &amp; B)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              31 Kategori
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectPopulation('Adult')
              onSelectCategory('ALL')
              onSelectTopic('ALL')
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedPopulation === 'Adult'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Dewasa (Section A)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              selectedPopulation === 'Adult' ? 'bg-emerald-900/60 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              17
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectPopulation('Paediatric')
              onSelectCategory('ALL')
              onSelectTopic('ALL')
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedPopulation === 'Paediatric'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Pediatrik &amp; Neonat (Section B)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              selectedPopulation === 'Paediatric' ? 'bg-cyan-900/60 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              14
            </span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY DIRECTORY GRID */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {selectedPopulation === 'Adult'
                ? 'Section A: 17 Kategori Penyakit Dewasa'
                : selectedPopulation === 'Paediatric'
                ? 'Section B: 14 Kategori Penyakit Pediatrik & Neonat'
                : 'Semua Kategori Klinikal (A1–A17 Dewasa & B1–B14 Pediatrik)'}
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              ({currentCategories.length} kategori aktif)
            </span>
          </div>

          {/* Quick Search within Categories */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tapis nama kategori..."
                value={categorySearchQuery}
                onChange={e => setCategorySearchQuery(e.target.value)}
                className="w-full pl-8 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 font-medium"
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {selectedCategoryCode !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('ALL')
                  onSelectTopic('ALL')
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Papar Semua</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {/* "All Categories" Tile */}
          <button
            type="button"
            onClick={() => {
              onSelectCategory('ALL')
              onSelectTopic('ALL')
            }}
            className={`p-3 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
              selectedCategoryCode === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">✨</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                selectedCategoryCode === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                Semua
              </span>
            </div>
            <div>
              <div className="text-xs font-black leading-tight">Semua Kategori</div>
              <div className={`text-[10px] mt-0.5 ${selectedCategoryCode === 'ALL' ? 'text-slate-300' : 'text-slate-400'}`}>
                Papar kesuluruhan NAG
              </div>
            </div>
          </button>

          {/* Individual Category Cards */}
          {currentCategories.map(cat => {
            const isSelected = selectedCategoryCode === cat.code || selectedCategoryCode === cat.title
            const isPaed = cat.population === 'Paediatric' || cat.code.startsWith('B')

            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.code)
                  onSelectTopic('ALL')
                }}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-2 relative group overflow-hidden ${
                  isSelected
                    ? isPaed
                      ? 'bg-cyan-800 text-white border-cyan-800 shadow-md ring-2 ring-cyan-500/30'
                      : 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : isPaed
                        ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {cat.code}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-black leading-tight line-clamp-2">
                    {cat.title}
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/5">
                    <span
                      className={`text-[10px] font-medium ${
                        isSelected ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {cat.topics.length} topik
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3 h-3 text-amber-300" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. ACTIVE CATEGORY SUBTOPIC PATHWAY DRAWER */}
      {activeCategoryMeta && activeCategoryMeta.topics.length > 0 && (
        <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl border border-emerald-500/30 shadow-xl space-y-4 animate-fade-in">
          {/* Active Category Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-2xl bg-white/10">{activeCategoryMeta.icon}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono">
                    {activeCategoryMeta.code}
                  </span>
                  <h3 className="text-base sm:text-lg font-black tracking-wide text-white">
                    {activeCategoryMeta.fullLabel}
                  </h3>
                </div>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Pilih sub-topik klinikal di bawah untuk menapis indikasi khusus dan dos spesifik.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-emerald-200 border border-white/10">
                {activeCategoryMeta.topics.length} Pilihan Sub-Topik
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('ALL')
                  onSelectTopic('ALL')
                }}
                className="text-xs text-emerald-300 hover:text-white underline cursor-pointer font-bold px-2 py-1"
              >
                Tutup Pilihan &times;
              </button>
            </div>
          </div>

          {/* Subtopic Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {/* View All In This Category */}
            <button
              type="button"
              onClick={() => onSelectTopic('ALL')}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer space-y-1.5 ${
                selectedTopic === 'ALL'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-white/10 hover:bg-white/15 text-slate-100 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <span>★ Papar Semua Indikasi</span>
                </span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </div>
              <p className="text-[11px] text-emerald-100/70 leading-relaxed">
                Papar kesemua pelan rawatan klinikal di bawah kategori {activeCategoryMeta.title}.
              </p>
            </button>

            {/* Individual Subtopics */}
            {activeCategoryMeta.topics.map(t => {
              const isTopicSelected = selectedTopic === t.title
              return (
                <button
                  key={t.number}
                  type="button"
                  onClick={() => onSelectTopic(t.title)}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer space-y-1.5 ${
                    isTopicSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white/10 hover:bg-white/15 text-slate-100 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{t.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-70 flex-shrink-0" />
                  </div>
                  {t.description && (
                    <p
                      className={`text-[11px] leading-relaxed line-clamp-2 ${
                        isTopicSelected ? 'text-white/90 font-medium' : 'text-slate-300'
                      }`}
                    >
                      {t.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default NAGCategoryDirectory
