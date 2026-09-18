// src/modules/mytempahan/services/tempahanPdfService.ts
// Official MOH / Lawas Hospital Facility Booking Confirmation Slip PDF Generator

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { Booking } from '@/shared/types/mytempahan'
import { drawHospitalHeader } from '@/lib/pdfHeader'
import { timeToMinutes } from './tempahanValidation'

export async function generateBookingConfirmationPdf(booking: Booking): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12
  const contentWidth = pageWidth - margin * 2

  // 1. Draw Page Border
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.4)
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2)

  // 2. Draw Official Hospital Letterhead
  let currentY = await drawHospitalHeader(doc, {
    margin: margin + 3,
    startY: margin + 2
  })

  // 3. Document Title Block
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42) // Slate 900
  doc.text('FACILITY & MEETING ROOM BOOKING CONFIRMATION SLIP', pageWidth / 2, currentY, { align: 'center' })

  currentY += 4.5
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.text('Lawas Hospital Official Facility Booking Slip (MOH Standard)', pageWidth / 2, currentY, { align: 'center' })

  // 4. Generate QR Code
  currentY += 5
  const qrPayload = JSON.stringify({
    ref: booking.booking_number,
    room: booking.room?.name,
    date: booking.date,
    time: `${booking.start_time}-${booking.end_time}`,
    status: booking.status,
    pax: booking.attendees_count
  })

  try {
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 250,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
    doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - 26, currentY, 22, 22)
  } catch (err) {
    console.warn('QR Code generation skipped:', err)
  }

  // 5. Booking Reference Banner
  doc.setFillColor(248, 250, 252) // Slate 50
  doc.setDrawColor(226, 232, 240)
  doc.rect(margin + 4, currentY, contentWidth - 34, 22, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text('BOOKING REFERENCE NO.:', margin + 7, currentY + 6)
  doc.setFontSize(11)
  doc.setTextColor(2, 132, 199) // Sky 600
  doc.text(booking.booking_number, margin + 7, currentY + 12)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text('APPLICATION STATUS:', margin + 75, currentY + 6)
  doc.setFontSize(10)
  const statusLabel = booking.status === 'approved' ? 'APPROVED' : booking.status.toUpperCase()
  doc.setTextColor(booking.status === 'approved' ? 16 : 220, booking.status === 'approved' ? 149 : 38, booking.status === 'approved' ? 95 : 38)
  doc.text(statusLabel, margin + 75, currentY + 12)

  currentY += 26

  const durationHrs = Math.round(((timeToMinutes(booking.end_time) - timeToMinutes(booking.start_time)) / 60) * 10) / 10

  // 6. Section 1: Applicant & Event Details Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin + 4, right: margin + 4 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['1. APPLICANT & EVENT DETAILS', 'SPECIFICATIONS']],
    body: [
      ['Applicant Name', booking.pemohon_name || booking.user?.full_name || 'Lawas Hospital Officer'],
      ['Designation & Department', `${booking.pemohon_jawatan || 'Medical Officer'} (${booking.pemohon_department || booking.department?.department_name || 'Designated Unit'})`],
      ['Phone & Email', `${booking.pemohon_phone || '085-284100'} | ${booking.pemohon_email || 'hosp_lawas@moh.gov.my'}`],
      ['Meeting / Event Purpose', booking.purpose],
      ['Event Category / Priority', `${booking.event_type} [Priority: ${booking.priority.toUpperCase()}]`],
      ['Event Date', `${booking.date} (${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long' })})`],
      ['Start - End Time', `${booking.start_time} to ${booking.end_time} (${durationHrs} Hours)`],
      ['Estimated Attendees', `${booking.attendees_count} Pax`]
    ]
  })

  currentY = (doc as any).lastAutoTable.finalY + 3.5

  // 7. Section 2: Facility & Logistics Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin + 4, right: margin + 4 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' }, // Teal 600
    head: [['2. FACILITY & LOGISTICS DETAILS', 'SPECIFICATIONS']],
    body: [
      ['Facility / Room Name', `${booking.room?.name || 'Conference Room'} (${booking.room?.room_code || '-'})`],
      ['Location & Building Level', `${booking.room?.location || '-'} [${booking.room?.floor_level || '-'}]`],
      ['Maximum Room Capacity', `${booking.room?.capacity || '-'} Pax`],
      ['Seating & Table Layout', (booking.layout_type || 'boardroom').toUpperCase()],
      ['Requested Amenities', (booking.requested_amenities || []).join(', ') || 'Standard room amenities'],
      ['Additional Equipment', (booking.peralatan_tambahan || []).map(p => `${p.equipment_name} (${p.quantity} unit)`).join(', ') || 'None'],
      ['Catering / Refreshments', booking.tempahan_makanan?.diperlukan ? `Yes (${booking.tempahan_makanan.jenis_hidangan} - ${booking.tempahan_makanan.anggaran_pax} pax at ${booking.tempahan_makanan.lokasi_hidang})` : 'No Catering'],
      ['VIP Dignitaries', booking.tetamu_vip?.ada_vip ? `Yes: ${(booking.tetamu_vip.senarai_vip || []).join(', ')}` : 'None'],
      ['Special Requirements / Notes', booking.special_requirements || 'None']
    ]
  })

  currentY = (doc as any).lastAutoTable.finalY + 3.5

  // 8. Terms & Rules Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.rect(margin + 4, currentY, contentWidth - 8, 18, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(15, 23, 42)
  doc.text('TERMS & CONDITIONS FOR LAWAS HOSPITAL FACILITY USE:', margin + 6, currentY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(71, 85, 105)
  doc.text('1. The applicant is responsible for maintaining facility cleanliness, safeguarding IT/AV equipment, and turning off electrical switches after use.', margin + 6, currentY + 8.5)
  doc.text('2. Food and beverages are only permitted in designated catering areas. Catering waste must be cleared immediately after the event.', margin + 6, currentY + 12)
  doc.text('3. Room keys and additional equipment must be returned to the Facility Officer-in-Charge immediately following the event.', margin + 6, currentY + 15.5)

  currentY += 21

  // 9. Signatures Block
  const sigBoxWidth = (contentWidth - 12) / 2
  const sigBoxHeight = 30

  // Requester Signature Box
  doc.rect(margin + 4, currentY, sigBoxWidth, sigBoxHeight)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(15, 23, 42)
  doc.text('APPLICANT DECLARATION:', margin + 6, currentY + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('Signature:', margin + 6, currentY + 16)
  doc.text(`Name: ${booking.pemohon_name || booking.user?.full_name || 'Applicant Officer'}`, margin + 6, currentY + 21)
  doc.text(`Date: ${booking.created_at.slice(0, 10)}`, margin + 6, currentY + 25.5)

  // Approver Signature Box
  doc.rect(margin + 4 + sigBoxWidth + 4, currentY, sigBoxWidth, sigBoxHeight)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(15, 23, 42)
  doc.text('FACILITY ADMIN APPROVAL:', margin + 6 + sigBoxWidth + 4, currentY + 4.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('Signature & Official Stamp:', margin + 6 + sigBoxWidth + 4, currentY + 16)
  doc.text(`Officer: ${booking.approved_by_name || booking.approved_by || 'Hospital Facility Administrator'}`, margin + 6 + sigBoxWidth + 4, currentY + 21)
  doc.text(`Approval Date: ${booking.approved_at ? booking.approved_at.slice(0, 10) : '-'}`, margin + 6 + sigBoxWidth + 4, currentY + 25.5)

  return doc.output('blob')
}

export async function downloadBookingConfirmationPdf(booking: Booking): Promise<void> {
  const blob = await generateBookingConfirmationPdf(booking)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Booking_Slip_${booking.booking_number}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
