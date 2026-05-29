import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { sessionStore } from '../../lib/auth/session'
import {
  createProcurement,
  uploadProcurementFile,
  type ProcurementInput,
} from '../../lib/api/procurements'
import { PageHeader } from '../../components/layout/PageHeader'
import { ProcurementForm } from './ProcurementForm'

const routeApi = getRouteApi('/_app/procurements/new')

export function ProcurementCreate() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { suppliers, requests, contributions } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''

  const cancel = () => void navigate({ to: '/procurements' })

  const handleSubmit = async (input: ProcurementInput, files: File[]) => {
    const created = await createProcurement(token, input)
    for (const file of files) {
      await uploadProcurementFile(token, created.id, file)
    }
    showToast(`Закупівлю створено · ${created.number}`)
    await navigate({
      to: '/procurements/$procurementId',
      params: { procurementId: created.id },
    })
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Закупівлі', onClick: cancel }, { label: 'Нова закупівля' }]}
        title="Створення закупівлі"
        actions={
          <button className="btn" onClick={cancel}>
            Скасувати
          </button>
        }
      />
      <div style={{ maxWidth: 960 }}>
        <ProcurementForm
          mode="create"
          suppliers={suppliers}
          requests={requests}
          contributions={contributions}
          submitLabel="Створити"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
