import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { JobStatus } from '@/infrastructure/database/generated/enums';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @IsString()
  @IsOptional()
  inputFileId?: string;
}
