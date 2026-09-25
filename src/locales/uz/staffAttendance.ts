export default {
  title: 'Xodimlar davomati',
  minutesShort: 'daq',
  hoursShort: 'soat',
  notConfigured:
    "Markazga joylashuv va Wi-Fi IP kiritilmagan — “Keldim” bosilganini tekshirib bo'lmaydi. " +
    'Markazlar sahifasida sozlang.',
  confirmAction: 'Tasdiqlash',

  tabs: {
    log: 'Kunlik yozuvlar',
    report: 'Hisobot',
  },

  card: {
    checkedIn: 'Bugun ishga kelganingiz belgilandi',
    notCheckedIn: 'Bugun hali belgilanmagan',
    checkInButton: 'Keldim',
    arrivedAt: 'Kelgan vaqt: {time}',
    lateBy: '{minutes} daqiqa kechikish',
    firstLesson: 'Bugungi birinchi dars: {time}',
    noLessonToday: "Bugun darsingiz yo'q",
    geoNotice:
      "Tugmani bosganingizda joylashuvingiz va tarmoq ma'lumotingiz yozib olinadi.",
    success: 'Belgilandi. Ishingizga omad!',
    alreadyCheckedIn: 'Bugun allaqachon belgilangan',
    error: 'Belgilashda xatolik',
  },

  filter: {
    center: 'Filial',
    from: 'Boshlanish sanasi',
    to: 'Tugash sanasi',
    staff: 'Xodim',
    onlyLate: 'Faqat kechikkanlar',
    onlyFlagged: 'Faqat shubhalilar',
  },

  table: {
    staff: 'Xodim',
    date: 'Sana',
    arrived: 'Kelgan vaqti',
    late: 'Kechikish',
    confidence: 'Ishonchlilik',
    source: 'Manba',
    lessonAt: 'dars: {time}',
  },

  confidence: {
    high: 'Ishonchli',
    medium: "O'rtacha",
    low: 'Shubhali',
  },

  source: {
    self: "O'zi belgilagan",
    reception: 'Qabulxona',
    manual: "Qo'lda kiritilgan",
  },

  flags: {
    no_geo: 'joylashuv berilmagan',
    low_gps_accuracy: 'GPS aniqligi past',
    far_from_center: 'markazdan uzoqda',
    ip_mismatch: "markaz Wi-Fi'sida emas",
    center_not_configured: 'markaz sozlanmagan',
    shared_device: 'bitta telefondan bir necha xodim',
    no_lesson_today: "bugun darsi yo'q",
  },

  report: {
    expectedDays: 'Darsli kunlar',
    attendedDays: 'Kelgan kunlar',
    missedDays: 'Kelmagan',
    lateDays: 'Kechikkan kunlar',
    totalLate: 'Jami kechikish',
    flagged: 'Shubhali',
    hint:
      '“Kelmagan” — o‘sha kuni darsi bo‘lgan, lekin kelgani belgilanmagan kunlar. ' +
      'Kelajakdagi darslar hisobga olinmaydi.',
  },

  manual: {
    button: "Qo'lda belgilash",
    title: "Xodim o'rniga belgilash",
    staff: 'Xodim',
    date: 'Sana',
    time: 'Kelgan vaqti',
    note: 'Izoh',
    hint:
      "Bu yozuv “qo'lda kiritilgan” deb belgilanadi — hisobotda shunday ko'rinadi.",
  },

  messages: {
    confirmed: 'Yozuv tasdiqlandi',
    deleted: "Yozuv o'chirildi",
    manualSaved: 'Davomat saqlandi',
  },
}
