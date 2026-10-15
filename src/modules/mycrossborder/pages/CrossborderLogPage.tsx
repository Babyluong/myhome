import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Globe, 
  Eye
} from 'lucide-react';
import { useToast } from '@/stores/toastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { getCrossborderTransfers } from '../services/crossborderService';
import type { CrossborderTransfer } from '@/shared/types/mycrossborder';
import { Card, Button, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils';

export const CrossborderLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const toast = useToast();

  const [transfers, setTransfers] = useState<CrossborderTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getCrossborderTransfers();
      setTransfers(res.data || []);
    } catch (err) {
      console.error('Failed to load transfers log', err);
      toast.error(
        language === 'ms' ? 'Ralat' : 'Error',
        language === 'ms' ? 'Gagal memuatkan rekod log rentasi sempadan' : 'Failed to load cross-border transfer log records'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="border-border-default text-text-secondary bg-subtle/50">{language === 'ms' ? 'Draf' : 'Draft'}</Badge>;
      case 'submitted':
        return <Badge className="border-amber-500/20 text-amber-400 bg-amber-500/10">{language === 'ms' ? 'Menunggu Kelulusan' : 'Pending Approval'}</Badge>;
      case 'approved':
        return <Badge className="border-emerald-500/20 text-emerald-400 bg-emerald-500/10">{language === 'ms' ? 'Diluluskan' : 'Approved'}</Badge>;
      case 'completed':
        return <Badge className="border-blue-500/20 text-blue-400 bg-blue-500/10">{language === 'ms' ? 'Selesai' : 'Completed'}</Badge>;
      case 'cancelled':
        return <Badge className="border-red-200 text-red-800 bg-red-50">{language === 'ms' ? 'Dibatalkan' : 'Cancelled'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filtered and searched data
  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      // 1. Search term match (Ref, Patient Name, Vehicle No)
      const matchesSearch = 
        item.no_rujukan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.no_pendaftaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.patients || []).some(p => p.nama.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Status match
      const matchesStatus = statusFilter === '' || item.status === statusFilter;

      // 3. Date range match
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(item.tarikh_perjalanan) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(item.tarikh_perjalanan) <= new Date(endDate);
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transfers, searchTerm, statusFilter, startDate, endDate]);

  return (
    <div className="space-y-6 text-text-primary">
      {/* Back button */}
      <div>
        <button 
          onClick={() => navigate('/crossborder/dashboard')}
          className="flex items-center gap-2 text-text-muted hover:text-text-secondary transition-colors group text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'ms' ? 'Kembali ke Papan Pemuka' : 'Back to Dashboard'}</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Globe className="w-7 h-7 text-blue-600" />
          {language === 'ms' ? 'Log & Sejarah Rentasi Sempadan' : 'Cross-Border Transfer History & Clearance Log'}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {language === 'ms' 
            ? 'Senarai lengkap permohonan, sejarah pelepasan pos kawalan imigresen dan rekod pesakit Hospital Lawas.'
            : 'Comprehensive historical archive of Malaysia-Brunei patient transit authorizations and checkpoint logs.'}
        </p>
      </div>

      {/* Filter panel */}
      <Card className="bg-surface border border-border-default shadow-sm rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <label className="text-xs font-semibold text-text-muted block mb-1">
              {language === 'ms' ? 'Search Requisitions' : 'Search Applications'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ms' ? 'No Rujukan / Pesakit / No Plat' : 'Ref No / Patient / Vehicle Plate'}
                className="w-full bg-subtle/50 border border-border-default rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-colors"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              {language === 'ms' ? 'Status' : 'Status'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-subtle/50 border border-border-default rounded-xl p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-colors"
            >
              <option value="">{language === 'ms' ? 'Semua Status' : 'All Statuses'}</option>
              <option value="draft">{language === 'ms' ? 'Draf' : 'Draft'}</option>
              <option value="submitted">{language === 'ms' ? 'Menunggu Kelulusan' : 'Pending Approval'}</option>
              <option value="approved">{language === 'ms' ? 'Diluluskan' : 'Approved'}</option>
              <option value="completed">{language === 'ms' ? 'Selesai' : 'Completed'}</option>
              <option value="cancelled">{language === 'ms' ? 'Dibatalkan' : 'Cancelled'}</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              {language === 'ms' ? 'From Date' : 'From Date'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-subtle/50 border border-border-default rounded-xl p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-colors"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              {language === 'ms' ? 'To Date' : 'To Date'}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-subtle/50 border border-border-default rounded-xl p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-surface transition-colors"
            />
          </div>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card className="bg-surface border border-border-default shadow-sm rounded-xl p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            {language === 'ms' ? 'Memuatkan data...' : 'Loading transfer records...'}
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            {language === 'ms' ? 'No log records match the search.' : 'No transfer records match your search criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-border-subtle rounded-xl">
            <table className="w-full text-sm text-left text-text-muted">
              <thead className="text-xs uppercase bg-subtle/50 text-text-muted border-b border-border-default">
                <tr>
                  <th scope="col" className="px-4 py-3">{language === 'ms' ? 'No Rujukan' : 'Reference No'}</th>
                  <th scope="col" className="px-4 py-3">{language === 'ms' ? 'Tarikh' : 'Date'}</th>
                  <th scope="col" className="px-4 py-3">{language === 'ms' ? 'Masa' : 'Time'}</th>
                  <th scope="col" className="px-4 py-3">{language === 'ms' ? 'Pesakit Utama' : 'Primary Patient'}</th>
                  <th scope="col" className="px-4 py-3">{language === 'ms' ? 'No Plat Ambulans' : 'Ambulance Plate'}</th>
                  <th scope="col" className="px-4 py-3">{language === 'ms' ? 'No Surat Kebenaran' : 'Clearance Letter Ref'}</th>
                  <th scope="col" className="px-4 py-3">{language === 'ms' ? 'Status' : 'Status'}</th>
                  <th scope="col" className="px-4 py-3 text-right">{language === 'ms' ? 'Tindakan' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredTransfers.map((item) => (
                  <tr key={item.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs font-semibold text-blue-600">
                      {item.no_rujukan}
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {formatDate(new Date(item.tarikh_perjalanan))}
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      {item.masa_berlepas}
                    </td>
                    <td className="px-4 py-4">
                      {item.patients && item.patients.length > 0 ? (
                        <div>
                          <div className="font-semibold text-text-primary">{item.patients[0].nama}</div>
                          {item.patients.length > 1 && (
                            <div className="text-xs text-slate-400">
                              + {item.patients.length - 1} {language === 'ms' ? 'pesakit lain' : 'other patients'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">{language === 'ms' ? 'Tiada pesakit' : 'No patients'}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-text-muted">
                      {item.no_pendaftaran}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-indigo-600 font-medium">
                      {item.surat_kebenaran_ref || '-'}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        onClick={() => navigate(`/crossborder/detail/${item.id}`)}
                        variant="outline"
                        size="sm"
                        className="border-border-default text-text-secondary hover:bg-subtle rounded-xl text-xs flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {language === 'ms' ? 'Papar' : 'View'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CrossborderLogPage;
