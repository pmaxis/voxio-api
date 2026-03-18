import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { CreditsController } from '@/modules/credits/controller/credits.controller';
import { CreditsRepository } from '@/modules/credits/repository/credits.repository';
import { CreditsService } from '@/modules/credits/service/credits.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CreditsController],
  providers: [CreditsRepository, CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
