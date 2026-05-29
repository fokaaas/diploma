import { Injectable } from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import { RequestRepository } from '../../infrastructure/database/repos/request.repo';
import { ContributionRepository } from '../../infrastructure/database/repos/contribution.repo';
import { ProcurementRepository } from '../../infrastructure/database/repos/procurement.repo';
import { ItemRepository } from '../../infrastructure/database/repos/item.repo';
import { CategoryRepository } from '../../infrastructure/database/repos/category.repo';
import { UserRepository } from '../../infrastructure/database/repos/user.repo';
import { AuditEntryResponse } from './responses/audit-entry.response';

type AuditRecord = Awaited<
  ReturnType<AuditLogRepository['findManyByFoundation']>
>[number];

@Injectable()
export class AuditService {
  constructor(
    private readonly audits: AuditLogRepository,
    private readonly requests: RequestRepository,
    private readonly contributions: ContributionRepository,
    private readonly procurements: ProcurementRepository,
    private readonly items: ItemRepository,
    private readonly categories: CategoryRepository,
    private readonly users: UserRepository,
  ) {}

  async list(actor: UserPrincipal): Promise<AuditEntryResponse[]> {
    const entries = await this.audits.findManyByFoundation(actor.foundationId);
    const refs = await this.resolveRefs(entries);
    return entries.map((entry) => this.toResponse(entry, refs));
  }

  private async resolveRefs(
    entries: AuditRecord[],
  ): Promise<Map<string, string>> {
    const idsBy = (types: string[]) =>
      entries
        .filter((entry) => types.includes(entry.targetType))
        .map((entry) => entry.targetId);

    const [requests, contributions, procurements, items, categories, users] =
      await Promise.all([
        this.requests.findRefs(idsBy(['REQUEST'])),
        this.contributions.findRefs(idsBy(['CONTRIBUTION'])),
        this.procurements.findRefs(idsBy(['PROCUREMENT'])),
        this.items.findRefs(idsBy(['STOCK', 'ITEM'])),
        this.categories.findRefs(idsBy(['CATEGORY'])),
        this.users.findRefs(idsBy(['USER'])),
      ]);

    const map = new Map<string, string>();
    requests.forEach((ref) => map.set(ref.id, ref.number));
    contributions.forEach((ref) => map.set(ref.id, ref.number));
    procurements.forEach((ref) => map.set(ref.id, ref.number));
    items.forEach((ref) => map.set(ref.id, ref.sku));
    categories.forEach((ref) => map.set(ref.id, ref.name));
    users.forEach((ref) => map.set(ref.id, ref.fullName));
    return map;
  }

  private toResponse(
    entry: AuditRecord,
    refs: Map<string, string>,
  ): AuditEntryResponse {
    return {
      id: entry.id,
      occurredAt: entry.createdAt.toISOString(),
      actorName: entry.actor?.fullName ?? 'Система',
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      targetRef: refs.get(entry.targetId) ?? null,
      summary: entry.summary,
    };
  }
}
