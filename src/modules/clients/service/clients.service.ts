import { Injectable } from '@nestjs/common';
import { ClientsRepository } from '@/modules/clients/repository/clients.repository';
import { CreateClientDto } from '@/modules/clients/dto/create-client.dto';
import { UpdateClientDto } from '@/modules/clients/dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  create(createClientDto: CreateClientDto) {
    return this.clientsRepository.create(createClientDto);
  }

  findAll() {
    return this.clientsRepository.findAll();
  }

  findOne(id: string) {
    return this.clientsRepository.findOne(id);
  }

  update(id: string, updateClientDto: UpdateClientDto) {
    return this.clientsRepository.update(id, updateClientDto);
  }

  remove(id: string) {
    return this.clientsRepository.delete(id);
  }
}
