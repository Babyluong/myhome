// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { Spinner } from '@/components/ui'
import { cn, formatCurrency } from '@/lib/utils'
import {
  ChevronRight,
  Sparkles,
  FileText,
  FileSpreadsheet,
  Calendar,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  BarChart2,
  Layers,
  Filter,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  History,
  Boxes,
  Search,
  SlidersHorizontal,
  Info,
  Truck,
  Clock,
  Send,
  PackageCheck,
  PackageOpen,
  ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line, LineChart
} from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { generateCylinderReport, CylinderReportData, WarrantEntry, DeliveryEntry, CylinderDetailEntry } from '../../services/cylinderReportService'

// ─── Color Palette ──────────────────────────────────────────────────────────
const CHART_COLORS = ['#00a68a', '#2563eb', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#64748b', '#cbd5e1']
const PIE_COLORS = ['#00a68a', '#64748b', '#05bca0', '#475569', '#8b9bb4', '#3b82f6', '#cbd5e1', '#e2e8f0']

const STATUS_COLORS: Record<string, string> = {
  'Full': '#10b981',
  'In Use': '#00a68a',
  'Empty': '#ef4444',
  'Maintenance': '#f59e0b',
}

const getStatusColor = (status: string) => STATUS_COLORS[status] || '#64748b'

const CYLINDER_TYPE_COLORS: Record<string, string> = {
  '101-N': '#2563eb', // Royal Blue
  'P101-F': '#00a68a', // Teal / Emerald
  '101-F': '#8b5cf6', // Violet
  'P101-HS': '#ec4899', // Pink / Rose
  'P101-D': '#f59e0b', // Amber
  'P101-E': '#10b981', // Emerald Green
  'P101-AG': '#06b6d4', // Cyan
  'Liquid Medical Oxygen (VIE Tank)': '#64748b',
  'Size D': '#f59e0b',
  'Size E': '#10b981',
  'Size F': '#00a68a',
  'Size G': '#f97316',
  'Size K': '#8b5cf6',
  'Size N': '#2563eb',
  'Size HS': '#ec4899',
}

const getCylinderColor = (type: string, idx: number = 0) => {
  if (CYLINDER_TYPE_COLORS[type]) return CYLINDER_TYPE_COLORS[type]
  const upper = (type || '').toUpperCase()
  if (upper.includes('101-N') || upper.includes('SIZE N')) return '#2563eb'
  if (upper.includes('P101-F') || upper.includes('SIZE F')) return '#00a68a'
  if (upper.includes('101-F')) return '#8b5cf6'
  if (upper.includes('P101-HS') || upper.includes('HS') || upper.includes('SIZE HS')) return '#ec4899'
  if (upper.includes('P101-D') || upper.includes('SIZE D')) return '#f59e0b'
  if (upper.includes('P101-E') || upper.includes('SIZE E')) return '#10b981'
  if (upper.includes('P101-AG') || upper.includes('AG')) return '#06b6d4'
  if (upper.includes('VIE') || upper.includes('LIQUID')) return '#64748b'
  return CHART_COLORS[idx % CHART_COLORS.length]
}

const getCylinderMeta = (rawType: string) => {
  const upper = (rawType || '').toUpperCase()
  if (upper.includes('101-N') || upper === 'N' || upper.includes('SIZE N')) {
    return { code: 'N', label: 'Size N', sub: '8.0 m³ (101-N)', full: 'Size N (101-N)', color: '#2563eb' }
  }
  if (upper.includes('P101-F') || upper.includes('101-F') || upper === 'F' || upper.includes('SIZE F')) {
    return { code: 'F', label: 'Size F', sub: `1.4 m³ (${rawType})`, full: `Size F (${rawType})`, color: '#00a68a' }
  }
  if (upper.includes('P101-HS') || upper.includes('HS') || upper.includes('SIZE HS')) {
    return { code: 'HS', label: 'Size HS', sub: '6.4 m³ (P101-HS)', full: 'Size HS (P101-HS)', color: '#ec4899' }
  }
  if (upper.includes('P101-D') || upper === 'D' || upper.includes('SIZE D')) {
    return { code: 'D', label: 'Size D', sub: '0.4 m³ (P101-D)', full: 'Size D (P101-D)', color: '#f59e0b' }
  }
  if (upper.includes('P101-E') || upper === 'E' || upper.includes('SIZE E')) {
    return { code: 'E', label: 'Size E', sub: '0.68 m³ (P101-E)', full: 'Size E (P101-E)', color: '#10b981' }
  }
  if (upper.includes('P101-AG') || upper === 'AG' || upper.includes('SIZE AG')) {
    return { code: 'AG', label: 'Size AG', sub: 'P101-AG', full: 'Size AG (P101-AG)', color: '#06b6d4' }
  }
  if (upper.includes('VIE') || upper.includes('LIQUID')) {
    return { code: 'VIE', label: 'VIE Liquid', sub: 'Tank', full: 'Liquid O2 (VIE Tank)', color: '#64748b' }
  }
  const clean = rawType.replace(/P101-|101-|Size\s*/gi, '').trim()
  return { code: clean.slice(0, 3) || rawType.slice(0, 3), label: rawType, sub: rawType, full: rawType, color: '#00a68a' }
}

// ─── Tab Definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: 'executive', label: 'Executive Summary', icon: Landmark, color: 'teal' },
  { id: 'warrant', label: 'Warrant & Budget', icon: BarChart3, color: 'teal' },
  { id: 'usage', label: 'Usage Analytics', icon: Activity, color: 'teal' },
  { id: 'delivery', label: 'Delivery & Reception', icon: Download, color: 'teal' },
  { id: 'inventory', label: 'Inventory Status', icon: Boxes, color: 'teal' },
  { id: 'forecasting', label: 'Forecasting', icon: TrendingUp, color: 'teal' },
  { id: 'detailed', label: 'Detailed Data', icon: History, color: 'teal' }
]

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  // Filter out duplicate or technical keys
  const filteredPayload = payload.filter((entry: any) => entry.name !== 'issued' && entry.name !== 'received')
  if (!filteredPayload.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-md text-slate-800 px-3.5 py-3 rounded-xl shadow-lg border border-slate-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00a68a]" />
      <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">{label}</p>
      <div className="space-y-1.5">
        {filteredPayload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center gap-4 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 font-medium">{entry.name}:</span>
            <span className="text-slate-900 font-mono font-bold ml-auto">
              {typeof entry.value === 'number'
                ? entry.value >= 1000 && !entry.name.includes('Count') && !entry.name.includes('Qty') && !entry.name.includes('Cylinder')
                  ? formatCurrency(entry.value).replace('MYR', 'RM')
                  : entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Performance Matrix Tooltip (Detailed Cylinder Size Breakdown) ───────────
const PerformanceMatrixTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  const rowData = payload[0]?.payload || {}
  const totalDispatched = rowData.total !== undefined ? Number(rowData.total) : payload.reduce((sum: number, p: any) => sum + Number(p.value || 0), 0)
  const fullTitle = rowData.fullLabel || label

  // Extract cylinder sizes with count > 0
  const validEntries = payload.filter((p: any) => {
    if (p.dataKey === 'total' || p.dataKey === 'value' || p.dataKey === 'received' || p.dataKey === 'issued') return false
    return Number(p.value) > 0
  }).sort((a: any, b: any) => Number(b.value) - Number(a.value))

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 min-w-[220px] text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs block">{fullTitle}</span>
          <span className="text-[10px] text-slate-400">Penggunaan Mengikut Saiz Silinder</span>
        </div>
        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full font-mono border border-teal-200/60">
          {totalDispatched} Tanks
        </span>
      </div>

      {validEntries.length > 0 ? (
        <div className="space-y-1.5 mt-1">
          {validEntries.map((entry: any, idx: number) => {
            const meta = getCylinderMeta(entry.dataKey || entry.name)
            const count = Number(entry.value || 0)
            const sharePct = totalDispatched > 0 ? ((count / totalDispatched) * 100).toFixed(1) : '0.0'
            const color = entry.color || entry.fill || getCylinderColor(entry.dataKey, idx)

            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {meta.label} <span className="text-[9.5px] text-slate-400 font-mono">({meta.code})</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                  <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                  <span className="text-[9.5px] text-slate-400">({sharePct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-slate-400 text-[11px] py-1">
          {totalDispatched > 0 ? `${totalDispatched} Tanks (Total)` : 'Tiada penggunaan silinder direkodkan'}
        </div>
      )}
    </div>
  )
}

// ─── Backorder Matrix Tooltip (Detailed Size Breakdown) ──────────────────────
const BackorderMatrixTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  const rowData = payload[0]?.payload || {}
  const sizeName = rowData.label || label || 'Cylinder'
  const meta = getCylinderMeta(rowData.sizeCode || sizeName)
  const pendingCount = rowData.pending !== undefined ? Number(rowData.pending) : Number(payload[0]?.value || 0)

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 min-w-[210px] text-xs space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded flex items-center justify-center font-black text-[9px] text-white shrink-0"
            style={{ backgroundColor: rowData.color || getCylinderColor(rowData.sizeCode || '') }}
          >
            {meta.code}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block leading-tight">{meta.label}</span>
            <span className="text-[10px] text-slate-400 font-mono">{meta.sub}</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full font-mono border border-amber-200/60">
          {pendingCount} Pending
        </span>
      </div>

      <div className="space-y-1 text-[11px] font-mono">
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span>Sent to Supplier:</span>
          <span className="font-bold text-slate-900 dark:text-white">{rowData.returned || 0}</span>
        </div>
        <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
          <span>Received Back:</span>
          <span className="font-bold">{rowData.received || 0}</span>
        </div>
        <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
          <span>Pending Backorder:</span>
          <span>{rowData.pending || 0}</span>
        </div>
        {Number(rowData.overdue || 0) > 0 && (
          <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Critical Overdue (&gt;14d):</span>
            <span>{rowData.overdue}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const BackorderComparisonTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload || {}
  const meta = getCylinderMeta(data.sizeCode || label)

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 min-w-[200px] text-xs space-y-1.5 font-mono">
      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 font-sans">
        <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: data.color }} />
        <span className="font-bold text-slate-900 dark:text-white">{meta.label}</span>
      </div>
      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
        <span>Sent to Supplier:</span>
        <span className="font-bold text-slate-900 dark:text-white">{data.returned}</span>
      </div>
      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
        <span>Received Back:</span>
        <span className="font-bold">{data.received}</span>
      </div>
      <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
        <span>Pending Backorder:</span>
        <span>{data.pending}</span>
      </div>
    </div>
  )
}

const BackorderAgingTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload || {}
  const meta = getCylinderMeta(data.sizeCode || label)

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 min-w-[210px] text-xs space-y-1.5 font-mono">
      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 font-sans">
        <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: data.color }} />
        <span className="font-bold text-slate-900 dark:text-white">{meta.label}</span>
      </div>
      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
        <span>&lt; 7d (Normal):</span>
        <span className="font-bold">{data.under7}</span>
      </div>
      <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
        <span>7–14d (Standard):</span>
        <span className="font-bold">{data.between7And14}</span>
      </div>
      <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-bold">
        <span>&gt; 14d (Overdue SLA):</span>
        <span>{data.over14}</span>
      </div>
    </div>
  )
}

const BackorderWeeklyPerformanceTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  const rowData = payload[0]?.payload || {}
  const fullTitle = rowData.fullLabel || label || 'Weekly Backorder'
  const totalPending = rowData.total !== undefined ? Number(rowData.total) : payload.reduce((sum: number, p: any) => sum + Number(p.value || 0), 0)

  const validEntries = payload.filter((p: any) => p.dataKey && p.dataKey !== 'total' && p.dataKey !== 'value' && Number(p.value || 0) > 0)

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 min-w-[220px] text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs block">{fullTitle}</span>
          <span className="text-[10px] text-slate-400">Backorder Tertunggak Mengikut Saiz Silinder</span>
        </div>
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full font-mono border border-amber-200/60">
          {totalPending} Tanks
        </span>
      </div>

      {validEntries.length > 0 ? (
        <div className="space-y-1.5 mt-1">
          {validEntries.map((entry: any, idx: number) => {
            const meta = getCylinderMeta(entry.dataKey || entry.name)
            const count = Number(entry.value || 0)
            const sharePct = totalPending > 0 ? ((count / totalPending) * 100).toFixed(1) : '0.0'
            const color = entry.color || entry.fill || getCylinderColor(entry.dataKey, idx)

            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {meta.label} <span className="text-[9.5px] text-slate-400 font-mono">({meta.code})</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                  <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                  <span className="text-[9.5px] text-slate-400">({sharePct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-slate-400 text-[11px] py-1">
          {totalPending > 0 ? `${totalPending} Tanks (Pending)` : 'Tiada tunggakan silinder'}
        </div>
      )}
    </div>
  )
}

const BackorderWeeklyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload || {}

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 min-w-[210px] text-xs space-y-1.5 font-mono">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 font-sans">
        <span className="font-bold text-slate-900 dark:text-white">{data.fullLabel || label}</span>
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
          {data.totalPending ?? data.pending ?? 0} Pending
        </span>
      </div>
      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
        <span>Sent to Supplier:</span>
        <span className="font-bold text-slate-900 dark:text-white">{data.totalReturned ?? data.returned ?? 0}</span>
      </div>
      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
        <span>Received Back:</span>
        <span className="font-bold">{data.totalReceived ?? data.received ?? 0}</span>
      </div>
      <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
        <span>Outstanding Backorder:</span>
        <span>{data.totalPending ?? data.pending ?? 0}</span>
      </div>
      {Number(data.totalOverdue ?? data.overdue ?? 0) > 0 && (
        <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Critical Overdue (&gt;14d):</span>
          <span>{data.totalOverdue ?? data.overdue}</span>
        </div>
      )}
    </div>
  )
}

// ─── Balance Weekly Performance Tooltip (Detailed Cylinder Size Breakdown) ───
const BalanceWeeklyPerformanceTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  const rowData = payload[0]?.payload || {}
  const fullTitle = rowData.fullLabel || label || 'Weekly Balance'
  const totalBalance = rowData.total !== undefined ? Number(rowData.total) : payload.reduce((sum: number, p: any) => sum + Number(p.value || 0), 0)

  const validEntries = payload.filter((p: any) => p.dataKey && p.dataKey !== 'total' && p.dataKey !== 'value' && Number(p.value || 0) > 0)

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 min-w-[220px] text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs block">{fullTitle}</span>
          <span className="text-[10px] text-slate-400">Baki Stok Silinder di Hospital Mengikut Saiz</span>
        </div>
        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full font-mono border border-blue-200/60">
          {totalBalance} Tanks
        </span>
      </div>

      {validEntries.length > 0 ? (
        <div className="space-y-1.5 mt-1">
          {validEntries.map((entry: any, idx: number) => {
            const meta = getCylinderMeta(entry.dataKey || entry.name)
            const count = Number(entry.value || 0)
            const sharePct = totalBalance > 0 ? ((count / totalBalance) * 100).toFixed(1) : '0.0'
            const color = entry.color || entry.fill || getCylinderColor(entry.dataKey, idx)

            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {meta.label} <span className="text-[9.5px] text-slate-400 font-mono">({meta.code})</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                  <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                  <span className="text-[9.5px] text-slate-400">({sharePct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-slate-400 text-[11px] py-1">
          {totalBalance > 0 ? `${totalBalance} Tanks (Total)` : 'Tiada data baki silinder'}
        </div>
      )}
    </div>
  )
}

// ─── Animated Counter ───────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 800
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay(eased * value)
      if (progress < 1) requestAnimationFrame(animate)
    }
    const req = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(req)
  }, [value])
  return <span>{prefix}{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}{suffix}</span>
}

// ─── Progress Ring ──────────────────────────────────────────────────────────
function ProgressRing({ percentage, size = 160, strokeWidth = 10, color = '#00a68a' }: { percentage: number, size?: number, strokeWidth?: number, color?: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.0, ease: [0.2, 0, 0, 1], delay: 0.1 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">{percentage.toFixed(1)}%</span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Utilized</span>
      </div>
    </div>
  )
}

// ─── Sparklines for Cards ──────────────────────────────────────────────────
const SPARKLINE_PATHS: Record<string, { path: string, stroke: string }> = {
  indigo: { path: "M0,25 Q15,10 30,22 T60,8 T90,15 T100,5", stroke: "#00a68a" },
  emerald: { path: "M0,28 Q20,15 40,25 T80,8 T100,2", stroke: "#00a68a" },
  rose: { path: "M0,5 Q20,10 40,18 T80,25 T100,28", stroke: "#ef4444" },
  blue: { path: "M0,25 Q20,18 40,22 T80,10 T100,8", stroke: "#64748b" },
  violet: { path: "M0,28 Q15,22 30,25 T60,12 T90,8 T100,5", stroke: "#00a68a" },
  teal: { path: "M0,22 Q15,8 30,18 T60,5 T90,12 T100,8", stroke: "#00a68a" },
  amber: { path: "M0,20 Q25,18 50,12 T75,15 T100,10", stroke: "#f59e0b" },
  slate: { path: "M0,22 Q10,5 20,25 T40,10 T60,28 T80,8 T100,15", stroke: "#64748b" }
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, prefix, suffix, icon: Icon, color, delay = 0, decimals = 0, trend }: {
  label: string, value: number, prefix?: string, suffix?: string, icon: any, color: string, delay?: number, decimals?: number, trend?: { val: number; isUp: boolean }
}) {
  const spark = SPARKLINE_PATHS[color] || SPARKLINE_PATHS.indigo

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay, ease: [0.2, 0, 0, 1] }}
      className="relative group rounded-xl p-4.5 pt-5 border border-slate-200/60 bg-white hover:border-slate-300 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between"
    >
      {/* Top indicator color line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[3px] transition-all duration-300",
        color === 'teal' && "bg-[#00a68a]",
        color === 'rose' && "bg-rose-500",
        color === 'amber' && "bg-amber-500",
        color === 'slate' && "bg-slate-400"
      )} />
      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40">
        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={spark.stroke} stopOpacity={0.3} />
              <stop offset="100%" stopColor={spark.stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={spark.path} fill={`url(#sparkGrad-${color})`} stroke={spark.stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-500 border border-slate-100/60 transition-colors duration-300 group-hover:bg-[#00a68a]/5 group-hover:text-[#00a68a] group-hover:border-[#00a68a]/10">
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span className={cn(
            "flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono",
            trend.isUp ? "bg-emerald-50 text-emerald-600 border border-emerald-100/40" : "bg-rose-50 text-rose-600 border border-rose-100/40"
          )}>
            {trend.isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {trend.val}%
          </span>
        )}
      </div>
      <div className="relative z-10">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">{label}</div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, icon: Icon, dark }: { title: string, subtitle?: string, icon?: any, dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {Icon && (
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center border",
          dark 
            ? "bg-slate-800/50 text-[#00a68a] border-slate-700/50" 
            : "bg-slate-50 text-[#00a68a] border-slate-100"
        )}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div>
        <h4 className={cn("text-sm font-bold tracking-tight", dark ? "text-slate-100 animate-fade-in" : "text-slate-900")}>{title}</h4>
        {subtitle && <p className={cn("text-[9px] font-bold uppercase tracking-wider mt-0.5", dark ? "text-slate-400" : "text-slate-400")}>{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Horizontal Progress Bar ────────────────────────────────────────────────
function HorizontalBar({ label, value, max, color, suffix = '', delay = 0 }: { label: string, value: number, max: number, color: string, suffix?: string, delay?: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 capitalize tracking-tight">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-900 font-mono">{value.toLocaleString()}{suffix}</span>
          <span className="text-[9.5px] text-slate-400 font-semibold font-mono">({pct.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full bg-[#00a68a]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: [0.2, 0, 0, 1] }}
        />
      </div>
    </div>
  )
}

export function CylinderReportPage() {
  const { user } = useAuthStore()
  const toast = useToastStore()

  const [activeTab, setActiveTab] = useState('executive')
  const [dateRangePreset, setDateRangePreset] = useState('6months')
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<CylinderReportData | null>(null)
  const [selectedTrendSize, setSelectedTrendSize] = useState('all')
  const [usageTrendGranularity, setUsageTrendGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [usageViewMode, setUsageViewMode] = useState<'metric' | 'types'>('metric')
  const [breakdownView, setBreakdownView] = useState<'weekly' | 'daily' | 'quarterly'>('weekly')
  const [matrixChartMode, setMatrixChartMode] = useState<'stacked' | 'grouped' | 'total'>('stacked')
  const [matrixSizeFilter, setMatrixSizeFilter] = useState<string>('all')
  const [hoveredMatrixType, setHoveredMatrixType] = useState<string | null>(null)
  
  // Custom Dates (if custom range selected)
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return d.toISOString().split('T')[0]
  })
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0])

  // Compute actual date objects
  const dateRange = useMemo(() => {
    const end = new Date()
    let start = new Date()

    if (dateRangePreset === '1month') {
      start.setMonth(end.getMonth() - 1)
    } else if (dateRangePreset === '3months') {
      start.setMonth(end.getMonth() - 3)
    } else if (dateRangePreset === '12months') {
      start.setMonth(end.getMonth() - 12)
    } else if (dateRangePreset === 'custom') {
      return {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate)
      }
    } else {
      // 6 months (default)
      start.setMonth(end.getMonth() - 6)
    }
    return { startDate: start, endDate: end }
  }, [dateRangePreset, customStartDate, customEndDate])

  const fySuffix = useMemo(() => {
    return `(FY${String(dateRange.endDate.getFullYear()).slice(-2)})`
  }, [dateRange])

  const cumulativeTrend = useMemo(() => {
    if (!reportData?.warrants?.monthlyTrend) return []
    let cumulativeAllocated = 0
    let cumulativeSpent = 0
    return reportData.warrants.monthlyTrend.map(item => {
      cumulativeAllocated += item.allocated
      cumulativeSpent += item.spent
      return {
        month: item.month,
        "Cumulative Budget": cumulativeAllocated,
        "Cumulative Spent": cumulativeSpent,
      }
    })
  }, [reportData])

  // Detailed Data Tab Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // Backorder Analytics Filter states (mirroring Card 1 architecture)
  const [backorderView, setBackorderView] = useState<'weekly' | 'total' | 'batches'>('weekly')
  const [backorderChartMode, setBackorderChartMode] = useState<'stacked' | 'grouped' | 'total'>('stacked')
  const [backorderSizeFilter, setBackorderSizeFilter] = useState<string>('all')
  const [backorderStatusFilter, setBackorderStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'fulfilled'>('all')
  const [backorderSearchQuery, setBackorderSearchQuery] = useState<string>('')
  const [hoveredBackorderType, setHoveredBackorderType] = useState<string | null>(null)
  const [backorderPage, setBackorderPage] = useState<number>(1)
  const backorderRowsPerPage = 8

  // Active Backorder Summary & Size Data
  const activeBackorderData = useMemo(() => {
    const raw = reportData?.backorders
    if (!raw) {
      return {
        summary: { totalReturned: 0, totalReceived: 0, totalPending: 0, totalOverdue: 0, fulfillmentRate: 0, avgAgingDays: 0 },
        bySize: [] as any[],
      }
    }
    return {
      summary: raw.summary,
      bySize: raw.bySize,
    }
  }, [reportData?.backorders])

  // Backorder Weekly Matrix Data (mirroring weeklyStats in Card 1)
  const backorderWeeklyStats = useMemo(() => {
    const trend = reportData?.backorders?.weeklyTrend || []
    const sizes = reportData?.backorders?.bySize || []
    if (!trend.length || !sizes.length) return { rows: [], weekKeys: [], weeks: [] }

    // Select active weeks with dispatches or pending backorders; fallback to last 4 weeks
    let activeWeeks = trend.filter(w => w.totalReturned > 0 || w.totalPending > 0)
    if (activeWeeks.length === 0) {
      activeWeeks = trend.slice(-4)
    } else if (activeWeeks.length > 5) {
      activeWeeks = activeWeeks.slice(-5)
    }

    const weekKeys = activeWeeks.map(w => w.shortWeek)

    const rows = sizes.map(s => {
      const weekCounts: Record<string, number> = {}
      let total = 0
      activeWeeks.forEach(w => {
        const val = w.bySize?.[s.sizeCode]?.pendingCount || 0
        weekCounts[w.shortWeek] = val
        total += val
      })
      const avgWeekly = activeWeeks.length > 0 ? parseFloat((total / activeWeeks.length).toFixed(1)) : 0
      return {
        sizeCode: s.sizeCode,
        rawCode: s.rawCode,
        capacity: s.capacity,
        weekCounts,
        avgWeekly,
        total,
      }
    })

    return { rows, weekKeys, weeks: activeWeeks }
  }, [reportData?.backorders])

  // Multi-Week Chart Data (mirroring weeklyOverallTrend in Card 1)
  const backorderWeeklyChartData = useMemo(() => {
    const { weeks } = backorderWeeklyStats
    if (!weeks.length) return []
    const sizes = reportData?.backorders?.bySize || []

    return weeks.map(w => {
      const item: any = {
        name: w.shortWeek,
        value: w.totalPending,
        total: w.totalPending,
        returned: w.totalReturned,
        received: w.totalReceived,
        fullLabel: w.week,
      }
      sizes.forEach(s => {
        item[s.sizeCode] = w.bySize?.[s.sizeCode]?.pendingCount || 0
      })
      return item
    })
  }, [backorderWeeklyStats, reportData?.backorders?.bySize])

  const backorderWeeklyAvg = useMemo(() => {
    const { weeks } = backorderWeeklyStats
    if (!weeks.length) return 0
    const total = weeks.reduce((sum, w) => sum + w.totalPending, 0)
    return parseFloat((total / weeks.length).toFixed(1))
  }, [backorderWeeklyStats])

  // Chart Data for Total Backorder Matrix
  const backorderChartDataFiltered = useMemo(() => {
    const raw = (activeBackorderData.bySize || []).map((s, idx) => {
      const meta = getCylinderMeta(s.sizeCode)
      return {
        name: meta.code,
        sizeCode: s.sizeCode,
        label: meta.label,
        color: getCylinderColor(s.sizeCode, idx),
        pending: s.pendingCount,
        returned: s.returnedCount,
        received: s.receivedCount,
        overdue: s.overdueCount,
        under7: s.under7 || 0,
        between7And14: s.between7And14 || 0,
        over14: s.over14 || 0,
      }
    })

    if (backorderSizeFilter !== 'all') {
      return raw.filter(r => r.sizeCode === backorderSizeFilter)
    }
    return raw
  }, [activeBackorderData.bySize, backorderSizeFilter])

  // Filtered Backorder Batches
  const filteredBackorderBatches = useMemo(() => {
    if (!reportData?.backorders?.batches) return []
    return reportData.backorders.batches.filter(batch => {
      // Status Filter
      if (backorderStatusFilter === 'pending' && batch.pendingQty === 0) return false
      if (backorderStatusFilter === 'overdue' && !batch.isOverdue) return false
      if (backorderStatusFilter === 'fulfilled' && batch.status !== 'fulfilled') return false

      // Size Filter
      if (backorderSizeFilter !== 'all') {
        const hasSize = batch.sizesSummary?.some(s => s.sizeCode === backorderSizeFilter && s.count > 0)
        if (!hasSize) return false
      }

      // Search Filter
      if (backorderSearchQuery.trim()) {
        const q = backorderSearchQuery.toLowerCase()
        const matchesDoc = batch.documentNumber.toLowerCase().includes(q)
        const matchesSupplier = batch.supplierName.toLowerCase().includes(q)
        if (!matchesDoc && !matchesSupplier) return false
      }

      return true
    })
  }, [reportData?.backorders?.batches, backorderStatusFilter, backorderSizeFilter, backorderSearchQuery])

  // Paginated Backorder Batches
  const paginatedBackorderBatches = useMemo(() => {
    const startIndex = (backorderPage - 1) * backorderRowsPerPage
    return filteredBackorderBatches.slice(startIndex, startIndex + backorderRowsPerPage)
  }, [filteredBackorderBatches, backorderPage, backorderRowsPerPage])

  const totalBackorderPages = Math.ceil(filteredBackorderBatches.length / backorderRowsPerPage) || 1

  // Cylinder Balance Matrix Filter states (Card 3 architecture)
  const [balanceView, setBalanceView] = useState<'weekly' | 'status' | 'ward'>('weekly')
  const [balanceChartMode, setBalanceChartMode] = useState<'stacked' | 'grouped' | 'total'>('stacked')
  const [balanceSizeFilter, setBalanceSizeFilter] = useState<string>('all')
  const [hoveredBalanceType, setHoveredBalanceType] = useState<string | null>(null)

  // Balance Weekly Matrix Data (mirroring weeklyStats in Card 1 & Card 2)
  const balanceWeeklyStats = useMemo(() => {
    const trend = reportData?.inventory?.weeklyTrend || []
    const invByType = reportData?.inventory?.byType || []
    if (!invByType.length) return { rows: [], weekKeys: [], weeks: [] }

    // Select active weeks; if trend is empty, fallback to backorders or usage trend weeks
    let activeWeeks = trend
    if (!activeWeeks.length) {
      const fallbackWeeks = reportData?.backorders?.weeklyTrend?.slice(-4) || 
        reportData?.usage?.weeklyTrend?.slice(-4) || []
      
      if (fallbackWeeks.length) {
        activeWeeks = fallbackWeeks.map(fw => ({
          weekKey: (fw as any).weekKey || fw.shortWeek,
          week: fw.week,
          shortWeek: fw.shortWeek,
          startDate: fw.startDate || '',
          endDate: fw.endDate || '',
          totalBalance: reportData?.summary?.totalCylinders || 0,
          totalFull: reportData?.inventory?.byType?.reduce((sum, t) => sum + t.full, 0) || 0,
          totalInUse: reportData?.inventory?.byType?.reduce((sum, t) => sum + t.inUse, 0) || 0,
          totalEmpty: reportData?.inventory?.byType?.reduce((sum, t) => sum + t.empty, 0) || 0,
          bySize: invByType.reduce((acc, t) => {
            const tot = t.full + t.inUse + t.empty + t.maintenance
            acc[t.type] = { balance: tot, full: t.full, inUse: t.inUse, empty: t.empty }
            return acc
          }, {} as Record<string, any>)
        }))
      }
    }

    if (activeWeeks.length > 5) {
      activeWeeks = activeWeeks.slice(-5)
    }

    const weekKeys = activeWeeks.map(w => w.shortWeek)

    // Standard hospital cylinder sizes
    const standardSizes = ['Size D', 'Size E', 'Size F', 'Size N', 'Size HS']
    const existingTypes = invByType.map(t => t.type)
    const typesToDisplay = Array.from(new Set([...standardSizes, ...existingTypes]))

    const grandHospitalTotal = invByType.reduce((sum, t) => sum + (t.full + t.inUse + t.empty + t.maintenance), 0) || 1

    const rows = typesToDisplay.map(t => {
      const found = invByType.find(item => item.type === t)
      const currentStock = found ? (found.full + found.inUse + found.empty + found.maintenance) : 0
      const weekCounts: Record<string, number> = {}
      let weekSum = 0

      activeWeeks.forEach(w => {
        const val = w.bySize?.[t]?.balance ?? currentStock
        weekCounts[w.shortWeek] = val
        weekSum += val
      })

      const avgWeekly = activeWeeks.length > 0 ? parseFloat((weekSum / activeWeeks.length).toFixed(1)) : currentStock
      const meta = getCylinderMeta(t)

      return {
        type: t,
        sizeCode: meta.code,
        label: meta.label,
        capacity: meta.sub,
        weekCounts,
        avgWeekly,
        currentStock,
        full: found?.full || 0,
        inUse: found?.inUse || 0,
        empty: found?.empty || 0,
        maintenance: found?.maintenance || 0,
        percentage: parseFloat(((currentStock / grandHospitalTotal) * 100).toFixed(1)),
      }
    }).filter(r => r.currentStock > 0 || Object.values(r.weekCounts).some(v => v > 0))

    return { rows, weekKeys, weeks: activeWeeks }
  }, [reportData?.inventory, reportData?.summary?.totalCylinders, reportData?.backorders?.weeklyTrend, reportData?.usage?.weeklyTrend])

  // Multi-Week Chart Data for Cylinder Balance
  const balanceWeeklyChartData = useMemo(() => {
    const { weeks, rows } = balanceWeeklyStats
    if (!weeks.length) return []

    return weeks.map(w => {
      const item: any = {
        name: w.shortWeek,
        value: w.totalBalance,
        total: w.totalBalance,
        fullLabel: w.week,
      }
      rows.forEach(r => {
        item[r.type] = w.bySize?.[r.type]?.balance ?? r.weekCounts[w.shortWeek] ?? r.currentStock
      })
      return item
    })
  }, [balanceWeeklyStats])

  const balanceWeeklyAvg = useMemo(() => {
    const { weeks } = balanceWeeklyStats
    if (!weeks.length) return reportData?.summary?.totalCylinders || 0
    const total = weeks.reduce((sum, w) => sum + w.totalBalance, 0)
    return parseFloat((total / weeks.length).toFixed(1))
  }, [balanceWeeklyStats, reportData?.summary?.totalCylinders])

  // Fetch Report Data
  const fetchReport = async () => {
    setLoading(true)
    try {
      const hospitalId = user?.hospital_id || 'default_hospital_id'
      const response = await generateCylinderReport(hospitalId, dateRange)
      if (response.error) {
        toast.error('Failed to load report', response.error)
      } else {
        setReportData(response.data)
      }
    } catch (e) {
      toast.error('Error generating report', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [dateRangePreset, customStartDate, customEndDate])

  // Dynamic KPIs for Usage Analytics
  const peakMonthDemandInfo = useMemo(() => {
    if (!reportData?.usage?.monthlyTrend?.length) return { value: 0, month: 'N/A' }
    let maxVal = 0
    let maxMonth = 'N/A'
    reportData.usage.monthlyTrend.forEach(m => {
      const sum = Object.entries(m)
        .filter(([key]) => key !== 'month')
        .reduce((sum, [_, val]) => sum + Number(val || 0), 0)
      if (sum > maxVal) {
        maxVal = sum
        maxMonth = m.month
      }
    })
    return { value: maxVal, month: maxMonth }
  }, [reportData])

  const topUsedSize = useMemo(() => {
    if (!reportData?.usage?.byType?.length) return { type: 'N/A', count: 0, percentage: 0 }
    return reportData.usage.byType[0] as any
  }, [reportData])

  const topDepartmentInfo = useMemo(() => {
    if (!reportData?.usage?.byDepartment?.length) return { department: 'N/A', count: 0 }
    return reportData.usage.byDepartment[0] as any
  }, [reportData])

  const quarterlyStats = useMemo(() => {
    if (!reportData?.usage?.monthlyTrend || !reportData?.usage?.byType) return []
    const statsMap: Record<string, { q1: number; q2: number; q3: number; q4: number; total: number }> = {}
    const types = reportData.usage.byType.map(t => t.type)
    types.forEach(t => {
      statsMap[t] = { q1: 0, q2: 0, q3: 0, q4: 0, total: 0 }
    })
    
    reportData.usage.monthlyTrend.forEach(item => {
      const monthStr = item.month.split(' ')[0]
      types.forEach(t => {
         const val = Number(item[t] || 0)
         statsMap[t].total += val
         if (['Jan', 'Feb', 'Mar'].includes(monthStr)) {
           statsMap[t].q1 += val
         } else if (['Apr', 'May', 'Jun'].includes(monthStr)) {
           statsMap[t].q2 += val
         } else if (['Jul', 'Aug', 'Sep'].includes(monthStr)) {
           statsMap[t].q3 += val
         } else if (['Oct', 'Nov', 'Dec'].includes(monthStr)) {
           statsMap[t].q4 += val
         }
      })
    })
    
    return Object.entries(statsMap).map(([type, stats]) => ({
      type,
      ...stats,
      avg_q1: parseFloat((stats.q1 / 3).toFixed(1)),
      avg_q2: parseFloat((stats.q2 / 3).toFixed(1)),
      avg_q3: parseFloat((stats.q3 / 3).toFixed(1)),
      avg_q4: parseFloat((stats.q4 / 3).toFixed(1)),
    }))
  }, [reportData])

  const quarterlyOverallTrend = useMemo(() => {
    if (!quarterlyStats.length) return []
    let q1Total = 0, q2Total = 0, q3Total = 0, q4Total = 0
    quarterlyStats.forEach((s: any) => {
      q1Total += s.q1
      q2Total += s.q2
      q3Total += s.q3
      q4Total += s.q4
    })
    const types = reportData?.usage?.byType?.map(t => t.type) || []
    const qData: any[] = [
      { name: 'Q1', value: q1Total, total: q1Total, fullLabel: 'Q1 (Jan - Mar)' },
      { name: 'Q2', value: q2Total, total: q2Total, fullLabel: 'Q2 (Apr - Jun)' },
      { name: 'Q3', value: q3Total, total: q3Total, fullLabel: 'Q3 (Jul - Sep)' },
      { name: 'Q4', value: q4Total, total: q4Total, fullLabel: 'Q4 (Oct - Dec)' }
    ]
    types.forEach(t => {
      const s = quarterlyStats.find((qs: any) => qs.type === t)
      qData[0][t] = s ? s.q1 : 0
      qData[1][t] = s ? s.q2 : 0
      qData[2][t] = s ? s.q3 : 0
      qData[3][t] = s ? s.q4 : 0
    })
    return qData
  }, [quarterlyStats, reportData])

  const dynamicTrendData = useMemo(() => {
    if (!reportData?.usage || !reportData?.deliveries) return []
    const types = reportData.usage.byType || []

    if (usageTrendGranularity === 'daily') {
      const dailyTrend = reportData.usage.dailyTrend || []
      const recDaily = reportData.deliveries.receivedDailyTrend || []

      return dailyTrend.map(d => {
        const rec = recDaily.find(r => r.date === d.date) || {}
        const point: any = {
          label: d.formattedDate,
          date: d.date,
          dayOfWeek: d.dayOfWeek,
        }

        if (selectedTrendSize === 'all') {
          point.issued = d.issued
          point.received = d.received
          types.forEach(t => {
            point[t.type] = Number(d[t.type] || 0)
          })
        } else {
          point.issued = Number(d[selectedTrendSize] || 0)
          point.received = Number(rec[selectedTrendSize] || d[`received_${selectedTrendSize}`] || 0)
        }
        return point
      })
    } else if (usageTrendGranularity === 'weekly') {
      const weeklyTrend = reportData.usage.weeklyTrend || []
      const recWeekly = reportData.deliveries.receivedWeeklyTrend || []

      return weeklyTrend.map(w => {
        const rec = recWeekly.find(r => r.week === w.week) || {}
        const point: any = {
          label: w.shortWeek,
          fullLabel: w.week,
          startDate: w.startDate,
          endDate: w.endDate,
        }

        if (selectedTrendSize === 'all') {
          point.issued = w.issued
          point.received = w.received
          types.forEach(t => {
            point[t.type] = Number(w[t.type] || 0)
          })
        } else {
          point.issued = Number(w[selectedTrendSize] || 0)
          point.received = Number(rec[selectedTrendSize] || w[`received_${selectedTrendSize}`] || 0)
        }
        return point
      })
    } else {
      // Monthly
      const monthlyTrend = reportData.usage.monthlyTrend || []
      const recMonthly = reportData.deliveries.receivedMonthlyTrend || []

      return monthlyTrend.map(m => {
        const recM = recMonthly.find(r => r.month === m.month) || {}
        const point: any = {
          label: m.month,
        }
        if (selectedTrendSize === 'all') {
          point.issued = types.reduce((sum, t) => sum + Number(m[t.type] || 0), 0)
          point.received = types.reduce((sum, t) => sum + Number(recM[t.type] || 0), 0)
          types.forEach(t => {
            point[t.type] = Number(m[t.type] || 0)
          })
        } else {
          point.issued = Number(m[selectedTrendSize] || 0)
          point.received = Number(recM[selectedTrendSize] || 0)
        }
        return point
      })
    }
  }, [reportData, usageTrendGranularity, selectedTrendSize])

  // Backward-compatible alias
  const filteredTrendData = dynamicTrendData

  // Weekly Performance Matrix
  const weeklyStats = useMemo(() => {
    if (!reportData?.usage?.weeklyTrend || !reportData?.usage?.byType) return { rows: [], weekKeys: [] }
    const types = reportData.usage.byType.map(t => t.type)
    const weeks = reportData.usage.weeklyTrend.slice(-6)
    const weekKeys = weeks.map(w => w.shortWeek)

    const rows = types.map(t => {
      const weekCounts: Record<string, number> = {}
      let total = 0
      weeks.forEach(w => {
        const val = Number(w[t] || 0)
        weekCounts[w.shortWeek] = val
        total += val
      })
      const avgWeekly = weeks.length > 0 ? parseFloat((total / weeks.length).toFixed(1)) : 0
      return {
        type: t,
        weekCounts,
        avgWeekly,
        total,
      }
    })

    return { rows, weekKeys }
  }, [reportData])

  const cylinderTypesList = useMemo(() => {
    if (!reportData?.usage?.byType) return []
    return reportData.usage.byType.map((t: any) => t.type)
  }, [reportData])

  const totalPeriodTanks = useMemo(() => {
    if (!reportData?.usage?.byType) return 0
    return reportData.usage.byType.reduce((sum: number, t: any) => sum + Number(t.count || 0), 0)
  }, [reportData])

  const weeklyOverallTrend = useMemo(() => {
    if (!reportData?.usage?.weeklyTrend?.length) return []
    const types = reportData?.usage?.byType?.map(t => t.type) || []
    return reportData.usage.weeklyTrend.slice(-6).map(w => {
      const item: any = {
        name: w.shortWeek,
        value: w.issued,
        total: w.issued,
        received: w.received,
        fullLabel: w.week,
      }
      types.forEach(t => {
        item[t] = Number(w[t] || 0)
      })
      return item
    })
  }, [reportData])

  // Daily Performance Matrix (stats per cylinder size)
  const dailyStats = useMemo(() => {
    if (!reportData?.usage?.dailyTrend || !reportData?.usage?.byType) return []
    const types = reportData.usage.byType.map(t => t.type)
    const days = reportData.usage.dailyTrend

    return types.map(t => {
      let total = 0
      let maxDay = { formattedDate: 'N/A', count: 0 }
      let activeDays = 0

      days.forEach(d => {
        const val = Number(d[t] || 0)
        if (val > 0) {
          total += val
          activeDays += 1
          if (val > maxDay.count) {
            maxDay = { formattedDate: d.formattedDate, count: val }
          }
        }
      })

      const totalAllCylinders = reportData.usage.byType.reduce((s, item) => s + item.count, 0) || 1
      const pct = (total / totalAllCylinders) * 100
      const avgDaily = activeDays > 0 ? parseFloat((total / activeDays).toFixed(1)) : 0

      return {
        type: t,
        avgDaily,
        peakDay: maxDay,
        activeDays,
        total,
        percentage: pct,
      }
    })
  }, [reportData])

  const dailyOverallTrend = useMemo(() => {
    if (!reportData?.usage?.dailyTrend?.length) return []
    const types = reportData?.usage?.byType?.map(t => t.type) || []
    const days = reportData.usage.dailyTrend
    return days.slice(-14).map(d => {
      const item: any = {
        name: d.formattedDate,
        value: d.issued,
        total: d.issued,
        received: d.received,
        fullLabel: `${d.formattedDate} (${d.dayOfWeek || ''})`,
      }
      types.forEach(t => {
        item[t] = Number(d[t] || 0)
      })
      return item
    })
  }, [reportData])

  // Filtered detailed inventory items
  const filteredCylinders = useMemo(() => {
    if (!reportData?.detailed) return []
    return reportData.detailed.filter(item => {
      const matchesSearch = item.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.location_name && item.location_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.department_name && item.department_name.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesSize = sizeFilter === 'all' || item.size_code === sizeFilter

      return matchesSearch && matchesStatus && matchesSize
    })
  }, [reportData, searchQuery, statusFilter, sizeFilter])

  // Paginated detailed inventory
  const paginatedCylinders = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredCylinders.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredCylinders, currentPage])

  const totalPages = Math.ceil(filteredCylinders.length / rowsPerPage) || 1

  // Excel Export
  const handleExportExcel = () => {
    if (!reportData) return
    try {
      // 1. Summary
      const summaryRows = [
        ['CYLINDER REPORT SUMMARY'],
        ['Hospital ID', user?.hospital_id || 'N/A'],
        ['Generated Date', new Date().toLocaleString()],
        ['Period', `${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}`],
        [],
        ['Metric', 'Value'],
        ['Total Cylinders', reportData.summary.totalCylinders],
        ['Active Cylinders (Full/In Use)', reportData.summary.activeCylinders],
        ['Total Warrant Allocation', reportData.summary.totalWarrantAmount],
        ['Total Expenses Spent', reportData.summary.totalExpenses],
        ['Budget Balance', reportData.summary.currentBalance],
        ['Budget Utilization (%)', reportData.summary.budgetUtilization.toFixed(2)],
        ['Runway (Months Remaining)', reportData.summary.runwayMonths],
        ['Total Deliveries Received', reportData.summary.totalDeliveries],
        ['Avg Monthly Consumption Qty', reportData.summary.avgMonthlyUsage.toFixed(1)]
      ]

      // 2. Inventory Status
      const invRows = [
        ['Cylinder Size/Type', 'Full Count', 'Empty Count', 'In Use Count', 'Maintenance Count'],
        ...reportData.inventory.byType.map(t => [t.type, t.full, t.empty, t.inUse, t.maintenance])
      ]

      // 3. Department Distribution
      const deptRows = [
        ['Department / Ward', 'Cylinders Allocated'],
        ...reportData.inventory.departmentDistribution.map(d => [d.department, d.count])
      ]

      // 4. Warrants
      const warrantRows = [
        ['Warrant Number', 'Vote Code', 'Warrant Date', 'Amount (RM)', 'Category'],
        ...reportData.warrants.list.map(w => [w.warrant_no, w.vote_code, w.warrant_date, w.amount, w.category])
      ]

      // 5. Deliveries
      const deliveryRows = [
        ['Delivery Order No', 'Reception Date', 'Items Count', 'Status', 'Total Value (RM)'],
        ...reportData.deliveries.recentDeliveries.map(d => [d.delivery_order_no, d.reception_date, d.items_count, d.status, d.total_amount])
      ]

      // 6. Daily Usage Trend (All Cylinder Types)
      const cylinderTypesList = (reportData.usage.byType || []).map(t => t.type)
      const dailyUsageRows = [
        ['Date', 'Day', 'Total Issued (Tanks)', 'Total Received (Tanks)', ...cylinderTypesList],
        ...(reportData.usage.dailyTrend || []).map(d => [
          d.date,
          d.dayOfWeek || '',
          d.issued || 0,
          d.received || 0,
          ...cylinderTypesList.map(t => d[t] || 0)
        ])
      ]

      // 7. Weekly Usage Trend (All Cylinder Types)
      const weeklyUsageRows = [
        ['Week', 'Start Date', 'End Date', 'Total Issued (Tanks)', 'Total Received (Tanks)', ...cylinderTypesList],
        ...(reportData.usage.weeklyTrend || []).map(w => [
          w.week,
          w.startDate || '',
          w.endDate || '',
          w.issued || 0,
          w.received || 0,
          ...cylinderTypesList.map(t => w[t] || 0)
        ])
      ]

      // 8. Detailed Cylinders
      const detailRows = [
        ['Serial Number', 'Size Code', 'Full Description', 'Status', 'Current Location', 'Assigned Ward', 'QR Tagged', 'Last Movement Date'],
        ...reportData.detailed.map(c => [
          c.serial_number,
          c.size_code,
          c.type_name,
          c.status.toUpperCase(),
          c.location_name,
          c.department_name || 'Store',
          c.qr_code ? 'YES' : 'NO',
          c.last_movement_date || 'N/A'
        ])
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Report Summary')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dailyUsageRows), 'Daily Usage Trend')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(weeklyUsageRows), 'Weekly Usage Trend')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(invRows), 'Inventory Status')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deptRows), 'Dept Allocation')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(warrantRows), 'Warrants & Budgets')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deliveryRows), 'Deliveries')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detailRows), 'Cylinder Register')

      XLSX.writeFile(wb, `Cylinder_Report_${dateRangePreset}_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Excel Export Complete', 'Full workbook with detail sheets downloaded.')
    } catch (e) {
      toast.error('Excel Export Failed', e instanceof Error ? e.message : 'Unknown error')
    }
  }

  // PDF Export
  const handleExportPdf = () => {
    if (!reportData) return
    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const startX = 14
      let currentY = 15

      // Title
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 41, 59)
      doc.text('HOSPITAL CYLINDER MANAGEMENT SYSTEM', startX, currentY)
      currentY += 6

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Official Cylinder Inventory, Consumption, & Financial Runway Report`, startX, currentY)
      currentY += 8

      // Divider line
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(startX, currentY, 210 - startX, currentY)
      currentY += 8

      // Meta Info Block
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text('REPORT DETAILS', startX, currentY)
      currentY += 5

      doc.setFont('Helvetica', 'normal')
      doc.text(`Hospital ID: ${user?.hospital_id || 'N/A'}`, startX, currentY)
      doc.text(`Generated Date: ${new Date().toLocaleString()}`, 110, currentY)
      currentY += 5
      doc.text(`Period: ${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}`, startX, currentY)
      doc.text(`Runway Status: ${reportData.summary.runwayMonths} Months Remaining`, 110, currentY)
      currentY += 10

      // Summary Table
      doc.setFont('Helvetica', 'bold')
      doc.text('EXECUTIVE EXECUTIVE METRICS', startX, currentY)
      currentY += 4

      const summaryTableData = [
        ['Total Oxygen Cylinders', String(reportData.summary.totalCylinders), 'Warrant Budget Allocations', `RM ${reportData.summary.totalWarrantAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['Active Cylinders (In Use / Full)', String(reportData.summary.activeCylinders), 'Expenditures / Spent to Date', `RM ${reportData.summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['Utilization Ratio', `${reportData.inventory.utilizationRate.toFixed(1)}%`, 'Remaining Balance', `RM ${reportData.summary.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ['Total Deliveries Made', String(reportData.summary.totalDeliveries), 'Budget Utilization (%)', `${reportData.summary.budgetUtilization.toFixed(1)}%`]
      ]

      autoTable(doc, {
        startY: currentY,
        head: [],
        body: summaryTableData,
        theme: 'plain',
        styles: { fontSize: 8.5, cellPadding: 2, fontStyle: 'normal' },
        columnStyles: {
          0: { fontStyle: 'bold', width: 50 },
          1: { width: 35 },
          2: { fontStyle: 'bold', width: 55 },
          3: { width: 45 }
        }
      })
      currentY = (doc as any).lastAutoTable.finalY + 10

      // Inventory Distribution Table
      doc.setFont('Helvetica', 'bold')
      doc.text('CYLINDER INVENTORY BY STATUS & TYPE', startX, currentY)
      currentY += 4

      const invHeaders = [['Cylinder Size/Type', 'Full Count', 'Empty Count', 'In Use Count', 'Maintenance Count']]
      const invBody = reportData.inventory.byType.map(t => [
        t.type,
        String(t.full),
        String(t.empty),
        String(t.inUse),
        String(t.maintenance)
      ])

      autoTable(doc, {
        startY: currentY,
        head: invHeaders,
        body: invBody,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], fontSize: 8.5 },
        styles: { fontSize: 8, cellPadding: 2.5 }
      })
      currentY = (doc as any).lastAutoTable.finalY + 10

      // Warrants List Table
      doc.setFont('Helvetica', 'bold')
      doc.text('Oxygen Warrants List', startX, currentY)
      currentY += 4

      const wHeaders = [['Warrant No', 'Vote Code', 'Category', 'Warrant Date', 'Amount']]
      const wBody = reportData.warrants.list.map(w => [
        w.warrant_no,
        w.vote_code,
        w.category,
        w.warrant_date,
        `RM ${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ])

      autoTable(doc, {
        startY: currentY,
        head: wHeaders,
        body: wBody,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246], fontSize: 8.5 },
        styles: { fontSize: 8, cellPadding: 2.5 }
      })

      // Add a page for detailed inventory register
      doc.addPage()
      currentY = 15

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('CYLINDER DETAIL REGISTER (ACTIVE)', startX, currentY)
      currentY += 6

      const detailHeaders = [['Serial Number', 'Size Code', 'Status', 'Assigned Location', 'QR Code Tagged']]
      const detailBody = reportData.detailed.slice(0, 35).map(c => [
        c.serial_number,
        c.size_code,
        c.status.toUpperCase(),
        c.location_name || 'Central Store',
        c.qr_code ? 'YES' : 'NO'
      ])

      autoTable(doc, {
        startY: currentY,
        head: detailHeaders,
        body: detailBody,
        theme: 'striped',
        headStyles: { fillColor: [100, 116, 139], fontSize: 8.5 },
        styles: { fontSize: 8, cellPadding: 2 }
      })

      doc.setFont('Helvetica', 'italic')
      doc.setFontSize(8)
      doc.text('* Note: Cylinder Detail Register shows the first 35 records. Full register is available in the Excel export.', startX, (doc as any).lastAutoTable.finalY + 5)

      doc.save(`Cylinder_Report_Doc_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('PDF Export Complete', 'Cylinder report document downloaded.')
    } catch (e) {
      toast.error('PDF Export Failed', e instanceof Error ? e.message : 'Unknown error')
    }
  }

  // Pre-load layout stats
  const activeStats = useMemo(() => {
    if (!reportData) return null
    return reportData.summary
  }, [reportData])

  return (
    <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pb-12 font-sans antialiased text-slate-800 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#00a68a]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#00a68a]/3 to-transparent blur-3xl pointer-events-none" />
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200/40 px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#e6f7f4] text-[#00a68a] text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase">Oxygen Module</span>
            <span className="text-slate-300 text-xs">/</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Reports</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Cylinder Report Dashboard
            <span className="h-1.5 w-1.5 rounded-full bg-[#00a68a] animate-pulse" />
          </h1>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Buttons */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center gap-0.5 border border-slate-200/20">
            {[
              { id: '1month', label: '1M' },
              { id: '3months', label: '3M' },
              { id: '6months', label: '6M' },
              { id: '12months', label: '12M' },
              { id: 'custom', label: 'Custom' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setDateRangePreset(p.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase transition-all duration-150",
                  dateRangePreset === p.id
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/30"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {dateRangePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-lg">
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[11px] font-semibold text-slate-700 w-28"
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[11px] font-semibold text-slate-700 w-28"
              />
            </div>
          )}

          {/* Reload & Exports */}
          <button
            onClick={fetchReport}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#00a68a] hover:border-slate-300 hover:shadow-sm transition-all duration-150"
            title="Reload Report"
            disabled={loading}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-[#00a68a]")} />
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm transition-all duration-150"
            disabled={!reportData || loading}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#00a68a] hover:bg-[#008c75] rounded-lg text-xs font-semibold text-white shadow-sm hover:shadow transition-all duration-150"
            disabled={!reportData || loading}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF Report</span>
          </button>
        </div>
      </div>

      <div className="w-full px-6 mt-6">
        {/* Dynamic Tab Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row items-center gap-1.5 p-1 bg-slate-100/60 border border-slate-200/30 rounded-xl mb-6 relative z-10">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center justify-center lg:justify-start gap-2 px-3 py-2 text-[10px] lg:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 rounded-lg relative w-full lg:w-auto",
                isActive
                  ? "text-[#00a68a] bg-white shadow-sm border border-slate-200/30"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/30"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-[#00a68a]" : "text-slate-400")} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

        {/* Main Content Area */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[400px] flex flex-col items-center justify-center bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
              >
                <Spinner className="w-8 h-8 text-[#00a68a] mb-3 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Aggregating Cylinder Data...</p>
                <p className="text-[11px] text-slate-400 mt-1">Fetching latest warrants, receptions, inventory and calculating forecasts.</p>
              </motion.div>
            ) : !reportData ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[400px] flex flex-col items-center justify-center bg-white border border-slate-200/60 rounded-xl p-6 text-center shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-3.5 text-slate-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No Report Data Available</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
                  We could not fetch or generate report statistics for this timeframe. Ensure that the database is connected.
                </p>
                <button
                  onClick={fetchReport}
                  className="inline-flex items-center justify-center px-4 py-2 bg-[#00a68a] hover:bg-[#008d74] text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                  Retry Loading
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              >
                {/* ─── TAB 1: EXECUTIVE SUMMARY ───────────────────────────────── */}
                {activeTab === 'executive' && (
                  <div className="space-y-6">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                      <KpiCard label="Total Cylinders" value={reportData.summary.totalCylinders} icon={Boxes} color="teal" delay={0.05} />
                      <KpiCard label="Active Cylinders" value={reportData.summary.activeCylinders} icon={CheckCircle2} color="teal" delay={0.1} />
                      <KpiCard label={"Warrant Amount " + fySuffix} value={reportData.summary.totalWarrantAmount} prefix="RM " icon={Landmark} color="teal" delay={0.15} />
                      <KpiCard label={"Total Expenses " + fySuffix} value={reportData.summary.totalExpenses} prefix="RM " icon={History} color="rose" delay={0.2} />
                      <KpiCard label="Deliveries Made" value={reportData.summary.totalDeliveries} icon={Download} color="slate" delay={0.25} />
                      <KpiCard label="Runway Remaining" value={reportData.summary.runwayMonths} suffix=" Mo" icon={TrendingUp} color="amber" delay={0.3} decimals={1} />
                    </div>

                    {/* Chart & Breakdowns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Cumulative Warrant Allocations vs Expenses */}
                      <div className="lg:col-span-2 bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                          <SectionHeader title="Cumulative Warrant Budget vs Spent" subtitle="Financial Flow (FY26)" icon={Landmark} />
                          <span className="text-[10px] font-bold text-[#00a68a] bg-[#e6f7f4] border border-[#00a68a]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            Budget Burn-up
                          </span>
                        </div>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cumulativeTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                              <defs>
                                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.06}/>
                                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.005}/>
                                </linearGradient>
                                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#00a68a" stopOpacity={0.15}/>
                                  <stop offset="95%" stopColor="#00a68a" stopOpacity={0.01}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} tickFormatter={val => `RM ${val >= 1000 ? (val/1000)+'K' : val}`} />
                              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.04)', strokeWidth: 1 }} />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: 9.5, fontWeight: 'semibold', paddingTop: 10 }} />
                              <Area type="stepAfter" name="Cumulative Budget (Allocated)" dataKey="Cumulative Budget" stroke="#64748b" strokeWidth={1.5} fill="url(#budgetGrad)" strokeDasharray="4 4" />
                              <Area type="monotone" name="Cumulative Spent (Expenses)" dataKey="Cumulative Spent" stroke="#00a68a" strokeWidth={2.5} fill="url(#spentGrad)" dot={{ r: 3.5, stroke: '#00a68a', strokeWidth: 1.5, fill: '#fff' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Right: Circular Progress Ring & Quick Stats */}
                      <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between">
                        <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                          <SectionHeader title="Budget Utilization Overview" subtitle="Vote Category Balance" icon={PieChartIcon} />
                          {reportData.summary.currentBalance >= 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#e6f7f4] text-[#00a68a] border border-[#00a68a]/10">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#00a68a] animate-pulse" />
                              Within Budget
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200/40 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Budget Exceeded
                            </span>
                          )}
                        </div>
                        
                        <div className="my-6">
                          <ProgressRing percentage={reportData.summary.budgetUtilization} color="#00a68a" size={160} strokeWidth={10} />
                        </div>

                        <div className="w-full bg-slate-50/50 border border-slate-100 rounded-lg p-3 flex justify-between gap-4 font-sans text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[8px] mb-1">Total Available</span>
                            <span className="font-bold text-slate-800 text-xs font-mono">{formatCurrency(reportData.summary.totalWarrantAmount).replace('MYR', 'RM')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[8px] mb-1">Remaining Balance</span>
                            <span className={cn("font-bold text-xs font-mono", reportData.summary.currentBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                              {formatCurrency(reportData.summary.currentBalance).replace('MYR', 'RM')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: Top consumption departments & Status Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Side: Status Donut Chart */}
                      <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                        <SectionHeader title="Cylinder Status Distribution" subtitle="Active Inventory Breakdown" icon={Boxes} />
                        <div className="h-[250px] w-full flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip content={<CustomTooltip />} />
                              <Pie
                                data={reportData.inventory.byStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="count"
                                nameKey="status"
                              >
                                {reportData.inventory.byStatus.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>

                          {/* Center Absolute Label */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{reportData.summary.totalCylinders}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total Tanks</span>
                          </div>
                        </div>

                        {/* Legends */}
                        <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold text-slate-650">
                          {reportData.inventory.byStatus.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100/80">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getStatusColor(entry.status) }} />
                              <span className="truncate text-slate-600 font-semibold">{entry.status}</span>
                              <span className="font-mono text-slate-800 ml-auto font-bold">{entry.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Top Consuming Departments */}
                      <div className="lg:col-span-2 bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                        <div>
                          <SectionHeader title="Top Consuming Departments & Wards" subtitle="Oxygen Consumption" icon={Activity} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-2">
                          {!reportData.usage.topConsumingDepartments || reportData.usage.topConsumingDepartments.length === 0 ? (
                            <div className="col-span-2 py-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                              <Activity className="w-8 h-8 text-slate-350 mb-2 stroke-[1.5] animate-pulse" />
                              <span className="font-semibold text-slate-500">No consumption data logged</span>
                              <span className="text-[10px] text-slate-450 mt-0.5">Use the Oxygen module to log department consumption.</span>
                            </div>
                          ) : (
                            reportData.usage.topConsumingDepartments.slice(0, 6).map((dept, idx) => {
                              const maxVal = reportData.usage.topConsumingDepartments[0]?.usage || 100
                              return (
                                <HorizontalBar
                                  key={idx}
                                  label={dept.department}
                                  value={dept.usage}
                                  max={maxVal}
                                  color="#00a68a"
                                  suffix=" Cyls"
                                  delay={idx * 0.05}
                                />
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: WARRANT & BUDGET ───────────────────────────────── */}
                {activeTab === 'warrant' && (
                  <div className="space-y-6">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <KpiCard label={"Warrant Allocation " + fySuffix} value={reportData.summary.totalWarrantAmount} prefix="RM " icon={Landmark} color="teal" />
                      <KpiCard label={"Total Spent " + fySuffix} value={reportData.summary.totalExpenses} prefix="RM " icon={History} color="rose" />
                      <KpiCard label="Available Balance" value={reportData.summary.currentBalance} prefix="RM " icon={CheckCircle2} color={reportData.summary.currentBalance >= 0 ? "teal" : "rose"} />
                      <KpiCard label="Budget Utilized" value={reportData.summary.budgetUtilization} suffix="%" icon={Activity} color="amber" decimals={1} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Stacked Bar Chart: warrant spend by vote code */}
                      <div className="lg:col-span-2 bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                        <SectionHeader title="Monthly Allocations vs Expenses Trend" subtitle="Warrants Breakdown" icon={BarChart3} />
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.warrants.monthlyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} tickFormatter={val => `RM ${val >= 1000 ? (val/1000)+'K' : val}`} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.01)' }} />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: 9.5, fontWeight: 'semibold', paddingTop: 10 }} />
                              <Bar name="Budget Allocated" dataKey="allocated" fill="#64748b" radius={[4, 4, 0, 0]} barSize={12} />
                              <Bar name="Actual Spent" dataKey="spent" fill="#00a68a" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Vote code distribution */}
                      <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                        <div>
                          <SectionHeader title="Utilization by Vote Code" subtitle="Vote Allotments" icon={PieChartIcon} />
                        </div>
                        <div className="h-[200px] w-full flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip content={<CustomTooltip />} />
                              <Pie
                                data={reportData.warrants.utilizationByVoteCode}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="spent"
                                nameKey="voteCode"
                              >
                                {reportData.warrants.utilizationByVoteCode.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Vote table */}
                        <div className="space-y-2 mt-4 text-[10px] font-bold text-slate-650">
                          {reportData.warrants.utilizationByVoteCode.map((v, idx) => {
                            const util = v.allocated > 0 ? (v.spent / v.allocated) * 100 : 0
                            return (
                              <div key={idx} className="flex flex-col p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center justify-between font-bold text-slate-800 text-xs">
                                  <span>Vote {v.voteCode}</span>
                                  <span className="text-[#00a68a] font-mono">{util.toFixed(1)}% Utilized</span>
                                </div>
                                <div className="flex justify-between text-slate-400 font-semibold mt-1 font-mono text-[9px]">
                                  <span>Allocated: RM {v.allocated.toLocaleString()}</span>
                                  <span>Spent: RM {v.spent.toLocaleString()}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Warrants Listing Table */}
                    <div className="bg-white border border-slate-200/50 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                      <div className="p-5.5 border-b border-slate-100 flex items-center justify-between">
                        <SectionHeader title="Warrants Registered" subtitle="All Oxygen Funds Received" icon={Landmark} />
                        <span className="text-[10px] bg-[#e6f7f4] text-[#00a68a] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {reportData.warrants.list.length} Warrants Total
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/60 bg-slate-50/60 text-xs font-semibold text-slate-500">
                              <th className="px-6 py-3.5">Warrant Number</th>
                              <th className="px-6 py-3.5">Vote Code</th>
                              <th className="px-6 py-3.5">Category</th>
                              <th className="px-6 py-3.5">Issue Date</th>
                              <th className="px-6 py-3.5 text-right">Amount (RM)</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-normal text-slate-600 divide-y divide-slate-100">
                            {reportData.warrants.list.map(w => (
                              <tr key={w.id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">{w.warrant_no}</td>
                                <td className="px-6 py-3.5">
                                  <span className="bg-slate-50 border border-slate-200/60 text-slate-500 text-[10px] px-2 py-0.5 rounded font-mono font-medium">{w.vote_code}</span>
                                </td>
                                <td className="px-6 py-3.5 capitalize text-slate-600 font-medium">{w.category.replace('_', ' ')}</td>
                                <td className="px-6 py-3.5 text-slate-500 font-mono text-[11px]">{new Date(w.warrant_date).toLocaleDateString()}</td>
                                <td className="px-6 py-3.5 text-right font-mono font-semibold text-slate-900 tabular-nums">RM {w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: USAGE ANALYTICS ─────────────────────────────────── */}
                {activeTab === 'usage' && (
                  <div className="space-y-6">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <KpiCard 
                        label={usageTrendGranularity === 'daily' ? "Average Daily Usage" : usageTrendGranularity === 'weekly' ? "Average Weekly Usage" : "Average Monthly Usage"} 
                        value={usageTrendGranularity === 'daily' ? (reportData.summary.avgDailyUsage || 0) : usageTrendGranularity === 'weekly' ? (reportData.summary.avgWeeklyUsage || 0) : reportData.summary.avgMonthlyUsage} 
                        suffix={usageTrendGranularity === 'daily' ? " Tanks/Day" : usageTrendGranularity === 'weekly' ? " Tanks/Wk" : " Tanks/Mo"} 
                        icon={Activity} 
                        color="teal" 
                        decimals={1} 
                        trend={{ val: 4.8, isUp: true }}
                      />
                      <KpiCard 
                        label="Peak Consumption Volume" 
                        value={usageTrendGranularity === 'daily' ? (reportData.summary.peakDayUsage?.count || peakMonthDemandInfo.value) : usageTrendGranularity === 'weekly' ? (reportData.summary.peakWeekUsage?.count || peakMonthDemandInfo.value) : peakMonthDemandInfo.value} 
                        suffix=" Tanks" 
                        icon={TrendingUp} 
                        color="teal" 
                        trend={{ val: 12.3, isUp: true }}
                      />
                      <KpiCard 
                        label="Top Used Size" 
                        value={topUsedSize.count} 
                        prefix="" 
                        suffix={` (${topUsedSize.type})`} 
                        icon={Boxes} 
                        color="teal" 
                      />
                      <KpiCard 
                        label="Active Wards" 
                        value={reportData.usage.byDepartment.length} 
                        icon={Landmark} 
                        color="slate" 
                      />
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily & Weekly Velocity</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">
                          {(reportData.summary.avgDailyUsage || 0).toFixed(1)} / day • {(reportData.summary.avgWeeklyUsage || 0).toFixed(1)} / week
                        </span>
                      </div>
                      <div className="flex flex-col sm:border-l border-slate-200/60 sm:pl-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peak Demand Record</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">
                          {reportData.summary.peakDayUsage?.formattedDate && reportData.summary.peakDayUsage.count > 0
                            ? `${reportData.summary.peakDayUsage.formattedDate} (${reportData.summary.peakDayUsage.count} Tanks)`
                            : `${peakMonthDemandInfo.month} (${peakMonthDemandInfo.value} Tanks)`}
                        </span>
                      </div>
                      <div className="flex flex-col lg:border-l border-slate-200/60 lg:pl-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Cylinder Share</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{topUsedSize.type} ({topUsedSize.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="flex flex-col lg:border-l border-slate-200/60 lg:pl-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Consuming Ward</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{topDepartmentInfo.department} ({topDepartmentInfo.count} Tanks)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Side: Trends & Performance Dashboard */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Usage Trend Chart with Daily, Weekly & Monthly View + All Types Comparison */}
                        <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-100 pb-3.5">
                            <SectionHeader 
                              title={
                                usageTrendGranularity === 'daily'
                                  ? 'Daily Usage Trend'
                                  : usageTrendGranularity === 'weekly'
                                  ? 'Weekly Usage Trend'
                                  : 'Monthly Usage Trend'
                              } 
                              subtitle={
                                usageTrendGranularity === 'daily'
                                  ? 'Daily Oxygen Velocity & Restock Volume'
                                  : usageTrendGranularity === 'weekly'
                                  ? 'Weekly Oxygen Consumption Volume'
                                  : 'Monthly Oxygen Consumption Volume'
                              } 
                              icon={Activity} 
                            />
                            
                            {/* Controls: Granularity Toggle + View Mode + Cylinder Size Chips */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Daily / Weekly / Monthly Switcher */}
                              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/40 shrink-0">
                                {(['daily', 'weekly', 'monthly'] as const).map(gran => (
                                  <button
                                    key={gran}
                                    onClick={() => setUsageTrendGranularity(gran)}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-150",
                                      usageTrendGranularity === gran
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/40"
                                        : "text-slate-500 hover:text-slate-800"
                                    )}
                                  >
                                    {gran === 'daily' ? 'Daily' : gran === 'weekly' ? 'Weekly' : 'Monthly'}
                                  </button>
                                ))}
                              </div>

                              {/* View Mode Toggle when 'all' sizes is chosen */}
                              {selectedTrendSize === 'all' && (
                                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/40 shrink-0">
                                  <button
                                    onClick={() => setUsageViewMode('metric')}
                                    className={cn(
                                      "px-2 py-1 text-[10px] font-bold rounded-md transition-all duration-150",
                                      usageViewMode === 'metric'
                                        ? "bg-[#00a68a] text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                    )}
                                    title="Compare Total Issued to Wards vs Received from Supplier"
                                  >
                                    Issued vs Received
                                  </button>
                                  <button
                                    onClick={() => setUsageViewMode('types')}
                                    className={cn(
                                      "px-2 py-1 text-[10px] font-bold rounded-md transition-all duration-150",
                                      usageViewMode === 'types'
                                        ? "bg-[#00a68a] text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                    )}
                                    title="Compare daily/weekly trends across all cylinder types side-by-side"
                                  >
                                    Compare All Types
                                  </button>
                                </div>
                              )}

                              {/* Toggle Pill Chips for Cylinder Types */}
                              <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-100 p-0.5 rounded-lg shrink-0">
                                <button
                                  onClick={() => setSelectedTrendSize('all')}
                                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 ${
                                    selectedTrendSize === 'all'
                                      ? 'bg-[#00a68a] text-white shadow-sm'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  All Sizes
                                </button>
                                {reportData.usage.byType.map((typeObj: any) => (
                                  <button
                                    key={typeObj.type}
                                    onClick={() => setSelectedTrendSize(typeObj.type)}
                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 ${
                                      selectedTrendSize === typeObj.type
                                        ? 'bg-[#00a68a] text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    {typeObj.type}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="h-[290px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={dynamicTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} minTickGap={20} />
                                <YAxis stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.04)', strokeWidth: 1 }} />
                                
                                {selectedTrendSize === 'all' && usageViewMode === 'types' ? (
                                  <>
                                    <Legend 
                                      verticalAlign="top" 
                                      height={36} 
                                      iconType="circle" 
                                      wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} 
                                    />
                                    {reportData.usage.byType.map((typeObj: any, idx: number) => {
                                      const color = getCylinderColor(typeObj.type, idx)
                                      return (
                                        <Line 
                                          key={typeObj.type}
                                          type="monotone" 
                                          dataKey={typeObj.type} 
                                          name={`${typeObj.type} (Tanks)`} 
                                          stroke={color} 
                                          strokeWidth={2} 
                                          dot={{ r: 3, strokeWidth: 0, fill: color }} 
                                          activeDot={{ r: 5, strokeWidth: 0 }} 
                                        />
                                      )
                                    })}
                                  </>
                                ) : (
                                  <>
                                    <Legend 
                                      verticalAlign="top" 
                                      height={36} 
                                      iconType="circle" 
                                      wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} 
                                      payload={[
                                        { value: 'Issued to Wards (Tanks)', type: 'circle', id: 'issued', color: '#00a68a' },
                                        { value: 'Received from Supplier (Tanks)', type: 'circle', id: 'received', color: '#3b82f6' }
                                      ]}
                                    />
                                    <Bar 
                                      dataKey="issued" 
                                      legendType="none"
                                      fill="#00a68a" 
                                      fillOpacity={0.06} 
                                      stroke="#00a68a"
                                      strokeWidth={1}
                                      strokeOpacity={0.15}
                                      radius={[4, 4, 0, 0]} 
                                      barSize={usageTrendGranularity === 'daily' ? 12 : 20} 
                                    />
                                    <Bar 
                                      dataKey="received" 
                                      legendType="none"
                                      fill="#3b82f6" 
                                      fillOpacity={0.06} 
                                      stroke="#3b82f6"
                                      strokeWidth={1}
                                      strokeOpacity={0.15}
                                      radius={[4, 4, 0, 0]} 
                                      barSize={usageTrendGranularity === 'daily' ? 12 : 20} 
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="issued" 
                                      name="Issued to Wards (Tanks)" 
                                      stroke="#00a68a" 
                                      strokeWidth={2} 
                                      dot={{ r: 3, strokeWidth: 0, fill: "#00a68a" }} 
                                      activeDot={{ r: 5, strokeWidth: 0 }} 
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="received" 
                                      name="Received from Supplier (Tanks)" 
                                      stroke="#3b82f6" 
                                      strokeWidth={2} 
                                      dot={{ r: 3, strokeWidth: 0, fill: "#3b82f6" }} 
                                      activeDot={{ r: 5, strokeWidth: 0 }} 
                                    />
                                  </>
                                )}
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Performance Matrix Section with Weekly, Daily & Quarterly Switcher */}
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
                          {/* Luxury Top Accent Strip */}
                          <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-blue-500" />
                          
                          {/* Header Area */}
                          <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-100/70 dark:from-teal-950/40 dark:to-emerald-950/20 border border-teal-200/50 dark:border-teal-800/30 flex items-center justify-center shrink-0 shadow-xs">
                                  {breakdownView === 'daily' ? (
                                    <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                  ) : breakdownView === 'quarterly' ? (
                                    <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                  ) : (
                                    <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                      {breakdownView === 'weekly'
                                        ? 'Weekly Usage Performance & Cylinder Size Breakdown'
                                        : breakdownView === 'daily'
                                        ? 'Daily Usage Performance & Oxygen Velocity'
                                        : 'Quarterly Usage Matrix & Refill Distribution'}
                                    </h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50">
                                      {breakdownView} Active
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {breakdownView === 'weekly'
                                      ? 'Weekly consumption volume stratified by each cylinder size (D, E, F, N, HS)'
                                      : breakdownView === 'daily'
                                      ? 'Daily oxygen velocity, restock pace, and peak demand across all cylinder sizes'
                                      : 'Quarterly aggregated dispatch volume and seasonal consumption trends by size'}
                                  </p>
                                </div>
                              </div>

                              {/* Right Header: Quick stats + Breakdown Switcher */}
                              <div className="flex flex-wrap items-center gap-2.5">
                                <div className="hidden sm:flex items-center gap-2 mr-1">
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                                    <span className="text-slate-400 font-medium">Period Total:</span>
                                    <span className="font-bold text-slate-900 dark:text-white font-mono">{totalPeriodTanks}</span>
                                    <span className="text-[10px] text-slate-400">tanks</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-800/50 text-[11px]">
                                    <span className="text-teal-600 dark:text-teal-400 font-medium">
                                      {breakdownView === 'daily' ? 'Daily Avg:' : 'Weekly Avg:'}
                                    </span>
                                    <span className="font-bold text-teal-700 dark:text-teal-300 font-mono">
                                      {breakdownView === 'daily'
                                        ? (reportData.summary.avgDailyUsage || 0).toFixed(1)
                                        : (reportData.summary.avgWeeklyUsage || 0).toFixed(1)}
                                    </span>
                                    <span className="text-[10px] text-teal-600/80">
                                      {breakdownView === 'daily' ? '/day' : '/wk'}
                                    </span>
                                  </div>
                                </div>

                                {/* Granularity Switcher Pills */}
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                                  {(['weekly', 'daily', 'quarterly'] as const).map(bView => (
                                    <button
                                      key={bView}
                                      onClick={() => setBreakdownView(bView)}
                                      className={cn(
                                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-150",
                                        breakdownView === bView
                                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/40 dark:border-slate-600 font-extrabold"
                                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                      )}
                                    >
                                      {bView === 'weekly' ? 'Weekly' : bView === 'daily' ? 'Daily' : 'Quarterly'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Interactive Control & Filter Subbar */}
                            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              {/* Chart Mode Toggle */}
                              <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">View:</span>
                                <button
                                  onClick={() => setMatrixChartMode('stacked')}
                                  className={cn(
                                    "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5",
                                    matrixChartMode === 'stacked'
                                      ? "bg-[#00a68a] text-white shadow-xs"
                                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                  )}
                                  title="Stacked breakdown of each cylinder size (D, E, F, N, HS)"
                                >
                                  <Layers className="w-3 h-3" />
                                  Stacked Sizes
                                </button>
                                <button
                                  onClick={() => setMatrixChartMode('grouped')}
                                  className={cn(
                                    "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5",
                                    matrixChartMode === 'grouped'
                                      ? "bg-[#00a68a] text-white shadow-xs"
                                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                  )}
                                  title="Side-by-side grouped bars for comparison"
                                >
                                  <BarChart2 className="w-3 h-3" />
                                  Grouped
                                </button>
                                <button
                                  onClick={() => setMatrixChartMode('total')}
                                  className={cn(
                                    "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
                                    matrixChartMode === 'total'
                                      ? "bg-[#00a68a] text-white shadow-xs"
                                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                  )}
                                  title="Total volume single bar"
                                >
                                  Total Only
                                </button>
                              </div>

                              {/* Quick Filter Pills by Cylinder Size */}
                              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                                  <Filter className="w-2.5 h-2.5" />
                                  Filter:
                                </span>
                                <button
                                  onClick={() => setMatrixSizeFilter('all')}
                                  className={cn(
                                    "px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all shrink-0 uppercase tracking-wider",
                                    matrixSizeFilter === 'all'
                                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                  )}
                                >
                                  All Sizes
                                </button>
                                {cylinderTypesList.map((typeStr, idx) => {
                                  const meta = getCylinderMeta(typeStr)
                                  const color = getCylinderColor(typeStr, idx)
                                  const isSelected = matrixSizeFilter === typeStr
                                  return (
                                    <button
                                      key={typeStr}
                                      onClick={() => setMatrixSizeFilter(isSelected ? 'all' : typeStr)}
                                      onMouseEnter={() => setHoveredMatrixType(typeStr)}
                                      onMouseLeave={() => setHoveredMatrixType(null)}
                                      className={cn(
                                        "px-2 py-1 text-[10px] font-bold rounded-md border transition-all shrink-0 flex items-center gap-1.5",
                                        isSelected
                                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs ring-1"
                                          : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                      )}
                                      style={{
                                        borderColor: isSelected ? color : undefined,
                                        boxShadow: isSelected ? `0 0 0 1px ${color}` : undefined
                                      }}
                                    >
                                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                      <span>{meta.label}</span>
                                      <span className="text-[9px] opacity-70 font-mono">({meta.code})</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          {/* 1. WEEKLY BREAKDOWN VIEW */}
                          {breakdownView === 'weekly' && (
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Chart (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {matrixSizeFilter === 'all'
                                          ? matrixChartMode === 'stacked'
                                            ? 'Weekly Volume by Cylinder Size'
                                            : matrixChartMode === 'grouped'
                                            ? 'Weekly Comparison by Size'
                                            : 'Weekly Overall Totals'
                                          : `Weekly Volume: ${getCylinderMeta(matrixSizeFilter).label}`}
                                      </span>
                                      <span className="text-[10px] font-bold text-[#00a68a] bg-[#e6f7f4] dark:bg-teal-950/60 px-2 py-0.5 rounded-full font-mono border border-teal-200/50">
                                        {(reportData.summary.avgWeeklyUsage || 0).toFixed(1)} / wk
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                      {matrixSizeFilter === 'all'
                                        ? 'Tanks dispatched each week, broken down by individual cylinder size (D, E, F, N, HS)'
                                        : `Displaying consumption for ${getCylinderMeta(matrixSizeFilter).full}`}
                                    </p>
                                  </div>

                                  <div className="h-[240px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={weeklyOverallTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <Tooltip content={<PerformanceMatrixTooltip />} />

                                        {matrixSizeFilter !== 'all' ? (
                                          <Bar
                                            dataKey={matrixSizeFilter}
                                            name={getCylinderMeta(matrixSizeFilter).label}
                                            fill={getCylinderColor(matrixSizeFilter, 0)}
                                            radius={[4, 4, 0, 0]}
                                            barSize={20}
                                          />
                                        ) : matrixChartMode === 'total' ? (
                                          <Bar
                                            dataKey="total"
                                            name="Total Dispatched"
                                            fill="#00a68a"
                                            radius={[4, 4, 0, 0]}
                                            barSize={22}
                                          />
                                        ) : matrixChartMode === 'grouped' ? (
                                          cylinderTypesList.map((typeStr, idx) => (
                                            <Bar
                                              key={typeStr}
                                              dataKey={typeStr}
                                              name={getCylinderMeta(typeStr).label}
                                              fill={getCylinderColor(typeStr, idx)}
                                              radius={[3, 3, 0, 0]}
                                              barSize={8}
                                            />
                                          ))
                                        ) : (
                                          cylinderTypesList.map((typeStr, idx) => (
                                            <Bar
                                              key={typeStr}
                                              dataKey={typeStr}
                                              name={getCylinderMeta(typeStr).label}
                                              stackId="weeklyStack"
                                              fill={getCylinderColor(typeStr, idx)}
                                              barSize={20}
                                              radius={idx === cylinderTypesList.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                            />
                                          ))
                                        )}
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>

                                  {/* Interactive Size Legend Below Chart */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
                                    {cylinderTypesList.map((t, idx) => {
                                      const meta = getCylinderMeta(t)
                                      const color = getCylinderColor(t, idx)
                                      const isDimmed = matrixSizeFilter !== 'all' && matrixSizeFilter !== t
                                      return (
                                        <button
                                          key={t}
                                          onClick={() => setMatrixSizeFilter(matrixSizeFilter === t ? 'all' : t)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all border",
                                            isDimmed
                                              ? "opacity-35 border-transparent"
                                              : "opacity-100 border-slate-200/60 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100"
                                          )}
                                        >
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                          <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">({meta.code})</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Right Table (7 cols) */}
                                <div className="lg:col-span-7">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Weekly Performance Matrix (All Cylinder Sizes)
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {weeklyStats.rows.length} Sizes • Last {weeklyStats.weekKeys.length} Weeks
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                    <table className="w-full text-[11px] text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">Cylinder Size / Type</th>
                                          {weeklyStats.weekKeys.map(wk => (
                                            <th key={wk} className="px-2 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">{wk}</th>
                                          ))}
                                          <th className="px-2.5 py-2.5 text-center font-bold text-[#00a68a] bg-teal-50/40 dark:bg-teal-950/20">Wk Avg</th>
                                          <th className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                        {weeklyStats.rows.map((row: any, rIdx: number) => {
                                          const meta = getCylinderMeta(row.type)
                                          const color = getCylinderColor(row.type, rIdx)
                                          const isSelected = matrixSizeFilter === row.type
                                          const isDimmed = matrixSizeFilter !== 'all' && !isSelected
                                          const grandTotal = weeklyStats.rows.reduce((sum: number, r: any) => sum + r.total, 0) || 1
                                          const pct = ((row.total / grandTotal) * 100).toFixed(1)

                                          return (
                                            <tr
                                              key={row.type}
                                              onClick={() => setMatrixSizeFilter(isSelected ? 'all' : row.type)}
                                              onMouseEnter={() => setHoveredMatrixType(row.type)}
                                              onMouseLeave={() => setHoveredMatrixType(null)}
                                              className={cn(
                                                "cursor-pointer transition-colors duration-150",
                                                isSelected
                                                  ? "bg-teal-50/50 dark:bg-teal-950/30 font-medium"
                                                  : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                                                isDimmed && "opacity-35"
                                              )}
                                            >
                                              {/* Cylinder Size Badge */}
                                              <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-2xs"
                                                    style={{ backgroundColor: color }}
                                                  >
                                                    {meta.code}
                                                  </div>
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                                      {meta.label}
                                                    </span>
                                                    <span className="text-[9.5px] text-slate-400 font-mono truncate">
                                                      {meta.sub}
                                                    </span>
                                                  </div>
                                                </div>
                                              </td>

                                              {/* Weekly Counts */}
                                              {weeklyStats.weekKeys.map(wk => {
                                                const count = row.weekCounts[wk] || 0
                                                return (
                                                  <td key={wk} className="px-2 py-2 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                                                    {count > 0 ? (
                                                      <span className={cn(
                                                        "px-1.5 py-0.5 rounded text-[11px]",
                                                        count >= 20 ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold" : ""
                                                      )}>
                                                        {count}
                                                      </span>
                                                    ) : (
                                                      <span className="text-slate-300 dark:text-slate-600">-</span>
                                                    )}
                                                  </td>
                                                )
                                              })}

                                              {/* Wk Avg */}
                                              <td className="px-2.5 py-2 text-center tabular-nums bg-teal-50/20 dark:bg-teal-950/10">
                                                <span className="inline-block px-1.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono text-[#00a68a] bg-[#e6f7f4] dark:bg-teal-900/40">
                                                  {row.avgWeekly}
                                                </span>
                                              </td>

                                              {/* Total + Percentage Share */}
                                              <td className="px-3 py-2 text-right tabular-nums">
                                                <div className="flex flex-col items-end">
                                                  <span className="font-black font-mono text-slate-900 dark:text-white text-xs">
                                                    {row.total}
                                                  </span>
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                    <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                      <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${pct}%`, backgroundColor: color }}
                                                      />
                                                    </div>
                                                    <span className="text-[8.5px] font-mono text-slate-400">{pct}%</span>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                      {/* Grand Total Footer */}
                                      <tfoot>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-[11px]">
                                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                                            Total Dispatched
                                          </td>
                                          {weeklyStats.weekKeys.map(wk => {
                                            const colTotal = weeklyStats.rows.reduce((sum: number, r: any) => sum + (r.weekCounts[wk] || 0), 0)
                                            return (
                                              <td key={wk} className="px-2 py-2.5 text-center font-mono font-black text-slate-900 dark:text-white tabular-nums">
                                                {colTotal}
                                              </td>
                                            )
                                          })}
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-[#00a68a] tabular-nums bg-teal-50/40 dark:bg-teal-950/20">
                                            {(reportData.summary.avgWeeklyUsage || 0).toFixed(1)}
                                          </td>
                                          <td className="px-3 py-2.5 text-right font-black font-mono text-slate-900 dark:text-white tabular-nums">
                                            {weeklyStats.rows.reduce((sum: number, r: any) => sum + r.total, 0)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. DAILY BREAKDOWN VIEW */}
                          {breakdownView === 'daily' && (
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Chart (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {matrixSizeFilter === 'all'
                                          ? matrixChartMode === 'stacked'
                                            ? 'Daily Velocity by Cylinder Size (Recent 14 Days)'
                                            : matrixChartMode === 'grouped'
                                            ? 'Daily Size Comparison'
                                            : 'Daily Total Volume'
                                          : `Daily Volume: ${getCylinderMeta(matrixSizeFilter).label}`}
                                      </span>
                                      <span className="text-[10px] font-bold text-[#00a68a] bg-[#e6f7f4] dark:bg-teal-950/60 px-2 py-0.5 rounded-full font-mono border border-teal-200/50">
                                        {(reportData.summary.avgDailyUsage || 0).toFixed(1)} / day
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                      {matrixSizeFilter === 'all'
                                        ? 'Daily dispatched tanks across each cylinder size (D, E, F, N, HS)'
                                        : `Displaying daily consumption for ${getCylinderMeta(matrixSizeFilter).full}`}
                                    </p>
                                  </div>

                                  <div className="h-[240px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={dailyOverallTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={7.5} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} />
                                        <Tooltip content={<PerformanceMatrixTooltip />} />

                                        {matrixSizeFilter !== 'all' ? (
                                          <Bar
                                            dataKey={matrixSizeFilter}
                                            name={getCylinderMeta(matrixSizeFilter).label}
                                            fill={getCylinderColor(matrixSizeFilter, 0)}
                                            radius={[3, 3, 0, 0]}
                                            barSize={12}
                                          />
                                        ) : matrixChartMode === 'total' ? (
                                          <Bar
                                            dataKey="total"
                                            name="Total Dispatched"
                                            fill="#00a68a"
                                            radius={[3, 3, 0, 0]}
                                            barSize={14}
                                          />
                                        ) : matrixChartMode === 'grouped' ? (
                                          cylinderTypesList.map((typeStr, idx) => (
                                            <Bar
                                              key={typeStr}
                                              dataKey={typeStr}
                                              name={getCylinderMeta(typeStr).label}
                                              fill={getCylinderColor(typeStr, idx)}
                                              radius={[2, 2, 0, 0]}
                                              barSize={6}
                                            />
                                          ))
                                        ) : (
                                          cylinderTypesList.map((typeStr, idx) => (
                                            <Bar
                                              key={typeStr}
                                              dataKey={typeStr}
                                              name={getCylinderMeta(typeStr).label}
                                              stackId="dailyStack"
                                              fill={getCylinderColor(typeStr, idx)}
                                              barSize={12}
                                              radius={idx === cylinderTypesList.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                                            />
                                          ))
                                        )}
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>

                                  {/* Interactive Size Legend Below Chart */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
                                    {cylinderTypesList.map((t, idx) => {
                                      const meta = getCylinderMeta(t)
                                      const color = getCylinderColor(t, idx)
                                      const isDimmed = matrixSizeFilter !== 'all' && matrixSizeFilter !== t
                                      return (
                                        <button
                                          key={t}
                                          onClick={() => setMatrixSizeFilter(matrixSizeFilter === t ? 'all' : t)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all border",
                                            isDimmed
                                              ? "opacity-35 border-transparent"
                                              : "opacity-100 border-slate-200/60 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100"
                                          )}
                                        >
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                          <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">({meta.code})</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Right Table (7 cols) */}
                                <div className="lg:col-span-7">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Daily Performance Matrix (All Cylinder Sizes)
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {dailyStats.length} Sizes Tracked
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                    <table className="w-full text-[11px] text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">Cylinder Size / Type</th>
                                          <th className="px-2.5 py-2.5 text-center font-bold text-[#00a68a] bg-teal-50/40 dark:bg-teal-950/20">Daily Avg</th>
                                          <th className="px-2.5 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">Peak Day</th>
                                          <th className="px-2.5 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">Active Days</th>
                                          <th className="px-2.5 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">Share %</th>
                                          <th className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">Total Tanks</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                        {(dailyStats as any[]).map((d: any, dIdx: number) => {
                                          const meta = getCylinderMeta(d.type)
                                          const color = getCylinderColor(d.type, dIdx)
                                          const isSelected = matrixSizeFilter === d.type
                                          const isDimmed = matrixSizeFilter !== 'all' && !isSelected

                                          return (
                                            <tr
                                              key={d.type}
                                              onClick={() => setMatrixSizeFilter(isSelected ? 'all' : d.type)}
                                              onMouseEnter={() => setHoveredMatrixType(d.type)}
                                              onMouseLeave={() => setHoveredMatrixType(null)}
                                              className={cn(
                                                "cursor-pointer transition-colors duration-150",
                                                isSelected
                                                  ? "bg-teal-50/50 dark:bg-teal-950/30 font-medium"
                                                  : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                                                isDimmed && "opacity-35"
                                              )}
                                            >
                                              <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-2xs"
                                                    style={{ backgroundColor: color }}
                                                  >
                                                    {meta.code}
                                                  </div>
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                                      {meta.label}
                                                    </span>
                                                    <span className="text-[9.5px] text-slate-400 font-mono truncate">
                                                      {meta.sub}
                                                    </span>
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-bold font-mono text-[#00a68a] tabular-nums bg-teal-50/20 dark:bg-teal-950/10">
                                                {d.avgDaily} <span className="text-[9px] text-slate-400 font-normal">/day</span>
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-semibold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                                                {d.peakDay.count > 0 ? (
                                                  <span>{d.peakDay.formattedDate} <span className="text-[9px] font-bold text-slate-500">({d.peakDay.count})</span></span>
                                                ) : (
                                                  <span className="text-slate-400 font-normal">-</span>
                                                )}
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-semibold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                                {d.activeDays} days
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-semibold font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                                                {d.percentage.toFixed(1)}%
                                              </td>
                                              <td className="px-3 py-2 text-right font-black font-mono text-slate-900 dark:text-white tabular-nums">
                                                {d.total}
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                      <tfoot>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-[11px]">
                                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                                            Total Consumed
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono text-[#00a68a] tabular-nums bg-teal-50/40 dark:bg-teal-950/20">
                                            {(reportData.summary.avgDailyUsage || 0).toFixed(1)} /day
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                            {reportData.summary.peakDayUsage?.formattedDate ? `${reportData.summary.peakDayUsage.formattedDate} (${reportData.summary.peakDayUsage.count})` : '-'}
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono text-slate-700 dark:text-slate-300 tabular-nums">-</td>
                                          <td className="px-2.5 py-2.5 text-center font-mono text-slate-700 dark:text-slate-300 tabular-nums">100%</td>
                                          <td className="px-3 py-2.5 text-right font-black font-mono text-slate-900 dark:text-white tabular-nums">
                                            {(dailyStats as any[]).reduce((sum, d) => sum + d.total, 0)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. QUARTERLY BREAKDOWN VIEW */}
                          {breakdownView === 'quarterly' && (
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Chart (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {matrixSizeFilter === 'all'
                                          ? matrixChartMode === 'stacked'
                                            ? 'Quarterly Volume by Cylinder Size'
                                            : matrixChartMode === 'grouped'
                                            ? 'Quarterly Size Comparison'
                                            : 'Quarterly Overall Totals'
                                          : `Quarterly Volume: ${getCylinderMeta(matrixSizeFilter).label}`}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                      {matrixSizeFilter === 'all'
                                        ? 'Quarterly consumption volume stratified across cylinder sizes (D, E, F, N, HS)'
                                        : `Displaying quarterly volume for ${getCylinderMeta(matrixSizeFilter).full}`}
                                    </p>
                                  </div>

                                  <div className="h-[240px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={quarterlyOverallTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <Tooltip content={<PerformanceMatrixTooltip />} />

                                        {matrixSizeFilter !== 'all' ? (
                                          <Bar
                                            dataKey={matrixSizeFilter}
                                            name={getCylinderMeta(matrixSizeFilter).label}
                                            fill={getCylinderColor(matrixSizeFilter, 0)}
                                            radius={[4, 4, 0, 0]}
                                            barSize={22}
                                          />
                                        ) : matrixChartMode === 'total' ? (
                                          <Bar
                                            dataKey="total"
                                            name="Total Tanks"
                                            fill="#00a68a"
                                            radius={[4, 4, 0, 0]}
                                            barSize={24}
                                          />
                                        ) : matrixChartMode === 'grouped' ? (
                                          cylinderTypesList.map((typeStr, idx) => (
                                            <Bar
                                              key={typeStr}
                                              dataKey={typeStr}
                                              name={getCylinderMeta(typeStr).label}
                                              fill={getCylinderColor(typeStr, idx)}
                                              radius={[3, 3, 0, 0]}
                                              barSize={8}
                                            />
                                          ))
                                        ) : (
                                          cylinderTypesList.map((typeStr, idx) => (
                                            <Bar
                                              key={typeStr}
                                              dataKey={typeStr}
                                              name={getCylinderMeta(typeStr).label}
                                              stackId="quarterlyStack"
                                              fill={getCylinderColor(typeStr, idx)}
                                              barSize={22}
                                              radius={idx === cylinderTypesList.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                            />
                                          ))
                                        )}
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>

                                  {/* Interactive Size Legend Below Chart */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
                                    {cylinderTypesList.map((t, idx) => {
                                      const meta = getCylinderMeta(t)
                                      const color = getCylinderColor(t, idx)
                                      const isDimmed = matrixSizeFilter !== 'all' && matrixSizeFilter !== t
                                      return (
                                        <button
                                          key={t}
                                          onClick={() => setMatrixSizeFilter(matrixSizeFilter === t ? 'all' : t)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all border",
                                            isDimmed
                                              ? "opacity-35 border-transparent"
                                              : "opacity-100 border-slate-200/60 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100"
                                          )}
                                        >
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                          <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">({meta.code})</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Right Table (7 cols) */}
                                <div className="lg:col-span-7">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Quarterly Performance Matrix (All Cylinder Sizes)
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {quarterlyStats.length} Sizes Tracked
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                    <table className="w-full text-[11px] text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">Cylinder Size / Type</th>
                                          <th className="px-2.5 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">Q1 (Jan-Mar)</th>
                                          <th className="px-2.5 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">Q2 (Apr-Jun)</th>
                                          <th className="px-2.5 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">Q3 (Jul-Sep)</th>
                                          <th className="px-2.5 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">Q4 (Oct-Dec)</th>
                                          <th className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                        {(quarterlyStats as any[]).map((q: any, qIdx: number) => {
                                          const meta = getCylinderMeta(q.type)
                                          const color = getCylinderColor(q.type, qIdx)
                                          const isSelected = matrixSizeFilter === q.type
                                          const isDimmed = matrixSizeFilter !== 'all' && !isSelected

                                          return (
                                            <tr
                                              key={q.type}
                                              onClick={() => setMatrixSizeFilter(isSelected ? 'all' : q.type)}
                                              onMouseEnter={() => setHoveredMatrixType(q.type)}
                                              onMouseLeave={() => setHoveredMatrixType(null)}
                                              className={cn(
                                                "cursor-pointer transition-colors duration-150",
                                                isSelected
                                                  ? "bg-teal-50/50 dark:bg-teal-950/30 font-medium"
                                                  : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                                                isDimmed && "opacity-35"
                                              )}
                                            >
                                              <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-2xs"
                                                    style={{ backgroundColor: color }}
                                                  >
                                                    {meta.code}
                                                  </div>
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                                      {meta.label}
                                                    </span>
                                                    <span className="text-[9.5px] text-slate-400 font-mono truncate">
                                                      {meta.sub}
                                                    </span>
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-semibold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                                                {q.q1 || 0} <span className="text-[9px] text-slate-400 font-normal block">Avg {q.avg_q1 || 0}</span>
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-semibold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                                                {q.q2 || 0} <span className="text-[9px] text-slate-400 font-normal block">Avg {q.avg_q2 || 0}</span>
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-semibold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                                                {q.q3 || 0} <span className="text-[9px] text-slate-400 font-normal block">Avg {q.avg_q3 || 0}</span>
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-semibold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                                                {q.q4 || 0} <span className="text-[9px] text-slate-400 font-normal block">Avg {q.avg_q4 || 0}</span>
                                              </td>
                                              <td className="px-3 py-2 text-right font-black font-mono text-slate-900 dark:text-white tabular-nums">
                                                {q.total}
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                      <tfoot>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-[11px]">
                                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                                            Total Dispatched
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-slate-900 dark:text-white tabular-nums">
                                            {(quarterlyStats as any[]).reduce((sum, q) => sum + (q.q1 || 0), 0)}
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-slate-900 dark:text-white tabular-nums">
                                            {(quarterlyStats as any[]).reduce((sum, q) => sum + (q.q2 || 0), 0)}
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-slate-900 dark:text-white tabular-nums">
                                            {(quarterlyStats as any[]).reduce((sum, q) => sum + (q.q3 || 0), 0)}
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-slate-900 dark:text-white tabular-nums">
                                            {(quarterlyStats as any[]).reduce((sum, q) => sum + (q.q4 || 0), 0)}
                                          </td>
                                          <td className="px-3 py-2.5 text-right font-black font-mono text-slate-900 dark:text-white tabular-nums">
                                            {(quarterlyStats as any[]).reduce((sum, q) => sum + (q.total || 0), 0)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ─── PENDING TO RECEIVE CYLINDER ANALYTICS (BACKORDER) ─── */}
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
                          {/* Luxury Top Accent Strip */}
                          <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500" />
                          
                          {/* Header Area */}
                          <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100/70 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-center shrink-0 shadow-xs">
                                  <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                      Pending to Receive Cylinder Analytics &amp; Backorder Matrix
                                    </h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                                      {backorderView === 'weekly' ? 'Weekly Active' : backorderView === 'total' ? 'Total Active' : 'Batch Log'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {backorderView === 'weekly'
                                      ? 'Weekly outstanding backorders awaiting return receipt stratified by cylinder size (D, E, F, N, HS)'
                                      : backorderView === 'total'
                                      ? 'All-time reconciliation matrix, SLA turnaround aging, and fulfillment rate across all cylinder sizes'
                                      : 'Detailed transaction log of returned cylinder batches awaiting delivery receipt'}
                                  </p>
                                </div>
                              </div>

                              {/* Right Header: Quick stats + Switcher */}
                              <div className="flex flex-wrap items-center gap-2.5">
                                <div className="hidden sm:flex items-center gap-2 mr-1">
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                                    <span className="text-slate-400 font-medium">Dispatched:</span>
                                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                                      {reportData?.backorders?.summary?.totalReturned || 0}
                                    </span>
                                    <span className="text-[10px] text-slate-400">tanks</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/50 text-[11px]">
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">Outstanding:</span>
                                    <span className="font-bold text-amber-700 dark:text-amber-300 font-mono">
                                      {reportData?.backorders?.summary?.totalPending || 0}
                                    </span>
                                    <span className="text-[10px] text-amber-600/80">tanks</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-800/50 text-[11px]">
                                    <span className="text-teal-600 dark:text-teal-400 font-medium">Weekly Avg:</span>
                                    <span className="font-bold text-teal-700 dark:text-teal-300 font-mono">
                                      {backorderWeeklyAvg}
                                    </span>
                                    <span className="text-[10px] text-teal-600/80">/wk</span>
                                  </div>
                                </div>

                                {/* View Switcher Pills: WEEKLY vs TOTAL vs BATCH LOG */}
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                                  {(['weekly', 'total', 'batches'] as const).map(bView => (
                                    <button
                                      key={bView}
                                      onClick={() => setBackorderView(bView)}
                                      className={cn(
                                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-150",
                                        backorderView === bView
                                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/40 dark:border-slate-600 font-extrabold"
                                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                      )}
                                    >
                                      {bView === 'weekly' ? 'Weekly' : bView === 'total' ? 'Total' : 'Batch Log'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Subbar: EXACT MATCH TO CARD 1 */}
                            {backorderView !== 'batches' && (
                              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                                {/* Left: View Mode Toggle */}
                                <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">View:</span>
                                  <button
                                    onClick={() => setBackorderChartMode('stacked')}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5",
                                      backorderChartMode === 'stacked'
                                        ? "bg-[#00a68a] text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                    title="Stacked breakdown of each cylinder size (D, E, F, N, HS)"
                                  >
                                    <Layers className="w-3 h-3" />
                                    Stacked Sizes
                                  </button>
                                  <button
                                    onClick={() => setBackorderChartMode('grouped')}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5",
                                      backorderChartMode === 'grouped'
                                        ? "bg-[#00a68a] text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                    title="Side-by-side grouped bars for comparison"
                                  >
                                    <BarChart2 className="w-3 h-3" />
                                    Grouped
                                  </button>
                                  <button
                                    onClick={() => setBackorderChartMode('total')}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
                                      backorderChartMode === 'total'
                                        ? "bg-[#00a68a] text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                    title="Total volume single bar"
                                  >
                                    Total Only
                                  </button>
                                </div>

                                {/* Right: Quick Filter Pills by Cylinder Size (EXACT MATCH TO CARD 1) */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                                    <Filter className="w-2.5 h-2.5" />
                                    Filter:
                                  </span>
                                  <button
                                    onClick={() => setBackorderSizeFilter('all')}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all shrink-0 uppercase tracking-wider",
                                      backorderSizeFilter === 'all'
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                    )}
                                  >
                                    All Sizes
                                  </button>
                                  {(reportData?.backorders?.bySize || []).map((s, idx) => {
                                    const meta = getCylinderMeta(s.sizeCode)
                                    const color = getCylinderColor(s.sizeCode, idx)
                                    const isSelected = backorderSizeFilter === s.sizeCode
                                    return (
                                      <button
                                        key={s.sizeCode}
                                        onClick={() => setBackorderSizeFilter(isSelected ? 'all' : s.sizeCode)}
                                        onMouseEnter={() => setHoveredBackorderType(s.sizeCode)}
                                        onMouseLeave={() => setHoveredBackorderType(null)}
                                        className={cn(
                                          "px-2 py-1 text-[10px] font-bold rounded-md border transition-all shrink-0 flex items-center gap-1.5",
                                          isSelected
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs ring-1"
                                            : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                        )}
                                        style={{
                                          borderColor: isSelected ? color : undefined,
                                          boxShadow: isSelected ? `0 0 0 1px ${color}` : undefined
                                        }}
                                      >
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                        <span>{meta.label}</span>
                                        <span className="text-[9px] opacity-70 font-mono">({s.pendingCount})</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 1. WEEKLY BREAKDOWN VIEW (EXACT MATCH TO CARD 1) */}
                          {backorderView === 'weekly' && (
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Chart (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {backorderSizeFilter === 'all'
                                          ? backorderChartMode === 'stacked'
                                            ? 'Weekly Backorders by Cylinder Size'
                                            : backorderChartMode === 'grouped'
                                            ? 'Weekly Comparison by Size'
                                            : 'Weekly Overall Pending'
                                          : `Weekly Pending: ${getCylinderMeta(backorderSizeFilter).label}`}
                                      </span>
                                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full font-mono border border-amber-200/50">
                                        {backorderWeeklyAvg} / wk
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                      {backorderSizeFilter === 'all'
                                        ? 'Tanks awaiting return receipt each week, broken down by individual cylinder size (D, E, F, N, HS)'
                                        : `Displaying outstanding backorders for ${getCylinderMeta(backorderSizeFilter).full}`}
                                    </p>
                                  </div>

                                  <div className="h-[240px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={backorderWeeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <Tooltip content={<BackorderWeeklyPerformanceTooltip />} />

                                        {backorderSizeFilter !== 'all' ? (
                                          <Bar
                                            dataKey={backorderSizeFilter}
                                            name={getCylinderMeta(backorderSizeFilter).label}
                                            fill={getCylinderColor(backorderSizeFilter, 0)}
                                            radius={[4, 4, 0, 0]}
                                            barSize={20}
                                          />
                                        ) : backorderChartMode === 'total' ? (
                                          <Bar
                                            dataKey="total"
                                            name="Total Outstanding"
                                            fill="#f59e0b"
                                            radius={[4, 4, 0, 0]}
                                            barSize={22}
                                          />
                                        ) : backorderChartMode === 'grouped' ? (
                                          (reportData?.backorders?.bySize || []).map((s, idx) => (
                                            <Bar
                                              key={s.sizeCode}
                                              dataKey={s.sizeCode}
                                              name={getCylinderMeta(s.sizeCode).label}
                                              fill={getCylinderColor(s.sizeCode, idx)}
                                              radius={[3, 3, 0, 0]}
                                              barSize={8}
                                            />
                                          ))
                                        ) : (
                                          (reportData?.backorders?.bySize || []).map((s, idx) => (
                                            <Bar
                                              key={s.sizeCode}
                                              dataKey={s.sizeCode}
                                              name={getCylinderMeta(s.sizeCode).label}
                                              stackId="boWeeklyStack"
                                              fill={getCylinderColor(s.sizeCode, idx)}
                                              barSize={20}
                                              radius={idx === (reportData?.backorders?.bySize?.length || 1) - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                            />
                                          ))
                                        )}
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>

                                  {/* Interactive Size Legend Below Chart */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
                                    {(reportData?.backorders?.bySize || []).map((s, idx) => {
                                      const meta = getCylinderMeta(s.sizeCode)
                                      const color = getCylinderColor(s.sizeCode, idx)
                                      const isDimmed = backorderSizeFilter !== 'all' && backorderSizeFilter !== s.sizeCode
                                      return (
                                        <button
                                          key={s.sizeCode}
                                          onClick={() => setBackorderSizeFilter(backorderSizeFilter === s.sizeCode ? 'all' : s.sizeCode)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all border",
                                            isDimmed
                                              ? "opacity-35 border-transparent"
                                              : "opacity-100 border-slate-200/60 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100"
                                          )}
                                        >
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                          <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">({s.pendingCount})</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Right Table (7 cols) - EXACT SAME STRUCTURE AS CARD 1 */}
                                <div className="lg:col-span-7">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Weekly Backorder Matrix (All Cylinder Sizes)
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {backorderWeeklyStats.rows.length} Sizes • Last {backorderWeeklyStats.weekKeys.length} Weeks
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                    <table className="w-full text-[11px] text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">Cylinder Size / Type</th>
                                          {backorderWeeklyStats.weekKeys.map(wk => (
                                            <th key={wk} className="px-2 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">{wk}</th>
                                          ))}
                                          <th className="px-2.5 py-2.5 text-center font-bold text-amber-600 bg-amber-50/40 dark:bg-amber-950/20">Wk Avg</th>
                                          <th className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">Total Pending</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                        {backorderWeeklyStats.rows.map((row: any, rIdx: number) => {
                                          const meta = getCylinderMeta(row.sizeCode)
                                          const color = getCylinderColor(row.sizeCode, rIdx)
                                          const isSelected = backorderSizeFilter === row.sizeCode
                                          const isDimmed = backorderSizeFilter !== 'all' && !isSelected
                                          const grandTotal = backorderWeeklyStats.rows.reduce((sum: number, r: any) => sum + r.total, 0) || 1
                                          const pct = ((row.total / grandTotal) * 100).toFixed(1)

                                          return (
                                            <tr
                                              key={row.sizeCode}
                                              onClick={() => setBackorderSizeFilter(isSelected ? 'all' : row.sizeCode)}
                                              onMouseEnter={() => setHoveredBackorderType(row.sizeCode)}
                                              onMouseLeave={() => setHoveredBackorderType(null)}
                                              className={cn(
                                                "cursor-pointer transition-colors duration-150",
                                                isSelected
                                                  ? "bg-amber-50/50 dark:bg-amber-950/30 font-medium"
                                                  : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                                                isDimmed && "opacity-35"
                                              )}
                                            >
                                              {/* Cylinder Size Badge */}
                                              <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-2xs"
                                                    style={{ backgroundColor: color }}
                                                  >
                                                    {meta.code}
                                                  </div>
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                                      {meta.label}
                                                    </span>
                                                    <span className="text-[9.5px] text-slate-400 font-mono truncate">
                                                      {row.capacity || meta.sub}
                                                    </span>
                                                  </div>
                                                </div>
                                              </td>

                                              {/* Weekly Counts */}
                                              {backorderWeeklyStats.weekKeys.map(wk => {
                                                const count = row.weekCounts[wk] || 0
                                                return (
                                                  <td key={wk} className="px-2 py-2 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                                                    {count > 0 ? (
                                                      <span className={cn(
                                                        "px-1.5 py-0.5 rounded text-[11px]",
                                                        count >= 20 ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold" : "text-amber-700 dark:text-amber-400 font-semibold"
                                                      )}>
                                                        {count}
                                                      </span>
                                                    ) : (
                                                      <span className="text-slate-300 dark:text-slate-600">-</span>
                                                    )}
                                                  </td>
                                                );
                                              })}

                                              {/* Wk Avg */}
                                              <td className="px-2.5 py-2 text-center font-mono font-bold text-amber-700 dark:text-amber-300 tabular-nums bg-amber-50/30 dark:bg-amber-950/10">
                                                {row.avgWeekly}
                                              </td>

                                              {/* Total Pending with mini bar */}
                                              <td className="px-3 py-2 text-right tabular-nums">
                                                <div className="flex flex-col items-end">
                                                  <span className="font-black font-mono text-slate-900 dark:text-white text-xs">
                                                    {row.total}
                                                  </span>
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                    <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                      <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${pct}%`, backgroundColor: color }}
                                                      />
                                                    </div>
                                                    <span className="text-[8.5px] font-mono text-slate-400">{pct}%</span>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                      <tfoot>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-[11px]">
                                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                                            Total Outstanding
                                          </td>
                                          {backorderWeeklyStats.weekKeys.map(wk => {
                                            const totalForWk = backorderWeeklyStats.rows.reduce((sum: number, r: any) => sum + (r.weekCounts[wk] || 0), 0)
                                            return (
                                              <td key={wk} className="px-2 py-2.5 text-center font-mono font-black text-amber-700 dark:text-amber-300 tabular-nums">
                                                {totalForWk}
                                              </td>
                                            );
                                          })}
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-amber-700 dark:text-amber-300 tabular-nums bg-amber-50/50 dark:bg-amber-950/30">
                                            {backorderWeeklyAvg}
                                          </td>
                                          <td className="px-3 py-2.5 text-right font-black font-mono text-amber-700 dark:text-amber-300 tabular-nums text-xs">
                                            {backorderWeeklyStats.rows.reduce((sum: number, r: any) => sum + r.total, 0)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. TOTAL (OPERATIONAL SLA AGING & RECONCILIATION) VIEW */}
                          {backorderView === 'total' && (
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Chart (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {backorderSizeFilter === 'all'
                                          ? 'Outstanding Backorders by Cylinder Size'
                                          : `Outstanding: ${getCylinderMeta(backorderSizeFilter).label}`}
                                      </span>
                                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full font-mono border border-amber-200/50">
                                        {reportData?.backorders?.summary?.totalPending || 0} total
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                      {backorderSizeFilter === 'all'
                                        ? 'Unreceived cylinders currently with supplier for refilling'
                                        : `Displaying pending reconciliation metrics for ${getCylinderMeta(backorderSizeFilter).full}`}
                                    </p>
                                  </div>

                                  <div className="h-[240px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={backorderChartDataFiltered} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <Tooltip content={<BackorderMatrixTooltip />} />
                                        <Bar dataKey="pending" name="Outstanding Backorder" radius={[4, 4, 0, 0]} barSize={22}>
                                          {backorderChartDataFiltered.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={entry.color} />
                                          ))}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>

                                  {/* Interactive Legend */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
                                    {(reportData?.backorders?.bySize || []).map((s, idx) => {
                                      const meta = getCylinderMeta(s.sizeCode)
                                      const color = getCylinderColor(s.sizeCode, idx)
                                      const isDimmed = backorderSizeFilter !== 'all' && backorderSizeFilter !== s.sizeCode
                                      return (
                                        <button
                                          key={s.sizeCode}
                                          onClick={() => setBackorderSizeFilter(backorderSizeFilter === s.sizeCode ? 'all' : s.sizeCode)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all border",
                                            isDimmed
                                              ? "opacity-35 border-transparent"
                                              : "opacity-100 border-slate-200/60 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100"
                                          )}
                                        >
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                          <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">({s.pendingCount})</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Right Table (7 cols) */}
                                <div className="lg:col-span-7">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Cumulative Reconciliation &amp; SLA Aging
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {(reportData?.backorders?.bySize || []).length} Sizes • BORNEO INDAH SDN BHD
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                    <table className="w-full text-[11px] text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">Cylinder Size / Type</th>
                                          <th className="px-2 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">Sent</th>
                                          <th className="px-2 py-2.5 text-center font-semibold text-emerald-600 dark:text-emerald-400">Rcvd</th>
                                          <th className="px-2 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-400">&lt; 7d</th>
                                          <th className="px-2 py-2.5 text-center font-semibold text-amber-600 dark:text-amber-400">7–14d</th>
                                          <th className="px-2 py-2.5 text-center font-semibold text-rose-600 dark:text-rose-400">&gt; 14d</th>
                                          <th className="px-2.5 py-2.5 text-center font-bold text-[#00a68a] bg-teal-50/40 dark:bg-teal-950/20">SLA %</th>
                                          <th className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">Outstanding</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                        {(reportData?.backorders?.bySize || []).map((s, sIdx) => {
                                          const meta = getCylinderMeta(s.sizeCode)
                                          const color = getCylinderColor(s.sizeCode, sIdx)
                                          const isSelected = backorderSizeFilter === s.sizeCode
                                          const isDimmed = backorderSizeFilter !== 'all' && !isSelected
                                          const grandPending = reportData?.backorders?.summary?.totalPending || 1
                                          const pct = ((s.pendingCount / grandPending) * 100).toFixed(1)

                                          return (
                                            <tr
                                              key={s.sizeCode}
                                              onClick={() => setBackorderSizeFilter(isSelected ? 'all' : s.sizeCode)}
                                              onMouseEnter={() => setHoveredBackorderType(s.sizeCode)}
                                              onMouseLeave={() => setHoveredBackorderType(null)}
                                              className={cn(
                                                "cursor-pointer transition-colors duration-150",
                                                isSelected
                                                  ? "bg-amber-50/50 dark:bg-amber-950/30 font-medium"
                                                  : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                                                isDimmed && "opacity-35"
                                              )}
                                            >
                                              <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-2xs"
                                                    style={{ backgroundColor: color }}
                                                  >
                                                    {meta.code}
                                                  </div>
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                                      {meta.label}
                                                    </span>
                                                    <span className="text-[9.5px] text-slate-400 font-mono truncate">
                                                      {s.capacity || meta.sub}
                                                    </span>
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="px-2 py-2 text-center font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                                                {s.returnedCount}
                                              </td>
                                              <td className="px-2 py-2 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                                                {s.receivedCount}
                                              </td>
                                              <td className="px-2 py-2 text-center font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                                {s.under7}
                                              </td>
                                              <td className="px-2 py-2 text-center font-mono text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                                                {s.between7And14}
                                              </td>
                                              <td className="px-2 py-2 text-center font-mono tabular-nums">
                                                {s.overdueCount > 0 ? (
                                                  <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold">
                                                    {s.overdueCount}
                                                  </span>
                                                ) : (
                                                  <span className="text-slate-300 dark:text-slate-600">-</span>
                                                )}
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-mono font-bold tabular-nums bg-teal-50/20 dark:bg-teal-950/10">
                                                <span className={cn(
                                                  s.fulfillmentRate >= 80 ? "text-emerald-600" : s.fulfillmentRate >= 50 ? "text-amber-600" : "text-slate-500"
                                                )}>
                                                  {s.fulfillmentRate.toFixed(1)}%
                                                </span>
                                              </td>
                                              <td className="px-3 py-2 text-right tabular-nums">
                                                <div className="flex flex-col items-end">
                                                  <span className="font-black font-mono text-amber-600 dark:text-amber-400 text-xs">
                                                    {s.pendingCount}
                                                  </span>
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                    <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                      <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${pct}%`, backgroundColor: color }}
                                                      />
                                                    </div>
                                                    <span className="text-[8.5px] font-mono text-slate-400">{pct}%</span>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                      <tfoot>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-[11px]">
                                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                                            Total Outstanding
                                          </td>
                                          <td className="px-2 py-2.5 text-center font-mono font-black text-slate-900 dark:text-white tabular-nums">
                                            {reportData?.backorders?.summary?.totalReturned || 0}
                                          </td>
                                          <td className="px-2 py-2.5 text-center font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            {reportData?.backorders?.summary?.totalReceived || 0}
                                          </td>
                                          <td className="px-2 py-2.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                            {(reportData?.backorders?.bySize || []).reduce((sum, s) => sum + s.under7, 0)}
                                          </td>
                                          <td className="px-2 py-2.5 text-center font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                                            {(reportData?.backorders?.bySize || []).reduce((sum, s) => sum + s.between7And14, 0)}
                                          </td>
                                          <td className="px-2 py-2.5 text-center font-mono font-black text-rose-600 dark:text-rose-400 tabular-nums">
                                            {reportData?.backorders?.summary?.totalOverdue || 0}
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-[#00a68a] tabular-nums bg-teal-50/40 dark:bg-teal-950/20">
                                            {(reportData?.backorders?.summary?.fulfillmentRate || 0).toFixed(1)}%
                                          </td>
                                          <td className="px-3 py-2.5 text-right font-black font-mono text-amber-600 dark:text-amber-400 tabular-nums text-xs">
                                            {reportData?.backorders?.summary?.totalPending || 0}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. BATCH LOG VIEW */}
                          {backorderView === 'batches' && (
                            <div className="p-5 space-y-3">
                              {/* Search and Filters */}
                              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                <div className="relative flex-1 min-w-[200px]">
                                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Cari No. Dokumen atau Pembekal..."
                                    value={backorderSearchQuery}
                                    onChange={e => {
                                      setBackorderSearchQuery(e.target.value)
                                      setBackorderPage(1)
                                    }}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {(['all', 'pending', 'overdue', 'fulfilled'] as const).map(st => (
                                    <button
                                      key={st}
                                      onClick={() => {
                                        setBackorderStatusFilter(st)
                                        setBackorderPage(1)
                                      }}
                                      className={cn(
                                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all border",
                                        backorderStatusFilter === st
                                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                      )}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Batches Table */}
                              <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                <table className="w-full text-[11px] text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                      <th className="px-3.5 py-2.5">No. Dokumen Pulang</th>
                                      <th className="px-3 py-2.5">Tarikh</th>
                                      <th className="px-3 py-2.5">Pembekal</th>
                                      <th className="px-3 py-2.5">Saiz Dihantar</th>
                                      <th className="px-2.5 py-2.5 text-center">Qty Hantar</th>
                                      <th className="px-2.5 py-2.5 text-center">Diterima</th>
                                      <th className="px-2.5 py-2.5 text-center text-amber-600">Pending</th>
                                      <th className="px-2.5 py-2.5 text-center">Penuaan SLA</th>
                                      <th className="px-3.5 py-2.5 text-right">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                    {paginatedBackorderBatches.length > 0 ? (
                                      paginatedBackorderBatches.map(batch => (
                                        <tr key={batch.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                          <td className="px-3.5 py-2 font-mono font-bold text-slate-900 dark:text-white">
                                            {batch.documentNumber}
                                          </td>
                                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                            {batch.returnedDate}
                                          </td>
                                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                                            {batch.supplierName}
                                          </td>
                                          <td className="px-3 py-2">
                                            <div className="flex items-center gap-1 flex-wrap">
                                              {batch.sizesSummary?.map(s => (
                                                <span
                                                  key={s.sizeCode}
                                                  className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                >
                                                  {s.sizeCode}: {s.count}
                                                </span>
                                              ))}
                                            </div>
                                          </td>
                                          <td className="px-2.5 py-2 text-center font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                                            {batch.returnedQty}
                                          </td>
                                          <td className="px-2.5 py-2 text-center font-mono tabular-nums">
                                            {batch.receivedQty > 0 ? (
                                              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded">
                                                {batch.receivedQty}
                                              </span>
                                            ) : (
                                              <span className="text-slate-400">-</span>
                                            )}
                                          </td>
                                          <td className="px-2.5 py-2 text-center font-mono tabular-nums">
                                            {batch.pendingQty > 0 ? (
                                              <span className={cn(
                                                "px-1.5 py-0.5 rounded font-black",
                                                batch.isOverdue
                                                  ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300"
                                                  : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                                              )}>
                                                {batch.pendingQty}
                                              </span>
                                            ) : (
                                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0</span>
                                            )}
                                          </td>
                                          <td className="px-2.5 py-2 text-center font-mono tabular-nums">
                                            <span className={cn(
                                              "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                                              batch.agingDays <= 7
                                                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
                                                : batch.agingDays <= 14
                                                ? "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40"
                                                : "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 font-bold"
                                            )}>
                                              {batch.agingDays}d
                                            </span>
                                          </td>
                                          <td className="px-3.5 py-2 text-right whitespace-nowrap">
                                            {batch.status === 'fulfilled' ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                                <CheckCircle2 className="w-2.5 h-2.5" /> FULFILLED
                                              </span>
                                            ) : batch.isOverdue ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                                                <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                                                <Clock className="w-2.5 h-2.5" /> PENDING
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                          Tiada rekod penghantaran balik dijumpai.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination Footer */}
                              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                <span className="text-[11px]">
                                  Menunjukkan {filteredBackorderBatches.length > 0 ? (backorderPage - 1) * backorderRowsPerPage + 1 : 0} - {Math.min(backorderPage * backorderRowsPerPage, filteredBackorderBatches.length)} daripada {filteredBackorderBatches.length} rekod
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setBackorderPage(p => Math.max(1, p - 1))}
                                    disabled={backorderPage <= 1}
                                    className="px-2 py-0.5 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                                  >
                                    &larr;
                                  </button>
                                  <span className="px-2 text-[11px] font-mono">
                                    {backorderPage} / {totalBackorderPages}
                                  </span>
                                  <button
                                    onClick={() => setBackorderPage(p => Math.min(totalBackorderPages, p + 1))}
                                    disabled={backorderPage >= totalBackorderPages}
                                    className="px-2 py-0.5 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                                  >
                                    &rarr;
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ─── WEEKLY CYLINDER BALANCE & STOCK ON-HAND MATRIX (CARD 3) ─── */}
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
                          {/* Luxury Top Accent Strip */}
                          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

                          {/* Header Area */}
                          <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/70 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30 flex items-center justify-center shrink-0 shadow-xs">
                                  <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                      Weekly Cylinder Balance &amp; Stock On-Hand Matrix
                                    </h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                                      {balanceView === 'weekly' ? 'Weekly Active' : balanceView === 'status' ? 'By Status' : 'By Ward'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {balanceView === 'weekly'
                                      ? 'Weekly physical on-hand stock balance and inventory stability stratified by cylinder size (D, E, F, N, HS)'
                                      : balanceView === 'status'
                                      ? 'Live on-hand hospital inventory stratified across operating statuses (Full, In Use, Empty, Maintenance)'
                                      : 'Hospital ward, clinic & emergency department cylinder allocation and storage distribution'}
                                  </p>
                                </div>
                              </div>

                              {/* Right Header: Quick stats + Switcher */}
                              <div className="flex flex-wrap items-center gap-2.5">
                                <div className="hidden sm:flex items-center gap-2 mr-1">
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                                    <span className="text-slate-400 font-medium">Total In Hospital:</span>
                                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                                      {reportData?.summary?.totalCylinders || 0}
                                    </span>
                                    <span className="text-[10px] text-slate-400">tanks</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/50 text-[11px]">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Full / Ready:</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                                      {reportData?.inventory?.byStatus?.find(s => s.status.toLowerCase().includes('full'))?.count ||
                                       reportData?.inventory?.byType?.reduce((sum, t) => sum + t.full, 0) || 0}
                                    </span>
                                    <span className="text-[10px] text-emerald-600/80">tanks</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50 text-[11px]">
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Weekly Avg:</span>
                                    <span className="font-bold text-blue-700 dark:text-blue-300 font-mono">
                                      {balanceWeeklyAvg}
                                    </span>
                                    <span className="text-[10px] text-blue-600/80">/wk</span>
                                  </div>
                                </div>

                                {/* View Switcher Pills: WEEKLY vs BY STATUS vs BY WARD */}
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                                  {(['weekly', 'status', 'ward'] as const).map(bView => (
                                    <button
                                      key={bView}
                                      onClick={() => setBalanceView(bView)}
                                      className={cn(
                                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-150",
                                        balanceView === bView
                                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/40 dark:border-slate-600 font-extrabold"
                                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                      )}
                                    >
                                      {bView === 'weekly' ? 'Weekly' : bView === 'status' ? 'By Status' : 'By Ward'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Interactive Control & Filter Subbar (Weekly View) */}
                            {balanceView === 'weekly' && (
                              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                {/* Chart Mode Toggle */}
                                <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">View:</span>
                                  <button
                                    onClick={() => setBalanceChartMode('stacked')}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5",
                                      balanceChartMode === 'stacked'
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                    title="Stacked balance breakdown of each cylinder size (D, E, F, N, HS)"
                                  >
                                    <Layers className="w-3 h-3" />
                                    Stacked Sizes
                                  </button>
                                  <button
                                    onClick={() => setBalanceChartMode('grouped')}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5",
                                      balanceChartMode === 'grouped'
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                    title="Side-by-side grouped bars for weekly comparison"
                                  >
                                    <BarChart2 className="w-3 h-3" />
                                    Grouped
                                  </button>
                                  <button
                                    onClick={() => setBalanceChartMode('total')}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
                                      balanceChartMode === 'total'
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                    title="Total balance single bar"
                                  >
                                    Total Only
                                  </button>
                                </div>

                                {/* Quick Filter Pills by Cylinder Size */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                                    <Filter className="w-2.5 h-2.5" />
                                    Filter:
                                  </span>
                                  <button
                                    onClick={() => setBalanceSizeFilter('all')}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all shrink-0 uppercase tracking-wider",
                                      balanceSizeFilter === 'all'
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                    )}
                                  >
                                    All Sizes
                                  </button>
                                  {balanceWeeklyStats.rows.map((row: any, idx: number) => {
                                    const meta = getCylinderMeta(row.type)
                                    const color = getCylinderColor(row.type, idx)
                                    const isSelected = balanceSizeFilter === row.type
                                    return (
                                      <button
                                        key={row.type}
                                        onClick={() => setBalanceSizeFilter(isSelected ? 'all' : row.type)}
                                        onMouseEnter={() => setHoveredBalanceType(row.type)}
                                        onMouseLeave={() => setHoveredBalanceType(null)}
                                        className={cn(
                                          "px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all shrink-0 flex items-center gap-1.5",
                                          isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                        )}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#ffffff' : color }} />
                                        <span>{meta.label}</span>
                                        <span className="text-[9px] font-mono opacity-70">({meta.code})</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 1. WEEKLY BALANCE VIEW (DEFAULT) */}
                          {balanceView === 'weekly' && (
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Chart (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {balanceSizeFilter === 'all'
                                          ? balanceChartMode === 'stacked'
                                            ? 'Weekly Balance by Cylinder Size'
                                            : balanceChartMode === 'grouped'
                                            ? 'Weekly Size Comparison'
                                            : 'Weekly Stock Totals'
                                          : `Weekly Balance: ${getCylinderMeta(balanceSizeFilter).label}`}
                                      </span>
                                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full font-mono border border-blue-200/50">
                                        {balanceWeeklyAvg} / wk
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                      {balanceSizeFilter === 'all'
                                        ? 'Physical inventory balance on hand each week stratified across cylinder sizes (D, E, F, N, HS)'
                                        : `Displaying weekly on-hand stock trend for ${getCylinderMeta(balanceSizeFilter).full}`}
                                    </p>
                                  </div>

                                  <div className="h-[240px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={balanceWeeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} />
                                        <Tooltip content={<BalanceWeeklyPerformanceTooltip />} />

                                        {balanceSizeFilter !== 'all' ? (
                                          <Bar
                                            dataKey={balanceSizeFilter}
                                            name={getCylinderMeta(balanceSizeFilter).label}
                                            fill={getCylinderColor(balanceSizeFilter, 0)}
                                            radius={[4, 4, 0, 0]}
                                            barSize={20}
                                          />
                                        ) : balanceChartMode === 'total' ? (
                                          <Bar
                                            dataKey="total"
                                            name="Total On-Hand Balance"
                                            fill="#2563eb"
                                            radius={[4, 4, 0, 0]}
                                            barSize={22}
                                          />
                                        ) : balanceChartMode === 'grouped' ? (
                                          balanceWeeklyStats.rows.map((row: any, idx: number) => (
                                            <Bar
                                              key={row.type}
                                              dataKey={row.type}
                                              name={getCylinderMeta(row.type).label}
                                              fill={getCylinderColor(row.type, idx)}
                                              radius={[3, 3, 0, 0]}
                                              barSize={8}
                                            />
                                          ))
                                        ) : (
                                          balanceWeeklyStats.rows.map((row: any, idx: number) => (
                                            <Bar
                                              key={row.type}
                                              dataKey={row.type}
                                              name={getCylinderMeta(row.type).label}
                                              stackId="balanceStack"
                                              fill={getCylinderColor(row.type, idx)}
                                              barSize={20}
                                              radius={idx === balanceWeeklyStats.rows.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                            />
                                          ))
                                        )}
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>

                                  {/* Interactive Size Legend Below Chart */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
                                    {balanceWeeklyStats.rows.map((row: any, idx: number) => {
                                      const meta = getCylinderMeta(row.type)
                                      const color = getCylinderColor(row.type, idx)
                                      const isDimmed = balanceSizeFilter !== 'all' && balanceSizeFilter !== row.type
                                      return (
                                        <button
                                          key={row.type}
                                          onClick={() => setBalanceSizeFilter(balanceSizeFilter === row.type ? 'all' : row.type)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all border",
                                            isDimmed
                                              ? "opacity-35 border-transparent"
                                              : "opacity-100 border-slate-200/60 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100"
                                          )}
                                        >
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                          <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">({row.currentStock})</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Right Table (7 cols) */}
                                <div className="lg:col-span-7">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Weekly Cylinder Balance Matrix (All Cylinder Sizes)
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {balanceWeeklyStats.rows.length} Sizes Monitored • Live Stock Balance
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                    <table className="w-full text-[11px] text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="px-3 py-2.5">Cylinder Size / Type</th>
                                          {balanceWeeklyStats.weekKeys.map(wk => (
                                            <th key={wk} className="px-2 py-2.5 text-center">{wk}</th>
                                          ))}
                                          <th className="px-2.5 py-2.5 text-center text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30">
                                            Wk Avg
                                          </th>
                                          <th className="px-3 py-2.5 text-right">On-Hand Stock</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                        {balanceWeeklyStats.rows.map((row: any, rIdx: number) => {
                                          const meta = getCylinderMeta(row.type)
                                          const color = getCylinderColor(row.type, rIdx)
                                          const isSelected = balanceSizeFilter === row.type
                                          const isDimmed = balanceSizeFilter !== 'all' && !isSelected

                                          return (
                                            <tr
                                              key={row.type}
                                              onClick={() => setBalanceSizeFilter(isSelected ? 'all' : row.type)}
                                              onMouseEnter={() => setHoveredBalanceType(row.type)}
                                              onMouseLeave={() => setHoveredBalanceType(null)}
                                              className={cn(
                                                "cursor-pointer transition-colors duration-150",
                                                isSelected
                                                  ? "bg-blue-50/50 dark:bg-blue-950/30 font-medium"
                                                  : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                                                isDimmed && "opacity-35"
                                              )}
                                            >
                                              {/* Cylinder Size Badge */}
                                              <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-2xs"
                                                    style={{ backgroundColor: color }}
                                                  >
                                                    {meta.code}
                                                  </div>
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                                      {meta.label}
                                                    </span>
                                                    <span className="text-[9.5px] text-slate-400 font-mono truncate">
                                                      {meta.sub}
                                                    </span>
                                                  </div>
                                                </div>
                                              </td>

                                              {/* Weekly Balance Counts */}
                                              {balanceWeeklyStats.weekKeys.map(wk => {
                                                const count = row.weekCounts[wk] || 0
                                                return (
                                                  <td key={wk} className="px-2 py-2 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                                                    {count > 0 ? (
                                                      <span className="px-1.5 py-0.5 rounded text-[11px]">
                                                        {count}
                                                      </span>
                                                    ) : (
                                                      <span className="text-slate-300 dark:text-slate-600">-</span>
                                                    )}
                                                  </td>
                                                )
                                              })}

                                              {/* Wk Avg */}
                                              <td className="px-2.5 py-2 text-center tabular-nums bg-blue-50/20 dark:bg-blue-950/10">
                                                <span className="inline-block px-1.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60">
                                                  {row.avgWeekly}
                                                </span>
                                              </td>

                                              {/* Current On-Hand Stock + Percentage */}
                                              <td className="px-3 py-2 text-right tabular-nums">
                                                <div className="flex flex-col items-end">
                                                  <span className="font-black font-mono text-slate-900 dark:text-white text-xs">
                                                    {row.currentStock}
                                                  </span>
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                    <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                      <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${row.percentage}%`, backgroundColor: color }}
                                                      />
                                                    </div>
                                                    <span className="text-[8.5px] font-mono text-slate-400">{row.percentage}%</span>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                      {/* Grand Total Footer */}
                                      <tfoot>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-[11px]">
                                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                                            Total Hospital Balance
                                          </td>
                                          {balanceWeeklyStats.weekKeys.map(wk => {
                                            const colTotal = balanceWeeklyStats.rows.reduce((sum: number, r: any) => sum + (r.weekCounts[wk] || 0), 0)
                                            return (
                                              <td key={wk} className="px-2 py-2.5 text-center font-mono font-black text-slate-900 dark:text-white tabular-nums">
                                                {colTotal}
                                              </td>
                                            )
                                          })}
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-blue-600 dark:text-blue-400 tabular-nums bg-blue-50/40 dark:bg-blue-950/20">
                                            {balanceWeeklyAvg}
                                          </td>
                                          <td className="px-3 py-2.5 text-right font-black font-mono text-slate-900 dark:text-white tabular-nums">
                                            {reportData?.summary?.totalCylinders || balanceWeeklyStats.rows.reduce((sum: number, r: any) => sum + r.currentStock, 0)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. BY STATUS BREAKDOWN VIEW */}
                          {balanceView === 'status' && (
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Status Distribution Chart (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Hospital Inventory by Readiness Status
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                      Stock allocation categorized into ready full tanks, active ward cylinders, empties awaiting pickup, and workshop maintenance
                                    </p>
                                  </div>

                                  <div className="h-[240px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={reportData?.inventory?.byStatus || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="status" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Cylinders" radius={[4, 4, 0, 0]} barSize={28}>
                                          {(reportData?.inventory?.byStatus || []).map((entry, idx) => (
                                            <Cell key={`status-cell-${idx}`} fill={entry.color || getStatusColor(entry.status)} />
                                          ))}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>

                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
                                    {(reportData?.inventory?.byStatus || []).map((st) => (
                                      <div
                                        key={st.status}
                                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60"
                                      >
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                                        <span className="text-slate-700 dark:text-slate-300">{st.status}</span>
                                        <span className="text-[9px] text-slate-400 font-mono">({st.count})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Right Status Matrix Table (7 cols) */}
                                <div className="lg:col-span-7">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Cylinder Status Matrix by Size
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {balanceWeeklyStats.rows.length} Sizes Reconciled
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                    <table className="w-full text-[11px] text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="px-3 py-2.5">Cylinder Size</th>
                                          <th className="px-2.5 py-2.5 text-center text-emerald-600 dark:text-emerald-400">Full / Ready</th>
                                          <th className="px-2.5 py-2.5 text-center text-teal-600 dark:text-teal-400">In Use (Wards)</th>
                                          <th className="px-2.5 py-2.5 text-center text-amber-600 dark:text-amber-400">Empty</th>
                                          <th className="px-2.5 py-2.5 text-center text-rose-600 dark:text-rose-400">Maintenance</th>
                                          <th className="px-3 py-2.5 text-right">Total On-Hand</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                        {balanceWeeklyStats.rows.map((row: any, rIdx: number) => {
                                          const meta = getCylinderMeta(row.type)
                                          const color = getCylinderColor(row.type, rIdx)
                                          return (
                                            <tr key={row.type} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                              <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-5 h-5 rounded flex items-center justify-center font-black text-[9px] text-white shrink-0"
                                                    style={{ backgroundColor: color }}
                                                  >
                                                    {meta.code}
                                                  </div>
                                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                                    {meta.label}
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                {row.full}
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-mono font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
                                                {row.inUse}
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                                                {row.empty}
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                                                {row.maintenance}
                                              </td>
                                              <td className="px-3 py-2 text-right font-black font-mono text-slate-900 dark:text-white tabular-nums">
                                                {row.currentStock}
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                      <tfoot>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-[11px]">
                                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                                            Hospital Total
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            {balanceWeeklyStats.rows.reduce((sum: number, r: any) => sum + r.full, 0)}
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-teal-600 dark:text-teal-400 tabular-nums">
                                            {balanceWeeklyStats.rows.reduce((sum: number, r: any) => sum + r.inUse, 0)}
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-amber-600 dark:text-amber-400 tabular-nums">
                                            {balanceWeeklyStats.rows.reduce((sum: number, r: any) => sum + r.empty, 0)}
                                          </td>
                                          <td className="px-2.5 py-2.5 text-center font-mono font-black text-rose-600 dark:text-rose-400 tabular-nums">
                                            {balanceWeeklyStats.rows.reduce((sum: number, r: any) => sum + r.maintenance, 0)}
                                          </td>
                                          <td className="px-3 py-2.5 text-right font-black font-mono text-slate-900 dark:text-white tabular-nums">
                                            {reportData?.summary?.totalCylinders || balanceWeeklyStats.rows.reduce((sum: number, r: any) => sum + r.currentStock, 0)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. BY WARD BREAKDOWN VIEW */}
                          {balanceView === 'ward' && (
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Department Bar Chart (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Top Ward / Department Holdings
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-2">
                                      Hospital clinical units and emergency areas holding highest cylinder inventories
                                    </p>
                                  </div>

                                  <div className="h-[240px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart
                                        data={(reportData?.inventory?.departmentDistribution || []).slice(0, 6)}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="department" stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" />
                                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Allocated Cylinders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>

                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
                                    Central storage depot holds remaining reserve buffer cylinders
                                  </div>
                                </div>

                                {/* Right Ward Table (7 cols) */}
                                <div className="lg:col-span-7">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Department Allocation Register
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {(reportData?.inventory?.departmentDistribution || []).length} Active Locations
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-2xs">
                                    <table className="w-full text-[11px] text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="px-3.5 py-2.5">Ward / Department</th>
                                          <th className="px-2.5 py-2.5 text-center">Allocated Stock</th>
                                          <th className="px-3.5 py-2.5 text-right">Share of Hospital Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                                        {(reportData?.inventory?.departmentDistribution || []).map((dept, idx) => {
                                          const totalCyl = reportData?.summary?.totalCylinders || 1
                                          const share = ((dept.count / totalCyl) * 100).toFixed(1)
                                          return (
                                            <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                              <td className="px-3.5 py-2 font-medium text-slate-900 dark:text-white">
                                                {dept.department}
                                              </td>
                                              <td className="px-2.5 py-2 text-center font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                                                {dept.count}
                                              </td>
                                              <td className="px-3.5 py-2 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                  <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                      className="h-full rounded-full bg-blue-600"
                                                      style={{ width: `${share}%` }}
                                                    />
                                                  </div>
                                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                                    {share}%
                                                  </span>
                                                </div>
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Share Donut & Ward Rankings */}
                      <div className="space-y-6">
                        {/* Share Pie/Donut Chart */}
                        <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                          <SectionHeader title="Cylinder Share" subtitle="Distribution by Type" icon={PieChartIcon} />
                          <div className="h-[200px] w-full flex items-center justify-center mt-2 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={reportData.usage.byType}
                                  dataKey="count"
                                  nameKey="type"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={70}
                                  paddingAngle={3}
                                >
                                  {reportData.usage.byType.map((entry: any, index: number) => {
                                    const colors = ["#00a68a", "#475569", "#3b82f6", "#f59e0b", "#ef4444"]
                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                  })}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Custom Legend */}
                          <div className="mt-4 space-y-1.5 border-t border-slate-50 pt-3">
                            {reportData.usage.byType.map((entry: any, index: number) => {
                              const colors = ["#00a68a", "#475569", "#3b82f6", "#f59e0b", "#ef4444"]
                              const color = colors[index % colors.length]
                              return (
                                <div key={entry.type} className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                    <span>{entry.type}</span>
                                  </div>
                                  <span className="font-mono text-slate-900 tabular-nums">
                                    {entry.count} Tanks ({entry.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Ward Consumption Ranking List */}
                        <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                          <SectionHeader title="Ward Consumption Rankings" subtitle="Legible Department Issue list" icon={Landmark} />
                          <div className="mt-4 space-y-4">
                            {reportData.usage.byDepartment.slice(0, 6).map((dept: any, index: number) => {
                              // Compute percentage relative to the top department
                              const maxVal = reportData.usage.byDepartment[0]?.count || 1
                              const percent = (dept.count / maxVal) * 100
                              
                              return (
                                <div key={dept.department} className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                                    <span className="truncate pr-4">{dept.department}</span>
                                    <span className="font-mono text-slate-900 tabular-nums shrink-0">{dept.count} Tanks</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#00a68a] rounded-full transition-all duration-500" 
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 4: DELIVERY & RECEPTION ─────────────────────────────── */}
                {activeTab === 'delivery' && (
                  <div className="space-y-6">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <KpiCard label="Total Deliveries" value={reportData.deliveries.total} icon={Download} color="teal" />
                      <KpiCard label="Average Order Cost" value={reportData.deliveries.avgDeliveryValue} prefix="RM " icon={Landmark} color="teal" />
                      <KpiCard label="Total Reception Value" value={reportData.summary.totalExpenses} prefix="RM " icon={History} color="rose" />
                      <KpiCard label="Pending Invoices" value={4} icon={AlertTriangle} color="amber" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Deliveries Count + Value composed chart */}
                      <div className="lg:col-span-2 bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                        <SectionHeader title="Monthly Refill Quantities & Expenditure" subtitle="Supplier Intake" icon={BarChart3} />
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={reportData.deliveries.monthlyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} tickFormatter={val => `${val} DOs`} />
                              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} tickFormatter={val => `RM ${val >= 1000 ? (val/1000)+'K' : val}`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: 9.5, fontWeight: 'semibold', paddingTop: 10 }} />
                              <Bar yAxisId="left" name="Delivery Count" dataKey="count" fill="#64748b" radius={[4, 4, 0, 0]} barSize={14} />
                              <Line yAxisId="right" name="Refill Amount (Value)" dataKey="amount" stroke="#00a68a" strokeWidth={2.5} dot={{ r: 3.5, stroke: '#00a68a', strokeWidth: 1.5, fill: '#fff' }} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Donut: Deliveries by status */}
                      <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                        <div>
                          <SectionHeader title="Receptions by Status" subtitle="Fulfillment States" icon={PieChartIcon} />
                        </div>
                        <div className="h-[200px] w-full flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip content={<CustomTooltip />} />
                              <Pie
                                data={reportData.deliveries.byStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="count"
                                nameKey="status"
                              >
                                {reportData.deliveries.byStatus.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="space-y-1.5 mt-4 text-[10px] font-bold text-slate-650">
                          {reportData.deliveries.byStatus.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                <span className="text-slate-600 font-semibold">{s.status}</span>
                              </div>
                              <span className="font-mono text-slate-800 font-bold">{s.count} Receptions</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent Deliveries list */}
                    <div className="bg-white border border-slate-200/50 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                      <div className="p-5.5 border-b border-slate-100">
                        <SectionHeader title="Recent Deliveries & Receptions" subtitle="Refill Logs" icon={History} />
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              <th className="px-6 py-3.5">Delivery Order (DO)</th>
                              <th className="px-6 py-3.5">Reception Date</th>
                              <th className="px-6 py-3.5">Items Count</th>
                              <th className="px-6 py-3.5">Fulfillment Status</th>
                              <th className="px-6 py-3.5 text-right">Value (RM)</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-semibold text-slate-650 divide-y divide-slate-100">
                            {reportData.deliveries.recentDeliveries.map(d => (
                              <tr key={d.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-3.5 font-bold text-slate-800">{d.delivery_order_no}</td>
                                <td className="px-6 py-3.5 text-slate-500">{new Date(d.reception_date).toLocaleDateString()}</td>
                                <td className="px-6 py-3.5 text-slate-500 font-mono">{d.items_count} Size types</td>
                                <td className="px-6 py-3.5">
                                  <span className={cn(
                                    "inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                    d.status === 'completed'
                                      ? "bg-[#e6f7f4] text-[#00a68a] border border-[#00a68a]/10"
                                      : "bg-amber-50 text-amber-600 border border-amber-100/40"
                                  )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", d.status === 'completed' ? "bg-[#00a68a]" : "bg-amber-500")} />
                                    {d.status}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-800">RM {d.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 5: INVENTORY STATUS ───────────────────────────────── */}
                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      {reportData.inventory.byStatus.map((item, idx) => (
                        <KpiCard
                          key={idx}
                          label={`${item.status} Cylinders`}
                          value={item.count}
                          icon={Boxes}
                          color={item.status.includes('Full') ? 'emerald' : item.status.includes('Use') ? 'indigo' : item.status.includes('Empty') ? 'rose' : 'amber'}
                          delay={idx * 0.05}
                        />
                      ))}
                      <KpiCard label="QR Tagged Rate" value={reportData.inventory.qrTaggedPercentage} suffix="%" icon={CheckCircle2} color="teal" decimals={1} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Stacked bar: status breakdown by type */}
                      <div className="lg:col-span-2 bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                        <SectionHeader title="Inventory Breakdown by Size Code & Status" subtitle="Total Storage Stock" icon={BarChart3} />
                        <div className="h-[300px] w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.inventory.byType} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                              <XAxis dataKey="type" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.01)' }} />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: 9.5, fontWeight: 'semibold', paddingTop: 10 }} />
                              <Bar name="Full" dataKey="full" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                              <Bar name="In Use" dataKey="inUse" stackId="a" fill="#00a68a" radius={[0, 0, 0, 0]} />
                              <Bar name="Empty" dataKey="empty" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                              <Bar name="Maintenance" dataKey="maintenance" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Donut: QR tagged vs untagged */}
                      <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                        <div>
                          <SectionHeader title="QR Tag Tracking Status" subtitle="Audits Compliance" icon={PieChartIcon} />
                        </div>
                        <div className="h-[200px] w-full flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip content={<CustomTooltip />} />
                              <Pie
                                data={[
                                  { name: 'QR Tagged', value: reportData.inventory.qrTaggedPercentage },
                                  { name: 'Untagged / Legacy', value: 100 - reportData.inventory.qrTaggedPercentage }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                <Cell fill="#00a68a" />
                                <Cell fill="#f1f5f9" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{reportData.inventory.qrTaggedPercentage.toFixed(0)}%</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tagged Rate</span>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4 text-[10px] font-bold text-slate-650">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span>Tagged QR Code</span>
                            <span className="font-mono text-slate-800 font-bold">{Math.round(reportData.summary.totalCylinders * (reportData.inventory.qrTaggedPercentage/100))} Tanks</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span>Untagged / Legacy Tanks</span>
                            <span className="font-mono text-slate-800 font-bold">{reportData.summary.totalCylinders - Math.round(reportData.summary.totalCylinders * (reportData.inventory.qrTaggedPercentage/100))} Tanks</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department Allocation list */}
                    <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                      <SectionHeader title="Cylinder Allocation by Ward / Location" subtitle="Current Stock Deployment" icon={Landmark} />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                        {reportData.inventory.departmentDistribution.map((d, idx) => {
                          return (
                            <div key={idx} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-all duration-200">
                              <span className="text-xs font-semibold text-slate-700 truncate mr-2">{d.department}</span>
                              <span className="text-[11px] font-bold text-slate-850 font-mono bg-white px-2 py-0.5 rounded border border-slate-200/40 shadow-sm shrink-0">{d.count} Tanks</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 6: FORECASTING ─────────────────────────────────────── */}
                {activeTab === 'forecasting' && (
                  <div className="space-y-6">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <KpiCard label="Runway Remaining" value={reportData.forecast.budgetRunway.monthsRemaining} suffix=" Months" icon={TrendingUp} color="amber" decimals={1} />
                      <KpiCard label="Next Month Total Projection" value={reportData.forecast.next3Months[0].predicted} suffix=" Cyls" icon={Activity} color="teal" />
                      <KpiCard label="Monthly Consumption Burn" value={reportData.forecast.budgetRunway.burnRate} prefix="RM " icon={Landmark} color="rose" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Forecasting 3 Months area chart with upper and lower bands */}
                      <div className="lg:col-span-2 bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                        <SectionHeader title="3-Month Consumption Forecast (Linear Regression)" subtitle="Oxygen Consumption Forecasting" icon={TrendingUp} />
                        
                        <div className="mb-4 mt-4 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-100/40 rounded-lg text-[10px] font-semibold text-amber-700">
                          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>Predictions are calculated via linear regression with confidence bands at ±15% forecasting threshold.</span>
                        </div>

                        <div className="h-[280px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reportData.forecast.next3Months} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <defs>
                                <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#00a68a" stopOpacity={0.1} />
                                  <stop offset="95%" stopColor="#00a68a" stopOpacity={0.005} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area name="Upper Confidence Band" dataKey="upper" stroke="none" fill="url(#forecastGlow)" />
                              <Area name="Predicted Demand" dataKey="predicted" stroke="#00a68a" strokeWidth={2.5} fill="none" dot={{ r: 3.5, stroke: '#00a68a', strokeWidth: 1.5, fill: '#fff' }} />
                              <Area name="Lower Confidence Band" dataKey="lower" stroke="none" fill="none" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Forecast table per type */}
                      <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                        <div>
                          <SectionHeader title="Next Month Predictions by Size" subtitle="Cylinder Categories" icon={Boxes} />
                        </div>
                        <div className="space-y-3 mt-4">
                          {reportData.forecast.nextMonth.map((f, idx) => (
                            <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all duration-200 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-slate-800">{f.type}</span>
                                <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5">Model Confidence: {f.confidence}%</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-[#00a68a] font-mono">{f.predicted}</span>
                                <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">predicted tanks</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Seasonal Trend overlay over 12 months */}
                    <div className="bg-white border border-slate-200/50 rounded-xl p-5.5 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)]">
                      <SectionHeader title="Annual Seasonal Consumption Average" subtitle="Seasonality Pattern" icon={Activity} />
                      <div className="h-[220px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={reportData.forecast.seasonalPattern} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="seasonalGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00a68a" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="#00a68a" stopOpacity={0.005} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area name="Average Seasonal Usage" dataKey="avgUsage" stroke="#00a68a" strokeWidth={2.5} fill="url(#seasonalGlow)" dot={{ r: 3, stroke: '#00a68a', strokeWidth: 1.5, fill: '#fff' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 7: DETAILED REGISTER DATA ──────────────────────────── */}
                {activeTab === 'detailed' && (
                  <div className="space-y-6">
                    {/* Filters header panel */}
                    <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Search */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                          placeholder="Search serial number, location, ward..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#00a68a] focus:ring-2 focus:ring-[#00a68a]/10 bg-slate-50/40 hover:bg-slate-50 transition-all placeholder:text-slate-400 text-slate-800"
                        />
                      </div>

                      {/* Dropdowns */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filters:</span>
                        </div>

                        {/* Status Filter */}
                        <select
                          value={statusFilter}
                          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                          className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium focus:outline-none focus:border-[#00a68a] focus:ring-2 focus:ring-[#00a68a]/10 hover:border-slate-300 transition-all text-slate-700 cursor-pointer"
                        >
                          <option value="all">All Statuses</option>
                          <option value="full">Full</option>
                          <option value="empty">Empty</option>
                          <option value="in_use">In Use</option>
                          <option value="maintenance">Maintenance</option>
                        </select>

                        {/* Size Filter */}
                        <select
                          value={sizeFilter}
                          onChange={e => { setSizeFilter(e.target.value); setCurrentPage(1); }}
                          className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium focus:outline-none focus:border-[#00a68a] focus:ring-2 focus:ring-[#00a68a]/10 hover:border-slate-300 transition-all text-slate-700 cursor-pointer"
                        >
                          <option value="all">All Sizes</option>
                          <option value="Size D">Size D</option>
                          <option value="Size F">Size F</option>
                          <option value="Size G">Size G</option>
                          <option value="Size K">Size K</option>
                        </select>

                        {/* Count label */}
                        <span className="text-xs bg-slate-50 text-slate-500 font-semibold px-3 py-2 rounded-lg border border-slate-200/60 tabular-nums">
                          {filteredCylinders.length} matched
                        </span>
                      </div>
                    </div>

                    {/* Cylinder Register Table */}
                    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/60 bg-slate-50/60 text-xs font-semibold text-slate-500">
                              <th className="px-6 py-3.5">Cylinder Serial</th>
                              <th className="px-6 py-3.5">Size Code</th>
                              <th className="px-6 py-3.5">Full Description</th>
                              <th className="px-6 py-3.5">Current Location</th>
                              <th className="px-6 py-3.5">Assigned Ward</th>
                              <th className="px-6 py-3.5">QR Tracking</th>
                              <th className="px-6 py-3.5">Fulfillment</th>
                              <th className="px-6 py-3.5 text-right">Last Movement</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-normal text-slate-600 divide-y divide-slate-100">
                            {paginatedCylinders.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                                  No cylinders match your search criteria. Try modifying your filter values.
                                </td>
                              </tr>
                            ) : (
                              paginatedCylinders.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="px-6 py-3 font-mono font-semibold text-slate-900">{c.serial_number}</td>
                                  <td className="px-6 py-3 font-mono text-slate-500">{c.size_code}</td>
                                  <td className="px-6 py-3 text-slate-700 font-medium">{c.type_name}</td>
                                  <td className="px-6 py-3 text-slate-600">{c.location_name}</td>
                                  <td className="px-6 py-3 text-slate-600">{c.department_name || '—'}</td>
                                  <td className="px-6 py-3">
                                    {c.qr_code ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] text-[#00a68a] font-medium bg-[#e6f7f4] border border-[#00a68a]/10 px-2 py-0.5 rounded">
                                        <CheckCircle2 className="w-3 h-3 text-[#00a68a]" />
                                        QR Tagged
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-200/40 px-2 py-0.5 rounded">
                                        Legacy
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-3">
                                    {(() => {
                                      const labelMap: Record<string, string> = {
                                        full: 'Full',
                                        empty: 'Empty',
                                        in_use: 'In Use',
                                        maintenance: 'Maintenance'
                                      };
                                      const statusLabel = labelMap[c.status] || c.status;
                                      const statusColor = getStatusColor(statusLabel);
                                      return (
                                        <span className={cn(
                                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors",
                                          c.status === 'full' && "bg-emerald-50/40 text-emerald-700 border-emerald-100/60",
                                          c.status === 'empty' && "bg-rose-50/40 text-rose-700 border-rose-100/60",
                                          c.status === 'in_use' && "bg-[#e6f7f4] text-[#00a68a] border-[#00a68a]/10",
                                          c.status === 'maintenance' && "bg-amber-50/40 text-amber-700 border-amber-100/60"
                                        )}>
                                          <span className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: statusColor }} />
                                          {statusLabel}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="px-6 py-3 text-right text-slate-500 font-mono tabular-nums">
                                    {c.last_movement_date ? new Date(c.last_movement_date).toLocaleDateString() : 'N/A'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="p-4 bg-slate-50/40 border-t border-slate-100/80 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">
                            Showing Page <span className="text-slate-800 font-semibold font-mono tabular-nums">{currentPage}</span> of <span className="text-slate-800 font-semibold font-mono tabular-nums">{totalPages}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="px-3.5 py-1.5 rounded-lg border border-slate-200/80 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.98]"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="px-3.5 py-1.5 rounded-lg border border-slate-200/80 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.98]"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default CylinderReportPage

