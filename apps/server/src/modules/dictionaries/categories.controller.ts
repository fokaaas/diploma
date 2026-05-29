import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentFoundationUser } from '../../common/decorators/current-foundation-user.decorator';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { Role } from '../../generated/prisma/enums';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './body/create-category.dto';
import { CategoryResponse } from './responses/category.response';

@ApiTags('Dictionaries')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Категорії товарів фонду' })
  @ApiOkResponse({ type: CategoryResponse, isArray: true })
  list(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<CategoryResponse[]> {
    return this.categories.list(actor);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Створити категорію (адміністратор)' })
  @ApiCreatedResponse({ type: CategoryResponse })
  create(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categories.create(actor, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити категорію (адміністратор)' })
  remove(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<void> {
    return this.categories.remove(actor, id);
  }
}
