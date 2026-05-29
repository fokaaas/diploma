import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { UsersService } from './users.service';
import { InviteUserDto } from './body/invite-user.dto';
import { UserResponse } from './responses/user.response';
import { InvitationResponse } from './responses/invitation.response';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('invitations')
  @ApiOperation({
    summary: 'Запросити користувача до фонду (тільки адміністратор)',
  })
  @ApiOkResponse({ type: InvitationResponse })
  invite(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Body() dto: InviteUserDto,
  ): Promise<InvitationResponse> {
    return this.users.invite(actor, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Список користувачів фонду' })
  @ApiOkResponse({ type: UserResponse, isArray: true })
  list(@CurrentFoundationUser() actor: UserPrincipal): Promise<UserResponse[]> {
    return this.users.list(actor);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Заблокувати користувача' })
  @ApiOkResponse({ type: UserResponse })
  block(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<UserResponse> {
    return this.users.setBlocked(actor, id, true);
  }

  @Patch(':id/unblock')
  @ApiOperation({ summary: 'Розблокувати користувача' })
  @ApiOkResponse({ type: UserResponse })
  unblock(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Param('id') id: string,
  ): Promise<UserResponse> {
    return this.users.setBlocked(actor, id, false);
  }
}
