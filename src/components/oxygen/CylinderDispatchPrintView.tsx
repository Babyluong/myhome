// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { X, Printer, Loader2, FileText } from 'lucide-react';
import { getCylinderDispatchRequestById } from '@/services/pharmacy/cylinderDispatchService';
import type { CylinderDispatchRequestWithRelations } from '@/types/pharmacy';
import { supabase } from '@/services/supabase';

interface CylinderDispatchPrintViewProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  supplierName?: string;
}

export const CylinderDispatchPrintView: React.FC<CylinderDispatchPrintViewProps> = ({
  requestId,
  isOpen,
  onClose,
  supplierName,
}) => {
  const [request, setRequest] = useState<CylinderDispatchRequestWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; full_name: string; jawatan?: string }[]>([]);
  const [pricingConfigs, setPricingConfigs] = useState<any[]>([]);

  // Signature States
  const [pemohonName, setPemohonName] = useState('');
  const [pemohonPosition, setPemohonPosition] = useState('');

  const [penerimaName, setPenerimaName] = useState('');
  const [penerimaPosition, setPenerimaPosition] = useState('');
  const [penerimaDate, setPenerimaDate] = useState('');

  const [pelulusName, setPelulusName] = useState('');
  const [pelulusPosition, setPelulusPosition] = useState('');

  const [direkodName, setDirekodName] = useState('');
  const [direkodPosition, setDirekodPosition] = useState('');

  useEffect(() => {
    if (isOpen && requestId) {
      loadRequestDetails();
    }
  }, [isOpen, requestId]);

  const loadRequestDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCylinderDispatchRequestById(requestId);
      if (res.error) throw new Error(res.error);
      const data = res.data;
      setRequest(data);

      if (data) {
        const formattedDate = new Date(data.request_date).toLocaleDateString('en-GB');
        const meta = extractMetaFromRemarks(data.remarks);

        const isReturn = Boolean(
          data.is_external_facility && (
            data.external_operation === 'return' ||
            data.manual_requester_name?.toLowerCase().includes('return') ||
            data.manual_requester_name?.toLowerCase().includes('pulang') ||
            data.remarks?.toLowerCase().includes('pemulangan')
          )
        );

        if (isReturn) {
          // Return: Pemohon is the store officer returning the cylinders, Penerima is the driver/external receiver
          setPemohonName(data.requester?.full_name || 'PEGAWAI STOR FARMASI');
          setPemohonPosition(data.requester?.jawatan || 'Unit Farmasi Logistik');

          setPenerimaName(meta.driver || 'DRIVER / COURIER');
          setPenerimaPosition(`Pembawa ke ${data.external_facility_name || 'Fasiliti Luar'}`);
          setPenerimaDate(formattedDate);
        } else if (data.is_external_facility && data.indent_direction === 'inbound') {
          // Inbound: Pemohon is external sender/driver, Penerima is receiving officer
          setPemohonName(meta.driver || 'DRIVER / DISPATCHER');
          setPemohonPosition(`Pegawai Penghantar (${data.external_facility_name || 'Hospital Luar'})`);

          setPenerimaName(data.requester?.full_name || 'AMRI AMIT');
          setPenerimaPosition(data.requester?.jawatan || 'Penolong Pegawai Farmasi U5');
          setPenerimaDate(formattedDate);
        } else {
          // Outbound/Internal: Pemohon is internal requester, Penerima is ward recipient
          setPemohonName(data.requester?.full_name || data.remarks || '');
          setPemohonPosition(data.requester?.jawatan || '');

          setPenerimaName('');
          setPenerimaPosition('');
          setPenerimaDate(data.status === 'completed' || data.status === 'issued' ? formattedDate : '');
        }

        setPelulusName(data.approver?.full_name || 'Saidin Bin Bakar');
        setPelulusPosition(data.approver?.jawatan || 'Pembantu Awam H11');

        setDirekodName(data.issuer?.full_name || 'Saidin Bin Bakar');
        setDirekodPosition(data.issuer?.jawatan || 'Pembantu Awam H11');

        // Fetch users from the same hospital
        await fetchHospitalUsers(data.hospital_id);
        // Fetch genuine oxygen pricing configs from Supabase
        await fetchPricingConfigs(data.hospital_id);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load requisition details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPricingConfigs = async (hospitalId?: string) => {
    try {
      let query = supabase
        .from('pharmacy_oxygen_pricing_config')
        .select('*');

      if (hospitalId) {
        query = query.or(`hospital_id.eq.${hospitalId},hospital_id.is.null`);
      }

      const { data, error } = await query
        .order('effective_from', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setPricingConfigs(data);
      }
    } catch (err) {
      console.error('Error fetching oxygen pricing configs:', err);
    }
  };

  const extractMetaFromRemarks = (remarks?: string) => {
    if (!remarks) return { doRef: '', vehicle: '', driver: '', cleanRemarks: '' };
    const doMatch = remarks.match(/(?:DO\/Ref|DO|No\.?\s*DO|Rujukan)\s*:\s*([^|]+)/i);
    const vehicleMatch = remarks.match(/(?:No\.?\s*Kenderaan|Kenderaan|Vehicle)\s*:\s*([^|]+)/i);
    const driverMatch = remarks.match(/(?:Pembawa|Pemandu|Driver)\s*:\s*([^|]+)/i);

    let clean = remarks;
    if (doMatch) clean = clean.replace(doMatch[0], '');
    if (vehicleMatch) clean = clean.replace(vehicleMatch[0], '');
    if (driverMatch) clean = clean.replace(driverMatch[0], '');
    clean = clean.replace(/\|+/g, ' ').trim();

    return {
      doRef: doMatch ? doMatch[1].trim() : '',
      vehicle: vehicleMatch ? vehicleMatch[1].trim() : '',
      driver: driverMatch ? driverMatch[1].trim() : '',
      cleanRemarks: clean
    };
  };

  const fetchHospitalUsers = async (hospitalId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, jawatan')
        .eq('hospital_id', hospitalId)
        .order('full_name');
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) {
      console.error('Error fetching hospital users:', err);
    }
  };

  const getCanonicalSizeCode = (sizeCode: string, usageNotes?: string): string => {
    const raw = `${sizeCode || ''} ${usageNotes || ''}`.toUpperCase().trim();
    const code = (sizeCode || '').toUpperCase().trim();

    // 1. Explicit volume match or HS (6.4m3)
    if (code.includes('HS') || code.includes('6.4') || raw.includes('6.4M3')) return 'P101-HS';

    // 2. Size 1.4m3 / F (Pin Index or Bullnose!)
    if (
      code.includes('101-F') ||
      code.includes('P101-F') ||
      code.includes('-F') ||
      /(?:^|[_\-\s])F(?:[_\-\s]|$)/i.test(code) ||
      raw.includes('1.4M3') ||
      raw.includes('1.4')
    ) {
      return 'P101-F';
    }

    // 3. Size 0.7m3 / E
    if (
      code.includes('101-E') ||
      code.includes('P101-E') ||
      code.includes('-E') ||
      /(?:^|[_\-\s])E(?:[_\-\s]|$)/i.test(code) ||
      raw.includes('0.7M3') ||
      raw.includes('0.7')
    ) {
      return 'P101-E';
    }

    // 4. Size 0.5m3 / D
    if (
      code.includes('101-D') ||
      code.includes('P101-D') ||
      code.includes('-D') ||
      /(?:^|[_\-\s])D(?:[_\-\s]|$)/i.test(code) ||
      raw.includes('0.5M3') ||
      raw.includes('0.5')
    ) {
      return 'P101-D';
    }

    // 5. Large cylinder 8.0m3 / 7.3m3 / 101-N
    if (
      code.includes('101-N') ||
      code.includes('P101-N') ||
      code.includes('-N') ||
      code.includes('8.0') ||
      code.includes('7.3') ||
      raw.includes('8M3') ||
      raw.includes('7.3M3') ||
      code.includes('BN') ||
      code.includes('BULLNOSE')
    ) {
      return '101-N';
    }

    if (code.includes('F')) return 'P101-F';
    if (code.includes('E')) return 'P101-E';
    if (code.includes('D')) return 'P101-D';
    if (code.includes('N')) return '101-N';

    return '101-N';
  };

  const getCylinderPrice = (sizeCode: string, item?: any): number => {
    const canonical = getCanonicalSizeCode(sizeCode, item?.usage_notes);

    // Target supplier preference: prop supplierName -> 'BORNEO INDAH SDN BHD'
    const targetSupplier = (supplierName || 'BORNEO INDAH SDN BHD').trim().toLowerCase();

    if (pricingConfigs && pricingConfigs.length > 0) {
      // 1. Try matching target supplier first
      const targetSupplierConfigs = pricingConfigs.filter((c: any) => {
        const sup = String(c.supplier_name || '').trim().toLowerCase();
        if (targetSupplier.includes('borneo')) {
          return sup.includes('borneo');
        }
        return sup.includes(targetSupplier);
      });

      const matchTarget = targetSupplierConfigs.find((c: any) => {
        const cCode = (c.cylinder_size_code || '').toUpperCase().trim();
        return cCode === canonical || 
               cCode === canonical.replace(/^P/, '') || 
               `P${cCode}` === canonical ||
               (canonical === 'P101-F' && (cCode === '101-F' || cCode === 'P101-F')) ||
               (canonical === '101-N' && (cCode === '101-N' || cCode === 'P101-N'));
      });

      if (matchTarget && Number(matchTarget.refill_price) > 0) {
        return Number(matchTarget.refill_price);
      }

      // 2. Fallback: match any active config for the canonical size (sorted by most recent effective_from / created_at)
      const anyMatch = pricingConfigs.find((c: any) => {
        const cCode = (c.cylinder_size_code || '').toUpperCase().trim();
        return cCode === canonical || 
               cCode === canonical.replace(/^P/, '') || 
               `P${cCode}` === canonical ||
               (canonical === 'P101-F' && (cCode === '101-F' || cCode === 'P101-F')) ||
               (canonical === '101-N' && (cCode === '101-N' || cCode === 'P101-N'));
      });

      if (anyMatch && Number(anyMatch.refill_price) > 0) {
        return Number(anyMatch.refill_price);
      }
    }

    // 3. Fallback to active Borneo Indah standard contract refill prices
    switch (canonical) {
      case 'P101-F':
        return 118.00;
      case '101-N':
        return 250.00;
      case 'P101-HS':
        return 169.00;
      case 'P101-E':
        return 79.00;
      case 'P101-D':
        return 69.00;
      default:
        return 118.00;
    }
  };

  const getCylinderSizeLabel = (sizeCode: string, usageNotes?: string) => {
    const raw = `${sizeCode || ''} ${usageNotes || ''}`.toUpperCase().trim();
    const code = (sizeCode || '').toUpperCase().trim();

    // 1. Explicit volume match for 7.3m3 / 7.3m³
    if (code.includes('7.3') || raw.includes('7.3')) return '7.3m3';

    // 2. Parse volume pattern if specified (e.g. "6.4M3", "7.1M3", "1.4M3", "0.7M3", "0.5M3")
    const m3Match = raw.match(/(\d+(?:\.\d+)?)\s*(?:M3|M³)/i);
    if (m3Match && m3Match[1]) {
      return `${m3Match[1]}m3`;
    }

    const literMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:L|LITER|LITRE)/i);
    if (literMatch && literMatch[1]) {
      return `${literMatch[1]}L`;
    }

    // 3. Standard clinical codes
    if (code.includes('HS') || code.includes('6.4')) return '6.4m3';
    // 101-N Bullnose large cylinder in Supabase database is 8.0m3
    if (code.includes('101-N') || code.includes('8.0')) return '8.0m3';
    if (code.includes('-F') || /(?:^|[_\-\s])F(?:[_\-\s]|$)/i.test(code) || code.includes('1.4')) return '1.4m3';
    if (code.includes('-E') || /(?:^|[_\-\s])E(?:[_\-\s]|$)/i.test(code) || code.includes('0.7')) return '0.7m3';
    if (code.includes('-D') || /(?:^|[_\-\s])D(?:[_\-\s]|$)/i.test(code) || code.includes('0.5')) return '0.5m3';

    if (code.includes('F')) return '1.4m3';
    if (code.includes('E')) return '0.7m3';
    if (code.includes('D')) return '0.5m3';
    if (code.includes('N')) return '8.0m3';

    return '8.0m3';
  };

  const getCatatanContent = (item: any) => {
    // 1. Check real dispatched serials attached to the item
    let serials: string[] = item?.dispatched_serials ? [...item.dispatched_serials] : [];
    let extraNotes = item?.usage_notes || '';

    // 2. If not directly present on item, check usage_notes first (as it's item-specific)
    if (serials.length === 0 && extraNotes) {
      const match = extraNotes.match(/(?:serials?(?:\s*\(\d+\))?|siri)\s*:\s*([^|]+)/i);
      if (match && match[1]) {
        serials = match[1].split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean);
      }
    }
    
    // 3. Fallback to request.dispatched_movements ONLY if request has movements
    if (serials.length === 0 && request?.dispatched_movements && request.dispatched_movements.length > 0) {
      const matched = request.dispatched_movements.filter((m: any) => {
        if (m.remarks && m.remarks.includes(item.id)) return true;

        const cyl = m.cylinder || m;
        const cylSizeId = cyl?.cylinder_size_id || m.cylinder_size_id;
        const cylSizeCode = (cyl?.size_info?.code || cyl?.size_code || '').toUpperCase();
        const itemSizeClean = (item.size_code || '').toUpperCase();

        if (item.cylinder_size_id && cylSizeId === item.cylinder_size_id) return true;
        if (cylSizeCode && (
          cylSizeCode === itemSizeClean ||
          cylSizeCode.replace(/^P/, '') === itemSizeClean.replace(/^P/, '') ||
          (itemSizeClean.includes('101-F') && cylSizeCode.includes('101-F')) ||
          (itemSizeClean.includes('101-N') && cylSizeCode.includes('101-N'))
        )) return true;

        if ((request.items || []).length === 1) return true;
        return false;
      });

      serials = Array.from(new Set(matched.map((m: any) => {
        const cyl = m.cylinder || m;
        return cyl?.serial_number || cyl?.qr_code;
      }).filter(Boolean)));
    }

    // 4. Strict quantity cap: ensure 3 cylinders only shows 3 serials, 6 cylinders only shows 6 serials
    const targetQty = (request?.status === 'pending' || request?.status === 'rejected')
      ? item.quantity_requested
      : (item.quantity_issued || item.quantity_requested);

    if (targetQty && targetQty > 0 && serials.length > targetQty) {
      serials = serials.slice(0, targetQty);
    }

    // Clean extra notes so serials aren't duplicated as prose
    if (serials.length > 0 && extraNotes) {
      extraNotes = extraNotes.replace(/(?:serials?(?:\s*\(\d+\))?|siri)\s*:\s*[^|]+/i, '').replace(/^[|\s]+|[|\s]+$/g, '').trim();
    }

    return {
      serials,
      extraNotes
    };
  };

  const handlePrint = () => {
    if (!request) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the form.');
      return;
    }

    const logoUrl = window.location.origin + '/512px-Jata_MalaysiaV2.svg.png';
    const reqDateStr = new Date(request.request_date).toLocaleDateString('en-GB');
    const reqTimeStr = new Date(request.request_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const today = new Date();
    const todayDateStr = today.toLocaleDateString('en-GB');
    const todayTimeStr = today.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const meta = extractMetaFromRemarks(request.remarks);
    const isExternal = Boolean(request.is_external_facility);
    const showPrice = !isExternal;

    let rowsHtml = '';
    let grandTotal = 0;
    let renderedRowsCount = 0;

    if (request.items && request.items.length > 0) {
      request.items.forEach((item, index) => {
        const sizeLabel = getCylinderSizeLabel(item.size_code, item.usage_notes);
        const price = showPrice ? getCylinderPrice(item.size_code, item) : 0;
        const qtyIssued = request.status === 'pending' || request.status === 'rejected' ? item.quantity_requested : item.quantity_issued;
        const rowTotal = qtyIssued * price;
        if (showPrice) {
          grandTotal += rowTotal;
        }

        const { serials, extraNotes } = getCatatanContent(item);
        let catatanHtml = '';
        if (serials.length > 0) {
          catatanHtml = `
            <div style="font-size: 7.5px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">
              NO. SIRI (${serials.length} UNIT):
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 2.5px;">
              ${serials.map((s, sIdx) => `
                <span style="display: inline-block; background-color: #f1f5f9; border: 0.5px solid #94a3b8; border-radius: 2px; padding: 0.5px 3.5px; font-size: 7.5px; font-family: monospace; font-weight: bold; color: #0f172a;">
                  <span style="color: #64748b; font-size: 6.5px; margin-right: 1.5px;">#${sIdx + 1}</span>${s}
                </span>
              `).join('')}
            </div>
          `;
          if (extraNotes) {
            catatanHtml += `<div style="margin-top: 2px; font-size: 7.5px; color: #475569; font-style: italic; font-family: sans-serif;">${extraNotes}</div>`;
          }
        } else if (extraNotes) {
          catatanHtml = `<div style="font-family: sans-serif;">${extraNotes}</div>`;
        } else {
          catatanHtml = `-`;
        }

        const isOthers = item.size_code && !['101-N', '101-F', '101-F-BN', 'P101-F', 'P101-F-BN', '101-E', '101-D', '101-HS', 'P101-HS'].includes(item.size_code);

        rowsHtml += `
          <tr style="border-bottom: 1px solid black; text-align: center; font-size: 9px; min-height: 35px;">
            <td style="border-right: 1px solid black; padding: 4px;">${index + 1}</td>
            <td style="border-right: 1px solid black; padding: 4px; font-weight: bold; font-family: monospace;">
              ${item.size_code}
              ${isOthers ? '<br/><span style="font-size: 7px; color: #4338ca; font-family: sans-serif;">[Saiz Khas/Manual]</span>' : ''}
            </td>
            <td style="border-right: 1px solid black; padding: 4px;">${sizeLabel}</td>
            <td style="border-right: 1px solid black; padding: 4px; font-weight: bold;">
              ${item.size_code.includes('PI') || item.size_code.includes('101-E') || item.size_code.includes('101-D') || (item.size_code === '101-F' && !item.size_code.includes('BN')) || (item.size_code === 'P101-F' && !item.size_code.includes('BN')) ? 'PIN INDEX' : 'BULLNOSE'}
            </td>
            <td style="border-right: 1px solid black; padding: 4px;">silinder</td>
            <td style="border-right: 1px solid black; padding: 4px; font-weight: bold;">${item.quantity_requested}</td>
            <td style="border-right: 1px solid black; padding: 4px; font-weight: bold;">${qtyIssued}</td>
            <td style="border-right: 1px solid black; padding: 4px; font-weight: bold;">${qtyIssued}</td>
            <td style="border-right: 1px solid black; padding: 4px; font-weight: bold;">${showPrice && price > 0 ? price.toFixed(2) : ''}</td>
            <td style="padding: 4px; text-align: left; font-size: 8px; font-family: sans-serif; line-height: 1.2;">
              ${catatanHtml}
            </td>
          </tr>
        `;
        renderedRowsCount++;
      });
    }

    // Pad empty rows
    const targetRowCount = 6;
    while (renderedRowsCount < targetRowCount) {
      rowsHtml += `
        <tr style="border-bottom: 1px solid black; height: 32px;">
          <td style="border-right: 1px solid black;"></td>
          <td style="border-right: 1px solid black;"></td>
          <td style="border-right: 1px solid black;"></td>
          <td style="border-right: 1px solid black;"></td>
          <td style="border-right: 1px solid black;"></td>
          <td style="border-right: 1px solid black;"></td>
          <td style="border-right: 1px solid black;"></td>
          <td style="border-right: 1px solid black;"></td>
          <td style="border-right: 1px solid black;"></td>
          <td></td>
        </tr>
      `;
      renderedRowsCount++;
    }

    const isReturn = Boolean(
      request.is_external_facility && (
        request.external_operation === 'return' ||
        request.manual_requester_name?.toLowerCase().includes('return') ||
        request.manual_requester_name?.toLowerCase().includes('pulang') ||
        request.remarks?.toLowerCase().includes('pemulangan')
      )
    );
    const isInbound = !isReturn && request.is_external_facility && request.indent_direction === 'inbound';
    const docTitle = isReturn
      ? 'NOTA PEMULANGAN SILINDER ANTARA FASILITI <span style="font-size: 10px; font-weight: 600; text-decoration: none; font-style: italic; color: #7e22ce;">(INTER-FACILITY RETURN NOTE)</span>'
      : (isInbound
          ? 'NOTA PENERIMAAN BEKALAN OKSIGEN ANTARA FASILITI <span style="font-size: 10px; font-weight: 600; text-decoration: none; font-style: italic; color: #4338ca;">(INTER-FACILITY MEDICAL OXYGEN RECEIPT)</span>'
          : (request.is_external_facility
              ? 'BORANG PENGELUARAN / INDENT OKSIGEN ANTARA FASILITI <span style="font-size: 10px; font-weight: 600; text-decoration: none; font-style: italic; color: #4338ca;">(OUTBOUND INTER-FACILITY INDENT)</span>'
              : 'PERMOHONAN STOK OKSIGEN PERUBATAN <span style="font-size: 10px; font-weight: 500; text-decoration: none; font-style: italic;">(Medical Oxygen Requisition)</span>'));

    const docSubCode = isReturn
      ? 'NOTA PEMULANGAN BEKALAN SILINDER GAS (ANTARA FASILITI KKM)'
      : (isInbound
          ? 'KEW.PS-8 (PIN. 1/2026) / PENERIMAAN BEKALAN ANTARA FASILITI KKM'
          : 'KEW.PS-8 (PIN. 1/2026)');

    const fromLabel = isReturn ? 'DARI: FASILITI PENGHANTAR / PEMULANG' : (isInbound ? 'DARI: FASILITI PENGHANTAR / PEMBEKAL (SUPPLYING FACILITY)' : 'DARI: PEMESAN (REQUESTER)');
    const toLabel = isReturn ? 'KEPADA: FASILITI SASARAN / PENERIMA PULANG' : (isInbound ? 'KEPADA: FASILITI PENERIMA (RECEIVING FACILITY)' : 'KEPADA: PENGELUAR (SUPPLIER)');

    const fromName = isReturn
      ? 'UNIT FARMASI LOGISTIK / STOR GAS'
      : (isInbound
          ? (request.external_facility_name || 'HOSPITAL BEAUFORT').toUpperCase()
          : (request.department?.department_name || 'Emergency & Trauma').toUpperCase());
    const fromSub = isReturn ? 'HOSPITAL LAWAS, SARAWAK' : (isInbound ? 'KEMENTERIAN KESIHATAN MALAYSIA' : 'HOSPITAL LAWAS');

    const toName = isReturn
      ? (request.external_facility_name || 'HOSPITAL BEAUFORT').toUpperCase()
      : (isInbound
          ? (request.department?.department_name || 'UNIT FARMASI LOGISTIK').toUpperCase()
          : (request.is_external_facility ? (request.external_facility_name || 'HOSPITAL BEAUFORT').toUpperCase() : 'UNIT FARMASI / STOR GAS PERUBATAN'));
    const toSub = isReturn ? 'KEMENTERIAN KESIHATAN MALAYSIA' : (isInbound ? 'HOSPITAL LAWAS, SARAWAK' : (request.is_external_facility ? 'KEMENTERIAN KESIHATAN MALAYSIA' : 'HOSPITAL LAWAS'));

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isInbound ? 'Nota Penerimaan Oksigen' : 'Borang Kew.PS-8'} - ${request.request_number}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm;
            }
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              color: black; 
              font-size: 10px;
              line-height: 1.3;
            }
            .print-page {
              position: relative;
              width: 100%;
              box-sizing: border-box;
            }
            .watermark {
              background-image: url('${logoUrl}');
              background-repeat: no-repeat;
              background-position: center 40%;
              background-size: 25%;
              opacity: 0.05;
              position: absolute;
              inset: 0;
              pointer-events: none;
              height: 100%;
            }
            .text-center { text-align: center; }
            .mb-4 { margin-bottom: 12px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .border { border: 1px solid black; }
            .border-collapse { border-collapse: collapse; }
            .w-full { width: 100%; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .italic { font-style: italic; }
          </style>
        </head>
        <body>
          <div class="print-page">
            <div class="watermark"></div>

            <!-- Header Info -->
            <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
              <tr>
                <td style="width: 6%; vertical-align: top;">
                  <img src="${logoUrl}" alt="Jata Negara" style="width: 48px; height: auto;" onerror="this.style.display='none'" />
                </td>
                <td style="width: 52%; vertical-align: top; padding-left: 10px; font-family: 'Inter', Arial, sans-serif;">
                  <div style="font-size: 14px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;">HOSPITAL LAWAS</div>
                  <div style="font-size: 10px; font-weight: 600; color: #334155; text-transform: uppercase;">KEMENTERIAN KESIHATAN MALAYSIA</div>
                  <div style="font-size: 9.5px; font-weight: 500; color: #475569; line-height: 1.3;">Jalan Hospital, 98850 Lawas, Sarawak, Malaysia.</div>
                  <div style="font-size: 8.5px; font-weight: 500; color: #475569; margin-top: 2px;">
                    <strong style="color: #334155; font-weight: 700;">Telefon:</strong> 085-283781 &bull; <strong style="color: #334155; font-weight: 700;">Faks:</strong> 085-285993 &bull; <strong style="color: #334155; font-weight: 700;">Email:</strong> hosp_lawas@moh.gov.my
                  </div>
                </td>
                <td style="width: 42%; text-align: right; vertical-align: top;">
                  <div style="font-size: 8px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 4px; color: #333;">
                    ${isInbound ? 'SALINAN PENERIMA (RECEIVER COPY)' : 'SALINAN PEMESAN (REQUESTER)'}
                  </div>
                  <div style="display: inline-block; text-align: left;">
                    <table style="border: 1px solid black; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 8px; font-size: 11px; font-weight: 800; font-family: monospace; border-bottom: 1px solid black; text-align: center; background-color: #fafafa;">
                          ${request.request_number}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 6px; font-size: 8px; font-weight: 600; text-align: center; color: #444;">
                          ${reqDateStr} &nbsp;&nbsp; ${reqTimeStr}
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 8px; text-align: right; margin-top: 3px; font-weight: 600; color: #444;">PAGE 1 OF 1</div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Title -->
            <div style="margin-bottom: 12px; position: relative;">
              <div style="font-size: 12px; font-weight: 800; text-decoration: underline; letter-spacing: 0.3px;">
                ${docTitle}
              </div>
              <div style="font-size: 9px; font-weight: bold; margin-top: 3px; color: #333;">${docSubCode}</div>
            </div>

            <!-- Requester / Supplier Parties -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: ${meta.doRef || meta.vehicle || meta.driver ? '8px' : '15px'}; font-size: 9px;">
              <tr style="border-top: 1px solid black; border-bottom: 1px solid black; background-color: #fafafa;">
                <td style="width: 50%; padding: 6px; border-right: 1px solid black; vertical-align: top;">
                  <div style="font-weight: bold; color: #555; font-size: 8px; margin-bottom: 3px;">${fromLabel}</div>
                  <div style="font-size: 10px; font-weight: 800;">${fromName}</div>
                  <div style="font-size: 9px; color: #444; margin-top: 1px;">${fromSub}</div>
                </td>
                <td style="width: 50%; padding: 6px; vertical-align: top;">
                  <div style="font-weight: bold; color: #555; font-size: 8px; margin-bottom: 3px;">${toLabel}</div>
                  <div style="font-size: 10px; font-weight: 800;">${toName}</div>
                  <div style="font-size: 9px; color: #444; margin-top: 1px;">${toSub}</div>
                </td>
              </tr>
            </table>

            <!-- Delivery Metadata Banner (DO, Vehicle, Driver) -->
            ${meta.doRef || meta.vehicle || meta.driver ? `
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 8.5px; border: 1px solid black; background-color: #f8fafc;">
                <tr>
                  <td style="padding: 4px 8px; border-right: 1px solid black; width: 33%;">
                    <strong>NO. DO / RUJUKAN INDEN LUAR:</strong> <span style="font-family: monospace; font-weight: bold;">${meta.doRef || '-'}</span>
                  </td>
                  <td style="padding: 4px 8px; border-right: 1px solid black; width: 33%;">
                    <strong>NO. KENDERAAN PENGHANTAR:</strong> <span style="font-family: monospace; font-weight: bold;">${meta.vehicle || '-'}</span>
                  </td>
                  <td style="padding: 4px 8px; width: 34%;">
                    <strong>NAMA PEMBAWA / PEMANDU:</strong> <strong>${meta.driver || '-'}</strong>
                  </td>
                </tr>
              </table>
            ` : ''}

            <!-- Items Table -->
            <table class="w-full border-collapse" style="border: 1px solid black; margin-bottom: 15px;">
              <thead>
                <!-- Top Header Level -->
                <tr style="border-bottom: 1px solid black; background-color: #f3f4f6; text-align: center; font-size: 8px; font-weight: 800; height: 20px;">
                  <th colspan="6" style="border-right: 1px solid black; text-transform: uppercase; letter-spacing: 0.3px;">
                    ${isInbound ? 'DILENGKAPKAN OLEH FASILITI PENGHANTAR (PEMBEKAL)' : 'DILENGKAPKAN OLEH PEMESAN (REQUESTER)'}
                  </th>
                  <th colspan="4" style="text-transform: uppercase; letter-spacing: 0.3px;">
                    ${isInbound ? 'DILENGKAPKAN OLEH HOSPITAL LAWAS (PENERIMA)' : 'DILENGKAPKAN OLEH PENGELUAR (SUPPLIER)'}
                  </th>
                </tr>
                <!-- Sub Header Level -->
                <tr style="border-bottom: 1.5px solid black; background-color: #f9fafb; text-align: center; font-size: 8px; font-weight: bold; height: 22px;">
                  <th style="border-right: 1px solid black; width: 3%;">NO.</th>
                  <th style="border-right: 1px solid black; width: 8%;">KOD</th>
                  <th style="border-right: 1px solid black; width: 12%;">SAIZ SILINDER</th>
                  <th style="border-right: 1px solid black; width: 10%;">JENIS</th>
                  <th style="border-right: 1px solid black; width: 7%;">UOM</th>
                  <th style="border-right: 1px solid black; width: 11%;">
                    ${isInbound ? 'KUANTITI DIHANTAR' : 'KUANTITI DIMOHON'}
                  </th>
                  <th style="border-right: 1px solid black; width: 11%;">
                    ${isInbound ? 'KUANTITI DITERIMA' : 'KUANTITI DILULUSKAN'}
                  </th>
                  <th style="border-right: 1px solid black; width: 11%;">
                    ${isInbound ? 'KUANTITI DIPERAKUI' : 'KUANTITI DIKELUARKAN'}
                  </th>
                  <th style="border-right: 1px solid black; width: 9%;">HARGA (RM)</th>
                  <th style="width: 18%; text-align: left; padding-left: 6px;">CATATAN & NOMBOR SIRI</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <!-- Total Row -->
                <tr style="border-top: 1.5px solid black; height: 26px; font-weight: bold; text-align: center; background-color: #f3f4f6; font-size: 9px;">
                  <td colspan="8" style="border-right: 1px solid black; text-align: right; padding-right: 15px; letter-spacing: 0.5px;">JUMLAH KESELURUHAN (RM)</td>
                  <td style="border-right: 1px solid black; font-weight: 800; font-size: 10px;">${showPrice && grandTotal > 0 ? grandTotal.toFixed(2) : ''}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <!-- Signatures Section -->
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 8px; margin-bottom: 15px; table-layout: fixed;">
              <thead>
                <tr style="border-bottom: 1px solid black; background-color: #f3f4f6; text-align: center; font-weight: bold; height: 18px;">
                  <th colspan="2" style="border-right: 1px solid black; width: 50%;">
                    ${isInbound ? 'DILENGKAPKAN OLEH FASILITI PENGHANTAR / PEMBAWA' : 'DILENGKAPKAN OLEH PEMESAN (REQUESTER)'}
                  </th>
                  <th colspan="2" style="width: 50%;">
                    ${isInbound ? 'DILENGKAPKAN OLEH HOSPITAL LAWAS (PENERIMA)' : 'DILENGKAPKAN OLEH PENGELUAR (SUPPLIER)'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <!-- Pemohon Box -->
                  <td style="width: 25%; border-right: 1px solid black; padding: 8px; vertical-align: top; height: 110px;">
                    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                      <div>
                        <div style="font-weight: 800; text-decoration: underline; margin-bottom: 6px;">
                          ${isInbound ? '1. DIHANTAR / DISERAHKAN OLEH' : '1. PEMOHON'}
                        </div>
                        <table style="width: 100%; font-size: 8px; border-collapse: collapse;">
                          <tr><td style="width: 25%; padding: 2px 0;">NAMA:</td><td style="font-weight: bold; text-transform: uppercase;">${pemohonName || '-'}</td></tr>
                          <tr><td style="padding: 2px 0;">JAWATAN:</td><td>${pemohonPosition || '-'}</td></tr>
                          <tr><td style="padding: 2px 0;">AGENSI:</td><td>${isInbound ? (request.external_facility_name || 'Hospital Luar') : (request.department?.department_name || '-')}</td></tr>
                          <tr><td style="padding: 2px 0;">TARIKH:</td><td>${reqDateStr}</td></tr>
                        </table>
                      </div>
                      <div style="text-align: center; padding-top: 8px; margin-top: auto;">
                        <div style="border-bottom: 1px dotted black; width: 85%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 7.5px; color: #444; font-weight: bold;">TANDATANGAN & COP</div>
                      </div>
                    </div>
                  </td>

                  <!-- Penerima Box -->
                  <td style="width: 25%; border-right: 1px solid black; padding: 8px; vertical-align: top; height: 110px;">
                    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                      <div>
                        <div style="font-weight: 800; text-decoration: underline; margin-bottom: 6px;">
                          ${isInbound ? '2. DIPERIKSA & DITERIMA OLEH' : '2. PENERIMA'}
                        </div>
                        <table style="width: 100%; font-size: 8px; border-collapse: collapse;">
                          <tr><td style="width: 25%; padding: 2px 0;">NAMA:</td><td style="font-weight: bold; text-transform: uppercase;">${penerimaName || '-'}</td></tr>
                          <tr><td style="padding: 2px 0;">JAWATAN:</td><td>${penerimaPosition || '-'}</td></tr>
                          <tr><td style="padding: 2px 0;">UNIT:</td><td>Unit Farmasi Logistik</td></tr>
                          <tr><td style="padding: 2px 0;">TARIKH:</td><td>${penerimaDate || '-'}</td></tr>
                        </table>
                      </div>
                      <div style="text-align: center; padding-top: 8px; margin-top: auto;">
                        <div style="border-bottom: 1px dotted black; width: 85%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 7.5px; color: #444; font-weight: bold;">TANDATANGAN & COP</div>
                      </div>
                    </div>
                  </td>

                  <!-- Pelulus Box -->
                  <td style="width: 25%; border-right: 1px solid black; padding: 8px; vertical-align: top; height: 110px;">
                    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                      <div>
                        <div style="font-weight: 800; text-decoration: underline; margin-bottom: 6px;">
                          ${isInbound ? '3. PENGESAHAN KETUA LOGISTIK' : '3. PELULUS'}
                        </div>
                        <table style="width: 100%; font-size: 8px; border-collapse: collapse;">
                          <tr><td style="width: 25%; padding: 2px 0;">NAMA:</td><td style="font-weight: bold; text-transform: uppercase;">${pelulusName || '-'}</td></tr>
                          <tr><td style="padding: 2px 0;">JAWATAN:</td><td>${pelulusPosition || '-'}</td></tr>
                          <tr><td style="padding: 2px 0;">UNIT:</td><td>Farmasi Logistik</td></tr>
                          <tr><td style="padding: 2px 0;">TARIKH:</td><td>${request.approved_date ? new Date(request.approved_date).toLocaleDateString('en-GB') : reqDateStr}</td></tr>
                        </table>
                      </div>
                      <div style="text-align: center; padding-top: 8px; margin-top: auto;">
                        <div style="border-bottom: 1px dotted black; width: 85%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 7.5px; color: #444; font-weight: bold;">TANDATANGAN & COP</div>
                      </div>
                    </div>
                  </td>

                  <!-- Direkod Oleh Box -->
                  <td style="width: 25%; padding: 8px; vertical-align: top; height: 110px;">
                    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                      <div>
                        <div style="font-weight: 800; text-decoration: underline; margin-bottom: 6px;">
                          ${isInbound ? '4. KEMASKINI STOK KEW.PS-4' : '4. DIREKOD OLEH'}
                        </div>
                        <table style="width: 100%; font-size: 8px; border-collapse: collapse;">
                          <tr><td style="width: 25%; padding: 2px 0;">NAMA:</td><td style="font-weight: bold; text-transform: uppercase;">${direkodName || '-'}</td></tr>
                          <tr><td style="padding: 2px 0;">JAWATAN:</td><td>${direkodPosition || '-'}</td></tr>
                          <tr><td style="padding: 2px 0;">UNIT:</td><td>Farmasi Logistik</td></tr>
                          <tr><td style="padding: 2px 0;">TARIKH:</td><td>${request.issued_date ? new Date(request.issued_date).toLocaleDateString('en-GB') : reqDateStr}</td></tr>
                        </table>
                      </div>
                      <div style="text-align: center; padding-top: 8px; margin-top: auto;">
                        <div style="border-bottom: 1px dotted black; width: 85%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 7.5px; color: #444; font-weight: bold;">TANDATANGAN & COP</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Document Footer -->
            <table style="width: 100%; border-collapse: collapse; font-size: 7.5px; color: #555; margin-top: 15px;">
              <tr>
                <td style="width: 50%;">
                  <div style="font-weight: bold;">PRINTED BY: ${direkodName || 'AMRI AMIT'}</div>
                  <div style="margin-top: 2px;">DATE: ${todayDateStr} TIME: ${todayTimeStr}</div>
                </td>
                <td style="width: 50%; text-align: right; vertical-align: bottom; font-weight: bold; text-transform: uppercase;">
                  THIS DOCUMENT GENERATED BY HOSPITAL OPERATION AND MANAGEMENT ECOSYSTEM (HOME)
                </td>
              </tr>
            </table>

          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const reqDateStr = request ? new Date(request.request_date).toLocaleDateString('en-GB') : '';
  const reqTimeStr = request ? new Date(request.request_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
  
  const isExternal = Boolean(request?.is_external_facility);
  const showPrice = !isExternal;

  let grandTotal = 0;
  if (showPrice && request && request.items) {
    request.items.forEach((item) => {
      const price = getCylinderPrice(item.size_code, item);
      const qtyIssued = request.status === 'pending' || request.status === 'rejected' ? item.quantity_requested : item.quantity_issued;
      grandTotal += qtyIssued * price;
    });
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideInFromRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .watermark-bg {
          position: absolute;
          inset: 0;
          background-image: url('/512px-Jata_MalaysiaV2.svg.png');
          background-repeat: no-repeat;
          background-position: center 35%;
          background-size: 35%;
          opacity: 0.03;
          pointer-events: none;
        }
      `}</style>
      <div 
        className="bg-white w-full max-w-5xl h-full rounded-l-3xl shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-md font-bold text-slate-800">
              Borang Kew.PS-8 Requisition Preview ({request?.request_number})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-[transform,opacity,box-shadow,border-color] focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-auto p-8 bg-slate-100 flex justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-slate-500 text-sm">Memuatkan dokumen...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl">
              {error}
            </div>
          ) : request ? (
            /* Document Preview Sheet */
            <div className="bg-white w-[297mm] min-h-[210mm] p-[10mm] border border-slate-300 shadow-xl text-black text-[10px] relative flex flex-col justify-between overflow-hidden">
              <div className="watermark-bg" />
              
              <div className="relative z-10">
                {/* Header Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img src="/512px-Jata_MalaysiaV2.svg.png" alt="Jata Malaysia" className="w-12 h-auto" />
                    <div>
                      <h4 className="text-sm font-extrabold tracking-wide m-0">HOSPITAL LAWAS</h4>
                      <h5 className="text-[9px] font-bold text-slate-700 m-0 uppercase mt-0.5">KEMENTERIAN KESIHATAN MALAYSIA</h5>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-bold text-slate-600 mb-1">SALINAN PEMESAN (REQUESTER)</div>
                    <div className="inline-block border border-black text-left">
                      <div className="px-3 py-1 font-mono font-bold text-xs bg-slate-50 border-b border-black text-center">
                        {request.request_number}
                      </div>
                      <div className="px-2 py-0.5 text-[8px] text-slate-600 font-semibold text-center">
                        {reqDateStr} &nbsp;&nbsp; {reqTimeStr}
                      </div>
                    </div>
                    <div className="text-[8px] text-slate-500 mt-1 font-bold">PAGE 1 OF 1</div>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <h3 className="text-[12px] font-extrabold m-0 text-slate-900 border-b-2 border-slate-900 pb-0.5 inline-block">
                    {request.is_external_facility && request.indent_direction === 'inbound'
                      ? 'NOTA PENERIMAAN BEKALAN OKSIGEN ANTARA FASILITI'
                      : (request.is_external_facility
                          ? 'BORANG PENGELUARAN / INDENT OKSIGEN ANTARA FASILITI'
                          : 'PERMOHONAN STOK OKSIGEN PERUBATAN')}
                    {request.is_external_facility && (
                      <span className="text-indigo-600 font-bold ml-1">
                        ({request.indent_direction === 'inbound' ? 'INTER-FACILITY OXYGEN RECEIPT' : 'INDENT FASILITI LUAR'})
                      </span>
                    )}
                    <span className="font-normal italic text-[10px] text-slate-500 ml-1">
                      {request.is_external_facility && request.indent_direction === 'inbound' ? '' : '(Medical Oxygen Requisition)'}
                    </span>
                  </h3>
                  <div className="text-[8px] font-bold text-slate-600 mt-1">
                    {request.is_external_facility && request.indent_direction === 'inbound'
                      ? 'KEW.PS-8 (PIN. 1/2026) / PENERIMAAN BEKALAN ANTARA FASILITI KKM'
                      : 'KEW.PS-8 (PIN. 1/2026)'}
                  </div>
                </div>

                {/* Parties details */}
                <div className="grid grid-cols-2 border border-black divide-x divide-black mb-3 bg-slate-50/50">
                  <div className="p-2.5">
                    <span className="text-[7.5px] font-bold text-slate-500 uppercase">
                      {request.is_external_facility && request.indent_direction === 'inbound'
                        ? 'Dari: Fasiliti Penghantar / Pembekal (Supplying Facility)'
                        : 'Dari: Pemesan (Requester)'}
                    </span>
                    <div className="font-extrabold text-slate-950 text-xs mt-0.5">
                      {request.is_external_facility
                        ? (request.indent_direction === 'inbound'
                            ? (request.external_facility_name || 'HOSPITAL BEAUFORT').toUpperCase()
                            : (request.department?.department_name || 'UNIT FARMASI LOGISTIK').toUpperCase())
                        : (request.department?.department_name || 'Emergency & Trauma').toUpperCase()}
                    </div>
                    <div className="text-slate-600 text-[9px] mt-0.5">
                      {request.is_external_facility && request.indent_direction === 'inbound'
                        ? 'KEMENTERIAN KESIHATAN MALAYSIA'
                        : 'HOSPITAL LAWAS'}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[7.5px] font-bold text-slate-500 uppercase">
                      {request.is_external_facility && request.indent_direction === 'inbound'
                        ? 'Kepada: Fasiliti Penerima (Receiving Facility)'
                        : 'Kepada: Pengeluar (Supplier)'}
                    </span>
                    <div className="font-extrabold text-slate-950 text-xs mt-0.5">
                      {request.is_external_facility
                        ? (request.indent_direction === 'inbound'
                            ? (request.department?.department_name || 'UNIT FARMASI LOGISTIK').toUpperCase()
                            : (request.external_facility_name || 'HOSPITAL BEAUFORT').toUpperCase())
                        : 'UNIT FARMASI / STOR GAS PERUBATAN'}
                    </div>
                    <div className="text-slate-600 text-[9px] mt-0.5">
                      {request.is_external_facility && request.indent_direction === 'inbound'
                        ? 'HOSPITAL LAWAS, SARAWAK'
                        : (request.is_external_facility ? 'KEMENTERIAN KESIHATAN MALAYSIA' : 'HOSPITAL LAWAS')}
                    </div>
                  </div>
                </div>

                {/* Delivery Metadata Card if available */}
                {(() => {
                  const meta = extractMetaFromRemarks(request.remarks);
                  if (!meta.doRef && !meta.vehicle && !meta.driver) return null;
                  return (
                    <div className="grid grid-cols-3 border border-black divide-x divide-black mb-3 bg-slate-100/70 text-[8.5px]">
                      <div className="p-1.5 px-2.5">
                        <strong className="text-slate-600">NO. DO / REF:</strong> <span className="font-mono font-bold text-slate-900 ml-1">{meta.doRef || '-'}</span>
                      </div>
                      <div className="p-1.5 px-2.5">
                        <strong className="text-slate-600">NO. KENDERAAN:</strong> <span className="font-mono font-bold text-slate-900 ml-1">{meta.vehicle || '-'}</span>
                      </div>
                      <div className="p-1.5 px-2.5">
                        <strong className="text-slate-600">PEMBAWA / PEMANDU:</strong> <span className="font-bold text-slate-900 ml-1">{meta.driver || '-'}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Table */}
                <table className="w-full border-collapse border border-black mb-4 text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black text-[8px] font-bold text-center text-slate-700">
                      <th colSpan={6} className="border-r border-black py-1">
                        {request.is_external_facility && request.indent_direction === 'inbound'
                          ? 'DILENGKAPKAN OLEH FASILITI PENGHANTAR (PEMBEKAL)'
                          : 'DILENGKAPKAN OLEH PEMESAN (REQUESTER)'}
                      </th>
                      <th colSpan={4} className="py-1">
                        {request.is_external_facility && request.indent_direction === 'inbound'
                          ? 'DILENGKAPKAN OLEH HOSPITAL LAWAS (PENERIMA)'
                          : 'DILENGKAPKAN OLEH PENGELUAR (SUPPLIER)'}
                      </th>
                    </tr>
                    <tr className="bg-slate-50 border-b border-black text-[8px] font-bold text-center text-slate-600">
                      <th className="border-r border-black p-1.5 w-8">NO.</th>
                      <th className="border-r border-black p-1.5 w-16">KOD</th>
                      <th className="border-r border-black p-1.5 w-24">SAIZ SILINDER</th>
                      <th className="border-r border-black p-1.5 w-20">JENIS</th>
                      <th className="border-r border-black p-1.5 w-14">UOM</th>
                      <th className="border-r border-black p-1.5 w-24">
                        {request.is_external_facility && request.indent_direction === 'inbound' ? 'KUANTITI DIHANTAR' : 'KUANTITI DIMOHON'}
                      </th>
                      <th className="border-r border-black p-1.5 w-24">
                        {request.is_external_facility && request.indent_direction === 'inbound' ? 'KUANTITI DITERIMA' : 'KUANTITI DILULUSKAN'}
                      </th>
                      <th className="border-r border-black p-1.5 w-24">
                        {request.is_external_facility && request.indent_direction === 'inbound' ? 'KUANTITI DIPERAKUI' : 'KUANTITI DIKELUARKAN'}
                      </th>
                      <th className="border-r border-black p-1.5 w-20">HARGA (RM)</th>
                      <th className="p-1.5">CATATAN & SENARAI NOMBOR SIRI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(request.items || []).map((itm, idx) => {
                      const sizeLabel = getCylinderSizeLabel(itm.size_code, itm.usage_notes);
                      const price = showPrice ? getCylinderPrice(itm.size_code, itm) : 0;
                      const qtyIssued = request.status === 'pending' || request.status === 'rejected' ? itm.quantity_requested : itm.quantity_issued;
                      const { serials, extraNotes } = getCatatanContent(itm);
                      const isOthers = itm.size_code && !['101-N', '101-F', '101-F-BN', 'P101-F', 'P101-F-BN', '101-E', '101-D', '101-HS', 'P101-HS'].includes(itm.size_code);

                      return (
                        <tr key={itm.id} className="border-b border-black text-center text-[9px] hover:bg-slate-50/20">
                          <td className="border-r border-black p-2">{idx + 1}</td>
                          <td className="border-r border-black p-2 font-mono font-bold text-slate-800">
                            {itm.size_code}
                            {isOthers && (
                              <div className="text-[7px] text-indigo-600 font-sans font-normal">[Saiz Khas]</div>
                            )}
                          </td>
                          <td className="border-r border-black p-2">{sizeLabel}</td>
                          <td className="border-r border-black p-2 font-semibold text-slate-600">
                            {itm.size_code.includes('PI') || itm.size_code.includes('101-E') || itm.size_code.includes('101-D') || (itm.size_code === '101-F' && !itm.size_code.includes('BN')) || (itm.size_code === 'P101-F' && !itm.size_code.includes('BN')) ? 'PIN INDEX' : 'BULLNOSE'}
                          </td>
                          <td className="border-r border-black p-2 text-slate-500">silinder</td>
                          <td className="border-r border-black p-2 font-bold">{itm.quantity_requested}</td>
                          <td className="border-r border-black p-2 font-bold">{qtyIssued}</td>
                          <td className="border-r border-black p-2 font-bold">{qtyIssued}</td>
                          <td className="border-r border-black p-2 font-bold text-slate-700">{showPrice && price > 0 ? price.toFixed(2) : ''}</td>
                          <td className="p-2 text-left text-[8px] leading-relaxed">
                            {serials.length > 0 ? (
                              <div className="space-y-1">
                                <div className="text-[7.5px] font-extrabold text-slate-800 uppercase tracking-wider">
                                  No. Siri ({serials.length} Unit):
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {serials.map((s, sIdx) => (
                                    <span key={sIdx} className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-[7.5px] text-slate-900">
                                      <span className="text-slate-400 text-[6.5px] mr-1">#{sIdx + 1}</span>{s}
                                    </span>
                                  ))}
                                </div>
                                {extraNotes && (
                                  <div className="text-[7.5px] text-slate-500 italic mt-0.5 font-sans">{extraNotes}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 font-sans">{extraNotes || '-'}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Empty spacer rows */}
                    {Array.from({ length: Math.max(0, 5 - (request.items?.length || 0)) }).map((_, idx) => (
                      <tr key={idx} className="border-b border-black h-8">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td></td>
                      </tr>
                    ))}
                    {/* Grand Totals */}
                    <tr className="font-bold text-center bg-slate-100 border-t border-black text-[9px]">
                      <td colSpan={8} className="border-r border-black text-right pr-6 p-2 uppercase tracking-wide">
                        JUMLAH KESELURUHAN (RM)
                      </td>
                      <td className="border-r border-black p-2 text-sm text-slate-900 font-extrabold">
                        {showPrice && grandTotal > 0 ? grandTotal.toFixed(2) : ''}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <table className="w-full border-collapse border border-black text-[8px] table-layout-fixed mb-4">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 text-center font-bold h-[18px]">
                      <th colSpan={2} className="border-r border-black w-1/2">
                        {request.is_external_facility && request.indent_direction === 'inbound'
                          ? 'DILENGKAPKAN OLEH FASILITI PENGHANTAR / PEMBAWA'
                          : 'DILENGKAPKAN OLEH PEMESAN (REQUESTER)'}
                      </th>
                      <th colSpan={2} className="w-1/2">
                        {request.is_external_facility && request.indent_direction === 'inbound'
                          ? 'DILENGKAPKAN OLEH HOSPITAL LAWAS (PENERIMA)'
                          : 'DILENGKAPKAN OLEH PENGELUAR (SUPPLIER)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {/* Pemohon / Penghantar */}
                      <td className="w-1/4 border-r border-black p-2.5 vertical-align-top h-[120px]">
                        <div className="flex flex-col justify-between h-full">
                          <div>
                            <div className="font-extrabold text-slate-800 underline uppercase mb-1.5">
                              {request.is_external_facility && request.indent_direction === 'inbound'
                                ? '1. Dihantar & Diserahkan Oleh'
                                : '1. Pemohon'}
                            </div>
                            <div className="space-y-1 text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">NAMA:</span>
                                <select 
                                  value={pemohonName}
                                  onChange={(e) => {
                                    setPemohonName(e.target.value);
                                    const match = users.find(u => u.full_name === e.target.value);
                                    if (match?.jawatan) setPemohonPosition(match.jawatan);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] font-bold text-slate-900 focus:outline-none"
                                >
                                  <option value="">Manual Entry...</option>
                                  {users.map(u => (
                                    <option key={u.id} value={u.full_name}>{u.full_name}</option>
                                  ))}
                                </select>
                              </div>
                              {(!pemohonName || !users.some(u => u.full_name === pemohonName)) && (
                                <div className="flex items-center gap-1 pl-13">
                                  <input 
                                    type="text" 
                                    placeholder="Taip nama manual..."
                                    value={pemohonName} 
                                    onChange={(e) => setPemohonName(e.target.value.toUpperCase())}
                                    className="w-full bg-white border border-slate-300 rounded px-1 py-0.5 text-[8px] uppercase focus:outline-none"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">JAWATAN:</span>
                                <input 
                                  type="text" 
                                  value={pemohonPosition} 
                                  onChange={(e) => setPemohonPosition(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] focus:outline-none"
                                />
                              </div>
                              <div>
                                {request.is_external_facility && request.indent_direction === 'inbound' ? 'AGENSI:' : 'JABATAN:'}{' '}
                                <span className="font-semibold">
                                  {request.is_external_facility && request.indent_direction === 'inbound'
                                    ? (request.external_facility_name || 'Hospital Luar')
                                    : (request.department?.department_name || '-')}
                                </span>
                              </div>
                              <div>TARIKH: <span>{reqDateStr}</span></div>
                            </div>
                          </div>
                          <div className="text-center pt-2">
                            <div className="border-b border-dotted border-black w-4/5 mx-auto mb-1"></div>
                            <span className="font-bold text-slate-500">TANDATANGAN & COP</span>
                          </div>
                        </div>
                      </td>

                      {/* Penerima */}
                      <td className="w-1/4 border-r border-black p-2.5 vertical-align-top h-[120px]">
                        <div className="flex flex-col justify-between h-full">
                          <div>
                            <div className="font-extrabold text-slate-800 underline uppercase mb-1.5">
                              {request.is_external_facility && request.indent_direction === 'inbound'
                                ? '2. Diperiksa & Diterima Oleh'
                                : '2. Penerima'}
                            </div>
                            <div className="space-y-1 text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">NAMA:</span>
                                <select 
                                  value={penerimaName}
                                  onChange={(e) => {
                                    setPenerimaName(e.target.value);
                                    const match = users.find(u => u.full_name === e.target.value);
                                    if (match?.jawatan) setPenerimaPosition(match.jawatan);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] font-bold text-slate-900 focus:outline-none"
                                >
                                  <option value="">Manual Entry...</option>
                                  {users.map(u => (
                                    <option key={u.id} value={u.full_name}>{u.full_name}</option>
                                  ))}
                                </select>
                              </div>
                              {(!penerimaName || !users.some(u => u.full_name === penerimaName)) && (
                                <div className="flex items-center gap-1 pl-13">
                                  <input 
                                    type="text" 
                                    placeholder="Taip nama manual..."
                                    value={penerimaName} 
                                    onChange={(e) => setPenerimaName(e.target.value.toUpperCase())}
                                    className="w-full bg-white border border-slate-300 rounded px-1 py-0.5 text-[8px] uppercase focus:outline-none"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">JAWATAN:</span>
                                <input 
                                  type="text" 
                                  value={penerimaPosition} 
                                  onChange={(e) => setPenerimaPosition(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] focus:outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">TARIKH:</span>
                                <input 
                                  type="text" 
                                  value={penerimaDate} 
                                  onChange={(e) => setPenerimaDate(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] focus:outline-none font-sans"
                                  placeholder="Tarikh penerimaan..."
                                />
                              </div>
                              <div className="italic text-slate-400 text-[7.5px] mt-1">
                                {request.is_external_facility && request.indent_direction === 'inbound'
                                  ? '(Unit Farmasi Logistik Hospital Lawas)'
                                  : '(Lengkapkan setelah stok diterima)'}
                              </div>
                            </div>
                          </div>
                          <div className="text-center pt-2">
                            <div className="border-b border-dotted border-black w-4/5 mx-auto mb-1"></div>
                            <span className="font-bold text-slate-500">TANDATANGAN & COP</span>
                          </div>
                        </div>
                      </td>

                      {/* Pelulus / Ketua Logistik */}
                      <td className="w-1/4 border-r border-black p-2.5 vertical-align-top h-[120px]">
                        <div className="flex flex-col justify-between h-full">
                          <div>
                            <div className="font-extrabold text-slate-800 underline uppercase mb-1.5">
                              {request.is_external_facility && request.indent_direction === 'inbound'
                                ? '3. Pengesahan Ketua Logistik'
                                : '3. Pelulus'}
                            </div>
                            <div className="space-y-1 text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">NAMA:</span>
                                <select 
                                  value={pelulusName}
                                  onChange={(e) => {
                                    setPelulusName(e.target.value);
                                    const match = users.find(u => u.full_name === e.target.value);
                                    if (match?.jawatan) setPelulusPosition(match.jawatan);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] font-bold text-slate-900 focus:outline-none"
                                >
                                  <option value="">Manual Entry...</option>
                                  {users.map(u => (
                                    <option key={u.id} value={u.full_name}>{u.full_name}</option>
                                  ))}
                                </select>
                              </div>
                              {(!pelulusName || !users.some(u => u.full_name === pelulusName)) && (
                                <div className="flex items-center gap-1 pl-13">
                                  <input 
                                    type="text" 
                                    placeholder="Taip nama manual..."
                                    value={pelulusName} 
                                    onChange={(e) => setPelulusName(e.target.value.toUpperCase())}
                                    className="w-full bg-white border border-slate-300 rounded px-1 py-0.5 text-[8px] uppercase focus:outline-none"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">JAWATAN:</span>
                                <input 
                                  type="text" 
                                  value={pelulusPosition} 
                                  onChange={(e) => setPelulusPosition(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] focus:outline-none"
                                />
                              </div>
                              <div>UNIT: <span className="font-semibold">Farmasi Logistik</span></div>
                              <div>TARIKH: <span>{request.approved_date ? new Date(request.approved_date).toLocaleDateString('en-GB') : reqDateStr}</span></div>
                            </div>
                          </div>
                          <div className="text-center pt-2">
                            <div className="border-b border-dotted border-black w-4/5 mx-auto mb-1"></div>
                            <span className="font-bold text-slate-500">TANDATANGAN & COP</span>
                          </div>
                        </div>
                      </td>

                      {/* Direkod Oleh */}
                      <td className="w-1/4 p-2.5 vertical-align-top h-[120px]">
                        <div className="flex flex-col justify-between h-full">
                          <div>
                            <div className="font-extrabold text-slate-800 underline uppercase mb-1.5">
                              {request.is_external_facility && request.indent_direction === 'inbound'
                                ? '4. Kemaskini Stok KEW.PS-4'
                                : '4. Direkod Oleh'}
                            </div>
                            <div className="space-y-1 text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">NAMA:</span>
                                <select 
                                  value={direkodName}
                                  onChange={(e) => {
                                    setDirekodName(e.target.value);
                                    const match = users.find(u => u.full_name === e.target.value);
                                    if (match?.jawatan) setDirekodPosition(match.jawatan);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] font-bold text-slate-900 focus:outline-none"
                                >
                                  <option value="">Manual Entry...</option>
                                  {users.map(u => (
                                    <option key={u.id} value={u.full_name}>{u.full_name}</option>
                                  ))}
                                </select>
                              </div>
                              {(!direkodName || !users.some(u => u.full_name === direkodName)) && (
                                <div className="flex items-center gap-1 pl-13">
                                  <input 
                                    type="text" 
                                    placeholder="Taip nama manual..."
                                    value={direkodName} 
                                    onChange={(e) => setDirekodName(e.target.value.toUpperCase())}
                                    className="w-full bg-white border border-slate-300 rounded px-1 py-0.5 text-[8px] uppercase focus:outline-none"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="w-12 shrink-0">JAWATAN:</span>
                                <input 
                                  type="text" 
                                  value={direkodPosition} 
                                  onChange={(e) => setDirekodPosition(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[8px] focus:outline-none"
                                />
                              </div>
                              <div>UNIT: <span className="font-semibold">Farmasi Logistik</span></div>
                              <div>TARIKH: <span>{request.issued_date ? new Date(request.issued_date).toLocaleDateString('en-GB') : reqDateStr}</span></div>
                            </div>
                          </div>
                          <div className="text-center pt-2">
                            <div className="border-b border-dotted border-black w-4/5 mx-auto mb-1"></div>
                            <span className="font-bold text-slate-500">TANDATANGAN & COP</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer details */}
              <div className="flex justify-between items-end text-[7.5px] text-slate-500 mt-6 border-t pt-3 relative z-10">
                <div>
                  <div className="font-bold">PRINTED BY: {direkodName || 'AMRI AMIT'}</div>
                  <div className="mt-0.5">DATE: {new Date().toLocaleDateString('en-GB')} TIME: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="font-bold uppercase tracking-wider">
                  THIS DOCUMENT GENERATED BY HOSPITAL OPERATION AND MANAGEMENT ECOSYSTEM (HOME)
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-[transform,opacity,box-shadow,border-color] focus:outline-none"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            disabled={!request}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:bg-blue-400 disabled:cursor-not-allowed transition-[transform,opacity,box-shadow,border-color] focus:outline-none"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen
          </button>
        </div>

      </div>
    </div>
  );
};
