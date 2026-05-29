import { createFileRoute } from '@tanstack/react-router'
import { ProcurementEdit } from '../../../features/procurements/ProcurementEdit'
import { sessionStore } from '../../../lib/auth/session'
import {
  getProcurement,
  type ProcurementDetail,
} from '../../../lib/api/procurements'
import { loadFormData, type ProcurementFormData } from './new'

interface ProcurementEditData extends ProcurementFormData {
  detail: ProcurementDetail
}

export const Route = createFileRoute('/_app/procurements/$procurementId/edit')({
  loader: async ({ params }): Promise<ProcurementEditData> => {
    const token = sessionStore.getAccessToken() ?? ''
    const [detail, formData] = await Promise.all([
      getProcurement(token, params.procurementId),
      loadFormData(token),
    ])
    return { detail, ...formData }
  },
  component: ProcurementEdit,
})
