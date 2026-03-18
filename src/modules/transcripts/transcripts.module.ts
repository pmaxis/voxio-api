import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { TranscriptsController } from '@/modules/transcripts/controller/transcripts.controller';
import { TranscriptsRepository } from '@/modules/transcripts/repository/transcripts.repository';
import { TranscriptsService } from '@/modules/transcripts/service/transcripts.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TranscriptsController],
  providers: [TranscriptsRepository, TranscriptsService],
  exports: [TranscriptsService],
})
export class TranscriptsModule {}
