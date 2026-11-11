export default {
  title: 'Страница сотрудника',
  myTitle: 'Моя работа',
  viewAction: 'Открыть страницу сотрудника',
  month: 'Месяц',

  stats: {
    lateDays: 'Дней с опозданием',
    missedDays: 'Не пришёл',
    missedHint: 'из {days} дней с уроками',
    unsettled: 'Не сдано в кассу',
    unsettledHint: '{count} чек(ов)',
    deduction: 'Штраф за месяц',
    deductionHint: 'остаток: {amount}',
    advance: 'Аванс за месяц',
    advanceHint: 'на следующие зарплаты: {amount}',
    bonus: 'Премия за месяц',
    bonusHint: 'добавляется к зарплате',
  },

  salary: {
    title: 'Зарплата за {month}',
    base: 'Начислено',
    bonus: '+ Премия',
    fine: '− Штраф',
    advance: '− Аванс',
    deduction: 'Удержано',
    net: 'К выдаче',
    paid: 'Выплачено',
    remaining: 'Остаток',
    appliedTitle: 'Удержания:',
    fromMonth: 'перенос с {month}',
    outstandingHint:
      'Неудержанный штраф: {amount}. Эта сумма будет удержана из следующих зарплат.',
    advanceOutstandingHint:
      'Неудержанный аванс: {amount}. Будет удержан из следующих зарплат.',
    payButton: 'Выплатить зарплату',
    payTitle: 'Выплата зарплаты',
    payAmount: 'Сумма к выплате',
    payPositive: 'Сумма должна быть больше 0',
    payTooMuch: 'Больше остатка: {amount}',
    paySuccess: 'Зарплата выплачена',
  },

  deduction: {
    addButton: 'Добавить штраф',
    title: 'Удержание из зарплаты',
    amount: 'Сумма удержания',
    amountHint:
      'Если больше зарплаты — удержится сколько поместится, остальное из следующих зарплат',
    type: 'Тип причины',
    reason: 'Причина',
    reasonHint: 'Сотрудник увидит это на своей странице',
    success: 'Штраф добавлен',
    deleted: 'Штраф удалён',
    confirmDelete: 'Удалить штраф? Зарплата будет пересчитана.',
    settled: 'Погашено',
  },

  deductionType: {
    late: 'Опоздание / неявка',
    unsettled_payment: 'Не сдана выручка',
    other: 'Другое',
    advance: 'Аванс',
  },

  advance: {
    confirmTitle: 'Удаление аванса',
    confirmDelete: 'Удалить аванс {amount}? Зарплаты будут пересчитаны.',
    deleted: 'Аванс удалён',
    settled: 'Удержан полностью',
  },

  bonus: {
    confirmTitle: 'Удаление премии',
    confirmDelete: 'Удалить премию {amount}? Зарплата будет пересчитана.',
    deleted: 'Премия удалена',
  },

  receipts: {
    hint:
      'Платежи, принятые сотрудником, но ещё не подтверждённые администратором. ' +
      'До подтверждения эти деньги числятся за сотрудником.',
  },

  receiptStatus: {
    pending: 'Не подтверждён',
    rejected: 'Отклонён',
    confirmed: 'Подтверждён',
  },

  tabs: {
    late: 'Опоздания',
    receipts: 'Не сдано в кассу',
    deductions: 'Штрафы',
    advances: 'Авансы',
    bonuses: 'Премии',
    months: 'Посещаемость по месяцам',
  },

  table: {
    date: 'Дата',
    arrived: 'Время прихода',
    lessonAt: 'Время урока',
    late: 'Опоздание',
    receivedAt: 'Принято',
    student: 'Ученик',
    amount: 'Сумма',
    checkNo: 'Номер чека',
    month: 'Месяц',
    remainingDeduction: 'Остаток долга',
    reasonType: 'Тип',
    reason: 'Причина',
    deducted: 'Удержано',
    leftToDeduct: 'Осталось удержать',
    comment: 'Комментарий',
    author: 'Кто записал',
    createdAt: 'Записано',
  },

  groups: {
    title: 'Группы',
    totalStudents: 'Всего учеников: {count}',
    name: 'Группа',
    subject: 'Предмет',
    schedule: 'Дни занятий',
    room: 'Кабинет',
    students: 'Ученики',
    period: 'Срок',
    status: 'Статус',
  },

  empty: {
    late: 'В этом месяце опозданий нет',
    receipts: 'Нет несданных денег',
    deductions: 'Штрафов нет',
    advances: 'Авансов нет',
    bonuses: 'Премий нет',
    months: 'Нет данных',
    groups: 'Группы пока не назначены',
  },
}
