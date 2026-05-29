import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { sessionStore } from '../../lib/auth/session'
import { updateRequest, type RequestInput } from '../../lib/api/requests'
import { PageHeader } from '../../components/layout/PageHeader'
import { RequestForm } from './RequestForm'

const routeApi = getRouteApi('/_app/requests/$requestId/edit')

export function RequestEdit() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { detail, units, members } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''

  const back = () =>
    void navigate({
      to: '/requests/$requestId',
      params: { requestId: detail.id },
    })

  const handleSubmit = async (input: RequestInput) => {
    await updateRequest(token, detail.id, {
      unitContactName: input.unitContactName,
      priority: input.priority,
      deadline: input.deadline,
      channel: input.channel,
      assigneeId: input.assigneeId,
      lines: input.lines,
    })
    showToast('Заявку оновлено')
    back()
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Заявки', onClick: () => void navigate({ to: '/requests' }) },
          { label: detail.number, onClick: back },
          { label: 'Редагування' },
        ]}
        title={`Редагування ${detail.number}`}
        subtitle="Зміна основних даних та позицій заявки"
        actions={
          <button className="btn" onClick={back}>
            Скасувати
          </button>
        }
      />
      <div style={{ maxWidth: 920 }}>
        <RequestForm
          mode="edit"
          initial={detail}
          units={units}
          members={members}
          submitLabel="Зберегти зміни"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
