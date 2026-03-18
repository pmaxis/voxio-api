import { Module } from '@nestjs/common';
import { BotService } from '@/modules/bot/service/bot.service';
import { StartHandler } from '@/modules/bot/handlers/start.handler';
import { AudioHandler } from '@/modules/bot/handlers/audio.handler';
import { ClientsModule } from '@/modules/clients/clients.module';
import { CreditsModule } from '@/modules/credits/credits.module';
import { FilesModule } from '@/modules/files/files.module';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { TranscriptsModule } from '@/modules/transcripts/transcripts.module';
import { SpeechModule } from '@/infrastructure/speech/speech.module';

@Module({
  imports: [ClientsModule, CreditsModule, FilesModule, JobsModule, TranscriptsModule, SpeechModule],
  providers: [BotService, StartHandler, AudioHandler],
  exports: [BotService],
})
export class BotModule {}
