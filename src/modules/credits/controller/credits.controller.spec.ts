import { Test, TestingModule } from '@nestjs/testing';
import { CreditsController } from '@/modules/credits/controller/credits.controller';
import { CreditsService } from '@/modules/credits/service/credits.service';
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

describe('CreditsController', () => {
  let controller: CreditsController;

  const mockCreditsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditsController],
      providers: [
        {
          provide: CreditsService,
          useValue: mockCreditsService,
        },
      ],
    }).compile();

    controller = module.get<CreditsController>(CreditsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a credit', async () => {
      const dto: CreateCreditDto = {
        amount: 100,
        type: CreditType.BONUS,
        clientId: 'client-id',
      };
      mockCreditsService.create.mockResolvedValue(mockCredit);

      const result = await controller.create(dto);

      expect(mockCreditsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCredit);
    });
  });

  describe('findAll', () => {
    it('should return all credits', async () => {
      const credits = [mockCredit];
      mockCreditsService.findAll.mockResolvedValue(credits);

      const result = await controller.findAll();

      expect(mockCreditsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(credits);
    });
  });

  describe('findOne', () => {
    it('should return a credit by id', async () => {
      mockCreditsService.findOne.mockResolvedValue(mockCredit);

      const result = await controller.findOne('credit-id');

      expect(mockCreditsService.findOne).toHaveBeenCalledWith('credit-id');
      expect(result).toEqual(mockCredit);
    });
  });

  describe('update', () => {
    it('should update a credit', async () => {
      const dto: UpdateCreditDto = { jobId: 'job-id' };
      const updated = { ...mockCredit, jobId: 'job-id' };
      mockCreditsService.update.mockResolvedValue(updated);

      const result = await controller.update('credit-id', dto);

      expect(mockCreditsService.update).toHaveBeenCalledWith('credit-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a credit', async () => {
      mockCreditsService.remove.mockResolvedValue(mockCredit);

      const result = await controller.remove('credit-id');

      expect(mockCreditsService.remove).toHaveBeenCalledWith('credit-id');
      expect(result).toEqual(mockCredit);
    });
  });
});
