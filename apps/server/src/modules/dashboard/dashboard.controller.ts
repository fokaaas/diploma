import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentFoundationUser } from '../../common/decorators/current-foundation-user.decorator';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { DashboardService } from './dashboard.service';
import { DashboardResponse } from './responses/dashboard.response';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Зведені показники фонду для дашборду' })
  @ApiQuery({ name: 'month', required: false, example: '2026-05' })
  @ApiOkResponse({ type: DashboardResponse })
  overview(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Query('month') month?: string,
  ): Promise<DashboardResponse> {
    return this.dashboard.overview(actor, month);
  }
}
