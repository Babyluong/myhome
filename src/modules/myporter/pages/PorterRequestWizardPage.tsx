// src/modules/myporter/pages/PorterRequestWizardPage.tsx
import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Truck, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Bed, 
  FlaskConical, 
  Droplets, 
  Pill, 
  AirVent, 
  Shield, 
  FileText, 
  Activity,
  MapPin,
  Clock,
  User,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { createPorterJob } from '../services/porterService'
import type { 
  PorterTaskCategory, 
  PorterUrgency, 
  PatientMobility,
  PorterJobRequest 
} from '@/shared/types/myporter'
import { soundAlert } from '../components/PorterAudioAlert'
import { useLanguage } from '@/shared/contexts/LanguageContext'

export const PorterRequestWizardPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loggedUser = useAuthStore((state) => state.user)
  const toast = useToast()
  const { language } = useLanguage()

  const defaultCategory = (searchParams.get('category') as PorterTaskCategory) || 'patient_transfer'

  const [step, setStep] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Category & Urgency
  const [category, setCategory] = useState<PorterTaskCategory>(defaultCategory)
  const [subCategory, setSubCategory] = useState<string>('')
  const [urgency, setUrgency] = useState<PorterUrgency>('routine')

  // Step 2: Locations
  const [originDeptName, setOriginDeptName] = useState(
    language === 'ms' ? 'Wad Kenanga (Wad 4A)' : 'Kenanga Ward (Ward 4A)'
  )
  const [originDeptId, setOriginDeptId] = useState('dept-w4a')
  const [originDetails, setOriginDetails] = useState(
    language === 'ms' ? 'Katil 04A' : 'Bed 04A'
  )
  
  const [destDeptName, setDestDeptName] = useState(
    language === 'ms' ? 'Jabatan Radiologi' : 'Radiology Department'
  )
  const [destDeptId, setDestDeptId] = useState('dept-rad')
  const [destDetails, setDestDetails] = useState(
    language === 'ms' ? 'Bilik CT Scan 1' : 'CT Scan Room 1'
  )

  // Step 3: Specifics
  // Patient fields
  const [patientName, setPatientName] = useState('')
  const [patientRn, setPatientRn] = useState('')
  const [patientGender, setPatientGender] = useState<'Lelaki' | 'Perempuan'>('Lelaki')
  const [patientAge, setPatientAge] = useState<number>(45)
  const [mobility, setMobility] = useState<PatientMobility>('wheelchair')
  const [o2Dependent, setO2Dependent] = useState(false)
  const [o2FlowRate, setO2FlowRate] = useState(3)
  const [nurseEscort, setNurseEscort] = useState(false)
  const [isolationPrecaution, setIsolationPrecaution] = useState<'NONE' | 'CONTACT' | 'DROPLET' | 'AIRBORNE'>('NONE')

  // Specimen fields
  const [specimenType, setSpecimenType] = useState(
    language === 'ms' ? 'Darah Lengkap (FBC & Renal Profile)' : 'Full Blood Picture (FBC & Renal Profile)'
  )
  const [tubeCount, setTubeCount] = useState(2)
  const [isColdChain, setIsColdChain] = useState(false)
  const [isUrgentAbg, setIsUrgentAbg] = useState(false)

  // Blood bank fields
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [bloodProductType, setBloodProductType] = useState<'PRBC' | 'PLATELET' | 'FFP' | 'CRYOPRECIPITATE' | 'MTP_BOX'>('PRBC')
  const [bloodUnitCount, setBloodUnitCount] = useState(2)

  // Pharmacy fields
  const [isDda, setIsDda] = useState(false)
  const [prescriptionNo, setPrescriptionNo] = useState('')

  // Gas / Equipment fields
  const [cylinderSize, setCylinderSize] = useState<'E' | 'G' | 'J'>('E')
  const [cylinderCount, setCylinderCount] = useState(2)

  // Notes
  const [notes, setNotes] = useState('')

  const categoriesList = [
    { 
      key: 'patient_transfer', 
      title: language === 'ms' ? 'Pemindahan Pesakit' : 'Patient Transfer', 
      desc: language === 'ms' ? 'Katil, kerusi roda, isolasi, OT & Radiologi' : 'Bed, wheelchair, stretcher, isolation, OT & Radiology', 
      icon: Bed, 
      color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' 
    },
    { 
      key: 'lab_specimen', 
      title: language === 'ms' ? 'Spesimen Makmal' : 'Laboratory Specimen', 
      desc: language === 'ms' ? 'Sampel darah, urin, ABG, biopsi, cold-chain' : 'Blood samples, urine, ABG, biopsy, cold-chain', 
      icon: FlaskConical, 
      color: 'text-teal-400 border-teal-500/40 bg-teal-500/10' 
    },
    { 
      key: 'blood_bank', 
      title: language === 'ms' ? 'Tabung Darah (Transfusi)' : 'Blood Bank (Transfusion)', 
      desc: language === 'ms' ? 'PRBC, Platelet, FFP, MTP Emergency Box' : 'PRBC, Platelets, FFP, MTP Emergency Box', 
      icon: Droplets, 
      color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' 
    },
    { 
      key: 'pharmacy_run', 
      title: language === 'ms' ? 'Ubat-Ubatan & Farmasi' : 'Medications & Pharmacy', 
      desc: language === 'ms' ? 'Ubat STAT, DDA Dangerous Drugs, TPN & IV' : 'STAT drugs, Dangerous Drugs (DDA), TPN & IV', 
      icon: Pill, 
      color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' 
    },
    { 
      key: 'gas_equipment', 
      title: language === 'ms' ? 'Gas Perubatan & Alat' : 'Medical Gas & Equipment', 
      desc: language === 'ms' ? 'Silinder Oksigen (E/G/J), pam, kerusi roda' : 'Oxygen cylinders (E/G/J), pumps, wheelchairs', 
      icon: AirVent, 
      color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' 
    },
    { 
      key: 'mortuary', 
      title: language === 'ms' ? 'Unit Forensik / Jenazah' : 'Forensic & Mortuary', 
      desc: language === 'ms' ? 'Pemindahan jenazah dengan kereta sorong bertutup' : 'Deceased transport with covered mortuary trolley', 
      icon: Shield, 
      color: 'text-slate-300 border-slate-500/40 bg-slate-500/10' 
    },
    { 
      key: 'medical_records', 
      title: language === 'ms' ? 'Rekod Perubatan (BHT)' : 'Medical Records (BHT)', 
      desc: language === 'ms' ? 'Fail pesakit antara Jabatan Rekod & Klinik' : 'Patient files between Records Dept & Clinics', 
      icon: FileText, 
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' 
    },
    { 
      key: 'cssd_linen', 
      title: language === 'ms' ? 'CSSD, Linen & Sisa' : 'CSSD, Linen & Waste', 
      desc: language === 'ms' ? 'Set steril CSSD, linen bersih/kotor & sisa klinikal' : 'Sterile CSSD sets, clean/soiled linen & clinical waste', 
      icon: Activity, 
      color: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-500/10' 
    }
  ]

  const hospitalDepartments = [
    { id: 'dept-w4a', name: language === 'ms' ? 'Wad Kenanga (Wad 4A - Aras 4)' : 'Kenanga Ward (Ward 4A - Level 4)' },
    { id: 'dept-w5b', name: language === 'ms' ? 'Wad Mawar (Wad 5B - Aras 5)' : 'Mawar Ward (Ward 5B - Level 5)' },
    { id: 'dept-ed', name: language === 'ms' ? 'Jabatan Kecemasan & Trauma (ED - Aras B1)' : 'Emergency & Trauma Department (ED - Level B1)' },
    { id: 'dept-ot', name: language === 'ms' ? 'Dewan Bedah Utama (OT - Aras 3)' : 'Main Operating Theatre (OT - Level 3)' },
    { id: 'dept-icu', name: language === 'ms' ? 'Unit Rawatan Rapi (ICU - Aras 3)' : 'Intensive Care Unit (ICU - Level 3)' },
    { id: 'dept-lab', name: language === 'ms' ? 'Makmal Patologi & Diagnostik (Aras 1)' : 'Pathology & Diagnostic Laboratory (Level 1)' },
    { id: 'dept-bb', name: language === 'ms' ? 'Tabung Darah (Blood Bank - Aras 2)' : 'Blood Bank (Level 2)' },
    { id: 'dept-pharma', name: language === 'ms' ? 'Farmasi Satelit Pesakit Dalam (Aras 2)' : 'Inpatient Satellite Pharmacy (Level 2)' },
    { id: 'dept-rad', name: language === 'ms' ? 'Jabatan Radiologi & CT Scan (Aras 1)' : 'Radiology & CT Scan Department (Level 1)' },
    { id: 'dept-forensic', name: language === 'ms' ? 'Unit Forensik & Rumah Mayat (Aras B2)' : 'Forensic & Mortuary Unit (Level B2)' },
    { id: 'dept-cssd', name: language === 'ms' ? 'Unit Pensterilan CSSD (Aras B1)' : 'CSSD Sterilization Unit (Level B1)' },
    { id: 'dept-records', name: language === 'ms' ? 'Jabatan Rekod Perubatan (Aras 1)' : 'Medical Records Department (Level 1)' }
  ]

  const handleSubmitOrder = async () => {
    setLoading(true)
    try {
      let subCatLabel = language === 'ms' ? 'Tugasan Am' : 'General Task'
      const found = categoriesList.find(c => c.key === category)
      if (found) subCatLabel = found.title

      const payload: Partial<PorterJobRequest> = {
        category,
        sub_category: subCatLabel,
        urgency,
        origin_department_id: originDeptId,
        origin_department_name: originDeptName,
        origin_location_details: originDetails,
        destination_department_id: destDeptId,
        destination_department_name: destDeptName,
        destination_location_details: destDetails,
        requester_id: loggedUser?.id || 'user-1',
        requester_name: loggedUser?.full_name || (language === 'ms' ? 'Jururawat Wad' : 'Ward Nurse'),
        requester_role: loggedUser?.role?.role_code || 'nurse',
        notes
      }

      if (category === 'patient_transfer') {
        payload.patient_data = {
          patient_name: patientName || (language === 'ms' ? 'Pesakit Tanpa Nama' : 'Unnamed Patient'),
          patient_rn: patientRn || 'RN-PENDING',
          patient_gender: patientGender,
          patient_age: patientAge,
          mobility_type: mobility,
          o2_dependent: o2Dependent,
          o2_flow_rate_lpm: o2FlowRate,
          nurse_escort_required: nurseEscort,
          isolation_precautions: isolationPrecaution
        }
      } else if (category === 'lab_specimen') {
        payload.specimen_data = {
          specimen_type: specimenType,
          tube_count: tubeCount,
          cold_chain_required: isColdChain,
          is_urgent_abg: isUrgentAbg
        }
      } else if (category === 'blood_bank') {
        payload.blood_data = {
          blood_group: bloodGroup,
          product_type: bloodProductType,
          unit_numbers: Array.from({ length: bloodUnitCount }, (_, i) => `UNIT-${i + 1}`)
        }
      } else if (category === 'pharmacy_run') {
        payload.pharmacy_data = {
          prescription_no: prescriptionNo,
          is_dangerous_drug: isDda
        }
      } else if (category === 'gas_equipment') {
        payload.equipment_data = {
          gas_type: 'oxygen',
          cylinder_size: cylinderSize,
          cylinder_count: cylinderCount
        }
      }

      const res = await createPorterJob(payload)
      if (res.data) {
        soundAlert.playSuccessTone()
        toast.success(
          language === 'ms' ? 'Pesanan Berjaya Dihantar' : 'Request Successfully Submitted',
          language === 'ms' 
            ? `No Rujukan: ${res.data.no_rujukan} sedang disiarkan ke radar PPK.`
            : `Reference No: ${res.data.no_rujukan} is now broadcasting to porter radar.`
        )
        navigate('/porter/requests/my')
      }
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat Menghantar Pesanan' : 'Error Submitting Request',
        err.message || (language === 'ms' ? 'Sila semak maklumat yang dimasukkan.' : 'Please check the entered information.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/porter/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {language === 'ms' ? 'Kembali ke Dashboard' : 'Back to Dashboard'}
          </span>
        </button>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{language === 'ms' ? `Langkah ${step} daripada 4` : `Step ${step} of 4`}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Wizard Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className={step >= 1 ? 'text-sky-400' : 'text-slate-500'}>
              {language === 'ms' ? '1. Kategori & Urgensi' : '1. Category & Urgency'}
            </span>
            <span className={step >= 2 ? 'text-sky-400' : 'text-slate-500'}>
              {language === 'ms' ? '2. Lokasi Laluan' : '2. Route Locations'}
            </span>
            <span className={step >= 3 ? 'text-sky-400' : 'text-slate-500'}>
              {language === 'ms' ? '3. Butiran Khusus' : '3. Specific Details'}
            </span>
            <span className={step >= 4 ? 'text-sky-400' : 'text-slate-500'}>
              {language === 'ms' ? '4. Semakan & Hantar' : '4. Review & Submit'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(step / 4) * 100}%` }}
              className="bg-gradient-to-r from-sky-500 to-blue-600 h-full"
            />
          </div>
        </div>

        {/* STEP 1: Category & Urgency */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">
                {language === 'ms' ? 'Pilih Kategori Tugasan' : 'Select Task Category'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ms' ? 'Sila pilih jenis item atau perkhidmatan yang diperlukan' : 'Please choose the required item or transport service'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoriesList.map((item) => {
                const Icon = item.icon
                const isSelected = category === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key as PorterTaskCategory)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-3 rounded-xl border ${item.color} shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Urgency Selector */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {language === 'ms' ? 'Tahap Keutamaan (SLA Triage)' : 'Priority Level (SLA Triage)'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { 
                    key: 'routine', 
                    label: language === 'ms' ? 'Biasa (Routine)' : 'Routine', 
                    desc: language === 'ms' ? 'Masa SASARAN < 60 min' : 'Target SLA < 60 min', 
                    color: 'border-slate-700 hover:border-slate-600' 
                  },
                  { 
                    key: 'urgent', 
                    label: language === 'ms' ? 'Segera (Urgent)' : 'Urgent', 
                    desc: language === 'ms' ? 'Masa SASARAN < 30 min' : 'Target SLA < 30 min', 
                    color: 'border-amber-500/40 text-amber-300' 
                  },
                  { 
                    key: 'stat', 
                    label: language === 'ms' ? '⚡ STAT KECEMASAN' : '⚡ STAT EMERGENCY', 
                    desc: language === 'ms' ? 'Masa SASARAN < 15 min' : 'Target SLA < 15 min', 
                    color: 'border-rose-500/60 text-rose-300 bg-rose-500/10' 
                  }
                ].map((u) => {
                  const isSel = urgency === u.key
                  return (
                    <button
                      key={u.key}
                      type="button"
                      onClick={() => setUrgency(u.key as PorterUrgency)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSel
                          ? 'border-sky-500 bg-sky-500/20 ring-2 ring-sky-500/40'
                          : `bg-slate-950/40 ${u.color}`
                      }`}
                    >
                      <p className="text-xs font-black">{u.label}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{u.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Locations */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">
                {language === 'ms' ? 'Tetapkan Lokasi Ambil & Hantar' : 'Set Pickup & Delivery Locations'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ms' ? 'Pastikan nama wad dan nombor katil/bilik tepat' : 'Ensure department name and bed/room details are accurate'}
              </p>
            </div>

            <div className="space-y-6">
              {/* Origin */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>{language === 'ms' ? 'Lokasi Ambil (Asal / Pickup)' : 'Pickup Location (Origin)'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Jabatan / Wad' : 'Department / Ward'}
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                      value={originDeptName}
                      onChange={(e) => {
                        setOriginDeptName(e.target.value)
                        const found = hospitalDepartments.find(d => d.name === e.target.value)
                        if (found) setOriginDeptId(found.id)
                      }}
                    >
                      {hospitalDepartments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Perincian (cth: Katil / Bilik)' : 'Details (e.g. Bed / Room / Counter)'}
                    </label>
                    <Input
                      value={originDetails}
                      onChange={(e) => setOriginDetails(e.target.value)}
                      placeholder={language === 'ms' ? 'cth: Katil 12B / Kaunter Depan' : 'e.g. Bed 12B / Front Counter'}
                    />
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>{language === 'ms' ? 'Lokasi Hantar (Destinasi / Drop-off)' : 'Delivery Location (Destination)'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Jabatan / Wad' : 'Department / Ward'}
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                      value={destDeptName}
                      onChange={(e) => {
                        setDestDeptName(e.target.value)
                        const found = hospitalDepartments.find(d => d.name === e.target.value)
                        if (found) setDestDeptId(found.id)
                      }}
                    >
                      {hospitalDepartments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Perincian (cth: Bilik / Kaunter)' : 'Details (e.g. Room / Counter)'}
                    </label>
                    <Input
                      value={destDetails}
                      onChange={(e) => setDestDetails(e.target.value)}
                      placeholder={language === 'ms' ? 'cth: Bilik CT Scan 1 / Bilik Ubat' : 'e.g. CT Scan Room 1 / Drug Counter'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Specifics by Category */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">
                {language === 'ms' ? 'Butiran Khusus Tugas' : 'Specific Task Details'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ms' ? 'Maklumat sokongan untuk kelancaran tugas PPK' : 'Supporting information for smooth porter task execution'}
              </p>
            </div>

            {category === 'patient_transfer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Nama Pesakit *' : 'Patient Name *'}
                    </label>
                    <Input
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder={language === 'ms' ? 'cth: Puan Lim Siew Mei' : 'e.g. Madam Lim Siew Mei'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Nombor RN Pesakit *' : 'Patient RN Number *'}
                    </label>
                    <Input
                      value={patientRn}
                      onChange={(e) => setPatientRn(e.target.value)}
                      placeholder="e.g. RN-2026-99214"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Mod Pengangkutan' : 'Transport Mode'}
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                      value={mobility}
                      onChange={(e) => setMobility(e.target.value as PatientMobility)}
                    >
                      <option value="bed">{language === 'ms' ? 'Katil Wad (Bed Transfer)' : 'Ward Bed (Bed Transfer)'}</option>
                      <option value="wheelchair">{language === 'ms' ? 'Kerusi Roda (Wheelchair)' : 'Wheelchair'}</option>
                      <option value="stretcher">{language === 'ms' ? 'Stretcher / Usungan' : 'Stretcher Trolley'}</option>
                      <option value="walking">{language === 'ms' ? 'Berjalan Kaki (Walking)' : 'Ambulatory (Walking)'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Oksigen Mudah Alih?' : 'Portable Oxygen Required?'}
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                      value={o2Dependent ? 'yes' : 'no'}
                      onChange={(e) => setO2Dependent(e.target.value === 'yes')}
                    >
                      <option value="no">{language === 'ms' ? 'Tiada Oksigen' : 'No Oxygen'}</option>
                      <option value="yes">{language === 'ms' ? 'Perlu Oksigen (E-Cylinder)' : 'Requires Oxygen (E-Cylinder)'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {language === 'ms' ? 'Pengiring Jururawat' : 'Nurse Escort Required?'}
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                      value={nurseEscort ? 'yes' : 'no'}
                      onChange={(e) => setNurseEscort(e.target.value === 'yes')}
                    >
                      <option value="no">{language === 'ms' ? 'Tiada Pengiring' : 'No Escort Required'}</option>
                      <option value="yes">{language === 'ms' ? 'Diiringi Jururawat' : 'Nurse Escorted'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {category === 'lab_specimen' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'ms' ? 'Jenis Spesimen' : 'Specimen Type'}
                  </label>
                  <Input
                    value={specimenType}
                    onChange={(e) => setSpecimenType(e.target.value)}
                    placeholder={language === 'ms' ? 'cth: ABG / Darah / Urin' : 'e.g. ABG / Full Blood Picture / Urine'}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'ms' ? 'Bilangan Tiub / Bekas' : 'Tube / Container Count'}
                  </label>
                  <Input
                    type="number"
                    value={tubeCount}
                    onChange={(e) => setTubeCount(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {category === 'blood_bank' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'ms' ? 'Kumpulan Darah' : 'Blood Group'}
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    <option value="O+">O Positive (O+)</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="O-">O Negative (O-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'ms' ? 'Jenis Produk' : 'Product Type'}
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    value={bloodProductType}
                    onChange={(e) => setBloodProductType(e.target.value as any)}
                  >
                    <option value="PRBC">Packed Red Cells (PRBC)</option>
                    <option value="PLATELET">Platelet Concentrate</option>
                    <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                    <option value="MTP_BOX">Massive Transfusion Protocol (MTP Box)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {language === 'ms' ? 'Nota Tambahan untuk PPK' : 'Additional Notes for Porter'}
              </label>
              <textarea
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'ms' ? 'cth: Sila bawa bersama tiang titisan IV dan pastikan pesakit berselimut.' : 'e.g. Please bring an IV drip stand and ensure patient has blankets.'}
              />
            </div>
          </motion.div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">
                {language === 'ms' ? 'Semakan Pesanan Porter' : 'Review Porter Request'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ms' ? 'Sila semak semula butiran sebelum menyiarkan ke radar' : 'Please review all details before broadcasting to the porter radar'}
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400">{language === 'ms' ? 'Kategori:' : 'Category:'}</span>
                <span className="font-bold text-white uppercase">{category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400">{language === 'ms' ? 'Keutamaan:' : 'Priority:'}</span>
                <span className={`font-bold uppercase ${urgency === 'stat' ? 'text-rose-400' : urgency === 'urgent' ? 'text-amber-400' : 'text-slate-200'}`}>
                  {urgency}
                </span>
              </div>
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <span className="text-slate-400">{language === 'ms' ? 'Laluan:' : 'Route:'}</span>
                <span className="font-bold text-right text-slate-200">
                  {originDeptName} ({originDetails})<br />
                  ➔ {destDeptName} ({destDetails})
                </span>
              </div>
              {patientName && (
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-400">{language === 'ms' ? 'Pesakit:' : 'Patient:'}</span>
                  <span className="font-bold text-slate-200">{patientName} ({patientRn})</span>
                </div>
              )}
              {notes && (
                <div className="flex justify-between items-start">
                  <span className="text-slate-400">{language === 'ms' ? 'Nota:' : 'Notes:'}</span>
                  <span className="text-slate-300 text-right">{notes}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {step > 1 ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>{language === 'ms' ? 'Sebelumnya' : 'Previous'}</span>
            </Button>
          ) : <div />}

          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold"
            >
              <span>{language === 'ms' ? 'Seterusnya' : 'Next'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmitOrder}
              isLoading={loading}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black px-6 shadow-lg shadow-sky-500/25"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>{language === 'ms' ? 'Hantar Pesanan ke Radar PPK' : 'Broadcast Request to Porter Radar'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PorterRequestWizardPage
