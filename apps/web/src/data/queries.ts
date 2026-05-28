// Тонкий шар доступу до даних. Зараз він читає мокові масиви, але екрани
// викликають лише ці селектори — тож після інтеграції бекенда достатньо
// замінити реалізацію тут, не чіпаючи UI.

import type {
  Contribution,
  Counterparty,
  Item,
  Procurement,
  RequestRecord,
} from '../types/domain'
import { COUNTERPARTIES } from './counterparties'
import { ITEMS } from './items'
import { REQUESTS } from './requests'
import { CONTRIBUTIONS } from './contributions'
import { PROCUREMENTS } from './procurements'

const cpById: Record<string, Counterparty> = Object.fromEntries(
  COUNTERPARTIES.map((c) => [c.id, c]),
)
const itemBySku: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.sku, i]))

export function getCounterparty(id: string): Counterparty | undefined {
  return cpById[id]
}

export function getItemBySku(sku: string): Item | undefined {
  return itemBySku[sku]
}

export function getRequest(id: string): RequestRecord | undefined {
  return REQUESTS.find((r) => r.id === id)
}

export function getContribution(id: string): Contribution | undefined {
  return CONTRIBUTIONS.find((c) => c.id === id)
}

export function getProcurement(id: string): Procurement | undefined {
  return PROCUREMENTS.find((p) => p.id === id)
}

export function listRequestsByUnit(unitId: string): RequestRecord[] {
  return REQUESTS.filter((r) => r.unit === unitId)
}

export function listContributionsByDonor(donorId: string): Contribution[] {
  return CONTRIBUTIONS.filter((c) => c.donor === donorId)
}

export function listProcurementsBySupplier(supplierId: string): Procurement[] {
  return PROCUREMENTS.filter((p) => p.supplier === supplierId)
}

export function listProcurementsForRequest(requestId: string): Procurement[] {
  return PROCUREMENTS.filter((p) => p.request === requestId)
}

export function listProcurementsForContribution(contributionId: string): Procurement[] {
  return PROCUREMENTS.filter((p) => p.funding.includes(contributionId))
}
