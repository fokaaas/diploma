import { createFileRoute } from '@tanstack/react-router'
import { CounterpartiesList } from '../../../features/counterparties/CounterpartiesList'

export const Route = createFileRoute('/_app/counterparties/')({
  component: CounterpartiesList,
})
