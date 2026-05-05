# Tennis Academy Web App

Staff portal + student portal for Tennis Academy Management.

Built with: **Next.js 14 (App Router) + TypeScript + MUI v5 + dayjs**

---

## Prerequisites

- Node.js ≥ 20
- Backend running at `http://localhost:8080` (see `backend/`)

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env.local
# Edit .env.local if needed (default points to http://localhost:8080)

# 3. Start dev server
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |

For production, set `NEXT_PUBLIC_API_BASE_URL=https://api.<yourdomain>` in your Docker/VPS environment.

---

## Routes

### Public
| Route | Description |
|---|---|
| `/login` | Login page (all roles) |

### Staff (ADMIN / COACH / TRAINER)
| Route | Description |
|---|---|
| `/today` | Today's sessions by court — quick "Complete" CTA |
| `/schedule` | Week view grid (Court 1–4 columns), create/edit/delete sessions |
| `/students` | Student list with search & status filter |
| `/students/[id]` | Student profile — edit info, create login account (admin) |
| `/sessions/[id]/complete` | Session completion — attendance, RPE, notes per student |

### Admin only
| Route | Description |
|---|---|
| `/billing` | Monthly membership table; mark paid/due/waived; overdue list |

### Student (STUDENT)
| Route | Description |
|---|---|
| `/student` | Home — upcoming sessions |
| `/student/schedule` | Week schedule (own sessions only) |
| `/student/history` | Session history with load + student notes (never internal notes) |

---

## Demo Script

### Coach completes a session (~60 seconds)
1. Log in as coach (`COACH` role)
2. Go to **Azi** → find today's session → click **Completează**
3. For each student: set attendance, RPE (1–10), duration (pre-filled)
4. Add student note (optional)
5. Click **Salvează completarea** → toast confirms success

### Admin marks membership paid
1. Log in as admin
2. Go to **Facturare** → select year + month
3. Click the ✅ icon next to a student with DUE status
4. Toast confirms update

### Student checks schedule and history
1. Log in as student
2. Go to **Programul meu** → see upcoming sessions for the week
3. Go to **Istoric** → see past sessions with training load and notes

---

## Project Structure

```
src/
├── app/                   # Next.js App Router pages
│   ├── (admin)/billing/   # Admin: billing
│   ├── (staff)/           # Staff: today, schedule, students, sessions
│   ├── (student)/student/ # Student portal
│   └── login/             # Public login
├── components/            # Shared UI (AppLayout, AuthGuard, Providers, Snackbar)
├── features/schedule/     # SessionModal component
├── lib/
│   ├── api/               # Typed API client + DTOs (client.ts, types.ts, ...)
│   ├── auth/              # Token storage, role helpers
│   └── i18n/              # Context + locales (ro.ts, en.ts)
```

---

## i18n

- **Default language**: Romanian (RO)
- Language switcher in the top-right user menu (avatar)
- All UI strings are i18n keys — see `src/lib/i18n/locales/`

---

## Building for Production

```bash
npm run build
npm start
```

---

## Linting / Formatting

```bash
npm run lint
npm run format
```
