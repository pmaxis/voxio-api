import { Injectable } from '@nestjs/common';
import type { Context, Telegraf } from 'telegraf';
import type { Update } from 'telegraf/types';
import { ClientsService } from '@/modules/clients/service/clients.service';
import { CreditsService } from '@/modules/credits/service/credits.service';

@Injectable()
export class StartHandler {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly creditsService: CreditsService,
  ) {}

  register(bot: Telegraf<Context<Update>>): void {
    bot.start(async (ctx) => {
      const telegramId = String(ctx.from.id);
      const username = ctx.from.username ?? undefined;
      const client = await this.clientsService.findByTelegramId(telegramId);

      if (!client) {
        const newClient = await this.clientsService.create({ telegramId, username });
        await this.creditsService.addBonus(newClient.id);
        await ctx.reply(
          'Вітаємо! Ви успішно зареєстровані. На ваш рахунок зараховано 180 секунд для перекладу аудіо.',
        );
        return;
      }

      const balance = await this.creditsService.getBalance(client.id);
      await ctx.reply(`Ви вже зареєстровані. Залишилось секунд: ${balance}`);
    });
  }
}
