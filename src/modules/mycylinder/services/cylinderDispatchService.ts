// @ts-nocheck
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import type { ApiResponse } from '@/types';
import type {
  CylinderDispatchRequest,
  CylinderDispatchRequestWithRelations,
  CylinderDispatchKPI
} from '@/types/pharmacy';
import { isCylinderAuthorizedOfficer } from '@/shared/utils/cylinderRbac';

export const ALLOWED_OXYGEN_CLINICAL_DEPARTMENTS = [
  { name: 'Emergency and trauma', code: 'ETD' },
  { name: 'General ward', code: 'GW' },
  { name: 'Paediatric ward', code: 'PAED' },
  { name: 'Maternity ward', code: 'MAT' },
  { name: 'Operation Theater', code: 'OT' },
  { name: 'Radiology and radiography', code: 'RAD' },
  { name: 'Nephrology', code: 'NEPH' },
];

/**
 * 7 Official hospital clinical departments/wards authorized for medical oxygen cylinder indents:
 * 1. General ward
 * 2. Paediatric ward
 * 3. Maternity Ward
 * 4. Emergency and Trauma
 * 5. Radiology and Radiography
 * 6. Nephrology
 * 7. Operation Theater
 */
export const ALLOWED_CYLINDER_DEPARTMENTS = [
  { key: 'general_ward', name: 'General Ward', match: (n: string, c: string) => (n.includes('general') && n.includes('ward')) || c === 'GENERAL_WARD' },
  { key: 'paediatric_ward', name: 'Paediatric Ward', match: (n: string, c: string) => n.includes('paediatric') || n.includes('pediatric') || c === 'PAEDIATRIC_WARD' },
  { key: 'maternity_ward', name: 'Maternity Ward', match: (n: string, c: string) => n.includes('maternity') || c === 'MATERNITY_WARD' },
  { key: 'emergency_trauma', name: 'Emergency and Trauma', match: (n: string, c: string) => (n.includes('emergency') && !n.includes('pharmacy')) || n.includes('trauma') || c === 'EMERGENCY_TRAUMA' },
  { key: 'radiology', name: 'Radiology and Radiography', match: (n: string, c: string) => n.includes('radiolog') || c === 'RADIOLOGY' },
  { key: 'nephrology', name: 'Nephrology', match: (n: string, c: string) => n.includes('nephrolog') || c === 'NEPHROLOGY' },
  { key: 'operation_theater', name: 'Operation Theater', match: (n: string, c: string) => n.includes('operation') || n.includes('theater') || n.includes('theatre') || c === 'OPERATION_THEATER' },
];

export async function getClinicalDepartments(hospitalId: string): Promise<{ id: string; department_name: string; department_code: string }[]> {
  try {
    if (!isSupabaseConfigured() || !hospitalId) {
      return [];
    }

    const { data: existing, error } = await supabase
      .from('departments')
      .select('id, department_name, department_code')
      .eq('hospital_id', hospitalId)
      .order('department_name');

    if (error) throw error;

    const result: { id: string; department_name: string; department_code: string }[] = [];

    for (const def of ALLOWED_CYLINDER_DEPARTMENTS) {
      const found = (existing || []).find(d => {
        const n = (d.department_name || '').toLowerCase().trim();
        const c = (d.department_code || '').toUpperCase().trim();
        return def.match(n, c);
      });

      if (found) {
        result.push({
          id: found.id,
          department_name: def.name,
          department_code: found.department_code || def.key.toUpperCase()
        });
      }
    }

    return result;
  } catch (err) {
    console.warn('Error getting clinical departments:', err);
    return [];
  }
}

/**
 * Helper to flexibly resolve cylinder_size_id from database sizes list
 */
function resolveCylinderSizeId(sizeCode: string, sizes: any[]): string {
  if (!sizes || sizes.length === 0) return '332911a0-9e8c-4c0e-980a-9df3d0197dce';

  const clean = (sizeCode || '').toUpperCase().trim();

  // 1. Direct match (e.g. 101-N, 101-F, P101-F, P101-D, P101-E, P101-HS)
  let found = sizes.find((s) => s.code?.toUpperCase() === clean);
  if (found) return found.id;

  // 2. Variants of P101-F (Bull Nose / Pin Index)
  if (clean.includes('P101-F') || clean.includes('101-F-BN')) {
    found = sizes.find((s) => s.code?.toUpperCase() === 'P101-F');
    if (found) return found.id;
  }

  // 3. Match 101-F loan cylinder
  if (clean === '101-F' || clean === '101-F-PI') {
    found = sizes.find((s) => s.code?.toUpperCase() === '101-F');
    if (found) return found.id;
  }

  // 4. Match 101-N Bull Nose (8.0m³) and similar large cylinders (7.3m³, 7m³, etc.)
  if (clean.includes('101-N') || clean.includes('8.0') || clean.includes('8M3') || clean.includes('7.3') || clean.includes('7M3') || clean.includes('7.0')) {
    found = sizes.find((s) => s.code?.toUpperCase() === '101-N');
    if (found) return found.id;
  }

  // 5. Match P101-HS Bull Nose (6.4m³) and similar sizes (6.2m³, 6m³, etc.)
  if (clean.includes('HS') || clean.includes('6.4') || clean.includes('6.2') || clean.includes('6M3')) {
    found = sizes.find((s) => s.code?.toUpperCase() === 'P101-HS');
    if (found) return found.id;
  }

  // 6. Match P101-E Pin Index (0.7m³)
  if (clean.includes('101-E') || clean.includes('0.7')) {
    found = sizes.find((s) => s.code?.toUpperCase() === 'P101-E');
    if (found) return found.id;
  }

  // 7. Match P101-D Pin Index (0.5m³)
  if (clean.includes('101-D') || clean.includes('0.5')) {
    found = sizes.find((s) => s.code?.toUpperCase() === 'P101-D');
    if (found) return found.id;
  }

  // 8. Match 2.0m³ / 101-C to P101-F / 101-F
  if (clean.includes('2.0') || clean.includes('101-C')) {
    found = sizes.find((s) => s.code?.toUpperCase() === 'P101-F') || sizes.find((s) => s.code?.toUpperCase() === '101-F');
    if (found) return found.id;
  }

  // 8. Fallback to large Bullnose cylinder (101-N)
  const defaultN = sizes.find((s) => (s.code || '').toUpperCase() === '101-N');
  return defaultN?.id || sizes[0]?.id || '332911a0-9e8c-4c0e-980a-9df3d0197dce';
}

/**
 * Helper to extract serial numbers from usage_notes string
 */
export function extractSerialsFromNotes(notes: string): string[] {
  if (!notes) return [];
  const serials: string[] = [];

  // Remove bracketed system tags first, e.g. [Saiz Khas: ...], [Pin Index PI], [Bullnose BN]
  const cleanedNotes = notes.replace(/\[[^\]]+\]/g, '').trim();
  if (!cleanedNotes) return [];

  // Pattern 1: Serials (2): serial1, serial2 | other notes
  // or Serials: serial1, serial2
  // or Siri: serial1, serial2
  const match = cleanedNotes.match(/(?:serials?(?:\s*\(\d+\))?|siri)\s*:\s*([^|]+)/i);
  if (match && match[1]) {
    const parts = match[1].split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean);
    parts.forEach((p: string) => {
      if (p && !serials.includes(p)) serials.push(p);
    });
  } else if (cleanedNotes.includes('saboxy-') || cleanedNotes.includes('101-') || cleanedNotes.includes('P101-')) {
    const parts = cleanedNotes.split(/[,;\n|]+/).map((s: string) => s.trim()).filter(Boolean);
    parts.forEach((p: string) => {
      const clean = p.trim();
      if (
        clean && 
        !serials.includes(clean) && 
        !clean.toLowerCase().includes('loan') && 
        !clean.toLowerCase().includes('cylinder') &&
        !clean.startsWith('[') &&
        !clean.endsWith(']')
      ) {
        serials.push(clean);
      }
    });
  }
  return serials;
}

/**
 * Mapper function to translate the database model to the UI type
 */
function mapToCylinderDispatchRequest(
  row: any, 
  sizes: any[], 
  allMovements: any[] = []
): CylinderDispatchRequestWithRelations {
  // Filter movements belonging to this request (by dept_request_id or request_id in remarks)
  const reqMovements = allMovements.filter(m => 
    m.dept_request_id === row.id || 
    (row.request_id && m.remarks && m.remarks.includes(row.request_id))
  );

  const rawItems = row.items || [];
  const allocatedCylinderIds = new Set<string>();
  const allocatedSerials = new Set<string>();

  // Pass 1: Parse and normalize items, note serials, and target quantities
  const preparedItems = rawItems.map((itm: any) => {
    let sizeCode = itm.size_code || 
                   itm.size_info?.code || 
                   sizes.find(s => s.id === itm.cylinder_size_id)?.code || 
                   '101-N';

    const notes = itm.usage_notes || '';
    const customMatch = notes.match(/\[Saiz Khas:\s*([^\]]+)\]/i);
    if (customMatch && customMatch[1]) {
      const customVal = customMatch[1].trim();
      const isStandardInDb = sizes.some(
        (s) => s.id === itm.cylinder_size_id && ['101-N', '101-F', 'P101-F', 'P101-HS', 'P101-E', 'P101-D'].includes(s.code?.toUpperCase())
      );
      const isStandardTag = ['101-N', '101-F', 'P101-F', 'P101-F-BN', 'P101-F-PI', '101-F-BN', '101-F-PI', 'P101-HS', 'P101-E', 'P101-D'].some(
        st => st.toUpperCase() === customVal.toUpperCase()
      );
      if (!isStandardInDb && !isStandardTag) {
        sizeCode = customVal;
      }
    }
    
    if ((sizeCode === '101-F' || sizeCode === 'P101-F') && (notes.includes('Bullnose') || notes.includes('BN'))) {
      sizeCode = '101-F-BN';
    }

    const noteSerials = extractSerialsFromNotes(notes);
    const targetQty = (row.status === 'pending' || row.status === 'rejected')
      ? (itm.quantity || 1)
      : (itm.quantity_issued > 0 ? itm.quantity_issued : (itm.quantity || 1));

    return {
      itm,
      sizeCode,
      notes,
      noteSerials,
      targetQty
    };
  });

  // Pass 2: Reserve serials and movements for items with explicit serials in usage_notes
  preparedItems.forEach(p => {
    if (p.noteSerials.length > 0) {
      const boundedSerials = p.targetQty > 0 ? p.noteSerials.slice(0, p.targetQty) : p.noteSerials;
      boundedSerials.forEach(s => allocatedSerials.add(s.toUpperCase().trim()));

      reqMovements.forEach(m => {
        const cyl = m.cylinder || m;
        const sn = (cyl?.serial_number || cyl?.qr_code || '').toUpperCase().trim();
        if (sn && boundedSerials.some(bs => bs.toUpperCase().trim() === sn)) {
          if (cyl?.id) allocatedCylinderIds.add(cyl.id);
          if (m.cylinder_id) allocatedCylinderIds.add(m.cylinder_id);
        }
      });
    }
  });

  // Pass 3: Build mapped items with exact serial allocations
  const items = preparedItems.map(({ itm, sizeCode, notes, noteSerials, targetQty }) => {
    let serials: string[] = [];
    let assignedCylinders: any[] = [];

    if (noteSerials.length > 0) {
      // 1. Explicit serials from notes have top priority for this specific item
      serials = targetQty > 0 ? noteSerials.slice(0, targetQty) : noteSerials;

      assignedCylinders = serials.map((s, sIdx) => {
        const matched = reqMovements.find(m => {
          const cyl = m.cylinder || m;
          const sn = (cyl?.serial_number || cyl?.qr_code || '').toUpperCase().trim();
          return sn === s.toUpperCase().trim();
        });
        const cyl = matched?.cylinder || matched;
        return {
          id: cyl?.id || matched?.cylinder_id || `item-${itm.id}-${sIdx}`,
          serial_number: s,
          qr_code: cyl?.qr_code || s,
          cylinder_size_id: cyl?.cylinder_size_id || itm.cylinder_size_id,
          size_code: cyl?.size_info?.code || sizeCode
        };
      });
    } else {
      // 2. Allocate from available unallocated reqMovements matching size
      const availableMovements = reqMovements.filter(m => {
        const cyl = m.cylinder || m;
        const cid = cyl?.id || m.cylinder_id;
        const sn = (cyl?.serial_number || cyl?.qr_code || '').toUpperCase().trim();

        if (cid && allocatedCylinderIds.has(cid)) return false;
        if (sn && allocatedSerials.has(sn)) return false;

        if (m.remarks && m.remarks.includes(itm.id)) return true;

        const cylSizeId = cyl?.cylinder_size_id || m.cylinder_size_id;
        const cylSizeCode = (cyl?.size_info?.code || cyl?.size_code || '').toUpperCase();
        const itemSizeClean = sizeCode.toUpperCase();

        if (itm.cylinder_size_id && cylSizeId === itm.cylinder_size_id) return true;
        if (cylSizeCode && (
          cylSizeCode === itemSizeClean ||
          cylSizeCode.replace(/^P/, '') === itemSizeClean.replace(/^P/, '') ||
          (itemSizeClean.includes('101-F') && cylSizeCode.includes('101-F')) ||
          (itemSizeClean.includes('101-N') && cylSizeCode.includes('101-N'))
        )) return true;

        if (rawItems.length === 1) return true;
        return false;
      });

      const sliceMovements = targetQty > 0 ? availableMovements.slice(0, targetQty) : availableMovements;

      sliceMovements.forEach(m => {
        const cyl = m.cylinder || m;
        const cid = cyl?.id || m.cylinder_id;
        const sn = (cyl?.serial_number || cyl?.qr_code || '').toUpperCase().trim();
        if (cid) allocatedCylinderIds.add(cid);
        if (sn) allocatedSerials.add(sn);
      });

      assignedCylinders = sliceMovements.map(m => {
        const cyl = m.cylinder || m;
        return {
          id: cyl?.id || m.cylinder_id,
          serial_number: cyl?.serial_number || cyl?.qr_code || '',
          qr_code: cyl?.qr_code,
          cylinder_size_id: cyl?.cylinder_size_id,
          size_code: cyl?.size_info?.code || sizeCode
        };
      }).filter(c => c.serial_number);

      serials = Array.from(new Set(assignedCylinders.map(c => c.serial_number).filter(Boolean)));
      if (targetQty > 0 && serials.length > targetQty) {
        serials = serials.slice(0, targetQty);
      }
    }

    return {
      id: itm.id,
      dispatch_request_id: itm.request_id,
      cylinder_size_id: itm.cylinder_size_id,
      size_code: sizeCode,
      quantity_requested: itm.quantity,
      quantity_issued: itm.quantity_issued || 0,
      usage_notes: notes,
      dispatched_serials: serials,
      assigned_cylinders: assignedCylinders
    };
  });

  const isExternal = Boolean(
    row.is_external_facility ||
    Boolean(row.external_facility_name) ||
    (row.manual_requester_name && (
      row.manual_requester_name.includes('[EXTERNAL]') ||
      row.manual_requester_name.toLowerCase().includes('beaufort') ||
      row.manual_requester_name.toLowerCase().includes('external') ||
      row.manual_requester_name.toLowerCase().includes('hospital ')
    ))
  );

  let extFacilityName = row.external_facility_name || '';
  if (!extFacilityName && row.manual_requester_name) {
    if (row.manual_requester_name.includes('[EXTERNAL]')) {
      extFacilityName = row.manual_requester_name.replace('[EXTERNAL]', '').split('(')[0].trim();
    } else if (row.manual_requester_name.toLowerCase().includes('hospital')) {
      extFacilityName = row.manual_requester_name.split('(')[0].trim();
    }
  }

  const indentDirection = row.indent_direction || (row.manual_requester_name?.toLowerCase().includes('inbound') ? 'inbound' : 'outbound');
  const isActualManualIssue = !isExternal && Boolean(row.manual_requester_name && !row.requested_by);

  const isExternalReturn = isExternal && (
    Boolean(row.manual_requester_name?.toLowerCase().includes('return') || row.manual_requester_name?.toLowerCase().includes('pulang')) ||
    Boolean(row.remarks?.toLowerCase().includes('pulang') || row.remarks?.toLowerCase().includes('pemulangan'))
  );
  const isExternalReceive = isExternal && !isExternalReturn && (
    indentDirection === 'inbound' ||
    Boolean(row.manual_requester_name?.toLowerCase().includes('terima') || row.manual_requester_name?.toLowerCase().includes('received'))
  );
  const externalOperation: 'request' | 'receive' | 'return' | undefined = isExternal
    ? (isExternalReturn ? 'return' : isExternalReceive ? 'receive' : 'request')
    : undefined;

  const cleanRemarks = row.remarks || 
    (row.manual_requester_name && !row.manual_requester_name.startsWith('[EXTERNAL]') ? row.manual_requester_name : '') ||
    (row.status !== 'rejected' ? (row.rejection_reason || '') : '') ||
    '';

  const cleanRejectionReason = row.status === 'rejected' ? (row.rejection_reason || '') : '';

  return {
    id: row.id,
    hospital_id: row.hospital_id,
    request_number: row.request_id,
    request_type: isActualManualIssue ? 'manual_issue' : 'unit_request',
    department_id: row.department_id,
    requester_id: row.requested_by,
    issuer_id: row.approved_by,
    approver_id: row.approved_by,
    status: row.status || 'pending',
    priority: 'normal',
    request_date: row.created_at,
    approved_date: row.approved_at,
    issued_date: (row.status === 'issued' || row.status === 'completed') ? (row.updated_at || row.approved_at) : undefined,
    completed_date: row.status === 'completed' ? row.updated_at : undefined,
    remarks: cleanRemarks,
    rejection_reason: cleanRejectionReason,
    created_by: row.requested_by,
    department: row.department,
    is_external_facility: isExternal,
    external_facility_name: extFacilityName || undefined,
    indent_direction: indentDirection,
    external_operation: externalOperation,
    requester: row.requester ? {
      id: row.requester.id,
      full_name: row.requester.full_name,
      jawatan: row.requester.jawatan
    } : undefined,
    issuer: row.approver ? {
      id: row.approver.id,
      full_name: row.approver.full_name,
      jawatan: row.approver.jawatan
    } : undefined,
    approver: row.approver ? {
      id: row.approver.id,
      full_name: row.approver.full_name,
      jawatan: row.approver.jawatan
    } : undefined,
    items: items,
    dispatched_movements: reqMovements
  };
}

/**
 * Helper to generate sequential request numbers matching database conventions
 */
export async function getNextRequestNumber(hospitalId: string): Promise<string> {
  try {
    if (isSupabaseConfigured()) {
      const year = new Date().getFullYear();
      const prefix = `OC-${year}-`;

      // Fetch existing request_ids matching this prefix to find actual max sequence
      const { data, error } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .select('request_id')
        .eq('hospital_id', hospitalId)
        .like('request_id', `${prefix}%`)
        .order('request_id', { ascending: false })
        .limit(100);

      if (error) throw error;

      let maxSeq = 0;
      if (data && data.length > 0) {
        for (const row of data) {
          if (row.request_id && typeof row.request_id === 'string' && row.request_id.startsWith(prefix)) {
            const seqPart = row.request_id.slice(prefix.length);
            const num = parseInt(seqPart, 10);
            if (!isNaN(num) && num > maxSeq) {
              maxSeq = num;
            }
          }
        }
      }

      let candidateSeq = maxSeq + 1;
      let candidate = `${prefix}${String(candidateSeq).padStart(4, '0')}`;

      // Check existence to guarantee no collision
      for (let attempt = 0; attempt < 10; attempt++) {
        const { data: existing } = await supabase
          .from('pharmacy_oxygen_dept_requests')
          .select('id')
          .eq('hospital_id', hospitalId)
          .eq('request_id', candidate)
          .maybeSingle();

        if (!existing) {
          return candidate;
        }
        candidateSeq++;
        candidate = `${prefix}${String(candidateSeq).padStart(4, '0')}`;
      }

      return candidate;
    }
  } catch (err) {
    console.error('Error generating next request number:', err);
  }
  const year = new Date().getFullYear();
  return `OC-${year}-${Date.now().toString().slice(-4)}`;
}

/**
 * Fetch all cylinder dispatch requests from live tables
 */
export async function getCylinderDispatchRequests(
  hospitalId: string,
  filters?: {
    status?: string;
    departmentId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<CylinderDispatchRequestWithRelations[]>> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('pharmacy_oxygen_dept_requests')
        .select(`
          *,
          department:departments(id, department_name, department_code),
          requester:users!pharmacy_oxygen_dept_requests_requested_by_fkey(id, full_name, jawatan),
          approver:users!pharmacy_oxygen_dept_requests_approved_by_fkey(id, full_name, jawatan),
          items:pharmacy_oxygen_dept_request_items(
            id,
            request_id,
            cylinder_size_id,
            quantity,
            quantity_issued,
            usage_notes,
            size_info:pharmacy_oxygen_cylinder_sizes(id, code)
          )
        `)
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.departmentId && filters.departmentId !== 'all') {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      let { data, error } = await query;
      if (error) throw error;

      // Load all sizes for mapping fallback
      const { data: sizes } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('id, code');

      // Fetch movements for the hospital to link dispatched cylinders
      const { data: movements } = await supabase
        .from('pharmacy_oxygen_cylinder_movements')
        .select(`
          id,
          cylinder_id,
          dept_request_id,
          remarks,
          cylinder:pharmacy_oxygen_cylinder_inventory(
            id,
            serial_number,
            qr_code,
            cylinder_size_id,
            size_info:pharmacy_oxygen_cylinder_sizes(id, code)
          )
        `)
        .eq('hospital_id', hospitalId)
        .in('movement_type', ['issued', 'received', 'sent_to_supplier', 'returned']);

      const mapped = (data || []).map((row) => mapToCylinderDispatchRequest(row, sizes || [], movements || []));

      let filteredData = mapped;
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((req) => {
          return (
            req.request_number.toLowerCase().includes(searchLower) ||
            req.department?.department_name?.toLowerCase().includes(searchLower) ||
            req.requester?.full_name?.toLowerCase().includes(searchLower) ||
            req.issuer?.full_name?.toLowerCase().includes(searchLower) ||
            req.remarks.toLowerCase().includes(searchLower) ||
            (req.external_facility_name && req.external_facility_name.toLowerCase().includes(searchLower))
          );
        });
      }

      return { data: filteredData, error: null };
    }
    return { data: [], error: null };
  } catch (error) {
    console.error('Error fetching cylinder dispatch requests:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch dispatch requests'
    };
  }
}

/**
 * Fetch a single request by ID with relations
 */
export async function getCylinderDispatchRequestById(
  requestId: string
): Promise<ApiResponse<CylinderDispatchRequestWithRelations>> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .select(`
          *,
          department:departments(id, department_name, department_code),
          requester:users!pharmacy_oxygen_dept_requests_requested_by_fkey(id, full_name, jawatan),
          approver:users!pharmacy_oxygen_dept_requests_approved_by_fkey(id, full_name, jawatan),
          items:pharmacy_oxygen_dept_request_items(
            id,
            request_id,
            cylinder_size_id,
            quantity,
            quantity_issued,
            usage_notes,
            size_info:pharmacy_oxygen_cylinder_sizes(id, code)
          )
        `)
        .eq('id', requestId)
        .single();

      if (error) throw error;

      // Query associated cylinder movements and cylinder inventory details
      const { data: movements } = await supabase
        .from('pharmacy_oxygen_cylinder_movements')
        .select(`
          id,
          cylinder_id,
          dept_request_id,
          remarks,
          cylinder:pharmacy_oxygen_cylinder_inventory(
            id,
            serial_number,
            qr_code,
            cylinder_size_id,
            size_info:pharmacy_oxygen_cylinder_sizes(id, code)
          )
        `)
        .or(`dept_request_id.eq.${requestId},remarks.ilike.%${data.request_id}%`);

      const { data: sizes } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('id, code');
      return { data: mapToCylinderDispatchRequest(data, sizes || [], movements || []), error: null };
    }
    return { data: null, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error fetching cylinder dispatch request detail:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch request detail'
    };
  }
}

/**
 * Fetch aggregated KPI statistics for cylinder dispatch requests
 */
export async function getCylinderDispatchKPI(hospitalId: string): Promise<ApiResponse<CylinderDispatchKPI>> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .select('status, created_at, approved_at, updated_at')
        .eq('hospital_id', hospitalId);

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let total_requests = 0;
      let pending_count = 0;
      let approved_count = 0;
      let issued_count = 0;
      let completed_count = 0;
      let rejected_count = 0;
      let cancelled_count = 0;
      let this_month_count = 0;

      let totalFulfillmentHours = 0;
      let fulfilledCount = 0;

      (data || []).forEach((req) => {
        total_requests++;
        const reqDate = new Date(req.created_at);
        if (reqDate >= startOfMonth) {
          this_month_count++;
        }

        switch (req.status) {
          case 'pending':
            pending_count++;
            break;
          case 'approved':
            approved_count++;
            break;
          case 'issued':
            issued_count++;
            break;
          case 'completed':
            completed_count++;
            break;
          case 'rejected':
            rejected_count++;
            break;
          case 'cancelled':
            cancelled_count++;
            break;
        }

        if (req.status === 'completed' && req.approved_at && req.created_at) {
          const hours = (new Date(req.updated_at).getTime() - new Date(req.created_at).getTime()) / (1000 * 60 * 60);
          totalFulfillmentHours += hours;
          fulfilledCount++;
        }
      });

      const avg_fulfillment_hours = fulfilledCount > 0 ? parseFloat((totalFulfillmentHours / fulfilledCount).toFixed(1)) : 0;

      return {
        data: {
          total_requests,
          pending_count,
          approved_count,
          issued_count,
          completed_count,
          rejected_count,
          cancelled_count,
          this_month_count,
          avg_fulfillment_hours
        },
        error: null
      };
    }

    return {
      data: {
        total_requests: 0,
        pending_count: 0,
        approved_count: 0,
        issued_count: 0,
        completed_count: 0,
        rejected_count: 0,
        cancelled_count: 0,
        this_month_count: 0,
        avg_fulfillment_hours: 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error calculating cylinder dispatch KPIs:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to calculate KPIs'
    };
  }
}

/**
 * Path A: Create Manual Issue (issued immediately)
 */
export async function createManualIssue(
  hospitalId: string,
  data: {
    department_id: string;
    items: { size_code: string; quantity: number; usage_notes?: string }[];
    remarks?: string;
    issuer_id: string;
    requested_by?: string;
    manual_requester_name?: string;
    cylinder_ids?: string[];
    is_external_facility?: boolean;
    external_facility_name?: string;
    indent_direction?: 'outbound' | 'inbound';
  }
): Promise<ApiResponse<CylinderDispatchRequest>> {
  try {
    if (isSupabaseConfigured()) {
      // Strict RBAC Mandate: Only Pegawai Farmasi and Penolong Pegawai Farmasi can issue cylinders
      if (data.issuer_id) {
        const { data: issuerUser } = await supabase
          .from('users')
          .select('id, full_name, jawatan, role:roles(role_code, role_name)')
          .eq('id', data.issuer_id)
          .maybeSingle();

        if (issuerUser && !isCylinderAuthorizedOfficer(issuerUser)) {
          return {
            data: null,
            error: 'Hanya Pegawai Farmasi dan Penolong Pegawai Farmasi yang dibenarkan mengeluarkan (manual issue) silinder oksigen.'
          };
        }
      }

      const request_id = await getNextRequestNumber(hospitalId);

      const manualName = data.is_external_facility && data.external_facility_name
        ? `[EXTERNAL] ${data.external_facility_name} (${data.indent_direction === 'inbound' ? 'Inbound Indent' : 'Outbound Indent'})`
        : (data.manual_requester_name || data.remarks || 'MANUAL ISSUE');

      // Insert Request (with retry on unique constraint)
      let request: any = null;
      let reqError: any = null;
      let currentRequestId = request_id;

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: reqData, error: insertErr } = await supabase
          .from('pharmacy_oxygen_dept_requests')
          .insert({
            hospital_id: hospitalId,
            request_id: currentRequestId,
            department_id: data.department_id,
            requested_by: data.requested_by || data.issuer_id,
            status: 'completed',
            approved_by: data.issuer_id,
            approved_at: new Date().toISOString(),
            manual_requester_name: manualName,
            is_external_facility: data.is_external_facility || false,
            external_facility_name: data.external_facility_name || null,
            indent_direction: data.indent_direction || 'outbound',
            remarks: data.remarks || null,
            rejection_reason: null
          })
          .select('*')
          .single();

        if (!insertErr && reqData) {
          request = reqData;
          reqError = null;
          break;
        }

        if (insertErr?.code === '23505') {
          console.warn(`request_id collision on ${currentRequestId}, fetching new sequence...`);
          currentRequestId = await getNextRequestNumber(hospitalId);
          reqError = insertErr;
          continue;
        }

        reqError = insertErr;
        break;
      }

      if (reqError || !request) throw reqError;

      // Fetch sizes for mapping
      const { data: sizes } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('id, code');

      // Insert Items
      const itemRows = data.items.map((item) => {
        const sizeId = resolveCylinderSizeId(item.size_code, sizes || []);
        let notes = item.usage_notes || '';
        if (item.size_code === '101-F-BN' || item.size_code === 'P101-F-BN') {
          if (!notes.includes('BN') && !notes.includes('Bullnose')) {
            notes = notes ? `[Bullnose BN] ${notes}` : '[Bullnose BN]';
          }
        } else if (item.size_code === '101-F' || item.size_code === 'P101-F' || item.size_code === '101-F-PI') {
          if (!notes.includes('PI') && !notes.includes('Pin Index')) {
            notes = notes ? `[Pin Index PI] ${notes}` : '[Pin Index PI]';
          }
        }

        return {
          request_id: request.id,
          cylinder_size_id: sizeId,
          quantity: item.quantity,
          quantity_issued: item.quantity,
          usage_notes: notes
        };
      });

      const { error: itemsError } = await supabase
        .from('pharmacy_oxygen_dept_request_items')
        .insert(itemRows);

      if (itemsError) throw itemsError;

      // Log movement and update cylinder inventory if specific cylinders were assigned
      if (data.cylinder_ids && data.cylinder_ids.length > 0) {
        // Look up target department name
        let targetDeptName = 'Department';
        if (data.department_id) {
          const { data: deptRow } = await supabase
            .from('departments')
            .select('department_name')
            .eq('id', data.department_id)
            .single();
          if (deptRow?.department_name) {
            targetDeptName = deptRow.department_name;
          }
        }

        // Fetch current cylinder details to accurately track from_location
        const { data: currentCyls } = await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select('id, current_location, serial_number, department:departments(department_name)')
          .in('id', data.cylinder_ids);

        const cylMap = new Map((currentCyls || []).map((c: any) => [c.id, c]));

        for (const cid of data.cylinder_ids) {
          const prevCyl = cylMap.get(cid);
          const rawPrevLoc = prevCyl?.department?.department_name || prevCyl?.current_location || 'Pharmacy Store';
          const isTransfer = rawPrevLoc && rawPrevLoc !== 'Pharmacy Store' && rawPrevLoc !== 'Store';
          const fromLocation = isTransfer ? rawPrevLoc : 'Pharmacy Store';

          // Update status in inventory
          await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .update({
              status: 'issued',
              current_location: targetDeptName,
              department_id: data.department_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', cid);

          // Insert movement log
          await supabase
            .from('pharmacy_oxygen_cylinder_movements')
            .insert({
              hospital_id: hospitalId,
              cylinder_id: cid,
              movement_type: isTransfer ? 'transfer' : 'issued',
              from_location: fromLocation,
              to_location: targetDeptName,
              department_id: data.department_id,
              moved_by: data.issuer_id,
              moved_at: new Date().toISOString(),
              dept_request_id: request.id,
              remarks: isTransfer 
                ? `Transferred via manual issue ${request_id} from ${fromLocation}`
                : `Dispatched via manual issue ${request_id}`
            });
        }
      }

      // Fetch newly created movements to map properly
      const { data: createdMovements } = await supabase
        .from('pharmacy_oxygen_cylinder_movements')
        .select(`
          id,
          cylinder_id,
          dept_request_id,
          remarks,
          cylinder:pharmacy_oxygen_cylinder_inventory(
            id,
            serial_number,
            qr_code,
            cylinder_size_id,
            size_info:pharmacy_oxygen_cylinder_sizes(id, code)
          )
        `)
        .eq('dept_request_id', request.id);

      return { data: mapToCylinderDispatchRequest(request, sizes || [], createdMovements || []), error: null };
    }
    return { data: null, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error creating manual issue:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create manual issue'
    };
  }
}

/**
 * Path C: Create Inter-Facility Received Cylinders (strictly for inbound transfers from external facilities e.g. Hospital Beaufort)
 */
export async function createInterFacilityReceivedCylinder(
  hospitalId: string,
  data: {
    external_facility_name: string;
    external_doc_ref?: string;
    transporter_name?: string;
    vehicle_number?: string;
    receiver_id: string;
    department_id: string;
    received_at?: string;
    remarks?: string;
    items: Array<{
      size_code: string;
      custom_size_name?: string;
      quantity: number;
      serials: string[];
      condition?: 'full' | 'empty';
      notes?: string;
    }>;
  }
): Promise<ApiResponse<CylinderDispatchRequest>> {
  try {
    if (isSupabaseConfigured()) {
      const request_id = await getNextRequestNumber(hospitalId);
      const facilityName = (data.external_facility_name || 'Hospital Beaufort').trim();
      const manualName = `[EXTERNAL] ${facilityName} (Inbound Indent)`;
      const timestamp = data.received_at || new Date().toISOString();

      // Build structured remarks with DO/Vehicle/Driver info
      const remarkParts: string[] = [];
      if (data.external_doc_ref) remarkParts.push(`DO/Ref: ${data.external_doc_ref.trim()}`);
      if (data.transporter_name) remarkParts.push(`Pembawa: ${data.transporter_name.trim()}`);
      if (data.vehicle_number) remarkParts.push(`No. Kenderaan: ${data.vehicle_number.trim()}`);
      if (data.remarks) remarkParts.push(data.remarks.trim());
      const combinedRemarks = remarkParts.length > 0 ? remarkParts.join(' | ') : null;

      // 1. Insert into pharmacy_oxygen_dept_requests (with retry on unique constraint)
      let request: any = null;
      let reqError: any = null;
      let currentRequestId = request_id;

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: reqData, error: insertErr } = await supabase
          .from('pharmacy_oxygen_dept_requests')
          .insert({
            hospital_id: hospitalId,
            request_id: currentRequestId,
            department_id: data.department_id,
            requested_by: data.receiver_id,
            status: 'completed',
            approved_by: data.receiver_id,
            approved_at: timestamp,
            manual_requester_name: manualName,
            is_external_facility: true,
            external_facility_name: facilityName,
            indent_direction: 'inbound',
            remarks: combinedRemarks,
            rejection_reason: null
          })
          .select('*')
          .single();

        if (!insertErr && reqData) {
          request = reqData;
          reqError = null;
          break;
        }

        if (insertErr?.code === '23505') {
          console.warn(`request_id collision on ${currentRequestId}, fetching new sequence...`);
          currentRequestId = await getNextRequestNumber(hospitalId);
          reqError = insertErr;
          continue;
        }

        reqError = insertErr;
        break;
      }

      if (reqError || !request) throw reqError;

      // 2. Fetch sizes & cylinder types for mapping
      const { data: sizes } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('id, code');
      const { data: cylTypes } = await supabase.from('pharmacy_oxygen_cylinder_types').select('id, code');

      const bnTypeId = cylTypes?.find((t: any) => t.code === 'BN')?.id || '3edfc0fe-98fb-4592-9ce1-4229718871a2';
      const piTypeId = cylTypes?.find((t: any) => t.code === 'PI')?.id || '1874961b-a46d-4cf6-8a47-90b18a1e0fb7';

      // 3. Process each item row
      const itemRows = [];
      const allSerialsToProcess: Array<{
        serial: string;
        sizeId: string;
        typeId: string;
        sizeCode: string;
      }> = [];

      for (const item of data.items) {
        const isOthers = item.size_code === 'OTHERS' || item.size_code === 'LAIN-LAIN';
        const effectiveSizeCode = isOthers 
          ? (item.custom_size_name || 'Lain-lain') 
          : item.size_code;

        // Resolve size ID
        const sizeId = resolveCylinderSizeId(effectiveSizeCode, sizes || []);
        
        // Resolve cylinder type
        const typeId = (effectiveSizeCode.includes('PI') || effectiveSizeCode.includes('101-F-PI') || effectiveSizeCode.includes('101-E') || effectiveSizeCode.includes('101-D'))
          ? piTypeId 
          : bnTypeId;

        // Build usage_notes string
        const noteParts: string[] = [];
        noteParts.push(`[Indent Luar - ${facilityName}]`);
        if (isOthers && item.custom_size_name) {
          noteParts.push(`[Saiz Khas: ${item.custom_size_name}]`);
        }
        if (item.condition) {
          noteParts.push(`[Keadaan: ${item.condition === 'empty' ? 'Kosong' : 'Penuh'}]`);
        }
        if (item.notes) {
          noteParts.push(item.notes.trim());
        }

        // Add serials tag if present
        const cleanSerials = (item.serials || []).map(s => s.trim()).filter(Boolean);
        if (cleanSerials.length > 0) {
          noteParts.push(`Serials (${cleanSerials.length}): ${cleanSerials.join(', ')}`);
        }

        itemRows.push({
          request_id: request.id,
          cylinder_size_id: sizeId,
          quantity: item.quantity,
          quantity_issued: item.quantity,
          usage_notes: noteParts.join(' | ')
        });

        // Queue serials for inventory & movement registration
        cleanSerials.forEach(s => {
          allSerialsToProcess.push({
            serial: s,
            sizeId,
            typeId,
            sizeCode: effectiveSizeCode
          });
        });
      }

      // Insert request items
      const { error: itemsError } = await supabase
        .from('pharmacy_oxygen_dept_request_items')
        .insert(itemRows);

      if (itemsError) throw itemsError;

      // 4. Update or Insert into pharmacy_oxygen_cylinder_inventory & record movements
      for (const itemSerial of allSerialsToProcess) {
        const { serial, sizeId, typeId, condition } = itemSerial;
        const targetStatus = condition === 'empty' ? 'empty' : 'available';

        // Check if cylinder already exists in inventory (by serial or qr_code)
        const { data: existingCyl } = await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select('id, serial_number, qr_code, status')
          .eq('hospital_id', hospitalId)
          .or(`serial_number.eq.${serial},qr_code.eq.${serial}`)
          .maybeSingle();

        let cylinderId = existingCyl?.id;

        if (cylinderId) {
          // Update existing cylinder status to available/empty in store
          await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .update({
              status: targetStatus,
              current_location: 'Pharmacy Store',
              department_id: null,
              serial_number: serial,
              updated_at: timestamp
            })
            .eq('id', cylinderId);
        } else {
          // Verify qr_code does not collide
          let targetQr = serial;
          const { data: qrConflict } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .select('id')
            .eq('qr_code', targetQr)
            .maybeSingle();

          if (qrConflict) {
            cylinderId = qrConflict.id;
            await supabase
              .from('pharmacy_oxygen_cylinder_inventory')
              .update({
                status: targetStatus,
                current_location: 'Pharmacy Store',
                department_id: null,
                serial_number: serial,
                updated_at: timestamp
              })
              .eq('id', cylinderId);
          } else {
            // Insert new cylinder
            const { data: newCyl, error: cylInsertErr } = await supabase
              .from('pharmacy_oxygen_cylinder_inventory')
              .insert({
                hospital_id: hospitalId,
                cylinder_size_id: sizeId,
                cylinder_type_id: typeId,
                serial_number: serial,
                qr_code: targetQr,
                status: targetStatus,
                current_location: 'Pharmacy Store',
                supplier_tagged: false,
                supplier_tag_source: `Inter-Facility: ${facilityName}`
              })
              .select('id')
              .single();

            if (!cylInsertErr && newCyl) {
              cylinderId = newCyl.id;
            } else if (cylInsertErr) {
              console.warn('Could not insert cylinder record into inventory:', cylInsertErr);
            }
          }
        }

        // Insert movement record
        if (cylinderId) {
          await supabase
            .from('pharmacy_oxygen_cylinder_movements')
            .insert({
              hospital_id: hospitalId,
              cylinder_id: cylinderId,
              movement_type: 'received',
              from_location: facilityName,
              to_location: 'Pharmacy Store',
              department_id: data.department_id || null,
              moved_by: data.receiver_id || null,
              moved_at: timestamp,
              dept_request_id: request.id,
              remarks: `Diterima (${condition === 'empty' ? 'Kosong' : 'Penuh'}) daripada ${facilityName} (${request.request_id})`
            });
        }
      }

      // 5. Fetch newly created movements to map properly
      const { data: createdMovements } = await supabase
        .from('pharmacy_oxygen_cylinder_movements')
        .select(`
          id,
          cylinder_id,
          dept_request_id,
          remarks,
          cylinder:pharmacy_oxygen_cylinder_inventory(
            id,
            serial_number,
            qr_code,
            cylinder_size_id,
            size_info:pharmacy_oxygen_cylinder_sizes(id, code)
          )
        `)
        .eq('dept_request_id', request.id);

      return { data: mapToCylinderDispatchRequest(request, sizes || [], createdMovements || []), error: null };
    }
    return { data: null, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error creating inter-facility received cylinder:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create inter-facility received cylinder'
    };
  }
}

/**
 * Path D: Create Inter-Facility Return Cylinders (for returning empty or loaned cylinders back to external facilities e.g. Hospital Beaufort)
 */
export async function createInterFacilityReturnCylinder(
  hospitalId: string,
  data: {
    external_facility_name: string;
    external_doc_ref?: string;
    transporter_name?: string;
    vehicle_number?: string;
    returner_id: string;
    department_id: string;
    returned_at?: string;
    remarks?: string;
    items: Array<{
      size_code: string;
      custom_size_name?: string;
      quantity: number;
      serials: string[];
      condition?: 'empty' | 'full' | 'damaged';
      notes?: string;
    }>;
  }
): Promise<ApiResponse<CylinderDispatchRequest>> {
  try {
    if (isSupabaseConfigured()) {
      const request_id = await getNextRequestNumber(hospitalId);
      const facilityName = (data.external_facility_name || 'Hospital Beaufort').trim();
      const manualName = `[EXTERNAL] ${facilityName} (Outbound Return)`;
      const timestamp = data.returned_at || new Date().toISOString();

      // Build structured remarks with DO/Vehicle/Driver/Reason info
      const remarkParts: string[] = [];
      if (data.external_doc_ref) remarkParts.push(`DO/Ref: ${data.external_doc_ref.trim()}`);
      if (data.transporter_name) remarkParts.push(`Pembawa: ${data.transporter_name.trim()}`);
      if (data.vehicle_number) remarkParts.push(`No. Kenderaan: ${data.vehicle_number.trim()}`);
      remarkParts.push(`Tujuan: Pemulangan Silinder ke ${facilityName}`);
      if (data.remarks) remarkParts.push(data.remarks.trim());
      const combinedRemarks = remarkParts.length > 0 ? remarkParts.join(' | ') : null;

      // 1. Insert into pharmacy_oxygen_dept_requests (with retry on unique constraint)
      let request: any = null;
      let reqError: any = null;
      let currentRequestId = request_id;

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: reqData, error: insertErr } = await supabase
          .from('pharmacy_oxygen_dept_requests')
          .insert({
            hospital_id: hospitalId,
            request_id: currentRequestId,
            department_id: data.department_id,
            requested_by: data.returner_id,
            status: 'completed',
            approved_by: data.returner_id,
            approved_at: timestamp,
            manual_requester_name: manualName,
            is_external_facility: true,
            external_facility_name: facilityName,
            indent_direction: 'outbound',
            remarks: combinedRemarks,
            rejection_reason: null
          })
          .select('*')
          .single();

        if (!insertErr && reqData) {
          request = reqData;
          reqError = null;
          break;
        }

        if (insertErr?.code === '23505') {
          console.warn(`request_id collision on ${currentRequestId}, fetching new sequence...`);
          currentRequestId = await getNextRequestNumber(hospitalId);
          reqError = insertErr;
          continue;
        }

        reqError = insertErr;
        break;
      }

      if (reqError || !request) throw reqError;

      // 2. Fetch sizes & cylinder types for mapping
      const { data: sizes } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('id, code');
      const { data: cylTypes } = await supabase.from('pharmacy_oxygen_cylinder_types').select('id, code');

      const bnTypeId = cylTypes?.find((t: any) => t.code === 'BN')?.id || '3edfc0fe-98fb-4592-9ce1-4229718871a2';
      const piTypeId = cylTypes?.find((t: any) => t.code === 'PI')?.id || '1874961b-a46d-4cf6-8a47-90b18a1e0fb7';

      // 3. Process each item row
      const itemRows = [];
      const allSerialsToProcess: Array<{
        serial: string;
        sizeId: string;
        typeId: string;
        sizeCode: string;
        condition: string;
      }> = [];

      for (const item of data.items) {
        const isOthers = item.size_code === 'OTHERS' || item.size_code === 'LAIN-LAIN';
        const effectiveSizeCode = isOthers 
          ? (item.custom_size_name || 'Lain-lain') 
          : item.size_code;

        const sizeId = resolveCylinderSizeId(effectiveSizeCode, sizes || []);
        const typeId = (effectiveSizeCode.includes('PI') || effectiveSizeCode.includes('101-F-PI') || effectiveSizeCode.includes('101-E') || effectiveSizeCode.includes('101-D'))
          ? piTypeId 
          : bnTypeId;

        const noteParts: string[] = [];
        noteParts.push(`[Pemulangan Luar - ${facilityName}]`);
        if (isOthers && item.custom_size_name) {
          noteParts.push(`[Saiz Khas: ${item.custom_size_name}]`);
        }
        if (item.condition) {
          noteParts.push(`[Keadaan: ${item.condition === 'empty' ? 'Kosong' : item.condition === 'damaged' ? 'Rosak' : 'Penuh'}]`);
        }
        if (item.notes) {
          noteParts.push(item.notes.trim());
        }

        const cleanSerials = (item.serials || []).map(s => s.trim()).filter(Boolean);
        if (cleanSerials.length > 0) {
          noteParts.push(`Serials (${cleanSerials.length}): ${cleanSerials.join(', ')}`);
        }

        itemRows.push({
          request_id: request.id,
          cylinder_size_id: sizeId,
          quantity: item.quantity,
          quantity_issued: item.quantity,
          usage_notes: noteParts.join(' | ')
        });

        cleanSerials.forEach(s => {
          allSerialsToProcess.push({
            serial: s,
            sizeId,
            typeId,
            sizeCode: effectiveSizeCode,
            condition: item.condition || 'empty'
          });
        });
      }

      // Insert request items
      const { error: itemsError } = await supabase
        .from('pharmacy_oxygen_dept_request_items')
        .insert(itemRows);

      if (itemsError) throw itemsError;

      // 4. Update cylinder inventory & record returned movements
      for (const itemSerial of allSerialsToProcess) {
        const { serial, sizeId, typeId, condition } = itemSerial;

        const { data: existingCyl } = await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .select('id, serial_number, qr_code, status')
          .eq('hospital_id', hospitalId)
          .or(`serial_number.eq.${serial},qr_code.eq.${serial}`)
          .maybeSingle();

        let cylinderId = existingCyl?.id;

        if (cylinderId) {
          // Update status to 'returned_to_supplier' and location to the external facility
          const { error: updErr } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .update({
              status: 'returned_to_supplier',
              current_location: `External: ${facilityName}`,
              department_id: null,
              updated_at: timestamp
            })
            .eq('id', cylinderId);

          if (updErr) {
            console.error('Error updating cylinder inventory on return:', updErr);
            throw updErr;
          }
        } else {
          // If returning cylinder that was borrowed and not tracked, record it in inventory as returned_to_supplier
          const { data: newCyl, error: insErr } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .insert({
              hospital_id: hospitalId,
              cylinder_size_id: sizeId,
              cylinder_type_id: typeId,
              serial_number: serial,
              qr_code: serial,
              status: 'returned_to_supplier',
              current_location: `External: ${facilityName}`,
              supplier_tagged: false,
              supplier_tag_source: `Returned to ${facilityName}`
            })
            .select('id')
            .single();

          if (insErr) {
            console.error('Error inserting new cylinder inventory on return:', insErr);
          }
          cylinderId = newCyl?.id;
        }

        // Record movement
        if (cylinderId) {
          const { error: moveErr } = await supabase
            .from('pharmacy_oxygen_cylinder_movements')
            .insert({
              hospital_id: hospitalId,
              cylinder_id: cylinderId,
              dept_request_id: request.id,
              movement_type: 'sent_to_supplier',
              from_location: 'Pharmacy Store',
              to_location: facilityName,
              department_id: data.department_id || null,
              moved_by: data.returner_id || null,
              moved_at: timestamp,
              created_at: timestamp,
              remarks: `Pemulangan silinder (${condition === 'empty' ? 'Kosong' : condition === 'damaged' ? 'Rosak' : 'Penuh'}) ke ${facilityName} | DO/Ref: ${data.external_doc_ref || request.request_id}`
            });

          if (moveErr) {
            console.error('Error inserting cylinder movement on return:', moveErr);
            throw moveErr;
          }
        }
      }

      // 5. Fetch newly created movements to map properly
      const { data: createdMovements } = await supabase
        .from('pharmacy_oxygen_cylinder_movements')
        .select(`
          id,
          cylinder_id,
          dept_request_id,
          remarks,
          cylinder:pharmacy_oxygen_cylinder_inventory(
            id,
            serial_number,
            qr_code,
            cylinder_size_id,
            size_info:pharmacy_oxygen_cylinder_sizes(id, code)
          )
        `)
        .eq('dept_request_id', request.id);

      return { data: mapToCylinderDispatchRequest(request, sizes || [], createdMovements || []), error: null };
    }
    return { data: null, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error creating inter-facility return cylinder:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create inter-facility return cylinder'
    };
  }
}

/**
 * Path B: Create Unit Request (pending approval)
 */
export async function createUnitRequest(
  hospitalId: string,
  data: {
    department_id: string;
    items: { size_code: string; custom_size_name?: string; quantity: number; usage_notes?: string }[];
    remarks?: string;
    requester_id: string;
    priority: 'normal' | 'urgent' | 'emergency';
    is_external_facility?: boolean;
    external_facility_name?: string;
    indent_direction?: 'outbound' | 'inbound';
  }
): Promise<ApiResponse<CylinderDispatchRequest>> {
  try {
    if (isSupabaseConfigured()) {
      const request_id = await getNextRequestNumber(hospitalId);

      const manualName = data.is_external_facility && data.external_facility_name
        ? `[EXTERNAL] ${data.external_facility_name} (${data.indent_direction === 'inbound' ? 'Inbound Indent' : 'Outbound Indent'})`
        : null;

      // Insert Request (with retry on unique constraint)
      let request: any = null;
      let reqError: any = null;
      let currentRequestId = request_id;

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: reqData, error: insertErr } = await supabase
          .from('pharmacy_oxygen_dept_requests')
          .insert({
            hospital_id: hospitalId,
            request_id: currentRequestId,
            department_id: data.department_id,
            requested_by: data.requester_id,
            status: 'pending',
            remarks: data.remarks || null,
            rejection_reason: null,
            is_external_facility: data.is_external_facility || false,
            external_facility_name: data.external_facility_name || null,
            indent_direction: data.indent_direction || 'outbound',
            manual_requester_name: manualName
          })
          .select('*')
          .single();

        if (!insertErr && reqData) {
          request = reqData;
          reqError = null;
          break;
        }

        if (insertErr?.code === '23505') {
          console.warn(`request_id collision on ${currentRequestId}, fetching new sequence...`);
          currentRequestId = await getNextRequestNumber(hospitalId);
          reqError = insertErr;
          continue;
        }

        reqError = insertErr;
        break;
      }

      if (reqError || !request) throw reqError;

      // Fetch sizes for mapping
      const { data: sizes } = await supabase.from('pharmacy_oxygen_cylinder_sizes').select('id, code');

      // Insert Items
      const itemRows = data.items.map((item) => {
        const isStandardCode = ['101-N', '101-F', 'P101-F', 'P101-F-BN', 'P101-F-PI', '101-F-BN', '101-F-PI', 'P101-HS', 'P101-E', 'P101-D'].some(
          sc => sc.toUpperCase() === item.size_code?.toUpperCase()
        ) || Boolean(sizes?.some(s => s.code?.toUpperCase() === item.size_code?.toUpperCase()));
        const isCustom = !isStandardCode && (item.size_code === 'MANUAL' || item.size_code === 'OTHERS' || item.size_code === 'LAIN-LAIN' || Boolean(item.custom_size_name));
        const effectiveSize = (item.custom_size_name || item.size_code || '').trim();
        const sizeId = resolveCylinderSizeId(effectiveSize, sizes || []);

        let notes = item.usage_notes || '';
        if (isCustom && effectiveSize) {
          const customLabel = item.custom_size_name || item.size_code;
          if (!notes.includes(`[Saiz Khas: ${customLabel}]`)) {
            notes = notes ? `[Saiz Khas: ${customLabel}] ${notes}` : `[Saiz Khas: ${customLabel}]`;
          }
        }
        if (item.size_code === '101-F-BN' || item.size_code === 'P101-F-BN') {
          if (!notes.includes('BN') && !notes.includes('Bullnose')) {
            notes = notes ? `[Bullnose BN] ${notes}` : '[Bullnose BN]';
          }
        } else if (item.size_code === '101-F' || item.size_code === 'P101-F' || item.size_code === '101-F-PI') {
          if (!notes.includes('PI') && !notes.includes('Pin Index')) {
            notes = notes ? `[Pin Index PI] ${notes}` : '[Pin Index PI]';
          }
        } else if (item.size_code === '101-N' || item.size_code === 'P101-HS') {
          if (!notes.includes('BN') && !notes.includes('Bullnose')) {
            notes = notes ? `[Bullnose BN] ${notes}` : '[Bullnose BN]';
          }
        }

        return {
          request_id: request.id,
          cylinder_size_id: sizeId,
          quantity: item.quantity,
          quantity_issued: 0,
          usage_notes: notes
        };
      });

      const { error: itemsError } = await supabase
        .from('pharmacy_oxygen_dept_request_items')
        .insert(itemRows);

      if (itemsError) throw itemsError;

      return { data: mapToCylinderDispatchRequest(request, sizes || []), error: null };
    }
    return { data: null, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error creating unit request:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create unit request'
    };
  }
}

/**
 * Approve Request
 */
export async function approveRequest(
  requestId: string,
  approverId: string,
  adjustedItems?: { id: string; quantity: number; quantity_issued?: number }[]
): Promise<ApiResponse<void>> {
  try {
    if (isSupabaseConfigured()) {
      // Strict RBAC Mandate: Only Pegawai Farmasi and Penolong Pegawai Farmasi can approve cylinder requests
      if (approverId) {
        const { data: approverUser } = await supabase
          .from('users')
          .select('id, full_name, jawatan, role:roles(role_code, role_name)')
          .eq('id', approverId)
          .maybeSingle();

        if (approverUser && !isCylinderAuthorizedOfficer(approverUser)) {
          return {
            data: null,
            error: 'Hanya Pegawai Farmasi dan Penolong Pegawai Farmasi yang dibenarkan meluluskan permohonan silinder oksigen.'
          };
        }
      }

      // 1. If adjusted item quantities are provided, update each item row in database
      if (adjustedItems && adjustedItems.length > 0) {
        for (const itm of adjustedItems) {
          const updatePayload: Record<string, any> = {
            quantity: itm.quantity
          };
          if (itm.quantity_issued !== undefined) {
            updatePayload.quantity_issued = itm.quantity_issued;
          }
          const { error: itmErr } = await supabase
            .from('pharmacy_oxygen_dept_request_items')
            .update(updatePayload)
            .eq('id', itm.id);
          
          if (itmErr) {
            console.warn('Error updating request item quantity during approval:', itmErr);
          }
        }
      }

      // 2. Update request status to 'approved'
      const { error } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      return { data: undefined, error: null };
    }
    return { data: undefined, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error approving request:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to approve request'
    };
  }
}

/**
 * Update request items / quantities with audit logging
 */
export async function updateRequestItems(
  requestId: string,
  userId: string,
  items: { id?: string; size_id?: string; size_code?: string; quantity: number; quantity_issued?: number; usage_notes?: string }[],
  reason?: string
): Promise<ApiResponse<void>> {
  try {
    if (isSupabaseConfigured()) {
      // 1. Fetch current items for audit comparison
      const { data: currentItems } = await supabase
        .from('pharmacy_oxygen_dept_request_items')
        .select('id, cylinder_size_id, quantity, quantity_issued, usage_notes, size_info:pharmacy_oxygen_cylinder_sizes(code)')
        .eq('request_id', requestId);

      const oldItemsSummary = (currentItems || []).map((ci: any) => ({
        id: ci.id,
        size_code: ci.size_info?.code || ci.cylinder_size_id,
        quantity: ci.quantity,
        quantity_issued: ci.quantity_issued,
        usage_notes: ci.usage_notes
      }));

      const activeIncomingItemIds = new Set(
        items.filter((i) => i.id && !i.id.startsWith('temp_') && i.quantity > 0).map((i) => i.id)
      );

      // 2. Delete items that were removed or have quantity <= 0
      for (const ci of currentItems || []) {
        if (!activeIncomingItemIds.has(ci.id)) {
          await supabase
            .from('pharmacy_oxygen_dept_request_items')
            .delete()
            .eq('id', ci.id);
        }
      }

      // 3. Update or insert remaining items
      for (const itm of items) {
        if (itm.quantity <= 0) continue;

        let cleanNotes = (itm.usage_notes || '').trim();
        const isStandard = ['101-N', '101-F', 'P101-F', 'P101-HS', 'P101-E', 'P101-D'].some(
          sc => sc === itm.size_code?.toUpperCase()
        );
        if (isStandard) {
          cleanNotes = cleanNotes.replace(/\[Saiz Khas:\s*[^\]]+\]/gi, '').trim();
        }

        if (itm.id && !itm.id.startsWith('temp_')) {
          const updatePayload: any = {
            quantity: itm.quantity,
            quantity_issued: itm.quantity_issued !== undefined ? itm.quantity_issued : itm.quantity,
            usage_notes: cleanNotes,
          };
          if (itm.size_id) {
            updatePayload.cylinder_size_id = itm.size_id;
          }
          await supabase
            .from('pharmacy_oxygen_dept_request_items')
            .update(updatePayload)
            .eq('id', itm.id);
        } else if (itm.size_id) {
          await supabase
            .from('pharmacy_oxygen_dept_request_items')
            .insert({
              request_id: requestId,
              cylinder_size_id: itm.size_id,
              quantity: itm.quantity,
              quantity_issued: itm.quantity_issued !== undefined ? itm.quantity_issued : itm.quantity,
              usage_notes: cleanNotes,
            });
        }
      }

      // 4. Update request timestamp
      await supabase
        .from('pharmacy_oxygen_dept_requests')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      // 5. Insert audit log
      const newItemsSummary = items.filter(i => i.quantity > 0).map((ni) => ({
        id: ni.id,
        size_code: ni.size_code,
        quantity: ni.quantity,
        quantity_issued: ni.quantity_issued !== undefined ? ni.quantity_issued : ni.quantity
      }));

      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId || null,
          action: 'UPDATE_REQUEST_ITEMS',
          module: 'cylinder',
          entity_type: 'pharmacy_oxygen_dept_requests',
          entity_id: requestId,
          old_values: { items: oldItemsSummary },
          new_values: { 
            items: newItemsSummary, 
            reason: reason || 'Item list and quantities adjusted by pharmacy officer' 
          },
          created_at: new Date().toISOString()
        });

      return { data: undefined, error: null };
    }
    return { data: undefined, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error updating request items:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update request items'
    };
  }
}

/**
 * Reject Request with reason
 */
export async function rejectRequest(
  requestId: string,
  approverId: string,
  reason: string
): Promise<ApiResponse<void>> {
  try {
    if (isSupabaseConfigured()) {
      // Strict RBAC Mandate: Only Pegawai Farmasi and Penolong Pegawai Farmasi can reject cylinder requests
      if (approverId) {
        const { data: approverUser } = await supabase
          .from('users')
          .select('id, full_name, jawatan, role:roles(role_code, role_name)')
          .eq('id', approverId)
          .maybeSingle();

        if (approverUser && !isCylinderAuthorizedOfficer(approverUser)) {
          return {
            data: null,
            error: 'Hanya Pegawai Farmasi dan Penolong Pegawai Farmasi yang dibenarkan menolak permohonan silinder oksigen.'
          };
        }
      }

      const { error } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .update({
          status: 'rejected',
          rejected_by: approverId,
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      return { data: undefined, error: null };
    }
    return { data: undefined, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error rejecting request:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to reject request'
    };
  }
}

/**
 * Issue cylinders (Pharmacy dispatches requested cylinders)
 */
export async function issueRequest(
  requestId: string,
  issuerId: string,
  items: { id: string; quantity_issued: number; cylinder_id?: string; cylinder_ids?: string[] }[]
): Promise<ApiResponse<void>> {
  try {
    if (isSupabaseConfigured()) {
      // Strict RBAC Mandate: Only Pegawai Farmasi and Penolong Pegawai Farmasi can issue cylinders
      if (issuerId) {
        const { data: issuerUser } = await supabase
          .from('users')
          .select('id, full_name, jawatan, role:roles(role_code, role_name)')
          .eq('id', issuerId)
          .maybeSingle();

        if (issuerUser && !isCylinderAuthorizedOfficer(issuerUser)) {
          return {
            data: null,
            error: 'Hanya Pegawai Farmasi dan Penolong Pegawai Farmasi yang dibenarkan mengeluarkan (dispatch) silinder oksigen.'
          };
        }
      }

      // 1. Fetch request details once
      const { data: request } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .select('department_id, request_id, hospital_id, is_external_facility, external_facility_name, manual_requester_name')
        .eq('id', requestId)
        .single();

      const isExternal = Boolean(
        request?.is_external_facility ||
        Boolean(request?.external_facility_name) ||
        request?.manual_requester_name?.includes('[EXTERNAL]')
      );

      // Pre-validation: verify all items with quantity_issued > 0 have exact matching cylinder serial IDs (internal requests only)
      if (!isExternal) {
        for (const item of items) {
          const assignedIds: string[] = [];
          if (item.cylinder_id) assignedIds.push(item.cylinder_id);
          if (item.cylinder_ids && Array.isArray(item.cylinder_ids)) {
            assignedIds.push(...item.cylinder_ids);
          }
          const uniqueIds = Array.from(new Set(assignedIds.filter(Boolean)));
          if (item.quantity_issued > 0 && uniqueIds.length < item.quantity_issued) {
            return {
              data: null,
              error: `Item memerlukan ${item.quantity_issued} nombor siri silinder, tetapi hanya ${uniqueIds.length} dibekalkan. Sila imbas atau pilih semua silinder sebelum pengesahan dispatch.`
            };
          }
        }
      }

      // 2. Update quantities issued and serials for each item
      for (const item of items) {
        // Combine cylinder_id and cylinder_ids into a list of unique cylinder IDs
        const assignedIds: string[] = [];
        if (item.cylinder_id) assignedIds.push(item.cylinder_id);
        if (item.cylinder_ids && Array.isArray(item.cylinder_ids)) {
          assignedIds.push(...item.cylinder_ids);
        }
        const uniqueIds = Array.from(new Set(assignedIds.filter(Boolean)));

        // If cylinders were selected, fetch their serial numbers to append/update usage_notes
        let serialsText = '';
        if (uniqueIds.length > 0) {
          const { data: cylList } = await supabase
            .from('pharmacy_oxygen_cylinder_inventory')
            .select('serial_number, qr_code')
            .in('id', uniqueIds);
          
          if (cylList && cylList.length > 0) {
            const serials = cylList.map((c: any) => c.serial_number || c.qr_code).filter(Boolean);
            if (serials.length > 0) {
              serialsText = `Serials (${serials.length}): ${serials.join(', ')}`;
            }
          }
        }

        const updateItemPayload: Record<string, any> = {
          quantity_issued: item.quantity_issued
        };
        if (serialsText) {
          const { data: currentItem } = await supabase
            .from('pharmacy_oxygen_dept_request_items')
            .select('usage_notes')
            .eq('id', item.id)
            .single();
          
          const existingNotes = currentItem?.usage_notes || '';
          if (!existingNotes.includes('Serials') && !existingNotes.includes('Siri')) {
            updateItemPayload.usage_notes = existingNotes ? `${serialsText} | ${existingNotes}` : serialsText;
          } else {
            const cleaned = existingNotes.replace(/(?:serials?(?:\s*\(\d+\))?|siri)\s*:\s*[^|]+/i, '').replace(/^[|\s]+|[|\s]+$/g, '').trim();
            updateItemPayload.usage_notes = cleaned ? `${serialsText} | ${cleaned}` : serialsText;
          }
        } else if (isExternal) {
          const { data: currentItem } = await supabase
            .from('pharmacy_oxygen_dept_request_items')
            .select('usage_notes')
            .eq('id', item.id)
            .single();
          
          const existingNotes = currentItem?.usage_notes || '';
          if (!existingNotes.includes('Indent Luar')) {
            const extTag = `[Indent Luar - ${request?.external_facility_name || 'Fasiliti Luar'}]`;
            updateItemPayload.usage_notes = existingNotes ? `${extTag} ${existingNotes}` : extTag;
          }
        }

        const { error: itemError } = await supabase
          .from('pharmacy_oxygen_dept_request_items')
          .update(updateItemPayload)
          .eq('id', item.id);

        if (itemError) throw itemError;

        // Log movement and update cylinder inventory for each assigned cylinder
        if (request && uniqueIds.length > 0) {
          for (const cid of uniqueIds) {
            await supabase
              .from('pharmacy_oxygen_cylinder_inventory')
              .update({
                status: 'issued',
                current_location: 'Department',
                department_id: request.department_id,
                updated_at: new Date().toISOString()
              })
              .eq('id', cid);

            await supabase
              .from('pharmacy_oxygen_cylinder_movements')
              .insert({
                hospital_id: request.hospital_id,
                cylinder_id: cid,
                movement_type: 'issued',
                from_location: 'Pharmacy Store',
                to_location: 'Department',
                department_id: request.department_id,
                moved_by: issuerId,
                moved_at: new Date().toISOString(),
                dept_request_id: requestId,
                remarks: `Dispatched via dept request ${request.request_id} [item:${item.id}]`
              });
          }
        }
      }

      // 3. Update Request Status to 'completed' / 'issued'
      const { error: reqError } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .update({
          status: 'completed',
          approved_by: issuerId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (reqError) throw reqError;

      return { data: undefined, error: null };
    }
    return { data: undefined, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error issuing cylinders:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to issue cylinders'
    };
  }
}

/**
 * Complete Request (Acknowledge receipt)
 */
export async function completeRequest(requestId: string): Promise<ApiResponse<void>> {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      return { data: undefined, error: null };
    }
    return { data: undefined, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error completing request:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to complete request'
    };
  }
}

/**
 * Cancel Request
 */
export async function cancelRequest(requestId: string): Promise<ApiResponse<void>> {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      return { data: undefined, error: null };
    }
    return { data: undefined, error: 'Supabase not configured' };
  } catch (error) {
    console.error('Error cancelling request:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to cancel request'
    };
  }
}

export const SECURITY_DISPATCH_DELETE_PASSWORD = 'F@rmasi.2016';

/**
 * Delete a cylinder dispatch/indent request with security password check and audit logging
 */
export async function deleteCylinderDispatchRequest(
  requestId: string,
  deletedByUserId: string,
  reason: string,
  securityPassword: string
): Promise<ApiResponse<void>> {
  try {
    // 1. Password Verification
    if (securityPassword !== SECURITY_DISPATCH_DELETE_PASSWORD) {
      return {
        data: null,
        error: 'Kata laluan keselamatan tidak sah. Sila masukkan kata laluan keselamatan yang sah.'
      };
    }

    if (!reason || !reason.trim()) {
      return {
        data: null,
        error: 'Sila berikan sebab atau justifikasi pemadaman rekod ini.'
      };
    }

    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Pangkalan data Supabase tidak dikonfigurasi' };
    }

    // 2. Fetch full request data snapshot before deletion for immutable audit trail
    const { data: request, error: fetchErr } = await supabase
      .from('pharmacy_oxygen_dept_requests')
      .select(`
        *,
        department:departments(id, department_name, department_code),
        requester:users!pharmacy_oxygen_dept_requests_requested_by_fkey(id, full_name, jawatan),
        approver:users!pharmacy_oxygen_dept_requests_approved_by_fkey(id, full_name, jawatan),
        items:pharmacy_oxygen_dept_request_items(
          id,
          request_id,
          cylinder_size_id,
          quantity,
          quantity_issued,
          usage_notes,
          size_info:pharmacy_oxygen_cylinder_sizes(id, code)
        )
      `)
      .eq('id', requestId)
      .single();

    if (fetchErr || !request) {
      return { data: null, error: 'Rekod permohonan tidak dijumpai atau telah dipadam.' };
    }

    // 3. Fetch user info for actor details in audit log
    let deletingUser: any = null;
    if (deletedByUserId) {
      const { data: u } = await supabase
        .from('users')
        .select('id, full_name, jawatan, email, role')
        .eq('id', deletedByUserId)
        .single();
      deletingUser = u;
    }

    // 4. Check for any cylinder movements linked to this request
    const { data: movements } = await supabase
      .from('pharmacy_oxygen_cylinder_movements')
      .select('id, cylinder_id')
      .eq('dept_request_id', requestId);

    // If cylinders were issued in these movements, revert their status back to available in Pharmacy Store
    if (movements && movements.length > 0) {
      const cylIds = movements.map((m: any) => m.cylinder_id).filter(Boolean);
      if (cylIds.length > 0) {
        await supabase
          .from('pharmacy_oxygen_cylinder_inventory')
          .update({
            status: 'available',
            current_location: 'Pharmacy Store',
            department_id: null,
            updated_at: new Date().toISOString()
          })
          .in('id', cylIds)
          .eq('status', 'issued');
      }

      // Delete the movements
      await supabase
        .from('pharmacy_oxygen_cylinder_movements')
        .delete()
        .eq('dept_request_id', requestId);
    }

    // 5. Delete request items
    const { error: itemsDelErr } = await supabase
      .from('pharmacy_oxygen_dept_request_items')
      .delete()
      .eq('request_id', requestId);

    if (itemsDelErr) throw itemsDelErr;

    // 6. Delete the main request row
    const { error: reqDelErr } = await supabase
      .from('pharmacy_oxygen_dept_requests')
      .delete()
      .eq('id', requestId);

    if (reqDelErr) throw reqDelErr;

    // 7. Write Audit Log to audit_logs table
    const auditPayload = {
      user_id: deletedByUserId || null,
      action: 'DELETE',
      module: 'mycylinder',
      entity_type: 'pharmacy_oxygen_dept_requests',
      entity_id: request.request_id || requestId,
      old_values: {
        request_number: request.request_id,
        status: request.status,
        department_name: request.department?.department_name || (request.is_external_facility ? 'Farmasi Logistik' : 'Stor Farmasi'),
        department_id: request.department_id,
        is_external_facility: request.is_external_facility,
        external_facility_name: request.external_facility_name,
        indent_direction: request.indent_direction,
        requester_name: request.requester?.full_name || request.manual_requester_name,
        issuer_name: request.approver?.full_name,
        remarks: request.remarks,
        created_at: request.created_at,
        approved_at: request.approved_at,
        items: (request.items || []).map((itm: any) => ({
          size_code: itm.size_info?.code || itm.size_code,
          quantity_requested: itm.quantity,
          quantity_issued: itm.quantity_issued,
          usage_notes: itm.usage_notes
        })),
        deleted_by_name: deletingUser?.full_name || 'Staff Farmasi',
        deleted_by_jawatan: deletingUser?.jawatan || 'Pegawai / Penolong Pegawai Farmasi',
        deletion_reason: reason.trim(),
        security_auth: 'PASSWORD_VERIFIED (F@rmasi.2016)',
        deleted_at: new Date().toISOString()
      },
      new_values: null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'H.O.M.E. System Desktop Client'
    };

    try {
      await supabase.from('audit_logs').insert(auditPayload);
    } catch (logErr) {
      console.warn('Audit log write error (non-blocking):', logErr);
    }

    return { data: undefined, error: null };
  } catch (error) {
    console.error('Error deleting cylinder dispatch request:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Gagal memadam permohonan silinder'
    };
  }
}

