// src/modules/mytempahan/services/tempahanExportService.ts
// Excel Workbook Multi-Sheet Export for MyTempahan Bookings, Stats & Room Registry

import * as XLSX from 'xlsx'
import { Booking, BookingStats, Room } from '@/shared/types/mytempahan'

export async function exportBookingsToExcel(
  bookings: Booking[],
  rooms: Room[],
  stats: BookingStats,
  fileName: string = `MyTempahan_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
): Promise<void> {
  const wb = XLSX.utils.book_new()

  // -------------------------------------------------------------
  // Sheet 1: Executive Summary & KPIs
  // -------------------------------------------------------------
  const summaryData = [
    ['LAWAS DISTRICT HOSPITAL - MYTEMPAHAN SYSTEM'],
    ['FACILITY & MEETING ROOM UTILIZATION EXECUTIVE REPORT'],
    ['Generated Date:', new Date().toLocaleString('en-US')],
    [''],
    ['KEY METRICS', 'VALUE'],
    ['Total Recorded Bookings', stats.totalBookings],
    ['Approved Bookings', stats.approvedBookings],
    ['Bookings In Use Today', stats.inUseToday],
    ['Pending Approvals', stats.pendingApprovals],
    ['Completed Bookings', stats.completedBookings],
    ['Cancelled / Rejected Bookings', stats.cancelledBookings],
    ['Average Utilization Rate (%)', `${stats.averageUtilizationRate}%`],
    ['Most Frequently Used Facility', stats.busiestRoomName],
    ['Total Hours Booked (Current Month)', `${stats.totalHoursBooked} Hours`],
    [''],
    ['BREAKDOWN BY DEPARTMENT / UNIT', 'TOTAL BOOKINGS', 'TOTAL HOURS BOOKED']
  ]

  stats.departmentUtilization.forEach(d => {
    summaryData.push([d.departmentName, d.bookingCount as any, d.hoursBooked as any])
  })

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary')

  // -------------------------------------------------------------
  // Sheet 2: Complete Booking Log
  // -------------------------------------------------------------
  const bookingRows = bookings.map((b, idx) => ({
    'No.': idx + 1,
    'Reference No.': b.booking_number,
    'Facility Name': b.room?.name || b.room_id,
    'Room Code': b.room?.room_code || '-',
    'Location': b.room?.location || '-',
    'Applicant Name': b.pemohon_name || b.user?.full_name || b.user_id,
    'Designation': b.pemohon_jawatan || '-',
    'Department': b.pemohon_department || b.department?.department_name || '-',
    'Phone Number': b.pemohon_phone || '-',
    'Meeting Purpose': b.purpose,
    'Event Category': b.event_type,
    'Date': b.date,
    'Start Time': b.start_time,
    'End Time': b.end_time,
    'Duration (Hours)': b.duration_hours,
    'Attendees Count': b.attendees_count,
    'Layout': b.layout_type,
    'Catering Provided': b.tempahan_makanan?.diperlukan ? `Yes (${b.tempahan_makanan.jenis_hidangan})` : 'No',
    'VIP Dignitaries': b.tetamu_vip?.ada_vip ? 'Yes' : 'No',
    'Priority': b.priority.toUpperCase(),
    'Status': b.status.toUpperCase(),
    'Created Date': b.created_at.slice(0, 10)
  }))

  const wsBookings = XLSX.utils.json_to_sheet(bookingRows)
  XLSX.utils.book_append_sheet(wb, wsBookings, 'Booking Log')

  // -------------------------------------------------------------
  // Sheet 3: Facility & Room Directory
  // -------------------------------------------------------------
  const roomRows = rooms.map((r, idx) => ({
    'No.': idx + 1,
    'Room Code': r.room_code,
    'Facility Name': r.name,
    'Category': r.category,
    'Capacity (Pax)': r.capacity,
    'Floor Level': r.floor_level,
    'Building Block': r.building_block,
    'Status': r.status.toUpperCase(),
    'Operating Hours': r.operating_hours.is24Hours ? '24 Hours' : `${r.operating_hours.start} - ${r.operating_hours.end}`,
    'Requires Approval': r.requires_approval ? 'Yes' : 'No',
    'Available Amenities': r.amenities.join(', ')
  }))

  const wsRooms = XLSX.utils.json_to_sheet(roomRows)
  XLSX.utils.book_append_sheet(wb, wsRooms, 'Facility Directory')

  // Write and trigger browser download
  XLSX.writeFile(wb, fileName)
}
