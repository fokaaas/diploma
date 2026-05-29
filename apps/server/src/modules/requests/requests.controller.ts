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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './body/create-request.dto';
import { UpdateRequestDto } from './body/update-request.dto';
import { ChangeStatusDto } from './body/change-status.dto';
import { RequestResponse } from './responses/request.response';
import { RequestDetailResponse } from './responses/request-detail.response';

@ApiTags('Requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Перелік заявок фонду' })
  @ApiOkResponse({ type: RequestResponse, isArray: true })
  list(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<RequestResponse[]> {
    return this.requests.list(actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Картка заявки' })
  @ApiOkResponse({ type: RequestDetailResponse })
  get(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<RequestDetailResponse> {
    return this.requests.get(actor, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Створити заявку (адмін, координатор)' })
  @ApiCreatedResponse({ type: RequestDetailResponse })
  create(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: CreateRequestDto,
  ): Promise<RequestDetailResponse> {
    return this.requests.create(actor, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Оновити заявку (адмін, координатор)' })
  @ApiOkResponse({ type: RequestDetailResponse })
  update(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
  ): Promise<RequestDetailResponse> {
    return this.requests.update(actor, id, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Змінити статус заявки (адмін, координатор)' })
  @ApiOkResponse({ type: RequestDetailResponse })
  changeStatus(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ): Promise<RequestDetailResponse> {
    return this.requests.changeStatus(actor, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити заявку (адмін, координатор)' })
  remove(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<void> {
    return this.requests.remove(actor, id);
  }

  @Post(':id/files')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Додати вкладення до заявки (адмін, координатор)' })
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
    return this.requests.addFile(actor, id, {
      originalName: file.filename,
      mimeType: file.mimetype,
      data,
    });
  }
}
