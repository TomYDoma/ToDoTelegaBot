import { AppService } from './app.service';
import {
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { actionButtons } from './app.buttons';
import { Context } from './context.interface';
import { showList } from './app.utils';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Приветствую тебя, подаван!');
    await ctx.reply('Что ты хочешь сделать?', actionButtons());
  }

  @Hears('⚡️ Создание задачи')
  async createTask(ctx: Context) {
    ctx.session.type = 'create';
    await ctx.reply('Опишите задачу:');
  }

  @Hears('📋 Список задач')
  async listTask(ctx: Context) {
    const todos = await this.appService.getAll();
    await ctx.reply(showList(todos));
  }

  @Hears('✅️ Завершение задачи')
  async doneTask(ctx: Context) {
    ctx.session.type = 'done';
    await ctx.reply('Напишите ID задачи:');
  }

  @Hears('✏️ Редактирование задачи')
  async editTask(ctx: Context) {
    ctx.session.type = 'edit';
    await ctx.deleteMessage();
    await ctx.replyWithHTML(
      'Напишите ID и новое название задачи: \n\n' +
        'В формате - <b>1 | Новое название</b>',
    );
  }

  @Hears('❌ Удаление задачи')
  async deleteTask(ctx: Context) {
    ctx.session.type = 'remove';
    await ctx.reply('Напишите ID задачи:');
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) return;

    if (ctx.session.type === 'create') {
      const todos = await this.appService.createTask(message);
      await ctx.reply(showList(todos));
    }

    if (ctx.session.type === 'done') {
      const todos = await this.appService.doneTask(Number(message));

      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задачи с таким ID не найдено!');
        return;
      }

      await ctx.reply(showList(todos));
    }

    if (ctx.session.type === 'edit') {
      const [taskId, taskName] = message.split(' | ');
      const todos = await this.appService.editTask(Number(taskId), taskName);

      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задачи с таким ID не найдено!');
        return;
      }

      await ctx.reply(showList(todos));
    }

    if (ctx.session.type === 'remove') {
      const todos = await this.appService.deleteTask(Number(message));

      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задачи с таким ID не найдено!');
        return;
      }

      await ctx.reply(showList(todos));
    }
  }
}
