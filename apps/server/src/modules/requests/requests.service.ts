import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import {
  CounterpartyType,
  Priority,
  RequestStatus,
} from '../../generated/prisma/enums';
import {
  RequestRepository,
  type CreateRequestLineInput,
} from '../../infrastructure/database/repos/request.repo';
import { ItemRepository } from '../../infrastructure/database/repos/item.repo';
import { CounterpartyRepository } from '../../infrastructure/database/repos/counterparty.repo';
import { UserRepository } from '../../infrastructure/database/repos/user.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import { FilesService } from '../files/files.service';
import type { FileResponse } from '../files/responses/file.response';
import type { CreateRequestDto } from './body/create-request.dto';
import type { UpdateRequestDto } from './body/update-request.dto';
import type { ChangeStatusDto } from './body/change-status.dto';
import type { RequestResponse } from './responses/request.response';
import type { RequestDetailResponse } from './responses/request-detail.response';

type ListRecord = Awaited<
  ReturnType<RequestRepository['findManyByFoundation']>
>[number];
type DetailRecord = NonNullable<
  Awaited<ReturnType<RequestRepository['findByIdFull']>>
>;
type HistoryRecord = Awaited<
  ReturnType<AuditLogRepository['findByTarget']>
>[number];

const STATUS_LABEL: Record<RequestStatus, string> = {
  NEW: 'Нова',
  CONFIRMED: 'Підтверджена',
  IN_PROGRESS: 'В роботі',
  PARTIALLY_FULFILLED: 'Частково виконана',
  FULFILLED: 'Виконана',
  CLOSED: 'Закрита',
  REJECTED: 'Відхилена',
};

const NEXT_STATUSES: Record<RequestStatus, RequestStatus[]> = {
  NEW: [RequestStatus.CONFIRMED, RequestStatus.REJECTED],
  CONFIRMED: [RequestStatus.IN_PROGRESS, RequestStatus.REJECTED],
  IN_PROGRESS: [
    RequestStatus.PARTIALLY_FULFILLED,
    RequestStatus.FULFILLED,
    RequestStatus.REJECTED,
  ],
  PARTIALLY_FULFILLED: [RequestStatus.FULFILLED, RequestStatus.REJECTED],
  FULFILLED: [RequestStatus.CLOSED],
  CLOSED: [],
  REJECTED: [],
};

const EDITABLE_STATUSES: RequestStatus[] = [
  RequestStatus.NEW,
  RequestStatus.CONFIRMED,
];

function buildNextRequestNumber(existing: string[]): string {
  let max = 0;
  for (const number of existing) {
    const match = /-(\d+)$/.exec(number);
    const value = match ? Number(match[1]) : NaN;
    if (!Number.isNaN(value) && value > max) max = value;
  }
  const year = new Date().getFullYear();
  return `R-${year}-${String(max + 1).padStart(4, '0')}`;
}

function clean(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function lineTotalOf(quantity: number, lastPrice: unknown): number | null {
  if (lastPrice === null || lastPrice === undefined) return null;
  return quantity * Number(lastPrice);
}

function estimatedValueOf(
  lines: { quantity: number; item: { lastPrice: unknown } | null }[],
): number {
  return lines.reduce(
    (sum, line) =>
      sum + (lineTotalOf(line.quantity, line.item?.lastPrice) ?? 0),
    0,
  );
}

@Injectable()
export class RequestsService {
  constructor(
    private readonly requests: RequestRepository,
    private readonly items: ItemRepository,
    private readonly counterparties: CounterpartyRepository,
    private readonly users: UserRepository,
    private readonly audits: AuditLogRepository,
    private readonly filesService: FilesService,
  ) {}

  async list(actor: UserPrincipal): Promise<RequestResponse[]> {
    const records = await this.requests.findManyByFoundation(
      actor.foundationId,
    );
    return records.map((record) => this.toListResponse(record));
  }

  async get(actor: UserPrincipal, id: string): Promise<RequestDetailResponse> {
    const record = await this.requests.findByIdFull(id);
    if (!record || record.foundationId !== actor.foundationId) {
      throw new NotFoundException('Заявку не знайдено');
    }
    const history = await this.audits.findByTarget(
      actor.foundationId,
      'REQUEST',
      id,
    );
    return this.toDetailResponse(record, history);
  }

  async create(
    actor: UserPrincipal,
    dto: CreateRequestDto,
  ): Promise<RequestDetailResponse> {
    await this.assertUnit(actor, dto.unitId);
    await this.assertAssignee(actor, dto.assigneeId);
    const numbers = await this.requests.findNumbers(actor.foundationId);
    const lines = await this.resolveLines(actor.foundationId, dto.lines);
    const created = await this.requests.create({
      foundationId: actor.foundationId,
      number: buildNextRequestNumber(numbers),
      unitId: dto.unitId,
      unitContactName: dto.unitContactName.trim(),
      priority: dto.priority ?? Priority.MEDIUM,
      status: RequestStatus.NEW,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      channel: dto.channel ?? null,
      registeredById: actor.sub,
      assigneeId: clean(dto.assigneeId),
      lines,
    });
    await this.audit(
      actor,
      created.id,
      'Створення заявки',
      `Заявку ${created.number} зареєстровано`,
    );
    return this.get(actor, created.id);
  }

  async update(
    actor: UserPrincipal,
    id: string,
    dto: UpdateRequestDto,
  ): Promise<RequestDetailResponse> {
    const existing = await this.ensureOwned(actor, id);
    if (!EDITABLE_STATUSES.includes(existing.status)) {
      throw new BadRequestException(
        'Редагувати можна лише нові або підтверджені заявки',
      );
    }
    await this.assertAssignee(actor, dto.assigneeId);
    await this.requests.updateBasics(id, {
      unitContactName: dto.unitContactName?.trim(),
      priority: dto.priority,
      deadline:
        dto.deadline !== undefined
          ? dto.deadline
            ? new Date(dto.deadline)
            : null
          : undefined,
      channel: dto.channel,
      assigneeId:
        dto.assigneeId !== undefined ? clean(dto.assigneeId) : undefined,
    });
    if (dto.lines) {
      const lines = await this.resolveLines(actor.foundationId, dto.lines);
      await this.requests.replaceLines(id, lines);
    }
    await this.audit(
      actor,
      id,
      'Редагування',
      `Заявку ${existing.number} оновлено`,
    );
    return this.get(actor, id);
  }

  async changeStatus(
    actor: UserPrincipal,
    id: string,
    dto: ChangeStatusDto,
  ): Promise<RequestDetailResponse> {
    const existing = await this.ensureOwned(actor, id);
    if (!NEXT_STATUSES[existing.status].includes(dto.status)) {
      throw new BadRequestException(
        `Неможливий перехід зі стану «${STATUS_LABEL[existing.status]}»`,
      );
    }
    await this.requests.setStatus(id, dto.status);
    await this.audit(
      actor,
      id,
      `Статус → ${STATUS_LABEL[dto.status]}`,
      `Статус заявки ${existing.number}: ${STATUS_LABEL[dto.status]}`,
    );
    return this.get(actor, id);
  }

  async remove(actor: UserPrincipal, id: string): Promise<void> {
    await this.ensureOwned(actor, id);
    await this.filesService.purgeForRequest(id);
    await this.requests.delete(id);
  }

  async addFile(
    actor: UserPrincipal,
    id: string,
    file: { originalName: string; mimeType: string; data: Buffer },
  ): Promise<FileResponse> {
    const request = await this.ensureOwned(actor, id);
    const stored = await this.filesService.store({
      foundationId: actor.foundationId,
      requestId: id,
      uploadedById: actor.sub,
      originalName: file.originalName,
      mimeType: file.mimeType,
      data: file.data,
    });
    await this.audit(
      actor,
      id,
      'Додано вкладення',
      `До заявки ${request.number} додано «${file.originalName}»`,
    );
    return stored;
  }

  private async ensureOwned(actor: UserPrincipal, id: string) {
    const request = await this.requests.findById(id);
    if (!request || request.foundationId !== actor.foundationId) {
      throw new NotFoundException('Заявку не знайдено');
    }
    return request;
  }

  private async assertUnit(
    actor: UserPrincipal,
    unitId: string,
  ): Promise<void> {
    const unit = await this.counterparties.findById(unitId);
    if (
      !unit ||
      unit.foundationId !== actor.foundationId ||
      unit.type !== CounterpartyType.UNIT
    ) {
      throw new BadRequestException('Невідомий підрозділ');
    }
  }

  private async assertAssignee(
    actor: UserPrincipal,
    assigneeId: string | undefined,
  ): Promise<void> {
    const id = clean(assigneeId);
    if (!id) return;
    const user = await this.users.findById(id);
    if (!user || user.foundationId !== actor.foundationId) {
      throw new BadRequestException('Невідомий виконавець');
    }
  }

  private async resolveLines(
    foundationId: string,
    dtos: CreateRequestDto['lines'],
  ): Promise<CreateRequestLineInput[]> {
    const items = await this.items.findManyByFoundation(foundationId);
    const idBySku = new Map(
      items.map((item) => [item.sku.toLowerCase(), item.id]),
    );
    return dtos.map((line) => ({
      itemId: line.sku ? (idBySku.get(line.sku.toLowerCase()) ?? null) : null,
      name: line.name.trim(),
      sku: clean(line.sku),
      quantity: line.quantity,
      unit: line.unit.trim(),
      techSpec: clean(line.techSpec),
    }));
  }

  private audit(
    actor: UserPrincipal,
    requestId: string,
    action: string,
    summary: string,
  ) {
    return this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action,
      targetType: 'REQUEST',
      targetId: requestId,
      summary,
    });
  }

  private toListResponse(record: ListRecord): RequestResponse {
    return {
      id: record.id,
      number: record.number,
      unitId: record.unitId,
      unitName: record.unit.name,
      unitContactName: record.unitContactName,
      priority: record.priority,
      status: record.status,
      deadline: record.deadline ? record.deadline.toISOString() : null,
      date: record.createdAt.toISOString(),
      itemsSummary: record.lines
        .map((line) => `${line.name} ×${line.quantity}`)
        .join(' · '),
      lineCount: record.lines.length,
      estimatedValue: estimatedValueOf(record.lines),
    };
  }

  private toDetailResponse(
    record: DetailRecord,
    history: HistoryRecord[],
  ): RequestDetailResponse {
    return {
      id: record.id,
      number: record.number,
      unitId: record.unitId,
      unitName: record.unit.name,
      unitContactName: record.unitContactName,
      priority: record.priority,
      status: record.status,
      deadline: record.deadline ? record.deadline.toISOString() : null,
      date: record.createdAt.toISOString(),
      itemsSummary: record.lines
        .map((line) => `${line.name} ×${line.quantity}`)
        .join(' · '),
      lineCount: record.lines.length,
      estimatedValue: estimatedValueOf(record.lines),
      channel: record.channel,
      unitNote: record.unit.note,
      unitPhone: record.unit.phone,
      registeredByName: record.registeredBy.fullName,
      assigneeName: record.assignee?.fullName ?? null,
      lines: record.lines.map((line) => ({
        id: line.id,
        name: line.name,
        sku: line.sku,
        quantity: line.quantity,
        unit: line.unit,
        techSpec: line.techSpec,
        receivedQuantity: line.receivedQuantity,
        lineTotal: lineTotalOf(line.quantity, line.item?.lastPrice),
      })),
      files: record.files.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        kind: file.kind,
        createdAt: file.createdAt.toISOString(),
      })),
      linkedProcurements: record.procurements.map((procurement) => ({
        id: procurement.id,
        number: procurement.number,
        supplierName: procurement.supplier.name,
        status: procurement.status,
        amount: Number(procurement.totalAmount),
        lineCount: procurement._count.lines,
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
