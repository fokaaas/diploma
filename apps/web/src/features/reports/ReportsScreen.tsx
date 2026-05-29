import { useMemo, useState } from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth, sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import { downloadFile } from '../../lib/api/files'
import {
  APPLICABLE_DIMENSIONS,
  DIMENSION_OPTIONS,
  PUBLIC_SECTION_OPTIONS,
  REPORT_TYPE_OPTIONS,
  formatBytes,
  generateReport,
  previewPublicReport,
  publishPublicReport,
  type Dimension,
  type ExportFormat,
  type GeneratedReport,
  type PublicReport,
  type PublicSection,
  type ReportType,
} from '../../lib/api/reports'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { PublicReportPreview } from './PublicReportPreview'

const FORMATS: ExportFormat[] = ['XLSX', 'PDF', 'CSV']
const CAN_MANAGE: Record<string, boolean> = { admin: true, accountant: true }
const routeApi = getRouteApi('/_app/reports')

function monthRange(): { start: string; end: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const pad = (n: number) => String(n).padStart(2, '0')
  const last = new Date(y, m + 1, 0).getDate()
  return { start: `${y}-${pad(m + 1)}-01`, end: `${y}-${pad(m + 1)}-${pad(last)}` }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

function reportFileName(report: GeneratedReport): string {
  const base =
    report.title.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '') ||
    'report'
  return `${base}.${report.format.toLowerCase()}`
}

export function ReportsScreen() {
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { reports } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false
  const defaults = useMemo(() => monthRange(), [])

  const [type, setType] = useState<ReportType>('EXPENSES')
  const [start, setStart] = useState(defaults.start)
  const [end, setEnd] = useState(defaults.end)
  const [dimensions, setDimensions] = useState<Set<Dimension>>(
    new Set<Dimension>(['UNIT', 'CATEGORY']),
  )
  const [format, setFormat] = useState<ExportFormat>('XLSX')

  const [pubStart, setPubStart] = useState(defaults.start)
  const [pubEnd, setPubEnd] = useState(defaults.end)
  const [sections, setSections] = useState<Set<PublicSection>>(
    new Set<PublicSection>(['funds', 'expenses', 'needs']),
  )

  const [preview, setPreview] = useState<PublicReport | null>(null)
  const [busy, setBusy] = useState(false)

  const applicable = APPLICABLE_DIMENSIONS[type]

  const toggleDimension = (dim: Dimension) =>
    setDimensions((prev) => {
      const next = new Set(prev)
      if (next.has(dim)) next.delete(dim)
      else next.add(dim)
      return next
    })

  const toggleSection = (section: PublicSection) =>
    setSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })

  const handleGenerate = async () => {
    setBusy(true)
    try {
      const report = await generateReport(token, {
        type,
        periodStart: start,
        periodEnd: end,
        dimensions: [...dimensions].filter((d) => applicable.includes(d)),
        format,
      })
      if (report.fileId) {
        await downloadFile(token, report.fileId, reportFileName(report))
      }
      showToast('Звіт сформовано')
      await router.invalidate()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Не вдалося сформувати звіт')
    } finally {
      setBusy(false)
    }
  }

  const handlePreview = async () => {
    try {
      const report = await previewPublicReport(token, {
        periodStart: pubStart,
        periodEnd: pubEnd,
        sections: [...sections],
      })
      setPreview(report)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Не вдалося сформувати перегляд')
    }
  }

  const handlePublish = async () => {
    setBusy(true)
    try {
      const { slug } = await publishPublicReport(token, {
        periodStart: pubStart,
        periodEnd: pubEnd,
        sections: [...sections],
      })
      showToast('Публічний звіт опубліковано')
      await router.invalidate()
      window.open(`/public-report?slug=${slug}`, '_blank')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Не вдалося опублікувати')
    } finally {
      setBusy(false)
    }
  }

  const openReport = (report: GeneratedReport) => {
    if (report.publicSlug) {
      window.open(`/public-report?slug=${report.publicSlug}`, '_blank')
    } else if (report.fileId) {
      void downloadFile(token, report.fileId, reportFileName(report)).catch(() =>
        showToast('Не вдалося завантажити'),
      )
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Звітність"
        subtitle="Внутрішні звіти за вимірами та публічна звітність для донорів"
      />

      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Конструктор внутрішнього звіту</h3>
          </div>
          <div className="card__body">
            <div className="field">
              <label>Тип звіту</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value as ReportType)}>
                {REPORT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Період з</label>
                <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="field">
                <label>по</label>
                <input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Розріз</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DIMENSION_OPTIONS.map((d) => {
                  const enabled = applicable.includes(d.value)
                  return (
                    <label key={d.value} className="checkbox" style={{ opacity: enabled ? 1 : 0.4 }}>
                      <input
                        type="checkbox"
                        disabled={!enabled}
                        checked={dimensions.has(d.value)}
                        onChange={() => toggleDimension(d.value)}
                      />{' '}
                      {d.label}
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="field">
              <label>Формат експорту</label>
              <div className="segmented" style={{ width: 'fit-content' }}>
                {FORMATS.map((f) => (
                  <button key={f} aria-pressed={format === f} onClick={() => setFormat(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {canManage && (
              <button className="btn btn--primary mt-2" onClick={() => void handleGenerate()} disabled={busy}>
                <Icon name="download" size={15} />
                Сформувати звіт
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Публічна звітність</h3>
          </div>
          <div className="card__body">
            <p className="muted" style={{ marginTop: 0 }}>
              Сформувати зведений публічний звіт фонду за період для розміщення на сайті.
            </p>
            <div className="form-row">
              <div className="field">
                <label>Звітний період з</label>
                <input className="input" type="date" value={pubStart} onChange={(e) => setPubStart(e.target.value)} />
              </div>
              <div className="field">
                <label>по</label>
                <input className="input" type="date" value={pubEnd} onChange={(e) => setPubEnd(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Розділи звіту</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PUBLIC_SECTION_OPTIONS.map((s) => (
                  <label key={s.value} className="checkbox">
                    <input
                      type="checkbox"
                      checked={sections.has(s.value)}
                      onChange={() => toggleSection(s.value)}
                    />{' '}
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => void handlePreview()}>
                <Icon name="eye" size={15} />
                Попередній перегляд
              </button>
              {canManage && (
                <button className="btn btn--primary" onClick={() => void handlePublish()} disabled={busy}>
                  <Icon name="globe" size={15} />
                  Опублікувати
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section-title mt-4">Раніше згенеровані звіти</div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Період</th>
              <th>Тип</th>
              <th>Дата формування</th>
              <th>Користувач</th>
              <th>Розмір</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} style={{ cursor: 'default' }}>
                <td style={{ fontWeight: 500 }}>
                  {r.title}{' '}
                  {r.isPublished && (
                    <span className="badge badge--success" style={{ marginLeft: 8 }}>
                      опубліковано
                    </span>
                  )}
                </td>
                <td className="col-muted">
                  {formatDate(r.periodStart)} — {formatDate(r.periodEnd)}
                </td>
                <td className="col-muted">
                  {r.kind === 'PUBLIC' ? 'Публічний' : 'Внутрішній'} · {r.format}
                </td>
                <td className="col-muted">{formatDate(r.createdAt)}</td>
                <td>{r.generatedByName}</td>
                <td className="col-num text-sm muted">
                  {r.sizeBytes ? formatBytes(r.sizeBytes) : '—'}
                </td>
                <td>
                  <button
                    className="btn btn--icon btn--ghost"
                    aria-label={r.publicSlug ? 'Відкрити' : 'Завантажити'}
                    onClick={() => openReport(r)}
                  >
                    <Icon name={r.publicSlug ? 'globe' : 'download'} size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr style={{ cursor: 'default' }}>
                <td colSpan={7} className="muted text-center" style={{ padding: 24 }}>
                  Звітів ще немає
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {preview && <PublicReportPreview report={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}
