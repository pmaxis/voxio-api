import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { JobStatus } from '@/infrastructure/database/generated/enums';

export class UpdateJobDto {
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  inputFileId?: string;

  @IsString()
  @IsOptional()
  outputFileId?: string;
}
