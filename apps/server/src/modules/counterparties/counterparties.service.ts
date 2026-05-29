import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prismaErrorCode } from '../../common/prisma-error';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { CounterpartyType } from '../../generated/prisma/enums';
import {
  CounterpartyRepository,
  type UpdateCounterpartyInput,
} from '../../infrastructure/database/repos/counterparty.repo';
import type { CreateCounterpartyDto } from './body/create-counterparty.dto';
import type { UpdateCounterpartyDto } from './body/update-counterparty.dto';
import type { CounterpartyResponse } from './responses/counterparty.response';
import type { CounterpartyDetailResponse } from './responses/counterparty-detail.response';

type ListRecord = Awaited<
  ReturnType<CounterpartyRepository['findManyByFoundation']>
>[number];
type DetailRecord = NonNullable<
  Awaited<ReturnType<CounterpartyRepository['findByIdWithOperations']>>
>;

const CODE_BASE: Record<CounterpartyType, number> = {
  UNIT: 100,
  DONOR: 200,
  SUPPLIER: 300,
};

function buildNextCode(type: CounterpartyType, existing: string[]): string {
  let max = CODE_BASE[type];
  for (const code of existing) {
    const match = /^CP-(\d+)$/.exec(code);
    const value = match ? Number(match[1]) : NaN;
    if (!Number.isNaN(value) && value > max) {
      max = value;
    }
  }
  return `CP-${max + 1}`;
}

function clean(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function latestDate(...values: (Date | undefined)[]): string | null {
  const times = values
    .filter((v): v is Date => v instanceof Date)
    .map((v) => v.getTime());
  return times.length ? new Date(Math.max(...times)).toISOString() : null;
}

@Injectable()
export class CounterpartiesService {
  constructor(private readonly counterparties: CounterpartyRepository) {}

  async list(actor: UserPrincipal): Promise<CounterpartyResponse[]> {
    const records = await this.counterparties.findManyByFoundation(
      actor.foundationId,
    );
    return records.map((record) => this.toResponse(record));
  }

  async get(
    actor: UserPrincipal,
    id: string,
  ): Promise<CounterpartyDetailResponse> {
    const record = await this.counterparties.findByIdWithOperations(id);
    if (!record || record.foundationId !== actor.foundationId) {
      throw new NotFoundException('Контрагента не знайдено');
    }
    return this.toDetailResponse(record);
  }

  async create(
    actor: UserPrincipal,
    dto: CreateCounterpartyDto,
  ): Promise<CounterpartyResponse> {
    const existing = await this.counterparties.findCodesByType(
      actor.foundationId,
      dto.type,
    );
    try {
      const created = await this.counterparties.create({
        foundationId: actor.foundationId,
        code: buildNextCode(dto.type, existing),
        type: dto.type,
        name: dto.name.trim(),
        legalForm: dto.legalForm,
        contactPerson: clean(dto.contactPerson),
        phone: clean(dto.phone),
        email: clean(dto.email),
        channel: dto.channel ?? null,
        note: clean(dto.note),
        firstContactAt: dto.firstContactAt
          ? new Date(dto.firstContactAt)
          : null,
      });
      return this.toResponse({
        ...created,
        _count: {
          requestsAsUnit: 0,
          contributionsAsDonor: 0,
          procurementsAsSupplier: 0,
        },
        requestsAsUnit: [],
        contributionsAsDonor: [],
        procurementsAsSupplier: [],
      });
    } catch (error) {
      if (prismaErrorCode(error) === 'P2002') {
        throw new ConflictException('Контрагент з таким кодом уже існує');
      }
      throw error;
    }
  }

  async update(
    actor: UserPrincipal,
    id: string,
    dto: UpdateCounterpartyDto,
  ): Promise<CounterpartyResponse> {
    await this.ensureOwned(actor, id);
    await this.counterparties.update(id, this.buildUpdate(dto));
    return this.get(actor, id);
  }

  async remove(actor: UserPrincipal, id: string): Promise<void> {
    await this.ensureOwned(actor, id);
    try {
      await this.counterparties.delete(id);
    } catch (error) {
      if (prismaErrorCode(error) === 'P2003') {
        throw new BadRequestException(
          'Не можна видалити контрагента, що має пов’язані операції',
        );
      }
      throw error;
    }
  }

  private async ensureOwned(actor: UserPrincipal, id: string): Promise<void> {
    const record = await this.counterparties.findById(id);
    if (!record || record.foundationId !== actor.foundationId) {
      throw new NotFoundException('Контрагента не знайдено');
    }
  }

  private buildUpdate(dto: UpdateCounterpartyDto): UpdateCounterpartyInput {
    const data: UpdateCounterpartyInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.legalForm !== undefined) data.legalForm = dto.legalForm;
    if (dto.contactPerson !== undefined)
      data.contactPerson = clean(dto.contactPerson);
    if (dto.phone !== undefined) data.phone = clean(dto.phone);
    if (dto.email !== undefined) data.email = clean(dto.email);
    if (dto.channel !== undefined) data.channel = dto.channel;
    if (dto.note !== undefined) data.note = clean(dto.note);
    if (dto.firstContactAt !== undefined) {
      data.firstContactAt = dto.firstContactAt
        ? new Date(dto.firstContactAt)
        : null;
    }
    return data;
  }

  private toResponse(record: ListRecord): CounterpartyResponse {
    const operationsCount =
      record._count.requestsAsUnit +
      record._count.contributionsAsDonor +
      record._count.procurementsAsSupplier;
    return {
      id: record.id,
      code: record.code,
      type: record.type,
      name: record.name,
      legalForm: record.legalForm,
      contactPerson: record.contactPerson,
      phone: record.phone,
      email: record.email,
      channel: record.channel,
      note: record.note,
      firstContactAt: record.firstContactAt
        ? record.firstContactAt.toISOString()
        : null,
      operationsCount,
      lastInteractionAt: latestDate(
        record.requestsAsUnit[0]?.createdAt,
        record.contributionsAsDonor[0]?.createdAt,
        record.procurementsAsSupplier[0]?.createdAt,
      ),
    };
  }

  private toDetailResponse(record: DetailRecord): CounterpartyDetailResponse {
    const operationsCount =
      record.requestsAsUnit.length +
      record.contributionsAsDonor.length +
      record.procurementsAsSupplier.length;
    return {
      id: record.id,
      code: record.code,
      type: record.type,
      name: record.name,
      legalForm: record.legalForm,
      contactPerson: record.contactPerson,
      phone: record.phone,
      email: record.email,
      channel: record.channel,
      note: record.note,
      firstContactAt: record.firstContactAt
        ? record.firstContactAt.toISOString()
        : null,
      operationsCount,
      lastInteractionAt: latestDate(
        record.requestsAsUnit[0]?.createdAt,
        record.contributionsAsDonor[0]?.occurredAt,
        record.procurementsAsSupplier[0]?.orderedAt,
      ),
      linkedRequests: record.requestsAsUnit.map((r) => ({
        id: r.id,
        number: r.number,
        status: r.status,
        date: r.createdAt.toISOString(),
        lineCount: r._count.lines,
      })),
      linkedContributions: record.contributionsAsDonor.map((c) => ({
        id: c.id,
        number: c.number,
        form: c.form,
        purpose: c.purpose,
        amount: Number(c.amount),
        date: c.occurredAt.toISOString(),
      })),
      linkedProcurements: record.procurementsAsSupplier.map((p) => ({
        id: p.id,
        number: p.number,
        status: p.status,
        amount: Number(p.totalAmount),
        date: p.orderedAt.toISOString(),
        lineCount: p._count.lines,
      })),
    };
  }
}
