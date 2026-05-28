// Доменна модель платформи фонду. Усі сутності походять з аналізу предметної
// області (заявки → закупівлі → внески → склад → видача → підрозділ).

export type Role = 'admin' | 'coordinator' | 'accountant' | 'auditor'

export type BadgeVariant =
  | 'new'
  | 'progress'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'violet'
  | 'plain'

export type Priority = 'high' | 'med' | 'low'

export interface Foundation {
  name: string
  short: string
  legal: string
  edrpou: string
  address: string
}

export type UserStatus = 'active' | 'invited' | 'blocked'

export interface User {
  id: string
  name: string
  initials: string
  email: string
  role: Role
  status: UserStatus
  lastSeen: string
}

export type CounterpartyType = 'unit' | 'donor' | 'supplier'

export interface Counterparty {
  id: string
  code: string
  type: CounterpartyType
  name: string
  form: string
  contact: string
  phone: string
  channel: string
  note: string
  requests: number
  lastInteraction: string
}

export interface Item {
  id: string
  sku: string
  name: string
  unit: string
  category: string
  stock: number
  minStock: number
  lastPrice: number
  location: string
  warn?: boolean
}

export type RequestStatus =
  | 'new'
  | 'confirmed'
  | 'progress'
  | 'partial'
  | 'fulfilled'
  | 'closed'
  | 'rejected'

export interface RequestRecord {
  id: string
  date: string
  /** Counterparty id (type === 'unit') */
  unit: string
  coordinator: string
  priority: Priority
  status: RequestStatus
  deadline: string
  items: string
  value: number
  attachments: number
}

export type ContributionForm = 'monetary' | 'in-kind'

export interface Contribution {
  id: string
  date: string
  /** Counterparty id (type === 'donor') */
  donor: string
  form: ContributionForm
  amount: number
  purpose: string
  doc: string
  linkedProc: number
  itemName?: string
  itemQty?: number
}

export type ProcStatus = 'draft' | 'ordered' | 'paid' | 'received' | 'closed'

export interface Procurement {
  id: string
  date: string
  /** Counterparty id (type === 'supplier') */
  supplier: string
  status: ProcStatus
  amount: number
  /** Request id */
  request: string
  /** Contribution ids financing this procurement */
  funding: string[]
  lines: string
}

export type MovementType = 'in' | 'out'

export interface Movement {
  id: string
  date: string
  type: MovementType
  item: string
  qty: number
  source: string
  user: string
}

export interface AuditEntry {
  date: string
  user: string
  action: string
  entity: string
  detail: string
}

export interface StatusMeta<K extends string> {
  key: K
  label: string
  badge: BadgeVariant
}
