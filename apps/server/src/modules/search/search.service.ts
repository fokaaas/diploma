import { Injectable } from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { RequestRepository } from '../../infrastructure/database/repos/request.repo';
import { CounterpartyRepository } from '../../infrastructure/database/repos/counterparty.repo';
import { ContributionRepository } from '../../infrastructure/database/repos/contribution.repo';
import { ProcurementRepository } from '../../infrastructure/database/repos/procurement.repo';
import { SearchResultsResponse } from './responses/search-results.response';

const MIN_QUERY = 2;
const TAKE = 6;
const EMPTY: SearchResultsResponse = {
  requests: [],
  counterparties: [],
  contributions: [],
  procurements: [],
};

@Injectable()
export class SearchService {
  constructor(
    private readonly requests: RequestRepository,
    private readonly counterparties: CounterpartyRepository,
    private readonly contributions: ContributionRepository,
    private readonly procurements: ProcurementRepository,
  ) {}

  async search(
    actor: UserPrincipal,
    q: string,
  ): Promise<SearchResultsResponse> {
    const query = q.trim();
    if (query.length < MIN_QUERY) return EMPTY;
    const fid = actor.foundationId;
    const [requests, counterparties, contributions, procurements] =
      await Promise.all([
        this.requests.search(fid, query, TAKE),
        this.counterparties.search(fid, query, TAKE),
        this.contributions.search(fid, query, TAKE),
        this.procurements.search(fid, query, TAKE),
      ]);
    return {
      requests: requests.map((r) => ({
        id: r.id,
        title: r.number,
        subtitle: r.unit.name,
      })),
      counterparties: counterparties.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.code,
      })),
      contributions: contributions.map((c) => ({
        id: c.id,
        title: c.number,
        subtitle: c.donor.name,
      })),
      procurements: procurements.map((p) => ({
        id: p.id,
        title: p.number,
        subtitle: p.supplier.name,
      })),
    };
  }
}
