# Data Fetching Standards

This document defines the mandatory standards for all data fetching in this project. These rules are not suggestions — follow them exactly.

## Data fetching: server components only

**ALL data fetching within this app must be done via server components.**

- Data must NOT be fetched via route handlers.
- Data must NOT be fetched via client components (no `useEffect`, no client-side `fetch`, no client-side data libraries).
- Data must NOT be fetched via any other mechanism (middleware, server actions used purely for reads, etc.).
- Server components are the ONLY sanctioned place to fetch data. This is incredibly important — do not deviate from this, even for "just one small case."

## Database queries: Drizzle ORM via `/data` helpers only

- All database queries must ALWAYS be done via helper functions within the `/data` directory (e.g. `src/data/`).
- These helper functions must use Drizzle ORM to query the database.
- DO NOT USE RAW SQL. No raw SQL strings, no `sql\`...\`` escape hatches used to bypass Drizzle's query builder.
- Server components call `/data` helper functions to get their data — they must not construct or run queries inline.

## Data access: strict per-user isolation

**A logged-in user must ONLY be able to access their own data.**

- Every `/data` helper function that reads or writes user-owned data must scope its query to the authenticated user (e.g. filtering by `userId` matching the current session's user).
- A user must NOT be able to access, view, modify, or delete any other user's data, under any circumstances.
- Do not rely solely on UI-level hiding to enforce this — the query itself must enforce the scoping.

## Summary of hard rules

- Fetch data only in server components — never in route handlers or client components.
- Query the database only through helper functions in `/data`, and only via Drizzle ORM — no raw SQL.
- Every data query must be scoped to the logged-in user — a user can only ever access their own data.
