import { createFileRoute } from '@tanstack/react-router'
import { RequestsList } from '../../../features/requests/RequestsList'

export const Route = createFileRoute('/_app/requests/')({
  component: RequestsList,
})
