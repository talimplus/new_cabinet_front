# Testing — Rules (MUST FOLLOW)

> Binding rules for tests in `cabinet_front_new`. Stack: **Vitest** +
> **@vue/test-utils** (jsdom). Read with `conventions.md`, `ui-and-forms.md`,
> and `workflow.md`.
>
> **When:** tests are written *during* implementation, in parallel — spawn the
> **`test-writer`** subagent alongside the feature work (see `workflow.md` §1),
> so specs land in the same change. Not after the task is "done."

---

## 1. What must have tests

- **Every `Ui*` component** — render, props, `v-model`/emits, disabled/error states.
- **Every `*.api.ts` module** — each function, with `http` mocked (never hit the network).
- **Composables & utils** with real logic (`useFormControl`, `use-theme`, `backend-errors`, formatters).
- **Pinia stores** (`*.store.ts`).
- Feature views: at least a smoke mount + the critical interaction (submit, filter, pagination).

## 2. Location & naming

- Co-locate tests in a `__tests__/` folder next to the code under test.
- File name: `<Name>.spec.ts` (e.g. `UiButton.spec.ts`, `auth.api.spec.ts`).
- Global setup lives in `src/__tests__/setup.ts` (wired via `vitest.config.ts`
  `setupFiles`) — e.g. the jsdom `matchMedia` stub the theme needs.
- Run: `npm run test:unit` (watch) or `npx vitest run` (CI).

## 3. Component tests

- Mount with `@vue/test-utils`; assert on **behavior and rendered output**, not
  internal state. Query by role/text/DOM, drive with `setValue`/`trigger`, and
  assert `emitted()`.
- Assert token-driven classes by substring (e.g. `.toContain('bg-danger')`),
  not full class strings.
- Components that internally use vee-validate (`name` prop) must be tested
  **inside a `UiForm`** so the field context exists (see `UiForm.spec.ts`).

```ts
const wrapper = mount(UiInput, { props: { type: 'number' } })
await wrapper.get('input').setValue('42')
expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([42])
```

### 3.1 Form submission in jsdom

jsdom does **not** reliably dispatch native `<form>` submit to vee-validate.
Drive submission through the form's exposed **`submit()`** method (and assert
via the exposed `validate()` / rendered errors), not `trigger('submit')`.
`UiForm` exposes `submit`, `validate`, `setBackendErrors`, etc. for this reason.

## 4. API tests (mock the axios instance)

- Mock the shared instance and assert the **URL, method, payload/params**, and
  that the function returns `response.data` (the parsed body).
- Never mock global `axios` or the network — mock `@/shared/api/http`.

```ts
vi.mock('@/shared/api/http', () => ({ http: { get: vi.fn(), post: vi.fn() } }))
const mockedHttp = vi.mocked(http, true)

it('posts credentials and returns the body', async () => {
  mockedHttp.post.mockResolvedValueOnce({ data: expected })
  const result = await login({ email, password })
  expect(mockedHttp.post).toHaveBeenCalledWith('/auth/login', { email, password })
  expect(result).toEqual(expected)
})
```

- Use **enum values** (`UserRole.ADMIN`), never raw strings, in fixtures.
- Test param stripping (UI sentinels like `status: 'all'`) and status-change
  endpoint shapes where relevant (`conventions.md` §5).

## 5. Stores & composables

- Stores: `setActivePinia(createPinia())` in `beforeEach`; use
  `vi.useFakeTimers()` for timeout/auto-dismiss behavior.
- Keep tests deterministic — no real timers, no real dates, no network.

## 6. Definition of done

A change is not done until: `npx vitest run` is green, `npm run type-check`
passes, and new components/api functions ship **with** their tests in the same
change.
