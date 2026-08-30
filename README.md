# AB-Tools

Phase 1 bootstrap for the AB-Tools project. This commit adds the Next.js + TypeScript + Tailwind + Prisma skeleton and basic app structure.

## What's included

- Next.js app directory (app/)
- Basic Header, Footer, FileUploader components
- Tailwind CSS configuration
- Prisma schema with foundational models
- .env.example with required environment variables
- package.json with scripts for dev, build, migrations

## Getting started (development)

1. Install dependencies

   npm install

2. Copy .env.example to .env and configure DATABASE_URL and other values

3. Run Prisma migrate (local Postgres required)

   npm run prisma:generate
   npm run db:migrate

4. Start the dev server

   npm run dev

## Next steps

I will now run through authentication scaffolding, storage abstraction, and a basic file upload API. If you'd like I can continue by creating the first API route and wiring up a local storage adapter.
