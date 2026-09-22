# AGENTS.md — Gratefully

## Project Context

Gratefully is a mobile-first Islamic gratitude journaling web app.

When implementing features, components, pages, or UI changes, preserve the existing architecture, visual language, conventions, and patterns of the project.

Prefer extending existing implementations over introducing new abstractions, dependencies, or design patterns.

---

## Mobile-Only UI

Gratefully currently targets **mobile resolution only**.

When creating or modifying UI:

- Design and style specifically for mobile screens.
- Do NOT create tablet or desktop layouts unless explicitly requested.
- Do NOT add unnecessary responsive breakpoints such as `md:`, `lg:`, `xl:`, etc.
- Do NOT spend time optimizing tablet or desktop layouts.
- Components should have dimensions, spacing, typography, and proportions appropriate for mobile devices.
- Avoid layouts that only look correct because they stretch to large viewport widths.
- Preserve the existing mobile content width and layout conventions used by nearby components/pages.
- Test the visual hierarchy mentally against common mobile widths, especially approximately `320px–430px`.
- Prevent accidental horizontal overflow.

If an existing component already contains responsive behavior, do not refactor or remove it unless required by the task.

The goal is not "responsive across every device."

The goal is:

> **A polished, intentional mobile experience.**

---

## UI & Design Consistency

Never invent an unrelated visual style for a new feature.

Before styling a new component or page, inspect the closest existing UI implementations and reuse their design language.

Follow existing conventions for:

- colors
- typography
- font sizes
- font weights
- spacing
- padding
- margins
- border radius
- shadows
- borders
- cards
- buttons
- inputs
- dialogs/modals
- icons
- loading states
- empty states
- transitions and animations

Prefer existing design tokens, Tailwind utilities, shared components, and established patterns over introducing arbitrary values.

When there are multiple possible designs, choose the one that feels most native to the existing Gratefully interface.

The UI should feel like it was always part of the application rather than a newly attached feature.

Avoid:

- unnecessary gradients
- excessive shadows
- overly decorative UI
- generic SaaS/dashboard styling
- inconsistent colors
- random border-radius values
- unnecessary animations
- visual complexity that conflicts with Gratefully's calm interface

Keep the experience peaceful, minimal, warm, polished, and suitable for a gratitude journaling application.

---

## Translation / i18n

Gratefully supports multiple languages.

Whenever introducing **new user-facing wording**, always implement its translation as part of the same change.

Do NOT hardcode new user-facing text directly inside components when the project translation system should be used.

For every new string:

1. Add the translation key using the project's existing naming convention.
2. Add the Indonesian translation.
3. Add the English translation.
4. Use the project's existing translation utility/hook in the component.

This applies to wording such as:

- titles
- descriptions
- buttons
- labels
- placeholders
- validation messages
- error messages
- confirmation dialogs
- empty states
- loading messages
- toast messages
- accessibility labels when applicable

Before creating a new translation key, check whether an appropriate existing key already exists.

Do not duplicate translations unnecessarily.

---

## Implementation Principles

Before implementing a feature:

1. Inspect the relevant existing files.
2. Find the closest existing component or pattern.
3. Reuse existing utilities/components where appropriate.
4. Make the smallest clean change required to satisfy the task.
5. Avoid unrelated refactors.

Do not introduce a new library when the existing stack can reasonably solve the problem.

Do not create abstractions for code that is only used once unless the abstraction clearly improves maintainability.

Do not restructure unrelated parts of the application while implementing a small feature.

Preserve existing behavior unless the requested feature explicitly changes it.

---

## Component Guidelines

When creating a component:

- Keep it focused on one clear responsibility.
- Follow the project's existing folder and naming conventions.
- Reuse shared UI components where available.
- Reuse existing TypeScript types when possible.
- Avoid duplicated business logic.
- Keep props minimal and explicit.
- Avoid premature generalization.
- Do not create desktop-specific variants.
- Do not create unnecessary wrapper components.

If a component is only relevant to one feature and unlikely to be reused, keep it close to that feature instead of prematurely placing it in a global shared-components directory.

---

## Styling Guidelines

Follow the styling approach already used by the project.

Prefer existing Tailwind utilities and project design tokens.

Before adding arbitrary values such as:

`w-[...]`, `h-[...]`, `text-[...]`, `rounded-[...]`, or custom colors,

check whether an existing project value provides the intended result.

Arbitrary values are acceptable when necessary for precise mobile UI, but they should be intentional rather than used by default.

Prioritize:

- clear visual hierarchy
- comfortable touch targets
- readable mobile typography
- consistent spacing
- compact but breathable layouts
- safe text wrapping
- predictable scrolling behavior

Avoid adding responsive classes merely for completeness.

---

## AI Token Efficiency

Use project context efficiently.

Do NOT explore the entire repository for a localized task.

Start with the files directly related to the request and expand only when necessary.

Prefer targeted searches over reading large directories or unrelated files.

When implementing a task:

1. Read the target file.
2. Inspect its direct dependencies when needed.
3. Inspect one or two similar existing implementations when design/pattern context is required.
4. Implement the change.
5. Run only the relevant checks.

Avoid repeatedly reading the same files unless they have changed.

Do not produce long explanations of straightforward code changes.

Do not generate large planning documents for small tasks.

Do not spend tokens proposing multiple implementations when one clearly matches existing project conventions.

Do not inspect unrelated architecture "just in case."

Prefer:

> **inspect → understand existing pattern → implement → verify**

instead of:

> **inspect entire project → speculate → redesign → implement**

---

## Scope Discipline

Stay within the requested task.

Do not:

- refactor unrelated code
- rename unrelated files
- reorganize directories unnecessarily
- change established UI patterns without reason
- add speculative features
- add desktop/tablet support
- add dependencies without necessity
- modify translations unrelated to the new wording
- rewrite working code purely for stylistic preference

If something outside the task is imperfect but does not block the requested implementation, leave it unchanged.

---

## Definition of Done

A UI feature or component is complete when:

- the requested functionality works
- it fits the existing Gratefully architecture
- it visually matches the existing Gratefully UI/theme
- it is properly sized and polished for mobile resolution
- it does not introduce unnecessary tablet/desktop responsive styling
- new user-facing wording has Indonesian and English translations
- existing translations are reused where possible
- there is no accidental horizontal overflow
- existing functionality remains intact
- TypeScript/lint/build issues introduced by the change are resolved
- no unnecessary dependency or abstraction was introduced

When uncertain, favor consistency with the existing codebase over inventing a new pattern.
