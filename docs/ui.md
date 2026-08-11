# UI Coding Standards

This document defines the mandatory standards for all UI work in this project. These rules are not suggestions — follow them exactly.

## Components: shadcn/ui only

**Only [shadcn/ui](https://ui.shadcn.com) components may be used to build UI in this project.**

- ABSOLUTELY NO custom components should be created. Do not hand-roll buttons, inputs, cards, modals, dropdowns, tables, or any other UI primitive.
- If a needed component does not yet exist in the project, add it via the shadcn CLI (`npx shadcn@latest add <component>`) rather than writing it from scratch.
- If shadcn does not offer a suitable component for a particular need, compose the UI from existing shadcn components rather than creating a new custom one. Do not create a bespoke component as a workaround.
- All shadcn components live under `src/components/ui/` (the shadcn default). Do not create additional component directories for one-off custom UI (e.g. no `src/components/custom/`, no ad-hoc component files inside feature folders).
- Application code (pages, layouts, feature logic) should import and compose shadcn components — it should not define new visual/interactive components of its own.

## Date formatting: date-fns only

All date formatting in the UI must use [date-fns](https://date-fns.org/), not native `Date` methods, `Intl.DateTimeFormat`, or any other date library.

Dates must be displayed with an ordinal day, abbreviated month, and full year, in this format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jan 2026
```

Use date-fns' `format` function with the `do MMM yyyy` format string to produce this output:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy");
```

Do not write custom ordinal-suffix logic (e.g. manual `st`/`nd`/`rd`/`th` calculation) — `do` in date-fns already handles this.

## Summary of hard rules

- UI components: shadcn/ui only, no custom components, ever.
- Missing component: add it via the shadcn CLI, or compose existing shadcn components — never hand-write one.
- Date formatting: date-fns `format(date, "do MMM yyyy")` only, no native `Date` formatting, no manual ordinal logic.
