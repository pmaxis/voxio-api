import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { TelegramBotBootstrap } from './telegram-bot.bootstrap';
import { StartHandler } from './handlers/start.handler';
import { AudioHandler } from './handlers/audio.handler';
import { ClientsModule } from '@/modules/clients/clients.module';
import { CreditsModule } from '@/modules/credits/credits.module';
import { FilesModule } from '@/modules/files/files.module';
import { JobsModule } from '@/modules/jobs/jobs.module';

@Module({
  imports: [ConfigModule, ClientsModule, CreditsModule, FilesModule, forwardRef(() => JobsModule)],
  providers: [TelegramService, TelegramBotBootstrap, StartHandler, AudioHandler],
  exports: [TelegramService],
})
export class TelegramModule {}
