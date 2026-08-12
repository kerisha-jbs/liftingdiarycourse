# Auth Coding Standards

This document defines the mandatory standards for all authentication and authorization work in this project. These rules are not suggestions — follow them exactly.

## Auth provider: Clerk only

**This app uses [Clerk](https://clerk.com) (`@clerk/nextjs`) for all authentication.**

- Do NOT hand-roll auth (custom sessions, JWTs, cookies, password hashing, etc.).
- Do NOT introduce a different auth library (NextAuth/Auth.js, Lucia, Supabase Auth, etc.) alongside or instead of Clerk.
- All sign-in, sign-up, and session UI must use Clerk's prebuilt components — do not build custom auth forms.

## Root layout: `ClerkProvider`

- `src/app/layout.tsx` wraps the app in `<ClerkProvider>`. This must remain the single top-level auth provider — do not add a second one lower in the tree.
- Use Clerk's `<Show when="signed-in">` / `<Show when="signed-out">` components to conditionally render UI based on auth state, rather than checking session state manually in JSX.
- Use Clerk's prebuilt components for account UI: `<SignInButton>`, `<SignUpButton>`, `<UserButton>`. Do not build custom equivalents (this also follows the shadcn-only rule in `/docs/ui.md` — Clerk's auth components are the sanctioned exception to "shadcn only", since they are the auth provider's required UI, not a hand-rolled primitive).

## Getting the current user: server-side only, via `/data` helpers

This project's data-fetching rules (`/docs/data-fetching.md`) require ALL data fetching to happen in server components through `/data` helpers. Auth is no exception:

- Use `auth()` from `@clerk/nextjs/server` (awaited — it's async in this Clerk version) inside `/data` helper functions to get the current `userId`.
- If `userId` is missing (signed out), the helper must fail safe — e.g. return an empty result — never fall through to an unscoped query.
- Every `/data` helper that reads or writes user-owned data must use this `userId` to scope the query, per the strict per-user isolation rule in `/docs/data-fetching.md`. Do not query the database from a client component or route handler to work around this.
- Do NOT call `auth()` or `currentUser()` from client components. If a client component needs to know the auth state for rendering, use Clerk's `<Show>` component or the `useUser()`/`useAuth()` hooks — never fetch or duplicate server-side session logic on the client.

Example, matching the existing pattern in `src/data/workouts.ts`:

```ts
import "server-only";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";

export async function getWorkoutsForCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return db.query.workouts.findMany({
    where: { userId },
  });
}
```

## Route protection: `proxy.ts`, not `middleware.ts`

This project is on Next.js 16, where the `middleware.js` file convention is **deprecated** in favor of `proxy.js`. This applies to Clerk's route-protection setup too:

- If route protection is added (e.g. via `clerkMiddleware`), it must live in `proxy.ts` at the project root (or inside `src/` alongside `app/`), exporting a `proxy` function — not in a `middleware.ts` file.
- Do not follow older Clerk/Next.js tutorials that reference `middleware.ts` without adapting them to the `proxy.ts` convention.
- Always scope the `matcher` config to avoid unintentionally blocking static assets.

## Summary of hard rules

- Auth provider: Clerk (`@clerk/nextjs`) only — no custom auth, no additional auth libraries.
- Auth UI: Clerk's prebuilt components (`ClerkProvider`, `Show`, `SignInButton`, `SignUpButton`, `UserButton`) only — no hand-rolled auth forms.
- Getting the current user is server-side only: `auth()` from `@clerk/nextjs/server`, called inside `/data` helpers, always scoping queries to `userId` and failing safe when signed out.
- Never call Clerk's server-side `auth()`/`currentUser()` from client components.
- Route protection belongs in `proxy.ts` (Next.js 16's replacement for `middleware.ts`), never in a `middleware.ts` file.
