// src/modules/mytransporter/pages/TransporterRequestFormPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, 
  Car, 
  User, 
  Clipboard, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Truck
} from 'lucide-react'
import { Ambulance } from '../components/AmbulanceIcon'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { createRequest, getRequestById, updateRequest, logRequestTransition } from '../services/transporterService'
import { getUnlinkedCrossborderTransfers } from '@/modules/mycrossborder/services/crossborderService'
import type { CrossborderTransfer, JenisDokumen, Jantina } from '@/shared/types/mycrossborder'
import type { PengiringType, EscortStaff, CrossborderPatientEmbedded, KkmEscortEmbedded, WarisEscortEmbedded } from '@/shared/types/mytransporter'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Select
} from '@/components/ui'

const DOCTOR_OPTIONS = [
  "DR AMIR",
  "DR JASON",
  "DR NARVIN",
  "DR CLARA",
  "DR IBRAHIM",
  "DR SARA",
  "DR VOON",
  "DR GANESHA",
  "DR FATIMAH"
]

const TransporterRequestFormPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const isEditMode = !!id
  const editReason = (location.state as any)?.reason || ''
  const loggedUser = useAuthStore((state) => state.user)
  const { language } = useLanguage()
  const isEn = language !== 'ms'
  const toast = useToast()
  const [originalStatus, setOriginalStatus] = useState('')

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [jenisPermohonan, setJenisPermohonan] = useState<'ambulance' | 'sg' | 'van_jenazah'>('ambulance')
  const [tujuanPermohonan, setTujuanPermohonan] = useState('')
  const [selectedAmbulanceTujuan, setSelectedAmbulanceTujuan] = useState<string>('')
  const [customTujuan, setCustomTujuan] = useState('')
  const [destinasi, setDestinasi] = useState('')
  const [selectedDestinasi, setSelectedDestinasi] = useState<string>('')
  const [customDestinasi, setCustomDestinasi] = useState('')
  const [tarikhDiperlukan, setTarikhDiperlukan] = useState('')
  const [masaDiperlukan, setMasaDiperlukan] = useState('')
  const [selectedUnitPemohon, setSelectedUnitPemohon] = useState<string>(() => {
    const defaultDept = loggedUser?.department?.department_name || ''
    const unitOptions = ['General ward', 'Paediatric Ward', 'Maternity Ward', 'Emergency & Trauma']
    return defaultDept ? (unitOptions.includes(defaultDept) ? defaultDept : 'others') : ''
  })
  const [customUnitPemohon, setCustomUnitPemohon] = useState<string>(() => {
    const defaultDept = loggedUser?.department?.department_name || ''
    const unitOptions = ['General ward', 'Paediatric Ward', 'Maternity Ward', 'Emergency & Trauma']
    return defaultDept && !unitOptions.includes(defaultDept) ? defaultDept : ''
  })
  const [unitPemohon, setUnitPemohon] = useState(loggedUser?.department?.department_name || '')
  const [namaPemohon, setNamaPemohon] = useState(loggedUser?.full_name || '')
  const [pengiring, setPengiring] = useState<PengiringType | 'tiada'>('tiada')
  const [escortList, setEscortList] = useState<EscortStaff[]>([])
  const [bawaPesakit, setBawaPesakit] = useState(false)
  const [tarikhTamat, setTarikhTamat] = useState('')
  const [masaTamat, setMasaTamat] = useState('')
  const [pemanduDiperlukan, setPemanduDiperlukan] = useState(true)
  const [senaraiPenumpang, setSenaraiPenumpang] = useState<{ name: string; department?: string }[]>([])
  const [catatanKhas, setCatatanKhas] = useState('')
  const [oksigenDiperlukan, setOksigenDiperlukan] = useState(false)
  const [selectedJenisOksigen, setSelectedJenisOksigen] = useState('')
  const [customJenisOksigen, setCustomJenisOksigen] = useState('')
  const [jenisOksigen, setJenisOksigen] = useState('')
  const [selectedMesin, setSelectedMesin] = useState<string[]>([])
  const [customMesin, setCustomMesin] = useState('')

  // Crossborder Form States
  const [isCrossborder, setIsCrossborder] = useState(false)
  const [borderControlPost, setBorderControlPost] = useState('Sindumin/Merapok Border Post')
  const [tempatBerlepas, setTempatBerlepas] = useState('Hospital Lawas')
  const [suratKebenaranRef, setSuratKebenaranRef] = useState(() => {
    const year = new Date().getFullYear()
    return `TF/HL/MW ( ${Math.floor(Math.random() * 50) + 1} ) ${year}`
  })
  const [pengarahNama, setPengarahNama] = useState('DR DOUGLAS CHU KIN SOON (Pengarah Hospital Lawas)')
  const [doktorPerujukNama, setDoktorPerujukNama] = useState('')
  const [crossborderCatatan, setCrossborderCatatan] = useState('')
  const [crossborderPatients, setCrossborderPatients] = useState<CrossborderPatientEmbedded[]>([
    { urutan: 1, nama: '', jantina: 'Lelaki', tarikh_lahir: '', warganegara: 'Warganegara Malaysia', jenis_dokumen: 'IC', no_dokumen: '' }
  ])
  const [crossborderKkmEscorts, setCrossborderKkmEscorts] = useState<KkmEscortEmbedded[]>([])
  const [crossborderWarisEscorts, setCrossborderWarisEscorts] = useState<WarisEscortEmbedded[]>([])


  // Patient Details

  const [namaPesakit, setNamaPesakit] = useState('')
  const [rnPesakit, setRnPesakit] = useState('')
  const [jantinaPesakit, setJantinaPesakit] = useState<'M' | 'F' | ''>('')
  const [diagnosisPesakit, setDiagnosisPesakit] = useState('')
  const [telefonPesakit, setTelefonPesakit] = useState('')
  const [patientMobility, setPatientMobility] = useState<'walking' | 'wheelchair' | 'stretcher' | ''>('')
  const [referringDoctorName, setReferringDoctorName] = useState('')
  const [selectedReferringDoctorDept, setSelectedReferringDoctorDept] = useState('')
  const [customReferringDoctorDept, setCustomReferringDoctorDept] = useState('')
  const [referringDoctorDept, setReferringDoctorDept] = useState('')

  useEffect(() => {
    if (jenisPermohonan === 'ambulance') {
      const dep = (tempatBerlepas || '').toLowerCase().trim();
      const dest = (destinasi || '').toLowerCase().trim();

      // Check if destination or departure implies crossing a border from Lawas
      const needsCrossBorder = 
        (dep.includes('lawas') && (dest.includes('limbang') || dest.includes('miri') || dest.includes('sipitang') || dest.includes('beaufort') || dest.includes('queen') || dest.includes('hqe') || dest.includes('sabah'))) ||
        (dest.includes('lawas') && (dep.includes('limbang') || dep.includes('miri') || dep.includes('sipitang') || dep.includes('beaufort') || dep.includes('queen') || dep.includes('hqe') || dep.includes('sabah')));

      setIsCrossborder(needsCrossBorder);

      if (needsCrossBorder) {
        if (dep.includes('lawas') && dest.includes('miri')) {
          setBorderControlPost(
            "1. Pos Kawalan Malaysia (Keluar) Kompleks ICQS Mengkalap (Lawas)\n" +
            "2. Pos Kawalan Brunei (Masuk) Pos Kawalan Labu (Temburong)\n" +
            "3. Pos Kawalan Brunei (Keluar) Pos Kawalan Ujong Jalan (Temburong)\n" +
            "4. Pos Kawalan Malaysia (Masuk) Kompleks ICQS Pandaruan (Limbang)\n" +
            "5. Pos Kawalan Malaysia (Keluar) Kompleks ICQS Tedungan (Limbang)\n" +
            "6. Pos Kawalan Brunei (Masuk) Pos Kawalan Kuala Lurah\n" +
            "7. Pos Kawalan Brunei (Keluar) Pos Kawalan Sungai Tujuh (Kuala Belait)\n" +
            "8. Pos Kawalan Malaysia (Masuk) Kompleks ICQS Sungai Tujuh (Miri)"
          );
        } else if (dep.includes('miri') && dest.includes('lawas')) {
          setBorderControlPost(
            "1. Pos Kawalan Malaysia (Keluar) Kompleks ICQS Sungai Tujuh (Miri)\n" +
            "2. Pos Kawalan Brunei (Masuk) Pos Kawalan Sungai Tujuh (Kuala Belait)\n" +
            "3. Pos Kawalan Brunei (Keluar) Pos Kawalan Kuala Lurah\n" +
            "4. Pos Kawalan Malaysia (Masuk) Kompleks ICQS Tedungan (Limbang)\n" +
            "5. Pos Kawalan Malaysia (Keluar) Kompleks ICQS Pandaruan (Limbang)\n" +
            "6. Pos Kawalan Brunei (Masuk) Pos Kawalan Ujong Jalan (Temburong)\n" +
            "7. Pos Kawalan Brunei (Keluar) Pos Kawalan Labu (Temburong)\n" +
            "8. Pos Kawalan Malaysia (Masuk) Kompleks ICQS Mengkalap (Lawas)"
          );
        } else if (dep.includes('lawas') && dest.includes('limbang')) {
          setBorderControlPost(
            "Kompleks ICQS Mengkalap (Lawas)\n" +
            "Pos Kawalan Imigresen Labu (Temburong, Brunei)\n" +
            "Kompleks Kawalan Dan Pemeriksaan Ujong Jalan (Temburong, Brunei)\n" +
            "Kompleks ICQS Tedungan (Limbang)"
          );
        } else if (dep.includes('limbang') && dest.includes('lawas')) {
          setBorderControlPost(
            "Kompleks ICQS Tedungan (Limbang)\n" +
            "Kompleks Kawalan Dan Pemeriksaan Ujong Jalan (Temburong, Brunei)\n" +
            "Pos Kawalan Imigresen Labu (Temburong, Brunei)\n" +
            "Kompleks ICQS Mengkalap (Lawas)"
          );
        } else if (dep.includes('lawas') && (dest.includes('sipitang') || dest.includes('beaufort') || dest.includes('queen') || dest.includes('hqe') || dest.includes('sabah'))) {
          setBorderControlPost(
            "Pos Kawalan Mengkalap (Lawas, Sarawak) - Kompleks CIQ Sarawak\n" +
            "Pos Kawalan Sindumin (Sipitang, Sabah) - Kompleks CIQ Sabah"
          );
        } else if ((dep.includes('sipitang') || dep.includes('beaufort') || dep.includes('queen') || dep.includes('hqe') || dep.includes('sabah')) && dest.includes('lawas')) {
          setBorderControlPost(
            "Pos Kawalan Sindumin (Sipitang, Sabah) - Kompleks CIQ Sabah\n" +
            "Pos Kawalan Mengkalap (Lawas, Sarawak) - Kompleks CIQ Sarawak"
          );
        } else {
          setBorderControlPost("Sindumin/Merapok Border Post");
        }
      }
    }
  }, [jenisPermohonan, tempatBerlepas, destinasi]);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchRequestDetails = async () => {
        try {
          const res = await getRequestById(id)
          if (res.data) {
            const req = res.data
            setOriginalStatus(req.status_semasa)
            setJenisPermohonan(req.jenis_permohonan as any)
            setTujuanPermohonan(req.tujuan_permohonan)
            setDestinasi(req.destinasi)
            
            // Split tarikh_masa_diperlukan to date and time
            const dt = new Date(req.tarikh_masa_diperlukan)
            const dateStr = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0')
            const timeStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0')
            setTarikhDiperlukan(dateStr)
            setMasaDiperlukan(timeStr)
            
            setUnitPemohon(req.unit_pemohon)
            const unitOptions = ['General ward', 'Paediatric Ward', 'Maternity Ward', 'Emergency & Trauma']
            if (unitOptions.includes(req.unit_pemohon)) {
              setSelectedUnitPemohon(req.unit_pemohon)
            } else {
              setSelectedUnitPemohon('others')
              setCustomUnitPemohon(req.unit_pemohon)
            }
            
            setNamaPemohon(req.nama_pemohon || '')
            setEscortList(req.pengiring_list || [])
            if (req.pengiring_list && req.pengiring_list.length > 0) {
              setPengiring(req.pengiring_list[0].job as any)
            } else {
              setPengiring('tiada')
            }
            
            setBawaPesakit(req.bawa_pesakit || false)
            setCatatanKhas(req.catatan_khas || '')
            setOksigenDiperlukan(req.oksigen_diperlukan || false)
            
            if (req.oksigen_diperlukan && req.jenis_oksigen) {
              const oxyOptions = ['Nasal prong', 'face mask', 'venturi mask', 'high flow mask', 'Tracheal Mask', 'intubated']
              if (oxyOptions.includes(req.jenis_oksigen)) {
                setSelectedJenisOksigen(req.jenis_oksigen)
              } else {
                setSelectedJenisOksigen('others')
                setCustomJenisOksigen(req.jenis_oksigen)
              }
              setJenisOksigen(req.jenis_oksigen)
            }
            
            if (req.mesin_diperlukan && req.mesin_diperlukan.length > 0) {
              const cleanMesin = req.mesin_diperlukan.map(m => {
                if (m.startsWith('others (')) {
                  const custom = m.replace('others (', '').replace(')', '')
                  setCustomMesin(custom)
                  return 'others'
                }
                return m
              })
              setSelectedMesin(cleanMesin)
            }
            
            setNamaPesakit(req.nama_pesakit || '')
            setRnPesakit(req.rn_pesakit || '')
            setJantinaPesakit(req.jantina_pesakit === 'Lelaki' || req.jantina_pesakit === 'M' ? 'M' : req.jantina_pesakit === 'Perempuan' || req.jantina_pesakit === 'F' ? 'F' : '')
            setDiagnosisPesakit(req.diagnosis_pesakit || '')
            setTelefonPesakit(req.telefon_pesakit || '')
            setPatientMobility(req.patient_mobility || '')
            
            if (req.medical_officer_referring) {
              setReferringDoctorName(req.medical_officer_referring.name)
              const deptOptions = ['Emergency & Trauma', 'General ward', 'Paediatric Ward', 'Maternity Ward']
              if (deptOptions.includes(req.medical_officer_referring.department)) {
                setSelectedReferringDoctorDept(req.medical_officer_referring.department)
              } else {
                setSelectedReferringDoctorDept('others')
                setCustomReferringDoctorDept(req.medical_officer_referring.department)
              }
              setReferringDoctorDept(req.medical_officer_referring.department)
            }

            if (req.jenis_permohonan === 'ambulance') {
              const optionsMap: Record<string, string> = {
                'Refer Patient to other government facility': 'refer_patient',
                'CT Scan to other government facility': 'ct_scan',
                'MRI Scan to other government facility': 'mri_scan'
              }
              const key = optionsMap[req.tujuan_permohonan]
              if (key) {
                setSelectedAmbulanceTujuan(key)
              } else {
                setSelectedAmbulanceTujuan('other')
                setCustomTujuan(req.tujuan_permohonan)
              }
            }

            const destOptions = ['Hospital Limbang', 'Hospital Miri', 'Hospital Lawas', 'Hospital Bintulu']
            if (destOptions.includes(req.destinasi)) {
              setSelectedDestinasi(req.destinasi)
            } else {
              setSelectedDestinasi('others')
              setCustomDestinasi(req.destinasi)
            }

            if (req.tarikh_masa_sehingga) {
              const dtTamat = new Date(req.tarikh_masa_sehingga)
              const dateTamatStr = dtTamat.getFullYear() + '-' + String(dtTamat.getMonth() + 1).padStart(2, '0') + '-' + String(dtTamat.getDate()).padStart(2, '0')
              const timeTamatStr = String(dtTamat.getHours()).padStart(2, '0') + ':' + String(dtTamat.getMinutes()).padStart(2, '0')
              setTarikhTamat(dateTamatStr)
              setMasaTamat(timeTamatStr)
            }
            if (req.pemandu_diperlukan !== undefined) {
              setPemanduDiperlukan(req.pemandu_diperlukan)
            }
            if (req.senarai_penumpang) {
              setSenaraiPenumpang(req.senarai_penumpang)
            }
            if (req.is_crossborder) {
              setIsCrossborder(true)
              if (req.crossborder_data) {
                setBorderControlPost(req.crossborder_data.border_control_post || '')
                setTempatBerlepas(req.crossborder_data.tempat_berlepas || '')
                setSuratKebenaranRef(req.crossborder_data.surat_kebenaran_ref || '')
                setPengarahNama(req.crossborder_data.pengarah_nama || '')
                setDoktorPerujukNama(req.crossborder_data.doktor_perujuk_nama || '')
                setCrossborderCatatan(req.crossborder_data.catatan || '')
                setCrossborderPatients(req.crossborder_data.patients || [])
                setCrossborderKkmEscorts(req.crossborder_data.kkm_escorts || [])
                setCrossborderWarisEscorts(req.crossborder_data.waris_escorts || [])
              }
            }
          }
        } catch (err: any) {
          toast.error('Failed to Load Requisitions', err.message || 'Sila cuba lagi.')
        }
      }
      fetchRequestDetails()
    }
  }, [isEditMode, id])

  useEffect(() => {
    const prefill = (location.state as any)?.prefill
    if (prefill) {
      if (prefill.jenisPermohonan) setJenisPermohonan(prefill.jenisPermohonan)
      if (prefill.tarikhDiperlukan) setTarikhDiperlukan(prefill.tarikhDiperlukan)
    }
  }, [location.state])

  const handleAddPatient = () => {
    if (crossborderPatients.length >= 3) {
      toast.error('Maksimum Pesakit', 'Maksimum 3 pesakit sahaja dibenarkan bagi setiap pemindahan merentas sempadan.')
      return
    }
    const newPatients = [
      ...crossborderPatients,
      { urutan: crossborderPatients.length + 1, nama: '', jantina: 'Lelaki' as Jantina, tarikh_lahir: '', warganegara: 'Warganegara Malaysia', jenis_dokumen: 'IC' as JenisDokumen, no_dokumen: '' }
    ]
    setCrossborderPatients(newPatients)
    if (newPatients[0]) {
      setNamaPesakit(newPatients[0].nama)
      setRnPesakit(newPatients[0].no_pengenalan || newPatients[0].no_dokumen)
      setJantinaPesakit(newPatients[0].jantina === 'Perempuan' ? 'F' : 'M')
    }
  }

  const handleRemovePatient = (idx: number) => {
    if (crossborderPatients.length <= 1) return
    const filtered = crossborderPatients.filter((_, i) => i !== idx).map((p, i) => ({ ...p, urutan: i + 1 }))
    setCrossborderPatients(filtered)
    setCrossborderWarisEscorts(crossborderWarisEscorts.filter((_, i) => i !== idx))
    if (filtered[0]) {
      setNamaPesakit(filtered[0].nama)
      setRnPesakit(filtered[0].no_pengenalan || filtered[0].no_dokumen)
      setJantinaPesakit(filtered[0].jantina === 'Perempuan' ? 'F' : 'M')
    }
  }

  const handlePatientFieldChange = (idx: number, field: string, value: any) => {
    const updated = [...crossborderPatients]
    updated[idx] = { ...updated[idx], [field]: value }
    setCrossborderPatients(updated)
    if (idx === 0) {
      if (field === 'nama') setNamaPesakit(value)
      if (field === 'no_dokumen') setRnPesakit(value)
      if (field === 'jantina') setJantinaPesakit(value === 'Perempuan' ? 'F' : 'M')
    }
  }

  const getVisibleSteps = () => {
    const steps = [
      { id: 1, label: isEn ? 'Trip Details' : 'Butiran Trip' }
    ]
    if (jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || (jenisPermohonan === 'sg' && bawaPesakit)) {
      steps.push({ id: 2, label: isEn ? 'Unit & Escorts' : 'Unit & Pengiring' })
      steps.push({ id: 3, label: isEn ? 'Patient Details' : 'Pesakit' })
    }
    if (isCrossborder && jenisPermohonan === 'ambulance') {
      steps.push({ id: 4, label: isEn ? 'Cross-Border' : 'Sempadan' })
    }
    steps.push({ id: 5, label: isEn ? 'Confirm & Submit' : 'Confirm & Submit' })
    return steps
  }

  const handleNextStep = () => {
    const visibleSteps = getVisibleSteps()
    // Basic validation per step
    if (step === 1) {
      if (!tujuanPermohonan || !destinasi || !tarikhDiperlukan || !masaDiperlukan) {
        toast.error(
          isEn ? 'Incomplete Form' : 'Incomplete Form', 
          isEn ? 'Please fill in purpose, destination, date, and required time.' : 'Please enter the purpose, destination, date, and required time.'
        )
        return
      }
      if (jenisPermohonan === 'sg') {
        if (!tarikhTamat || !masaTamat) {
          toast.error(
            isEn ? 'Incomplete Form' : 'Incomplete Form', 
            isEn ? 'Please specify reservation end date and time.' : 'Sila isi tarikh dan masa tamat tempahan.'
          )
          return
        }
        const startDt = new Date(`${tarikhDiperlukan}T${masaDiperlukan}`)
        const endDt = new Date(`${tarikhTamat}T${masaTamat}`)
        if (endDt <= startDt) {
          toast.error(
            isEn ? 'Invalid Time Range' : 'Ralat Masa Tempahan', 
            isEn ? 'End date/time must be strictly after start date/time.' : 'Tarikh dan masa tamat mestilah selepas tarikh dan masa mula.'
          )
          return
        }
      }
    } else if (step === 2) {
      if (!unitPemohon) {
        toast.error(
          isEn ? 'Incomplete Form' : 'Incomplete Form', 
          isEn ? 'Please specify Requester Unit/Ward.' : 'Sila nyatakan Unit/Wad Pemohon.'
        )
        return
      }
      if (!namaPemohon.trim()) {
        toast.error(
          isEn ? 'Incomplete Form' : 'Incomplete Form', 
          isEn ? 'Please specify Applicant Name.' : 'Sila nyatakan Nama Pemohon.'
        )
        return
      }
      if (!referringDoctorName.trim() || !referringDoctorDept.trim()) {
        toast.error(
          isEn ? 'Incomplete Form' : 'Incomplete Form', 
          isEn ? 'Please specify Referring Medical Officer name and department.' : 'Sila nyatakan nama dan jabatan Pegawai Perubatan Merujuk.'
        )
        return
      }
      const invalidEscort = escortList.some(escort => !escort.name.trim())
      if (invalidEscort) {
        toast.error(
          isEn ? 'Incomplete Form' : 'Incomplete Form', 
          isEn ? 'Please provide names for all escort personnel.' : 'Sila isi nama bagi setiap kakitangan pengiring.'
        )
        return
      }
    } else if (step === 3) {
      // If patient details are required (Ambulance, Van Jenazah, or SG bringing patient)
      const needsPatient = jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || (jenisPermohonan === 'sg' && bawaPesakit)
      if (needsPatient) {
        if (isCrossborder) {
          // Validate crossborder patient data (first patient must be filled)
          const p1 = crossborderPatients[0]
          if (!p1 || !p1.nama.trim() || !p1.no_dokumen.trim() || !p1.tarikh_lahir) {
            toast.error(
              isEn ? 'Incomplete Form' : 'Incomplete Form', 
              isEn ? 'Please provide complete details for Patient 1 (Name, Date of Birth, Nationality, ID/Doc No).' : 'Sila isi butiran lengkap Pesakit 1 (Nama, Tarikh Lahir, Warganegara, No. Dokumen).'
            )
            return
          }
          if (!diagnosisPesakit) {
            toast.error(
              isEn ? 'Incomplete Form' : 'Incomplete Form', 
              isEn ? 'Please state the Primary Diagnosis of the patient.' : 'Sila nyatakan Diagnosis Utama Pesakit.'
            )
            return
          }
          if (jenisPermohonan !== 'van_jenazah' && !patientMobility) {
            toast.error(
              isEn ? 'Incomplete Form' : 'Incomplete Form', 
              isEn ? 'Please select Patient Mobility.' : 'Sila pilih Keupayaan Bergerak Pesakit (Patient Mobility).'
            )
            return
          }
        } else {
          if (!namaPesakit || !rnPesakit || !jantinaPesakit || !diagnosisPesakit || !patientMobility) {
            const patientLabel = jenisPermohonan === 'van_jenazah' ? (isEn ? 'deceased' : 'jenazah') : (isEn ? 'patient' : 'pesakit')
            const diagnosisLabel = jenisPermohonan === 'van_jenazah' ? (isEn ? 'Cause of Death' : 'Sebab Kematian') : (isEn ? 'Diagnosis' : 'Diagnosis')
            toast.error(
              isEn ? 'Incomplete Form' : 'Incomplete Form', 
              isEn 
                ? `Please fill in complete details for ${patientLabel} (Name, RN, Gender, ${diagnosisLabel}, Mobility).` 
                : `Sila isi butiran lengkap ${patientLabel} (Nama, RN, Jantina, ${diagnosisLabel}, Mobiliti).`
            )
            return
          }
        }
      }
      if (jenisPermohonan === 'ambulance' && oksigenDiperlukan) {
        if (!jenisOksigen) {
          toast.error(
            isEn ? 'Incomplete Form' : 'Incomplete Form', 
            isEn ? 'Please select oxygen delivery mode.' : 'Sila pilih jenis sokongan oksigen.'
          )
          return
        }
      }
      if (jenisPermohonan === 'ambulance' && selectedMesin.includes('others')) {
        if (!customMesin.trim()) {
          toast.error(
            isEn ? 'Incomplete Form' : 'Incomplete Form', 
            isEn ? 'Please specify other equipment/devices required.' : 'Sila nyatakan mesin/peralatan lain yang diperlukan.'
          )
          return
        }
      }
    } else if (step === 4) {
      // Validate crossborder specific data
      if (!borderControlPost.trim() || !tempatBerlepas.trim() || !pengarahNama.trim() || !doktorPerujukNama.trim()) {
        toast.error(
          isEn ? 'Incomplete Form' : 'Incomplete Form', 
          isEn ? 'Please fill in Border Post, Departure Place, Referring Doctor, and Hospital Director name.' : 'Sila isi Pintu Kawalan Sempadan, Tempat Berlepas, Doktor Perujuk, dan Nama Pengarah.'
        )
        return
      }
    }

    const currentIdx = visibleSteps.findIndex(s => s.id === step)
    if (currentIdx !== -1 && currentIdx < visibleSteps.length - 1) {
      setStep(visibleSteps[currentIdx + 1].id)
    }
  }

  const handlePrevStep = () => {
    const visibleSteps = getVisibleSteps()
    const currentIdx = visibleSteps.findIndex(s => s.id === step)
    if (currentIdx > 0) {
      setStep(visibleSteps[currentIdx - 1].id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const hospitalId = loggedUser?.hospital_id || 'hosp-1'
      const pemohonId = loggedUser?.id || ''

      const combinedDateTime = new Date(`${tarikhDiperlukan}T${masaDiperlukan}`).toISOString()
      const combinedEndDateTime = (jenisPermohonan === 'sg' && tarikhTamat && masaTamat) 
        ? new Date(`${tarikhTamat}T${masaTamat}`).toISOString() 
        : undefined

      const payload: any = {
        jenis_permohonan: jenisPermohonan,
        tujuan_permohonan: tujuanPermohonan,
        destinasi: destinasi,
        tarikh_masa_diperlukan: combinedDateTime,
        tarikh_masa_sehingga: combinedEndDateTime,
        unit_pemohon: unitPemohon,
        nama_pemohon: namaPemohon,
        pengiring: escortList.length > 0 ? escortList[0].job : undefined,
        pengiring_list: escortList,
        medical_officer_referring: referringDoctorName || referringDoctorDept ? {
          name: referringDoctorName,
          department: referringDoctorDept
        } : undefined,
        bawa_pesakit: bawaPesakit || jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah',
        nama_pesakit: (jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || bawaPesakit) ? (isCrossborder ? crossborderPatients[0]?.nama : namaPesakit) : undefined,
        rn_pesakit: (jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || bawaPesakit) ? (isCrossborder ? (crossborderPatients[0]?.no_pengenalan || crossborderPatients[0]?.no_dokumen) : rnPesakit) : undefined,
        jantina_pesakit: (jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || bawaPesakit) ? (isCrossborder ? crossborderPatients[0]?.jantina : (jantinaPesakit === 'M' ? 'Lelaki' : 'Perempuan')) : undefined,
        diagnosis_pesakit: (jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || bawaPesakit) ? diagnosisPesakit : undefined,
        telefon_pesakit: (jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || bawaPesakit) ? telefonPesakit : undefined,
        patient_mobility: (jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || bawaPesakit) ? (patientMobility || undefined) : undefined,
        catatan_khas: catatanKhas || undefined,
        oksigen_diperlukan: jenisPermohonan === 'ambulance' ? oksigenDiperlukan : false,
        jenis_oksigen: (jenisPermohonan === 'ambulance' && oksigenDiperlukan) ? jenisOksigen : undefined,
        mesin_diperlukan: (jenisPermohonan === 'ambulance' && selectedMesin.length > 0) ? selectedMesin.map(m => m === 'others' ? `others (${customMesin})` : m) : undefined,
        pemohon_id: pemohonId,
        hospital_id: hospitalId,
        pemandu_diperlukan: jenisPermohonan === 'sg' ? pemanduDiperlukan : undefined,
        senarai_penumpang: jenisPermohonan === 'sg' ? senaraiPenumpang : undefined,
        is_crossborder: isCrossborder,
        crossborder_data: isCrossborder ? {
          border_control_post: borderControlPost,
          tempat_berlepas: tempatBerlepas,
          surat_kebenaran_ref: suratKebenaranRef,
          pengarah_nama: pengarahNama,
          doktor_perujuk_nama: doktorPerujukNama,
          catatan: crossborderCatatan,
          patients: crossborderPatients,
          kkm_escorts: crossborderKkmEscorts,
          waris_escorts: crossborderWarisEscorts
        } : undefined
      }

      if (isEditMode && id) {
        const res = await updateRequest(id, payload)
        if (res.error) throw new Error(res.error)
        
        await logRequestTransition(
          id,
          'Pindaan Permohonan',
          originalStatus || 'submitted',
          originalStatus || 'submitted',
          `Sebab pindaan: ${editReason || 'Tiada sebab dinyatakan'}`,
          loggedUser?.id || '',
          hospitalId
        )
        toast.success('Permohonan Dikemaskini', 'Permohonan pengangkutan berjaya dikemaskini.')
      } else {
        const res = await createRequest(payload)
        if (res.error) throw new Error(res.error)
        toast.success('Requisition Submitted', `Permohonan pengangkutan berjaya didaftarkan dengan No. Rujukan ${res.data?.no_rujukan}`)
      }
      navigate('/transporter/requests/my')
    } catch (err: any) {
      toast.error('Gagal Menghantar Permohonan', err.message || 'Sila cuba sekali lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPatientSectionRequired = jenisPermohonan === 'ambulance' || jenisPermohonan === 'van_jenazah' || (jenisPermohonan === 'sg' && bawaPesakit)

  return (
    <div className="w-full p-6 md:p-8 space-y-6">
      {/* Back button */}
      <button 
        onClick={() => navigate('/transporter/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isEn ? 'Back to Dashboard' : 'Kembali ke Papan Pemuka'}</span>
      </button>

      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isEditMode 
            ? (isEn ? 'Update Transport Requisition' : 'Kemaskini Permohonan Pengangkutan') 
            : (isEn ? 'Transport Requisition Form' : 'Borang Permohonan Pengangkutan')}
        </h1>
        <p className="text-slate-500 text-sm">
          {isEditMode 
            ? (isEn ? 'Please amend the details below to update transport booking.' : 'Sila kemaskini butiran di bawah untuk pindaan tempahan pengangkutan.')
            : (isEn ? 'Please fill in details below to book Ambulance, Official Vehicle (SG), or Hearse Van.' : 'Sila isi butiran di bawah untuk menempah Ambulans, Kereta Jabatan (SG), atau Van Jenazah.')}
        </p>
      </div>

      {/* Step Tracker Indicator */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
        {getVisibleSteps().map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step === s.id 
                ? 'bg-blue-600 text-white' 
                : step > s.id 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-200 text-slate-500'
            }`}>
              {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : (idx + 1)}
            </span>
            <span className={`text-xs font-bold hidden sm:inline ${step === s.id ? 'text-blue-600' : 'text-slate-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            
            {/* STEP 1: TRIP DETAILS */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  {isEn ? 'Step 1: Trip Type & Itinerary Details' : 'Langkah 1: Butiran Jenis Trip'}
                </h3>
                
                {/* Request Type Toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isEn ? 'Transport Category' : 'Jenis Pengangkutan'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setJenisPermohonan('ambulance')
                        setBawaPesakit(true)
                        setTujuanPermohonan('')
                        setSelectedAmbulanceTujuan('')
                        setCustomTujuan('')
                        setDestinasi('')
                        setSelectedDestinasi('')
                        setCustomDestinasi('')
                      }}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        jenisPermohonan === 'ambulance'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Ambulance className="w-8 h-8" />
                      <span className="font-bold text-sm">{isEn ? 'Ambulance' : 'Ambulans'}</span>
                      <span className="text-xxs text-slate-400 text-center">
                        {isEn ? 'Referral, CT Scan, Emergency' : 'Referral, CT Scan, Emergency'}
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setJenisPermohonan('sg')
                        setBawaPesakit(false)
                        setTujuanPermohonan('')
                        setDestinasi('')
                        setSelectedDestinasi('')
                        setCustomDestinasi('')
                      }}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        jenisPermohonan === 'sg'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Car className="w-8 h-8" />
                      <span className="font-bold text-sm">{isEn ? 'Official Vehicle (SG)' : 'Kereta Jabatan (SG)'}</span>
                      <span className="text-xxs text-slate-400 text-center">
                        {isEn ? 'Official Duties / Logistics / Admin' : 'Tujuan Rasmi Staff / Penghantaran'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setJenisPermohonan('van_jenazah')
                        setBawaPesakit(true)
                        setPatientMobility('stretcher')
                        setTujuanPermohonan('')
                        setDestinasi('')
                        setSelectedDestinasi('')
                        setCustomDestinasi('')
                      }}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        jenisPermohonan === 'van_jenazah'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Truck className="w-8 h-8" />
                      <span className="font-bold text-sm">{isEn ? 'Hearse Van' : 'Van Jenazah'}</span>
                      <span className="text-xxs text-slate-400 text-center">
                        {isEn ? 'Mortuary / Funeral Transit' : 'Pengurusan / Penghantaran Jenazah'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isEn ? 'Trip Purpose' : 'Tujuan Perjalanan'}
                  </label>
                  {jenisPermohonan === 'ambulance' ? (
                    <div className="space-y-3">
                      <select 
                        value={selectedAmbulanceTujuan}
                        onChange={(e) => {
                          const val = e.target.value
                          setSelectedAmbulanceTujuan(val)
                          if (val === 'other') {
                            setTujuanPermohonan(customTujuan)
                          } else if (val) {
                            const optionsMap: Record<string, string> = {
                              'refer_patient': 'Refer Patient to other government facility',
                              'ct_scan': 'CT Scan to other government facility',
                              'mri_scan': 'MRI Scan to other government facility'
                            }
                            setTujuanPermohonan(optionsMap[val] || '')
                          } else {
                            setTujuanPermohonan('')
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
                        required
                      >
                        <option value="">{isEn ? 'Please Select Purpose' : 'Sila Pilih Tujuan'}</option>
                        <option value="refer_patient">Refer Patient to other government facility</option>
                        <option value="ct_scan">CT Scan to other government facility</option>
                        <option value="mri_scan">MRI Scan to other government facility</option>
                        <option value="other">{isEn ? 'Other' : 'Lain-lain (Other)'}</option>
                      </select>
                      
                      {selectedAmbulanceTujuan === 'other' && (
                        <Input 
                          placeholder={isEn ? 'Please specify journey purpose manually' : 'Sila nyatakan tujuan perjalanan secara manual'}
                          value={customTujuan}
                          onChange={(e) => {
                            setCustomTujuan(e.target.value)
                            setTujuanPermohonan(e.target.value)
                          }}
                          required
                        />
                      )}
                    </div>
                  ) : (
                    <Input 
                      placeholder={
                        jenisPermohonan === 'van_jenazah' 
                          ? (isEn ? 'E.g., Transfer deceased to Kampung Seberang / Cemetery' : 'Contoh: Penghantaran jenazah ke Kampung Seberang / Tanah Perkuburan')
                          : (isEn ? 'E.g., Blood sample courier / Patient appointment / Official meeting' : 'Contoh: Menghantar sampel darah / Temujanji CT scan pesakit / Mesyuarat rasmi JKN')
                      }
                      value={tujuanPermohonan}
                      onChange={(e) => setTujuanPermohonan(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isEn ? 'Destination' : 'Destinasi'}
                  </label>
                  {jenisPermohonan === 'van_jenazah' ? (
                    <Input 
                      placeholder={isEn ? 'Enter village name, residence, or funeral delivery destination' : 'Masukkan nama kampung, rumah, atau tempat destinasi jenazah dihantar'}
                      value={destinasi}
                      onChange={(e) => setDestinasi(e.target.value)}
                      required
                    />
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={selectedDestinasi}
                        onChange={(e) => {
                          const val = e.target.value
                          setSelectedDestinasi(val)
                          if (val === 'others') {
                            setDestinasi(customDestinasi)
                          } else if (val) {
                            setDestinasi(val)
                          } else {
                            setDestinasi('')
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
                        required
                      >
                        <option value="">{isEn ? 'Please Select Destination' : 'Sila Pilih Destinasi'}</option>
                        <option value="Hospital Limbang">Hospital Limbang</option>
                        <option value="Hospital Sipitang">Hospital Sipitang</option>
                        <option value="Hospital Miri">Hospital Miri</option>
                        <option value="Hospital Beaufort">Hospital Beaufort</option>
                        <option value="Hospital Queen Elizabeth I (HQE I)">Hospital Queen Elizabeth I (HQE I)</option>
                        <option value="Hospital Queen Elizabeth II (HQE II)">Hospital Queen Elizabeth II (HQE II)</option>
                        <option value="others">{isEn ? 'Others (Specify)' : 'Lain-lain (Nyatakan)'}</option>
                      </select>

                      {selectedDestinasi === 'others' && (
                        <Input 
                          placeholder={isEn ? 'Please specify destination manually' : 'Sila nyatakan destinasi secara manual'}
                          value={customDestinasi}
                          onChange={(e) => {
                            setCustomDestinasi(e.target.value)
                            setDestinasi(e.target.value)
                          }}
                          required
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Rentasi Sempadan Toggle Checkbox */}
                {jenisPermohonan === 'ambulance' && (
                  <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block cursor-pointer" htmlFor="is_crossborder_check">
                        {isEn 
                          ? 'This Journey Involves Cross-Border Transit (Sabah-Sarawak / Sarawak-Brunei)'
                          : 'Perjalanan Ini Melibatkan Rentasi Sempadan (Sabah-Sarawak / Sarawak-Brunei)'}
                      </label>
                      <span className="block text-[10px] text-slate-500">
                        {isEn 
                          ? 'Check this if the ambulance must cross Sabah-Sarawak or Sarawak-Brunei border checkpoints.'
                          : 'Tandakan jika ambulans perlu melalui pos sempadan Sabah-Sarawak atau Sarawak-Brunei.'}
                      </span>
                    </div>
                    <input
                      id="is_crossborder_check"
                      type="checkbox"
                      checked={isCrossborder}
                      onChange={(e) => {
                        setIsCrossborder(e.target.checked)
                      }}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                )}

                {/* Date & Time & SG Specific fields */}
                {jenisPermohonan === 'sg' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/60">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {isEn ? 'Start Date & Time of Booking' : 'Tarikh & Masa Mula Tempahan'}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            type="date"
                            value={tarikhDiperlukan}
                            onChange={(e) => setTarikhDiperlukan(e.target.value)}
                            required
                          />
                          <Input 
                            type="time"
                            value={masaDiperlukan}
                            onChange={(e) => setMasaDiperlukan(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/60">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {isEn ? 'End Date & Time of Booking' : 'Tarikh & Masa Tamat Tempahan'}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            type="date"
                            value={tarikhTamat}
                            onChange={(e) => setTarikhTamat(e.target.value)}
                            required
                          />
                          <Input 
                            type="time"
                            value={masaTamat}
                            onChange={(e) => setMasaTamat(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Driver Requirement Toggle */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {isEn ? 'Service Requirement' : 'Keperluan Perkhidmatan'}
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPemanduDiperlukan(false)}
                          className={`p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                            !pemanduDiperlukan
                              ? 'border-blue-600 bg-blue-50/50 text-blue-750 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isEn ? 'Vehicle Only (Self-Drive)' : 'Kereta Sahaja (Tanpa Pemandu)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPemanduDiperlukan(true)}
                          className={`p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                            pemanduDiperlukan
                              ? 'border-blue-600 bg-blue-50/50 text-blue-750 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isEn ? 'Driver & Vehicle' : 'Pemandu & Kereta'}
                        </button>
                      </div>
                    </div>

                    {/* Passenger List */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {isEn ? 'Passenger Roster (Staff/Accompanying)' : 'Senarai Penumpang (Staf/Pengikut)'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setSenaraiPenumpang([...senaraiPenumpang, { name: '' }])}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors font-semibold cursor-pointer"
                        >
                          {isEn ? '+ Add Passenger' : '+ Tambah Penumpang'}
                        </button>
                      </div>
                      {senaraiPenumpang.length === 0 ? (
                        <div className="text-center py-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                          {isEn 
                            ? 'No passengers added. Click "+ Add Passenger" if additional staff are traveling.'
                            : 'Tiada penumpang ditambah. Sila klik "+ Tambah Penumpang" jika ada penumpang lain.'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {senaraiPenumpang.map((passenger, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input 
                                placeholder={isEn ? `Passenger Name ${idx + 1}` : `Nama Penumpang ${idx + 1}`}
                                value={passenger.name}
                                onChange={(e) => {
                                  const updated = [...senaraiPenumpang]
                                  updated[idx].name = e.target.value
                                  setSenaraiPenumpang(updated)
                                }}
                                className="text-xs"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setSenaraiPenumpang(senaraiPenumpang.filter((_, i) => i !== idx))}
                                className="text-rose-600 hover:text-rose-800 text-lg font-bold p-1 px-2 cursor-pointer"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Patient Toggle Option */}
                    <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {isEn ? 'Does this trip carry a patient?' : 'Trip Ini Membawa Pesakit?'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {isEn 
                              ? 'Please indicate if this official SG vehicle will transport a hospital patient.'
                              : 'Sila nyatakan jika kenderaan SG akan digunakan untuk membawa pesakit hospital.'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setBawaPesakit(true)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              bawaPesakit
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                            }`}
                          >
                            {isEn ? 'Yes (Open Patient Details)' : 'Ya (Buka Butiran Pesakit)'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setBawaPesakit(false)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              !bawaPesakit
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                            }`}
                          >
                            {isEn ? 'No (Bypass)' : 'Tidak (Bypass)'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {isEn ? 'Required Date' : 'Tarikh Diperlukan'}
                      </label>
                      <Input 
                        type="date"
                        value={tarikhDiperlukan}
                        onChange={(e) => setTarikhDiperlukan(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {isEn ? 'Required Time' : 'Masa Diperlukan'}
                      </label>
                      <Input 
                        type="time"
                        value={masaDiperlukan}
                        onChange={(e) => setMasaDiperlukan(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: UNIT & ESCORT */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  {isEn ? 'Step 2: Requesting Unit & Escort Roster' : 'Langkah 2: Unit Pemohon & Pengiring'}
                </h3>

                {/* Requester Unit & Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isEn ? 'Applicant Unit / Ward' : 'Unit / Wad Pemohon'}
                    </label>
                    <div className="space-y-3">
                      <select
                        value={selectedUnitPemohon}
                        onChange={(e) => {
                          const val = e.target.value
                          setSelectedUnitPemohon(val)
                          if (val === 'others') {
                            setUnitPemohon(customUnitPemohon)
                          } else if (val) {
                            setUnitPemohon(val)
                          } else {
                            setUnitPemohon('')
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
                        required
                      >
                        <option value="">{isEn ? 'Please Select Unit / Ward' : 'Sila Pilih Unit / Wad'}</option>
                        <option value="General ward">General ward</option>
                        <option value="Paediatric Ward">Paediatric Ward</option>
                        <option value="Maternity Ward">Maternity Ward</option>
                        <option value="Emergency & Trauma">Emergency & Trauma</option>
                        <option value="others">{isEn ? 'Others (specify)' : 'Lain-lain (Nyatakan)'}</option>
                      </select>

                      {selectedUnitPemohon === 'others' && (
                        <Input 
                          placeholder={isEn ? 'Please specify unit / ward manually' : 'Sila nyatakan unit / wad secara manual'}
                          value={customUnitPemohon}
                          onChange={(e) => {
                            setCustomUnitPemohon(e.target.value)
                            setUnitPemohon(e.target.value)
                          }}
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isEn ? 'Applicant Name' : 'Nama Pemohon'}
                    </label>
                    <Input 
                      placeholder={isEn ? 'E.g., Sarah Ahmad' : 'Contoh: Sarah Ahmad'}
                      value={namaPemohon}
                      onChange={(e) => setNamaPemohon(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Referring Medical Officer */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isEn ? 'Referring Medical Officer (MO)' : 'Pegawai Perubatan Merujuk (Referring Medical Officer)'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                        {isEn ? 'Medical Officer Name' : 'Nama Pegawai Perubatan'}
                      </label>
                      <select
                        value={referringDoctorName}
                        onChange={(e) => setReferringDoctorName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-600 transition-colors cursor-pointer"
                        required
                      >
                        <option value="">{isEn ? 'Please Select Medical Officer' : 'Sila Pilih Nama Pegawai Perubatan'}</option>
                        {DOCTOR_OPTIONS.map((dr) => (
                          <option key={dr} value={dr}>{dr}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
                        {isEn ? 'Department' : 'Jabatan'}
                      </label>
                      <div className="space-y-2">
                        <select
                          value={selectedReferringDoctorDept}
                          onChange={(e) => {
                            const val = e.target.value
                            setSelectedReferringDoctorDept(val)
                            if (val === 'others') {
                              setReferringDoctorDept(customReferringDoctorDept)
                            } else if (val) {
                              setReferringDoctorDept(val)
                            } else {
                              setReferringDoctorDept('')
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-600 transition-colors cursor-pointer"
                          required
                        >
                          <option value="">{isEn ? 'Please Select Department' : 'Sila Pilih Jabatan'}</option>
                          <option value="Emergency & Trauma">Emergency & Trauma</option>
                          <option value="General ward">General ward</option>
                          <option value="Paediatric Ward">Paediatric Ward</option>
                          <option value="Maternity Ward">Maternity Ward</option>
                          <option value="others">{isEn ? 'Others (specify)' : 'Lain-lain (Nyatakan)'}</option>
                        </select>

                        {selectedReferringDoctorDept === 'others' && (
                          <Input 
                            placeholder={isEn ? 'Please specify department manually' : 'Sila nyatakan jabatan secara manual'}
                            value={customReferringDoctorDept}
                            onChange={(e) => {
                              setCustomReferringDoctorDept(e.target.value)
                              setReferringDoctorDept(e.target.value)
                            }}
                            className="text-xs px-3 py-2 rounded-lg"
                            required
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Escort / Pengiring */}
                {!isCrossborder ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {isEn ? 'Assigned Duty Escort Personnel' : 'Kakitangan Pengiring Bertugas'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setEscortList([...escortList, { job: 'nurse', name: '' }])}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors font-semibold cursor-pointer"
                      >
                        {isEn ? '+ Add Escort Staff' : '+ Tambah Kakitangan'}
                      </button>
                    </div>

                    {escortList.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                        {isEn 
                          ? 'No Escort Personnel Added. Click "+ Add Escort Staff" if medical escorts are assigned.'
                          : 'Tiada Kakitangan Pengiring Ditambah. Sila klik "+ Tambah Kakitangan" jika ada pengiring bertugas.'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {escortList.map((escort, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/80 animate-fadeIn">
                            {/* Job Select */}
                            <div className="col-span-5">
                              <select
                                value={escort.job}
                                onChange={(e) => {
                                  const newList = [...escortList]
                                  newList[index].job = e.target.value as PengiringType
                                  newList[index].name = ''
                                  setEscortList(newList)
                                }}
                                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-600 transition-colors cursor-pointer"
                              >
                                <option value="nurse">{isEn ? 'Nurse' : 'Jururawat (Nurse)'}</option>
                                <option value="medical_officer">{isEn ? 'Medical Officer (MO)' : 'Pegawai Perubatan (MO)'}</option>
                                <option value="assistant_medical_officer">{isEn ? 'Assistant Medical Officer (AMO)' : 'Penolong Pegawai Perubatan (AMO)'}</option>
                                <option value="ppk">{isEn ? 'Healthcare Assistant (PPK)' : 'Pembantu Perawatan Kesihatan (PPK)'}</option>
                              </select>
                            </div>

                            {/* Name Input / Select */}
                            <div className="col-span-6">
                              {escort.job === 'medical_officer' ? (
                                <select
                                  value={escort.name}
                                  onChange={(e) => {
                                    const newList = [...escortList]
                                    newList[index].name = e.target.value
                                    setEscortList(newList)
                                  }}
                                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-600 transition-colors cursor-pointer"
                                  required
                                >
                                  <option value="">{isEn ? 'Please Select Medical Officer' : 'Sila Pilih Nama Pegawai Perubatan'}</option>
                                  <option value="DR AMIR">DR AMIR</option>
                                  <option value="DR JASON">DR JASON</option>
                                  <option value="DR NARVIN">DR NARVIN</option>
                                  <option value="DR CLARA">DR CLARA</option>
                                  <option value="DR IBRAHIM">DR IBRAHIM</option>
                                  <option value="DR SARA">DR SARA</option>
                                  <option value="DR VOON">DR VOON</option>
                                  <option value="DR GANESHA">DR GANESHA</option>
                                  <option value="DR FATIMAH">DR FATIMAH</option>
                                </select>
                              ) : (
                                <Input
                                  placeholder={isEn ? 'Staff Full Name' : 'Nama Kakitangan'}
                                  value={escort.name}
                                  onChange={(e) => {
                                    const newList = [...escortList]
                                    newList[index].name = e.target.value
                                    setEscortList(newList)
                                  }}
                                  className="text-xs px-3 py-2 rounded-lg"
                                  required
                                />
                              )}
                            </div>

                            {/* Delete Button */}
                            <div className="col-span-1 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const newList = escortList.filter((_, idx) => idx !== index)
                                  setEscortList(newList)
                                }}
                                className="text-rose-600 hover:text-rose-800 text-lg font-bold transition-colors p-1 cursor-pointer"
                                title={isEn ? 'Delete' : 'Padam'}
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 pt-2">
                    {/* SECTION A: KKM ESCORT DETAILS */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {isEn ? 'A. MOH (KKM) Medical Escorts' : 'A. Pengiring Perubatan KKM'}
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {isEn ? 'Medical personnel on duty for cross-border transit.' : 'Kakitangan perubatan bertugas merentas sempadan.'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newKkm = [...crossborderKkmEscorts, { nama: '', jenis_dokumen: 'IC' as JenisDokumen, no_dokumen: '', jawatan: 'nurse' }]
                            setCrossborderKkmEscorts(newKkm)
                            setEscortList(newKkm.map(k => ({ job: k.jawatan as PengiringType, name: k.nama })))
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors font-semibold cursor-pointer"
                        >
                          {isEn ? '+ Add MOH Escort' : '+ Tambah Pengiring KKM'}
                        </button>
                      </div>

                      {crossborderKkmEscorts.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                          {isEn ? 'No MOH Escorts Added. Click "+ Add MOH Escort".' : 'Tiada Pengiring KKM Ditambah. Klik "+ Tambah Pengiring KKM".'}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {crossborderKkmEscorts.map((escort, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/80 animate-fadeIn">
                              {/* Job / Jawatan */}
                              <div className="col-span-3">
                                <select
                                  value={escort.jawatan}
                                  onChange={(e) => {
                                    const newList = [...crossborderKkmEscorts]
                                    newList[index].jawatan = e.target.value
                                    newList[index].nama = ''
                                    setCrossborderKkmEscorts(newList)
                                    setEscortList(newList.map(k => ({ job: k.jawatan as PengiringType, name: k.nama })))
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-600 transition-colors cursor-pointer"
                                >
                                  <option value="nurse">{isEn ? 'Nurse' : 'Jururawat'}</option>
                                  <option value="medical_officer">{isEn ? 'Medical Officer (MO)' : 'Pegawai Perubatan (MO)'}</option>
                                  <option value="assistant_medical_officer">{isEn ? 'Assistant Medical Officer (AMO)' : 'Penolong Pegawai Perubatan (AMO)'}</option>
                                  <option value="ppk">{isEn ? 'Healthcare Assistant (PPK)' : 'PPK'}</option>
                                </select>
                              </div>

                              {/* Name */}
                              <div className="col-span-3">
                                {escort.jawatan === 'medical_officer' ? (
                                  <select
                                    value={escort.nama}
                                    onChange={(e) => {
                                      const newList = [...crossborderKkmEscorts]
                                      newList[index].nama = e.target.value
                                      setCrossborderKkmEscorts(newList)
                                      setEscortList(newList.map(k => ({ job: k.jawatan as PengiringType, name: k.nama })))
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-600 transition-colors cursor-pointer"
                                    required
                                  >
                                    <option value="">{isEn ? 'Select MO' : 'Pilih MO'}</option>
                                    <option value="DR AMIR">DR AMIR</option>
                                    <option value="DR JASON">DR JASON</option>
                                    <option value="DR NARVIN">DR NARVIN</option>
                                    <option value="DR CLARA">DR CLARA</option>
                                    <option value="DR IBRAHIM">DR IBRAHIM</option>
                                    <option value="DR SARA">DR SARA</option>
                                    <option value="DR VOON">DR VOON</option>
                                    <option value="DR GANESHA">DR GANESHA</option>
                                    <option value="DR FATIMAH">DR FATIMAH</option>
                                  </select>
                                ) : (
                                  <Input
                                    placeholder={isEn ? 'Staff Full Name' : 'Nama Kakitangan'}
                                    value={escort.nama}
                                    onChange={(e) => {
                                      const newList = [...crossborderKkmEscorts]
                                      newList[index].nama = e.target.value.toUpperCase()
                                      setCrossborderKkmEscorts(newList)
                                      setEscortList(newList.map(k => ({ job: k.jawatan as PengiringType, name: k.nama })))
                                    }}
                                    className="text-xs px-2.5 py-1.5 rounded-lg"
                                    required
                                  />
                                )}
                              </div>

                              {/* Document Type */}
                              <div className="col-span-2">
                                <select
                                  value={escort.jenis_dokumen}
                                  onChange={(e) => {
                                    const newList = [...crossborderKkmEscorts]
                                    newList[index].jenis_dokumen = e.target.value as JenisDokumen
                                    setCrossborderKkmEscorts(newList)
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-600 cursor-pointer"
                                >
                                  <option value="IC">IC</option>
                                  <option value="PASSPORT">PASSPORT</option>
                                  <option value="OTHERS">{isEn ? 'OTHERS' : 'LAIN-LAIN'}</option>
                                </select>
                              </div>

                              {/* Document Number */}
                              <div className="col-span-3">
                                <Input
                                  placeholder={isEn ? 'Doc / IC No.' : 'No. Dokumen'}
                                  value={escort.no_dokumen}
                                  onChange={(e) => {
                                    const newList = [...crossborderKkmEscorts]
                                    newList[index].no_dokumen = e.target.value.toUpperCase()
                                    setCrossborderKkmEscorts(newList)
                                  }}
                                  className="text-xs px-2.5 py-1.5 rounded-lg"
                                  required
                                />
                              </div>

                              {/* Delete */}
                              <div className="col-span-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newList = crossborderKkmEscorts.filter((_, idx) => idx !== index)
                                    setCrossborderKkmEscorts(newList)
                                    setEscortList(newList.map(k => ({ job: k.jawatan as PengiringType, name: k.nama })))
                                  }}
                                  className="text-rose-600 hover:text-rose-800 text-lg font-bold p-1 cursor-pointer"
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECTION B: WARIS ESCORT DETAILS */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            {isEn ? 'B. Next-of-Kin / Patient Escort (Max 1 per patient)' : 'B. Waris / Pengiring Terdekat (Maksimum 1 Per Pesakit)'}
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {isEn ? 'Optional: Authorized next-of-kin accompanying cross-border ambulance transfer.' : 'Pilihan: Waris yang dibenarkan menaiki ambulans merentas sempadan.'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newWaris = [...crossborderWarisEscorts, { nama: '', hubungan: '', jenis_dokumen: 'IC' as JenisDokumen, no_dokumen: '' }]
                            setCrossborderWarisEscorts(newWaris)
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors font-semibold cursor-pointer"
                        >
                          {isEn ? '+ Add Next-of-Kin Escort' : '+ Tambah Waris / Pengiring Pesakit'}
                        </button>
                      </div>

                      {crossborderWarisEscorts.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                          {isEn 
                            ? 'No Next-of-Kin Escorts Added. Click "+ Add Next-of-Kin Escort" if accompanying.'
                            : 'Tiada Waris/Pengiring Pesakit Ditambah. Klik "+ Tambah Waris / Pengiring Pesakit" jika ada.'}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {crossborderWarisEscorts.map((waris, index) => (
                            <div key={index} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3 relative animate-fadeIn">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  {isEn ? `Next-of-Kin / Escort #${index + 1}` : `Waris / Pengiring Pesakit ${index + 1}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newWaris = crossborderWarisEscorts.filter((_, idx) => idx !== index)
                                    setCrossborderWarisEscorts(newWaris)
                                  }}
                                  className="text-rose-600 hover:text-rose-800 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  {isEn ? 'Delete' : 'Padam'}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                {/* Name */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {isEn ? 'Next-of-Kin Name' : 'Nama Waris'}
                                  </label>
                                  <Input
                                    placeholder={isEn ? 'Full Name' : 'Nama Penuh Waris'}
                                    value={waris.nama}
                                    onChange={(e) => {
                                      const newWaris = [...crossborderWarisEscorts]
                                      newWaris[index].nama = e.target.value.toUpperCase()
                                      setCrossborderWarisEscorts(newWaris)
                                    }}
                                    className="text-xs px-2.5 py-1.5 rounded-lg"
                                    required
                                  />
                                </div>

                                {/* Relation */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {isEn ? 'Relationship' : 'Hubungan'}
                                  </label>
                                  <select
                                    value={waris.hubungan}
                                    onChange={(e) => {
                                      const newWaris = [...crossborderWarisEscorts]
                                      newWaris[index].hubungan = e.target.value
                                      setCrossborderWarisEscorts(newWaris)
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-600 cursor-pointer"
                                    required
                                  >
                                    <option value="">{isEn ? 'Select Relation' : 'Pilih Hubungan'}</option>
                                    <option value="Suami">{isEn ? 'Husband (Suami)' : 'Suami'}</option>
                                    <option value="Isteri">{isEn ? 'Wife (Isteri)' : 'Isteri'}</option>
                                    <option value="Ibu">{isEn ? 'Mother (Ibu)' : 'Ibu'}</option>
                                    <option value="Bapa">{isEn ? 'Father (Bapa)' : 'Bapa'}</option>
                                    <option value="Anak">{isEn ? 'Child (Anak)' : 'Anak'}</option>
                                    <option value="Adik-beradik">{isEn ? 'Sibling (Adik-beradik)' : 'Adik-beradik'}</option>
                                    <option value="Lain-lain">{isEn ? 'Other' : 'Lain-lain'}</option>
                                  </select>
                                </div>

                                {/* Document Type */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {isEn ? 'Document Type' : 'Jenis Dokumen'}
                                  </label>
                                  <select
                                    value={waris.jenis_dokumen}
                                    onChange={(e) => {
                                      const newWaris = [...crossborderWarisEscorts]
                                      newWaris[index].jenis_dokumen = e.target.value as JenisDokumen
                                      setCrossborderWarisEscorts(newWaris)
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none cursor-pointer"
                                    required
                                  >
                                    <option value="IC">IC</option>
                                    <option value="PASSPORT">PASSPORT</option>
                                    <option value="OTHERS">{isEn ? 'OTHERS' : 'LAIN-LAIN'}</option>
                                  </select>
                                </div>

                                {/* Document Number */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {isEn ? 'Document No.' : 'No. Dokumen'}
                                  </label>
                                  <Input
                                    placeholder={isEn ? 'ID Card / Passport No.' : 'No. Kad Pengenalan / Passport'}
                                    value={waris.no_dokumen}
                                    onChange={(e) => {
                                      const newWaris = [...crossborderWarisEscorts]
                                      newWaris[index].no_dokumen = e.target.value.toUpperCase()
                                      setCrossborderWarisEscorts(newWaris)
                                    }}
                                    className="text-xs px-2.5 py-1.5 rounded-lg"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditional passenger for SG requests */}
                {jenisPermohonan === 'sg' && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="bawaPesakit"
                      checked={bawaPesakit}
                      onChange={(e) => setBawaPesakit(e.target.checked)}
                      className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="bawaPesakit" className="text-sm font-bold text-slate-700 cursor-pointer">
                      {isEn 
                        ? 'This trip transports a patient (Enable Patient Clinical Form)' 
                        : 'Trip ini melibatkan membawa pesakit (Buka Borang Butiran Pesakit)'}
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PATIENT DETAILS */}
            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  {jenisPermohonan === 'van_jenazah' 
                    ? (isEn ? 'Step 3: Deceased & Special Transfer Details' : 'Langkah 3: Butiran Jenazah & Khas') 
                    : (isEn ? 'Step 3: Patient Clinical & Special Needs' : 'Langkah 3: Butiran Pesakit & Khas')}
                </h3>
                
                {isPatientSectionRequired ? (
                  isCrossborder ? (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {isEn ? 'Cross-Border Patient Roster' : 'Senarai Pesakit Rentasi Sempadan'}
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {isEn ? 'Enter travel document details for each patient (Max 3).' : 'Masukkan butiran dokumen perjalanan bagi setiap pesakit (Maksimum 3).'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPatient}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors font-semibold cursor-pointer"
                        >
                          {isEn ? '+ Add Patient' : '+ Tambah Pesakit'}
                        </button>
                      </div>

                      <div className="space-y-6 divide-y divide-slate-100">
                        {crossborderPatients.map((patient, pIdx) => (
                          <div key={pIdx} className={`space-y-4 ${pIdx > 0 ? 'pt-6' : ''}`}>
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                                {isEn ? `Patient #${pIdx + 1}` : `Pesakit #${pIdx + 1}`}
                              </h4>
                              {crossborderPatients.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePatient(pIdx)}
                                  className="text-rose-600 hover:text-rose-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  {isEn ? 'Remove' : 'Padam'}
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  {isEn ? 'Full Name (As in Passport / IC) *' : 'Nama Penuh (Seperti Pasport / IC) *'}
                                </label>
                                <Input
                                  placeholder={isEn ? 'Patient Full Name' : 'Nama Penuh Pesakit'}
                                  value={patient.nama}
                                  onChange={(e) => handlePatientFieldChange(pIdx, 'nama', e.target.value.toUpperCase())}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  {isEn ? 'Gender *' : 'Jantina *'}
                                </label>
                                <select
                                  value={patient.jantina}
                                  onChange={(e) => handlePatientFieldChange(pIdx, 'jantina', e.target.value as Jantina)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-600 cursor-pointer"
                                >
                                  <option value="Lelaki">{isEn ? 'Male (Lelaki)' : 'Lelaki'}</option>
                                  <option value="Perempuan">{isEn ? 'Female (Perempuan)' : 'Perempuan'}</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  {isEn ? 'Date of Birth *' : 'Tarikh Lahir *'}
                                </label>
                                <input
                                  type="date"
                                  value={patient.tarikh_lahir}
                                  onChange={(e) => handlePatientFieldChange(pIdx, 'tarikh_lahir', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  {isEn ? 'Nationality *' : 'Warganegara *'}
                                </label>
                                <Input
                                  placeholder="Malaysia"
                                  value={patient.warganegara}
                                  onChange={(e) => handlePatientFieldChange(pIdx, 'warganegara', e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  {isEn ? 'Travel Document Type *' : 'Jenis Dokumen Perjalanan *'}
                                </label>
                                <select
                                  value={patient.jenis_dokumen}
                                  onChange={(e) => handlePatientFieldChange(pIdx, 'jenis_dokumen', e.target.value as JenisDokumen)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-600 cursor-pointer"
                                >
                                  <option value="IC">IC / MYKAD</option>
                                  <option value="PASSPORT">PASSPORT</option>
                                  <option value="OTHERS">{isEn ? 'OTHER DOCUMENT' : 'DOKUMEN LAIN'}</option>
                                </select>
                              </div>

                              <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  {isEn ? 'Document / ID No. *' : 'No Dokumen *'}
                                </label>
                                <Input
                                  placeholder={isEn ? 'IC or Passport Number' : 'No. IC atau Passport'}
                                  value={patient.no_dokumen}
                                  onChange={(e) => handlePatientFieldChange(pIdx, 'no_dokumen', e.target.value.toUpperCase())}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Diagnosis & Phone fields for the whole request */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {isEn ? 'Primary Clinical Diagnosis *' : 'Diagnosis Utama Pesakit *'}
                          </label>
                          <Input
                            placeholder={isEn ? 'E.g., ACS / Severe Head Injury' : 'Contoh: ACS / Head Injury'}
                            value={diagnosisPesakit}
                            onChange={(e) => setDiagnosisPesakit(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {isEn ? 'Contact Phone No. (Next-of-Kin / Patient)' : 'No. Telefon Hubungi (Waris/Pesakit)'}
                          </label>
                          <Input
                            placeholder={isEn ? 'E.g., 013-8882190' : 'Contoh: 013-8882190'}
                            value={telefonPesakit}
                            onChange={(e) => setTelefonPesakit(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Oxygen toggle for Ambulance requests */}
                      {jenisPermohonan === 'ambulance' && (
                        <div className="space-y-3 pt-3 border-t border-slate-100/50">
                          <div className="flex items-center justify-between p-4 bg-rose-50/30 border border-rose-100 rounded-xl">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-bold text-rose-950">
                                {isEn ? 'Oxygen Support (Oxygenation Required)' : 'Sokongan Oksigen (Oxygenation Required)'}
                              </h4>
                              <p className="text-xs text-rose-800/80">
                                {isEn ? 'Check this if the patient requires oxygen cylinder support.' : 'Tandakan jika ambulans memerlukan tong oksigen sokongan bertugas.'}
                              </p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={oksigenDiperlukan}
                              onChange={(e) => {
                                const val = e.target.checked
                                setOksigenDiperlukan(val)
                                if (!val) {
                                  setSelectedJenisOksigen('')
                                  setCustomJenisOksigen('')
                                  setJenisOksigen('')
                                }
                              }}
                              className="w-5 h-5 text-rose-600 border-rose-300 rounded focus:ring-rose-500 cursor-pointer"
                            />
                          </div>

                          {oksigenDiperlukan && (
                            <div className="p-4 bg-rose-50/10 border border-rose-100 rounded-xl space-y-3 animate-fadeIn">
                              <label className="text-xs font-bold text-rose-900 uppercase tracking-wider block">
                                {isEn ? 'Oxygen Delivery Mode' : 'Jenis Alat Oksigen'}
                              </label>
                              <select
                                value={selectedJenisOksigen}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setSelectedJenisOksigen(val)
                                  if (val === 'others') {
                                    setJenisOksigen(customJenisOksigen)
                                  } else if (val) {
                                    setJenisOksigen(val)
                                  } else {
                                    setJenisOksigen('')
                                  }
                                }}
                                className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-rose-600 transition-colors cursor-pointer"
                                required
                              >
                                <option value="">{isEn ? 'Please Select Oxygen Delivery Mode' : 'Sila Pilih Jenis Oksigen'}</option>
                                <option value="Nasal prong">Nasal prong</option>
                                <option value="face mask">face mask</option>
                                <option value="venturi mask">venturi mask</option>
                                <option value="high flow mask">high flow mask</option>
                                <option value="Tracheal Mask">Tracheal Mask</option>
                                <option value="intubated">intubated</option>
                                <option value="others">{isEn ? 'others (specify)' : 'lain-lain (nyatakan)'}</option>
                              </select>

                              {selectedJenisOksigen === 'others' && (
                                <Input
                                  placeholder={isEn ? 'Please specify oxygen apparatus manually' : 'Sila nyatakan jenis oksigen secara manual'}
                                  value={customJenisOksigen}
                                  onChange={(e) => {
                                    setCustomJenisOksigen(e.target.value)
                                    setJenisOksigen(e.target.value)
                                  }}
                                  className="text-xs bg-white"
                                  required
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Patient Mobility */}
                      {jenisPermohonan !== 'van_jenazah' && (
                        <div className="space-y-2.5 pt-3 border-t border-slate-100/50">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            {isEn ? 'Patient Mobility Level *' : 'Keupayaan Bergerak Pesakit (Patient Mobility) *'}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { id: 'walking', label: isEn ? 'Ambulatory / Walking' : 'Walking / Boleh Berjalan', desc: isEn ? 'Can walk independently or with minimal aid' : 'Boleh berjalan tanpa bantuan khas' },
                              { id: 'wheelchair', label: isEn ? 'Wheelchair Required' : 'Wheelchair / Kerusi Roda', desc: isEn ? 'Requires wheelchair assistance' : 'Memerlukan sokongan kerusi roda' },
                              { id: 'stretcher', label: isEn ? 'Stretcher Required' : 'Stretcher / Usungan', desc: isEn ? 'Driver MANDATORY pickup from ward' : 'Pemandu WAJIB ambil pesakit dari wad' }
                            ].map((item) => (
                              <label
                                key={item.id}
                                className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-slate-50/50 ${
                                  patientMobility === item.id 
                                    ? 'bg-blue-50/30 border-blue-500 ring-1 ring-blue-500' 
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="radio" 
                                    name="patientMobilityCrossborder" 
                                    value={item.id}
                                    checked={patientMobility === item.id}
                                    onChange={() => setPatientMobility(item.id as any)}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className="text-xs font-bold text-slate-800">{item.label}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 pl-6 leading-normal font-medium">{item.desc}</span>
                              </label>
                            ))}
                          </div>

                          {patientMobility === 'stretcher' && (
                            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 animate-fadeIn">
                              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-xs">
                                  {isEn ? 'Important Reminder (Driver Ward Pickup Mandatory):' : 'Peringatan Penting (Driver Pickup Required):'}
                                </p>
                                <p className="text-[10px] leading-relaxed mt-0.5 text-amber-800 font-medium">
                                  {isEn 
                                    ? 'Because the patient requires a stretcher, the transporter driver is MANDATED to proceed up to the ward and assist escort staff with patient transfer.' 
                                    : 'Oleh kerana pesakit menggunakan usungan (stretcher), pemandu ambulans/kenderaan adalah WAJIB untuk naik ke wad dan mengambil pesakit bersama-sama dengan kakitangan pengiring.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Required machines selector for Ambulance requests */}
                      {jenisPermohonan === 'ambulance' && (
                        <div className="space-y-2.5 pt-3 border-t border-slate-100/50">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            {isEn ? 'Special Equipment / Devices Required' : 'Mesin / Peralatan Diperlukan (Required Machine)'}
                          </label>
                          <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {[
                              { id: 'oxygen tank', label: 'Oxygen Tank' },
                              { id: 'vital sign monitor', label: 'Vital Sign Monitor' },
                              { id: 'portable suction', label: 'Portable Suction' },
                              { id: 'Portable ventilator', label: 'Portable Ventilator' },
                              { id: 'Syringe pump', label: 'Syringe Pump' },
                              { id: 'others', label: isEn ? 'Others (Specify)' : 'Lain-lain' }
                            ].map((mach) => (
                              <div key={mach.id} className="flex items-center gap-2.5">
                                <input 
                                  type="checkbox"
                                  id={`mach-cb-${mach.id}`}
                                  checked={selectedMesin.includes(mach.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMesin([...selectedMesin, mach.id])
                                    } else {
                                      setSelectedMesin(selectedMesin.filter(m => m !== mach.id))
                                    }
                                  }}
                                  className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor={`mach-cb-${mach.id}`} className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                  {mach.label}
                                </label>
                              </div>
                            ))}
                          </div>

                          {selectedMesin.includes('others') && (
                            <div className="animate-fadeIn">
                              <Input 
                                placeholder={isEn ? 'Please specify other equipment required' : 'Sila nyatakan mesin/peralatan lain'}
                                value={customMesin}
                                onChange={(e) => setCustomMesin(e.target.value)}
                                className="text-xs bg-white"
                                required
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Patient Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {jenisPermohonan === 'van_jenazah' 
                            ? (isEn ? 'Deceased Full Name' : 'Nama Jenazah') 
                            : (isEn ? 'Patient Full Name' : 'Nama Pesakit')}
                        </label>
                        <Input 
                          placeholder={
                            jenisPermohonan === 'van_jenazah' 
                              ? (isEn ? 'Enter deceased full name' : 'Masukkan nama penuh jenazah') 
                              : (isEn ? 'Enter patient full name' : 'Masukkan nama penuh pesakit')
                          }
                          value={namaPesakit}
                          onChange={(e) => setNamaPesakit(e.target.value)}
                          required
                        />
                      </div>

                      {/* RN & Gender */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {jenisPermohonan === 'van_jenazah' 
                              ? (isEn ? 'Deceased RN No.' : 'Nombor RN Jenazah') 
                              : (isEn ? 'Patient RN No.' : 'Nombor RN Pesakit')}
                          </label>
                          <Input 
                            placeholder={isEn ? 'E.g., RN-8841-26' : 'Contoh: RN-8841-26'}
                            value={rnPesakit}
                            onChange={(e) => setRnPesakit(e.target.value)}
                            required
                          />
                        </div>
                      
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {isEn ? 'Gender' : 'Jantina'}
                          </label>
                          <select
                            value={jantinaPesakit}
                            onChange={(e) => setJantinaPesakit(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
                            required
                          >
                            <option value="">{isEn ? 'Please Select' : 'Sila Pilih'}</option>
                            <option value="M">{isEn ? 'Male (Lelaki)' : 'Lelaki'}</option>
                            <option value="F">{isEn ? 'Female (Perempuan)' : 'Perempuan'}</option>
                          </select>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {jenisPermohonan === 'van_jenazah' 
                            ? (isEn ? 'Cause of Death' : 'Sebab Kematian (Diagnosis)') 
                            : (isEn ? 'Clinical Diagnosis' : 'Diagnosis Pesakit')}
                        </label>
                        <Input 
                          placeholder={
                            jenisPermohonan === 'van_jenazah' 
                              ? (isEn ? 'E.g., Myocardial Infarction / Old Age' : 'Contoh: Myocardial Infarction / Old Age') 
                              : (isEn ? 'E.g., Severe Cardiac Arrest / Head Injury' : 'Contoh: Severe Cardiac Arrest / Head Injury')
                          }
                          value={diagnosisPesakit}
                          onChange={(e) => setDiagnosisPesakit(e.target.value)}
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {jenisPermohonan === 'van_jenazah' 
                            ? (isEn ? 'Next-of-Kin Contact Phone No. (Optional)' : 'Nombor Telefon Waris (Pilihan)') 
                            : (isEn ? 'Patient / Next-of-Kin Contact No. (Optional)' : 'Nombor Telefon Waris / Pesakit (Pilihan)')}
                        </label>
                        <Input 
                          placeholder={isEn ? 'E.g., 013-XXXXXXX' : 'Contoh: 013-XXXXXXX'}
                          value={telefonPesakit}
                          onChange={(e) => setTelefonPesakit(e.target.value)}
                        />
                      </div>

                      {/* Oxygen toggle for Ambulance requests */}
                      {jenisPermohonan === 'ambulance' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-rose-50/30 border border-rose-100 rounded-xl">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-bold text-rose-950">
                                {isEn ? 'Oxygen Support (Oxygenation Required)' : 'Sokongan Oksigen (Oxygenation Required)'}
                              </h4>
                              <p className="text-xs text-rose-800/80">
                                {isEn ? 'Check this if the ambulance requires oxygen cylinder support.' : 'Tandakan jika ambulans memerlukan tong oksigen sokongan bertugas.'}
                              </p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={oksigenDiperlukan}
                              onChange={(e) => {
                                const val = e.target.checked
                                setOksigenDiperlukan(val)
                                if (!val) {
                                  setSelectedJenisOksigen('')
                                  setCustomJenisOksigen('')
                                  setJenisOksigen('')
                                }
                              }}
                              className="w-5 h-5 text-rose-600 border-rose-300 rounded focus:ring-rose-500 cursor-pointer"
                            />
                          </div>

                          {oksigenDiperlukan && (
                            <div className="p-4 bg-rose-50/10 border border-rose-100 rounded-xl space-y-3 animate-fadeIn">
                              <label className="text-xs font-bold text-rose-900 uppercase tracking-wider block">
                                {isEn ? 'Oxygen Delivery Mode' : 'Jenis Alat Oksigen'}
                              </label>
                              <select
                                value={selectedJenisOksigen}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setSelectedJenisOksigen(val)
                                  if (val === 'others') {
                                    setJenisOksigen(customJenisOksigen)
                                  } else if (val) {
                                    setJenisOksigen(val)
                                  } else {
                                    setJenisOksigen('')
                                  }
                                }}
                                className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-rose-600 transition-colors cursor-pointer"
                                required
                              >
                                <option value="">{isEn ? 'Please Select Oxygen Delivery Mode' : 'Sila Pilih Jenis Oksigen'}</option>
                                <option value="Nasal prong">Nasal prong</option>
                                <option value="face mask">face mask</option>
                                <option value="venturi mask">venturi mask</option>
                                <option value="high flow mask">high flow mask</option>
                                <option value="Tracheal Mask">Tracheal Mask</option>
                                <option value="intubated">intubated</option>
                                <option value="others">{isEn ? 'others (specify)' : 'lain-lain (nyatakan)'}</option>
                              </select>

                              {selectedJenisOksigen === 'others' && (
                                <Input
                                  placeholder={isEn ? 'Please specify oxygen apparatus manually' : 'Sila nyatakan jenis oksigen secara manual'}
                                  value={customJenisOksigen}
                                  onChange={(e) => {
                                    setCustomJenisOksigen(e.target.value)
                                    setJenisOksigen(e.target.value)
                                  }}
                                  className="text-xs bg-white"
                                  required
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Patient Mobility */}
                      {jenisPermohonan !== 'van_jenazah' && (
                        <div className="space-y-2.5 pt-3 border-t border-slate-100/50">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            {isEn ? 'Patient Mobility Level' : 'Keupayaan Bergerak Pesakit (Patient Mobility)'}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { id: 'walking', label: isEn ? 'Ambulatory / Walking' : 'Walking / Boleh Berjalan', desc: isEn ? 'Can walk independently' : 'Boleh berjalan tanpa bantuan khas' },
                              { id: 'wheelchair', label: isEn ? 'Wheelchair Required' : 'Wheelchair / Kerusi Roda', desc: isEn ? 'Requires wheelchair assistance' : 'Memerlukan sokongan kerusi roda' },
                              { id: 'stretcher', label: isEn ? 'Stretcher Required' : 'Stretcher / Usungan', desc: isEn ? 'Driver MANDATORY pickup from ward' : 'Pemandu WAJIB ambil pesakit dari wad' }
                            ].map((item) => (
                              <label
                                key={item.id}
                                className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-slate-50/50 ${
                                  patientMobility === item.id 
                                    ? 'bg-blue-50/30 border-blue-500 ring-1 ring-blue-500' 
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="radio" 
                                    name="patientMobility" 
                                    value={item.id}
                                    checked={patientMobility === item.id}
                                    onChange={() => setPatientMobility(item.id as any)}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className="text-xs font-bold text-slate-800">{item.label}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 pl-6 leading-normal font-medium">{item.desc}</span>
                              </label>
                            ))}
                          </div>

                          {/* Stretcher compulsory warning alert */}
                          {patientMobility === 'stretcher' && (
                            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 animate-fadeIn">
                              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-xs">
                                  {isEn ? 'Important Reminder (Driver Ward Pickup Mandatory):' : 'Peringatan Penting (Driver Pickup Required):'}
                                </p>
                                <p className="text-[10px] leading-relaxed mt-0.5 text-amber-800 font-medium">
                                  {isEn 
                                    ? 'Because the patient requires a stretcher, the transporter driver is MANDATED to proceed up to the ward and assist escort staff with patient transfer.' 
                                    : 'Oleh kerana pesakit menggunakan usungan (stretcher), pemandu ambulans/kenderaan adalah WAJIB untuk naik ke wad dan mengambil pesakit bersama-sama dengan kakitangan pengiring.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Required machines selector for Ambulance requests */}
                      {jenisPermohonan === 'ambulance' && (
                        <div className="space-y-2.5 pt-3 border-t border-slate-100/50">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            {isEn ? 'Special Equipment / Devices Required' : 'Mesin / Peralatan Diperlukan (Required Machine)'}
                          </label>
                          <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {[
                              { id: 'oxygen tank', label: 'Oxygen Tank' },
                              { id: 'vital sign monitor', label: 'Vital Sign Monitor' },
                              { id: 'portable suction', label: 'Portable Suction' },
                              { id: 'Portable ventilator', label: 'Portable Ventilator' },
                              { id: 'Syringe pump', label: 'Syringe Pump' },
                              { id: 'others', label: isEn ? 'Others (Specify)' : 'Lain-lain' }
                            ].map((mach) => (
                              <div key={mach.id} className="flex items-center gap-2.5">
                                <input 
                                  type="checkbox"
                                  id={`mach-${mach.id}`}
                                  checked={selectedMesin.includes(mach.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMesin([...selectedMesin, mach.id])
                                    } else {
                                      setSelectedMesin(selectedMesin.filter(m => m !== mach.id))
                                    }
                                  }}
                                  className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor={`mach-${mach.id}`} className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                  {mach.label}
                                </label>
                              </div>
                            ))}
                          </div>

                          {selectedMesin.includes('others') && (
                            <div className="animate-fadeIn">
                              <Input 
                                placeholder={isEn ? 'Please specify other equipment required' : 'Sila nyatakan mesin/peralatan lain'}
                                value={customMesin}
                                onChange={(e) => setCustomMesin(e.target.value)}
                                className="text-xs bg-white"
                                required
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>)
                ) : (
                  <div className="py-8 text-center text-slate-500 space-y-2">
                    <User className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="font-bold text-sm">
                      {isEn ? 'Patient Details Not Required' : 'Butiran Pesakit Tidak Diperlukan'}
                    </p>
                    <p className="text-xs">
                      {isEn ? 'This trip is designated for official staff duty / logistics purposes only.' : 'Trip ini diformatkan untuk kegunaan staf rasmi/logistik sahaja.'}
                    </p>
                  </div>
                )}

                {/* Special Remarks / Catatan Khas */}
                <div className="space-y-1.5 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isEn ? 'Special Remarks / Clinical Instructions' : 'Catatan Khas / Remarks'}
                  </label>
                  <textarea 
                    rows={3}
                    placeholder={isEn ? 'Enter any additional requirements (e.g. wheelchair, vaccine cold-box, etc.)' : 'Masukkan sebarang keperluan tambahan (contoh: Perlu kerusi roda, peti ais ubat, dll)'}
                    value={catatanKhas}
                    onChange={(e) => setCatatanKhas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-colors font-medium shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: CROSSBORDER SPECIAL DETAILS */}
            {step === 4 && isCrossborder && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  {isEn ? 'Step 4: Cross-Border Clearance Details' : 'Langkah 4: Butiran Rentasi Sempadan'} {borderControlPost.toLowerCase().includes('brunei') ? '(Sarawak - Brunei)' : borderControlPost.toLowerCase().includes('sabah') || borderControlPost.toLowerCase().includes('sindumin') ? '(Sabah - Sarawak)' : ''}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Border Control Post */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {isEn ? 'Border Checkpoint Post (Auto-generated Route)' : 'Pintu Kawalan Sempadan (Automik / Auto-generated Route)'}
                    </label>
                    <textarea
                      value={borderControlPost}
                      readOnly
                      rows={borderControlPost.split('\n').length || 3}
                      className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 select-none cursor-not-allowed whitespace-pre-wrap outline-none"
                      required
                    />
                  </div>

                  {/* Tempat Berlepas */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {isEn ? 'Departure Facility / Point of Departure' : 'Tempat Berlepas / Point of Departure'}
                    </label>
                    <Input
                      placeholder="Hospital Lawas"
                      value={tempatBerlepas}
                      onChange={(e) => setTempatBerlepas(e.target.value)}
                      required
                    />
                  </div>

                  {/* Ref No */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {isEn ? 'Authorization Reference No.' : 'No. Rujukan Kebenaran'}
                    </label>
                    <Input
                      placeholder="e.g. TF/HL/MW ( 12 ) 2026"
                      value={suratKebenaranRef}
                      onChange={(e) => setSuratKebenaranRef(e.target.value)}
                      required
                    />
                  </div>

                  {/* Doctor Perujuk */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {isEn ? 'Referring Doctor *' : 'Doktor Perujuk *'}
                    </label>
                    <select
                      value={doktorPerujukNama}
                      onChange={(e) => setDoktorPerujukNama(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-colors font-medium shadow-xs cursor-pointer"
                      required
                    >
                      <option value="">{isEn ? 'Please Select Referring Doctor' : 'Sila Pilih Doktor Perujuk'}</option>
                      {DOCTOR_OPTIONS.map((dr) => (
                        <option key={dr} value={dr}>{dr}</option>
                      ))}
                      {doktorPerujukNama && !DOCTOR_OPTIONS.includes(doktorPerujukNama) && (
                        <option value={doktorPerujukNama}>{doktorPerujukNama}</option>
                      )}
                    </select>
                  </div>

                  {/* Pengarah Nama */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {isEn ? 'Hospital Director Name (For Formal Authorization)' : 'Nama Pengarah Hospital (Bagi Tandatangan Kebenaran)'}
                    </label>
                    <Input
                      placeholder="DR DOUGLAS CHU KIN SOON (Pengarah Hospital Lawas)"
                      value={pengarahNama}
                      onChange={(e) => setPengarahNama(e.target.value)}
                      required
                    />
                  </div>

                  {/* Catatan Sempadan */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {isEn ? 'Border Clearance Remarks' : 'Catatan Sempadan (Remarks)'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={isEn ? 'E.g., Patient urgently referred to Hospital Limbang for emergency specialist intervention.' : 'Contoh: Pesakit dirujuk ke Hospital Limbang untuk rawatan pakar kecemasan.'}
                      value={crossborderCatatan}
                      onChange={(e) => setCrossborderCatatan(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-colors font-medium shadow-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4/5: REVIEW & CONFIRM */}
            {((!isCrossborder && step === 4) || (isCrossborder && step === 5)) && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  {isCrossborder 
                    ? (isEn ? 'Step 5: Review & Confirm Details' : 'Langkah 5: Semak Maklumat') 
                    : (isEn ? 'Step 4: Review & Confirm Details' : 'Langkah 4: Semak Maklumat')}
                </h3>

                <div className="space-y-4 text-sm divide-y divide-slate-100">
                  <div className="grid grid-cols-3 py-3 gap-2">
                    <span className="font-bold text-slate-500">
                      {isEn ? 'Transport Category' : 'Jenis Perjalanan'}
                    </span>
                    <span className="col-span-2 font-bold text-slate-900 capitalize">
                      {jenisPermohonan === 'sg' 
                        ? (isEn ? 'Official Vehicle (SG)' : 'Kereta Jabatan (SG)') 
                        : jenisPermohonan === 'van_jenazah' 
                        ? (isEn ? 'Hearse Van' : 'Van Jenazah') 
                        : (isEn ? 'Ambulance' : 'Ambulans')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 py-3 gap-2">
                    <span className="font-bold text-slate-500">
                      {isEn ? 'Trip Purpose' : 'Tujuan Perjalanan'}
                    </span>
                    <span className="col-span-2 text-slate-900 font-semibold">{tujuanPermohonan}</span>
                  </div>

                  <div className="grid grid-cols-3 py-3 gap-2">
                    <span className="font-bold text-slate-500">
                      {isEn ? 'Destination' : 'Destinasi'}
                    </span>
                    <span className="col-span-2 text-slate-900 font-semibold">{destinasi}</span>
                  </div>

                  <div className="grid grid-cols-3 py-3 gap-2">
                    <span className="font-bold text-slate-500">
                      {isEn ? 'Required Date & Time' : 'Tarikh & Masa'}
                    </span>
                    <span className="col-span-2 text-slate-900 font-bold">
                      {jenisPermohonan === 'sg' ? (
                        <span>
                          {new Date(`${tarikhDiperlukan}T${masaDiperlukan}`).toLocaleString(isEn ? 'en-US' : 'ms-MY', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                          {isEn ? ' to ' : ' hingga '}
                          {tarikhTamat && masaTamat ? new Date(`${tarikhTamat}T${masaTamat}`).toLocaleString(isEn ? 'en-US' : 'ms-MY', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }) : '-'}
                        </span>
                      ) : (
                        new Date(`${tarikhDiperlukan}T${masaDiperlukan}`).toLocaleString(isEn ? 'en-US' : 'ms-MY', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                      )}
                    </span>
                  </div>

                  {jenisPermohonan === 'sg' && (
                    <>
                      <div className="grid grid-cols-3 py-3 gap-2">
                        <span className="font-bold text-slate-500">
                          {isEn ? 'Driver Requirement' : 'Keperluan Pemandu'}
                        </span>
                        <span className="col-span-2 text-slate-900 font-semibold">
                          {pemanduDiperlukan 
                            ? (isEn ? 'Driver & Vehicle' : 'Pemandu & Kereta') 
                            : (isEn ? 'Vehicle Only (Self-Drive)' : 'Kereta Sahaja (Tanpa Pemandu)')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 py-3 gap-2">
                        <span className="font-bold text-slate-500">
                          {isEn ? 'Transports Patient' : 'Membawa Pesakit'}
                        </span>
                        <span className="col-span-2 text-slate-900 font-semibold">
                          {bawaPesakit ? (isEn ? 'Yes (Patient Onboard)' : 'Ya (Bawa Pesakit)') : (isEn ? 'No' : 'Tidak')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 py-3 gap-2">
                        <span className="font-bold text-slate-500">
                          {isEn ? 'Passenger Roster' : 'Senarai Penumpang'}
                        </span>
                        <div className="col-span-2 text-slate-900 space-y-1">
                          {senaraiPenumpang.length === 0 ? (
                            <span className="text-slate-500 font-medium">
                              {isEn ? 'No other passengers' : 'Tiada Penumpang Lain'}
                            </span>
                          ) : (
                            senaraiPenumpang.map((passenger, idx) => (
                              <div key={idx} className="font-semibold text-xs">
                                • {passenger.name}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-3 py-3 gap-2">
                    <span className="font-bold text-slate-500">
                      {isEn ? 'Applicant Unit / Ward' : 'Unit Pemohon'}
                    </span>
                    <span className="col-span-2 text-slate-900">{unitPemohon}</span>
                  </div>

                  <div className="grid grid-cols-3 py-3 gap-2">
                    <span className="font-bold text-slate-500">
                      {isEn ? 'Escort Personnel' : 'Kakitangan Pengiring'}
                    </span>
                    <div className="col-span-2 text-slate-900 space-y-1">
                      {escortList.length === 0 ? (
                        <span className="text-slate-500 font-medium">
                          {isEn ? 'No escort staff' : 'Tiada Pengiring'}
                        </span>
                      ) : (
                        escortList.map((escort, idx) => (
                          <div key={idx} className="font-semibold text-xs">
                            • <span className="capitalize text-slate-500">{escort.job.replace(/_/g, ' ')}</span>: {escort.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {isPatientSectionRequired && (
                    <>
                      {isCrossborder ? (
                        <>
                          <div className="grid grid-cols-3 py-3 gap-2 border-t border-slate-100 bg-blue-50/20 px-2 rounded-lg">
                            <span className="font-bold text-blue-800">
                              {isEn ? 'Cross-Border Transit' : 'Rentasi Sempadan'}
                            </span>
                            <span className="col-span-2 text-blue-700 font-bold">
                              {isEn ? 'YES' : 'YA'} ({borderControlPost === 'Sindumin/Merapok Border Post' ? 'Sabah - Sarawak' : 'Sarawak - Brunei'} Border Crossing)
                            </span>
                          </div>
                          <div className="grid grid-cols-3 py-3 gap-2">
                            <span className="font-bold text-slate-500">
                              {isEn ? 'Border Checkpoint' : 'Pintu Sempadan'}
                            </span>
                            <span className="col-span-2 text-slate-800 font-semibold">{borderControlPost}</span>
                          </div>
                          <div className="grid grid-cols-3 py-3 gap-2">
                            <span className="font-bold text-slate-500">
                              {isEn ? `Patient List (${crossborderPatients.length})` : `Senarai Pesakit (${crossborderPatients.length})`}
                            </span>
                            <div className="col-span-2 space-y-1">
                              {crossborderPatients.map((p, idx) => (
                                <div key={idx} className="text-slate-800 font-medium">
                                  {idx + 1}. {p.nama} ({p.jantina}, {p.warganegara}) - <span className="font-mono text-xs">{p.jenis_dokumen}: {p.no_dokumen}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 py-3 gap-2">
                            <span className="font-bold text-slate-500">
                              {isEn ? `MOH Escorts (${crossborderKkmEscorts.length})` : `Pengiring KKM (${crossborderKkmEscorts.length})`}
                            </span>
                            <div className="col-span-2 space-y-1">
                              {crossborderKkmEscorts.map((e, idx) => (
                                <div key={idx} className="text-slate-700 text-xs">
                                  • {e.nama} (<span className="capitalize">{e.jawatan}</span>)
                                </div>
                              ))}
                            </div>
                          </div>
                          {crossborderWarisEscorts.some(w => w && w.nama) && (
                            <div className="grid grid-cols-3 py-3 gap-2">
                              <span className="font-bold text-slate-500">
                                {isEn ? 'Next-of-Kin Escort' : 'Pengiring Waris'}
                              </span>
                              <div className="col-span-2 space-y-1">
                                {crossborderWarisEscorts.filter(w => w && w.nama).map((w, idx) => (
                                  <div key={idx} className="text-slate-700 text-xs">
                                    • {w.nama} ({w.hubungan})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-3 py-3 gap-2">
                            <span className="font-bold text-slate-500">
                              {isEn ? 'Referring Doctor' : 'Doktor Perujuk'}
                            </span>
                            <span className="col-span-2 text-slate-800 font-semibold">{doktorPerujukNama}</span>
                          </div>
                          <div className="grid grid-cols-3 py-3 gap-2">
                            <span className="font-bold text-slate-500">
                              {isEn ? 'Director Approval' : 'Kebenaran Pengarah'}
                            </span>
                            <span className="col-span-2 text-slate-800 text-xs">{pengarahNama}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 py-3 gap-2">
                            <span className="font-bold text-slate-500">
                              {jenisPermohonan === 'van_jenazah' 
                                ? (isEn ? 'Deceased Name' : 'Nama Jenazah') 
                                : (isEn ? 'Patient Name' : 'Nama Pesakit')}
                            </span>
                            <span className="col-span-2 text-slate-900 font-bold">{namaPesakit}</span>
                          </div>
                          <div className="grid grid-cols-3 py-3 gap-2">
                            <span className="font-bold text-slate-500">
                              {jenisPermohonan === 'van_jenazah' 
                                ? (isEn ? 'Deceased RN No.' : 'No RN Jenazah') 
                                : (isEn ? 'Patient RN No.' : 'No RN Pesakit')}
                            </span>
                            <span className="col-span-2 text-slate-900 font-mono font-semibold">{rnPesakit}</span>
                          </div>
                          <div className="grid grid-cols-3 py-3 gap-2">
                            <span className="font-bold text-slate-500">
                              {jenisPermohonan === 'van_jenazah' 
                                ? (isEn ? 'Cause of Death' : 'Sebab Kematian') 
                                : (isEn ? 'Clinical Diagnosis' : 'Diagnosis')}
                            </span>
                            <span className="col-span-2 text-slate-900">{diagnosisPesakit}</span>
                          </div>
                        </>
                      )}
                      {jenisPermohonan === 'ambulance' && (
                        <div className="grid grid-cols-3 py-3 gap-2">
                          <span className="font-bold text-slate-500">
                            {isEn ? 'Oxygen Required' : 'Oksigen Diperlukan'}
                          </span>
                          <span className={`col-span-2 font-bold ${oksigenDiperlukan ? 'text-rose-600' : 'text-slate-500'}`}>
                            {oksigenDiperlukan ? `${isEn ? 'Yes' : 'Ya'} (${jenisOksigen})` : (isEn ? 'No' : 'Tidak')}
                          </span>
                        </div>
                      )}
                      {jenisPermohonan === 'ambulance' && selectedMesin.length > 0 && (
                        <div className="grid grid-cols-3 py-3 gap-2">
                          <span className="font-bold text-slate-500">
                            {isEn ? 'Special Equipment' : 'Mesin Diperlukan'}
                          </span>
                          <span className="col-span-2 text-slate-900 font-semibold text-xs">
                            {selectedMesin.map(m => m === 'others' ? `${isEn ? 'Others' : 'Lain-lain'} (${customMesin})` : m).join(', ')}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {catatanKhas && (
                    <div className="grid grid-cols-3 py-3 gap-2">
                      <span className="font-bold text-slate-500">
                        {isEn ? 'Special Remarks' : 'Catatan Khas'}
                      </span>
                      <span className="col-span-2 text-slate-700 italic">{catatanKhas}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-normal mt-6">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>{isEn ? 'MOH Compliance Notice:' : 'Nota Pengesahan KKM:'}</strong>{' '}
                    {isEn 
                      ? 'False declaration or unauthorized vehicle requisition for personal purposes is strictly prohibited under civil service regulations. Please ensure this trip is approved by your unit head.' 
                      : 'Pengesahan palsu atau tidak rasmi untuk kegunaan peribadi boleh dikenakan tindakan disiplin penjawat awam. Sila pastikan trip ini diluluskan oleh ketua unit anda.'}
                  </p>
                </div>
              </div>
            )}

          </CardContent>

          {/* Action buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
            {step > 1 ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevStep}
                className="border-slate-200 text-slate-700 cursor-pointer"
              >
                {isEn ? 'Previous' : 'Kembali'}
              </Button>
            ) : (
              <div />
            )}

            {step < (isCrossborder ? 5 : 4) ? (
              <Button 
                type="button" 
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                {isEn ? 'Next Step' : 'Seterusnya'}
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting 
                  ? (isEn ? 'Submitting...' : 'Menghantar...') 
                  : (isEn ? 'Submit Requisition' : 'Submit Requisition')}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  )
}

export default TransporterRequestFormPage
