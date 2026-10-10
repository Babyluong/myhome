import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Plus,
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  MapPin,
  Car,
  FileText,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Stethoscope,
  Presentation,
  Users,
  UserCheck,
  Building,
  Sparkles,
  Info,
  X,
  User,
  ShieldCheck,
  Palmtree,
  Timer,
  Paperclip,
  UploadCloud,
  Download,
  Trash2,
  Pencil,
  History,
  ExternalLink,
  Link,
  Edit3
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { ROUTES } from '@/lib/constants'
import {
  getStaffMovements,
  submitStaffMovement,
  updateStaffMovement,
  deleteStaffMovementWithAudit
} from '@/modules/mystaff/services/staffService'
import { getUsers } from '@/services/userService'
import type { StaffMovement, MovementType } from '@/shared/types/mystaff'
import { Button, SlideOver, Badge, Spinner, SkeletonTable, SkeletonMobileCardList, Skeleton } from '@/components/ui'
import { AuditReasonModal } from '../components/AuditReasonModal'
import { AuditLogDrawer } from '../components/AuditLogDrawer'

interface ColleagueOption {
  id: string
  full_name: string
  jawatan: string
  department_name: string
  employee_id?: string
}

// Real Pharmacy Staff from Hospital Lawas Database
const REAL_PHARMACY_STAFF: ColleagueOption[] = [
  {
    id: '5a2e226f-8ebe-4ee6-8e33-6ec7687ef9d2',
    full_name: 'Mohamad Aiman bin Mat Zaki',
    jawatan: 'Pegawai Farmasi UF9',
    department_name: 'Jabatan Farmasi (Logistik)',
    employee_id: '920918086541'
  },
  {
    id: 'f3e909ff-7325-439f-8aca-3b69a4cf7d0e',
    full_name: 'NURUL ASYIQIN BINTI MD RIDZUAN',
    jawatan: 'Pegawai Farmasi UF9',
    department_name: 'Jabatan Farmasi (Logistik)',
    employee_id: '951204025108'
  },
  {
    id: 'd92476aa-f753-4da1-ab8e-5e7bce53f5d3',
    full_name: 'KAMRIAH BT HAJI MAIL',
    jawatan: 'Penolong Pegawai Farmasi U7 TBK 2',
    department_name: 'Jabatan Farmasi',
    employee_id: '740627135456'
  },
  {
    id: '38af6719-4ac7-4f08-a38a-b98907ebccbd',
    full_name: 'JOHARI BIN EPIN',
    jawatan: 'Penolong Pegawai Farmasi U5',
    department_name: 'Farmasi Satelit',
    employee_id: '980724125949'
  },
  {
    id: '55635e54-9e09-44fe-895e-84a33069b986',
    full_name: 'Stella Ladu Marten',
    jawatan: 'Pembantu Farmasi',
    department_name: 'Jabatan Farmasi',
    employee_id: '050709131290'
  },
  {
    id: 'ba4418f0-22ab-41fa-9a42-8a85aad09b29',
    full_name: 'Winnie Ruth anak William',
    jawatan: 'Pembantu Farmasi',
    department_name: 'Jabatan Farmasi',
    employee_id: '051013131166'
  },
  {
    id: 'fbbd44d1-f322-4fdb-a367-a18e5371e205',
    full_name: 'ENUNG RIGI',
    jawatan: 'Pembantu Khidmat Am H1',
    department_name: 'Farmasi Logistik',
    employee_id: '760716135851'
  },
  {
    id: 'mohidin-malik',
    full_name: 'Mohidin Bin Malik',
    jawatan: 'Pembantu Khidmat Am H1',
    department_name: 'Farmasi Logistik',
    employee_id: '720521135345'
  },
  {
    id: '6dc71c77-546a-4c9b-b126-71859df7a4c8',
    full_name: 'TAN YUAN ZHANG',
    jawatan: 'Pegawai Farmasi',
    department_name: 'Jabatan Farmasi',
    employee_id: '861102025693'
  }
]

export const StaffMovementPage: React.FC = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isMs = language === 'ms'
  const toast = useToast()
  const user = useAuthStore(state => state.user)

  const [movements, setMovements] = useState<StaffMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Edit & Audit State
  const [editingMovement, setEditingMovement] = useState<StaffMovement | null>(null)
  const [deletingMovement, setDeletingMovement] = useState<StaffMovement | null>(null)
  const [editReason, setEditReason] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false)

  // Real Pharmacy Department staff list only
  const [colleagues, setColleagues] = useState<ColleagueOption[]>(REAL_PHARMACY_STAFF)

  // Target Officer Selection Mode: 'self' | 'other'
  const [logTarget, setLogTarget] = useState<'self' | 'other'>('self')
  const [selectedColleagueId, setSelectedColleagueId] = useState<string>(REAL_PHARMACY_STAFF[0].id)
  const [isManualOfficer, setIsManualOfficer] = useState(false)
  const [manualOfficerName, setManualOfficerName] = useState('')
  const [manualOfficerRole, setManualOfficerRole] = useState('')

  // Form State (Borang Pergerakan Pegawai KKM)
  const [formType, setFormType] = useState<MovementType>('MEETING')
  const [formTitle, setFormTitle] = useState('')
  const [formDestination, setFormDestination] = useState('')
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0])
  const [formStartTime, setFormStartTime] = useState('08:30')
  const [formEndTime, setFormEndTime] = useState('17:00')
  const [formPurpose, setFormPurpose] = useState('')
  const [formDocName, setFormDocName] = useState('')
  const [formDocUrl, setFormDocUrl] = useState('')
  const [docInputMode, setDocInputMode] = useState<'upload' | 'url'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 15MB limit check
    if (file.size > 15 * 1024 * 1024) {
      toast.error(isMs ? 'Saiz fail melebihi had maksimum 15MB.' : 'File size exceeds maximum limit of 15MB.')
      return
    }

    setFormDocName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setFormDocUrl(reader.result as string)
      toast.success(isMs ? `Fail "${file.name}" sedia dilampirkan.` : `File "${file.name}" ready to attach.`)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveDoc = () => {
    setFormDocName('')
    setFormDocUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const loadMovements = async () => {
    try {
      setIsLoading(true)
      const res = await getStaffMovements({
        hospitalId: user?.hospital_id,
        departmentId: user?.department_id
      })
      if (res.data) setMovements(res.data)
    } catch (e) {
      console.error(e)
      toast.error(isMs ? 'Ralat memuatkan rekod pergerakan' : 'Error loading movement records')
    } finally {
      setIsLoading(false)
    }
  }

  // Load ONLY real staff belonging strictly to Pharmacy Department
  const loadPharmacyColleagues = async () => {
    try {
      let rawUsers: any[] = []

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            jawatan,
            email,
            employee_id,
            department_id,
            hospital_id,
            status,
            department:departments!department_id(id, department_name, department_code)
          `)
          .eq('status', 'active')

        if (!error && data && data.length > 0) {
          rawUsers = data
        }
      }

      if (rawUsers.length === 0) {
        const res = await getUsers({
          hospitalId: user?.hospital_id,
          pageSize: 300
        })
        if (res.data && res.data.length > 0) {
          rawUsers = res.data
        }
      }

      // STRICT FILTER: Disqualify non-pharmacy departments and non-pharmacy roles
      const isPharmacyStaffMember = (u: any): boolean => {
        const deptName = (u.department?.department_name || u.department?.name || '').toLowerCase()
        const deptCode = (u.department?.department_code || u.department?.code || '').toLowerCase()
        const jawatan = (u.jawatan || '').toLowerCase()
        
        const nonPharmacyKeywords = [
          'jururawat',
          'nurse',
          'nursing',
          'nephrology',
          'nefro',
          'dialisis',
          'hemodialisis',
          'radiologi',
          'x-ray',
          'pemandu',
          'driver',
          'fisioterapi',
          'dietetik',
          'kecemasan',
          'emergency',
          'dewan bedah',
          'ot ',
          'wad ',
          'rekod perubatan',
          'pentadbiran',
          'pentadbiran am',
          'sumber manusia',
          'kewangan'
        ]

        if (nonPharmacyKeywords.some(kw => deptName.includes(kw) || jawatan.includes(kw))) {
          return false
        }

        // 2. Strict Qualification: Must belong to Pharmacy or have Pharmacy job title
        const isDeptPharmacy = deptName.includes('farmasi') || deptName.includes('pharmacy') || deptCode.includes('far') || deptCode.includes('pharma')
        const isJawatanPharmacy =
          jawatan.includes('farmasi') ||
          jawatan.includes('uf') ||
          jawatan.includes('u7') ||
          jawatan.includes('u5') ||
          jawatan.includes('pembantu khidmat am') ||
          jawatan.includes('pka')

        return isDeptPharmacy || isJawatanPharmacy
      }

      const pharmacyStaff = rawUsers.filter(isPharmacyStaffMember).map(u => ({
        id: u.id,
        full_name: u.full_name,
        jawatan: u.jawatan || 'Pegawai Farmasi',
        department_name: u.department?.department_name || 'Jabatan Farmasi',
        employee_id: u.employee_id
      }))

      if (pharmacyStaff.length > 0) {
        setColleagues(pharmacyStaff)
        setSelectedColleagueId(pharmacyStaff[0].id)
      } else {
        setColleagues(REAL_PHARMACY_STAFF)
        setSelectedColleagueId(REAL_PHARMACY_STAFF[0].id)
      }
    } catch {
      setColleagues(REAL_PHARMACY_STAFF)
      setSelectedColleagueId(REAL_PHARMACY_STAFF[0].id)
    }
  }

  useEffect(() => {
    loadMovements()
    loadPharmacyColleagues()
  }, [user?.hospital_id, user?.department_id])

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (selectedType !== 'ALL' && m.jenis_pergerakan !== selectedType) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          m.tajuk.toLowerCase().includes(q) ||
          m.destination.toLowerCase().includes(q) ||
          (m.user?.full_name && m.user.full_name.toLowerCase().includes(q)) ||
          (m.logged_by_name && m.logged_by_name.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [movements, selectedType, searchQuery])

  // Active Target Officer being recorded
  const activeTargetOfficer = useMemo<ColleagueOption>(() => {
    if (logTarget === 'self') {
      return {
        id: user?.id || 'demo-self',
        full_name: user?.full_name || 'AMRI AMIT',
        jawatan: user?.jawatan || 'Penolong Pegawai Farmasi U5',
        department_name: user?.department?.department_name || 'Jabatan Farmasi',
        employee_id: (user as any)?.employee_id
      }
    }

    if (isManualOfficer) {
      return {
        id: 'custom-' + Date.now(),
        full_name: manualOfficerName.trim() || (isMs ? 'Pegawai Farmasi Khas' : 'Special Officer'),
        jawatan: manualOfficerRole.trim() || (isMs ? 'Pegawai Farmasi' : 'Pharmacy Officer'),
        department_name: isMs ? 'Jabatan Farmasi' : 'Pharmacy Department'
      }
    }

    const found = colleagues.find(c => c.id === selectedColleagueId)
    return (
      found ||
      colleagues[0] || {
        id: '5a2e226f-8ebe-4ee6-8e33-6ec7687ef9d2',
        full_name: 'Mohamad Aiman bin Mat Zaki',
        jawatan: 'Pegawai Farmasi UF9',
        department_name: 'Jabatan Farmasi (Logistik)'
      }
    )
  }, [logTarget, user, isManualOfficer, manualOfficerName, manualOfficerRole, selectedColleagueId, colleagues, isMs])

  const handleOpenCreate = () => {
    setEditingMovement(null)
    setLogTarget('self')
    setSelectedColleagueId(colleagues[0]?.id || '')
    setIsManualOfficer(false)
    setManualOfficerName('')
    setManualOfficerRole('')
    setFormType('MEETING')
    setFormTitle('')
    setFormDestination('')
    setFormStartDate(new Date().toISOString().split('T')[0])
    setFormEndDate(new Date().toISOString().split('T')[0])
    setFormStartTime('08:30')
    setFormEndTime('17:00')
    setFormPurpose('')
    setFormDocName('')
    setFormDocUrl('')
    setEditReason('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setIsSlideOverOpen(true)
  }

  const handleOpenEdit = (mov: StaffMovement, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingMovement(mov)
    if (mov.user_id === user?.id) {
      setLogTarget('self')
    } else {
      setLogTarget('other')
      setSelectedColleagueId(mov.user_id)
    }
    setIsManualOfficer(false)
    setFormType(mov.jenis_pergerakan)
    setFormTitle(mov.tajuk)
    setFormDestination(mov.destination || '')
    setFormStartDate(mov.tarikh_mula)
    setFormEndDate(mov.tarikh_tamat)
    setFormStartTime(mov.masa_keluar || '08:30')
    setFormEndTime(mov.masa_balik || '17:00')
    setFormPurpose(mov.tujuan || '')
    setFormDocName(mov.attachment_name || '')
    setFormDocUrl(mov.attachment_url || '')
    setEditReason('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setIsSlideOverOpen(true)
  }

  const handleOpenDelete = (mov: StaffMovement, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingMovement(mov)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (reason: string) => {
    if (!deletingMovement) return
    try {
      await deleteStaffMovementWithAudit(deletingMovement.id, {
        reason,
        actor_id: user?.id || 'demo-user',
        actor_name: user?.full_name || 'AMRI AMIT',
        actor_role: user?.jawatan || 'Pegawai Farmasi',
        record_title: deletingMovement.tajuk
      })
      toast.success(isMs ? 'Rekod pergerakan telah dipadam dan jejak audit rasmi disimpan.' : 'Movement record deleted and official audit trail saved.')
      setMovements(prev => prev.filter(m => m.id !== deletingMovement.id))
      setIsDeleteModalOpen(false)
      setDeletingMovement(null)
    } catch {
      toast.error(isMs ? 'Gagal memadam rekod pergerakan.' : 'Failed to delete movement record.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDestination.trim() || !formPurpose.trim()) {
      toast.error(isMs ? 'Please provide the movement title, destination, and purpose.' : 'Please complete the title, destination, and purpose of movement.')
      return
    }

    if (editingMovement && !editReason.trim()) {
      toast.error(isMs ? 'Please state the amendment justification (Mandatory for audit trail).' : 'Please state the reason / justification for amendment (Mandatory for audit trail).')
      return
    }

    if (logTarget === 'other' && isManualOfficer && (!manualOfficerName.trim() || !manualOfficerRole.trim())) {
      toast.error(isMs ? 'Please enter the name and designation of officer involved.' : 'Please enter the name and role of the officer involved.')
      return
    }

    try {
      setSubmitting(true)

      const targetId = activeTargetOfficer.id
      const targetUser = {
        id: targetId,
        full_name: activeTargetOfficer.full_name,
        jawatan: activeTargetOfficer.jawatan,
        email: 'pharmacy@moh.gov.my',
        role: 'user' as any,
        hospital_id: user?.hospital_id || 'hosp-1',
        department_id: user?.department_id || 'dept-001-pharmacy',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (editingMovement) {
        // UPDATE existing record with audit
        const res = await updateStaffMovement(
          editingMovement.id,
          {
            user_id: targetId,
            jenis_pergerakan: formType,
            tajuk: formTitle,
            destination: formDestination,
            tarikh_mula: formStartDate,
            tarikh_tamat: formEndDate,
            masa_keluar: formStartTime,
            masa_balik: formEndTime,
            tujuan: formPurpose,
            attachment_name: formDocName.trim() ? formDocName.trim() : null,
            attachment_url: formDocUrl.trim() ? formDocUrl.trim() : null,
            user: targetUser as any
          },
          {
            reason: editReason.trim(),
            actor_id: user?.id || 'user-amri',
            actor_name: user?.full_name || 'AMRI AMIT',
            actor_role: user?.jawatan || (isMs ? 'Pegawai Bertugas' : 'Duty Officer')
          }
        )
        if (res.error) throw new Error(res.error)
        toast.success(isMs ? 'Rekod pergerakan berjaya dikemaskini dan jejak audit disimpan!' : 'Movement record updated and audit trail logged!')
      } else {
        // CREATE new record
        const res = await submitStaffMovement({
          user_id: targetId,
          hospital_id: user?.hospital_id || 'hosp-1',
          department_id: user?.department_id || 'dept-001-pharmacy',
          jenis_pergerakan: formType,
          tajuk: formTitle,
          destination: formDestination,
          tarikh_mula: formStartDate,
          tarikh_tamat: formEndDate,
          masa_keluar: formStartTime,
          masa_balik: formEndTime,
          tujuan: formPurpose,
          attachment_name: formDocName.trim() ? formDocName.trim() : null,
          attachment_url: formDocUrl.trim() ? formDocUrl.trim() : null,
          status: 'confirmed',
          is_recurring: false,
          logged_by_user_id: user?.id || 'user-amri',
          logged_by_name: user?.full_name || 'AMRI AMIT',
          logged_by_role: user?.jawatan || 'Penolong Pegawai Farmasi U5',
          user: targetUser as any
        })
        if (res.error) throw new Error(res.error)
        toast.success(
          logTarget === 'self'
            ? (isMs ? 'Staff Duty Movement Form successfully recorded!' : 'Officer Movement Form successfully recorded!')
            : isMs
            ? `Pergerakan bagi ${activeTargetOfficer.full_name} berjaya direkodkan oleh ${user?.full_name || 'anda'}!`
            : `Movement for ${activeTargetOfficer.full_name} successfully recorded by ${user?.full_name || 'you'}!`
        )
      }

      setIsSlideOverOpen(false)
      setEditingMovement(null)
      setEditReason('')
      await loadMovements()
    } catch (err: any) {
      toast.error(err.message || (isMs ? 'Gagal menyimpan rekod pergerakan' : 'Failed to save movement record'))
    } finally {
      setSubmitting(false)
    }
  }

  const movementTypeOptions = [
    {
      id: 'MEETING' as MovementType,
      label: isMs ? 'Mesyuarat / Perbincangan' : 'Meeting / Discussion',
      desc: isMs ? 'Mesyuarat jawatankuasa ubat, penyelarasan & perbincangan rasmi' : 'Drug committee meetings, coordination & official discussions',
      icon: Briefcase
    },
    {
      id: 'COURSE' as MovementType,
      label: isMs ? 'Kursus / Latihan / Bengkel' : 'Course / Training / Workshop',
      desc: isMs ? 'Kursus ILKKM, latihan kepakaran klinikal & bengkel farmasi' : 'ILKKM courses, clinical skills training & department workshops',
      icon: GraduationCap
    },
    {
      id: 'CME' as MovementType,
      label: isMs ? 'CME / CPD Pembelajaran' : 'CME / CPD Learning Session',
      desc: isMs ? 'Sesi Continuing Medical Education & pembelajaran farmakoterapi' : 'Continuing Medical Education & pharmacotherapy learning sessions',
      icon: Stethoscope
    },
    {
      id: 'PRESENTATION' as MovementType,
      label: isMs ? 'Pembentangan / Speaker' : 'Presentation / Guest Speaker',
      desc: isMs ? 'Pembentangan penyelidikan ubat, penceramah jemputan' : 'Drug research presentation, invited guest speaker',
      icon: Presentation
    },
    {
      id: 'SITE_VISIT' as MovementType,
      label: isMs ? 'Lawatan Tapak / Audit' : 'Site Visit / Facility Audit',
      desc: isMs ? 'Pemeriksaan stor ubat, verifikasi keselamatan DDA & audit fasiliti' : 'Medicine store inspection, DDA safety check & facility audit',
      icon: MapPin
    },
    {
      id: 'OFFICIAL_DUTY' as MovementType,
      label: isMs ? 'Tugas Rasmi Luar' : 'Outstation Official Duty',
      desc: isMs ? 'Penugasan bekalan logistik ubat di luar kawasan hospital/stesen' : 'Logistics supply distribution & official duty outside hospital/station',
      icon: FileText
    },
    {
      id: 'ANNUAL_LEAVE' as MovementType,
      label: isMs ? 'Cuti Rehat / Annual Leave' : 'Annual Leave / Rest Day',
      desc: isMs ? 'Cuti tahunan yang diluluskan, pelepasan am & rehat pegawai' : 'Approved annual leave, public release & officer leave',
      icon: Palmtree
    },
    {
      id: 'TIME_OFF' as MovementType,
      label: isMs ? 'Time Off / Keluar Seketika' : 'Time Off / Short Absence',
      desc: isMs ? 'Pelepasan waktu bertugas (< 4 jam), urusan kecemasan / peribadi' : 'Official short absence (< 4 hours), emergency / personal matter',
      icon: Timer
    }
  ]

  return (
    <div className="p-6 md:p-8 w-full space-y-6 text-slate-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-green-500" />
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.STAFF_DASHBOARD)}
            className="p-3 hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-800">
                {isMs ? 'Log Pergerakan Staf & Rekod Keluar Pejabat' : 'Staff Movement & Out of Station Log'}
              </h1>
              <Badge variant="gray" className="font-mono text-[10px] font-bold py-0.5 px-2 text-emerald-700 bg-emerald-50 border-emerald-200">
                {isMs ? 'JABATAN FARMASI' : 'PHARMACY DEPARTMENT'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {isMs
                ? 'Borang Pergerakan Pegawai Farmasi (Mesyuarat, Kursus, Lawatan Tapak, CME & Tugasan Rasmi)'
                : 'Officer Movement Log (Meetings, Courses, Site Visits, CME & Official Duties)'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAuditDrawerOpen(true)}
            className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs flex-1 sm:flex-initial"
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>{isMs ? 'Log Audit & Pindaan' : 'Audit Trail & History'}</span>
          </button>

          <Button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-md hover:shadow-lg font-bold flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] transition-all text-sm flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>{isMs ? 'Catat Pergerakan Baharu' : 'Record New Movement'}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isMs ? "Cari tajuk, destinasi, pegawai farmasi atau pelapor..." : "Search title, destination, officer or submitter..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: isMs ? 'Semua Kategori' : 'All Categories' },
            { id: 'MEETING', label: isMs ? 'Mesyuarat' : 'Meetings' },
            { id: 'COURSE', label: isMs ? 'Kursus/Latihan' : 'Courses/Training' },
            { id: 'CME', label: isMs ? 'CME/CPD' : 'CME/CPD' },
            { id: 'PRESENTATION', label: isMs ? 'Pembentangan' : 'Presentations' },
            { id: 'SITE_VISIT', label: isMs ? 'Lawatan Tapak' : 'Site Visits' },
            { id: 'OFFICIAL_DUTY', label: isMs ? 'Tugas Rasmi' : 'Official Duty' },
            { id: 'ANNUAL_LEAVE', label: isMs ? 'Cuti Rehat (Annual Leave)' : 'Annual Leave' },
            { id: 'TIME_OFF', label: isMs ? 'Time Off' : 'Time Off' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedType === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movement Records Table - Desktop View (>= lg) */}
      <div className="hidden lg:block">
        {isLoading ? (
          <SkeletonTable rows={5} columns={9} />
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-black text-slate-600 tracking-wider font-mono">
                  <tr>
                    <th className="px-6 py-4">{isMs ? 'Pegawai Terlibat (Farmasi)' : 'Involved Officer'}</th>
                    <th className="px-6 py-4">{isMs ? 'Kategori & Tajuk Pergerakan' : 'Category & Movement Title'}</th>
                    <th className="px-6 py-4">{isMs ? 'Destinasi' : 'Destination'}</th>
                    <th className="px-6 py-4">{isMs ? 'Tarikh & Masa Keluar' : 'Date & Departure Time'}</th>
                    <th className="px-6 py-4">{isMs ? 'Tujuan / Skop' : 'Purpose / Scope'}</th>
                    <th className="px-6 py-4">{isMs ? 'Dokumen Lampiran (1-Click)' : 'Attached Document (1-Click)'}</th>
                    <th className="px-6 py-4">{isMs ? 'Didaftarkan Oleh' : 'Submitted By'}</th>
                    <th className="px-6 py-4">{isMs ? 'Status' : 'Status'}</th>
                    <th className="px-6 py-4 text-right">{isMs ? 'Tindakan' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16 text-slate-400">
                        <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-600">
                          {isMs ? 'Tiada rekod pergerakan dijumpai' : 'No movement records found'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isMs
                            ? 'Semua pegawai farmasi berada di stesen atau belum ada pergerakan direkodkan.'
                            : 'All officers are currently on station or no movement has been recorded.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map(m => {
                      const isLoggedByOther = m.logged_by_name && m.logged_by_name !== (m.user?.full_name || '')

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {m.user?.full_name?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{m.user?.full_name || (isMs ? 'Pegawai Farmasi' : 'Pharmacy Officer')}</div>
                                <div className="text-xs text-slate-500">{m.user?.jawatan || (isMs ? 'Pegawai Farmasi UF9' : 'Pharmacy Officer')}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{m.tajuk}</div>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 font-mono">
                                {m.jenis_pergerakan}
                              </span>
                              {m.last_edited_by_name && (
                                <span className="text-[10px] text-amber-900 font-bold bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1" title={m.last_edit_reason || (isMs ? 'Pindaan data' : 'Data modification')}>
                                  <Edit3 className="w-3 h-3 text-amber-700 shrink-0" />
                                  <span>{isMs ? `Dipinda: ${m.last_edited_by_name}` : `Modified: ${m.last_edited_by_name}`}</span>
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{m.destination}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-mono text-xs">
                            <div className="text-slate-800 font-bold">
                              {m.tarikh_mula} {m.tarikh_mula !== m.tarikh_tamat && `— ${m.tarikh_tamat}`}
                            </div>
                            <div className="text-slate-500">
                              {m.masa_keluar || '08:00'} - {m.masa_balik || '17:00'}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                            <div className="line-clamp-2 leading-relaxed">{m.tujuan}</div>
                          </td>

                          {/* Document Attachment Column */}
                          <td className="px-6 py-4">
                            {m.attachment_url || m.attachment_name ? (
                              <a
                                href={m.attachment_url || '#'}
                                download={m.attachment_name || 'Document_Attachment'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shadow-xs text-xs font-bold max-w-[180px] group/doc"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-600 group-hover/doc:text-white shrink-0" />
                                <span className="truncate">
                                  {m.attachment_name || (isMs ? 'Surat / Memo' : 'Letter / Memo')}
                                </span>
                                <Download className="w-3 h-3 group-hover/doc:translate-y-0.5 transition-transform shrink-0" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 font-normal italic">
                                {isMs ? 'Tiada dokumen' : 'No document'}
                              </span>
                            )}
                          </td>

                          {/* Logged By Column */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{m.logged_by_name || m.user?.full_name || user?.full_name || 'AMRI AMIT'}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {isLoggedByOther ? (isMs ? 'Bagi pihak pegawai' : 'On behalf of officer') : (isMs ? 'Didaftar sendiri' : 'Self-registered')}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              {isMs ? 'Disahkan' : 'Confirmed'}
                            </span>
                          </td>

                          {/* Column 9: Tindakan (Edit with Audit & Delete with Reason) */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => handleOpenEdit(m, e)}
                                title={isMs ? "Kemaskini Rekod & Rekod Log Pindaan" : "Edit Record & Log Modification"}
                                className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all border border-slate-200 shadow-2xs hover:shadow-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleOpenDelete(m, e)}
                                title={isMs ? "Padam Pergerakan & Rekod Sebab Pemadaman" : "Delete Movement & Log Reason"}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 shadow-2xs hover:shadow-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Movement Records - Mobile Native Card View (< lg) */}
      <div className="block lg:hidden space-y-4">
        {isLoading ? (
          <SkeletonMobileCardList count={4} />
        ) : filteredMovements.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 shadow-xl">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">
              {isMs ? 'Tiada rekod pergerakan dijumpai' : 'No movement records found'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isMs
                ? 'Semua pegawai farmasi berada di stesen atau belum ada pergerakan direkodkan.'
                : 'All officers are currently on station or no movement has been recorded.'}
            </p>
          </div>
        ) : (
          filteredMovements.map(m => {
            const isLoggedByOther = m.logged_by_name && m.logged_by_name !== (m.user?.full_name || '')
            const officerName = m.user?.full_name || (isMs ? 'Pegawai Farmasi' : 'Pharmacy Officer')
            const officerRole = m.user?.jawatan || (isMs ? 'Pegawai Farmasi UF9' : 'Pharmacy Officer')

            return (
              <div
                key={m.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-lg space-y-4 hover:border-emerald-200 transition-all"
              >
                {/* Officer & Status Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
                      {officerName.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{officerName}</div>
                      <div className="text-xs text-slate-500 truncate">{officerRole}</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isMs ? 'Disahkan' : 'Confirmed'}
                  </span>
                </div>

                {/* Category & Title */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 font-mono uppercase">
                      {m.jenis_pergerakan}
                    </span>
                    {m.last_edited_by_name && (
                      <span className="text-[10px] text-amber-900 font-bold bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <Edit3 className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>{isMs ? `Dipinda: ${m.last_edited_by_name}` : `Modified: ${m.last_edited_by_name}`}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">{m.tajuk}</h3>
                </div>

                {/* Destination & Date/Time Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{m.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-slate-800 font-bold">
                      {m.tarikh_mula} {m.tarikh_mula !== m.tarikh_tamat && `— ${m.tarikh_tamat}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-600 sm:col-span-2">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{m.masa_keluar || '08:00'} — {m.masa_balik || '17:00'}</span>
                  </div>
                </div>

                {/* Purpose */}
                {m.tujuan && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                    {m.tujuan}
                  </p>
                )}

                {/* Attachment (if any) */}
                {(m.attachment_url || m.attachment_name) && (
                  <div>
                    <a
                      href={m.attachment_url || '#'}
                      download={m.attachment_name || 'Document_Attachment'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[220px]">
                        {m.attachment_name || (isMs ? 'Surat / Memo Lampiran' : 'Attached Document')}
                      </span>
                      <Download className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}

                {/* Footer: Submitter info + Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
                  <div className="text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 font-bold text-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[150px]">{m.logged_by_name || officerName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isLoggedByOther ? (isMs ? 'Bagi pihak' : 'On behalf') : (isMs ? 'Didaftar sendiri' : 'Self')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleOpenEdit(m, e)}
                      title={isMs ? "Kemaskini Rekod" : "Edit Record"}
                      className="p-2.5 text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-all border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleOpenDelete(m, e)}
                      title={isMs ? "Padam Pergerakan" : "Delete Movement"}
                      className="p-2.5 text-rose-500 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* SlideOver Drawer: Borang Pergerakan Pegawai / Kemaskini (Slides from Right) */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false)
          setEditingMovement(null)
        }}
        size="3xl"
        title={
          editingMovement
            ? isMs ? 'Kemaskini Borang Pergerakan Pegawai' : 'Update Officer Movement Record'
            : isMs ? 'Borang Pergerakan Pegawai' : 'Officer Movement Form'
        }
        description={
          editingMovement
            ? isMs ? 'Pindaan rasmi rekod pergerakan pegawai dengan catatan jejak audit mandatori' : 'Official modification of movement record with mandatory audit trail logging'
            : isMs ? 'Rekod rasmi urusan pergerakan keluar pejabat, mesyuarat luar, kursus dan tugasan stesen' : 'Official registration for out-of-office travel, external meetings, courses, and station duties'
        }
      >
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 pb-24 text-slate-800">
          {/* Target Selection Switcher: Diri Sendiri vs Pegawai Lain di Jabatan Farmasi */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {isMs ? 'Pilihan Pegawai / Sasaran Pendaftaran' : 'Target Officer Selection'}
            </label>

            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setLogTarget('self')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  logTarget === 'self'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>{isMs ? `Diri Sendiri (${user?.full_name?.split(' ')[0] || 'AMRI'})` : `Self (${user?.full_name?.split(' ')[0] || 'AMRI'})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setLogTarget('other')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  logTarget === 'other'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{isMs ? 'Pegawai Lain di Jabatan' : 'Other Department Officer'}</span>
              </button>
            </div>
          </div>

          {/* Officer Context Card (Submitter & Moving Officer) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-slate-50 border border-emerald-200/80 space-y-3">
            {/* Submitter info */}
            <div className="flex items-center justify-between border-b border-emerald-100/80 pb-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  {editingMovement
                    ? isMs ? 'Pegawai Yang Meminda:' : 'Amended By:'
                    : isMs ? 'Didaftarkan Oleh (Pelapor):' : 'Submitted By (Reporter):'}
                </span>
                <span className="font-extrabold text-slate-900">
                  {user?.full_name || 'AMRI AMIT'} ({user?.jawatan || (isMs ? 'Penolong Pegawai Farmasi U5' : 'Assistant Pharmacy Officer U5')})
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white border border-emerald-300 text-emerald-700 shadow-xs">
                {editingMovement
                  ? isMs ? 'MOD PINDAAN' : 'EDIT MODE'
                  : isMs ? 'JABATAN FARMASI' : 'PHARMACY DEPT'}
              </span>
            </div>

            {/* Target Officer Card */}
            {logTarget === 'self' ? (
              <div className="flex items-center gap-3.5 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                  {user?.full_name ? user.full_name.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    {isMs ? 'Pegawai Yang Keluar Stesen' : 'Officer Leaving Station'}
                  </p>
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {user?.full_name || 'AMRI AMIT'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {user?.jawatan || (isMs ? 'Penolong Pegawai Farmasi U5' : 'Assistant Pharmacy Officer U5')} • {isMs ? 'Jabatan Farmasi' : 'Pharmacy Department'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    {isMs ? 'Pilih Pegawai Farmasi Terlibat:' : 'Select Involved Officer:'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsManualOfficer(!isManualOfficer)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    {isManualOfficer
                      ? isMs ? 'Pilih Dari Senarai Farmasi' : 'Select from List'
                      : isMs ? '+ Masukkan Manual' : '+ Manual Entry'}
                  </button>
                </div>

                {!isManualOfficer ? (
                  <select
                    value={selectedColleagueId}
                    onChange={e => setSelectedColleagueId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-emerald-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  >
                    {colleagues.map(col => (
                      <option key={col.id} value={col.id}>
                        {col.full_name} — {col.jawatan} ({col.department_name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-emerald-300 shadow-sm">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        {isMs ? 'Nama Pegawai' : 'Officer Name'}
                      </label>
                      <input
                        type="text"
                        placeholder={isMs ? "cth. Mohamad Aiman bin Mat Zaki" : "e.g. Mohamad Aiman bin Mat Zaki"}
                        value={manualOfficerName}
                        onChange={e => setManualOfficerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        {isMs ? 'Jawatan / Gred' : 'Designation / Grade'}
                      </label>
                      <input
                        type="text"
                        placeholder={isMs ? "cth. Pegawai Farmasi UF9" : "e.g. Pharmacy Officer UF9"}
                        value={manualOfficerRole}
                        onChange={e => setManualOfficerRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mandatory Edit Reason Box if Editing */}
          {editingMovement && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-400 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>
                    {isMs ? 'Sebab / Justifikasi Pindaan (Mandatori Rekod Audit)' : 'Reason / Justification for Amendment (Mandatory Audit Trail)'}{' '}
                    <span className="text-rose-600">*</span>
                  </span>
                </label>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                  AUDIT LOG
                </span>
              </div>

              {/* Quick Preset Chips for Edit Reason */}
              <div className="flex flex-wrap gap-1.5">
                {(isMs
                  ? [
                      'Perubahan Tarikh / Masa Pergerakan',
                      'Pertukaran Destinasi / Lokasi',
                      'Kemaskini Surat / Memo Panggilan',
                      'Pembetulan Maklumat Pegawai',
                      'Penukaran Pengangkutan / Urusan'
                    ]
                  : [
                      'Change of Date / Time',
                      'Change of Destination / Venue',
                      'Updated Memo / Official Letter',
                      'Correction of Officer Details',
                      'Adjustment of Assignment / Duty'
                    ]
                ).map((chip, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setEditReason(chip)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      editReason === chip
                        ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/60'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                required
                value={editReason}
                onChange={e => setEditReason(e.target.value)}
                placeholder={
                  isMs
                    ? 'Cth: Dipinda atas pertukaran jadual mesyuarat oleh pihak penganjur...'
                    : 'E.g., Modified due to organizer rescheduling the meeting time...'
                }
                className="w-full p-3 rounded-xl border border-amber-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          )}

          {/* Movement Type Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {isMs ? 'Kategori Pergerakan' : 'Movement Category'} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {movementTypeOptions.map(cat => {
                const isSelected = formType === cat.id
                const IconComponent = cat.icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormType(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0">
                      <IconComponent className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="font-extrabold text-xs text-slate-900 leading-snug">
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 line-clamp-1">
                        {cat.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form Fields: Tajuk & Destinasi */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                {isMs ? 'Tajuk / Ringkasan Pergerakan' : 'Movement Title / Subject'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={isMs ? "cth. Mesyuarat Jawatankuasa Ubat Negeri Bil. 2/2026" : "e.g. State Drug Committee Meeting No. 2/2026"}
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                {isMs ? 'Destinasi / Lokasi Lawatan' : 'Destination / Venue'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={isMs ? "cth. Bilik Mesyuarat Utama, Hospital Miri / Dewan Sri Lawas" : "e.g. Main Conference Room, Hospital Miri / Sri Lawas Hall"}
                  value={formDestination}
                  onChange={e => setFormDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Date & Time Range Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isMs ? 'Tarikh & Masa Keluar' : 'Departure Date & Time'}</span>
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={e => setFormStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="time"
                  required
                  value={formStartTime}
                  onChange={e => setFormStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isMs ? 'Tarikh & Jangkaan Balik' : 'Expected Return Date & Time'}</span>
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={formEndDate}
                  onChange={e => setFormEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="time"
                  required
                  value={formEndTime}
                  onChange={e => setFormEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Purpose / Scope */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {isMs ? 'Tujuan Terperinci / Catatan Tambahan' : 'Purpose / Additional Notes'} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder={isMs ? "cth. Menghadiri bengkel persediaan audit farmasi hospital dan semakan stok logistik..." : "e.g. Attending hospital pharmacy audit workshop and reviewing logistics stock..."}
              value={formPurpose}
              onChange={e => setFormPurpose(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all shadow-2xs resize-none"
            />
          </div>

          {/* Document Attachment & Direct Access Section */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isMs ? 'Dokumen Rujukan / Surat Panggilan / Slaid (Pilihan)' : 'Reference Document / Invitation Letter / Slides (Optional)'}</span>
              </label>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setDocInputMode('upload')}
                  className={`px-2 py-0.5 rounded ${docInputMode === 'upload' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                >
                  {isMs ? 'Muat Naik' : 'Upload File'}
                </button>
                <button
                  type="button"
                  onClick={() => setDocInputMode('url')}
                  className={`px-2 py-0.5 rounded ${docInputMode === 'url' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                >
                  {isMs ? 'Pautan' : 'Link URL'}
                </button>
              </div>
            </div>

            {docInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="hidden"
                />

                {!formDocName ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center transition-all bg-white hover:bg-emerald-50/30 group"
                  >
                    <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 mx-auto mb-1.5 transition-colors" />
                    <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-900">
                      {isMs ? 'Klik untuk Pilih Dokumen / Surat Panggilan Tugas / Slaid' : 'Click to Upload Document / Letter / Slides'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isMs ? 'Menyokong fail PDF, Word, PowerPoint & Gambar (Maks. 15MB)' : 'Supports PDF, Word, PowerPoint & Image files (Max 15MB)'}
                    </p>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{formDocName}</p>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          {isMs ? 'Dokumen sedia untuk akses segera' : 'Document ready for direct access'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDoc}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={isMs ? "Nama Dokumen (cth. Surat Panggilan Mesyuarat MTC Bil 3.pdf)" : "Document Name (e.g. Official Meeting Invitation Letter.pdf)"}
                  value={formDocName}
                  onChange={e => setFormDocName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="url"
                  placeholder={isMs ? "URL Dokumen Google Drive / Portal KKM (cth. https://drive.google.com/...)" : "Document URL Google Drive / Portal (e.g. https://drive.google.com/...)"}
                  value={formDocUrl}
                  onChange={e => setFormDocUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 pt-1">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isMs
                  ? 'Dokumen yang dilampirkan boleh dibuka dan dimuat turun secara terus daripada jadual pergerakan.'
                  : 'Attached documents can be viewed and downloaded directly from the movement table.'}
              </span>
            </p>
          </div>

          {/* Drawer Sticky Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSlideOverOpen(false)
                setEditingMovement(null)
              }}
              className="border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl px-5 py-2.5 shadow-sm"
            >
              {isMs ? 'Batal' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl px-6 py-2.5 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              <span>
                {submitting
                  ? isMs ? 'Merekodkan...' : 'Saving...'
                  : editingMovement
                  ? isMs ? 'Simpan Pindaan & Log Audit' : 'Save Changes & Log Audit'
                  : isMs ? 'Hantar Borang Pergerakan' : 'Submit Movement Form'}
              </span>
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* Audit Reason Modal for Movement Delete */}
      <AuditReasonModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingMovement(null)
        }}
        onConfirm={handleConfirmDelete}
        title={isMs ? "Sahkan Pemadaman Rekod Pergerakan" : "Confirm Deletion of Movement Record"}
        recordTitle={deletingMovement?.tajuk || ''}
        actionType="DELETE"
        actorName={user?.full_name || 'AMRI AMIT'}
        actorRole={user?.jawatan || (isMs ? 'Pegawai Farmasi' : 'Pharmacy Officer')}
        presetReasons={
          isMs
            ? [
                'Pergerakan Keluar Dibatalkan',
                'Pertukaran Pegawai Terlibat',
                'Tersilap Pilihan Tarikh & Masa',
                'Urusan Selesai di Stesen Sendiri',
                'Tersilap Masuk Rekod Berganda'
              ]
            : [
                'Out of Station Travel Cancelled',
                'Change of Assigned Officer',
                'Incorrect Date & Time Selection',
                'Matter Resolved at Home Station',
                'Duplicate Entry'
              ]
        }
      />

      {/* Audit Log Drawer */}
      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        defaultModule="MOVEMENT"
        title={isMs ? "Log Audit & Sejarah Pindaan Pergerakan Staf" : "Staff Movement Audit Trail & Modification History"}
      />
    </div>
  )
}

export default StaffMovementPage
