import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedPrincipal } from '../../common/data/authenticated-principal';
import { MessageResponse } from '../../common/data/message.response';
import { AuthService } from './auth.service';
import { LoginDto } from './body/login.dto';
import { RefreshDto } from './body/refresh.dto';
import { AcceptInvitationDto } from './body/accept-invitation.dto';
import { ForgotPasswordDto } from './body/forgot-password.dto';
import { ResetPasswordDto } from './body/reset-password.dto';
import { ChangePasswordDto } from './body/change-password.dto';
import { AuthSessionResponse } from './responses/auth-session.response';
import { AuthTokensResponse } from './responses/auth-tokens.response';
import { SessionUserResponse } from './responses/session-user.response';
import { InvitationInfoResponse } from './responses/invitation-info.response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вхід користувача фонду (email + пароль)' })
  @ApiOkResponse({ type: AuthSessionResponse })
  login(@Body() dto: LoginDto): Promise<AuthSessionResponse> {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Оновити пару токенів за refresh-токеном' })
  @ApiOkResponse({ type: AuthTokensResponse })
  refresh(@Body() dto: RefreshDto): Promise<AuthTokensResponse> {
    return this.auth.refresh(dto);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вихід — відкликає переданий refresh-токен' })
  @ApiOkResponse({ type: MessageResponse })
  logout(@Body() dto: RefreshDto): Promise<MessageResponse> {
    return this.auth.logout(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Поточний користувач за access-токеном' })
  @ApiOkResponse({ type: SessionUserResponse })
  me(
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<SessionUserResponse> {
    return this.auth.getSession(principal.sub);
  }

  @Public()
  @Get('invitations/:token')
  @ApiOperation({
    summary: 'Деталі запрошення за токеном (для екрана прийняття)',
  })
  @ApiOkResponse({ type: InvitationInfoResponse })
  getInvitation(
    @Param('token') token: string,
  ): Promise<InvitationInfoResponse> {
    return this.auth.getInvitation(token);
  }

  @Public()
  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Прийняти запрошення: встановити пароль і активувати акаунт',
  })
  @ApiOkResponse({ type: AuthSessionResponse })
  acceptInvitation(
    @Param('token') token: string,
    @Body() dto: AcceptInvitationDto,
  ): Promise<AuthSessionResponse> {
    return this.auth.acceptInvitation(token, dto);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Запит на відновлення пароля (надсилає лист, якщо акаунт існує)',
  })
  @ApiOkResponse({ type: MessageResponse })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponse> {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Встановити новий пароль за токеном з листа' })
  @ApiOkResponse({ type: MessageResponse })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponse> {
    return this.auth.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Змінити власний пароль' })
  @ApiOkResponse({ type: MessageResponse })
  changePassword(
    @CurrentUser() principal: AuthenticatedPrincipal,
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponse> {
    return this.auth.changePassword(principal.sub, dto);
  }
}
