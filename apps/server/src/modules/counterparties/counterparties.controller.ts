import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { CounterpartiesService } from './counterparties.service';
import { CreateCounterpartyDto } from './body/create-counterparty.dto';
import { UpdateCounterpartyDto } from './body/update-counterparty.dto';
import { CounterpartyResponse } from './responses/counterparty.response';
import { CounterpartyDetailResponse } from './responses/counterparty-detail.response';

@ApiTags('Counterparties')
@ApiBearerAuth()
@Controller('counterparties')
export class CounterpartiesController {
  constructor(private readonly counterparties: CounterpartiesService) {}

  @Get()
  @ApiOperation({ summary: 'Перелік контрагентів фонду' })
  @ApiOkResponse({ type: CounterpartyResponse, isArray: true })
  list(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<CounterpartyResponse[]> {
    return this.counterparties.list(actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Картка контрагента з пов’язаними операціями' })
  @ApiOkResponse({ type: CounterpartyDetailResponse })
  get(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<CounterpartyDetailResponse> {
    return this.counterparties.get(actor, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Створити контрагента (адмін, координатор)' })
  @ApiCreatedResponse({ type: CounterpartyResponse })
  create(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: CreateCounterpartyDto,
  ): Promise<CounterpartyResponse> {
    return this.counterparties.create(actor, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Оновити контрагента (адмін, координатор)' })
  @ApiOkResponse({ type: CounterpartyResponse })
  update(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateCounterpartyDto,
  ): Promise<CounterpartyResponse> {
    return this.counterparties.update(actor, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити контрагента (адмін, координатор)' })
  remove(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<void> {
    return this.counterparties.remove(actor, id);
  }
}
