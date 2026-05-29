import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PlatformGuard } from '../../common/guards/platform.guard';
import { FoundationsService } from './foundations.service';
import { CreateFoundationDto } from './body/create-foundation.dto';
import { FoundationResponse } from './responses/foundation.response';
import { FoundationSummaryResponse } from './responses/foundation-summary.response';

@ApiTags('Foundations')
@ApiBearerAuth()
@UseGuards(PlatformGuard)
@Controller('platform/foundations')
export class FoundationsController {
  constructor(private readonly foundations: FoundationsService) {}

  @Post()
  @ApiOperation({ summary: 'Створити фонд і запросити першого адміністратора' })
  @ApiCreatedResponse({ type: FoundationResponse })
  create(@Body() dto: CreateFoundationDto): Promise<FoundationResponse> {
    return this.foundations.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Перелік фондів-клієнтів платформи' })
  @ApiOkResponse({ type: FoundationSummaryResponse, isArray: true })
  list(): Promise<FoundationSummaryResponse[]> {
    return this.foundations.list();
  }
}
