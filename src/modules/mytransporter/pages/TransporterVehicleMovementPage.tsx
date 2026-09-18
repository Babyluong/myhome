// src/modules/mytransporter/pages/TransporterVehicleMovementPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Car, 
  Printer, 
  Search, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Clock, 
  User, 
  Activity 
} from 'lucide-react'
import { Ambulance } from '../components/AmbulanceIcon'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { useLanguage } from '@/shared/contexts/LanguageContext'
import { 
  getTransporterRoles, 
  getDriverMovementReport 
} from '../services/transporterService'
import { getUsers } from '@/services/userService'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input 
} from '@/components/ui'

const TransporterVehicleMovementPage: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = useAuthStore((state) => state.user)
  const { language } = useLanguage()
  const isEn = language !== 'ms'
  const toast = useToast()

  const [drivers, setDrivers] = useState<any[]>([])
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
          let activeDrivers = userRes.data.filter(u => rolesMap[u.id] === 'transport_driver')
          
          // Fallback: if no active drivers matched, filter by jawatan containing "pemandu" or exact name
          if (activeDrivers.length === 0) {
            activeDrivers = userRes.data.filter(u => 
              u.full_name?.toLowerCase().includes('amri') || 
              (u as any).jawatan?.toLowerCase().includes('pemandu')
            )
          }

          // Safe fallback 2: if still empty, use all users
          if (activeDrivers.length === 0) {
            activeDrivers = userRes.data
          }

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

  // Fetch report when inputs change
  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedDriverId) return
      setLoading(true)
      try {
        const res = await getDriverMovementReport(selectedDriverId, month, year)
        if (res.data) {
          setReportData(res.data)
        }
      } catch (err: any) {
        toast.error(
          isEn ? 'Failed to Load Records' : 'Gagal Memuatkan Rekod', 
          err.message || (isEn ? 'Error while processing movement report.' : 'Ralat semasa memproses laporan.')
        )
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [selectedDriverId, month, year])

  const getBase64ImageFromUrlLocal = async (imageUrl: string): Promise<string | null> => {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.onerror = () => {
          resolve(null)
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Failed to load image:', error)
      return null
    }
  }

  // PDF Export logic
  const handlePrintPDF = async () => {
    if (!reportData) return
    const doc = new jsPDF()
    const pageWidth = 210
    const pageHeight = 297
    const margin = 15

    // Load Logo
    const logoBase64 = await getBase64ImageFromUrlLocal('/512px-Jata_MalaysiaV2.svg.png')

    // --- Helper: Draw Watermark ---
    const drawWatermark = () => {
      if (logoBase64) {
        try {
          doc.saveGraphicsState()
          const GState = (doc as any).GState || (jsPDF as any).GState
          if (GState) {
            doc.setGState(new GState({ opacity: 0.05 }))
          }
          // Center of page (90x90mm)
          doc.addImage(logoBase64, 'PNG', (pageWidth - 90) / 2, (pageHeight - 90) / 2, 90, 90)
          doc.restoreGraphicsState()
        } catch (err) {
          console.error('Error drawing watermark:', err)
        }
      }
    }

    // Draw Watermark first so it is underneath everything
    drawWatermark()

    // 1. Logo & Top Info (Official Malaysian Coat of Arms)
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', margin, 12, 22.5, 18)
    }

    // Header Typography (Official Serif/Times style)
    doc.setFont('times', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text('KEMENTERIAN KESIHATAN MALAYSIA', margin + 26, 17)
    doc.setFontSize(13)
    doc.text('HOSPITAL LAWAS', margin + 26, 22.5)
    
    doc.setFont('times', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text('Jalan Hospital, 98850 Lawas, Sarawak, Malaysia', margin + 26, 27)
    doc.text('Telefon: 085-283781  |  Faks: 085-283782  |  E-mel: hospital.lawas@moh.gov.my', margin + 26, 31.5)

    // Dual Divider Line (Thick & Thin)
    doc.setDrawColor(15, 23, 42)
    doc.setLineWidth(0.8)
    doc.line(margin, 35, pageWidth - margin, 35)
    doc.setLineWidth(0.2)
    doc.line(margin, 36.2, pageWidth - margin, 36.2)

    // Document Title
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text('MONTHLY DRIVER LOGBOOK & VEHICLE MOVEMENT JOURNAL', 105, 45, { align: 'center' })

    // Driver statistics
    doc.setFontSize(10)
    doc.setFont('Helvetica', 'bold')
    doc.text(`DRIVER NAME: ${reportData.driver?.full_name?.toUpperCase() || 'DRIVER'}`, 15, 54)
    doc.text(`PERIOD: ${month}/${year}`, 15, 60)
    doc.text(`TOTAL TRIPS: ${reportData.totalTrips}`, 120, 54)
    doc.text(`TOTAL DISTANCE: ${reportData.totalKm} km`, 120, 60)

    // Table rows
    const tableHeaders = [['Date', 'Ref No', 'Vehicle', 'Destination & Purpose', 'Odo Start', 'Odo End', 'Duration', 'Distance (km)']]
    const tableBody = reportData.trips.map((t: any) => [
      t.date,
      t.referenceNo,
      t.driverName, // Stores vehicle no & model
      `${t.destination} (${t.purpose})`,
      `${t.odometerStart} km`,
      `${t.odometerEnd} km`,
      t.durationHours !== undefined ? `${t.durationHours} hrs` : '-',
      `+${t.distanceKm} km`
    ])

    autoTable(doc, {
      startY: 66,
      head: tableHeaders,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(9)
    doc.text('Prepared By:', 25, finalY)
    doc.text('______________________________', 25, finalY + 15)
    doc.text('Duty Driver Signature', 25, finalY + 20)

    doc.text('Verified By:', 135, finalY)
    doc.text('______________________________', 135, finalY + 15)
    doc.text('Transport Officer Signature', 135, finalY + 20)

    const driverNameClean = (reportData.driver?.full_name || 'Driver').replace(/\s+/g, '_')
    doc.save(`Driver_Movement_Log_${driverNameClean}_${month}_${year}.pdf`)
    toast.success(
      isEn ? 'PDF Downloaded' : 'PDF Dimuat Turun', 
      isEn ? `Movement log for driver ${reportData.driver?.full_name || 'Driver'} generated.` : `Laporan log pergerakan pemandu ${reportData.driver?.full_name || 'Driver'} berjaya dijana.`
    )
  }

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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-8 h-8 text-emerald-600" />
            {isEn ? 'Vehicle Movement Journal & Mileage Log' : 'Log & Jurnal Pergerakan Kenderaan'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEn 
              ? 'Review trip odometers, duty drivers, destinations, and monthly total mileage for audit verification and fuel claims.' 
              : 'Semak odometer perjalanan, pemandu bertugas, destinasi, dan jumlah kilometer bulanan untuk tujuan claims/rekod petrol.'}
          </p>
        </div>
        <Button 
          disabled={!reportData || reportData.trips.length === 0}
          onClick={handlePrintPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{isEn ? 'Print Log Report' : 'Cetak Laporan Log'}</span>
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Driver Dropdown */}
          <div className="space-y-1">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? 'Select Driver' : 'Pilih Pemandu'}
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="space-y-1">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? 'Month' : 'Bulan'}
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
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
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? 'Year' : 'Tahun'}
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-xs font-bold text-slate-600">
              {isEn ? 'Total:' : 'Jumlah:'} {reportData?.totalKm || 0} km {isEn ? 'driven' : 'jarak tempuh'}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Report Table Card */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
              {isEn ? 'Loading movement log...' : 'Memuatkan log pergerakan...'}
            </div>
          ) : !reportData || reportData.trips.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {isEn ? 'No trips recorded for this driver during the selected period.' : 'Tiada pergerakan trip direkodkan bagi pemandu ini pada tempoh tersebut.'}
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">{isEn ? 'Date' : 'Tarikh'}</th>
                    <th className="px-6 py-4">{isEn ? 'Ref No' : 'No. Rujukan'}</th>
                    <th className="px-6 py-4">{isEn ? 'Vehicle' : 'Kenderaan'}</th>
                    <th className="px-6 py-4">{isEn ? 'Destination & Purpose' : 'Tujuan & Destinasi'}</th>
                    <th className="px-6 py-4">{isEn ? 'Odometer Start' : 'Odometer Mula'}</th>
                    <th className="px-6 py-4">{isEn ? 'Odometer End' : 'Odometer Tamat'}</th>
                    <th className="px-6 py-4">{isEn ? 'Duration (Hours)' : 'Tempoh (Jam)'}</th>
                    <th className="px-6 py-4">{isEn ? 'Distance (km)' : 'Jarak (km)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {reportData.trips.map((trip: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-600">{trip.date}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600 text-xs">{trip.referenceNo}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{trip.driverName}</td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-bold text-slate-800 truncate">{trip.destination}</div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{trip.purpose}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600 tabular-nums">{trip.odometerStart} km</td>
                      <td className="px-6 py-4 font-mono text-slate-600 tabular-nums">{trip.odometerEnd} km</td>
                      <td className="px-6 py-4 font-mono text-slate-600 tabular-nums">
                        {trip.durationHours !== undefined ? `${trip.durationHours} ${isEn ? 'hrs' : 'jam'}` : '-'}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600 tabular-nums">+{trip.distanceKm} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: High-End Native Trip Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {reportData.trips.map((trip: any, idx: number) => (
                <div key={idx} className="p-4 space-y-2.5 hover:bg-slate-50/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                        {trip.referenceNo}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{trip.destination}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{trip.purpose}</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs tabular-nums flex-shrink-0">
                      +{trip.distanceKm} km
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase">Odometer Mula - Tamat</span>
                      <div className="font-mono text-slate-700 font-semibold mt-0.5">
                        {trip.odometerStart} → {trip.odometerEnd} km
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase">Tempoh Perjalanan</span>
                      <div className="font-mono text-slate-700 font-semibold mt-0.5">
                        {trip.durationHours !== undefined ? `${trip.durationHours} ${isEn ? 'hrs' : 'jam'}` : '-'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{trip.date}</span>
                    <span>Pemandu: <strong className="text-slate-600">{trip.driverName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

export default TransporterVehicleMovementPage
