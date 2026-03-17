import { Module } from '@nestjs/common';
import { BotService } from '@/modules/bot/service/bot.service';
import { StartHandler } from '@/modules/bot/handlers/start.handler';
import { AudioHandler } from '@/modules/bot/handlers/audio.handler';
import { ClientsModule } from '@/modules/clients/clients.module';
import { FilesModule } from '@/modules/files/files.module';
import { SpeechModule } from '@/infrastructure/speech/speech.module';

@Module({
  imports: [ClientsModule, FilesModule, SpeechModule],
  providers: [BotService, StartHandler, AudioHandler],
  exports: [BotService],
})
export class BotModule {}
