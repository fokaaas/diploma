import { BadRequestException, Injectable } from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { MovementType } from '../../generated/prisma/enums';
import { StockLevelRepository } from '../../infrastructure/database/repos/stock-level.repo';
import { StockMovementRepository } from '../../infrastructure/database/repos/stock-movement.repo';
import { ItemRepository } from '../../infrastructure/database/repos/item.repo';
import { WarehouseRepository } from '../../infrastructure/database/repos/warehouse.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import type { ManualReceiptDto } from './body/manual-receipt.dto';
import type { StockLevelResponse } from './responses/stock-level.response';
import type { MovementResponse } from './responses/movement.response';

type LevelRecord = Awaited<
  ReturnType<StockLevelRepository['findManyByFoundation']>
>[number];
type MovementRecord = Awaited<
  ReturnType<StockMovementRepository['findManyByFoundation']>
>[number];

@Injectable()
export class StockService {
  constructor(
    private readonly stockLevels: StockLevelRepository,
    private readonly movements: StockMovementRepository,
    private readonly items: ItemRepository,
    private readonly warehouses: WarehouseRepository,
    private readonly audits: AuditLogRepository,
  ) {}

  async levels(actor: UserPrincipal): Promise<StockLevelResponse[]> {
    const records = await this.stockLevels.findManyByFoundation(
      actor.foundationId,
    );
    return records.map((record) => this.toLevel(record));
  }

  async movementsLog(actor: UserPrincipal): Promise<MovementResponse[]> {
    const records = await this.movements.findManyByFoundation(
      actor.foundationId,
    );
    return records.map((record) => this.toMovement(record));
  }

  async receive(actor: UserPrincipal, dto: ManualReceiptDto): Promise<void> {
    const item = await this.items.findById(dto.itemId);
    if (!item || item.foundationId !== actor.foundationId) {
      throw new BadRequestException('Невідома позиція');
    }
    const warehouse = await this.findOrCreateWarehouse(
      actor.foundationId,
      dto.warehouseName.trim(),
    );
    const [number] = await this.movements.nextNumbers(actor.foundationId, 1);
    await this.movements.create({
      foundationId: actor.foundationId,
      number,
      type: MovementType.IN,
      itemId: item.id,
      warehouseId: warehouse.id,
      quantity: dto.quantity,
      performedById: actor.sub,
    });
    await this.stockLevels.increment(item.id, warehouse.id, dto.quantity);
    await this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action: 'Прийом на склад',
      targetType: 'STOCK',
      targetId: item.id,
      summary: `Прийнято ${dto.quantity} «${item.name}» на склад «${warehouse.name}»`,
    });
  }

  private async findOrCreateWarehouse(foundationId: string, name: string) {
    const existing = await this.warehouses.findByName(foundationId, name);
    return existing ?? this.warehouses.create({ foundationId, name });
  }

  private toLevel(record: LevelRecord): StockLevelResponse {
    return {
      itemId: record.item.id,
      sku: record.item.sku,
      name: record.item.name,
      categoryName: record.item.category.name,
      unit: record.item.unit,
      warehouseId: record.warehouse.id,
      warehouseName: record.warehouse.name,
      quantity: record.quantity,
      minStock: record.item.minStock,
      lastPrice:
        record.item.lastPrice === null ? null : Number(record.item.lastPrice),
    };
  }

  private toMovement(record: MovementRecord): MovementResponse {
    return {
      id: record.id,
      number: record.number,
      type: record.type,
      itemName: record.item.name,
      quantity: record.quantity,
      occurredAt: record.occurredAt.toISOString(),
      warehouseName: record.warehouse.name,
      performedByName: record.performedBy.fullName,
      sourceNumber:
        record.goodsReceipt?.procurement.number ??
        record.issuance?.request.number ??
        null,
    };
  }
}
