import { createFileRoute } from '@tanstack/react-router'
import { WarehouseScreen } from '../../../features/warehouse/WarehouseScreen'

interface WarehouseSearch {
  issue?: boolean
}

export const Route = createFileRoute('/_app/warehouse/')({
  validateSearch: (search: Record<string, unknown>): WarehouseSearch => ({
    issue: search.issue === true || search.issue === 'true',
  }),
  component: WarehouseRoute,
})

function WarehouseRoute() {
  const { issue } = Route.useSearch()
  return <WarehouseScreen autoOpenIssue={issue} />
}
