// src/modules/mytransporter/pages/TransporterDriverMonitorPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  Printer, 
  Calendar, 
  Clock, 
  UserCheck, 
  Shield, 
  Activity, 
  MapPin 
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { 
  getDriverActivityReport, 
  getTransporterRoles 
} from '../services/transporterService'
import { getUsers } from '@/services/userService'
import type { UserWithRelations } from '@/shared/types/auth'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input 
} from '@/components/ui'

const TransporterDriverMonitorPage: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const { language } = useLanguage()
  const isEn = language !== 'ms'
  const toast = useToast()

  const [drivers, setDrivers] = useState<UserWithRelations[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Load drivers list
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const userRes = await getUsers({ page: 1, pageSize: 100 })
        const rolesRes = await getTransporterRoles()
        
        if (userRes && userRes.data && rolesRes.data) {
          const rolesMap = rolesRes.data
          // Filter users who have 'transport_driver' role in transporter roles mapping
          const activeDrivers = userRes.data.filter(u => rolesMap[u.id] === 'transport_driver')
          setDrivers(activeDrivers)
          
          if (activeDrivers.length > 0) {
            setSelectedDriverId(activeDrivers[0].id)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadDrivers()
  }, [])

  // Load report data when selection changes
  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedDriverId) return
      setLoading(true)
      try {
        const res = await getDriverActivityReport(selectedDriverId, month, year)
        if (res.data) {
          setReportData(res.data)
        }
      } catch (err: any) {
        toast.error(
          isEn ? 'Failed to Load Records' : 'Gagal Memuatkan Rekod', 
          err.message || (isEn ? 'Please try again.' : 'Sila cuba lagi.')
        )
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [selectedDriverId, month, year])

  // PDF Export
  const handlePrintPDF = () => {
    if (!reportData) return
    const doc = new jsPDF()

    // Title / Header
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('MINISTRY OF HEALTH MALAYSIA', 105, 20, { align: 'center' })
    doc.setFontSize(13)
    doc.text(`MONTHLY DRIVER SUPERVISION & ACTIVITY REPORT`, 105, 28, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`DRIVER: ${reportData.driverName.toUpperCase()}`, 105, 34, { align: 'center' })
    doc.text(`PERIOD: ${month}/${year}`, 105, 40, { align: 'center' })

    doc.setLineWidth(0.5)
    doc.line(15, 45, 195, 45)

    // Summary statistics
    doc.text(`Total Completed Trips: ${reportData.totalTrips}`, 15, 52)
    doc.text(`Total Driving Time (Estimated): ${reportData.totalDurationHours} hours`, 15, 58)

    // Table rows
    const tableHeaders = [['Date', 'Ref No', 'Vehicle Plate', 'Vehicle Model', 'Destination', 'Duration (Hours)']]
    const tableBody = reportData.trips.map((t: any) => [
      t.date,
      t.referenceNo,
      t.vehicleNo,
      t.vehicleModel,
      t.destination,
      `${t.durationHours} hrs`
    ])

    autoTable(doc, {
      startY: 64,
      head: tableHeaders,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(9)
    doc.text('Prepared By:', 25, finalY)
    doc.text('______________________________', 25, finalY + 15)
    doc.text('Administrative Supervisor Signature', 25, finalY + 20)

    doc.text('Approved & Endorsed By:', 135, finalY)
    doc.text('______________________________', 135, finalY + 15)
    doc.text('Hospital Director Signature', 135, finalY + 20)

    doc.save(`Driver_Activity_Report_${reportData.driverName.replace(/\s+/g, '_')}_${month}_${year}.pdf`)
    toast.success(
      isEn ? 'PDF Downloaded' : 'PDF Dimuat Turun', 
      isEn ? `Activity report for ${reportData.driverName} generated.` : `Laporan aktiviti ${reportData.driverName} berjaya dijana.`
    )
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-600" />
            {isEn ? 'Driver Supervision & Activity Monitoring' : 'Driver Activity & Supervision'}
          </h1>
          <p className="text-text-muted text-sm">
            {isEn 
              ? 'Supervise working hours, completed missions, and vehicle assignments across hospital duty drivers.' 
              : 'Pantau jumlah jam bekerja, trip selesai, dan pengagihan kenderaan bagi setiap pemandu bertugas di hospital.'}
          </p>
        </div>
        <Button 
          disabled={!reportData || reportData.trips.length === 0}
          onClick={handlePrintPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{isEn ? 'Print Activity Report' : 'Print Activity Report'}</span>
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border border-border-default shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Driver Selector */}
          <div className="space-y-1">
            <label className="text-xxs font-bold text-text-secondary font-bold uppercase tracking-wider">
              {isEn ? 'Select Driver' : 'Select Driver'}
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-subtle/50 border border-border-default hover:border-border-default rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
            >
              {drivers.length === 0 ? (
                <option value="">{isEn ? 'No registered drivers' : 'Tiada pemandu berdaftar'}</option>
              ) : (
                drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.employee_id})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Month */}
          <div className="space-y-1">
            <label className="text-xxs font-bold text-text-secondary font-bold uppercase tracking-wider">
              {isEn ? 'Month' : 'Bulan'}
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="w-full bg-subtle/50 border border-border-default hover:border-border-default rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>
                  {new Date(2026, m - 1, 1).toLocaleString(isEn ? 'en-US' : 'ms-MY', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="space-y-1">
            <label className="text-xxs font-bold text-text-secondary font-bold uppercase tracking-wider">
              {isEn ? 'Year' : 'Tahun'}
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full bg-subtle/50 border border-border-default hover:border-border-default rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full bg-subtle/50 border border-border-default rounded-xl p-2 text-center text-xs font-bold text-text-muted">
              {isEn ? 'Total:' : 'Jumlah:'} {reportData?.totalDurationHours || 0} {isEn ? 'hours active' : 'jam aktif'}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Driver activity list */}
      <Card className="border border-border-default shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-text-muted font-medium animate-pulse">
              {isEn ? 'Loading driver activities...' : 'Memuatkan aktiviti pemandu...'}
            </div>
          ) : !reportData || reportData.trips.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              {isEn ? 'No trip history for this driver during the selected period.' : 'Tiada sejarah tugasan perjalanan bagi pemandu ini dalam tempoh tersebut.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-subtle/50 border-b border-border-subtle text-xs font-semibold text-text-muted uppercase tracking-wider">
                    <th className="px-6 py-4">{isEn ? 'Date' : 'Tarikh'}</th>
                    <th className="px-6 py-4">{isEn ? 'Ref No' : 'No. Rujukan'}</th>
                    <th className="px-6 py-4">{isEn ? 'Assigned Vehicle' : 'Kenderaan Digunakan'}</th>
                    <th className="px-6 py-4">{isEn ? 'Destination' : 'Destinasi'}</th>
                    <th className="px-6 py-4">{isEn ? 'Estimated Duration' : 'Anggaran Tempoh'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-sm text-text-secondary">
                  {reportData.trips.map((trip: any, idx: number) => (
                    <tr key={idx} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-text-muted">{trip.date}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600 text-xs">{trip.referenceNo}</td>
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-text-primary">{trip.vehicleNo}</div>
                        <p className="text-xxs text-slate-400 font-semibold">{trip.vehicleModel}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-text-secondary font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {trip.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-indigo-600 tabular-nums">
                        {trip.durationHours} {isEn ? 'hrs' : 'jam'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

export default TransporterDriverMonitorPage
