import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prismaErrorCode } from '../../common/prisma-error';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { CategoryRepository } from '../../infrastructure/database/repos/category.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import type { CreateCategoryDto } from './body/create-category.dto';
import type { CategoryResponse } from './responses/category.response';

type CategoryRecord = Awaited<ReturnType<CategoryRepository['create']>>;

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly audits: AuditLogRepository,
  ) {}

  async list(actor: UserPrincipal): Promise<CategoryResponse[]> {
    const records = await this.categories.findManyByFoundation(
      actor.foundationId,
    );
    return records.map((category) => this.toResponse(category));
  }

  async create(
    actor: UserPrincipal,
    dto: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    try {
      const category = await this.categories.create({
        foundationId: actor.foundationId,
        name: dto.name,
      });
      await this.audit(actor, 'Додано категорію', category.id, category.name);
      return this.toResponse(category);
    } catch (error) {
      if (prismaErrorCode(error) === 'P2002') {
        throw new ConflictException('Категорія з такою назвою вже існує');
      }
      throw error;
    }
  }

  async remove(actor: UserPrincipal, id: string): Promise<void> {
    const category = await this.categories.findById(id);
    if (!category || category.foundationId !== actor.foundationId) {
      throw new NotFoundException('Категорію не знайдено');
    }
    try {
      await this.categories.delete(id);
    } catch (error) {
      if (prismaErrorCode(error) === 'P2003') {
        throw new BadRequestException(
          'Не можна видалити категорію, що містить позиції',
        );
      }
      throw error;
    }
    await this.audit(actor, 'Видалено категорію', id, category.name);
  }

  private audit(
    actor: UserPrincipal,
    action: string,
    categoryId: string,
    summary: string,
  ) {
    return this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action,
      targetType: 'CATEGORY',
      targetId: categoryId,
      summary,
    });
  }

  private toResponse(category: CategoryRecord): CategoryResponse {
    return { id: category.id, name: category.name };
  }
}
