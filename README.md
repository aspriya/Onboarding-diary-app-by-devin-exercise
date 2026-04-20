# Onboarding Diary Application

A web application for new recruits to document their onboarding journey. Users log daily tasks, record issues, provide feedback, and capture notes. Managers can view entries and generate downloadable reports. Admins manage users and view all data.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐ │
│  │  React 18 │ │ Tailwind │ │ Recharts │ │ React Router DOM  │ │
│  │    + TS   │ │   CSS    │ │ (Charts) │ │   (Navigation)    │ │
│  └─────┬─────┘ └──────────┘ └──────────┘ └───────────────────┘ │
│        │                                                        │
│  ┌─────┴──────────────────────────────────────────────────────┐ │
│  │                    Application Layer                       │ │
│  │  AuthContext ─ ThemeContext ─ API Client (fetch + JWT)      │ │
│  └─────┬──────────────────────────────────────────────────────┘ │
│        │  HTTP/JSON (JWT Bearer Token)                          │
└────────┼────────────────────────────────────────────────────────┘
         │  Port 5173 (Vite Dev) ──proxy──▶ Port 3001 (API)
         ▼
┌────────────────────────────────────────────────────────────────┐
│                   Server (Node.js + Express)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Middleware Layer                         │ │
│  │  CORS ─ JSON Parser ─ Auth (JWT) ─ Role Guard ─ Errors     │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │                     Route Layer                             │ │
│  │  /auth  /tasks  /issues  /feedback  /notes  /dashboard      │ │
│  │  /analytics  /reports  /search  /checklists  /admin         │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │                   Controller Layer                          │ │
│  │  Zod Validation ──▶ Business Logic ──▶ Prisma Queries       │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │  Prisma ORM
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                        │
│  ┌──────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────────┐ │
│  │ User │ │TaskEntry │ │IssueEntry │ │  ChecklistTemplate   │ │
│  │      │ │          │ │           │ │  ChecklistItem       │ │
│  │      │ │FeedbackE │ │ NoteEntry │ │  AssignedChecklist   │ │
│  └──────┘ └──────────┘ └───────────┘ └──────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action ──▶ React Page ──▶ API Client (fetch)
                                    │
                          JWT Token in Header
                                    │
                                    ▼
                            Express Router
                                    │
                        ┌───────────┼───────────┐
                        ▼           ▼           ▼
                   Authenticate  Authorize   Validate
                   (JWT verify)  (role check) (Zod schema)
                                    │
                                    ▼
                              Controller
                           (business logic)
                                    │
                                    ▼
                            Prisma Client
                           (query builder)
                                    │
                                    ▼
                             PostgreSQL
                                    │
                                    ▼
                          JSON Response ──▶ React State ──▶ UI Update
```

### Role-Based Access

| Feature | Recruit | Manager | Admin |
|---------|---------|---------|-------|
| Tasks / Issues / Feedback / Notes CRUD | Own data only | All recruits | All users |
| Dashboard & Analytics | Own stats | All recruit stats | All stats |
| Search | Own entries | All entries | All entries |
| Checklists | View & complete assigned | Assign to recruits | Create templates + assign |
| Reports (CSV/JSON) | Own data | All data | All data |
| Recruit Overview | — | View all recruits | View all recruits |
| User Management | — | — | Full CRUD |

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component-based UI with type safety |
| **Styling** | Tailwind CSS | Utility-first CSS with dark mode support |
| **Bundler** | Vite | Fast HMR dev server and optimized builds |
| **Charts** | Recharts | Data visualization (pie, bar charts) |
| **Routing** | React Router DOM v6 | Client-side routing with protected routes |
| **Icons** | Lucide React | Consistent icon set |
| **Backend** | Node.js + Express.js + TypeScript | REST API server |
| **ORM** | Prisma | Type-safe database access and migrations |
| **Database** | PostgreSQL | Relational data storage |
| **Auth** | JWT (jsonwebtoken + bcrypt) | Stateless authentication with password hashing |
| **Validation** | Zod | Schema validation on both client and server |

## Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI (Layout, ThemeToggle, ProtectedRoute)
│       ├── contexts/     # React context providers (Auth, Theme)
│       ├── lib/          # Utilities (API client, cn helper)
│       ├── pages/        # Page components (14 pages)
│       └── types/        # TypeScript interfaces
├── server/          # Express backend
│   ├── prisma/      # Schema (9 models) & migrations
│   └── src/
│       ├── controllers/  # Route handlers (10 controllers)
│       ├── middleware/    # Auth (JWT + role guard), error handler
│       ├── routes/       # Express routers (10 route files)
│       ├── utils/        # Prisma client, JWT helpers, error classes
│       └── validators/   # Zod schemas (6 validator files)
```

## Getting Started

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org/)
- **npm** 9+ (comes with Node.js)
- **PostgreSQL** 14+ — [Download](https://www.postgresql.org/download/)

#### Installing PostgreSQL

**macOS** (Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows**: Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/) and follow the setup wizard.

#### Creating the Database

After installing PostgreSQL, create the application database:

```bash
# Option 1: Using createdb (if available)
createdb onboarding_diary

# Option 2: Using psql
psql -U postgres -c "CREATE DATABASE onboarding_diary;"
```

> **Note**: On Linux, you may need to run psql commands as the postgres user:
> ```bash
> sudo -u postgres createdb onboarding_diary
> ```

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aspriya/Onboarding-diary-app-by-devin-exercise.git
   cd Onboarding-diary-app-by-devin-exercise
   ```

2. **Configure environment variables**
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `server/.env` with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/onboarding_diary?schema=public"
   JWT_SECRET="change-this-to-a-random-secret-string"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   CORS_ORIGIN="http://localhost:5173"
   ```
   Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials (default is often `postgres`/`postgres`).

3. **Install server dependencies and run migrations**
   ```bash
   cd server
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   ```
   > If `prisma migrate` fails with a connection error, verify:
   > - PostgreSQL is running (`pg_isready` or `sudo systemctl status postgresql`)
   > - The `DATABASE_URL` in `.env` has the correct username, password, host, and port
   > - The `onboarding_diary` database exists (see "Creating the Database" above)

4. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Backend (from project root)
   cd server && npm run dev

   # Terminal 2 - Frontend (from project root)
   cd client && npm run dev
   ```

6. Open http://localhost:5173 in your browser

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on prisma migrate | PostgreSQL is not running. Start it with `brew services start postgresql` (macOS) or `sudo systemctl start postgresql` (Linux) |
| `password authentication failed` | Check the username/password in `DATABASE_URL` in `server/.env` |
| `database "onboarding_diary" does not exist` | Run `createdb onboarding_diary` or `psql -U postgres -c "CREATE DATABASE onboarding_diary;"` |
| `EACCES` permission errors on npm install | Don't use `sudo` with npm. Fix permissions: `sudo chown -R $(whoami) ~/.npm` |
| Port 3001 or 5173 already in use | Kill the process using the port: `lsof -ti:3001 \| xargs kill` |

## Features

### Phase 1 — Foundation
- User registration and login (JWT auth)
- Role-based access control (Recruit, Manager, Admin)
- Dark mode / light mode toggle with system preference detection
- Responsive sidebar layout
- Settings page with profile editing and theme preference

### Phase 2 — Core CRUD
- Tasks: create, edit, delete with status/category/priority tracking
- Issues: severity levels, resolution notes, status workflow
- Feedback: positive/suggestion/concern types
- Notes: freeform with tags support, grid layout
- Pagination, filtering, and soft deletes on all entries

### Phase 3 — Dashboard & Analytics
- Dashboard with summary cards, task progress bars, recent activity feed
- Analytics charts (Recharts): task status, task category, issue severity, feedback type, weekly progress
- CSV and JSON report exports
- Manager view with recruit progress overview

### Phase 4 — Search & Checklists
- Global search across tasks, issues, feedback, notes with type filter
- Checklist template management (admin)
- Checklist assignment to recruits (manager/admin)
- Recruit checklist UI with progress tracking and auto-completion

### Phase 5 — Admin & Polish
- Admin user management: list, create, edit, deactivate users
- Role assignment and user search/filter
- All placeholder pages replaced with full implementations
