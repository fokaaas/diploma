import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
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
import { FoundationsService } from './foundations.service';
import { UpdateFoundationDto } from './body/update-foundation.dto';
import { FoundationResponse } from './responses/foundation.response';

@ApiTags('Foundation')
@ApiBearerAuth()
@Controller('foundation')
export class FoundationProfileController {
  constructor(private readonly foundations: FoundationsService) {}

  @Get()
  @ApiOperation({ summary: 'Реквізити фонду поточного користувача' })
  @ApiOkResponse({ type: FoundationResponse })
  getCurrent(
    @CurrentFoundationUser() user: UserPrincipal,
  ): Promise<FoundationResponse> {
    return this.foundations.getCurrent(user.foundationId);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Оновити реквізити фонду (тільки адміністратор)' })
  @ApiOkResponse({ type: FoundationResponse })
  update(
    @CurrentFoundationUser() user: UserPrincipal,
    @Body() dto: UpdateFoundationDto,
  ): Promise<FoundationResponse> {
    return this.foundations.update(user, dto);
  }
}
