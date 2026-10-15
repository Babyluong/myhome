// src/modules/mytransporter/pages/TransporterDriverPanelPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertTriangle, Play, Check, Camera, MapPin, Clock, User, Shield, AlertCircle, Info } from 'lucide-react'
import { Ambulance } from '../components/AmbulanceIcon'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'

import { 
  getRequests, 
  getVehicles, 
  driverAcceptRequest,
  driverRejectRequestDirect,
  startTrip,
  completeTrip,
  cancelRequest,
  getRequestLogs,
  getInspections
} from '../services/transporterService'
import type { TransportRequest, TransportVehicle, TransportRequestLog } from '@/shared/types/mytransporter'
import { Card, CardHeader, CardContent, Button, Input, Badge, SlideOver } from '@/components/ui'

const TransporterDriverPanelPage: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const { language } = useLanguage()
  const isEn = language !== 'ms'
  const toast = useToast()

  const [requests, setRequests] = useState<TransportRequest[]>([])
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([])
  const [loading, setLoading] = useState(true)

  // Active workflows
  const [activeTab, setActiveTab] = useState<'incoming' | 'active' | 'history'>('incoming')
  const [selectedReq, setSelectedReq] = useState<TransportRequest | null>(null)
  
  // Details slideover states
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [logs, setLogs] = useState<TransportRequestLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  
  // Inspection Modal States
  const [isInspModalOpen, setIsInspModalOpen] = useState(false)
  const [inspType, setInspType] = useState<'pre_trip' | 'post_trip'>('pre_trip')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [odoReading, setOdoReading] = useState('')
  const [preTripOdo, setPreTripOdo] = useState<number | null>(null)
  
  // Condition states
  const [tyreStatus, setTyreStatus] = useState<'good' | 'issue'>('good')
  const [gasStatus, setGasStatus] = useState<'good' | 'issue'>('good')
  const [oilStatus, setOilStatus] = useState<'good' | 'issue'>('good')
  
  // Photo Simulation uploads (store filenames)
  const [tyrePhoto, setTyrePhoto] = useState<string | null>(null)
  const [gasPhoto, setGasPhoto] = useState<string | null>(null)
  const [oilPhoto, setOilPhoto] = useState<string | null>(null)
  const [odoPhoto, setOdoPhoto] = useState<string | null>(null)
  
  // Decision
  const [decision, setDecision] = useState<'cleared' | 'rejected'>('cleared')
  const [remarks, setRemarks] = useState('')

  // Reject Request Direct Modal States
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null)

  // Driver Cancellation Modal States
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancellingReqId, setCancellingReqId] = useState<string | null>(null)

  const isTripToday = (dateStr: string) => {
    const todayStr = new Date().toLocaleDateString('en-CA')
    const tripStr = new Date(dateStr).toLocaleDateString('en-CA')
    return todayStr === tripStr
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const reqRes = await getRequests()
      if (reqRes.data) setRequests(reqRes.data)
      
      const vehRes = await getVehicles()
      if (vehRes.data) setVehicles(vehRes.data.filter(v => v.status === 'active'))
    } catch (err: any) {
      toast.error(
        isEn ? 'Failed to Load Data' : 'Gagal Memuatkan Data', 
        err.message || (isEn ? 'Please try again.' : 'Sila cuba lagi.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [isEn])

  // Filter requests by driver role tabs
  const incomingRequests = requests.filter(r => {
    if (r.status_semasa !== 'submitted' && r.status_semasa !== 'driver_rejected') {
      return false
    }
    // If it was rejected by this driver due to inspection (pemandu_id matches), hide it
    if (r.status_semasa === 'driver_rejected' && r.pemandu_id === loggedUser?.id) {
      return false
    }
    // If this driver has rejected it directly (saved in localStorage), hide it
    if (loggedUser?.id) {
      const locallyRejected = localStorage.getItem(`rejected_requests_${loggedUser.id}`)
      if (locallyRejected) {
        const rejectedIds = JSON.parse(locallyRejected) as string[]
        if (rejectedIds.includes(r.id)) {
          return false
        }
      }
    }
    return true
  })
  
  const myActiveTrips = requests.filter(r => 
    r.pemandu_id === loggedUser?.id && 
    (r.status_semasa === 'driver_accepted' || r.status_semasa === 'approved' || r.status_semasa === 'in_transit')
  )

  const myHistoryTrips = requests.filter(r => {
    // Basic history status where this driver was assigned
    const isBasicHistory = r.pemandu_id === loggedUser?.id && 
      (r.status_semasa === 'completed' || r.status_semasa === 'rejected' || r.status_semasa === 'cancelled');

    // Rejected by this driver due to inspection (driver_rejected status and pemandu_id matches)
    const isInspectionRejectedByMe = r.status_semasa === 'driver_rejected' && r.pemandu_id === loggedUser?.id;

    // Locally rejected by this driver (direct rejection)
    const isLocallyRejectedByMe = loggedUser?.id ? 
      JSON.parse(localStorage.getItem(`rejected_requests_${loggedUser.id}`) || '[]').includes(r.id) : false;

    return isBasicHistory || isInspectionRejectedByMe || isLocallyRejectedByMe;
  })

  const handleOpenInspection = async (req: TransportRequest, type: 'pre_trip' | 'post_trip') => {
    setSelectedReq(req)
    setInspType(type)
    setPreTripOdo(null)
    
    // Pre-populate if post-trip
    if (type === 'post_trip') {
      setSelectedVehicleId(req.kenderaan_id || '')
      setOdoReading('')
      try {
        const inspsRes = await getInspections()
        if (inspsRes.data) {
          const preInsp = inspsRes.data.find(i => i.request_id === req.id && i.jenis_pemeriksaan === 'pre_trip')
          if (preInsp) {
            setPreTripOdo(preInsp.bacaan_odometer)
          }
        }
      } catch (err) {
        console.error('Error fetching pre-trip odometer:', err)
      }
    } else {
      setSelectedVehicleId('')
      setOdoReading('')
    }

    setTyreStatus('good')
    setGasStatus('good')
    setOilStatus('good')
    setTyrePhoto(null)
    setGasPhoto(null)
    setOilPhoto(null)
    setOdoPhoto(null)
    setDecision('cleared')
    setRemarks('')
    setIsInspModalOpen(true)
  }

  // Real photo capture trigger using HTML5 file input with camera capture
  const handlePhotoCapture = (field: 'tyre' | 'gas' | 'oil' | 'odo') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.setAttribute('capture', 'environment')
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = reader.result as string
          if (field === 'tyre') setTyrePhoto(base64data)
          if (field === 'gas') setGasPhoto(base64data)
          if (field === 'oil') setOilPhoto(base64data)
          if (field === 'odo') setOdoPhoto(base64data)
          toast.success('Gambar Diambil', `Foto ${field.toUpperCase()} berjaya direkodkan.`)
        }
        reader.readAsDataURL(file)
      }
    }
    
    input.click()
  }

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedVehicleId || !odoReading) {
      toast.error('Pemeriksaan Gagal', 'Please select a vehicle and enter the odometer reading.')
      return
    }

    // Photo check constraints are now optional. Only odometer reading is compulsory.

    const odoValue = parseInt(odoReading, 10)
    if (isNaN(odoValue) || odoValue <= 0) {
      toast.error('Ralat Odometer', 'Bacaan odometer tidak sah.')
      return
    }

    if (inspType === 'post_trip' && preTripOdo !== null) {
      if (odoValue < preTripOdo) {
        toast.error(
          'Ralat Odometer', 
          `Bacaan odometer tamat (${odoValue.toLocaleString('ms-MY')} km) tidak boleh kurang daripada bacaan mula (${preTripOdo.toLocaleString('ms-MY')} km).`
        )
        return
      }
    }

    const hospitalId = loggedUser?.hospital_id || 'hosp-1'
    const driverId = loggedUser?.id || ''

    try {
      const inspectionPayload = {
        jenis_pemeriksaan: inspType,
        status_tayar: tyreStatus,
        foto_tayar: tyrePhoto || undefined,
        status_minyak_gas: gasStatus,
        foto_minyak_gas: gasPhoto || undefined,
        status_minyak_hitam: oilStatus,
        foto_minyak_hitam: oilPhoto || undefined,
        bacaan_odometer: odoValue,
        foto_odometer: odoPhoto || undefined,
        keputusan: decision,
        catatan: remarks || undefined,
        hospital_id: hospitalId
      }

      if (inspType === 'pre_trip') {
        const res = await driverAcceptRequest(selectedReq!.id, driverId, selectedVehicleId, inspectionPayload)
        if (res.error) throw new Error(res.error)
        
        if (decision === 'rejected') {
          toast.warning('Assignment Declined', 'Trip declined due to vehicle condition and dispatched to maintenance log.')
          // Save rejection to localStorage
          if (loggedUser?.id && selectedReq) {
            const locallyRejected = localStorage.getItem(`rejected_requests_${loggedUser.id}`)
            const rejectedIds = locallyRejected ? JSON.parse(locallyRejected) : []
            if (!rejectedIds.includes(selectedReq.id)) {
              rejectedIds.push(selectedReq.id)
              localStorage.setItem(`rejected_requests_${loggedUser.id}`, JSON.stringify(rejectedIds))
            }
          }
        } else {
          toast.success('Assignment Accepted', 'Pemeriksaan berjaya disahkan. Sila tunggu kelulusan Pentadbir.')
        }
      } else {
        // Post trip complete trip
        const res = await completeTrip(selectedReq!.id, driverId, selectedVehicleId, inspectionPayload)
        if (res.error) throw new Error(res.error)
        toast.success('Trip Selesai', 'Perjalanan selamat ditutup dengan pemeriksaan post-trip berjaya didaftarkan.')
      }

      setIsInspModalOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error('Ralat Mengurus Tugasan', err.message || 'Sila cuba lagi.')
    }
  }

  const handleStartTrip = async (reqId: string) => {
    try {
      const hospitalId = loggedUser?.hospital_id || 'hosp-1'
      const res = await startTrip(reqId, loggedUser?.id || '', hospitalId)
      if (res.error) throw new Error(res.error)
      toast.success('Perjalanan Bermula', 'Status trip bertukar kepada Dalam Perjalanan (In Transit).')
      fetchData()
    } catch (err: any) {
      toast.error('Ralat Memulakan Perjalanan', err.message || 'Sila cuba lagi.')
    }
  }

  const handleOpenDirectReject = (reqId: string) => {
    setRejectingReqId(reqId)
    setRejectReason('')
    setIsRejectOpen(true)
  }

  const handleOpenCancelModal = (reqId: string) => {
    setCancellingReqId(reqId)
    setCancelReason('')
    setIsCancelOpen(true)
  }

  const handleCancelTripSubmit = async () => {
    if (!cancellingReqId || !cancelReason) {
      toast.error('Reason Required', 'Sila isi sebab pembatalan trip.')
      return
    }

    try {
      const hospitalId = loggedUser?.hospital_id || 'hosp-1'
      const res = await cancelRequest(cancellingReqId, loggedUser?.id || '', cancelReason, hospitalId)
      if (res.error) throw new Error(res.error)
      toast.success('Trip Dibatalkan', 'Trip berjaya dibatalkan.')
      setIsCancelOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error('Ralat Membatalkan Trip', err.message || 'Sila cuba lagi.')
    }
  }

  const handleDirectRejectSubmit = async () => {
    if (!rejectingReqId || !rejectReason) {
      toast.error('Reason Required', 'Sila isi sebab penolakan tugasan.')
      return
    }

    try {
      const hospitalId = loggedUser?.hospital_id || 'hosp-1'
      const res = await driverRejectRequestDirect(rejectingReqId, loggedUser?.id || '', rejectReason, hospitalId)
      if (res.error) throw new Error(res.error)
      toast.success('Assignment Declined', 'Tugasan dikembalikan ke dalam senarai sistem.')
      
      // Save rejection to localStorage
      if (loggedUser?.id) {
        const locallyRejected = localStorage.getItem(`rejected_requests_${loggedUser.id}`)
        const rejectedIds = locallyRejected ? JSON.parse(locallyRejected) : []
        if (!rejectedIds.includes(rejectingReqId)) {
          rejectedIds.push(rejectingReqId)
          localStorage.setItem(`rejected_requests_${loggedUser.id}`, JSON.stringify(rejectedIds))
        }
      }

      setIsRejectOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error('Gagal Menolak Tugasan', err.message || 'Sila cuba lagi.')
    }
  }

  const handleOpenDetails = async (req: TransportRequest) => {
    setSelectedReq(req)
    setIsDetailOpen(true)
    setLoadingLogs(true)
    try {
      const res = await getRequestLogs(req.id)
      if (res.data) {
        setLogs(res.data)
      } else {
        setLogs([])
      }
    } catch (err) {
      console.error('Failed to load request logs', err)
      setLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="gray">Draf</Badge>
      case 'submitted':
        return <Badge variant="info">{isEn ? 'Submitted (New)' : 'Dihantar (Baru)'}</Badge>
      case 'driver_accepted':
        return <Badge variant="warning">{isEn ? 'Driver Accepted' : 'Diterima Pemandu'}</Badge>
      case 'driver_rejected':
        return <Badge variant="error">{isEn ? 'Driver Rejected' : 'Pemandu Tolak'}</Badge>
      case 'approved':
        return <Badge variant="success">{isEn ? 'Approved' : 'Diluluskan'}</Badge>
      case 'rejected':
        return <Badge variant="error">{isEn ? 'Admin Rejected' : 'Ditolak Pentadbir'}</Badge>
      case 'in_transit':
        return <Badge variant="warning">{isEn ? 'In Transit' : 'Dalam Perjalanan'}</Badge>
      case 'completed':
        return <Badge variant="success">{isEn ? 'Completed' : 'Selesai'}</Badge>
      case 'cancelled':
        return <Badge variant="gray">{isEn ? 'Cancelled' : 'Dibatalkan'}</Badge>
      default:
        return <Badge variant="gray">{status}</Badge>
    }
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-6">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/transporter/dashboard')}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-semibold mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isEn ? 'Back to Dashboard' : 'Kembali ke Papan Pemuka'}</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
          <Ambulance className="w-8 h-8 text-emerald-600 animate-pulse" />
          {isEn ? 'Driver Operations & Dispatch Panel' : 'Panel Tugasan Pemandu'}
        </h1>
        <p className="text-text-muted text-sm">
          {isEn 
            ? 'Review, accept patient/staff transport assignments, and complete hospital vehicle safety checks.'
            : 'Semak, terima tugasan perjalanan pesakit/staf, dan lengkapkan semakan keselamatan kenderaan hospital.'}
        </p>
      </div>

      {/* Tab controls */}
      <div className="flex border-b border-border-default gap-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'incoming' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          {isEn ? 'Incoming Dispatch Queue' : 'Tugasan Menunggu Pemandu'} ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'active' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          {isEn ? 'My Active Trips' : 'Trip Aktif Saya'} ({myActiveTrips.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          {isEn ? 'Assignment History' : 'Sejarah Tugasan'} ({myHistoryTrips.length})
        </button>
      </div>

      {/* Content based on tab */}
      {loading ? (
        <div className="p-12 text-center text-text-muted font-medium animate-pulse">
          {isEn ? 'Processing dispatch assignments...' : 'Memproses maklumat tugasan...'}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: INCOMING REQUESTS QUEUE */}
          {activeTab === 'incoming' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {incomingRequests.length === 0 ? (
                <div className="md:col-span-2 p-12 text-center text-text-muted bg-subtle/50 border border-border-default rounded-2xl">
                  {isEn ? 'No new transport dispatches available at the moment.' : 'Tiada tugasan pengangkutan baru buat masa ini.'}
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <Card key={req.id} className="border border-border-default hover:border-border-default shadow-sm flex flex-col justify-between overflow-hidden">
                    <div 
                      onClick={() => handleOpenDetails(req)} 
                      className="cursor-pointer flex-1 flex flex-col hover:bg-subtle/50 transition-colors"
                    >
                      <CardHeader className="pb-3 bg-subtle/50 border-b border-border-subtle">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-xs text-blue-600">{req.no_rujukan}</span>
                          {req.jenis_permohonan === 'ambulance' ? (
                            <Badge variant="error">{isEn ? 'Ambulance' : 'Ambulans'}</Badge>
                          ) : req.jenis_permohonan === 'van_jenazah' ? (
                            <Badge variant="gray">{isEn ? 'Hearse Van' : 'Van Jenazah'}</Badge>
                          ) : (
                            <Badge variant="info">{isEn ? 'Official Vehicle (SG)' : 'Kereta Jabatan (SG)'}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4 flex-1">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <span className="font-bold text-text-primary">{req.destinasi}</span>
                              <p className="text-xs text-text-muted">{req.tujuan_permohonan}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-text-secondary">
                              {new Date(req.tarikh_masa_diperlukan).toLocaleString(isEn ? 'en-US' : 'ms-MY')}
                            </span>
                          </div>

                          {(req.jenis_permohonan === 'ambulance' || req.bawa_pesakit) && req.nama_pesakit && (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center gap-2 p-2 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-bold">
                                <User className="w-3.5 h-3.5" />
                                <span>{isEn ? 'Patient:' : 'Pesakit:'} {req.nama_pesakit} ({req.rn_pesakit})</span>
                              </div>
                              {req.patient_mobility && (
                                <div className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold border ${
                                  req.patient_mobility === 'stretcher' ? 'bg-amber-500/10 text-amber-400 dark:text-amber-300 font-bold border-amber-500/20' : 'bg-subtle/50 text-text-secondary border-border-default'
                                }`}>
                                  <Info className="w-3.5 h-3.5 text-text-muted" />
                                  <span>
                                    {isEn ? 'Mobility:' : 'Mobiliti:'}{' '}
                                    <span className="capitalize">
                                      {req.patient_mobility === 'stretcher' 
                                        ? (isEn ? 'Stretcher (WARD PICKUP REQUIRED)' : 'Stretcher / Usungan (WAJIB AMBIL DARI WAD)') 
                                        : req.patient_mobility}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>
                    <div className="px-6 py-4 bg-subtle/50 border-t border-border-subtle flex gap-3">
                      <Button 
                        onClick={() => handleOpenInspection(req, 'pre_trip')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      >
                        {isEn ? 'Inspect & Accept' : 'Semak & Terima'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleOpenDirectReject(req.id)}
                        className="text-xs border-border-default text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                      >
                        {isEn ? 'Decline' : 'Tolak'}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 2: MY ACTIVE TRIPS */}
          {activeTab === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myActiveTrips.length === 0 ? (
                <div className="md:col-span-2 p-12 text-center text-text-muted bg-subtle/50 border border-border-default rounded-2xl">
                  {isEn ? 'No active transport trips currently assigned to you.' : 'Tiada trip pengangkutan aktif yang didaftarkan di bawah anda.'}
                </div>
              ) : (
                myActiveTrips.map((req) => (
                  <Card key={req.id} className="border border-border-default shadow-sm flex flex-col justify-between overflow-hidden">
                    <div 
                      onClick={() => handleOpenDetails(req)}
                      className="cursor-pointer flex-1 flex flex-col hover:bg-subtle/50 transition-colors"
                    >
                      <CardHeader className="pb-3 bg-subtle/50 border-b border-border-subtle flex flex-row justify-between items-center">
                        <span className="font-mono font-bold text-xs text-blue-600">{req.no_rujukan}</span>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-500/10 border border-indigo-100 px-2 py-0.5 rounded">
                          {req.status_semasa === 'driver_accepted' && (isEn ? 'Pending Admin Approval' : 'Menunggu Kelulusan Admin')}
                          {req.status_semasa === 'approved' && (isEn ? 'Approved (Ready to Depart)' : 'Diluluskan (Sedia Jalan)')}
                          {req.status_semasa === 'in_transit' && (isEn ? 'In Transit' : 'Dalam Transit')}
                        </span>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4 flex-1">
                        <div className="space-y-2 text-sm">
                          <div className="font-bold text-text-primary flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            {req.destinasi}
                          </div>
                          <p className="text-xs text-text-muted">{req.tujuan_permohonan}</p>

                          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400 block">{isEn ? 'Trip Date:' : 'Tarikh Trip:'}</span>
                              <span className="font-bold">{new Date(req.tarikh_masa_diperlukan).toLocaleDateString(isEn ? 'en-US' : 'ms-MY')}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">{isEn ? 'Assigned Vehicle:' : 'Kenderaan Diagih:'}</span>
                              <span className="font-bold text-blue-600 font-mono">{req.kenderaan?.no_kenderaan}</span>
                            </div>
                          </div>

                          {(req.jenis_permohonan === 'ambulance' || req.bawa_pesakit) && req.nama_pesakit && (
                            <div className="space-y-1.5 pt-2">
                              <div className="flex items-center gap-2 p-2 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-bold">
                                <User className="w-3.5 h-3.5" />
                                <span>{isEn ? 'Patient:' : 'Pesakit:'} {req.nama_pesakit} ({req.rn_pesakit})</span>
                              </div>
                              {req.patient_mobility && (
                                <div className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold border ${
                                  req.patient_mobility === 'stretcher' ? 'bg-amber-500/10 text-amber-400 dark:text-amber-300 font-bold border-amber-500/20' : 'bg-subtle/50 text-text-secondary border-border-default'
                                }`}>
                                  <Info className="w-3.5 h-3.5 text-text-muted" />
                                  <span>
                                    {isEn ? 'Mobility:' : 'Mobiliti:'}{' '}
                                    <span className="capitalize">
                                      {req.patient_mobility === 'stretcher' 
                                        ? (isEn ? 'Stretcher (WARD PICKUP MANDATORY)' : 'Stretcher / Usungan (WAJIB AMBIL DARI WAD)') 
                                        : req.patient_mobility}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {req.status_semasa === 'driver_accepted' && (
                            <div className="p-3 bg-amber-500/10 border border-amber-100 rounded-xl text-xs text-amber-400 flex items-start gap-2 mt-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p>
                                {isEn 
                                  ? 'Pre-trip completed. Awaiting administrator approval before trip departure.'
                                  : 'Pre-trip selesai. Sila tunggu kelulusan dari admin sebelum menekan butang Mula Trip.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>
                    
                    <div className="px-6 py-4 bg-subtle/50 border-t border-border-subtle flex flex-col gap-2">
                      {req.status_semasa === 'approved' && (
                        <>
                          <Button 
                            onClick={() => handleStartTrip(req.id)}
                            disabled={!isTripToday(req.tarikh_masa_diperlukan)}
                            className={`w-full font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                              !isTripToday(req.tarikh_masa_diperlukan)
                                ? 'bg-subtle text-slate-400 border border-border-default cursor-not-allowed shadow-none hover:bg-subtle'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <Play className="w-4 h-4" />
                            {isTripToday(req.tarikh_masa_diperlukan) 
                              ? (isEn ? 'Start Trip (Begin Journey)' : 'Mula Trip (Start Journey)') 
                              : (isEn ? 'Start Trip (Available on trip date)' : 'Mula Trip (Tersedia pada tarikh trip)')}
                          </Button>
                          <Button
                            onClick={() => handleOpenCancelModal(req.id)}
                            variant="outline"
                            className="w-full border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-bold flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isEn ? 'Cancel Trip (Cancel Journey)' : 'Batal Trip (Cancel Journey)'}
                          </Button>
                        </>
                      )}
                      
                      {req.status_semasa === 'in_transit' && (
                        <Button 
                          onClick={() => handleOpenInspection(req, 'post_trip')}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          {isEn ? 'Complete Trip & Post-Trip Inspection' : 'Selesai Trip & Post-Trip Inspection'}
                        </Button>
                      )}

                      {req.status_semasa === 'driver_accepted' && (
                        <Button 
                          disabled
                          className="w-full bg-subtle text-text-muted cursor-not-allowed font-bold"
                        >
                          {isEn ? 'Pending Administrator Approval' : 'Menunggu Kelulusan Admin'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 3: TRIP HISTORY */}
          {activeTab === 'history' && (
            <Card className="border border-border-default shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {myHistoryTrips.length === 0 ? (
                  <div className="p-12 text-center text-text-muted">
                    {isEn ? 'No past assignment history records found.' : 'Tiada sejarah tugasan lampau ditemui.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-subtle/50 border-b border-border-subtle text-xs font-semibold text-text-muted uppercase tracking-wider">
                          <th className="px-6 py-4">{isEn ? 'Reference No.' : 'No. Rujukan'}</th>
                          <th className="px-6 py-4">{isEn ? 'Type' : 'Jenis'}</th>
                          <th className="px-6 py-4">{isEn ? 'Destination' : 'Destinasi'}</th>
                          <th className="px-6 py-4">{isEn ? 'Completion Date' : 'Selesai Perjalanan'}</th>
                          <th className="px-6 py-4">{isEn ? 'Vehicle' : 'Kenderaan'}</th>
                          <th className="px-6 py-4">{isEn ? 'Status' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle text-sm text-text-secondary">
                        {myHistoryTrips.map((req) => (
                          <tr 
                            key={req.id}
                            onClick={() => handleOpenDetails(req)}
                            className="cursor-pointer hover:bg-subtle/50 transition-colors"
                          >
                            <td className="px-6 py-4 font-mono font-bold text-text-muted">{req.no_rujukan}</td>
                            <td className="px-6 py-4 capitalize font-semibold">
                              {req.jenis_permohonan === 'sg' 
                                ? (isEn ? 'Official Car (SG)' : 'Kereta Jabatan (SG)') 
                                : req.jenis_permohonan === 'van_jenazah' 
                                ? (isEn ? 'Hearse Van' : 'Van Jenazah') 
                                : (isEn ? 'Ambulance' : 'Ambulans')}
                            </td>
                            <td className="px-6 py-4">{req.destinasi}</td>
                            <td className="px-6 py-4">
                              {req.trip_completed_at ? new Date(req.trip_completed_at).toLocaleString(isEn ? 'en-US' : 'ms-MY') : '-'}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-blue-600">{req.kenderaan?.no_kenderaan || '-'}</td>
                            <td className="px-6 py-4">
                              {req.status_semasa === 'completed' && <Badge variant="success">{isEn ? 'Completed' : 'Selesai'}</Badge>}
                              {req.status_semasa === 'rejected' && <Badge variant="error">{isEn ? 'Admin Rejected' : 'Ditolak Pentadbir'}</Badge>}
                              {req.status_semasa === 'cancelled' && <Badge variant="gray">{isEn ? 'Cancelled' : 'Dibatalkan'}</Badge>}
                              {(req.status_semasa === 'driver_rejected' || 
                                (loggedUser?.id && 
                                 JSON.parse(localStorage.getItem(`rejected_requests_${loggedUser.id}`) || '[]').includes(req.id))
                              ) && <Badge variant="error">{isEn ? 'Driver Rejected' : 'Ditolak Pemandu'}</Badge>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      )}

      {/* 1. INSPECTION MODAL (Pre-Trip / Post-Trip) */}
      {isInspModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface rounded-2xl shadow-xl border border-border-default max-w-4xl w-full mx-4 my-8 overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
            
            <div className="bg-subtle/50 border-b border-border-subtle px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {inspType === 'pre_trip' 
                    ? (isEn ? 'Vehicle Safety Inspection (Pre-Trip)' : 'Pemeriksaan Keselamatan Kenderaan (Pre-Trip)') 
                    : (isEn ? 'Vehicle Inspection Report (Post-Trip)' : 'Laporan Pemeriksaan Kenderaan (Post-Trip)')}
                </h3>
                <p className="text-xs text-slate-400">
                  {isEn ? 'Pre/Post travel inspection checklist. Photo attachments are optional.' : 'Pemeriksaan sebelum/selepas perjalanan. Bukti foto adalah pilihan.'}
                </p>
              </div>
              <Badge variant="info" className="uppercase font-mono">{selectedReq.no_rujukan}</Badge>
            </div>

            <form onSubmit={handleInspectionSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Vehicle Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  {isEn ? 'Hospital Fleet Vehicle' : 'Kenderaan Hospital'}
                </label>
                {inspType === 'pre_trip' ? (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-subtle/50 border border-border-default hover:border-border-default rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
                    required
                  >
                    <option value="">{isEn ? 'Please Select Vehicle' : 'Sila Select Vehicle'}</option>
                    {vehicles
                      .filter(v => v.jenis_kenderaan === selectedReq.jenis_permohonan)
                      .map(v => (
                        <option key={v.id} value={v.id}>
                          {v.no_kenderaan} - {v.model}
                        </option>
                      ))}
                  </select>
                ) : (
                  <Input 
                    value={selectedReq.kenderaan?.no_kenderaan || ''} 
                    disabled 
                    className="bg-subtle font-bold"
                  />
                )}
              </div>
              {/* 4 MANDATORY INSPECTION CHECKLIST ITEMS */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b pb-1">
                  {isEn ? 'Inspection Checklist & Photo Evidence' : 'Senarai Semak & Bukti Foto'}
                </h4>
                
                {/* Tyre */}
                <div className="p-4 border border-border-subtle rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-border-default transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-text-secondary">
                      {isEn ? '1. Tyres & Rims Condition' : '1. Keadaan Tayar & Rim'}
                    </span>
                    <p className="text-xs text-slate-400">
                      {isEn ? 'Adequate tyre pressure, secure rims, no tyre tread wear issues.' : 'Tekanan angin mencukupi, rim kukuh, tayar tidak botak.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={tyreStatus} 
                      onChange={(e) => setTyreStatus(e.target.value as any)}
                      className="bg-subtle/50 border border-border-default rounded-lg px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="good">{isEn ? 'Good' : 'Baik (Good)'}</option>
                      <option value="issue">{isEn ? 'Issue / Defect' : 'Rosak / Masalah (Issue)'}</option>
                    </select>
                    
                    {tyrePhoto && (tyrePhoto.startsWith('data:') || tyrePhoto.startsWith('http') || tyrePhoto.startsWith('/')) && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-default">
                        <img src={tyrePhoto} className="w-full h-full object-cover" alt="tayar" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePhotoCapture('tyre')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        tyrePhoto 
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700' 
                          : 'border-border-default hover:bg-subtle/50 text-text-secondary'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{tyrePhoto ? (isEn ? 'Captured' : 'Selesai') : (isEn ? 'Take Photo' : 'Ambil Foto')}</span>
                    </button>
                  </div>
                </div>

                {/* Gas */}
                <div className="p-4 border border-border-subtle rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-border-default transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-text-secondary">
                      {isEn ? '2. Fuel / Petrol Level' : '2. Paras Gas / Minyak Petrol'}
                    </span>
                    <p className="text-xs text-slate-400">
                      {isEn ? 'Adequate petrol/fuel level for roundtrip transit journey.' : 'Minyak petrol mencukupi untuk pergi dan balik perjalanan.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={gasStatus} 
                      onChange={(e) => setGasStatus(e.target.value as any)}
                      className="bg-subtle/50 border border-border-default rounded-lg px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="good">{isEn ? 'Good' : 'Mencukupi (Good)'}</option>
                      <option value="issue">{isEn ? 'Critical / Refuel Required' : 'Kritis / Isi Semula (Issue)'}</option>
                    </select>
                    
                    {gasPhoto && (gasPhoto.startsWith('data:') || gasPhoto.startsWith('http') || gasPhoto.startsWith('/')) && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-default">
                        <img src={gasPhoto} className="w-full h-full object-cover" alt="gas" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePhotoCapture('gas')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        gasPhoto 
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700' 
                          : 'border-border-default hover:bg-subtle/50 text-text-secondary'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{gasPhoto ? (isEn ? 'Captured' : 'Selesai') : (isEn ? 'Take Photo' : 'Ambil Foto')}</span>
                    </button>
                  </div>
                </div>

                {/* Oil */}
                <div className="p-4 border border-border-subtle rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-border-default transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-text-secondary">
                      {isEn ? '3. Engine Oil Level' : '3. Minyak Hitam / Enjin'}
                    </span>
                    <p className="text-xs text-slate-400">
                      {isEn ? 'Sufficient engine oil level, no visible engine oil leaks.' : 'Paras minyak hitam mencukupi, tiada kebocoran enjin.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={oilStatus} 
                      onChange={(e) => setOilStatus(e.target.value as any)}
                      className="bg-subtle/50 border border-border-default rounded-lg px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="good">{isEn ? 'Good' : 'Mencukupi (Good)'}</option>
                      <option value="issue">{isEn ? 'Top-Up / Service Required' : 'Perlu Tambah / Servis (Issue)'}</option>
                    </select>
                    
                    {oilPhoto && (oilPhoto.startsWith('data:') || oilPhoto.startsWith('http') || oilPhoto.startsWith('/')) && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-default">
                        <img src={oilPhoto} className="w-full h-full object-cover" alt="minyak" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePhotoCapture('oil')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        oilPhoto 
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700' 
                          : 'border-border-default hover:bg-subtle/50 text-text-secondary'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{oilPhoto ? (isEn ? 'Captured' : 'Selesai') : (isEn ? 'Take Photo' : 'Ambil Foto')}</span>
                    </button>
                  </div>
                </div>

                {/* Odometer Photo */}
                <div className="p-4 border border-border-subtle rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-border-default transition-colors">
                  <div className="space-y-1 flex-1">
                    <span className="font-bold text-sm text-text-secondary">
                      {isEn ? '4. Odometer Reading & Photo' : '4. Bacaan & Foto Odometer Kenderaan'}
                    </span>
                    <p className="text-xs text-slate-400">
                      {isEn ? 'Enter current odometer reading (km) and optional photo proof.' : 'Masukkan bacaan odometer (km) terkini (wajib) dan ambil foto sebagai bukti (pilihan).'}
                    </p>
                    {inspType === 'post_trip' && preTripOdo !== null && (
                      <div className="mt-2 text-xs font-semibold text-text-muted bg-subtle px-2 py-1 rounded w-fit">
                        {isEn ? 'Start Odometer:' : 'Odometer Mula:'} <span className="font-bold font-mono text-text-primary">{preTripOdo.toLocaleString(isEn ? 'en-US' : 'ms-MY')} km</span>
                      </div>
                    )}
                    <div className="mt-3 max-w-xs">
                      <Input
                        type="number"
                        placeholder={isEn ? 'Enter odometer reading (km)' : 'Masukkan bacaan odometer (km)'}
                        value={odoReading}
                        onChange={(e) => setOdoReading(e.target.value)}
                        required
                        className="bg-subtle/50 border border-border-default"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {odoPhoto && (odoPhoto.startsWith('data:') || odoPhoto.startsWith('http') || odoPhoto.startsWith('/')) && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-default">
                        <img src={odoPhoto} className="w-full h-full object-cover" alt="odometer" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePhotoCapture('odo')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        odoPhoto 
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700' 
                          : 'border-border-default hover:bg-subtle/50 text-text-secondary'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{odoPhoto ? (isEn ? 'Captured' : 'Selesai') : (isEn ? 'Take Photo' : 'Ambil Foto')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* pre-trip decision toggle */}
              {inspType === 'pre_trip' && (
                <div className="space-y-4 pt-4 border-t border-border-subtle">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    {isEn ? 'Driver Inspection Decision' : 'Keputusan Pemeriksaan Pemandu'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDecision('cleared')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        decision === 'cleared'
                          ? 'border-emerald-600 bg-emerald-500/10 text-emerald-400'
                          : 'border-border-default text-text-muted hover:border-border-default'
                      }`}
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <span className="font-bold text-sm">{isEn ? 'Good to Go (Clear)' : 'Selamat Jalan (Good to Go)'}</span>
                      <span className="text-xxs text-slate-400">{isEn ? 'I accept this dispatch task' : 'Saya sedia menerima tugasan ini'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('rejected')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        decision === 'rejected'
                          ? 'border-rose-600 bg-rose-500/10 text-rose-400'
                          : 'border-border-default text-text-muted hover:border-border-default'
                      }`}
                    >
                      <AlertTriangle className="w-6 h-6 text-rose-600" />
                      <span className="font-bold text-sm">{isEn ? 'Decline Task (Vehicle Defect)' : 'Tolak Tugasan (Kerosakan)'}</span>
                      <span className="text-xxs text-slate-400">{isEn ? 'Vehicle unsafe for deployment' : 'Kenderaan tidak selamat digunakan'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Remarks explanation (Mandatory if rejected) */}
              {(decision === 'rejected' || tyreStatus === 'issue' || gasStatus === 'issue' || oilStatus === 'issue') && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    {isEn ? 'Defect & Issue Remarks (Mandatory)' : 'Catatan Kerosakan & Isu (Mandatori)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isEn ? 'Please detail the vehicle defect/issue for workshop reference...' : 'Sila jelaskan kerosakan/isu kenderaan secara terperinci untuk rujukan penyelenggaraan...'}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-subtle/50 border border-rose-500/20 hover:border-rose-300 rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-rose-500 focus:bg-surface transition-colors font-medium shadow-xs"
                    required
                  />
                </div>
              )}

            </form>

            <div className="bg-subtle/50 border-t border-border-subtle px-6 py-4 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsInspModalOpen(false)}
                className="border-border-default text-text-secondary cursor-pointer"
              >
                {isEn ? 'Close' : 'Tutup'}
              </Button>
              <Button 
                onClick={handleInspectionSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {isEn ? 'Submit Inspection Report' : 'Hantar Laporan Semakan'}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 3. TRIP CANCELLATION MODAL */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl shadow-xl border border-border-default p-6 max-w-md w-full mx-4 space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              {isEn ? 'Cancel Transport Trip' : 'Batalkan Trip Pengangkutan'}
            </h3>
            
            <p className="text-xs text-text-muted">
              {isEn 
                ? 'Please state why this transport trip is being cancelled. This will release the assigned vehicle.'
                : 'Sila nyatakan sebab pembatalan trip perjalanan ini. Tindakan ini akan membatalkan tempahan kenderaan ini.'}
            </p>

            <textarea 
              rows={3}
              placeholder={isEn ? 'State cancellation reason (e.g. Meeting cancelled, vehicle breakdown)...' : 'Sila nyatakan sebab pembatalan (contoh: Mesyuarat ditangguhkan, kereta rosak, dll)...'}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-subtle/50 border border-border-default rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-red-500 focus:bg-surface transition-colors font-medium shadow-xs"
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCancelOpen(false)}
                className="border-border-default text-text-secondary cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </Button>
              <Button 
                onClick={handleCancelTripSubmit}
                className="bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                {isEn ? 'Confirm Cancel Trip' : 'Sahkan Batal Trip'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DIRECT REJECT REASON MODAL (No inspection) */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl shadow-xl border border-border-default p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              {isEn ? 'Decline Transport Assignment' : 'Tolak Tugasan Pengangkutan'}
            </h3>
            
            <p className="text-xs text-text-muted">
              {isEn 
                ? 'Please state why you are declining this assignment. The request will return to the pool for another driver.'
                : 'Sila nyatakan sebab penolakan tugasan ini. Tugasan akan dikembalikan ke senarai utama untuk pemandu lain bertugas.'}
            </p>

            <textarea 
              rows={3}
              placeholder={isEn ? 'E.g., Engaged with another urgent trip / out of coverage...' : 'Contoh: Terlibat dengan permohonan lain / luar kawasan...'}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-subtle/50 border border-border-default rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-rose-500 focus:bg-surface transition-colors font-medium shadow-xs"
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsRejectOpen(false)}
                className="border-border-default text-text-secondary cursor-pointer"
              >
                {isEn ? 'Back' : 'Batal'}
              </Button>
              <Button 
                onClick={handleDirectRejectSubmit}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {isEn ? 'Decline & Release Task' : 'Tolak & Pulang Tugasan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRIP DETAILS SLIDEOVER */}
      <SlideOver
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={isEn ? `Trip Information: ${selectedReq?.no_rujukan}` : `Maklumat Perjalanan: ${selectedReq?.no_rujukan}`}
        description={isEn ? 'Review clearance status, pre-trip inspection, and movement logs' : 'Semak status kelulusan, pre-trip inspection, dan log pergerakan'}
      >
        {selectedReq && (
          <div className="p-6 space-y-6">
            
            {/* Overview Section */}
            <div className="bg-subtle/50 border border-border-default p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary font-bold uppercase tracking-wider">
                  {isEn ? 'Current Status' : 'Status Semasa'}
                </span>
                {getStatusBadge(selectedReq.status_semasa)}
              </div>
              <div className="text-sm">
                <div className="font-bold text-text-primary">{selectedReq.destinasi}</div>
                <div className="text-xs text-text-muted mt-0.5">{selectedReq.tujuan_permohonan}</div>
              </div>
            </div>

            {/* Basic Info Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b pb-1">
                {isEn ? 'Trip Details' : 'Maklumat Perjalanan'}
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <span className="block text-xs font-bold text-slate-400">
                    {isEn ? 'Service Type' : 'Jenis Perkhidmatan'}
                  </span>
                  <span className="font-semibold text-text-primary capitalize">
                    {selectedReq.jenis_permohonan === 'sg' 
                      ? (isEn ? 'Official Car (SG)' : 'Kereta Jabatan (SG)') 
                      : selectedReq.jenis_permohonan === 'van_jenazah' 
                      ? (isEn ? 'Hearse Van' : 'Van Jenazah') 
                      : (isEn ? 'Ambulance' : 'Ambulans')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400">
                    {isEn ? 'Requesting Unit' : 'Unit Pemohon'}
                  </span>
                  <span className="font-semibold text-text-primary">{selectedReq.unit_pemohon}</span>
                </div>
                {selectedReq.nama_pemohon && (
                  <div>
                    <span className="block text-xs font-bold text-slate-400">
                      {isEn ? 'Applicant Name' : 'Nama Pemohon'}
                    </span>
                    <span className="font-semibold text-text-primary">{selectedReq.nama_pemohon}</span>
                  </div>
                )}
                 <div>
                  <span className="block text-xs font-bold text-slate-400">
                    {isEn ? 'Date & Time' : 'Tarikh & Masa'}
                  </span>
                  <span className="font-bold text-text-primary">
                    {new Date(selectedReq.tarikh_masa_diperlukan).toLocaleString(isEn ? 'en-US' : 'ms-MY')}
                    {selectedReq.tarikh_masa_sehingga && (
                      <>
                        <span className="text-slate-400 font-normal"> {isEn ? 'until' : 'hingga'} </span>
                        {new Date(selectedReq.tarikh_masa_sehingga).toLocaleString(isEn ? 'en-US' : 'ms-MY')}
                      </>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400">
                    {isEn ? 'Escort Personnel' : 'Kakitangan Pengiring'}
                  </span>
                  <span className="font-semibold text-text-primary capitalize">
                    {selectedReq.pengiring_list && selectedReq.pengiring_list.length > 0 ? (
                      <span className="block space-y-0.5 mt-1">
                        {selectedReq.pengiring_list.map((escort, idx) => (
                          <span key={idx} className="block text-xs font-medium normal-case">
                            • <span className="capitalize text-text-muted">{escort.job.replace(/_/g, ' ')}</span>: {escort.name}
                          </span>
                        ))}
                      </span>
                    ) : (
                      selectedReq.pengiring ? selectedReq.pengiring.replace(/_/g, ' ') : (isEn ? 'None' : 'Tiada')
                    )}
                  </span>
                </div>
                {selectedReq.jenis_permohonan === 'sg' && (
                  <>
                    <div>
                      <span className="block text-xs font-bold text-slate-400">
                        {isEn ? 'Service Requirement' : 'Keperluan Perkhidmatan'}
                      </span>
                      <span className="font-semibold text-text-primary">
                        {selectedReq.pemandu_diperlukan 
                          ? (isEn ? 'Vehicle & Driver' : 'Pemandu & Kereta') 
                          : (isEn ? 'Vehicle Only (Self-Drive)' : 'Kereta Sahaja (Tanpa Pemandu)')}
                      </span>
                    </div>
                    {selectedReq.senarai_penumpang && selectedReq.senarai_penumpang.length > 0 && (
                      <div className="col-span-2 mt-2 pt-2 border-t border-border-subtle">
                        <span className="block text-xs font-bold text-slate-400">
                          {isEn ? 'Passenger Roster (Staff/Accompanying)' : 'Senarai Penumpang (Staf/Pengikut)'}
                        </span>
                        <div className="text-xs font-medium text-text-primary space-y-0.5 mt-1">
                          {selectedReq.senarai_penumpang.map((passenger, idx) => (
                            <div key={idx}>• {passenger.name}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {selectedReq.medical_officer_referring && (
                  <div className="col-span-2 mt-2 pt-2 border-t border-border-subtle">
                    <span className="block text-xs font-bold text-slate-400">
                      {isEn ? 'Referring Medical Officer' : 'Pegawai Perubatan Merujuk (Referring MO)'}
                    </span>
                    <span className="font-semibold text-text-primary text-xs">
                      Dr. {selectedReq.medical_officer_referring.name} | {isEn ? 'Department' : 'Jabatan'}: {selectedReq.medical_officer_referring.department}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Patient details (Conditional) */}
            {(selectedReq.jenis_permohonan === 'ambulance' || selectedReq.bawa_pesakit) && (
              <div className="space-y-3 pt-4 border-t border-border-subtle">
                <h4 className="text-xs font-bold uppercase tracking-wider border-b pb-1 text-rose-700">
                  {isEn ? 'Patient Clinical Details' : 'Maklumat Pesakit'}
                </h4>
                <div className="grid grid-cols-2 gap-y-3 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-100">
                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-rose-400/60">
                      {isEn ? 'Full Name' : 'Nama Penuh'}
                    </span>
                    <span className="font-bold text-text-primary">{selectedReq.nama_pesakit || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-rose-400/60">
                      {isEn ? 'Patient RN' : 'No RN Pesakit'}
                    </span>
                    <span className="font-semibold font-mono text-text-primary">{selectedReq.rn_pesakit || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-rose-400/60">
                      {isEn ? 'Gender' : 'Jantina'}
                    </span>
                    <span className="font-semibold text-text-primary">{selectedReq.jantina_pesakit || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-rose-400/60">
                      {isEn ? 'Clinical Diagnosis' : 'Diagnosis Pesakit'}
                    </span>
                    <span className="font-semibold text-text-primary">{selectedReq.diagnosis_pesakit || '-'}</span>
                  </div>
                  {selectedReq.patient_mobility && (
                    <div className={`col-span-2 p-2.5 rounded-lg text-xs font-bold flex flex-col gap-1 border ${
                      selectedReq.patient_mobility === 'stretcher'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 dark:text-amber-300 font-bold'
                        : 'bg-subtle/50 border-border-default text-text-primary'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Info className={`w-3.5 h-3.5 ${selectedReq.patient_mobility === 'stretcher' ? 'text-amber-600' : 'text-text-muted'}`} />
                        <span>
                          {isEn ? 'Patient Mobility:' : 'Mobiliti Pesakit:'}{' '}
                          <span className="capitalize">
                            {selectedReq.patient_mobility === 'stretcher' 
                              ? (isEn ? 'Stretcher' : 'Stretcher / Usungan') 
                              : selectedReq.patient_mobility}
                          </span>
                        </span>
                      </div>
                      {selectedReq.patient_mobility === 'stretcher' && (
                        <p className="text-[10px] text-amber-400 font-medium leading-normal mt-0.5 pl-5">
                          {isEn ? '⚠️ Driver MANDATED to assist ward transfer with stretcher.' : '⚠️ Pemandu WAJIB naik ke wad untuk mengambil pesakit.'}
                        </p>
                      )}
                    </div>
                  )}
                  {selectedReq.oksigen_diperlukan && (
                    <div className="col-span-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-bold text-rose-400 dark:text-rose-300 font-bold flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isEn ? 'Continuous Oxygen Support Required' : 'Sokongan Oksigen Berterusan Diperlukan'}</span>
                      </div>
                      {selectedReq.jenis_oksigen && (
                        <div className="text-xxs text-rose-400 font-medium pl-5">
                          {isEn ? 'Oxygen Device:' : 'Alat Oksigen:'} <span className="text-rose-400 dark:text-rose-300 font-bold font-semibold">{selectedReq.jenis_oksigen}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedReq.mesin_diperlukan && selectedReq.mesin_diperlukan.length > 0 && (
                    <div className="col-span-2 pt-2">
                      <span className="block text-xs font-bold text-rose-400/60">
                        {isEn ? 'Medical Devices / Machines Required' : 'Peralatan / Mesin Diperlukan'}
                      </span>
                      <span className="text-xs font-semibold text-text-primary">
                        {selectedReq.mesin_diperlukan.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle & Driver Details */}
            {selectedReq.kenderaan && (
              <div className="space-y-3 pt-4 border-t border-border-subtle">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b pb-1">
                  {isEn ? 'Assigned Vehicle & Duty Driver' : 'Kenderaan & On-Duty Driver'}
                </h4>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div>
                    <span className="block text-xs font-bold text-slate-400">
                      {isEn ? 'Driver Name' : 'Pemandu'}
                    </span>
                    <span className="font-bold text-text-primary">{selectedReq.pemandu?.full_name || 'Ali bin Ahmad'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400">
                      {isEn ? 'Vehicle Plate No.' : 'No. Pendaftaran Kenderaan'}
                    </span>
                    <span className="font-bold text-blue-600 font-mono">{selectedReq.kenderaan.no_kenderaan}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-slate-400">
                      {isEn ? 'Vehicle Model' : 'Model Kenderaan'}
                    </span>
                    <span className="font-semibold text-text-primary">{selectedReq.kenderaan.model}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection / Cancellation note */}
            {selectedReq.sebab_tolak && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 dark:text-rose-300 font-bold rounded-xl space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  {isEn ? 'Rejection / Cancellation Remarks' : 'Catatan Sebab Penolakan / Pembatalan'}
                </h4>
                <p className="text-sm font-semibold italic">"{selectedReq.sebab_tolak}"</p>
              </div>
            )}

            {/* Audit Logs Trail */}
            <div className="space-y-3 pt-4 border-t border-border-subtle">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b pb-1">
                {isEn ? 'Approval Audit Trail' : 'Jejak Audit Kelulusan'}
              </h4>
              {loadingLogs ? (
                <div className="text-xs text-text-muted">
                  {isEn ? 'Loading audit trail...' : 'Memuatkan log audit...'}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-xs text-slate-400">
                  {isEn ? 'No logs recorded.' : 'Tiada log direkodkan.'}
                </div>
              ) : (
                <div className="relative border-l border-border-default pl-4 space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="relative text-xs">
                      {/* Circle indicator */}
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-slate-300 rounded-full border border-white" />
                      <div className="flex justify-between items-center font-bold text-text-primary">
                        <span>{log.tindakan}</span>
                        <span className="text-slate-400 font-medium">
                          {new Date(log.created_at).toLocaleString(isEn ? 'en-US' : 'ms-MY', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <div className="text-text-muted mt-0.5">{log.catatan}</div>
                      <div className="text-slate-400 mt-0.5">
                        {isEn ? 'By:' : 'Oleh:'} {log.performer?.full_name || (isEn ? 'Staff' : 'Kakitangan')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOver>

    </div>
  )
}

export default TransporterDriverPanelPage
