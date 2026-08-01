# TestNews 📰

English news portal built with **Next.js 16** (App Router) + **MongoDB**. Backend is fully integrated via API routes.

## Features

- 🗞️ News listing with featured hero + latest headlines grid
- 📂 Category pages (World, Technology, Business, Sports, Science, Health, Entertainment)
- 📄 Article detail pages with markdown rendering
- 🔐 Admin panel (`/admin`) for full CRUD
- 🍃 MongoDB storage (shared Docker instance, `testnews` database)

## Tech Stack

- **Next.js 16** (App Router, Server Components)
- **MongoDB** via official driver (`mongodb`)
- **Tailwind CSS 4**
- **TypeScript**

## Getting Started

```bash
npm install
cp .env.example .env.local   # adjust MONGODB_URI / ADMIN_KEY
npm run seed                 # optional: insert sample articles
npm run dev                  # http://localhost:3000
```

## Production

```bash
npm run build
pm2 start "npm run start" --name testnews
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/news` | List news (`?category=`, `?limit=`, `?offset=`, `?featured=1`) |
| GET | `/api/news/[slug]` | Single article by slug |
| POST | `/api/admin/news` | Create article (header `x-admin-key`) |
| PUT | `/api/admin/news/[id]` | Update article (header `x-admin-key`) |
| DELETE | `/api/admin/news/[id]` | Delete article (header `x-admin-key`) |
| POST | `/api/admin/auth` | Admin login `{ key }` |

## Env Variables

- `MONGODB_URI` — MongoDB connection string
- `MONGODB_DB` — database name (default `testnews`)
- `ADMIN_KEY` — admin panel key (default `testnews-admin-2026`)
