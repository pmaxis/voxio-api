import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobsRepository } from '@/modules/jobs/repository/jobs.repository';
import { CreateJobDto } from '@/modules/jobs/dto/create-job.dto';
import { UpdateJobDto } from '@/modules/jobs/dto/update-job.dto';
import { JobStatus } from '@/infrastructure/database/generated/enums';
import type { AudioTranscriptionPayload } from '@/common/queue/audio-transcription.types';
import { AUDIO_TRANSCRIPTION_QUEUE } from '@/modules/jobs/processor/audio-transcription.processor';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsRepository: JobsRepository,
    @InjectQueue(AUDIO_TRANSCRIPTION_QUEUE) private readonly audioQueue: Queue,
  ) {}

  create(createJobDto: CreateJobDto) {
    return this.jobsRepository.create({
      clientId: createJobDto.clientId,
      status: createJobDto.status ?? JobStatus.QUEUED,
      inputFileId: createJobDto.inputFileId,
    });
  }

  findAll() {
    return this.jobsRepository.findAll();
  }

  async findOne(id: string) {
    const job = await this.jobsRepository.findOne(id);
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    return this.jobsRepository.update(id, updateJobDto);
  }

  async remove(id: string) {
    return this.jobsRepository.delete(id);
  }

  addToAudioQueue(payload: AudioTranscriptionPayload) {
    return this.audioQueue.add('transcribe', payload);
  }
}
