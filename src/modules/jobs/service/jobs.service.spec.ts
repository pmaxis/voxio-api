import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { JobsService } from '@/modules/jobs/service/jobs.service';
import { JobsRepository } from '@/modules/jobs/repository/jobs.repository';
import { CreateJobDto } from '@/modules/jobs/dto/create-job.dto';
import { UpdateJobDto } from '@/modules/jobs/dto/update-job.dto';
import { JobStatus } from '@/infrastructure/database/generated/enums';
import { AUDIO_TRANSCRIPTION_QUEUE } from '@/modules/jobs/processor/audio-transcription.processor';

const mockJob = {
  id: 'job-id',
  status: JobStatus.QUEUED,
  duration: null,
  clientId: 'client-id',
  inputFileId: null,
  outputFileId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockJobsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAudioQueue = {
  add: jest.fn(),
};

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: JobsRepository, useValue: mockJobsRepository },
        { provide: getQueueToken(AUDIO_TRANSCRIPTION_QUEUE), useValue: mockAudioQueue },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job with default status', async () => {
      const dto: CreateJobDto = { clientId: 'client-id' };
      mockJobsRepository.create.mockResolvedValue(mockJob);

      const result = await service.create(dto);

      expect(mockJobsRepository.create).toHaveBeenCalledWith({
        clientId: 'client-id',
        status: JobStatus.QUEUED,
        inputFileId: undefined,
      });
      expect(result).toEqual(mockJob);
    });

    it('should create a job with inputFileId', async () => {
      const dto: CreateJobDto = {
        clientId: 'client-id',
        inputFileId: 'file-id',
      };
      mockJobsRepository.create.mockResolvedValue(mockJob);

      const result = await service.create(dto);

      expect(mockJobsRepository.create).toHaveBeenCalledWith({
        clientId: 'client-id',
        status: JobStatus.QUEUED,
        inputFileId: 'file-id',
      });
      expect(result).toEqual(mockJob);
    });
  });

  describe('findAll', () => {
    it('should return all jobs', async () => {
      const jobs = [mockJob];
      mockJobsRepository.findAll.mockResolvedValue(jobs);

      const result = await service.findAll();

      expect(mockJobsRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(jobs);
    });
  });

  describe('findOne', () => {
    it('should return job by id', async () => {
      mockJobsRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.findOne('job-id');

      expect(mockJobsRepository.findOne).toHaveBeenCalledWith('job-id');
      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException when job not found', async () => {
      mockJobsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      const dto: UpdateJobDto = { status: JobStatus.COMPLETED };
      const updated = { ...mockJob, status: JobStatus.COMPLETED };
      mockJobsRepository.findOne.mockResolvedValue(mockJob);
      mockJobsRepository.update.mockResolvedValue(updated);

      const result = await service.update('job-id', dto);

      expect(mockJobsRepository.update).toHaveBeenCalledWith('job-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a job', async () => {
      mockJobsRepository.findOne.mockResolvedValue(mockJob);
      mockJobsRepository.delete.mockResolvedValue(mockJob);

      const result = await service.remove('job-id');

      expect(mockJobsRepository.delete).toHaveBeenCalledWith('job-id');
      expect(result).toEqual(mockJob);
    });
  });

  describe('addToAudioQueue', () => {
    it('should add job to audio queue', async () => {
      const payload = {
        jobId: 'job-id',
        chatId: 123,
        inputFileId: 'file-id',
        clientId: 'client-id',
        durationSeconds: 10,
      };
      mockAudioQueue.add.mockResolvedValue({ id: 'queue-job-id' });

      await service.addToAudioQueue(payload);

      expect(mockAudioQueue.add).toHaveBeenCalledWith('transcribe', payload);
    });
  });
});
