import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { MovementType, ProcurementStatus } from '../../generated/prisma/enums';
import { ProcurementRepository } from '../../infrastructure/database/repos/procurement.repo';
import { WarehouseRepository } from '../../infrastructure/database/repos/warehouse.repo';
import { StockLevelRepository } from '../../infrastructure/database/repos/stock-level.repo';
import { StockMovementRepository } from '../../infrastructure/database/repos/stock-movement.repo';
import {
  GoodsReceiptRepository,
  type CreateGoodsReceiptLineInput,
} from '../../infrastructure/database/repos/goods-receipt.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import type { ReceiveProcurementDto } from './body/receive-procurement.dto';

const RECEIVABLE: ProcurementStatus[] = [
  ProcurementStatus.ORDERED,
  ProcurementStatus.PAID,
];

@Injectable()
export class GoodsReceiptService {
  constructor(
    private readonly procurements: ProcurementRepository,
    private readonly warehouses: WarehouseRepository,
    private readonly stockLevels: StockLevelRepository,
    private readonly movements: StockMovementRepository,
    private readonly receipts: GoodsReceiptRepository,
    private readonly audits: AuditLogRepository,
  ) {}

  async receive(
    actor: UserPrincipal,
    procurementId: string,
    dto: ReceiveProcurementDto,
  ): Promise<void> {
    const procurement = await this.procurements.findByIdFull(procurementId);
    if (!procurement || procurement.foundationId !== actor.foundationId) {
      throw new NotFoundException('Закупівлю не знайдено');
    }
    if (!RECEIVABLE.includes(procurement.status)) {
      throw new BadRequestException(
        'Приймати можна замовлену або оплачену закупівлю',
      );
    }
    const lineById = new Map(procurement.lines.map((line) => [line.id, line]));
    const receiptLines: CreateGoodsReceiptLineInput[] = dto.lines.map(
      (line) => {
        const source = lineById.get(line.procurementLineId);
        if (!source?.itemId) {
          throw new BadRequestException(
            'Позицію не можна прийняти на склад — її немає в номенклатурі',
          );
        }
        return {
          itemId: source.itemId,
          quantity: line.quantity,
          accepted: true,
        };
      },
    );

    const warehouse = await this.findOrCreateWarehouse(
      actor.foundationId,
      dto.warehouseName.trim(),
    );
    const receipt = await this.receipts.create({
      foundationId: actor.foundationId,
      procurementId,
      warehouseId: warehouse.id,
      receivedById: actor.sub,
      note: dto.note?.trim() || null,
      lines: receiptLines,
    });

    const numbers = await this.movements.nextNumbers(
      actor.foundationId,
      receiptLines.length,
    );
    for (const [index, line] of receiptLines.entries()) {
      await this.movements.create({
        foundationId: actor.foundationId,
        number: numbers[index],
        type: MovementType.IN,
        itemId: line.itemId,
        warehouseId: warehouse.id,
        quantity: line.quantity,
        performedById: actor.sub,
        goodsReceiptId: receipt.id,
      });
      await this.stockLevels.increment(
        line.itemId,
        warehouse.id,
        line.quantity,
      );
    }

    await this.procurements.setStatus(
      procurementId,
      ProcurementStatus.RECEIVED,
    );
    await this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action: 'Прийнято на склад',
      targetType: 'PROCUREMENT',
      targetId: procurementId,
      summary: `Прийнято на склад «${warehouse.name}» (${receiptLines.length} поз.)`,
    });
  }

  private async findOrCreateWarehouse(foundationId: string, name: string) {
    const existing = await this.warehouses.findByName(foundationId, name);
    return existing ?? this.warehouses.create({ foundationId, name });
  }
}
