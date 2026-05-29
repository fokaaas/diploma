import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { ReportsController } from './reports.controller';
import { PublicReportController } from './public-report.controller';
import { ReportsService } from './reports.service';
import { ReportBuilderService } from './report-builder.service';
import { PublicReportService } from './public-report.service';

@Module({
  imports: [FilesModule],
  controllers: [ReportsController, PublicReportController],
  providers: [ReportsService, ReportBuilderService, PublicReportService],
})
export class ReportsModule {}
