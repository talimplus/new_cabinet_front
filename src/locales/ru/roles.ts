export default {
  title: 'Роли и права',
  subtitle:
    'Отметьте нужные права для каждой роли. При создании сотрудника выбирается одна из этих ролей.',
  create: 'Создать роль',
  empty: 'Ролей нет',
  allPermissions: 'Все права',
  permissionCount: 'Прав: {count}',
  badges: {
    system: 'Системная роль',
    locked: 'Нельзя изменить',
  },
  table: {
    name: 'Роль',
    baseRole: 'Тип',
    permissions: 'Права',
    userCount: 'Сотрудники',
  },
  baseRoles: {
    admin: 'Администратор',
    super_admin: 'Супер администратор',
    teacher: 'Преподаватель',
    manager: 'Менеджер',
    reception: 'Ресепшн',
    other: 'Другое',
  },
  form: {
    createTitle: 'Новая роль',
    editTitle: 'Редактирование роли',
    name: 'Название роли',
    nameRequired: 'Введите название роли',
    baseRole: 'Тип роли',
    baseRoleHint:
      'Не влияет на права. Тип «Преподаватель» привязывается к группе и получает процент.',
    permissions: 'Права',
    selectAll: 'Выбрать все',
    clearAll: 'Очистить',
    selectGroup: 'Выбрать всю группу',
  },
  remove: {
    title: 'Удаление роли',
    confirm: 'Удалить роль «{name}»?',
  },
}
