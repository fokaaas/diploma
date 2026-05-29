import type { ContributionForm, RequestStatus } from '../../types/domain'
import { apiFetch } from './client'
import { toRequestStatus } from './requests'
import { toContributionForm } from './contributions'
import type { AuditEntry } from './audit'

type BackendStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CLOSED'
  | 'REJECTED'
type BackendForm = 'MONETARY' | 'IN_KIND'

interface DashboardResponse {
  openRequests: number
  openRequestsWeekDelta: number
  inProgress: number
  inProgressCritical: number
  procurementsInProgress: number
  procurementsAmount: number
  lowStockCount: number
  contributionsMonth: number
  contributionsDeltaPct: number | null
  auditCount: number
  trend: { month: string; total: number }[]
  recentRequests: {
    id: string
    number: string
    unitName: string
    status: BackendStatus
    occurredAt: string
  }[]
  recentContributions: {
    id: string
    number: string
    donorName: string
    form: BackendForm
    amount: number
  }[]
  lowStockItems: {
    itemId: string
    name: string
    quantity: number
    minStock: number
    unit: string
    warehouseName: string
  }[]
  activity: AuditEntry[]
}

export interface RecentRequest {
  id: string
  number: string
  unitName: string
  status: RequestStatus
  occurredAt: string
}

export interface RecentContribution {
  id: string
  number: string
  donorName: string
  form: ContributionForm
  amount: number
}

export interface LowStockItem {
  itemId: string
  name: string
  quantity: number
  minStock: number
  unit: string
  warehouseName: string
}

export interface DashboardOverview {
  openRequests: number
  openRequestsWeekDelta: number
  inProgress: number
  inProgressCritical: number
  procurementsInProgress: number
  procurementsAmount: number
  lowStockCount: number
  contributionsMonth: number
  contributionsDeltaPct: number | null
  auditCount: number
  trend: { month: string; total: number }[]
  recentRequests: RecentRequest[]
  recentContributions: RecentContribution[]
  lowStockItems: LowStockItem[]
  activity: AuditEntry[]
}

export async function getDashboard(
  token: string,
  month: string,
): Promise<DashboardOverview> {
  const data = await apiFetch<DashboardResponse>(`/dashboard?month=${month}`, {
    token,
  })
  return {
    ...data,
    recentRequests: data.recentRequests.map((r) => ({
      ...r,
      status: toRequestStatus(r.status),
    })),
    recentContributions: data.recentContributions.map((c) => ({
      ...c,
      form: toContributionForm(c.form),
    })),
  }
}
