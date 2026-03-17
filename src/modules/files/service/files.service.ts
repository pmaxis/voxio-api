import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFileDto } from '@/modules/files/dto/create-file.dto';
import { UpdateFileDto } from '@/modules/files/dto/update-file.dto';
import { FilesRepository } from '@/modules/files/repository/files.repository';
import { FilesStorage } from '@/modules/files/storage/files.storage';
import type { UploadedFile } from '@/modules/files/types/uploaded-file.interface';
import { FileType } from '@/infrastructure/database/generated/enums';

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly filesStorage: FilesStorage,
  ) {}

  async create(file: UploadedFile, createFileDto: CreateFileDto) {
    const subfolder = this.getSubfolder(createFileDto.type);
    const { relativePath } = await this.filesStorage.save(file, subfolder);

    return this.filesRepository.create({
      url: relativePath,
      type: createFileDto.type,
      size: file.size,
    });
  }

  async findAll() {
    return this.filesRepository.findAll();
  }

  async findOne(id: string) {
    const file = await this.filesRepository.findOne(id);
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    return file;
  }

  async update(id: string, updateFileDto: UpdateFileDto) {
    await this.findOne(id);
    return this.filesRepository.update(id, updateFileDto);
  }

  async remove(id: string) {
    const file = await this.findOne(id);
    await this.filesStorage.delete(file.url);
    return this.filesRepository.delete(id);
  }

  private getSubfolder(type: FileType): string {
    switch (type) {
      case FileType.INPUT_AUDIO:
        return 'input';
      case FileType.OUTPUT_AUDIO:
        return 'output';
      default:
        return 'other';
    }
  }
}
