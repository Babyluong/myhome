// @ts-nocheck
/**
 * Cylinder Report Service
 * Aggregates cylinder lifecycle, warrant utilization, consumption trends, and forecasting.
 */

import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { ApiResponse } from '@/types'

export interface WarrantEntry {
  id: string
  warrant_no: string
  vote_code: string
  amount: number
  warrant_date: string
  category: string
}

export interface DeliveryEntry {
  id: string
  delivery_order_no: string
  reception_date: string
  total_amount: number
  status: string
  items_count: number
}

export interface CylinderDetailEntry {
  id: string
  serial_number: string
  size_code: string
  type_name: string
  status: string
  location_name: string
  department_name: string | null
  qr_code: string | null
  last_movement_date: string | null
}

export interface CylinderReportData {
  summary: {
    totalCylinders: number
    activeCylinders: number
    totalWarrants: number
    totalWarrantAmount: number
    totalExpenses: number
    budgetUtilization: number // percentage
    totalDeliveries: number
    avgMonthlyUsage: number
    avgWeeklyUsage: number
    avgDailyUsage: number
    peakDayUsage: { date: string; formattedDate: string; count: number }
    peakWeekUsage: { week: string; count: number }
    currentBalance: number
    runwayMonths: number
  }
  warrants: {
    list: WarrantEntry[]
    monthlyTrend: { month: string; allocated: number; spent: number }[]
    utilizationByVoteCode: { voteCode: string; allocated: number; spent: number }[]
  }
  usage: {
    byType: { type: string; count: number; percentage: number }[]
    byDepartment: { department: string; count: number }[]
    monthlyTrend: { month: string; [sizeCode: string]: number }[]
    weeklyTrend: { week: string; shortWeek: string; startDate: string; endDate: string; issued: number; [sizeCode: string]: any }[]
    dailyTrend: { date: string; formattedDate: string; dayOfWeek: string; issued: number; [sizeCode: string]: any }[]
    averageMonthly: { type: string; avgUsage: number }[]
    averageWeekly: { type: string; avgUsage: number }[]
    averageDaily: { type: string; avgUsage: number }[]
    topConsumingDepartments: { department: string; usage: number; percentage: number }[]
  }
  deliveries: {
    total: number
    monthlyTrend: { month: string; count: number; amount: number }[]
    receivedMonthlyTrend: { month: string; [sizeCode: string]: number }[]
    receivedWeeklyTrend: { week: string; shortWeek: string; received: number; [sizeCode: string]: any }[]
    receivedDailyTrend: { date: string; formattedDate: string; received: number; [sizeCode: string]: any }[]
    byStatus: { status: string; count: number }[]
    recentDeliveries: DeliveryEntry[]
    avgDeliveryValue: number
  }
  inventory: {
    byStatus: { status: string; count: number; color: string }[]
    byType: { type: string; full: number; empty: number; inUse: number; maintenance: number }[]
    utilizationRate: number
    qrTaggedPercentage: number
    departmentDistribution: { department: string; count: number }[]
    weeklyTrend?: InventoryWeeklyTrendEntry[]
  }
  forecast: {
    nextMonth: { type: string; predicted: number; confidence: number }[]
    next3Months: { month: string; predicted: number; lower: number; upper: number }[]
    budgetRunway: { currentBalance: number; burnRate: number; monthsRemaining: number }
    seasonalPattern: { month: string; avgUsage: number }[]
  }
  detailed: CylinderDetailEntry[]
  backorders: CylinderBackorderAnalytics
}

export interface InventoryWeeklyTrendEntry {
  weekKey: string
  week: string
  shortWeek: string
  startDate: string
  endDate: string
  totalBalance: number
  totalFull: number
  totalInUse: number
  totalEmpty: number
  totalMaintenance?: number
  bySize: Record<string, {
    balance: number
    full: number
    inUse: number
    empty: number
    maintenance?: number
  }>
}

export interface BackorderSizeSummary {
  sizeCode: string
  rawCode: string
  capacity?: string
  returnedCount: number
  receivedCount: number
  pendingCount: number
  overdueCount: number
  under7: number
  between7And14: number
  over14: number
  fulfillmentRate: number
}

export interface BackorderBatchEntry {
  id: string
  documentNumber: string
  returnedDate: string
  supplierId: string
  supplierName: string
  returnedQty: number
  receivedQty: number
  pendingQty: number
  agingDays: number
  isOverdue: boolean
  status: 'fulfilled' | 'pending' | 'overdue'
  sizesSummary: { sizeCode: string; count: number }[]
}

export interface BackorderWeeklyTrendEntry {
  weekKey: string
  week: string
  shortWeek: string
  startDate: string
  endDate: string
  totalReturned: number
  totalReceived: number
  totalPending: number
  totalOverdue: number
  fulfillmentRate: number
  under7: number
  between7And14: number
  over14: number
  bySize: Record<string, {
    returnedCount: number
    receivedCount: number
    pendingCount: number
    overdueCount: number
    under7: number
    between7And14: number
    over14: number
    fulfillmentRate: number
  }>
}

export interface CylinderBackorderAnalytics {
  summary: {
    totalReturned: number
    totalReceived: number
    totalPending: number
    totalOverdue: number
    fulfillmentRate: number
    avgAgingDays: number
    agingBuckets: {
      under7Days: number
      between7And14Days: number
      over14Days: number
    }
  }
  bySize: BackorderSizeSummary[]
  batches: BackorderBatchEntry[]
  weeklyTrend?: BackorderWeeklyTrendEntry[]
}

/**
 * Perform simple linear regression on a numeric series
 */
function calculateLinearRegression(y: number[]): { slope: number; intercept: number; r2: number } {
  const n = y.length
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 }
  if (n === 1) return { slope: 0, intercept: y[0], r2: 1 }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0
  let sumYY = 0

  for (let i = 0; i < n; i++) {
    const x = i
    sumX += x
    sumY += y[i]
    sumXY += x * y[i]
    sumXX += x * x
    sumYY += y[i] * y[i]
  }

  const meanX = sumX / n
  const meanY = sumY / n

  const num = n * sumXY - sumX * sumY
  const den = n * sumXX - sumX * sumX

  const slope = den === 0 ? 0 : num / den
  const intercept = meanY - slope * meanX

  // Calculate R-squared
  let numR = 0
  let denR = 0
  for (let i = 0; i < n; i++) {
    const pred = slope * i + intercept
    numR += Math.pow(y[i] - pred, 2)
    denR += Math.pow(y[i] - meanY, 2)
  }

  const r2 = denR === 0 ? 1 : 1 - numR / denR

  return {
    slope,
    intercept,
    r2: Math.max(0, Math.min(1, r2)),
  }
}

// ─── Date Utility Helpers for Daily & Weekly Trend Aggregation ───────────────
function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDayLabel(d: Date): string {
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(d.getDate()).padStart(2, '0')
  return `${day} ${monthsShort[d.getMonth()]}`
}

function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function getWeekEnd(d: Date): Date {
  const start = getWeekStart(d)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Generate Cylinder Report Data
 */
export async function generateCylinderReport(
  hospitalId: string,
  dateRange: { startDate: Date; endDate: Date }
): Promise<ApiResponse<CylinderReportData>> {
  try {
    if (isSupabaseConfigured()) {
      // 1. Fetch Warrants
      const { data: warrantsRaw, error: wErr } = await supabase
        .from('pharmacy_warrants')
        .select('*')
        .eq('hospital_id', hospitalId)
        .eq('category', 'medical_oxygen')

      if (wErr) throw wErr

      // 2. Fetch Receptions
      const { data: receptionsRaw, error: rErr } = await supabase
        .from('pharmacy_oxygen_reception_records')
        .select(`
          *,
          items:pharmacy_oxygen_reception_items(
            *,
            size_info:pharmacy_oxygen_cylinder_sizes(*)
          )
        `)
        .eq('hospital_id', hospitalId)

      if (rErr) throw rErr

      // 3. Fetch Inventory
      const { data: inventoryRaw, error: iErr } = await supabase
        .from('pharmacy_oxygen_cylinder_inventory')
        .select(`
          *,
          size_info:pharmacy_oxygen_cylinder_sizes(*),
          type_info:pharmacy_oxygen_cylinder_types(*),
          department:departments(*)
        `)
        .eq('hospital_id', hospitalId)

      if (iErr) throw iErr

      // 4. Fetch Consumption (from live dept requests, as consumption table is empty)
      const { data: deptRequestsRaw, error: cErr } = await supabase
        .from('pharmacy_oxygen_dept_requests')
        .select(`
          *,
          department:departments(*),
          items:pharmacy_oxygen_dept_request_items(
            *,
            size_info:pharmacy_oxygen_cylinder_sizes(*)
          )
        `)
        .eq('hospital_id', hospitalId)
        .eq('status', 'completed')

      if (cErr) throw cErr

      // 5a. Fetch Return Documents (All cylinders returned to supplier for refilling)
      const { data: returnDocsRaw, error: retDocsErr } = await supabase
        .from('pharmacy_oxygen_return_documents')
        .select(`
          id,
          document_number,
          returned_date,
          supplier_id,
          status,
          created_at,
          supplier:suppliers(id, company_name, supplier_code),
          items:pharmacy_oxygen_return_document_items(
            id,
            cylinder_id
          )
        `)
        .eq('hospital_id', hospitalId)
        .neq('status', 'cancelled')
        .order('returned_date', { ascending: false })

      if (retDocsErr) throw retDocsErr

      // 5b. Fetch Receive Documents (All cylinders received back from supplier)
      const { data: receiveDocsRaw, error: rcvDocsErr } = await supabase
        .from('pharmacy_oxygen_receive_documents')
        .select(`
          id,
          document_number,
          delivery_order_no,
          received_date,
          supplier_id,
          status,
          created_at,
          items:pharmacy_oxygen_receive_document_items(
            id,
            cylinder_id
          )
        `)
        .eq('hospital_id', hospitalId)
        .neq('status', 'cancelled')
        .order('received_date', { ascending: false })

      if (rcvDocsErr) throw rcvDocsErr

      // Determine the active Fiscal Year based on the end of the reporting period
      const fiscalYear = dateRange.endDate.getFullYear()
      const fiscalYearStart = new Date(fiscalYear, 0, 1)
      const fiscalYearEnd = new Date(fiscalYear, 11, 31)

      // 6. Aggregate Warrants & Budgets (filtered to active Fiscal Year)
      const warrantsList: WarrantEntry[] = (warrantsRaw || [])
        .map(w => ({
          id: w.id,
          warrant_no: w.warrant_no || w.document_no || 'W-UNKNOWN',
          vote_code: w.vote_code || '080702',
          amount: Number(w.amount || 0),
          warrant_date: w.warrant_date || w.created_at?.split('T')[0] || '2026-01-01',
          category: w.category || 'medical_oxygen',
        }))
        .filter(w => {
          const wDate = new Date(w.warrant_date)
          return wDate >= fiscalYearStart && wDate <= fiscalYearEnd
        })

      const totalWarrantAmount = warrantsList.reduce((sum, w) => sum + w.amount, 0)

      // Total Expenses from completed receptions (filtered to active Fiscal Year)
      const completedReceptions = (receptionsRaw || [])
        .filter(r => r.status === 'completed')
        .filter(r => {
          const rDate = new Date(r.reception_date)
          return rDate >= fiscalYearStart && rDate <= fiscalYearEnd
        })

      const totalExpenses = completedReceptions.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
      const currentBalance = totalWarrantAmount - totalExpenses
      const budgetUtilization = totalWarrantAmount > 0 ? (totalExpenses / totalWarrantAmount) * 100 : 0

      // Group warrants & spend by month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const warrantTrendMap: Record<string, { allocated: number; spent: number }> = {}
      
      // Initialize recent 6 months
      const startMonthIndex = dateRange.startDate.getMonth()
      const endMonthIndex = dateRange.endDate.getMonth()
      const targetMonths: string[] = []
      
      let tempDate = new Date(dateRange.startDate)
      while (tempDate <= dateRange.endDate) {
        const mLabel = months[tempDate.getMonth()] + ' ' + String(tempDate.getFullYear()).slice(-2)
        warrantTrendMap[mLabel] = { allocated: 0, spent: 0 }
        targetMonths.push(mLabel)
        tempDate.setMonth(tempDate.getMonth() + 1)
      }

      warrantsList.forEach(w => {
        const wDate = new Date(w.warrant_date)
        const mLabel = months[wDate.getMonth()] + ' ' + String(wDate.getFullYear()).slice(-2)
        if (warrantTrendMap[mLabel]) {
          warrantTrendMap[mLabel].allocated += w.amount
        }
      })

      completedReceptions.forEach(r => {
        const rDate = new Date(r.reception_date)
        const mLabel = months[rDate.getMonth()] + ' ' + String(rDate.getFullYear()).slice(-2)
        if (warrantTrendMap[mLabel]) {
          warrantTrendMap[mLabel].spent += Number(r.total_amount || 0)
        }
      })

      const warrantsMonthlyTrend = targetMonths.map(m => ({
        month: m,
        allocated: warrantTrendMap[m].allocated,
        spent: warrantTrendMap[m].spent,
      }))

      // Utilization by Vote Code (strictly filtered to active Fiscal Year)
      const utilByVote: Record<string, { allocated: number; spent: number }> = {}
      warrantsList.forEach(w => {
        if (!utilByVote[w.vote_code]) utilByVote[w.vote_code] = { allocated: 0, spent: 0 }
        utilByVote[w.vote_code].allocated += w.amount
      })
      completedReceptions.forEach(r => {
        const vote = r.vote_code || '080702'
        if (!utilByVote[vote]) utilByVote[vote] = { allocated: 0, spent: 0 }
        utilByVote[vote].spent += Number(r.total_amount || 0)
      })
      const utilizationByVoteCode = Object.entries(utilByVote).map(([voteCode, val]) => ({
        voteCode,
        allocated: val.allocated,
        spent: val.spent,
      }))

      // 7. Aggregate Usage / Consumption (Derived from completed department requests)
      const targetConsumptions: any[] = []
      ;(deptRequestsRaw || []).forEach(req => {
        const reqDate = new Date(req.approved_at || req.created_at)
        if (reqDate >= dateRange.startDate && reqDate <= dateRange.endDate) {
          ;(req.items || []).forEach((item: any) => {
            const sizeCode = item.size_info?.code || 'Size D'
            targetConsumptions.push({
              consumption_date: (req.approved_at || req.created_at || '').split('T')[0],
              created_at: req.created_at,
              cylinder_size: sizeCode,
              quantity: Number(item.quantity_issued || item.quantity || 0),
              department: req.department
            })
          })
        }
      })

      const totalConsumptionQty = targetConsumptions.reduce((sum, c) => sum + Number(c.quantity || 0), 0)

      // Usage by type (e.g. size)
      const usageByTypeMap: Record<string, number> = {}
      targetConsumptions.forEach(c => {
        const type = c.cylinder_size || 'Size D'
        usageByTypeMap[type] = (usageByTypeMap[type] || 0) + Number(c.quantity || 0)
      })
      const usageByType = Object.entries(usageByTypeMap).map(([type, count]) => ({
        type,
        count,
        percentage: totalConsumptionQty > 0 ? (count / totalConsumptionQty) * 100 : 0,
      })).sort((a, b) => b.count - a.count)

      // Usage by Department
      const usageByDeptMap: Record<string, number> = {}
      targetConsumptions.forEach(c => {
        const dept = c.department?.department_name || c.department?.name || c.location || 'Unknown'
        usageByDeptMap[dept] = (usageByDeptMap[dept] || 0) + Number(c.quantity || 0)
      })
      const usageByDepartment = Object.entries(usageByDeptMap).map(([department, count]) => ({
        department,
        count,
      })).sort((a, b) => b.count - a.count)

      const topConsumingDepartments = usageByDepartment.map(d => ({
        department: d.department,
        usage: d.count,
        percentage: totalConsumptionQty > 0 ? (d.count / totalConsumptionQty) * 100 : 0,
      })).slice(0, 8)

      // Usage Monthly Trend
      const usageTrendMap: Record<string, Record<string, number>> = {}
      targetMonths.forEach(m => {
        usageTrendMap[m] = {}
      })

      targetConsumptions.forEach(c => {
        const cDate = new Date(c.consumption_date || c.created_at)
        const mLabel = months[cDate.getMonth()] + ' ' + String(cDate.getFullYear()).slice(-2)
        const type = c.cylinder_size || 'Size D'
        if (usageTrendMap[mLabel]) {
          usageTrendMap[mLabel][type] = (usageTrendMap[mLabel][type] || 0) + Number(c.quantity || 0)
        }
      })

      const usageMonthlyTrend = targetMonths.map(m => ({
        month: m,
        ...usageTrendMap[m],
      }))

      // Average monthly usage by type
      const activeMonthsCount = targetMonths.length || 1
      const averageMonthlyUsageByType = usageByType.map(t => ({
        type: t.type,
        avgUsage: t.count / activeMonthsCount,
      }))

      const avgMonthlyUsage = totalConsumptionQty / activeMonthsCount

      // 7b. Daily Usage & Reception Aggregation (for all cylinder types)
      let dailyStartDate = new Date(dateRange.startDate)
      const dailyEndDate = new Date(dateRange.endDate)

      if (targetConsumptions.length > 0) {
        const sortedDates = targetConsumptions
          .map(c => new Date(c.consumption_date || c.created_at))
          .sort((a, b) => a.getTime() - b.getTime())

        const earliestRec = sortedDates[0]
        const spanDays = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / 86400000)
        if (spanDays > 45) {
          // Anchor to first day of earliest active month or last 45 days
          const startOfActiveMonth = new Date(earliestRec.getFullYear(), earliestRec.getMonth(), 1)
          dailyStartDate = new Date(Math.max(dateRange.startDate.getTime(), startOfActiveMonth.getTime()))
        }
      }

      const dailyMap: Record<string, any> = {}
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const curD = new Date(dailyStartDate)
      curD.setHours(0, 0, 0, 0)
      const endD = new Date(dailyEndDate)
      endD.setHours(23, 59, 59, 999)

      while (curD <= endD) {
        const k = formatDateKey(curD)
        dailyMap[k] = {
          date: k,
          formattedDate: formatDayLabel(curD),
          dayOfWeek: dayNames[curD.getDay()],
          issued: 0,
          received: 0,
        }
        curD.setDate(curD.getDate() + 1)
      }

      targetConsumptions.forEach(c => {
        const cDate = new Date(c.consumption_date || c.created_at)
        const k = formatDateKey(cDate)
        const type = c.cylinder_size || 'Size D'
        const qty = Number(c.quantity || 0)
        if (dailyMap[k]) {
          dailyMap[k].issued += qty
          dailyMap[k][type] = (dailyMap[k][type] || 0) + qty
        }
      })

      ;(receptionsRaw || []).forEach(r => {
        if (r.status === 'completed') {
          const rDate = new Date(r.reception_date)
          const k = formatDateKey(rDate)
          if (dailyMap[k]) {
            ;(r.items || []).forEach((item: any) => {
              const sizeCode = item.size_info?.code || 'Size D'
              const qty = Number(item.quantity || 1)
              dailyMap[k].received += qty
              dailyMap[k][`received_${sizeCode}`] = (dailyMap[k][`received_${sizeCode}`] || 0) + qty
            })
          }
        }
      })

      const usageDailyTrend = Object.values(dailyMap)
      const receivedDailyTrend = usageDailyTrend.map(d => {
        const res: any = {
          date: d.date,
          formattedDate: d.formattedDate,
          received: d.received,
        }
        Object.keys(d).forEach(key => {
          if (key.startsWith('received_')) {
            res[key.replace('received_', '')] = d[key]
          }
        })
        return res
      })

      // 7c. Weekly Usage & Reception Aggregation (for all cylinder types)
      const weeklyMap: Record<string, any> = {}
      const curWStart = getWeekStart(dailyStartDate)
      const endWBoundary = getWeekEnd(dailyEndDate)

      while (curWStart <= endWBoundary) {
        const wEnd = getWeekEnd(curWStart)
        const wkNum = getWeekNumber(curWStart)
        const shortWeek = `Wk ${wkNum}`
        const weekLabel = `${shortWeek} (${formatDayLabel(curWStart)} - ${formatDayLabel(wEnd)})`
        const wKey = formatDateKey(curWStart)

        weeklyMap[wKey] = {
          week: weekLabel,
          shortWeek,
          startDate: formatDateKey(curWStart),
          endDate: formatDateKey(wEnd),
          issued: 0,
          received: 0,
        }
        curWStart.setDate(curWStart.getDate() + 7)
      }

      targetConsumptions.forEach(c => {
        const cDate = new Date(c.consumption_date || c.created_at)
        const wStart = getWeekStart(cDate)
        const wKey = formatDateKey(wStart)
        const type = c.cylinder_size || 'Size D'
        const qty = Number(c.quantity || 0)
        if (weeklyMap[wKey]) {
          weeklyMap[wKey].issued += qty
          weeklyMap[wKey][type] = (weeklyMap[wKey][type] || 0) + qty
        }
      })

      ;(receptionsRaw || []).forEach(r => {
        if (r.status === 'completed') {
          const rDate = new Date(r.reception_date)
          const wStart = getWeekStart(rDate)
          const wKey = formatDateKey(wStart)
          if (weeklyMap[wKey]) {
            ;(r.items || []).forEach((item: any) => {
              const sizeCode = item.size_info?.code || 'Size D'
              const qty = Number(item.quantity || 1)
              weeklyMap[wKey].received += qty
              weeklyMap[wKey][`received_${sizeCode}`] = (weeklyMap[wKey][`received_${sizeCode}`] || 0) + qty
            })
          }
        }
      })

      const usageWeeklyTrend = Object.values(weeklyMap)
      const receivedWeeklyTrend = usageWeeklyTrend.map(w => {
        const res: any = {
          week: w.week,
          shortWeek: w.shortWeek,
          received: w.received,
        }
        Object.keys(w).forEach(key => {
          if (key.startsWith('received_')) {
            res[key.replace('received_', '')] = w[key]
          }
        })
        return res
      })

      // Peak Day & Peak Week
      let peakDayUsage = { date: 'N/A', formattedDate: 'N/A', count: 0 }
      usageDailyTrend.forEach(d => {
        if (d.issued > peakDayUsage.count) {
          peakDayUsage = { date: d.date, formattedDate: d.formattedDate, count: d.issued }
        }
      })

      let peakWeekUsage = { week: 'N/A', count: 0 }
      usageWeeklyTrend.forEach(w => {
        if (w.issued > peakWeekUsage.count) {
          peakWeekUsage = { week: w.shortWeek, count: w.issued }
        }
      })

      const activeDaysCount = usageDailyTrend.filter(d => d.issued > 0).length || usageDailyTrend.length || 1
      const activeWeeksCount = usageWeeklyTrend.filter(w => w.issued > 0).length || usageWeeklyTrend.length || 1

      const avgDailyUsage = totalConsumptionQty > 0 ? parseFloat((totalConsumptionQty / activeDaysCount).toFixed(1)) : 0
      const avgWeeklyUsage = totalConsumptionQty > 0 ? parseFloat((totalConsumptionQty / activeWeeksCount).toFixed(1)) : 0

      const averageDailyUsageByType = usageByType.map(t => ({
        type: t.type,
        avgUsage: parseFloat((t.count / activeDaysCount).toFixed(1)),
      }))

      const averageWeeklyUsageByType = usageByType.map(t => ({
        type: t.type,
        avgUsage: parseFloat((t.count / activeWeeksCount).toFixed(1)),
      }))

      // 8. Deliveries & Receptions
      const deliveriesCount = (receptionsRaw || []).length
      const deliveryTrendMap: Record<string, { count: number; amount: number }> = {}
      const receivedTrendMap: Record<string, Record<string, number>> = {}
      targetMonths.forEach(m => {
        deliveryTrendMap[m] = { count: 0, amount: 0 }
        receivedTrendMap[m] = {}
      })
      ;(receptionsRaw || []).forEach(r => {
        const rDate = new Date(r.reception_date)
        const mLabel = months[rDate.getMonth()] + ' ' + String(rDate.getFullYear()).slice(-2)
        if (deliveryTrendMap[mLabel]) {
          deliveryTrendMap[mLabel].count += 1
          deliveryTrendMap[mLabel].amount += Number(r.total_amount || 0)
          
          ;(r.items || []).forEach((item: any) => {
            const sizeCode = item.size_info?.code || 'Size D'
            receivedTrendMap[mLabel][sizeCode] = (receivedTrendMap[mLabel][sizeCode] || 0) + 1
          })
        }
      })
      const deliveriesMonthlyTrend = targetMonths.map(m => ({
        month: m,
        count: deliveryTrendMap[m].count,
        amount: deliveryTrendMap[m].amount,
      }))
      const receivedMonthlyTrend = targetMonths.map(m => ({
        month: m,
        ...receivedTrendMap[m],
      }))

      const statusMap: Record<string, number> = {}
      ;(receptionsRaw || []).forEach(r => {
        statusMap[r.status] = (statusMap[r.status] || 0) + 1
      })
      const deliveriesByStatus = Object.entries(statusMap).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }))

      const recentDeliveriesList: DeliveryEntry[] = (receptionsRaw || [])
        .slice(0, 10)
        .map(r => ({
          id: r.id,
          delivery_order_no: r.delivery_order_no || 'DO-UNKNOWN',
          reception_date: r.reception_date || '2026-01-01',
          total_amount: Number(r.total_amount || 0),
          status: r.status || 'completed',
          items_count: r.items?.length || 0,
        }))

      const avgDeliveryValue = deliveriesCount > 0 ? totalExpenses / deliveriesCount : 0

      // 9. Inventory Status
      const totalCylinders = (inventoryRaw || []).length
      // Map DB statuses to UI statuses: available -> full/available, issued -> in_use/issued
      const activeCylinders = (inventoryRaw || []).filter(c => 
        c.status === 'in_use' || c.status === 'issued' || c.status === 'full' || c.status === 'available'
      ).length
      
      const invStatusMap: Record<string, { count: number; color: string }> = {
        full: { count: 0, color: '#10b981' }, // available
        empty: { count: 0, color: '#ef4444' }, // empty
        in_use: { count: 0, color: '#6366f1' }, // issued
        maintenance: { count: 0, color: '#f59e0b' },
        returned_to_supplier: { count: 0, color: '#64748b' }, // returned
        disposed: { count: 0, color: '#475569' },
      }
      
      ;(inventoryRaw || []).forEach(c => {
        let stat = c.status || 'full'
        if (stat === 'available') stat = 'full'
        if (stat === 'issued') stat = 'in_use'
        
        if (invStatusMap[stat]) {
          invStatusMap[stat].count += 1
        } else {
          invStatusMap[stat] = { count: 1, color: '#94a3b8' }
        }
      })
      const inventoryByStatus = Object.entries(invStatusMap)
        .filter(([_, val]) => val.count > 0) // Only show statuses that have cylinders
        .map(([status, val]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
          count: val.count,
          color: val.color,
        }))

      // Inventory by Type & Status
      const invTypeMap: Record<string, { full: number; empty: number; inUse: number; maintenance: number }> = {}
      ;(inventoryRaw || []).forEach(c => {
        const type = c.size_info?.code || 'Size D'
        if (!invTypeMap[type]) {
          invTypeMap[type] = { full: 0, empty: 0, inUse: 0, maintenance: 0 }
        }
        let stat = c.status
        if (stat === 'available') stat = 'full'
        if (stat === 'issued') stat = 'in_use'

        if (stat === 'full') invTypeMap[type].full++
        else if (stat === 'empty' || stat === 'returned_to_supplier') invTypeMap[type].empty++
        else if (stat === 'in_use') invTypeMap[type].inUse++
        else if (stat === 'maintenance') invTypeMap[type].maintenance++
      })
      const inventoryByType = Object.entries(invTypeMap).map(([type, stats]) => ({
        type,
        ...stats,
      }))

      const qrTaggedCount = (inventoryRaw || []).filter(c => !!c.qr_code).length
      const qrTaggedPercentage = totalCylinders > 0 ? (qrTaggedCount / totalCylinders) * 100 : 0
      const utilizationRate = totalCylinders > 0 ? (invStatusMap.in_use.count / totalCylinders) * 100 : 0

      // Department Distribution
      const invDeptMap: Record<string, number> = {}
      ;(inventoryRaw || []).forEach(c => {
        const dept = c.department?.department_name || c.department?.name || 'Central Store'
        invDeptMap[dept] = (invDeptMap[dept] || 0) + 1
      })
      const inventoryDeptDistribution = Object.entries(invDeptMap).map(([department, count]) => ({
        department,
        count,
      })).sort((a, b) => b.count - a.count)

      // 9b. Inventory Weekly Trend Calculation (Reconciled On-Hand Stock)
      const inventoryWeeklyTrend: InventoryWeeklyTrendEntry[] = Object.values(weeklyMap).map((w: any) => {
        const bySize: Record<string, { balance: number; full: number; inUse: number; empty: number; maintenance?: number }> = {}
        let totalBal = 0
        let totFull = 0
        let totInUse = 0
        let totEmpty = 0

        inventoryByType.forEach(t => {
          const typeTotal = t.full + t.inUse + t.empty + t.maintenance
          const wkIssued = w[t.type] || 0
          const wkReceived = w[`received_${t.type}`] || 0

          const netBal = Math.max(0, typeTotal + (wkReceived - wkIssued))
          const fullEst = Math.max(0, Math.round(t.full + (wkReceived * 0.7) - (wkIssued * 0.5)))
          const inUseEst = Math.max(0, Math.round(t.inUse + (wkIssued * 0.5)))
          const emptyEst = Math.max(0, netBal - fullEst - inUseEst)

          bySize[t.type] = {
            balance: netBal || typeTotal,
            full: fullEst || t.full,
            inUse: inUseEst || t.inUse,
            empty: emptyEst || t.empty,
            maintenance: t.maintenance,
          }
          totalBal += (netBal || typeTotal)
          totFull += (fullEst || t.full)
          totInUse += (inUseEst || t.inUse)
          totEmpty += (emptyEst || t.empty)
        })

        return {
          weekKey: w.week?.split(' ')[0] || w.shortWeek,
          week: w.week,
          shortWeek: w.shortWeek,
          startDate: w.startDate,
          endDate: w.endDate,
          totalBalance: totalBal || totalCylinders,
          totalFull: totFull,
          totalInUse: totInUse,
          totalEmpty: totEmpty,
          bySize,
        }
      })

      // Detailed Inventory
      const detailedList: CylinderDetailEntry[] = (inventoryRaw || []).map(c => ({
        id: c.id,
        serial_number: c.serial_number || 'S-UNKNOWN',
        size_code: c.size_info?.code || 'Size D',
        type_name: c.size_info ? `Standard ${c.size_info.code} (${c.size_info.capacity}M³)` : 'Standard Cylinder',
        status: c.status || 'full',
        location_name: c.current_location || 'Central Store',
        department_name: c.department?.department_name || c.department?.name || null,
        qr_code: c.qr_code || null,
        last_movement_date: c.updated_at || null,
      }))

      // 10. Forecasting Calculations
      const forecastNextMonth: { type: string; predicted: number; confidence: number }[] = []
      
      // Separate monthly totals by type to run regression
      const typesList = usageByType.map(t => t.type)
      typesList.forEach(t => {
        // Collect points
        const points: number[] = []
        targetMonths.forEach(m => {
          points.push(usageTrendMap[m][t] || 0)
        })
        const reg = calculateLinearRegression(points)
        const nextX = points.length
        const predicted = Math.max(0, Math.round(reg.slope * nextX + reg.intercept))
        forecastNextMonth.push({
          type: t,
          predicted,
          confidence: Math.round(reg.r2 * 100),
        })
      })

      // Aggregate overall monthly totals for 3-month forecast
      const overallMonthlyTotals = targetMonths.map(m => {
        return Object.values(usageTrendMap[m]).reduce((sum, v) => sum + v, 0)
      })
      const overallReg = calculateLinearRegression(overallMonthlyTotals)
      
      const forecastNext3Months: { month: string; predicted: number; lower: number; upper: number }[] = []
      const currentYear = dateRange.endDate.getFullYear()
      const currentMonth = dateRange.endDate.getMonth()

      for (let i = 1; i <= 3; i++) {
        const fDate = new Date(currentYear, currentMonth + i, 1)
        const mName = months[fDate.getMonth()] + ' ' + String(fDate.getFullYear()).slice(-2)
        const step = overallMonthlyTotals.length + i - 1
        const pred = Math.max(0, Math.round(overallReg.slope * step + overallReg.intercept))
        // 15% confidence interval bounds
        const lower = Math.max(0, Math.round(pred * 0.85))
        const upper = Math.round(pred * 1.15)
        forecastNext3Months.push({
          month: mName,
          predicted: pred,
          lower,
          upper,
        })
      }

      // Runway Months
      const avgMonthlyCost = completedReceptions.length > 0 ? (totalExpenses / activeMonthsCount) : 1000
      const runwayMonths = avgMonthlyCost > 0 ? currentBalance / avgMonthlyCost : 12

      // Seasonal Pattern
      const seasonalPattern = months.map(mName => {
        // compute average of this month over past years
        const matched = targetConsumptions.filter(c => {
          const cDate = new Date(c.consumption_date || c.created_at)
          return months[cDate.getMonth()] === mName
        })
        const total = matched.reduce((sum, c) => sum + Number(c.quantity || 0), 0)
        return {
          month: mName,
          avgUsage: matched.length > 0 ? total / (matched.length / 30 || 1) : 0,
        }
      })

      // 11. Pending to Receive Cylinder Analytics (Backorder)
      // All cylinders returned to supplier for refilling should be sent back.
      // Unreceived cylinders constitute active pending backorders.
      const invLookup = new Map<string, any>()
      ;(inventoryRaw || []).forEach(inv => invLookup.set(inv.id, inv))

      // Collect all cylinder IDs received back
      const receivedCylinderMap = new Map<string, { docNumber: string; receivedDate: string }>()
      ;(receiveDocsRaw || []).forEach(rcvDoc => {
        (rcvDoc.items || []).forEach((item: any) => {
          if (item.cylinder_id && !receivedCylinderMap.has(item.cylinder_id)) {
            receivedCylinderMap.set(item.cylinder_id, {
              docNumber: rcvDoc.document_number,
              receivedDate: rcvDoc.received_date || rcvDoc.created_at,
            })
          }
        })
      })

      const now = new Date()
      const normalizeSize = (rawCode?: string) => {
        if (!rawCode) return 'Size D'
        const upper = rawCode.toUpperCase()
        if (upper.includes('HS')) return 'Size HS'
        if (upper.includes('F')) return 'Size F'
        if (upper.includes('N')) return 'Size N'
        if (upper.includes('D')) return 'Size D'
        if (upper.includes('E')) return 'Size E'
        return rawCode
      }

      // Initialize size summary trackers for hospital standard cylinder sizes
      const sizeTracker: Record<string, { returned: number; received: number; pending: number; overdue: number; under7: number; between7And14: number; over14: number; rawCode: string; capacity?: string }> = {
        'Size D': { returned: 0, received: 0, pending: 0, overdue: 0, under7: 0, between7And14: 0, over14: 0, rawCode: 'P101-D', capacity: '0.5 m³' },
        'Size E': { returned: 0, received: 0, pending: 0, overdue: 0, under7: 0, between7And14: 0, over14: 0, rawCode: 'P101-E', capacity: '0.7 m³' },
        'Size F': { returned: 0, received: 0, pending: 0, overdue: 0, under7: 0, between7And14: 0, over14: 0, rawCode: 'P101-F', capacity: '1.4 m³' },
        'Size N': { returned: 0, received: 0, pending: 0, overdue: 0, under7: 0, between7And14: 0, over14: 0, rawCode: '101-N', capacity: '8.0 m³' },
        'Size HS': { returned: 0, received: 0, pending: 0, overdue: 0, under7: 0, between7And14: 0, over14: 0, rawCode: 'P101-HS', capacity: '6.4 m³' },
      }

      let totalReturnedAll = 0
      let totalReceivedAll = 0
      let totalPendingAll = 0
      let totalOverdueAll = 0
      let totalAgingDaysSum = 0
      let under7Days = 0
      let between7And14Days = 0
      let over14Days = 0

      const backorderBatches: BackorderBatchEntry[] = []
      const weeklyBackorderMap: Record<string, BackorderWeeklyTrendEntry> = {}

      ;(returnDocsRaw || []).forEach(retDoc => {
        const retItems = retDoc.items || []
        const retDate = retDoc.returned_date || retDoc.created_at
        const retDateTime = new Date(retDate).getTime()
        const agingDays = isNaN(retDateTime) ? 0 : Math.max(0, Math.floor((now.getTime() - retDateTime) / (1000 * 60 * 60 * 24)))
        
        // Weekly categorization for this return batch
        const rDateObj = new Date(retDate)
        const wStart = getWeekStart(rDateObj)
        const wEnd = getWeekEnd(rDateObj)
        const wkNum = getWeekNumber(rDateObj)
        const shortWeek = `Wk ${wkNum}`
        const weekKey = `${wStart.getFullYear()}-W${String(wkNum).padStart(2, '0')}`
        const weekLabel = `${shortWeek} (${formatDayLabel(wStart)} – ${formatDayLabel(wEnd)})`

        if (!weeklyBackorderMap[weekKey]) {
          weeklyBackorderMap[weekKey] = {
            weekKey,
            week: weekLabel,
            shortWeek,
            startDate: formatDateKey(wStart),
            endDate: formatDateKey(wEnd),
            totalReturned: 0,
            totalReceived: 0,
            totalPending: 0,
            totalOverdue: 0,
            fulfillmentRate: 0,
            under7: 0,
            between7And14: 0,
            over14: 0,
            bySize: {},
          }
        }
        const wkEntry = weeklyBackorderMap[weekKey]

        let batchReceivedCount = 0
        const batchSizesCount: Record<string, number> = {}

        retItems.forEach((item: any) => {
          const invItem = invLookup.get(item.cylinder_id)
          const rawCode = invItem?.size_info?.code || ''
          const sizeNorm = normalizeSize(rawCode)
          const cap = invItem?.size_info?.capacity ? `${invItem.size_info.capacity} m³` : undefined

          if (!sizeTracker[sizeNorm]) {
            sizeTracker[sizeNorm] = { returned: 0, received: 0, pending: 0, overdue: 0, under7: 0, between7And14: 0, over14: 0, rawCode, capacity: cap }
          }

          if (!wkEntry.bySize[sizeNorm]) {
            wkEntry.bySize[sizeNorm] = {
              returnedCount: 0,
              receivedCount: 0,
              pendingCount: 0,
              overdueCount: 0,
              under7: 0,
              between7And14: 0,
              over14: 0,
              fulfillmentRate: 0,
            }
          }
          const sizeWk = wkEntry.bySize[sizeNorm]

          sizeTracker[sizeNorm].returned += 1
          totalReturnedAll += 1
          batchSizesCount[sizeNorm] = (batchSizesCount[sizeNorm] || 0) + 1
          wkEntry.totalReturned += 1
          sizeWk.returnedCount += 1

          const rcvInfo = receivedCylinderMap.get(item.cylinder_id)
          // A cylinder is considered received back if recorded in receive documents or its status is no longer returned_to_supplier
          const isReceivedBack = Boolean(rcvInfo) || (invItem && invItem.status !== 'returned_to_supplier')

          if (isReceivedBack) {
            batchReceivedCount += 1
            sizeTracker[sizeNorm].received += 1
            totalReceivedAll += 1
            wkEntry.totalReceived += 1
            sizeWk.receivedCount += 1
          } else {
            sizeTracker[sizeNorm].pending += 1
            totalPendingAll += 1
            totalAgingDaysSum += agingDays
            wkEntry.totalPending += 1
            sizeWk.pendingCount += 1

            if (agingDays <= 7) {
              under7Days += 1
              sizeTracker[sizeNorm].under7 += 1
              wkEntry.under7 += 1
              sizeWk.under7 += 1
            } else if (agingDays <= 14) {
              between7And14Days += 1
              sizeTracker[sizeNorm].between7And14 += 1
              wkEntry.between7And14 += 1
              sizeWk.between7And14 += 1
            } else {
              over14Days += 1
              sizeTracker[sizeNorm].over14 += 1
              sizeTracker[sizeNorm].overdue += 1
              totalOverdueAll += 1
              wkEntry.over14 += 1
              wkEntry.totalOverdue += 1
              sizeWk.over14 += 1
              sizeWk.overdueCount += 1
            }
          }
        })

        const returnedQty = retItems.length
        const pendingQty = Math.max(0, returnedQty - batchReceivedCount)
        const isOverdue = agingDays > 14 && pendingQty > 0
        const status: 'fulfilled' | 'pending' | 'overdue' = pendingQty === 0 ? 'fulfilled' : isOverdue ? 'overdue' : 'pending'

        backorderBatches.push({
          id: retDoc.id,
          documentNumber: retDoc.document_number || 'O2-RET',
          returnedDate: retDate?.split('T')[0] || '2026-01-01',
          supplierId: retDoc.supplier_id,
          supplierName: retDoc.supplier?.company_name || 'BORNEO INDAH SDN BHD',
          returnedQty,
          receivedQty: batchReceivedCount,
          pendingQty,
          agingDays,
          isOverdue,
          status,
          sizesSummary: Object.entries(batchSizesCount).map(([sCode, count]) => ({ sizeCode: sCode, count })),
        })
      })

      Object.values(weeklyBackorderMap).forEach(wk => {
        wk.fulfillmentRate = wk.totalReturned > 0 ? parseFloat(((wk.totalReceived / wk.totalReturned) * 100).toFixed(1)) : 0
        Object.values(wk.bySize).forEach(sz => {
          sz.fulfillmentRate = sz.returnedCount > 0 ? parseFloat(((sz.receivedCount / sz.returnedCount) * 100).toFixed(1)) : 0
        })
      })
      const weeklyBackorderTrend = Object.values(weeklyBackorderMap).sort((a, b) => a.startDate.localeCompare(b.startDate))

      const bySizeList: BackorderSizeSummary[] = Object.entries(sizeTracker).map(([sizeCode, data]) => ({
        sizeCode,
        rawCode: data.rawCode,
        capacity: data.capacity,
        returnedCount: data.returned,
        receivedCount: data.received,
        pendingCount: data.pending,
        overdueCount: data.overdue,
        under7: data.under7,
        between7And14: data.between7And14,
        over14: data.over14,
        fulfillmentRate: data.returned > 0 ? (data.received / data.returned) * 100 : 0,
      }))

      const avgAgingDays = totalPendingAll > 0 ? parseFloat((totalAgingDaysSum / totalPendingAll).toFixed(1)) : 0
      const fulfillmentRate = totalReturnedAll > 0 ? parseFloat(((totalReceivedAll / totalReturnedAll) * 100).toFixed(1)) : 0

      const backorders: CylinderBackorderAnalytics = {
        summary: {
          totalReturned: totalReturnedAll,
          totalReceived: totalReceivedAll,
          totalPending: totalPendingAll,
          totalOverdue: totalOverdueAll,
          fulfillmentRate,
          avgAgingDays,
          agingBuckets: {
            under7Days,
            between7And14Days,
            over14Days,
          },
        },
        bySize: bySizeList,
        batches: backorderBatches,
        weeklyTrend: weeklyBackorderTrend,
      }

      return {
        data: {
          summary: {
            totalCylinders,
            activeCylinders,
            totalWarrants: warrantsList.length,
            totalWarrantAmount,
            totalExpenses,
            budgetUtilization,
            totalDeliveries: deliveriesCount,
            avgMonthlyUsage,
            avgWeeklyUsage,
            avgDailyUsage,
            peakDayUsage,
            peakWeekUsage,
            currentBalance,
            runwayMonths: Math.max(0, parseFloat(runwayMonths.toFixed(1))),
          },
          warrants: {
            list: warrantsList,
            monthlyTrend: warrantsMonthlyTrend,
            utilizationByVoteCode,
          },
          usage: {
            byType: usageByType,
            byDepartment: usageByDepartment,
            monthlyTrend: usageMonthlyTrend,
            weeklyTrend: usageWeeklyTrend,
            dailyTrend: usageDailyTrend,
            averageMonthly: averageMonthlyUsageByType,
            averageWeekly: averageWeeklyUsageByType,
            averageDaily: averageDailyUsageByType,
            topConsumingDepartments,
          },
          deliveries: {
            total: deliveriesCount,
            monthlyTrend: deliveriesMonthlyTrend,
            receivedMonthlyTrend,
            receivedWeeklyTrend,
            receivedDailyTrend,
            byStatus: deliveriesByStatus,
            recentDeliveries: recentDeliveriesList,
            avgDeliveryValue,
          },
          inventory: {
            byStatus: inventoryByStatus,
            byType: inventoryByType,
            utilizationRate,
            qrTaggedPercentage,
            departmentDistribution: inventoryDeptDistribution,
            weeklyTrend: inventoryWeeklyTrend,
          },
          forecast: {
            nextMonth: forecastNextMonth,
            next3Months: forecastNext3Months,
            budgetRunway: {
              currentBalance,
              burnRate: avgMonthlyCost,
              monthsRemaining: Math.max(0, parseFloat(runwayMonths.toFixed(1))),
            },
            seasonalPattern,
          },
          detailed: detailedList,
          backorders,
        },
        error: null,
      }
    }

    // SUPABASE NOT CONFIGURED: Return mock Cylinder Report
    return generateMockReport(hospitalId, dateRange)
  } catch (error) {
    console.error('Error generating cylinder report:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate report data',
    }
  }
}

/**
 * Generate full mock data report for local dev
 */
function generateMockReport(
  hospitalId: string,
  dateRange: { startDate: Date; endDate: Date }
): ApiResponse<CylinderReportData> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const targetMonths: string[] = []
  
  let tempDate = new Date(dateRange.startDate)
  while (tempDate <= dateRange.endDate) {
    const mLabel = months[tempDate.getMonth()] + ' ' + String(tempDate.getFullYear()).slice(-2)
    targetMonths.push(mLabel)
    tempDate.setMonth(tempDate.getMonth() + 1)
  }

  // Warrants Mock
  const warrantsList: WarrantEntry[] = [
    { id: 'w1', warrant_no: 'W2026-M091', vote_code: '080702', amount: 350000.0, warrant_date: '2026-01-10', category: 'medical_oxygen' },
    { id: 'w2', warrant_no: 'W2026-M112', vote_code: '080702', amount: 250000.0, warrant_date: '2026-03-05', category: 'medical_oxygen' },
    { id: 'w3', warrant_no: 'W2026-M203', vote_code: '080705', amount: 240000.0, warrant_date: '2026-05-12', category: 'medical_oxygen' },
  ]
  const totalWarrantAmount = warrantsList.reduce((sum, w) => sum + w.amount, 0)
  
  // Expenses Mock
  const totalExpenses = 730800.0
  const currentBalance = totalWarrantAmount - totalExpenses
  const budgetUtilization = (totalExpenses / totalWarrantAmount) * 100

  // Trend allocations and expenditures
  const warrantsMonthlyTrend = targetMonths.map((m, idx) => {
    const allocation = idx === 0 ? 350000 : idx === 2 ? 250000 : idx === 4 ? 240000 : 0
    const spends = [110000, 115000, 122000, 125000, 128800, 130000]
    return {
      month: m,
      allocated: allocation,
      spent: spends[idx % spends.length],
    }
  })

  const utilizationByVoteCode = [
    { voteCode: '080702', allocated: 600000.0, spent: 550800.0 },
    { voteCode: '080705', allocated: 240000.0, spent: 180000.0 },
  ]

  // Usage Mock
  const usageByType = [
    { type: 'Size D', count: 1840, percentage: 40.0 },
    { type: 'Size F', count: 1380, percentage: 30.0 },
    { type: 'Size G', count: 920, percentage: 20.0 },
    { type: 'Size K', count: 460, percentage: 10.0 },
  ]

  const usageByDepartment = [
    { department: 'Intensive Care Unit (ICU)', count: 1380 },
    { department: 'Emergency Department (ED)', count: 1104 },
    { department: 'General Ward 4A', count: 828 },
    { department: 'Operation Theatre (OT)', count: 644 },
    { department: 'Neonatal ICU (NICU)', count: 368 },
    { department: 'Paediatric Ward 2B', count: 184 },
    { department: 'Outpatient Clinic', count: 92 },
  ]

  const topConsumingDepartments = usageByDepartment.map(d => ({
    ...d,
    usage: d.count,
    percentage: (d.count / 4600) * 100,
  }))

  const usageMonthlyTrend = targetMonths.map((m, idx) => {
    // scale trend
    const base = 650 + Math.sin(idx) * 80
    return {
      month: m,
      'Size D': Math.round(base * 0.4),
      'Size F': Math.round(base * 0.3),
      'Size G': Math.round(base * 0.2),
      'Size K': Math.round(base * 0.1),
    }
  })

  const averageMonthlyUsageByType = [
    { type: 'Size D', avgUsage: 306.6 },
    { type: 'Size F', avgUsage: 230.0 },
    { type: 'Size G', avgUsage: 153.3 },
    { type: 'Size K', avgUsage: 76.6 },
  ]

  // Deliveries Mock
  const deliveriesMonthlyTrend = targetMonths.map((m, idx) => {
    const counts = [18, 20, 22, 21, 24, 23]
    const values = [110000, 115000, 122000, 125000, 128800, 130000]
    return {
      month: m,
      count: counts[idx % counts.length],
      amount: values[idx % values.length],
    }
  })

  // Mock received counts per size code that match usage with some delay/buffer
  const receivedMonthlyTrend = targetMonths.map((m, idx) => {
    const base = 700 + Math.cos(idx) * 90
    return {
      month: m,
      'Size D': Math.round(base * 0.38),
      'Size F': Math.round(base * 0.32),
      'Size G': Math.round(base * 0.22),
      'Size K': Math.round(base * 0.12),
    }
  })

  const deliveriesByStatus = [
    { status: 'Completed', count: 124 },
    { status: 'Pending Invoice', count: 4 },
    { status: 'In Transit', count: 2 },
  ]

  const recentDeliveries: DeliveryEntry[] = [
    { id: 'd1', delivery_order_no: 'DO-2026-98101', reception_date: '2026-06-18', total_amount: 14500.00, status: 'completed', items_count: 3 },
    { id: 'd2', delivery_order_no: 'DO-2026-98042', reception_date: '2026-06-12', total_amount: 18200.00, status: 'completed', items_count: 4 },
    { id: 'd3', delivery_order_no: 'DO-2026-97991', reception_date: '2026-06-05', total_amount: 12100.00, status: 'completed', items_count: 2 },
    { id: 'd4', delivery_order_no: 'DO-2026-97813', reception_date: '2026-05-28', total_amount: 16800.00, status: 'completed', items_count: 3 },
    { id: 'd5', delivery_order_no: 'DO-2026-97664', reception_date: '2026-05-20', total_amount: 22100.00, status: 'completed', items_count: 5 },
    { id: 'd6', delivery_order_no: 'DO-2026-97422', reception_date: '2026-05-11', total_amount: 9800.00, status: 'completed', items_count: 2 },
    { id: 'd7', delivery_order_no: 'DO-2026-97305', reception_date: '2026-04-28', total_amount: 15300.00, status: 'completed', items_count: 3 },
    { id: 'd8', delivery_order_no: 'DO-2026-97110', reception_date: '2026-04-19', total_amount: 14200.00, status: 'completed', items_count: 3 },
  ]

  // Inventory Mock
  const inventoryByStatus = [
    { status: 'Full', count: 185, color: '#10b981' },
    { status: 'In Use', count: 242, color: '#6366f1' },
    { status: 'Empty', count: 96, color: '#ef4444' },
    { status: 'Maintenance', count: 17, color: '#f59e0b' },
  ]
  const totalCylinders = 540

  const inventoryByType = [
    { type: 'Size D', full: 80, empty: 40, inUse: 100, maintenance: 8 },
    { type: 'Size F', full: 60, empty: 30, inUse: 80, maintenance: 4 },
    { type: 'Size G', full: 30, empty: 16, inUse: 42, maintenance: 3 },
    { type: 'Size K', full: 15, empty: 10, inUse: 20, maintenance: 2 },
  ]

  const inventoryDeptDistribution = [
    { department: 'Central Store', count: 202 },
    { department: 'Intensive Care Unit (ICU)', count: 98 },
    { department: 'Emergency Department (ED)', count: 85 },
    { department: 'General Ward 4A', count: 62 },
    { department: 'Operation Theatre (OT)', count: 53 },
    { department: 'Neonatal ICU (NICU)', count: 25 },
    { department: 'Paediatric Ward 2B', count: 15 },
  ]

  // Forecast Mock
  const forecastNextMonth = [
    { type: 'Size D', predicted: 312, confidence: 91 },
    { type: 'Size F', predicted: 242, confidence: 88 },
    { type: 'Size G', predicted: 162, confidence: 85 },
    { type: 'Size K', predicted: 81, confidence: 79 },
  ]

  const forecastNext3Months = [
    { month: 'Jul 26', predicted: 792, lower: 673, upper: 910 },
    { month: 'Aug 26', predicted: 815, lower: 692, upper: 937 },
    { month: 'Sep 26', predicted: 840, lower: 714, upper: 966 },
  ]

  const seasonalPattern = [
    { month: 'Jan', avgUsage: 710 },
    { month: 'Feb', avgUsage: 685 },
    { month: 'Mar', avgUsage: 740 },
    { month: 'Apr', avgUsage: 725 },
    { month: 'May', avgUsage: 780 },
    { month: 'Jun', avgUsage: 790 },
    { month: 'Jul', avgUsage: 815 },
    { month: 'Aug', avgUsage: 830 },
    { month: 'Sep', avgUsage: 850 },
    { month: 'Oct', avgUsage: 840 },
    { month: 'Nov', avgUsage: 865 },
    { month: 'Dec', avgUsage: 890 },
  ]

  // Detailed Inventory
  const detailed: CylinderDetailEntry[] = Array.from({ length: 45 }).map((_, idx) => {
    const statuses = ['full', 'in_use', 'empty', 'maintenance']
    const status = statuses[idx % statuses.length]
    const sizes = ['Size D', 'Size F', 'Size G', 'Size K']
    const size = sizes[idx % sizes.length]
    
    // Choose department based on status
    let deptName = null
    if (status === 'in_use') {
      const depts = ['Intensive Care Unit (ICU)', 'Emergency Department (ED)', 'General Ward 4A', 'Operation Theatre (OT)']
      deptName = depts[idx % depts.length]
    } else if (status === 'full' || status === 'empty') {
      deptName = idx % 3 === 0 ? 'Central Store' : null
    }

    const serials = ['CYL-08234', 'CYL-09123', 'CYL-11002', 'CYL-12891', 'CYL-07823', 'CYL-06443', 'CYL-10115']
    const serial = `${serials[idx % serials.length]}-${100 + idx}`

    return {
      id: `c-${idx}`,
      serial_number: serial,
      size_code: size,
      type_name: `Standard ${size} (${size === 'Size D' ? '1.4' : size === 'Size F' ? '3.4' : size === 'Size G' ? '5.0' : '7.5'}M³)`,
      status,
      location_name: deptName || (status === 'maintenance' ? 'Biomedical Workshop' : 'Central Store'),
      department_name: deptName,
      qr_code: idx % 6 !== 0 ? `O2-${size}-${serial}` : null,
      last_movement_date: new Date(2026, 5, 18 - (idx % 10)).toISOString().split('T')[0],
    }
  })

  // Daily Trend Mock (Last 14 days)
  const usageDailyTrend = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(dateRange.endDate)
    d.setDate(d.getDate() - (13 - i))
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const base = 25 + Math.round(Math.sin(i) * 10)
    const issued = base
    const received = i % 3 === 0 ? base + 5 : 0
    return {
      date: formatDateKey(d),
      formattedDate: formatDayLabel(d),
      dayOfWeek: dayNames[d.getDay()],
      issued,
      received,
      'Size D': Math.round(issued * 0.4),
      'Size F': Math.round(issued * 0.3),
      'Size G': Math.round(issued * 0.2),
      'Size K': Math.round(issued * 0.1),
    }
  })

  const receivedDailyTrend = usageDailyTrend.map(d => ({
    date: d.date,
    formattedDate: d.formattedDate,
    received: d.received,
    'Size D': Math.round(d.received * 0.4),
    'Size F': Math.round(d.received * 0.3),
    'Size G': Math.round(d.received * 0.2),
    'Size K': Math.round(d.received * 0.1),
  }))

  // Weekly Trend Mock (Last 6 weeks)
  const usageWeeklyTrend = Array.from({ length: 6 }).map((_, i) => {
    const wStart = new Date(dateRange.endDate)
    wStart.setDate(wStart.getDate() - (5 - i) * 7)
    const wEnd = new Date(wStart)
    wEnd.setDate(wEnd.getDate() + 6)
    const wkNum = 30 + i
    const base = 175 + Math.round(Math.sin(i) * 35)
    return {
      week: `Wk ${wkNum} (${formatDayLabel(wStart)} - ${formatDayLabel(wEnd)})`,
      shortWeek: `Wk ${wkNum}`,
      startDate: formatDateKey(wStart),
      endDate: formatDateKey(wEnd),
      issued: base,
      received: base + 10,
      'Size D': Math.round(base * 0.4),
      'Size F': Math.round(base * 0.3),
      'Size G': Math.round(base * 0.2),
      'Size K': Math.round(base * 0.1),
    }
  })

  const receivedWeeklyTrend = usageWeeklyTrend.map(w => ({
    week: w.week,
    shortWeek: w.shortWeek,
    received: w.received,
    'Size D': Math.round(w.received * 0.4),
    'Size F': Math.round(w.received * 0.3),
    'Size G': Math.round(w.received * 0.2),
    'Size K': Math.round(w.received * 0.1),
  }))

  const averageDailyUsageByType = [
    { type: 'Size D', avgUsage: 10.2 },
    { type: 'Size F', avgUsage: 7.7 },
    { type: 'Size G', avgUsage: 5.1 },
    { type: 'Size K', avgUsage: 2.6 },
  ]

  const averageWeeklyUsageByType = [
    { type: 'Size D', avgUsage: 71.4 },
    { type: 'Size F', avgUsage: 53.6 },
    { type: 'Size G', avgUsage: 35.7 },
    { type: 'Size K', avgUsage: 17.9 },
  ]

  const inventoryWeeklyTrend: InventoryWeeklyTrendEntry[] = [
    {
      weekKey: '2026-W35',
      week: 'Wk 35 (24 Aug – 30 Aug)',
      shortWeek: 'Wk 35',
      startDate: '2026-08-24',
      endDate: '2026-08-30',
      totalBalance: 396,
      totalFull: 132,
      totalInUse: 180,
      totalEmpty: 68,
      totalMaintenance: 16,
      bySize: {
        'Size D': { balance: 124, full: 40, inUse: 62, empty: 18, maintenance: 4 },
        'Size E': { balance: 48, full: 16, inUse: 23, empty: 7, maintenance: 2 },
        'Size F': { balance: 133, full: 39, inUse: 68, empty: 20, maintenance: 6 },
        'Size N': { balance: 64, full: 25, inUse: 28, empty: 9, maintenance: 2 },
        'Size HS': { balance: 27, full: 12, inUse: 9, empty: 5, maintenance: 1 },
      },
    },
    {
      weekKey: '2026-W36',
      week: 'Wk 36 (31 Aug – 06 Sep)',
      shortWeek: 'Wk 36',
      startDate: '2026-08-31',
      endDate: '2026-09-06',
      totalBalance: 402,
      totalFull: 138,
      totalInUse: 182,
      totalEmpty: 66,
      totalMaintenance: 16,
      bySize: {
        'Size D': { balance: 127, full: 42, inUse: 61, empty: 19, maintenance: 5 },
        'Size E': { balance: 49, full: 17, inUse: 23, empty: 7, maintenance: 2 },
        'Size F': { balance: 135, full: 40, inUse: 66, empty: 23, maintenance: 6 },
        'Size N': { balance: 64, full: 25, inUse: 28, empty: 9, maintenance: 2 },
        'Size HS': { balance: 27, full: 12, inUse: 9, empty: 5, maintenance: 1 },
      },
    },
    {
      weekKey: '2026-W37',
      week: 'Wk 37 (07 Sep – 13 Sep)',
      shortWeek: 'Wk 37',
      startDate: '2026-09-07',
      endDate: '2026-09-13',
      totalBalance: 407,
      totalFull: 140,
      totalInUse: 183,
      totalEmpty: 68,
      totalMaintenance: 16,
      bySize: {
        'Size D': { balance: 129, full: 44, inUse: 60, empty: 20, maintenance: 5 },
        'Size E': { balance: 50, full: 18, inUse: 22, empty: 8, maintenance: 2 },
        'Size F': { balance: 136, full: 41, inUse: 64, empty: 25, maintenance: 6 },
        'Size N': { balance: 65, full: 25, inUse: 28, empty: 10, maintenance: 2 },
        'Size HS': { balance: 27, full: 12, inUse: 9, empty: 5, maintenance: 1 },
      },
    },
    {
      weekKey: '2026-W38',
      week: 'Wk 38 (14 Sep – 20 Sep)',
      shortWeek: 'Wk 38',
      startDate: '2026-09-14',
      endDate: '2026-09-20',
      totalBalance: 410,
      totalFull: 142,
      totalInUse: 184,
      totalEmpty: 68,
      totalMaintenance: 16,
      bySize: {
        'Size D': { balance: 130, full: 45, inUse: 60, empty: 20, maintenance: 5 },
        'Size E': { balance: 50, full: 18, inUse: 22, empty: 8, maintenance: 2 },
        'Size F': { balance: 138, full: 42, inUse: 65, empty: 25, maintenance: 6 },
        'Size N': { balance: 65, full: 25, inUse: 28, empty: 10, maintenance: 2 },
        'Size HS': { balance: 27, full: 12, inUse: 9, empty: 5, maintenance: 1 },
      },
    },
  ]

  return {
    data: {
      summary: {
        totalCylinders,
        activeCylinders: 427,
        totalWarrants: warrantsList.length,
        totalWarrantAmount,
        totalExpenses,
        budgetUtilization,
        totalDeliveries: 130,
        avgMonthlyUsage: 766,
        avgWeeklyUsage: 178.5,
        avgDailyUsage: 25.5,
        peakDayUsage: { date: '2026-06-15', formattedDate: '15 Jun', count: 35 },
        peakWeekUsage: { week: 'Wk 34', count: 210 },
        currentBalance,
        runwayMonths: 8.8,
      },
      warrants: {
        list: warrantsList,
        monthlyTrend: warrantsMonthlyTrend,
        utilizationByVoteCode,
      },
      usage: {
        byType: usageByType,
        byDepartment: usageByDepartment,
        monthlyTrend: usageMonthlyTrend,
        weeklyTrend: usageWeeklyTrend,
        dailyTrend: usageDailyTrend,
        averageMonthly: averageMonthlyUsageByType,
        averageWeekly: averageWeeklyUsageByType,
        averageDaily: averageDailyUsageByType,
        topConsumingDepartments,
      },
      deliveries: {
        total: 130,
        monthlyTrend: deliveriesMonthlyTrend,
        receivedMonthlyTrend,
        receivedWeeklyTrend,
        receivedDailyTrend,
        byStatus: deliveriesByStatus,
        recentDeliveries,
        avgDeliveryValue: 5621.53,
      },
      inventory: {
        byStatus: inventoryByStatus,
        byType: inventoryByType,
        utilizationRate: 44.8,
        qrTaggedPercentage: 83.3,
        departmentDistribution: inventoryDeptDistribution,
        weeklyTrend: inventoryWeeklyTrend,
      },
      forecast: {
        nextMonth: forecastNextMonth,
        next3Months: forecastNext3Months,
        budgetRunway: {
          currentBalance,
          burnRate: 122600.0,
          monthsRemaining: 8.8,
        },
        seasonalPattern,
      },
      detailed,
      backorders: {
        summary: {
          totalReturned: 289,
          totalReceived: 30,
          totalPending: 259,
          totalOverdue: 124,
          fulfillmentRate: 10.4,
          avgAgingDays: 14.2,
          agingBuckets: {
            under7Days: 58,
            between7And14Days: 77,
            over14Days: 124,
          },
        },
        bySize: [
          { sizeCode: 'Size D', rawCode: 'P101-D', capacity: '0.5 m³', returnedCount: 9, receivedCount: 0, pendingCount: 9, overdueCount: 4, under7: 3, between7And14: 2, over14: 4, fulfillmentRate: 0 },
          { sizeCode: 'Size E', rawCode: 'P101-E', capacity: '0.7 m³', returnedCount: 4, receivedCount: 0, pendingCount: 4, overdueCount: 3, under7: 0, between7And14: 1, over14: 3, fulfillmentRate: 0 },
          { sizeCode: 'Size F', rawCode: 'P101-F', capacity: '1.4 m³', returnedCount: 181, receivedCount: 0, pendingCount: 181, overdueCount: 67, under7: 41, between7And14: 73, over14: 67, fulfillmentRate: 0 },
          { sizeCode: 'Size N', rawCode: '101-N', capacity: '8.0 m³', returnedCount: 75, receivedCount: 22, pendingCount: 53, overdueCount: 38, under7: 15, between7And14: 0, over14: 38, fulfillmentRate: 29.3 },
          { sizeCode: 'Size HS', rawCode: 'P101-HS', capacity: '6.4 m³', returnedCount: 20, receivedCount: 8, pendingCount: 12, overdueCount: 12, under7: 0, between7And14: 0, over14: 12, fulfillmentRate: 40.0 },
        ],
        batches: [
          { id: 'b1', documentNumber: 'O2-RET-20260914-3918', returnedDate: '2026-09-14', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 15, receivedQty: 0, pendingQty: 15, agingDays: 5, isOverdue: false, status: 'pending', sizesSummary: [{ sizeCode: 'Size N', count: 15 }] },
          { id: 'b2', documentNumber: 'O2-RET-20260914-9109', returnedDate: '2026-09-14', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 43, receivedQty: 0, pendingQty: 43, agingDays: 5, isOverdue: false, status: 'pending', sizesSummary: [{ sizeCode: 'Size F', count: 41 }, { sizeCode: 'Size D', count: 2 }] },
          { id: 'b3', documentNumber: 'O2-RET-20260909-3284', returnedDate: '2026-09-09', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 8, receivedQty: 8, pendingQty: 0, agingDays: 10, isOverdue: false, status: 'fulfilled', sizesSummary: [{ sizeCode: 'Size HS', count: 8 }] },
          { id: 'b4', documentNumber: 'O2-RET-20260909-3129', returnedDate: '2026-09-09', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 50, receivedQty: 0, pendingQty: 50, agingDays: 10, isOverdue: false, status: 'pending', sizesSummary: [{ sizeCode: 'Size F', count: 48 }, { sizeCode: 'Size D', count: 2 }] },
          { id: 'b5', documentNumber: 'O2-RET-20260909-3793', returnedDate: '2026-09-09', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 22, receivedQty: 0, pendingQty: 22, agingDays: 10, isOverdue: false, status: 'pending', sizesSummary: [{ sizeCode: 'Size N', count: 22 }] },
          { id: 'b6', documentNumber: 'O2-RET-20260909-8737', returnedDate: '2026-09-09', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 27, receivedQty: 0, pendingQty: 27, agingDays: 10, isOverdue: false, status: 'pending', sizesSummary: [{ sizeCode: 'Size F', count: 25 }, { sizeCode: 'Size D', count: 1 }, { sizeCode: 'Size E', count: 1 }] },
          { id: 'b7', documentNumber: 'O2-RET-20260828-6648', returnedDate: '2026-08-28', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 74, receivedQty: 0, pendingQty: 74, agingDays: 22, isOverdue: true, status: 'overdue', sizesSummary: [{ sizeCode: 'Size F', count: 67 }, { sizeCode: 'Size D', count: 4 }, { sizeCode: 'Size E', count: 3 }] },
          { id: 'b8', documentNumber: 'O2-RET-20260828-3176', returnedDate: '2026-08-28', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 38, receivedQty: 0, pendingQty: 38, agingDays: 22, isOverdue: true, status: 'overdue', sizesSummary: [{ sizeCode: 'Size N', count: 38 }] },
          { id: 'b9', documentNumber: 'O2-RET-20260828-6457', returnedDate: '2026-08-28', supplierId: 's1', supplierName: 'BORNEO INDAH SDN BHD', returnedQty: 12, receivedQty: 0, pendingQty: 12, agingDays: 22, isOverdue: true, status: 'overdue', sizesSummary: [{ sizeCode: 'Size HS', count: 12 }] },
        ],
        weeklyTrend: [
          {
            weekKey: '2026-W35',
            week: 'Wk 35 (24 Aug – 30 Aug)',
            shortWeek: 'Wk 35',
            startDate: '2026-08-24',
            endDate: '2026-08-30',
            totalReturned: 124,
            totalReceived: 0,
            totalPending: 124,
            totalOverdue: 124,
            fulfillmentRate: 0,
            under7: 0,
            between7And14: 0,
            over14: 124,
            bySize: {
              'Size D': { returnedCount: 4, receivedCount: 0, pendingCount: 4, overdueCount: 4, under7: 0, between7And14: 0, over14: 4, fulfillmentRate: 0 },
              'Size E': { returnedCount: 3, receivedCount: 0, pendingCount: 3, overdueCount: 3, under7: 0, between7And14: 0, over14: 3, fulfillmentRate: 0 },
              'Size F': { returnedCount: 67, receivedCount: 0, pendingCount: 67, overdueCount: 67, under7: 0, between7And14: 0, over14: 67, fulfillmentRate: 0 },
              'Size N': { returnedCount: 38, receivedCount: 0, pendingCount: 38, overdueCount: 38, under7: 0, between7And14: 0, over14: 38, fulfillmentRate: 0 },
              'Size HS': { returnedCount: 12, receivedCount: 0, pendingCount: 12, overdueCount: 12, under7: 0, between7And14: 0, over14: 12, fulfillmentRate: 0 },
            },
          },
          {
            weekKey: '2026-W37',
            week: 'Wk 37 (07 Sep – 13 Sep)',
            shortWeek: 'Wk 37',
            startDate: '2026-09-07',
            endDate: '2026-09-13',
            totalReturned: 107,
            totalReceived: 30,
            totalPending: 77,
            totalOverdue: 0,
            fulfillmentRate: 28.0,
            under7: 0,
            between7And14: 77,
            over14: 0,
            bySize: {
              'Size D': { returnedCount: 3, receivedCount: 0, pendingCount: 3, overdueCount: 0, under7: 0, between7And14: 3, over14: 0, fulfillmentRate: 0 },
              'Size E': { returnedCount: 1, receivedCount: 0, pendingCount: 1, overdueCount: 0, under7: 0, between7And14: 1, over14: 0, fulfillmentRate: 0 },
              'Size F': { returnedCount: 73, receivedCount: 0, pendingCount: 73, overdueCount: 0, under7: 0, between7And14: 73, over14: 0, fulfillmentRate: 0 },
              'Size N': { returnedCount: 22, receivedCount: 22, pendingCount: 0, overdueCount: 0, under7: 0, between7And14: 0, over14: 0, fulfillmentRate: 100 },
              'Size HS': { returnedCount: 8, receivedCount: 8, pendingCount: 0, overdueCount: 0, under7: 0, between7And14: 0, over14: 0, fulfillmentRate: 100 },
            },
          },
          {
            weekKey: '2026-W38',
            week: 'Wk 38 (14 Sep – 20 Sep)',
            shortWeek: 'Wk 38',
            startDate: '2026-09-14',
            endDate: '2026-09-20',
            totalReturned: 58,
            totalReceived: 0,
            totalPending: 58,
            totalOverdue: 0,
            fulfillmentRate: 0,
            under7: 58,
            between7And14: 0,
            over14: 0,
            bySize: {
              'Size D': { returnedCount: 2, receivedCount: 0, pendingCount: 2, overdueCount: 0, under7: 2, between7And14: 0, over14: 0, fulfillmentRate: 0 },
              'Size E': { returnedCount: 0, receivedCount: 0, pendingCount: 0, overdueCount: 0, under7: 0, between7And14: 0, over14: 0, fulfillmentRate: 0 },
              'Size F': { returnedCount: 41, receivedCount: 0, pendingCount: 41, overdueCount: 0, under7: 41, between7And14: 0, over14: 0, fulfillmentRate: 0 },
              'Size N': { returnedCount: 15, receivedCount: 0, pendingCount: 15, overdueCount: 0, under7: 15, between7And14: 0, over14: 0, fulfillmentRate: 0 },
              'Size HS': { returnedCount: 0, receivedCount: 0, pendingCount: 0, overdueCount: 0, under7: 0, between7And14: 0, over14: 0, fulfillmentRate: 0 },
            },
          },
        ],
      },
    },
    error: null,
  }
}
