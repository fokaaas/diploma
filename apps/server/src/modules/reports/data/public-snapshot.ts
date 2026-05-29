export type PublicSection = 'funds' | 'expenses' | 'needs' | 'donors';

export interface ExpenseSlice {
  name: string;
  value: number;
  pct: number;
}

export interface ClosedNeed {
  unit: string;
  direction: string | null;
  given: string;
  sum: number;
}

export interface DonorShare {
  name: string;
  amount: number;
}

export interface PublicSnapshot {
  collectedFunds?: number;
  spent?: number;
  balance?: number;
  expenseStructure?: ExpenseSlice[];
  closedNeeds?: ClosedNeed[];
  donors?: DonorShare[];
}
