import { IsEnum } from 'class-validator';
import { FileType } from '@/infrastructure/database/generated/enums';

export class CreateFileDto {
  @IsEnum(FileType)
  type: FileType;
}
