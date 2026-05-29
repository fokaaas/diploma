import { apiFetch } from './client'

export type ReportType =
  | 'EXPENSES'
  | 'CONTRIBUTIONS'
  | 'REQUESTS'
  | 'MOVEMENTS'
  | 'BALANCE'
export type Dimension = 'UNIT' | 'DONOR' | 'CATEGORY' | 'SUPPLIER' | 'COORDINATOR'
export type ExportFormat = 'XLSX' | 'PDF' | 'CSV'
export type PublicSection = 'funds' | 'expenses' | 'needs' | 'donors'

export const REPORT_TYPE_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'EXPENSES', label: 'Витрати за період' },
  { value: 'CONTRIBUTIONS', label: 'Надходження за донорами' },
  { value: 'REQUESTS', label: 'Виконання заявок за підрозділами' },
  { value: 'MOVEMENTS', label: 'Рух матеріальних цінностей' },
  { value: 'BALANCE', label: 'Зведений баланс' },
]

export const DIMENSION_OPTIONS: { value: Dimension; label: string }[] = [
  { value: 'UNIT', label: 'Підрозділ' },
  { value: 'DONOR', label: 'Донор' },
  { value: 'CATEGORY', label: 'Категорія товару' },
  { value: 'SUPPLIER', label: 'Постачальник' },
  { value: 'COORDINATOR', label: 'Координатор' },
]

export const APPLICABLE_DIMENSIONS: Record<ReportType, Dimension[]> = {
  EXPENSES: ['UNIT', 'CATEGORY', 'SUPPLIER', 'COORDINATOR'],
  CONTRIBUTIONS: ['DONOR'],
  REQUESTS: ['UNIT', 'COORDINATOR'],
  MOVEMENTS: ['CATEGORY'],
  BALANCE: [],
}

export const PUBLIC_SECTION_OPTIONS: { value: PublicSection; label: string }[] = [
  { value: 'funds', label: 'Сума зібраних коштів' },
  { value: 'expenses', label: 'Структура витрат за категоріями' },
  { value: 'needs', label: 'Закриті потреби (за підрозділами)' },
  { value: 'donors', label: 'Список донорів (за згодою)' },
]

export interface GeneratedReport {
  id: string
  title: string
  kind: 'INTERNAL' | 'PUBLIC'
  format: 'XLSX' | 'PDF' | 'CSV' | 'HTML'
  periodStart: string
  periodEnd: string
  createdAt: string
  generatedByName: string
  sizeBytes: number
  isPublished: boolean
  fileId: string | null
  publicSlug: string | null
}

export interface PublicSnapshot {
  collectedFunds?: number
  spent?: number
  balance?: number
  expenseStructure?: { name: string; value: number; pct: number }[]
  closedNeeds?: { unit: string; direction: string | null; given: string; sum: number }[]
  donors?: { name: string; amount: number }[]
}

export interface PublicReport {
  foundationName: string
  periodStart: string
  periodEnd: string
  snapshot: PublicSnapshot
}

export interface InternalReportInput {
  type: ReportType
  periodStart: string
  periodEnd: string
  dimensions: Dimension[]
  format: ExportFormat
}

export interface PublicReportInput {
  periodStart: string
  periodEnd: string
  sections: PublicSection[]
}

export function listReports(token: string): Promise<GeneratedReport[]> {
  return apiFetch<GeneratedReport[]>('/reports', { token })
}

export function generateReport(
  token: string,
  input: InternalReportInput,
): Promise<GeneratedReport> {
  return apiFetch<GeneratedReport>('/reports/generate', {
    method: 'POST',
    body: input,
    token,
  })
}

export function previewPublicReport(
  token: string,
  input: PublicReportInput,
): Promise<PublicReport> {
  return apiFetch<PublicReport>('/reports/public/preview', {
    method: 'POST',
    body: input,
    token,
  })
}

export function publishPublicReport(
  token: string,
  input: PublicReportInput,
): Promise<{ slug: string }> {
  return apiFetch<{ slug: string }>('/reports/public/publish', {
    method: 'POST',
    body: input,
    token,
  })
}

export function getPublicReport(slug: string): Promise<PublicReport> {
  return apiFetch<PublicReport>(`/public/reports/${slug}`)
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} МБ`
  if (bytes >= 1000) return `${Math.round(bytes / 1000)} КБ`
  return `${bytes} Б`
}
