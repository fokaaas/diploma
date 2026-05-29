import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { sessionStore } from '../../lib/auth/session'
import {
  createContribution,
  uploadContributionFile,
  type ContributionInput,
} from '../../lib/api/contributions'
import { PageHeader } from '../../components/layout/PageHeader'
import { ContributionForm } from './ContributionForm'

const routeApi = getRouteApi('/_app/contributions/new')

export function ContributionCreate() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { donors } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''

  const cancel = () => void navigate({ to: '/contributions' })

  const handleSubmit = async (input: ContributionInput, files: File[]) => {
    const created = await createContribution(token, input)
    for (const file of files) {
      await uploadContributionFile(token, created.id, file)
    }
    showToast(`Внесок зареєстровано · ${created.number}`)
    await navigate({
      to: '/contributions/$contributionId',
      params: { contributionId: created.id },
    })
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Внески', onClick: cancel }, { label: 'Реєстрація' }]}
        title="Реєстрація благодійного внеску"
        actions={
          <button className="btn" onClick={cancel}>
            Скасувати
          </button>
        }
      />
      <div style={{ maxWidth: 820 }}>
        <ContributionForm
          mode="create"
          donors={donors}
          submitLabel="Зареєструвати"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
