import { Injectable } from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import type {
  ProcurementStatus,
  RequestStatus,
} from '../../generated/prisma/enums';
import { DashboardQueryRepository } from '../../infrastructure/database/repos/dashboard-query.repo';
import { NavCountsResponse } from './responses/nav-counts.response';

const ACTIVE_REQUESTS: RequestStatus[] = [
  'NEW',
  'CONFIRMED',
  'IN_PROGRESS',
  'PARTIALLY_FULFILLED',
];
const ACTIVE_PROCUREMENTS: ProcurementStatus[] = [
  'DRAFT',
  'ORDERED',
  'PAID',
  'RECEIVED',
];

@Injectable()
export class NavService {
  constructor(private readonly query: DashboardQueryRepository) {}

  async counts(actor: UserPrincipal): Promise<NavCountsResponse> {
    const fid = actor.foundationId;
    const [requests, procurements] = await Promise.all([
      this.query.countRequests(fid, ACTIVE_REQUESTS),
      this.query.countProcurements(fid, ACTIVE_PROCUREMENTS),
    ]);
    return { requests, procurements };
  }
}
