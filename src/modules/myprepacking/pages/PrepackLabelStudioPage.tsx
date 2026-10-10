// src/modules/myprepacking/pages/PrepackLabelStudioPage.tsx
import React, { useState, useEffect } from 'react'
import {
  Printer,
  Download,
  QrCode,
  Sliders,
  Boxes,
  PackageCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { getPrepackBatches } from '../services/prepackService'
import type { PrepackBatch, LabelFormat } from '../types/prepack'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import { useToast } from '@/stores/toastStore'

export const PrepackLabelStudioPage: React.FC = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [batches, setBatches] = useState<PrepackBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')

  // Label configuration
  const [format, setFormat] = useState<LabelFormat>('uod_50x25')
  const [printQuantity, setPrintQuantity] = useState<number>(10)
  const [includeQr, setIncludeQr] = useState<boolean>(true)
  const [includeMfgDetails, setIncludeMfgDetails] = useState<boolean>(true)
  const [hospitalHeader, setHospitalHeader] = useState<string>('HOSPITAL LAWAS')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)

  const loadBatches = async () => {
    setLoading(true)
    try {
      const { data } = await getPrepackBatches()
      const activeBatches = data || []
      setBatches(activeBatches)
      if (activeBatches.length > 0 && !selectedBatchId) {
        setSelectedBatchId(activeBatches[0].id)
      }
    } catch (err: any) {
      console.error('Error loading batches:', err)
      toast.error('Failed to load batch list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [])

  const selectedBatch = batches.find(b => b.id === selectedBatchId) || (batches.length > 0 ? batches[0] : null)

  // Generate QR code data URL whenever selectedBatch or hospitalHeader changes
  useEffect(() => {
    if (selectedBatch && selectedBatch.prepack_item) {
      const payload = JSON.stringify({
        h: hospitalHeader,
        i: selectedBatch.prepack_item.item_code,
        m: selectedBatch.prepack_item.item_name,
        b: selectedBatch.batch_number,
        exp: selectedBatch.prepack_expiry_date,
        dos: selectedBatch.prepack_item.strength || '1U'
      })

      QRCode.toDataURL(payload, {
        width: 140,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Error generating QR:', err))
    }
  }, [selectedBatch, hospitalHeader])

  const handleDirectPrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    if (!selectedBatch || !selectedBatch.prepack_item) return
    setIsGeneratingPdf(true)
    try {
      const item = selectedBatch.prepack_item

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

          doc.setLineWidth(0.2)
          doc.rect(1, 1, width - 2, height - 2)

          doc.setFontSize(6)
          doc.setFont('helvetica', 'bold')
          doc.text(`${hospitalHeader} - UNIT DOSE`, 2, 3.5)

          doc.setFontSize(7)
          doc.text((item.item_name || '').toUpperCase().slice(0, 24), 2, 7)

          doc.setFontSize(6)
          doc.setFont('helvetica', 'normal')
          doc.text(`Dose: ${item.strength || '1 Unit'} (${item.dosage_form})`, 2, 10.5)
          doc.text(`Lot: ${selectedBatch.batch_number}`, 2, 13.5)
          if (includeMfgDetails) {
            doc.text(`Mfg: ${selectedBatch.mfg_batch_number} (Exp: ${selectedBatch.mfg_expiry_date})`, 2, 16.5)
          }
          doc.setFont('helvetica', 'bold')
          doc.text(`EXPIRY: ${selectedBatch.prepack_expiry_date}`, 2, height - 3.5)
          doc.setFontSize(5)
          doc.setFont('helvetica', 'normal')
          doc.text(`Packed: ${selectedBatch.pack_date}`, 2, height - 1.5)

          if (includeQr && qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', width - 15, 3, 13, 13)
          }
        }

        doc.save(`Label_${selectedBatch.batch_number}_x${printQuantity}.pdf`)
      } else {
        const width = 70
        const height = 35
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [height, width]
        })

        for (let i = 0; i < printQuantity; i++) {
          if (i > 0) doc.addPage([height, width], 'landscape')

          const isExternal = item.pack_type === 'external'
          const isInternal = item.pack_type === 'internal'

          if (isExternal) {
            doc.setDrawColor(220, 38, 38)
            doc.setLineWidth(0.5)
            doc.rect(1.5, 1.5, width - 3, height - 3)
            doc.setFillColor(220, 38, 38)
            doc.rect(1.5, 1.5, width - 3, 5, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(6.5)
            doc.setFont('helvetica', 'bold')
            doc.text('FOR EXTERNAL USE ONLY / NOT TO BE TAKEN', width / 2, 4.8, { align: 'center' })
            doc.setTextColor(0, 0, 0)
          } else {
            doc.setDrawColor(0, 0, 0)
            doc.setLineWidth(0.3)
            doc.rect(1.5, 1.5, width - 3, height - 3)
            doc.setFontSize(7)
            doc.setFont('helvetica', 'bold')
            const deptHeader = isInternal ? `INTERNAL PREPARATION - ${hospitalHeader}` : `PHARMACY DEPARTMENT - ${hospitalHeader}`
            doc.text(deptHeader, width / 2, 4.5, { align: 'center' })
          }

          doc.setFontSize(8)
          doc.setFont('helvetica', 'bold')
          doc.text(item.item_name.toUpperCase().slice(0, 32), 3, 9)

          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          doc.text(`Quantity: ${item.units_per_pack} units/pack (${item.package_type})`, 3, 13)
          doc.text(`Batch No: ${selectedBatch.batch_number}  |  Mfg: ${selectedBatch.mfg_batch_number}`, 3, 17)
          doc.text(`Pack Date: ${selectedBatch.pack_date}`, 3, 21)

          doc.setFont('helvetica', 'bold')
          doc.text(`EXPIRY DATE (BUD): ${selectedBatch.prepack_expiry_date}`, 3, 25)

          doc.setFontSize(6)
          doc.setFont('helvetica', 'normal')
          doc.text(item.storage_instructions || 'Store in a cool & dry place.', 3, 28.5)
          doc.setFont('helvetica', 'bold')
          const bottomNotice = isExternal 
            ? '*** AVOID CONTACT WITH EYES • KEEP OUT OF REACH OF CHILDREN ***'
            : isInternal 
            ? '*** SHAKE WELL BEFORE USE • KEEP OUT OF REACH OF CHILDREN ***'
            : '*** KEEP OUT OF REACH OF CHILDREN ***'
          doc.text(bottomNotice, width / 2, height - 2.5, { align: 'center' })

          if (includeQr && qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', width - 17, 7, 14, 14)
          }
        }

        doc.save(`Label_Bulk_${selectedBatch.batch_number}_x${printQuantity}.pdf`)
      }

      toast.success(`PDF successfully downloaded for ${printQuantity} labels!`)
    } catch (err: any) {
      console.error('Error downloading label PDF:', err)
      toast.error('Failed to generate label PDF')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="bg-surface rounded-xl border border-border-default p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                UOD &amp; Prepack Label Print Studio
              </h1>
              <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
                High-density micro-label generator for Unit of Dose (UOD) sachets, amber syrup bottles, and A4 sticker sheets.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form & Settings (5 cols) */}
        <div className="lg:col-span-5 bg-surface p-5 rounded-xl border border-border-default shadow-xs space-y-4">
          <h2 className="text-xs font-semibold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Configuration &amp; Print Options</span>
          </h2>

          {/* Select Batch */}
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Select Packaging Batch
            </label>
            {batches.length === 0 ? (
              <div className="p-3 bg-subtle/50 rounded-lg border border-border-subtle text-xs text-text-muted">
                No active batches found.
              </div>
            ) : (
              <select
                value={selectedBatchId}
                onChange={e => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong focus:border-border-strong rounded-lg text-text-primary font-mono outline-none cursor-pointer"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batch_number} - {b.prepack_item?.item_name} (Balance: {b.current_balance})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Label Format */}
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Label Paper Format / Size
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'uod_50x25', title: 'UOD Micro-Label (50mm x 25mm)', desc: 'Standard thermal sachet / single dose' },
                { id: 'uod_40x20', title: 'UOD Compact (40mm x 20mm)', desc: 'Small ampoule / compact sachet' },
                { id: 'bulk_70x35', title: 'Amber Bottle / Container Label (70mm x 35mm)', desc: 'For syrups, creams, and outpatient packs' },
                { id: 'sheet_a4_24', title: 'A4 Sticker Sheet (3x8 Grid = 24 Stickers)', desc: 'Standard laser printer on A4 sticker sheets' }
              ].map(f => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFormat(f.id as LabelFormat)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all active:scale-[0.98] cursor-pointer ${
                    format === f.id
                      ? 'border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold shadow-xs'
                      : 'border-border-subtle hover:border-border-default bg-subtle/40 hover:bg-subtle/80 text-text-secondary'
                  }`}
                >
                  <div className="text-xs font-semibold">{f.title}</div>
                  <div className="text-[10px] text-text-muted">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hospital Header */}
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Hospital Name / Label Header
            </label>
            <input
              type="text"
              value={hospitalHeader}
              onChange={e => setHospitalHeader(e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong focus:border-border-strong rounded-lg text-text-primary uppercase font-bold outline-none"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Required Label Quantity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="5000"
                value={printQuantity}
                onChange={e => setPrintQuantity(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-1.5 text-xs bg-subtle/70 hover:bg-subtle border border-border-default hover:border-border-strong focus:border-border-strong rounded-lg text-text-primary font-bold font-mono outline-none"
              />
              <div className="flex gap-1 flex-wrap">
                {[1, 10, 50, 100].map(q => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setPrintQuantity(q)}
                    className="px-2.5 py-1 text-xs bg-surface hover:bg-subtle text-text-secondary border border-border-default hover:border-border-strong rounded-md font-medium cursor-pointer active:scale-[0.98] transition-all shadow-xs"
                  >
                    {q}x
                  </button>
                ))}
                {selectedBatch && (
                  <button
                    type="button"
                    onClick={() => setPrintQuantity(selectedBatch.quantity_packed)}
                    className="px-2.5 py-1 text-xs bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 rounded-md font-semibold cursor-pointer active:scale-[0.98] transition-all shadow-xs"
                  >
                    Match Batch ({selectedBatch.quantity_packed})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={includeQr}
                onChange={e => setIncludeQr(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-border-default"
              />
              <span>Include 2D QR Code for Bedside Scanning</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={includeMfgDetails}
                onChange={e => setIncludeMfgDetails(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-border-default"
              />
              <span>Display Manufacturer Lot No. &amp; Original Expiry Date</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 space-y-2">
            <button
              onClick={handleDirectPrint}
              disabled={!selectedBatch}
              className="w-full min-h-[38px] py-2 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>Print to Thermal Printer ({printQuantity} labels)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={!selectedBatch || isGeneratingPdf}
              className="w-full min-h-[36px] py-1.5 bg-surface hover:bg-subtle active:scale-[0.98] text-text-primary font-medium text-xs rounded-lg flex items-center justify-center gap-2 border border-border-default hover:border-border-strong transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-text-muted" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Label PDF'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Visual Layout & Printing Preview (7 cols) */}
        <div className="lg:col-span-7 bg-surface p-6 rounded-xl border border-border-default shadow-xs flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Live Label Print Preview</span>
          </div>

          {!selectedBatch || !selectedBatch.prepack_item ? (
            <div className="p-12 text-center text-text-muted text-xs">
              Please select a batch on the left to preview the label.
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* UOD 50x25 */}
              {format === 'uod_50x25' && (
                <div className="w-[320px] h-[160px] bg-white text-black p-3 rounded-lg shadow-xl border-2 border-gray-600 font-sans relative flex flex-col justify-between select-none">
                  <div>
                    <div className="text-[9px] font-black tracking-tight uppercase border-b-2 border-black pb-0.5 mb-1 flex justify-between items-center">
                      <span>{hospitalHeader} • UOD</span>
                      <span className="text-[8px] bg-black text-white px-1 font-mono">1 UNIT</span>
                    </div>
                    <div className="text-[12px] font-black leading-tight line-clamp-2 uppercase">
                      {selectedBatch.prepack_item.item_name}
                    </div>
                    <div className="text-[9.5px] text-gray-800 font-semibold mt-0.5">
                      Dose: {selectedBatch.prepack_item.strength || '1 Unit'} ({selectedBatch.prepack_item.dosage_form})
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-[8.5px] space-y-0.5 leading-tight">
                      <div className="font-mono font-bold">Lot: {selectedBatch.batch_number}</div>
                      {includeMfgDetails && (
                        <div className="text-[7.5px] text-gray-700">Mfg: {selectedBatch.mfg_batch_number} (Exp: {selectedBatch.mfg_expiry_date})</div>
                      )}
                      <div className="text-[9.5px] font-black text-black">
                        EXP: {selectedBatch.prepack_expiry_date}
                      </div>
                      <div className="text-[8px] text-gray-600">Packed: {selectedBatch.pack_date}</div>
                    </div>

                    {includeQr && qrDataUrl && (
                      <img src={qrDataUrl} alt="QR Code" className="w-14 h-14 object-contain" />
                    )}
                  </div>
                </div>
              )}

              {/* UOD 40x20 */}
              {format === 'uod_40x20' && (
                <div className="w-[260px] h-[130px] bg-white text-black p-2.5 rounded-lg shadow-xl border-2 border-gray-600 font-sans relative flex flex-col justify-between select-none">
                  <div>
                    <div className="text-[8.5px] font-black uppercase flex justify-between border-b border-black pb-0.5 mb-0.5">
                      <span>{hospitalHeader}</span>
                      <span>UOD</span>
                    </div>
                    <div className="text-[10px] font-black leading-tight uppercase truncate">
                      {selectedBatch.prepack_item.item_name}
                    </div>
                    <div className="text-[8.5px] font-semibold">{selectedBatch.prepack_item.strength}</div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-[7.5px] space-y-0.2 leading-tight">
                      <div className="font-mono font-bold">Lot: {selectedBatch.batch_number}</div>
                      <div className="text-[9px] font-black">EXP: {selectedBatch.prepack_expiry_date}</div>
                    </div>
                    {includeQr && qrDataUrl && (
                      <img src={qrDataUrl} alt="QR Code" className="w-10 h-10 object-contain" />
                    )}
                  </div>
                </div>
              )}

              {/* Bulk 70x35 */}
              {format === 'bulk_70x35' && (
                <div className={`w-[380px] h-[190px] bg-white text-black p-4 rounded-lg shadow-xl font-sans relative flex flex-col justify-between select-none overflow-hidden ${
                  selectedBatch.prepack_item.pack_type === 'external'
                    ? 'border-2 border-red-600'
                    : 'border-2 border-black'
                }`}>
                  {selectedBatch.prepack_item.pack_type === 'external' ? (
                    <div className="bg-red-600 text-white font-black text-center py-1 -mx-4 -mt-4 text-[9.5px] uppercase tracking-wider shadow-xs">
                      FOR EXTERNAL USE ONLY / NOT TO BE TAKEN
                    </div>
                  ) : (
                    <div className="text-center border-b-2 border-black pb-1">
                      <div className="text-[9.5px] font-bold tracking-wider">
                        {selectedBatch.prepack_item.pack_type === 'internal' ? 'INTERNAL PREPARATION • PHARMACY DEPARTMENT' : 'PHARMACY DEPARTMENT'}
                      </div>
                      <div className="text-[11px] font-black">{hospitalHeader}</div>
                    </div>
                  )}

                  <div className="my-auto py-1">
                    <div className="text-[13px] font-black uppercase leading-tight line-clamp-2">
                      {selectedBatch.prepack_item.item_name}
                    </div>
                    <div className="text-[10px] text-gray-800 font-medium mt-0.5">
                      Quantity: {selectedBatch.prepack_item.units_per_pack} units/pack ({selectedBatch.prepack_item.package_type})
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] border-t border-gray-300 pt-1">
                    <div>
                      <div className="font-mono font-bold">Batch No: {selectedBatch.batch_number}</div>
                      <div className="text-gray-700">Mfg Batch: {selectedBatch.mfg_batch_number} (Exp: {selectedBatch.mfg_expiry_date})</div>
                      <div className="font-black text-[10px]">EXPIRY DATE: {selectedBatch.prepack_expiry_date}</div>
                      <div className="text-[8px] text-gray-600">Pack Date: {selectedBatch.pack_date}</div>
                    </div>
                    {includeQr && qrDataUrl && (
                      <img src={qrDataUrl} alt="QR Code" className="w-14 h-14 object-contain" />
                    )}
                  </div>

                  <div className={`text-center text-[8px] font-black border-t pt-0.5 mt-1 tracking-wider ${
                    selectedBatch.prepack_item.pack_type === 'external'
                      ? 'border-red-300 text-red-600'
                      : 'border-black'
                  }`}>
                    {selectedBatch.prepack_item.pack_type === 'external'
                      ? '*** AVOID CONTACT WITH EYES • KEEP OUT OF REACH OF CHILDREN ***'
                      : selectedBatch.prepack_item.pack_type === 'internal'
                      ? '*** SHAKE WELL BEFORE USE • KEEP OUT OF REACH OF CHILDREN ***'
                      : '*** KEEP OUT OF REACH OF CHILDREN ***'}
                  </div>
                </div>
              )}

              {/* Sheet A4 24 */}
              {format === 'sheet_a4_24' && (
                <div className="w-[340px] bg-white text-black p-3.5 rounded-lg shadow-xl border border-gray-400 font-sans space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase text-center border-b pb-1">
                    A4 Sticker Sheet Preview (24 Labels/Sheet)
                  </div>
                  <div className="grid grid-cols-2 gap-2 opacity-90">
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx} className="border border-dashed border-gray-400 p-2 rounded text-[7.5px] leading-tight">
                        <div className="font-bold truncate">{selectedBatch.prepack_item?.item_name}</div>
                        <div className="text-[7px]">Lot: {selectedBatch.batch_number}</div>
                        <div className="font-black text-[8px]">EXP: {selectedBatch.prepack_expiry_date}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[9px] text-center text-gray-500 italic">
                    3 columns x 8 rows grid format on A4 label paper
                  </div>
                </div>
              )}

              <div className="mt-6 text-center text-xs text-text-muted">
                🏷️ Actual size prints according to printer millimeter calibration.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrepackLabelStudioPage
