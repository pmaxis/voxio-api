import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from '@/modules/clients/controller/clients.controller';
import { ClientsService } from '@/modules/clients/service/clients.service';
import { CreateClientDto } from '@/modules/clients/dto/create-client.dto';
import { UpdateClientDto } from '@/modules/clients/dto/update-client.dto';

const mockClient = {
  id: 'client-id',
  telegramId: '123456789',
  username: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ClientsController', () => {
  let controller: ClientsController;

  const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a client', async () => {
      const dto: CreateClientDto = { telegramId: '123456789', username: 'testuser' };
      mockClientsService.create.mockResolvedValue(mockClient);

      const result = await controller.create(dto);

      expect(mockClientsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockClient);
    });
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      const clients = [mockClient];
      mockClientsService.findAll.mockResolvedValue(clients);

      const result = await controller.findAll();

      expect(mockClientsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(clients);
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      mockClientsService.findOne.mockResolvedValue(mockClient);

      const result = await controller.findOne('client-id');

      expect(mockClientsService.findOne).toHaveBeenCalledWith('client-id');
      expect(result).toEqual(mockClient);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const dto: UpdateClientDto = { username: 'newusername' };
      const updated = { ...mockClient, username: 'newusername' };
      mockClientsService.update.mockResolvedValue(updated);

      const result = await controller.update('client-id', dto);

      expect(mockClientsService.update).toHaveBeenCalledWith('client-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a client', async () => {
      mockClientsService.remove.mockResolvedValue(mockClient);

      const result = await controller.remove('client-id');

      expect(mockClientsService.remove).toHaveBeenCalledWith('client-id');
      expect(result).toEqual(mockClient);
    });
  });
});
