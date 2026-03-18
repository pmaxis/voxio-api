import { Injectable, NotFoundException } from '@nestjs/common';
import { CreditsRepository } from '@/modules/credits/repository/credits.repository';
import { CreateCreditDto } from '@/modules/credits/dto/create-credit.dto';
import { UpdateCreditDto } from '@/modules/credits/dto/update-credit.dto';
import { CreditType } from '@/infrastructure/database/generated/enums';

const BONUS_SECONDS = 180;

@Injectable()
export class CreditsService {
  constructor(private readonly creditsRepository: CreditsRepository) {}

  getBalance(clientId: string): Promise<number> {
    return this.creditsRepository.getBalance(clientId);
  }

  getBalancesForClientIds(clientIds: string[]): Promise<Record<string, number>> {
    return this.creditsRepository.getBalancesForClientIds(clientIds);
  }

  addBonus(clientId: string) {
    return this.creditsRepository.create({
      amount: BONUS_SECONDS,
      type: CreditType.BONUS,
      clientId,
    });
  }

  addUsage(clientId: string, jobId: string, seconds: number) {
    return this.creditsRepository.create({
      amount: -seconds,
      type: CreditType.USAGE,
      clientId,
      jobId,
    });
  }

  create(createCreditDto: CreateCreditDto) {
    return this.creditsRepository.create({
      amount: createCreditDto.amount,
      type: createCreditDto.type,
      clientId: createCreditDto.clientId,
      jobId: createCreditDto.jobId,
    });
  }

  findAll() {
    return this.creditsRepository.findAll();
  }

  async findOne(id: string) {
    const credit = await this.creditsRepository.findOne(id);
    if (!credit) {
      throw new NotFoundException(`Credit with id ${id} not found`);
    }
    return credit;
  }

  async update(id: string, updateCreditDto: UpdateCreditDto) {
    await this.findOne(id);
    return this.creditsRepository.update(id, updateCreditDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.creditsRepository.delete(id);
  }
}
