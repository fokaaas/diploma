import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserPrincipal } from '../../common/data/authenticated-principal';
import { FileKind } from '../../generated/prisma/enums';
import { FileRepository } from '../../infrastructure/database/repos/file.repo';
import { LocalStorageService } from '../../infrastructure/storage/storage.service';
import type { FileResponse } from './responses/file.response';

export interface StoreFileParams {
  foundationId: string;
  uploadedById: string;
  originalName: string;
  mimeType: string;
  data: Buffer;
  requestId?: string;
  contributionId?: string;
  procurementId?: string;
}

export interface DownloadableFile {
  absolutePath: string;
  originalName: string;
  mimeType: string;
}

type FileRecord = Awaited<ReturnType<FileRepository['create']>>;

function kindFromMime(mime: string): FileKind {
  if (mime.startsWith('image/')) return FileKind.PHOTO;
  if (mime.startsWith('audio/')) return FileKind.VOICE;
  return FileKind.DOCUMENT;
}

function resolveTarget(params: StoreFileParams): {
  scope: string;
  ownerId: string;
} {
  if (params.requestId) return { scope: 'requests', ownerId: params.requestId };
  if (params.contributionId)
    return { scope: 'contributions', ownerId: params.contributionId };
  if (params.procurementId)
    return { scope: 'procurements', ownerId: params.procurementId };
  return { scope: 'misc', ownerId: 'misc' };
}

export function toFileResponse(file: FileRecord): FileResponse {
  return {
    id: file.id,
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    kind: file.kind,
    createdAt: file.createdAt.toISOString(),
  };
}

@Injectable()
export class FilesService {
  constructor(
    private readonly files: FileRepository,
    private readonly storage: LocalStorageService,
  ) {}

  async store(params: StoreFileParams): Promise<FileResponse> {
    const target = resolveTarget(params);
    const storagePath = await this.storage.save(
      params.foundationId,
      target.scope,
      target.ownerId,
      params.originalName,
      params.data,
    );
    const file = await this.files.create({
      foundationId: params.foundationId,
      originalName: params.originalName,
      storagePath,
      mimeType: params.mimeType,
      sizeBytes: params.data.length,
      kind: kindFromMime(params.mimeType),
      uploadedById: params.uploadedById,
      requestId: params.requestId ?? null,
      contributionId: params.contributionId ?? null,
      procurementId: params.procurementId ?? null,
    });
    return toFileResponse(file);
  }

  async download(actor: UserPrincipal, id: string): Promise<DownloadableFile> {
    const file = await this.ensureOwned(actor, id);
    return {
      absolutePath: this.storage.absolutePath(file.storagePath),
      originalName: file.originalName,
      mimeType: file.mimeType,
    };
  }

  async remove(actor: UserPrincipal, id: string): Promise<void> {
    const file = await this.ensureOwned(actor, id);
    await this.storage.remove(file.storagePath);
    await this.files.delete(id);
  }

  async purgeForRequest(requestId: string): Promise<void> {
    const files = await this.files.findManyByRequest(requestId);
    await Promise.all(
      files.map((file) => this.storage.remove(file.storagePath)),
    );
  }

  async purgeForContribution(contributionId: string): Promise<void> {
    const files = await this.files.findManyByContribution(contributionId);
    await Promise.all(
      files.map((file) => this.storage.remove(file.storagePath)),
    );
  }

  async purgeForProcurement(procurementId: string): Promise<void> {
    const files = await this.files.findManyByProcurement(procurementId);
    await Promise.all(
      files.map((file) => this.storage.remove(file.storagePath)),
    );
  }

  private async ensureOwned(
    actor: UserPrincipal,
    id: string,
  ): Promise<FileRecord> {
    const file = await this.files.findById(id);
    if (!file || file.foundationId !== actor.foundationId) {
      throw new NotFoundException('Файл не знайдено');
    }
    return file;
  }
}
