import { IsOptional, IsString } from 'class-validator';

export class UpdateCreditDto {
  @IsString()
  @IsOptional()
  jobId?: string | null;
}
