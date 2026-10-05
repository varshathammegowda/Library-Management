# Library & Digital Resource Management System

A production-style college library portal built with React + Vite + Tailwind CSS + Supabase.

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Lucide React

## Features

### Students
- Secure registration/login
- Automatic `student` role
- Search/filter books
- Book details and availability
- Borrow requests
- My Books and borrowing history
- Atomic returns
- Digital resources
- Editable safe profile fields

### Admin/Librarian
- Protected admin routes
- Live dashboard statistics
- Book CRUD
- Borrow request approval/rejection
- Issued/returned views
- Student search
- Digital resource upload/delete
- Supabase RLS enforcement

## Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Enable Supabase Email authentication (or your preferred provider).
6. Copy `.env.example` to `.env.local`.
7. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
8. Install and run:

```bash
npm install
npm run dev
```

## First admin setup

1. Register the intended admin account through `/register`.
2. In Supabase SQL Editor, promote only that account:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@college.edu';
```

3. Ensure `VITE_ADMIN_EMAIL` is exactly the same address.
4. Sign out and sign in again.

The frontend requires both the configured admin email and `profiles.role = 'admin'`. Database writes are additionally protected by RLS and admin-only RPCs.

**Never** put a Supabase service-role key in the frontend.

## Storage

`schema.sql` creates the `digital-resources` public-read bucket and admin-only write policies. For private resources, switch the bucket to private and replace `getPublicUrl` with signed URLs.

## Demo data

`supabase/seed.sql` contains sample titles such as Clean Code, Python Crash Course, Database System Concepts, Computer Networks, and Digital Signal Processing. These are demo records.

## Security model

- Registration never accepts a role from the browser.
- New users are inserted as `student` by a database trigger.
- Students can only read their own borrowing records.
- Student borrow/return actions use server-side Postgres functions.
- Approval atomically checks/decrements inventory.
- Return atomically increments inventory with an upper bound of `total_copies`.
- Admin tables and writes are protected by `public.is_admin()`.
- The UI also protects `/admin`; unauthorized users are redirected.



## 🔗 Live Demo

- 🌐 library-management-liart-three.vercel.app


## Acceptance checklist

- [ ] Student registration creates a student profile
- [ ] Student can log in
- [ ] Student can search/filter books
- [ ] Student can request an available book
- [ ] Duplicate active request is blocked
- [ ] Admin can approve/reject
- [ ] Approval decrements available copies
- [ ] Student can return an approved book
- [ ] Return increments available copies safely
- [ ] Digital resource upload works
- [ ] `/admin` redirects unauthenticated users to `/login`
- [ ] Normal students cannot access admin routes
- [ ] Normal students cannot execute admin database operations
