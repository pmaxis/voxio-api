import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from '@/modules/clients/service/clients.service';
import { ClientsRepository } from '@/modules/clients/repository/clients.repository';
import { CreditsService } from '@/modules/credits/service/credits.service';
import { CreateClientDto } from '@/modules/clients/dto/create-client.dto';
import { UpdateClientDto } from '@/modules/clients/dto/update-client.dto';

const mockClient = {
  id: 'client-id',
  telegramId: '123456789',
  username: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockClientsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCreditsService = {
  getBalance: jest.fn(),
  getBalancesForClientIds: jest.fn(),
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsRepository, useValue: mockClientsRepository },
        { provide: CreditsService, useValue: mockCreditsService },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a client', async () => {
      const dto: CreateClientDto = { telegramId: '123456789', username: 'testuser' };
      mockClientsRepository.create.mockResolvedValue(mockClient);

      const result = await service.create(dto);

      expect(mockClientsRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockClient);
    });

    it('should create a client without username', async () => {
      const dto: CreateClientDto = { telegramId: '123456789' };
      const created = { ...mockClient, username: null };
      mockClientsRepository.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockClientsRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all clients with balance', async () => {
      const clients = [mockClient];
      mockClientsRepository.findAll.mockResolvedValue(clients);
      mockCreditsService.getBalancesForClientIds.mockResolvedValue({ 'client-id': 180 });

      const result = await service.findAll();

      expect(mockClientsRepository.findAll).toHaveBeenCalled();
      expect(mockCreditsService.getBalancesForClientIds).toHaveBeenCalledWith(['client-id']);
      expect(result).toEqual([{ ...mockClient, balance: 180 }]);
    });
  });

  describe('findOne', () => {
    it('should return client by id with balance', async () => {
      mockClientsRepository.findOne.mockResolvedValue(mockClient);
      mockCreditsService.getBalance.mockResolvedValue(180);

      const result = await service.findOne('client-id');

      expect(mockClientsRepository.findOne).toHaveBeenCalledWith('client-id');
      expect(mockCreditsService.getBalance).toHaveBeenCalledWith('client-id');
      expect(result).toEqual({ ...mockClient, balance: 180 });
    });

    it('should return null when client not found', async () => {
      mockClientsRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('unknown');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const dto: UpdateClientDto = { username: 'newusername' };
      const updated = { ...mockClient, username: 'newusername' };
      mockClientsRepository.update.mockResolvedValue(updated);

      const result = await service.update('client-id', dto);

      expect(mockClientsRepository.update).toHaveBeenCalledWith('client-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a client', async () => {
      mockClientsRepository.delete.mockResolvedValue(mockClient);

      const result = await service.remove('client-id');

      expect(mockClientsRepository.delete).toHaveBeenCalledWith('client-id');
      expect(result).toEqual(mockClient);
    });
  });
});
