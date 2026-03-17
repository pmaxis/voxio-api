import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from '@/modules/files/service/files.service';
import { FilesRepository } from '@/modules/files/repository/files.repository';
import { FilesStorage } from '@/modules/files/storage/files.storage';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: FilesRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: FilesStorage,
          useValue: {
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
