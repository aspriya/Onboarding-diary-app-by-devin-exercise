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

- Node.js 18+
- PostgreSQL 14+

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aspriya/Onboarding-diary-app-by-devin-exercise.git
   cd Onboarding-diary-app-by-devin-exercise
   ```

2. **Set up the server**
   ```bash
   cd server
   cp .env.example .env   # Edit .env with your database credentials
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. **Set up the client**
   ```bash
   cd client
   npm install
   ```

4. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

5. Open http://localhost:5173 in your browser

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
