import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from '@/modules/jobs/controller/jobs.controller';
import { JobsService } from '@/modules/jobs/service/jobs.service';
import { CreateJobDto } from '@/modules/jobs/dto/create-job.dto';
import { UpdateJobDto } from '@/modules/jobs/dto/update-job.dto';
import { JobStatus } from '@/infrastructure/database/generated/enums';

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

describe('JobsController', () => {
  let controller: JobsController;

  const mockJobsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a job', async () => {
      const dto: CreateJobDto = { clientId: 'client-id' };
      mockJobsService.create.mockResolvedValue(mockJob);

      const result = await controller.create(dto);

      expect(mockJobsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockJob);
    });
  });

  describe('findAll', () => {
    it('should return all jobs', async () => {
      const jobs = [mockJob];
      mockJobsService.findAll.mockResolvedValue(jobs);

      const result = await controller.findAll();

      expect(mockJobsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(jobs);
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      mockJobsService.findOne.mockResolvedValue(mockJob);

      const result = await controller.findOne('job-id');

      expect(mockJobsService.findOne).toHaveBeenCalledWith('job-id');
      expect(result).toEqual(mockJob);
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      const dto: UpdateJobDto = { status: JobStatus.COMPLETED };
      const updated = { ...mockJob, status: JobStatus.COMPLETED };
      mockJobsService.update.mockResolvedValue(updated);

      const result = await controller.update('job-id', dto);

      expect(mockJobsService.update).toHaveBeenCalledWith('job-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a job', async () => {
      mockJobsService.remove.mockResolvedValue(mockJob);

      const result = await controller.remove('job-id');

      expect(mockJobsService.remove).toHaveBeenCalledWith('job-id');
      expect(result).toEqual(mockJob);
    });
  });
});
