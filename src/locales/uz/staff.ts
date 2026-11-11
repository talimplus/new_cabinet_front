export default {
  title: 'Xodim sahifasi',
  myTitle: 'Mening faoliyatim',
  viewAction: "Xodim sahifasini ko'rish",
  month: 'Oy',

  stats: {
    lateDays: 'Kechikkan kunlar',
    missedDays: 'Kelmagan kunlar',
    missedHint: '{days} ta darsli kundan',
    unsettled: 'Topshirilmagan pul',
    unsettledHint: '{count} ta chek',
    deduction: 'Shu oy jarima',
    deductionHint: "qoldiq: {amount}",
    advance: 'Shu oy avans',
    advanceHint: 'keyingi oyliklarga: {amount}',
    bonus: 'Shu oy mukofot',
    bonusHint: "oylikka qo'shiladi",
  },

  salary: {
    title: '{month} oyligi',
    base: 'Hisoblangan',
    bonus: '+ Mukofot',
    fine: '− Jarima',
    advance: '− Avans',
    deduction: 'Ushlab qolindi',
    net: 'Beriladigan',
    paid: "To'langan",
    remaining: 'Qolgan',
    appliedTitle: 'Ushlab qolinganlar:',
    fromMonth: '{month} dan qolgan',
    outstandingHint:
      "Hali ushlanmagan jarima: {amount}. Bu summa keyingi oyliklardan ushlab qolinadi.",
    advanceOutstandingHint:
      "Hali ushlanmagan avans: {amount}. Keyingi oyliklardan ushlanadi.",
    payButton: "Oylikni to'lash",
    payTitle: "Oylik to'lash",
    payAmount: "To'lanadigan summa",
    payPositive: "Summa 0 dan katta bo'lishi kerak",
    payTooMuch: 'Qolgan summadan ko‘p: {amount}',
    paySuccess: "Oylik to'landi",
  },

  deduction: {
    addButton: 'Jarima yozish',
    title: "Oylikdan ushlab qolish",
    amount: 'Ushlab qolinadigan summa',
    amountHint:
      "Oylikdan katta bo'lsa — sig'gani shu oyda ushlanadi, qolgani keyingi oyliklardan",
    type: 'Sabab turi',
    reason: 'Sabab',
    reasonHint: "Xodim buni o'z sahifasida ko'radi",
    success: 'Jarima yozildi',
    deleted: "Jarima o'chirildi",
    confirmDelete: "Jarimani o'chirmoqchimisiz? Oylik qayta hisoblanadi.",
    settled: 'Qoplangan',
  },

  deductionType: {
    late: 'Kechikish / kelmaslik',
    unsettled_payment: "Topshirilmagan pul",
    other: 'Boshqa',
    advance: 'Avans',
  },

  advance: {
    confirmTitle: "Avansni o'chirish",
    confirmDelete: "{amount} avansni o'chirmoqchimisiz? Oyliklar qayta hisoblanadi.",
    deleted: "Avans o'chirildi",
    settled: "To'liq ushlangan",
  },

  bonus: {
    confirmTitle: "Mukofotni o'chirish",
    confirmDelete: "{amount} mukofotni o'chirmoqchimisiz? Oylik qayta hisoblanadi.",
    deleted: "Mukofot o'chirildi",
  },

  receipts: {
    hint:
      "Xodim qabul qilgan, lekin admin hali tasdiqlamagan cheklar. Tasdiqlanmaguncha " +
      "bu pul xodimning javobgarligida hisoblanadi.",
  },

  receiptStatus: {
    pending: 'Tasdiqlanmagan',
    rejected: 'Rad etilgan',
    confirmed: 'Tasdiqlangan',
  },

  tabs: {
    late: 'Kechikishlar',
    receipts: 'Topshirilmagan pullar',
    deductions: 'Jarimalar',
    advances: 'Avanslar',
    bonuses: 'Mukofotlar',
    months: 'Oyma-oy davomat',
  },

  table: {
    date: 'Sana',
    arrived: 'Kelgan vaqti',
    lessonAt: 'Dars vaqti',
    late: 'Kechikish',
    receivedAt: 'Qabul qilingan',
    student: "O'quvchi",
    amount: 'Summa',
    checkNo: 'Chek raqami',
    month: 'Oy',
    remainingDeduction: 'Qolgan qarz',
    reasonType: 'Turi',
    reason: 'Sabab',
    deducted: 'Ushlangan',
    leftToDeduct: 'Ushlanadi',
    comment: 'Izoh',
    author: 'Kim yozgan',
    createdAt: 'Yozilgan',
  },

  groups: {
    title: 'Guruhlari',
    totalStudents: "Jami o'quvchilar: {count}",
    name: 'Guruh',
    subject: 'Fan',
    schedule: 'Dars kunlari',
    room: 'Xona',
    students: "O'quvchilar",
    period: 'Muddati',
    status: 'Holati',
  },

  empty: {
    late: "Bu oyda kechikish yo'q",
    receipts: "Topshirilmagan pul yo'q",
    deductions: "Jarima yozilmagan",
    advances: 'Avans berilmagan',
    bonuses: 'Mukofot yozilmagan',
    months: "Ma'lumot yo'q",
    groups: "Hozircha guruh biriktirilmagan",
  },
}
