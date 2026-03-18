import { IsOptional, IsString } from 'class-validator';

export class UpdateTranscriptDto {
  @IsString()
  @IsOptional()
  originalText?: string;

  @IsString()
  @IsOptional()
  translatedText?: string | null;
}
