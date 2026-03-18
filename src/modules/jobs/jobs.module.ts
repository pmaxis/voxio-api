import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { JobsController } from '@/modules/jobs/controller/jobs.controller';
import { JobsRepository } from '@/modules/jobs/repository/jobs.repository';
import { JobsService } from '@/modules/jobs/service/jobs.service';
import { AudioTranscriptionProcessor } from '@/modules/jobs/processor/audio-transcription.processor';
import { AUDIO_TRANSCRIPTION_QUEUE } from '@/modules/jobs/processor/audio-transcription.processor';
import { AUDIO_QUEUE_CLIENT } from '@/common/queue/audio-transcription.types';
import { FilesModule } from '@/modules/files/files.module';
import { TranscriptsModule } from '@/modules/transcripts/transcripts.module';
import { CreditsModule } from '@/modules/credits/credits.module';
import { SpeechModule } from '@/infrastructure/speech/speech.module';
import { TelegramModule } from '@/infrastructure/telegram/telegram.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: AUDIO_TRANSCRIPTION_QUEUE }),
    FilesModule,
    TranscriptsModule,
    CreditsModule,
    SpeechModule,
    forwardRef(() => TelegramModule),
  ],
  controllers: [JobsController],
  providers: [
    JobsRepository,
    JobsService,
    { provide: AUDIO_QUEUE_CLIENT, useExisting: JobsService },
    AudioTranscriptionProcessor,
  ],
  exports: [JobsService, AUDIO_QUEUE_CLIENT],
})
export class JobsModule {}
