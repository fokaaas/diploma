import { Controller, Get, UseGuards } from '@nestjs/common';
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
import { AuditService } from './audit.service';
import { AuditEntryResponse } from './responses/audit-entry.response';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Журнал змін фонду (адмін, аудитор)' })
  @ApiOkResponse({ type: AuditEntryResponse, isArray: true })
  list(
    @CurrentFoundationUser() actor: UserPrincipal,
  ): Promise<AuditEntryResponse[]> {
    return this.audit.list(actor);
  }
}
