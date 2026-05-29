import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from '../../config/configuration';
import { generateToken } from '../../common/crypto';
import { ROLE_LABELS } from '../../common/role-labels';
import { EmailService } from '../../infrastructure/email/email.service';
import { Role } from '../../generated/prisma/enums';
import { FoundationRepository } from '../../infrastructure/database/repos/foundation.repo';
import type { CreateFoundationDto } from './body/create-foundation.dto';
import type { FoundationResponse } from './responses/foundation.response';
import type { FoundationSummaryResponse } from './responses/foundation-summary.response';

const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

type FoundationRecord = NonNullable<
  Awaited<ReturnType<FoundationRepository['findById']>>
>;
type FoundationSummaryRecord = Awaited<
  ReturnType<FoundationRepository['listSummaries']>
>[number];

@Injectable()
export class FoundationsService {
  constructor(
    private readonly foundations: FoundationRepository,
    private readonly email: EmailService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
  ) {}

  async create(dto: CreateFoundationDto): Promise<FoundationResponse> {
    const token = generateToken();
    const { foundation } = await this.foundations.createWithFirstAdmin({
      foundation: {
        name: dto.shortName,
        shortName: dto.shortName,
        legalName: dto.legalName,
        edrpou: dto.edrpou,
      },
      admin: { fullName: dto.adminFullName, email: dto.adminEmail },
      invitation: { token, expiresAt: new Date(Date.now() + INVITE_TTL_MS) },
    });

    await this.email.sendInvitation(dto.adminEmail, {
      recipientName: dto.adminFullName,
      foundationName: foundation.shortName,
      roleLabel: ROLE_LABELS[Role.ADMIN],
      inviterName: 'Адміністрація платформи',
      email: dto.adminEmail,
      acceptUrl: `${this.app.webAppUrl}/invite?token=${token}`,
    });

    return this.toResponse(foundation);
  }

  async getCurrent(foundationId: string): Promise<FoundationResponse> {
    const foundation = await this.foundations.findById(foundationId);
    if (!foundation) {
      throw new NotFoundException('Фонд не знайдено');
    }
    return this.toResponse(foundation);
  }

  async list(): Promise<FoundationSummaryResponse[]> {
    const records = await this.foundations.listSummaries();
    return records.map((record) => this.toSummary(record));
  }

  private toResponse(foundation: FoundationRecord): FoundationResponse {
    return {
      id: foundation.id,
      name: foundation.name,
      shortName: foundation.shortName,
      legalName: foundation.legalName,
      edrpou: foundation.edrpou,
      taxId: foundation.taxId,
      address: foundation.address,
      website: foundation.website,
      createdAt: foundation.createdAt,
    };
  }

  private toSummary(
    record: FoundationSummaryRecord,
  ): FoundationSummaryResponse {
    const admin = record.users.at(0);
    return {
      id: record.id,
      name: record.name,
      userCount: record._count.users,
      adminName: admin?.fullName,
      adminEmail: admin?.email,
      adminStatus: admin?.status,
      createdAt: record.createdAt,
    };
  }
}
