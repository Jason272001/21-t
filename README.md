# 21st Century Technology - 21CT

Professional Burmese-language technology education and training platform.

## Project Structure

- `frontend/` - Next.js App Router UI, public assets, pages, layouts, and React components.
- `backend/` - Prisma schema, migrations, seed script, Auth.js config, server actions, validators, and service abstractions for email, storage, and payments.
- `node_modules/` - shared root dependencies for both folders.

## Run Locally

Start the local PostgreSQL cluster:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "D:\21 T\backend\.postgres-data" -l "D:\21 T\backend\.postgres.log" -o "-p 5432" start
```

Run the website:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend Commands

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Admin seed login:

```text
Email: admin@21ct.local
Password: Admin@21CT
```
