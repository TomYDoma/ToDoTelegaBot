import { Markup } from 'telegraf';

export function actionButtons() {
  return Markup.keyboard(
    [
      Markup.button.callback('⚡️ Создание задачи', 'create'),
      Markup.button.callback('📋 Список задач', 'list'),
      Markup.button.callback('✅️ Завершение задачи', 'done'),
      Markup.button.callback('✏️ Редактирование задачи', 'edit'),
      Markup.button.callback('❌ Удаление задачи', 'delete'),
    ],
    {
      columns: 5,
    },
  );
}
