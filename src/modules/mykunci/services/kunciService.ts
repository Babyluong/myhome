// src/modules/mykunci/services/kunciService.ts
// MyKunci integrated key management service with Supabase and localStorage fallback

import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { offlineAdapter } from '@/services/offlineAdapter';
import { mockUsers } from '@/services/mockData';
import { recordAuditLog } from '@/services/auditLogService';
import type { ApiResponse } from '@/types';
import type {
  KunciDaftar,
  KunciLog,
  KunciAuditBulanan,
  KunciStatus,
  SampulStatus,
  KeadaanKunci,
  KeadaanMangga,
  AuditFizikal
} from '@/shared/types/mykunci';

// Helper to resolve user details
const resolveStaffUser = (userId?: string) => {
  if (!userId) return undefined;
  const found = mockUsers.find(
    (u) =>
      u.id === userId ||
      u.ic_number === userId ||
      u.email === userId ||
      u.full_name.toLowerCase().includes(userId.toLowerCase())
  );
  if (found) return found as any;
  return {
    id: userId,
    full_name: userId,
    jawatan: 'Pegawai Bertugas',
    email: '',
    phone_number: '',
    role_id: 'pharmacist',
    department_id: '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880',
    hospital_id: 'hosp-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any;
};

// ============================================
// LOCAL STORAGE MOCK DATA SYSTEM
// ============================================
const STORAGE_PREFIX = 'mykunci_mock_v3_';

const getMockData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  return data ? JSON.parse(data) : defaultValue;
};

const setMockData = <T>(key: string, value: T): void => {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
};

// Initial Keys Master Data matching database
export const INITIAL_REAL_KUNCI: KunciDaftar[] = [
  {
    id: '2cc6f5a1-bc47-4c34-aa13-8d47e1aeddcd',
    kod_kunci: 'PHAR-LOG-01',
    nama_kunci: 'Stor Silinder Oksigen',
    department_id: '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880',
    lokasi_fizikal: 'Farmasi Logistik',
    jenis_kunci: 'room',
    tahap_kawalan: 'normal',
    status: 'available',
    nombor_peti: 'Farmasi Logistik',
    status_sampul: 'not_applicable',
    penjaga_id: '88dc2fa7-e943-45ba-a889-8756c0265b48',
    hospital_id: '85bb6adc-b868-428b-83f4-e5af2f5cf904',
    created_at: '2026-07-09T07:58:17.816800Z',
    updated_at: '2026-07-13T01:57:42.299442Z',
  }
];

// Initial Movement Logs matching real database transactions
export const INITIAL_REAL_LOGS: KunciLog[] = [
  {
    id: '7f85b47e-5718-47af-a5cf-26f03e84a888',
    kunci_id: '2cc6f5a1-bc47-4c34-aa13-8d47e1aeddcd',
    peminjam_id: '88dc2fa7-e943-45ba-a889-8756c0265b48',
    pegawai_penyerah_id: '88dc2fa7-e943-45ba-a889-8756c0265b48',
    pegawai_saksi_id: undefined,
    tarikh_masa_ambil: '2026-07-09T08:06:21.046Z',
    jangka_masa_pulang: '2026-07-10T08:06:21.046Z',
    tarikh_masa_pulang: undefined,
    pegawai_penerima_id: undefined,
    keadaan_kunci: 'good',
    keadaan_mangga: 'good',
    tujuan: 'kira oksigen',
    catatan_penggunaan: undefined,
    duration_seconds: undefined,
    is_overdue: false,
    hospital_id: '85bb6adc-b868-428b-83f4-e5af2f5cf904',
    created_at: '2026-07-09T08:06:35.251832Z',
    updated_at: '2026-07-09T08:06:35.251832Z',
  }
];

// Seed initial fallback data if empty
const initMockData = () => {
  if (!localStorage.getItem(STORAGE_PREFIX + 'kunci_daftar')) {
    setMockData('kunci_daftar', INITIAL_REAL_KUNCI);
    setMockData('kunci_log', INITIAL_REAL_LOGS);
    setMockData('kunci_audit_bulanan', []);
  }
};

// Initialize fallback data
initMockData();

// ============================================
// API SERVICE LAYER
// ============================================

export const getKunciDaftar = async (departmentId?: string): Promise<ApiResponse<KunciDaftar[]>> => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  if (!isOnline) {
    try {
      const cached = await offlineAdapter.getCache<KunciDaftar>('kunci_daftar')
      if (cached && cached.length > 0) {
        let list = cached
        if (departmentId) {
          list = list.filter((k) => k.department_id === departmentId)
        }
        return { data: list, error: null }
      }
    } catch (_) {}
  }

  if (!isSupabaseConfigured()) {
    let list = getMockData<KunciDaftar[]>('kunci_daftar', []);
    if (departmentId) {
      list = list.filter((k) => k.department_id === departmentId);
    }
    return { data: list, error: null };
  }

  try {
    let query = supabase.from('kunci_daftar').select(`
      *,
      department:departments(*),
      penjaga:users!penjaga_id(*)
    `);

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data, error } = await query.order('kod_kunci', { ascending: true });
    if (error) throw error;

    if (data && data.length > 0) {
      void offlineAdapter.setCache('kunci_daftar', data)
    }

    return { data: data as KunciDaftar[], error: null };
  } catch (error: any) {
    console.warn('getKunciDaftar error, trying offline cache:', error);
    try {
      const cached = await offlineAdapter.getCache<KunciDaftar>('kunci_daftar')
      if (cached && cached.length > 0) {
        let list = cached
        if (departmentId) {
          list = list.filter((k) => k.department_id === departmentId)
        }
        return { data: list, error: null }
      }
    } catch (_) {}
    return { data: null, error: error?.message || 'Failed to fetch registered keys' };
  }
};

export const getKunciById = async (id: string): Promise<ApiResponse<KunciDaftar>> => {
  if (!isSupabaseConfigured()) {
    const list = getMockData<KunciDaftar[]>('kunci_daftar', []);
    const key = list.find((k) => k.id === id);
    if (!key) return { data: null, error: 'Key not found' };
    return { data: key, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('kunci_daftar')
      .select(`
        *,
        department:departments(*),
        penjaga:users!penjaga_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: data as KunciDaftar, error: null };
  } catch (error: any) {
    console.error('getKunciById error:', error);
    return { data: null, error: error?.message || 'Failed to fetch key details' };
  }
};

export const addKunci = async (
  kunci: Omit<KunciDaftar, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<KunciDaftar>> => {
  if (!isSupabaseConfigured()) {
    const list = getMockData<KunciDaftar[]>('kunci_daftar', []);
    const newKunci: KunciDaftar = {
      ...kunci,
      id: `kunci-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newKunci);
    setMockData('kunci_daftar', list);
    return { data: newKunci, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('kunci_daftar')
      .insert([kunci])
      .select()
      .single();

    if (error) throw error;
    return { data: data as KunciDaftar, error: null };
  } catch (error: any) {
    console.error('addKunci error:', error);
    return { data: null, error: error?.message || 'Failed to register key' };
  }
};

export const updateKunci = async (
  id: string,
  kunci: Partial<KunciDaftar>
): Promise<ApiResponse<KunciDaftar>> => {
  const isAvailableOrInactive = kunci.status && ['available', 'damaged', 'lost'].includes(kunci.status);

  if (!isSupabaseConfigured()) {
    const list = getMockData<KunciDaftar[]>('kunci_daftar', []);
    const index = list.findIndex((k) => k.id === id);
    if (index === -1) return { data: null, error: 'Key not found' };

    const updated = {
      ...list[index],
      ...kunci,
      updated_at: new Date().toISOString(),
    };
    list[index] = updated;
    setMockData('kunci_daftar', list);

    // If status changed to available/damaged/lost, close active logs
    if (isAvailableOrInactive) {
      const logs = getMockData<KunciLog[]>('kunci_log', []);
      let logsUpdated = false;
      const updatedLogs = logs.map(l => {
        if (l.kunci_id === id && !l.tarikh_masa_pulang) {
          logsUpdated = true;
          const returnTime = new Date();
          const takeTime = new Date(l.tarikh_masa_ambil).getTime();
          const durationSeconds = Math.max(0, Math.floor((returnTime.getTime() - takeTime) / 1000));
          const etaTime = new Date(l.jangka_masa_pulang).getTime();
          return {
            ...l,
            tarikh_masa_pulang: returnTime.toISOString(),
            duration_seconds: durationSeconds,
            is_overdue: returnTime.getTime() > etaTime,
            updated_at: returnTime.toISOString()
          };
        }
        return l;
      });
      if (logsUpdated) {
        setMockData('kunci_log', updatedLogs);
      }
    }

    return { data: updated, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('kunci_daftar')
      .update(kunci)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If status changed to available/damaged/lost, close active logs in Supabase
    if (isAvailableOrInactive) {
      const nowStr = new Date().toISOString();
      // We don't have a simple way to calculate duration_seconds directly in an update query without fetching,
      // but setting tarikh_masa_pulang is the main trigger for closing the log.
      await supabase
        .from('kunci_log')
        .update({ 
          tarikh_masa_pulang: nowStr,
          updated_at: nowStr
        })
        .eq('kunci_id', id)
        .is('tarikh_masa_pulang', null);
    }

    return { data: data as KunciDaftar, error: null };
  } catch (error: any) {
    console.error('updateKunci error:', error);
    return { data: null, error: error?.message || 'Failed to update key details' };
  }
};

export const deleteKunci = async (id: string): Promise<ApiResponse<boolean>> => {
  if (!isSupabaseConfigured()) {
    const list = getMockData<KunciDaftar[]>('kunci_daftar', []);
    const filtered = list.filter((k) => k.id !== id);
    setMockData('kunci_daftar', filtered);

    // Clean up logs for deleted key
    const logs = getMockData<KunciLog[]>('kunci_log', []);
    const filteredLogs = logs.filter((l) => l.kunci_id !== id);
    setMockData('kunci_log', filteredLogs);

    return { data: true, error: null };
  }

  try {
    // Delete logs first to avoid foreign key violations, or trust cascade
    await supabase.from('kunci_log').delete().eq('kunci_id', id);
    
    const { error } = await supabase.from('kunci_daftar').delete().eq('id', id);
    if (error) throw error;
    return { data: true, error: null };
  } catch (error: any) {
    console.error('deleteKunci error:', error);
    return { data: false, error: error?.message || 'Failed to delete key' };
  }
};

export const getKunciLogs = async (kunciId?: string): Promise<ApiResponse<KunciLog[]>> => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  if (!isOnline) {
    try {
      const cached = await offlineAdapter.getCache<KunciLog>('kunci_log', 'kunci', 'kunci_log')
      if (cached && cached.length > 0) {
        let list = cached
        if (kunciId) list = list.filter((l) => l.kunci_id === kunciId)
        return { data: list, error: null }
      }
    } catch (_) {}
  }

  if (isSupabaseConfigured() && isOnline) {
    try {
      let query = supabase.from('kunci_log').select(`
        *,
        kunci:kunci_daftar(
          *,
          department:departments(*)
        ),
        peminjam:users!peminjam_id(*),
        pegawai_penyerah:users!pegawai_penyerah_id(*),
        pegawai_saksi:users!pegawai_saksi_id(*),
        pegawai_penerima:users!pegawai_penerima_id(*)
      `);

      if (kunciId) {
        query = query.eq('kunci_id', kunciId);
      }

      const { data, error } = await query.order('tarikh_masa_ambil', { ascending: false });
      if (!error && Array.isArray(data)) {
        if (data.length > 0 && !kunciId) {
          void offlineAdapter.setCache('kunci_log', data)
        }
        return { data: data as KunciLog[], error: null };
      }
    } catch (error: any) {
      console.warn('Supabase fetch kunci_log error, checking cache:', error);
      try {
        const cached = await offlineAdapter.getCache<KunciLog>('kunci_log', 'kunci', 'kunci_log')
        if (cached && cached.length > 0) {
          let list = cached
          if (kunciId) list = list.filter((l) => l.kunci_id === kunciId)
          return { data: list, error: null }
        }
      } catch (_) {}
    }
  }

  // Local fallback ONLY if Supabase is offline
  let localLogs = getMockData<KunciLog[]>('kunci_log', INITIAL_REAL_LOGS);
  const localKeys = getMockData<KunciDaftar[]>('kunci_daftar', INITIAL_REAL_KUNCI);

  localLogs = localLogs.map((log) => ({
    ...log,
    kunci: log.kunci || localKeys.find((k) => k.id === log.kunci_id) || INITIAL_REAL_KUNCI.find((k) => k.id === log.kunci_id),
    peminjam: log.peminjam || resolveStaffUser(log.peminjam_id),
    pegawai_penyerah: log.pegawai_penyerah || resolveStaffUser(log.pegawai_penyerah_id),
    pegawai_saksi: log.pegawai_saksi || resolveStaffUser(log.pegawai_saksi_id),
    pegawai_penerima: log.pegawai_penerima || resolveStaffUser(log.pegawai_penerima_id),
  }));

  if (kunciId) {
    localLogs = localLogs.filter((l) => l.kunci_id === kunciId);
  }

  localLogs.sort((a, b) => new Date(b.tarikh_masa_ambil).getTime() - new Date(a.tarikh_masa_ambil).getTime());
  return { data: localLogs, error: null };
};

export const checkoutKunci = async (
  log: Omit<KunciLog, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<KunciLog>> => {
  let createdLog: KunciLog;

  if (!isSupabaseConfigured()) {
    // 1. Save log
    const logs = getMockData<KunciLog[]>('kunci_log', INITIAL_REAL_LOGS);
    createdLog = {
      ...log,
      id: `log-${Date.now()}`,
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    logs.unshift(createdLog);
    setMockData('kunci_log', logs);

    // 2. Update status of key in register to 'borrowed'
    const keys = getMockData<KunciDaftar[]>('kunci_daftar', INITIAL_REAL_KUNCI);
    const keyIndex = keys.findIndex((k) => k.id === log.kunci_id);
    if (keyIndex !== -1) {
      keys[keyIndex].status = 'borrowed';
      keys[keyIndex].updated_at = new Date().toISOString();
      setMockData('kunci_daftar', keys);
    }
  } else {
    try {
      const res = await offlineAdapter.executeMutation<KunciLog>({
        module: 'mykunci',
        table: 'kunci_log',
        action: 'INSERT',
        payload: {
          ...log,
          is_overdue: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        conflictPolicy: 'server-wins',
      });

      if (res.error) throw res.error;
      createdLog = (res.data || { ...log, id: `log-${Date.now()}` }) as KunciLog;

      await offlineAdapter.executeMutation({
        module: 'mykunci',
        table: 'kunci_daftar',
        action: 'UPDATE',
        payload: { status: 'borrowed', updated_at: new Date().toISOString() },
        matchCriteria: { id: log.kunci_id },
        conflictPolicy: 'server-wins',
      });
    } catch (error: any) {
      console.error('checkoutKunci error:', error);
      return { data: null, error: error?.message || 'Failed to record checkout transaction' };
    }
  }

  // Real-time synchronization: record audit log in System Logs
  try {
    const keyObj = INITIAL_REAL_KUNCI.find((k) => k.id === log.kunci_id);
    const borrower = resolveStaffUser(log.peminjam_id);
    recordAuditLog({
      userId: log.peminjam_id,
      action: 'CREATE',
      module: 'mykunci',
      entityType: 'kunci_log',
      entityId: createdLog.id,
      newValues: {
        key_name: keyObj?.nama_kunci || 'Kunci Fizikal',
        borrower: borrower?.full_name || log.peminjam_id,
        purpose: log.tujuan,
        description: `Pinjaman ${keyObj?.nama_kunci || 'kunci'} oleh ${borrower?.full_name || 'kakitangan'} untuk "${log.tujuan}".`,
      },
    });
  } catch (auditErr) {
    console.warn('Failed to record audit log for key checkout:', auditErr);
  }

  return { data: createdLog, error: null };
};

export const returnKunci = async (
  logId: string,
  returnData: {
    tarikh_masa_pulang: string;
    pegawai_penerima_id: string;
    keadaan_kunci: KeadaanKunci;
    keadaan_mangga: KeadaanMangga;
    catatan_penggunaan?: string;
  }
): Promise<ApiResponse<KunciLog>> => {
  let updatedLog: KunciLog;
  let targetKunciId: string | undefined;

  if (!isSupabaseConfigured()) {
    const logs = getMockData<KunciLog[]>('kunci_log', INITIAL_REAL_LOGS);
    const logIndex = logs.findIndex((l) => l.id === logId);
    if (logIndex === -1) return { data: null, error: 'Checkout record not found' };

    const originalLog = logs[logIndex];
    targetKunciId = originalLog.kunci_id;
    const takeTime = new Date(originalLog.tarikh_masa_ambil).getTime();
    const returnTime = new Date(returnData.tarikh_masa_pulang).getTime();
    const durationSeconds = Math.max(0, Math.floor((returnTime - takeTime) / 1000));
    
    const etaTime = new Date(originalLog.jangka_masa_pulang).getTime();
    const isOverdue = returnTime > etaTime;

    updatedLog = {
      ...originalLog,
      ...returnData,
      duration_seconds: durationSeconds,
      is_overdue: isOverdue,
      updated_at: new Date().toISOString(),
    };
    logs[logIndex] = updatedLog;
    setMockData('kunci_log', logs);

    // Set key status back to 'available'
    const keys = getMockData<KunciDaftar[]>('kunci_daftar', INITIAL_REAL_KUNCI);
    const keyIndex = keys.findIndex((k) => k.id === originalLog.kunci_id);
    if (keyIndex !== -1) {
      keys[keyIndex].status = 'available';
      keys[keyIndex].updated_at = new Date().toISOString();
      setMockData('kunci_daftar', keys);
    }
  } else {
    try {
      const { data: originalLog, error: fetchError } = await supabase
        .from('kunci_log')
        .select('*')
        .eq('id', logId)
        .single();

      if (fetchError) throw fetchError;
      targetKunciId = originalLog.kunci_id;

      const takeTime = new Date(originalLog.tarikh_masa_ambil).getTime();
      const returnTime = new Date(returnData.tarikh_masa_pulang).getTime();
      const durationSeconds = Math.max(0, Math.floor((returnTime - takeTime) / 1000));
      const etaTime = new Date(originalLog.jangka_masa_pulang).getTime();
      const isOverdue = returnTime > etaTime;

      const res = await offlineAdapter.executeMutation<KunciLog>({
        module: 'mykunci',
        table: 'kunci_log',
        action: 'UPDATE',
        payload: {
          tarikh_masa_pulang: returnData.tarikh_masa_pulang,
          pegawai_penerima_id: returnData.pegawai_penerima_id,
          keadaan_kunci: returnData.keadaan_kunci,
          keadaan_mangga: returnData.keadaan_mangga,
          catatan_penggunaan: returnData.catatan_penggunaan,
          duration_seconds: durationSeconds,
          is_overdue: isOverdue,
          updated_at: new Date().toISOString(),
        },
        matchCriteria: { id: logId },
        conflictPolicy: 'server-wins',
      });

      if (res.error) throw res.error;
      updatedLog = (res.data || { id: logId, ...returnData }) as KunciLog;

      if (targetKunciId) {
        await offlineAdapter.executeMutation({
          module: 'mykunci',
          table: 'kunci_daftar',
          action: 'UPDATE',
          payload: { status: 'available', updated_at: new Date().toISOString() },
          matchCriteria: { id: targetKunciId },
          conflictPolicy: 'server-wins',
        });
      }
    } catch (error: any) {
      console.error('returnKunci error:', error);
      return { data: null, error: error?.message || 'Failed to record key return' };
    }
  }

  // Real-time synchronization: record audit log in System Logs
  try {
    const keyObj = INITIAL_REAL_KUNCI.find((k) => k.id === targetKunciId);
    const receiver = resolveStaffUser(returnData.pegawai_penerima_id);
    recordAuditLog({
      userId: returnData.pegawai_penerima_id,
      action: 'UPDATE',
      module: 'mykunci',
      entityType: 'kunci_log',
      entityId: logId,
      newValues: {
        status: 'completed',
        key_name: keyObj?.nama_kunci || 'Kunci Fizikal',
        remarks: returnData.catatan_penggunaan || 'Kunci dipulangkan dalam keadaan baik',
        description: `Pemulangan ${keyObj?.nama_kunci || 'kunci'} telah disahkan diterima oleh ${receiver?.full_name || 'pegawai penerima'}.`,
      },
    });
  } catch (auditErr) {
    console.warn('Failed to record audit log for key return:', auditErr);
  }

  return { data: updatedLog, error: null };
};

export const getKunciAudits = async (kunciId?: string): Promise<ApiResponse<KunciAuditBulanan[]>> => {
  if (!isSupabaseConfigured()) {
    let audits = getMockData<KunciAuditBulanan[]>('kunci_audit_bulanan', []);
    const keys = getMockData<KunciDaftar[]>('kunci_daftar', []);
    
    // Enrich with keys relationship
    audits = audits.map(audit => {
      const keyObj = keys.find(k => k.id === audit.kunci_id);
      return {
        ...audit,
        kunci: keyObj
      };
    });

    if (kunciId) {
      audits = audits.filter((a) => a.kunci_id === kunciId);
    }

    audits.sort((a, b) => new Date(b.tarikh_audit).getTime() - new Date(a.tarikh_audit).getTime());
    return { data: audits, error: null };
  }

  try {
    let query = supabase.from('kunci_audit_bulanan').select(`
      *,
      kunci:kunci_daftar(
        *,
        department:departments(*)
      ),
      auditor:users!auditor_id(*)
    `);

    if (kunciId) {
      query = query.eq('kunci_id', kunciId);
    }

    const { data, error } = await query.order('tarikh_audit', { ascending: false });
    if (error) throw error;
    return { data: data as KunciAuditBulanan[], error: null };
  } catch (error: any) {
    console.error('getKunciAudits error:', error);
    return { data: null, error: error?.message || 'Failed to fetch audit records' };
  }
};

export const addKunciAudit = async (
  audit: Omit<KunciAuditBulanan, 'id' | 'created_at'>
): Promise<ApiResponse<KunciAuditBulanan>> => {
  if (!isSupabaseConfigured()) {
    const list = getMockData<KunciAuditBulanan[]>('kunci_audit_bulanan', []);
    const newAudit: KunciAuditBulanan = {
      ...audit,
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    list.push(newAudit);
    setMockData('kunci_audit_bulanan', list);

    // If audit checks a duplicate key envelope, update key status_sampul
    const keys = getMockData<KunciDaftar[]>('kunci_daftar', []);
    const keyIndex = keys.findIndex((k) => k.id === audit.kunci_id);
    if (keyIndex !== -1 && keys[keyIndex].jenis_kunci === 'room' && keys[keyIndex].status_sampul !== 'not_applicable') {
      keys[keyIndex].status_sampul = audit.sampul_bermeterai_utuh ? 'sealed' : 'broken';
      keys[keyIndex].updated_at = new Date().toISOString();
      setMockData('kunci_daftar', keys);
    }

    return { data: newAudit, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('kunci_audit_bulanan')
      .insert([audit])
      .select()
      .single();

    if (error) throw error;

    // Update status envelope if needed
    const { data: keyDetails } = await supabase.from('kunci_daftar').select('status_sampul').eq('id', audit.kunci_id).single();
    if (keyDetails && keyDetails.status_sampul !== 'not_applicable') {
      const nextStatus: SampulStatus = audit.sampul_bermeterai_utuh ? 'sealed' : 'broken';
      await supabase.from('kunci_daftar').update({ status_sampul: nextStatus }).eq('id', audit.kunci_id);
    }

    return { data: data as KunciAuditBulanan, error: null };
  } catch (error: any) {
    console.error('addKunciAudit error:', error);
    return { data: null, error: error?.message || 'Failed to record audit entry' };
  }
};

export const getKunciByKod = async (kodKunci: string): Promise<ApiResponse<KunciDaftar>> => {
  if (!isSupabaseConfigured()) {
    const list = getMockData<KunciDaftar[]>('kunci_daftar', []);
    const key = list.find((k) => k.kod_kunci.toUpperCase() === kodKunci.toUpperCase());
    if (!key) return { data: null, error: 'Key not found' };
    return { data: key, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('kunci_daftar')
      .select(`
        *,
        department:departments(*),
        penjaga:users!penjaga_id(*)
      `)
      .eq('kod_kunci', kodKunci.toUpperCase())
      .single();

    if (error) throw error;
    return { data: data as KunciDaftar, error: null };
  } catch (error: any) {
    console.error('getKunciByKod error:', error);
    return { data: null, error: error?.message || 'Failed to fetch key details by code' };
  }
};

export const getActiveLogByKunciId = async (kunciId: string): Promise<ApiResponse<KunciLog>> => {
  if (!isSupabaseConfigured()) {
    const logs = getMockData<KunciLog[]>('kunci_log', []);
    const activeLog = logs.find((l) => l.kunci_id === kunciId && !l.tarikh_masa_pulang);
    if (!activeLog) return { data: null, error: 'No active checkout log found' };
    
    const keys = getMockData<KunciDaftar[]>('kunci_daftar', []);
    const keyObj = keys.find(k => k.id === activeLog.kunci_id);
    return { 
      data: {
        ...activeLog,
        kunci: keyObj
      }, 
      error: null 
    };
  }

  try {
    const { data, error } = await supabase
      .from('kunci_log')
      .select(`
        *,
        kunci:kunci_daftar(
          *,
          department:departments(*)
        ),
        peminjam:users!peminjam_id(*),
        pegawai_penyerah:users!pegawai_penyerah_id(*),
        pegawai_saksi:users!pegawai_saksi_id(*),
        pegawai_penerima:users!pegawai_penerima_id(*)
      `)
      .eq('kunci_id', kunciId)
      .is('tarikh_masa_pulang', null)
      .single();

    if (error) throw error;
    return { data: data as KunciLog, error: null };
  } catch (error: any) {
    console.error('getActiveLogByKunciId error:', error);
    return { data: null, error: error?.message || 'Failed to fetch active key log' };
  }
};
