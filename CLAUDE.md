# MHC9 Popular Vote System - Claude Guidelines

This document provides context and rules for AI assistants (like Claude) working on this project.

## 1. Project Context
- **Name**: ระบบ Popular Vote ศูนย์สุขภาพจิตที่ 9 (MHC9)
- **Goal**: A modern, mobile-first web application for voting on innovation projects.
- **Key Features**: OTP Verification (mocked via SMS console log), Single-vote constraint, Real-time-ish Leaderboard.

## 2. Tech Stack
- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4** (No `tailwind.config.ts`, everything is in `app/globals.css` via `@theme inline`)
- **Prisma v7** + `@prisma/adapter-libsql`
- **Database**: SQLite (`dev.db`) for development.

## 3. Prisma v7 Rules
- **CRITICAL**: Do not use `new PrismaClient()` without arguments when using driver adapters.
- ALWAYS pass `{ adapter }` into the client: `new PrismaClient({ adapter })`.
- Environment variables must be loaded via `env("DATABASE_URL")` inside `prisma.config.ts`, not `process.env`.
- No need to instantiate `@libsql/client` manually, just pass `{ url: process.env.DATABASE_URL }` to `PrismaLibSql`.

## 4. Styling & UI Rules
- **Mobile-First Design**: Always optimize UI for small screens first (use `p-4`, `text-sm`, etc.) and scale up using `sm:` and `md:` prefixes.
- **Theme**: Futuristic, Cyberpunk, Dark Mode Default, Glassmorphism, HUD Elements.
- **Primary Color**: Neon Cyan (`#00f6ff`).
- **Secondary Color**: Neon Purple (`#b026ff`).
- **Font**: Google Prompt (configured in `app/layout.tsx`).
- Keep components responsive and avoid hardcoded large widths/heights. Use flexbox/grid effectively.

## 5. Development Workflow
- **Run dev**: `npm run dev`
- **Update DB Schema**: `npx prisma db push`
- **Seed DB**: `npx tsx prisma/seed.ts` (Requires `tsx` globally or via `npx`).
