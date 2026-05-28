import type { Contribution } from '../types/domain'

export const CONTRIBUTIONS: Contribution[] = [
  { id: 'CN-2026-0512', date: '25 трав. 2026', donor: 'cp-201', form: 'monetary', amount: 245000, purpose: 'FPV-дрони для 93 ОМБр', doc: 'Платіжне доручення №412', linkedProc: 1 },
  { id: 'CN-2026-0511', date: '24 трав. 2026', donor: 'cp-203', form: 'monetary', amount: 168400, purpose: 'Загальний фонд', doc: 'Платіжне доручення №411', linkedProc: 2 },
  { id: 'CN-2026-0510', date: '23 трав. 2026', donor: 'cp-202', form: 'monetary', amount: 500000, purpose: 'РЕБ-обладнання', doc: 'Платіжне доручення №410', linkedProc: 1 },
  { id: 'CN-2026-0509', date: '22 трав. 2026', donor: 'cp-201', form: 'in-kind', amount: 38500, purpose: 'Тактичні аптечки ×20', doc: 'Акт прийому №87', itemName: 'Аптечка IFAK', itemQty: 20, linkedProc: 0 },
  { id: 'CN-2026-0508', date: '21 трав. 2026', donor: 'cp-201', form: 'monetary', amount: 12000, purpose: 'Регулярний внесок', doc: 'Платіжне доручення №409', linkedProc: 1 },
  { id: 'CN-2026-0507', date: '20 трав. 2026', donor: 'cp-203', form: 'monetary', amount: 89200, purpose: 'Зимовий комплект', doc: 'Платіжне доручення №408', linkedProc: 1 },
  { id: 'CN-2026-0506', date: '19 трав. 2026', donor: 'cp-202', form: 'monetary', amount: 1200000, purpose: 'Транспорт (пікап)', doc: 'Платіжне доручення №407', linkedProc: 1 },
  { id: 'CN-2026-0505', date: '17 трав. 2026', donor: 'cp-201', form: 'monetary', amount: 50000, purpose: 'Загальний фонд', doc: 'Платіжне доручення №406', linkedProc: 0 },
]
