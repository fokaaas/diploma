import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentFoundationUser } from '../../common/decorators/current-foundation-user.decorator';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { Role } from '../../generated/prisma/enums';
import { FileResponse } from '../files/responses/file.response';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './body/create-contribution.dto';
import { UpdateContributionDto } from './body/update-contribution.dto';
import { ContributionResponse } from './responses/contribution.response';
import { ContributionDetailResponse } from './responses/contribution-detail.response';

@ApiTags('Contributions')
@ApiBearerAuth()
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributions: ContributionsService) {}

  @Get()
  @ApiOperation({ summary: 'Перелік благодійних внесків' })
  @ApiOkResponse({ type: ContributionResponse, isArray: true })
  list(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<ContributionResponse[]> {
    return this.contributions.list(actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Картка внеску' })
  @ApiOkResponse({ type: ContributionDetailResponse })
  get(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<ContributionDetailResponse> {
    return this.contributions.get(actor, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Зареєструвати внесок (адмін, бухгалтер)' })
  @ApiCreatedResponse({ type: ContributionDetailResponse })
  create(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: CreateContributionDto,
  ): Promise<ContributionDetailResponse> {
    return this.contributions.create(actor, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Оновити внесок (адмін, бухгалтер)' })
  @ApiOkResponse({ type: ContributionDetailResponse })
  update(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateContributionDto,
  ): Promise<ContributionDetailResponse> {
    return this.contributions.update(actor, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити внесок (адмін, бухгалтер)' })
  remove(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<void> {
    return this.contributions.remove(actor, id);
  }

  @Post(':id/files')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Додати документ до внеску (адмін, бухгалтер)' })
  @ApiCreatedResponse({ type: FileResponse })
  async upload(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
    @Req() req: FastifyRequest,
  ): Promise<FileResponse> {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('Файл не надіслано');
    }
    const data = await file.toBuffer();
    return this.contributions.addFile(actor, id, {
      originalName: file.filename,
      mimeType: file.mimetype,
      data,
    });
  }
}
