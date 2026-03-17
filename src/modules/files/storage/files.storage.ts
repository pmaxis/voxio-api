import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { UploadedFile } from '@/modules/files/types/uploaded-file.interface';

@Injectable()
export class FilesStorage implements OnModuleInit {
  private readonly logger = new Logger(FilesStorage.name);
  private readonly uploadPath: string;

  constructor(private readonly config: ConfigService) {
    const uploadDir = this.config.get<string>('storage.uploadPath', 'uploads');
    this.uploadPath = path.isAbsolute(uploadDir)
      ? uploadDir
      : path.resolve(process.cwd(), uploadDir);
  }

  async onModuleInit(): Promise<void> {
    await this.ensureUploadDir();
    await fs.mkdir(path.join(this.uploadPath, 'input'), { recursive: true });
    await fs.mkdir(path.join(this.uploadPath, 'output'), { recursive: true });
    this.logger.log(`Файли зберігаються в: ${this.uploadPath}`);
  }

  async ensureUploadDir(): Promise<void> {
    await fs.mkdir(this.uploadPath, { recursive: true });
  }

  async save(
    file: UploadedFile,
    subfolder?: string,
  ): Promise<{ relativePath: string; absolutePath: string }> {
    await this.ensureUploadDir();

    const targetDir = subfolder ? path.join(this.uploadPath, subfolder) : this.uploadPath;
    await fs.mkdir(targetDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.originalname}`;
    const relativePath = subfolder ? path.join(subfolder, uniqueName) : uniqueName;
    const absolutePath = path.join(this.uploadPath, relativePath);

    await fs.writeFile(absolutePath, file.buffer);
    this.logger.log(`Збережено: ${absolutePath}`);

    return { relativePath, absolutePath };
  }

  async delete(relativePath: string): Promise<void> {
    const absolutePath = path.join(this.uploadPath, relativePath);
    await fs.unlink(absolutePath).catch(() => {});
  }

  getAbsolutePath(relativePath: string): string {
    return path.join(this.uploadPath, relativePath);
  }
}
