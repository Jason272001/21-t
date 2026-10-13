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

## Admin Seed Login

```text
Email: admin@21ct.local
Password: Admin@21CT
```
