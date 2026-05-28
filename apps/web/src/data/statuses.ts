import type { ProcStatus, RequestStatus, StatusMeta } from '../types/domain'

export const REQUEST_STATUSES: StatusMeta<RequestStatus>[] = [
  { key: 'new', label: 'Нова', badge: 'new' },
  { key: 'confirmed', label: 'Підтверджена', badge: 'violet' },
  { key: 'progress', label: 'В роботі', badge: 'progress' },
  { key: 'partial', label: 'Частково виконана', badge: 'warning' },
  { key: 'fulfilled', label: 'Виконана', badge: 'success' },
  { key: 'closed', label: 'Закрита', badge: 'neutral' },
  { key: 'rejected', label: 'Відхилена', badge: 'danger' },
]

export const REQUEST_STATUS_BY_KEY: Record<RequestStatus, StatusMeta<RequestStatus>> =
  Object.fromEntries(REQUEST_STATUSES.map((s) => [s.key, s])) as Record<
    RequestStatus,
    StatusMeta<RequestStatus>
  >

export const PROC_STATUSES: StatusMeta<ProcStatus>[] = [
  { key: 'draft', label: 'Чернетка', badge: 'neutral' },
  { key: 'ordered', label: 'Замовлено', badge: 'new' },
  { key: 'paid', label: 'Оплачено', badge: 'progress' },
  { key: 'received', label: 'Отримано', badge: 'violet' },
  { key: 'closed', label: 'Закрита', badge: 'success' },
]

export const PROC_STATUS_BY_KEY: Record<ProcStatus, StatusMeta<ProcStatus>> =
  Object.fromEntries(PROC_STATUSES.map((s) => [s.key, s])) as Record<
    ProcStatus,
    StatusMeta<ProcStatus>
  >

export const REQUEST_LIFECYCLE: RequestStatus[] = [
  'new',
  'confirmed',
  'progress',
  'partial',
  'fulfilled',
  'closed',
]

export const PROC_LIFECYCLE: ProcStatus[] = ['draft', 'ordered', 'paid', 'received', 'closed']
