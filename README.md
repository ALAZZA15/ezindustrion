
# EzIndustrion

**Boarding house (kos) management — rooms, tenants, dashboard, all in one calm place.**

EzIndustrion is a web-based management system for Indonesian boarding houses (kos). It gives owners a single dashboard to manage rooms, tenant accounts, occupancy, and expected income — while tenants get their own portal to view their room, rent, and move-in date.

Built as the first product of **Azza Corporation**, a holding company for independent digital products.

---

## Features

- **Authentication** — JWT session cookie (httpOnly), owner/tenant role separation
- **Rooms** — create, edit, delete, upload photos, amenities, due day
- **Tenants** — create accounts, assign to rooms, WhatsApp-ready phone normalization
- **Dashboard** — occupancy rate, expected income, room status at a glance
- **Tenant portal** — each tenant sees their own room, rent, and move-in date
- **Clean UI** — Tailwind + shadcn, responsive, mobile-friendly

---

## Tech Stack

**Backend**
- Python 3.11+
- FastAPI
- Motor (async MongoDB driver)
- Pydantic
- JWT authentication via httpOnly cookie

**Frontend**
- React 18 + TypeScript
- Vite
- TanStack Query
- React Router
- Tailwind CSS + shadcn/ui
- Sonner (toasts), Lucide (icons)

**Infrastructure**
- MongoDB 7.0 (via Docker)
- Uvicorn (ASGI server)

---

## Project Structure

```
ezindustrion/
├── backend/
│   ├── lib/              # auth, db, scope, dates
│   ├── models/           # Pydantic models
│   ├── routers/          # auth, rooms, tenants, dashboard
│   ├── server.py         # FastAPI app
│   └── seed.py           # idempotent seed data
├── frontend/
│   └── src/
│       ├── components/   # Brand, StatusBadge, dialogs, layout
│       ├── hooks/        # useMe
│       ├── i18n/         # UI copy (English)
│       ├── lib/          # api, types, format, session
│       └── pages/        # Home, Login, owner/*, tenant/*
├── memory/               # spec & credentials
└── README.md
```

---

## Getting Started

### Prerequisites (all OS)

- **Git** — https://git-scm.com
- **Python 3.11+** — https://python.org
- **Node.js 20+** — https://nodejs.org
- **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux)
- **VS Code** (recommended) — https://code.visualstudio.com

### 1. Clone the repository

```bash
git clone https://github.com/ALAZZA15/ezindustrion.git
cd ezindustrion
```

---

## Installation

### Windows

Open **PowerShell** or **Windows Terminal**.

**Backend setup:**

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

> If PowerShell blocks the activation script, run once:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
> then try again.

**Create `backend\.env`** with Notepad or VS Code:

```env
APP_TZ=Asia/Jakarta
JWT_SECRET=replace-with-64-char-hex
MONGO_URL=mongodb://localhost:27017
DB_NAME=ezindustrion
COOKIE_SECURE=false
CORS_ORIGINS=http://localhost:5173
```

**Start MongoDB** (Docker Desktop must be running):

```powershell
docker run -d --name mongodb-dev -p 27017:27017 -v ${HOME}/mongodb-data:/data/db mongo:7.0
```

**Seed and run backend:**

```powershell
python seed.py
uvicorn server:app --reload --port 8001
```

**Frontend (new terminal):**

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

### Linux

Open your terminal.

**Backend setup:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> If `python3 -m venv` fails on Ubuntu/Debian:
> `sudo apt install python3-venv`

**Create `backend/.env`:**

```bash
nano .env
```

Paste:

```env
APP_TZ=Asia/Jakarta
JWT_SECRET=replace-with-64-char-hex
MONGO_URL=mongodb://localhost:27017
DB_NAME=ezindustrion
COOKIE_SECURE=false
CORS_ORIGINS=http://localhost:5173
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`.

**Start MongoDB** (Docker Engine):

```bash
docker run -d --name mongodb-dev -p 27017:27017 -v ~/mongodb-data:/data/db mongo:7.0
```

> **Important:** MongoDB 8.0+ refuses to start on Linux kernel 7.0.x due to a known incompatibility. Use `mongo:7.0` as shown above.

**Seed and run backend:**

```bash
python seed.py
uvicorn server:app --reload --port 8001
```

**Frontend (new terminal):**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

### macOS

Open **Terminal** (or iTerm2).

**Install prerequisites (Homebrew recommended):**

```bash
brew install python@3.11 node
```

Install **Docker Desktop for Mac** from https://docker.com/products/docker-desktop and start it.

**Backend setup:**

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Create `backend/.env`:**

```bash
nano .env
```

Paste the same block as Linux above. Save with `Ctrl+O` → `Enter` → `Ctrl+X`.

**Start MongoDB:**

```bash
docker run -d --name mongodb-dev -p 27017:27017 -v ~/mongodb-data:/data/db mongo:7.0
```

**Seed and run backend:**

```bash
python seed.py
uvicorn server:app --reload --port 8001
```

**Frontend (new terminal):**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Generate a `JWT_SECRET`

Run once, copy the output, paste into `.env`:

**Linux / macOS:**

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Windows (PowerShell):**

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Owner | owner@ezindustrion.com | owner123 |
| Tenant | dimas@ezindustrion.com | tenant123 |

Other tenants: `sinta@`, `ayu@`, `bima@ezindustrion.com` — same password.

See [`memory/test_credentials.md`](memory/test_credentials.md) for the full list.

---

## Moving to Another Machine

Because `.env`, `node_modules/`, and `.venv/` are intentionally excluded from Git, a fresh clone needs a bit of setup.

1. **Clone** the repo on the new machine.
2. **Recreate `backend/.env`** (see the OS-specific sections above).
3. **Reinstall dependencies** — `pip install -r requirements.txt` and `npm install`.
4. **Start MongoDB** with Docker.
5. **Re-seed** — `python seed.py`.
6. **Run** backend and frontend as described above.

### Transfer without Git (USB / external drive)

**On the source machine:**

```bash
tar --exclude='node_modules' \
    --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='uploads/*' \
    -czf ezindustrion.tar.gz ezindustrion/
```

**On the target machine:**

```bash
tar -xzf ezindustrion.tar.gz
cd ezindustrion
```

Then follow the OS-specific installation steps above. `.env` is not included — recreate it manually.

---

## Common Issues

| Symptom | Fix |
|---|---|
| `KeyError: 'MONGO_URL'` | `.env` missing or not in `backend/` |
| MongoDB container exits immediately | Use `mongo:7.0`, not `8.0` (kernel 7.0.x bug) |
| `CORS` error in browser | Check `CORS_ORIGINS` matches frontend URL |
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, retry |
| Login always fails | Re-run `python seed.py` (only works once) |
| Photos 404 | `backend/uploads/` must exist and be writable |

---

## Roadmap

- [x] **Stage 1** — Authentication, rooms, tenants, dashboard
- [ ] **Stage 2** — Billing with QRIS (mock) + WhatsApp reminders (mock)
- [ ] **Stage 3** — Complaint kanban
- [ ] **Stage 4** — Public listings + viewing bookings
- [ ] **Stage 5** — Financial dashboard
- [ ] **Stage 6** — Digital contracts
- [ ] **Stage 7** — Mobile app (Expo)

---

## License

Private — © 2026 Azza Corporation. All rights reserved.
