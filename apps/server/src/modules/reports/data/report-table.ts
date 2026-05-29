export type ReportType =
  | 'EXPENSES'
  | 'CONTRIBUTIONS'
  | 'REQUESTS'
  | 'MOVEMENTS'
  | 'BALANCE';

export type Dimension =
  | 'UNIT'
  | 'DONOR'
  | 'CATEGORY'
  | 'SUPPLIER'
  | 'COORDINATOR';

export interface ReportTable {
  columns: string[];
  rows: (string | number)[][];
}

export const DIMENSION_ORDER: Dimension[] = [
  'UNIT',
  'DONOR',
  'CATEGORY',
  'SUPPLIER',
  'COORDINATOR',
];

export const DIMENSION_LABEL: Record<Dimension, string> = {
  UNIT: 'Підрозділ',
  DONOR: 'Донор',
  CATEGORY: 'Категорія',
  SUPPLIER: 'Постачальник',
  COORDINATOR: 'Координатор',
};

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  EXPENSES: 'Витрати за період',
  CONTRIBUTIONS: 'Надходження за донорами',
  REQUESTS: 'Виконання заявок за підрозділами',
  MOVEMENTS: 'Рух матеріальних цінностей',
  BALANCE: 'Зведений баланс',
};
