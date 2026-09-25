# Workflow — Tests & Code Review (MUST FOLLOW)

> Binding process rules for `cabinet_front_new`. They govern **when** tests are
> written and **who** reviews code. Read with `testing.md` (how to write tests)
> and `conventions.md` / `ui-and-forms.md` (what the code must comply with).

---

## 1. Tests are written DURING implementation, in parallel — not after

- When you implement a feature (a `Ui*` component, an `*.api.ts` module, a
  composable/store with logic), its tests are authored **in the same change**,
  **while** the code is being written — never deferred to "after the task is
  done."
- The intended mechanism: spawn the **`test-writer`** subagent **in parallel**
  with the implementation work (a background agent), pointed at the file(s)
  being built. It writes the specs while you write the code; you merge them into
  the same change.
  - Example: `Agent(subagent_type: "test-writer", run_in_background: true, prompt: "Cover src/modules/students/api/students.api.ts and StudentForm.vue")` launched as soon as the file's contract is stable, then continue implementing.
- A feature is **not done** until its tests exist and `npx vitest run` is green.
  Coverage of new component/API code is expected (`npm run test:coverage`).
- Tests must be real: assert behavior/emits/output, mock `@/shared/api/http` for
  API tests, never hit the network. See `testing.md`.

## 2. Code review runs at COMMIT TIME ONLY — by a different agent

- **When:** the independent `code-reviewer` runs **only when a commit is about to
  happen** — NOT after every prompt, task, or feature. Building a page, fixing a
  bug, or answering a request does not by itself trigger a review. During normal
  work, rely on `type-check` + `vitest` + driving the change in the browser.
- **At commit:** before the commit, run the review:
  - `Agent(subagent_type: "code-reviewer", prompt: "Review the working diff before commit")`.
- **No self-review.** The agent that wrote the code does **not** review its own
  work — the `code-reviewer` is a separate agent.
- The reviewer is **read-only** (no Edit/Write) — it reports findings; it does
  not fix or author code. The author agent applies the fixes, then may re-run
  the reviewer.
- The reviewer runs `npm run type-check`, `npx vitest run`, and `npx vite build`.
  A failing check is an automatic **BLOCKER**.
- **Do not commit** while the reviewer returns `REQUEST CHANGES` or any Blocker
  is open. Fix, re-review, then commit.
- Commits happen only when the user asks (per repo policy). The review gate
  applies whenever a commit is about to happen.

## 3. Adjunct skills

- `/code-review` (built-in) — quick diff review; fine for a fast pass, but the
  **independent `code-reviewer` agent above is the required pre-commit gate**.
- `/verify` (built-in) — exercise a change end-to-end when it has runtime
  surface; use before committing nontrivial UI/flow changes.

## 4. Once this becomes a git repo

This project is not a git repo yet. When it is initialized, add a **pre-commit
hook** (husky + lint-staged) that runs `npm run type-check` and `npx vitest run`
so the mechanical checks are enforced automatically. The independent
`code-reviewer` agent pass remains a required step on top of the hook (an LLM
review the hook can't perform).
