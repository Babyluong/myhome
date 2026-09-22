// src/modules/mykunci/pages/KunciPolicyPage.tsx
import React, { useState } from 'react'
import { 
  ScrollText, 
  ShieldAlert, 
  FileText, 
  Clipboard, 
  Check, 
  Key, 
  Lock, 
  AlertTriangle,
  ClipboardList
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'

export const KunciPolicyPage: React.FC = () => {
  const toast = useToast()
  const { language } = useLanguage()
  const [copied, setCopied] = useState(false)
  
  // Incident Report form state
  const [lostKeyNo, setLostKeyNo] = useState('')
  const [lostKeyName, setLostKeyName] = useState('')
  const [lostDate, setLostDate] = useState('')
  const [lostOfficer, setLostOfficer] = useState('')
  const [lostDescription, setLostDescription] = useState('')

  const handleCopyReport = () => {
    const reportText = `
REFERENCE: MOH/JKNS/KEY-MGMT/HOSP-1/2026/L-09
DATE: ${new Date().toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-GB')}

TO: 
Head of Hospital Security & Hospital Director
Hospital Operation Management Ecosystem (HOME)

OFFICIAL INCIDENT REPORT: LOSS OF GOVERNMENT PHYSICAL KEY
---------------------------------------------------------

Report Serial: L-KEY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}
Incident Date: ${lostDate ? new Date(lostDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-GB') : '________'}
Reporting Officer: ${lostOfficer || '________________'}
Designation: Appointed Key Custodian / Departmental Officer

1. DETAILS OF MISSING / UNACCOUNTED KEY:
   - Key Identification Code: ${lostKeyNo || 'E.g., KUNCI-PH-LOG-01'}
   - Key Name & Facility: ${lostKeyName || 'E.g., Pharmacy Logistics Main Store Master Key'}

2. INCIDENT CHRONOLOGY & CAUSE:
   - Brief statement: ${lostDescription || 'Detail the sequence of events regarding how the physical key was misplaced/unaccounted for...'}

3. IMMEDIATE MITIGATION ACTIONS TAKEN (MOH SECURITY SLA MANDATES):
   [x] Immediate notification to Head of Department & Hospital Security Unit (within 12-hour SLA).
   [ ] Formal Royal Malaysia Police (PDRM) report lodged (24-hour SLA) - Police Report No: ________________
   [ ] Immediate replacement of door cylinder padlock / core lock (compromised lock decommissioned).
   [ ] Emergency duplicate key in sealed envelope verified and retrieved from administrative safe.

Reporting Officer,

____________________________
(Name: ${lostOfficer || '________________'} )
Designation: _____________________
`
    navigator.clipboard.writeText(reportText)
    setCopied(true)
    toast.success(language === 'ms' ? 'Deraf laporan kehilangan telah disalin ke papan klip' : 'Incident report draft copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ScrollText className="w-7 h-7 text-amber-500" />
          {language === 'ms' ? 'Rujukan Polisi Pengurusan Kunci KKM' : 'MOH Physical Key Management & Security Policy'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {language === 'ms' 
            ? 'Ringkasan garis panduan keselamatan fizikal anak kunci jabatan KKM dan Jabatan Kesihatan Negeri Sarawak'
            : 'Operational physical security directives, key custodian responsibilities, and emergency loss protocols'}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Policies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Kawalan Am */}
          <Card className="rounded-xl shadow-soft bg-white border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                {language === 'ms' ? '1. Kawalan Am & Tanggungjawab Custodian' : '1. General Key Custody & Custodian Responsibilities'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                {language === 'ms' 
                  ? 'Mengikut Buku Panduan Arahan Keselamatan Kerajaan (Bab Keselamatan Fizikal), anak kunci dan ibu kunci merupakan aset keselamatan kerajaan berisiko tinggi.'
                  : 'In accordance with the Government Security Directives (Physical Security Chapter), keys and padlocks are high-risk institutional security assets.'}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>{language === 'ms' ? 'Buku Daftar Kunci' : 'Master Key Registry'}</strong>: {language === 'ms' ? 'Setiap jabatan wajib mengekalkan daftar induk bagi mencatatkan nama kunci, nombor siri, dan senarai pemegang kunci yang sah.' : 'Each hospital department must maintain a synchronized master registry logging serial codes, locations, and authorized personnel.'}
                </li>
                <li>
                  <strong>{language === 'ms' ? 'Larangan Membawa Balik' : 'Prohibition on Removing Keys Offsite'}</strong>: {language === 'ms' ? 'Kakitangan dilarang sama sekali membawa balik kunci premis KKM ke rumah. Semua kunci hendaklah diserahkan semula ke Peti Kunci Utama sebelum pulang.' : 'Hospital staff are strictly prohibited from taking government facility keys home. All keys must be returned to the Key Cabinet at shift end.'}
                </li>
                <li>
                  <strong>{language === 'ms' ? 'Larangan Duplikasi Sendiri' : 'Unsanctioned Duplication Forbidden'}</strong>: {language === 'ms' ? 'Penduaan kunci tanpa kebenaran bertulis daripada Pengarah Hospital adalah satu Kesalahan Tatatertib Serius.' : 'Duplicating keys without written approval from the Hospital Director constitutes a severe disciplinary offense.'}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Narcotic DDA Storage */}
          <Card className="rounded-xl shadow-soft bg-white border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-500" />
                {language === 'ms' ? '2. Peti Dadah Kawalan (Dangerous Drugs Act / DDA Cabinet)' : '2. Controlled Dangerous Drugs (DDA) Cabinet Protocols'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                {language === 'ms' 
                  ? 'Kunci peti dadah kawalan (DDA) dan racun terkawal Kategori A mempunyai syarat kawalan keselamatan tambahan:'
                  : 'Keys to dangerous drugs cabinets (DDA) and poison schedule storage units are subject to mandatory dual-custody controls:'}
              </p>
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-xs text-rose-800">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong>{language === 'ms' ? 'Polisi Double-Custody (Dua Pegawai):' : 'Double-Custody (Dual-Officer) Co-signing Protocol:'}</strong>
                  <ul className="list-disc pl-4 mt-1.5 space-y-1.5 leading-relaxed">
                    <li>{language === 'ms' ? 'Peminjaman kunci peti DDA mestilah dilakukan oleh sekurang-kurangnya dua pegawai berasingan (Peminjam dan Saksi/Pegawai Kedua).' : 'Check-out of DDA keys must be executed by at least two distinct authorized officers (Borrower and Witness).'}</li>
                    <li>{language === 'ms' ? 'Saksi mesti mengesahkan tujuan peminjaman dan menyaksikan pengeluaran ubat kawalan tersebut dari peti besi dadah kawalan.' : 'The co-signing witness must confirm the therapeutic purpose and oversee drug retrieval.'}</li>
                    <li>{language === 'ms' ? 'Kedua-dua nama pegawai didaftarkan secara kekal di dalam log transaksi kunci.' : 'Both officers are permanently logged into the cryptographic custody audit trail.'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Kehilangan Kunci SLA */}
          <Card className="rounded-xl shadow-soft bg-white border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {language === 'ms' ? '3. Alur Kerja & SLA Kehilangan Anak Kunci' : '3. Missing Key Emergency Workflow & Response SLA'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                {language === 'ms' 
                  ? 'Sekiranya kunci fizikal hilang atau disyaki hilang, pegawai bertanggungjawab wajib melaksanakan tindakan berikut mengikut SLA:'
                  : 'If a key is lost or suspected compromised, the designated custodian must execute the following protocol:'}
              </p>
              <div className="relative border-l-2 border-slate-200 pl-4 ml-2 space-y-4 py-2">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 bg-amber-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold text-slate-800 text-xs">{language === 'ms' ? 'Lapor Segera (SLA: 12 Jam)' : 'Immediate Internal Notification (SLA: 12 Hours)'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{language === 'ms' ? 'Laporkan secara bertulis kepada Pengarah Hospital dan Unit Keselamatan.' : 'Submit a formal written report to the Hospital Director and Hospital Security.'}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 bg-amber-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold text-slate-800 text-xs">{language === 'ms' ? 'Laporan Polis (SLA: 24 Jam)' : 'Formal Police Report (SLA: 24 Hours)'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{language === 'ms' ? 'Pegawai bertanggungjawab wajib membuat laporan polis rasmi dalam tempoh 24 jam selepas kehilangan dikesan.' : 'The custodian must lodge a formal police report (PDRM) within 24 hours of detected loss.'}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 bg-amber-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">3</div>
                  <h4 className="font-bold text-slate-800 text-xs">{language === 'ms' ? 'Gantian Silinder / Mangga Pintu' : 'Lock Core / Cylinder Replacement'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{language === 'ms' ? 'Bilik/premis tidak dibenarkan dikunci dengan mangga yang sama. Mangga pintu/padlock baharu hendaklah dipasang dengan kadar segera.' : 'The affected room may not remain locked with the old compromised core. A new lock cylinder must be installed immediately.'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Lost Key Template Generator */}
        <div>
          <Card className="rounded-xl shadow-soft bg-white border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                {language === 'ms' ? 'Deraf Laporan Kehilangan Kunci' : 'Lost Key Incident Report Generator'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ms' 
                  ? 'Gunakan borang pantas ini untuk menjana draf rasmi Laporan Kehilangan Anak Kunci KKM untuk diserahkan kepada Unit Keselamatan Hospital.'
                  : 'Use this generator to assemble an official MOH Key Loss Incident Report to submit to Hospital Security.'}
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                    {language === 'ms' ? 'Kod Kunci Hilang *' : 'Missing Key Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., KUNCI-PH-LOG-01"
                    value={lostKeyNo}
                    onChange={(e) => setLostKeyNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                    {language === 'ms' ? 'Nama Kunci *' : 'Key Description *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ms' ? 'E.g., Kunci Stor Farmasi A' : 'E.g., Pharmacy Logistics Store A Key'}
                    value={lostKeyName}
                    onChange={(e) => setLostKeyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                      {language === 'ms' ? 'Tarikh Kehilangan *' : 'Incident Date *'}
                    </label>
                    <input
                      type="date"
                      required
                      value={lostDate}
                      onChange={(e) => setLostDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                      {language === 'ms' ? 'Nama Melapor *' : 'Reporting Officer *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'ms' ? 'Nama Anda' : 'Your Name'}
                      value={lostOfficer}
                      onChange={(e) => setLostOfficer(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                    {language === 'ms' ? 'Sebab / Kronologi Kehilangan *' : 'Incident Statement / Chronology *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={language === 'ms' ? 'E.g., Kunci kali terakhir dikesan berada di atas meja kaunter stor farmasi pada jam 5 petang...' : 'E.g., The key was last observed on the logistics counter desk at 17:00 during shift handover...'}
                    value={lostDescription}
                    onChange={(e) => setLostDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <Button
                  onClick={handleCopyReport}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-2.5 font-bold flex items-center justify-center gap-2 text-xs shadow-soft mt-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4" />}
                  {copied 
                    ? (language === 'ms' ? 'Berjaya Disalin' : 'Copied to Clipboard') 
                    : (language === 'ms' ? 'Jana & Salin Laporan' : 'Generate & Copy Report')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default KunciPolicyPage
