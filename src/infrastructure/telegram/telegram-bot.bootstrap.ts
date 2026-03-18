import { Injectable, OnModuleInit } from '@nestjs/common';
import { TelegramService } from '@/infrastructure/telegram/telegram.service';
import { StartHandler } from '@/infrastructure/telegram/handlers/start.handler';
import { AudioHandler } from '@/infrastructure/telegram/handlers/audio.handler';

@Injectable()
export class TelegramBotBootstrap implements OnModuleInit {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly startHandler: StartHandler,
    private readonly audioHandler: AudioHandler,
  ) {}

  onModuleInit(): void {
    this.telegramService.registerAndLaunch([this.startHandler, this.audioHandler]);
  }
}
