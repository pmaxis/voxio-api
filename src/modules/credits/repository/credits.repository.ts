import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { CreditType } from '@/infrastructure/database/generated/enums';

@Injectable()
export class CreditsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { amount: number; type: CreditType; clientId: string; jobId?: string }) {
    return this.database.credit.create({
      data,
      include: {
        client: true,
        job: true,
      },
    });
  }

  async findAll() {
    return this.database.credit.findMany({
      include: {
        client: true,
        job: true,
      },
    });
  }

  async findOne(id: string) {
    return this.database.credit.findUnique({
      where: { id },
      include: {
        client: true,
        job: true,
      },
    });
  }

  async update(id: string, data: { jobId?: string | null }) {
    return this.database.credit.update({
      where: { id },
      data,
      include: {
        client: true,
        job: true,
      },
    });
  }

  async delete(id: string) {
    return this.database.credit.delete({
      where: { id },
    });
  }

  async getBalance(clientId: string): Promise<number> {
    const result = await this.database.credit.aggregate({
      where: { clientId },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async getBalancesForClientIds(clientIds: string[]): Promise<Record<string, number>> {
    if (clientIds.length === 0) return {};
    const result = await this.database.credit.groupBy({
      by: ['clientId'],
      where: { clientId: { in: clientIds } },
      _sum: { amount: true },
    });
    const map: Record<string, number> = {};
    for (const row of result) {
      map[row.clientId] = row._sum.amount ?? 0;
    }
    for (const id of clientIds) {
      if (!(id in map)) map[id] = 0;
    }
    return map;
  }
}
