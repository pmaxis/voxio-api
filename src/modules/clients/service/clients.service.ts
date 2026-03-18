import { Injectable } from '@nestjs/common';
import { ClientsRepository } from '@/modules/clients/repository/clients.repository';
import { CreditsService } from '@/modules/credits/service/credits.service';
import { CreateClientDto } from '@/modules/clients/dto/create-client.dto';
import { UpdateClientDto } from '@/modules/clients/dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly creditsService: CreditsService,
  ) {}

  create(createClientDto: CreateClientDto) {
    return this.clientsRepository.create(createClientDto);
  }

  async findAll() {
    const clients = await this.clientsRepository.findAll();
    const clientsIds = clients.map((c) => c.id);
    const balances = await this.creditsService.getBalancesForClientIds(clientsIds);
    return clients.map((c) => ({
      ...c,
      balance: balances[c.id] ?? 0,
    }));
  }

  async findOne(id: string) {
    const client = await this.clientsRepository.findOne(id);
    if (!client) return null;
    const balance = await this.creditsService.getBalance(client.id);
    return { ...client, balance };
  }

  findByTelegramId(telegramId: string) {
    return this.clientsRepository.findByTelegramId(telegramId);
  }

  update(id: string, updateClientDto: UpdateClientDto) {
    return this.clientsRepository.update(id, updateClientDto);
  }

  remove(id: string) {
    return this.clientsRepository.delete(id);
  }
}
