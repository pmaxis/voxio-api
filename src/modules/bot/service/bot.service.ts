import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/types';
import { StartHandler } from '@/modules/bot/handlers/start.handler';
import { AudioHandler } from '@/modules/bot/handlers/audio.handler';

interface BotHandler {
  register(bot: Telegraf<Context<Update>>): void;
}

type BotHandlerRegistry = BotHandler[];

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private bot: Telegraf<Context<Update>> | null = null;
  private readonly token: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly startHandler: StartHandler,
    private readonly audioHandler: AudioHandler,
  ) {
    this.token = this.configService.get<string>('bot.token');
  }

  private getHandlers(): BotHandlerRegistry {
    return [this.startHandler, this.audioHandler];
  }

  private registerHandlers(bot: Telegraf<Context<Update>>): void {
    this.getHandlers().forEach((h) => h.register(bot));
  }

  onModuleInit(): void {
    if (!this.token?.trim()) {
      this.logger.warn('BOT_TOKEN не задано — бот не запущено');
      return;
    }
    this.bot = new Telegraf(this.token);
    this.registerHandlers(this.bot);
    this.bot.launch().then(
      () => this.logger.log('Telegram бот запущено'),
      (err) => this.logger.error('Не вдалося запустити бота', err),
    );
  }

  onModuleDestroy(): void {
    if (this.bot) {
      this.bot.stop('NestJS shutdown');
    }
  }
}
