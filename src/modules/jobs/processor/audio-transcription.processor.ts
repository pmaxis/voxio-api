import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobsRepository } from '@/modules/jobs/repository/jobs.repository';
import { FilesService } from '@/modules/files/service/files.service';
import { FilesStorage } from '@/modules/files/storage/files.storage';
import { TranscriptsService } from '@/modules/transcripts/service/transcripts.service';
import { CreditsService } from '@/modules/credits/service/credits.service';
import { SpeechService } from '@/infrastructure/speech/speech.service';
import { TelegramService } from '@/infrastructure/telegram/telegram.service';
import { JobStatus } from '@/infrastructure/database/generated/enums';
import { FileType } from '@/infrastructure/database/generated/enums';
import type { UploadedFile } from '@/modules/files/types/uploaded-file.interface';

import type { AudioTranscriptionPayload } from '@/common/queue/audio-transcription.types';

export const AUDIO_TRANSCRIPTION_QUEUE = 'audio-transcription';
export type { AudioTranscriptionPayload };

@Processor(AUDIO_TRANSCRIPTION_QUEUE)
export class AudioTranscriptionProcessor extends WorkerHost {
  private readonly logger = new Logger(AudioTranscriptionProcessor.name);

  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly filesService: FilesService,
    private readonly filesStorage: FilesStorage,
    private readonly transcriptsService: TranscriptsService,
    private readonly creditsService: CreditsService,
    private readonly speechService: SpeechService,
    private readonly telegramService: TelegramService,
  ) {
    super();
  }

  async process(job: Job<AudioTranscriptionPayload>): Promise<void> {
    const { jobId, chatId, inputFileId, clientId, durationSeconds } = job.data;

    await this.jobsRepository.update(jobId, { status: JobStatus.PROCESSING });

    try {
      const inputFile = await this.filesService.findOne(inputFileId);
      const absolutePath = this.filesStorage.getAbsolutePath(inputFile.url);

      const { original, translated, audio } = await this.speechService.process(absolutePath);

      const outputUploadedFile: UploadedFile = {
        fieldname: 'file',
        originalname: 'output.ogg',
        encoding: '7bit',
        mimetype: 'audio/ogg',
        buffer: audio,
        size: audio.length,
      };
      const outputFile = await this.filesService.create(outputUploadedFile, {
        type: FileType.OUTPUT_AUDIO,
      });

      await this.transcriptsService.create({
        originalText: original,
        translatedText: translated,
        jobId,
      });

      await this.creditsService.addUsage(clientId, jobId, durationSeconds);

      await this.jobsRepository.update(jobId, {
        status: JobStatus.COMPLETED,
        duration: durationSeconds,
        outputFileId: outputFile.id,
      });

      if (audio.length <= 1024 * 1024) {
        await this.telegramService.sendVoice(chatId, audio, 'voice.ogg');
      } else {
        await this.telegramService.sendAudio(chatId, audio, 'audio.ogg');
      }

      const balance = await this.creditsService.getBalance(clientId);
      await this.telegramService.sendMessage(chatId, `Готово! Залишилось секунд: ${balance}`);
    } catch (error) {
      this.logger.error(`Помилка транскрипції job ${jobId}`, error);
      await this.jobsRepository.update(jobId, { status: JobStatus.FAILED });
      await this.telegramService.sendMessage(
        chatId,
        'Аудіо збережено, але не вдалося розпізнати текст. Спробуйте пізніше.',
      );
    }
  }
}
