<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MHC9 Popular Vote System - Agent Guidelines

## 1. Tech Stack
- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4** (No `tailwind.config.ts`, everything is in `app/globals.css` via `@theme inline`)
- **Prisma v7** + `@prisma/adapter-libsql`
- **Database**: SQLite (`dev.db`) for development.

## 2. Prisma v7 Rules
- DO NOT use `new PrismaClient()` without arguments when using driver adapters.
- ALWAYS pass `{ adapter }` into the client: `new PrismaClient({ adapter })`.
- Environment variables must be loaded via `env("DATABASE_URL")` inside `prisma.config.ts`, not `process.env`.
- No need to instantiate `@libsql/client` manually, just pass `{ url: process.env.DATABASE_URL }` to `PrismaLibSql`.

## 3. Styling Rules
- **Mobile-First Design**: Always optimize UI for small screens first (use `p-4`, `text-sm`, etc.) and scale up using `sm:` and `md:` prefixes.
- **Theme**: Futuristic, Cyberpunk, Dark Mode Default, Glassmorphism, HUD Elements.
- **Primary Color**: Neon Cyan (`#00f6ff`).
- **Secondary Color**: Neon Purple (`#b026ff`).
- **Font**: Google Prompt (configured in `app/layout.tsx`).

## 4. Development Workflow
- **Run dev**: `npm run dev`
- **Update DB Schema**: `npx prisma db push`
- **Seed DB**: `npx tsx prisma/seed.ts` (Requires `tsx` globally or via `npx`).
