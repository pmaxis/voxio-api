import { Injectable } from '@nestjs/common';
import type { Context, Telegraf } from 'telegraf';
import type { Update } from 'telegraf/types';
import { ClientsService } from '@/modules/clients/service/clients.service';

@Injectable()
export class StartHandler {
  constructor(private readonly clientsService: ClientsService) {}

  register(bot: Telegraf<Context<Update>>): void {
    bot.start(async (ctx) => {
      const telegramId = String(ctx.from.id);
      const username = ctx.from.username ?? undefined;
      await this.clientsService.create({ telegramId, username });
      await ctx.reply('Вітаємо! Ви успішно зареєстровані.');
    });
  }
}
