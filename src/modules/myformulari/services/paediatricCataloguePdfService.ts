// @ts-nocheck
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { JATA_NEGARA_BASE64 } from '@/modules/mytransporter/pages/jataNegaraBase64'
import type { PaediatricCatalogueItem } from './paediatricCatalogueService'

export interface PaediatricPdfOptions {
  hospitalName?: string
  departmentName?: string
  generatedBy?: string
  generatedByTitle?: string
  referenceNo?: string
}

/**
 * Format currency in Malaysian Ringgit (RM)
 */
function formatPrice(val?: number | string | null): string {
  if (val === undefined || val === null || val === '') return '-'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num) || num <= 0) return '-'
  return `RM ${num.toFixed(2)}`
}

/**
 * Format packaging string with clean capitalization
 */
function formatPackaging(raw?: string | null): string {
  if (!raw || !raw.trim()) return '-'
  const trimmed = raw.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

/**
 * Generate a high-end, professional PDF for Paediatric Drug Catalogue
 * Containing only the 5 required columns:
 * 1. Kod Item (Item Code)
 * 2. Nama Ubat (Item Name)
 * 3. Kategori Preskriber (Prescriber)
 * 4. Pembungkusan (Packaging)
 * 5. Harga (Price)
 */
export async function generatePaediatricCataloguePdf(
  items: PaediatricCatalogueItem[],
  options: PaediatricPdfOptions = {}
): Promise<void> {
  const {
    hospitalName = 'HOSPITAL LAWAS',
    departmentName = 'Wad Pediatrik & Jabatan Farmasi',
    generatedBy = 'Pegawai Farmasi',
    generatedByTitle = 'Pegawai Farmasi',
    referenceNo = `KKM/HL/PAED-CAT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  } = options

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageW = doc.internal.pageSize.getWidth() // 210mm
  const pageH = doc.internal.pageSize.getHeight() // 297mm
  const margin = 14

  // ─── Watermark Helper ───────────────────────────────────────────────────────
  const drawWatermark = () => {
    const wW = 100
    const wH = 80
    const wx = (pageW - wW) / 2
    const wy = (pageH - wH) / 2
    doc.saveGraphicsState()
    try {
      const gState = new (doc as any).GState({ opacity: 0.035 })
      doc.setGState(gState)
    } catch (_) {}
    if (JATA_NEGARA_BASE64) {
      try {
        doc.addImage(JATA_NEGARA_BASE64, 'PNG', wx, wy, wW, wH)
      } catch (err) {
        console.warn('Failed to add watermark:', err)
      }
    }
    doc.restoreGraphicsState()
  }

  // ─── Header Helper ──────────────────────────────────────────────────────────
  const drawHeader = () => {
    drawWatermark()

    // 1. Official Jata Negara Malaysian Crest Logo
    if (JATA_NEGARA_BASE64) {
      try {
        doc.addImage(JATA_NEGARA_BASE64, 'PNG', margin, 8, 20, 16)
      } catch (err) {
        console.warn('Failed to add crest logo:', err)
      }
    }

    // 2. Official Ministry Header Text
    const textX = margin + 24
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 30, 70) // Navy Blue
    doc.text('KEMENTERIAN KESIHATAN MALAYSIA', textX, 13)

    doc.setFontSize(9.5)
    doc.setTextColor(13, 148, 136) // Dark Teal #0d9488
    doc.text(`${hospitalName.toUpperCase()}, SARAWAK`, textX, 18)

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(90, 100, 115)
    doc.text(
      'Jalan Hospital, 98850 Lawas, Sarawak  |  Tel: 085-283781  |  Emel: farmasi.hlawas@moh.gov.my',
      textX,
      22.5
    )

    // 3. Double-rule Letterhead Divider
    doc.setDrawColor(13, 148, 136)
    doc.setLineWidth(0.8)
    doc.line(margin, 26.5, pageW - margin, 26.5)

    doc.setDrawColor(200, 210, 220)
    doc.setLineWidth(0.3)
    doc.line(margin, 28, pageW - margin, 28)
  }

  // Draw first page header
  drawHeader()

  // ─── Document Title Banner ──────────────────────────────────────────────────
  const titleY = 32
  doc.setFillColor(15, 76, 92) // Deep Medical Teal #0f4c5c
  doc.roundedRect(margin, titleY, pageW - margin * 2, 11, 2, 2, 'F')

  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('KATALOG UBAT WAD PEDIATRIK', pageW / 2, titleY + 5.5, { align: 'center' })

  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(204, 251, 241) // Light teal text
  doc.text(
    'PAEDIATRIC DRUG CATALOGUE — DISENARAI DARI KATALOG MYINVENTORY',
    pageW / 2,
    titleY + 9.2,
    { align: 'center' }
  )

  // ─── Meta Details Strip ─────────────────────────────────────────────────────
  const metaY = titleY + 14
  doc.setFillColor(248, 250, 252) // Slate 50
  doc.setDrawColor(226, 232, 240) // Slate 200
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, metaY, pageW - margin * 2, 16, 1.5, 1.5, 'FD')

  const now = new Date()
  const dateStr = now.toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })

  // Left Column
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text('Unit / Wad:', margin + 4, metaY + 5.5)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(departmentName, margin + 28, metaY + 5.5)

  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('No. Rujukan:', margin + 4, metaY + 11.5)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(referenceNo, margin + 28, metaY + 11.5)

  // Right Column
  const rightColX = pageW / 2 + 8
  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Tarikh Cetakan:', rightColX, metaY + 5.5)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(`${dateStr}, ${timeStr}`, rightColX + 26, metaY + 5.5)

  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Jumlah Rekod:', rightColX, metaY + 11.5)
  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(13, 148, 136)
  doc.text(`${items.length} Ubat Berdaftar`, rightColX + 26, metaY + 11.5)

  // Sort items alphabetically A-Z by drug name
  const sortedItems = [...items].sort((a, b) => {
    const nameA = (a.drug?.drug_name || '').trim().toLowerCase()
    const nameB = (b.drug?.drug_name || '').trim().toLowerCase()
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true })
  })

  // ─── Table Columns (Exact 5 Columns Requested by User) ──────────────────────
  // 1. Item Code
  // 2. Item Name
  // 3. Prescriber
  // 4. Packaging
  // 5. Price
  // Total width: 8.5 + 27.5 + 70 + 23.5 + 28.5 + 24 = 182mm (Matches exact 210mm - 2*14mm margin)
  const tableHead = [
    [
      { content: 'BIL', styles: { halign: 'center' as const, cellWidth: 8.5 } },
      { content: 'ITEM CODE\n(KOD ITEM)', styles: { halign: 'left' as const, cellWidth: 27.5 } },
      { content: 'ITEM NAME\n(NAMA UBAT & GENERIK)', styles: { halign: 'left' as const, cellWidth: 70 } },
      { content: 'PRESCRIBER\n(PRESKRIBER)', styles: { halign: 'center' as const, cellWidth: 23.5 } },
      { content: 'PACKAGING\n(PEMBUNGKUSAN)', styles: { halign: 'left' as const, cellWidth: 28.5 } },
      { content: 'PRICE\n(HARGA SEUNIT)', styles: { halign: 'right' as const, cellWidth: 24 } },
    ],
  ]

  const tableBody = sortedItems.map((item, index) => {
    // 1. Item Code
    const code = item.drug.drug_code || '-'

    // 2. Item Name (+ Generic Name if different)
    const name = item.drug.drug_name || '-'
    const generic =
      item.drug.generic_name && item.drug.generic_name.toLowerCase() !== name.toLowerCase()
        ? `\nINN: ${item.drug.generic_name}`
        : ''
    const fullName = `${name}${generic}`

    // 3. Prescriber
    const prescriber = item.prescriber_category ? `Kat ${item.prescriber_category}` : 'Kat C'

    // 4. Packaging
    const packaging = formatPackaging(
      item.drug.packaging_description ||
      item.drug.unit_of_measure ||
      item.drug.dosage_form
    )

    // 5. Price
    const priceFormatted = formatPrice(item.drug.price)

    return [
      { content: String(index + 1), styles: { halign: 'center' as const, fontSize: 7.5, textColor: [100, 116, 139] } },
      { content: code, styles: { halign: 'left' as const, font: 'helvetica' as const, fontStyle: 'bold' as const, fontSize: 7, textColor: [30, 41, 59] } },
      { content: fullName, styles: { halign: 'left' as const, fontSize: 7.5, textColor: [15, 23, 42] } },
      { content: prescriber, styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 7.5, textColor: [15, 76, 92] } },
      { content: packaging, styles: { halign: 'left' as const, fontSize: 7.5, textColor: [51, 65, 85] } },
      { content: priceFormatted, styles: { halign: 'right' as const, fontStyle: 'bold' as const, fontSize: 7.5, textColor: [15, 23, 42] } },
    ]
  })

  // Fallback row if no items
  if (tableBody.length === 0) {
    tableBody.push([
      { content: '-', styles: { halign: 'center' as const } },
      { content: '-', styles: { halign: 'center' as const } },
      { content: 'Tiada rekod ubat didaftarkan dalam Katalog Wad Pediatrik.', styles: { fontStyle: 'italic' as const } },
      { content: '-', styles: { halign: 'center' as const } },
      { content: '-', styles: { halign: 'center' as const } },
      { content: '-', styles: { halign: 'center' as const } },
    ] as any)
  }

  const tableStartY = metaY + 20

  autoTable(doc, {
    startY: tableStartY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      font: 'helvetica',
      textColor: [30, 41, 59], // Slate 800
      lineColor: [226, 232, 240], // Slate 200
      lineWidth: 0.2,
      cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 },
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [15, 76, 92], // Deep Medical Teal #0f4c5c
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.8,
      cellPadding: { top: 2.2, bottom: 2.2, left: 1.5, right: 1.5 },
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    margin: { left: margin, right: margin, bottom: 25, top: 32 },
    didDrawPage: (data) => {
      // Draw standard header on subsequent pages
      if (data.pageNumber > 1) {
        drawHeader()
      }

      // ─── Professional Footer on every page ─────────────────────────────────
      const footerY = pageH - 10
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.3)
      doc.line(margin, footerY - 3, pageW - margin, footerY - 3)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(140, 150, 165)
      doc.text(
        'H.O.M.E. — Hospital Operation Management Ecosystem | MyFormulari & MyInventory Integration',
        margin,
        footerY + 1
      )

      doc.setFont('Helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text(
        `Halaman ${data.pageNumber} daripada {total_pages_count_string}`,
        pageW - margin,
        footerY + 1,
        { align: 'right' }
      )
    },
  })

  // ─── Sign-off Signature Block on Last Page ─────────────────────────────────
  const finalY = (doc as any).lastAutoTable?.finalY ?? 200
  let sigY = finalY + 10

  // Check if signature block fits on current page (needs ~35mm)
  if (sigY + 35 > pageH - 20) {
    doc.addPage()
    drawHeader()
    sigY = 40
  }

  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(250, 252, 254)
  doc.roundedRect(margin, sigY, pageW - margin * 2, 30, 2, 2, 'FD')

  const sigColWidth = (pageW - margin * 2) / 3

  // Col 1: Disediakan Oleh
  const sig1X = margin + 6
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text('DISEDIAKAN OLEH:', sig1X, sigY + 6)
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text('Tandatangan & Cop Jawatan', sig1X, sigY + 10)
  doc.setDrawColor(180, 190, 205)
  doc.line(sig1X, sigY + 22, sig1X + sigColWidth - 12, sigY + 22)
  doc.text(`${generatedBy} (${generatedByTitle})`, sig1X, sigY + 26)

  // Col 2: Disemak Oleh
  const sig2X = margin + sigColWidth + 4
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text('DISEMAK OLEH:', sig2X, sigY + 6)
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text('Ketua Unit Farmasi Wad Pediatrik', sig2X, sigY + 10)
  doc.setDrawColor(180, 190, 205)
  doc.line(sig2X, sigY + 22, sig2X + sigColWidth - 12, sigY + 22)
  doc.text('Tarikh:', sig2X, sigY + 26)

  // Col 3: Disahkan Oleh
  const sig3X = margin + sigColWidth * 2 + 4
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text('DISAHKAN OLEH:', sig3X, sigY + 6)
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text('Pakar Pediatrik / Pengarah Hospital', sig3X, sigY + 10)
  doc.setDrawColor(180, 190, 205)
  doc.line(sig3X, sigY + 22, sig3X + sigColWidth - 12, sigY + 22)
  doc.text('Tarikh:', sig3X, sigY + 26)

  // Replace total pages placeholder
  if (typeof (doc as any).putTotalPages === 'function') {
    ;(doc as any).putTotalPages('{total_pages_count_string}')
  }

  // Save / Trigger Download
  const filename = `Katalog_Pediatrik_Hospital_Lawas_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.pdf`
  doc.save(filename)
}
