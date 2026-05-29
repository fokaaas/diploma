import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { sessionStore } from '../../lib/auth/session'
import {
  updateProcurement,
  type ProcurementInput,
} from '../../lib/api/procurements'
import { PageHeader } from '../../components/layout/PageHeader'
import { ProcurementForm } from './ProcurementForm'

const routeApi = getRouteApi('/_app/procurements/$procurementId/edit')

export function ProcurementEdit() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { detail, suppliers, requests, contributions } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''

  const back = () =>
    void navigate({
      to: '/procurements/$procurementId',
      params: { procurementId: detail.id },
    })

  const handleSubmit = async (input: ProcurementInput) => {
    await updateProcurement(token, detail.id, {
      requestId: input.requestId,
      orderedAt: input.orderedAt,
      lines: input.lines,
      funding: input.funding,
    })
    showToast('Закупівлю оновлено')
    back()
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Закупівлі', onClick: () => void navigate({ to: '/procurements' }) },
          { label: detail.number, onClick: back },
          { label: 'Редагування' },
        ]}
        title={`Редагування ${detail.number}`}
        actions={
          <button className="btn" onClick={back}>
            Скасувати
          </button>
        }
      />
      <div style={{ maxWidth: 960 }}>
        <ProcurementForm
          mode="edit"
          initial={detail}
          suppliers={suppliers}
          requests={requests}
          contributions={contributions}
          submitLabel="Зберегти зміни"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
