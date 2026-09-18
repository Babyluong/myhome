// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { X, Printer, Loader2, FileText, Truck, CheckCircle } from 'lucide-react';
import { getReceiveDocumentById } from '@/modules/mycylinder/services/oxygenService';
import type { OxygenReceiveDocumentWithRelations } from '@/types/pharmacy';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';

interface ReceiveDocumentPrintViewProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveDocumentPrintView: React.FC<ReceiveDocumentPrintViewProps> = ({
  documentId,
  isOpen,
  onClose,
}) => {
  const { user: currentUser } = useAuthStore();
  const [doc, setDoc] = useState<OxygenReceiveDocumentWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizes, setSizes] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocumentDetails();
    }
  }, [isOpen, documentId]);

  const loadDocumentDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getReceiveDocumentById(documentId);
      if (res.error) throw new Error(res.error);
      setDoc(res.data);

      const { data: sizesData } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('*');
      const { data: typesData } = await supabase.from('pharmacy_oxygen_cylinder_types').select('*');
      if (sizesData) setSizes(sizesData);
      if (typesData) setTypes(typesData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load document details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeLabel = (sizeId?: string, typeId?: string) => {
    const size = sizes.find(s => s.id === sizeId);
    const type = types.find(t => t.id === typeId);
    if (!size && !type) return 'Standard Cylinder';
    const typeCode = type?.code || '';
    const capacity = size ? parseFloat(size.capacity).toFixed(1).replace(/\.0$/, '') : '';
    const unit = size?.unit || 'm3';
    return `${typeCode} ${capacity}${unit}`.trim() || 'Standard Cylinder';
  };

  const handlePrint = () => {
    if (!doc) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Sila benarkan pop-up untuk mencetak dokumen.');
      return;
    }

    const logoUrl = window.location.origin + '/512px-Jata_MalaysiaV2.svg.png';

    // Group cylinders by size/type
    const cylindersList = (doc.items || []).map(i => i.cylinder).filter(Boolean);
    const grouped: { [sizeLabel: string]: any[] } = {};
    cylindersList.forEach(cyl => {
      const label = (cyl as any).combo?.display_name || getSizeLabel(cyl.cylinder_size_id, cyl.cylinder_type_id);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(cyl);
    });

    let rowsHtml = '';
    let renderedRowsCount = 0;

    Object.keys(grouped).forEach(sizeLabel => {
      const list = grouped[sizeLabel];
      const chunks: any[][] = [];
      for (let i = 0; i < list.length; i += 4) {
        const chunk = list.slice(i, i + 4);
        while (chunk.length < 4) chunk.push(null);
        chunks.push(chunk);
      }

      rowsHtml += `
        <tr style="border-bottom: 1.5px solid #000; background-color: #f1f5f9; font-weight: bold; height: 26px;">
          <td style="border-right: 1.5px solid #000; padding: 3px 8px; text-align: left; font-size: 9.5px;" colspan="1">
            SPESIFIKASI: ${sizeLabel}
          </td>
          <td style="border-right: 1.5px solid #000;" colspan="4"></td>
          <td style="border-right: 1.5px solid #000; padding: 3px 8px; text-align: center; font-size: 9.5px; font-weight: 800;" colspan="1">
            JUMLAH: ${list.length}
          </td>
          <td style="padding: 3px 8px;" colspan="1"></td>
        </tr>
      `;
      renderedRowsCount++;

      chunks.forEach(chunk => {
        const c0 = chunk[0] ? `<span style="display: inline-block; padding: 2px 6px; background-color: #f8fafc; border: 1px solid #94a3b8; border-radius: 4px; font-family: monospace; font-size: 9px; font-weight: 700; color: #0f172a;">${chunk[0].qr_code || chunk[0].serial_number}</span>` : '';
        const c1 = chunk[1] ? `<span style="display: inline-block; padding: 2px 6px; background-color: #f8fafc; border: 1px solid #94a3b8; border-radius: 4px; font-family: monospace; font-size: 9px; font-weight: 700; color: #0f172a;">${chunk[1].qr_code || chunk[1].serial_number}</span>` : '';
        const c2 = chunk[2] ? `<span style="display: inline-block; padding: 2px 6px; background-color: #f8fafc; border: 1px solid #94a3b8; border-radius: 4px; font-family: monospace; font-size: 9px; font-weight: 700; color: #0f172a;">${chunk[2].qr_code || chunk[2].serial_number}</span>` : '';
        const c3 = chunk[3] ? `<span style="display: inline-block; padding: 2px 6px; background-color: #f8fafc; border: 1px solid #94a3b8; border-radius: 4px; font-family: monospace; font-size: 9px; font-weight: 700; color: #0f172a;">${chunk[3].qr_code || chunk[3].serial_number}</span>` : '';

        rowsHtml += `
          <tr style="border-bottom: 1px solid #ccc; text-align: center; height: 24px;">
            <td style="border-right: 1.5px solid #000;"></td>
            <td style="border-right: 1px solid #e2e8f0; padding: 2px 4px;">${c0}</td>
            <td style="border-right: 1px solid #e2e8f0; padding: 2px 4px;">${c1}</td>
            <td style="border-right: 1px solid #e2e8f0; padding: 2px 4px;">${c2}</td>
            <td style="border-right: 1.5px solid #000; padding: 2px 4px;">${c3}</td>
            <td style="border-right: 1.5px solid #000;"></td>
            <td></td>
          </tr>
        `;
        renderedRowsCount++;
      });
    });

    const targetRowCount = 5;
    while (renderedRowsCount < targetRowCount) {
      rowsHtml += `
        <tr style="border-bottom: 1px solid #ccc; text-align: center; height: 24px;">
          <td style="border-right: 1.5px solid #000;"></td>
          <td style="border-right: 1.5px solid #000;" colspan="4"></td>
          <td style="border-right: 1.5px solid #000;"></td>
          <td></td>
        </tr>
      `;
      renderedRowsCount++;
    }

    const totalQty = cylindersList.length;
    const receivedDateStr = new Date(doc.received_date || doc.created_at).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const supplierName = doc.supplier?.company_name || 'BORNEO INDAH SDN BHD';

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Akuan Penerimaan Silinder Oksigen - ${doc.document_number}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 12mm 15mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #000;
            background-color: #fff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-page {
            box-sizing: border-box;
            background: #fff;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
        </style>
      </head>
      <body>
        <div class="print-page">
          <!-- Hospital Header -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; margin-bottom: 6px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <img src="${logoUrl}" style="height: 48px; width: auto;" alt="Jata Negara" />
              <div style="text-align: left; line-height: 1.25;">
                <div style="font-size: 13px; font-weight: 800; color: #1e293b; text-transform: uppercase;">HOSPITAL LAWAS</div>
                <div style="font-size: 9.5px; color: #475569;">Jalan Hospital, 98850 Lawas, Sarawak, Malaysia.</div>
                <div style="font-size: 8.5px; color: #64748b; font-weight: 600;">UNIT FARMASI & STOR PERBEKALAN GAS PERUBATAN</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 9px; color: #475569; line-height: 1.35;">
              <div><strong>Telefon:</strong> 085-283781</div>
              <div><strong>Faks:</strong> 085-285993</div>
              <div><strong>Email:</strong> hosp_lawas@moh.gov.my</div>
            </div>
          </div>
          <div style="border-bottom: 1.5px solid #000; margin-bottom: 8px;"></div>

          <!-- Title -->
          <div style="text-align: center; margin-bottom: 8px;">
            <h1 style="font-size: 13px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
              SURAT AKUAN PENERIMAAN SILINDER OKSIGEN PERUBATAN
            </h1>
            <h2 style="font-size: 10px; font-weight: 700; margin: 2px 0 0 0; text-transform: uppercase; color: #334155;">
              (PENERIMAAN DARI PEMBEKAL KE STOR GAS UTAMA)
            </h2>
          </div>

          <!-- Metadata Box -->
          <table style="width: 100%; border: 1.5px solid #000; margin-bottom: 0;">
            <tr>
              <td style="width: 50%; padding: 6px 10px; border-right: 1.5px solid #000; vertical-align: top;">
                <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase;">DITERIMA DARIPADA (SUPPLIER)</div>
                <div style="font-size: 10.5px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${supplierName}</div>
                <div style="font-size: 8.5px; color: #334155; margin-top: 2px;">Pembekal Gas Perubatan Sah KKM</div>
              </td>
              <td style="width: 50%; padding: 6px 10px; vertical-align: top;">
                <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase;">LOKASI PENERIMAAN (RECIPIENT)</div>
                <div style="font-size: 10.5px; font-weight: 800; color: #0f172a; text-transform: uppercase;">STOR GAS UTAMA (CENTRAL STORE)</div>
                <div style="font-size: 8.5px; color: #334155; margin-top: 2px;">Hospital Lawas, Sarawak</div>
              </td>
            </tr>
          </table>

          <!-- Doc Details Bar -->
          <table style="width: 100%; border: 1.5px solid #000; border-top: none; background-color: #f8fafc; font-size: 9px; margin-bottom: 8px;">
            <tr>
              <td style="padding: 4px 8px; border-right: 1px solid #cbd5e1;">
                <strong>NO. DOKUMEN:</strong> ${doc.document_number}
              </td>
              <td style="padding: 4px 8px; border-right: 1px solid #cbd5e1;">
                <strong>NO. DO (SURAT HANTARAN):</strong> ${doc.delivery_order_no || '-'}
              </td>
              <td style="padding: 4px 8px; border-right: 1px solid #cbd5e1;">
                <strong>TARIKH TERIMA:</strong> ${receivedDateStr}
              </td>
              <td style="padding: 4px 8px; text-align: right;">
                <strong>STATUS:</strong> ${doc.status?.toUpperCase()}
              </td>
            </tr>
          </table>

          <!-- Cylinders Table -->
          <table style="width: 100%; border: 1.5px solid #000; font-size: 9px;">
            <thead>
              <tr style="background-color: #e2e8f0; border-bottom: 1.5px solid #000; height: 26px;">
                <th style="border-right: 1.5px solid #000; padding: 4px 8px; width: 22%; text-align: left;">JENIS & SAIZ GAS</th>
                <th style="border-right: 1.5px solid #000; padding: 4px 8px; text-align: center;" colspan="4">NOMBOR SIRI SILINDER (SERIAL NO)</th>
                <th style="border-right: 1.5px solid #000; padding: 4px 8px; width: 14%; text-align: center;">KUANTITI</th>
                <th style="padding: 4px 8px; width: 16%; text-align: center;">CATATAN</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <!-- Total Row -->
              <tr style="border-top: 2px solid #000; background-color: #e2e8f0; font-weight: 900; height: 28px;">
                <td style="border-right: 1.5px solid #000; padding: 4px 8px;" colspan="5">
                  JUMLAH KESELURUHAN SILINDER DITERIMA (TOTAL RECEIVED)
                </td>
                <td style="border-right: 1.5px solid #000; padding: 4px 8px; text-align: center; font-size: 11px;">
                  ${totalQty} UNIT
                </td>
                <td style="padding: 4px 8px; text-align: center; font-size: 8px;">TERIMA BAIK</td>
              </tr>
            </tbody>
          </table>

          <!-- Catatan / Remarks -->
          <div style="margin-top: 8px; font-size: 8.5px; border: 1px solid #cbd5e1; padding: 6px 8px; border-radius: 4px;">
            <strong>CATATAN:</strong> ${doc.remarks || 'Semua silinder telah diperiksa fizikal, tiada kebocoran dikesan, dan dimasukkan terus ke stok Tersedia Stor Gas Utama.'}
          </div>

          <!-- Signatures -->
          <table style="width: 100%; margin-top: 18px; border-collapse: collapse;">
            <tr>
              <td style="width: 48%; border: 1.5px solid #000; padding: 8px; vertical-align: top;">
                <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 35px;">
                  DISEMAK & DITERIMA OLEH (HOSPITAL LAWAS):
                </div>
                <div style="border-bottom: 1px dotted #000; margin-bottom: 4px;"></div>
                <div style="font-size: 8.5px; line-height: 1.3;">
                  <div><strong>Nama:</strong> ${doc.creator?.full_name || currentUser?.full_name || 'KAMRIAH BT HAJI MAIL'}</div>
                  <div><strong>Jawatan:</strong> ${doc.creator?.jawatan || 'PENOLONG PEGAWAI FARMASI U7 TBK 2'}</div>
                  <div><strong>Tarikh:</strong> ${receivedDateStr}</div>
                </div>
              </td>
              <td style="width: 4%;"></td>
              <td style="width: 48%; border: 1.5px solid #000; padding: 8px; vertical-align: top;">
                <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 35px;">
                  DIHANTAR OLEH (WAKIL PEMBEKAL):
                </div>
                <div style="border-bottom: 1px dotted #000; margin-bottom: 4px;"></div>
                <div style="font-size: 8.5px; line-height: 1.3;">
                  <div><strong>Nama Pemandu / Wakil:</strong> ............................................................</div>
                  <div><strong>No. Kad Pengenalan:</strong> ............................................................</div>
                  <div><strong>No. Kenderaan (Lori):</strong> ............................................................</div>
                  <div><strong>Tarikh:</strong> ${receivedDateStr}</div>
                </div>
              </td>
            </tr>
          </table>

          <div style="margin-top: 12px; text-align: center; font-size: 8px; color: #64748b;">
            Cetakan Komputer Sistem Pengurusan Operasi Hospital (H.O.M.E.) • Sah Tanpa Tandatangan Fizikal Tambahan
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  if (!isOpen) return null;

  const cylindersList = (doc?.items || []).map(i => i.cylinder).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Surat Akuan Penerimaan Silinder
              </h3>
              <p className="text-xs text-slate-500 font-semibold font-mono">
                {doc?.document_number || 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-xs font-bold">Memuat butiran dokumen penerimaan...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
              {error}
            </div>
          ) : doc ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pembekal</span>
                  <span className="text-xs font-extrabold text-slate-900 block truncate">
                    {doc.supplier?.company_name || 'Pembekal'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">No. DO</span>
                  <span className="text-xs font-mono font-extrabold text-slate-900 block truncate">
                    {doc.delivery_order_no || '-'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tarikh Terima</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {new Date(doc.received_date).toLocaleDateString('ms-MY')}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Silinder Diterima</span>
                  <span className="text-sm font-extrabold text-emerald-800 block">
                    {cylindersList.length} Unit
                  </span>
                </div>
              </div>

              {/* Cylinders List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">Senarai Silinder Terkandung</span>
                  <span className="text-[11px] font-bold text-emerald-700">Tersedia di Stor Utama</span>
                </div>
                <div className="max-h-[240px] overflow-y-auto divide-y divide-slate-100">
                  {cylindersList.map((cyl, idx) => (
                    <div key={cyl.id || idx} className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] text-slate-400 font-bold w-5">#{idx + 1}</span>
                        <span className="font-mono font-extrabold text-slate-900">{cyl.serial_number}</span>
                      </div>
                      <span className="text-slate-500 font-semibold text-[11px]">
                        {(cyl as any).combo?.display_name || 'Standard Cylinder'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            disabled={!doc || cylindersList.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Surat Akuan Penerimaan (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
