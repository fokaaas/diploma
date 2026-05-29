import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PlatformAdminRepository } from './repos/platform-admin.repo';
import { UserRepository } from './repos/user.repo';
import { InvitationRepository } from './repos/invitation.repo';
import { FoundationRepository } from './repos/foundation.repo';
import { RefreshTokenRepository } from './repos/refresh-token.repo';
import { PasswordResetRepository } from './repos/password-reset.repo';
import { CategoryRepository } from './repos/category.repo';
import { ItemRepository } from './repos/item.repo';
import { CounterpartyRepository } from './repos/counterparty.repo';
import { RequestRepository } from './repos/request.repo';
import { FileRepository } from './repos/file.repo';
import { AuditLogRepository } from './repos/audit-log.repo';
import { ContributionRepository } from './repos/contribution.repo';
import { ProcurementRepository } from './repos/procurement.repo';
import { WarehouseRepository } from './repos/warehouse.repo';
import { StockLevelRepository } from './repos/stock-level.repo';
import { StockMovementRepository } from './repos/stock-movement.repo';
import { GoodsReceiptRepository } from './repos/goods-receipt.repo';
import { IssuanceRepository } from './repos/issuance.repo';
import { ReportRepository } from './repos/report.repo';
import { ReportQueryRepository } from './repos/report-query.repo';

const repositories = [
  PlatformAdminRepository,
  UserRepository,
  InvitationRepository,
  FoundationRepository,
  RefreshTokenRepository,
  PasswordResetRepository,
  CategoryRepository,
  ItemRepository,
  CounterpartyRepository,
  RequestRepository,
  FileRepository,
  AuditLogRepository,
  ContributionRepository,
  ProcurementRepository,
  WarehouseRepository,
  StockLevelRepository,
  StockMovementRepository,
  GoodsReceiptRepository,
  IssuanceRepository,
  ReportRepository,
  ReportQueryRepository,
];

@Global()
@Module({
  providers: [PrismaService, ...repositories],
  exports: [PrismaService, ...repositories],
})
export class DatabaseModule {}
