import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentFoundationUser } from '../../common/decorators/current-foundation-user.decorator';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { FoundationsService } from './foundations.service';
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
}
