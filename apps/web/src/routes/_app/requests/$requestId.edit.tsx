import { createFileRoute } from '@tanstack/react-router'
import { RequestEdit } from '../../../features/requests/RequestEdit'
import { sessionStore } from '../../../lib/auth/session'
import { getRequest, type RequestDetail } from '../../../lib/api/requests'
import { listCounterparties } from '../../../lib/api/counterparties'
import { listMembers, type Member } from '../../../lib/api/users'
import type { UnitOption } from '../../../features/requests/RequestForm'

export interface RequestEditData {
  detail: RequestDetail
  units: UnitOption[]
  members: Member[]
}

export const Route = createFileRoute('/_app/requests/$requestId/edit')({
  loader: async ({ params }): Promise<RequestEditData> => {
    const session = sessionStore.getSnapshot()
    const token = session?.accessToken ?? ''
    const canManage =
      session?.user.role === 'admin' || session?.user.role === 'coordinator'
    const [detail, counterparties, members] = await Promise.all([
      getRequest(token, params.requestId),
      listCounterparties(token),
      canManage ? listMembers(token) : Promise.resolve([]),
    ])
    return {
      detail,
      units: counterparties
        .filter((c) => c.type === 'unit')
        .map((c) => ({ id: c.id, name: c.name })),
      members,
    }
  },
  component: RequestEdit,
})
