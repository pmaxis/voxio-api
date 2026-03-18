import { Injectable, NotFoundException } from '@nestjs/common';
import { JobsRepository } from '@/modules/jobs/repository/jobs.repository';
import { CreateJobDto } from '@/modules/jobs/dto/create-job.dto';
import { UpdateJobDto } from '@/modules/jobs/dto/update-job.dto';
import { JobStatus } from '@/infrastructure/database/generated/enums';

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  create(createJobDto: CreateJobDto) {
    return this.jobsRepository.create({
      clientId: createJobDto.clientId,
      status: createJobDto.status ?? JobStatus.QUEUED,
      inputFileId: createJobDto.inputFileId,
    });
  }

  findAll() {
    return this.jobsRepository.findAll();
  }

  async findOne(id: string) {
    const job = await this.jobsRepository.findOne(id);
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    await this.findOne(id);
    return this.jobsRepository.update(id, updateJobDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.jobsRepository.delete(id);
  }
}
