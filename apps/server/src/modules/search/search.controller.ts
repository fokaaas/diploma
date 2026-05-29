import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentFoundationUser } from '../../common/decorators/current-foundation-user.decorator';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { SearchService } from './search.service';
import { SearchResultsResponse } from './responses/search-results.response';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Глобальний пошук по записах фонду' })
  @ApiQuery({ name: 'q', required: false, example: 'R-2026' })
  @ApiOkResponse({ type: SearchResultsResponse })
  query(
    @CurrentFoundationUser() actor: UserPrincipal,
    @Query('q') q = '',
  ): Promise<SearchResultsResponse> {
    return this.search.search(actor, q);
  }
}
