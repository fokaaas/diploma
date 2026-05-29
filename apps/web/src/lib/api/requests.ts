import type { Priority, ProcStatus, RequestStatus } from '../../types/domain'
import { apiFetch, ApiError, BASE_URL } from './client'
import {
  CHANNEL_LABEL,
  type Channel,
} from './counterparties'

type BackendStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CLOSED'
  | 'REJECTED'
type BackendPriority = 'HIGH' | 'MEDIUM' | 'LOW'
type BackendProcStatus = 'DRAFT' | 'ORDERED' | 'PAID' | 'RECEIVED' | 'CLOSED'

const STATUS_TO_FE: Record<BackendStatus, RequestStatus> = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'progress',
  PARTIALLY_FULFILLED: 'partial',
  FULFILLED: 'fulfilled',
  CLOSED: 'closed',
  REJECTED: 'rejected',
}
const STATUS_TO_BE: Record<RequestStatus, BackendStatus> = {
  new: 'NEW',
  confirmed: 'CONFIRMED',
  progress: 'IN_PROGRESS',
  partial: 'PARTIALLY_FULFILLED',
  fulfilled: 'FULFILLED',
  closed: 'CLOSED',
  rejected: 'REJECTED',
}
const PRIORITY_TO_FE: Record<BackendPriority, Priority> = {
  HIGH: 'high',
  MEDIUM: 'med',
  LOW: 'low',
}
const PRIORITY_TO_BE: Record<Priority, BackendPriority> = {
  high: 'HIGH',
  med: 'MEDIUM',
  low: 'LOW',
}
const PROC_STATUS_TO_FE: Record<BackendProcStatus, ProcStatus> = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  PAID: 'paid',
  RECEIVED: 'received',
  CLOSED: 'closed',
}

export const NEXT_STATUSES: Record<RequestStatus, RequestStatus[]> = {
  new: ['confirmed', 'rejected'],
  confirmed: ['progress', 'rejected'],
  progress: ['partial', 'fulfilled', 'rejected'],
  partial: ['fulfilled', 'rejected'],
  fulfilled: ['closed'],
  closed: [],
  rejected: [],
}

interface RequestResponse {
  id: string
  number: string
  unitId: string
  unitName: string
  unitContactName: string
  priority: BackendPriority
  status: BackendStatus
  deadline: string | null
  date: string
  itemsSummary: string
  lineCount: number
  estimatedValue: number
}

interface RequestDetailResponse extends RequestResponse {
  channel: Channel | null
  unitNote: string | null
  unitPhone: string | null
  registeredByName: string
  assigneeName: string | null
  lines: {
    id: string
    name: string
    sku: string | null
    quantity: number
    unit: string
    techSpec: string | null
    receivedQuantity: number
    lineTotal: number | null
  }[]
  files: RequestFile[]
  linkedProcurements: {
    id: string
    number: string
    supplierName: string
    status: BackendProcStatus
    amount: number
    lineCount: number
  }[]
  history: HistoryEntry[]
}

export interface RequestListItem {
  id: string
  number: string
  unitId: string
  unitName: string
  unitContactName: string
  priority: Priority
  status: RequestStatus
  deadline: string | null
  date: string
  itemsSummary: string
  lineCount: number
  estimatedValue: number
}

export interface RequestLine {
  id: string
  name: string
  sku: string | null
  quantity: number
  unit: string
  techSpec: string | null
  receivedQuantity: number
  lineTotal: number | null
}

export interface RequestFile {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  kind: string
  createdAt: string
}

export interface LinkedProcurement {
  id: string
  number: string
  supplierName: string
  status: ProcStatus
  amount: number
  lineCount: number
}

export interface HistoryEntry {
  action: string
  summary: string
  actorName: string
  createdAt: string
}

export interface RequestDetail extends RequestListItem {
  channel: Channel | null
  channelLabel: string | null
  unitNote: string | null
  unitPhone: string | null
  registeredByName: string
  assigneeName: string | null
  lines: RequestLine[]
  files: RequestFile[]
  linkedProcurements: LinkedProcurement[]
  history: HistoryEntry[]
}

export interface RequestLineInput {
  name: string
  sku?: string
  quantity: number
  unit: string
  techSpec?: string
}

export interface RequestInput {
  unitId: string
  unitContactName: string
  priority: Priority
  deadline?: string
  channel?: Channel
  assigneeId?: string
  lines: RequestLineInput[]
}

export type UpdateRequestInput = Omit<RequestInput, 'unitId'>

function toListItem(r: RequestResponse): RequestListItem {
  return {
    id: r.id,
    number: r.number,
    unitId: r.unitId,
    unitName: r.unitName,
    unitContactName: r.unitContactName,
    priority: PRIORITY_TO_FE[r.priority],
    status: STATUS_TO_FE[r.status],
    deadline: r.deadline,
    date: r.date,
    itemsSummary: r.itemsSummary,
    lineCount: r.lineCount,
    estimatedValue: r.estimatedValue,
  }
}

function toDetail(r: RequestDetailResponse): RequestDetail {
  return {
    ...toListItem(r),
    channel: r.channel,
    channelLabel: r.channel ? CHANNEL_LABEL[r.channel] : null,
    unitNote: r.unitNote,
    unitPhone: r.unitPhone,
    registeredByName: r.registeredByName,
    assigneeName: r.assigneeName,
    lines: r.lines,
    files: r.files,
    linkedProcurements: r.linkedProcurements.map((p) => ({
      ...p,
      status: PROC_STATUS_TO_FE[p.status],
    })),
    history: r.history,
  }
}

function toBody(input: RequestInput | UpdateRequestInput) {
  return {
    ...('unitId' in input ? { unitId: input.unitId } : {}),
    unitContactName: input.unitContactName,
    priority: PRIORITY_TO_BE[input.priority],
    deadline: input.deadline || undefined,
    channel: input.channel || undefined,
    assigneeId: input.assigneeId || undefined,
    lines: input.lines.map((l) => ({
      name: l.name,
      sku: l.sku || undefined,
      quantity: l.quantity,
      unit: l.unit,
      techSpec: l.techSpec || undefined,
    })),
  }
}

export function listRequests(token: string): Promise<RequestListItem[]> {
  return apiFetch<RequestResponse[]>('/requests', { token }).then((rows) =>
    rows.map(toListItem),
  )
}

export function getRequest(token: string, id: string): Promise<RequestDetail> {
  return apiFetch<RequestDetailResponse>(`/requests/${id}`, { token }).then(
    toDetail,
  )
}

export function createRequest(
  token: string,
  input: RequestInput,
): Promise<RequestDetail> {
  return apiFetch<RequestDetailResponse>('/requests', {
    method: 'POST',
    body: toBody(input),
    token,
  }).then(toDetail)
}

export function updateRequest(
  token: string,
  id: string,
  input: UpdateRequestInput,
): Promise<RequestDetail> {
  return apiFetch<RequestDetailResponse>(`/requests/${id}`, {
    method: 'PATCH',
    body: toBody(input),
    token,
  }).then(toDetail)
}

export function changeRequestStatus(
  token: string,
  id: string,
  status: RequestStatus,
): Promise<RequestDetail> {
  return apiFetch<RequestDetailResponse>(`/requests/${id}/status`, {
    method: 'PATCH',
    body: { status: STATUS_TO_BE[status] },
    token,
  }).then(toDetail)
}

export function deleteRequest(token: string, id: string): Promise<void> {
  return apiFetch(`/requests/${id}`, { method: 'DELETE', token }).then(
    () => undefined,
  )
}

export async function uploadRequestFile(
  token: string,
  requestId: string,
  file: File,
): Promise<RequestFile> {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(`${BASE_URL}/requests/${requestId}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!response.ok) {
    throw new ApiError(response.status, 'Не вдалося завантажити файл')
  }
  return (await response.json()) as RequestFile
}

export { deleteFile, downloadFile } from './files'
