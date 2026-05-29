import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import {
  CounterpartyType,
  ProcurementStatus,
} from '../../generated/prisma/enums';
import {
  ProcurementRepository,
  type CreateProcurementLineInput,
  type FundingInput,
} from '../../infrastructure/database/repos/procurement.repo';
import { ItemRepository } from '../../infrastructure/database/repos/item.repo';
import { CounterpartyRepository } from '../../infrastructure/database/repos/counterparty.repo';
import { RequestRepository } from '../../infrastructure/database/repos/request.repo';
import { ContributionRepository } from '../../infrastructure/database/repos/contribution.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import { FilesService } from '../files/files.service';
import type { FileResponse } from '../files/responses/file.response';
import type { CreateProcurementDto } from './body/create-procurement.dto';
import type { UpdateProcurementDto } from './body/update-procurement.dto';
import type { ChangeStatusDto } from './body/change-status.dto';
import type { FundingAllocationDto } from './body/funding-allocation.dto';
import type { ProcurementResponse } from './responses/procurement.response';
import type { ProcurementDetailResponse } from './responses/procurement-detail.response';

type ListRecord = Awaited<
  ReturnType<ProcurementRepository['findManyByFoundation']>
>[number];
type DetailRecord = NonNullable<
  Awaited<ReturnType<ProcurementRepository['findByIdFull']>>
>;
type HistoryRecord = Awaited<
  ReturnType<AuditLogRepository['findByTarget']>
>[number];

const STATUS_LABEL: Record<ProcurementStatus, string> = {
  DRAFT: 'Чернетка',
  ORDERED: 'Замовлено',
  PAID: 'Оплачено',
  RECEIVED: 'Отримано',
  CLOSED: 'Закрита',
};

const NEXT_STATUSES: Record<ProcurementStatus, ProcurementStatus[]> = {
  DRAFT: [ProcurementStatus.ORDERED],
  ORDERED: [ProcurementStatus.PAID],
  PAID: [],
  RECEIVED: [ProcurementStatus.CLOSED],
  CLOSED: [],
};

const EDITABLE: ProcurementStatus[] = [
  ProcurementStatus.DRAFT,
  ProcurementStatus.ORDERED,
];

function buildNextProcurementNumber(existing: string[]): string {
  let max = 0;
  for (const number of existing) {
    const match = /-(\d+)$/.exec(number);
    const value = match ? Number(match[1]) : NaN;
    if (!Number.isNaN(value) && value > max) max = value;
  }
  const year = new Date().getFullYear();
  return `PR-${year}-${String(max + 1).padStart(4, '0')}`;
}

@Injectable()
export class ProcurementsService {
  constructor(
    private readonly procurements: ProcurementRepository,
    private readonly items: ItemRepository,
    private readonly counterparties: CounterpartyRepository,
    private readonly requests: RequestRepository,
    private readonly contributions: ContributionRepository,
    private readonly audits: AuditLogRepository,
    private readonly filesService: FilesService,
  ) {}

  async list(actor: UserPrincipal): Promise<ProcurementResponse[]> {
    const records = await this.procurements.findManyByFoundation(
      actor.foundationId,
    );
    return records.map((record) => this.toListResponse(record));
  }

  async get(
    actor: UserPrincipal,
    id: string,
  ): Promise<ProcurementDetailResponse> {
    const record = await this.procurements.findByIdFull(id);
    if (!record || record.foundationId !== actor.foundationId) {
      throw new NotFoundException('Закупівлю не знайдено');
    }
    const history = await this.audits.findByTarget(
      actor.foundationId,
      'PROCUREMENT',
      id,
    );
    return this.toDetailResponse(record, history);
  }

  async create(
    actor: UserPrincipal,
    dto: CreateProcurementDto,
  ): Promise<ProcurementDetailResponse> {
    await this.assertSupplier(actor, dto.supplierId);
    if (dto.requestId) await this.assertRequest(actor, dto.requestId);
    const lines = await this.resolveLines(actor.foundationId, dto.lines);
    const funding = await this.validateFunding(actor, dto.funding);
    const totalAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const numbers = await this.procurements.findNumbers(actor.foundationId);
    const created = await this.procurements.create({
      foundationId: actor.foundationId,
      number: buildNextProcurementNumber(numbers),
      supplierId: dto.supplierId,
      requestId: dto.requestId ?? null,
      status: ProcurementStatus.DRAFT,
      totalAmount,
      orderedAt: new Date(dto.orderedAt),
      createdById: actor.sub,
      lines,
      funding,
    });
    await this.audit(
      actor,
      created.id,
      'Створення закупівлі',
      `Закупівлю ${created.number} створено`,
    );
    return this.get(actor, created.id);
  }

  async update(
    actor: UserPrincipal,
    id: string,
    dto: UpdateProcurementDto,
  ): Promise<ProcurementDetailResponse> {
    const existing = await this.ensureOwned(actor, id);
    if (!EDITABLE.includes(existing.status)) {
      throw new BadRequestException(
        'Редагувати можна лише чернетку або замовлену закупівлю',
      );
    }
    if (dto.requestId) await this.assertRequest(actor, dto.requestId);
    let totalAmount: number | undefined;
    if (dto.lines) {
      const lines = await this.resolveLines(actor.foundationId, dto.lines);
      await this.procurements.replaceLines(id, lines);
      totalAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    }
    if (dto.funding !== undefined) {
      const funding = await this.validateFunding(actor, dto.funding, id);
      await this.procurements.replaceFunding(id, funding);
    }
    await this.procurements.updateBasics(id, {
      requestId:
        dto.requestId !== undefined ? dto.requestId || null : undefined,
      orderedAt: dto.orderedAt ? new Date(dto.orderedAt) : undefined,
      totalAmount,
    });
    await this.audit(
      actor,
      id,
      'Редагування',
      `Закупівлю ${existing.number} оновлено`,
    );
    return this.get(actor, id);
  }

  async changeStatus(
    actor: UserPrincipal,
    id: string,
    dto: ChangeStatusDto,
  ): Promise<ProcurementDetailResponse> {
    const existing = await this.ensureOwned(actor, id);
    if (!NEXT_STATUSES[existing.status].includes(dto.status)) {
      throw new BadRequestException(
        `Неможливий перехід зі стану «${STATUS_LABEL[existing.status]}»`,
      );
    }
    await this.procurements.setStatus(id, dto.status);
    await this.audit(
      actor,
      id,
      `Статус → ${STATUS_LABEL[dto.status]}`,
      `Статус закупівлі ${existing.number}: ${STATUS_LABEL[dto.status]}`,
    );
    return this.get(actor, id);
  }

  async remove(actor: UserPrincipal, id: string): Promise<void> {
    await this.ensureOwned(actor, id);
    await this.filesService.purgeForProcurement(id);
    await this.procurements.delete(id);
  }

  async addFile(
    actor: UserPrincipal,
    id: string,
    file: { originalName: string; mimeType: string; data: Buffer },
  ): Promise<FileResponse> {
    const procurement = await this.ensureOwned(actor, id);
    const stored = await this.filesService.store({
      foundationId: actor.foundationId,
      procurementId: id,
      uploadedById: actor.sub,
      originalName: file.originalName,
      mimeType: file.mimeType,
      data: file.data,
    });
    await this.audit(
      actor,
      id,
      'Додано документ',
      `До закупівлі ${procurement.number} додано «${file.originalName}»`,
    );
    return stored;
  }

  private async ensureOwned(actor: UserPrincipal, id: string) {
    const procurement = await this.procurements.findById(id);
    if (!procurement || procurement.foundationId !== actor.foundationId) {
      throw new NotFoundException('Закупівлю не знайдено');
    }
    return procurement;
  }

  private async assertSupplier(
    actor: UserPrincipal,
    supplierId: string,
  ): Promise<void> {
    const supplier = await this.counterparties.findById(supplierId);
    if (
      !supplier ||
      supplier.foundationId !== actor.foundationId ||
      supplier.type !== CounterpartyType.SUPPLIER
    ) {
      throw new BadRequestException('Невідомий постачальник');
    }
  }

  private async assertRequest(
    actor: UserPrincipal,
    requestId: string,
  ): Promise<void> {
    const request = await this.requests.findById(requestId);
    if (!request || request.foundationId !== actor.foundationId) {
      throw new BadRequestException('Невідома заявка');
    }
  }

  private async resolveLines(
    foundationId: string,
    dtos: CreateProcurementDto['lines'],
  ): Promise<CreateProcurementLineInput[]> {
    const items = await this.items.findManyByFoundation(foundationId);
    const idBySku = new Map(
      items.map((item) => [item.sku.toLowerCase(), item.id]),
    );
    return dtos.map((line) => ({
      itemId: line.sku ? (idBySku.get(line.sku.toLowerCase()) ?? null) : null,
      name: line.name.trim(),
      sku: line.sku?.trim() || null,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.quantity * line.unitPrice,
    }));
  }

  private async validateFunding(
    actor: UserPrincipal,
    funding: FundingAllocationDto[] | undefined,
    excludeProcurementId?: string,
  ): Promise<FundingInput[]> {
    if (!funding || funding.length === 0) return [];
    const seen = new Set<string>();
    const result: FundingInput[] = [];
    for (const entry of funding) {
      if (seen.has(entry.contributionId)) {
        throw new BadRequestException('Дубльоване джерело фінансування');
      }
      seen.add(entry.contributionId);
      const contribution = await this.contributions.findById(
        entry.contributionId,
      );
      if (!contribution || contribution.foundationId !== actor.foundationId) {
        throw new BadRequestException(
          'Невідомий внесок у джерелах фінансування',
        );
      }
      const already = await this.procurements.sumFundingForContribution(
        entry.contributionId,
        excludeProcurementId,
      );
      if (
        already + entry.allocatedAmount >
        Number(contribution.amount) + 0.001
      ) {
        throw new BadRequestException(
          `Перевищено доступний залишок внеску ${contribution.number}`,
        );
      }
      result.push({
        contributionId: entry.contributionId,
        allocatedAmount: entry.allocatedAmount,
      });
    }
    return result;
  }

  private audit(
    actor: UserPrincipal,
    procurementId: string,
    action: string,
    summary: string,
  ) {
    return this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action,
      targetType: 'PROCUREMENT',
      targetId: procurementId,
      summary,
    });
  }

  private toListResponse(record: ListRecord): ProcurementResponse {
    return {
      id: record.id,
      number: record.number,
      supplierName: record.supplier.name,
      itemsSummary: record.lines
        .map((line) => `${line.name} ×${line.quantity}`)
        .join(' · '),
      lineCount: record.lines.length,
      requestNumber: record.request?.number ?? null,
      fundingNumbers: record.funding.map((f) => f.contribution.number),
      totalAmount: Number(record.totalAmount),
      date: record.orderedAt.toISOString(),
      status: record.status,
    };
  }

  private toDetailResponse(
    record: DetailRecord,
    history: HistoryRecord[],
  ): ProcurementDetailResponse {
    const funding = record.funding.map((f) => ({
      contributionId: f.contribution.id,
      contributionNumber: f.contribution.number,
      donorName: f.contribution.donor.name,
      allocatedAmount: Number(f.allocatedAmount),
    }));
    return {
      id: record.id,
      number: record.number,
      supplierName: record.supplier.name,
      itemsSummary: record.lines
        .map((line) => `${line.name} ×${line.quantity}`)
        .join(' · '),
      lineCount: record.lines.length,
      requestNumber: record.request?.number ?? null,
      fundingNumbers: funding.map((f) => f.contributionNumber),
      totalAmount: Number(record.totalAmount),
      date: record.orderedAt.toISOString(),
      status: record.status,
      supplierId: record.supplierId,
      requestId: record.requestId,
      requestUnitName: record.request?.unit.name ?? null,
      createdByName: record.createdBy.fullName,
      fundedTotal: funding.reduce((sum, f) => sum + f.allocatedAmount, 0),
      lines: record.lines.map((line) => ({
        id: line.id,
        itemId: line.itemId,
        name: line.name,
        sku: line.sku,
        quantity: line.quantity,
        unitPrice: Number(line.unitPrice),
        lineTotal: Number(line.lineTotal),
      })),
      funding,
      goodsReceipts: record.goodsReceipts.map((receipt) => ({
        id: receipt.id,
        warehouseName: receipt.warehouse.name,
        receivedAt: receipt.receivedAt.toISOString(),
        note: receipt.note,
        lines: receipt.lines.map((line) => ({
          itemName: line.item.name,
          quantity: line.quantity,
        })),
      })),
      files: record.files.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        kind: file.kind,
        createdAt: file.createdAt.toISOString(),
      })),
      history: history.map((entry) => ({
        action: entry.action,
        summary: entry.summary,
        actorName: entry.actor?.fullName ?? 'Система',
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }
}
