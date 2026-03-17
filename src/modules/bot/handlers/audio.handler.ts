import { Injectable, Logger } from '@nestjs/common';
import type { Context, Telegraf } from 'telegraf';
import { Input } from 'telegraf';
import type { Update } from 'telegraf/types';
import { message } from 'telegraf/filters';
import { Message } from 'telegraf/types';
import { FilesService } from '@/modules/files/service/files.service';
import { FilesStorage } from '@/modules/files/storage/files.storage';
import { SpeechService } from '@/infrastructure/speech/speech.service';
import { FileType } from '@/infrastructure/database/generated/enums';
import type { UploadedFile } from '@/modules/files/types/uploaded-file.interface';

type VoiceMessage = Message.VoiceMessage;
type AudioMessage = Message.AudioMessage;

@Injectable()
export class AudioHandler {
  private readonly logger = new Logger(AudioHandler.name);

  constructor(
    private readonly filesService: FilesService,
    private readonly filesStorage: FilesStorage,
    private readonly speechService: SpeechService,
  ) {}

  register(bot: Telegraf<Context<Update>>): void {
    bot.on(message('voice'), (ctx) => this.handleAudio(ctx, 'voice'));
    bot.on(message('audio'), (ctx) => this.handleAudio(ctx, 'audio'));
  }

  private async handleAudio(ctx: Context<Update>, type: 'voice' | 'audio'): Promise<void> {
    const message = ctx.message as VoiceMessage | AudioMessage;
    const fileId = this.getFileId(message, type);
    const fileName = this.getFileName(message, type);

    if (!fileId) {
      await ctx.reply('Не вдалося отримати аудіо.');
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
        mimetype: this.getMimeType(message, type),
        buffer,
        size: buffer.length,
      };

      const file = await this.filesService.create(uploadedFile, {
        type: FileType.INPUT_AUDIO,
      });

      try {
        const absolutePath = this.filesStorage.getAbsolutePath(file.url);
        const { audio } = await this.speechService.process(absolutePath);

        const outputFile: UploadedFile = {
          fieldname: 'file',
          originalname: 'output.ogg',
          encoding: '7bit',
          mimetype: 'audio/ogg',
          buffer: audio,
          size: audio.length,
        };
        await this.filesService.create(outputFile, {
          type: FileType.OUTPUT_AUDIO,
        });

        const voiceInput = Input.fromBuffer(audio, 'voice.ogg');
        if (audio.length <= 1024 * 1024) {
          await ctx.replyWithVoice(voiceInput);
        } else {
          await ctx.replyWithAudio(voiceInput);
        }
      } catch (transcribeError) {
        this.logger.error('Помилка транскрипції', transcribeError);
        await ctx.reply('Аудіо збережено, але не вдалося розпізнати текст.');
        return;
      }
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
