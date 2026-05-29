import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentFoundationUser } from '../../common/decorators/current-foundation-user.decorator';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { Role } from '../../generated/prisma/enums';
import { StockService } from './stock.service';
import { ManualReceiptDto } from './body/manual-receipt.dto';
import { StockLevelResponse } from './responses/stock-level.response';
import { MovementResponse } from './responses/movement.response';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly stock: StockService) {}

  @Get('levels')
  @ApiOperation({ summary: 'Залишки на складах' })
  @ApiOkResponse({ type: StockLevelResponse, isArray: true })
  levels(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<StockLevelResponse[]> {
    return this.stock.levels(actor);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Журнал руху ТМЦ' })
  @ApiOkResponse({ type: MovementResponse, isArray: true })
  movements(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<MovementResponse[]> {
    return this.stock.movementsLog(actor);
  }

  @Post('receipts')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ручний прийом на склад (адмін, координатор)' })
  receive(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: ManualReceiptDto,
  ): Promise<void> {
    return this.stock.receive(actor, dto);
  }
}
