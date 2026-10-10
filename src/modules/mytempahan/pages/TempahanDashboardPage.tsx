// src/modules/mytempahan/pages/TempahanDashboardPage.tsx
// Professional Command Center Dashboard for Hospital Facility & Room Bookings

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Plus,
  Calendar,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Filter,
  Search,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Layers,
  FileSpreadsheet
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { ROUTES } from '@/lib/constants'
import {
  Room,
  Booking,
  BookingStats
} from '@/shared/types/mytempahan'
import {
  getRooms,
  getBookings,
  getBookingStats
} from '../services/tempahanService'
import { RoomCard } from '../components/RoomCard'
import { BookingDetailDrawer } from '../components/BookingDetailDrawer'
import { cn } from '@/lib/utils'
import { ModulePageHeader, Button, Badge } from '@/components/ui'
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonMobileCardList } from '@/shared/components/ui/skeleton'

export const TempahanDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToast } = useToast()

  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [roomsRes, bookingsRes, statsRes] = await Promise.all([
        getRooms(),
        getBookings(),
        getBookingStats()
      ])

      if (roomsRes.data) setRooms(roomsRes.data)
      if (bookingsRes.data) setBookings(bookingsRes.data)
      if (statsRes.data) setStats(statsRes.data)
    } catch (err) {
      console.error('Error loading tempahan dashboard data:', err)
      addToast({
        type: 'error',
        title: 'Error Loading Data',
        message: 'Failed to load facility registry and latest bookings.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleUpdate = () => loadData()
    window.addEventListener('tempahan_bookings_updated', handleUpdate)
    window.addEventListener('tempahan_rooms_updated', handleUpdate)

    return () => {
      window.removeEventListener('tempahan_bookings_updated', handleUpdate)
      window.removeEventListener('tempahan_rooms_updated', handleUpdate)
    }
  }, [])

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.room_code.toLowerCase().includes(q)
      }
      return true
    })
  }, [rooms, selectedCategory, searchQuery])

  // Today's bookings
  const todayBookings = useMemo(() => {
    return bookings
      .filter(b => b.date === todayStr && ['approved', 'in_use', 'completed'].includes(b.status))
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [bookings, todayStr])

  // Recent applications (all statuses)
  const recentBookings = useMemo(() => {
    return bookings.slice(0, 6)
  }, [bookings])

  // Map room occupation status for current hour
  const currentOccupancyMap = useMemo(() => {
    const now = new Date()
    const currentHours = now.getHours()
    const currentMins = now.getMinutes()
    const nowTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMins.toString().padStart(2, '0')}`

    const map = new Map<string, { eventName: string; endTime: string }>()

    todayBookings.forEach(b => {
      if (nowTimeStr >= b.start_time && nowTimeStr <= b.end_time) {
        map.set(b.room_id, {
          eventName: b.purpose,
          endTime: b.end_time
        })
      }
    })

    return map
  }, [todayBookings])

  const handleBookRoom = (roomId: string) => {
    navigate(`${ROUTES.TEMPAHAN_REQUEST_NEW}?roomId=${roomId}`)
  }

  const handleViewSchedule = (roomId: string) => {
    navigate(`${ROUTES.TEMPAHAN_CALENDAR}?roomId=${roomId}`)
  }

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDrawerOpen(true)
  }

  return (
    <div className="w-full space-y-6">
      {/* Universal Module Header */}
      <ModulePageHeader
        badge="Hospital Facility Booking"
        title="MyTempahan"
        description="Conference Halls, Meeting Rooms & Clinical Training Space Booking System"
        icon={<CalendarDays className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => navigate(ROUTES.TEMPAHAN_CALENDAR)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Calendar className="w-4 h-4 text-accent-base" />
              <span>Full Calendar</span>
            </Button>
            <Button
              onClick={() => navigate(ROUTES.TEMPAHAN_REQUEST_NEW)}
              size="sm"
              className="bg-accent-base hover:bg-accent-dark text-white gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </Button>
          </div>
        }
      />

      {/* 2. Key Operational Metrics (KPI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Events */}
        <div className="p-5 rounded-xl bg-surface border border-border-default shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Today's Bookings
            </span>
            <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums">
              {loading ? (
                <Skeleton className="h-8 sm:h-9 w-12 my-0.5 rounded-lg" />
              ) : (
                todayBookings.length
              )}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              Scheduled events & meetings
            </div>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div
          onClick={() => navigate(ROUTES.TEMPAHAN_APPROVAL_QUEUE)}
          className="p-5 rounded-xl bg-surface border border-border-default shadow-xs space-y-3 cursor-pointer group hover:border-accent-base/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Pending Approvals
            </span>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tabular-nums flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-8 sm:h-9 w-12 my-0.5 rounded-lg" />
              ) : (
                <>
                  {stats?.pendingApprovals ?? 0}
                  {stats?.pendingApprovals ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                      Action
                    </span>
                  ) : null}
                </>
              )}
            </div>
            <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1 group-hover:text-amber-500">
              Review applications queue <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 3: Utilization Rate */}
        <div className="p-5 rounded-xl bg-surface border border-border-default shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Utilization Rate
            </span>
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums">
              {loading ? (
                <Skeleton className="h-8 sm:h-9 w-16 my-0.5 rounded-lg" />
              ) : (
                `${stats?.averageUtilizationRate ?? 42}%`
              )}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              Current month ({stats?.totalHoursBooked ?? 0} Hours)
            </div>
          </div>
        </div>

        {/* Card 4: Available Venues */}
        <div className="p-5 rounded-xl bg-surface border border-border-default shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Available Facilities
            </span>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 tabular-nums">
              {loading ? (
                <Skeleton className="h-8 sm:h-9 w-16 my-0.5 rounded-lg" />
              ) : (
                `${rooms.length - currentOccupancyMap.size} / ${rooms.length}`
              )}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              Rooms ready for booking
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Venue Directory & Today's Schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Room Directory */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-border-default rounded-xl p-4 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-text-primary">Facility & Room Availability</h2>
              <p className="text-xs text-text-muted">Select hospital facility to check schedule or book a time slot.</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap max-w-full">
              {[
                { id: 'all', label: 'All' },
                { id: 'meeting_room', label: 'Meeting Room' },
                { id: 'conference_hall', label: 'Hall' },
                { id: 'training_room', label: 'Training' },
                { id: 'computer_lab', label: 'IT Lab' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                    selectedCategory === tab.id
                      ? 'bg-accent-base border-accent-base text-white shadow-xs'
                      : 'bg-subtle border-border-default text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} className="!bg-white dark:!bg-slate-900 !border-slate-200/90 dark:!border-slate-800 shadow-xs" />
              ))
            ) : filteredRooms.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Facilities Found</p>
                <p className="text-xs text-slate-400 mt-1">Try changing category filters or search keywords.</p>
              </div>
            ) : (
              filteredRooms.map(room => {
                const currentOcc = currentOccupancyMap.get(room.id)
                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isCurrentlyOccupied={Boolean(currentOcc)}
                    currentEventName={currentOcc?.eventName}
                    currentEventEnd={currentOcc?.endTime}
                    onBook={handleBookRoom}
                    onViewSchedule={handleViewSchedule}
                  />
                )
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Today's Schedule & Quick Links */}
        <div className="space-y-6">
          {/* Today's Agenda Card */}
          <div className="p-5 rounded-xl bg-surface border border-border-default shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-base" />
                <h3 className="font-bold text-text-primary text-sm">Today's Event Schedule</h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-text-muted">
                {todayStr}
              </span>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-subtle/50 border border-border-default space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-44" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : todayBookings.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-xs">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-border-default stroke-1" />
                No events or meetings scheduled for today.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayBookings.map(b => (
                  <div
                    key={b.id}
                    onClick={() => openBookingDetails(b)}
                    className="p-3.5 rounded-xl bg-subtle/40 hover:bg-subtle border border-border-default cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-accent-base font-mono">
                        {b.start_time} - {b.end_time}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface border border-border-default text-text-secondary">
                        {b.room?.name || 'Room'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-text-primary group-hover:text-accent-base transition-colors line-clamp-1">
                      {b.purpose}
                    </h4>

                    <div className="text-[11px] text-text-muted flex items-center justify-between">
                      <span className="truncate">{b.pemohon_name}</span>
                      <span className="font-semibold">{b.attendees_count} Pax</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate(ROUTES.TEMPAHAN_CALENDAR)}
              className="w-full py-2.5 rounded-lg border border-border-default hover:bg-subtle text-xs font-bold text-text-primary transition-colors flex items-center justify-center gap-1.5"
            >
              View Monthly Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-xl bg-surface border border-border-default shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Module Quick Links
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => navigate(ROUTES.TEMPAHAN_MY_BOOKINGS)}
                className="w-full p-2.5 rounded-lg hover:bg-subtle flex items-center justify-between transition-colors text-left text-text-primary"
              >
                <span>My Booking Requests</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
              <button
                onClick={() => navigate(ROUTES.TEMPAHAN_APPROVAL_QUEUE)}
                className="w-full p-2.5 rounded-lg hover:bg-subtle flex items-center justify-between transition-colors text-left text-text-primary"
              >
                <span>Admin Approval Review</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
              <button
                onClick={() => navigate(ROUTES.TEMPAHAN_ROOM_REGISTRY)}
                className="w-full p-2.5 rounded-lg hover:bg-subtle flex items-center justify-between transition-colors text-left text-text-primary"
              >
                <span>Facility & Room Directory</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
              <button
                onClick={() => navigate(ROUTES.TEMPAHAN_REPORTS)}
                className="w-full p-2.5 rounded-lg hover:bg-subtle flex items-center justify-between transition-colors text-left text-text-primary"
              >
                <span>Utilization & Statistics Reports</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Booking Applications Table */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-default shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-primary">Recent Booking Applications</h2>
            <p className="text-xs text-text-muted">Space booking applications submitted by hospital departments.</p>
          </div>

          <button
            onClick={() => navigate(ROUTES.TEMPAHAN_MY_BOOKINGS)}
            className="text-xs font-semibold text-accent-base hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          {loading ? (
            <SkeletonTable columns={7} rows={4} className="border-none shadow-none rounded-none !bg-transparent" />
          ) : recentBookings.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs">No recent applications found.</div>
          ) : (
            <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-text-muted bg-subtle/50 border-y border-border-default">
              <tr>
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4">Purpose / Program</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {recentBookings.map(b => (
                <tr key={b.id} className="hover:bg-subtle/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-text-secondary">{b.booking_number}</td>
                  <td className="py-3 px-4 font-semibold text-text-primary max-w-[220px] truncate">{b.purpose}</td>
                  <td className="py-3 px-4 text-text-secondary">{b.room?.name || '-'}</td>
                  <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                    <div>{b.date}</div>
                    <div className="text-[10px] text-text-muted">{b.start_time} - {b.end_time}</div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    <div className="font-medium text-text-primary">{b.pemohon_name}</div>
                    <div className="text-[10px] text-text-muted">{b.pemohon_department}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-semibold border',
                        b.status === 'approved' && 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                        b.status === 'pending' && 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                        b.status === 'rejected' && 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                        b.status === 'completed' && 'bg-subtle text-text-secondary border-border-default'
                      )}
                    >
                      {b.status === 'approved' ? 'APPROVED' : b.status === 'pending' ? 'UNDER REVIEW' : b.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openBookingDetails(b)}
                      className="px-3 py-1 rounded-lg bg-subtle hover:bg-subtle/80 text-text-secondary font-semibold text-[11px] border border-border-default transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          )}
        </div>

        {/* Mobile View: High-End Native Booking Cards */}
        <div className="md:hidden divide-y divide-border-default">
          {loading ? (
            <SkeletonMobileCardList count={3} />
          ) : recentBookings.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs">No recent applications found.</div>
          ) : (
            recentBookings.map(b => (
            <div key={b.id} className="p-4 space-y-2.5 hover:bg-subtle/30 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-text-secondary bg-subtle px-2 py-0.5 rounded border border-border-default inline-block">
                    {b.booking_number}
                  </span>
                  <h4 className="font-bold text-text-primary text-sm mt-1">
                    {b.purpose}
                  </h4>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0',
                    b.status === 'approved' && 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                    b.status === 'pending' && 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                    b.status === 'rejected' && 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                    b.status === 'completed' && 'bg-subtle text-text-secondary border-border-default'
                  )}
                >
                  {b.status === 'approved' ? 'APPROVED' : b.status === 'pending' ? 'UNDER REVIEW' : b.status.toUpperCase()}
                </span>
              </div>

              <div className="bg-subtle/50 rounded-lg p-2.5 border border-border-default text-xs space-y-1">
                <div className="flex items-center justify-between text-text-secondary font-medium">
                  <span>Facility: <strong className="text-text-primary">{b.room?.name || '-'}</strong></span>
                  <span className="font-mono text-[11px]">{b.start_time} - {b.end_time}</span>
                </div>
                <div className="text-[11px] text-text-muted">
                  Date: {b.date} • Applicant: {b.pemohon_name} ({b.pemohon_department})
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => openBookingDetails(b)}
                  className="px-3 py-1.5 rounded-lg bg-subtle hover:bg-subtle/80 text-text-secondary font-semibold text-xs border border-border-default transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}

export default TempahanDashboardPage
