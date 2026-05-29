import { apiFetch } from './client'

export type MovementType = 'in' | 'out'

interface StockLevelResponse {
  itemId: string
  sku: string
  name: string
  categoryName: string
  unit: string
  warehouseId: string
  warehouseName: string
  quantity: number
  minStock: number
  lastPrice: number | null
}

interface MovementResponse {
  id: string
  number: string
  type: 'IN' | 'OUT'
  itemName: string
  quantity: number
  occurredAt: string
  warehouseName: string
  performedByName: string
  sourceNumber: string | null
}

export interface StockLevelItem {
  itemId: string
  sku: string
  name: string
  categoryName: string
  unit: string
  warehouseId: string
  warehouseName: string
  quantity: number
  minStock: number
  lastPrice: number | null
}

export interface StockMovement {
  id: string
  number: string
  type: MovementType
  itemName: string
  quantity: number
  occurredAt: string
  warehouseName: string
  performedByName: string
  sourceNumber: string | null
}

export interface ManualReceiptInput {
  itemId: string
  warehouseName: string
  quantity: number
  note?: string
}

export interface IssuanceInput {
  requestId: string
  recipientName: string
  deliveryMethod?: string
  warehouseName: string
  lines: { itemId: string; quantity: number }[]
}

export function listStockLevels(token: string): Promise<StockLevelItem[]> {
  return apiFetch<StockLevelResponse[]>('/stock/levels', { token })
}

export function listMovements(token: string): Promise<StockMovement[]> {
  return apiFetch<MovementResponse[]>('/stock/movements', { token }).then((rows) =>
    rows.map((m) => ({ ...m, type: m.type === 'IN' ? 'in' : 'out' })),
  )
}

export function createManualReceipt(
  token: string,
  input: ManualReceiptInput,
): Promise<void> {
  return apiFetch('/stock/receipts', {
    method: 'POST',
    body: input,
    token,
  }).then(() => undefined)
}

export function createIssuance(
  token: string,
  input: IssuanceInput,
): Promise<void> {
  return apiFetch('/issuances', { method: 'POST', body: input, token }).then(
    () => undefined,
  )
}
