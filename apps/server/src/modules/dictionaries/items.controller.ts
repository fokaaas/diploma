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
import { ItemsService } from './items.service';
import { CreateItemDto } from './body/create-item.dto';
import { ItemResponse } from './responses/item.response';

@ApiTags('Dictionaries')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Номенклатура товарів фонду' })
  @ApiOkResponse({ type: ItemResponse, isArray: true })
  list(@CurrentFoundationUser() actor: UserPrincipal): Promise<ItemResponse[]> {
    return this.items.list(actor);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Додати позицію номенклатури (адміністратор)' })
  @ApiCreatedResponse({ type: ItemResponse })
  create(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: CreateItemDto,
  ): Promise<ItemResponse> {
    return this.items.create(actor, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити позицію (адміністратор)' })
  remove(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<void> {
    return this.items.remove(actor, id);
  }
}
