# Instructions for developers

This branch adds storage + upload API and a worker to process merge jobs.

Local quickstart (using docker-compose):

1. Start local infra:
   docker compose up -d

2. Install dependencies:
   npm install

3. Copy .env.example -> .env and ensure these point to local services:
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ab_tools?schema=public
   REDIS_URL=redis://localhost:6379
   STORAGE_ENDPOINT=http://localhost:9000
   STORAGE_BUCKET=ab-tools-dev
   STORAGE_ACCESS_KEY=minioadmin
   STORAGE_SECRET_KEY=minioadmin
   LOCAL_STORAGE_PATH=./storage

4. Generate prisma client and run migrations:
   npm run prisma:generate
   npm run db:migrate

5. Start worker in separate terminal:
   npm run worker

6. Start dev server:
   npm run dev

Upload endpoint:
- POST /api/files/upload (multipart/form-data, field name 'files' - multiple allowed)

Merge endpoint:
- POST /api/tools/merge { "fileIds": ["id1","id2"] }

