import { Injectable, NotFoundException } from '@nestjs/common';
import { TranscriptsRepository } from '@/modules/transcripts/repository/transcripts.repository';
import { CreateTranscriptDto } from '@/modules/transcripts/dto/create-transcript.dto';
import { UpdateTranscriptDto } from '@/modules/transcripts/dto/update-transcript.dto';

@Injectable()
export class TranscriptsService {
  constructor(private readonly transcriptsRepository: TranscriptsRepository) {}

  create(createTranscriptDto: CreateTranscriptDto) {
    return this.transcriptsRepository.create({
      originalText: createTranscriptDto.originalText,
      translatedText: createTranscriptDto.translatedText,
      jobId: createTranscriptDto.jobId,
    });
  }

  findAll() {
    return this.transcriptsRepository.findAll();
  }

  async findOne(id: string) {
    const transcript = await this.transcriptsRepository.findOne(id);
    if (!transcript) {
      throw new NotFoundException(`Transcript with id ${id} not found`);
    }
    return transcript;
  }

  async update(id: string, updateTranscriptDto: UpdateTranscriptDto) {
    await this.findOne(id);
    return this.transcriptsRepository.update(id, updateTranscriptDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.transcriptsRepository.delete(id);
  }
}
