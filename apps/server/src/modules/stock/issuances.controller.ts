import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentFoundationUser } from '../../common/decorators/current-foundation-user.decorator';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { Role } from '../../generated/prisma/enums';
import { IssuancesService } from './issuances.service';
import { CreateIssuanceDto } from './body/create-issuance.dto';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('issuances')
export class IssuancesController {
  constructor(private readonly issuances: IssuancesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видача зі складу за заявкою (адмін, координатор)' })
  issue(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: CreateIssuanceDto,
  ): Promise<void> {
    return this.issuances.issue(actor, dto);
  }
}
