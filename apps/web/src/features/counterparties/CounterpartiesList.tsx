import { useMemo, useState } from 'react'
import { getRouteApi, useNavigate, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth, sessionStore } from '../../lib/auth/session'
import {
  CHANNEL_OPTIONS,
  LEGAL_FORM_OPTIONS,
  createCounterparty,
  type Counterparty,
  type CounterpartyInput,
} from '../../lib/api/counterparties'
import { downloadCsv } from '../../lib/export/csv'
import type { BadgeVariant, CounterpartyType } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { FilterDropdown } from '../../components/ui/FilterDropdown'
import { CounterpartyModal } from './CounterpartyModal'

type TypeFilter = 'all' | CounterpartyType

const TYPE_LABEL: Record<CounterpartyType, string> = {
  unit: 'Військовий підрозділ',
  donor: 'Благодійний партнер',
  supplier: 'Постачальник',
}

const TYPE_BADGE: Record<CounterpartyType, BadgeVariant> = {
  unit: 'plain',
  donor: 'success',
  supplier: 'violet',
}

const TABS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'Усі' },
  { key: 'unit', label: 'Військові підрозділи' },
  { key: 'donor', label: 'Благодійні партнери' },
  { key: 'supplier', label: 'Постачальники' },
]

const CAN_MANAGE: Record<string, boolean> = { admin: true, coordinator: true }

const routeApi = getRouteApi('/_app/counterparties/')

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

export function CounterpartiesList() {
  const navigate = useNavigate()
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { counterparties } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false

  const [tab, setTab] = useState<TypeFilter>('all')
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState('all')
  const [form, setForm] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return counterparties.filter((c) => {
      if (tab !== 'all' && c.type !== tab) return false
      if (channel !== 'all' && c.channel !== channel) return false
      if (form !== 'all' && c.legalForm !== form) return false
      if (query === '') return true
      return [c.name, c.code, c.contactPerson, c.phone]
        .some((field) => field?.toLowerCase().includes(query))
    })
  }, [counterparties, tab, search, channel, form])

  const handleCreate = async (input: CounterpartyInput) => {
    await createCounterparty(token, input)
    setCreateOpen(false)
    showToast('Контрагента створено')
    await router.invalidate()
  }

  const handleExport = () => {
    try {
      downloadCsv(
        'kontrahenty.csv',
        ['Код', 'Назва', 'Тип', 'Форма', 'Контактна особа', 'Телефон', 'Email', 'Канал', 'Операцій', 'Остання взаємодія'],
        filtered.map((c) => [
          c.code,
          c.name,
          TYPE_LABEL[c.type],
          c.legalFormLabel,
          c.contactPerson,
          c.phone,
          c.email,
          c.channelLabel,
          c.operationsCount,
          formatDate(c.lastInteractionAt),
        ]),
      )
      showToast('Експорт сформовано')
    } catch {
      showToast('Не вдалося сформувати експорт')
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Контрагенти"
        subtitle="Єдина база партнерів: підрозділи, донори, постачальники"
        actions={
          <>
            <button className="btn" onClick={handleExport}>
              <Icon name="download" size={15} />
              Експорт
            </button>
            {canManage && (
              <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
                <Icon name="plus" size={15} />
                Новий контрагент
              </button>
            )}
          </>
        }
      />

      <div className="tabs">
        {TABS.map((t) => {
          const count =
            t.key === 'all'
              ? counterparties.length
              : counterparties.filter((c) => c.type === t.key).length
          return (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? 'tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label} <span className="count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" size={14} color="var(--text-faint)" />
            <input
              placeholder="Пошук за назвою, контактом, телефоном..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterDropdown
            label="Канал зв'язку"
            options={CHANNEL_OPTIONS}
            value={channel}
            onChange={setChannel}
          />
          <FilterDropdown
            label="Форма"
            options={LEGAL_FORM_OPTIONS}
            value={form}
            onChange={setForm}
          />
          <div style={{ marginLeft: 'auto' }} className="muted text-sm">
            Знайдено: {filtered.length}
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Код</th>
              <th>Назва</th>
              <th>Тип</th>
              <th>Форма</th>
              <th>Контактна особа</th>
              <th>Канал</th>
              <th style={{ width: 80 }} className="col-num">
                Операцій
              </th>
              <th>Остання взаємодія</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <CounterpartyRow key={c.id} counterparty={c} onOpen={() => void navigate({ to: '/counterparties/$counterpartyId', params: { counterpartyId: c.id } })} />
            ))}
            {filtered.length === 0 && (
              <tr style={{ cursor: 'default' }}>
                <td colSpan={9} className="muted text-center" style={{ padding: 24 }}>
                  Контрагентів не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <CounterpartyModal onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  )
}

function CounterpartyRow({
  counterparty: c,
  onOpen,
}: {
  counterparty: Counterparty
  onOpen: () => void
}) {
  return (
    <tr onClick={onOpen}>
      <td className="col-id">{c.code}</td>
      <td>
        <div style={{ fontWeight: 500 }}>{c.name}</div>
        {c.note && <div className="text-xs muted">{c.note}</div>}
      </td>
      <td>
        <span className={`badge badge--${TYPE_BADGE[c.type]}`}>{TYPE_LABEL[c.type]}</span>
      </td>
      <td className="col-muted text-sm">{c.legalFormLabel}</td>
      <td>
        <div>{c.contactPerson ?? '—'}</div>
        {c.phone && <div className="text-xs muted">{c.phone}</div>}
      </td>
      <td className="col-muted">{c.channelLabel ?? '—'}</td>
      <td className="col-num">{c.operationsCount}</td>
      <td className="col-muted">{formatDate(c.lastInteractionAt)}</td>
      <td>
        <Icon name="chevron-right" size={14} color="var(--text-faint)" />
      </td>
    </tr>
  )
}

export { TYPE_LABEL as COUNTERPARTY_TYPE_LABEL }
