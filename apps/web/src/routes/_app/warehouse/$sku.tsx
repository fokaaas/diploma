import { createFileRoute } from '@tanstack/react-router'
import { ItemCard } from '../../../features/warehouse/ItemCard'
import { sessionStore } from '../../../lib/auth/session'
import {
  listMovements,
  listStockLevels,
  type StockLevelItem,
  type StockMovement,
} from '../../../lib/api/stock'

export interface ItemStockData {
  levels: StockLevelItem[]
  movements: StockMovement[]
}

export const Route = createFileRoute('/_app/warehouse/$sku')({
  loader: async (): Promise<ItemStockData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { levels: [], movements: [] }
    const [levels, movements] = await Promise.all([
      listStockLevels(token),
      listMovements(token),
    ])
    return { levels, movements }
  },
  component: ItemCardRoute,
})

function ItemCardRoute() {
  const { sku } = Route.useParams()
  const { levels, movements } = Route.useLoaderData()
  return <ItemCard sku={sku} levels={levels} movements={movements} />
}
