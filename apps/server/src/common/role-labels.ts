import { Role } from '../generated/prisma/enums';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Адміністратор фонду',
  COORDINATOR: 'Координатор',
  ACCOUNTANT: 'Бухгалтер',
  AUDITOR: 'Аудитор',
};
