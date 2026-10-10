// src/modules/mykunci/pages/KunciRegistryPage.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { 
  Key, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Building2, 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  QrCode
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { 
  getKunciDaftar, 
  addKunci, 
  updateKunci, 
  deleteKunci 
} from '@/modules/mykunci/services/kunciService'
import type { KunciDaftar, KunciJenis, KunciKawalan, KunciStatus, SampulStatus } from '@/shared/types/mykunci'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge, 
  Modal 
} from '@/components/ui'
import QRCode from 'qrcode'

// Mock list of departments matching database seed values
const MOCK_DEPARTMENTS = [
  { id: '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880', department_name: 'Farmasi Logistik', department_code: 'PH-LOG' },
  { id: '0c6c6f1b-d3b6-4779-91c3-536956858fca', department_name: 'Farmasi Klinik Pakar', department_code: 'PH-CLIN' },
  { id: 'dept-3', department_name: 'Klinik Pakar Pesakit Luar', department_code: 'OPD' },
  { id: 'dept-4', department_name: 'Jabatan Kecemasan & Trauma', department_code: 'ED' },
  { id: 'dept-5', department_name: 'Pejabat Pentadbiran Utama', department_code: 'ADMIN' }
];

export const KunciRegistryPage: React.FC = () => {
  const { language } = useLanguage()
  const loggedUser = useAuthStore((state) => state.user)
  const hospitalId = loggedUser?.hospital_id || 'hosp-1'
  const toast = useToast()
  
  const [keys, setKeys] = useState<KunciDaftar[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingKeyId, setEditingKeyId] = useState('')

  // QR Code display states
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedQrKey, setSelectedQrKey] = useState<KunciDaftar | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

  // Form states
  const [kodKunci, setKodKunci] = useState('')
  const [namaKunci, setNamaKunci] = useState('')
  const [deptId, setDeptId] = useState('')
  const [lokasiFizikal, setLokasiFizikal] = useState('')
  const [jenisKunci, setJenisKunci] = useState<KunciJenis>('room')
  const [tahapKawalan, setTahapKawalan] = useState<KunciKawalan>('normal')
  const [status, setStatus] = useState<KunciStatus>('available')
  const [nomborPeti, setNomborPeti] = useState('')
  const [statusSampul, setStatusSampul] = useState<SampulStatus>('not_applicable')
  const [penjagaId, setPenjagaId] = useState('')

  const loadKeys = async () => {
    setLoading(true)
    try {
      const res = await getKunciDaftar()
      setKeys(res.data || [])
    } catch (err) {
      console.error('Failed to fetch keys', err)
      toast.error('Failed to load key registry records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKeys()
  }, [])

  const handleOpenAddModal = () => {
    setIsEditing(false)
    setEditingKeyId('')
    setKodKunci('')
    setNamaKunci('')
    setDeptId(MOCK_DEPARTMENTS[0].id)
    setLokasiFizikal('')
    setJenisKunci('room')
    setTahapKawalan('normal')
    setStatus('available')
    setNomborPeti('')
    setStatusSampul('not_applicable')
    setPenjagaId(loggedUser?.id || 'user-1')
    setModalOpen(true)
  }

  const handleOpenEditModal = (key: KunciDaftar) => {
    const pw = window.prompt('Please enter security password to edit key record:')
    if (pw !== ' F@rmasi.2016 ' && pw?.trim() !== 'F@rmasi.2016') {
      toast.error('Incorrect password! Action cancelled.')
      return
    }
    setIsEditing(true)
    setEditingKeyId(key.id)
    setKodKunci(key.kod_kunci)
    setNamaKunci(key.nama_kunci)
    setDeptId(key.department_id)
    setLokasiFizikal(key.lokasi_fizikal)
    setJenisKunci(key.jenis_kunci)
    setTahapKawalan(key.tahap_kawalan)
    setStatus(key.status)
    setNomborPeti(key.nombor_peti || '')
    setStatusSampul(key.status_sampul)
    setPenjagaId(key.penjaga_id || '')
    setModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!kodKunci || !namaKunci || !deptId || !lokasiFizikal) {
      toast.error('Please complete all mandatory fields!')
      return
    }

    const payload = {
      kod_kunci: kodKunci.trim().toUpperCase(),
      nama_kunci: namaKunci.trim(),
      department_id: deptId,
      lokasi_fizikal: lokasiFizikal.trim(),
      jenis_kunci: jenisKunci,
      tahap_kawalan: tahapKawalan,
      status: status,
      nombor_peti: nomborPeti.trim() || undefined,
      status_sampul: statusSampul,
      penjaga_id: penjagaId || undefined,
      hospital_id: hospitalId
    }

    try {
      if (isEditing && editingKeyId) {
        const res = await updateKunci(editingKeyId, payload)
        if (res.error) throw new Error(res.error)
        toast.success('Key record updated successfully')
      } else {
        const res = await addKunci(payload)
        if (res.error) throw new Error(res.error)
        toast.success('New key registered successfully')
      }
      setModalOpen(false)
      loadKeys()
    } catch (err: any) {
      toast.error(`Error saving record: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    const pw = window.prompt('Please enter security password to delete key record:')
    if (pw !== ' F@rmasi.2016 ' && pw?.trim() !== 'F@rmasi.2016') {
      toast.error('Incorrect password! Action cancelled.')
      return
    }
    if (!window.confirm('Are you sure you want to delete this key from the master registry?')) return

    try {
      const res = await deleteKunci(id)
      if (res.error) throw new Error(res.error)
      toast.success('Key deleted from master registry')
      loadKeys()
    } catch (err: any) {
      toast.error(`Failed to delete key: ${err.message}`)
    }
  }

  const handleOpenQrModal = async (key: KunciDaftar) => {
    setSelectedQrKey(key)
    try {
      // Generate a client-side offline-safe QR code containing the kod_kunci
      const url = await QRCode.toDataURL(key.kod_kunci, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        }
      })
      setQrDataUrl(url)
      setQrModalOpen(true)
    } catch (err) {
      console.error('Failed to generate QR Code', err)
      toast.error('Failed to generate QR Code')
    }
  }

  const handlePrintQr = () => {
    if (!selectedQrKey || !qrDataUrl) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Popup blocker prevented printing!')
      return
    }

    const deptName = MOCK_DEPARTMENTS.find(d => d.id === selectedQrKey.department_id)?.department_name || 'Others'
    const securityLabel = selectedQrKey.tahap_kawalan === 'high' 
      ? '⚠️ HIGH SECURITY (DDA)'
      : 'GENERAL ACCESS'
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Key Label - ${selectedQrKey.kod_kunci}</title>
        <style>
          @page {
            size: 80mm 50mm;
            margin: 0;
          }
          body {
            font-family: monospace;
            margin: 0;
            padding: 3mm;
            width: 80mm;
            height: 50mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: white;
            color: black;
          }
          .title {
            font-size: 8px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px dashed black;
            width: 100%;
            padding-bottom: 2px;
          }
          .code {
            font-size: 11px;
            font-weight: bold;
            margin-top: 2px;
            margin-bottom: 2px;
            font-family: monospace;
          }
          .qr-img {
            width: 22mm;
            height: 22mm;
            margin-bottom: 2px;
          }
          .meta {
            font-size: 7px;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1.2;
          }
          .security {
            font-size: 6px;
            font-weight: bold;
            margin-top: 2px;
            text-transform: uppercase;
            border-top: 1px dashed black;
            width: 100%;
            padding-top: 2px;
          }
        </style>
      </head>
      <body>
        <div class="title">HOSPITAL LAWAS - MYKUNCI</div>
        <div class="code">${selectedQrKey.kod_kunci}</div>
        <img class="qr-img" src="${qrDataUrl}" />
        <div class="meta"><b>${selectedQrKey.nama_kunci}</b></div>
        <div class="meta">Dept: ${deptName} | Location: ${selectedQrKey.lokasi_fizikal}</div>
        <div class="security">${securityLabel}</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Filter keys list based on UI values
  const filteredKeys = useMemo(() => {
    return keys.filter(k => {
      const matchesSearch = k.nama_kunci.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            k.kod_kunci.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            k.lokasi_fizikal.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDept = !deptFilter || k.department_id === deptFilter
      const matchesLevel = !levelFilter || k.tahap_kawalan === levelFilter
      const matchesStatus = !statusFilter || k.status === statusFilter

      return matchesSearch && matchesDept && matchesLevel && matchesStatus
    })
  }, [keys, searchTerm, deptFilter, levelFilter, statusFilter])

  const getStatusBadge = (status: KunciStatus) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="border-emerald-200 text-emerald-700 bg-emerald-50 font-bold uppercase text-[10px]">
            {language === 'ms' ? 'Tersedia' : 'Available'}
          </Badge>
        )
      case 'borrowed':
        return (
          <Badge className="border-amber-200 text-amber-700 bg-amber-50 font-bold uppercase text-[10px]">
            {language === 'ms' ? 'Dipinjam' : 'Borrowed'}
          </Badge>
        )
      case 'damaged':
        return (
          <Badge className="border-rose-200 text-rose-700 bg-rose-50 font-bold uppercase text-[10px]">
            Damaged
          </Badge>
        )
      case 'lost':
        return (
          <Badge className="border-slate-300 text-slate-700 bg-slate-100 font-bold uppercase text-[10px]">
            Lost
          </Badge>
        )
      default:
        return <Badge className="border-slate-200 text-slate-600 bg-slate-50">{status}</Badge>
    }
  }

  const getKawalanBadge = (level: KunciKawalan) => {
    if (level === 'high') {
      return (
        <Badge className="border-rose-300 text-rose-700 bg-rose-50/50 flex items-center gap-1 w-fit font-bold text-[10px]">
          <Lock className="w-3 h-3 text-rose-600" />
          DDA / High-Security
        </Badge>
      )
    }
    return (
      <Badge variant="gray" className="text-[10px]">
        Normal Control
      </Badge>
    )
  }

  const getSampulBadge = (status: SampulStatus) => {
    switch (status) {
      case 'sealed':
        return (
          <Badge className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px]">
            Intact (Sealed)
          </Badge>
        )
      case 'broken':
        return (
          <Badge className="border-rose-200 text-rose-700 bg-rose-50 text-[10px] animate-pulse">
            Broken / Opened
          </Badge>
        )
      default:
        return <span className="text-slate-400 text-xs">-</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-amber-500" />
            Key Registry & Department Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Master registry of keys, padlocks, storage cabinets, and security clearance levels
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-soft font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Register New Key
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="rounded-xl shadow-soft bg-white border border-slate-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search key name, code, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            >
              <option value="">All Departments</option>
              {MOCK_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            >
              <option value="">All Clearance Levels</option>
              <option value="normal">Normal Control</option>
              <option value="high">High Security (DDA Cabinet)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
              <option value="damaged">Damaged</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Registry Table Card */}
      <Card className="rounded-2xl shadow-soft bg-white border border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Loading key registry...
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <span>
                No key records found. Please try another search term or register a new key.
              </span>
            </div>
          ) : (
            <>
              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Key Code</th>
                      <th className="p-4">Key Name / Location</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Security Level</th>
                      <th className="p-4">Key Box No.</th>
                      <th className="p-4">Sealed Envelope</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredKeys.map((key) => {
                      const deptName = MOCK_DEPARTMENTS.find(d => d.id === key.department_id)?.department_name || 'Others'
                      return (
                        <tr key={key.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-700">
                            {key.kod_kunci}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{key.nama_kunci}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{key.lokasi_fizikal}</div>
                          </td>
                          <td className="p-4 text-slate-700 font-medium">
                            {deptName}
                          </td>
                          <td className="p-4">
                            {getKawalanBadge(key.tahap_kawalan)}
                          </td>
                          <td className="p-4 font-mono text-xs">
                            {key.nombor_peti || <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-4">
                            {getSampulBadge(key.status_sampul)}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(key.status)}
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenQrModal(key)}
                              className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 p-1"
                              title="View/Print QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(key)}
                              className="text-slate-400 hover:text-amber-500 hover:bg-amber-50 p-1"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(key.id)}
                              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: High-End Native Cards (Zero Horizontal Scroll!) */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredKeys.map((key) => {
                  const deptName = MOCK_DEPARTMENTS.find(d => d.id === key.department_id)?.department_name || 'Others'
                  return (
                    <div key={key.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-black text-slate-800 text-sm tracking-wider block">
                            {key.kod_kunci}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                            {key.nama_kunci}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {getStatusBadge(key.status)}
                          {getKawalanBadge(key.tahap_kawalan)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Location
                          </span>
                          <span className="font-medium text-slate-700 truncate block">
                            {key.lokasi_fizikal || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Department
                          </span>
                          <span className="font-medium text-slate-700 truncate block">
                            {deptName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Box No.
                          </span>
                          <span className="font-mono font-bold text-slate-700">
                            {key.nombor_peti || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Envelope
                          </span>
                          {getSampulBadge(key.status_sampul)}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleOpenQrModal(key)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                          <span>QR</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(key)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          isEditing 
            ? 'Edit Key Record Details'
            : 'Register New Master Key'
        }
        size="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Key Code *
              </label>
              <input
                type="text"
                required
                placeholder="E.g., KUNCI-PH-LOG-01"
                value={kodKunci}
                onChange={(e) => setKodKunci(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Key Name *
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Pharmacy Logistics Store A Key"
                value={namaKunci}
                onChange={(e) => setNamaKunci(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Department Owner *
              </label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                {MOCK_DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Physical Door / Cabinet Location *
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Vaccine Cold Room Main Entrance"
                value={lokasiFizikal}
                onChange={(e) => setLokasiFizikal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Key Type
              </label>
              <select
                value={jenisKunci}
                onChange={(e) => setJenisKunci(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="room">Room / Facility Door</option>
                <option value="cabinet">Drawer / Storage Cabinet</option>
                <option value="cabinet_dda">Dangerous Drugs Cabinet (DDA)</option>
                <option value="vehicle">Vehicle / Ambulance</option>
                <option value="other">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Security Clearance Level
              </label>
              <select
                value={tahapKawalan}
                onChange={(e) => {
                  setTahapKawalan(e.target.value as any)
                  if (e.target.value === 'high' && jenisKunci === 'room') {
                    setStatusSampul('sealed')
                  } else {
                    setStatusSampul('not_applicable')
                  }
                }}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="normal">Normal Control</option>
                <option value="high">High Security (Witness Required)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Key Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="available">Available (In Cabinet)</option>
                <option value="borrowed">Borrowed (Checked Out)</option>
                <option value="damaged">Damaged (Bent / Broken)</option>
                <option value="lost">Lost / Reported Incident</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Key Box / Storage Cabinet Number
              </label>
              <input
                type="text"
                placeholder="E.g., Peti Kunci Utama A-12"
                value={nomborPeti}
                onChange={(e) => setNomborPeti(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                Sealed Envelope Status (Duplicate Keys Only)
              </label>
              <select
                value={statusSampul}
                onChange={(e) => setStatusSampul(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="not_applicable">Not Applicable (Primary Key)</option>
                <option value="sealed">Intact (Sealed Envelope)</option>
                <option value="broken">Broken / Opened Envelope</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setModalOpen(false)}
              className="border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 border rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-xl shadow-soft"
            >
              Save Key Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR CODE MODAL */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Physical Key QR Code Label"
        size="md"
      >
        {selectedQrKey && (
          <div className="space-y-6 pt-2 pb-1 text-slate-800">
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                Hospital Lawas - MyKunci
              </span>
              <span className="text-sm font-bold font-mono border border-slate-300 px-3 py-1 bg-white rounded-lg shadow-sm mb-4">
                {selectedQrKey.kod_kunci}
              </span>
              
              {qrDataUrl ? (
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-md">
                  <img src={qrDataUrl} alt={`QR Code for ${selectedQrKey.kod_kunci}`} className="w-48 h-48 select-none" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-200/50 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
              
              <span className="text-xs font-bold text-slate-800 mt-4 max-w-full truncate">
                {selectedQrKey.nama_kunci}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold mt-1">
                Location: {selectedQrKey.lokasi_fizikal}
              </span>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-100/70 rounded-2xl text-[11px] text-amber-700 leading-relaxed font-semibold">
              💡 This QR label can be attached to the physical key tag. Use the print button below to print an 80mm x 50mm sticker label to affix onto the key tag or cabinet.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 border rounded-xl"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handlePrintQr}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-xl shadow-soft flex items-center gap-1.5"
              >
                Print Key Label
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default KunciRegistryPage
