import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { JobsController } from '@/modules/jobs/controller/jobs.controller';
import { JobsRepository } from '@/modules/jobs/repository/jobs.repository';
import { JobsService } from '@/modules/jobs/service/jobs.service';

@Module({
  imports: [DatabaseModule],
  controllers: [JobsController],
  providers: [JobsRepository, JobsService],
  exports: [JobsService],
})
export class JobsModule {}
