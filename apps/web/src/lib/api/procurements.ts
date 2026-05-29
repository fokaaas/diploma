import type { ProcStatus } from '../../types/domain'
import { apiFetch, ApiError, BASE_URL } from './client'

type BackendStatus = 'DRAFT' | 'ORDERED' | 'PAID' | 'RECEIVED' | 'CLOSED'

const STATUS_TO_FE: Record<BackendStatus, ProcStatus> = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  PAID: 'paid',
  RECEIVED: 'received',
  CLOSED: 'closed',
}
const STATUS_TO_BE: Record<ProcStatus, BackendStatus> = {
  draft: 'DRAFT',
  ordered: 'ORDERED',
  paid: 'PAID',
  received: 'RECEIVED',
  closed: 'CLOSED',
}

export const NEXT_STATUSES: Record<ProcStatus, ProcStatus[]> = {
  draft: ['ordered'],
  ordered: ['paid'],
  paid: [],
  received: ['closed'],
  closed: [],
}

interface ProcurementResponse {
  id: string
  number: string
  supplierName: string
  itemsSummary: string
  lineCount: number
  requestNumber: string | null
  fundingNumbers: string[]
  totalAmount: number
  date: string
  status: BackendStatus
}

interface ProcurementDetailResponse extends ProcurementResponse {
  supplierId: string
  requestId: string | null
  requestUnitName: string | null
  createdByName: string
  fundedTotal: number
  lines: ProcurementLine[]
  funding: FundingSource[]
  goodsReceipts: GoodsReceipt[]
  files: ProcurementFile[]
  history: HistoryEntry[]
}

export interface ProcurementLine {
  id: string
  itemId: string | null
  name: string
  sku: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface FundingSource {
  contributionId: string
  contributionNumber: string
  donorName: string
  allocatedAmount: number
}

export interface GoodsReceipt {
  id: string
  warehouseName: string
  receivedAt: string
  note: string | null
  lines: { itemName: string; quantity: number }[]
}

export interface ProcurementFile {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  kind: string
  createdAt: string
}

export interface HistoryEntry {
  action: string
  summary: string
  actorName: string
  createdAt: string
}

export interface ProcurementListItem {
  id: string
  number: string
  supplierName: string
  itemsSummary: string
  lineCount: number
  requestNumber: string | null
  fundingNumbers: string[]
  totalAmount: number
  date: string
  status: ProcStatus
}

export interface ProcurementDetail extends ProcurementListItem {
  supplierId: string
  requestId: string | null
  requestUnitName: string | null
  createdByName: string
  fundedTotal: number
  lines: ProcurementLine[]
  funding: FundingSource[]
  goodsReceipts: GoodsReceipt[]
  files: ProcurementFile[]
  history: HistoryEntry[]
}

export interface ProcurementLineInput {
  name: string
  sku?: string
  quantity: number
  unitPrice: number
}

export interface FundingInput {
  contributionId: string
  allocatedAmount: number
}

export interface ProcurementInput {
  supplierId: string
  requestId?: string
  orderedAt: string
  lines: ProcurementLineInput[]
  funding: FundingInput[]
}

export type UpdateProcurementInput = Omit<ProcurementInput, 'supplierId'>

export interface ReceiveInput {
  warehouseName: string
  note?: string
  lines: { procurementLineId: string; quantity: number }[]
}

function toListItem(r: ProcurementResponse): ProcurementListItem {
  return {
    id: r.id,
    number: r.number,
    supplierName: r.supplierName,
    itemsSummary: r.itemsSummary,
    lineCount: r.lineCount,
    requestNumber: r.requestNumber,
    fundingNumbers: r.fundingNumbers,
    totalAmount: r.totalAmount,
    date: r.date,
    status: STATUS_TO_FE[r.status],
  }
}

function toDetail(r: ProcurementDetailResponse): ProcurementDetail {
  return {
    ...toListItem(r),
    supplierId: r.supplierId,
    requestId: r.requestId,
    requestUnitName: r.requestUnitName,
    createdByName: r.createdByName,
    fundedTotal: r.fundedTotal,
    lines: r.lines,
    funding: r.funding,
    goodsReceipts: r.goodsReceipts,
    files: r.files,
    history: r.history,
  }
}

function toBody(input: ProcurementInput | UpdateProcurementInput) {
  return {
    ...('supplierId' in input ? { supplierId: input.supplierId } : {}),
    requestId: input.requestId || undefined,
    orderedAt: input.orderedAt,
    lines: input.lines.map((l) => ({
      name: l.name,
      sku: l.sku || undefined,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
    funding: input.funding.map((f) => ({
      contributionId: f.contributionId,
      allocatedAmount: f.allocatedAmount,
    })),
  }
}

export function listProcurements(token: string): Promise<ProcurementListItem[]> {
  return apiFetch<ProcurementResponse[]>('/procurements', { token }).then((rows) =>
    rows.map(toListItem),
  )
}

export function getProcurement(token: string, id: string): Promise<ProcurementDetail> {
  return apiFetch<ProcurementDetailResponse>(`/procurements/${id}`, { token }).then(
    toDetail,
  )
}

export function createProcurement(
  token: string,
  input: ProcurementInput,
): Promise<ProcurementDetail> {
  return apiFetch<ProcurementDetailResponse>('/procurements', {
    method: 'POST',
    body: toBody(input),
    token,
  }).then(toDetail)
}

export function updateProcurement(
  token: string,
  id: string,
  input: UpdateProcurementInput,
): Promise<ProcurementDetail> {
  return apiFetch<ProcurementDetailResponse>(`/procurements/${id}`, {
    method: 'PATCH',
    body: toBody(input),
    token,
  }).then(toDetail)
}

export function changeProcurementStatus(
  token: string,
  id: string,
  status: ProcStatus,
): Promise<ProcurementDetail> {
  return apiFetch<ProcurementDetailResponse>(`/procurements/${id}/status`, {
    method: 'PATCH',
    body: { status: STATUS_TO_BE[status] },
    token,
  }).then(toDetail)
}

export function receiveProcurement(
  token: string,
  id: string,
  input: ReceiveInput,
): Promise<ProcurementDetail> {
  return apiFetch<ProcurementDetailResponse>(`/procurements/${id}/receive`, {
    method: 'POST',
    body: input,
    token,
  }).then(toDetail)
}

export function deleteProcurement(token: string, id: string): Promise<void> {
  return apiFetch(`/procurements/${id}`, { method: 'DELETE', token }).then(
    () => undefined,
  )
}

export async function uploadProcurementFile(
  token: string,
  procurementId: string,
  file: File,
): Promise<ProcurementFile> {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(`${BASE_URL}/procurements/${procurementId}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!response.ok) {
    throw new ApiError(response.status, 'Не вдалося завантажити файл')
  }
  return (await response.json()) as ProcurementFile
}

export { deleteFile, downloadFile } from './files'
