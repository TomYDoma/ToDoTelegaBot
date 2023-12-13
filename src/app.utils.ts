export const showList = todos =>
  `Ваш список задач: \n\n${todos
    .map(todo => (todo.isCompleted ? '✅' : '🔘') + ' ' + todo.name + ' (' + todo.id + ') ' + '\n\n')
    .join('')}`;
