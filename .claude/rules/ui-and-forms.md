# UI, Theming & Forms — Rules (MUST FOLLOW)

> Binding rules for the design system, the `Ui*` component kit, and forms in
> `cabinet_front_new`. Read together with `conventions.md` (structure/naming/TS)
> and `testing.md` (tests). We use **Vue 3 + Tailwind v4** — **no Vuetify**.

---

## 1. Design tokens — never hard-code a color/radius/shadow

All colors, radii, and shadows are **semantic CSS variables** defined once in
`src/assets/main.css` (`:root` for light, `.dark` for dark) and exposed as
Tailwind utilities via `@theme inline`. Components use the **utility**, never a
raw hex.

- ✅ `class="bg-surface text-foreground border-border rounded-lg shadow-card"`
- ❌ `class="bg-white text-[#2e263d]"` or `style="background:#fff"`

**Available token utilities** (each works with `bg-`, `text-`, `border-`, `ring-`):

| Group | Tokens |
|---|---|
| Surfaces | `background`, `surface`, `surface-2` (popovers/modals), `surface-muted` |
| Text | `foreground`, `muted-foreground`, `fg-subtle` (placeholders/disabled) |
| Lines | `border`, `input`, `ring` |
| Brand / primary | `brand`, `primary`, `primary-hover`, `primary-active`, `primary-foreground`, `primary-soft`, `on-primary-soft` |
| Neutral accent | `secondary`, `secondary-foreground`, `accent`, `accent-foreground` |
| Status | `success`, `warning`, `danger`, `info` (+ `-foreground`, `-soft` each) |
| Radius (shape lock) | `rounded-sm` (6, chips) · `rounded-md` (8, **controls**) · `rounded-lg` (12, cards) · `rounded-xl` (16, modals) |
| Elevation | `shadow-card`, `shadow-card-hover`, `shadow-popover` (subtle, ink-tinted) |

- **`brand` vs `primary` (important):** `brand` is raw TalimPlus teal
  (`#01C0C8`) — it **fails WCAG AA** as text/fill on white, so use it ONLY as a
  decorative accent (logo, active-nav indicator bar, chart lines), never for
  text or button fills. All interactive fills/links/focus rings use `primary`
  (deepened teal `#0E7C82` light / `#22D3D9` dark), which passes AA. There is
  **one accent** on a page — do not introduce a second hue.
- Status chips use the soft pair: `bg-success-soft text-success`, etc.
- Need a new token? Add it to **both** `:root` and `.dark` and map it in
  `@theme inline`. Do not introduce a one-off color in a component.

### 1.1 Typography

- **UI font:** `Plus Jakarta Sans` (variable) — the `--font-sans` default; do
  not reintroduce Inter. **Numbers font:** `JetBrains Mono` (`--font-mono`).
- Render money, IDs, counts, dates with `class="font-mono"` — it applies
  `tabular-nums` so figures align in columns.
- Both are self-hosted via `@fontsource-variable/*` (imported in `main.ts`);
  never add a Google Fonts `<link>`.
- Base body is **14px**; controls are **36px** high (`h-9`). Weight carries
  hierarchy (700 titles, 600 labels/buttons, 400 body).

## 2. Dark / light theme is mandatory

- Every screen and component **must work in both themes**. Because components
  use semantic tokens, this is automatic — but verify contrast when adding
  anything custom.
- Theme is controlled by `useTheme()` (`src/shared/composables/use-theme.ts`):
  `mode` (`light|dark|system`), `isDark`, `setMode`, `toggle`, `initTheme`.
  `initTheme()` is called once in `main.ts`; `index.html` applies the stored
  theme pre-paint to avoid a flash. Toggle UI: `UiThemeToggle`.
- Third-party widgets are themed by mapping their CSS vars onto our tokens
  inside the wrapper's `<style>` (see `UiSelect`, `UiDatepicker`). Never ship a
  widget with its default light-only theme.

## 3. The `Ui*` component kit

Reusable primitives live in `src/shared/components/` as `Ui*` and are exported
from `src/shared/components/index.ts`. **Build screens from these — do not
re-create inputs/buttons/modals inline.**

Current kit: `UiButton`, `UiIconButton`, `UiInput`, `UiTextarea`, `UiSelect`,
`UiDatepicker`, `UiCheckbox`, `UiCollapse`, `UiModal`, `UiDropdown`
(+ `UiDropdownItem`), `UiBadge`, `UiIcon`, `UiTable`, `UiTabs`, `UiPagination`,
`UiStatCard`, `UiSpinner`, `UiThemeToggle`, `UiLocaleToggle`, `UiToaster`,
`UiMarkdown`, `UiForm`, `UiFieldShell`.

- A component a **second** module needs stops being that module's business and
  moves to the kit as `Ui*` — that is how `UiStatCard` arrived from
  `modules/dashboard` and `UiTabs` from `modules/groups`. A module never imports
  another module's `components/`.

- Missing a primitive (Tooltip, Drawer, Avatar…)? Add
  it to `shared/components` as `Ui*` — don't inline it in a feature.
- All the `.vue` rules from `conventions.md` still apply here: `<script setup
  lang="ts">`, **≤ 100 lines**, scoped styles, props via `defineProps<Props>()`.

### 3.1 Wrapping third-party packages (hard rule)

Hard UI (date pickers, autocompletes, charts, masks) may use a package, but the
**package is imported in exactly one `Ui*` wrapper** — never scattered across
features.

| Need | Package | The only import site |
|---|---|---|
| Select / autocomplete / tags | `@vueform/multiselect` | `UiSelect` |
| Date / range / month picker | `@vuepic/vue-datepicker` | `UiDatepicker` |
| Icons | `@lucide/vue` | `src/shared/icons.ts` (registry) |

- Features import `UiSelect` / `UiDatepicker`, **never** the package.
- Swapping a package later must touch only its wrapper.

### 3.1.1 Icons

- `src/shared/icons.ts` is the **single** place that imports `@lucide/vue`; it
  re-exports the named icons the app uses (tree-shaking preserved). Need a new
  icon? Add it to that re-export — do **not** import from `@lucide/vue` elsewhere.
- Render icons through **`UiIcon`** for consistent size/stroke, passing an icon
  from the registry: `<UiIcon :icon="Search" />` (import `Search` from
  `@/shared/icons`). Swapping icon libraries later means editing only `icons.ts`.

### 3.2 Variant / size props

UI-only literal unions (`variant`, `size`) are declared **inline** in the
component's `Props` interface — they are not backend values, so §4.2 of
`conventions.md` (enum for fixed sets) does **not** apply. Example:
`variant?: 'primary' | 'secondary' | 'outline'`.

A control's **value union** (e.g. `string | number | Date[] | null`) is the one
case where a **local `type` alias inside the `.vue`** is permitted (per the
`conventions.md` §4.1 carve-out), because it is reused across the `Props`
generic, the `emit`, and `useFormControl<…>`. Example: `type DateModel = Date |
Date[] | null`. This carve-out is limited to `shared/components/`; never alias
domain shapes.

## 4. Forms & validation — vee-validate + zod

- Validation uses **vee-validate 4**; schemas use **zod** via
  `toTypedSchema(...)`. No manual/ad-hoc validation in components.
- Wrap forms in **`UiForm`** (it calls `useForm` internally). Pass
  `:validation-schema="toTypedSchema(zodSchema)"` and handle `@submit`.
- Form controls are **self-wiring**: give any control a `name` prop and it
  registers itself with the surrounding `UiForm` via the shared
  `useFormControl` composable — **no `<Field>` wrapper, no repeated boilerplate.**
  Without a `name`, the same control is a plain `v-model` input.

```vue
<UiForm :validation-schema="schema" @submit="save">
  <UiInput name="email" label="Email" required />
  <UiSelect name="centerId" :options="centers" label="Center" />
  <UiButton type="submit">Save</UiButton>
</UiForm>
```

### 4.1 Backend errors

- The http interceptor owns **global** error toasts (see `conventions.md` §5).
  Screens only map **field-level** errors.
- On a failed submit, call the form's exposed `setBackendErrors(error)` — it maps
  `{ errors: { field: ['msg'] } }` onto the matching fields (helper:
  `shared/utils/backend-errors.ts`). `UiForm` also exposes `submit`, `validate`,
  `setErrors`, `setFieldError`, `resetForm`, `values`, `errors`.

```ts
try {
  await createStudent(values)
} catch (e) {
  formRef.value.setBackendErrors(e) // field errors → inputs; toast handled by interceptor
}
```

## 4.2 Mobile-first & responsive (MUST FOLLOW)

The CRM is heavily used on phones — **every screen must be excellent on mobile**,
not just "not broken."

- **Design mobile-first:** base styles target small screens; layer desktop with
  `sm: md: lg:` breakpoints. Never ship a layout that only works at desktop width.
- **Touch targets ≥ 44px** on interactive elements on mobile (`h-11` for primary
  actions/rows). Adequate spacing between tappable items.
- **No horizontal overflow.** Use `min-w-0`, `truncate`, wrapping, and CSS Grid
  (`grid-cols-1 md:grid-cols-…`) instead of fixed widths / flex percentage math.
- **Tables → cards on mobile.** Data tables must switch to a stacked card/list
  layout under `md`, or scroll inside their own container — never force the page
  to scroll sideways.
- **Navigation:** the sidebar is a fixed rail on `lg+` and an off-canvas drawer
  (hamburger in the header) below `lg`. The drawer closes on route change and on
  backdrop tap.
- **Full height:** use `min-h-[100dvh]` (not `h-screen`) so iOS Safari's address
  bar doesn't cause jumps.
- **Modals/drawers** are full-width with comfortable padding on mobile; inputs
  are ≥16px font where iOS zoom matters, or use the shared controls (already sized).
- **Verify at 375px width** (small phone) before considering a screen done — no
  clipped text, no overflow, all actions reachable.

### 4.2.1 Tables and row actions (MUST)

- **`UiTable` renders twice:** the real table from `md` up and a **card per row**
  below it. Nothing extra is needed — build a table and mobile works.
  - `TableColumn.primary` promotes a column to the card's heading (the first
    column otherwise); `TableColumn.hideOnMobile` drops noise such as IDs.
  - The `cell-<key>` and `actions` slots are shared by both renderings, so a
    spec that counts elements must scope to `tbody` (or `article`).
  - Tinting a row (overdue, blocked, selected) goes through the `rowClass`
    prop — `(row) => string | undefined`. It is applied to the `<tr>` **and**
    the card, so the two renderings can never drift apart.
- **Row actions use `UiIconButton`**, never a hand-rolled `<button class="p-1.5">`:
  it is 44×44 on phones and 32×32 from `md` up, and takes an accessible `label`.
  `UiButton` does the same (`h-11 md:h-8` for `sm`, `h-11 md:h-9` for `md`), so a
  text action in a row is a touch target on a phone without any extra classes.
- **A matrix that cannot become cards** (attendance, schedule) stays a table but
  scrolls **inside its own container** with a `sticky left-0` first column. The
  page itself must never scroll sideways.
- **`UiDropdown` flips itself** back inside the viewport when a left-aligned
  panel would overflow — don't work around it with per-call alignment.
- **Form controls are 16px on phones** (`text-base md:text-sm`) so iOS Safari
  does not zoom the page on focus. Use the shared controls and this is automatic.

## 4.3 i18n — no hard-coded text (MUST FOLLOW)

The cabinet ships in **Uzbek and Russian**. Every user-visible string goes
through vue-i18n; a literal in a template is a defect.

- **In `.vue` files:** `const { t } = useI18n()` and render `{{ t('ns.key') }}`
  / `:label="t('ns.key')"`. Never a literal in `label`, `placeholder`, `title`,
  `aria-label`, `empty-text`, `hint` or a text node.
- **In `.ts` files** (composables, stores, config, validation schemas):
  `import { t } from '@/locales'`. `useI18n()` throws outside a component
  `setup`, so plain modules must use the global `t`.
- **Messages live in `src/locales/{uz,ru}/<namespace>.ts`** — 23 namespaces, one
  per domain, plus `common` for cross-cutting text (actions, weekdays, months,
  currency). **A key added to `uz` must be added to `ru` in the same change**;
  `src/locales/__tests__/parity.spec.ts` fails the build otherwise.
- **Fixed backend value sets** (statuses, roles, weekdays, difficulty) keep their
  enum, and a sibling `*_LABEL_KEYS: Record<Enum, string>` map holds the i18n
  keys. Components render `t(LABEL_KEYS[value])` — never a label map of literals.
- **Table columns and nav items carry keys, not text.** Config objects store the
  key (`labelKey`, or `label` holding a key) and the view translates them inside
  a `computed`, so switching language relabels without a reload.
- **Validation messages** (zod/vee-validate) are built inside a `computed` so
  they re-resolve when the language changes.
- **Route titles** use `meta.titleKey`; the header translates it.
- Specs assert with `t('ns.key')`, not the literal Uzbek string.
- **Exception:** `src/modules/playground/` (the `/ui-kit` demo page) is internal
  developer scaffolding and is exempt.

Language is switched with `UiLocaleToggle` in the header; the choice persists in
`localStorage` under `locale` and sets `<html lang>`.

## 5. Notifications

- Global toasts go through the Pinia store `stores/notification.store.ts`
  (`success/error/warning/info`, de-dupes consecutive identical messages).
  Render `<UiToaster />` once near the app root.
- Do not build ad-hoc alert UI; push to the store instead.
