import { IsEnum, IsInt, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { CreditType } from '@/infrastructure/database/generated/enums';

export class CreateCreditDto {
  @IsInt()
  @IsNotEmpty()
  amount: number;

  @IsEnum(CreditType)
  @IsNotEmpty()
  type: CreditType;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsOptional()
  jobId?: string;
}
