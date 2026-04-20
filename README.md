# Onboarding Diary Application

A web application for new recruits to document their onboarding journey. Users log daily tasks, record issues, provide feedback, and capture notes. Managers can view entries and generate downloadable reports. Admins manage users and view all data.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Validation**: Zod (shared FE + BE)

## Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React context providers (Auth, Theme)
│       ├── hooks/        # Custom hooks
│       ├── lib/          # Utilities (API client, cn helper)
│       ├── pages/        # Page components
│       └── types/        # TypeScript types
├── server/          # Express backend
│   ├── prisma/      # Prisma schema & migrations
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Auth, error handling
│       ├── routes/       # Express routers
│       ├── utils/        # Prisma client, JWT, errors
│       └── validators/   # Zod validation schemas
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

## Features (Phase 1 - Foundation)

- User registration and login (JWT auth)
- Role-based access control (Recruit, Manager, Admin)
- Dark mode / light mode toggle with system preference detection
- Responsive sidebar layout
- Settings page with profile editing and theme preference
- Dashboard shell with summary cards
