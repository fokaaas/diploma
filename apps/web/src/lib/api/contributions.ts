import type { ContributionForm, ProcStatus } from '../../types/domain'
import { apiFetch, ApiError, BASE_URL } from './client'

type BackendForm = 'MONETARY' | 'IN_KIND'
type BackendProcStatus = 'DRAFT' | 'ORDERED' | 'PAID' | 'RECEIVED' | 'CLOSED'

const FORM_TO_FE: Record<BackendForm, ContributionForm> = {
  MONETARY: 'monetary',
  IN_KIND: 'in-kind',
}
const FORM_TO_BE: Record<ContributionForm, BackendForm> = {
  monetary: 'MONETARY',
  'in-kind': 'IN_KIND',
}
const PROC_STATUS_TO_FE: Record<BackendProcStatus, ProcStatus> = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  PAID: 'paid',
  RECEIVED: 'received',
  CLOSED: 'closed',
}

interface ContributionResponse {
  id: string
  number: string
  donorId: string
  donorName: string
  form: BackendForm
  amount: number
  currency: string
  purpose: string | null
  baseDocumentLabel: string | null
  date: string
  procurementCount: number
  allocatedTotal: number
}

interface ContributionDetailResponse extends ContributionResponse {
  itemName: string | null
  itemQuantity: number | null
  donorNote: string | null
  registeredByName: string
  unspent: number
  linkedProcurements: {
    id: string
    number: string
    supplierName: string
    status: BackendProcStatus
    amount: number
    lineCount: number
  }[]
  files: ContributionFile[]
}

export interface ContributionFile {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  kind: string
  createdAt: string
}

export interface ContributionListItem {
  id: string
  number: string
  donorId: string
  donorName: string
  form: ContributionForm
  amount: number
  currency: string
  purpose: string | null
  baseDocumentLabel: string | null
  date: string
  procurementCount: number
  allocatedTotal: number
}

export interface FundedProcurement {
  id: string
  number: string
  supplierName: string
  status: ProcStatus
  amount: number
  lineCount: number
}

export interface ContributionDetail extends ContributionListItem {
  itemName: string | null
  itemQuantity: number | null
  donorNote: string | null
  registeredByName: string
  unspent: number
  linkedProcurements: FundedProcurement[]
  files: ContributionFile[]
}

export interface ContributionInput {
  donorId: string
  form: ContributionForm
  amount: number
  currency?: string
  purpose?: string
  baseDocumentLabel?: string
  occurredAt: string
  itemName?: string
  itemQuantity?: number
}

export type UpdateContributionInput = Omit<ContributionInput, 'donorId'>

function toListItem(r: ContributionResponse): ContributionListItem {
  return {
    id: r.id,
    number: r.number,
    donorId: r.donorId,
    donorName: r.donorName,
    form: FORM_TO_FE[r.form],
    amount: r.amount,
    currency: r.currency,
    purpose: r.purpose,
    baseDocumentLabel: r.baseDocumentLabel,
    date: r.date,
    procurementCount: r.procurementCount,
    allocatedTotal: r.allocatedTotal,
  }
}

function toDetail(r: ContributionDetailResponse): ContributionDetail {
  return {
    ...toListItem(r),
    itemName: r.itemName,
    itemQuantity: r.itemQuantity,
    donorNote: r.donorNote,
    registeredByName: r.registeredByName,
    unspent: r.unspent,
    linkedProcurements: r.linkedProcurements.map((p) => ({
      ...p,
      status: PROC_STATUS_TO_FE[p.status],
    })),
    files: r.files,
  }
}

function toBody(input: ContributionInput | UpdateContributionInput) {
  const inKind = input.form === 'in-kind'
  return {
    ...('donorId' in input ? { donorId: input.donorId } : {}),
    form: FORM_TO_BE[input.form],
    amount: input.amount,
    currency: input.currency || undefined,
    purpose: input.purpose || undefined,
    baseDocumentLabel: input.baseDocumentLabel || undefined,
    occurredAt: input.occurredAt,
    itemName: inKind ? input.itemName || undefined : undefined,
    itemQuantity: inKind ? input.itemQuantity : undefined,
  }
}

export function listContributions(token: string): Promise<ContributionListItem[]> {
  return apiFetch<ContributionResponse[]>('/contributions', { token }).then(
    (rows) => rows.map(toListItem),
  )
}

export function getContribution(
  token: string,
  id: string,
): Promise<ContributionDetail> {
  return apiFetch<ContributionDetailResponse>(`/contributions/${id}`, {
    token,
  }).then(toDetail)
}

export function createContribution(
  token: string,
  input: ContributionInput,
): Promise<ContributionDetail> {
  return apiFetch<ContributionDetailResponse>('/contributions', {
    method: 'POST',
    body: toBody(input),
    token,
  }).then(toDetail)
}

export function updateContribution(
  token: string,
  id: string,
  input: UpdateContributionInput,
): Promise<ContributionDetail> {
  return apiFetch<ContributionDetailResponse>(`/contributions/${id}`, {
    method: 'PATCH',
    body: toBody(input),
    token,
  }).then(toDetail)
}

export function deleteContribution(token: string, id: string): Promise<void> {
  return apiFetch(`/contributions/${id}`, { method: 'DELETE', token }).then(
    () => undefined,
  )
}

export async function uploadContributionFile(
  token: string,
  contributionId: string,
  file: File,
): Promise<ContributionFile> {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(
    `${BASE_URL}/contributions/${contributionId}/files`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
  )
  if (!response.ok) {
    throw new ApiError(response.status, 'Не вдалося завантажити файл')
  }
  return (await response.json()) as ContributionFile
}
