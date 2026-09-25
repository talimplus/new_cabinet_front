export default {
  title: 'Посещаемость сотрудников',
  minutesShort: 'мин',
  hoursShort: 'ч',
  notConfigured:
    'Для центра не указаны координаты и IP Wi-Fi — проверить отметку «Пришёл» невозможно. ' +
    'Настройте на странице центров.',
  confirmAction: 'Подтвердить',

  tabs: {
    log: 'Отметки по дням',
    report: 'Отчёт',
  },

  card: {
    checkedIn: 'Приход на сегодня отмечен',
    notCheckedIn: 'Сегодня ещё не отмечено',
    checkInButton: 'Пришёл',
    arrivedAt: 'Время прихода: {time}',
    lateBy: 'опоздание {minutes} мин',
    firstLesson: 'Первый урок сегодня: {time}',
    noLessonToday: 'Сегодня уроков нет',
    geoNotice:
      'При нажатии кнопки записываются ваше местоположение и данные сети.',
    success: 'Отмечено. Хорошего дня!',
    alreadyCheckedIn: 'На сегодня уже отмечено',
    error: 'Ошибка при отметке',
  },

  filter: {
    center: 'Центр',
    from: 'Дата начала',
    to: 'Дата окончания',
    staff: 'Сотрудник',
    onlyLate: 'Только опоздания',
    onlyFlagged: 'Только подозрительные',
  },

  table: {
    staff: 'Сотрудник',
    date: 'Дата',
    arrived: 'Время прихода',
    late: 'Опоздание',
    confidence: 'Достоверность',
    source: 'Источник',
    lessonAt: 'урок: {time}',
  },

  confidence: {
    high: 'Достоверно',
    medium: 'Средне',
    low: 'Подозрительно',
  },

  source: {
    self: 'Отметил сам',
    reception: 'Ресепшн',
    manual: 'Внесено вручную',
  },

  flags: {
    no_geo: 'местоположение не передано',
    low_gps_accuracy: 'низкая точность GPS',
    far_from_center: 'далеко от центра',
    ip_mismatch: 'не в Wi-Fi центра',
    center_not_configured: 'центр не настроен',
    shared_device: 'с одного телефона несколько сотрудников',
    no_lesson_today: 'сегодня уроков нет',
  },

  report: {
    expectedDays: 'Дни с уроками',
    attendedDays: 'Дни прихода',
    missedDays: 'Не пришёл',
    lateDays: 'Дни с опозданием',
    totalLate: 'Всего опозданий',
    flagged: 'Подозрительные',
    hint:
      '«Не пришёл» — дни, когда урок был, но приход не отмечен. ' +
      'Будущие уроки не учитываются.',
  },

  manual: {
    button: 'Отметить вручную',
    title: 'Отметить за сотрудника',
    staff: 'Сотрудник',
    date: 'Дата',
    time: 'Время прихода',
    note: 'Комментарий',
    hint:
      'Такая запись помечается как «внесено вручную» и так и отображается в отчёте.',
  },

  messages: {
    confirmed: 'Запись подтверждена',
    deleted: 'Запись удалена',
    manualSaved: 'Посещаемость сохранена',
  },
}
