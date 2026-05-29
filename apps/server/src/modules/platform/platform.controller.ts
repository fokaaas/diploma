import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';
import type { AuthenticatedPrincipal } from '../../common/data/authenticated-principal';
import { MessageResponse } from '../../common/data/message.response';
import { AuthTokensResponse } from '../auth/responses/auth-tokens.response';
import { RefreshDto } from '../auth/body/refresh.dto';
import { PlatformService } from './platform.service';
import { PlatformLoginDto } from './body/platform-login.dto';
import { PlatformAdminResponse } from './responses/platform-admin.response';
import { PlatformSessionResponse } from './responses/platform-session.response';

@ApiTags('Platform')
@Controller('platform/auth')
export class PlatformController {
  constructor(private readonly platform: PlatformService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вхід суперадміністратора платформи' })
  @ApiOkResponse({ type: PlatformSessionResponse })
  login(@Body() dto: PlatformLoginDto): Promise<PlatformSessionResponse> {
    return this.platform.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Оновити токени платформи' })
  @ApiOkResponse({ type: AuthTokensResponse })
  refresh(@Body() dto: RefreshDto): Promise<AuthTokensResponse> {
    return this.platform.refresh(dto);
  }

  @ApiBearerAuth()
  @UseGuards(PlatformGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вихід суперадміністратора' })
  @ApiOkResponse({ type: MessageResponse })
  logout(@Body() dto: RefreshDto): Promise<MessageResponse> {
    return this.platform.logout(dto);
  }

  @ApiBearerAuth()
  @UseGuards(PlatformGuard)
  @Get('me')
  @ApiOperation({ summary: 'Поточний суперадміністратор' })
  @ApiOkResponse({ type: PlatformAdminResponse })
  me(
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<PlatformAdminResponse> {
    return this.platform.getProfile(principal.sub);
  }
}
