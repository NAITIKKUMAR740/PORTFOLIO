# Full-Stack Personal Portfolio Website

A production-ready full-stack personal portfolio built with **HTML, CSS, JavaScript**, **Node.js + Express.js**, and **MongoDB** using a clean **MVC + Service + Validator** layered architecture.

## Key Features

- **Mobile-First Responsive UI**: Built with semantic HTML5, modern CSS Grid/Flexbox, dark/light theme toggle (`localStorage` + `prefers-color-scheme`), accessible project detail modal, and live search/category filters.
- **Backend-Driven Dynamic Content**: Profile, skills, and projects are stored in MongoDB and served via RESTful JSON APIs.
- **Admin Control Center (`/admin`)**: JWT-authenticated portal to edit your profile, create/update/delete projects & skills, and manage contact inbox messages.
- **Contact Form + Email Integration**: Backend validation (`express-validator`), honeypot spam protection, rate limiting, MongoDB persistence, and server-side email delivery via **Nodemailer** (configured SMTP or automatic **Ethereal** preview fallback in development).
- **Security & Production Hardening**: `helmet` CSP/security headers, `cors` origin allowlist, `compression`, `express-rate-limit`, centralized error handler, graceful shutdown, `Dockerfile`, and `docker-compose.yml`.

## Project Architecture

```text
src/
├── app.js                  # Express middleware, static files, security, error handling
├── server.js               # HTTP server bootstrap + graceful DB shutdown
├── config/                 # Environment validation, MongoDB connection, Nodemailer setup
├── models/                 # Mongoose schemas (Profile, Project, Skill, ContactMessage)
├── services/               # Business logic, database queries, auth & email dispatch
├── controllers/            # HTTP request/response orchestration
├── validators/             # express-validator schemas
├── middlewares/            # Auth (JWT / API Key), rate limiting, validation, errors
├── routes/                 # Modular REST API routers
├── seed/                   # Idempotent database seeder (`npm run seed`)
└── public/                 # Mobile-first frontend (`index.html`, `admin.html`, CSS, JS)
```

## REST API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server & MongoDB health status |
| `GET` | `/api/portfolio` | Public | Aggregated profile, projects, and skills |
| `GET` | `/api/profile` | Public | Fetch portfolio owner profile |
| `PUT` | `/api/profile` | Admin | Create or update profile |
| `GET` | `/api/projects` | Public | List projects (`?category=`, `?featured=`, `?search=`) |
| `GET` | `/api/projects/:idOrSlug` | Public | Get single project by ID or slug |
| `POST` | `/api/projects` | Admin | Create a project |
| `PUT` | `/api/projects/:id` | Admin | Update a project |
| `DELETE` | `/api/projects/:id` | Admin | Delete a project |
| `GET` | `/api/skills` | Public | List skills (`?category=`, `?grouped=true`) |
| `POST` | `/api/skills` | Admin | Create a skill |
| `PUT` | `/api/skills/:id` | Admin | Update a skill |
| `DELETE` | `/api/skills/:id` | Admin | Delete a skill |
| `POST` | `/api/contact` | Public | Validate, persist, and email a contact message |
| `GET` | `/api/contact` | Admin | List contact inbox messages (`?status=`) |
| `PATCH` | `/api/contact/:id/status` | Admin | Update message status (`new`, `read`, `replied`, `archived`) |
| `DELETE` | `/api/contact/:id` | Admin | Delete a contact message |
| `POST` | `/api/auth/login` | Public | Authenticate admin and issue JWT |
| `GET` | `/api/auth/verify` | Admin | Verify active JWT or API key |

## Quick Start (Local MongoDB)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` (a local development `.env` is already included, update credentials before production):
   ```bash
   cp .env.example .env
   ```
   Ensure local MongoDB is running at `mongodb://127.0.0.1:27017/portfolio_db`.

3. **Seed sample portfolio data**:
   ```bash
   npm run seed
   ```
   (Use `npm run seed:reset` to wipe and re-seed profile, skills, and projects.)

4. **Start the server**:
   ```bash
   npm run dev
   ```
   - Public Portfolio: `http://localhost:5000`
   - Admin Portal: `http://localhost:5000/admin` (default dev credentials in `.env`: `admin@example.com` / `Admin@12345`)

## Running Automated Tests

The integration test suite uses Node's built-in test runner, `supertest`, and `mongodb-memory-server` (no external MongoDB daemon required for tests):

```bash
npm test
```

## Production Deployment

### Option A: Docker Compose
```bash
docker compose up -d --build
```
Then seed inside the running container:
```bash
docker compose exec app npm run seed
```

### Option B: Cloud PaaS (Render / Railway / VPS)
1. Set `NODE_ENV=production` and configure `MONGO_URI`, `JWT_SECRET` (min 16 chars), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN`, and `SMTP_*` environment variables.
2. Run `npm install --omit=dev`.
3. Run `npm run seed` once to initialize data, then start with `npm start`.
