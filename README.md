# Electorate Atlas — Victoria

A Next.js + Supabase site for exploring all 38 federal (Commonwealth) electoral
divisions in Victoria: member, party, area, and 2021 Census demographics for
each seat.

- **Framework:** Next.js (App Router, TypeScript)
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (Postgres)
- **Data sources:** Australian Electoral Commission (boundaries, members,
  enrolment) and ABS 2021 Census QuickStats (demographics)

## Schema

```
divisions(id, name, state, area_km2, classification, member_name, member_party, electors)
division_metrics(division_id -> divisions.id, metric_key, metric_value, metric_value_text, unit, source, year)
```

Defined in [`supabase/schema.sql`](supabase/schema.sql), including row-level
security with a public read-only policy (writes go through the service role
key only, via the seed script).

## Local setup

1. Install dependencies: `npm install`
2. Create a Supabase project, then copy `.env.local.example` to `.env.local`
   and fill in your project's URL, anon key, service role key, and database
   connection string (Project Settings → Data API / Database).
3. Create the tables: `npm run db:schema`
4. Load the dataset: `npm run seed`
5. Run the app: `npm run dev` — open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployed on Vercel, connected to this GitHub repo. Only the two
`NEXT_PUBLIC_*` environment variables need to be set in Vercel — the service
role key and database URL are only used locally for schema/seed scripts and
are never read at runtime.
