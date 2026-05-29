import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { ReportFormat, ReportKind } from '../../generated/prisma/enums';
import { ReportRepository } from '../../infrastructure/database/repos/report.repo';
import { FoundationRepository } from '../../infrastructure/database/repos/foundation.repo';
import { AuditLogRepository } from '../../infrastructure/database/repos/audit-log.repo';
import { FilesService } from '../files/files.service';
import { ReportBuilderService } from './report-builder.service';
import { PublicReportService } from './public-report.service';
import { writeReport } from './report-writers/write-report';
import { REPORT_TYPE_LABEL } from './data/report-table';
import type { PublicSnapshot } from './data/public-snapshot';
import type { GenerateReportDto } from './body/generate-report.dto';
import type { PublicReportDto } from './body/public-report.dto';
import type { ReportResponse } from './responses/report.response';
import type { PublicReportResponse } from './responses/public-report.response';

type ReportRecord = NonNullable<
  Awaited<ReturnType<ReportRepository['findByIdWithMeta']>>
>;

function endOfDay(date: string): Date {
  return new Date(`${date}T23:59:59.999`);
}

function formatRange(start: string, end: string): string {
  const fmt = (d: string) => d.split('-').reverse().join('.');
  return `${fmt(start)}–${fmt(end)}`;
}

function fileSlug(title: string): string {
  return title.replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 80) || 'report';
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly reports: ReportRepository,
    private readonly foundations: FoundationRepository,
    private readonly audits: AuditLogRepository,
    private readonly files: FilesService,
    private readonly builder: ReportBuilderService,
    private readonly publicReports: PublicReportService,
  ) {}

  async list(actor: UserPrincipal): Promise<ReportResponse[]> {
    const records = await this.reports.findManyByFoundation(actor.foundationId);
    return records.map((record) => this.toResponse(record));
  }

  async generate(
    actor: UserPrincipal,
    dto: GenerateReportDto,
  ): Promise<ReportResponse> {
    const start = new Date(dto.periodStart);
    const end = endOfDay(dto.periodEnd);
    const table = await this.builder.build(
      actor.foundationId,
      dto.type,
      start,
      end,
      dto.dimensions,
    );
    const title = `${REPORT_TYPE_LABEL[dto.type]} · ${formatRange(dto.periodStart, dto.periodEnd)}`;
    const report = await this.reports.create({
      foundationId: actor.foundationId,
      title,
      kind: ReportKind.INTERNAL,
      format: dto.format,
      periodStart: start,
      periodEnd: new Date(dto.periodEnd),
      generatedById: actor.sub,
      isPublished: false,
      publishedAt: null,
      publicSlug: null,
      snapshot: table,
    });
    const rendered = await writeReport(dto.format, title, table);
    await this.files.store({
      foundationId: actor.foundationId,
      reportId: report.id,
      uploadedById: actor.sub,
      originalName: `${fileSlug(title)}.${rendered.ext}`,
      mimeType: rendered.mimeType,
      data: rendered.buffer,
    });
    await this.audit(
      actor,
      report.id,
      `Сформовано звіт (${dto.format})`,
      title,
    );
    const full = await this.reports.findByIdWithMeta(report.id);
    return this.toResponse(full!);
  }

  async previewPublic(
    actor: UserPrincipal,
    dto: PublicReportDto,
  ): Promise<PublicReportResponse> {
    const snapshot = await this.publicReports.compute(
      actor.foundationId,
      new Date(dto.periodStart),
      endOfDay(dto.periodEnd),
      dto.sections,
    );
    const foundation = await this.foundations.findById(actor.foundationId);
    return {
      foundationName: foundation?.name ?? '',
      periodStart: dto.periodStart,
      periodEnd: dto.periodEnd,
      snapshot,
    };
  }

  async publishPublic(
    actor: UserPrincipal,
    dto: PublicReportDto,
  ): Promise<{ slug: string }> {
    const snapshot = await this.publicReports.compute(
      actor.foundationId,
      new Date(dto.periodStart),
      endOfDay(dto.periodEnd),
      dto.sections,
    );
    const slug = randomUUID();
    const title = `Публічний звіт · ${formatRange(dto.periodStart, dto.periodEnd)}`;
    const report = await this.reports.create({
      foundationId: actor.foundationId,
      title,
      kind: ReportKind.PUBLIC,
      format: ReportFormat.HTML,
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      generatedById: actor.sub,
      isPublished: true,
      publishedAt: new Date(),
      publicSlug: slug,
      snapshot,
    });
    await this.audit(actor, report.id, 'Опубліковано звіт', title);
    return { slug };
  }

  async getPublic(slug: string): Promise<PublicReportResponse> {
    const report = await this.reports.findBySlug(slug);
    if (!report || !report.isPublished) {
      throw new NotFoundException('Звіт не знайдено');
    }
    return {
      foundationName: report.foundation.name,
      periodStart: report.periodStart.toISOString(),
      periodEnd: report.periodEnd.toISOString(),
      snapshot: report.snapshot as PublicSnapshot,
    };
  }

  private audit(
    actor: UserPrincipal,
    reportId: string,
    action: string,
    summary: string,
  ) {
    return this.audits.create({
      foundationId: actor.foundationId,
      actorId: actor.sub,
      action,
      targetType: 'REPORT',
      targetId: reportId,
      summary,
    });
  }

  private toResponse(record: ReportRecord): ReportResponse {
    return {
      id: record.id,
      title: record.title,
      kind: record.kind,
      format: record.format,
      periodStart: record.periodStart.toISOString(),
      periodEnd: record.periodEnd.toISOString(),
      createdAt: record.createdAt.toISOString(),
      generatedByName: record.generatedBy.fullName,
      sizeBytes: record.files[0]?.sizeBytes ?? 0,
      isPublished: record.isPublished,
      fileId: record.files[0]?.id ?? null,
      publicSlug: record.publicSlug,
    };
  }
}
