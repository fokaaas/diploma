import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { sessionStore } from '../../lib/auth/session'
import {
  updateContribution,
  type ContributionInput,
} from '../../lib/api/contributions'
import { PageHeader } from '../../components/layout/PageHeader'
import { ContributionForm } from './ContributionForm'

const routeApi = getRouteApi('/_app/contributions/$contributionId/edit')

export function ContributionEdit() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { detail, donors } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''

  const back = () =>
    void navigate({
      to: '/contributions/$contributionId',
      params: { contributionId: detail.id },
    })

  const handleSubmit = async (input: ContributionInput) => {
    await updateContribution(token, detail.id, {
      form: input.form,
      amount: input.amount,
      currency: input.currency,
      purpose: input.purpose,
      baseDocumentLabel: input.baseDocumentLabel,
      occurredAt: input.occurredAt,
      itemName: input.itemName,
      itemQuantity: input.itemQuantity,
    })
    showToast('Внесок оновлено')
    back()
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Внески', onClick: () => void navigate({ to: '/contributions' }) },
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
      <div style={{ maxWidth: 820 }}>
        <ContributionForm
          mode="edit"
          initial={detail}
          donors={donors}
          submitLabel="Зберегти зміни"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
