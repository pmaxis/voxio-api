import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class ClientsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { telegramId: string; username?: string }) {
    return this.database.client.create({
      data,
    });
  }

  async findAll() {
    return this.database.client.findMany();
  }

  async findOne(id: string) {
    return this.database.client.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: { username?: string }) {
    return this.database.client.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return this.database.client.delete({
      where: {
        id,
      },
    });
  }
}
