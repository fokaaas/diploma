import { createFileRoute } from '@tanstack/react-router'
import { WarehouseScreen } from '../../../features/warehouse/WarehouseScreen'
import { sessionStore } from '../../../lib/auth/session'
import {
  listMovements,
  listStockLevels,
  type StockLevelItem,
  type StockMovement,
} from '../../../lib/api/stock'
import { listWarehouses, type Warehouse } from '../../../lib/api/warehouses'
import { listRequests, type RequestListItem } from '../../../lib/api/requests'
import { listItems, type Item } from '../../../lib/api/dictionaries'

interface WarehouseSearch {
  issue?: boolean
}

export interface WarehouseData {
  levels: StockLevelItem[]
  movements: StockMovement[]
  warehouses: Warehouse[]
  requests: RequestListItem[]
  items: Item[]
}

const OPEN_REQUESTS = new Set(['new', 'confirmed', 'progress', 'partial'])

export const Route = createFileRoute('/_app/warehouse/')({
  validateSearch: (search: Record<string, unknown>): WarehouseSearch => ({
    issue: search.issue === true || search.issue === 'true',
  }),
  loader: async (): Promise<WarehouseData> => {
    const token = sessionStore.getAccessToken()
    if (!token) {
      return { levels: [], movements: [], warehouses: [], requests: [], items: [] }
    }
    const [levels, movements, warehouses, requests, items] = await Promise.all([
      listStockLevels(token),
      listMovements(token),
      listWarehouses(token),
      listRequests(token),
      listItems(token),
    ])
    return {
      levels,
      movements,
      warehouses,
      requests: requests.filter((r) => OPEN_REQUESTS.has(r.status)),
      items,
    }
  },
  component: WarehouseRoute,
})

function WarehouseRoute() {
  const { issue } = Route.useSearch()
  return <WarehouseScreen autoOpenIssue={issue} />
}
