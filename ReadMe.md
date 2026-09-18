# ShipItNow — Real-Time Shipment Status Tracker

A full-stack, modular logistics tracking dashboard designed to monitor shipment lifecycle events, manage state transitions, and maintain an immutable audit trail. Built with a decoupled Fastify + PostgreSQL backend and a Vite + React + Tailwind CSS frontend.

---

## Tech Stack

| Layer | Technology | Key Choice Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | Node.js / Fastify / TypeScript | Low overhead, high-throughput asynchronous HTTP routing, built-in JSON schema validation. |
| **Database** | PostgreSQL | Native ENUM support, ACID compliance for audit trails, sequences for formatted tracking numbers. |
| **Frontend** | React / Vite / TypeScript | Fast Hot Module Replacement (HMR), lightweight static bundle deployment, clean SPA separation. |
| **Styling** | Tailwind CSS v4 | Utility-first CSS, fast layout composition, zero-runtime overhead. |
| **Infrastructure** | Docker, Railway / Render, Vercel | Containerized local parity, containerized backend hosting, static CDN edge hosting. |

---

## Backend Architecture & Database Design

### 1. Database Schema & ACID Audit Logs
The database consists of two core tables linked by foreign key constraints:
* **`shipments`**: Stores shipment metadata, current status (`shipment_status` ENUM), priority (`shipment_priority` ENUM), origins/destinations (`TEXT`), and expected delivery dates.
* **`shipment_events`**: Acts as an immutable append-only event log capturing every state change (`Booked`, `In Transit`, `Customs Hold`, `Delivered`, `Cancelled`) alongside optional notes and timestamps.

Whenever a shipment's status is updated, the operation executes inside an **ACID transaction** (`BEGIN`, `UPDATE shipments`, `INSERT INTO shipment_events`, `COMMIT`). If either step fails, the transaction issues an immediate `ROLLBACK`, guaranteeing zero data inconsistency between the shipment's current state and its audit log.

### 2. Auto-Generated Tracking Numbers (`SHIP-00001`)
* **Current Implementation:** Sequence auto-generation via PostgreSQL `shipment_ref_seq`. When a payload omits `reference_number`, the server pulls `nextval('shipment_ref_seq')` and formats it with zero-padding as `SHIP-00001`.
* **Scalability Path:** For production environments handling 100,000+ concurrent writes, sequential database sequences can introduce lock contention. To scale horizontally, this sequence fallback can be replaced with non-sequential distributed ID generators (such as 8-character cryptographic random hashes or prefixed ULIDs like `SHIP-8X92K4`). This eliminates sequence contention and prevents order enumeration attacks.

### 3. SOLID Principles & Fastify Plugin Architecture
* **Single Responsibility Principle (SRP):** Route declarations (`src/routes/shipments.ts`), validation schemas (`src/schemas.ts`), and database connection pooling (`src/db.ts`) are decoupled into isolated modules.
* **Security & Injection Defense:** SQL queries utilize strict parameterization (`$1`, `$2`), passing SQL structure and data payloads separately to the PostgreSQL extended query protocol. This renders SQL injection attempts inert regardless of input contents. Fastify JSON schemas validate incoming data types before request execution.

---

## 🎨 Frontend Architecture & UX Design

### 1. Why Vite + React (SPA) over Next.js?
For a dedicated REST API architecture powered by Fastify, a single-page application (SPA) built with Vite provides a cleaner separation of concerns than Next.js. It avoids redundant server routing layers, keeps client-side state predictable, and compiles to lightweight static assets easily deployable to edge CDNs.

### 2. Status Track Visualization & Exception Branching
Logistics pipelines are rarely purely linear. Standard happy paths follow a progression (`Booked` -> `In Transit` -> `Delivered`), but exceptions like **`Customs Hold`** disrupt this flow.

* **UI Centering & Overlap Defense:** Rather than forcing exception states into the linear horizontal track (which creates visual overlap and misaligns milestone nodes), exception states branch dynamically downward from the track.
* **Visual Clarity:** The standard track retains its uniform spacing, while the exception node (`Customs Hold`) connects via a distinct dotted connector line. This makes operational bottlenecks instantly recognizable to dispatchers without distorting the overall timeline UI.

### 3. Slide-Over Detail Panel & Update Drawer
Selecting any shipment opens a slide-over modal drawer displaying the complete vertical history log and status update controls. Fetching detailed event history on-demand keeps the main shipment list API payload small and fast while delivering rich audit details when needed.

---

## Deployment Strategy

| Component | Target Platform | Rationale |
| :--- | :--- | :--- |
| **PostgreSQL Database** | Railway  | Automated database connection management, connection pooling support, persistent disk volumes. |
| **Fastify API Server** | Railway | Containerized Node.js runtime, automatic SSL provisioning, integrated environment variable management. |
| **React Frontend** | Vercel | Global CDN distribution, instant static previews, automatic edge routing. |

---
## 💻 Local Development Setup

### Prerequisites
* Docker & Docker Compose
* Node.js (v18+)

### 1. Database Setup (Docker)
```bash
# Start PostgreSQL container on port 5433
docker compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "PORT=3000
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgrespassword
DB_NAME=shipitnow" > .env

# Run development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3000" > .env

# Run Vite dev server
npm run dev
```

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/shipments` | Create a new shipment (auto-generates `reference_number` if omitted). |
| `GET` | `/shipments` | Fetch all shipments. Supports query params `?status=...&search=...`. |
| `GET` | `/shipments/:id` | Fetch single shipment details alongside complete event history log. |
| `PATCH` | `/shipments/:id/status` | Update shipment status and append an entry to the audit log. |
| `GET` | `/health` | Health check endpoint for deployment monitoring. |