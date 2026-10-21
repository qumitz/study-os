# Study OS — Design System

**Status:** Approved foundation for the project  
**Product:** Study OS — personal college study planner and progress tracker  
**Visual direction:** Premium minimalism, inspired by the clarity and restraint of Apple interfaces and the information hierarchy of Linear. These are directional references, not templates to copy.

## 1. Product design principles

1. **Clarity before decoration.** Every element should help the student understand progress or take the next action.
2. **Quiet confidence.** Use neutral surfaces, restrained contrast, deliberate typography, and generous spacing. Avoid visual noise.
3. **Consistent by default.** Reuse the established tokens and components. Do not invent one-off styles for individual pages.
4. **Progress should be legible.** Completion, in-progress work, upcoming deadlines, and errors must be distinguishable without relying on color alone.
5. **Responsive, not merely shrunk.** The navigation and study workspace should adapt intentionally to smaller screens.
6. **Accessible interaction.** Keyboard use, visible focus, readable contrast, and clear labels are requirements, not polish tasks.

## 2. Brand and tone

- Product name: **Study OS**.
- Tone: calm, capable, focused, encouraging; never childish or overly gamified.
- Visual personality: premium, understated, precise, editorial.
- Use sentence case for interface labels. Prefer concise verbs: “Add subject”, “Mark complete”, “Review mistakes”.
- Avoid excessive emojis, novelty illustrations, glassmorphism, neon effects, loud gradients, and decorative animation.

## 3. Layout model

### Desktop shell

- Persistent left sidebar for primary navigation.
- Main content area to the right, with a clear page title and one primary action per view where practical.
- Optional secondary details panel only when it materially helps the task; do not crowd the workspace.
- Recommended sidebar width: 232–256 px expanded; compact mode may be added later if it remains accessible.
- Main content max width: approximately 1440 px for overview pages. Data-dense study boards may use the available width.
- Use a consistent page gutter: 32 px on wide screens, 24 px on medium screens, 16 px on small screens.

### Primary navigation

Keep navigation concise. Initial destinations may include:
- Overview
- Subjects
- Assignments / deadlines
- Tests / review
- Statistics
- Settings

Only expose routes that actually exist. Do not add nonfunctional navigation items.

### Study workspace

- Subjects are organized inside the main workspace, not crammed into the sidebar.
- On the Subjects view, support a readable subject list or board with clear subject headings and progress.
- Each subject can contain topics, labs, assignments, and tests.
- At wide widths, columns are acceptable where useful; on narrow screens, switch to a single-column layout or a deliberate horizontally scrollable board with visible affordances.
- Do not force every item into a card. Use rows, grouped lists, and subtle separators when they communicate hierarchy better.

### Responsive behavior

- Wide desktop: full sidebar and multi-column workspace where appropriate.
- Tablet: narrower sidebar or collapsible navigation; preserve readable content widths.
- Mobile: compact top bar or drawer navigation, one-column content, touch-friendly controls, no clipped essential content.
- At 320 px viewport width, core flows must remain usable without horizontal page overflow.

## 4. Theme system

Provide **Light**, **Dark**, and **System** theme preferences. The theme toggle must be accessible from a predictable location, preferably Settings and/or the user menu. Persist the explicit user preference. System mode follows the operating system preference.

Use semantic tokens, not raw colors scattered throughout components. The following values are starting points and may be tuned during implementation only if the complete system stays consistent.

### Light theme tokens

| Token | Value | Intended use |
|---|---|---|
| `--color-bg` | `#F7F7F5` | App background |
| `--color-surface` | `#FFFFFF` | Main panels and menus |
| `--color-surface-muted` | `#F0F0ED` | Subtle grouped surfaces |
| `--color-surface-hover` | `#EAEAE6` | Hovered neutral controls |
| `--color-text` | `#191919` | Primary text |
| `--color-text-secondary` | `#666661` | Supporting text |
| `--color-text-tertiary` | `#85857F` | Quiet metadata; check contrast before use |
| `--color-border` | `#E3E3DE` | Dividers and outlines |
| `--color-border-strong` | `#C9C9C2` | Stronger outlines |
| `--color-accent` | `#333333` | Primary monochrome action |
| `--color-accent-contrast` | `#FFFFFF` | Text on primary action |
| `--color-focus` | `#555555` | Focus indicator, with visible outline |
| `--color-success` | `#287A50` | Completion/success status |
| `--color-warning` | `#946200` | Upcoming/attention status |
| `--color-danger` | `#B42318` | Errors/destructive actions |
| `--color-info` | `#315F91` | Informational status |

### Dark theme tokens

| Token | Value | Intended use |
|---|---|---|
| `--color-bg` | `#111110` | App background |
| `--color-surface` | `#1A1A18` | Main panels and menus |
| `--color-surface-muted` | `#222220` | Subtle grouped surfaces |
| `--color-surface-hover` | `#2A2A27` | Hovered neutral controls |
| `--color-text` | `#F3F3EF` | Primary text |
| `--color-text-secondary` | `#B0B0A9` | Supporting text |
| `--color-text-tertiary` | `#8A8A83` | Quiet metadata; check contrast before use |
| `--color-border` | `#30302D` | Dividers and outlines |
| `--color-border-strong` | `#454540` | Stronger outlines |
| `--color-accent` | `#E8E8E2` | Primary monochrome action |
| `--color-accent-contrast` | `#191919` | Text on primary action |
| `--color-focus` | `#D0D0C8` | Focus indicator, with visible outline |
| `--color-success` | `#78C99A` | Completion/success status |
| `--color-warning` | `#E7BD67` | Upcoming/attention status |
| `--color-danger` | `#FF8A80` | Errors/destructive actions |
| `--color-info` | `#91BCEB` | Informational status |

Status colors are semantic exceptions to the nearly monochrome palette. Use them sparingly and pair color with text, icons, or shape. Verify WCAG contrast for final foreground/background combinations; the values above are starting tokens, not a substitute for testing.

## 5. Typography

- Preferred system stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Use a clear type scale; avoid excessive font sizes and weights.
- Suggested sizes: page title 28–32 px; section title 18–22 px; body 14–16 px; supporting metadata 12–13 px.
- Use 400 for body, 500 for labels, and 600 for important headings/actions. Avoid using bold everywhere.
- Body line-height should generally be 1.45–1.65. Headings should be compact but not cramped.
- Use tabular numerals for progress percentages, dates, counts, and statistics where supported.

## 6. Spacing, shape, borders, and depth

Use a consistent 4 px base spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Default control height: 36–40 px; primary touch targets should be about 44 px where practical.
- Small radius: 6 px for compact controls.
- Standard radius: 10 px for inputs and medium surfaces.
- Large radius: 14 px for major panels; use sparingly.
- Prefer 1 px borders and surface contrast over shadows.
- Shadows should be soft, low-opacity, and reserved for floating elements such as popovers or menus.
- Avoid stacking bordered cards inside bordered cards without a clear structural reason.

## 7. Components and states

Build reusable components and define their variants centrally. At minimum, standardize:

- App shell, sidebar, navigation item, page header
- Button: primary, secondary, ghost, destructive; disabled and loading states
- Text input, search, select, checkbox, switch, segmented control
- Subject row/card, topic row, completion indicator, progress bar
- Status badge, deadline item, empty state, error state, skeleton/loading state
- Dialog, popover, tooltip, toast/notification
- Test question, answer option, result summary, review item
- Theme selector

### Interaction rules

- Hover is enhancement only; it must not be the only way to discover an action.
- Every interactive element needs visible keyboard focus.
- Disabled, loading, success, warning, and error states must be visually distinct.
- Confirm destructive actions when data loss is plausible.
- Use inline validation near the relevant field and explain how to fix the problem.
- Respect `prefers-reduced-motion`; never rely on animation to communicate status.
- Keep transitions subtle, generally 120–220 ms, and avoid animating layout properties unnecessarily.

## 8. Data visualization and progress

- Progress bars and charts should be restrained and labeled with actual values.
- A percentage must have a clear denominator or context where possible (for example, “12 of 20 topics”).
- Never communicate completion, risk, or errors by color alone.
- Keep charts minimal, legible, and useful; avoid decorative charts with no decision value.
- Distinguish “not started”, “in progress”, “completed”, and “needs review” with both labels and visual cues.

## 9. Content and empty states

- Use realistic, editable sample data during development, clearly separated from real user data.
- Empty states should explain what belongs here and offer one useful next action.
- Avoid fake metrics that look like the user's actual academic progress.
- Use consistent date, time, and percentage formatting throughout the app.
- Provide helpful error messages without exposing stack traces or internal details to users.

## 10. Accessibility and quality bar

- Target WCAG 2.2 AA for text and interactive controls where applicable.
- All controls need accessible names; form fields need persistent labels.
- Support keyboard navigation and logical focus order.
- Do not remove focus outlines without providing an equivalent.
- Respect reduced motion and sufficient contrast in both themes.
- Check layout at narrow mobile widths and browser zoom.

## 11. Reference usage

References are inspiration for hierarchy, spacing, and interaction quality only. Do not copy logos, proprietary assets, exact branded layouts, or distinctive illustrations. If screenshots are supplied, inspect them and extract reusable principles rather than cloning them.

## 12. Change control

- `DESIGN.md` is the source of truth for visual decisions.
- Any proposed change to tokens, typography, layout principles, or component patterns must be applied consistently and documented here when it changes the system.
- A page-specific exception must have a clear functional reason and must not silently establish a new visual language.
- Before calling a UI task complete, verify the implementation against this document and the checklist in `AGENTS.md`.
