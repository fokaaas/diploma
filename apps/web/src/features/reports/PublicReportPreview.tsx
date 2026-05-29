import { Modal } from '../../components/ui/Modal'
import { formatNumber } from '../../lib/format'
import type { PublicReport } from '../../lib/api/reports'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat" style={{ padding: 14 }}>
      <div className="stat__label">{label}</div>
      <div className="stat__value" style={{ fontSize: 22 }}>
        {value}
      </div>
    </div>
  )
}

export function PublicReportPreview({
  report,
  onClose,
}: {
  report: PublicReport
  onClose: () => void
}) {
  const s = report.snapshot
  const hasFunds = s.collectedFunds != null || s.spent != null

  return (
    <Modal
      title="Попередній перегляд публічного звіту"
      onClose={onClose}
      size="lg"
      footer={
        <button className="btn" onClick={onClose}>
          Закрити
        </button>
      }
    >
      <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 24 }}>
        <div className="muted text-sm">{report.foundationName}</div>
        <h2 style={{ margin: '6px 0 18px', fontSize: 24, letterSpacing: '-.02em' }}>
          Публічний звіт
        </h2>

        {hasFunds && (
          <div className="grid-3 mb-4">
            {s.collectedFunds != null && (
              <Stat label="Зібрано" value={`${formatNumber(s.collectedFunds)} ₴`} />
            )}
            {s.spent != null && <Stat label="Витрачено" value={`${formatNumber(s.spent)} ₴`} />}
            {s.balance != null && (
              <Stat label="Залишок" value={`${formatNumber(s.balance)} ₴`} />
            )}
          </div>
        )}

        {s.expenseStructure && s.expenseStructure.length > 0 && (
          <div className="mb-4">
            <div className="section-title">Структура витрат</div>
            {s.expenseStructure.map((row) => (
              <div
                key={row.name}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}
              >
                <span className="text-sm">
                  {row.name} · {row.pct}%
                </span>
                <span className="tabular text-sm">{formatNumber(row.value)} ₴</span>
              </div>
            ))}
          </div>
        )}

        <div className="muted text-sm">
          {s.closedNeeds && <>Закритих потреб: {s.closedNeeds.length}. </>}
          {s.donors && <>Донорів: {s.donors.length}.</>}
        </div>
      </div>
    </Modal>
  )
}
