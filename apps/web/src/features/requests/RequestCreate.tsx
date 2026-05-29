import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { sessionStore } from '../../lib/auth/session'
import {
  createRequest,
  uploadRequestFile,
  type RequestInput,
} from '../../lib/api/requests'
import { PageHeader } from '../../components/layout/PageHeader'
import { RequestForm } from './RequestForm'

const routeApi = getRouteApi('/_app/requests/new')

export function RequestCreate() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { units, members } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''

  const cancel = () => void navigate({ to: '/requests' })

  const handleSubmit = async (input: RequestInput, files: File[]) => {
    const created = await createRequest(token, input)
    for (const file of files) {
      await uploadRequestFile(token, created.id, file)
    }
    showToast(`Заявку зареєстровано · ${created.number}`)
    await navigate({
      to: '/requests/$requestId',
      params: { requestId: created.id },
    })
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Заявки', onClick: cancel }, { label: 'Нова заявка' }]}
        title="Створення нової заявки"
        subtitle="Реєстрація потреби від військового підрозділу"
        actions={
          <button className="btn" onClick={cancel}>
            Скасувати
          </button>
        }
      />
      <div style={{ maxWidth: 920 }}>
        <RequestForm
          mode="create"
          units={units}
          members={members}
          submitLabel="Зареєструвати"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
