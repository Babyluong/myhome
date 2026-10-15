// src/modules/myprepacking/components/PrepackLabelPrintModal.tsx
import React, { useState, useEffect } from 'react'
import { Printer, Download, Sliders } from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import type { PrepackBatch, LabelFormat } from '../types/prepack'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import { useToast } from '@/stores/toastStore'

interface PrepackLabelPrintModalProps {
  isOpen: boolean
  onClose: () => void
  batch: PrepackBatch | null
  hospitalName?: string
}

export const PrepackLabelPrintModal: React.FC<PrepackLabelPrintModalProps> = ({
  isOpen,
  onClose,
  batch,
  hospitalName = 'HOSPITAL LAWAS'
}) => {
  const toast = useToast()
  const [format, setFormat] = useState<LabelFormat>('uod_50x25')
  const [printQuantity, setPrintQuantity] = useState<number>(1)
  const [includeQr, setIncludeQr] = useState<boolean>(true)
  const [includeMfgDetails, setIncludeMfgDetails] = useState<boolean>(true)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)

  // Determine initial format based on item pack_type
  useEffect(() => {
    if (batch?.prepack_item?.pack_type === 'uod') {
      setFormat('uod_50x25')
    } else {
      setFormat('bulk_70x35')
    }
    if (batch) {
      setPrintQuantity(Math.min(batch.quantity_packed || 10, 10))
    }
  }, [batch])

  // Generate QR code data URL
  useEffect(() => {
    if (batch) {
      const payload = JSON.stringify({
        h: hospitalName,
        i: batch.prepack_item?.item_code || 'CODE',
        m: batch.prepack_item?.item_name || 'ITEM',
        b: batch.batch_number,
        exp: batch.prepack_expiry_date,
        dos: batch.prepack_item?.strength || '1U'
      })

      QRCode.toDataURL(payload, {
        width: 120,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Error generating QR:', err))
    }
  }, [batch, hospitalName])

  if (!batch || !batch.prepack_item) return null

  const item = batch.prepack_item

  /**
   * Execute browser direct thermal label printing
   */
  const handleDirectPrint = () => {
    window.print()
  }

  /**
   * Generate vector PDF for downloading or external label printers
   */
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      if (format === 'uod_50x25' || format === 'uod_40x20') {
        const width = format === 'uod_50x25' ? 50 : 40
        const height = format === 'uod_50x25' ? 25 : 20
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [height, width]
        })

        for (let i = 0; i < printQuantity; i++) {
          if (i > 0) doc.addPage([height, width], 'landscape')

          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          doc.text(`${hospitalName} - UOD`, 2, 4)

          doc.setFontSize(8)
          doc.text((item.item_name || '').slice(0, 22), 2, 8)

          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          doc.text(`Dose: ${item.strength || '1U'}`, 2, 12)

          doc.setFontSize(6)
          doc.text(`Lot: ${batch.batch_number}`, 2, 16)
          if (includeMfgDetails) {
            doc.text(`Mfg: ${batch.mfg_batch_number}`, 2, 19)
          }

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7)
          doc.text(`EXP: ${batch.prepack_expiry_date}`, 2, 23)

          if (includeQr && qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', width - 14, height - 14, 12, 12)
          }
        }

        doc.save(`UOD_Labels_${batch.batch_number}.pdf`)
        toast.success(`Downloaded ${printQuantity} labels in vector PDF format!`)
      } else {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [35, 70]
        })

        for (let i = 0; i < printQuantity; i++) {
          if (i > 0) doc.addPage([35, 70], 'landscape')

          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          doc.text('PHARMACY DEPARTMENT', 35, 4, { align: 'center' })
          doc.text(hospitalName, 35, 7, { align: 'center' })

          doc.setFontSize(9)
          doc.text((item.item_name || '').slice(0, 32), 3, 12)

          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          const qtyText = `Qty: Pack ${item.units_per_pack}s`
          doc.text(qtyText, 3, 16)

          doc.setFontSize(6.5)
          doc.text(`Batch: ${batch.batch_number}`, 3, 20)
          doc.text(`Mfg: ${batch.mfg_batch_number} (Exp: ${batch.mfg_expiry_date})`, 3, 23)

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.5)
          doc.text(`EXPIRY DATE: ${batch.prepack_expiry_date}`, 3, 27)

          doc.setFontSize(6)
          doc.setFont('helvetica', 'normal')
          doc.text(`Packed: ${batch.pack_date}`, 3, 30)

          if (includeQr && qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', 54, 19, 13, 13)
          }

          doc.setFontSize(6)
          doc.setFont('helvetica', 'bold')
          doc.text('*** KEEP OUT OF REACH OF CHILDREN ***', 35, 33, { align: 'center' })
        }

        doc.save(`Prepack_Labels_${batch.batch_number}.pdf`)
        toast.success(`Downloaded ${printQuantity} labels in vector PDF format!`)
      }
    } catch (err: any) {
      console.error('Error generating PDF labels:', err)
      toast.error('Failed to generate PDF labels')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prepack & UOD Label Printing Studio"
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-border-default pr-0 lg:pr-5">
          {/* Format Selector */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Label Format & Size
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'uod_50x25', title: 'UOD Micro-Label (50mm x 25mm)', desc: 'Standard ward unit-dose foil / sachet' },
                { id: 'uod_40x20', title: 'UOD Compact (40mm x 20mm)', desc: 'For ampoules / small sachets' },
                { id: 'bulk_70x35', title: 'Bottle / Container Label (70mm x 35mm)', desc: 'Amber syrup bottles, jars, 30s packs' },
                { id: 'sheet_a4_24', title: 'A4 Sticker Sheet (24 Labels/Page)', desc: 'Standard desktop laser printer' }
              ].map(f => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFormat(f.id as LabelFormat)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-colors active:scale-[0.98] cursor-pointer ${
                    format === f.id
                      ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold shadow-xs'
                      : 'border-border-default bg-surface hover:bg-subtle text-text-secondary'
                  }`}
                >
                  <div className="text-xs font-bold">{f.title}</div>
                  <div className="text-[10px] text-text-muted">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity selector */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Print Quantity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1000"
                value={printQuantity}
                onChange={e => setPrintQuantity(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-1.5 text-sm bg-surface border border-border-default rounded-lg text-text-primary font-bold font-mono focus:outline-none focus:ring-1 focus:ring-teal-500/50"
              />
              <div className="flex gap-1">
                {[1, 10, 50, batch.quantity_packed].map(q => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setPrintQuantity(q)}
                    className="px-2.5 py-1 text-xs bg-subtle hover:bg-surface text-text-secondary rounded border border-border-default font-medium active:scale-[0.98] cursor-pointer transition-colors"
                  >
                    {q === batch.quantity_packed ? `All (${q})` : `${q}x`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Label Options */}
          <div className="space-y-2 pt-2 border-t border-border-default">
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={includeQr}
                onChange={e => setIncludeQr(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-border-default focus:ring-teal-500"
              />
              <span>Include 2D QR / DataMatrix code for bedside scanning</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={includeMfgDetails}
                onChange={e => setIncludeMfgDetails(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-border-default focus:ring-teal-500"
              />
              <span>Display manufacturer batch no. & original expiry date</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-2">
            <Button
              type="button"
              variant="primary"
              onClick={handleDirectPrint}
              className="w-full bg-teal-700 hover:bg-teal-600 active:scale-[0.98] py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Direct Print Now ({printQuantity} copies)
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPdf}
              isLoading={isGeneratingPdf}
              className="w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-border-default active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Vector PDF Labels
            </Button>
          </div>
        </div>

        {/* Right Column: Live Printable Visual Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-subtle p-6 rounded-xl border border-dashed border-border-default">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Live Label Print Preview</span>
          </div>

          {/* Visual Container based on format */}
          {format === 'uod_50x25' && (
            <div 
              id="printable-label-uod"
              className="w-[300px] h-[150px] bg-surface text-black p-3 rounded shadow-md border border-gray-400 font-sans relative flex flex-col justify-between select-none"
            >
              <div>
                <div className="text-[9px] font-black tracking-tight uppercase border-b border-black pb-0.5 mb-1 flex justify-between items-center">
                  <span>{hospitalName} • UOD</span>
                  <span className="text-[8px] bg-black text-white px-1 font-mono">1 UNIT</span>
                </div>
                <div className="text-[11px] font-black leading-tight line-clamp-2 uppercase">
                  {item.item_name}
                </div>
                <div className="text-[9px] text-text-primary font-semibold mt-0.5">
                  Dose: {item.strength || '1 Unit'} ({item.dosage_form})
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-[8px] space-y-0.5 leading-tight">
                  <div className="font-mono font-bold">Lot: {batch.batch_number}</div>
                  {includeMfgDetails && (
                    <div className="text-[7.5px] text-text-secondary">Mfg: {batch.mfg_batch_number} (Exp: {batch.mfg_expiry_date})</div>
                  )}
                  <div className="text-[9px] font-black text-black">
                    USE BEFORE: {batch.prepack_expiry_date}
                  </div>
                  <div className="text-[7.5px] text-text-muted">Packed: {batch.pack_date}</div>
                </div>

                {includeQr && qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-12 h-12 object-contain" />
                )}
              </div>
            </div>
          )}

          {format === 'uod_40x20' && (
            <div className="w-[240px] h-[120px] bg-surface text-black p-2 rounded shadow-md border border-gray-400 font-sans relative flex flex-col justify-between select-none">
              <div>
                <div className="text-[8px] font-black uppercase flex justify-between border-b border-black pb-0.5 mb-0.5">
                  <span>{hospitalName}</span>
                  <span>UOD</span>
                </div>
                <div className="text-[9px] font-black leading-tight uppercase truncate">
                  {item.item_name}
                </div>
                <div className="text-[8px] font-semibold">{item.strength}</div>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-[7px] space-y-0.2 leading-tight">
                  <div className="font-mono font-bold">Lot: {batch.batch_number}</div>
                  <div className="text-[8px] font-black">EXP: {batch.prepack_expiry_date}</div>
                </div>
                {includeQr && qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-9 h-9 object-contain" />
                )}
              </div>
            </div>
          )}

          {format === 'bulk_70x35' && (
            <div className="w-[360px] h-[180px] bg-surface text-black p-3.5 rounded shadow-md border-2 border-black font-sans relative flex flex-col justify-between select-none">
              <div className="text-center border-b-2 border-black pb-1">
                <div className="text-[9px] font-bold tracking-wider">PHARMACY DEPARTMENT</div>
                <div className="text-[10px] font-black">{hospitalName}</div>
              </div>

              <div className="my-auto py-1">
                <div className="text-[12px] font-black uppercase leading-tight line-clamp-2">
                  {item.item_name}
                </div>
                <div className="text-[9px] text-text-primary font-medium mt-0.5">
                  {item.pack_type === 'uod'
                    ? `Quantity: ${item.units_per_pack} dose per sachet (UOD)`
                    : item.pack_type === 'prepack_liquid'
                    ? `Quantity: ${item.units_per_pack} ml per bottle`
                    : item.pack_type === 'prepack_cream'
                    ? `Quantity: ${item.units_per_pack} g per container`
                    : `Quantity: Pack ${item.units_per_pack}s (${item.units_per_pack} units per pack)`}
                </div>
              </div>

              <div className="flex justify-between items-center text-[8.5px] border-t border-border-default pt-1">
                <div>
                  <div className="font-mono font-bold">Batch No: {batch.batch_number}</div>
                  <div className="text-text-secondary">Original Mfg: {batch.mfg_batch_number} (Exp: {batch.mfg_expiry_date})</div>
                  <div className="font-black text-[9.5px]">EXPIRY DATE: {batch.prepack_expiry_date}</div>
                  <div className="text-[7.5px] text-text-muted">Packed: {batch.pack_date}</div>
                </div>
                {includeQr && qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-14 h-14 object-contain" />
                )}
              </div>

              <div className="text-center text-[7.5px] font-black border-t border-black pt-0.5 mt-1 tracking-wider">
                *** KEEP OUT OF REACH OF CHILDREN ***
              </div>
            </div>
          )}

          {format === 'sheet_a4_24' && (
            <div className="w-[320px] bg-surface text-black p-3 rounded shadow-md border border-gray-400 font-sans space-y-2">
              <div className="text-[9px] font-bold text-text-muted uppercase text-center border-b pb-1">
                A4 Sticker Sheet Grid Preview (24 Stickers)
              </div>
              <div className="grid grid-cols-2 gap-1.5 opacity-80">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="border border-dashed border-gray-400 p-1.5 rounded text-[7px] leading-tight">
                    <div className="font-bold truncate">{item.item_name}</div>
                    <div className="text-[6.5px]">Lot: {batch.batch_number}</div>
                    <div className="font-black text-[7px]">EXP: {batch.prepack_expiry_date}</div>
                  </div>
                ))}
              </div>
              <div className="text-[8px] text-center text-text-muted italic">
                Printed across 3 columns x 8 rows on standard A4 sticker paper
              </div>
            </div>
          )}

          <div className="mt-4 text-[11px] text-text-muted text-center max-w-sm">
            💡 This label is calibrated for direct thermal printers (e.g., Zebra, TSC, Honeywell, Brother) and standard A4 laser sheets.
          </div>
        </div>
      </div>

      {/* Hidden Print Container for @media print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .thermal-page {
            page-break-after: always;
            width: ${format === 'uod_50x25' ? '50mm' : format === 'uod_40x20' ? '40mm' : '70mm'};
            height: ${format === 'uod_50x25' ? '25mm' : format === 'uod_40x20' ? '20mm' : '35mm'};
            padding: 1.5mm;
            box-sizing: border-box;
          }
        }
      `}</style>

      <div id="print-area" className="hidden">
        {Array.from({ length: printQuantity }).map((_, idx) => (
          <div key={idx} className="thermal-page bg-surface text-black font-sans flex flex-col justify-between">
            <div>
              <div style={{ fontSize: '6pt', fontWeight: 'bold' }}>
                {hospitalName} • UOD
              </div>
              <div style={{ fontSize: '7.5pt', fontWeight: 'bold', lineHeight: '1.1' }}>
                {item.item_name}
              </div>
              <div style={{ fontSize: '6pt' }}>
                Dose: {item.strength || '1 Unit'} ({item.dosage_form})
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '5.5pt', lineHeight: '1.1' }}>
                <div>Lot: {batch.batch_number}</div>
                {includeMfgDetails && <div>Mfg: {batch.mfg_batch_number}</div>}
                <div style={{ fontWeight: 'bold', fontSize: '6.5pt' }}>EXP: {batch.prepack_expiry_date}</div>
              </div>
              {includeQr && qrDataUrl && (
                <img src={qrDataUrl} alt="QR" style={{ width: '11mm', height: '11mm' }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default PrepackLabelPrintModal
