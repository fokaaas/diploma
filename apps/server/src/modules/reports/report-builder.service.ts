import { Injectable } from '@nestjs/common';
import { ReportQueryRepository } from '../../infrastructure/database/repos/report-query.repo';
import {
  DIMENSION_LABEL,
  DIMENSION_ORDER,
  type Dimension,
  type ReportTable,
  type ReportType,
} from './data/report-table';

type ExpenseRow = Awaited<
  ReturnType<ReportQueryRepository['expenseLines']>
>[number];
type RequestRow = Awaited<
  ReturnType<ReportQueryRepository['requests']>
>[number];
type MovementRow = Awaited<
  ReturnType<ReportQueryRepository['movements']>
>[number];

const APPLICABLE: Record<ReportType, Dimension[]> = {
  EXPENSES: ['UNIT', 'CATEGORY', 'SUPPLIER', 'COORDINATOR'],
  CONTRIBUTIONS: ['DONOR'],
  REQUESTS: ['UNIT', 'COORDINATOR'],
  MOVEMENTS: ['CATEGORY'],
  BALANCE: [],
};

const FULFILLED = new Set(['FULFILLED', 'CLOSED', 'PARTIALLY_FULFILLED']);

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function selectedDimensions(
  type: ReportType,
  requested: Dimension[],
): Dimension[] {
  const applicable = new Set(APPLICABLE[type]);
  return DIMENSION_ORDER.filter(
    (d) => applicable.has(d) && requested.includes(d),
  );
}

function groupSum<T>(
  rows: T[],
  dims: Dimension[],
  keyOf: (row: T, dim: Dimension) => string,
  measure: (row: T) => number,
  measureLabel: string,
): ReportTable {
  if (dims.length === 0) {
    const total = rows.reduce((sum, row) => sum + measure(row), 0);
    return {
      columns: ['Показник', measureLabel],
      rows: [['Усього за період', round(total)]],
    };
  }
  const map = new Map<string, { keys: string[]; total: number }>();
  for (const row of rows) {
    const keys = dims.map((dim) => keyOf(row, dim));
    const key = keys.join('||');
    const entry = map.get(key) ?? { keys, total: 0 };
    entry.total += measure(row);
    map.set(key, entry);
  }
  const sorted = Array.from(map.values()).sort((a, b) => b.total - a.total);
  return {
    columns: [...dims.map((d) => DIMENSION_LABEL[d]), measureLabel],
    rows: sorted.map((entry) => [...entry.keys, round(entry.total)]),
  };
}

@Injectable()
export class ReportBuilderService {
  constructor(private readonly query: ReportQueryRepository) {}

  async build(
    foundationId: string,
    type: ReportType,
    start: Date,
    end: Date,
    dimensions: Dimension[],
  ): Promise<ReportTable> {
    const dims = selectedDimensions(type, dimensions);
    switch (type) {
      case 'EXPENSES':
        return this.expenses(foundationId, start, end, dims);
      case 'CONTRIBUTIONS':
        return this.contributions(foundationId, start, end, dims);
      case 'REQUESTS':
        return this.requests(foundationId, start, end, dims);
      case 'MOVEMENTS':
        return this.movements(foundationId, start, end, dims);
      case 'BALANCE':
        return this.balance(foundationId, start, end);
    }
  }

  private async expenses(
    foundationId: string,
    start: Date,
    end: Date,
    dims: Dimension[],
  ) {
    const rows = await this.query.expenseLines(foundationId, start, end);
    const keyOf = (row: ExpenseRow, dim: Dimension): string => {
      if (dim === 'UNIT') return row.procurement.request?.unit.name ?? '—';
      if (dim === 'CATEGORY') return row.item?.category.name ?? 'Без категорії';
      if (dim === 'SUPPLIER') return row.procurement.supplier.name;
      return row.procurement.createdBy.fullName;
    };
    return groupSum(rows, dims, keyOf, (r) => Number(r.lineTotal), 'Сума, ₴');
  }

  private async contributions(
    foundationId: string,
    start: Date,
    end: Date,
    dims: Dimension[],
  ) {
    const rows = await this.query.contributions(foundationId, start, end);
    return groupSum(
      rows,
      dims,
      (r) => r.donor.name,
      (r) => Number(r.amount),
      'Сума, ₴',
    );
  }

  private async requests(
    foundationId: string,
    start: Date,
    end: Date,
    dims: Dimension[],
  ) {
    const rows = await this.query.requests(foundationId, start, end);
    const keyOf = (row: RequestRow, dim: Dimension): string =>
      dim === 'UNIT' ? row.unit.name : row.registeredBy.fullName;
    if (dims.length === 0) {
      const fulfilled = rows.filter((r) => FULFILLED.has(r.status)).length;
      return {
        columns: ['Показник', 'Заявок', 'Виконано'],
        rows: [['Усього за період', rows.length, fulfilled]],
      };
    }
    const map = new Map<
      string,
      { keys: string[]; total: number; done: number }
    >();
    for (const row of rows) {
      const keys = dims.map((dim) => keyOf(row, dim));
      const key = keys.join('||');
      const entry = map.get(key) ?? { keys, total: 0, done: 0 };
      entry.total += 1;
      if (FULFILLED.has(row.status)) entry.done += 1;
      map.set(key, entry);
    }
    const sorted = Array.from(map.values()).sort((a, b) => b.total - a.total);
    return {
      columns: [...dims.map((d) => DIMENSION_LABEL[d]), 'Заявок', 'Виконано'],
      rows: sorted.map((e) => [...e.keys, e.total, e.done]),
    };
  }

  private async movements(
    foundationId: string,
    start: Date,
    end: Date,
    dims: Dimension[],
  ) {
    const rows = await this.query.movements(foundationId, start, end);
    const categoryOf = (row: MovementRow): string => row.item.category.name;
    if (dims.length === 0) {
      const incoming = rows
        .filter((r) => r.type === 'IN')
        .reduce((s, r) => s + r.quantity, 0);
      const outgoing = rows
        .filter((r) => r.type === 'OUT')
        .reduce((s, r) => s + r.quantity, 0);
      return {
        columns: ['Показник', 'Прийнято', 'Видано'],
        rows: [['Усього за період', incoming, outgoing]],
      };
    }
    const map = new Map<
      string,
      { name: string; incoming: number; outgoing: number }
    >();
    for (const row of rows) {
      const name = categoryOf(row);
      const entry = map.get(name) ?? { name, incoming: 0, outgoing: 0 };
      if (row.type === 'IN') entry.incoming += row.quantity;
      else entry.outgoing += row.quantity;
      map.set(name, entry);
    }
    return {
      columns: ['Категорія', 'Прийнято', 'Видано'],
      rows: Array.from(map.values()).map((e) => [
        e.name,
        e.incoming,
        e.outgoing,
      ]),
    };
  }

  private async balance(
    foundationId: string,
    start: Date,
    end: Date,
  ): Promise<ReportTable> {
    const [contributions, procurements, requests] = await Promise.all([
      this.query.contributions(foundationId, start, end),
      this.query.procurements(foundationId, start, end),
      this.query.requests(foundationId, start, end),
    ]);
    const collected = contributions.reduce((s, c) => s + Number(c.amount), 0);
    const spent = procurements.reduce((s, p) => s + Number(p.totalAmount), 0);
    const fulfilled = requests.filter((r) => FULFILLED.has(r.status)).length;
    return {
      columns: ['Показник', 'Значення'],
      rows: [
        ['Зібрано коштів, ₴', round(collected)],
        ['Витрачено, ₴', round(spent)],
        ['Залишок, ₴', round(collected - spent)],
        ['Заявок', requests.length],
        ['Виконано заявок', fulfilled],
        ['Закупівель', procurements.length],
      ],
    };
  }
}
