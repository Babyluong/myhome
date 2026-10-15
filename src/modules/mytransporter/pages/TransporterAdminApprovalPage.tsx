// src/modules/mytransporter/pages/TransporterAdminApprovalPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, FileText, AlertTriangle, MapPin, User, Shield, Info, CheckCircle2 } from 'lucide-react'
import '../components/AmbulanceIcon'
import { CrossborderDetailsPanel } from '../components/CrossborderDetailsPanel'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { 
  getRequests, 
  adminApproveRequest, 
  adminRejectRequest, 
  getInspections 
} from '../services/transporterService'
import type { TransportRequest, VehicleInspection } from '@/shared/types/mytransporter'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge, 
  SlideOver 
} from '@/components/ui'

const TransporterAdminApprovalPage: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const { language } = useLanguage()
  const isEn = language !== 'ms'
  const toast = useToast()

  const [requests, setRequests] = useState<TransportRequest[]>([])
  const [inspections, setInspections] = useState<VehicleInspection[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')

  // Details panel states
  const [selectedReq, setSelectedReq] = useState<TransportRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspection | null>(null)

  // Rejection modal
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const reqRes = await getRequests()
      if (reqRes.data) setRequests(reqRes.data)
      
      const inspRes = await getInspections()
      if (inspRes.data) setInspections(inspRes.data)
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
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const adminId = loggedUser?.id || ''
      const hospitalId = loggedUser?.hospital_id || 'hosp-1'
      const res = await adminApproveRequest(id, adminId, hospitalId)
      if (res.error) throw new Error(res.error)
      
      toast.success(
        isEn ? 'Requisition Approved' : 'Request Approved', 
        isEn ? 'Transport request successfully authorized.' : 'Transport requisition successfully approved.'
      )
      fetchData()
      setIsDetailOpen(false)
    } catch (err: any) {
      toast.error(
        isEn ? 'Approval Failed' : 'Gagal Meluluskan', 
        err.message || (isEn ? 'Please try again.' : 'Sila cuba lagi.')
      )
    }
  }

  const handleOpenReject = (id: string) => {
    setRejectingReqId(id)
    setRejectReason('')
    setIsRejectOpen(true)
  }

  const handleRejectSubmit = async () => {
    if (!rejectingReqId || !rejectReason) {
      toast.error(
        isEn ? 'Reason Required' : 'Reason Required', 
        isEn ? 'Please state the reason for requisition rejection.' : 'Please state the reason for rejecting the requisition.'
      )
      return
    }

    try {
      const adminId = loggedUser?.id || ''
      const hospitalId = loggedUser?.hospital_id || 'hosp-1'
      const res = await adminRejectRequest(rejectingReqId, adminId, rejectReason, hospitalId)
      if (res.error) throw new Error(res.error)

      toast.success(
        isEn ? 'Requisition Rejected' : 'Permohonan Ditolak', 
        isEn ? 'Transport requisition rejected and applicant notified.' : 'Permohonan pengangkutan ditolak dan dimaklumkan kepada pemohon.'
      )
      setIsRejectOpen(false)
      fetchData()
      setIsDetailOpen(false)
    } catch (err: any) {
      toast.error(
        isEn ? 'Rejection Failed' : 'Gagal Menolak', 
        err.message || (isEn ? 'Please try again.' : 'Sila cuba lagi.')
      )
    }
  }

  const handleOpenDetails = (req: TransportRequest) => {
    setSelectedReq(req)
    // Find matching pre-trip inspection
    const preInsp = inspections.find(i => i.request_id === req.id && i.jenis_pemeriksaan === 'pre_trip')
    setSelectedInspection(preInsp || null)
    setIsDetailOpen(true)
  }

  // Filter requests waiting for admin approval (status is driver_accepted)
  const pendingApprovals = requests.filter(r => r.status_semasa === 'driver_accepted')
  
  // Historical processed requests (approved, rejected, cancelled, completed)
  const processedRequests = requests.filter(r => 
    r.status_semasa !== 'driver_accepted' && r.status_semasa !== 'draft' && r.status_semasa !== 'submitted'
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">{isEn ? 'Approved' : 'Diluluskan'}</Badge>
      case 'rejected':
        return <Badge variant="error">{isEn ? 'Rejected by Admin' : 'Ditolak Pentadbir'}</Badge>
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
    <div className="p-6 md:p-8 w-full space-y-6">
      
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
        <h1 className="text-2xl font-black text-text-primary tracking-tight">
          {isEn ? 'Administrator Approval Queue' : 'Senarai Kelulusan Pentadbir'}
        </h1>
        <p className="text-text-muted text-sm">
          {isEn 
            ? 'Review travel itinerary, clinical diagnosis, and driver pre-trip safety inspections before issuing final vehicle dispatch approval.' 
            : 'Semak butiran perjalanan, diagnosis pesakit, dan laporan pemeriksaan pre-trip pemandu sebelum meluluskan pelepasan kenderaan.'}
        </p>
      </div>

      {/* Tab controls */}
      <div className="flex border-b border-border-default gap-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'pending' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          {isEn 
            ? `Pending Approval Queue (${pendingApprovals.length})` 
            : `Queue Permohonan Menunggu Kelulusan (${pendingApprovals.length})`}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          {isEn 
            ? `Historical Approvals Log (${processedRequests.length})` 
            : `Tindakan Kelulusan Lampau (${processedRequests.length})`}
        </button>
      </div>

      {/* Main Content Area (Full Width) */}
      <div className="w-full">
        {activeTab === 'pending' ? (
          <Card className="border border-border-default shadow-sm overflow-hidden w-full">
            <CardHeader className="bg-subtle/50 border-b border-border-subtle py-4">
              <CardTitle className="text-md font-bold text-text-primary flex items-center justify-between">
                <span>{isEn ? 'Pending Action Queue' : 'Senarai Menunggu Tindakan'}</span>
                <span className="bg-amber-100 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingApprovals.length} {isEn ? 'Pending' : 'Tertunda'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-text-muted animate-pulse">
                  {isEn ? 'Loading pending requisitions...' : 'Memuatkan permohonan...'}
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="p-12 text-center text-text-muted">
                  {isEn ? 'No requisitions currently awaiting approval.' : 'Tiada permohonan menunggu kelulusan ketika ini.'}
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-default text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider bg-subtle/50">
                        <th className="p-4 pl-6">{isEn ? 'Ref No & Category' : 'No. Rujukan & Jenis'}</th>
                        <th className="p-4">{isEn ? 'Destination & Purpose' : 'Destinasi & Tujuan'}</th>
                        <th className="p-4">{isEn ? 'Driver & Patient' : 'Pemandu & Pesakit'}</th>
                        <th className="p-4">{isEn ? 'Date & Time' : 'Tarikh & Masa'}</th>
                        <th className="p-4 pr-6 text-right">{isEn ? 'Action' : 'Tindakan'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-sm">
                      {pendingApprovals.map((req) => (
                        <tr 
                          key={req.id} 
                          onClick={() => handleOpenDetails(req)}
                          className="hover:bg-subtle/50 transition-colors cursor-pointer group"
                        >
                          <td className="p-4 pl-6">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                {req.no_rujukan}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {req.jenis_permohonan === 'ambulance' ? (
                                  <Badge variant="error" className="text-[10px] py-0 px-1.5">{isEn ? 'Ambulance' : 'Ambulans'}</Badge>
                                ) : req.jenis_permohonan === 'van_jenazah' ? (
                                  <Badge variant="gray" className="text-[10px] py-0 px-1.5">{isEn ? 'Hearse Van' : 'Van Jenazah'}</Badge>
                                ) : (
                                  <Badge variant="info" className="text-[10px] py-0 px-1.5">{isEn ? 'SG (Official Vehicle)' : 'SG (Kereta Jabatan)'}</Badge>
                                )}
                                {req.kenderaan?.no_kenderaan && (
                                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                                    {req.kenderaan.no_kenderaan}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col max-w-xs md:max-w-sm">
                              <div className="font-bold text-text-primary flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span className="truncate">{req.destinasi}</span>
                                {req.is_crossborder && (
                                  <span className="bg-blue-500/10 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-0.5 ml-1">
                                    🌐 {isEn ? 'Cross-Border' : 'Sempadan'}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-text-muted truncate mt-0.5">
                                {req.tujuan_permohonan}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="font-semibold text-slate-650">
                                {isEn ? 'Driver' : 'Pemandu'}: {req.pemandu?.full_name || (isEn ? 'Assigned Driver' : 'Pemandu')}
                              </span>
                              {req.jenis_permohonan === 'van_jenazah' ? (
                                <span className="text-text-muted font-medium">{isEn ? 'Deceased' : 'Jenazah'}: {req.nama_pesakit}</span>
                              ) : (req.jenis_permohonan === 'ambulance' || req.bawa_pesakit) ? (
                                <span className="text-rose-700 font-semibold">{isEn ? 'Patient' : 'Pesakit'}: {req.nama_pesakit}</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-text-secondary text-xs font-mono">
                              {new Date(req.tarikh_masa_diperlukan).toLocaleString(isEn ? 'en-US' : 'ms-MY')}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                onClick={() => handleApprove(req.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 mr-1 inline" />
                                {isEn ? 'Approve' : 'Lulus'}
                              </Button>
                              
                              <Button 
                                onClick={() => handleOpenReject(req.id)}
                                className="bg-rose-500/10 text-rose-700 hover:bg-rose-100 text-xs border border-rose-100 font-bold h-8 px-3 cursor-pointer"
                                variant="ghost"
                              >
                                <X className="w-3.5 h-3.5 mr-1 inline" />
                                {isEn ? 'Reject' : 'Tolak'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border-default shadow-sm overflow-hidden w-full">
            <CardHeader className="bg-subtle/50 border-b border-border-subtle py-4">
              <CardTitle className="text-md font-bold text-text-primary">
                {isEn ? 'Historical Approval Actions Log' : 'Rekod Tindakan Kelulusan Lampau'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-text-muted animate-pulse">
                  {isEn ? 'Loading historical log...' : 'Memuatkan rekod tindakan lampau...'}
                </div>
              ) : processedRequests.length === 0 ? (
                <div className="p-12 text-center text-text-muted">
                  {isEn ? 'No historical records found.' : 'Tiada rekod tindakan lampau.'}
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-default text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider bg-subtle/50">
                        <th className="p-4 pl-6">{isEn ? 'Ref No & Category' : 'No. Rujukan & Jenis'}</th>
                        <th className="p-4">{isEn ? 'Destination & Purpose' : 'Destinasi & Tujuan'}</th>
                        <th className="p-4">{isEn ? 'Driver & Patient' : 'Pemandu & Pesakit'}</th>
                        <th className="p-4">{isEn ? 'Date & Time' : 'Tarikh & Masa'}</th>
                        <th className="p-4 pr-6 text-right">{isEn ? 'Status' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-sm">
                      {processedRequests.map((req) => (
                        <tr 
                          key={req.id} 
                          onClick={() => handleOpenDetails(req)}
                          className="hover:bg-subtle/50 transition-colors cursor-pointer group"
                        >
                          <td className="p-4 pl-6">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono font-bold text-xs text-text-muted group-hover:text-text-secondary transition-colors">
                                {req.no_rujukan}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {req.jenis_permohonan === 'ambulance' ? (
                                  <Badge variant="error" className="text-[10px] py-0 px-1.5">{isEn ? 'Ambulance' : 'Ambulans'}</Badge>
                                ) : req.jenis_permohonan === 'van_jenazah' ? (
                                  <Badge variant="gray" className="text-[10px] py-0 px-1.5">{isEn ? 'Hearse Van' : 'Van Jenazah'}</Badge>
                                ) : (
                                  <Badge variant="info" className="text-[10px] py-0 px-1.5">{isEn ? 'SG (Official Vehicle)' : 'SG (Kereta Jabatan)'}</Badge>
                                )}
                                {req.kenderaan?.no_kenderaan && (
                                  <span className="text-[10px] font-mono font-bold text-text-muted bg-subtle px-1.5 py-0.2 rounded border border-border-default">
                                    {req.kenderaan.no_kenderaan}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col max-w-xs md:max-w-sm">
                              <div className="font-bold text-text-primary flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span className="truncate">{req.destinasi}</span>
                                {req.is_crossborder && (
                                  <span className="bg-blue-500/10 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-0.5 ml-1">
                                    🌐 {isEn ? 'Cross-Border' : 'Sempadan'}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-text-muted truncate mt-0.5">
                                {req.tujuan_permohonan}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="font-semibold text-slate-650">
                                {isEn ? 'Driver' : 'Pemandu'}: {req.pemandu?.full_name || '-'}
                              </span>
                              {req.jenis_permohonan === 'van_jenazah' ? (
                                <span className="text-text-muted font-medium">{isEn ? 'Deceased' : 'Jenazah'}: {req.nama_pesakit}</span>
                              ) : (req.jenis_permohonan === 'ambulance' || req.bawa_pesakit) ? (
                                <span className="text-rose-700 font-semibold">{isEn ? 'Patient' : 'Pesakit'}: {req.nama_pesakit}</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-text-secondary text-xs font-mono">
                              {new Date(req.tarikh_masa_diperlukan).toLocaleString(isEn ? 'en-US' : 'ms-MY')}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            {getStatusBadge(req.status_semasa)}
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

      {/* 1. Request Detail & Driver Inspection Review Drawer */}
      <SlideOver
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={isEn ? `Approval Review: ${selectedReq?.no_rujukan}` : `Semakan Kelulusan: ${selectedReq?.no_rujukan}`}
        description={isEn ? 'Review trip details and driver pre-trip vehicle safety inspection report.' : 'Semak permohonan trip berserta laporan pre-trip pemandu bertugas.'}
        size="3xl"
      >
        {selectedReq && (
          <div className="p-6 space-y-6">
            
             {/* Trip Summary Card */}
             <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border border-border-default p-5 rounded-2xl shadow-sm">
               <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-md mb-2 inline-block">
                 {isEn ? 'Journey Destination' : 'Destinasi Perjalanan'}
               </span>
               <h3 className="text-base font-black text-text-primary tracking-tight flex items-center gap-1.5 mt-1">
                 <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                 {selectedReq.destinasi}
               </h3>
               <p className="text-xs text-text-muted leading-relaxed mt-2 pl-5.5 border-l border-border-default italic">{selectedReq.tujuan_permohonan}</p>
             </div>

             {/* Trip details grid */}
             <div className="space-y-4">
               <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                 <FileText className="w-4 h-4 text-text-muted" />
                 <h4 className="text-xs font-black text-text-muted uppercase tracking-wider">
                   {isEn ? 'Transport Requisition Details' : 'Maklumat Trip Pengangkutan'}
                 </h4>
               </div>
               <div className="bg-surface border border-slate-150 rounded-2xl p-5 shadow-xs grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                 <div>
                   <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                     {isEn ? 'Transport Category' : 'Jenis Perkhidmatan'}
                   </span>
                   <span className="font-bold text-text-primary capitalize flex items-center gap-1.5">
                     {selectedReq.jenis_permohonan === 'ambulance' ? (
                       <Badge variant="error" className="py-0.5 px-2">{isEn ? 'Ambulance' : 'Ambulans'}</Badge>
                     ) : selectedReq.jenis_permohonan === 'van_jenazah' ? (
                       <Badge variant="gray" className="py-0.5 px-2">{isEn ? 'Hearse Van' : 'Van Jenazah'}</Badge>
                     ) : (
                       <Badge variant="info" className="py-0.5 px-2">{isEn ? 'Official Vehicle (SG)' : 'Kereta Jabatan (SG)'}</Badge>
                     )}
                   </span>
                 </div>
                 <div>
                   <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                     {isEn ? 'Applicant Unit / Ward' : 'Unit Pemohon'}
                   </span>
                   <span className="font-semibold text-text-primary">{selectedReq.unit_pemohon}</span>
                 </div>
                 {selectedReq.nama_pemohon && (
                   <div>
                     <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                       {isEn ? 'Applicant Name' : 'Nama Pemohon'}
                     </span>
                     <span className="font-semibold text-text-primary">{selectedReq.nama_pemohon}</span>
                   </div>
                 )}
                 <div>
                   <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                     {isEn ? 'Required Departure Time' : 'Tarikh & Masa Bertolak'}
                   </span>
                   <span className="font-bold text-slate-850 font-mono">
                     {new Date(selectedReq.tarikh_masa_diperlukan).toLocaleString(isEn ? 'en-US' : 'ms-MY')}
                     {selectedReq.tarikh_masa_sehingga && (
                       <>
                         <span className="text-slate-400 font-normal font-sans text-xs"> {isEn ? 'to' : 'hingga'} </span>
                         {new Date(selectedReq.tarikh_masa_sehingga).toLocaleString(isEn ? 'en-US' : 'ms-MY')}
                       </>
                     )}
                   </span>
                 </div>
                 {selectedReq.jenis_permohonan === 'sg' && (
                   <>
                     <div>
                       <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                         {isEn ? 'Service Requirement' : 'Keperluan Perkhidmatan'}
                       </span>
                       <span className="font-semibold text-text-primary text-sm">
                         {selectedReq.pemandu_diperlukan 
                           ? (isEn ? 'Driver & Vehicle' : 'Pemandu & Kereta') 
                           : (isEn ? 'Vehicle Only (Self-Drive)' : 'Kereta Sahaja (Tanpa Pemandu)')}
                       </span>
                     </div>
                     {selectedReq.senarai_penumpang && selectedReq.senarai_penumpang.length > 0 && (
                       <div className="col-span-2 border-t border-border-subtle pt-3">
                         <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-1">
                           {isEn ? 'Passenger Roster (Staff/Accompanying)' : 'Senarai Penumpang (Staf/Pengikut)'}
                         </span>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                           {selectedReq.senarai_penumpang.map((passenger, idx) => (
                             <div key={idx} className="flex items-center gap-2 p-2 bg-subtle/50 border border-slate-150 rounded-lg text-xs">
                               <User className="w-3.5 h-3.5 text-slate-400" />
                               <span className="font-medium text-text-secondary">{passenger.name}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </>
                 )}
                 <div className="col-span-2 border-t border-border-subtle pt-3">
                   <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-1">
                     {isEn ? 'Escort Personnel' : 'Kakitangan Pengiring'}
                   </span>
                   <div className="font-semibold text-slate-850">
                     {selectedReq.pengiring_list && selectedReq.pengiring_list.length > 0 ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                         {selectedReq.pengiring_list.map((escort, idx) => (
                           <div key={idx} className="flex items-center gap-2 p-2 bg-subtle/50 border border-slate-150 rounded-lg text-xs">
                             <User className="w-3.5 h-3.5 text-slate-400" />
                             <span>
                               <span className="capitalize font-bold text-text-muted">{escort.job.replace(/_/g, ' ')}</span>: {escort.name}
                             </span>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <span className="text-text-muted text-xs italic">
                         {selectedReq.pengiring ? selectedReq.pengiring.replace(/_/g, ' ') : (isEn ? 'No Escort Staff' : 'Tiada Pengiring')}
                       </span>
                     )}
                   </div>
                 </div>
                 {selectedReq.medical_officer_referring && (
                   <div className="col-span-2 pt-3 border-t border-border-subtle">
                     <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-1">
                       {isEn ? 'Referring Medical Officer (MO)' : 'Pegawai Perubatan Merujuk (Referring MO)'}
                     </span>
                     <span className="font-semibold text-slate-850 text-xs flex items-center gap-1.5 p-2.5 bg-subtle/50 border border-border-subtle rounded-lg">
                       <span className="font-bold text-text-primary">Dr. {selectedReq.medical_officer_referring.name}</span>
                       <span className="text-slate-300">|</span>
                       <span className="text-text-muted">{isEn ? 'Department' : 'Jabatan'}: {selectedReq.medical_officer_referring.department}</span>
                     </span>
                   </div>
                 )}
               </div>
             </div>

             {/* Patient details (Ambulance or SG bringing patient) */}
             {(selectedReq.jenis_permohonan === 'ambulance' || selectedReq.jenis_permohonan === 'van_jenazah' || selectedReq.bawa_pesakit) && (
               <div className="space-y-4 pt-4 border-t border-border-subtle">
                 {selectedReq.is_crossborder ? (
                   <>
                     <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                       <User className="w-4 h-4 text-blue-600" />
                       <h4 className="text-xs font-black uppercase tracking-wider text-blue-700">
                         {isEn ? 'Cross-Border Clearance Details' : 'Butiran Rentasi Sempadan'}
                       </h4>
                     </div>
                     <CrossborderDetailsPanel data={selectedReq.crossborder_data} />
                   </>
                 ) : (
                   <>
                     <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                       <User className={`w-4 h-4 ${selectedReq.jenis_permohonan === 'van_jenazah' ? 'text-slate-650' : 'text-rose-650'}`} />
                       <h4 className={`text-xs font-black uppercase tracking-wider ${
                         selectedReq.jenis_permohonan === 'van_jenazah' ? 'text-text-secondary' : 'text-rose-700'
                       }`}>
                         {selectedReq.jenis_permohonan === 'van_jenazah' 
                           ? (isEn ? 'Deceased Details' : 'Butiran Jenazah') 
                           : (isEn ? 'Patient Clinical Details' : 'Butiran Pesakit')}
                       </h4>
                     </div>
                     <div className={`grid grid-cols-2 gap-x-6 gap-y-4 text-sm p-5 rounded-2xl border shadow-xs bg-surface ${
                       selectedReq.jenis_permohonan === 'van_jenazah' 
                         ? 'border-border-default' 
                         : 'border-rose-100/80'
                     }`}>
                       <div className="col-span-2">
                         <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                           {selectedReq.jenis_permohonan === 'van_jenazah' 
                             ? (isEn ? 'Deceased Full Name' : 'Nama Penuh Jenazah') 
                             : (isEn ? 'Patient Full Name' : 'Nama Penuh Pesakit')}
                         </span>
                         <span className="font-extrabold text-slate-850 text-base">{selectedReq.nama_pesakit || '-'}</span>
                       </div>
                       <div>
                         <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                           {selectedReq.jenis_permohonan === 'van_jenazah' 
                             ? (isEn ? 'Deceased RN No.' : 'No RN Jenazah') 
                             : (isEn ? 'Patient RN No.' : 'No RN Pesakit')}
                         </span>
                         <span className="font-bold font-mono text-text-primary text-sm bg-subtle/50 px-2 py-0.5 rounded border border-slate-150/60 inline-block">{selectedReq.rn_pesakit || '-'}</span>
                       </div>
                       <div>
                         <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                           {isEn ? 'Gender' : 'Jantina'}
                         </span>
                         <span className="font-semibold text-text-primary">{selectedReq.jantina_pesakit || '-'}</span>
                       </div>
                       <div className="col-span-2 border-t border-border-subtle pt-3">
                         <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                           {selectedReq.jenis_permohonan === 'van_jenazah' 
                             ? (isEn ? 'Cause of Death / Details' : 'Sebab Kematian / Butiran') 
                             : (isEn ? 'Clinical Diagnosis' : 'Diagnosis Pesakit')}
                         </span>
                         <span className="font-semibold text-text-secondary leading-relaxed block">{selectedReq.diagnosis_pesakit || '-'}</span>
                       </div>
                       
                       {/* Mobility and oxygen badges */}
                       {selectedReq.patient_mobility && (
                         <div className={`col-span-2 p-3 rounded-xl text-xs font-semibold flex flex-col gap-1 border ${
                           selectedReq.patient_mobility === 'stretcher'
                             ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 dark:text-amber-300 font-bold shadow-xxs'
                             : 'bg-subtle/50 border-border-default text-text-primary shadow-xxs'
                         }`}>
                           <div className="flex items-center gap-2">
                             <Info className={`w-4 h-4 ${selectedReq.patient_mobility === 'stretcher' ? 'text-amber-600' : 'text-text-muted'}`} />
                             <span>
                               {isEn ? 'Patient Mobility:' : 'Mobiliti Pesakit:'}{' '}
                               <span className="capitalize font-bold">
                                 {selectedReq.patient_mobility === 'stretcher' 
                                   ? (isEn ? 'Stretcher Required' : 'Stretcher / Usungan') 
                                   : selectedReq.patient_mobility}
                               </span>
                             </span>
                           </div>
                           {selectedReq.patient_mobility === 'stretcher' && (
                             <p className="text-[10px] text-amber-700 font-medium leading-normal pl-6 mt-0.5">
                               {isEn 
                                 ? '⚠️ Driver is MANDATED to proceed to the ward and assist escort staff with patient transfer.' 
                                 : '⚠️ Pemandu WAJIB naik ke wad untuk mengambil pesakit secara berpasangan.'}
                             </p>
                           )}
                         </div>
                       )}
                       {selectedReq.oksigen_diperlukan && (
                         <div className="col-span-2 p-3 bg-rose-500/10 border border-rose-150 rounded-xl text-xs font-semibold text-rose-400 dark:text-rose-300 font-bold flex flex-col gap-1 shadow-xxs">
                           <div className="flex items-center gap-2">
                             <Shield className="w-4 h-4 text-rose-600" />
                             <span className="font-bold">
                               {isEn ? 'Continuous Oxygen Support Required' : 'Sokongan Oksigen Berterusan Diperlukan'}
                             </span>
                           </div>
                           {selectedReq.jenis_oksigen && (
                             <div className="text-[10px] text-rose-400 font-medium pl-6">
                               {isEn ? 'Oxygen Apparatus:' : 'Alat Oksigen:'}{' '}
                               <span className="text-rose-400 dark:text-rose-300 font-bold font-bold">{selectedReq.jenis_oksigen}</span>
                             </div>
                           )}
                         </div>
                       )}
                       {selectedReq.mesin_diperlukan && selectedReq.mesin_diperlukan.length > 0 && (
                         <div className="col-span-2 pt-3 border-t border-border-subtle">
                           <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-1">
                             {isEn ? 'Special Equipment / Devices Required' : 'Peralatan / Mesin Diperlukan'}
                           </span>
                           <div className="flex flex-wrap gap-1.5">
                             {selectedReq.mesin_diperlukan.map((machine, mIdx) => (
                               <span key={mIdx} className="text-xxs font-bold bg-rose-500/10 text-rose-400 border border-rose-100 rounded-md px-2 py-1">{machine}</span>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   </>
                 )}
               </div>
             )}

             {/* Driver Pre-Trip safety check review */}
             {selectedInspection && (
               <div className="space-y-4 pt-4 border-t border-border-subtle">
                 <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                   <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                   <h4 className="text-xs font-black text-slate-650 uppercase tracking-wider">
                     {isEn ? 'Driver Pre-Trip Inspection Report' : 'Laporan Pemeriksaan Pre-Trip Pemandu'}
                   </h4>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm bg-subtle/50 p-5 rounded-2xl border border-border-default shadow-xs">
                   <div>
                     <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                       {isEn ? 'Assigned Duty Driver' : 'On-Duty Driver'}
                     </span>
                     <span className="font-bold text-text-primary">{selectedReq.pemandu?.full_name || (isEn ? 'Assigned Driver' : 'Driver')}</span>
                   </div>
                   <div>
                     <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                       {isEn ? 'Inspected Vehicle' : 'Kenderaan Diperiksa'}
                     </span>
                     <span className="font-bold text-blue-600 font-mono text-xs bg-blue-500/10 px-2 py-0.5 rounded border border-blue-150/40 inline-block">{selectedReq.kenderaan?.no_kenderaan}</span>
                   </div>
                   <div>
                     <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                       {isEn ? 'Latest Odometer' : 'Odometer Terkini'}
                     </span>
                     <span className="font-extrabold text-slate-850 font-mono tabular-nums">{selectedInspection.bacaan_odometer.toLocaleString(isEn ? 'en-US' : 'ms-MY')} km</span>
                   </div>
                   <div>
                     <span className="block text-xxs font-extrabold text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                       {isEn ? 'Inspection Outcome' : 'Keputusan Semakan'}
                     </span>
                     <Badge variant="success" className="py-0.5 px-2 font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-250">Cleared / Good</Badge>
                   </div>
                 </div>

                 {/* Checklist items status */}
                 <div className="bg-surface border border-slate-150 rounded-2xl overflow-hidden divide-y divide-border-subtle shadow-xs">
                   <div className="flex justify-between items-center p-3.5 px-4 text-xs hover:bg-subtle/50 transition-colors">
                     <span className="font-bold text-slate-650 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                       {isEn ? 'Tyres & Rims' : 'Tayar & Rim'}
                     </span>
                     <Badge variant="success" className="py-0.5 px-2 bg-emerald-500/10 text-emerald-700 border border-emerald-150/60 font-semibold">{isEn ? 'Good (Cleared)' : 'Baik (Cleared)'}</Badge>
                   </div>
                   <div className="flex justify-between items-center p-3.5 px-4 text-xs hover:bg-subtle/50 transition-colors">
                     <span className="font-bold text-slate-655 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                       {isEn ? 'Fuel / Gas Level' : 'Paras Gas / Petrol'}
                     </span>
                     <Badge variant="success" className="py-0.5 px-2 bg-emerald-500/10 text-emerald-700 border border-emerald-150/60 font-semibold">{isEn ? 'Good (Cleared)' : 'Baik (Cleared)'}</Badge>
                   </div>
                   <div className="flex justify-between items-center p-3.5 px-4 text-xs hover:bg-subtle/50 transition-colors">
                     <span className="font-bold text-slate-655 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                       {isEn ? 'Engine Oil Level' : 'Minyak Enjin'}
                     </span>
                     <Badge variant="success" className="py-0.5 px-2 bg-emerald-500/10 text-emerald-700 border border-emerald-150/60 font-semibold">{isEn ? 'Good (Cleared)' : 'Baik (Cleared)'}</Badge>
                   </div>
                 </div>      

                  {/* Inspections Photo Gallery */}
                  <div className="mt-4 pt-3 border-t border-border-subtle">
                    <span className="block text-xs font-bold text-text-muted mb-2">
                      {isEn ? 'Inspection Photo Evidences' : 'Lampiran Bukti Foto Pemeriksaan'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Tyre Photo */}
                      <div className="border border-border-default rounded-xl overflow-hidden bg-subtle flex flex-col">
                        <div className="aspect-square w-full flex items-center justify-center overflow-hidden">
                          {selectedInspection.foto_tayar && (selectedInspection.foto_tayar.startsWith('data:') || selectedInspection.foto_tayar.startsWith('http') || selectedInspection.foto_tayar.startsWith('/')) ? (
                            <img src={selectedInspection.foto_tayar} className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform" alt="Tyres" onClick={() => window.open(selectedInspection.foto_tayar, '_blank')} />
                          ) : (
                            <span className="text-slate-400 text-xxs p-2 text-center">{isEn ? 'No Tyre Photo' : 'Tiada Foto Tayar'}</span>
                          )}
                        </div>
                        <div className="p-1.5 bg-subtle/50 border-t border-slate-150 text-center font-bold text-[10px] text-text-muted">
                          {isEn ? 'Tyres & Rims' : 'Tayar & Rim'}
                        </div>
                      </div>

                      {/* Gas Photo */}
                      <div className="border border-border-default rounded-xl overflow-hidden bg-subtle flex flex-col">
                        <div className="aspect-square w-full flex items-center justify-center overflow-hidden">
                          {selectedInspection.foto_minyak_gas && (selectedInspection.foto_minyak_gas.startsWith('data:') || selectedInspection.foto_minyak_gas.startsWith('http') || selectedInspection.foto_minyak_gas.startsWith('/')) ? (
                            <img src={selectedInspection.foto_minyak_gas} className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform" alt="Fuel" onClick={() => window.open(selectedInspection.foto_minyak_gas, '_blank')} />
                          ) : (
                            <span className="text-slate-400 text-xxs p-2 text-center">{isEn ? 'No Fuel Photo' : 'Tiada Foto Petrol'}</span>
                          )}
                        </div>
                        <div className="p-1.5 bg-subtle/50 border-t border-slate-150 text-center font-bold text-[10px] text-text-muted">
                          {isEn ? 'Fuel / Gas' : 'Gas / Petrol'}
                        </div>
                      </div>

                      {/* Engine Oil Photo */}
                      <div className="border border-border-default rounded-xl overflow-hidden bg-subtle flex flex-col">
                        <div className="aspect-square w-full flex items-center justify-center overflow-hidden">
                          {selectedInspection.foto_minyak_hitam && (selectedInspection.foto_minyak_hitam.startsWith('data:') || selectedInspection.foto_minyak_hitam.startsWith('http') || selectedInspection.foto_minyak_hitam.startsWith('/')) ? (
                            <img src={selectedInspection.foto_minyak_hitam} className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform" alt="Engine Oil" onClick={() => window.open(selectedInspection.foto_minyak_hitam, '_blank')} />
                          ) : (
                            <span className="text-slate-400 text-xxs p-2 text-center">{isEn ? 'No Engine Photo' : 'Tiada Foto Enjin'}</span>
                          )}
                        </div>
                        <div className="p-1.5 bg-subtle/50 border-t border-slate-150 text-center font-bold text-[10px] text-text-muted">
                          {isEn ? 'Engine Oil' : 'Minyak Enjin'}
                        </div>
                      </div>

                      {/* Odometer Photo */}
                      <div className="border border-border-default rounded-xl overflow-hidden bg-subtle flex flex-col">
                        <div className="aspect-square w-full flex items-center justify-center overflow-hidden">
                          {selectedInspection.foto_odometer && (selectedInspection.foto_odometer.startsWith('data:') || selectedInspection.foto_odometer.startsWith('http') || selectedInspection.foto_odometer.startsWith('/')) ? (
                            <img src={selectedInspection.foto_odometer} className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform" alt="Odometer" onClick={() => window.open(selectedInspection.foto_odometer, '_blank')} />
                          ) : (
                            <span className="text-slate-400 text-xxs p-2 text-center">{isEn ? 'No Odometer Photo' : 'Tiada Foto Odometer'}</span>
                          )}
                        </div>
                        <div className="p-1.5 bg-subtle/50 border-t border-slate-150 text-center font-bold text-[10px] text-slate-650">
                          {isEn ? 'Odometer' : 'Odometer'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-100 rounded-xl text-xxs text-text-muted italic mt-3">
                    {isEn ? '* Click on any image thumbnail to view full-resolution photo in a new tab.' : '* Sila klik pada foto untuk melihat/membuka imej bersaiz penuh di tab baharu.'}
                  </div>
                </div>
            )}

            {/* Direct Approve/Reject action or Rejection/Status details inside SlideOver */}
            {selectedReq.status_semasa === 'driver_accepted' ? (
              <div className="pt-6 border-t border-border-subtle flex gap-3">
                <Button 
                  onClick={() => handleApprove(selectedReq.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  <Check className="w-4 h-4 mr-2 inline" />
                  {isEn ? 'Approve Requisition' : 'Luluskan Trip'}
                </Button>
                <Button 
                  onClick={() => handleOpenReject(selectedReq.id)}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  {isEn ? 'Reject Requisition' : 'Tolak Trip'}
                </Button>
              </div>
            ) : (
              <div className="pt-6 border-t border-border-subtle space-y-3">
                {selectedReq.sebab_tolak && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm">
                    <span className="block text-xs font-extrabold text-rose-400 uppercase tracking-wider mb-1">
                      {isEn ? 'Rejection Reason' : 'Sebab Penolakan'}
                    </span>
                    <span className="font-semibold text-rose-400 dark:text-rose-300 font-bold">{selectedReq.sebab_tolak}</span>
                  </div>
                )}
                <div className="text-center text-xs font-semibold text-text-muted">
                  {isEn ? 'This requisition has been processed with status:' : 'Permohonan ini telah diproses dengan status:'}{' '}
                  <span className="capitalize font-bold text-text-primary">{selectedReq.status_semasa}</span>
                </div>
              </div>
            )}

          </div>
        )}
      </SlideOver>

      {/* 2. Rejection Reason Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl shadow-xl border border-border-default p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              {isEn ? 'Reject Requisition Approval' : 'Tolak Kelulusan Perjalanan'}
            </h3>
            
            <p className="text-xs text-text-muted">
              {isEn 
                ? 'Please specify the rationale for rejecting this transport requisition. The requester will view this in their portal history.' 
                : 'Sila nyatakan sebab permohonan trip pengangkutan ditolak. Pemohon akan dapat melihat sebab penolakan dalam sejarah portal mereka.'}
            </p>

            <textarea 
              rows={3}
              placeholder={isEn ? 'E.g., Missing HOD endorsement / Incomplete patient data...' : 'Contoh: Tiada kelulusan ketua unit / Butiran pesakit tidak sah...'}
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
                {isEn ? 'Cancel' : 'Batal'}
              </Button>
              <Button 
                onClick={handleRejectSubmit}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {isEn ? 'Submit & Reject' : 'Hantar & Tolak Kelulusan'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default TransporterAdminApprovalPage
