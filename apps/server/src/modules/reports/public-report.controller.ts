import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ReportsService } from './reports.service';
import { PublicReportResponse } from './responses/public-report.response';

@ApiTags('Reports')
@Controller('public/reports')
export class PublicReportController {
  constructor(private readonly reports: ReportsService) {}

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Опублікований звіт фонду (публічний)' })
  @ApiOkResponse({ type: PublicReportResponse })
  get(@Param('slug') slug: string): Promise<PublicReportResponse> {
    return this.reports.getPublic(slug);
  }
}
