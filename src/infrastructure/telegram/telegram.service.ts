import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/types';

export interface TelegramHandler {
  register(bot: Telegraf<Context<Update>>): void;
}

@Injectable()
export class TelegramService implements OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf<Context<Update>> | null = null;
  private readonly token: string | undefined;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('bot.token');
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  registerAndLaunch(handlers: TelegramHandler[]): void {
    if (!this.token?.trim()) {
      this.logger.warn('BOT_TOKEN не задано — бот не запущено');
      return;
    }

    this.bot = new Telegraf(this.token);
    handlers.forEach((h) => h.register(this.bot!));
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

  async sendMessage(chatId: string | number, text: string): Promise<boolean> {
    if (!this.token?.trim()) {
      this.logger.warn('BOT_TOKEN не задано — повідомлення не відправлено');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        this.logger.error(`Telegram sendMessage failed: ${response.status} ${err}`);
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error('Telegram sendMessage error', error);
      return false;
    }
  }

  async sendVoice(
    chatId: string | number,
    audio: Buffer,
    filename = 'voice.ogg',
  ): Promise<boolean> {
    if (!this.token?.trim()) {
      this.logger.warn('BOT_TOKEN не задано — голосове не відправлено');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('chat_id', String(chatId));
      formData.append('voice', new Blob([new Uint8Array(audio)], { type: 'audio/ogg' }), filename);

      const response = await fetch(`${this.baseUrl}/sendVoice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        this.logger.error(`Telegram sendVoice failed: ${response.status} ${err}`);
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error('Telegram sendVoice error', error);
      return false;
    }
  }

  async sendAudio(
    chatId: string | number,
    audio: Buffer,
    filename = 'audio.ogg',
  ): Promise<boolean> {
    if (!this.token?.trim()) {
      this.logger.warn('BOT_TOKEN не задано — аудіо не відправлено');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('chat_id', String(chatId));
      formData.append('audio', new Blob([new Uint8Array(audio)], { type: 'audio/ogg' }), filename);

      const response = await fetch(`${this.baseUrl}/sendAudio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        this.logger.error(`Telegram sendAudio failed: ${response.status} ${err}`);
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error('Telegram sendAudio error', error);
      return false;
    }
  }
}
