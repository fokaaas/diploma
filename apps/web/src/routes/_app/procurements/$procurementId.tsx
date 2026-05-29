import { createFileRoute } from '@tanstack/react-router'
import { ProcurementCard } from '../../../features/procurements/ProcurementCard'
import { sessionStore } from '../../../lib/auth/session'
import {
  getProcurement,
  type ProcurementDetail,
} from '../../../lib/api/procurements'
import { listWarehouses, type Warehouse } from '../../../lib/api/warehouses'

export interface ProcurementDetailData {
  detail: ProcurementDetail
  warehouses: Warehouse[]
}

export const Route = createFileRoute('/_app/procurements/$procurementId')({
  loader: async ({ params }): Promise<ProcurementDetailData> => {
    const token = sessionStore.getAccessToken() ?? ''
    const [detail, warehouses] = await Promise.all([
      getProcurement(token, params.procurementId),
      listWarehouses(token),
    ])
    return { detail, warehouses }
  },
  component: ProcurementCardRoute,
})

function ProcurementCardRoute() {
  const { detail, warehouses } = Route.useLoaderData()
  return <ProcurementCard detail={detail} warehouses={warehouses} />
}
