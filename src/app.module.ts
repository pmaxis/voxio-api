import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import config from '@/common/config/config';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { validationSchema } from '@/common/config/validation';
import { PoliciesGuard } from '@/common/guards/policy.guard';
import { AbilityModule } from '@/common/ability/ability.module';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { SessionsModule } from '@/modules/sessions/sessions.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { PermissionsModule } from '@/modules/permissions/permissions.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { TelegramModule } from '@/infrastructure/telegram/telegram.module';
import { ClientsModule } from '@/modules/clients/clients.module';
import { FilesModule } from './modules/files/files.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CreditsModule } from './modules/credits/credits.module';
import { TranscriptsModule } from './modules/transcripts/transcripts.module';
import { SpeechModule } from './infrastructure/speech/speech.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AbilityModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: validationSchema,
    }),
    DatabaseModule,
    SpeechModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    RolesModule,
    PermissionsModule,
    ProfileModule,
    TelegramModule,
    ClientsModule,
    FilesModule,
    JobsModule,
    CreditsModule,
    TranscriptsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
