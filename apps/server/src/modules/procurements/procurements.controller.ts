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
import { ProcurementsService } from './procurements.service';
import { GoodsReceiptService } from './goods-receipt.service';
import { CreateProcurementDto } from './body/create-procurement.dto';
import { UpdateProcurementDto } from './body/update-procurement.dto';
import { ChangeStatusDto } from './body/change-status.dto';
import { ReceiveProcurementDto } from './body/receive-procurement.dto';
import { ProcurementResponse } from './responses/procurement.response';
import { ProcurementDetailResponse } from './responses/procurement-detail.response';

@ApiTags('Procurements')
@ApiBearerAuth()
@Controller('procurements')
export class ProcurementsController {
  constructor(
    private readonly procurements: ProcurementsService,
    private readonly goodsReceipts: GoodsReceiptService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Перелік закупівель' })
  @ApiOkResponse({ type: ProcurementResponse, isArray: true })
  list(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<ProcurementResponse[]> {
    return this.procurements.list(actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Картка закупівлі' })
  @ApiOkResponse({ type: ProcurementDetailResponse })
  get(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<ProcurementDetailResponse> {
    return this.procurements.get(actor, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Створити закупівлю' })
  @ApiCreatedResponse({ type: ProcurementDetailResponse })
  create(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: CreateProcurementDto,
  ): Promise<ProcurementDetailResponse> {
    return this.procurements.create(actor, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Оновити закупівлю' })
  @ApiOkResponse({ type: ProcurementDetailResponse })
  update(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateProcurementDto,
  ): Promise<ProcurementDetailResponse> {
    return this.procurements.update(actor, id, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Змінити статус закупівлі' })
  @ApiOkResponse({ type: ProcurementDetailResponse })
  changeStatus(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ): Promise<ProcurementDetailResponse> {
    return this.procurements.changeStatus(actor, id, dto);
  }

  @Post(':id/receive')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Прийняти закупівлю на склад' })
  @ApiOkResponse({ type: ProcurementDetailResponse })
  async receive(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: ReceiveProcurementDto,
  ): Promise<ProcurementDetailResponse> {
    await this.goodsReceipts.receive(actor, id, dto);
    return this.procurements.get(actor, id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.ACCOUNTANT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити закупівлю' })
  remove(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<void> {
    return this.procurements.remove(actor, id);
  }

  @Post(':id/files')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.ACCOUNTANT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Додати документ до закупівлі' })
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
    return this.procurements.addFile(actor, id, {
      originalName: file.filename,
      mimeType: file.mimetype,
      data,
    });
  }
}
