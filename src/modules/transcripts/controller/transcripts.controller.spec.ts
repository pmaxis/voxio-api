import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptsController } from '@/modules/transcripts/controller/transcripts.controller';
import { TranscriptsService } from '@/modules/transcripts/service/transcripts.service';
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

describe('TranscriptsController', () => {
  let controller: TranscriptsController;

  const mockTranscriptsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranscriptsController],
      providers: [
        {
          provide: TranscriptsService,
          useValue: mockTranscriptsService,
        },
      ],
    }).compile();

    controller = module.get<TranscriptsController>(TranscriptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transcript', async () => {
      const dto: CreateTranscriptDto = {
        originalText: 'Hello',
        translatedText: 'Привіт',
        jobId: 'job-id',
      };
      mockTranscriptsService.create.mockResolvedValue(mockTranscript);

      const result = await controller.create(dto);

      expect(mockTranscriptsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTranscript);
    });
  });

  describe('findAll', () => {
    it('should return all transcripts', async () => {
      const transcripts = [mockTranscript];
      mockTranscriptsService.findAll.mockResolvedValue(transcripts);

      const result = await controller.findAll();

      expect(mockTranscriptsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(transcripts);
    });
  });

  describe('findOne', () => {
    it('should return a transcript by id', async () => {
      mockTranscriptsService.findOne.mockResolvedValue(mockTranscript);

      const result = await controller.findOne('transcript-id');

      expect(mockTranscriptsService.findOne).toHaveBeenCalledWith('transcript-id');
      expect(result).toEqual(mockTranscript);
    });
  });

  describe('update', () => {
    it('should update a transcript', async () => {
      const dto: UpdateTranscriptDto = { translatedText: 'Новий переклад' };
      const updated = { ...mockTranscript, translatedText: 'Новий переклад' };
      mockTranscriptsService.update.mockResolvedValue(updated);

      const result = await controller.update('transcript-id', dto);

      expect(mockTranscriptsService.update).toHaveBeenCalledWith('transcript-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a transcript', async () => {
      mockTranscriptsService.remove.mockResolvedValue(mockTranscript);

      const result = await controller.remove('transcript-id');

      expect(mockTranscriptsService.remove).toHaveBeenCalledWith('transcript-id');
      expect(result).toEqual(mockTranscript);
    });
  });
});
