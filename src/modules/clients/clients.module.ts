import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { CreditsModule } from '@/modules/credits/credits.module';
import { ClientsService } from '@/modules/clients/service/clients.service';
import { ClientsController } from '@/modules/clients/controller/clients.controller';
import { ClientsRepository } from '@/modules/clients/repository/clients.repository';

@Module({
  imports: [DatabaseModule, CreditsModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsRepository],
  exports: [ClientsService],
})
export class ClientsModule {}
