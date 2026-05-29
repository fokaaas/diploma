import { Icon } from '../../components/ui/Icon'
import { formatMoney } from '../../lib/format'
import { REQUEST_STATUS_BY_KEY } from '../../data/statuses'
import type { RequestDetail } from '../../lib/api/requests'

type NodeKind = 'request' | 'unit' | 'procurement' | 'supplier'

interface GraphNode {
  id: string
  kind: NodeKind
  label: string
  sub: string
  x: number
  y: number
  focused?: boolean
}

const KIND: Record<NodeKind, { color: string; fg: string; label: string }> = {
  request: { color: '#4a5d3a', fg: '#28301c', label: 'Заявка' },
  unit: { color: '#5a7a3a', fg: '#3d5621', label: 'Підрозділ' },
  procurement: { color: '#c98a2e', fg: '#7a5500', label: 'Закупівля' },
  supplier: { color: '#7a5db0', fg: '#4c3373', label: 'Постачальник' },
}

const COL = { supplier: 30, procurement: 320, request: 610, unit: 900 }
const NODE_W = 210
const NODE_H = 56
const ROW_H = 84
const TOP = 40

function buildGraph(detail: RequestDetail): {
  nodes: GraphNode[]
  edges: [string, string][]
  width: number
  height: number
} {
  const nodes: GraphNode[] = []
  const edges: [string, string][] = []
  const procurements = detail.linkedProcurements

  const suppliers = new Map<string, string>()
  procurements.forEach((p) => {
    if (!suppliers.has(p.supplierName)) {
      suppliers.set(p.supplierName, `supplier-${suppliers.size}`)
    }
  })

  const stackH = Math.max(procurements.length, suppliers.size, 1) * ROW_H
  const centerY = TOP + stackH / 2 - NODE_H / 2

  nodes.push({
    id: detail.id,
    kind: 'request',
    label: detail.number,
    sub: `Заявка · ${formatMoney(detail.estimatedValue)}`,
    x: COL.request,
    y: centerY,
    focused: true,
  })
  nodes.push({
    id: detail.unitId,
    kind: 'unit',
    label: detail.unitName,
    sub: 'Підрозділ-ініціатор',
    x: COL.unit,
    y: centerY,
  })
  edges.push([detail.id, detail.unitId])

  Array.from(suppliers, ([name, id], i) => {
    nodes.push({
      id,
      kind: 'supplier',
      label: name,
      sub: 'Постачальник',
      x: COL.supplier,
      y: TOP + i * ROW_H,
    })
  })

  procurements.forEach((p, i) => {
    nodes.push({
      id: p.id,
      kind: 'procurement',
      label: p.number,
      sub: `Закупівля · ${formatMoney(p.amount)}`,
      x: COL.procurement,
      y: TOP + i * ROW_H,
    })
    edges.push([p.id, detail.id])
    const supplierId = suppliers.get(p.supplierName)
    if (supplierId) edges.push([supplierId, p.id])
  })

  const maxY = nodes.reduce((m, n) => Math.max(m, n.y), 0)
  return {
    nodes,
    edges,
    width: COL.unit + NODE_W + 30,
    height: Math.max(maxY + NODE_H + TOP, centerY + NODE_H + TOP),
  }
}

interface RelationshipGraphProps {
  detail: RequestDetail
  onClose: () => void
}

export function RelationshipGraph({ detail, onClose }: RelationshipGraphProps) {
  const { nodes, edges, width, height } = buildGraph(detail)
  const nodeById = new Map(nodes.map((n) => [n.id, n]))
  const procurementTotal = detail.linkedProcurements.reduce(
    (sum, p) => sum + p.amount,
    0,
  )
  const legendKinds = Array.from(new Set(nodes.map((n) => n.kind)))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal--lg"
        style={{ maxWidth: 1280, height: '88vh', maxHeight: '88vh' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <h3 className="modal__title">
              Граф зв'язків · <span className="mono">{detail.number}</span>
            </h3>
            <div className="text-xs muted">
              Заявка ↔ підрозділ та пов'язані закупівлі/постачальники
            </div>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Закрити">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: 'var(--surface-3)' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
            <svg
              viewBox={`0 0 ${width} ${Math.max(height, 200)}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', minHeight: 320 }}
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
              {edges.map(([from, to], i) => {
                const a = nodeById.get(from)
                const b = nodeById.get(to)
                if (!a || !b) return null
                const x1 = a.x + NODE_W
                const y1 = a.y + NODE_H / 2
                const x2 = b.x
                const y2 = b.y + NODE_H / 2
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
              {nodes.map((n) => {
                const k = KIND[n.kind]
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                    <rect
                      width={NODE_W}
                      height={NODE_H}
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
                    <text x="14" y="40" fontSize="12.5" fill={n.focused ? '#fff' : '#1c2014'} fontWeight="600">
                      {n.label.length > 26 ? `${n.label.slice(0, 25)}…` : n.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div
            style={{
              width: 300,
              borderLeft: '1px solid var(--border)',
              background: 'var(--surface)',
              overflowY: 'auto',
              padding: 18,
            }}
          >
            <h4 style={legendHeading}>Легенда</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {legendKinds.map((kind) => (
                <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      border: `1.5px solid ${KIND[kind].color}`,
                    }}
                  />
                  <span className="text-sm">{KIND[kind].label}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <h4 style={legendHeading}>Зведення</h4>
            <dl className="kv" style={{ gridTemplateColumns: '1fr auto', fontSize: 12.5 }}>
              <dt>Сума заявки</dt>
              <dd>{formatMoney(detail.estimatedValue)}</dd>
              <dt>Закупівель</dt>
              <dd>{detail.linkedProcurements.length}</dd>
              <dt>Сума закупівель</dt>
              <dd>{formatMoney(procurementTotal)}</dd>
              <dt>Статус</dt>
              <dd>{REQUEST_STATUS_BY_KEY[detail.status].label}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

const legendHeading = {
  margin: '0 0 10px',
  fontSize: 14,
  textTransform: 'uppercase' as const,
  letterSpacing: '.06em',
  color: 'var(--text-faint)',
}
