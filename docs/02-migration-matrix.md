# Migratsiya matritsasi — eski `cabinet_front` → yangi `cabinet_front_new`

> **Maqsad:** eski Vuetify loyihadagi **barcha** funksional yangi Tailwind
> loyihaga hech narsa qolib ketmasdan ko'chirilishi. Bu hujjat — yagona manba
> (single source of truth). Har bir ish tugagach shu yerdagi katakcha
> belgilanadi.
>
> Manba: `/Users/nematoff/Developer/Active/Lazizbek/cabinet_front` (read-only).
> Sana: 2026-09-23 holatiga ko'ra to'liq kod tahlili asosida tuzilgan.

**Qanday ishlatiladi**

1. Ishni **§7 (navbat)** dan olasiz.
2. Sahifa uchun **§2** dagi bo'limni ochasiz — u yerda o'sha sahifaning har bir
   tugmasi/filtri/modali ro'yxati bor.
3. Endpoint yozishdan oldin **`api-integration` skill** (majburiy, `conventions.md` §5.2.1).
4. Tugagach **§6 (Definition of Done)** bo'yicha tekshirasiz va katakchalarni belgilaysiz.

**Har bir sahifaga tegishli 2 ta doimiy qoida:**

- 🌐 **Matnlar i18n kalitlari orqali (uz + ru)** — hardcode matn yozilmaydi (§4.2).
- 📱 **Telefonda mukammal ishlashi shart** — 375px da tekshiriladi (§4.5).

**Belgilar:** `[ ]` qilinmagan · `[x]` qilingan va tekshirilgan · `[~]` qisman ·
`⏸️` ataylab keyinga qoldirilgan

---

## 1. Sahifalar (route) inventari

Eski loyihada **31 route** — **hammasi yangisida bor** (2026-09-25, 5-bosqich sverkasi).
Quyidagi jadval — to'liq moslik.

| # | Eski route | Eski fayl | Yangi holat | Status |
|---|---|---|---|---|
| 1 | `/login` | `views/auth/login.vue` | `auth/views/LoginView.vue` | `[x]` |
| 2 | `/register` | `views/auth/register.vue` | `auth/views/RegisterView.vue` | `[x]` |
| 3 | `/statistics` | `views/statistics.vue` | `dashboard/views/DashboardView.vue` (`/`) | `[x]` grafiklar ⏸️ keyinga |
| 4 | `/users` | `views/users.vue` | `users/views/UsersView.vue` | `[x]` §2.7 |
| 5 | `/roles` | `views/roles.vue` | `roles/views/RolesView.vue` | `[x]` |
| 6 | `/subjects` | `views/subjects.vue` | `subjects/views/SubjectsView.vue` | `[x]` |
| 7 | `/syllabuses` | `views/syllabuses/index.vue` | `syllabuses/views/SyllabusesView.vue` | `[x]` §2.13 |
| 8 | `/syllabuses/:id` | `views/syllabuses/view.vue` | `syllabuses/views/SyllabusDetailView.vue` | `[x]` |
| 9 | `/today` | `views/teacher/today.vue` | `today/views/TodayView.vue` | `[x]` §3.9 |
| 10 | `/groups` | `views/groups/index.vue` | `groups/views/GroupsView.vue` | `[x]` §2.3 |
| 11 | `/groups/:id` | `views/groups/view.vue` | `groups/views/GroupDetailView.vue` | `[x]` §2.4 |
| 12 | `/schedule` | `views/schedule/index.vue` + `ScheduleBoard.vue` | `schedule/views/ScheduleView.vue` | `[x]` §3.5 |
| 13 | `/users/:id` (xodim kartasi) | `views/staff/view.vue` + `StaffOverview.vue` | `staff/views/StaffPerformanceView.vue` | `[x]` §3.4 |
| 14 | `/my-performance` | `views/staff/my.vue` + `StaffOverview.vue` | `staff/views/StaffPerformanceView.vue` | `[x]` §3.4 |
| 15 | `/staff-attendance` | `views/staff-attendance/index.vue` | `staff-attendance/views/StaffAttendanceView.vue` | `[x]` §3.3 |
| 16 | `/centers` | `views/centers.vue` | `centers/views/CentersView.vue` | `[x]` §2.8 |
| 17 | `/rooms` | `views/rooms/index.vue` | `rooms/views/RoomsView.vue` | `[x]` |
| 18 | `/organization` | `modules/organization/views/OrganizationView.vue` | ✅ | `[x]` |
| 19 | `/telegram` | `views/telegram.vue` | `telegram/views/TelegramSettingsView.vue` | `[x]` |
| 20 | `/reception` | `views/students/reception.vue` | `StudentsView(variant=reception)` | `[x]` §2.5 |
| 21 | `/leads` | `views/leads.vue` | `leads/views/LeadsView.vue` | `[x]` §2.6 |
| 22 | `/students` | `views/students/students.vue` | `StudentsView(variant=active)` | `[x]` §2.5 |
| 23 | `/students/:id` (o'quvchi kartasi) | `views/students/view.vue` | `students/views/StudentCardView.vue` | `[x]` |
| 24 | `/stopped` | `views/students/stopped.vue` | `StudentsView(variant=stopped)` | `[x]` |
| 25 | `/ignored` | `views/students/ignored.vue` | `StudentsView(variant=ignored)` | `[x]` |
| 26 | `/finished` | `views/students/finished.vue` | `StudentsView(variant=finished)` | `[x]` |
| 27 | `/payments` | `views/payments.vue` | `payments/views/PaymentsView.vue` | `[x]` |
| 28 | `/payroll` | `views/payroll.vue` | `payroll/views/PayrollView.vue` | `[x]` |
| 29 | `/expenses` | `views/expenses.vue` | `expenses/views/ExpensesView.vue` | `[x]` |
| 30 | `/pending-receipts` | `views/pending-receipts.vue` | `pending-receipts/views/…` | `[x]` |
| 31 | `/profile` | `modules/profile/views/ProfileView.vue` | ✅ | `[x]` |

---

## 2. Sahifa ichidagi funksional bo'shliqlar

> Bu bo'lim eng muhimi: **ikkala loyihada ham bor sahifalarning ichida**
> yangisida yo'q narsalar.

### 2.1 `/payments` — To'lovlar  ✅ **BAJARILDI (2026-09-24)**

Eski: `views/payments.vue` (1475 qator) + `ExclusionCard`, `PaymentHistoryModal`, `CheckModal`.

- [x] **Excel eksport — oy bo'yicha** (`exportPayments`, joriy filtrlar, paginatsiyasiz, blob → download, fayl nomi backenddan)
- [x] **Excel eksport — sana oralig'i bo'yicha** (dialog: `dateFrom`/`dateTo`, ikkalasi ixtiyoriy, `forMonth` yuborilmaydi, `from > to` validatsiyasi)
- [x] **Ustoz bo'yicha filtr** (`teacherId`) — ustoz tanlanganda guruhlar ro'yxati o'sha ustozning guruhlariga qisqaradi (`fetchAllGroups(centerId, teacherId)`)
- [x] **`payableNow` mantig'i** — `payableNow ?? max(0, remaining − pendingAmount)` (`utils/payable.ts`)
- [x] Jadval ustuni: **"Tasdiq kutmoqda"** (so'rovlar soni + `pendingAmount`)
- [x] Jadval ustuni: **`hardDueDate`** (qattiq muddat)
- [x] `amountDue` ostida: **`refundedAmount`** (qaytarilgan) va **`manualExcludedAmount` + sababi**
- [x] **Muddati o'tgan qator fon rangi** (`isOverdue` → `UiTable` ning yangi `rowClass` proplari orqali, jadvalda ham kartada ham)
- [x] **Chiqarib tashlash (exclusion) bloki** — `PaymentExclusionCard`: `previewExclusion` → `applyExclusion`; ikkala modalda ham; sabab majburiy; preview'dan keyin summa qayta hisoblanadi; `newRemaining − pendingAmount` bo'yicha tasdiqlash bloklanadi
- [x] **To'lov usuli** (`PaymentMethod` enum: `cash / card / bank_transfer / online`) — ikkala modalda
- [x] **`paidAt`** maydoni — faqat `card` tanlanganda
- [x] **Izoh** maydoni — ikkala modalda (`PaymentReceptionFields`)
- [x] **Chek modali** (`PaymentCheckModal` + `PaymentCheckCard`) — muvaffaqiyatli to'lovdan keyin avtomatik ochiladi (`response.check`)
- [x] **To'lov tarixi modali** (`PaymentHistoryModal`) — `fetchPaymentReceipts`, chekni qayta chop etish
- [x] To'liq to'lash modalida: `lessonsBillable / lessonsPlanned`, `perLessonAmount` (`PaymentSummaryBlock`)
- [x] Qisman to'lov modalida: `fullAmount`, `perLessonAmount` ko'rsatkichlari
- [x] Hisoblash natijasi (`PaymentCalcSummary`) — `difference` bo'yicha "qaytariladi / qo'shimcha"
- [x] "Sanani tozalash" tugmasi (hisoblashni bekor qiladi va summa maydonini bo'shatadi)
- [x] Oy tablari: **o'tgan oylar xira ko'rinishi** (`isPast`)
- [x] Yil o'zgarganda joriy oydan keyingi oylar chiqmasligi + tanlangan oy joriy oyga qaytariladi

> ⚠️ `perLessonAmount` / `fullAmount` / `isProrated` **faqat**
> `GET /payments/student/{id}/summary` javobida bor — `GET /payments` ularni
> qaytarmaydi. Shuning uchun modallarda ular ixtiyoriy va bor bo'lsagina
> ko'rsatiladi (eski loyihada ham shunday edi). Chiqarib tashlash bloki esa
> `preview-exclusion` javobidan `perLessonAmount` ni oladi.

### 2.2 `/pending-receipts` — Tasdiqlash uchun to'lovlar  ✅ **BAJARILDI (2026-09-24)**

Eski: `views/pending-receipts.vue` (923 qator).

- [x] **4 ta statistika kartasi** (`fetchReceiptsStats`): tasdiqlangan / kutilmoqda / rad etilgan / jami — summa + soni (`UiStatCard`)
- [x] **Sana filtri** (`dateFrom` / `dateTo`) + "Filtrlarni tozalash" + `from > to` validatsiyasi (so'rov umuman yuborilmaydi)
- [x] **Ko'p tanlash (checkbox)** — `Map` asosida, **sahifalar orasida saqlanadi**, tanlanganlar summasi ko'rsatiladi
- [x] **"Belgilanganlarni oldim"** paneli + "Sahifadagilarni belgilash" (indeterminate holati bilan)
- [x] **"Barchasini oldim"** tugmasi (`confirmReceipts({ all: true, ...filter })`) — soni va summasi bilan; filtrsiz bo'lsa ogohlantirish
- [x] Natija xabari: `confirmedCount / skippedCount / failedCount` (to'liq → success, qisman → warning, 0 → error)
- [x] **Rad etish sababi** (`rejectReceipt(id, reason)`) — modalda textarea, trim qilinadi
- [x] Tasdiqlash va rad etish dialoglarida summa + oy ko'rsatilishi
- [x] Qator tugmalari `Tasdiqlash` / `Rad etish` — **matnli tugma**
- [x] Filtrlanganda bo'sh holat matni boshqacha (`emptyFiltered`)

> `meta.totalAmount` — filterga mos **barcha** pending cheklar summasi (joriy sahifa
> emas); "Barchasini oldim" tugmasi aynan shundan o'qiydi. Backend bermasa
> joriy sahifa yig'indisiga tushib qoladi.

### 2.3 `/groups` — Guruhlar  ✅ **BAJARILDI (2026-09-24)**

- [x] **Ustoz bo'yicha filtr** (`fetchTeachers` → `GET /users/teachers`; `GroupFilters`);
      o'qituvchiga (`isTeacher`) yoki `users/groups/students.view` yo'qlarga ko'rinmaydi;
      eskirgan tanlov ro'yxatdan tushsa tozalanadi
- [x] Jadval ustunlari: **`startDate`**, **`endDate`** (`GroupsTable`)
- [x] `endDate` yo'q bo'lsa — **sariq ogohlantirish chipi** (`UiBadge warning`) + tooltip (`noEndDateHint`)
- [x] **`upcomingMonthlyFee`** — "{date} dan: {fee}" izohi narx ostida (`upcomingFeeFromMonth`)
- [x] Status o'zgartirish **422 ishlovi**: `endDate`/`roomId` yetishmasa — xabar + tahrirlash
      formasi ochiladi va xato aynan shu maydon ostida (`statusErrors` → `setFieldErrors`)
- [x] **"Guruhni yakunlash" tasdiq dialogi** (`UiConfirmDialog`) — faqat `endDate` kelajakda bo'lsa
- [x] Status o'tishlari: `NEW→STARTED`, `STARTED→NEW|FINISHED` (`GROUP_STATUS_TRANSITIONS`;
      eski `FINISHED→STARTED` restart yo'q — hozircha bo'sh, kerak bo'lsa qo'shiladi)
- [x] O'chirish — `confirm()` o'rniga **`UiConfirmDialog`** (yangi shared primitiv, danger variant)
- [x] Guruh formasi: **`endDate`** maydoni (datepicker + bo'sh bo'lsa ogohlantirish + qisqartirish tasdiqi)
- [x] Guruh formasi: **`lessonDurationMinutes`** (dars davomiyligi, default 90, "daqiqa") —
      eski fantom `durationMonths` olib tashlandi (backendda yo'q edi; Info tab ham tuzatildi)
- [x] Guruh formasi: **`applyFeeNow`** checkbox (`GroupFeeHint`) → `applyFeeFrom`
      (`current_month`/`next_month` enum); faqat tahrirlashda va narx o'zgarganda; info/warning izoh

> ⚠️ `GET /groups` `status` filtri **yo'q** (Swagger tasdiqladi) — faqat `teacherId`+`name`.
> `monthlyFee`/`upcomingMonthlyFee` backendda **string** ("400000") — formatlashda `Number()` bilan coerce qilinadi.
> `GroupsView` thin qilib qayta tuzildi: `GroupFilters` + `GroupsTable` + `GroupFormModal` + `GroupFeeHint`.
> Ma'lum kichik nuqson: `UiDatepicker` `format` propini vue-datepicker qo'llamayapti (app-wide, sana US formatida ko'rinadi) — sana **to'g'ri saqlanadi**, alohida shared-fix kerak.

### 2.4 `/groups/:id` — Guruh kartasi  ✅ **BAJARILDI (2026-09-24)**

- [x] **Oy/yil tanlagich** + "Joriy oy" tugmasi (`AttendancePicker`) — backendda oy
      rejimi yo'q, shuning uchun oy = `mode:'range'` bilan oyning boshi/oxiri
      yuboriladi (`use-attendance` `monthRange`). Eski "oxirgi N dars" + erkin
      sana oralig'i olib tashlandi (eski app faqat oy ko'rinishida edi)
- [x] **A'zolik oynasi** (`joinedAt` inclusive / `leftAt` exclusive): `lesson-dates`
      javobidagi `students[]` dan o'qiladi; oynadan tashqari kataklar tahrirlanmaydi,
      "—" (Minus) ko'rsatiladi, hover'da sabab (`beforeJoin` / `afterLeave`).
      Jonli tekshiruvda tasdiqlandi: backend `students[{id,firstName,lastName,joinedAt,leftAt}]` qaytaradi
- [x] Katakda **izoh borligi belgisi** (burchakdagi nuqta) — allaqachon mavjud edi
- [x] Dars sarlavhasida **`cancelled` / `extra` yorlig'i** (`overrideType` → header'da chip)
- [x] **O'quvchilarni boshqa guruhga ko'chirish**: transfer modal + composable
      **`shared/` ga ko'tarildi** (`shared/components/transfer/StudentTransferModal.vue`,
      `shared/composables/use-student-transfer.ts`, `shared/api/transfer.api.ts`,
      `shared/interfaces/student-transfer.interface.ts`) — endi ikkala modul (students
      karta + guruh tabi) ishlatadi; `fetchAllGroups` inyeksiya qilinadi (shared →
      modules import qilmaydi). Students tab'da checkbox bilan ko'p tanlash
      (`use-group-students-transfer`) + `sourceGroupClosed` info toast (composable ichida)
- [x] **Ma'lumot tabi (Info)** — asosiy ma'lumot, jadval, xulosa (o'quvchilar soni,
      haftalik darslar, tugash sanasi); tugash sanasi yo'q bo'lsa ogohlantirish chipi
- [x] Tab'lar ruxsat bo'yicha ochilishi (`attendance.view`, `groupPlan.view`, `students.view`; Info doim)

### 2.5 `/students`, `/reception` — O'quvchilar  ✅ **BAJARILDI (2026-09-25)**

- [x] **"Ko'rish" (ko'z) tugmasi** → `/students/:id` (o'quvchi kartasi) — 2026-09-24
- [x] ~~**O'quvchini o'chirish** (`deleteStudent`)~~ — ⚠️ **`DELETE /students/{id}`
      backendda yo'q** (2026-09-23 tekshiruvi). Eski app uni chaqirib 404 olardi.
      **Qaror:** yangida buzuq "o'chirish" tugmasi umuman qo'shilmaydi; reception'da
      leadni "olib tashlash" = status dropdown'idan `NEW→IGNORED` (allaqachon mavjud).
      `deleteStudent` API yozilmadi
- [x] **O'quvchini o'chirish** — 2026-10-01 backendga `DELETE /students/{id}` qo'shildi
      (`students.delete`, faqat `new` va to'lov/davomat tarixisiz). `deleteStudent` +
      `useStudentDelete` + `StudentDeleteDialog`: ro'yxat qatorida (qizil savat) va kartada
      tugma faqat ruxsat + `new` statusda; tasdiqdan keyin ro'yxat qayta yuklanadi,
      kartadan `reception` ga qaytariladi; tarix borligi faqat backend xatosi (toast) orqali.
- [x] **"Guruhsiz ACTIVE qilib bo'lmaydi"** tekshiruvi — `use-students` `requestStatus`
      da: `ACTIVE` ga o'tishda `groupIds` bo'sh bo'lsa `students.messages.groupRequired`
      toast'i, so'rov yuborilmaydi (jonli tasdiq: `/students` javobida `groupIds` bor)
- [x] Status o'tishlari sahifa bo'yicha turlicha — `STUDENT_STATUS_TRANSITIONS`
      (enum): `NEW→ACTIVE|IGNORED`, `ACTIVE→STOPPED|FINISHED`, `IGNORED/STOPPED/FINISHED→NEW`
      (eski `reception/students/stopped/ignored/finished.vue` `statusList` bilan aynan mos)
- [x] Chegirma ustunida **sabab tooltip'i** (20 belgidan uzun bo'lsa qisqartiriladi) —
      `StudentDiscountCell` (har period `percent% — sabab`, `truncate()` + `title`);
      `shared/utils/truncate.ts`
- [x] `reception` da **qulay kunlar chiplari** — `StudentDaysCell` (`UiBadge` chiplar,
      bo'sh bo'lsa `—`); eskisidagi vergulli matn o'rniga

> Brauzerda tekshirildi: chegirma yacheykasi (student 29, 2 period — biri uzun
> sabab bilan) light/dark + 375px karta ko'rinishida to'g'ri chiqadi, uzun sabab
> `…` bilan qisqaradi va to'liq matn `title`'da; konsol toza.
> ⚠️ Reception "Qo'shish" jonli sinovi test org'da bloklandi: `POST /students`
> ichki `student` base-role foydalanuvchi yaratadi, lekin org 2 da `student` tizim
> roli yo'q (presetlarda ham yo'q) → 400 "Rol tanlanmagan". Bu **backend seed
> kamchiligi** (eski app'da ham xuddi shunday 400 bo'lardi), frontend regressiyasi
> emas; chiplar unit-test bilan qoplandi.

### 2.6 `/leads` — Leads  ✅ **BAJARILDI (2026-09-25)**

- [x] Status o'zgartirish faqat `NEW` da ochiq — `LEAD_STATUS_TRANSITIONS`: faqat
      `NEW→[DISCARDED]`; boshqa statuslar terminal (dropdown yo'q, oddiy badge).
      Jonli tasdiq: NEW da faqat "Rad etilgan" varianti, rad etilgach oddiy badge
- [x] Forma: **passport / JSHSHIR tab'lari** — `LeadPassportFields` `watch(tab)`
      almashganda ikkinchisining qiymatini tozalaydi (allaqachon mavjud edi)
- [x] Forma: markaz — **arxitektura o'zgardi**: formada markaz tanlagichi yo'q
      (global scope §5.5), shuning uchun forma ichida markaz almashtirib bo'lmaydi;
      guruhlar `defaultCenterId` (aktiv/tahrirlanayotgan markaz) uchun yuklanadi
      (jonli tasdiq: `GET /groups/all?centerId=4`, dropdown to'ldi)
- [x] Forma: bo'sh ixtiyoriy maydonlar payload'dan olib tashlanishi — `use-lead-form`
      `toPayload` faqat to'ldirilgan maydonni qo'shadi (`cleanOptionalFields` ekvivalenti)
- [x] `canSwitch` bo'lmasa `centerId` — `scope.centerIdForCreate` orqali (butun ilova
      konvensiyasi §5.5; almashtira olmaydigan foydalanuvchiga o'z markazi, "barcha
      filiallar"da default). Forma boshqa yaratish formalari bilan bir xil ishlaydi
- [x] "O'quvchiga o'tkazish" (`transferLeadToStudent`) — `toTransferPayload` endi
      `discountPeriods: []` yuboradi (eski app bilan mos; DTO'da ixtiyoriy massiv)

> `use-lead-form` composable'i uchun 13 test yozildi (`toPayload` tozalash,
> passport/jshshir eksklyuzivligi, `toTransferPayload` `discountPeriods: []` +
> `status=NEW` + `followUpDate` olib tashlanishi, `validate`, `reset`). Jonli
> tekshirildi: NEW→rad etish oqimi (sabab dialogi), guruhlar dropdowni, dark tema.
> ⚠️ "O'quvchiga o'tkazish"ning to'liq jonli sinovi §2.5 dagi kabi backend seed
> kamchiligi bilan bloklanadi (student yaratishda `student` tizim roli yo'q → 400).
> ✅ **2026-09-27:** `student` tizim roli qo'shildi (migratsiya `...055`), `POST /students` 201 qaytaradi.

### 2.7 `/users` — Ishchilar  ✅ **BAJARILDI (2026-09-24)**

- [x] **Rollar backenddan** (`fetchRoles` → `use-user-form`): dinamik rol nomlari (Menejer/Qabulxona/
      O'qituvchi/…, admin yaratgan "Kassir" ham); `baseRole === 'admin'` bo'lgan rol chiqarib tashlanadi
- [x] Jadvalda **rol nomi** `userRole.name` dan (fallback — `ROLE_LABEL_KEYS[role]` tur bo'yicha)
- [x] Jadval ustunlari: `salary`, `commissionPercentage` (`%`), `center.name` — tasdiqlandi (mavjud edi)
- [x] **Telefon bo'yicha filtr** (mavjud edi — `use-users` `phone` param)
- [x] **Xodim kartasiga (ko'z) tugmasi** → `/users/:id` (`canViewStaffPerformance` bilan, §3.4 route'iga)
- [x] **`roleId` yuborilishi** — `POST/PUT /users` da `roleId` (jonli tasdiq: majburiy); `role` string
      endi yuborilmaydi (backend `roleId` ning `baseRole` idan hisoblaydi)

> Modal `use-user-form.ts` composable'ga bo'lindi (rol yuklash + zod schema + payload) — 100 qator chegarasi.

### 2.8 `/centers` — Markazlar  ✅ **BAJARILDI (2026-09-25)**

Eski: `views/centers.vue` (147) + `CenterCreate.vue` (262). Yangi: `modules/centers/`
(`CenterAttendanceFields` + `use-center-attendance`). Kontrakt jonli tasdiqlandi
(`api-integration`: PUT /centers/{id} body + GET javob maydonlari + capture-ip).

- [x] **Xodim davomati sozlamalari** (faqat tahrirlashda — IP olish uchun `id` kerak):
      `latitude`, `longitude`, `checkInRadiusMeters` (default 150), `publicIp` (`CenterAttendanceFields`)
- [x] **"Mening joylashuvim"** tugmasi — brauzer geolokatsiyasi, `toFixed(7)` (7 xona aniqlik)
- [x] **"IP'ni olish"** tugmasi — `captureCenterIp(id)` (`skipGlobalError` — xato composable'da,
      bitta toast; `resolveErrorMessage` backend sababini ko'rsatadi)
- [x] Bo'sh koordinatalar `null` bo'lib yuborilishi (0 emas) — `toCoord()` (`'' → null`)
- [x] Jadvalda **"Standart"** ustuni (✓ belgisi) — allaqachon mavjud edi
- [x] Nom bo'yicha qidiruv filtri — allaqachon mavjud edi (debounce)
- [x] Markaz o'zgargach header'dagi filial tanlagichi yangilanishi — `use-centers`
      submit/remove'dan keyin `scope.loadCenters(true)`
- [x] Yo'l-yo'lakay: `CentersView` da `UiIcon` import qilinmagani (konsol warning +
      "Yaratish" ikonkasi chiqmasdi) tuzatildi

> ⚠️ `POST /centers/:id/capture-ip` localhost'da 400 qaytaradi (loopback IP ni qabul
> qilmaydi) — bu kutilgan, tugma haqiqiy markaz tarmog'idan bosilishi kerak.
> Brauzerda tekshirildi: tahrirlashda bo'lim chiqadi, yaratishda chiqmaydi (2 input),
> 375px + dark, gorizontal skroll yo'q, konsolda xato yo'q.

### 2.9 `/subjects`, `/rooms`  ✅ **BAJARILDI (2026-09-25)**

- [x] `subjects`: jadvalda **markaz nomi** ustuni (`SubjectsView` `center` ustuni →
      `row.center?.name`; brauzerda "Markaz 1" ko'rindi)
- [x] `subjects`: nom bo'yicha qidiruv (`use-subjects` `filters.name` → `GET /subjects?name=`;
      backend `name` paramini qo'llab-quvvatlaydi, jonli 200 tasdiqlandi)
- [x] `rooms`: nom bo'yicha qidiruv (`use-rooms` `name` ref → `GET /rooms?name=`; jonli 200)
- [x] `fetchAllSubjects` — **`/subjects/all` backendda YO'Q**; eskisi ham shunchaki
      `GET /subjects` (`perPage: 999`) ishlatgan. Yangi appda fan optionlari
      `fetchSubjects({ perPage: 100 })` orqali yuklanadi (`use-student-options`,
      `use-students`, `use-group-options`) — o'quvchi formasi + filtri + guruh formasi.
      Fantom `/subjects/all` qatori `api-permissions.ts` dan olib tashlandi.

> Bo'shliqlarning hammasi allaqachon kod ichida bor edi (students/groups bilan birga
> kelgan). Bu sessiyada: fantom `/subjects/all` tozalandi, ikkala view'dagi
> **`UiIcon` import bug'i** tuzatildi (konsol warning'i yo'qoldi), `use-subjects` +
> `use-rooms` uchun 17 test yozildi. type-check + 1305 test + build yashil; 375px +
> dark tekshirildi, konsol toza.

### 2.10 `/payroll` — Ish haqi  ✅ **BAJARILDI (2026-09-24)**

- [x] **Jarima (deduction) ustuni** — `deductionAmount` (qizil, minus bilan) + `deductionOutstanding` ("qoldiq jarima")
- [x] To'lov modalida **"Jarima qo'shish"** bloki: `amount`, `type` (`late` / `unsettled_payment` / `other`), `reason` → `payStaffSalary` payload'idagi `deduction` obyekti
- [x] **Faqat jarima yozish** (to'lovsiz, `amount = 0`) imkoniyati
- [x] **Xodim kartasi modali** — yangi `modules/staff/` moduli (`StaffOverviewCard` + `StaffOverviewModal`), jadvaldagi ko'z tugmasidan ochiladi
- [x] `remaining` hisobi: `remaining ?? total − deduction − paid`
- [x] Yil ro'yxati **markaz ochilgan sanadan** boshlanishi (`center.createdAt`)
- [x] Oy tablari markaz ochilgan oydan boshlanishi (va joriy oydan keyin ko'rinmasligi)
- [x] Status bo'yicha **qator fon rangi** (unpaid/partial/paid) — `UiTable` ning `rowClass` i orqali
- [x] Ustama ustuni faqat ustozlar bo'lsa ko'rinishi (`hasTeachers`)
- [x] Rol nomi `userRole.name` dan

> ⚠️ `GET /staff-salaries` faqat **oy boshidan oldin yaratilgan** xodimlar uchun
> qator hosil qiladi (`user.createdAt < monthStart`), va kelasi oy uchun 400
> qaytaradi. Shuning uchun yangi qo'shilgan xodim joriy oy ro'yxatida ko'rinmaydi
> — bu backend qoidasi, front tomondan tuzatilmaydi.

### 2.11 `/expenses` — Chiqimlar  ✅ **BAJARILDI (2026-09-25)**

- [x] **Yil tanlagich** + **oy tablari** — `ExpenseMonthFilter` yil `UiSelect` + oy
      `UiTabs` ga o'tkazildi. Joriy yilda faqat joriy oygacha tablar, boshqa yillarda
      12 ta (eski `availableMonths` mantig'i). Yil o'zgarganda oy `curMonth` gacha
      klamplanadi. Mobil: tablar gorizontal skroll (`UiTabs overflow-x-auto`).
- [x] O'tgan oylar xira ko'rinishi — `TabItem.muted` qo'shildi; tanlanmagan xira tab
      `opacity-60`. Jonli: Yanvar–Avgust xira, Sentabr yorqin.
- [x] Jadval ustunlari: **markaz** + **yaratilgan sana** (`ExpensesTable` da bor edi).
- [x] Formada **oy tanlagich** (`monthOptions()`, joriy yildan bir yil orqaga `YYYY-MM`;
      tahrirlanayotgan chiqim oyi diapazondan tashqarida bo'lsa ham tanlanadi).
- [x] Tahrirlashda `fetchExpense(id)` bilan to'liq ma'lumot olinishi — `openEdit` endi
      async, `GET /expenses/{id}` chaqiradi. Jonli tasdiqlandi.

> **Qo'shimcha topilgan bug (tuzatildi):** `amount` backenddan **string** keladi
> (`"12345.00"`), lekin interfeys `number` deb yozilgan edi. `Expense.amount`
> `string | number` qilindi; jadvalda `formatSom(Number(...))`, formada
> `Number(editing.amount)` bilan koersiya. PUT endi `amount: 12345` (number) yuboradi
> (jonli tasdiqlandi). `forMonth` GET da `YYYY-MM-DD`, formada `.slice(0,7)`.
>
> **Eskisi bilan qo'shimcha sverka (2026-09-25):** o'chirish dialogiga `loading`
> uzatilmagan edi — ikki marta bosilsa ikkita `DELETE` ketardi; `use-expenses`
> `deleting` flagi bilan himoyalandi (+1 test). Bo'sh holat `noExpensesForMonth`,
> qidiruv placeholder'i `expenses.searchPlaceholder`, summa maydonida "so'm" suffiksi.

### 2.12 `/statistics` → `/` (Dashboard)  ⏸️ KEYINGA QOLDIRILDI

> **Qaror (tasdiqlangan):** grafiklar hozir ko'chirilmaydi — keyin qo'shiladi.
> Sabab: eskisida grafiklar backenddan kelgan **yagona summani** oylarga bo'lib
> ko'rsatadi (mock ma'lumot), ya'ni haqiqiy qiymat bermaydi. To'g'ri qilish uchun
> avval backendda oylik vaqt qatori bo'lishi kerak.

Keyinga qoldirilgan (hozir `[ ]` qilinmaydi):

- `—` Daromad/xarajat ustunli grafigi (bar)
- `—` Pul oqimi donut grafigi
- `—` To'lovlar area grafigi
- `—` O'quvchilar line grafigi (jami / faol / qo'shilgan)
- `—` Davr tanlagich (oy / yil)

Qachon qaytiladi: backendda oylik vaqt qatori endpoint'i paydo bo'lganda
(`api-integration` skill bilan tekshirib). Grafik yozilganda `dataviz` skill
ishlatiladi va `ui-and-forms.md` tokenlari bilan ikkala mavzuga moslanadi.

Hozircha dashboard'da **raqamli kartalar va progress bloklari** qoladi (mavjud).

### 2.13 `/syllabuses/:id` — Kurs rejasi  ✅ **BAJARILDI (2026-09-25)**

- [x] Mavzu kartasida **kontent indikatorlari** — kodda bor edi, lekin mobilda
      (`hidden sm:flex`) umuman ko'rinmas edi. Endi sarlavha ostidagi meta qatorda har
      o'lchamda; har biri `role="img"` + `title/aria-label` ("Qo'llanma: To'ldirilgan").
- [x] **`estimatedLessons`** chipi — `'{n} dars'` hardcode edi → `editor.estimatedLessons`
      (ru: «{n} ур.»).
- [x] Drag & drop xatolikda **eski tartibga qaytish** — bor edi; jonli tasdiqlandi
      (reorder so'rovi 404 ga majburlandi → ro'yxat drag oldingi holatiga qaytdi).
- [x] `updateSyllabus` — API funksiyasi bor edi, lekin **UI da hech qayerdan chaqirilmagan**
      edi. `CreateSyllabusModal` → `SyllabusFormModal` (create + edit); detal sahifa
      sarlavhasida tahrirlash tugmasi. Fan optionlari **kurs rejasining o'z markazi**
      bo'yicha yuklanadi (backend boshqa markaz fanini 404 qiladi). Jonli: `PUT` 200.

> **Qo'shimcha topilgan va tuzatilganlar:**
> - **i18n:** modulda ~15 ta hardcode o'zbekcha matn (`Mavzular`, `Mavzu qo'shish`,
>   `Mavzu yo'q`, `To'ldirilmagan`, `Tahrir`, `Ko'rish`, `AI orqali yaratish`, `Yopish`,
>   `Bekor`, `O'chirish`, `Qo'shish`, `AI reja`, `Yozmoqda…`, `Masalan…`, o'chirish
>   tasdig'i, zod xabarlari) — rus tilida ham o'zbekcha chiqardi. Hammasi kalitlarga;
>   yangi kalitlar: `syllabuses.editTitle`, `syllabuses.validation.name` (uz+ru).
> - **Ruxsat:** AI tugmalari `canManageSyllabus` bilan (yoki umuman shartsiz — mavzu
>   muharririda) yopilgan edi; eskisidagidek `canUseSyllabusAi` (`syllabus.ai`) ga o'tkazildi.
> - **api-permissions:** `reorder` qoidasi `POST` deb yozilgan edi, backend — `PUT`.
> - **Konvensiya:** `TopicContentTabs` 103 qator + `type ContentKey` alias →
>   `TopicContentKey` enum (`enums/topic-content-key.enum.ts`), 98 qator.
> - **a11y/mobil:** mavzu muharriridagi o'chirish tugmasi yorliqsiz edi → `UiIconButton`;
>   "Orqaga" havolasi mobilda 44px.

---

## 3. Butunlay yo'q sahifalar (to'liq qurish kerak)

### 3.1 `/students/:id` — O'quvchi kartasi  ✅ **BAJARILDI (2026-09-24)**

Eski: `views/students/view.vue` (797 qator).

- [x] Sarlavha: avatar (bosh harflar), F.I.Sh., telefon, status chipi, oylik to'lov, "Tahrirlash" tugmasi
- [x] **Ma'lumotlar bloki**: fan, markaz, tug'ilgan sana, qulay vaqt, chegirma, qulay kunlar
- [x] **Guruhlar ro'yxati** — nomi, oylik to'lov, jadval matni ("Dushanba 10:00, …") va **"Ko'chirish"** tugmasi
- [x] **Telegram ota-ona kartasi** — QR, deep link, ulangan ota-onalar, QR yangilash, ulanishni uzish
- [x] **5 ta statistika kartasi**: jami hisoblangan, jami to'langan, jami qarz, tasdiq kutmoqda (faqat > 0 bo'lsa), **olinishi kerak (`payableNow`)** — asosiy CTA
- [x] **Oylar jadvali**: oy, guruh, darslar, hisoblangan (proratsiyada to'liq summa chizib tashlanadi), sababli darslar, chiqarib tashlangan summa, to'langan, olinishi kerak, status
- [x] **"Qarzni to'lash" modali** (`payStudentDebt`): summa, to'lov usuli, `paidAt` (karta), izoh
- [x] **Taqsimot preview'i** — summa oylarga **eng eskisidan** boshlab qanday bo'linishi
- [x] Muvaffaqiyatdan keyin **har oyga bitta chek** (`checks[]`) → `CheckModal`
- [x] O'quvchini tahrirlash modali (mavjud `StudentFormModal` qayta ishlatiladi)
- [x] **Ko'chirish modali** (`previewTransfer` → `transferStudents`) — §2.4 dagi bandning bir qismi
      shu yerda bajarildi (bitta o'quvchi uchun); guruh kartasidagi ko'p tanlash qolmoqda.

> ⚠️ Eski loyiha `detail.centerName` va `group.schedule` ni `GET /students/{id}`
> dan o'qirdi — **backend ularni u yerda qaytarmaydi** (2026-09-24 jonli
> tekshiruv). Ikkalasi ham `GET /payments/student/{id}/summary` javobida bor.
> Shuning uchun yangi karta **bitta so'rov** bilan quriladi; `GET /students/{id}`
> faqat tahrirlash modali ochilganda (`groupIds`, passport maydonlari uchun)
> so'raladi.

**Kerakli API:** `fetchStudentPaymentSummary`, `payStudentDebt`, `fetchStudentById`,
`previewTransfer`/`transferStudents`, telegram uchtasi.

### 3.2 `/roles` — Rollar va ruxsatlar  🔴 yuqori muhimlik

Eski: `views/roles.vue` (361 qator).

- [x] Rollar jadvali: nom (+ `isLocked` / `isSystem` chiplari), `baseRole`, ruxsatlar soni (`*` bo'lsa "barchasi"), foydalanuvchilar soni
- [x] Rol yaratish/tahrirlash modali: nom, `baseRole` (tizim rolida o'zgarmaydi va payload'ga qo'shilmaydi)
- [x] **Ruxsatlar katalogi** (`fetchPermissionCatalog`) — 18 guruh akkordeon (`UiCollapse`);
      har guruhda "hammasini tanlash" **indeterminate** holatli checkbox + `n / jami` hisoblagich
- [x] "Barchasini tanlash" / "Tozalash" tugmalari + umumiy `(tanlangan/67)` hisoblagich
- [x] Katalog yorliqlari `uz`/`ru` — **backenddan** keladi, mahalliy tarjima qilinmaydi
- [x] O'chirish tasdiq dialogi; `isLocked` da tahrirlash ham, `isSystem` da o'chirish ham ko'rinmaydi
- [x] Barcha amallar `roles.manage` bilan yopilgan; sahifa `roles.view` bilan
- [x] Yangi umumiy primitivlar: **`UiCollapse`** va `UiCheckbox` ning **indeterminate** holati

**Kerakli API:** `fetchRoles`, `fetchPermissionCatalog`, `createRole`, `updateRole`, `deleteRole`.

### 3.3 `/staff-attendance` — Xodimlar davomati  ✅ **BAJARILDI (2026-09-24)**

Eski: `views/staff-attendance/index.vue` (518) + `CheckInCard.vue` (204). Yangi: `modules/staff-attendance/`.

- [x] **`CheckInCard`** — §3.9 da shared qilingan (`shared/components/attendance/`); bu sahifada
      `isTeacher && canCheckIn` bilan ko'rsatiladi (admin uchun mount qilinmaydi)
- [x] Tab 1 — **Kunlik yozuvlar** (`StaffAttendanceTable`): xodim, sana, kelgan vaqt (+ `lessonAt`),
      kechikish (`+N daq`), ishonchlilik badge (shared `ATTENDANCE_CONFIDENCE_BADGE`) + bayroqlar
      (`no_lesson_today` yashiriladi), manba + tasdiqlangan `ShieldCheck` ikonkasi
- [x] Filtrlar (`StaffAttendanceFilters`): `from`, `to` (native date input), xodim (`fetchTeachers`),
      "faqat kechikkanlar" (`onlyLate`), "faqat shubhalilar" (`onlyFlagged`) — log-filtrlari report tabda yashiriladi
- [x] Qator amallari: **tasdiqlash** (`confirmStaffAttendance`, faqat tasdiqlanmagan + `canManage`),
      **o'chirish** (`deleteStaffAttendance` + `UiConfirmDialog`)
- [x] **Qo'lda kiritish** dialogi (`ManualAttendanceModal` → `createManualAttendance`): xodim, sana, vaqt, izoh;
      xodim tanlanmasa Saqlash disabled
- [x] Tab 2 — **Hisobot** (`StaffAttendanceReport` → `fetchStaffAttendanceReport`): darsli/kelgan/kelmagan
      (>0 qizil) kunlar, kechikkan kunlar, jami kechikish (`formatDuration` soat+daq), shubhali (badge)
- [x] Markaz sozlanmagan bo'lsa ogohlantirish (`report.centerNotConfigured`)

**API:** `checkIn`/`fetchMyAttendanceToday` shared (§3.9); `fetchStaffAttendance`, `fetchStaffAttendanceReport`,
`createManualAttendance`, `confirmStaffAttendance`, `deleteStaffAttendance` → `modules/staff-attendance/api/`.
`StaffAttendance` entity + `AttendanceFlag`/`AttendanceConfidence`/`AttendanceSource` enum'lar shared'da (§3.9).
Route + menyu (`STAFF_ATTENDANCE_VIEW`, `UserCheck`) qo'shildi.

> ⚠️ `fetchMyAttendance` (`GET /staff-attendance/me`, o'z tarixi) hozircha yozilmadi — bu sahifada kerak emas.

### 3.4 `/users/:id` va `/my-performance` — Xodim faoliyati  ✅ **BAJARILDI (2026-09-24)**

Eski: `views/staff/view.vue` (28) + `views/staff/my.vue` (14) — ikkalasi ham `StaffOverview.vue` (703 qator).

- [x] `StaffOverview` komponenti — **§2.10 da qurildi**: `modules/staff/components/StaffOverviewCard.vue`
- [x] Oy tanlash (oxirgi 12 oy)
- [x] Jarima qo'shish / o'chirish — `showActions` bo'lganda
- [x] `/users/:id` — boshqa xodimni ko'rish (`fetchStaffOverview`, `showActions=true`, orqaga tugmasi)
- [x] `/my-performance` — o'zini ko'rish (`fetchMyOverview`, `userId=null`, `showActions=false`,
      admin/super_admin'ga menyuda ko'rinmaydi — `hideForBaseRoles`)
- [x] `/payroll` dagi modal ham shu komponentni ishlatadi (§2.10)

> **Yechim:** bitta `StaffPerformanceView.vue` ikkala route'ni bajaradi — route `:id` bo'lsa
> boshqa xodim (`showActions`), bo'lmasa mening (`showActions` yo'q — o'zini jarima qilmaydi).
> `/users/:id` entry point (ko'z tugmasi) — §2.7 da qo'shiladi.

**API:** `fetchStaffOverview`, `fetchMyOverview`, `fetchStaffDeductions`, `createStaffDeduction`, `deleteStaffDeduction` — hammasi §2.10 da tayyor edi.

### 3.5 `/schedule` — Dars jadvali  ✅ **BAJARILDI (2026-09-24)**

Eski: `views/schedule/index.vue` (20) + `ScheduleBoard.vue` (398). Yangi: `modules/schedule/`.

> **Qaror (tasdiqlangan):** ma'lumotlar o'sha, ko'rinish yaxshilandi, telefon majburiy.

- [x] `fetchScheduleBoard` (`GET /group-schedule/board`) — barcha maydonlar (xona, kun, vaqt,
      guruh, ustoz, fan). Javob shakli jonli tasdiqlangan: `{rooms[{id,name}], lessons[{...}]}`
- [x] To'qnashuvlar **mijozda** hisoblanadi (bir xona+kunda vaqt ustma-ust) — eski app ham
      shunday qilardi; `POST /group-schedule/conflicts` faqat guruh formasi uchun, board chaqirmaydi
- [x] **Desktop (md+):** piksel-pozitsion doska (xona ustunlari × vaqt o'qi, `PX_PER_MINUTE=1.2`,
      08:00–20:00 kengayadi), `max-h-[70vh]` o'z konteynerida skroll, **sticky vaqt ustuni + sarlavhalar**
- [x] **Mobil (< md):** doska emas — **kun ro'yxati** (`ScheduleDayList`), vaqt bo'yicha tartiblangan kartalar
- [x] Bo'sh kataklar (gridlines) va to'qnashuvlar (qizil `border-danger`/`bg-danger` + yonma-yon lane,
      mobil'da "Vaqt to'qnashuvi" chipi) vizual farqlanadi
- [x] Kun tanlagich (`UiTabs`, bugungi kun default), yangilash tugmasi; "Xonasiz" ustuni (xonasiz darslar);
      `noRooms` / `noLessonsThisDay` holatlari. Menyuga (`SCHEDULE_VIEW`) + route qo'shildi

### 3.6 `/organization` — Tashkilot brendi  ✅ **BAJARILDI (2026-09-24)**

Yangi: `modules/organization/` (`fetchOrganizationBranding`/`updateOrganizationBranding` →
`GET`/`PUT /organizations/branding`, `use-organization-branding`, `OrganizationView` +
reusable `BrandingImagePicker`). Ruxsat: `organization.settings` (GET ochiq, PUT gated).

- [x] Nomi (min 2 belgi validatsiyasi — `nameError`, Save o'chiq)
- [x] **Logotip yuklash** (≤ 300 KB, png/jpeg/webp/svg → data URL) + preview + o'chirish
- [x] **Favicon yuklash** (≤ 100 KB, png/svg/ico) + preview + o'chirish (`BrandingImagePicker`)
- [x] "Bekor qilish" (`isDirty` bo'lsa faol) — formani tiklaydi; fayl xatosi in-page alert
- [x] Saqlagach **sidebar logosi va tab favicon'i darhol yangilanishi** (`branding.store` — brauzerda tasdiqlandi)

### 3.7 `/telegram` — Telegram sozlamalari  ✅ **BAJARILDI (2026-09-25)**

Eski: `views/telegram.vue` (357 qator). Yangi: `modules/telegram/` (`TelegramSettingsView` +
`TelegramBotCard` + `TelegramNotificationsCard` + `TelegramToggleRow` + `TelegramHowItWorks`,
`use-telegram-settings`). Kontrakt jonli tasdiqlangan (`api-integration`, GET/PUT/DELETE + send-now).

- [x] **Bot ulash**: token kiritish (`setTelegramBotToken`), holat alert'i (ulangan=success /
      token bor lekin ulanmagan=warning / yo'q=info), niqoblangan token, "tokenni o'zgartirish"
      (bo'sh maydon), "botni uzish" (`removeTelegramBotToken`)
- [x] Token xatosi **maydon ostida** ko'rsatilishi — so'rov `skipGlobalError` bilan yuboriladi,
      `resolveErrorMessage` bilan matn olinadi (global toast chiqmaydi)
- [x] **Bildirishnoma kalitlari**: `isEnabled` (umumiy, o'chsa qolganlari disabled),
      `notifyPaymentReceived`, `notifyPaymentConfirmed`, `notifyAbsence`, `notifyDebt`
- [x] `debtReminderDay` (1–28 validatsiya, `dayError` computed), faqat `notifyDebt` yoqilganda ko'rinadi
- [x] **"Hozir yuborish"** — `sendTelegramDebtReminders`, natijada nechta o'quvchiga yuborilgani
      (`{ students }`), faqat `notifyDebt && isEnabled` da ko'rinadi
- [x] "Qanday ishlaydi" yo'riqnomasi bloki
- [x] Route (`telegram.settings`) + menyu (SOZLAMALAR, `Send` ikonka) qo'shildi;
      api-permissions'dagi eskirgan `/telegram/send-now` yo'li real `/telegram/debt-reminders/send-now` ga tuzatildi

> ⚠️ Bot tokenining o'zi **hech qachon** serverdan qaytmaydi (faqat `botTokenMasked`) — shuning
> uchun "o'zgartirish" rejimi bo'sh maydon ochadi. Brauzerda tekshirildi (375px + ikkala mavzu,
> gorizontal skroll yo'q, konsolda xato yo'q); `notifyDebt` yoqilganda kun maydoni + "hozir yuborish"
> paydo bo'lishi tasdiqlandi.

### 3.8 `/profile` — Profil  ✅ **BAJARILDI (2026-09-24)**

Yangi: `modules/profile/` (`fetchMyProfile`/`updateMyProfile` → GET/PUT `/users/me`,
`use-profile`, `ProfileView` + `ProfileForm`). Route ochiq (ruxsatsiz — `resolveHome` fallback).

- [x] `fetchMyProfile` / `updateMyProfile` (`GET`/`PUT /users/me`) — kontrakt jonli tasdiqlangan
- [x] Maydonlar: ism, familiya, login, telefon, **yangi parol** (ixtiyoriy — bo'sh bo'lsa yuborilmaydi, `.trim()`)
- [x] Ustoz uchun **read-only**: oylik (`formatSom`), ustama foizi (`role === teacher` da ko'rinadi)
- [x] `isDirty` bo'lmasa "Saqlash"/"Bekor qilish" faol emas; "Bekor qilish" formani tiklaydi
- [x] Header menyusida **"Profil"** havolasi (`User` ikonka) + "Chiqish"
- [x] Sarlavhada `roleName` (admin qo'ygan nom), vee-validate/zod, backend xatolari `setBackendErrors`

### 3.9 `/today` — Bugungi darslar (o'qituvchi)  ✅ **BAJARILDI (2026-09-24)**

Eski: `views/teacher/today.vue` (337). Yangi: `modules/today/` (view + `TodayLessonCard` + `TodayTopics`).

- [x] `fetchTeacherToday` (`GET /teachers/me/today`) — i18n sana sarlavhasi (`common.weekDays`/`common.months`), yangilash tugmasi
- [x] **`CheckInCard`** — yangi shared `shared/components/attendance/CheckInCard.vue` (o'qituvchi uchun, `scope==='teacher'` va `canCheckIn`; admin'da chiqmaydi). Geolokatsiya + deviceId → `POST /staff-attendance/check-in`, holat `GET /staff-attendance/me/today`. Ishonchlilik bayroqlari (`no_lesson_today`/`center_not_configured` yashiriladi)
- [x] **Admin/menejer rejimi** (`scope === 'center'`): "Faqat ma'lumot" chipi + info alert, har darsda ustoz nomi
- [x] Dars kartasi: vaqt, guruh nomi, dars raqami, fan, xona
- [x] Sillabus yo'q / mavzu biriktirilmagan holatlari uchun alert + "Guruh rejasiga o'tish" havolasi
- [x] Bugungi mavzular akkordeoni (`UiCollapse`): qiyinlik chipi, tavsif, **guide / lessonOutline / homework** (`UiMarkdown`)
- [x] **Oldingi mavzular** (yig'ilgan `UiCollapse`, chiplar)
- [x] Darslar boshlanish vaqti bo'yicha tartiblanishi

> ⚠️ **CheckInCard to'liq brauzerda tekshirilmadi:** check-in faqat o'qituvchi uchun (admin 403),
> test markazida GPS/IP sozlanmagan (`centerConfigured: false`) va check-in real yozuv yaratadi.
> Kontrakt jonli tasdiqlangan, mantiq unit-testlarda. `StaffAttendance` entity/enum'lar
> `shared/` da (§3.3 staff-attendance ular ustiga quriladi).

### 3.10 `/absences` — Darsga kelmaganlar (YANGI, eskisida yo'q)  ✅ **BAJARILDI (2026-09-27)**

Eskisida bunday sahifa yo'q edi (kelmaganlar faqat bitta guruh jurnalida ko'rinardi).
Qabulxona uchun: kelmagan o'quvchilarga qo'ng'iroq qilib sababini yozish. Yangi:
`modules/absences/` (view + `AbsencesSummary` / `AbsencesFilters` / `AbsencesTable` /
`AbsenceFollowUpModal`, `use-absences`). Backend: `GET /attendance/absences`,
`PUT /attendance/absences/:id/follow-up` (`attendance` jadvaliga `followUpNote/followedUpAt/followedUpById`).

- [x] Filtrlar: sana oralig'i (default — oxirgi 7 kun), o'qituvchi → guruh (bog'langan), tur (`absent` sababsiz / `excused` sababli), qo'ng'iroq (qilinmagan — default / qilingan / hammasi), ism yoki telefon qidiruvi (debounce)
- [x] Kartochkalar: sababsiz, sababli, qo'ng'iroq qilinmagan (status/qo'ng'iroq filtrlarisiz)
- [x] Jadval: o'quvchi + "N marta" (shu oraliqda shu guruhda), `tel:` havolalar (telefon + ikkinchi telefon), guruh + o'qituvchi, sana, tur, o'qituvchi izohi, qo'ng'iroq natijasi (kim, qachon)
- [x] "Natijani yozish" modali (`attendance.manage`); bo'sh izoh — belgini olib tashlaydi
- [x] Menyu: O'quvchilar bo'limi, `attendance.view`; o'qituvchi faqat o'z guruhlarini ko'radi

### 3.11 Guruh pauzasi, jadval/o'qituvchi tarixi, xodimni bloklash (YANGI)  ✅ **BAJARILDI (2026-09-27)**

- [x] Guruh kartasi → "Ma'lumot" tabida **To'xtatilgan davrlar** (`GroupPausesCard`): qo'shish (sana oralig'i + sabab), o'chirish. `groups.update`
- [x] Guruh formasi (tahrirlash): jadval yoki o'qituvchi haqiqatan o'zgarganda "qaysi kundan" sanasi (`GroupChangeDates`) → `scheduleEffectiveFrom` / `teacherEffectiveFrom`
- [x] `/users`: xodimni **bloklash / blokdan chiqarish** (`PUT /users/:id/active`), bloklangan qator xira + "Bloklangan" belgisi; admin bloklanmaydi. Tarixi bor xodimni o'chirish backendda 400

### 3.12 `/holidays` — Bayram kunlari (YANGI)  ✅ **BAJARILDI (2026-09-27)**

- [x] Ro'yxat (yil tanlash), qo'shish (nomi, sana oralig'i, admin faol filial tanlagan bo'lsa "faqat shu filial uchun"), o'chirish. `schedule.manage`
- [x] Davomat jurnalida oyga tushgan bayramlar eslatmasi (`AttendanceHolidaysNote`)
- [x] To'lovlar jadvali va talaba kartasida qo'llangan chegirma (`10% · 50 000 so'm`); summadagi chegirma bitta (asosiy) guruh qatorida
- [x] Xodim formasida "oylik/foiz shu oydan kuchga kiradi" izohi

---

## 4. Cross-cutting (sahifa emas, lekin funksional)  🔴

### 4.1 Ruxsatlar tizimi (permissions) — eng katta arxitektura bo'shlig'i

**Eskisi:** backenddan keladigan **ruxsat kalitlari** (`payments.view`, `students.transfer`, …).
`/auth/me` javobida `permissions[]` keladi; `usePermissions().can('key')`; har bir route'da
`meta.permission`; menyu ham shunga qarab filtrlanadi; `/roles` sahifasida admin yangi rol
yaratib, unga ruxsat beradi — va u **avtomatik** ishlaydi.

**Yangisi:** `UserRole` enum bo'yicha hardcode (`has(UserRole.ADMIN, …)`), menyuda esa
qo'lda yozilgan `BLOCKED` ro'yxat. Router'da **umuman permission tekshiruvi yo'q**.

> 📘 **To'liq model `docs/03-roles-permissions.md` da** — 67 ta ruxsat kaliti
> (uz/ru yorliqlari bilan), 5 ta tizim roli va ularning standart to'plamlari,
> endpoint→ruxsat jadvali, route→ruxsat jadvali va amalga oshirish ro'yxati.
> Hammasi jonli backendga qarshi tekshirilgan (2026-09-23).

- [x] `user.store` → `/auth/me` dan `permissions[]`, `roleId`, `roleName`, `centerId` o'qiladi
- [x] `usePermissions().can(...keys)` — kalit asosida (rol asosida emas), `*` = hammasi.
      67 kalit `Permission` enum'ida (`shared/enums/permission.enum.ts`)
- [x] `shared/permissions/api-permissions.ts` — §4 jadvali kod sifatida (160+ qoida),
      `match-api-rule.ts` aniqlik bo'yicha saralab moslaydi
- [x] **So'rov pre-check'i** — ruxsat yo'q endpointga so'rov **umuman yuborilmaydi**
      (`PermissionDeniedError`, foydalanuvchiga xato ko'rsatilmaydi; DEV'da konsolga ogohlantirish)
- [x] Router: har bir route'da `meta.permission` + guard'da tekshiruv
- [x] **`resolveHome`** — login'dan keyin ruxsatga mos birinchi sahifaga yuborish
      (statistics → today → groups → students → leads → payments → syllabuses → profile)
- [x] Ruxsatsiz sahifaga kirishga urinish → `resolveHome` (bo'sh 403 ekrani yo'q)
- [x] Menyu `navigation.ts` — `roles`/`adminOnly`/`BLOCKED` olib tashlandi, `permission` kalitlari qo'yildi;
      bo'sh bo'lib qolgan bo'lim menyudan tushib qoladi
- [x] Mavjud sahifalardagi tugma/ustun ko'rinishi `can()` ga ko'chirildi
      (centers, rooms, subjects, groups, users, leads, payments, payroll, expenses,
      pending-receipts, students, syllabuses)
- [x] `hideForBaseRoles` mexanizmi tayyor (`NavItem.hideForBaseRoles`) —
      `/my-performance` qo'shilganda ishlatiladi
- [x] **`optionalRequest`** — filtr/select uchun yordamchi ma'lumot ruxsatsiz bo'lsa
      bo'sh ro'yxatga aylanadi (so'rov bloklanganda sahifa buzilmaydi)
- [x] Yangi sahifalar qo'shilganda menyuga `permission` bilan kiritish
      (`/roles`, `/schedule`, `/my-performance`, `/staff-attendance`, `/organization`, `/telegram`)
      — 2026-09-25 sverka: hammasi `navigation.ts` da o'z kaliti bilan (`/my-performance` —
      `STAFF_ATTENDANCE_VIEW_OWN` + `hideForBaseRoles`)

### 4.2 i18n — uz / ru  🔴 0-bosqich

> **Qaror (tasdiqlangan):** ruscha til **kerak**. Shuning uchun i18n eng birinchi
> qilinadi — shundan keyin yoziladigan har bir matn to'g'ridan-to'g'ri kalit
> bilan yoziladi, keyin qayta terib chiqishga hojat qolmaydi.

**Eskisi:** `vue-i18n` + `locales/uz` va `locales/ru` (23 ta namespace fayl), header'da til almashtirgich.
**Yangisi:** `vue-i18n` umuman o'rnatilmagan, barcha matnlar hardcode uzbekcha.

- [x] `vue-i18n` o'rnatish + `src/locales/{uz,ru}` tuzilmasi (eskisidagi 23 ta namespace: `auth, centers, common, expenses, groups, layout, leads, organization, payments, payroll, pendingReceipts, profile, roles, rooms, schedule, staff, staffAttendance, statistics, students, subjects, syllabuses, telegram, users`)
- [x] Eski `locales/uz` va `locales/ru` fayllarini ko'chirish (kalitlar tayyor — qayta yozish shart emas)
- [x] Header'da til almashtirgich (`UiLocaleToggle`) + tanlov `localStorage` (`locale`) da
      saqlanishi + `<html lang>` yangilanishi
- [x] **Mavjud modullardagi hardcode matnlarni kalitlarga ko'chirish** (auth, centers, rooms, subjects, users, leads, students, groups, syllabuses, payments, payroll, expenses, pending-receipts, dashboard, `Ui*` kit ichidagi matnlar)
- [x] `/roles` katalog yorliqlari tilga bog'liq (`label.uz` / `label.ru`) — §3.2 da bajarilgan
- [x] Sana/valyuta formatlari tilga bog'liq (`formatSom` → `t('common.sum')`;
      `formatDate` dd.MM.yyyy — ikkala tilda bir xil, o'zgartirish shart emas)
- [x] **Konvensiya:** shu paytdan boshlab yangi `.vue` fayllarda hardcode matn yozilmaydi
- [x] Shu qoida `.claude/rules/ui-and-forms.md` §4.3 ga **majburiy band** sifatida yozildi

**Qo'shimcha qilingan ishlar (0-bosqich, 1-band):**

- [x] Barcha enum yorliq jadvallari (`*_LABELS`) → **`*_LABEL_KEYS`** ga o'tkazildi
      (student/group/lead/payment/payroll/attendance status, weekday, difficulty,
      preferred time, return likelihood, user role). Komponentlar `t(KEYS[value])` chaqiradi
- [x] Jadval ustunlari va menyu punktlari **kalit** saqlaydi (`labelKey`), view'da `computed` ichida tarjima qilinadi
- [x] Route sarlavhalari `meta.title` → **`meta.titleKey`**
- [x] Oylar va hafta kunlari `common.months` / `common.monthsShort` /
      `common.weekDays` / `common.weekDaysShort` ga birlashtirildi (ilgari 4 joyda takrorlanardi)
- [x] Validatsiya xabarlari (zod) `computed` ichida — til almashganda qayta hisoblanadi
- [x] **`src/locales/__tests__/parity.spec.ts`** — uz va ru kalitlari bir xilligini tekshiradi
      (yangi kalit faqat bitta tilga qo'shilsa test yiqiladi)
- [x] `UiLocaleToggle.spec.ts` yozildi; `npm run type-check`, `npx vitest run` (86 fayl / 417 test) va `npx vite build` yashil
- [x] Brauzerda tekshirildi: kirish → dashboard → to'lovlar → qabul; til almashtirish
      **sahifani qayta yuklamasdan** ishlaydi, reload'dan keyin saqlanadi, konsolda xato yo'q
- `—` `src/modules/playground/` (`/ui-kit` demo sahifasi) ataylab chetlab o'tildi (ichki dev sahifa)

### 4.3 Filial (center) qamrovi

**Eskisi:** header'da **global** filial tanlagichi; birinchi punkt — **"Barcha filiallar"** (`centerId` umuman yuborilmaydi); `canSwitch` bo'lmaganlarga o'z filiali chipi; filial almashganda `router-view :key` orqali sahifa qayta yuklanadi; `centerIdForCreate` — yangi yozuv qaysi filialga tushishi.

**Yangisi:** har sahifada alohida `UiSelect`, "barcha filiallar" varianti yo'q, `canSwitch` tushunchasi yo'q.

- [x] Header'ga global filial tanlagichi (`AppCenterSwitcher`, mobil ko'rinishda ham).
      Tanlov `localStorage.activeCenterId` da saqlanadi
- [x] **"Barcha filiallar"** varianti — `centerId` **umuman yuborilmaydi**
- [x] `canSwitch` — almashtira olmaydigan xodimga tanlagich emas, o'z filiali nomi (chip)
- [x] `centerIdForCreate` — "barchasi" tanlanganda standart (`isDefault`) filial,
      almashtira olmaydiganga esa o'z filiali
- [x] **Avtomatik `centerId` inyeksiyasi** — http interceptor `acceptsCenterId`
      belgisiga ega endpointlargagina qo'shadi (aks holda backend 422 beradi);
      sahifa o'zi `centerId` bergan bo'lsa tegilmaydi
- [x] Filial almashganda sahifalar qayta yuklanishi (`<RouterView :key="center-…">`)
- [x] Sahifalardagi takroriy `UiSelect` lar olib tashlandi (11 ta sahifa),
      formalardagi "Markaz" maydonlari ham (8 ta modal) — yangi yozuv aktiv filialga tushadi
- [x] Logout'da filial qamrovi tozalanadi (`scope.reset()`)

### 4.4 Brending (logo / favicon)  ✅ **BAJARILDI (2026-09-24)**

- [x] `branding.store` (`src/stores/branding.store.ts`, `load` = `fetchOrganizationBranding`, fail-soft) — `AppLayout` `onMounted` da bir marta yuklanadi
- [x] Sidebar logosi va nomi store'dan (`branding.logoUrl` / `branding.name`, default `favicon.svg` + "TalimPlus")
- [x] Tab favicon'i va sarlavhasi brending'dan (`applyToDocument` — `document.title` + `<link rel=icon>`)
- [x] Logout'da brending reset (`useBrandingStore().reset()` — `scope.reset()` yonida)

### 4.5 Mobil moslik — BARCHA sahifalar uchun majburiy  🔴

> **Qaror (tasdiqlangan):** CRM telefonda ko'p ishlatiladi. **Har bir sahifa va
> har bir funksional telefon ekraniga mos bo'lishi kerak** — "buzilmagan" emas,
> balki qulay. Bu §6 (Definition of Done) ning majburiy bandi.

Qoidalar `ui-and-forms.md` §4.2 da, bu yerda — eski loyihadan ko'chirishda
aynan e'tibor beriladigan joylar:

- [x] **Keng jadvallar → mobilda karta ko'rinishi.** Har bir jadvalni alohida
      yozish o'rniga **`UiTable` ning o'ziga** karta rejimi qo'shildi: `md` dan
      pastda har bir qator — alohida karta (sarlavha + yorliq/qiymat qatorlari +
      pastda amal tugmalari). Shu bitta o'zgarish **10 ta jadvalni** qopladi
- [x] `TableColumn.primary` — qaysi ustun karta sarlavhasi bo'lishi;
      `TableColumn.hideOnMobile` — ID kabi shovqinni kartadan olib tashlash
- [x] **Matritsalar** (guruh davomati) — o'z konteyneri ichida skroll, birinchi
      ustun `sticky`; sahifaning o'zi yon tomonga siljimaydi (1233px matritsa
      466px konteyner ichida, sahifada skroll yo'q)
- [x] **Filtrlar** — mobilda ustma-ust; oy tablari o'z `overflow-x-auto` tasmasida
- [x] **Modallar** mobilda to'liq kenglikda (468/500), ichki skroll, tugmalar ko'rinib turadi
- [x] **Amal tugmalari** — yangi **`UiIconButton`**: mobilda **44×44**, `md` dan
      yuqorida 32×32, `aria-label` bilan. 23 ta qo'lda yozilgan tugma almashtirildi
- [x] **`UiDropdown`** — ekran chetidan chiqib ketadigan panel avtomatik ichkariga
      qaytadi (mobil kartalarda status menyusi chiqib ketardi — tuzatildi)
- [x] **Formalar mobilda 16px** (`text-base md:text-sm`) — iOS Safari fokusda
      sahifani kattalashtirmaydi
- [x] **Sidebar** `lg` dan pastda off-canvas drawer — tekshirildi
- [x] **375px** da tekshirildi: to'lovlar, o'quvchilar, ishchilar, rollar, ish haqi,
      chiqimlar, leads, kurs rejalari, markazlar, fanlar, xonalar, guruh kartasi —
      **hech birida gorizontal skroll yo'q**, konsolda xato yo'q

### 4.6 Boshqa

- [x] Header menyusida **"Profil"** punkti (§3.8 da qo'shilgan)
- [x] Header'da foydalanuvchi **roli** — ✅ 2026-09-25. Eskisidagidek: admin qo'ygan
      `roleName` ("Kassir"…), bo'lmasa tur bo'yicha tarjima (`USER_ROLE_LABEL_KEYS` —
      `users` modulidan `shared/enums/user-role.enum.ts` ga ko'chirildi, header ham
      ishlatadi). `sm+` da email ostida, telefonda menyu tepasida email + rol.
- [x] Logout'da: token, user, center (`scope.reset`), branding — hammasi tozalanadi
      (`user.store.logout`, `finally` ichida)
- [x] `apiErrorMessage` → `resolveErrorMessage` (`shared/utils/error-message.ts`),
      `apiFieldErrors` → `mapBackendErrors` (string ham, massiv ham). **Topilgan bug:**
      `resolveErrorMessage` ning 4 ta zaxira matni hardcode o'zbekcha edi (rus tilida ham
      "Tarmoq xatosi…" chiqardi) → mavjud `common.errors.*` kalitlariga o'tkazildi

---

## 5. API qoplamasi (mexanik tekshiruv)

Eski `services/pages/*.ts` dagi **har bir eksport** yangi `*.api.ts` da bo'lishi kerak.

**Yo'q funksiyalar (49 ta):**

| Modul | Funksiya | Kerak bo'ladigan joy |
|---|---|---|
| ~~centers~~ | ~~`captureCenterIp`~~ ✅ `centers.api.ts` (`skipGlobalError`) | §2.8 |
| ~~subjects~~ | ~~`fetchAllSubjects`~~ ✅ eskisi ham shunchaki `GET /subjects` — `fetchSubjects({ perPage })` (§2.9) | §2.9 |
| ~~users~~ | ~~`fetchAllTeachers`~~ ✅ `fetchTeachers` (`users.api.ts`, `/users/teachers`) | §2.3, §2.1, §3.3 |
| ~~users~~ | ~~`getUserMe`, `updateUserMe`~~ ✅ `fetchMyProfile` / `updateMyProfile` (`profile.api.ts`) | §3.8 |
| ~~students~~ | ~~`fetchStudentById`~~ ✅ §3.1 (o'quvchi kartasi) | §3.1 |
| ~~students~~ | ~~`deleteStudent`~~ ✅ 2026-10-01 backendga qo'shildi — faqat `new` o'quvchi uchun | §2.5 |
| ~~students~~ shared | ~~`previewTransfer`, `transferStudents`~~ ✅ `shared/api/transfer.api.ts` (§2.4/§3.1 ikkalasi ishlatadi) | §2.4, §3.1 |
| ~~payments~~ | ~~`exportPayments`, `previewExclusion`, `applyExclusion`, `fetchPaymentReceipts`, `fetchReceiptCheck`~~ ✅ §2.1 | §2.1 |
| ~~payments~~ | ~~`fetchReceiptsStats`, `confirmReceipts` (bulk)~~ ✅ §2.2 | §2.2 |
| ~~payments~~ | ~~`fetchStudentPaymentSummary`, `payStudentDebt`~~ ✅ §3.1 | §3.1 |
| ~~roles~~ | ~~`fetchRoles`, `fetchPermissionCatalog`, `createRole`, `updateRole`, `deleteRole`~~ ✅ bajarildi | §3.2 |
| ~~schedule~~ | ~~`fetchScheduleBoard`~~ ✅ §3.5 · ~~`checkScheduleConflicts`~~ ✅ **2026-09-25** — guruh formasida jonli bandlik tekshiruvi (pastda) | §3.5, §2.3 |
| ~~staff~~ | ~~`fetchStaffOverview`, `fetchMyOverview`, `fetchStaffDeductions`, `createStaffDeduction`, `deleteStaffDeduction`~~ ✅ `modules/staff/api/staff.api.ts` (§2.10/§3.4) | §3.4 |
| staffAttendance | ~~`checkIn`, `fetchMyAttendanceToday`~~ (§3.9 shared) · ~~`fetchStaffAttendance`, `fetchStaffAttendanceReport`, `confirmStaffAttendance`, `createManualAttendance`, `deleteStaffAttendance`~~ ✅ `modules/staff-attendance/api/`; `fetchMyAttendance` — ❌ yozilmadi: eskisida **hech qaysi sahifa chaqirmaydi** (o'lik kod) | §3.3 |
| ~~organization~~ | ~~`fetchOrganizationBranding`, `updateOrganizationBranding`~~ ✅ §3.6 | §3.6, §4.4 |
| ~~telegram~~ | ~~`fetchStudentTelegramLink`, `regenerateStudentTelegramQr`, `unlinkTelegramParent`~~ (§3.1) · ~~`fetchTelegramSettings`, `updateTelegramSettings`, `setTelegramBotToken`, `removeTelegramBotToken`, `sendTelegramDebtReminders`~~ ✅ `modules/telegram/api/telegram-settings.api.ts` | §3.7, §3.1 |
| ~~syllabuses~~ today | ~~`fetchTeacherToday`~~ ✅ `modules/today/api/today.api.ts` | §3.9 |

**Mavjud, lekin to'liq emas (payload/param yetishmaydi):**

- [x] `rejectReceipt(id, reason?)` — §2.2 (`pending-receipts.api.ts`)
- [x] `markAsPaid` / `payPartial` → `paidAt` — umumiy `PaymentReceptionForm`
      (`shared/interfaces/payment-reception.interface.ts`), faqat `card` da yuboriladi (`use-reception-form`)
- [x] `payStaffSalary` → `deduction: { amount, reason, type }` — §2.10 (`PayStaffDeductionForm`)
- [x] `fetchAllGroups(centerId, teacherId)` — §2.1 filtr juftligi
- [x] `fetchStudents` → `search`, `returnLikelihood`, `preferredTime`, `preferredDays`, `subjectId` — `StudentsParams` da hammasi bor

**Mexanik tekshiruv buyrug'i:**

```bash
# Eskidagi barcha eksportlar
grep -rhoE '^export (const|async function) \w+' \
  ../cabinet_front/src/services/pages | awk '{print $NF}' | sort -u > /tmp/old.txt
# Yangidagi barcha eksportlar
grep -rhoE '^export async function \w+' --include='*.api.ts' src/modules \
  | awk '{print $NF}' | sort -u > /tmp/new.txt
comm -23 /tmp/old.txt /tmp/new.txt   # → hali ko'chirilmaganlar
```

⚠️ Natijada **nomi o'zgargan** (ko'chirilgan, lekin boshqacha atalgan) 6 ta funksiya
ham chiqadi — ular bo'shliq emas:
`createSubjects→createSubject`, `editSubject→updateSubject`, `editCenter→updateCenter`,
`getMe→fetchMe`, `updateStudentStatus→changeStudentStatus`, `fetchExpenseById→fetchExpense`.
Tekshirish paytida 2026-09-23 holati: **55 ta farq = 49 ta haqiqiy bo'shliq + 6 ta nom farqi.**

**2026-09-25 qayta ishga tushirildi (`shared/api` ham qo'shib): 122 eski eksportdan faqat 14 ta nom
farq qildi — hammasi hal:** 9 tasi nomi o'zgargan/`shared` ga ko'chgan (`getMe→fetchMe`,
`getUserMe→fetchMyProfile`, `updateUserMe→updateMyProfile`, `previewTransferStudents→previewTransfer`,
`fetchAllTeachers→fetchTeachers` + yuqoridagi 6 tadan qolganlari), 3 tasi ataylab yozilmagan
(`deleteStudent` — backendda yo'q, `fetchAllSubjects` — oddiy `GET /subjects`, `fetchMyAttendance` —
eskisida chaqirilmaydi) va **1 ta haqiqiy bo'shliq — `checkScheduleConflicts` — yozildi.**

**Guruh formasida jonli bandlik tekshiruvi (`checkScheduleConflicts`):** eskisidagidek xona/o'qituvchi/
kun/vaqt/davomiylik o'zgarganda 400ms debounce bilan `POST /group-schedule/conflicts`
(`excludeGroupId` — tahrirlanayotgan guruhning o'z darslari hisobga olinmaydi); to'qnashuv bo'lsa
qizil ro'yxat (`schedule.conflict.room/teacher` shablonlari) va **Saqlash o'chadi**; bo'sh bo'lsa
yashil "bo'sh" xabari; tekshiruv o'zi yiqilsa saqlash bloklanmaydi (`skipGlobalError`, backend
baribir qayta tekshiradi); eskirgan javob tashlanadi. Yangi: `schedule` modulida enum/interface/API,
`groups/composables/use-schedule-conflicts.ts`, `GroupScheduleConflicts.vue`. Jonli tasdiqlandi.

---

## 6. Definition of Done (har bir sahifa uchun)

Sahifa `[x]` bo'lishi uchun **hammasi** bajarilgan bo'lishi kerak:

1. `api-integration` skill bilan endpoint shartnomasi tasdiqlangan (taxmin qilingan maydon = defekt).
2. §2/§3 dagi **shu sahifaning har bir katakchasi** belgilangan.
3. §5 dagi tegishli API funksiyalari yozilgan va testlari bor.
4. Ruxsatlar (§4.1) qo'llangan — tugmalar/ustunlar `can()` bilan gate qilingan.
5. **Eski va yangi app brauzerda yonma-yon** ochilib solishtirilgan (`chrome-devtools`).
6. **Mobil tekshiruv (majburiy, §4.5):** 375px kengligida ochilgan — gorizontal
   skroll yo'q, matn kesilmagan, barcha tugma/amal bosiladi, jadval karta
   ko'rinishiga o'tgan, modal to'liq ishlaydi.
7. Ikkala mavzu (light/dark) da ishlaydi.
8. **Matnlar i18n kalitlari orqali** (uz + ru to'ldirilgan), hardcode matn yo'q.
9. `npm run type-check` + `npx vitest run` yashil.
10. Commit oldidan `code-reviewer` agenti (`workflow.md` §2).

---

## 7. Tavsiya etilgan navbat

**0-bosqich — poydevor (boshqa hamma narsa shunga bog'liq)**

1. `[x]` §4.2 **i18n (uz + ru)** — ✅ **BAJARILDI** (2026-09-23). Infratuzilma,
   23 namespace ko'chirildi, barcha mavjud modullar kalitlarga o'tkazildi,
   header'da til almashtirgich, uz/ru parity testi. Qoida `ui-and-forms.md` §4.3 da.
2. `[x]` §4.1 **Ruxsatlar tizimi** — ✅ **BAJARILDI** (2026-09-23). `Permission` enum (67 kalit),
   endpoint jadvali + so'rov pre-check'i, router guard + `resolveHome`, kalit asosidagi menyu,
   ekranlardagi tugmalar `can()` bilan yopildi. Rol asosidagi tekshiruvlar butunlay olib tashlandi.
3. `[x]` §4.3 **Global filial qamrovi** — ✅ **BAJARILDI** (2026-09-23). Header'da bitta
   tanlagich, "Barcha filiallar", avtomatik `centerId` inyeksiyasi, `centerIdForCreate`,
   sahifa va formalardagi takroriy filial tanlagichlari olib tashlandi.
4. `[x]` §3.2 **`/roles` sahifasi** — ✅ **BAJARILDI** (2026-09-23). Rollar jadvali,
   18 guruhli ruxsat katalogi (backend uz/ru yorliqlari bilan), yaratish/tahrirlash/o'chirish.
5. `[x]` §4.5 **Mobil karta ko'rinishi** — ✅ **BAJARILDI** (2026-09-23).
   `UiTable` ga karta rejimi, `UiIconButton` (44px), dropdown flip, 16px inputlar.
   **0-bosqich to'liq yakunlandi.**

**1-bosqich — pul oqimi (biznes uchun eng kritik)**

6. `[x]` §2.1 **`/payments` bo'shliqlari** — ✅ **BAJARILDI** (2026-09-24). Ikkita Excel
   eksporti, ustoz filtri, `payableNow`, tasdiq-kutmoqda va qat'iy muddat ustunlari,
   muddati o'tgan qator rangi, chiqarib tashlash bloki, to'lov usuli + `paidAt`,
   chek va to'lov tarixi modallari, chek chop etish.
7. `[x]` §2.2 **`/pending-receipts` bo'shliqlari** — ✅ **BAJARILDI** (2026-09-24).
   4 ta statistika kartasi, sana filtri, sahifalar orasida saqlanadigan ko'p tanlash,
   "Belgilanganlarni oldim" / "Barchasini oldim", rad etish sababi, matnli qator tugmalari.
8. `[x]` §3.1 **`/students/:id` o'quvchi kartasi** — ✅ **BAJARILDI** (2026-09-24).
   Sarlavha, ma'lumotlar bloki, guruhlar + ko'chirish, Telegram ota-ona kartasi,
   5 statistika kartasi, oylar jadvali, qarzni to'lash + taqsimot preview'i, cheklar.
9. `[x]` §2.10 **`/payroll` jarimalar + xodim kartasi** — ✅ **BAJARILDI** (2026-09-24).
   Jarima ustuni, to'lov modalidagi jarima bloki (faqat jarima ham mumkin),
   xodim kartasi modali (yangi `staff` moduli), markaz ochilganidan boshlanadigan
   yil/oy oralig'i, status bo'yicha qator rangi.
   **1-bosqich (pul oqimi) to'liq yakunlandi.**

**2-bosqich — o'quv jarayoni**

10. `[x]` §2.4 **Guruh kartasi** — ✅ **BAJARILDI** (2026-09-24). Oy/yil tanlagich +
    "Joriy oy" (`AttendancePicker`), a'zolik oynasi (`joinedAt`/`leftAt` → "—" +
    sabab), header'da cancelled/extra yorlig'i, students tab'da ko'p tanlab
    ko'chirish + `sourceGroupClosed` xabari. Transfer modal/composable/api/interfeys
    `shared/` ga ko'tarildi (ikkala modul ishlatadi). Info tab to'ldirildi.
11. `[x]` §2.3 **Guruhlar ro'yxati** — ✅ **BAJARILDI** (2026-09-24). Ustoz filtri, start/end
    sana ustunlari, endDate ogohlantirish chipi, upcomingFee izohi, status 422 ishlovi
    (endDate/roomId → forma), yakunlash/o'chirish tasdiq dialoglari (`UiConfirmDialog`),
    formada endDate + lessonDurationMinutes + applyFeeNow. Fantom `durationMonths` olib tashlandi.
12. `[x]` §3.9 `/today` **bugungi darslar** — ✅ **BAJARILDI** (2026-09-24). `modules/today/`,
    admin/teacher rejimlari, dars kartalari + mavzu akkordeoni (guide/lessonOutline/homework),
    shared `CheckInCard` (geolokatsiya + check-in) + shared staff-attendance api/enum/interfeys.
13. `[x]` §3.5 `/schedule` **dars jadvali** — ✅ **BAJARILDI** (2026-09-24). `modules/schedule/`,
    desktop piksel-doska (xona × vaqt, sticky), mobil kun ro'yxati, mijoz-tomon to'qnashuv
    aniqlash (qizil lane), kun tanlagich + "Xonasiz" ustuni. **2-bosqich to'liq yakunlandi.**

**3-bosqich — xodimlar**

14. `[x]` §3.3 `/staff-attendance` — ✅ **BAJARILDI** (2026-09-24). `modules/staff-attendance/`:
    kunlik yozuvlar tab (ishonchlilik/bayroq/manba/tasdiq), filtrlar, tasdiqlash/o'chirish,
    qo'lda kiritish dialogi, hisobot tab (formatDuration), centerNotConfigured banner, shared CheckInCard.
15. `[x]` §3.4 `/users/:id` + `/my-performance` — ✅ **BAJARILDI** (2026-09-24). Bitta
    `StaffPerformanceView` §2.10 `StaffOverviewCard` ni qayta ishlatadi; `/my-performance`
    admin/super_admin'ga menyuda yashirin (`hideForBaseRoles`).
16. `[x]` §2.7 `/users` **dinamik rollar** — ✅ **BAJARILDI** (2026-09-24). Forma rollarni `fetchRoles`
    dan (admin roli chiqmaydi), `roleId` yuboradi; jadvalda `userRole.name`; ko'z tugmasi → `/users/:id`.
    **3-bosqich to'liq yakunlandi.**

**4-bosqich — sozlamalar va qolganlari**

17. `[x]` §3.8 `/profile` — ✅ **BAJARILDI** (2026-09-24). `modules/profile/`,
    `GET`/`PUT /users/me`, ixtiyoriy yangi parol (bo'sh bo'lsa yuborilmaydi), ustoz uchun
    read-only oylik/ustama, `isDirty` gate + reset, header menyusida "Profil" havolasi.
18. `[x]` §3.6 `/organization` + §4.4 brending — ✅ **BAJARILDI** (2026-09-24). `modules/organization/`,
    `GET`/`PUT /organizations/branding`, nom (min 2) + logo/favicon (data URL, hajm chegarasi) picker,
    yangi `branding.store` (AppLayout'da yuklanadi, logout'da reset) — sidebar logo/nom + tab
    sarlavha/favicon store'dan, saqlagach darhol yangilanadi (brauzerda e2e tasdiqlandi).
19. `[x]` §3.7 `/telegram` — ✅ **BAJARILDI** (2026-09-25). `modules/telegram/`: bot ulash/uzish
    (holat alert'i, niqoblangan token, token xatosi maydon ostida — `skipGlobalError`), 5 ta
    bildirishnoma kaliti (master o'chsa qolganlari disabled), `debtReminderDay` (1–28), "hozir
    yuborish", "qanday ishlaydi" bloki. api-permissions send-now yo'li tuzatildi. 31 test yashil.
20. `[x]` §2.8 `/centers` davomat sozlamalari — ✅ **BAJARILDI** (2026-09-25). Tahrirlashda
    geofence (lat/long/radius/publicIp), "joylashuvimni olish" (geo, 7 xona), "IP'ni olish"
    (`captureCenterIp`, skipGlobalError), bo'sh koordinata → null, mutatsiyadan keyin header
    filial tanlagichi yangilanadi. `UiIcon` import bug'i ham tuzatildi. 23 test yashil.
21. `[x]` §2.5, §2.6, §2.9, §2.11, §2.13 — mayda bo'shliqlar
    - `[x]` §2.5 `/students`, `/reception` — ✅ **BAJARILDI** (2026-09-25). Chegirma
      sabab tooltip'i (`StudentDiscountCell` + `truncate` util), reception qulay kunlar
      chiplari (`StudentDaysCell`), status o'tishlari + guruhsiz-ACTIVE tekshiruvi
      tasdiqlandi; buzuq `deleteStudent` qo'shilmadi (backendda yo'q).
    - `[x]` §2.6 `/leads` — ✅ **BAJARILDI** (2026-09-25). Transfer `discountPeriods: []`
      qo'shildi; status faqat NEW da, passport/jshshir eksklyuzivligi, payload tozalash,
      global scope centerId tasdiqlandi; `use-lead-form` uchun 13 test.
    - `[x]` §2.9 `/subjects`, `/rooms` — ✅ **BAJARILDI** (2026-09-25). Markaz ustuni,
      subjects/rooms nom qidiruvi, fan optionlari (`/subjects/all` yo'q → `perPage`)
      tasdiqlandi; `UiIcon` import bug'i tuzatildi; 17 test.
    - `[x]` §2.11 `/expenses` — ✅ **BAJARILDI** (2026-09-25). Oy tablari (`UiTabs`) +
      yil select, xira o'tgan oylar (`TabItem.muted`), markaz/sana ustunlari, forma oy
      tanlagichi, `fetchExpense(id)` bilan tahrirlash; `amount` string→number koersiya
      bug'i tuzatildi. `ExpenseMonthFilter` + `use-expenses` + `UiTabs` uchun testlar.
    - `[x]` §2.13 `/syllabuses/:id` — ✅ **BAJARILDI** (2026-09-25). Indikatorlar/chip mobilda
      ko'rinadigan bo'ldi, rollback jonli tasdiqlandi, `updateSyllabus` UI ga ulandi
      (`SyllabusFormModal`), ~15 hardcode matn i18n ga, AI tugmalari `syllabus.ai` ga,
      `reorder` ruxsat qoidasi `PUT` ga tuzatildi. Yangi/yangilangan testlar:
      `TopicContentTabs`, `TopicList`, `SyllabusFormModal` (yangi), `TopicCard`,
      `TopicEditorDrawer`, `use-syllabus-detail` — suite 1340 yashil.

**5-bosqich — yakuniy sverka (qolgan ochiq bandlar)**  ✅ **BAJARILDI (2026-09-25)**

22. `[x]` §5 API qoplamasi — mexanik tekshiruv qayta ishga tushirildi; yagona haqiqiy bo'shliq
    `checkScheduleConflicts` guruh formasiga ulandi (jonli bandlik tekshiruvi, Saqlash bloklanadi).
    Qolgan 5 ta "to'liq emas" bandi eskirgan edi — kodda hammasi bor (tasdiqlandi).
23. `[x]` §4.6 — header'da rol (`roleName` / tur bo'yicha), `resolveErrorMessage` hardcode
    o'zbekcha zaxira matnlari i18n ga; Profil, logout tozalash, `mapBackendErrors` tasdiqlandi.
24. `[x]` §4.1 / §4.2 eskirgan katakchalar yopildi; §1 route inventari yangilandi — **31/31 route
    `[x]`**; router'dagi bo'sh `placeholders` mexanizmi (o'lik kod) olib tashlandi.

**Keyinroq (hozir rejada emas)**

- `—` §2.12 Dashboard grafiklari — backendda oylik vaqt qatori paydo bo'lgach

---

## 8. Qarorlar va ochiq savollar

**Tasdiqlangan qarorlar (2026-09-23):**

- ✅ **Ruscha til kerak** → i18n 0-bosqichga ko'chirildi (§4.2). Eski
  `locales/uz` va `locales/ru` fayllari tayyor — ko'chiriladi.
- ✅ **Dashboard grafiklari keyinga qoldirildi** (§2.12) — hozir ko'chirilmaydi.
- ✅ **`/schedule`** — ma'lumotlar o'sha, ko'rinish yaxshiroq qilinishi mumkin;
  telefonda ishlashi shart (§3.5).
- ✅ **Barcha sahifalar telefonga mos bo'lishi majburiy** → §4.5 alohida
  cross-cutting band, §6 Definition of Done ga majburiy band sifatida kiritildi.

**Keyin aniqlangan (2026-09-23, Swagger + jonli tekshiruv):**

- ✅ `/users` formasi **`roleId`** yuborishi kerak (§2.7) — `role` string eski fallback.
- ✅ **`DELETE /students/{id}` mavjud emas** — o'chirish o'rniga status o'zgartiriladi.
  §2.5 dagi "o'quvchini o'chirish" bandi shunga ko'ra qayta yoziladi.
- ✅ Dashboard'da **oylik vaqt qatori yo'q** — grafiklarni keyinga qoldirish qarori
  to'g'ri (`01-api-integration.md` §5.14).
- ✅ Validatsiya xatolari **422**, `errors[field]` — **satr** (massiv emas).
- ✅ Login xatosi **401** — interceptor `/login` da redirect qilmasligi kerak.

**Hali ochiq:**

- [~] **Chek chop etish formati** — hozircha eskisidagi kenglik saqlandi:
      chek alohida `iframe` ichida, **320px (≈58–80mm rulon)** kenglikda chop
      etiladi va A4 da ham o'qiladi (`payments/utils/print-check.ts`). Agar
      markazda boshqa printer bo'lsa, faqat shu bitta fayldagi `PRINT_STYLES`
      o'zgartiriladi — komponentlar tegilmaydi.
      ❓ **Savol kuchda:** haqiqiy printer 58mm termo mi yoki A4?
