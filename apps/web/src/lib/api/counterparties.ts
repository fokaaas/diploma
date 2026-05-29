import type {
  ContributionForm,
  CounterpartyType,
  ProcStatus,
  RequestStatus,
} from '../../types/domain'
import { apiFetch } from './client'

type BackendType = 'UNIT' | 'DONOR' | 'SUPPLIER'
export type LegalForm = 'LEGAL_ENTITY' | 'INDIVIDUAL' | 'SOLE_PROPRIETOR' | 'NON_LEGAL'
export type Channel = 'SIGNAL' | 'TELEGRAM' | 'EMAIL' | 'PHONE'
type BackendRequestStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CLOSED'
  | 'REJECTED'
type BackendProcStatus = 'DRAFT' | 'ORDERED' | 'PAID' | 'RECEIVED' | 'CLOSED'
type BackendContribForm = 'MONETARY' | 'IN_KIND'

const TYPE_TO_FE: Record<BackendType, CounterpartyType> = {
  UNIT: 'unit',
  DONOR: 'donor',
  SUPPLIER: 'supplier',
}
const TYPE_TO_BE: Record<CounterpartyType, BackendType> = {
  unit: 'UNIT',
  donor: 'DONOR',
  supplier: 'SUPPLIER',
}

export const LEGAL_FORM_LABEL: Record<LegalForm, string> = {
  LEGAL_ENTITY: 'юр. особа',
  INDIVIDUAL: 'фіз. особа',
  SOLE_PROPRIETOR: 'ФОП',
  NON_LEGAL: 'неюр. особа',
}
export const CHANNEL_LABEL: Record<Channel, string> = {
  SIGNAL: 'Signal',
  TELEGRAM: 'Telegram',
  EMAIL: 'Email',
  PHONE: 'Phone',
}

export const LEGAL_FORM_OPTIONS = (Object.keys(LEGAL_FORM_LABEL) as LegalForm[]).map(
  (value) => ({ value, label: LEGAL_FORM_LABEL[value] }),
)
export const CHANNEL_OPTIONS = (Object.keys(CHANNEL_LABEL) as Channel[]).map(
  (value) => ({ value, label: CHANNEL_LABEL[value] }),
)
export const TYPE_OPTIONS: { value: CounterpartyType; label: string }[] = [
  { value: 'unit', label: 'Військовий підрозділ' },
  { value: 'donor', label: 'Благодійний партнер' },
  { value: 'supplier', label: 'Постачальник' },
]

const REQUEST_STATUS_TO_FE: Record<BackendRequestStatus, RequestStatus> = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'progress',
  PARTIALLY_FULFILLED: 'partial',
  FULFILLED: 'fulfilled',
  CLOSED: 'closed',
  REJECTED: 'rejected',
}
const PROC_STATUS_TO_FE: Record<BackendProcStatus, ProcStatus> = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  PAID: 'paid',
  RECEIVED: 'received',
  CLOSED: 'closed',
}
const CONTRIB_FORM_TO_FE: Record<BackendContribForm, ContributionForm> = {
  MONETARY: 'monetary',
  IN_KIND: 'in-kind',
}

interface CounterpartyResponse {
  id: string
  code: string
  type: BackendType
  name: string
  legalForm: LegalForm
  contactPerson: string | null
  phone: string | null
  email: string | null
  channel: Channel | null
  note: string | null
  firstContactAt: string | null
  operationsCount: number
  lastInteractionAt: string | null
}

interface CounterpartyDetailResponse extends CounterpartyResponse {
  linkedRequests: {
    id: string
    number: string
    status: BackendRequestStatus
    date: string
    lineCount: number
  }[]
  linkedContributions: {
    id: string
    number: string
    form: BackendContribForm
    purpose: string | null
    amount: number
    date: string
  }[]
  linkedProcurements: {
    id: string
    number: string
    status: BackendProcStatus
    amount: number
    date: string
    lineCount: number
  }[]
}

export interface Counterparty {
  id: string
  code: string
  type: CounterpartyType
  name: string
  legalForm: LegalForm
  legalFormLabel: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  channel: Channel | null
  channelLabel: string | null
  note: string | null
  firstContactAt: string | null
  operationsCount: number
  lastInteractionAt: string | null
}

export interface LinkedRequest {
  id: string
  number: string
  status: RequestStatus
  date: string
  lineCount: number
}
export interface LinkedContribution {
  id: string
  number: string
  form: ContributionForm
  purpose: string | null
  amount: number
  date: string
}
export interface LinkedProcurement {
  id: string
  number: string
  status: ProcStatus
  amount: number
  date: string
  lineCount: number
}

export interface CounterpartyDetail extends Counterparty {
  linkedRequests: LinkedRequest[]
  linkedContributions: LinkedContribution[]
  linkedProcurements: LinkedProcurement[]
}

export interface CounterpartyInput {
  type: CounterpartyType
  name: string
  legalForm: LegalForm
  contactPerson?: string
  phone?: string
  email?: string
  channel?: Channel
  note?: string
  firstContactAt?: string
}

export type UpdateCounterpartyInput = Omit<CounterpartyInput, 'type'>

function toCounterparty(r: CounterpartyResponse): Counterparty {
  return {
    id: r.id,
    code: r.code,
    type: TYPE_TO_FE[r.type],
    name: r.name,
    legalForm: r.legalForm,
    legalFormLabel: LEGAL_FORM_LABEL[r.legalForm],
    contactPerson: r.contactPerson,
    phone: r.phone,
    email: r.email,
    channel: r.channel,
    channelLabel: r.channel ? CHANNEL_LABEL[r.channel] : null,
    note: r.note,
    firstContactAt: r.firstContactAt,
    operationsCount: r.operationsCount,
    lastInteractionAt: r.lastInteractionAt,
  }
}

function toDetail(r: CounterpartyDetailResponse): CounterpartyDetail {
  return {
    ...toCounterparty(r),
    linkedRequests: r.linkedRequests.map((x) => ({
      ...x,
      status: REQUEST_STATUS_TO_FE[x.status],
    })),
    linkedContributions: r.linkedContributions.map((x) => ({
      ...x,
      form: CONTRIB_FORM_TO_FE[x.form],
    })),
    linkedProcurements: r.linkedProcurements.map((x) => ({
      ...x,
      status: PROC_STATUS_TO_FE[x.status],
    })),
  }
}

function toBody(input: CounterpartyInput | UpdateCounterpartyInput) {
  return {
    ...('type' in input ? { type: TYPE_TO_BE[input.type] } : {}),
    name: input.name,
    legalForm: input.legalForm,
    contactPerson: input.contactPerson,
    phone: input.phone,
    email: input.email || undefined,
    channel: input.channel || undefined,
    note: input.note,
    firstContactAt: input.firstContactAt || undefined,
  }
}

export function listCounterparties(token: string): Promise<Counterparty[]> {
  return apiFetch<CounterpartyResponse[]>('/counterparties', { token }).then(
    (rows) => rows.map(toCounterparty),
  )
}

export function getCounterparty(
  token: string,
  id: string,
): Promise<CounterpartyDetail> {
  return apiFetch<CounterpartyDetailResponse>(`/counterparties/${id}`, {
    token,
  }).then(toDetail)
}

export function createCounterparty(
  token: string,
  input: CounterpartyInput,
): Promise<Counterparty> {
  return apiFetch<CounterpartyResponse>('/counterparties', {
    method: 'POST',
    body: toBody(input),
    token,
  }).then(toCounterparty)
}

export function updateCounterparty(
  token: string,
  id: string,
  input: UpdateCounterpartyInput,
): Promise<Counterparty> {
  return apiFetch<CounterpartyResponse>(`/counterparties/${id}`, {
    method: 'PATCH',
    body: toBody(input),
    token,
  }).then(toCounterparty)
}

export function deleteCounterparty(token: string, id: string): Promise<void> {
  return apiFetch(`/counterparties/${id}`, { method: 'DELETE', token }).then(
    () => undefined,
  )
}
