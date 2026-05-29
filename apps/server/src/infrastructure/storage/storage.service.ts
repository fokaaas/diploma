import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { uploadConfig } from '../../config/configuration';

function sanitize(name: string): string {
  return name.replace(/[^\p{L}\p{N}.\-_ ]+/gu, '_').slice(0, 120) || 'file';
}

@Injectable()
export class LocalStorageService {
  private readonly root: string;

  constructor(
    @Inject(uploadConfig.KEY)
    config: ConfigType<typeof uploadConfig>,
  ) {
    this.root = resolve(config.uploadDir);
  }

  async save(
    foundationId: string,
    requestId: string,
    originalName: string,
    data: Buffer,
  ): Promise<string> {
    const relativePath = join(
      foundationId,
      'requests',
      requestId,
      `${randomUUID()}__${sanitize(originalName)}`,
    );
    const absolute = join(this.root, relativePath);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, data);
    return relativePath;
  }

  absolutePath(storagePath: string): string {
    return join(this.root, storagePath);
  }

  async remove(storagePath: string): Promise<void> {
    try {
      await unlink(this.absolutePath(storagePath));
    } catch {
      // file already gone — nothing to clean up
    }
  }
}
