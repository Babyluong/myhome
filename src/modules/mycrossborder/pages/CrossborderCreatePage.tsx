import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  User, 
  Users, 
  Calendar, 
  HeartHandshake,
  CheckSquare,
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Ambulance } from '@/modules/mytransporter/components/AmbulanceIcon';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/stores/toastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { createCrossborderTransfer, submitCrossborderTransfer } from '../services/crossborderService';
import { getVehicles, getUnlinkedTransportRequests } from '@/modules/mytransporter/services/transporterService';
import type { TransportRequest } from '@/shared/types/mytransporter';

import type { 
  CrossborderJenisKenderaan, 
  JenisDokumen, 
  Jantina,
  JenisPengiring
} from '@/shared/types/mycrossborder';
import { Card, CardContent, Button } from '@/components/ui';

interface PatientFormState {
  nama: string;
  jantina: Jantina;
  tarikh_lahir: string;
  warganegara: string;
  jenis_dokumen: JenisDokumen;
  no_dokumen: string;
  no_pengenalan: string;
  passport_expiry?: string;
}

interface KkmEscortForm {
  nama: string;
  jenis_dokumen: JenisDokumen;
  no_dokumen: string;
  jawatan: string;
  passport_expiry?: string;
}

interface WarisEscortForm {
  nama: string;
  jenis_dokumen: JenisDokumen;
  no_dokumen: string;
  hubungan: string;
  passport_expiry?: string;
}


export const CrossborderCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  
  const hospitalId = user?.hospital_id || 'hosp-1';
  const userId = user?.id || 'user-1';
  const userName = user?.full_name || 'Dr. Jason Ling';

  // State for Form fields
  const [destinationHospital, setDestinationHospital] = useState('Hospital Limbang');
  const [tarikhPerjalanan, setTarikhPerjalanan] = useState('');
  const [masaBerlepas, setMasaBerlepas] = useState('');
  const [noPendaftaran, setNoPendaftaran] = useState('');
  const [pemanduNama, setPemanduNama] = useState('');
  const [pemanduPassport, setPemanduPassport] = useState('');
  const [pemanduPassportExpiry, setPemanduPassportExpiry] = useState('');
  const [peralatanLain, setPeralatanLain] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState('');
  const [doktorPerujukNama, setDoktorPerujukNama] = useState(userName);
  const [catatan, setCatatan] = useState('');

  // Transporter integration states
  const [linkedRequestId, setLinkedRequestId] = useState<string>('');
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Dynamic lists
  const [patients, setPatients] = useState<PatientFormState[]>([
    { nama: '', jantina: 'Lelaki', tarikh_lahir: '', warganegara: 'Malaysia', jenis_dokumen: 'PASSPORT', no_dokumen: '', no_pengenalan: '', passport_expiry: '' }
  ]);
  const [kkmEscorts, setKkmEscorts] = useState<KkmEscortForm[]>([]);
  const [isKkmAutoFilled, setIsKkmAutoFilled] = useState(false);
  const [warisEscorts, setWarisEscorts] = useState<(WarisEscortForm | null)[]>([null]);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    const fetchVehiclesAndRequests = async () => {
      try {
        const [vehRes, reqRes] = await Promise.all([
          getVehicles(),
          getUnlinkedTransportRequests()
        ]);

        if (vehRes.data) {
          const activeAmbulances = vehRes.data.filter(
            (v: any) => v.status === 'active' && (v.jenis_kenderaan === 'ambulance' || v.jenis_kenderaan === 'Ambulance')
          );
          const list = activeAmbulances.length > 0 ? activeAmbulances : vehRes.data.filter((v: any) => v.status === 'active');
          setVehicles(list);
          if (list.length > 0) {
            setNoPendaftaran(list[0].no_kenderaan);
          }
        }

        if (reqRes.data) {
          setTransportRequests(reqRes.data);
        }
      } catch (err) {
        console.error('Failed to load initial data', err);
      } finally {
        setLoadingVehicles(false);
        setLoadingRequests(false);
      }
    };
    fetchVehiclesAndRequests();
  }, []);

  const handleLinkRequestChange = (requestId: string) => {
    setLinkedRequestId(requestId);
    if (!requestId) {
      setIsKkmAutoFilled(false);
      setKkmEscorts([]);
      return;
    }

    const selectedReq = transportRequests.find(r => r.id === requestId);
    if (selectedReq) {
      if (selectedReq.tarikh_masa_diperlukan) {
        const dt = new Date(selectedReq.tarikh_masa_diperlukan);
        const dateStr = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
        const timeStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
        setTarikhPerjalanan(dateStr);
        setMasaBerlepas(timeStr);
      }

      if (selectedReq.destinasi) {
        setDestinationHospital(selectedReq.destinasi);
      }

      if (selectedReq.kenderaan?.no_kenderaan) {
        setNoPendaftaran(selectedReq.kenderaan.no_kenderaan);
      }

      if (selectedReq.pemandu?.full_name) {
        setPemanduNama(selectedReq.pemandu.full_name.toUpperCase());
      }

      if (selectedReq.nama_pesakit) {
        const matchedGender = selectedReq.jantina_pesakit === 'Perempuan' || selectedReq.jantina_pesakit === 'F' ? 'Perempuan' : 'Lelaki';
        setPatients([
          {
            nama: selectedReq.nama_pesakit.toUpperCase(),
            jantina: matchedGender as Jantina,
            tarikh_lahir: '',
            warganegara: 'Malaysia',
            jenis_dokumen: 'PASSPORT',
            no_dokumen: '',
            no_pengenalan: selectedReq.rn_pesakit || '',
            passport_expiry: ''
          }
        ]);
        setWarisEscorts([null]);
      }

      if (selectedReq.pengiring_list && selectedReq.pengiring_list.length > 0) {
        const mappedKkm = selectedReq.pengiring_list.map(e => ({
          nama: e.name.toUpperCase(),
          jenis_dokumen: 'IC' as JenisDokumen,
          no_dokumen: '',
          jawatan: e.job,
          passport_expiry: ''
        }));
        setKkmEscorts(mappedKkm);
        setIsKkmAutoFilled(true);
      } else {
        setKkmEscorts([]);
        setIsKkmAutoFilled(false);
      }
    }
  };

  const handleAddPatient = () => {
    if (patients.length >= 3) {
      toast.warning(
        language === 'ms' ? 'Had Pesakit' : 'Patient Limit',
        language === 'ms' 
          ? 'Satu perjalanan ambulans merentasi sempadan dihadkan kepada 3 kes pesakit sahaja.'
          : 'A single cross-border ambulance trip is limited to a maximum of 3 patient cases.'
      );
      return;
    }
    setPatients([...patients, { nama: '', jantina: 'Lelaki', tarikh_lahir: '', warganegara: 'Malaysia', jenis_dokumen: 'PASSPORT', no_dokumen: '', no_pengenalan: '', passport_expiry: '' }]);
    setWarisEscorts([...warisEscorts, null]);
  };

  const handleRemovePatient = (index: number) => {
    if (patients.length <= 1) {
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        language === 'ms' ? 'Sekurang-kurangnya seorang pesakit diperlukan.' : 'At least one patient is required.'
      );
      return;
    }
    setPatients(patients.filter((_, i) => i !== index));
    setWarisEscorts(warisEscorts.filter((_, i) => i !== index));
  };

  const handlePatientChange = (index: number, field: keyof PatientFormState, value: string) => {
    const updated = [...patients];
    updated[index] = { ...updated[index], [field]: value };
    setPatients(updated);
  };

  const handleAddKkmEscort = () => {
    setKkmEscorts([...kkmEscorts, { nama: '', jenis_dokumen: 'IC', no_dokumen: '', jawatan: 'nurse', passport_expiry: '' }]);
  };

  const handleRemoveKkmEscort = (index: number) => {
    setKkmEscorts(kkmEscorts.filter((_, i) => i !== index));
  };

  const handleKkmEscortChange = (index: number, field: keyof KkmEscortForm, value: string) => {
    const updated = [...kkmEscorts];
    updated[index] = { ...updated[index], [field]: value };
    setKkmEscorts(updated);
  };

  const handleAddWaris = (patientIdx: number) => {
    const updated = [...warisEscorts];
    updated[patientIdx] = { nama: '', jenis_dokumen: 'PASSPORT', no_dokumen: '', hubungan: 'Adik-beradik', passport_expiry: '' };
    setWarisEscorts(updated);
  };

  const handleRemoveWaris = (patientIdx: number) => {
    const updated = [...warisEscorts];
    updated[patientIdx] = null;
    setWarisEscorts(updated);
  };

  const handleWarisChange = (patientIdx: number, field: keyof WarisEscortForm, value: string) => {
    const updated = [...warisEscorts];
    if (updated[patientIdx]) {
      updated[patientIdx] = { ...updated[patientIdx]!, [field]: value };
      setWarisEscorts(updated);
    }
  };

  const validateForm = () => {
    if (!tarikhPerjalanan) return language === 'ms' ? 'Travel Date is required' : 'Travel Date is required';
    if (!masaBerlepas) return language === 'ms' ? 'Masa Berlepas diperlukan' : 'Departure Time is required';
    if (!noPendaftaran) return language === 'ms' ? 'Vehicle Registration Number is required' : 'Vehicle Plate Number is required';
    if (!doktorPerujukNama) return language === 'ms' ? 'Nama Doktor Perujuk diperlukan' : 'Referring Doctor Name is required';

    if (pemanduPassport && !pemanduPassportExpiry) {
      return language === 'ms' ? 'Driver Passport Expiry Date is required' : 'Driver Passport Expiry Date is required';
    }

    for (let i = 0; i < patients.length; i++) {
      const p = patients[i];
      if (!p.nama) return language === 'ms' ? `Nama Pesakit ${i + 1} diperlukan` : `Patient #${i + 1} Full Name is required`;
      if (!p.tarikh_lahir) return language === 'ms' ? `Tarikh Lahir Pesakit ${i + 1} diperlukan` : `Patient #${i + 1} Date of Birth is required`;
      if (!p.no_dokumen) return language === 'ms' ? `No Dokumen Perjalanan Pesakit ${i + 1} diperlukan` : `Patient #${i + 1} Travel Document Number is required`;
      if (p.jenis_dokumen === 'PASSPORT' && !p.passport_expiry) {
        return language === 'ms' ? `Tarikh Tamat Pasport Pesakit ${i + 1} diperlukan` : `Patient #${i + 1} Passport Expiry Date is required`;
      }
    }

    for (let i = 0; i < kkmEscorts.length; i++) {
      const e = kkmEscorts[i];
      if (!e.nama) return language === 'ms' ? `Nama Pengiring KKM di baris ${i + 1} diperlukan` : `MOH Escort #${i + 1} Full Name is required`;
      if (e.jenis_dokumen === 'PASSPORT' && !e.passport_expiry) {
        return language === 'ms' ? `Tarikh Tamat Pasport Pengiring KKM di baris ${i + 1} diperlukan` : `MOH Escort #${i + 1} Passport Expiry Date is required`;
      }
    }

    for (let i = 0; i < warisEscorts.length; i++) {
      const w = warisEscorts[i];
      if (w) {
        if (!w.nama) return language === 'ms' ? `Nama Waris bagi Pesakit #${i + 1} diperlukan` : `Next of Kin Name for Patient #${i + 1} is required`;
        if (!w.no_dokumen) return language === 'ms' ? `No Dokumen Waris bagi Pesakit #${i + 1} diperlukan` : `Next of Kin Document Number for Patient #${i + 1} is required`;
        if (w.jenis_dokumen === 'PASSPORT' && !w.passport_expiry) {
          return language === 'ms' ? `Tarikh Tamat Pasport Waris bagi Pesakit #${i + 1} diperlukan` : `Next of Kin Passport Expiry Date for Patient #${i + 1} is required`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (submitType: 'draft' | 'submit') => {
    const errorMsg = validateForm();
    if (errorMsg) {
      toast.error(language === 'ms' ? 'Pengesahan Borang' : 'Form Validation', errorMsg);
      return;
    }

    const payload = {
      transfer: {
        referring_hospital: 'Hospital Lawas',
        destination_hospital: destinationHospital,
        tarikh_perjalanan: tarikhPerjalanan,
        masa_berlepas: masaBerlepas,
        tempat_berlepas: 'Hospital Lawas',
        jenis_kenderaan: 'ambulance' as CrossborderJenisKenderaan,
        no_pendaftaran: noPendaftaran,
        pemandu_nama: pemanduNama,
        pemandu_passport: pemanduPassport,
        pemandu_passport_expiry: pemanduPassport ? pemanduPassportExpiry : undefined,
        peralatan_lain: (() => {
          const eqNameMap: Record<string, string> = {
            vital_sign: 'Vital Sign Monitor',
            portable_suction: 'Portable Suction',
            portable_ventilator: 'Portable Ventilator',
            syringe_pump: 'Syringe Pump'
          };
          const list = selectedEquipment
            .map(id => id === 'others' ? (customEquipment ? `Other: ${customEquipment}` : '') : eqNameMap[id])
            .filter(name => !!name);
          return list.join(', ');
        })(),
        doktor_perujuk_nama: doktorPerujukNama,
        doktor_perujuk_id: userId,
        border_control_post: 'MALAYSIA/BRUNEI',
        catatan: catatan,
        linked_transport_request_id: linkedRequestId || undefined
      },
      patients: patients.map((p, idx) => ({
        ...p,
        urutan: idx + 1,
        passport_expiry: p.jenis_dokumen === 'PASSPORT' ? p.passport_expiry : undefined
      })),
      escorts: [
        ...kkmEscorts.map(e => ({
          jenis_pengiring: 'medical_escort' as JenisPengiring,
          nama: e.nama,
          jenis_dokumen: e.jenis_dokumen,
          no_dokumen: e.no_dokumen,
          jawatan: e.jawatan,
          passport_expiry: e.jenis_dokumen === 'PASSPORT' ? e.passport_expiry : undefined
        })),
        ...warisEscorts
          .map((w, idx) => w ? {
            jenis_pengiring: 'patient_escort' as JenisPengiring,
            nama: w.nama,
            jenis_dokumen: w.jenis_dokumen,
            no_dokumen: w.no_dokumen,
            patient_urutan: idx + 1,
            passport_expiry: w.jenis_dokumen === 'PASSPORT' ? w.passport_expiry : undefined
          } : null)
          .filter((w): w is any => w !== null)
      ]
    };

    try {
      const res = await createCrossborderTransfer(payload, hospitalId, userId);
      if (res.error) throw new Error(res.error);

      if (submitType === 'submit') {
        const submitRes = await submitCrossborderTransfer(res.data!.id);
        if (submitRes.error) throw new Error(submitRes.error);
        toast.success(
          language === 'ms' ? 'Submit Requisition' : 'Application Submitted',
          language === 'ms' ? 'Permohonan berjaya dihantar untuk kelulusan Pengarah.' : 'Application submitted successfully for Director approval.'
        );
      } else {
        toast.success(
          language === 'ms' ? 'Draf Disimpan' : 'Draft Saved',
          language === 'ms' ? 'Draf permohonan berjaya disimpan.' : 'Draft application saved successfully.'
        );
      }

      navigate(`/crossborder/detail/${res.data!.id}`);
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Gagal Menyimpan' : 'Save Error',
        err.message || (language === 'ms' ? 'Ralat semasa menyimpan rekod' : 'Error saving transfer record')
      );
    }
  };

  return (
    <div className="space-y-6 text-slate-800 w-full max-w-[100%]">
      {/* Back button */}
      <div>
        <button 
          onClick={() => navigate('/crossborder/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors group text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'ms' ? 'Kembali ke Papan Pemuka' : 'Back to Dashboard'}</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {language === 'ms' ? 'Daftar Perjalanan Rentasi Sempadan Baru' : 'Register New Cross-Border Patient Transfer'}
          </h1>
          <p className="text-sm text-slate-500">
            {language === 'ms' 
              ? 'Isikan borang di bawah bagi menjana Borang Pemindahan Pesakit Rasmi dan Surat Kebenaran Rentasi Sempadan.'
              : 'Complete the form below to generate the Official Cross-Border Transfer Form and Immigration Clearance Letter.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Form on left, Instructions & Summary on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
        {/* Left Side: Form Columns */}
        <div className="lg:col-span-2 space-y-6 w-full">
          {/* Section 0: MyTransporter Link */}
          <Card className="bg-white border border-slate-200 border-l-4 border-l-blue-600 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              {language === 'ms' ? 'Pautan Permohonan MyTransporter (Pilihan)' : 'Link MyTransporter Request (Optional)'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'ms' 
                ? 'Pilih permohonan pengangkutan aktif untuk mengisi butiran pesakit, tarikh, ambulans, dan pengiring secara automatik.'
                : 'Select an active transporter request to automatically import patient details, schedule, vehicle, and medical escorts.'}
            </p>
            <div>
              {loadingRequests ? (
                <div className="text-xs text-slate-400">
                  {language === 'ms' ? 'Memuatkan permohonan pengangkutan...' : 'Loading transport requests...'}
                </div>
              ) : (
                <select
                  value={linkedRequestId}
                  onChange={(e) => handleLinkRequestChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-800"
                >
                  <option value="">
                    {language === 'ms' ? 'Tiada permohonan berkaitan (Isi secara manual)' : 'No linked transport request (Fill manually)'}
                  </option>
                  {transportRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.no_rujukan}] {r.destinasi} ({new Date(r.tarikh_masa_diperlukan).toLocaleDateString()}) - {language === 'ms' ? 'Pesakit' : 'Patient'}: {r.nama_pesakit || 'N/A'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </Card>

          {/* Section 1: Trip Info */}
          <Card className="bg-white border border-slate-200 border-l-4 border-l-blue-600 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {language === 'ms' ? '1. Maklumat Perjalanan' : '1. Trip Information'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  {language === 'ms' ? 'Hospital Perujuk' : 'Referring Hospital'}
                </label>
                <input 
                  type="text" 
                  value="Hospital Lawas" 
                  disabled 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-400 cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'Hospital Destinasi *' : 'Destination Hospital *'}
                </label>
                <select 
                  value={destinationHospital}
                  onChange={(e) => setDestinationHospital(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                >
                  <option value="Hospital Limbang">Hospital Limbang</option>
                  <option value="Hospital Miri">Hospital Miri</option>
                  <option value="Hospital Sipitang">Hospital Sipitang</option>
                  <option value="Hospital Beaufort">Hospital Beaufort</option>
                  <option value="Hospital Queen Elizabeth I (HQE I)">Hospital Queen Elizabeth I (HQE I)</option>
                  <option value="Hospital Queen Elizabeth II (HQE II)">Hospital Queen Elizabeth II (HQE II)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'Tarikh Perjalanan *' : 'Travel Date *'}
                </label>
                <input 
                  type="date" 
                  value={tarikhPerjalanan}
                  onChange={(e) => setTarikhPerjalanan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'Masa Berlepas (Anggaran) *' : 'Estimated Departure Time *'}
                </label>
                <input 
                  type="time" 
                  value={masaBerlepas}
                  onChange={(e) => setMasaBerlepas(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Patient Info (1 to 3) */}
          <Card className="bg-white border border-slate-200 border-l-4 border-l-cyan-600 shadow-sm rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-600" />
                {language === 'ms' ? '2. Maklumat Pesakit (Maksima 3)' : '2. Patient Information (Max 3)'}
              </h2>
              <Button
                onClick={handleAddPatient}
                disabled={patients.length >= 3}
                type="button"
                variant="outline"
                className="border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 rounded-xl px-3 py-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-600" />
                {language === 'ms' ? 'Tambah Pesakit' : 'Add Patient'}
              </Button>
            </div>

            <div className="space-y-6 divide-y divide-slate-100">
              {patients.map((patient, index) => (
                <div key={index} className={`space-y-4 ${index > 0 ? 'pt-6' : ''}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-cyan-600 flex items-center gap-1.5">
                      <span className="bg-cyan-50 text-cyan-600 border border-cyan-100 px-2 py-0.5 rounded text-xs font-mono">
                        {language === 'ms' ? `Pesakit #${index + 1}` : `Patient #${index + 1}`}
                      </span>
                    </h3>
                    {patients.length > 1 && (
                      <button
                        onClick={() => handleRemovePatient(index)}
                        type="button"
                        className="text-red-500 hover:text-red-650 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {language === 'ms' ? 'Padam' : 'Remove'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'Nama Penuh (Seperti Pasport / IC) *' : 'Full Name (As in Passport / IC) *'}
                      </label>
                      <input 
                        type="text" 
                        value={patient.nama}
                        onChange={(e) => handlePatientChange(index, 'nama', e.target.value.toUpperCase())}
                        placeholder="e.g. DAIMON BIN MOHD TAHIR"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'Jantina *' : 'Gender *'}
                      </label>
                      <select
                        value={patient.jantina}
                        onChange={(e) => handlePatientChange(index, 'jantina', e.target.value as Jantina)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                      >
                        <option value="Lelaki">{language === 'ms' ? 'Lelaki' : 'Male'}</option>
                        <option value="Perempuan">{language === 'ms' ? 'Perempuan' : 'Female'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'Tarikh Lahir *' : 'Date of Birth *'}
                      </label>
                      <input 
                        type="date" 
                        value={patient.tarikh_lahir}
                        onChange={(e) => handlePatientChange(index, 'tarikh_lahir', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'Warganegara *' : 'Nationality *'}
                      </label>
                      <input 
                        type="text" 
                        value={patient.warganegara}
                        onChange={(e) => handlePatientChange(index, 'warganegara', e.target.value)}
                        placeholder="Malaysia"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'Jenis Dokumen Perjalanan *' : 'Travel Document Type *'}
                      </label>
                      <select
                        value={patient.jenis_dokumen}
                        onChange={(e) => handlePatientChange(index, 'jenis_dokumen', e.target.value as JenisDokumen)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                      >
                        <option value="PASSPORT">PASSPORT</option>
                        <option value="IC">{language === 'ms' ? 'IC / MYKAD' : 'National ID / MyKad'}</option>
                        <option value="OTHERS">{language === 'ms' ? 'DOKUMEN LAIN' : 'OTHER DOCUMENT'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'No Dokumen *' : 'Document Number *'}
                      </label>
                      <input 
                        type="text" 
                        value={patient.no_dokumen}
                        onChange={(e) => handlePatientChange(index, 'no_dokumen', e.target.value.toUpperCase())}
                        placeholder="e.g. A12345678"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium font-mono"
                      />
                    </div>
                    {patient.jenis_dokumen === 'PASSPORT' && (
                      <div className="animate-fadeIn">
                        <label className="text-xs font-semibold text-slate-500 block mb-1">
                          {language === 'ms' ? 'Tarikh Tamat Pasport *' : 'Passport Expiry Date *'}
                        </label>
                        <input 
                          type="date" 
                          value={patient.passport_expiry || ''}
                          onChange={(e) => handlePatientChange(index, 'passport_expiry', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    )}
                    <div className={patient.jenis_dokumen === 'PASSPORT' ? 'md:col-span-1' : 'md:col-span-2'}>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'No Kad Pengenalan Sekunder (Pilihan)' : 'Secondary ID / MyKad (Optional)'}
                      </label>
                      <input 
                        type="text" 
                        value={patient.no_pengenalan}
                        onChange={(e) => handlePatientChange(index, 'no_pengenalan', e.target.value)}
                        placeholder="e.g. 780515-13-5591"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 3: Vehicle Info */}
          <Card className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Ambulance className="w-5 h-5 text-emerald-600" />
              {language === 'ms' ? '3. Ambulans / Kenderaan Kerajaan' : '3. Government Ambulance / Vehicle'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'No. Pendaftaran Kenderaan *' : 'Vehicle Plate Number *'}
                </label>
                {loadingVehicles ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-400 font-medium">
                    {language === 'ms' ? 'Memuatkan ambulans berdaftar...' : 'Loading registered vehicles...'}
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={noPendaftaran}
                      onChange={(e) => setNoPendaftaran(e.target.value.toUpperCase())}
                      placeholder="e.g. BNN7608"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    />
                    <p className="text-[10px] text-amber-600">
                      {language === 'ms' 
                        ? 'Tiada ambulans aktif ditemui dalam rekod MyTransporter. Sila masukkan plat secara manual.'
                        : 'No active ambulances found in MyTransporter records. Please enter registration plate manually.'}
                    </p>
                  </div>
                ) : (
                  <select 
                    value={noPendaftaran}
                    onChange={(e) => setNoPendaftaran(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium font-mono"
                  >
                    <option value="" disabled>{language === 'ms' ? 'Pilih Ambulans Berdaftar' : 'Select Registered Ambulance'}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.no_kenderaan}>
                        {v.no_kenderaan} ({v.model})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'Nama Pemandu' : 'Driver Full Name'}
                </label>
                <input 
                  type="text" 
                  value={pemanduNama}
                  onChange={(e) => setPemanduNama(e.target.value)}
                  placeholder="e.g. AHMAD BIN ALI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'No. Passport Pemandu' : 'Driver Passport Number'}
                </label>
                <input 
                  type="text" 
                  value={pemanduPassport}
                  onChange={(e) => setPemanduPassport(e.target.value.toUpperCase())}
                  placeholder="e.g. K12345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? `Tarikh Tamat Pasport Pemandu ${pemanduPassport ? '*' : ''}` : `Driver Passport Expiry Date ${pemanduPassport ? '*' : ''}`}
                </label>
                <input 
                  type="date" 
                  value={pemanduPassportExpiry}
                  onChange={(e) => setPemanduPassportExpiry(e.target.value)}
                  disabled={!pemanduPassport}
                  className={`w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${!pemanduPassport ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'}`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 block mb-2">
                  {language === 'ms' ? 'Peralatan Perubatan Lain (Boleh pilih lebih dari satu)' : 'Additional Medical Equipment (Multiple choice)'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {[
                    { id: 'vital_sign', label: 'Vital Sign Monitor' },
                    { id: 'portable_suction', label: 'Portable Suction' },
                    { id: 'portable_ventilator', label: 'Portable Ventilator' },
                    { id: 'syringe_pump', label: 'Syringe Pump' },
                    { id: 'others', label: language === 'ms' ? 'Lain-lain (Nyatakan)' : 'Others (Specify)' }
                  ].map((eq) => {
                    const isChecked = selectedEquipment.includes(eq.id);
                    return (
                      <label key={eq.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEquipment([...selectedEquipment, eq.id]);
                            } else {
                              setSelectedEquipment(selectedEquipment.filter(item => item !== eq.id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500"
                        />
                        <span>{eq.label}</span>
                      </label>
                    );
                  })}
                </div>
                
                {selectedEquipment.includes('others') && (
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      {language === 'ms' ? 'Nyatakan Peralatan Lain *' : 'Specify Other Equipment *'}
                    </label>
                    <input 
                      type="text" 
                      value={customEquipment}
                      onChange={(e) => setCustomEquipment(e.target.value)}
                      placeholder="e.g. Oxygen concentrator, infusion pump"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

            </div>
          </Card>

          {/* Section 4: Pengiring Perubatan KKM */}
          <Card className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  {language === 'ms' ? '4. Pengiring Perubatan KKM' : '4. MOH Medical Escorts'}
                </h2>
                {isKkmAutoFilled && (
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1 animate-pulse">
                    ✓ {language === 'ms' ? 'Diimport dari MyTransporter' : 'Imported from MyTransporter'}
                  </p>
                )}
              </div>
              {!isKkmAutoFilled && (
                <Button
                  onClick={handleAddKkmEscort}
                  type="button"
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 rounded-xl px-3 py-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'ms' ? 'Tambah Kakitangan KKM' : 'Add MOH Staff'}
                </Button>
              )}
            </div>

            {kkmEscorts.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                {language === 'ms' ? 'Tiada pengiring perubatan didaftarkan. Sila tambah Kakitangan KKM.' : 'No medical escorts registered. Please add MOH staff.'}
              </div>
            ) : (
              <div className="space-y-4">
                {kkmEscorts.map((escort, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                    <div className="md:col-span-4 flex justify-between items-center mb-1">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 text-emerald-800 bg-emerald-50 capitalize">
                        {escort.jawatan === 'nurse' ? 'Staff Nurse (SN)' : escort.jawatan === 'medical_officer' ? 'Medical Officer (MO)' : escort.jawatan === 'assistant_medical_officer' ? 'Assistant Medical Officer (AMO)' : escort.jawatan === 'ppk' ? 'Healthcare Assistant (PPK)' : escort.jawatan}
                      </span>
                      {!isKkmAutoFilled && (
                        <button
                          onClick={() => handleRemoveKkmEscort(index)}
                          type="button"
                          className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'Nama Penuh *' : 'Full Name *'}
                      </label>
                      <input 
                        type="text" 
                        value={escort.nama}
                        onChange={(e) => handleKkmEscortChange(index, 'nama', e.target.value.toUpperCase())}
                        placeholder="e.g. SN NORAINI BINTI SAAD"
                        disabled={isKkmAutoFilled}
                        className={`w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isKkmAutoFilled ? 'bg-slate-100 cursor-not-allowed text-slate-400 font-semibold' : 'bg-white'}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        {language === 'ms' ? 'Jenis Dokumen' : 'Document Type'}
                      </label>
                      <select
                        value={escort.jenis_dokumen}
                        onChange={(e) => handleKkmEscortChange(index, 'jenis_dokumen', e.target.value as JenisDokumen)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="IC">{language === 'ms' ? 'IC / MYKAD' : 'National ID / MyKad'}</option>
                        <option value="PASSPORT">PASSPORT</option>
                        <option value="OTHERS">{language === 'ms' ? 'LAIN-LAIN' : 'OTHERS'}</option>
                      </select>
                    </div>
                    <div className={escort.jenis_dokumen === 'PASSPORT' ? 'md:col-span-1' : 'md:col-span-2'}>
                      <label className="text-xs font-semibold text-slate-500 block mb-1 font-mono">
                        {language === 'ms' ? 'No. Dokumen' : 'Document No'}
                      </label>
                      <input 
                        type="text" 
                        value={escort.no_dokumen}
                        onChange={(e) => handleKkmEscortChange(index, 'no_dokumen', e.target.value.toUpperCase())}
                        placeholder="e.g. 880412-13-5240"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    {escort.jenis_dokumen === 'PASSPORT' && (
                      <div className="md:col-span-1 animate-fadeIn">
                        <label className="text-xs font-semibold text-slate-500 block mb-1">
                          {language === 'ms' ? 'Tarikh Tamat Pasport *' : 'Passport Expiry Date *'}
                        </label>
                        <input 
                          type="date" 
                          value={escort.passport_expiry || ''}
                          onChange={(e) => handleKkmEscortChange(index, 'passport_expiry', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Section 5: Waris / Pengiring Terdekat */}
          <Card className="bg-white border border-slate-200 border-l-4 border-l-cyan-600 shadow-sm rounded-xl p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-600" />
              {language === 'ms' ? '5. Waris / Pengiring Terdekat (Maksima 1 Waris Per Pesakit)' : '5. Accompanying Family / Next of Kin (Max 1 Per Patient)'}
            </h2>
            <div className="space-y-4">
              {patients.map((patient, patientIdx) => {
                const waris = warisEscorts[patientIdx];
                return (
                  <div key={patientIdx} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-600">
                        {language === 'ms' ? `Waris untuk Pesakit #${patientIdx + 1}:` : `Next of Kin for Patient #${patientIdx + 1}:`}{' '}
                        <span className="text-blue-600 font-black">{patient.nama || (language === 'ms' ? '(Sila isi nama pesakit di Bahagian 2)' : '(Fill patient name in Section 2)')}</span>
                      </div>
                      {!waris ? (
                        <Button
                          onClick={() => handleAddWaris(patientIdx)}
                          type="button"
                          variant="outline"
                          disabled={!patient.nama}
                          className="border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold flex items-center gap-1 rounded-lg px-2.5 py-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-cyan-600" />
                          {language === 'ms' ? 'Tambah Waris' : 'Add Next of Kin'}
                        </Button>
                      ) : (
                        <button
                          onClick={() => handleRemoveWaris(patientIdx)}
                          type="button"
                          className="text-red-500 hover:text-red-700 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {language === 'ms' ? 'Gugurkan Waris' : 'Remove Escort'}
                        </button>
                      )}
                    </div>

                    {waris && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-fadeIn">
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-slate-500 block mb-1">
                            {language === 'ms' ? 'Nama Penuh Waris *' : 'Next of Kin Full Name *'}
                          </label>
                          <input 
                            type="text" 
                            value={waris.nama}
                            onChange={(e) => handleWarisChange(patientIdx, 'nama', e.target.value.toUpperCase())}
                            placeholder="e.g. SITI FATIMAH BINTI AHMAD"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">
                            {language === 'ms' ? 'Hubungan *' : 'Relationship *'}
                          </label>
                          <select
                            value={waris.hubungan}
                            onChange={(e) => handleWarisChange(patientIdx, 'hubungan', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Suami/Isteri">{language === 'ms' ? 'Suami/Isteri' : 'Spouse'}</option>
                            <option value="Ibu/Bapa/Penjaga">{language === 'ms' ? 'Ibu/Bapa/Penjaga' : 'Parent / Guardian'}</option>
                            <option value="Anak">{language === 'ms' ? 'Anak' : 'Child'}</option>
                            <option value="Adik-beradik">{language === 'ms' ? 'Adik-beradik' : 'Sibling'}</option>
                            <option value="Lain-lain">{language === 'ms' ? 'Lain-lain' : 'Other'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">
                            {language === 'ms' ? 'Jenis Dokumen *' : 'Document Type *'}
                          </label>
                          <select
                            value={waris.jenis_dokumen}
                            onChange={(e) => handleWarisChange(patientIdx, 'jenis_dokumen', e.target.value as JenisDokumen)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="PASSPORT">PASSPORT</option>
                            <option value="IC">{language === 'ms' ? 'IC / MYKAD' : 'National ID / MyKad'}</option>
                            <option value="OTHERS">{language === 'ms' ? 'LAIN-LAIN' : 'OTHERS'}</option>
                          </select>
                        </div>
                        <div className={waris.jenis_dokumen === 'PASSPORT' ? 'md:col-span-1' : 'md:col-span-2'}>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">
                            {language === 'ms' ? 'No. Dokumen *' : 'Document No *'}
                          </label>
                          <input 
                            type="text" 
                            value={waris.no_dokumen}
                            onChange={(e) => handleWarisChange(patientIdx, 'no_dokumen', e.target.value.toUpperCase())}
                            placeholder="e.g. A98765432"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                        {waris.jenis_dokumen === 'PASSPORT' && (
                          <div className="md:col-span-1 animate-fadeIn">
                            <label className="text-xs font-semibold text-slate-500 block mb-1">
                              {language === 'ms' ? 'Tarikh Tamat Pasport *' : 'Passport Expiry Date *'}
                            </label>
                            <input 
                              type="date" 
                              value={waris.passport_expiry || ''}
                              onChange={(e) => handleWarisChange(patientIdx, 'passport_expiry', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Section 6: Doctor Sign-off */}
          <Card className="bg-white border border-slate-200 border-l-4 border-l-amber-600 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-amber-600" />
              {language === 'ms' ? '6. Pengesahan Doktor Perujuk' : '6. Referring Medical Officer Endorsement'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'Nama Doktor Perujuk *' : 'Referring Medical Officer Name *'}
                </label>
                <input 
                  type="text" 
                  value={doktorPerujukNama}
                  onChange={(e) => setDoktorPerujukNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'Catatan Tambahan (Pilihan)' : 'Clinical Indications / Diagnosis (Optional)'}
                </label>
                <input 
                  type="text" 
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder={language === 'ms' ? 'Sebab rujukan atau diagnosis ringkas' : 'Brief diagnosis or reason for tertiary transfer'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          </Card>


          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => handleSubmit('draft')}
              type="button"
              variant="outline"
              className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold p-4 flex items-center justify-center gap-2 rounded-xl text-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {language === 'ms' ? 'Simpan Sebagai Draf' : 'Save As Draft'}
            </Button>
            <Button
              onClick={() => handleSubmit('submit')}
              type="button"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 flex items-center justify-center gap-2 rounded-xl text-sm shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {language === 'ms' ? 'Hantar Kelulusan Pengarah' : 'Submit For Director Approval'}
            </Button>
          </div>
        </div>

        {/* Right Side: Informative Sidebar & Summary panel */}
        <div className="space-y-6 w-full">
          {/* Summary Panel */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              {language === 'ms' ? 'Ringkasan Permohonan' : 'Application Summary'}
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>{language === 'ms' ? 'Rujukan Pelepasan:' : 'Clearance Route:'}</span>
                <span className="font-semibold text-slate-900">Hospital Lawas &rarr; Limbang</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>{language === 'ms' ? 'Jumlah Pesakit:' : 'Total Patients:'}</span>
                <span className="font-semibold text-slate-900">{patients.length} {language === 'ms' ? 'kes' : 'cases'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>{language === 'ms' ? 'Jumlah Pengiring:' : 'Total Escorts:'}</span>
                <span className="font-semibold text-slate-900">{kkmEscorts.length + warisEscorts.filter(Boolean).length} {language === 'ms' ? 'orang' : 'pax'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>{language === 'ms' ? 'No. Kenderaan:' : 'Vehicle Plate:'}</span>
                <span className="font-mono font-semibold text-blue-600">{noPendaftaran || '-'}</span>
              </div>

            </div>
          </Card>

          {/* Border Crossing Guidance */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {language === 'ms' ? 'Panduan Kawalan Sempadan' : 'Border Crossing Guidelines'}
            </h3>
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{language === 'ms' ? 'Dokumen perjalanan fizikal (pasport/IC) mestilah sah bagi semua individu tersenarai.' : 'Valid physical passports and travel IDs are mandatory for all listed patients and escorts.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{language === 'ms' ? 'Borang pelepasan imigresen Brunei mestilah dicetak (2 salinan) setelah diluluskan Pengarah.' : 'The Brunei Immigration Clearance Authorization must be printed (2 copies) once approved.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{language === 'ms' ? 'Semua peralatan perubatan sokongan (ventilator/oksigen) mestilah didokumenkan dengan jelas.' : 'All high-care life support equipment (ventilators, oxygen) must be declared on the transit permit.'}</span>
              </div>
              <p className="text-[11px] text-amber-800 bg-amber-50/50 p-3 rounded-lg border border-amber-100 mt-2 font-medium">
                {language === 'ms' 
                  ? 'Penting: Kelewatan di imigresen Brunei (Mengkalap/Ujung Jalan) boleh menjejaskan kestabilan pesakit kritikal. Pastikan e-permit/dokumen sempadan lengkap.'
                  : 'Notice: Border clearance delays at Brunei checkpoints (Mengkalap / Ujung Jalan) can jeopardize critical patients. Ensure all documents are verified.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CrossborderCreatePage;
