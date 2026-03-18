import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Context, Telegraf } from 'telegraf';
import type { Update } from 'telegraf/types';
import { message } from 'telegraf/filters';
import { Message } from 'telegraf/types';
import { ClientsService } from '@/modules/clients/service/clients.service';
import { CreditsService } from '@/modules/credits/service/credits.service';
import { FilesService } from '@/modules/files/service/files.service';
import { JobsService } from '@/modules/jobs/service/jobs.service';
import {
  AUDIO_QUEUE_CLIENT,
  type AudioQueueClient,
} from '@/common/queue/audio-transcription.types';
import { FileType } from '@/infrastructure/database/generated/enums';
import { JobStatus } from '@/infrastructure/database/generated/enums';
import type { UploadedFile } from '@/modules/files/types/uploaded-file.interface';

type VoiceMessage = Message.VoiceMessage;
type AudioMessage = Message.AudioMessage;

@Injectable()
export class AudioHandler {
  private readonly logger = new Logger(AudioHandler.name);

  constructor(
    private readonly clientsService: ClientsService,
    private readonly creditsService: CreditsService,
    private readonly filesService: FilesService,
    private readonly jobsService: JobsService,
    @Inject(AUDIO_QUEUE_CLIENT) private readonly audioQueue: AudioQueueClient,
  ) {}

  register(bot: Telegraf<Context<Update>>): void {
    bot.on(message('voice'), (ctx) => this.handleAudio(ctx, 'voice'));
    bot.on(message('audio'), (ctx) => this.handleAudio(ctx, 'audio'));
  }

  private async handleAudio(ctx: Context<Update>, type: 'voice' | 'audio'): Promise<void> {
    const msg = ctx.message as VoiceMessage | AudioMessage;
    const chatId = ctx.chat?.id;
    if (chatId === undefined) {
      return;
    }
    const telegramId = String(ctx.from?.id);
    const fileId = this.getFileId(msg, type);
    const fileName = this.getFileName(msg, type);
    const duration = this.getDuration(msg, type);

    if (!fileId) {
      await ctx.reply('Не вдалося отримати аудіо.');
      return;
    }

    const client = await this.clientsService.findByTelegramId(telegramId);
    if (!client) {
      await ctx.reply('Спочатку натисніть /start для реєстрації.');
      return;
    }

    const seconds = Math.max(1, duration ?? 1);
    const balance = await this.creditsService.getBalance(client.id);
    if (balance < seconds) {
      await ctx.reply(`Недостатньо секунд. Залишилось: ${balance}. Потрібно: ${seconds}.`);
      return;
    }

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const buffer = await this.downloadFile(fileLink.href);

      if (!buffer || buffer.length === 0) {
        throw new Error('Отримано порожній файл');
      }

      const uploadedFile: UploadedFile = {
        fieldname: 'file',
        originalname: fileName,
        encoding: '7bit',
        mimetype: this.getMimeType(msg, type),
        buffer,
        size: buffer.length,
      };

      const inputFile = await this.filesService.create(uploadedFile, {
        type: FileType.INPUT_AUDIO,
      });

      const job = await this.jobsService.create({
        clientId: client.id,
        status: JobStatus.QUEUED,
        inputFileId: inputFile.id,
      });

      await this.audioQueue.addToAudioQueue({
        jobId: job.id,
        chatId,
        inputFileId: inputFile.id,
        clientId: client.id,
        durationSeconds: seconds,
      });

      await ctx.reply('Аудіо в черзі на обробку. Ми повідомимо вас коли буде готово.');
    } catch (error) {
      this.logger.error('Помилка завантаження аудіо', error);
      await ctx.reply('Не вдалося зберегти аудіо. Спробуйте пізніше.');
    }
  }

  private async downloadFile(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Не вдалося завантажити файл: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private getFileId(message: VoiceMessage | AudioMessage, type: string): string | undefined {
    switch (type) {
      case 'voice':
        return (message as VoiceMessage).voice.file_id;
      case 'audio':
        return (message as AudioMessage).audio.file_id;
      default:
        return undefined;
    }
  }

  private getDuration(message: VoiceMessage | AudioMessage, type: string): number | undefined {
    switch (type) {
      case 'voice':
        return (message as VoiceMessage).voice?.duration;
      case 'audio':
        return (message as AudioMessage).audio?.duration;
      default:
        return undefined;
    }
  }

  private getFileName(message: VoiceMessage | AudioMessage, type: string): string {
    switch (type) {
      case 'voice':
        return 'voice.ogg';
      case 'audio':
        return (message as AudioMessage).audio.file_name ?? 'audio.mp3';
      default:
        return 'file';
    }
  }

  private getMimeType(message: VoiceMessage | AudioMessage, type: string): string {
    switch (type) {
      case 'voice':
        return 'audio/ogg';
      case 'audio':
        return (message as AudioMessage).audio.mime_type ?? 'audio/mpeg';
      default:
        return 'application/octet-stream';
    }
  }
}
