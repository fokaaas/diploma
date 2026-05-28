import type { CSSProperties } from 'react'
import { useToast } from '../../context/toast-context'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'

type NodeKind = 'donor' | 'contrib' | 'procurement' | 'supplier' | 'request' | 'unit' | 'movement'

interface GraphNode {
  id: string
  kind: NodeKind
  label: string
  sub: string
  x: number
  y: number
  focused?: boolean
}

const NODES: GraphNode[] = [
  { id: 'cp-201', kind: 'donor', label: 'Олег Шевченко', sub: 'Донор · 245 000 ₴', x: 80, y: 90 },
  { id: 'cp-202', kind: 'donor', label: 'ТОВ «Аква-Сіті»', sub: 'Донор · 500 000 ₴', x: 80, y: 200 },
  { id: 'cp-203', kind: 'donor', label: 'Громада «Львів-Захід»', sub: 'Донор · 168 400 ₴', x: 80, y: 310 },
  { id: 'CN-2026-0512', kind: 'contrib', label: 'CN-2026-0512', sub: 'Внесок · 245 000 ₴', x: 320, y: 90 },
  { id: 'CN-2026-0510', kind: 'contrib', label: 'CN-2026-0510', sub: 'Внесок · 500 000 ₴', x: 320, y: 200 },
  { id: 'CN-2026-0511', kind: 'contrib', label: 'CN-2026-0511', sub: 'Внесок · 168 400 ₴', x: 320, y: 310 },
  { id: 'PR-2026-0301', kind: 'procurement', label: 'PR-2026-0301', sub: 'Закупівля · 592 000 ₴', x: 580, y: 145 },
  { id: 'PR-2026-0300', kind: 'procurement', label: 'PR-2026-0300', sub: 'Закупівля · 174 000 ₴', x: 580, y: 255 },
  { id: 'cp-302', kind: 'supplier', label: 'ТОВ «Дрон-Технолоджис»', sub: 'Постачальник', x: 780, y: 200 },
  { id: 'R-2026-0148', kind: 'request', label: 'R-2026-0148', sub: 'Заявка · 766 000 ₴', x: 1020, y: 200, focused: true },
  { id: 'cp-101', kind: 'unit', label: '93 ОМБр «Холодний Яр»', sub: 'Підрозділ-ініціатор', x: 1260, y: 200 },
  { id: 'M-1024', kind: 'movement', label: 'M-1024', sub: 'Прийом ×40', x: 780, y: 360 },
  { id: 'M-1023', kind: 'movement', label: 'M-1023', sub: 'Видача (план)', x: 1020, y: 360 },
]

const EDGES: [string, string][] = [
  ['cp-201', 'CN-2026-0512'],
  ['cp-202', 'CN-2026-0510'],
  ['cp-203', 'CN-2026-0511'],
  ['CN-2026-0512', 'PR-2026-0301'],
  ['CN-2026-0510', 'PR-2026-0301'],
  ['CN-2026-0511', 'PR-2026-0300'],
  ['PR-2026-0301', 'cp-302'],
  ['PR-2026-0300', 'cp-302'],
  ['PR-2026-0301', 'R-2026-0148'],
  ['PR-2026-0300', 'R-2026-0148'],
  ['R-2026-0148', 'cp-101'],
  ['PR-2026-0301', 'M-1024'],
  ['M-1024', 'M-1023'],
  ['M-1023', 'R-2026-0148'],
]

const KIND: Record<NodeKind, { color: string; bg: string; fg: string; icon: IconName; label: string }> = {
  donor: { color: '#8a7e3a', bg: '#fbe9cf', fg: '#7a5500', icon: 'contributions', label: 'Донор' },
  contrib: { color: '#7a8c5c', bg: '#dde9d0', fg: '#3d5621', icon: 'contributions', label: 'Внесок' },
  procurement: { color: '#c98a2e', bg: '#fff2d6', fg: '#7a5500', icon: 'procurements', label: 'Закупівля' },
  supplier: { color: '#7a5db0', bg: '#e6dff1', fg: '#4c3373', icon: 'truck', label: 'Постачальник' },
  request: { color: '#4a5d3a', bg: '#e3e8d0', fg: '#28301c', icon: 'requests', label: 'Заявка' },
  unit: { color: '#5a7a3a', bg: '#dde9d0', fg: '#3d5621', icon: 'shield', label: 'Підрозділ' },
  movement: { color: '#7a5d4a', bg: '#f1e6dc', fg: '#5a3c28', icon: 'box', label: 'Рух ТМЦ' },
}

const NODE_BY_ID: Record<string, GraphNode> = Object.fromEntries(NODES.map((n) => [n.id, n]))

interface RelationshipGraphProps {
  rootId?: string
  onClose: () => void
}

export function RelationshipGraph({ rootId = 'R-2026-0148', onClose }: RelationshipGraphProps) {
  const { showToast } = useToast()
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal--lg"
        style={{ maxWidth: 1400, height: '92vh', maxHeight: '92vh' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <h3 className="modal__title">
              Граф зв'язків · <span className="mono">{rootId}</span>
            </h3>
            <div className="text-xs muted">
              Аудит-трейл: донор → внесок → закупівля → постачальник → склад → видача → підрозділ
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--sm" onClick={() => showToast('Граф експортовано у PNG')}>
              <Icon name="download" size={14} />
              PNG
            </button>
            <button className="modal__close" onClick={onClose} aria-label="Закрити">
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: 'var(--surface-3)' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
            <svg
              viewBox="0 0 1400 480"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', minHeight: 480 }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#5a5f48" />
                </marker>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e1ddc9" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {EDGES.map(([from, to], i) => {
                const a = NODE_BY_ID[from]
                const b = NODE_BY_ID[to]
                if (!a || !b) return null
                const x1 = a.x + 120
                const y1 = a.y + 24
                const x2 = b.x
                const y2 = b.y + 24
                const midX = (x1 + x2) / 2
                return (
                  <path
                    key={i}
                    d={`M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`}
                    fill="none"
                    stroke="#8a8f72"
                    strokeWidth="1.4"
                    markerEnd="url(#arrowhead)"
                    opacity={0.75}
                  />
                )
              })}
              {NODES.map((n) => {
                const k = KIND[n.kind]
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                    <rect
                      x="0"
                      y="0"
                      width="220"
                      height="56"
                      rx="8"
                      fill={n.focused ? k.color : '#ffffff'}
                      stroke={k.color}
                      strokeWidth={n.focused ? 0 : 1.5}
                    />
                    <text
                      x="14"
                      y="22"
                      fontSize="11"
                      fill={n.focused ? '#fff' : k.fg}
                      fontWeight="600"
                      style={{ textTransform: 'uppercase', letterSpacing: '.05em' }}
                    >
                      {k.label}
                    </text>
                    <text x="14" y="38" fontSize="13" fill={n.focused ? '#fff' : '#1c2014'} fontWeight="600">
                      {n.label}
                    </text>
                    <text x="14" y="52" fontSize="10.5" fill={n.focused ? 'rgba(255,255,255,.85)' : '#5a5f48'}>
                      {n.sub}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div
            style={{
              width: 320,
              borderLeft: '1px solid var(--border)',
              background: 'var(--surface)',
              overflowY: 'auto',
              padding: 18,
            }}
          >
            <h4 style={legendHeading}>Легенда</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(KIND).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: value.bg,
                      border: `1.5px solid ${value.color}`,
                    }}
                  />
                  <span className="text-sm">{value.label}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <h4 style={legendHeading}>Сутність у фокусі</h4>
            <div style={{ background: 'var(--surface-2)', borderRadius: 6, padding: 14, marginBottom: 12 }}>
              <div className="mono" style={{ fontWeight: 600, fontSize: 16 }}>
                R-2026-0148
              </div>
              <div className="text-sm muted mb-2">93 ОМБр «Холодний Яр»</div>
              <span className="badge badge--progress">В роботі</span>
            </div>
            <h4 style={legendHeading}>Зведення</h4>
            <dl className="kv" style={{ gridTemplateColumns: '1fr 1fr', fontSize: 12.5 }}>
              <dt>Сума заявки</dt>
              <dd>766 000 ₴</dd>
              <dt>Покрито внесками</dt>
              <dd>913 400 ₴</dd>
              <dt>Закуплено</dt>
              <dd>766 000 ₴</dd>
              <dt>На складі</dt>
              <dd>40 / 120 шт</dd>
              <dt>Видано</dt>
              <dd>0 / 160 шт</dd>
            </dl>
            <div className="divider" />
            <button className="btn w-full mb-2" onClick={() => showToast('Розгорнуто вгору')}>
              <Icon name="arrow-up" size={14} />
              Розгорнути вгору (донори)
            </button>
            <button className="btn w-full" onClick={() => showToast('Розгорнуто вниз')}>
              <Icon name="arrow-down" size={14} />
              Розгорнути вниз (видача)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const legendHeading: CSSProperties = {
  margin: '0 0 10px',
  fontSize: 14,
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  color: 'var(--text-faint)',
}
