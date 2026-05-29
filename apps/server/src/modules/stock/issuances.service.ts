import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { MovementType, RequestStatus } from '../../generated/prisma/enums';
import { IssuanceRepository } from '../../infrastructure/database/repos/issuance.repo';
import { RequestRepository } from '../../infrastructure/database/repos/request.repo';
import { ItemRepository } from '../../infrastructure/database/repos/item.repo';
import { WarehouseRepository } from '../../infrastructure/database/repos/warehouse.repo';
import { StockLevelRepository } from '../../infrastructure/database/repos/stock-level.repo';
import { StockMovementRepository } from '../../infrastructure/database/repos/stock-movement.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import type { CreateIssuanceDto } from './body/create-issuance.dto';

type RequestRecord = NonNullable<
  Awaited<ReturnType<RequestRepository['findByIdFull']>>
>;

const OPEN_STATUSES: RequestStatus[] = [
  RequestStatus.NEW,
  RequestStatus.CONFIRMED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.PARTIALLY_FULFILLED,
];

function nextStatus(lines: { quantity: number; receivedQuantity: number }[]) {
  const anyReceived = lines.some((l) => l.receivedQuantity > 0);
  const allReceived = lines.every((l) => l.receivedQuantity >= l.quantity);
  if (allReceived) return RequestStatus.FULFILLED;
  if (anyReceived) return RequestStatus.PARTIALLY_FULFILLED;
  return null;
}

@Injectable()
export class IssuancesService {
  constructor(
    private readonly issuances: IssuanceRepository,
    private readonly requests: RequestRepository,
    private readonly items: ItemRepository,
    private readonly warehouses: WarehouseRepository,
    private readonly stockLevels: StockLevelRepository,
    private readonly movements: StockMovementRepository,
    private readonly audits: AuditLogRepository,
  ) {}

  async issue(actor: UserPrincipal, dto: CreateIssuanceDto): Promise<void> {
    const request = await this.requests.findByIdFull(dto.requestId);
    if (!request || request.foundationId !== actor.foundationId) {
      throw new NotFoundException('Заявку не знайдено');
    }
    if (!OPEN_STATUSES.includes(request.status)) {
      throw new BadRequestException('Заявка вже закрита або відхилена');
    }

    const warehouse = await this.findOrCreateWarehouse(
      actor.foundationId,
      dto.warehouseName.trim(),
    );
    await this.assertStock(actor, warehouse.id, dto.lines);

    const issuance = await this.issuances.create({
      foundationId: actor.foundationId,
      requestId: request.id,
      recipientName: dto.recipientName.trim(),
      deliveryMethod: dto.deliveryMethod?.trim() || null,
      issuedById: actor.sub,
      lines: dto.lines.map((line) => ({
        itemId: line.itemId,
        warehouseId: warehouse.id,
        quantity: line.quantity,
      })),
    });

    const numbers = await this.movements.nextNumbers(
      actor.foundationId,
      dto.lines.length,
    );
    for (const [index, line] of dto.lines.entries()) {
      await this.movements.create({
        foundationId: actor.foundationId,
        number: numbers[index],
        type: MovementType.OUT,
        itemId: line.itemId,
        warehouseId: warehouse.id,
        quantity: line.quantity,
        performedById: actor.sub,
        issuanceId: issuance.id,
      });
      await this.stockLevels.decrement(
        line.itemId,
        warehouse.id,
        line.quantity,
      );
      await this.fulfilRequestLine(request, line.itemId, line.quantity);
    }

    await this.applyStatus(request.id);
    await this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action: 'Видача зі складу',
      targetType: 'REQUEST',
      targetId: request.id,
      summary: `Видано ${dto.lines.length} поз. за заявкою ${request.number} зі складу «${warehouse.name}»`,
    });
  }

  private async assertStock(
    actor: UserPrincipal,
    warehouseId: string,
    lines: CreateIssuanceDto['lines'],
  ): Promise<void> {
    for (const line of lines) {
      const item = await this.items.findById(line.itemId);
      if (!item || item.foundationId !== actor.foundationId) {
        throw new BadRequestException('Невідома позиція у видачі');
      }
      const level = await this.stockLevels.findByItemWarehouse(
        line.itemId,
        warehouseId,
      );
      if (!level || level.quantity < line.quantity) {
        throw new BadRequestException(`Недостатньо на складі: ${item.name}`);
      }
    }
  }

  private async fulfilRequestLine(
    request: RequestRecord,
    itemId: string,
    quantity: number,
  ): Promise<void> {
    const target = request.lines.find(
      (line) => line.itemId === itemId && line.receivedQuantity < line.quantity,
    );
    if (target) {
      await this.requests.incrementLineReceived(target.id, quantity);
      target.receivedQuantity += quantity;
    }
  }

  private async applyStatus(requestId: string): Promise<void> {
    const updated = await this.requests.findByIdFull(requestId);
    if (!updated || !OPEN_STATUSES.includes(updated.status)) return;
    const status = nextStatus(updated.lines);
    if (status && status !== updated.status) {
      await this.requests.setStatus(requestId, status);
    }
  }

  private async findOrCreateWarehouse(foundationId: string, name: string) {
    const existing = await this.warehouses.findByName(foundationId, name);
    return existing ?? this.warehouses.create({ foundationId, name });
  }
}
