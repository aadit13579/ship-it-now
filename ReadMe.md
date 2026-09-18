# ShipItNow — Shipment Status Tracker

A shipment tracking dashboard: create shipments, move them through a status pipeline, search and filter the list, and see the full history behind every status change.

**Live app:** https://frontend-32viupzuv-aadit13579s-projects.vercel.app/

**Stack:** Fastify + PostgreSQL (backend, hosted on Railway) · React + Vite + Tailwind (frontend, hosted on Vercel)

---

## Why these tools

**Vite + React instead of Next.js.**Next.js is built to run its own full-stack server, but since we already have a Fastify backend, using it would just add an unnecessary middleman. React with Vite gives us a lightweight, lightning-fast frontend that talks directly to our API without any extra server bloat or performance lag, communicating directly with our Fastify backend without any framework bloat or performance bottlenecks.

**Fastify + TypeScript for the backend.** Fastify validates every request against a JSON schema before it reaches the route handler, so bad input is rejected early without extra middleware. It's also fast under the kind of traffic this API mostly sees frequent, small reads. TypeScript catches shape mismatches between what the frontend sends and what the backend expects at build time rather than in production.

**PostgreSQL for the database.** The data is genuinely relational: every shipment has a growing list of status-change events tied to it, and the two need to stay in sync. Postgres also gave us a couple of things for free, a `SEQUENCE` for generating clean, collision-free reference numbers, and `ILIKE` for simple search — without needing extra infrastructure.

**Railway + Vercel for hosting.** The backend and database sit together on Railway so queries stay on a fast internal network instead of crossing the public internet. The frontend is a static build with no server logic of its own, so Vercel's zero-config deploys are a good fit.

---

## How it's built

**Two tables, linked, kept in sync.** `shipments` holds the current state of each shipment — status, priority, origin, destination, expected delivery. `shipment_events` is an append-only log of every status change that's ever happened to it, with a timestamp and an optional note. Nothing in `shipment_events` is ever edited or deleted.

Every status update runs inside a single transaction: update the shipment, insert the new event, commit. If either half fails, the whole thing rolls back. That's what guarantees a shipment's current status can never drift out of sync with its own history.

**Reference numbers.** If you don't provide one when creating a shipment, the backend generates one from a Postgres sequence and formats it as `SHIP-00001`. At larger levels this might not work and we might need to shift to Random number Id's like SHIP-AX134 so it's difficult to guess how many orders we recieve in a day and prevent cyber attacks.

**Status track and exceptions.** Most shipments move through a straight line: Booked → In Transit → Delivered. But real shipments sometimes hit something outside that line — Customs Hold, most notably. Rather than force that into the same horizontal track (which would either overlap nodes or misrepresent it as a normal stop), the UI branches it off as a separate node connected by a dotted line. The main track stays clean and evenly spaced, and an exception is visually obvious the moment it happens, without redesigning the whole timeline around it.

**History on demand.** Clicking a shipment opens a side panel with its full event history and status-update controls, fetched only when you open it. The main list endpoint stays lightweight since it doesn't need to carry every shipment's full history just to render the board.

**Input safety.** All database queries are parameterized (`$1`, `$2`, ...) rather than built from string concatenation, so user input is never interpreted as part of the SQL itself. Request bodies are validated against a schema before any of that code runs.

---
### Tools, References & Disclosures

Frameworks & Libraries: Fastify, React, Vite, Tailwind CSS, PostgreSQL, pg-pool.

Hosting Infrastructure: Render (Managed PostgreSQL & Fastify Web Service), Vercel (Frontend edge deployment).

AI Collaboration: AI assistance was utilized as a development tool for code refactoring, TypeScript type definitions, and deployment/database connection troubleshooting.

System Ownership: All system architecture decisions, SQL schema design, API endpoint logic, and end-to-end integration tests were designed, verified, and deployed manually.

---

## Running it locally

**You'll need:** Node 18+, and a PostgreSQL database (local or hosted).

**1. Database** — create a database and run your schema against it. You need the `shipments` and `shipment_events` tables, and the `shipment_ref_seq` sequence used for auto-generated reference numbers.

**2. Backend**
```bash
cd backend
npm install
```
Create a `.env` file:
```
DATABASE_URL=postgres://user:password@localhost:5432/shipitnow
PORT=3000
```
```bash
npm run dev
```
Check it's up:
```bash
curl http://localhost:3000/shipments/health
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```
By default the frontend points at `http://localhost:3000/shipments` — change that in `api.js` if your backend runs somewhere else.

---

## Assumptions we made

- The main flow is linear (Booked → In Transit → Delivered); Customs Hold and Cancelled are exceptions that branch off it rather than ordinary stops on the line. A shipment can resume from Customs Hold, but Cancelled is treated as final.
- `current_status` on the shipment row is a convenience for fast list rendering — the event log is the actual source of truth for a shipment's history.
- Reference numbers are optional to provide, but never optional to have: every shipment gets one, generated automatically if you don't supply it.
- Priority is a simple two-value field (Standard / Express), not a numeric scale.
- Search is plain substring matching (`ILIKE`) across reference number, origin, destination, and notes — good enough at this scale, without the overhead of a real search engine.

---

## If this needed to support 10,000 shipments and multiple concurrent users

- Search & Pagination: A full ILIKE scan without limits will crawl as the database grows. I'd add a trigram index for text search, an index on status, and paginate responses instead of fetching everything on every keystroke.

- Concurrency Control: Right now, two people updating the same shipment at once will overwrite each other. Adding optimistic concurrency control with a version column cleanly catches those race conditions.

- Real-time Updates: Polling burns server resources fast with multiple active users. Moving to WebSockets or Server-Sent Events (SSE) lets us push live updates directly to everyone watching the board.

- Scale & Security: To handle heavy read traffic, I'd set up connection pooling and a read replica, then add basic auth with row-level security if we ever need multi-tenant data isolation.