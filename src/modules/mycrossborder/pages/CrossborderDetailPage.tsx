// src/modules/mycrossborder/pages/CrossborderDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  Send, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Stamp, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/stores/toastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { 
  getCrossborderTransferById, 
  submitCrossborderTransfer,
  approveCrossborderTransfer,
  completeCrossborderTransfer,
  cancelCrossborderTransfer,
  deleteCrossborderTransfer
} from '../services/crossborderService';
import { 
  generateTransferFormPDF,
  generatePermissionLetterPDF
} from '../services/crossborderPdfService';
import type { CrossborderTransfer } from '@/shared/types/mycrossborder';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export const CrossborderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);

  const [transfer, setTransfer] = useState<CrossborderTransfer | null>(null);
  const [loading, setLoading] = useState(true);

  // Approval inputs
  const [directorName, setDirectorName] = useState('DR DOUGLAS CHU KIN SOON (Pengarah Hospital Lawas)');
  const [letterRef, setLetterRef] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadTransfer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getCrossborderTransferById(id);
      if (res.error) throw new Error(res.error);
      setTransfer(res.data);
      if (res.data) {
        // Set default letter ref if already generated or empty
        const year = new Date(res.data.tarikh_perjalanan).getFullYear() || new Date().getFullYear();
        setLetterRef(res.data.surat_kebenaran_ref || `TF/HL/MW ( ${Math.floor(Math.random() * 50) + 1} ) ${year}`);
      }
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        err.message || (language === 'ms' ? 'Gagal memuatkan butiran permohonan' : 'Failed to load transfer details')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfer();
  }, [id]);

  const handleSubmit = async () => {
    if (!transfer) return;
    try {
      const res = await submitCrossborderTransfer(transfer.id);
      if (res.error) throw new Error(res.error);
      toast.success(
        language === 'ms' ? 'Hantar Permohonan' : 'Submitted',
        language === 'ms' ? 'Permohonan telah berjaya dihantar untuk kelulusan.' : 'Application submitted successfully for Director endorsement.'
      );
      loadTransfer();
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        err.message || (language === 'ms' ? 'Gagal menghantar permohonan' : 'Failed to submit application')
      );
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transfer || !directorName || !letterRef) return;
    try {
      const res = await approveCrossborderTransfer(transfer.id, directorName, letterRef, user?.id || 'user-1');
      if (res.error) throw new Error(res.error);
      toast.success(
        language === 'ms' ? 'Kelulusan Berjaya' : 'Approved',
        language === 'ms' ? 'Permohonan rentasi sempadan telah diluluskan.' : 'Cross-border clearance approved and permission letter generated.'
      );
      setShowApproveModal(false);
      loadTransfer();
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        err.message || (language === 'ms' ? 'Gagal meluluskan permohonan' : 'Failed to approve application')
      );
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transfer || !cancelReason) return;
    try {
      const res = await cancelCrossborderTransfer(transfer.id, cancelReason);
      if (res.error) throw new Error(res.error);
      toast.success(
        language === 'ms' ? 'Batal Permohonan' : 'Cancelled',
        language === 'ms' ? 'Permohonan telah dibatalkan.' : 'Application has been cancelled.'
      );
      setShowCancelModal(false);
      loadTransfer();
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        err.message || (language === 'ms' ? 'Gagal membatalkan permohonan' : 'Failed to cancel application')
      );
    }
  };

  const handleComplete = async () => {
    if (!transfer) return;
    try {
      const res = await completeCrossborderTransfer(transfer.id);
      if (res.error) throw new Error(res.error);
      toast.success(
        language === 'ms' ? 'Selesai Perjalanan' : 'Completed',
        language === 'ms' ? 'Status pemindahan ditukar ke Selesai.' : 'Transfer status updated to Completed.'
      );
      loadTransfer();
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        err.message || (language === 'ms' ? 'Gagal menukar status' : 'Failed to update status')
      );
    }
  };

  const handleDelete = async () => {
    if (!transfer) return;
    if (!confirm(language === 'ms' ? 'Adakah anda pasti mahu memadam draf permohonan ini?' : 'Are you sure you want to delete this draft application?')) return;
    try {
      const res = await deleteCrossborderTransfer(transfer.id);
      if (res.error) throw new Error(res.error);
      toast.success(
        language === 'ms' ? 'Padam Berjaya' : 'Deleted',
        language === 'ms' ? 'Draf permohonan berjaya dipadam.' : 'Draft application deleted successfully.'
      );
      navigate('/crossborder/dashboard');
    } catch (err: any) {
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        err.message || (language === 'ms' ? 'Gagal memadam permohonan' : 'Failed to delete application')
      );
    }
  };

  const handleDownloadPDF = async (pdfType: 'form' | 'letter') => {
    if (!transfer) return;
    try {
      let blob: Blob;
      let filename = '';
      if (pdfType === 'form') {
        blob = await generateTransferFormPDF(transfer);
        filename = `Transfer_Form_${transfer.no_rujukan}.pdf`;
      } else {
        blob = await generatePermissionLetterPDF(transfer);
        filename = `Border_Clearance_Letter_${transfer.no_rujukan}.pdf`;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(
        language === 'ms' ? 'Muat Turun PDF' : 'PDF Downloaded',
        language === 'ms' ? 'PDF berjaya dijanakan.' : 'PDF document generated and downloaded.'
      );
    } catch (e) {
      console.error(e);
      toast.error(
        language === 'ms' ? 'Ralat PDF' : 'PDF Error',
        language === 'ms' ? 'Gagal menjana PDF.' : 'Failed to generate PDF.'
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="border-slate-200 text-slate-700 bg-slate-50">{language === 'ms' ? 'Draf' : 'Draft'}</Badge>;
      case 'submitted':
        return <Badge className="border-amber-200 text-amber-800 bg-amber-50">{language === 'ms' ? 'Menunggu Kelulusan' : 'Pending Approval'}</Badge>;
      case 'approved':
        return <Badge className="border-emerald-200 text-emerald-800 bg-emerald-50">{language === 'ms' ? 'Diluluskan' : 'Approved'}</Badge>;
      case 'completed':
        return <Badge className="border-blue-200 text-blue-800 bg-blue-50">{language === 'ms' ? 'Selesai' : 'Completed'}</Badge>;
      case 'cancelled':
        return <Badge className="border-red-200 text-red-800 bg-red-50">{language === 'ms' ? 'Dibatalkan' : 'Cancelled'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">{language === 'ms' ? 'Memuatkan butiran permohonan...' : 'Loading application details...'}</div>;
  }

  if (!transfer) {
    return <div className="p-8 text-center text-slate-500">{language === 'ms' ? 'Permohonan tidak ditemui.' : 'Application not found.'}</div>;
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Back navigation */}
      <div>
        <button 
          onClick={() => navigate('/crossborder/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors group text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'ms' ? 'Kembali ke Papan Pemuka' : 'Back to Dashboard'}</span>
        </button>
      </div>

      {/* Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-sm rounded-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xl font-mono font-bold text-blue-600">{transfer.no_rujukan}</span>
            {getStatusBadge(transfer.status)}
          </div>
          <p className="text-xs text-slate-500">
            {language === 'ms' ? 'Perjalanan:' : 'Transit Schedule:'}{' '}
            {formatDate(new Date(transfer.tarikh_perjalanan))} ({transfer.masa_berlepas})
          </p>
        </div>

        {/* Action Buttons based on status */}
        <div className="flex gap-2.5 flex-wrap">
          {transfer.status === 'draft' && (
            <>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {language === 'ms' ? 'Padam Draf' : 'Delete Draft'}
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {language === 'ms' ? 'Hantar Kelulusan' : 'Submit For Approval'}
              </Button>
            </>
          )}

          {transfer.status === 'submitted' && (
            <>
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="outline"
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                {language === 'ms' ? 'Batal / Tolak' : 'Reject / Cancel'}
              </Button>
              <Button
                onClick={() => setShowApproveModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <Stamp className="w-3.5 h-3.5" />
                {language === 'ms' ? 'Luluskan Permohonan' : 'Approve & Issue Clearance'}
              </Button>
            </>
          )}

          {transfer.status === 'approved' && (
            <>
              <Button
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                {language === 'ms' ? 'Selesai Perjalanan' : 'Mark Completed'}
              </Button>
              <Button
                onClick={() => handleDownloadPDF('form')}
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                {language === 'ms' ? 'Borang Transfer PDF' : 'Transfer Form PDF'}
              </Button>
              <Button
                onClick={() => handleDownloadPDF('letter')}
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                {language === 'ms' ? 'Surat Pelepasan PDF' : 'Clearance Letter PDF'}
              </Button>
            </>
          )}

          {transfer.status === 'completed' && (
            <>
              <Button
                onClick={() => handleDownloadPDF('form')}
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                {language === 'ms' ? 'Borang Transfer PDF' : 'Transfer Form PDF'}
              </Button>
              <Button
                onClick={() => handleDownloadPDF('letter')}
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                {language === 'ms' ? 'Surat Pelepasan PDF' : 'Clearance Letter PDF'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Trip Info */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {language === 'ms' ? 'Butiran Perjalanan' : 'Trip Information'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <span className="text-xs text-slate-400 uppercase block">{language === 'ms' ? 'Hospital Perujuk' : 'Referring Hospital'}</span>
                <span className="font-semibold text-slate-900">{transfer.referring_hospital}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase block">{language === 'ms' ? 'Hospital Destinasi' : 'Destination Hospital'}</span>
                <span className="font-semibold text-slate-900">{transfer.destination_hospital}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase block">{language === 'ms' ? 'Tempat Berlepas' : 'Departure Point'}</span>
                <span className="text-slate-800">{transfer.tempat_berlepas}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase block">{language === 'ms' ? 'Border Control Post' : 'Border Checkpoint Post'}</span>
                <span className="text-slate-800">{transfer.border_control_post}</span>
              </div>
              {transfer.linked_transport_request_id && (
                <div className="md:col-span-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
                    <span className="bg-blue-600 text-white rounded px-1.5 py-0.5 font-bold uppercase tracking-wide text-[9px]">Linked Transporter</span>
                    <span>{language === 'ms' ? 'No. Rujukan:' : 'Ref:'} {transfer.linked_transport_request_id}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/transporter/requests')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                  >
                    {language === 'ms' ? 'Lihat Permohonan Pengangkutan' : 'View Linked Transport Request'}
                  </button>
                </div>
              )}
            </div>
          </Card>


          {/* Section 2: Patients */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {language === 'ms' ? 'Senarai Pesakit' : 'Patient Roster'}
            </h2>
            <div className="space-y-4">
              {transfer.patients && transfer.patients.length > 0 ? (
                transfer.patients.map((p) => (
                  <div key={p.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
                    <div className="md:col-span-3 font-semibold text-blue-600 flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-xs">
                        {language === 'ms' ? `Pesakit #${p.urutan}` : `Patient #${p.urutan}`}
                      </span>
                      {p.nama}
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Jantina' : 'Gender'}</span>
                      <span className="text-slate-800">{p.jantina === 'Lelaki' ? (language === 'ms' ? 'Lelaki' : 'Male') : (language === 'ms' ? 'Perempuan' : 'Female')}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Tarikh Lahir' : 'Date of Birth'}</span>
                      <span className="text-slate-800">{formatDate(new Date(p.tarikh_lahir))}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Warganegara' : 'Nationality'}</span>
                      <span className="text-slate-800">{p.warganegara}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Dokumen Perjalanan' : 'Travel Document'}</span>
                      <span className="text-slate-800">
                        {p.jenis_dokumen} : {p.no_dokumen}
                        {p.jenis_dokumen === 'PASSPORT' && p.passport_expiry && ` (${language === 'ms' ? 'Tamat:' : 'Exp:'} ${formatDate(new Date(p.passport_expiry))})`}
                      </span>
                    </div>
                    {p.no_pengenalan && (
                      <div className="md:col-span-2">
                        <span className="text-xs text-slate-400 block">{language === 'ms' ? 'No Kad Pengenalan Sekunder' : 'Secondary Identification / MyKad'}</span>
                        <span className="text-slate-800">{p.no_pengenalan}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-sm">{language === 'ms' ? 'Tiada pesakit berdaftar.' : 'No registered patients.'}</div>
              )}
            </div>
          </Card>

          {/* Section 3: Vehicle */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {language === 'ms' ? 'Maklumat Kenderaan' : 'Vehicle & Driver Details'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Jenis Kenderaan' : 'Vehicle Type'}</span>
                <span className="font-semibold uppercase text-slate-800">{transfer.jenis_kenderaan}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">{language === 'ms' ? 'No. Pendaftaran' : 'Registration Plate'}</span>
                <span className="font-mono font-semibold text-blue-600">{transfer.no_pendaftaran}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Nama Pemandu' : 'Driver Name'}</span>
                <span className="font-semibold text-slate-800">{(transfer as any).pemandu_nama || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">{language === 'ms' ? 'No. Passport Pemandu' : 'Driver Passport Number'}</span>
                <span className="font-semibold text-slate-800">
                  {(transfer as any).pemandu_passport || 'N/A'}
                  {(transfer as any).pemandu_passport_expiry && ` (${language === 'ms' ? 'Tamat:' : 'Exp:'} ${formatDate(new Date((transfer as any).pemandu_passport_expiry))})`}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Peralatan Perubatan Lain' : 'Medical Equipment Carried'}</span>
                <span className="text-slate-800">{transfer.peralatan_lain || (language === 'ms' ? 'Tiada peralatan tambahan' : 'None declared')}</span>
              </div>
            </div>
          </Card>

          {/* Section 4: Pengiring KKM */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {language === 'ms' ? 'Pengiring Perubatan KKM' : 'MOH Medical Escorts'}
            </h2>
            <div className="space-y-3">
              {transfer.escorts && transfer.escorts.filter(e => e.jenis_pengiring === 'medical_escort').length > 0 ? (
                transfer.escorts
                  .filter(e => e.jenis_pengiring === 'medical_escort')
                  .map((e) => {
                    const getJobLabel = (job?: string) => {
                      switch (job) {
                        case 'nurse': return language === 'ms' ? 'Jururawat / Nurse' : 'Staff Nurse (SN)';
                        case 'medical_officer': return language === 'ms' ? 'Pegawai Perubatan (MO)' : 'Medical Officer (MO)';
                        case 'assistant_medical_officer': return language === 'ms' ? 'Penolong Pegawai Perubatan (AMO)' : 'Assistant Medical Officer (AMO)';
                        case 'ppk': return language === 'ms' ? 'Pembantu Perawatan Kesihatan (PPK)' : 'Healthcare Assistant (PPK)';
                        default: return language === 'ms' ? 'Kakitangan Perubatan' : 'Medical Staff';
                      }
                    };
                    return (
                      <div key={e.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-sm text-slate-600">
                        <div>
                          <div className="font-semibold text-slate-900">{e.nama}</div>
                          {e.no_dokumen && (
                            <div className="text-xs text-slate-400">
                              {e.jenis_dokumen} : {e.no_dokumen}
                              {e.jenis_dokumen === 'PASSPORT' && e.passport_expiry && ` (${language === 'ms' ? 'Tamat:' : 'Exp:'} ${formatDate(new Date(e.passport_expiry))})`}
                            </div>
                          )}
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 text-emerald-800 bg-emerald-50">
                          {getJobLabel(e.jawatan)}
                        </span>
                      </div>
                    );
                  })
              ) : (
                <div className="text-slate-400 text-sm py-2">{language === 'ms' ? 'Tiada pengiring perubatan KKM didaftarkan.' : 'No MOH medical escorts registered.'}</div>
              )}
            </div>
          </Card>

          {/* Section 5: Waris / Pengiring Terdekat */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {language === 'ms' ? 'Waris / Pengiring Terdekat Pesakit' : 'Accompanying Next of Kin'}
            </h2>
            <div className="space-y-3">
              {transfer.escorts && transfer.escorts.filter(e => e.jenis_pengiring === 'patient_escort').length > 0 ? (
                transfer.escorts
                  .filter(e => e.jenis_pengiring === 'patient_escort')
                  .map((e) => {
                    const accPatient = transfer.patients?.find(p => p.urutan === e.patient_urutan);
                    return (
                      <div key={e.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-sm text-slate-600">
                        <div>
                          <div className="font-semibold text-slate-900">{e.nama}</div>
                          <div className="text-xs text-slate-400">
                            {e.jenis_dokumen} : {e.no_dokumen}
                            {e.jenis_dokumen === 'PASSPORT' && e.passport_expiry && ` (${language === 'ms' ? 'Tamat:' : 'Exp:'} ${formatDate(new Date(e.passport_expiry))})`}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border border-cyan-200 text-cyan-800 bg-cyan-50">
                            {language === 'ms' ? 'Waris' : 'Family Escort'}
                          </span>
                          {accPatient && (
                            <div className="text-[10px] text-slate-400 mt-1 font-medium">
                              {language === 'ms' ? 'Pengiring kepada:' : 'Escorting:'}{' '}
                              <span className="font-bold text-slate-600">{accPatient.nama}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-slate-400 text-sm py-2">{language === 'ms' ? 'Tiada waris didaftarkan.' : 'No family escorts registered.'}</div>
              )}
            </div>
          </Card>
        </div>


        {/* Sidebar Info & Logs */}
        <div className="space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              {language === 'ms' ? 'Kelulusan & Pengesahan' : 'Clearance & Approvals'}
            </h2>
            
            <div className="text-sm text-slate-600 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Doktor Perujuk' : 'Referring Doctor'}</span>
                <span className="font-semibold text-slate-800">{transfer.doktor_perujuk_nama}</span>
              </div>

              {transfer.pengarah_nama && (
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Diluluskan Oleh (Pengarah)' : 'Authorized By (Hospital Director)'}</span>
                  <span className="font-semibold text-emerald-700">{transfer.pengarah_nama}</span>
                </div>
              )}

              {transfer.surat_kebenaran_ref && (
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'ms' ? 'No. Rujukan Surat' : 'Permission Letter Reference'}</span>
                  <span className="font-mono text-blue-600 font-semibold">{transfer.surat_kebenaran_ref}</span>
                </div>
              )}

              {transfer.approved_at && (
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Masa Diluluskan' : 'Approval Timestamp'}</span>
                  <span>{formatDate(new Date(transfer.approved_at))}</span>
                </div>
              )}

              {transfer.catatan && (
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'ms' ? 'Catatan / Ulasan' : 'Clinical Remarks / Notes'}</span>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                    {transfer.catatan}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Stamp className="w-5 h-5 text-blue-600" />
              {language === 'ms' ? 'Kelulusan Sempadan Pengarah' : 'Hospital Director Border Clearance Endorsement'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ms' 
                ? 'Sila masukkan butiran kebenaran bertulis rasmi bagi menjana surat pelepasan Border Control Post.'
                : 'Enter formal authorization details to issue the official Border Clearance Transit Letter.'}
            </p>
            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'Nama Pengarah *' : 'Director Name *'}
                </label>
                <input 
                  type="text" 
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'No. Rujukan Surat Kebenaran *' : 'Letter Reference Number *'}
                </label>
                <input 
                  type="text" 
                  value={letterRef}
                  onChange={(e) => setLetterRef(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  type="button" 
                  onClick={() => setShowApproveModal(false)}
                  variant="outline"
                  className="border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {language === 'ms' ? 'Batal' : 'Cancel'}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {language === 'ms' ? 'Lulus & Log Kebenaran' : 'Authorize & Issue Letter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              {language === 'ms' ? 'Batal / Tolak Permohonan' : 'Reject / Cancel Transfer Application'}
            </h3>
            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {language === 'ms' ? 'Sebab Pembatalan *' : 'Reason for Cancellation *'}
                </label>
                <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                  rows={3}
                  placeholder={language === 'ms' ? 'Nyatakan sebab pembatalan kes...' : 'State the reason for cancellation or rejection...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button 
                  type="button" 
                  onClick={() => setShowCancelModal(false)}
                  variant="outline"
                  className="border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {language === 'ms' ? 'Kembali' : 'Back'}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {language === 'ms' ? 'Batal Permohonan' : 'Confirm Cancellation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossborderDetailPage;
