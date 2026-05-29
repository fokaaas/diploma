import { createFileRoute } from '@tanstack/react-router'
import { ProcurementsList } from '../../../features/procurements/ProcurementsList'
import { sessionStore } from '../../../lib/auth/session'
import {
  listProcurements,
  type ProcurementListItem,
} from '../../../lib/api/procurements'

export interface ProcurementsData {
  procurements: ProcurementListItem[]
}

export const Route = createFileRoute('/_app/procurements/')({
  loader: async (): Promise<ProcurementsData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { procurements: [] }
    return { procurements: await listProcurements(token) }
  },
  component: ProcurementsList,
})
