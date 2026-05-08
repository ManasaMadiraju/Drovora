# Drovora — Developer Setup

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up database (first time only)
cd apps/api
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
cd ../..

# 3. Run both servers
npm run dev
```

- **API**: http://localhost:4000
- **Web**: http://localhost:3000

## Demo Accounts

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@drovora.com    | password123 |
| Customer | customer@drovora.com | password123 |
| Driver   | driver@drovora.com   | password123 |

Use the **Quick demo access** buttons on the login screen.

## Structure

```
apps/
  api/   — Node.js + Express + Prisma (SQLite) + Socket.io
  web/   — React + Vite + Tailwind CSS
```

### Portals
- `/customer` — Request pickups, live tracking, history, rate driver
- `/driver`   — View/accept jobs, update status, earnings
- `/admin`    — Orders, driver management, analytics

### Adding Real Services Later
| Feature      | Now (mock)        | Later (real)        |
|--------------|-------------------|---------------------|
| Maps         | Leaflet + OSM     | Google Maps API     |
| Payments     | Simulated         | Stripe SDK          |
| Push notifs  | In-app only       | Firebase FCM        |
| Database     | SQLite            | PostgreSQL          |
