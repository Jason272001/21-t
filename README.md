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

Open [http://localhost:3000/admin57/log-in](http://localhost:3000/admin57/log-in) for admin login. Students use `/login`. The generated
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

## Accounts, courses and enrollment

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
- Login attempts are limited to 10 per account (or unknown identifier) within 15 minutes. Administrative
  actions verify the current database role rather than trusting the session role.
- With no email API key, email notifications are logged locally, not delivered.

## Student, blog and video management

- Admin login: `/admin57/log-in` (unlisted in public navigation, marked noindex).
  Student login: `/login`. Each login provider accepts only its intended role;
  authorization is enforced on pages, actions and video endpoints.
- `/admin/students`: search, create, edit, reset passwords, enable/disable and
  delete student accounts. Changes invalidate existing sessions. Student
  passwords require at least 12 characters. Administrators cannot be modified
  through student management.
- Deletion requires typing the student's email, permanently removes that
  student's enrollment/payment/attendance records, and releases occupied seats.
  Use **Account enabled** to disable access while retaining history instead.
- `/admin/articles`: write, edit, publish, unpublish and delete blog posts. Public
  posts appear at `/articles`. Draft posts and draft metadata are private.
- `/admin/videos`: save video details as a draft, upload an MP4/WebM file (up to
  250 MB), then publish. Files can be replaced and posts edited or deleted.
  MP4 with H.264/AAC works across common browsers. This stage does not transcode
  videos or generate adaptive streaming renditions.
- Video audiences: **Everyone**, **Signed-in students**, or **Enrolled students
  only** for a selected course. Enrolled-only access requires a confirmed or
  completed enrollment; unpaid enrollments do not grant access.
- `/videos` lists public videos; `/student/videos` includes videos available to
  the signed-in student. Playback URLs enforce the same access rules as pages,
  including for byte-range requests used to seek within a video.
- Videos are streamed from disk outside the public assets directory. Set
  `VIDEO_STORAGE_PATH` to an absolute persistent directory for deployment; the
  default is `.local-uploads/videos` under the server's working directory.
  Uploaded files are ignored by Git and must be backed up separately from the DB.
  Ephemeral/serverless filesystems are not suitable for this storage backend.
- The requested temporary admin account exists only in this local database. Its
  credentials are in the ignored `.local-admin.txt`; no password is hardcoded in
  authentication or committed to Git. Accounts marked `localOnly` cannot sign in
  when `AUTH_URL` points at a hosted domain. Provision a strong live admin account
  separately before deployment.

Quizzes/tests, progress tracking, event publishing, student class-code redemption screens,
student self-service password recovery and email verification
remain future stages. Footer links for some future pages still lead to missing routes.

## Admin workspace and offline class payments

The `/admin` area has its own responsive navigation and English/Burmese and
light/dark controls. Public website navigation and the public footer are hidden
on admin routes. Your existing `admin` account is migrated to **Owner**.

| Level   | Permissions                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------ |
| Owner   | Students, courses, schedules, instructors, blog/articles, videos, class codes and admin accounts |
| Manager | Students and blog/articles; edit existing Staff accounts only                                    |
| Staff   | Students and blog/articles only                                                                  |

Managers cannot create or delete admin accounts or change their levels. Owners
cannot disable, demote or delete themselves. Account changes invalidate existing
sessions. All mutation services recheck privileges in PostgreSQL; hiding a tab is
not the authorization boundary. Referenced courses/classes/instructors/admins
cannot be deleted when doing so would erase history; archive, cancel, reassign or
disable them instead.

To issue a class code, create an instructor, publish a course, and schedule an
upcoming or active class. In **Class codes**, select that class after checking the
KBZ Pay / other payment outside the website. Add an optional recipient label and
payment reference, select expiry, then generate. Copy the full code immediately:
only its SHA-256 digest and a short label are stored. Each unused, unexpired code
reserves one seat. Revoke an unused code to release that reservation. Codes cannot
be moved between courses; class capacity edits include their reservations.

The admin code-generation and revocation UI is available now. Student registration
with a required code and an existing-account “join another class” screen are a
separate next stage. No public code-redemption endpoint has been added. The tested
backend redemption transaction already enforces one use, revocation, expiry,
capacity and class/course scope, creates a confirmed enrollment with a manually
paid payment record, and allows the same student account to join another class.
It must be called with the authenticated student's ID when that screen is built.

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
(at least 12 characters, at most 72 UTF-8 bytes) and optionally `ADMIN_NAME` / `ADMIN_USERNAME` with
`npm run admin:create`. Supply those through environment variables, never Git.
The command preserves an existing admin and refuses to promote an existing student.

The legacy `npm run seed` deletes application data and uses demo credentials;
it is not part of this setup and must not be run against a live database.

## Render deployment

The repository includes `render.yaml` for one Node web service running the website,
server actions, authentication and video API together. It uses your existing Render
PostgreSQL database; it does not create another database. Import the repository as
a Render Blueprint and enter the database's **Internal Database URL** when prompted
for `DATABASE_URL`. Both services must be in Oregon in the same Render account.

Review the paid web-service and 1 GB persistent-disk costs before deploying. The
disk mounts at `/var/data`; videos use `/var/data/videos`. Increase its size before
it fills up, and back up video files separately from PostgreSQL. Free web services
cannot persist these uploads across redeploys. A single disk also means a single
service instance and brief downtime during redeployment.

For a free preview, configure the existing service manually with the same build
command, `npm run db:deploy && npm run render:start` as its start command, and no
disk or `VIDEO_STORAGE_PATH`. Uploads are blocked on Render until that path is set
to an attached persistent disk. PostgreSQL-backed student and blog features work
without a disk. The paid blueprint uses a pre-deploy migration instead.

The build installs dependencies and builds Next.js. The pre-deploy command applies
versioned migrations with `npm run db:deploy`; it never runs the destructive demo
seed. `/api/health` reports readiness against an application database table. The
launcher uses Render's assigned HTTPS URL for authentication and site links and
binds to Render's `PORT` on `0.0.0.0`. For a custom domain, set `AUTH_URL` and
`NEXT_PUBLIC_SITE_URL` to that HTTPS origin and rebuild.

Create a live administrator once using `npm run admin:create` in the Render shell
with `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_NAME` and a strong `ADMIN_PASSWORD`
set as environment variables. Remove those bootstrap values afterwards. If an
administrator was already provisioned directly in the hosted database, skip this
step. Existing admin accounts are preserved. The local `12345` account is not
copied to production. Sign in at `/admin57/log-in`.

Connection URLs, passwords and local deployment notes belong only in ignored
files or Render environment variables. Never commit them. Rotate any database
password shared in a screenshot and update its connection URL in Render.

Deployment dependency review (2026-10-15): Next.js 16.4.2 and Auth.js beta.32
include the available fixes for the critical advisories detected during deployment.
After compatible dependency updates, npm audit still reports eight high-severity
entries in the ESLint glob dependency chain and Prisma CLI's config merge chain.
These need a separate tooling upgrade review; do not run `npm audit fix --force`,
which proposes a Next ESLint downgrade and Prisma major migration. Do not pass
untrusted glob patterns or config objects to these tools.

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
