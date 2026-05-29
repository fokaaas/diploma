import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class FundingAllocationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contributionId!: string;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0.01)
  allocatedAmount!: number;
}
