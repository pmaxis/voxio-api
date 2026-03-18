import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreditsService } from '@/modules/credits/service/credits.service';
import { CreditsRepository } from '@/modules/credits/repository/credits.repository';
import { CreateCreditDto } from '@/modules/credits/dto/create-credit.dto';
import { UpdateCreditDto } from '@/modules/credits/dto/update-credit.dto';
import { CreditType } from '@/infrastructure/database/generated/enums';

const mockCredit = {
  id: 'credit-id',
  amount: 100,
  type: CreditType.BONUS,
  clientId: 'client-id',
  jobId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCreditsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CreditsService', () => {
  let service: CreditsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditsService, { provide: CreditsRepository, useValue: mockCreditsRepository }],
    }).compile();

    service = module.get<CreditsService>(CreditsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a credit', async () => {
      const dto: CreateCreditDto = {
        amount: 100,
        type: CreditType.BONUS,
        clientId: 'client-id',
      };
      mockCreditsRepository.create.mockResolvedValue(mockCredit);

      const result = await service.create(dto);

      expect(mockCreditsRepository.create).toHaveBeenCalledWith({
        amount: 100,
        type: CreditType.BONUS,
        clientId: 'client-id',
        jobId: undefined,
      });
      expect(result).toEqual(mockCredit);
    });

    it('should create a credit with jobId', async () => {
      const dto: CreateCreditDto = {
        amount: -10,
        type: CreditType.USAGE,
        clientId: 'client-id',
        jobId: 'job-id',
      };
      const creditWithJob = { ...mockCredit, jobId: 'job-id' };
      mockCreditsRepository.create.mockResolvedValue(creditWithJob);

      const result = await service.create(dto);

      expect(mockCreditsRepository.create).toHaveBeenCalledWith({
        amount: -10,
        type: CreditType.USAGE,
        clientId: 'client-id',
        jobId: 'job-id',
      });
      expect(result).toEqual(creditWithJob);
    });
  });

  describe('findAll', () => {
    it('should return all credits', async () => {
      const credits = [mockCredit];
      mockCreditsRepository.findAll.mockResolvedValue(credits);

      const result = await service.findAll();

      expect(mockCreditsRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(credits);
    });
  });

  describe('findOne', () => {
    it('should return credit by id', async () => {
      mockCreditsRepository.findOne.mockResolvedValue(mockCredit);

      const result = await service.findOne('credit-id');

      expect(mockCreditsRepository.findOne).toHaveBeenCalledWith('credit-id');
      expect(result).toEqual(mockCredit);
    });

    it('should throw NotFoundException when credit not found', async () => {
      mockCreditsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a credit', async () => {
      const dto: UpdateCreditDto = { jobId: 'job-id' };
      const updated = { ...mockCredit, jobId: 'job-id' };
      mockCreditsRepository.findOne.mockResolvedValue(mockCredit);
      mockCreditsRepository.update.mockResolvedValue(updated);

      const result = await service.update('credit-id', dto);

      expect(mockCreditsRepository.update).toHaveBeenCalledWith('credit-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a credit', async () => {
      mockCreditsRepository.findOne.mockResolvedValue(mockCredit);
      mockCreditsRepository.delete.mockResolvedValue(mockCredit);

      const result = await service.remove('credit-id');

      expect(mockCreditsRepository.delete).toHaveBeenCalledWith('credit-id');
      expect(result).toEqual(mockCredit);
    });
  });
});
