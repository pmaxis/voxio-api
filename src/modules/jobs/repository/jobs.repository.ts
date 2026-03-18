import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { JobStatus } from '@/infrastructure/database/generated/enums';

@Injectable()
export class JobsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    clientId: string;
    status: JobStatus;
    inputFileId?: string;
    outputFileId?: string;
    duration?: number;
  }) {
    return this.database.job.create({
      data,
    });
  }

  async findAll() {
    return this.database.job.findMany({
      include: {
        client: true,
        inputFile: true,
        outputFile: true,
      },
    });
  }

  async findOne(id: string) {
    return this.database.job.findUnique({
      where: { id },
      include: {
        client: true,
        inputFile: true,
        outputFile: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      status?: JobStatus;
      duration?: number;
      inputFileId?: string;
      outputFileId?: string;
    },
  ) {
    return this.database.job.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.database.job.delete({
      where: { id },
    });
  }
}
