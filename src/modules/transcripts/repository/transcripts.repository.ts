import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

@Injectable()
export class TranscriptsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { originalText: string; translatedText?: string | null; jobId: string }) {
    return this.database.transcript.create({
      data,
      include: {
        job: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.database.transcript.findMany({
      include: {
        job: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.database.transcript.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  async update(id: string, data: { originalText?: string; translatedText?: string | null }) {
    return this.database.transcript.update({
      where: { id },
      data,
      include: {
        job: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.database.transcript.delete({
      where: { id },
    });
  }
}
