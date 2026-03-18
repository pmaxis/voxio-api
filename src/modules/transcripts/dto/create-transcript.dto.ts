import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTranscriptDto {
  @IsString()
  @IsNotEmpty()
  originalText: string;

  @IsString()
  @IsOptional()
  translatedText?: string | null;

  @IsString()
  @IsNotEmpty()
  jobId: string;
}
