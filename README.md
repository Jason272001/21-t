# 21st Century Technology - 21CT

Professional Burmese-language technology education and training platform.

## Project Structure

- `frontend/` - Next.js App Router UI, public assets, pages, layouts, and React components.
- `backend/` - Prisma schema, migrations, seed script, Auth.js config, server actions, validators, and service abstractions for email, storage, and payments.
- `node_modules/` - shared root dependencies for both folders.

## Local backend setup

Requires Node.js 22 and PostgreSQL 17+ installed locally. Put PostgreSQL's `bin`
directory on PATH, or set `PG_BIN` to that directory in your terminal.

```powershell
npm ci
npm run db:setup
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login). The generated
admin email and password are in `.local-admin.txt` in this project. This file,
local environment files, and database files are ignored by Git. Never upload them.

Setup creates a PostgreSQL cluster bound to `127.0.0.1:55432`, database
`21ct_local`, applies migrations, generates Prisma, and creates the first admin
with an instructor profile. It generates random passwords and an Auth.js secret.
It does not run the old demo seed or erase existing records. Stop `npm run dev`
before running setup again, because Windows locks the Prisma engine while the
website is running. Re-running setup
preserves the admin account. Existing unmanaged configuration is left untouched.

For later sessions:

```powershell
npm run db:start
npm run dev
# When finished with the database:
npm run db:stop
```

Keep `.env` and `frontend/.env.local` consistent when changing database or auth
settings. `db:setup` does not overwrite either file. Stop PostgreSQL before
moving the project or copying the local database directory.

## First backend stage

- `/admin`: administrator-only course and class management, enrollment overview.
- Create a draft course, fill its details, then select **Published**.
- Schedule a class with dates, times, capacity, price, and enrollment deadline.
  Dates and times use **Asia/Yangon (UTC+06:30)**.
- Draft classes stay private. Select **Open for enrollment** to accept students.
- `/register`: creates student accounts only; passwords require 12 characters.
- `/portal`: routes signed-in admins to `/admin` and other users to `/student`.
- `/student`: shows only the signed-in student's enrollments and confirmations.
- Enrollment requires sign-in, checks publication/deadline/capacity, prevents
  duplicates, and reserves seats transactionally. Free classes are confirmed;
  paid classes await payment. Payment collection/confirmation is not yet built.
- Login attempts are limited to 10 per email within 15 minutes. Administrative
  actions verify the current database role rather than trusting the session role.
- With no email API key, email notifications are logged locally, not delivered.

This is the account, catalog, and enrollment foundation. Video upload/streaming,
lesson access, quizzes/tests, progress tracking, event publishing, instructor
management, payment workflows, password reset, and email verification are still
future stages. Footer links for some future pages still lead to missing routes.

## Checks

```powershell
npm run typecheck
npm run lint
npm run build
npm test
```

Integration tests require the local database. They create a uniquely named test
schema, apply migrations there, verify authorization and concurrent enrollment,
and remove only that schema afterwards. They do not modify the public schema.

## Connecting a hosted database later

A Git push does not provide a hosted database. Configure `DATABASE_URL`, a new
random `AUTH_SECRET`, `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` for the live domain in
your hosting environment. Configure Auth.js trusted-host handling for the chosen
host. Apply `npm run db:deploy` against that database before enabling accounts.
Create the first live administrator using `ADMIN_EMAIL`, `ADMIN_PASSWORD`
(at least 12 characters, at most 72 UTF-8 bytes) and optionally `ADMIN_NAME` with
`npm run admin:create`. Supply those through environment variables, never Git.
The command preserves an existing admin and refuses to promote an existing student.

The legacy `npm run seed` deletes application data and uses demo credentials;
it is not part of this setup and must not be run against a live database.

## Website Language

The top navigation includes an English / မြန်မာ selector on desktop and mobile.
Burmese is the default. The selected language is stored in the `21ct-language`
cookie for one year and is applied on navigation and reload without a database.
Switching language keeps the current URL and updates the document's `lang` attribute.

Translations for navigation, homepage interface copy, the footer, and shared card
actions live in `frontend/src/lib/i18n.ts`. Server components read the selection
through `getLanguage()` in `frontend/src/lib/i18n-server.ts`. Article/course content,
testimonials, and the remaining page-specific forms currently retain their original
language; this selector does not automatically translate authored content.

## Website Theme

The sun/moon button beside the language selector switches between light and dark
mode on desktop and mobile. Dark mode is the default. The `21ct-theme` cookie
remembers the choice for one year, independently of the language preference.
The saved theme is rendered by the server before the page is displayed, so a
reload does not flash the other theme. No database is required for this setting.

Theme colors are defined in `frontend/src/app/globals.css`. Use semantic utilities
such as `bg-page`, `bg-surface`, `text-foreground`, and `text-muted` for new UI so
both themes stay consistent. Bright action buttons retain their dark text for contrast.
