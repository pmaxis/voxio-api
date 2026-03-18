import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TranscriptsService } from '@/modules/transcripts/service/transcripts.service';
import { TranscriptsRepository } from '@/modules/transcripts/repository/transcripts.repository';
import { CreateTranscriptDto } from '@/modules/transcripts/dto/create-transcript.dto';
import { UpdateTranscriptDto } from '@/modules/transcripts/dto/update-transcript.dto';

const mockTranscript = {
  id: 'transcript-id',
  originalText: 'Hello',
  translatedText: 'Привіт',
  jobId: 'job-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTranscriptsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('TranscriptsService', () => {
  let service: TranscriptsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptsService,
        { provide: TranscriptsRepository, useValue: mockTranscriptsRepository },
      ],
    }).compile();

    service = module.get<TranscriptsService>(TranscriptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transcript', async () => {
      const dto: CreateTranscriptDto = {
        originalText: 'Hello',
        translatedText: 'Привіт',
        jobId: 'job-id',
      };
      mockTranscriptsRepository.create.mockResolvedValue(mockTranscript);

      const result = await service.create(dto);

      expect(mockTranscriptsRepository.create).toHaveBeenCalledWith({
        originalText: 'Hello',
        translatedText: 'Привіт',
        jobId: 'job-id',
      });
      expect(result).toEqual(mockTranscript);
    });
  });

  describe('findAll', () => {
    it('should return all transcripts', async () => {
      const transcripts = [mockTranscript];
      mockTranscriptsRepository.findAll.mockResolvedValue(transcripts);

      const result = await service.findAll();

      expect(mockTranscriptsRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(transcripts);
    });
  });

  describe('findOne', () => {
    it('should return transcript by id', async () => {
      mockTranscriptsRepository.findOne.mockResolvedValue(mockTranscript);

      const result = await service.findOne('transcript-id');

      expect(mockTranscriptsRepository.findOne).toHaveBeenCalledWith('transcript-id');
      expect(result).toEqual(mockTranscript);
    });

    it('should throw NotFoundException when transcript not found', async () => {
      mockTranscriptsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a transcript', async () => {
      const dto: UpdateTranscriptDto = { translatedText: 'Новий переклад' };
      const updated = { ...mockTranscript, translatedText: 'Новий переклад' };
      mockTranscriptsRepository.findOne.mockResolvedValue(mockTranscript);
      mockTranscriptsRepository.update.mockResolvedValue(updated);

      const result = await service.update('transcript-id', dto);

      expect(mockTranscriptsRepository.update).toHaveBeenCalledWith('transcript-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a transcript', async () => {
      mockTranscriptsRepository.findOne.mockResolvedValue(mockTranscript);
      mockTranscriptsRepository.delete.mockResolvedValue(mockTranscript);

      const result = await service.remove('transcript-id');

      expect(mockTranscriptsRepository.delete).toHaveBeenCalledWith('transcript-id');
      expect(result).toEqual(mockTranscript);
    });
  });
});
