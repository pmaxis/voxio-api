import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { FileType } from '@/infrastructure/database/generated/enums';

@Injectable()
export class FilesRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: { url: string; type: FileType; size?: number }) {
    return this.database.file.create({
      data,
    });
  }

  async findAll() {
    return this.database.file.findMany();
  }

  async findOne(id: string) {
    return this.database.file.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { url?: string; type?: FileType; size?: number }) {
    return this.database.file.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.database.file.delete({
      where: { id },
    });
  }
}
