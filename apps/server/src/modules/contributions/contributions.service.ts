import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import {
  ContributionForm,
  CounterpartyType,
} from '../../generated/prisma/enums';
import { ContributionRepository } from '../../infrastructure/database/repos/contribution.repo';
import { CounterpartyRepository } from '../../infrastructure/database/repos/counterparty.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import { FilesService } from '../files/files.service';
import type { FileResponse } from '../files/responses/file.response';
import type { CreateContributionDto } from './body/create-contribution.dto';
import type { UpdateContributionDto } from './body/update-contribution.dto';
import type { ContributionResponse } from './responses/contribution.response';
import type { ContributionDetailResponse } from './responses/contribution-detail.response';

type ListRecord = Awaited<
  ReturnType<ContributionRepository['findManyByFoundation']>
>[number];
type DetailRecord = NonNullable<
  Awaited<ReturnType<ContributionRepository['findByIdFull']>>
>;

function buildNextContributionNumber(existing: string[]): string {
  let max = 0;
  for (const number of existing) {
    const match = /-(\d+)$/.exec(number);
    const value = match ? Number(match[1]) : NaN;
    if (!Number.isNaN(value) && value > max) max = value;
  }
  const year = new Date().getFullYear();
  return `CN-${year}-${String(max + 1).padStart(4, '0')}`;
}

function clean(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function allocatedOf(funding: { allocatedAmount: unknown }[]): number {
  return funding.reduce((sum, f) => sum + Number(f.allocatedAmount), 0);
}

@Injectable()
export class ContributionsService {
  constructor(
    private readonly contributions: ContributionRepository,
    private readonly counterparties: CounterpartyRepository,
    private readonly audits: AuditLogRepository,
    private readonly filesService: FilesService,
  ) {}

  async list(actor: UserPrincipal): Promise<ContributionResponse[]> {
    const records = await this.contributions.findManyByFoundation(
      actor.foundationId,
    );
    return records.map((record) => this.toListResponse(record));
  }

  async get(
    actor: UserPrincipal,
    id: string,
  ): Promise<ContributionDetailResponse> {
    const record = await this.contributions.findByIdFull(id);
    if (!record || record.foundationId !== actor.foundationId) {
      throw new NotFoundException('Внесок не знайдено');
    }
    return this.toDetailResponse(record);
  }

  async create(
    actor: UserPrincipal,
    dto: CreateContributionDto,
  ): Promise<ContributionDetailResponse> {
    await this.assertDonor(actor, dto.donorId);
    if (dto.form === ContributionForm.IN_KIND && !dto.itemName?.trim()) {
      throw new BadRequestException('Для натурального внеску вкажіть позицію');
    }
    const numbers = await this.contributions.findNumbers(actor.foundationId);
    const created = await this.contributions.create({
      foundationId: actor.foundationId,
      number: buildNextContributionNumber(numbers),
      donorId: dto.donorId,
      form: dto.form,
      amount: dto.amount,
      currency: dto.currency?.trim() || 'UAH',
      purpose: clean(dto.purpose),
      baseDocumentLabel: clean(dto.baseDocumentLabel),
      itemName:
        dto.form === ContributionForm.IN_KIND ? clean(dto.itemName) : null,
      itemQuantity:
        dto.form === ContributionForm.IN_KIND
          ? (dto.itemQuantity ?? null)
          : null,
      occurredAt: new Date(dto.occurredAt),
      registeredById: actor.sub,
    });
    await this.audit(
      actor,
      created.id,
      'Реєстрація внеску',
      `Внесок ${created.number} зареєстровано`,
    );
    return this.get(actor, created.id);
  }

  async update(
    actor: UserPrincipal,
    id: string,
    dto: UpdateContributionDto,
  ): Promise<ContributionDetailResponse> {
    const existing = await this.ensureOwned(actor, id);
    await this.contributions.updateBasics(id, {
      form: dto.form,
      amount: dto.amount,
      currency: dto.currency?.trim() || undefined,
      purpose: dto.purpose !== undefined ? clean(dto.purpose) : undefined,
      baseDocumentLabel:
        dto.baseDocumentLabel !== undefined
          ? clean(dto.baseDocumentLabel)
          : undefined,
      itemName: dto.itemName !== undefined ? clean(dto.itemName) : undefined,
      itemQuantity: dto.itemQuantity,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
    });
    await this.audit(
      actor,
      id,
      'Редагування',
      `Внесок ${existing.number} оновлено`,
    );
    return this.get(actor, id);
  }

  async remove(actor: UserPrincipal, id: string): Promise<void> {
    await this.ensureOwned(actor, id);
    await this.filesService.purgeForContribution(id);
    await this.contributions.delete(id);
  }

  async addFile(
    actor: UserPrincipal,
    id: string,
    file: { originalName: string; mimeType: string; data: Buffer },
  ): Promise<FileResponse> {
    const contribution = await this.ensureOwned(actor, id);
    const stored = await this.filesService.store({
      foundationId: actor.foundationId,
      contributionId: id,
      uploadedById: actor.sub,
      originalName: file.originalName,
      mimeType: file.mimeType,
      data: file.data,
    });
    await this.audit(
      actor,
      id,
      'Додано документ',
      `До внеску ${contribution.number} додано «${file.originalName}»`,
    );
    return stored;
  }

  private async ensureOwned(actor: UserPrincipal, id: string) {
    const contribution = await this.contributions.findById(id);
    if (!contribution || contribution.foundationId !== actor.foundationId) {
      throw new NotFoundException('Внесок не знайдено');
    }
    return contribution;
  }

  private async assertDonor(
    actor: UserPrincipal,
    donorId: string,
  ): Promise<void> {
    const donor = await this.counterparties.findById(donorId);
    if (
      !donor ||
      donor.foundationId !== actor.foundationId ||
      donor.type !== CounterpartyType.DONOR
    ) {
      throw new BadRequestException('Невідомий донор');
    }
  }

  private audit(
    actor: UserPrincipal,
    contributionId: string,
    action: string,
    summary: string,
  ) {
    return this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action,
      targetType: 'CONTRIBUTION',
      targetId: contributionId,
      summary,
    });
  }

  private toListResponse(record: ListRecord): ContributionResponse {
    return {
      id: record.id,
      number: record.number,
      donorId: record.donorId,
      donorName: record.donor.name,
      form: record.form,
      amount: Number(record.amount),
      currency: record.currency,
      purpose: record.purpose,
      baseDocumentLabel: record.baseDocumentLabel,
      date: record.occurredAt.toISOString(),
      procurementCount: record.funding.length,
      allocatedTotal: allocatedOf(record.funding),
    };
  }

  private toDetailResponse(record: DetailRecord): ContributionDetailResponse {
    const amount = Number(record.amount);
    const allocatedTotal = allocatedOf(record.funding);
    return {
      id: record.id,
      number: record.number,
      donorId: record.donorId,
      donorName: record.donor.name,
      form: record.form,
      amount,
      currency: record.currency,
      purpose: record.purpose,
      baseDocumentLabel: record.baseDocumentLabel,
      date: record.occurredAt.toISOString(),
      procurementCount: record.funding.length,
      allocatedTotal,
      itemName: record.itemName,
      itemQuantity: record.itemQuantity,
      donorNote: record.donor.note,
      registeredByName: record.registeredBy.fullName,
      unspent: Math.max(0, amount - allocatedTotal),
      linkedProcurements: record.funding.map((f) => ({
        id: f.procurement.id,
        number: f.procurement.number,
        supplierName: f.procurement.supplier.name,
        status: f.procurement.status,
        amount: Number(f.procurement.totalAmount),
        lineCount: f.procurement._count.lines,
      })),
      files: record.files.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        kind: file.kind,
        createdAt: file.createdAt.toISOString(),
      })),
    };
  }
}
