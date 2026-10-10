// src/modules/mycrossborder/pages/CrossborderDashboardPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/stores/toastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { getCrossborderTransfers } from '../services/crossborderService';
import type { CrossborderTransfer } from '@/shared/types/mycrossborder';
import { Card, CardContent, Button, Badge, Skeleton, ModulePageHeader } from '@/components/ui';
import { SkeletonTable, SkeletonMobileCardList } from '@/shared/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export const CrossborderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const loggedUser = useAuthStore((state) => state.user);
  const toast = useToast();
  
  const [transfers, setTransfers] = useState<CrossborderTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getCrossborderTransfers();
      setTransfers(res.data || []);
    } catch (err) {
      console.error('Failed to load transfers', err);
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        language === 'ms' ? 'Gagal memuatkan rekod rentasi sempadan' : 'Failed to load cross-border transfer records'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = transfers.length;
    const pending = transfers.filter(t => t.status === 'submitted').length;
    const approved = transfers.filter(t => t.status === 'approved').length;
    const completed = transfers.filter(t => t.status === 'completed').length;
    return { total, pending, approved, completed };
  }, [transfers]);

  const recentTransfers = useMemo(() => {
    return transfers.slice(0, 5);
  }, [transfers]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="border-border-default text-text-muted bg-subtle">{language === 'ms' ? 'Draf' : 'Draft'}</Badge>;
      case 'submitted':
        return <Badge className="border-amber-500/20 text-amber-500 bg-amber-500/10">{language === 'ms' ? 'Menunggu Kelulusan' : 'Pending Approval'}</Badge>;
      case 'approved':
        return <Badge className="border-emerald-500/20 text-emerald-500 bg-emerald-500/10">{language === 'ms' ? 'Diluluskan' : 'Approved'}</Badge>;
      case 'completed':
        return <Badge className="border-sky-500/20 text-sky-500 bg-sky-500/10">{language === 'ms' ? 'Selesai' : 'Completed'}</Badge>;
      case 'cancelled':
        return <Badge className="border-rose-500/20 text-rose-500 bg-rose-500/10">{language === 'ms' ? 'Dibatalkan' : 'Cancelled'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Universal Module Header */}
      <ModulePageHeader
        badge="Lawas ⟷ Limbang Transit"
        title="MyCrossBorder"
        description={
          language === 'ms' 
            ? 'Sistem Bersepadu Pengurusan & Pelepasan Sempadan Malaysia-Brunei (Hospital Lawas - Hospital Limbang)'
            : 'Integrated Malaysia-Brunei Medical Border Clearance & Patient Transfer System'
        }
        icon={<Globe className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={() => navigate('/crossborder/log')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <History className="w-4 h-4 text-accent-base" />
              <span>{language === 'ms' ? 'Log Sejarah' : 'Transfer History Log'}</span>
            </Button>
            <Button 
              onClick={() => navigate('/crossborder/create')}
              size="sm"
              className="bg-accent-base hover:bg-accent-dark text-white gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ms' ? 'Daftar Pemindahan Baru' : 'New Transfer Application'}</span>
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-surface border border-border-default shadow-xs rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-text-muted">{language === 'ms' ? 'Total Permohonan' : 'Total Applications'}</span>
              <div className="text-2xl font-bold font-mono mt-1 text-text-primary">
                {loading ? <Skeleton className="h-8 w-14 my-0.5 rounded-lg" /> : stats.total}
              </div>
              <p className="text-xs text-text-muted mt-1">{language === 'ms' ? 'Keseluruhan kes' : 'All lifetime records'}</p>
            </div>
            <div className="p-2.5 bg-subtle text-accent-base rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border-default shadow-xs rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-text-muted">{language === 'ms' ? 'Menunggu Kelulusan' : 'Pending Approvals'}</span>
              <div className="text-2xl font-bold font-mono mt-1 text-text-primary">
                {loading ? <Skeleton className="h-8 w-14 my-0.5 rounded-lg" /> : stats.pending}
              </div>
              <p className="text-xs text-text-muted mt-1">{language === 'ms' ? 'Perlu kelulusan Pengarah' : 'Requires Director approval'}</p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border-default shadow-xs rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-text-muted">{language === 'ms' ? 'Kebenaran Aktif' : 'Active Permits'}</span>
              <div className="text-2xl font-bold font-mono mt-1 text-text-primary">
                {loading ? <Skeleton className="h-8 w-14 my-0.5 rounded-lg" /> : stats.approved}
              </div>
              <p className="text-xs text-text-muted mt-1">{language === 'ms' ? 'Kebenaran pelepasan aktif' : 'Active clearance permits'}</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border-default shadow-xs rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-text-muted">{language === 'ms' ? 'Selesai Perjalanan' : 'Completed Transfers'}</span>
              <div className="text-2xl font-bold font-mono mt-1 text-text-primary">
                {loading ? <Skeleton className="h-8 w-14 my-0.5 rounded-lg" /> : stats.completed}
              </div>
              <p className="text-xs text-text-muted mt-1">{language === 'ms' ? 'Selamat tiba di Limbang' : 'Safely received at Limbang'}</p>
            </div>
            <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transfers Table */}
        <Card className="lg:col-span-2 bg-surface border border-border-default shadow-xs rounded-xl p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-base" />
              {language === 'ms' ? 'Permohonan Terkini' : 'Recent Transfer Applications'}
            </h2>
            <Button 
              onClick={() => navigate('/crossborder/log')}
              variant="ghost" 
              className="text-accent-base hover:text-accent-dark font-semibold p-0 flex items-center gap-1 text-sm hover:bg-transparent"
            >
              {language === 'ms' ? 'Lihat Semua' : 'View All'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="hidden md:block">
                <SkeletonTable columns={6} rows={4} className="border-none shadow-none" />
              </div>
              <div className="md:hidden">
                <SkeletonMobileCardList count={3} />
              </div>
            </div>
          ) : recentTransfers.length === 0 ? (
            <div className="py-12 text-center text-text-muted">
              {language === 'ms' ? 'Tiada rekod pemindahan dijumpai.' : 'No transfer records found.'}
            </div>
          ) : (
            <>
              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto border border-border-default rounded-xl">
                <table className="w-full text-sm text-left text-text-secondary">
                  <thead className="text-xs uppercase bg-subtle/50 text-text-muted border-b border-border-default">
                    <tr>
                      <th scope="col" className="px-4 py-3">{language === 'ms' ? 'No Rujukan' : 'Reference No'}</th>
                      <th scope="col" className="px-4 py-3">{language === 'ms' ? 'Tarikh & Masa' : 'Date & Time'}</th>
                      <th scope="col" className="px-4 py-3">{language === 'ms' ? 'Pesakit Utama' : 'Primary Patient'}</th>
                      <th scope="col" className="px-4 py-3">{language === 'ms' ? 'Kenderaan' : 'Vehicle'}</th>
                      <th scope="col" className="px-4 py-3">{language === 'ms' ? 'Status' : 'Status'}</th>
                      <th scope="col" className="px-4 py-3 text-right">{language === 'ms' ? 'Tindakan' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {recentTransfers.map((item) => (
                      <tr key={item.id} className="hover:bg-subtle/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-accent-base">
                          {item.no_rujukan}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-text-primary">
                            {formatDate(new Date(item.tarikh_perjalanan))}
                          </div>
                          <div className="text-xs text-text-muted">{item.masa_berlepas}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.patients && item.patients.length > 0 ? (
                            <div>
                              <div className="font-medium text-text-primary">{item.patients[0].nama}</div>
                              {item.patients.length > 1 && (
                                <div className="text-xs text-text-muted">
                                  + {item.patients.length - 1} {language === 'ms' ? 'pesakit lain' : 'other patients'}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-muted">{language === 'ms' ? 'Tiada pesakit' : 'No patients'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">
                          {item.no_pendaftaran}
                        </td>
                        <td className="px-4 py-3.5">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            onClick={() => navigate(`/crossborder/detail/${item.id}`)}
                            variant="outline"
                            size="sm"
                            className="border-border-default text-text-primary hover:bg-subtle rounded-lg text-xs min-h-[36px]"
                          >
                            {language === 'ms' ? 'Butiran' : 'Details'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: High-End Native Cards (Zero Horizontal Overflow) */}
              <div className="md:hidden divide-y divide-border-default border border-border-default rounded-xl overflow-hidden">
                {recentTransfers.map((item) => (
                  <div key={item.id} className="p-4 space-y-3 bg-surface">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-semibold text-accent-base bg-accent-base/10 px-2 py-0.5 rounded border border-accent-base/20 inline-block">
                          {item.no_rujukan}
                        </span>
                        <h4 className="font-semibold text-text-primary text-sm mt-1.5">
                          {item.patients && item.patients.length > 0 ? item.patients[0].nama : (language === 'ms' ? 'Tiada pesakit' : 'No patient')}
                        </h4>
                        {item.patients && item.patients.length > 1 && (
                          <span className="text-xs text-text-muted block mt-0.5">
                            + {item.patients.length - 1} {language === 'ms' ? 'pesakit lain' : 'other patients'}
                          </span>
                        )}
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-subtle/50 p-2.5 rounded-lg border border-border-default">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-text-muted block">{language === 'ms' ? 'Tarikh & Masa' : 'Date & Time'}</span>
                        <span className="text-text-primary font-medium">{formatDate(new Date(item.tarikh_perjalanan))} • {item.masa_berlepas}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-text-muted block">{language === 'ms' ? 'Kenderaan' : 'Vehicle'}</span>
                        <span className="text-text-primary font-mono font-medium">{item.no_pendaftaran}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        onClick={() => navigate(`/crossborder/detail/${item.id}`)}
                        variant="outline"
                        size="sm"
                        className="w-full min-h-[44px] border-border-default text-text-primary hover:bg-subtle rounded-xl text-xs font-semibold"
                      >
                        {language === 'ms' ? 'Lihat Butiran Permohonan' : 'View Transfer Details'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card className="bg-surface border border-border-default shadow-xs rounded-xl p-5 sm:p-6">
            <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {language === 'ms' ? 'Rujukan Sempadan Brunei' : 'Brunei Transit Regulations'}
            </h2>
            <div className="text-sm text-text-secondary space-y-3 leading-relaxed">
              <p>
                {language === 'ms' 
                  ? 'Rujukan kecemasan merentasi pos sempadan Malaysia-Brunei bagi pesakit Hospital Lawas memerlukan kelengkapan borang:'
                  : 'Emergency patient transit through Brunei border checkpoints (Lawas - Limbang corridor) requires:'}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-muted">
                <li>{language === 'ms' ? 'Borang Transfer Pesakit Merentasi Sempadan rasmi bercop basah hospital.' : 'Official MOH Cross-Border Patient Transfer Authorization with official hospital seal.'}</li>
                <li>{language === 'ms' ? 'Surat Pelepasan Imigresen bertandatangan Pengarah Hospital Lawas.' : 'Immigration Clearance Letter signed by the Hospital Director.'}</li>
                <li>{language === 'ms' ? 'Pasport / Dokumen perjalanan fizikal bagi semua pengiring dan pesakit.' : 'Valid Passports / Border Crossing Passes for all escorts, drivers, and patients.'}</li>
              </ul>
              <p className="text-xs text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                {language === 'ms' 
                  ? 'Sila pastikan data perjalanan (No Pasport/IC) adalah tepat untuk mengelakkan kelewatan di pintu kawalan sempadan.'
                  : 'Please ensure all travel identifiers (Passport/IC Numbers) are accurate to prevent transit delays at checkpoint posts.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CrossborderDashboardPage;
