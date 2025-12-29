# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development (runs both Vite frontend + Express backend concurrently)
npm run dev

# Individual services
npm run server       # Express backend only (port 5000/5001)

# Production
npm run build        # Vite production build
npm run preview      # Preview production build

# Linting
npm run lint         # ESLint with strict warnings

# Database
cd server && npm run seed   # Create tables & seed initial prompts
```

## Tech Stack

- **Frontend**: React 18 + Vite, vanilla CSS, React Router DOM, Lucide icons, Sonner toasts
- **Backend**: Express 5, PostgreSQL (pg driver)
- **Auth**: Clerk (frontend: @clerk/clerk-react, backend: @clerk/clerk-sdk-node with JWT verification)
- **Deployment**: Vercel (serverless functions)

## Architecture

### Frontend (`src/`)
- **Pages**: Dashboard (main prompt grid), Collections, LandingPage, auth pages
- **Components**: Header, Sidebar, PromptCard, PromptDetailModal, AddPromptModal, MainLayout
- **Hooks**: `usePrompts.js` (CRUD + favorites), `useCollections.js` (user collections)
- **Context**: ClerkProviderWithRoutes (auth wrapper)

### Backend (`server/`)
- **Routes**: `/api/prompts` (CRUD, favorites), `/api/auth`
- **Middleware**: `auth.js` verifies Clerk JWT tokens
- **Database**: PostgreSQL with `prompts` and `favorites` tables

### Route Structure
```
/                    - Public landing page
/sign-in, /sign-up   - Clerk auth pages
/app                 - Protected dashboard (all prompts)
/app/category/:cat   - Filter by category
/app/favorites       - User favorites
/app/collections     - Collections list
/app/collections/:id - Collection detail
```

## Key Patterns

- **Authentication**: Clerk handles auth; API requires Bearer tokens from Clerk JWT
- **Auto-Seeding**: New users automatically receive public template prompts on first API call
- **State Management**: React hooks only (no Redux/Zustand)
- **Styling**: All vanilla CSS with CSS variables in `src/index.css` (dark theme with yellow accent)
- **API Proxy**: Vite proxies `/api` to Express server during development

## Database Schema

```sql
prompts: id, user_id (Clerk ID), title, content, category, source, tags[], is_public, attachment (JSONB)
favorites: user_id, prompt_id (composite key)
```

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk frontend key (root .env)
- `CLERK_SECRET_KEY` - Clerk backend key (server/.env)
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Local PostgreSQL (or `POSTGRES_URL` for Vercel)

## Ports

- Vite dev server: 5173
- Express server: 5000 or 5001
