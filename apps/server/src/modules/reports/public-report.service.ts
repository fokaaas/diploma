import { Injectable } from '@nestjs/common';
import { ReportQueryRepository } from '../../infrastructure/database/repos/report-query.repo';
import type { PublicSection, PublicSnapshot } from './data/public-snapshot';

const CLOSED = new Set(['FULFILLED', 'CLOSED']);

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class PublicReportService {
  constructor(private readonly query: ReportQueryRepository) {}

  async compute(
    foundationId: string,
    start: Date,
    end: Date,
    sections: PublicSection[],
  ): Promise<PublicSnapshot> {
    const has = (section: PublicSection): boolean => sections.includes(section);
    const snapshot: PublicSnapshot = {};
    if (has('funds')) await this.addFunds(snapshot, foundationId, start, end);
    if (has('expenses'))
      await this.addExpenses(snapshot, foundationId, start, end);
    if (has('needs')) await this.addNeeds(snapshot, foundationId, start, end);
    if (has('donors')) await this.addDonors(snapshot, foundationId, start, end);
    return snapshot;
  }

  private async addFunds(
    snapshot: PublicSnapshot,
    foundationId: string,
    start: Date,
    end: Date,
  ): Promise<void> {
    const [contributions, procurements] = await Promise.all([
      this.query.contributions(foundationId, start, end),
      this.query.procurements(foundationId, start, end),
    ]);
    const collected = contributions.reduce((s, c) => s + Number(c.amount), 0);
    const spent = procurements.reduce((s, p) => s + Number(p.totalAmount), 0);
    snapshot.collectedFunds = round(collected);
    snapshot.spent = round(spent);
    snapshot.balance = round(collected - spent);
  }

  private async addExpenses(
    snapshot: PublicSnapshot,
    foundationId: string,
    start: Date,
    end: Date,
  ): Promise<void> {
    const lines = await this.query.expenseLines(foundationId, start, end);
    const map = new Map<string, number>();
    let total = 0;
    for (const line of lines) {
      const name = line.item?.category.name ?? 'Інше';
      const value = Number(line.lineTotal);
      map.set(name, (map.get(name) ?? 0) + value);
      total += value;
    }
    snapshot.expenseStructure = Array.from(map, ([name, value]) => ({
      name,
      value: round(value),
      pct: total > 0 ? Math.round((value / total) * 100) : 0,
    })).sort((a, b) => b.value - a.value);
  }

  private async addNeeds(
    snapshot: PublicSnapshot,
    foundationId: string,
    start: Date,
    end: Date,
  ): Promise<void> {
    const requests = await this.query.requests(foundationId, start, end);
    snapshot.closedNeeds = requests
      .filter((r) => CLOSED.has(r.status))
      .map((r) => ({
        unit: r.unit.name,
        direction: r.unit.note,
        given: r.lines.map((l) => `${l.name} ×${l.quantity}`).join(', '),
        sum: round(
          r.lines.reduce(
            (s, l) => s + l.quantity * Number(l.item?.lastPrice ?? 0),
            0,
          ),
        ),
      }));
  }

  private async addDonors(
    snapshot: PublicSnapshot,
    foundationId: string,
    start: Date,
    end: Date,
  ): Promise<void> {
    const contributions = await this.query.contributions(
      foundationId,
      start,
      end,
    );
    const map = new Map<string, number>();
    for (const c of contributions) {
      map.set(c.donor.name, (map.get(c.donor.name) ?? 0) + Number(c.amount));
    }
    snapshot.donors = Array.from(map, ([name, amount]) => ({
      name,
      amount: round(amount),
    })).sort((a, b) => b.amount - a.amount);
  }
}
