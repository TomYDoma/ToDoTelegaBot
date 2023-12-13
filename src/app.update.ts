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
    const chatID = String(ctx.message.chat.id);
    const todos = await this.appService.getAll(chatID);
    await ctx.reply(showList(todos));
  }

  @Hears('✅️ Завершение задачи')
  async doneTask(ctx: Context) {
    ctx.session.type = 'done';
    await ctx.reply('Напишите ID (Число в скобках) с задачи:');
  }

  @Hears('✏️ Редактирование задачи')
  async editTask(ctx: Context) {
    ctx.session.type = 'edit';
    await ctx.deleteMessage();
    await ctx.replyWithHTML(
      'Напишите ID (Число в скобках) и новое название задачи: \n\n' +
        'В формате - <b>1 | Новое название</b>',
    );
  }

  @Hears('❌ Удаление задачи')
  async deleteTask(ctx: Context) {
    ctx.session.type = 'remove';
    await ctx.reply('Напишите ID (Число в скобках) задачи:');
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    const chatID = String(ctx.message.chat.id);
    if (!ctx.session.type) return;

    if (ctx.session.type === 'create') {
      const todos = await this.appService.createTask(message, chatID);
      await ctx.reply(showList(todos));
    }

    if (ctx.session.type === 'done') {
      const todos = await this.appService.doneTask(message, chatID);

      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задачи с таким ID не найдено!');
        return;
      }

      await ctx.reply(showList(todos));
    }

    if (ctx.session.type === 'edit') {
      const [taskId, taskName] = message.split(' | ');
      const todos = await this.appService.editTask(
        Number(taskId),
        taskName,
        chatID,
      );

      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задачи с таким ID не найдено!');
        return;
      }

      await ctx.reply(showList(todos));
    }

    if (ctx.session.type === 'remove') {
      const todos = await this.appService.deleteTask(Number(message), chatID);
      console.log(message);
      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задачи с таким ID не найдено!');
        return;
      }
      await ctx.reply(showList(todos));
    }
  }
}
