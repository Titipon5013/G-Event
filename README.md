# G-EVENTS

**The Ultimate Underground Squad Management App.** A full-stack, brutalist-style web application designed for dropping events, gathering your crew, and collecting money without the hassle of user registration.

Built with the modern Full-Stack TypeScript dream: **Vue 3 + Bun + Hono + Supabase**.

## Overview

G-EVENTS simplifies how friend groups organize meetups and split bills.

- **No Auth Required:** Anyone can drop an event and share the link.
- **Leader PIN:** The creator sets a secret 6-digit PIN to manage the event (Leader Dashboard).
- **Crew Roster:** Friends join using an "AKA" and can upload their payment slips directly.
- **Auto-Destruct:** Once the leader marks everyone as "PAID", the event automatically deletes itself from the database. Leave no trace.

## Tech Stack

- **Frontend:** Vue.js (Vite), TypeScript, Tailwind CSS (Neo-Brutalism UI)
- **Backend:** Bun, Hono API
- **Database/Storage:** Supabase (PostgreSQL & Storage Buckets)

---

## Database Setup (Bring Your Own DB)

This project requires a backend database to store events and participants, plus a storage solution for images.
You will need to set up your own **Supabase** project (or any equivalent PostgreSQL + Storage service).

**Requirements:**

1. A table for `events` (storing name, time, location, max_people, manage_pin, etc.)
2. A table for `participants` (storing nickname, payment_status, slip_image_url, etc.) with a foreign key linking to the event.
3. Two **Public Storage Buckets**: `qr_codes` and `slips`.

---

## Local Development Setup

Clone the repository and follow the steps below to run both the frontend and backend locally.

### 1. Backend Setup (Bun + Hono)

Navigate to the backend directory:

```bash
cd backend-bun
```

Install dependencies:

```bash
bun install
```

Create a `.env` file in the `backend-bun` root and add your database credentials:

```env
PORT=3000
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

Start the backend server:

```bash
bun run index.ts
```

### 2. Frontend Setup (Vue + Vite)

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `frontend` root and configure your API and Database endpoints:

```env
VITE_API_URL="http://localhost:3000/api"
VITE_SUPABASE_URL="your-supabase-project-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

Start the frontend development server:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to start dropping events!

---

Created for the crew. Manage your squad right.