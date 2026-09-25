# Roles & Permissions Reference (verified)

> The complete authorization model of TalimPlus: how roles work, every
> permission key, which endpoint needs which key, and how the frontend gates UI.
>
> **Verified 2026-09-23** against the live dev backend: `GET /roles`,
> `GET /roles/permissions` (**18 groups / 67 permission keys**), and the
> generated endpoint table from the old `cabinet_front`
> (`src/permissions/apiPermissions.generated.ts`, produced from the backend's
> `@RequirePermissions(...)` decorators).
>
> Companions: `01-api-integration.md` (the API contract) ·
> `02-migration-matrix.md` (what the rebuild is still missing).

---

## 1. The model in one page

**Permissions, not roles.** Authorization is a list of string keys such as
`payments.view`. `GET /auth/me` returns them on the user:

```jsonc
{ "user": { "id": 40, "email": "…", "role": "admin", "roleId": 2,
            "roleName": "Administrator", "centerId": null,
            "permissions": ["*"] } }
```

- `permissions: ["*"]` means **everything** (only the locked Administrator role).
- Otherwise it is an explicit list of keys.
- `role` is the **base role type** (`admin`, `manager`, `reception`, `teacher`,
  `other`, `super_admin`, `student`) — it exists for business logic, **not** for
  authorization.
- `roleName` is the admin-chosen display name ("Kassir", "Bosh menejer").

**Roles are data, not code.** An admin creates roles on `/roles` and ticks
permissions from the catalog. A brand-new role must work everywhere with no
frontend change — which is only possible if the UI gates on **keys**.

```ts
// The one check the whole app uses. Several keys = OR.
can('payments.view')
can('groups.create', 'groups.update')   // either one is enough
```

`can()` must return `true` when the user holds `*`.

✅ **Implemented (2026-09-23).** `shared/enums/permission.enum.ts` holds the 67
keys, `shared/permissions/` the endpoint table + matcher + `resolveHome`, and
`usePermissions()` exposes key-based flags. Role enums no longer gate anything.

---

## 2. Permission catalog — all 67 keys

Source of truth: `GET /roles/permissions` (returns groups with `uz`/`ru` labels,
which the `/roles` page renders directly — do not re-translate them locally).

### dashboard — Statistika / Статистика
| Key | uz | ru |
|---|---|---|
| `statistics.view` | Statistikani ko'rish | Просмотр статистики |

### users — Xodimlar / Сотрудники
| Key | uz | ru |
|---|---|---|
| `users.view` | Xodimlarni ko'rish | Просмотр сотрудников |
| `users.create` | Xodim qo'shish | Добавление сотрудника |
| `users.update` | Xodimni tahrirlash | Редактирование сотрудника |
| `users.delete` | Xodimni o'chirish | Удаление сотрудника |

### roles — Rollar va ruxsatlar / Роли и права
| Key | uz | ru |
|---|---|---|
| `roles.view` | Rollarni ko'rish | Просмотр ролей |
| `roles.manage` | Rollarni yaratish/tahrirlash/o'chirish | Создание/редактирование/удаление ролей |

### students — O'quvchilar / Ученики
| Key | uz | ru |
|---|---|---|
| `students.view` | O'quvchilarni ko'rish | Просмотр учеников |
| `students.create` | O'quvchi qo'shish | Добавление ученика |
| `students.update` | O'quvchini tahrirlash | Редактирование ученика |
| `students.delete` | O'quvchini o'chirish | Удаление ученика |
| `students.changeStatus` | O'quvchi statusini o'zgartirish | Изменение статуса ученика |
| `students.discounts` | Chegirmalarni boshqarish | Управление скидками |
| `students.transfer` | Boshqa guruhga ko'chirish | Перевод в другую группу |

### leads — Lidlar (qabul) / Лиды (приём)
| Key | uz | ru |
|---|---|---|
| `leads.view` | Lidlarni ko'rish | Просмотр лидов |
| `leads.create` | Lid qo'shish | Добавление лида |
| `leads.update` | Lidni tahrirlash | Редактирование лида |
| `leads.delete` | Lidni o'chirish | Удаление лида |
| `leads.transfer` | Lidni o'quvchiga o'tkazish | Перевод лида в ученика |

### groups — Guruhlar / Группы
| Key | uz | ru |
|---|---|---|
| `groups.view` | Guruhlarni ko'rish | Просмотр групп |
| `groups.create` | Guruh yaratish | Создание группы |
| `groups.update` | Guruhni tahrirlash | Редактирование группы |
| `groups.delete` | Guruhni o'chirish | Удаление группы |
| `groups.changeStatus` | Guruh statusini o'zgartirish | Изменение статуса группы |

### attendance — Davomat / Посещаемость
| Key | uz | ru |
|---|---|---|
| `attendance.view` | Davomatni ko'rish | Просмотр посещаемости |
| `attendance.manage` | Davomat belgilash | Отметка посещаемости |
| `attendance.managePast` | O'tgan sanalarda davomat belgilash | Отметка за прошедшие даты |

### schedule — Dars jadvali / Расписание
| Key | uz | ru |
|---|---|---|
| `schedule.view` | Jadvalni ko'rish | Просмотр расписания |
| `schedule.manage` | Jadvalni boshqarish | Управление расписанием |

### syllabus — Kurs rejasi / Учебный план
| Key | uz | ru |
|---|---|---|
| `syllabus.view` | Kurs rejasini ko'rish | Просмотр учебного плана |
| `syllabus.manage` | Kurs rejasi va mavzularni boshqarish | Управление планом и темами |
| `syllabus.ai` | AI yordamida reja tuzish | Составление плана с помощью AI |
| `groupPlan.view` | Guruh rejasini ko'rish | Просмотр плана группы |
| `groupPlan.manage` | Guruh rejasini boshqarish (mavzu biriktirish) | Управление планом группы |
| `groupPlan.attach` | Guruhga kurs rejasini biriktirish/almashtirish | Привязка/смена учебного плана группы |

### payments — To'lovlar / Платежи
| Key | uz | ru |
|---|---|---|
| `payments.view` | To'lovlarni ko'rish | Просмотр платежей |
| `payments.create` | To'lov qabul qilish | Приём платежа |
| `payments.update` | To'lovni tahrirlash | Редактирование платежа |
| `payments.delete` | To'lovni o'chirish | Удаление платежа |
| `payments.export` | To'lovlarni eksport qilish | Экспорт платежей |
| `payments.recalculate` | To'lovni qayta hisoblash | Пересчёт платежа |
| `payments.exclusion` | To'lovdan darslarni chiqarib tashlash | Исключение уроков из платежа |

### receipts — Cheklar (tasdiqlash) / Чеки (подтверждение)
| Key | uz | ru |
|---|---|---|
| `receipts.view` | Cheklarni ko'rish | Просмотр чеков |
| `receipts.confirm` | Chekni tasdiqlash | Подтверждение чека |
| `receipts.reject` | Chekni rad etish | Отклонение чека |

### payroll — Oylik (xodimlar) / Зарплата
| Key | uz | ru |
|---|---|---|
| `payroll.view` | Oyliklarni ko'rish | Просмотр зарплат |
| `payroll.pay` | Oylik to'lash | Выплата зарплаты |
| `payroll.deduct` | Oylikdan ushlab qolish (jarima) | Удержание из зарплаты (штраф) |
| `payroll.calculate` | O'qituvchi daromadini hisoblash | Расчёт дохода преподавателя |

### expenses — Xarajatlar / Расходы
| Key | uz | ru |
|---|---|---|
| `expenses.view` | Xarajatlarni ko'rish | Просмотр расходов |
| `expenses.create` | Xarajat qo'shish | Добавление расхода |
| `expenses.update` | Xarajatni tahrirlash | Редактирование расхода |
| `expenses.delete` | Xarajatni o'chirish | Удаление расхода |

### settings — Sozlamalar / Настройки
| Key | uz | ru |
|---|---|---|
| `organization.settings` | O'quv markazi brendi (nom, logo, favicon) | Бренд учебного центра |
| `centers.view` | Filiallarni ko'rish | Просмотр филиалов |
| `centers.manage` | Filiallarni boshqarish | Управление филиалами |
| `rooms.view` | Xonalarni ko'rish | Просмотр кабинетов |
| `rooms.manage` | Xonalarni boshqarish | Управление кабинетами |
| `subjects.view` | Fanlarni ko'rish | Просмотр предметов |
| `subjects.manage` | Fanlarni boshqarish | Управление предметами |

### telegram — Telegram bot / Telegram-бот
| Key | uz | ru |
|---|---|---|
| `telegram.settings` | Ota-onalar boti sozlamalari | Настройки бота для родителей |

### staffPerformance — Xodim faoliyati / Работа сотрудника
| Key | uz | ru |
|---|---|---|
| `staffPerformance.view` | Xodim sahifasini ko'rish (davomat, qarz, jarimalar) | Просмотр страницы сотрудника |

### staffAttendance — Xodimlar davomati / Посещаемость сотрудников
| Key | uz | ru |
|---|---|---|
| `staffAttendance.checkIn` | "Keldim" belgilash | Отметка «Пришёл» |
| `staffAttendance.viewOwn` | O'z davomatini ko'rish | Просмотр своей посещаемости |
| `staffAttendance.view` | Barcha xodimlar davomatini ko'rish | Просмотр посещаемости всех сотрудников |
| `staffAttendance.manage` | Davomatni tasdiqlash va qo'lda kiritish | Подтверждение и ручной ввод |

### teacher — O'qituvchi kabineti / Кабинет преподавателя
| Key | uz | ru |
|---|---|---|
| `teacher.today` | Bugungi darslarim | Мои уроки на сегодня |

---

## 3. System roles and their default permissions

Every organization is seeded with 5 roles (verified on the test org). Admins may
edit the permission sets of all but the locked Administrator, and create their
own roles on top.

| Role | `key` | `baseRole` | `isSystem` | `isLocked` | Permissions |
|---|---|---|---|---|---|
| Administrator | `admin` | `admin` | ✅ | ✅ | `*` (all) |
| Menejer | `manager` | `manager` | ✅ | — | 40 |
| Qabulxona | `reception` | `reception` | ✅ | — | 28 |
| O'qituvchi | `teacher` | `teacher` | ✅ | — | 12 |
| Boshqa | `other` | `other` | ✅ | — | 3 |

- **`isLocked`** → cannot be edited or deleted (Administrator only).
- **`isSystem`** → cannot be deleted and its `baseRole` cannot change; its
  permissions *can* be edited.
- A role with `userCount > 0` cannot be deleted.
- When creating a role, `baseRole` is limited to
  **`teacher | manager | reception | other`** — `admin` is never assignable.

### Default sets (verified)

**manager (40)**
```
students.view students.create students.update students.changeStatus students.discounts
leads.view leads.create leads.update leads.delete leads.transfer
groups.view groups.create groups.update groups.changeStatus
attendance.view attendance.manage
schedule.view schedule.manage
syllabus.view syllabus.manage syllabus.ai groupPlan.view groupPlan.manage groupPlan.attach
payments.view payments.create payments.update payments.export payments.recalculate payments.exclusion
centers.view rooms.view rooms.manage subjects.view subjects.manage
staffAttendance.checkIn staffAttendance.viewOwn staffAttendance.view staffAttendance.manage
staffPerformance.view
```

**reception (28)**
```
students.view students.create students.update students.changeStatus
leads.view leads.create leads.update leads.delete leads.transfer
groups.view groups.create groups.update groups.changeStatus
attendance.view attendance.manage attendance.managePast
payments.view payments.create payments.recalculate payments.export payments.exclusion
rooms.view subjects.view
staffAttendance.checkIn staffAttendance.viewOwn staffAttendance.view staffAttendance.manage
staffPerformance.view
```

**teacher (12)**
```
teacher.today groups.view students.view
attendance.view attendance.manage attendance.managePast
schedule.view syllabus.view groupPlan.view groupPlan.manage
staffAttendance.viewOwn staffAttendance.checkIn
```

**other (3)**
```
groups.view staffAttendance.viewOwn staffAttendance.checkIn
```

Worth noting:
- Reception **can** create/edit groups and mark **past** attendance (makeup
  corrections) — managers cannot mark past attendance.
- Neither manager nor reception has `payroll.*`, `expenses.*`, `users.*`,
  `receipts.*` or `statistics.view` by default — those are admin-only until an
  admin grants them.
- Teachers have `groupPlan.manage` but **not** `groupPlan.attach` — they can
  assign topics to their lessons but not swap the group's syllabus.

---

## 4. Endpoint → permission map

Generated from the backend's `@RequirePermissions(...)` decorators. Several keys
on one row mean **OR** (any one suffices). An empty list means the endpoint is
open to any authenticated user. **`⊕`** marks endpoints that accept a `centerId`
query param — those (and only those) get the globally selected center injected
automatically (`01-api-integration.md` §2.6).

| Method | Path | Permissions | ⊕ |
|---|---|---|---|
| POST | `/auth/login` | — | |
| POST | `/auth/logout` | — | |
| POST | `/auth/register` | — | |
| GET | `/auth/me` | — | |
| GET | `/organizations/branding` | — | |
| PUT | `/organizations/branding` | `organization.settings` | |
| GET | `/organizations/:id` | — | |
| GET | `/subscriptions/organization/:id` | — | |
| GET | `/users` | `users.view` | ⊕ |
| POST | `/users` | `users.create` | |
| GET | `/users/:id` | `users.view` | |
| PUT | `/users/:id` | `users.update` | |
| DELETE | `/users/:id` | `users.delete` | |
| GET | `/users/email/:email` | `users.view` | |
| GET | `/users/employees` | `users.view` \| `groups.create` \| `groups.update` | ⊕ |
| GET | `/users/teachers` | `users.view` \| `groups.view` \| `students.view` | ⊕ |
| GET | `/users/me` | — | |
| PUT | `/users/me` | — | |
| GET | `/roles` | `roles.view` | |
| GET | `/roles/permissions` | `roles.view` | |
| POST | `/roles` | `roles.manage` | |
| PUT | `/roles/:id` | `roles.manage` | |
| DELETE | `/roles/:id` | `roles.manage` | |
| GET | `/centers` | `centers.view` | |
| GET | `/centers/all` | — | |
| GET | `/centers/:id` | `centers.view` | |
| POST | `/centers` | `centers.manage` | |
| PUT | `/centers/:id` | `centers.manage` | |
| DELETE | `/centers/:id` | `centers.manage` | |
| POST | `/centers/:id/capture-ip` | `centers.manage` | |
| GET | `/students` · `/student` | `students.view` | ⊕ |
| GET | `/students/all` | `students.view` | ⊕ |
| GET | `/students/referrals` | `students.view` | |
| GET | `/students/:id` | `students.view` | |
| POST | `/students` | `students.create` | |
| PUT | `/students/:id` | `students.update` | |
| PUT | `/students/change-status/:id` | `students.changeStatus` | |
| GET/POST/PUT/DELETE | `/students/:id/discount-periods[/:periodId]` | `students.discounts` | |
| POST | `/students/transfer` · `/students/transfer/preview` | `students.transfer` | |
| GET | `/groups` · `/groups/all` · `/group/all` | `groups.view` | ⊕ |
| GET | `/groups/:id` | `groups.view` | |
| POST | `/groups` | `groups.create` | |
| PUT | `/groups/:id` | `groups.update` | |
| DELETE | `/groups/:id` | `groups.delete` | |
| PUT | `/groups/change-status/:id` | `groups.changeStatus` | |
| GET | `/groups/:groupId/attendance` | `attendance.view` | |
| GET | `/groups/:groupId/attendance/lesson-dates` | `attendance.view` | |
| POST | `/groups/:groupId/attendance/submit` | `attendance.manage` | |
| POST | `/groups/:groupId/attendance/reschedule` | `attendance.manage` | |
| GET | `/groups/:groupId/plan` | `groupPlan.view` | |
| PUT | `/groups/:groupId/plan/lessons/:lessonNumber/topics` | `groupPlan.manage` | |
| POST | `/groups/:groupId/plan/distribute` | `groupPlan.manage` | |
| PUT | `/groups/:groupId/plan/syllabus` | `groupPlan.attach` | |
| GET | `/group-schedule` · `/group-schedule/:id` | `schedule.view` | |
| GET | `/group-schedule/board` | `schedule.view` | ⊕ |
| POST | `/group-schedule/conflicts` | `schedule.view` \| `groups.create` \| `groups.update` | |
| POST/PUT/DELETE | `/group-schedule[/:id]` | `schedule.manage` | |
| GET | `/leads` | `leads.view` | ⊕ |
| POST | `/leads` | `leads.create` | |
| PUT | `/leads/:id` · `/leads/change-status/:id` | `leads.update` | |
| DELETE | `/leads/:id` | `leads.delete` | |
| POST | `/leads/:id/transfer-to-student` | `leads.transfer` | |
| GET | `/payments` | `payments.view` | ⊕ |
| GET | `/payments/:id` · `/payments/:paymentId/receipts` | `payments.view` | |
| GET | `/payments/receipt/:receiptId/check` | `payments.view` | |
| GET | `/payments/student/:studentId/summary` | `payments.view` | |
| PUT | `/payments/:id` | `payments.update` | |
| GET | `/payments/export` | `payments.export` | ⊕ |
| PUT | `/payments/mark-as-paid/:id` | `payments.create` | |
| PUT | `/payments/pay-partial/:id` | `payments.create` | |
| PUT | `/payments/pay-debt/student/:studentId` | `payments.create` | |
| PUT | `/payments/calculate/:id` | `payments.recalculate` | |
| PUT | `/payments/preview-exclusion/:id` · `/payments/apply-exclusion/:id` | `payments.exclusion` | |
| GET | `/payments/pending-receipts` | `receipts.view` | ⊕ |
| GET | `/payments/receipts-stats` | `receipts.view` | ⊕ |
| PUT | `/payments/confirm-receipt/:id` · `/payments/confirm-receipts` | `receipts.confirm` | |
| PUT | `/payments/reject-receipt/:id` | `receipts.reject` | |
| GET | `/expenses` | `expenses.view` | ⊕ |
| GET | `/expenses/:id` | `expenses.view` | |
| POST | `/expenses` | `expenses.create` | |
| PUT | `/expenses/:id` | `expenses.update` | |
| DELETE | `/expenses/:id` | `expenses.delete` | |
| GET | `/staff-salaries` | `payroll.view` | ⊕ |
| PUT | `/staff-salaries/pay/:id` | `payroll.pay` | |
| POST/DELETE | `/staff/deductions[/:id]` | `payroll.deduct` | |
| GET | `/staff/:userId/overview` | `staffPerformance.view` \| `staffAttendance.viewOwn` | |
| GET | `/staff/:userId/deductions` | `staffPerformance.view` | |
| GET | `/staff/me/overview` | `staffAttendance.viewOwn` | |
| POST | `/staff-attendance/check-in` | `staffAttendance.checkIn` | |
| GET | `/staff-attendance/me` | `staffAttendance.viewOwn` | ⊕ |
| GET | `/staff-attendance/me/today` | `staffAttendance.viewOwn` | |
| GET | `/staff-attendance` | `staffAttendance.view` | ⊕ |
| GET | `/staff-attendance/report` | `staffAttendance.view` | ⊕ |
| POST | `/staff-attendance/manual` | `staffAttendance.manage` | |
| POST | `/staff-attendance/:id/confirm` | `staffAttendance.manage` | |
| DELETE | `/staff-attendance/:id` | `staffAttendance.manage` | |
| GET | `/subjects` | `subjects.view` | ⊕ |
| GET | `/subjects/:id` | `subjects.view` | |
| POST/PUT/DELETE | `/subjects[/:id]` | `subjects.manage` | |
| GET | `/rooms` | `rooms.view` | ⊕ |
| GET | `/rooms/:id` | `rooms.view` | |
| POST/PUT/DELETE | `/rooms[/:id]` | `rooms.manage` | |
| GET | `/statistics/dashboard` | `statistics.view` | ⊕ |
| GET | `/syllabuses` | `syllabus.view` | ⊕ |
| GET | `/syllabuses/:id` | `syllabus.view` | |
| POST/PUT/DELETE | `/syllabuses[/:id]` | `syllabus.manage` | |
| POST/PUT/DELETE | `/syllabuses/:id/topics[/…]` | `syllabus.manage` | |
| POST | `/syllabuses/ai/chat` · `/syllabuses/ai/save` | `syllabus.ai` | |
| POST | `/syllabuses/:id/topics/:topicId/generate-content` | `syllabus.ai` | |
| GET | `/teachers/me/today` | `teacher.today` | ⊕ |
| GET | `/telegram/settings` · PUT · bot-token · send-now | `telegram.settings` | |
| GET | `/telegram/students/:studentId/link` | `students.view` | |
| POST | `/telegram/students/:studentId/link/regenerate` | `students.update` | |
| DELETE | `/telegram/parents/:linkId` | `students.update` | |

⚠️ The old table also listed `GET /teacher-earnings` (`payroll.view`) and
`POST /teacher-earnings/calculate` (`payroll.calculate`). **Neither exists in the
current OpenAPI spec** — treat them as removed unless the backend re-adds them.

### Matching rules (when porting the table)
- Match on `METHOD` + the **path template**; `:param` matches one segment.
- Sort rules by **specificity** (more static segments first) so `/groups/all`
  wins over `/groups/:id`.
- Open endpoints (`permissions: []`) must stay in the table — they block a
  parametrized rule from swallowing them (`/centers/all` is open,
  `/centers/:id` is not).
- A path not in the table is treated as open.

---

## 5. Route → permission map

Every route carries `meta.permission` (an OR list). No `meta.permission` means
the page is open to any authenticated user.

| Route | Permission |
|---|---|
| `/statistics` | `statistics.view` |
| `/today` | `teacher.today` |
| `/users` | `users.view` |
| `/users/:id` (staff card) | `staffPerformance.view` |
| `/my-performance` | `staffAttendance.viewOwn` |
| `/staff-attendance` | `staffAttendance.view` |
| `/roles` | `roles.view` |
| `/subjects` | `subjects.view` |
| `/rooms` | `rooms.view` |
| `/centers` | `centers.view` |
| `/groups`, `/groups/:id` | `groups.view` |
| `/schedule` | `schedule.view` |
| `/syllabuses`, `/syllabuses/:id` | `syllabus.view` |
| `/reception`, `/students`, `/stopped`, `/ignored`, `/finished` | `students.view` |
| `/students/:id` (student card) | **`payments.view`** ⚠️ |
| `/leads` | `leads.view` |
| `/payments` | `payments.view` |
| `/payroll` | `payroll.view` |
| `/expenses` | `expenses.view` |
| `/pending-receipts` | `receipts.view` |
| `/organization` | `organization.settings` |
| `/telegram` | `telegram.settings` |
| `/profile` | — (open) |

⚠️ `/students/:id` is gated on **`payments.view`**, not `students.view`: the page
is built from the payment summary, so without that key it would render empty.

**Guard behavior**
1. No token → `/login` (unless already on an auth page).
2. Token but user not loaded → `GET /auth/me`; failure → clear token → `/login`.
3. On `/login`, `/register` or `/` while authenticated → redirect to the resolved
   home page.
4. `meta.permission` present and `can(...)` false → redirect to the resolved home
   page (never a blank 403 screen).

**Resolved home page** — first match wins:
`statistics.view → /statistics` · `teacher.today → /today` · `groups.view → /groups` ·
`students.view → /students` · `leads.view → /leads` · `payments.view → /payments` ·
`syllabus.view → /syllabuses` · fallback `/profile`.

---

## 6. Navigation menu

The sidebar is filtered by the same keys. Structure: standalone items on top,
then three collapsible groups. A group disappears when all its items are hidden.

| Section | Items (permission) |
|---|---|
| Standalone | Statistika (`statistics.view`) · Bugungi darslar (`teacher.today`) · Xodimlar (`users.view`) · Rollar (`roles.view`) · Guruhlar (`groups.view`) · Dars jadvali (`schedule.view`) · Kurs rejalari (`syllabus.view`) · Mening faoliyatim (`staffAttendance.viewOwn`) · Xodimlar davomati (`staffAttendance.view`) |
| **To'lovlar** | To'lovlar (`payments.view`) · Ish haqi (`payroll.view`) · Chiqimlar (`expenses.view`) · Tasdiqlash uchun to'lovlar (`receipts.view`) |
| **O'quvchilar** | Qabul (`students.view`) · Leads (`leads.view`) · O'quvchilar · To'xtatganlar · Rad etilganlar · Tamomlaganlar (all `students.view`) |
| **Sozlamalar** | Markazlar (`centers.view`) · Fanlar (`subjects.view`) · Xonalar (`rooms.view`) · Tashkilot (`organization.settings`) · Telegram (`telegram.settings`) |

---

## 7. Business rules that are NOT permissions

A few behaviors depend on the **base role type** or on ownership, not on a
permission key. Keep these separate from `can()`.

| Rule | Logic |
|---|---|
| "Mening faoliyatim" hidden for the owner | `hideForBaseRoles: ['admin', 'super_admin']` — the owner never fines themself |
| Teacher edits only **their own** group's lesson plan | `groupPlan.manage` **AND** (manager-level OR `group.teacher.id === user.id`) |
| Teacher list is self-scoped | `GET /groups/all?teacherId=` is ignored for the `teacher` base role — the backend always scopes to self |
| "Today" is read-only for admins | `GET /teachers/me/today` returns `scope: 'center'` + `canCheckIn: false`; check-in belongs to the teacher |
| Reception payments need confirmation | Admin/super_admin payments auto-confirm; reception/manager create a **pending** receipt |
| Center switching | Only users allowed to switch see the center selector; others are pinned to their own `centerId` |
| Administrator role is untouchable | `isLocked` — hide edit/delete |
| Role in use can't be deleted | `userCount > 0` |

---

## 8. Implementation checklist for the rebuild

- [x] `user.store` reads `permissions[]`, `roleId`, `roleName`, `centerId` from `/auth/me`.
- [x] `can(...keys)` — OR semantics, `*` wins, `false` when the user isn't loaded
      (`shared/permissions/can.ts`, exposed as `userStore.can` and `usePermissions().can`).
- [x] `shared/permissions/api-permissions.ts` — §4 ported as data (method, path
      template, permissions, `acceptsCenterId`), sorted by specificity in
      `match-api-rule.ts`.
- [x] Request interceptor blocks un-permitted requests silently
      (`PermissionDeniedError`; DEV-only console warning) **and** injects the
      header's active center on `acceptsCenterId` endpoints only (stage-0 item 3).
- [x] Router: `meta.permission` on every route (§5) + guard + `resolveHome()`.
- [x] Sidebar built from §6 keys — the hardcoded role blacklist is gone.
- [x] `use-permissions.ts` is key-based; the §7 rules live in the clearly named
      `isTeacher` / `isOwner` / `isManagerLevel` / `canEditLessonPlan` helpers.
- [x] `/roles` page renders the catalog from `GET /roles/permissions` using its
      own `uz`/`ru` labels (no local translation) — `src/modules/roles/`.
- [x] Screens shipped so far have their buttons/columns gated; pages added later
      gate as they are built (`02-migration-matrix.md` §2).

**Verified in the browser (2026-09-23)** with real accounts on the dev backend:
an admin (`*`) sees everything; a teacher (12 keys) lands on `/today`, sees only
their menu and is bounced from `/payments`, `/payroll`, `/users`, `/centers`, `/`;
reception (28 keys) lands on `/groups`, keeps the payment actions and sees
Sozlamalar reduced to Fanlar + Xonalar.

> Regenerating §4: the old repo has `npm run gen:api-permissions`, which parses
> the backend's controllers. If the backend adds endpoints, regenerate there and
> copy the table over rather than hand-editing it.
