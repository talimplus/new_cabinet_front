# Project Rules & Conventions (MUST FOLLOW)

> These are **binding rules** for `cabinet_front_new`. Every new file must comply.
> Companion binding rules: `ui-and-forms.md` (design tokens, theming, `Ui*` kit, vee-validate), `testing.md` (component + API tests), and `workflow.md` (write tests in parallel while implementing; independent `code-reviewer` agent before every commit).
> Background docs (not rules): `docs/01-api-integration.md` (how the backend works), `docs/03-roles-permissions.md` (roles).

---

## 1. Folder structure — feature-based (modular)

Each business resource is a **self-contained module** under `src/modules/`. Everything a feature needs (API calls, interfaces, enums, components, composables, views) lives together. Cross-cutting code lives in `src/shared/`.

```
src/
  modules/
    students/
      api/
        students.api.ts          # axios calls for this resource
      interfaces/
        student.interface.ts      # backend response + entity shapes
        student-form.interface.ts # create/update payloads
        student-params.interface.ts
      enums/
        student-status.enum.ts
      components/
        StudentsTable.vue         # small, focused components
        StudentFilters.vue
        StudentForm.vue
      composables/
        use-students.ts           # list/fetch/state logic for views
      views/
        StudentsView.vue          # route-level page (thin)
    groups/
    leads/
    payments/
    ...                           # one module per resource
  shared/
    api/
      http.ts                     # single axios instance + interceptors
    components/                   # reusable UI: BaseButton, BaseModal, BaseTable...
    composables/                  # useCenterScope, useDebounce, usePermissions...
    interfaces/                   # cross-module shapes (PaginatedResponse, etc.)
    enums/                        # cross-module enums (UserRole...)
    utils/                        # formatters (money, date, phone)
  router/
    index.ts
    guards.ts                     # auth + role guards
  stores/                         # pinia stores (user, notification)
  locales/                        # i18n messages
  assets/
  App.vue
  main.ts
```

**Rules:**
- A module **never** imports another module's `components/` or `composables/` internals. If two modules need the same thing, it goes to `shared/`.
- Modules **may** import another module's `interfaces/`, `enums/` and `api/`
  (e.g. `payments` calls `fetchAllGroups`) — these are contracts, not implementation.
- `shared/` never imports from `modules/`. So promoting a component to `shared/`
  drags its types along: the receipt slip moving to `shared/components/receipt/`
  is why `PaymentMethod` / `ReceiptStatus` and `PaymentCheck` now live in
  `shared/enums/` and `shared/interfaces/`.
- Cross-cutting code that is **not** a `Ui*` primitive gets its own folder under
  `shared/`, alongside `shared/permissions/` — e.g. `shared/components/receipt/`
  (check slip + check modal) and `shared/components/layout/`.
- Route-level pages live in each module's `views/` and are registered in `src/router/`.

---

## 2. File naming

| Kind | Convention | Example |
|---|---|---|
| Component (`.vue`) | **PascalCase** | `StudentsTable.vue`, `StudentForm.vue` |
| View (`.vue`, route page) | PascalCase, `*View` suffix | `StudentsView.vue` |
| API file | kebab, `*.api.ts` | `students.api.ts` |
| Composable | kebab, `use-*.ts` | `use-students.ts` |
| Interface file | kebab, `*.interface.ts` | `student.interface.ts` |
| Enum file | kebab, `*.enum.ts` | `student-status.enum.ts` |
| Store | kebab, `*.store.ts` | `user.store.ts` |
| Util | kebab | `format-money.ts` |

- Folders: always **kebab-case** and **plural for collections** (`modules/`, `components/`, `interfaces/`), singular for a single concept.
- One primary export per file; the file name matches the export (`StudentsTable.vue` → `StudentsTable`).

---

## 3. Component rules

### 3.1 Max 100 lines per `.vue` file
- **Hard limit: a `.vue` file must not exceed 100 lines total** (template + script + style combined).
- If it grows past 100, split it:
  - Move logic (data fetching, computed, handlers) into a **composable** (`use-*.ts`) — composables have no line limit.
  - Extract repeated markup into smaller child components.
  - Move heavy styles to a shared stylesheet or scoped module.
- **Views must stay thin**: a `*View.vue` mostly wires a composable to a few components. Business logic does **not** live in views.

### 3.2 Authoring style
- Always `<script setup lang="ts">`.
- Order inside a component: `<template>`, then `<script setup>`, then `<style scoped>`.
- Props/emits are declared with `defineProps<Interface>()` / `defineEmits<...>()` using an **interface** (see §4).
- No business/API logic directly in components — call a composable or an `*.api.ts` function.
- Keep `<style>` scoped. Shared styling goes to `shared/` or global CSS.

### 3.3 Decomposition guide
A typical list page splits into: `XxxView.vue` (page shell) → `XxxFilters.vue` + `XxxTable.vue` + `XxxForm.vue` (modal), with `use-xxx.ts` holding state and calls. Each stays under 100 lines.

---

## 4. TypeScript rules

### 4.1 Use `interface` — never the `type` keyword
- **Do not use the `type` keyword** for declaring shapes. Use `interface`.
- ✅ `export interface Student { id: number; firstName: string }`
- ❌ `export type Student = { ... }`
- Union of literals must **not** be modeled as a `type` alias — use an **enum** instead (§4.2).
- `import type { Student }` for type-only imports is still fine and required (that's `import type`, not a `type` declaration).
- **Carve-out (UI-only):** component **variant/size** literal unions and a control's **value union** (e.g. `string | number | Date[] | null`) may be declared inline in the component's `Props` (or as a local alias inside the `.vue`). These are not backend/domain value sets, so the enum rule does not apply. This carve-out is limited to `shared/components/`; domain models still follow §4.1–§4.2 strictly.

### 4.2 Fixed value sets → `enum`
Anything with a fixed, backend-defined set of values (statuses, roles, weekdays, payment states, difficulty, etc.) is an **enum**, not a string union.

```ts
// student-status.enum.ts
export enum StudentStatus {
  NEW = 'new',
  ACTIVE = 'ACTIVE',   // ⚠️ uppercase on purpose — must match backend exactly
  IGNORED = 'ignored',
  STOPPED = 'stopped',
  FINISHED = 'finished',
}
```
- Enum **values must match the backend strings exactly** (see `docs/01-api-integration.md` §6 for the exact casing quirks).
- Use the enum everywhere that value appears (interfaces, params, comparisons) — never a raw string literal.

### 4.3 An interface for BOTH request payloads and responses
- **Every GET response has an interface** for the data the backend returns.
- **Every POST/PUT/PATCH request has an interface for its payload (body)** — describe exactly what is sent. No inline object literals typed with `any`, no untyped bodies.
  - Create/update bodies use the `*Form` suffix (e.g. `StudentForm`).
  - Small, one-off bodies still get a named interface or a precise inline interface at the function signature — never `any`.
- No `any`, no anonymous shapes at call sites, on either the request or the response side.
- Name responses clearly: entity = `Student`; list wrapper = `PaginatedResponse<Student>`; single-purpose responses = `DashboardResponse`, `LessonDatesResponse`, etc.
- Reuse one shared paginated wrapper:

```ts
// shared/interfaces/paginated.interface.ts
export interface PaginationMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
}
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
```

### 4.4 Naming for interfaces
| Purpose | Suffix | Example |
|---|---|---|
| Entity (server object) | none | `Student` |
| Create/update payload (request body) | `*Form` | `StudentForm` |
| Query params | `*Params` | `StudentsParams` |
| Non-paginated response | `*Response` | `DashboardResponse` |

- `enum` is the only construct allowed to model fixed value sets; do not also create a `type` alias mirroring it.

---

## 5. API request rules

### 5.1 One axios instance
- All requests go through a single axios instance in `shared/api/http.ts`.
- It carries the interceptor behavior documented in `docs/01-api-integration.md` §2: attach `Bearer` token, redirect on 401, show global error notification otherwise.

### 5.2 Every request lives in a module `*.api.ts`
- Components/composables **never** call axios directly — they call functions from `*.api.ts`.
- Each function is **typed on both ends**: request payload/params interface in, response interface out.
- **API functions return the parsed body** (`response.data`), not the raw axios response.

```ts
// modules/students/api/students.api.ts
import { http } from '@/shared/api/http'
import type { Student } from '../interfaces/student.interface'
import type { StudentForm } from '../interfaces/student-form.interface'
import type { StudentsParams } from '../interfaces/student-params.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'
import { StudentStatus } from '../enums/student-status.enum'

export async function fetchStudents(params?: StudentsParams): Promise<PaginatedResponse<Student>> {
  const { data } = await http.get<PaginatedResponse<Student>>('/students', { params })
  return data
}

// POST body is typed via StudentForm — payload interface is mandatory
export async function createStudent(form: StudentForm): Promise<Student> {
  const { data } = await http.post<Student>('/students', form)
  return data
}

export async function changeStudentStatus(
  id: number,
  status: StudentStatus,
  body?: { returnLikelihood?: string; comment?: string },
): Promise<void> {
  await http.put(`/students/change-status/${id}`, body ?? {}, { params: { status } })
}
```

### 5.2.1 Verify the real contract BEFORE writing an integration (MUST)
- **Never guess an endpoint's params or response shape.** Before writing a new
  `*.api.ts` function or its interfaces, run the **`api-integration` skill**
  (`.claude/skills/api-integration/`): read the endpoint's query params / request
  body from the OpenAPI spec (`${VITE_API_URL}/api-json`), and confirm the real
  **response shape** from a live call (a test admin account exists) or from the
  old app.
- The old project **`/Users/nematoff/Developer/Active/Lazizbek/cabinet_front`**
  (read access enabled) is the reference for the response contract AND for how a
  page should look/behave — check it before building a page.
- Write interfaces from the **real** field names/casing; then write the function.
  A guessed field name is a defect (it silently renders empty/`undefined`).

### 5.3 Rules recap
- **Verify the contract first (§5.2.1)** — OpenAPI params + real response, not guesses.
- **GET** → typed response interface (§4.3).
- **POST / PUT / PATCH** → typed request-body interface (`*Form` or a named interface) **and** a typed response when the server returns data.
- Fixed values in params/bodies use the **enum** type, not raw strings.
- Strip UI-only sentinels (e.g. `status: 'all'`) before sending; let axios drop `undefined` params.
- Never handle generic error toasts in the API layer or components — the interceptor owns that. Screens only map field-level validation errors onto forms.

### 5.4 Authorization is permission-key based (MUST)

Never gate anything on a role. An admin can create a role at runtime and tick
keys, so role checks go stale the moment they do (`docs/03-roles-permissions.md`).

- `Permission` (`shared/enums/permission.enum.ts`) holds all 67 backend keys.
- Check with `usePermissions()` flags, or `userStore.can(Permission.X, Permission.Y)`
  (several keys = **OR**; `*` satisfies everything; no user = denied).
- **New route** → give it `meta.permission` (§5 of the doc). The guard redirects
  a user who lacks it to `resolveHome()`, never to a 403 screen.
- **New menu item** → give it `permission` in `shared/config/navigation.ts`.
- **New endpoint** → add its rule to `shared/permissions/api-permissions.ts`,
  otherwise the request interceptor treats the path as open. Open endpoints stay
  in the table with `permissions: []` so a `:param` rule cannot swallow them.
- **Buttons, columns, tabs** that trigger a restricted call are hidden with the
  matching flag. The request pre-check only silences the noise — it is not the UI.
- Reference data behind a filter/select wraps in `optionalRequest(...)`, so a
  user without that read key gets an empty select instead of a crash.
- The few genuine base-role rules (teacher owns their group, owner never fines
  themself) use `isTeacher` / `isOwner` / `isManagerLevel` / `hideForBaseRoles` —
  never as a substitute for a key check.

### 5.5 The center scope is global (MUST)

The active center is picked **once** in the header (`AppCenterSwitcher`) and
applies to the whole app (`docs/02-migration-matrix.md` §4.3).

- **Never** add a center `UiSelect` to a page or a form. Pages do not filter by
  center and create forms do not ask for one.
- **Read requests:** pass no `centerId`. The http interceptor appends it, but
  only on endpoints whose rule in `api-permissions.ts` carries
  `acceptsCenterId: true` — the backend rejects the param anywhere else (422).
  A call that passes its own `centerId` (a form loading options for a specific
  center) is left untouched.
- **Create payloads:** send `scope.centerIdForCreate`.
- **"All centers"** (`activeCenterId === null`) sends no `centerId` at all, and
  so does any user who cannot switch — the backend pins them to their own center.
- Pages need no watcher: `<RouterView>` is keyed on the active center, so
  switching remounts the page and every `onMounted` load runs again.
- A new endpoint that accepts `centerId` must get `acceptsCenterId: true` in the
  api-permissions table, otherwise it silently stays unscoped.

---

## 6. Composables & state

- View/page logic (fetching lists, pagination, filters, loading flags) lives in a `use-*.ts` composable, keeping views under 100 lines.
- Cross-cutting logic goes to `shared/composables/`: `useCenterScope` (the load-centers → pick default → gate fetch pattern), `useDebounce`, `usePermissions`.
- Global app state (current user, notifications) stays in Pinia stores under `src/stores/`.

---

## 7. Quick checklist for every new feature

1. Create `src/modules/<feature>/` with `api/ interfaces/ enums/ components/ composables/ views/`.
2. Write interfaces for each GET response **and** each POST/PUT payload; enums for fixed values (match backend casing).
3. Add `<feature>.api.ts` functions returning `response.data`, typed on both request and response.
4. Put list/state logic in `use-<feature>.ts`.
5. Build small components (< 100 lines each); keep the `*View.vue` thin.
6. Register the route + role guard.
