# API Integration Reference (verified)

> How the TalimPlus CRM backend works: auth, the HTTP contract, every endpoint,
> the real request/response shapes, and the business rules the frontend relies on.
>
> **Verification status:** every section below was checked on **2026-09-23**
> against the live dev backend (`http://localhost:3004`) — the OpenAPI spec
> (`/api-json`, 105 paths / **143 operations** / 109 schemas) plus live calls with
> a seeded test dataset. Shapes marked *(old-project verified)* come from the old
> `cabinet_front` TypeScript models, which were written against this same backend.
> See §10 for what was verified how.
>
> **Backend is unchanged** in the rebuild, so everything here must be preserved.

**Product:** TalimPlus — CRM for private education centers in Uzbekistan.
**Backend:** NestJS REST API, Bearer JWT auth, PostgreSQL.

---

## 1. Environment & how to verify a contract

Base URL comes from one env var:

| Env | `VITE_API_URL` |
|---|---|
| development | `http://localhost:3004` |
| production | `https://api.talimplus.uz` |

**OpenAPI spec:** `${VITE_API_URL}/api-json` (both dev and prod serve it).
A `talim-swagger` MCP server is wired in `.mcp.json` against the same spec.

⚠️ **The spec has request contracts but almost no response contracts.**
140 of 143 operations declare `responses.200` with **no schema** (a NestJS
default). Only 3 attendance operations ship a response schema. So:

- **Params / request bodies** → read from `/api-json` (authoritative).
- **Response shapes** → get from a live call, or from this document (§5–§6),
  or cross-check the old project's `src/types/*.ts`. **Never guess.**

Test account (dev): `claude.test.talim@gmail.com` / `password123` — an **admin**
with `permissions: ["*"]`, organization "Claude Test Org", 2 centers.

Probe recipe:

```bash
TOKEN=$(curl -s -X POST http://localhost:3004/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"claude.test.talim@gmail.com","password":"password123"}' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).access_token))")

curl -s "http://localhost:3004/payments?centerId=4&forMonth=2026-09" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 2. The HTTP contract

### 2.1 Auth on every request
- JWT is stored in `localStorage` under the key **`token`**.
- Every request carries `Authorization: Bearer <token>`.
- **No refresh token.** An expired/invalid token simply forces re-login.
- `POST /auth/logout` blacklists the current token server-side until it expires.

### 2.2 Error responses — the real shapes

All verified live:

| Case | Status | Body |
|---|---|---|
| No / bad token | 401 | `{ "message": "Unauthorized", "statusCode": 401 }` |
| Wrong login password | **401** | `{ "message": "Parol noto‘g‘ri", "error": "Unauthorized", "statusCode": 401 }` |
| Validation failure | **422** | `{ "statusCode": 422, "message": "Validation Failed", "errors": { "name": "name must be a string" } }` |
| Business rule | 400 | `{ "message": "ACTIVE → zzz o‘tish mumkin emas", "error": "Bad Request", "statusCode": 400 }` |
| Not found | 404 | `{ "message": "O‘quvchi topilmadi", "error": "Not Found", "statusCode": 404 }` |
| Forbidden | 403 | `{ message, error: "Forbidden", statusCode: 403 }` |

⚠️ **`errors[field]` is a plain STRING**, not an array — unlike what the old doc
claimed. Field-error mappers must accept **both** `string` and `string[]`
(`shared/utils/backend-errors.ts` already does).

⚠️ **Login failure is a 401.** The generic "401 → wipe token and go to /login"
rule would swallow the message on the login screen. The interceptor must not
redirect when already on `/login`, and the login screen opts out of the global
toast so it can show the message on the field.

### 2.3 Interceptor rules
1. **401** → remove token, redirect to `/login`. No toast. (Skip the redirect if
   already on `/login` / `/register`.)
2. **Any other error** (4xx / 5xx / network) → one **global toast**, then rethrow.
   Screens never show their own generic error toast.
3. Screens only map **field-level** errors onto form fields (`errors` object).
4. Per-request opt-out exists (`skipGlobalError`) for screens showing the error inline.

### 2.4 Message resolution order
1. No response (network/timeout) → generic network text.
2. Body is a non-empty string → use it.
3. `body.message` is a string → use it.
4. `body.message` is an array → join with `, `.
5. `body.error` is a string → use it.
6. `body.errors` object → first non-empty value (string **or** first array item).
7. Fallback by status: `>= 500` server error · `403` forbidden · else unknown.

### 2.5 Blob (Excel) errors
`GET /payments/export` is fetched with `responseType: 'blob'`. On failure the
error body is **also a Blob** — it must be read as text and JSON-parsed before
the message is extracted, otherwise the message is lost.

### 2.6 Automatic `centerId` injection  ⭐ ported behavior
The old app injects the globally selected center into every request that accepts
it. Two rules make this safe:

- Only endpoints flagged `acceptsCenterId` get the param (the backend uses
  `forbidNonWhitelisted`, so an unexpected `centerId` returns **422**).
- If the caller already passed `centerId`, it is not overwritten.

The `acceptsCenterId` flag lives in the generated endpoint table — see
`03-roles-permissions.md` §4, which lists it per endpoint.

### 2.7 Client-side permission pre-check  ⭐ ported behavior
Before sending, the old app matches `method + path` against a generated table of
`@RequirePermissions(...)` rules. If the user lacks the permission the request is
**not sent** (a `PermissionDeniedError` is thrown locally and shown to nobody) —
this avoids pointless 403s and error toasts behind UI that should already be
hidden. The backend remains the real guard. Table: `03-roles-permissions.md` §4.

---

## 3. Authentication

### 3.1 Endpoints
| Action | Method | Path | Body |
|---|---|---|---|
| Register | POST | `/auth/register` | `RegisterAuthDto` |
| Login | POST | `/auth/login` | `{ email, password }` |
| Logout | POST | `/auth/logout` | — |
| Current user | GET | `/auth/me` | — |

`RegisterAuthDto`: `organizationName*, password*, centerName*, firstName*, lastName*, phone*, email?, login?`

### 3.2 Login response (verified)
```jsonc
// POST /auth/login → 201
{
  "access_token": "eyJhbGciOi…",
  "user": {
    "id": 40,
    "email": "claude.test.talim@gmail.com",
    "role": "admin",            // base role type
    "roleId": 2,
    "roleName": "Administrator", // admin-defined display name
    "permissions": ["*"]         // permission keys, or ["*"] for admin
  }
}
```

### 3.3 `GET /auth/me` (verified)
```jsonc
{
  "user": {
    "id": 40, "email": "…", "role": "admin",
    "roleId": 2, "roleName": "Administrator",
    "centerId": null,            // null for org-level admin
    "permissions": ["*"]
  }
}
```

⚠️ Note the envelope: login returns `user` at the top level of its body, and
`/auth/me` also wraps in `{ user }`. **`permissions[]` is the whole authorization
model** — the frontend must gate on these keys, not on `role`.

### 3.4 Session bootstrap
- On app start, if a token exists and the route isn't `/login` / `/register`,
  fetch `/auth/me` **before rendering**.
- Failure → clear the token, go to `/login`.
- Navigation guards do the same rehydration when the user isn't loaded yet.

### 3.5 Home page after login
Pick the first page the user actually has permission for (not by role name), so
any admin-created role lands somewhere sensible:

`statistics.view → /statistics` · `teacher.today → /today` · `groups.view → /groups` ·
`students.view → /students` · `leads.view → /leads` · `payments.view → /payments` ·
`syllabus.view → /syllabuses` · fallback `/profile`.

The same resolver runs when a guard blocks a route.

---

## 4. Cross-cutting behavior

### 4.1 Pagination
List endpoints take `page` & `perPage` and return:
```jsonc
{ "data": [...], "meta": { "total": 1, "page": 1, "perPage": 10, "totalPages": 1 } }
```
Exceptions (verified):
- **`GET /rooms`** returns `meta: { total }` only — **no `page`/`perPage`/`totalPages`**.
  Treat rooms as unpaginated.
- **`GET /payments/pending-receipts`** adds **`meta.totalAmount`** — the sum of
  *all* pending receipts matching the filter (not just the page). It drives the
  "Confirm all" button.

### 4.2 Unpaginated `/all` endpoints (bare arrays)
These return a **bare JSON array**, not `{ data }`:
`/centers/all`, `/students/all`, `/groups/all`, `/group/all` (alias),
`/users/teachers`, `/students/referrals`, `/roles`, `/roles/permissions`,
`/staff-salaries`, `/staff/{userId}/deductions`, `/students/{id}/discount-periods`.

⚠️ `/subjects` has **no** `/all` variant — call `/subjects?perPage=999`.

### 4.3 Center scoping (multi-center)
Most resources filter by `centerId`. The pattern:
1. Load `/centers/all`.
2. Pick the one with `isDefault`, else the first.
3. Keep it globally; the header switcher can also select **"All centers"**
   (send **no** `centerId` at all).
4. Don't fetch a scoped list before a center is resolved.
5. New records use the active center, or the default center when "All" is selected.

Users whose role can't switch centers are pinned to their own `centerId`.

### 4.4 Status-change endpoints (inconsistent by design)
| Resource | Call | Notes |
|---|---|---|
| Student | `PUT /students/change-status/{id}?status={status}` + body `{ status, comment?, returnLikelihood? }` | status is sent **twice** (query + body); `returnLikelihood` is required for `stopped` / `ignored` |
| Group | `PUT /groups/change-status/{id}` body `{ status }` (also accepts `?status=`) | — |
| Lead | `PUT /leads/change-status/{id}` body `{ status, reason? }` | `reason` is appended to the comment |

Transitions are enforced server-side: an illegal one returns
`400 { message: "ACTIVE → zzz o‘tish mumkin emas" }`.

### 4.5 Filter sentinels
The UI uses `status: 'all'` as a sentinel — **strip it** before the request.
`undefined` params are dropped by axios automatically.

### 4.6 Numbers arrive as strings ⚠️
Postgres `numeric` columns are serialized as **strings**. Verified on:
`student.monthlyFee` `"500000"`, `student.discountPercent` `"10"`,
`group.monthlyFee` `"500000"`, `payment.amountDue` `"138461.54"`,
`payment.amountPaid` `"0.00"`, `payment.refundedAmount`,
`payment.transferredOutAmount`, `payment.manualExcludedAmount`,
`pendingReceipt.amount`, `user.phone` (when digits only).

But **computed** fields on the same objects are real numbers:
`payment.remainingAmount`, `receivedAmount`, `payableNow`, `pendingAmount`,
and everything inside `/payments/student/{id}/summary`.

→ Interfaces must model this honestly (`string` where the backend sends a
string) and the UI converts with a helper. Never `Number()` implicitly in a
template.

### 4.7 Date & month formats
- `date` fields: `YYYY-MM-DD` (e.g. `dueDate`, `workDate`, `lessonDates[]`).
- Timestamps: ISO 8601 with `Z`.
- Month filters in **requests**: `YYYY-MM`.
- ⚠️ In **responses**, `forMonth` is sometimes a full date: `payment.forMonth`
  and `staffSalary.forMonth` come back as `YYYY-MM-01`, while
  `summary.months[].forMonth` is `YYYY-MM`. Slice before comparing.
- `startTime` is `HH:mm` in the schedule board but `HH:mm:ss` in
  `group.schedules[]` and `teachers/me/today`.

### 4.8 Timezone
Every center and group carries an IANA `timezone` (default `Asia/Tashkent`).
"Today", lesson dates and the working day are computed in the **group's**
timezone — the attendance response returns both `timezone` and `today` so the
client never computes them itself.

---

## 5. Endpoint reference — all 143 operations

Legend: `*` required · body fields listed as `name: type`.
Response column shows the **real** shape (verified) — `{…}` means the full entity.

### 5.1 Auth (4)
| Method | Path | Params / Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `RegisterAuthDto` | created org/user |
| POST | `/auth/login` | `{ email*, password* }` | `{ access_token, user }` §3.2 |
| POST | `/auth/logout` | — | — |
| GET | `/auth/me` | — | `{ user }` §3.3 |

### 5.2 Organizations & subscriptions (4)
| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `/organizations/branding` | — | `{ organizationId, name, logoUrl, faviconUrl, brandingUpdatedAt }` |
| PUT | `/organizations/branding` | `{ name?, logoUrl?, faviconUrl? }` | same |
| GET | `/organizations/{id}` | — | organization |
| GET | `/subscriptions/organization/{id}` | — | subscription |

`logoUrl` / `faviconUrl` accept a `data:image/…;base64,…` **or** an `https://…`
URL. An **empty string removes** the image. Client-side size limits used by the
old app: logo ≤ 300 KB, favicon ≤ 100 KB.

### 5.3 Users (10)
| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `/users` | `centerId, role?, name, phone, page, perPage` | `{ data, meta }` |
| POST | `/users` | `CreateUserDto` | user `{…}` |
| GET | `/users/{id}` | — | user |
| PUT | `/users/{id}` | `UpdateUserDto` | user |
| DELETE | `/users/{id}` | — | — |
| GET | `/users/email/{email}` | — | user |
| GET | `/users/employees` | `centerId, name, phone, page, perPage` | `{ data, meta }` |
| GET | `/users/teachers` | `centerId?, name?` | **bare array** |
| GET | `/users/me` | — | own profile `{…}` |
| PUT | `/users/me` | `{ firstName?, lastName?, login?, phone?, password? }` | profile |

`CreateUserDto`: `firstName*, lastName*, login*, phone*, password*, roleId*,
centerId*, role?, salary?, commissionPercentage?`

⚠️ **`roleId` is the required field** (from `GET /roles`). The legacy `role`
string is only a fallback when `roleId` is absent. The new app currently sends
`role` — that must change.

Employee row (verified):
```jsonc
{ "id", "firstName", "lastName", "login", "phone", "role", "salary",
  "commissionPercentage", "createdAt",
  "center": {…}, "userRole": { "id","key","name","baseRole","permissions",
                               "isSystem","isLocked","createdAt","updatedAt" } }
```
`GET /users/me` additionally returns `organization {…}`, `centerId`,
`organizationId`, `roleId`, `roleName`.

### 5.4 Roles & permissions (5)
| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `/roles` | — | **bare array** of Role |
| GET | `/roles/permissions` | — | **bare array** of PermissionGroup |
| POST | `/roles` | `{ name*, baseRole*, permissions*[], key? }` | Role |
| PUT | `/roles/{id}` | `{ name?, baseRole?, permissions?[] }` | Role |
| DELETE | `/roles/{id}` | — | — |

```jsonc
// Role
{ "id":2, "key":"admin", "name":"Administrator", "baseRole":"admin",
  "permissions":["*"], "isSystem":true, "isLocked":true, "userCount":1,
  "createdAt":"…", "updatedAt":"…" }

// PermissionGroup
{ "key":"students", "label":{"uz":"O‘quvchilar","ru":"Ученики"},
  "permissions":[ { "key":"students.view",
                    "label":{"uz":"O‘quvchilarni ko‘rish","ru":"Просмотр учеников"} } ] }
```
`baseRole` on create/update is limited to `teacher | manager | reception | other`
(`admin` can't be assigned). System roles can't change their `baseRole`; locked
roles (Administrator) can't be edited or deleted. Full catalog: `03-roles-permissions.md`.

### 5.5 Centers (6)
| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `/centers` | `page?, perPage?, name?` | `{ data, meta }` |
| GET | `/centers/all` | — | **bare array** |
| GET | `/centers/{id}` | — | Center |
| POST | `/centers` | `{ name*, isDefault? }` | Center |
| PUT | `/centers/{id}` | `{ name*, isDefault?, latitude?, longitude?, checkInRadiusMeters?, publicIp?, timezone? }` | Center |
| DELETE | `/centers/{id}` | — | — |
| POST | `/centers/{id}/capture-ip` | — | `{ publicIp }` |

```jsonc
// Center (verified)
{ "id":4, "name":"Markaz 1", "isDefault":true, "timezone":"Asia/Tashkent",
  "latitude":null, "longitude":null, "checkInRadiusMeters":150,
  "publicIp":null, "organizationId":5, "createdAt":"…" }
```
Geo/IP fields exist **only for staff attendance**: `capture-ip` is pressed while
on the center's Wi-Fi and stores the request's public IP. Send `null` (not `0`)
to clear coordinates.

### 5.6 Students (13)
| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `/students` | `StudentsParams` | `{ data, meta }` |
| GET | `/students/all` | `centerId?` | **bare array** |
| GET | `/students/referrals` | — | **bare array** (referrer picker) |
| GET | `/students/{id}` | — | Student detail |
| POST | `/students` | `CreateStudentDto` | Student |
| PUT | `/students/{id}` | `UpdateStudentDto` | Student |
| PUT | `/students/change-status/{id}?status=` | `{ status*, comment?, returnLikelihood? }` | Student |
| POST | `/students/transfer/preview` | `{ studentIds*[], fromGroupId* }` | per-student debt/credit |
| POST | `/students/transfer` | `{ studentIds*[], fromGroupId*, toGroupId*, transferDate?, reason?, closeSourceGroup? }` | `{ …, sourceGroupClosed }` |
| GET | `/students/{id}/discount-periods` | — | **bare array** |
| POST | `/students/{id}/discount-periods` | `{ percent*, fromMonth*, toMonth?, reason? }` | period |
| PUT | `/students/{id}/discount-periods/{periodId}` | same, all optional | period |
| DELETE | `/students/{id}/discount-periods/{periodId}` | — | — |
| GET | `/student` | alias of `/students` | — |

`StudentsParams`: `centerId, name, phone, search, status, groupId,
returnLikelihood(never|maybe|sure), preferredTime(morning|evening), subjectId,
preferredDays[] (repeated param), page, perPage`

`CreateStudentDto`: `firstName*, lastName*, phone*, secondPhone?, birthDate?,
comment?, heardAboutUs?, preferredTime?, preferredDays?[], passportSeries?,
passportNumber?, jshshir?, referrerId?, monthlyFee?, discountPercent?,
discountReason?, discountPeriods?[], status?, centerId?, groupIds?[], subjectId?`

⚠️ `UpdateStudentDto` is **narrower** than create — it has no `secondPhone`,
`comment`, `heardAboutUs`, `preferredTime`, `preferredDays`, passport fields,
`jshshir`, or `discountPeriods`; it adds `login` and `password`. Discount
periods are edited through their own endpoints after creation.

⚠️ **`DELETE /students/{id}` does not exist.** Removal is a status change
(`stopped` / `ignored`). The old app called it and got a 404.

⚠️ `POST /students` fails with `400 "Rol tanlanmagan"` when the organization has
no `student` base role seeded — a backend seeding concern, not a client bug.

```jsonc
// Student list row (verified)
{ "id","firstName","lastName","phone","secondPhone","birthDate","comment",
  "heardAboutUs","preferredTime","preferredDays":["monday"],"studyDays":["monday"],
  "passportSeries","passportNumber","jshshir",
  "monthlyFee":"500000",          // numeric string
  "discountPercent":"10",         // numeric string
  "discountReason","status":"ACTIVE","returnLikelihood",
  "activatedAt","stoppedAt","centerId","subjectId","createdAt",
  "subject":null, "groupIds":[14], "_groupIds":[14], "referrerId":null,
  "discountPeriods":[ { "id","studentId","fromMonth":"2026-01-01",
                        "toMonth":"2026-03-01","percent":15,"reason","createdAt" } ] }
```
- `studyDays` = the days derived from the student's groups (read-only), distinct
  from the wished-for `preferredDays`.
- `_groupIds` is an internal duplicate of `groupIds` — ignore it.
- In discount **periods**, `fromMonth`/`toMonth` come back as full dates
  (`2026-01-01`) although they're sent as `YYYY-MM`. `toMonth` is an
  **exclusive** upper bound.

`GET /students/{id}` adds `user {…}`, `center {…}`, `groups[]` (group entities,
**without** their schedule), `login`. It does **not** include `centerName`, and
its `groups[]` carry no `schedule` — the student card should read those from
`/payments/student/{id}/summary`, which does return both.

### 5.7 Groups (8) + schedule (7) + attendance (4) + lesson plan (4)

| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `/groups` | `centerId?, name?, teacherId?, roomId, days[], page?, perPage?` | `{ data, meta }` |
| GET | `/groups/all` | `centerId?, teacherId?` | **bare array** |
| GET | `/groups/{id}` | — | Group |
| POST | `/groups` | `CreateGroupDto` | Group |
| PUT | `/groups/{id}` | `UpdateGroupDto` | Group |
| DELETE | `/groups/{id}` | — | — |
| PUT | `/groups/change-status/{id}` | `{ status* }` (`new|started|finished`) | Group |
| GET | `/group/all` | alias | — |

`CreateGroupDto`: `name*, subjectId*, teacherId*, roomId*, monthlyFee*, days*[{day,startTime}],
timezone?, startDate?, endDate?, lessonDurationMinutes?(90), status?, centerId?`

`UpdateGroupDto` adds **`applyFeeFrom: 'next_month' | 'current_month'`** — a fee
change defaults to taking effect **next month**; `current_month` is only for
correcting a mistake.

```jsonc
// Group list row (verified)
{ "id","name","timezone","startDate","endDate","lessonDurationMinutes",
  "status":"new","startedAt":null,"monthlyFee":"500000","createdAt",
  "center":{…},"subject":{"id","name","createdAt"},
  "teacher":{"id","firstName","lastName","login","phone","role","salary",
             "commissionPercentage","createdAt"},
  "room":{"id","name","createdAt"},
  "schedules":[{"id","day":"monday","startTime":"10:00:00"}],
  "upcomingMonthlyFee":null, "upcomingFeeFromMonth":null }
```
`upcomingMonthlyFee` / `upcomingFeeFromMonth` are set when a fee change is
pending for next month — the list shows "from <date>: <fee>".

Changing `endDate` recalculates the group's status **and its open payments**.
Starting a group requires `endDate` and `roomId`; missing ones come back as a
**422 with field errors**, which the UI maps onto the edit form.

**Schedule (`/group-schedule`)**
| Method | Path | Body / Params | Response |
|---|---|---|---|
| GET | `/group-schedule/board` | `centerId?` | `{ rooms[], lessons[] }` |
| POST | `/group-schedule/conflicts` | `{ days*[], roomId?, teacherId?, lessonDurationMinutes?, excludeGroupId? }` | conflicts[] |
| GET/POST/PUT/DELETE | `/group-schedule[/{id}]` | CRUD | — |

```jsonc
// board (verified)
{ "rooms":[{"id","name"}],
  "lessons":[{ "groupId","groupName","groupStatus","day":"monday",
               "startTime":"10:00","endTime":"11:30","durationMinutes":90,
               "roomId","roomName","teacherId","teacherName",
               "subjectId","subjectName" }] }
```
The board returns the **whole week** for all unfinished groups; the client
filters by day. Teachers see the full board too (room availability is shared).
`conflicts` returns facts only (`reason: 'room' | 'teacher'`, the blocking group
and its times) — the message is composed client-side for translation.

**Attendance (`/groups/{groupId}/attendance`)**
| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `…/lesson-dates` | `mode(last|range), count?, from?, to?` | `LessonDatesViewDto` ✅ *(only schema'd response in the spec)* |
| POST | `…/submit` | `{ lessonDate*, items*[{studentId,status,comment?}] }` | attendance rows |
| POST | `…/reschedule` | `{ toDate*, fromDate?, reason? }` | — |
| GET | `…` (report) | `from*, to*` | attendance rows |

```jsonc
// lesson-dates (verified)
{ "timezone":"Asia/Tashkent", "today":"2026-09-23",
  "students":[{"id","firstName","lastName","joinedAt":"2026-09-01","leftAt":null}],
  "lessonDates":["2026-09-14","2026-09-16",…],
  "overridesByDate":{ "2026-09-16":{"type":"cancelled","movedTo":"2026-09-18","reason":"…"},
                      "2026-09-18":{"type":"extra","movedFrom":"2026-09-16","reason":"…"} },
  "attendanceByDate":{ "2026-09-14":{"exists":false,"rows":[]} } }
```
Rules that the UI must honour:
- Lesson dates come from **schedule + group start/end + timezone**, never from
  attendance rows. `exists: false` is normal.
- **`joinedAt` / `leftAt` define each student's membership window.** Cells before
  `joinedAt` or on/after `leftAt` (exclusive) are not editable and show "—".
- Status values: `present | absent | late | excused`. **`comment` is required
  when status is `excused`** — the backend returns 400 otherwise.
- Submitting is a bulk upsert keyed by `(groupId, studentId, lessonDate)`.
  Teachers may submit for today or any past date **in the current month**;
  admins may override any past date.
- Reschedule marks a scheduled date `cancelled` and adds an `extra` lesson on
  `toDate`; `toDate` must not already be a scheduled lesson date.

**Lesson plan (`/groups/{groupId}/plan`)**
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `…/plan` | — | `{ group, syllabus, timezone, today, totalLessons, horizonDate, lessons[] }` |
| PUT | `…/plan/syllabus` | `{ syllabusId: number\|null }` | plan |
| PUT | `…/plan/lessons/{lessonNumber}/topics` | `{ topicIds*[] }` | plan |
| POST | `…/plan/distribute` | `{ totalLessons?, instructions? }` | plan (AI) |

```jsonc
{ "group":{"id","name","status","startDate","endDate","subject":{"id","name"}},
  "syllabus":null, "timezone","today","totalLessons":39,"horizonDate":"2026-11-30",
  "lessons":[{"lessonNumber":1,"date":"2026-09-01","isPast":true,"isToday":false,"topics":[]}] }
```
Attaching a different syllabus **clears the previous topic assignments**.
`distribute` replaces the whole plan (hand edits afterwards are fine).

### 5.8 Payments (18) — the largest surface

| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `/payments` | `centerId?, page?, perPage?, status?, forMonth?, overdueOnly?, studentId?, groupId?, teacherId?, dateFrom?, dateTo?, search?` | `{ data, meta }` |
| GET | `/payments/export` | same filters, **no pagination** | **.xlsx blob** |
| GET | `/payments/{id}` | — | Payment |
| PUT | `/payments/{id}` | `{ plannedStudyUntilDate? }` | Payment |
| PUT | `/payments/mark-as-paid/{id}` | `{ comment?, paymentMethod?, paidAt? }` | `{ receipt, payment, pending, check }` |
| PUT | `/payments/pay-partial/{id}` | `{ amount*, comment?, paymentMethod?, paidAt? }` | `{ receipt, payment, pending, check }` |
| PUT | `/payments/calculate/{id}` | `{ plannedStudyUntilDate* }` | calculation (preview only) |
| PUT | `/payments/preview-exclusion/{id}` | `{ excludeLessons?, excludeAmount? }` | preview (not saved) |
| PUT | `/payments/apply-exclusion/{id}` | `{ excludeLessons?, excludeAmount?, comment }` | saved |
| GET | `/payments/{paymentId}/receipts` | — | `{ data: Check[] }` |
| GET | `/payments/receipt/{receiptId}/check` | — | Check |
| GET | `/payments/pending-receipts` | `centerId?, page?, perPage?, dateFrom?, dateTo?` | `{ data, meta(+totalAmount) }` |
| GET | `/payments/receipts-stats` | `centerId?, dateFrom?, dateTo?` | stats |
| PUT | `/payments/confirm-receipt/{id}` | — | — |
| PUT | `/payments/reject-receipt/{id}` | — | — |
| PUT | `/payments/confirm-receipts` | `{ receiptIds?[] \| all*, centerId?, dateFrom?, dateTo? }` | bulk result |
| PUT | `/payments/pay-debt/student/{studentId}` | `{ amount?, comment?, paymentMethod?, paidAt? }` | summary + `checks[]` |
| GET | `/payments/student/{studentId}/summary` | — | `{ student, totals, months[] }` |

`GET /payments` runs **`ensurePayments`** first: missing monthly rows are created
for ACTIVE students and their groups before the list is returned.

```jsonc
// Payment row (verified)
{ "id","studentId","groupId",
  "amountDue":"138461.54","amountPaid":"0.00",       // numeric strings
  "refundedAmount":0,"refundedAt":null,"transferredOutAmount":"0.00",
  "dueDate":"2026-09-10","hardDueDate":"2026-09-15",
  "lessonsPlanned":13,"lessonsBillable":4,"lessonsExcused":0,
  "manualExcludedAmount":"0.00","manualExcludedLessons":null,"manualExcludedReason":null,
  "plannedStudyUntilDate":null,"invoiceNo":null,
  "status":"unpaid","forMonth":"2026-09-01","createdAt",
  "student":{…},"group":{…,"teacher":{…}},
  // computed (real numbers):
  "isOverdue":false,"remainingAmount":138461.54,"receivedAmount":0,
  "payableNow":138461.54,"pendingAmount":0,
  "hasPendingReceipt":false,"pendingReceiptsCount":0,
  "discountPercentApplied":10,
  "discountBreakdown":[{"percent":10,"reason":"Base: aka"}] }
```

**The three money figures (must not be confused):**
| Field | Meaning |
|---|---|
| `amountPaid` | Confirmed by an admin — money in the till |
| `pendingAmount` | Taken by reception, awaiting confirmation — on that employee |
| `receivedAmount` | `amountPaid + pendingAmount` — what the student actually handed over |
| `remainingAmount` | `amountDue − amountPaid` — **the till's** debt |
| `payableNow` | `amountDue − receivedAmount` — **what to still collect from the student** ⭐ |

Collection screens must use **`payableNow`**, never `remainingAmount`.

```jsonc
// pay-partial / mark-as-paid response (verified)
{ "receipt":{ "paymentId","amount","invoiceNo","installmentIndex",
              "checkNo":"1-A","transactionNo":"TRX-20260923-000049",
              "balanceBefore","balanceAfter","paidAt","receivedById","receivedAt",
              "confirmedById","confirmedAt","status":"confirmed",
              "paymentMethod":"cash","comment",
              "receiverCommissionPercentSnapshot","receiverCommissionAmountSnapshot",
              "transferFromPaymentId","id","createdAt" },
  "payment":{…},
  "pending":false,        // true when the payer was reception → awaits confirmation
  "check":{…} }           // print this immediately
```

```jsonc
// Check (also each element of /payments/{id}/receipts and /receipt/{id}/check)
{ "receiptId","checkNo":"1-A","transactionNo":"TRX-20260923-000049",
  "invoiceNo","installmentIndex","status":"confirmed",
  "student":{"id","firstName","lastName","fullName","phone"},
  "group":{"id","name"}, "teacher":{"id","fullName"},
  "forMonth":"2026-09","amount","balanceBefore","balanceAfter",
  "paymentMethod":"cash","paidAt","receivedAt","createdAt",
  "receivedBy":{"id","fullName"},"comment" }
```
`checkNo` grows per installment: `1`, `1-A`, `1-A-B`… `GET /payments/{id}/receipts`
returns **`{ data: [...] }`** ascending by `receivedAt`, including rejected ones —
one request powers both the history table and reprinting.

```jsonc
// preview-exclusion (verified)
{ "paymentId","forMonth","lessonsPlanned","lessonsBillable","perLessonAmount",
  "baseAmountDue","currentAmountDue","amountPaid",
  "excludeLessons","excludedAmount","newAmountDue","newRemaining" }

// calculate (verified)
{ "paymentId","studentId","studentName","forMonth","plannedStudyUntilDate",
  "lessonsPlanned","lessonsBillable","lessonsExcused","discountPercent",
  "amountDue","currentAmountDue","currentAmountPaid","pendingAmount",
  "totalPaid","remainingAmount","difference" }

// receipts-stats (verified)
{ "confirmed":{"count","amount"}, "pending":{…}, "rejected":{…}, "total":{…} }
// total = confirmed + pending (rejected money never reached the till)
```
`apply-exclusion` **requires `comment`** whenever `excludeLessons` or
`excludeAmount` is sent. `excludeAmount` wins if both are given. Apply it
**before** taking the payment, so the reduced `amountDue` is what gets paid.

```jsonc
// /payments/student/{studentId}/summary (verified)
{ "student":{ …student fields…, "centerId","centerName","subject",
              "groups":[{"id","name","monthlyFee","days":["monday"],
                         "schedule":[{"day","startTime":"10:00:00"}]}] },
  "totals":{"totalDue","totalPaid","totalDebt","totalPending","totalReceived","payableNow"},
  "months":[{ "paymentId","forMonth":"2026-09","groupId","groupName",
              "amountDue","amountPaid","pendingAmount","receivedAmount",
              "remaining","payableNow","status",
              "lessonsPlanned","lessonsBillable","lessonsExcused","effectiveBillable",
              "fullAmount","perLessonAmount","isProrated",
              "manualExcludedAmount","manualExcludedLessons","manualExcludedReason" }] }
```
Months are ordered **newest → oldest**; all values are real numbers here.
`pay-debt` spreads one amount over open months **oldest → newest** and returns
the updated summary plus **one check per month** in `checks[]`.

**Confirm-receipts (bulk)** takes either `receiptIds[]` **or** `all: true` (+ the
same filters). `all` is mandatory when `receiptIds` is absent, to prevent an
accidental confirm-everything. One failure doesn't stop the rest; the response
reports `requested, confirmedCount, confirmedAmount, skippedCount, failedCount,
confirmed[], skipped[], failed[]`.

**Who auto-confirms:** admin/super_admin payments are confirmed immediately;
reception/manager payments create a **pending** receipt for an admin to confirm.

### 5.9 Expenses (5)
| Method | Path | Params / Body |
|---|---|---|
| GET | `/expenses` | `page?, perPage?, forMonth?, centerId?, search?` |
| GET | `/expenses/{id}` | — |
| POST | `/expenses` | `{ name*, amount*, centerId?, description?, forMonth? }` |
| PUT | `/expenses/{id}` | same, all optional |
| DELETE | `/expenses/{id}` | — |

`forMonth` defaults to the current month.

### 5.10 Payroll — staff salaries (2)
| Method | Path | Params / Body |
|---|---|---|
| GET | `/staff-salaries` | `forMonth?(YYYY-MM), centerId?` → **bare array** |
| PUT | `/staff-salaries/pay/{id}` | `{ amount*, comment?, deduction? }` |

The list **ensures** rows exist for the requested month (never empty when staff
exist). **Future months are rejected.**

`deduction`: `{ amount*, reason*, type?: 'late'|'unsettled_payment'|'other' }`.
Send `amount: 0` to record **only** a deduction with no payout.

StaffSalary *(old-project verified)*:
```ts
{ id, userId, forMonth, baseSalary, paidAmount, status: 'paid'|'unpaid'|'partial',
  paidAt, comment, createdAt, user: StaffUser, paymentHistory?: [{id,amount,comment,paidAt,paidBy}],
  // teachers only:
  earningForMonth?, earningBaseSalarySnapshot?, earningCommissionAmount?,
  earningCarryOverCommission?, earningTotalEarning?,
  // deductions:
  deductionAmount?, netSalary?, remaining?, deductionOutstanding? }
```
`remaining` already accounts for the deduction — prefer it over recomputing.

### 5.11 Staff performance (5)
| Method | Path | Params / Body |
|---|---|---|
| GET | `/staff/me/overview` | `forMonth?` |
| GET | `/staff/{userId}/overview` | `forMonth?` |
| GET | `/staff/{userId}/deductions` | — → **bare array** |
| POST | `/staff/deductions` | `{ userId*, amount*, reason*, forMonth?, type? }` |
| DELETE | `/staff/deductions/{id}` | — |

```jsonc
// overview (verified, top level)
{ "user":{ "id","firstName","lastName","phone","login","role","roleName",
           "centerId","centerName","salary","commissionPercentage","createdAt" },
  "forMonth":"2026-09-01",
  "summary":{ "expectedDays","attendedDays","missedDays","lateDays",
              "totalLateMinutes","flaggedDays",
              "unsettledCount","unsettledAmount","rejectedCount","rejectedAmount",
              "deductionThisMonth","deductionOutstanding" },
  "months":[…], "lateRecords":[…], "attendanceRecords":[…],
  "unsettledReceipts":[…], "deductions":[…], "salary":null }
```
Element shapes of `months` / `deductions` / `unsettledReceipts` / `salary` are in
the old project's `staff.types.ts` *(old-project verified)*. A deduction larger
than one month's salary carries over automatically to later months. A deduction
already applied to a **paid** salary cannot be removed.

### 5.12 Staff attendance (8)
| Method | Path | Params / Body |
|---|---|---|
| POST | `/staff-attendance/check-in` | `{ latitude?, longitude?, accuracyMeters?, deviceId? }` |
| GET | `/staff-attendance/me/today` | — |
| GET | `/staff-attendance/me` | paging + `from,to,confidence,onlyFlagged,onlyLate,centerId,userId` |
| GET | `/staff-attendance` | same filters |
| GET | `/staff-attendance/report` | `from*, to*, centerId?` |
| POST | `/staff-attendance/manual` | `{ userId*, workDate*, checkInTime*(HH:mm), note? }` |
| POST | `/staff-attendance/{id}/confirm` | — |
| DELETE | `/staff-attendance/{id}` | — |

```jsonc
// me/today (verified)
{ "date":"2026-09-23","checkedIn":false,"attendance":null,
  "firstLessonAt":null,"lessonsToday":0,"centerConfigured":false }
// report (verified)
{ "from","to","centerNotConfigured":false,
  "rows":[{ "user":{id,firstName,lastName,role},
            "expectedDays","attendedDays","missedDays","lateDays",
            "totalLateMinutes","flaggedDays" }] }
```
Check-in is **one record per day** — pressing again returns the existing one with
`alreadyCheckedIn: true`. Geo/device data is optional; omitting it only lowers
`confidence` (`high|medium|low`) and adds `flags`
(`no_geo, low_gps_accuracy, far_from_center, ip_mismatch, center_not_configured,
shared_device, no_lesson_today`). Nothing is ever blocked. Manual records are
`source: 'manual'` and stay visibly unverified. Row shape:
`staffAttendance.types.ts` *(old-project verified)*.

### 5.13 Subjects (5) & Rooms (5)
| Method | Path | Params / Body |
|---|---|---|
| GET | `/subjects` | `centerId, name, page, perPage` → `{ data, meta }` |
| POST/PUT | `/subjects[/{id}]` | `{ name*, centerId* }` |
| GET | `/subjects/{id}` · DELETE | — |
| GET | `/rooms` | `centerId?, name?` → `{ data, meta:{ total } }` ⚠️ |
| POST/PUT | `/rooms[/{id}]` | `{ name*, centerId* }` |
| GET | `/rooms/{id}` · DELETE | — |

Both return `{ id, name, center: {…}, createdAt }` on create/update.

### 5.14 Statistics (1)
`GET /statistics/dashboard` — `centerId?, fromMonth?, toMonth?` (YYYY-MM).

```jsonc
// verified
{ "centerId":null,"fromMonth":"2026-09","toMonth":"2026-09",
  "payments":{ "statusEnum":{"PAID":"paid","UNPAID":"unpaid","PARTIAL":"partial"},
               "amountDue","amountPaid","refundedAmount","remainingAmount",
               "totalCount","paidCount","partialCount","unpaidCount" },
  "paymentsByMethod":[],
  "expenses":{"totalAmount","totalCount"},
  "payroll":{ "statusEnum":{…},"amountDue","amountPaid","remainingAmount",
              "totalCount","paidCount","partialCount","unpaidCount" },
  "students":{"totalCount","activeCount","addedCount","stoppedCount"},
  "netCashflow":0 }
```
⚠️ **There is no monthly time series.** The response is a single aggregate for
the whole range — the old app's charts split one number across months, which is
not real data. Charts stay deferred until the backend provides a series.
`paymentsByMethod` is the one breakdown available (payments grouped by method).

### 5.15 Leads (6)
| Method | Path | Params / Body |
|---|---|---|
| GET | `/leads` | `centerId?, name?, phone?, status?, groupId?, followUpDate?, page?, perPage?` |
| POST | `/leads` | `CreateLeadDto` |
| PUT | `/leads/{id}` | `UpdateLeadDto` |
| DELETE | `/leads/{id}` | — |
| PUT | `/leads/change-status/{id}` | `{ status*, reason? }` |
| POST | `/leads/{id}/transfer-to-student` | **`CreateStudentDto`** |

Lead status enum (confirmed in the spec): **`new | converted | discarded | keyinroq`**
— `keyinroq` ("later") really is an Uzbek word in the backend enum.
`followUpDate` accepts the literal `'today'` or `YYYY-MM-DD`.

`CreateLeadDto`: `phone*` plus `firstName?, lastName?, secondPhone?, birthDate?,
monthlyFee?, discountPercent?, discountReason?, comment?, heardAboutUs?,
preferredTime?, preferredDays?[], passportSeries?, passportNumber?, jshshir?,
status?, groupIds?[], centerId?, followUpDate?`

Converting takes the **student** payload, creates the student and marks the lead
`converted`.

### 5.16 Syllabuses + AI (12)
| Method | Path | Params / Body |
|---|---|---|
| GET | `/syllabuses` | `centerId, subjectId, name, page, perPage` |
| GET | `/syllabuses/{id}` | — (topics included) |
| POST | `/syllabuses` | `{ name*, subjectId*, description? }` |
| PUT | `/syllabuses/{id}` | partial |
| DELETE | `/syllabuses/{id}` | — |
| POST | `/syllabuses/{id}/topics` | `{ title*, description?, difficulty?, estimatedLessons?, guide?, lessonOutline?, homework? }` |
| PUT | `/syllabuses/{id}/topics/{topicId}` | partial |
| DELETE | `/syllabuses/{id}/topics/{topicId}` | — |
| PUT | `/syllabuses/{id}/topics/reorder` | `{ topicIds*[] }` |
| POST | `/syllabuses/{id}/topics/{topicId}/generate-content` | `{ audience?, instructions? }` |
| POST | `/syllabuses/ai/chat` | `{ subjectId?, messages*[{role,content}] }` |
| POST | `/syllabuses/ai/save` | `{ subjectId*, name*, description?, topics*[] }` |

`difficulty`: `easy | medium | hard`. Topic content fields (`guide`,
`lessonOutline`, `homework`) are **markdown**.
AI chat returns a discriminated union: `{ type: 'question', message }` or
`{ type: 'plan', message, plan }`. Nothing is saved until `ai/save`.
`generate-content` returns a draft only — the user edits and saves via PUT.

### 5.17 Telegram — parents bot (8)
| Method | Path | Params / Body |
|---|---|---|
| GET | `/telegram/students/{studentId}/link` | — |
| POST | `/telegram/students/{studentId}/link/regenerate` | — |
| DELETE | `/telegram/parents/{linkId}` | — |
| GET | `/telegram/settings` | — |
| PUT | `/telegram/settings` | `{ isEnabled?, notifyPaymentReceived?, notifyPaymentConfirmed?, notifyAbsence?, notifyDebt?, debtReminderDay? }` |
| PUT | `/telegram/bot-token` | `{ botToken* }` |
| DELETE | `/telegram/bot-token` | — |
| POST | `/telegram/debt-reminders/send-now` | — |

```jsonc
// student link (verified)
{ "studentId":29,"botUsername":null,"botConfigured":false,
  "deepLink":null,"qrDataUrl":null,"parents":[] }
// settings (verified)
{ "id","organizationId","botUsername","botTokenUpdatedAt",
  "isEnabled","notifyPaymentReceived","notifyPaymentConfirmed",
  "notifyAbsence","notifyDebt","debtReminderDay","createdAt","updatedAt",
  "botConfigured","botConnected","botTokenMasked" }
```
The QR encodes a **secret token**, not the student id. Regenerating invalidates
the old QR instantly but keeps already-linked parents. Unlinking a parent
deactivates the row (history is kept). The bot token is validated against
Telegram (`getMe`) when set — the username is derived, never typed. The token is
never returned, only `botTokenMasked`. `debtReminderDay` is **1–28**.
`send-now` ignores the `notifyDebt` switch (the button was pressed on purpose).

### 5.18 Teacher today (1)
`GET /teachers/me/today` — `centerId?` (admin only).

```jsonc
// verified
{ "date":"2026-09-23","scope":"center","canCheckIn":false,
  "lessons":[{ "group":{"id","name","status","subject":{…},"room":{…}},
               "teacher":{"id","firstName","lastName"},
               "date","startTime":"10:00:00","lessonNumber",
               "hasSyllabus":false,"topics":[],"previousTopics":[] }] }
```
A teacher gets `scope: "teacher"` + `canCheckIn: true` and only their own
lessons. Admin/manager get `scope: "center"` + `canCheckIn: false` and the whole
center's lessons **with teacher names, read-only**.

---

## 6. Data model rules

### 6.1 Naming (per `conventions.md` §4)
Entity `Student` · payload `StudentForm` · query `StudentsParams` ·
non-paginated response `DashboardResponse` · list `PaginatedResponse<T>`.

### 6.2 Enums — backend-exact values
| Enum | Values |
|---|---|
| Student status | `new`, **`ACTIVE`** (⚠️ uppercase, the others lowercase), `ignored`, `stopped`, `finished` |
| Return likelihood | `never`, `maybe`, `sure` |
| Preferred time | `morning`, `evening` |
| Week day | `monday` … `sunday` |
| Group status | `new`, `started`, `finished` |
| Attendance status | `present`, `absent`, `late`, `excused` |
| Payment status | `unpaid`, `partial`, `paid` |
| Payment method | `cash`, `card`, `bank_transfer`, `online` |
| Receipt status | `pending`, `confirmed`, `rejected` |
| Payroll status | `unpaid`, `partial`, `paid` |
| Lead status | `new`, `converted`, `discarded`, **`keyinroq`** |
| Deduction type | `late`, `unsettled_payment`, `other` |
| Topic difficulty | `easy`, `medium`, `hard` |
| User role (type) | `super_admin`, `admin`, `teacher`, `manager`, `reception`, `other`, `student` |
| Role `baseRole` | `admin`, `teacher`, `manager`, `reception`, `other` |
| Attendance confidence | `high`, `medium`, `low` |
| Attendance source | `self`, `reception`, `manual` |
| Override type | `cancelled`, `extra` |

### 6.3 Sensitive fields
`passportSeries`, `passportNumber`, `jshshir` are returned in list endpoints
**only to admin/super_admin** — the spec says so explicitly. `password` is never
returned (the create response echoes a hash; ignore it). `salary` and
`commissionPercentage` **are** returned on user objects.

---

## 7. The business chain

```
Lead ──convert──▶ Student ──enroll──▶ Group (schedule + attendance)
                     │                        │
                     ▼                        ▼
              Monthly Payment ◀── billed from attendance / lesson count
                     │
   ┌─────────────────┼──────────────────┐
   ▼                 ▼                  ▼
Receipt→confirm   Payroll           Dashboard
(reception→admin) (salary + teacher  (cashflow)
                   commission)
```

- **Reception** works the top: leads → enrol students → take money (creating
  **pending** receipts).
- **Teacher** works the middle: own groups, attendance, lesson plan, "today".
- **Admin/owner** works the bottom: confirm receipts, payments, payroll,
  expenses, dashboard.
- Attendance drives billing: `lessonsBillable` (minus `lessonsExcused`) times
  `perLessonAmount` gives `amountDue`; a mid-month join prorates it
  (`isProrated`, `fullAmount`).
- A confirmed receipt snapshots the receiver's commission
  (`receiverCommissionPercentSnapshot`) — that feeds payroll.

---

## 8. Known inconsistencies (resolved)

| # | Issue | Status |
|---|---|---|
| 1 | List responses were unwrapped inconsistently | ✅ Rule: every `*.api.ts` returns `response.data`; §4.2 lists the bare-array endpoints |
| 2 | Status-change shapes differ (query vs body) | ✅ Documented §4.4; students take **both** |
| 3 | Center scoping duplicated everywhere | ✅ One global scope + auto-injection §2.6, §4.3 |
| 4 | Global error handling | ✅ Interceptor owns toasts; screens map field errors only §2.3 |
| 5 | Lead status `keyinroq` | ✅ **Confirmed real** — it is in the backend enum |
| 6 | Student status `ACTIVE` uppercase | ✅ **Confirmed** — only this one is uppercase |
| 7 | Pending receipts shape | ✅ **Always** `{ data, meta }`; `meta.totalAmount` included |
| 8 | Sensitive fields in responses | ✅ Passport/JSHSHIR admin-only; password never returned |
| 9 | `errors[field]` array vs string | ✅ **It is a string** (422). Mappers accept both |
| 10 | Login failure is a 401 | ✅ Interceptor must not redirect from `/login`; screen opts out of the toast |
| 11 | `GET /rooms` meta lacks paging fields | ✅ Documented §4.1 — treat as unpaginated |
| 12 | Numeric columns arrive as strings | ✅ Documented §4.6 with the exact field list |
| 13 | `DELETE /students/{id}` assumed to exist | ✅ **It does not** — use a status change |
| 14 | `POST /users` needs `roleId`, not `role` | ✅ Documented §5.3 |
| 15 | `/teacher-earnings` in the old permission table | ⚠️ **Not in the current spec** — treat as removed |

---

## 9. Frontend rules that follow from this document

1. Interfaces are written from §5/§6 — never from a guess (`conventions.md` §5.2.1).
2. Every `*.api.ts` function returns `response.data`, typed on both ends.
3. Numeric-string fields are typed `string` and converted in one helper.
4. `payableNow` is what the student owes; `remainingAmount` is the till's gap.
5. Money screens must handle the pending-receipt flow (reception ≠ admin).
6. Permission keys — not roles — gate UI (`03-roles-permissions.md`).
7. `centerId` comes from the global scope; screens don't each own a center select.
8. Excel export is a blob download; its errors need blob→JSON normalization.

---

## 10. Verification log (2026-09-23)

| What | How |
|---|---|
| 143 operations, params, request bodies | `GET /api-json` parsed in full |
| Auth, roles, permissions catalog (18 groups / **67 keys**) | Live calls as the test admin |
| Centers, users, employees, teachers, subjects, rooms | Live calls |
| Students (list / detail / all / referrals / discount periods) | Live calls against a seeded student |
| Groups, lesson-dates, plan, schedule board, teacher today | Seeded subject+room+teacher+group, then live calls |
| Payments, calculate, preview-exclusion, pay-partial, receipts, check, student summary, pending receipts, receipts-stats | Live calls after activating a student (payment auto-generated, partial payment made) |
| Dashboard, telegram settings, staff overview, staff attendance today/report | Live calls |
| Error shapes (401 / 422 / 400 / 404) | Deliberate failing calls |
| Payroll rows, staff overview sub-arrays, pending-receipt rows, attendance rows, schedule conflicts | *(old-project verified)* — the test org has no data for these yet |

**Not yet verified live** (no data in the test org): `staff-salaries` row shape,
`pending-receipts` row shape, `staff/{id}/deductions`, `group-schedule/conflicts`
response, `syllabuses` + AI responses, `payments/export` success path,
`students/transfer[/preview]`. Each is documented from the old project's models;
verify before implementing (`api-integration` skill).

**Companion docs:** `02-migration-matrix.md` (what is still missing in the
rebuild) · `03-roles-permissions.md` (the full permission model).
