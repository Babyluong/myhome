// src/modules/mytempahan/components/RoomCard.tsx
// Professional Hospital Facility Room Card with Dark/Light Support & Real MOH Spec Badges

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  Tv,
  Projector,
  Mic,
  Video,
  Wifi,
  Wind,
  Layers,
  ChevronRight,
  Maximize2,
  Building2,
  X
} from 'lucide-react'
import { Room } from '@/shared/types/mytempahan'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export interface RoomCardProps {
  room: Room
  isCurrentlyOccupied?: boolean
  currentEventName?: string
  currentEventEnd?: string
  onBook: (roomId: string) => void
  onViewSchedule: (roomId: string) => void
}

const CATEGORY_NAMES: Record<string, { en: string; ms: string }> = {
  meeting_room: { en: 'Meeting Room', ms: 'Bilik Mesyuarat' },
  conference_hall: { en: 'Conference Hall', ms: 'Dewan Persidangan' },
  training_room: { en: 'Training / Seminar Room', ms: 'Bilik Seminar / Latihan' },
  auditorium: { en: 'Auditorium', ms: 'Auditorium' },
  discussion_room: { en: 'Clinical Discussion Room', ms: 'Bilik Diskusi Klinikal' },
  command_center: { en: 'Crisis Command Center', ms: 'Bilik Gerakan Krisis' },
  computer_lab: { en: 'IT Computer Lab', ms: 'Makmal Komputer IT' }
}

const AMENITY_MAP: Record<string, { en: string; ms: string; icon: React.ElementType }> = {
  projector: { en: 'HD Projector', ms: 'Projektor HD', icon: Projector },
  smart_tv: { en: 'Smart TV', ms: 'Smart TV', icon: Tv },
  video_conferencing: { en: 'Video Conference / VC', ms: 'Persidangan Video (VC)', icon: Video },
  pa_sound_system: { en: 'PA Sound System', ms: 'Sistem PA', icon: Mic },
  wireless_mic: { en: 'Wireless Mic', ms: 'Mikrofon Tanpa Wayar', icon: Mic },
  whiteboard: { en: 'Whiteboard', ms: 'Papan Putih', icon: Layers },
  wifi_kkm: { en: 'MOH WiFi', ms: 'WiFi KKM', icon: Wifi },
  aircond: { en: 'Air Conditioning', ms: 'Penghawa Dingin', icon: Wind },
  vip_lounge: { en: 'VIP Lounge', ms: 'Bilik Menunggu VIP', icon: Layers },
  podium: { en: 'Podium / Rostrum', ms: 'Podium / Rostrum', icon: Layers },
  recording_facility: { en: 'Recording Facility', ms: 'Fasiliti Rakaman', icon: Video },
  catering_space: { en: 'Catering Area', ms: 'Ruang Jamuan', icon: Layers },
  flipchart: { en: 'Flipchart', ms: 'Papan Carta Selak', icon: Layers },
  backup_generator: { en: 'Backup Generator', ms: 'Generator Tunggu Sedia', icon: Layers },
  document_camera: { en: 'Document Camera', ms: 'Kamera Dokumen', icon: Video }
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isCurrentlyOccupied = false,
  currentEventName,
  currentEventEnd,
  onBook,
  onViewSchedule
}) => {
  const { language } = useLanguage()
  const isBM = language === 'ms'
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isMaintenance = room.status === 'maintenance'
  const isInactive = room.status === 'inactive'

  // Refined Enterprise Status Badges
  let statusBadgeStyle = 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40'
  let statusText = isBM ? 'Tersedia' : 'Available'
  let dotColor = 'bg-emerald-400'

  if (isMaintenance) {
    statusBadgeStyle = 'bg-amber-950/80 text-amber-200 border-amber-500/40'
    statusText = isBM ? 'Penyelenggaraan' : 'Under Maintenance'
    dotColor = 'bg-amber-400'
  } else if (isInactive) {
    statusBadgeStyle = 'bg-slate-900/80 text-slate-300 border-slate-700'
    statusText = isBM ? 'Tidak Aktif' : 'Inactive'
    dotColor = 'bg-slate-400'
  } else if (isCurrentlyOccupied) {
    statusBadgeStyle = 'bg-rose-950/80 text-rose-200 border-rose-500/40'
    statusText = isBM ? 'Sedang Digunakan' : 'In Use'
    dotColor = 'bg-rose-400'
  }

  const categoryLabel = CATEGORY_NAMES[room.category]
    ? (isBM ? CATEGORY_NAMES[room.category].ms : CATEGORY_NAMES[room.category].en)
    : room.category.replace(/_/g, ' ')

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all flex flex-col justify-between overflow-hidden text-slate-900 dark:text-slate-100"
      >
        <div>
          {/* 1. Facility Photo Banner with Glassmorphic Badges */}
          <div
            className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer select-none"
            onClick={() => setShowPhotoModal(true)}
          >
            {room.image_url && !imageError ? (
              <img
                src={room.image_url}
                alt={room.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 text-slate-400">
                <Building2 className="w-12 h-12 mb-1.5 opacity-40 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{categoryLabel}</span>
                <span className="text-[10px] text-slate-400">{room.building_block}</span>
              </div>
            )}

            {/* Gradient Dark Overlay for Badge Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/40 pointer-events-none" />

            {/* Top Badges Floating Over Photo */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-xs">
                  {room.room_code}
                </span>
                <span className="text-[11px] font-medium text-slate-200 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-xs">
                  {room.floor_level}
                </span>
              </div>

              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-xs',
                  statusBadgeStyle
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', dotColor, !isMaintenance && !isInactive ? 'animate-pulse' : '')} />
                {statusText}
              </span>
            </div>

            {/* Bottom Badges Over Photo: Category Label & Preview Zoom Action */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/95 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-xs">
                {categoryLabel}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPhotoModal(true)
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-600/90 hover:bg-teal-600 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 transition-all shadow-xs hover:scale-105 active:scale-95"
                title={isBM ? 'Periksa Foto & Butiran Ruang' : 'Inspect Photo & Venue Details'}
              >
                <Maximize2 className="w-3 h-3" />
                <span>{isBM ? 'Lihat Foto' : 'View Photo'}</span>
              </button>
            </div>
          </div>

          {/* 2. Card Content Body */}
          <div className="p-5 space-y-3.5">
            {/* Room Title & Location */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                {room.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{room.location}</span>
              </p>
            </div>

            {/* In-Session Notice (if occupied) */}
            {isCurrentlyOccupied && currentEventName && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
                <div className="font-semibold truncate">{currentEventName}</div>
                {currentEventEnd && (
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {isBM ? `Selesai pada ${currentEventEnd}` : `Ends at ${currentEventEnd}`}
                  </div>
                )}
              </div>
            )}

            {/* Capacity & Turnaround Buffer */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {isBM ? 'Kapasiti' : 'Capacity'}
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {room.capacity} {isBM ? 'Pax Maks' : 'Max Pax'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {isBM ? 'Buffer Setup' : 'Setup Buffer'}
                  </div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {room.setup_buffer_minutes || 15}m / {room.cleanup_buffer_minutes || 15}m
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment & Amenity Chips */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                {isBM ? 'Peralatan & Fasiliti' : 'Equipment & Amenities'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(room.amenities || []).slice(0, 4).map(amenity => {
                  const info = AMENITY_MAP[amenity]
                  const Icon = info?.icon || Tv
                  const label = info ? (isBM ? info.ms : info.en) : amenity.replace(/_/g, ' ')

                  return (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <Icon className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      {label}
                    </span>
                  )
                })}
                {(room.amenities || []).length > 4 && (
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                    +{room.amenities.length - 4} {isBM ? 'lagi' : 'more'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Action Footer */}
        <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => onViewSchedule(room.id)}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {isBM ? 'Semak Jadual' : 'View Schedule'}
          </button>

          <button
            onClick={() => onBook(room.id)}
            disabled={isMaintenance || isInactive}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs',
              isMaintenance || isInactive
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
                : 'bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold active:scale-[0.98]'
            )}
          >
            {isBM ? 'Tempah Ruang' : 'Book Facility'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* 4. High-Resolution Photo Lightbox Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-8 text-slate-900 dark:text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo Header */}
              <div className="relative h-72 sm:h-96 w-full bg-slate-950">
                {room.image_url && !imageError ? (
                  <img
                    src={room.image_url}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Building2 className="w-16 h-16 opacity-30 text-teal-500 mb-2" />
                    <p className="text-sm">{room.name}</p>
                  </div>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-md hover:scale-105 active:scale-95"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Badges Over Image */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-xs">
                    {room.room_code}
                  </span>
                  <span className="text-xs font-medium text-white/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xs">
                    {room.floor_level}
                  </span>
                </div>

                {/* Bottom title banner on image */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    {categoryLabel} • {room.building_block}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {room.name}
                  </h2>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    {room.location}
                  </p>
                </div>
              </div>

              {/* Modal Body & Specs */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{isBM ? 'Kapasiti' : 'Capacity'}</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{room.capacity} Max Pax</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{isBM ? 'Buffer Setup' : 'Setup Buffer'}</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{room.setup_buffer_minutes || 15}m / {room.cleanup_buffer_minutes || 15}m</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{isBM ? 'Status Ruang' : 'Room Status'}</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {statusText}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{isBM ? 'Kelulusan' : 'Approval'}</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {room.requires_approval ? (isBM ? 'Perlu Kelulusan' : 'Required') : (isBM ? 'Automatik' : 'Instant')}
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {isBM ? 'Fasiliti & Peralatan Lengkap' : 'Included Facilities & Equipment'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(room.amenities || []).map(amenity => {
                      const info = AMENITY_MAP[amenity]
                      const Icon = info?.icon || Tv
                      const label = info ? (isBM ? info.ms : info.en) : amenity.replace(/_/g, ' ')

                      return (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                        >
                          <Icon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          {label}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* House Rules if present */}
                {room.house_rules && room.house_rules.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 text-xs space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      {isBM ? 'Peraturan Fasiliti' : 'Facility House Rules'}
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                      {room.house_rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  {isBM ? 'Tutup' : 'Close'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoModal(false)
                      onViewSchedule(room.id)
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {isBM ? 'Semak Jadual' : 'View Schedule'}
                  </button>

                  <button
                    type="button"
                    disabled={isMaintenance || isInactive}
                    onClick={() => {
                      setShowPhotoModal(false)
                      onBook(room.id)
                    }}
                    className={cn(
                      'px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm',
                      isMaintenance || isInactive
                        ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                        : 'bg-teal-700 hover:bg-teal-800 active:scale-95'
                    )}
                  >
                    {isBM ? 'Tempah Fasiliti Ini' : 'Book This Facility'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
