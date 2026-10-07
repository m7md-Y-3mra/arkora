# Arkora

Arkora (أركورا) is a full-stack, Arabic-first real estate platform. It covers both sides of the product: a public marketing/search site for buyers and renters, and a role-based back-office dashboard for agents and admins to manage listings and leads.

Live demo: https://arkora.onrender.com

Note on the demo: it runs on free-tier hosting. The web service spins down after periods of inactivity, so the first request after a while can take 30-60 seconds to wake up. Subsequent requests are fast.

## What it does

**Public site**

- Home page with featured listings
- Property search with filters (purpose, type, city, district, price range, area, bedrooms, bathrooms, amenities) and sorting, backed by real database queries, not client-side filtering
- Property detail pages with an image gallery, an interactive map (Leaflet/OpenStreetMap) built from the property's stored coordinates, and a lead/contact form
- Agent directory and individual agent profile pages showing each agent's bio, stats, and published listings
- Saved/favorite properties for signed-in users

**Dashboard (role-aware: admin, agent, client)**

- Authentication (register, login, email verification, password reset) via Laravel Breeze
- Overview page with live stats, a 14-day lead trend chart, and a property-type distribution chart (Recharts)
- Property CRUD with a multi-step form, drag-and-drop image reordering and upload, amenities, and draft/published status
- Lead management: every contact-form submission creates a lead and triggers a notification (email + in-app bell with unread count) to the owning agent
- User/role management for admins

Access is enforced server-side per role; the client dashboard, for example, sees a scoped-down view with no management tools.

## Why it's built this way

- **Repository pattern**: controllers depend on repository interfaces (`app/Repositories/Contracts`), not Eloquent directly, so query logic for properties and leads is centralized and swappable/testable.
- **Inertia instead of a separate API**: the backend renders React pages directly through Inertia, which avoids building and maintaining a separate REST/JSON API while still getting a full SPA-like React frontend.
- **Server-driven validation**: forms use `react-hook-form` + `zod` on the client for UX, but the server is the source of truth; validation errors returned by Laravel are mapped back into the form.
- **RTL as a first-class concern**: layout, spacing, and component variants (e.g. sheet/drawer sides) use logical CSS properties and RTL-aware component props rather than a single global `dir="rtl"` override, since the app is Arabic-first with English as a fallback locale.

## Tech stack

**Backend**
- PHP 8.2+, Laravel 11
- PostgreSQL
- Inertia.js (Laravel adapter)
- Spatie `laravel-permission` for role-based access (admin/agent/client)
- Laravel Notifications (mail + database channels)
- Pest for testing

**Frontend**
- React 19 + TypeScript
- Inertia.js (React adapter)
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- `react-hook-form` + `zod` for forms
- `@tanstack/react-table` for data tables
- `recharts` for dashboard analytics
- `leaflet` / `react-leaflet` for the property map
- `@dnd-kit` for drag-and-drop image reordering
- `nuqs` for URL-synced search filters
- `zustand` for lightweight UI state

**Infrastructure**
- Docker (multi-stage build: Node for asset compilation, PHP/Alpine for the runtime)
- Deployed on Render via a `render.yaml` blueprint (web service + managed PostgreSQL)

## Local setup

Prerequisites: PHP 8.2+ with the `pdo_pgsql` extension, Composer, Node 20+, and a PostgreSQL database.

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate
```

Set the database credentials in `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), then:

```bash
php artisan migrate --seed
npm run build
php artisan serve
```

For day-to-day development, run the Vite dev server and Laravel's server side by side:

```bash
npm run dev
php artisan serve
```

## Testing

```bash
php artisan test
```

The suite covers the authentication flows (registration, login, email verification, password reset/update, profile updates) end to end against a real database connection, using an isolated `arkora_testing` database so test runs don't touch development data.

## Deployment

The app ships as a Docker image (`Dockerfile`): one stage builds the frontend assets with Node, the other installs PHP dependencies and runs the app. `render.yaml` describes the full infrastructure (web service + PostgreSQL instance) as a Render Blueprint, so the whole stack can be recreated with "New Blueprint" pointed at this repository. On boot, the container runs pending migrations, caches config/routes/views, and serves the app.

## Project structure

```
app/
  Http/Controllers/        Public site + Dashboard controllers
  Models/                  Eloquent models
  Repositories/             Repository implementations
  Repositories/Contracts/  Repository interfaces
  Notifications/           Mail + database notifications (e.g. new lead received)
database/
  migrations/
  seeders/
resources/js/
  Pages/                   Inertia pages (Public/, Dashboard/, Favorites/, Auth/)
  components/              Shared React components (property cards, map, layout, ui)
  types/                   Shared TypeScript types for models and page props
```
