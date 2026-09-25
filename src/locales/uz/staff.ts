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
  },

  salary: {
    title: '{month} oyligi',
    base: 'Hisoblangan',
    deduction: 'Ushlab qolindi',
    net: "Qo'lga tegadi",
    remaining: 'Qolgan',
    appliedTitle: 'Ushlab qolinganlar:',
    fromMonth: '{month} dan qolgan',
    outstandingHint:
      "Hali ushlanmagan jarima: {amount}. Bu summa keyingi oyliklardan ushlab qolinadi.",
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
  },

  empty: {
    late: "Bu oyda kechikish yo'q",
    receipts: "Topshirilmagan pul yo'q",
    deductions: "Jarima yozilmagan",
    months: "Ma'lumot yo'q",
  },
}
