import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './body/generate-report.dto';
import { PublicReportDto } from './body/public-report.dto';
import { ReportResponse } from './responses/report.response';
import { PublicReportResponse } from './responses/public-report.response';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Раніше згенеровані звіти' })
  @ApiOkResponse({ type: ReportResponse, isArray: true })
  list(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<ReportResponse[]> {
    return this.reports.list(actor);
  }

  @Post('generate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Сформувати внутрішній звіт (адмін, бухгалтер)' })
  @ApiCreatedResponse({ type: ReportResponse })
  generate(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: GenerateReportDto,
  ): Promise<ReportResponse> {
    return this.reports.generate(actor, dto);
  }

  @Post('public/preview')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Попередній перегляд публічного звіту' })
  @ApiOkResponse({ type: PublicReportResponse })
  preview(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: PublicReportDto,
  ): Promise<PublicReportResponse> {
    return this.reports.previewPublic(actor, dto);
  }

  @Post('public/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Опублікувати публічний звіт' })
  @ApiOkResponse({ schema: { properties: { slug: { type: 'string' } } } })
  publish(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: PublicReportDto,
  ): Promise<{ slug: string }> {
    return this.reports.publishPublic(actor, dto);
  }
}
