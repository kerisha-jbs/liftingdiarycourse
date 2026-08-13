# Routing Coding Standards

This document defines the mandatory standards for all routing work in this project. These rules are not suggestions — follow them exactly.

## All app routes live under `/dashboard`

**Every route in this app is a `/dashboard` route or a sub-route of it.**

- All pages belong under `src/app/dashboard/` (e.g. `src/app/dashboard/page.tsx` → `/dashboard`, `src/app/dashboard/workout/new/page.tsx` → `/dashboard/workout/new`).
- Do not add feature pages as top-level routes outside `src/app/dashboard/` (e.g. no `src/app/workouts/page.tsx`).
- `src/app/page.tsx` (the `/` route) is not a feature route — do not build application UI there. It exists only as the marketing/entry root and should redirect or link into `/dashboard`.

Example, matching the existing structure:

```
src/app/dashboard/page.tsx                          → /dashboard
src/app/dashboard/workout/new/page.tsx               → /dashboard/workout/new
src/app/dashboard/workout/[workoutId]/page.tsx        → /dashboard/workout/[workoutId]
```

## Route protection: `proxy.ts`, never per-page checks

`/dashboard` and every sub-route under it are protected routes — accessible only to signed-in users. Per `/docs/auth.md`, this project is on Next.js 16, where the `middleware.js` convention is deprecated in favor of `proxy.js`:

- Route protection is centralized in `src/proxy.ts`, using Clerk's `clerkMiddleware()` from `@clerk/nextjs/server`.
- Protect `/dashboard` and all sub-routes by matching `/dashboard(.*)` with `createRouteMatcher` and calling `auth.protect()` inside the middleware for matching requests. Do not scatter ad-hoc `auth()`/redirect checks inside individual `page.tsx` files as a substitute for this — the proxy is the single enforcement point.
- Do not create a `middleware.ts` file — it is deprecated in this Next.js version. All route protection logic belongs in `proxy.ts` at `src/proxy.ts`.
- Keep the `matcher` config scoped so static assets and non-dashboard public routes are not unintentionally blocked.

Example:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Summary of hard rules

- All application routes live under `/dashboard` in `src/app/dashboard/` — no top-level feature routes.
- `/dashboard` and every sub-route are protected: signed-out users must never reach them.
- Route protection is enforced centrally in `src/proxy.ts` via `clerkMiddleware()` + `createRouteMatcher(["/dashboard(.*)"])` + `auth.protect()` — never via per-page auth checks, and never via a `middleware.ts` file.
