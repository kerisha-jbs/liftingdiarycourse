# Data Mutation Standards

This document defines the mandatory standards for all data mutations in this project. These rules are not suggestions — follow them exactly.

## Database writes: Drizzle ORM via `/data` helpers only

- All database mutations (inserts, updates, deletes) must ALWAYS be done via helper functions within the `/data` directory (e.g. `src/data/`), the same as reads (see `/docs/data-fetching.md`).
- These helper functions must use Drizzle ORM to perform the write. DO NOT USE RAW SQL. No raw SQL strings, no `sql\`...\`` escape hatches used to bypass Drizzle's query builder.
- Server actions call `/data` helper functions to perform mutations — they must not construct or run Drizzle queries inline.
- Every `/data` mutation helper that writes user-owned data must scope its query to the authenticated user (e.g. filtering by `userId` matching the current session's user), per the per-user isolation rule in `/docs/data-fetching.md`. Get the user via `auth()` per `/docs/auth.md`.

## Mutation entry point: server actions in colocated `actions.ts` files

- ALL data mutations must be performed via [server actions](https://nextjs.org/docs/app/getting-started/updating-data), never via route handlers or client-side calls to the database.
- Server actions must live in a file named `actions.ts`, colocated with the route/component that uses them (e.g. `src/app/workouts/actions.ts` next to `src/app/workouts/page.tsx`).
- Do not define server actions inline inside component files, and do not centralize all actions into one global `actions.ts` — colocate per feature/route.
- Each `actions.ts` file must start with the `"use server"` directive.

## Server action parameters: typed, no `FormData`

- Server action parameters must be explicitly typed — no `any`, no untyped params.
- Server actions must NOT accept a `FormData` argument. Do not write `async function updateWorkout(formData: FormData)`. Instead, accept plain typed parameters (primitives, objects, arrays) that the calling client component passes directly.

## Server action validation: Zod, always

- Every server action MUST validate its arguments with [Zod](https://zod.dev) before doing anything else (before calling any `/data` helper).
- Define a Zod schema for the action's input, parse the incoming arguments against it (e.g. `schema.parse(args)`), and only proceed with validated, typed data.
- Do not skip validation because the TypeScript parameter types "already guarantee" correctness — TypeScript types are erased at runtime and do not protect against malformed or malicious input reaching a server action. Zod validation is mandatory regardless of the parameter types.
- If validation fails, the action must not proceed to call any `/data` helper.

Example shape to follow:

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";

import { auth } from "@clerk/nextjs/server";

import { createWorkoutForUser } from "@/data/workouts";

const createWorkoutSchema = z.object({
  startedAt: z.date(),
  exerciseIds: z.array(z.string()),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(input: CreateWorkoutInput) {
  const { startedAt, exerciseIds } = createWorkoutSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  return createWorkoutForUser(userId, { startedAt, exerciseIds });
}
```

```ts
// src/data/workouts.ts
import "server-only";

import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkoutForUser(
  userId: string,
  data: { startedAt: Date; exerciseIds: string[] }
) {
  return db.insert(workouts).values({ userId, ...data }).returning();
}
```

## Redirects: client side only, after the server action resolves

- Server actions must NOT call `redirect()` (from `next/navigation`) internally.
- Instead, the server action returns normally (e.g. the created/updated record, or nothing), and the calling client component performs the redirect itself — using `useRouter()` from `next/navigation` — after `await`ing the action call.
- This keeps navigation decisions in the client component that owns the form/interaction, and keeps the server action a pure data-mutation boundary.

```ts
// src/app/workouts/actions.ts
"use server";

// ...

export async function createWorkout(input: CreateWorkoutInput) {
  const data = createWorkoutSchema.parse(input);

  return createWorkoutForUser(data);
}
```

```tsx
// src/app/workouts/new-workout-form.tsx
"use client";

import { useRouter } from "next/navigation";

import { createWorkout } from "./actions";

export function NewWorkoutForm() {
  const router = useRouter();

  async function handleSubmit(/* ... */) {
    const workout = await createWorkout(/* ... */);
    router.push(`/workouts/${workout.id}`);
  }

  // ...
}
```

## Summary of hard rules

- Database mutations: Drizzle ORM only, only via helper functions in `/data` — no raw SQL, no inline queries in actions.
- Mutation helpers must scope writes to the authenticated user, same as read helpers.
- All mutations happen via server actions, defined in colocated `actions.ts` files with `"use server"` — never route handlers, never client-side writes.
- Server action params must be explicitly typed — never `FormData`.
- Every server action must validate its arguments with Zod before calling any `/data` helper — no exceptions.
- Server actions must never call `redirect()` — redirect client-side with `useRouter()` after the action call resolves.
