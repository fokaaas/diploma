import { ApiProperty } from '@nestjs/swagger';
import { FileKind } from '../../../generated/prisma/enums';

export class FileResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  originalName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  sizeBytes!: number;

  @ApiProperty({ enum: FileKind })
  kind!: FileKind;

  @ApiProperty()
  createdAt!: string;
}
