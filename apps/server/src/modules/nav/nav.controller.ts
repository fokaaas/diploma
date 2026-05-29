import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentFoundationUser } from '../../common/decorators/current-foundation-user.decorator';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { NavService } from './nav.service';
import { NavCountsResponse } from './responses/nav-counts.response';

@ApiTags('Nav')
@ApiBearerAuth()
@Controller('nav')
export class NavController {
  constructor(private readonly nav: NavService) {}

  @Get('counts')
  @ApiOperation({ summary: 'Лічильники бічної навігації фонду' })
  @ApiOkResponse({ type: NavCountsResponse })
  counts(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<NavCountsResponse> {
    return this.nav.counts(actor);
  }
}
