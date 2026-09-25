export default {
  title: 'Markazlar',
  searchLabel: 'Markaz nomi',
  table: {
    id: 'ID',
    name: 'Nomi',
    default: 'Standart',
  },
  form: {
    centerName: 'Markaz nomi',
    defaultCenter: 'Standart markaz',
  },
  attendance: {
    title: 'Xodimlar davomati sozlamalari',
    hint:
      "Bular to'ldirilsa, xodim “Keldim” bosganida haqiqatan markazda ekani tekshiriladi. " +
      "Bo'sh qoldirilsa davomat baribir yig'iladi, lekin tekshirib bo'lmaydi.",
    latitude: 'Kenglik (latitude)',
    longitude: 'Uzunlik (longitude)',
    useMyLocation: 'Hozirgi joylashuvimni olish',
    radius: 'Ruxsat etilgan radius (metr)',
    radiusHint: "Shu masofa ichidan bosilgan “Keldim” joylashuv bo'yicha to'g'ri hisoblanadi",
    publicIp: "Markaz Wi-Fi'sining tashqi IP'si",
    publicIpHint:
      "Eng ishonchli tekshiruv: bu tarmoqqa faqat bino ichidan ulanib bo'ladi",
    captureIp: "Hozirgi IP'ni markaz IP'si sifatida saqlash",
    geoTaken: 'Joylashuv olindi',
    geoDenied: "Joylashuvga ruxsat berilmadi",
    geoUnsupported: "Brauzer joylashuvni qo'llab-quvvatlamaydi",
    ipTaken: "Markaz IP'si saqlandi: {ip}",
    ipError: "IP'ni aniqlab bo'lmadi",
  },
  dialog: {
    createTitle: 'Markaz yaratish',
    editTitle: 'Markazni tahrirlash',
  },
  empty: "Markaz yo'q",
  nameRequired: 'Markaz nomi majburiy',
}
