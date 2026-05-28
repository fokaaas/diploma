import type { Role, User } from '../types/domain'

export const CURRENT_USER: User = {
  id: 'u-001',
  name: 'Анастасія Левченко',
  initials: 'АЛ',
  email: 'a.levchenko@sternenko.fund',
  role: 'admin',
  status: 'active',
  lastSeen: 'щойно',
}

export const USERS: User[] = [
  { id: 'u-001', name: 'Анастасія Левченко', initials: 'АЛ', email: 'a.levchenko@sternenko.fund', role: 'admin', status: 'active', lastSeen: 'щойно' },
  { id: 'u-002', name: 'Дмитро Кравчук', initials: 'ДК', email: 'd.kravchuk@sternenko.fund', role: 'coordinator', status: 'active', lastSeen: '12 хв тому' },
  { id: 'u-003', name: 'Олена Гриценко', initials: 'ОГ', email: 'o.hrytsenko@sternenko.fund', role: 'coordinator', status: 'active', lastSeen: '2 год тому' },
  { id: 'u-004', name: 'Марія Бондарчук', initials: 'МБ', email: 'm.bondarchuk@sternenko.fund', role: 'accountant', status: 'active', lastSeen: 'вчора' },
  { id: 'u-005', name: 'Тарас Поліщук', initials: 'ТП', email: 't.polishchuk@sternenko.fund', role: 'auditor', status: 'active', lastSeen: '4 дні тому' },
  { id: 'u-006', name: 'Іван Дорошенко', initials: 'ІД', email: 'i.doroshenko@sternenko.fund', role: 'coordinator', status: 'invited', lastSeen: '—' },
  { id: 'u-007', name: 'Софія Малиш', initials: 'СМ', email: 's.malysh@sternenko.fund', role: 'accountant', status: 'blocked', lastSeen: '21 квіт. 2026' },
]

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Адміністратор фонду',
  coordinator: 'Координатор',
  accountant: 'Бухгалтер',
  auditor: 'Аудитор',
}
