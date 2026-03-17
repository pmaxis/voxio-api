import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { FilesController } from '@/modules/files/controller/files.controller';
import { FilesRepository } from '@/modules/files/repository/files.repository';
import { FilesService } from '@/modules/files/service/files.service';
import { FilesStorage } from '@/modules/files/storage/files.storage';

@Module({
  imports: [DatabaseModule],
  controllers: [FilesController],
  providers: [FilesRepository, FilesStorage, FilesService],
  exports: [FilesService, FilesStorage],
})
export class FilesModule {}
