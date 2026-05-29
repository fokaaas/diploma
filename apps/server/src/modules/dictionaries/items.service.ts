import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prismaErrorCode } from '../../common/prisma-error';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { ItemRepository } from '../../infrastructure/database/repos/item.repo';
import { CategoryRepository } from '../../infrastructure/database/repos/category.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import type { CreateItemDto } from './body/create-item.dto';
import type { ItemResponse } from './responses/item.response';

type ItemRecord = Awaited<
  ReturnType<ItemRepository['findManyByFoundation']>
>[number];

@Injectable()
export class ItemsService {
  constructor(
    private readonly items: ItemRepository,
    private readonly categories: CategoryRepository,
    private readonly audits: AuditLogRepository,
  ) {}

  async list(actor: UserPrincipal): Promise<ItemResponse[]> {
    const records = await this.items.findManyByFoundation(actor.foundationId);
    return records.map((item) => this.toResponse(item));
  }

  async create(
    actor: UserPrincipal,
    dto: CreateItemDto,
  ): Promise<ItemResponse> {
    const category = await this.categories.findById(dto.categoryId);
    if (!category || category.foundationId !== actor.foundationId) {
      throw new BadRequestException('Невідома категорія');
    }
    try {
      const item = await this.items.create({
        foundationId: actor.foundationId,
        categoryId: dto.categoryId,
        sku: dto.sku,
        name: dto.name,
        unit: dto.unit,
        minStock: dto.minStock ?? 0,
        lastPrice: dto.lastPrice ?? null,
      });
      await this.audit(actor, 'Додано позицію', item.id, item.sku);
      return this.toResponse({ ...item, category });
    } catch (error) {
      if (prismaErrorCode(error) === 'P2002') {
        throw new ConflictException('Позиція з таким SKU вже існує');
      }
      throw error;
    }
  }

  async remove(actor: UserPrincipal, id: string): Promise<void> {
    const item = await this.items.findById(id);
    if (!item || item.foundationId !== actor.foundationId) {
      throw new NotFoundException('Позицію не знайдено');
    }
    try {
      await this.items.delete(id);
    } catch (error) {
      if (prismaErrorCode(error) === 'P2003') {
        throw new BadRequestException(
          'Позицію не можна видалити — вона використовується в операціях',
        );
      }
      throw error;
    }
    await this.audit(actor, 'Видалено позицію', id, item.sku);
  }

  private audit(
    actor: UserPrincipal,
    action: string,
    itemId: string,
    summary: string,
  ) {
    return this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action,
      targetType: 'ITEM',
      targetId: itemId,
      summary,
    });
  }

  private toResponse(item: ItemRecord): ItemResponse {
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      unit: item.unit,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      minStock: item.minStock,
      lastPrice: item.lastPrice === null ? null : Number(item.lastPrice),
    };
  }
}
