import { Module } from '@nestjs/common';
import { BotService } from '@/modules/bot/service/bot.service';
import { StartHandler } from '@/modules/bot/handlers/start.handler';
import { ClientsModule } from '@/modules/clients/clients.module';

@Module({
  imports: [ClientsModule],
  providers: [BotService, StartHandler],
  exports: [BotService],
})
export class BotModule {}
