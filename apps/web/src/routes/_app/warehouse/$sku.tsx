import { createFileRoute } from '@tanstack/react-router'
import { ItemCard } from '../../../features/warehouse/ItemCard'

export const Route = createFileRoute('/_app/warehouse/$sku')({
  component: ItemCardRoute,
})

function ItemCardRoute() {
  const { sku } = Route.useParams()
  return <ItemCard sku={sku} />
}
