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
  },

  salary: {
    title: 'Зарплата за {month}',
    base: 'Начислено',
    deduction: 'Удержано',
    net: 'К выдаче',
    remaining: 'Остаток',
    appliedTitle: 'Удержания:',
    fromMonth: 'перенос с {month}',
    outstandingHint:
      'Неудержанный штраф: {amount}. Эта сумма будет удержана из следующих зарплат.',
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
  },

  empty: {
    late: 'В этом месяце опозданий нет',
    receipts: 'Нет несданных денег',
    deductions: 'Штрафов нет',
    months: 'Нет данных',
  },
}
