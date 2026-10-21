# Study OS — Agent Instructions

These instructions apply to every agent and every task performed in this repository.

## Mandatory design-system rule

**Before changing or creating any UI, read `DESIGN.md` in full.** It is the source of truth for visual design, themes, layout, components, and interaction states. Keep every page consistent with it. Do not create a new style direction for an individual feature.

## Task workflow

1. **Inspect before editing.** Review the relevant files, existing components, package scripts, and project structure. Do not replace working architecture without a clear reason.
2. **Plan briefly.** Identify the smallest coherent set of changes and which existing components/tokens can be reused.
3. **Reuse first.** Extend existing components and design tokens before creating new ones. Avoid duplicated styles, one-off colors, arbitrary spacing, and repeated component implementations.
4. **Implement completely.** Do not stop at a mockup when the task asks for a working feature. Connect controls to real behavior or clearly mark anything intentionally out of scope.
5. **Preserve scope.** Do not alter unrelated features, data models, dependencies, or visual patterns as part of a small task.
6. **Validate.** Run the available lint, type-check, tests, and production build scripts as applicable. Do not claim a command passed unless you actually ran it and saw a successful result.
7. **Visually verify UI changes.** If browser or screenshot tooling is available, inspect the changed page at desktop and mobile widths, check both light and dark themes, exercise the key interactions, and fix obvious visual regressions. If browser verification is unavailable, say so explicitly and perform the strongest available checks.
8. **Summarize.** State what changed, which checks ran and their outcomes, and any remaining limitations.

## Required UI review checklist

Before considering a UI task complete, verify:

- [ ] `DESIGN.md` was read and followed.
- [ ] Existing tokens and reusable components were used where possible.
- [ ] Light, dark, and system theme behavior remains coherent (if theme support exists).
- [ ] Typography, spacing, radii, borders, and status colors are consistent.
- [ ] No accidental gradients, neon effects, excessive shadows, or unnecessary nested cards were introduced.
- [ ] Loading, empty, error, disabled, and success states are handled where relevant.
- [ ] Keyboard navigation, visible focus, labels, and reduced-motion preferences are respected.
- [ ] Responsive behavior was checked, including a narrow mobile viewport.
- [ ] Core interactions work; there are no decorative controls pretending to be functional.
- [ ] No unrelated files or behavior were changed without justification.
- [ ] Relevant automated checks were run and accurately reported.

## Theme implementation rules

- Use semantic CSS variables/design tokens defined in one shared location.
- Components must not hardcode theme-specific colors when a semantic token exists.
- The explicit user theme preference should persist; System follows the operating system preference.
- Theme changes must not cause unreadable text, invisible borders, or low-contrast controls.
- Test dialogs, menus, charts, forms, and empty states in both themes—not only the main page.

## Component and styling rules

- Prefer existing components and shared variants over page-specific alternatives.
- Avoid adding a dependency for a minor visual effect or a component that can be implemented simply with the existing stack.
- Use consistent naming for tokens and components.
- Keep styles close to the project's established styling convention; do not introduce a second styling system without approval.
- Avoid arbitrary z-index values, excessive `!important`, brittle selectors, and layout hacks.
- Use semantic HTML and accessible labels. Icon-only buttons require an accessible name and a tooltip where useful.
- Animations must be subtle and respect `prefers-reduced-motion`.

## Scope and safety

- Do not begin unrelated feature work while completing a design or UI task.
- Do not remove or overwrite user data, configuration, or existing project files unless the requested task requires it.
- Do not expose secrets, environment variables, access tokens, or private data in logs or summaries.
- Ask before performing irreversible actions or publishing/deploying externally.
- If a requirement conflicts with `DESIGN.md`, explain the conflict and propose a consistent solution. Update `DESIGN.md` only when the design system itself is intentionally changing.

## Current project phase

The current phase is **design specification only**. Do not implement the Study OS website, scaffold the application, install dependencies, or generate application source code until the user explicitly asks to begin implementation. For now, maintain and refine the design documentation only.
